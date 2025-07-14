#!/usr/bin/env python3
"""
Interactive test script to explore Wristband API responses.

This script allows you to call various Wristband API methods and see the actual
responses with your real credentials. Perfect for understanding the API structure
and testing with live data.
"""

import asyncio
import json
import os
import sys
from typing import Any, Dict, Optional
import argparse
from src.clients.wristband_client import WristbandApiClient


def print_header(title: str):
    """Print a formatted header"""
    print(f"\n{'='*60}")
    print(f" {title}")
    print(f"{'='*60}")


def print_response(method_name: str, response: Any, status: str = "SUCCESS"):
    """Print a formatted API response"""
    print(f"\n📡 {method_name} - {status}")
    print("-" * 50)
    
    if isinstance(response, dict):
        print(json.dumps(response, indent=2, default=str))
    elif isinstance(response, str):
        print(f'"{response}"')
    else:
        print(response)


def print_error(method_name: str, error: Exception):
    """Print a formatted error"""
    print(f"\n❌ {method_name} - ERROR")
    print("-" * 50)
    print(f"Error: {error}")


async def test_get_user_info(client: WristbandApiClient, user_id: str, access_token: str):
    """Test get_user_info method"""
    try:
        response = await client.get_user_info(user_id, access_token)
        print_response("get_user_info", response)
        return response
    except Exception as e:
        print_error("get_user_info", e)
        return None


async def test_get_user_nickname(client: WristbandApiClient, user_id: str, access_token: str):
    """Test get_user_nickname method"""
    try:
        response = await client.get_user_nickname(user_id, access_token)
        print_response("get_user_nickname", response)
        return response
    except Exception as e:
        print_error("get_user_nickname", e)
        return None


async def test_query_tenant_users(client: WristbandApiClient, tenant_id: str, access_token: str, 
                                 page: int = 1, page_size: int = 10, **filters):
    """Test query_tenant_users method"""
    try:
        response = await client.query_tenant_users(tenant_id, access_token, page, page_size, **filters)
        print_response("query_tenant_users", response)
        return response
    except Exception as e:
        print_error("query_tenant_users", e)
        return None


async def test_update_user_nickname(client: WristbandApiClient, user_id: str, 
                                   nickname: str, access_token: str):
    """Test update_user_nickname method"""
    try:
        # Get original nickname first
        original_nickname = await client.get_user_nickname(user_id, access_token)
        print(f"Original nickname: '{original_nickname}'")
        
        # Update nickname
        response = await client.update_user_nickname(user_id, nickname, access_token)
        print_response("update_user_nickname", response)
        
        # Verify the change
        new_nickname = await client.get_user_nickname(user_id, access_token)
        print(f"New nickname: '{new_nickname}'")
        
        # Ask if user wants to restore original
        if original_nickname != nickname:
            restore = input(f"\nRestore original nickname '{original_nickname}'? (y/n): ").lower()
            if restore == 'y':
                await client.update_user_nickname(user_id, original_nickname, access_token)
                print(f"✅ Restored original nickname: '{original_nickname}'")
        
        return response
    except Exception as e:
        print_error("update_user_nickname", e)
        return None


async def interactive_mode(client: WristbandApiClient, args):
    """Interactive mode for testing different methods"""
    print_header("🎮 INTERACTIVE MODE")
    print("Available commands:")
    print("  1. get_user_info")
    print("  2. get_user_nickname")
    print("  3. query_tenant_users")
    print("  4. update_user_nickname")
    print("  5. quit")
    
    while True:
        try:
            choice = input("\nEnter command (1-5): ").strip()
            
            if choice == "1":
                user_id = input("Enter user ID: ").strip()
                if user_id:
                    await test_get_user_info(client, user_id, args.access_token)
                    
            elif choice == "2":
                user_id = input("Enter user ID: ").strip()
                if user_id:
                    await test_get_user_nickname(client, user_id, args.access_token)
                    
            elif choice == "3":
                tenant_id = input("Enter tenant ID: ").strip()
                if tenant_id:
                    page = input("Enter page (default 1): ").strip() or "1"
                    page_size = input("Enter page size (default 10): ").strip() or "10"
                    await test_query_tenant_users(client, tenant_id, args.access_token, 
                                                 int(page), int(page_size))
                    
            elif choice == "4":
                user_id = input("Enter user ID: ").strip()
                nickname = input("Enter new nickname: ").strip()
                if user_id and nickname:
                    await test_update_user_nickname(client, user_id, nickname, args.access_token)
                    
            elif choice == "5":
                print("👋 Goodbye!")
                break
                
            else:
                print("Invalid choice. Please enter 1-5.")
                
        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"❌ Error: {e}")


async def run_all_tests(client: WristbandApiClient, args):
    """Run all available tests"""
    print_header("🚀 RUNNING ALL TESTS")
    
    # Test get_user_info
    if args.user_id:
        await test_get_user_info(client, args.user_id, args.access_token)
        await test_get_user_nickname(client, args.user_id, args.access_token)
    
    # Test query_tenant_users
    if args.tenant_id:
        await test_query_tenant_users(client, args.tenant_id, args.access_token)
    
    # Test update_user_nickname (only if explicitly requested)
    if args.test_nickname and args.user_id:
        await test_update_user_nickname(client, args.user_id, args.test_nickname, args.access_token)


def check_environment():
    """Check if required environment variables are set"""
    required_vars = ["APPLICATION_VANITY_DOMAIN"]
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print("❌ Missing required environment variables:")
        for var in missing_vars:
            print(f"  - {var}")
        print("\nPlease set these environment variables and try again.")
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description="Interactive Wristband API Response Explorer"
    )
    parser.add_argument(
        "--access-token", 
        type=str, 
        default=os.getenv("LIVE_ACCESS_TOKEN"),
        help="Wristband access token"
    )
    parser.add_argument(
        "--user-id", 
        type=str, 
        default=os.getenv("LIVE_USER_ID"),
        help="User ID for testing"
    )
    parser.add_argument(
        "--tenant-id", 
        type=str, 
        default=os.getenv("LIVE_TENANT_ID"),
        help="Tenant ID for testing"
    )
    parser.add_argument(
        "--test-nickname", 
        type=str, 
        help="Test nickname for update operations"
    )
    parser.add_argument(
        "--interactive", 
        action="store_true", 
        help="Run in interactive mode"
    )
    parser.add_argument(
        "--method", 
        type=str, 
        choices=["get_user_info", "get_user_nickname", "query_tenant_users", "update_user_nickname"],
        help="Run specific method only"
    )
    
    args = parser.parse_args()
    
    # Check environment
    check_environment()
    
    # Validate required arguments
    if not args.access_token:
        print("❌ Access token required. Set LIVE_ACCESS_TOKEN environment variable or use --access-token")
        sys.exit(1)
    
    print_header("🔍 WRISTBAND API RESPONSE EXPLORER")
    print(f"Domain: {os.getenv('APPLICATION_VANITY_DOMAIN')}")
    print(f"Access Token: {'*' * min(len(args.access_token), 20)}...")
    print(f"User ID: {args.user_id or 'Not provided'}")
    print(f"Tenant ID: {args.tenant_id or 'Not provided'}")
    
    # Create client
    try:
        client = WristbandApiClient()
    except Exception as e:
        print(f"❌ Failed to create client: {e}")
        sys.exit(1)
    
    # Run based on mode
    asyncio.run(run_tests(client, args))


async def run_tests(client: WristbandApiClient, args):
    """Run the appropriate test mode"""
    try:
        if args.interactive:
            await interactive_mode(client, args)
        elif args.method:
            await run_specific_method(client, args)
        else:
            await run_all_tests(client, args)
    finally:
        await client.client.aclose()


async def run_specific_method(client: WristbandApiClient, args):
    """Run a specific method"""
    print_header(f"🎯 TESTING {args.method.upper()}")
    
    if args.method == "get_user_info":
        if not args.user_id:
            print("❌ User ID required for get_user_info")
            return
        await test_get_user_info(client, args.user_id, args.access_token)
        
    elif args.method == "get_user_nickname":
        if not args.user_id:
            print("❌ User ID required for get_user_nickname")
            return
        await test_get_user_nickname(client, args.user_id, args.access_token)
        
    elif args.method == "query_tenant_users":
        if not args.tenant_id:
            print("❌ Tenant ID required for query_tenant_users")
            return
        await test_query_tenant_users(client, args.tenant_id, args.access_token)
        
    elif args.method == "update_user_nickname":
        if not args.user_id:
            print("❌ User ID required for update_user_nickname")
            return
        if not args.test_nickname:
            print("❌ Test nickname required for update_user_nickname (use --test-nickname)")
            return
        await test_update_user_nickname(client, args.user_id, args.test_nickname, args.access_token)


if __name__ == "__main__":
    main() 