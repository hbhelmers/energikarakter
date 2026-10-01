from fastapi import FastAPI
from pydantic import BaseModel, Field, field_validator

from . import model

app = FastAPI(title="Energikarakter API")


class Bolig(BaseModel):
    bygningskategori: str
    byggeaar: int = Field(ge=model.BYGGEAAR_MIN, le=model.BYGGEAAR_MAX)
    # Required: a missing material in the data mostly means newer homes, which skews predictions
    materialvalg: str
    fylke: str | None = None

    @field_validator("bygningskategori", "materialvalg", "fylke")
    @classmethod
    def must_be_known(cls, value, info):
        valid = model.FYLKER if info.field_name == "fylke" else model.KNOWN[info.field_name]
        if value is not None and value not in valid:
            raise ValueError(f"must be one of {list(valid)}")
        return value


class Prediksjon(BaseModel):
    karakter: str
    verdi: float


@app.get("/api/options")
def get_options():
    return model.options()


@app.post("/api/predict", response_model=Prediksjon)
def post_predict(bolig: Bolig):
    return model.predict(**bolig.model_dump())
