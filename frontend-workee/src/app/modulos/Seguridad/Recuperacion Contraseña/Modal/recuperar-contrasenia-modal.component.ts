import { Component, Input, OnInit } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { FormControl, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalService } from '../../../../compartidos/modal/modal.service';
import { AuthService } from '../../auth.service';
import { timer } from 'rxjs';


@Component({
  standalone: true,
  selector: 'app-recuperar-contrasenia',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './recuperar-contrasenia-modal.component.html',
  styleUrl: './recuperar-contrasenia-modal.component.css'
})
export class RecuperarContraseniaModal implements OnInit {
  recuperarForm: FormGroup;
  submitForm: boolean = false;
  backendEmailInvalido = false;
  
  
  modalRef?: NgbModalRef;
  filtro: string = '';

  // _second = 120;
  // _minute = this._second * 60;
  // _hour = this._minute * 60;
  // _day = this._hour * 24;
  end: any;
  now: any;

  seenvio: number = 0;
  minutes: number = 0;
  seconds: number = 0;
  source = timer(0, 1000);
  clock: any;
  mostrarContador: boolean = false;
  intervalId: any;
  
  constructor(
    private router: Router,
    private authService: AuthService,
    private modalService: ModalService,
  ) {
    
   this.recuperarForm = new FormGroup({
     correo: new FormControl('', [Validators.required, Validators.email])
    });
  }

  isCampoInvalido(nombreCampo: string): boolean {
    const control = this.recuperarForm.get(nombreCampo);
    return !!(control && control.invalid && (control.touched || this.submitForm));
  }


  solicitarRecuperacionContrasenia() {
    this.submitForm = true;
    this.backendEmailInvalido = false;

    if(this.recuperarForm.valid){
      this.seenvio ++;
      this.iniciarContador();
      Swal.fire({
        text: "Revise su correo electrónico para restablecer su contraseña.",
        icon: "success",
        confirmButtonColor: "#31A5DD",
      })
    }

    const correo = this.recuperarForm.get('correo')?.value;


    this.authService.solicitarRecuperarContrasenia(correo).subscribe({
      next: () => {
        this.submitForm = true;
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "Se ha enviado la solicitud de recuperación correctamente",
            timer: 3000,
           showConfirmButton: false,
          });
      },
      error: (error: any) => {
      if (error.status === 404) {
        this.backendEmailInvalido = true;
        this.recuperarForm.get('correo')?.setErrors({ backend: true });
        Swal.fire({
                  toast: true,
                  position: "top-end",
                  icon: "warning",
                  title: "No se encontró un usuario con el correo ingresado",
                  timer: 3000,
                  showConfirmButton: false,
                })
      } 
      }
    })
  }

  ngOnInit(): void {
      this.clock = this.source.subscribe(t => {
      this.now = new Date();
      this.now.setSeconds(3600) ;
      this.end = new Date();
      this.showDate();
    });
  }

  showDate(){
    let distance = this.end - this.now;
    // this.minutes = Math.floor((distance % this._hour) / this._minute);
    // this.seconds = Math.floor((distance % this._minute) / this._second);
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


  iniciarContador() {
  let tiempoRestante = 120; // 2 minutos en segundos
  this.mostrarContador = true;

  this.minutes = Math.floor(tiempoRestante / 60);
  this.seconds = tiempoRestante % 60;

  this.intervalId = setInterval(() => {
    tiempoRestante--;

    this.minutes = Math.floor(tiempoRestante / 60);
    this.seconds = tiempoRestante % 60;

    if (tiempoRestante <= 0) {
      clearInterval(this.intervalId);
      this.mostrarContador = false; // oculta contador, muestra botón "Reenviar"
    }
  }, 1000);
}

}
