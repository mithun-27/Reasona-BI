import duckdb
import os

DB_PATH = "reasona_bi.duckdb"

def get_db_connection():
    """Returns a connection to the DuckDB database."""
    conn = duckdb.connect(database=DB_PATH, read_only=False)
    # Initialize basic schema if needed
    conn.execute('''
        CREATE TABLE IF NOT EXISTS uploads (
            id VARCHAR PRIMARY KEY,
            filename VARCHAR,
            upload_time TIMESTAMP,
            table_name VARCHAR
        )
    ''')
    return conn
