---
title: "Manejo de errores"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Configuración](#configuration)
- [Manejo de excepciones](#handling-exceptions)
    - [Excepciones de informes](#reporting-exceptions)
    - [Niveles de registro de excepciones](#exception-log-levels)
    - [Ignorar excepciones por tipo](#ignoring-exceptions-by-type)
    - [Excepciones de representación](#rendering-exceptions)
    - [Excepciones reportables y renderizables](#renderable-exceptions)
- [Limitación de excepciones informadas](#throttling-reported-exceptions)
- [Excepciones HTTP](#http-exceptions)
    - [Páginas de error HTTP personalizadas](#custom-http-error-pages)

<a id="introduction"></a>
## Introducción

Cuando inicia un nuevo proyecto de Laravel, el manejo de errores y excepciones ya está configurado para usted; sin embargo, en cualquier momento, puede utilizar el método `withExceptions` en el `bootstrap/app.php` de su aplicación para administrar cómo su aplicación informa y representa las excepciones.

El objeto `$exceptions` proporcionado a la función anónima `withExceptions` es una instancia de `Illuminate\Foundation\Configuration\Exceptions` y es responsable de gestionar el manejo de excepciones en su aplicación. Profundizaremos en este objeto a lo largo de esta documentación.

<a id="configuration"></a>
## Configuración

La opción `debug` en su archivo de configuración `config/app.php` determina cuánta información sobre un error se muestra realmente al usuario. De forma predeterminada, esta opción está configurada para respetar el valor de la variable de entorno `APP_DEBUG`, que se almacena en su archivo `.env`.

Durante el desarrollo local, debe configurar la variable de entorno `APP_DEBUG` en `true`.

> **Advertencia:**
> En su entorno de producción, el valor de `APP_DEBUG` siempre debe ser `false`. Si el valor se establece en `true` en producción, corre el riesgo de exponer valores de configuración confidenciales a los usuarios finales de su aplicación.

<a id="handling-exceptions"></a>
## Manejo de excepciones

<a id="reporting-exceptions"></a>
### Excepciones de informes

En Laravel, los informes de excepciones se utilizan para registrar excepciones o enviarlas a un servicio externo como [Laravel Nightwatch](https://nightwatch.laravel.com), [Sentry](https://github.com/getsentry/sentry-laravel) o [Flare](https://flareapp.io). De forma predeterminada, las excepciones se registrarán según su configuración [logging](../logging/). Sin embargo, usted es libre de registrar excepciones como desee.

Si necesita informar diferentes tipos de excepciones de diferentes maneras, puede usar el método de excepción `report` en el `bootstrap/app.php` de su aplicación para registrar una función anónima que debe ejecutarse cuando se debe informar una excepción de un tipo determinado. Laravel determinará qué tipo de excepción informa la función anónima examinando la sugerencia de tipo de la función anónima:

```php
use App\Exceptions\InvalidOrderException;

->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->report(function (InvalidOrderException $e) {
        // ...
    });
})
```

Cuando registra una devolución de llamada de informe de excepción personalizada utilizando el método `report`, Laravel seguirá registrando la excepción utilizando la configuración de registro predeterminada para la aplicación. Si desea detener la propagación de la excepción a la pila de registro predeterminada, puede usar el método `stop` al definir su devolución de llamada de informes o devolver `false` desde la devolución de llamada:

```php
use App\Exceptions\InvalidOrderException;

->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->report(function (InvalidOrderException $e) {
        // ...
    })->stop();

    $exceptions->report(function (InvalidOrderException $e) {
        return false;
    });
})
```

> **Nota:**
> Para personalizar el informe de excepciones para una excepción determinada, también puede utilizar [excepciones reportables](../errors/#renderable-exceptions).

<a id="global-log-context"></a>
#### Contexto de registro global

Si está disponible, Laravel agrega automáticamente la ID del usuario actual al mensaje de registro de cada excepción como datos contextuales. Puede definir sus propios datos contextuales globales utilizando el método de excepción `context` en el archivo `bootstrap/app.php` de su aplicación. Esta información se incluirá en cada mensaje de registro de excepción escrito por su aplicación:

```php
->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->context(fn () => [
        'foo' => 'bar',
    ]);
})
```

<a id="exception-log-context"></a>
#### Contexto del registro de excepciones

Si bien puede resultar útil agregar contexto a cada mensaje de registro, a veces una excepción particular puede tener un contexto único que le gustaría incluir en sus registros. Al definir un método `context` en una de las excepciones de su aplicación, puede especificar cualquier dato relevante para esa excepción que debe agregarse a la entrada del registro de la excepción:

```php
<?php

namespace App\Exceptions;

use Exception;

class InvalidOrderException extends Exception
{
    // ...

    /**
     * Get the exception's context information.
     *
     * @return array<string, mixed>
     */
    public function context(): array
    {
        return ['order_id' => $this->orderId];
    }
}
```

<a id="the-report-helper"></a>
#### El ayudante `report`

A veces es posible que necesite informar una excepción pero continuar manejando la solicitud actual. La función auxiliar `report` le permite informar rápidamente una excepción sin mostrar una página de error al usuario:

```php
public function isValid(string $value): bool
{
    try {
        // Validate the value...
    } catch (Throwable $e) {
        report($e);

        return false;
    }
}
```

<a id="deduplicating-reported-exceptions"></a>
#### Deduplicación de excepciones reportadas

Si utiliza la función `report` en toda su aplicación, ocasionalmente puede informar la misma excepción varias veces, creando entradas duplicadas en sus registros.

Si desea asegurarse de que una sola instancia de una excepción solo se informe una vez, puede invocar el método de excepción `dontReportDuplicates` en el archivo `bootstrap/app.php` de su aplicación:

```php
->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->dontReportDuplicates();
})
```

Ahora, cuando se llama al asistente `report` con la misma instancia de excepción, solo se informará la primera llamada:

```php
$original = new RuntimeException('Whoops!');

report($original); // reported

try {
    throw $original;
} catch (Throwable $caught) {
    report($caught); // ignored
}

report($original); // ignored
report($caught); // ignored
```

<a id="exception-log-levels"></a>
### Niveles de registro de excepciones

Cuando los mensajes se escriben en el [logs](../logging/) de su aplicación, los mensajes se escriben en un [nivel de registro](../logging/#log-levels)] específico, que indica la gravedad o importancia del mensaje que se registra.

Como se señaló anteriormente, incluso cuando registra una devolución de llamada de informe de excepción personalizada utilizando el método `report`, Laravel seguirá registrando la excepción utilizando la configuración de registro predeterminada para la aplicación; sin embargo, dado que el nivel de registro a veces puede influir en los canales en los que se registra un mensaje, es posible que desee configurar el nivel de registro en el que se registran ciertas excepciones.

Para lograr esto, puede utilizar el método de excepción `level` en el archivo `bootstrap/app.php` de su aplicación. Este método recibe el tipo de excepción como primer argumento y el nivel de registro como segundo argumento:

```php
use PDOException;
use Psr\Log\LogLevel;

->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->level(PDOException::class, LogLevel::CRITICAL);
})
```

<a id="ignoring-exceptions-by-type"></a>
### Ignorar excepciones por tipo

Al crear su aplicación, habrá algunos tipos de excepciones que nunca querrá informar. Para ignorar estas excepciones, puede utilizar el método de excepción `dontReport` en el archivo `bootstrap/app.php` de su aplicación. Nunca se informará ninguna clase proporcionada a este método; sin embargo, es posible que aún tengan una lógica de representación personalizada:

```php
use App\Exceptions\InvalidOrderException;

->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->dontReport([
        InvalidOrderException::class,
    ]);
})
```

Alternativamente, puede simplemente "marcar" una clase de excepción con la interfaz `Illuminate\Contracts\Debug\ShouldntReport`. Cuando se marca una excepción con esta interfaz, el controlador de excepciones de Laravel nunca la informará:

```php
<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Contracts\Debug\ShouldntReport;

class PodcastProcessingException extends Exception implements ShouldntReport
{
    //
}
```

Si necesita aún más control sobre cuándo se ignora un tipo particular de excepción, puede proporcionar una función anónima al método `dontReportWhen`:

```php
use App\Exceptions\InvalidOrderException;
use Throwable;

->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->dontReportWhen(function (Throwable $e) {
        return $e instanceof PodcastProcessingException &&
               $e->reason() === 'Subscription expired';
    });
})
```

Internamente, Laravel ya ignora algunos tipos de errores, como excepciones resultantes de errores HTTP 404, respuestas HTTP 403 generadas por discrepancias de origen o respuestas HTTP 419 generadas por tokens CSRF no válidos. Si desea indicarle a Laravel que deje de ignorar un tipo determinado de excepción, puede usar el método de excepción `stopIgnoring` en el archivo `bootstrap/app.php` de su aplicación:

```php
use Symfony\Component\HttpKernel\Exception\HttpException;

->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->stopIgnoring(HttpException::class);
})
```

<a id="rendering-exceptions"></a>
### Excepciones de representación

De forma predeterminada, el controlador de excepciones de Laravel convertirá las excepciones en una respuesta HTTP. Sin embargo, puede registrar una función anónima de representación personalizada para excepciones de un tipo determinado. Puede lograr esto utilizando el método de excepción `render` en el archivo `bootstrap/app.php` de su aplicación.

La función anónima pasada al método `render` debería devolver una instancia de `Illuminate\Http\Response`, que puede generarse mediante el asistente `response`. Laravel determinará qué tipo de excepción genera la función anónima examinando la sugerencia de tipo de la función anónima:

```php
use App\Exceptions\InvalidOrderException;
use Illuminate\Http\Request;

->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->render(function (InvalidOrderException $e, Request $request) {
        return response()->view('errors.invalid-order', status: 500);
    });
})
```

También puede utilizar el método `render` para anular el comportamiento de renderizado para excepciones integradas de Laravel o Symfony como `NotFoundHttpException`. Si la función anónima dada al método `render` no devuelve un valor, se utilizará la representación de excepción predeterminada de Laravel:

```php
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->render(function (NotFoundHttpException $e, Request $request) {
        if ($request->is('api/*')) {
            return response()->json([
                'message' => 'Record not found.'
            ], 404);
        }
    });
})
```

<a id="rendering-exceptions-as-json"></a>
#### Representación de excepciones como JSON

Al representar una excepción, Laravel determinará automáticamente si la excepción debe representarse como una respuesta HTML o JSON según el encabezado `Accept` de la solicitud. Si desea personalizar cómo Laravel determina si se deben representar las respuestas de excepción HTML o JSON, puede utilizar el método `shouldRenderJsonWhen`:

```php
use Illuminate\Http\Request;
use Throwable;

->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->shouldRenderJsonWhen(function (Request $request, Throwable $e) {
        if ($request->is('admin/*')) {
            return true;
        }

        return $request->expectsJson();
    });
})
```

<a id="customizing-the-exception-response"></a>
#### Personalización de la respuesta de excepción

En raras ocasiones, es posible que necesites personalizar toda la respuesta HTTP representada por el controlador de excepciones de Laravel. Para lograr esto, puede registrar una función anónima de personalización de respuesta utilizando el método `respond`:

```php
use Symfony\Component\HttpFoundation\Response;

->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->respond(function (Response $response) {
        if ($response->getStatusCode() === 419) {
            return back()->with([
                'message' => 'The page expired, please try again.',
            ]);
        }

        return $response;
    });
})
```

<a id="renderable-exceptions"></a>
### Excepciones reportables y renderizables

En lugar de definir informes personalizados y comportamiento de representación en el archivo `bootstrap/app.php` de su aplicación, puede definir los métodos `report` y `render` directamente en las excepciones de su aplicación. Cuando estos métodos existan, el marco los llamará automáticamente:

```php
<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class InvalidOrderException extends Exception
{
    /**
     * Report the exception.
     */
    public function report(): void
    {
        // ...
    }

    /**
     * Render the exception as an HTTP response.
     */
    public function render(Request $request): Response
    {
        return response(/* ... */);
    }
}
```

Si su excepción extiende una excepción que ya se puede representar, como una excepción integrada de Laravel o Symfony, puede devolver `false` desde el método `render` de la excepción para representar la respuesta HTTP predeterminada de la excepción:

```php
/**
 * Render the exception as an HTTP response.
 */
public function render(Request $request): Response|bool
{
    if (/** Determine if the exception needs custom rendering */) {

        return response(/* ... */);
    }

    return false;
}
```

Si su excepción contiene una lógica de informes personalizada que solo es necesaria cuando se cumplen ciertas condiciones, es posible que deba indicarle a Laravel que a veces informe la excepción utilizando la configuración de manejo de excepciones predeterminada. Para lograr esto, puede devolver `false` desde el método `report` de la excepción:

```php
/**
 * Report the exception.
 */
public function report(): bool
{
    if (/** Determine if the exception needs custom reporting */) {

        // ...

        return true;
    }

    return false;
}
```

> **Nota:**
> Puede escribir sugerencias sobre cualquier dependencia requerida del método `report` y el [contenedor de servicios](../container/). de Laravel] las inyectará automáticamente en el método.

<a id="throttling-reported-exceptions"></a>
### Limitación de excepciones reportadas

Si su aplicación informa una gran cantidad de excepciones, es posible que desee limitar la cantidad de excepciones que realmente se registran o envían al servicio de seguimiento de errores externo de su aplicación.

Para tomar una tasa de muestreo aleatoria de excepciones, puede utilizar el método de excepción `throttle` en el archivo `bootstrap/app.php` de su aplicación. El método `throttle` recibe una función anónima que debería devolver una instancia `Lottery`:

```php
use Illuminate\Support\Lottery;
use Throwable;

->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->throttle(function (Throwable $e) {
        return Lottery::odds(1, 1000);
    });
})
```

También es posible realizar un muestreo condicional según el tipo de excepción. Si desea mostrar solo instancias de una clase de excepción específica, puede devolver una instancia `Lottery` solo para esa clase:

```php
use App\Exceptions\ApiMonitoringException;
use Illuminate\Support\Lottery;
use Throwable;

->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->throttle(function (Throwable $e) {
        if ($e instanceof ApiMonitoringException) {
            return Lottery::odds(1, 1000);
        }
    });
})
```

También puede calificar las excepciones de límite registradas o enviadas a un servicio de seguimiento de errores externo devolviendo una instancia `Limit` en lugar de una `Lottery`. Esto es útil si desea protegerse contra ráfagas repentinas de excepciones que inundan sus registros, por ejemplo, cuando un servicio de terceros utilizado por su aplicación no funciona:

```php
use Illuminate\Broadcasting\BroadcastException;
use Illuminate\Cache\RateLimiting\Limit;
use Throwable;

->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->throttle(function (Throwable $e) {
        if ($e instanceof BroadcastException) {
            return Limit::perMinute(300);
        }
    });
})
```

De forma predeterminada, los límites utilizarán la clase de excepción como clave de límite de tasa. Puede personalizar esto especificando su propia clave usando el método `by` en el `Limit`:

```php
use Illuminate\Broadcasting\BroadcastException;
use Illuminate\Cache\RateLimiting\Limit;
use Throwable;

->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->throttle(function (Throwable $e) {
        if ($e instanceof BroadcastException) {
            return Limit::perMinute(300)->by($e->getMessage());
        }
    });
})
```

Por supuesto, puede devolver una combinación de instancias `Lottery` y `Limit` para otras excepciones:

```php
use App\Exceptions\ApiMonitoringException;
use Illuminate\Broadcasting\BroadcastException;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Lottery;
use Throwable;

->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->throttle(function (Throwable $e) {
        return match (true) {
            $e instanceof BroadcastException => Limit::perMinute(300),
            $e instanceof ApiMonitoringException => Lottery::odds(1, 1000),
            default => Limit::none(),
        };
    });
})
```

<a id="http-exceptions"></a>
## Excepciones HTTP

Algunas excepciones describen códigos de error HTTP del servidor. Por ejemplo, esto puede ser un error de "página no encontrada" (404), un "error no autorizado" (401) o incluso un desarrollador generó un error 500. Para generar dicha respuesta desde cualquier lugar de su aplicación, puede utilizar el asistente `abort`:

```php
abort(404);
```

<a id="custom-http-error-pages"></a>
### Páginas de error HTTP personalizadas

Laravel facilita la visualización de páginas de error personalizadas para varios códigos de estado HTTP. Por ejemplo, para personalizar la página de error para códigos de estado HTTP 404, cree una plantilla de vista `resources/views/errors/404.blade.php`. Esta vista se mostrará para todos los errores 404 generados por su aplicación. Las vistas dentro de este directorio deben tener nombres que coincidan con el código de estado HTTP al que corresponden. La instancia `Symfony\Component\HttpKernel\Exception\HttpException` generada por la función `abort` se pasará a la vista como una variable `$exception`:

```blade
<h2>{{ $exception->getMessage() }}</h2>
```

Puede publicar las plantillas de página de error predeterminadas de Laravel utilizando el comando `vendor:publish` Artisan. Una vez publicadas las plantillas podrás personalizarlas a tu gusto:

```shell
php artisan vendor:publish --tag=laravel-errors
```

<a id="fallback-http-error-pages"></a>
#### Páginas de error HTTP alternativas

También puede definir una página de error "alternativa" para una serie determinada de códigos de estado HTTP. Esta página se mostrará si no hay una página correspondiente para el código de estado HTTP específico que ocurrió. Para lograr esto, defina una plantilla `4xx.blade.php` y una plantilla `5xx.blade.php` en el directorio `resources/views/errors` de su aplicación.

Al definir páginas de error de respaldo, las páginas de respaldo no afectarán las respuestas de error de `401`, `402`, `403`, `404`, `419`, `429`, `500` y `503`, ya que Laravel tiene páginas internas dedicadas para estos estados. códigos. Para personalizar las páginas representadas para estos códigos de estado, debe definir una página de error personalizada para cada uno de ellos individualmente.
