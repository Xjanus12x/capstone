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
export class ViewIgcfComponent implements OnInit {
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
  isLoadingResults: boolean = false;
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

  submittedInfos!: any;
  submittedPartOneIgcf: any[] = [];
  submittedPartTwoIgcf: any[] = [];
  kpiPercentagesMap = new Map<string, number>();
  isRatingPending: boolean = false;
  fullname: string = '';
  completion_date: string = '';
  currentYear: number = new Date().getFullYear();
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
      this.fullname = params.get('name')!;
      this.completion_date = params.get('date')!;
      const ratingStatus = params.get('ratingStatus');
      this.isRatingPending = ratingStatus === 'false';
      if (!this.isRatingPending) {
        this.backendService.getSubmissionHistoryEveryDept().subscribe({
          next: (data: any) => {
            this.submittedInfos = data.filter((elem: any) => elem.id == id);
            this.backendService.getSubmittedIgcfDetails(id!).subscribe({
              next: (details: any) => {
                details.forEach((detail: any) => {
                  // Ensure detail is not already included
                  if (
                    !this.submittedPartOneIgcf.includes(detail.selected_kpi)
                  ) {
                    this.submittedPartOneIgcf.push(detail.selected_kpi);
                  }

                  const condition =
                    detail.tbl_igcf_submission_history_id == id &&
                    this.submittedInfos[0].completion_date ===
                      detail.completion_date;

                  if (condition) {
                    // Add weight to the total for the selected KPI
                    const totalWeight =
                      this.kpiPercentagesMap.get(detail.selected_kpi) || 0;
                    this.kpiPercentagesMap.set(
                      detail.selected_kpi,
                      totalWeight + detail.weight
                    );

                    this.submittedPartOneIgcf.push(detail);
                  }
                });
                const igcfYearOfCompletion = new Date(
                  this.submittedPartOneIgcf[1].completion_date
                ).getFullYear();
                this.backendService.getSubmittedIgcfPartTwo(id!).subscribe({
                  next: (partTwo: any) => {
                    const partTwoValues = partTwo.filter((part: any) => {
                      return (
                        part.rate_date && // Check if rate_date exists and is not null or undefined
                        new Date(part.rate_date).getFullYear() ===
                          igcfYearOfCompletion
                      );
                    });
                    partTwoValues.forEach((value: any) => {
                      const {
                        equivalent_description,
                        overall_weighted_average_rating,
                        top_three_competencies_improvement,
                        top_three_competency_strengths,
                        top_three_highly_agc,
                        top_three_least_agc,
                        top_three_training_development_suggestion,
                      } = value;
                      this.submittedPartTwoIgcf.push({
                        equivalent_description,
                        overall_weighted_average_rating,
                        question1:
                          top_three_competencies_improvement.split(','),
                        question2: top_three_competency_strengths.split(','),
                        question3: top_three_highly_agc.split(','),
                        question4: top_three_least_agc.split(','),
                        question5:
                          top_three_training_development_suggestion.split(','),
                      });
                    });
                  },
                });
              },
            });
          },
        });
      }
    });
  }
  isObject(param: string | object) {
    return typeof param === 'object';
  }
  getPartTwoAnswers(questionType: string) {
    return this.submittedPartTwoIgcf[0][questionType];
  }
  getKPIPerntage(kpi_title: string) {
    return this.kpiPercentagesMap.get(kpi_title);
  }

  getPercentageForCurrentYear(data: string): { [year: number]: number } {
    const yearNumberMap: { [year: number]: number } = {};
    const segments = data.split(', '); // Split by comma and space to extract each segment
    segments.forEach((segment) => {
      console.log(segment);
      
      const match =
        /(\d+)% \((\d{2}-\d{2}-\d{4}) to (\d{2}-\d{2}-\d{4})\)/.exec(segment);
      if (match) {
        const number = parseInt(match[1]);
        const startDate = new Date(match[2]);
        const endDate = new Date(match[3]);
        const startYear = startDate.getFullYear();
        const endYear = endDate.getFullYear();
        for (let year = startYear; year <= endYear; year++) {
          yearNumberMap[year] = number; // Map each year to its number
        }
      }
    });
    console.log(yearNumberMap);
    return yearNumberMap;
  }
}
