export interface EstadisticasEmpresaDTO {
  cantidadOfertasAbiertas: number;

  distribucionGeneros: {
    totalPostulaciones: number;
    postulaciones: {
      nombreGenero: string;
      cantidadCandidatosPostulados: number;
      porcentajePostulaciones: number;
    }[];
  };

  tasaAbandono: number; // porcentaje como número, ej: 0.25 para 25%
  tiempoPromedioContratacion: number; // en días, por ejemplo

  distribucionPostulacionesPorPais: {
    totalPostulaciones: number;
    postulaciones: {
      nombrePais: string;
      cantidad: number;
      porcentajePostulaciones: number;
    }[];
  };
}
