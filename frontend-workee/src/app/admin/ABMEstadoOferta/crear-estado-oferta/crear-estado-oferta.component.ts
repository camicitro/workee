import { Component } from '@angular/core';
import { EstadoOfertaService } from '../estado-oferta.service';
import { RecargarService } from '../../recargar.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { ModalService } from '../../../compartidos/modal/modal.service';

@Component({
  selector: 'app-crear-estado-oferta',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-estado-oferta.component.html',
  styleUrl: './crear-estado-oferta.component.css'
})
export class CrearEstadoOfertaComponent {
  estadoForm: FormGroup;
  modalRef?: NgbModalRef;
  submitForm: boolean = false;
  
  constructor(
    private modalService: ModalService,
    private estadoService: EstadoOfertaService,
    private recargarService: RecargarService,
  ) {
    this.estadoForm = new FormGroup({
      estado: new FormControl('', [Validators.required])
    });
  }

  ngOnInit() { }

  dismissModal() {
    this.modalService.dismissActiveModal();
  }

  isCampoInvalido(): boolean {
    const control = this.estadoForm.get('estado');
    return !!(control?.hasError('required') && (control?.touched || this.submitForm));
  }

  enviarDatos() {
    if (this.estadoForm.invalid) {
      this.estadoForm.markAllAsTouched();
      return;
    }
    const nombreEstado = this.estadoForm.get('estado')?.value;

    this.estadoService.crearEstadoOferta(nombreEstado).subscribe({
      next: () => {
        this.recargarService.emitirRecarga();
        this.submitForm = true;
        this.dismissModal();
        
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "El estado de oferta se creó correctamente",
          timer: 3000,
          showConfirmButton: false,
        })
      },
      error: (error) => {
        if (error.error.message === 'Ya existe un estado de oferta con ese nombre') {
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
            title: 'No pudo crearse el estado de oferta',
            position: 'top-end',
            timer: 3000,
            showConfirmButton: false
          });
        }
        },
      });
  } 
}