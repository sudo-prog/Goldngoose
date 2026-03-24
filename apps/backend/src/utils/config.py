import os
from typing import Dict, Any
import yaml

def load_config() -> Dict[str, Any]:
    """Load configuration from environment and config files"""
    config = {
        'mode': int(os.getenv('RAG_GOD_MODE', '0')),
        'paper_mode': os.getenv('RAG_GOD_PAPER_MODE', 'true').lower() == 'true',
        'llm': {
            'provider': os.getenv('LLM_PROVIDER', 'anthropic'),
            'model': os.getenv('LLM_MODEL', 'claude-sonnet-4-20250514'),
            'temperature': float(os.getenv('LLM_TEMPERATURE', '0.1')),
            'max_tokens': int(os.getenv('LLM_MAX_TOKENS', '4000'))
        },
        'neo4j': {
            'uri': os.getenv('NEO4J_URI', 'bolt://localhost:7687'),
            'user': os.getenv('NEO4J_USER', 'neo4j'),
            'password': os.getenv('NEO4J_PASSWORD', 'password')
        },
        'mem0': {
            'api_key': os.getenv('MEM0_API_KEY'),
            'local': os.getenv('MEM0_LOCAL', 'true').lower() == 'true'
        },
        'polymarket': {
            'api_key': os.getenv('POLYMARKET_API_KEY'),
            'wallet_private_key': os.getenv('WALLET_PRIVATE_KEY'),
            'rpc_url': os.getenv('RPC_URL')
        },
        'telegram': {
            'bot_token': os.getenv('TELEGRAM_BOT_TOKEN'),
            'chat_id': os.getenv('TELEGRAM_CHAT_ID')
        },
        'risk': {
            'max_position_size': float(os.getenv('MAX_POSITION_SIZE', '1000.0')),
            'max_daily_loss': float(os.getenv('MAX_DAILY_LOSS', '5000.0')),
            'stop_loss_pct': float(os.getenv('STOP_LOSS_PCT', '10.0'))
        }
    }
    
    # Load additional config from file if exists
    config_file = os.getenv('CONFIG_FILE', 'config/settings.yaml')
    if os.path.exists(config_file):
        with open(config_file, 'r') as f:
            file_config = yaml.safe_load(f)
            if file_config:
                config.update(file_config)
    
    return config

def validate_config(config: Dict[str, Any]) -> bool:
    """Validate configuration"""
    required_keys = ['mode', 'paper_mode', 'llm', 'neo4j']
    
    for key in required_keys:
        if key not in config:
            return False
    
    # Validate mode
    if config['mode'] not in [0, 1, 2, 3]:
        return False
    
    return True