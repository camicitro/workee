import { Injectable } from '@angular/core';
import { EstadoBusquedaLaboral } from './estado-busqueda-laboral';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EstadoBusquedaLaboralService {
  private url: string = 'http://localhost:9090/estadosBusqueda';
  
  idSubject = new BehaviorSubject<number | null>(null);

  constructor(private http: HttpClient) { };

  findAll(): Observable<EstadoBusquedaLaboral[]> {
    return this.http.get<EstadoBusquedaLaboral[]>(this.url);
  }
  
  findAllActivos(): Observable<EstadoBusquedaLaboral[]> {
    return this.http.get<EstadoBusquedaLaboral[]>(`${this.url}/activos`);
  }
  
  findById(idEstadoBusquedaLaboral:number): Observable<EstadoBusquedaLaboral> {
    return this.http.get<EstadoBusquedaLaboral>(`${this.url}/${idEstadoBusquedaLaboral}`);
  }
  
  deshabilitar(idEstadoBusquedaLaboral:number) {
    return this.http.delete<void>(`${this.url}/deshabilitar/${idEstadoBusquedaLaboral}`);
  }
  
  habilitar(id:number) {
    const body = {
      "id": id
    }
    return this.http.put<EstadoBusquedaLaboral>(`${this.url}/habilitar/${id}`, body);
  }
  
  setId(id: number) {
    this.idSubject.next(id);
  }
  
  getId(){
    return this.idSubject.asObservable();
  }
  
  crearEstadoBusquedaLaboral(nombreEstadoBusqueda: string){
    const body ={
      "nombreEstadoBusqueda": nombreEstadoBusqueda
    }
    return this.http.post(this.url,body);
  }
  
  modificarEstadoBusquedaLaboral(idEstadoBusquedaLaboral: number, nombreEstadoBusqueda: string) {
    console.log("llego al modificar del service")
    const body = {
      "nombreEstadoBusqueda": nombreEstadoBusqueda
    }
    return this.http.put(`${this.url}/${idEstadoBusquedaLaboral}`,body);
  }
}
