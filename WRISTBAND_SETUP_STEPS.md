
# Wristband App Setup
## Create Permission Groups
    location: Authorization -> Permission Groups
    1.
    Permission Group Name: application
    Display Name: Application Permissions
    Tenant Visibility: Application
    Permissions:
        - tenant-discovery-workflow:execute
        - tenant:read
    2.
    Permission Group Name: personal
    Display Name: Personal Permissions 
    Tenant Visibility: Self
    Permissions:
        - change-email-workflow:execute
        - change-password-workflow:execute
        - user:read
        - user:update
    3.
    Permission Group Name: tenant-viewer
    Display Name: Tenant Viewer Permissions
    Tenant Visibility: Tenant
    Permissions:
        - new-user-invitation-request:read
        - role:read
        - tenant:read
        - user:read
    4. 
    Permission Group Name: tenant-admin
    Display Name: Tenant Admin Permissions
    Tenant Visibility: Tenant
    Permissions:
        - identity-provider:delete
        - identity-provider:read
        - identity-provider:view-protocol
        - identity-provider:write
        - new-user-invitation-workflow:execute
        - tenant:create
        - tenant:read
        - tenant:update
        - user:delete

## Create Roles
    location: Authorization -> Roles
    1. 
    Role Name: account-admin
    Display Name: Account Admin
    Permission Groups
        - tenant-admin
        - tenant-viewer
        - personal
        - application
    Note: 
        - Intended to have ONE per tenant to account ownership
    2. 
    Role Name: admin
    Display Name: Admin
    Permission Groups
        - tenant-admin
        - tenant-viewer
        - personal
        - application
    3. 
    Role Name: standard
    Display Name: Standard
    Permission Groups:
        - tenant-viewer
        - personal
        - application
    4.
    Role Name: viewer
    Display Name: Viewer
    Permission Groups:
        - tenant-viewer
        - personal
        - application

## Setup OAuth2 Client
    location: Outh2 Clients
    Type: Backend Server 
    Client Name: Python
    Redirect Urls: 
        - http://localhost:6001/api/auth/callback

## Create Role Assignment
    Authorization -> Role Assignment Policies

Application Settings
    - Enable Self Sign Up
    - login url -> http://localhost:6001/api/auth/login
    - logout urls -> http://localhost:3001 