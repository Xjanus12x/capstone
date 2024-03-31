import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, last } from 'rxjs';
import { formData } from 'src/app/core/constants/formData';
import { IDeactivateComponent } from 'src/app/core/models/DeactivateComponent';
import { DialogBoxComponent } from '../../components/dialog-box/dialog-box.component';
import { MatDialog } from '@angular/material/dialog';
import { IDialogBox } from 'src/app/core/models/DialogBox';
import { BackendService } from 'src/app/core/services/backend.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { RouterService } from '../../services/router-service.service';
import { PartOneFormComponent } from 'src/app/shared/components/part-one-form/part-one-form.component';
import { PartTwoFormComponent } from 'src/app/shared/components/part-two-form/part-two-form.component';
import { dialogBoxConfig } from 'src/app/core/constants/DialogBoxConfig';
import { ActivatedRoute } from '@angular/router';
import { MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';
import { DatePipe } from '@angular/common';
import { FormContentService } from 'src/app/shared/services/form-content.service';
@Component({
  selector: 'app-igcf-form',
  templateUrl: './igcf-form.component.html',
  styleUrls: ['./igcf-form.component.css'],
  providers: [DatePipe],
})
export class IgcfFormComponent implements OnInit, IDeactivateComponent {
  partTwoStepLabel!: string[];
  userRole$: Observable<string> = this.authService.getUserRole();
  currentUserRole: string = '';
  kpiTitlesDropdown = new FormControl('', [Validators.required]);
  kpiTitleList: string[] = [];
  @ViewChild(PartOneFormComponent, { static: false })
  partOneForm!: any;
  @ViewChild(PartTwoFormComponent, { static: false })
  partTwoForm!: any;

  @ViewChild('tabGroup') tabGroup!: MatTabGroup;
  formGroup: FormGroup = new FormGroup({}); // Form group to hold dynamically generated controls
  currentTab: number = 0;
  isValid: boolean = false;
  kpis: any[] = [];
  details!: any;
  currentUserId: string = '';
  isDoneRating: boolean = false;
  isPartOneFormValid: boolean = false;
  responsibleRole = new FormControl('');
  selectedTargetYear = new FormControl('');
  responsibles: string[] = [
    'Dean',
    'Chair',
    'Faculty',
    'CEB',
    'Organizations',
    'Lab',
    'Staff',
    'GPC',
    'OBE Facilitator',
  ];
  targetYears: string[] = [];
  previousSelection: string[] = [];
  isLoading: boolean = false;
  constructor(
    private backendService: BackendService,
    private authService: AuthService,
    public dialog: MatDialog,
    private routerService: RouterService,
    private activatedRoute: ActivatedRoute,
    private datePipe: DatePipe,
    private formContentService: FormContentService
  ) {}

  ngOnInit() {
    this.partTwoStepLabel = formData.partTwoForm.stepLabel;
    this.details = this.authService.getUserInformationFirebase();
    const { department, role } = this.details;
    this.currentUserRole = role;

    this.backendService.getKpisAndActionPlans(department).subscribe({
      next: (data: any[]) => {
        if (data.length > 0) {
          this.kpiTitleList = Array.from(
            new Set(data.map((kpi: any) => kpi.kpi_title.trim()))
          );
          this.targetYears = Object.keys(JSON.parse(data[0]['targets'])).filter(
            (year: string) =>
              !this.backendService.getYearOfCompletions().includes(year)
          );

          this.kpis = data;
        }
      },
    });

    this.activatedRoute.paramMap.subscribe((params) => {
      this.currentUserId = params.get('id')!;
    });
    this.activatedRoute.queryParamMap.subscribe((params) => {
      this.isDoneRating = !!params.get('rateDate');
    });
  }

  confirm() {
    // Check total weight and form validity
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

    // Check if responsible role is selected
    if (!this.responsibleRole.value) {
      this.authService.openSnackBar(
        'Responsible role is required.',
        'close',
        'bottom'
      );
      this.isValid = false;
      return;
    }

    // Check if IGCF year is selected
    if (!this.selectedTargetYear.value) {
      this.authService.openSnackBar(
        'IGCF year is required.',
        'close',
        'bottom'
      );
      this.isValid = false;
      return;
    }

    // If the form is being filled up, set step labels
    if (this.isFillingUp()) {
      const stepLabels = Object.keys(this.formGroup.value).map((key) => {
        const weight = this.formGroup.get(key)?.value;
        return `${key} ${weight}%`;
      });
      this.formContentService.setStepLabels(stepLabels);
    }

    // Open confirmation dialog
    const dialogBoxData: IDialogBox = {
      title: 'Confirm Selection',
      content:
        'Are you sure you want to confirm your selected KPIs? Once confirmed, you cannot go back to selecting KPIs again.',
      buttons: [
        {
          isVisible: true,
          matDialogCloseValue: false,
          content: 'No',
        },
        {
          isVisible: true,
          matDialogCloseValue: true,
          content: 'Yes, Confirm Selection',
        },
      ],
    };

    const dialogRef = this.dialog.open(DialogBoxComponent, {
      ...dialogBoxConfig,
      data: dialogBoxData,
    });

    // Subscribe to dialog close event
    dialogRef.afterClosed().subscribe({
      next: (result) => {
        this.isValid = result;
        if (result) {
          this.kpis = this.kpis
            .map((data: any) => {
              const parseTargets = JSON.parse(data.targets);
              const selectedYear: any = this.selectedTargetYear.value;
              const target = parseTargets[selectedYear];
              return {
                ...data,
                target: target,
              };
            })
            .filter((kpi: any) => {
              const responsibles = kpi.responsibles.split(',');
              const selectedResponsible = this.responsibleRole.value;
              return responsibles.includes(selectedResponsible);
            });
          this.kpiTitlesDropdown.disable();
          this.formGroup.disable();
          this.selectedTargetYear.disable();
          this.responsibleRole.disable();
        }
      },
    });
  }

  getKpiDropdownLength(): number {
    return this.kpiTitlesDropdown?.value?.length ?? 0;
  }
  getWeightFormControl(kpiTitle: string): FormControl {
    return this.formGroup.get(kpiTitle) as FormControl;
  }

  isAdminRating(): boolean {
    return (
      this.routerService.isRouteActive('submitted-form/:id') &&
      this.currentUserRole === 'Admin'
    );
  }

  isFillingUp() {
    return (
      (this.routerService.isRouteActive('fill-up') &&
        this.currentUserRole === 'Admin') ||
      this.currentUserRole === 'Faculty'
    );
  }

  onSelectionChange(selectedValues: string[]) {
    const unselectedValues = this.previousSelection.filter(
      (value) => !selectedValues.includes(value)
    );

    // Calculate the total number of selected values
    const totalSelected = selectedValues.length;

    // Calculate the weight for each selected value
    const weight = totalSelected > 0 ? Math.floor(100 / totalSelected) : 0;

    // Calculate the remaining weight after evenly distributing among selected values
    const remainingWeight = 100 - weight * totalSelected;

    // Remove unselected values from form group
    unselectedValues.forEach((value) => {
      this.formGroup.removeControl(value);
    });

    selectedValues.forEach((value, index) => {
      let valueWeight = weight; // Initialize the weight for the current value

      // Add the remaining weight to the last control
      if (index === totalSelected - 1) {
        valueWeight += remainingWeight;
      }

      if (!this.formGroup.get(value)) {
        // Add form control for newly selected values with calculated weight
        this.formGroup.addControl(
          value,
          new FormControl(valueWeight, [
            Validators.required,
            Validators.min(1),
            Validators.max(100),
          ])
        );
      } else {
        // Update the value of existing form controls
        this.formGroup.get(value)?.setValue(valueWeight);
      }
    });

    this.previousSelection = selectedValues;
  }

  canExit(): boolean | Promise<boolean> | Observable<boolean> {
    if (this.partOneForm || this.partOneForm) {
      if (this.isFillingUp() && this.partOneForm.validateFormGroup())
        return Promise.resolve(true); // Allow navigation
      else if (
        this.partOneForm.validateFormGroup() &&
        this.partTwoForm.validateFormGroup() &&
        this.currentUserRole === 'Admin'
      )
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

  submit(): void {
    if (this.partOneForm || this.partTwoForm) {
      //original
      // const currentDate = new Date();

      if (this.isFillingUp() && this.partOneForm.validateFormGroup()) {
        // if we want to make user create igcf for future
        const currentDate = new Date().setFullYear(
          Number(this.selectedTargetYear.value)
        );
        const completionDate = this.datePipe.transform(
          currentDate,
          'yyyy-MM-dd'
        );
        const { email, role, firstname, lastname, ...rest } = this.details;
        const igcf = {
          id: `${firstname}${lastname}${completionDate}`,
          fullname: `${firstname} ${lastname}`.toUpperCase(),
          ...rest,
          completion_date: completionDate,
          igc_inputs: this.partOneForm.getValues(),
          ratee_fullname: '',
          overall_weighted_average_rating: '',
          equivalent_description: '',
          top_three_least_agc: [],
          top_three_highly_agc: [],
          top_three_competencies_improvement: [],
          top_three_competency_strengths: [],
          top_three_training_development_suggestion: [],
          rate_date: '',
        };

        let title: string = '';
        let content: string = '';
        this.backendService.submitIGCFirebase(igcf).subscribe({
          next: () => {
            title = 'IGCF Submitted successfully';
            content =
              'Your IGCF has been submitted successfully. Please wait for admin review.';
          },
          error: (error) => {
            title = 'Error';
            content =
              'An error occurred while submitting your IGCF. Please try again later.';
          },
          complete: () => {
            this.routerService.routeTo('dashboard');
            const dialogBoxData: IDialogBox = {
              title,
              content,
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
          },
        });
      } else if (
        this.isAdminRating() &&
        this.partOneForm.validateFormGroup() &&
        this.partTwoForm.validateFormGroup()
      ) {
        const currentDate = new Date();
        const rateDate = this.datePipe.transform(currentDate, 'yyyy-MM-dd');
        const { firstname, lastname } = this.details;
        const rateDetails = {
          // id: this.currentUserId,
          ratee_fullname: `${firstname} ${lastname}`.toUpperCase(),
          igc_inputs: this.partOneForm.getValues(),
          overall_weighted_average_rating: this.partOneForm
            .getOverallAverageRating()
            .toFixed(2),
          equivalent_description: this.getEquivalentDescription(
            this.partOneForm.getOverallAverageRating()
          ),
          ...this.partTwoForm.getValues(),
          rate_date: rateDate,
        };
        console.log(rateDetails);

        let title: string = '';
        let content: string = '';
        this.backendService
          .rateSubmittedIGCFirebase(this.currentUserId, rateDetails)
          .subscribe({
            next: () => {
              title = 'Success';
              content = 'IGCF rated successfully.';
            },
            error: (error) => {
              title = 'Error';
              content = 'Failed to rate IGCF: ' + error.message;
            },
            complete: () => {
              this.routerService.routeTo('dashboard');
              const dialogBoxData: IDialogBox = {
                title,
                content,
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
            },
          });
      }
    }
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
}
