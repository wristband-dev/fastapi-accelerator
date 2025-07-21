from pydantic import BaseModel, HttpUrl

class Secret(BaseModel):
    sku: str
    displayName: str
    id: str
    secret: str
    host: HttpUrl | None = None