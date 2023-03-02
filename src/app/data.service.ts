import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { yearsArray } from './years';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) { }

  getYearsArray(): Observable<yearsArray[]>{
  return this.http.get<yearsArray[]>("assets/sample/years.json", {responseType: 'json'});
  }
}
