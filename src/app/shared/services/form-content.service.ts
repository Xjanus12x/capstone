import { Injectable } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { RouterService } from 'src/app/modules/services/router-service.service';
import { ratingRangeValidator } from '../../core/Validators/ratingValidator';

@Injectable({
  providedIn: 'root',
})
export class FormContentService {
  constructor(private fb: FormBuilder, private routerService: RouterService) {}

  igcfContent: any = {};
  igcfInformation: any = {};

  setIgcfContent(content: any) {
    this.igcfContent = content;
  }
  setIgcfInformation(information: any) {
    this.igcfInformation = information;
  }

  getIgcfContent() {
    return this.igcfContent;
  }
  getIgcfInformation() {
    return this.igcfInformation;
  }

  getFormControls(
    formGroup: FormGroup,
    formArrayName: string
  ): AbstractControl[] {
    return (formGroup.get(formArrayName) as FormArray).controls;
  }
  generateDynamicFormGroup(
    formGroupNames: string[],
    groupCounts: number[],
    controlNames: string[],
    currentUserRole: string
  ): FormGroup {
    const formGroups: { [key: string]: AbstractControl } = {};
    for (let i = 0; i < formGroupNames.length; i++) {
      const formGroupName = formGroupNames[i];
      const groupCount = groupCounts[i];

      const formArray: FormArray = this.fb.array([]);

      for (let j = 0; j < groupCount; j++) {
        formArray.push(this.generateFormGroup(controlNames, currentUserRole));
      }
      formGroups[formGroupName] = formArray;
    }

    return this.fb.group(formGroups);
  }

  generateFormGroup(controlNames: string[], role: string): FormGroup {
    const group: { [key: string]: any } = {};
    controlNames.forEach((name, index) => {
      const validators: Validators[] =
        index === 0
          ? [Validators.required, Validators.minLength(5)]
          : [Validators.required];
      if (index === controlNames.length - 1) {
        validators.push(ratingRangeValidator());
      }
      const isRating = name === 'rating';

      if (role === 'Admin' && !isRating)
        group[name] = [{ value: '', disabled: true }, validators];
      else if (isRating && role !== 'Admin')
        group[name] = [{ value: '', disabled: true }, validators];
      else group[name] = [{ value: '', disabled: false }, validators];
    });
    return this.fb.group(group);
  }

  getFormArrayNames(formGroup: FormGroup): string[] {
    return Object.keys(formGroup.controls);
  }
  getStepControl(formArrayName: string, formGroup: FormGroup): AbstractControl {
    const control = formGroup.get(formArrayName);
    return control || new FormControl(null);
  }

  getFormControl(
    formGroup: FormGroup,
    controlName: string,
    controlIndex: number
  ): AbstractControl {
    return (formGroup.get(controlName) as FormArray).controls[controlIndex];
  }

  getFormGroupLength(formGroup: FormGroup): number {
    return Object.keys(formGroup.value).length - 1;
  }

  createFormArray(count: number): FormArray {
    const formArray = this.fb.array([]);
    for (let i = 0; i < count; i++) {
      // Determine if the input should be disabled based on the user role
      // const isDisabled = false

      // Create the form control and set its initial value and disabled state
      const control = this.fb.control('', [
        Validators.required,
        Validators.minLength(5),
      ]);

      formArray.push(control);
    }
    return formArray;
  }
  isControlDisabled(formGroup: FormGroup, controlName: string): boolean {
    return formGroup.get(controlName)?.disabled ?? false;
  }

  mapSelectedPercentages(
    selectedWeightPercentages: string[],
    selectedIgcPercentages: string[],
    selectedCommitmentPercentages: string[]
  ): string[][] {
    return selectedWeightPercentages.map((weight: string, index: number) => [
      'Key Performance Indicators (KPIs)',
      weight,
      selectedIgcPercentages[index],
      selectedCommitmentPercentages[index],
    ]);
  }

  disableFormGroup(formGroup: FormGroup) {
    // Iterate over each control and disable it
    Object.keys(formGroup.controls).forEach((controlName) => {
      const control = formGroup.get(controlName);
      if (control) {
        control.disable(); // Disable the control
      }
    });
  }
  stepLabels: string[] = [];
  setStepLabels(labels: string[]) {
    this.stepLabels = labels;
  }
  getStepLabels(): string[] {
    return this.stepLabels;
  }



  
}
