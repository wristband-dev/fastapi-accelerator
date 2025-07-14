variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "billing_account_id" {
  description = "The GCP billing account ID"
  type        = string
}

variable "region" {
  description = "The default GCP region for resources"
  type        = string
  default     = "us-central1"
}

variable "firestore_location" {
  description = "The location for Firestore database"
  type        = string
  default     = "us-central"
}



variable "app_name" {
  description = "The base name of the application (used in resource naming)"
  type        = string
  default     = "app"
}

variable "api_name" {
  description = "The name of the API component"
  type        = string
  default     = "api"
}

variable "api_repo_name" {
  description = "The name of the API repository"
  type        = string
  default     = "api-repo"
} 