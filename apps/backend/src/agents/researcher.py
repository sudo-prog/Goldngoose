from typing import Dict, Any, List
from src.utils.logger import get_logger

logger = get_logger(__name__)

async def meta_researcher_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Meta-researcher node - analyzes market and generates research plan
    
    This is the primary intelligence gathering node that:
    - Analyzes current market conditions
    - Identifies research opportunities
    - Generates research questions and hypotheses
    - Coordinates with other specialized agents
    """
    logger.info(f"Meta-researcher executing in mode {state['mode']}")
    
    # Add message about meta-research
    state["messages"].append({
        "role": "system",
        "content": f"Meta-researcher analyzing market in mode {state['mode']}",
        "timestamp": "2026-03-24T18:59:00Z"
    })
    
    # Generate research plan based on mode
    research_plan = {
        "mode": state["mode"],
        "research_focus": _get_research_focus(state["mode"]),
        "hypotheses": _generate_hypotheses(state["mode"]),
        "data_sources": _get_data_sources(state["mode"]),
        "timeline": "Immediate execution",
        "risk_assessment": "Standard research risk"
    }
    
    # Add research plan to state
    state["messages"].append({
        "role": "system",
        "content": f"Research plan generated: {research_plan}",
        "timestamp": "2026-03-24T18:59:01Z"
    })
    
    # Update current market state if not already set
    if not state.get("current_market"):
        state["current_market"] = {
            "analysis_timestamp": "2026-03-24T18:59:00Z",
            "market_conditions": "Active trading",
            "research_opportunities": research_plan["research_focus"]
        }
    
    logger.info(f"Meta-researcher completed with focus: {research_plan['research_focus']}")
    
    return state

def _get_research_focus(mode: int) -> List[str]:
    """Get research focus based on mode"""
    focus_map = {
        0: ["Market sentiment analysis", "Whale activity patterns", "Basic trend identification"],
        1: ["Deep market analysis", "Multi-source data correlation", "Advanced pattern recognition"],
        2: ["Real-time market dynamics", "Execution optimization", "Risk-adjusted returns"],
        3: ["Strategy evolution", "Performance optimization", "System improvement"]
    }
    return focus_map.get(mode, ["General market analysis"])

def _generate_hypotheses(mode: int) -> List[str]:
    """Generate research hypotheses based on mode"""
    hypotheses_map = {
        0: [
            "Whale activity correlates with market direction",
            "Sentiment indicators predict short-term movements"
        ],
        1: [
            "Multi-source data improves prediction accuracy",
            "Advanced patterns provide edge in execution"
        ],
        2: [
            "Real-time optimization improves trade outcomes",
            "Risk management enhances long-term performance"
        ],
        3: [
            "Continuous evolution improves system performance",
            "Auto-evolution lab identifies optimal strategies"
        ]
    }
    return hypotheses_map.get(mode, ["Market follows predictable patterns"])

def _get_data_sources(mode: int) -> List[str]:
    """Get data sources based on mode"""
    sources_map = {
        0: ["Basic market data", "Whale tracking", "Sentiment indicators"],
        1: ["Comprehensive market data", "Multi-source APIs", "Advanced analytics"],
        2: ["Real-time market feeds", "Execution data", "Risk metrics"],
        3: ["Performance data", "Evolution metrics", "System feedback"]
    }
    return sources_map.get(mode, ["Standard market data"])

def validate_research_plan(plan: Dict[str, Any]) -> bool:
    """Validate research plan structure"""
    required_fields = ["mode", "research_focus", "hypotheses", "data_sources"]
    
    for field in required_fields:
        if field not in plan:
            logger.error(f"Research plan missing required field: {field}")
            return False
    
    if not isinstance(plan["research_focus"], list):
        logger.error("Research focus must be a list")
        return False
    
    if not isinstance(plan["hypotheses"], list):
        logger.error("Hypotheses must be a list")
        return False
    
    if not isinstance(plan["data_sources"], list):
        logger.error("Data sources must be a list")
        return False
    
    return True