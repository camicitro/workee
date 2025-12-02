import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';

import { ModalService } from '../../../../compartidos/modal/modal.service';
import { RecargarService } from '../../../../admin/recargar.service';
import { RolService } from '../../usuarios/rol.service';
import { PermisoService } from '../permiso.service';

import { Rol } from '../../rol';
import { permiso } from '../permiso';
import { RolRequestDTO } from './rol-request-DTO';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modificar-rol',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modificar-rol.component.html',
  styleUrl: './modificar-rol.component.css'
})
export class ModificarRolComponent {
  @Input() idRol!: number;

  RolForm: FormGroup;
  modalRef?: NgbModalRef;

  // Datos del rol a editar
  rol?: Rol;
  categoriaId!: number;
  categoriaNombre: string = '';

  // Listas de permisos
  permisosDeCategoria: permiso[] = [];
  permisosActualesDelRol: permiso[] = [];

  // IDs seleccionados (lo que se enviará en el PUT)
  permisosSeleccionadosID: number[] = [];

  submitForm = false;

  constructor(
    private modalService: ModalService,
    private rolService: RolService,
    private permisoService: PermisoService,
    private recargarService: RecargarService
  ) {
    this.RolForm = new FormGroup({
      nombreRol: new FormControl('', [Validators.required]),
      // este control solo lo uso para validar "al menos 1 permiso"
      permisosRol: new FormControl([], [Validators.required])
    });
  }

  ngOnInit(): void {
    if (!this.idRol) {
      console.error('No se recibió idRol en ModificarRolComponent');
      return;
    }

    // 1) Traigo el rol para saber nombre y categoría
    this.rolService.findById(this.idRol).subscribe({
      next: (rol) => {
        this.rol = rol;
        this.categoriaId = rol.categoriaRol?.id!;
        this.categoriaNombre = rol.categoriaRol?.nombreCategoriaRol || '';

        // Seteo el nombre en el form
        this.RolForm.get('nombreRol')?.setValue(rol.nombreRol || '');

        // 2) En paralelo: permisos de la categoría + permisos actuales del rol
        forkJoin({
          deCategoria: this.permisoService.permisosdeunaCategoria(this.categoriaId),
          delRol: this.permisoService.permisosdeunRol(this.idRol)
        }).subscribe({
          next: ({ deCategoria, delRol }) => {
            this.permisosDeCategoria = deCategoria || [];
            this.permisosActualesDelRol = delRol || [];

            // Pre-seleccionar los del rol (solo IDs)
            this.permisosSeleccionadosID = (this.permisosActualesDelRol || []).map(p => p.id!);

            // Reflejar en el control "permisosRol" para validar
            this.RolForm.get('permisosRol')?.setValue(this.permisosSeleccionadosID);
          },
          error: (err) => {
            console.error('Error al cargar permisos:', err);
          }
        });
      },
      error: (err) => {
        console.error('Error al obtener el rol:', err);
      }
    });
  }

  /*dismissModal() {
    this.modalService.dismissActiveModal();
  }*/
  dismissModal() {
    Swal.fire({
      title: '¿Está seguro de que desea volver?',
      text: 'Los cambios realizados no se guardarán.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, volver',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#31A5DD',
      cancelButtonColor: '#697077'
    }).then(result => {
      if (result.isConfirmed) {
        this.modalService.dismissActiveModal();
      }
    });
  }

  isCampoInvalido(): boolean {
    const control = this.RolForm.get('nombreRol');
    return !!(control?.hasError('required') && (control?.touched || this.submitForm));
  }

  onPermisoChange(event: any, idPermiso: number) {
    if (!idPermiso) return;

    if (event.target.checked) {
      if (!this.permisosSeleccionadosID.includes(idPermiso)) {
        this.permisosSeleccionadosID.push(idPermiso);
      }
    } else {
      this.permisosSeleccionadosID = this.permisosSeleccionadosID.filter(id => id !== idPermiso);
    }

    // Actualizo el control técnico para validación
    this.RolForm.get('permisosRol')?.setValue(this.permisosSeleccionadosID);
  }

  guardarCambios() {
    if (this.RolForm.invalid || this.permisosSeleccionadosID.length === 0) {
      this.submitForm = true;
      if (this.permisosSeleccionadosID.length === 0) {
        this.RolForm.get('permisosRol')?.setErrors({ required: true });
        Swal.fire({
          toast: true,
          icon: 'warning',
          title: 'Seleccione al menos un permiso',
          position: 'top-end',
          timer: 3000,
          showConfirmButton: false
        });
      }
      return;
    }

    const nombreRol = (this.RolForm.get('nombreRol')?.value || '').trim();

    const dto: RolRequestDTO = {
      nombreRol,
      idCategoria: this.categoriaId,           // ⚠️ no se modifica, pero el backend lo requiere
      idPermisos: this.permisosSeleccionadosID // ✅ permisos elegidos
    };

    Swal.fire({
      title: '¿Desea guardar los cambios?',
      text: 'Se actualizará la información del rol.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#70DC73',
      cancelButtonColor: '#697077'
    }).then(result => {
      if (result.isConfirmed) {

        this.rolService.modificarRolConDto(this.idRol, dto).subscribe({
          next: () => {
            this.recargarService.emitirRecarga();
            this.dismissModal();
            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'success',
              title: 'Rol modificado correctamente',
              timer: 3000,
              showConfirmButton: false
            });
          },
          error: (error) => {
            if (error?.error?.message === 'Ya existe un rol con el nombre ingresado') {
              Swal.fire({
                toast: true,
                icon: 'warning',
                title: 'Ya existe un rol con ese nombre',
                position: 'top-end',
                timer: 3000,
                showConfirmButton: false
              });
            } else {
              Swal.fire({
                toast: true,
                icon: 'error',
                title: 'No se pudo modificar el rol',
                position: 'top-end',
                timer: 3000,
                showConfirmButton: false
              });
            }
          }
        });
      }
    });

  }
}
