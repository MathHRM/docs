---
title: "Proveedores de servicios"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Creación de proveedores de servicios](#writing-service-providers)
    - [El método register](#the-register-method)
    - [El método boot](#the-boot-method)
- [Registro de proveedores](#registering-providers)
- [Proveedores diferidos](#deferred-providers)

<a id="introduction"></a>
## Introducción

Los proveedores de servicios son el lugar central de todo el arranque de aplicaciones de Laravel. Tu propia aplicación, así como todos los servicios principales de Laravel, se inician a través de proveedores de servicios.

Pero, ¿qué queremos decir con "arranque"? En general, nos referimos a **registrar** cosas, incluido el registro de vinculaciones del contenedor de servicios, listeners de eventos, middleware e incluso rutas. Los proveedores de servicios son el lugar central para configurar tu aplicación.

Laravel utiliza docenas de proveedores de servicios internamente para iniciar sus servicios principales, como el envío de correo, la cola, el caché y otros. Muchos de estos proveedores son proveedores "diferidos", lo que significa que no se cargarán en cada solicitud, sino sólo cuando los servicios que brindan sean realmente necesarios.

Todos los proveedores de servicios definidos por el usuario están registrados en el archivo `bootstrap/providers.php`. En la siguiente documentación, aprenderás a escribir tus propios proveedores de servicios y registrarlos en tu aplicación Laravel.

> **Nota:**
> Si quieres conocer cómo Laravel gestiona las solicitudes y funciona internamente, consulta nuestra documentación sobre el [ciclo de vida de una solicitud](../lifecycle/).

<a id="writing-service-providers"></a>
## Creación de proveedores de servicios

Todos los proveedores de servicios extienden la clase `Illuminate\Support\ServiceProvider`. La mayoría de los proveedores de servicios contienen los métodos `register` y `boot`. Dentro del método `register`, **solo debes vincular elementos al [contenedor de servicios](../container/)**. Nunca debes intentar registrar listeners de eventos, rutas o cualquier otra funcionalidad dentro del método `register`.

La CLI de Artisan puede generar un nuevo proveedor mediante el comando `make:provider`. Laravel registrará automáticamente tu nuevo proveedor en el archivo `bootstrap/providers.php` de tu aplicación:

```shell
php artisan make:provider RiakServiceProvider
```

<a id="the-register-method"></a>
### El método register

Como se mencionó anteriormente, dentro del método `register`, solo debes vincular cosas al [contenedor de servicios](../container/). Nunca debes intentar registrar listeners de eventos, rutas o cualquier otra funcionalidad dentro del método `register`. De lo contrario, podrías utilizar accidentalmente un servicio proporcionado por un proveedor de servicios que aún no se ha cargado.

Echemos un vistazo a un proveedor de servicios básico. Dentro de cualquiera de los métodos de tu proveedor de servicios, siempre tienes acceso a la propiedad `$app` que proporciona acceso al contenedor de servicios:

```php
<?php

namespace App\Providers;

use App\Services\Riak\Connection;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\ServiceProvider;

class RiakServiceProvider extends ServiceProvider
{
    /**
     * Registrar los servicios de la aplicación.
     */
    public function register(): void
    {
        $this->app->singleton(Connection::class, function (Application $app) {
            return new Connection(config('riak'));
        });
    }
}
```

Este proveedor de servicios solo define un método `register` y utiliza ese método para definir una implementación de `App\Services\Riak\Connection` en el contenedor de servicios. Si aún no estás familiarizado con el contenedor de servicios de Laravel, consulta [su documentación](../container/).

<a id="the-bindings-and-singletons-properties"></a>
#### Las propiedades `bindings` y `singletons`

Si tu proveedor de servicios registra muchas vinculaciones simples, puedes utilizar las propiedades `bindings` y `singletons` en lugar de registrar manualmente cada vinculación del contenedor. Cuando el framework carga el proveedor de servicios, comprobará automáticamente estas propiedades y registrará sus vinculaciones:

```php
<?php

namespace App\Providers;

use App\Contracts\DowntimeNotifier;
use App\Contracts\ServerProvider;
use App\Services\DigitalOceanServerProvider;
use App\Services\PingdomDowntimeNotifier;
use App\Services\ServerToolsProvider;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Todos los bindings del container que deben registrarse.
     *
     * @var array
     */
    public $bindings = [
        ServerProvider::class => DigitalOceanServerProvider::class,
    ];

    /**
     * Todos los singletons del container que deben registrarse.
     *
     * @var array
     */
    public $singletons = [
        DowntimeNotifier::class => PingdomDowntimeNotifier::class,
        ServerProvider::class => ServerToolsProvider::class,
    ];
}
```

<a id="the-boot-method"></a>
### El método boot

Entonces, ¿qué pasa si necesitamos registrar un [compositor de vistas](../views/#view-composers) dentro de nuestro proveedor de servicios? Esto debe hacerse dentro del método `boot`. **Este método se llama después de que todos los demás proveedores de servicios se hayan registrado**, lo que significa que tienes acceso a todos los demás servicios que han sido registrados por el framework:

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class ComposerServiceProvider extends ServiceProvider
{
    /**
     * Inicializar los servicios de la aplicación.
     */
    public function boot(): void
    {
        View::composer('view', function () {
            // ...
        });
    }
}
```

<a id="boot-method-dependency-injection"></a>
#### Inyección de dependencias del método boot

Puedes declarar los tipos de las dependencias en el método `boot` de tu proveedor de servicios. El [contenedor de servicios](../container/) inyectará automáticamente cualquier dependencia que necesites:

```php
use Illuminate\Contracts\Routing\ResponseFactory;

/**
 * Inicializar los servicios de la aplicación.
 */
public function boot(ResponseFactory $response): void
{
    $response->macro('serialized', function (mixed $value) {
        // ...
    });
}
```

<a id="registering-providers"></a>
## Registro de proveedores

Todos los proveedores de servicios están registrados en el archivo de configuración `bootstrap/providers.php`. Este archivo devuelve un array que contiene los nombres de clase de los proveedores de servicios de tu aplicación:

```php
<?php

return [
    App\Providers\AppServiceProvider::class,
];
```

Cuando ejecutas el comando Artisan `make:provider`, Laravel agregará automáticamente el proveedor generado al archivo `bootstrap/providers.php`. Sin embargo, si has creado manualmente la clase del proveedor, debes agregar manualmente la clase de proveedor al array:

```php
<?php

return [
    App\Providers\AppServiceProvider::class,
    App\Providers\ComposerServiceProvider::class, // [tl! add]
];
```

<a id="deferred-providers"></a>
## Proveedores diferidos

Si tu proveedor **solo** registra vinculaciones en el [contenedor de servicios](../container/), puedes posponer su registro hasta que se necesite alguna de las vinculaciones registradas. Aplazar la carga de dicho proveedor mejorará el rendimiento de tu aplicación, ya que no se carga desde el sistema de archivos en cada solicitud.

Laravel compila y almacena una lista de todos los servicios proporcionados por proveedores de servicios diferidos, junto con el nombre de su clase de proveedor de servicios. Luego, solo cuando intentas resolver uno de estos servicios, Laravel carga el proveedor de servicios.

Para diferir la carga de un proveedor, implementa la interfaz `\Illuminate\Contracts\Support\DeferrableProvider` y define un método `provides`. El método `provides` debería devolver las vinculaciones del contenedor de servicios registrados por el proveedor:

```php
<?php

namespace App\Providers;

use App\Services\Riak\Connection;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Contracts\Support\DeferrableProvider;
use Illuminate\Support\ServiceProvider;

class RiakServiceProvider extends ServiceProvider implements DeferrableProvider
{
    /**
     * Registrar los servicios de la aplicación.
     */
    public function register(): void
    {
        $this->app->singleton(Connection::class, function (Application $app) {
            return new Connection($app['config']['riak']);
        });
    }

    /**
     * Obtener los servicios proporcionados por el provider.
     *
     * @return array<int, string>
     */
    public function provides(): array
    {
        return [Connection::class];
    }
}
```
