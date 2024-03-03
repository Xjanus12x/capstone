export interface NavItem {
  label: string;
  link?: string;
  route?: string;
  outlet?: string;
  children?: NavItem[];
  collapsed?: boolean;
  canAccess?: string[];

}
