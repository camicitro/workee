import { EstadoOferta } from "../../admin/ABMEstadoOferta/estado-oferta";

export interface OfertaEstadoOferta {
  id: number;
  fechaHoraAlta?: string;
  fechaHoraBaja?: string | null;
  estadoOferta: EstadoOferta; //Esto viene de Oferta Estado Oferta y va a --> Estado oferta (param)
}