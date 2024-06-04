import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatAccordion } from '@angular/material/expansion';
import { IPendingUser } from 'src/app/core/models/PendingUser';

@Component({
  selector: 'app-review-kpis',
  templateUrl: './review-kpis.component.html',
  styleUrls: ['./review-kpis.component.css'],
})
export class ReviewKpisComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
  @ViewChild(MatAccordion) accordion!: MatAccordion;
  displayedColumns: string[] = [
    'plan',
    'target',
    'startDateFormatted',
    'dueDateFormatted',
    'responsibles',
  ];
  kpiAndActionPlans: any[] = [];
  // ngOnInit() {
  //   // Group action plans by KPI title
  //   const kpiMap = new Map<string, any[]>();
  //   this.data.forEach((data: any) => {
  //     const kpiTitle = data.kpi_title;
  //     const plan = data.plan;
  //     const targets = data.targets;
  //     const startDateFormatted = data.startDateFormatted;
  //     const dueDateFormatted = data.dueDateFormatted;
  //     const responsible = data.responsible;

  //     // Create a new entry in the map if the KPI title is not already present
  //     if (!kpiMap.has(kpiTitle)) {
  //       kpiMap.set(kpiTitle, []);
  //     }

  //     // Push the action plan to the corresponding KPI title in the map
  //     kpiMap.get(kpiTitle)?.push({
  //       plan,
  //       target: targets.toString(),
  //       startDateFormatted,
  //       dueDateFormatted,
  //       responsibles: responsible.join(','),
  //     });
  //   });

  //   // Convert the map to an array of objects
  //   this.kpiAndActionPlans = Array.from(kpiMap).map(
  //     ([kpiTitle, actionPlans]) => ({
  //       kpi_title: kpiTitle,
  //       kpiAndActionPlans: actionPlans,
  //     })
  //   );
  // }
  uniqueKpis: any[] = [];
  ngOnInit() {
    const kpiMap = new Map<string, any[]>();
    this.data.forEach((data: any) => {
      const kpiTitle = data.kpi_title;
      const plan = data.plan;
      const targets = data.targets;
      const startDateFormatted = data.startDateFormatted;
      const dueDateFormatted = data.dueDateFormatted;
      const responsible = data.responsible;

      if (!kpiMap.has(kpiTitle)) {
        kpiMap.set(kpiTitle, []);
      }
      const targetsArray = Object.keys(targets).map(
        (year) => `${year}=>${targets[year]}`
      );
      const target = kpiMap.get(kpiTitle)?.push({
        plan,
        target: targetsArray,
        startDateFormatted,
        dueDateFormatted,
        responsibles: responsible.join(','),
      });
    });

    this.uniqueKpis = Array.from(kpiMap).map(([kpiTitle, actionPlans]) => ({
      kpi_title: kpiTitle,
      kpiAndActionPlans: actionPlans,
    }));
  }

  // ngOnInit() {
  //   // dept
  //   // dueDateFormatted

  //   // kpi_title
  //   // plan
  //   // responsibleArray(2)
  //   // startDateFormatted
  //   // targets

  //   // 2024
  //   // :
  //   // "1"
  //   // 2025
  //   // :
  //   // "2"
  //   // 2026
  //   // :
  //   // "3"
  //   // 2027
  //   // :
  //   // "4"
  //   // 2028
  //   // :
  //   // "5"

  //   this.kpiAndActionPlans = this.data.map((data: any) => {
  //     // dept

  //     // responsibleArray(2)

  //     const {
  //       kpi_title,
  //       plan,
  //       targets,
  //       startDateFormatted,
  //       dueDateFormatted,
  //       dept,
  //       responsible,
  //     } = data;
  //     return {
  //       kpi_title,
  //       kpiAndActionPlans: {
  //         plan,
  //         target: targets.toString(),
  //         startDateFormatted,
  //         dueDateFormatted,
  //         responsibles: responsible.join(','),
  //       },
  //     };
  //   });
  //   console.log(this.data);
  // }
}
