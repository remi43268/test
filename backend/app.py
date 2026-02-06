from __future__ import annotations

from typing import List

import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS
from sklearn.datasets import load_digits
from sklearn.neural_network import MLPClassifier

app = Flask(__name__)
CORS(app)


def train_model() -> MLPClassifier:
    digits = load_digits()
    X = digits.data
    y = digits.target

    model = MLPClassifier(
        hidden_layer_sizes=(64,),
        activation="relu",
        solver="adam",
        max_iter=300,
        random_state=42,
    )
    model.fit(X, y)
    return model


MODEL = train_model()


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/predict")
def predict() -> tuple:
    payload = request.get_json(silent=True)
    if not payload or "pixels" not in payload:
        return jsonify({"error": "Missing 'pixels' in request body."}), 400

    pixels: List[float] = payload["pixels"]
    if len(pixels) != 64:
        return jsonify({"error": "Expected 64 pixel values (8x8)."}), 400

    sample = np.array(pixels, dtype=np.float32).reshape(1, -1)
    probabilities = MODEL.predict_proba(sample)[0]
    predicted_label = int(np.argmax(probabilities))

    return (
        jsonify(
            {
                "prediction": predicted_label,
                "probabilities": probabilities.tolist(),
            }
        ),
        200,
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
