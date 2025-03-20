import { Amplify } from 'aws-amplify';
import { generateClient } from '@aws-amplify/api';
import { type Schema } from '../../amplify/data/resource';
import { cache } from 'react';

/**
 * Amplify configuration using v6 (Gen2) format.
 * Replace environment variables with your actual values.
 */
const amplifyConfig = {
  API: {
    GraphQL: {
      endpoint: process.env.NEXT_PUBLIC_API_URL!, // e.g. "https://xxxxxx.appsync-api.us-east-2.amazonaws.com/graphql"
      region: 'us-east-2',
      defaultAuthMode: 'apiKey' as const, // Must be lowercase: "apiKey"
      apiKey: process.env.NEXT_PUBLIC_API_KEY,
    },
  },
};

console.log("Amplify Configuration:", amplifyConfig);

// Configure Amplify with SSR enabled.
Amplify.configure(amplifyConfig, { ssr: true });

/**
 * Create a cached API client to prevent multiple initializations.
 * The client is generated with full type safety using your Schema type.
 */
const getClient = cache(() => {
  const client = generateClient<Schema>();
  console.debug('Generated client:', client);
  if (!client || !client.models) {
    throw new Error('Amplify client not properly initialized');
  }
  console.debug('Client models:', Object.keys(client.models));
  return client;
});

/**
 * Interface describing the expected CRUD methods for a model.
 */
export interface ModelCRUD<T> {
  list: () => Promise<{ data: T[]; errors?: Error[] }>;
  get: (args: { id: string }) => Promise<{ data: T; errors?: Error[] }>;
  create: (input: Partial<T>) => Promise<{ data: T; errors?: Error[] }>;
  update: (input: Partial<T> & { id: string }) => Promise<{ data: T; errors?: Error[] }>;
  delete: (args: { id: string }) => Promise<{ data: T; errors?: Error[] }>;
}

/**
 * Generic CRUD operations type.
 */
export type CRUDOperations<T> = {
  list: () => Promise<T[]>;
  get: (id: string) => Promise<T>;
  create: (input: Partial<T>) => Promise<T>;
  update: (input: Partial<T> & { id: string }) => Promise<T>;
  delete: (id: string) => Promise<T>;
};

/**
 * Helper function to safely access a model by name from the client.
 * This casts the client's models to a record so that we can index it by key.
 */
function getModel<M extends keyof Schema>(modelName: M): ModelCRUD<Schema[M]> {
  const client = getClient();
  const modelsRecord = client.models as unknown as Record<string, unknown>;
  console.debug('Available models:', Object.keys(modelsRecord));
  if (!(modelName in modelsRecord)) {
    throw new Error(
      `Model "${modelName}" not found in client.models. Available models: ${Object.keys(modelsRecord).join(', ')}`
    );
  }
  return modelsRecord[modelName] as ModelCRUD<Schema[M]>;
}

/**
 * Helper function to generate CRUD operations for a given model name.
 *
 * We force-cast the underlying model to an object with the expected CRUD methods.
 */
function createCRUD<M extends keyof Schema>(modelName: M): CRUDOperations<Schema[M]> {
  const model = getModel(modelName) as unknown as {
    list: (args?: object) => Promise<{ data: Schema[M][]; errors?: Error[] }>;
    get: (args: { id: string }) => Promise<{ data: Schema[M]; errors?: Error[] }>;
    create: (input: Partial<Schema[M]>) => Promise<{ data: Schema[M]; errors?: Error[] }>;
    update: (input: Partial<Schema[M]> & { id: string }) => Promise<{ data: Schema[M]; errors?: Error[] }>;
    delete: (args: { id: string }) => Promise<{ data: Schema[M]; errors?: Error[] }>;
  };

  return {
    list: async () => {
      const result = await model.list({});
      if (result.errors) throw result.errors;
      return result.data;
    },
    get: async (id: string) => {
      const result = await model.get({ id });
      if (result.errors) throw result.errors;
      return result.data;
    },
    create: async (input: Partial<Schema[M]>) => {
      const result = await model.create(input);
      if (result.errors) throw result.errors;
      return result.data;
    },
    update: async (input: Partial<Schema[M]> & { id: string }) => {
      const result = await model.update(input);
      if (result.errors) throw result.errors;
      return result.data;
    },
    delete: async (id: string) => {
      const result = await model.delete({ id });
      if (result.errors) throw result.errors;
      return result.data;
    },
  };
}

/**
 * Export the DataAPI object by creating type-safe CRUD operations for each model.
 * Ensure that the strings passed to createCRUD match the keys present in your deployed Schema.
 */
export const DataAPI = {
  Summary: createCRUD('Summary'),
  Resume: createCRUD('Resume'),
  ContactInformation: createCRUD('ContactInformation'),
  Reference: createCRUD('Reference'),
  Education: createCRUD('Education'),
  School: createCRUD('School'),
  Degree: createCRUD('Degree'),
  Experience: createCRUD('Experience'),
  Position: createCRUD('Position'),
  Skill: createCRUD('Skill'),
};

export { getClient as client };
