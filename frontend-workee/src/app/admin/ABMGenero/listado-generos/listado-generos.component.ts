import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GeneroService } from '../genero.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalService } from '../../../compartidos/modal/modal.service';
import { Genero } from '../genero';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { RecargarService } from '../../recargar.service';
import { CrearGeneroComponent } from '../crear-genero/crear-genero.component';
import { ModificarGeneroComponent } from '../modificar-genero/modificar-genero.component';

@Component({
  selector: 'app-listado-generos',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './listado-generos.component.html',
  styleUrl: './listado-generos.component.css'
})
export class ListadoGenerosComponent {
  generoList: Genero[] = [];
  modalRef?: NgbModalRef;
  paginaActual: number = 1;
  elementosPorPagina: number = 10;

  constructor(
    private generoService: GeneroService,
    private modalService: ModalService,
    private recargarService: RecargarService,
    private router: Router
  ) {}

  ngOnInit(): void {    
    this.generoService.findAll().subscribe(generos => {
      this.generoList = generos;
    });


    this.recargar();
    this.recargarService.recargar$.subscribe(() => {
      this.recargar();
    })
  }

  volverAListado() {
    this.router.navigate([`parametros`]);
  }

  // Creacion de Genero
  crearGenero() {
    this.modalRef = this.modalService.open(CrearGeneroComponent, {
      centered: true,
    });
  }
  
  // Modificacion de Genero
  modificarGenero(idGenero: number) {
    this.generoService.setId(idGenero);
    this.modalRef = this.modalService.open(ModificarGeneroComponent, {
      centered: true,
    });
  }
  
  // Habilitacion de Genero
  habilitarGenero(idGenero: number) {
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
        this.generoService.habilitar(idGenero).subscribe({
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
            title: "Género habilitado correctamente",
          });
          }
        })
    }});
  }
  
  // Deshabilitacion de Genero
  deshabilitarGenero(idGenero: number) {
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
        this.generoService.deshabilitar(idGenero).subscribe({
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
            title: "Género deshabilitado correctamente",
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
    this.generoService.findAll().subscribe(generos => {
      this.generoList = generos;
    });
  }

  // Para paginacion
  get totalPaginas(): number {
    return Math.ceil(this.generoList.length / this.elementosPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  obtenerGenerosPaginados(): Genero[] {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    return this.generoList.slice(inicio, fin);
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
