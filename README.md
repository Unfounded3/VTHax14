# VTHax14 / HokieLens

The HokieLens backend lives in [`backend/`](backend/).

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1        # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app
```

See [`backend/README.md`](backend/README.md) for setup flags, API routes, data
files, pipeline commands, and tests.
