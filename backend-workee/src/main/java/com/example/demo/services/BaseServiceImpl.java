package com.example.demo.services;

import java.io.Serializable;
import java.util.Date;

import com.example.demo.entities.Base;
import com.example.demo.exceptions.EntityAlreadyDisabledException;
import com.example.demo.exceptions.EntityNotFoundException;
import com.example.demo.repositories.BaseRepository;

import jakarta.transaction.Transactional;

public abstract class BaseServiceImpl <E extends Base, ID extends Serializable> implements BaseService<E, ID>{
     protected BaseRepository<E, ID> baseRepository;

    public BaseServiceImpl(BaseRepository<E, ID> baseRepository) {
        this.baseRepository = baseRepository;
    }

    @Override
    @Transactional
    public boolean delete(ID id) {
        E entity = findById(id);
        if(entity.getFechaHoraBaja() != null){
            throw new EntityAlreadyDisabledException("La entidad ya se encuentra deshabilitada");
        }
        entity.setFechaHoraBaja(new Date());
        baseRepository.save(entity);
        return true;
    }


    @Transactional
    @Override
    public E findById(ID id) {
        return baseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Entidad no encontrada con ID: " + id));
    }

    @Override
    @Transactional
    public E save(E entity) {
        entity = baseRepository.save(entity);
        return entity;
    }

}
