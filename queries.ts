/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getContactInformation = /* GraphQL */ `query GetContactInformation($id: ID!) {
  getContactInformation(id: $id) {
    createdAt
    email
    id
    name
    phone
    references {
      nextToken
      __typename
    }
    resume
    resumes {
      nextToken
      __typename
    }
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetContactInformationQueryVariables,
  APITypes.GetContactInformationQuery
>;
export const getDegree = /* GraphQL */ `query GetDegree($id: ID!) {
  getDegree(id: $id) {
    createdAt
    endYear
    id
    major
    school {
      createdAt
      educationId
      id
      name
      updatedAt
      __typename
    }
    schoolId
    startYear
    updatedAt
    __typename
  }
}
` as GeneratedQuery<APITypes.GetDegreeQueryVariables, APITypes.GetDegreeQuery>;
export const getEducation = /* GraphQL */ `query GetEducation($id: ID!) {
  getEducation(id: $id) {
    createdAt
    id
    resume
    resumes {
      nextToken
      __typename
    }
    schools {
      nextToken
      __typename
    }
    summary
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetEducationQueryVariables,
  APITypes.GetEducationQuery
>;
export const getExperience = /* GraphQL */ `query GetExperience($id: ID!) {
  getExperience(id: $id) {
    createdAt
    id
    positions {
      nextToken
      __typename
    }
    resumes {
      nextToken
      __typename
    }
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetExperienceQueryVariables,
  APITypes.GetExperienceQuery
>;
export const getPosition = /* GraphQL */ `query GetPosition($id: ID!) {
  getPosition(id: $id) {
    company
    createdAt
    endDate
    experience {
      createdAt
      id
      updatedAt
      __typename
    }
    experienceId
    id
    startDate
    title
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetPositionQueryVariables,
  APITypes.GetPositionQuery
>;
export const getReference = /* GraphQL */ `query GetReference($id: ID!) {
  getReference(id: $id) {
    contactInformation {
      createdAt
      email
      id
      name
      phone
      resume
      updatedAt
      __typename
    }
    contactInformationId
    createdAt
    email
    id
    name
    phone
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetReferenceQueryVariables,
  APITypes.GetReferenceQuery
>;
export const getResume = /* GraphQL */ `query GetResume($id: ID!) {
  getResume(id: $id) {
    contactInformation {
      createdAt
      email
      id
      name
      phone
      resume
      updatedAt
      __typename
    }
    contactInformationId
    createdAt
    education {
      createdAt
      id
      resume
      summary
      updatedAt
      __typename
    }
    educationId
    experience {
      createdAt
      id
      updatedAt
      __typename
    }
    experienceId
    id
    skills {
      nextToken
      __typename
    }
    summary {
      createdAt
      goals
      gptResponse
      headshot
      id
      persona
      resume
      updatedAt
      url
      __typename
    }
    summaryId
    title
    updatedAt
    __typename
  }
}
` as GeneratedQuery<APITypes.GetResumeQueryVariables, APITypes.GetResumeQuery>;
export const getSchool = /* GraphQL */ `query GetSchool($id: ID!) {
  getSchool(id: $id) {
    createdAt
    degrees {
      nextToken
      __typename
    }
    education {
      createdAt
      id
      resume
      summary
      updatedAt
      __typename
    }
    educationId
    id
    name
    updatedAt
    __typename
  }
}
` as GeneratedQuery<APITypes.GetSchoolQueryVariables, APITypes.GetSchoolQuery>;
export const getSkill = /* GraphQL */ `query GetSkill($id: ID!) {
  getSkill(id: $id) {
    createdAt
    id
    link
    resume {
      contactInformationId
      createdAt
      educationId
      experienceId
      id
      summaryId
      title
      updatedAt
      __typename
    }
    resumeId
    title
    updatedAt
    __typename
  }
}
` as GeneratedQuery<APITypes.GetSkillQueryVariables, APITypes.GetSkillQuery>;
export const getSummary = /* GraphQL */ `query GetSummary($id: ID!) {
  getSummary(id: $id) {
    createdAt
    goals
    gptResponse
    headshot
    id
    persona
    resume
    resumes {
      nextToken
      __typename
    }
    updatedAt
    url
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetSummaryQueryVariables,
  APITypes.GetSummaryQuery
>;
export const getTodo = /* GraphQL */ `query GetTodo($id: ID!) {
  getTodo(id: $id) {
    content
    createdAt
    id
    updatedAt
    __typename
  }
}
` as GeneratedQuery<APITypes.GetTodoQueryVariables, APITypes.GetTodoQuery>;
export const listContactInformations = /* GraphQL */ `query ListContactInformations(
  $filter: ModelContactInformationFilterInput
  $id: ID
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listContactInformations(
    filter: $filter
    id: $id
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
      createdAt
      email
      id
      name
      phone
      resume
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListContactInformationsQueryVariables,
  APITypes.ListContactInformationsQuery
>;
export const listDegrees = /* GraphQL */ `query ListDegrees(
  $filter: ModelDegreeFilterInput
  $id: ID
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listDegrees(
    filter: $filter
    id: $id
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
      createdAt
      endYear
      id
      major
      schoolId
      startYear
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListDegreesQueryVariables,
  APITypes.ListDegreesQuery
>;
export const listEducations = /* GraphQL */ `query ListEducations(
  $filter: ModelEducationFilterInput
  $id: ID
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listEducations(
    filter: $filter
    id: $id
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
      createdAt
      id
      resume
      summary
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListEducationsQueryVariables,
  APITypes.ListEducationsQuery
>;
export const listExperiences = /* GraphQL */ `query ListExperiences(
  $filter: ModelExperienceFilterInput
  $id: ID
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listExperiences(
    filter: $filter
    id: $id
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
      createdAt
      id
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListExperiencesQueryVariables,
  APITypes.ListExperiencesQuery
>;
export const listPositions = /* GraphQL */ `query ListPositions(
  $filter: ModelPositionFilterInput
  $id: ID
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listPositions(
    filter: $filter
    id: $id
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
      company
      createdAt
      endDate
      experienceId
      id
      startDate
      title
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListPositionsQueryVariables,
  APITypes.ListPositionsQuery
>;
export const listReferences = /* GraphQL */ `query ListReferences(
  $filter: ModelReferenceFilterInput
  $id: ID
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listReferences(
    filter: $filter
    id: $id
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
      contactInformationId
      createdAt
      email
      id
      name
      phone
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListReferencesQueryVariables,
  APITypes.ListReferencesQuery
>;
export const listResumes = /* GraphQL */ `query ListResumes(
  $filter: ModelResumeFilterInput
  $id: ID
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listResumes(
    filter: $filter
    id: $id
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
      contactInformationId
      createdAt
      educationId
      experienceId
      id
      summaryId
      title
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListResumesQueryVariables,
  APITypes.ListResumesQuery
>;
export const listSchools = /* GraphQL */ `query ListSchools(
  $filter: ModelSchoolFilterInput
  $id: ID
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listSchools(
    filter: $filter
    id: $id
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
      createdAt
      educationId
      id
      name
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListSchoolsQueryVariables,
  APITypes.ListSchoolsQuery
>;
export const listSkills = /* GraphQL */ `query ListSkills(
  $filter: ModelSkillFilterInput
  $id: ID
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listSkills(
    filter: $filter
    id: $id
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
      createdAt
      id
      link
      resumeId
      title
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListSkillsQueryVariables,
  APITypes.ListSkillsQuery
>;
export const listSummaries = /* GraphQL */ `query ListSummaries(
  $filter: ModelSummaryFilterInput
  $id: ID
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listSummaries(
    filter: $filter
    id: $id
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
      createdAt
      goals
      gptResponse
      headshot
      id
      persona
      resume
      updatedAt
      url
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListSummariesQueryVariables,
  APITypes.ListSummariesQuery
>;
export const listTodos = /* GraphQL */ `query ListTodos(
  $filter: ModelTodoFilterInput
  $limit: Int
  $nextToken: String
) {
  listTodos(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      content
      createdAt
      id
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<APITypes.ListTodosQueryVariables, APITypes.ListTodosQuery>;
