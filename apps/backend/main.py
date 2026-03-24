"""
RAG_GOD Backend - FastAPI service for Goldngoose
Provides API endpoints and WebSocket streaming for the trading terminal
"""

import os
import sys
import asyncio
from datetime import datetime
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Add parent directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'rag_god'))

try:
    from src.core.graph import RAGGodGraph, build_rag_god_graph
    from src.core.paper_mirror import PaperMirror
    from src.core.modes import get_mode_description
    from src.utils.config import load_config
    from src.utils.logger import setup_logger
except ImportError as e:
    print(f"Warning: Could not import RAG_GOD modules: {e}")
    print("Running in simulation mode...")

    # Fallback implementations
    class PaperMirror:
        def __init__(self):
            self.pnls = []
            self.execution_history = []
            self.whale_alerts = []
            self.is_initialized = False

        async def initialize(self):
            self.is_initialized = True

        async def record_execution(self, result):
            pnl = result.get('paper_pnl', 0.0)
            self.pnls.append(pnl)
            self.execution_history.append({'result': result, 'timestamp': datetime.now().isoformat()})

        def get_latest_pnl(self):
            return self.pnls[-1] if self.pnls else 0.0

        async def get_latest_whale_alert(self):
            return "HorizonSplendidView entered 150k YES" if self.whale_alerts else "No whale activity detected"

        def is_healthy(self):
            return self.is_initialized

    class RAGGodGraph:
        def __init__(self):
            self.is_initialized = True

        async def invoke(self, initial_state):
            return {
                **initial_state,
                "paper_pnl": 0.03,
                "execution_result": "simulated"
            }

        async def health_check(self):
            return {
                "graph_initialized": True,
                "whale_ingestor": True,
                "retrieval": True,
                "executor": True,
                "evolver": True,
                "paper_mirror": True
            }

    def get_mode_description(mode):
        descriptions = {
            0: "Meta-researcher + Whale ingestion → Paper mirror",
            1: "Full retrieval + Mem0 context → Paper mirror",
            2: "Live execution with risk guard → Paper mirror",
            3: "Self-evolution + Auto-Evolution Lab → Paper mirror"
        }
        return descriptions.get(mode, "Unknown mode")

    def setup_logger():
        import logging
        logging.basicConfig(level=logging.INFO)
        return logging.getLogger("rag_god")

    def load_config():
        return {'paper_mode': True}

# Load environment variables
load_dotenv()

# Setup logging
logger = setup_logger()

# Initialize FastAPI app
app = FastAPI(title="RAG_GOD Backend for Goldngoose", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
MODE = int(os.getenv('RAG_GOD_MODE', '0'))
paper = PaperMirror()
config = load_config()

# Initialize RAG_GOD graph
try:
    rag_god_graph = RAGGodGraph()
    logger.info("RAG_GOD graph initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize RAG_GOD graph: {e}")
    rag_god_graph = None

# Pydantic models
class ModeSwitch(BaseModel):
    new_mode: int

class TradeOrder(BaseModel):
    size: float
    price: float
    market: str
    side: str = "buy"
    order_type: str = "limit"

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")

    async def broadcast(self, message: Dict[str, Any]):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting to WebSocket: {e}")

manager = ConnectionManager()

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize RAG_GOD system on startup"""
    logger.info("RAG_GOD Backend starting up...")
    await paper.initialize()
    logger.info("RAG_GOD Backend ready - FastAPI server listening on port 8000")

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        if rag_god_graph:
            health = await rag_god_graph.health_check()
            return {
                "status": "healthy" if all(health.values()) else "degraded",
                "components": health,
                "mode": MODE,
                "paper_mirror": paper.is_healthy()
            }
        else:
            return {
                "status": "simulated",
                "mode": MODE,
                "paper_mirror": paper.is_healthy()
            }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "mode": MODE
        }

# Status endpoint
@app.get("/status")
async def get_status():
    """Get current system status"""
    try:
        paper_pnl = paper.get_latest_pnl()
        whale_alert = await paper.get_latest_whale_alert()

        return {
            "mode": MODE,
            "mode_description": get_mode_description(MODE),
            "paper_pnl": paper_pnl,
            "live_pnl": 0.03,  # Placeholder for live PnL
            "whale_alert": whale_alert,
            "status": "running",
            "paper_mode": config.get('paper_mode', True),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Status check failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Mode switching endpoint
@app.post("/switch-mode")
async def switch_mode(mode_switch: ModeSwitch):
    """Switch between RAG_GOD modes (0-3)"""
    global MODE

    new_mode = mode_switch.new_mode

    if new_mode not in [0, 1, 2, 3]:
        raise HTTPException(status_code=400, detail="Mode must be 0, 1, 2, or 3")

    old_mode = MODE
    MODE = new_mode

    logger.info(f"Mode switched from {old_mode} to {MODE}")

    # Broadcast mode change to all connected clients
    await manager.broadcast({
        "type": "mode_change",
        "old_mode": old_mode,
        "new_mode": MODE,
        "mode_description": get_mode_description(MODE),
        "timestamp": datetime.now().isoformat()
    })

    return {
        "status": f"Switched to Mode {MODE}",
        "mode": MODE,
        "description": get_mode_description(MODE)
    }

# Execute endpoint
@app.post("/execute")
async def execute_order(order: TradeOrder):
    """Execute a trade order through RAG_GOD"""
    try:
        # Prepare initial state for the graph
        initial_state = {
            "mode": MODE,
            "paper_mode": config.get('paper_mode', True),
            "messages": [],
            "current_market": {},
            "whale_insights": [],
            "proposed_trades": [order.dict()],
            "evolution_score": 0.0,
            "mem0_context": {},
            "risk_assessment": {}
        }

        # Execute the RAG_GOD cycle
        if rag_god_graph:
            result = await rag_god_graph.invoke(initial_state)
        else:
            # Simulated execution
            result = {
                **initial_state,
                "paper_pnl": 0.02,
                "execution_result": "simulated"
            }

        # Update paper mirror with execution result
        await paper.record_execution(result)

        # Broadcast execution result
        await manager.broadcast({
            "type": "execution_result",
            "order": order.dict(),
            "result": result,
            "paper_pnl": paper.get_latest_pnl(),
            "mode": MODE,
            "timestamp": datetime.now().isoformat()
        })

        return {
            "status": "executed",
            "order": order.dict(),
            "result": result,
            "paper_pnl": paper.get_latest_pnl(),
            "mode": MODE
        }

    except Exception as e:
        logger.error(f"Execution failed: {e}")
        raise HTTPException(status_code=500, detail=f"Execution failed: {str(e)}")

# Paper mirror history endpoint
@app.get("/paper-mirror/history")
async def get_paper_mirror_history():
    """Get paper mirror execution history"""
    try:
        history = paper.execution_history
        return {
            "history": history,
            "total_executions": len(history),
            "current_pnl": paper.get_latest_pnl()
        }
    except Exception as e:
        logger.error(f"Failed to get paper mirror history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Mode info endpoint
@app.get("/mode/{mode_num}")
async def get_mode_info(mode_num: int):
    """Get information about a specific mode"""
    if mode_num not in [0, 1, 2, 3]:
        raise HTTPException(status_code=400, detail="Invalid mode number")

    features = {
        0: ["Market sentiment analysis", "Whale activity patterns", "Basic trend identification"],
        1: ["Deep market analysis", "Multi-source data correlation", "Advanced pattern recognition"],
        2: ["Real-time market dynamics", "Execution optimization", "Risk-adjusted returns"],
        3: ["Strategy evolution", "Performance optimization", "System improvement"]
    }

    return {
        "mode": mode_num,
        "description": get_mode_description(mode_num),
        "features": features.get(mode_num, ["General market analysis"]),
        "status": "available"
    }

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates"""
    await manager.connect(websocket)
    try:
        while True:
            # Send real-time updates every 2 seconds
            paper_pnl = paper.get_latest_pnl()
            whale_alert = await paper.get_latest_whale_alert()

            update_data = {
                "type": "live_update",
                "paper_pnl": paper_pnl,
                "mode": MODE,
                "mode_description": get_mode_description(MODE),
                "whale_alert": whale_alert,
                "paper_mode": config.get('paper_mode', True),
                "timestamp": datetime.now().isoformat()
            }

            await websocket.send_json(update_data)
            await asyncio.sleep(2)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info("Client disconnected from WebSocket")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)

# Run the server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
