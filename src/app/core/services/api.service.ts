import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { AppError } from "./../interfaces/app-error"

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private httpClient: HttpClient) { }

  get<T, Q = {}>(url: string, queryParam?: Q): Observable<T | AppError> {
    return this.httpClient
      .get<T>(url, {
        headers: this.getDefaultRequestOptions(),
        params: queryParam as any,
      })
      .pipe(catchError(this.handleErrors));
  }

  post<T>(url: string, data: any): Observable<T | AppError> {
    return this.httpClient
      .post<T>(url, data, { headers: this.getDefaultRequestOptions() })
      .pipe(catchError(this.handleErrors));
  }
  private handleErrors(
    errorHttpResponse: HttpErrorResponse
  ): Observable<AppError> {
    return throwError(errorHttpResponse);
  }
  private getDefaultRequestOptions():
    | HttpHeaders
    | {
        [header: string]: string | string[];
      } {
    return { "Content-Type": "application/json" };
  }
}
