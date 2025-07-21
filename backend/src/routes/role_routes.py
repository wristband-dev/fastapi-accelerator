from typing import List
from fastapi import APIRouter, Request, status
from fastapi.responses import JSONResponse
import logging

from clients.wristband_client import WristbandApiClient
from models.role import Role

router = APIRouter()
logger = logging.getLogger(__name__)
wristband_client = WristbandApiClient()

@router.get('/', response_model=List[Role])
async def get_tenant_roles(request: Request):
    """
    Get all roles available for the current tenant
    """
    try:
        # Get tenant ID and access token from session
        session_data = request.state.session.get()
        tenant_id = session_data.tenant_id
        access_token = session_data.access_token
        
        # Fetch roles from Wristband
        roles = await wristband_client.query_tenant_roles(
            tenant_id=tenant_id,
            access_token=access_token
        )
        
        logger.info(f"Successfully fetched {len(roles)} roles for tenant: {tenant_id}")
        return roles
        
    except Exception as e:
        logger.exception(f"Error fetching tenant roles: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "internal_error", "message": "An unexpected error occurred while fetching roles."}
        )