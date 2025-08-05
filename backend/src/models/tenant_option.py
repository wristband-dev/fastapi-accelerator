from pydantic import BaseModel
from typing import Optional

class TenantOption(BaseModel):
    tenantId: str
    tenantVanityDomain: str
    tenantDomainName: str
    tenantDisplayName: str
    tenantLoginUrl: str
    tenantLogoUrl: Optional[str] = None