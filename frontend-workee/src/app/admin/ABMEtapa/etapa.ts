import { Empresa } from "../../modulos/empresa/empresa/empresa";

export class Etapa {
    id?: number; 
    nombreEtapa?: string;
    fechaHoraAlta?: string;
    fechaHoraBaja?: string | null;
    descripcionEtapa?: string;
    esPredeterminada?: boolean;
    empresa?: Empresa | null;
    codigoEtapa?: string;
}