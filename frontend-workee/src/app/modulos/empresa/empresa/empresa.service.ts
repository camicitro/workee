// service-visualizar-perfil-empresa.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Empresa } from './empresa';
import { SesionService } from '../../../interceptors/sesion.service';

@Injectable({
  providedIn: 'root',
})
export class EmpresaService {
  private url = 'http://localhost:9090/empresas';

  constructor(
    private http: HttpClient,
    private sesionService: SesionService,
  ) {}
  
  findById(idEmpresa: number): Observable<Empresa> {
    return this.http.get<Empresa>(`${this.url}/${idEmpresa}`);
  }
  
  modificarEmpresa(idEmpresa: number,
                    nombreEmpresa: string,
                    descripcionEmpresa: string,
                    idRubro: number,
                    telefonoEmpresa: number,
                    direccionEmpresa: string,
                    sitioWebEmpresa: string,
                    urlFotoPerfil: string) {
    const body = {
      "sitioWebEmpresa": sitioWebEmpresa,
      "nombreEmpresa": nombreEmpresa,
      "descripcionEmpresa": descripcionEmpresa,
      "telefonoEmpresa": telefonoEmpresa,
      "direccionEmpresa": direccionEmpresa,
      "idRubro": idRubro,
      "numeroIdentificacionFiscal": null,
      "emailEmpresa": null,
      "contrasenia": null,
      "repetirContrasenia": null,
      "idProvincia": null,
      "urlFotoPerfil": urlFotoPerfil,
      "urlDocumentoLegal": null
    }
    console.log("estoy desde el service, este es mi cuerpa: ", body);
    return this.http.put(`${this.url}/modificarPerfil/${idEmpresa}`, body);
  }

  eliminarEmpresa(idEmpresa: number) {
    return this.http.delete(`${this.url}/${idEmpresa}`, { responseType: 'text' });
  }

  getidEmpresabyCorreo(){
    const correo = this.sesionService.getCorreoUsuario();
    if (!correo) {
      console.error("No se pudo obtener el correo del token para obtener el id Empresa.");
      return;
    }
    return this.http.get<number>(`${this.url}/idEmpresaPorCorreo/${correo}`);
  }

}