import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HabilidadService } from '../habilidad.service';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { ModalService } from '../../../compartidos/modal/modal.service';
import { RecargarService } from '../../recargar.service';
import { TipoHabilidadService } from '../../ABMTipoHabilidad/tipo-habilidad.service';

@Component({
  standalone: true,
  selector: 'app-crear-habilidad',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-habilidad.component.html',
  styleUrl: './crear-habilidad.component.css'
})
export class CrearHabilidadComponent {
  habilidadForm: FormGroup;
  modalRef?: NgbModalRef;
  submitForm: boolean = false;
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
      },
      error: (err) => {
        console.error('Error al obtener los tipos de habilidad', err);
      }
    })
  }

  dismissModal() {
    this.modalService.dismissActiveModal();
  }

  isCampoInvalido(nombreCampo: string): boolean {
    const control = this.habilidadForm.get(nombreCampo);
    return !!(control?.hasError('required') && (control?.touched || this.submitForm));
  }

  trackByTipoId(index: number, tipo: any): number {
    return tipo.idTipoHabilidad;
  }

  enviarDatos() {
    this.submitForm = true;

    if (this.habilidadForm.invalid) {
      this.habilidadForm.markAllAsTouched();
      return;
    }

    const nombreHabilidad = this.habilidadForm.get('habilidad')?.value;
    const idTipoHabilidad = Number(this.habilidadForm.get('tipoHabilidad')?.value);

    this.habilidadService.crearHabilidad(nombreHabilidad, idTipoHabilidad).subscribe({
      next: () => {
        this.recargarService.emitirRecarga();
        this.submitForm = true;
        console.log("Pongo submit Form en true");
        this.dismissModal();
        
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "La habilidad se creó correctamente",
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
            title: 'No pudo crearse la habilidad',
            position: 'top-end',
            timer: 3000,
            showConfirmButton: false
          });
        }
        },
      });
  }
  
}
