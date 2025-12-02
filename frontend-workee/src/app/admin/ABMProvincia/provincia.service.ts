import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Provincia } from './provincia';

@Injectable({
  providedIn: 'root'
})
export class ProvinciaService {
  private url: string = 'http://localhost:9090/provincias';
  id = new BehaviorSubject<number | null>(null);
  
  idSubject = new BehaviorSubject<number | null>(null);

  constructor(private http: HttpClient) { };

  getProvinciasPorPais(idPais: number): Observable<Provincia[]> {
    console.log("Imprimo desde el service, el id del pais es ", idPais)
    return this.http.get<Provincia[]>(`${this.url}/provinciasPorPais/${idPais}`);
  }

  findAll(): Observable<Provincia[]> {
    return this.http.get<Provincia[]>(this.url);
  }

  findAllActivas(): Observable<Provincia[]> {
    return this.http.get<Provincia[]>(`${this.url}/activas`);
  }
  
  findById(idProvincia: number): Observable<Provincia> {
    return this.http.get<Provincia>(`${this.url}/${idProvincia}`);
  }
  
  deshabilitar(idProvincia: number) {
    return this.http.delete<void>(`${this.url}/deshabilitar/${idProvincia}`);
  }
  
  habilitar(idProvincia: number) {
    const body = {
      "idProvincia": idProvincia
    }
    return this.http.put<Provincia>(`${this.url}/habilitar/${idProvincia}`, body);
  }
  
  setId(id: number) {
    this.idSubject.next(id);
  }
  
  getId(){
    return this.idSubject.asObservable();
  }
  
  crearProvincia(nombreProvincia: string, idPais: number){
    const body = {
      "nombreProvincia": nombreProvincia,
      "idPais": idPais
    }
    return this.http.post(this.url,body);
  }
  
  modificarProvincia(nombreProvincia: string, idPais: number, idProvincia: number) {
    const body = {
      "nombreProvincia": nombreProvincia,
      "idPais": null
    }
    return this.http.put(`${this.url}/${idProvincia}`,body);
  }

}
