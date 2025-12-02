import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { ModalService } from '../../../compartidos/modal/modal.service';
import { RecargarService } from '../../recargar.service';
import { RubroService } from '../rubro.service';

@Component({
  selector: 'app-crear-rubro',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-rubro.component.html',
  styleUrl: './crear-rubro.component.css'
})
export class CrearRubroComponent {
  rubroForm: FormGroup;
  modalRef?: NgbModalRef;
  submitForm: boolean = false;
  
  constructor(
    private modalService: ModalService,
    private rubroService: RubroService,
    private recargarService: RecargarService,
  ) {
    this.rubroForm = new FormGroup({
      rubro: new FormControl('', [Validators.required])
    });
  }

  ngOnInit() { }

  dismissModal() {
    this.modalService.dismissActiveModal();
  }

  isCampoInvalido(): boolean {
    const control = this.rubroForm.get('rubro');
    return !!(control?.hasError('required') && (control?.touched || this.submitForm));
  }

  enviarDatos() {
    if (this.rubroForm.invalid) {
      this.rubroForm.markAllAsTouched();
      return;
    }
    const nombreRubro = this.rubroForm.get('rubro')?.value;

    this.rubroService.crearRubro(nombreRubro).subscribe({
      next: () => {
        this.recargarService.emitirRecarga();
        this.submitForm = true;
        this.dismissModal();
        
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "El rubro se creó correctamente",
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
            title: 'No pudo crearse el rubro',
            position: 'top-end',
            timer: 3000,
            showConfirmButton: false
          });
        }
        },
      });
  }
  
}