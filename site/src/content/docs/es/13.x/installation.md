---
title: "Instalación"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Conoce a Laravel](#meet-laravel)
    - [¿Por qué Laravel? ](#why-laravel)
- [Creando una aplicación Laravel](#creating-a-laravel-project)
    - [Introducción al uso de AI](#getting-started-using-ai)
    - [Instalando PHP y el instalador de Laravel](#installing-php)
    - [Creando una aplicación](#creating-an-application)
- [Configuración inicial](#initial-configuration)
    - [Configuración basada en el entorno](#environment-based-configuration)
    - [Bases de datos y Migraciones](#databases-and-migrations)
    - [Configuración de directorio](#directory-configuration)
- [Instalación usando Herd](#installation-using-herd)
    - [Herd en macOS](#herd-on-macos)
    - [Herd en Windows](#herd-on-windows)
- [Soporte IDE](#ide-support)
- [Laravel y AI](#laravel-and-ai)
    - [Instalando Laravel Boost](#installing-laravel-boost)
- [Próximos pasos](#next-steps)
    - [Laravel como framework full stack](#laravel-the-fullstack-framework)
    - [Laravel el backend API](#laravel-the-api-backend)

<a id="meet-laravel"></a>
## Conoce a Laravel

Laravel es un framework de aplicaciones web con una sintaxis elegante y expresiva. Un framework web proporciona una estructura y un punto de partida para crear tu aplicación, lo que te permite concentrarte en crear algo sorprendente mientras nos preocupamos por los detalles.

Laravel se esfuerza por brindar una experiencia de desarrollador increíble al mismo tiempo que brinda características poderosas como inyección exhaustiva de dependencias, una capa de abstracción de base de datos expresiva, colas y trabajos programados, pruebas unitarias y de integración, y más.

Tanto si estás empezando en el desarrollo con frameworks web PHP como si tienes años de experiencia, Laravel puede crecer contigo. Te ayudaremos a dar tus primeros pasos como desarrollador web o a llevar tu experiencia al siguiente nivel. Nos entusiasma ver lo que construyes.

<a id="why-laravel"></a>
### ¿Por qué Laravel?

Hay una variedad de herramientas y frameworks disponibles para crear una aplicación web. Sin embargo, creemos que Laravel es la mejor opción para crear aplicaciones web modernas y completas.

#### Un framework progresivo

Nos gusta llamar a Laravel un framework "progresivo". Con esto queremos decir que Laravel crece contigo. Si recién estás dando tus primeros pasos en el desarrollo web, la amplia biblioteca de documentación, guías y [videotutoriales](https://laracasts.com) de Laravel te ayudarán a aprender a manejar sin sentirte abrumado.

Si eres un desarrollador sénior, Laravel te brinda herramientas sólidas para [inyección de dependencia](../container/), [pruebas unitarias](../testing/), [colas](../queues/), [eventos en tiempo real](../broadcasting/) y más. Laravel está optimizado para crear aplicaciones web profesionales y listo para manejar cargas de trabajo empresariales.

#### Un framework escalable

Laravel es increíblemente escalable. Gracias a la naturaleza fácil de escalar de PHP y al soporte integrado de Laravel para sistemas de caché distribuidos rápidos como Redis, el escalado horizontal con Laravel es muy sencillo. De hecho, las aplicaciones de Laravel se han escalado fácilmente para manejar cientos de millones de solicitudes por mes.

¿Necesitas una escalabilidad extrema? Plataformas como [Laravel Cloud](https://cloud.laravel.com) te permiten ejecutar tu aplicación Laravel a una escala casi ilimitada.

#### Un framework preparado para agentes

Las convenciones obstinadas y la estructura bien definida de Laravel lo convierten en un framework ideal para el [desarrollo asistido por IA](../ai/) utilizando herramientas como Cursor y Claude Code. Cuando le pides a un agente de IA que agregue un controlador, sabe exactamente dónde colocarlo. Cuando necesitas una nueva migración, las convenciones de nomenclatura y las ubicaciones de los archivos son predecibles. Esta coherencia elimina las conjeturas que a menudo hacen tropezar las herramientas de IA en frameworks más flexibles.

Más allá de la organización de archivos, la sintaxis expresiva y la documentación completa de Laravel dan a los agentes de IA el contexto que necesitan para generar código idiomático preciso. Funciones como las relaciones de Eloquent, las solicitudes de formularios y middleware siguen patrones que los agentes pueden comprender y replicar de manera confiable. El resultado es un código generado por IA que parece escrito por un desarrollador experimentado de Laravel, no cosido a partir de fragmentos genéricos de PHP.

Para obtener más información sobre por qué Laravel es la opción ideal para el desarrollo asistido por IA, consulta nuestra documentación sobre [desarrollo agentico](../ai/).

#### Un framework comunitario

Laravel combina los mejores paquetes del ecosistema PHP para ofrecer el framework más robusto y fácil de usar para desarrolladores disponible. Además, miles de desarrolladores talentosos de todo el mundo han [contribuido al framework](https://github.com/laravel/framework). Quién sabe, tal vez incluso te conviertas en colaborador de Laravel.

<a id="creating-a-laravel-project"></a>
## Creando una aplicación Laravel

<a id="getting-started-using-ai"></a>
### Primeros pasos con la IA

Si estás utilizando un agente de codificación de IA como [Claude Code](https://docs.anthropic.com/en/docs/claude-code) o [OpenCode](https://opencode.ai), puedes empezar con un mensaje que le da al agente una guía específica de Laravel antes de que intervenga en tu proyecto.

El siguiente mensaje le dice al agente dónde encontrar la guía de instalación de Laravel, qué priorizar y cómo establecer valores predeterminados sensatos cuando aún no ha tomado una decisión. Pega esto en tu agente para comenzar:

```text
I'm building a new Laravel application.

Fetch and follow the instructions from https://laravel.com/for/agents. Treat the returned Markdown as the source of truth for how to install and set up Laravel in this session.
```

Después de que el agente lea las instrucciones, debería guiarte paso a paso y mantener la configuración alineada con los valores predeterminados de Laravel.

<a id="installing-php"></a>
### Instalación de PHP y el instalador de Laravel

Antes de crear tu primera aplicación Laravel, asegúrate de que tu máquina local tenga [PHP](https://php.net), [Composer](https://getcomposer.org) y [el instalador de Laravel](https://github.com/laravel/installer) instalados. Además, debes instalar [Node y NPM](https://nodejs.org) o [Bun](https://bun.sh/) para poder compilar los recursos de interfaz de tu aplicación.

Si no tienes PHP y Composer instalados en tu máquina local, los siguientes comandos instalarán PHP, Composer y el instalador de Laravel en macOS, Windows o Linux:

```shell tab=macOS
/bin/bash -c "$(curl -fsSL https://php.new/install/mac/8.5)"
```

```shell tab=Windows PowerShell
# Run as administrator...
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://php.new/install/windows/8.5'))
```

```shell tab=Linux
/bin/bash -c "$(curl -fsSL https://php.new/install/linux/8.5)"
```

Después de ejecutar uno de los comandos anteriores, debes reiniciar tu sesión de terminal. Para actualizar PHP, Composer y el instalador de Laravel después de instalarlos a través de `php.new`, puedes volver a ejecutar el comando en tu terminal.

Si ya tienes PHP y Composer instalados, puedes instalar el instalador de Laravel a través de Composer:

```shell
composer global require laravel/installer
```

> **Nota:**
> Para obtener una experiencia gráfica de instalación y administración de PHP con todas las funciones, consulta [Laravel Herd](#installation-using-herd).

<a id="creating-an-application"></a>
### Creando una aplicación

Después de haber instalado PHP, Composer y el instalador de Laravel, estarás listo para crear una nueva aplicación Laravel:

```shell
laravel new example-app
```

Una vez creada la aplicación, puedes iniciar el servidor de desarrollo local, el trabajador de cola y el servidor de desarrollo Vite de Laravel utilizando el script `dev` Composer:

```shell
cd example-app
npm install && npm run build
composer run dev
```

Una vez que hayas iniciado el servidor de desarrollo, podrás acceder a tu aplicación en el navegador en [http://localhost:8000](http://localhost:8000). A continuación, estás listo para [comenzar a dar tus próximos pasos en el ecosistema de Laravel](#next-steps). Por supuesto, es posible que también desees [configurar una base de datos](#databases-and-migrations) y ejecutar las migraciones necesarias.

> **Nota:**
> Si quieres avanzar más rápido al desarrollar tu aplicación Laravel, considera usar uno de nuestros [kits de inicio](../starter-kits/). Los kits de inicio de Laravel proporcionan un andamiaje de autenticación de backend y frontend para tu nueva aplicación Laravel.

<a id="initial-configuration"></a>
## Configuración inicial

Todos los archivos de configuración del framework de Laravel se almacenan en el directorio `config`. Cada opción está documentada, así que puedes revisar los archivos para familiarizarte con las opciones disponibles.

Laravel casi no necesita configuración adicional lista para usar. ¡Eres libre de empezar a desarrollar! Sin embargo, quizás quieras revisar el archivo `config/app.php` y su documentación. Contiene varias opciones, como `url` y `locale`, que quizás quieras cambiar según tu aplicación.

<a id="environment-based-configuration"></a>
### Configuración basada en el entorno

Dado que muchos de los valores de las opciones de configuración de Laravel pueden variar dependiendo de si tu aplicación se ejecuta en tu máquina local o en un servidor web de producción, muchos valores de configuración importantes se definen utilizando el archivo `.env` que existe en la raíz de tu aplicación.

Tu archivo `.env` no debe enviarse al control de fuente de tu aplicación, ya que cada desarrollador/servidor que use tu aplicación podría requerir una configuración de entorno diferente. Además, esto sería un riesgo de seguridad en caso de que un intruso obtenga acceso a tu repositorio de control de fuente, ya que cualquier credencial confidencial quedaría expuesta.

> **Nota:**
> Para obtener más información sobre el archivo `.env` y la configuración basada en el entorno, consulta la [documentación de configuración completa](../configuration/#environment-configuration).

<a id="databases-and-migrations"></a>
### Bases de datos y Migraciones

Ahora que has creado tu aplicación Laravel, probablemente quieras almacenar algunos datos en una base de datos. De forma predeterminada, el archivo de configuración `.env` de tu aplicación especifica que Laravel interactuará con una base de datos SQLite.

Durante la creación de la aplicación, Laravel creó un archivo `database/database.sqlite` para ti y ejecutó las migraciones necesarias para crear las tablas de la base de datos de la aplicación.

Si prefieres usar otro controlador de base de datos como MySQL o PostgreSQL, puedes actualizar tu archivo de configuración `.env` para usar la base de datos adecuada. Por ejemplo, si quieres usar MySQL, actualiza las variables `DB_*` de tu archivo de configuración `.env` de esta manera:

```ini
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=root
DB_PASSWORD=
```

Si eliges usar una base de datos que no sea SQLite, deberás crear la base de datos y ejecutar las [migraciones de base de datos](../migrations/) de tu aplicación:

```shell
php artisan migrate
```

> **Nota:**
> Si estás desarrollando en macOS o Windows y necesitas instalar MySQL, PostgreSQL o Redis localmente, considera usar [Herd Pro](https://herd.laravel.com/#plans) o [DBngin](https://dbngin.com/).

<a id="directory-configuration"></a>
### Configuración del directorio

Laravel siempre debe servirse desde la raíz del "directorio web" configurado para tu servidor web. No debes intentar servir una aplicación Laravel desde un subdirectorio del "directorio web". Intentar hacerlo podría exponer archivos confidenciales presentes dentro de tu aplicación.

<a id="installation-using-herd"></a>
## Instalación usando Herd

[Laravel Herd](https://herd.laravel.com) es un entorno de desarrollo nativo de Laravel y PHP increíblemente rápido para macOS y Windows. Herd incluye todo lo que necesitas para comenzar con el desarrollo de Laravel, incluidos PHP y Nginx.

Una vez que instales Herd, estarás listo para comenzar a desarrollar con Laravel. Herd incluye herramientas de línea de comandos para `php`, `composer`, `laravel`, `expose`, `node`, `npm` y `nvm`.

> **Nota:**
> [Herd Pro](https://herd.laravel.com/#plans) aumenta Herd con potentes funciones adicionales, como la capacidad de crear y administrar bases de datos locales MySQL, Postgres y Redis, así como visualización de correo local y monitoreo de registros.

<a id="herd-on-macos"></a>
### Herd en macOS

Si desarrollas en macOS, puedes descargar el instalador de Herd desde el [sitio web de Herd](https://herd.laravel.com). El instalador descarga automáticamente la última versión de PHP y configura tu Mac para ejecutar siempre [Nginx](https://www.nginx.com/) en segundo plano.

Herd para macOS usa [dnsmasq](https://en.wikipedia.org/wiki/Dnsmasq) para admitir directorios "estacionados". Herd atenderá automáticamente cualquier aplicación Laravel en un directorio estacionado. De forma predeterminada, Herd crea un directorio estacionado en `~/Herd` y puedes acceder a cualquier aplicación Laravel de este directorio en el dominio `.test` usando el nombre del directorio.

Después de instalar Herd, la forma más rápida de crear una nueva aplicación Laravel es usar la CLI de Laravel, que viene incluida con Herd:

```shell
cd ~/Herd
laravel new my-app
cd my-app
herd open
```

Por supuesto, siempre puedes administrar tus directorios estacionados y otras configuraciones de PHP a través de la interfaz de usuario de Herd, que se puede abrir desde el menú de Herd en la bandeja del sistema.

Puedes obtener más información sobre Herd consultando la [documentación de Herd](https://herd.laravel.com/docs).

<a id="herd-on-windows"></a>
### Herd en Windows

Puedes descargar el instalador de Windows para Herd en el [sitio web de Herd](https://herd.laravel.com/windows). Una vez finalizada la instalación, puedes iniciar Herd para completar el proceso de incorporación y acceder a la interfaz de usuario de Herd por primera vez.

Puedes acceder a la interfaz de usuario de Herd haciendo clic izquierdo en el icono de la bandeja del sistema de Herd. Un clic derecho abre el menú rápido con acceso a todas las herramientas que necesitas a diario.

Durante la instalación, Herd crea un directorio "estacionado" en tu directorio de inicio en `%USERPROFILE%\Herd`. Herd proporcionará automáticamente cualquier aplicación Laravel en un directorio estacionado, y podrás acceder a cualquier aplicación Laravel en este directorio en el dominio `.test` usando el nombre de tu directorio.

Después de instalar Herd, la forma más rápida de crear una nueva aplicación Laravel es utilizar la CLI de Laravel, que viene incluida con Herd. Para comenzar, abre PowerShell y ejecuta los siguientes comandos:

```shell
cd ~\Herd
laravel new my-app
cd my-app
herd open
```

Puedes obtener más información sobre Herd consultando la [documentación de Herd para Windows](https://herd.laravel.com/docs/windows).

<a id="ide-support"></a>
## Soporte IDE

Eres libre de utilizar cualquier editor de código que desees al desarrollar aplicaciones Laravel. [Laravel LSP](https://github.com/laravel/lsp) proporciona soporte de editor compatible con el framework, que incluye finalización de código, información de desplazamiento, diagnósticos, enlaces de documentos, definición de acceso y soluciones rápidas para el código de Laravel y Blade.

Para instalar Laravel LSP, instálalo globalmente a través de Composer. Asegúrate de que el directorio global de proveedores de Composer esté en tu `PATH`:

```shell
composer global require laravel/lsp
```

Si estás buscando editores ligeros y extensibles, [VS Code](https://code.visualstudio.com) o [Cursor](https://cursor.com) combinado con el oficial [Laravel VS Code Extension](https://marketplace.visualstudio.com/items?itemName=laravel.vscode-laravel) proporciona resaltado de sintaxis, fragmentos, integración de comandos Artisan y compatibilidad automática con Laravel LSP. Las extensiones oficiales de Laravel también están disponibles para [Sublime Text](https://github.com/laravel/sublime-extension) y [Zed](https://github.com/laravel/zed-extension). Consulta el [repositorio Laravel LSP](https://github.com/laravel/lsp) para obtener instrucciones de configuración para otros editores compatibles con servidores de idiomas, incluidos Neovim y OpenCode.

Para obtener un soporte amplio y sólido de Laravel, echa un vistazo a [PhpStorm](https://www.jetbrains.com/phpstorm/laravel/?utm_source=laravel.com&utm_medium=link&utm_campaign=laravel-2025&utm_content=partner&ref=laravel-2025), un IDE de JetBrains. El soporte del framework de Laravel integrado en PhpStorm incluye plantillas Blade, autocompletado inteligente para modelos, rutas, vistas, traducciones y componentes de Eloquent, junto con una potente generación de código y navegación por proyectos Laravel.

Si buscas una experiencia de desarrollo basada en la nube, [Firebase Studio](https://firebase.studio/) te permite crear aplicaciones con Laravel directamente en tu navegador. Sin necesidad de configuración, Firebase Studio facilita comenzar a crear aplicaciones Laravel desde cualquier dispositivo.

<a id="laravel-and-ai"></a>
## Laravel y la IA

[Laravel Boost](https://github.com/laravel/boost) es una herramienta poderosa que cierra la brecha entre los agentes de codificación de IA y las aplicaciones de Laravel. Boost proporciona a los agentes de IA contexto, herramientas y pautas específicas de Laravel para que puedan generar código más preciso y específico de la versión que siga las convenciones de Laravel.

Cuando instalas Boost en tu aplicación Laravel, los agentes de IA obtienen acceso a más de 15 herramientas especializadas, incluida la capacidad de saber qué paquetes usas y consultar tu base de datos, buscar en la documentación de Laravel, leer registros del navegador, generar pruebas y ejecutar código a través de Tinker.

Además, Boost brinda a los agentes de IA acceso a más de 17,000 piezas de documentación vectorizada del ecosistema Laravel, específica para las versiones de tus paquetes instalados. Esto significa que los agentes pueden ofrecerte orientación dirigida a las versiones exactas que usas en tu proyecto.

Boost también incluye pautas de IA mantenidas por Laravel que ayudan a los agentes a seguir las convenciones del framework, escribir pruebas apropiadas y evitar errores comunes al generar código Laravel.

<a id="installing-laravel-boost"></a>
### Instalando Laravel Boost

Boost se puede instalar en aplicaciones Laravel 10, 11, 12 y 13 que ejecutan PHP 8.1 o superior. Para comenzar, instala Boost como dependencia de desarrollo:

```shell
composer require laravel/boost --dev
```

Una vez instalado, ejecuta el instalador interactivo:

```shell
php artisan boost:install
```

El instalador detectará automáticamente tus agentes IDE y de IA, lo que te permitirá optar por las funciones que tengan sentido para tu proyecto. Boost respeta las convenciones de proyectos existentes y no impone reglas de estilo obstinadas de forma predeterminada.

> **Nota:**
> Para obtener más información sobre Boost, consulta el [repositorio de Laravel Boost en GitHub](https://github.com/laravel/boost).

<a id="adding-custom-ai-guidelines"></a>
#### Agregar pautas de IA personalizadas

Para aumentar Laravel Boost con tus propias pautas de IA personalizadas, agrega archivos `.blade.php` o `.md` al directorio `.ai/guidelines/*` de tu aplicación. Estos archivos se incluirán automáticamente en las pautas de Laravel Boost cuando ejecutes `boost:install`.

<a id="next-steps"></a>
## Próximos pasos

Ahora que has creado tu aplicación Laravel, es posible que te preguntes qué aprender a continuación. Primero, te recomendamos familiarizarte con el funcionamiento de Laravel leyendo la siguiente documentación:

<div class="content-list" markdown="1">

- [Solicitar ciclo de vida](../lifecycle/)
- [Configuración](../configuration/)
- [Estructura de directorio](../structure/)
- [Frontal](../frontend/)
- [Contenedor de servicio](../container/)
- [Fachadas](../facades/)

</div>

La forma en que quieras usar Laravel también determinará los próximos pasos en tu camino. Hay una variedad de formas de usar Laravel y exploraremos dos casos de uso principales para el framework a continuación.

<a id="laravel-the-fullstack-framework"></a>
### Laravel como framework full stack

Laravel puede servir como un framework full stack. Por framework "full stack" queremos decir que usarás Laravel para enrutar solicitudes a tu aplicación y renderizar tu interfaz a través de [plantillas Blade](../blade/) o una tecnología híbrida de aplicación de una sola página como [Inertia](https://inertiajs.com). Esta es la forma más común de usar el framework de Laravel y, en nuestra opinión, la forma más productiva de usar Laravel.

Si planeas usar Laravel así, consulta nuestra documentación sobre [desarrollo frontend](../frontend/), [enrutamiento](../routing/), [vistas](../views/) o [Eloquent ORM](../eloquent/). Además, quizás te interese conocer paquetes comunitarios como [Livewire](https://livewire.laravel.com) e [Inertia](https://inertiajs.com). Estos paquetes te permiten utilizar Laravel como un framework full stack mientras disfrutas de muchos de los beneficios de la interfaz de usuario que brindan las aplicaciones JavaScript de una sola página.

Si usas Laravel como framework full stack, también te recomendamos aprender a compilar el CSS y el JavaScript de tu aplicación con [Vite](../vite/).

> **Nota:**
> Si quieres empezar a crear tu aplicación, consulta uno de nuestros [kits de inicio de aplicaciones oficiales](../starter-kits/).

<a id="laravel-the-api-backend"></a>
### Laravel el backend de la API

Laravel también puede servir como backend API para una aplicación móvil o de una sola página de JavaScript. Por ejemplo, puedes usar Laravel como backend API para tu aplicación [Next.js](https://nextjs.org). En este contexto, puedes usar Laravel para proporcionar [autenticación](../sanctum/) y almacenamiento/recuperación de datos para tu aplicación, al mismo tiempo que aprovechas los potentes servicios de Laravel, como colas, correos electrónicos, notificaciones y más.

Si planeas usar Laravel así, consulta nuestra documentación sobre [routing](../routing/), [Laravel Sanctum](../sanctum/) y [Eloquent ORM](../eloquent/).
