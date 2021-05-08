export interface AppError {
  message?: string;
  params?: { [name: string]: string };
  field?: string;
}
