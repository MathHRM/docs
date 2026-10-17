---
title: "Limitación de frecuencia"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
    - [Configuración de caché](#cache-configuration)
- [Uso básico](#basic-usage)
    - [Incrementar intentos manualmente](#manually-incrementing-attempts)
    - [Borrar intentos](#clearing-attempts)

<a id="introduction"></a>
## Introducción

Laravel incluye una abstracción de limitación de frecuencia fácil de usar que, junto con el [caché](../cache/) de tu aplicación, proporciona una manera fácil de limitar cualquier acción durante un período de tiempo específico.

> **Nota:**
> Si quieres limitar la frecuencia de las solicitudes HTTP entrantes, consulta la [documentación del middleware del limitador de frecuencia](../routing/#rate-limiting).

<a id="cache-configuration"></a>
### Configuración de caché

Normalmente, el limitador de frecuencia utiliza la caché predeterminada de tu aplicación, definida por la clave `default` dentro del archivo de configuración `cache` de tu aplicación. Sin embargo, puedes especificar qué controlador de caché debe usar el limitador de frecuencia definiendo una clave `limiter` dentro del archivo de configuración `cache` de tu aplicación:

```php
'default' => env('CACHE_STORE', 'database'),

'limiter' => 'redis', // [tl! add]
```

<a id="basic-usage"></a>
## Uso básico

La fachada `Illuminate\Support\Facades\RateLimiter` se puedes usar para interactuar con el limitador de frecuencia. El método más simple que ofrece el limitador de frecuencia es el método `attempt`, que limita una determinada callback durante un número determinado de segundos.

El método `attempt` devuelve `false` cuando a la callback no le quedan intentos disponibles; de lo contrario, el método `attempt` devolverá el resultado de la callback o `true`. El primer argumento aceptado por el método `attempt` es una "clave" del limitador de frecuencia, que puede ser cualquier cadena que elijas que represente la acción a la que se le limita la frecuencia:

```php
use Illuminate\Support\Facades\RateLimiter;

$executed = RateLimiter::attempt(
    'send-message:'.$user->id,
    $perMinute = 5,
    function() {
        // Send message...
    }
);

if (! $executed) {
    return 'Too many messages sent!';
}
```

Si es necesario, puedes proporcionar un cuarto argumento al método `attempt`, que es la «intervalo de restablecimiento», o la cantidad de segundos hasta que se restablezcan los intentos disponibles. Por ejemplo, podemos modificar el ejemplo anterior para permitir cinco intentos cada dos minutos:

```php
$executed = RateLimiter::attempt(
    'send-message:'.$user->id,
    $perTwoMinutes = 5,
    function() {
        // Send message...
    },
    $decayRate = 120,
);
```

<a id="manually-incrementing-attempts"></a>
### Incrementar intentos manualmente

Si quieres interactuar manualmente con el limitador de frecuencia, hay varios otros métodos disponibles. Por ejemplo, puedes invocar el método `tooManyAttempts` para determinar si una clave del limitador de frecuencia determinada ha excedido su número máximo de intentos permitidos por minuto:

```php
use Illuminate\Support\Facades\RateLimiter;

if (RateLimiter::tooManyAttempts('send-message:'.$user->id, $perMinute = 5)) {
    return 'Too many attempts!';
}

RateLimiter::increment('send-message:'.$user->id);

// Send message...
```

Al limitar la frecuencia de un endpoint que puede recibir muchas solicitudes simultáneas, puedes querer comprobar el valor devuelto por el método `increment` en lugar de usar `tooManyAttempts` y `increment` como operaciones separadas. Cuando se utilizan los almacenes de caché `redis`, `memcached` o `database`, este valor se incrementa atómicamente, lo que garantiza que cada solicitud simultánea reciba un recuento único:

```php
use Illuminate\Support\Facades\RateLimiter;

$perMinute = 5;

if (RateLimiter::increment('send-message:'.$user->id) > $perMinute) {
    return 'Too many attempts!';
}

// Send message...
```

Alternativamente, puedes usar el método `remaining` para recuperar la cantidad de intentos restantes para una clave determinada. Si a una clave determinada le quedan reintentos, puedes invocar el método `increment` para incrementar el número total de intentos:

```php
use Illuminate\Support\Facades\RateLimiter;

if (RateLimiter::remaining('send-message:'.$user->id, $perMinute = 5)) {
    RateLimiter::increment('send-message:'.$user->id);

    // Send message...
}
```

Si quieres incrementar el valor de una clave del limitador de frecuencia determinada en más de uno, puedes proporcionar la cantidad deseada al método `increment`:

```php
RateLimiter::increment('send-message:'.$user->id, amount: 5);
```

<a id="determining-limiter-availability"></a>
#### Determinación de la disponibilidad del limitador

Cuando a una clave no le quedan más intentos, el método `availableIn` devuelve el número de segundos restantes hasta que haya más intentos disponibles:

```php
use Illuminate\Support\Facades\RateLimiter;

if (RateLimiter::tooManyAttempts('send-message:'.$user->id, $perMinute = 5)) {
    $seconds = RateLimiter::availableIn('send-message:'.$user->id);

    return 'You may try again in '.$seconds.' seconds.';
}

RateLimiter::increment('send-message:'.$user->id);

// Send message...
```

<a id="clearing-attempts"></a>
### Borrar intentos

Puedes restablecer el número de intentos para una clave del limitador de frecuencia determinada utilizando el método `clear`. Por ejemplo, puedes restablecer el número de intentos cuando el receptor lee un mensaje determinado:

```php
use App\Models\Message;
use Illuminate\Support\Facades\RateLimiter;

/**
 * Mark the message as read.
 */
public function read(Message $message): Message
{
    $message->markAsRead();

    RateLimiter::clear('send-message:'.$message->user_id);

    return $message;
}
```
