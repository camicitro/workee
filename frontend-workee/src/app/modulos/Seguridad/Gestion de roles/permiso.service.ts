import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { permiso } from "./permiso";

@Injectable({
  providedIn: 'root'
})
export class PermisoService {
  private url: string = 'http://localhost:9090/permisos';
  
  idSubject = new BehaviorSubject<number | null>(null);

  constructor(private http: HttpClient) { };

  permisosdeunaCategoria(idCategoria: number): Observable<permiso[]>{
    return this.http.get<permiso[]>(`${this.url}/${idCategoria}`);
  }

  permisosdeunRol(idRol: number){
    return this.http.get<permiso[]>(`${this.url}/porRol/${idRol}`);
  }
  
}

