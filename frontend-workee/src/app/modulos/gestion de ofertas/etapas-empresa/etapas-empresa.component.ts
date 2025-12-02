import { Component, OnInit } from '@angular/core';
import { Etapa } from '../../../admin/ABMEtapa/etapa';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { EmpresaService } from '../../empresa/empresa/empresa.service';
import { EtapaService } from '../../../admin/ABMEtapa/etapa.service';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalService } from '../../../compartidos/modal/modal.service';
import { CrearEtapaComponent } from '../../../admin/ABMEtapa/crear-etapa/crear-etapa.component';
import { RecargarService } from '../../../admin/recargar.service';
import { ModificarEtapaComponent } from '../../../admin/ABMEtapa/modificar-etapa/modificar-etapa.component';
import { SesionService } from '../../../interceptors/sesion.service';
import { UsuarioService } from '../../seguridad/usuarios/usuario.service';
import { Empleado } from '../../empresa/empleados/empleado';
import { SpinnerComponent } from '../../../compartidos/spinner/spinner/spinner.component';

@Component({
  selector: 'app-etapas-empresa',
  imports: [CommonModule, FormsModule, SpinnerComponent],
  templateUrl: './etapas-empresa.component.html',
  styleUrl: './etapas-empresa.component.css'
})
export class EtapasEmpresaComponent implements OnInit{
  etapaList: Etapa[] = [];
  etapaListOriginal: Etapa[] = [];
  idEmpresaObtenida: number = 0;

  filtro: string = '';

  paginaActual: number = 1;
  elementosPorPagina: number = 10;

  modalRef?: NgbModalRef;

  empleado?: Empleado;

  isLoading = true;

  constructor(
    private empresaService: EmpresaService,
    private etapaService: EtapaService,
    private modalService: ModalService,
    private recargarService: RecargarService,
    private sesionService: SesionService,
    private usuarioService: UsuarioService,
  ) { }
  
  ngOnInit(): void {

    this.sesionService.rolUsuario$.subscribe(rol => {
      // console.log("hola ", rol)
      if (!rol) {
        console.error("No se pudo obtener el rol del usuario");
        return;
      }
      if (rol.codigoRol === 'ADMIN_EMPRESA') {
        this.empresaService.getidEmpresabyCorreo()?.subscribe({
          next: (idEmpresa) => {
            this.idEmpresaObtenida = idEmpresa;
            // console.log("el id que consegui es ", this.idEmpresaObtenida)
            this.cargarEtapas(this.idEmpresaObtenida)
          },
          error: (err) => {
            console.error('Error al obtener id de empresa por correo', err);
            this.isLoading = false;
          }
        });

      } else if (rol.codigoRol === 'EMPLEADO_EMPRESA') {
        this.usuarioService.getUsuario().subscribe({
          next: (usuario) => {
            this.empleado = usuario;
            const idEmpresa = this.empleado.empresa?.id;
            if (idEmpresa) {
              this.idEmpresaObtenida = idEmpresa;
              // console.log("el id que consegui es ", this.idEmpresaObtenida)
              this.cargarEtapas(this.idEmpresaObtenida);
            } else {
              console.error('No se pudo obtener el Id de la empresa a la que pertenece el empleado');
              this.isLoading = false;
            }
          },
          error: (err) => {
            console.error("Error al obtener el usuario logueado", err);
            this.isLoading = false;
          }
        });
      } else {
        console.warn('Rol no contemplado en VisualizarOfertasPropias:', rol.nombreRol);
        this.isLoading = false;
      }
    })

    this.recargar();
    this.recargarService.recargar$.subscribe(() => {
      this.recargar();
    })
  }

  cargarEtapas(idEmpresa: number) {
    this.isLoading = true;
    this.etapaService.obtenerEtapasDisponiblesParaEmpresa(idEmpresa).subscribe({
      next: (etapas) => {
        this.etapaList = etapas;
        this.etapaListOriginal = etapas;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al obtener las etapas:', error);
        this.isLoading = false;
      }
    });
  }
  
  recargar(): void {
    if (!this.idEmpresaObtenida) return;
    this.isLoading = true;
    this.etapaService.obtenerEtapasDisponiblesParaEmpresa(this.idEmpresaObtenida).subscribe({    
      next: etapas => {
        this.etapaList = etapas;
        this.etapaListOriginal = etapas;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al recargar etapas', err);
        this.isLoading = false;
      }
    });
  }

  crearEtapa() {
    this.modalRef = this.modalService.open(CrearEtapaComponent, {
      centered: true,
    });

    this.modalRef.componentInstance.idEmpresa = this.idEmpresaObtenida;
    // console.log("id empresa que se pasara al modal: ", this.idEmpresaObtenida);
  }

  // Modificacion de Etapa
  modificarEtapa(idEtapa: number) {
    this.etapaService.setId(idEtapa);
    // console.log("id etapa: ", idEtapa)
    this.modalRef = this.modalService.open(ModificarEtapaComponent, {
      centered: true,
    });
  }

  // Deshabilitacion de Etapa
  eliminarEtapa(idEtapa: number) {
      Swal.fire({
      text: "¿Desea eliminar la etapa?",
      icon: "error",
      iconColor: "#FF5252",
      showCancelButton: true,
      confirmButtonColor: "#FF5252",
      cancelButtonColor: "#697077",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "No, volver",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.etapaService.eliminarEtapaEmpresa(idEtapa, this.idEmpresaObtenida).subscribe({
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
            title: "Etapa eliminada correctamente",
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

  // Buscar etapas dentro del listado
  buscarEtapas() {
    const texto = this.filtro.trim().toLowerCase();

    if (texto === '') {
      this.etapaList = [... this.etapaListOriginal];
      return;
    }

    this.etapaList = this.etapaListOriginal.filter(etapa =>
      etapa.nombreEtapa?.toLowerCase().includes(texto)
    );
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
