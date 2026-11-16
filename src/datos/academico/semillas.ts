export interface SemillaTema {
  nombre: string;
  ideas: Array<[string, string]>;
  error: string;
  pasos: string[];
  dato: [string, number, number, string];
  caso: string;
}

export interface SemillaModulo { nombre: string; tim: string; temas: SemillaTema[] }

export const semillasCur01: SemillaModulo[] = [
  {
    nombre: 'Fundamentos del liderazgo',
    tim: 'Diagnóstico de liderazgo de un equipo comercial',
    temas: [
      {
        nombre: 'Qué es liderar un equipo comercial',
        ideas: [
          ['Liderazgo comercial', 'Capacidad de orientar a un equipo de ventas hacia metas compartidas mediante ejemplo, comunicación y acompañamiento.'],
          ['Autoridad formal', 'Poder que otorga un cargo o una posición dentro de la organización, independiente de la confianza del equipo.'],
          ['Influencia', 'Capacidad de generar compromiso voluntario a partir de la credibilidad personal y la coherencia.'],
        ],
        error: 'El liderazgo depende solo del cargo: quien tiene el puesto más alto siempre es el líder del equipo.',
        pasos: ['Conocer a cada integrante', 'Definir la meta común', 'Acordar la forma de trabajo', 'Dar seguimiento y reconocer avances'],
        dato: ['Un líder tiene 12 personas a cargo y 9 participan en la reunión semanal. ¿Qué porcentaje de participación logra?', 75, 0.5, '9 dividido entre 12 es 0,75; es decir, 75 %.'],
        caso: 'Lucía asume la coordinación de un equipo de 12 vendedores que antes trabajaban de forma independiente y sin reuniones fijas.',
      },
      {
        nombre: 'Estilos de liderazgo',
        ideas: [
          ['Estilo directivo', 'Estilo que da instrucciones precisas y supervisa de cerca; útil con personas nuevas o en situaciones urgentes.'],
          ['Estilo participativo', 'Estilo que involucra al equipo en las decisiones y aprovecha sus ideas para construir acuerdos.'],
          ['Liderazgo situacional', 'Enfoque que adapta el estilo según la madurez y la experiencia de cada colaborador.'],
        ],
        error: 'Existe un único estilo de liderazgo correcto que funciona igual con todas las personas y en todos los momentos.',
        pasos: ['Observar la situación', 'Evaluar la experiencia del colaborador', 'Elegir el estilo adecuado', 'Revisar el resultado y ajustar'],
        dato: ['De 20 colaboradores, 5 son nuevos y requieren un estilo directivo. ¿Qué porcentaje del equipo representan?', 25, 0.5, '5 dividido entre 20 es 0,25; es decir, 25 %.'],
        caso: 'Andrés dirige un equipo mixto: cinco vendedores recién incorporados y quince con más de dos años de experiencia.',
      },
      {
        nombre: 'Visión y propósito del equipo',
        ideas: [
          ['Visión', 'Imagen clara y motivadora del futuro que el equipo quiere alcanzar en un plazo determinado.'],
          ['Propósito', 'Razón de fondo por la que el equipo trabaja, más allá de las cifras de venta.'],
          ['Alineamiento', 'Coherencia entre las metas individuales y la visión compartida del equipo.'],
        ],
        error: 'La visión del equipo es un texto decorativo que no influye en las decisiones del día a día.',
        pasos: ['Reflexionar sobre el propósito', 'Redactar la visión con el equipo', 'Traducirla en metas concretas', 'Comunicarla de forma permanente'],
        dato: ['Un equipo se propone pasar de 40 a 50 clientes activos en un trimestre. ¿Cuántos clientes nuevos necesita?', 10, 0, '50 menos 40 es igual a 10 clientes adicionales.'],
        caso: 'El equipo de Carla cumple sus metas, pero sus integrantes dicen no saber hacia dónde va el negocio en el próximo año.',
      },
      {
        nombre: 'Confianza y credibilidad',
        ideas: [
          ['Confianza', 'Seguridad que tiene el equipo de que su líder actuará con honestidad y cumplirá lo que promete.'],
          ['Credibilidad', 'Reputación que se construye cuando las palabras del líder coinciden de manera sostenida con sus acciones.'],
          ['Transparencia', 'Práctica de compartir información relevante, incluidas las malas noticias, de forma oportuna.'],
        ],
        error: 'Para mantener la confianza del equipo conviene ocultar los problemas hasta tenerlos resueltos.',
        pasos: ['Cumplir los compromisos pequeños', 'Comunicar con transparencia', 'Reconocer los errores propios', 'Ser consistente en el tiempo'],
        dato: ['Un líder cumplió 18 de los 20 compromisos que asumió en el trimestre. ¿Cuál es su porcentaje de cumplimiento?', 90, 0.5, '18 dividido entre 20 es 0,90; es decir, 90 %.'],
        caso: 'Tras un cambio de reglas comerciales, el equipo de Mario desconfía porque se enteró por terceros y no por su líder.',
      },
      {
        nombre: 'Ética y ejemplo del líder',
        ideas: [
          ['Ética comercial', 'Conjunto de principios que orienta a vender con honestidad, sin promesas falsas ni presión indebida.'],
          ['Liderazgo con el ejemplo', 'Práctica de mostrar con la propia conducta el comportamiento que se espera del equipo.'],
          ['Integridad', 'Coherencia entre los valores declarados y las decisiones tomadas, incluso cuando nadie observa.'],
        ],
        error: 'Si las ventas aumentan, es aceptable exagerar los beneficios de un producto ante el cliente.',
        pasos: ['Conocer las normas y valores', 'Analizar el impacto de la decisión', 'Actuar con coherencia', 'Explicar la decisión al equipo'],
        dato: ['En una auditoría de 50 ventas, 2 tuvieron información incorrecta para el cliente. ¿Qué porcentaje presentó errores?', 4, 0.5, '2 dividido entre 50 es 0,04; es decir, 4 %.'],
        caso: 'Un vendedor destacado de Elena promete a sus clientes resultados que el producto no garantiza para cerrar más rápido.',
      },
    ],
  },
  {
    nombre: 'Comunicación efectiva',
    tim: 'Plan de comunicación para una reunión de equipo',
    temas: [
      {
        nombre: 'Escucha activa',
        ideas: [
          ['Escucha activa', 'Atención plena al interlocutor para comprender su mensaje, sus emociones y sus necesidades.'],
          ['Parafraseo', 'Técnica de repetir con palabras propias lo que dijo la otra persona para confirmar la comprensión.'],
          ['Preguntas abiertas', 'Preguntas que invitan a explicar y no pueden responderse solo con sí o no.'],
        ],
        error: 'Escuchar activamente consiste en esperar en silencio a que el otro termine para dar la propia opinión.',
        pasos: ['Prestar atención sin interrumpir', 'Hacer preguntas abiertas', 'Parafrasear lo escuchado', 'Confirmar acuerdos'],
        dato: ['En una reunión de 30 minutos, el líder habló 12 minutos. ¿Qué porcentaje del tiempo habló?', 40, 0.5, '12 dividido entre 30 es 0,40; es decir, 40 %.'],
        caso: 'Sofía nota que su equipo ya no comparte problemas en las reuniones porque, según ellos, siempre los interrumpe con soluciones.',
      },
      {
        nombre: 'Mensajes claros y concretos',
        ideas: [
          ['Mensaje claro', 'Comunicación que expresa una sola idea principal con lenguaje sencillo y sin ambigüedades.'],
          ['Estructura del mensaje', 'Orden lógico que presenta primero el objetivo, luego los detalles y al final la acción esperada.'],
          ['Llamado a la acción', 'Indicación explícita de lo que se espera que haga el receptor y en qué plazo.'],
        ],
        error: 'Un mensaje es más profesional cuanto más largo y técnico es su contenido.',
        pasos: ['Definir el objetivo del mensaje', 'Ordenar las ideas', 'Usar lenguaje sencillo', 'Cerrar con la acción esperada'],
        dato: ['Un comunicado tenía 400 palabras y se redujo a 250. ¿Cuántas palabras se eliminaron?', 150, 0, '400 menos 250 es igual a 150 palabras.'],
        caso: 'Los correos de Raúl a su equipo son extensos y nadie sabe con certeza qué debe hacer después de leerlos.',
      },
      {
        nombre: 'Retroalimentación constructiva',
        ideas: [
          ['Retroalimentación', 'Información que se entrega a una persona sobre su desempeño para mantenerlo o mejorarlo.'],
          ['Modelo situación, conducta, impacto', 'Forma de dar retroalimentación describiendo el hecho, el comportamiento observado y su efecto.'],
          ['Reconocimiento específico', 'Felicitación que menciona con precisión qué se hizo bien y por qué es valioso.'],
        ],
        error: 'La retroalimentación solo debe darse cuando algo sale mal; lo positivo no necesita comentarse.',
        pasos: ['Describir la situación', 'Señalar la conducta observada', 'Explicar el impacto', 'Acordar el siguiente paso'],
        dato: ['Un líder dio 16 retroalimentaciones en el mes y 12 fueron de reconocimiento. ¿Qué porcentaje fue de reconocimiento?', 75, 0.5, '12 dividido entre 16 es 0,75; es decir, 75 %.'],
        caso: 'Diana debe conversar con un vendedor que llega tarde a las citas con clientes, pero que tiene excelentes cierres.',
      },
      {
        nombre: 'Comunicación no verbal',
        ideas: [
          ['Comunicación no verbal', 'Mensajes que se transmiten con la postura, los gestos, la mirada y el tono de voz.'],
          ['Congruencia', 'Coincidencia entre lo que se dice con palabras y lo que se expresa con el cuerpo.'],
          ['Contacto visual', 'Mirada sostenida y natural que transmite atención, seguridad e interés por el interlocutor.'],
        ],
        error: 'En una videollamada la comunicación no verbal deja de importar porque solo se escucha la voz.',
        pasos: ['Cuidar la postura', 'Mantener contacto visual', 'Controlar el tono de voz', 'Verificar la reacción del interlocutor'],
        dato: ['En una presentación de 20 minutos, el expositor miró a la cámara durante 15 minutos. ¿Qué porcentaje del tiempo fue?', 75, 0.5, '15 dividido entre 20 es 0,75; es decir, 75 %.'],
        caso: 'En las videollamadas, Jorge apaga la cámara y responde con monosílabos; su equipo interpreta que está molesto.',
      },
      {
        nombre: 'Reuniones productivas',
        ideas: [
          ['Agenda', 'Lista previa de temas, tiempos y responsables que orienta el desarrollo de una reunión.'],
          ['Moderación', 'Rol que conduce la reunión, administra el tiempo y asegura que todos participen.'],
          ['Acta de acuerdos', 'Registro breve de las decisiones, los responsables y las fechas comprometidas.'],
        ],
        error: 'Una reunión es productiva si dura mucho tiempo, aunque no termine con acuerdos concretos.',
        pasos: ['Preparar la agenda', 'Iniciar a la hora acordada', 'Moderar la participación', 'Cerrar con acuerdos y responsables'],
        dato: ['Una reunión semanal de 90 minutos se reduce a 60 minutos. ¿Cuántos minutos se ahorran en 4 semanas?', 120, 0, '30 minutos por semana multiplicados por 4 semanas son 120 minutos.'],
        caso: 'Las reuniones del equipo de Paola duran dos horas, se desvían de tema y terminan sin responsables definidos.',
      },
    ],
  },
  {
    nombre: 'Motivación y desempeño',
    tim: 'Programa de motivación y seguimiento del desempeño',
    temas: [
      {
        nombre: 'Motivación intrínseca y extrínseca',
        ideas: [
          ['Motivación intrínseca', 'Impulso que nace del interés personal, el disfrute o el sentido que la persona encuentra en su trabajo.'],
          ['Motivación extrínseca', 'Impulso que proviene de recompensas o consecuencias externas, como premios o comisiones.'],
          ['Autonomía', 'Libertad para decidir cómo realizar el trabajo, que fortalece el compromiso de las personas.'],
        ],
        error: 'Los incentivos económicos son la única forma de motivar a un equipo comercial.',
        pasos: ['Conocer qué motiva a cada persona', 'Combinar incentivos y sentido', 'Dar autonomía progresiva', 'Revisar el compromiso'],
        dato: ['En una encuesta, 14 de 20 vendedores dicen que el reconocimiento los motiva más que el premio. ¿Qué porcentaje es?', 70, 0.5, '14 dividido entre 20 es 0,70; es decir, 70 %.'],
        caso: 'Después de un concurso con premios, el equipo de Hugo bajó su rendimiento en cuanto terminó la campaña.',
      },
      {
        nombre: 'Metas SMART',
        ideas: [
          ['Meta SMART', 'Meta específica, medible, alcanzable, relevante y con un plazo definido.'],
          ['Indicador de meta', 'Dato que permite verificar de forma objetiva si la meta se está cumpliendo.'],
          ['Plazo', 'Fecha límite que da urgencia y permite evaluar el avance en momentos definidos.'],
        ],
        error: 'Una meta como "vender más este año" es suficiente porque deja libertad para trabajar.',
        pasos: ['Definir qué se quiere lograr', 'Establecer cómo se medirá', 'Comprobar que sea alcanzable', 'Fijar el plazo'],
        dato: ['Una meta es vender 60 unidades en 12 semanas. ¿Cuántas unidades por semana se necesitan en promedio?', 5, 0, '60 dividido entre 12 es igual a 5 unidades por semana.'],
        caso: 'Las metas del equipo de Inés son generales y al final del mes nadie puede decir si se cumplieron o no.',
      },
      {
        nombre: 'Reconocimiento del desempeño',
        ideas: [
          ['Reconocimiento', 'Acción de valorar públicamente o en privado un logro, un esfuerzo o una conducta positiva.'],
          ['Oportunidad del reconocimiento', 'Principio que indica reconocer cerca del momento del logro para reforzar la conducta.'],
          ['Reconocimiento entre pares', 'Práctica en la que los propios compañeros destacan los aportes de los demás.'],
        ],
        error: 'Reconocer con frecuencia hace que el equipo se relaje y baje su esfuerzo.',
        pasos: ['Identificar el logro', 'Reconocer de forma específica', 'Hacerlo en el momento oportuno', 'Vincularlo con la meta del equipo'],
        dato: ['Un equipo de 10 personas recibe 2 reconocimientos por persona al mes. ¿Cuántos reconocimientos hay en total en el mes?', 20, 0, '10 personas por 2 reconocimientos es igual a 20.'],
        caso: 'En el equipo de Tomás solo se reconoce al primer lugar del mes, y el resto siente que su esfuerzo no se valora.',
      },
      {
        nombre: 'Seguimiento del desempeño',
        ideas: [
          ['Seguimiento', 'Revisión periódica del avance frente a la meta para detectar desvíos a tiempo.'],
          ['Conversación uno a uno', 'Reunión individual entre líder y colaborador para revisar resultados, obstáculos y apoyo necesario.'],
          ['Plan de mejora', 'Conjunto de acciones acordadas, con plazos, para cerrar una brecha de desempeño.'],
        ],
        error: 'El desempeño solo debe revisarse al final del año para no presionar al equipo.',
        pasos: ['Revisar los indicadores', 'Conversar uno a uno', 'Identificar obstáculos', 'Acordar el plan de mejora'],
        dato: ['Un vendedor tiene una meta de 40 ventas y lleva 28 a mitad de mes. ¿Qué porcentaje de avance tiene?', 70, 0.5, '28 dividido entre 40 es 0,70; es decir, 70 %.'],
        caso: 'Gloria descubre a fin de mes que tres vendedores no alcanzaron su meta, cuando ya no había tiempo para reaccionar.',
      },
      {
        nombre: 'Manejo de la desmotivación',
        ideas: [
          ['Desmotivación', 'Pérdida de interés o energía para el trabajo, que se refleja en menor esfuerzo y resultados.'],
          ['Causa raíz', 'Origen real de un problema, que suele estar detrás de los síntomas visibles.'],
          ['Acompañamiento', 'Apoyo cercano del líder para recuperar la confianza y el ritmo de trabajo.'],
        ],
        error: 'La mejor forma de enfrentar la desmotivación es aumentar la presión y las amenazas.',
        pasos: ['Detectar las señales', 'Conversar para encontrar la causa', 'Acordar apoyos concretos', 'Dar seguimiento cercano'],
        dato: ['Un vendedor pasó de 25 a 15 contactos semanales. ¿En qué porcentaje disminuyó su actividad?', 40, 0.5, 'La caída es 10 contactos; 10 dividido entre 25 es 0,40; es decir, 40 %.'],
        caso: 'Un vendedor con buenos resultados históricos dejó de asistir a las reuniones y redujo sus contactos a la mitad.',
      },
    ],
  },
];

export const semillasCur02: SemillaModulo[] = [
  {
    nombre: 'Planificación comercial',
    tim: 'Plan comercial trimestral de un equipo',
    temas: [
      {
        nombre: 'Análisis del mercado',
        ideas: [
          ['Análisis del mercado', 'Estudio de clientes, competidores y tendencias para tomar decisiones comerciales informadas.'],
          ['Segmento de clientes', 'Grupo de clientes con características y necesidades similares.'],
          ['Ventaja competitiva', 'Atributo que hace que el cliente prefiera una oferta frente a la de la competencia.'],
        ],
        error: 'Analizar el mercado no es necesario si el producto es bueno, porque se vende solo.',
        pasos: ['Recopilar información', 'Identificar segmentos', 'Analizar la competencia', 'Definir la ventaja competitiva'],
        dato: ['De 200 clientes potenciales, 60 pertenecen al segmento prioritario. ¿Qué porcentaje representan?', 30, 0.5, '60 dividido entre 200 es 0,30; es decir, 30 %.'],
        caso: 'La empresa de Felipe ofrece el mismo mensaje a todos los clientes y su tasa de respuesta es muy baja.',
      },
      {
        nombre: 'Definición de objetivos comerciales',
        ideas: [
          ['Objetivo comercial', 'Resultado de ventas o de clientes que la organización quiere alcanzar en un período.'],
          ['Cuota de venta', 'Parte del objetivo comercial asignada a cada vendedor o equipo.'],
          ['Objetivo de actividad', 'Meta de acciones previas a la venta, como visitas, llamadas o demostraciones.'],
        ],
        error: 'Basta con fijar el objetivo de ventas; las actividades previas no necesitan metas.',
        pasos: ['Revisar el histórico', 'Fijar el objetivo general', 'Distribuir las cuotas', 'Definir objetivos de actividad'],
        dato: ['Un objetivo trimestral de 9 000 USD se reparte en partes iguales entre 3 meses. ¿Cuánto corresponde a cada mes?', 3000, 0, '9 000 dividido entre 3 es igual a 3 000 USD.'],
        caso: 'El equipo de Natalia tiene una meta anual, pero no sabe cuántas visitas debe hacer cada semana para lograrla.',
      },
      {
        nombre: 'Presupuesto de ventas',
        ideas: [
          ['Presupuesto de ventas', 'Estimación de los ingresos esperados por producto, período y canal.'],
          ['Ticket promedio', 'Valor medio de cada venta, calculado como ingresos entre número de ventas.'],
          ['Estacionalidad', 'Variación de la demanda que se repite en determinadas épocas del año.'],
        ],
        error: 'El presupuesto de ventas debe ser igual todos los meses, aunque la demanda cambie.',
        pasos: ['Analizar ventas anteriores', 'Considerar la estacionalidad', 'Estimar volumen y ticket', 'Aprobar y comunicar el presupuesto'],
        dato: ['Un equipo vendió 12 000 USD en 80 ventas. ¿Cuál fue su ticket promedio en USD?', 150, 0, '12 000 dividido entre 80 es igual a 150 USD.'],
        caso: 'Ricardo proyecta las mismas ventas para diciembre y febrero, aunque históricamente diciembre duplica las ventas.',
      },
      {
        nombre: 'Canales de venta',
        ideas: [
          ['Canal de venta', 'Medio por el cual el producto llega al cliente, como venta directa, tienda o comercio digital.'],
          ['Venta directa', 'Venta realizada de persona a persona, con asesoría y relación cercana con el cliente.'],
          ['Omnicanalidad', 'Integración de varios canales para que el cliente tenga una experiencia continua.'],
        ],
        error: 'Usar varios canales de venta siempre genera competencia interna y debe evitarse.',
        pasos: ['Identificar dónde compra el cliente', 'Evaluar el costo de cada canal', 'Elegir la combinación de canales', 'Integrar la experiencia'],
        dato: ['De 500 ventas, 350 fueron por venta directa. ¿Qué porcentaje fue por otros canales?', 30, 0.5, '150 ventas por otros canales; 150 dividido entre 500 es 0,30; es decir, 30 %.'],
        caso: 'Los clientes de Verónica consultan por redes sociales, pero solo pueden comprar en reuniones presenciales.',
      },
      {
        nombre: 'Calendario comercial',
        ideas: [
          ['Calendario comercial', 'Planificación en el tiempo de campañas, lanzamientos y fechas clave de venta.'],
          ['Campaña', 'Conjunto de acciones comerciales con un objetivo, un mensaje y un período definidos.'],
          ['Hito', 'Fecha de control en la que se revisa el avance del plan comercial.'],
        ],
        error: 'Las campañas funcionan mejor si se improvisan unos días antes de la fecha clave.',
        pasos: ['Identificar fechas clave', 'Planificar campañas', 'Asignar responsables', 'Revisar en cada hito'],
        dato: ['Un trimestre de 13 semanas tiene un hito de control cada 4 semanas. ¿Cuántos hitos completos hay en el trimestre?', 3, 0, '13 dividido entre 4 da 3 hitos completos.'],
        caso: 'El equipo de Óscar se entera de las fechas de campaña con pocos días de anticipación y no logra prepararse.',
      },
    ],
  },
  {
    nombre: 'Gestión de equipos',
    tim: 'Propuesta de organización y desarrollo de un equipo',
    temas: [
      {
        nombre: 'Selección de talento comercial',
        ideas: [
          ['Perfil del puesto', 'Descripción de conocimientos, habilidades y actitudes que requiere un cargo.'],
          ['Entrevista por competencias', 'Entrevista que pide ejemplos reales de conductas pasadas para predecir el desempeño.'],
          ['Período de prueba', 'Etapa inicial en la que se verifica el ajuste entre la persona y el puesto.'],
        ],
        error: 'Para seleccionar vendedores basta con elegir a quien tenga más simpatía en la entrevista.',
        pasos: ['Definir el perfil del puesto', 'Convocar candidatos', 'Entrevistar por competencias', 'Evaluar en el período de prueba'],
        dato: ['De 40 postulantes, 8 pasan a la entrevista final. ¿Qué porcentaje llega a esa etapa?', 20, 0.5, '8 dividido entre 40 es 0,20; es decir, 20 %.'],
        caso: 'Martín incorpora personas por recomendación, sin entrevista, y la mitad deja el equipo antes de tres meses.',
      },
      {
        nombre: 'Inducción y entrenamiento',
        ideas: [
          ['Inducción', 'Proceso de bienvenida que presenta la organización, sus normas y la forma de trabajo.'],
          ['Entrenamiento en el puesto', 'Aprendizaje práctico acompañado por una persona con experiencia.'],
          ['Mentor', 'Persona experimentada que orienta y apoya el desarrollo de un nuevo integrante.'],
        ],
        error: 'Los vendedores nuevos aprenden mejor si se les deja solos desde el primer día.',
        pasos: ['Dar la bienvenida', 'Explicar productos y normas', 'Acompañar en campo', 'Evaluar el aprendizaje'],
        dato: ['Un programa de inducción dura 3 semanas de 5 días hábiles. ¿Cuántos días hábiles dura en total?', 15, 0, '3 semanas por 5 días es igual a 15 días.'],
        caso: 'Los nuevos integrantes del equipo de Laura salen a vender sin conocer los productos ni las políticas.',
      },
      {
        nombre: 'Delegación efectiva',
        ideas: [
          ['Delegación', 'Asignación de una tarea con la autoridad y los recursos necesarios para cumplirla.'],
          ['Responsabilidad final', 'Obligación del líder de responder por el resultado aunque haya delegado la tarea.'],
          ['Punto de control', 'Momento acordado para revisar el avance de una tarea delegada.'],
        ],
        error: 'Delegar significa desentenderse por completo de la tarea y de su resultado.',
        pasos: ['Elegir la tarea y la persona', 'Explicar el resultado esperado', 'Otorgar autoridad y recursos', 'Acordar puntos de control'],
        dato: ['Un líder dedica 40 horas semanales y delega tareas por 10 horas. ¿Qué porcentaje de su tiempo libera?', 25, 0.5, '10 dividido entre 40 es 0,25; es decir, 25 %.'],
        caso: 'Patricia hace personalmente todos los reportes y no tiene tiempo para acompañar a su equipo en campo.',
      },
      {
        nombre: 'Gestión de conflictos',
        ideas: [
          ['Conflicto', 'Desacuerdo entre personas o grupos por intereses, ideas o necesidades diferentes.'],
          ['Negociación colaborativa', 'Búsqueda de una solución en la que ambas partes satisfagan sus intereses principales.'],
          ['Mediación', 'Intervención de un tercero neutral que ayuda a las partes a encontrar un acuerdo.'],
        ],
        error: 'Los conflictos del equipo siempre deben evitarse y no hablarse para no empeorar el ambiente.',
        pasos: ['Escuchar a las partes', 'Identificar los intereses', 'Generar opciones', 'Acordar y dar seguimiento'],
        dato: ['De 10 conflictos atendidos en el año, 8 terminaron en acuerdo. ¿Qué porcentaje se resolvió?', 80, 0.5, '8 dividido entre 10 es 0,80; es decir, 80 %.'],
        caso: 'Dos vendedores del equipo de Iván discuten porque ambos atienden a los mismos clientes de una zona.',
      },
      {
        nombre: 'Desarrollo de nuevos líderes',
        ideas: [
          ['Plan de desarrollo', 'Ruta de aprendizaje y experiencias para preparar a una persona para mayores responsabilidades.'],
          ['Potencial', 'Capacidad de una persona para asumir funciones más complejas en el futuro.'],
          ['Sucesión', 'Preparación anticipada de reemplazos para posiciones clave del equipo.'],
        ],
        error: 'Formar nuevos líderes es un riesgo porque pueden ocupar el puesto de quien los formó.',
        pasos: ['Identificar el potencial', 'Diseñar el plan de desarrollo', 'Asignar retos progresivos', 'Evaluar la preparación'],
        dato: ['Un equipo de 25 personas quiere preparar 1 posible líder por cada 5 integrantes. ¿Cuántos líderes debe preparar?', 5, 0, '25 dividido entre 5 es igual a 5 líderes.'],
        caso: 'El equipo de Rocío crece, pero ella sigue siendo la única persona capaz de coordinar a los demás.',
      },
    ],
  },
  {
    nombre: 'Indicadores y seguimiento',
    tim: 'Tablero de indicadores para un equipo comercial',
    temas: [
      {
        nombre: 'Indicadores clave de ventas',
        ideas: [
          ['Indicador clave', 'Medida que refleja el avance hacia un objetivo estratégico y orienta decisiones.'],
          ['Indicador de resultado', 'Medida que muestra lo que ya ocurrió, como las ventas del mes.'],
          ['Indicador de actividad', 'Medida de las acciones que anticipan el resultado, como las visitas realizadas.'],
        ],
        error: 'Cuantos más indicadores se midan, mejor se gestiona el equipo, aunque nadie los revise.',
        pasos: ['Partir del objetivo', 'Elegir pocos indicadores', 'Definir la fórmula y la fuente', 'Revisarlos con frecuencia'],
        dato: ['Un equipo hizo 120 visitas y cerró 30 ventas. ¿Cuál es su tasa de cierre en porcentaje?', 25, 0.5, '30 dividido entre 120 es 0,25; es decir, 25 %.'],
        caso: 'Alberto recibe un reporte con 40 indicadores cada semana y no sabe cuáles requieren atención.',
      },
      {
        nombre: 'Embudo de ventas',
        ideas: [
          ['Embudo de ventas', 'Representación de las etapas por las que pasa un prospecto hasta convertirse en cliente.'],
          ['Tasa de conversión', 'Porcentaje de prospectos que avanza de una etapa del embudo a la siguiente.'],
          ['Cuello de botella', 'Etapa del embudo en la que se pierde una proporción alta de prospectos.'],
        ],
        error: 'Si el número de ventas baja, la única solución es conseguir más prospectos.',
        pasos: ['Definir las etapas', 'Medir cada etapa', 'Calcular las conversiones', 'Atacar el cuello de botella'],
        dato: ['De 80 demostraciones, 20 terminaron en venta. ¿Cuál es la tasa de conversión de esa etapa?', 25, 0.5, '20 dividido entre 80 es 0,25; es decir, 25 %.'],
        caso: 'El equipo de Mónica consigue muchas citas, pero muy pocas terminan en una propuesta formal.',
      },
      {
        nombre: 'Tablero de control',
        ideas: [
          ['Tablero de control', 'Vista que reúne los indicadores principales para revisar el desempeño de un vistazo.'],
          ['Semáforo', 'Código visual que indica si un indicador está en meta, en riesgo o fuera de meta.'],
          ['Frecuencia de actualización', 'Periodicidad con la que se renuevan los datos del tablero.'],
        ],
        error: 'Un tablero de control es útil aunque sus datos se actualicen solo una vez al año.',
        pasos: ['Elegir los indicadores', 'Definir metas y umbrales', 'Diseñar la vista', 'Actualizar y revisar'],
        dato: ['Un tablero tiene 8 indicadores y 6 están en verde. ¿Qué porcentaje está en meta?', 75, 0.5, '6 dividido entre 8 es 0,75; es decir, 75 %.'],
        caso: 'Sebastián revisa los resultados en hojas separadas y tarda horas en preparar cada reunión de seguimiento.',
      },
      {
        nombre: 'Análisis de desviaciones',
        ideas: [
          ['Desviación', 'Diferencia entre el resultado obtenido y la meta o el presupuesto esperado.'],
          ['Análisis de causas', 'Revisión ordenada de los factores que explican una desviación.'],
          ['Acción correctiva', 'Medida que se toma para eliminar la causa de una desviación y evitar que se repita.'],
        ],
        error: 'Las desviaciones negativas se corrigen solas en el siguiente período sin necesidad de analizarlas.',
        pasos: ['Comparar resultado y meta', 'Cuantificar la desviación', 'Analizar las causas', 'Definir acciones correctivas'],
        dato: ['La meta era 10 000 USD y se vendieron 8 500 USD. ¿Cuál es la desviación en USD?', 1500, 0, '10 000 menos 8 500 es igual a 1 500 USD por debajo de la meta.'],
        caso: 'El equipo de Adriana quedó por debajo de la meta tres meses seguidos y cada vez se dio una explicación distinta.',
      },
      {
        nombre: 'Mejora continua',
        ideas: [
          ['Mejora continua', 'Práctica de revisar y perfeccionar los procesos de forma permanente y gradual.'],
          ['Ciclo PHVA', 'Método de mejora que consiste en planificar, hacer, verificar y actuar.'],
          ['Lección aprendida', 'Conocimiento obtenido de una experiencia que se documenta para aplicarlo en el futuro.'],
        ],
        error: 'Cuando un proceso funciona, cualquier intento de mejora es una pérdida de tiempo.',
        pasos: ['Planificar la mejora', 'Ejecutar la prueba', 'Verificar los resultados', 'Actuar y estandarizar'],
        dato: ['Un proceso de registro tomaba 20 minutos y ahora toma 15. ¿En qué porcentaje se redujo el tiempo?', 25, 0.5, 'La reducción es de 5 minutos; 5 dividido entre 20 es 0,25; es decir, 25 %.'],
        caso: 'El equipo de Gustavo repite cada campaña los mismos errores porque nunca revisa lo que salió mal.',
      },
    ],
  },
];

export const semillasCur03: SemillaModulo[] = [
  {
    nombre: 'Presencia digital',
    tim: 'Diagnóstico de la presencia digital de un vendedor',
    temas: [
      {
        nombre: 'Marca personal en redes',
        ideas: [
          ['Marca personal', 'Percepción que otras personas tienen de alguien a partir de lo que comunica y de cómo actúa.'],
          ['Propuesta de valor personal', 'Mensaje que explica qué problema resuelve una persona y por qué elegirla.'],
          ['Coherencia de perfil', 'Uso de la misma imagen, tono y mensaje en todas las redes donde se tiene presencia.'],
        ],
        error: 'Para construir marca personal hay que publicar todo el tiempo sobre cualquier tema.',
        pasos: ['Definir la propuesta de valor', 'Elegir las redes', 'Unificar la imagen del perfil', 'Publicar con constancia'],
        dato: ['Un perfil pasó de 400 a 500 seguidores en un mes. ¿En qué porcentaje creció?', 25, 0.5, 'Creció 100 seguidores; 100 dividido entre 400 es 0,25; es decir, 25 %.'],
        caso: 'Valeria usa una foto distinta y un mensaje diferente en cada red, y sus contactos no saben a qué se dedica.',
      },
      {
        nombre: 'Contenido de valor',
        ideas: [
          ['Contenido de valor', 'Publicación que enseña, resuelve una duda o inspira al público, sin limitarse a vender.'],
          ['Regla 80/20 del contenido', 'Criterio de dedicar la mayoría de las publicaciones a aportar valor y una minoría a ofertas.'],
          ['Formato', 'Forma que toma un contenido, como texto, imagen, video corto o transmisión en vivo.'],
        ],
        error: 'Las redes sociales solo sirven para publicar precios y ofertas todos los días.',
        pasos: ['Conocer las dudas del cliente', 'Planificar temas', 'Elegir el formato', 'Medir la respuesta'],
        dato: ['Si se publican 20 contenidos al mes siguiendo la regla 80/20, ¿cuántos deberían ser de valor?', 16, 0, 'El 80 % de 20 es igual a 16 contenidos.'],
        caso: 'Las publicaciones de Pablo son solo anuncios de productos y casi nadie interactúa con ellas.',
      },
      {
        nombre: 'Calendario de publicaciones',
        ideas: [
          ['Calendario de publicaciones', 'Plan que define qué se publica, en qué red y en qué fecha.'],
          ['Frecuencia', 'Cantidad de publicaciones por período que se puede sostener con calidad.'],
          ['Horario de mayor alcance', 'Franja en la que la audiencia está más activa y ve más publicaciones.'],
        ],
        error: 'Publicar muchas veces en un solo día y luego desaparecer semanas da los mismos resultados que ser constante.',
        pasos: ['Definir la frecuencia', 'Asignar temas por fecha', 'Preparar el contenido', 'Programar y revisar'],
        dato: ['Un plan contempla 3 publicaciones por semana durante 4 semanas. ¿Cuántas publicaciones hay en el mes?', 12, 0, '3 publicaciones por 4 semanas es igual a 12.'],
        caso: 'Camila publica solo cuando tiene tiempo libre, y su alcance sube y baja sin control.',
      },
      {
        nombre: 'Métricas de redes sociales',
        ideas: [
          ['Alcance', 'Número de personas distintas que vieron una publicación.'],
          ['Interacción', 'Acciones del público sobre una publicación, como comentarios, reacciones o compartidos.'],
          ['Tasa de interacción', 'Porcentaje que resulta de dividir las interacciones entre el alcance.'],
        ],
        error: 'El número de seguidores es la única métrica que importa para vender en redes.',
        pasos: ['Definir el objetivo', 'Elegir las métricas', 'Registrar los datos', 'Ajustar el contenido'],
        dato: ['Una publicación alcanzó a 2 000 personas y obtuvo 100 interacciones. ¿Cuál es la tasa de interacción?', 5, 0.1, '100 dividido entre 2 000 es 0,05; es decir, 5 %.'],
        caso: 'Ernesto compró seguidores para su perfil, pero sus publicaciones siguen sin comentarios ni consultas.',
      },
      {
        nombre: 'Reputación en línea',
        ideas: [
          ['Reputación en línea', 'Opinión colectiva sobre una persona o marca formada a partir de lo que se dice en internet.'],
          ['Reseña', 'Opinión publicada por un cliente sobre su experiencia con un producto o servicio.'],
          ['Respuesta pública', 'Contestación visible a un comentario, que muestra a todos cómo se atiende al cliente.'],
        ],
        error: 'Los comentarios negativos deben borrarse siempre para proteger la reputación.',
        pasos: ['Monitorear las menciones', 'Responder con respeto', 'Resolver en privado', 'Pedir reseñas a clientes satisfechos'],
        dato: ['Un perfil tiene 45 reseñas positivas de un total de 50. ¿Qué porcentaje es positivo?', 90, 0.5, '45 dividido entre 50 es 0,90; es decir, 90 %.'],
        caso: 'Un cliente molesto comentó en una publicación de Beatriz que su pedido llegó incompleto.',
      },
    ],
  },
  {
    nombre: 'Embudo y conversión',
    tim: 'Diseño de un embudo de ventas digital',
    temas: [
      {
        nombre: 'Atracción de prospectos',
        ideas: [
          ['Prospecto', 'Persona que muestra interés y podría convertirse en cliente.'],
          ['Imán de prospectos', 'Recurso gratuito y útil que se ofrece a cambio de los datos de contacto.'],
          ['Público objetivo', 'Grupo de personas al que se dirige una acción de atracción.'],
        ],
        error: 'Conviene atraer a la mayor cantidad de personas posible, sin importar si les interesa el producto.',
        pasos: ['Definir el público objetivo', 'Crear un imán de prospectos', 'Difundirlo', 'Registrar los contactos'],
        dato: ['Una guía gratuita fue vista por 1 000 personas y 150 dejaron sus datos. ¿Qué porcentaje se registró?', 15, 0.5, '150 dividido entre 1 000 es 0,15; es decir, 15 %.'],
        caso: 'Rodrigo sortea premios muy atractivos, pero los participantes no tienen interés en sus productos.',
      },
      {
        nombre: 'Páginas de captura',
        ideas: [
          ['Página de captura', 'Página diseñada con un solo objetivo: obtener los datos de contacto del visitante.'],
          ['Formulario breve', 'Formulario que pide solo los datos indispensables para no desanimar al visitante.'],
          ['Consentimiento', 'Autorización expresa de la persona para que se usen sus datos con un fin determinado.'],
        ],
        error: 'Una página de captura funciona mejor si pide la mayor cantidad posible de datos personales.',
        pasos: ['Definir la oferta', 'Redactar el titular', 'Diseñar un formulario breve', 'Solicitar el consentimiento'],
        dato: ['Una página recibió 400 visitas y 60 personas completaron el formulario. ¿Cuál es su tasa de conversión?', 15, 0.5, '60 dividido entre 400 es 0,15; es decir, 15 %.'],
        caso: 'El formulario de Luciana pide 14 datos y la mayoría de visitantes lo abandona antes de terminar.',
      },
      {
        nombre: 'Seguimiento por mensajería',
        ideas: [
          ['Seguimiento', 'Contacto posterior con un prospecto para resolver dudas y acercarlo a la compra.'],
          ['Secuencia de mensajes', 'Serie planificada de mensajes que se envían en intervalos definidos.'],
          ['Personalización', 'Adaptación del mensaje a los datos y necesidades de cada prospecto.'],
        ],
        error: 'Enviar el mismo mensaje varias veces al día aumenta las ventas por insistencia.',
        pasos: ['Agradecer el registro', 'Enviar contenido útil', 'Resolver dudas', 'Presentar la oferta'],
        dato: ['Una secuencia tiene 5 mensajes enviados cada 2 días a partir del día 0. ¿En qué día se envía el último mensaje?', 8, 0, 'Los mensajes salen los días 0, 2, 4, 6 y 8.'],
        caso: 'Andrea escribe a sus prospectos una vez y, si no responden, nunca vuelve a contactarlos.',
      },
      {
        nombre: 'Cierre de ventas en línea',
        ideas: [
          ['Cierre', 'Momento en el que el prospecto toma la decisión de compra.'],
          ['Objeción', 'Duda o preocupación del cliente que frena la decisión de compra.'],
          ['Urgencia legítima', 'Motivo real y verificable para decidir pronto, como una fecha de inicio o un cupo limitado.'],
        ],
        error: 'Inventar plazos falsos es una buena técnica de cierre porque presiona al cliente.',
        pasos: ['Confirmar la necesidad', 'Responder las objeciones', 'Presentar la propuesta', 'Facilitar el pago'],
        dato: ['De 50 prospectos que pidieron precio, 15 compraron. ¿Cuál es la tasa de cierre?', 30, 0.5, '15 dividido entre 50 es 0,30; es decir, 30 %.'],
        caso: 'Los prospectos de Fernando preguntan el precio, reciben la cifra y dejan de responder.',
      },
      {
        nombre: 'Optimización de la conversión',
        ideas: [
          ['Optimización de la conversión', 'Mejora sistemática de cada paso para que más visitantes completen la acción deseada.'],
          ['Prueba A/B', 'Comparación de dos versiones de un elemento para saber cuál funciona mejor.'],
          ['Variable de prueba', 'Elemento único que se cambia entre las versiones de una prueba.'],
        ],
        error: 'En una prueba A/B conviene cambiar muchos elementos a la vez para obtener resultados más rápido.',
        pasos: ['Formular una hipótesis', 'Cambiar una sola variable', 'Medir ambas versiones', 'Implementar la ganadora'],
        dato: ['La versión A convierte 8 % y la versión B 10 %. ¿Cuántos puntos porcentuales mejora B?', 2, 0, '10 menos 8 es igual a 2 puntos porcentuales.'],
        caso: 'Germán cambió el título, el color y el precio de su página al mismo tiempo y no sabe qué produjo la mejora.',
      },
    ],
  },
  {
    nombre: 'Atención y fidelización digital',
    tim: 'Plan de atención y fidelización de clientes digitales',
    temas: [
      {
        nombre: 'Experiencia del cliente digital',
        ideas: [
          ['Experiencia del cliente', 'Percepción global que forma el cliente en todos sus contactos con una marca.'],
          ['Punto de contacto', 'Momento en el que el cliente interactúa con la marca, como un mensaje o una entrega.'],
          ['Mapa del recorrido', 'Representación de las etapas y emociones del cliente desde que conoce la oferta hasta después de comprar.'],
        ],
        error: 'La experiencia del cliente termina en el momento en que paga su compra.',
        pasos: ['Identificar los puntos de contacto', 'Mapear el recorrido', 'Detectar fricciones', 'Mejorar los momentos críticos'],
        dato: ['Un recorrido tiene 10 puntos de contacto y 3 presentan quejas frecuentes. ¿Qué porcentaje presenta problemas?', 30, 0.5, '3 dividido entre 10 es 0,30; es decir, 30 %.'],
        caso: 'Los clientes de Silvia elogian la atención antes de comprar, pero se quejan de no recibir información de su envío.',
      },
      {
        nombre: 'Atención por canales digitales',
        ideas: [
          ['Tiempo de respuesta', 'Tiempo que transcurre entre la consulta del cliente y la primera respuesta.'],
          ['Respuesta predefinida', 'Texto preparado para preguntas frecuentes, que se personaliza antes de enviarlo.'],
          ['Escalamiento', 'Derivación de un caso a otra persona con mayor autoridad o conocimiento.'],
        ],
        error: 'Responder un mensaje después de varios días no afecta la percepción del cliente.',
        pasos: ['Recibir la consulta', 'Responder con prontitud', 'Resolver o escalar', 'Confirmar la solución'],
        dato: ['Se respondieron 48 consultas en un total de 96 minutos. ¿Cuál fue el tiempo promedio por consulta en minutos?', 2, 0, '96 dividido entre 48 es igual a 2 minutos.'],
        caso: 'Las consultas que llegan a Manuel por mensajería se acumulan y algunas se responden una semana después.',
      },
      {
        nombre: 'Posventa y recompra',
        ideas: [
          ['Posventa', 'Acompañamiento al cliente después de la compra para asegurar el buen uso y la satisfacción.'],
          ['Recompra', 'Nueva compra que realiza un cliente que ya compró antes.'],
          ['Tasa de recompra', 'Porcentaje de clientes que vuelve a comprar en un período determinado.'],
        ],
        error: 'Conseguir clientes nuevos siempre es más barato que lograr que los actuales vuelvan a comprar.',
        pasos: ['Confirmar la entrega', 'Verificar la satisfacción', 'Ofrecer contenido de uso', 'Proponer la recompra en el momento adecuado'],
        dato: ['De 200 clientes, 50 volvieron a comprar en el trimestre. ¿Cuál es la tasa de recompra?', 25, 0.5, '50 dividido entre 200 es 0,25; es decir, 25 %.'],
        caso: 'Claudia pierde contacto con sus clientes después de la primera venta y casi ninguno vuelve a comprar.',
      },
      {
        nombre: 'Programas de fidelización',
        ideas: [
          ['Fidelización', 'Conjunto de acciones para que el cliente prefiera de forma sostenida a una marca.'],
          ['Programa de puntos', 'Sistema que premia compras o acciones con puntos canjeables por beneficios.'],
          ['Beneficio exclusivo', 'Ventaja reservada para clientes frecuentes, como acceso anticipado o asesoría especial.'],
        ],
        error: 'Un programa de fidelización consiste solo en dar descuentos a todos los clientes por igual.',
        pasos: ['Segmentar a los clientes', 'Definir los beneficios', 'Comunicar el programa', 'Medir la permanencia'],
        dato: ['Un programa otorga 1 punto por cada 10 USD. ¿Cuántos puntos gana una compra de 250 USD?', 25, 0, '250 dividido entre 10 es igual a 25 puntos.'],
        caso: 'Los clientes frecuentes de Esteban reciben los mismos beneficios que quien compra por primera vez.',
      },
      {
        nombre: 'Medición de la satisfacción',
        ideas: [
          ['Encuesta de satisfacción', 'Instrumento breve para conocer la opinión del cliente sobre su experiencia.'],
          ['Índice de recomendación', 'Indicador que mide la disposición del cliente a recomendar la marca a otras personas.'],
          ['Ciclo de respuesta', 'Práctica de contactar al cliente insatisfecho para entender y resolver su caso.'],
        ],
        error: 'Medir la satisfacción no sirve de nada si no se pueden cambiar los productos.',
        pasos: ['Diseñar la encuesta', 'Enviarla en el momento oportuno', 'Analizar los resultados', 'Cerrar el ciclo con el cliente'],
        dato: ['De 80 encuestas respondidas, 60 clientes se declaran satisfechos. ¿Qué porcentaje es?', 75, 0.5, '60 dividido entre 80 es 0,75; es decir, 75 %.'],
        caso: 'Antonia envía encuestas a sus clientes, pero nunca revisa las respuestas ni contacta a quienes se quejaron.',
      },
    ],
  },
];
