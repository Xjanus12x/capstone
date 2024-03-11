export interface IIGCFSubmission {
  fullname: string;
  emp_number: string;
  emp_position: string;
  emp_dept: string;
  completion_date: string;
  formData: FormDataEntry[];
}

interface FormDataEntry {
  selected_kpi: string;
  personalObject: string;
  personalMeasures: string;
  initiatives: string;
  weight: number;
}
