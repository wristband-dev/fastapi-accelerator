#!/bin/bash

# Exit on any error
set -e

echo "Starting Cloud Run deployment..."

# Set project and service variables
# Extract project_id from Terraform config
PROJECT_ID=$(grep 'project_id' infrastructure/config.tfvars | cut -d'"' -f2)
SERVICE_NAME="fastapi-backend"
REGION="us-central1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Authenticate with Google Cloud using service account key
echo "$CLOUD_RUN_SERVICE_ACCOUNT_KEY" | base64 -d > /tmp/gcp-key.json
gcloud auth activate-service-account --key-file=/tmp/gcp-key.json
gcloud config set project $PROJECT_ID

# Build and push the Docker image
echo "Building Docker image..."
docker build -t $IMAGE_NAME \
  --build-arg ENVIRONMENT=PROD \
  -f backend/Dockerfile .

echo "Pushing image to Google Container Registry..."
docker push $IMAGE_NAME

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars ENVIRONMENT=PROD \
  --set-env-vars CLIENT_ID="${CLIENT_ID}" \
  --set-env-vars CLIENT_SECRET="${CLIENT_SECRET}" \
  --set-env-vars APPLICATION_VANITY_DOMAIN="${APPLICATION_VANITY_DOMAIN}" \
  --set-env-vars APPLICATION_ID="${APPLICATION_ID}" \
  --set-env-vars DOMAIN="${DOMAIN}" \
  --set-env-vars FIREBASE_SERVICE_ACCOUNT_KEY="${FIREBASE_SERVICE_ACCOUNT_KEY}" \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')

echo "Deployment completed!"
echo "Service URL: $SERVICE_URL"
echo ""
echo "NEXT STEPS TO COMPLETE SETUP:"
echo "1. Map your custom domain '${DOMAIN}' to this Cloud Run service:"
echo "   gcloud run domain-mappings create --service=${SERVICE_NAME} --domain=${DOMAIN} --region=${REGION}"
echo ""
echo "2. Set up DNS record pointing ${DOMAIN} to ghs.googlehosted.com"
echo ""
echo "3. Once domain mapping is complete, your API will be available at:"
echo "   https://${DOMAIN}/api/auth/login"

# Clean up
rm -f /tmp/gcp-key.json
