---
title: "Redis"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Configuración](#configuration)
    - [Clústeres](#clusters)
    - [Predis](#predis)
    - [PhpRedis](#phpredis)
- [Interactuando con Redis](#interacting-with-redis)
    - [Transacciones](#transactions)
    - [Comandos de canalización](#pipelining-commands)
- [Pub/Sub](#pubsub)

<a id="introduction"></a>
## Introducción

[Redis](https://redis.io) es un almacén de valores clave avanzado de código abierto. A menudo se le conoce como servidor de estructura de datos, ya que las claves pueden contener [strings](https://redis.io/docs/latest/develop/data-types/strings/), [hashes](https://redis.io/docs/latest/develop/data-types/hashes/), [lists](https://redis.io/docs/latest/develop/data-types/lists/), [sets](https://redis.io/docs/latest/develop/data-types/sets/) y [conjuntos ordenados](https://redis.io/docs/latest/develop/data-types/sorted-sets/).

Antes de usar Redis con Laravel, le recomendamos que instale y utilice la extensión PHP [PhpRedis](https://github.com/phpredis/phpredis) a través de PECL. La extensión es más compleja de instalar en comparación con los paquetes PHP "de usuario", pero puede ofrecer un mejor rendimiento para aplicaciones que hacen un uso intensivo de Redis. Si está utilizando [Laravel Sail](../sail/), esta extensión ya está instalada en el contenedor Docker de su aplicación.

Si no puede instalar la extensión PhpRedis, puede instalar el paquete `predis/predis` a través de Composer. Predis es un cliente de Redis escrito completamente en PHP y no requiere extensiones adicionales:

```shell
composer require predis/predis
```

<a id="configuration"></a>
## Configuración

Puede configurar los ajustes de Redis de su aplicación a través del archivo de configuración `config/database.php`. Dentro de este archivo, verá una matriz `redis` que contiene los servidores Redis utilizados por su aplicación:

```php
'redis' => [

    'client' => env('REDIS_CLIENT', 'phpredis'),

    'options' => [
        'cluster' => env('REDIS_CLUSTER', 'redis'),
        'prefix' => env('REDIS_PREFIX', Str::slug((string) env('APP_NAME', 'laravel')).'-database-'),
    ],

    'default' => [
        'url' => env('REDIS_URL'),
        'host' => env('REDIS_HOST', '127.0.0.1'),
        'username' => env('REDIS_USERNAME'),
        'password' => env('REDIS_PASSWORD'),
        'port' => env('REDIS_PORT', '6379'),
        'database' => env('REDIS_DB', '0'),
    ],

    'cache' => [
        'url' => env('REDIS_URL'),
        'host' => env('REDIS_HOST', '127.0.0.1'),
        'username' => env('REDIS_USERNAME'),
        'password' => env('REDIS_PASSWORD'),
        'port' => env('REDIS_PORT', '6379'),
        'database' => env('REDIS_CACHE_DB', '1'),
    ],

],
```

Cada servidor Redis definido en su archivo de configuración debe tener un nombre, un host y un puerto, a menos que defina una única URL para representar la conexión de Redis:

```php
'redis' => [

    'client' => env('REDIS_CLIENT', 'phpredis'),

    'options' => [
        'cluster' => env('REDIS_CLUSTER', 'redis'),
        'prefix' => env('REDIS_PREFIX', Str::slug((string) env('APP_NAME', 'laravel')).'-database-'),
    ],

    'default' => [
        'url' => 'tcp://127.0.0.1:6379?database=0',
    ],

    'cache' => [
        'url' => 'tls://user:password@127.0.0.1:6380?database=1',
    ],

],
```

<a id="configuring-the-connection-scheme"></a>
#### Configurando el esquema de conexión

De forma predeterminada, los clientes de Redis utilizarán el esquema `tcp` cuando se conecten a sus servidores de Redis; sin embargo, puede utilizar el cifrado TLS/SSL especificando una opción de configuración `scheme` en la matriz de configuración de su servidor Redis:

```php
'default' => [
    'scheme' => 'tls',
    'url' => env('REDIS_URL'),
    'host' => env('REDIS_HOST', '127.0.0.1'),
    'username' => env('REDIS_USERNAME'),
    'password' => env('REDIS_PASSWORD'),
    'port' => env('REDIS_PORT', '6379'),
    'database' => env('REDIS_DB', '0'),
],
```

<a id="clusters"></a>
### Clústeres

Si su aplicación utiliza un clúster de servidores Redis, debe definir estos clústeres dentro de una clave `clusters` de su configuración de Redis. Esta clave de configuración no existe de forma predeterminada, por lo que deberá crearla dentro del archivo de configuración `config/database.php` de su aplicación:

```php
'redis' => [

    'client' => env('REDIS_CLIENT', 'phpredis'),

    'options' => [
        'cluster' => env('REDIS_CLUSTER', 'redis'),
        'prefix' => env('REDIS_PREFIX', Str::slug((string) env('APP_NAME', 'laravel')).'-database-'),
    ],

    'clusters' => [
        'default' => [
            [
                'url' => env('REDIS_URL'),
                'host' => env('REDIS_HOST', '127.0.0.1'),
                'username' => env('REDIS_USERNAME'),
                'password' => env('REDIS_PASSWORD'),
                'port' => env('REDIS_PORT', '6379'),
                'database' => env('REDIS_DB', '0'),
            ],
        ],
    ],

    // ...
],
```

De forma predeterminada, Laravel utilizará la agrupación nativa de Redis ya que el valor de configuración `options.cluster` está establecido en `redis`. La agrupación en clústeres de Redis es una excelente opción predeterminada, ya que maneja con elegancia la conmutación por error.

Laravel también admite fragmentación del lado del cliente cuando se usa Predis. Sin embargo, la fragmentación del lado del cliente no maneja la conmutación por error; por lo tanto, es adecuado principalmente para datos transitorios almacenados en caché que están disponibles en otro almacén de datos principal.

Si desea utilizar fragmentación del lado del cliente en lugar de agrupación en clústeres de Redis nativa, puede eliminar el valor de configuración `options.cluster` dentro del archivo de configuración `config/database.php` de su aplicación:

```php
'redis' => [

    'client' => env('REDIS_CLIENT', 'phpredis'),

    'clusters' => [
        // ...
    ],

    // ...
],
```

<a id="predis"></a>
### Predis

Si desea que su aplicación interactúe con Redis a través del paquete Predis, debe asegurarse de que el valor de la variable de entorno `REDIS_CLIENT` sea `predis`:

```php
'redis' => [

    'client' => env('REDIS_CLIENT', 'predis'),

    // ...
],
```

Además de las opciones de configuración predeterminadas, Predis admite [parámetros de conexión](https://github.com/nrk/predis/wiki/Connection-Parameters) adicionales que pueden definirse para cada uno de sus servidores Redis. Para utilizar estas opciones de configuración adicionales, agréguelas a la configuración de su servidor Redis en el archivo de configuración `config/database.php` de su aplicación:

```php
'default' => [
    'url' => env('REDIS_URL'),
    'host' => env('REDIS_HOST', '127.0.0.1'),
    'username' => env('REDIS_USERNAME'),
    'password' => env('REDIS_PASSWORD'),
    'port' => env('REDIS_PORT', '6379'),
    'database' => env('REDIS_DB', '0'),
    'read_write_timeout' => 60,
],
```

<a id="phpredis"></a>
### PHPRedis

De forma predeterminada, Laravel utilizará la extensión PhpRedis para comunicarse con Redis. El cliente que Laravel utilizará para comunicarse con Redis viene dictado por el valor de la opción de configuración `redis.client`, que normalmente refleja el valor de la variable de entorno `REDIS_CLIENT`:

```php
'redis' => [

    'client' => env('REDIS_CLIENT', 'phpredis'),

    // ...
],
```

Además de las opciones de configuración predeterminadas, PhpRedis admite los siguientes parámetros de conexión adicionales: `name`, `persistent`, `persistent_id`, `prefix`, `read_timeout`, `retry_interval`, `max_retries`, `backoff_algorithm`, `backoff_base`, `backoff_cap`, `timeout` y `context`. Puede agregar cualquiera de estas opciones a la configuración de su servidor Redis en el archivo de configuración `config/database.php`:

```php
'default' => [
    'url' => env('REDIS_URL'),
    'host' => env('REDIS_HOST', '127.0.0.1'),
    'username' => env('REDIS_USERNAME'),
    'password' => env('REDIS_PASSWORD'),
    'port' => env('REDIS_PORT', '6379'),
    'database' => env('REDIS_DB', '0'),
    'read_timeout' => 60,
    'context' => [
        // 'auth' => ['username', 'secret'],
        // 'stream' => ['verify_peer' => false],
    ],
],
```

<a id="retry-and-backoff-configuration"></a>
#### Reintentar y cancelar la configuración

Las opciones `retry_interval`, `max_retries`, `backoff_algorithm`, `backoff_base` y `backoff_cap` se pueden usar para configurar cómo el cliente PhpRedis debe intentar volver a conectarse a un servidor Redis. Se admiten los siguientes algoritmos de retroceso: `default`, `decorrelated_jitter`, `equal_jitter`, `exponential`, `uniform` y `constant`:

```php
'default' => [
    'url' => env('REDIS_URL'),
    'host' => env('REDIS_HOST', '127.0.0.1'),
    'username' => env('REDIS_USERNAME'),
    'password' => env('REDIS_PASSWORD'),
    'port' => env('REDIS_PORT', '6379'),
    'database' => env('REDIS_DB', '0'),
    'max_retries' => env('REDIS_MAX_RETRIES', 3),
    'backoff_algorithm' => env('REDIS_BACKOFF_ALGORITHM', 'decorrelated_jitter'),
    'backoff_base' => env('REDIS_BACKOFF_BASE', 100),
    'backoff_cap' => env('REDIS_BACKOFF_CAP', 1000),
],
```

Laravel reintenta automáticamente los comandos de lectura segura una vez después de una falla de conexión transitoria. Puede utilizar la opción `command_retries` para configurar el número de reintentos para todos los comandos de Redis:

```php
'default' => [
    // ...
    'command_retries' => env('REDIS_COMMAND_RETRIES', 0),
],
```

Predis 3.4.0 y versiones posteriores admiten la configuración integrada de reintento y retroceso a través de la clase `Retry`. Puede configurar reintentos usando la opción `max_retries` y configurar la estrategia de retroceso usando la opción `retry`. La opción `retry` debe ser una matriz codificada por una de las siguientes clases de estrategia: `NoBackoff`, `EqualBackoff` o `ExponentialBackoff`:

```php
use Predis\Retry\Strategy\ExponentialBackoff;

'default' => [
    'url' => env('REDIS_URL'),
    // ...
    'retry' => [
        ExponentialBackoff::class => [
            env('REDIS_BACKOFF_BASE', 100),
            env('REDIS_BACKOFF_CAP', 1000),
            true, // Enable jitter...
        ],
    ],
    'max_retries' => env('REDIS_MAX_RETRIES', 3),
],
```

Cuando utilice Predis con un clúster de Redis, puede definir la configuración de reintento en la opción `parameters` de la configuración de su clúster:

```php
use Predis\Retry\Strategy\NoBackoff;

'clusters' => [
    'default' => [
        // ...
    ],
],

'options' => [
    'cluster' => env('REDIS_CLUSTER', 'redis'),
    'parameters' => [
        'retry' => [
            NoBackoff::class => [],
        ],
        'max_retries' => env('REDIS_MAX_RETRIES', 3),
    ],
],
```

<a id="unix-socket-connections"></a>
#### Conexiones de socket Unix

Las conexiones de Redis también se pueden configurar para utilizar sockets Unix en lugar de TCP. Esto puede ofrecer un rendimiento mejorado al eliminar la sobrecarga de TCP para las conexiones a instancias de Redis en el mismo servidor que su aplicación. Para configurar Redis para usar un socket Unix, configure su variable de entorno `REDIS_HOST` en la ruta del socket de Redis y la variable de entorno `REDIS_PORT` en `0`:

```env
REDIS_HOST=/run/redis/redis.sock
REDIS_PORT=0
```

<a id="phpredis-serialization"></a>
#### Serialización y compresión de PhpRedis

La extensión PhpRedis también se puede configurar para utilizar una variedad de serializadores y algoritmos de compresión. Estos algoritmos se pueden configurar a través de la matriz `options` de su configuración de Redis:

```php
'redis' => [

    'client' => env('REDIS_CLIENT', 'phpredis'),

    'options' => [
        'cluster' => env('REDIS_CLUSTER', 'redis'),
        'prefix' => env('REDIS_PREFIX', Str::slug((string) env('APP_NAME', 'laravel')).'-database-'),
        'serializer' => Redis::SERIALIZER_MSGPACK,
        'compression' => Redis::COMPRESSION_LZ4,
    ],

    // ...
],
```

Los serializadores admitidos actualmente incluyen: `Redis::SERIALIZER_NONE` (predeterminado), `Redis::SERIALIZER_PHP`, `Redis::SERIALIZER_JSON`, `Redis::SERIALIZER_IGBINARY` y `Redis::SERIALIZER_MSGPACK`.

Los algoritmos de compresión admitidos incluyen: `Redis::COMPRESSION_NONE` (predeterminado), `Redis::COMPRESSION_LZF`, `Redis::COMPRESSION_ZSTD` y `Redis::COMPRESSION_LZ4`.

<a id="interacting-with-redis"></a>
## Interactuando con Redis

Puede interactuar con Redis llamando a varios métodos en el archivo `Redis` [facade](../facades/). La fachada `Redis` admite métodos dinámicos, lo que significa que puede llamar a cualquier [comando Redis](https://redis.io/commands) en la fachada y el comando se pasará directamente a Redis. En este ejemplo, llamaremos al comando Redis `GET` llamando al método `get` en la fachada `Redis`:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Redis;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * Show the profile for the given user.
     */
    public function show(string $id): View
    {
        return view('user.profile', [
            'user' => Redis::get('user:profile:'.$id)
        ]);
    }
}
```

Como se mencionó anteriormente, puede llamar a cualquiera de los comandos de Redis en la fachada `Redis`. Laravel usa métodos mágicos para pasar los comandos al servidor Redis. Si un comando de Redis espera argumentos, debes pasarlos al método correspondiente de la fachada:

```php
use Illuminate\Support\Facades\Redis;

Redis::set('name', 'Taylor');

$values = Redis::lrange('names', 5, 10);
```

Alternativamente, puede pasar comandos al servidor usando el método `command` de la fachada `Redis`, que acepta el nombre del comando como primer argumento y una matriz de valores como segundo argumento:

```php
$values = Redis::command('lrange', ['name', 5, 10]);
```

<a id="using-multiple-redis-connections"></a>
#### Uso de múltiples conexiones de Redis

El archivo de configuración `config/database.php` de su aplicación le permite definir múltiples conexiones/servidores de Redis. Puede obtener una conexión a una conexión Redis específica utilizando el método `connection` de la fachada `Redis`:

```php
$redis = Redis::connection('connection-name');
```

Para obtener una instancia de la conexión Redis predeterminada, puede llamar al método `connection` sin ningún argumento adicional:

```php
$redis = Redis::connection();
```

<a id="transactions"></a>
### Transacciones

El método `transaction` de la fachada `Redis` proporciona un contenedor conveniente para los comandos nativos `MULTI` y `EXEC` de Redis. El método `transaction` acepta un cierre como único argumento. Este cierre recibirá una instancia de conexión de Redis y podrá emitir cualquier comando que desee para esta instancia. Todos los comandos de Redis emitidos dentro del cierre se ejecutarán en una única transacción atómica:

```php
use Redis;
use Illuminate\Support\Facades;

Facades\Redis::transaction(function (Redis $redis) {
    $redis->incr('user_visits', 1);
    $redis->incr('total_visits', 1);
});
```

> **Advertencia:**
> Al definir una transacción de Redis, no puede recuperar ningún valor de la conexión de Redis. Recuerde, su transacción se ejecuta como una operación única y atómica y esa operación no se ejecuta hasta que todo su cierre haya terminado de ejecutar sus comandos.

#### Secuencias de comandos Lua

El método `eval` proporciona otro método para ejecutar múltiples comandos de Redis en una única operación atómica. Sin embargo, el método `eval` tiene la ventaja de poder interactuar e inspeccionar los valores clave de Redis durante esa operación. Los scripts de Redis están escritos en el [lenguaje de programación Lua](https://www.lua.org).

El método `eval` puede dar un poco de miedo al principio, pero exploraremos un ejemplo básico para romper el hielo. El método `eval` espera varios argumentos. Primero, debes pasar el script Lua (como una cadena) al método. En segundo lugar, debe pasar la cantidad de claves (como un número entero) con las que interactúa el script. En tercer lugar, debes pasar los nombres de esas claves. Finalmente, puede pasar cualquier otro argumento adicional al que necesite acceder dentro de su script.

En este ejemplo, incrementaremos un contador, inspeccionaremos su nuevo valor e incrementaremos un segundo contador si el valor del primer contador es mayor que cinco. Finalmente, devolveremos el valor del primer contador:

```php
$value = Redis::eval(<<<'LUA'
    local counter = redis.call("incr", KEYS[1])

    if counter > 5 then
        redis.call("incr", KEYS[2])
    end

    return counter
LUA, 2, 'first-counter', 'second-counter');
```

> **Advertencia:**
> Consulte la [documentación de Redis](https://redis.io/commands/eval) para obtener más información sobre las secuencias de comandos de Redis.

<a id="pipelining-commands"></a>
### Comandos de canalización

A veces es posible que necesites ejecutar docenas de comandos de Redis. En lugar de realizar un viaje de red a su servidor Redis para cada comando, puede utilizar el método `pipeline`. El método `pipeline` acepta un argumento: un cierre que recibe una instancia de Redis. Puede emitir todos sus comandos a esta instancia de Redis y todos se enviarán al servidor de Redis al mismo tiempo para reducir los viajes de red al servidor. Los comandos se seguirán ejecutando en el orden en que fueron emitidos:

```php
use Redis;
use Illuminate\Support\Facades;

Facades\Redis::pipeline(function (Redis $pipe) {
    for ($i = 0; $i < 1000; $i++) {
        $pipe->set("key:$i", $i);
    }
});
```

<a id="pubsub"></a>
## Pub / Sub

Laravel proporciona una interfaz conveniente para los comandos Redis `publish` y `subscribe`. Estos comandos de Redis le permiten escuchar mensajes en un "canal" determinado. Podrás publicar mensajes al canal desde otra aplicación, o incluso utilizando otro lenguaje de programación, permitiendo una fácil comunicación entre aplicaciones y procesos.

Primero, configuremos un oyente de canal usando el método `subscribe`. Colocaremos esta llamada al método dentro de un [comando Artisan](../artisan/) ya que llamar al método `subscribe` inicia un proceso de larga duración:

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Redis;

class RedisSubscribe extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'redis:subscribe';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Subscribe to a Redis channel';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        Redis::subscribe(['test-channel'], function (string $message) {
            echo $message;
        });
    }
}
```

Ahora podremos publicar mensajes en el canal usando el método `publish`:

```php
use Illuminate\Support\Facades\Redis;

Route::get('/publish', function () {
    // ...

    Redis::publish('test-channel', json_encode([
        'name' => 'Adam Wathan'
    ]));
});
```

<a id="wildcard-subscriptions"></a>
#### Suscripciones comodín

Con el método `psubscribe`, puede suscribirse a un canal comodín, que puede resultar útil para captar todos los mensajes en todos los canales. El nombre del canal se pasará como segundo argumento del cierre proporcionado:

```php
Redis::psubscribe(['*'], function (string $message, string $channel) {
    echo $message;
});

Redis::psubscribe(['users.*'], function (string $message, string $channel) {
    echo $message;
});
```
