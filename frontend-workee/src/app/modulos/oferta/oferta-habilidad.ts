import { Habilidad } from "../../admin/ABMHabilidad/habilidad";

export class OfertaHabilidad {
    id!: number;
    fechaHoraAlta!: string;
    fechaHoraBaja!: string | null;
    habilidad!: Habilidad;
}