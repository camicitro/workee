import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EstadoUsuarioService } from '../estado-usuario.service';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { ModalService } from '../../../compartidos/modal/modal.service';
import { RecargarService } from '../../recargar.service';

@Component({
  selector: 'app-crear-estado-usuario',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-estado-usuario.component.html',
  styleUrl: './crear-estado-usuario.component.css'
})
export class CrearEstadoUsuarioComponent {
  estadoForm: FormGroup;
  modalRef?: NgbModalRef;
  submitForm: boolean = false;
  
  constructor(
    private modalService: ModalService,
    private estadoUsuarioService: EstadoUsuarioService,
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

    this.estadoUsuarioService.crearEstadoUsuario(nombreEstado).subscribe({
      next: () => {
        this.recargarService.emitirRecarga();
        this.submitForm = true;
        this.dismissModal();
        
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "El estado de usuario se creó correctamente",
          timer: 3000,
          showConfirmButton: false,
        })
      },
      error: (error) => {
        if (error.error.message === 'El estado de usuario ya existe') {
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
            title: 'No pudo crearse el estado de usuario',
            position: 'top-end',
            timer: 3000,
            showConfirmButton: false
          });
        }
        },
      });
  }
  
}