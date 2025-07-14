#!/usr/bin/env python3
"""
Script to run live integration tests for the Wristband API client.

This script helps you run integration tests against the actual Wristband API
with real tokens and user IDs.
"""

import os
import sys
import subprocess
import argparse
from pathlib import Path


def check_environment():
    """Check if required environment variables are set."""
    required_vars = [
        "APPLICATION_VANITY_DOMAIN",
        "LIVE_ACCESS_TOKEN", 
        "LIVE_USER_ID"
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    return missing_vars


def print_setup_instructions():
    """Print instructions for setting up environment variables."""
    print("🔧 SETUP INSTRUCTIONS")
    print("=" * 50)
    print("To run live tests, you need to set these environment variables:")
    print()
    print("Required variables:")
    print("  APPLICATION_VANITY_DOMAIN  - Your Wristband application domain")
    print("  LIVE_ACCESS_TOKEN         - Valid Wristband access token")
    print("  LIVE_USER_ID              - Valid user ID for testing")
    print()
    print("Example setup:")
    print("  export APPLICATION_VANITY_DOMAIN='your-app.wristband.dev'")
    print("  export LIVE_ACCESS_TOKEN='your-access-token'")
    print("  export LIVE_USER_ID='your-user-id'")
    print()
    print("Or create a .env file in the backend directory with:")
    print("  APPLICATION_VANITY_DOMAIN=your-app.wristband.dev")
    print("  LIVE_ACCESS_TOKEN=your-access-token")
    print("  LIVE_USER_ID=your-user-id")
    print()


def run_tests(test_args=None):
    """Run the integration tests."""
    if test_args is None:
        test_args = []
    
    cmd = [
        sys.executable, "-m", "pytest",
        "tests/integration/",
        "-m", "integration",
        "-v",
        "--tb=short"
    ] + test_args
    
    print(f"Running command: {' '.join(cmd)}")
    return subprocess.run(cmd, cwd=Path(__file__).parent)


def main():
    parser = argparse.ArgumentParser(
        description="Run live integration tests for Wristband API client"
    )
    parser.add_argument(
        "--setup", 
        action="store_true", 
        help="Show setup instructions"
    )
    parser.add_argument(
        "--check", 
        action="store_true", 
        help="Check environment variables without running tests"
    )
    parser.add_argument(
        "--coverage", 
        action="store_true", 
        help="Run tests with coverage reporting"
    )
    parser.add_argument(
        "--method", 
        type=str, 
        help="Run tests for specific method (e.g., get_user_info)"
    )
    parser.add_argument(
        "--force", 
        action="store_true", 
        help="Force run tests even if environment variables are missing"
    )
    
    args = parser.parse_args()
    
    if args.setup:
        print_setup_instructions()
        return 0
    
    print("🧪 WRISTBAND API LIVE TESTS")
    print("=" * 50)
    
    # Check environment variables
    missing_vars = check_environment()
    if missing_vars and not args.force:
        print("❌ Missing required environment variables:")
        for var in missing_vars:
            print(f"  - {var}")
        print()
        print("Run with --setup for setup instructions")
        print("Or use --force to run anyway (tests will be skipped)")
        return 1
    
    if args.check:
        if missing_vars:
            print("❌ Environment check failed")
            print("Missing variables:", missing_vars)
            return 1
        else:
            print("✅ Environment check passed")
            print("All required variables are set")
            return 0
    
    # Build test arguments
    test_args = []
    
    if args.coverage:
        test_args.extend(["--cov=src", "--cov-report=html", "--cov-report=term"])
    
    if args.method:
        test_args.extend(["-k", args.method])
    
    # Run tests
    print("🚀 Running live integration tests...")
    if missing_vars:
        print("⚠️  Warning: Some environment variables are missing.")
        print("   Tests will be skipped if required variables are not set.")
    
    result = run_tests(test_args)
    
    if result.returncode == 0:
        print("\n✅ All tests passed!")
        if args.coverage:
            print("📊 Coverage report generated in htmlcov/index.html")
    else:
        print("\n❌ Some tests failed")
    
    return result.returncode


if __name__ == "__main__":
    sys.exit(main()) 