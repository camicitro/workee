import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { ModalService } from '../../../compartidos/modal/modal.service';
import { RecargarService } from '../../recargar.service';
import { ModalidadService } from '../modalidad.service';

@Component({
  selector: 'app-modificar-modalidad',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modificar-modalidad.component.html',
  styleUrl: './modificar-modalidad.component.css'
})
export class ModificarModalidadComponent {
  modalidadForm: FormGroup;
  submitForm: boolean = false;
  idModalidad!: number;
  
  constructor(
    private modalService: ModalService,
    private modalidadService: ModalidadService,
    private recargarService: RecargarService,
  ) {
    this.modalidadForm = new FormGroup({
      modalidad: new FormControl('', [Validators.required])
    });
  }

  ngOnInit() {
    this.modalidadService.getId().subscribe({
      next: (id) => {
        if (id !== null) {
          this.idModalidad = id;

          this.modalidadService.findById(id).subscribe({
            next: (modalidad) => {
              this.modalidadForm.patchValue({ modalidad: modalidad.nombreModalidadOferta });
            },
            error: (err) => {
              console.error('Error al obtener la modalidad por ID', err);
            }
          });
        }
      },
      error: (err) => {
        console.error('Error al obtener el ID de la modalidad', err);
      }
    });
  }

  dismissModal() {
    this.modalService.dismissActiveModal();
  }

  isCampoInvalido(): boolean {
    const control = this.modalidadForm.get('modalidad');
    return !!(control?.hasError('required') && (control.touched || this.submitForm));
  }

  enviarDatos() {
    this.submitForm = true;
    console.log(this.submitForm)

    if (this.modalidadForm.invalid || !this.idModalidad) {
      this.modalidadForm.markAllAsTouched();
      return;
    };
    const nombreModalidad = this.modalidadForm.get('modalidad')?.value;

    this.modalidadService.modificarModalidad(this.idModalidad, nombreModalidad).subscribe({
        next: () => {
          this.recargarService.emitirRecarga();
          this.dismissModal();
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "La modalidad se modificó correctamente",
            timer: 3000,
            showConfirmButton: false,
          })
        },
        error: (error) => {
          if (error.error.message === "Ya existe una modalidad de oferta con ese nombre") {
            Swal.fire({
              toast: true,
              icon: 'warning',
              title: 'Ya existe una modalidad con ese nombre',
              position: 'top-end',
              timer: 3000,
              showConfirmButton: false
            });
          } else {
            Swal.fire({
              toast: true,
              icon: 'error',
              title: 'No pudo modificarse la modalidad',
              position: 'top-end',
              timer: 3000,
              showConfirmButton: false
            });
          }
        },
      });
  }

}
