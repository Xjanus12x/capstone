import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // private currentUserSubject: BehaviorSubject<any>;
  // public currentUser: Observable<any>;

  // // Replace this with your backend API base URL
  // private apiBaseUrl = 'http://localhost:8085/api/';

  // constructor(private http: HttpClient) {
  //   this.currentUserSubject = new BehaviorSubject<any>(
  //     JSON.parse(localStorage.getItem('currentUser') || '{}')
  //   );
  //   this.currentUser = this.currentUserSubject.asObservable();
  // }

  // public get currentUserValue(): any {
  //   return this.currentUserSubject.value;
  // }

  // register(user: any): Observable<any> {
  //   return this.http.post<any>(`${this.apiBaseUrl}/register`, user).pipe(
  //     map((response) => {
  //       // store user details and jwt token in local storage
  //       localStorage.setItem('currentUser', JSON.stringify(response));
  //       this.currentUserSubject.next(response);
  //       return response;
  //     })
  //   );
  // }

  // login(email: string, password: string): Observable<any> {
  //   return this.http
  //     .post<any>(`${this.apiBaseUrl}/user/login`, { email, password })
  //     .pipe(
  //       map((response) => {
  //         // store user details and jwt token in local storage
  //         localStorage.setItem('currentUser', JSON.stringify(response));
  //         this.currentUserSubject.next(response);
  //         return response;
  //       })
  //     );
  // }

  // logout(): void {
  //   // remove user from local storage and set current user to null
  //   localStorage.removeItem('currentUser');
  //   this.currentUserSubject.next(null);
  // }
}
