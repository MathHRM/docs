---
title: "Cache"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Configuración](#configuration)
    - [Requisitos previos del controlador](#driver-prerequisites)
- [Uso de caché](#cache-usage)
    - [Obtención de una instancia de caché](#obtaining-a-cache-instance)
    - [Recuperando elementos del Cache](#retrieving-items-from-the-cache)
    - [Almacenamiento de elementos en Cache](#storing-items-in-the-cache)
    - [Extensión de la vida útil del artículo](#extending-item-lifetime)
    - [Eliminar elementos del caché](#removing-items-from-the-cache)
    - [Memorización de caché](#cache-memoization)
    - [El ayudante de caché](#the-cache-helper)
- [Etiquetas de caché](#cache-tags)
    - [Almacenamiento de elementos de caché etiquetados](#storing-tagged-cache-items)
    - [Acceso a elementos de caché etiquetados](#accessing-tagged-cache-items)
    - [Eliminación de elementos de caché etiquetados](#removing-tagged-cache-items)
- [Cerraduras atómicas](#atomic-locks)
    - [Gestión de bloqueos](#managing-locks)
    - [Gestión de bloqueos en todos los procesos](#managing-locks-across-processes)
    - [Cerraduras refrescantes](#refreshing-locks)
    - [Limitación de concurrencia](#concurrency-limiting)
- [Conmutación por error de caché](#cache-failover)
- [Agregar controladores de caché personalizados](#adding-custom-cache-drivers)
    - [Escribiendo el controlador](#writing-the-driver)
    - [Registro del controlador ](#registering-the-driver)
- [Eventos](#events)

<a id="introduction"></a>
## Introducción

Algunas de las tareas de recuperación o procesamiento de datos realizadas por su aplicación podrían consumir mucha CPU o tardar varios segundos en completarse. Cuando este es el caso, es común almacenar en caché los datos recuperados durante un tiempo para poder recuperarlos rápidamente en solicitudes posteriores de los mismos datos. Los datos almacenados en caché generalmente se almacenan en un almacén de datos muy rápido como [Memcached](https://memcached.org) o [Redis](https://redis.io).

Afortunadamente, Laravel proporciona una API unificada y expresiva para varios backends de caché, lo que le permite aprovechar su recuperación de datos increíblemente rápida y acelerar su aplicación web.

<a id="configuration"></a>
## Configuración

El archivo de configuración de caché de su aplicación se encuentra en `config/cache.php`. En este archivo, puede especificar qué almacén de caché le gustaría que se utilice de forma predeterminada en toda su aplicación. Laravel admite backends de almacenamiento en caché populares como [Memcached](https://memcached.org), [Redis](https://redis.io), [DynamoDB](https://aws.amazon.com/dynamodb), bases de datos relacionales y discos de sistema de archivos listos para usar. Además, está disponible un controlador de caché basado en archivos, mientras que los controladores de caché `array` y `null` proporcionan backends de caché convenientes para sus pruebas automatizadas.

El archivo de configuración de caché también contiene una variedad de otras opciones que puede revisar. De forma predeterminada, Laravel está configurado para usar el controlador de caché `database`, que almacena los objetos serializados almacenados en caché en la base de datos de su aplicación.

<a id="driver-prerequisites"></a>
### Requisitos previos del controlador

<a id="prerequisites-database"></a>
#### Base de datos

Cuando utilice el controlador de caché `database`, necesitará una tabla de base de datos que contenga los datos de la caché. Normalmente, esto se incluye en el `0001_01_01_000001_create_cache_table.php` predeterminado de Laravel [migración de base de datos](../migrations/); sin embargo, si su aplicación no contiene esta migración, puede usar el comando `make:cache-table` Artisan para crearla:

```shell
php artisan make:cache-table

php artisan migrate
```

<a id="memcached"></a>
#### Memcached

El uso del controlador Memcached requiere la instalación del [paquete PECL de Memcached](https://pecl.php.net/package/memcached). Puede enumerar todos sus servidores Memcached en el archivo de configuración `config/cache.php`. Este archivo ya contiene una entrada `memcached.servers` para comenzar:

```php
'memcached' => [
    // ...

    'servers' => [
        [
            'host' => env('MEMCACHED_HOST', '127.0.0.1'),
            'port' => env('MEMCACHED_PORT', 11211),
            'weight' => 100,
        ],
    ],
],
```

Si es necesario, puede configurar la opción `host` en una ruta de socket UNIX. Si hace esto, la opción `port` debe configurarse en `0`:

```php
'memcached' => [
    // ...

    'servers' => [
        [
            'host' => '/var/run/memcached/memcached.sock',
            'port' => 0,
            'weight' => 100
        ],
    ],
],
```

<a id="redis"></a>
#### Redis

Antes de usar un caché de Redis con Laravel, deberá instalar la extensión PHP PhpRedis a través de PECL o instalar el paquete `predis/predis` a través de Composer. [Laravel Sail](../sail/) ya incluye esta extensión. Además, las plataformas de aplicaciones oficiales de Laravel como [Laravel Cloud](https://cloud.laravel.com) y [Laravel Forge](https://forge.laravel.com) tienen la extensión PhpRedis instalada de forma predeterminada.

Para obtener más información sobre la configuración de Redis, consulte su [página de documentación de Laravel](../redis/#configuration).

<a id="storage"></a>
#### Almacenamiento

El controlador de caché `storage` le permite almacenar valores almacenados en caché en cualquiera de los [discos del sistema de archivos configurados de su aplicación](../filesystem/). Esto puede resultar útil cuando desea utilizar un disco existente, como un disco S3, como almacén de caché de clave/valor:

```php
'storage' => [
    'driver' => 'storage',
    'disk' => env('CACHE_STORAGE_DISK'),
    'path' => env('CACHE_STORAGE_PATH', 'framework/cache/data'),
],
```

<a id="dynamodb"></a>
#### DinamoDB

Antes de utilizar el controlador de caché [DynamoDB](https://aws.amazon.com/dynamodb), debe crear una tabla de DynamoDB para almacenar todos los datos almacenados en caché. Normalmente, esta tabla debería denominarse `cache`. Sin embargo, debe nombrar la tabla según el valor de configuración `stores.dynamodb.table` dentro del archivo de configuración `cache`. El nombre de la tabla también se puede configurar mediante la variable de entorno `DYNAMODB_CACHE_TABLE`.

Esta tabla también debe tener una clave de partición de cadena con un nombre que corresponda al valor del elemento de configuración `stores.dynamodb.attributes.key` dentro del archivo de configuración `cache` de su aplicación. De forma predeterminada, la clave de partición debe llamarse `key`.

Normalmente, DynamoDB no eliminará de forma proactiva los elementos caducados de una tabla. Por lo tanto, debe [habilitar Tiempo de vida (TTL)](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html) en la tabla. Al configurar los ajustes TTL de la tabla, debe establecer el nombre del atributo TTL en `expires_at`.

A continuación, instale el SDK de AWS para que su aplicación Laravel pueda comunicarse con DynamoDB:

```shell
composer require aws/aws-sdk-php
```

Además, debe asegurarse de que se proporcionen valores para las opciones de configuración del almacén de caché de DynamoDB. Normalmente, estas opciones, como `AWS_ACCESS_KEY_ID` y `AWS_SECRET_ACCESS_KEY`, deben definirse en el archivo de configuración `.env` de su aplicación:

```php
'dynamodb' => [
    'driver' => 'dynamodb',
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    'table' => env('DYNAMODB_CACHE_TABLE', 'cache'),
    'endpoint' => env('DYNAMODB_ENDPOINT'),
],
```

<a id="mongodb"></a>
#### MongoDB

Si está utilizando MongoDB, el paquete oficial `mongodb/laravel-mongodb` proporciona un controlador de caché `mongodb` y se puede configurar mediante una conexión de base de datos `mongodb`. MongoDB admite índices TTL, que se pueden utilizar para borrar automáticamente los elementos de caché caducados.

Para obtener más información sobre la configuración de MongoDB, consulte la documentación de MongoDB [Documentación de caché y bloqueos](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/cache/).

<a id="cache-usage"></a>
## Uso de caché

<a id="obtaining-a-cache-instance"></a>
### Obtención de una instancia de caché

Para obtener una instancia de almacén de caché, puede usar la fachada `Cache`, que es la que usaremos a lo largo de esta documentación. La fachada `Cache` proporciona un acceso conveniente y conciso a las implementaciones subyacentes de los contratos de caché de Laravel:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Cache;

class UserController extends Controller
{
    /**
     * Show a list of all users of the application.
     */
    public function index(): array
    {
        $value = Cache::get('key');

        return [
            // ...
        ];
    }
}
```

<a id="accessing-multiple-cache-stores"></a>
#### Acceso a múltiples almacenes de caché

Usando la fachada `Cache`, puede acceder a varios almacenes de caché mediante el método `store`. La clave pasada al método `store` debe corresponder a una de las tiendas enumeradas en la matriz de configuración `stores` en su archivo de configuración `cache`:

```php
$value = Cache::store('file')->get('foo');

Cache::store('redis')->put('bar', 'baz', 600); // 10 Minutes
```

<a id="retrieving-items-from-the-cache"></a>
### Recuperar elementos del caché

El método `get` de la fachada `Cache` se utiliza para recuperar elementos del caché. Si el elemento no existe en la caché, se devolverá `null`. Si lo desea, puede pasar un segundo argumento al método `get` especificando el valor predeterminado que desea que se devuelva si el elemento no existe:

```php
$value = Cache::get('key');

$value = Cache::get('key', 'default');
```

Incluso puede pasar una función anónima como valor predeterminado. El resultado de la función anónima se devolverá si el elemento especificado no existe en la memoria caché. Pasar una función anónima le permite diferir la recuperación de valores predeterminados de una base de datos u otro servicio externo:

```php
$value = Cache::get('key', function () {
    return DB::table(/* ... */)->get();
});
```

<a id="determining-item-existence"></a>
#### Determinación de la existencia del artículo

Se puede utilizar el método `has` para determinar si un elemento existe en la memoria caché. Este método también devolverá `false` si el artículo existe pero su valor es `null`:

```php
if (Cache::has('key')) {
    // ...
}
```

<a id="incrementing-decrementing-values"></a>
#### Valores incrementales/decrementantes

Los métodos `increment` y `decrement` se pueden utilizar para ajustar el valor de los elementos enteros en la caché. Ambos métodos aceptan un segundo argumento opcional que indica la cantidad por la cual incrementar o disminuir el valor del artículo:

```php
// Initialize the value if it does not exist...
Cache::add('key', 0, now()->plus(hours: 4));

// Increment or decrement the value...
Cache::increment('key');
Cache::increment('key', $amount);
Cache::decrement('key');
Cache::decrement('key', $amount);
```

<a id="retrieve-store"></a>
#### Recuperar y almacenar

A veces es posible que desee recuperar un elemento del caché, pero también almacenar un valor predeterminado si el elemento solicitado no existe. Por ejemplo, es posible que desee recuperar todos los usuarios del caché o, si no existen, recuperarlos de la base de datos y agregarlos al caché. Puedes hacer esto usando el método `Cache::remember`:

```php
$value = Cache::remember('users', $seconds, function () {
    return DB::table('users')->get();
});
```

Si el elemento no existe en la caché, se ejecutará la función anónima pasada al método `remember` y su resultado se colocará en la caché.

Si necesita saber si el elemento se recuperó del caché en lugar de ejecutar la función anónima indicado, puede utilizar el método `rememberWithWarmth`. Este método devuelve una matriz que contiene el valor almacenado en caché y un valor booleano que indica si el elemento estaba "activo", lo que significa que se recuperó del caché y no se resolvió desde la función anónima:

```php
[$value, $warm] = Cache::rememberWithWarmth('users', $seconds, function () {
    return DB::table('users')->get();
});
```

Puede utilizar el método `rememberForever` para recuperar un elemento del caché o almacenarlo para siempre si no existe:

```php
$value = Cache::rememberForever('users', function () {
    return DB::table('users')->get();
});
```

<a id="swr"></a>
#### obsoleto mientras se revalida

Al utilizar el método `Cache::remember`, algunos usuarios pueden experimentar tiempos de respuesta lentos si el valor almacenado en caché ha caducado. Para ciertos tipos de datos, puede resultar útil permitir que se entreguen datos parcialmente obsoletos mientras el valor almacenado en caché se recalcula en segundo plano, lo que evita que algunos usuarios experimenten tiempos de respuesta lentos mientras se calculan los valores almacenados en caché. A esto se le suele denominar patrón "obsoleto mientras se revalida" y el método `Cache::flexible` proporciona una implementación de este patrón.

El método flexible acepta una matriz que especifica durante cuánto tiempo el valor almacenado en caché se considera "nuevo" y cuándo queda "obsoleto". El primer valor de la matriz representa el número de segundos que la caché se considera nueva, mientras que el segundo valor define durante cuánto tiempo se puede servir como datos obsoletos antes de que sea necesario volver a calcularlos.

Si se realiza una solicitud dentro del nuevo período (antes del primer valor), la caché se devuelve inmediatamente sin volver a calcularla. Si se realiza una solicitud durante el período obsoleto (entre los dos valores), el valor obsoleto se entrega al usuario y se registra una [función diferida](../helpers/#deferred-functions) para actualizar el valor almacenado en caché después de que se envía la respuesta al usuario. Si se realiza una solicitud después del segundo valor, la memoria caché se considera caducada y el valor se vuelve a calcular inmediatamente, lo que puede resultar en una respuesta más lenta para el usuario:

```php
$value = Cache::flexible('users', [5, 10], function () {
    return DB::table('users')->get();
});
```

<a id="retrieve-delete"></a>
#### Recuperar y eliminar

Si necesita recuperar un elemento del caché y luego eliminarlo, puede utilizar el método `pull`. Al igual que el método `get`, se devolverá `null` si el elemento no existe en la caché:

```php
$value = Cache::pull('key');

$value = Cache::pull('key', 'default');
```

<a id="storing-items-in-the-cache"></a>
### Almacenamiento de elementos en la caché

Puede utilizar el método `put` en la fachada `Cache` para almacenar elementos en el caché:

```php
Cache::put('key', 'value', $seconds = 10);
```

Si el tiempo de almacenamiento no se pasa al método `put`, el artículo se almacenará indefinidamente:

```php
Cache::put('key', 'value');
```

En lugar de pasar la cantidad de segundos como un número entero, también puede pasar una instancia `DateTime` que represente el tiempo de vencimiento deseado del elemento almacenado en caché:

```php
Cache::put('key', 'value', now()->plus(minutes: 10));
```

<a id="store-if-not-present"></a>
#### Almacenar si no está presente

El método `add` solo agregará el elemento al caché si aún no existe en el almacén de caché. El método devolverá `true` si el elemento realmente se agrega al caché. De lo contrario, el método devolverá `false`. El método `add` es una operación atómica:

```php
Cache::add('key', 'value', $seconds);
```

<a id="extending-item-lifetime"></a>
### Ampliación de la vida útil del artículo

El método `touch` le permite extender la vida útil (TTL) de un elemento de caché existente. El método `touch` devolverá `true` si el elemento de caché existe y su tiempo de vencimiento se extendió correctamente. Si el elemento no existe en la caché, el método devolverá `false`:

```php
Cache::touch('key', 3600);
```

Puede proporcionar una instancia `DateTimeInterface`, `DateInterval` o `Carbon` para especificar una hora de vencimiento exacta:

```php
Cache::touch('key', now()->addHours(2));
```

<a id="storing-items-forever"></a>
#### Almacenamiento de artículos para siempre

El método `forever` se puede utilizar para almacenar un elemento en la memoria caché de forma permanente. Dado que estos elementos no caducan, deben eliminarse manualmente del caché utilizando el método `forget`:

```php
Cache::forever('key', 'value');
```

> **Nota:**
> Si está utilizando el controlador Memcached, los elementos que se almacenan "para siempre" pueden eliminarse cuando la caché alcance su límite de tamaño.

<a id="removing-items-from-the-cache"></a>
### Eliminar elementos del caché

Puede eliminar elementos del caché utilizando el método `forget`:

```php
Cache::forget('key');
```

También puede eliminar elementos proporcionando un número cero o negativo de segundos de vencimiento:

```php
Cache::put('key', 'value', 0);

Cache::put('key', 'value', -5);
```

Puede borrar todo el caché utilizando el método `flush`:

```php
Cache::flush();
```

Puede borrar todos los bloqueos atómicos en el caché usando el método `flushLocks`:

```php
Cache::flushLocks();
```

> **Advertencia:**
> Vaciar el caché no respeta el "prefijo" de caché configurado y eliminará todas las entradas del caché. Considere esto detenidamente al borrar un caché compartido por otras aplicaciones.

<a id="cache-memoization"></a>
### Memorización de caché

El controlador de caché `memo` de Laravel le permite almacenar temporalmente valores de caché resueltos en la memoria durante una sola solicitud o ejecución de trabajo. Esto evita repetidos accesos a la caché dentro de la misma ejecución, lo que mejora significativamente el rendimiento.

Para utilizar el caché memorizado, invoque el método `memo`:

```php
use Illuminate\Support\Facades\Cache;

$value = Cache::memo()->get('key');
```

El método `memo` acepta opcionalmente el nombre de un almacén de caché, que especifica el almacén de caché subyacente que decorará el controlador memorizado:

```php
// Using the default cache store...
$value = Cache::memo()->get('key');

// Using the Redis cache store...
$value = Cache::memo('redis')->get('key');
```

La primera llamada `get` para una clave determinada recupera el valor de su almacén de caché, pero las llamadas posteriores dentro de la misma solicitud o trabajo recuperarán el valor de la memoria:

```php
// Hits the cache...
$value = Cache::memo()->get('key');

// Does not hit the cache, returns memoized value...
$value = Cache::memo()->get('key');
```

Al llamar a métodos que modifican los valores de la caché (como `put`, `increment`, `remember`, etc.), la caché memorizada olvida automáticamente el valor memorizado y delega la llamada al método mutante al almacén de caché subyacente:

```php
Cache::memo()->put('name', 'Taylor'); // Writes to underlying cache...
Cache::memo()->get('name');           // Hits underlying cache...
Cache::memo()->get('name');           // Memoized, does not hit cache...

Cache::memo()->put('name', 'Tim');    // Forgets memoized value, writes new value...
Cache::memo()->get('name');           // Hits underlying cache again...
```

<a id="the-cache-helper"></a>
### El ayudante de caché

Además de utilizar la fachada `Cache`, también puede utilizar la función global `cache` para recuperar y almacenar datos a través del caché. Cuando se llama a la función `cache` con un único argumento de cadena, devolverá el valor de la clave dada:

```php
$value = cache('key');
```

Si proporciona una matriz de pares clave/valor y un tiempo de vencimiento a la función, almacenará valores en la caché durante el tiempo especificado:

```php
cache(['key' => 'value'], $seconds);

cache(['key' => 'value'], now()->plus(minutes: 10));
```

Cuando se llama a la función `cache` sin ningún argumento, devuelve una instancia de la implementación `Illuminate\Contracts\Cache\Factory`, lo que le permite llamar a otros métodos de almacenamiento en caché:

```php
cache()->remember('users', $seconds, function () {
    return DB::table('users')->get();
});
```

> **Nota:**
> Al probar llamadas a la función global `cache`, puede usar el método `Cache::shouldReceive` como si estuviera [probando el archivo fachada](../mocking/#mocking-facades).

<a id="cache-tags"></a>
## Etiquetas de caché

> **Advertencia:**
> Las etiquetas de caché no se admiten cuando se utilizan los controladores de caché `file`, `dynamodb`, `database` o `storage`.

<a id="storing-tagged-cache-items"></a>
### Almacenamiento de elementos de caché etiquetados

Las etiquetas de caché le permiten etiquetar elementos relacionados en el caché y luego vaciar todos los valores almacenados en caché a los que se les ha asignado una etiqueta determinada. Puede acceder a un caché etiquetado pasando una matriz ordenada de nombres de etiquetas. Por ejemplo, accedamos a un caché etiquetado y `put` a un valor en el caché:

```php
use Illuminate\Support\Facades\Cache;

Cache::tags(['people', 'artists'])->put('John', $john, $seconds);
Cache::tags(['people', 'authors'])->put('Anne', $anne, $seconds);
```

<a id="accessing-tagged-cache-items"></a>
### Acceso a elementos de caché etiquetados

No se puede acceder a los elementos almacenados mediante etiquetas sin proporcionar también las etiquetas que se utilizaron para almacenar el valor. Para recuperar un elemento de caché etiquetado, pase la misma lista ordenada de etiquetas al método `tags`, luego llame al método `get` con la clave que desea recuperar:

```php
$john = Cache::tags(['people', 'artists'])->get('John');

$anne = Cache::tags(['people', 'authors'])->get('Anne');
```

<a id="removing-tagged-cache-items"></a>
### Eliminación de elementos de caché etiquetados

Puede eliminar todos los elementos a los que se les ha asignado una etiqueta o lista de etiquetas. Por ejemplo, el siguiente código eliminaría todos los cachés etiquetados con `people`, `authors` o ambos. Entonces, tanto `Anne` como `John` se eliminarían del caché:

```php
Cache::tags(['people', 'authors'])->flush();
```

Por el contrario, el siguiente código eliminaría solo los valores almacenados en caché etiquetados con `authors`, por lo que se eliminaría `Anne`, pero no `John`:

```php
Cache::tags('authors')->flush();
```

<a id="atomic-locks"></a>
## Cerraduras atómicas

> **Advertencia:**
> Para utilizar esta función, su aplicación debe utilizar el controlador de caché `memcached`, `redis`, `dynamodb`, `database`, `file` o `array` como controlador de caché predeterminado de su aplicación. Además, todos los servidores deben comunicarse con el mismo servidor de caché central.

<a id="managing-locks"></a>
### Gestión de bloqueos

Las cerraduras atómicas permiten la manipulación de cerraduras distribuidas sin preocuparse por las condiciones de carrera. Por ejemplo, [Laravel Cloud](https://cloud.laravel.com) utiliza bloqueos atómicos para garantizar que solo se ejecute una tarea remota en un servidor a la vez. Puede crear y administrar bloqueos utilizando el método `Cache::lock`:

```php
use Illuminate\Support\Facades\Cache;

$lock = Cache::lock('foo', 10);

if ($lock->get()) {
    // Lock acquired for 10 seconds...

    $lock->release();
}
```

El método `get` también acepta una función anónima. Después de ejecutar la función anónima, Laravel liberará automáticamente el bloqueo:

```php
Cache::lock('foo', 10)->get(function () {
    // Lock acquired for 10 seconds and automatically released...
});
```

Si el bloqueo no está disponible en el momento en que lo solicita, puede indicarle a Laravel que espere una cantidad específica de segundos. Si el candado no se puede adquirir dentro del límite de tiempo especificado, se generará un `Illuminate\Contracts\Cache\LockTimeoutException`:

```php
use Illuminate\Contracts\Cache\LockTimeoutException;

$lock = Cache::lock('foo', 10);

try {
    $lock->block(5);

    // Lock acquired after waiting a maximum of 5 seconds...
} catch (LockTimeoutException $e) {
    // Unable to acquire lock...
} finally {
    $lock->release();
}
```

El ejemplo anterior se puede simplificar pasando una función anónima al método `block`. Cuando se pasa una función anónima a este método, Laravel intentará adquirir el bloqueo durante el número de segundos especificado y lo liberará automáticamente una vez que se haya ejecutado la función anónima:

```php
Cache::lock('foo', 10)->block(5, function () {
    // Lock acquired for 10 seconds after waiting a maximum of 5 seconds...
});
```

<a id="managing-locks-across-processes"></a>
### Gestión de bloqueos en todos los procesos

A veces, es posible que desee adquirir un bloqueo en un proceso y liberarlo en otro proceso. Por ejemplo, puede adquirir un bloqueo durante una solicitud web y desear liberarlo al final de un trabajo en cola activado por esa solicitud. En este escenario, debe pasar el "token de propietario" con alcance del bloqueo al trabajo en cola para que el trabajo pueda volver a crear una instancia del bloqueo utilizando el token proporcionado.

En el siguiente ejemplo, enviaremos un trabajo en cola si se adquiere un bloqueo con éxito. Además, pasaremos el token del propietario del candado al trabajo en cola mediante el método `owner` del candado:

```php
$podcast = Podcast::find($id);

$lock = Cache::lock('processing', 120);

if ($lock->get()) {
    ProcessPodcast::dispatch($podcast, $lock->owner());
}
```

Dentro del trabajo `ProcessPodcast` de nuestra aplicación, podemos restaurar y liberar el bloqueo usando el token de propietario:

```php
Cache::restoreLock('processing', $this->owner)->release();
```

Si deseas liberar un candado sin respetar a su propietario actual, puedes utilizar el método `forceRelease`:

```php
Cache::lock('processing')->forceRelease();
```

<a id="refreshing-locks"></a>
### Cerraduras refrescantes

Si necesita extender el vencimiento de un candado que posee actualmente, puede usar el método `refresh`. Si no se proporciona ningún número de segundos, se utilizará la duración original del bloqueo. Esto es útil para operaciones de larga duración en las que prefiere adquirir un bloqueo corto y extenderlo periódicamente en lugar de adquirir un bloqueo con un tiempo de vencimiento muy largo:

```php
$lock = Cache::lock('generate-reports', 60);

if ($lock->get()) {
    foreach ($reports as $report) {
        $report->generate();

        // Extend the lock for another 60 seconds...
        $lock->refresh();
    }

    $lock->release();
}
```

<a id="concurrency-limiting"></a>
### Limitación de concurrencia

La funcionalidad de bloqueo atómico de Laravel también proporciona algunas formas de limitar la ejecución simultánea de funciones anónimas. Utilice `withoutOverlapping` cuando desee permitir solo una instancia en ejecución en su infraestructura:

```php
Cache::withoutOverlapping('foo', function () {
    // Lock acquired after waiting a maximum of 10 seconds...
});
```

De forma predeterminada, el bloqueo se mantiene hasta que la función anónima termina de ejecutarse y el método espera hasta 10 segundos para adquirir el bloqueo. Puede personalizar estos valores utilizando argumentos adicionales:

```php
Cache::withoutOverlapping('foo', function () {
    // Lock acquired for 120 seconds after waiting a maximum of 5 seconds...
}, lockFor: 120, waitFor: 5);
```

Si el bloqueo no se puede adquirir dentro del tiempo de espera especificado, se generará un `Illuminate\Contracts\Cache\LockTimeoutException`.

Si desea un paralelismo controlado, utilice el método `funnel` para establecer un número máximo de ejecuciones simultáneas. El método `funnel` funciona con cualquier controlador de caché que admita bloqueos:

```php
Cache::funnel('foo')
    ->limit(3)
    ->releaseAfter(60)
    ->block(10)
    ->then(function () {
        // Concurrency lock acquired...
    }, function () {
        // Could not acquire concurrency lock...
    });
```

La clave `funnel` identifica el recurso que se está limitando. El método `limit` define las ejecuciones simultáneas máximas. El método `releaseAfter` establece un tiempo de espera de seguridad en segundos antes de que una ranura adquirida se libere automáticamente. El método `block` establece cuántos segundos esperar hasta que haya una ranura disponible.

Si prefiere manejar el tiempo de espera mediante excepciones en lugar de proporcionar una función anónima de falla, puede omitir el segunda función anónima. Se generará un `Illuminate\Cache\Limiters\LimiterTimeoutException` si no se puede adquirir el bloqueo dentro del tiempo de espera especificado:

```php
use Illuminate\Cache\Limiters\LimiterTimeoutException;

try {
    Cache::funnel('foo')
        ->limit(3)
        ->releaseAfter(60)
        ->block(10)
        ->then(function () {
            // Concurrency lock acquired...
        });
} catch (LimiterTimeoutException $e) {
    // Unable to acquire concurrency lock...
}
```

Si desea utilizar un almacén de caché específico para el limitador de simultaneidad, puede invocar el método `funnel` en el almacén deseado:

```php
Cache::store('redis')->funnel('foo')
    ->limit(3)
    ->block(10)
    ->then(function () {
        // Concurrency lock acquired using the "redis" store...
    });
```

> **Nota:**
> El método `funnel` requiere que el almacén de caché implemente la interfaz `Illuminate\Contracts\Cache\LockProvider`. Si intenta utilizar `funnel` con un almacén de caché que no admite bloqueos, se generará un `BadMethodCallException`.

<a id="cache-failover"></a>
## Conmutación por error de caché

El controlador de caché `failover` proporciona funcionalidad de conmutación por error automática al interactuar con el caché. Si el almacén de caché principal del almacén `failover` falla por algún motivo, Laravel intentará automáticamente utilizar el siguiente almacén configurado en la lista. Esto es particularmente útil para garantizar una alta disponibilidad en entornos de producción donde la confiabilidad de la caché es crítica.

Para configurar un almacén de caché de conmutación por error, especifique el controlador `failover` y proporcione una serie de nombres de almacenes para intentar en orden. De forma predeterminada, Laravel incluye un ejemplo de configuración de conmutación por error en el archivo de configuración `config/cache.php` de su aplicación:

```php
'failover' => [
    'driver' => 'failover',
    'stores' => [
        'database',
        'array',
    ],
],
```

Una vez que haya configurado un almacén que utiliza el controlador `failover`, deberá configurar el almacén de conmutación por error como su almacén de caché predeterminado en el archivo `.env` de su aplicación para utilizar la funcionalidad de conmutación por error:

```ini
CACHE_STORE=failover
```

Cuando falla una operación de almacén de caché y se activa la conmutación por error, Laravel enviará el evento `Illuminate\Cache\Events\CacheFailedOver`, lo que le permitirá informar o registrar que un almacén de caché ha fallado.

<a id="adding-custom-cache-drivers"></a>
## Agregar controladores de caché personalizados

<a id="writing-the-driver"></a>
### Escribiendo el controlador

Para crear nuestro controlador de caché personalizado, primero debemos implementar el archivo `Illuminate\Contracts\Cache\Store` [contrato](../contracts/). Entonces, una implementación de caché de MongoDB podría verse así:

```php
<?php

namespace App\Extensions;

use Illuminate\Contracts\Cache\Store;

class MongoStore implements Store
{
    public function get($key) {}
    public function many(array $keys) {}
    public function put($key, $value, $seconds) {}
    public function putMany(array $values, $seconds) {}
    public function increment($key, $value = 1) {}
    public function decrement($key, $value = 1) {}
    public function forever($key, $value) {}
    public function touch($key, $seconds) {}
    public function forget($key) {}
    public function flush() {}
    public function getPrefix() {}
}
```

Solo necesitamos implementar cada uno de estos métodos usando una conexión MongoDB. Para ver un ejemplo de cómo implementar cada uno de estos métodos, eche un vistazo a `Illuminate\Cache\MemcachedStore` en el [código fuente del marco Laravel](https://github.com/laravel/framework). Una vez que se complete nuestra implementación, podemos finalizar el registro de nuestro controlador personalizado llamando al método `extend` de la fachada `Cache`:

```php
Cache::extend('mongo', function (Application $app) {
    return Cache::repository(new MongoStore);
});
```

> **Nota:**
> Si se pregunta dónde colocar el código del controlador de caché personalizado, puede crear un espacio de nombres `Extensions` dentro de su directorio `app`. Sin embargo, tenga en cuenta que Laravel no tiene una estructura de aplicación rígida y usted es libre de organizar su aplicación según sus preferencias.

<a id="registering-the-driver"></a>
### Registro del conductor

Para registrar el controlador de caché personalizado con Laravel, usaremos el método `extend` en la fachada `Cache`. Dado que otros proveedores de servicios pueden intentar leer valores almacenados en caché dentro de su método `boot`, registraremos nuestro controlador personalizado dentro de una devolución de llamada `booting`. Al utilizar la devolución de llamada `booting`, podemos asegurarnos de que el controlador personalizado se registre justo antes de que se llame al método `boot` en los proveedores de servicios de nuestra aplicación, pero después de que se llame al método `register` en todos los proveedores de servicios. Registraremos nuestra devolución de llamada `booting` dentro del método `register` de la clase `App\Providers\AppServiceProvider` de nuestra aplicación:

```php
<?php

namespace App\Providers;

use App\Extensions\MongoStore;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->booting(function () {
             Cache::extend('mongo', function (Application $app) {
                 return Cache::repository(new MongoStore);
             });
         });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // ...
    }
}
```

El primer argumento pasado al método `extend` es el nombre del controlador. Esto corresponderá a su opción `driver` en el archivo de configuración `config/cache.php`. El segundo argumento es una función anónima que debería devolver una instancia `Illuminate\Cache\Repository`. a la función anónima se le pasará una instancia `$app`, que es una instancia del [contenedor de servicio](../container/).

Una vez registrada su extensión, actualice la variable de entorno `CACHE_STORE` o la opción `default` dentro del archivo de configuración `config/cache.php` de su aplicación con el nombre de su extensión.

<a id="events"></a>
## Eventos

Para ejecutar código en cada operación de caché, puede escuchar varios [events](../events/) enviados por el caché:

<div class="overflow-auto">

| Nombre del evento |
|-------------------------------------------------|
| `Illuminate\Cache\Events\CacheFlushed` |
| `Illuminate\Cache\Events\CacheFlushing` |
| `Illuminate\Cache\Events\CacheFlushFailed` |
| `Illuminate\Cache\Events\CacheLocksFlushed` |
| `Illuminate\Cache\Events\CacheLocksFlushing` |
| `Illuminate\Cache\Events\CacheLocksFlushFailed` |
| `Illuminate\Cache\Events\CacheHit` |
| `Illuminate\Cache\Events\CacheMissed` |
| `Illuminate\Cache\Events\ForgettingKey` |
| `Illuminate\Cache\Events\KeyForgetFailed` |
| `Illuminate\Cache\Events\KeyForgotten` |
| `Illuminate\Cache\Events\KeyWriteFailed` |
| `Illuminate\Cache\Events\KeyWritten` |
| `Illuminate\Cache\Events\RetrievingKey` |
| `Illuminate\Cache\Events\RetrievingManyKeys` |
| `Illuminate\Cache\Events\WritingKey` |
| `Illuminate\Cache\Events\WritingManyKeys` |

</div>

Para aumentar el rendimiento, puede deshabilitar los eventos de caché configurando la opción de configuración `events` en `false` para un almacén de caché determinado en el archivo de configuración `config/cache.php` de su aplicación:

```php
'database' => [
    'driver' => 'database',
    // ...
    'events' => false,
],
```
