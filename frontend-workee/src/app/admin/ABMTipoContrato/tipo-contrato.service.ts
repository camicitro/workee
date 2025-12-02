import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TipoContrato } from './tipo-contrato';

@Injectable({
  providedIn: 'root'
})
export class TipoContratoService {
  private url: string = 'http://localhost:9090/tiposContratoOferta';
  
  idSubject = new BehaviorSubject<number | null>(null);

  constructor(private http: HttpClient) { };

  findAll(): Observable<TipoContrato[]> {
    return this.http.get<TipoContrato[]>(this.url);
  }

  findAllActivos(): Observable<TipoContrato[]> {
    return this.http.get<TipoContrato[]>(`${this.url}/activos`);
  }
  
  findById(idTipoContrato: number): Observable<TipoContrato> {
    return this.http.get<TipoContrato>(`${this.url}/${idTipoContrato}`);
  }
  
  deshabilitar(idTipoContrato: number) {
    return this.http.delete<void>(`${this.url}/deshabilitar/${idTipoContrato}`);
  }
  
  habilitar(idTipoContrato: number) {
    const body = {
      "idTipoContrato": idTipoContrato
    }
    return this.http.put<TipoContrato>(`${this.url}/habilitar/${idTipoContrato}`, body);
  }
  
  setId(id: number) {
    this.idSubject.next(id);
  }
  
  getId(){
    return this.idSubject.asObservable();
  }
  
  crearTipoContrato(nombreTipoContratoOferta: string){
    const body = {
      "nombreTipoContratoOferta": nombreTipoContratoOferta
    }
    return this.http.post(this.url,body);
  }
  
  modificarTipoContrato(idTipoContrato: number, nombreTipoContratoOferta: string) {
    const body = {
      "nombreTipoContratoOferta": nombreTipoContratoOferta
    }
    return this.http.put(`${this.url}/${idTipoContrato}`,body);
  }
}


