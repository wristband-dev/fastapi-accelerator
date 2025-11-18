from pydantic import BaseModel, computed_field, Field
from typing import Optional

class Role(BaseModel):
    model_config = {"populate_by_name": True}
    
    description: Optional[str] = None
    display_name: str = Field(alias="displayName")
    id: str
    metadata: dict
    name: str
    owner_id: str = Field(alias="ownerId")
    owner_type: str = Field(alias="ownerType")
    permission_boundary_id: Optional[str] = Field(None, alias="permissionBoundaryId")
    tenant_visibility: str = Field(alias="tenantVisibility")
    tenant_visibility_inclusion_list: list[str] = Field(alias="tenantVisibilityInclusionList")
    type: str

    @computed_field
    @property
    def sku(self) -> str:
        return self.name.split(':')[-1]

class UserRoles(BaseModel):
    model_config = {"populate_by_name": True}
    
    user_id: str = Field(alias="userId")
    roles: list[Role]

class Failure(BaseModel):
    model_config = {"populate_by_name": True}
    
    code: str
    message: str
    index: int
    user_id: str = Field(alias="userId")

class RoleList(BaseModel):
    model_config = {"populate_by_name": True}
    
    failures: list[Failure]
    items: list[UserRoles]

class UpdateUserRolesRequest(BaseModel):
    model_config = {"populate_by_name": True}
    
    new_role_ids: list[str] = Field(alias="newRoleIds")
    existing_role_ids: list[str] = Field(alias="existingRoleIds")
