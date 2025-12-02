import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { EstadoOferta } from './estado-oferta';

@Injectable({
  providedIn: 'root'
})
export class EstadoOfertaService {
  private url: string = 'http://localhost:9090/estadosOferta';
  
  idSubject = new BehaviorSubject<number | null>(null);

  constructor(private http: HttpClient) { };

  findAll(): Observable<EstadoOferta[]> {
    return this.http.get<EstadoOferta[]>(this.url);
  }

  findAllActivos(): Observable<EstadoOferta[]> {
    return this.http.get<EstadoOferta[]>(`${this.url}/activos`);
  }
  
  findById(idEstadoOferta:number): Observable<EstadoOferta> {
    return this.http.get<EstadoOferta>(`${this.url}/${idEstadoOferta}`);
  }
  
  deshabilitar(idEstadoOferta:number) {
    return this.http.delete<void>(`${this.url}/deshabilitar/${idEstadoOferta}`);
  }
  
  habilitar(id:number) {
    const body = {
      "id": id
    }
    return this.http.put<EstadoOferta>(`${this.url}/habilitar/${id}`, body);
  }
  
  setId(id: number) {
    this.idSubject.next(id);
  }
  
  getId(){
    return this.idSubject.asObservable();
  }
  
  crearEstadoOferta(nombreEstadoOferta: string){
    const body = {
      "nombreEstadoOferta": nombreEstadoOferta
    }
    return this.http.post(this.url,body);
  }
  
  modificarEstadoOferta(idEstadoOferta: number, nombreEstadoOferta: string) {
    const body = {
      "nombreEstadoOferta": nombreEstadoOferta
    }
    return this.http.put(`${this.url}/${idEstadoOferta}`,body);
  }
}
