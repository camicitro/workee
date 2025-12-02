import { Component } from '@angular/core';
import { ModalidadService } from '../modalidad.service';
import { ModalService } from '../../../compartidos/modal/modal.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { RecargarService } from '../../recargar.service';

@Component({
  selector: 'app-crear-modalidad',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-modalidad.component.html',
  styleUrl: './crear-modalidad.component.css'
})
export class CrearModalidadComponent {
  modalidadForm: FormGroup;
  modalRef?: NgbModalRef;
  submitForm: boolean = false;
  
  constructor(
    private modalService: ModalService,
    private modalidadService: ModalidadService,
    private recargarService: RecargarService,
  ) {
    this.modalidadForm = new FormGroup({
      modalidad: new FormControl('', [Validators.required])
    });
  }

  ngOnInit() { }

  dismissModal() {
    this.modalService.dismissActiveModal();
  }

  isCampoInvalido(): boolean {
    const control = this.modalidadForm.get('modalidad');
    return !!(control?.hasError('required') && (control?.touched || this.submitForm));
  }

  enviarDatos() {
    if (this.modalidadForm.invalid) {
      this.modalidadForm.markAllAsTouched();
      return;
    }
    const nombreModalidad = this.modalidadForm.get('modalidad')?.value;

    this.modalidadService.crearModalidad(nombreModalidad).subscribe({
      next: () => {
        this.recargarService.emitirRecarga();
        this.submitForm = true;
        this.dismissModal();
        
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "La modalidad se creó correctamente",
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
            title: 'No pudo crearse la modalidad',
            position: 'top-end',
            timer: 3000,
            showConfirmButton: false
          });
        }
        },
      });
  }
  
}