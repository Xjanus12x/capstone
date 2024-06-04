import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function validateHauEmployee(hauEmployeeDetails: any[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    console.log(hauEmployeeDetails);

    // Convert the control value to a string manually, preserving leading zeros
    let empNumber = control.value !== null ? control.value.toString() : '';

    // Ensure leading zeros are retained if the value is a number
    if (!isNaN(Number(empNumber)) && empNumber !== '') {
      const leadingZeros = '0'.repeat(
        control.value.toString().length - empNumber.length
      );
      empNumber = leadingZeros + empNumber;
    }
    console.log(empNumber);
    
    if (!empNumber) return null; // If the employee number is empty, consider it as valid

    const employeeExists = hauEmployeeDetails.some(
      (employee) => employee.emp_number === empNumber
    );
    console.log(employeeExists);

    return employeeExists ? null : { hauEmployeeNotFound: true };
  };
}
