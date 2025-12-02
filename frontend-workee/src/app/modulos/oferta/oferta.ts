import { EstadoOferta } from "../../admin/ABMEstadoOferta/estado-oferta";
import { Modalidad } from "../../admin/ABMModalidad/modalidad";
import { Provincia } from "../../admin/ABMProvincia/provincia";
import { TipoContrato } from "../../admin/ABMTipoContrato/tipo-contrato";
import { Empresa } from "../empresa/empresa/empresa";
import { OfertaEstadoOferta } from "./oferta-estado-oferta";
import { OfertaEtapa } from "./oferta-etapa";
import { OfertaHabilidad } from "./oferta-habilidad";

export class Oferta {
    id!: number;
    fechaHoraAlta!: string;
    fechaHoraBaja!: string | null;
    titulo!: string;
    descripcion!: string;
    responsabilidades!: string;
    fechaFinalizacion!: string;
    finalizadaConExito!: boolean | null;
    modalidadOferta!: Modalidad;
    empresa!: Empresa;
    tipoContratoOferta!: TipoContrato;
    provincia!: Provincia;
    habilidades!: OfertaHabilidad[];
    //estadosOferta!: EstadoOferta[];
    estadosOferta!: OfertaEstadoOferta[]; //Es de oferta --> Oferta Estado Oferta --> Estado oferta (param)
    ofertaEtapas!: OfertaEtapa[];
    cantidadPostulados?: number;
}