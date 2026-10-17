---
title: "software intermedio"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Definición de middleware](#defining-middleware)
- [Registro de middleware](#registering-middleware)
    - [Middleware global](#global-middleware)
    - [Asignación de middleware a rutas](#assigning-middleware-to-routes)
    - [Grupos de middleware](#middleware-groups)
    - [Alias de middleware](#middleware-aliases)
    - [Clasificación de middleware](#sorting-middleware)
- [Parámetros de middleware](#middleware-parameters)
- [Middleware terminable](#terminable-middleware)

<a id="introduction"></a>
## Introducción

El middleware proporciona un mecanismo conveniente para inspeccionar y filtrar las solicitudes HTTP que ingresan a su aplicación. Por ejemplo, Laravel incluye un middleware que verifica que el usuario de su aplicación esté autenticado. Si el usuario no está autenticado, el middleware lo redireccionará a la pantalla de inicio de sesión de su aplicación. Sin embargo, si el usuario está autenticado, el middleware permitirá que la solicitud avance en la aplicación.

Se puede escribir middleware adicional para realizar una variedad de tareas además de la autenticación. Por ejemplo, un middleware de registro podría registrar todas las solicitudes entrantes a su aplicación. Laravel incluye una variedad de middleware, incluido middleware para autenticación y protección CSRF; sin embargo, todo el middleware definido por el usuario normalmente se encuentra en el directorio `app/Http/Middleware` de su aplicación.

<a id="defining-middleware"></a>
## Definición de middleware

Para crear un nuevo middleware, utilice el comando `make:middleware` Artisan:

```shell
php artisan make:middleware EnsureTokenIsValid
```

Este comando colocará una nueva clase `EnsureTokenIsValid` dentro de su directorio `app/Http/Middleware`. En este middleware, solo permitiremos el acceso a la ruta si la entrada `token` proporcionada coincide con un valor específico. De lo contrario, redireccionaremos a los usuarios al URI `/home`:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTokenIsValid
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->input('token') !== 'my-secret-token') {
            return redirect('/home');
        }

        return $next($request);
    }
}
```

Como puede ver, si el `token` proporcionado no coincide con nuestro token secreto, el middleware devolverá una redirección HTTP al cliente; de lo contrario, la solicitud pasará a la aplicación. Para pasar la solicitud más profundamente a la aplicación (permitiendo que el middleware "pase"), debe llamar a la devolución de llamada `$next` con `$request`.

Es mejor imaginar el middleware como una serie de "capas" que las solicitudes HTTP deben atravesar antes de llegar a su aplicación. Cada capa puede examinar la solicitud e incluso rechazarla por completo.

> **Nota:**
> Todo el middleware se resuelve a través del [contenedor de servicios](../container/), por lo que puede escribir cualquier dependencia que necesite dentro del constructor de un middleware.

<a id="middleware-and-responses"></a>
#### Middleware y respuestas

Por supuesto, un middleware puede realizar tareas antes o después de pasar la solicitud más profundamente a la aplicación. Por ejemplo, el siguiente middleware realizaría alguna tarea **antes** de que la aplicación maneje la solicitud:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class BeforeMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        // Perform action

        return $next($request);
    }
}
```

Sin embargo, este middleware realizaría su tarea **después** de que la aplicación maneje la solicitud:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AfterMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Perform action

        return $response;
    }
}
```

<a id="registering-middleware"></a>
## Registro de middleware

<a id="global-middleware"></a>
### Middleware global

Si desea que se ejecute un middleware durante cada solicitud HTTP a su aplicación, puede agregarlo a la pila de middleware global en el archivo `bootstrap/app.php` de su aplicación:

```php
use App\Http\Middleware\EnsureTokenIsValid;

->withMiddleware(function (Middleware $middleware): void {
     $middleware->append(EnsureTokenIsValid::class);
})
```

El objeto `$middleware` proporcionado a la función anónima `withMiddleware` es una instancia de `Illuminate\Foundation\Configuration\Middleware` y es responsable de administrar el middleware asignado a las rutas de su aplicación. El método `append` agrega el middleware al final de la lista de middleware global. Si desea agregar un middleware al principio de la lista, debe utilizar el método `prepend`.

<a id="manually-managing-laravels-default-global-middleware"></a>
#### Administrar manualmente el middleware global predeterminado de Laravel

Si desea administrar manualmente la pila de middleware global de Laravel, puede proporcionar la pila predeterminada de middleware global de Laravel al método `use`. Luego, puede ajustar la pila de middleware predeterminada según sea necesario:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->use([
        \Illuminate\Http\Middleware\ValidatePathEncoding::class,
        \Illuminate\Foundation\Http\Middleware\InvokeDeferredCallbacks::class,
        // \Illuminate\Http\Middleware\TrustHosts::class,
        \Illuminate\Http\Middleware\TrustProxies::class,
        \Illuminate\Http\Middleware\HandleCors::class,
        \Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance::class,
        \Illuminate\Http\Middleware\ValidatePostSize::class,
        \Illuminate\Foundation\Http\Middleware\TrimStrings::class,
        \Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull::class,
    ]);
})
```

<a id="assigning-middleware-to-routes"></a>
### Asignación de middleware a rutas

Si desea asignar middleware a rutas específicas, puede invocar el método `middleware` al definir la ruta:

```php
use App\Http\Middleware\EnsureTokenIsValid;

Route::get('/profile', function () {
    // ...
})->middleware(EnsureTokenIsValid::class);
```

Puede asignar varios middleware a la ruta pasando una serie de nombres de middleware al método `middleware`:

```php
Route::get('/', function () {
    // ...
})->middleware([First::class, Second::class]);
```

<a id="excluding-middleware"></a>
#### Excluyendo middleware

Al asignar middleware a un grupo de rutas, es posible que en ocasiones necesite evitar que el middleware se aplique a una ruta individual dentro del grupo. Puede lograr esto utilizando el método `withoutMiddleware`:

```php
use App\Http\Middleware\EnsureTokenIsValid;

Route::middleware([EnsureTokenIsValid::class])->group(function () {
    Route::get('/', function () {
        // ...
    });

    Route::get('/profile', function () {
        // ...
    })->withoutMiddleware([EnsureTokenIsValid::class]);
});
```

También puede excluir un conjunto determinado de middleware de un [grupo](../routing/#route-groups) completo de definiciones de ruta:

```php
use App\Http\Middleware\EnsureTokenIsValid;

Route::withoutMiddleware([EnsureTokenIsValid::class])->group(function () {
    Route::get('/profile', function () {
        // ...
    });
});
```

El método `withoutMiddleware` solo puede eliminar el middleware de ruta y no se aplica al [middleware global](#global-middleware).

<a id="middleware-groups"></a>
### Grupos de middleware

A veces es posible que desee agrupar varios middleware bajo una sola clave para que sea más fácil asignarlos a las rutas. Puede lograr esto utilizando el método `appendToGroup` dentro del archivo `bootstrap/app.php` de su aplicación:

```php
use App\Http\Middleware\First;
use App\Http\Middleware\Second;

->withMiddleware(function (Middleware $middleware): void {
    $middleware->appendToGroup('group-name', [
        First::class,
        Second::class,
    ]);

    $middleware->prependToGroup('group-name', [
        First::class,
        Second::class,
    ]);
})
```

Los grupos de middleware se pueden asignar a rutas y acciones del controlador utilizando la misma sintaxis que el middleware individual:

```php
Route::get('/', function () {
    // ...
})->middleware('group-name');

Route::middleware(['group-name'])->group(function () {
    // ...
});
```

<a id="laravels-default-middleware-groups"></a>
#### Grupos de middleware predeterminados de Laravel

Laravel incluye grupos de middleware `web` y `api` predefinidos que contienen middleware común que quizás quieras aplicar a tus rutas web y API. Recuerde, Laravel aplica automáticamente estos grupos de middleware a los archivos `routes/web.php` y `routes/api.php` correspondientes:

<div class="overflow-auto">

| El grupo de software intermedio `web` |
| --------------------------------------------------------- |
| `Illuminate\Cookie\Middleware\EncryptCookies` |
| `Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse` |
| `Illuminate\Session\Middleware\StartSession` |
| `Illuminate\View\Middleware\ShareErrorsFromSession` |
| `Illuminate\Foundation\Http\Middleware\PreventRequestForgery` |
| `Illuminate\Routing\Middleware\SubstituteBindings` |

</div>

<div class="overflow-auto">

| El grupo de software intermedio `api` |
| -------------------------------------------------- |
| `Illuminate\Routing\Middleware\SubstituteBindings` |

</div>

Si desea agregar o anteponer middleware a estos grupos, puede usar los métodos `web` y `api` dentro del archivo `bootstrap/app.php` de su aplicación. Los métodos `web` y `api` son alternativas convenientes al método `appendToGroup`:

```php
use App\Http\Middleware\EnsureTokenIsValid;
use App\Http\Middleware\EnsureUserIsSubscribed;

->withMiddleware(function (Middleware $middleware): void {
    $middleware->web(append: [
        EnsureUserIsSubscribed::class,
    ]);

    $middleware->api(prepend: [
        EnsureTokenIsValid::class,
    ]);
})
```

Incluso puedes reemplazar una de las entradas del grupo de middleware predeterminado de Laravel con un middleware personalizado propio:

```php
use App\Http\Middleware\StartCustomSession;
use Illuminate\Session\Middleware\StartSession;

$middleware->web(replace: [
    StartSession::class => StartCustomSession::class,
]);
```

O bien, puede eliminar un middleware por completo:

```php
$middleware->web(remove: [
    StartSession::class,
]);
```

<a id="manually-managing-laravels-default-middleware-groups"></a>
#### Administrar manualmente los grupos de middleware predeterminados de Laravel

Si desea administrar manualmente todo el middleware dentro de los grupos de middleware `web` y `api` predeterminados de Laravel, puede redefinir los grupos por completo. El siguiente ejemplo definirá los grupos de middleware `web` y `api` con su middleware predeterminado, lo que le permitirá personalizarlos según sea necesario:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->group('web', [
        \Illuminate\Cookie\Middleware\EncryptCookies::class,
        \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
        \Illuminate\Session\Middleware\StartSession::class,
        \Illuminate\View\Middleware\ShareErrorsFromSession::class,
        \Illuminate\Foundation\Http\Middleware\PreventRequestForgery::class,
        \Illuminate\Routing\Middleware\SubstituteBindings::class,
        // \Illuminate\Session\Middleware\AuthenticateSession::class,
    ]);

    $middleware->group('api', [
        // \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        // 'throttle:api',
        \Illuminate\Routing\Middleware\SubstituteBindings::class,
    ]);
})
```

> **Nota:**
> De forma predeterminada, los grupos de middleware `web` y `api` se aplican automáticamente a los archivos `routes/web.php` y `routes/api.php` correspondientes de su aplicación mediante el archivo `bootstrap/app.php`.

<a id="middleware-aliases"></a>
### Alias de middleware

Puede asignar alias al middleware en el archivo `bootstrap/app.php` de su aplicación. Los alias de middleware le permiten definir un alias corto para una clase de middleware determinada, lo que puede resultar especialmente útil para middleware con nombres de clase largos:

```php
use App\Http\Middleware\EnsureUserIsSubscribed;

->withMiddleware(function (Middleware $middleware): void {
    $middleware->alias([
        'subscribed' => EnsureUserIsSubscribed::class
    ]);
})
```

Una vez que se haya definido el alias del middleware en el archivo `bootstrap/app.php` de su aplicación, puede utilizar el alias al asignar el middleware a las rutas:

```php
Route::get('/profile', function () {
    // ...
})->middleware('subscribed');
```

Para mayor comodidad, algunos de los middleware integrados de Laravel tienen alias de forma predeterminada. Por ejemplo, el middleware `auth` es un alias del middleware `Illuminate\Auth\Middleware\Authenticate`. A continuación se muestra una lista de los alias de middleware predeterminados:

<div class="overflow-auto">

| Alias ​​| Software intermedio |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `auth` | `Illuminate\Auth\Middleware\Authenticate` |
| `auth.basic` | `Illuminate\Auth\Middleware\AuthenticateWithBasicAuth` |
| `auth.session` | `Illuminate\Session\Middleware\AuthenticateSession` |
| `cache.headers` | `Illuminate\Http\Middleware\SetCacheHeaders` |
| `can` | `Illuminate\Auth\Middleware\Authorize` |
| `guest` | `Illuminate\Auth\Middleware\RedirectIfAuthenticated` |
| `password.confirm` | `Illuminate\Auth\Middleware\RequirePassword` |
| `precognitive` | `Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests` |
| `signed` | `Illuminate\Routing\Middleware\ValidateSignature` |
| `subscribed` | `\Spark\Http\Middleware\VerifyBillableIsSubscribed` |
| `throttle` | `Illuminate\Routing\Middleware\ThrottleRequests` o `Illuminate\Routing\Middleware\ThrottleRequestsWithRedis` |
| `verified` | `Illuminate\Auth\Middleware\EnsureEmailIsVerified` |

</div>

<a id="sorting-middleware"></a>
### Clasificación de middleware

En raras ocasiones, es posible que necesite que su middleware se ejecute en un orden específico, pero no tenga control sobre su orden cuando se asigna a la ruta. En estas situaciones, puede especificar su prioridad de middleware utilizando el método `priority` en el archivo `bootstrap/app.php` de su aplicación:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->priority([
        \Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests::class,
        \Illuminate\Cookie\Middleware\EncryptCookies::class,
        \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
        \Illuminate\Session\Middleware\StartSession::class,
        \Illuminate\View\Middleware\ShareErrorsFromSession::class,
        \Illuminate\Foundation\Http\Middleware\PreventRequestForgery::class,
        \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        \Illuminate\Routing\Middleware\ThrottleRequests::class,
        \Illuminate\Routing\Middleware\ThrottleRequestsWithRedis::class,
        \Illuminate\Routing\Middleware\SubstituteBindings::class,
        \Illuminate\Contracts\Auth\Middleware\AuthenticatesRequests::class,
        \Illuminate\Auth\Middleware\Authorize::class,
    ]);
})
```

Si desea agregar middleware a la lista de prioridades existente sin reemplazarlo, puede utilizar los métodos `prependToPriorityList` o `appendToPriorityList`. El método `prependToPriorityList` inserta el middleware dado antes de otro middleware, mientras que el método `appendToPriorityList` lo inserta después de otro middleware:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->prependToPriorityList(
        before: \Illuminate\Routing\Middleware\SubstituteBindings::class,
        prepend: \App\Http\Middleware\EnsureTokenIsValid::class,
    );

    $middleware->appendToPriorityList(
        after: \Illuminate\Routing\Middleware\SubstituteBindings::class,
        append: \App\Http\Middleware\EnsureUserIsSubscribed::class,
    );
})
```

Los argumentos `before` y `after` también pueden ser una variedad de clases de middleware.

<a id="middleware-parameters"></a>
## Parámetros del middleware

El middleware también puede recibir parámetros adicionales. Por ejemplo, si su aplicación necesita verificar que el usuario autenticado tiene un "rol" determinado antes de realizar una acción determinada, puede crear un middleware `EnsureUserHasRole` que reciba un nombre de rol como argumento adicional.

Se pasarán parámetros de middleware adicionales al middleware después del argumento `$next`:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        if (! $request->user()->hasRole($role)) {
            // Redirect...
        }

        return $next($request);
    }
}
```

Los parámetros de middleware se pueden especificar al definir la ruta separando el nombre y los parámetros del middleware con `:`:

```php
use App\Http\Middleware\EnsureUserHasRole;

Route::put('/post/{id}', function (string $id) {
    // ...
})->middleware(EnsureUserHasRole::class.':editor');
```

Se pueden delimitar varios parámetros mediante comas:

```php
Route::put('/post/{id}', function (string $id) {
    // ...
})->middleware(EnsureUserHasRole::class.':editor,publisher');
```

<a id="terminable-middleware"></a>
## Middleware terminable

A veces, es posible que un middleware deba realizar algún trabajo después de que la respuesta HTTP se haya enviado al navegador. Si define un método `terminate` en su middleware y su servidor web utiliza [FastCGI](https://www.php.net/manual/en/install.fpm.php), se llamará automáticamente al método `terminate` después de enviar la respuesta al navegador:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TerminatingMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        return $next($request);
    }

    /**
     * Handle tasks after the response has been sent to the browser.
     */
    public function terminate(Request $request, Response $response): void
    {
        // ...
    }
}
```

El método `terminate` debería recibir tanto la solicitud como la respuesta. Una vez que haya definido un middleware terminable, debe agregarlo a la lista de rutas o middleware global en el archivo `bootstrap/app.php` de su aplicación.

Al llamar al método `terminate` en su middleware, Laravel resolverá una nueva instancia del middleware desde el [contenedor de servicios](../container/). Si desea utilizar la misma instancia de middleware cuando se llaman los métodos `handle` y `terminate`, registre el middleware con el contenedor utilizando el método `singleton` del contenedor. Normalmente, esto se debe hacer en el método `register` de su `AppServiceProvider`:

```php
use App\Http\Middleware\TerminatingMiddleware;

/**
 * Register any application services.
 */
public function register(): void
{
    $this->app->singleton(TerminatingMiddleware::class);
}
```
