#!/bin/bash

# Script to export the Firebase service account key to the backend directory

# Ensure we're in the infrastructure directory
cd "$(dirname "$0")" || exit

# Export the Firebase service account key
terraform output -raw firebase_service_account_key | base64 --decode > ../backend/service_accounts/firebase-service-account-key.json

echo "Firebase service account key exported to backend/service_accounts/firebase-service-account-key.json" 