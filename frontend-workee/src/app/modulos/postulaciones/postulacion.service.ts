import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, map, Observable } from "rxjs";
import { PostulacionSimplificadaDTO } from "./postulacion-simplificada-dto";
import { PostulacionOferta } from "./postulacion-oferta";

@Injectable({
  providedIn: 'root'
})
export class PostulacionService {

  private url: string = 'http://localhost:9090/postulaciones';

  idSubject = new BehaviorSubject<number | null>(null);

  constructor(private http: HttpClient) { };

  getPostulaciones(idCandidato: number): Observable<PostulacionSimplificadaDTO[]> {
    return this.http.get<PostulacionSimplificadaDTO[]>(`${this.url}/${idCandidato}/postulaciones`);
  }

  getPostulacion(idPostulacion: number): Observable<PostulacionSimplificadaDTO> {
    return this.http.get<PostulacionSimplificadaDTO>(`${this.url}/${idPostulacion}`);
  }

  getPostulacionEntera(idPostulacion: number): Observable<PostulacionOferta> {
    return this.http.get<PostulacionOferta>(`${this.url}/${idPostulacion}`);
  }

  postular(idCandidato: number, idOferta: number) {
    const body = {
      "idCandidato": idCandidato,
      "idOferta": idOferta
    }
    return this.http.post(`${this.url}`, body);
  }

  abandonar(idPostulacion: number) {
    return this.http.put(`${this.url}/${idPostulacion}/abandonar`,"");
  }
  
  aceptarPostulacionPendiente(idPostulacion: number) {
    return this.http.put(`${this.url}/${idPostulacion}/aceptar`,"");
  }
  
  rechazarPostulacionPendiente(idPostulacion: number) {
    return this.http.put(`${this.url}/${idPostulacion}/rechazar`,"");
  }
  
  responderComoCandidato(idPostulacion: number, idPostulacionOfertaEtapa: number, retroalimentacion: string) {
    const body = {
      "idPostulacion": idPostulacion,
      "idPostulacionOfertaEtapa": idPostulacionOfertaEtapa,
      "retroalimentacion": retroalimentacion
    }
    return this.http.put(`${this.url}/respuestaCandidato`,body);
  }
  
  enviarOfertaACandidato(idCandidato: number, idOferta: number) {
    const body = {
      "idCandidato": idCandidato,
      "idOferta": idOferta
    }
    console.log("envio la request, candidato: " + idCandidato + " oferta: " + idOferta);
    return this.http.post(`${this.url}/enviarACandidato`, body);
  }
  
  actualizarEtapa(idPostulacion: number, codigoEtapaActual: string, codigoEtapaNueva: string, retroalimentacion: string) {
    const body = {
      "codigoEtapaActual": codigoEtapaActual,
      "codigoEtapaNueva": codigoEtapaNueva,
      "retroalimentacion": retroalimentacion
    }
    console.log("actualizo etapa de candidato: " + idPostulacion + " etapa actual: " + codigoEtapaActual + " etapa nueva: " + codigoEtapaNueva + " retro: " + retroalimentacion);
    return this.http.put(`${this.url}/${idPostulacion}`, body);
  }
  
  seleccionarCandidato(idPostulacion: number, valor: boolean, retroalimentacion: string) {
    // En este valor se manda si se desea seguir seleccionando o es el unico
    const body = {
      "soloEste": valor,
      "retroalimenetacion": retroalimentacion
    }
    console.log("selecciono candidato: " + idPostulacion + " valor: " + valor + " retro: " + retroalimentacion);
    return this.http.put(`${this.url}/${idPostulacion}/seleccionar`, body);
  }
  
  enviarRetroalimentacion(idPostulacion: number, idPostulacionOfertaEtapa: number, retroalimentacion: string) {
    const body = {
      "idPostulacion": idPostulacion,
      "idPostulacionOfertaEtapa": idPostulacionOfertaEtapa,
      "retroalimentacion": retroalimentacion
    }
    return this.http.put(`${this.url}/retroalimentacion`, body);
  }

  rechazarPostulacionComoCandidato(idPostulacion: number){
    return this.http.put(`${this.url}/${idPostulacion}/rechazarComoCandidato`, null);
  }

  // obtenerpostulacionPorIdNotificacion(idNotificacion: number): Observable<number> {
  //   return this.http.get<number>(`${this.url}/porIdNotif/${idNotificacion}`);
  // }

  obtenerpostulacionPorIdNotificacion(idNotificacion: number) {
  const url = `${this.url}/porIdNotif/${idNotificacion}`;
  return this.http.get<number | { idPostulacionOferta: number }>(url).pipe(
    map((resp) =>
      typeof resp === 'number'
        ? resp
        : resp?.idPostulacionOferta // backend actual
    )
  );
}

}
