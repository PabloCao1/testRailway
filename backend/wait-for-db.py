#!/usr/bin/env python
import os
import time
import MySQLdb
import sys
from urllib.parse import urlparse


def parse_url():
    url = os.getenv('MYSQL_URL') or os.getenv('DATABASE_URL')
    if not url:
        return {}

    parsed = urlparse(url)
    return {
        'host': parsed.hostname,
        'port': parsed.port,
        'user': parsed.username,
        'password': parsed.password,
        'name': (parsed.path or '').lstrip('/') or None,
    }


def wait_for_db():
    fallback = parse_url()

    db_host = os.getenv('DB_HOST') or fallback.get('host') or 'localhost'
    db_port = int(os.getenv('DB_PORT') or fallback.get('port') or 3306)
    db_user = os.getenv('DB_USER') or fallback.get('user') or 'myapp_user'
    db_password = os.getenv('DB_PASSWORD') or fallback.get('password') or 'myapp_password'
    db_name = os.getenv('DB_NAME') or fallback.get('name') or 'myapp_db'

    max_retries = 30
    retry_count = 0

    while retry_count < max_retries:
        try:
            conn = MySQLdb.connect(
                host=db_host,
                port=db_port,
                user=db_user,
                passwd=db_password,
                db=db_name
            )
            conn.close()
            print("Database is ready!")
            return True
        except Exception as e:
            retry_count += 1
            print(f"Database not ready (attempt {retry_count}/{max_retries}): {e}")
            time.sleep(2)

    print("Database connection failed after maximum retries")
    sys.exit(1)


if __name__ == "__main__":
    wait_for_db()
