import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Modalidad } from './modalidad';

@Injectable({
  providedIn: 'root'
})
export class ModalidadService {
  private url: string = 'http://localhost:9090/modalidadesOferta';
  
  idSubject = new BehaviorSubject<number | null>(null);

  constructor(private http: HttpClient) { };

  findAll(): Observable<Modalidad[]> {
    return this.http.get<Modalidad[]>(this.url);
  }

  findAllActivas(): Observable<Modalidad[]> {
    return this.http.get<Modalidad[]>(`${this.url}/activas`);
  }
  
  findById(idModalidad: number): Observable<Modalidad> {
    return this.http.get<Modalidad>(`${this.url}/${idModalidad}`);
  }
  
  deshabilitar(idModalidad: number) {
    return this.http.delete<void>(`${this.url}/deshabilitar/${idModalidad}`);
  }
  
  habilitar(idModalidad: number) {
    const body = {
      "idModalidad": idModalidad
    }
    return this.http.put<Modalidad>(`${this.url}/habilitar/${idModalidad}`, body);
  }
  
  setId(id: number) {
    this.idSubject.next(id);
  }
  
  getId(){
    return this.idSubject.asObservable();
  }
  
  crearModalidad(nombreModalidadOferta: string){
    const body = {
      "nombreModalidadOferta": nombreModalidadOferta
    }
    return this.http.post(this.url,body);
  }
  
  modificarModalidad(idModalidad: number, nombreModalidadOferta: string) {
    const body = {
      "nombreModalidadOferta": nombreModalidadOferta
    }
    return this.http.put(`${this.url}/${idModalidad}`,body);
  }
}

