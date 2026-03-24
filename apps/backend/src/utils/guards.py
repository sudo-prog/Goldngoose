"""
Safety and risk management guards for RAG_GOD
"""
import os
from typing import Dict, Any, Optional
from src.utils.logger import get_logger

logger = get_logger(__name__)

class RiskGuard:
    """Risk management and safety guards"""
    
    def __init__(self, config: Dict[str, Any]):
        self.max_position_size = config.get('risk', {}).get('max_position_size', 1000.0)
        self.max_daily_loss = config.get('risk', {}).get('max_daily_loss', 5000.0)
        self.stop_loss_pct = config.get('risk', {}).get('stop_loss_pct', 10.0)
    
    def validate_trade(self, trade: Dict[str, Any]) -> bool:
        """Validate a proposed trade against risk parameters"""
        try:
            position_size = trade.get('position_size', 0.0)
            if position_size > self.max_position_size:
                logger.warning(f"Trade rejected: position size {position_size} exceeds limit {self.max_position_size}")
                return False
            
            # Additional risk checks could go here
            return True
            
        except Exception as e:
            logger.error(f"Trade validation failed: {e}")
            return False
    
    def check_daily_loss(self, current_loss: float) -> bool:
        """Check if daily loss limit is exceeded"""
        if current_loss > self.max_daily_loss:
            logger.critical(f"Daily loss limit exceeded: {current_loss} > {self.max_daily_loss}")
            return False
        return True
    
    def calculate_stop_loss(self, entry_price: float) -> float:
        """Calculate stop loss price"""
        return entry_price * (1 - self.stop_loss_pct / 100)

def validate_environment() -> bool:
    """Validate that required environment variables are set"""
    required_vars = [
        'POLYMARKET_API_KEY',
        'WALLET_PRIVATE_KEY', 
        'RPC_URL',
        'NEO4J_URI',
        'NEO4J_USER',
        'NEO4J_PASSWORD'
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        logger.error(f"Missing required environment variables: {missing_vars}")
        return False
    
    logger.info("Environment validation passed")
    return True

def safety_check(state: Dict[str, Any]) -> bool:
    """Comprehensive safety check before execution"""
    # Check if paper mode is enabled
    if state.get('paper_mode', True):
        logger.info("Safety check passed: paper mode enabled")
        return True
    
    # Check risk parameters
    risk_assessment = state.get('risk_assessment', {})
    if risk_assessment.get('risk_level', 'HIGH') == 'HIGH':
        logger.warning("Safety check failed: high risk detected")
        return False
    
    # Check trade validation
    proposed_trades = state.get('proposed_trades', [])
    for trade in proposed_trades:
        if not validate_environment():
            logger.warning("Safety check failed: environment validation failed")
            return False
    
    logger.info("Safety check passed")
    return True