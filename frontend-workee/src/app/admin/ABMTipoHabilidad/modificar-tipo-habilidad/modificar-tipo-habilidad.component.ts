import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalService } from '../../../compartidos/modal/modal.service';
import { RecargarService } from '../../recargar.service';
import { TipoHabilidadService } from '../tipo-habilidad.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modificar-tipo-habilidad',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modificar-tipo-habilidad.component.html',
  styleUrl: './modificar-tipo-habilidad.component.css'
})
export class ModificarTipoHabilidadComponent {
  tipoForm: FormGroup;
  submitForm: boolean = false;
  idTipo!: number;
  
  constructor(
    private modalService: ModalService,
    private tipoHabilidadService: TipoHabilidadService,
    private recargarService: RecargarService,
  ) {
    this.tipoForm = new FormGroup({
      tipo: new FormControl('', [Validators.required])
    });
  }

  ngOnInit() {
    this.tipoHabilidadService.getId().subscribe({
      next: (id) => {
        if (id !== null) {
          this.idTipo = id;

          this.tipoHabilidadService.findById(id).subscribe({
            next: (tipo) => {
              this.tipoForm.patchValue({ tipo: tipo.nombreTipoHabilidad });
            },
            error: (err) => {
              console.error('Error al obtener tipo de habilidad por ID', err);
            }
          });
        }
      },
      error: (err) => {
        console.error('Error al obtener el ID del tipo de habilidad', err);
      }
    });
  }

  dismissModal() {
    this.modalService.dismissActiveModal();
  }

  isCampoInvalido(): boolean {
    const control = this.tipoForm.get('tipo');
    return !!(control?.hasError('required') && (control.touched || this.submitForm));
  }

  enviarDatos() {
    this.submitForm = true;
    console.log(this.submitForm)

    if (this.tipoForm.invalid || !this.idTipo) {
      this.tipoForm.markAllAsTouched();
      return;
    };
    const nombreTipoHabilidad = this.tipoForm.get('tipo')?.value;

    this.tipoHabilidadService.modificarTipoHabilidad(this.idTipo, nombreTipoHabilidad).subscribe({
        next: () => {
          this.recargarService.emitirRecarga();
          this.dismissModal();
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "El tipo de habilidad se modificó correctamente",
            timer: 3000,
            showConfirmButton: false,
          })
        },
        error: (error) => {
          if (error.error.message === 'Ya existe un tipo de habilidad con ese nombre') {
            Swal.fire({
              toast: true,
              icon: 'warning',
              title: 'Ya existe un tipo de habilidad con ese nombre',
              position: 'top-end',
              timer: 3000,
              showConfirmButton: false
            });
          } else {
            Swal.fire({
              toast: true,
              icon: 'error',
              title: 'No pudo modificarse el tipo de habilidad',
              position: 'top-end',
              timer: 3000,
              showConfirmButton: false
            });
          }
        },
      });
  }

}
