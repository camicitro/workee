import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Oferta } from '../../../oferta/oferta';
import { DatePipe } from '@angular/common';
import { SesionService } from '../../../../interceptors/sesion.service';
import { Rol } from '../../../seguridad/rol';
import { OfertaService } from '../../../oferta/oferta.service';
import { RouterLink } from '@angular/router';
import { PostulacionService } from '../../../postulaciones/postulacion.service';
import { UsuarioService } from '../../../seguridad/usuarios/usuario.service';
import { Candidato } from '../../../candidato/candidato';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-detalle-oferta',
  imports: [DatePipe, RouterLink],
  templateUrl: './detalle-oferta.component.html',
  styleUrl: './detalle-oferta.component.css'
})
export class DetalleOfertaComponent implements OnInit {
  
  oferta!: Oferta;
  esCandidato: boolean = false;

  estaPostulado: boolean = false;
  etapaActualCandidato: string | null = '';

  // rolUsuario: Rol = {};

  origen: any | null;

  idOferta!: number;
  idCandidato!: number | null;
  candidato: Candidato = {};

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private ofertaService: OfertaService,
    private sesionService: SesionService,
    private postulacionService: PostulacionService,
    private usuarioService: UsuarioService,
  ) {
    console.log(this.esCandidato)
  }

  ngOnInit() {
    this.idOferta = Number(this.route.snapshot.paramMap.get('idOferta'));
    this.ofertaService.getOferta(this.idOferta).subscribe(data => {
      this.oferta = data;
      // this.edadCandidato = this.calcularEdad(this.candidato.fechaDeNacimiento!)
    })

    this.sesionService.rolUsuario$.subscribe(rol => {
      if (rol!.codigoRol === 'CANDIDATO') {
        this.esCandidato = true;
        this.usuarioService.getUsuario().subscribe(data => {
          this.candidato = data;
          this.idCandidato = this.candidato.id!;
          this.cargarEtapaActual();
        })
      }
    })
    // const rol = this.sesionService.getRolActual();
    // this.rolUsuario = rol ? rol : {};
    // console.log(this.rolUsuario);

    const origen = this.route.snapshot.queryParamMap.get('from');
    this.origen = origen; // guardar para usar en volverAListado()
  }

  cargarEtapaActual() {
    this.ofertaService.getEtapaActualOfertaCandidato(this.idOferta, this.idCandidato!).subscribe({
      next: (data) => {
        this.estaPostulado = true;
        this.etapaActualCandidato =  data;
      },
      error: (err) => {
        let errorMsg = err?.error?.message || err?.error || 'Error desconocido';
        if (errorMsg.includes("No se encontró una etapa actual para el candidato")) {
          this.estaPostulado = false;
        }
      }
    })
  }

  postular() {
    Swal.fire({
      title: '¿Está seguro de postularse?',
      text: 'Desde ahora estará participando del proceso de selección.',
      icon: "question",
      iconColor: "#31A5DD",
      showCancelButton: true,
      confirmButtonColor: "#31A5DD",
      cancelButtonColor: "#697077",
      confirmButtonText: "Sí, postularme",
      cancelButtonText: "No, volver",
      reverseButtons: true,
      customClass: {
        title: 'titulo-chico',
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.postulacionService.postular(this.idCandidato!, this.idOferta).subscribe({
          next: (mensaje) => {
            console.log(mensaje);
            this.cargarEtapaActual();
            Swal.fire({
              toast: true,
              position: "top-end",
              icon: "success",
              title: "Ya estás postulado a la oferta",
              timer: 3000,
              showConfirmButton: false,
            })
          },
          error: (error) => {
            console.error(error);
            if (error.error.message === "El candidato ya se encuentra postulado a esta oferta") {
              Swal.fire({
                toast: true,
                position: "top-end",
                icon: "error",
                title: "Ya estás postulado a esta oferta",
                timer: 3000,
                showConfirmButton: false,
              })
            }
          }
        })
      }
    });
  }
  
  volver() {
    if (this.origen === 'empresa') {
      this.router.navigate([`buscar-empresas/detalle`, this.oferta.empresa.id]);
    } else {
      this.router.navigate([`buscar-ofertas`]);
    }
  }

}
