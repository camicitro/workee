import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EstadisticasAdminDTO} from './metricas-admin.model';
import { FiltroFechasDTO } from '../filtro-fechas-metricas.model';


@Injectable({
  providedIn: 'root'
})
export class MetricasAdminService {
  
  private apiUrl = 'http://localhost:9090/metricas/admin'; 

  constructor(private http: HttpClient) { }

  traerEstadisticas(filtro: FiltroFechasDTO): Observable<EstadisticasAdminDTO> {
    return this.http.put<EstadisticasAdminDTO>(this.apiUrl, filtro);
  }
}
