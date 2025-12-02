export interface EstadisticasCandidatoDTO {
  cantidadPostulacionesEnCurso: number;
  cantidadPostulacionesRechazadas: number;

  rubrosDeInteres: {
    nombreRubro: string;
    cantidadPostulaciones: number;
  }[];

  paisesMasPostulados: {
    totalPostulaciones: number;
    postulaciones: {
      nombrePais: string;
      cantidad: number;
      porcentajePostulaciones: number;
    }[];
  };

  topHabilidadesBlandas: {
    nombreHabilidad: string;
    cantidad: number;
  }[];

  topHabilidadesTecnicas: {
    nombreHabilidad: string;
    cantidad: number;
  }[];
}
