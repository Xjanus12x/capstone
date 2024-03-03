export interface IDialogBox {
  title: string;
  content: string;
  buttons: {
    isVisible: boolean;
    matDialogCloseValue: boolean;
    content: string;
  }[];
}
