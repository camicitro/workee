import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import Chart, { ChartType } from 'chart.js/auto';
import { MetricasAdminService } from '../metricas-admin.service';
import { FiltroFechasDTO } from '../../filtro-fechas-metricas.model';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Swal from 'sweetalert2';
import { SesionService } from '../../../../interceptors/sesion.service';
   import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-metricas-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './metricas-admin.component.html',
  styleUrl: './metricas-admin.component.css'
})
export class MetricasAdminComponent implements OnInit{
    @ViewChild('chartRoles') chartRoles!: ElementRef;
    @ViewChild('chartPaises') chartPaises!: ElementRef;
    @ViewChild('chartEmpresas') chartEmpresas!: ElementRef;
    @ViewChild('chartEvolucion') chartEvolucion!: ElementRef;

    cantidadHistoricaUsuarios!: number;
    tasaExitoOfertas!: number;

    stackedRoles: Chart | null = null;
    stackedPaises: Chart | null = null;
    stackedEmpresas: Chart | null = null;
    stackedEvolucion: Chart | null = null;

    cargando: boolean = false;
    
    hayDatosCantidadUsuarios: boolean = true;
    hayDatosTasaExito: boolean = true;
    hayDatosRoles: boolean = true;
    hayDatosPaises: boolean = true;
    hayDatosEmpresas: boolean = true;
    hayDatosEvolucionRegistro: boolean = true;

    constructor(private metricasAdminService: MetricasAdminService, private sessionService: SesionService) {}

    filtro: FiltroFechasDTO = {
      fechaDesde: null,
      fechaHasta: null
    };

    ngOnInit(): void {
      this.aplicarFiltro();
    }

    aplicarFiltro() {
      if (!this.filtro.fechaDesde || this.filtro.fechaDesde === '') this.filtro.fechaDesde = null;
      if (!this.filtro.fechaHasta || this.filtro.fechaHasta === '') this.filtro.fechaHasta = null;

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
      this.cargando = true;

      const body = {
        fechaDesde: filtro.fechaDesde && filtro.fechaDesde !== '' ? filtro.fechaDesde + 'T00:00:00' : null,
        fechaHasta: filtro.fechaHasta && filtro.fechaHasta !== '' ? filtro.fechaHasta + 'T23:59:59' : null
      };

      this.metricasAdminService.traerEstadisticas(body)
        .pipe(
          finalize(() => {
            this.cargando = false;
          })
        )
        .subscribe({
          next: (response) => {
            try {
              console.log('[MetricasAdmin] response:', response); 

              this.hayDatosCantidadUsuarios = (response.cantidadUsuariosPorPais?.length ?? 0) > 0;
              this.hayDatosTasaExito = (response.tasaExitoOfertas != null);
              this.hayDatosRoles = (response.distribucionUsuariosPorRol?.distribucion?.length ?? 0) > 0;
              this.hayDatosPaises = (response.cantidadUsuariosPorPais?.length ?? 0) > 0;
              this.hayDatosEmpresas = (response.empresasConMasOfertas?.length ?? 0) > 0;
              this.hayDatosEvolucionRegistro = (response.evolucionUsuariosRegistrados?.length ?? 0) > 0;

              if (!response || Object.keys(response).length === 0) {
                Swal.fire({
                  icon: 'info',
                  title: 'Sin datos disponibles',
                  text: 'No se encontraron métricas para el rango de fechas seleccionado.',
                  confirmButtonColor: '#a9ada9ff'
                });
                return;
              }

              this.cantidadHistoricaUsuarios = response.cantidadHistoricaUsuarios;
              this.tasaExitoOfertas = response.tasaExitoOfertas;

              setTimeout(() => {
                try {
                  if (this.hayDatosRoles) {
                    this.cargarGraficoRoles(response.distribucionUsuariosPorRol.distribucion);
                  }

                  if (this.hayDatosPaises) {
                    this.cargarGraficoPaises(response.cantidadUsuariosPorPais);
                  }

                  if (this.hayDatosEmpresas) {
                    this.cargarGraficoEmpresas(response.empresasConMasOfertas);
                  }

                  if (this.hayDatosEvolucionRegistro) {
                    let evolucion = response.evolucionUsuariosRegistrados || [];

                    // Filtramos datos inválidos
                    evolucion = evolucion.filter(e =>
                      e && e.fecha && !isNaN(new Date(e.fecha).getTime())
                    );

                      // Si hay demasiados puntos, reducimos a los últimos 3000
                      const MAX_PUNTOS = 3000;
                      if (evolucion.length > MAX_PUNTOS) {
                        console.warn(`[MetricasAdmin] Demasiados puntos (${evolucion.length}). Mostrando los últimos ${MAX_PUNTOS}.`);
                        evolucion = evolucion.slice(-MAX_PUNTOS);

                        Swal.fire({
                          icon: 'info',
                          title: 'Rango muy amplio',
                          text: `Se muestran solo los últimos ${MAX_PUNTOS} días para evitar sobrecarga visual.`,
                          confirmButtonColor: '#a9ada9ff'
                        });
                      }

                      this.cargarGraficoEvolucion(evolucion);
                  }
                } catch (innerErr) {
                  console.error('[MetricasAdmin] error creando gráficos:', innerErr);
                  Swal.fire({
                    icon: 'error',
                    title: 'Error al renderizar métricas',
                    text: 'Ocurrió un problema al mostrar los gráficos. Reintente con un rango más pequeño.'
                  });
                }
              }, 100);

            } catch (err) {
              console.error('[MetricasAdmin] error procesando response:', err);
              Swal.fire({
                icon: 'error',
                title: 'Error al procesar métricas',
                text: 'Ocurrió un problema al procesar la respuesta del servidor.'
              });
            }
          },
          error: (err) => {
            console.error('[MetricasAdmin] request error:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error al obtener métricas',
              text: 'Ocurrió un problema al recuperar las estadísticas. Intente nuevamente más tarde.',
            });
          }
        });
    }


    cargarGraficoRoles(distribucion: any[]) {
      if (this.stackedRoles) this.stackedRoles.destroy();
      const ctx = this.chartRoles.nativeElement.getContext('2d');

      this.stackedRoles = new Chart(ctx, {
        type: 'pie' as ChartType,
        data: {
          labels: distribucion.map(d => d.nombreRol),
          datasets: [
            {
              data: distribucion.map(d => d.cantidadUsuarios),
              backgroundColor: ['#7086FD', '#6DD194', '#FFDE63', '#F96666', '#07DBFA'],
            },
          ],
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

    cargarGraficoPaises(paises: any[]) {
      if (this.stackedPaises) this.stackedPaises.destroy();
      const ctx = this.chartPaises.nativeElement.getContext('2d');

      this.stackedPaises = new Chart(ctx, {
        type: 'bar' as ChartType,
        data: {
          labels: paises.map(p => p.nombrePais),
          datasets: [
            {
              label: 'Usuarios',
              data: paises.map(p => p.cantidadUsuarios),
              backgroundColor: '#F5A962',
            },
          ],
        },
        options: { 
          indexAxis: 'y',
          plugins: {
            legend: {
                  position: 'bottom'
                }
          }
        }, 
      });
    }

    cargarGraficoEmpresas(empresas: any[]) {
      if (this.stackedEmpresas) this.stackedEmpresas.destroy();
      const ctx = this.chartEmpresas.nativeElement.getContext('2d');

      this.stackedEmpresas = new Chart(ctx, {
        type: 'bar' as ChartType,
        data: {
          labels: empresas.map(e => e.nombreEmpresa),
          datasets: [
            {
              label: 'Ofertas publicadas',
              data: empresas.map(e => e.cantidadOfertas),
              backgroundColor: '#FF8080',
            },
          ],
        },
        options: { 
          plugins: {
            legend: {
                  position: 'bottom'
                }
          }
        },
      });
    }

    cargarGraficoEvolucion(evolucion: any[]) {
      if (this.stackedEvolucion) this.stackedEvolucion.destroy();
      const ctx = this.chartEvolucion.nativeElement.getContext('2d');

      this.stackedEvolucion = new Chart(ctx, {
        type: 'line' as ChartType,
        data: {
          labels: evolucion.map(e => e.fecha),
          datasets: [
            {
              label: 'Usuarios registrados',
              data: evolucion.map(e => e.cantidad),
              borderColor: '#986D8E',
              fill: false,
            },
          ],
        },
        options: { 
          plugins: {
            legend: {
                  position: 'bottom'
                }
          }
        },
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
      console.log("fechaDesdeTexto", fechaDesdeTexto);
      const fechaHastaTexto = this.formatearFecha(fechaHasta.toISOString());
      console.log("fechaHastaTexto", fechaHastaTexto);
      
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
          pdf.text('Estadísticas del Sistema', pageWidth / 2, 28, { align: 'center' });
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
                pdf.save(`metricas_sistema_${fechaExportacion}.pdf`);
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

              //pdf.addImage(imgData, 'PNG', 10, y, imgWidth, imgHeight);
              //pdf.save(`metricas_sistema_${fechaExportacion}.pdf`);
    
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
        img.src = ''; 
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
