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
import { ActivatedRoute } from '@angular/router';

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
  currentUserId: string = '';
  rateDate: null | string = '';
  selectedActionPlans: string[] = [];
  constructor(
    private fb: FormBuilder,
    private formContentService: FormContentService,
    private routerService: RouterService,
    private backendService: BackendService,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.userRole = this.authService.getUserInformationFirebase().role;
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
    this.activatedRoute.paramMap.subscribe((params) => {
      this.currentUserId = params.get('id')!;
    });
    this.rateDate = this.activatedRoute.snapshot.queryParamMap.get('rateDate');
              // submittedIGCF.igc_inputs.forEach((data: any) => {
              //   this.selectedActionPlans.push(data.personalObject);
              //   console.log(data.personalObject);
              // });

    
  }
  ngAfterViewInit() {
    if (
      this.routerService.isRouteActive('submitted-form/:id') &&
      this.rateDate
    ) {
      this.backendService.getSubmittedIGCFByID(this.currentUserId).subscribe({
        next: (submittedIGCF: any) => {
          const {
            top_three_competencies_improvement,
            top_three_competency_strengths,
            top_three_highly_agc,
            top_three_least_agc,
            top_three_training_development_suggestion,
          } = submittedIGCF;
          const partTwoIgcfValues: string[][] = [
            top_three_least_agc,
            top_three_highly_agc,
            top_three_competency_strengths,
            top_three_competencies_improvement,
            top_three_training_development_suggestion,
          ];
          this.formArrayNames.forEach((name, index) => {
            this.formGroup.get(name)?.setValue(partTwoIgcfValues[index]);
            this.formGroup.get(name)?.disable();
          });
        },
      });
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

  getValues(): any {
    return {
      top_three_least_agc: this.getFormArrayValues('step1'),
      top_three_highly_agc: this.getFormArrayValues('step2'),
      top_three_competencies_improvement: this.getFormArrayValues('step3'),
      top_three_competency_strengths: this.getFormArrayValues('step4'),
      top_three_training_development_suggestion:
        this.getFormArrayValues('step5'),
    };
  }

  getFormArrayValues(formArrayName: string) {
    return (this.formGroup.get(formArrayName) as FormArray).value;
  }
  validateFormGroup() {
    if (this.formGroup.invalid) {
      this.authService.openSnackBar(
        'Please fill out all required fields correctly in Part 2.',
        'close',
        'bottom'
      );
      return false;
    }
    return this.formGroup.valid;
  }
}
