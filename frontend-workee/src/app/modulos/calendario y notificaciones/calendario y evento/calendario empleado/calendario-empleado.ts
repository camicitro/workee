import { Component, OnInit } from '@angular/core';
import { CalendarOptions, EventClickArg, EventApi, EventInput } from '@fullcalendar/core';
import { CalendarioBaseComponent } from '../componente calendario/calendario.component';
import { toFcEvent } from '../evento.adapter';
import { CalendarioEventoService } from '../calendarioEvento.service';
import { SesionService } from '../../../../interceptors/sesion.service';
import { UsuarioService } from '../../../seguridad/usuarios/usuario.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-calendario-empleado',
  standalone: true,
  imports: [CalendarioBaseComponent],
  template: `<app-calendario-base [options]="options"></app-calendario-base>`
})
export class CalendarioEmpleadoComponent implements OnInit {
  options: CalendarOptions = { editable: false, selectable: false, events: [] as EventInput[] };

  correousuario!: string;
  idUsuariodelEmpleado!: number;

  constructor(
    private calendarioEventoService: CalendarioEventoService,
    private sesionService: SesionService,
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // inicializá handlers acá para evitar “used before initialization”
    this.options = {
      ...this.options,
      eventClick: (arg) => this.onEventClick(arg),
      eventMouseEnter: (arg) => this.onEventMouseEnter(arg),
      eventMouseLeave: (arg) => this.onEventMouseLeave(arg)
    };

    const correo = this.sesionService.getCorreoUsuario();
    if (!correo) { console.error('No hay correo en sesión'); return; }

    this.correousuario = correo;
    this.usuarioService.getIdPorCorreo(correo).subscribe({
      next: (id: number) => { this.idUsuariodelEmpleado = id; this.cargarEventos(); },
      error: (err) => console.error('Error obteniendo ID del Empleado', err)
    });
  }

  cargarEventos(): void {
    this.calendarioEventoService.getEventosPorUsuario(this.idUsuariodelEmpleado).subscribe({
      next: (data) => {
        this.options = {
          ...this.options,
          events: data.map(toFcEvent)
        };
      },
      error: (err) => console.error('Error cargando eventos Empleado', err)
    });
  }


  onEventClick(arg: EventClickArg) {
    arg.jsEvent.preventDefault();

    const ev = arg.event;
    const id = ev.id;
    if (!arg.jsEvent.ctrlKey) {
      this.router.navigate(['/eventos', id]);
      return;
    }
    const xp: any = ev.extendedProps;
    const descripcion = xp?.descripcion ?? '(sin descripción)';
    const tipo = xp?.tipo?.nombre ?? xp?.tipo ?? '(sin tipo)';
    const videollamada = xp?.videollamada ?? '(sin enlace)';

    Swal.fire({
      title: ev.title,
      html: `
        <div style="text-align:left">
          <p><b>Inicio:</b> ${ev.start?.toLocaleString() ?? '-'}</p>
          <p><b>Fin:</b> ${ev.end?.toLocaleString() ?? '-'}</p>
          <p><b>Tipo:</b> ${tipo}</p>
          <p><b>Descripción:</b> ${descripcion}</p>
          <p><b>Videollamada:</b> ${videollamada}</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Ir al detalle',
      cancelButtonText: 'Cerrar'
    }).then(res => {
      if (res.isConfirmed) this.router.navigate(['/eventos', id]);
    });
  }
  onEventMouseEnter(arg: { el: HTMLElement; event: EventApi }) {
    arg.el.style.cursor = 'pointer';
    const xp: any = arg.event.extendedProps;
    arg.el.title = xp?.descripcion ?? arg.event.title ?? '';
  }

  onEventMouseLeave(arg: { el: HTMLElement; event: EventApi }) {
    arg.el.style.cursor = '';
    arg.el.title = '';
  }
}
