package com.example.demo.services.mail;

import java.util.Map;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import com.example.demo.exceptions.MailException;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;


@Service
public class MailServiceImpl implements MailService{
    private final JavaMailSender javaMailSender;
    private final SpringTemplateEngine templateEngine;

    public MailServiceImpl(JavaMailSender javaMailSender, SpringTemplateEngine templateEngine){
        this.javaMailSender = javaMailSender;
        this.templateEngine = templateEngine;
    }
    
    
    @Override
    @Async
    public void enviar(String to, String subject, String templateName, Map<String, Object> templateVariables){
        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage, true, "utf-8");

            Context context = new Context();
            context.setVariables(templateVariables);

            String htmlContent = templateEngine.process("email/" + templateName, context);
            
            mimeMessageHelper.setText(htmlContent, true);   
            mimeMessageHelper.setTo(to);
            mimeMessageHelper.setSubject(subject);

            javaMailSender.send(mimeMessage);
            System.out.println("Correo enviado correctamente a " + to);
        } catch(MessagingException | MailException e){
            throw new MailException("Error al enviar mail");
        }

    }
}
