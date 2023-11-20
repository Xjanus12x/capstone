import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormControl,
  FormGroup,
  FormArray,
  AbstractControl,
} from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { NgFor, AsyncPipe } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormStepService } from 'src/app/shared/services/form-step.service';
import {
  NgSignaturePadOptions,
  SignaturePadComponent,
} from '@almothafar/angular-signature-pad';

@Component({
  selector: 'app-igcf-form',
  templateUrl: './igcf-form.component.html',
  styleUrls: ['./igcf-form.component.css'],
})
export class IgcfFormComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private formStepService: FormStepService
  ) {}

  isLinear = false;
  myControl = new FormControl('');
  options: string[] = ['One', 'Two', 'Three'];
  filteredOptions!: Observable<string[]>;
  formContent: any[] = [];

  ngOnInit() {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }
  SOCFormGroup = this.fb.group({});
  studentServicesFormGroup: FormGroup = this.fb.group({
    kpi1: ['', [Validators.required, Validators.minLength(5)]],
    kpi2: ['', [Validators.required, Validators.minLength(5)]],
    weight1: ['', [Validators.required, Validators.minLength(5)]],
    weight2: ['', [Validators.required, Validators.minLength(5)]],
    individualGoalCommitment1: [
      '',
      [Validators.required, Validators.minLength(5)],
    ],
    individualGoalCommitment2: [
      '',
      [Validators.required, Validators.minLength(5)],
    ],
    accomplishment1: ['', [Validators.required, Validators.minLength(5)]],
    accomplishment2: ['', [Validators.required, Validators.minLength(5)]],
    rating1: ['', [Validators.required, Validators.minLength(5)]],
    rating2: ['', [Validators.required, Validators.minLength(5)]],
  });
  communityFormGroup = this.fb.group({
    kpi1: ['', [Validators.required, Validators.minLength(5)]],
    kpi2: ['', [Validators.required, Validators.minLength(5)]],
    weight1: ['', [Validators.required, Validators.minLength(5)]],
    weight2: ['', [Validators.required, Validators.minLength(5)]],
    individualGoalCommitment1: [
      '',
      [Validators.required, Validators.minLength(5)],
    ],
    individualGoalCommitment2: [
      '',
      [Validators.required, Validators.minLength(5)],
    ],
    accomplishment1: ['', [Validators.required, Validators.minLength(5)]],
    accomplishment2: ['', [Validators.required, Validators.minLength(5)]],
    rating1: ['', [Validators.required, Validators.minLength(5)]],
    rating2: ['', [Validators.required, Validators.minLength(5)]],
  });

  workForceLeadershipFormGroup = this.fb.group({
    kpi1: ['', [Validators.required, Validators.minLength(5)]],
    weight1: ['', [Validators.required, Validators.minLength(5)]],
    individualGoalCommitment1: [
      '',
      [Validators.required, Validators.minLength(5)],
    ],
    individualGoalCommitment2: [
      '',
      [Validators.required, Validators.minLength(5)],
    ],
    accomplishment1: ['', [Validators.required, Validators.minLength(5)]],
    rating1: ['', [Validators.required, Validators.minLength(5)]],
  });
  qualityAssuranceFormGroup = this.fb.group({
    kpi1: ['', [Validators.required, Validators.minLength(5)]],
    kpi2: ['', [Validators.required, Validators.minLength(5)]],
    kpi3: ['', [Validators.required, Validators.minLength(5)]],
    weight1: ['', [Validators.required, Validators.minLength(5)]],
    weight2: ['', [Validators.required, Validators.minLength(5)]],
    weight3: ['', [Validators.required, Validators.minLength(5)]],
    individualGoalCommitment1: [
      '',
      [Validators.required, Validators.minLength(5)],
    ],
    individualGoalCommitment2: [
      '',
      [Validators.required, Validators.minLength(5)],
    ],
    individualGoalCommitment3: [
      '',
      [Validators.required, Validators.minLength(5)],
    ],
    accomplishment1: ['', [Validators.required, Validators.minLength(5)]],
    accomplishment2: ['', [Validators.required, Validators.minLength(5)]],
    accomplishment3: ['', [Validators.required, Validators.minLength(5)]],
    rating1: ['', [Validators.required, Validators.minLength(5)]],
    rating2: ['', [Validators.required, Validators.minLength(5)]],
    rating3: ['', [Validators.required, Validators.minLength(5)]],
  });

  researchFormGroup = this.fb.group({
    kpi1: ['', [Validators.required, Validators.minLength(5)]],
    weight1: ['', [Validators.required, Validators.minLength(5)]],
    individualGoalCommitment1: [
      '',
      [Validators.required, Validators.minLength(5)],
    ],
    individualGoalCommitment2: [
      '',
      [Validators.required, Validators.minLength(5)],
    ],
    accomplishment1: ['', [Validators.required, Validators.minLength(5)]],
    rating1: ['', [Validators.required, Validators.minLength(5)]],
  });

  doneFormGroup = this.fb.group({
    topThreeLeastAccomplishedGoalCommitments: this.fb.array([
      this.fb.control('', [Validators.required]),
      this.fb.control('', [Validators.required]),
      this.fb.control('', [Validators.required]),
    ]),
    topThreeHighlyAccomplishedGoalCommitments: this.fb.array([
      this.fb.control('', [Validators.required]),
      this.fb.control('', [Validators.required]),
      this.fb.control('', [Validators.required]),
    ]),

    topThreeCompetenciesThatNeedImprovement: this.fb.array([
      this.fb.control('', [Validators.required]),
      this.fb.control('', [Validators.required]),
      this.fb.control('', [Validators.required]),
    ]),
    topThreeCompetencyStrengths: this.fb.array([
      this.fb.control('', [Validators.required]),
      this.fb.control('', [Validators.required]),
      this.fb.control('', [Validators.required]),
    ]),
    topThreeTrainingAndDevelopmentSuggestionsBasedOnPreviousItems:
      this.fb.array([
        this.fb.control('', [Validators.required]),
        this.fb.control('', [Validators.required]),
        this.fb.control('', [Validators.required]),
      ]),
  });

  getFormControls(controlName: string): AbstractControl[] {
    return (this.doneFormGroup.get(controlName) as FormArray).controls;
  }

  printFormValues(t: string) {
    // Alternatively, if you want specific values from the FormArray
    console.log(this.doneFormGroup.get(t)?.value);
  }
  // model: {} = {
  //   kpi: '',
  //   weight: '',
  //   igc: '',
  //   accomplishment: '',
  //   rating: '',
  // };

  @ViewChild('signature')
  public signaturePad!: SignaturePadComponent;

  signaturePadOptions: NgSignaturePadOptions = {
    // passed through to szimek/signature_pad constructor
    minWidth: 1,
    canvasWidth: 500,
    canvasHeight: 100,
    dotSize: 1,
    maxWidth: 1,
  };

  // ngAfterViewInit() {
  //   // this.signaturePad is now available
  //   this.signaturePad.set('minWidth', 5); // set szimek/signature_pad options at runtime
  //   this.signaturePad.clear(); // invoke functions from szimek/signature_pad API
  // }

  drawComplete(event: MouseEvent | Touch) {
    // will be notified of szimek/signature_pad's onEnd event
    console.log('Completed drawing', event);
    console.log(this.signaturePad.toDataURL());
  }

  drawStart(event: MouseEvent | Touch) {
    // will be notified of szimek/signature_pad's onBegin event
    console.log('Start drawing', event);
  }
  clear() {
    this.signaturePad.clear();
  }
  redo() {}
}
