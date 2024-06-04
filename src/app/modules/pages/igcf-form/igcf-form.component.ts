import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, filter, last } from 'rxjs';
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
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
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
    'Practicum',
    'Coor',
  ];
  targetYears: string[] = [];
  previousSelection: string[] = [];
  isLoading: boolean = false;
  submittedIGCF!: any;
  constructor(
    private backendService: BackendService,
    private authService: AuthService,
    public dialog: MatDialog,
    private routerService: RouterService,
    private activatedRoute: ActivatedRoute,
    private datePipe: DatePipe,
    private formContentService: FormContentService,
    private router: Router
  ) {}

  ngOnInit() {
    this.partTwoStepLabel = formData.partTwoForm.stepLabel;
    this.details = this.authService.getUserInformationFirebase();
    const { department, role } = this.details;
    this.currentUserRole = role;
    this.backendService
      .fetchAllObjectivesAndActionPlansByDept(department)
      .subscribe({
        next: (data: any[]) => {
          if (data.length > 0) {
            this.kpiTitleList = Array.from(
              new Set(data.map((kpi: any) => kpi.kpi_title.trim()))
            );
            data.forEach((data) => {
              const targetYears = Object.keys(data.targets);
              targetYears.forEach((year) => {
                if (
                  !this.targetYears.includes(year) &&
                  !this.backendService.getYearOfCompletions().includes(year)
                )
                  this.targetYears.push(year);
              });
            });

            this.kpis = data;
          }
        },
      });

    if (this.routerService.isRouteActive('submitted-form/:id')) {
      this.activatedRoute.paramMap.subscribe((params) => {
        this.currentUserId = params.get('id')!;
        this.backendService.getSubmittedIGCFByID(this.currentUserId).subscribe({
          next: (submittedIGCF: any) => {
            this.submittedIGCF = submittedIGCF;
          },
        });
      });
      this.activatedRoute.queryParamMap.subscribe((params) => {
        this.isDoneRating = !!params.get('rateDate');
      });
    }
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
              const selectedYear: any = this.selectedTargetYear.value;
              const target = data.targets[selectedYear];
              return {
                ...data,
                target: target,
              };
            })
            .filter((kpi: any) => {
              const responsibles = kpi.responsible;
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
        this.isLoading = true;
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
          position: this.responsibleRole.value,
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
            this.isLoading = false;
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
            const fullname = `${firstname} ${lastname}`.toUpperCase();
            const message = `${fullname} has submitted an Individual Goal Commitment Form For ${this.selectedTargetYear.value}`;
            const timeStamp = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
            this.backendService.addLog({
              message,
              timestamp: timeStamp,
              department: this.details.department,
              type: 'submitted-igcs',
            });
          },
        });
      } else if (
        this.isAdminRating() &&
        this.partOneForm.validateFormGroup() &&
        this.partTwoForm.validateFormGroup()
      ) {
        this.isLoading = true;
        const currentDate = new Date();
        const rateDate = this.datePipe.transform(currentDate, 'yyyy-MM-dd');
        const { firstname, lastname } = this.details;
        const rateeFullname = `${firstname} ${lastname}`.toUpperCase();
        const rateDetails = {
          // id: this.currentUserId,
          ratee_fullname: rateeFullname,
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

        let title: string = '';
        let content: string = '';

        this.backendService
          .rateSubmittedIGCFirebase(this.currentUserId, rateDetails)
          .subscribe({
            next: () => {
              title = 'Success';
              content = 'IGCF rated successfully.';
              // department: 'SCHOOL OF COMPUTING';
              // email: 'albertovillacarlos07@gmail.com';
              // emp_number: 12321;
              // firstname: 'alberto';
              // lastname: 'villacarlos';
              // role: 'Admin';

              this.authService
                .fetchSpecificUserInformation(
                  this.partOneForm.getSubmittedIGCEmployeeNumber()
                )
                .subscribe({
                  next: (userInformation: any) => {
                    const { firstname, lastname, email } = userInformation;
                    const raterFullname =
                      `${firstname} ${lastname}`.toUpperCase();
            this.backendService.sendEmail(
              `${rateeFullname}`, // recipient name (Ratee who completed the rating)
              `${raterFullname}`, // sender name (Rater who submitted the IGC)
              `
              Dear ${raterFullname},

              This is to inform you that the submitted IGC has been completed rating by ${rateeFullname}.

              Best regards,
              ${rateeFullname}
              `, // email message
              `${rateeFullname} has completed rating your submitted IGC`, // email subject
              email // recipient email address
            );
                  },
                });
 
            },
            error: (error) => {
              title = 'Error';
              content = 'Failed to rate IGCF: ' + error.message;
            },
            complete: () => {
              this.isLoading = false;
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
              const fullname = `${firstname} ${lastname}`.toUpperCase();
              const message = `${fullname} has completed rating an Individual Goal Commitment Form (IGCF) submitted by ${this.submittedIGCF.fullname}`;
              const timeStamp = this.datePipe.transform(
                new Date(),
                'yyyy-MM-dd'
              );

              this.backendService.addLog({
                message,
                timestamp: timeStamp,
                department: this.details.department,
                type: 'completed-ratings',
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
  isCurrentTarget(year: string) {
    const currentYear = new Date().getFullYear().toString();
    return currentYear === year
      ? `Use for Current Year (${year}) - Fill out`
      : `Use for ${year}`;
  }
}
