import { Component, OnInit } from '@angular/core';
import { BusquedaService } from '../busqueda.service';
import { ProvinciaService } from '../../../admin/ABMProvincia/provincia.service';
import { PaisService } from '../../../admin/ABMPais/pais.service';
import { HabilidadService } from '../../../admin/ABMHabilidad/habilidad.service';
import { Candidato } from '../../candidato/candidato';
import { MultiSelect } from 'primeng/multiselect';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Habilidad } from '../../../admin/ABMHabilidad/habilidad';
import { EstadoBusquedaLaboral } from '../../../admin/ABMEstadoBusquedaLaboral/estado-busqueda-laboral';
import { Pais } from '../../../admin/ABMPais/pais';
import { Provincia } from '../../../admin/ABMProvincia/provincia';
import { EstadoBusquedaLaboralService } from '../../../admin/ABMEstadoBusquedaLaboral/estado-busqueda-laboral.service';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { SpinnerComponent } from "../../../compartidos/spinner/spinner/spinner.component";

@Component({
  selector: 'app-busqueda-candidatos',
  imports: [MultiSelect, CommonModule, FormsModule, ReactiveFormsModule, SpinnerComponent],
  templateUrl: './busqueda-candidatos.component.html',
  styleUrl: './busqueda-candidatos.component.css'
})
export class BusquedaCandidatosComponent implements OnInit {
  
  filtrosAplicados = false;

  candidatoList: Candidato[] = [];
  textoCandidato: string = '';

  busquedaRealizada: boolean = false;

  filtrosHabilidad: Habilidad[] = [];
  filtrosEstado: EstadoBusquedaLaboral[] = [];
  filtrosPais: Pais[] = [];
  filtrosProvincia: Provincia[] = [];

  filtrosSeleccionadosHabilidad: any[] = [];
  filtrosSeleccionadosEstado: any[] = [];
  filtrosSeleccionadosPais: any[] = [];
  filtrosSeleccionadosProvincia: any[] = [];

  paginaActual: number = 1;
  elementosPorPagina: number = 10;

  isLoading: boolean = false;

  habilidadesRandomMap: { [id: number]: any[] } = {};

  constructor(
    private busquedaService: BusquedaService,
    private habilidadService: HabilidadService,
    private estadoService: EstadoBusquedaLaboralService,
    private provinciaService: ProvinciaService,
    private paisService: PaisService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    window.addEventListener('beforeunload', () => {
      sessionStorage.clear();
    });

    const listaGuardadaCandidato = sessionStorage.getItem('candidatoList');
    const textoGuardadoCandidato = sessionStorage.getItem('textoCandidato');
    const filtrosHabilidadGuardados = sessionStorage.getItem('filtrosHabilidad');
    const filtrosEstadoGuardados = sessionStorage.getItem('filtrosEstado');
    const filtrosPaisGuardados = sessionStorage.getItem('filtrosPais');
    const filtrosProvinciaGuardados = sessionStorage.getItem('filtrosProvincia');

    if (listaGuardadaCandidato) {
      this.candidatoList = JSON.parse(listaGuardadaCandidato);
      console.log(this.candidatoList)
      this.busquedaRealizada = true;
    }

    if (textoGuardadoCandidato) {
      this.textoCandidato = JSON.parse(textoGuardadoCandidato);
    }

    if (filtrosHabilidadGuardados) {
      this.filtrosSeleccionadosHabilidad = JSON.parse(filtrosHabilidadGuardados);
    }

    if (filtrosEstadoGuardados) {
      this.filtrosSeleccionadosEstado = JSON.parse(filtrosEstadoGuardados);
    }

    if (filtrosPaisGuardados) {
      this.filtrosSeleccionadosPais = JSON.parse(filtrosPaisGuardados);
    }

    if (filtrosProvinciaGuardados) {
      this.filtrosSeleccionadosProvincia = JSON.parse(filtrosProvinciaGuardados);
    }

    this.habilidadService.findAllActivas().subscribe(data => {
      this.filtrosHabilidad = data;
      this.filtrosHabilidad = this.filtrosHabilidad.map(h => ({
        ...h,
        name: `${h.nombreHabilidad}`
      })
      )
    })
    
    this.estadoService.findAllActivos().subscribe(data => {
      this.filtrosEstado = data;
      this.filtrosEstado = this.filtrosEstado.map(e => ({
        ...e,
        name: `${e.nombreEstadoBusqueda}`
      })
      )
    })
    
    this.paisService.findAllActivos().subscribe(data => {
      this.filtrosPais = data;
      this.filtrosPais = this.filtrosPais.map(pa => ({
        ...pa,
        name: `${pa.nombrePais}`
      })
      )
    })
    
  }

  buscarPorNombre(textoCandidato: string): void {
    this.busquedaRealizada = true;
    this.isLoading = true;
    this.busquedaService.buscarCandidatosPorNombre(textoCandidato).subscribe(data => {
      this.candidatoList = data;
      sessionStorage.setItem('textoCandidato',JSON.stringify(this.textoCandidato));
      sessionStorage.setItem('candidatoList', JSON.stringify(this.candidatoList));
      sessionStorage.setItem('filtrosHabilidad', JSON.stringify(this.filtrosSeleccionadosHabilidad));
      sessionStorage.setItem('filtrosEstado', JSON.stringify(this.filtrosSeleccionadosEstado));
      sessionStorage.setItem('filtrosPais', JSON.stringify(this.filtrosSeleccionadosPais));
      sessionStorage.setItem('filtrosProvincia', JSON.stringify(this.filtrosSeleccionadosProvincia));
      this.isLoading = false;
    });
    this.filtrosAplicados = true;
  }

  filtrarCandidatos() {
    this.isLoading = true;
    const idsHabilidades = this.filtrosSeleccionadosHabilidad?.length ? this.filtrosSeleccionadosHabilidad : null;
    const idsPaises = this.filtrosSeleccionadosPais?.length ? this.filtrosSeleccionadosPais : null;
    const idsProvincias = this.filtrosSeleccionadosProvincia?.length ? this.filtrosSeleccionadosProvincia : null;
    const idsEstadosDeBusqueda = this.filtrosSeleccionadosEstado?.length ? this.filtrosSeleccionadosEstado : null;
    console.log("paises:", idsPaises);
    console.log("estados", idsEstadosDeBusqueda);
    console.log("habilidades", idsHabilidades);
    this.busquedaRealizada = true;
    this.busquedaService.filtrarCandidatos(this.textoCandidato, idsProvincias, idsPaises, idsHabilidades, idsEstadosDeBusqueda).subscribe(data => {
      this.candidatoList = data;
      sessionStorage.setItem('textoCandidato',JSON.stringify(this.textoCandidato));
      sessionStorage.setItem('candidatoList', JSON.stringify(this.candidatoList));
      sessionStorage.setItem('filtrosHabilidad', JSON.stringify(this.filtrosSeleccionadosHabilidad));
      sessionStorage.setItem('filtrosEstado', JSON.stringify(this.filtrosSeleccionadosEstado));
      sessionStorage.setItem('filtrosPais', JSON.stringify(this.filtrosSeleccionadosPais));
      sessionStorage.setItem('filtrosProvincia', JSON.stringify(this.filtrosSeleccionadosProvincia));
      this.isLoading = false;
      console.log("este es el listado de candidatos que recibo del backend: ", data)
    })
    this.filtrosAplicados = true;
  }

  onCambiarPais(): void {
    this.filtrosProvincia = [];

    if (this.filtrosSeleccionadosPais?.length) {
      console.log(this.filtrosSeleccionadosPais)
      const observables = this.filtrosSeleccionadosPais.map((idPais: number) =>
        this.provinciaService.getProvinciasPorPais(idPais)
      );

      // con forkjoin, se espera que se devuelvan todas las llamadas
      forkJoin(observables).subscribe((provinciasPorPaisArray: Provincia[][]) => {
        const todasProvincias = provinciasPorPaisArray.flat();

        const provinciasUnicas = todasProvincias.filter(
          (provincia, index, self) =>
            index === self.findIndex(p => p.id === provincia.id)
        );

        this.filtrosProvincia = provinciasUnicas.map(p => ({
          ...p,
          name: p.nombreProvincia
        }));
      });
    }
  }
  
  irADetalle(idCandidato: number) {
    this.router.navigate([`buscar-candidatos/detalle`,idCandidato]);
  }

  // Para mostrar las 10 habilidades random del candidato
  obtenerHabilidadesAleatorias(candidato: any): any[] {
    if (this.habilidadesRandomMap[candidato.id]) {
      return this.habilidadesRandomMap[candidato.id];
    }

    const copia = [...candidato.habilidades];
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }

    this.habilidadesRandomMap[candidato.id] = copia.slice(0, 10);
    return this.habilidadesRandomMap[candidato.id];
  }

  // Para paginacion
  get totalPaginas(): number {
    return Math.ceil(this.candidatoList.length / this.elementosPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  obtenerCandidatosPaginados(): Candidato[] {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    return this.candidatoList.slice(inicio, fin);
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
    this.filtrosSeleccionadosHabilidad = [];
    this.filtrosSeleccionadosEstado = [];
    this.filtrosSeleccionadosPais = [];
    this.filtrosSeleccionadosProvincia = [];
    this.textoCandidato = '';
    this.candidatoList = [];
    this.busquedaRealizada = false;
    this.filtrosAplicados = false;

    // Limpiar el sessionStorage
    sessionStorage.removeItem('textoCandidato');
    sessionStorage.removeItem('candidatoList');
    sessionStorage.removeItem('filtrosHabilidad');
    sessionStorage.removeItem('filtrosEstado');
    sessionStorage.removeItem('filtrosPais');
    sessionStorage.removeItem('filtrosProvincia');
  }

}
