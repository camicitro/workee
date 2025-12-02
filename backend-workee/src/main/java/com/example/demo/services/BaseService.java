package com.example.demo.services;

import java.io.Serializable;

import com.example.demo.entities.Base;

public interface BaseService <E extends Base, ID extends Serializable>{
    public E findById(ID id);
    public boolean delete(ID id);

    public E save(E entity);

}