import { Categoria } from "./categoria";

export class Rol {
    id?: number;
    fechaHoraAlta?: string;
    fechaHoraBaja?: string | null;
    nombreRol?: string;
    codigoRol?: string;
    categoriaRol?: Categoria;
}