FROM python:3.11-slim

# Accept build arg for environment
ARG ENVIRONMENT=DEV
ENV ENVIRONMENT=$ENVIRONMENT

WORKDIR /app

# Copy requirements and application code
COPY backend/pyproject.toml backend/run.py /app/
COPY backend/src/ /app/src/
# Copy the entire backend directory to handle optional files
COPY backend/ /app/backend/

# Create directory for credentials
RUN mkdir -p /app/credentials

# Install pip and dependencies
RUN pip install .

# Expose port (Cloud Run uses 8080)
EXPOSE 8080

# Create an entrypoint script that will handle the Firebase credentials
RUN echo '#!/bin/sh\n\
# Handle Firebase service account key\n\
if [ -n "$FIREBASE_SERVICE_ACCOUNT_KEY" ]; then\n\
  echo "$FIREBASE_SERVICE_ACCOUNT_KEY" > /app/firebase-service-account-key.json\n\
  echo "Using Firebase credentials from environment variable"\n\
elif [ -f "/app/backend/service_accounts/firebase-service-account-key.json" ]; then\n\
  cp /app/backend/service_accounts/firebase-service-account-key.json /app/firebase-service-account-key.json\n\
  echo "Using Firebase credentials from file"\n\
else\n\
  echo "Warning: No Firebase service account key found (env var or file)"\n\
  touch /app/firebase-service-account-key.json\n\
fi\n\
\n\
exec "$@"' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

# Set the entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]

# Run the application
CMD ["python", "run.py"] 