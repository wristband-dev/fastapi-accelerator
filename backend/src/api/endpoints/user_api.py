# Standard library imports
import logging
from fastapi import APIRouter, Depends, status 
from fastapi.routing import APIRouter
from fastapi.responses import JSONResponse

# Local imports
from auth.wristband import require_session_auth
from services.wristband_service import get_wristband_service, WristbandService
from models.wristband.user import (
    User,
    UpdateNameRequest,
    PasswordChangeRequest,
)
from models.wristband.role import Role
from models.wristband.invite import InviteUserRequest
from models.wristband.role import UpdateUserRolesRequest


logger = logging.getLogger(__name__)
router = APIRouter(dependencies=[Depends(require_session_auth)])


@router.get('/me', response_model=User)
async def get_current_user(svc: WristbandService = Depends(get_wristband_service)):
    try:
        return await svc.get_user_info()
    except Exception as e:
        logger.exception(f"Error fetching current user info: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "internal_error", "message": "An unexpected error occurred while fetching user info."}
        )

@router.patch('/me', response_model=User)
async def update_current_user_profile(
    update_name_request: UpdateNameRequest,
    svc: WristbandService = Depends(get_wristband_service)
):
    try:
        return await svc.update_user_profile(update_name_request)
    except Exception as e:
        logger.exception(f"Error updating current user profile: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "internal_error", "message": "An unexpected error occurred while updating user profile."}
        )

@router.post('/me/change-password')
async def change_current_user_password(
    password_data: PasswordChangeRequest,
    svc: WristbandService = Depends(get_wristband_service)
):
    try:
        return await svc.change_user_password(password_data)
    except Exception as e:
        logger.exception(f"Error changing user password: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "internal_error", "message": "An unexpected error occurred while changing user password."}
        )

@router.get('/me/roles', response_model=list[Role])
async def get_current_user_roles(svc: WristbandService = Depends(get_wristband_service)):
    try:
        return await svc.get_user_roles()
    except Exception as e:
        logger.exception(f"Error fetching user roles: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "internal_error", "message": "An unexpected error occurred while fetching user roles."}
        )

@router.post('/invite', status_code=status.HTTP_204_NO_CONTENT)
async def invite_user(
    invite_request: InviteUserRequest,
    svc: WristbandService = Depends(get_wristband_service)
):
    try:
        await svc.invite_user(invite_request.email, invite_request.roles)
    except Exception as e:
        logger.exception(f"Error inviting user: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "internal_error", "message": "An unexpected error occurred while inviting user."}
        )

@router.delete('/invitations/{invitation_id}', status_code=204)
async def cancel_invitation(
    invitation_id: str, 
    svc: WristbandService = Depends(get_wristband_service)
) -> None:
    try:
        await svc.cancel_invitation(invitation_id)
    except Exception as e:
        logger.exception(f"Error cancelling invitation {invitation_id}: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "internal_error", "message": "An unexpected error occurred while cancelling invitation."}
        )

@router.put('/{user_id}/roles', status_code=status.HTTP_204_NO_CONTENT)
async def update_user_roles(
    user_id: str,
    role_request: UpdateUserRolesRequest,
    svc: WristbandService = Depends(get_wristband_service)
) -> None:
    try:
        await svc.update_user_roles(user_id, role_request.new_role_ids, role_request.existing_role_ids)
    except Exception as e:
        logger.exception(f"Error updating user roles: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "internal_error", "message": "An unexpected error occurred while updating user roles."}
        )

@router.delete('/{user_id}', status_code=204)
async def delete_user(user_id: str, svc: WristbandService = Depends(get_wristband_service)) -> None:
    try:
        await svc.delete_user(user_id)
    except Exception as e:
        logger.exception(f"Error deleting user: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "internal_error", "message": "An unexpected error occurred while deleting user."}
        )



# @router.get('/{user_id}', response_model=User)
# async def get_user_info(user_id: str, svc: WristbandService = Depends(get_wristband_service)) -> User:
#     try:
#         return await svc.get_user_info(user_id)
#     except Exception as e:
#         logger.exception(f"Error fetching user info for user {user_id}: {str(e)}")
#         return JSONResponse(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             content={"error": "internal_error", "message": "An unexpected error occurred while fetching user info."}
#         )
