import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Empleado } from './empleado';

@Injectable({
  providedIn: 'root'
})
export class EmpleadoService {

  private url: string = 'http://localhost:9090/empleadosEmpresa';
  
  idSubject = new BehaviorSubject<number | null>(null);

  constructor(private http: HttpClient) { };

  findAll(empresaId: number): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(`${this.url}/traerTodos/${empresaId}`);
  }

  findAllActivos(empresaId: number): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(`${this.url}/traerActivos/${empresaId}`);
  }

  cantidadActivos(empresaId: number): Observable<number> {
    return this.http.get<number>(`${this.url}/contarEmpleados/${empresaId}`);
  }
  
  crearEmpleado(nombreEmpleadoEmpresa: string,
                apellidoEmpleadoEmpresa: string,
                puestoEmpleadoEmpresa: string,
                correoEmpleadoEmpresa: string,
                contrasenia: string,
                repetirContrasenia: string,
                idEmpresa: number) {
    const body = {
      "nombreEmpleadoEmpresa": nombreEmpleadoEmpresa,
      "apellidoEmpleadoEmpresa": apellidoEmpleadoEmpresa,
      "puestoEmpleadoEmpresa": puestoEmpleadoEmpresa,
      "correoEmpleadoEmpresa": correoEmpleadoEmpresa,
      "contrasenia": contrasenia,
      "repetirContrasenia": repetirContrasenia,
      "idEmpresa": idEmpresa,
      "urlFotoPerfil": null
    }
    return this.http.post(this.url,body);
  }

  modificarEmpleadoComoEmpresa(puestoEmpleadoEmpresa: string, idEmpleado: number, idEmpresa: number) {
    const body = {
      "nombreEmpleadoEmpresa": null,
      "apellidoEmpleadoEmpresa": null,
      "puestoEmpleadoEmpresa": puestoEmpleadoEmpresa,
      "correoEmpleadoEmpresa": null,
      "contrasenia": null,
      "repetirContrasenia": null,
      "idEmpresa": idEmpresa
    }
    console.log(body);
    return this.http.put(`${this.url}/actualizarPerfilPorAdmin/${idEmpleado}`,body);
  }

  modificarEmpleadoComoEmpleado(nombreEmpleadoEmpresa: string,
                                apellidoEmpleadoEmpresa: string,
                                idEmpleado: number,
                                idEmpresa: number,
                                urlFotoPerfil: string) {
                                  const body = {
      "nombreEmpleadoEmpresa": nombreEmpleadoEmpresa,
      "apellidoEmpleadoEmpresa": apellidoEmpleadoEmpresa,
      "puestoEmpleadoEmpresa": null,
      "correoEmpleadoEmpresa": null,
      "contrasenia": null,
      "repetirContrasenia": null,
      "idEmpresa": idEmpresa,
      "urlFotoPerfil": urlFotoPerfil,
      "contraseniaActual": null
    }
    return this.http.put(`${this.url}/actualizarPerfilPropio/${idEmpleado}`,body);
  }

  setId(id: number) {
    this.idSubject.next(id);
  }
  
  getId(){
    return this.idSubject.asObservable();
  }
  
  findById(idEmpleado: number): Observable<Empleado> {
    return this.http.get<Empleado>(`${this.url}/${idEmpleado}`);
  }

  eliminarEmpleado(idEmpleado: number) {
    return this.http.delete<void>(`${this.url}/${idEmpleado}`);
  }
  habilitarEmpleado(idEmpleado: number){
    return this.http.put(`${this.url}/habilitar/${idEmpleado}`, {});
  }
  
}

