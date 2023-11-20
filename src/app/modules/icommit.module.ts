import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagesModule } from './pages/pages.module';

@NgModule({
  declarations: [],
  imports: [CommonModule, PagesModule],
  exports: [PagesModule],
})
export class IcommitModule {}
