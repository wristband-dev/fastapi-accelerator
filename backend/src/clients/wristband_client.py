from typing import Any
import httpx
import logging
import os

from models.user import User, UsersResponse, UserProfileUpdate
from models.roles import RoleList
from models.tenant import Tenant, TenantUpdateRequest
from models.identity_provider import IdentityProvider, IdentityProviderRequest, IdpOverrideToggle

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
    async def get_user_info(self, user_id: str, access_token: str, include_roles: bool = False) -> User:
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

        if include_roles:
            roles_list = await self.resolve_assigned_roles_for_users([user_id], access_token)
            data['roles'] = [role.sku for role in roles_list.items[0].roles]

        return User(**data)

    async def update_user(self, user_id: str, user_data: UserProfileUpdate, access_token: str) -> User:
        # Update User API - https://docs.wristband.dev/reference/patchuserv1
        # Build payload from only the fields that are provided (not None)
        payload = {}
        if user_data.givenName is not None:
            payload['givenName'] = user_data.givenName
        if user_data.familyName is not None:
            payload['familyName'] = user_data.familyName
        if user_data.nickname is not None:
            payload['nickname'] = user_data.nickname

        response: httpx.Response = await self.client.patch(
            self.base_url + f'/users/{user_id}',
            headers={
                **self.headers,
                'Authorization': f'Bearer {access_token}'
            },
            json=payload,
        )

        if response.status_code != 200:
            raise ValueError(f'Error calling update_user: {response.status_code} - {response.text}')

        data = response.json() if response.content else {}
        return User(**data)

    async def change_password(self, user_id: str, current_password: str, new_password: str, access_token: str) -> None:
        # Change Password API - https://docs.wristband.dev/reference/changepasswordv1
        response: httpx.Response = await self.client.post(
            self.base_url + '/change-password',
            headers={
                **self.headers,
                'Authorization': f'Bearer {access_token}'
            },
            json={
                'userId': user_id,
                'currentPassword': current_password,
                'newPassword': new_password
            },
        )

        if response.status_code != 204:
            raise ValueError(f'Error calling change_password: {response.status_code} - {response.text}')

    ############################################################################################
    # MARK: Tenant Users APIs
    ############################################################################################
    async def query_tenant_users(self, tenant_id: str, access_token: str, include_roles: bool = False) -> list[User]:
        # Query Tenant Users API - https://docs.wristband.dev/reference/querytenantusersv1
        start_index = 0
        count = 50
        all_users = []
        
        while True:
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
            user_list = UsersResponse(**data)
            
            # Collect users from this page
            all_users.extend(user_list.items)
            
            # Check if we have more pages to fetch
            if start_index + user_list.itemsPerPage >= user_list.totalResults:
                break
                
            # Move to next page
            start_index += user_list.itemsPerPage

        if not include_roles:
            return all_users
        else:
            # Get user ids from user list
            user_ids = [user.id for user in all_users]
            # Get roles for users
            roles = await self.resolve_assigned_roles_for_users(user_ids, access_token)
            # Add roles to users
            for user in all_users:
                # Find the UserRoles object for this user
                user_roles = next((ur for ur in roles.items if ur.userId == user.id), None)
                if user_roles:
                    # Extract role names from the roles list
                    user.roles = [role.sku for role in user_roles.roles]
                else:
                    user.roles = []
            return all_users

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

    ############################################################################################
    # MARK: Tenant APIs
    ############################################################################################
    async def get_tenant(self, tenant_id: str, access_token: str) -> Tenant:
        # Get Tenant API - https://docs.wristband.dev/reference/gettenantv1
        response: httpx.Response = await self.client.get(
            self.base_url + f'/tenants/{tenant_id}',
            headers={
                **self.headers,
                'Authorization': f'Bearer {access_token}'
            }
        )

        if response.status_code != 200:
            raise ValueError(f'Error calling get_tenant: {response.status_code} - {response.text}')

        data = response.json() if response.content else {}
        return Tenant(**data)

    async def update_tenant(self, tenant_id: str, tenant_data: TenantUpdateRequest, access_token: str) -> Tenant:
        # Update Tenant API - https://docs.wristband.dev/reference/patchtenantv1
        # Build payload from only the fields that are provided (not None)
        payload = {}
        if tenant_data.displayName is not None:
            payload['displayName'] = tenant_data.displayName
        if tenant_data.logoUrl is not None:
            payload['logoUrl'] = tenant_data.logoUrl
        if tenant_data.description is not None:
            payload['description'] = tenant_data.description

        response: httpx.Response = await self.client.patch(
            self.base_url + f'/tenants/{tenant_id}',
            headers={
                **self.headers,
                'Authorization': f'Bearer {access_token}'
            },
            json=payload,
        )

        if response.status_code != 200:
            raise ValueError(f'Error calling update_tenant: {response.status_code} - {response.text}')

        data = response.json() if response.content else {}
        return Tenant(**data)

    ############################################################################################
    # MARK: Identity Provider APIs
    ############################################################################################
    async def upsert_idp_override_toggle(self, tenant_id: str, access_token: str) -> None:
        # Upsert IDP Override Toggle API - enables tenant-level IDP override
        payload = {
            'ownerType': 'TENANT',
            'ownerId': tenant_id,
            'status': 'ENABLED'
        }

        response: httpx.Response = await self.client.post(
            self.base_url + '/identity-provider-override-toggles?upsert=true',
            headers={
                **self.headers,
                'Authorization': f'Bearer {access_token}'
            },
            json=payload,
        )

        if response.status_code not in [200, 201, 204]:
            raise ValueError(f'Error calling upsert_idp_override_toggle: {response.status_code} - {response.text}')

    async def upsert_identity_provider(self, idp_data: IdentityProviderRequest, access_token: str) -> IdentityProvider:
        # Upsert Identity Provider API - https://docs.wristband.dev/reference/upsertidentityproviderv1
        response: httpx.Response = await self.client.post(
            self.base_url + '/identity-providers?upsert=true',
            headers={
                **self.headers,
                'Authorization': f'Bearer {access_token}'
            },
            json=idp_data.model_dump(),
        )

        if response.status_code not in [200, 201]:
            raise ValueError(f'Error calling upsert_identity_provider: {response.status_code} - {response.text}')

        data = response.json() if response.content else {}
        return IdentityProvider(**data)
