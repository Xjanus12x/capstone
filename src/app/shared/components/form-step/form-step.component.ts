import { AfterViewInit, Component, Input } from '@angular/core';
import {
  FormBuilder,
  Validators,
  FormControl,
  FormGroup,
  FormArray,
} from '@angular/forms';


@Component({
  selector: 'app-form-step',
  templateUrl: './form-step.component.html',
  styleUrls: ['./form-step.component.css'],
})
export class FormStepComponent {
  igfFormGroup: FormGroup;

  @Input() _placeholder: string = '';
  @Input() labels: string[] = [];
  @Input() index: number = 0;

  constructor(private fb: FormBuilder, ) {
    this.igfFormGroup = this.fb.group({});
    this.arr = this.fb.array([]);
  }

  onSubmit() {
    // Access the form data when needed
    // console.log(this.dynamicFormGroup.get('t'));
    // console.log('haha', this.fields);
    // console.log('arr', this.arr.controls[0]);
    console.log(this.igfFormGroup.controls);
    
  }

  isLinear = false;

  fields: any[] = [];
  dynamicFormGroup!: FormGroup;

  @Input() model!: {};
  @Input() numberOfInputs!: number;

  ngAfterViewInit() {
    // this.buildForm();

    this.labels.forEach((label) => {
      this.igfFormGroup.addControl(
        'kpiCtrl' + label,
        new FormControl('', Validators.required)
      );
      this.igfFormGroup.addControl(
        'weightCtrl' + label,
        new FormControl('', Validators.required)
      );
      this.igfFormGroup.addControl(
        'individualGoalCommitmentCtrl' + label,
        new FormControl('', Validators.required)
      );
      this.igfFormGroup.addControl(
        'accomplishmentCtrl' + label,
        new FormControl('', Validators.required)
      );
      this.igfFormGroup.addControl(
        'equivalentRatingCtrl' + label,
        new FormControl('', Validators.required)
      );
    });
    // this.fields = Object.keys(this.igfFormGroup.controls)
  }


  // buildForm() {
  //   // const formGroupFields = this.getFormControlsFields();
  //   // console.log('wawa', formGroupFields);

  //   // this.dynamicFormGroup = this.fb.array([])
  //   this.dynamicFormGroup = this.fb.group({
  //     t: this.fb.array([
  //       {
  //         kpi: this.fb.control(['', []]),
  //         kp2: this.fb.control(['', []]),
  //         kp3: this.fb.control(['', []]),
  //       },
  //     ]),
  //   });
  // }
  arr: FormArray;
  getFormControlsFields() {
    // const formGroupFields: Record<string, FormControl> = {};
    // for (let index = 1; index <= this.numberOfInputs; index++) {
    //   for (const field of Object.keys(this.model)) {
    //     formGroupFields[field] = new FormControl('');
    //   }
    //   const keyValuePair: any = {};
    //   for (const key of Object.keys(formGroupFields)) {
    //     keyValuePair[key] = key;
    //   }
    //   this.fields.push(keyValuePair);
    //   const newFormGroup = this.fb.group(formGroupFields);
    //   this.arr.push(newFormGroup);
    // }
    // return formGroupFields;
  }

  // this.labels.forEach((label) => {
  //   this.igfFormGroup.addControl(
  //     'kpiCtrl' + label,
  //     this.fb.control(['initialValue', Validators.required])
  //   );
  //   this.igfFormGroup.addControl(
  //     'weightCtrl' + label,
  //     this.fb.control(['initialValue', Validators.required])
  //   );
  //   this.igfFormGroup.addControl(
  //     'individualGoalCommitmentCtrl' + label,
  //     this.fb.control(['initialValue', Validators.required])
  //   );
  //   this.igfFormGroup.addControl(
  //     'accomplishmentCtrl' + label,
  //     this.fb.control(['initialValue', Validators.required])
  //   );
  //   this.igfFormGroup.addControl(
  //     'equivalentRatingCtrl' + label,
  //     this.fb.control(['initialValue', Validators.required])
  //   );
  // });
}
