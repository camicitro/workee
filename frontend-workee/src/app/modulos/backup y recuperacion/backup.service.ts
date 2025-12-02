import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class BackupService {
  private url = 'http://localhost:9090/backup';

  idSubject = new BehaviorSubject<number | null>(null);

  constructor(private http: HttpClient) {}

  // Devuelve texto plano => responseType 'text'
  generarBackup(): Observable<string> {
    return this.http.post(`${this.url}/generarBackup`, null, {
      responseType: 'text' as 'text'
    });
  }

  listarBackups(): Observable<string[]> {
    return this.http.get<string[]>(`${this.url}/listarBackups`);
  }

  // El backend espera PathVariable => ponemos el nombre en la URL
  restaurarBackup(nombreBackup: string): Observable<string> {
    const nombre = encodeURIComponent(nombreBackup);
    return this.http.post(`${this.url}/restaurarBackup/${nombre}`, null, {
      responseType: 'text' as 'text'
    });
  }
}
