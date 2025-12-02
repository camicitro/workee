import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Router } from 'express';
import Swal from 'sweetalert2';
import { ModalService } from '../../../compartidos/modal/modal.service';
import { RecargarService } from '../../recargar.service';
import { GeneroService } from '../genero.service';

@Component({
  selector: 'app-crear-genero',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-genero.component.html',
  styleUrl: './crear-genero.component.css'
})
export class CrearGeneroComponent {
  generoForm: FormGroup;
  modalRef?: NgbModalRef;
  submitForm: boolean = false;
  
  constructor(
    private modalService: ModalService,
    private generoService: GeneroService,
    private recargarService: RecargarService,
  ) {
    this.generoForm = new FormGroup({
      genero: new FormControl('', [Validators.required])
    });
  }

  ngOnInit() { }

  dismissModal() {
    this.modalService.dismissActiveModal();
  }

  isCampoInvalido(): boolean {
    const control = this.generoForm.get('genero');
    return !!(control?.hasError('required') && (control?.touched || this.submitForm));
  }

  enviarDatos() {
    if (this.generoForm.invalid) {
      this.generoForm.markAllAsTouched();
      return;
    }
    const nombreGenero = this.generoForm.get('genero')?.value;

    this.generoService.crearGenero(nombreGenero).subscribe({
      next: () => {
        this.recargarService.emitirRecarga();
        this.submitForm = true;
        this.dismissModal();
        
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "El género se creó correctamente",
          timer: 3000,
          showConfirmButton: false,
        })
      },
      error: (error) => {
        if (error.error.message === 'El género ya existe') {
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
            title: 'No pudo crearse el género',
            position: 'top-end',
            timer: 3000,
            showConfirmButton: false
          });
        }
        },
      });
  }
  
}