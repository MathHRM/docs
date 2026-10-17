---
title: "Laravel Mix"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)

<a id="introduction"></a>
## Introducción

> **Advertencia:**
> Laravel Mix es un paquete antiguo que ya no recibe mantenimiento activo. Puedes usar [Vite](../vite/) como alternativa moderna.

[Laravel Mix](https://github.com/laravel-mix/laravel-mix), un paquete desarrollado por Jeffrey Way, creador de [Laracasts](https://laracasts.com), ofrece una API fluida para definir los pasos de compilación de [webpack](https://webpack.js.org) de tu aplicación Laravel mediante varios preprocesadores comunes de CSS y JavaScript.

En otras palabras, Mix facilita la compilación y minificación de los archivos CSS y JavaScript de tu aplicación. Mediante un sencillo encadenamiento de métodos, puedes definir con fluidez el proceso de compilación de tus recursos. Por ejemplo:

```js
mix.js('resources/js/app.js', 'public/js')
    .postCss('resources/css/app.css', 'public/css');
```

Si alguna vez te has sentido confundido y abrumado al empezar con webpack y la compilación de recursos, te encantará Laravel Mix. Sin embargo, no es obligatorio usarlo al desarrollar tu aplicación; puedes usar cualquier herramienta de compilación de recursos que desees, o incluso ninguna.

> **Nota:**
> Vite ha reemplazado a Laravel Mix en las nuevas instalaciones de Laravel. Para consultar la documentación de Mix, visita el sitio web [oficial de Laravel Mix](https://laravel-mix.com/). Si quieres cambiar a Vite, consulta nuestra [guía de migración a Vite](https://github.com/laravel/vite-plugin/blob/main/UPGRADE.md#migrating-from-laravel-mix-to-vite).
