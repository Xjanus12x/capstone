import { IFormData } from 'src/app/core/models/FormData';

export const formData: IFormData = {
  partOneForm: {
    stepLabel: [
      'Student Services',
      'Community',
      'Workforce Leadership',
      'Quality Assurance',
      'Research',
    ],
    formArrayNames: [
      'studentServicesFormArray',
      'communityFormArray',
      'workForceLeadershipFormArray',
      'qualityAssuranceFormArray',
      'researchFormArray',
    ],
    groupCounts: [2, 2, 1, 3, 1],
    controlNames: [
      'commitment',
      'weight',
      'individualGoalCommitment',
      'accomplishment',
      'rating',
    ],
    tableHeaders: [
      'Personal Objective',
      'Personal Measures (KPI)',
      'Target',
      'Initiatives',
      'Weight',
      'Achieved',
      'Equivalent Rating (1-4)',
    ],
    tableRows: ['Key Performance Indicators (KPIs)', '', '', ''],
  },
  partTwoForm: {
    stepLabel: [
      'Top Three Least Accomplished Goal Commitments',
      'Top Three Highly Accomplished Goal Commitments',
      'Top Three Competency Strengths',
      'Top Three Competencies That Need Improvement',
      'Top Three Training And Development Suggestions Based On Previous Items',
    ],
  },
};
