from pydantic import BaseModel, Field

class SecretConfig(BaseModel):
    name: str
    display_name: str = Field(alias='displayName')
    environment_id: str = Field(alias='environmentId')
    service_token: str = Field(alias='token')
    
    class Config:
        populate_by_name = True

