# Standard library imports
import logging
from fastapi import APIRouter, Depends, status, Body
from fastapi.responses import JSONResponse
from typing import Dict, Any

# Local imports
from auth.wristband import require_session_auth
from services.wristband_service import get_wristband_service, WristbandService
from models.wristband.idp import UpsertGoogleSamlMetadata, UpsertOktaIdpRequest


logger = logging.getLogger(__name__)
router = APIRouter(dependencies=[Depends(require_session_auth)])


@router.get('/providers')
async def get_identity_providers(svc: WristbandService = Depends(get_wristband_service)):
    try:
        return await svc.get_identity_providers()
    except Exception as e:
        logger.exception(f"Error fetching identity providers: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "internal_error", "message": "An unexpected error occurred while fetching identity providers."}
        )

@router.post('/google/saml/upsert', status_code=status.HTTP_204_NO_CONTENT)
async def upsert_google_saml(
    request_data: Dict[str, Any] = Body(...),
    svc: WristbandService = Depends(get_wristband_service)
):
    try:
        # Frontend sends {metadata: {...fields...}}
        metadata_dict = request_data.get('metadata', {})
        metadata = UpsertGoogleSamlMetadata(**metadata_dict)
        await svc.upsert_google_saml_idp(metadata)
    except Exception as e:
        logger.exception(f"Error upserting Google SAML IDP: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "internal_error", "message": "An unexpected error occurred while configuring Google SSO."}
        )

@router.post('/okta/upsert', status_code=status.HTTP_204_NO_CONTENT)
async def upsert_okta(
    request_data: UpsertOktaIdpRequest = Body(...),
    svc: WristbandService = Depends(get_wristband_service)
):
    try:
        await svc.upsert_okta_idp(
            domain_name=request_data.domain_name,
            client_id=request_data.client_id,
            client_secret=request_data.client_secret,
            enabled=request_data.enabled
        )
    except Exception as e:
        logger.exception(f"Error upserting Okta IDP: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "internal_error", "message": "An unexpected error occurred while configuring Okta SSO."}
        )

@router.get('/okta/redirect-url')
async def get_okta_redirect_url(svc: WristbandService = Depends(get_wristband_service)):
    try:
        redirect_url = await svc.get_okta_redirect_url()
        if not redirect_url:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"error": "not_found", "message": "No Okta redirect URL found."}
            )
        return {"redirectUrl": redirect_url}
    except Exception as e:
        logger.exception(f"Error fetching Okta redirect URL: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "internal_error", "message": "An unexpected error occurred while fetching redirect URL."}
        )

@router.post('/okta/test-connection')
async def test_okta_connection(svc: WristbandService = Depends(get_wristband_service)):
    try:
        ok = await svc.test_okta_connection()
        return {"ok": ok}
    except Exception as e:
        logger.exception(f"Error testing Okta connection: {str(e)}")
        return {"ok": False, "error": "unexpected_error"}
