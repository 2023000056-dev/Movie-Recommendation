import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os
from dotenv import load_dotenv

load_dotenv()

def create_database():
    # This tries to connect to the default 'postgres' database to create the 'movies_db'
    db_url = os.getenv("DATABASE_URL")
    # Example: postgresql://postgres:password@localhost:5432/movies_db
    
    # Split the URL to get components
    # Just a simple hack to get the base connection
    base_url = db_url.rsplit('/', 1)[0] + '/postgres'
    
    try:
        conn = psycopg2.connect(base_url)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        
        # Check if database exists
        cur.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'movies_db'")
        exists = cur.fetchone()
        if not exists:
            cur.execute('CREATE DATABASE movies_db')
            print("Database 'movies_db' created successfully!")
        else:
            print("Database 'movies_db' already exists.")
            
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error creating database: {e}")
        print("\nPlease update your DATABASE_URL in the .env file with correct credentials.")

if __name__ == "__main__":
    create_database()
