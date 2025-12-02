import { EventInput } from "@fullcalendar/core/index.js";
import { TipoEvento } from "../../../admin/ABMTipoEvento/tipo-evento";
import { Candidato } from "../../candidato/candidato";
import { Empleado } from "../../empresa/empleados/empleado";
import { Usuario } from "../../seguridad/usuario";
import { PostulacionOfertaEtapa } from "../../postulaciones/postulacion-oferta-etapa";
import { Videollamada } from "../../videollamadas/videollamada";

export class Evento {
    map(toFcEvent: (e: any) => EventInput): import("@fullcalendar/core/index.js").EventSourceInput | undefined {
        throw new Error('Method not implemented.');
    }
    id?: number;
    fechaHoraAlta?: string;
    fechaHoraBaja?: string | null;
    descripcionEvento?: string;
    nombreEvento?: string;
    fechaHoraInicioEvento?: string;
    fechaHoraFinEvento?: string;
    usuarioCandidato?: Usuario;
    usuarioEmpleado?: Usuario;
    tipoevento?: TipoEvento;
    enlaceEvento?:string;
    postulacionOfertaEtapa?: PostulacionOfertaEtapa;
    videollamada?: Videollamada;
    //postulacionOfertaEtapa?: 
}