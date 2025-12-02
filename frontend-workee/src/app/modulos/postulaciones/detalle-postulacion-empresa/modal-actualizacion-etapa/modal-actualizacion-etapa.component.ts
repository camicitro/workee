import { Component, Input, OnInit } from '@angular/core';
import { ModalService } from '../../../../compartidos/modal/modal.service';
import { PostulacionSimplificadaDTO } from '../../postulacion-simplificada-dto';
import { PostulacionOfertaEtapa } from '../../postulacion-oferta-etapa';
import { PostulacionService } from '../../postulacion.service';
import { OfertaService } from '../../../oferta/oferta.service';
import { OfertaEtapa } from '../../../oferta/oferta-etapa';
import Swal from 'sweetalert2';
import { CandidatoService } from '../../../candidato/candidato.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-actualizacion-etapa',
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-actualizacion-etapa.component.html',
  styleUrl: './modal-actualizacion-etapa.component.css'
})
export class ModalActualizacionEtapaComponent implements OnInit {
  
  @Input() idPostulacion!: number;
  @Input() idOferta!: number;
  @Input() etapaActual!: PostulacionOfertaEtapa;

  nombreCandidato?: string;
  nombreOferta?: string;

  etapasOferta: OfertaEtapa[] = [];
  etapasPosibles: OfertaEtapa[] = [];
  etapaSeleccionada?: OfertaEtapa;
  retroalimentacion: string = '';

  
  constructor(
    private modalService: ModalService,
    public activeModal: NgbActiveModal,
    private postulacionService: PostulacionService,
    private ofertaService: OfertaService,
    private candidatoService: CandidatoService,
  ) {}

  ngOnInit() {
    this.traerInfo();
  }

  traerInfo() {
    this.ofertaService.getOferta(this.idOferta).subscribe({
      next: (oferta) => {
        this.nombreOferta = oferta.titulo;
        this.etapasOferta = oferta.ofertaEtapas;
        // this.filtrarEtapasPosibles();

        const ofertaEtapaActual = this.findOfertaEtapaActual(this.etapasOferta, this.etapaActual);

        if (ofertaEtapaActual) {
          const numeroActual = (ofertaEtapaActual.numeroEtapa ?? ofertaEtapaActual.numeroEtapa ?? 0);
          this.etapasPosibles = this.etapasOferta.filter(oe => (oe.numeroEtapa ?? 0) > numeroActual);
        } else {
          console.warn('No se encontró OfertaEtapa correspondiente. Se muestran todas las etapas como fallback.');
          this.etapasPosibles = this.etapasOferta;
        }
      },
      error: () => {
        Swal.fire({
          title:'Error', 
          text:'No se pudieron cargar las etapas', 
          icon:'error'
        });
      }
    });

    this.postulacionService.getPostulacion(this.idPostulacion).subscribe({
      next: (detalle) => {
        this.candidatoService.findById(detalle.idCandidato).subscribe(candidatoData => {
          this.nombreCandidato = `${candidatoData.nombreCandidato} ${candidatoData.apellidoCandidato}`
        });
        
        
      },
      error: () => console.warn('No se pudo cargar el candidato')
    });
  }

  // filtrarEtapasPosibles() {
  //   this.etapasPosibles = this.etapasOferta.filter(
  //     e => e.numeroEtapa > this.etapaActual.etapa.
  //   );
  // }

  dismissModal() {
    this.modalService.dismissActiveModal();
  }

  guardarCambios(etapaSeleccionada: OfertaEtapa) {
    if (!etapaSeleccionada) return;

    if (etapaSeleccionada.etapa.codigoEtapa === 'SELECCIONADO') {
      Swal.fire({
        title: '¿Desea seguir seleccionando candidatos o finalizar la oferta?',
        icon: 'question',
        iconColor: '#31A5DD',
        text: 'Si finaliza la oferta no podrá seguir seleccionando candidatos y a quienes no fueron seleccionados se les notificará.',
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: 'Seguir seleccionando',
        cancelButtonText: 'Finalizar oferta',
        denyButtonText: 'Volver',
        confirmButtonColor: '#31A5DD',
        cancelButtonColor: '#31A5DD',
        denyButtonColor: '#697077',
        reverseButtons: true,
        focusDeny: true,
      }).then((result) => {
        if (result.isConfirmed) {
          this.postulacionService.seleccionarCandidato(this.idPostulacion, false, this.retroalimentacion).subscribe({
            next: () => {
              Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'El candidato fue seleccionado correctamente',
                timer: 3000,
                showConfirmButton: false,
              });
              this.activeModal.close('etapaActualizada');
            },
            error: () => Swal.fire('Error', 'No se pudo actualizar la etapa del candidato.', 'error'),
          });
        } else if (result.isDismissed && result.dismiss === Swal.DismissReason.cancel) {
          this.postulacionService.seleccionarCandidato(this.idPostulacion, true, this.retroalimentacion).subscribe({
            next: () => {
              Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'La oferta fue finalizada y se notificó a los candidatos restantes',
                timer: 3000,
                showConfirmButton: false,
              });
              this.activeModal.close('etapaActualizada');
            },
            error: () => Swal.fire('Error', 'No se pudo finalizar la oferta.', 'error'),
          });
        }
      });
    } else {

      const nombreEtapa = etapaSeleccionada.etapa.nombreEtapa || 'la nueva etapa';
      Swal.fire({
        title: `¿Está seguro de actualizar la etapa del candidato a "${nombreEtapa}"?`,
        text: 'Esta acción no puede revertirse.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, actualizar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#31A5DD',
        cancelButtonColor: '#697077',
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          this.postulacionService.actualizarEtapa(
            this.idPostulacion,
            this.etapaActual.etapa.codigoEtapa!,
            etapaSeleccionada.etapa.codigoEtapa!,
            this.retroalimentacion
          ).subscribe({
            next: () => {
              Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'La etapa del candidato fue actualizada correctamente',
                timer: 3000,
                showConfirmButton: false,
              });
              this.activeModal.close('etapaActualizada');
            },
            error: () => Swal.fire('Error', 'No se pudo actualizar la etapa del candidato.', 'error'),
          });
        }
      });
    }
  }


  private findOfertaEtapaActual(ofertaEtapas: OfertaEtapa[], postulacionEtapa?: PostulacionOfertaEtapa): OfertaEtapa | undefined {
    if (!postulacionEtapa || !postulacionEtapa.etapa) return undefined;

    const idEtapaPost = postulacionEtapa.etapa.id;
    const codigoPost = (postulacionEtapa.etapa.codigoEtapa || '').toString().toLowerCase();
    const nombrePost = (postulacionEtapa.etapa.nombreEtapa || '').toString().toLowerCase();

    let found = ofertaEtapas.find(oe => oe.etapa && oe.etapa.id === idEtapaPost);
    if (found) return found;

    if (codigoPost) {
      found = ofertaEtapas.find(oe => (oe.etapa?.codigoEtapa || '').toLowerCase() === codigoPost);
      if (found) return found;
    }

    if (nombrePost) {
      found = ofertaEtapas.find(oe => (oe.etapa?.nombreEtapa || '').toLowerCase() === nombrePost);
      if (found) return found;
    }

    return undefined;
  }

  requiereRetroalimentacionInvalida(): boolean {
    const codigo = this.etapaSeleccionada?.etapa?.codigoEtapa;
    const requiereRetro = codigo === 'SELECCIONADO' || codigo === 'RECHAZADO';
    return requiereRetro && (!this.retroalimentacion || this.retroalimentacion.trim() === '');
  }

  seleccionarEtapa(etapa: OfertaEtapa) {
    this.etapaSeleccionada = etapa;
    this.retroalimentacion = '';
  }

}
