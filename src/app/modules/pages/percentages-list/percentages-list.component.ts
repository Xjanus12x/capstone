import { SelectionModel } from '@angular/cdk/collections';
import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { BackendService } from 'src/app/core/services/backend.service';
import { UpdateUserComponent } from '../../components/update-user/update-user.component';
import { IPercentagesList } from 'src/app/core/models/PercentagesList';
import { PartOneFormComponent } from 'src/app/shared/components/part-one-form/part-one-form.component';
import { FormContentService } from 'src/app/shared/services/form-content.service';
import { formData } from 'src/app/core/constants/formData';

@Component({
  selector: 'app-percentages-list',
  templateUrl: './percentages-list.component.html',
  styleUrls: ['./percentages-list.component.css'],
})
export class PercentagesListComponent {
  constructor(
    private backendService: BackendService,
    private authService: AuthService,
    public dialog: MatDialog,
    private formContentService: FormContentService
  ) {}
  percentagesList$!: Observable<IPercentagesList[]>;
  dataToDisplay: IPercentagesList[] = [];
  selection = new SelectionModel<any>(true, []);
  dataSource = new MatTableDataSource<any>();
  displayedHeader: string[] = [
    'Title',
    'Accomplishment %',
    'Individual Goal Commitment %',
    'Set Weight %',
  ];

  displayedColumns: string[] = [
    'title',
    'set_accomplishment_%',
    'set_individual_goal_commitment_%',
    'set_weight_%',
  ];
  userRole$!: Observable<string>;
  isLoadingResults = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.userRole$ = this.authService.getUserRole();
    this.loadData();
  }

  loadData() {
    this.isLoadingResults = true;
    this.authService.getEmployeeDepartment().subscribe({
      next: (deptName) => {
        this.percentagesList$ =
          this.backendService.getIgcfPercentages(deptName);
        this.handleDataSubscription();
      },
    });
  }

  handleDataSubscription() {
    this.percentagesList$.subscribe({
      next: (data: IPercentagesList[]) => {
        this.dataToDisplay = data;
        this.updateDataSource();
      },
      error: (error) => {
        this.handleError(error);
      },
    });
  }

  updateDataSource() {
    this.dataSource = new MatTableDataSource(this.dataToDisplay);
    this.dataSource.paginator = this.paginator; // Set paginator after data is loaded
    this.dataSource.sort = this.sort;
    this.isLoadingResults = false;
  }

  handleError(error: any) {
    console.error('Error:', error);
    // Handle error here (e.g., display error message)
  }

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

  deleteUser(id: number) {
    const indexToRemove = this.dataToDisplay.findIndex(
      (item) => item.id === id
    );
    // // If the item is found, remove it from the array
    if (indexToRemove === -1) return;
    console.log(indexToRemove);

    this.backendService.deleteIgcfInformation(id).subscribe({
      next: () => {
        this.dataToDisplay.splice(indexToRemove, 1);
        this.dataSource.data = this.dataToDisplay;
        this.authService.openSnackBar(
          'Row deleted successfully',
          'Close',
          'bottom'
        );
        // Optionally, update your component state or UI after deletion
      },
      error: (error) => {
        this.authService.openSnackBar(
          'Error deleting row: ' + error.message,
          'Close',
          'bottom'
        );
        // Optionally, handle the error or display an error message to the user
      },
    });
  }

  previewForm(element: IPercentagesList) {
    this.formContentService.setIgcfInformation({
      weightPercentages: element['set_weight_%'],
      individualGoalCommitmentPercentages:
        element['set_individual_goal_commitment_%'],
      accomplishmentPercentages: element['set_accomplishment_%'],
    });
    const setWeightPercentages: string[] = this.formContentService
      .getIgcfInformation()
      ['weightPercentages'].split(',');
    const setIgcPercentages: string[] = this.formContentService
      .getIgcfInformation()
      ['individualGoalCommitmentPercentages'].split(',');
    const setAccomplishmentPercentages: string[] = this.formContentService
      .getIgcfInformation()
      ['accomplishmentPercentages'].split(',');
    const percentages: string[][] =
      this.formContentService.mapSelectedPercentages(
        setWeightPercentages,
        setIgcPercentages,
        setAccomplishmentPercentages
      );

    const {
      controlNames,
      tableHeaders,
      tableRows,
      stepLabel,
      groupCounts,
      formArrayNames,
    } = formData.partOneForm;
    this.formContentService.setIgcfContent({
      controlNames: controlNames,
      headers: tableHeaders,
      tableRows: tableRows,
      stepLabel: stepLabel,
      groupCounts: groupCounts,
      formArrayNames: formArrayNames,
      percentages: percentages,
    });
    this.dialog.open(PartOneFormComponent);
  }
}
