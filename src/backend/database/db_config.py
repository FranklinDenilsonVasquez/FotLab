import os
from urllib.parse import urlparse
from dotenv import load_dotenv
import psycopg2

# Load environment variables
load_dotenv()

def get_db_config():
    db_url = os.getenv('DATABASE_PUBLIC_URL') or os.getenv('DATABASE_URL')
    if db_url:
        parsed = urlparse(db_url)
        return {
            'host': parsed.hostname,
            'port': parsed.port or 5432,
            'user': parsed.username,
            'password': parsed.password,
            'database': parsed.path.lstrip('/')
        }

    return {
        'host': os.getenv('PGHOST'),
        'port': os.getenv('PGPORT', 5432),
        'user': os.getenv('PGUSER'),
        'password': os.getenv('PGPASSWORD'),
        'database': os.getenv('PGDATABASE')
    }
