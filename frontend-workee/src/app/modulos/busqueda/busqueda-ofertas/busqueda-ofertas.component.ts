import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MultiSelect } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { FiltroUbicacion } from '../busqueda-empresas/filtro-ubicacion';
import { BusquedaService } from '../busqueda.service';
import { Router } from '@angular/router';
import { TipoContratoService } from '../../../admin/ABMTipoContrato/tipo-contrato.service';
import { TipoContrato } from '../../../admin/ABMTipoContrato/tipo-contrato';
import { Modalidad } from '../../../admin/ABMModalidad/modalidad';
import { ModalidadService } from '../../../admin/ABMModalidad/modalidad.service';
import { Oferta } from '../../oferta/oferta';
import { FormsModule } from '@angular/forms';
import { SpinnerComponent } from "../../../compartidos/spinner/spinner/spinner.component";

@Component({
  selector: 'app-busqueda-ofertas',
  imports: [MultiSelect, CommonModule, FormsModule, SelectModule, SpinnerComponent],
  templateUrl: './busqueda-ofertas.component.html',
  styleUrl: './busqueda-ofertas.component.css'
})
export class BusquedaOfertasComponent implements OnInit {
  isLoading: boolean = false;

  filtrosAplicados = false;

  // Para filtros de ubicacion
  filtrosUbicacion: FiltroUbicacion[] = [];
  filtrosSeleccionadosUbicacion: any[] = [];
  
  // Para filtros de tipo de contrato
  filtrosTipoContrato: TipoContrato[] = [];
  filtrosSeleccionadosTipoContrato: any[] = [];
  
  // Para filtros de modalidad
  filtrosModalidad: Modalidad[] = [];
  filtrosSeleccionadosModalidad: any[] = [];
  
  // Para filtros de fecha
  filtrosFecha: any;
  filtrosSeleccionadosFecha: any;
  
  textoOferta: string = '';
  
  busquedaRealizada: boolean = false; // se agrega esta variable para controlar si se ha realizado una búsqueda

  ofertaList: Oferta[] = [];

  paginaActual: number = 1;
  elementosPorPagina: number = 10;

  constructor(
    private busquedaService: BusquedaService,
    private tipoContratoService: TipoContratoService,
    private modalidadService: ModalidadService,
    private router: Router
  ) {}

  ngOnInit() {
    window.addEventListener('beforeunload', () => {
      sessionStorage.clear();
    });
    
    const listaGuardadaOfertas = sessionStorage.getItem('ofertaList');
    const textoGuardadoOferta = sessionStorage.getItem('textoOferta');
    const filtrosUbicacionGuardados = sessionStorage.getItem('filtrosUbicacionOferta');
    const filtrosModalidadGuardados = sessionStorage.getItem('filtrosModalidadOferta');
    const filtrosTipoContratoGuardados = sessionStorage.getItem('filtrosTipoContratoOferta');
    const filtrosFechaGuardados = sessionStorage.getItem('filtrosFechaOferta');
    
    if (listaGuardadaOfertas) {
      this.ofertaList = JSON.parse(listaGuardadaOfertas);
      console.log(this.ofertaList)
      this.busquedaRealizada = true;
    }

    if (textoGuardadoOferta) {
      this.textoOferta = JSON.parse(textoGuardadoOferta);
    }

    if (filtrosUbicacionGuardados) {
      this.filtrosSeleccionadosUbicacion = JSON.parse(filtrosUbicacionGuardados);
    }

    if (filtrosModalidadGuardados) {
      this.filtrosSeleccionadosModalidad = JSON.parse(filtrosModalidadGuardados);
    }

    if (filtrosTipoContratoGuardados) {
      this.filtrosSeleccionadosTipoContrato = JSON.parse(filtrosTipoContratoGuardados);
    }

    if (filtrosFechaGuardados) {
      this.filtrosSeleccionadosFecha = JSON.parse(filtrosFechaGuardados);
    }

    this.busquedaService.filtroUbicacion().subscribe(data => {
      this.filtrosUbicacion = data;
      this.filtrosUbicacion = this.filtrosUbicacion.map(f => ({
        ...f,
        name: `${f.nombreProvincia}, ${f.nombrePais}`
      }))
    })

    this.tipoContratoService.findAllActivos().subscribe(data => {
      this.filtrosTipoContrato = data;
      this.filtrosTipoContrato = this.filtrosTipoContrato.map(t => ({
        ...t,
        name: `${t.nombreTipoContratoOferta}`
      }))
    })

    this.modalidadService.findAllActivas().subscribe(data => {
      this.filtrosModalidad = data;
      this.filtrosModalidad = this.filtrosModalidad.map(m => ({
        ...m,
        name: `${m.nombreModalidadOferta}`
      }))
    })

    this.filtrosFecha = [
      { name: "En las últimas 24 horas", id: "HORAS_24" },
      { name: "La última semana", id: "DIAS_7" },
      { name: "El último mes", id: "MES_1" },
    ]
  }

  buscarPorNombre(textoOferta: string): void {
    this.isLoading = true;
    this.busquedaRealizada = true;
    this.busquedaService.buscarOfertasPorNombre(textoOferta).subscribe(data => {
      this.ofertaList = data;
      sessionStorage.setItem('textoOferta',JSON.stringify(this.textoOferta));
      sessionStorage.setItem('ofertaList', JSON.stringify(this.ofertaList));
      sessionStorage.setItem('filtrosUbicacionOferta', JSON.stringify(this.filtrosSeleccionadosUbicacion));
      sessionStorage.setItem('filtrosTipoContratoOferta', JSON.stringify(this.filtrosSeleccionadosTipoContrato));
      sessionStorage.setItem('filtrosModalidadOferta', JSON.stringify(this.filtrosSeleccionadosModalidad));
      // sessionStorage.setItem('filtrosFechaOferta', JSON.stringify(this.filtrosSeleccionadosFecha));
      sessionStorage.setItem(
        'filtrosOferta',
        this.filtrosSeleccionadosFecha !== undefined
          ? JSON.stringify(this.filtrosSeleccionadosFecha)
          : 'null'
      );
      this.isLoading = false;
    });
    this.filtrosAplicados = true;
  }
  
  filtrarOfertas() {
    this.isLoading = true;
    const idsProvincias = this.filtrosSeleccionadosUbicacion?.length ? this.filtrosSeleccionadosUbicacion : null;
    const idsTipoContrato = this.filtrosSeleccionadosTipoContrato?.length ? this.filtrosSeleccionadosTipoContrato : null;
    const idsModalidad = this.filtrosSeleccionadosModalidad?.length ? this.filtrosSeleccionadosModalidad : null;
    const fecha = this.filtrosSeleccionadosFecha?.length ? this.filtrosSeleccionadosFecha : null;
    console.log("modalidades: ",idsModalidad);
    console.log("fechas: ",fecha);
    
    this.busquedaRealizada = true;
    this.busquedaService.filtrarOfertas(this.textoOferta, idsProvincias, idsTipoContrato, idsModalidad, fecha).subscribe(data => {
      this.ofertaList = data;
      sessionStorage.setItem('texto',JSON.stringify(this.textoOferta));
      sessionStorage.setItem('ofertaList', JSON.stringify(this.ofertaList));
      sessionStorage.setItem('filtrosUbicacionOferta', JSON.stringify(this.filtrosSeleccionadosUbicacion));
      sessionStorage.setItem('filtrosTipoContratoOferta', JSON.stringify(this.filtrosSeleccionadosTipoContrato));
      sessionStorage.setItem('filtrosModalidadOferta', JSON.stringify(this.filtrosSeleccionadosModalidad));
      // sessionStorage.setItem('filtrosFechaOferta', JSON.stringify(this.filtrosSeleccionadosFecha));
      sessionStorage.setItem(
        'filtrosOferta',
        this.filtrosSeleccionadosFecha !== undefined
          ? JSON.stringify(this.filtrosSeleccionadosFecha)
          : 'null'
      );
      this.isLoading = false;
    })
    this.filtrosAplicados = true;
  }
  
  irADetalle(idOferta: number) {
    this.router.navigate([`buscar-ofertas/detalle`,idOferta]);
  }

  // Para paginacion
  get totalPaginas(): number {
    return Math.ceil(this.ofertaList.length / this.elementosPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  obtenerOfertasPaginadas(): Oferta[] {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    return this.ofertaList.slice(inicio, fin);
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

  limpiarFiltros(): void {
  // Reset de campos de búsqueda y filtros
  this.textoOferta = '';
  this.filtrosSeleccionadosUbicacion = [];
  this.filtrosSeleccionadosTipoContrato = [];
  this.filtrosSeleccionadosModalidad = [];
  this.filtrosSeleccionadosFecha = null;

  // Limpia el sessionStorage
  sessionStorage.removeItem('textoOferta');
  sessionStorage.removeItem('ofertaList');
  sessionStorage.removeItem('filtrosUbicacionOferta');
  sessionStorage.removeItem('filtrosTipoContratoOferta');
  sessionStorage.removeItem('filtrosModalidadOferta');
  sessionStorage.removeItem('filtrosFechaOferta');
  sessionStorage.removeItem('filtrosOferta');

  // Reinicia variables de control
  this.ofertaList = [];
  this.busquedaRealizada = false;
  this.filtrosAplicados = false;
  this.paginaActual = 1;
}

}
