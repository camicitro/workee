import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { ConfirmarCuentaResponse } from "./Registro/Confirmacion/confirmar-cuenta-interface";
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class AuthService {

    private url = 'http://localhost:9090/auth';

    constructor(private http: HttpClient, ) {}

    registrarCandidato(
    nombreCandidato: string,
    apellidoCandidato: string,
    fechaDeNacimiento: Date,
    idProvincia: number,
    idEstadoBusqueda: number,
    idGenero: number,
    idHabilidades: number[],
    enlaceCV: string,
    correoCandidato: string,
    contrasenia: string,
    repetirContrasenia: string,
    urlFotoPerfil: string
  ) {
    const body = {
      nombreCandidato,
      apellidoCandidato,
      fechaDeNacimiento,
      idProvincia,
      idEstadoBusqueda,
      idGenero,
      idHabilidades,
      enlaceCV,
      correoCandidato,
      contrasenia,
      repetirContrasenia,
      urlFotoPerfil
    };
    return this.http.post(`${this.url}/registroCandidato`, body);
  }

  registrarEmpresa(
    nombreEmpresa: string,
    descripcionEmpresa: string,
    telefonoEmpresa: number,
    direccionEmpresa: string,
    idRubro: number,
    numeroIdentificacionFiscal: string,
    emailEmpresa: string,
    contrasenia: string,
    repetirContrasenia: string,
    idProvincia: number,
    urlFotoPerfil: string,
    urlDocumentoLegal: string,
    sitioWebEmpresa: string
  ) {
  const body = {
      sitioWebEmpresa,
      nombreEmpresa,
      descripcionEmpresa,
      telefonoEmpresa,
      direccionEmpresa,
      idRubro,
      numeroIdentificacionFiscal,
      emailEmpresa,
      contrasenia,
      repetirContrasenia,
      idProvincia,
      urlFotoPerfil,
      urlDocumentoLegal
  };
    return this.http.post(`${this.url}/registroEmpresa`, body);
  }

login(correo: string, contrasenia: string) {
  return this.http.post(
    'http://localhost:9090/auth/login',
    { correo, contrasenia },
    { responseType: 'text' } // <--- evita el error de parseo
  );
}

confirmarcuenta(token: string) {
  const body = { token };
  return this.http.put<any>(`${this.url}/confirmarCuenta`, body);
}

solicitarRecuperarContrasenia(correo: string) {
  const body = { correo };
  return this.http.put(`${this.url}/recuperarContrasenia`, body);
}

recuperarcontrasenia(
  token: string,
  contraseniaNueva: string,
  repetirContrasenia: string
) {
  const body = {
    contraseniaNueva,
    repetirContrasenia
  };

  return this.http.put<any>(
    `${this.url}/confirmarRecuperacionContrasenia?token=${token}`,
    { contraseniaNueva, repetirContrasenia }
  );
}


}



