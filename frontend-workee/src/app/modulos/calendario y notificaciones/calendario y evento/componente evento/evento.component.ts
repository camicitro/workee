import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Evento } from '../evento';
import { CalendarioEventoService } from '../calendarioEvento.service';
import { UsuarioService } from '../../../seguridad/usuarios/usuario.service';
import { Candidato } from '../../../candidato/candidato';
import { Empleado } from '../../../empresa/empleados/empleado';
import { Router } from '@angular/router';
import { SesionService } from '../../../../interceptors/sesion.service';
import { filter, take } from 'rxjs';
import Swal from 'sweetalert2';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-evento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // <--- AGREGA ReactiveFormsModule
  templateUrl: './evento.component.html',
  styleUrls: ['./evento.component.css']
})
export class EventoComponent implements OnInit {
  @Input() evento?: Evento;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private calendarioEvento = inject(CalendarioEventoService);
  private usuarioService = inject(UsuarioService);
  private sesionService = inject(SesionService);
  private fb = inject(FormBuilder); // <--- FORM BUILDER

  cargando = false;
  error?: string;

  idUsuarioEmpleado?: number;
  idUsuarioCandidato?: number;

  candidatoEncontrado?: Candidato;
  empleadoEncontrado?: Empleado;
  nombreCategoriaUsuario?: string;

  modoEdicion? = false;

  linkVcall?: string | null;
  linkEvt?: string | null;

  formEvento!: FormGroup;

  minDateTime = '';

  private backUrl?: string;
  
  ngOnInit(): void {
    this.sesionService.cargarCategoriaUsuario();

    const qp = this.route.snapshot.queryParamMap;
    const from = qp.get('from'); // 'postulacion' | 'calendario' | null (opcional, por si querés loguear)
    const back = qp.get('back');
    this.backUrl = this.isSafeInternal(back) ? back! : '/calendario';

    this.sesionService.categoria$
      .pipe(filter((cat) => !!cat), take(1))
      .subscribe((cat: any) => {
        const nombre = (cat?.nombreCategoriaRol ?? cat?.nombre ?? '').toString().toUpperCase();
        this.nombreCategoriaUsuario = nombre;
        console.log('Categoría del usuario:', nombre);
      });

    // Si viene id en ruta, lo busco
    if (!this.evento) {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      if (id) {
        this.cargando = true;
        this.calendarioEvento.getEventoById(id).subscribe({
          next: (ev) => {
            console.log('Evento cargado:', ev);
            this.evento = ev;

            // ⬇️ cacheamos los enlaces para que no “parpadeen”
            this.linkVcall = ev?.videollamada?.enlaceVideollamada?.trim() || null;
            this.linkEvt   = ev?.enlaceEvento?.trim() || null;

            this.cargando = false;

            this.idUsuarioCandidato = ev.usuarioCandidato?.id ?? undefined;
            this.buscarCandidato(this.idUsuarioCandidato);

            this.idUsuarioEmpleado = ev.usuarioEmpleado?.id ?? undefined;
            this.buscarEmpleado(this.idUsuarioEmpleado);

            this.buildForm(ev);
          },
          error: () => { this.cargando = false; }
        });
      }
    } else {
      // si vino por @Input
      this.linkVcall = this.evento?.videollamada?.enlaceVideollamada?.trim() || null;
      this.linkEvt   = this.evento?.enlaceEvento?.trim() || null;
      this.buildForm(this.evento);
    }
  }

  getCurrentDateTimeLocal(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }

  validarFechas(): void {
    const inicio = this.formEvento.get('fechaHoraInicioEvento')?.value;
    const fin = this.formEvento.get('fechaHoraFinEvento')?.value;

    if (inicio && fin && new Date(fin) < new Date(inicio)) {
      this.formEvento.get('fechaHoraFinEvento')?.setErrors({ finAnterior: true });
    } else {
      const errors = this.formEvento.get('fechaHoraFinEvento')?.errors;
      if (errors && errors['finAnterior']) {
        delete errors['finAnterior'];
        if (Object.keys(errors).length === 0) {
          this.formEvento.get('fechaHoraFinEvento')?.setErrors(null);
        }
      }
    }
  }

  isCampoInvalido(nombre: string): boolean {
    const c = this.formEvento.get(nombre);
    return !!(c && c.invalid && c.touched);
  }

  private buildForm(ev?: Evento) {
    const inicio = ev?.fechaHoraInicioEvento ? new Date(ev.fechaHoraInicioEvento) : new Date();
    const fin    = ev?.fechaHoraFinEvento    ? new Date(ev.fechaHoraFinEvento)    : new Date(inicio.getTime() + 60*60*1000);


    this.formEvento = this.fb.group({
      nombreEvento: [ev?.nombreEvento ?? '', [Validators.required, Validators.maxLength(200)]],
      descripcionEvento: [ev?.descripcionEvento ?? ''],
      enlaceEvento: [ev?.enlaceEvento ?? '', [Validators.maxLength(500)]],
      fechaHoraInicioEvento: [this.toDatetimeLocal(inicio), [Validators.required]],
      fechaHoraFinEvento:    [this.toDatetimeLocal(fin),    [Validators.required]],
    });
  }
  private toDatetimeLocal(d: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  }

  private fromDatetimeLocal(value: string): Date {
    return new Date(value);
  }

  private buscarCandidato(id?: number): void {
    if (!id) {
      console.log('No me pasaron el id del candidato');
      this.cargando = false; 
      return;
    }

    this.usuarioService.getcandidatoByIdUsuario(id).subscribe({
      next: (candidato) => {
        this.candidatoEncontrado = candidato;
        console.log('Candidato encontrado:', this.candidatoEncontrado);
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudo cargar el candidato';
        this.cargando = false;
      }
    });
  }

  private buscarEmpleado(id?: number): void {
    if (!id) {
      console.log('No me pasaron el id del empleado');
      this.cargando = false; 
      return;
    }

    this.usuarioService.getempleadoByIdUsuario(id).subscribe({
      next: (empleado) => {
        this.empleadoEncontrado = empleado;
        console.log('Empleado encontrado:', this.empleadoEncontrado);
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudo cargar el empleado';
        this.cargando = false;
      }
    });
  }

  get fechaFormateada(): string {
    if (!this.evento?.fechaHoraInicioEvento) return '';

    const inicio = new Date(this.evento.fechaHoraInicioEvento);
    const opcionesFecha: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };
    return inicio.toLocaleDateString('es-ES', opcionesFecha);
  }

  get horaFormateada(): string {
    if (!this.evento?.fechaHoraInicioEvento) return '';

    const inicio = new Date(this.evento.fechaHoraInicioEvento);
    const fin = this.evento?.fechaHoraFinEvento
      ? new Date(this.evento.fechaHoraFinEvento)
      : new Date(inicio.getTime() + 60 * 60 * 1000); // 1h por defecto

    const horaInicio = inicio.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const horaFin = fin.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    const duracionMinutos = Math.round((fin.getTime() - inicio.getTime()) / 60000);
    const duracion = duracionMinutos >= 60
      ? `${Math.floor(duracionMinutos / 60)}h${duracionMinutos % 60 ? ' ' + (duracionMinutos % 60) + 'm' : ''}`
      : `${duracionMinutos}m`;

    return `${horaInicio} - ${horaFin} (${duracion})`;
  }


  get inicioFormateado(): string {
  if (!this.evento?.fechaHoraInicioEvento) return '';
  const i = new Date(this.evento.fechaHoraInicioEvento);
  return this.formatDateTime(i);
}

get finFormateado(): string {
  const i = this.evento?.fechaHoraInicioEvento
    ? new Date(this.evento.fechaHoraInicioEvento)
    : null;
  let f = this.evento?.fechaHoraFinEvento
    ? new Date(this.evento.fechaHoraFinEvento)
    : null;

  // si no hay fin, asumimos +1h del inicio
  if (!f && i) f = new Date(i.getTime() + 60 * 60 * 1000);
  if (!f) return '';

  return this.formatDateTime(f);
}

/** Formato “Martes, 11 de noviembre de 2025, 19:52” */
private formatDateTime(d: Date): string {
  const opts: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    // si querés fijar zona explícita, descomentá:
    // timeZone: 'America/Argentina/Buenos_Aires'
  };
  return d.toLocaleString('es-AR', opts);
}


  guardarCambios() {
    if (!this.evento?.id) return;
    if (this.formEvento.invalid) {
      this.formEvento.markAllAsTouched();
      Swal.fire({
        title: 'Datos incompletos',
        text: 'Revisá los campos obligatorios.',
        icon: 'warning',
        confirmButtonColor: '#31A5DD'
      });
      return;
    }

    const v = this.formEvento.value;
    const inicio = new Date(v.fechaHoraInicioEvento); // local
    const fin    = new Date(v.fechaHoraFinEvento);

    const payload: Partial<Evento> = {
      nombreEvento: v.nombreEvento?.trim(),
      descripcionEvento: v.descripcionEvento?.trim(),
      enlaceEvento: v.enlaceEvento?.trim(),
      // <<< HACK aplicado acá >>>
      fechaHoraInicioEvento: this.freezeLocalToZ(inicio),
      fechaHoraFinEvento:    this.freezeLocalToZ(fin),
    };

    if (new Date(payload.fechaHoraFinEvento!) <= new Date(payload.fechaHoraInicioEvento!)) {
      Swal.fire({
        title: 'Rango horario inválido',
        text: 'La hora fin debe ser posterior a la hora inicio.',
        icon: 'error',
        confirmButtonColor: '#31A5DD'
      });
      return;
    }

    this.cargando = true;
    this.calendarioEvento.modificarEventoPorId(this.evento.id, payload).pipe(take(1)).subscribe({
      next: (evActualizado) => {
        this.cargando = false;
        this.evento = evActualizado; // refresco estado local
        this.modoEdicion = false;
        Swal.fire({
          title: 'Guardado',
          text: 'Los cambios se guardaron correctamente.',
          icon: 'success',
          confirmButtonColor: '#31A5DD'
        });
      },
      error: () => {
        this.cargando = false;
        Swal.fire({
          title: 'Error',
          text: 'No se pudieron guardar los cambios. Intente nuevamente.',
          icon: 'error',
          confirmButtonColor: '#31A5DD'
        });
      }
    });
  }

  private freezeLocalToZ(d: Date): string {
  // Resta el offset local (p. ej. -03:00 => 180 min) antes de serializar
  const t = d.getTime() - d.getTimezoneOffset() * 60000;
  return new Date(t).toISOString();
  }

  cancelarEdicion() {
    if (!this.modoEdicion) return;
    Swal.fire({
      title: '¿Descartar cambios?',
      text: 'Los cambios no guardados se perderán.',
      icon: 'question',
      iconColor: '#31A5DD',
      showCancelButton: true,
      confirmButtonColor: '#31A5DD',
      cancelButtonColor: '#697077',
      confirmButtonText: 'Sí, descartar',
      cancelButtonText: 'Seguir editando',
      reverseButtons: true,
      customClass: { title: 'titulo-chico' }
    }).then((r) => {
      if (r.isConfirmed) {
        // restauro valores desde this.evento
        this.buildForm(this.evento);
        this.modoEdicion = false;
      }
    });
  }

  volver() {
    if (this.modoEdicion) {
      this.cancelarEdicion(); // ya tenés la confirmación ahí
      return;
    }
    this.router.navigateByUrl(this.backUrl ?? '/calendario');
  }

  modificarEmpleado() {
    this.modoEdicion = true;
    if (this.evento) this.buildForm(this.evento);
  }

  volverAEvento() {
    if (this.modoEdicion) {
      Swal.fire({
        title: '¿Volver sin guardar?',
        text: 'Los cambios realizados no se guardarán',
        icon: 'question',
        iconColor: '#31A5DD',
        showCancelButton: true,
        confirmButtonColor: '#31A5DD',
        cancelButtonColor: '#697077',
        confirmButtonText: 'Sí, volver',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
        customClass: { title: 'titulo-chico' }
      }).then((r) => {
        if (r.isConfirmed) this.modoEdicion = false;
      });
    } else {
      this.router.navigateByUrl(this.backUrl ?? '/calendario');
    }
  }


  eliminarEvento() {
  const eventoId = this.evento?.id;
  if (typeof eventoId !== 'number') return;

  Swal.fire({
    title: '¿Desea eliminar el evento?',
    text: 'Esta acción no se puede deshacer',
    icon: 'warning',
    iconColor: '#F04438',
    showCancelButton: true,
    confirmButtonColor: '#F04438',
    cancelButtonColor: '#697077',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
    customClass: { title: 'titulo-chico' }
  }).then((result) => {
    if (!result.isConfirmed) return;

    this.cargando = true;
    this.calendarioEvento.eliminarEventoPorId(eventoId).pipe(take(1)).subscribe({
      next: () => {
        this.cargando = false;
        Swal.fire({
          title: 'Eliminado',
          text: 'El evento fue eliminado correctamente.',
          icon: 'success',
          confirmButtonColor: '#31A5DD'
        }).then(() => {
          this.router.navigate(['calendario']); // vuelve al base (que redirige según categoría)
        });
      },
      error: () => {
        this.cargando = false;
        Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar el evento. Intente nuevamente.',
          icon: 'error',
          confirmButtonColor: '#31A5DD'
        });
      }
    });
  });
}

 copiar(texto?: string) {
  if (!texto) return;
  if (navigator?.clipboard?.writeText) {
    navigator.clipboard.writeText(texto).then(() => {
      Swal.fire({ toast:true, position:'top-end', icon:'success', title:'Enlace copiado', timer:2000, showConfirmButton:false });
    }).catch(() => this.alertaNoCopiado());
  } else {
    const ta = document.createElement('textarea');
    ta.value = texto;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      Swal.fire({ toast:true, position:'top-end', icon:'success', title:'Enlace copiado', timer:2000, showConfirmButton:false });
    } catch { this.alertaNoCopiado(); }
    finally { document.body.removeChild(ta); }
  }
}

private alertaNoCopiado() {
  Swal.fire({ icon:'warning', title:'No se pudo copiar el enlace', timer:2000, showConfirmButton:false });
}
 

get hasDescripcion(): boolean {
  const d = this.evento?.descripcionEvento;
  return !!(d && d.trim().length);
}

get linkVcalll(): string | null {
  const s = this.evento?.videollamada?.enlaceVideollamada ?? '';
  const t = s?.trim();
  return t ? t : null;
}

get linkEvtt(): string | null {
  const s = this.evento?.enlaceEvento ?? '';
  const t = s?.trim();
  return t ? t : null;
}

get hasEnlace(): boolean {
  return !!(this.linkVcall || this.linkEvt);
}

private isSafeInternal(url: string | null): boolean {
  return !!url && url.startsWith('/'); // simple guard para evitar navegar a externos
}

}
