import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FiltroUbicacion } from './busqueda-empresas/filtro-ubicacion';
import { Empresa } from '../empresa/empresa/empresa';
import { Candidato } from '../candidato/candidato';
import { Oferta } from '../oferta/oferta';
import { BusquedaEmpresa } from './busqueda-empresas/busqueda-empresa';

@Injectable({
  providedIn: 'root'
})
export class BusquedaService {
  private url: string = 'http://localhost:9090/busquedas';
  
  idSubject = new BehaviorSubject<number | null>(null);

  constructor(private http: HttpClient) { };

  filtroUbicacion(): Observable<FiltroUbicacion[]> {
    return this.http.get<FiltroUbicacion[]>(`${this.url}/filtroUbicacion`);
  }
  
  buscarEmpresasPorNombre(texto: string): Observable<BusquedaEmpresa[]> {
    return this.http.get<BusquedaEmpresa[]>(`${this.url}/empresasPorNombre?nombreEmpresa=${texto}`);
  }
  
  filtrarEmpresas(
                  nombreEmpresa: string | null,
                  idsRubros: number[] | null,
                  idsProvincias: number[] | null,
                  tieneOfertasAbiertas: boolean | null
                ): Observable<BusquedaEmpresa[]> {
    const body = {
      "nombreEmpresa": nombreEmpresa,
      "idsRubros": idsRubros,
      "idsProvincias": idsProvincias,
      "tieneOfertasAbiertas": tieneOfertasAbiertas
    }
    console.log("estoy desde el service, este es el body: ", body);
    return this.http.post<BusquedaEmpresa[]>(`${this.url}/empresasFiltradas`, body);
  }
  
  buscarCandidatosPorNombre(texto: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/candidatosPorNombre?nombreCandidato=${texto}`);
  }
  
  filtrarCandidatos(
                  nombreCandidato: string | null,
                  idsProvincias: number[] | null,
                  idsPaises: number[] | null,
                  idsHabilidades: number[] | null,
                  idsEstadosDeBusqueda: number[] | null,
                ): Observable<Candidato[]> {
    const body = {
      "nombreCandidato": nombreCandidato,
      "idsProvincias": idsProvincias,
      "idsPaises": idsPaises,
      "idsHabilidades": idsHabilidades,
      "idsEstadosDeBusqueda": idsEstadosDeBusqueda,
    }
    console.log("estoy desde el service, este es el body: ", body);
    return this.http.post<Candidato[]>(`${this.url}/candidatosFiltrados`, body);
  }
  
  buscarOfertasPorNombre(texto: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/ofertasPorNombre?nombreOferta=${texto}`);
  }
  
  filtrarOfertas(
                  nombreOferta: string | null,
                  idsProvincias: number[] | null,
                  idsTipoContrato: number[] | null,
                  idsModalidadOferta: number[] | null,
                  fechaFiltro: string | null,
                ): Observable<Oferta[]> {
    const body = {
      "nombreOferta": nombreOferta,
      "idsProvincias": idsProvincias,
      "idsTipoContrato": idsTipoContrato,
      "idsModalidadOferta": idsModalidadOferta,
      "fechaFiltro": fechaFiltro,
    }
    console.log("estoy desde el service, este es el body: ", body);
    return this.http.post<Oferta[]>(`${this.url}/ofertasFiltradas`, body);
  }

}
