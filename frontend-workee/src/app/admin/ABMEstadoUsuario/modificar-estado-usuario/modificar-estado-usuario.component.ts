import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { ModalService } from '../../../compartidos/modal/modal.service';
import { RecargarService } from '../../recargar.service';
import { EstadoUsuarioService } from '../estado-usuario.service';

@Component({
  selector: 'app-modificar-estado-usuario',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modificar-estado-usuario.component.html',
  styleUrl: './modificar-estado-usuario.component.css'
})
export class ModificarEstadoUsuarioComponent {
  estadoForm: FormGroup;
  submitForm: boolean = false;
  idEstado!: number;
  
  constructor(
    private modalService: ModalService,
    private estadoUsuarioService: EstadoUsuarioService,
    private recargarService: RecargarService,
  ) {
    this.estadoForm = new FormGroup({
      estado: new FormControl('', [Validators.required])
    });
  }

  ngOnInit() {
    this.estadoUsuarioService.getId().subscribe({
      next: (id) => {
        if (id !== null) {
          this.idEstado = id;

          this.estadoUsuarioService.findById(id).subscribe({
            next: (estado) => {
              this.estadoForm.patchValue({ estado: estado.nombreEstadoUsuario });
            },
            error: (err) => {
              console.error('Error al obtener estado de usuario por ID', err);
            }
          });
        }
      },
      error: (err) => {
        console.error('Error al obtener el ID del estado de usuario', err);
      }
    });
  }

  dismissModal() {
    this.modalService.dismissActiveModal();
  }

  isCampoInvalido(): boolean {
    const control = this.estadoForm.get('estado');
    return !!(control?.hasError('required') && (control.touched || this.submitForm));
  }

  enviarDatos() {
    this.submitForm = true;

    if (this.estadoForm.invalid || !this.idEstado) {
      this.estadoForm.markAllAsTouched();
      return;
    };
    const nombreEstado = this.estadoForm.get('estado')?.value;

    this.estadoUsuarioService.modificarEstadoUsuario(this.idEstado, nombreEstado).subscribe({
        next: () => {
          this.recargarService.emitirRecarga();
          this.dismissModal();
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "El estado de usuario se modificó correctamente",
            timer: 3000,
            showConfirmButton: false,
          })
        },
        error: (error) => {
          if (error.error.message === "El estado de usuario ya existe") {
            Swal.fire({
              toast: true,
              icon: 'warning',
              title: 'Ya existe un estado de usuario con ese nombre',
              position: 'top-end',
              timer: 3000,
              showConfirmButton: false
            });
          } else {
            Swal.fire({
              toast: true,
              icon: 'error',
              title: 'No pudo modificarse el estado de usuario',
              position: 'top-end',
              timer: 3000,
              showConfirmButton: false
            });
          }
        },
      });
  }

}
