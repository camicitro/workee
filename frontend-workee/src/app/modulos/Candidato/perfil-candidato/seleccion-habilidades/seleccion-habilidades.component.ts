import { Component, Input, OnInit } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalService } from '../../../../compartidos/modal/modal.service';
import { HabilidadService } from '../../../../admin/ABMHabilidad/habilidad.service';
import { TipoHabilidadService } from '../../../../admin/ABMTipoHabilidad/tipo-habilidad.service';
import { Habilidad } from '../../../../admin/ABMHabilidad/habilidad';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TipoHabilidad } from '../../../../admin/ABMTipoHabilidad/tipo-habilidad';
import { CandidatoHabilidad } from '../../candidato-habilidad';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  selector: 'app-seleccion-habilidades',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './seleccion-habilidades.component.html',
  styleUrl: './seleccion-habilidades.component.css'
})
export class SeleccionHabilidadesComponent implements OnInit {
  
  habilidadList: Habilidad[] = []; // lista de habilidades filtrada segun la busqueda
  habilidadListOriginal: Habilidad[] = []; // lista de habilidades completa, sin filtrar
  @Input() habilidadesSeleccionadas: CandidatoHabilidad[] = [];
  tipoHabilidadList: TipoHabilidad[] = []; // lista de tipos de habilidad
  
  tipoSeleccionado!: TipoHabilidad;
  modalRef?: NgbModalRef;
  filtro: string = '';
  
  constructor(
    private modalService: ModalService,
    private habilidadService: HabilidadService,
    private tipoHabilidadService: TipoHabilidadService
  ) {}


  ngOnInit(): void {
    // console.log(this.habilidadesSeleccionadas)
    this.habilidadService.findAllActivas().subscribe(habilidades => {
      this.habilidadListOriginal = habilidades;
      this.habilidadList = [...habilidades];

      if (this.tipoSeleccionado) {
        this.habilidadList = this.habilidadListOriginal.filter(h =>
          h.tipoHabilidad?.id === this.tipoSeleccionado.id
        );
      };
    });

    this.tipoHabilidadService.findAllActivos().subscribe(tiposHabilidades => {
      this.tipoHabilidadList = tiposHabilidades;
      this.habilidadesSeleccionadas.forEach(hab => {
        const tipoEncontrado = this.tipoHabilidadList.find(t => t.id === hab.habilidad?.tipoHabilidad?.id);
        if (tipoEncontrado) {
          hab.habilidad!.tipoHabilidad = tipoEncontrado;
        }
      });
      if (tiposHabilidades.length > 0) {
        this.tipoSeleccionado = tiposHabilidades[0];
        this.seleccionarTipo(this.tipoSeleccionado);
      }
    })
  }

  // Buscar habilidades dentro del listado
  buscarHabilidades() {
    const texto = this.filtro.trim().toLowerCase();

    this.habilidadList = this.habilidadListOriginal.filter(h =>
      (!this.tipoSeleccionado || h.tipoHabilidad?.id === this.tipoSeleccionado.id) &&
      (texto === '' || h.nombreHabilidad?.toLowerCase().includes(texto))
    );
  }

  seleccionarTipo(tipo: TipoHabilidad) {
    this.tipoSeleccionado = tipo;
    this.habilidadList = this.habilidadListOriginal.filter(h =>
      h.tipoHabilidad?.id === tipo.id
    );
  }

  estaSeleccionada(hab: Habilidad): boolean {
    return this.habilidadesSeleccionadas.some(h => h.habilidad!.id === hab.id);
  }

  toggleHabilidad(hab: Habilidad) {
    if (this.estaSeleccionada(hab)) {
      this.habilidadesSeleccionadas = this.habilidadesSeleccionadas.filter(
        h => h.habilidad!.id !== hab.id);
    } else { 
      const nuevoCandidatoHabilidad: CandidatoHabilidad = {
        habilidad: hab
      };
      this.habilidadesSeleccionadas.push(nuevoCandidatoHabilidad);
    }
  }

  habilidadesSeleccionadasPorTipo(tipo: TipoHabilidad): CandidatoHabilidad[] {
    // console.log("entre al habilidades selecc por tipo")
    // console.log("resultado de hab seleccionadas por tipo: ",this.habilidadesSeleccionadas.filter(h => h.habilidad!.tipoHabilidad?.id === tipo.id));
    return this.habilidadesSeleccionadas.filter(h => h.habilidad!.tipoHabilidad?.id === tipo.id);
  }

  quitarHabilidad(hab: Habilidad | CandidatoHabilidad) {
    const habId = (hab as any).habilidad ? (hab as CandidatoHabilidad).habilidad!.id : (hab as Habilidad).id;
    
    this.habilidadesSeleccionadas = this.habilidadesSeleccionadas.filter(
      h => h.habilidad!.id !== habId);
  }

  trackByTipo(index: number, tipo: TipoHabilidad): number {
    return tipo.id!;
  }

  trackByHabilidad(index: number, ch: CandidatoHabilidad): number {
    return ch.habilidad!.id!;
  }

  volverAPerfil() {
    Swal.fire({
      title: '¿Desea confirmar los cambios realizados?',
      icon: "question",
      iconColor: "#70DC73",
      showCancelButton: true,
      confirmButtonColor: "#70DC73",
      cancelButtonColor: "#697077",
      confirmButtonText: "Sí, guardar",
      cancelButtonText: "No, volver",
      reverseButtons: true,
      customClass: {
        title: 'titulo-chico',
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const idSeleccionados = this.habilidadesSeleccionadas.map(h => h.habilidad!.id!);
        this.modalService.closeActiveModal(idSeleccionados);
      }
    })
  }

  dismissModal() {
    Swal.fire({
      title: "¿Está seguro de que desea volver?",
      text: "Los cambios realizados no se guardarán",
      icon: "question",
      iconColor: "#31A5DD",
      showCancelButton: true,
      confirmButtonColor: "#31A5DD",
      cancelButtonColor: "#697077",
      confirmButtonText: "Sí, volver",
      cancelButtonText: "No, cerrar",
      reverseButtons: true,
      customClass: {
        title: 'titulo-chico',
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.modalService.dismissActiveModal();
    }});
  }

}
