import { Component } from '@angular/core';

@Component({
  selector: 'app-submitted-form',
  templateUrl: './submitted-form.component.html',
  styleUrls: ['./submitted-form.component.css'],
})
export class SubmittedFormComponent {
  temp: any[] = [
    {
      id: 1,
      name: 'data1',
    },

    {
      id: 2,
      name: 'data2',
    },

    {
      id: 3,
      name: 'data3',
    },
  ];
}
