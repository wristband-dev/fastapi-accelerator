ROM python:3.11-slim

# Accept build arg for environment
ARG ENVIRONMENT=DEV
ENV ENVIRONMENT=$ENVIRONMENT

WORKDIR /app

# Copy requirements and application code
COPY backend/pyproject.toml backend/run.py /app/
COPY backend/src/ /app/src/
# Copy Firebase credentials
COPY backend/service_accounts/firebase-service-account-key.json /app/firebase-service-account-key.json

# Create directory for credentials
RUN mkdir -p /app/credentials

# Install pip and dependencies
RUN pip install .

# Expose port
EXPOSE 6001

# Create an entrypoint script that will handle the Firebase credentials
RUN echo '#!/bin/sh\n\
if [ -n "$FIREBASE_SERVICE_ACCOUNT_KEY" ]; then\n\
  echo "$FIREBASE_SERVICE_ACCOUNT_KEY" > /app/firebase-service-account-key.json\n\
  echo "Using Firebase credentials from environment variable"\n\
fi\n\
\n\
exec "$@"' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

# Set the entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]

# Run the application
CMD ["python", "run.py"] 