import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Rubro } from './rubro';

@Injectable({
  providedIn: 'root'
})
export class RubroService {
  private url: string = 'http://localhost:9090/rubros';
  
  idSubject = new BehaviorSubject<number | null>(null);

  constructor(private http: HttpClient) { };

  findAll(): Observable<Rubro[]> {
    return this.http.get<Rubro[]>(this.url);
  }

  findAllActivos(): Observable<Rubro[]> {
    return this.http.get<Rubro[]>(`${this.url}/activos`);
  }
  
  findById(idRubro:number): Observable<Rubro> {
    return this.http.get<Rubro>(`${this.url}/${idRubro}`);
  }
  
  deshabilitar(idRubro:number) {
    return this.http.delete<void>(`${this.url}/deshabilitar/${idRubro}`);
  }
  
  habilitar(idRubro:number) {
    const body = {
      "idRubro": idRubro
    }
    return this.http.put<Rubro>(`${this.url}/habilitar/${idRubro}`, body);
  }
  
  setId(id: number) {
    this.idSubject.next(id);
  }
  
  getId(){
    return this.idSubject.asObservable();
  }
  
  crearRubro(nombreRubro: string){
    const body = {
      "nombreRubro": nombreRubro
    }
    return this.http.post(this.url,body);
  }
  
  modificarRubro(idRubro: number, nombreRubro: string) {
    const body = {
      "nombreRubro": nombreRubro
    }
    return this.http.put(`${this.url}/${idRubro}`,body);
  }
}
