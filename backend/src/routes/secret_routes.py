
from typing import Optional, List
from fastapi import APIRouter, Request, status
from fastapi.responses import JSONResponse
import logging

from database.firestore_database import set_document, doc_exists, get_document, query_documents, delete_document
from models.secret import Secret

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post('/upsert', response_model=Secret)
async def upsert_secret(request: Request, secret_request: Secret):
    """
    Upsert (create or update) a secret for the current tenant
    """
    try:
        # Get tenant ID from session
        session_data = request.state.session.get()
        tenant_id = session_data.tenant_id
        
        # Convert Pydantic model to dict with proper serialization
        secret_data = secret_request.model_dump()
        # Convert HttpUrl to string if present
        if secret_data.get('host'):
            secret_data['host'] = str(secret_data['host'])
        
        # Update the secret in firestore
        set_document(
            collection_path=f"tenants/{tenant_id}/secrets",
            doc_id=secret_request.sku,
            data=secret_data
        )
        
        logger.info(f"Successfully upserted secret with SKU: {secret_request.sku} for tenant: {tenant_id}")
        return secret_request
        
    except Exception as e:
        logger.exception(f"Unexpected error upserting secret: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "internal_error", "message": "An unexpected error occurred while saving the secret."}
        )

@router.get('/check/{sku}')
async def check_secret_exists(request: Request, sku: str):
    """
    Check if a secret with the given SKU exists for the current tenant
    """
    try:
        # Get tenant ID from session
        session_data = request.state.session.get()
        tenant_id = session_data.tenant_id
        
        # Check if document exists
        exists = doc_exists(
            collection_path=f"tenants/{tenant_id}/secrets",
            doc_id=sku
        )
        
        return {"exists": exists}
        
    except Exception as e:
        logger.exception(f"Error checking secret existence: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "internal_error", "message": "An unexpected error occurred while checking the secret."}
        )

@router.get('/', response_model=List[Secret])
async def get_secrets(request: Request):
    """
    Get all secrets for the current tenant
    """
    try:
        # Get tenant ID from session
        session_data = request.state.session.get()
        tenant_id = session_data.tenant_id
        
        # Query all secrets for this tenant
        secrets = query_documents(
            collection_path=f"tenants/{tenant_id}/secrets",
            order_by_field="displayName",
            order_direction="ASC"
        )
        
        return secrets
        
    except Exception as e:
        logger.exception(f"Error fetching secrets: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "internal_error", "message": "An unexpected error occurred while fetching secrets."}
        )

@router.get('/{sku}', response_model=Secret)
async def get_secret(request: Request, sku: str):
    """
    Get a specific secret by SKU for the current tenant
    """
    try:
        # Get tenant ID from session
        session_data = request.state.session.get()
        tenant_id = session_data.tenant_id
        
        # Get the secret
        secret = get_document(
            collection_path=f"tenants/{tenant_id}/secrets",
            doc_id=sku
        )
        
        if not secret:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"error": "not_found", "message": f"Secret with SKU '{sku}' not found."}
            )
        
        return secret
        
    except Exception as e:
        logger.exception(f"Error fetching secret: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "internal_error", "message": "An unexpected error occurred while fetching the secret."}
        )

@router.delete('/{sku}')
async def delete_secret(request: Request, sku: str):
    """
    Delete a secret by SKU for the current tenant
    """
    try:
        # Get tenant ID from session
        session_data = request.state.session.get()
        tenant_id = session_data.tenant_id
        
        # Check if secret exists
        if not doc_exists(
            collection_path=f"tenants/{tenant_id}/secrets",
            doc_id=sku
        ):
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"error": "not_found", "message": f"Secret with SKU '{sku}' not found."}
            )
        
        # Delete the secret
        delete_document(
            collection_path=f"tenants/{tenant_id}/secrets",
            doc_id=sku
        )
        
        logger.info(f"Successfully deleted secret with SKU: {sku} for tenant: {tenant_id}")
        return {"message": "Secret deleted successfully"}
        
    except Exception as e:
        logger.exception(f"Error deleting secret: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "internal_error", "message": "An unexpected error occurred while deleting the secret."}
        )