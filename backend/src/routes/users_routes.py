from typing import Any, Optional
from fastapi import APIRouter, Request, Response, Query, HTTPException
from fastapi.responses import JSONResponse
from fastapi import status
import logging

from clients.wristband_client import WristbandClient
from models.user import User
from models.invite import InviteUserRequest, InviteUserResponse, NewUserInvitationRequest

router = APIRouter()
logger = logging.getLogger(__name__)
wristband_client = WristbandClient()

@router.get('', response_model=list[User])
async def get_users(request: Request) -> list[User]:
    try:
        # Get session data including access token and tenant ID
        session_data = request.state.session.get()
        access_token = session_data.access_token
        tenant_id = session_data.tenant_id
        
        # Query tenant users using the Wristband API - returns validated UserList
        return await wristband_client.query_tenant_users(
            tenant_id=tenant_id,
            access_token=access_token,
            include_roles=True
        )
    
    except ValueError as e:
        error_str = str(e)
        # Handle 403 Forbidden errors gracefully - user doesn't have admin permissions
        if "403" in error_str and "unauthorized" in error_str.lower():
            logger.warning(f"User {session_data.user_id} attempted to access users list without admin permissions")
            raise HTTPException(status_code=403, detail="Insufficient permissions to view users")
        else:
            logger.exception(f"Error querying tenant users: {error_str}")
            raise
    except Exception as e:
        logger.exception(f"Error querying tenant users: {str(e)}")
        raise

@router.post('/invite', response_model=InviteUserResponse)
async def invite_user(request: Request, invite_request: InviteUserRequest) -> InviteUserResponse:
    try:
        # Get session data including access token and tenant ID
        session_data = request.state.session.get()
        access_token = session_data.access_token
        tenant_id = session_data.tenant_id
        
        # If roles are provided, convert SKUs to role IDs for Wristband API
        role_ids_to_assign = []
        if invite_request.roles:
            # Get available roles to convert SKUs to IDs
            available_roles = await wristband_client.query_tenant_roles(
                tenant_id=tenant_id,
                access_token=access_token
            )
            
            # Create mapping from SKU to role ID
            sku_to_id_map = {role.sku: role.id for role in available_roles}
            
            # Convert role SKUs to role IDs
            for role_sku in invite_request.roles:
                if role_sku in sku_to_id_map:
                    role_ids_to_assign.append(sku_to_id_map[role_sku])
                else:
                    logger.warning(f"Role SKU not found: {role_sku}")
            
            if not role_ids_to_assign:
                logger.warning(f"No valid roles found from provided roles: {invite_request.roles}")
        
        # Invite the user using the Wristband API
        await wristband_client.invite_user(
            tenant_id=tenant_id,
            email=invite_request.email,
            roles_to_assign=role_ids_to_assign,
            access_token=access_token
        )
        
        return InviteUserResponse(
            message="User invitation sent successfully",
            email=invite_request.email,
            roles_assigned=invite_request.roles  # Return original SKUs for frontend display
        )
    
    except ValueError as e:
        error_str = str(e)
        # Handle 403 Forbidden errors gracefully - user doesn't have admin permissions
        if "403" in error_str and "unauthorized" in error_str.lower():
            logger.warning(f"User {session_data.user_id} attempted to invite user without admin permissions")
            raise HTTPException(status_code=403, detail="Insufficient permissions to invite users")
        else:
            logger.exception(f"Error inviting user: {error_str}")
            raise
    except Exception as e:
        logger.exception(f"Error inviting user: {str(e)}")
        raise

@router.get('/invitations/pending', response_model=list[NewUserInvitationRequest])
async def get_pending_invitations(request: Request) -> list[NewUserInvitationRequest]:
    """
    Get pending user invitations for the current tenant
    """
    try:
        # Get session data including access token and tenant ID
        session_data = request.state.session.get()
        access_token = session_data.access_token
        tenant_id = session_data.tenant_id
        
        # Query new user invitation requests using the Wristband API
        all_invitations = await wristband_client.query_new_user_invitation_requests(
            tenant_id=tenant_id,
            access_token=access_token
        )
        
        # Filter to only return pending invitations (not cancelled, expired, or accepted)
        pending_invitations = [
            invitation for invitation in all_invitations 
            if invitation.status in ['PENDING_INVITE_ACCEPTANCE', 'PENDING_EMAIL_VERIFICATION']
        ]
        
        return pending_invitations
    
    except ValueError as e:
        error_str = str(e)
        # Handle 403 Forbidden errors gracefully - user doesn't have admin permissions
        if "403" in error_str and "unauthorized" in error_str.lower():
            logger.warning(f"User {session_data.user_id} attempted to access pending invitations without admin permissions")
            raise HTTPException(status_code=403, detail="Insufficient permissions to view pending invitations")
        else:
            logger.exception(f"Error querying pending invitations: {error_str}")
            raise
    except Exception as e:
        logger.exception(f"Error querying pending invitations: {str(e)}")
        raise

@router.delete('/invitations/{invitation_id}', status_code=204)
async def cancel_invitation(request: Request, invitation_id: str) -> None:
    """
    Cancel a pending user invitation
    """
    try:
        # Get session data including access token
        session_data = request.state.session.get()
        access_token = session_data.access_token
        
        # Cancel the invitation using the Wristband API
        await wristband_client.cancel_new_user_invitation(
            invitation_id=invitation_id,
            access_token=access_token
        )
        
        logger.info(f"Successfully cancelled invitation: {invitation_id}")
        
    except ValueError as e:
        error_str = str(e)
        # Handle 403 Forbidden errors gracefully - user doesn't have admin permissions
        if "403" in error_str and "unauthorized" in error_str.lower():
            logger.warning(f"User {session_data.user_id} attempted to cancel invitation without admin permissions")
            raise HTTPException(status_code=403, detail="Insufficient permissions to cancel invitations")
        else:
            logger.exception(f"Error cancelling invitation: {error_str}")
            raise
    except Exception as e:
        logger.exception(f"Error cancelling invitation {invitation_id}: {str(e)}")
        raise

@router.delete('/{user_id}', status_code=204)
async def delete_user(request: Request, user_id: str) -> None:
    """
    Permanently delete a user from the system
    """
    try:
        # Get session data including access token
        session_data = request.state.session.get()
        access_token = session_data.access_token
        
        # Delete the user using the Wristband API
        await wristband_client.delete_user(
            user_id=user_id,
            access_token=access_token
        )
        
        logger.info(f"Successfully deleted user: {user_id}")
        
    except ValueError as e:
        error_str = str(e)
        # Handle 403 Forbidden errors gracefully - user doesn't have admin permissions
        if "403" in error_str and "unauthorized" in error_str.lower():
            logger.warning(f"User {session_data.user_id} attempted to delete user without admin permissions")
            raise HTTPException(status_code=403, detail="Insufficient permissions to delete users")
        else:
            logger.exception(f"Error deleting user: {error_str}")
            raise
    except Exception as e:
        logger.exception(f"Error deleting user {user_id}: {str(e)}")
        raise
