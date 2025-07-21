from typing import Any
from fastapi import APIRouter, Request, Response, status
from fastapi.responses import JSONResponse
import logging

from clients.wristband_client import WristbandApiClient
from models.identity_provider import IdentityProvider, UpsertIdpRequest

router = APIRouter()
logger = logging.getLogger(__name__)
wristband_client = WristbandApiClient()

@router.post('/upsert', response_model=IdentityProvider)
async def upsert_identity_provider(request: Request, idp_request: UpsertIdpRequest) -> IdentityProvider:
    """
    Upsert (create or update) an identity provider for the current tenant
    """
    try:
        # Get tenant ID and access token from session
        session_data = request.state.session.get()
        tenant_id = session_data.tenant_id
        access_token = session_data.access_token
        
        # Ensure the IDP is configured for the current tenant
        idp_data = idp_request.idp
        idp_data.ownerId = tenant_id
        
        # First, enable IDP override toggle for the tenant
        await wristband_client.upsert_idp_override_toggle(
            tenant_id=tenant_id,
            access_token=access_token
        )
        
        # Then upsert the identity provider
        return await wristband_client.upsert_identity_provider(
            idp_data=idp_data,
            access_token=access_token
        )
    except ValueError as e:
        # Wristband API error - could be invalid data or validation errors
        error_msg = str(e)
        if "400" in error_msg:
            logger.warning(f"IDP upsert failed for tenant {session_data.tenant_id}: {error_msg}")
            # Check for specific validation errors
            if "domainName" in error_msg or "domain" in error_msg.lower():
                return JSONResponse(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    content={"error": "invalid_domain_name", "message": "The provided domain name is invalid or already in use."}
                )
            else:
                return JSONResponse(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    content={"error": "invalid_idp_data", "message": "The provided identity provider data is invalid. Please check your inputs."}
                )
        elif "401" in error_msg or "403" in error_msg:
            logger.warning(f"IDP upsert unauthorized for tenant {session_data.tenant_id}: {error_msg}")
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"error": "permission_denied", "message": "You are not authorized to configure identity providers."}
            )
        else:
            logger.exception(f"Error upserting IDP for tenant {session_data.tenant_id}: {error_msg}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"error": "internal_error", "message": "An unexpected error occurred while configuring the identity provider."}
            )
    except Exception as e:
        logger.exception(f"Unexpected error upserting IDP: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "internal_error", "message": "An unexpected error occurred while configuring the identity provider."}
        )