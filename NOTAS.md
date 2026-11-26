# Notas de desarrollo: decisiones, verificación y pendientes

## 1. Decisiones principales

| Decisión | Por qué |
|---|---|
| Reconstruir en HTML/CSS/JS puros (no reutilizar el código de Lovable) | La versión anterior es React compilado: el código publicado es un bundle minificado, no editable. El brief pide HTML editable e independiente de la herramienta de IA. |
| Conservar logo, colores (azul marino #01172B + verde #64B000) y tipografías (Archivo + Manrope) | Continuidad de marca con lo ya aprobado. |
| Equitorq **comercializa**; Equimotors es el **respaldo técnico** | La versión anterior decía "somos fabricantes", lo que no es correcto según el brief. |
| Productos: núcleo de torque y tensado + complementarios en una mención breve | El brief define a Equitorq como especialista en torque y tensado controlado. |
| Mostrar **rangos por línea**, no tablas completas | Las tablas del catálogo tienen errores (ver sección 3); los rangos son verificables y la ficha exacta se entrega con la cotización. |
| Nombres genéricos ("Llave hidráulica de cuadrante") en vez de códigos de modelo | Los códigos (MXTA, LOW, KEM, PTG…) identifican al fabricante. |
| Formulario corto que abre WhatsApp o correo | La versión anterior tenía ~400 casillas de modelos. Sin servidor = cero mantenimiento. |
| Sin chatbot | Fuera de alcance según el brief. |
| Imágenes WebP optimizadas | La versión anterior cargaba ~9,5 MB en PNG; ahora ~0,8 MB. |

## 2. Fuentes y verificación de cada dato publicado

- **Catálogo PDF del fabricante:** rangos de torque, precisión, presiones, medidas de pernos y características de cada línea. Cada cifra publicada se cotejó contra la tabla del modelo mínimo y máximo de su serie.
- **equimotors.com:** "especialista en torque", desde 1989, sucursales (Santa Cruz, Cochabamba, La Paz), direcciones y servicios (bridado, capacitación, arriendo, laboratorio de calibración, pruebas de presión, mantenimiento).
- **Landing anterior:** logo, imágenes rebrandeadas, correo info@equitorq.com y WhatsApp +591 77970987.
- **Buena práctica de apriete (30 % → 60 % → 100 % en cruz + pasada final):** catálogo, sección de operación correcta.

**No se publicó** (información del fabricante o no comprobable para Equitorq): ISO 9001, CE, patentes, "No. 1 en China", cotización en bolsa, clientes, cantidad de proyectos, precios.

## 3. Datos incoherentes detectados en el catálogo

Verificados con un script que compara cada fila de las tablas presión–torque (el torque debe crecer de forma lineal con la presión).

**Llave de cuadrante (tabla MPa / N·m)**
- 5MXTA a 11 MPa: dice 7782 → debería ser ≈ 1183
- 15MXTA a 38 MPa: dice 11934 → ≈ 11198
- 3MXTA a 41 MPa: dice 2634 → ≈ 2643

**Llave de cuadrante (tabla psi / ft·lbs)**
- 3MXTA a 1400 psi: 159 → ≈ 459 · 10MXTA a 4400 psi: 1959 → ≈ 4960
- 07MXTA a 5600 psi: 155 → ≈ 454 · 8MXTA a 5600 psi: 1385 → ≈ 4385
- 20MXTA a 9000 psi: 17133 → ≈ 17433 · falta la columna del 15MXTA

**Llave hueca LOW**
- La fila "36 MPa" aparece dos veces (la primera debería ser 35 y sus valores no cuadran)
- 30LOW a 47 MPa: "2812i" (errata) · 4LOW a 65 MPa: 5110 → ≈ 5440 · 8LOW a 65 MPa: 10169 → ≈ 10160
- Rango A/F del 30LOW: 150–175 en una tabla y 160–175 en otra (se publicó 19–175 mm)

**Otras**
- LOW-CP: 3LOW-CP con rango 475–3327 (en el resto el máximo es 10× el mínimo); "32LOW-CP" en vez de 30LOW-CP; pesos distintos a la serie LOW
- Tabla de cabezales: "14HTW-UT" repetido (el segundo debería ser 18)
- MINI: "MIN1-3" (errata); largo del MINI-5 = 119,5 mm, incoherente con sus vecinos
- Neumática PTG-15: diámetro 800 mm (imposible; probable 80)
- Página neumática mezcla textos de la llave eléctrica para eólica
- Tensores HTE-M36-FD3 y FD19: la fuerza no corresponde a presión × área
- HTA48: medida A = 114 mm, menor que la del modelo anterior
- Tabla de torque recomendado: M18 grado 8.8 = 39 kgf·m ≠ 284 N·m; en M85 el grado 8.8 supera al 10.9
- Notas de aflojado contradictorias: "1,5–2 veces" y "aprox. 2,5 veces" el torque de apriete
- Bombas manuales: "2MH0P80", presiones de la serie 16MHP inconsistentes, volumen útil 1,44–5,8 L contra tanques de 300–450 cm³

## 4. Pendientes de confirmar con el cliente

- Dominio final (actualizar `canonical` y datos estructurados).
- ¿El WhatsApp +591 77970987 y info@equitorq.com son los definitivos?
- Teléfono y dirección de La Paz a mostrar (se dejó "atención comercial y técnica").
- Confirmar que la etiqueta "CE" que aparece en la foto rebrandeada de la llave a batería está respaldada; si no, editar la imagen.
- Fotos propias de tensores, tuercas hidráulicas y bombas (las actuales salen del catálogo y no tienen marca visible).
- Fichas técnicas corregidas por modelo para adjuntar en cotizaciones.
- Redes sociales propias de Equitorq (si existen) para el pie de página.

## 5. Etapa futura (fuera de esta entrega)

- Chatbot / asistente de IA para preselección de equipos.
- Formulario con recepción en servidor (CRM o correo) y analítica de conversiones.
- Páginas por producto con fichas descargables.

## 6. Cambios de la fase 2a (25 nov 2026)

- Hero explicativo (sin cifras ni mención a Equimotors); se usa "tensionadores" en todo el sitio.
- "Por qué importa" pasó a "¿Por qué elegir Equitorq?" (6 razones; sin afirmar que son fabricantes).
- Aplicaciones en 4 tarjetas con imagen. **Pendientes:** fotos reales de Minería (`assets/img/apl-mineria.webp`) e Industria y mantenimiento (`assets/img/apl-industria-mantenimiento.webp`); hoy son fondos neutros que se reemplazan con solo copiar el archivo con ese nombre (800×600 px).
- Respaldo simplificado (solo enlace a Equimotors); se quitó la sección de buena práctica de apriete (es servicio de Equimotors).
- Formulario: WhatsApp oficial +591 77970987, correo opcional, país y ciudad; el adjunto se pide por el mismo chat (WhatsApp/correo no permiten adjuntar desde un enlace). La selección múltiple de equipos llega con el catálogo (fase 2b).
- Pie de página reorganizado (Productos, Aplicaciones, Soluciones, Preguntas | Respaldo, Contacto).
- Sin tocar: "Cómo trabajamos" y Preguntas frecuentes siguen mencionando a Equimotors; confirmar con Rafael si deben quedar.


## 7. Fase 2b: catálogo completo (25 nov 2026)

- 47 series y 616 modelos, 7 familias: Llaves de torque (Hidráulicas, Eléctricas, Neumáticas), Tensionadores, Cilindros (Uso general, Bajo perfil, Huecos, Aluminio, Alto tonelaje, Gatos de garra), Extractores, Separadores, Bombas y Accesorios (Dados, Cabezales y reductores, Adaptadores de manómetro).
- Códigos EQ- con letras primero y números después (EQ-MXTA-07). La correspondencia con los códigos originales está solo en `catalogo-data/interno/` y no se publica.
- Los datos salen de `catalogo-data/series.json` y `catalogo-data/modelos/*.json`, convertidos a archivos `.js` livianos (se cargan solo al abrir cada serie, y funcionan también abriendo el HTML con doble clic).
- 67 correcciones de datos documentadas en `catalogo-data/correcciones.csv` (36 de confianza alta, 28 media, 3 baja). Las de confianza baja y las anomalías sin base están en `catalogo-data/revisar.md` para validación del proveedor.
- Pendientes de material gráfico (ver `catalogo-data/imagenes/pendientes.md`): EQ-GA sin imagen; 9 series sin dibujo de cotas (HTE, HN y bombas, salvo MHP); foto de los extractores de 2 garras por confirmar; SMC y HTW-UT con fotos de baja resolución.
- Cuatro bombas (HP, REP, HPG, EBH) no figuran en el PDF y se tomaron de la web secundaria.
- Se retiraron de `assets/img/` las 17 imágenes de la primera versión que ya no se usan (quedan en `_trabajo/imagenes-anteriores/`).
