import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-submitted-form',
  templateUrl: './submitted-form.component.html',
  styleUrls: ['./submitted-form.component.css'],
})
export class SubmittedFormComponent {
  @Input() id!: number;
  @Input() name!: string;
  @Input() isSigned!: boolean;

}
