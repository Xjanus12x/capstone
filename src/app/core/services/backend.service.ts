import { Injectable } from '@angular/core';
import { IEmployeeDetails } from '../models/EmployeeDetails';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  Observer,
  catchError,
  combineLatest,
  forkJoin,
  from,
  map,
  mergeMap,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { IUserAccount } from '../models/UserAccount';
import { AuthService } from './auth.service';
import { RouterService } from 'src/app/modules/services/router-service.service';
import { ISignedIgcf } from '../models/SignedIGCF';
import { IUserList } from '../models/UsersList';
import { IPendingUser } from '../models/PendingUser';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  QuerySnapshot,
  DocumentData,
  deleteDoc,
  getDoc,
  updateDoc,
  QueryDocumentSnapshot,
} from '@angular/fire/firestore';
import { collectionData, doc } from 'rxfire/firestore';
import emailjs from '@emailjs/browser';

@Injectable({
  providedIn: 'root',
})
export class BackendService {
  // prod
  // private apiBaseUrl =
  //   'jdbc:mysql://sql6.freesqldatabase.com:3306/sql6694132/api';
  // live
  // private apiBaseUrl: string = '118.139.176.23/api';
  // test
  private apiBaseUrl = 'http://localhost:8085/api';
  //   // test2
  // private apiBaseUrl = '118.139.176.23/api';
  // test3
  // private apiBaseUrl = 'https://haucommit.com/api';
  // test4
  // private apiBaseUrl = 'https://haucommit.com/api';

  private details!: IEmployeeDetails;
  private accountDetails!: IUserAccount;
  private unconfirmedEmail: string = '';
  private igcfValues!: any;
  private currentIgcfId!: number;
  private yearOfCompletions: string[] = [];
  private objAndActionPlans: any[] = [];
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private routerService: RouterService,
    private fs: Firestore
  ) {}

  deleteSubmittedIgcf(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiBaseUrl}/del/submitted-igcf/${id}`);
  }

  getNumberOfSubmittedIgcf() {
    return this.http.get(`${this.apiBaseUrl}/get/igcf-number-of-submissions`);
  }
  getAllUsers(deptName: string) {
    const params = new HttpParams().set('dept_name', deptName);
    return this.http.get<IUserList[]>(`${this.apiBaseUrl}/get/users`, {
      params,
    });
  }
  setEmployeeDetails(details: IEmployeeDetails): void {
    this.details = details;
  }
  setCurrentIgcfId(id: number) {
    this.currentIgcfId = id;
  }

  rateIgcf(data: any) {
    return this.http.post<any>(`${this.apiBaseUrl}/update/rate-igcf`, data);
  }

  submitIGCF(data: any) {
    return this.http.post(`${this.apiBaseUrl}/submit-igcf`, data);
  }

  getSubmissionHistoryByDept(dept: string) {
    const params = new HttpParams().set('dept', dept);
    return this.http.get(
      `${this.apiBaseUrl}/get/igcf-submission-history-by-dept`,
      {
        params,
      }
    );
  }
  getSubmissionHistoryByEmployeeNumber(empNumber: string) {
    const params = new HttpParams().set('emp_number', empNumber);
    return this.http.get(
      `${this.apiBaseUrl}/get/igcf-submission-history-by-emp-num`,
      {
        params,
      }
    );
  }
  getSubmissionHistoryEveryDept() {
    return this.http.get(
      `${this.apiBaseUrl}/get/igcf-submission-history-every-dept`
    );
  }

  getSubmittedIgcfDetails(id: string) {
    const params = new HttpParams().set('id', id);
    return this.http.get(`${this.apiBaseUrl}/get/submitted-igcf-details`, {
      params,
    });
  }
  getSubmittedIgcfPartTwo(id: string) {
    const params = new HttpParams().set('id', id);
    return this.http.get(`${this.apiBaseUrl}/get/igcf-part-two`, {
      params,
    });
  }
  getSubmittedIgcfPartTwoByDept(dept: string) {
    const params = new HttpParams().set('dept', dept);
    return this.http.get(`${this.apiBaseUrl}/get/igcf-part-two-by-dept`, {
      params,
    });
  }

  submitKpis(kpis: any[]) {
    this.http
      .post<any>(`${this.apiBaseUrl}/add/kpi-and-action-plans`, kpis)
      .subscribe({
        next: () => {
          // Handle success
          this.authService.openSnackBar(
            'KPIs submitted successfully',
            'Close',
            'bottom'
          );
          this.routerService.routeTo('dashboard');
        },
        error: (error) => {
          // Handle error
          console.error('Error submitting KPIs:', error);
          this.authService.openSnackBar(
            'Failed to submit KPIs',
            'Close',
            'bottom'
          );
          this.routerService.routeTo('dashboard');
        },
      });
  }

  getKpisAndActionPlans(dept: string): Observable<any> {
    const params = new HttpParams().set('dept', dept); // Convert id to string
    return this.http.get<any[]>(`${this.apiBaseUrl}/get/kpi-and-action-plans`, {
      params,
    });
  }

  deleteKPIAndActionPlan(id: number) {
    const params = new HttpParams().set('id', id.toString()); // Convert id to string
    return this.http.delete(`${this.apiBaseUrl}/delete/kpi-and-action-plan`, {
      params,
      responseType: 'text', // Set response type to text to prevent JSON parsing
    });
  }

  submitActionPlans(actionPlans: any[]) {
    this.http
      .post<any>(`${this.apiBaseUrl}/submit-action-plans`, actionPlans)
      .subscribe({
        next: () => {
          // Handle success
          this.authService.openSnackBar(
            'Action Plans submitted successfully',
            'Close',
            'bottom'
          );
          this.routerService.routeTo('dashboard');
        },
        error: (error) => {
          // Handle error
          console.error('Error submitting KPIs:', error);
          this.authService.openSnackBar(
            'Failed to submit Action Plans',
            'Close',
            'bottom'
          );
          this.routerService.routeTo('dashboard');
        },
      });
  }

  setIgcfDeadline(deadlineInfo: { dept: string; date: string }) {
    this.http
      .post<any>(`${this.apiBaseUrl}/set/igcf-deadline`, deadlineInfo)
      .subscribe(
        (response) => {
          this.authService.openSnackBar(
            'IGCF deadline set successfully',
            'close',
            'bottom'
          );
        },
        (error) => {
          this.authService.openSnackBar(
            'Failed to set IGCF deadline',
            'close',
            'bottom'
          );
        }
      );
  }

  getIgcfDeadline(dept: string): Observable<any[]> {
    const params = new HttpParams().set('dept', dept);
    return this.http.get<any[]>(`${this.apiBaseUrl}/get/dead-lines`, {
      params,
    });
  }

  deletePendingUser(id: number) {
    return this.http.delete<any>(`${this.apiBaseUrl}/del/pending-user/${id}`);
  }
  updatePendingUser(data: any) {
    return this.http.post(`${this.apiBaseUrl}/update/pending-user`, data);
  }
  acceptPendingUser(data: any): Observable<any> {
    return this.http.post(`${this.apiBaseUrl}/add/accept-pending-user`, data);
  }

  getCurrentIgcfId() {
    return this.currentIgcfId;
  }

  private getEmployeeDetails(): IEmployeeDetails {
    return this.details;
  }

  setUserAccountDetails(user: IUserAccount): void {
    this.accountDetails = user;
  }

  setSubmittedFormValues(igcfValues: any) {
    this.igcfValues = igcfValues;
  }

  getSubmittedIgcfValues() {
    return this.igcfValues;
  }

  signIgcf(info: ISignedIgcf) {
    this.http.post(`${this.apiBaseUrl}/signed-igcf`, info).subscribe({
      next: () => {
        this.authService.openSnackBar(
          'IGCF signed successfully',
          'Close',
          'bottom'
        );
        this.routerService.routeTo('dashboard');
      },
      error: (error) => {
        this.authService.openSnackBar(
          'Error signing IGCF: ' + error.message,
          'Close',
          'bottom'
        );
        this.routerService.routeTo('dashboard');
      },
    });
  }

  private getUserAccountDetails(): IUserAccount {
    return this.accountDetails;
  }

  submitForm() {
    this.http
      .post(`${this.apiBaseUrl}/submit-form`, this.getSubmittedIgcfValues())
      .subscribe({
        next: (response: any) => {
          this.authService.openSnackBar(response.message, 'Close', 'bottom');
          this.routerService.routeTo('dashboard');
        },
        error: (error) => {
          console.error(error);
          this.authService.openSnackBar(
            'Error submitting form. Please try again later.',
            'Close',
            'bottom'
          );
          this.routerService.routeTo('dashboard');
        },
      });
  }

  addEmployeeDetails(): void {
    this.http
      .post(
        `${this.apiBaseUrl}/employee-details/add`,
        this.getEmployeeDetails()
      )
      .subscribe(
        () => {
          this.authService.openSnackBar(
            'Employee Created Successfully',
            'Close',
            'bottom'
          );
        },
        (error) => {
          console.error('Error registering personal:', error);
          // Handle the error, e.g., show an error message to the user
          this.authService.openSnackBar(
            'Failed to create employee details.',
            'Close',
            'bottom'
          );
        }
      );
  }

  addUserAccount() {
    this.http
      .post(`${this.apiBaseUrl}/user/register`, this.getUserAccountDetails())
      .subscribe(
        () => {
          this.authService.openSnackBar(
            'Successfully Created User Account',
            'Close',
            'bottom'
          );
        },
        (error) => {
          console.error('Error registering personal:', error);
          this.authService.openSnackBar(
            'Failed to create user account.',
            'Close',
            'bottom'
          );

          // Handle the error, e.g., show an error message to the user
        }
      );
  }

  addPendingRegistration(userCredentials: IPendingUser) {
    this.http
      .post(`${this.apiBaseUrl}/add/pending-registration`, userCredentials)
      .subscribe(
        () => {
          this.authService.openSnackBar(
            'Pending user account created successfully. It needs to be approved before login.',
            'Close',
            'bottom'
          );
          this.routerService.routeTo('login');
        },
        (error) => {
          console.error('Failed to create pending user account:', error);
          this.authService.openSnackBar(
            'Failed to create pending user account.',
            'Close',
            'bottom'
          );
          this.routerService.routeTo('login');

          // Handle the error, e.g., show an error message to the user
        }
      );
  }

  getPendingUsers(dept: string): Observable<any> {
    const params = new HttpParams().set('dept', dept);
    return this.http.get(`${this.apiBaseUrl}/get/pending-users`, {
      params,
    }) as Observable<IPendingUser[]>;
  }

  setUnconfirmedEmail(email: string): void {
    this.unconfirmedEmail = email;
  }

  private getUnconfirmedEmail(): string {
    return this.unconfirmedEmail;
  }

  checkEmailExistence(): Observable<any> {
    const email = this.getUnconfirmedEmail();
    return this.http.post(`${this.apiBaseUrl}/user/check-existence`, {
      emp_email: email,
    });
  }

  registerUser() {
    this.addEmployeeDetails();
    this.addUserAccount();
  }

  firebaseAddPendingRegistration(userCredentials: any): Observable<any> {
    const {
      email,
      password,
      role,
      emp_firstName,
      emp_lastName,
      emp_number,
      emp_dept,
    } = userCredentials;
    const pendingRegCollection = collection(this.fs, 'pending-registration');

    return from(
      addDoc(pendingRegCollection, {
        email: email,
        password: password,
        role: role,
        emp_firstname: emp_firstName,
        emp_lastname: emp_lastName,
        emp_number: emp_number,
        emp_dept: emp_dept,
      })
    );
  }

  // async checkEmailExistenceFirebase(email: string): Promise<boolean> {
  //   try {
  //     // Reference the 'users' collection
  //     const usersCollection = collection(this.fs, 'users');

  //     // Create a query to find documents with matching email in the 'users' collection
  //     const usersQuery = query(usersCollection, where('email', '==', email));

  //     // Get the documents that match the query in the 'users' collection
  //     const usersSnapshot = await getDocs(usersQuery);

  //     // Check if any documents were found in the 'users' collection
  //     if (!usersSnapshot.empty) {
  //       return true; // Email found in 'users' collection
  //     }

  //     // Reference the 'pending-registration' collection
  //     const pendingRegCollection = collection(this.fs, 'pending-registration');

  //     // Create a query to find documents with matching email in the 'pending-registration' collection
  //     const pendingRegQuery = query(
  //       pendingRegCollection,
  //       where('email', '==', email)
  //     );

  //     // Get the documents that match the query in the 'pending-registration' collection
  //     const pendingRegSnapshot = await getDocs(pendingRegQuery);

  //     // Check if any documents were found in the 'pending-registration' collection
  //     return !pendingRegSnapshot.empty; // Email found in 'pending-registration' collection
  //   } catch (error) {
  //     console.error('Error checking email existence:', error);
  //     throw error;
  //   }
  // }

  async checkEmailExistenceFirebase(email: string): Promise<boolean> {
    try {
      // Reference both the 'users' and 'pending-registration' collections
      const usersCollection = collection(this.fs, 'users');
      const pendingRegCollection = collection(this.fs, 'pending-registration');

      // Create a query to find documents with matching email in the 'users' collection
      const usersQuery = query(usersCollection, where('email', '==', email));

      // Get the documents that match the query in the 'users' collection
      const usersSnapshot = await getDocs(usersQuery);

      // If email exists in 'users' collection, return true
      if (!usersSnapshot.empty) {
        return true;
      }

      // Create a query to find documents with matching email in the 'pending-registration' collection
      const pendingRegQuery = query(
        pendingRegCollection,
        where('email', '==', email)
      );

      // Get the documents that match the query in the 'pending-registration' collection
      const pendingRegSnapshot = await getDocs(pendingRegQuery);

      // Return true if email exists in 'pending-registration' collection, false otherwise
      return !pendingRegSnapshot.empty;
    } catch (error) {
      console.error('Error checking email existence:', error);
      throw error;
    }
  }

  async checkEmployeeNumberExistenceFirebase(emp_number: number) {
    try {
      // Reference both the 'users' and 'pending-registration' collections
      const usersCollection = collection(this.fs, 'users');
      const pendingRegCollection = collection(this.fs, 'pending-registration');

      // Create a query to find documents with matching email in the 'users' collection
      const usersQuery = query(
        usersCollection,
        where('emp_number', '==', emp_number)
      );

      // Get the documents that match the query in the 'users' collection
      const usersSnapshot = await getDocs(usersQuery);

      // If email exists in 'users' collection, return true
      if (!usersSnapshot.empty) {
        return true;
      }

      // Create a query to find documents with matching email in the 'pending-registration' collection
      const pendingRegQuery = query(
        pendingRegCollection,
        where('emp_number', '==', emp_number)
      );
      // Get the documents that match the query in the 'pending-registration' collection
      const pendingRegSnapshot = await getDocs(pendingRegQuery);
      // Return true if email exists in 'pending-registration' collection, false otherwise
      return !pendingRegSnapshot.empty;
    } catch (error) {
      console.error('Error checking email existence:', error);
      throw error;
    }
  }

  // getPendingUsersFirebase(dept: string): Observable<any> {
  //   const pendingRegistrationCollection = collection(
  //     this.fs,
  //     'pending-registration'
  //   );
  //   const q = query(
  //     pendingRegistrationCollection,
  //     where('emp_dept', '==', dept)
  //   );

  //   return collectionData(q);
  // }

  getPendingUsersFirebase(dept: string): Observable<any[]> {
    const pendingRegistrationCollection = collection(
      this.fs,
      'pending-registration'
    );
    const q = query(
      pendingRegistrationCollection,
      where('emp_dept', '==', dept)
    );

    return from(getDocs(q)).pipe(
      map((snapshot: QuerySnapshot<DocumentData>) => {
        return snapshot.docs.map((doc) => {
          const data = doc.data();
          return { id: doc.id, ...data };
        });
      })
    );
  }

  acceptPendingUserFirebase(pendingUserCredentials: any): Observable<void> {
    const {
      emp_firstname,
      emp_lastname,
      emp_number,
      emp_dept,
      email,
      password,
      role,
    } = pendingUserCredentials;

    const empDetailsCollection = collection(this.fs, 'employee-details');
    const userCollection = collection(this.fs, 'users');

    // Create observables for adding documents to 'employee-details' collection
    const addEmployeeDetails$ = from(
      addDoc(empDetailsCollection, {
        firstname: emp_firstname,
        lastname: emp_lastname,
        emp_number,
        department: emp_dept,
      })
    );

    const addUser$ = from(
      addDoc(userCollection, {
        email,
        emp_number,
        password,
        role,
      })
    );

    // Use forkJoin to run both operations concurrently
    return forkJoin([addEmployeeDetails$, addUser$]).pipe(
      map(() => {}), // Return void when both operations are successful
      catchError((error) => {
        console.error('Error accepting pending user:', error);
        throw error; // Throw the error to be caught by the caller
      })
    );
  }

  async deleteDocumentByEmailFirebase(email: string): Promise<any> {
    const q = query(
      collection(this.fs, 'pending-registration'),
      where('email', '==', email)
    );
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
  }

  updateUserInformationFirebase(
    information: any,
    email: string
  ): Observable<any> {
    return new Observable<void>((observer) => {
      const { dept, emp_number, firstname, lastname, position, role } =
        information;
      // Update pending-registration collection
      const pendingRegistrationQuery = query(
        collection(this.fs, 'pending-registration'),
        where('email', '==', email)
      );

      getDocs(pendingRegistrationQuery)
        .then((pendingRegistrationSnapshot) => {
          pendingRegistrationSnapshot.forEach(async (doc) => {
            await updateDoc(doc.ref, {
              emp_dept: dept,
              emp_number,
              emp_firstname: firstname,
              emp_lastname: lastname,
              // emp_position: position,
              role,
            });
          });
          observer.next(); // Emit completion when update is done
          observer.complete();
        })
        .catch((error) => {
          observer.error(error); // Emit error if update fails
        });
    });
  }

  getUsersFirebase(department: string): Observable<any[]> {
    const usersCollection = collection(this.fs, 'users');
    const employeeDetailsCollection = collection(this.fs, 'employee-details');

    // Query to find employee details with the specified department
    const employeeQuery = query(
      employeeDetailsCollection,
      where('department', '==', department)
    );

    return from(getDocs(employeeQuery)).pipe(
      switchMap((employeeSnapshot: QuerySnapshot<DocumentData>) => {
        const users: any[] = [];
        const userObservables: Observable<any>[] = [];

        employeeSnapshot.forEach((employeeDoc) => {
          const employeeData = employeeDoc.data();
          const empNumber = employeeData['emp_number'];
          const empDocId = employeeDoc.id; // Get the document ID of employee details

          // Query to find user with the same emp_number
          const userQuery = query(
            usersCollection,
            where('emp_number', '==', empNumber)
          );
          const userObservable = from(getDocs(userQuery)).pipe(
            map((userSnapshot: QuerySnapshot<DocumentData>) => {
              if (!userSnapshot.empty) {
                const userData = userSnapshot.docs[0].data();
                const userId = userSnapshot.docs[0].id; // Get the document ID of the user
                // Omit the password field
                const { password, ...userDataWithoutPassword } = userData;
                // Merge user and employee details
                const combinedData = {
                  ...userDataWithoutPassword,
                  ...employeeData,
                  userId, // Add the user document ID to the combined data
                  empDocId, // Add the employee details document ID to the combined data
                };
                users.push(combinedData);
              }
            })
          );
          userObservables.push(userObservable);
        });

        // Combine all user observables and wait for them to complete
        return combineLatest(userObservables).pipe(
          map(() => users),
          catchError((error) => {
            console.error('Error getting users:', error);
            throw error; // Optionally, rethrow the error for handling in the component
          })
        );
      })
    );
  }
  deleteUserFirebase(employeeNumber: string, email: string): Observable<any> {
    const userCollection = collection(this.fs, 'users');
    const employeeDetailsCollection = collection(this.fs, 'employee-details');

    // Query to find documents in 'users' collection matching the given employee number and email
    const userQuery = query(
      userCollection,
      where('emp_number', '==', employeeNumber),
      where('email', '==', email)
    );

    return from(getDocs(userQuery)).pipe(
      switchMap((userSnapshot: QuerySnapshot) => {
        const deleteObservables: Observable<void>[] = [];

        // Delete documents found in 'users' collection
        userSnapshot.forEach((userDoc) => {
          const deleteObservable = from(deleteDoc(userDoc.ref));
          deleteObservables.push(deleteObservable);
        });

        // Query to find documents in 'employee-details' collection matching the given employee number
        const employeeQuery = query(
          employeeDetailsCollection,
          where('emp_number', '==', employeeNumber)
        );

        return from(getDocs(employeeQuery)).pipe(
          switchMap((employeeSnapshot: QuerySnapshot) => {
            // Delete documents found in 'employee-details' collection
            employeeSnapshot.forEach((employeeDoc) => {
              const deleteObservable = from(deleteDoc(employeeDoc.ref));
              deleteObservables.push(deleteObservable);
            });

            // Combine all delete observables and wait for them to complete
            return from(Promise.all(deleteObservables));
          })
        );
      }),
      catchError((error) => {
        console.error('Error deleting user:', error);
        throw error; // Optionally, rethrow the error for handling in the component
      })
    );
  }

  submitIGCFirebase(igcfData: any): Observable<any> {
    const submittedIGCFsCollection = collection(this.fs, 'submitted-IGCFs');
    return from(addDoc(submittedIGCFsCollection, igcfData)).pipe(
      catchError((error) => {
        console.error('Error adding document: ', error);
        throw error; // Rethrow the error for handling in the component
      })
    );
  }
  getSubmittedIGCFsFirebase(
    role: string,
    field: string,
    toSearch: string
  ): Observable<any[]> {
    const submittedIGCFsCollection = collection(this.fs, 'submitted-IGCFs');
    if (role === 'Admin' || role === 'Faculty') {
      const q = query(submittedIGCFsCollection, where(field, '==', toSearch));

      return from(getDocs(q)).pipe(
        map((querySnapshot: QuerySnapshot<DocumentData>) => {
          const igcfs: any[] = [];
          querySnapshot.forEach((doc) => {
            igcfs.push(doc.data());
          });
          return igcfs;
        }),
        catchError((error) => {
          console.error('Error getting submitted IGCFs:', error);
          throw error;
        })
      );
    } else {
      return from(getDocs(submittedIGCFsCollection)).pipe(
        map((querySnapshot: QuerySnapshot<DocumentData>) => {
          const igcfs: any[] = [];
          querySnapshot.forEach((doc) => {
            igcfs.push(doc.data());
          });
          return igcfs;
        }),
        catchError((error) => {
          console.error('Error getting submitted IGCFs:', error);
          throw error;
        })
      );
    }
  }
  setYearOfCompletions(yearOfCompletionsList: string[]) {
    this.yearOfCompletions = yearOfCompletionsList;
  }
  getYearOfCompletions() {
    return this.yearOfCompletions;
  }

  getSubmittedIGCFByID(id: string): Observable<any[]> {
    const submittedIGCFsCollection = collection(this.fs, 'submitted-IGCFs');
    const q = query(submittedIGCFsCollection, where('id', '==', id));

    return from(getDocs(q)).pipe(
      map((querySnapshot) => {
        let igcfs: any = {};
        querySnapshot.forEach((doc) => {
          igcfs = doc.data();
        });
        return igcfs;
      }),
      catchError((error) => {
        console.error('Error getting submitted IGCFs by ID:', error);
        throw error;
      })
    );
  }

  rateSubmittedIGCFirebase(id: string, value: any): Observable<any> {
    return new Observable<any>((observer) => {
      // Update pending-registration collection
      const pendingRegistrationQuery = query(
        collection(this.fs, 'submitted-IGCFs'),
        where('id', '==', id)
      );
      getDocs(pendingRegistrationQuery)
        .then((pendingRegistrationSnapshot) => {
          pendingRegistrationSnapshot.forEach(async (doc) => {
            await updateDoc(doc.ref, value);
          });
          observer.next(); // Emit completion when update is done
          observer.complete();
        })
        .catch((error) => {
          observer.error(error); // Emit error if update fails
        });
    });
  }

  // rateSubmittedIGCFirebase(id: string, value: any): Observable<string> {
  //   return new Observable<string>((observer) => {
  //     // Update pending-registration collection
  //     const pendingRegistrationQuery = query(
  //       collection(this.fs, 'submitted-IGCFs'),
  //       where('id', '==', id)
  //     );

  //     getDocs(pendingRegistrationQuery)
  //       .then((pendingRegistrationSnapshot) => {
  //         pendingRegistrationSnapshot.forEach(async (doc) => {
  //           // Get the emp_number from the document data
  //           const empNumber = doc.data()['emp_number'];
  //           console.log(empNumber);

  //           // Update the document
  //           await updateDoc(doc.ref, value);

  //           // Emit the emp_number
  //           observer.next(empNumber);
  //         });
  //         observer.complete(); // Emit completion when update is done
  //       })
  //       .catch((error) => {
  //         observer.error(error); // Emit error if update fails
  //       });
  //   });
  // }

  deleteSubmittedIGCFByID(id: string): Observable<void> {
    return new Observable<void>((observer) => {
      (async () => {
        try {
          const submittedIGCFsCollection = collection(
            this.fs,
            'submitted-IGCFs'
          );

          // Create a query to find the document with the matching ID field
          const q = query(submittedIGCFsCollection, where('id', '==', id));

          // Get the documents that match the query
          const querySnapshot = await getDocs(q);

          // Iterate over the documents and delete each one
          querySnapshot.forEach(async (doc) => {
            // Delete the document
            await deleteDoc(doc.ref);
          });

          // Emit completion when deletion is successful
          observer.next();
          observer.complete();
        } catch (error) {
          console.error('Error deleting documents:', error);
          // Emit error if deletion fails
          observer.error(error);
        }
      })();
    });
  }

  addKpiAndActionPlansFirebase(kpiAndActionPlans: any[]): Observable<any> {
    // Create an array of promises for each document addition
    const promises: Promise<any>[] = [];

    // Iterate through each object in the array and add it as a separate document
    kpiAndActionPlans.forEach((plan) => {
      const promise = addDoc(collection(this.fs, 'kpi-action-plans'), plan);
      promises.push(promise);
    });

    // Merge all promises into a single promise
    return new Observable<void>((observer) => {
      Promise.all(promises)
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  fetchAllObjectivesAndActionPlansByDept(
    department: string
  ): Observable<any[]> {
    const kpiAndActionPlansCollection = collection(this.fs, 'kpi-action-plans');

    // Create a query to filter documents based on the department field
    const q = query(
      kpiAndActionPlansCollection,
      where('dept', '==', department)
    );

    // Execute the query and return the result as an Observable
    return from(getDocs(q)).pipe(
      map((querySnapshot) => {
        const data: any[] = [];
        querySnapshot.forEach((doc: QueryDocumentSnapshot<any>) => {
          data.push(doc.data());
        });
        return data;
      })
    );
  }

  setAllObjectiveAndActionPlansByDept(ObjAndPlans: any[]) {
    this.objAndActionPlans = ObjAndPlans;
  }
  getAllObjectiveAndActionPlansByDept(): any[] {
    return this.objAndActionPlans;
  }

  addLog(log: any): Observable<any> {
    return from(addDoc(collection(this.fs, 'logs'), log)).pipe(
      map((docRef) => {
        return docRef.id;
      }),
      catchError((error) => {
        console.error('Error adding log:', error);
        return throwError(error);
      })
    );
  }
  fetchLogs(department: string): Observable<any[]> {
    const logsCollection = collection(this.fs, 'logs');

    // Create a query to filter logs based on the department field
    const logsQuery = query(
      logsCollection,
      where('department', '==', department)
    );

    return from(getDocs(logsQuery)).pipe(
      map((logsSnapshot) => logsSnapshot.docs.map((doc) => doc.data()))
    );
  }

  updateObjectiveAndActionPlans(
    plan: string,
    dept: string,
    objectiveAndActionPlans: any
  ): Observable<void> {
    return new Observable<void>((observer) => {
      // Find the matching documents based on both plan and department
      const objectiveAndActionPlansQuery = query(
        collection(this.fs, 'kpi-action-plans'),
        where('plan', '==', plan),
        where('dept', '==', dept)
      );

      getDocs(objectiveAndActionPlansQuery)
        .then((objectiveAndActionPlansQuerySnapshot) => {
          // Update the matching documents
          objectiveAndActionPlansQuerySnapshot.forEach(async (doc) => {
            // Perform the update
            await updateDoc(doc.ref, {
              ...objectiveAndActionPlans,
              targets: JSON.parse(objectiveAndActionPlans.targets),
            });
          });

          observer.next(); // Emit completion when update is done
          observer.complete();
        })
        .catch((error) => {
          observer.error(error); // Emit error if update fails
        });
    });
  }

  async sendEmail(
    fromName: string,
    toName: string,
    message: string,
    subject: string,
    to_email: string
    // from_email: string
  ) {
    emailjs.init('f0geW1LMYP7YlUpHa');
    let response = await emailjs.send('service_ip99gnh', 'template_ys3ytn2', {
      from_name: fromName,
      to_name: toName,
      message: message,
      subject: subject,
      to_email: to_email,
      // from_email: from_email,
    });
  }

  fetchHauEmployeeDetails(): Observable<any[]> {
    const hauEmpDetailsCollection = collection(this.fs, 'hau-employees');
    return collectionData(hauEmpDetailsCollection);
  }
}
