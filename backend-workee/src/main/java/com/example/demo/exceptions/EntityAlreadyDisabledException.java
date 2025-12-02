package com.example.demo.exceptions;

public class EntityAlreadyDisabledException extends RuntimeException {
    public EntityAlreadyDisabledException(String message) {
        super(message);
    }

}
