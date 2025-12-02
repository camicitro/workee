import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { ModalService } from '../../../compartidos/modal/modal.service';
import { TipoHabilidadService } from '../../ABMTipoHabilidad/tipo-habilidad.service';
import { RecargarService } from '../../recargar.service';
import { HabilidadService } from '../habilidad.service';

@Component({
  selector: 'app-modificar-habilidad',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modificar-habilidad.component.html',
  styleUrl: './modificar-habilidad.component.css'
})
export class ModificarHabilidadComponent {
  habilidadForm: FormGroup;
  submitForm: boolean = false;
  idHabilidad!: number;
  tiposHabilidad: any[] = [];
  
  constructor(
    private modalService: ModalService,
    private habilidadService: HabilidadService,
    private recargarService: RecargarService,
    private tipoHabilidadService: TipoHabilidadService
  ) {
    this.habilidadForm = new FormGroup({
      habilidad: new FormControl('', [Validators.required]),
      tipoHabilidad: new FormControl(null, [Validators.required])
    });
  }

  ngOnInit() {
    this.tipoHabilidadService.findAllActivos().subscribe({
      next: (tipos) => {
        this.tiposHabilidad = tipos;

        this.habilidadService.getId().subscribe({
          next: (id) => {
            if (id !== null) {
              this.idHabilidad = id;

              this.habilidadService.findById(id).subscribe({
                next: (habilidad) => {
                  const tipoActual = this.tiposHabilidad.find(
                    (t) => t.id === habilidad.tipoHabilidad?.id
                  );

                  this.habilidadForm.patchValue({
                    habilidad: habilidad.nombreHabilidad,
                    tipoHabilidad: tipoActual ?? null
                  });
                },
                error: (err) => console.error('Error al obtener habilidad por ID', err)
              });
            }
          },
          error: (err) => console.error('Error al obtener el ID de la habilidad', err)
        });
      },
      error: (err) => console.error('Error al obtener los tipos de habilidad', err)
    });
  }

  dismissModal() {
    this.modalService.dismissActiveModal();
  }

  isCampoInvalido(nombreCampo: string): boolean {
    const control = this.habilidadForm.get(nombreCampo);
    return !!(control?.hasError('required') && (control?.touched || this.submitForm));
  }

  enviarDatos() {
    this.submitForm = true;
    console.log(this.submitForm)

    if (this.habilidadForm.invalid) {
      this.habilidadForm.markAllAsTouched();
      return;
    }
    
    const nombreHabilidad = this.habilidadForm.get('habilidad')?.value;
    const tipoSeleccionado = this.habilidadForm.get('tipoHabilidad')?.value;
    const idTipoHabilidad = tipoSeleccionado?.id;

    this.habilidadService.modificarHabilidad(
      nombreHabilidad,
      idTipoHabilidad,
      this.idHabilidad)
      .subscribe({
        next: () => {
          this.recargarService.emitirRecarga();
          this.dismissModal();
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "La habilidad se modificó correctamente",
            timer: 3000,
            showConfirmButton: false,
          })
        },
        error: (error) => {
          if (error.error.message === 'Ya existe una habilidad con ese nombre') {
            Swal.fire({
              toast: true,
              icon: 'warning',
              title: 'Ya existe una habilidad con ese nombre',
              position: 'top-end',
              timer: 3000,
              showConfirmButton: false
            });
          } else {
            Swal.fire({
              toast: true,
              icon: 'error',
              title: 'No pudo modificarse la habilidad',
              position: 'top-end',
              timer: 3000,
              showConfirmButton: false
            });
          }
        },
      });
  }

}
