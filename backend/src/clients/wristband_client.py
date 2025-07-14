from typing import Any
import httpx
import logging
import os

logger = logging.getLogger(__name__)

class WristbandApiClient:
    def __init__(self) -> None:
        application_vanity_domain = os.getenv("APPLICATION_VANITY_DOMAIN")
        if not application_vanity_domain:
            raise ValueError('wristband_application_vanity_domain required for WristbandApiClient')

        self.base_url: str = f'https://{application_vanity_domain}/api/v1'
        self.headers: dict[str, str] = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }

        self.client = httpx.AsyncClient()

    ############################################################################################
    # User APIs
    ############################################################################################
    async def get_user_info(self, user_id: str, access_token: str) -> dict[str, Any]:
        # Get User API - https://docs.wristband.dev/reference/getuserv1
        response: httpx.Response = await self.client.get(
            self.base_url + f'/users/{user_id}',
            headers={
                **self.headers,
                'Authorization': f'Bearer {access_token}'
            }
        )

        if response.status_code != 200:
            raise ValueError(f'Error calling get_user_info: {response.status_code} - {response.text}')

        return response.json() if response.content else {}

    ############################################################################################
    # User Nickname APIs
    ############################################################################################
    async def update_user_nickname(self, user_id: str, nickname: str, access_token: str) -> dict[str, Any]:
        # Update User API - https://docs.wristband.dev/reference/patchuserv1
        response: httpx.Response = await self.client.patch(
            self.base_url + f'/users/{user_id}',
            headers={
                **self.headers,
                'Authorization': f'Bearer {access_token}'
            },
            json={
                'nickname': nickname
            },
        )

        if response.status_code != 200:
            raise ValueError(f'Error calling update_user_nickname: {response.status_code} - {response.text}')

        return response.json() if response.content else {}

    async def get_user_nickname(self, user_id: str, access_token: str) -> str:
        # Get User API - https://docs.wristband.dev/reference/getuserv1
        response: httpx.Response = await self.client.get(
            self.base_url + f'/users/{user_id}',
            headers={
                **self.headers,
                'Authorization': f'Bearer {access_token}'
            }
        )

        if response.status_code != 200:
            raise ValueError(f'Error calling get_user_nickname: {response.status_code} - {response.text}')
        
        return response.json().get('nickname', '')

    ############################################################################################
    # Tenant Users APIs
    ############################################################################################
    async def query_tenant_users(self, tenant_id: str, access_token: str, page: int = 1, page_size: int = 10, **filters) -> dict[str, Any]:
        # Query Tenant Users API - https://docs.wristband.dev/reference/querytenantusersv1
        params = {
            'page': page,
            'pageSize': page_size,
        }
        
        # Add any additional filters passed as kwargs
        for key, value in filters.items():
            if value is not None:
                params[key] = value
        
        response: httpx.Response = await self.client.get(
            self.base_url + f'/tenants/{tenant_id}/users',
            headers={
                **self.headers,
                'Authorization': f'Bearer {access_token}'
            },
            params=params
        )

        if response.status_code != 200:
            raise ValueError(f'Error calling query_tenant_users: {response.status_code} - {response.text}')

        return response.json() if response.content else {}
