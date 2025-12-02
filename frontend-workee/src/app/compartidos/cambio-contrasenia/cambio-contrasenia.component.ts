import { Component, Input, OnInit } from '@angular/core';
import { ModalService } from '../modal/modal.service';
import Swal from 'sweetalert2';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { UsuarioService } from '../../modulos/seguridad/usuarios/usuario.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cambio-contrasenia',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './cambio-contrasenia.component.html',
  styleUrl: './cambio-contrasenia.component.css'
})
export class CambioContraseniaComponent implements OnInit {
  
  modalRef?: NgbModalRef;
  @Input() usuarioId!: number;

  submitForm = false;

  verContrasenia: boolean = false;
  
  form = new FormGroup({
    actual: new FormControl('', [Validators.required]),
    nueva: new FormControl('', [Validators.required, Validators.minLength(8)]),
    repetir: new FormControl('', [Validators.required, Validators.minLength(8)]),
  }, { validators: contraseniasIgualesValidator });

  constructor(
    private modalService: ModalService,
    private usuarioService: UsuarioService
  ) {}


  ngOnInit(): void {
    console.log("usuarioId en cambio contrasenia: ", this.usuarioId);
  }

  isCampoInvalido(nombreCampo: string): boolean {
    const control = this.form.get(nombreCampo);
    // console.log("control: ", control, " voy a devolver este valor: ", !!(control && control.invalid && (control.touched || this.submitForm)));
    return !!(control && control.invalid && (control.touched || this.submitForm));
  }

  volverAPerfil() {
    Swal.fire({
      title: '¿Desea confirmar los cambios realizados?',
      icon: "question",
      iconColor: "#70DC73",
      showCancelButton: true,
      confirmButtonColor: "#70DC73",
      cancelButtonColor: "#697077",
      confirmButtonText: "Sí, guardar",
      cancelButtonText: "No, volver",
      reverseButtons: true,
      customClass: {
        title: 'titulo-chico',
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.submitForm = true;
        this.form.markAllAsTouched();
        this.usuarioService.cambiarContrasenia(
          this.form.get('actual')?.value || '',
          this.form.get('nueva')?.value || '',
          this.form.get('repetir')?.value || '',
          this.usuarioId
        ).subscribe({
          next: (res: any) => {
            console.log("respuesta del back al cambiar contrasenia: ", res);
            this.modalService.closeActiveModal();
            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'success',
              title: 'Contraseña actualizada con éxito',
              showConfirmButton: false,
              timer: 3000,
            });
          },
          error: (err) => {
            if(err.error.message === 'La contraseña actual ingresada no coincide con la contraseña guardada')
              Swal.fire({
                toast: true,
                position: 'top-end',
                title: err.error.message,
                icon: 'error',
                showConfirmButton: false,
                timer: 3000,
            });
          }
        });
      }
    });
  }

  dismissModal() {
    Swal.fire({
      title: "¿Está seguro de que desea volver?",
      text: "Los cambios realizados no se guardarán",
      icon: "question",
      iconColor: "#31A5DD",
      showCancelButton: true,
      confirmButtonColor: "#31A5DD",
      cancelButtonColor: "#697077",
      confirmButtonText: "Sí, volver",
      cancelButtonText: "No, cerrar",
      reverseButtons: true,
      customClass: {
        title: 'titulo-chico',
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.modalService.dismissActiveModal();
    }});
  }

}

// funcion para validar las contrasenias
export const contraseniasIgualesValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const nueva = control.get('nueva')?.value;
  const repetir = control.get('repetir')?.value;
  if (nueva && repetir && nueva !== repetir) {
    return { contraseniasNoCoinciden: true };
  }
  return null;
};
