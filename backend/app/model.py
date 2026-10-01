from pathlib import Path

import joblib
import numpy as np
import pandas as pd

MODEL_PATH = Path(__file__).resolve().parents[2] / "models" / "energikarakter_model.joblib"

GRADES = list("ABCDEFG")
# The newest certificates in the training data are from 2025
ATTEST_AAR = 2025
BYGGEAAR_MIN, BYGGEAAR_MAX = 1600, 2025

CATEGORY_LABELS = {"Småhus": "Småhus (enebolig, rekkehus o.l.)", "Boligblokker": "Leilighet i boligblokk"}

# Today's counties (2024). The training data also has old county numbers from before the reforms,
# but the newest certificates use these.
FYLKER = {
    "03": "Oslo",
    "11": "Rogaland",
    "15": "Møre og Romsdal",
    "18": "Nordland",
    "31": "Østfold",
    "32": "Akershus",
    "33": "Buskerud",
    "34": "Innlandet",
    "39": "Vestfold",
    "40": "Telemark",
    "42": "Agder",
    "46": "Vestland",
    "50": "Trøndelag",
    "55": "Troms",
    "56": "Finnmark",
}

pipeline = joblib.load(MODEL_PATH)

_cat_features = pipeline["prep"].transformers_[1][2]
_encoder = pipeline["prep"].named_transformers_["cat"]["onehot"]
# The categories the model was trained on, without the imputer's placeholder for missing values
KNOWN = {
    feature: [c for c in categories if c != "ukjent"]
    for feature, categories in zip(_cat_features, _encoder.categories_)
}


def options() -> dict:
    """Valid choices for the form, as {value, label} pairs."""
    return {
        "bygningskategori": [{"value": c, "label": CATEGORY_LABELS.get(c, c)} for c in KNOWN["bygningskategori"]],
        "materialvalg": [{"value": c, "label": c} for c in KNOWN["materialvalg"]],
        "fylke": [
            {"value": code, "label": name}
            for code, name in sorted(FYLKER.items(), key=lambda x: x[1])
            if code in KNOWN["fylke"]
        ],
        "byggeaar": {"min": BYGGEAAR_MIN, "max": BYGGEAAR_MAX},
    }


def predict(bygningskategori, byggeaar, materialvalg, fylke=None) -> dict:
    """Predicts the energikarakter for one home. Same input format as in the notebook."""
    row = pd.DataFrame([{
        "byggeaar": byggeaar,
        "attest_aar": ATTEST_AAR,
        "bygningskategori": bygningskategori,
        "materialvalg": materialvalg,
        "fylke": fylke if fylke is not None else np.nan,
    }])[list(pipeline.feature_names_in_)]
    value = float(pipeline.predict(row)[0])
    grade = GRADES[int(np.clip(np.rint(value), 1, 7)) - 1]
    return {"karakter": grade, "verdi": round(value, 2)}
