import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Pais } from './pais';

@Injectable({
  providedIn: 'root'
})
export class PaisService {
  private url: string = 'http://localhost:9090/paises';
  
  idSubject = new BehaviorSubject<number | null>(null);

  constructor(private http: HttpClient) { };

  findAll(): Observable<Pais[]> {
    return this.http.get<Pais[]>(this.url);
  }

  findAllActivos(): Observable<Pais[]> {
    return this.http.get<Pais[]>(`${this.url}/activos`);
  }
  
  findById(idPais:number): Observable<Pais> {
    return this.http.get<Pais>(`${this.url}/${idPais}`);
  }
  
  deshabilitar(idPais:number) {
    // console.log("Deshabilito pais con id: " + idPais);
    return this.http.delete<void>(`${this.url}/deshabilitar/${idPais}`);
  }
  
  habilitar(idPais:number) {
    // console.log("Habilito pais con id: " + idPais);
    const body = {
      "idPais": idPais
    }
    return this.http.put<Pais>(`${this.url}/habilitar/${idPais}`, body);
  }
  
  setId(id: number) {
    this.idSubject.next(id);
  }
  
  getId(){
    return this.idSubject.asObservable();
  }
  
  crearPais(nombrePais: string){
    const body ={
      "nombrePais": nombrePais
    }
    return this.http.post(this.url,body);
  }
  
  modificarPais(idPais: number, nombrePais: string) {
    // console.log("llego al modificar del service")
    const body = {
      "nombrePais": nombrePais
    }
    return this.http.put(`${this.url}/${idPais}`,body);
  }
}
