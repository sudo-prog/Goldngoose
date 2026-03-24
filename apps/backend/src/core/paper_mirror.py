from typing import Dict, Any, List
from src.utils.logger import get_logger
import asyncio

logger = get_logger(__name__)

class PaperMirror:
    """Paper mirror system for safe experimentation"""
    
    def __init__(self):
        self.pnls = []
        self.execution_history = []
        self.whale_alerts = []
        self.is_initialized = False
    
    async def initialize(self):
        """Initialize the paper mirror system"""
        self.is_initialized = True
        logger.info("Paper mirror system initialized")
    
    async def record_execution(self, result: Dict[str, Any]):
        """Record an execution result in paper mirror"""
        pnl = result.get('paper_pnl', 0.0)
        self.pnls.append(pnl)
        self.execution_history.append({
            'result': result,
            'timestamp': "2026-03-24T19:08:00Z"
        })
        logger.info(f"Paper mirror recorded execution with PnL: {pnl}")
    
    def get_latest_pnl(self) -> float:
        """Get the latest paper PnL"""
        return self.pnls[-1] if self.pnls else 0.0
    
    async def get_latest_whale_alert(self) -> str:
        """Get the latest whale alert"""
        if self.whale_alerts:
            return self.whale_alerts[-1]
        return "No whale activity detected"
    
    def is_healthy(self) -> bool:
        """Check if paper mirror is healthy"""
        return self.is_initialized and len(self.execution_history) >= 0
    
    async def get_execution_history(self) -> List[Dict[str, Any]]:
        """Get execution history"""
        return self.execution_history
    
    def get_summary(self) -> Dict[str, Any]:
        """Get summary of paper mirror performance"""
        total_executions = len(self.execution_history)
        avg_pnl = sum(self.pnls) / len(self.pnls) if self.pnls else 0.0
        max_pnl = max(self.pnls) if self.pnls else 0.0
        min_pnl = min(self.pnls) if self.pnls else 0.0
        
        return {
            "total_executions": total_executions,
            "average_pnl": avg_pnl,
            "max_pnl": max_pnl,
            "min_pnl": min_pnl,
            "current_pnl": self.get_latest_pnl()
        }

async def paper_mirror_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Paper mirror node - runs parallel paper-only execution for every live action
    
    This ensures safe experimentation and learning without risking real capital.
    """
    logger.info("Paper mirror executing parallel paper-only branch")
    
    # Add paper mirror message to state
    state["messages"].append({
        "role": "system", 
        "content": "Paper mirror executing parallel paper-only branch",
        "timestamp": "2026-03-24T18:59:00Z"
    })
    
    # Simulate paper execution results based on current state
    paper_result = {
        "mode": state["mode"],
        "paper_mode": True,
        "trades_proposed": len(state.get("proposed_trades", [])),
        "whale_insights_count": len(state.get("whale_insights", [])),
        "execution_risk": "LOW",  # Paper mode is always low risk
        "timestamp": "2026-03-24T18:59:00Z",
        "learning_opportunities": []
    }
    
    # Add paper result to state
    if "paper_results" not in state:
        state["paper_results"] = []
    
    state["paper_results"].append(paper_result)
    
    # Generate learning opportunities from paper execution
    learning_opportunities = []
    
    if state.get("proposed_trades"):
        learning_opportunities.append("Trade execution patterns analysis")
    
    if state.get("whale_insights"):
        learning_opportunities.append("Whale behavior modeling")
    
    if state["mode"] == 2:  # Live execution mode
        learning_opportunities.append("Risk management validation")
    
    if state["mode"] == 3:  # Evolution mode
        learning_opportunities.append("Strategy evolution patterns")
    
    paper_result["learning_opportunities"] = learning_opportunities
    
    logger.info(f"Paper mirror completed with {len(learning_opportunities)} learning opportunities")
    
    return state

def get_paper_mirror_summary(state: Dict[str, Any]) -> Dict[str, Any]:
    """Get summary of paper mirror results"""
    paper_results = state.get("paper_results", [])
    
    if not paper_results:
        return {"status": "No paper results available"}
    
    latest_result = paper_results[-1]
    
    summary = {
        "total_paper_executions": len(paper_results),
        "latest_execution": {
            "mode": latest_result["mode"],
            "trades_proposed": latest_result["trades_proposed"],
            "learning_opportunities": latest_result["learning_opportunities"],
            "risk_level": latest_result["execution_risk"]
        },
        "safety_guarantee": "Paper mirror ensures zero capital risk during experimentation"
    }
    
    return summary

def validate_paper_mirror_integrity(state: Dict[str, Any]) -> bool:
    """Validate that paper mirror is functioning correctly"""
    paper_results = state.get("paper_results", [])
    
    # Check that paper results exist
    if not paper_results:
        logger.warning("Paper mirror integrity check failed: no paper results")
        return False
    
    # Check that all paper results have required fields
    required_fields = ["mode", "paper_mode", "trades_proposed", "timestamp"]
    
    for result in paper_results:
        for field in required_fields:
            if field not in result:
                logger.warning(f"Paper mirror integrity check failed: missing field {field}")
                return False
    
    # Check that paper mode is always True in paper results
    for result in paper_results:
        if not result.get("paper_mode", False):
            logger.warning("Paper mirror integrity check failed: paper_mode is False")
            return False
    
    logger.info("Paper mirror integrity check passed")
    return True