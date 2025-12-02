import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EstadisticasEmpresaDTO } from '../metricas-empresa.model';
import { Chart, ChartType } from 'chart.js';
import { FiltroFechasDTO } from '../../filtro-fechas-metricas.model';
import { MetricasEmpresaService } from '../metricas-empresa.service';
import { SesionService } from '../../../../interceptors/sesion.service';
import Swal from 'sweetalert2';
import { UsuarioService } from '../../../seguridad/usuarios/usuario.service';
import { Empresa } from '../../../empresa/empresa/empresa';
import { Empleado } from '../../../empresa/empleados/empleado';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { filter, take } from 'rxjs';

@Component({
  selector: 'app-metricas-empresa',
  imports: [CommonModule, FormsModule],
  templateUrl: './metricas-empresa.component.html',
  styleUrl: './metricas-empresa.component.css'
})
export class MetricasEmpresaComponent {
  @ViewChild('chartGeneros') chartGeneros!: ElementRef;
  @ViewChild('chartPaises') chartPaises!: ElementRef;
 
  metricas!: EstadisticasEmpresaDTO;

  stackedGeneros: Chart | null = null;
  stackedPaises: Chart | null = null;

  cargando: boolean = false;

  empresa: Empresa | null = null;
  empleado: Empleado | null = null;

  idEmpresa!: number;

  hayDatosGeneros: boolean = false;
  hayDatosPaises: boolean = false;
  hayDatosCantidadOfertasAbiertas: boolean = false;
  hayDatosTasaAbandono: boolean = false;
  hayDatosTiempoContratacion: boolean = false;

  filtro: FiltroFechasDTO = { fechaDesde: null, fechaHasta: null };

  constructor(private metricasEmpresaService: MetricasEmpresaService,
    private sessionService: SesionService, private usuarioService: UsuarioService) {}

    codigoCategoriaRol: String = '';

    ngOnInit(): void {
      this.sessionService.cargarCategoriaUsuario();
        this.sessionService.categoria$
          .pipe(
            filter((cat) => !!cat), // espero a que exista
            take(1)
          )
          .subscribe((cat: any) => {
            this.codigoCategoriaRol = (cat?.nombreCategoriaRol ?? cat?.nombreCategoriaRol ?? '').toString().toUpperCase();
            if (!this.codigoCategoriaRol) {
              this.cargando = false;
              Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo determinar la categoria del rol del usuario' });
              return;
            }
          console.log('Categoría del rol del usuario:', this.codigoCategoriaRol);

            // Determinar el idEmpresa según el rol
            if (this.codigoCategoriaRol === 'EMPRESA') {
              this.usuarioService.getUsuario().subscribe({
                next: (data) => {
                  this.empresa = data;
                  this.idEmpresa = this.empresa.id!;
                  this.aplicarFiltro();
                },
                error: (error) => {
                  this.cargando = false;
                  console.error('Error al obtener la empresa', error);
                }
              });
            } else if (this.codigoCategoriaRol === 'EMPLEADO') {
              this.usuarioService.getUsuario().subscribe({
                next: (data) => {
                  this.empleado = data;
                  this.idEmpresa = this.empleado?.empresa?.id ?? 0;
                  this.aplicarFiltro();
                },
                error: (error) => {
                  this.cargando = false;
                  console.error('Error al obtener la empresa del empleado', error);
                }
              }); 
            } else {
              this.cargando = false;
              Swal.fire({ icon: 'error', title: 'Acceso no permitido', text: 'Este rol no tiene métricas de empresa' });
              return;
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
          if (!this.idEmpresa) {
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
          
          this.metricasEmpresaService.traerEstadisticas(this.idEmpresa , body).subscribe({
            next: (response) => {
              this.metricas = response;
              console.log('Métricas recibidas:', this.metricas);
              
              this.hayDatosCantidadOfertasAbiertas = response.cantidadOfertasAbiertas != null;
              this.hayDatosTasaAbandono = response.tasaAbandono != null;
              this.hayDatosGeneros = response.distribucionGeneros.postulaciones.length > 0;
              this.hayDatosPaises = response.distribucionPostulacionesPorPais.postulaciones.length > 0;
              this.hayDatosTiempoContratacion = response.tiempoPromedioContratacion != null;
              
    
              setTimeout(() => {
                this.cargarGraficoGeneros(response.distribucionGeneros.postulaciones);
                this.cargarGraficoPaises(response.distribucionPostulacionesPorPais.postulaciones);
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

      cargarGraficoGeneros(generos: any[]): void {
        if (this.stackedGeneros) this.stackedGeneros.destroy();
        const ctx = this.chartGeneros.nativeElement.getContext('2d');

        this.stackedGeneros = new Chart(ctx, {
          type: 'pie' as ChartType,
          data: {
            labels: generos.map(g => g.nombreGenero),
            datasets: [{
              label: 'Postulaciones',
              data: generos.map(g => g.porcentajePostulaciones),
              backgroundColor: ['#6F9CF4', '#F49F6F', '#6FF4C5', '#F46FF1', '#F4E76F']              
            }]
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

      

      cargarGraficoPaises(paises: any[]): void {
        if (this.stackedPaises) this.stackedPaises.destroy();
        const ctx = this.chartPaises.nativeElement.getContext('2d');

        this.stackedPaises = new Chart(ctx, {
          type: 'bar' as ChartType,
          data: {
            labels: paises.map(p => p.nombrePais),
            datasets: [{
              label: "Cantidad de postulaciones",
              data: paises.map(p => p.cantidad),
              backgroundColor: '#b2f870ff'
            }]
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
        Swal.fire({ title: 'Generando PDF...', text: 'Por favor espere unos segundos', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        const dataElement = document.querySelector('.dashboard') as HTMLElement;
        if (!dataElement) return;

        const hoy = new Date();
        // const fechaHasta = this.filtro.fechaHasta ? new Date(this.filtro.fechaHasta) : hoy;
        // const fechaDesde = this.filtro.fechaDesde ? new Date(this.filtro.fechaDesde) : new Date(hoy.getFullYear(), hoy.getMonth() - 1, hoy.getDate());

        const fechaHasta = this.filtro.fechaHasta 
        ? this.crearFechaLocal(this.filtro.fechaHasta)
        : hoy;

        const fechaDesde = this.filtro.fechaDesde
        ? this.crearFechaLocal(this.filtro.fechaDesde)
        : new Date(hoy.getFullYear(), hoy.getMonth() - 1, hoy.getDate());

        const fechaDesdeTexto = this.formatearFecha(fechaDesde.toISOString());
        const fechaHastaTexto = this.formatearFecha(fechaHasta.toISOString());

        const usuarioExportador = this.sessionService.getCorreoUsuario() ?? 'Desconocido';
        const fechaExportacion = new Date().toLocaleDateString("es-AR");

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const headerBottom = 70;

        const img = new Image();
        img.src = 'assets/logoo.png';

        img.onload = () => {
          pdf.addImage(img, 'PNG', margin, 10, 30, 15);
          pdf.setFontSize(16);
          pdf.text('Estadísticas de la Empresa', pageWidth / 2, 28, { align: 'center' });
          pdf.setFontSize(11);
          pdf.setFont("helvetica", "normal");
          pdf.text(`Exportado por: ${usuarioExportador}`, margin, 42);
          pdf.text(`Fecha de exportación: ${fechaExportacion}`, margin, 49);
          pdf.text(`Filtro aplicado: desde ${fechaDesdeTexto} hasta ${fechaHastaTexto}`, margin, 56);

          html2canvas(dataElement, { scale: 2 }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = pageWidth - margin * 2;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', margin, headerBottom, imgWidth, imgHeight);
            pdf.save(`metricas_empresa_${fechaExportacion}.pdf`);
            Swal.close();
            Swal.fire({ icon: 'success', title: 'PDF generado correctamente', showConfirmButton: false, timer: 1500 });
          }).catch(() => Swal.fire({ icon: 'error', title: 'Error', text: 'Ocurrió un problema al crear el archivo' }));
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
