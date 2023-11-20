import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren,
} from '@angular/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements AfterViewInit {
  @ViewChild('form') form!: ElementRef;

  constructor(private renderer2: Renderer2) {}
  currentIndex: number = 0;
  formSteps: ElementRef[] = [];
  ngAfterViewInit(): void {
    this.formSteps = [...this.form.nativeElement.children];
  }
  handleFormEvent(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const previousIndex = this.currentIndex;
    const currentStep = this.formSteps[this.currentIndex];
    const previousStep = this.formSteps[previousIndex];

    if (target.id === 'next' || target.id === 'previous') {
      if (this.currentIndex > this.formSteps.length) return;

      if (target.id === 'previous') {
        this.currentIndex--;
      } else if (target.id === 'next') {
        this.currentIndex++;
      }
    }
  }
}
