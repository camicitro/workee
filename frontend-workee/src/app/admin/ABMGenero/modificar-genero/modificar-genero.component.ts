import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ModalService } from '../../../compartidos/modal/modal.service';
import { RecargarService } from '../../recargar.service';
import { GeneroService } from '../genero.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modificar-genero',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modificar-genero.component.html',
  styleUrl: './modificar-genero.component.css'
})
export class ModificarGeneroComponent {
  generoForm: FormGroup;
  submitForm: boolean = false;
  idGenero!: number;
  
  constructor(
    private modalService: ModalService,
    private generoService: GeneroService,
    private recargarService: RecargarService,
  ) {
    this.generoForm = new FormGroup({
      genero: new FormControl('', [Validators.required])
    });
  }

  ngOnInit() {
    this.generoService.getId().subscribe({
      next: (id) => {
        if (id !== null) {
          this.idGenero = id;

          this.generoService.findById(id).subscribe({
            next: (genero) => {
              this.generoForm.patchValue({ genero: genero.nombreGenero });
            },
            error: (err) => {
              console.error('Error al obtener género por ID', err);
            }
          });
        }
      },
      error: (err) => {
        console.error('Error al obtener el ID del género', err);
      }
    });
  }

  dismissModal() {
    this.modalService.dismissActiveModal();
  }

  isCampoInvalido(): boolean {
    const control = this.generoForm.get('genero');
    return !!(control?.hasError('required') && (control.touched || this.submitForm));
  }

  enviarDatos() {
    this.submitForm = true;
    console.log(this.submitForm)

    if (this.generoForm.invalid || !this.idGenero) {
      this.generoForm.markAllAsTouched();
      return;
    };
    const nombreGenero = this.generoForm.get('genero')?.value;

    this.generoService.modificarGenero(this.idGenero, nombreGenero).subscribe({
        next: () => {
          this.recargarService.emitirRecarga();
          this.dismissModal();
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "El género se modificó correctamente",
            timer: 3000,
            showConfirmButton: false,
          })
        },
        error: (error) => {
          if (error.error.message === "El género ya existe") {
            Swal.fire({
              toast: true,
              icon: 'warning',
              title: 'Ya existe un género con ese nombre',
              position: 'top-end',
              timer: 3000,
              showConfirmButton: false
            });
          } else {
            Swal.fire({
              toast: true,
              icon: 'error',
              title: 'No pudo modificarse el género',
              position: 'top-end',
              timer: 3000,
              showConfirmButton: false
            });
          }
        },
      });
  }

}
