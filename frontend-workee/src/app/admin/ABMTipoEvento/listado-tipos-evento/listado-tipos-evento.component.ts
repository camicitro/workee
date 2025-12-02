import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TipoEvento } from '../tipo-evento';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TipoEventoService } from '../tipo-evento.service';
import { ModalService } from '../../../compartidos/modal/modal.service';
import { RecargarService } from '../../recargar.service';
import Swal from 'sweetalert2';
import { CrearTipoEventoComponent } from '../crear-tipo-evento/crear-tipo-evento.component';
import { ModificarTipoEventoComponent } from '../modificar-tipo-evento/modificar-tipo-evento.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-listado-tipos-evento',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './listado-tipos-evento.component.html',
  styleUrl: './listado-tipos-evento.component.css'
})
export class ListadoTiposEventoComponent {
  tipoList: TipoEvento[] = [];
  modalRef?: NgbModalRef;
  paginaActual: number = 1;
  elementosPorPagina: number = 10;

  constructor(
    private tipoEventoService: TipoEventoService,
    private modalService: ModalService,
    private recargarService: RecargarService,
    private router: Router

  ) {}

  ngOnInit(): void {    
    this.tipoEventoService.findAll().subscribe(tipos => {
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
  // Creacion de TipoEvento
  crearTipoEvento() {
    this.modalRef = this.modalService.open(CrearTipoEventoComponent, {
      centered: true,
    });
  }
  
  // Modificacion de TipoEvento
  modificarTipoEvento(idTipoEvento: number) {
    this.tipoEventoService.setId(idTipoEvento);
    this.modalRef = this.modalService.open(ModificarTipoEventoComponent, {
      centered: true,
    });
  }
  
  // Habilitacion de TipoEvento
  habilitarTipoEvento(idTipoEvento: number) {
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
        this.tipoEventoService.habilitar(idTipoEvento).subscribe({
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
            title: "Tipo de evento habilitado correctamente",
          });
          }
        })
    }});
  }
  
  // Deshabilitacion de idTipoEvento
  deshabilitarTipoEvento(idTipoEvento: number) {
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
        this.tipoEventoService.deshabilitar(idTipoEvento).subscribe({
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
            title: "Tipo de evento deshabilitado correctamente",
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
    this.tipoEventoService.findAll().subscribe(tipos => {
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

  obtenerTiposPaginados(): TipoEvento[] {
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
