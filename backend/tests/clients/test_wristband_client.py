import pytest
import httpx
import os
from unittest.mock import AsyncMock, patch, MagicMock
from src.clients.wristband_client import WristbandApiClient


class TestWristbandApiClient:
    """Test suite for WristbandApiClient"""

    @pytest.fixture
    def mock_env(self):
        """Mock environment variables"""
        with patch.dict(os.environ, {"APPLICATION_VANITY_DOMAIN": "test-domain.wristband.dev"}):
            yield

    @pytest.fixture
    def client(self, mock_env):
        """Create a WristbandApiClient instance for testing"""
        return WristbandApiClient()

    @pytest.fixture
    def mock_httpx_client(self):
        """Mock httpx.AsyncClient"""
        with patch('httpx.AsyncClient') as mock_client:
            yield mock_client.return_value

    def test_init_with_valid_domain(self, mock_env):
        """Test successful initialization with valid domain"""
        client = WristbandApiClient()
        assert client.base_url == "https://test-domain.wristband.dev/api/v1"
        assert client.headers == {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }

    def test_init_without_domain_raises_error(self):
        """Test initialization without APPLICATION_VANITY_DOMAIN raises ValueError"""
        with patch.dict(os.environ, {}, clear=True):
            with pytest.raises(ValueError, match="wristband_application_vanity_domain required for WristbandApiClient"):
                WristbandApiClient()

    @pytest.mark.asyncio
    async def test_get_user_info_success(self, client, mock_httpx_client):
        """Test successful get_user_info call"""
        # Arrange
        user_id = "test-user-123"
        access_token = "test-token"
        expected_response = {
            "id": user_id,
            "email": "test@example.com",
            "displayName": "Test User",
            "nickname": "testuser"
        }
        
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.content = b'{"id": "test-user-123", "email": "test@example.com"}'
        mock_response.json.return_value = expected_response
        
        mock_httpx_client.get = AsyncMock(return_value=mock_response)
        client.client = mock_httpx_client

        # Act
        result = await client.get_user_info(user_id, access_token)

        # Assert
        assert result == expected_response
        mock_httpx_client.get.assert_called_once_with(
            f"{client.base_url}/users/{user_id}",
            headers={
                **client.headers,
                'Authorization': f'Bearer {access_token}'
            }
        )

    @pytest.mark.asyncio
    async def test_get_user_info_empty_response(self, client, mock_httpx_client):
        """Test get_user_info with empty response content"""
        # Arrange
        user_id = "test-user-123"
        access_token = "test-token"
        
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.content = b''
        
        mock_httpx_client.get = AsyncMock(return_value=mock_response)
        client.client = mock_httpx_client

        # Act
        result = await client.get_user_info(user_id, access_token)

        # Assert
        assert result == {}
        mock_httpx_client.get.assert_called_once_with(
            f"{client.base_url}/users/{user_id}",
            headers={
                **client.headers,
                'Authorization': f'Bearer {access_token}'
            }
        )

    @pytest.mark.asyncio
    async def test_get_user_info_404_error(self, client, mock_httpx_client):
        """Test get_user_info with 404 error"""
        # Arrange
        user_id = "nonexistent-user"
        access_token = "test-token"
        
        mock_response = MagicMock()
        mock_response.status_code = 404
        mock_response.text = "User not found"
        
        mock_httpx_client.get = AsyncMock(return_value=mock_response)
        client.client = mock_httpx_client

        # Act & Assert
        with pytest.raises(ValueError, match="Error calling get_user_info: 404 - User not found"):
            await client.get_user_info(user_id, access_token)

    @pytest.mark.asyncio
    async def test_get_user_info_401_unauthorized(self, client, mock_httpx_client):
        """Test get_user_info with 401 unauthorized error"""
        # Arrange
        user_id = "test-user-123"
        access_token = "invalid-token"
        
        mock_response = MagicMock()
        mock_response.status_code = 401
        mock_response.text = "Unauthorized"
        
        mock_httpx_client.get = AsyncMock(return_value=mock_response)
        client.client = mock_httpx_client

        # Act & Assert
        with pytest.raises(ValueError, match="Error calling get_user_info: 401 - Unauthorized"):
            await client.get_user_info(user_id, access_token)

    @pytest.mark.asyncio
    async def test_get_user_info_500_server_error(self, client, mock_httpx_client):
        """Test get_user_info with 500 server error"""
        # Arrange
        user_id = "test-user-123"
        access_token = "test-token"
        
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_response.text = "Internal Server Error"
        
        mock_httpx_client.get = AsyncMock(return_value=mock_response)
        client.client = mock_httpx_client

        # Act & Assert
        with pytest.raises(ValueError, match="Error calling get_user_info: 500 - Internal Server Error"):
            await client.get_user_info(user_id, access_token)

    @pytest.mark.asyncio
    async def test_get_user_info_network_error(self, client, mock_httpx_client):
        """Test get_user_info with network error"""
        # Arrange
        user_id = "test-user-123"
        access_token = "test-token"
        
        mock_httpx_client.get = AsyncMock(side_effect=httpx.NetworkError("Network error"))
        client.client = mock_httpx_client

        # Act & Assert
        with pytest.raises(httpx.NetworkError, match="Network error"):
            await client.get_user_info(user_id, access_token)

    @pytest.mark.asyncio
    async def test_get_user_info_timeout_error(self, client, mock_httpx_client):
        """Test get_user_info with timeout error"""
        # Arrange
        user_id = "test-user-123"
        access_token = "test-token"
        
        mock_httpx_client.get = AsyncMock(side_effect=httpx.TimeoutException("Request timeout"))
        client.client = mock_httpx_client

        # Act & Assert
        with pytest.raises(httpx.TimeoutException, match="Request timeout"):
            await client.get_user_info(user_id, access_token)

    @pytest.mark.asyncio
    async def test_get_user_info_with_special_characters(self, client, mock_httpx_client):
        """Test get_user_info with special characters in user_id"""
        # Arrange
        user_id = "test-user-123@domain.com"
        access_token = "test-token"
        expected_response = {"id": user_id, "email": "test@example.com"}
        
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.content = b'{"id": "test-user-123@domain.com"}'
        mock_response.json.return_value = expected_response
        
        mock_httpx_client.get = AsyncMock(return_value=mock_response)
        client.client = mock_httpx_client

        # Act
        result = await client.get_user_info(user_id, access_token)

        # Assert
        assert result == expected_response
        mock_httpx_client.get.assert_called_once_with(
            f"{client.base_url}/users/{user_id}",
            headers={
                **client.headers,
                'Authorization': f'Bearer {access_token}'
            }
        )

    @pytest.mark.asyncio
    async def test_get_user_info_with_different_token_formats(self, client, mock_httpx_client):
        """Test get_user_info with different token formats"""
        # Arrange
        user_id = "test-user-123"
        access_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
        expected_response = {"id": user_id, "email": "test@example.com"}
        
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.content = b'{"id": "test-user-123"}'
        mock_response.json.return_value = expected_response
        
        mock_httpx_client.get = AsyncMock(return_value=mock_response)
        client.client = mock_httpx_client

        # Act
        result = await client.get_user_info(user_id, access_token)

        # Assert
        assert result == expected_response
        mock_httpx_client.get.assert_called_once_with(
            f"{client.base_url}/users/{user_id}",
            headers={
                **client.headers,
                'Authorization': f'Bearer {access_token}'
            }
        )

    @pytest.mark.asyncio
    async def test_get_user_info_malformed_json_response(self, client, mock_httpx_client):
        """Test get_user_info with malformed JSON response"""
        # Arrange
        user_id = "test-user-123"
        access_token = "test-token"
        
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.content = b'{"invalid": json}'
        mock_response.json.side_effect = ValueError("Invalid JSON")
        
        mock_httpx_client.get = AsyncMock(return_value=mock_response)
        client.client = mock_httpx_client

        # Act & Assert
        with pytest.raises(ValueError, match="Invalid JSON"):
            await client.get_user_info(user_id, access_token) 