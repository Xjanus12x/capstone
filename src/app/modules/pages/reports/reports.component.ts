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
type ValidChartType = keyof ChartTypeRegistry;
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
  fillColors: string[] = ['blue', 'yellow', 'green', 'orange', 'violet'];
  canvas: any;
  signedCount: number = 0;
  notSignedCount: number = 0;
  role: string = '';
  dept: string = '';
  signedCountMap = new Map<string, number>();
  notSignedCountMap = new Map<string, number>();
  deadlineYears: any[] = [];
  originalSubmittedIgcf: ISubmittedIGCF[] = [];
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
        this.role = role;
      },
    });
  }

  ngAfterViewInit(): void {
    if (this.role === 'Admin') {
      this.backendService.getAllDeptSubmittedIgcf(this.dept).subscribe({
        next: (submittedIgcf: ISubmittedIGCF[]) => {
          this.originalSubmittedIgcf = submittedIgcf; // Store original data
          this.deadlineYears = this.extractYears(submittedIgcf);
          this.submittedIgcf = this.fillterSignedIgcf(submittedIgcf);
          this.countSignedStatus(submittedIgcf, new Date().getFullYear());
          this.renderCharts();
        },
      });
    } else if (this.role === 'Viewer Only') {
      this.backendService.getAllSubmittedIgcfInEverydept().subscribe({
        next: (submittedIgcf: ISubmittedIGCF[]) => {
          this.originalSubmittedIgcf = submittedIgcf; // Store original data
          this.deadlineYears = this.extractYears(submittedIgcf);
          this.submittedIgcf = this.fillterSignedIgcf(submittedIgcf);
          this.countSignedStatus(submittedIgcf, new Date().getFullYear());
          this.renderCharts();
        },
      });
    }
  }
  extractYears(submittedIgcf: ISubmittedIGCF[]): number[] {
    const years: number[] = [];

    // Populate years array
    submittedIgcf.forEach((igcf) => {
      const rateeDateSigned = new Date(igcf.ratee_date_signed);
      const year = rateeDateSigned.getFullYear();

      if (!isNaN(year) && !years.includes(year)) {
        years.push(year);
      }
    });

    // Sort years array
    years.sort((a, b) => a - b);

    return years;
  }

  renderCharts() {
    this.renderPieChart(this.signedCountMap, this.notSignedCountMap);
    this.renderTotalEquivalentRatings(this.submittedIgcf);
    this.renderOverallWeightedAverageRatings(this.submittedIgcf);
  }

  filterSubmittedIgcf(date: string) {
    // Convert date to number
    let selectedYear = Number(date);
    // Filter the originalSubmittedIgcf array instead of submittedIgcf
    this.submittedIgcf = this.originalSubmittedIgcf.filter((igcf) => {
      const yearSigned = new Date(
        igcf.ratee_date_signed as string
      ).getFullYear();
      return yearSigned === selectedYear;
    });

    this.countSignedStatus(this.originalSubmittedIgcf, selectedYear);
    this.renderCharts();
  }

  renderPieChart(
    signedCountMap: Map<string, number>,
    notSignedCountMap: Map<string, number>
  ): void {
    const ctx: any = document.getElementById('signedAndNotSignedChart');
    if (!ctx) return;

    // Destroy existing chart instance if it exists
    const existingChart = Chart.getChart(ctx);
    if (existingChart) {
      existingChart.destroy();
    }

    const departments = Array.from(signedCountMap.keys());
    const departmentAcronyms = this.getDepartmentAccronyms(departments);
    const signedCounts = departments.map(
      (dept) => signedCountMap.get(dept) || 0
    );
    const notSignedCounts = departments.map(
      (dept) => notSignedCountMap.get(dept) || 0
    );

    const colors = this.getColors(departmentAcronyms);

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: departmentAcronyms,
        datasets: [
          {
            label: 'Signed',
            data: signedCounts,
            backgroundColor: colors, // Use green color for signed
          },
          {
            label: 'Not Signed',
            data: notSignedCounts,
            backgroundColor: colors, // Use red color for not signed
          },
        ],
      },
    });
  }

  getColors(accronyms: any[]) {
    return accronyms.map((acronym) => {
      const color = departmentColors.get(acronym as string);
      return color || '#000000'; // Default color if no matching color found
    });
  }
  getDepartmentAccronyms(departments: any) {
    return departments
      .map((department: any) => departmentNamesMap.get(department))
      .filter((acronym: any) => acronym !== undefined);
  }
  createChart(
    chartType: ValidChartType,
    ctx: any,
    label: string,
    labels: string[],
    data: any,
    bgColors: string[]
  ): void {
    new Chart(ctx, {
      type: chartType,
      data: {
        labels: labels,
        datasets: [
          {
            label: label,
            data: data,
            backgroundColor: bgColors,
          },
        ],
      },
    });
  }

  renderOverallWeightedAverageRatings(submittedIgcf: ISubmittedIGCF[]): void {
    const ctx: any = document.getElementById('empEquivalentRatings');
    if (!ctx) return;
    // Destroy existing chart instance if it exists
    const existingChart = Chart.getChart(ctx);
    if (existingChart) {
      existingChart.destroy();
    }

    const ratingRanges = [
      {
        label: 'Failed to deliver agreed individual goal commitment',
        min: 1.0,
        max: 1.5,
      },
      {
        label: 'Partially delivered agreed individual goal commitment',
        min: 1.51,
        max: 2.5,
      },
      {
        label: 'Delivered agreed individual goal commitment',
        min: 2.51,
        max: 3.5,
      },
      {
        label: 'Exceeded or Delivered beyond individual goal commitment',
        min: 3.51,
        max: 4.0,
      },
    ];

    const ratingCounts = new Map<string, number>();

    submittedIgcf.forEach((igcf) => {
      if (igcf.overall_weighted_average_rating !== undefined) {
        const rating = parseFloat(igcf.overall_weighted_average_rating);
        ratingRanges.forEach((range) => {
          if (rating >= range.min && rating <= range.max) {
            const count = ratingCounts.get(range.label) || 0;
            ratingCounts.set(range.label, count + 1);
          }
        });
      }
    });

    const data: any[] = [];

    ratingCounts.forEach((count, label) => {
      data.push({
        label: label,
        data: [count],
        backgroundColor: this.getRandomColor(),
      });
    });

    const config: any = {
      type: 'bar',
      data: {
        labels: [''],
        datasets: data,
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Count',
            },
          },
          x: {
            title: {
              display: true,
              text: 'Rating Range',
            },
          },
        },
      },
    };

    new Chart(ctx, config);
  }

  getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  fillterSignedIgcf(submittedIgcf: ISubmittedIGCF[]) {
    const currentYear = new Date().getFullYear(); // Get the current year

    // Filter submittedIgcf based on the date criteria
    return submittedIgcf.filter((igcf) => {
      // Convert ratee_date_signed to a Date object
      const rateeDateSigned = new Date(igcf.ratee_date_signed);

      // Check if the year matches the current year
      return (
        igcf.ratee_signature.length > 0 &&
        rateeDateSigned.getFullYear() === currentYear
      );
    });
  }

  renderTotalEquivalentRatings(submittedIgcf: ISubmittedIGCF[]): void {
    const ctx: any = document.getElementById('totalEquivalentRatings');
    if (!ctx) return;
    // Destroy existing chart instance if it exists
    const existingChart = Chart.getChart(ctx);
    if (existingChart) {
      existingChart.destroy();
    }
    // Aggregate equivalent ratings for each department
    const departmentEquivalentRatingsMap = new Map<string, number>();
    submittedIgcf.forEach((igcf) => {
      const department = igcf.emp_dept;
      const equivalentRatings = igcf.equivalent_ratings
        ?.split(',')
        .map((str) => parseFloat(str)) // Return the parsed value
        .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

      const currentSum = departmentEquivalentRatingsMap.get(department) || 0;

      departmentEquivalentRatingsMap.set(
        department,
        currentSum + equivalentRatings!
      );
    });

    // Get department names using the keys of departmentEquivalentRatingsMap
    const departmentNames = Array.from(
      departmentEquivalentRatingsMap.keys()
    ).map((key) => departmentNamesMap.get(key));

    // Extract labels and data from the aggregated map
    const labels = departmentNames.filter(
      (name) => name !== undefined
    ) as string[];
    const data = Array.from(departmentEquivalentRatingsMap.values());
    const bgColors = Array.from(departmentEquivalentRatingsMap.keys()).map(
      (key) => departmentColors.get(key)
    );
    // Filter out undefined values and provide a default value if necessary
    // Filter out undefined values and map them to empty strings
    const datasets = labels.map((label, i) => {
      return {
        label: label,
        data: [data[i]],
        backgroundColor: departmentColors.get(label),
      };
    });
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [' '],
        datasets: datasets,
      },
    });
  }

  countSignedStatus(submittedIgcf: ISubmittedIGCF[], year: number): void {
    const currentYear = year; // Get the current year

    // Check if the maps have values before clearing them
    if (this.signedCountMap.size > 0 || this.notSignedCountMap.size > 0) {
      this.signedCountMap.clear();
      this.notSignedCountMap.clear();
    }

    submittedIgcf.forEach((igcf) => {
      const department = igcf.emp_dept;
      const rateeDate = new Date(igcf.ratee_date_signed); // Date when IGCF was signed by ratee
      const rateeYear = rateeDate.getFullYear(); // Year when IGCF was signed

      // Check if the department exists in the departmentNamesMap
      if (departmentNamesMap.has(department)) {
        // Check if the IGCF was signed in the current year
        if (rateeYear === currentYear) {
          let currentSigned = this.signedCountMap.get(department) || 0;
          let currentNotSigned = this.notSignedCountMap.get(department) || 0;

          if (igcf.ratee_signature.length > 0) {
            currentSigned++;
          } else {
            currentNotSigned++;
          }

          this.signedCountMap.set(department, currentSigned);
          this.notSignedCountMap.set(department, currentNotSigned);
        }
      }
    });

    // If you need to keep track of total counts across all departments,
    // you can sum up the counts in the maps
    this.signedCount = Array.from(this.signedCountMap.values()).reduce(
      (acc, val) => acc + val,
      0
    );
    this.notSignedCount = Array.from(this.notSignedCountMap.values()).reduce(
      (acc, val) => acc + val,
      0
    );
  }

  generatePDF() {
    if (this.submittedIgcf.length === 0) {
      this.authService.openSnackBar(
        'No IGCFs have been submitted or No Year is Selected.',
        'close',
        'bottom'
      );
      return;
    }

    this.submittedIgcf.sort((a: ISubmittedIGCF, b: ISubmittedIGCF) => {
      // Compare emp_dept values
      if (a.emp_dept < b.emp_dept) {
        return -1; // a should come before b
      } else if (a.emp_dept > b.emp_dept) {
        return 1; // b should come before a
      } else {
        return 0; // emp_dept values are equal
      }
    });
    const logoUrl = 'assets/images/logo/hau-logo.png';
    // Fetch the image as a data URL
    this.http.get(logoUrl, { responseType: 'blob' }).subscribe((blob) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const logoDataURL = reader.result as string;

        // Create an empty array to store content of each submittedIgcf
        const pdfContent: any[] = [];

        // Iterate through each submittedIgcf and add its content to pdfContent
        this.submittedIgcf.forEach((igcf: ISubmittedIGCF, index) => {
          const documentDefinition = this.createDocumentDefinition(
            logoDataURL,
            igcf
          );
          pdfContent.push(...documentDefinition.content);

          // Add page break after each submittedIgcf, except for the last one
          if (index !== this.submittedIgcf.length - 1) {
            pdfContent.push({ text: '', pageBreak: 'after' });
          }
        });

        // Create the final document definition with concatenated content
        const finalDocumentDefinition = { content: pdfContent };

        // Open the PDF document
        pdfMake.createPdf(finalDocumentDefinition).open();
      };
      reader.readAsDataURL(blob);
    });
  }

  createDocumentDefinition(logoDataURL: string, igcf: ISubmittedIGCF): any {
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
                  margin: [0, 20, 0, 0],
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
                            { text: `Employee Name.: ${igcf.fullname}` },
                            { text: `Position: ${igcf.emp_position}` },
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
                            { text: `Employee No.: ${igcf.emp_number}` },
                            { text: `Dept./Unit: ${igcf.emp_dept}` },
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
          margin: [0, 5, 0, 0],
          bold: true,
        },
        {
          ul: [
            '1.00 – 1.50 Failed to deliver agreed individual goal commitment',
            '1.51 – 2.50 Partially delivered agreed individual goal commitment',
            '2.51 – 3.50 Delivered agreed individual goal commitment',
            '3.51 – 4.00 Exceeded or Delivered beyond individual goal commitment',
          ],
          margin: [0, 0, 0, 10],
        },
        // Performance table
        {
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*', '*'],
            body: [
              [
                { text: '', style: 'tableHeader' },
                { text: 'Weight (%)', style: 'tableHeader' },
                {
                  text: 'Individual Goal Commitment (%)',
                  style: 'tableHeader',
                },
                { text: 'Accomplishment (%)', style: 'tableHeader' },
                { text: 'Equivalent (1-4)', style: 'tableHeader' },
              ],
              ...this.generateTableRow(igcf),
            ],
          },
          styles: {
            tableHeader: { fillColor: '#CCCCCC', color: '#000000', bold: true },
          },
        },
        // Overall Weighted Average Rating and Equivalent Description
        {
          text: `Overall Weighted Average Rating: ${igcf.overall_weighted_average_rating}`,
          margin: [0, 10, 0, 0],
        },
        {
          text: `Equivalent Description: ${igcf.equivalent_description}`,
          margin: [0, 10, 0, 0],
        },

        this.generatePartTwo(igcf),

        {
          layout: 'noBorders',
          table: {
            body: [
              [
                {
                  margin: [0, 30, 0, 0],
                  layout: 'noBorders',
                  alignment: 'left',
                  table: {
                    headerRows: 1,
                    widths: ['*'],
                    body: [
                      [
                        {
                          stack: [
                            `${igcf.fullname}`,
                            {
                              image: igcf.rater_signature,
                              width: 100,
                              height: 75,
                            },
                            {
                              text: `${igcf.rater_date_signed?.split('T')[0]}`,
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
                  margin: [80, 0, 80, 0],
                },
                {
                  margin: [0, 30, 0, 0],
                  layout: 'noBorders',
                  alignment: 'right',
                  table: {
                    headerRows: 1,
                    widths: ['*'],
                    body: [
                      [
                        {
                          stack: [
                            `${igcf.ratee_fullname}`,
                            {
                              image: igcf.ratee_signature,
                              width: 100,
                              height: 75,
                            },
                            {
                              text: `${igcf.ratee_date_signed?.split('T')[0]}`,
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

  generateTableRow(submittedIgcf: ISubmittedIGCF) {
    const {
      commitments,
      weight_percentages,
      igc_percentages,
      accomplishment_percentages,
      equivalent_ratings,
      selected_weight_percentages,
      selected_igc_percentages,
      selected_commitment_percentages,
    } = submittedIgcf;
    const commitmentsArr = commitments.split(',');
    const weightPercentagesArr = weight_percentages.split(',');
    const igcPercentagesArr = igc_percentages.split(',');
    const accomplishmentPercentagesArr = accomplishment_percentages.split(',');
    const selectedWeightPercentages = selected_weight_percentages.split(',');
    const selectedIgcPercentages = selected_igc_percentages.split(',');
    const selectedCommitmentPercentages =
      selected_commitment_percentages.split(',');
    let indexValue = 0;
    const partOneValues = this.arrayNames.map((name, index) => {
      const group: any[] = [];
      for (let i = 0; i < this.groupCounts[index]; i++) {
        group.push({
          commitment: commitmentsArr[indexValue],
          weight: weightPercentagesArr[indexValue],
          individualGoalCommitment: igcPercentagesArr[indexValue],
          accomplishment: accomplishmentPercentagesArr[indexValue],
          rating:
            equivalent_ratings?.length === 0
              ? ''
              : equivalent_ratings?.split(',')[indexValue],
        });

        indexValue === 9 ? (indexValue = 0) : indexValue++;
      }
      return { [name]: group };
    });

    const temp: any = [];
    this.stepLabel.forEach((label: string, i: number) => {
      temp.push(
        [
          {
            text: label,
            fillColor: this.fillColors[i],
            color: i === 0 || i === 2 ? 'white' : 'black',
            bold: true,
            colSpan: 5,
            alignment: 'center',
          },
          '',
          '',
          '',
          '',
        ],
        [
          {
            text: 'Key Performance Indicators (KPIs)',
            bold: true,
          },
          `${selectedWeightPercentages[i]}%`,
          `${selectedIgcPercentages[i]}%`,
          `${selectedCommitmentPercentages[i]}%`,
          '',
        ]
      );
      // let arrName: string = this.arrayNames[i];
      partOneValues[i][this.arrayNames[i]].forEach((vals: any) => {
        temp.push([
          {
            text: vals.commitment,
          },
          `${vals.weight}%`,
          `${vals.individualGoalCommitment}%`,
          `${vals.accomplishment}%`,
          `${vals.rating}`,
        ]);
      });
      // commitment: 'hahaha0', weight: '1', individualGoalCommitment: '2', accomplishment: '3', rating: '4'
      // Additional code if necessary
    });
    return temp;
  }
  generatePartTwo(submittedIgcf: ISubmittedIGCF) {
    const {
      top_three_least_agc,
      top_three_highly_agc,
      top_three_competencies_improvement,
      top_three_competency_strenghts,
      top_three_training_development_suggestions,
    } = submittedIgcf;

    const partTwoAnswers = [
      top_three_least_agc.split(','),
      top_three_highly_agc.split(','),
      top_three_competencies_improvement.split(','),
      top_three_competency_strenghts.split(','),
      top_three_training_development_suggestions.split(','),
    ];

    return this.partTwoQuestions.map((question, i) => {
      return [
        { text: question, margin: [0, 10, 0, 0], bold: true },
        { ul: partTwoAnswers[i] },
      ];
    });
  }
}
