import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalService } from '../../../compartidos/modal/modal.service';
import { ProvinciaService } from '../provincia.service';
import { RecargarService } from '../../recargar.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modificar-provincia',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modificar-provincia.component.html',
  styleUrl: './modificar-provincia.component.css'
})
export class ModificarProvinciaComponent implements OnInit {
  
  // recibe el id desde el ListadoProvinciasComponent
  @Input() idPais!: number;
  
  provinciaForm: FormGroup;
  submitForm: boolean = false;
  idProvincia!: number;
  
  constructor(
    private modalService: ModalService,
    private provinciaService: ProvinciaService,
    private recargarService: RecargarService,
  ) {
    this.provinciaForm = new FormGroup({
      provincia: new FormControl('', [Validators.required])
    });
  }

  ngOnInit() {
    this.provinciaService.getId().subscribe({
      next: (id) => {
        if (id !== null) {
          this.idProvincia = id;

          this.provinciaService.findById(id).subscribe({
            next: (provincia) => {
              this.provinciaForm.patchValue({ provincia: provincia.nombreProvincia });
            },
            error: (err) => {
              console.error('Error al obtener provincia por ID', err);
            }
          });
        }
      },
      error: (err) => {
        console.error('Error al obtener el ID de la provincia', err);
      }
    });
  }

  dismissModal() {
    this.modalService.dismissActiveModal();
  }

  isCampoInvalido(): boolean {
    const control = this.provinciaForm.get('provincia');
    return !!(control?.hasError('required') && (control.touched || this.submitForm));
  }

  enviarDatos() {
    if (this.provinciaForm.invalid || !this.idProvincia) {
      this.provinciaForm.markAllAsTouched();
      return;
    };
 
    const nombreProvincia = this.provinciaForm.get('provincia')?.value;

    this.provinciaService.modificarProvincia(nombreProvincia, this.idPais, this.idProvincia).subscribe({
        next: () => {
          this.recargarService.emitirRecarga();
          this.dismissModal();
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "La provincia se modificó correctamente",
            timer: 3000,
            showConfirmButton: false,
          })
        },
        error: (error) => {
          if (error.error.message === 'Ya existe una provincia con ese nombre') {
            Swal.fire({
              toast: true,
              icon: 'warning',
              title: 'Ya existe una provincia con ese nombre',
              position: 'top-end',
              timer: 3000,
              showConfirmButton: false
            });
          } else {
            Swal.fire({
              toast: true,
              icon: 'error',
              title: 'No pudo modificarse la provincia',
              position: 'top-end',
              timer: 3000,
              showConfirmButton: false
            });
          }
        },
      });
  }

}
