import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Form, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router'; 
import Swal from 'sweetalert2';
import { AuthService } from '../../auth.service';
import { SesionService } from '../../../../interceptors/sesion.service';
// import { Modal } from 'bootstrap';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalService } from '../../../../compartidos/modal/modal.service';
import { RecuperarContraseniaModal } from '../../Recuperacion Contraseña/Modal/recuperar-contrasenia-modal.component';
import { Observable } from 'rxjs';
//import { RecuperarContraseniaComponent } from '../../Recuperacion Contraseña/recuperar-contrasenia.component';


@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit{
  loginForm: FormGroup
  verContrasenia: boolean = false;
  submitForm: boolean = false;
  backendEmailInvalido = false;
  modalRef?: NgbModalRef;

  //para lo re redireccion
  loading$!: Observable<boolean>;

  constructor(
    private router: Router,
    private authService: AuthService,
    private sesionService: SesionService,
    private modalService: ModalService,
  ) {
    this.loginForm = new FormGroup({
      correo: new FormControl('',[Validators.required, Validators.email]),
      contrasenia: new FormControl('',[Validators.required])
    });
  }
  ngOnInit(): void {
    this.loading$ = this.sesionService.loading$;
    if (!this.sesionService.isLoggedIn()) {
      this.sesionService.setLoading(false);
    }
  }

  enviarDatos(){
    this.backendEmailInvalido = false;
    this.submitForm = true;

    if (this.loginForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Correo electrónico o contraseña incompletos',
        text: 'Por favor, complete los campos "Correo electrónico" y "Contraseña"',
        confirmButtonColor: '#31A5DD'
      });
      return;
    }
    const correo = this.loginForm.get('correo')?.value.trim();
    const contrasenia = this.loginForm.get('contrasenia')?.value.trim();

    console.log("Datos que se van a enviar:", { correo, contrasenia });

  this.authService.login(correo, contrasenia).subscribe({
    next: (token: string) => {
      this.sesionService.startLocalSession(token);
      this.sesionService.cargarRolUsuario();
      //this.sesionService.cargarRolYPermisosUsuario();

      this.sesionService.cargarRolYPermisosUsuario().subscribe({
        next: (permisos) => {
          console.log('Permisos cargados:', permisos);
          const rol = this.sesionService.getRolActual();
          console.log('Rol actual:', rol);

          setTimeout(() => {
      this.sesionService.redirectBasedOnCategory();
    }, 200);
          
          
        },
        error: (err) => {
          console.error('Error al cargar permisos:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error al iniciar sesión',
            text: 'No se pudieron cargar los permisos del usuario.',
            confirmButtonColor: '#31A5DD'
          });
        }
      });
    },
    error: (err) => {
      console.error('Error al iniciar sesión:', err);

      let errorMsg = err?.error?.message || err?.error || 'Error desconocido';

      if (errorMsg.includes("no se encuentra habilitado")) {
        Swal.fire({
          icon: 'error',
          title: 'Usuario no habilitado',
          text: 'Tu cuenta aún no está habilitada para iniciar sesión.',
          confirmButtonColor: '#31A5DD'
        });
      } else if (errorMsg.includes("Credenciales inválidas")) {
        Swal.fire({
          icon: 'error',
          title: 'Credenciales inválidas',
          text: 'Correo electrónico o contraseña incorrectos.',
          confirmButtonColor: '#31A5DD'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error en el inicio de sesión',
          text: 'Ha ocurrido un error inesperado. Intenta nuevamente más tarde.',
          confirmButtonColor: '#31A5DD'
        });
      }
    }
  });
}

togglePasswordView() {
throw new Error('Method not implemented.');
}

// irRestablecerContrasenia() {
//   const modalElement = document.getElementById('modalRecuperar');

//    this.modalRef = this.modalService.open(RecuperarContraseniaComponent, {
//       centered: true,
//       scrollable: true,
//       size: 'lg'
//     });

// }

irRestablecerContrasenia() {
  this.modalRef = this.modalService.open(RecuperarContraseniaModal, {
    centered: true,
    scrollable: true,
    size: 'lg'
  });

  
}






username: any;
passwordType: any;
onSubmit() {
throw new Error('Method not implemented.');
}

isCampoInvalido(nombreCampo: string): boolean {
    const control = this.loginForm.get(nombreCampo);
    return !!(control && control.invalid && (control.touched || this.submitForm));
}

}