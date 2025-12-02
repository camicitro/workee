import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalService } from '../../../compartidos/modal/modal.service';
import { TipoEventoService } from '../tipo-evento.service';
import { RecargarService } from '../../recargar.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-crear-tipo-evento',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-tipo-evento.component.html',
  styleUrl: './crear-tipo-evento.component.css'
})
export class CrearTipoEventoComponent {
  tipoForm: FormGroup;
  modalRef?: NgbModalRef;
  submitForm: boolean = false;
  
  constructor(
    private modalService: ModalService,
    private tipoEventoService: TipoEventoService,
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

    this.tipoEventoService.crearTipoEvento(nombreTipo).subscribe({
      next: () => {
        this.recargarService.emitirRecarga();
        this.submitForm = true;
        this.dismissModal();
        
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "El tipo de evento se creó correctamente",
          timer: 3000,
          showConfirmButton: false,
        })
      },
      error: (error) => {
        if (error.error.message === 'Ya existe un tipo de evento con ese nombre') {
          Swal.fire({
            toast: true,
            icon: 'warning',
            title: 'Ya existe un tipo de evento con ese nombre',
            position: 'top-end',
            timer: 3000,
            showConfirmButton: false
          });
        } else {
          Swal.fire({
            toast: true,
            icon: 'error',
            title: 'No pudo crearse el tipo de evento',
            position: 'top-end',
            timer: 3000,
            showConfirmButton: false
          });
        }
        },
      });
  }
  
}