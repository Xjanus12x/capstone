import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AuthService } from 'src/app/core/services/auth.service';
import { BackendService } from 'src/app/core/services/backend.service';

@Component({
  selector: 'app-audit-trail',
  templateUrl: './audit-trail.component.html',
  styleUrls: ['./audit-trail.component.css'],
})
export class AuditTrailComponent implements OnInit, AfterViewInit {
  isLoading!: boolean;
  displayedHeader: string[] = ['Message', 'Time stamp'];
  displayedColumns: string[] = ['message', 'timestamp'];
  logTypes: string[] = [
    'accepted-users',
    'completed-ratings',
    'create-objectives',
    'deleted-igc',
    'deleted-users',
    'rejected-users',
    'submitted-igcs',
    'updated-objectives',
    'updated-pending-users',
  ];

  dataSource = new MatTableDataSource<any>();
  originalData!: any[];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  constructor(
    private backendService: BackendService,
    private authService: AuthService
  ) {}
  ngOnInit(): void {
    this.isLoading = true;
    const department = this.authService.getUserInformationFirebase().department;
    this.backendService.fetchLogs(department).subscribe({
      next: (data: any[]) => {
        this.originalData = data;
        this.dataSource.data = this.originalData;
      },
      error: (error) => {
        this.dataSource.data = [];
        this.originalData = [];
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  // filterSubmittedIgcf(filterType: string) {
  //   if (this.originalData.length === 0)
  //     this.authService.openSnackBar(
  //       'There is no data available for filtering at the moment.',
  //       'close',
  //       'bottom'
  //     );
  //   if (filterType === 'none') this.dataSource.data = this.originalData;
  //   const filteredData = this.originalData.filter(
  //     (data: any) => data.type === filterType
  //   );
  //   // // Convert date to number
  //   // const selectedYear = Number(filterType);
  //   // if (isNaN(selectedYear)) {
  //   //   this.dataSource.data = this.originalSubmissionHistory;
  //   //   return;
  //   // }
  //   // // console.log(this.dataToDisplay);
  //   // const result = this.originalSubmissionHistory.filter(
  //   //   (submissionHistory) => {
  //   //     const yearSigned = new Date(
  //   //       submissionHistory.completion_date
  //   //     ).getFullYear();
  //   //     return yearSigned === selectedYear;
  //   //   }
  //   // );
  //   // this.dataSource.data = result;
  // }
  filterSubmittedIgcf(filterType: string) {
    if (this.originalData.length === 0) {
      this.authService.openSnackBar(
        'There is no data available for filtering at the moment.',
        'close',
        'bottom'
      );
      return;
    }

    if (filterType === 'none') {
      this.dataSource.data = this.originalData;
      return;
    }

    const filteredData = this.originalData.filter(
      (data: any) => data.type === filterType
    );

    console.log('Filtered Data:', filteredData); // Log filtered data to see if it's correct

    if (filteredData.length === 0) {
      this.authService.openSnackBar(
        `No data found for filter type "${filterType}".`,
        'close',
        'bottom'
      );
    }

    this.dataSource.data = filteredData;
  }
}
