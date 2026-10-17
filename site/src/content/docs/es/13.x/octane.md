---
title: "Octano Laravel"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Instalación](#installation)
- [Requisitos previos del servidor](#server-prerequisites)
    - [FrankenPHP](#frankenphp)
    - [RoadRunner](#roadrunner)
    - [Swoole](#swoole)
- [Atendiendo su aplicación](#serving-your-application)
    - [Presentando su aplicación a través de HTTPS](#serving-your-application-via-https)
    - [Servicio de su aplicación a través de Nginx](#serving-your-application-via-nginx)
    - [Buscando cambios en archivos](#watching-for-file-changes)
    - [Especificar el número de trabajadores](#specifying-the-worker-count)
    - [Especificando el número máximo de solicitudes](#specifying-the-max-request-count)
    - [Especificar el tiempo máximo de ejecución](#specifying-the-max-execution-time)
    - [Recargando los Trabajadores](#reloading-the-workers)
    - [Deteniendo el servidor](#stopping-the-server)
- [Inyección de dependencia y Octane](#dependency-injection-and-octane)
    - [Inyección de contenedor](#container-injection)
    - [Solicitar inyección](#request-injection)
    - [Inyección del repositorio de configuración](#configuration-repository-injection)
- [Gestión de pérdidas de memoria](#managing-memory-leaks)
- [Tareas simultáneas](#concurrent-tasks)
- [Tics e intervalos](#ticks-and-intervals)
- [La caché de octano](#the-octane-cache)
    - [Intervalos de caché](#cache-intervals)
- [Tablas](#tables)

<a id="introduction"></a>
## Introducción

[Laravel Octane](https://github.com/laravel/octane) potencia el rendimiento de su aplicación al servirla mediante servidores de aplicaciones de alta potencia, incluidos [FrankenPHP](https://frankenphp.dev/), [Open Swoole](https://openswoole.com/), [Swoole](https://github.com/swoole/swoole-src) y [RoadRunner](https://roadrunner.dev). Octane inicia su aplicación una vez, la mantiene en la memoria y luego envía solicitudes a velocidades supersónicas.

<a id="installation"></a>
## Instalación

Octane se puede instalar a través del administrador de paquetes de Composer:

```shell
composer require laravel/octane
```

Después de instalar Octane, puede ejecutar el comando `octane:install` Artisan, que instalará el archivo de configuración de Octane en su aplicación:

```shell
php artisan octane:install
```

<a id="server-prerequisites"></a>
## Requisitos previos del servidor

<a id="frankenphp"></a>
### FrankenPHP

[FrankenPHP](https://frankenphp.dev) es un servidor de aplicaciones PHP, escrito en Go, que admite funciones web modernas como sugerencias tempranas, Brotli y compresión Zstandard. Cuando instala Octane y elige FrankenPHP como su servidor, Octane descargará e instalará automáticamente el binario FrankenPHP por usted.

<a id="frankenphp-via-laravel-sail"></a>
#### FrankenPHP a través de Laravel Sail

Si planea desarrollar su aplicación usando [Laravel Sail](../sail/), debe ejecutar los siguientes comandos para instalar Octane y FrankenPHP:

```shell
./vendor/bin/sail up

./vendor/bin/sail composer require laravel/octane
```

A continuación, debe utilizar el comando `octane:install` Artisan para instalar el binario FrankenPHP:

```shell
./vendor/bin/sail artisan octane:install --server=frankenphp
```

Finalmente, agregue una variable de entorno `SUPERVISOR_PHP_COMMAND` a la definición de servicio `laravel.test` en el archivo `docker-compose.yml` de su aplicación. Esta variable de entorno contendrá el comando que Sail utilizará para servir su aplicación usando Octane en lugar del servidor de desarrollo PHP:

```yaml
services:
  laravel.test:
    environment:
      SUPERVISOR_PHP_COMMAND: "/usr/bin/php -d variables_order=EGPCS /var/www/html/artisan octane:start --server=frankenphp --host=0.0.0.0 --admin-port=2019 --port='${APP_PORT:-80}'" # [tl! add]
      XDG_CONFIG_HOME:  /var/www/html/config # [tl! add]
      XDG_DATA_HOME:  /var/www/html/data # [tl! add]
```

Para habilitar HTTPS, HTTP/2 y HTTP/3, aplique estas modificaciones en su lugar:

```yaml
services:
  laravel.test:
    ports:
        - '${APP_PORT:-80}:80'
        - '${VITE_PORT:-5173}:${VITE_PORT:-5173}'
        - '443:443' # [tl! add]
        - '443:443/udp' # [tl! add]
    environment:
      SUPERVISOR_PHP_COMMAND: "/usr/bin/php -d variables_order=EGPCS /var/www/html/artisan octane:start --host=localhost --port=443 --admin-port=2019 --https" # [tl! add]
      XDG_CONFIG_HOME:  /var/www/html/config # [tl! add]
      XDG_DATA_HOME:  /var/www/html/data # [tl! add]
```

Normalmente, debe acceder a su aplicación FrankenPHP Sail a través de `https://localhost`, ya que el uso de `https://127.0.0.1` requiere configuración adicional y no se recomienda [](https://frankenphp.dev/docs/known-issues/#using-https127001-with-docker).

<a id="frankenphp-via-docker"></a>
#### FrankenPHP a través de Docker

El uso de las imágenes oficiales de Docker de FrankenPHP puede ofrecer un rendimiento mejorado y el uso de extensiones adicionales no incluidas con las instalaciones estáticas de FrankenPHP. Además, las imágenes oficiales de Docker brindan soporte para ejecutar FrankenPHP en plataformas que no admite de forma nativa, como Windows. Las imágenes oficiales de Docker de FrankenPHP son adecuadas tanto para el desarrollo local como para el uso en producción.

Puede utilizar el siguiente Dockerfile como punto de partida para contener su aplicación Laravel con tecnología FrankenPHP:

```dockerfile
FROM dunglas/frankenphp

RUN install-php-extensions \
    pcntl
    # Añadir aquí otras extensiones de PHP...

COPY . /app

ENTRYPOINT ["php", "artisan", "octane:frankenphp"]
```

Luego, durante el desarrollo, puede utilizar el siguiente archivo Docker Compose para ejecutar su aplicación:

```yaml
# compose.yaml
services:
  frankenphp:
    build:
      context: .
    entrypoint: php artisan octane:frankenphp --workers=1 --max-requests=1
    ports:
      - "8000:8000"
    volumes:
      - .:/app
```

Si la opción `--log-level` se pasa explícitamente al comando `php artisan octane:start`, Octane utilizará el registrador nativo de FrankenPHP y, a menos que se configure de manera diferente, producirá registros JSON estructurados.

Puede consultar [la documentación oficial de FrankenPHP](https://frankenphp.dev/docs/docker/) para obtener más información sobre cómo ejecutar FrankenPHP con Docker.

<a id="frankenphp-caddyfile"></a>
#### Configuración personalizada de Caddyfile

Al usar FrankenPHP, puede especificar un Caddyfile personalizado usando la opción `--caddyfile` al iniciar Octane:

```shell
php artisan octane:start --server=frankenphp --caddyfile=/path/to/your/Caddyfile
```

Esto le permite personalizar la configuración de FrankenPHP más allá de la configuración predeterminada, como agregar middleware personalizado, configurar enrutamiento avanzado o configurar directivas personalizadas. Puede consultar la [documentación oficial de Caddy](https://caddyserver.com/docs/caddyfile) para obtener más información sobre la sintaxis de Caddyfile y las opciones de configuración.

<a id="roadrunner"></a>
### Correcaminos

[RoadRunner](https://roadrunner.dev) funciona con el binario RoadRunner, que se crea con Go. La primera vez que inicie un servidor Octane basado en RoadRunner, Octane le ofrecerá descargar e instalar el binario RoadRunner.

<a id="roadrunner-via-laravel-sail"></a>
#### RoadRunner a través de Laravel Sail

Si planea desarrollar su aplicación usando [Laravel Sail](../sail/), debe ejecutar los siguientes comandos para instalar Octane y RoadRunner:

```shell
./vendor/bin/sail up

./vendor/bin/sail composer require laravel/octane spiral/roadrunner-cli spiral/roadrunner-http
```

A continuación, debe iniciar un shell Sail y utilizar el ejecutable `rr` para recuperar la última versión basada en Linux del binario RoadRunner:

```shell
./vendor/bin/sail shell

# Dentro del shell de Sail...
./vendor/bin/rr get-binary
```

Luego, agregue una variable de entorno `SUPERVISOR_PHP_COMMAND` a la definición de servicio `laravel.test` en el archivo `docker-compose.yml` de su aplicación. Esta variable de entorno contendrá el comando que Sail utilizará para servir su aplicación usando Octane en lugar del servidor de desarrollo PHP:

```yaml
services:
  laravel.test:
    environment:
      SUPERVISOR_PHP_COMMAND: "/usr/bin/php -d variables_order=EGPCS /var/www/html/artisan octane:start --server=roadrunner --host=0.0.0.0 --rpc-port=6001 --port='${APP_PORT:-80}'" # [tl! add]
```

Finalmente, asegúrese de que el binario `rr` sea ejecutable y cree sus imágenes de Sail:

```shell
chmod +x ./rr

./vendor/bin/sail build --no-cache
```

<a id="swoole"></a>
### lana

Si planea utilizar el servidor de aplicaciones Swoole para servir su aplicación Laravel Octane, debe instalar la extensión PHP Swoole. Normalmente, esto se puede hacer mediante PECL:

```shell
pecl install swoole
```

<a id="openswoole"></a>
#### Swoole abierto

Si desea utilizar el servidor de aplicaciones Open Swoole para servir su aplicación Laravel Octane, debe instalar la extensión PHP Open Swoole. Normalmente, esto se puede hacer mediante PECL:

```shell
pecl install openswoole
```

El uso de Laravel Octane con Open Swoole otorga la misma funcionalidad proporcionada por Swoole, como tareas simultáneas, ticks e intervalos.

<a id="swoole-via-laravel-sail"></a>
#### Swoole a través de Laravel Sail

> **Advertencia:**
> Antes de servir una aplicación Octane a través de Sail, asegúrese de tener la última versión de Laravel Sail y ejecute `./vendor/bin/sail build --no-cache` dentro del directorio raíz de su aplicación.

Alternativamente, puede desarrollar su aplicación Octane basada en Swoole usando [Laravel Sail](../sail/), el entorno de desarrollo oficial basado en Docker para Laravel. Laravel Sail incluye la extensión Swoole de forma predeterminada. Sin embargo, aún necesitarás ajustar el archivo `docker-compose.yml` utilizado por Sail.

Para comenzar, agregue una variable de entorno `SUPERVISOR_PHP_COMMAND` a la definición de servicio `laravel.test` en el archivo `docker-compose.yml` de su aplicación. Esta variable de entorno contendrá el comando que Sail utilizará para servir su aplicación usando Octane en lugar del servidor de desarrollo PHP:

```yaml
services:
  laravel.test:
    environment:
      SUPERVISOR_PHP_COMMAND: "/usr/bin/php -d variables_order=EGPCS /var/www/html/artisan octane:start --server=swoole --host=0.0.0.0 --port='${APP_PORT:-80}'" # [tl! add]
```

Finalmente, construye tus imágenes de Vela:

```shell
./vendor/bin/sail build --no-cache
```

<a id="swoole-configuration"></a>
#### Configuración de Swoole

Swoole admite algunas opciones de configuración adicionales que puede agregar a su archivo de configuración `octane` si es necesario. Debido a que rara vez es necesario modificarlas, estas opciones no están incluidas en el archivo de configuración predeterminado:

```php
'swoole' => [
    'options' => [
        'log_file' => storage_path('logs/swoole_http.log'),
        'package_max_length' => 10 * 1024 * 1024,
    ],
],
```

<a id="serving-your-application"></a>
## Entregando su solicitud

El servidor Octane se puede iniciar mediante el comando `octane:start` Artisan. De forma predeterminada, este comando utilizará el servidor especificado por la opción de configuración `server` del archivo de configuración `octane` de su aplicación:

```shell
php artisan octane:start
```

De forma predeterminada, Octane iniciará el servidor en el puerto 8000, por lo que podrá acceder a su aplicación en un navegador web a través de `http://localhost:8000`.

<a id="keeping-octane-running-in-production"></a>
#### Mantener Octane funcionando en producción

Si está implementando su aplicación Octane en producción, debe utilizar un monitor de proceso como Supervisor para garantizar que el servidor Octane siga funcionando. Un archivo de configuración de Supervisor de muestra para Octane podría verse como el siguiente:

```ini
[program:octane]
process_name=%(program_name)s_%(process_num)02d
command=php /home/forge/example.com/artisan octane:start --server=frankenphp --host=127.0.0.1 --port=8000
autostart=true
autorestart=true
user=forge
redirect_stderr=true
stdout_logfile=/home/forge/example.com/storage/logs/octane.log
stopwaitsecs=3600
```

<a id="serving-your-application-via-https"></a>
### Sirviendo su aplicación a través de HTTPS

De forma predeterminada, las aplicaciones que se ejecutan a través de Octane generan enlaces con el prefijo `http://`. La variable de entorno `OCTANE_HTTPS`, utilizada dentro del archivo de configuración `config/octane.php` de su aplicación, se puede configurar en `true` cuando sirve su aplicación a través de HTTPS. Cuando este valor de configuración se establece en `true`, Octane le indicará a Laravel que anteponga todos los enlaces generados con `https://`:

```php
'https' => env('OCTANE_HTTPS', false),
```

<a id="serving-your-application-via-nginx"></a>
### Sirviendo su aplicación a través de Nginx

> **Nota:**
> Si no está listo para administrar la configuración de su propio servidor o no se siente cómodo configurando todos los diversos servicios necesarios para ejecutar una aplicación Laravel Octane sólida, consulte [Laravel Cloud](https://cloud.laravel.com), que ofrece soporte Laravel Octane totalmente administrado.

En entornos de producción, debe servir su aplicación Octane detrás de un servidor web tradicional como Nginx o Apache. Hacerlo permitirá que el servidor web proporcione sus activos estáticos, como imágenes y hojas de estilo, así como también administre la terminación de su certificado SSL.

En el siguiente ejemplo de configuración de Nginx, Nginx entregará los activos estáticos del sitio y las solicitudes de proxy al servidor Octane que se ejecuta en el puerto 8000:

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 80;
    listen [::]:80;
    server_name domain.com;
    server_tokens off;
    root /home/forge/domain.com/public;

    index index.php;

    charset utf-8;

    location /index.php {
        try_files /not_exists @octane;
    }

    location / {
        try_files $uri $uri/ @octane;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    access_log off;
    error_log  /var/log/nginx/domain.com-error.log error;

    error_page 404 /index.php;

    location @octane {
        set $suffix "";

        if ($uri = /index.php) {
            set $suffix ?$query_string;
        }

        proxy_http_version 1.1;
        proxy_set_header Host $http_host;
        proxy_set_header Scheme $scheme;
        proxy_set_header SERVER_PORT $server_port;
        proxy_set_header REMOTE_ADDR $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;

        proxy_pass http://127.0.0.1:8000$suffix;
    }
}
```

<a id="watching-for-file-changes"></a>
### Vigilando los cambios de archivos

Dado que su aplicación se carga en la memoria una vez que se inicia el servidor Octane, cualquier cambio en los archivos de su aplicación no se reflejará cuando actualice su navegador. Por ejemplo, las definiciones de ruta agregadas a su archivo `routes/web.php` no se reflejarán hasta que se reinicie el servidor. Para mayor comodidad, puede usar el indicador `--watch` para indicarle a Octane que reinicie automáticamente el servidor ante cualquier cambio de archivo dentro de su aplicación:

```shell
php artisan octane:start --watch
```

Antes de utilizar esta función, debe asegurarse de que [Node](https://nodejs.org) esté instalado en su entorno de desarrollo local. Además, debes instalar la biblioteca de observación de archivos [Chokidar](https://github.com/paulmillr/chokidar) dentro de tu proyecto:

```shell
npm install --save-dev chokidar
```

Puede configurar los directorios y archivos que deben monitorearse usando la opción de configuración `watch` dentro del archivo de configuración `config/octane.php` de su aplicación.

<a id="specifying-the-worker-count"></a>
### Especificación del recuento de trabajadores

De forma predeterminada, Octane iniciará un trabajador de solicitud de aplicación para cada núcleo de CPU proporcionado por su máquina. Estos trabajadores luego se utilizarán para atender solicitudes HTTP entrantes a medida que ingresan a su aplicación. Puede especificar manualmente cuántos trabajadores le gustaría comenzar a usar la opción `--workers` al invocar el comando `octane:start`:

```shell
php artisan octane:start --workers=4
```

Si está utilizando el servidor de aplicaciones Swoole, también puede especificar cuántos ["trabajadores de tareas"](#concurrent-tasks) desea iniciar:

```shell
php artisan octane:start --workers=4 --task-workers=6
```

<a id="specifying-the-max-request-count"></a>
### Especificación del recuento máximo de solicitudes

Para ayudar a evitar pérdidas de memoria, Octane reinicia elegantemente a cualquier trabajador una vez que ha manejado 500 solicitudes. Para ajustar este número, puede utilizar la opción `--max-requests`:

```shell
php artisan octane:start --max-requests=250
```

<a id="specifying-the-max-execution-time"></a>
### Especificación del tiempo máximo de ejecución

De forma predeterminada, Laravel Octane establece un tiempo máximo de ejecución de 30 segundos para las solicitudes entrantes a través de la opción `max_execution_time` en el archivo de configuración `config/octane.php` de su aplicación:

```php
'max_execution_time' => 30,
```

Esta configuración define la cantidad máxima de segundos que se permite ejecutar una solicitud entrante antes de finalizar. Establecer este valor en `0` deshabilitará por completo el límite de tiempo de ejecución. Esta opción de configuración es particularmente útil para aplicaciones que manejan solicitudes de larga duración, como cargas de archivos, procesamiento de datos o llamadas API a servicios externos.

> **Advertencia:**
> Cuando modifica la configuración de `max_execution_time`, debe reiniciar el servidor Octane para que los cambios surtan efecto.

<a id="reloading-the-workers"></a>
### Recargando a los trabajadores

Puede reiniciar correctamente los trabajadores de aplicaciones del servidor Octane usando el comando `octane:reload`. Normalmente, esto se debe hacer después de la implementación para que el código recién implementado se cargue en la memoria y se utilice para atender solicitudes posteriores:

```shell
php artisan octane:reload
```

<a id="stopping-the-server"></a>
### Deteniendo el servidor

Puede detener el servidor Octane usando el comando `octane:stop` Artisan:

```shell
php artisan octane:stop
```

<a id="checking-the-server-status"></a>
#### Comprobar el estado del servidor

Puede verificar el estado actual del servidor Octane usando el comando `octane:status` Artisan:

```shell
php artisan octane:status
```

<a id="dependency-injection-and-octane"></a>
## Inyección de dependencia y octanaje

Dado que Octane inicia su aplicación una vez y la mantiene en la memoria mientras atiende las solicitudes, hay algunas advertencias que debe considerar al crear su aplicación. Por ejemplo, los métodos `register` y `boot` de los proveedores de servicios de su aplicación solo se ejecutarán una vez cuando el trabajador de solicitudes arranque inicialmente. En solicitudes posteriores, se reutilizará la misma instancia de la aplicación.

En vista de esto, debe tener especial cuidado al inyectar el contenedor del servicio de la aplicación o la solicitud en el constructor de cualquier objeto. Al hacerlo, ese objeto puede tener una versión obsoleta del contenedor o solicitar en solicitudes posteriores.

Octane se encargará automáticamente de restablecer cualquier estado del marco propio entre solicitudes. Sin embargo, Octane no siempre sabe cómo restablecer el estado global creado por su aplicación. Por lo tanto, debe saber cómo construir su aplicación de una manera que sea compatible con Octane. A continuación, analizaremos las situaciones más comunes que pueden causar problemas al utilizar Octane.

<a id="container-injection"></a>
### Inyección de contenedores

En general, debe evitar inyectar el contenedor del servicio de la aplicación o la instancia de solicitud HTTP en los constructores de otros objetos. Por ejemplo, el siguiente enlace inyecta todo el contenedor del servicio de la aplicación en un objeto enlazado como singleton:

```php
use App\Service;
use Illuminate\Contracts\Foundation\Application;

/**
 * Registrar los servicios de la aplicación.
 */
public function register(): void
{
    $this->app->singleton(Service::class, function (Application $app) {
        return new Service($app);
    });
}
```

En este ejemplo, si la instancia `Service` se resuelve durante el proceso de inicio de la aplicación, el contenedor se inyectará en el servicio y la instancia `Service` retendrá ese mismo contenedor en solicitudes posteriores. Esto **puede** no ser un problema para su aplicación particular; sin embargo, puede provocar que al contenedor le falten enlaces inesperados que se agregaron más adelante en el ciclo de arranque o mediante una solicitud posterior.

Como solución alternativa, puede dejar de registrar el enlace como singleton o inyectar una función anónima de resolución de contenedor en el servicio que siempre resuelve la instancia de contenedor actual:

```php
use App\Service;
use Illuminate\Container\Container;
use Illuminate\Contracts\Foundation\Application;

$this->app->bind(Service::class, function (Application $app) {
    return new Service($app);
});

$this->app->singleton(Service::class, function () {
    return new Service(fn () => Container::getInstance());
});
```

El asistente global `app` y el método `Container::getInstance()` siempre devolverán la última versión del contenedor de la aplicación.

<a id="request-injection"></a>
### Solicitar inyección

En general, debe evitar inyectar el contenedor del servicio de la aplicación o la instancia de solicitud HTTP en los constructores de otros objetos. Por ejemplo, el siguiente enlace inyecta la instancia de solicitud completa en un objeto enlazado como singleton:

```php
use App\Service;
use Illuminate\Contracts\Foundation\Application;

/**
 * Registrar los servicios de la aplicación.
 */
public function register(): void
{
    $this->app->singleton(Service::class, function (Application $app) {
        return new Service($app['request']);
    });
}
```

En este ejemplo, si la instancia `Service` se resuelve durante el proceso de inicio de la aplicación, la solicitud HTTP se inyectará en el servicio y la instancia `Service` retendrá esa misma solicitud en solicitudes posteriores. Por lo tanto, todos los datos de encabezados, entradas y cadenas de consulta serán incorrectos, así como todos los demás datos de la solicitud.

Como solución alternativa, podría dejar de registrar el enlace como un singleton o podría inyectar una función anónima de resolución de solicitudes en el servicio que siempre resuelve la instancia de solicitud actual. O bien, el enfoque más recomendado es simplemente pasar la información de solicitud específica que su objeto necesita a uno de los métodos del objeto en tiempo de ejecución:

```php
use App\Service;
use Illuminate\Contracts\Foundation\Application;

$this->app->bind(Service::class, function (Application $app) {
    return new Service($app['request']);
});

$this->app->singleton(Service::class, function (Application $app) {
    return new Service(fn () => $app['request']);
});

// Or...

$service->method($request->input('name'));
```

El asistente global `request` siempre devolverá la solicitud que la aplicación está manejando actualmente y, por lo tanto, es seguro usarlo dentro de su aplicación.

> **Advertencia:**
> Es aceptable escribir sugerencias sobre la instancia `Illuminate\Http\Request` en los métodos de su controlador y funciones anónimas de rutas.

<a id="configuration-repository-injection"></a>
### Inyección del repositorio de configuración

En general, debes evitar inyectar la instancia del repositorio de configuración en los constructores de otros objetos. Por ejemplo, el siguiente enlace inyecta el repositorio de configuración en un objeto enlazado como singleton:

```php
use App\Service;
use Illuminate\Contracts\Foundation\Application;

/**
 * Registrar los servicios de la aplicación.
 */
public function register(): void
{
    $this->app->singleton(Service::class, function (Application $app) {
        return new Service($app->make('config'));
    });
}
```

En este ejemplo, si los valores de configuración cambian entre solicitudes, ese servicio no tendrá acceso a los nuevos valores porque depende de la instancia del repositorio original.

Como solución alternativa, puede dejar de registrar el enlace como singleton o puede inyectar una función anónima de resolución del repositorio de configuración a la clase:

```php
use App\Service;
use Illuminate\Container\Container;
use Illuminate\Contracts\Foundation\Application;

$this->app->bind(Service::class, function (Application $app) {
    return new Service($app->make('config'));
});

$this->app->singleton(Service::class, function () {
    return new Service(fn () => Container::getInstance()->make('config'));
});
```

El `config` global siempre devolverá la última versión del repositorio de configuración y, por lo tanto, es seguro usarlo dentro de su aplicación.

<a id="managing-memory-leaks"></a>
### Gestión de pérdidas de memoria

Recuerde, Octane mantiene su aplicación en la memoria entre solicitudes; por lo tanto, agregar datos a una matriz mantenida estáticamente dará como resultado una pérdida de memoria. Por ejemplo, el siguiente controlador tiene una pérdida de memoria ya que cada solicitud a la aplicación continuará agregando datos a la matriz estática `$data`:

```php
use App\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Gestionar una solicitud entrante.
 */
public function index(Request $request): array
{
    Service::$data[] = Str::random(10);

    return [
        // ...
    ];
}
```

Mientras crea su aplicación, debe tener especial cuidado para evitar crear este tipo de pérdidas de memoria. Se recomienda monitorear el uso de memoria de su aplicación durante el desarrollo local para asegurarse de no introducir nuevas pérdidas de memoria en su aplicación.

<a id="concurrent-tasks"></a>
## Tareas simultáneas

> **Advertencia:**
> Esta función requiere [Swoole](#swoole).

Al utilizar Swoole, puede ejecutar operaciones simultáneamente a través de tareas ligeras en segundo plano. Puede lograr esto utilizando el método `concurrently` de Octane. Puede combinar este método con la desestructuración de matrices PHP para recuperar los resultados de cada operación:

```php
use App\Models\User;
use App\Models\Server;
use Laravel\Octane\Facades\Octane;

[$users, $servers] = Octane::concurrently([
    fn () => User::all(),
    fn () => Server::all(),
]);
```

Las tareas concurrentes procesadas por Octane utilizan los "trabajadores de tareas" de Swoole y se ejecutan dentro de un proceso completamente diferente al de la solicitud entrante. La cantidad de trabajadores disponibles para procesar tareas simultáneas está determinada por la directiva `--task-workers` en el comando `octane:start`:

```shell
php artisan octane:start --workers=4 --task-workers=6
```

Al invocar el método `concurrently`, no debe proporcionar más de 1024 tareas debido a las limitaciones impuestas por el sistema de tareas de Swoole.

<a id="ticks-and-intervals"></a>
## Tics e intervalos

> **Advertencia:**
> Esta función requiere [Swoole](#swoole).

Al utilizar Swoole, puede registrar operaciones de "tick" que se ejecutarán cada número de segundos especificado. Puede registrar devoluciones de llamada "tick" mediante el método `tick`. El primer argumento proporcionado al método `tick` debe ser una cadena que represente el nombre del ticker. El segundo argumento debe ser un invocable que se invocará en el intervalo especificado.

En este ejemplo, registraremos una función anónima que se invocará cada 10 segundos. Normalmente, el método `tick` se debe llamar dentro del método `boot` de uno de los proveedores de servicios de su aplicación:

```php
Octane::tick('simple-ticker', fn () => ray('Ticking...'))
    ->seconds(10);
```

Usando el método `immediate`, puede indicarle a Octane que invoque inmediatamente la devolución de llamada de tick cuando el servidor de Octane arranca inicialmente y cada N segundos a partir de entonces:

```php
Octane::tick('simple-ticker', fn () => ray('Ticking...'))
    ->seconds(10)
    ->immediate();
```

<a id="the-octane-cache"></a>
## La caché de octanaje

> **Advertencia:**
> Esta función requiere [Swoole](#swoole).

Al utilizar Swoole, puede aprovechar el controlador de caché Octane, que proporciona velocidades de lectura y escritura de hasta 2 millones de operaciones por segundo. Por lo tanto, este controlador de caché es una excelente opción para aplicaciones que necesitan velocidades extremas de lectura/escritura desde su capa de caché.

Este controlador de caché funciona con [tablas Swoole](https://www.swoole.co.uk/docs/modules/swoole-table). Todos los datos almacenados en la caché están disponibles para todos los trabajadores del servidor. Sin embargo, los datos almacenados en caché se borrarán cuando se reinicie el servidor:

```php
Cache::store('octane')->put('framework', 'Laravel', 30);
```

> **Nota:**
> El número máximo de entradas permitidas en la caché de Octane se puede definir en el archivo de configuración `octane` de su aplicación.

<a id="cache-intervals"></a>
### Intervalos de caché

Además de los métodos típicos proporcionados por el sistema de caché de Laravel, el controlador de caché Octane presenta cachés basados ​​en intervalos. Estos cachés se actualizan automáticamente en el intervalo especificado y deben registrarse dentro del método `boot` de uno de los proveedores de servicios de su aplicación. Por ejemplo, el siguiente caché se actualizará cada cinco segundos:

```php
use Illuminate\Support\Str;

Cache::store('octane')->interval('random', function () {
    return Str::random(10);
}, seconds: 5);
```

<a id="tables"></a>
## Tablas

> **Advertencia:**
> Esta función requiere [Swoole](#swoole).

Al utilizar Swoole, puede definir e interactuar con sus propias [tablas Swoole](https://www.swoole.co.uk/docs/modules/swoole-table). Las tablas Swoole proporcionan un rendimiento extremo y todos los trabajadores del servidor pueden acceder a los datos de estas tablas. Sin embargo, los datos que contienen se perderán cuando se reinicie el servidor.

Las tablas deben definirse dentro de la matriz de configuración `tables` del archivo de configuración `octane` de su aplicación. Ya está configurada una tabla de ejemplo que permite un máximo de 1000 filas. El tamaño máximo de las columnas de cadena se puede configurar especificando el tamaño de la columna después del tipo de columna como se ve a continuación:

```php
'tables' => [
    'example:1000' => [
        'name' => 'string:1000',
        'votes' => 'int',
    ],
],
```

Para acceder a una tabla, puede utilizar el método `Octane::table`:

```php
use Laravel\Octane\Facades\Octane;

Octane::table('example')->set('uuid', [
    'name' => 'Nuno Maduro',
    'votes' => 1000,
]);

return Octane::table('example')->get('uuid');
```

> **Advertencia:**
> Los tipos de columnas admitidos por las tablas Swoole son: `string`, `int` y `float`.
