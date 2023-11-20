import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { FooterComponent } from './footer/footer.component';
import { RouterModule } from '@angular/router';
import { SideToolbarComponent } from './side-toolbar/side-toolbar.component';

@NgModule({
  declarations: [
    HeaderComponent,
    SidenavComponent,
    FooterComponent,
    SideToolbarComponent,
  ],
  exports: [
    HeaderComponent,
    SidenavComponent,
    FooterComponent,
    SideToolbarComponent,
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    RouterModule,
  ],
})
export class ComponentsModule {}
