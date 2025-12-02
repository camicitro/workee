import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { ModalService } from '../../../compartidos/modal/modal.service';
import { RecargarService } from '../../recargar.service';
import { TipoContratoService } from '../tipo-contrato.service';

@Component({
  selector: 'app-crear-tipo-contrato',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-tipo-contrato.component.html',
  styleUrl: './crear-tipo-contrato.component.css'
})
export class CrearTipoContratoComponent {
  tipoForm: FormGroup;
  modalRef?: NgbModalRef;
  submitForm: boolean = false;
  
  constructor(
    private modalService: ModalService,
    private tipoContratoService: TipoContratoService,
    private recargarService: RecargarService,
  ) {
    this.tipoForm = new FormGroup({
      tipo: new FormControl('', [Validators.required])
    });
  }

  ngOnInit() { }

  dismissModal() {
    this.modalService.dismissActiveModal();
  }

  isCampoInvalido(): boolean {
    const control = this.tipoForm.get('tipo');
    return !!(control?.hasError('required') && (control?.touched || this.submitForm));
  }

  enviarDatos() {
    if (this.tipoForm.invalid) {
      this.tipoForm.markAllAsTouched();
      return;
    }
    const nombreTipo = this.tipoForm.get('tipo')?.value;

    this.tipoContratoService.crearTipoContrato(nombreTipo).subscribe({
      next: () => {
        this.recargarService.emitirRecarga();
        this.submitForm = true;
        this.dismissModal();
        
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "El tipo de contrato se creó correctamente",
          timer: 3000,
          showConfirmButton: false,
        })
      },
      error: (error) => {
        if (error.error.message === 'El tipo de contrato de oferta ya existe.') {
          Swal.fire({
              toast: true,
            icon: 'warning',
            title: 'Ya existe un tipo de contrato con ese nombre',
            position: 'top-end',
            timer: 3000,
            showConfirmButton: false
          });
        } else {
          Swal.fire({
            toast: true,
            icon: 'error',
            title: 'No pudo crearse el tipo de contrato',
            position: 'top-end',
            timer: 3000,
            showConfirmButton: false
          });
        }
        },
      });
  }
  
}