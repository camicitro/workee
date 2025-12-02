import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Genero } from './genero';

@Injectable({
  providedIn: 'root'
})
export class GeneroService {
private url: string = 'http://localhost:9090/generos';
  
  idSubject = new BehaviorSubject<number | null>(null);

  constructor(private http: HttpClient) { };

  findAll(): Observable<Genero[]> {
    return this.http.get<Genero[]>(this.url);
  }

  findAllActivos(): Observable<Genero[]> {
    return this.http.get<Genero[]>(`${this.url}/activos`);
  }
  
  findById(idGenero: number): Observable<Genero> {
    return this.http.get<Genero>(`${this.url}/${idGenero}`);
  }
  
  deshabilitar(idGenero: number) {
    return this.http.delete<void>(`${this.url}/deshabilitar/${idGenero}`);
  }
  
  habilitar(idGenero: number) {
    const body = {
      "idGenero": idGenero
    }
    return this.http.put<Genero>(`${this.url}/habilitar/${idGenero}`, body);
  }
  
  setId(id: number) {
    this.idSubject.next(id);
  }
  
  getId(){
    return this.idSubject.asObservable();
  }
  
  crearGenero(nombreGenero: string){
    const body = {
      "nombreGenero": nombreGenero
    }
    return this.http.post(this.url,body);
  }
  
  modificarGenero(idGenero: number, nombreGenero: string) {
    console.log("llego al modificar del service")
    const body = {
      "nombreGenero": nombreGenero
    }
    return this.http.put(`${this.url}/${idGenero}`,body);
  }
}

