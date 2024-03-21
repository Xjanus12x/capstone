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
    'actionPlan',
    'target',
    'timeFrame',
    'responsible',
  ];
  kpiAndActionPlans: any[] = [];
  // actionPlan: 'asdffadsadfs';
  // responsible: 'Dean,Chair';
  // target: '>=22 (03-21-2024 to 04-20-2024)';
  // timeFrame: '03-21-2026 - 03-28-2026';
  // title: 'fdsadfsdfas';
  ngOnInit() {
    this.kpiAndActionPlans = this.data.map((data: any) => {
      const { title, actionPlan, target, timeFrame, responsible } = data;
      return {
        title,
        kpiAndActionPlans: {
          actionPlan,
          target,
          timeFrame,
          responsible,
        },
      };
    });
    console.log(this.kpiAndActionPlans);
  }
}
