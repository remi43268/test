# Installation Guide

This project has a Flask backend and a React frontend. Follow these steps to install dependencies.

## Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Frontend

```bash
cd frontend
npm install
```

## Run the apps

Open two terminals:

```bash
# Terminal 1
cd backend
source .venv/bin/activate
python app.py
```

```bash
# Terminal 2
cd frontend
npm run dev
```

Then open http://localhost:5173 in your browser.
