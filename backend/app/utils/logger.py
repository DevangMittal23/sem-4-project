import logging
from datetime import datetime

def setup_logger(name: str):
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    
    return logger

def log_request(endpoint: str, method: str, user_id: int = None):
    logger = setup_logger("request_logger")
    logger.info(f"{method} {endpoint} - User: {user_id} - Time: {datetime.utcnow()}")
