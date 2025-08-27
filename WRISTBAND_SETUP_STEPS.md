Authorization -> Permission Groups
    - Application Permissions - application - (Application)
        - tenant-discovery-workflow:execute
        - tenant:read
    - Personal Permissions - personal - (Self)
        - change-email-workflow:execute
        - change-password-workflow:execute
        - user:read
        - user:update
    - Tenant Viewer Permissions - tenant-viewer - (Tenant)
        - new-user-invitation-request:read
        - role:read
        - tenant:read
        - user:read
    - Tenant Admin Permissions - tenant-admin - (Tenant)
        - identity-provider:delete
        - identity-provider:read
        - identity-provider:view-protocol
        - identity-provider:write
        - new-user-invitation-workflow:execute
        - tenant:create
        - tenant:read
        - tenant:update
        - user:delete
        
Authorization -> Roles
    - Account Admin
        - all permissions
        - ONE per tenant to manage stripe / payment integration
    - Admin
        - all permission groups
    - Explorer / Viewer (Whatever)
        - all but Tenant Admin

OAuth2 Client
    - Backend Server 
        - python 
        - http://localhost:6001/api/auth/callback

Authorization -> Role Assignment Policies

Application Settings
    - Enable Self Sign Up
    - login url -> http://localhost:6001/api/auth/login
    - logout urls -> http://localhost:3001 