// models/filtro-fechas.dto.ts
export interface FiltroFechasDTO {
  fechaDesde: string | null; // LocalDateTime en backend, string en JSON
  fechaHasta: string | null;
}