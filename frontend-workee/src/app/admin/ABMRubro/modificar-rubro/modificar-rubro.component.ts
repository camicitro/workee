import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalService } from '../../../compartidos/modal/modal.service';
import { RecargarService } from '../../recargar.service';
import { RubroService } from '../rubro.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modificar-rubro',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modificar-rubro.component.html',
  styleUrl: './modificar-rubro.component.css'
})
export class ModificarRubroComponent {
  rubroForm: FormGroup;
  submitForm: boolean = false;
  idRubro!: number;
  
  constructor(
    private modalService: ModalService,
    private rubroService: RubroService,
    private recargarService: RecargarService,
  ) {
    this.rubroForm = new FormGroup({
      rubro: new FormControl('', [Validators.required])
    });
  }

  ngOnInit() {
    this.rubroService.getId().subscribe({
      next: (id) => {
        if (id !== null) {
          this.idRubro = id;

          this.rubroService.findById(id).subscribe({
            next: (rubro) => {
              this.rubroForm.patchValue({ rubro: rubro.nombreRubro });
            },
            error: (err) => {
              console.error('Error al obtener rubro por ID', err);
            }
          });
        }
      },
      error: (err) => {
        console.error('Error al obtener el ID del rubro', err);
      }
    });
  }

  dismissModal() {
    this.modalService.dismissActiveModal();
  }

  isCampoInvalido(): boolean {
    const control = this.rubroForm.get('rubro');
    return !!(control?.hasError('required') && (control.touched || this.submitForm));
  }

  enviarDatos() {
    this.submitForm = true;
    console.log(this.submitForm)

    if (this.rubroForm.invalid || !this.idRubro) {
      this.rubroForm.markAllAsTouched();
      return;
    };
    const nombreRubro = this.rubroForm.get('rubro')?.value;

    this.rubroService.modificarRubro(this.idRubro, nombreRubro).subscribe({
        next: () => {
          this.recargarService.emitirRecarga();
          this.dismissModal();
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "El rubro se modificó correctamente",
            timer: 3000,
            showConfirmButton: false,
          })
        },
        error: (error) => {
          if (error.error.message === 'Ya existe un rubro con ese nombre') {
            Swal.fire({
              toast: true,
              icon: 'warning',
              title: 'Ya existe un rubro con ese nombre',
              position: 'top-end',
              timer: 3000,
              showConfirmButton: false
            });
          } else {
            Swal.fire({
              toast: true,
              icon: 'error',
              title: 'No pudo modificarse el rubro',
              position: 'top-end',
              timer: 3000,
              showConfirmButton: false
            });
          }
        },
      });
  }

}

