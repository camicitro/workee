package com.example.demo.services.postulaciones;

import org.springframework.stereotype.Service;

import com.example.demo.entities.postulaciones.PostulacionOfertaEtapa;
import com.example.demo.repositories.postulaciones.PostulacionOfertaEtapaRespository;
import com.example.demo.services.BaseServiceImpl;

@Service
public class PostulacionOfertaEtapaServiceImpl extends BaseServiceImpl<PostulacionOfertaEtapa, Long> implements PostulacionOfertaEtapaService{

    public PostulacionOfertaEtapaServiceImpl( PostulacionOfertaEtapaRespository postulacionOfertaEtapaRespository) {
        super(postulacionOfertaEtapaRespository);
    }

}
