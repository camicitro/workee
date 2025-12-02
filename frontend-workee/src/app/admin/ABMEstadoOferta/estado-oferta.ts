export class EstadoOferta {
    id?: number;
    nombreEstadoOferta?: string;
    fechaHoraAlta?: string;
    fechaHoraBaja?: string | null;
    codigo!: 'ABIERTA' | 'CERRADA' | 'FINALIZADA';
}