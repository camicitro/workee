import { Component, OnInit } from '@angular/core';
import { CalendarOptions, EventClickArg, EventApi, EventInput } from '@fullcalendar/core';
import { CalendarioBaseComponent } from '../componente calendario/calendario.component';
import { toFcEvent } from '../evento.adapter';
import { CalendarioEventoService } from '../calendarioEvento.service';
import { SesionService } from '../../../../interceptors/sesion.service';
import { UsuarioService } from '../../../seguridad/usuarios/usuario.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Empresa } from '../../../empresa/empresa/empresa';
import { catchError, map, of, switchMap, tap, take } from 'rxjs';

@Component({
  selector: 'app-calendario-empresa',
  standalone: true,
  imports: [CalendarioBaseComponent],
  template: `<app-calendario-base [options]="options"></app-calendario-base>`
})
export class CalendarioEmpresaComponent implements OnInit {
  options: CalendarOptions = { editable: false, selectable: false, events: [] as EventInput[] };

  correousuario!: string;
  idEmpresa!: number;
  idUsuarioEmpresa!: number;

  constructor(
    private calendarioEventoService: CalendarioEventoService,
    private sesionService: SesionService,
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // seteo handlers del calendario
    this.options = {
      ...this.options,
      eventClick: (arg) => this.onEventClick(arg),
      eventMouseEnter: (arg) => this.onEventMouseEnter(arg),
      eventMouseLeave: (arg) => this.onEventMouseLeave(arg)
    };

    const correo = this.sesionService.getCorreoUsuario();
    if (!correo) {
      console.error('No hay correo en sesión');
      return;
    }
    this.correousuario = correo;

    // Secuencia: correo -> idUsuario -> Empresa -> idEmpresa -> eventos
    this.usuarioService.getIdPorCorreo(correo).pipe(
      take(1),
      tap((idUsuario: number) => { this.idUsuarioEmpresa = idUsuario; }),
      switchMap((idUsuario: number) =>
        this.usuarioService.getempresaByIdUsuario(idUsuario).pipe(
          take(1),
          tap((emp: Empresa) => { this.idEmpresa = emp.id!; })
        )
      ),
      switchMap(() =>
        this.calendarioEventoService.getEventosPorEmpresa(this.idEmpresa).pipe(take(1))
      ),
      map(data => data.map(toFcEvent)),
      catchError(err => {
        console.error('Error en la carga encadenada (usuario/empresa/eventos):', err);
        return of([] as EventInput[]);
      })
    ).subscribe((fcEvents: EventInput[]) => {
      // Actualizo el calendario con los eventos
      this.options = { ...this.options, events: fcEvents };
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
