import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Habilidad } from './habilidad';

@Injectable({
  providedIn: 'root'
})
export class HabilidadService {
  private url: string = 'http://localhost:9090/habilidades';
  
  id = new BehaviorSubject<number | null>(null);
  
  idSubject = new BehaviorSubject<number | null>(null);

  constructor(private http: HttpClient) { };

  findAll(): Observable<Habilidad[]> {
    return this.http.get<Habilidad[]>(this.url);
  }

  findAllActivas(): Observable<Habilidad[]> {
    return this.http.get<Habilidad[]>(`${this.url}/activas`);
  }
  
  findById(idHabilidad: number): Observable<Habilidad> {
    return this.http.get<Habilidad>(`${this.url}/${idHabilidad}`);
  }
  
  deshabilitar(idHabilidad: number) {
    return this.http.delete<void>(`${this.url}/deshabilitar/${idHabilidad}`);
  }
  
  habilitar(idHabilidad: number) {
    const body = {
      "idHabilidad": idHabilidad
    }
    return this.http.put<Habilidad>(`${this.url}/habilitar/${idHabilidad}`, body);
  }
  
  setId(id: number) {
    this.idSubject.next(id);
  }
  
  getId(){
    return this.idSubject.asObservable();
  }
  
  crearHabilidad(nombreHabilidad: string, idTipoHabilidad: number){
    const body = {
      "nombreHabilidad": nombreHabilidad,
      "idTipoHabilidad": idTipoHabilidad
    }
    console.log(body);
    return this.http.post(this.url,body);
  }
  
  modificarHabilidad(nombreHabilidad: string, idTipoHabilidad: number, idHabilidad: number) {
    const body = {
      "nombreHabilidad": nombreHabilidad,
      "idTipoHabilidad": idTipoHabilidad
    }
    return this.http.put(`${this.url}/${idHabilidad}`,body);
  }

}

