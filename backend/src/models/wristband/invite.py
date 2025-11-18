from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class InviteUserRequest(BaseModel):
    email: EmailStr
    roles: List[str] = []  # List of role IDs to assign

class InviteUserResponse(BaseModel):
    model_config = {"populate_by_name": True}
    
    message: str
    email: str
    roles_assigned: List[str]

class InvitationMetadata(BaseModel):
    model_config = {"populate_by_name": True}
    
    creation_time: datetime = Field(alias="creationTime")
    last_modified_time: datetime = Field(alias="lastModifiedTime")
    version: str

class NewUserInvitationRequest(BaseModel):
    model_config = {"populate_by_name": True}
    
    id: str
    tenant_id: str = Field(alias="tenantId")
    application_id: str = Field(alias="applicationId")
    invitation_type: str = Field(alias="invitationType")
    invitee_name: Optional[str] = Field(None, alias="inviteeName")
    email: EmailStr
    roles_to_assign: List[str] = Field(default=[], alias="rolesToAssign")
    external_idp_request_status: str = Field(alias="externalIdpRequestStatus")
    external_idp_name: Optional[str] = Field(None, alias="externalIdpName")
    external_idp_display_name: Optional[str] = Field(None, alias="externalIdpDisplayName")
    external_idp_type: Optional[str] = Field(None, alias="externalIdpType")
    expiration_time: Optional[datetime] = Field(None, alias="expirationTime")
    status: str
    metadata: InvitationMetadata

class NewUserInvitationRequestsResponse(BaseModel):
    model_config = {"populate_by_name": True}
    
    start_index: int = Field(alias="startIndex")
    items_per_page: int = Field(alias="itemsPerPage")
    total_results: int = Field(alias="totalResults")
    items: List[NewUserInvitationRequest]
