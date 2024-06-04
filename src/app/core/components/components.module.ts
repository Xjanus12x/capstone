import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { FooterComponent } from './footer/footer.component';
import { RouterModule } from '@angular/router';
import { MatTreeModule } from '@angular/material/tree';
import { SharedModule } from 'src/app/shared/shared.module';

import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { CalendarComponent } from './calendar/calendar.component';
import { ProfilePageComponent } from './profile-page/profile-page.component';
@NgModule({
  declarations: [
    HeaderComponent,
    SidenavComponent,
    FooterComponent,
    CalendarComponent,
    ProfilePageComponent,
  ],
  exports: [HeaderComponent, SidenavComponent, FooterComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    RouterModule,
    MatTreeModule,
    SharedModule,
    MatInputModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatDialogModule,
    MatButtonModule,
    FormsModule,
    MatMenuModule,
    MatCardModule,
  ],
})
export class ComponentsModule {}
