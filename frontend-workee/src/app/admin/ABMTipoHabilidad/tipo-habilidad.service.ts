import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TipoHabilidad } from './tipo-habilidad';

@Injectable({
  providedIn: 'root'
})
export class TipoHabilidadService {
  private url: string = 'http://localhost:9090/tipoHabilidades';
  
  idSubject = new BehaviorSubject<number | null>(null);

  constructor(private http: HttpClient) { };

  findAll(): Observable<TipoHabilidad[]> {
    return this.http.get<TipoHabilidad[]>(this.url);
  }

  findAllActivos(): Observable<TipoHabilidad[]> {
    return this.http.get<any[]>(`${this.url}/activos`);
  }
  
  findById(idTipoHabilidad: number): Observable<TipoHabilidad> {
    return this.http.get<TipoHabilidad>(`${this.url}/${idTipoHabilidad}`);
  }
  
  deshabilitar(idTipoHabilidad: number) {
    return this.http.delete<void>(`${this.url}/deshabilitar/${idTipoHabilidad}`);
  }
  
  habilitar(idTipoHabilidad: number) {
    const body = {
      "idTipoHabilidad": idTipoHabilidad
    }
    return this.http.put<TipoHabilidad>(`${this.url}/habilitar/${idTipoHabilidad}`, body);
  }
  
  setId(id: number) {
    this.idSubject.next(id);
  }
  
  getId(){
    return this.idSubject.asObservable();
  }
  
  crearTipoHabilidad(nombreTipoHabilidad: string){
    const body = {
      "nombreTipoHabilidad": nombreTipoHabilidad
    }
    return this.http.post(this.url,body);
  }
  
  modificarTipoHabilidad(idTipoHabilidad: number, nombreTipoHabilidad: string) {
    const body = {
      "nombreTipoHabilidad": nombreTipoHabilidad
    }
    return this.http.put(`${this.url}/${idTipoHabilidad}`,body);
  }
}

