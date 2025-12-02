import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TipoEventoService } from '../../../../admin/ABMTipoEvento/tipo-evento.service';
import { TipoEvento } from '../../../../admin/ABMTipoEvento/tipo-evento';
import { CalendarioEventoService } from '../calendarioEvento.service';
import Swal from 'sweetalert2'; // <--- importa SweetAlert2
import { UsuarioService } from '../../../seguridad/usuarios/usuario.service';
import { SesionService } from '../../../../interceptors/sesion.service';
import { ModalService } from '../../../../compartidos/modal/modal.service';

@Component({
  selector: 'app-creacion-evento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './creacion-evento.component.html',
  styleUrls: ['./creacion-evento.component.css']
})
export class CreacionEventoComponent implements OnInit {
  @Input() idPostulacionOfertaEtapa!: number;
  @Input() idUsuarioCandidato!: number;
  @Input() idUsuarioEmpleado!: number;

  eventoForm = new FormGroup({
    nombreEvento: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    descripcionEvento: new FormControl(''),
    idTipoEvento: new FormControl<number | null>(null, { validators: [Validators.required] }),
    fechaHoraInicioEvento: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    fechaHoraFinEvento: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  submitForm = false;
  tiposEventos: TipoEvento[] = [];

  correousuario?: string;

  idUsuarioEmpleadoOempresa?: number;

  minDateTime = '';

  @Output() eventoCreado = new EventEmitter<void>();

  constructor(
    private tipoEventoService: TipoEventoService,
    private calendarioEventoService: CalendarioEventoService,
    private usuarioService: UsuarioService,
    private sesionService: SesionService,
    private modalService: ModalService,
  ) {}

  ngOnInit(): void {

    this.minDateTime = this.getCurrentDateTimeLocal();
    this.tipoEventoService.findAllActivos().subscribe({
      next: (tipos) => this.tiposEventos = tipos,
      error: (err) => console.error('Error cargando tipos de evento', err)
    });
    
    const correo = this.sesionService.getCorreoUsuario();
    if (!correo) { console.error('No hay correo en sesión'); return; }

    this.correousuario = correo;
    this.usuarioService.getIdPorCorreo(correo).subscribe({
      next: (id: number) => { 
        this.idUsuarioEmpleadoOempresa = id; 
      },
      error: (err) => console.error('Error obteniendo ID de ', err)
    });

    this.eventoForm.valueChanges.subscribe(() => this.validarFechas());
  }

  getCurrentDateTimeLocal(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }

  validarFechas(): void {
    const inicio = this.eventoForm.get('fechaHoraInicioEvento')?.value;
    const fin = this.eventoForm.get('fechaHoraFinEvento')?.value;

    if (inicio && fin && new Date(fin) < new Date(inicio)) {
      this.eventoForm.get('fechaHoraFinEvento')?.setErrors({ finAnterior: true });
    } else {
      const errors = this.eventoForm.get('fechaHoraFinEvento')?.errors;
      if (errors && errors['finAnterior']) {
        delete errors['finAnterior'];
        if (Object.keys(errors).length === 0) {
          this.eventoForm.get('fechaHoraFinEvento')?.setErrors(null);
        }
      }
    }
  }

  isCampoInvalido(nombre: string): boolean {
    const c = this.eventoForm.get(nombre);
    return !!(c && c.invalid && (c.touched || this.submitForm));
  }

  guardar(): void {
    this.submitForm = true;
    if (this.eventoForm.invalid) return;

    Swal.fire({
      title: '¿Desea confirmar los cambios realizados?',
      // text: '¿Deseás crear este evento con los datos ingresados?',
      icon: 'question',
      iconColor: '#10C036',
      reverseButtons: true,
      showCancelButton: true,
      confirmButtonColor: '#10C036',
      cancelButtonColor: '#697077',
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'No, volver'
    }).then((result) => {
      if (result.isConfirmed) {
        const { nombreEvento, descripcionEvento, idTipoEvento, fechaHoraInicioEvento, fechaHoraFinEvento } = this.eventoForm.value;
        // const inicioISO = fecha && hora ? `${fecha}T${hora}:00` : null;

        // const payload = {
        //   nombreEvento,
        //   descripcionEvento,
        //   idTipoEvento,
        //   fechaHoraInicioEvento: inicioISO,
        //   fechaHoraFinEvento
        // };

        this.calendarioEventoService.crearEvento(nombreEvento!, 
                                                descripcionEvento!, 
                                                idTipoEvento!,
                                                fechaHoraInicioEvento!,
                                                fechaHoraFinEvento!, 
                                                this.idPostulacionOfertaEtapa, 
                                                this.idUsuarioCandidato, 
                                                this.idUsuarioEmpleado
            ).subscribe({
          next: (evento) => {
            // console.log('Evento creado:', evento);
            Swal.fire({
              toast: true,
              position: 'top-end',
              title: '¡Evento creado!',
              text: 'El evento fue creado exitosamente.',
              icon: 'success',
              timer: 3000,
              showConfirmButton: false,
            });
            this.eventoCreado.emit();
            this.eventoForm.reset();
            this.submitForm = false;
            this.dismissModal();
            this.minDateTime = this.getCurrentDateTimeLocal();
          },
          error: (err) => {
            console.error('Error creando evento', err);
            Swal.fire({
              toast: true,
              position: 'top-end',
              title: 'Error',
              text: 'Ocurrió un error al crear el evento. Intentá nuevamente.',
              icon: 'error',
            });
            this.dismissModal();
          }
        });
      }
    });
  }

  dismissModal() {
    this.modalService.dismissActiveModal();
  }

}
