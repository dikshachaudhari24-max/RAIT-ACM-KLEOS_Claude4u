"""Invoice anomaly detection using Isolation Forest."""

import os
import pickle
import random
import tempfile

import numpy as np
from sklearn.ensemble import IsolationForest

MODEL_PATH = os.path.join(tempfile.gettempdir(), "hisably_isolation_forest.pkl")


def _generate_mock_data() -> list[dict]:
    rng = random.Random(42)
    records = []
    for _ in range(18):
        records.append({
            "amount": rng.uniform(5000, 50000),
            "taxable_value": rng.uniform(4000, 42000),
            "gst_amount": rng.uniform(500, 8000),
            "gst_percent": rng.choice([5, 12, 18]),
            "days_since_last_invoice": rng.randint(5, 30),
        })
    records.append({
        "amount": 250000,
        "taxable_value": 211864,
        "gst_amount": 38136,
        "gst_percent": 18,
        "days_since_last_invoice": 15,
    })
    records.append({
        "amount": 36250,
        "taxable_value": 25000,
        "gst_amount": 11250,
        "gst_percent": 45,
        "days_since_last_invoice": 10,
    })
    return records


def _extract_features(invoice: dict) -> list[float]:
    amount = float(invoice.get("amount", 0) or 0)
    taxable = float(invoice.get("taxable_value", 1) or 1)
    gst_amount = float(invoice.get("gst_amount", 0) or 0)
    gst_ratio = (gst_amount / taxable * 100) if taxable > 0 else 0.0
    days = float(invoice.get("days_since_last_invoice", 15) or 15)
    return [amount, gst_ratio, days]


def _train_on_mock_data():
    data = _generate_mock_data()
    features = np.array([_extract_features(r) for r in data])
    model = IsolationForest(n_estimators=100, contamination=0.1, random_state=42)
    model.fit(features)
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)
    return model


class InvoiceAnomalyScorer:
    """Scores invoices for anomalies using an Isolation Forest model."""

    def __init__(self):
        if os.path.exists(MODEL_PATH):
            with open(MODEL_PATH, "rb") as f:
                self._model = pickle.load(f)
        else:
            self._model = _train_on_mock_data()

    def score(self, invoice: dict) -> float:
        """Return an anomaly score between 0.0 and 1.0 for an invoice."""
        features = np.array([_extract_features(invoice)])
        decision = self._model.decision_function(features)[0]
        return float(1 - np.clip(decision + 0.5, 0, 1))

    def is_anomalous(self, score: float) -> bool:
        """Determine whether a score exceeds the anomaly threshold."""
        return score >= 0.5

    def get_explanation(self, invoice: dict, score: float) -> str:
        """Generate a human-readable explanation for an anomaly score."""
        amount = float(invoice.get("amount", 0) or 0)
        gst_percent = float(invoice.get("gst_percent", 0) or 0)
        days = float(invoice.get("days_since_last_invoice", 15) or 15)

        if amount > 100000:
            return (
                f"Unusually high invoice amount of ₹{amount:,.2f} detected. "
                f"This is significantly above the typical range for this supplier."
            )
        if gst_percent > 28:
            return (
                f"GST rate of {gst_percent}% is abnormally high. "
                f"Standard GST rates in India are 5%, 12%, 18%, or 28%."
            )
        if days < 1:
            return (
                "Multiple invoices received on the same day from this supplier, "
                "which is unusual and may indicate duplicate entries."
            )
        return (
            f"Invoice flagged with anomaly score {score:.2f}. "
            f"Review the invoice details for potential irregularities."
        )
