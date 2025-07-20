from typing import Any
from fastapi import APIRouter, Request, Response, status
from fastapi.responses import JSONResponse
import logging

from clients.wristband_client import WristbandApiClient
from models.user import User

router = APIRouter()
logger = logging.getLogger(__name__)
wristband_client = WristbandApiClient()

@router.get('/{user_id}', response_model=User)
async def get_user_info(request: Request, user_id: str) -> User:
    try:
        # Get access token from session or request
        session_data = request.state.session.get()
        access_token = session_data.access_token
        
        # Get user info using the Wristband API - returns validated User
        return await wristband_client.get_user_info(
            user_id=user_id,
            access_token=access_token
        )
    except Exception as e:
        logger.exception(f"Error fetching user info for user {user_id}: {str(e)}")
        raise