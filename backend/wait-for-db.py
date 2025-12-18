#!/usr/bin/env python
import os
import time
import MySQLdb
import sys

def wait_for_db():
    db_host = os.getenv('DB_HOST', 'localhost')
    db_port = int(os.getenv('DB_PORT', '3306'))
    db_user = os.getenv('DB_USER', 'myapp_user')
    db_password = os.getenv('DB_PASSWORD', 'myapp_password')
    db_name = os.getenv('DB_NAME', 'myapp_db')
    
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