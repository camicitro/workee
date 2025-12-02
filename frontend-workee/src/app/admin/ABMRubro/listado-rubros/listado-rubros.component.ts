import { Component } from '@angular/core';
import { Rubro } from '../rubro';
import { RubroService } from '../rubro.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { ModalService } from '../../../compartidos/modal/modal.service';
import { RecargarService } from '../../recargar.service';
import { CrearRubroComponent } from '../crear-rubro/crear-rubro.component';
import { ModificarRubroComponent } from '../modificar-rubro/modificar-rubro.component';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-listado-rubros',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './listado-rubros.component.html',
  styleUrl: './listado-rubros.component.css'
})
export class ListadoRubrosComponent {
  rubroList: Rubro[] = []; // lista de rubros filtrada segun la busqueda
  rubroListOriginal: Rubro[] = []; // lista de rubros completa, sin filtrar
  modalRef?: NgbModalRef;
  filtro: string = '';
  paginaActual: number = 1;
  elementosPorPagina: number = 10;

  constructor(
    private rubroService: RubroService,
    private modalService: ModalService,
    private recargarService: RecargarService,
    private router: Router
  ) {  }

  ngOnInit(): void {
    this.rubroService.findAll().subscribe(rubros => {
      this.rubroListOriginal = rubros;
      this.rubroList = [...rubros];
    });

    this.recargar();
    this.recargarService.recargar$.subscribe(() => {
      this.recargar();
    })
  }

  volverAListado() {
    this.router.navigate([`parametros`]);
  }

  // Creacion de Rubro
  crearRubro() {
    this.modalRef = this.modalService.open(CrearRubroComponent, {
      centered: true,
    });
  }
  
  // Modificacion de Rubro
  modificarRubro(idRubro: number) {
    this.rubroService.setId(idRubro);
    this.modalRef = this.modalService.open(ModificarRubroComponent, {
      centered: true,
    });
  }
  
  // Habilitacion de Rubro
  habilitarRubro(idRubro: number) {
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
            this.rubroService.habilitar(idRubro).subscribe({
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
                title: "Rubro habilitado correctamente",
              });
              }
            })
        }});
      }
    
  // Deshabilitacion de Rubro
  deshabilitarRubro(idRubro: number) {
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
        this.rubroService.deshabilitar(idRubro).subscribe({
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
            title: "Rubro deshabilitado correctamente",
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

  // Buscar rubros dentro del listado
  buscarRubros() {
    const texto = this.filtro.trim().toLowerCase();

    if (texto === '') {
      this.rubroList = [... this.rubroListOriginal ];
      return;
    }

    this.rubroList = this.rubroListOriginal.filter(rubro =>
      rubro.nombreRubro?.toLowerCase().includes(texto)
    );

    this.paginaActual = 1;
  }

  // Para recargar la pagina
  recargar(): void {
    this.rubroService.findAll().subscribe(rubros => {
      this.rubroListOriginal = rubros;
      this.buscarRubros();
    });
  }

  // Para paginacion
  get totalPaginas(): number {
    return Math.ceil(this.rubroList.length / this.elementosPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  obtenerRubrosPaginados(): Rubro[] {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    return this.rubroList.slice(inicio, fin);
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
