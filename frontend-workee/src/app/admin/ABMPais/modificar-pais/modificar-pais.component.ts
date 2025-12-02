import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { ModalService } from '../../../compartidos/modal/modal.service';
import { PaisService } from '../pais.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RecargarService } from '../../recargar.service';

@Component({
  selector: 'app-modificar-pais',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modificar-pais.component.html',
  styleUrl: './../crear-pais/crear-pais.component.css'
})
export class ModificarPaisComponent implements OnInit{
  paisForm: FormGroup;
  submitForm: boolean = false;
  idPais!: number;
  
  constructor(
    private modalService: ModalService,
    private paisService: PaisService,
    private recargarService: RecargarService,
  ) {
    this.paisForm = new FormGroup({
      pais: new FormControl('', [Validators.required])
    });
  }

  ngOnInit() {
    this.paisService.getId().subscribe({
      next: (id) => {
        if (id !== null) {
          this.idPais = id;

          this.paisService.findById(id).subscribe({
            next: (pais) => {
              this.paisForm.patchValue({ pais: pais.nombrePais });
            },
            error: (err) => {
              console.error('Error al obtener país por ID', err);
            }
          });
        }
      },
      error: (err) => {
        console.error('Error al obtener el ID del país', err);
      }
    });
  }

  dismissModal() {
    this.modalService.dismissActiveModal();
  }

  isCampoInvalido(): boolean {
    const control = this.paisForm.get('pais');
    return !!(control?.hasError('required') && (control.touched || this.submitForm));
  }

  enviarDatos() {
    this.submitForm = true;
    console.log(this.submitForm)

    if (this.paisForm.invalid || !this.idPais) {
      this.paisForm.markAllAsTouched();
      return;
    };
    // 'pais' es lo que esta en el formControlName del input
    const nombrePais = this.paisForm.get('pais')?.value;

    console.log(this.idPais);
    console.log(nombrePais);

    this.paisService.modificarPais(this.idPais, nombrePais).subscribe({
        next: () => {
          console.log("llego hasta aca")
          this.recargarService.emitirRecarga();
          this.dismissModal();
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "El país se modificó correctamente",
            timer: 3000,
            showConfirmButton: false,
          })
        },
        error: (error) => {
          if (error.error.message === 'Ya existe un país con ese nombre') {
            Swal.fire({
              toast: true,
              icon: 'warning',
              title: 'Ya existe un país con ese nombre',
              position: 'top-end',
              timer: 3000,
              showConfirmButton: false
            });
          } else {
            Swal.fire({
              toast: true,
              icon: 'error',
              title: 'No pudo modificarse el país',
              position: 'top-end',
              timer: 3000,
              showConfirmButton: false
            });
          }
        },
      });
  }

}
