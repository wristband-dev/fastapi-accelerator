terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
    local = {
      source  = "hashicorp/local"
      version = "~> 2.4"
    }
  }
  required_version = ">= 1.0"
}

provider "google" {
  # Don't specify project here since we're creating it
  region = var.region
}

provider "google-beta" {
  # Don't specify project here since we're creating it
  region = var.region
}

# Create the project if it doesn't exist
resource "google_project" "project" {
  name            = "${var.app_name} App"
  project_id      = var.project_id
  billing_account = var.billing_account_id
}

# Link the project to the billing account
resource "google_billing_project_info" "billing_link" {
  project         = google_project.project.project_id
  billing_account = var.billing_account_id
  
  depends_on = [google_project.project]
}

# Enable required APIs
resource "google_project_service" "services" {
  for_each = toset([
    "cloudresourcemanager.googleapis.com",
    "serviceusage.googleapis.com",
    "run.googleapis.com",
    "firebase.googleapis.com",
    "firestore.googleapis.com",
    "identitytoolkit.googleapis.com",
    "cloudbilling.googleapis.com",
    "iam.googleapis.com",
    "storage.googleapis.com",
    "firebasestorage.googleapis.com",
    "fcm.googleapis.com",
    "fcmregistrations.googleapis.com",
    "mobilecrashreporting.googleapis.com"
  ])

  project = google_project.project.project_id
  service = each.key

  disable_dependent_services = true
  disable_on_destroy         = false
  
  depends_on = [google_billing_project_info.billing_link]
}

# Enable Firebase for the project
resource "google_firebase_project" "default" {
  provider = google-beta
  project  = google_project.project.project_id
  
  depends_on = [
    google_project_service.services
  ]
}

# Create the default Firestore database (required)
resource "google_app_engine_application" "firestore_default" {
  project       = google_project.project.project_id
  location_id   = var.firestore_location
  database_type = "CLOUD_FIRESTORE"
  
  depends_on = [
    google_firebase_project.default
  ]
}

# Create separate Firestore databases for each environment
resource "google_firestore_database" "dev" {
  provider    = google-beta
  project     = google_project.project.project_id
  name        = "dev-db"
  location_id = var.region
  type        = "FIRESTORE_NATIVE"
  
  point_in_time_recovery_enablement = "POINT_IN_TIME_RECOVERY_DISABLED"
  deletion_policy                   = "ABANDON"
  
  depends_on = [
    google_app_engine_application.firestore_default
  ]
}

resource "google_firestore_database" "staging" {
  provider    = google-beta
  project     = google_project.project.project_id
  name        = "staging-db"
  location_id = var.region
  type        = "FIRESTORE_NATIVE"
  
  point_in_time_recovery_enablement = "POINT_IN_TIME_RECOVERY_DISABLED"
  deletion_policy                   = "ABANDON"
  
  depends_on = [
    google_app_engine_application.firestore_default
  ]
}

resource "google_firestore_database" "prod" {
  provider    = google-beta
  project     = google_project.project.project_id
  name        = "prod-db"
  location_id = var.region
  type        = "FIRESTORE_NATIVE"
  
  point_in_time_recovery_enablement = "POINT_IN_TIME_RECOVERY_DISABLED"
  deletion_policy                   = "ABANDON"
  
  depends_on = [
    google_app_engine_application.firestore_default
  ]
}

# Create Firebase Storage bucket
resource "google_firebase_storage_bucket" "default" {
  provider  = google-beta
  project   = google_project.project.project_id
  bucket_id = "${var.project_id}.appspot.com"  # Standard Firebase bucket format
  
  depends_on = [
    google_firebase_project.default
  ]
}

# Set default Firebase Storage rules
resource "google_firebaserules_release" "storage_rules" {
  provider     = google-beta
  name         = "firebase.storage/${google_firebase_storage_bucket.default.bucket_id}/firebasestorage.rules"
  project      = google_project.project.project_id
  ruleset_name = google_firebaserules_ruleset.storage_rules.name

  depends_on = [
    google_firebase_storage_bucket.default
  ]
}

# Firebase location is set by the App Engine application above
# No additional location resource needed for FCM

resource "google_firebaserules_ruleset" "storage_rules" {
  provider = google-beta
  project  = google_project.project.project_id
  source {
    files {
      name    = "firebase.storage.rules"
      content = <<EOF
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      // Only allow authenticated users to access storage
      allow read, write: if request.auth != null;
    }
  }
}
EOF
    }
  }

  depends_on = [
    google_firebase_storage_bucket.default
  ]
} 