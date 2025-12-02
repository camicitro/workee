import { Habilidad } from "../../admin/ABMHabilidad/habilidad";

export class CandidatoHabilidad {
    id?: number;
    fechaHoraAlta?: string;
    fechaHoraBaja?: string | null;
    // id_candidato?: number;
    habilidad?: Habilidad;
}