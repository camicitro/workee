import { PostulacionOfertaEtapa } from "./postulacion-oferta-etapa";

export class PostulacionSimplificadaDTO {
    idOferta!: number;
    idPostulacionOferta!: number;
    idCandidato!: number;
    idIniciadorPostulacion!: number;
    fechaHoraFinPostulacionOferta!: string | null;
    fechaHoraInicioPostulacion!: string | null;
    fechaHoraAbandonoOferta!: string | null;
    etapas!: PostulacionOfertaEtapa[];
}
