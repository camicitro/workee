import { EstadoBusquedaLaboral } from "../../admin/ABMEstadoBusquedaLaboral/estado-busqueda-laboral";
import { Genero } from "../../admin/ABMGenero/genero";
import { Provincia } from "../../admin/ABMProvincia/provincia";
import { Usuario } from "../seguridad/usuario";
import { CandidatoHabilidad } from "./candidato-habilidad";
import { CV } from "./perfil-candidato/cv";

export class Candidato {
    id?: number;
    fechaHoraAlta?: string;
    fechaHoraBaja?: string | null;
    nombreCandidato?: string;
    apellidoCandidato?: string;
    fechaDeNacimiento?: string;
    habilidades?: CandidatoHabilidad[];
    estadoBusqueda?: EstadoBusquedaLaboral;
    genero?: Genero;
    provincia?: Provincia;
    usuario?: Usuario;
    candidatoCV?: CV;
}