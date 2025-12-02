import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Categoria } from "../categoria";

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private url: string = 'http://localhost:9090/categoriasRoles';
  
  idSubject = new BehaviorSubject<number | null>(null);

  constructor(private http: HttpClient) { };

  findAll(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.url);
  }
  
}

