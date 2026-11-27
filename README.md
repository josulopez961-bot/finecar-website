# FINECAR Bodyshop Website

Sitio web estático para FINECAR Bodyshop, taller automotriz en Ambato, Ecuador.

## Estructura

- `index.html`: página principal orientada a conversión.
- `enderezada-y-pintura.html`: página SEO para enderezada, pintura y reparación de choques.
- `mecanica-general.html`: página SEO para mecánica general.
- `nosotros.html`: confianza, historia y posicionamiento local.
- `contacto.html`: NAP, mapa, formulario y WhatsApp.
- `blog.html`: índice de guías.
- `reparacion-de-choques-ambato.html`, `pintura-automotriz-ambato.html`, `pulido-y-rayones-ambato.html`: páginas SEO por servicio.
- `que-hacer-despues-de-un-choque.html`, `rayon-pulir-retocar-o-pintar.html`, `como-cuidar-la-pintura-del-auto.html`: guías.
- `llms.txt`, `robots.txt`, `sitemap.xml`: descubrimiento para buscadores y asistentes de IA.
- `netlify.toml`: URLs limpias (301 desde .html), encabezados y caché.
- `serve.py`: servidor local con URLs limpias.
- `styles.css`: estilos globales.
- `script.js`: WhatsApp, navegación móvil y formulario.
- `assets/`: imágenes WebP optimizadas.

## Contacto principal

- WhatsApp principal: `0995556084`
- Teléfono adicional: `0995318519`
- Dirección: Cervantes y Río Cosanga, sector Huachi Chico, Ambato, Tungurahua, Ecuador.

## Para revisar localmente

```bash
python serve.py
```

Abrir:

```text
http://127.0.0.1:4177/
```

## Dominio

El sitio vive en `https://www.finecarbodyshop.com` (registrado en Banahosting, DNS en Netlify DNS).
`finecarbodyshop.com` y `finecarbodyshop.netlify.app` redirigen con 301 a la versión con `www`.
Si algún día cambia el dominio, reemplazar `https://www.finecarbodyshop.com` en todos los `.html`,
`sitemap.xml`, `robots.txt`, `llms.txt` y `netlify.toml`, y mantener la redirección 301 desde el dominio anterior.
