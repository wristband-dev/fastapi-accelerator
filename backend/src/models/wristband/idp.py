from typing import Optional, List
from pydantic import BaseModel, Field

class IdpProtocol(BaseModel):
    model_config = {"populate_by_name": True}
    
    type: Optional[str] = None
    client_id: Optional[str] = Field(None, alias="clientId")
    client_secret: Optional[str] = Field(None, alias="clientSecret")
    team_id: Optional[str] = Field(None, alias="teamId")
    service_id: Optional[str] = Field(None, alias="serviceId")
    key_id: Optional[str] = Field(None, alias="keyId")
    private_key: Optional[str] = Field(None, alias="privateKey")
    scopes: Optional[List[str]] = None
    # OAuth2 extras
    redirect_url: Optional[str] = Field(None, alias="redirectUrl")
    redirect_domain_name: Optional[str] = Field(None, alias="redirectDomainName")
    # SAML2 extras
    idp_entity_id: Optional[str] = Field(None, alias="idpEntityId")
    idp_sso_url: Optional[str] = Field(None, alias="idpSsoUrl")
    idp_signing_certs: Optional[List[str]] = Field(None, alias="idpSigningCerts")
    idp_metadata_url: Optional[str] = Field(None, alias="idpMetadataUrl")
    allow_idp_initiated_sso: Optional[bool] = Field(None, alias="allowIdpInitiatedSso")
    sp_domain_name: Optional[str] = Field(None, alias="spDomainName")
    sp_entity_id: Optional[str] = Field(None, alias="spEntityId")
    acs_url: Optional[str] = Field(None, alias="acsUrl")

class IdentityProvider(BaseModel):
    model_config = {"populate_by_name": True}
    
    id: Optional[str] = None
    owner_type: Optional[str] = Field(None, alias="ownerType")
    owner_id: Optional[str] = Field(None, alias="ownerId")
    type: Optional[str] = None
    name: Optional[str] = None
    display_name: Optional[str] = Field(None, alias="displayName")
    domain_name: Optional[str] = Field(None, alias="domainName")
    is_external: Optional[bool] = Field(None, alias="isExternal")
    protocol: Optional[IdpProtocol] = None
    jit_provisioning_enabled: bool = Field(default=False, alias="jitProvisioningEnabled")
    status: Optional[str] = None
    login_identifiers: Optional[List[str]] = Field(None, alias="loginIdentifiers")
    login_factors: Optional[List[str]] = Field(None, alias="loginFactors")

class IdentityProviderRequest(BaseModel):
    model_config = {"populate_by_name": True}
    
    owner_type: str = Field(alias="ownerType")
    owner_id: str = Field(alias="ownerId")
    type: str
    name: str
    display_name: str = Field(alias="displayName")
    domain_name: str = Field(alias="domainName")
    protocol: IdpProtocol
    jit_provisioning_enabled: bool = Field(default=True, alias="jitProvisioningEnabled")
    status: str = "ENABLED"

class IdpOverrideToggle(BaseModel):
    model_config = {"populate_by_name": True}
    
    owner_type: str = Field(alias="ownerType")
    owner_id: str = Field(alias="ownerId")
    status: str = "ENABLED"

class UpsertIdpRequest(BaseModel):
    idp: IdentityProviderRequest

class IdpRedirectUrl(BaseModel):
    model_config = {"populate_by_name": True}
    
    protocol_type: Optional[str] = Field(None, alias="protocolType")
    redirect_url: str = Field(alias="redirectUrl")
    redirect_domain_name: Optional[str] = Field(None, alias="redirectDomainName")

class IdpRedirectUrlConfig(BaseModel):
    model_config = {"populate_by_name": True}
    
    identity_provider_type: str = Field(alias="identityProviderType")
    redirect_urls: List[IdpRedirectUrl] = Field(alias="redirectUrls")

class UpsertGoogleSamlMetadata(BaseModel):
    model_config = {"populate_by_name": True}
    
    idp_entity_id: str = Field(alias="idpEntityId")
    idp_sso_url: str = Field(alias="idpSsoUrl")
    idp_signing_cert_01: str | None = Field(None, alias="idpSigningCert01")
    idp_signing_cert_02: str | None = Field(None, alias="idpSigningCert02")
    idp_metadata_url: str | None = Field(None, alias="idpMetadataUrl")

class UpsertOktaIdpRequest(BaseModel):
    model_config = {"populate_by_name": True}
    
    domain_name: str = Field(alias="domainName")
    client_id: str = Field(alias="clientId")
    client_secret: str = Field(alias="clientSecret")
    enabled: bool = True