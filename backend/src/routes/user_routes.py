from typing import Any
from fastapi import APIRouter, Request, Response, status
from fastapi.responses import JSONResponse
import logging

from clients.wristband_client import WristbandApiClient

router = APIRouter()
logger = logging.getLogger(__name__)
wristband_client = WristbandApiClient()

@router.get('/info/{user_id}')
async def get_user_info(request: Request, user_id: str) -> Response:
    try:
        # Get access token from session or request
        session_data = request.state.session.get()
        access_token = session_data.access_token
        
        user_info: dict[str, Any] = await wristband_client.get_user_info(
            user_id=user_id,
            access_token=access_token
        )
        
        return JSONResponse(content=user_info)
    except Exception as e:
        logger.exception(f"Error fetching user info for user {user_id}: {str(e)}")
        return Response(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)