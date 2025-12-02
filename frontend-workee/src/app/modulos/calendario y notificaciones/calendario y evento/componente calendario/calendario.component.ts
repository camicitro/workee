// calendario-base.component.ts
import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import { Router } from '@angular/router';
import { combineLatest, of } from 'rxjs';
import { filter, take, switchMap, map } from 'rxjs/operators';
import { PermisoService } from '../../../seguridad/Gestion de roles/permiso.service';
import { SesionService } from '../../../../interceptors/sesion.service';

@Component({
  selector: 'app-calendario-base',
  standalone: true,
  imports: [FullCalendarModule],
  template: `<full-calendar #cal [options]="mergedOptions"></full-calendar>`,
  styleUrls: ['./calendario.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CalendarioBaseComponent implements OnInit {
  @ViewChild('cal', { static: true }) cal!: FullCalendarComponent;
  @Input() options: CalendarOptions = {};

  constructor(
    private router: Router,
    private sesionService: SesionService,
    private permisoService: PermisoService
  ) {}

  base: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, bootstrap5Plugin],
    themeSystem: 'bootstrap5',
    initialView: 'dayGridMonth',
    slotMinTime: '07:00:00',
    eventDisplay: 'block',
    displayEventTime: true,
    slotMaxTime: '22:00:00',
    slotDuration: '01:00:00',
    slotLabelFormat: { hour: '2-digit', minute: '2-digit', meridiem: false },
    dayMaxEvents: 3,
    moreLinkContent: (arg) => `Ver más (${arg.num})`,
    moreLinkClick: (arg) => { this.cal.getApi().changeView('timeGridDay', arg.date); },
    locale: 'es',
    height: 825,
    aspectRatio: 15,
    timeZone: 'America/Argentina/Mendoza',

    customButtons: {
      myPrev:  { text: '‹', click: () => this.cal.getApi().prev() },
      myNext:  { text: '›', click: () => this.cal.getApi().next() },
      myToday: { text: 'Hoy', click: () => this.cal.getApi().today() },
    },
    headerToolbar: {
      left: 'myPrev,myNext myToday',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    buttonText: { today: 'Hoy', month: 'Mes', week: 'Semana', day: 'Día' },

    navLinks: true,
    navLinkDayClick: (date) => this.cal.getApi().changeView('timeGridDay', date),

    dateClick: (arg) => {
      const api = this.cal.getApi();
      if (api.view.type === 'dayGridMonth') api.changeView('timeGridDay', arg.date);
    },

  eventClick: (arg) => {
    const id = (arg.event.extendedProps as any)?.id ?? arg.event.id;
    if (id) {
      this.router.navigate(
        ['/eventos', id],
        {
          queryParams: {
            from: 'calendario',
            back: this.router.url   // p.ej. /calendario/empresa
          }
        }
      );
    }
  },


    eventDidMount: (info) => {
      const start = info.event.start!;
      const end = info.event.end ?? start;
      const mins = (end.getTime() - start.getTime()) / 60000;
      if (mins < 45) info.el.classList.add('evt-short');
    },
  };

  ngOnInit(): void {
    // Carga de datos base
    this.sesionService.cargarCategoriaUsuario();
    this.sesionService.cargarRolUsuarioSinRedireccion();

    const categoria$ = this.sesionService.categoria$.pipe(
      filter((cat: any) => !!cat),
      take(1)
    );

    const rol$ = this.sesionService.rolUsuario$.pipe(
      filter((rol: any) => !!rol),
      take(1)
    );

    // Combinamos categoría + rol y, si corresponde, traemos permisos
    combineLatest([categoria$, rol$]).pipe(
      switchMap(([cat, rol]: [any, any]) => {
        const nombreCat = (cat?.nombreCategoriaRol ?? cat?.nombre ?? '').toString().toUpperCase();

        if (nombreCat === 'EMPLEADO') {
          // Si es EMPLEADO, traemos permisos del rol para decidir redirección
          return this.permisoService.permisosdeunRol(rol.id!).pipe(
            map((perms: any[]) => ({ nombreCat, perms }))
          );
        }
        // Para otras categorías no necesitamos permisos
        return of({ nombreCat, perms: [] as any[] });
      }),
      take(1)
    ).subscribe(({ nombreCat, perms }) => {
      const destino = this.destinoPorCategoria(nombreCat, perms);

      if (destino && !this.router.url.startsWith(destino)) {
        this.router.navigateByUrl(destino);
      } else if (!destino) {
        this.router.navigate(['/acceso-denegado']);
      }
    });
  }

  // ⬇️ Ahora acepta permisos para decidir el caso EMPLEADO
  private destinoPorCategoria(nombre: string, permisos: any[] = []): string | null {
    switch (nombre) {
      case 'CANDIDATO':
        return '/calendario/candidato';
      case 'EMPLEADO': {
        const puedeVerEmpresa = permisos?.some(p => p?.codigoPermiso === 'VER_EVENTOS_EMPRESA');
        return puedeVerEmpresa ? '/calendario/empresa' : '/calendario/empleado';
      }
      case 'EMPRESA':
        return '/calendario/empresa';
      default:
        return null;
    }
  }

  get mergedOptions(): CalendarOptions {
    return { ...this.base, ...this.options };
  }
}
