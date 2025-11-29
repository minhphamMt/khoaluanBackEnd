import os
from functools import lru_cache
from pathlib import Path
from typing import Dict, List

import mysql.connector
import numpy as np
import torch
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

load_dotenv()

ARTIFACT_DIR = Path(__file__).resolve().parent / "artifacts"
MODEL_PATH = ARTIFACT_DIR / "ncf_model.pt"
USER_MAP_PATH = ARTIFACT_DIR / "user2idx.npy"
SONG_MAP_PATH = ARTIFACT_DIR / "song2idx.npy"


def get_db_config():
    db_url = os.getenv("DATABASE_URL")
    if db_url and db_url.startswith("mysql://"):
        try:
            without_scheme = db_url.replace("mysql://", "")
            credentials, host_part = without_scheme.split("@", 1)
            user, password = credentials.split(":", 1)
            host_port, database = host_part.split("/", 1)
            host, port = (host_port.split(":") + ["3306"])[:2]
            return {
                "host": host,
                "port": int(port),
                "user": user,
                "password": password,
                "database": database,
            }
        except ValueError:
            pass

    return {
        "host": os.getenv("DB_HOST", "localhost"),
        "port": int(os.getenv("DB_PORT", "3306")),
        "user": os.getenv("DB_USER", "root"),
        "password": os.getenv("DB_PASSWORD", ""),
        "database": os.getenv("DB_NAME", "my_music_app"),
    }


class NeuralCollaborativeFiltering(torch.nn.Module):
    def __init__(self, num_users, num_items, embed_dim=32, hidden_layers=None):
        super().__init__()
        hidden_layers = hidden_layers or [64, 32, 16]
        self.user_embedding = torch.nn.Embedding(num_users, embed_dim)
        self.item_embedding = torch.nn.Embedding(num_items, embed_dim)

        layers = []
        input_dim = embed_dim * 2
        for hidden_dim in hidden_layers:
            layers.append(torch.nn.Linear(input_dim, hidden_dim))
            layers.append(torch.nn.ReLU())
            input_dim = hidden_dim
        layers.append(torch.nn.Linear(input_dim, 1))
        self.mlp = torch.nn.Sequential(*layers)

    def forward(self, user_indices, item_indices):
        user_vec = self.user_embedding(user_indices)
        item_vec = self.item_embedding(item_indices)
        x = torch.cat([user_vec, item_vec], dim=1)
        logits = self.mlp(x).squeeze(-1)
        return torch.sigmoid(logits)


def load_mapping(path: Path) -> Dict:
    if not path.exists():
        return {}
    data = np.load(path, allow_pickle=True)
    try:
        maybe_dict = data.item()
    except ValueError:
        maybe_dict = None
    if isinstance(maybe_dict, dict):
        return maybe_dict
    if data.dtype == object and data.size == 1:
        return data[0].item()
    return dict(data)


def load_artifacts():
    user2idx = load_mapping(USER_MAP_PATH)
    song2idx = load_mapping(SONG_MAP_PATH)
    if not MODEL_PATH.exists() or not user2idx or not song2idx:
        raise FileNotFoundError("Model or mapping artifacts are missing")

    model = NeuralCollaborativeFiltering(len(user2idx), len(song2idx))
    state_dict = torch.load(MODEL_PATH, map_location="cpu")
    model.load_state_dict(state_dict)
    model.eval()

    idx2song = {idx: song_id for song_id, idx in song2idx.items()}
    return model, user2idx, song2idx, idx2song


class RecommendRequest(BaseModel):
    userId: int
    top_k: int = 20


def get_db_connection():
    config = get_db_config()
    return mysql.connector.connect(**config)


def fetch_user_interactions(user_id: int) -> List[str]:
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute(
        "SELECT songId FROM Interaction WHERE userId = %s",
        (user_id,),
    )
    rows = cursor.fetchall()
    cursor.close()
    connection.close()
    return [row[0] for row in rows]


app = FastAPI(title="NCF Recommender Service")


@lru_cache(maxsize=1)
def cached_artifacts():
    return load_artifacts()


@app.post("/recommend/user-based")
def recommend_user_based(payload: RecommendRequest):
    try:
        model, user2idx, song2idx, idx2song = cached_artifacts()
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    if payload.userId not in user2idx:
        return {"success": True, "data": []}

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)

    user_idx = torch.tensor([user2idx[payload.userId]], device=device)
    all_items = torch.arange(len(song2idx), device=device)
    user_batch = user_idx.expand_as(all_items)

    with torch.no_grad():
        scores = model(user_batch, all_items).cpu().numpy()

    interacted = set(fetch_user_interactions(payload.userId))

    sorted_indices = np.argsort(-scores)
    recommendations = []
    for idx in sorted_indices:
        song_id = idx2song.get(int(idx))
        if not song_id or song_id in interacted:
            continue
        recommendations.append({"songId": song_id, "score": float(scores[idx])})
        if len(recommendations) >= payload.top_k:
            break

    return {"success": True, "data": recommendations}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("serve_ncf:app", host="0.0.0.0", port=8001, reload=True)