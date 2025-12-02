import { Categoria } from "../categoria";
import { Rol } from "../rol";

export class permisoRol {
    id?: number;
    fechaHoraAlta?: string;
    fechaHoraBaja?: string | null;
    rol?: Rol;
}