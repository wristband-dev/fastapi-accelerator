from typing import Any, Optional
from fastapi import APIRouter, Request, Response, Query
from fastapi.responses import JSONResponse
from fastapi import status
import logging

from clients.wristband_client import WristbandApiClient
from models.user import UserList

router = APIRouter()
logger = logging.getLogger(__name__)
wristband_client = WristbandApiClient()

@router.get('', response_model=UserList)
async def get_users(
    request: Request,
    page_size: int = Query(10, description="Number of users per page", ge=1, le=100)
) -> UserList:
    """
    Query users scoped to a tenant using the Wristband querytenantusersv1 API.
    
    This endpoint retrieves a list of users within the current tenant with page size support.
    """
    try:
        # Get session data including access token and tenant ID
        session_data = request.state.session.get()
        access_token = session_data.access_token
        tenant_id = session_data.tenant_id
        
        # Query tenant users using the Wristband API - returns validated UserList
        return await wristband_client.query_tenant_users(
            tenant_id=tenant_id,
            access_token=access_token,
            page=1,
            page_size=page_size
        )
    
    except Exception as e:
        logger.exception(f"Error querying tenant users: {str(e)}")
        raise
