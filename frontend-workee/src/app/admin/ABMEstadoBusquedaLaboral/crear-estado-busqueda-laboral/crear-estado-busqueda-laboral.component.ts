import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EstadoBusquedaLaboralService } from '../estado-busqueda-laboral.service';
import { ModalService } from '../../../compartidos/modal/modal.service';
import { RecargarService } from '../../recargar.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-crear-estados-busqueda-laboral',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-estado-busqueda-laboral.component.html',
  styleUrl: './crear-estado-busqueda-laboral.component.css'
})
export class CrearEstadoBusquedaLaboralComponent {
  estadoForm: FormGroup;
  modalRef?: NgbModalRef;
  submitForm: boolean = false;
  
  constructor(
    private modalService: ModalService,
    private estadoService: EstadoBusquedaLaboralService,
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

    this.estadoService.crearEstadoBusquedaLaboral(nombreEstado).subscribe({
      next: () => {
        this.recargarService.emitirRecarga();
        this.submitForm = true;
        this.dismissModal();
        
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "El estado de búsqueda laboral se creó correctamente",
          timer: 3000,
          showConfirmButton: false,
        })
      },
      error: (error) => {
        if (error.error.message === 'Ya existe un estado de búsqueda con ese nombre') {
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
            title: 'No pudo crearse el estado de búsqueda laboral',
            position: 'top-end',
            timer: 3000,
            showConfirmButton: false
          });
        }
        },
      });
  }
  
}