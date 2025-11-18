from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

class TenantMetadata(BaseModel):
    model_config = {"populate_by_name": True}
    
    perk_categories: Optional[list[str]] = Field(None, alias="perkCategories")

class EntityMetadata(BaseModel):
    model_config = {"populate_by_name": True}
    
    activation_time: Optional[str] = Field(None, alias="activationTime")
    creation_time: Optional[str] = Field(None, alias="creationTime")
    deactivation_time: Optional[str] = Field(None, alias="deactivationTime")
    last_modified_time: Optional[str] = Field(None, alias="lastModifiedTime")
    version: Optional[str] = None

class Tenant(BaseModel):
    model_config = {"populate_by_name": True}
    
    id: Optional[str] = None
    application_id: Optional[str] = Field(None, alias="applicationId")
    vanity_domain: Optional[str] = Field(None, alias="vanityDomain")
    domain_name: Optional[str] = Field(None, alias="domainName")
    display_name: Optional[str] = Field(None, alias="displayName")
    description: Optional[str] = None
    logo_url: Optional[str] = Field(None, alias="logoUrl")
    signup_enabled: Optional[bool] = Field(None, alias="signupEnabled")
    status: Optional[str] = None
    public_metadata: Optional[TenantMetadata] = Field(None, alias="publicMetadata")
    restricted_metadata: Optional[Dict[str, Any]] = Field(None, alias="restrictedMetadata")
    metadata: Optional[EntityMetadata] = None

class TenantUpdateRequest(BaseModel):
    model_config = {"populate_by_name": True}
    
    display_name: Optional[str] = Field(None, alias="displayName", max_length=60)
    logo_url: Optional[str] = Field(None, alias="logoUrl", max_length=2000)
    description: Optional[str] = None

class TenantOption(BaseModel):
    model_config = {"populate_by_name": True}
    
    tenant_id: str = Field(alias="tenantId")
    tenant_vanity_domain: str = Field(alias="tenantVanityDomain")
    tenant_domain_name: str = Field(alias="tenantDomainName")
    tenant_display_name: str = Field(alias="tenantDisplayName")
    tenant_login_url: str = Field(alias="tenantLoginUrl")
    tenant_logo_url: Optional[str] = Field(None, alias="tenantLogoUrl")