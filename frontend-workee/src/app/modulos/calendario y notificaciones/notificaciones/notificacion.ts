import { Usuario } from "../../seguridad/usuario";
import { Evento } from "../calendario y evento/evento";
import { TipoNotificacion } from "./tiponotificacion";

export class Notificacion {
    id?: number;
    descripcionNotificacion?: string;
    fechaHoraEnvioNotificacion?: Date;
    lecturaNotificacion?: Boolean;
    tipoNotificacion?: TipoNotificacion;
    usuarioNotificacion?: Usuario;
    eventoNotificacion?: Evento;
    enviada?: Boolean;
}