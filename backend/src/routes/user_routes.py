from typing import Any
from fastapi import APIRouter, Request, Response, status
from fastapi.responses import JSONResponse
import logging

from clients.wristband_client import WristbandApiClient
from models.user import User, UserProfileUpdate, PasswordChangeRequest

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
        return await wristband_client.update_user(
            user_id=user_id,
            user_data=profile_data,
            access_token=access_token
        )
    except Exception as e:
        logger.exception(f"Error updating current user profile: {str(e)}")
        raise

@router.post('/me/change-password')
async def change_current_user_password(request: Request, password_data: PasswordChangeRequest) -> Response:
    try:
        # Get user ID and access token from session
        session_data = request.state.session.get()
        user_id = session_data.user_id
        access_token = session_data.access_token
        
        # Change password using the Wristband API
        return await wristband_client.change_password(
            user_id=user_id,
            current_password=password_data.currentPassword,
            new_password=password_data.newPassword,
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