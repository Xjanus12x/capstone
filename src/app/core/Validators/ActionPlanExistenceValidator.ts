import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { BackendService } from '../services/backend.service';
export function actionPlanExistenceValidator(
  backendService: BackendService
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const inputValue = control.value.trim().toLowerCase();
    const data = backendService.getAllObjectiveAndActionPlansByDept();
    const exists = data.some(
      (item) => item.plan.trim().toLowerCase() === inputValue
    );
    // Perform validation based on the result of getAllObjectiveAndActionPlansByDept()
    return exists ? { actionPlanAlreadyExists: true } : null;
  };
}
