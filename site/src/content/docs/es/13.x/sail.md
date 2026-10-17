---
title: "Laravel Sail"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Instalación y configuración](#installation)
    - [Reconstrucción de imágenes de Sail](#rebuilding-sail-images)
    - [Configuración de un alias de Shell](#configuring-a-shell-alias)
- [Arrancar y detener Sail](#starting-and-stopping-sail)
- [Ejecutando comandos](#executing-sail-commands)
    - [Ejecutando comandos PHP](#executing-php-commands)
    - [Ejecutando comandos de Composer](#executing-composer-commands)
    - [Ejecutando comandos Artisan](#executing-artisan-commands)
    - [Ejecutando comandos de nodo/NPM](#executing-node-npm-commands)
- [Interactuando con bases de datos](#interacting-with-sail-databases)
    - [MySQL](#mysql)
    - [MongoDB](#mongodb)
    - [Redis](#redis)
    - [Valkey](#valkey)
    - [Meilisearch](#meilisearch)
    - [Typesense](#typesense)
- [Almacenamiento de archivos](#file-storage)
- [Ejecución de pruebas](#running-tests)
    - [Laravel Dusk](#laravel-dusk)
- [Vista previa de correos electrónicos](#previewing-emails)
- [Contenedor CLI](#sail-container-cli)
- [Versiones de PHP](#sail-php-versions)
    - [Extensiones PHP adicionales](#sail-php-extensions)
- [Versiones de nodo](#sail-node-versions)
- [Compartir su sitio](#sharing-your-site)
- [Depuración con Xdebug](#debugging-with-xdebug)
    - [Uso de CLI de Xdebug](#xdebug-cli-usage)
    - [Uso del navegador Xdebug](#xdebug-browser-usage)
- [Personalización](#sail-customization)

<a id="introduction"></a>
## Introducción

[Laravel Sail](https://github.com/laravel/sail) es una interfaz de línea de comandos liviana para interactuar con el entorno de desarrollo Docker predeterminado de Laravel. Sail proporciona un excelente punto de partida para crear una aplicación Laravel utilizando PHP, MySQL y Redis sin necesidad de experiencia previa en Docker.

En esencia, Sail es el archivo `compose.yaml` y el script `sail` que se almacena en la raíz de su proyecto. El script `sail` proporciona una CLI con métodos convenientes para interactuar con los contenedores Docker definidos por el archivo `compose.yaml`.

Laravel Sail es compatible con macOS, Linux y Windows (a través de [WSL2](https://docs.microsoft.com/en-us/windows/wsl/about)).

<a id="installation"></a>
## Instalación y configuración

Puede instalar Sail utilizando el administrador de paquetes de Composer:

```shell
composer require laravel/sail --dev
```

Una vez instalado Sail, puede ejecutar el comando `sail:install` Artisan. Este comando publicará el archivo `compose.yaml` de Sail en la raíz de su aplicación y modificará su archivo `.env` con las variables de entorno requeridas para conectarse a los servicios de Docker:

```shell
php artisan sail:install
```

Finalmente, puedes iniciar Sail. Para continuar aprendiendo cómo usar Sail, continúe leyendo el resto de esta documentación:

```shell
./vendor/bin/sail up
```

> **Advertencia:**
> Si está utilizando Docker Desktop para Linux, debe utilizar el contexto de Docker `default` ejecutando el siguiente comando: `docker context use default`. Además, si encuentra errores de permisos de archivos dentro de los contenedores, es posible que deba configurar la variable de entorno `SUPERVISOR_PHP_USER` en `root`.

<a id="adding-additional-services"></a>
#### Agregar servicios adicionales

Si desea agregar un servicio adicional a su instalación de Sail existente, puede ejecutar el comando `sail:add` Artisan:

```shell
php artisan sail:add
```

<a id="using-devcontainers"></a>
#### Usando contenedores de desarrollo

Si desea desarrollar dentro de un [Devcontainer](https://code.visualstudio.com/docs/remote/containers), puede proporcionar la opción `--devcontainer` al comando `sail:install`. La opción `--devcontainer` indicará al comando `sail:install` que publique un archivo `.devcontainer/devcontainer.json ` predeterminado en la raíz de su aplicación:

```shell
php artisan sail:install --devcontainer
```

<a id="rebuilding-sail-images"></a>
### Reconstrucción de imágenes de Sail

A veces es posible que desees reconstruir completamente tus imágenes de Sail para asegurarte de que todos los paquetes y el software de la imagen estén actualizados. Puede lograr esto usando el comando `build`:

```shell
docker compose down -v

sail build --no-cache

sail up
```

<a id="configuring-a-shell-alias"></a>
### Configuración de un alias de Shell

De forma predeterminada, los comandos de Sail se invocan mediante el script `vendor/bin/sail` que se incluye con todas las aplicaciones nuevas de Laravel:

```shell
./vendor/bin/sail up
```

Sin embargo, en lugar de escribir repetidamente `vendor/bin/sail` para ejecutar los comandos de Sail, es posible que desees configurar un alias de shell que te permita ejecutar los comandos de Sail más fácilmente:

```shell
alias sail='sh $([ -f sail ] && echo sail || echo vendor/bin/sail)'
```

Para asegurarse de que esto esté siempre disponible, puede agregarlo a su archivo de configuración de shell en su directorio de inicio, como `~/.zshrc` o `~/.bashrc`, y luego reiniciar su shell.

Una vez que se haya configurado el alias del shell, puede ejecutar los comandos de Sail simplemente escribiendo `sail`. El resto de los ejemplos de esta documentación asumirán que ha configurado este alias:

```shell
sail up
```

<a id="starting-and-stopping-sail"></a>
## Iniciar y detener la navegación

El archivo `compose.yaml` de Laravel Sail define una variedad de contenedores Docker que funcionan juntos para ayudarlo a crear aplicaciones Laravel. Cada uno de estos contenedores es una entrada dentro de la configuración `services` de su archivo `compose.yaml`. El contenedor `laravel.test` es el contenedor de aplicaciones principal que atenderá su aplicación.

Antes de iniciar Sail, debe asegurarse de que no se estén ejecutando otros servidores web o bases de datos en tu equipo local. Para iniciar todos los contenedores Docker definidos en el archivo `compose.yaml` de su aplicación, debe ejecutar el comando `up`:

```shell
sail up
```

Para iniciar todos los contenedores Docker en segundo plano, puede iniciar Sail en modo "separado":

```shell
sail up -d
```

Una vez iniciados los contenedores de la aplicación, podrá acceder al proyecto en su navegador web en: http://localhost.

Para detener todos los contenedores, simplemente presione Control + C para detener la ejecución del contenedor. O, si los contenedores se ejecutan en segundo plano, puede utilizar el comando `stop`:

```shell
sail stop
```

<a id="executing-sail-commands"></a>
## Ejecutando comandos

Cuando usa Laravel Sail, su aplicación se ejecuta dentro de un contenedor Docker y está aislada de tu equipo local. Sin embargo, Sail proporciona una manera conveniente de ejecutar varios comandos en su aplicación, como comandos PHP arbitrarios, comandos Artisan, comandos Composer y comandos Node/NPM.

**Al leer la documentación de Laravel, a menudo verá referencias a los comandos Composer, Artisan y Node/NPM que no hacen referencia a Sail.** Esos ejemplos suponen que estas herramientas están instaladas en tu equipo local. Si está utilizando Sail para su entorno de desarrollo local de Laravel, debe ejecutar esos comandos usando Sail:

```shell
# Running Artisan commands locally...
php artisan queue:work

# Running Artisan commands within Laravel Sail...
sail artisan queue:work
```

<a id="executing-php-commands"></a>
### Ejecutando comandos PHP

Los comandos PHP se pueden ejecutar usando el comando `php`. Por supuesto, estos comandos se ejecutarán utilizando la versión de PHP configurada para su aplicación. Para obtener más información sobre las versiones de PHP disponibles para Laravel Sail, consulte la [documentación de la versión de PHP](#sail-php-versions):

```shell
sail php --version

sail php script.php
```

<a id="executing-composer-commands"></a>
### Ejecutando comandos de Composer

Los comandos de Composer se pueden ejecutar usando el comando `composer`. El contenedor de aplicaciones de Laravel Sail incluye una instalación de Composer:

```shell
sail composer require laravel/sanctum
```

<a id="executing-artisan-commands"></a>
### Ejecutando comandos Artisan

Los comandos de Laravel Artisan se pueden ejecutar usando el comando `artisan`:

```shell
sail artisan queue:work
```

<a id="executing-node-npm-commands"></a>
### Ejecutando comandos de nodo/NPM

Los comandos de nodo se pueden ejecutar usando el comando `node`, mientras que los comandos NPM se pueden ejecutar usando el comando `npm`:

```shell
sail node --version

sail npm run dev
```

Si lo deseas, puedes usar Yarn en lugar de NPM:

```shell
sail yarn
```

<a id="interacting-with-sail-databases"></a>
## Interactuar con bases de datos

<a id="mysql"></a>
### MySQL

Como habrás notado, el archivo `compose.yaml` de tu aplicación contiene una entrada para un contenedor MySQL. Este contenedor utiliza un [volumen Docker](https://docs.docker.com/storage/volumes/) para que los datos almacenados en su base de datos persistan incluso al detener y reiniciar sus contenedores.

Además, la primera vez que se inicia el contenedor MySQL, creará dos bases de datos. La primera base de datos recibe su nombre utilizando el valor de su variable de entorno `DB_DATABASE` y es para su desarrollo local. La segunda es una base de datos de pruebas dedicada denominada `testing` y garantizará que sus pruebas no interfieran con sus datos de desarrollo.

Una vez que haya iniciado sus contenedores, puede conectarse a la instancia de MySQL dentro de su aplicación configurando su variable de entorno `DB_HOST` dentro del archivo `.env` de su aplicación en `mysql`.

Para conectarse a la base de datos MySQL de su aplicación desde su máquina local, puede utilizar una aplicación de administración de base de datos gráfica como [TablePlus](https://tableplus.com). De forma predeterminada, se puede acceder a la base de datos MySQL en el puerto `localhost` 3306 y las credenciales de acceso corresponden a los valores de las variables de entorno `DB_USERNAME` y `DB_PASSWORD`. O puede conectarse como usuario `root`, que también utiliza el valor de su variable de entorno `DB_PASSWORD` como contraseña.

<a id="mongodb"></a>
### MongoDB

Si elige instalar el servicio [MongoDB](https://www.mongodb.com/) al instalar Sail, el archivo `compose.yaml` de su aplicación contiene una entrada para un contenedor [MongoDB Atlas Local](https://www.mongodb.com/docs/atlas/cli/current/atlas-cli-local-cloud/) que proporciona a la base de datos de documentos MongoDB características de Atlas como [Buscar índices](https://www.mongodb.com/docs/atlas/atlas-search/). Este contenedor utiliza un [volumen Docker](https://docs.docker.com/storage/volumes/) para que los datos almacenados en su base de datos persistan incluso al detener y reiniciar sus contenedores.

Una vez que haya iniciado sus contenedores, puede conectarse a la instancia de MongoDB dentro de su aplicación configurando su variable de entorno `MONGODB_URI` dentro del archivo `.env` de su aplicación en `mongodb://mongodb:27017`. La autenticación está deshabilitada de forma predeterminada, pero puede configurar las variables de entorno `MONGODB_USERNAME` y `MONGODB_PASSWORD` para habilitar la autenticación antes de iniciar el contenedor `mongodb`. Luego, agregue las credenciales a la cadena de conexión:

```ini
MONGODB_USERNAME=user
MONGODB_PASSWORD=laravel
MONGODB_URI=mongodb://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@mongodb:27017
```

Para una integración perfecta de MongoDB con su aplicación, puede instalar el [paquete oficial mantenido por MongoDB](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/).

Para conectarse a la base de datos MongoDB de su aplicación desde su máquina local, puede utilizar una interfaz gráfica como [Compass](https://www.mongodb.com/products/tools/compass). De forma predeterminada, se puede acceder a la base de datos MongoDB en el puerto `localhost` `27017`.

<a id="redis"></a>
### Redis

El archivo `compose.yaml` de su aplicación también contiene una entrada para un contenedor [Redis](https://redis.io). Este contenedor utiliza un [volumen Docker](https://docs.docker.com/storage/volumes/) para que los datos almacenados en su instancia de Redis persistan incluso al detener y reiniciar sus contenedores. Una vez que haya iniciado sus contenedores, puede conectarse a la instancia de Redis dentro de su aplicación configurando su variable de entorno `REDIS_HOST` dentro del archivo `.env` de su aplicación en `redis`.

Para conectarse a la base de datos Redis de su aplicación desde su máquina local, puede utilizar una aplicación de administración de base de datos gráfica como [TablePlus](https://tableplus.com). De forma predeterminada, se puede acceder a la base de datos de Redis en el puerto `localhost` 6379.

<a id="valkey"></a>
### Valkey

Si elige instalar el servicio Valkey al instalar Sail, el archivo `compose.yaml` de su aplicación contendrá una entrada para [Valkey](https://valkey.io/). Este contenedor utiliza un [volumen Docker](https://docs.docker.com/storage/volumes/) para que los datos almacenados en su instancia de Valkey persistan incluso al detener y reiniciar sus contenedores. Puede conectarse a este contenedor en su aplicación configurando su variable de entorno `REDIS_HOST` dentro del archivo `.env` de su aplicación en `valkey`.

Para conectarse a la base de datos Valkey de su aplicación desde su máquina local, puede utilizar una aplicación de administración de base de datos gráfica como [TablePlus](https://tableplus.com). De forma predeterminada, se puede acceder a la base de datos Valkey en el puerto `localhost` 6379.

<a id="meilisearch"></a>
### Meilibúsqueda

Si elige instalar el servicio [Meilisearch](https://www.meilisearch.com) al instalar Sail, el archivo `compose.yaml` de su aplicación contendrá una entrada para este potente motor de búsqueda que está integrado con [Laravel Scout](../scout/). Una vez que haya iniciado sus contenedores, puede conectarse a la instancia de Meilisearch dentro de su aplicación configurando su variable de entorno `MEILISEARCH_HOST` en `http://meilisearch:7700`.

Desde su máquina local, puede acceder al panel de administración basado en web de Meilisearch navegando a `http://localhost:7700` en su navegador web.

<a id="typesense"></a>
### Sentido tipográfico

Si elige instalar el servicio [Typesense](https://typesense.org) al instalar Sail, el archivo `compose.yaml` de su aplicación contendrá una entrada para este veloz motor de búsqueda de código abierto que está integrado de forma nativa con [Laravel Scout](../scout/#typesense). Una vez que haya iniciado sus contenedores, puede conectarse a la instancia de Typesense dentro de su aplicación configurando las siguientes variables de entorno:

```ini
TYPESENSE_HOST=typesense
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
TYPESENSE_API_KEY=xyz
```

Desde su máquina local, puede acceder a la API de Typesense a través de `http://localhost:8108`.

<a id="file-storage"></a>
## Almacenamiento de archivos

Si planea utilizar Amazon S3 para almacenar archivos mientras ejecuta su aplicación en su entorno de producción, es posible que desee instalar el servicio [RustFS](https://rustfs.com) al instalar Sail. RustFS proporciona una API compatible con S3 que puede utilizar para desarrollar localmente utilizando el controlador de almacenamiento de archivos `s3` de Laravel sin crear depósitos de almacenamiento de "prueba" en su entorno de producción S3. Si elige instalar RustFS mientras instala Sail, se agregará una sección de configuración de RustFS al archivo `compose.yaml` de su aplicación.

De forma predeterminada, el archivo de configuración `filesystems` de su aplicación ya contiene una configuración de disco para el disco `s3`. Además de utilizar este disco para interactuar con Amazon S3, puede utilizarlo para interactuar con cualquier servicio de almacenamiento de archivos compatible con S3, como RustFS, simplemente modificando las variables de entorno asociadas que controlan su configuración. Por ejemplo, cuando usa RustFS, la configuración de la variable de entorno de su sistema de archivos debe definirse de la siguiente manera:

```ini
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=sail
AWS_SECRET_ACCESS_KEY=password
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=local
AWS_ENDPOINT=http://rustfs:9000
AWS_USE_PATH_STYLE_ENDPOINT=true
```

<a id="running-tests"></a>
## Ejecución de pruebas

Laravel proporciona un increíble soporte de pruebas listo para usar y puede usar el comando `test` de Sail para ejecutar sus aplicaciones [pruebas de funciones y unidades](../testing/). Cualquier opción de CLI aceptada por Pest/PHPUnit también se puede pasar al comando `test`:

```shell
sail test

sail test --group orders
```

El comando Sail `test` es equivalente a ejecutar el comando `test` Artisan:

```shell
sail artisan test
```

De forma predeterminada, Sail creará una base de datos `testing` dedicada para que sus pruebas no interfieran con el estado actual de su base de datos. En una instalación predeterminada de Laravel, Sail también configurará su archivo `phpunit.xml` para usar esta base de datos al ejecutar sus pruebas:

```xml
<env name="DB_DATABASE" value="testing"/>
```

<a id="laravel-dusk"></a>
### Laravel Dusk

[Laravel Dusk](../dusk/) proporciona una API de prueba y automatización del navegador expresiva y fácil de usar. Gracias a Sail, puedes ejecutar estas pruebas sin tener que instalar Selenium u otras herramientas en tu equipo local. Para comenzar, descomente el servicio Selenium en el archivo `compose.yaml` de su aplicación:

```yaml
selenium:
    image: 'selenium/standalone-chrome'
    extra_hosts:
      - 'host.docker.internal:host-gateway'
    volumes:
        - '/dev/shm:/dev/shm'
    networks:
        - sail
```

A continuación, asegúrese de que el servicio `laravel.test` en el archivo `compose.yaml` de su aplicación tenga una entrada `depends_on` para `selenium`:

```yaml
depends_on:
    - mysql
    - redis
    - selenium
```

Finalmente, puede ejecutar su conjunto de pruebas Dusk iniciando Sail y ejecutando el comando `dusk`:

```shell
sail dusk
```

<a id="selenium-on-apple-silicon"></a>
#### Selenio en Apple Silicon

Si su máquina local contiene un chip Apple Silicon, su servicio `selenium` debe usar la imagen `selenium/standalone-chromium`:

```yaml
selenium:
    image: 'selenium/standalone-chromium'
    extra_hosts:
        - 'host.docker.internal:host-gateway'
    volumes:
        - '/dev/shm:/dev/shm'
    networks:
        - sail
```

<a id="previewing-emails"></a>
## Vista previa de correos electrónicos

El archivo `compose.yaml` predeterminado de Laravel Sail contiene una entrada de servicio para [Mailpit](https://github.com/axllent/mailpit). Mailpit intercepta los correos electrónicos enviados por tu aplicación durante el desarrollo local y proporciona una cómoda interfaz web para que puedas obtener una vista previa de tus mensajes de correo electrónico en tu navegador. Cuando se utiliza Sail, el host predeterminado de Mailpit es `mailpit` y está disponible a través del puerto 1025:

```ini
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_ENCRYPTION=null
```

Cuando Sail se está ejecutando, puede acceder a la interfaz web de Mailpit en: http://localhost:8025

Si elige instalar el servicio [Mailtrap Local](https://github.com/mailtrap/mailtrap-local) al instalar Sail, o lo agrega más tarde usando el comando `sail:add` Artisan, el archivo `compose.yaml` de su aplicación contendrá una entrada para este receptor de correo electrónico. El host predeterminado de Mailtrap Local es `mailtrap-local` y está disponible a través del puerto 3535:

```ini
MAIL_HOST=mailtrap-local
MAIL_PORT=3535
```

Cuando Sail se está ejecutando, puede acceder a la interfaz web de Mailtrap Local en: http://localhost:3550

<a id="sail-container-cli"></a>
## CLI de contenedor

A veces es posible que desees iniciar una sesión de Bash dentro del contenedor de tu aplicación. Puede utilizar el comando `shell` para conectarse al contenedor de su aplicación, lo que le permitirá inspeccionar sus archivos y servicios instalados, así como ejecutar comandos de shell arbitrarios dentro del contenedor:

```shell
sail shell

sail root-shell
```

Para iniciar una nueva sesión [Laravel Tinker](https://github.com/laravel/tinker), puede ejecutar el comando `tinker`:

```shell
sail tinker
```

<a id="sail-php-versions"></a>
## Versiones de PHP

Actualmente, Sail admite la entrega de su aplicación a través de PHP 8.5, 8.4, 8.3, 8.2, 8.1 o PHP 8.0. La versión PHP predeterminada utilizada por Sail es actualmente PHP 8.5. Para cambiar la versión de PHP que se utiliza para servir su aplicación, debe actualizar la definición `build` del contenedor `laravel.test` en el archivo `compose.yaml` de su aplicación:

```yaml
# PHP 8.5
context: ./vendor/laravel/sail/runtimes/8.5

# PHP 8.4
context: ./vendor/laravel/sail/runtimes/8.4

# PHP 8.3
context: ./vendor/laravel/sail/runtimes/8.3

# PHP 8.2
context: ./vendor/laravel/sail/runtimes/8.2

# PHP 8.1
context: ./vendor/laravel/sail/runtimes/8.1

# PHP 8.0
context: ./vendor/laravel/sail/runtimes/8.0
```

Además, es posible que desee actualizar su nombre `image` para reflejar la versión de PHP que utiliza su aplicación. Esta opción también está definida en el archivo `compose.yaml` de su aplicación:

```yaml
image: sail-8.2/app
```

Después de actualizar el archivo `compose.yaml` de su aplicación, debe reconstruir las imágenes de su contenedor:

```shell
sail build --no-cache

sail up
```

<a id="sail-php-extensions"></a>
### Extensiones PHP adicionales

Las imágenes en tiempo de ejecución de Sail incluyen un conjunto común de extensiones PHP. Si su aplicación requiere extensiones adicionales, puede instalarlas al crear la imagen agregando un argumento de compilación `PHP_EXTENSIONS` separado por espacios al servicio `laravel.test` en el archivo `compose.yaml` de su aplicación:

```yaml
build:
    args:
        WWWGROUP: '${WWWGROUP}'
        PHP_EXTENSIONS: 'gmp imagick'
```

Después de actualizar el archivo `compose.yaml` de su aplicación, debe reconstruir las imágenes de su contenedor.

<a id="sail-node-versions"></a>
## Versiones de nodo

Sail instala el Nodo 24 de forma predeterminada. Para cambiar la versión de Nodo que se instala al crear sus imágenes, puede actualizar la definición `build.args` del servicio `laravel.test` en el archivo `compose.yaml` de su aplicación:

```yaml
build:
    args:
        WWWGROUP: '${WWWGROUP}'
        NODE_VERSION: '18'
```

Después de actualizar el archivo `compose.yaml` de su aplicación, debe reconstruir las imágenes de su contenedor:

```shell
sail build --no-cache

sail up
```

<a id="sharing-your-site"></a>
## Compartiendo su sitio

A veces, es posible que necesites compartir tu sitio públicamente para obtener una vista previa de tu sitio para un colega o para probar integraciones de webhooks con tu aplicación. Para compartir su sitio, puede utilizar el comando `share`. Después de ejecutar este comando, se le emitirá una URL `laravel-sail.site` aleatoria que puede utilizar para acceder a su aplicación:

```shell
sail share
```

Al compartir su sitio mediante el comando `share`, debe configurar los servidores proxy confiables de su aplicación utilizando el método de middleware `trustProxies` en el archivo `bootstrap/app.php` de su aplicación. De lo contrario, los asistentes de generación de URL como `url` y `route` no podrán determinar el host HTTP correcto que se debe utilizar durante la generación de URL:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->trustProxies(at: '*');
})
```

Si desea elegir el subdominio para su sitio compartido, puede proporcionar la opción `subdomain` al ejecutar el comando `share`:

```shell
sail share --subdomain=my-sail-site
```

> **Nota:**
> El comando `share` funciona con [Expose](https://github.com/beyondcode/expose), un servicio de tunelización de código abierto de [BeyondCode](https://beyondco.de).

<a id="debugging-with-xdebug"></a>
## Depuración con Xdebug

La configuración Docker de Laravel Sail incluye soporte para [Xdebug](https://xdebug.org/), un depurador popular y potente para PHP. Para habilitar Xdebug, asegúrese de haber [publicado su configuración de Sail](#sail-customization). Luego, agregue las siguientes variables al archivo `.env` de su aplicación para configurar Xdebug:

```ini
SAIL_XDEBUG_MODE=develop,debug,coverage
```

A continuación, asegúrese de que su archivo `php.ini` publicado incluya la siguiente configuración para que Xdebug se active en los modos especificados:

```ini
[xdebug]
xdebug.mode=${XDEBUG_MODE}
```

Después de modificar el archivo `php.ini`, recuerde reconstruir sus imágenes de Docker para que los cambios en el archivo `php.ini` surtan efecto:

```shell
sail build --no-cache
```

#### Configuración IP del host Linux

Internamente, la variable de entorno `XDEBUG_CONFIG` se define como `client_host=host.docker.internal` para que Xdebug se configure correctamente para Mac y Windows (WSL2). Si su máquina local ejecuta Linux y está utilizando Docker 20.10+, `host.docker.internal` está disponible y no se requiere configuración manual.

Para versiones de Docker anteriores a 20.10, `host.docker.internal` no es compatible con Linux y deberá definir manualmente la IP del host. Para hacer esto, configure una IP estática para su contenedor definiendo una red personalizada en su archivo `compose.yaml`:

```yaml
networks:
  custom_network:
    ipam:
      config:
        - subnet: 172.20.0.0/16

services:
  laravel.test:
    networks:
      custom_network:
        ipv4_address: 172.20.0.2
```

Una vez que haya configurado la IP estática, defina la variable SAIL_XDEBUG_CONFIG dentro del archivo .env de su aplicación:

```ini
SAIL_XDEBUG_CONFIG="client_host=172.20.0.2"
```

<a id="xdebug-cli-usage"></a>
### Uso de la CLI de Xdebug

Se puede utilizar un comando `sail debug` para iniciar una sesión de depuración cuando se ejecuta un comando Artisan:

```shell
# Ejecutar un comando Artisan sin Xdebug...
sail artisan migrate

# Ejecutar un comando Artisan con Xdebug...
sail debug migrate
```

<a id="xdebug-browser-usage"></a>
### Uso del navegador Xdebug

Para depurar su aplicación mientras interactúa con la aplicación a través de un navegador web, siga las [instrucciones proporcionadas por Xdebug](https://xdebug.org/docs/step_debug#web-application) para iniciar una sesión de Xdebug desde el navegador web.

Si está utilizando PhpStorm, revise la documentación de JetBrains sobre [depuración de configuración cero](https://www.jetbrains.com/help/phpstorm/zero-configuration-debugging.html).

> **Advertencia:**
> Laravel Sail confía en `artisan serve` para atender su aplicación. El comando `artisan serve` solo acepta las variables `XDEBUG_CONFIG` y `XDEBUG_MODE` a partir de la versión 8.53.0 de Laravel. Las versiones anteriores de Laravel (8.52.0 y anteriores) no admiten estas variables y no aceptarán conexiones de depuración.

<a id="sail-customization"></a>
## Personalización

Dado que Sail es solo Docker, puedes personalizar casi todo lo relacionado con él. Para publicar los Dockerfiles propios de Sail, puede ejecutar el comando `sail:publish`:

```shell
sail artisan sail:publish
```

Después de ejecutar este comando, los Dockerfiles y otros archivos de configuración utilizados por Laravel Sail se colocarán dentro de un directorio `docker` en el directorio raíz de su aplicación. Después de personalizar su instalación de Sail, es posible que desee cambiar el nombre de la imagen del contenedor de la aplicación en el archivo `compose.yaml` de su aplicación. Después de hacerlo, reconstruya los contenedores de su aplicación usando el comando `build`. Asignar un nombre único a la imagen de la aplicación es particularmente importante si utiliza Sail para desarrollar múltiples aplicaciones Laravel en una sola máquina:

```shell
sail build --no-cache
```
