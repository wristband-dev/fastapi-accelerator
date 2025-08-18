from typing import Any, Optional
from fastapi import APIRouter, Request, Response, Query, HTTPException
from fastapi.responses import JSONResponse
from fastapi import status
import logging

from clients.wristband_client import WristbandApiClient
from models.user import User
from models.invite import InviteUserRequest, InviteUserResponse

router = APIRouter()
logger = logging.getLogger(__name__)
wristband_client = WristbandApiClient()

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

@router.patch('/{user_id}/deactivate', response_model=User)
async def deactivate_user(request: Request, user_id: str) -> User:
    """
    Deactivate a user by setting their status to INACTIVE
    """
    try:
        # Get session data including access token
        session_data = request.state.session.get()
        access_token = session_data.access_token
        
        # Deactivate the user using the Wristband API
        deactivated_user = await wristband_client.deactivate_user(
            user_id=user_id,
            access_token=access_token
        )
        
        logger.info(f"Successfully deactivated user: {user_id}")
        return deactivated_user
        
    except Exception as e:
        logger.exception(f"Error deactivating user {user_id}: {str(e)}")
        raise
