<div align="center">

  <img src="assets/header.svg" alt="Predictive Maintenance AI" width="800" />

  <br />

  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
  [![Python](https://img.shields.io/badge/python-3.10+-blue.svg?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
  [![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
  [![LangGraph](https://img.shields.io/badge/LangGraph-Orchestration-orange?style=for-the-badge)](https://langchain-ai.github.io/langgraph/)

  <h3>🚀 AI-Driven Predictive Maintenance</h3>

  <p>
    <a href="#-features">Features</a> •
    <a href="#-architecture">Architecture</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-api-reference">API</a>
  </p>
</div>

<br />

> [!TIP]
> **Live Demo**: Watch the system diagnose engine failures in real-time!
>
> <div align="center">
>   <img src="assets/dashboard_overview.jpg" alt="Command Center" width="100%" />
> </div>

## 📸 Interface Preview

<div align="center">
  <table>
    <tr>
      <td align="center">
        <b>Real-time Sensor Input</b><br/>
        <img src="assets/sensor_input.jpg" alt="Sensor Input" width="400" />
      </td>
      <td align="center">
        <b>Risk & Ensemble Analysis</b><br/>
        <img src="assets/risk_analysis.jpg" alt="Risk Analysis" width="400" />
      </td>
    </tr>
    <tr>
      <td align="center">
        <b>Service Scheduler</b><br/>
        <img src="assets/scheduler.jpg" alt="Scheduler" width="400" />
      </td>
      <td align="center">
        <b>Command Center</b><br/>
        <img src="assets/dashboard_overview.jpg" alt="Dashboard" width="400" />
      </td>
    </tr>
  </table>
</div>

## 📖 Overview

The **Predictive Maintenance System** is a cutting-edge multi-agent AI platform designed to predict, diagnose, and prevent turbofan engine failures. By combining **NASA CMAPSS models** with **LangGraph agents** and **Phi3**, it transforms raw sensor data into actionable maintenance intelligence.

Unlike traditional systems that only output numbers, this system **reasons** about failures, explains **why** they are happening, and recommends **when** to fix them.

## ✨ Features

| Feature | Description |
| :--- | :--- |
| 🤖 **Multi-Agent Orchestration** | 5 specialized agents (Prediction, Diagnosis, Risk, Scheduling, Explanation) working in harmony. |
| 🧠 **Hybrid Intelligence** | Combines Random Forest ensembles with Large Language Model reasoning. |
| 🔍 **Vector Search Diagnosis** | Uses **ChromaDB** to find similar historical failure patterns for accurate root cause analysis. |
| 📊 **Unified Inference** | Robust pipeline handling 3 different CMAPSS datasets (FD001, FD002, FD003) simultaneously. |
| 🛡️ **Risk Assessment** | Dynamic risk scoring based on RUL (Remaining Useful Life) and failure probability. |
| 📝 **Natural Language Reports** | Generates human-readable technical reports explaining the "What", "Why", and "How". |

## 🏗 Architecture

The system follows a **state-machine architecture** orchestrated by LangGraph. Data flows through a pipeline of agents, each enriching the global state.
<div align="center">
  <img src="assets/architecture.png" alt="Architecture Diagram" width="800" />
</div>

## 🛠 Tech Stack

<div align="center">
  <table>
    <tr>
      <td align="center"><b>Backend</b></td>
      <td align="center"><b>Frontend</b></td>
      <td align="center"><b>AI & ML</b></td>
      <td align="center"><b>Data & Ops</b></td>
    </tr>
    <tr>
      <td>
        <img src="https://skillicons.dev/icons?i=python,flask" />
      </td>
      <td>
        <img src="https://skillicons.dev/icons?i=react,vite,tailwind" />
      </td>
      <td>
        <img src="https://skillicons.dev/icons?i=sklearn,tensorflow" />
      </td>
      <td>
        <img src="https://skillicons.dev/icons?i=docker,git" />
      </td>
    </tr>
  </table>
</div>

-   **Core**: Python 3.10+, Flask
-   **Orchestration**: LangGraph
-   **LLM**: Phi3 
-   **ML**: Scikit-learn, LightGBM, NumPy, Pandas
-   **Vector DB**: ChromaDB / Pinecone
-   **Frontend**: React, Vite, Lucide Icons, Framer Motion

## 🚀 Quick Start

### Prerequisites
-   Python 3.10+
-   Node.js 18+
-   Ollama Phi3

### 1. Backend Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/predictive-maintenance-system.git
cd predictive-maintenance-system

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python server.py
```

### 2. Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit `http://localhost:5173` to access the dashboard.

## 🔌 API Reference

### `POST /api/analyze`

Analyzes sensor data and returns a comprehensive maintenance report.

**Request:**
```json
{
  "observation": [-0.0007, -0.0004, 100.0, 518.67, 641.82, ...] // 24 sensor values
}
```

**Response:**
```json
{
  "predictions": { "rul": 112, "failure_prob": 0.02 },
  "diagnosis": { "component": "High Pressure Compressor", "confidence": 0.85 },
  "risk_assessment": { "level": "LOW", "score": 0.15 },
  "final_report": { "narrative": "The engine is operating within normal parameters..." }
}
```

## 📂 Project Structure

```
predictive-maintenance-system/
├── assets/              # Static assets for README
├── client/              # React Frontend
├── src/
│   ├── agents/          # LangGraph Agents (Prediction, Diagnosis, etc.)
│   ├── inference/       # ML Model Inference Logic
│   ├── vector_db/       # ChromaDB/Pinecone wrappers
│   └── workflow.py      # Main Orchestration Graph
├── models/              # Pre-trained .pkl models
├── server.py            # Flask API Entry Point
└── requirements.txt     # Python Dependencies
```

---

<div align="center">
  <br/>
  <img src="assets/team_logo.png" alt="Team Hackstreet" width="120" />
  <h3>Made with ❤️ by Team Hackstreet</h3>
</div>
