interface INumberOfSubbmittedIgcf {
  success: boolean;
  submissionsPerDept: { emp_dept: string; total_submissions: number }[];
}
