import { Component, OnInit } from '@angular/core';
import { BusquedaService } from '../busqueda.service';
import { FiltroUbicacion } from './filtro-ubicacion';
import { Empresa } from '../../empresa/empresa/empresa';
import { MultiSelect } from 'primeng/multiselect';
import { CommonModule } from '@angular/common';
import { RubroService } from '../../../admin/ABMRubro/rubro.service';
import { Rubro } from '../../../admin/ABMRubro/rubro';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BusquedaEmpresa } from './busqueda-empresa';
import { SelectModule } from 'primeng/select';
import { SpinnerComponent } from "../../../compartidos/spinner/spinner/spinner.component";

@Component({
  selector: 'app-busqueda-empresas',
  imports: [MultiSelect, CommonModule, FormsModule, ReactiveFormsModule, SelectModule, SpinnerComponent],
  templateUrl: './busqueda-empresas.component.html',
  styleUrl: './busqueda-empresas.component.css'
})
export class BusquedaEmpresasComponent implements OnInit{
  isLoading: boolean = false;
  filtrosAplicados = false;
  

  filtrosUbicacion: FiltroUbicacion[] = [];
  filtrosRubro: Rubro[] = [];
  filtrosOferta: any;
  empresaList: BusquedaEmpresa[] = [];

  textoEmpresa: string = '';

  paginaActual: number = 1;
  elementosPorPagina: number = 10;

  filtrosSeleccionadosUbicacion: any[] = [];
  filtrosSeleccionadosRubros: any[] = [];
  filtrosSeleccionadosOfertas: any;
  busquedaRealizada: boolean = false; // se agrega esta variable para controlar si se ha realizado una búsqueda

  constructor(
    private busquedaService: BusquedaService,
    private rubroService: RubroService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    window.addEventListener('beforeunload', () => {
      sessionStorage.clear();
    });
    
    const listaGuardadaEmpresa = sessionStorage.getItem('empresaList');
    const textoGuardadoEmpresa = sessionStorage.getItem('textoEmpresa');
    const filtrosUbicacionGuardados = sessionStorage.getItem('filtrosUbicacionEmpresa');
    const filtrosRubroGuardados = sessionStorage.getItem('filtrosRubroEmpresa');
    const filtrosOfertaGuardados = sessionStorage.getItem('filtrosOfertaEmpresa');
    
    if (listaGuardadaEmpresa) {
      this.empresaList = JSON.parse(listaGuardadaEmpresa);
      console.log(this.empresaList)
      this.busquedaRealizada = true;
    }

    if (textoGuardadoEmpresa) {
      this.textoEmpresa = JSON.parse(textoGuardadoEmpresa);
    }

    if (filtrosUbicacionGuardados) {
      this.filtrosSeleccionadosUbicacion = JSON.parse(filtrosUbicacionGuardados);
    }

    if (filtrosRubroGuardados) {
      this.filtrosSeleccionadosRubros = JSON.parse(filtrosRubroGuardados);
    }

    if (filtrosOfertaGuardados) {
      this.filtrosSeleccionadosOfertas = JSON.parse(filtrosOfertaGuardados);
    }

    this.busquedaService.filtroUbicacion().subscribe(data => {
      this.filtrosUbicacion = data;
      this.filtrosUbicacion = this.filtrosUbicacion.map(f => ({
        ...f,
        name: `${f.nombreProvincia}, ${f.nombrePais}`
      })
      )
    })

    this.rubroService.findAllActivos().subscribe(data => {
      this.filtrosRubro = data;
      this.filtrosRubro = this.filtrosRubro.map(r => ({
        ...r,
        name: `${r.nombreRubro}`
      })
    )
    })

    this.filtrosOferta = [
      { name: "Sí", value: true },
      { name: "No", value: false }
    ];

  }

  buscarPorNombre(textoEmpresa: string): void {
    this.isLoading = true;
    this.busquedaRealizada = true;
    this.busquedaService.buscarEmpresasPorNombre(textoEmpresa).subscribe(data => {
      this.empresaList = data;
      console.log("empresas que coinciden con el texto ", textoEmpresa, ": ", this.empresaList);
      sessionStorage.setItem('textoEmpresa',JSON.stringify(this.textoEmpresa));
      sessionStorage.setItem('empresaList', JSON.stringify(this.empresaList));
      sessionStorage.setItem('filtrosUbicacionEmpresa', JSON.stringify(this.filtrosSeleccionadosUbicacion));
      sessionStorage.setItem('filtrosRubroEmpresa', JSON.stringify(this.filtrosSeleccionadosRubros));
      // sessionStorage.setItem('filtrosOfertaEmpresa', JSON.stringify(this.filtrosSeleccionadosOfertas));
      sessionStorage.setItem(
        'filtrosOferta',
        this.filtrosSeleccionadosOfertas !== undefined
          ? JSON.stringify(this.filtrosSeleccionadosOfertas)
          : 'null'
      );
      this.isLoading = false;
    });
    this.filtrosAplicados = true;
  }
  
  filtrarEmpresas() {
    this.isLoading = true;
    const idsProvincias = this.filtrosSeleccionadosUbicacion?.length ? this.filtrosSeleccionadosUbicacion : null;
    const idsRubros = this.filtrosSeleccionadosRubros?.length ? this.filtrosSeleccionadosRubros : null;
    const tieneOfertasAbiertas = this.filtrosSeleccionadosOfertas ?? null;
    console.log("provincias: ", idsProvincias)
    console.log("rubros: ", idsRubros)
    console.log("ofertas: ", tieneOfertasAbiertas)
    this.busquedaRealizada = true;
    this.busquedaService.filtrarEmpresas(this.textoEmpresa, idsRubros, idsProvincias, tieneOfertasAbiertas).subscribe(data => {
      this.empresaList = data;
      sessionStorage.setItem('textoEmpresa',JSON.stringify(this.textoEmpresa));
      sessionStorage.setItem('empresaList', JSON.stringify(this.empresaList));
      sessionStorage.setItem('filtrosUbicacionEmpresa', JSON.stringify(this.filtrosSeleccionadosUbicacion));
      sessionStorage.setItem('filtrosRubroEmpresa', JSON.stringify(this.filtrosSeleccionadosRubros));
      // sessionStorage.setItem('filtrosOfertaEmpresa', JSON.stringify(this.filtrosSeleccionadosOfertas));
      sessionStorage.setItem(
        'filtrosOferta',
        this.filtrosSeleccionadosOfertas !== undefined
          ? JSON.stringify(this.filtrosSeleccionadosOfertas)
          : 'null'
      );
      this.isLoading = false;
    })
    this.filtrosAplicados = true;
  }

  irADetalle(idEmpresa: number) {
    this.router.navigate([`buscar-empresas/detalle`,idEmpresa]);
  }

  // esta funcion se usa para evaluar si tiene filtros seleccionados en el listado, para habilitar el boton de aplicar filtros
  tieneFiltrosActivos(): boolean {
  return this.filtrosSeleccionadosUbicacion.length > 0
      || this.filtrosSeleccionadosRubros.length > 0
      || this.filtrosSeleccionadosOfertas !== null && this.filtrosSeleccionadosOfertas !== undefined;
  }

  // Para paginacion
  get totalPaginas(): number {
    return Math.ceil(this.empresaList.length / this.elementosPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  obtenerEmpresasPaginadas(): BusquedaEmpresa[] {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    return this.empresaList.slice(inicio, fin);
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
    // Resetea los filtros y texto
    this.textoEmpresa = '';
    this.filtrosSeleccionadosUbicacion = [];
    this.filtrosSeleccionadosRubros = [];
    this.filtrosSeleccionadosOfertas = null;

    this.filtrosAplicados = false;

    // Limpia el sessionStorage
    sessionStorage.removeItem('textoEmpresa');
    sessionStorage.removeItem('empresaList');
    sessionStorage.removeItem('filtrosUbicacionEmpresa');
    sessionStorage.removeItem('filtrosRubroEmpresa');
    sessionStorage.removeItem('filtrosOfertaEmpresa');
    sessionStorage.removeItem('filtrosOferta');

    // Limpia la lista y reinicia variables
    this.empresaList = [];
    this.busquedaRealizada = false;
    this.paginaActual = 1;

  }

}
