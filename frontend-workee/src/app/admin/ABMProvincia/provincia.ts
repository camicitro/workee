import { Pais } from "../ABMPais/pais";

export class Provincia {
    id?: number; 
    nombreProvincia?: string;
    fechaHoraAlta?: string;
    fechaHoraBaja?: string | null;
    pais?: Pais; 
}