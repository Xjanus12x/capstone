import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-igcf-form-header',
  templateUrl: './igcf-form-header.component.html',
  styleUrls: ['./igcf-form-header.component.css'],
})
export class IgcfFormHeaderComponent {
  @Input() headers: string[] = [];
  @Input() rows: string[][] = [];
}
