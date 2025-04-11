/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createContactInformation = /* GraphQL */ `mutation CreateContactInformation(
  $condition: ModelContactInformationConditionInput
  $input: CreateContactInformationInput!
) {
  createContactInformation(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateContactInformationMutationVariables,
  APITypes.CreateContactInformationMutation
>;
export const createDegree = /* GraphQL */ `mutation CreateDegree(
  $condition: ModelDegreeConditionInput
  $input: CreateDegreeInput!
) {
  createDegree(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateDegreeMutationVariables,
  APITypes.CreateDegreeMutation
>;
export const createEducation = /* GraphQL */ `mutation CreateEducation(
  $condition: ModelEducationConditionInput
  $input: CreateEducationInput!
) {
  createEducation(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateEducationMutationVariables,
  APITypes.CreateEducationMutation
>;
export const createExperience = /* GraphQL */ `mutation CreateExperience(
  $condition: ModelExperienceConditionInput
  $input: CreateExperienceInput!
) {
  createExperience(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateExperienceMutationVariables,
  APITypes.CreateExperienceMutation
>;
export const createPosition = /* GraphQL */ `mutation CreatePosition(
  $condition: ModelPositionConditionInput
  $input: CreatePositionInput!
) {
  createPosition(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreatePositionMutationVariables,
  APITypes.CreatePositionMutation
>;
export const createReference = /* GraphQL */ `mutation CreateReference(
  $condition: ModelReferenceConditionInput
  $input: CreateReferenceInput!
) {
  createReference(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateReferenceMutationVariables,
  APITypes.CreateReferenceMutation
>;
export const createResume = /* GraphQL */ `mutation CreateResume(
  $condition: ModelResumeConditionInput
  $input: CreateResumeInput!
) {
  createResume(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateResumeMutationVariables,
  APITypes.CreateResumeMutation
>;
export const createSchool = /* GraphQL */ `mutation CreateSchool(
  $condition: ModelSchoolConditionInput
  $input: CreateSchoolInput!
) {
  createSchool(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateSchoolMutationVariables,
  APITypes.CreateSchoolMutation
>;
export const createSkill = /* GraphQL */ `mutation CreateSkill(
  $condition: ModelSkillConditionInput
  $input: CreateSkillInput!
) {
  createSkill(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateSkillMutationVariables,
  APITypes.CreateSkillMutation
>;
export const createSummary = /* GraphQL */ `mutation CreateSummary(
  $condition: ModelSummaryConditionInput
  $input: CreateSummaryInput!
) {
  createSummary(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateSummaryMutationVariables,
  APITypes.CreateSummaryMutation
>;
export const createTodo = /* GraphQL */ `mutation CreateTodo(
  $condition: ModelTodoConditionInput
  $input: CreateTodoInput!
) {
  createTodo(condition: $condition, input: $input) {
    content
    createdAt
    id
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateTodoMutationVariables,
  APITypes.CreateTodoMutation
>;
export const deleteContactInformation = /* GraphQL */ `mutation DeleteContactInformation(
  $condition: ModelContactInformationConditionInput
  $input: DeleteContactInformationInput!
) {
  deleteContactInformation(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteContactInformationMutationVariables,
  APITypes.DeleteContactInformationMutation
>;
export const deleteDegree = /* GraphQL */ `mutation DeleteDegree(
  $condition: ModelDegreeConditionInput
  $input: DeleteDegreeInput!
) {
  deleteDegree(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteDegreeMutationVariables,
  APITypes.DeleteDegreeMutation
>;
export const deleteEducation = /* GraphQL */ `mutation DeleteEducation(
  $condition: ModelEducationConditionInput
  $input: DeleteEducationInput!
) {
  deleteEducation(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteEducationMutationVariables,
  APITypes.DeleteEducationMutation
>;
export const deleteExperience = /* GraphQL */ `mutation DeleteExperience(
  $condition: ModelExperienceConditionInput
  $input: DeleteExperienceInput!
) {
  deleteExperience(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteExperienceMutationVariables,
  APITypes.DeleteExperienceMutation
>;
export const deletePosition = /* GraphQL */ `mutation DeletePosition(
  $condition: ModelPositionConditionInput
  $input: DeletePositionInput!
) {
  deletePosition(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeletePositionMutationVariables,
  APITypes.DeletePositionMutation
>;
export const deleteReference = /* GraphQL */ `mutation DeleteReference(
  $condition: ModelReferenceConditionInput
  $input: DeleteReferenceInput!
) {
  deleteReference(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteReferenceMutationVariables,
  APITypes.DeleteReferenceMutation
>;
export const deleteResume = /* GraphQL */ `mutation DeleteResume(
  $condition: ModelResumeConditionInput
  $input: DeleteResumeInput!
) {
  deleteResume(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteResumeMutationVariables,
  APITypes.DeleteResumeMutation
>;
export const deleteSchool = /* GraphQL */ `mutation DeleteSchool(
  $condition: ModelSchoolConditionInput
  $input: DeleteSchoolInput!
) {
  deleteSchool(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteSchoolMutationVariables,
  APITypes.DeleteSchoolMutation
>;
export const deleteSkill = /* GraphQL */ `mutation DeleteSkill(
  $condition: ModelSkillConditionInput
  $input: DeleteSkillInput!
) {
  deleteSkill(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteSkillMutationVariables,
  APITypes.DeleteSkillMutation
>;
export const deleteSummary = /* GraphQL */ `mutation DeleteSummary(
  $condition: ModelSummaryConditionInput
  $input: DeleteSummaryInput!
) {
  deleteSummary(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteSummaryMutationVariables,
  APITypes.DeleteSummaryMutation
>;
export const deleteTodo = /* GraphQL */ `mutation DeleteTodo(
  $condition: ModelTodoConditionInput
  $input: DeleteTodoInput!
) {
  deleteTodo(condition: $condition, input: $input) {
    content
    createdAt
    id
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteTodoMutationVariables,
  APITypes.DeleteTodoMutation
>;
export const updateContactInformation = /* GraphQL */ `mutation UpdateContactInformation(
  $condition: ModelContactInformationConditionInput
  $input: UpdateContactInformationInput!
) {
  updateContactInformation(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateContactInformationMutationVariables,
  APITypes.UpdateContactInformationMutation
>;
export const updateDegree = /* GraphQL */ `mutation UpdateDegree(
  $condition: ModelDegreeConditionInput
  $input: UpdateDegreeInput!
) {
  updateDegree(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateDegreeMutationVariables,
  APITypes.UpdateDegreeMutation
>;
export const updateEducation = /* GraphQL */ `mutation UpdateEducation(
  $condition: ModelEducationConditionInput
  $input: UpdateEducationInput!
) {
  updateEducation(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateEducationMutationVariables,
  APITypes.UpdateEducationMutation
>;
export const updateExperience = /* GraphQL */ `mutation UpdateExperience(
  $condition: ModelExperienceConditionInput
  $input: UpdateExperienceInput!
) {
  updateExperience(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateExperienceMutationVariables,
  APITypes.UpdateExperienceMutation
>;
export const updatePosition = /* GraphQL */ `mutation UpdatePosition(
  $condition: ModelPositionConditionInput
  $input: UpdatePositionInput!
) {
  updatePosition(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdatePositionMutationVariables,
  APITypes.UpdatePositionMutation
>;
export const updateReference = /* GraphQL */ `mutation UpdateReference(
  $condition: ModelReferenceConditionInput
  $input: UpdateReferenceInput!
) {
  updateReference(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateReferenceMutationVariables,
  APITypes.UpdateReferenceMutation
>;
export const updateResume = /* GraphQL */ `mutation UpdateResume(
  $condition: ModelResumeConditionInput
  $input: UpdateResumeInput!
) {
  updateResume(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateResumeMutationVariables,
  APITypes.UpdateResumeMutation
>;
export const updateSchool = /* GraphQL */ `mutation UpdateSchool(
  $condition: ModelSchoolConditionInput
  $input: UpdateSchoolInput!
) {
  updateSchool(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateSchoolMutationVariables,
  APITypes.UpdateSchoolMutation
>;
export const updateSkill = /* GraphQL */ `mutation UpdateSkill(
  $condition: ModelSkillConditionInput
  $input: UpdateSkillInput!
) {
  updateSkill(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateSkillMutationVariables,
  APITypes.UpdateSkillMutation
>;
export const updateSummary = /* GraphQL */ `mutation UpdateSummary(
  $condition: ModelSummaryConditionInput
  $input: UpdateSummaryInput!
) {
  updateSummary(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateSummaryMutationVariables,
  APITypes.UpdateSummaryMutation
>;
export const updateTodo = /* GraphQL */ `mutation UpdateTodo(
  $condition: ModelTodoConditionInput
  $input: UpdateTodoInput!
) {
  updateTodo(condition: $condition, input: $input) {
    content
    createdAt
    id
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateTodoMutationVariables,
  APITypes.UpdateTodoMutation
>;
