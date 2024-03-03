import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentsModule } from './components/components.module';
import { MatSnackBarModule } from '@angular/material/snack-bar';
@NgModule({
  declarations: [],
  exports: [ComponentsModule],
  imports: [CommonModule, ComponentsModule, MatSnackBarModule],
})
export class CoreModule {}
