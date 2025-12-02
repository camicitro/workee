import { Component, OnInit } from '@angular/core';
import { NavbarloginComponent } from '../../modulos/seguridad/Login/navbarlogin/navbarlogin.component';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { SesionService } from '../../interceptors/sesion.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagina-inicio',
  standalone: true, // 👈🏼 Importante si estás usando imports directos como `NavbarloginComponent`
  imports: [CommonModule, NavbarloginComponent, RouterModule],
  templateUrl: './pagina-inicio.component.html',
  styleUrls: ['./pagina-inicio.component.css'] 
})
export class PaginaInicioComponent implements OnInit{ 
    //para lo re redireccion
  loading$!: Observable<boolean>;

  constructor(private sesionService: SesionService){
    
  };

  ngOnInit(): void {
    this.loading$ = this.sesionService.loading$;
    if (!this.sesionService.isLoggedIn()) {
      this.sesionService.setLoading(false);
    }
  }

  scrollSmooth(id: string): void {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

}
