import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { FormContentService } from '../../services/form-content.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { BackendService } from 'src/app/core/services/backend.service';
import { Observable, tap } from 'rxjs';
import { ISubmittedIGCF } from 'src/app/core/models/SubmittedIgcf';
import { RouterService } from 'src/app/modules/services/router-service.service';

@Component({
  selector: 'app-part-one-form',
  templateUrl: './part-one-form.component.html',
  styleUrls: ['./part-one-form.component.css'],
})
export class PartOneFormComponent implements OnInit {
  @Input() formArrayNames!: string[];
  @Input() controlNames!: string[];
  @Input() headers!: string[];
  @Input() tableRows!: string[];
  @Input() stepLabel!: string[];
  @Input() groupCounts!: number[];
  @Input() percentages: string[][] = [];
  selectedWeightPercentages!: string[];
  selectedIgcPercentages!: string[];
  selectedCommitmentPercetages!: string[];
  submittedIgcfs$!: Observable<ISubmittedIGCF[]>;
  formGroup!: FormGroup;

  constructor(
    private formContentService: FormContentService,
    private authService: AuthService,
    private backendService: BackendService,
    private routerService: RouterService
  ) {}

  ngOnInit() {
    const data = this.formContentService.getIgcfContent();

    if (Object.keys(data).length !== 0) {
      this.controlNames = data.controlNames;
      this.headers = data.headers;
      this.tableRows = data.tableRows;
      this.stepLabel = data.stepLabel;
      this.groupCounts = data.groupCounts;
      this.formArrayNames = data.formArrayNames;
      this.percentages = data.percentages;
    }

    this.authService.getUserRole().subscribe({
      next: (role) => {
        this.formGroup = this.formContentService.generateDynamicFormGroup(
          this.formArrayNames,
          this.groupCounts,
          this.controlNames,
          role
        );
      },
      error: (error) => {
        console.error('Error fetching user role:', error);
      },
    });
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
                selected_weight_percentages,
                selected_igc_percentages,
                selected_commitment_percentages,
                commitments,
                weight_percentages,
                igc_percentages,
                equivalent_ratings,
                accomplishment_percentages,
              } = filteredIgcf;
              
              
              // Map each selected percentages values into an 2d array of string

              this.percentages = this.formContentService.mapSelectedPercentages(
                selected_weight_percentages.split(','),
                selected_igc_percentages.split(','),
                selected_commitment_percentages.split(',')
              );

              let indexValue = 0;
              const inputValues = this.formArrayNames.map((name, index) => {
                const group: any[] = [];
                for (let i = 0; i < this.groupCounts[index]; i++) {
                  group.push({
                    commitment: commitments.split(',')[indexValue],
                    weight: weight_percentages.split(',')[indexValue],
                    individualGoalCommitment:
                      igc_percentages.split(',')[indexValue],
                    accomplishment:
                      accomplishment_percentages.split(',')[indexValue],
                    rating:
                      equivalent_ratings?.length === 0
                        ? ''
                        : equivalent_ratings?.split(',')[indexValue],
                  });

                  indexValue === 9 ? (indexValue = 0) : indexValue++;
                }
                return { [name]: group };
              });
              
              Object.keys(this.formGroup.value).forEach(
                (formArrayName: string, index) => {
                  this.formGroup
                    .get(formArrayName)
                    ?.setValue(
                      Object.values(inputValues[index][formArrayName])
                    );
                }
              );
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
    return this.formContentService.getFormControls(formGroup, formArrayName);
  }
}
