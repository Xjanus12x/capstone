import { Component, OnInit } from '@angular/core';
import { formData } from 'src/app/core/constants/formData';
import { RouterService } from '../../services/router-service.service';
import { BackendService } from 'src/app/core/services/backend.service';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { GeneratePdfService } from 'src/app/shared/services/generate-pdf.service';

@Component({
  selector: 'app-view-igcf',
  templateUrl: './view-igcf.component.html',
  styleUrls: ['./view-igcf.component.css'],
})
export class ViewIgcfComponent implements OnInit {
  tableHeaders: string[] = [];
  isLoading: boolean = false;
  partTwoQuestions!: string[];
  deadline: Date | undefined = undefined;
  kpiPercentagesMap = new Map<string, number>();
  currentYear: number = new Date().getFullYear();
  submittedIgcIdList: number[] = [];
  submittedIgcInfo: any = {};
  submittedIgcPartOne: { [key: string]: any }[] = [];
  submittedIgcPartTwo: any[] = [];
  submittedIGCF: any = {};
  submittedIGCFInputs: any[] = [];
  constructor(
    private routerService: RouterService,
    private backendService: BackendService,
    private activatedRoute: ActivatedRoute,
    private generatePdfService: GeneratePdfService
  ) {}

  ngOnInit() {
    this.partTwoQuestions = this.generatePdfService.getPartTwoQuestions();
    this.isLoading = true;
    this.submittedIgcIdList = this.routerService.getSubmittedIgcIdList();
    const { tableHeaders } = formData.partOneForm;
    this.tableHeaders = tableHeaders;

    this.activatedRoute.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.backendService.getSubmittedIGCFByID(id!).subscribe({
        next: (submittedIGCF: any) => {
          const {
            igc_inputs,
            top_three_least_agc,
            top_three_highly_agc,
            top_three_competencies_improvement,
            top_three_competency_strengths,
            top_three_training_development_suggestion,
          } = submittedIGCF;
          this.submittedIGCF = submittedIGCF;
          const answersArray = [
            top_three_least_agc,
            top_three_highly_agc,
            top_three_competencies_improvement,
            top_three_competency_strengths,
            top_three_training_development_suggestion,
          ];
          igc_inputs.forEach((input: any) => {
            const { selected_kpi, ...rest } = input;
            let found = false;
            for (let i = 0; i < this.submittedIgcPartOne.length; i++) {
              const key = Object.keys(this.submittedIgcPartOne[i])[0];
              if (selected_kpi === key) {
                const totalWeight =
                  this.kpiPercentagesMap.get(selected_kpi) || 0;
                this.kpiPercentagesMap.set(
                  selected_kpi,
                  totalWeight + Number(rest.weight)
                );
                this.submittedIgcPartOne[i][key].push({ ...rest });
                found = true;
                break;
              }
            }
            if (!found) {
              this.submittedIgcPartOne.push({
                [selected_kpi]: [{ ...rest }],
              });
              const totalWeight = this.kpiPercentagesMap.get(selected_kpi) || 0;
              this.kpiPercentagesMap.set(
                selected_kpi,
                totalWeight + Number(rest.weight)
              );
            }
          });

          this.submittedIgcPartTwo = this.partTwoQuestions.map(
            (question: string, index: number) => {
              return { question, answers: answersArray[index] };
            }
          );
          // igc_inputs.forEach((igc: any) => {
          //   if (!this.submittedIGCFInputs.includes(igc.selected_kpi))
          //     this.submittedIGCFInputs.push(igc.selected_kpi);
          //   const totalWeight =
          //     this.kpiPercentagesMap.get(igc.selected_kpi) || 0;
          //   this.kpiPercentagesMap.set(
          //     igc.selected_kpi,
          //     totalWeight + Number(igc.weight)
          //   );
          //   this.submittedIGCFInputs.push(igc);
          // });
        },
        error: () => {},
        complete: () => {
          this.isLoading = false;
        },
      });
    });
  }

  handleClick(direction: string) {
    // this.activatedRoute.paramMap.subscribe((params) => {
    //   const id = Number(params.get('id'));
    //   const currentIdPosition = this.submittedIgcIdList.indexOf(id);
    //   const submittedIgcIdListLength = this.submittedIgcIdList.length;
    //   if (direction === 'prev' && submittedIgcIdListLength > 1) {
    //     const previousId = currentIdPosition - 1;
    //     if (previousId >= 0)
    //       this.routerService.navigateToViewIgcf(
    //         this.submittedIgcIdList[previousId]
    //       );
    //   } else if (direction === 'next' && submittedIgcIdListLength > 1) {
    //     const nextId = currentIdPosition + 1;
    //     if (nextId >= 0 && nextId <= submittedIgcIdListLength)
    //       this.routerService.navigateToViewIgcf(
    //         this.submittedIgcIdList[nextId]
    //       );
    //   }
    // });
  }

  getKPIPerntage(kpi_title: string) {
    return this.kpiPercentagesMap.get(kpi_title);
  }

  generatePDF() {
    const copiedIGCF = JSON.parse(JSON.stringify(this.submittedIGCF)); // Deep copy of submittedIGCF
    this.generatePdfService.generateSinglePagePDF(copiedIGCF);
  }
}
