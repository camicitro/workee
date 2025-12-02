import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TipoContrato } from '../tipo-contrato';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TipoContratoService } from '../tipo-contrato.service';
import { RecargarService } from '../../recargar.service';
import { ModalService } from '../../../compartidos/modal/modal.service';
import { CrearTipoContratoComponent } from '../crear-tipo-contrato/crear-tipo-contrato.component';
import { ModificarTipoContratoComponent } from '../modificar-tipo-contrato/modificar-tipo-contrato.component';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-listado-tipos-contrato',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './listado-tipos-contrato.component.html',
  styleUrl: './listado-tipos-contrato.component.css'
})
export class ListadoTiposContratoComponent {
  tipoList: TipoContrato[] = [];
  modalRef?: NgbModalRef;
  paginaActual: number = 1;
  elementosPorPagina: number = 10;

  constructor(
    private tipoContratoService: TipoContratoService,
    private modalService: ModalService,
    private recargarService: RecargarService,
    private router: Router

  ) {}

  ngOnInit(): void {    
    this.tipoContratoService.findAll().subscribe(tipos => {
      this.tipoList = tipos;
    });
    
    this.recargar();
    this.recargarService.recargar$.subscribe(() => {
      this.recargar();
    })
  }

  volverAListado() {
    this.router.navigate([`parametros`]);
  }

  // Creacion de TipoContrato
  crearTipoContrato() {
    this.modalRef = this.modalService.open(CrearTipoContratoComponent, {
      centered: true,
    });
  }
  
  // Modificacion de TipoContrato
  modificarTipoContrato(idTipoContrato: number) {
    this.tipoContratoService.setId(idTipoContrato);
    this.modalRef = this.modalService.open(ModificarTipoContratoComponent, {
      centered: true,
    });
  }
  
  // Habilitacion de TipoContrato
  habilitarTipoContrato(idTipoContrato: number) {
    Swal.fire({
      text: "¿Desea habilitar el parámetro?",
      icon: "success",
      iconColor: "#70DC73",
      showCancelButton: true,
      confirmButtonColor: "#70DC73",
      cancelButtonColor: "#697077",
      confirmButtonText: "Sí, habilitar",
      cancelButtonText: "Volver",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.tipoContratoService.habilitar(idTipoContrato).subscribe({
          next: (response) => {
          this.recargar();
          const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
          });
          Toast.fire({
            icon: "success",
            title: "Tipo de contrato habilitado correctamente",
          });
          }
        })
    }});
  }
  
  // Deshabilitacion de TipoContrato
  deshabilitarTipoContrato(idTipoContrato: number) {
      Swal.fire({
      text: "¿Desea deshabilitar el parámetro?",
      icon: "error",
      iconColor: "#FF5252",
      showCancelButton: true,
      confirmButtonColor: "#FF5252",
      cancelButtonColor: "#697077",
      confirmButtonText: "Sí, deshabilitar",
      cancelButtonText: "Volver",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.tipoContratoService.deshabilitar(idTipoContrato).subscribe({
          next: (response) => {
            this.recargar();
            const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
          });
          Toast.fire({
            icon: "success",
            title: "Tipo de contrato deshabilitado correctamente",
          });
          },
          error: (error) => {
            if(error.error.message === "La entidad se encuentra en uso, no puede deshabilitarla") {
              const Toast = Swal.mixin({
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 3000,
              });
              Toast.fire({
                icon: "warning",
                title: "La entidad se encuentra en uso, no puede deshabilitarla",
              });
            }
          }
        })
    }});
  }

  recargar(): void {
    this.tipoContratoService.findAll().subscribe(tipos => {
      this.tipoList = tipos;
    });
  }

  // Para paginacion
  get totalPaginas(): number {
    return Math.ceil(this.tipoList.length / this.elementosPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  obtenerTiposPaginados(): TipoContrato[] {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    return this.tipoList.slice(inicio, fin);
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

  get paginasMostradas(): (number | string)[] {
    const total = this.totalPaginas;
    const actual = this.paginaActual;
    const paginas: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        paginas.push(i);
      }
    } else {
      paginas.push(1);

      if (actual > 3) {
        paginas.push('...');
      }

      const start = Math.max(2, actual - 1);
      const end = Math.min(total - 1, actual + 1);

      for (let i = start; i <= end; i++) {
        paginas.push(i);
      }

      if (actual < total - 2) {
        paginas.push('...');
      }

      paginas.push(total);
    }

    return paginas;
  }

  irAPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }
}
