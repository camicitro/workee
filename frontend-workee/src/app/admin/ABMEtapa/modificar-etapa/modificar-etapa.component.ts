import { Component } from '@angular/core';
import { EtapaService } from '../etapa.service';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ModalService } from '../../../compartidos/modal/modal.service';
import { RecargarService } from '../../recargar.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modificar-etapa',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modificar-etapa.component.html',
  styleUrl: './modificar-etapa.component.css'
})
export class ModificarEtapaComponent {
  etapaForm: FormGroup;
  submitForm: boolean = false;
  idEtapa!: number;
  
  constructor(
    private modalService: ModalService,
    private etapaService: EtapaService,
    private recargarService: RecargarService,
  ) {
    this.etapaForm = new FormGroup({
      etapa: new FormControl('', [Validators.required]),
      descripcion: new FormControl('', [Validators.required])
    });
  }

  ngOnInit() {
    this.etapaService.getId().subscribe({
      next: (id) => {
        if (id !== null) {
          this.idEtapa = id;
          this.etapaService.findById(id).subscribe({
            next: (etapa) => {
              this.etapaForm.patchValue({ etapa: etapa.nombreEtapa });
              this.etapaForm.patchValue({ descripcion: etapa.descripcionEtapa });
            },
            error: (err) => {
              console.error('Error al obtener etapa por ID', err);
            }
          });
        }
      },
      error: (err) => {
        console.error('Error al obtener el ID de la etapa', err);
      }
    });
  }

  dismissModal() {
    this.modalService.dismissActiveModal();
  }

  isCampoInvalido(nombreCampo: string): boolean {
    const control = this.etapaForm.get(nombreCampo);
    return !!(control?.hasError('required') && (control?.touched || this.submitForm));
  }

  enviarDatos() {
    this.submitForm = true;
    console.log(this.submitForm)

    if (this.etapaForm.invalid) {
      this.etapaForm.markAllAsTouched();
      return;
    };
    const nombreEtapa = this.etapaForm.get('etapa')?.value;
    const descripcionEtapa = this.etapaForm.get('descripcion')?.value;

    this.etapaService.modificarEtapa(nombreEtapa,descripcionEtapa,this.idEtapa).subscribe({
        next: () => {
          this.recargarService.emitirRecarga();
          this.dismissModal();
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "La etapa se modificó correctamente",
            timer: 3000,
            showConfirmButton: false,
          })
        },
        error: (error) => {
          if (error.error.message === "Ya existe una etapa con ese nombre") {
            Swal.fire({
              toast: true,
              icon: 'warning',
              title: 'Ya existe una etapa con ese nombre',
              position: 'top-end',
              timer: 3000,
              showConfirmButton: false
            });
          } else {
            Swal.fire({
              toast: true,
              icon: 'error',
              title: 'No pudo modificarse la etapa',
              position: 'top-end',
              timer: 3000,
              showConfirmButton: false
            });
          }
        },
      });
  }

}
