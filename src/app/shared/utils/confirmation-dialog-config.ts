import { IDialogBoxButtons } from 'src/app/core/models/DialogBoxButtons';

// exit-confirmation-dialog-config.ts
export const createExitConfirmationDialogConfig = (
  title: string,
  content: string,
  buttonsConfig: IDialogBoxButtons[]
): any => {
  const buttons = buttonsConfig.map((button) => ({
    isVisible: button.isVisible !== undefined ? button.isVisible : true,
    matDialogCloseValue:
      button.matDialogCloseValue !== undefined
        ? button.matDialogCloseValue
        : true,
    content: button.content !== undefined ? button.content : 'Yes',
    tailwindClass:
      button.tailwindClass !== undefined
        ? button.tailwindClass
        : 'text-red-500',
  }));

  return {
    width: '300px',
    enterAnimationDuration: '200ms',
    exitAnimationDuration: '400ms',
    data: {
      title: title,
      content: content,
      buttons: buttons,
    },
  };
};
