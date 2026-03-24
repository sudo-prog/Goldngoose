import os
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from langgraph.checkpoint.memory import MemorySaver
from typing import Dict, Any, List
import json
import logging

# Import existing components
from src.core.graph import build_rag_god_graph
from src.core.paper_mirror import PaperMirror
from src.utils.config import load_config
from src.utils.logger import setup_logger

# Load environment variables
load_dotenv()

# Setup logging
logger = setup_logger()

# Global variables
app = FastAPI(title="RAG_GOD Backend")
MODE = int(os.getenv('RAG_GOD_MODE', '0'))
paper = PaperMirror()
checkpointer = MemorySaver()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Build the RAG_GOD graph
rag_god_graph = build_rag_god_graph()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: Dict[str, Any]):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error sending message to WebSocket: {e}")

manager = ConnectionManager()

@app.on_event("startup")
async def startup_event():
    """Initialize the RAG_GOD system on startup"""
    logger.info("RAG_GOD Backend starting up...")
    
    # Initialize paper mirror
    await paper.initialize()
    
    logger.info("RAG_GOD Backend ready - FastAPI server listening on port 8000")

@app.get("/status")
async def status():
    """Get current system status"""
    try:
        paper_pnl = paper.get_latest_pnl()
        return {
            "mode": MODE,
            "paper_pnl": paper_pnl,
            "live_pnl": 0.03,  # Placeholder for live PnL
            "status": "running",
            "timestamp": "2026-03-24T19:07:00Z"
        }
    except Exception as e:
        logger.error(f"Status check failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/switch-mode")
async def switch_mode(new_mode: Dict[str, int]):
    """Switch between RAG_GOD modes (0-3)"""
    global MODE
    
    mode_num = new_mode.get("new_mode", 0)
    
    if mode_num not in [0, 1, 2, 3]:
        raise HTTPException(status_code=400, detail="Mode must be 0, 1, 2, or 3")
    
    old_mode = MODE
    MODE = mode_num
    
    logger.info(f"Mode switched from {old_mode} to {MODE}")
    
    # Broadcast mode change to all connected clients
    await manager.broadcast({
        "type": "mode_change",
        "old_mode": old_mode,
        "new_mode": MODE,
        "timestamp": "2026-03-24T19:07:00Z"
    })
    
    return {
        "status": f"Switched to Mode {MODE}",
        "mode": MODE,
        "description": get_mode_description(MODE)
    }

@app.post("/execute")
async def execute(order: Dict[str, Any]):
    """Execute a trade order through RAG_GOD"""
    try:
        # Validate order
        if not validate_order(order):
            raise HTTPException(status_code=400, detail="Invalid order format")
        
        # Get current config
        config = load_config()
        
        # Prepare initial state for the graph
        initial_state = {
            "mode": MODE,
            "paper_mode": config.get('paper_mode', True),
            "messages": [],
            "current_market": {},
            "whale_insights": [],
            "proposed_trades": [order],
            "evolution_score": 0.0,
            "mem0_context": {},
            "risk_assessment": {}
        }
        
        # Execute the RAG_GOD cycle
        result = await rag_god_graph.invoke(initial_state)
        
        # Update paper mirror with execution result
        await paper.record_execution(result)
        
        # Broadcast execution result
        await manager.broadcast({
            "type": "execution_result",
            "order": order,
            "result": result,
            "paper_pnl": paper.get_latest_pnl(),
            "timestamp": "2026-03-24T19:07:00Z"
        })
        
        return {
            "status": "executed",
            "order": order,
            "result": result,
            "paper_pnl": paper.get_latest_pnl(),
            "mode": MODE
        }
        
    except Exception as e:
        logger.error(f"Execution failed: {e}")
        raise HTTPException(status_code=500, detail=f"Execution failed: {str(e)}")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates"""
    await manager.connect(websocket)
    try:
        while True:
            # Send real-time updates every 2 seconds
            update_data = {
                "type": "live_update",
                "paper_pnl": paper.get_latest_pnl(),
                "mode": MODE,
                "whale_alert": await paper.get_latest_whale_alert(),
                "timestamp": "2026-03-24T19:07:00Z"
            }
            
            await websocket.send_json(update_data)
            await asyncio.sleep(2)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info("Client disconnected from WebSocket")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        health = await rag_god_graph.health_check()
        return {
            "status": "healthy" if all(health.values()) else "degraded",
            "components": health,
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

@app.get("/mode/{mode_num}")
async def get_mode_info(mode_num: int):
    """Get information about a specific mode"""
    if mode_num not in [0, 1, 2, 3]:
        raise HTTPException(status_code=400, detail="Invalid mode number")
    
    return {
        "mode": mode_num,
        "description": get_mode_description(mode_num),
        "features": get_mode_features(mode_num),
        "status": "available"
    }

@app.get("/paper-mirror/history")
async def get_paper_mirror_history():
    """Get paper mirror execution history"""
    try:
        history = await paper.get_execution_history()
        return {
            "history": history,
            "summary": paper.get_summary(),
            "total_executions": len(history)
        }
    except Exception as e:
        logger.error(f"Failed to get paper mirror history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Helper functions

def get_mode_description(mode: int) -> str:
    """Get description for mode"""
    descriptions = {
        0: "Meta-researcher + Whale ingestion → Paper mirror",
        1: "Full retrieval + Mem0 context → Paper mirror",
        2: "Live execution with risk guard → Paper mirror",
        3: "Self-evolution + Auto-Evolution Lab → Paper mirror"
    }
    return descriptions.get(mode, "Unknown mode")

def get_mode_features(mode: int) -> List[str]:
    """Get features for mode"""
    features = {
        0: ["Market sentiment analysis", "Whale activity patterns", "Basic trend identification"],
        1: ["Deep market analysis", "Multi-source data correlation", "Advanced pattern recognition"],
        2: ["Real-time market dynamics", "Execution optimization", "Risk-adjusted returns"],
        3: ["Strategy evolution", "Performance optimization", "System improvement"]
    }
    return features.get(mode, ["General market analysis"])

def validate_order(order: Dict[str, Any]) -> bool:
    """Validate order format"""
    required_fields = ["size", "price", "market"]
    for field in required_fields:
        if field not in order:
            return False
    return True

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")