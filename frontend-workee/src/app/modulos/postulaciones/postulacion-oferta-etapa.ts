import { Etapa } from "../../admin/ABMEtapa/etapa";

export class PostulacionOfertaEtapa {
    id!: number;
    fechaHoraAlta!: string;
    fechaHoraBaja!: string | null;
    etapa!: Etapa;
    respuestaCandidato!: string | null;
    retroalimentacionEmpresa!: string | null;
}