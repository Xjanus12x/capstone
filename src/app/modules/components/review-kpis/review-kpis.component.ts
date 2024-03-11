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
  displayedColumns: string[] = ['plan', 'weight', 'responsible'];

  ngOnInit() {
    // this.kpi =;
    console.log(this.data);
  }
}
