
from typing import Optional
from fastapi import APIRouter, Request, status
from fastapi.responses import JSONResponse
import logging

from database.firestore_database import set_document
from models.secret import Secret

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post('/upsert', 
# response_model=
)
async def upsert_secret(request: Request, secret_request: Secret):
    """
    Upsert (create or update) a secret for the current tenant
    """
    try:
        # Get tenant ID and access token from session
        session_data = request.state.session.get()
        tenant_id = session_data.tenant_id
        
        # Update the secret in firestore
        set_document(
            collection_path=f"tenants/{tenant_id}/secrets",
            doc_id=secret_request.sku,
            data=secret_request.model_dump()
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

@router.get('/okta', response_model=Optional[IdentityProvider])
async def get_okta_identity_provider(request: Request):
    """
    Get the Okta identity provider configuration for the current tenant
    """
    try:
        # Get tenant ID and access token from session
        session_data = request.state.session.get()
        tenant_id = session_data.tenant_id
        access_token = session_data.access_token
        
        # Get all identity providers for the tenant
        idps = await wristband_client.get_identity_providers(
            tenant_id=tenant_id,
            access_token=access_token
        )
        
        # Find the Okta IDP
        okta_idp = next((idp for idp in idps if idp.type == 'OKTA'), None)
        
        if not okta_idp:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"error": "not_found", "message": "No Okta identity provider found for this tenant."}
            )
        
        return okta_idp
        
    except Exception as e:
        logger.exception(f"Error fetching Okta IDP: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "internal_error", "message": "An unexpected error occurred while fetching the identity provider."}
        )