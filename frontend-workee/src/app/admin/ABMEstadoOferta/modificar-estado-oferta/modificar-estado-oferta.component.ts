import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EstadoOfertaService } from '../estado-oferta.service';
import { ModalService } from '../../../compartidos/modal/modal.service';
import Swal from 'sweetalert2';
import { RecargarService } from '../../recargar.service';

@Component({
  selector: 'app-modificar-estado-oferta',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modificar-estado-oferta.component.html',
  styleUrl: './modificar-estado-oferta.component.css'
})
export class ModificarEstadoOfertaComponent {
  estadoForm: FormGroup;
  submitForm: boolean = false;
  idEstado!: number;
  
  constructor(
    private modalService: ModalService,
    private estadoService: EstadoOfertaService,
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
              this.estadoForm.patchValue({ estado: estado.nombreEstadoOferta });
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

    this.estadoService.modificarEstadoOferta(this.idEstado, nombreEstado).subscribe({
        next: () => {
          this.recargarService.emitirRecarga();
          this.dismissModal();
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "El estado de oferta se modificó correctamente",
            timer: 3000,
            showConfirmButton: false,
          })
        },
        error: (error) => {
          if (error.error.message === "Ya existe un estado de oferta con ese nombre") {
            Swal.fire({
              toast: true,
              icon: 'warning',
              title: 'Ya existe un estado de oferta con ese nombre',
              position: 'top-end',
              timer: 3000,
              showConfirmButton: false
            });
          } else {
            Swal.fire({
              toast: true,
              icon: 'error',
              title: 'No pudo modificarse el estado de oferta',
              position: 'top-end',
              timer: 3000,
              showConfirmButton: false
            });
          }
        },
      });
  }

}
