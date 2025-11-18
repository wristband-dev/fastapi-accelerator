# Standard library imports
import logging
from fastapi import APIRouter, Depends, status 
from fastapi.routing import APIRouter
from fastapi.responses import JSONResponse

# Local imports
from auth.wristband import require_session_auth
from services.wristband_service import get_wristband_service, WristbandService
from models.wristband.user import User
from models.wristband.invite import NewUserInvitationRequest


logger = logging.getLogger(__name__)
router = APIRouter(dependencies=[Depends(require_session_auth)])


@router.get('', response_model=list[User])
async def get_users(svc: WristbandService = Depends(get_wristband_service)) -> list[User]:
    try:
        return await svc.get_users()
    except Exception as e:
        logger.exception(f"Error fetching users: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "internal_error", "message": "An unexpected error occurred while fetching users."}
        )


@router.get('/invitations/pending', response_model=list[NewUserInvitationRequest])
async def get_pending_invitations(svc: WristbandService = Depends(get_wristband_service)) -> list[NewUserInvitationRequest]:
    try:
        return await svc.get_pending_invitations()
    except Exception as e:
        logger.exception(f"Error querying pending invitations: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "internal_error", "message": "An unexpected error occurred while fetching pending invitations."}
        )
