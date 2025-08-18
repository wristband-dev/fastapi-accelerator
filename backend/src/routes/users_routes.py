from typing import Any, Optional
from fastapi import APIRouter, Request, Response, Query
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
        
        # If roles are provided, validate they exist by querying tenant roles
        roles_to_assign = []
        if invite_request.roles:
            # Get available roles to validate the provided roles exist
            available_roles = await wristband_client.query_tenant_roles(
                tenant_id=tenant_id,
                access_token=access_token
            )
            available_role_skus = {role.sku for role in available_roles}
            
            # Filter to only include valid roles
            roles_to_assign = [role for role in invite_request.roles if role in available_role_skus]
            
            if not roles_to_assign:
                logger.warning(f"No valid roles found from provided roles: {invite_request.roles}")
        
        # Invite the user using the Wristband API
        await wristband_client.invite_user(
            tenant_id=tenant_id,
            email=invite_request.email,
            roles_to_assign=roles_to_assign,
            access_token=access_token
        )
        
        return InviteUserResponse(
            message="User invitation sent successfully",
            email=invite_request.email,
            roles_assigned=roles_to_assign
        )
    
    except Exception as e:
        logger.exception(f"Error inviting user: {str(e)}")
        raise
