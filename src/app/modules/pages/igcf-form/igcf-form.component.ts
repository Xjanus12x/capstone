import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, Subject, tap } from 'rxjs';
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

@Component({
  selector: 'app-igcf-form',
  templateUrl: './igcf-form.component.html',
  styleUrls: ['./igcf-form.component.css'],
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
  role: string = '';
  currentIgcfId!: number;
  isSigned!: boolean;
  @ViewChild(PartOneFormComponent) partOneForm!: PartOneFormComponent;
  @ViewChild(PartTwoFormComponent) partTwoForm!: PartTwoFormComponent;

  constructor(
    private backendService: BackendService,
    private authService: AuthService,
    public dialog: MatDialog,
    private routerService: RouterService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.authService.getUserRole().subscribe({
      next: (role: string) => {
        this.role = role;
      },
      error: () => {},
    });
    this.initializeRoute();
    this.fetchIgcfData();
    this.loadFormData();
  }

  initializeRoute() {
    if (this.routerService.isRouteActive('submitted-form/:id/:isSigned')) {
      this.activatedRoute.paramMap.subscribe((params) => {
        const id = params.get('id');
        this.isSigned = params.get('isSigned') === 'true';
        this.updateCurrentIgcfId(id);
      });
    }
  }
  updateCurrentIgcfId(id: string | null) {
    if (id !== null) {
      const parsedId = parseInt(id, 10);
      if (!isNaN(parsedId)) {
        this.backendService.setCurrentIgcfId(parsedId);
        this.currentIgcfId = parsedId;
      }
    }
  }

  fetchIgcfData() {
    this.authService.getEmployeeDepartment().subscribe({
      next: (deptName) => {
        this.backendService.getIgcfInformations(deptName).subscribe(
          (response) => {
            this.unfilteredIgcfPercentages =
              response.data as IIgcfPercentages[];
          },
          (error) => {
            console.error('Error fetching IGCF information:', error);
            // Handle errors here (e.g., show an error message to the user)
          }
        );
      },
      error: (deptError) => {
        console.error('Error fetching employee department:', deptError);
        // Handle errors related to fetching employee department
      },
    });
  }

  loadFormData() {
    this.controlNames = formData.partOneForm.controlNames;
    this.tableHeaders = formData.partOneForm.tableHeaders;
    this.tableRows = formData.partOneForm.tableRows;
    this.partOneStepLabel = formData.partOneForm.stepLabel;
    this.partTwoStepLabel = formData.partTwoForm.stepLabel;
    this.groupCounts = formData.partOneForm.groupCounts;
    this.partOneFormArrayNames = formData.partOneForm.formArrayNames;
  }
  isAllInputFilled(): boolean {
    return this.partOneForm.formGroup.valid && this.partTwoForm.formGroup.valid;
  }

  exit() {
    this.routerService.routeTo('dashboard');
  }

  canExit(): boolean | Promise<boolean> | Observable<boolean> {
    if (this.role === 'Regular' && this.isAllInputFilled()) {
      return Promise.resolve(true); // Allow navigation
    } else if (
      this.role === 'Admin' &&
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

  submit(): void {
    this.userRole$.subscribe({
      next: (userRole) => {
        if (!this.isAllInputFilled() && userRole === 'Regular') {
          this.openDialogBox(
            'Incomplete Submission',
            'Some required fields are not filled.'
          );
        } else if (!this.percentagesCtrl.value && userRole === 'Regular') {
          this.openDialogBox(
            'Attention',
            'Please select a set of percentages for your form.'
          );
        } else {
          this.authService.getEmployeeNumber().subscribe({
            next: (employeeNumber: string) => {
              this.authService.getEmployeeDetails(employeeNumber).subscribe({
                next: (employeeDetails) => {
                  const {
                    userInputCommitments,
                    userInputWeightPercentages,
                    userInputIndividualGoalCommitmentPercentages,
                    userInputAccomplishmentPercentages,
                    topThreeLeastAccomplishedGoalCommitments,
                    topThreeHighlyAccomplishedtGoalCommitments,
                    topThreeCompetenciesThatNeedImprovement,
                    topThreeCompetencyStrenghts,
                    topThreeTrainingAndDevelopmentSuggestionsBasedOnPreviousItems,
                  } = this.extractFormValues();

                  if (userRole === 'Regular') {
                    let selectedWeightPercentages = '';
                    let selectedIndividualGoalCommitmentPercentages = '';
                    let selectedCommitmentPercentages = '';

                    const inputValue = this.percentagesCtrl.value;
                    if (inputValue !== null) {
                      const data: IIgcfPercentages[] =
                        this.unfilteredIgcfPercentages.filter(
                          (item) => item.id === parseInt(inputValue, 10)
                        );
                      if (data.length > 0) {
                        selectedWeightPercentages = data[0]['set_weight_%'];
                        selectedIndividualGoalCommitmentPercentages =
                          data[0]['set_individual_goal_commitment_%'];
                        selectedCommitmentPercentages =
                          data[0]['set_accomplishment_%'];

                        const igcfValues = {
                          ...employeeDetails.data,
                          selectedWeightPercentages,
                          selectedIndividualGoalCommitmentPercentages,
                          selectedCommitmentPercentages,
                          emp_set_commitments: userInputCommitments.join(','),
                          emp_set_weight_percentage:
                            userInputWeightPercentages.join(','),
                          emp_set_igc_percentage:
                            userInputIndividualGoalCommitmentPercentages.join(
                              ','
                            ),
                          emp_set_accomplishment_percentage:
                            userInputAccomplishmentPercentages.join(','),
                          emp_top_three_least_agc:
                            topThreeLeastAccomplishedGoalCommitments.join(','),
                          emp_top_three_highly_agc:
                            topThreeHighlyAccomplishedtGoalCommitments.join(
                              ','
                            ),
                          emp_top_three_competencies_improvement:
                            topThreeCompetenciesThatNeedImprovement.join(','),
                          emp_top_three_competency_strenghts:
                            topThreeCompetencyStrenghts.join(','),
                          emp_top_three_training_development_suggestion:
                            topThreeTrainingAndDevelopmentSuggestionsBasedOnPreviousItems.join(
                              ','
                            ),
                        };

                        this.backendService.setSubmittedFormValues(igcfValues);
                        this.backendService.submitForm();
                      }
                    }
                  } else if (userRole === 'Admin') {
                    this.signIgcf(employeeDetails.data);
                  }
                },
                error: (err) => {
                  console.error(
                    'Error occurred while fetching employee details:',
                    err
                  );
                  this.authService.openSnackBar(
                    'Failed to fetch employee details. Please try again.',
                    'Close',
                    'bottom'
                  );
                },
              });
            },
            error: (err) => {
              console.error(
                'Error occurred while fetching employee number:',
                err
              );
              this.authService.openSnackBar(
                'Failed to fetch employee number. Please try again.',
                'Close',
                'bottom'
              );
            },
          });
        }
      },
      error: (error) => {
        console.error('Error occurred while fetching user role:', error);
      },
    });
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
