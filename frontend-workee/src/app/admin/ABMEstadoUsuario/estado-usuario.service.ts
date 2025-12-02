import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { EstadoUsuario } from './estado-usuario';

@Injectable({
  providedIn: 'root'
})
export class EstadoUsuarioService {
  private url: string = 'http://localhost:9090/estadosUsuario';
  
  idSubject = new BehaviorSubject<number | null>(null);

  constructor(private http: HttpClient) { };

  findAll(): Observable<EstadoUsuario[]> {
    return this.http.get<EstadoUsuario[]>(this.url);
  }
  
  findById(id: number): Observable<EstadoUsuario> {
    return this.http.get<EstadoUsuario>(`${this.url}/${id}`);
  }
  
  deshabilitar(id: number) {
    return this.http.delete<void>(`${this.url}/deshabilitar/${id}`);
  }
  
  habilitar(id: number) {
    const body = {
      "id": id
    }
    return this.http.put<EstadoUsuario>(`${this.url}/habilitar/${id}`, body);
  }
  
  setId(id: number) {
    this.idSubject.next(id);
  }
  
  getId(){
    return this.idSubject.asObservable();
  }
  
  crearEstadoUsuario(nombreEstadoUsuario: string){
    const body = {
      "nombreEstadoUsuario": nombreEstadoUsuario
    }
    return this.http.post(this.url,body);
  }
  
  modificarEstadoUsuario(id: number, nombreEstadoUsuario: string) {
    const body = {
      "nombreEstadoUsuario": nombreEstadoUsuario
    }
    return this.http.put(`${this.url}/${id}`,body);
  }
}

