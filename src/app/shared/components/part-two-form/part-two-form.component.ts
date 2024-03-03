import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { FormContentService } from '../../services/form-content.service';
import { RouterService } from 'src/app/modules/services/router-service.service';
import { BackendService } from 'src/app/core/services/backend.service';
import { tap } from 'rxjs';
import { ISubmittedIGCF } from 'src/app/core/models/SubmittedIgcf';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-part-two-form',
  templateUrl: './part-two-form.component.html',
  styleUrls: ['./part-two-form.component.css'],
})
export class PartTwoFormComponent implements OnInit, AfterViewInit {
  formGroup!: FormGroup;
  formGroupLength!: number;
  formArrayNames!: string[];
  formControls!: AbstractControl[];
  isFormValid: boolean = false;
  userRole: string = '';
  @Input() stepLabel!: string[];
  constructor(
    private fb: FormBuilder,
    private formContentService: FormContentService,
    private routerService: RouterService,
    private backendService: BackendService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.getUserRole().subscribe({
      next: (role) => {
        this.userRole = role;
      },
    });
    this.formGroup = this.fb.group({
      step1: this.formContentService.createFormArray(3),
      step2: this.formContentService.createFormArray(3),
      step3: this.formContentService.createFormArray(3),
      step4: this.formContentService.createFormArray(3),
      step5: this.formContentService.createFormArray(3),
    });

    this.formGroupLength = this.formContentService.getFormGroupLength(
      this.formGroup
    );
    this.formArrayNames = this.formContentService.getFormArrayNames(
      this.formGroup
    );
  }
  ngAfterViewInit() {
    if (this.routerService.isRouteActive('submitted-form/:id/:isSigned')) {
      this.backendService
        .getAllSubmittedIgcfInEverydept()
        .pipe(
          tap((igcfs: ISubmittedIGCF[]) => {
            const filteredIgcf = igcfs.find(
              (igcf) => igcf.id === this.backendService.getCurrentIgcfId()
            );
            if (filteredIgcf) {
              const {
                top_three_least_agc,
                top_three_highly_agc,
                top_three_competencies_improvement,
                top_three_competency_strenghts,
                top_three_training_development_suggestions,
              } = filteredIgcf;
              const values = [
                top_three_least_agc.split(','),
                top_three_highly_agc.split(','),
                top_three_competencies_improvement.split(','),
                top_three_competency_strenghts.split(','),
                top_three_training_development_suggestions.split(','),
              ];
              this.formArrayNames.forEach((name, index) => {
                this.formGroup.get(name)?.setValue(values[index]);
              });
              // When we disable all inputs in a formgroup it returns false from .valid property so
              // Were getting the value if form is valid before we disable it so that
              // in igcf-form component in canExit method we can use it to verify that form is valid so that
              // dialog box won't show when we try to exit even if all inputs are filled
              this.isFormValid = this.formGroup.valid;
              if (this.userRole === 'Admin')
                this.formContentService.disableFormGroup(this.formGroup);
            }
          })
        )
        .subscribe();
    }
  }
  getFormControls(
    formGroup: FormGroup,
    formArrayName: string
  ): AbstractControl[] {
    return (formGroup.get(formArrayName) as FormArray).controls;
  }
  getFormControl(
    formGroup: FormGroup,
    controlName: string,
    controlIndex: number
  ): AbstractControl {
    return (formGroup.get(controlName) as FormArray).controls[controlIndex];
  }
  getStepControl(formArrayName: string): AbstractControl {
    const control = this.formGroup.get(formArrayName);
    return control || new FormControl(null);
  }
  isControlDisabled(formGroup: FormGroup, controlName: string): boolean {
    return this.formContentService.isControlDisabled(formGroup, controlName);
  }
}
