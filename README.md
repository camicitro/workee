<img width="660" height="192" alt="image" src="https://github.com/user-attachments/assets/26433d47-03b4-4a42-909e-b0d5c8b9a990" />


_"Sistema de gestión transparente de procesos de selección"_

Este proyecto fue realizado para la cátedra "Proyecto Final" de Ingeniería en Sistemas de Información de la UTN-FRM junto con Lucía Bürky, Julieta Lorenzo y Máximo Costa.

Workee surgió debido a una problemática que presentábamos nosotros a la hora de buscar pasantías: la falta de seguimiento del proceso de selección desde el lado del candidato. Además, luego de consultar con especialistas de Recursos Humanos, descubrimos que dicho proceso también presentaba falencias desde el punto de vista de empresas, como la desorganización del mismo, la falta de centralización de herramientas y la carencia de seguimiento de los candidatos en curso. Es por todas estas razones que tomamos la decisión de crear "Workee" como nuestro proyecto final de carrera.
No sólo buscábamos centralizar la información del proceso de selección, sino también eliminar el "vacío de información" que sentían los candidatos a la hora de postular a una vacante, transformando el proceso en una experiencia transparente tanto para la empresa como para el candidato.
Además, consideramos importante la incorporación de diversas métricas, que pemiten:
- Al candidato poder mejorar para futuros procesos.
- A la empresa poder detectar errores o puntos de mejora en la forma de organizar y gestionar el proceso de selección.
- Al administrador de workee poder llevar un seguimiento adecuado de distintos puntos importantes para mejorar el sistema.

## Módulos que componen el sistema
Luego de la fase de relevamiento, concluímos que los módulos de Workee serían los siguientes:
- **Módulo de seguridad**: contempla la gestión integral de usuarios del sistema, incluyendo el registro, inicio de sesión, recuperación de contraseñas y eliminación de cuentas. Asimismo, permite al gestionar los usuarios de Workee, con sus respectivos roles y permisos.
- **Módulo de empresa**: permite a los usuarios de empresa administrar completamente su perfil y equipo interno. Incluye funcionalidades para mantener actualizada la información de la compañía y gestionar a sus empleados, desde el alta hasta la visualización de sus datos.
- **Módulo de backup**: facilita la creación de copias de seguridad de la información crítica. Además, brinda la posibilidad de restaurar el sistema a algún estado anterior, minimizando de esta manera la pérdida de datos y asegurando la continuidad e integridad del sistema.
- **Módulo de candidato**: permite a los usuarios con rol candidato mantener actualizado su perfil personal, administrar su currículum vitae, seleccionar sus habilidades y su estado de búsqueda laboral.
- **Módulo de búsqueda**: los distintos usuarios del sistema podrán localizar rápidamente información relevante sobre empresas, ofertas y candidatos mediante búsquedas y filtros. Además, se ofrece la posibilidad de visualizar el detalle de cada entidad seleccionada, facilitando su análisis y la toma de decisiones.
- **Módulo de gestión de ofertas**: ofertas: permite a los usuarios de empresa crear, modificar y administrar sus ofertas laborales, así como sus etapas específicas del proceso de selección. Además, brinda un control completo sobre el ciclo de vida de las ofertas publicadas, permitiendo visualizar el listado de las mismas y modificar sus estados a lo largo del tiempo.
- **Módulo de postulaciones**: se facilita la gestión de las interacciones entre candidatos y empresas dentro de las postulaciones a ofertas. Permite a los candidatos postularse y dar seguimiento a las mismas, mientras que las empresas pueden consultar el detalle de las postulaciones de los candidatos para monitorear y actualizar el estado de cada una.
- **Módulo de videollamadas**: provee las herramientas para la comunicación en tiempo real entre candidatos y empresas mediante videollamadas dentro del sistema. Incluye funcionalidades para facilitar entrevistas y reuniones virtuales entre los distintos usuarios.
- **Módulo de calendario y notificaciones**: permite a las empresas registrar eventos desde diversos lugares y enviar notificaciones automáticas. Además, brinda la posibilidad a los distintos usuarios de visualizar un calendario integrado.
- **Módulo de análisis y métricas**: da la posibilidad de visualizar datos y estadísticas relevantes para cada tipo de usuario. Proporciona paneles y reportes personalizados con métricas clave según los distintos tipos de usuarios.
- **Módulo de parámetros**: permite la configuración y mantenimiento de todos los datos relacionados con los parámetros del sistema. Contiene las funcionalidades de ABM (Alta, Baja y Modificación) para diversos parámetros como países, provincias, habilidades, entre otros, asegurando la estandarización de la información.

## Proceso de creación
Nuestro proceso de desarrollo del sistema constó de diversas fases del ciclo de vida de desarrollo de software:
1. Relevamiento y requerimientos: analizamos sistemas existentes similares (Linkedin, Greenhouse, Cia de Talentos e InfoJobs) para identificar falencias y oportunidades de mejora, además de obtener ideas de los mismos.
2. Diseño del sistema: definimos la estructura del sistema, realizando todo el diseño funcional y lógico del mismo. Definimos diversos artefactos de diseño para facilitar el posterior desarrollo, como diagramas de clases y modelos de casos de uso, así como la definición de la estructura de la base de datos y el diseño de la interfaz de usuario.
3. Desarrollo: implementamos metodologías ágiles para la codificación del backend y frontend. Además, realizamos distintos tipos de pruebas para validar el funcionamiento del sistema, como pruebas de validación de ingreso de datos, de lógica de módulos principales, de carga, entre otras.
4. Implementación: no realizamos el despliegue en sí, pero definimos todo un plan de implementación del sistema, abarcando todas las herramientas y recursos necesarios para poder llevarlo a cabo, además de realizar la estimación de tiempos y esfuerzo.

## Estructura del repositorio
Durante el desarrollo del proyecto utilizamos dos repositorios distintos, uno para el backend y otro para el frontend, de esta manera pudimos mantenernos más organizados y evitar problemas de integración. Sin embargo, dentro de este repositorio se encuentra todo el código, dividido en dos carpetas principales:
- backend
- frontend

## Tecnologías y herramientas utilizadas
### Backend
Utilizamos Java 23 con Spring Boot, para la base de datos MySQL, y además, algunas dependencias como Spring Security con autenticación basada en JWT, SpringDoc para documentar con Swagger, Spring Mail, entre otras. 

### Frontend
Utilizamos Angular 19, junto con Bootstrap 5, Angular Material y PrimeNG. Además, integramos algunas librerías como FullCalendar, Chart.js, SweetAlert2, etc. También creamos una conexión con Firebase Storage para el almacenamimento de archivos multimedia como las fotos de perfiles o documentos PDF.

### Videollamadas
Para la integración de videollamadas propias dentro de Workee, levanamos y configuramos un servidor de AWS, donde instalamos el servicio de Jitsi Meet,. Esto nos permitió una gran personalización de todo lo relacionado a las videollamadas, así como también un mayor control de todo el servicio.

### Gestión del proyecto y otras herramientas
Para la planificación y el relevamiento, en las etapas iniciales utilizamos herramientas como Trello para llevar un registro de lo relevado e ideas, Project Libre para la elaboración de diagramas de Gantt durante la planificación, entre otras.

Con respecto al diseño y modelado del sistema, utilizamos Enterprise Architect para los diagramas de diseño. Mientras que usamos Figma para todo el diseño de pantallas.

Con tal de asegurar un correcto seguimiento del desarrollo, incorporamos el uso de Jira como eje central para la gestión de tareas y el seguimiento del progreso, permitiéndonos una distribución clara de responsabilidades.

En cuanto a la comunicación y colaboración, mantuvimos una comunicación constante a través de Discord (realizando reuniones virtuales de trabajo) y WhatsApp para una coordinación rápida. Además, toda la documentación técnica y administrativa se centralizó en el ecosistema de Google (usando Docs, Spreadsheets y Drive).


## Documentación del proyecto
Al finalizar el proyecto, además de contar con un sistema totalmente funcional que resolvía el problema planteado inicialmente, obtuvimos la carpeta final con toda la documentación del proyecto. Dentro de la misma podemos encontrar información sobre las distintas fases y etapas del proyecto, como el relevamiento, diseño y desarrollo, así como también la planificación del proyecto. Dicha planificación incluye toda la definición de actividades y tareas, la documentación de la organización para la ejecución del proyecto y los distintos análisis de factibiliad.

