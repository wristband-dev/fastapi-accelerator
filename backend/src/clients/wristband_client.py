from typing import Any
import httpx
import logging
import os

from models.user import User, UserList
from models.roles import RoleList

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
    # MARK: User APIs
    ############################################################################################
    async def get_user_info(self, user_id: str, access_token: str) -> User:
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

        data = response.json() if response.content else {}

        from pprint import pprint
        print("--------------------------------")
        pprint(data)
        print("--------------------------------")
        return User(**data)

    ############################################################################################
    # MARK: User Nickname APIs
    ############################################################################################
    async def update_user_nickname(self, user_id: str, nickname: str, access_token: str) -> User:
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

        data = response.json() if response.content else {}
        return User(**data)

    async def get_user_nickname(self, user_id: str, access_token: str) -> str:
        # Get User API - https://docs.wristband.dev/reference/getuserv1
        user = await self.get_user_info(user_id, access_token)
        return user.nickname or ''

    ############################################################################################
    # MARK: Tenant Users APIs
    ############################################################################################
    async def query_tenant_users(
        self, 
        tenant_id: str, 
        access_token: str, 
        start_index: int = 0, 
        count: int = 100,
        include_roles: bool = False,
    ) -> UserList:
        # Query Tenant Users API - https://docs.wristband.dev/reference/querytenantusersv1
        params = {
            'startIndex': start_index,
            'count': count,
        }
        
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

        data = response.json() if response.content else {}
        user_list = UserList(**data)

        if not include_roles:
            return user_list
        else:
            # Get user ids from user list
            user_ids = [user.id for user in user_list.items]
            # Get roles for users
            roles = await self.resolve_assigned_roles_for_users(user_ids, access_token)
            # Add roles to users
            for user in user_list.items:
                # Find the UserRoles object for this user
                user_roles = next((ur for ur in roles.items if ur.userId == user.id), None)
                if user_roles:
                    # Extract role names from the roles list
                    user.roles = [role.sku for role in user_roles.roles]
                else:
                    user.roles = []
            return user_list

    ############################################################################################
    # MARK: Role APIs
    ############################################################################################
    async def resolve_assigned_roles_for_users(self, user_ids: list[str], access_token: str) -> RoleList:
        # Resolve Assigned Roles For Users API - https://docs.wristband.dev/reference/resolveassignedrolesforusersv1
        response: httpx.Response = await self.client.post(
            self.base_url + '/users/resolve-assigned-roles',
            headers={
                **self.headers,
                'Authorization': f'Bearer {access_token}'
            },
            json={
                'userIds': user_ids
            }
        )

        if response.status_code != 200:
            raise ValueError(f'Error calling resolve_assigned_roles_for_users: {response.status_code} - {response.text}')

        data = response.json() if response.content else {}
        return RoleList(**data)
