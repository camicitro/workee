import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Empresa } from '../../../../empresa/empresa/empresa';
import { Rubro } from '../../../../../admin/ABMRubro/rubro';
import { AdministradorService } from '../../administrador.service';
import { RubroService } from '../../../../../admin/ABMRubro/rubro.service';
import { ProvinciaService } from '../../../../../admin/ABMProvincia/provincia.service';
import { ActivatedRoute, Router } from '@angular/router';
import { EmpresaService } from '../../../../empresa/empresa/empresa.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-detalle-empresa-pendiente',
  imports: [CommonModule],
  templateUrl: './detalle-empresa-pendiente.component.html',
  styleUrl: './detalle-empresa-pendiente.component.css'
})
export class DetalleEmpresaPendienteComponent implements OnInit{
  empresa: Empresa = {};

  idEmpresa = 0;
    empresaOriginal: Empresa = {
      id: 0,
      nombreEmpresa: '',
      descripcionEmpresa: '',
      numeroIdentificacionFiscal: '',
      telefonoEmpresa: 0,
      emailEmpresa: '',
      direccionEmpresa: '',
      sitioWebEmpresa: '',
      usuario: {
        id: 0,
        correoUsuario: '',
        contraseniaUsuario: '',
        urlFotoUsuario: '',
        fechaHoraAlta: ''
      }
    };
    rubros: Rubro[] = [];
    idProvincia? = 0;
    nombrePais? = '';
  
    constructor(private empresaService: EmpresaService, 
      private rubroService: RubroService, 
      private provinciaService: ProvinciaService, 
      private route: ActivatedRoute,
      private router: Router,
    private administradorService: AdministradorService){
    }

    ngOnInit(): void {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      this.empresaService.findById(id).subscribe({
      next: (data) => {
        this.empresa = data;
        this.empresaOriginal = JSON.parse(JSON.stringify(data));
        this.idProvincia = this.empresa.provincia?.id;
        this.idEmpresa = this.empresa.id ?? 0;

        if (this.empresa.provincia?.id) {
          this.provinciaService.findById(this.empresa.provincia.id).subscribe({
            next: (provincia) => {
              this.nombrePais = provincia.pais?.nombrePais ?? '';
            }
          });
        }
      },
      error: (error) => {
        console.error('Error al obtener empresa', error);
      }
    });
    
    this.rubroService.findAllActivos().subscribe({
      next: (data) => {
        this.rubros = data;
      },
      error: (error) => {
        console.error('Error al obtener rubros', error);
      }
    })
    }


    volver(): void {
      this.router.navigate(['habilitaciones']);
    }

    habilitarEmpresa(): void {
      Swal.fire({
      title: `¿Está seguro de que desea habilitar la empresa ${this.empresa.nombreEmpresa}?`,
      text: "La empresa podrá utilizar Workee.",
      icon: "success",
      iconColor: "#10C036",
      showCancelButton: true,
      confirmButtonColor: "#10C036",
      cancelButtonColor: "#697077",
      confirmButtonText: "Sí, habilitar",
      cancelButtonText: "No, volver",
      reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          this.administradorService.habilitarEmpresa(this.idEmpresa).subscribe({
            next: () => {
              this.volver();
              Swal.fire({
                toast: true,
                position: "top-end",
                icon: "success",
                title: "Empresa habilitada correctamente",
                showConfirmButton: false,
                timer: 3000
              });
            }
          })
        }
      });
  }

  rechazarEmpresa(): void {
    Swal.fire({
      title: `¿Está seguro de que desea rechazar la habilitación de la empresa ${this.empresa.nombreEmpresa}?`,
      text: "Esta acción no se puede deshacer. La empresa no podrá utilizar Workee.",
      icon: "error",
      iconColor: "#FF5252",
      showCancelButton: true,
      confirmButtonColor: "#FF5252",
      cancelButtonColor: "#697077",
      confirmButtonText: "Sí, rechazar",
      cancelButtonText: "No, volver",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.administradorService.rechazarEmpresa(this.idEmpresa).subscribe({
          next: () => {
            this.volver();
            Swal.fire({
              toast: true,
              position: "top-end",
              icon: "success",
              title: "Empresa rechazada correctamente",
              showConfirmButton: false,
              timer: 3000
            });
          }
        })
      }
    });
  }


  mostrarNombreArchivo(enlace: string | undefined): string { 
    if (!enlace) return '';
    try {
      const start = enlace.indexOf('/o/');
      const mid = enlace.indexOf('?', start);
      if (start === -1) return enlace;

      let nombreEnc = enlace.substring(start + 3, mid !== -1 ? mid : enlace.length);
      let nombreDec = decodeURIComponent(nombreEnc);

      const partes = nombreDec.split('/');
      return partes[partes.length - 1];
    } catch {
      return enlace;
    }
  }

}
