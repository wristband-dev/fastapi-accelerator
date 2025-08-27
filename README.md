<div align="center">
  <a href="https://wristband.dev">
    <picture>
      <img src="https://assets.wristband.dev/images/email_branding_logo_v1.png" alt="Github" width="297" height="64">
    </picture>
  </a>
  <p align="center">
    Enterprise-ready auth that is secure by default, truly multi-tenant, and ungated for small businesses.
  </p>
  <p align="center">
    <b>
      <a href="https://wristband.dev">Website</a> •
      <a href="https://docs.wristband.dev">Documentation</a>
    </b>
  </p>
</div>

<br/>

---

# Multi-Tenant App Accelerator

![Python](https://img.shields.io/badge/python-v3.8+-blue.svg)
![Node](https://img.shields.io/badge/node-v18+-green.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-red.svg)
![Next.js](https://img.shields.io/badge/Next.js-13+-black.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

This app consists of:

- **FastAPI Backend**: A Python backend with Wristband authentication integration
- **Next.js Frontend**: A React-based frontend with authentication context
- **GCP Firebase DocStore (Optional)**: Integration to GCP Firebase for document storage
- **GCP Cloud Run (Optional)**: Integration to GCP Cloud Run to host your fast api application 
- **Cloud Flare (Optional)**: Integration to Cloud Flare to host the front end


## Table of Contents

- [🎯 Features](#-features)
- [📋 Requirements](#-requirements)
- [🔧 Optional Requirements](#-optional-requirements)
- [🚀 Getting Started](#-getting-started)
- [🌐 Deployment](#-deployment)
- [❓ Questions](#-questions)

## 🎯 Features

- **🔐 Enterprise Authentication**: Secure Wristband auth integration
- **🏢 Multi-Tenant Architecture**: Built-in tenant management
- **⚡ FastAPI Backend**: High-performance Python API
- **⚛️ Next.js Frontend**: Modern React-based UI
- **☁️ Cloud-Ready**: GCP deployment with Terraform
- **📊 Firebase Integration**: Optional document storage
- **🛡️ Security First**: CSRF protection and secure sessions

<br>
<hr>
<br>

## 📋 Requirements

This demo app requires the following prerequisites:

### Python 3
1. Visit [Python Downloads](https://www.python.org/downloads/) or [How to install python on Mac](https://www.dataquest.io/blog/installing-python-on-mac/)
2. Download and install the latest Python 3 version
3. Verify the installation by opening a terminal or command prompt and running:
```bash
python --version # Should show Python 3.x.x
```

### Node.js and NPM
1. Visit [NPM Downloads](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
2. Download and install the appropriate version for your OS
3. Verify the installation by opening a terminal or command prompt and running:
```bash
node --version # Should show v18.x.x or higher
npm --version  # Should show v8.x.x or higher
```
```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install node
```

<br>
<hr>
<br>

## 🔧 Optional Requirements

### Poetry
Poetry is used for python project and dependency management. The `package.json` already has pip install shortcuts built in but this can help with future development.
1. Visit [Poetry Downloads](https://python-poetry.org/docs/)
2. Download and install the appropriate version for your OS
3. Verify the installation by opening a terminal or command prompt and running:
```bash
poetry --version # Should show v18.x.x or higher
```

### Terraform
Terraform is used to manage the GCP infrastructure as code if you are intending on using firebase for documenent storeage.
1. Visit [Terraform Install](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli) 
2. Download and install the latest 
3. Verify the installation by opening a terminal or command prompt and running:
```bash
terraform --version # Should show Terraform vx.x.x
```
> **Note**: Needed for Deployment & Document Storage

### Google Cloud
GCP is used for firebase integration for the purposes of document storage
1. Visit [gcloud sdk install](https://cloud.google.com/sdk/docs/install) 
2. Download and install the latest 
3. Verify the installation by opening a terminal or command prompt and running:
```bash
gcloud --version # Should show Google Cloud SDK x.x.x
```
4. Init you gcloud account
```bash
gcloud init
```
> **Note**: Needed for Deployment & Document Storage

<br>
<hr>
<br>


## 🚀 Getting Started
You can start up the demo application in a few simple steps.
### Wristband Setup
#### 1) Sign up for a [Wristband account](https://wristband.dev)
#### 2) Create an App
#### 3) Follow [Wristband App Setup](./WRISTBAND_SETUP_STEPS.md)
> 💡 **Tip**: You can also follow the other [Demo App Guide](https://docs.wristband.dev/docs/setting-up-a-demo-app) for more detailed information.


### Fork Repo
```bash
# 1. Clone and setup
git clone https://github.com/wristband-dev/fastapi-accelerator.git
cd fastapi-accelerator
npm run setup

# 2. Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your Wristband credentials
```

### Setup Environment
Create files and enter values from wristband
```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
```


### Install Dependencies
```bash
npm run setup
```

### Run the application
Runs `backend` and `frontend` concurrently
```bash
npm start
```

<br>
<hr>
<br>

## ☁️ Deployment

This repository is set up to use terraform to deploy on google cloud platform for hosting of the fast api as well as using firebase for the datastore.

### Update Project Configuration

Before deploying, you need to configure the Terraform variables with your specific GCP project details:

1. **Edit the configuration file**: Open `infrastructure/config.tfvars` and update the following values:

   ```bash
   project_id          = "your-gcp-project-id"
   app_name            = "your-app-name"
   billing_account_id  = "your-billing-account-id"
   region              = "us-central1"
   firestore_location  = "us-central"
   api_name            = "api"
   api_repo_name       = "api-repo"
   ```

2. **Required updates**:
   - `project_id`: Your GCP project ID (find this in the GCP Console or run `gcloud config get-value project`)
   - `app_name`: A unique name for your application (used in resource naming)
   - `billing_account_id`: Your GCP billing account ID (find this in the GCP Console under Billing)

3. **Optional updates**:
   - `region`: The GCP region where resources will be deployed (default: `us-central1`)
   - `firestore_location`: The location for your Firestore database (default: `us-central`)
   - `api_name` and `api_repo_name`: Names for the API components (can be left as defaults)

> **Note**: Make sure your GCP project has billing enabled before proceeding with deployment.

### Apply Infrastructure

```bash
cd infrastructure
./terraform.sh init
./terraform.sh plan
./terraform.sh apply -auto-approve
```

### Collect Service Accounts
This will collect the services accounts for `cloud run` and `firebase` which are used locally and for deployment and place them in the `backend/service_accounts` folder
```bash
cd infrastructure
./export_firebase_key.sh
./export_cloud_run_key.sh
```

<br>
<hr>
<br>


## Questions

Reach out to the Wristband team at <support@wristband.dev> for any questions regarding this demo app.

<br/>
