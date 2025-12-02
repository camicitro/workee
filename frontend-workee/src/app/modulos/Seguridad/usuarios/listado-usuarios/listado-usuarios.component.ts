import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../usuario.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MultiSelect } from 'primeng/multiselect';
import { Router } from '@angular/router';
import { RolService } from '../rol.service';
import { Rol } from '../../rol';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { UsuarioListadoDTO } from './usuario-listado-dto';
import { SesionService } from '../../../../interceptors/sesion.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-listado-usuarios',
  imports: [MultiSelect,CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './listado-usuarios.component.html',
  styleUrl: './listado-usuarios.component.css'
})
export class ListadoUsuariosComponent implements OnInit {
  
  usuarioList: UsuarioListadoDTO[] = [];
  usuarioListOriginal: UsuarioListadoDTO[] = [];

  fotoPerfilDefecto: string = '../../../../../assets/img/foto-perfil.png';
  texto: string = '';

  filtrosRol: Rol[] = [];
  filtrosSeleccionadosRoles: any[] = [];
  
  paginaActual: number = 1;
  elementosPorPagina: number = 10;

  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    private rolService: RolService,
    private sessionService: SesionService
  ) {}
  
  ngOnInit(): void {
    // En esta variable se guarda el correo del usuario que esta logueado
    // Esto se hace para que no aparezca el propio usuario en el listado
    const correoActualUsuario = this.sessionService.getCorreoUsuario();

    this.usuarioService.findAll().subscribe({
      next: data => {
        const usuariosFiltrados: UsuarioListadoDTO[] = [];

        data.forEach(usuario => {
          if (usuario.correoUsuario) {
            this.rolService.buscarRolPorCorreoUsuario(usuario.correoUsuario).subscribe({
              next: rol => {
                if (usuario.correoUsuario !== correoActualUsuario) {
                  if (!usuario.urlFotoUsuario) {
                    usuario.urlFotoUsuario = this.fotoPerfilDefecto;
                  }
                  usuariosFiltrados.push(usuario);
                }

                this.usuarioListOriginal = usuariosFiltrados;
                this.usuarioList = [...usuariosFiltrados];
              },
              error: err => {
                console.error('Error al obtener rol del usuario:', err);
                Swal.fire({
                  icon: 'error',
                  title: 'Error al cargar roles',
                  text: 'No se pudo obtener el rol de uno o más usuarios.',
                  confirmButtonColor: '#FF5252'
                });
              }
            });
          }
        });
      },
      error: err => {
        console.error('Error al obtener usuarios:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error al cargar usuarios',
          text: 'Hubo un problema al obtener la lista de usuarios. Intente nuevamente.',
          confirmButtonColor: '#FF5252'
        });
      }
    });



    this.rolService.findAll().subscribe(data => {
      this.filtrosRol = data;
      this.filtrosRol = this.filtrosRol.map(r => ({
          ...r,
          name: `${r.nombreRol}`
        })
      )
    })
  }

  buscarUsuarios() {
    const textoLimpio = this.texto.trim().toLowerCase();
    
    if (textoLimpio === '') {
      this.usuarioList = [... this.usuarioListOriginal ];
      
      return;
    }

    this.usuarioList = this.usuarioListOriginal.filter(usuario => usuario.correoUsuario?.toLowerCase().includes(textoLimpio))
  }
  
  irADetalle(idUsuario:number) {
    console.log("detalle de usuario: ", idUsuario);
    this.router.navigate([`usuarios/detalle`,idUsuario]);
  }
  
  filtrarUsuarios() {
    if (!this.filtrosSeleccionadosRoles || this.filtrosSeleccionadosRoles.length === 0) {
      this.usuarioList = [...this.usuarioListOriginal];
      return;
    }

    const idsRoles = this.filtrosSeleccionadosRoles;
    const correoActualUsuario = this.sessionService.getCorreoUsuario();

    this.usuarioService.filtrarUsuarios(idsRoles).subscribe({
      next: data => {
        this.usuarioList = data.filter(u => u.correoUsuario !== correoActualUsuario);
      },
      error: err => {
        console.error('Error al filtrar usuarios:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error al aplicar el filtro',
          text: 'No fue posible filtrar los usuarios. Intente más tarde.',
          confirmButtonColor: '#FF5252'
        });
      }
    });
  }

  descargarPDF() {
    const doc = new jsPDF();
    const img = new Image();
    img.src = "assets/logoo.png";

    img.onload = () => {
      doc.addImage(img, 'PNG', 14, 10, 30, 15);

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text('Listado de usuarios del sistema', 105, 30, { align: "center" });

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");

      const usuarioExportador = this.sessionService.getCorreoUsuario() ?? 'Desconocido';
      const fechaExportacion = new Date().toLocaleDateString("es-AR");

      let filtroAplicado = "-";
      if (this.filtrosSeleccionadosRoles.length > 0) {
        const rolesNombres = this.filtrosRol
          .filter(r => this.filtrosSeleccionadosRoles.includes(r.id))
          .map(r => r.nombreRol)
          .join(", ");
        filtroAplicado = rolesNombres;
      }

      doc.text(`Exportado por: ${usuarioExportador}`, 14, 45);
      doc.text(`Fecha de exportación: ${fechaExportacion}`, 14, 52);
      doc.text(`Filtro aplicado: ${filtroAplicado}`, 14, 59);

      autoTable(doc, {
        startY: 70,
        head: [['USUARIO', 'ROL ACTUAL']],
        body: this.usuarioList.map(u => [
          u.correoUsuario ?? '',
          u.rolActualusuario ?? ''
        ]),
        styles: {
          fontSize: 10,
          halign: 'left',
          valign: 'middle'
        },
        headStyles: {
          fillColor: [230, 235, 255],
          textColor: 20,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        }
      });

      doc.save(`usuarios_${fechaExportacion}.pdf`);
    };
  }
  
  // Para paginacion
  get totalPaginas(): number {
    return Math.ceil(this.usuarioList.length / this.elementosPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  obtenerUsuariosPaginados(): UsuarioListadoDTO[] {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    return this.usuarioList.slice(inicio, fin);
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

}
