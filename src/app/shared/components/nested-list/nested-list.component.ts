import { Component, Input, OnInit } from '@angular/core';
import {  Router } from '@angular/router';
import { NavItem } from 'src/app/core/models/NavItems';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-nested-list',
  templateUrl: './nested-list.component.html',
  styleUrls: ['./nested-list.component.css'],
})
export class NestedListComponent implements OnInit {
  @Input() items: NavItem[] = [];
  role: string = '';
  toggleItem(item: NavItem): void {
    item.collapsed = !item.collapsed;
  }
  constructor(
    private authService: AuthService,
  ) {}
  ngOnInit(): void {
    this.authService.userRole$.subscribe((role: string) => {
      this.role = role;
    });
  }
  getRouterLink(item: NavItem): any {
    if (item.outlet) return [{ outlets: { [item.outlet!]: [item.link!] } }];
    return [item.link];
  }
  toggleCollapse(item: any): void {
    item.collapsed = !item.collapsed;
  }
}
