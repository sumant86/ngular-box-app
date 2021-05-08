import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { finalize, tap } from "rxjs/operators";

import { ApiService } from "./api.service";
import { AppError } from "./../interfaces/app-error";
import { API_ROUTES } from "../../../config/api-routes.constants";
import { Boxplot } from "./../interfaces/boxplot"

@Injectable({
  providedIn: 'root'
})
export class AppdataService {

  constructor(private apiService: ApiService) { }

  getBoxData(): Observable<Boxplot | AppError> {
    return this.apiService
      .get<Boxplot>(
        API_ROUTES().Visual.BOX()
      );
  }

}

