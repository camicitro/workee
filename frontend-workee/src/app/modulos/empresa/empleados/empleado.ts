import { Usuario } from "../../seguridad/usuario";
import { Empresa } from "../empresa/empresa";

export class Empleado {
    id?: number;
    nombreEmpleadoEmpresa?: string;
    apellidoEmpleadoEmpresa?: string;
    puestoEmpleadoEmpresa?: string;
    fechaHoraAlta?: string;
    fechaHoraBaja?: string | null;
    empresa?: Empresa;
    usuario?: Usuario;
}