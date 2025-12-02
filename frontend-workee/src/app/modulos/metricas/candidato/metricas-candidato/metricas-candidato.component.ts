import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Chart, ChartType } from 'chart.js';
import { MetricasCandidatoService } from '../metricas-candidato.service';
import { SesionService } from '../../../../interceptors/sesion.service';
import { FiltroFechasDTO } from '../../filtro-fechas-metricas.model';
import Swal from 'sweetalert2';
import { EstadisticasCandidatoDTO } from '../metricas-candidato.model';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Candidato } from '../../../candidato/candidato';
import { UsuarioService } from '../../../seguridad/usuarios/usuario.service';

@Component({
  selector: 'app-metricas-candidato',
  imports: [CommonModule, FormsModule],
  templateUrl: './metricas-candidato.component.html',
  styleUrl: './metricas-candidato.component.css'
})
export class MetricasCandidatoComponent {
    @ViewChild('chartRubros') chartRubros!: ElementRef;
    @ViewChild('chartPaises') chartPaises!: ElementRef;

    cantidadPostulacionesEnCurso!: number;
    cantidadPostulacionesRechazadas!: number;
    
    metricas!: EstadisticasCandidatoDTO;

    stackedRubros: Chart | null = null;
    stackedPaises: Chart | null = null;

    cargando: boolean = false;

    candidato: Candidato = {};
    
    hayDatosRubros: boolean = true;
    hayDatosPaises: boolean = true;
    hayDatosCantidadPostulacionesEnCurso: boolean = true;
    hayDatosCantidadPostulacionesRechazadas: boolean = true;
    hayDatosHabilidadesBlandas: boolean = true;
    hayDatosHabilidadesTecnicas: boolean = true;

    constructor(private metricasCandidatoService: MetricasCandidatoService, 
      private sessionService: SesionService, private usuarioService: UsuarioService
    ) {}

    filtro: FiltroFechasDTO = {
      fechaDesde: null,
      fechaHasta: null
    };

    ngOnInit(): void {
      this.cargando = true;
      this.usuarioService.getUsuario().subscribe({
          next: (data) => {
            this.candidato = data;
            this.aplicarFiltro();
          },
          error: (error) => {
            this.cargando = false;
            console.error('Error al obtener candidato', error);
          }
      });
    }


    aplicarFiltro() {
      const fechaDesde = this.filtro.fechaDesde ? new Date(this.filtro.fechaDesde) : null;
      const fechaHasta = this.filtro.fechaHasta ? new Date(this.filtro.fechaHasta) : null;
      const hoy = new Date();

      if (fechaDesde) fechaDesde.setHours(0, 0, 0, 0);
      if (fechaHasta) fechaHasta.setHours(0, 0, 0, 0);
      hoy.setHours(0, 0, 0, 0);

      if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
        Swal.fire({
          icon: 'error',
          title: 'Rango de fechas inválido',
          text: 'La fecha "Desde" no puede ser mayor que la fecha "Hasta".'
        });
        return;
      }

      if (fechaDesde && !fechaHasta && fechaDesde > hoy) {
        Swal.fire({
          icon: 'error',
          title: 'Fecha inválida',
          text: 'La fecha "Desde" no puede ser mayor a la fecha actual.'
        });
        return;
      }
      
        this.cargarDatos(this.filtro);
    }


    cargarDatos(filtro: FiltroFechasDTO) {
      const candidatoId = this.candidato.id;
      if (!candidatoId) {
        this.cargando = false;
        Swal.fire({
            icon: 'error',
            title: 'Error al obtener métricas',
            text: 'Ocurrió un problema al recuperar las estadísticas. Intente nuevamente más tarde.',
          });
        return;
      }


      this.cargando = true;
      
      const body = {
        fechaDesde: filtro.fechaDesde ? filtro.fechaDesde + 'T00:00:00' : null,
        fechaHasta: filtro.fechaHasta ? filtro.fechaHasta + 'T23:59:59' : null
      };
      
      this.metricasCandidatoService.traerEstadisticas(candidatoId , body).subscribe({
        next: (response) => {
          this.metricas = response;
          
          this.hayDatosCantidadPostulacionesRechazadas = response.cantidadPostulacionesRechazadas != null;
          this.hayDatosCantidadPostulacionesEnCurso = response.cantidadPostulacionesEnCurso != null;
          this.hayDatosHabilidadesBlandas = response.topHabilidadesBlandas.length > 0;
          this.hayDatosHabilidadesTecnicas = response.topHabilidadesTecnicas.length > 0;
          this.hayDatosPaises = response.paisesMasPostulados.postulaciones.length > 0;
          this.hayDatosRubros = response.rubrosDeInteres.length > 0;

          setTimeout(() => {
            this.cargarGraficoRubros(response.rubrosDeInteres);
            this.cargarGraficoPaises(response.paisesMasPostulados.postulaciones);
          }, 200);

          this.cargando = false;
        },
        error: (err) => {
          console.error(err);
          this.cargando = false;

          Swal.fire({
            icon: 'error',
            title: 'Error al obtener métricas',
            text: 'Ocurrió un problema al recuperar las estadísticas. Intente nuevamente más tarde.',
          });
        },
      });
    }

    cargarGraficoRubros(rubros: any[]): void {
      if (this.stackedRubros) this.stackedRubros.destroy();
      const ctx = this.chartRubros.nativeElement.getContext('2d');

      this.stackedRubros = new Chart(ctx, {
        type: 'bar' as ChartType,
        data: {
          labels: rubros.slice(0, 5).map(r => r.nombreRubro),
          datasets: [{
            label: 'Postulaciones',
            data: rubros.slice(0, 5).map(r => r.cantidadPostulaciones),
            backgroundColor: '#986D8E',
          }],
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false },
        
        },
          
        }
      });
    }

    cargarGraficoPaises(paises: any[]): void {
      if (this.stackedPaises) this.stackedPaises.destroy();
      const ctx = this.chartPaises.nativeElement.getContext('2d');

      this.stackedPaises = new Chart(ctx, {
        type: 'pie' as ChartType,
        data: {
          labels: paises.map(p => p.nombrePais),
          datasets: [{
            label: 'Postulaciones',
            data: paises.map(p => p.porcentajePostulaciones),
            backgroundColor: ['#6F9CF4', '#F49F6F', '#6FF4C5', '#F46FF1', '#F4E76F'],
          }],
        },
        options: { 
            responsive: true,
            plugins: {
              tooltip: {
                callbacks: {
                  label: function(context: any) {
                    let value = context.parsed;
                    return `${value.toFixed(2)}%`;
                  }
                }
              },
              legend: {
                position: 'bottom'
              }
            },
            
           }
      });
    }

    

    descargarPDF() {
      Swal.fire({
        title: 'Generando PDF...',
        text: 'Por favor espere unos segundos',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      const dataElement = document.querySelector('.dashboard') as HTMLElement;
      if (!dataElement) return;

      // Preparar texto de filtros
      const hoy = new Date();
      // const fechaHasta = this.filtro.fechaHasta ? new Date(this.filtro.fechaHasta) : hoy;
      // const fechaDesde = this.filtro.fechaDesde
      //   ? new Date(this.filtro.fechaDesde)
      //   : new Date(hoy.getFullYear(), hoy.getMonth() - 1, hoy.getDate());

      const fechaHasta = this.filtro.fechaHasta 
      ? this.crearFechaLocal(this.filtro.fechaHasta)
      : hoy;

      const fechaDesde = this.filtro.fechaDesde
      ? this.crearFechaLocal(this.filtro.fechaDesde)
      : new Date(hoy.getFullYear(), hoy.getMonth() - 1, hoy.getDate());

      const fechaDesdeTexto = this.formatearFecha(fechaDesde.toISOString());
      const fechaHastaTexto = this.formatearFecha(fechaHasta.toISOString());
      
      //Datos del exportador
      const usuarioExportador = this.sessionService.getCorreoUsuario() ?? 'Desconocido';
      const fechaExportacion = new Date().toLocaleDateString("es-AR");


      // Crear PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const headerBottom = 70;

      //Logo workee
      const img = new Image();
      img.src = 'assets/logoo.png';

      img.onload = () => {
          pdf.addImage(img, 'PNG', margin, 10, 30, 15);
    
          
          // Título principal
          pdf.setFontSize(16);
          pdf.text('Estadísticas del Candiadto', pageWidth / 2, 28, { align: 'center' });
          //y += 10;
    
          // Filtros e informacion
          pdf.setFontSize(11);
          pdf.setFont("helvetica", "normal");
          pdf.text(`Exportado por: ${usuarioExportador}`, margin, 42);
          pdf.text(`Fecha de exportación: ${fechaExportacion}`, margin, 49);
          pdf.text(`Filtro aplicado: desde ${fechaDesdeTexto} hasta ${fechaHastaTexto}`, margin, 56);
          //y += 10;
    
          // Capturar el dashboard como imagen
          html2canvas(dataElement, { scale: 2 })
            .then((canvas) => {
              const imgData = canvas.toDataURL('image/png');
              const imgWidth = pageWidth - margin * 2;//pageWidth - 20;
              const imgHeight = (canvas.height * imgWidth) / canvas.width;

              if (imgHeight <= (pageHeight - headerBottom - margin)) {
                pdf.addImage(imgData, 'PNG', margin, headerBottom, imgWidth, imgHeight);
                pdf.save(`metricas_candidato_${fechaExportacion}.pdf`);
                Swal.close();
                Swal.fire({
                  icon: 'success',
                  title: 'PDF generado correctamente',
                  showConfirmButton: false,
                  timer: 1500
                });
                return;
              }
              
              // ----- Si es más alto que una página: paginado -----
              // Calculamos cuántos píxeles del canvas caben por página
              const availablePageHeightMm = pageHeight - headerBottom - margin; // mm
              const ratio = availablePageHeightMm / imgHeight; // fracción que cabe en mm
              const pageCanvasHeightPx = Math.floor(canvas.height * ratio); // px por página

              let renderedPages = 0;
              let remainingPx = canvas.height;

              while (remainingPx > 0) {
                // canvas por página
                const pageCanvas = document.createElement('canvas');
                pageCanvas.width = canvas.width;
                const sliceHeight = Math.min(pageCanvasHeightPx, remainingPx);
                pageCanvas.height = sliceHeight;

                const ctx = pageCanvas.getContext('2d')!;
                // dibujamos la porción correspondiente del canvas original
                ctx.drawImage(
                  canvas,
                  0, renderedPages * pageCanvasHeightPx, // sx, sy
                  canvas.width, sliceHeight,            // sWidth, sHeight
                  0, 0,                                  // dx, dy
                  canvas.width, sliceHeight              // dWidth, dHeight
                );
                const pageData = pageCanvas.toDataURL('image/png');
                const pageImgHeightMm = (sliceHeight * imgWidth) / canvas.width; // mm height en PDF

                if (renderedPages > 0) pdf.addPage();
                const yPos = (renderedPages === 0) ? headerBottom : margin;
                pdf.addImage(pageData, 'PNG', margin, yPos, imgWidth, pageImgHeightMm);

                renderedPages++;
                remainingPx -= sliceHeight;
              }
    
              // Esperar un poco antes de mostrar éxito
              setTimeout(() => {
                Swal.fire({
                  icon: 'success',
                  title: 'PDF generado correctamente',
                  showConfirmButton: false,
                  timer: 1500
                });
              }, 300); // 🔹 este retardo garantiza que se vea el "loading"
            })
            .catch(() => {
              Swal.fire({
                icon: 'error',
                title: 'Error al generar PDF',
                text: 'Ocurrió un problema al crear el archivo. Intente nuevamente.'
              });
            });
      }
      img.onerror = () => {
        // En caso de fallar la carga del logo, igual intentamos continuar sin logo
        console.warn('No se pudo cargar logo, se continúa sin logo');
        // Podrías repetir la misma lógica anterior (o llamar a una función que haga lo mismo sin logo).
        // Para simplicidad, llamo recursivamente con un logo invisible (evitar loops infinitos).
        img.src = ''; // forza onload? Si preferís, manejar separado.
      };
    }

    private crearFechaLocal(fechaStr: string): Date {
      const [year, month, day] = fechaStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    }


    private formatearFecha(fecha: string | null): string {
      if (!fecha) return '';
      const date = new Date(fecha);
      const dia = date.getDate().toString().padStart(2, '0');
      const mes = (date.getMonth() + 1).toString().padStart(2, '0');
      const anio = date.getFullYear();
      return `${dia}/${mes}/${anio}`;
    }

    limpiarFiltros() {
      this.filtro.fechaDesde = null;
      this.filtro.fechaHasta = null;
      this.aplicarFiltro(); 
    }
}
