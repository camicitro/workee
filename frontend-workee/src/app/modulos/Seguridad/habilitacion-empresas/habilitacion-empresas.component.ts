import { Component, OnInit } from '@angular/core';
import { AdministradorService } from './administrador.service';
import { CommonModule } from '@angular/common';
import { EmpresaPendienteDTO } from './empresa-pendiente-dto';
import { Empresa } from '../../empresa/empresa/empresa';
import { Router } from '@angular/router';

@Component({
  selector: 'app-habilitacion-empresas',
  imports: [CommonModule],
  templateUrl: './habilitacion-empresas.component.html',
  styleUrl: './habilitacion-empresas.component.css'
})
export class HabilitacionEmpresasComponent implements OnInit {
  
  empresas: EmpresaPendienteDTO[] = [];
    
  paginaActual: number = 1;
  elementosPorPagina: number = 10;


  constructor(
    private administradorService: AdministradorService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.administradorService.getEmpresasPorHabilitar().subscribe(data => {
      this.empresas = data;
      console.log(this.empresas);
    })
  }

  // Para paginacion
  get totalPaginas(): number {
    return Math.ceil(this.empresas.length / this.elementosPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  obtenerEmpresasPaginadas(): EmpresaPendienteDTO[] {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    return this.empresas.slice(inicio, fin);
  }

  avanzarPagina(): void {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
    }
  }
  
  retrocederPagina(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }

  irAPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  verDetalleEmpresa(idEmpresa: number){
    this.router.navigate(['/habilitaciones/detalle-empresa', idEmpresa]);
  }
  
}
