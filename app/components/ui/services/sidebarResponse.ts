export interface module {
  key: string;
  label: string;
  route: string;
  icon: string;
}
export interface Sidebarresponse {
  id: string;
  isActive: boolean;
  module: module;
}
