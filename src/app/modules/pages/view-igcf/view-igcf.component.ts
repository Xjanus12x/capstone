import { AfterViewInit, Component, OnInit } from '@angular/core';
import { formData } from 'src/app/core/constants/formData';
import { RouterService } from '../../services/router-service.service';
import { BackendService } from 'src/app/core/services/backend.service';
import { Observable, tap } from 'rxjs';
import { ISubmittedIGCF } from 'src/app/core/models/SubmittedIgcf';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-view-igcf',
  templateUrl: './view-igcf.component.html',
  styleUrls: ['./view-igcf.component.css'],
})
export class ViewIgcfComponent implements OnInit, AfterViewInit {
  categories: string[] = [];
  selectedPercentages: string[][] = [];
  tableHeaders: string[] = [];
  partOneIgcfValues: any[] = [];
  partTwoIgcfValues: any[] = [];
  arrayNames: string[] = [];
  fullName: string = '';
  raterSignature: string = '';
  raterDateSigned: string = '';
  empPosition: string = '';
  empNumber: string = '';
  empDept: string = '';
  isLoadingResults: boolean = true;
  overallWeightedAverageRating: string = '';
  equivalentDescription: string = '';
  userRole$!: Observable<string>;
  partTwoQuestions: string[] = [
    'a.	Top three least accomplished goal commitments',
    'b.	Top three highly accomplished goal commitments',
    'c.	Top three competencies that need improvement',
    'd.	Top three competency strengths',
    'e.	Top three training and development suggestions based on previous items',
  ];
  deadline: Date | undefined = undefined;
  department: string = '';
  rateeSignInfo?: {
    rateeFullName: string;
    rateeDateSigned: string;
    rateeSignature: string;
  } | null;

  constructor(
    private routerService: RouterService,
    private backendService: BackendService,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService
  ) {}
  ngOnInit() {
    this.userRole$ = this.authService.getUserRole();
    const { tableHeaders } = formData.partOneForm;
    this.tableHeaders = tableHeaders;
    this.activatedRoute.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.updateCurrentIgcfId(id);
      this.backendService
        .getAllSubmittedIgcfInEverydept()
        .pipe(
          tap((igcfs: ISubmittedIGCF[]) => {
            const filteredIgcf = igcfs.find((igcf) => igcf.id === Number(id));
            if (filteredIgcf) {
              const { emp_dept } = filteredIgcf;
              this.backendService.getIgcfDeadline(emp_dept).subscribe({
                next: (result: any[]) => {
                  if (result.length > 0) {
                    this.deadline = result[0].date;
                  }
                },
              });
            }
          })
        )
        .subscribe();
    });
  }
  ngAfterViewInit(): void {
    this.backendService
      .getAllSubmittedIgcfInEverydept()
      .pipe(
        tap((igcfs: ISubmittedIGCF[]) => {
          this.isLoadingResults = true;
          const filteredIgcf = igcfs.find(
            (igcf) => igcf.id === this.backendService.getCurrentIgcfId()
          );
          if (filteredIgcf) {
            const { stepLabel, formArrayNames, groupCounts } =
              formData.partOneForm;
            this.arrayNames = formArrayNames;
            const {
              fullname,
              emp_position,
              emp_number,
              emp_dept,
              selected_weight_percentages,
              selected_igc_percentages,
              selected_commitment_percentages,
              commitments,
              weight_percentages,
              igc_percentages,
              accomplishment_percentages,
              equivalent_ratings,
              overall_weighted_average_rating,
              equivalent_description,
              top_three_least_agc,
              top_three_highly_agc,
              top_three_competencies_improvement,
              top_three_competency_strenghts,
              top_three_training_development_suggestions,
              rater_signature,
              rater_date_signed,
              ratee_fullname,
              ratee_signature,
              ratee_date_signed,
            } = filteredIgcf;

            this.department = emp_dept;
            this.fullName = fullname;
            this.empPosition = emp_position;
            this.empNumber = emp_number;
            this.empDept = emp_dept;
            this.overallWeightedAverageRating =
              overall_weighted_average_rating || '';
            this.equivalentDescription = equivalent_description || '';
            this.raterSignature = rater_signature!;
            this.raterDateSigned = rater_date_signed!.split('T')[0];

            ratee_fullname === '' ||
            ratee_date_signed == '' ||
            ratee_signature == ''
              ? (this.rateeSignInfo = null)
              : (this.rateeSignInfo = {
                  rateeFullName: ratee_fullname,
                  rateeDateSigned: ratee_date_signed.split('T')[0],
                  rateeSignature: ratee_signature,
                });

            let indexValue = 0;
            const partOneValues = this.arrayNames.map((name, index) => {
              const group: any[] = [];
              for (let i = 0; i < groupCounts[index]; i++) {
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

            this.partOneIgcfValues = stepLabel.map((label, index) => {
              return {
                category: label.toUpperCase(),
                selectedWeightPercentage:
                  selected_weight_percentages.split(',')[index],
                selectedIgcPercentage:
                  selected_igc_percentages.split(',')[index],
                selectedCommitmentPercentage:
                  selected_commitment_percentages.split(',')[index],
                ...partOneValues[index],
              };
            });

            this.partTwoIgcfValues = [
              top_three_least_agc.split(','),
              top_three_highly_agc.split(','),
              top_three_competencies_improvement.split(','),
              top_three_competency_strenghts.split(','),
              top_three_training_development_suggestions.split(','),
            ];
          }
          this.isLoadingResults = false;
        })
      )
      .subscribe();
  }
  updateCurrentIgcfId(id: string | null) {
    if (id !== null) {
      const parsedId = parseInt(id, 10);
      if (!isNaN(parsedId)) {
        this.backendService.setCurrentIgcfId(parsedId);
      }
    }
  }
  isRouteActive() {
    return (
      this.routerService.isRouteActive('reports') ||
      this.routerService.isRouteActive('submitted-form/:id/:isSigned')
    );
  }

  
}
