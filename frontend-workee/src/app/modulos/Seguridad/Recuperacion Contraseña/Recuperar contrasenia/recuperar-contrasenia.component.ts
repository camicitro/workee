import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router'; 
import Swal from 'sweetalert2';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-recuperar-contrasenia',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './recuperar-contrasenia.component.html',
  styleUrls: ['./recuperar-contrasenia.component.css']
})
export class RecuperarContraseniaComponent {

  recuperarContraseniaForm: FormGroup;
  submitForm: boolean = false;
  verContrasenia: boolean = false;

  backendContraseniaCorta = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {
    this.recuperarContraseniaForm = new FormGroup({
      contraseniaNueva: new FormControl('', [Validators.required,Validators.minLength(8)],),
      repetirContrasenia: new FormControl('', [Validators.required])
    });
  }

  recuperarContrasenia() {
    this.submitForm = true;
    const token = this.route.snapshot.queryParamMap.get('token');
    console.log('Token recibido:', token);

    if (this.recuperarContraseniaForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Incompleto',
        text: 'Por favor, complete los campos requeridos',
        confirmButtonColor: '#31A5DD'
      });
      return;
    }

    const contraseniaNueva = this.recuperarContraseniaForm.get('contraseniaNueva')?.value.trim();
    const repetirContrasenia = this.recuperarContraseniaForm.get('repetirContrasenia')?.value.trim();

    this.authService.recuperarcontrasenia(token!, contraseniaNueva, repetirContrasenia).subscribe({
      next: (res) => {
        console.log(res);
        Swal.fire({
          icon: 'success',
          title: 'Su contraseña se ha restablecido correctamente.',
          confirmButtonColor: "#31A5DD",
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (error: any) => {
        if (error.status === 400 && error.error.message === "El token ya fue utilizado") {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'error',
            title: 'El token ya fue utilizado',
            showConfirmButton: false,
            timer: 3000
          });
        } else if (error.error.message === "La contraseña debe tener al menos 8 caracteres") {
          this.backendContraseniaCorta = true;
          this.recuperarContraseniaForm.get('contraseniaNueva')?.setErrors({ backend: true });
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'La contraseña debe tener al menos 8 caracteres',
          });
        } else if (error.status === 400 && error.error.message === "Las contraseñas no coinciden") {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Las contraseñas no coinciden',
            confirmButtonColor: '#31A5DD'
          });
        }
        else if(error.status === 400 && error.error.message === "El token ha expirado"){
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'El token ha expirado',
          });
        }
        
      }
    });
  }

  isCampoInvalido(nombreCampo: string): boolean {
    const control = this.recuperarContraseniaForm.get(nombreCampo);
    return !!(control && control.invalid && (control.touched || this.submitForm));
  }
}

