export class Videollamada {
    id?: number;
    fechaHoraAlta?: string;
    fechaHoraBaja?: string | null;
    duracionVideollamada?: number;
    enlaceVideollamada?: string;
    fechaHoraFinPlanifVideollamada?: string | null;
    fechaHoraFinRealVideollamada?: string | null;
    fechaHoraInicioPlanifVideollamada?: string | null;
    fechaHoraInicioRealVideollamada?: string | null;
    
    // TODO: CAMBIAR ESTO
    detalleVideollamadaList?: string | null;
}