'use server'

import { DataAPI } from './amplify-server';
import { type Schema } from '../../amplify/data/resource'

export async function getResume(id: string) {
  const resume = await DataAPI.Resume.get(id);
  return resume;
}

export async function listResumes() {
  return await DataAPI.Resume.list();
}

export async function createResume(input: Partial<Schema['Resume']>) {
  return await DataAPI.Resume.create(input);
}

export async function updateResume(id: string, input: Partial<Schema['Resume']>) {
  return await DataAPI.Resume.update({ id, ...input });
}

export async function deleteResume(id: string) {
  return await DataAPI.Resume.delete(id);
}

// API objects for other models
export const SummaryAPI = {
  get: async (id: string) => {
    return await DataAPI.Summary.get(id);
  },
  list: async () => {
    return await DataAPI.Summary.list();
  },
  create: async (input: Partial<Schema['Summary']>) => {
    return await DataAPI.Summary.create(input);
  },
  update: async (id: string, input: Partial<Schema['Summary']>) => {
    return await DataAPI.Summary.update({ id, ...input });
  },
  delete: async (id: string) => {
    return await DataAPI.Summary.delete(id);
  },
};

// Similar pattern for other models
