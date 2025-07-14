from typing import Any, Optional
from fastapi import APIRouter, Request, Response, Query
from fastapi.responses import JSONResponse
from fastapi import status
import logging

from clients.wristband_client import WristbandApiClient

router = APIRouter()
logger = logging.getLogger(__name__)
wristband_client = WristbandApiClient()

@router.get('')
async def get_users(
    request: Request,
    page: int = Query(1, description="Page number (1-based)", ge=1),
    page_size: int = Query(10, description="Number of users per page", ge=1, le=100),
    id: Optional[str] = Query(None, description="Filter by user ID"),
    username: Optional[str] = Query(None, description="Filter by username"),
    email: Optional[str] = Query(None, description="Filter by email"),
    email_verified: Optional[bool] = Query(None, description="Filter by email verification status"),
    first_name: Optional[str] = Query(None, description="Filter by first name"),
    last_name: Optional[str] = Query(None, description="Filter by last name"),
    full_name: Optional[str] = Query(None, description="Filter by full name"),
    phone_number: Optional[str] = Query(None, description="Filter by phone number"),
    phone_number_verified: Optional[bool] = Query(None, description="Filter by phone number verification status"),
    status: Optional[str] = Query(None, description="Filter by user status"),
    locked: Optional[bool] = Query(None, description="Filter by locked status"),
    created_at: Optional[str] = Query(None, description="Filter by creation date"),
    updated_at: Optional[str] = Query(None, description="Filter by last update date"),
    login_count: Optional[int] = Query(None, description="Filter by login count"),
    last_login_at: Optional[str] = Query(None, description="Filter by last login date"),
    last_ip: Optional[str] = Query(None, description="Filter by last IP address"),
    sort_by: Optional[str] = Query(None, description="Sort by field (e.g., 'created_at', 'updated_at', 'username')"),
    sort_order: Optional[str] = Query("asc", description="Sort order (asc or desc)")
) -> Response:
    """
    Query users scoped to a tenant using the Wristband querytenantusersv1 API.
    
    This endpoint retrieves a list of users within the current tenant with support for
    filtering, sorting, and pagination.
    """
    try:
        # Get session data including access token and tenant ID
        session_data = request.state.session.get()
        access_token = session_data.access_token
        tenant_id = session_data.tenant_id
        
        # Prepare filter parameters
        filters = {}
        
        # Add non-None filters to the request
        filter_params = {
            'id': id,
            'username': username,
            'email': email,
            'emailVerified': email_verified,
            'firstName': first_name,
            'lastName': last_name,
            'fullName': full_name,
            'phoneNumber': phone_number,
            'phoneNumberVerified': phone_number_verified,
            'status': status,
            'locked': locked,
            'createdAt': created_at,
            'updatedAt': updated_at,
            'loginCount': login_count,
            'lastLoginAt': last_login_at,
            'lastIp': last_ip,
            'sortBy': sort_by,
            'sortOrder': sort_order
        }
        
        for key, value in filter_params.items():
            if value is not None:
                filters[key] = value
        
        # Query tenant users using the Wristband API
        users_data: dict[str, Any] = await wristband_client.query_tenant_users(
            tenant_id=tenant_id,
            access_token=access_token,
            page=page,
            page_size=page_size,
            **filters
        )
        
        return JSONResponse(content=users_data)
    
    except Exception as e:
        logger.exception(f"Error querying tenant users: {str(e)}")
        return Response(status_code=500)
