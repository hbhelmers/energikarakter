# Energikarakter

A regression model that predicts the energikarakter (A–G) of a Norwegian home from building type, year built, construction material and location, with a small web app on top. The model part is a slight modification of an earlier version of a group project from 2025.

Data: Enova Energimerkesystemet - Offentlige data https://data.enova.no/.

## Results

Trained on about 1.3 million Norwegian homes (energy certificates 2010–2025), evaluated on a held-out test set of 263 475 homes:

| | Exact grade | At most one grade off | MAE (grades) |
|---|---|---|---|
| Baseline (always the median) | 15 % | 50 % | 1.54 |
| Final model (gradient boosting) | 54 % | 95 % | 0.58 |

The full evaluation and conclusion are at the end of the notebook.



## Project structure

```
notebooks/   training notebook (data -> model)
data/        CSV files (not in git lol)
models/      trained model, energikarakter_model.joblib (not in git either)
backend/     FastAPI app that loads the model and serves /api/predict and /api/options
frontend/    React app (Vite) with the form for the prediciton
```

## Getting started

On Windows (PowerShell):

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Get the data: create a user at https://data.enova.no/ and subscribe to the "Energimerkesystemet - Offentlige data" API (v1). Then either
- put `ENOVA_API_KEY=<your key>` in a `.env` file in the project root (the notebook downloads the files into `data/`), or
- download the CSV files by hand and put them in `data/`.

Then open `notebooks/energikarakter.ipynb` and run all cells. This trains the model and saves it to `models/`.

## Running the web app

The backend needs the trained model in `models/`. Start backend and frontend in two terminals:

```powershell
# Terminal 1, project root with .venv activated
uvicorn backend.app.main:app --reload
```

```powershell
# Terminal 2
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The API docs are at http://localhost:8000/docs.
