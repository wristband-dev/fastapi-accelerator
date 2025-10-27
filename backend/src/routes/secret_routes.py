
from typing import Optional, List
from fastapi import APIRouter, Request, status, Depends
from fastapi.responses import JSONResponse
import logging

from wristband.fastapi_auth import get_session

from database.doc_store import set_document, doc_exists, get_document, query_documents, delete_document, is_database_available
from models.secret import SecretConfig
from services.encryption_service import encrypt_secret, decrypt_secret, is_encryption_available
from auth.wristband import require_session_auth
from models.wristband.session import MySession

router = APIRouter(dependencies=[Depends(require_session_auth)])
logger = logging.getLogger(__name__)

@router.post('/upsert', response_model=SecretConfig)
async def upsert_secret(secret_config: SecretConfig, session: MySession = Depends(get_session)):
    """
    Upsert (create or update) a secret for the current tenant
    """
    if not is_database_available():
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"error": "datastore_unavailable", "message": "Datastore not enabled"}
        )
    
    if not is_encryption_available():
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"error": "encryption_unavailable", "message": "Encryption service not available"}
        )
    
    try:
        # Get tenant ID from session
        tenant_id = session.tenant_id
        
        # Convert Pydantic model to dict with proper serialization
        secret_data = secret_config.model_dump(mode='json')
        
        # Encrypt the service_token value before storing
        try:
            secret_data['service_token'] = encrypt_secret(secret_data['service_token'])
            logger.debug(f"Successfully encrypted service_token for name: {secret_config.name}")
        except Exception as e:
            logger.error(f"Failed to encrypt service_token: {str(e)}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"error": "encryption_error", "message": "Failed to encrypt token data"}
            )
        
        # Update the secret in firestore
        set_document(
            collection_path=f"tenants/{tenant_id}/secrets",
            doc_id=secret_config.name,
            data=secret_data
        )
        
        logger.info(f"Successfully upserted encrypted secret with name: {secret_config.name} for tenant: {tenant_id}")
        return secret_config
        
    except Exception as e:
        logger.exception(f"Unexpected error upserting secret: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "internal_error", "message": "An unexpected error occurred while saving the secret."}
        )

@router.get('/check/{name}')
async def check_secret_exists(name: str, session: MySession = Depends(get_session)):
    """
    Check if a secret with the given name exists for the current tenant
    """
    if not is_database_available():
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"error": "datastore_unavailable", "message": "Datastore not enabled"}
        )
    
    try:
        # Get tenant ID from session
        tenant_id = session.tenant_id
        
        # Check if document exists
        exists = doc_exists(
            collection_path=f"tenants/{tenant_id}/secrets",
            doc_id=name
        )
        
        return {"exists": exists}
        
    except Exception as e:
        logger.exception(f"Error checking secret existence: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "internal_error", "message": "An unexpected error occurred while checking the secret."}
        )

@router.get('', response_model=List[SecretConfig])
async def get_secrets(session: MySession = Depends(get_session)):
    """
    Get all secrets for the current tenant
    """
    if not is_database_available():
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"error": "datastore_unavailable", "message": "Datastore not enabled"}
        )
    
    if not is_encryption_available():
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"error": "encryption_unavailable", "message": "Encryption service not available"}
        )
    
    try:
        # Get tenant ID from session
        tenant_id = session.tenant_id
        
        # Query all secrets for this tenant
        encrypted_secrets = query_documents(
            collection_path=f"tenants/{tenant_id}/secrets",
            order_by_field="display_name",
            order_direction="ASC"
        )
        
        # Decrypt the service_token values before returning
        decrypted_secrets = []
        for secret_data in encrypted_secrets:
            try:
                # Create a copy of the secret data
                decrypted_secret = dict(secret_data)
                # Decrypt the service_token value
                decrypted_secret['service_token'] = decrypt_secret(secret_data['service_token'])
                decrypted_secrets.append(decrypted_secret)
            except Exception as e:
                logger.error(f"Failed to decrypt secret {secret_data.get('name', 'unknown')}: {str(e)}")
                # Skip this secret if decryption fails
                continue
        
        logger.debug(f"Successfully decrypted {len(decrypted_secrets)} secrets for tenant: {tenant_id}")
        return decrypted_secrets
        
    except Exception as e:
        logger.exception(f"Error fetching secrets: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "internal_error", "message": "An unexpected error occurred while fetching secrets."}
        )

@router.get('/{name}', response_model=SecretConfig)
async def get_secret(name: str, session: MySession = Depends(get_session)):
    """
    Get a specific secret by name for the current tenant
    """
    if not is_database_available():
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"error": "datastore_unavailable", "message": "Datastore not enabled"}
        )
    
    if not is_encryption_available():
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"error": "encryption_unavailable", "message": "Encryption service not available"}
        )
    
    try:
        # Get tenant ID from session
        tenant_id = session.tenant_id
        
        # Get the encrypted secret
        encrypted_secret = get_document(
            collection_path=f"tenants/{tenant_id}/secrets",
            doc_id=name
        )
        
        if not encrypted_secret:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"error": "not_found", "message": f"Secret with name '{name}' not found."}
            )
        
        # Decrypt the service_token value before returning
        try:
            decrypted_secret = dict(encrypted_secret)
            decrypted_secret['service_token'] = decrypt_secret(encrypted_secret['service_token'])
            logger.debug(f"Successfully decrypted service_token for name: {name}")
            return decrypted_secret
        except Exception as e:
            logger.error(f"Failed to decrypt secret {name}: {str(e)}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"error": "decryption_error", "message": "Failed to decrypt secret data"}
            )
        
    except Exception as e:
        logger.exception(f"Error fetching secret: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "internal_error", "message": "An unexpected error occurred while fetching the secret."}
        )

@router.delete('/{name}')
async def delete_secret(name: str, session: MySession = Depends(get_session)):
    """
    Delete a secret by name for the current tenant
    """
    if not is_database_available():
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"error": "datastore_unavailable", "message": "Datastore not enabled"}
        )
    
    try:
        # Get tenant ID from session
        tenant_id = session.tenant_id
        
        # Check if secret exists
        if not doc_exists(
            collection_path=f"tenants/{tenant_id}/secrets",
            doc_id=name
        ):
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"error": "not_found", "message": f"Secret with name '{name}' not found."}
            )
        
        # Delete the secret
        delete_document(
            collection_path=f"tenants/{tenant_id}/secrets",
            doc_id=name
        )
        
        logger.info(f"Successfully deleted secret with name: {name} for tenant: {tenant_id}")
        return {"message": "Secret deleted successfully"}
        
    except Exception as e:
        logger.exception(f"Error deleting secret: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "internal_error", "message": "An unexpected error occurred while deleting the secret."}
        )