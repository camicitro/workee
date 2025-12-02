import { Candidato } from "../candidato/candidato";
import { Oferta } from "../oferta/oferta";
import { PostulacionOfertaEtapa } from "./postulacion-oferta-etapa";

export class PostulacionOferta {
    id!: number;
    fechaHoraAlta!: string;
    fechaHoraBaja!: string | null;
    candidato!: Candidato;
    oferta!: Oferta;
    fechaHoraAbandonoOferta!: string | null;
    fechaHoraFinPostulacionOferta!: string | null;
    idIniciadorPostulacion!: number | null;
    postulacionOfertaEtapaList!: PostulacionOfertaEtapa[];
}