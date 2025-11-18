# Models for secrets management
import logging
from pydantic import BaseModel
from typing import Dict, Any

from services.encryption_service import decrypt_secret

logger = logging.getLogger(__name__)


class SecretConfig(BaseModel):
    """Model for secret configuration (input)"""
    name: str
    displayName: str
    environmentId: str
    token: str
    
    def to_encrypted_dict(self) -> Dict[str, Any]:
        """Convert to encrypted storage format"""
        from services.encryption_service import encrypt_secret
        
        return {
            'name': self.name,
            'displayName': self.displayName,
            'environmentId': self.environmentId,
            'encryptedToken': encrypt_secret(self.token)
        }


class SecretResponse(BaseModel):
    """Response model for secrets (with decrypted token)"""
    name: str
    displayName: str
    environmentId: str
    token: str
    
    @staticmethod
    def from_encrypted_dict(data: Dict[str, Any] | None) -> 'SecretResponse':
        """Used to decrypt the secret from the database"""
        if data is None:
            logger.error("Data is None")
            raise ValueError("Data is None")
        try:
            data['token'] = decrypt_secret(data['encryptedToken'])
            # Remove the encrypted field so we don't pass it to the model
            data.pop('encryptedToken', None)
            return SecretResponse(**data)
        except Exception as e:
            error_message = f"Failed to decrypt secret {data.get('name', 'unknown')}: {str(e)}"
            logger.error(error_message)
            raise ValueError(error_message)


class SecretExistsResponse(BaseModel):
    """Response model for checking if a secret exists"""
    exists: bool

