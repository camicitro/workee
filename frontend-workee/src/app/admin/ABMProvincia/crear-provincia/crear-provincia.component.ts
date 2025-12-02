import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalService } from '../../../compartidos/modal/modal.service';
import { ProvinciaService } from '../provincia.service';
import { Router } from '@angular/router';
import { RecargarService } from '../../recargar.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-crear-provincia',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-provincia.component.html',
  styleUrl: './crear-provincia.component.css'
})
export class CrearProvinciaComponent {
  
  // recibe el id desde el ListadoProvinciasComponent
  @Input() idPais!: number;
  
  provinciaForm: FormGroup;
  modalRef?: NgbModalRef;
  submitForm: boolean = false;
  
  constructor(
    private modalService: ModalService,
    private provinciaService: ProvinciaService,
    private recargarService: RecargarService,
  ) {
    this.provinciaForm = new FormGroup({
      provincia: new FormControl('', [Validators.required])
    });
  }

  ngOnInit() {console.log("ID del país recibido en modal:", this.idPais); }

  dismissModal() {
    this.modalService.dismissActiveModal();
  }

  isCampoInvalido(): boolean {
    const control = this.provinciaForm.get('provincia');
    return !!(control?.hasError('required') && (control?.touched || this.submitForm));
  }

  enviarDatos() {
    if (this.provinciaForm.invalid) {
      this.provinciaForm.markAllAsTouched();
      return;
    }
    // 'pais' es lo que esta en el formControlName del input
    const nombreProvincia = this.provinciaForm.get('provincia')?.value;

    if(!this.idPais || !nombreProvincia) return;

    this.provinciaService.crearProvincia(nombreProvincia,this.idPais).subscribe({
      next: () => {
        this.recargarService.emitirRecarga();
        this.submitForm = true;
        console.log("Pongo submit Form en true");
        this.dismissModal();
        
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "La provincia se creó correctamente",
          timer: 3000,
          showConfirmButton: false,
        })
      },
      error: (error) => {
        if (error.error.message === 'Ya existe una provincia con ese nombre') {
          // this.paisForm.get('pais')?.setErrors({ duplicado: true });
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
            title: 'No pudo crearse el país',
            position: 'top-end',
            timer: 3000,
            showConfirmButton: false
          });
        }
        },
      });
  }
  
}
