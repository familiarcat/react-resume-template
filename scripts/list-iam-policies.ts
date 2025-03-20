import {GetUserCommand, IAMClient, ListAttachedUserPoliciesCommand} from '@aws-sdk/client-iam';
import {fromIni} from '@aws-sdk/credential-provider-ini';
import fs from 'fs';
import os from 'os';
import path from 'path';
import ini from 'ini';

async function describeAwsProfile() {
  const homeDir = os.homedir();
  const configPath = path.join(homeDir, '.aws', 'config');
  const credentialsPath = path.join(homeDir, '.aws', 'credentials');
  
  console.log('\nAWS Profile Information:');
  console.log('------------------------');
  
  // Check AWS profile environment variables
  const currentProfile = process.env.AWS_PROFILE || process.env.AWS_DEFAULT_PROFILE || 'default';
  console.log('Current Profile:', currentProfile);
  console.log('AWS_PROFILE:', process.env.AWS_PROFILE || 'not set');
  console.log('AWS_DEFAULT_PROFILE:', process.env.AWS_DEFAULT_PROFILE || 'not set');
  console.log('AWS_REGION:', process.env.AWS_REGION || 'not set');
  console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '****' : 'not set');
  console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '****' : 'not set');
  
  // Check credentials file
  try {
    if (fs.existsSync(credentialsPath)) {
      const credentialsContent = ini.parse(fs.readFileSync(credentialsPath, 'utf-8'));
      const profiles = Object.keys(credentialsContent);
      console.log('\nAvailable profiles in credentials file:');
      profiles.forEach(profile => {
        const profileName = profile.replace('profile ', '');
        const isCurrentProfile = profileName === currentProfile;
        console.log(`- ${profileName}${isCurrentProfile ? ' (current)' : ''}`);
        // Show redacted access key if exists
        const accessKey = credentialsContent[profile].aws_access_key_id;
        if (accessKey) {
          console.log(`  Access Key: ${accessKey.substring(0, 4)}...${accessKey.slice(-4)}`);
        }
      });
    } else {
      console.log('\nNo credentials file found at:', credentialsPath);
    }
    
    // Check config file
    if (fs.existsSync(configPath)) {
      const configContent = ini.parse(fs.readFileSync(configPath, 'utf-8'));
      console.log('\nAWS config file contents:');
      Object.entries(configContent).forEach(([profile, settings]) => {
        const profileName = profile.replace('profile ', '');
        const isCurrentProfile = profileName === currentProfile;
        console.log(`- ${profileName}${isCurrentProfile ? ' (current)' : ''}:`);
        console.log('  Settings:', JSON.stringify(settings, null, 2));
      });
    } else {
      console.log('\nNo config file found at:', configPath);
    }
  } catch (error) {
    console.error('Error reading AWS config files:', error);
  }
}

async function listCurrentUserPolicies() {
  try {
    // First describe the AWS profile being used
    await describeAwsProfile();
    
    console.log('\nAttempting to fetch IAM policies...');
    console.log('----------------------------------');
    
    const currentProfile = process.env.AWS_PROFILE || process.env.AWS_DEFAULT_PROFILE || 'default';
    
    // Initialize the IAM client with explicit credentials from profile
    const iamClient = new IAMClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: fromIni({
        profile: currentProfile
      })
    });
    
    // Get current user info
    const getUserCommand = new GetUserCommand({});
    const currentUser = await iamClient.send(getUserCommand);
    
    if (!currentUser.User) {
      console.error('Could not retrieve current user information');
      return;
    }

    const username = currentUser.User.UserName;
    console.log(`Current IAM User: ${username}\n`);

    // List attached policies
    const listPoliciesCommand = new ListAttachedUserPoliciesCommand({
      UserName: username
    });

    const response = await iamClient.send(listPoliciesCommand);

    if (!response.AttachedPolicies?.length) {
      console.log('No policies found for this user.');
      return;
    }

    console.log('Attached Policies:');
    console.log('----------------');
    
    for (const policy of response.AttachedPolicies) {
      console.log(`Policy Name: ${policy.PolicyName}`);
      console.log(`Policy ARN: ${policy.PolicyArn}\n`);
    }

  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching IAM policies:', error.message);
      
      if (error.message.includes('credentials')) {
        console.log('\nTip: Make sure you have valid AWS credentials configured.');
        console.log('You can configure credentials by:');
        console.log('1. Setting AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables');
        console.log('2. Using AWS CLI: aws configure');
        console.log('3. Using a credentials file in ~/.aws/credentials');
      }
    }
  }
}

// Execute the function
listCurrentUserPolicies();
