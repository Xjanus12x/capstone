import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
@Injectable({
  providedIn: 'root',
})
export class GeneratePdfService {
  private partTwoQuestions: string[] = [
    'a. Top three least accomplished goal commitments',
    'b. Top three highly accomplished goal commitments',
    'c. Top three competencies that need improvement',
    'd. Top three competency strengths',
    'e. Top three training and development suggestions based on previous items',
  ];
  private logoUrl: string = 'assets/images/logo/hau-logo.png';

  constructor(private http: HttpClient) {
    (pdfMake.vfs as any) = pdfFonts.pdfMake.vfs;
  }
  getPartTwoQuestions(): string[] {
    return this.partTwoQuestions;
  }
  generateSinglePagePDF(submittedIGCF: any) {

    // Fetch the image as a data URL
    this.http.get(this.logoUrl, { responseType: 'blob' }).subscribe((blob) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const logoDataURL = reader.result as string;

        const documentDefinition = this.createDocumentDefinition(
          logoDataURL,
          submittedIGCF
        );
        pdfMake.createPdf(documentDefinition).open();
      };
      reader.readAsDataURL(blob);
    });
  }

  generateMultiplePagesPDF(toPDFData: any[]) {
    // Fetch the image as a data URL
    this.http.get(this.logoUrl, { responseType: 'blob' }).subscribe((blob) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const logoDataURL = reader.result as string;
        // Create an empty array to store content of each submittedIgcf
        const pdfContent: any[] = [];

        // Loop through the fetched IGCFs from the service
        toPDFData.forEach((igcf: any, index: number) => {
          const documentDefinition = this.createDocumentDefinition(
            logoDataURL,
            igcf
          );
          // Add content to pdfContent
          pdfContent.push(...documentDefinition.content);

          // Add page break after each submittedIgcf
          if (index !== toPDFData.length - 1) {
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

  createDocumentDefinition(logoDataURL: string, data: any): any {
    const {
      fullname,
      position,
      emp_number,
      department,
      completion_date,
      igc_inputs,
      overall_weighted_average_rating,
      equivalent_description,
      top_three_least_agc,
      top_three_highly_agc,
      top_three_competencies_improvement,
      top_three_competency_strengths,
      top_three_training_development_suggestion,
      ratee_fullname,
      rate_date,
    } = data;

    const partTwoIGCF = [
      top_three_least_agc,
      top_three_highly_agc,
      top_three_competencies_improvement,
      top_three_competency_strengths,
      top_three_training_development_suggestion,
    ];

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
                            { text: `Position: ${position}` },
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
                            { text: `Dept./Unit: ${department}` },
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
              ...this.generatePartOneTable(igc_inputs),
            ],
          },
          styles: {
            tableHeader: { fillColor: '#CCCCCC', color: '#000000', bold: true },
          },
        },

        this.generatePartTwo(
          fullname,
          completion_date,
          partTwoIGCF,
          overall_weighted_average_rating,
          equivalent_description,
          ratee_fullname,
          rate_date
        ),
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
      const totalWeight = Number(kpiPercentagesMap.get(data.selected_kpi)) || 0;
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
        { text: value.personalObject },
        { text: value.personalMeasures },
        { text: value.target },
        { text: value.initiatives },
        { text: `${value.weight}%` },
        {
          text: value.achieved,
        },
        { text: value.rating },
      ];
    });
  }

  generatePartTwo(
    fullname: string,
    completion_date: string,
    partTwoIGCF: any[],
    overall_weighted_average_rating: string,
    equivalent_description: string,
    ratee_fullname: string,
    rate_date: string
  ) {
    let margin = 10;
    if (!rate_date) margin = 60;
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
        ul: partTwoIGCF[i],
        margin: [0, margin, 0, 10], // Adjust margins as needed
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
                          fullname,
                          {
                            text: completion_date,
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
}
