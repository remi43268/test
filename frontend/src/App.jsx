import React, { useEffect, useRef, useState } from "react";

const CANVAS_SIZE = 280;
const GRID_SIZE = 8;
const SCALE = CANVAS_SIZE / GRID_SIZE;
const DEFAULT_PROBABILITIES = Array.from({ length: 10 }, () => 0);

function App() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [probabilities, setProbabilities] = useState(DEFAULT_PROBABILITIES);
  const [error, setError] = useState("");

  useEffect(() => {
    initializeCanvas();
  }, []);

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.fillStyle = "#000";
    context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  };

  const getCanvasPosition = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const handlePointerDown = (event) => {
    setIsDrawing(true);
    draw(event);
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
  };

  const handlePointerLeave = () => {
    setIsDrawing(false);
  };

  const draw = (event) => {
    if (!isDrawing) {
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const { x, y } = getCanvasPosition(event);

    context.fillStyle = "#fff";
    context.beginPath();
    context.arc(x, y, 12, 0, Math.PI * 2);
    context.fill();
  };

  const clearCanvas = () => {
    initializeCanvas();
    setPrediction(null);
    setProbabilities(DEFAULT_PROBABILITIES);
    setError("");
  };

  const downsampleToGrid = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const { data } = context.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    const pixels = [];

    for (let row = 0; row < GRID_SIZE; row += 1) {
      for (let col = 0; col < GRID_SIZE; col += 1) {
        let total = 0;
        let count = 0;
        for (let y = row * SCALE; y < (row + 1) * SCALE; y += 1) {
          for (let x = col * SCALE; x < (col + 1) * SCALE; x += 1) {
            const index = (y * CANVAS_SIZE + x) * 4;
            const value = data[index];
            total += value;
            count += 1;
          }
        }
        const average = total / count;
        const normalized = (average / 255) * 16;
        pixels.push(normalized);
      }
    }

    return pixels;
  };

  const requestPrediction = async () => {
    setError("");
    const pixels = downsampleToGrid();

    try {
      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pixels }),
      });

      if (!response.ok) {
        const message = await response.json();
        throw new Error(message.error || "Prediction failed");
      }

      const result = await response.json();
      setPrediction(result.prediction);
      setProbabilities(result.probabilities);
    } catch (fetchError) {
      setError(fetchError.message);
    }
  };

  return (
    <div className="page">
      <header className="header">
        <h1>Digit Predictor</h1>
        <p>Draw a digit (0-9) and let the neural network guess it.</p>
      </header>

      <main className="content">
        <section className="panel">
          <h2>Draw a digit</h2>
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="canvas"
            onPointerDown={handlePointerDown}
            onPointerMove={draw}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerLeave}
          />
          <div className="button-row">
            <button type="button" onClick={requestPrediction}>
              Predict
            </button>
            <button type="button" onClick={clearCanvas} className="secondary">
              Clear
            </button>
          </div>
        </section>

        <section className="panel">
          <h2>Prediction</h2>
          <div className="prediction-box">
            <span className="label">Predicted digit</span>
            <span className="value">
              {prediction === null ? "—" : prediction}
            </span>
          </div>
          {error ? <p className="error">{error}</p> : null}
          <h3>Probabilities</h3>
          <ul className="probabilities">
            {probabilities.map((probability, index) => (
              <li key={index}>
                <span>{index}</span>
                <div className="bar">
                  <div
                    className="bar-fill"
                    style={{ width: `${(probability * 100).toFixed(1)}%` }}
                  />
                </div>
                <span className="percent">
                  {(probability * 100).toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

export default App;
