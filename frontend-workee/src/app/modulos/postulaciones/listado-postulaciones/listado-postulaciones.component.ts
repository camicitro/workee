import { Component, OnInit } from '@angular/core';
import { Candidato } from '../../candidato/candidato';
import { UsuarioService } from '../../seguridad/usuarios/usuario.service';
import { MultiSelect } from 'primeng/multiselect';
import { PostulacionService } from '../postulacion.service';
import { PostulacionSimplificadaDTO } from '../postulacion-simplificada-dto';
import { SpinnerComponent } from '../../../compartidos/spinner/spinner/spinner.component';
import { CommonModule } from '@angular/common';
import { OfertaService } from '../../oferta/oferta.service';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

type OpcionEtapa = { code: string; name: string };

@Component({
  selector: 'app-listado-postulaciones',
  imports: [CommonModule, MultiSelect, SpinnerComponent, FormsModule],
  templateUrl: './listado-postulaciones.component.html',
  styleUrl: './listado-postulaciones.component.css'
})
export class ListadoPostulacionesComponent implements OnInit {
  
  candidato?: Candidato;
  idCandidato!: number;

  postulaciones: any[] = [];
  postulacionesFiltradas: any[] = [];
  
  paginaActual: number = 1;
  elementosPorPagina: number = 10;

  pageSize = 9;
  page = 1;
  Math = Math;

  isLoading: boolean = false;
  
  filtrosEtapas: OpcionEtapa[] = [];
  filtrosSeleccionadosEtapas: string[] = [];

  constructor(
    private usuarioService: UsuarioService,
    private postulacionService: PostulacionService,
    private ofertaService: OfertaService,
    private router: Router
  ) {}

  ngOnInit() {
    const qp = this.router.parseUrl(this.router.url).queryParams;
    const p = Number(qp['page']);
    if (!Number.isNaN(p) && p >= 1) this.page = p;

    this.usuarioService.getUsuario().subscribe(data => {
      this.candidato = data;
      this.idCandidato = this.candidato.id!;
      this.postulacionService.getPostulaciones(this.idCandidato).subscribe(post => {
        const requests = post.map((p: any) => this.ofertaService.getOferta(p.idOferta));
        
        forkJoin(requests).subscribe(ofertas => {
          this.postulaciones = post.map((p: any, index: number) => {
            const oferta = ofertas[index];
            const etapaActual = p.etapas.find((e: any) => e.fechaHoraBaja === null);
            return {
              ...p,
              idPostulacionOferta: p.idPostulacionOferta,
              oferta,
              etapaActual: etapaActual
            };
          });

          this.postulacionesFiltradas = [ ...this.postulaciones ];
          this.isLoading = false;
          this.cargarOpcionesEtapas();
          console.log("Postulaciones enriquecidas:", this.postulaciones);
          
          if (this.page > this.totalPages) this.setPage(this.totalPages);
          if (this.total === 0) this.page = 1;
        });
      });
    });
  }
 
  get total() { return this.postulacionesFiltradas.length; }
  get totalPages() { return Math.max(1, Math.ceil(this.total / this.pageSize)); }

  get paged() {
    const start = (this.page - 1) * this.pageSize;
    return this.postulacionesFiltradas.slice(start, start + this.pageSize);
  }

  setPage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    // (opcional) reflejar en la URL
    this.router.navigate([], { queryParams: { page: this.page }, queryParamsHandling: 'merge' });
  }
  prevPage() { this.setPage(this.page - 1); }
  nextPage() { this.setPage(this.page + 1); }


  verDetalle(idPostulacion: number) {
    // console.log("quiero entrar a la postulacion con id", idPostulacion);
    this.router.navigate([`postulaciones/detalle`,idPostulacion])
  }

  cargarOpcionesEtapas(): void {
    const mapa = new Map<string, string>();

    for (const p of this.postulaciones) {
      const code = p.etapaActual?.etapa?.codigoEtapa ?? '';
      const name = p.etapaActual?.etapa?.nombreEtapa ?? '';

      if (code && name && !mapa.has(code)) {
        mapa.set(code, name);
      }
    }

    this.filtrosEtapas = Array.from(mapa.entries()).map(([code, name]) => ({ code, name }));
  }

  buscarPostulaciones() {
    this.postulacionesFiltradas = this.postulaciones.filter(p => {
      const codeEtapa = p.etapaActual?.etapa?.codigoEtapa ?? '';
      const coincideEtapa =
        this.filtrosSeleccionadosEtapas.length === 0 ||
        this.filtrosSeleccionadosEtapas.includes(codeEtapa);
      return coincideEtapa;
    });

    if (this.page > this.totalPages) this.setPage(this.totalPages);
    if (this.total === 0) this.page = 1;
  }
  
  onEtapasChange() {
    this.buscarPostulaciones();
  }


  // Para paginacion
  get totalPaginas(): number {
    return Math.ceil(this.postulaciones.length / this.elementosPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  obtenerPostPaginadas(): PostulacionSimplificadaDTO[] {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    return this.postulaciones.slice(inicio, fin);
  }

  avanzarPagina(): void {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
    }
  }
  
  retrocederPagina(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }
  
  get paginasMostradas(): (number | string)[] {
    const total = this.totalPaginas;
    const actual = this.paginaActual;
    const paginas: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        paginas.push(i);
      }
    } else {
      paginas.push(1);

      if (actual > 3) {
        paginas.push('...');
      }

      const start = Math.max(2, actual - 1);
      const end = Math.min(total - 1, actual + 1);

      for (let i = start; i <= end; i++) {
        paginas.push(i);
      }

      if (actual < total - 2) {
        paginas.push('...');
      }

      paginas.push(total);
    }

    return paginas;
  }

  irAPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  getColorClasePorEtapa(codigoEtapa: string | undefined): string {
    if (!codigoEtapa) return 'badge-entrevista'; 

    switch (codigoEtapa.toUpperCase()) {
      case 'SELECCIONADO':
        return 'badge-seleccionado';
      case 'PENDIENTE':
        return 'badge-pendiente';
      case 'RECHAZADO':
        return 'badge-rechazado';
      case 'NO_ACEPTADO':
        return 'badge-no-aceptado';
      case 'ABANDONADO':
        return 'badge-abandonado';
      default:
        // Etapas intermedias
        return 'badge-entrevista';
    }
  }
}
