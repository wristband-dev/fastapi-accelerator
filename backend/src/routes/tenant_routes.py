from typing import Any
from fastapi import APIRouter, Request, Response, status
from fastapi.responses import JSONResponse
import logging

from clients.wristband_client import WristbandApiClient
from models.tenant import Tenant, TenantUpdateRequest

router = APIRouter()
logger = logging.getLogger(__name__)
wristband_client = WristbandApiClient()

@router.get('/me', response_model=Tenant)
async def get_current_tenant(request: Request) -> Tenant:
    """
    Get the current user's tenant information
    """
    try:
        # Get tenant ID and access token from session
        session_data = request.state.session.get()
        tenant_id = session_data.tenant_id
        access_token = session_data.access_token
        
        # Get tenant info using the Wristband API
        return await wristband_client.get_tenant(
            tenant_id=tenant_id,
            access_token=access_token
        )
    except Exception as e:
        logger.exception(f"Error fetching current tenant info: {str(e)}")
        raise

@router.patch('/me', response_model=Tenant)
async def update_current_tenant(request: Request, tenant_data: TenantUpdateRequest) -> Tenant:
    """
    Update the current user's tenant information
    """
    try:
        # Get tenant ID and access token from session
        session_data = request.state.session.get()
        tenant_id = session_data.tenant_id
        access_token = session_data.access_token
        
        # Update tenant using the Wristband API
        return await wristband_client.update_tenant(
            tenant_id=tenant_id,
            tenant_data=tenant_data,
            access_token=access_token
        )
    except ValueError as e:
        # Wristband API error - could be invalid data or validation errors
        error_msg = str(e)
        if "400" in error_msg:
            logger.warning(f"Tenant update failed for tenant {session_data.tenant_id}: {error_msg}")
            # Check for specific validation errors
            if "logoUrl" in error_msg or "logo" in error_msg.lower():
                return JSONResponse(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    content={"error": "invalid_logo_url", "message": "The provided logo URL is invalid or inaccessible."}
                )
            else:
                return JSONResponse(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    content={"error": "invalid_tenant_data", "message": "The provided tenant data is invalid. Please check your inputs."}
                )
        else:
            logger.exception(f"Error updating tenant for tenant {session_data.tenant_id}: {error_msg}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"error": "internal_error", "message": "An unexpected error occurred while updating the tenant."}
            )
    except Exception as e:
        logger.exception(f"Unexpected error updating tenant: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "internal_error", "message": "An unexpected error occurred while updating the tenant."}
        )