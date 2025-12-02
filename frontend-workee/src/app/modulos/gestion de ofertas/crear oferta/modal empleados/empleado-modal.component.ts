// empleado-modal.component.ts
import { Component, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EmpleadoService } from '../../../empresa/empleados/empleado.service';
import { Empleado } from '../../../empresa/empleados/empleado';
import Swal from 'sweetalert2';
import { ModalService } from '../../../../compartidos/modal/modal.service';

@Component({
  selector: 'app-empleado-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empleado-modal.component.html',
  styleUrl: './empleado-modal.component.css'
})
export class EmpleadoModalComponent implements OnInit {

  @Input() empresaId!: number;           // 👈 viene desde el padre
  @Input() preseleccionadoId?: number;   // opcional, por si querés marcar uno
  @Output() empleadoSeleccionado?: Empleado; // 👈 va al padre

  paginaActual: number = 1;
  empleados: Empleado[] = [];
  cargando = false;
  error?: string;


  elementosPorPagina: number = 8;
  seleccionado?: Empleado;
  router: any;

  constructor(
    private empleadoService: EmpleadoService,
    public activeModal: NgbActiveModal,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    if (!this.empresaId) {
      this.error = 'No se recibió id de empresa';
      return;
    }

    this.cargando = true;
    this.empleadoService.findAllActivos(this.empresaId).subscribe({
      next: (lista) => {
        this.empleados = lista ?? [];
        if (this.preseleccionadoId) {
          this.seleccionado = this.empleados.find(e => e.id === this.preseleccionadoId);
        }
        this.cargando = false;
        console.log(this.empleados);
      },
      error: (err) => {
        console.error(err);
        this.error = 'No se pudieron cargar los empleados';
        this.cargando = false;
      }
    });
  }

  elegir(e: Empleado) {
    this.seleccionado = e;
  }

  confirmar() {
    const id = this.seleccionado?.id;
    if (id != null) {
      this.activeModal.close(id); // 👈 devolvemos un number
    }
  }

  obtenerEmpleadosPaginados(): Empleado[] {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    // console.log(inicio);
    const fin = inicio + this.elementosPorPagina;
    // console.log(fin);
    // console.log(this.empleadoList.slice(inicio, fin));
    return this.empleados.slice(inicio, fin);
  }

  cancelar() {
    this.activeModal.dismiss();
  }

  visualizarEmpleado(idEmpleado: number) {
    // this.empleadoService.setId(idEmpleado);
    this.router.navigate([`empleados/perfil`,idEmpleado]);
  }

  dismissModal() {
    this.modalService.dismissActiveModal();
  }


  // Para paginacion
  get totalPaginas(): number {
    return Math.ceil(this.empleados.length / this.elementosPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
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




}
