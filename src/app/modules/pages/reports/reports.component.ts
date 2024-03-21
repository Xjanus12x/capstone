import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { BackendService } from 'src/app/core/services/backend.service';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { HttpClient } from '@angular/common/http';
import { ISubmittedIGCF } from 'src/app/core/models/SubmittedIgcf';
import { formData } from 'src/app/core/constants/formData';
import { Chart, ChartConfiguration, ChartTypeRegistry } from 'chart.js/auto';
import {
  departmentColors,
  departmentNamesMap,
} from 'src/app/core/constants/DepartmentData';
import { Observable, forkJoin, map, switchMap } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
type ValidChartType = keyof ChartTypeRegistry;
import { MatAccordion } from '@angular/material/expansion';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
})
export class ReportsComponent implements OnInit, AfterViewInit {
  constructor(
    private backendService: BackendService,
    private authService: AuthService,
    private http: HttpClient
  ) {
    (pdfMake.vfs as any) = pdfFonts.pdfMake.vfs;
  }

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
  numberOfSubmittedIgcfByDept: number = 0;
  numberOfNotRatedIgcfByDept: number = 0;
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
    'emp_position',
    'emp_dept',
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
    'emp_position',
    'emp_dept',
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
    'emp_position',
    'emp_dept',
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

  submissionHistory$!: Observable<any>;
  filteredSubmissionHistory: any[] = [];
  currentDate: Date = new Date();
  dataToDisplay: any[] = [];
  originalPartTwoIgcfData: any[] = [];
  selection = new SelectionModel<any>(true, []);
  dataSourceForSubmissionHistory = new MatTableDataSource<any>([]);
  dataSourceForNotRatedIgcf = new MatTableDataSource<any>([]);
  dataSourceForFailedDeliveredAgreedIgc = new MatTableDataSource<any>([]);
  dataSourceForPartiallyDeliveredAgreedIgc = new MatTableDataSource<any>([]);
  dataSourceForDeliveredAgreedIgc = new MatTableDataSource<any>([]);
  dataSourceForExceededOrDeliveredAgreedIgc = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatAccordion) accordion!: MatAccordion;

  ngOnInit(): void {
    const { formArrayNames, groupCounts, stepLabel } = formData.partOneForm;
    this.arrayNames = formArrayNames;
    this.groupCounts = groupCounts;
    this.stepLabel = stepLabel;
    this.authService.getEmployeeDepartment().subscribe({
      next: (dept: string) => {
        this.dept = dept;
      },
    });
    this.authService.getUserRole().subscribe({
      next: (role: string) => {
        if (role === 'Admin') {
          this.backendService.getSubmissionHistoryByDept(this.dept).subscribe({
            next: (submissionHistory: any) => {
              this.deadlineYears = this.extractYears(submissionHistory);
              this.originalSubmissionHistory = submissionHistory;

              const filteredData =
                this.filterDataToCurrentYear(submissionHistory);

              this.filteredSubmissionHistory = filteredData;

              const filterNotRatedIgcf = filteredData.filter(
                (submission: any) => !submission.rate_date
              );

              this.numberOfSubmittedIgcfByDept = filteredData.length;
              this.numberOfNotRatedIgcfByDept = filterNotRatedIgcf.length;
              this.dataSourceForSubmissionHistory.data = filteredData;
              this.dataSourceForNotRatedIgcf.data = filterNotRatedIgcf;
            },
          });
          this.backendService
            .getSubmittedIgcfPartTwoByDept(this.dept)
            .subscribe({
              next: (data: any) => {
                this.originalPartTwoIgcfData = data;
                const filteredData = this.filterDataToCurrentYear(data);
                this.filteredSubmissionHistory = filteredData;
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
                const filterDeliveredAgreedIgc =
                  this.filterDataBaseOnEquivalentDescription(
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
                this.dataSourceForDeliveredAgreedIgc.data =
                  filterDeliveredAgreedIgc;
                this.dataSourceForExceededOrDeliveredAgreedIgc.data =
                  filterExceededOrDeliveredIgc;
                // Now equivalentDescriptionMap contains the desired mapping of equivalent descriptions to counts
              },
            });
        } else if (role === 'HRD') {
          this.backendService.getSubmissionHistoryEveryDept().subscribe({
            next: (submissionHistory: any) => {
              this.deadlineYears = this.extractYears(submissionHistory);
              this.originalSubmissionHistory = submissionHistory;
              const filteredData =
                this.filterDataToCurrentYear(submissionHistory);
              const filterNotRatedIgcf = filteredData.filter(
                (submission: any) => !submission.rate_date
              );
              this.numberOfSubmittedIgcfByDept = filteredData.length;
              this.numberOfNotRatedIgcfByDept = filterNotRatedIgcf.length;
              this.dataSourceForSubmissionHistory.data = filteredData;
              this.dataSourceForNotRatedIgcf.data = filterNotRatedIgcf;
            },
          });
          this.backendService.getSubmittedIgcfPartTwoByDept('').subscribe({
            next: (data: any) => {
              this.originalPartTwoIgcfData = data;
              const filteredData = this.filterDataToCurrentYear(data);
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
              const filterDeliveredAgreedIgc =
                this.filterDataBaseOnEquivalentDescription(
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
              this.dataSourceForDeliveredAgreedIgc.data =
                filterDeliveredAgreedIgc;
              this.dataSourceForExceededOrDeliveredAgreedIgc.data =
                filterExceededOrDeliveredIgc;
              // Now equivalentDescriptionMap contains the desired mapping of equivalent descriptions to counts
            },
          });
        }
      },
    });
  }

  filterDataBaseOnEquivalentDescription(data: any[], description: string) {
    return data.filter(
      (data: any) => data.equivalent_description === description
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

    this.dataSourceForNotRatedIgcf.paginator = this.paginator;
    this.dataSourceForNotRatedIgcf.sort = this.sort;

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
  applyFilterInNotRatedIgcf(event: Event) {
    this.applyFilter(event, this.dataSourceForNotRatedIgcf);
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
    const filteredData = this.originalSubmissionHistory.filter(
      (submission) =>
        selectedYear === new Date(submission.completion_date).getFullYear()
    );
    this.filteredSubmissionHistory = filteredData;

    this.dataSourceForSubmissionHistory.data = filteredData;
    this.numberOfSubmittedIgcfByDept = filteredData.length;

    const filterNotRatedIgcf = filteredData.filter(
      (submission: any) => !submission.rate_date
    );

    const filteredIgcPartTwo = this.originalPartTwoIgcfData.filter(
      (data: any) =>
        new Date(data.completion_date).getFullYear() === selectedYear
    );

    this.overallAverageDescriptionMap =
      this.mapEquivalentDescription(filteredIgcPartTwo);

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
      filteredIgcPartTwo,
      'Delivered agreed individual goal commitment'
    );

    const filterExceededOrDeliveredIgc =
      this.filterDataBaseOnEquivalentDescription(
        filteredIgcPartTwo,
        'Exceeded or Delivered beyond individual goal commitment'
      );

    this.numberOfNotRatedIgcfByDept = filterNotRatedIgcf.length;
    this.dataSourceForNotRatedIgcf.data = filterNotRatedIgcf;

    this.dataSourceForPartiallyDeliveredAgreedIgc.data =
      filteredPartiallyDeliveredAgreedIgc;

    this.dataSourceForPartiallyDeliveredAgreedIgc.data =
      filteredFailedDeliveredAgreedIgc;

    this.dataSourceForDeliveredAgreedIgc.data = filterDeliveredAgreedIgc;

    this.dataSourceForExceededOrDeliveredAgreedIgc.data =
      filterExceededOrDeliveredIgc;
  }

  // generatePDF() {
  //   // Filter out entries with null rate_date
  //   const submissionHistory = this.dataSourceForSubmissionHistory.data.filter(
  //     (entry: any) => entry.rate_date !== null
  //   );

  //   // Check if filtered submissionHistory is empty
  //   if (submissionHistory.length === 0) {
  //     this.authService.openSnackBar(
  //       'No IGCFs have been submitted or No Year is Selected.',
  //       'close',
  //       'bottom'
  //     );
  //     return;
  //   }

  //   // Sort the filtered submissionHistory
  //   submissionHistory.sort((a: any, b: any) => {
  //     // Compare emp_dept values
  //     if (a.emp_dept < b.emp_dept) {
  //       return -1; // a should come before b
  //     } else if (a.emp_dept > b.emp_dept) {
  //       return 1; // b should come before a
  //     } else {
  //       return 0; // emp_dept values are equal
  //     }
  //   });

  //   const logoUrl = 'assets/images/logo/hau-logo.png';
  //   // Fetch the image as a data URL
  //   this.http.get(logoUrl, { responseType: 'blob' }).subscribe((blob) => {
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       const logoDataURL = reader.result as string;

  //       // Create an empty array to store content of each submittedIgcf
  //       const pdfContent: any[] = [];

  //       // Create an array of observables for each submission
  //       const observables = submissionHistory.map((igcf) =>
  //         this.backendService.getSubmittedIgcfDetails(igcf.id).pipe(
  //           switchMap((data) =>
  //             this.backendService.getSubmittedIgcfPartTwo(igcf.id).pipe(
  //               map((data2) => ({
  //                 igcfInformation: igcf,
  //                 igcfPartOne: data,
  //                 igcfPartTwo: data2,
  //               }))
  //             )
  //           )
  //         )
  //       );

  //       // Wait for all observables to complete
  //       forkJoin(observables).subscribe((igcfDataArray: any[]) => {
  //         igcfDataArray.forEach((igcfData, index) => {
  //           // Call the createDocumentDefinition function with the correct arguments
  //           const documentDefinition = this.createDocumentDefinition(
  //             logoDataURL,
  //             igcfData
  //           );
  //           // Add content to pdfContent
  //           pdfContent.push(...documentDefinition.content);

  //           // Add page break after each submittedIgcf, except for the last one
  //           if (index !== this.submittedIgcf.length - 1) {
  //             pdfContent.push({ text: '', pageBreak: 'after' });
  //           }
  //         });

  //         // Create the final document definition with concatenated content
  //         const finalDocumentDefinition = { content: pdfContent };

  //         // Open the PDF document
  //         pdfMake.createPdf(finalDocumentDefinition).open();
  //       });
  //     };
  //     reader.readAsDataURL(blob);
  //   });
  // }

  generatePDF() {
    // Filter out entries with null rate_date
    const submissionHistory = this.dataSourceForSubmissionHistory.data.filter(
      (entry: any) => entry.rate_date !== null
    );

    // Check if filtered submissionHistory is empty
    if (submissionHistory.length === 0) {
      this.authService.openSnackBar(
        'No IGCFs have been submitted or No Year is Selected.',
        'close',
        'bottom'
      );
      return;
    }

    const logoUrl = 'assets/images/logo/hau-logo.png';
    // Fetch the image as a data URL
    this.http.get(logoUrl, { responseType: 'blob' }).subscribe((blob) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const logoDataURL = reader.result as string;

        // Create an empty array to store content of each submittedIgcf
        const pdfContent: any[] = [];

        // Create an array of observables for each submission
        const observables = submissionHistory.map((igcf) =>
          this.backendService.getSubmittedIgcfDetails(igcf.id).pipe(
            switchMap((data) =>
              this.backendService.getSubmittedIgcfPartTwo(igcf.id).pipe(
                map((data2) => ({
                  igcfInformation: igcf,
                  igcfPartOne: data,
                  igcfPartTwo: data2,
                }))
              )
            )
          )
        );

        // Wait for all observables to complete
        forkJoin(observables).subscribe((igcfDataArray: any[]) => {
          igcfDataArray.forEach((igcfData, index) => {
            // Call the createDocumentDefinition function with the correct arguments
            const documentDefinition = this.createDocumentDefinition(
              logoDataURL,
              igcfData
            );
            // Add content to pdfContent
            pdfContent.push(...documentDefinition.content);

            // Add page break after each submittedIgcf
            if (index !== igcfDataArray.length - 1) {
              pdfContent.push({ text: '', pageBreak: 'after' });
            }
          });

          // Create the final document definition with concatenated content
          const finalDocumentDefinition = { content: pdfContent };

          // Open the PDF document
          pdfMake.createPdf(finalDocumentDefinition).open();
        });
      };
      reader.readAsDataURL(blob);
    });
  }
  createDocumentDefinition(logoDataURL: string, data: any): any {
    const { fullname, emp_position, emp_number, emp_dept } =
      data.igcfInformation;
    console.log(data.igcfPartTwo);

    return {
      content: [
        // Logo and organization information
        {
          layout: 'noBorders',
          table: {
            body: [
              [
                {
                  image: logoDataURL,
                  width: 75,
                  height: 75,
                  margin: [20, 5, 0, 0],
                },
                {
                  stack: [
                    { text: 'HOLY ANGEL UNIVERSITY', bold: true },
                    { text: 'Human Resource Management Office', bold: true },
                    { text: 'Human Resource Development', bold: true },
                  ],
                  alignment: 'center',
                  margin: [30, 20, 30, 0],
                },
                {
                  margin: [20, 20, 0, 0],
                  alignment: 'right',
                  table: {
                    headerRows: 1,
                    widths: ['*'],
                    body: [
                      [
                        {
                          stack: [
                            'FM-HRD-6020',
                            { text: 'Revision: 0' },
                            { text: 'Effectivity Date: August 4, 2020' },
                          ],
                          alignment: 'left',
                          border: [true, true, true, true],
                        },
                      ],
                    ],
                  },
                },
              ],
            ],
          },
        },
        // Title
        {
          margin: [0, 20, 0, 0],
          stack: [
            {
              text: 'Individual Goal Commitment Form',
              bold: true,
              fontSize: 16,
            },
            { text: '(Outcome-based Performance Evaluation)', bold: true },
          ],
          alignment: 'center',
        },
        // Employee information table
        {
          layout: 'noBorders',
          alignment: 'center',
          table: {
            body: [
              [
                {
                  margin: [0, 20, 0, 0],
                  layout: 'noBorders',
                  table: {
                    headerRows: 1,
                    widths: ['*'],
                    body: [
                      [
                        {
                          stack: [
                            { text: `Employee Name.: ${fullname}` },
                            { text: `Position: ${emp_position}` },
                          ],
                          alignment: 'left',
                        },
                      ],
                    ],
                  },
                },
                { text: '', margin: [30, 0, 30, 0] },
                {
                  margin: [0, 20, 0, 0],
                  layout: 'noBorders',
                  alignment: 'right',
                  table: {
                    headerRows: 1,
                    widths: ['*'],
                    body: [
                      [
                        {
                          stack: [
                            { text: `Employee No.: ${emp_number}` },
                            { text: `Dept./Unit: ${emp_dept}` },
                          ],
                          alignment: 'left',
                        },
                      ],
                    ],
                  },
                },
              ],
            ],
          },
        },
        // Rating description
        {
          text: 'Immediate Supervisor rates accomplishment of corresponding employee using the following Evaluation Rating Equivalents:',
          margin: [0, 10, 0, 0],
          bold: true,
        },
        {
          ul: [
            '1.00 – 1.50 Failed to deliver agreed individual goal commitment',
            '1.51 – 2.50 Partially delivered agreed individual goal commitment',
            '2.51 – 3.50 Delivered agreed individual goal commitment',
            '3.51 – 4.00 Exceeded or Delivered beyond individual goal commitment',
          ],
          margin: [0, 5, 0, 10],
        },
        // Performance table
        // Performance table
        {
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'], // Adjust widths as needed
            body: [
              [
                {
                  text: 'Individual Commitment',
                  style: 'tableHeader',
                  colSpan: 4,
                  alignment: 'center',
                },
                {},
                {},
                {},
                {},
                {
                  text: 'Assessment',
                  style: 'tableHeader',
                  colSpan: 2,
                  alignment: 'center',
                },
                { text: '', style: 'tableHeader' },
              ],

              [
                {
                  text: 'Personal Objective',
                  style: 'tableHeader',
                }, // Spanning 4 columns
                { text: 'Personal Measures (KPI)', style: 'tableHeader' }, // Header f
                { text: 'Target', style: 'tableHeader' }, // Header f
                { text: 'Initiatives', style: 'tableHeader' }, // Header f
                { text: 'Weight', style: 'tableHeader' }, // Header f
                { text: 'Achieved', style: 'tableHeader' }, // Header f
                { text: 'Rating (1 - 4)', style: 'tableHeader' }, // Header for 'Assessment' column
              ],
              ...this.generatePartOneTable(data.igcfPartOne),
            ],
          },
          styles: {
            tableHeader: { fillColor: '#CCCCCC', color: '#000000', bold: true },
          },
        },
        this.generatePartTwo(data.igcfPartTwo, fullname),
      ],
      styles: {
        tableHeader: {
          bold: true,
          fillColor: '#ffffff',
          color: '#000000',
          alignment: 'center',
        },
      },
    };
  }
  generatePartOneTable(igcfPartOne: any[]) {
    const partOneValues: any[] = [];
    const kpiPercentagesMap = new Map<string, number>();
    igcfPartOne.forEach((data: any) => {
      if (!partOneValues.includes(data.selected_kpi))
        partOneValues.push(data.selected_kpi);
      const totalWeight = kpiPercentagesMap.get(data.selected_kpi) || 0;
      kpiPercentagesMap.set(data.selected_kpi, totalWeight + data.weight);
      partOneValues.push(data);
    });

    return partOneValues.map((value) => {
      if (typeof value === 'string') {
        return [
          {
            text: value,
            colSpan: 4,
            alignment: 'center',
            fillColor: '#FFFF00',
            bold: true,
          }, // Corrected typo here
          {},
          {},
          {},
          {
            text: `${kpiPercentagesMap.get(value)}%`,
            fillColor: '#FFFF00',
            bold: true,
          },
          {
            text: '',
            colSpan: 2,
            fillColor: '#FFFF00',
          },
          {},
        ];
      }
      return [
        { text: value.selected_plan },
        { text: value.personal_measures_kpi },
        { text: value.selected_plan_weight },
        { text: value.initiatives },
        { text: `${value.weight}%` },
        {
          text: value.achieved,
        },
        { text: value.rating },
      ];
    });
  }

  generatePartTwo(igcfPartTwo: any, rater_fullname: string) {
    const {
      overall_weighted_average_rating,
      ratee_fullname,
      equivalent_description,
      rate_date,
      rater_completion_date,
      top_three_least_agc,
      top_three_highly_agc,
      top_three_competencies_improvement,
      top_three_competency_strengths,
      top_three_training_development_suggestion,
    } = igcfPartTwo[0];
    const answers = [
      top_three_least_agc.split(','),
      top_three_highly_agc.split(','),
      top_three_competencies_improvement.split(','),
      top_three_competency_strengths.split(','),
      top_three_training_development_suggestion.split(','),
    ];
    // Overall Weighted Average Rating and Equivalent Description

    const result: any[] = [
      {
        text: `Overall Weighted Average Rating: ${overall_weighted_average_rating}`,
        margin: [0, 10, 0, 0],
      },
      {
        text: `Equivalent Description: ${equivalent_description}`,
        margin: [0, 5, 0, 10],
      },
    ];

    this.partTwoQuestions.forEach((question: string, i) => {
      result.push({ text: question });
      result.push({
        ul: answers[i],
        margin: [0, 5, 0, 10], // Adjust margins as needed
      });
    });

    return [
      ...result,
      {
        layout: 'noBorders',
        table: {
          body: [
            [
              {
                margin: [0, 60, 0, 0],
                layout: 'noBorders',
                alignment: 'left',
                table: {
                  headerRows: 1,
                  widths: ['*'],
                  body: [
                    [
                      {
                        stack: [
                          rater_fullname,
                          {
                            text: rater_completion_date,
                          },
                        ],
                        alignment: 'left',
                      },
                    ],
                  ],
                },
              },
              {
                stack: [],
                alignment: 'center',
                margin: [100, 0, 100, 0],
              },
              {
                margin: [0, 60, 0, 0],
                layout: 'noBorders',
                alignment: 'right',
                table: {
                  headerRows: 1,
                  widths: ['*'],
                  body: [
                    [
                      {
                        stack: [
                          ratee_fullname,
                          {
                            text: rate_date,
                          },
                        ],
                        alignment: 'left',
                      },
                    ],
                  ],
                },
              },
            ],
          ],
        },
      },
    ];
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
          stack: [
            { text: title, bold: true, fontSize: 16 },
          ],
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
