import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Provincia } from '../provincia';
import { ProvinciaService } from '../provincia.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CrearProvinciaComponent } from '../crear-provincia/crear-provincia.component';
import Swal from 'sweetalert2';
import { ModalService } from '../../../compartidos/modal/modal.service';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RecargarService } from '../../recargar.service';
import { ModificarProvinciaComponent } from '../modificar-provincia/modificar-provincia.component';

@Component({
  selector: 'app-listado-provincias',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './listado-provincias.component.html',
  styleUrl: './listado-provincias.component.css'
})
export class ListadoProvinciasComponent implements OnInit {
  provinciaList: Provincia[] = [];
  idPais!: number;
  modalRef?: NgbModalRef;
  paginaActual: number = 1;
  elementosPorPagina: number = 10;

  constructor(
    private provinciaService: ProvinciaService,
    private route: ActivatedRoute,
    private modalService: ModalService,
    private recargarService: RecargarService,
    private cdRef: ChangeDetectorRef,
    private router: Router

  ) {}

  ngOnInit(): void {
    this.idPais = Number(this.route.snapshot.paramMap.get('idPais'));
    console.log(this.idPais);

    this.provinciaList = [];

    this.recargar();
    this.recargarService.recargar$.subscribe(() => {
      this.recargar();
    })
  }

  volverAListado() {
    this.router.navigate([`parametros/paises`]);
  }

  // Creacion de Provincia
  crearProvincia() {
    this.modalRef = this.modalService.open(CrearProvinciaComponent, {
      centered: true,
    });

    this.modalRef.componentInstance.idPais = this.idPais;
  }
  
  // Modificacion de provincia
  modificarProvincia(idProvincia: number) {
    this.provinciaService.setId(idProvincia);
    this.modalRef = this.modalService.open(ModificarProvinciaComponent, {
      centered: true,
    });
    
    this.modalRef.componentInstance.idPais = this.idPais;
    
  }
  
  // Habilitacion de Provincia
  habilitarProvincia(idProvincia: number) {
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
        this.provinciaService.habilitar(idProvincia).subscribe({
          next: () => {
          this.recargar();
          const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
          });
          Toast.fire({
            icon: "success",
            title: "Provincia habilitada correctamente",
          });
          }
        })
    }});
  }
  
  // Deshabilitacion de Provincia
  deshabilitarProvincia(idProvincia: number) {
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
        this.provinciaService.deshabilitar(idProvincia).subscribe({
          next: () => {
            this.recargar();
            const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000
          });
          Toast.fire({
            icon: "success",
            title: "Provincia deshabilitada correctamente",
          });
          },
          error: (error) => {
            if(error.error.message === "La entidad se encuentra en uso, no puede deshabilitarla") {
              const Toast = Swal.mixin({
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 3000
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
    this.provinciaService.getProvinciasPorPais(this.idPais).subscribe(provincias => {
      this.provinciaList = provincias;
      this.cdRef.detectChanges();
    });
  }

  // Para paginacion
  get totalPaginas(): number {
    return Math.ceil(this.provinciaList.length / this.elementosPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  obtenerProvinciasPaginadas(): Provincia[] {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    return this.provinciaList.slice(inicio, fin);
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
