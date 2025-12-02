import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TipoContratoService } from '../tipo-contrato.service';
import { ModalService } from '../../../compartidos/modal/modal.service';
import { RecargarService } from '../../recargar.service';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  selector: 'app-modificar-tipo-contrato',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modificar-tipo-contrato.component.html',
  styleUrl: './modificar-tipo-contrato.component.css'
})
export class ModificarTipoContratoComponent {
  tipoForm: FormGroup;
  submitForm: boolean = false;
  @Input() idTipo!: number;
  
  constructor(
    private modalService: ModalService,
    private tipoContratoService: TipoContratoService,
    private recargarService: RecargarService,
  ) {
    this.tipoForm = new FormGroup({
      tipo: new FormControl('', [Validators.required])
    });
  }

  ngOnInit() {
    this.tipoContratoService.getId().subscribe({
      next: (id) => {
        if (id !== null) {
          this.idTipo = id;

          this.tipoContratoService.findById(id).subscribe({
            next: (tipo) => {
              this.tipoForm.patchValue({ tipo: tipo.nombreTipoContratoOferta });
            },
            error: (err) => {
              console.error('Error al obtener tipo de contrato por ID', err);
            }
          });
        }
      },
      error: (err) => {
        console.error('Error al obtener el ID del tipo de contrato', err);
      }
    });
  }

  dismissModal() {
    this.modalService.dismissActiveModal();
  }

  isCampoInvalido(): boolean {
    const control = this.tipoForm.get('tipo');
    return !!(control?.hasError('required') && (control.touched || this.submitForm));
  }

  enviarDatos() {
    this.submitForm = true;
    console.log(this.submitForm)

    if (this.tipoForm.invalid || !this.idTipo) {
      this.tipoForm.markAllAsTouched();
      return;
    };
    const nombreTipoContrato = this.tipoForm.get('tipo')?.value;

    this.tipoContratoService.modificarTipoContrato(this.idTipo, nombreTipoContrato).subscribe({
        next: () => {
          this.recargarService.emitirRecarga();
          this.dismissModal();
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "El tipo de contrato se modificó correctamente",
            timer: 3000,
            showConfirmButton: false,
          })
        },
        error: (error) => {
          if (error.error.message === "El tipo de contrato de oferta ya existe.") {
            Swal.fire({
              toast: true,
              icon: 'warning',
              title: 'Ya existe un tipo de contrato con ese nombre',
              position: 'top-end',
              timer: 3000,
              showConfirmButton: false
            });
          } else {
            Swal.fire({
              toast: true,
              icon: 'error',
              title: 'No pudo modificarse el tipo de contrato',
              position: 'top-end',
              timer: 3000,
              showConfirmButton: false
            });
          }
        },
      });
  }
}