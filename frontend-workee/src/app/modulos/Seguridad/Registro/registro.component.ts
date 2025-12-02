import { Component, OnInit } from '@angular/core';
import { RegistroEmpresaComponent } from "./Registro Empresa/registro-empresa.component";
import { CommonModule } from '@angular/common';
import { RegistroCandidatoComponent } from "./Registro Candidato/registro-candidato.component";
import { NavbarloginComponent } from '../Login/navbarlogin/navbarlogin.component';
import { Observable } from 'rxjs';
import { SesionService } from '../../../interceptors/sesion.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    CommonModule,
    RegistroEmpresaComponent,
    RegistroCandidatoComponent,
    NavbarloginComponent
],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent implements OnInit{
  //para lo re redireccion
  loading$!: Observable<boolean>;
  modo: 'candidato' | 'empresa' = 'candidato';

  constructor(private sesionService: SesionService){
    
  };

  ngOnInit(): void {
    this.loading$ = this.sesionService.loading$;
    if (!this.sesionService.isLoggedIn()) {
      this.sesionService.setLoading(false);
    }
  }
}
