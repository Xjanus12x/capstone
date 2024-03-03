import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  FormArray,
  AbstractControl,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { dialogBoxConfig } from 'src/app/core/constants/DialogBoxConfig';
import { FormContentConstants } from 'src/app/core/constants/FormContents';
import { formData } from 'src/app/core/constants/formData';
import { IDeactivateComponent } from 'src/app/core/models/DeactivateComponent';
import { IDialogBox } from 'src/app/core/models/DialogBox';
import { IEditFormContents } from 'src/app/core/models/EditFormContents';
import { AuthService } from 'src/app/core/services/auth.service';
import { BackendService } from 'src/app/core/services/backend.service';
import { PartOneFormComponent } from 'src/app/shared/components/part-one-form/part-one-form.component';
import { FormContentService } from 'src/app/shared/services/form-content.service';
import { DialogBoxComponent } from '../../components/dialog-box/dialog-box.component';
import { RouterService } from '../../services/router-service.service';

@Component({
  selector: 'app-set-percentages-form',
  templateUrl: './set-percentages-form.component.html',
  styleUrls: ['./set-percentages-form.component.css'],
})
export class SetPercentagesFormComponent
  implements OnInit, IDeactivateComponent
{
  public readonly WEIGHT_CONTROL = FormContentConstants.WEIGHT_CONTROL;
  public readonly COMMITMENT_CONTROL = FormContentConstants.COMMITMENT_CONTROL;
  public readonly ACCOMPLISHMENT_CONTROL =
    FormContentConstants.ACCOMPLISHMENT_CONTROL;
  public readonly TABLE_HEADERS = FormContentConstants.TABLE_HEADERS;
  public readonly CATEGORIES = FormContentConstants.CATEGORIES;
  editFormContents: IEditFormContents[] = [];

  constructor(
    private fb: FormBuilder,
    private backendService: BackendService,
    private authService: AuthService,
    public dialog: MatDialog,
    private formContentService: FormContentService,
    private routerService: RouterService
  ) {}

  setPercentagesFormGroup!: FormGroup;
  titleControl!: FormControl;

  ngOnInit(): void {
    this.titleControl = new FormControl('', {
      validators: [Validators.required],
    });

    this.setPercentagesFormGroup = this.fb.group({
      weightFormGroup: this.createFormGroup(),
      communityFormGroup: this.createFormGroup(),
      workForceLeadershipFormGroup: this.createFormGroup(),
      qualityAssuranceFormGroup: this.createFormGroup(),
      researchFormGroup: this.createFormGroup(),
    });
    this.initEditFormContents();
  }
  getFormControls(formArrayName: string) {
    return (this.setPercentagesFormGroup.get(formArrayName) as FormArray)
      .controls;
  }
  getFormGroupNames() {
    return Object.keys(this.setPercentagesFormGroup.controls);
  }
  getFormControlNames(formGroupName: string) {
    return Object.keys(
      (this.setPercentagesFormGroup.get(formGroupName) as FormGroup).controls
    );
  }

  initEditFormContents() {
    this.editFormContents = this.getFormGroupNames().map(
      (formGroupName, i) => ({
        groupName: formGroupName,
        category: this.CATEGORIES[i],
        controlNames: this.getFormControlNames(formGroupName),
        percentageType: [
          'Weight',
          'Individual Goal Commitment',
          'Accomplishment',
        ],
      })
    );
  }

  private createFormGroup(): FormGroup {
    return this.fb.group({
      studentServicesWeightPercentageControl: ['', [Validators.required]],
      individualGoalCommitmentPercentageControl: ['', [Validators.required]],
      accomplishmentPercentageControl: ['', [Validators.required]],
    });
  }

  getPercentages(percentageType: string): string[] {
    return this.getFormGroupNames().map((groupName) => {
      return this.setPercentagesFormGroup.get(groupName)?.get(percentageType)
        ?.value;
    });
  }

  getFormControl(
    groupName: string,
    controlName: string
  ): AbstractControl | null {
    const group = this.setPercentagesFormGroup.get(groupName);
    return group ? group.get(controlName) : null;
  }

  private submitNewSetOfPercentagesToBackend(dept_name: string) {
    const newIgcfPercentages = {
      dept_name: dept_name,
      title: this.titleControl.getRawValue(),
      weightPercentages: this.getPercentages(this.WEIGHT_CONTROL).join(','),
      individualGoalCommitmentPercentages: this.getPercentages(
        this.COMMITMENT_CONTROL
      ).join(','),
      accomplishmentPercentages: this.getPercentages(
        this.ACCOMPLISHMENT_CONTROL
      ).join(','),
    };
    console.log(newIgcfPercentages);

    this.backendService.addIGCFInformation(newIgcfPercentages);
    
  }

  submit() {
    if (!(this.setPercentagesFormGroup.valid && this.titleControl.valid)) {
      let errorMessage = 'Please fill all required fields:';
      if (this.titleControl.invalid) {
        errorMessage += '\n- Title is required';
      }
      if (this.setPercentagesFormGroup.invalid) {
        errorMessage += '\n- Some other field is missing or invalid';
      }
      this.authService.openSnackBar(errorMessage, 'Close', 'bottom');
      return;
    }

    this.authService.getEmployeeDepartment().subscribe({
      next: (response) => {
        this.submitNewSetOfPercentagesToBackend(response);
      },
      error: (error) => {
        console.error('Error fetching employee department:', error);
        this.authService.openSnackBar(
          'Failed to fetch employee department',
          'Close',
          'bottom'
        );
      },
    });
  }

  previewForm() {
    if (this.setPercentagesFormGroup.invalid) return;
    this.formContentService.setIgcfInformation({
      weightPercentages: this.getPercentages(this.WEIGHT_CONTROL).join(','),
      individualGoalCommitmentPercentages: this.getPercentages(
        this.COMMITMENT_CONTROL
      ).join(','),
      accomplishmentPercentages: this.getPercentages(
        this.ACCOMPLISHMENT_CONTROL
      ).join(','),
    });

    const setWeightPercentages: string[] = this.formContentService
      .getIgcfInformation()
      ['weightPercentages'].split(',');
    const setIgcPercentages: string[] = this.formContentService
      .getIgcfInformation()
      ['individualGoalCommitmentPercentages'].split(',');
    const setAccomplishmentPercentages: string[] = this.formContentService
      .getIgcfInformation()
      ['accomplishmentPercentages'].split(',');
    const percentages: string[][] =
      this.formContentService.mapSelectedPercentages(
        setWeightPercentages,
        setIgcPercentages,
        setAccomplishmentPercentages
      );

    this.formContentService.setIgcfContent({
      controlNames: formData.partOneForm.controlNames,
      headers: formData.partOneForm.tableHeaders,
      tableRows: formData.partOneForm.tableRows,
      stepLabel: formData.partOneForm.stepLabel,
      groupCounts: formData.partOneForm.groupCounts,
      formArrayNames: formData.partOneForm.formArrayNames,
      percentages: percentages,
    });
    this.dialog.open(PartOneFormComponent);
  }

  exit() {
    this.routerService.routeTo('dashboard');
  }

  isAllInputFilled(): boolean {
    return this.setPercentagesFormGroup.valid && this.titleControl.valid;
  }

  canExit(): Promise<boolean> {
    if (this.isAllInputFilled()) {
      return Promise.resolve(true); // Allow navigation
    }

    const dialogBoxData: IDialogBox = {
      title: 'Confirm Exit',
      content:
        'Are you sure you want to exit? Your set percentages will not be saved.',
      buttons: [
        {
          isVisible: true,
          matDialogCloseValue: false,
          content: 'No',
        },
        {
          isVisible: true,
          matDialogCloseValue: true,
          content: 'Yes',
        },
      ],
    };

    const dialogRef = this.dialog.open(DialogBoxComponent, {
      ...dialogBoxConfig,
      data: dialogBoxData,
    });

    return dialogRef
      .afterClosed()
      .toPromise()
      .then((result) => result || false);
  }
}
