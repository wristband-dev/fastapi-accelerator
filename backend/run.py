# Standard library imports
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import logging
import uvicorn
import os

# Load environment variables BEFORE local imports
load_dotenv()

# Local imports
from middleware.auth_middleware import AuthMiddleware
from middleware.session_middleware import EncryptedSessionMiddleware
from routes import router as all_routes

def create_app() -> FastAPI:
    app = FastAPI()

    # Set up logging
    if not logging.getLogger().hasHandlers():
        logging.basicConfig(level=logging.INFO, format="[%(asctime)s] %(levelname)s in %(name)s: %(message)s")

    ########################################################################################
    # IMPORTANT: FastAPI middleware runs in reverse order of the way it is added below!!
    ########################################################################################

    # 1) Add the auth middleware to the app  
    app.add_middleware(AuthMiddleware)

    # 2) Add session middleware
    is_production = os.getenv('ENVIRONMENT') == 'PROD'
    app.add_middleware(
        EncryptedSessionMiddleware,
        cookie_name="session",
        secret_key="a8f5f167f44f4964e6c998dee827110c",
        max_age=1800,  # 30 minutes
        path="/",
        same_site="lax",
        secure=is_production  # True in production for HTTPS
    )

    # 3) Add CORS middleware
    # Get allowed origins from environment or use defaults
    domain = os.getenv('DOMAIN', 'localhost:3001')
    allowed_origins = [
        f"https://{domain}",
        f"http://{domain}",
        "http://localhost:3001",  # Keep for local development
        "https://localhost:3001"
    ]
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"]
    )
    
    # Include API routers
    app.include_router(all_routes)

    return app

# This app instance is used when imported by Uvicorn
app = create_app()

if __name__ == '__main__':
    # For Cloud Run, we need to bind to 0.0.0.0 and use the PORT environment variable
    host = "0.0.0.0" if os.getenv('ENVIRONMENT') == 'PROD' else "localhost"
    port = int(os.getenv('PORT', 8080)) if os.getenv('ENVIRONMENT') == 'PROD' else 6001
    reload = os.getenv('ENVIRONMENT') != 'PROD'
    
    uvicorn.run("run:app", host=host, port=port, reload=reload)
