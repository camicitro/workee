import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Etapa } from '../etapa';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EtapaService } from '../etapa.service';
import { ModalService } from '../../../compartidos/modal/modal.service';
import Swal from 'sweetalert2';
import { RecargarService } from '../../recargar.service';
import { CrearEtapaComponent } from '../crear-etapa/crear-etapa.component';
import { ModificarEtapaComponent } from '../modificar-etapa/modificar-etapa.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-listado-etapas',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './listado-etapas.component.html',
  styleUrl: './listado-etapas.component.css'
})
export class ListadoEtapasComponent {
  etapaList: Etapa[] = [];
  modalRef?: NgbModalRef;
  paginaActual: number = 1;
  elementosPorPagina: number = 10;

  constructor(
    private etapaService: EtapaService,
    private modalService: ModalService,
    private recargarService: RecargarService,
    private router: Router
  ) {}

  ngOnInit(): void {    
    this.etapaService.findAll().subscribe(etapas => {
      // console.log(etapas)
      this.etapaList = etapas.filter(etapa => etapa.esPredeterminada === true);
    });

    this.recargar();
    this.recargarService.recargar$.subscribe(() => {
      this.recargar();
    })
  }

  volverAListado() {
    this.router.navigate([`parametros`]);
  }
  // Creacion de Etapa
  crearEtapa() {
    this.modalRef = this.modalService.open(CrearEtapaComponent, {
      centered: true,
    });

    this.modalRef.componentInstance.idEmpresa = null;
  }
  
  // Modificacion de Etapa
  modificarEtapa(idEtapa: number) {
    this.etapaService.setId(idEtapa);
    console.log("id etapa: ", idEtapa)
    this.modalRef = this.modalService.open(ModificarEtapaComponent, {
      centered: true,
    });
  }
  
  // Habilitacion de Etapa
  habilitarEtapa(idEtapa: number) {
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
        this.etapaService.habilitar(idEtapa).subscribe({
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
            title: "Etapa habilitada correctamente",
          });
          }
        })
    }});
  }
  
  // Deshabilitacion de Etapa
  deshabilitarEtapa(idEtapa: number) {
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
        this.etapaService.deshabilitar(idEtapa).subscribe({
          next: () => {
            this.recargar();
            // console.log("mando la req")
            const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000
          });
          Toast.fire({
            icon: "success",
            title: "Etapa deshabilitada correctamente",
          });
          },
          error: (error) => {
            // TODO: REVISAR CON SWAGGER
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
    this.etapaService.findAll().subscribe(etapas => {
      this.etapaList = etapas.filter(etapa => etapa.esPredeterminada === true);
    });
  }

  // Para paginacion
  get totalPaginas(): number {
    return Math.ceil(this.etapaList.length / this.elementosPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  obtenerEtapasPaginadas(): Etapa[] {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    return this.etapaList.slice(inicio, fin);
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
