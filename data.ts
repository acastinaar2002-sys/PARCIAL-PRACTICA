
import { Module, InteractiveCase, Flashcard } from './types';

export interface TrueFalseQuestion {
  id: string;
  statement: string;
  isTrue: boolean;
  explanation: string;
}

export const TRUE_FALSE_QUESTIONS: TrueFalseQuestion[] = [
  {
    id: "tf-1",
    statement: "Un 'Atributo' se define como la ausencia de datos duplicados.",
    isTrue: false,
    explanation: "Falso. La ausencia de duplicados se conoce como Unicidad. Un atributo es una característica de una entidad."
  },
  {
    id: "tf-2",
    statement: "La 'Tabla' es una estructura que almacena datos en filas y columnas.",
    isTrue: true,
    explanation: "Verdadero. Es la unidad básica de almacenamiento en el modelo relacional."
  },
  {
    id: "tf-3",
    statement: "La 1FN elimina valores múltiples y exige que los datos sean atómicos.",
    isTrue: true,
    explanation: "Verdadero. La atomicidad es el pilar de la primera forma normal."
  },
  {
    id: "tf-4",
    statement: "Un SGBD se define técnicamente como un atributo que referencia a otra tabla.",
    isTrue: false,
    explanation: "Falso. Eso describe una Llave Foránea (FK). El SGBD es el software gestor completo."
  }
];

export const FINAL_EXAM_QUESTIONS: InteractiveCase[] = [
  {
    id: "fe-1",
    title: "Dato vs Información",
    scenario: "En un sistema aparece el valor '1500'. Luego se procesa y muestra: 'Salario mensual: 1500'.",
    question: "¿Cuál es la diferencia fundamental?",
    options: ["El dato es aislado; la información es dato con contexto y significado", "Son lo mismo", "La información no necesita contexto", "El dato es un conjunto de información"],
    correctAnswer: 0,
    explanation: "El dato es una representación simbólica aislada, mientras que la información tiene sentido y utilidad."
  },
  {
    id: "fe-2",
    title: "Integridad Referencial",
    scenario: "Un usuario intenta eliminar un registro de la tabla 'Clientes' pero el sistema lo impide porque existen 'Pedidos' vinculados.",
    question: "¿Qué problema evita esta regla de integridad?",
    options: ["Duplicidad de datos", "Datos huérfanos", "Falta de atomicidad", "Dependencia parcial"],
    correctAnswer: 1,
    explanation: "La integridad referencial garantiza que no queden datos huérfanos."
  }
];

export const MODULES: Module[] = [
  {
    id: 1,
    unit: "UNIDAD I",
    title: "Fundamentos y SGBD",
    color: "blue",
    cards: [
      { id: "1-1", type: "definition", front: "¿Qué es un DATO?", back: "Representación simbólica aislada sin significado propio." },
      { id: "1-2", type: "definition", front: "¿Qué es INFORMACIÓN?", back: "Conjunto de datos organizados con contexto y utilidad." },
      { id: "1-3", type: "exam", front: "¿Qué componente del SGBD procesa las consultas?", back: "El Motor de Base de Datos." },
      { id: "1-4", type: "exam", front: "¿Qué nivel de abstracción describe cómo se guardan los datos en el disco?", back: "El Nivel Físico." },
      { id: "1-5", type: "exam", front: "¿Qué criterio de calidad mide si los datos están completos?", back: "Completitud." },
      { id: "1-6", type: "exam", front: "¿Cuál es el rol responsable de la seguridad y backups?", back: "DBA (Database Administrator)." },
      { id: "1-7", type: "exam", front: "¿Qué propiedad garantiza que una transacción se haga 'todo o nada'?", back: "Atomicidad." },
      { id: "1-8", type: "definition", front: "SGBD / DBMS", back: "Software gestor que controla la creación y acceso a la BD." }
    ],
    interactiveCases: [
      {
        id: "ic-1-1",
        title: "Reto de Calidad",
        scenario: "En una tabla de usuarios, descubres que existen tres registros con el mismo DNI.",
        question: "¿Qué criterio de calidad de datos se está violando?",
        options: ["Completitud", "Unicidad e Integridad", "Actualidad", "Accesibilidad"],
        correctAnswer: 1,
        explanation: "La Unicidad exige que no haya duplicados para una misma llave."
      }
    ]
  },
  {
    id: 2,
    unit: "UNIDAD II",
    title: "Modelo E-R",
    color: "amber",
    cards: [
      { id: "2-1", type: "definition", front: "Modelo E-R", back: "Representación gráfica de entidades y sus relaciones." },
      { id: "2-2", type: "exam", front: "¿Qué figura geométrica representa una Relación?", back: "El Rombo." },
      { id: "2-3", type: "exam", front: "¿Cómo se identifica un Atributo Llave Primaria en un diagrama?", back: "Con un Óvalo subrayado." },
      { id: "2-4", type: "exam", front: "¿Qué cardinalidad indica que un registro se vincula con muchos otros?", back: "1:N (Uno a Muchos)." },
      { id: "2-5", type: "exam", front: "¿Qué es un Atributo Derivado?", back: "Aquel que se calcula de otros (ej: Edad desde Fecha de Nacimiento)." },
      { id: "2-6", type: "exam", front: "¿Cómo se resuelve una relación N:N?", back: "Creando una tabla intermedia con llaves foráneas." }
    ],
    interactiveCases: [
      {
        id: "ic-2-1",
        title: "Análisis E-R",
        scenario: "Un médico atiende muchas citas, pero una cita pertenece a un solo médico.",
        question: "¿Cuál es la cardinalidad?",
        options: ["1:1", "1:N", "N:N", "N:1"],
        correctAnswer: 1,
        explanation: "Es 1:N porque un origen tiene múltiples destinos vinculados."
      }
    ]
  },
  {
    id: 3,
    unit: "UNIDAD III",
    title: "Normalización y 3FN",
    color: "red",
    cards: [
      { id: "3-1", type: "definition", front: "Normalización", back: "Proceso para organizar datos y reducir redundancia." },
      { id: "3-2", type: "exam", front: "¿Qué exige la 1FN?", back: "Atomicidad de los datos (un valor por celda) y eliminar grupos repetidos." },
      { id: "3-3", type: "exam", front: "¿Qué se busca eliminar en la 2FN?", back: "Las dependencias parciales de la llave primaria." },
      { id: "3-4", type: "exam", front: "¿Qué se busca eliminar en la 3FN?", back: "Las dependencias transitivas entre atributos no clave." },
      { id: "3-5", type: "exam", front: "¿Qué es una Llave Foránea (FK)?", back: "Atributo que referencia la PK de otra tabla para crear un vínculo." },
      { id: "3-6", type: "exam", front: "¿Qué ocurre si borras un padre con hijos en Integridad Referencial?", back: "El sistema bloquea la acción para evitar datos huérfanos." }
    ]
  },
  {
    id: 4,
    unit: "EXTRA",
    title: "Diccionario de Entidades",
    color: "purple",
    cards: [
      { id: "4-1", type: "practical", front: "Entidad: PACIENTE (Hospital)", back: "Atributos: ID_Pac (PK), Nombre, NSS, Fecha_Nac, Tipo_Sangre." },
      { id: "4-2", type: "practical", front: "Entidad: VEHÍCULO (Taller)", back: "Atributos: Placa (PK), Marca, Modelo, Color, Año, Nro_Chasis." },
      { id: "4-3", type: "practical", front: "Entidad: PRODUCTO (E-commerce)", back: "Atributos: ID_Prod (PK), Nombre, Precio, Stock, Categoría, Proveedor." },
      { id: "4-4", type: "practical", front: "Entidad: VUELO (Aerolínea)", back: "Atributos: Cod_Vuelo (PK), Origen, Destino, Hora_Salida, Capacidad." },
      { id: "4-5", type: "practical", front: "Entidad: CURSO (Universidad)", back: "Atributos: ID_Curso (PK), Nombre_Curso, Créditos, Semestre, Facultad." },
      { id: "4-6", type: "practical", front: "Entidad: FACTURA (Ventas)", back: "Atributos: Nro_Fact (PK), Fecha, Total_Sin_IVA, IVA, Cliente_FK." },
      { id: "4-7", type: "practical", front: "Entidad: EMPLEADO (Nómina)", back: "Atributos: ID_Emp (PK), CURP, Puesto, Salario_Base, Fecha_Ingreso." },
      { id: "4-8", type: "practical", front: "Entidad: HABITACIÓN (Hotel)", back: "Atributos: Nro_Hab (PK), Tipo (Suite/Simple), Piso, Precio_Noche, Estado." },
      { id: "4-9", type: "practical", front: "Entidad: PEDIDO (Delivery)", back: "Atributos: ID_Ped (PK), Fecha_Hora, Direccion_Entrega, Estado_Pago." },
      { id: "4-10", type: "practical", front: "Entidad: AUTOR (Librería)", back: "Atributos: ID_Aut (PK), Nombre, Nacionalidad, Fecha_Defuncion." }
    ],
    interactiveCases: [
      {
        id: "ic-4-1",
        title: "Reto de Modelado",
        scenario: "Debes modelar una 'Inscripción' donde un alumno se anota a una materia en un año específico.",
        question: "¿Qué tipo de entidad sería 'Inscripción'?",
        options: ["Entidad Fuerte", "Atributo Simple", "Entidad de Relación (Intermedia)", "Atributo Derivado"],
        correctAnswer: 2,
        explanation: "Las inscripciones vinculan dos entidades fuertes (Alumno y Materia), por lo que suelen ser tablas intermedias."
      }
    ]
  }
];
