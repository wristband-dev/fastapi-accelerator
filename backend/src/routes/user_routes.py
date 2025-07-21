from typing import Any
from fastapi import APIRouter, Request, Response, status
from fastapi.responses import JSONResponse
import logging

from clients.wristband_client import WristbandApiClient
from models.user import User, UserProfileUpdate

router = APIRouter()
logger = logging.getLogger(__name__)
wristband_client = WristbandApiClient()

@router.get('/me', response_model=User)
async def get_current_user(request: Request) -> User:
    try:
        # Get user ID and access token from session
        session_data = request.state.session.get()
        user_id = session_data.user_id
        access_token = session_data.access_token
        
        # Get user info using the Wristband API - returns validated User
        return await wristband_client.get_user_info(
            user_id=user_id,
            access_token=access_token,
            include_roles=True
        )
    except Exception as e:
        logger.exception(f"Error fetching current user info: {str(e)}")
        raise

@router.patch('/me', response_model=User)
async def update_current_user_profile(request: Request, profile_data: UserProfileUpdate) -> User:
    try:
        # Get user ID and access token from session
        session_data = request.state.session.get()
        user_id = session_data.user_id
        access_token = session_data.access_token
        
        # Update user profile using the Wristband API
        return await wristband_client.update_user_profile(
            user_id=user_id,
            given_name=profile_data.givenName,
            family_name=profile_data.familyName,
            access_token=access_token
        )
    except Exception as e:
        logger.exception(f"Error updating current user profile: {str(e)}")
        raise

@router.get('/{user_id}', response_model=User)
async def get_user_info(request: Request, user_id: str) -> User:
    try:
        # Get access token from session or request
        session_data = request.state.session.get()
        access_token = session_data.access_token
        
        # Get user info using the Wristband API - returns validated User
        return await wristband_client.get_user_info(
            user_id=user_id,
            access_token=access_token,
            include_roles=True
        )
    except Exception as e:
        logger.exception(f"Error fetching user info for user {user_id}: {str(e)}")
        raise