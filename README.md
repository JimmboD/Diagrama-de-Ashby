# Diagramas de Ashby

Sitio estático (sin build) listo para GitHub Pages.

```
index.html          Estructura de la página
css/style.css       Estilos
data/materiales.js  Lista de materiales (const MATERIALES = [...])
js/config.js        Propiedades, diagramas predefinidos y sugeridos
js/chart.js         Motor de dibujo (canvas)
js/app.js           Interfaz: gráficas abiertas, barra lateral, nueva gráfica
.nojekyll           Desactiva Jekyll en GitHub Pages
```

Para agregar materiales, añade objetos a `data/materiales.js`; se grafican todos al cargar.

Publicar: Settings → Pages → Deploy from branch → `main` / `(root)`.
