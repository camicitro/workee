// eventos.adapter.ts
import { EventInput } from '@fullcalendar/core';

export function toFcEvent(e: any): EventInput {
  return {
    id: String(e.id),                     
    title: e.nombreEvento ?? 'Evento',    
    start: e.fechaHoraInicioEvento,       
    end: e.fechaHoraFinEvento,            
    extendedProps: {                      
      descripcion: e.descripcionEvento,
      candidato: e.usuarioCandidato,
      empleado: e.usuarioEmpleado,
      tipo: e.tipoEvento,
      videollamada: e.videollamada,
      id:e.idevento,
    }
  };
}
