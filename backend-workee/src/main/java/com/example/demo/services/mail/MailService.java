package com.example.demo.services.mail;

import java.util.Map;

public interface MailService {
    public void enviar(String to, String subject, String templateName, Map<String, Object> templateVariables);
}
