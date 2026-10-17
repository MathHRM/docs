---
title: "Contexto"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
    - [Cómo funciona](#how-it-works)
- [Capturando contexto](#capturing-context)
    - [Pilas](#stacks)
- [Recuperando Context](#retrieving-context)
    - [Determinación de la existencia del artículo](#determining-item-existence)
- [Eliminando Context](#removing-context)
- [Contexto oculto](#hidden-context)
- [Eventos](#events)
    - [Deshidratando](#dehydrating)
    - [Hidratado](#hydrated)

<a id="introduction"></a>
## Introducción

Las capacidades de "contexto" de Laravel le permiten capturar, recuperar y compartir información a través de solicitudes, trabajos y comandos que se ejecutan dentro de su aplicación. Esta información capturada también se incluye en los registros escritos por su aplicación, lo que le brinda una visión más profunda del historial de ejecución del código circundante que ocurrió antes de que se escribiera una entrada de registro y le permite rastrear los flujos de ejecución en todo un sistema distribuido.

<a id="how-it-works"></a>
### Cómo funciona

La mejor manera de comprender las capacidades contextuales de Laravel es verlo en acción utilizando las funciones de registro integradas. Para comenzar, puede [agregar información al contexto](#capturing-context) usando la fachada `Context`. En este ejemplo, usaremos [middleware](../middleware/) para agregar la URL de solicitud y un ID de seguimiento único al contexto en cada solicitud entrante:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Context;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class AddContext
{
    /**
     * Gestionar una solicitud entrante.
     */
    public function handle(Request $request, Closure $next): Response
    {
        Context::add('url', $request->url());
        Context::add('trace_id', Str::uuid()->toString());

        return $next($request);
    }
}
```

La información agregada al contexto se agrega automáticamente como metadatos a cualquier [entrada de registro](../logging/) que se escriba a lo largo de la solicitud. Agregar contexto como metadatos permite diferenciar la información pasada a entradas de registro individuales de la información compartida a través de `Context`. Por ejemplo, imaginemos que escribimos la siguiente entrada de registro:

```php
Log::info('User authenticated.', ['auth_id' => Auth::id()]);
```

El registro escrito contendrá el `auth_id` pasado a la entrada del registro, pero también contendrá los `url` y `trace_id` del contexto como metadatos:

```text
User authenticated. {"auth_id":27} {"url":"https://example.com/login","trace_id":"e04e1a11-e75c-4db3-b5b5-cfef4ef56697"}
```

La información agregada al contexto también está disponible para los trabajos enviados a la cola. Por ejemplo, imaginemos que enviamos un trabajo `ProcessPodcast` a la cola después de agregar información al contexto:

```php
// In our middleware...
Context::add('url', $request->url());
Context::add('trace_id', Str::uuid()->toString());

// In our controller...
ProcessPodcast::dispatch($podcast);
```

Cuando se envía el trabajo, cualquier información almacenada actualmente en el contexto se captura y se comparte con el trabajo. Luego, la información capturada se vuelve a hidratar en el contexto actual mientras se ejecuta el trabajo. Entonces, si el método de manejo de nuestro trabajo fuera escribir en el registro:

```php
class ProcessPodcast implements ShouldQueue
{
    use Queueable;

    // ...

    /**
     * Ejecutar el job.
     */
    public function handle(): void
    {
        Log::info('Processing podcast.', [
            'podcast_id' => $this->podcast->id,
        ]);

        // ...
    }
}
```

La entrada de registro resultante contendría la información que se agregó al contexto durante la solicitud que envió originalmente el trabajo:

```text
Processing podcast. {"podcast_id":95} {"url":"https://example.com/login","trace_id":"e04e1a11-e75c-4db3-b5b5-cfef4ef56697"}
```

Aunque nos hemos centrado en las características integradas relacionadas con el registro del contexto de Laravel, la siguiente documentación ilustrará cómo el contexto le permite compartir información a través del límite de solicitud HTTP/trabajo en cola e incluso cómo agregar [datos de contexto ocultos](#hidden-context) que no están escritos con entradas de registro.

<a id="capturing-context"></a>
## Capturando contexto

Puede almacenar información en el contexto actual utilizando el método `add` de la fachada `Context`:

```php
use Illuminate\Support\Facades\Context;

Context::add('key', 'value');
```

Para agregar varios elementos a la vez, puede pasar una matriz asociativa al método `add`:

```php
Context::add([
    'first_key' => 'value',
    'second_key' => 'value',
]);
```

El método `add` anulará cualquier valor existente que comparta la misma clave. Si solo desea agregar información al contexto si la clave aún no existe, puede usar el método `addIf`:

```php
Context::add('key', 'first');

Context::get('key');
// "first"

Context::addIf('key', 'second');

Context::get('key');
// "first"
```

El contexto también proporciona métodos convenientes para incrementar o disminuir una clave determinada. Ambos métodos aceptan al menos un argumento: la clave para rastrear. Se puede proporcionar un segundo argumento para especificar la cantidad en la que se debe incrementar o disminuir la clave:

```php
Context::increment('records_added');
Context::increment('records_added', 5);

Context::decrement('records_added');
Context::decrement('records_added', 5);
```

<a id="conditional-context"></a>
#### Contexto condicional

El método `when` se puede utilizar para agregar datos al contexto en función de una condición determinada. El primera función anónima proporcionada al método `when` se invocará si la condición dada se evalúa como `true`, mientras que se invocará el segunda función anónima si la condición se evalúa como `false`:

```php
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Context;

Context::when(
    Auth::user()->isAdmin(),
    fn ($context) => $context->add('permissions', Auth::user()->permissions),
    fn ($context) => $context->add('permissions', []),
);
```

<a id="scoped-context"></a>
#### Contexto de ámbito

El método `scope` proporciona una manera de modificar temporalmente el contexto durante la ejecución de una devolución de llamada determinada y restaurar el contexto a su estado original cuando la devolución de llamada termina de ejecutarse. Además, puede pasar datos adicionales que deben fusionarse en el contexto (como el segundo y tercer argumento) mientras se ejecuta la función anónima.

```php
use Illuminate\Support\Facades\Context;
use Illuminate\Support\Facades\Log;

Context::add('trace_id', 'abc-999');
Context::addHidden('user_id', 123);

Context::scope(
    function () {
        Context::add('action', 'adding_friend');

        $userId = Context::getHidden('user_id');

        Log::debug("Adding user [{$userId}] to friends list.");
        // Adding user [987] to friends list.  {"trace_id":"abc-999","user_name":"taylor_otwell","action":"adding_friend"}
    },
    data: ['user_name' => 'taylor_otwell'],
    hidden: ['user_id' => 987],
);

Context::all();
// [
//     'trace_id' => 'abc-999',
// ]

Context::allHidden();
// [
//     'user_id' => 123,
// ]
```

> **Advertencia:**
> Si un objeto dentro del contexto se modifica dentro de la función anónima del ámbito, esa mutación se reflejará fuera del ámbito.

<a id="stacks"></a>
### Pilas

Context ofrece la posibilidad de crear "pilas", que son listas de datos almacenados en el orden en que fueron agregados. Puede agregar información a una pila invocando el método `push`:

```php
use Illuminate\Support\Facades\Context;

Context::push('breadcrumbs', 'first_value');

Context::push('breadcrumbs', 'second_value', 'third_value');

Context::get('breadcrumbs');
// [
//     'first_value',
//     'second_value',
//     'third_value',
// ]
```

Las pilas pueden resultar útiles para capturar información histórica sobre una solicitud, como eventos que ocurren en toda su aplicación. Por ejemplo, podría crear un detector de eventos para enviarlo a una pila cada vez que se ejecuta una consulta, capturando el SQL de la consulta y su duración como una tupla:

```php
use Illuminate\Support\Facades\Context;
use Illuminate\Support\Facades\DB;

// In AppServiceProvider.php...
DB::listen(function ($event) {
    Context::push('queries', [$event->time, $event->sql]);
});
```

Puede determinar si un valor está en una pila utilizando los métodos `stackContains` y `hiddenStackContains`:

```php
if (Context::stackContains('breadcrumbs', 'first_value')) {
    //
}

if (Context::hiddenStackContains('secrets', 'first_value')) {
    //
}
```

Los métodos `stackContains` y `hiddenStackContains` también aceptan una función anónima como segundo argumento, lo que permite un mayor control sobre la operación de comparación de valores:

```php
use Illuminate\Support\Facades\Context;
use Illuminate\Support\Str;

return Context::stackContains('breadcrumbs', function ($value) {
    return Str::startsWith($value, 'query_');
});
```

<a id="retrieving-context"></a>
## Recuperando contexto

Puede recuperar información del contexto utilizando el método `get` de la fachada `Context`:

```php
use Illuminate\Support\Facades\Context;

$value = Context::get('key');
```

Los métodos `only` y `except` se pueden utilizar para recuperar un subconjunto de la información en el contexto:

```php
$data = Context::only(['first_key', 'second_key']);

$data = Context::except(['first_key']);
```

El método `pull` se puede utilizar para recuperar información del contexto y eliminarla inmediatamente del contexto:

```php
$value = Context::pull('key');
```

Si los datos de contexto se almacenan en [stack](#stacks), puede extraer elementos de la pila utilizando el método `pop`:

```php
Context::push('breadcrumbs', 'first_value', 'second_value');

Context::pop('breadcrumbs');
// second_value

Context::get('breadcrumbs');
// ['first_value']
```

Los métodos `remember` y `rememberHidden` se pueden usar para recuperar información del contexto, mientras se establece el valor del contexto en el valor devuelto por la función anónima dada si la información solicitada no existe:

```php
$permissions = Context::remember(
    'user-permissions',
    fn () => $user->permissions,
);
```

Si desea recuperar toda la información almacenada en el contexto, puede invocar el método `all`:

```php
$data = Context::all();
```

<a id="determining-item-existence"></a>
### Determinar la existencia del artículo

Puede utilizar los métodos `has` y `missing` para determinar si el contexto tiene algún valor almacenado para la clave dada:

```php
use Illuminate\Support\Facades\Context;

if (Context::has('key')) {
    // ...
}

if (Context::missing('key')) {
    // ...
}
```

El método `has` devolverá `true` independientemente del valor almacenado. Así, por ejemplo, se considerará presente una clave con un valor `null`:

```php
Context::add('key', null);

Context::has('key');
// true
```

<a id="removing-context"></a>
## Eliminando contexto

El método `forget` se puede utilizar para eliminar una clave y su valor del contexto actual:

```php
use Illuminate\Support\Facades\Context;

Context::add(['first_key' => 1, 'second_key' => 2]);

Context::forget('first_key');

Context::all();

// ['second_key' => 2]
```

Es posible que olvides varias claves a la vez al proporcionar una matriz al método `forget`:

```php
Context::forget(['first_key', 'second_key']);
```

<a id="hidden-context"></a>
## Contexto oculto

Context ofrece la posibilidad de almacenar datos "ocultos". Esta información oculta no se adjunta a los registros y no se puede acceder a ella mediante los métodos de recuperación de datos documentados anteriormente. Context proporciona un conjunto diferente de métodos para interactuar con información de contexto oculta:

```php
use Illuminate\Support\Facades\Context;

Context::addHidden('key', 'value');

Context::getHidden('key');
// 'value'

Context::get('key');
// null
```

Los métodos "ocultos" reflejan la funcionalidad de los métodos no ocultos documentados anteriormente:

```php
Context::addHidden(/* ... */);
Context::addHiddenIf(/* ... */);
Context::pushHidden(/* ... */);
Context::getHidden(/* ... */);
Context::pullHidden(/* ... */);
Context::popHidden(/* ... */);
Context::onlyHidden(/* ... */);
Context::exceptHidden(/* ... */);
Context::allHidden(/* ... */);
Context::hasHidden(/* ... */);
Context::missingHidden(/* ... */);
Context::forgetHidden(/* ... */);
```

<a id="events"></a>
## Eventos

Context envía dos eventos que le permiten conectarse al proceso de hidratación y deshidratación del contexto.

Para ilustrar cómo se pueden usar estos eventos, imagine que en un middleware de su aplicación establece el valor de configuración `app.locale` según el encabezado `Accept-Language` de la solicitud HTTP entrante. Los eventos de contexto le permiten capturar este valor durante la solicitud y restaurarlo en la cola, asegurando que las notificaciones enviadas en la cola tengan el valor `app.locale` correcto. Podemos usar eventos de contexto y datos [hidden](#hidden-context) para lograr esto, lo cual ilustrará la siguiente documentación.

<a id="dehydrating"></a>
### Deshidratar

Cada vez que se envía un trabajo a la cola, los datos en el contexto se "deshidratan" y se capturan junto con la carga útil del trabajo. El método `Context::dehydrating` le permite registrar una función anónima que será invocado durante el proceso de deshidratación. Dentro de esta función anónima, puede realizar cambios en los datos que se compartirán con el trabajo en cola.

Normalmente, debes registrar devoluciones de llamadas `dehydrating` dentro del método `boot` de la clase `AppServiceProvider` de tu aplicación:

```php
use Illuminate\Log\Context\Repository;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Context;

/**
 * Inicializar los servicios de la aplicación.
 */
public function boot(): void
{
    Context::dehydrating(function (Repository $context) {
        $context->addHidden('locale', Config::get('app.locale'));
    });
}
```

> **Nota:**
> No debe utilizar la fachada `Context` dentro de la devolución de llamada `dehydrating`, ya que eso cambiará el contexto del proceso actual. Asegúrese de realizar solo cambios en el repositorio pasado a la devolución de llamada.

<a id="hydrated"></a>
### Hidratado

Siempre que un trabajo en cola comience a ejecutarse en la cola, cualquier contexto que se haya compartido con el trabajo se "hidratará" nuevamente al contexto actual. El método `Context::hydrated` le permite registrar una función anónima que será invocado durante el proceso de hidratación.

Normalmente, debes registrar devoluciones de llamadas `hydrated` dentro del método `boot` de la clase `AppServiceProvider` de tu aplicación:

```php
use Illuminate\Log\Context\Repository;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Context;

/**
 * Inicializar los servicios de la aplicación.
 */
public function boot(): void
{
    Context::hydrated(function (Repository $context) {
        if ($context->hasHidden('locale')) {
            Config::set('app.locale', $context->getHidden('locale'));
        }
    });
}
```

> **Nota:**
> No debe utilizar la fachada `Context` dentro de la devolución de llamada `hydrated` y, en su lugar, asegúrese de realizar solo cambios en el repositorio pasado a la devolución de llamada.
