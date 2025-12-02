package com.example.demo.exceptions;

public class MailException extends RuntimeException{
    public MailException(String message){
        super(message);
    }
}
