---
title: "Despliegue"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Requisitos del servidor](#server-requirements)
- [Configuración del servidor](#server-configuration)
    - [Nginx](#nginx)
    - [FrankenPHP](#frankenphp)
    - [Permisos de directorio](#directory-permissions)
- [Optimización](#optimization)
    - [Configuración de almacenamiento en caché](#optimizing-configuration-loading)
    - [Almacenamiento en caché de eventos](#caching-events)
    - [Rutas de almacenamiento en caché](#optimizing-route-loading)
    - [Vistas de almacenamiento en caché](#optimizing-view-loading)
- [Servicios de recarga](#reloading-services)
- [Modo de depuración](#debug-mode)
- [La Ruta de la Salud](#the-health-route)
- [Implementación con Laravel Cloud o Forge](#deploying-with-cloud-or-forge)

<a id="introduction"></a>
## Introducción

Cuando esté listo para implementar su aplicación Laravel en producción, hay algunas cosas importantes que puede hacer para asegurarse de que su aplicación se ejecute de la manera más eficiente posible. En este documento, cubriremos algunos excelentes puntos de partida para asegurarnos de que su aplicación Laravel se implemente correctamente.

<a id="server-requirements"></a>
## Requisitos del servidor

El marco Laravel tiene algunos requisitos de sistema. Debe asegurarse de que su servidor web tenga la siguiente versión y extensiones mínimas de PHP:

<div class="content-list" markdown="1">

- PHP >= 8.3
- Extensión PHP Ctype
- Extensión PHP cURL
- Extensión PHP DOM
- Extensión PHP de información de archivo
- Filtrar extensión PHP
- Extensión PHP hash
- Extensión PHP Mbstring
- Extensión PHP OpenSSL
- Extensión PHP PCRE
- Extensión PHP DOP
- Extensión PHP de sesión
- Extensión PHP Tokenizador
- Extensión XML PHP

</div>

<a id="server-configuration"></a>
## Configuración del servidor

<a id="nginx"></a>
### Nginx

Si está implementando su aplicación en un servidor que ejecuta Nginx, puede usar el siguiente archivo de configuración como punto de partida para configurar su servidor web. Lo más probable es que este archivo deba personalizarse según la configuración de su servidor. **Si desea ayuda para administrar su servidor, considere usar una plataforma Laravel completamente administrada como [Laravel Cloud](https://cloud.laravel.com).**

Asegúrese de que, al igual que en la configuración siguiente, su servidor web dirija todas las solicitudes al archivo `public/index.php` de su aplicación. Nunca debe intentar mover el archivo `index.php` a la raíz de su proyecto, ya que servir la aplicación desde la raíz del proyecto expondrá muchos archivos de configuración confidenciales a la Internet pública:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name example.com;
    root /srv/example.com/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ ^/index\.php(/|$) {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_buffer_size 32k;
        fastcgi_buffers 8 32k;
        fastcgi_busy_buffers_size 64k;
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

<a id="frankenphp"></a>
### FrankenPHP

[FrankenPHP](https://frankenphp.dev/) también se puede utilizar para servir sus aplicaciones Laravel. FrankenPHP es un servidor de aplicaciones PHP moderno escrito en Go. Para servir una aplicación PHP Laravel usando FrankenPHP, simplemente puede invocar su comando `php-server`:

```shell
frankenphp php-server -r public/
```

Para aprovechar las funciones más potentes admitidas por FrankenPHP, como su [integración Laravel Octane](../octane/), HTTP/3, compresión moderna o la capacidad de empaquetar aplicaciones Laravel como binarios independientes, consulte la [documentación de Laravel](https://frankenphp.dev/docs/laravel/) de FrankenPHP.

<a id="directory-permissions"></a>
### Permisos de directorio

Laravel necesitará escribir en los directorios `bootstrap/cache` y `storage`, por lo que debes asegurarte de que el propietario del proceso del servidor web tenga permiso para escribir en estos directorios.

<a id="optimization"></a>
## Optimización

Al implementar su aplicación en producción, hay una variedad de archivos que deben almacenarse en caché, incluida su configuración, eventos, rutas y vistas. Laravel proporciona un único y conveniente comando `optimize` Artisan que almacenará en caché todos estos archivos. Normalmente, este comando debe invocarse como parte del proceso de implementación de su aplicación:

```shell
php artisan optimize
```

El método `optimize:clear` se puede utilizar para eliminar todos los archivos de caché generados por el comando `optimize`, así como todas las claves en el controlador de caché predeterminado:

```shell
php artisan optimize:clear
```

En la siguiente documentación, analizaremos cada uno de los comandos de optimización granular que ejecuta el comando `optimize`.

<a id="optimizing-configuration-loading"></a>
### Configuración de almacenamiento en caché

Al implementar su aplicación en producción, debe asegurarse de ejecutar el comando `config:cache` Artisan durante el proceso de implementación:

```shell
php artisan config:cache
```

Este comando combinará todos los archivos de configuración de Laravel en un único archivo en caché, lo que reduce en gran medida la cantidad de viajes que el marco debe realizar al sistema de archivos al cargar sus valores de configuración.

> **Advertencia:**
> Si ejecuta el comando `config:cache` durante el proceso de implementación, debe asegurarse de llamar solo a la función `env` desde sus archivos de configuración. Una vez que la configuración se haya almacenado en caché, el archivo `.env` no se cargará y todas las llamadas a la función `env` para las variables `.env` devolverán `null`.

<a id="caching-events"></a>
### Eventos de almacenamiento en caché

Debe almacenar en caché el evento descubierto automáticamente de su aplicación en las asignaciones de escucha durante el proceso de implementación. Esto se puede lograr invocando el comando `event:cache` Artisan durante la implementación:

```shell
php artisan event:cache
```

<a id="optimizing-route-loading"></a>
### Rutas de almacenamiento en caché

Si está creando una aplicación grande con muchas rutas, debe asegurarse de ejecutar el comando `route:cache` Artisan durante el proceso de implementación:

```shell
php artisan route:cache
```

Este comando reduce todos los registros de rutas en una única llamada a un método dentro de un archivo en caché, lo que mejora el rendimiento del registro de rutas al registrar cientos de rutas.

<a id="optimizing-view-loading"></a>
### Vistas de almacenamiento en caché

Al implementar su aplicación en producción, debe asegurarse de ejecutar el comando `view:cache` Artisan durante el proceso de implementación:

```shell
php artisan view:cache
```

Este comando precompila todas las vistas de Blade para que no se compilen bajo demanda, lo que mejora el rendimiento de cada solicitud que devuelve una vista.

<a id="reloading-services"></a>
## Servicios de recarga

> **Nota:**
> Al implementar en [Laravel Cloud](https://cloud.laravel.com), no es necesario usar el comando `reload`, ya que la recarga elegante de todos los servicios se maneja automáticamente.

Después de implementar una nueva versión de su aplicación, cualquier servicio de ejecución prolongada, como los trabajadores de cola, Laravel Reverb o Laravel Octane, deben recargarse o reiniciarse para usar el nuevo código. Laravel proporciona un único comando `reload` Artisan que finalizará estos servicios:

```shell
php artisan reload
```

Si no está utilizando [Laravel Cloud](https://cloud.laravel.com), debe configurar manualmente un monitor de procesos que pueda detectar cuándo salen sus procesos recargables y reiniciarlos automáticamente.

<a id="debug-mode"></a>
## Modo de depuración

La opción de depuración en su archivo de configuración `config/app.php` determina cuánta información sobre un error se muestra realmente al usuario. De forma predeterminada, esta opción está configurada para respetar el valor de la variable de entorno `APP_DEBUG`, que se almacena en el archivo `.env` de su aplicación.

> **Advertencia:**
> **En su entorno de producción, este valor siempre debe ser `false`. Si la variable `APP_DEBUG` se establece en `true` en producción, corre el riesgo de exponer valores de configuración confidenciales a los usuarios finales de su aplicación.**

<a id="the-health-route"></a>
## La Ruta de la Salud

Laravel incluye una ruta de verificación de estado incorporada que se puede utilizar para monitorear el estado de su aplicación. En producción, esta ruta se puede utilizar para informar el estado de su aplicación a un monitor de tiempo de actividad, un equilibrador de carga o un sistema de orquestación como Kubernetes.

De forma predeterminada, la ruta de verificación de estado se sirve en `/up` y devolverá una respuesta HTTP 200 si la aplicación se inició sin excepciones. De lo contrario, se devolverá una respuesta HTTP 500. Puede configurar el URI para esta ruta en el archivo `bootstrap/app` de su aplicación:

```php
->withRouting(
    web: __DIR__.'/../routes/web.php',
    commands: __DIR__.'/../routes/console.php',
    health: '/up', // [tl! remove]
    health: '/status', // [tl! add]
)
```

Cuando se realizan solicitudes HTTP a esta ruta, Laravel también enviará un evento `Illuminate\Foundation\Events\DiagnosingHealth`, lo que le permitirá realizar comprobaciones de estado adicionales relevantes para su aplicación. Dentro de un [listener](../events/) para este evento, puede verificar el estado de la base de datos o del caché de su aplicación. Si detecta un problema con su aplicación, simplemente puede lanzar una excepción desde el oyente.

<a id="deploying-with-cloud-or-forge"></a>
## Implementación con Laravel Cloud o Forge

<a id="laravel-cloud"></a>
#### Nube Laravel

Si desea una plataforma de implementación totalmente administrada y de escalamiento automático adaptada a Laravel, consulte [Laravel Cloud](https://cloud.laravel.com). Laravel Cloud es una sólida plataforma de implementación para Laravel que ofrece computación administrada, bases de datos, cachés y almacenamiento de objetos.

Inicie su aplicación Laravel en la nube y enamórese de la simplicidad escalable. Los creadores de Laravel han perfeccionado Laravel Cloud para que funcione perfectamente con el marco, de modo que puedas seguir escribiendo tus aplicaciones Laravel exactamente como estás acostumbrado.

<a id="laravel-forge"></a>
#### Forja Laravel

Si prefiere administrar sus propios servidores pero no se siente cómodo configurando todos los diversos servicios necesarios para ejecutar una aplicación Laravel sólida, [Laravel Forge](https://forge.laravel.com) es una plataforma de administración de servidores VPS para aplicaciones Laravel.

Laravel Forge puede crear servidores en varios proveedores de infraestructura como DigitalOcean, Linode, AWS y más. Además, Forge instala y administra todas las herramientas necesarias para crear aplicaciones Laravel sólidas, como Nginx, MySQL, Redis, Memcached, Beanstalk y más.
