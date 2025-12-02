export interface EstadisticasAdminDTO {
  cantidadHistoricaUsuarios: number;
  tasaExitoOfertas: number;
  distribucionUsuariosPorRol: {
    distribucion: { nombreRol: string; cantidadUsuarios: number }[];
  };
  cantidadUsuariosPorPais: { nombrePais: string; cantidadUsuarios: number }[];
  empresasConMasOfertas: { nombreEmpresa: string; cantidadOfertas: number }[];
  evolucionUsuariosRegistrados: { fecha: string; cantidad: number }[];
}
