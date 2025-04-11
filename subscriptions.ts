/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreateContactInformation = /* GraphQL */ `subscription OnCreateContactInformation(
  $filter: ModelSubscriptionContactInformationFilterInput
) {
  onCreateContactInformation(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateContactInformationSubscriptionVariables,
  APITypes.OnCreateContactInformationSubscription
>;
export const onCreateDegree = /* GraphQL */ `subscription OnCreateDegree($filter: ModelSubscriptionDegreeFilterInput) {
  onCreateDegree(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateDegreeSubscriptionVariables,
  APITypes.OnCreateDegreeSubscription
>;
export const onCreateEducation = /* GraphQL */ `subscription OnCreateEducation($filter: ModelSubscriptionEducationFilterInput) {
  onCreateEducation(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateEducationSubscriptionVariables,
  APITypes.OnCreateEducationSubscription
>;
export const onCreateExperience = /* GraphQL */ `subscription OnCreateExperience(
  $filter: ModelSubscriptionExperienceFilterInput
) {
  onCreateExperience(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateExperienceSubscriptionVariables,
  APITypes.OnCreateExperienceSubscription
>;
export const onCreatePosition = /* GraphQL */ `subscription OnCreatePosition($filter: ModelSubscriptionPositionFilterInput) {
  onCreatePosition(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreatePositionSubscriptionVariables,
  APITypes.OnCreatePositionSubscription
>;
export const onCreateReference = /* GraphQL */ `subscription OnCreateReference($filter: ModelSubscriptionReferenceFilterInput) {
  onCreateReference(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateReferenceSubscriptionVariables,
  APITypes.OnCreateReferenceSubscription
>;
export const onCreateResume = /* GraphQL */ `subscription OnCreateResume($filter: ModelSubscriptionResumeFilterInput) {
  onCreateResume(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateResumeSubscriptionVariables,
  APITypes.OnCreateResumeSubscription
>;
export const onCreateSchool = /* GraphQL */ `subscription OnCreateSchool($filter: ModelSubscriptionSchoolFilterInput) {
  onCreateSchool(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateSchoolSubscriptionVariables,
  APITypes.OnCreateSchoolSubscription
>;
export const onCreateSkill = /* GraphQL */ `subscription OnCreateSkill($filter: ModelSubscriptionSkillFilterInput) {
  onCreateSkill(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateSkillSubscriptionVariables,
  APITypes.OnCreateSkillSubscription
>;
export const onCreateSummary = /* GraphQL */ `subscription OnCreateSummary($filter: ModelSubscriptionSummaryFilterInput) {
  onCreateSummary(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateSummarySubscriptionVariables,
  APITypes.OnCreateSummarySubscription
>;
export const onCreateTodo = /* GraphQL */ `subscription OnCreateTodo($filter: ModelSubscriptionTodoFilterInput) {
  onCreateTodo(filter: $filter) {
    content
    createdAt
    id
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateTodoSubscriptionVariables,
  APITypes.OnCreateTodoSubscription
>;
export const onDeleteContactInformation = /* GraphQL */ `subscription OnDeleteContactInformation(
  $filter: ModelSubscriptionContactInformationFilterInput
) {
  onDeleteContactInformation(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteContactInformationSubscriptionVariables,
  APITypes.OnDeleteContactInformationSubscription
>;
export const onDeleteDegree = /* GraphQL */ `subscription OnDeleteDegree($filter: ModelSubscriptionDegreeFilterInput) {
  onDeleteDegree(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteDegreeSubscriptionVariables,
  APITypes.OnDeleteDegreeSubscription
>;
export const onDeleteEducation = /* GraphQL */ `subscription OnDeleteEducation($filter: ModelSubscriptionEducationFilterInput) {
  onDeleteEducation(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteEducationSubscriptionVariables,
  APITypes.OnDeleteEducationSubscription
>;
export const onDeleteExperience = /* GraphQL */ `subscription OnDeleteExperience(
  $filter: ModelSubscriptionExperienceFilterInput
) {
  onDeleteExperience(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteExperienceSubscriptionVariables,
  APITypes.OnDeleteExperienceSubscription
>;
export const onDeletePosition = /* GraphQL */ `subscription OnDeletePosition($filter: ModelSubscriptionPositionFilterInput) {
  onDeletePosition(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeletePositionSubscriptionVariables,
  APITypes.OnDeletePositionSubscription
>;
export const onDeleteReference = /* GraphQL */ `subscription OnDeleteReference($filter: ModelSubscriptionReferenceFilterInput) {
  onDeleteReference(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteReferenceSubscriptionVariables,
  APITypes.OnDeleteReferenceSubscription
>;
export const onDeleteResume = /* GraphQL */ `subscription OnDeleteResume($filter: ModelSubscriptionResumeFilterInput) {
  onDeleteResume(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteResumeSubscriptionVariables,
  APITypes.OnDeleteResumeSubscription
>;
export const onDeleteSchool = /* GraphQL */ `subscription OnDeleteSchool($filter: ModelSubscriptionSchoolFilterInput) {
  onDeleteSchool(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteSchoolSubscriptionVariables,
  APITypes.OnDeleteSchoolSubscription
>;
export const onDeleteSkill = /* GraphQL */ `subscription OnDeleteSkill($filter: ModelSubscriptionSkillFilterInput) {
  onDeleteSkill(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteSkillSubscriptionVariables,
  APITypes.OnDeleteSkillSubscription
>;
export const onDeleteSummary = /* GraphQL */ `subscription OnDeleteSummary($filter: ModelSubscriptionSummaryFilterInput) {
  onDeleteSummary(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteSummarySubscriptionVariables,
  APITypes.OnDeleteSummarySubscription
>;
export const onDeleteTodo = /* GraphQL */ `subscription OnDeleteTodo($filter: ModelSubscriptionTodoFilterInput) {
  onDeleteTodo(filter: $filter) {
    content
    createdAt
    id
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteTodoSubscriptionVariables,
  APITypes.OnDeleteTodoSubscription
>;
export const onUpdateContactInformation = /* GraphQL */ `subscription OnUpdateContactInformation(
  $filter: ModelSubscriptionContactInformationFilterInput
) {
  onUpdateContactInformation(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateContactInformationSubscriptionVariables,
  APITypes.OnUpdateContactInformationSubscription
>;
export const onUpdateDegree = /* GraphQL */ `subscription OnUpdateDegree($filter: ModelSubscriptionDegreeFilterInput) {
  onUpdateDegree(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateDegreeSubscriptionVariables,
  APITypes.OnUpdateDegreeSubscription
>;
export const onUpdateEducation = /* GraphQL */ `subscription OnUpdateEducation($filter: ModelSubscriptionEducationFilterInput) {
  onUpdateEducation(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateEducationSubscriptionVariables,
  APITypes.OnUpdateEducationSubscription
>;
export const onUpdateExperience = /* GraphQL */ `subscription OnUpdateExperience(
  $filter: ModelSubscriptionExperienceFilterInput
) {
  onUpdateExperience(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateExperienceSubscriptionVariables,
  APITypes.OnUpdateExperienceSubscription
>;
export const onUpdatePosition = /* GraphQL */ `subscription OnUpdatePosition($filter: ModelSubscriptionPositionFilterInput) {
  onUpdatePosition(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdatePositionSubscriptionVariables,
  APITypes.OnUpdatePositionSubscription
>;
export const onUpdateReference = /* GraphQL */ `subscription OnUpdateReference($filter: ModelSubscriptionReferenceFilterInput) {
  onUpdateReference(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateReferenceSubscriptionVariables,
  APITypes.OnUpdateReferenceSubscription
>;
export const onUpdateResume = /* GraphQL */ `subscription OnUpdateResume($filter: ModelSubscriptionResumeFilterInput) {
  onUpdateResume(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateResumeSubscriptionVariables,
  APITypes.OnUpdateResumeSubscription
>;
export const onUpdateSchool = /* GraphQL */ `subscription OnUpdateSchool($filter: ModelSubscriptionSchoolFilterInput) {
  onUpdateSchool(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateSchoolSubscriptionVariables,
  APITypes.OnUpdateSchoolSubscription
>;
export const onUpdateSkill = /* GraphQL */ `subscription OnUpdateSkill($filter: ModelSubscriptionSkillFilterInput) {
  onUpdateSkill(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateSkillSubscriptionVariables,
  APITypes.OnUpdateSkillSubscription
>;
export const onUpdateSummary = /* GraphQL */ `subscription OnUpdateSummary($filter: ModelSubscriptionSummaryFilterInput) {
  onUpdateSummary(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateSummarySubscriptionVariables,
  APITypes.OnUpdateSummarySubscription
>;
export const onUpdateTodo = /* GraphQL */ `subscription OnUpdateTodo($filter: ModelSubscriptionTodoFilterInput) {
  onUpdateTodo(filter: $filter) {
    content
    createdAt
    id
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateTodoSubscriptionVariables,
  APITypes.OnUpdateTodoSubscription
>;
