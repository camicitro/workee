import { Component, OnInit } from '@angular/core';
import { CandidatoService } from '../../../candidato/candidato.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Candidato } from '../../../candidato/candidato';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { OfertaService } from '../../../oferta/oferta.service';
import { Oferta } from '../../../oferta/oferta';
import { PostulacionService } from '../../../postulaciones/postulacion.service';
import { SesionService } from '../../../../interceptors/sesion.service';
import { Empleado } from '../../../empresa/empleados/empleado';
import { UsuarioService } from '../../../seguridad/usuarios/usuario.service';
import { EmpresaService } from '../../../empresa/empresa/empresa.service';

@Component({
  selector: 'app-detalle-candidato',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './detalle-candidato.component.html',
  styleUrl: './detalle-candidato.component.css'
})
export class DetalleCandidatoComponent implements OnInit {
  candidato: Candidato = {};
  edadCandidato: number = 0;
  dropdownAbierto: boolean = false;
  // ofertas: Oferta[] = []

  empleado!: Empleado;
  idEmpresaObtenida!: number;
  esEmpleado: boolean = false;

  idEmpresa!: number;

  origen: any | null;
  idOfertaOrigen: any | null;
  
  // ARRAY USADO PARA MOSTRAR LAS OFERTAS QUE SE PUEDEN ENVIAR AL CANDIDATO
  ofertas: Oferta[] =[];

  constructor(
    private candidatoService: CandidatoService,
    private route: ActivatedRoute,
    private router: Router,
    private ofertaService: OfertaService,
    private postulacionService: PostulacionService,
    private sesionService: SesionService,
    private usuarioService: UsuarioService,
    private empresaService: EmpresaService,
  ) {}
  
  ngOnInit(): void {
    
    this.sesionService.rolUsuario$.subscribe(rol => {
      const id = Number(this.route.snapshot.paramMap.get('idCandidato'));
      if (rol) {
        // console.log("rol recibido: ", rol);
        // USAMOS LA CATEGORIA ACA?
        if (rol.codigoRol === 'EMPLEADO_EMPRESA') {
          this.esEmpleado = true;
          this.usuarioService.getUsuario().subscribe({
            next: (data) => {
              this.empleado = data;
              this.idEmpresaObtenida = this.empleado.empresa!.id!;
              console.log('id de empresa obtenido desde usuarioService: ', this.idEmpresa);
            },
            error: (err) => {
              console.error('Error al obtener el empleado desde usuarioService', err)}
          });

        } else {
          this.esEmpleado = false;
          this.empresaService.getidEmpresabyCorreo()?.subscribe({
            next: (idEmpresa) => {
              if (idEmpresa !== undefined && idEmpresa !== null) {
                this.idEmpresaObtenida = idEmpresa;
                console.log('id empresa obtenido desde el perfil : ', idEmpresa);
              }
            },
            error: (err) => {
              console.error('Error al obtener id de empresa por correo', err)}
          });
        }
      this.candidatoService.findById(id).subscribe(data => {
        this.candidato = data;
        console.log("candidato que traje: ", this.candidato);
        this.edadCandidato = this.calcularEdad(this.candidato.fechaDeNacimiento!);
        //VER!!!!! getOfertasAbiertasPorEmpresaParaEnviar
        // this.ofertaService.getOfertasAbiertasPorEmpresa(this.idEmpresaObtenida).subscribe(data => {
        //   console.log(data)
        //   this.ofertas = data;
        // })
        this.ofertaService.getOfertasAbiertasPorEmpresaParaEnviar(this.idEmpresaObtenida, this.candidato.id!).subscribe({
          next: (data) => {
            this.ofertas = data;
            console.log("Ofertasss " + this.ofertas)
          },
          error: (err) => {
            console.error("Error al obtener las ofertas disponibles:", err);
          }
        });
      })
      }
    });

    this.route.queryParams.subscribe(params => {
      this.origen = params['from'] || null;
      this.idOfertaOrigen = params['idOferta'] ? Number(params['idOferta']) : undefined;
    })
    
    this.dropdownAbierto = false;
  }

  volverAListado() {
    if (this.origen === 'ofertaPropiaPendiente' && this.idOfertaOrigen) {
      this.router.navigate([`visualizar-oferta`, this.idOfertaOrigen], 
        { queryParams: { tab: 'pendientes' } }
      );
    } else if (this.origen === 'ofertaPropiaEnviado' && this.idOfertaOrigen) {
      this.router.navigate([`visualizar-oferta`, this.idOfertaOrigen], 
        { queryParams: { tab: 'enviados' } }
      );
    } else {
      this.router.navigate([`buscar-candidatos`]);
    }
  }

  ngAfterViewInit() {
    setTimeout(() => this.dropdownAbierto = false);
  }

  calcularEdad(fechaNacimiento: Date | string): number {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return edad;
  }

  abrirDesplegable() {
    this.dropdownAbierto = !this.dropdownAbierto;
  }

  enviarOferta(id: number, oferta: string) {
    Swal.fire({
      title: `¿Está seguro de enviar la oferta "${oferta}"?`,
      icon: "question",
      iconColor: "#31A5DD",
      showCancelButton: true,
      confirmButtonColor: "#31A5DD",
      cancelButtonColor: "#697077",
      confirmButtonText: "Sí, enviar",
      cancelButtonText: "No, volver",
      reverseButtons: true,
      customClass: {
        title: 'titulo-chico',
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.postulacionService.enviarOfertaACandidato(this.candidato.id!, id).subscribe({ 
          next: () => {
            this.dropdownAbierto = false;
            Swal.fire({
              toast: true,
              position: "top-end",
              icon: "success",
              title: "La oferta se envió correctamente al candidato",
              timer: 3000,
              showConfirmButton: false,
            });
            this.router.navigate(['visualizar-oferta', id], { queryParams: { tab: 'enviados' } }); 
          },
          error: (error) => {
            this.dropdownAbierto = false;
            if(error.error.message === "El candidato ya se encuentra postulado a esta oferta") {
              Swal.fire({
                toast: true,
                position: "top-end",
                icon: "warning",
                title: "El candidato ya se encuentra postulado a esta oferta",
                timer: 3000,
                showConfirmButton: false,
              });
            }
          }
        })
    }});
  }

  // enviar(id: number, oferta: string) {
  //   this.enviarOferta(id, oferta);
  //   this.dropdownAbierto = false;
  // }

  mostrarNombreArchivoCV(enlace: string | undefined): string { 
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
