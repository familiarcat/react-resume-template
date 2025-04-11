#!/bin/bash

# Global AWS credential wrapper for the entire project
# This script ensures that all AWS commands use the correct credentials

# Clear all AWS environment variables
unset AWS_ACCESS_KEY_ID
unset AWS_SECRET_ACCESS_KEY
unset AWS_SESSION_TOKEN
unset AWS_DEFAULT_REGION
unset AWS_REGION

# Set only the profile
export AWS_PROFILE=AmplifyUser

# Print current configuration
echo "AWS configuration set to profile: $AWS_PROFILE"

# Verify AWS credentials file exists
AWS_CREDENTIALS_FILE="$HOME/.aws/credentials"
if [ ! -f "$AWS_CREDENTIALS_FILE" ]; then
  echo "Error: AWS credentials file not found at $AWS_CREDENTIALS_FILE"
  echo "Please run 'npm run aws:helper:fix' to set up your credentials"
  exit 1
fi

# Verify AmplifyUser profile exists
if ! grep -q "\[AmplifyUser\]" "$AWS_CREDENTIALS_FILE"; then
  echo "Error: AmplifyUser profile not found in AWS credentials file"
  echo "Please run 'npm run aws:helper:fix' to set up your credentials"
  exit 1
fi

# Run the command passed as arguments
if [ $# -gt 0 ]; then
  "$@"
else
  echo "No command specified. Environment is clean."
fi
