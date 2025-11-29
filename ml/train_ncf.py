import os
from pathlib import Path

import mysql.connector
import numpy as np
import torch
from dotenv import load_dotenv
from torch import nn
from torch.utils.data import DataLoader, Dataset

load_dotenv()

ARTIFACT_DIR = Path(__file__).resolve().parent / "artifacts"
ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)


def get_db_config():
    """Read database connection settings from environment variables."""
    db_url = os.getenv("DATABASE_URL")
    if db_url and db_url.startswith("mysql://"):
        # mysql://user:password@host:port/database
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


def fetch_interactions():
    config = get_db_config()
    connection = mysql.connector.connect(**config)
    cursor = connection.cursor()

    query = (
        """
        SELECT userId, songId, SUM(
          CASE
            WHEN action = 'listen' THEN 1
            WHEN action = 'like' THEN 3
            WHEN action = 'skip' THEN -2
            ELSE 0
          END
        ) AS rating
        FROM Interaction
        GROUP BY userId, songId
        HAVING rating > 0
        """
    )

    cursor.execute(query)
    rows = cursor.fetchall()
    cursor.close()
    connection.close()
    return rows


def build_mappings(rows):
    user_ids = sorted({row[0] for row in rows})
    song_ids = sorted({row[1] for row in rows})
    user2idx = {user_id: idx for idx, user_id in enumerate(user_ids)}
    song2idx = {song_id: idx for idx, song_id in enumerate(song_ids)}
    return user2idx, song2idx


class InteractionDataset(Dataset):
    def __init__(self, user_indices, song_indices, ratings):
        self.user_indices = torch.tensor(user_indices, dtype=torch.long)
        self.song_indices = torch.tensor(song_indices, dtype=torch.long)
        self.ratings = torch.tensor(ratings, dtype=torch.float)

    def __len__(self):
        return len(self.ratings)

    def __getitem__(self, idx):
        return (
            self.user_indices[idx],
            self.song_indices[idx],
            self.ratings[idx],
        )


class NeuralCollaborativeFiltering(nn.Module):
    def __init__(self, num_users, num_items, embed_dim=32, hidden_layers=None):
        super().__init__()
        hidden_layers = hidden_layers or [64, 32, 16]
        self.user_embedding = nn.Embedding(num_users, embed_dim)
        self.item_embedding = nn.Embedding(num_items, embed_dim)

        layers = []
        input_dim = embed_dim * 2
        for hidden_dim in hidden_layers:
            layers.append(nn.Linear(input_dim, hidden_dim))
            layers.append(nn.ReLU())
            input_dim = hidden_dim
        layers.append(nn.Linear(input_dim, 1))
        self.mlp = nn.Sequential(*layers)

    def forward(self, user_indices, item_indices):
        user_vec = self.user_embedding(user_indices)
        item_vec = self.item_embedding(item_indices)
        x = torch.cat([user_vec, item_vec], dim=1)
        logits = self.mlp(x).squeeze(-1)
        return torch.sigmoid(logits)


def train():
    rows = fetch_interactions()
    if not rows:
        print("No interaction data found. Skipping training.")
        return

    user2idx, song2idx = build_mappings(rows)

    user_indices = []
    song_indices = []
    ratings = []

    for user_id, song_id, rating in rows:
        user_indices.append(user2idx[user_id])
        song_indices.append(song2idx[song_id])
        ratings.append(float(rating))

    max_rating = max(ratings)
    normalized_ratings = [r / max_rating for r in ratings]

    dataset = InteractionDataset(user_indices, song_indices, normalized_ratings)
    dataloader = DataLoader(dataset, batch_size=256, shuffle=True)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = NeuralCollaborativeFiltering(len(user2idx), len(song2idx)).to(device)
    criterion = torch.nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)

    epochs = int(os.getenv("NCF_EPOCHS", "5"))
    for epoch in range(epochs):
        epoch_loss = 0.0
        for user_batch, item_batch, rating_batch in dataloader:
            user_batch = user_batch.to(device)
            item_batch = item_batch.to(device)
            rating_batch = rating_batch.to(device)

            optimizer.zero_grad()
            preds = model(user_batch, item_batch)
            loss = criterion(preds, rating_batch)
            loss.backward()
            optimizer.step()
            epoch_loss += loss.item() * len(rating_batch)

        epoch_loss /= len(dataset)
        print(f"Epoch {epoch + 1}/{epochs} - loss: {epoch_loss:.4f}")

    torch.save(model.state_dict(), ARTIFACT_DIR / "ncf_model.pt")
    np.save(ARTIFACT_DIR / "user2idx.npy", np.array([user2idx], dtype=object))
    np.save(ARTIFACT_DIR / "song2idx.npy", np.array([song2idx], dtype=object))
    print("Training complete. Artifacts saved to", ARTIFACT_DIR)


if __name__ == "__main__":
    train()