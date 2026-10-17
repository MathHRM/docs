---
title: "Agrupación de activos (Vite)"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Instalación y configuración](#installation)
  - [Instalando Node](#installing-node)
  - [Instalación de Vite y el complemento Laravel](#installing-vite-and-laravel-plugin)
  - [Configurando Vite](#configuring-vite)
  - [Cargando tus scripts y estilos](#loading-your-scripts-and-styles)
- [Ejecutando Vite](#running-vite)
- [Trabajando con JavaScript](#working-with-scripts)
  - [Alias](#aliases)
  - [Vue](#vue)
  - [Reaccionar](#react)
  - [Esbelto](#svelte)
  - [Inercia](#inertia)
  - [Procesamiento de URL](#url-processing)
- [Trabajar con hojas de estilo](#working-with-stylesheets)
- [Trabajar con fuentes](#working-with-fonts)
  - [Proveedores de fuentes](#font-providers)
  - [Fuentes locales](#local-fonts)
  - [Opciones de fuente](#font-options)
- [Trabajando con Blade y Rutas](#working-with-blade-and-routes)
  - [Procesamiento de activos estáticos con Vite](#blade-processing-static-assets)
  - [Actualizando en Save](#blade-refreshing-on-save)
  - [Alias](#blade-aliases)
- [Captación previa de activos](#asset-prefetching)
- [URL de base personalizada](#custom-base-urls)
- [Variables de entorno](#environment-variables)
- [Desactivar Vite en Pruebas](#disabling-vite-in-tests)
- [Representación del lado del servidor (SSR)](#ssr)
- [Atributos de etiqueta de estilo y secuencia de comandos](#script-and-style-attributes)
  - [Política de seguridad de contenido (CSP) Nonce](#content-security-policy-csp-nonce)
  - [Integridad de subrecursos (SRI)](#subresource-integrity-sri)
  - [Atributos arbitrarios](#arbitrary-attributes)
- [Personalización avanzada](#advanced-customization)
  - [Compartición de recursos entre orígenes del servidor de desarrollo (CORS)](#cors)
  - [Corrección de las URL del servidor de desarrollo](#correcting-dev-server-urls)

<a id="introduction"></a>
## Introducción

[Vite](https://vitejs.dev) es una moderna herramienta de creación de interfaz que proporciona un entorno de desarrollo extremadamente rápido y agrupa su código para producción. Al crear aplicaciones con Laravel, normalmente utilizará Vite para agrupar los archivos CSS y JavaScript de su aplicación en recursos listos para producción.

Laravel se integra perfectamente con Vite al proporcionar un complemento oficial y una directiva Blade para cargar sus activos para desarrollo y producción.

<a id="installation"></a>
## Instalación y configuración

> **Nota:**
> La siguiente documentación analiza cómo instalar y configurar manualmente el complemento Laravel Vite. Sin embargo, los [kits de inicio](../starter-kits/) de Laravel ya incluyen todo este andamiaje y son la forma más rápida de comenzar con Laravel y Vite.

<a id="installing-node"></a>
### Instalando nodo

Debes asegurarte de que Node.js (16+) y NPM estén instalados antes de ejecutar Vite y el complemento Laravel:

```shell
node -v
npm -v
```

Puede instalar fácilmente la última versión de Node y NPM utilizando instaladores gráficos simples desde [el sitio web oficial de Node](https://nodejs.org/en/download/). O, si estás usando [Laravel Sail](https://laravel.com../sail/), puedes invocar Node y NPM a través de Sail:

```shell
./vendor/bin/sail node -v
./vendor/bin/sail npm -v
```

<a id="installing-vite-and-laravel-plugin"></a>
### Instalación de Vite y el complemento Laravel

Dentro de una instalación nueva de Laravel, encontrará un archivo `package.json` en la raíz de la estructura de directorios de su aplicación. El archivo `package.json` predeterminado ya incluye todo lo que necesita para comenzar a usar Vite y el complemento Laravel. Puede instalar las dependencias del frontend de su aplicación a través de NPM:

```shell
npm install
```

<a id="configuring-vite"></a>
### Configurando Vite

Vite se configura a través de un archivo `vite.config.js` en la raíz de su proyecto. Eres libre de personalizar este archivo según tus necesidades y también puedes instalar cualquier otro complemento que requiera tu aplicación, como `@vitejs/plugin-react`, `@sveltejs/vite-plugin-svelte` o `@vitejs/plugin-vue`.

El complemento Laravel Vite requiere que especifiques los puntos de entrada para tu aplicación. Pueden ser archivos JavaScript o CSS e incluyen lenguajes preprocesados ​​como TypeScript, JSX, TSX y Sass.

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel([
            'resources/css/app.css',
            'resources/js/app.js',
        ]),
    ],
});
```

Si está creando un SPA, incluidas aplicaciones creadas con Inertia, Vite funciona mejor sin puntos de entrada CSS:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel([
            'resources/css/app.css', // [tl! remove]
            'resources/js/app.js',
        ]),
    ],
});
```

En su lugar, deberías importar tu CSS a través de JavaScript. Normalmente, esto se haría en el archivo `resources/js/app.js` de su aplicación:

```js
import './bootstrap';
import '../css/app.css'; // [tl! add]
```

El complemento Laravel también admite múltiples puntos de entrada y opciones de configuración avanzadas como [puntos de entrada SSR](#ssr).

<a id="working-with-a-secure-development-server"></a>
#### Trabajar con un servidor de desarrollo seguro

Si su servidor web de desarrollo local sirve su aplicación a través de HTTPS, puede tener problemas para conectarse al servidor de desarrollo de Vite.

Si está utilizando [Laravel Herd](https://herd.laravel.com) y ha asegurado el sitio o está utilizando [Laravel Valet](../valet/) y ha ejecutado el [comando seguro](../valet/#securing-sites) en su aplicación, el complemento Laravel Vite detectará y utilizará automáticamente el certificado TLS generado por usted.

Si protegió el sitio utilizando un host que no coincide con el nombre del directorio de la aplicación, puede especificar manualmente el host en el archivo `vite.config.js` de su aplicación:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            // ...
            detectTls: 'my-app.test', // [tl! add]
        }),
    ],
});
```

Cuando utilice otro servidor web, debe generar un certificado confiable y configurar Vite manualmente para usar los certificados generados:

```js
// ...
import fs from 'fs'; // [tl! add]

const host = 'my-app.test'; // [tl! add]

export default defineConfig({
    // ...
    server: { // [tl! add]
        host, // [tl! add]
        hmr: { host }, // [tl! add]
        https: { // [tl! add]
            key: fs.readFileSync(`/path/to/${host}.key`), // [tl! add]
            cert: fs.readFileSync(`/path/to/${host}.crt`), // [tl! add]
        }, // [tl! add]
    }, // [tl! add]
});
```

Si no puede generar un certificado confiable para su sistema, puede instalar y configurar el [@vitejs/plugin-basic-ssl plugin](https://github.com/vitejs/vite-plugin-basic-ssl). Cuando utilice certificados que no sean de confianza, deberá aceptar la advertencia de certificado para el servidor de desarrollo de Vite en su navegador siguiendo el enlace "Local" en su consola cuando ejecute el comando `npm run dev`.

<a id="configuring-hmr-in-sail-on-wsl2"></a>
#### Ejecutando el servidor de desarrollo en Sail en WSL2

Al ejecutar el servidor de desarrollo Vite dentro de [Laravel Sail](../sail/) en el subsistema de Windows para Linux 2 (WSL2), debe agregar la siguiente configuración a su archivo `vite.config.js` para garantizar que el navegador pueda comunicarse con el servidor de desarrollo:

```js
// ...

export default defineConfig({
    // ...
    server: { // [tl! add:start]
        hmr: {
            host: 'localhost',
        },
    }, // [tl! add:end]
});
```

Si los cambios en sus archivos no se reflejan en el navegador mientras se ejecuta el servidor de desarrollo, es posible que también necesite configurar la opción [server.watch.usePolling de Vite](https://vitejs.dev/config/server-options.html#server-watch).

<a id="loading-your-scripts-and-styles"></a>
### Cargando tus scripts y estilos

Con sus puntos de entrada de Vite configurados, ahora puede hacer referencia a ellos en una directiva Blade `@vite()` que agrega al `<head>` de la plantilla raíz de su aplicación:

```blade
<!DOCTYPE html>
<head>
    {{-- ... --}}

    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
```

Si estás importando tu CSS a través de JavaScript, solo necesitas incluir el punto de entrada de JavaScript:

```blade
<!DOCTYPE html>
<head>
    {{-- ... --}}

    @vite('resources/js/app.js')
</head>
```

La directiva `@vite` detectará automáticamente el servidor de desarrollo Vite e inyectará el cliente Vite para habilitar el reemplazo del módulo en caliente. En el modo de compilación, la directiva cargará sus activos compilados y versionados, incluido cualquier CSS importado.

Si es necesario, también puede especificar la ruta de compilación de sus recursos compilados al invocar la directiva `@vite`:

```blade
<!doctype html>
<head>
    {{-- Given build path is relative to public path. --}}

    @vite('resources/js/app.js', 'vendor/courier/build')
</head>
```

<a id="inline-assets"></a>
#### Activos en línea

A veces puede ser necesario incluir el contenido sin formato de los activos en lugar de vincularlos a la URL versionada del activo. Por ejemplo, es posible que necesite incluir contenido activo directamente en su página al pasar contenido HTML a un generador de PDF. Puede generar el contenido de los activos de Vite utilizando el método `content` proporcionado por la fachada `Vite`:

```blade
@use('Illuminate\Support\Facades\Vite')

<!doctype html>
<head>
    {{-- ... --}}

    <style>
        {!! Vite::content('resources/css/app.css') !!}
    </style>
    <script>
        {!! Vite::content('resources/js/app.js') !!}
    </script>
</head>
```

<a id="running-vite"></a>
## Ejecutando Vite

Hay dos formas de ejecutar Vite. Puede ejecutar el servidor de desarrollo mediante el comando `dev`, que resulta útil durante el desarrollo local. El servidor de desarrollo detectará automáticamente los cambios en sus archivos y los reflejará instantáneamente en cualquier ventana abierta del navegador.

O bien, ejecutar el comando `build` versionará y empaquetará los activos de su aplicación y los preparará para su implementación en producción:

```shell
# Run the Vite development server...
npm run dev

# Build and version the assets for production...
npm run build
```

Si está ejecutando el servidor de desarrollo en [Sail](../sail/) en WSL2, es posible que necesite algunas [opciones de configuración](#configuring-hmr-in-sail-on-wsl2) adicionales.

<a id="working-with-scripts"></a>
## Trabajar con JavaScript

<a id="aliases"></a>
### Alias

De forma predeterminada, el complemento Laravel proporciona un alias común para ayudarlo a comenzar a ejecutar e importar cómodamente los activos de su aplicación:

```js
{
    '@' => '/resources/js'
}
```

Puede sobrescribir el alias `'@'` agregando el suyo propio al archivo de configuración `vite.config.js`:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel(['resources/ts/app.tsx']),
    ],
    resolve: {
        alias: {
            '@': '/resources/ts',
        },
    },
});
```

<a id="vue"></a>
### vista

Si desea crear su interfaz utilizando el marco [Vue](https://vuejs.org/), también deberá instalar el complemento `@vitejs/plugin-vue`:

```shell
npm install --save-dev @vitejs/plugin-vue
```

Luego puede incluir el complemento en su archivo de configuración `vite.config.js`. Hay algunas opciones adicionales que necesitará al utilizar el complemento Vue con Laravel:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
    plugins: [
        laravel(['resources/js/app.js']),
        vue({
            template: {
                transformAssetUrls: {
                    // The Vue plugin will re-write asset URLs, when referenced
                    // in Single File Components, to point to the Laravel web
                    // server. Setting this to `null` allows the Laravel plugin
                    // to instead re-write asset URLs to point to the Vite
                    // server instead.
                    base: null,

                    // The Vue plugin will parse absolute URLs and treat them
                    // as absolute paths to files on disk. Setting this to
                    // `false` will leave absolute URLs un-touched so they can
                    // reference assets in the public directory as expected.
                    includeAbsolute: false,
                },
            },
        }),
    ],
});
```

> **Nota:**
> Los [kits de inicio](../starter-kits/) de Laravel ya incluyen la configuración adecuada de Laravel, Vue y Vite. Estos kits de inicio ofrecen la forma más rápida de comenzar con Laravel, Vue y Vite.

<a id="react"></a>
### Reaccionar

Si desea crear su interfaz utilizando el marco [React](https://reactjs.org/), también deberá instalar el complemento `@vitejs/plugin-react`:

```shell
npm install --save-dev @vitejs/plugin-react
```

Luego puede incluir el complemento en su archivo de configuración `vite.config.js`:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel(['resources/js/app.jsx']),
        react(),
    ],
});
```

Deberá asegurarse de que todos los archivos que contengan JSX tengan una extensión `.jsx` o `.tsx`, y recuerde actualizar su punto de entrada, si es necesario, como [se muestra arriba](#configuring-vite).

También deberá incluir la directiva Blade `@viteReactRefresh` adicional junto con la directiva `@vite` existente.

```blade
@viteReactRefresh
@vite('resources/js/app.jsx')
```

La directiva `@viteReactRefresh` debe llamarse antes que la directiva `@vite`.

> **Nota:**
> Los [kits de inicio](../starter-kits/) de Laravel ya incluyen la configuración adecuada de Laravel, React y Vite. Estos kits de inicio ofrecen la forma más rápida de comenzar con Laravel, React y Vite.

<a id="svelte"></a>
### Esbelto

Si desea crear su interfaz utilizando el marco [Svelte](https://svelte.dev/), también deberá instalar el complemento `@sveltejs/vite-plugin-svelte`:

```shell
npm install --save-dev @sveltejs/vite-plugin-svelte
```

Luego puede incluir el complemento en su archivo de configuración `vite.config.js`.

```js
import { svelte } from '@sveltejs/vite-plugin-svelte';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    laravel({
      input: ['resources/js/app.ts'],
      ssr: 'resources/js/ssr.ts',
      refresh: true,
    }),
    svelte(),
  ],
});
```

> **Nota:**
> Los [kits de inicio](../starter-kits/) de Laravel ya incluyen la configuración adecuada de Laravel, Svelte y Vite. Estos kits de inicio ofrecen la forma más rápida de comenzar con Laravel, Svelte y Vite.

<a id="inertia"></a>
### Inercia

El complemento Laravel Vite proporciona una conveniente función `resolvePageComponent` para ayudarlo a resolver los componentes de su página Inertia. A continuación se muestra un ejemplo del asistente en uso con Vue 3; sin embargo, también puedes utilizar la función en otros frameworks como React o Svelte:

```js
import { createApp, h } from 'vue';
import { createInertiaApp } from '@inertiajs/vue3';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

createInertiaApp({
  resolve: (name) => resolvePageComponent(`./Pages/${name}.vue`, import.meta.glob('./Pages/**/*.vue')),
  setup({ el, App, props, plugin }) {
    createApp({ render: () => h(App, props) })
      .use(plugin)
      .mount(el)
  },
});
```

Si está utilizando la función de división de código de Vite con Inertia, le recomendamos configurar [asset prefetching](#asset-prefetching).

> **Nota:**
> Los [kits de inicio](../starter-kits/) de Laravel ya incluyen la configuración adecuada de Laravel, Inertia y Vite. Estos kits de inicio ofrecen la forma más rápida de comenzar con Laravel, Inertia y Vite.

<a id="url-processing"></a>
### Procesamiento de URL

Al utilizar Vite y hacer referencia a recursos en HTML, CSS o JS de su aplicación, hay un par de advertencias a considerar. Primero, si hace referencia a activos con una ruta absoluta, Vite no incluirá el activo en la compilación; por lo tanto, debe asegurarse de que el activo esté disponible en su directorio público. Debe evitar el uso de rutas absolutas cuando utilice un [punto de entrada CSS dedicado](#configuring-vite) porque, durante el desarrollo, los navegadores intentarán cargar estas rutas desde el servidor de desarrollo de Vite, donde está alojado el CSS, en lugar de su directorio público.

Al hacer referencia a rutas relativas de activos, debe recordar que las rutas son relativas al archivo al que se hace referencia. Vite reescribirá, versionará y empaquetará todos los activos a los que se haga referencia a través de una ruta relativa.

Considere la siguiente estructura del proyecto:

```text
public/
  taylor.png
resources/
  js/
    Pages/
      Welcome.vue
  images/
    abigail.png
```

El siguiente ejemplo demuestra cómo Vite tratará las URL relativas y absolutas:

```html
<!-- This asset is not handled by Vite and will not be included in the build -->
<img src="/taylor.png">

<!-- This asset will be re-written, versioned, and bundled by Vite -->
<img src="../../images/abigail.png">
```

<a id="working-with-stylesheets"></a>
## Trabajar con hojas de estilo

> **Nota:**
> Los [kits de inicio](../starter-kits/) de Laravel ya incluyen la configuración adecuada de Tailwind y Vite. O, si desea utilizar Tailwind y Laravel sin utilizar uno de nuestros kits de inicio, consulte la [guía de instalación de Tailwind para Laravel](https://tailwindcss.com/docs/guides/laravel).

Todas las aplicaciones de Laravel ya incluyen Tailwind y un archivo `vite.config.js` configurado correctamente. Entonces, solo necesita iniciar el servidor de desarrollo Vite o ejecutar el comando `dev` Composer, que iniciará los servidores de desarrollo Laravel y Vite:

```shell
composer run dev
```

El CSS de su aplicación se puede colocar dentro del archivo `resources/css/app.css`.

<a id="working-with-fonts"></a>
## Trabajar con fuentes

El complemento Laravel Vite puede ofrecer fuentes optimizadas y autohospedadas para su aplicación. Cuando se configuran las fuentes, el complemento resuelve los archivos de fuentes solicitados, los emite como recursos de Vite, genera CSS de fuentes y escribe un manifiesto de fuentes que puede ser consumido por la directiva [`@fonts`](../blade/#fonts) de Blade.

Para configurar fuentes, importe uno o más asistentes de proveedor desde `laravel-vite-plugin/fonts` y agréguelos a la opción `fonts` del complemento Laravel:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import { google } from 'laravel-vite-plugin/fonts';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.js',
            fonts: [
                google('Inter', {
                    alias: 'sans',
                    weights: [400, 500, 600, 700],
                    styles: ['normal', 'italic'],
                    subsets: ['latin'],
                    display: 'swap',
                    preload: [
                        { weight: 400 },
                        { weight: 700 },
                    ],
                    fallbacks: ['system-ui', 'sans-serif'],
                }),
            ],
        }),
    ],
});
```

En este ejemplo, la fuente `Inter` estará disponible a través del alias `sans`. El complemento generará una variable CSS `--font-sans` y una clase de utilidad `.font-sans` que aplica la pila de fuentes generada.

<a id="font-providers"></a>
### Proveedores de fuentes

El complemento Laravel Vite incluye asistentes de proveedores para Google Fonts, Bunny Fonts, Fontsource y fuentes locales:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import { bunny, fontsource, google, local } from 'laravel-vite-plugin/fonts';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.js',
            fonts: [
                google('Inter', { alias: 'sans' }),
                bunny('Figtree', { alias: 'body' }),
                fontsource('JetBrains Mono', { alias: 'mono' }),
                local('Brand Sans', {
                    alias: 'brand',
                    src: 'resources/fonts/brand-sans',
                }),
            ],
        }),
    ],
});
```

El proveedor `fontsource` lee fuentes de un paquete Fontsource instalado. De forma predeterminada, el nombre del paquete se deriva de la familia de fuentes, como `@fontsource/jetbrains-mono`. Si su aplicación usa un nombre de paquete diferente, puede especificarlo usando la opción `package`.

<a id="local-fonts"></a>
### Fuentes locales

Cuando se utilizan fuentes locales, la opción `src` puede apuntar a un único archivo de fuente, un directorio o un patrón global. El complemento descubrirá archivos de fuentes compatibles e inferirá su peso y estilo a partir de sus nombres de archivo:

```js
local('Brand Sans', {
    alias: 'brand',
    src: 'resources/fonts/brand-sans/*.woff2',
})
```

Si necesita control total sobre las variantes disponibles, puede definirlas explícitamente usando la opción `variants`:

```js
local('Brand Sans', {
    alias: 'brand',
    variants: [
        { src: 'resources/fonts/BrandSans-Regular.woff2', weight: 400 },
        { src: 'resources/fonts/BrandSans-Italic.woff2', weight: 400, style: 'italic' },
        { src: ['resources/fonts/BrandSans-Bold.woff2', 'resources/fonts/BrandSans-Bold.ttf'], weight: 700 },
    ],
})
```

<a id="font-options"></a>
### Opciones de fuente

Dependiendo del proveedor, las definiciones de fuentes pueden aceptar varias opciones que le permiten personalizar la fuente CSS generada:

<div class="content-list" markdown="1">

- `alias` define el nombre utilizado por la directiva `@fonts` de Blade y el valor predeterminado es un slug de la familia de fuentes.
- `variable` define la variable CSS generada y el valor predeterminado es `--font-{alias}`.
- `weights` define los pesos de fuente remota o Fontsource que deben resolverse y el valor predeterminado es `[400]`.
- `styles` define los estilos de fuente remotos o Fontsource que deben resolverse y el valor predeterminado es `['normal']`.
- `subsets` define los subconjuntos de fuentes remotas o Fontsource que deben resolverse y el valor predeterminado es `['latin']`.
- `display` define el valor `font-display` y el valor predeterminado es `swap`.
- `preload` controla qué variantes de fuente WOFF2 deben precargarse. Esta opción puede ser `true`, `false` o una serie de selectores `{ weight, style }`.
- `fallbacks` define fuentes alternativas adicionales que deben agregarse a la pila de fuentes generada.
- `optimizedFallbacks` intenta generar fuentes alternativas ajustadas métricamente utilizando el paquete opcional `fontaine` y el valor predeterminado es `true`.

</div>

Las alternativas optimizadas requieren el paquete `fontaine`, que no está instalado de forma predeterminada. Si desea que Laravel genere fuentes alternativas ajustadas a métricas, debe instalar `fontaine` como una dependencia de desarrollo:

```shell
npm install --save-dev fontaine
```

Si `fontaine` no está instalado o no puede leer un archivo de fuente, Laravel omitirá el respaldo optimizado para esa fuente y continuará usando cualquier fuente configurada mediante la opción `fallbacks`.

Las fuentes locales se resuelven a partir de las opciones `src` o `variants` descritas anteriormente en lugar de usar `weights`, `styles` y `subsets`.

<a id="working-with-blade-and-routes"></a>
## Trabajando con Blade y Rutas

<a id="blade-processing-static-assets"></a>
### Procesamiento de activos estáticos con Vite

Al hacer referencia a activos en su JavaScript o CSS, Vite los procesa y versiona automáticamente. Además, al crear aplicaciones basadas en Blade, Vite también puede procesar y versionar activos estáticos a los que hace referencia únicamente en las plantillas de Blade.

Sin embargo, para lograr esto, debe informar a Vite de sus activos especificándolos en la opción `assets` del complemento. Esta opción está destinada a archivos estáticos a los que desea hacer referencia directamente con `Vite::asset`. Si desea que Laravel genere fuentes CSS y precargue enlaces, use la opción [`fonts`](#working-with-fonts) en su lugar.

Por ejemplo, si desea procesar y versionar todas las imágenes almacenadas en `resources/images` y todas las fuentes almacenadas en `resources/fonts`, debe agregar lo siguiente a su configuración de Vite:

```js
laravel({
    input: 'resources/js/app.js',
    assets: ['resources/images/**', 'resources/fonts/**'],
})
```

Vite ahora procesará estos activos cuando ejecute `npm run build`. Luego puede hacer referencia a estos activos en las plantillas Blade utilizando el método `Vite::asset`, que devolverá la URL versionada para un activo determinado:

```blade
<img src="{{ Vite::asset('resources/images/logo.png') }}">
```

> **Nota:**
> Antes de la versión 3 del complemento Laravel Vite, los activos estáticos debían importarse en el punto de entrada de su aplicación usando `import.meta.glob`. La opción `assets` se introdujo debido a cambios en Vite 8.

<a id="blade-refreshing-on-save"></a>
### Actualizando al guardar

Cuando su aplicación se crea utilizando la representación tradicional del lado del servidor con Blade, Vite puede mejorar su flujo de trabajo de desarrollo actualizando automáticamente el navegador cuando realiza cambios para ver archivos en su aplicación. Para comenzar, simplemente puede especificar la opción `refresh` como `true`.

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            // ...
            refresh: true,
        }),
    ],
});
```

Cuando la opción `refresh` es `true`, guardar archivos en los siguientes directorios hará que el navegador realice una actualización de página completa mientras ejecuta `npm run dev`:

- `app/Livewire/**`
- `app/View/Components/**`
- `lang/**`
- `resources/lang/**`
- `resources/views/**`
- `routes/**`

Ver el directorio `routes/**` es útil si está utilizando [Ziggy](https://github.com/tighten/ziggy) para generar enlaces de ruta dentro de la interfaz de su aplicación.

Si estas rutas predeterminadas no se ajustan a sus necesidades, puede especificar su propia lista de rutas para observar:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            // ...
            refresh: ['resources/views/**'],
        }),
    ],
});
```

Debajo del capó, el complemento Laravel Vite utiliza el paquete [vite-plugin-full-reload](https://github.com/ElMassimo/vite-plugin-full-reload), que ofrece algunas opciones de configuración avanzadas para ajustar el comportamiento de esta característica. Si necesita este nivel de personalización, puede proporcionar una definición `config`:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            // ...
            refresh: [{
                paths: ['path/to/watch/**'],
                config: { delay: 300 }
            }],
        }),
    ],
});
```

<a id="blade-aliases"></a>
### Alias

Es común en aplicaciones JavaScript [crear alias](#aliases) para directorios a los que se hace referencia periódicamente. Pero también puede crear alias para usar en Blade utilizando el método `macro` en la clase `Illuminate\Support\Facades\Vite`. Normalmente, las "macros" deben definirse dentro del método `boot` de un [proveedor de servicios](../providers/):

```php
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Vite::macro('image', fn (string $asset) => $this->asset("resources/images/{$asset}"));
}
```

Una vez que se ha definido una macro, se puede invocar dentro de sus plantillas. Por ejemplo, podemos usar la macro `image` definida anteriormente para hacer referencia a un activo ubicado en `resources/images/logo.png`:

```blade
<img src="{{ Vite::image('logo.png') }}" alt="Laravel Logo">
```

<a id="asset-prefetching"></a>
## Captación previa de activos

Al crear un SPA utilizando la función de división de código de Vite, los activos necesarios se obtienen en cada navegación de página. Este comportamiento puede provocar un retraso en la representación de la interfaz de usuario. Si esto es un problema para el marco de interfaz de su elección, Laravel ofrece la capacidad de precargar con entusiasmo los activos JavaScript y CSS de su aplicación en la carga inicial de la página.

Puede indicarle a Laravel que obtenga previamente sus activos invocando el método `Vite::prefetch` en el método `boot` de un [proveedor de servicios](../providers/):

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // ...
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
    }
}
```

En el ejemplo anterior, los recursos se recuperarán previamente con un máximo de descargas simultáneas `3` en cada carga de página. Puede modificar la simultaneidad para adaptarla a las necesidades de su aplicación o no especificar ningún límite de simultaneidad si la aplicación debe descargar todos los activos a la vez:

```php
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Vite::prefetch();
}
```

De forma predeterminada, la captación previa comenzará cuando se active la [página _load_ event](https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event). Si desea personalizar cuándo comienza la captación previa, puede especificar un evento que Vite escuchará:

```php
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Vite::prefetch(event: 'vite:prefetch');
}
```

Dado el código anterior, la captación previa comenzará ahora cuando envíe manualmente el evento `vite:prefetch` en el objeto `window`. Por ejemplo, podría hacer que la captación previa comience tres segundos después de que se cargue la página:

```html
<script>
    addEventListener('load', () => setTimeout(() => {
        dispatchEvent(new Event('vite:prefetch'))
    }, 3000))
</script>
```

<a id="custom-base-urls"></a>
## URL base personalizadas

Si sus recursos compilados de Vite se implementan en un dominio separado de su aplicación, como a través de una CDN, debe especificar la variable de entorno `ASSET_URL` dentro del archivo `.env` de su aplicación:

```env
ASSET_URL=https://cdn.example.com
```

Después de configurar la URL del activo, todas las URL reescritas de sus activos tendrán el prefijo del valor configurado:

```text
https://cdn.example.com/build/assets/app.9dce8d17.js
```

Recuerde que [las URL absolutas no son reescritas por Vite](#url-processing), por lo que no tendrán prefijo.

<a id="environment-variables"></a>
## Variables de entorno

Puede inyectar variables de entorno en su JavaScript prefijándolas con `VITE_` en el archivo `.env` de su aplicación:

```env
VITE_SENTRY_DSN_PUBLIC=http://example.com
```

Puede acceder a las variables de entorno inyectadas a través del objeto `import.meta.env`:

```js
import.meta.env.VITE_SENTRY_DSN_PUBLIC
```

<a id="disabling-vite-in-tests"></a>
## Deshabilitar Vite en las pruebas

La integración de Vite de Laravel intentará resolver sus activos mientras ejecuta sus pruebas, lo que requiere que ejecute el servidor de desarrollo de Vite o construya sus activos.

Si prefieres burlarte de Vite durante las pruebas, puedes llamar al método `withoutVite`, que está disponible para cualquier prueba que extienda la clase `TestCase` de Laravel:

```php tab=Pest
test('without vite example', function () {
    $this->withoutVite();

    // ...
});
```

```php tab=PHPUnit
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_without_vite_example(): void
    {
        $this->withoutVite();

        // ...
    }
}
```

Si desea deshabilitar Vite para todas las pruebas, puede llamar al método `withoutVite` desde el método `setUp` en su clase base `TestCase`:

```php
<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void// [tl! add:start]
    {
        parent::setUp();

        $this->withoutVite();
    }// [tl! add:end]
}
```

<a id="ssr"></a>
## Representación del lado del servidor (SSR)

El complemento Laravel Vite hace que sea sencillo configurar el renderizado del lado del servidor con Vite. Para comenzar, cree un punto de entrada SSR en `resources/js/ssr.js` y especifique el punto de entrada pasando una opción de configuración al complemento Laravel:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.js',
            ssr: 'resources/js/ssr.js',
        }),
    ],
});
```

Para asegurarse de no olvidar reconstruir el punto de entrada de SSR, le recomendamos aumentar el script de "compilación" en el `package.json` de su aplicación para crear su compilación de SSR:

```json
"scripts": {
     "dev": "vite",
     "build": "vite build" // [tl! remove]
     "build": "vite build && vite build --ssr" // [tl! add]
}
```

Luego, para construir e iniciar el servidor SSR, puede ejecutar los siguientes comandos:

```shell
npm run build
node bootstrap/ssr/ssr.js
```

Si está utilizando [SSR con Inertia](https://inertiajs.com/server-side-rendering), puede utilizar en su lugar el comando `inertia:start-ssr` Artisan para iniciar el servidor SSR:

```shell
php artisan inertia:start-ssr
```

> **Nota:**
> Los [kits de inicio](../starter-kits/) de Laravel ya incluyen la configuración adecuada de Laravel, Inertia SSR y Vite. Estos kits de inicio ofrecen la forma más rápida de comenzar con Laravel, Inertia SSR y Vite.

<a id="script-and-style-attributes"></a>
## Atributos de etiquetas de estilo y secuencia de comandos

<a id="content-security-policy-csp-nonce"></a>
### Política de seguridad de contenido (CSP) Nonce

Si desea incluir un atributo [nonce](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/nonce) en su secuencia de comandos y etiquetas de estilo como parte de su [Política de seguridad de contenido](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP), puede generar o especificar un nonce utilizando el método `useCspNonce` dentro de un [middleware](../middleware/) personalizado:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Vite;
use Symfony\Component\HttpFoundation\Response;

class AddContentSecurityPolicyHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        Vite::useCspNonce();

        return $next($request)->withHeaders([
            'Content-Security-Policy' => "script-src 'nonce-".Vite::cspNonce()."'",
        ]);
    }
}
```

Después de invocar el método `useCspNonce`, Laravel incluirá automáticamente los atributos `nonce` en todas las etiquetas de estilo y script generadas.

Si necesita especificar el nonce en otro lugar, incluida la [directiva Ziggy `@route`](https://github.com/tighten/ziggy#using-routes-with-a-content-security-policy) incluida con los [kits de inicio](../starter-kits/) de Laravel, puede recuperarlo usando el método `cspNonce`:

```blade
@routes(nonce: Vite::cspNonce())
```

Si ya tiene un nonce que le gustaría indicarle a Laravel que use, puede pasar el nonce al método `useCspNonce`:

```php
Vite::useCspNonce($nonce);
```

<a id="subresource-integrity-sri"></a>
### Integridad de los subrecursos (SRI)

Si su manifiesto de Vite incluye hashes `integrity` para sus activos, Laravel agregará automáticamente el atributo `integrity` en cualquier script y etiqueta de estilo que genere para aplicar [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity). De forma predeterminada, Vite no incluye el hash `integrity` en su manifiesto, pero puede habilitarlo instalando el complemento NPM [vite-plugin-manifest-sri](https://www.npmjs.com/package/vite-plugin-manifest-sri):

```shell
npm install --save-dev vite-plugin-manifest-sri
```

Luego puede habilitar este complemento en su archivo `vite.config.js`:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import manifestSRI from 'vite-plugin-manifest-sri';// [tl! add]

export default defineConfig({
    plugins: [
        laravel({
            // ...
        }),
        manifestSRI(),// [tl! add]
    ],
});
```

Si es necesario, también puede personalizar la clave del manifiesto donde se puede encontrar el hash de integridad:

```php
use Illuminate\Support\Facades\Vite;

Vite::useIntegrityKey('custom-integrity-key');
```

Si desea desactivar completamente esta detección automática, puede pasar `false` al método `useIntegrityKey`:

```php
Vite::useIntegrityKey(false);
```

<a id="arbitrary-attributes"></a>
### Atributos arbitrarios

Si necesita incluir atributos adicionales en su secuencia de comandos y etiquetas de estilo, como el atributo [data-turbo-track](https://turbo.hotwired.dev/handbook/drive#reloading-when-assets-change), puede especificarlos mediante los métodos `useScriptTagAttributes` y `useStyleTagAttributes`. Normalmente, estos métodos deben invocarse desde un [proveedor de servicios](../providers/):

```php
use Illuminate\Support\Facades\Vite;

Vite::useScriptTagAttributes([
    'data-turbo-track' => 'reload', // Specify a value for the attribute...
    'async' => true, // Specify an attribute without a value...
    'integrity' => false, // Exclude an attribute that would otherwise be included...
]);

Vite::useStyleTagAttributes([
    'data-turbo-track' => 'reload',
]);
```

Si necesita agregar atributos condicionalmente, puede pasar una devolución de llamada que recibirá la ruta de origen del activo, su URL, su fragmento de manifiesto y el manifiesto completo:

```php
use Illuminate\Support\Facades\Vite;

Vite::useScriptTagAttributes(fn (string $src, string $url, array|null $chunk, array|null $manifest) => [
    'data-turbo-track' => $src === 'resources/js/app.js' ? 'reload' : false,
]);

Vite::useStyleTagAttributes(fn (string $src, string $url, array|null $chunk, array|null $manifest) => [
    'data-turbo-track' => $chunk && $chunk['isEntry'] ? 'reload' : false,
]);
```

> **Advertencia:**
> Los argumentos `$chunk` y `$manifest` serán `null` mientras se ejecuta el servidor de desarrollo Vite.

<a id="advanced-customization"></a>
## Personalización avanzada

Fuera de la caja, el complemento Vite de Laravel utiliza convenciones sensatas que deberían funcionar para la mayoría de las aplicaciones; sin embargo, a veces es posible que necesites personalizar el comportamiento de Vite. Para habilitar opciones de personalización adicionales, ofrecemos los siguientes métodos y opciones que se pueden utilizar en lugar de la directiva Blade `@vite`:

```blade
<!doctype html>
<head>
    {{-- ... --}}

    {{
        Vite::useHotFile(storage_path('vite.hot')) // Customize the "hot" file...
            ->useBuildDirectory('bundle') // Customize the build directory...
            ->useManifestFilename('assets.json') // Customize the manifest filename...
            ->withEntryPoints(['resources/js/app.js']) // Specify the entry points...
            ->createAssetPathsUsing(function (string $path, ?bool $secure) { // Customize the backend path generation for built assets...
                return "https://cdn.example.com/{$path}";
            })
    }}
</head>
```

Dentro del archivo `vite.config.js`, deberá especificar la misma configuración:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            hotFile: 'storage/vite.hot', // Customize the "hot" file...
            buildDirectory: 'bundle', // Customize the build directory...
            input: ['resources/js/app.js'], // Specify the entry points...
        }),
    ],
    build: {
      manifest: 'assets.json', // Customize the manifest filename...
    },
});
```

<a id="cors"></a>
### Intercambio de recursos entre orígenes del servidor de desarrollo (CORS)

Si tiene problemas de uso compartido de recursos entre orígenes (CORS) en el navegador mientras recupera recursos del servidor de desarrollo de Vite, es posible que deba otorgarle acceso de origen personalizado al servidor de desarrollo. Vite combinado con el complemento Laravel permite los siguientes orígenes sin ninguna configuración adicional:

- `::1`
- `127.0.0.1`
- `localhost`
- `*.test`
- `*.localhost`
- `APP_URL` en el `.env` del proyecto.

La forma más sencilla de permitir un origen personalizado para su proyecto es asegurarse de que la variable de entorno `APP_URL` de su aplicación coincida con el origen que está visitando en su navegador. Por ejemplo, si visita `https://my-app.laravel`, debe actualizar su `.env` para que coincida:

```env
APP_URL=https://my-app.laravel
```

Si necesita un control más detallado sobre los orígenes, como admitir múltiples orígenes, debe utilizar [la configuración integral y flexible del servidor CORS integrado de Vite](https://vite.dev/config/server-options.html#server-cors). Por ejemplo, puede especificar múltiples orígenes en la opción de configuración `server.cors.origin` en el archivo `vite.config.js` del proyecto:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.js',
            refresh: true,
        }),
    ],
    server: {  // [tl! add]
        cors: {  // [tl! add]
            origin: [  // [tl! add]
                'https://backend.laravel',  // [tl! add]
                'http://admin.laravel:8566',  // [tl! add]
            ],  // [tl! add]
        },  // [tl! add]
    },  // [tl! add]
});
```

También puede incluir patrones de expresiones regulares, que pueden resultar útiles si desea permitir todos los orígenes para un dominio de nivel superior determinado, como `*.laravel`:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.js',
            refresh: true,
        }),
    ],
    server: {  // [tl! add]
        cors: {  // [tl! add]
            origin: [ // [tl! add]
                // Supports: SCHEME://DOMAIN.laravel[:PORT] [tl! add]
                /^https?:\/\/.*\.laravel(:\d+)?$/, //[tl! add]
            ], // [tl! add]
        }, // [tl! add]
    }, // [tl! add]
});
```

<a id="correcting-dev-server-urls"></a>
### Corrección de las URL del servidor de desarrollo

Algunos complementos dentro del ecosistema de Vite asumen que las URL que comienzan con una barra diagonal siempre apuntarán al servidor de desarrollo de Vite. Sin embargo, debido a la naturaleza de la integración de Laravel, este no es el caso.

Por ejemplo, el complemento `vite-imagetools` genera URL como las siguientes mientras Vite ofrece sus activos:

```html
<img src="/@imagetools/f0b2f404b13f052c604e632f2fb60381bf61a520">
```

El complemento `vite-imagetools` espera que Vite intercepte la URL de salida y el complemento pueda entonces manejar todas las URL que comiencen con `/@imagetools`. Si utiliza complementos que esperan este comportamiento, deberá corregir manualmente las URL. Puede hacer esto en su archivo `vite.config.js` usando la opción `transformOnServe`.

En este ejemplo particular, antepondremos la URL del servidor de desarrollo a todas las apariciones de `/@imagetools` dentro del código generado:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import { imagetools } from 'vite-imagetools';

export default defineConfig({
    plugins: [
        laravel({
            // ...
            transformOnServe: (code, devServerUrl) => code.replaceAll('/@imagetools', devServerUrl+'/@imagetools'),
        }),
        imagetools(),
    ],
});
```

Ahora, mientras Vite proporciona recursos, generará URL que apuntan al servidor de desarrollo de Vite:

```html
- <img src="/@imagetools/f0b2f404b13f052c604e632f2fb60381bf61a520"><!-- [tl! remove] -->
+ <img src="http://[::1]:5173/@imagetools/f0b2f404b13f052c604e632f2fb60381bf61a520"><!-- [tl! add] -->
```
