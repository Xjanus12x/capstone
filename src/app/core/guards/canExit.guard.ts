import { IDeactivateComponent } from "../models/DeactivateComponent";

export const canExit = (component: IDeactivateComponent) => {
  return component.canExit();
};
