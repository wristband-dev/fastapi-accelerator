from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class UserMetadata(BaseModel):
    model_config = {"populate_by_name": True}
    
    activation_time: Optional[datetime] = Field(None, alias="activationTime")
    creation_time: datetime = Field(alias="creationTime")
    deactivation_time: Optional[datetime] = Field(None, alias="deactivationTime")
    last_modified_time: datetime = Field(alias="lastModifiedTime")
    version: str

class User(BaseModel):
    model_config = {"populate_by_name": True}
    
    application_id: str = Field(alias="applicationId")
    birthdate: Optional[str] = None
    display_name: Optional[str] = Field(None, alias="displayName")
    email: EmailStr
    email_verified: bool = Field(alias="emailVerified")
    external_id: Optional[str] = Field(None, alias="externalId")
    family_name: Optional[str] = Field(None, alias="familyName")
    full_name: Optional[str] = Field(None, alias="fullName")
    gender: Optional[str] = None
    given_name: Optional[str] = Field(None, alias="givenName")
    has_password: bool = Field(alias="hasPassword")
    honorific_prefix: Optional[str] = Field(None, alias="honorificPrefix")
    honorific_suffix: Optional[str] = Field(None, alias="honorificSuffix")
    id: str
    identity_provider_name: str = Field(alias="identityProviderName")
    identity_provider_type: str = Field(alias="identityProviderType")
    locale: Optional[str] = None
    metadata: UserMetadata
    middle_name: Optional[str] = Field(None, alias="middleName")
    nickname: Optional[str] = None
    phone_number: Optional[str] = Field(None, alias="phoneNumber")
    picture_url: Optional[str] = Field(None, alias="pictureUrl")
    preferred_language: Optional[str] = Field(None, alias="preferredLanguage")
    public_metadata: dict = Field(default_factory=dict, alias="publicMetadata")
    restricted_metadata: dict = Field(default_factory=dict, alias="restrictedMetadata")
    status: str
    tenant_id: str = Field(alias="tenantId")
    time_zone: Optional[str] = Field(None, alias="timeZone")
    username: Optional[str] = None

    # added after user info from resolve assigned roles
    roles: list[str] = []

class UpdateNameRequest(BaseModel):
    model_config = {"populate_by_name": True}
    
    given_name: Optional[str] = Field(None, alias="givenName")
    family_name: Optional[str] = Field(None, alias="familyName")

    def to_payload(self) -> dict[str, str]:
        payload = self.model_dump(by_alias=True, exclude_none=True)
        return {k: v for k, v in payload.items() if v != ''}

class PasswordChangeRequest(BaseModel):
    model_config = {"populate_by_name": True}
    
    current_password: str = Field(alias="currentPassword")
    new_password: str = Field(alias="newPassword")

class UsersResponse(BaseModel):
    model_config = {"populate_by_name": True}
    
    items: list[User]
    items_per_page: int = Field(alias="itemsPerPage")
    start_index: int = Field(alias="startIndex")
    total_results: int = Field(alias="totalResults")