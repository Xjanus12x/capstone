import { IDeactivateComponent } from "../models/DeactivateComponent";

export const canExitRegistrationPage = (component: IDeactivateComponent) => {
  return component.canExit();
};
