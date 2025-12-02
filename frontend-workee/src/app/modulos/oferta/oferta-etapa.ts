import { Etapa } from "../../admin/ABMEtapa/etapa";
import { Empleado } from "../empresa/empleados/empleado";
import { ArchivoAdjunto } from "./archivo-adjunto";

export class OfertaEtapa {
    id!: number;
    fechaHoraAlta!: string;
    fechaHoraBaja!: string | null;
    numeroEtapa!: number;
    descripcionAdicional!: string | null;
    adjuntaEnlace!: boolean;
    etapa!: Etapa;
    empleadoEmpresa!: Empleado;
    archivoAdjunto!: ArchivoAdjunto
}