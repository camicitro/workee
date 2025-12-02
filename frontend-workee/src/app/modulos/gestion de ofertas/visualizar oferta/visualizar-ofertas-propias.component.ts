import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PLATFORM_ID } from '@angular/core';

import { MultiSelect } from 'primeng/multiselect'; // <-- NUEVO

import { OfertaService } from '../../oferta/oferta.service';
import { Oferta } from '../../oferta/oferta';
import { EmpresaService } from '../../empresa/empresa/empresa.service';
import { EstadoOferta } from '../../../admin/ABMEstadoOferta/estado-oferta';
import { Router, RouterModule } from '@angular/router';
import { UsuarioService } from '../../seguridad/usuarios/usuario.service';
import { SesionService } from '../../../interceptors/sesion.service';
import { Empleado } from '../../empresa/empleados/empleado';
import { SpinnerComponent } from '../../../compartidos/spinner/spinner/spinner.component';
import { forkJoin, map } from 'rxjs';

type OpcionEstado = { code: string; name: string };

@Component({
  selector: 'app-visualizar-ofertas-propias',
  standalone: true,
  imports: [CommonModule, FormsModule, MultiSelect, RouterModule, SpinnerComponent], // <-- AGREGA MultiSelect
  templateUrl: './visualizar-ofertas-propias.component.html',
  styleUrl: './visualizar-ofertas-propias.component.css'
})
export class VisualizarOfertasPropiasComponent implements OnInit {

  agregarEtapa() { throw new Error('Method not implemented.'); }

  /** Lista completa traída del backend (de tu empresa) */
  ofertasObtenidas: Oferta[] = [];

  /** Lista que se muestra (filtrada) */
  ofertas: Oferta[] = [];

  pageSize = 6;
  page = 1;
  Math = Math;

  /** buscador de texto */
  textoOferta: string = '';

  /** === Filtro EstadoOferta === */
  filtrosEstadoOferta: OpcionEstado[] = [];               // opciones únicas disponibles
  filtrosSeleccionadosEstadoOferta: string[] = [];        // array de codes (p. ej. ['ABIERTA','CERRADA'])

  idEmpresaObtenida!: number;
  private isBrowser = false; // para SSR-safe sessionStorage

  empleado?: Empleado;

  isLoading: boolean = false;

  constructor(
    private ofertaService: OfertaService,
    private empresaService: EmpresaService,
    private router: Router,
    private usuarioService: UsuarioService,
    private sesionService: SesionService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  get total() { return this.ofertas.length; }
  get totalPages() { return Math.max(1, Math.ceil(this.total / this.pageSize)); }

  get paged(): Oferta[] {
    const start = (this.page - 1) * this.pageSize;
    return this.ofertas.slice(start, start + this.pageSize);
  }

  setPage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    // reflejar página en la URL como en Notificaciones
    this.router.navigate([], { queryParams: { page: this.page }, queryParamsHandling: 'merge' });
  }

  prevPage() { this.setPage(this.page - 1); }
  nextPage() { this.setPage(this.page + 1); }

  ngOnInit(): void {
    this.isLoading = true;

    const qp = this.router.parseUrl(this.router.url).queryParams;
    const p = Number(qp['page']);
    if (!Number.isNaN(p) && p >= 1) this.page = p;

    // restaurar texto/estados si hay (SSR-safe)
    if (this.isBrowser) {
      const txt = sessionStorage.getItem('textoOfertaPropias');
      if (txt) this.textoOferta = JSON.parse(txt);

      const est = sessionStorage.getItem('estadosOfertaSeleccionados');
      if (est) this.filtrosSeleccionadosEstadoOferta = JSON.parse(est);
    }

    // const rol = this.sesionService.getRolActual();
    this.sesionService.rolUsuario$.subscribe(rol => {
      // console.log("hola ", rol)
      if (!rol) {
        console.error("No se pudo obtener el rol del usuario");
        this.isLoading = false;
        return;
      }
  
      if (rol.codigoRol === 'ADMIN_EMPRESA') {
        this.empresaService.getidEmpresabyCorreo()?.subscribe({
          next: (idEmpresa) => this.cargarOfertas(idEmpresa),
          error: (err) => console.error('Error al obtener id de empresa por correo', err)
        });

      } else if (rol.codigoRol === 'EMPLEADO_EMPRESA') {
        console.log("soy empleado empresa");
        this.usuarioService.getUsuario().subscribe({
          next: (usuario) => {
            this.empleado = usuario;
            const idEmpresa = this.empleado?.empresa?.id;
            if (idEmpresa) {
              this.cargarOfertas(idEmpresa);
            } else {
              console.error('No se pudo obtener el id de la empresa del empleado');
            }
          },
          error: (err) => console.error("Error al obtener el usuario logueado", err)
        });

      } else {
        console.warn('Rol no contemplado en VisualizarOfertasPropias:', rol.nombreRol);
      }
    })
  }

  obtenerEstadoActual(oferta: Oferta): EstadoOferta | null {
    if (!oferta.estadosOferta || oferta.estadosOferta.length === 0) {
      return null;
    }

    const estadosOrdenados = [...oferta.estadosOferta].sort((a, b) => {
      const fechaA = new Date(a.fechaHoraAlta || '').getTime();
      const fechaB = new Date(b.fechaHoraAlta || '').getTime();
      return fechaB - fechaA;
    });

    return estadosOrdenados[0].estadoOferta;
  }

  // Se carga el listado de ofertas desde aca, para no repetir codigo
  private cargarOfertas(idEmpresa: number): void {
    if (!idEmpresa) {
      console.error('El id de empresa es inválido');
      return;
    }
    
    this.idEmpresaObtenida = idEmpresa;
    
    this.isLoading = true;
    this.ofertaService.getOfertasPorEmpresa(idEmpresa).subscribe({
      next: (ofertas) => {
        // const requests = ofertas.map((oferta: Oferta) =>
        // this.ofertaService.getPostuladosPorOferta(oferta.id).pipe(
        //   map((cantidad: number) => ({
        //     ...oferta,
        //     cantidadPostulados: cantidad,
        //     estadoNombre: this.getEstadoActual(oferta)?.nombreEstadoOferta ?? '—',
        //   }))

        // this.ofertasObtenidas = ofertas.map(i => ({
        //   ...i,
        //   estadoNombre: this.getEstadoActual(i)?.nombreEstadoOferta ?? '—',
        // }) as any);
        // this.isLoading = false;
        
        // this.cargarOpcionesEstados();
        // this.aplicarFiltro();
        
        // console.log('Ofertas disponibles: ', this.ofertasObtenidas);
    
        const requests = ofertas.map((oferta: Oferta) =>
          this.ofertaService.getCantidadPostuladosPorOferta(oferta.id).pipe(
            map((cantidad: number) => ({
              ...oferta,
              cantidadPostulados: cantidad,
              estadoNombre: this.getEstadoActual(oferta)?.nombreEstadoOferta ?? '—',
            }))
          )
        );

        // ejecutamos todas las requests en paralelo
        forkJoin(requests).subscribe({
          next: (ofertasConPostulados) => {
            this.ofertasObtenidas = ofertasConPostulados;
            this.isLoading = false;

            this.cargarOpcionesEstados();
            this.aplicarFiltro();
          },
          error: (err) => {
            console.error('Error al obtener postulados por oferta', err);
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error al obtener ofertas disponibles', err);
        this.isLoading = false;
      }
    });
  }

  /** Construye el combo de estados a partir del estado vigente de cada oferta */
  private cargarOpcionesEstados(): void {
    const mapa = new Map<string, string>(); // code -> name

    for (const o of this.ofertasObtenidas) {
      const est = this.getEstadoActual(o);
      const code = (est?.codigo ?? '').toUpperCase();
      const name = est?.nombreEstadoOferta ?? '';
      if (code && name && !mapa.has(code)) {
        mapa.set(code, name);
      }
    }

    // opcional: incluir "Sin estado" si hay alguna oferta sin estado vigente
    const haySinEstado = this.ofertasObtenidas.some(o => !this.getEstadoActual(o));
    if (haySinEstado) {
      mapa.set('__NONE__', 'Sin estado');
    }

    this.filtrosEstadoOferta = Array.from(mapa.entries()).map(([code, name]) => ({ code, name }));
  }

  private norm(s: string): string {
    return (s ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  /** === BUSCADOR SOLO TEXTO === */
  buscarPorNombre(texto: string): void {
    this.textoOferta = texto ?? '';
    if (this.isBrowser) {
      sessionStorage.setItem('textoOfertaPropias', JSON.stringify(this.textoOferta));
    }
    this.aplicarFiltro();
  }

  /** Dispara al cambiar selección de estados */
  onEstadosChange(): void {
    if (this.isBrowser) {
      sessionStorage.setItem('estadosOfertaSeleccionados', JSON.stringify(this.filtrosSeleccionadosEstadoOferta));
    }
    this.aplicarFiltro();
  }

  /** Aplica filtros locales: texto + estado vigente */
  private aplicarFiltro(): void {
    const t = this.norm(this.textoOferta);
    const seleccionados = (this.filtrosSeleccionadosEstadoOferta ?? []).map(s => (s ?? '').toUpperCase());

    this.ofertas = this.ofertasObtenidas.filter(o => {
      const coincideTexto = !t || this.norm(o.titulo).includes(t);
      if (!coincideTexto) return false;

      if (!seleccionados.length) return true; // sin filtro de estado

      const vigenteCode = (this.getEstadoActual(o)?.codigo ?? '__NONE__').toUpperCase();
      return seleccionados.includes(vigenteCode);
    });

    if (this.page > this.totalPages) this.setPage(this.totalPages);
    if (this.total === 0) this.page = 1;
  }

  /** ======= utilidades de estado (sin cambios de lógica) ======= */
  getEstadoActual(oferta: Oferta): EstadoOferta | null {
    const lista = (oferta as any).estadosOferta ?? [];
    if (!lista.length) return null;

    const vigente = lista.find((e: any) => !e.fechaHoraBaja);
    if (vigente?.estadoOferta) return vigente.estadoOferta;

    const ordenados = [...lista].sort((a: any, b: any) =>
      new Date(a.fechaHoraAlta ?? 0).getTime() - new Date(b.fechaHoraAlta ?? 0).getTime()
    );
    return ordenados.at(-1)?.estadoOferta ?? null;
  }

  estadoClase(oferta: Oferta): string {
    const cod = (this.getEstadoActual(oferta)?.codigo ?? '').toUpperCase();
    switch (cod) {
      case 'ABIERTA':     return 'is-abierta';
      case 'CERRADA':     return 'is-cerrada';
      case 'FINALIZADA':  return 'is-finalizada';
      default:            return 'is-neutro';
    }
  }

  estadoTexto(oferta: Oferta): string {
    return this.getEstadoActual(oferta)?.nombreEstadoOferta ?? 'Sin estado';
  }

  irADetalle(id: number): void {
    this.router.navigate(['/visualizar-oferta', id]);
  }

  getFechaUltimaActualizacion(oferta: Oferta){
    const estadoVigente = oferta.estadosOferta.find(eo => eo.fechaHoraBaja == null);
    return estadoVigente?.fechaHoraAlta ?? null;
  }
}
