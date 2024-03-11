import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, elementAt } from 'rxjs';
import { formData } from 'src/app/core/constants/formData';
import { IDeactivateComponent } from 'src/app/core/models/DeactivateComponent';
import { DialogBoxComponent } from '../../components/dialog-box/dialog-box.component';
import { MatDialog } from '@angular/material/dialog';
import { IDialogBox } from 'src/app/core/models/DialogBox';
import { BackendService } from 'src/app/core/services/backend.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { IIgcfPercentages } from 'src/app/core/models/IgcfPercentages';
import { RouterService } from '../../services/router-service.service';
import { PartOneFormComponent } from 'src/app/shared/components/part-one-form/part-one-form.component';
import { PartTwoFormComponent } from 'src/app/shared/components/part-two-form/part-two-form.component';
import { dialogBoxConfig } from 'src/app/core/constants/DialogBoxConfig';
import { ActivatedRoute } from '@angular/router';
import { ISignedIgcf } from 'src/app/core/models/SignedIGCF';
import { MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';
import { IEmployeeDetails } from 'src/app/core/models/EmployeeDetails';
import { DatePipe } from '@angular/common';
import { FormContentService } from 'src/app/shared/services/form-content.service';

@Component({
  selector: 'app-igcf-form',
  templateUrl: './igcf-form.component.html',
  styleUrls: ['./igcf-form.component.css'],
  providers: [DatePipe],
})
export class IgcfFormComponent implements OnInit, IDeactivateComponent {
  partOneFormArrayNames!: string[];
  controlNames!: string[];
  tableHeaders!: string[];
  tableRows!: string[];
  partOneStepLabel!: string[];
  partTwoStepLabel!: string[];
  groupCounts!: number[];
  percentages!: any[];
  unfilteredIgcfPercentages!: IIgcfPercentages[];
  percentagesCtrl = new FormControl('');
  igcfPercentages: string[][] = [];
  userRole$: Observable<string> = this.authService.getUserRole();
  currentUserRole: string = '';
  currentIgcfId!: number;
  isSigned!: boolean;
  kpiTitlesDropdown = new FormControl('', [Validators.required]);
  kpiTitleList: string[] = [];
  @ViewChild(PartOneFormComponent) partOneForm!: PartOneFormComponent;
  @ViewChild(PartTwoFormComponent) partTwoForm!: PartTwoFormComponent;
  @ViewChild('tabGroup') tabGroup!: MatTabGroup;

  formGroup: FormGroup = new FormGroup({}); // Form group to hold dynamically generated controls
  currentTab: number = 0;
  isValid: boolean = false;
  kpis: any[] = [];
  details!: any;
  constructor(
    private backendService: BackendService,
    private authService: AuthService,
    public dialog: MatDialog,
    private routerService: RouterService,
    private activatedRoute: ActivatedRoute,
    private datePipe: DatePipe,
    private formContentService: FormContentService
  ) {
    this.kpiTitlesDropdown.valueChanges.subscribe((selectedKPIs: any) => {
      // Clear existing form controls
      this.formGroup = new FormGroup({});
      // Generate form controls for each selected KPI
      if (selectedKPIs) {
        selectedKPIs.forEach((kpiTitle: string, i: number) => {
          this.formGroup.addControl(
            kpiTitle,
            new FormControl('', [
              Validators.required,
              Validators.min(1),
              Validators.max(100),
            ])
          );
        });
      }
    });
  }

  onTabChange(event: MatTabChangeEvent) {
    // Check if the user is going back to the first tab
    if (event.index === 0) {
      // Set isValid to false
      this.isValid = false;
    }
  }
  confirm() {
    const totalWeight = Object.values(this.formGroup.value).reduce(
      (acc: number, currentValue: any) => acc + (currentValue || 0),
      0
    );

    const isFormValid = this.formGroup.valid && this.kpiTitlesDropdown.valid;

    if (totalWeight !== 100 || !isFormValid) {
      this.authService.openSnackBar(
        'Total weight should be 100 and all fields must be valid.',
        'close',
        'bottom'
      );
      this.isValid = false;
      return;
    }
    if (this.currentUserRole === 'Faculty') {
      const stepLabels = Object.keys(this.formGroup.value).map((key) => {
        const weight = this.formGroup.get(key)?.value;
        return `${key} ${weight}%`;
      });
      this.formContentService.setStepLabels(stepLabels);
    }

    this.isValid = true;
  }

  // getStepLabel() {
  //   return Object.keys(this.formGroup.value).map((key) => {
  //     const weight = this.formGroup.get(key)?.value;
  //     return `${key} ${weight}%`;
  //   });
  // }

  getKpiDropdownLength(): number {
    return this.kpiTitlesDropdown?.value?.length ?? 0;
  }
  getWeightFormControl(kpiTitle: string): FormControl {
    return this.formGroup.get(kpiTitle) as FormControl;
  }

  ngOnInit() {
    this.partTwoStepLabel = formData.partTwoForm.stepLabel;
    this.backendService.getKpisAndActionPlans().subscribe({
      next: (data) => {
        this.kpiTitleList = Array.from(
          new Set(data.map((kpi: any) => kpi.kpi_title))
        );
        this.kpis = data;
      },
    });
    this.authService.getEmployeeNumber().subscribe({
      next: (empNumber: string) => {
        this.authService.getEmployeeDetails(empNumber).subscribe({
          next: (response: any) => {
            this.details = response.data;
          },
        });
      },
    });
    this.authService.getUserRole().subscribe({
      next: (role: string) => {
        this.currentUserRole = role;
      },
      error: () => {},
    });
    // this.initializeRoute();
    // this.fetchIgcfData();
    // this.loadFormData();
  }

  isAdminRating(): boolean {
    return (
      this.routerService.isRouteActive('submitted-form/:id') &&
      this.currentUserRole === 'Admin'
    );
  }

  loadFormData() {
    this.controlNames = formData.partOneForm.controlNames;
    this.tableHeaders = formData.partOneForm.tableHeaders;
    this.tableRows = formData.partOneForm.tableRows;
    this.partOneStepLabel = formData.partOneForm.stepLabel;
    
    this.groupCounts = formData.partOneForm.groupCounts;
    this.partOneFormArrayNames = formData.partOneForm.formArrayNames;
  }

  exit() {
    this.routerService.routeTo('dashboard');
  }

  canExit(): boolean | Promise<boolean> | Observable<boolean> {
    // if (
    //   this.currentUserRole === 'Faculty' &&
    //   this.partOneForm.formGroup.valid &&
    //   this.kpiTitlesDropdown.valid
    // ) {
    //   return Promise.resolve(true); // Allow navigation
    // }
    if (true) return Promise.resolve(true); // Allow navigation
    // temp
    else if (
      this.currentUserRole === 'Admin' &&
      this.partOneForm.formGroup.valid &&
      this.partTwoForm.isFormValid
    ) {
      return Promise.resolve(true); // Allow navigation
    }

    const dialogBoxData: IDialogBox = {
      title: 'Confirm Exit',
      content:
        'Are you sure you want to exit? Your individual goal commitment information will not be saved.',
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

  updateIgcfPercentages() {
    const inputValue = this.percentagesCtrl.getRawValue();
    // Check if inputValue is null or empty
    if (!inputValue) {
      const dialogBoxData: IDialogBox = {
        title: 'Attention',
        content: 'Please select a set of percentages for your form.',
        buttons: [
          {
            isVisible: true,
            matDialogCloseValue: false,
            content: 'OK',
          },
        ],
      };

      this.dialog.open(DialogBoxComponent, {
        ...dialogBoxConfig,
        data: dialogBoxData,
      });

      // Proceed with updating igcfPercentages
      this.igcfPercentages.splice(0, this.igcfPercentages.length);
      return;
    }

    this.igcfPercentages.splice(0, this.igcfPercentages.length);

    // Filter the data based on the inputValue

    const filteredData = this.unfilteredIgcfPercentages.filter(
      (item) => item.id === parseInt(inputValue, 10)
    );

    // Map the filtered data to igcfPercentages array
    filteredData[0]['set_weight_%'].split(',').map((weight, index) => {
      this.igcfPercentages.push([
        'Key Performance Indicators (KPIs)',
        weight,
        filteredData[0]['set_individual_goal_commitment_%'].split(',')[index],
        filteredData[0]['set_accomplishment_%'].split(',')[index],
      ]);
    });
  }

  signIgcf(employeeDetails: any): void {
    if (this.partOneForm.formGroup.invalid) {
      const dialogBoxData: IDialogBox = {
        title: 'Incomplete Ratings',
        content: 'Please fill in all the ratings.',
        buttons: [
          {
            isVisible: true,
            matDialogCloseValue: false,
            content: 'Close',
          },
        ],
      };
      this.dialog.open(DialogBoxComponent, {
        ...dialogBoxConfig,
        data: dialogBoxData,
      });
      return; // Exit the method if the form is invalid
    }
    const adminInputRatings: string[] = [];
    Object.values(this.partOneForm.formGroup.value).forEach(
      (formArray: any) => {
        formArray.forEach((item: { rating: string }) => {
          adminInputRatings.push(item.rating);
        });
      }
    );

    const id = this.backendService.getCurrentIgcfId();
    const { emp_signature, emp_fullname } = employeeDetails;
    const currentDate: Date = new Date();
    const year: number = currentDate.getFullYear();
    const month: number = currentDate.getMonth() + 1; // Month is zero-indexed, so add 1
    const day: number = currentDate.getDate();

    const sum = adminInputRatings
      .map(parseFloat) // Convert each string element to a number
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0); // Sum up the array elements

    const average = sum / adminInputRatings.length;

    const signedInfo: ISignedIgcf = {
      id: id,
      equivalent_ratings: adminInputRatings.join(','),
      overall_weighted_average_rating: average.toFixed(2),
      equivalent_description: this.getEquivalentDescription(average),
      ratee_fullname: emp_fullname,
      ratee_signature: emp_signature,
      ratee_date_signed: `${year}-${month}-${day}`,
    };

    this.backendService.signIgcf(signedInfo);
  }
  // initiatives: 'dfs';
  // personalMeasures: '412';
  // personalObject: '333333';
  // selected_kpi: 'test1';
  // weight: '100';
  submit(): void {
    try {
      if (
        this.currentUserRole === 'Faculty' &&
        this.partOneForm.validateFormGroup()
      ) {
        const { emp_fullname, emp_number, emp_position, emp_dept } =
          this.details;
        const currentDate = new Date();
        const deadline = this.datePipe.transform(currentDate, 'yyyy-MM-dd');
        const employeeDetails = {
          fullname: emp_fullname,
          emp_number,
          emp_position,
          emp_dept,
          completion_date: deadline,
        };

        this.backendService
          .submitIGCF({
            ...employeeDetails,
            formData: this.partOneForm.getValues(),
          })
          .subscribe({
            next: () => {
              this.authService.openSnackBar(
                'IGCF submitted successfully.',
                'close',
                'bottom'
              );
              this.routerService.routeTo('dashboard');
            },
          });
      } else if (this.isAdminRating() && this.partOneForm.validateFormGroup() ) {
        // && this.partTwoForm.formGroup.valid
        console.log(this.partTwoForm.formGroup.valid);
        
        console.log('valid');
        this.partOneForm.getValues();
      }
    } catch (e) {
      this.authService.openSnackBar(
        'Please complete all sections of the IGCF form before submitting.',
        'close',
        'bottom'
      );
      return;
    }

    // else if (!this.percentagesCtrl.value && userRole === 'Regular') {
    //   this.openDialogBox(
    //     'Attention',
    //     'Please select a set of percentages for your form.'
    //   );
    // }

    // else {
    //   this.authService.getEmployeeNumber().subscribe({
    //     next: (employeeNumber: string) => {
    //       this.authService.getEmployeeDetails(employeeNumber).subscribe({
    //         next: (employeeDetails) => {
    //           const {
    //             userInputCommitments,
    //             userInputWeightPercentages,
    //             userInputIndividualGoalCommitmentPercentages,
    //             userInputAccomplishmentPercentages,
    //             topThreeLeastAccomplishedGoalCommitments,
    //             topThreeHighlyAccomplishedtGoalCommitments,
    //             topThreeCompetenciesThatNeedImprovement,
    //             topThreeCompetencyStrenghts,
    //             topThreeTrainingAndDevelopmentSuggestionsBasedOnPreviousItems,
    //           } = this.extractFormValues();

    //           if (userRole === 'Regular') {
    //             let selectedWeightPercentages = '';
    //             let selectedIndividualGoalCommitmentPercentages = '';
    //             let selectedCommitmentPercentages = '';

    //             const inputValue = this.percentagesCtrl.value;
    //             if (inputValue !== null) {
    //               const data: IIgcfPercentages[] =
    //                 this.unfilteredIgcfPercentages.filter(
    //                   (item) => item.id === parseInt(inputValue, 10)
    //                 );
    //               if (data.length > 0) {
    //                 selectedWeightPercentages = data[0]['set_weight_%'];
    //                 selectedIndividualGoalCommitmentPercentages =
    //                   data[0]['set_individual_goal_commitment_%'];
    //                 selectedCommitmentPercentages =
    //                   data[0]['set_accomplishment_%'];

    //                 const igcfValues = {
    //                   ...employeeDetails.data,
    //                   selectedWeightPercentages,
    //                   selectedIndividualGoalCommitmentPercentages,
    //                   selectedCommitmentPercentages,
    //                   emp_set_commitments: userInputCommitments.join(','),
    //                   emp_set_weight_percentage:
    //                     userInputWeightPercentages.join(','),
    //                   emp_set_igc_percentage:
    //                     userInputIndividualGoalCommitmentPercentages.join(
    //                       ','
    //                     ),
    //                   emp_set_accomplishment_percentage:
    //                     userInputAccomplishmentPercentages.join(','),
    //                   emp_top_three_least_agc:
    //                     topThreeLeastAccomplishedGoalCommitments.join(','),
    //                   emp_top_three_highly_agc:
    //                     topThreeHighlyAccomplishedtGoalCommitments.join(
    //                       ','
    //                     ),
    //                   emp_top_three_competencies_improvement:
    //                     topThreeCompetenciesThatNeedImprovement.join(','),
    //                   emp_top_three_competency_strenghts:
    //                     topThreeCompetencyStrenghts.join(','),
    //                   emp_top_three_training_development_suggestion:
    //                     topThreeTrainingAndDevelopmentSuggestionsBasedOnPreviousItems.join(
    //                       ','
    //                     ),
    //                 };

    //                 this.backendService.setSubmittedFormValues(igcfValues);
    //                 this.backendService.submitForm();
    //               }
    //             }
    //           } else if (userRole === 'Admin') {
    //             this.signIgcf(employeeDetails.data);
    //           }
    //         },
    //         error: (err) => {
    //           console.error(
    //             'Error occurred while fetching employee details:',
    //             err
    //           );
    //           this.authService.openSnackBar(
    //             'Failed to fetch employee details. Please try again.',
    //             'Close',
    //             'bottom'
    //           );
    //         },
    //       });
    //     },
    //     error: (err) => {
    //       console.error(
    //         'Error occurred while fetching employee number:',
    //         err
    //       );
    //       this.authService.openSnackBar(
    //         'Failed to fetch employee number. Please try again.',
    //         'Close',
    //         'bottom'
    //       );
    //     },
    //   });
    // }
  }
  getEquivalentDescription(score: number): string {
    switch (true) {
      case score >= 1.0 && score <= 1.5:
        return 'Failed to deliver agreed individual goal commitment';
      case score > 1.5 && score <= 2.5:
        return 'Partially delivered agreed individual goal commitment';
      case score > 2.5 && score <= 3.5:
        return 'Delivered agreed individual goal commitment';
      case score > 3.5 && score <= 4.0:
        return 'Exceeded or Delivered beyond individual goal commitment';
      default:
        return 'Invalid score';
    }
  }

  openDialogBox(title: string, content: string): void {
    const dialogBoxData: IDialogBox = {
      title,
      content,
      buttons: [
        {
          isVisible: true,
          matDialogCloseValue: false,
          content: 'Ok',
        },
        {
          isVisible: false,
          matDialogCloseValue: false,
          content: '',
        },
      ],
    };
    this.dialog.open(DialogBoxComponent, {
      ...dialogBoxConfig,
      data: dialogBoxData,
    });
  }

  extractFormValues() {
    const partOne = this.partOneForm.formGroup;
    const partTwo = this.partTwoForm.formGroup;

    const userInputCommitments: string[] = [];
    const userInputWeightPercentages: string[] = [];
    const userInputIndividualGoalCommitmentPercentages: string[] = [];
    const userInputAccomplishmentPercentages: string[] = [];

    Object.values(partOne.value).forEach((formArray: any) => {
      formArray.forEach((item: any) => {
        userInputCommitments.push(item.commitment);
        userInputWeightPercentages.push(item.weight);
        userInputIndividualGoalCommitmentPercentages.push(
          item.individualGoalCommitment
        );
        userInputAccomplishmentPercentages.push(item.accomplishment);
      });
    });

    const topThreeLeastAccomplishedGoalCommitments: string[] =
      partTwo.get('step1')?.value;
    const topThreeHighlyAccomplishedtGoalCommitments: string[] =
      partTwo.get('step2')?.value;
    const topThreeCompetenciesThatNeedImprovement: string[] =
      partTwo.get('step3')?.value;
    const topThreeCompetencyStrenghts: string[] = partTwo.get('step4')?.value;
    const topThreeTrainingAndDevelopmentSuggestionsBasedOnPreviousItems: string[] =
      partTwo.get('step5')?.value;

    return {
      userInputCommitments,
      userInputWeightPercentages,
      userInputIndividualGoalCommitmentPercentages,
      userInputAccomplishmentPercentages,
      topThreeLeastAccomplishedGoalCommitments,
      topThreeHighlyAccomplishedtGoalCommitments,
      topThreeCompetenciesThatNeedImprovement,
      topThreeCompetencyStrenghts,
      topThreeTrainingAndDevelopmentSuggestionsBasedOnPreviousItems,
    };
  }
}
