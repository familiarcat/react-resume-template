import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any unauthenticated user can "create", "read", "update", 
and "delete" any "Todo" records.
=========================================================================*/
const schema = a.schema({
  Todo: a
    .model({
      content: a.string(),
    })
    .authorization((allow) => [allow.guest()]),
    Summary: a.model({
      id: a.id(),
      goals: a.string(),
      persona: a.string(),
      url: a.string(),
      headshot: a.string(),
      gptResponse: a.string(),
      resume: a.string(),
      resumes: a.hasMany('Resume', 'summaryId')
    }).authorization((allow) => [allow.guest()]),
    ContactInformation: a.model({
      id: a.id(),
      name: a.string(),
      email: a.string(),
      phone: a.string(),
      resume: a.string(),
      references: a.hasMany('Reference', 'contactInformationId'),
      resumes: a.hasMany('Resume', 'contactInformationId')
    }).authorization((allow) => [allow.guest()]),
    Reference: a.model({
      id: a.id(),
      name: a.string(),
      phone: a.string(),
      email: a.string(),
      contactInformationId: a.string(),
      contactInformation: a.belongsTo('ContactInformation', 'contactInformationId')
    }).authorization((allow) => [allow.guest()]),
    Education: a.model({
      id: a.id(),
      summary: a.string(),
      resume: a.string(),
      schools: a.hasMany('School', 'educationId'),
      resumes: a.hasMany('Resume', 'educationId')
    }).authorization((allow) => [allow.guest()]),
    School: a.model({
      id: a.id(),
      name: a.string(),
      educationId: a.string(),
      education: a.belongsTo('Education', 'educationId'),
      degrees: a.hasMany('Degree', 'schoolId')
    }).authorization((allow) => [allow.guest()]),
    Degree: a.model({
      id: a.id(),
      major: a.string(),
      startYear: a.string(),
      endYear: a.string(),
      schoolId: a.string(),
      school: a.belongsTo('School', 'schoolId')
    }).authorization((allow) => [allow.guest()]),
    Experience: a.model({
      id: a.id(),
      positions: a.hasMany('Position', 'experienceId'),
      resumes: a.hasMany('Resume', 'experienceId')
    }).authorization((allow) => [allow.guest()]),
    Position: a.model({
      id: a.id(),
      title: a.string(),
      company: a.string(),
      startDate: a.string(),
      endDate: a.string(),
      experienceId: a.string(),
      experience: a.belongsTo('Experience', 'experienceId')
    }).authorization((allow) => [allow.guest()]),
    Skill: a.model({
      id: a.id(),
      title: a.string(),
      link: a.string(),
      resumeId: a.string(),
      resume: a.belongsTo('Resume', 'resumeId')
    }).authorization((allow) => [allow.guest()]),
    Resume: a.model({
      id: a.id(),
      title: a.string(),
      summaryId: a.string(),
      summary: a.belongsTo('Summary', 'summaryId'),
      contactInformationId: a.string(),
      contactInformation: a.belongsTo('ContactInformation', 'contactInformationId'),
      educationId: a.string(),
      education: a.belongsTo('Education', 'educationId'),
      experienceId: a.string(),
      experience: a.belongsTo('Experience', 'experienceId'),
      skills: a.hasMany('Skill', 'resumeId')
    }).authorization((allow) => [allow.guest()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'iam',
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
