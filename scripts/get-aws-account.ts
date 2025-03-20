import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";

async function getAwsAccountId() {
  const client = new STSClient({ region: 'us-east-2' });
  const command = new GetCallerIdentityCommand({});
  
  try {
    const response = await client.send(command);
    return response.Account;
  } catch (error) {
    console.error('Error getting AWS account ID:', error);
    throw error;
  }
}

getAwsAccountId().then(accountId => {
  console.log(`AWS_ACCOUNT_ID=${accountId}`);
}).catch(() => process.exit(1));