export interface IPendingUser {
  id?:number;
  email: string;
  password?: string;
  role: string;
  emp_firstname: string;
  emp_lastname: string;
  emp_number: string;
  emp_dept: string;
  emp_position: string;
}
