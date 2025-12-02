import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { ModalService } from '../../../compartidos/modal/modal.service';
import { PaisService } from '../pais.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RecargarService } from '../../recargar.service';

@Component({
  selector: 'app-crear-pais',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-pais.component.html',
  styleUrl: './crear-pais.component.css'
})
export class CrearPaisComponent implements OnInit{
  paisForm: FormGroup;
  modalRef?: NgbModalRef;
  submitForm: boolean = false;
  
  constructor(
    private modalService: ModalService,
    private paisService: PaisService,
    private router: Router,
    private recargarService: RecargarService,
  ) {
    this.paisForm = new FormGroup({
      pais: new FormControl('', [Validators.required])
    });
  }

  ngOnInit() { }

  dismissModal() {
    this.modalService.dismissActiveModal();
  }

  isCampoInvalido(): boolean {
    const control = this.paisForm.get('pais');
    return !!(control?.hasError('required') && (control?.touched || this.submitForm));
  }

  enviarDatos() {
    if (this.paisForm.invalid) {
      this.paisForm.markAllAsTouched();
      return;
    }
    // 'pais' es lo que esta en el formControlName del input
    const nombrePais = this.paisForm.get('pais')?.value;

    this.paisService.crearPais(nombrePais).subscribe({
      next: () => {
        this.recargarService.emitirRecarga();
        this.submitForm = true;
        console.log("Pongo submit Form en true");
        this.dismissModal();
        
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "El país se creó correctamente",
          timer: 3000,
          showConfirmButton: false,
        })
      },
      error: (error) => {
        if (error.error.message === 'Ya existe un país con ese nombre') {
          // this.paisForm.get('pais')?.setErrors({ duplicado: true });
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