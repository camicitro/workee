export class CandidatoPostuladoDTO {
    idPostulacion!: number;
    idCandidato!: number;
    nombreCandidato!: string;
    apellidoCandidato!: string;
    fechaHoraPostulacion!: string;
    nombreEtapa!: string;
    codigoEtapa!: string
    urlFotoPerfil!: string | null;
}