# Standard library imports
import logging
from typing import List
from fastapi import Depends, status, Request
from fastapi.responses import JSONResponse

# Wristband imports
from wristband.fastapi_auth import (
    get_session,
)

# Local imports
from services.encryption_service import get_encryption_service
from database.doc_store import (
    is_database_available,
    query_documents,
    set_document,
    delete_document,
    doc_exists
)
from services.collections import SECRETS_COLLECTION
from models.wristband.session import MySession
from models.secrets import SecretConfig, SecretResponse, SecretExistsResponse

logger = logging.getLogger(__name__)


# MARK: - Dependencies
def get_secrets_service(
    request: Request,
    session: MySession = Depends(get_session)
) -> 'SecretsService':
    return SecretsService(request, session)


# MARK: - Service
class SecretsService:
    def __init__(self, request: Request, session: MySession):
        self.encryption_svc = get_encryption_service()
        self.tenant_id: str = session.tenant_id
    
    def _check_database_available(self):
        """Check if database is available, return error response if not"""
        if not is_database_available():
            return JSONResponse(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                content={"error": "datastore_unavailable", "message": "Datastore is not enabled"}
            )
        return None
    
    def _check_encryption_available(self):
        """Check if encryption is available, return error response if not"""
        if not self.encryption_svc.is_available():
            return JSONResponse(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                content={"error": "encryption_unavailable", "message": "Encryption service is not available"}
            )
        return None
    
    async def get_secrets(self) -> List[SecretResponse] | JSONResponse:
        """Get all secrets"""
        try:
            # Check availability
            if error := self._check_database_available():
                return error
            if error := self._check_encryption_available():
                return error
            
            # Query all secrets
            encrypted_secrets = query_documents(
                SECRETS_COLLECTION,
                tenant_id=self.tenant_id
            )
            
            # Decrypt secrets using list comprehension
            decrypted_secrets = [
                SecretResponse.from_encrypted_dict(secret_data) 
                for secret_data in encrypted_secrets
            ]
            
            return decrypted_secrets
        
        except Exception as e:
            logger.exception(f"Error fetching secrets: {str(e)}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"error": "internal_error", "message": "Failed to fetch secrets"}
            )
    
    async def upsert_secret(self, secret: SecretConfig) -> JSONResponse:
        """Create or update a secret"""
        try:
            # Check availability
            if error := self._check_database_available():
                return error
            if error := self._check_encryption_available():
                return error
            
            # Convert to encrypted storage format
            try:
                secret_data = secret.to_encrypted_dict()
            except Exception as e:
                logger.error(f"Failed to encrypt token: {str(e)}")
                return JSONResponse(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    content={"error": "encryption_error", "message": "Failed to encrypt secret"}
                )
            
            # Save to database
            set_document(
                collection_path=SECRETS_COLLECTION,
                doc_id=secret.name,
                data=secret_data,
                tenant_id=self.tenant_id
            )
            
            return JSONResponse(
                status_code=status.HTTP_201_CREATED,
                content={"message": "Secret saved successfully"}
            )
        
        except Exception as e:
            logger.exception(f"Error saving secret: {str(e)}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"error": "internal_error", "message": "Failed to save secret"}
            )
    
    async def check_secret_exists(self, name: str) -> SecretExistsResponse | JSONResponse:
        """Check if a secret with the given name exists"""
        try:
            # Check availability
            if error := self._check_database_available():
                return error
            
            exists = doc_exists(
                collection_path=SECRETS_COLLECTION,
                doc_id=name,
                tenant_id=self.tenant_id
            )
            return SecretExistsResponse(exists=exists)
        
        except Exception as e:
            logger.exception(f"Error checking secret existence: {str(e)}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"error": "internal_error", "message": "Failed to check secret"}
            )
    
    async def delete_secret(self, name: str) -> JSONResponse:
        """Delete a secret"""
        try:
            # Check availability
            if error := self._check_database_available():
                return error
            
            # Check if secret exists
            if not doc_exists(
                collection_path=SECRETS_COLLECTION,
                doc_id=name,
                tenant_id=self.tenant_id
            ):
                return JSONResponse(
                    status_code=status.HTTP_404_NOT_FOUND,
                    content={"error": "not_found", "message": "Secret not found"}
                )
            
            # Delete the secret
            delete_document(
                collection_path=SECRETS_COLLECTION,
                doc_id=name,
                tenant_id=self.tenant_id
            )
            
            return JSONResponse(
                status_code=status.HTTP_204_NO_CONTENT,
                content=None
            )
        
        except Exception as e:
            logger.exception(f"Error deleting secret: {str(e)}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"error": "internal_error", "message": "Failed to delete secret"}
            )

