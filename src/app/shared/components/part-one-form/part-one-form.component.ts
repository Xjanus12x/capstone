import { Component, Input, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { FormContentService } from '../../services/form-content.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { BackendService } from 'src/app/core/services/backend.service';
import { Observable, tap } from 'rxjs';
import { ISubmittedIGCF } from 'src/app/core/models/SubmittedIgcf';
import { RouterService } from 'src/app/modules/services/router-service.service';
import { ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-part-one-form',
  templateUrl: './part-one-form.component.html',
  styleUrls: ['./part-one-form.component.css'],
})
export class PartOneFormComponent implements OnInit {
  @Input() kpis: any[] = [];
  formGroup!: FormGroup;
  step = 0;
  isAdmin: boolean = false;
  isFaculty: boolean = false;
  actionPlans: string[] = [];
  totalWeights: Map<string, number> = new Map<string, number>();
  currentUserRole: string = '';
  stepLabels: string[] = [];
  constructor(
    private formContentService: FormContentService,
    private authService: AuthService,
    private backendService: BackendService,
    private routerService: RouterService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute
  ) {
    this.formGroup = this.fb.group({});
  }
  ngOnInit() {
    this.authService.getUserRole().subscribe({
      next: (role) => {
        this.isAdmin = role === 'Admin';
        this.isFaculty = role === 'Faculty';
        this.currentUserRole = role;
      },
      error: (error) => {
        console.error('Error fetching user role:', error);
      },
    });

    // Create FormArrays dynamically based on step labels
    if (this.isFaculty) {
      this.stepLabels = this.formContentService.getStepLabels();
      this.stepLabels.forEach((label: string) => {
        this.formGroup.addControl(
          this.getLabel(label).trim(),
          this.fb.array([this.createFormGroupForFaculty()])
        );
      });
    }

    if (this.isAdminRating()) {
      const selectedKpiMap = new Map<string, number>();
      this.activatedRoute.paramMap.subscribe((params) => {
        const id = params.get('id');
        this.backendService.getSubmittedIgcfDetails(id!).subscribe({
          next: (igcfDetails: any) => {
            igcfDetails.forEach((elem: any) => {
              const { selected_kpi, weight } = elem;
              if (selectedKpiMap.has(selected_kpi)) {
                // Key already exists in map
                const currentWeight = selectedKpiMap.get(selected_kpi)!;
                selectedKpiMap.set(
                  selected_kpi,
                  currentWeight + parseInt(weight)
                );
              } else {
                // Key does not exist in map
                selectedKpiMap.set(selected_kpi, parseInt(weight));
              }
            });

            selectedKpiMap.forEach((weight, selected_kpi) => {
              this.stepLabels.push(`${selected_kpi} ${weight}%`);
            });
            this.stepLabels.forEach((label: string) => {
              this.formGroup.addControl(
                this.getLabel(label).trim(),
                this.fb.array([])
              );
            });

            igcfDetails.forEach((elem: any) => {
              this.addFormGroupForAdmin(elem.selected_kpi, elem);
            });
          },
          error: (error: any) => {
            console.error('Error fetching IGCF details:', error);
            // Handle error
          },
        });
      });
    }
  }

  addFormGroupForAdmin(formArrayName: string, values: any) {
    const formArray = this.formGroup.get(formArrayName) as FormArray;
    formArray.push(this.createFormGroupForAdmin(values));
  }

  createFormGroupForAdmin(values: any): FormGroup {
    return this.fb.group({
      personalObject: [
        { value: values.selected_plan, disabled: this.isAdmin },
        Validators.required,
      ],
      personalMeasures: [
        { value: values.personal_measures_kpi, disabled: this.isAdmin },
        Validators.required,
      ],
      target: [
        {
          value: values.selected_plan_weight,
          disabled: this.isFaculty || this.isAdmin,
        },
        Validators.required,
      ],
      initiatives: [
        { value: values.initiatives, disabled: this.isAdmin },
        Validators.required,
      ],
      weight: [
        { value: values.weight, disabled: this.isAdmin },
        Validators.required,
      ],
      achieved: [{ value: '', disabled: this.isFaculty }, Validators.required],
      rating: [{ value: '', disabled: this.isFaculty }, Validators.required],
    });
  }

  isAdminRating(): boolean {
    return (
      this.routerService.isRouteActive('submitted-form/:id') && this.isAdmin
    );
  }

  getActionPlans(label: string): string[] {
    const actionPlans = this.kpis.filter((kpi) => {
      const responsible = kpi.responsible.split(',');
      return (
        kpi.kpi_title === label && responsible.includes(this.currentUserRole)
      );
    });
    return actionPlans.map((kpi) => kpi.action_plan);
  }

  onActionPlanSelectionChange(value: string, label: string, index: number) {
    // Filter kpis array to find the selected plan
    const selectedPlan = this.kpis.find((kpi) => {
      return kpi.kpi_title === label && kpi.action_plan === value;
    });

    // Set the target control value to the selected plan's weight percentage
    if (selectedPlan) {
      const targetControl = this.formGroup.get(
        `${label}.${index}.target`
      ) as FormControl;
      targetControl.setValue(`${selectedPlan.weight}%`);
    }
  }

  getValues() {
    if (this.currentUserRole === 'Faculty') {
      const values = this.formGroup.getRawValue() as {
        [key: string]: {
          personalObject: string;
          personalMeasures: string;
          initiatives: string;
          weight: string;
          target: string;
        }[];
      };

      const igcfInputs: any[] = [];
      // Loop through each key-value pair
      Object.entries(values).forEach(([key, value]) => {
        value.forEach((item, index) => {
          igcfInputs.push({ selected_kpi: key, ...item });
        });
      });
      return igcfInputs;
    } else {
      const values = this.formGroup.value as {
        [key: string]: { achieved: string; rating: string }[];
      };

      let totalRating = 0;
      let totalRatingsEncountered = 0;

      // Loop through each key-value pair
      Object.entries(values).forEach(([key, value]) => {
        value.forEach((item, index) => {
          console.log(item);
          // Convert the rating to a number and add it to the totalRating
          totalRating += parseInt(item.rating);
          // Increment the totalRatingsEncountered
          totalRatingsEncountered++;
        });
      });
      console.log('tot rating enocu', totalRatingsEncountered);
      
      let averageRating = 0;

      // Calculate the average rating
      if (totalRatingsEncountered !== 0) {
        averageRating = totalRating / totalRatingsEncountered;
      }

      console.log('Average Rating:', averageRating);

      return [];
    }
  }

  validateFormGroup(): boolean {
    if (this.formGroup.invalid) {
      this.authService.openSnackBar(
        'Please fill out all required fields correctly.',
        'close',
        'bottom'
      );
      return false;
    }
    if (this.currentUserRole === 'Faculty') {
      // Clear the totalWeights map before recalculating
      this.totalWeights.clear();

      // Get an array of keys for the form group
      const formGroupKeys = Object.keys(this.formGroup.controls);

      // Loop through each key (which corresponds to a form array)
      formGroupKeys.forEach((key: string) => {
        // Get the form array using the key
        const formArray = this.formGroup.get(key) as FormArray;

        // Calculate the total weight for the current form array
        const totalWeight = this.calculateTotalWeight(formArray);

        // Store the total weight in the map
        this.totalWeights.set(key, totalWeight);
      });

      const kpiSetPercentage = new Map<string, string>();

      this.stepLabels.forEach((label) => {
        const matches = label.match(/\d+%$/); // Match the numeric value followed by '%'
        if (matches) {
          const percentage = matches[0].replace('%', ''); // Extract the matched percentage value and remove the '%'
          const labelWithoutPercentage = label.replace(matches[0], '').trim(); // Remove the percentage from the label

          kpiSetPercentage.set(labelWithoutPercentage, percentage);
        }
      });

      for (const [key, value] of kpiSetPercentage.entries()) {
        let percent = Number(value);
        let facultySetWeight = this.totalWeights.get(key);
        if (
          percent !== facultySetWeight ||
          facultySetWeight > percent ||
          facultySetWeight < percent
        ) {
          this.authService.openSnackBar(
            `Please distribute weight evenly for ${key}.`,
            'close',
            'bottom'
          );
          return false; // This will exit the function and return false
        }
      }

      return true; // Return true if all checks pass
    }
    return this.formGroup.valid;
  }

  calculateTotalWeight(formArray: FormArray): number {
    // Use reduce to calculate the total weight for the current form array
    return formArray.controls.reduce(
      (acc: number, control: AbstractControl) => {
        if (control instanceof FormGroup) {
          // Get the weight form control value and add it to the accumulator
          const weightControl = control.get('weight');
          if (weightControl) {
            return acc + (+weightControl.value || 0); // Convert to number using '+' operator
          }
        }
        return acc; // Return accumulator unchanged if the control is not a FormGroup
      },
      0
    );
  }

  getFormControl(label: string, index: number, controlName: string) {
    return this.formGroup.get(
      `${label}.${index}.${controlName}`
    ) as FormControl;
  }

  trackByIndex(index: number, item: any): number {
    return index; // Or return item.id if you have unique identifiers
  }
  createFormGroupForFaculty(): FormGroup {
    return this.fb.group({
      personalObject: [
        { value: '', disabled: this.isAdmin },
        Validators.required,
      ],
      personalMeasures: [
        { value: '', disabled: this.isAdmin },
        Validators.required,
      ],
      target: [
        { value: 'None', disabled: this.isAdmin || this.isFaculty },
        Validators.required,
      ],
      initiatives: [{ value: '', disabled: this.isAdmin }, Validators.required],
      weight: [{ value: '', disabled: this.isAdmin }, Validators.required],
      achieved: [{ value: '', disabled: this.isFaculty }, Validators.required],
      rating: [{ value: '', disabled: this.isFaculty }, Validators.required],
    });
  }
  getPersonalObjectControl(
    arrayName: string,
    controlName: string,
    index: number
  ): AbstractControl {
    const actionPlansArray = this.getFormArrayControls(arrayName);
    const actionPlanGroup = actionPlansArray.at(index) as FormGroup;
    return actionPlanGroup.get(controlName) as AbstractControl;
  }
  removeIGCControl(arrayName: string, index: number) {
    const formArray = this.formGroup.get(arrayName.trim()) as FormArray;
    formArray.removeAt(index);
    this.getFormArrayLength(arrayName);
  }

  getFormArrayLength(arrayName: string): number {
    const formArray = this.formGroup.get(arrayName.trim()) as FormArray;
    return formArray.length;
  }

  addFormGroup(formArrayName: string) {
    const formArray = this.formGroup.get(formArrayName) as FormArray;
    formArray.push(this.createFormGroupForFaculty());
  }
  getLabel(label: string) {
    // Split the label by space and remove the last part
    const parts = label.split(' ').slice(0, -1);
    // Join the remaining parts back together with a space in between
    return parts.join(' ');
  }

  getFormArrayControls(arrayName: string): FormArray {
    return this.formGroup.get(arrayName) as FormArray;
  }

  igcControls(): FormArray {
    return this.formGroup.get('igc') as FormArray;
  }
}
