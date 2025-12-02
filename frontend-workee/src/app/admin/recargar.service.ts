import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecargarService {
  private recargaSubject = new Subject<void>();
  recargar$ = this.recargaSubject.asObservable();

  emitirRecarga() {
    this.recargaSubject.next();
  }

}
