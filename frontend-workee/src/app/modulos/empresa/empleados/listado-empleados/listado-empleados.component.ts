import { Component, OnInit } from '@angular/core';
import { EmpleadoService } from '../empleado.service';
import { Empleado } from '../empleado';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EmpresaService } from '../../empresa/empresa.service';

@Component({
  selector: 'app-listado-empleados',
  imports: [CommonModule],
  templateUrl: './listado-empleados.component.html',
  styleUrl: './listado-empleados.component.css'
})
export class ListadoEmpleadosComponent implements OnInit {

  idEmpresaObtenida: number = 0;

  cantEmpleadosActivos!: number;
  empleadoList: Empleado[] = [];
  paginaActual: number = 1;
  elementosPorPagina: number = 8;
  
  constructor(
    private empleadoService: EmpleadoService,
    private router: Router,
    private empresaService: EmpresaService,
  ) {}

  ngOnInit(): void {

    if (this.empresaService) {
      console.log('entra a empresa service')
      this.empresaService.getidEmpresabyCorreo()?.subscribe({
          next: (idEmpresa) => {
            if (idEmpresa !== undefined && idEmpresa !== null) {
              this.idEmpresaObtenida = idEmpresa;
              console.log('id empresa obtenido: ', idEmpresa)
              this.empleadoService.findAll(this.idEmpresaObtenida).subscribe({
                next: (empleados) => {
                  this.empleadoList = empleados; 
                  console.log(this.empleadoList);
                },
                error: (err) => {
                  console.error('Error al obtener empleados', err);
                }
              });
              this.empleadoService.cantidadActivos(this.idEmpresaObtenida).subscribe(cantidad => {
                this.cantEmpleadosActivos = cantidad;
              })
            } else {
              console.error('El id de empresa obtenido es undefined o null');
            }
          },
          error: (err) => {
            console.error('Error al obtener id de empresa por correo', err);
          }
      });
    }
  }

  crearEmpleado(): void {
    this.router.navigate([`empleados/crear`]);
  }
  
  visualizarEmpleado(idEmpleado: number) {
    // this.empleadoService.setId(idEmpleado);
    this.router.navigate([`empleados/perfil`,idEmpleado]);
  }

  // Para paginacion
  get totalPaginas(): number {
    return Math.ceil(this.empleadoList.length / this.elementosPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  obtenerEmpleadosPaginados(): Empleado[] {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    // console.log(inicio);
    const fin = inicio + this.elementosPorPagina;
    // console.log(fin);
    // console.log(this.empleadoList.slice(inicio, fin));
    return this.empleadoList.slice(inicio, fin);
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

  irAPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  esHabilitado(empleado: Empleado): boolean {
    return empleado.fechaHoraBaja === null; 
  }
}
