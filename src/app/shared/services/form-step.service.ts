import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FormStepService {
  constructor() {}
  SOC: any[] = [
    {
      title: 'Student Services',
      labels: ['1', '2'],
      numberOfInputs: 2,
    },
    {
      title: 'Community',
      labels: ['1', '2'],
      numberOfInputs: 2,
    },
    {
      title: 'Workforce Leadership',
      labels: ['1'],
      numberOfInputs: 1,
    },
    {
      title: 'Quality Assurance',
      labels: ['1', '2', '3'],
      numberOfInputs: 3,
    },
    {
      title: 'Research',
      labels: ['1'],
      numberOfInputs: 1,
    },
  ];
}
