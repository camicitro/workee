
import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Rol } from "../../rol";
import { NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { RolService } from "../../usuarios/rol.service";
import { ModalService } from "../../../../compartidos/modal/modal.service";
import { RecargarService } from "../../../../admin/recargar.service";
import { CrearRolComponent } from "../Crear Rol/crear-rol.component";
import { ModificarRolComponent } from "../Modificar Rol/modificar-rol.component";
import Swal from "sweetalert2";

@Component({
  selector: 'app-listado-estados-busqueda-laboral', // puedes renombrar más adelante
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './gestion-de-roles.component.html',
  styleUrl: './gestion-de-roles.component.css'
})
export class GestionderolesComponent {

  rolList: Rol[] = [];
  modalRef?: NgbModalRef;
  paginaActual = 1;
  elementosPorPagina = 10;
  permisosAsignados!:number 

  constructor(
    private rolService: RolService,
    private modalService: ModalService,
    private recargarService: RecargarService,
  ) {}

  ngOnInit(): void {

    

    this.rolService.findAll().subscribe(roles => {
      this.rolList = roles;
    });

    this.recargar();
    this.recargarService.recargar$.subscribe(() => {
      this.recargar();
    });
  }

  recargar(): void {
    this.rolService.findAll().subscribe(roles => {
      this.rolList = roles;
    });
  }

  crearRol(): void {
    this.modalRef = this.modalService.open(CrearRolComponent, { centered: true });
  }

  modificarRol(id: number): void {
    this.modalRef = this.modalService.open(ModificarRolComponent, { centered: true });
    this.modalRef.componentInstance.idRol = id; 
  }


  habilitarRol(idRol: number): void {
    Swal.fire({
          text: "¿Desea habilitar el rol?",
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
            this.rolService.habilitar(idRol).subscribe({
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
                title: "Rol habilitado correctamente",
              });
              }
            })
        }});
  }

  deshabilitarRol(idRol: number): void {
    Swal.fire({
          text: "¿Desea deshabilitar el rol?",
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
            this.rolService.deshabilitar(idRol).subscribe({
              next: (response) => {
                this.recargar();
                Swal.fire({
                  toast: true,
                  icon: 'success',
                  title: 'Rol deshabilitado correctamente',
                  position: 'top-end',
                  timer: 3000,
                  showConfirmButton: false
                });
              },
              error: (error) => {
                if(error.error.message === "No se puede deshabilitar el rol porque se encuentra en uso.") {
                  const Toast = Swal.mixin({
                    toast: true,
                    position: "top-end",
                    showConfirmButton: false,
                    timer: 3000,
                  });
                  Toast.fire({
                    icon: "warning",
                    title: "El rol se encuentra en uso, no puede deshabilitarlo",
                  });
                }
              }
            })
        }});
  }

  // --- Paginación ---
  get totalPaginas(): number {
    return Math.ceil(this.rolList.length / this.elementosPorPagina) || 1;
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  obtenerRolesPaginados(): Rol[] {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    return this.rolList.slice(inicio, fin);
  }

  avanzarPagina(): void {
    if (this.paginaActual < this.totalPaginas) this.paginaActual++;
  }

  retrocederPagina(): void {
    if (this.paginaActual > 1) this.paginaActual--;
  }

  irAPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) this.paginaActual = pagina;
  }

  
}
