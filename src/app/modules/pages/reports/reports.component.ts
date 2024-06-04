import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { BackendService } from 'src/app/core/services/backend.service';
import { ISubmittedIGCF } from 'src/app/core/models/SubmittedIgcf';
import { formData } from 'src/app/core/constants/formData';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatAccordion } from '@angular/material/expansion';
import { FormControl } from '@angular/forms';
import { GeneratePdfService } from 'src/app/shared/services/generate-pdf.service';
import * as pdfMake from 'pdfmake/build/pdfmake';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
})
export class ReportsComponent implements OnInit, AfterViewInit {
  constructor(
    private backendService: BackendService,
    private authService: AuthService,

    private generatePDFService: GeneratePdfService
  ) {}

  isLoadingResults: boolean = false;
  numberOfSubmissions: number = 0;
  submittedIgcf: ISubmittedIGCF[] = [];
  partTwoQuestions: string[] = [
    'a.	Top three least accomplished goal commitments',
    'b.	Top three highly accomplished goal commitments',
    'c.	Top three competencies that need improvement',
    'd.	Top three competency strengths',
    'e.	Top three training and development suggestions based on previous items',
  ];
  arrayNames: string[] = [];
  groupCounts: number[] = [];
  stepLabel: string[] = [];
  signedCount: number = 0;
  notSignedCount: number = 0;
  role: string = '';
  dept: string = '';
  signedCountMap = new Map<string, number>();
  notSignedCountMap = new Map<string, number>();
  deadlineYears: any[] = [];
  originalSubmissionHistory: any[] = [];

  mapNumbersBaseOnSubmittedIGCFs = new Map<string, number>([
    ['numberOfDoneRatingIGCFs', 0],
    ['numberOfSubmittedIGCFs', 0],
  ]);
  overallAverageDescriptionMap = new Map<string, number>();
  displayedHeaderForSubmissionHistory: string[] = [
    'Fullname',
    'Employee Number',
    'Position',
    'Department',
    'Completion Date',
  ];
  displayedColumnsForSubmissionHistory: string[] = [
    'fullname',
    'emp_number',
    'position',
    'department',
    'completion_date',
  ];
  displayedHeaderForNotRatedIgcf: string[] = [
    'Fullname',
    'Employee Number',
    'Position',
    'Department',
    'Completion Date',
    'Rated On',
  ];

  displayedColumnsForNotRatedIgcf: string[] = [
    'fullname',
    'emp_number',
    'position',
    'department',
    'completion_date',
    'rate_date',
  ];

  displayedHeaderForDeliveredAgreedIgc: string[] = [
    'Fullname',
    'Employee Number',
    'Position',
    'Department',
    'Overall Weighted Average Rating',
    'Completion Date',
    'Rated On',
  ];
  displayedColumnsForDeliveredAgreedIgc: string[] = [
    'fullname',
    'emp_number',
    'position',
    'department',
    'overall_weighted_average_rating',
    'completion_date',
    'rate_date',
  ];

  generatePdfCtrl = new FormControl('');
  pdfList: string[] = [
    'Submitted IGCFs Hard Copy',
    'List of employees who submitted IGCFs',
    'Pending List to be rated IGCFs',
    'Partially delivered agreed individual goal commitment IGCF employees list',
    'Delivered agreed individual goal commitment IGCF employees list',
    'Exceeded or Delivered beyond individual goal commitment IGCF employees list',
  ];

  submittedIGCFs: any[] = [];
  filteredSubmissionHistory: any[] = [];
  currentDate: Date = new Date();
  dataToDisplay: any[] = [];
  originalSubmittedIGCFs: any[] = [];
  selection = new SelectionModel<any>(true, []);
  dataSourceForSubmissionHistory = new MatTableDataSource<any>([]);
  dataSourceForRatedIgcf = new MatTableDataSource<any>([]);
  dataSourceForFailedDeliveredAgreedIgc = new MatTableDataSource<any>([]);
  dataSourceForPartiallyDeliveredAgreedIgc = new MatTableDataSource<any>([]);
  dataSourceForDeliveredAgreedIgc = new MatTableDataSource<any>([]);
  dataSourceForExceededOrDeliveredAgreedIgc = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatAccordion) accordion!: MatAccordion;

  ngOnInit(): void {
    const { role, department } = this.authService.getUserInformationFirebase();
    const { formArrayNames, groupCounts, stepLabel } = formData.partOneForm;
    this.arrayNames = formArrayNames;
    this.groupCounts = groupCounts;
    this.stepLabel = stepLabel;
    this.dept = department;

    // getSubmittedIGCFsFirebase

    this.backendService
      .getSubmittedIGCFsFirebase(role, 'department', department)
      .subscribe({
        next: (data: any[]) => {
          this.submittedIGCFs = data;
          this.originalSubmittedIGCFs = data;
          const modifiedData = data.map((data: any) => {
            const {
              fullname,
              emp_number,
              position,
              department,
              completion_date,
              rate_date,
            } = data;

            return {
              fullname,
              emp_number,
              position,
              department,
              completion_date,
              rate_date,
            };
          });

          this.deadlineYears = this.extractYears(modifiedData);
          const filterCurrentYearOfIGCFs = modifiedData.filter(
            (igcf: any) =>
              new Date(igcf.completion_date).getFullYear() ===
              new Date().getFullYear()
          );
          const filterRatedIGCFs = filterCurrentYearOfIGCFs.filter(
            (submission: any) => submission.rate_date
          );

          this.mapNumbersBaseOnSubmittedIGCFs.set(
            'numberOfSubmittedIGCFs',
            filterCurrentYearOfIGCFs.length
          );

          this.mapNumbersBaseOnSubmittedIGCFs.set(
            'numberOfDoneRatingIGCFs',
            filterRatedIGCFs.length
          );
          this.dataSourceForSubmissionHistory.data = filterCurrentYearOfIGCFs;
          this.dataSourceForRatedIgcf.data = filterRatedIGCFs;

          const filteredFailedDeliveredAgreedIgc =
            this.filterDataBaseOnEquivalentDescription(
              this.submittedIGCFs,
              'Failed to deliver agreed individual goal commitment'
            );

          const filteredPartiallyDeliveredAgreedIgc =
            this.filterDataBaseOnEquivalentDescription(
              this.submittedIGCFs,
              'Partially delivered agreed individual goal commitment'
            );
          const filterDeliveredAgreedIgc =
            this.filterDataBaseOnEquivalentDescription(
              this.submittedIGCFs,
              'Delivered agreed individual goal commitment'
            );
          const filterExceededOrDeliveredIgc =
            this.filterDataBaseOnEquivalentDescription(
              this.submittedIGCFs,
              'Exceeded or Delivered beyond individual goal commitment'
            );
          this.overallAverageDescriptionMap = this.mapEquivalentDescription(
            this.submittedIGCFs
          );
          this.dataSourceForFailedDeliveredAgreedIgc.data =
            filteredFailedDeliveredAgreedIgc;
          this.dataSourceForPartiallyDeliveredAgreedIgc.data =
            filteredPartiallyDeliveredAgreedIgc;
          this.dataSourceForDeliveredAgreedIgc.data = filterDeliveredAgreedIgc;
          this.dataSourceForExceededOrDeliveredAgreedIgc.data =
            filterExceededOrDeliveredIgc;
        },
      });
  }

  filterDataBaseOnEquivalentDescription(data: any[], description: string) {
    return data.filter(
      (data: any) =>
        data.equivalent_description === description && data.rate_date
    );
  }

  filterDataToCurrentYear(data: any[]) {
    return data.filter(
      (partTwo: any) =>
        new Date(partTwo.completion_date).getFullYear() ===
        this.currentDate.getFullYear()
    );
  }

  mapEquivalentDescription(data: any[]) {
    // Initialize an empty map to store equivalent descriptions and their counts
    const equivalentDescriptionMap = new Map<string, number>();

    // Iterate through the filtered data to populate the map
    data.forEach((partTwo: any) => {
      const equivalentDescription = partTwo.equivalent_description;

      // If the equivalent description already exists in the map, increment its count
      if (equivalentDescriptionMap.has(equivalentDescription)) {
        equivalentDescriptionMap.set(
          equivalentDescription,
          equivalentDescriptionMap.get(equivalentDescription)! + 1
        );
      } else {
        // Otherwise, add it to the map with a count of 1
        equivalentDescriptionMap.set(equivalentDescription, 1);
      }
    });
    return equivalentDescriptionMap;
  }

  ngAfterViewInit(): void {
    this.dataSourceForSubmissionHistory.paginator = this.paginator;
    this.dataSourceForSubmissionHistory.sort = this.sort;

    this.dataSourceForRatedIgcf.paginator = this.paginator;
    this.dataSourceForRatedIgcf.sort = this.sort;

    this.dataSourceForFailedDeliveredAgreedIgc.paginator = this.paginator;
    this.dataSourceForFailedDeliveredAgreedIgc.sort = this.sort;

    this.dataSourceForPartiallyDeliveredAgreedIgc.paginator = this.paginator;
    this.dataSourceForPartiallyDeliveredAgreedIgc.sort = this.sort;

    this.dataSourceForDeliveredAgreedIgc.paginator = this.paginator;
    this.dataSourceForDeliveredAgreedIgc.sort = this.sort;

    this.dataSourceForExceededOrDeliveredAgreedIgc.paginator = this.paginator;
    this.dataSourceForExceededOrDeliveredAgreedIgc.sort = this.sort;
  }

  applySubmissionHistoryFilter(event: Event) {
    this.applyFilter(event, this.dataSourceForSubmissionHistory);
  }
  applyFilterInRatedIgcf(event: Event) {
    this.applyFilter(event, this.dataSourceForRatedIgcf);
  }

  applyFilterForDeliveredAgreedIgc(event: Event) {
    this.applyFilter(event, this.dataSourceForDeliveredAgreedIgc);
  }

  applyFilterForExceededOrDeliveredIgc(event: Event) {
    this.applyFilter(event, this.dataSourceForExceededOrDeliveredAgreedIgc);
  }

  applyFilterForPartiallyDeliveredAgreedIgc(event: Event) {
    this.applyFilter(event, this.dataSourceForPartiallyDeliveredAgreedIgc);
  }
  applyFilterForFailedDeliveredAgreedIgc(event: Event) {
    this.applyFilter(event, this.dataSourceForFailedDeliveredAgreedIgc);
  }

  applyFilter(event: Event, dataSource: MatTableDataSource<any>) {
    const filterValue = (event.target as HTMLInputElement).value;
    dataSource.filter = filterValue.trim().toLowerCase();
    if (dataSource.paginator) {
      dataSource.paginator.firstPage();
    }
  }

  extractYears(submissionHistory: any[]): number[] {
    const years: number[] = [];
    // Populate years array
    submissionHistory.forEach((submission) => {
      const rateeDateSigned = new Date(submission.completion_date);
      const year = rateeDateSigned.getFullYear();
      if (!isNaN(year) && !years.includes(year)) {
        years.push(year);
      }
    });

    // Sort years array
    years.sort((a, b) => a - b);

    return years;
  }

  filterSubmissionHistory(date: string) {
    // Convert date to number
    const selectedYear = Number(date);
    // Filter the originalSubmittedIgcf array instead of submittedIgcf
    const filteredData = this.originalSubmittedIGCFs.filter(
      (submission) =>
        selectedYear === new Date(submission.completion_date).getFullYear()
    );

    const modifiedData = filteredData.map((data) => {
      const {
        fullname,
        emp_number,
        position,
        department,
        completion_date,
        rate_date,
      } = data;

      return {
        fullname,
        emp_number,
        position,
        department,
        completion_date,
        rate_date,
      };
    });
    const ratedIGCFs = modifiedData.filter((igcf: any) => igcf.rate_date);
    this.dataSourceForSubmissionHistory.data = modifiedData;
    this.dataSourceForRatedIgcf.data = ratedIGCFs;
    this.dataSourceForFailedDeliveredAgreedIgc.data =
      this.submittedIGCFs.filter((data: any) => {
        return (
          data.rate_date &&
          new Date(data.rate_date).getFullYear() === selectedYear &&
          data.equivalent_description ===
            'Failed to deliver agreed individual goal commitment'
        );
      });
    this.mapNumbersBaseOnSubmittedIGCFs.set(
      'numberOfSubmittedIGCFs',
      filteredData.length
    );
    this.mapNumbersBaseOnSubmittedIGCFs.set(
      'numberOfDoneRatingIGCFs',
      ratedIGCFs.length
    );
    const filteredFailedDeliveredAgreedIgc =
      this.filterDataBaseOnEquivalentDescription(
        filteredData,
        'Failed to deliver agreed individual goal commitment'
      );

    const filteredPartiallyDeliveredAgreedIgc =
      this.filterDataBaseOnEquivalentDescription(
        filteredData,
        'Partially delivered agreed individual goal commitment'
      );
    const filterDeliveredAgreedIgc = this.filterDataBaseOnEquivalentDescription(
      filteredData,
      'Delivered agreed individual goal commitment'
    );
    const filterExceededOrDeliveredIgc =
      this.filterDataBaseOnEquivalentDescription(
        filteredData,
        'Exceeded or Delivered beyond individual goal commitment'
      );
    this.overallAverageDescriptionMap =
      this.mapEquivalentDescription(filteredData);

    this.dataSourceForFailedDeliveredAgreedIgc.data =
      filteredFailedDeliveredAgreedIgc;
    this.dataSourceForPartiallyDeliveredAgreedIgc.data =
      filteredPartiallyDeliveredAgreedIgc;
    this.dataSourceForDeliveredAgreedIgc.data = filterDeliveredAgreedIgc;
    this.dataSourceForExceededOrDeliveredAgreedIgc.data =
      filterExceededOrDeliveredIgc;
  }

  generatePDF(event: MouseEvent, sortType: string) {
    event.stopPropagation();

    let toPDFData: any[] = [];

    const currentYear = new Date().getFullYear();
    const filterBySelectedYear = this.submittedIGCFs.filter(
      (entry: any) =>
        entry.completion_date && currentYear === new Date().getFullYear()
    );
    if (sortType === 'submitted') {
      toPDFData = filterBySelectedYear;
    } else if (sortType === 'rated') {
      // Filter out entries with null rate_date
      toPDFData = this.submittedIGCFs.filter((entry: any) => entry.rate_date);
    }
    // Check if filtered submissionHistory is empty
    if (this.submittedIGCFs.length === 0 || toPDFData.length === 0) {
      this.authService.openSnackBar(
        'No IGCFs have been submitted or No Year is Selected.',
        'close',
        'bottom'
      );
      return;
    }
    const ratedIGCFs = this.submittedIGCFs.filter(
      (entry: any) =>
        entry.rate_date && currentYear === new Date().getFullYear()
    );
    this.mapNumbersBaseOnSubmittedIGCFs.set(
      'numberOfSubmittedIGCFs',
      toPDFData.length
    );

    this.mapNumbersBaseOnSubmittedIGCFs.set(
      'numberOfDoneRatingIGCFs',
      ratedIGCFs.length
    );

    this.generatePDFService.generateMultiplePagesPDF(toPDFData);
  }

  generateReport(event: MouseEvent, data: any[], title: string): void {
    event.stopPropagation();

    if (!data || data.length === 0) {
      this.authService.openSnackBar(
        'No data available to generate PDF.',
        'close',
        'bottom'
      );
      return;
    }

    const headerRow = Object.keys(data[0])
      .filter((key) => !key.toLowerCase().includes('id')) // Exclude keys containing 'id'
      .map((key) => key.replace(/_/g, ' ').toUpperCase());

    const maxWidth = 200; // Maximum width for each column
    const columnWidths: string[] = [];

    // Adjust column widths based on content length
    data.forEach((item) => {
      Object.values(item)
        .filter(
          (value, index) =>
            !Object.keys(item)[index].toLowerCase().includes('id')
        ) // Exclude ID columns
        .forEach((value, index) => {
          if (typeof value === 'string' && value.length * 8 > maxWidth) {
            // Adjust based on approximate average character width
            columnWidths[index] = maxWidth.toString(); // Convert maxWidth to string before assigning it
          } else {
            columnWidths[index] = '*'; // Otherwise, use auto width
          }
        });
    });

    const bodyRows = data.map((item) => {
      return Object.values(item).filter(
        (value, index) => !Object.keys(item)[index].toLowerCase().includes('id')
      ); // Exclude ID columns
    });

    const docDefinition: any = {
      content: [
        {
          margin: [0, 20, 0, 0],
          stack: [{ text: title, bold: true, fontSize: 16 }],
          alignment: 'center',
        },
        {
          layout: 'lightHorizontalLines',
          margin: [0, 20, 0, 0],
          table: {
            headerRows: 1,
            widths: columnWidths,
            body: [headerRow, ...bodyRows],
          },
        },
      ],
    };

    pdfMake.createPdf(docDefinition).open();
  }
}
