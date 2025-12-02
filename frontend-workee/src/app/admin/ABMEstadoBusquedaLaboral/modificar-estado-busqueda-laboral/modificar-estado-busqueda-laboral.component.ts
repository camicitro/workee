import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EstadoBusquedaLaboralService } from '../estado-busqueda-laboral.service';
import { ModalService } from '../../../compartidos/modal/modal.service';
import { RecargarService } from '../../recargar.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modificar-estados-busqueda-laboral',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modificar-estado-busqueda-laboral.component.html',
  styleUrl: './modificar-estado-busqueda-laboral.component.css'
})
export class ModificarEstadoBusquedaLaboralComponent {
  estadoForm: FormGroup;
  submitForm: boolean = false;
  idEstado!: number;
  
  constructor(
    private modalService: ModalService,
    private estadoService: EstadoBusquedaLaboralService,
    private recargarService: RecargarService,
  ) {
    this.estadoForm = new FormGroup({
      estado: new FormControl('', [Validators.required])
    });
  }

  ngOnInit() {
    this.estadoService.getId().subscribe({
      next: (id) => {
        if (id !== null) {
          this.idEstado = id;

          this.estadoService.findById(id).subscribe({
            next: (estado) => {
              this.estadoForm.patchValue({ estado: estado.nombreEstadoBusqueda });
            },
            error: (err) => {
              console.error('Error al obtener estado de búsqueda laboral por ID', err);
            }
          });
        }
      },
      error: (err) => {
        console.error('Error al obtener el ID del estado de búsqueda laboral', err);
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
    console.log(this.submitForm)

    if (this.estadoForm.invalid || !this.idEstado) {
      this.estadoForm.markAllAsTouched();
      return;
    };
    const nombreEstado = this.estadoForm.get('estado')?.value;

    this.estadoService.modificarEstadoBusquedaLaboral(this.idEstado, nombreEstado).subscribe({
        next: () => {
          this.recargarService.emitirRecarga();
          this.dismissModal();
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "El estado de búsqueda laboral se modificó correctamente",
            timer: 3000,
            showConfirmButton: false,
          })
        },
        error: (error) => {
          if (error.error.message === "Ya existe un estado de búsqueda con ese nombre") {
            Swal.fire({
              toast: true,
              icon: 'warning',
              title: 'Ya existe un estado de búsqueda laboral con ese nombre',
              position: 'top-end',
              timer: 3000,
              showConfirmButton: false
            });
          } else {
            Swal.fire({
              toast: true,
              icon: 'error',
              title: 'No pudo modificarse el estado de búsqueda laboral',
              position: 'top-end',
              timer: 3000,
              showConfirmButton: false
            });
          }
        },
      });
  }

}
