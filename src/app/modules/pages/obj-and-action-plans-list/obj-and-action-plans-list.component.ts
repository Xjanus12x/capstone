import { SelectionModel } from '@angular/cdk/collections';
import { Component, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { BackendService } from 'src/app/core/services/backend.service';
import { UpdateObjAndPlansComponent } from '../../components/update-obj-and-plans/update-obj-and-plans.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-obj-and-action-plans-list',
  templateUrl: './obj-and-action-plans-list.component.html',
  styleUrls: ['./obj-and-action-plans-list.component.css'],
})
export class ObjAndActionPlansListComponent {
  constructor(
    private backendService: BackendService,
    private authService: AuthService,
    public dialog: MatDialog,
    private datePipe: DatePipe
  ) {}
  objAndActionPlans$!: Observable<any>;
  dataToDisplay: any[] = [];
  selection = new SelectionModel<any>(true, []);
  dataSource = new MatTableDataSource<any>();

  displayedHeader: string[] = [
    'Objective Title',
    'Action PLan',
    'Start Date',
    'Due Date',
    'Target',
    'Responsibles',
  ];
  displayedColumns: string[] = [
    'kpi_title',
    'plan',
    'startDateFormatted',
    'dueDateFormatted',
    'target',
    'responsible',
  ];
  responsibles: string[] = [
    'Dean',
    'Chair',
    'Faculty',
    'CEB',
    'Organizations',
    'Lab',
    'Staff',
    'GPC',
    'OBE Facilitator',
    'Practicum',
    'Coor',
  ];
  currentUserEmpNumber: string = '';
  currentUserDept: string = '';
  targetsObj: any = {};
  targetYears: string[] = [];
  originalData: any[] = [];
  isLoading = false;
  filterByYearControl = new FormControl('');
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.currentUserDept =
      this.authService.getUserInformationFirebase().department;
    // Inside a method where you initialize your component or when you fetch the data
    this.loadData();
  }

  loadData() {
    const objectivesAndActionPlans: any[] =
      this.backendService.getAllObjectiveAndActionPlansByDept();
    if (objectivesAndActionPlans) {
      const currentYear: string = new Date().getFullYear().toString();
      let found = false;
      objectivesAndActionPlans.forEach((objAndPlan: any) => {
        const years: string[] = Object.keys(objAndPlan.targets);
        if (years.toString() !== this.targetYears.toString()) {
          const uniqueYears = Array.from(
            new Set([...years, ...this.targetYears])
          );
          this.targetYears = uniqueYears;
        }
        if (!found) {
          this.targetYears.push(...years);
          found = true;
        }
      });
      const currentTargetYearIndex: number =
        this.targetYears.indexOf(currentYear);
      this.filterByYearControl.setValue(
        this.targetYears[currentTargetYearIndex]
      );
      const modifiedData = objectivesAndActionPlans.map((data: any) => {
        const { targets } = data;
        return {
          ...data,
          target: targets[this.targetYears[currentTargetYearIndex]],
        };
      });
      this.originalData = objectivesAndActionPlans;
      this.dataToDisplay = modifiedData;
      this.dataSource.data = this.dataToDisplay;
      this.isLoading = false;
    } else {
      this.originalData = [];
      this.dataToDisplay = [];
      this.dataSource.data = [];
      this.isLoading = false;
    }
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator; // Set paginator after data is loaded
    this.dataSource.sort = this.sort;
  }
  // updateDataSource() {
  //   this.dataSource = new MatTableDataSource(this.dataToDisplay);
  // }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  concatColumns(...additionalColumns: string[]) {
    return this.displayedColumns.concat(additionalColumns);
  }

  deleteKPIAndActionPlan(id: number) {
    const indexToRemove = this.dataToDisplay.findIndex(
      (item: any) => item.id === id
    );
    if (indexToRemove === -1) return;
    // If the item is found, remove
    this.dataToDisplay.splice(indexToRemove, 1);
    this.dataSource.data = this.dataToDisplay;
    this.backendService.deleteKPIAndActionPlan(id).subscribe({
      next: () => {
        this.authService.openSnackBar(
          'KPI deleted successfully',
          'Close',
          'bottom'
        );
      },
    });
  }
  getYearTarget(targets: any, selectedYear: string) {
    return targets[selectedYear];
  }
  // rejectUser(id: number) {
  //   const indexToRemove = this.dataToDisplay.findIndex(
  //     (item) => item.id === id
  //   );

  //   // If the item is found, remove it from the array
  //   if (indexToRemove === -1) return;
  //   this.backendService.deletePendingUser(id).subscribe({
  //     next: () => {
  //       this.dataToDisplay.splice(indexToRemove, 1);
  //       this.dataSource.data = this.dataToDisplay;
  //       this.authService.openSnackBar(
  //         'Row deleted successfully',
  //         'Close',
  //         'bottom'
  //       );
  //       // Optionally, update your component state or UI after deletion
  //     },
  //     error: (error) => {
  //       this.authService.openSnackBar(
  //         'Error deleting row: ' + error.message,
  //         'Close',
  //         'bottom'
  //       );
  //       // Optionally, handle the error or display an error message to the user
  //     },
  //   });
  // }
  // acceptUser(element: IPendingUser) {
  //   this.backendService.acceptPendingUser(element).subscribe({
  //     next: () => {
  //       this.authService.openSnackBar(
  //         'Pending user accepted successfully',
  //         'Close',
  //         'bottom'
  //       );
  //       const id = element.id;
  //       const indexToRemove = this.dataToDisplay.findIndex(
  //         (item) => item.id === id
  //       );
  //       // If the item is found, remove it from the array
  //       if (indexToRemove === -1) return;
  //       this.backendService.deletePendingUser(id!).subscribe({
  //         next: () => {
  //           this.dataToDisplay.splice(indexToRemove, 1);
  //           this.dataSource.data = this.dataToDisplay;
  //           this.updateDataSource();
  //         },
  //       });
  //     },
  //     error: (error) => this.handleError(error),
  //   });
  // }

  // updateUser(pendingUser: IPendingUser) {
  //   const dialogRef = this.dialog.open(UpdatePendingUserComponent, {
  //     data: pendingUser,
  //   });

  //   dialogRef.afterClosed().subscribe((result) => {
  //     if (!result) return;
  //     if (result.invalid) {
  //       this.authService.openSnackBar('Invalid inputs', 'Close', 'bottom');
  //       return;
  //     }

  //     const orginalData = [
  //       pendingUser.emp_firstname,
  //       pendingUser.emp_lastname,
  //       pendingUser.emp_number,
  //       pendingUser.role,
  //       pendingUser.emp_dept,
  //       pendingUser.emp_position,
  //     ].join(',');

  //     const updateData = Object.values(result.value).join(',');

  //     if (orginalData === updateData) {
  //       this.authService.openSnackBar('No changes made', 'Close', 'bottom');
  //       return;
  //     }
  //     const id = pendingUser.id;
  //     const updatedPendingUserInfo = { id, ...result.value };

  //     this.backendService.updatePendingUser(updatedPendingUserInfo).subscribe({
  //       next: () => {
  //         this.authService.openSnackBar(
  //           `Pengind user successfully updated`,
  //           'close',
  //           'bottom'
  //         );
  //         this.handleDataSubscription();
  //       },
  //     });
  //   });
  // }

  filterSubmittedIgcfByYear(year: string) {
    this.isLoading = true;
    const selectedYear = year;

    this.dataToDisplay = this.originalData
      .filter((data: any) => {
        const { targets } = data;
        return targets.hasOwnProperty(selectedYear);
      })
      .map((filteredData: any) => {
        return {
          ...filteredData,
          target: filteredData.targets[selectedYear],
        };
      });
    this.dataSource.data = this.dataToDisplay;
    this.isLoading = false;
  }

  // filterByResponsibleControl = new FormControl('');
  // filterSubmittedIgcfByResponsible() {
  //   if (this.filterByResponsibleControl.value !== 'none') {
  //     this.dataToDisplay = this.originalData
  //       .map((data: any) => {
  //         const { targets, ...rest } = data;
  //         return {
  //           ...rest,
  //           target:
  //             data.targets[
  //               this.filterByYearControl.value || this.targetYears[0]
  //             ],
  //         };
  //       })
  //       .filter((igcf: any) =>
  //         igcf.responsible.includes(this.filterByResponsibleControl.value)
  //       );
  //     this.dataSource.data = this.dataToDisplay;
  //     return;
  //   } else if (this.filterByResponsibleControl.value === 'none') {
  //     this.dataSource.data = this.originalData.map((data: any) => {
  //       const { targets, ...rest } = data;
  //       return {
  //         ...rest,
  //         target:
  //           data.targets[this.filterByYearControl.value || this.targetYears[0]],
  //       };
  //     });
  //     return;
  //   }
  // }

  update(element: any) {
    this.isLoading = true;
    const { startDateFormatted, dueDateFormatted } = element;
    const modifiedOrinalData = {
      ...element,
      startDateFormatted: this.datePipe.transform(startDateFormatted, 'MMMM d'),
      dueDateFormatted: this.datePipe.transform(dueDateFormatted, 'MMMM d'),
    };
    const dialogRef = this.dialog.open(UpdateObjAndPlansComponent, {
      width: '700px',
      enterAnimationDuration: '200ms',
      exitAnimationDuration: '400ms',
      data: modifiedOrinalData,
    });
    dialogRef.afterClosed().subscribe({
      next: (data) => {
        if (data) {
          const {
            targets,
            dept,
            kpi_title,
            plan,
            responsible,
            startDateFormatted,
            dueDateFormatted,
          } = modifiedOrinalData;
          const orignalPlan = plan;
          const strigyfyTargets = JSON.stringify(targets);
          const originalValues = {
            kpi_title: kpi_title,
            plan: plan,
            startDateFormatted,
            dueDateFormatted,
            responsible: responsible,
            targets: strigyfyTargets,
            dept: dept,
          };

          const strigyfyUpdatedTargets = JSON.stringify(data.targets);

          const updatedData = {
            kpi_title: data.kpi_title,
            plan: data.plan,
            startDateFormatted: data.start_date,
            dueDateFormatted: data.due_date,
            responsible: data.responsible,
            targets: strigyfyUpdatedTargets,
            dept: data.dept,
          };
          if (JSON.stringify(originalValues) === JSON.stringify(updatedData)) {
            this.authService.openSnackBar(
              'No changes made.',
              'Close',
              'bottom'
            );
            this.isLoading = false;
          } else {
            const { firstname, lastname, department, role } =
              this.authService.getUserInformationFirebase();
            this.backendService
              .updateObjectiveAndActionPlans(
                orignalPlan,
                department,
                updatedData
              )
              .subscribe({
                next: () => {
                  this.backendService
                    .fetchAllObjectivesAndActionPlansByDept(dept)
                    .subscribe({
                      next: (data) => {
                        this.backendService.setAllObjectiveAndActionPlansByDept(
                          data
                        );
                        const currentYear: string = new Date()
                          .getFullYear()
                          .toString();
                        let found = false;
                        data.forEach((objAndPlan: any) => {
                          const years: string[] = Object.keys(
                            objAndPlan.targets
                          );
                          if (
                            years.toString() !== this.targetYears.toString()
                          ) {
                            const uniqueYears = Array.from(
                              new Set([...years, ...this.targetYears])
                            );
                            this.targetYears = uniqueYears;
                          }
                          if (!found) {
                            this.targetYears.push(...years);
                            found = true;
                          }
                        });
                        const currentTargetYearIndex: number =
                          this.targetYears.indexOf(currentYear);
                        this.filterByYearControl.setValue(
                          this.targetYears[currentTargetYearIndex]
                        );
                        const modifiedData = data.map((data: any) => {
                          const { targets } = data;
                          return {
                            ...data,
                            target:
                              targets[this.targetYears[currentTargetYearIndex]],
                          };
                        });
                        this.originalData = data;
                        this.dataToDisplay = modifiedData;
                        this.dataSource.data = this.dataToDisplay;

                        const fullname =
                          `${firstname} ${lastname}`.toUpperCase();
                        const message = `${fullname} has updated the "${originalValues.kpi_title}" objective.`;
                        const timeStamp = this.datePipe.transform(
                          new Date(),
                          'yyyy-MM-dd'
                        );
                        this.backendService.addLog({
                          message,
                          timestamp: timeStamp,
                          department: department,
                          type: 'updated-objectives'
                        });
                      },
                      error: () => {
                        this.backendService.setAllObjectiveAndActionPlansByDept(
                          []
                        );
                      },
                      complete: () => {
                        this.isLoading = false;
                      },
                    });
                },
              });
          }
        } else this.isLoading = false;
      },
    });
  }
}
