# Glosario de traducción al español

Español neutro, con trato de tú (puedes, debes, tu aplicación). Traducir toda la prosa, incluidos títulos, listas, tablas,
avisos y etiquetas de enlaces. Conservar código, comandos, identificadores,
URLs, destinos de enlaces y anclas HTML exactamente como en el original.

| Inglés | Español |
| --- | --- |
| request / response | solicitud / respuesta |
| routing / route | enrutamiento / ruta |
| middleware | middleware |
| service container | contenedor de servicios |
| service provider | proveedor de servicios |
| dependency injection | inyección de dependencias |
| event / listener | evento / listener |
| job / queue | trabajo / cola |
| dispatch | despachar |
| cache | caché |
| database / query | base de datos / consulta |
| query builder | constructor de consultas |
| model / relationship | modelo / relación |
| eager loading / lazy loading | carga anticipada / carga diferida |
| validation / authentication / authorization | validación / autenticación / autorización |
| view / template | vista / plantilla |
| framework | framework |
| application | aplicación |
| testing / test | pruebas / prueba |
| mock | objeto simulado |
| hashing | hashing |
| facade | fachada |
| binding | vinculación |
| closure | función anónima |
| array | array |
| callback | callback |
| helper | función auxiliar (helper cuando describe la API) |
| broadcasting | difusión de eventos |
| stub | plantilla |

Los nombres Laravel, Eloquent, Blade, Artisan y los paquetes se conservan.
La licencia traducida es informativa y se acompaña del original inglés.
Cada página registra el SHA de su fuente inglesa en translationSourceCommit.

## Procedimiento por página

Leer la fuente `site/src/content/docs/en/13.x/<nombre>.md` y escribir su
traducción completa en `site/src/content/docs/es/13.x/<nombre>.md`.
No modificar ningún otro archivo. Usar `git log -1 --format=%H -- <fuente>`
para obtener `translationSourceCommit` y añadirlo al frontmatter.
Conservar los bloques de código byte por byte (también sus comentarios),
el código en línea y la estructura de encabezados. No resumir ni omitir secciones.
Las etiquetas de navegación internas y los títulos sí se traducen.
Ejecutar `node site/scripts/check-es-translations.mjs --partial` y comprobar
que no haya errores para la página asignada. No hacer commits.
