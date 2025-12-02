import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EmpresaPendienteDTO } from './empresa-pendiente-dto';
import { Empresa } from '../../empresa/empresa/empresa';

@Injectable({
  providedIn: 'root'
})
export class AdministradorService {
  
  private url = 'http://localhost:9090/administrador';
  
  constructor(private http: HttpClient) {}

  getEmpresasPorHabilitar(): Observable<EmpresaPendienteDTO[]> {
    return this.http.get<EmpresaPendienteDTO[]>(`${this.url}/habilitaciones`);
  }

  /*findById(idEmpresa: number): Observable<Empresa> {
    return this.http.get<Empresa>(`${this.url}/${idEmpresa}`);
  }*/

  habilitarEmpresa(idEmpreas: number){
    return this.http.put(`${this.url}/habilitaciones/habilitar/${idEmpreas}`, null, { responseType: 'text' });
  }

  rechazarEmpresa(idEmpreas: number){
    return this.http.put(`${this.url}/habilitaciones/rechazar/${idEmpreas}`, null, { responseType: 'text' });
  }

}

