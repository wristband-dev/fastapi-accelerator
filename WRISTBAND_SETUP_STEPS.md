
<div align="center">
  <a href="https://wristband.dev">
    <picture>
      <img src="https://assets.wristband.dev/images/email_branding_logo_v1.png" alt="Wristband" width="297" height="64">
    </picture>
  </a>
  <p align="center">
    Enterprise-ready auth that is secure by default, truly multi-tenant, and ungated for small businesses.
  </p>
  <p align="center">
    <b>
      <a href="https://wristband.dev">Website</a> •
      <a href="https://docs.wristband.dev">Documentation</a>
    </b>
  </p>
</div>

<br/>

---

# 🔐 Wristband Application Setup Guide

![Wristband](https://img.shields.io/badge/Wristband-Enterprise_Auth-blue.svg)
![Setup](https://img.shields.io/badge/Setup-Configuration_Guide-green.svg)

This guide will walk you through the complete setup process for configuring your Wristband application with proper permissions, roles, and authentication settings.

## Table of Contents

- [🛡️ Permission Groups](#️-permission-groups)
- [👥 Roles](#-roles)
- [🔑 OAuth2 Client](#-oauth2-client)
- [📋 Role Assignment Policies](#-role-assignment-policies)
- [⚙️ Application Settings](#️-application-settings)

<br>
<hr>
<br>

## 🛡️ Permission Groups

Navigate to **Authorization** tab → **Permission Groups** in your Wristband dashboard.

### 1. Application Permissions

**Create Permission Group:**
| Field | Value |
|-------|-------|
| Permission Group Name | `application` |
| Display Name | `Application Permissions` |
| Tenant Visibility | `Application` |

**Add Permissions:**
- `tenant-discovery-workflow:execute`
- `tenant:read`

### 2. Personal Permissions

**Create Permission Group:**
| Field | Value |
|-------|-------|
| Permission Group Name | `personal` |
| Display Name | `Personal Permissions` |
| Tenant Visibility | `Self` |

**Add Permissions:**
- `change-email-workflow:execute`
- `change-password-workflow:execute`
- `user:read`
- `user:update`

### 3. Tenant Viewer Permissions

**Create Permission Group:**
| Field | Value |
|-------|-------|
| Permission Group Name | `tenant-viewer` |
| Display Name | `Tenant Viewer Permissions` |
| Tenant Visibility | `Tenant` |

**Add Permissions:**
- `new-user-invitation-request:read`
- `role:read`
- `tenant:read`
- `user:read`

### 4. Tenant Admin Permissions

**Create Permission Group:**
| Field | Value |
|-------|-------|
| Permission Group Name | `tenant-admin` |
| Display Name | `Tenant Admin Permissions` |
| Tenant Visibility | `Tenant` |

**Add Permissions:**
- `identity-provider:delete`
- `identity-provider:read`
- `identity-provider:view-protocol`
- `identity-provider:write`
- `new-user-invitation-workflow:execute`
- `tenant:create`
- `tenant:read`
- `tenant:update`
- `user:delete`

<br>
<hr>
<br>

## 👥 Roles

Navigate to **Authorization** tab → **Roles** in your Wristband dashboard.

### 1. Account Admin

**Create Role:**
| Field | Value |
|-------|-------|
| Role Name | `account-admin` |
| Display Name | `Account Admin` |

**Assign Permission Groups:**
- `tenant-admin`
- `tenant-viewer`
- `personal`
- `application`

> **Note**: Intended to have ONE per tenant for account ownership

### 2. Admin

**Create Role:**
| Field | Value |
|-------|-------|
| Role Name | `admin` |
| Display Name | `Admin` |

**Assign Permission Groups:**
- `tenant-admin`
- `tenant-viewer`
- `personal`
- `application`

### 3. Standard User

**Create Role:**
| Field | Value |
|-------|-------|
| Role Name | `standard` |
| Display Name | `Standard` |

**Assign Permission Groups:**
- `tenant-viewer`
- `personal`
- `application`

### 4. Viewer

**Create Role:**
| Field | Value |
|-------|-------|
| Role Name | `viewer` |
| Display Name | `Viewer` |

**Assign Permission Groups:**
- `tenant-viewer`
- `personal`
- `application`

<br>
<hr>
<br>

## 🔑 OAuth2 Client

Navigate to **OAuth2 Clients** in your Wristband dashboard and create a new client.

**Create OAuth2 Client:**
| Field | Value |
|-------|-------|
| Type | `Backend Server` |
| Client Name | `Python` |

**Configure Redirect URLs:**
- `http://localhost:6001/api/auth/callback`

> **Important**: Copy and save your **Client ID** and **Client Secret** for your environment configuration.

<br>
<hr>
<br>

## 📋 Role Assignment Policies

Navigate to **Authorization** tab → **Role Assignment Policies** to configure how roles are assigned to users.

> **Note**: Configure role assignment policies based on your specific business requirements for user onboarding and tenant access.

<br>
<hr>
<br>

## ⚙️ Application Settings

Navigate to **Application Settings** in your Wristband dashboard.

**Configure Authentication URLs:**
| Setting | Value |
|---------|-------|
| Login URL | `http://localhost:6001/api/auth/login` |
| Logout URL | `http://localhost:3001` |

**Enable Features:**
- ✅ **Self Sign Up**

> **Important**: Update these URLs for your production environment deployment.

<br>
<hr>
<br>


For additional help, refer to the [Wristband Documentation](https://docs.wristband.dev) or contact support at <support@wristband.dev>.

<br/>