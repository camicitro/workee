import { Rubro } from "../../../admin/ABMRubro/rubro";

export interface EmpresaPendienteDTO {
  idEmpresa: number;
  nombreEmpresa: string;
  logoEmpresa: string;
  correoEmpresa: string;
  fechaHoraRegistroEmpresa: Date;
  rubro: Rubro | null;
}