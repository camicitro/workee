package com.example.demo.repositories;
import com.example.demo.entities.Base;
import java.io.Serializable;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

@NoRepositoryBean
public interface BaseRepository <E extends Base, ID extends Serializable> extends JpaRepository<E, ID>{
    public List<E> findByFechaHoraBajaIsNull();
}
