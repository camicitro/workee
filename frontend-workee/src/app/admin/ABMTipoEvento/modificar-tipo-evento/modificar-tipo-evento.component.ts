import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalService } from '../../../compartidos/modal/modal.service';
import { RecargarService } from '../../recargar.service';
import { TipoEventoService } from '../tipo-evento.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modificar-tipos-evento',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modificar-tipo-evento.component.html',
  styleUrl: './modificar-tipo-evento.component.css'
})
export class ModificarTipoEventoComponent {
  tipoForm: FormGroup;
  submitForm: boolean = false;
  idTipo!: number;
  
  constructor(
    private modalService: ModalService,
    private tipoEventoService: TipoEventoService,
    private recargarService: RecargarService,
  ) {
    this.tipoForm = new FormGroup({
      tipo: new FormControl('', [Validators.required])
    });
  }

  ngOnInit() {
    this.tipoEventoService.getId().subscribe({
      next: (id) => {
        if (id !== null) {
          this.idTipo = id;

          this.tipoEventoService.findById(id).subscribe({
            next: (tipo) => {
              this.tipoForm.patchValue({ tipo: tipo.nombreTipoEvento });
            },
            error: (err) => {
              console.error('Error al obtener tipo de evento por ID', err);
            }
          });
        }
      },
      error: (err) => {
        console.error('Error al obtener el ID del tipo de evento', err);
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
    const nombreTipoEvento = this.tipoForm.get('tipo')?.value;

    this.tipoEventoService.modificarTipoEvento(this.idTipo, nombreTipoEvento).subscribe({
        next: () => {
          this.recargarService.emitirRecarga();
          this.dismissModal();
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "El tipo de evento se modificó correctamente",
            timer: 3000,
            showConfirmButton: false,
          })
        },
        error: (error) => {
          if (error.error.message === "Ya existe un tipo de evento con ese nombre") {
            Swal.fire({
              toast: true,
              icon: 'warning',
              title: 'Ya existe un tipo de evento con ese nombre',
              position: 'top-end',
              timer: 3000,
              showConfirmButton: false
            });
          } else {
            Swal.fire({
              toast: true,
              icon: 'error',
              title: 'No pudo modificarse el tipo de evento',
              position: 'top-end',
              timer: 3000,
              showConfirmButton: false
            });
          }
        },
      });
  }

}
