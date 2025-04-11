/**
 * AWS Configuration for the project
 * 
 * This file contains the AWS configuration for the project.
 * It is used by various scripts to ensure consistent AWS credential handling.
 */

module.exports = {
  // The AWS profile to use for all AWS operations
  profile: 'AmplifyUser',
  
  // The default region to use if not specified in the AWS profile
  defaultRegion: 'us-east-2',
  
  // Environment-specific settings
  environments: {
    development: {
      // Development-specific settings
      prefix: 'DEV',
      // Add any development-specific settings here
    },
    production: {
      // Production-specific settings
      prefix: 'PROD',
      // Add any production-specific settings here
    }
  },
  
  // DynamoDB table prefixes to identify project tables
  dynamoDBTablePrefixes: [
    'Todo',
    'Resume',
    'Summary',
    'ContactInformation',
    'Reference',
    'Education',
    'School',
    'Degree',
    'Experience',
    'Position',
    'Skill'
  ]
};
