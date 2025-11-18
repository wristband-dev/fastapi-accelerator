# Standard library imports
import logging
from fastapi import APIRouter, Depends, status 
from fastapi.routing import APIRouter
from fastapi.responses import JSONResponse

# Local imports
from auth.wristband import require_session_auth
from services.wristband_service import get_wristband_service, WristbandService
from models.wristband.role import Role


logger = logging.getLogger(__name__)
router = APIRouter(dependencies=[Depends(require_session_auth)])


@router.get('', response_model=list[Role])
async def get_tenant_roles(svc: WristbandService = Depends(get_wristband_service)):
    try:
        return await svc.get_roles()
    except Exception as e:
        logger.exception(f"Error fetching roles: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "internal_error", "message": "An unexpected error occurred while fetching roles."}
        )