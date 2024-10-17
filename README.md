# Custom Image Creation with Packer

## Overview 📜

This project utilizes Packer to create custom Amazon Machine Images (AMIs) for deploying a web application. The custom image is built using Ubuntu 24.04 LTS and includes the necessary dependencies, application binaries, and configurations to run the application. All AMIs are built in a DEV AWS account, set to private, and configured to run in the default VPC.

## What It Does 🤖

- **Custom Image Building**: Uses Packer to create a private custom AMI in the DEV AWS account.
- **Local Database Installation**: Installs PostgreSQL on the custom image for database requirements.
- **Application Configuration**: Copies application artifacts, installs dependencies, and sets up services for automatic startup.
- **User and Group Setup**: Creates a non-login system user `csye6225` and assigns ownership of application files.
- **Systemd Integration**: Configures the application to run as a systemd service, starting automatically when an instance is launched.

## Features 🚀

- **Private AMIs**: Ensures that the custom images are private and only accessible by the user.
- **Automated Provisioning**: Uses Packer provisioners to set up the operating system, install necessary software, and configure services.
- **Health Checks**: Ensures that the custom image includes mechanisms to monitor application health.
- **Configuration Management**: Handles environment variables and configuration files for seamless application setup.

## Prerequisites 📋

1. **Packer**: Ensure Packer is installed on your local machine. [Download Packer](https://www.packer.io/downloads)
2. **AWS Credentials**: Set up AWS credentials with sufficient permissions to create and manage AMIs.
3. **GitHub Actions**: Set up GitHub Actions for continuous integration and deployment.
4. **IAM User**: Create a new IAM service account in the DEV AWS account with appropriate permissions for GitHub Actions.

## Packer Template Structure 📂

The Packer configuration consists of the following elements:

- **Source Image**: Uses Ubuntu 24.04 LTS as the base image.
- **AWS Configuration**: Builds the AMI in the specified region and VPC.
- **Provisioners**:
  - **File Provisioners**: Copy application artifacts and configuration files.
  - **Shell Provisioners**: Run scripts to update the OS, set up users, configure the database, and install dependencies.
  - **Environment Variables**: Set using Packer variables for database configuration and application setup.

## GitHub Actions Workflows 🛠️

### Continuous Integration - Packer Formatting and Validation

This workflow is triggered when a pull request is raised. It runs:
- **Packer Format Check (`packer fmt`)**: Ensures the Packer template is properly formatted. If the template is modified, the workflow fails.
- **Packer Validate (`packer validate`)**: Validates the Packer template for errors. If validation fails, the pull request cannot be merged.

### Custom Image Build

This workflow is triggered when a pull request is merged into the main branch:
- **Run Integration Tests**: Ensures the application functions as expected.
- **Build the Application Artifact**: Creates the application binary (e.g., WAR, JAR, ZIP) on the GitHub Actions runner.
- **Packer Build**: Uses the validated Packer configuration to build the custom AMI.
- **System Setup**: Configures the `csye6225` user, installs dependencies, and sets up systemd services.

## Contributing ✨

1. **Fork the repository** and create a new branch for your feature or bug fix.
2. **Commit your changes** and push them to your branch.
3. **Create a pull request** to propose your changes.
4. **Run the CI checks** to ensure all workflows pass before merging.

## Environment Variables 📜

The Packer template uses several environment variables to configure the application:

- `aws_region`: The AWS region for building the AMI.
- `subnet_id`: The subnet ID for launching the build instance.
- `source_ami`: The source AMI ID (Ubuntu 24.04 LTS).
- `instance_type`: The instance type for the build.
- `ssh_username`: SSH username for connecting to the instance.
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `DB_NAME`, `TEST_DB_NAME`: Database configuration variables.
- Other configuration options for AMI users, volume settings, and polling settings.

Make sure to add these environment variables as secrets in your GitHub repository. This allows the GitHub Actions workflows to access them securely:

1. Go to your GitHub repository.
2. Navigate to **Settings** > **Secrets and variables** > **Actions**.
3. Click on **New repository secret**.
4. Add the secrets one by one (e.g., `aws_region`, `subnet_id`, `POSTGRES_PASSWORD`, etc.).

Once added, these secrets can be used within the GitHub Actions workflows to configure the Packer build.

## Support the Project with a ⭐ 
```javascript
if (youEnjoyed) {
    starThisRepository();
}


