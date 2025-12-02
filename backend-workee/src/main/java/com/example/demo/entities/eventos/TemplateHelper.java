package com.example.demo.entities.eventos;

import java.util.Map;

public class TemplateHelper {
    public static String aplicarTemplate(String template, Map<String, Object> datos) {
        String result = template;
        for (Map.Entry<String, Object> entry : datos.entrySet()) {
            result = result.replace("{" + entry.getKey() + "}", 
                                    entry.getValue() != null ? entry.getValue().toString() : "");
        }
        return result;
    }
}

