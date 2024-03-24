import { Component, OnInit } from '@angular/core';
import { formData } from 'src/app/core/constants/formData';
import { RouterService } from '../../services/router-service.service';
import { BackendService } from 'src/app/core/services/backend.service';
import { Observable, forkJoin } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-view-igcf',
  templateUrl: './view-igcf.component.html',
  styleUrls: ['./view-igcf.component.css'],
})
export class ViewIgcfComponent implements OnInit {
  tableHeaders: string[] = [];
  isLoadingResults: boolean = false;
  userRole$!: Observable<string>;
  partTwoQuestions: string[] = [
    'a. Top three least accomplished goal commitments',
    'b. Top three highly accomplished goal commitments',
    'c. Top three competencies that need improvement',
    'd. Top three competency strengths',
    'e. Top three training and development suggestions based on previous items',
  ];
  deadline: Date | undefined = undefined;
  raterInfos!: any;
  submittedPartOneIgcf: any[] = [];
  submittedPartTwoIgcf: any = {};
  kpiPercentagesMap = new Map<string, number>();
  isRatingPending: boolean = false;
  fullname: string = '';
  completion_date: string = '';
  currentYear: number = new Date().getFullYear();
  submittedIgcIdList: number[] = [];
  constructor(
    private routerService: RouterService,
    private backendService: BackendService,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.submittedIgcIdList = this.routerService.getSubmittedIgcIdList();
    this.userRole$ = this.authService.getUserRole();
    const { tableHeaders } = formData.partOneForm;
    this.tableHeaders = tableHeaders;

    this.activatedRoute.paramMap.subscribe((params) => {
      const id = params.get('id');
      const submissionHistory$ =
        this.backendService.getSubmissionHistoryEveryDept();
      const submittedIgcfDetails$ = this.backendService.getSubmittedIgcfDetails(
        id!
      );
      const submittedIgcfPartTwo$ = this.backendService.getSubmittedIgcfPartTwo(
        id!
      );

      forkJoin({
        submissionHistory: submissionHistory$,
        submittedIgcfDetails: submittedIgcfDetails$,
        submittedIgcfPartTwo: submittedIgcfPartTwo$,
      })
        .pipe(
          tap(
            ({
              submissionHistory,
              submittedIgcfDetails,
              submittedIgcfPartTwo,
            }) => {
              this.raterInfos = submissionHistory;

              (submittedIgcfDetails as any[]).forEach((detail: any) => {
                // Ensure detail is not already included
                if (!this.submittedPartOneIgcf.includes(detail.selected_kpi)) {
                  this.submittedPartOneIgcf.push(detail.selected_kpi);
                }
                // Add weight to the total for the selected KPI
                const totalWeight =
                  this.kpiPercentagesMap.get(detail.selected_kpi) || 0;
                this.kpiPercentagesMap.set(
                  detail.selected_kpi,
                  totalWeight + detail.weight
                );
                this.submittedPartOneIgcf.push(detail);
              });

              (submittedIgcfPartTwo as any[]).filter((partTwo: any) => {
                const {
                  equivalent_description,
                  overall_weighted_average_rating,
                  top_three_competencies_improvement,
                  top_three_competency_strengths,
                  top_three_highly_agc,
                  top_three_least_agc,
                  top_three_training_development_suggestion,
                  rate_date,
                  ratee_fullname,
                } = partTwo;

                this.submittedPartTwoIgcf = {
                  ratee_fullname,
                  rate_date,
                  equivalent_description,
                  overall_weighted_average_rating,
                  answers: [
                    top_three_competencies_improvement.split(','),
                    top_three_competency_strengths.split(','),
                    top_three_highly_agc.split(','),
                    top_three_least_agc.split(','),
                    top_three_training_development_suggestion.split(','),
                  ],
                };
              });
            }
          )
        )
        .subscribe();
    });
  }

  handleClick(direction: string) {
    this.activatedRoute.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      const currentIdPosition = this.submittedIgcIdList.indexOf(id);
      const submittedIgcIdListLength = this.submittedIgcIdList.length;

      if (direction === 'prev' && submittedIgcIdListLength > 1) {
        const previousId = currentIdPosition - 1;
        if (previousId >= 0)
          this.routerService.navigateToViewIgcf(
            this.submittedIgcIdList[previousId]
          );
      } else if (direction === 'next' && submittedIgcIdListLength > 1) {
        const nextId = currentIdPosition + 1;

        if (nextId >= 0 && nextId <= submittedIgcIdListLength)
          this.routerService.navigateToViewIgcf(
            this.submittedIgcIdList[nextId]
          );
      }
    });
  }

  isObject(param: string | object) {
    return typeof param === 'object';
  }
  getAnswers(questionIndex: number): any[] {
    const answers = this.submittedPartTwoIgcf?.answers;
    return Array.isArray(answers) ? answers[questionIndex] : [];
  }
  getPartTwoAnswers(questionType: string) {
    return this.submittedPartTwoIgcf[0][questionType];
  }

  getKPIPerntage(kpi_title: string) {
    return this.kpiPercentagesMap.get(kpi_title);
  }
}
