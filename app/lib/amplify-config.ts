const config = {
  aws_project_region: process.env.AWS_REGION || 'us-east-2',
  aws_appsync_graphqlEndpoint: process.env.NEXT_PUBLIC_API_URL,
  aws_appsync_region: process.env.AWS_REGION || 'us-east-2',
  aws_appsync_authenticationType: 'API_KEY',
  aws_appsync_apiKey: process.env.NEXT_PUBLIC_API_KEY,
  ssr: true
};

export default config;