import { Component, OnInit } from '@angular/core';
import { EmpresaService } from '../../../empresa/empresa/empresa.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Empresa } from '../../../empresa/empresa/empresa';
import { BusquedaService } from '../../busqueda.service';
import { Oferta } from '../../../oferta/oferta';
import { DatePipe } from '@angular/common';
import { OfertaService } from '../../../oferta/oferta.service';

@Component({
  selector: 'app-detalle-empresa',
  imports: [DatePipe],
  templateUrl: './detalle-empresa.component.html',
  styleUrl: './detalle-empresa.component.css'
})
export class DetalleEmpresaComponent implements OnInit {
  empresa: Empresa = {};
  ofertas: Oferta[] = []; // arreglo usado para guardar las ofertas que tiene la empresa
  
  origen: any | undefined;

  idOfertaOrigen?: number | null;

  ofertasAbiertas: Oferta[] = [];

  constructor(
    private empresaService: EmpresaService,
    private route: ActivatedRoute,
    private router: Router,
    private ofertaService: OfertaService,
  ) {}
  
  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('idEmpresa'));
    this.empresaService.findById(id).subscribe(data => {
      this.empresa = data;
    })

    // para buscar ofertas de la empresa
    this.ofertaService.getOfertasAbiertasPorEmpresa(id).subscribe(data => {
      this.ofertas = data;
      this.ofertasAbiertas = this.ofertas.filter(oferta => this.isOfertaAbierta(oferta));
      console.log("estas son las ofertas que tiene la empresa", this.ofertas)
    })

    this.route.queryParams.subscribe(params => {
      this.origen = params['from'];
      this.idOfertaOrigen = params['idOferta'] ? Number(params['idOferta']) : null;
    });
  }

  getSitioWebConProtocolo(url: string): string {
    if (!url) return '#';
    if (!/^https?:\/\//i.test(url)) {
      return 'https://' + url;
    }
    return url;
  }

  isOfertaAbierta(oferta: Oferta): boolean {
    const estadoVigente = oferta.estadosOferta.find(eo => eo.fechaHoraBaja == null);
    return estadoVigente?.estadoOferta.codigo === "ABIERTA";
  }

  irADetalleOferta(idOferta: number) {
    // con "queryparams" se guarda un string que nos dice desde donde se accedio al detalle de la oferta
    this.router.navigate([`buscar-ofertas/detalle`,idOferta], { queryParams: { from: 'empresa' } });
  }

  volver() {
    if (this.origen === 'oferta' && this.idOfertaOrigen) {
      this.router.navigate([`/buscar-ofertas/detalle`, this.idOfertaOrigen]);
    } else {
      this.router.navigate([`buscar-empresas`]);
    }
  }

}
