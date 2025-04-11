/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type ContactInformation = {
  __typename: "ContactInformation",
  createdAt: string,
  email?: string | null,
  id: string,
  name?: string | null,
  phone?: string | null,
  references?: ModelReferenceConnection | null,
  resume?: string | null,
  resumes?: ModelResumeConnection | null,
  updatedAt: string,
};

export type ModelReferenceConnection = {
  __typename: "ModelReferenceConnection",
  items:  Array<Reference | null >,
  nextToken?: string | null,
};

export type Reference = {
  __typename: "Reference",
  contactInformation?: ContactInformation | null,
  contactInformationId?: string | null,
  createdAt: string,
  email?: string | null,
  id: string,
  name?: string | null,
  phone?: string | null,
  updatedAt: string,
};

export type ModelResumeConnection = {
  __typename: "ModelResumeConnection",
  items:  Array<Resume | null >,
  nextToken?: string | null,
};

export type Resume = {
  __typename: "Resume",
  contactInformation?: ContactInformation | null,
  contactInformationId?: string | null,
  createdAt: string,
  education?: Education | null,
  educationId?: string | null,
  experience?: Experience | null,
  experienceId?: string | null,
  id: string,
  skills?: ModelSkillConnection | null,
  summary?: Summary | null,
  summaryId?: string | null,
  title?: string | null,
  updatedAt: string,
};

export type Education = {
  __typename: "Education",
  createdAt: string,
  id: string,
  resume?: string | null,
  resumes?: ModelResumeConnection | null,
  schools?: ModelSchoolConnection | null,
  summary?: string | null,
  updatedAt: string,
};

export type ModelSchoolConnection = {
  __typename: "ModelSchoolConnection",
  items:  Array<School | null >,
  nextToken?: string | null,
};

export type School = {
  __typename: "School",
  createdAt: string,
  degrees?: ModelDegreeConnection | null,
  education?: Education | null,
  educationId?: string | null,
  id: string,
  name?: string | null,
  updatedAt: string,
};

export type ModelDegreeConnection = {
  __typename: "ModelDegreeConnection",
  items:  Array<Degree | null >,
  nextToken?: string | null,
};

export type Degree = {
  __typename: "Degree",
  createdAt: string,
  endYear?: string | null,
  id: string,
  major?: string | null,
  school?: School | null,
  schoolId?: string | null,
  startYear?: string | null,
  updatedAt: string,
};

export type Experience = {
  __typename: "Experience",
  createdAt: string,
  id: string,
  positions?: ModelPositionConnection | null,
  resumes?: ModelResumeConnection | null,
  updatedAt: string,
};

export type ModelPositionConnection = {
  __typename: "ModelPositionConnection",
  items:  Array<Position | null >,
  nextToken?: string | null,
};

export type Position = {
  __typename: "Position",
  company?: string | null,
  createdAt: string,
  endDate?: string | null,
  experience?: Experience | null,
  experienceId?: string | null,
  id: string,
  startDate?: string | null,
  title?: string | null,
  updatedAt: string,
};

export type ModelSkillConnection = {
  __typename: "ModelSkillConnection",
  items:  Array<Skill | null >,
  nextToken?: string | null,
};

export type Skill = {
  __typename: "Skill",
  createdAt: string,
  id: string,
  link?: string | null,
  resume?: Resume | null,
  resumeId?: string | null,
  title?: string | null,
  updatedAt: string,
};

export type Summary = {
  __typename: "Summary",
  createdAt: string,
  goals?: string | null,
  gptResponse?: string | null,
  headshot?: string | null,
  id: string,
  persona?: string | null,
  resume?: string | null,
  resumes?: ModelResumeConnection | null,
  updatedAt: string,
  url?: string | null,
};

export type Todo = {
  __typename: "Todo",
  content?: string | null,
  createdAt: string,
  id: string,
  updatedAt: string,
};

export type ModelContactInformationFilterInput = {
  and?: Array< ModelContactInformationFilterInput | null > | null,
  createdAt?: ModelStringInput | null,
  email?: ModelStringInput | null,
  id?: ModelIDInput | null,
  name?: ModelStringInput | null,
  not?: ModelContactInformationFilterInput | null,
  or?: Array< ModelContactInformationFilterInput | null > | null,
  phone?: ModelStringInput | null,
  resume?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelStringInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  _null = "_null",
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
}


export type ModelSizeInput = {
  between?: Array< number | null > | null,
  eq?: number | null,
  ge?: number | null,
  gt?: number | null,
  le?: number | null,
  lt?: number | null,
  ne?: number | null,
};

export type ModelIDInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  size?: ModelSizeInput | null,
};

export enum ModelSortDirection {
  ASC = "ASC",
  DESC = "DESC",
}


export type ModelContactInformationConnection = {
  __typename: "ModelContactInformationConnection",
  items:  Array<ContactInformation | null >,
  nextToken?: string | null,
};

export type ModelDegreeFilterInput = {
  and?: Array< ModelDegreeFilterInput | null > | null,
  createdAt?: ModelStringInput | null,
  endYear?: ModelStringInput | null,
  id?: ModelIDInput | null,
  major?: ModelStringInput | null,
  not?: ModelDegreeFilterInput | null,
  or?: Array< ModelDegreeFilterInput | null > | null,
  schoolId?: ModelStringInput | null,
  startYear?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelEducationFilterInput = {
  and?: Array< ModelEducationFilterInput | null > | null,
  createdAt?: ModelStringInput | null,
  id?: ModelIDInput | null,
  not?: ModelEducationFilterInput | null,
  or?: Array< ModelEducationFilterInput | null > | null,
  resume?: ModelStringInput | null,
  summary?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelEducationConnection = {
  __typename: "ModelEducationConnection",
  items:  Array<Education | null >,
  nextToken?: string | null,
};

export type ModelExperienceFilterInput = {
  and?: Array< ModelExperienceFilterInput | null > | null,
  createdAt?: ModelStringInput | null,
  id?: ModelIDInput | null,
  not?: ModelExperienceFilterInput | null,
  or?: Array< ModelExperienceFilterInput | null > | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelExperienceConnection = {
  __typename: "ModelExperienceConnection",
  items:  Array<Experience | null >,
  nextToken?: string | null,
};

export type ModelPositionFilterInput = {
  and?: Array< ModelPositionFilterInput | null > | null,
  company?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  endDate?: ModelStringInput | null,
  experienceId?: ModelStringInput | null,
  id?: ModelIDInput | null,
  not?: ModelPositionFilterInput | null,
  or?: Array< ModelPositionFilterInput | null > | null,
  startDate?: ModelStringInput | null,
  title?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelReferenceFilterInput = {
  and?: Array< ModelReferenceFilterInput | null > | null,
  contactInformationId?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  email?: ModelStringInput | null,
  id?: ModelIDInput | null,
  name?: ModelStringInput | null,
  not?: ModelReferenceFilterInput | null,
  or?: Array< ModelReferenceFilterInput | null > | null,
  phone?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelResumeFilterInput = {
  and?: Array< ModelResumeFilterInput | null > | null,
  contactInformationId?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  educationId?: ModelStringInput | null,
  experienceId?: ModelStringInput | null,
  id?: ModelIDInput | null,
  not?: ModelResumeFilterInput | null,
  or?: Array< ModelResumeFilterInput | null > | null,
  summaryId?: ModelStringInput | null,
  title?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelSchoolFilterInput = {
  and?: Array< ModelSchoolFilterInput | null > | null,
  createdAt?: ModelStringInput | null,
  educationId?: ModelStringInput | null,
  id?: ModelIDInput | null,
  name?: ModelStringInput | null,
  not?: ModelSchoolFilterInput | null,
  or?: Array< ModelSchoolFilterInput | null > | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelSkillFilterInput = {
  and?: Array< ModelSkillFilterInput | null > | null,
  createdAt?: ModelStringInput | null,
  id?: ModelIDInput | null,
  link?: ModelStringInput | null,
  not?: ModelSkillFilterInput | null,
  or?: Array< ModelSkillFilterInput | null > | null,
  resumeId?: ModelStringInput | null,
  title?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelSummaryFilterInput = {
  and?: Array< ModelSummaryFilterInput | null > | null,
  createdAt?: ModelStringInput | null,
  goals?: ModelStringInput | null,
  gptResponse?: ModelStringInput | null,
  headshot?: ModelStringInput | null,
  id?: ModelIDInput | null,
  not?: ModelSummaryFilterInput | null,
  or?: Array< ModelSummaryFilterInput | null > | null,
  persona?: ModelStringInput | null,
  resume?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  url?: ModelStringInput | null,
};

export type ModelSummaryConnection = {
  __typename: "ModelSummaryConnection",
  items:  Array<Summary | null >,
  nextToken?: string | null,
};

export type ModelTodoFilterInput = {
  and?: Array< ModelTodoFilterInput | null > | null,
  content?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  id?: ModelIDInput | null,
  not?: ModelTodoFilterInput | null,
  or?: Array< ModelTodoFilterInput | null > | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelTodoConnection = {
  __typename: "ModelTodoConnection",
  items:  Array<Todo | null >,
  nextToken?: string | null,
};

export type ModelContactInformationConditionInput = {
  and?: Array< ModelContactInformationConditionInput | null > | null,
  createdAt?: ModelStringInput | null,
  email?: ModelStringInput | null,
  name?: ModelStringInput | null,
  not?: ModelContactInformationConditionInput | null,
  or?: Array< ModelContactInformationConditionInput | null > | null,
  phone?: ModelStringInput | null,
  resume?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type CreateContactInformationInput = {
  email?: string | null,
  id?: string | null,
  name?: string | null,
  phone?: string | null,
  resume?: string | null,
};

export type ModelDegreeConditionInput = {
  and?: Array< ModelDegreeConditionInput | null > | null,
  createdAt?: ModelStringInput | null,
  endYear?: ModelStringInput | null,
  major?: ModelStringInput | null,
  not?: ModelDegreeConditionInput | null,
  or?: Array< ModelDegreeConditionInput | null > | null,
  schoolId?: ModelStringInput | null,
  startYear?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type CreateDegreeInput = {
  endYear?: string | null,
  id?: string | null,
  major?: string | null,
  schoolId?: string | null,
  startYear?: string | null,
};

export type ModelEducationConditionInput = {
  and?: Array< ModelEducationConditionInput | null > | null,
  createdAt?: ModelStringInput | null,
  not?: ModelEducationConditionInput | null,
  or?: Array< ModelEducationConditionInput | null > | null,
  resume?: ModelStringInput | null,
  summary?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type CreateEducationInput = {
  id?: string | null,
  resume?: string | null,
  summary?: string | null,
};

export type ModelExperienceConditionInput = {
  and?: Array< ModelExperienceConditionInput | null > | null,
  createdAt?: ModelStringInput | null,
  not?: ModelExperienceConditionInput | null,
  or?: Array< ModelExperienceConditionInput | null > | null,
  updatedAt?: ModelStringInput | null,
};

export type CreateExperienceInput = {
  id?: string | null,
};

export type ModelPositionConditionInput = {
  and?: Array< ModelPositionConditionInput | null > | null,
  company?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  endDate?: ModelStringInput | null,
  experienceId?: ModelStringInput | null,
  not?: ModelPositionConditionInput | null,
  or?: Array< ModelPositionConditionInput | null > | null,
  startDate?: ModelStringInput | null,
  title?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type CreatePositionInput = {
  company?: string | null,
  endDate?: string | null,
  experienceId?: string | null,
  id?: string | null,
  startDate?: string | null,
  title?: string | null,
};

export type ModelReferenceConditionInput = {
  and?: Array< ModelReferenceConditionInput | null > | null,
  contactInformationId?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  email?: ModelStringInput | null,
  name?: ModelStringInput | null,
  not?: ModelReferenceConditionInput | null,
  or?: Array< ModelReferenceConditionInput | null > | null,
  phone?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type CreateReferenceInput = {
  contactInformationId?: string | null,
  email?: string | null,
  id?: string | null,
  name?: string | null,
  phone?: string | null,
};

export type ModelResumeConditionInput = {
  and?: Array< ModelResumeConditionInput | null > | null,
  contactInformationId?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  educationId?: ModelStringInput | null,
  experienceId?: ModelStringInput | null,
  not?: ModelResumeConditionInput | null,
  or?: Array< ModelResumeConditionInput | null > | null,
  summaryId?: ModelStringInput | null,
  title?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type CreateResumeInput = {
  contactInformationId?: string | null,
  educationId?: string | null,
  experienceId?: string | null,
  id?: string | null,
  summaryId?: string | null,
  title?: string | null,
};

export type ModelSchoolConditionInput = {
  and?: Array< ModelSchoolConditionInput | null > | null,
  createdAt?: ModelStringInput | null,
  educationId?: ModelStringInput | null,
  name?: ModelStringInput | null,
  not?: ModelSchoolConditionInput | null,
  or?: Array< ModelSchoolConditionInput | null > | null,
  updatedAt?: ModelStringInput | null,
};

export type CreateSchoolInput = {
  educationId?: string | null,
  id?: string | null,
  name?: string | null,
};

export type ModelSkillConditionInput = {
  and?: Array< ModelSkillConditionInput | null > | null,
  createdAt?: ModelStringInput | null,
  link?: ModelStringInput | null,
  not?: ModelSkillConditionInput | null,
  or?: Array< ModelSkillConditionInput | null > | null,
  resumeId?: ModelStringInput | null,
  title?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type CreateSkillInput = {
  id?: string | null,
  link?: string | null,
  resumeId?: string | null,
  title?: string | null,
};

export type ModelSummaryConditionInput = {
  and?: Array< ModelSummaryConditionInput | null > | null,
  createdAt?: ModelStringInput | null,
  goals?: ModelStringInput | null,
  gptResponse?: ModelStringInput | null,
  headshot?: ModelStringInput | null,
  not?: ModelSummaryConditionInput | null,
  or?: Array< ModelSummaryConditionInput | null > | null,
  persona?: ModelStringInput | null,
  resume?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  url?: ModelStringInput | null,
};

export type CreateSummaryInput = {
  goals?: string | null,
  gptResponse?: string | null,
  headshot?: string | null,
  id?: string | null,
  persona?: string | null,
  resume?: string | null,
  url?: string | null,
};

export type ModelTodoConditionInput = {
  and?: Array< ModelTodoConditionInput | null > | null,
  content?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  not?: ModelTodoConditionInput | null,
  or?: Array< ModelTodoConditionInput | null > | null,
  updatedAt?: ModelStringInput | null,
};

export type CreateTodoInput = {
  content?: string | null,
  id?: string | null,
};

export type DeleteContactInformationInput = {
  id: string,
};

export type DeleteDegreeInput = {
  id: string,
};

export type DeleteEducationInput = {
  id: string,
};

export type DeleteExperienceInput = {
  id: string,
};

export type DeletePositionInput = {
  id: string,
};

export type DeleteReferenceInput = {
  id: string,
};

export type DeleteResumeInput = {
  id: string,
};

export type DeleteSchoolInput = {
  id: string,
};

export type DeleteSkillInput = {
  id: string,
};

export type DeleteSummaryInput = {
  id: string,
};

export type DeleteTodoInput = {
  id: string,
};

export type UpdateContactInformationInput = {
  email?: string | null,
  id: string,
  name?: string | null,
  phone?: string | null,
  resume?: string | null,
};

export type UpdateDegreeInput = {
  endYear?: string | null,
  id: string,
  major?: string | null,
  schoolId?: string | null,
  startYear?: string | null,
};

export type UpdateEducationInput = {
  id: string,
  resume?: string | null,
  summary?: string | null,
};

export type UpdateExperienceInput = {
  id: string,
};

export type UpdatePositionInput = {
  company?: string | null,
  endDate?: string | null,
  experienceId?: string | null,
  id: string,
  startDate?: string | null,
  title?: string | null,
};

export type UpdateReferenceInput = {
  contactInformationId?: string | null,
  email?: string | null,
  id: string,
  name?: string | null,
  phone?: string | null,
};

export type UpdateResumeInput = {
  contactInformationId?: string | null,
  educationId?: string | null,
  experienceId?: string | null,
  id: string,
  summaryId?: string | null,
  title?: string | null,
};

export type UpdateSchoolInput = {
  educationId?: string | null,
  id: string,
  name?: string | null,
};

export type UpdateSkillInput = {
  id: string,
  link?: string | null,
  resumeId?: string | null,
  title?: string | null,
};

export type UpdateSummaryInput = {
  goals?: string | null,
  gptResponse?: string | null,
  headshot?: string | null,
  id: string,
  persona?: string | null,
  resume?: string | null,
  url?: string | null,
};

export type UpdateTodoInput = {
  content?: string | null,
  id: string,
};

export type ModelSubscriptionContactInformationFilterInput = {
  and?: Array< ModelSubscriptionContactInformationFilterInput | null > | null,
  createdAt?: ModelSubscriptionStringInput | null,
  email?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  name?: ModelSubscriptionStringInput | null,
  or?: Array< ModelSubscriptionContactInformationFilterInput | null > | null,
  phone?: ModelSubscriptionStringInput | null,
  resume?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
};

export type ModelSubscriptionStringInput = {
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  in?: Array< string | null > | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionIDInput = {
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  in?: Array< string | null > | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionDegreeFilterInput = {
  and?: Array< ModelSubscriptionDegreeFilterInput | null > | null,
  createdAt?: ModelSubscriptionStringInput | null,
  endYear?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  major?: ModelSubscriptionStringInput | null,
  or?: Array< ModelSubscriptionDegreeFilterInput | null > | null,
  schoolId?: ModelSubscriptionStringInput | null,
  startYear?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
};

export type ModelSubscriptionEducationFilterInput = {
  and?: Array< ModelSubscriptionEducationFilterInput | null > | null,
  createdAt?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  or?: Array< ModelSubscriptionEducationFilterInput | null > | null,
  resume?: ModelSubscriptionStringInput | null,
  summary?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
};

export type ModelSubscriptionExperienceFilterInput = {
  and?: Array< ModelSubscriptionExperienceFilterInput | null > | null,
  createdAt?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  or?: Array< ModelSubscriptionExperienceFilterInput | null > | null,
  updatedAt?: ModelSubscriptionStringInput | null,
};

export type ModelSubscriptionPositionFilterInput = {
  and?: Array< ModelSubscriptionPositionFilterInput | null > | null,
  company?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  endDate?: ModelSubscriptionStringInput | null,
  experienceId?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  or?: Array< ModelSubscriptionPositionFilterInput | null > | null,
  startDate?: ModelSubscriptionStringInput | null,
  title?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
};

export type ModelSubscriptionReferenceFilterInput = {
  and?: Array< ModelSubscriptionReferenceFilterInput | null > | null,
  contactInformationId?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  email?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  name?: ModelSubscriptionStringInput | null,
  or?: Array< ModelSubscriptionReferenceFilterInput | null > | null,
  phone?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
};

export type ModelSubscriptionResumeFilterInput = {
  and?: Array< ModelSubscriptionResumeFilterInput | null > | null,
  contactInformationId?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  educationId?: ModelSubscriptionStringInput | null,
  experienceId?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  or?: Array< ModelSubscriptionResumeFilterInput | null > | null,
  summaryId?: ModelSubscriptionStringInput | null,
  title?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
};

export type ModelSubscriptionSchoolFilterInput = {
  and?: Array< ModelSubscriptionSchoolFilterInput | null > | null,
  createdAt?: ModelSubscriptionStringInput | null,
  educationId?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  name?: ModelSubscriptionStringInput | null,
  or?: Array< ModelSubscriptionSchoolFilterInput | null > | null,
  updatedAt?: ModelSubscriptionStringInput | null,
};

export type ModelSubscriptionSkillFilterInput = {
  and?: Array< ModelSubscriptionSkillFilterInput | null > | null,
  createdAt?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  link?: ModelSubscriptionStringInput | null,
  or?: Array< ModelSubscriptionSkillFilterInput | null > | null,
  resumeId?: ModelSubscriptionStringInput | null,
  title?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
};

export type ModelSubscriptionSummaryFilterInput = {
  and?: Array< ModelSubscriptionSummaryFilterInput | null > | null,
  createdAt?: ModelSubscriptionStringInput | null,
  goals?: ModelSubscriptionStringInput | null,
  gptResponse?: ModelSubscriptionStringInput | null,
  headshot?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  or?: Array< ModelSubscriptionSummaryFilterInput | null > | null,
  persona?: ModelSubscriptionStringInput | null,
  resume?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  url?: ModelSubscriptionStringInput | null,
};

export type ModelSubscriptionTodoFilterInput = {
  and?: Array< ModelSubscriptionTodoFilterInput | null > | null,
  content?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  or?: Array< ModelSubscriptionTodoFilterInput | null > | null,
  updatedAt?: ModelSubscriptionStringInput | null,
};

export type GetContactInformationQueryVariables = {
  id: string,
};

export type GetContactInformationQuery = {
  getContactInformation?:  {
    __typename: "ContactInformation",
    createdAt: string,
    email?: string | null,
    id: string,
    name?: string | null,
    phone?: string | null,
    references?:  {
      __typename: "ModelReferenceConnection",
      nextToken?: string | null,
    } | null,
    resume?: string | null,
    resumes?:  {
      __typename: "ModelResumeConnection",
      nextToken?: string | null,
    } | null,
    updatedAt: string,
  } | null,
};

export type GetDegreeQueryVariables = {
  id: string,
};

export type GetDegreeQuery = {
  getDegree?:  {
    __typename: "Degree",
    createdAt: string,
    endYear?: string | null,
    id: string,
    major?: string | null,
    school?:  {
      __typename: "School",
      createdAt: string,
      educationId?: string | null,
      id: string,
      name?: string | null,
      updatedAt: string,
    } | null,
    schoolId?: string | null,
    startYear?: string | null,
    updatedAt: string,
  } | null,
};

export type GetEducationQueryVariables = {
  id: string,
};

export type GetEducationQuery = {
  getEducation?:  {
    __typename: "Education",
    createdAt: string,
    id: string,
    resume?: string | null,
    resumes?:  {
      __typename: "ModelResumeConnection",
      nextToken?: string | null,
    } | null,
    schools?:  {
      __typename: "ModelSchoolConnection",
      nextToken?: string | null,
    } | null,
    summary?: string | null,
    updatedAt: string,
  } | null,
};

export type GetExperienceQueryVariables = {
  id: string,
};

export type GetExperienceQuery = {
  getExperience?:  {
    __typename: "Experience",
    createdAt: string,
    id: string,
    positions?:  {
      __typename: "ModelPositionConnection",
      nextToken?: string | null,
    } | null,
    resumes?:  {
      __typename: "ModelResumeConnection",
      nextToken?: string | null,
    } | null,
    updatedAt: string,
  } | null,
};

export type GetPositionQueryVariables = {
  id: string,
};

export type GetPositionQuery = {
  getPosition?:  {
    __typename: "Position",
    company?: string | null,
    createdAt: string,
    endDate?: string | null,
    experience?:  {
      __typename: "Experience",
      createdAt: string,
      id: string,
      updatedAt: string,
    } | null,
    experienceId?: string | null,
    id: string,
    startDate?: string | null,
    title?: string | null,
    updatedAt: string,
  } | null,
};

export type GetReferenceQueryVariables = {
  id: string,
};

export type GetReferenceQuery = {
  getReference?:  {
    __typename: "Reference",
    contactInformation?:  {
      __typename: "ContactInformation",
      createdAt: string,
      email?: string | null,
      id: string,
      name?: string | null,
      phone?: string | null,
      resume?: string | null,
      updatedAt: string,
    } | null,
    contactInformationId?: string | null,
    createdAt: string,
    email?: string | null,
    id: string,
    name?: string | null,
    phone?: string | null,
    updatedAt: string,
  } | null,
};

export type GetResumeQueryVariables = {
  id: string,
};

export type GetResumeQuery = {
  getResume?:  {
    __typename: "Resume",
    contactInformation?:  {
      __typename: "ContactInformation",
      createdAt: string,
      email?: string | null,
      id: string,
      name?: string | null,
      phone?: string | null,
      resume?: string | null,
      updatedAt: string,
    } | null,
    contactInformationId?: string | null,
    createdAt: string,
    education?:  {
      __typename: "Education",
      createdAt: string,
      id: string,
      resume?: string | null,
      summary?: string | null,
      updatedAt: string,
    } | null,
    educationId?: string | null,
    experience?:  {
      __typename: "Experience",
      createdAt: string,
      id: string,
      updatedAt: string,
    } | null,
    experienceId?: string | null,
    id: string,
    skills?:  {
      __typename: "ModelSkillConnection",
      nextToken?: string | null,
    } | null,
    summary?:  {
      __typename: "Summary",
      createdAt: string,
      goals?: string | null,
      gptResponse?: string | null,
      headshot?: string | null,
      id: string,
      persona?: string | null,
      resume?: string | null,
      updatedAt: string,
      url?: string | null,
    } | null,
    summaryId?: string | null,
    title?: string | null,
    updatedAt: string,
  } | null,
};

export type GetSchoolQueryVariables = {
  id: string,
};

export type GetSchoolQuery = {
  getSchool?:  {
    __typename: "School",
    createdAt: string,
    degrees?:  {
      __typename: "ModelDegreeConnection",
      nextToken?: string | null,
    } | null,
    education?:  {
      __typename: "Education",
      createdAt: string,
      id: string,
      resume?: string | null,
      summary?: string | null,
      updatedAt: string,
    } | null,
    educationId?: string | null,
    id: string,
    name?: string | null,
    updatedAt: string,
  } | null,
};

export type GetSkillQueryVariables = {
  id: string,
};

export type GetSkillQuery = {
  getSkill?:  {
    __typename: "Skill",
    createdAt: string,
    id: string,
    link?: string | null,
    resume?:  {
      __typename: "Resume",
      contactInformationId?: string | null,
      createdAt: string,
      educationId?: string | null,
      experienceId?: string | null,
      id: string,
      summaryId?: string | null,
      title?: string | null,
      updatedAt: string,
    } | null,
    resumeId?: string | null,
    title?: string | null,
    updatedAt: string,
  } | null,
};

export type GetSummaryQueryVariables = {
  id: string,
};

export type GetSummaryQuery = {
  getSummary?:  {
    __typename: "Summary",
    createdAt: string,
    goals?: string | null,
    gptResponse?: string | null,
    headshot?: string | null,
    id: string,
    persona?: string | null,
    resume?: string | null,
    resumes?:  {
      __typename: "ModelResumeConnection",
      nextToken?: string | null,
    } | null,
    updatedAt: string,
    url?: string | null,
  } | null,
};

export type GetTodoQueryVariables = {
  id: string,
};

export type GetTodoQuery = {
  getTodo?:  {
    __typename: "Todo",
    content?: string | null,
    createdAt: string,
    id: string,
    updatedAt: string,
  } | null,
};

export type ListContactInformationsQueryVariables = {
  filter?: ModelContactInformationFilterInput | null,
  id?: string | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
};

export type ListContactInformationsQuery = {
  listContactInformations?:  {
    __typename: "ModelContactInformationConnection",
    items:  Array< {
      __typename: "ContactInformation",
      createdAt: string,
      email?: string | null,
      id: string,
      name?: string | null,
      phone?: string | null,
      resume?: string | null,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListDegreesQueryVariables = {
  filter?: ModelDegreeFilterInput | null,
  id?: string | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
};

export type ListDegreesQuery = {
  listDegrees?:  {
    __typename: "ModelDegreeConnection",
    items:  Array< {
      __typename: "Degree",
      createdAt: string,
      endYear?: string | null,
      id: string,
      major?: string | null,
      schoolId?: string | null,
      startYear?: string | null,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListEducationsQueryVariables = {
  filter?: ModelEducationFilterInput | null,
  id?: string | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
};

export type ListEducationsQuery = {
  listEducations?:  {
    __typename: "ModelEducationConnection",
    items:  Array< {
      __typename: "Education",
      createdAt: string,
      id: string,
      resume?: string | null,
      summary?: string | null,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListExperiencesQueryVariables = {
  filter?: ModelExperienceFilterInput | null,
  id?: string | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
};

export type ListExperiencesQuery = {
  listExperiences?:  {
    __typename: "ModelExperienceConnection",
    items:  Array< {
      __typename: "Experience",
      createdAt: string,
      id: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListPositionsQueryVariables = {
  filter?: ModelPositionFilterInput | null,
  id?: string | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
};

export type ListPositionsQuery = {
  listPositions?:  {
    __typename: "ModelPositionConnection",
    items:  Array< {
      __typename: "Position",
      company?: string | null,
      createdAt: string,
      endDate?: string | null,
      experienceId?: string | null,
      id: string,
      startDate?: string | null,
      title?: string | null,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListReferencesQueryVariables = {
  filter?: ModelReferenceFilterInput | null,
  id?: string | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
};

export type ListReferencesQuery = {
  listReferences?:  {
    __typename: "ModelReferenceConnection",
    items:  Array< {
      __typename: "Reference",
      contactInformationId?: string | null,
      createdAt: string,
      email?: string | null,
      id: string,
      name?: string | null,
      phone?: string | null,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListResumesQueryVariables = {
  filter?: ModelResumeFilterInput | null,
  id?: string | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
};

export type ListResumesQuery = {
  listResumes?:  {
    __typename: "ModelResumeConnection",
    items:  Array< {
      __typename: "Resume",
      contactInformationId?: string | null,
      createdAt: string,
      educationId?: string | null,
      experienceId?: string | null,
      id: string,
      summaryId?: string | null,
      title?: string | null,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListSchoolsQueryVariables = {
  filter?: ModelSchoolFilterInput | null,
  id?: string | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
};

export type ListSchoolsQuery = {
  listSchools?:  {
    __typename: "ModelSchoolConnection",
    items:  Array< {
      __typename: "School",
      createdAt: string,
      educationId?: string | null,
      id: string,
      name?: string | null,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListSkillsQueryVariables = {
  filter?: ModelSkillFilterInput | null,
  id?: string | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
};

export type ListSkillsQuery = {
  listSkills?:  {
    __typename: "ModelSkillConnection",
    items:  Array< {
      __typename: "Skill",
      createdAt: string,
      id: string,
      link?: string | null,
      resumeId?: string | null,
      title?: string | null,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListSummariesQueryVariables = {
  filter?: ModelSummaryFilterInput | null,
  id?: string | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
};

export type ListSummariesQuery = {
  listSummaries?:  {
    __typename: "ModelSummaryConnection",
    items:  Array< {
      __typename: "Summary",
      createdAt: string,
      goals?: string | null,
      gptResponse?: string | null,
      headshot?: string | null,
      id: string,
      persona?: string | null,
      resume?: string | null,
      updatedAt: string,
      url?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListTodosQueryVariables = {
  filter?: ModelTodoFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListTodosQuery = {
  listTodos?:  {
    __typename: "ModelTodoConnection",
    items:  Array< {
      __typename: "Todo",
      content?: string | null,
      createdAt: string,
      id: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type CreateContactInformationMutationVariables = {
  condition?: ModelContactInformationConditionInput | null,
  input: CreateContactInformationInput,
};

export type CreateContactInformationMutation = {
  createContactInformation?:  {
    __typename: "ContactInformation",
    createdAt: string,
    email?: string | null,
    id: string,
    name?: string | null,
    phone?: string | null,
    references?:  {
      __typename: "ModelReferenceConnection",
      nextToken?: string | null,
    } | null,
    resume?: string | null,
    resumes?:  {
      __typename: "ModelResumeConnection",
      nextToken?: string | null,
    } | null,
    updatedAt: string,
  } | null,
};

export type CreateDegreeMutationVariables = {
  condition?: ModelDegreeConditionInput | null,
  input: CreateDegreeInput,
};

export type CreateDegreeMutation = {
  createDegree?:  {
    __typename: "Degree",
    createdAt: string,
    endYear?: string | null,
    id: string,
    major?: string | null,
    school?:  {
      __typename: "School",
      createdAt: string,
      educationId?: string | null,
      id: string,
      name?: string | null,
      updatedAt: string,
    } | null,
    schoolId?: string | null,
    startYear?: string | null,
    updatedAt: string,
  } | null,
};

export type CreateEducationMutationVariables = {
  condition?: ModelEducationConditionInput | null,
  input: CreateEducationInput,
};

export type CreateEducationMutation = {
  createEducation?:  {
    __typename: "Education",
    createdAt: string,
    id: string,
    resume?: string | null,
    resumes?:  {
      __typename: "ModelResumeConnection",
      nextToken?: string | null,
    } | null,
    schools?:  {
      __typename: "ModelSchoolConnection",
      nextToken?: string | null,
    } | null,
    summary?: string | null,
    updatedAt: string,
  } | null,
};

export type CreateExperienceMutationVariables = {
  condition?: ModelExperienceConditionInput | null,
  input: CreateExperienceInput,
};

export type CreateExperienceMutation = {
  createExperience?:  {
    __typename: "Experience",
    createdAt: string,
    id: string,
    positions?:  {
      __typename: "ModelPositionConnection",
      nextToken?: string | null,
    } | null,
    resumes?:  {
      __typename: "ModelResumeConnection",
      nextToken?: string | null,
    } | null,
    updatedAt: string,
  } | null,
};

export type CreatePositionMutationVariables = {
  condition?: ModelPositionConditionInput | null,
  input: CreatePositionInput,
};

export type CreatePositionMutation = {
  createPosition?:  {
    __typename: "Position",
    company?: string | null,
    createdAt: string,
    endDate?: string | null,
    experience?:  {
      __typename: "Experience",
      createdAt: string,
      id: string,
      updatedAt: string,
    } | null,
    experienceId?: string | null,
    id: string,
    startDate?: string | null,
    title?: string | null,
    updatedAt: string,
  } | null,
};

export type CreateReferenceMutationVariables = {
  condition?: ModelReferenceConditionInput | null,
  input: CreateReferenceInput,
};

export type CreateReferenceMutation = {
  createReference?:  {
    __typename: "Reference",
    contactInformation?:  {
      __typename: "ContactInformation",
      createdAt: string,
      email?: string | null,
      id: string,
      name?: string | null,
      phone?: string | null,
      resume?: string | null,
      updatedAt: string,
    } | null,
    contactInformationId?: string | null,
    createdAt: string,
    email?: string | null,
    id: string,
    name?: string | null,
    phone?: string | null,
    updatedAt: string,
  } | null,
};

export type CreateResumeMutationVariables = {
  condition?: ModelResumeConditionInput | null,
  input: CreateResumeInput,
};

export type CreateResumeMutation = {
  createResume?:  {
    __typename: "Resume",
    contactInformation?:  {
      __typename: "ContactInformation",
      createdAt: string,
      email?: string | null,
      id: string,
      name?: string | null,
      phone?: string | null,
      resume?: string | null,
      updatedAt: string,
    } | null,
    contactInformationId?: string | null,
    createdAt: string,
    education?:  {
      __typename: "Education",
      createdAt: string,
      id: string,
      resume?: string | null,
      summary?: string | null,
      updatedAt: string,
    } | null,
    educationId?: string | null,
    experience?:  {
      __typename: "Experience",
      createdAt: string,
      id: string,
      updatedAt: string,
    } | null,
    experienceId?: string | null,
    id: string,
    skills?:  {
      __typename: "ModelSkillConnection",
      nextToken?: string | null,
    } | null,
    summary?:  {
      __typename: "Summary",
      createdAt: string,
      goals?: string | null,
      gptResponse?: string | null,
      headshot?: string | null,
      id: string,
      persona?: string | null,
      resume?: string | null,
      updatedAt: string,
      url?: string | null,
    } | null,
    summaryId?: string | null,
    title?: string | null,
    updatedAt: string,
  } | null,
};

export type CreateSchoolMutationVariables = {
  condition?: ModelSchoolConditionInput | null,
  input: CreateSchoolInput,
};

export type CreateSchoolMutation = {
  createSchool?:  {
    __typename: "School",
    createdAt: string,
    degrees?:  {
      __typename: "ModelDegreeConnection",
      nextToken?: string | null,
    } | null,
    education?:  {
      __typename: "Education",
      createdAt: string,
      id: string,
      resume?: string | null,
      summary?: string | null,
      updatedAt: string,
    } | null,
    educationId?: string | null,
    id: string,
    name?: string | null,
    updatedAt: string,
  } | null,
};

export type CreateSkillMutationVariables = {
  condition?: ModelSkillConditionInput | null,
  input: CreateSkillInput,
};

export type CreateSkillMutation = {
  createSkill?:  {
    __typename: "Skill",
    createdAt: string,
    id: string,
    link?: string | null,
    resume?:  {
      __typename: "Resume",
      contactInformationId?: string | null,
      createdAt: string,
      educationId?: string | null,
      experienceId?: string | null,
      id: string,
      summaryId?: string | null,
      title?: string | null,
      updatedAt: string,
    } | null,
    resumeId?: string | null,
    title?: string | null,
    updatedAt: string,
  } | null,
};

export type CreateSummaryMutationVariables = {
  condition?: ModelSummaryConditionInput | null,
  input: CreateSummaryInput,
};

export type CreateSummaryMutation = {
  createSummary?:  {
    __typename: "Summary",
    createdAt: string,
    goals?: string | null,
    gptResponse?: string | null,
    headshot?: string | null,
    id: string,
    persona?: string | null,
    resume?: string | null,
    resumes?:  {
      __typename: "ModelResumeConnection",
      nextToken?: string | null,
    } | null,
    updatedAt: string,
    url?: string | null,
  } | null,
};

export type CreateTodoMutationVariables = {
  condition?: ModelTodoConditionInput | null,
  input: CreateTodoInput,
};

export type CreateTodoMutation = {
  createTodo?:  {
    __typename: "Todo",
    content?: string | null,
    createdAt: string,
    id: string,
    updatedAt: string,
  } | null,
};

export type DeleteContactInformationMutationVariables = {
  condition?: ModelContactInformationConditionInput | null,
  input: DeleteContactInformationInput,
};

export type DeleteContactInformationMutation = {
  deleteContactInformation?:  {
    __typename: "ContactInformation",
    createdAt: string,
    email?: string | null,
    id: string,
    name?: string | null,
    phone?: string | null,
    references?:  {
      __typename: "ModelReferenceConnection",
      nextToken?: string | null,
    } | null,
    resume?: string | null,
    resumes?:  {
      __typename: "ModelResumeConnection",
      nextToken?: string | null,
    } | null,
    updatedAt: string,
  } | null,
};

export type DeleteDegreeMutationVariables = {
  condition?: ModelDegreeConditionInput | null,
  input: DeleteDegreeInput,
};

export type DeleteDegreeMutation = {
  deleteDegree?:  {
    __typename: "Degree",
    createdAt: string,
    endYear?: string | null,
    id: string,
    major?: string | null,
    school?:  {
      __typename: "School",
      createdAt: string,
      educationId?: string | null,
      id: string,
      name?: string | null,
      updatedAt: string,
    } | null,
    schoolId?: string | null,
    startYear?: string | null,
    updatedAt: string,
  } | null,
};

export type DeleteEducationMutationVariables = {
  condition?: ModelEducationConditionInput | null,
  input: DeleteEducationInput,
};

export type DeleteEducationMutation = {
  deleteEducation?:  {
    __typename: "Education",
    createdAt: string,
    id: string,
    resume?: string | null,
    resumes?:  {
      __typename: "ModelResumeConnection",
      nextToken?: string | null,
    } | null,
    schools?:  {
      __typename: "ModelSchoolConnection",
      nextToken?: string | null,
    } | null,
    summary?: string | null,
    updatedAt: string,
  } | null,
};

export type DeleteExperienceMutationVariables = {
  condition?: ModelExperienceConditionInput | null,
  input: DeleteExperienceInput,
};

export type DeleteExperienceMutation = {
  deleteExperience?:  {
    __typename: "Experience",
    createdAt: string,
    id: string,
    positions?:  {
      __typename: "ModelPositionConnection",
      nextToken?: string | null,
    } | null,
    resumes?:  {
      __typename: "ModelResumeConnection",
      nextToken?: string | null,
    } | null,
    updatedAt: string,
  } | null,
};

export type DeletePositionMutationVariables = {
  condition?: ModelPositionConditionInput | null,
  input: DeletePositionInput,
};

export type DeletePositionMutation = {
  deletePosition?:  {
    __typename: "Position",
    company?: string | null,
    createdAt: string,
    endDate?: string | null,
    experience?:  {
      __typename: "Experience",
      createdAt: string,
      id: string,
      updatedAt: string,
    } | null,
    experienceId?: string | null,
    id: string,
    startDate?: string | null,
    title?: string | null,
    updatedAt: string,
  } | null,
};

export type DeleteReferenceMutationVariables = {
  condition?: ModelReferenceConditionInput | null,
  input: DeleteReferenceInput,
};

export type DeleteReferenceMutation = {
  deleteReference?:  {
    __typename: "Reference",
    contactInformation?:  {
      __typename: "ContactInformation",
      createdAt: string,
      email?: string | null,
      id: string,
      name?: string | null,
      phone?: string | null,
      resume?: string | null,
      updatedAt: string,
    } | null,
    contactInformationId?: string | null,
    createdAt: string,
    email?: string | null,
    id: string,
    name?: string | null,
    phone?: string | null,
    updatedAt: string,
  } | null,
};

export type DeleteResumeMutationVariables = {
  condition?: ModelResumeConditionInput | null,
  input: DeleteResumeInput,
};

export type DeleteResumeMutation = {
  deleteResume?:  {
    __typename: "Resume",
    contactInformation?:  {
      __typename: "ContactInformation",
      createdAt: string,
      email?: string | null,
      id: string,
      name?: string | null,
      phone?: string | null,
      resume?: string | null,
      updatedAt: string,
    } | null,
    contactInformationId?: string | null,
    createdAt: string,
    education?:  {
      __typename: "Education",
      createdAt: string,
      id: string,
      resume?: string | null,
      summary?: string | null,
      updatedAt: string,
    } | null,
    educationId?: string | null,
    experience?:  {
      __typename: "Experience",
      createdAt: string,
      id: string,
      updatedAt: string,
    } | null,
    experienceId?: string | null,
    id: string,
    skills?:  {
      __typename: "ModelSkillConnection",
      nextToken?: string | null,
    } | null,
    summary?:  {
      __typename: "Summary",
      createdAt: string,
      goals?: string | null,
      gptResponse?: string | null,
      headshot?: string | null,
      id: string,
      persona?: string | null,
      resume?: string | null,
      updatedAt: string,
      url?: string | null,
    } | null,
    summaryId?: string | null,
    title?: string | null,
    updatedAt: string,
  } | null,
};

export type DeleteSchoolMutationVariables = {
  condition?: ModelSchoolConditionInput | null,
  input: DeleteSchoolInput,
};

export type DeleteSchoolMutation = {
  deleteSchool?:  {
    __typename: "School",
    createdAt: string,
    degrees?:  {
      __typename: "ModelDegreeConnection",
      nextToken?: string | null,
    } | null,
    education?:  {
      __typename: "Education",
      createdAt: string,
      id: string,
      resume?: string | null,
      summary?: string | null,
      updatedAt: string,
    } | null,
    educationId?: string | null,
    id: string,
    name?: string | null,
    updatedAt: string,
  } | null,
};

export type DeleteSkillMutationVariables = {
  condition?: ModelSkillConditionInput | null,
  input: DeleteSkillInput,
};

export type DeleteSkillMutation = {
  deleteSkill?:  {
    __typename: "Skill",
    createdAt: string,
    id: string,
    link?: string | null,
    resume?:  {
      __typename: "Resume",
      contactInformationId?: string | null,
      createdAt: string,
      educationId?: string | null,
      experienceId?: string | null,
      id: string,
      summaryId?: string | null,
      title?: string | null,
      updatedAt: string,
    } | null,
    resumeId?: string | null,
    title?: string | null,
    updatedAt: string,
  } | null,
};

export type DeleteSummaryMutationVariables = {
  condition?: ModelSummaryConditionInput | null,
  input: DeleteSummaryInput,
};

export type DeleteSummaryMutation = {
  deleteSummary?:  {
    __typename: "Summary",
    createdAt: string,
    goals?: string | null,
    gptResponse?: string | null,
    headshot?: string | null,
    id: string,
    persona?: string | null,
    resume?: string | null,
    resumes?:  {
      __typename: "ModelResumeConnection",
      nextToken?: string | null,
    } | null,
    updatedAt: string,
    url?: string | null,
  } | null,
};

export type DeleteTodoMutationVariables = {
  condition?: ModelTodoConditionInput | null,
  input: DeleteTodoInput,
};

export type DeleteTodoMutation = {
  deleteTodo?:  {
    __typename: "Todo",
    content?: string | null,
    createdAt: string,
    id: string,
    updatedAt: string,
  } | null,
};

export type UpdateContactInformationMutationVariables = {
  condition?: ModelContactInformationConditionInput | null,
  input: UpdateContactInformationInput,
};

export type UpdateContactInformationMutation = {
  updateContactInformation?:  {
    __typename: "ContactInformation",
    createdAt: string,
    email?: string | null,
    id: string,
    name?: string | null,
    phone?: string | null,
    references?:  {
      __typename: "ModelReferenceConnection",
      nextToken?: string | null,
    } | null,
    resume?: string | null,
    resumes?:  {
      __typename: "ModelResumeConnection",
      nextToken?: string | null,
    } | null,
    updatedAt: string,
  } | null,
};

export type UpdateDegreeMutationVariables = {
  condition?: ModelDegreeConditionInput | null,
  input: UpdateDegreeInput,
};

export type UpdateDegreeMutation = {
  updateDegree?:  {
    __typename: "Degree",
    createdAt: string,
    endYear?: string | null,
    id: string,
    major?: string | null,
    school?:  {
      __typename: "School",
      createdAt: string,
      educationId?: string | null,
      id: string,
      name?: string | null,
      updatedAt: string,
    } | null,
    schoolId?: string | null,
    startYear?: string | null,
    updatedAt: string,
  } | null,
};

export type UpdateEducationMutationVariables = {
  condition?: ModelEducationConditionInput | null,
  input: UpdateEducationInput,
};

export type UpdateEducationMutation = {
  updateEducation?:  {
    __typename: "Education",
    createdAt: string,
    id: string,
    resume?: string | null,
    resumes?:  {
      __typename: "ModelResumeConnection",
      nextToken?: string | null,
    } | null,
    schools?:  {
      __typename: "ModelSchoolConnection",
      nextToken?: string | null,
    } | null,
    summary?: string | null,
    updatedAt: string,
  } | null,
};

export type UpdateExperienceMutationVariables = {
  condition?: ModelExperienceConditionInput | null,
  input: UpdateExperienceInput,
};

export type UpdateExperienceMutation = {
  updateExperience?:  {
    __typename: "Experience",
    createdAt: string,
    id: string,
    positions?:  {
      __typename: "ModelPositionConnection",
      nextToken?: string | null,
    } | null,
    resumes?:  {
      __typename: "ModelResumeConnection",
      nextToken?: string | null,
    } | null,
    updatedAt: string,
  } | null,
};

export type UpdatePositionMutationVariables = {
  condition?: ModelPositionConditionInput | null,
  input: UpdatePositionInput,
};

export type UpdatePositionMutation = {
  updatePosition?:  {
    __typename: "Position",
    company?: string | null,
    createdAt: string,
    endDate?: string | null,
    experience?:  {
      __typename: "Experience",
      createdAt: string,
      id: string,
      updatedAt: string,
    } | null,
    experienceId?: string | null,
    id: string,
    startDate?: string | null,
    title?: string | null,
    updatedAt: string,
  } | null,
};

export type UpdateReferenceMutationVariables = {
  condition?: ModelReferenceConditionInput | null,
  input: UpdateReferenceInput,
};

export type UpdateReferenceMutation = {
  updateReference?:  {
    __typename: "Reference",
    contactInformation?:  {
      __typename: "ContactInformation",
      createdAt: string,
      email?: string | null,
      id: string,
      name?: string | null,
      phone?: string | null,
      resume?: string | null,
      updatedAt: string,
    } | null,
    contactInformationId?: string | null,
    createdAt: string,
    email?: string | null,
    id: string,
    name?: string | null,
    phone?: string | null,
    updatedAt: string,
  } | null,
};

export type UpdateResumeMutationVariables = {
  condition?: ModelResumeConditionInput | null,
  input: UpdateResumeInput,
};

export type UpdateResumeMutation = {
  updateResume?:  {
    __typename: "Resume",
    contactInformation?:  {
      __typename: "ContactInformation",
      createdAt: string,
      email?: string | null,
      id: string,
      name?: string | null,
      phone?: string | null,
      resume?: string | null,
      updatedAt: string,
    } | null,
    contactInformationId?: string | null,
    createdAt: string,
    education?:  {
      __typename: "Education",
      createdAt: string,
      id: string,
      resume?: string | null,
      summary?: string | null,
      updatedAt: string,
    } | null,
    educationId?: string | null,
    experience?:  {
      __typename: "Experience",
      createdAt: string,
      id: string,
      updatedAt: string,
    } | null,
    experienceId?: string | null,
    id: string,
    skills?:  {
      __typename: "ModelSkillConnection",
      nextToken?: string | null,
    } | null,
    summary?:  {
      __typename: "Summary",
      createdAt: string,
      goals?: string | null,
      gptResponse?: string | null,
      headshot?: string | null,
      id: string,
      persona?: string | null,
      resume?: string | null,
      updatedAt: string,
      url?: string | null,
    } | null,
    summaryId?: string | null,
    title?: string | null,
    updatedAt: string,
  } | null,
};

export type UpdateSchoolMutationVariables = {
  condition?: ModelSchoolConditionInput | null,
  input: UpdateSchoolInput,
};

export type UpdateSchoolMutation = {
  updateSchool?:  {
    __typename: "School",
    createdAt: string,
    degrees?:  {
      __typename: "ModelDegreeConnection",
      nextToken?: string | null,
    } | null,
    education?:  {
      __typename: "Education",
      createdAt: string,
      id: string,
      resume?: string | null,
      summary?: string | null,
      updatedAt: string,
    } | null,
    educationId?: string | null,
    id: string,
    name?: string | null,
    updatedAt: string,
  } | null,
};

export type UpdateSkillMutationVariables = {
  condition?: ModelSkillConditionInput | null,
  input: UpdateSkillInput,
};

export type UpdateSkillMutation = {
  updateSkill?:  {
    __typename: "Skill",
    createdAt: string,
    id: string,
    link?: string | null,
    resume?:  {
      __typename: "Resume",
      contactInformationId?: string | null,
      createdAt: string,
      educationId?: string | null,
      experienceId?: string | null,
      id: string,
      summaryId?: string | null,
      title?: string | null,
      updatedAt: string,
    } | null,
    resumeId?: string | null,
    title?: string | null,
    updatedAt: string,
  } | null,
};

export type UpdateSummaryMutationVariables = {
  condition?: ModelSummaryConditionInput | null,
  input: UpdateSummaryInput,
};

export type UpdateSummaryMutation = {
  updateSummary?:  {
    __typename: "Summary",
    createdAt: string,
    goals?: string | null,
    gptResponse?: string | null,
    headshot?: string | null,
    id: string,
    persona?: string | null,
    resume?: string | null,
    resumes?:  {
      __typename: "ModelResumeConnection",
      nextToken?: string | null,
    } | null,
    updatedAt: string,
    url?: string | null,
  } | null,
};

export type UpdateTodoMutationVariables = {
  condition?: ModelTodoConditionInput | null,
  input: UpdateTodoInput,
};

export type UpdateTodoMutation = {
  updateTodo?:  {
    __typename: "Todo",
    content?: string | null,
    createdAt: string,
    id: string,
    updatedAt: string,
  } | null,
};

export type OnCreateContactInformationSubscriptionVariables = {
  filter?: ModelSubscriptionContactInformationFilterInput | null,
};

export type OnCreateContactInformationSubscription = {
  onCreateContactInformation?:  {
    __typename: "ContactInformation",
    createdAt: string,
    email?: string | null,
    id: string,
    name?: string | null,
    phone?: string | null,
    references?:  {
      __typename: "ModelReferenceConnection",
      nextToken?: string | null,
    } | null,
    resume?: string | null,
    resumes?:  {
      __typename: "ModelResumeConnection",
      nextToken?: string | null,
    } | null,
    updatedAt: string,
  } | null,
};

export type OnCreateDegreeSubscriptionVariables = {
  filter?: ModelSubscriptionDegreeFilterInput | null,
};

export type OnCreateDegreeSubscription = {
  onCreateDegree?:  {
    __typename: "Degree",
    createdAt: string,
    endYear?: string | null,
    id: string,
    major?: string | null,
    school?:  {
      __typename: "School",
      createdAt: string,
      educationId?: string | null,
      id: string,
      name?: string | null,
      updatedAt: string,
    } | null,
    schoolId?: string | null,
    startYear?: string | null,
    updatedAt: string,
  } | null,
};

export type OnCreateEducationSubscriptionVariables = {
  filter?: ModelSubscriptionEducationFilterInput | null,
};

export type OnCreateEducationSubscription = {
  onCreateEducation?:  {
    __typename: "Education",
    createdAt: string,
    id: string,
    resume?: string | null,
    resumes?:  {
      __typename: "ModelResumeConnection",
      nextToken?: string | null,
    } | null,
    schools?:  {
      __typename: "ModelSchoolConnection",
      nextToken?: string | null,
    } | null,
    summary?: string | null,
    updatedAt: string,
  } | null,
};

export type OnCreateExperienceSubscriptionVariables = {
  filter?: ModelSubscriptionExperienceFilterInput | null,
};

export type OnCreateExperienceSubscription = {
  onCreateExperience?:  {
    __typename: "Experience",
    createdAt: string,
    id: string,
    positions?:  {
      __typename: "ModelPositionConnection",
      nextToken?: string | null,
    } | null,
    resumes?:  {
      __typename: "ModelResumeConnection",
      nextToken?: string | null,
    } | null,
    updatedAt: string,
  } | null,
};

export type OnCreatePositionSubscriptionVariables = {
  filter?: ModelSubscriptionPositionFilterInput | null,
};

export type OnCreatePositionSubscription = {
  onCreatePosition?:  {
    __typename: "Position",
    company?: string | null,
    createdAt: string,
    endDate?: string | null,
    experience?:  {
      __typename: "Experience",
      createdAt: string,
      id: string,
      updatedAt: string,
    } | null,
    experienceId?: string | null,
    id: string,
    startDate?: string | null,
    title?: string | null,
    updatedAt: string,
  } | null,
};

export type OnCreateReferenceSubscriptionVariables = {
  filter?: ModelSubscriptionReferenceFilterInput | null,
};

export type OnCreateReferenceSubscription = {
  onCreateReference?:  {
    __typename: "Reference",
    contactInformation?:  {
      __typename: "ContactInformation",
      createdAt: string,
      email?: string | null,
      id: string,
      name?: string | null,
      phone?: string | null,
      resume?: string | null,
      updatedAt: string,
    } | null,
    contactInformationId?: string | null,
    createdAt: string,
    email?: string | null,
    id: string,
    name?: string | null,
    phone?: string | null,
    updatedAt: string,
  } | null,
};

export type OnCreateResumeSubscriptionVariables = {
  filter?: ModelSubscriptionResumeFilterInput | null,
};

export type OnCreateResumeSubscription = {
  onCreateResume?:  {
    __typename: "Resume",
    contactInformation?:  {
      __typename: "ContactInformation",
      createdAt: string,
      email?: string | null,
      id: string,
      name?: string | null,
      phone?: string | null,
      resume?: string | null,
      updatedAt: string,
    } | null,
    contactInformationId?: string | null,
    createdAt: string,
    education?:  {
      __typename: "Education",
      createdAt: string,
      id: string,
      resume?: string | null,
      summary?: string | null,
      updatedAt: string,
    } | null,
    educationId?: string | null,
    experience?:  {
      __typename: "Experience",
      createdAt: string,
      id: string,
      updatedAt: string,
    } | null,
    experienceId?: string | null,
    id: string,
    skills?:  {
      __typename: "ModelSkillConnection",
      nextToken?: string | null,
    } | null,
    summary?:  {
      __typename: "Summary",
      createdAt: string,
      goals?: string | null,
      gptResponse?: string | null,
      headshot?: string | null,
      id: string,
      persona?: string | null,
      resume?: string | null,
      updatedAt: string,
      url?: string | null,
    } | null,
    summaryId?: string | null,
    title?: string | null,
    updatedAt: string,
  } | null,
};

export type OnCreateSchoolSubscriptionVariables = {
  filter?: ModelSubscriptionSchoolFilterInput | null,
};

export type OnCreateSchoolSubscription = {
  onCreateSchool?:  {
    __typename: "School",
    createdAt: string,
    degrees?:  {
      __typename: "ModelDegreeConnection",
      nextToken?: string | null,
    } | null,
    education?:  {
      __typename: "Education",
      createdAt: string,
      id: string,
      resume?: string | null,
      summary?: string | null,
      updatedAt: string,
    } | null,
    educationId?: string | null,
    id: string,
    name?: string | null,
    updatedAt: string,
  } | null,
};

export type OnCreateSkillSubscriptionVariables = {
  filter?: ModelSubscriptionSkillFilterInput | null,
};

export type OnCreateSkillSubscription = {
  onCreateSkill?:  {
    __typename: "Skill",
    createdAt: string,
    id: string,
    link?: string | null,
    resume?:  {
      __typename: "Resume",
      contactInformationId?: string | null,
      createdAt: string,
      educationId?: string | null,
      experienceId?: string | null,
      id: string,
      summaryId?: string | null,
      title?: string | null,
      updatedAt: string,
    } | null,
    resumeId?: string | null,
    title?: string | null,
    updatedAt: string,
  } | null,
};

export type OnCreateSummarySubscriptionVariables = {
  filter?: ModelSubscriptionSummaryFilterInput | null,
};

export type OnCreateSummarySubscription = {
  onCreateSummary?:  {
    __typename: "Summary",
    createdAt: string,
    goals?: string | null,
    gptResponse?: string | null,
    headshot?: string | null,
    id: string,
    persona?: string | null,
    resume?: string | null,
    resumes?:  {
      __typename: "ModelResumeConnection",
      nextToken?: string | null,
    } | null,
    updatedAt: string,
    url?: string | null,
  } | null,
};

export type OnCreateTodoSubscriptionVariables = {
  filter?: ModelSubscriptionTodoFilterInput | null,
};

export type OnCreateTodoSubscription = {
  onCreateTodo?:  {
    __typename: "Todo",
    content?: string | null,
    createdAt: string,
    id: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteContactInformationSubscriptionVariables = {
  filter?: ModelSubscriptionContactInformationFilterInput | null,
};

export type OnDeleteContactInformationSubscription = {
  onDeleteContactInformation?:  {
    __typename: "ContactInformation",
    createdAt: string,
    email?: string | null,
    id: string,
    name?: string | null,
    phone?: string | null,
    references?:  {
      __typename: "ModelReferenceConnection",
      nextToken?: string | null,
    } | null,
    resume?: string | null,
    resumes?:  {
      __typename: "ModelResumeConnection",
      nextToken?: string | null,
    } | null,
    updatedAt: string,
  } | null,
};

export type OnDeleteDegreeSubscriptionVariables = {
  filter?: ModelSubscriptionDegreeFilterInput | null,
};

export type OnDeleteDegreeSubscription = {
  onDeleteDegree?:  {
    __typename: "Degree",
    createdAt: string,
    endYear?: string | null,
    id: string,
    major?: string | null,
    school?:  {
      __typename: "School",
      createdAt: string,
      educationId?: string | null,
      id: string,
      name?: string | null,
      updatedAt: string,
    } | null,
    schoolId?: string | null,
    startYear?: string | null,
    updatedAt: string,
  } | null,
};

export type OnDeleteEducationSubscriptionVariables = {
  filter?: ModelSubscriptionEducationFilterInput | null,
};

export type OnDeleteEducationSubscription = {
  onDeleteEducation?:  {
    __typename: "Education",
    createdAt: string,
    id: string,
    resume?: string | null,
    resumes?:  {
      __typename: "ModelResumeConnection",
      nextToken?: string | null,
    } | null,
    schools?:  {
      __typename: "ModelSchoolConnection",
      nextToken?: string | null,
    } | null,
    summary?: string | null,
    updatedAt: string,
  } | null,
};

export type OnDeleteExperienceSubscriptionVariables = {
  filter?: ModelSubscriptionExperienceFilterInput | null,
};

export type OnDeleteExperienceSubscription = {
  onDeleteExperience?:  {
    __typename: "Experience",
    createdAt: string,
    id: string,
    positions?:  {
      __typename: "ModelPositionConnection",
      nextToken?: string | null,
    } | null,
    resumes?:  {
      __typename: "ModelResumeConnection",
      nextToken?: string | null,
    } | null,
    updatedAt: string,
  } | null,
};

export type OnDeletePositionSubscriptionVariables = {
  filter?: ModelSubscriptionPositionFilterInput | null,
};

export type OnDeletePositionSubscription = {
  onDeletePosition?:  {
    __typename: "Position",
    company?: string | null,
    createdAt: string,
    endDate?: string | null,
    experience?:  {
      __typename: "Experience",
      createdAt: string,
      id: string,
      updatedAt: string,
    } | null,
    experienceId?: string | null,
    id: string,
    startDate?: string | null,
    title?: string | null,
    updatedAt: string,
  } | null,
};

export type OnDeleteReferenceSubscriptionVariables = {
  filter?: ModelSubscriptionReferenceFilterInput | null,
};

export type OnDeleteReferenceSubscription = {
  onDeleteReference?:  {
    __typename: "Reference",
    contactInformation?:  {
      __typename: "ContactInformation",
      createdAt: string,
      email?: string | null,
      id: string,
      name?: string | null,
      phone?: string | null,
      resume?: string | null,
      updatedAt: string,
    } | null,
    contactInformationId?: string | null,
    createdAt: string,
    email?: string | null,
    id: string,
    name?: string | null,
    phone?: string | null,
    updatedAt: string,
  } | null,
};

export type OnDeleteResumeSubscriptionVariables = {
  filter?: ModelSubscriptionResumeFilterInput | null,
};

export type OnDeleteResumeSubscription = {
  onDeleteResume?:  {
    __typename: "Resume",
    contactInformation?:  {
      __typename: "ContactInformation",
      createdAt: string,
      email?: string | null,
      id: string,
      name?: string | null,
      phone?: string | null,
      resume?: string | null,
      updatedAt: string,
    } | null,
    contactInformationId?: string | null,
    createdAt: string,
    education?:  {
      __typename: "Education",
      createdAt: string,
      id: string,
      resume?: string | null,
      summary?: string | null,
      updatedAt: string,
    } | null,
    educationId?: string | null,
    experience?:  {
      __typename: "Experience",
      createdAt: string,
      id: string,
      updatedAt: string,
    } | null,
    experienceId?: string | null,
    id: string,
    skills?:  {
      __typename: "ModelSkillConnection",
      nextToken?: string | null,
    } | null,
    summary?:  {
      __typename: "Summary",
      createdAt: string,
      goals?: string | null,
      gptResponse?: string | null,
      headshot?: string | null,
      id: string,
      persona?: string | null,
      resume?: string | null,
      updatedAt: string,
      url?: string | null,
    } | null,
    summaryId?: string | null,
    title?: string | null,
    updatedAt: string,
  } | null,
};

export type OnDeleteSchoolSubscriptionVariables = {
  filter?: ModelSubscriptionSchoolFilterInput | null,
};

export type OnDeleteSchoolSubscription = {
  onDeleteSchool?:  {
    __typename: "School",
    createdAt: string,
    degrees?:  {
      __typename: "ModelDegreeConnection",
      nextToken?: string | null,
    } | null,
    education?:  {
      __typename: "Education",
      createdAt: string,
      id: string,
      resume?: string | null,
      summary?: string | null,
      updatedAt: string,
    } | null,
    educationId?: string | null,
    id: string,
    name?: string | null,
    updatedAt: string,
  } | null,
};

export type OnDeleteSkillSubscriptionVariables = {
  filter?: ModelSubscriptionSkillFilterInput | null,
};

export type OnDeleteSkillSubscription = {
  onDeleteSkill?:  {
    __typename: "Skill",
    createdAt: string,
    id: string,
    link?: string | null,
    resume?:  {
      __typename: "Resume",
      contactInformationId?: string | null,
      createdAt: string,
      educationId?: string | null,
      experienceId?: string | null,
      id: string,
      summaryId?: string | null,
      title?: string | null,
      updatedAt: string,
    } | null,
    resumeId?: string | null,
    title?: string | null,
    updatedAt: string,
  } | null,
};

export type OnDeleteSummarySubscriptionVariables = {
  filter?: ModelSubscriptionSummaryFilterInput | null,
};

export type OnDeleteSummarySubscription = {
  onDeleteSummary?:  {
    __typename: "Summary",
    createdAt: string,
    goals?: string | null,
    gptResponse?: string | null,
    headshot?: string | null,
    id: string,
    persona?: string | null,
    resume?: string | null,
    resumes?:  {
      __typename: "ModelResumeConnection",
      nextToken?: string | null,
    } | null,
    updatedAt: string,
    url?: string | null,
  } | null,
};

export type OnDeleteTodoSubscriptionVariables = {
  filter?: ModelSubscriptionTodoFilterInput | null,
};

export type OnDeleteTodoSubscription = {
  onDeleteTodo?:  {
    __typename: "Todo",
    content?: string | null,
    createdAt: string,
    id: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateContactInformationSubscriptionVariables = {
  filter?: ModelSubscriptionContactInformationFilterInput | null,
};

export type OnUpdateContactInformationSubscription = {
  onUpdateContactInformation?:  {
    __typename: "ContactInformation",
    createdAt: string,
    email?: string | null,
    id: string,
    name?: string | null,
    phone?: string | null,
    references?:  {
      __typename: "ModelReferenceConnection",
      nextToken?: string | null,
    } | null,
    resume?: string | null,
    resumes?:  {
      __typename: "ModelResumeConnection",
      nextToken?: string | null,
    } | null,
    updatedAt: string,
  } | null,
};

export type OnUpdateDegreeSubscriptionVariables = {
  filter?: ModelSubscriptionDegreeFilterInput | null,
};

export type OnUpdateDegreeSubscription = {
  onUpdateDegree?:  {
    __typename: "Degree",
    createdAt: string,
    endYear?: string | null,
    id: string,
    major?: string | null,
    school?:  {
      __typename: "School",
      createdAt: string,
      educationId?: string | null,
      id: string,
      name?: string | null,
      updatedAt: string,
    } | null,
    schoolId?: string | null,
    startYear?: string | null,
    updatedAt: string,
  } | null,
};

export type OnUpdateEducationSubscriptionVariables = {
  filter?: ModelSubscriptionEducationFilterInput | null,
};

export type OnUpdateEducationSubscription = {
  onUpdateEducation?:  {
    __typename: "Education",
    createdAt: string,
    id: string,
    resume?: string | null,
    resumes?:  {
      __typename: "ModelResumeConnection",
      nextToken?: string | null,
    } | null,
    schools?:  {
      __typename: "ModelSchoolConnection",
      nextToken?: string | null,
    } | null,
    summary?: string | null,
    updatedAt: string,
  } | null,
};

export type OnUpdateExperienceSubscriptionVariables = {
  filter?: ModelSubscriptionExperienceFilterInput | null,
};

export type OnUpdateExperienceSubscription = {
  onUpdateExperience?:  {
    __typename: "Experience",
    createdAt: string,
    id: string,
    positions?:  {
      __typename: "ModelPositionConnection",
      nextToken?: string | null,
    } | null,
    resumes?:  {
      __typename: "ModelResumeConnection",
      nextToken?: string | null,
    } | null,
    updatedAt: string,
  } | null,
};

export type OnUpdatePositionSubscriptionVariables = {
  filter?: ModelSubscriptionPositionFilterInput | null,
};

export type OnUpdatePositionSubscription = {
  onUpdatePosition?:  {
    __typename: "Position",
    company?: string | null,
    createdAt: string,
    endDate?: string | null,
    experience?:  {
      __typename: "Experience",
      createdAt: string,
      id: string,
      updatedAt: string,
    } | null,
    experienceId?: string | null,
    id: string,
    startDate?: string | null,
    title?: string | null,
    updatedAt: string,
  } | null,
};

export type OnUpdateReferenceSubscriptionVariables = {
  filter?: ModelSubscriptionReferenceFilterInput | null,
};

export type OnUpdateReferenceSubscription = {
  onUpdateReference?:  {
    __typename: "Reference",
    contactInformation?:  {
      __typename: "ContactInformation",
      createdAt: string,
      email?: string | null,
      id: string,
      name?: string | null,
      phone?: string | null,
      resume?: string | null,
      updatedAt: string,
    } | null,
    contactInformationId?: string | null,
    createdAt: string,
    email?: string | null,
    id: string,
    name?: string | null,
    phone?: string | null,
    updatedAt: string,
  } | null,
};

export type OnUpdateResumeSubscriptionVariables = {
  filter?: ModelSubscriptionResumeFilterInput | null,
};

export type OnUpdateResumeSubscription = {
  onUpdateResume?:  {
    __typename: "Resume",
    contactInformation?:  {
      __typename: "ContactInformation",
      createdAt: string,
      email?: string | null,
      id: string,
      name?: string | null,
      phone?: string | null,
      resume?: string | null,
      updatedAt: string,
    } | null,
    contactInformationId?: string | null,
    createdAt: string,
    education?:  {
      __typename: "Education",
      createdAt: string,
      id: string,
      resume?: string | null,
      summary?: string | null,
      updatedAt: string,
    } | null,
    educationId?: string | null,
    experience?:  {
      __typename: "Experience",
      createdAt: string,
      id: string,
      updatedAt: string,
    } | null,
    experienceId?: string | null,
    id: string,
    skills?:  {
      __typename: "ModelSkillConnection",
      nextToken?: string | null,
    } | null,
    summary?:  {
      __typename: "Summary",
      createdAt: string,
      goals?: string | null,
      gptResponse?: string | null,
      headshot?: string | null,
      id: string,
      persona?: string | null,
      resume?: string | null,
      updatedAt: string,
      url?: string | null,
    } | null,
    summaryId?: string | null,
    title?: string | null,
    updatedAt: string,
  } | null,
};

export type OnUpdateSchoolSubscriptionVariables = {
  filter?: ModelSubscriptionSchoolFilterInput | null,
};

export type OnUpdateSchoolSubscription = {
  onUpdateSchool?:  {
    __typename: "School",
    createdAt: string,
    degrees?:  {
      __typename: "ModelDegreeConnection",
      nextToken?: string | null,
    } | null,
    education?:  {
      __typename: "Education",
      createdAt: string,
      id: string,
      resume?: string | null,
      summary?: string | null,
      updatedAt: string,
    } | null,
    educationId?: string | null,
    id: string,
    name?: string | null,
    updatedAt: string,
  } | null,
};

export type OnUpdateSkillSubscriptionVariables = {
  filter?: ModelSubscriptionSkillFilterInput | null,
};

export type OnUpdateSkillSubscription = {
  onUpdateSkill?:  {
    __typename: "Skill",
    createdAt: string,
    id: string,
    link?: string | null,
    resume?:  {
      __typename: "Resume",
      contactInformationId?: string | null,
      createdAt: string,
      educationId?: string | null,
      experienceId?: string | null,
      id: string,
      summaryId?: string | null,
      title?: string | null,
      updatedAt: string,
    } | null,
    resumeId?: string | null,
    title?: string | null,
    updatedAt: string,
  } | null,
};

export type OnUpdateSummarySubscriptionVariables = {
  filter?: ModelSubscriptionSummaryFilterInput | null,
};

export type OnUpdateSummarySubscription = {
  onUpdateSummary?:  {
    __typename: "Summary",
    createdAt: string,
    goals?: string | null,
    gptResponse?: string | null,
    headshot?: string | null,
    id: string,
    persona?: string | null,
    resume?: string | null,
    resumes?:  {
      __typename: "ModelResumeConnection",
      nextToken?: string | null,
    } | null,
    updatedAt: string,
    url?: string | null,
  } | null,
};

export type OnUpdateTodoSubscriptionVariables = {
  filter?: ModelSubscriptionTodoFilterInput | null,
};

export type OnUpdateTodoSubscription = {
  onUpdateTodo?:  {
    __typename: "Todo",
    content?: string | null,
    createdAt: string,
    id: string,
    updatedAt: string,
  } | null,
};
