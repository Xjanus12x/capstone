
export interface IFormData {
    partOneForm: {
      stepLabel: string[];
      formArrayNames: string[];
      groupCounts: number[];
      controlNames: string[];
      tableHeaders: string[];
      tableRows: string[];
    };
    partTwoForm: {
      stepLabel: string[];
    };
}