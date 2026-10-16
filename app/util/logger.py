# logger.py
import logging
import os
import queue
import sys
from logging.handlers import QueueHandler, QueueListener, RotatingFileHandler
from common.config import settings

# 1. Ensure the logs directory exists
LOG_DIR = settings.LOG_DIR
os.makedirs(LOG_DIR, exist_ok=True)
LOG_FILE_PATH = os.path.join(LOG_DIR, "app.log")

# 2. Initialize the root logger
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# 3. Setup the non-blocking QueueHandler
log_queue = queue.Queue()
queue_handler = QueueHandler(log_queue)
formatter = logging.Formatter("%(asctime)s - %(name)s - [%(funcName)s] - %(levelname)s - %(message)s")
queue_handler.setFormatter(formatter)
logger.addHandler(queue_handler)

# 4. Setup the blocking file handler
file_handler = RotatingFileHandler(LOG_FILE_PATH, maxBytes=10*1024*1024, backupCount=5)
file_handler.setFormatter(formatter)

# 5. Setup the console handler (writes to terminal)
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setFormatter(formatter)

# 6. Pass BOTH handlers into the background listener
# Now logs will be sent to both the file and the terminal simultaneously
queue_listener = QueueListener(log_queue, file_handler, console_handler)
queue_listener.start()
