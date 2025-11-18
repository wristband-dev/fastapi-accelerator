# Standard library imports
import logging
from fastapi import APIRouter, Depends, status 
from fastapi.routing import APIRouter
from fastapi.responses import JSONResponse

# Local imports
from auth.wristband import require_session_auth
from services.wristband_service import get_wristband_service, WristbandService
from models.wristband.tenant import (
    Tenant,
    TenantUpdateRequest,
    TenantOption,
)


logger = logging.getLogger(__name__)
router = APIRouter(dependencies=[Depends(require_session_auth)])


@router.patch('/me', response_model=Tenant)
async def update_current_tenant(
    tenant_data: TenantUpdateRequest,
    svc: WristbandService = Depends(get_wristband_service),
):
    try:
        logger.info(f"Updating tenant info: {tenant_data.model_dump(by_alias=True, exclude_unset=True)}")
        return await svc.update_tenant_info(tenant_data)
    except Exception as e:
        logger.exception(f"Unexpected error updating tenant: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "internal_error", "message": "An unexpected error occurred while updating the tenant."}
        )

@router.get('/me', response_model=Tenant)
async def get_current_tenant(svc: WristbandService = Depends(get_wristband_service)):
    """Get the current user's tenant information"""
    try:        
        return await svc.get_tenant_info()
    except Exception as e:
        logger.exception(f"Error fetching current tenant info: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "internal_error", "message": "An unexpected error occurred while fetching current tenant info."}
        )

@router.get('/options', response_model=list[TenantOption])
async def get_tenant_options(svc: WristbandService = Depends(get_wristband_service)):
    try:
        return await svc.get_tenant_options()
    except Exception as e:
        logger.exception(f"Error fetching tenant options: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "internal_error", "message": "An unexpected error occurred while fetching tenant options."}
        )