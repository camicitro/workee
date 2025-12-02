import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TipoEvento } from './tipo-evento';

@Injectable({
  providedIn: 'root'
})
export class TipoEventoService {
private url: string = 'http://localhost:9090/tiposEvento';
  
  idSubject = new BehaviorSubject<number | null>(null);

  constructor(private http: HttpClient) { };

  findAll(): Observable<TipoEvento[]> {
    return this.http.get<TipoEvento[]>(this.url);
  }

  findAllActivos(): Observable<TipoEvento[]> {
    return this.http.get<TipoEvento[]>(`${this.url}/activos`);
  }
  
  findById(idTipoEvento: number): Observable<TipoEvento> {
    return this.http.get<TipoEvento>(`${this.url}/${idTipoEvento}`);
  }
  
  deshabilitar(idTipoEvento: number) {
    return this.http.delete<void>(`${this.url}/deshabilitar/${idTipoEvento}`);
  }
  
  habilitar(idTipoEvento: number) {
    const body = {
      "idTipoEvento": idTipoEvento
    }
    return this.http.put<TipoEvento>(`${this.url}/habilitar/${idTipoEvento}`, body);
  }
  
  setId(id: number) {
    this.idSubject.next(id);
  }
  
  getId(){
    return this.idSubject.asObservable();
  }
  
  crearTipoEvento(nombreTipoEvento: string){
    const body = {
      "nombreTipoEvento": nombreTipoEvento
    }
    return this.http.post(this.url,body);
  }
  
  modificarTipoEvento(idTipoEvento: number, nombreTipoEvento: string) {
    const body = {
      "nombreTipoEvento": nombreTipoEvento
    }
    return this.http.put(`${this.url}/${idTipoEvento}`,body);
  }
}

