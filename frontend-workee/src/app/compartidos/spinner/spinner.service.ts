import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {

  spinnerState: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(protected router: Router) { }

  showSpinner() {
    this.spinnerState.next(true);
  }

  hideSpinner() {
    this.spinnerState.next(false);
  }

  getSpinnerState(): Observable<boolean> {
    return this.spinnerState.asObservable();
  }
}
