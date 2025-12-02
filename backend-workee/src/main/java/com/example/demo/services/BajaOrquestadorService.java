package com.example.demo.services;

import com.example.demo.entities.oferta.Oferta;

public interface BajaOrquestadorService {
    public void darDeBajaEmpresaYRelacionados(Long idEmpresa);
    public void darDeBajaUsuarioYEntidadRelacionada(Long idUsuario);

    public Oferta rechazarATodosYFinalizarOferta(Long idOferta);
}
