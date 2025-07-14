#!/usr/bin/env python3
"""
Run script for WristbandApiClient.get_user_nickname()
Usage: python run_get_user_nickname.py --user-id <user_id> --access-token <token>
       python run_get_user_nickname.py  # Uses environment variables
"""

import argparse
import asyncio
import os
import sys
from pathlib import Path

# Add the src directory to Python path
sys.path.insert(0, str(Path(__file__).parent.parent / 'src'))

from clients.wristband_client import WristbandApiClient


async def main():
    parser = argparse.ArgumentParser(
        description='Get user nickname from Wristband API',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Environment variables:
  USER_ID                User ID to fetch nickname for
  ACCESS_TOKEN          Access token for authentication
  APPLICATION_VANITY_DOMAIN  Application vanity domain (required for WristbandApiClient)

Examples:
  python run_get_user_nickname.py --user-id user123 --access-token token456
  USER_ID=user123 ACCESS_TOKEN=token456 python run_get_user_nickname.py
        """
    )
    
    parser.add_argument(
        '--user-id',
        help='User ID to fetch nickname for (env: USER_ID)',
        default=os.getenv('USER_ID')
    )
    parser.add_argument(
        '--access-token',
        help='Access token for authentication (env: ACCESS_TOKEN)',
        default=os.getenv('ACCESS_TOKEN')
    )
    
    args = parser.parse_args()
    
    # Validate required arguments
    if not args.user_id:
        print("Error: --user-id is required (or set USER_ID environment variable)")
        sys.exit(1)
    
    if not args.access_token:
        print("Error: --access-token is required (or set ACCESS_TOKEN environment variable)")
        sys.exit(1)
    
    if not os.getenv('APPLICATION_VANITY_DOMAIN'):
        print("Error: APPLICATION_VANITY_DOMAIN environment variable is required")
        sys.exit(1)
    
    try:
        # Initialize client and make API call
        client = WristbandApiClient()
        print(f"Fetching nickname for user_id: {args.user_id}")
        
        nickname = await client.get_user_nickname(args.user_id, args.access_token)
        
        # Print results
        if nickname:
            print(f"User nickname: {nickname}")
        else:
            print("User has no nickname set")
            
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main()) 