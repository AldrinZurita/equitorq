# Landing page Equitorq

Landing page estática en **HTML, CSS y JavaScript puros**. No usa frameworks, no necesita compilarse y no depende de ninguna herramienta de IA para funcionar ni para editarse.

## Estructura

```
landing-equitorq/
├── index.html              ← todo el contenido (textos, productos, FAQ, contacto)
├── README.md               ← este archivo
├── NOTAS.md                ← decisiones, datos corregidos y pendientes de confirmar
└── assets/
    ├── css/styles.css      ← estilos; colores y tipografías en :root (inicio del archivo)
    ├── js/main.js          ← menú móvil, filtro de productos, formulario a WhatsApp/correo
    └── img/                ← imágenes optimizadas en WebP (≈ 0,8 MB en total)
```

## Ver la página en local

Abra `index.html` con doble clic en cualquier navegador. Opcionalmente, para simular un servidor:

```bash
# dentro de la carpeta landing-equitorq
python -m http.server 8000
# luego abrir http://localhost:8000
```

## Publicar en el hosting del dominio

1. Suba **el contenido** de la carpeta `landing-equitorq/` (no la carpeta en sí) a la raíz pública del hosting (`public_html/`, `www/` o equivalente) por el administrador de archivos de cPanel o por FTP.
2. Verifique que `index.html` quede en la raíz y que la carpeta `assets/` esté a su lado.
3. Actualice la URL del dominio final en `index.html`: etiqueta `<link rel="canonical">` y el bloque `application/ld+json`.

También funciona tal cual en hostings estáticos (Netlify, Vercel, GitHub Pages, Cloudflare Pages): arrastrar la carpeta o conectar el repositorio.

## Cómo editar

| Quiero cambiar… | Dónde |
|---|---|
| Colores de la marca | `assets/css/styles.css` → bloque `:root` (`--navy-900`, `--green-500`, etc.) |
| Tipografías | `<link>` de Google Fonts en `index.html` y `--font-head` / `--font-body` en `:root` |
| Textos de cualquier sección | `index.html`; cada sección está marcada con un comentario `<!-- ===== NOMBRE ===== -->` |
| Agregar o quitar un producto | `index.html` → copiar un bloque `<article class="product" data-cat="…">`. `data-cat` puede ser `torque`, `tensado` o `bombas` (define en qué filtro aparece). Agregar también la opción en el `<select id="f-equipo">` con el mismo nombre del `data-product` |
| Número de WhatsApp o correo | `assets/js/main.js` → objeto `CONFIG`, y los enlaces `wa.me/…` y `mailto:` de `index.html` |
| Imágenes | Reemplazar el archivo en `assets/img/` con el mismo nombre (recomendado WebP, ≤ 200 KB) |

## Formulario de contacto

No necesita servidor: al enviarlo, arma un mensaje con los datos y abre **WhatsApp** o el **cliente de correo** del usuario con el texto listo. La página no guarda datos. Si más adelante se quiere recibir los formularios en una bandeja, se puede conectar un servicio como Formspree o un backend propio.

## Alcance

- Responsive: celular, tablet, laptop y escritorio.
- SEO básico: título, descripción, Open Graph, etiqueta canónica, datos estructurados `Organization`, HTML semántico, textos alternativos en imágenes.
- Accesibilidad: contraste AA, navegación por teclado, enlace "saltar al contenido", `aria` en menú y filtros.
- Rendimiento: imágenes WebP con carga diferida (de ~9,5 MB en la versión anterior a ~0,8 MB).
- **Fuera de alcance:** chatbot / asistente de IA (reservado para una etapa futura).

---

## Catálogo (fase 2b)

El catálogo tiene 3 niveles: tarjeta de la serie → ventana "Ver detalle" (galería, descripción, características y tabla de modelos) → ficha técnica de cada modelo (datos principales, dibujo de dimensiones y cotas).

| Qué | Dónde |
|---|---|
| Lista de series, textos, características, imágenes | `assets/data/catalogo.js` |
| Datos de los modelos de cada serie (se cargan al abrir la serie) | `assets/data/fichas/<SERIE>.js` |
| Imágenes (WebP ≤ 1200 px) | `assets/catalogo/<SERIE>/` |
| Lógica del catálogo, ventana y lista de cotización | `assets/js/catalogo.js` |
| Estilos del catálogo | `styles.css`, sección 11 |

**Cómo corregir un dato de un modelo:** abra `assets/data/fichas/<SERIE>.js`, busque el código del modelo (por ejemplo `"EQ-MXTA-07"`) y cambie el valor. Los datos son texto; no hace falta tocar nada más.

**Cómo cambiar un texto o una imagen de una serie:** `assets/data/catalogo.js`. Para reemplazar una imagen, guarde la nueva con el mismo nombre en `assets/catalogo/<SERIE>/` (WebP, máximo 1200 px de lado).

**Selección de equipos en el formulario:** el visitante puede marcar familias en el formulario o agregar series y modelos exactos desde el catálogo. El mensaje de WhatsApp o correo agrupa los modelos por serie (por ejemplo `EQ-MXTA: 07, 1, 3`).

### Importante: versión de los archivos (caché)
`index.html` enlaza `styles.css?v=...`, `main.js?v=...`, `catalogo.js?v=...` y `catalogo.js` (datos) con un número de versión. **Cada vez que edite un CSS, un JS o los datos, cambie ese número en `index.html` (y en `assets/js/catalogo.js`, constante `VERSION`)**; si no, algunos navegadores seguirán mostrando la versión anterior guardada.

### No publicar
La carpeta `catalogo-data/interno/` y `catalogo-data/imagenes/crudas/` (fuera de esta carpeta) son material interno de trabajo. Esta carpeta `landing-equitorq/` es lo único que se publica.
