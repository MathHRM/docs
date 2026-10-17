---
title: "Banderín de Laravel"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Instalación](#installation)
- [Configuración](#configuration)
- [Características definitorias](#defining-features)
    - [Características basadas en clases](#class-based-features)
- [Comprobación de funciones](#checking-features)
    - [Ejecución condicional](#conditional-execution)
    - [El rasgo `HasFeatures`](#the-has-features-trait)
    - [Directiva de cuchillas](#blade-directive)
    - [Middleware](#middleware)
    - [Comprobaciones de funciones de interceptación](#intercepting-feature-checks)
    - [Caché en memoria](#in-memory-cache)
- [Alcance](#scope)
    - [Especificando el alcance](#specifying-the-scope)
    - [Alcance global](#global-scope)
    - [Alcance predeterminado](#default-scope)
    - [Alcance anulable](#nullable-scope)
    - [Identificación del alcance](#identifying-scope)
    - [Serialización de alcance](#serializing-scope)
- [Valores de funciones enriquecidos](#rich-feature-values)
- [Recuperando múltiples funciones](#retrieving-multiple-features)
- [Carga ansiosa](#eager-loading)
- [Actualizando Valores](#updating-values)
    - [Actualizaciones masivas](#bulk-updates)
    - [Funciones de purga](#purging-features)
- [Prueba](#testing)
- [Agregar controladores de banderín personalizados](#adding-custom-pennant-drivers)
    - [Implementación del controlador ](#implementing-the-driver)
    - [Registro del controlador ](#registering-the-driver)
    - [Definición de características externas](#defining-features-externally)
- [Eventos](#events)

<a id="introduction"></a>
## Introducción

[Laravel Pennant](https://github.com/laravel/pennant) es un paquete de banderas con funciones simples y livianos, sin el cruft. Los indicadores de funciones le permiten implementar de forma incremental nuevas funciones de aplicaciones con confianza, probar A/B nuevos diseños de interfaz, complementar una estrategia de desarrollo basada en troncales y mucho más.

<a id="installation"></a>
## Instalación

Primero, instale Pennant en su proyecto usando el administrador de paquetes de Composer:

```shell
composer require laravel/pennant
```

A continuación, debe publicar los archivos de configuración y migración de Pennant utilizando el comando `vendor:publish` Artisan:

```shell
php artisan vendor:publish --provider="Laravel\Pennant\PennantServiceProvider"
```

Finalmente, debes ejecutar las migraciones de la base de datos de tu aplicación. Esto creará una tabla `features` que Pennant utiliza para alimentar su controlador `database`:

```shell
php artisan migrate
```

<a id="configuration"></a>
## Configuración

Después de publicar los activos de Pennant, su archivo de configuración se ubicará en `config/pennant.php`. Este archivo de configuración le permite especificar el mecanismo de almacenamiento predeterminado que utilizará Pennant para almacenar los valores de indicadores de características resueltos.

Pennant incluye soporte para almacenar valores de indicadores de características resueltos en una matriz en memoria a través del controlador `array`. O bien, Pennant puede almacenar valores de indicadores de características resueltos de forma persistente en una base de datos relacional a través del controlador `database`, que es el mecanismo de almacenamiento predeterminado utilizado por Pennant.

<a id="defining-features"></a>
## Definición de características

Para definir una característica, puede utilizar el método `define` que ofrece la fachada `Feature`. Deberá proporcionar un nombre para la función, así como una función anónima que se invocará para resolver el valor inicial de la función.

Normalmente, las características se definen en un proveedor de servicios utilizando la fachada `Feature`. La función anónima recibirá el "alcance" para la verificación de características. Lo más habitual es que el ámbito sea el usuario actualmente autenticado. En este ejemplo, definiremos una función para implementar incrementalmente una nueva API para los usuarios de nuestra aplicación:

```php
<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Support\Lottery;
use Illuminate\Support\ServiceProvider;
use Laravel\Pennant\Feature;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Inicializar los servicios de la aplicación.
     */
    public function boot(): void
    {
        Feature::define('new-api', fn (User $user) => match (true) {
            $user->isInternalTeamMember() => true,
            $user->isHighTrafficCustomer() => false,
            default => Lottery::odds(1 / 100),
        });
    }
}
```

Como puede ver, tenemos las siguientes reglas para nuestra función:

- Todos los miembros del equipo interno deberían utilizar la nueva API.
- Los clientes con mucho tráfico no deberían utilizar la nueva API.
- De lo contrario, la función debe asignarse aleatoriamente a usuarios con una probabilidad de 1 entre 100 de estar activa.

La primera vez que se verifica la función `new-api` para un usuario determinado, el controlador de almacenamiento almacenará el resultado de la función anónima. La próxima vez que se verifique la función con el mismo usuario, el valor se recuperará del almacenamiento y no se invocará la función anónima.

Por conveniencia, si una definición de característica solo devuelve una lotería, puede omitir la función anónima por completo:

    Característica::define('rediseño del sitio', Lotería::probabilidades(1, 1000));

<a id="class-based-features"></a>
### Funciones basadas en clases

Pennant también le permite definir características basadas en clases. A diferencia de las definiciones de características basadas en funciones anónimas, no es necesario registrar una característica basada en clases en un proveedor de servicios. Para crear una característica basada en clases, puede invocar el comando `pennant:feature` Artisan. De forma predeterminada, la clase de entidad se colocará en el directorio `app/Features` de su aplicación:

```shell
php artisan pennant:feature NewApi
```

Al escribir una clase de entidad, solo necesita definir un método `resolve`, que se invocará para resolver el valor inicial de la característica para un alcance determinado. Nuevamente, el alcance normalmente será el usuario actualmente autenticado:

```php
<?php

namespace App\Features;

use App\Models\User;
use Illuminate\Support\Lottery;

class NewApi
{
    /**
     * Resolve the feature's initial value.
     */
    public function resolve(User $user): mixed
    {
        return match (true) {
            $user->isInternalTeamMember() => true,
            $user->isHighTrafficCustomer() => false,
            default => Lottery::odds(1 / 100),
        };
    }
}
```

Si desea resolver manualmente una instancia de una característica basada en clases, puede invocar el método `instance` en la fachada `Feature`:

```php
use App\Features\NewApi;
use Laravel\Pennant\Feature;

$instance = Feature::instance(NewApi::class);
```

> **Nota:**
> Las clases de entidad se resuelven a través del [container](../container/), por lo que puede inyectar dependencias en el constructor de la clase de entidad cuando sea necesario.

#### Personalización del nombre de la función almacenada

De forma predeterminada, Pennant almacenará el nombre de clase completo de la clase de entidad. Si desea desacoplar el nombre de la característica almacenada de la estructura interna de la aplicación, puede agregar el atributo `Name` en la clase de entidad. El valor de este atributo se almacenará en lugar del nombre de la clase:

```php
<?php

namespace App\Features;

use Laravel\Pennant\Attributes\Name;

#[Name('new-api')]
class NewApi
{
    // ...
}
```

<a id="checking-features"></a>
## Comprobación de funciones

Para determinar si una característica está activa, puede utilizar el método `active` en la fachada `Feature`. De forma predeterminada, las funciones se comparan con el usuario actualmente autenticado:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Laravel\Pennant\Feature;

class PodcastController
{
    /**
     * Mostrar un listado del recurso.
     */
    public function index(Request $request): Response
    {
        return Feature::active('new-api')
            ? $this->resolveNewApiResponse($request)
            : $this->resolveLegacyApiResponse($request);
    }

    // ...
}
```

Aunque las funciones se comparan con el usuario actualmente autenticado de forma predeterminada, puede comparar fácilmente la función con otro usuario o [scope](#scope). Para lograr esto, utilice el método `for` que ofrece la fachada `Feature`:

```php
return Feature::for($user)->active('new-api')
    ? $this->resolveNewApiResponse($request)
    : $this->resolveLegacyApiResponse($request);
```

Pennant también ofrece algunos métodos convenientes adicionales que pueden resultar útiles al determinar si una función está activa o no:

```php
// Determinar si todas las features indicadas están activas...
Feature::allAreActive(['new-api', 'site-redesign']);

// Determinar si alguna de las features indicadas está activa...
Feature::someAreActive(['new-api', 'site-redesign']);

// Determinar si una feature está inactiva...
Feature::inactive('new-api');

// Determinar si todas las features indicadas están inactivas...
Feature::allAreInactive(['new-api', 'site-redesign']);

// Determinar si alguna de las features indicadas está inactiva...
Feature::someAreInactive(['new-api', 'site-redesign']);
```

> **Nota:**
> Cuando utilice Pennant fuera de un contexto HTTP, como en un comando Artisan o un trabajo en cola, normalmente debe [especificar explícitamente el alcance de la función](#specifying-the-scope). Alternativamente, puede definir un [alcance predeterminado](#default-scope) que tenga en cuenta tanto contextos HTTP autenticados como contextos no autenticados.

<a id="checking-class-based-features"></a>
#### Comprobación de funciones basadas en clases

Para funciones basadas en clases, debe proporcionar el nombre de la clase al verificar la función:

```php
<?php

namespace App\Http\Controllers;

use App\Features\NewApi;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Laravel\Pennant\Feature;

class PodcastController
{
    /**
     * Mostrar un listado del recurso.
     */
    public function index(Request $request): Response
    {
        return Feature::active(NewApi::class)
            ? $this->resolveNewApiResponse($request)
            : $this->resolveLegacyApiResponse($request);
    }

    // ...
}
```

<a id="conditional-execution"></a>
### Ejecución condicional

El método `when` se puede utilizar para ejecutar con fluidez una función anónima determinada si una función está activa. Además, se puede proporcionar una segunda función anónima que se ejecutará si la función está inactiva:

```php
<?php

namespace App\Http\Controllers;

use App\Features\NewApi;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Laravel\Pennant\Feature;

class PodcastController
{
    /**
     * Mostrar un listado del recurso.
     */
    public function index(Request $request): Response
    {
        return Feature::when(NewApi::class,
            fn () => $this->resolveNewApiResponse($request),
            fn () => $this->resolveLegacyApiResponse($request),
        );
    }

    // ...
}
```

El método `unless` sirve como inverso del método `when`, ejecutando la primera función anónima si la característica está inactiva:

```php
return Feature::unless(NewApi::class,
    fn () => $this->resolveLegacyApiResponse($request),
    fn () => $this->resolveNewApiResponse($request),
);
```

<a id="the-has-features-trait"></a>
### El rasgo `HasFeatures`

El rasgo `HasFeatures` de Pennant se puede agregar al modelo `User` de su aplicación (o cualquier otro modelo que tenga características) para proporcionar una manera fluida y conveniente de verificar las características directamente desde el modelo:

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Pennant\Concerns\HasFeatures;

class User extends Authenticatable
{
    use HasFeatures;

    // ...
}
```

Una vez que se haya agregado el rasgo a su modelo, puede verificar fácilmente las características invocando el método `features`:

```php
if ($user->features()->active('new-api')) {
    // ...
}
```

Por supuesto, el método `features` proporciona acceso a muchos otros métodos convenientes para interactuar con funciones:

```php
// Values...
$value = $user->features()->value('purchase-button');
$values = $user->features()->values(['new-api', 'purchase-button']);

// State...
$user->features()->active('new-api');
$user->features()->allAreActive(['new-api', 'server-api']);
$user->features()->someAreActive(['new-api', 'server-api']);

$user->features()->inactive('new-api');
$user->features()->allAreInactive(['new-api', 'server-api']);
$user->features()->someAreInactive(['new-api', 'server-api']);

// Conditional execution...
$user->features()->when('new-api',
    fn () => /* ... */,
    fn () => /* ... */,
);

$user->features()->unless('new-api',
    fn () => /* ... */,
    fn () => /* ... */,
);
```

<a id="blade-directive"></a>
### Directiva de cuchillas

Para que las funciones de verificación en Blade sean una experiencia perfecta, Pennant ofrece las directivas `@feature` y `@featureany`:

```blade
@feature('site-redesign')
    <!-- 'site-redesign' is active -->
@else
    <!-- 'site-redesign' is inactive -->
@endfeature

@featureany(['site-redesign', 'beta'])
    <!-- 'site-redesign' or `beta` is active -->
@endfeatureany
```

<a id="middleware"></a>
### Middleware

Pennant también incluye un [middleware](../middleware/) que puede usarse para verificar que el usuario actualmente autenticado tenga acceso a una función incluso antes de que se invoque una ruta. Puede asignar el middleware a una ruta y especificar las funciones necesarias para acceder a la ruta. Si alguna de las funciones especificadas está inactiva para el usuario actualmente autenticado, la ruta devolverá una respuesta HTTP `400 Bad Request`. Se pueden pasar varias funciones al método estático `using`.

```php
use Illuminate\Support\Facades\Route;
use Laravel\Pennant\Middleware\EnsureFeaturesAreActive;

Route::get('/api/servers', function () {
    // ...
})->middleware(EnsureFeaturesAreActive::using('new-api', 'servers-api'));
```

<a id="customizing-the-response"></a>
#### Personalizando la respuesta

Si desea personalizar la respuesta que devuelve el middleware cuando una de las funciones enumeradas está inactiva, puede utilizar el método `whenInactive` proporcionado por el middleware `EnsureFeaturesAreActive`. Normalmente, este método debe invocarse dentro del método `boot` de uno de los proveedores de servicios de su aplicación:

```php
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Laravel\Pennant\Middleware\EnsureFeaturesAreActive;

/**
 * Inicializar los servicios de la aplicación.
 */
public function boot(): void
{
    EnsureFeaturesAreActive::whenInactive(
        function (Request $request, array $features) {
            return new Response(status: 403);
        }
    );

    // ...
}
```

<a id="intercepting-feature-checks"></a>
### Verificaciones de funciones de interceptación

A veces puede resultar útil realizar algunas comprobaciones en memoria antes de recuperar el valor almacenado de una característica determinada. Imagine que está desarrollando una nueva API detrás de una marca de función y desea poder deshabilitar la nueva API sin perder ninguno de los valores de función resueltos en el almacenamiento. Si nota un error en la nueva API, puede deshabilitarla fácilmente para todos, excepto para los miembros internos del equipo, corregir el error y luego volver a habilitar la nueva API para los usuarios que anteriormente tenían acceso a la función.

Puede lograr esto con un método [de característica basada en clases ](#class-based-features) `before`. Cuando está presente, el método `before` siempre se ejecuta en la memoria antes de recuperar el valor del almacenamiento. Si el método devuelve un valor que no es `null`, se utilizará en lugar del valor almacenado de la característica durante la duración de la solicitud:

```php
<?php

namespace App\Features;

use App\Models\User;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Lottery;

class NewApi
{
    /**
     * Ejecutar una comprobación siempre en memoria antes de recuperar el valor almacenado.
     */
    public function before(User $user): mixed
    {
        if (Config::get('features.new-api.disabled')) {
            return $user->isInternalTeamMember();
        }
    }

    /**
     * Resolve the feature's initial value.
     */
    public function resolve(User $user): mixed
    {
        return match (true) {
            $user->isInternalTeamMember() => true,
            $user->isHighTrafficCustomer() => false,
            default => Lottery::odds(1 / 100),
        };
    }
}
```

También puede utilizar esta función para programar la implementación global de una función que anteriormente estaba detrás de una marca de función:

```php
<?php

namespace App\Features;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;

class NewApi
{
    /**
     * Ejecutar una comprobación siempre en memoria antes de recuperar el valor almacenado.
     */
    public function before(User $user): mixed
    {
        if (Config::get('features.new-api.disabled')) {
            return $user->isInternalTeamMember();
        }

        if (Carbon::parse(Config::get('features.new-api.rollout-date'))->isPast()) {
            return true;
        }
    }

    // ...
}
```

<a id="in-memory-cache"></a>
### Caché en memoria

Al verificar una característica, Pennant creará un caché en memoria del resultado. Si está utilizando el controlador `database`, esto significa que volver a verificar el mismo indicador de característica dentro de una sola solicitud no activará consultas adicionales a la base de datos. Esto también garantiza que la función tenga un resultado consistente mientras dure la solicitud.

Si necesita vaciar manualmente el caché en memoria, puede usar el método `flushCache` que ofrece la fachada `Feature`:

```php
Feature::flushCache();
```

<a id="scope"></a>
## Alcance

<a id="specifying-the-scope"></a>
### Especificación del alcance

Como se mencionó, las funciones generalmente se comparan con el usuario actualmente autenticado. Sin embargo, es posible que esto no siempre se adapte a sus necesidades. Por lo tanto, es posible especificar el alcance con el que le gustaría comparar una característica determinada mediante el método `for` de la fachada `Feature`:

```php
return Feature::for($user)->active('new-api')
    ? $this->resolveNewApiResponse($request)
    : $this->resolveLegacyApiResponse($request);
```

Por supuesto, el alcance de las funciones no se limita a los "usuarios". Imagine que ha creado una nueva experiencia de facturación que está implementando para equipos completos en lugar de usuarios individuales. Quizás le gustaría que los equipos más antiguos tuvieran un lanzamiento más lento que los equipos más nuevos. La función anónima de resolución de su función podría verse así:

```php
use App\Models\Team;
use Illuminate\Support\Carbon;
use Illuminate\Support\Lottery;
use Laravel\Pennant\Feature;

Feature::define('billing-v2', function (Team $team) {
    if ($team->created_at->isAfter(new Carbon('1st Jan, 2023'))) {
        return true;
    }

    if ($team->created_at->isAfter(new Carbon('1st Jan, 2019'))) {
        return Lottery::odds(1 / 100);
    }

    return Lottery::odds(1 / 1000);
});
```

Notará que la función anónima que hemos definido no espera un modelo `User`, sino un modelo `Team`. Para determinar si esta característica está activa para el equipo de un usuario, se debe pasar el equipo al método `for` que ofrece la fachada `Feature`:

```php
if (Feature::for($user->team)->active('billing-v2')) {
    return redirect('/billing/v2');
}

// ...
```

<a id="global-scope"></a>
### Alcance global

Para verificar o interactuar con una característica usando un alcance global, independientemente del solucionador de alcance predeterminado configurado, use el método `globally`. Esto es útil para indicadores de funciones en toda la aplicación, como habilitar temporalmente el comportamiento de mantenimiento o implementar una función para cada usuario:

```php
Feature::globally()->active('new-api');

Feature::globally()->activate('new-api');
```

<a id="default-scope"></a>
### Alcance predeterminado

También es posible personalizar el alcance predeterminado que utiliza Pennant para comprobar las funciones. Por ejemplo, tal vez todas sus funciones se verifiquen con el equipo del usuario actualmente autenticado en lugar del usuario. En lugar de tener que llamar a `Feature::for($user->team)` cada vez que verifica una función, puede especificar el equipo como alcance predeterminado. Normalmente, esto se debe hacer en uno de los proveedores de servicios de su aplicación:

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;
use Laravel\Pennant\Feature;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Inicializar los servicios de la aplicación.
     */
    public function boot(): void
    {
        Feature::resolveScopeUsing(fn ($driver) => Auth::user()?->team);

        // ...
    }
}
```

Si no se proporciona ningún alcance explícitamente a través del método `for`, la verificación de funciones ahora utilizará el equipo del usuario actualmente autenticado como alcance predeterminado:

```php
Feature::active('billing-v2');

// Is now equivalent to...

Feature::for($user->team)->active('billing-v2');
```

<a id="nullable-scope"></a>
### Alcance anulable

Si el alcance que proporciona al verificar una característica es `null` y la definición de la característica no admite `null` a través de un tipo que acepta valores NULL o al incluir `null` en un tipo de unión, Pennant devolverá automáticamente `false` como valor de resultado de la característica.

Por lo tanto, si el alcance que está pasando a una característica es potencialmente `null` y desea que se invoque el solucionador de valores de la característica, debe tenerlo en cuenta en la definición de su característica. Es posible que se produzca un alcance `null` si marca una función dentro de un comando de Artisan, un trabajo en cola o una ruta no autenticada. Dado que normalmente no hay un usuario autenticado en estos contextos, el alcance predeterminado será `null`.

Si no siempre [especifica explícitamente el alcance de su característica](#specifying-the-scope), entonces debe asegurarse de que el tipo de alcance sea "anulable" y manejar el valor del alcance `null` dentro de su lógica de definición de característica:

```php
use App\Models\User;
use Illuminate\Support\Lottery;
use Laravel\Pennant\Feature;

Feature::define('new-api', fn (User $user) => match (true) {// [tl! remove]
Feature::define('new-api', fn (User|null $user) => match (true) {// [tl! add]
    $user === null => true,// [tl! add]
    $user->isInternalTeamMember() => true,
    $user->isHighTrafficCustomer() => false,
    default => Lottery::odds(1 / 100),
});
```

<a id="identifying-scope"></a>
### Identificación del alcance

Los controladores de almacenamiento `array` y `database` integrados de Pennant saben cómo almacenar correctamente identificadores de alcance para todos los tipos de datos PHP, así como para los modelos Eloquent. Sin embargo, si su aplicación utiliza un controlador Pennant de terceros, es posible que ese controlador no sepa cómo almacenar correctamente un identificador para un modelo Eloquent u otros tipos personalizados en su aplicación.

En vista de esto, Pennant le permite formatear los valores de alcance para su almacenamiento implementando el contrato `FeatureScopeable` en los objetos de su aplicación que se utilizan como alcances de Pennant.

Por ejemplo, imagine que está utilizando dos controladores de funciones diferentes en una sola aplicación: el controlador `database` integrado y un controlador "Flag Rocket" de terceros. El conductor de "Flag Rocket" no sabe cómo almacenar correctamente un modelo de Eloquent. En cambio, requiere una instancia `FlagRocketUser`. Al implementar el `toFeatureIdentifier` definido por el contrato `FeatureScopeable`, podemos personalizar el valor del alcance almacenable proporcionado a cada controlador utilizado por nuestra aplicación:

```php
<?php

namespace App\Models;

use FlagRocket\FlagRocketUser;
use Illuminate\Database\Eloquent\Model;
use Laravel\Pennant\Contracts\FeatureScopeable;

class User extends Model implements FeatureScopeable
{
    /**
     * Convertir el objeto en un identificador de ámbito de feature para el driver indicado.
     */
    public function toFeatureIdentifier(string $driver): mixed
    {
        return match($driver) {
            'database' => $this,
            'flag-rocket' => FlagRocketUser::fromId($this->flag_rocket_id),
        };
    }
}
```

<a id="serializing-scope"></a>
### Alcance de serialización

De forma predeterminada, Pennant utilizará un nombre de clase completo al almacenar una característica asociada con un modelo Eloquent. Si ya está utilizando un [Mapa de transformación Eloquent](../eloquent-relationships/#custom-polymorphic-types), puede optar por que Pennant también use el mapa de transformación para desacoplar la característica almacenada de la estructura de su aplicación.

Para lograr esto, después de definir su mapa de transformación de Eloquent en un proveedor de servicios, puede invocar el método `useMorphMap` de la fachada `Feature`:

```php
use Illuminate\Database\Eloquent\Relations\Relation;
use Laravel\Pennant\Feature;

Relation::enforceMorphMap([
    'post' => 'App\Models\Post',
    'video' => 'App\Models\Video',
]);

Feature::useMorphMap();
```

<a id="rich-feature-values"></a>
## Valores de funciones enriquecidos

Hasta ahora, hemos mostrado principalmente funciones en estado binario, lo que significa que están "activas" o "inactivas", pero Pennant también le permite almacenar valores enriquecidos.

Por ejemplo, imagina que estás probando tres colores nuevos para el botón "Comprar ahora" de tu aplicación. En lugar de devolver `true` o `false` desde la definición de característica, puede devolver una cadena:

```php
use Illuminate\Support\Arr;
use Laravel\Pennant\Feature;

Feature::define('purchase-button', fn (User $user) => Arr::random([
    'blue-sapphire',
    'seafoam-green',
    'tart-orange',
]));
```

Puede recuperar el valor de la característica `purchase-button` utilizando el método `value`:

```php
$color = Feature::value('purchase-button');
```

La directiva Blade incluida en Pennant también facilita la representación condicional de contenido según el valor actual de la característica:

```blade
@feature('purchase-button', 'blue-sapphire')
    <!-- 'blue-sapphire' is active -->
@elsefeature('purchase-button', 'seafoam-green')
    <!-- 'seafoam-green' is active -->
@elsefeature('purchase-button', 'tart-orange')
    <!-- 'tart-orange' is active -->
@endfeature
```

> **Nota:**
> Cuando se utilizan valores enriquecidos, es importante saber que una característica se considera "activa" cuando tiene cualquier valor distinto de `false`.

Al llamar al [método `when`](#conditional-execution) condicional, el valor enriquecido de la característica se proporcionará al primera función anónima:

```php
Feature::when('purchase-button',
    fn ($color) => /* ... */,
    fn () => /* ... */,
);
```

Del mismo modo, al llamar al método condicional `unless`, el valor enriquecido de la característica se proporcionará al segunda función anónima opcional:

```php
Feature::unless('purchase-button',
    fn () => /* ... */,
    fn ($color) => /* ... */,
);
```

<a id="retrieving-multiple-features"></a>
## Recuperar múltiples funciones

El método `values` permite la recuperación de múltiples funciones para un alcance determinado:

```php
Feature::values(['billing-v2', 'purchase-button']);

// [
//     'billing-v2' => false,
//     'purchase-button' => 'blue-sapphire',
// ]
```

O puede utilizar el método `all` para recuperar los valores de todas las funciones definidas para un alcance determinado:

```php
Feature::all();

// [
//     'billing-v2' => false,
//     'purchase-button' => 'blue-sapphire',
//     'site-redesign' => true,
// ]
```

Sin embargo, las características basadas en clases se registran dinámicamente y Pennant no las conoce hasta que se verifican explícitamente. Esto significa que es posible que las características basadas en clases de su aplicación no aparezcan en los resultados devueltos por el método `all` si aún no se han verificado durante la solicitud actual.

Si desea asegurarse de que las clases de entidad siempre se incluyan al utilizar el método `all`, puede utilizar las capacidades de descubrimiento de características de Pennant. Para comenzar, invoque el método `discover` en uno de los proveedores de servicios de su aplicación:

```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Pennant\Feature;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Inicializar los servicios de la aplicación.
     */
    public function boot(): void
    {
        Feature::discover();

        // ...
    }
}
```

El método `discover` registrará todas las clases de entidad en el directorio `app/Features` de su aplicación. El método `all` ahora incluirá estas clases en sus resultados, independientemente de si se han verificado durante la solicitud actual:

```php
Feature::all();

// [
//     'App\Features\NewApi' => true,
//     'billing-v2' => false,
//     'purchase-button' => 'blue-sapphire',
//     'site-redesign' => true,
// ]
```

<a id="eager-loading"></a>
## Cargando ansiosa

Aunque Pennant mantiene un caché en memoria de todas las funciones resueltas para una sola solicitud, aún es posible encontrar problemas de rendimiento. Para aliviar esto, Pennant ofrece la posibilidad de cargar valores de funciones con entusiasmo.

Para ilustrar esto, imagine que estamos comprobando si una función está activa dentro de un bucle:

```php
use Laravel\Pennant\Feature;

foreach ($users as $user) {
    if (Feature::for($user)->active('notifications-beta')) {
        $user->notify(new RegistrationSuccess);
    }
}
```

Suponiendo que estamos utilizando el controlador de la base de datos, este código ejecutará una consulta de la base de datos para cada usuario en el bucle, ejecutando potencialmente cientos de consultas. Sin embargo, utilizando el método `load` de Pennant, podemos eliminar este posible cuello de botella en el rendimiento cargando ansiosamente los valores de las características para una colección de usuarios o ámbitos:

```php
Feature::for($users)->load(['notifications-beta']);

foreach ($users as $user) {
    if (Feature::for($user)->active('notifications-beta')) {
        $user->notify(new RegistrationSuccess);
    }
}
```

Para cargar valores de características solo cuando aún no se han cargado, puede usar el método `loadMissing`:

```php
Feature::for($users)->loadMissing([
    'new-api',
    'purchase-button',
    'notifications-beta',
]);
```

Puede cargar todas las funciones definidas utilizando el método `loadAll`:

```php
Feature::for($users)->loadAll();
```

<a id="updating-values"></a>
## Actualizando valores

Cuando el valor de una característica se resuelve por primera vez, el controlador subyacente almacenará el resultado en el almacenamiento. Esto suele ser necesario para garantizar una experiencia coherente para los usuarios en todas las solicitudes. Sin embargo, en ocasiones, es posible que desee actualizar manualmente el valor almacenado de la función.

Para lograr esto, puede utilizar los métodos `activate` y `deactivate` para activar o desactivar una función:

```php
use Laravel\Pennant\Feature;

// Activar la feature para el ámbito predeterminado...
Feature::activate('new-api');

// Desactivar la feature para el ámbito indicado...
Feature::for($user->team)->deactivate('billing-v2');
```

También es posible establecer manualmente un valor enriquecido para una característica proporcionando un segundo argumento al método `activate`:

```php
Feature::activate('purchase-button', 'seafoam-green');
```

Para indicarle a Pennant que olvide el valor almacenado de una característica, puede usar el método `forget`. Cuando se vuelve a marcar la característica, Pennant resolverá el valor de la característica a partir de su definición de característica:

```php
Feature::forget('purchase-button');
```

<a id="bulk-updates"></a>
### Actualizaciones masivas

Para actualizar los valores de funciones almacenados de forma masiva, puede utilizar los métodos `activateForEveryone` y `deactivateForEveryone`.

Por ejemplo, imagine que ahora confía en la estabilidad de la función `new-api` y ha elegido el mejor color `'purchase-button'` para su flujo de pago; puede actualizar el valor almacenado para todos los usuarios en consecuencia:

```php
use Laravel\Pennant\Feature;

Feature::activateForEveryone('new-api');

Feature::activateForEveryone('purchase-button', 'seafoam-green');
```

Alternativamente, puede desactivar la función para todos los usuarios:

```php
Feature::deactivateForEveryone('new-api');
```

> **Nota:**
> Esto solo actualizará los valores de funciones resueltos que han sido almacenados por el controlador de almacenamiento de Pennant. También deberá actualizar la definición de función en su aplicación.

<a id="purging-features"></a>
### Funciones de purga

A veces, puede resultar útil eliminar una función completa del almacenamiento. Esto suele ser necesario si eliminó la función de su aplicación o si realizó ajustes en la definición de la función que desea implementar para todos los usuarios.

Puede eliminar todos los valores almacenados para una función utilizando el método `purge`:

```php
// Purging a single feature...
Feature::purge('new-api');

// Purging multiple features...
Feature::purge(['new-api', 'purchase-button']);
```

Si desea eliminar _todas_ las funciones del almacenamiento, puede invocar el método `purge` sin ningún argumento:

```php
Feature::purge();
```

Como puede resultar útil eliminar funciones como parte del proceso de implementación de su aplicación, Pennant incluye un comando `pennant:purge` Artisan que eliminará las funciones proporcionadas del almacenamiento:

```shell
php artisan pennant:purge new-api

php artisan pennant:purge new-api purchase-button
```

También es posible eliminar todas las funciones _excepto_ aquellas en una lista de funciones determinada. Por ejemplo, imagine que desea eliminar todas las funciones pero mantener almacenados los valores de las funciones "nueva API" y "botón de compra". Para lograr esto, puede pasar esos nombres de funciones a la opción `--except`:

```shell
php artisan pennant:purge --except=new-api --except=purchase-button
```

Para mayor comodidad, el comando `pennant:purge` también admite un indicador `--except-registered`. Este indicador indica que todas las funciones, excepto aquellas registradas explícitamente en un proveedor de servicios, deben eliminarse:

```shell
php artisan pennant:purge --except-registered
```

<a id="testing"></a>
## Pruebas

Al probar código que interactúa con indicadores de características, la forma más fácil de controlar el valor devuelto del indicador de características en sus pruebas es simplemente redefinir la característica. Por ejemplo, imagine que tiene la siguiente característica definida en uno de los proveedores de servicios de su aplicación:

```php
use Illuminate\Support\Arr;
use Laravel\Pennant\Feature;

Feature::define('purchase-button', fn () => Arr::random([
    'blue-sapphire',
    'seafoam-green',
    'tart-orange',
]));
```

Para modificar el valor devuelto de la característica en sus pruebas, puede redefinir la característica al comienzo de la prueba. La siguiente prueba siempre pasará, aunque la implementación `Arr::random()` todavía esté presente en el proveedor de servicios:

```php tab=Pest
use Laravel\Pennant\Feature;

test('it can control feature values', function () {
    Feature::define('purchase-button', 'seafoam-green');

    expect(Feature::value('purchase-button'))->toBe('seafoam-green');
});
```

```php tab=PHPUnit
use Laravel\Pennant\Feature;

public function test_it_can_control_feature_values()
{
    Feature::define('purchase-button', 'seafoam-green');

    $this->assertSame('seafoam-green', Feature::value('purchase-button'));
}
```

Se puede utilizar el mismo enfoque para funciones basadas en clases:

```php tab=Pest
use Laravel\Pennant\Feature;

test('it can control feature values', function () {
    Feature::define(NewApi::class, true);

    expect(Feature::value(NewApi::class))->toBeTrue();
});
```

```php tab=PHPUnit
use App\Features\NewApi;
use Laravel\Pennant\Feature;

public function test_it_can_control_feature_values()
{
    Feature::define(NewApi::class, true);

    $this->assertTrue(Feature::value(NewApi::class));
}
```

Si su función devuelve una instancia `Lottery`, hay varios [ayudantes de prueba útiles disponibles](../helpers/#testing-lotteries).

<a id="store-configuration"></a>
#### Configuración de la tienda

Puede configurar el almacén que Pennant utilizará durante las pruebas definiendo la variable de entorno `PENNANT_STORE` en el archivo `phpunit.xml` de su aplicación:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit colors="true">
    <!-- ... -->
    <php>
        <env name="PENNANT_STORE" value="array"/>
        <!-- ... -->
    </php>
</phpunit>
```

<a id="adding-custom-pennant-drivers"></a>
## Agregar controladores de banderín personalizados

<a id="implementing-the-driver"></a>
#### Implementación del controlador

Si ninguno de los controladores de almacenamiento existentes de Pennant se ajusta a las necesidades de su aplicación, puede escribir su propio controlador de almacenamiento. Su controlador personalizado debe implementar la interfaz `Laravel\Pennant\Contracts\Driver`:

```php
<?php

namespace App\Extensions;

use Laravel\Pennant\Contracts\Driver;

class RedisFeatureDriver implements Driver
{
    public function define(string $feature, callable $resolver): void {}
    public function defined(): array {}
    public function getAll(array $features): array {}
    public function get(string $feature, mixed $scope): mixed {}
    public function set(string $feature, mixed $scope, mixed $value): void {}
    public function setForAllScopes(string $feature, mixed $value): void {}
    public function delete(string $feature, mixed $scope): void {}
    public function purge(array|null $features): void {}
}
```

Ahora, sólo necesitamos implementar cada uno de estos métodos usando una conexión Redis. Para ver un ejemplo de cómo implementar cada uno de estos métodos, eche un vistazo a `Laravel\Pennant\Drivers\DatabaseDriver` en [Código fuente de Pennant](https://github.com/laravel/pennant/blob/1.x/src/Drivers/DatabaseDriver.php)

> **Nota:**
> Laravel no viene con un directorio para contener sus extensiones. Eres libre de colocarlos donde quieras. En este ejemplo, hemos creado un directorio `Extensions` para albergar el `RedisFeatureDriver`.

<a id="registering-the-driver"></a>
#### Registro del controlador

Una vez que se haya implementado su controlador, estará listo para registrarlo en Laravel. Para agregar controladores adicionales a Pennant, puede utilizar el método `extend` proporcionado por la fachada `Feature`. Debe llamar al método `extend` desde el método `boot` de uno de los [proveedor de servicios](../providers/): de su aplicación:

```php
<?php

namespace App\Providers;

use App\Extensions\RedisFeatureDriver;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\ServiceProvider;
use Laravel\Pennant\Feature;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Registrar los servicios de la aplicación.
     */
    public function register(): void
    {
        // ...
    }

    /**
     * Inicializar los servicios de la aplicación.
     */
    public function boot(): void
    {
        Feature::extend('redis', function (Application $app) {
            return new RedisFeatureDriver($app->make('redis'), $app->make('events'), []);
        });
    }
}
```

Una vez que se haya registrado el controlador, puede utilizar el controlador `redis` en el archivo de configuración `config/pennant.php` de su aplicación:

```php
'stores' => [

    'redis' => [
        'driver' => 'redis',
        'connection' => null,
    ],

    // ...

],
```

<a id="defining-features-externally"></a>
### Definición de funciones externamente

Si su controlador es un contenedor para una plataforma de indicadores de funciones de terceros, probablemente definirá funciones en la plataforma en lugar de utilizar el método `Feature::define` de Pennant. Si ese es el caso, su controlador personalizado también debería implementar la interfaz `Laravel\Pennant\Contracts\DefinesFeaturesExternally`:

```php
<?php

namespace App\Extensions;

use Laravel\Pennant\Contracts\Driver;
use Laravel\Pennant\Contracts\DefinesFeaturesExternally;

class FeatureFlagServiceDriver implements Driver, DefinesFeaturesExternally
{
    /**
     * Obtener las features definidas para el ámbito indicado.
     */
    public function definedFeaturesForScope(mixed $scope): array {}

    /* ... */
}
```

El método `definedFeaturesForScope` debería devolver una lista de nombres de funciones definidas para el alcance proporcionado.

<a id="events"></a>
## Eventos

Pennant envía una variedad de eventos que pueden resultar útiles al realizar un seguimiento de los indicadores de funciones en toda su aplicación.

### `Laravel\Pennant\Events\FeatureRetrieved`

Este evento se envía cada vez que se consulta una [característica](#checking-features). Este evento puede ser útil para crear y rastrear métricas contra el uso de un indicador de función en toda su aplicación.

### `Laravel\Pennant\Events\FeatureResolved`

Este evento se envía la primera vez que se resuelve el valor de una característica para un alcance específico.

### `Laravel\Pennant\Events\UnknownFeatureResolved`

Este evento se envía la primera vez que se resuelve una característica desconocida para un ámbito específico. Escuchar este evento puede ser útil si tenía la intención de eliminar una marca de característica pero accidentalmente dejó referencias perdidas a ella en toda su aplicación:

```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;
use Laravel\Pennant\Events\UnknownFeatureResolved;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Inicializar los servicios de la aplicación.
     */
    public function boot(): void
    {
        Event::listen(function (UnknownFeatureResolved $event) {
            Log::error("Resolving unknown feature [{$event->feature}].");
        });
    }
}
```

### `Laravel\Pennant\Events\DynamicallyRegisteringFeatureClass`

Este evento se envía cuando una [función basada en clases](#class-based-features) se verifica dinámicamente por primera vez durante una solicitud.

### `Laravel\Pennant\Events\UnexpectedNullScopeEncountered`

Este evento se envía cuando se pasa un alcance `null` a una definición de característica que [no admite null](#nullable-scope).

Esta situación se maneja con elegancia y la función devolverá `false`. Sin embargo, si desea excluirse del comportamiento elegante predeterminado de esta característica, puede registrar un oyente para este evento en el método `boot` del `AppServiceProvider` de su aplicación:

```php
use Illuminate\Support\Facades\Log;
use Laravel\Pennant\Events\UnexpectedNullScopeEncountered;

/**
 * Inicializar los servicios de la aplicación.
 */
public function boot(): void
{
    Event::listen(UnexpectedNullScopeEncountered::class, fn () => abort(500));
}
```

### `Laravel\Pennant\Events\FeatureUpdated`

Este evento se envía al actualizar una característica para un alcance, generalmente llamando a `activate` o `deactivate`.

### `Laravel\Pennant\Events\FeatureUpdatedForAllScopes`

Este evento se envía al actualizar una característica para todos los ámbitos, generalmente llamando a `activateForEveryone` o `deactivateForEveryone`.

### `Laravel\Pennant\Events\FeatureDeleted`

Este evento se envía al eliminar una característica para un alcance, generalmente llamando a `forget`.

### `Laravel\Pennant\Events\FeaturesPurged`

Este evento se envía al eliminar funciones específicas.

### `Laravel\Pennant\Events\AllFeaturesPurged`

Este evento se envía al eliminar todas las funciones.
