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
    - [Rebaño en macOS](#herd-on-macos)
    - [Rebaño en Windows](#herd-on-windows)
- [Soporte IDE](#ide-support)
- [Laravel y AI](#laravel-and-ai)
    - [Instalando Laravel Boost](#installing-laravel-boost)
- [Próximos pasos](#next-steps)
    - [Laravel el marco de trabajo completo](#laravel-the-fullstack-framework)
    - [Laravel el backend API](#laravel-the-api-backend)

<a id="meet-laravel"></a>
## Conoce a Laravel

Laravel es un marco de aplicación web con una sintaxis elegante y expresiva. Un marco web proporciona una estructura y un punto de partida para crear su aplicación, lo que le permite concentrarse en crear algo sorprendente mientras nos preocupamos por los detalles.

Laravel se esfuerza por brindar una experiencia de desarrollador increíble al mismo tiempo que brinda características poderosas como inyección exhaustiva de dependencias, una capa de abstracción de base de datos expresiva, colas y trabajos programados, pruebas unitarias y de integración, y más.

Si eres nuevo en los frameworks web PHP o tienes años de experiencia, Laravel es un framework que puede crecer contigo. Le ayudaremos a dar sus primeros pasos como desarrollador web o le daremos un impulso a medida que lleva su experiencia al siguiente nivel. No podemos esperar a ver lo que construyes.

<a id="why-laravel"></a>
### ¿Por qué Laravel?

Hay una variedad de herramientas y marcos disponibles para crear una aplicación web. Sin embargo, creemos que Laravel es la mejor opción para crear aplicaciones web modernas y completas.

#### Un marco progresista

Nos gusta llamar a Laravel un marco "progresivo". Con esto queremos decir que Laravel crece contigo. Si recién estás dando tus primeros pasos en el desarrollo web, la amplia biblioteca de documentación, guías y [videotutoriales](https://laracasts.com) de Laravel te ayudarán a aprender a manejar sin sentirte abrumado.

Si es un desarrollador senior, Laravel le brinda herramientas sólidas para [inyección de dependencia](../container/), [pruebas unitarias](../testing/), [colas](../queues/), [eventos en tiempo real](../broadcasting/) y más. Laravel está optimizado para crear aplicaciones web profesionales y listo para manejar cargas de trabajo empresariales.

#### Un marco escalable

Laravel es increíblemente escalable. Gracias a la naturaleza fácil de escalar de PHP y al soporte integrado de Laravel para sistemas de caché distribuidos rápidos como Redis, el escalado horizontal con Laravel es muy sencillo. De hecho, las aplicaciones de Laravel se han escalado fácilmente para manejar cientos de millones de solicitudes por mes.

¿Necesita una escala extrema? Plataformas como [Laravel Cloud](https://cloud.laravel.com) le permiten ejecutar su aplicación Laravel a una escala casi ilimitada.

#### Un marco preparado para agentes

Las convenciones obstinadas y la estructura bien definida de Laravel lo convierten en un marco ideal para el [desarrollo asistido por IA](../ai/) utilizando herramientas como Cursor y Claude Code. Cuando le pides a un agente de IA que agregue un controlador, sabe exactamente dónde colocarlo. Cuando necesita una nueva migración, las convenciones de nomenclatura y las ubicaciones de los archivos son predecibles. Esta coherencia elimina las conjeturas que a menudo hacen tropezar las herramientas de IA en marcos más flexibles.

Más allá de la organización de archivos, la sintaxis expresiva y la documentación completa de Laravel brindan a los agentes de IA el contexto que necesitan para generar código idiomático preciso. Funciones como relaciones elocuentes, solicitudes de formularios y middleware siguen patrones que los agentes pueden comprender y replicar de manera confiable. El resultado es un código generado por IA que parece escrito por un desarrollador experimentado de Laravel, no cosido a partir de fragmentos genéricos de PHP.

Para obtener más información sobre por qué Laravel es la elección perfecta para el desarrollo asistido por IA, consulte nuestra documentación sobre [desarrollo agentico](../ai/).

#### Un marco comunitario

Laravel combina los mejores paquetes del ecosistema PHP para ofrecer el marco más robusto y fácil de usar para desarrolladores disponible. Además, miles de desarrolladores talentosos de todo el mundo han contribuido al marco](https://github.com/laravel/framework). Quién sabe, tal vez incluso te conviertas en colaborador de Laravel.

<a id="creating-a-laravel-project"></a>
## Creando una aplicación Laravel

<a id="getting-started-using-ai"></a>
### Primeros pasos con la IA

Si está utilizando un agente de codificación de IA como [Claude Code](https://docs.anthropic.com/en/docs/claude-code) o [OpenCode](https://opencode.ai), puede comenzar con un mensaje que le brinda al agente un manual específico de Laravel antes de que toque su proyecto.

El siguiente mensaje le dice al agente dónde encontrar la guía de instalación de Laravel, qué priorizar y cómo establecer valores predeterminados sensatos cuando aún no ha tomado una decisión. Pega esto en tu agente para comenzar:

```text
I'm building a new Laravel application.

Fetch and follow the instructions from https://laravel.com/for/agents. Treat the returned Markdown as the source of truth for how to install and set up Laravel in this session.
```

Después de que el agente lea las instrucciones, debería guiarlo paso a paso y mantener la configuración alineada con los valores predeterminados de Laravel.

<a id="installing-php"></a>
### Instalación de PHP y el instalador de Laravel

Antes de crear su primera aplicación Laravel, asegúrese de que su máquina local tenga [PHP](https://php.net), [Composer](https://getcomposer.org) y [el instalador de Laravel](https://github.com/laravel/installer) instalados. Además, debe instalar [Node y NPM](https://nodejs.org) o [Bun](https://bun.sh/) para poder compilar los recursos de interfaz de su aplicación.

Si no tiene PHP y Composer instalados en su máquina local, los siguientes comandos instalarán PHP, Composer y el instalador de Laravel en macOS, Windows o Linux:

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

Después de ejecutar uno de los comandos anteriores, debe reiniciar su sesión de terminal. Para actualizar PHP, Composer y el instalador de Laravel después de instalarlos a través de `php.new`, puede volver a ejecutar el comando en su terminal.

Si ya tienes PHP y Composer instalados, puedes instalar el instalador de Laravel a través de Composer:

```shell
composer global require laravel/installer
```

> **Nota:**
> Para obtener una experiencia gráfica de instalación y administración de PHP con todas las funciones, consulte [Laravel Herd](#installation-using-herd).

<a id="creating-an-application"></a>
### Creando una aplicación

Después de haber instalado PHP, Composer y el instalador de Laravel, estará listo para crear una nueva aplicación Laravel:

```shell
laravel new example-app
```

Una vez creada la aplicación, puede iniciar el servidor de desarrollo local, el trabajador de cola y el servidor de desarrollo Vite de Laravel utilizando el script `dev` Composer:

```shell
cd example-app
npm install && npm run build
composer run dev
```

Una vez que haya iniciado el servidor de desarrollo, podrá acceder a su aplicación en su navegador web en [http://localhost:8000](http://localhost:8000). A continuación, estás listo para [comenzar a dar tus próximos pasos en el ecosistema de Laravel](#next-steps). Por supuesto, es posible que también desees [configurar una base de datos](#databases-and-migrations) y ejecutar las migraciones necesarias.

> **Nota:**
> Si desea tener una ventaja al desarrollar su aplicación Laravel, considere usar uno de nuestros [kits de inicio](../starter-kits/). Los kits de inicio de Laravel proporcionan un andamiaje de autenticación de backend y frontend para su nueva aplicación Laravel.

<a id="initial-configuration"></a>
## Configuración inicial

Todos los archivos de configuración para el marco Laravel se almacenan en el directorio `config`. Cada opción está documentada, así que siéntase libre de revisar los archivos y familiarizarse con las opciones disponibles.

Laravel casi no necesita configuración adicional lista para usar. ¡Eres libre de empezar a desarrollar! Sin embargo, es posible que desee revisar el archivo `config/app.php` y su documentación. Contiene varias opciones, como `url` y `locale`, que quizás desee cambiar según su aplicación.

<a id="environment-based-configuration"></a>
### Configuración basada en el entorno

Dado que muchos de los valores de las opciones de configuración de Laravel pueden variar dependiendo de si su aplicación se ejecuta en su máquina local o en un servidor web de producción, muchos valores de configuración importantes se definen utilizando el archivo `.env` que existe en la raíz de su aplicación.

Su archivo `.env` no debe enviarse al control de fuente de su aplicación, ya que cada desarrollador/servidor que utilice su aplicación podría requerir una configuración de entorno diferente. Además, esto sería un riesgo de seguridad en caso de que un intruso obtenga acceso a su repositorio de control de fuente, ya que cualquier credencial confidencial quedaría expuesta.

> **Nota:**
> Para obtener más información sobre el archivo `.env` y la configuración basada en el entorno, consulte la [documentación de configuración](../configuration/#environment-configuration)] completa.

<a id="databases-and-migrations"></a>
### Bases de datos y Migraciones

Ahora que ha creado su aplicación Laravel, probablemente desee almacenar algunos datos en una base de datos. De forma predeterminada, el archivo de configuración `.env` de su aplicación especifica que Laravel interactuará con una base de datos SQLite.

Durante la creación de la aplicación, Laravel creó un archivo `database/database.sqlite` para usted y ejecutó las migraciones necesarias para crear las tablas de la base de datos de la aplicación.

Si prefiere utilizar otro controlador de base de datos como MySQL o PostgreSQL, puede actualizar su archivo de configuración `.env` para usar la base de datos adecuada. Por ejemplo, si desea utilizar MySQL, actualice las variables `DB_*` de su archivo de configuración `.env` de esta manera:

```ini
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=root
DB_PASSWORD=
```

Si elige utilizar una base de datos que no sea SQLite, deberá crear la base de datos y ejecutar las [migraciones de base de datos](../migrations/) de su aplicación:

```shell
php artisan migrate
```

> **Nota:**
> Si está desarrollando en macOS o Windows y necesita instalar MySQL, PostgreSQL o Redis localmente, considere usar [Herd Pro](https://herd.laravel.com/#plans) o [DBngin](https://dbngin.com/).

<a id="directory-configuration"></a>
### Configuración del directorio

Laravel siempre debe servirse desde la raíz del "directorio web" configurado para su servidor web. No debe intentar servir una aplicación Laravel desde un subdirectorio del "directorio web". Intentar hacerlo podría exponer archivos confidenciales presentes dentro de su aplicación.

<a id="installation-using-herd"></a>
## Instalación usando Herd

[Laravel Herd](https://herd.laravel.com) es un entorno de desarrollo nativo de Laravel y PHP increíblemente rápido para macOS y Windows. Herd incluye todo lo que necesitas para comenzar con el desarrollo de Laravel, incluidos PHP y Nginx.

Una vez que instales Herd, estarás listo para comenzar a desarrollar con Laravel. Herd incluye herramientas de línea de comandos para `php`, `composer`, `laravel`, `expose`, `node`, `npm` y `nvm`.

> **Nota:**
> [Herd Pro](https://herd.laravel.com/#plans) aumenta Herd con potentes funciones adicionales, como la capacidad de crear y administrar bases de datos locales MySQL, Postgres y Redis, así como visualización de correo local y monitoreo de registros.

<a id="herd-on-macos"></a>
### Rebaño en macOS

Si desarrolla en macOS, puede descargar el instalador de Herd desde el [sitio web de Herd](https://herd.laravel.com). El instalador descarga automáticamente la última versión de PHP y configura su Mac para ejecutar siempre [Nginx](https://www.nginx.com/) en segundo plano.

Herd para macOS usa [dnsmasq](https://en.wikipedia.org/wiki/Dnsmasq) para admitir directorios "estacionados". Herd atenderá automáticamente cualquier aplicación Laravel en un directorio estacionado. De forma predeterminada, Herd crea un directorio estacionado en `~/Herd` y puede acceder a cualquier aplicación Laravel en este directorio en el dominio `.test` usando su nombre de directorio.

Después de instalar Herd, la forma más rápida de crear una nueva aplicación Laravel es usar la CLI de Laravel, que viene incluida con Herd:

```shell
cd ~/Herd
laravel new my-app
cd my-app
herd open
```

Por supuesto, siempre puedes administrar tus directorios estacionados y otras configuraciones de PHP a través de la interfaz de usuario de Herd, que se puede abrir desde el menú de Herd en la bandeja del sistema.

Puede obtener más información sobre Herd consultando la [documentación de Herd](https://herd.laravel.com/docs).

<a id="herd-on-windows"></a>
### Rebaño en Windows

Puede descargar el instalador de Windows para Herd en el [sitio web de Herd](https://herd.laravel.com/windows). Una vez finalizada la instalación, puede iniciar Herd para completar el proceso de incorporación y acceder a la interfaz de usuario de Herd por primera vez.

Se puede acceder a la interfaz de usuario de Herd haciendo clic izquierdo en el icono de la bandeja del sistema de Herd. Un clic derecho abre el menú rápido con acceso a todas las herramientas que necesita a diario.

Durante la instalación, Herd crea un directorio "estacionado" en su directorio de inicio en `%USERPROFILE%\Herd`. Herd proporcionará automáticamente cualquier aplicación Laravel en un directorio estacionado, y usted podrá acceder a cualquier aplicación Laravel en este directorio en el dominio `.test` usando su nombre de directorio.

Después de instalar Herd, la forma más rápida de crear una nueva aplicación Laravel es utilizar la CLI de Laravel, que viene incluida con Herd. Para comenzar, abra Powershell y ejecute los siguientes comandos:

```shell
cd ~\Herd
laravel new my-app
cd my-app
herd open
```

Puede obtener más información sobre Herd consultando la [documentación de Herd para Windows](https://herd.laravel.com/docs/windows).

<a id="ide-support"></a>
## Soporte IDE

Eres libre de utilizar cualquier editor de código que desees al desarrollar aplicaciones Laravel. [Laravel LSP](https://github.com/laravel/lsp) proporciona soporte de editor compatible con el marco, que incluye finalización de código, información de desplazamiento, diagnósticos, enlaces de documentos, definición de acceso y soluciones rápidas para el código de Laravel y Blade.

Para instalar Laravel LSP, instálelo globalmente a través de Composer. Asegúrese de que el directorio global de proveedores de Composer esté en su `PATH`:

```shell
composer global require laravel/lsp
```

Si está buscando editores ligeros y extensibles, [VS Code](https://code.visualstudio.com) o [Cursor](https://cursor.com) combinado con el oficial [Laravel VS Code Extension](https://marketplace.visualstudio.com/items?itemName=laravel.vscode-laravel) proporciona resaltado de sintaxis, fragmentos, integración de comandos Artisan y compatibilidad automática con Laravel LSP. Las extensiones oficiales de Laravel también están disponibles para [Sublime Text](https://github.com/laravel/sublime-extension) y [Zed](https://github.com/laravel/zed-extension). Consulte el [repositorio Laravel LSP](https://github.com/laravel/lsp) para obtener instrucciones de configuración para otros editores compatibles con servidores de idiomas, incluidos Neovim y OpenCode.

Para obtener un soporte amplio y sólido de Laravel, eche un vistazo a [PhpStorm](https://www.jetbrains.com/phpstorm/laravel/?utm_source=laravel.com&utm_medium=link&utm_campaign=laravel-2025&utm_content=partner&ref=laravel-2025), un IDE de JetBrains. El soporte integrado del marco Laravel de PhpStorm incluye plantillas Blade, autocompletado inteligente para modelos, rutas, vistas, traducciones y componentes de Eloquent, junto con una poderosa generación de código y navegación a través de proyectos Laravel.

Para aquellos que buscan una experiencia de desarrollo basada en la nube, [Firebase Studio](https://firebase.studio/) brinda acceso instantáneo a la creación con Laravel directamente en su navegador. Sin necesidad de configuración, Firebase Studio facilita comenzar a crear aplicaciones Laravel desde cualquier dispositivo.

<a id="laravel-and-ai"></a>
## Laravel y la IA

[Laravel Boost](https://github.com/laravel/boost) es una herramienta poderosa que cierra la brecha entre los agentes de codificación de IA y las aplicaciones de Laravel. Boost proporciona a los agentes de IA contexto, herramientas y pautas específicas de Laravel para que puedan generar código más preciso y específico de la versión que siga las convenciones de Laravel.

Cuando instala Boost en su aplicación Laravel, los agentes de IA obtienen acceso a más de 15 herramientas especializadas, incluida la capacidad de saber qué paquetes está utilizando, consultar su base de datos, buscar en la documentación de Laravel, leer registros del navegador, generar pruebas y ejecutar código a través de Tinker.

Además, Boost brinda a los agentes de IA acceso a más de 17,000 piezas de documentación vectorizada del ecosistema Laravel, específica para las versiones de sus paquetes instalados. Esto significa que los agentes pueden brindar orientación dirigida a las versiones exactas que utiliza su proyecto.

Boost también incluye pautas de IA mantenidas por Laravel que ayudan a los agentes a seguir las convenciones del marco, escribir pruebas apropiadas y evitar errores comunes al generar código Laravel.

<a id="installing-laravel-boost"></a>
### Instalando Laravel Boost

Boost se puede instalar en aplicaciones Laravel 10, 11, 12 y 13 que ejecutan PHP 8.1 o superior. Para comenzar, instale Boost como dependencia de desarrollo:

```shell
composer require laravel/boost --dev
```

Una vez instalado, ejecute el instalador interactivo:

```shell
php artisan boost:install
```

El instalador detectará automáticamente sus agentes IDE y AI, lo que le permitirá optar por las funciones que tengan sentido para su proyecto. Boost respeta las convenciones de proyectos existentes y no impone reglas de estilo obstinadas de forma predeterminada.

> **Nota:**
> Para obtener más información sobre Boost, consulte el [repositorio de Laravel Boost en GitHub](https://github.com/laravel/boost).

<a id="adding-custom-ai-guidelines"></a>
#### Agregar pautas de IA personalizadas

Para aumentar Laravel Boost con sus propias pautas de IA personalizadas, agregue archivos `.blade.php` o `.md` al directorio `.ai/guidelines/*` de su aplicación. Estos archivos se incluirán automáticamente en las pautas de Laravel Boost cuando ejecute `boost:install`.

<a id="next-steps"></a>
## Próximos pasos

Ahora que ha creado su aplicación Laravel, es posible que se pregunte qué aprender a continuación. Primero, recomendamos encarecidamente familiarizarse con el funcionamiento de Laravel leyendo la siguiente documentación:

<div class="content-list" markdown="1">

- [Solicitar ciclo de vida](../lifecycle/)
- [Configuración](../configuration/)
- [Estructura de directorio](../structure/)
- [Frontal](../frontend/)
- [Contenedor de servicio](../container/)
- [Fachadas](../facades/)

</div>

La forma en que desee utilizar Laravel también determinará los próximos pasos en su viaje. Hay una variedad de formas de usar Laravel y exploraremos dos casos de uso principales para el marco a continuación.

<a id="laravel-the-fullstack-framework"></a>
### Laravel el marco de trabajo completo

Laravel puede servir como un marco de trabajo completo. Por marco "full stack" queremos decir que va a utilizar Laravel para enrutar solicitudes a su aplicación y renderizar su interfaz a través de [plantillas Blade](../blade/) o una tecnología híbrida de aplicación de una sola página como [Inertia](https://inertiajs.com). Esta es la forma más común de utilizar el marco de Laravel y, en nuestra opinión, la forma más productiva de utilizar Laravel.

Si así es como planeas usar Laravel, quizás quieras consultar nuestra documentación sobre [desarrollo frontend](../frontend/), [routing](../routing/), [views](../views/) o [Eloquent ORM](../eloquent/). Además, es posible que le interese conocer paquetes comunitarios como [Livewire](https://livewire.laravel.com) e [Inertia](https://inertiajs.com). Estos paquetes le permiten utilizar Laravel como un marco completo mientras disfruta de muchos de los beneficios de la interfaz de usuario que brindan las aplicaciones JavaScript de una sola página.

Si está utilizando Laravel como marco de trabajo completo, también le recomendamos encarecidamente que aprenda a compilar CSS y JavaScript de su aplicación utilizando [Vite](../vite/).

> **Nota:**
> Si desea comenzar a crear su aplicación, consulte uno de nuestros [kits de inicio de aplicaciones] oficiales](../starter-kits/).

<a id="laravel-the-api-backend"></a>
### Laravel el backend de la API

Laravel también puede servir como backend API para una aplicación móvil o de una sola página de JavaScript. Por ejemplo, puede utilizar Laravel como backend API para su aplicación [Next.js](https://nextjs.org). En este contexto, puede utilizar Laravel para proporcionar [autenticación](../sanctum/) y almacenamiento/recuperación de datos para su aplicación, al mismo tiempo que aprovecha los potentes servicios de Laravel, como colas, correos electrónicos, notificaciones y más.

Si así es como planeas usar Laravel, quizás quieras consultar nuestra documentación sobre [routing](../routing/), [Laravel Sanctum](../sanctum/) y [Eloquent ORM](../eloquent/).
