# WristbandApiClient Run Scripts

This directory contains individual run scripts for each function in the `WristbandApiClient` class. These scripts can be used for manual testing, debugging, and integration with the Wristband API.

## Prerequisites

1. **Environment Variables**: Set the required environment variable:
   ```bash
   export APPLICATION_VANITY_DOMAIN="your-domain.wristband.dev"
   ```

2. **Dependencies**: Make sure you have the required Python packages installed:
   ```bash
   cd backend
   pip install -r pyproject.toml  # or use poetry install
   ```

## Available Scripts

### 1. `run_get_user_info.py`
Gets complete user information for a given user ID.

**Usage:**
```bash
# Command line arguments
python run_get_user_info.py --user-id "user123" --access-token "your-token"

# Environment variables
export USER_ID="user123"
export ACCESS_TOKEN="your-token"
python run_get_user_info.py

# Pretty print output
python run_get_user_info.py --user-id "user123" --access-token "your-token" --pretty
```

### 2. `run_get_user_nickname.py`
Gets the nickname for a specific user.

**Usage:**
```bash
# Command line arguments
python run_get_user_nickname.py --user-id "user123" --access-token "your-token"

# Environment variables
export USER_ID="user123"
export ACCESS_TOKEN="your-token"
python run_get_user_nickname.py
```

### 3. `run_update_user_nickname.py`
Updates the nickname for a specific user.

**Usage:**
```bash
# Command line arguments
python run_update_user_nickname.py --user-id "user123" --nickname "John Doe" --access-token "your-token"

# Environment variables
export USER_ID="user123"
export NICKNAME="John Doe"
export ACCESS_TOKEN="your-token"
python run_update_user_nickname.py

# Pretty print output
python run_update_user_nickname.py --user-id "user123" --nickname "John Doe" --access-token "your-token" --pretty
```

### 4. `run_query_tenant_users.py`
Queries users within a tenant with pagination and filtering support.

**Usage:**
```bash
# Basic usage
python run_query_tenant_users.py --tenant-id "tenant123" --access-token "your-token"

# With pagination
python run_query_tenant_users.py --tenant-id "tenant123" --access-token "your-token" --page 2 --page-size 20

# With filtering
python run_query_tenant_users.py --tenant-id "tenant123" --access-token "your-token" --email "john@example.com"
python run_query_tenant_users.py --tenant-id "tenant123" --access-token "your-token" --first-name "John"
python run_query_tenant_users.py --tenant-id "tenant123" --access-token "your-token" --username "johndoe"

# Multiple filters
python run_query_tenant_users.py --tenant-id "tenant123" --access-token "your-token" --first-name "John" --last-name "Doe"

# Custom filters
python run_query_tenant_users.py --tenant-id "tenant123" --access-token "your-token" --filter "status=active" --filter "department=engineering"

# Environment variables
export TENANT_ID="tenant123"
export ACCESS_TOKEN="your-token"
python run_query_tenant_users.py

# Pretty print output
python run_query_tenant_users.py --tenant-id "tenant123" --access-token "your-token" --pretty
```

## Environment Variables

All scripts require the following environment variable:
- `APPLICATION_VANITY_DOMAIN`: Your Wristband application's vanity domain

Each script also supports specific environment variables as alternatives to command line arguments:

| Script | Environment Variables |
|--------|----------------------|
| `run_get_user_info.py` | `USER_ID`, `ACCESS_TOKEN` |
| `run_get_user_nickname.py` | `USER_ID`, `ACCESS_TOKEN` |
| `run_update_user_nickname.py` | `USER_ID`, `NICKNAME`, `ACCESS_TOKEN` |
| `run_query_tenant_users.py` | `TENANT_ID`, `ACCESS_TOKEN` |

## Examples

### Complete workflow example:
```bash
# Set common environment variables
export APPLICATION_VANITY_DOMAIN="myapp.wristband.dev"
export ACCESS_TOKEN="your-access-token"

# Get user info
python run_get_user_info.py --user-id "user123" --pretty

# Get user nickname
python run_get_user_nickname.py --user-id "user123"

# Update user nickname
python run_update_user_nickname.py --user-id "user123" --nickname "John Smith" --pretty

# Query tenant users
python run_query_tenant_users.py --tenant-id "tenant456" --page 1 --page-size 10 --pretty
```

### Using environment variables for batch operations:
```bash
# Create a .env file or export variables
export APPLICATION_VANITY_DOMAIN="myapp.wristband.dev"
export ACCESS_TOKEN="your-access-token"
export USER_ID="user123"
export TENANT_ID="tenant456"

# Run scripts without arguments
python run_get_user_info.py --pretty
python run_get_user_nickname.py
python run_query_tenant_users.py --pretty
```

## Error Handling

All scripts include comprehensive error handling:
- Missing required arguments will show helpful error messages
- API errors are caught and displayed with status codes
- Invalid input is validated before making API calls

## Help Information

Each script includes built-in help:
```bash
python run_get_user_info.py --help
python run_get_user_nickname.py --help
python run_update_user_nickname.py --help
python run_query_tenant_users.py --help
```

## Development Notes

- All scripts are executable (`chmod +x` has been applied)
- They use the `WristbandApiClient` from `../src/clients/wristband_client.py`
- Python path is automatically configured to find the source modules
- Async/await is properly handled using `asyncio.run()`
- JSON output can be pretty-printed with the `--pretty` flag where applicable

## Troubleshooting

1. **Import errors**: Make sure you're running the scripts from the correct directory and that the backend dependencies are installed.

2. **Environment variable issues**: Double-check that `APPLICATION_VANITY_DOMAIN` is set correctly.

3. **API errors**: Verify that your access token is valid and has the necessary permissions.

4. **Network issues**: Ensure you have internet connectivity and can reach the Wristband API endpoints. 