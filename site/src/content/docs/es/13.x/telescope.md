---
title: "Telescopio Laravel"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Instalación](#installation)
    - [Instalación solo local](#local-only-installation)
    - [Configuración](#configuration)
    - [Poda de datos](#data-pruning)
    - [Autorización del panel](#dashboard-authorization)
- [Actualización del Telescopio](#upgrading-telescope)
- [Filtrado](#filtering)
    - [Entradas](#filtering-entries)
    - [lotes](#filtering-batches)
- [Etiquetado](#tagging)
- [Observadores disponibles](#available-watchers)
    - [Observador de lotes](#batch-watcher)
    - [Vigilante de caché](#cache-watcher)
    - [Comando Vigilante](#command-watcher)
    - [Observador de volcado](#dump-watcher)
    - [Observador de eventos](#event-watcher)
    - [Observador de excepciones](#exception-watcher)
    - [Vigilante de la puerta](#gate-watcher)
    - [Observador de cliente HTTP](#http-client-watcher)
    - [Observador de empleo](#job-watcher)
    - [Observador de registros](#log-watcher)
    - [Vigilante de correo](#mail-watcher)
    - [Modelo Vigilante](#model-watcher)
    - [Observador de notificaciones](#notification-watcher)
    - [Consulta Vigilante](#query-watcher)
    - [Redis Watcher](#redis-watcher)
    - [Solicitar Vigilante](#request-watcher)
    - [Observador de programación](#schedule-watcher)
    - [Ver Vigilante](#view-watcher)
- [Mostrando avatares de usuario](#displaying-user-avatars)

<a id="introduction"></a>
## Introducción

[Laravel Telescope](https://github.com/laravel/telescope) es un maravilloso compañero para su entorno de desarrollo local de Laravel. Telescope proporciona información sobre las solicitudes que llegan a su aplicación, excepciones, entradas de registro, consultas de bases de datos, trabajos en cola, correo, notificaciones, operaciones de caché, tareas programadas, volcados de variables y más.

<img src="https://laravel.com/img/docs/telescope-example.png">

<a id="installation"></a>
## Instalación

Puede utilizar el administrador de paquetes Composer para instalar Telescope en su proyecto Laravel:

```shell
composer require laravel/telescope
```

Después de instalar Telescope, publique sus activos y migraciones utilizando el comando `telescope:install` Artisan. Después de instalar Telescope, también debe ejecutar el comando `migrate` para crear las tablas necesarias para almacenar los datos de Telescope:

```shell
php artisan telescope:install

php artisan migrate
```

Finalmente, puede acceder al panel del Telescopio a través de la ruta `/telescope`.

<a id="local-only-installation"></a>
### Instalación solo local

Si planea utilizar Telescope únicamente para ayudar a su desarrollo local, puede instalar Telescope usando la bandera `--dev`:

```shell
composer require laravel/telescope --dev

php artisan telescope:install

php artisan migrate
```

Después de ejecutar `telescope:install`, debe eliminar el registro del proveedor de servicios `TelescopeServiceProvider` del archivo de configuración `bootstrap/providers.php` de su aplicación. En su lugar, registre manualmente los proveedores de servicios de Telescope en el método `register` de su clase `App\Providers\AppServiceProvider`. Nos aseguraremos de que el entorno actual sea `local` antes de registrar los proveedores:

```php
/**
 * Register any application services.
 */
public function register(): void
{
    if ($this->app->environment('local') && class_exists(\Laravel\Telescope\TelescopeServiceProvider::class)) {
        $this->app->register(\Laravel\Telescope\TelescopeServiceProvider::class);
        $this->app->register(TelescopeServiceProvider::class);
    }
}
```

Finalmente, también debes evitar que el paquete Telescope sea [descubierto automáticamente](../packages/#package-discovery) agregando lo siguiente a tu archivo `composer.json`:

```json
"extra": {
    "laravel": {
        "dont-discover": [
            "laravel/telescope"
        ]
    }
},
```

<a id="configuration"></a>
### Configuración

Después de publicar los activos de Telescope, su archivo de configuración principal se ubicará en `config/telescope.php`. Este archivo de configuración le permite configurar sus [opciones de observador](#available-watchers). Cada opción de configuración incluye una descripción de su propósito, así que asegúrese de explorar este archivo a fondo.

Si lo desea, puede desactivar por completo la recopilación de datos del Telescopio utilizando la opción de configuración `enabled`:

```php
'enabled' => env('TELESCOPE_ENABLED', true),
```

<a id="content-security-policy-csp-nonce"></a>
#### Política de seguridad de contenido (CSP) Nonce

Si desea utilizar un atributo [nonce](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/nonce) en las etiquetas de script y estilo utilizadas en las vistas Telescope como parte de su [Política de seguridad de contenido](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP), puede utilizar el método `Telescope::cspNonce` para especificar el nonce a utilizar. Normalmente, este método debe invocarse dentro del middleware para que se asigne un nuevo nonce a cada solicitud:

```php
use Closure;
use Illuminate\Http\Request;
use Laravel\Telescope\Telescope;
use Symfony\Component\HttpFoundation\Response;

public function handle(Request $request, Closure $next): Response
{
    Telescope::cspNonce('csp-nonce');

    return $next($request);
}
```

Puede agregar este middleware a la opción `middleware` en el archivo de configuración `config/telescope.php` de su aplicación:

```php
'middleware' => [
    'web',
    App\Http\Middleware\AddTelescopeCspNonce::class,
    Authorize::class,
],
```

<a id="data-pruning"></a>
### Poda de datos

Sin poda, la tabla `telescope_entries` puede acumular registros muy rápidamente. Para mitigar esto, debe [programar](../scheduling/) el comando `telescope:prune` Artisan para que se ejecute diariamente:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('telescope:prune')->daily();
```

De forma predeterminada, se eliminarán todas las entradas de más de 24 horas. Puede utilizar la opción `hours` al llamar al comando para determinar durante cuánto tiempo se conservarán los datos del telescopio. Por ejemplo, el siguiente comando eliminará todos los registros creados hace más de 48 horas:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('telescope:prune --hours=48')->daily();
```

<a id="dashboard-authorization"></a>
### Autorización del panel

Se puede acceder al panel del Telescopio a través de la ruta `/telescope`. De forma predeterminada, solo podrá acceder a este panel en el entorno `local`. Dentro de su archivo `app/Providers/TelescopeServiceProvider.php`, hay una [definición de puerta de autorización](../authorization/#gates). Esta puerta de autorización controla el acceso al Telescopio en entornos **no locales**. Usted es libre de modificar esta puerta según sea necesario para restringir el acceso a la instalación de su Telescopio:

```php
use App\Models\User;

/**
 * Register the Telescope gate.
 *
 * This gate determines who can access Telescope in non-local environments.
 */
protected function gate(): void
{
    Gate::define('viewTelescope', function (User $user) {
        return in_array($user->email, [
            'taylor@laravel.com',
        ]);
    });
}
```

> **Advertencia:**
> Debe asegurarse de cambiar su variable de entorno `APP_ENV` a `production` en su entorno de producción. De lo contrario, la instalación de su Telescopio estará disponible públicamente.

<a id="upgrading-telescope"></a>
## Actualización del telescopio

Al actualizar a una nueva versión principal de Telescope, es importante que revise cuidadosamente [la guía de actualización](https://github.com/laravel/telescope/blob/master/UPGRADE.md).

Además, al actualizar a cualquier versión nueva de Telescope, debe volver a publicar los activos de Telescope:

```shell
php artisan telescope:publish
```

Para mantener los activos actualizados y evitar problemas en futuras actualizaciones, puede agregar el comando `vendor:publish --tag=laravel-assets` a los scripts `post-update-cmd` en el archivo `composer.json` de su aplicación:

```json
{
    "scripts": {
        "post-update-cmd": [
            "@php artisan vendor:publish --tag=laravel-assets --ansi --force"
        ]
    }
}
```

<a id="filtering"></a>
## Filtrado

<a id="filtering-entries"></a>
### Entradas

Puede filtrar los datos que registra Telescope a través del cierre `filter` que está definido en su clase `App\Providers\TelescopeServiceProvider`. De forma predeterminada, este cierre registra todos los datos en el entorno `local` y las excepciones, trabajos fallidos, tareas programadas y datos con etiquetas monitoreadas en todos los demás entornos:

```php
use Laravel\Telescope\IncomingEntry;
use Laravel\Telescope\Telescope;

/**
 * Register any application services.
 */
public function register(): void
{
    $this->hideSensitiveRequestDetails();

    Telescope::filter(function (IncomingEntry $entry) {
        if ($this->app->environment('local')) {
            return true;
        }

        return $entry->isReportableException() ||
            $entry->isFailedJob() ||
            $entry->isScheduledTask() ||
            $entry->isSlowQuery() ||
            $entry->hasMonitoredTag();
    });
}
```

<a id="filtering-batches"></a>
### lotes

Si bien el cierre `filter` filtra datos para entradas individuales, puede usar el método `filterBatch` para registrar un cierre que filtre todos los datos para una solicitud o comando de consola determinado. Si el cierre devuelve `true`, Telescope registra todas las entradas:

```php
use Illuminate\Support\Collection;
use Laravel\Telescope\IncomingEntry;
use Laravel\Telescope\Telescope;

/**
 * Register any application services.
 */
public function register(): void
{
    $this->hideSensitiveRequestDetails();

    Telescope::filterBatch(function (Collection $entries) {
        if ($this->app->environment('local')) {
            return true;
        }

        return $entries->contains(function (IncomingEntry $entry) {
            return $entry->isReportableException() ||
                $entry->isFailedJob() ||
                $entry->isScheduledTask() ||
                $entry->isSlowQuery() ||
                $entry->hasMonitoredTag();
            });
    });
}
```

<a id="tagging"></a>
## Etiquetado

Telescope le permite buscar entradas por "etiqueta". A menudo, las etiquetas son nombres de clases de modelos de Eloquent o ID de usuario autenticados que Telescope agrega automáticamente a las entradas. En ocasiones, es posible que desees adjuntar tus propias etiquetas personalizadas a las entradas. Para lograr esto, puede utilizar el método `Telescope::tag`. El método `tag` acepta un cierre que debería devolver una serie de etiquetas. Las etiquetas devueltas por el cierre se fusionarán con cualquier etiqueta que Telescope adjunte automáticamente a la entrada. Normalmente, debes llamar al método `tag` dentro del método `register` de tu clase `App\Providers\TelescopeServiceProvider`:

```php
use Laravel\Telescope\EntryType;
use Laravel\Telescope\IncomingEntry;
use Laravel\Telescope\Telescope;

/**
 * Register any application services.
 */
public function register(): void
{
    $this->hideSensitiveRequestDetails();

    Telescope::tag(function (IncomingEntry $entry) {
        return $entry->type === EntryType::REQUEST
            ? ['status:'.$entry->content['response_status']]
            : [];
    });
}
```

<a id="available-watchers"></a>
## Vigilantes disponibles

Los "observadores" del telescopio recopilan datos de la aplicación cuando se ejecuta una solicitud o un comando de la consola. Puede personalizar la lista de observadores que le gustaría habilitar dentro de su archivo de configuración `config/telescope.php`:

```php
'watchers' => [
    Watchers\CacheWatcher::class => true,
    Watchers\CommandWatcher::class => true,
    // ...
],
```

Algunos observadores también le permiten brindar opciones de personalización adicionales:

```php
'watchers' => [
    Watchers\QueryWatcher::class => [
        'enabled' => env('TELESCOPE_QUERY_WATCHER', true),
        'slow' => 100,
    ],
    // ...
],
```

<a id="batch-watcher"></a>
### Vigilante de lotes

El observador de lotes registra información sobre los [lotes](../queues/#job-batching) en cola, incluida la información del trabajo y la conexión.

<a id="cache-watcher"></a>
### Vigilante de caché

El observador de caché registra datos cuando se presiona, se omite, se actualiza y se olvida una clave de caché.

<a id="command-watcher"></a>
### Vigilante de comandos

El observador de comandos registra los argumentos, las opciones, el código de salida y la salida cada vez que se ejecuta un comando de Artisan. Si desea excluir ciertos comandos para que no sean registrados por el observador, puede especificar el comando en la opción `ignore` dentro de su archivo `config/telescope.php`:

```php
'watchers' => [
    Watchers\CommandWatcher::class => [
        'enabled' => env('TELESCOPE_COMMAND_WATCHER', true),
        'ignore' => ['key:generate'],
    ],
    // ...
],
```

<a id="dump-watcher"></a>
### Vigilante de volcados

El observador de volcados registra y muestra sus volcados de variables en Telescope. Cuando se usa Laravel, las variables se pueden volcar usando la función global `dump`. La pestaña del observador de volcados debe estar abierta en un navegador para que se registre el volcado; de lo contrario, el observador ignorará los volcados.

<a id="event-watcher"></a>
### Observador de eventos

El observador de eventos registra la carga útil, los oyentes y los datos de transmisión de cualquier [events](../events/) enviado por su aplicación. El observador de eventos ignora los eventos internos del marco Laravel.

<a id="exception-watcher"></a>
### Vigilante de excepciones

El observador de excepciones registra los datos y el seguimiento de la pila para cualquier excepción reportable que genere su aplicación.

<a id="gate-watcher"></a>
### Vigilante de la puerta

El vigilante de puerta registra los datos y el resultado de las comprobaciones de [puerta y política](../authorization/) realizadas por su aplicación. Si desea excluir ciertas habilidades del registro del observador, puede especificarlas en la opción `ignore_abilities` en su archivo `config/telescope.php`:

```php
'watchers' => [
    Watchers\GateWatcher::class => [
        'enabled' => env('TELESCOPE_GATE_WATCHER', true),
        'ignore_abilities' => ['viewNova'],
    ],
    // ...
],
```

<a id="http-client-watcher"></a>
### Vigilante del cliente HTTP

El observador del cliente HTTP registra las [solicitudes de cliente HTTP](../http-client/) salientes realizadas por su aplicación.

<a id="job-watcher"></a>
### Observador de empleo

El observador de trabajos registra los datos y el estado de cualquier [jobs](../queues/) enviado por su aplicación.

<a id="log-watcher"></a>
### Vigilante de registros

El observador de registros registra los [datos de registro](../logging/) de cualquier registro escrito por su aplicación.

De forma predeterminada, Telescope solo registrará registros en el nivel `error` y superior. Sin embargo, puede modificar la opción `level` en el archivo de configuración `config/telescope.php` de su aplicación para modificar este comportamiento:

```php
'watchers' => [
    Watchers\LogWatcher::class => [
        'enabled' => env('TELESCOPE_LOG_WATCHER', true),
        'level' => 'debug',
    ],

    // ...
],
```

<a id="mail-watcher"></a>
### Vigilante de correo

El observador de correo le permite ver una vista previa en el navegador de [correos electrónicos](../mail/) enviados por su aplicación junto con sus datos asociados. También puede descargar el correo electrónico como un archivo `.eml`.

<a id="model-watcher"></a>
### Vigilante del modelo

El observador de modelos registra los cambios de modelo cada vez que se envía un Eloquent [model event](../eloquent/#events). Puede especificar qué eventos de modelo deben registrarse mediante la opción `events` del observador:

```php
'watchers' => [
    Watchers\ModelWatcher::class => [
        'enabled' => env('TELESCOPE_MODEL_WATCHER', true),
        'events' => ['eloquent.created*', 'eloquent.updated*'],
    ],
    // ...
],
```

Si desea registrar la cantidad de modelos hidratados durante una solicitud determinada, habilite la opción `hydrations`:

```php
'watchers' => [
    Watchers\ModelWatcher::class => [
        'enabled' => env('TELESCOPE_MODEL_WATCHER', true),
        'events' => ['eloquent.created*', 'eloquent.updated*'],
        'hydrations' => true,
    ],
    // ...
],
```

<a id="notification-watcher"></a>
### Vigilante de notificaciones

El observador de notificaciones registra todas las [notificaciones](../notifications/) enviadas por su aplicación. Si la notificación activa un correo electrónico y tiene habilitado el observador de correo, el correo electrónico también estará disponible para su vista previa en la pantalla del observador de correo.

<a id="query-watcher"></a>
### Vigilante de consultas

El observador de consultas registra el SQL sin formato, los enlaces y el tiempo de ejecución de todas las consultas que ejecuta su aplicación. El observador también etiqueta cualquier consulta de menos de 100 milisegundos como `slow`. Puede personalizar el umbral de consulta lenta utilizando la opción `slow` del observador:

```php
'watchers' => [
    Watchers\QueryWatcher::class => [
        'enabled' => env('TELESCOPE_QUERY_WATCHER', true),
        'slow' => 50,
    ],
    // ...
],
```

<a id="redis-watcher"></a>
### Vigilante de Redis

El observador de Redis registra todos los comandos [Redis](../redis/) ejecutados por su aplicación. Si está utilizando Redis para el almacenamiento en caché, el observador de Redis también registrará los comandos de caché.

<a id="request-watcher"></a>
### Solicitar vigilante

El observador de solicitudes registra los datos de solicitud, encabezados, sesión y respuesta asociados con cualquier solicitud manejada por la aplicación. Puede limitar los datos de respuesta grabados a través de la opción `size_limit` (en kilobytes):

```php
'watchers' => [
    Watchers\RequestWatcher::class => [
        'enabled' => env('TELESCOPE_REQUEST_WATCHER', true),
        'size_limit' => env('TELESCOPE_RESPONSE_SIZE_LIMIT', 64),
    ],
    // ...
],
```

<a id="schedule-watcher"></a>
### Vigilante de horarios

El observador de programación registra el comando y la salida de cualquier [tareas programadas](../scheduling/) ejecutada por su aplicación.

<a id="view-watcher"></a>
### Ver observador

El observador de vistas registra el [nombre, ruta, datos y "compositores" de view](../views/) utilizados al representar vistas.

<a id="displaying-user-avatars"></a>
## Mostrando avatares de usuario

El panel de Telescope muestra el avatar del usuario que se autenticó cuando se guardó una entrada determinada. De forma predeterminada, Telescope recuperará avatares utilizando el servicio web Gravatar. Sin embargo, puede personalizar la URL del avatar registrando una devolución de llamada en su clase `App\Providers\TelescopeServiceProvider`. La devolución de llamada recibirá la identificación del usuario y la dirección de correo electrónico y debería devolver la URL de la imagen del avatar del usuario:

```php
use App\Models\User;
use Laravel\Telescope\Telescope;

/**
 * Register any application services.
 */
public function register(): void
{
    // ...

    Telescope::avatar(function (?string $id, ?string $email) {
        return ! is_null($id)
            ? '/avatars/'.User::find($id)->avatar_path
            : '/generic-avatar.jpg';
    });
}
```
