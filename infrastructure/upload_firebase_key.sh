#!/bin/bash
# Upload the Firebase service account key to Secret Manager
    
# Ensure we're in the infrastructure directory
cd "$(dirname "$0")" || exit
    
# Check if the Firebase service account key exists
if [ ! -f "../backend/service_accounts/firebase-service-account-key.json" ]; then
  echo "Firebase service account key not found. Exporting it first..."
  ./export_firebase_key.sh
fi
    
# Upload the key to Secret Manager
echo "Uploading Firebase service account key to Secret Manager..."
gcloud secrets versions add firebase-service-account --data-file="../backend/service_accounts/firebase-service-account-key.json"
    
echo "Secret uploaded successfully!"
