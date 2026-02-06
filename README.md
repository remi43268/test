# Digits Demo

This project includes:
- A Jupyter Notebook that trains a simple neural network on scikit-learn's digits dataset.
- A Flask + React app that lets you draw digits and see live predictions.

## Notebook

Open `digits_mlp_demo.ipynb` and run the cells top to bottom.

## Web app

1. Install dependencies using `INSTALL.md` or run:
   ```bash
   ./init_project.sh
   ```
2. Start the backend:
   ```bash
   cd backend
   source .venv/bin/activate
   python app.py
   ```
3. Start the frontend (new terminal):
   ```bash
   cd frontend
   npm run dev
   ```
4. Visit http://localhost:5173.
