from typing import Literal, Dict, Any, Optional
from src.utils.logger import get_logger

logger = get_logger(__name__)

async def mode_router(state: Dict[str, Any]) -> str:
    """
    Route to appropriate node based on mode and conditions
    
    Mode 0: Meta-researcher + Whale ingestion → Paper mirror
    Mode 1: Full retrieval + Mem0 context → Paper mirror  
    Mode 2: Live execution with risk guard → Paper mirror
    Mode 3: Self-evolution + Auto-Evolution Lab → Paper mirror
    """
    mode = state.get('mode', 0)
    paper_mode = state.get('paper_mode', True)
    
    logger.info(f"Routing in mode {mode}, paper_mode: {paper_mode}")
    
    if mode == 0:
        # Mode 0: Meta-researcher + Whale ingestion
        return "whale_ingestor"
    
    elif mode == 1:
        # Mode 1: Full retrieval + Mem0 context
        return "retrieval"
    
    elif mode == 2:
        # Mode 2: Live execution with risk guard
        # Check if paper mode is enabled for safety
        if paper_mode:
            logger.info("Mode 2 with paper mode enabled - routing to executor")
            return "executor"
        else:
            # Live execution - add risk assessment
            logger.warning("Mode 2 live execution - ensure risk guards are active")
            return "executor"
    
    elif mode == 3:
        # Mode 3: Self-evolution + Auto-Evolution Lab
        return "evolver"
    
    else:
        logger.error(f"Unknown mode: {mode}")
        return "END"

def get_mode_description(mode: int) -> str:
    """Get description for mode"""
    descriptions = {
        0: "Meta-researcher + Whale ingestion → Paper mirror",
        1: "Full retrieval + Mem0 context → Paper mirror",
        2: "Live execution with risk guard → Paper mirror", 
        3: "Self-evolution + Auto-Evolution Lab → Paper mirror"
    }
    return descriptions.get(mode, "Unknown mode")

def validate_mode_transition(current_mode: int, target_mode: int) -> bool:
    """Validate mode transitions"""
    # Allow any transition for now, but could add restrictions
    valid_modes = [0, 1, 2, 3]
    return current_mode in valid_modes and target_mode in valid_modes