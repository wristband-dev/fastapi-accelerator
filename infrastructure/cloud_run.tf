# Cloud Run service for the API
resource "google_cloud_run_service" "api" {
  name     = "${var.app_name}-${var.api_name}"
  location = var.region
  project  = google_project.project.project_id

  template {
    spec {
      containers {
        # Use a placeholder image that exists by default
        image = "gcr.io/cloudrun/hello"
        
        ports {
          container_port = 6001
        }

        # Environment variables if needed
        # env {
        #   name  = "ENV_VAR_NAME"
        #   value = "env_var_value"
        # }
      }

      # Use the service account for the Cloud Run service
      service_account_name = google_service_account.cloud_run_sa.email
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  autogenerate_revision_name = true

  depends_on = [
    google_project_service.services["run.googleapis.com"],
    google_artifact_registry_repository.api_repo
  ]

  # Add lifecycle block to prevent replacement when image changes
  lifecycle {
    ignore_changes = [
      template[0].spec[0].containers[0].image
    ]
  }
}

# Allow unauthenticated access to the Cloud Run service
resource "google_cloud_run_service_iam_member" "public_access" {
  service  = google_cloud_run_service.api.name
  location = google_cloud_run_service.api.location
  project  = google_project.project.project_id
  role     = "roles/run.invoker"
  member   = "allUsers"
} 