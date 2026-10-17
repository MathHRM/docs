---
title: "Colas"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
    - [Conexiones frente a colas](#connections-vs-queues)
    - [Notas del controlador y requisitos previos](#driver-prerequisites)
- [Creación de trabajos](#creating-jobs)
    - [Generación de clases de trabajo](#generating-job-classes)
    - [Estructura de clases](#class-structure)
    - [Trabajos únicos](#unique-jobs)
    - [Trabajos con antirrebote](#debounced-jobs)
    - [Trabajos cifrados](#encrypted-jobs)
- [Middleware de trabajos](#job-middleware)
    - [Limitación de frecuencia](#rate-limiting)
    - [Prevención de superposiciones de trabajos](#preventing-job-overlaps)
    - [Limitación de excepciones](#throttling-exceptions)
    - [Liberación de trabajos](#releasing-jobs)
    - [Omisión de trabajos](#skipping-jobs)
- [Despacho de trabajos](#dispatching-jobs)
    - [Despacho con retraso](#delayed-dispatching)
    - [Despacho sincrónico](#synchronous-dispatching)
    - [Despacho masivo](#bulk-dispatching)
    - [Preparación de trabajos antes del despacho](#preparing-jobs-before-dispatch)
    - [Trabajos y transacciones de bases de datos](#jobs-and-database-transactions)
    - [Encadenamiento de trabajos](#job-chaining)
    - [Personalizar la cola y la conexión](#customizing-the-queue-and-connection)
    - [Especificación del máximo de intentos y los tiempos de espera de los trabajos](#max-job-attempts-and-timeout)
    - [SQS FIFO y colas justas](#sqs-fifo-and-fair-queues)
    - [Conmutación por error de cola](#queue-failover)
    - [Manejo de errores](#error-handling)
- [Procesamiento por lotes de trabajos](#job-batching)
    - [Definición de trabajos por lotes](#defining-batchable-jobs)
    - [Despacho de lotes](#dispatching-batches)
    - [Cadenas y lotes](#chains-and-batches)
    - [Agregar trabajos a lotes](#adding-jobs-to-batches)
    - [Inspección de lotes](#inspecting-batches)
    - [Cancelación de lotes](#cancelling-batches)
    - [Fallos de lotes](#batch-failures)
    - [Depuración de lotes](#pruning-batches)
    - [Almacenamiento de lotes en DynamoDB](#storing-batches-in-dynamodb)
- [Puesta en cola de funciones anónimas](#queueing-closures)
- [Ejecución del trabajador de cola](#running-the-queue-worker)
    - [El comando `queue:work`](#the-queue-work-command)
    - [Prioridades de cola](#queue-priorities)
    - [Trabajadores de cola y despliegue](#queue-workers-and-deployment)
    - [Reacción a las señales de los trabajadores](#reacting-to-worker-signals)
    - [Vencimientos y tiempos de espera de trabajos](#job-expirations-and-timeouts)
    - [Pausar y reanudar trabajadores de cola](#pausing-and-resuming-queue-workers)
- [Configuración de Supervisor](#supervisor-configuration)
- [Gestión de trabajos fallidos](#dealing-with-failed-jobs)
    - [Limpieza después de trabajos fallidos](#cleaning-up-after-failed-jobs)
    - [Reintentar trabajos fallidos](#retrying-failed-jobs)
    - [Ignorar modelos faltantes](#ignoring-missing-models)
    - [Depuración de trabajos fallidos](#pruning-failed-jobs)
    - [Almacenamiento de trabajos fallidos en DynamoDB](#storing-failed-jobs-in-dynamodb)
    - [Desactivación del almacenamiento de trabajos fallidos](#disabling-failed-job-storage)
    - [Eventos de trabajos fallidos](#failed-job-events)
- [Borrar trabajos de colas](#clearing-jobs-from-queues)
- [Supervisión de las colas](#monitoring-your-queues)
- [Pruebas](#testing)
    - [Simulación de un subconjunto de trabajos](#faking-a-subset-of-jobs)
    - [Pruebas de cadenas de trabajos](#testing-job-chains)
    - [Pruebas de lotes de trabajos](#testing-job-batches)
    - [Pruebas de interacciones entre trabajos y colas](#testing-job-queue-interactions)
- [Eventos de trabajos](#job-events)

<a id="introduction"></a>
## Introducción

Al crear tu aplicación web, es posible que tengas algunas tareas, como analizar y almacenar un archivo CSV cargado, que tarden demasiado en completarse durante una solicitud web habitual. Afortunadamente, Laravel te permite crear fácilmente trabajos en cola que pueden procesarse en segundo plano. Al mover las tareas que requieren mucho tiempo a una cola, tu aplicación puede responder a las solicitudes web con gran rapidez y brindar una mejor experiencia de usuario a tus clientes.

Las colas de Laravel proporcionan una API de colas unificada en una variedad de backends de colas diferentes, como [Amazon SQS](https://aws.amazon.com/sqs/), [Redis](https://redis.io) o incluso una base de datos relacional.

Las opciones de configuración de la cola de Laravel se almacenan en el archivo de configuración `config/queue.php` de tu aplicación. En este archivo, encontrarás configuraciones de conexión para cada uno de los controladores de cola que se incluyen con el framework, incluida la base de datos, los controladores [Amazon SQS](https://aws.amazon.com/sqs/), [Redis](https://redis.io) y [Beanstalkd](https://beanstalkd.github.io/), así como un controlador sincrónico que ejecutará trabajos inmediatamente (para usar durante el desarrollo o las pruebas). También se incluye un controlador de cola `null` que descarta los trabajos en cola.

> **Nota:**
> Laravel Horizon es un panel intuitivo y sistema de configuración para tus colas impulsadas por Redis. Consulta la [documentación de Horizon](../horizon/) completa para obtener más información.

<a id="connections-vs-queues"></a>
### Conexiones frente a colas

Antes de comenzar con las colas de Laravel, es importante comprender la distinción entre "conexiones" y "colas". En tu archivo de configuración `config/queue.php`, hay un array de configuración `connections`. Esta opción define las conexiones a servicios de cola backend como Amazon SQS, Beanstalk o Redis. Sin embargo, cualquier conexión de cola determinada puede tener múltiples "colas" que pueden considerarse como diferentes pilas o montones de trabajos en cola.

Ten en cuenta que cada ejemplo de configuración de conexión en el archivo de configuración `queue` contiene un atributo `queue`. Esta es la cola predeterminada a la que se enviarán los trabajos cuando se envíen a una conexión determinada. En otras palabras, si despachas un trabajo sin definir explícitamente a qué cola debe enviarse, el trabajo se colocará en la cola definida en el atributo `queue` de la configuración de la conexión:

```php
use App\Jobs\ProcessPodcast;

// This job is sent to the default connection's default queue...
ProcessPodcast::dispatch();

// This job is sent to the default connection's "emails" queue...
ProcessPodcast::dispatch()->onQueue('emails');
```

Es posible que algunas aplicaciones no necesiten despachar trabajos a varias colas, sino que prefieran tener una cola simple. Sin embargo, despachar trabajos a múltiples colas puede ser especialmente útil para aplicaciones que desean priorizar o segmentar cómo se procesan los trabajos, ya que el trabajador de cola de Laravel te permite especificar qué colas debe procesar por prioridad. Por ejemplo, si despachas trabajos a una cola `high`, puedes ejecutar un trabajador que les dé mayor prioridad de procesamiento:

```shell
php artisan queue:work --queue=high,default
```

<a id="driver-prerequisites"></a>
### Notas del controlador y requisitos previos

<a id="database"></a>
#### Base de datos

Para utilizar el controlador de cola `database`, necesitarás una tabla de base de datos para contener los trabajos. Normalmente, esto se incluye en la [migración de base de datos](../migrations/) predeterminada de Laravel `0001_01_01_000002_create_jobs_table.php`; sin embargo, si tu aplicación no contiene esta migración, puedes usar el comando Artisan `make:queue-table` para crearla:

```shell
php artisan make:queue-table

php artisan migrate
```

<a id="redis"></a>
#### Redis

Para utilizar el controlador de cola `redis`, debes configurar una conexión de base de datos Redis en tu archivo de configuración `config/database.php`.

> **Advertencia:**
> Las opciones de Redis `serializer` y `compression` no son compatibles con el controlador de cola `redis`.

<a id="redis-cluster"></a>
##### Clúster de Redis

Si tu conexión de cola de Redis utiliza un [Redis Cluster](https://redis.io/docs/latest/operate/rs/databases/durability-ha/clustering), los nombres de tu cola deben contener una [etiqueta hash de clave](https://redis.io/docs/latest/develop/using-commands/keyspace/#hashtags). Esto es necesario para garantizar que todas las claves de Redis para una cola determinada se coloquen en la misma ranura hash:

```php
'redis' => [
    'driver' => 'redis',
    'connection' => env('REDIS_QUEUE_CONNECTION', 'default'),
    'queue' => env('REDIS_QUEUE', '{default}'),
    'retry_after' => env('REDIS_QUEUE_RETRY_AFTER', 90),
    'block_for' => null,
    'after_commit' => false,
],
```

<a id="blocking"></a>
##### Bloqueo

Cuando utilizas la cola de Redis, puedes utilizar la opción de configuración `block_for` para especificar cuánto tiempo debe esperar el controlador para que un trabajo esté disponible antes de recorrer el bucle de trabajo y volver a sondear la base de datos de Redis.

Ajustar este valor en función de la carga de la cola puede ser más eficiente que sondear continuamente la base de datos de Redis en busca de nuevos trabajos. Por ejemplo, puedes establecer el valor en `5` para indicar que el controlador debe bloquearse durante cinco segundos mientras espera que un trabajo esté disponible:

```php
'redis' => [
    'driver' => 'redis',
    'connection' => env('REDIS_QUEUE_CONNECTION', 'default'),
    'queue' => env('REDIS_QUEUE', 'default'),
    'retry_after' => env('REDIS_QUEUE_RETRY_AFTER', 90),
    'block_for' => 5,
    'after_commit' => false,
],
```

> **Advertencia:**
> Configurar `block_for` en `0` hará que los trabajadores de la cola se bloqueen indefinidamente hasta que haya un trabajo disponible. Esto también evitará que señales como `SIGTERM` se manejen hasta que se haya procesado el siguiente trabajo.

<a id="sqs-overflow-storage"></a>
#### Almacenamiento de desbordamiento SQS

Amazon SQS limita el tamaño máximo de una carga útil de mensajes en cola. Si necesitas despachar trabajos con cargas útiles que puedan exceder este límite, puedes configurar Laravel para almacenar cargas útiles SQS de gran tamaño en un almacén de caché y, en su lugar, enviar un puntero a través de SQS. Para habilitar esta característica, agrega un array `overflow` a tu configuración de conexión de cola SQS:

```php
'sqs' => [
    'driver' => 'sqs',
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'prefix' => env('SQS_PREFIX', 'https://sqs.us-east-1.amazonaws.com/your-account-id'),
    'queue' => env('SQS_QUEUE', 'default'),
    'suffix' => env('SQS_SUFFIX'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    'after_commit' => false,
    'overflow' => [
        'enabled' => env('SQS_OVERFLOW_ENABLED', false),
        'store' => env('SQS_OVERFLOW_STORE'),
        'always' => false,
        'delete_after_processing' => true,
        'flush_on_clear' => env('SQS_OVERFLOW_FLUSH_ON_CLEAR', false),
    ],
],
```

Cuando el almacenamiento de desbordamiento está habilitado, Laravel almacenará cargas útiles de al menos 1 MB en el almacén de caché configurado. Si la opción `always` es `true`, cada carga útil de SQS se almacenará en el almacén de caché independientemente de su tamaño. Dado que los trabajos en cola deberán recuperar sus cargas útiles del almacén de caché cuando se procesen, debes elegir un almacén que pueda retener las cargas útiles hasta que tus trabajadores las procesen. De forma predeterminada, las cargas útiles almacenadas se eliminan después de que tus trabajos se hayan procesado y eliminado exitosamente de SQS.

Si la opción `flush_on_clear` es `true`, el almacén de caché de desbordamiento configurado se vaciará cuando el comando `queue:clear` borre la cola SQS. Dado que vaciar un almacén de caché puede eliminar todos los elementos de ese almacén, debes configurar el almacenamiento de desbordamiento de SQS para utilizar un almacén de caché dedicado al habilitar esta opción.

<a id="other-driver-prerequisites"></a>
#### Otros requisitos previos del controlador

Se necesitan las siguientes dependencias para los controladores de cola enumerados. Estas dependencias se pueden instalar a través del administrador de paquetes de Composer:

<div class="content-list" markdown="1">

- Amazon SQS: `aws/aws-sdk-php ~3.0`
- Beanstalkd: `pda/pheanstalk ^7.0|^8.0`
- Redis: `predis/predis ~3.0` o extensión PHP phpredis
- [MongoDB](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/queues/): `mongodb/laravel-mongodb`

</div>

<a id="creating-jobs"></a>
## Creación de trabajos

<a id="generating-job-classes"></a>
### Generación de clases de trabajo

De forma predeterminada, todos los trabajos en cola para tu aplicación se almacenan en el directorio `app/Jobs`. Si el directorio `app/Jobs` no existe, se creará cuando ejecuta el comando `make:job` Artisan:

```shell
php artisan make:job ProcessPodcast
```

La clase generada implementará la interfaz `Illuminate\Contracts\Queue\ShouldQueue`, indicando a Laravel que el trabajo debe colocarse en la cola para ejecutarse de forma asincrónica.

> **Nota:**
> Las plantillas de trabajos se pueden personalizar usando [publicación de plantillas](../artisan/#stub-customization).

<a id="class-structure"></a>
### Estructura de clases

Las clases de trabajo son muy simples y normalmente contienen solo un método `handle` que se invoca cuando la cola procesa el trabajo. Para comenzar, echemos un vistazo a una clase de trabajo de ejemplo. En este ejemplo, supondremos que administramos un servicio de publicación de podcasts y necesitamos procesar los archivos de podcast cargados antes de publicarlos:

```php
<?php

namespace App\Jobs;

use App\Models\Podcast;
use App\Services\AudioProcessor;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ProcessPodcast implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Podcast $podcast,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(AudioProcessor $processor): void
    {
        // Process uploaded podcast...
    }
}
```

En este ejemplo, ten en cuenta que pudimos pasar un [modelo de Eloquent](../eloquent/) directamente al constructor del trabajo en cola. Debido al trait `Queueable` que utiliza el trabajo, los modelos de Eloquent y sus relaciones cargadas se serializarán y deserializarán correctamente cuando se procese el trabajo.

Si tu trabajo en cola acepta un modelo Eloquent en su constructor, solo se serializará en la cola el identificador del modelo. Cuando el trabajo realmente se maneja, el sistema de colas volverá a recuperar automáticamente la instancia del modelo completo y sus relaciones cargadas de la base de datos. Este enfoque de serialización de modelos permite enviar cargas útiles de trabajos mucho más pequeñas al controlador de cola.

<a id="handle-method-dependency-injection"></a>
#### Inyección de dependencia del método `handle`

El método `handle` se invoca cuando la cola procesa el trabajo. Ten en cuenta que podemos declarar los tipos de las dependencias en el método `handle` del trabajo. El [contenedor de servicios](../container/) de Laravel inyecta automáticamente estas dependencias.

Si deseas tener control total sobre cómo el contenedor inyecta dependencias en el método `handle`, puedes utilizar el método `bindMethod` del contenedor. El método `bindMethod` acepta un callback que recibe el trabajo y el contenedor. Dentro del callback, puedes invocar el método `handle` como desees. Normalmente, debes llamar a este método desde el método `boot` de tu [proveedor de servicios](../providers/) `App\Providers\AppServiceProvider`:

```php
use App\Jobs\ProcessPodcast;
use App\Services\AudioProcessor;
use Illuminate\Contracts\Foundation\Application;

$this->app->bindMethod([ProcessPodcast::class, 'handle'], function (ProcessPodcast $job, Application $app) {
    return $job->handle($app->make(AudioProcessor::class));
});
```

> **Advertencia:**
> Los datos binarios, como el contenido de la imagen sin procesar, deben pasar a través de la función `base64_encode` antes de pasar a un trabajo en cola. De lo contrario, es posible que el trabajo no se serialice correctamente en JSON cuando se coloque en la cola.

<a id="handling-relationships"></a>
#### Relaciones en cola

Debido a que todas las relaciones del modelo Eloquent cargadas también se serializan cuando un trabajo está en cola, la cadena del trabajo serializado a veces puede volverse bastante grande. Además, cuando se deserializa un trabajo y se vuelven a recuperar las relaciones del modelo de la base de datos, se recuperarán en su totalidad. Cualquier restricción de relación anterior que se haya aplicado antes de que se serializara el modelo durante el proceso de puesta en cola del trabajo no se aplicará cuando se deserialice el trabajo. Por lo tanto, si deseas trabajar con un subconjunto de una relación determinada, debes volver a restringir esa relación dentro de tu trabajo en cola.

O, para evitar que las relaciones se serialicen, puedes llamar al método `withoutRelations` en el modelo al establecer un valor de propiedad. Este método devolverá una instancia del modelo sin sus relaciones cargadas:

```php
/**
 * Create a new job instance.
 */
public function __construct(
    Podcast $podcast,
) {
    $this->podcast = $podcast->withoutRelations();
}
```

Si solo necesita eliminar relaciones específicas y conservar el resto, puedes utilizar el método `withoutRelation`:

```php
$this->podcast = $podcast->withoutRelation('comments');
```

Si estás utilizando [promoción de propiedades del constructor de PHP](https://www.php.net/manual/en/language.oop5.decon.php#language.oop5.decon.constructor.promotion) y deseas indicar que un modelo Eloquent no debe tener sus relaciones serializadas, puedes usar el atributo `WithoutRelations`:

```php
use Illuminate\Queue\Attributes\WithoutRelations;

/**
 * Create a new job instance.
 */
public function __construct(
    #[WithoutRelations]
    public Podcast $podcast,
) {}
```

Por conveniencia, si deseas serializar todos los modelos sin relaciones, puedes aplicar el atributo `WithoutRelations` a toda la clase en lugar de aplicar el atributo a cada modelo:

```php
<?php

namespace App\Jobs;

use App\Models\DistributionPlatform;
use App\Models\Podcast;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\Attributes\WithoutRelations;

#[WithoutRelations]
class ProcessPodcast implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Podcast $podcast,
        public DistributionPlatform $platform,
    ) {}
}
```

Si un trabajo recibe una colección o array de modelos Eloquent en lugar de un solo modelo, las relaciones de los modelos dentro de esa colección no se restaurarán cuando el trabajo se deserialice y ejecuta. Esto es para evitar el uso excesivo de recursos en trabajos que tratan con una gran cantidad de modelos.

<a id="unique-jobs"></a>
### Trabajos únicos

> **Advertencia:**
> Los trabajos únicos requieren un controlador de caché que admita [bloqueos](../cache/#atomic-locks). Actualmente, los controladores de caché `memcached`, `redis`, `dynamodb`, `database`, `file` y `array` admiten bloqueos atómicos.

> **Advertencia:**
> Las restricciones de trabajos únicos no se aplican a los trabajos dentro de lotes.

A veces, es posible que desees asegurarte de que solo haya una instancia de un trabajo específico en la cola en cualquier momento. Puedes hacerlo implementando la interfaz `ShouldBeUnique` en tu clase de trabajo. Esta interfaz no requiere que definas ningún método adicional en tu clase:

```php
<?php

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Contracts\Queue\ShouldBeUnique;

class UpdateSearchIndex implements ShouldQueue, ShouldBeUnique
{
    // ...
}
```

En el ejemplo anterior, el trabajo `UpdateSearchIndex` es único. Por lo tanto, el trabajo no se despachará si ya hay otra instancia del trabajo en la cola y no ha terminado de procesarse.

En ciertos casos, es posible que desees definir una "clave" específica que haga que el trabajo sea único o puede que desees especificar un tiempo de espera más allá del cual el trabajo ya no seguirá siendo único. Para lograr esto, puedes usar el atributo `UniqueFor` y definir un método `uniqueId` en tu clase de trabajo:

```php
<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Queue\Attributes\UniqueFor;

#[UniqueFor(3600)]
class UpdateSearchIndex implements ShouldQueue, ShouldBeUnique
{
    /**
     * The product instance.
     *
     * @var \App\Models\Product
     */
    public $product;

    /**
     * Get the unique ID for the job.
     */
    public function uniqueId(): string
    {
        return $this->product->id;
    }
}
```
En el ejemplo anterior, el trabajo `UpdateSearchIndex` es único según un ID de producto. Por lo tanto, cualquier nuevo despacho del trabajo con el mismo ID de producto se ignorará hasta que el trabajo existente haya completado su procesamiento. Además, si el trabajo existente no se procesa dentro de una hora, se liberará el bloqueo único y se podrá enviar a la cola otro trabajo con la misma clave única.

> **Advertencia:**
> Si tu aplicación despacha trabajos desde múltiples servidores web o contenedores, debes asegurarte de que todos tus servidores se comuniquen con el mismo servidor de caché central para que Laravel pueda determinar con precisión si un trabajo es único.

<a id="keeping-jobs-unique-until-processing-begins"></a>
#### Mantener trabajos únicos hasta que comience el procesamiento

De forma predeterminada, los trabajos únicos se "desbloquean" después de que un trabajo completa su procesamiento o falla en todos sus reintentos. Sin embargo, puede haber situaciones en las que desees que tu trabajo se desbloquee inmediatamente antes de procesarlo. Para lograr esto, tu trabajo debe implementar el contrato `ShouldBeUniqueUntilProcessing` en lugar del contrato `ShouldBeUnique`:

```php
<?php

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Contracts\Queue\ShouldBeUniqueUntilProcessing;

class UpdateSearchIndex implements ShouldQueue, ShouldBeUniqueUntilProcessing
{
    // ...
}
```

<a id="unique-job-locks"></a>
#### Bloqueos de trabajo únicos

Detrás de escena, cuando se despacha un trabajo `ShouldBeUnique`, Laravel intenta adquirir un [bloqueo](../cache/#atomic-locks) con la clave `uniqueId`. Si el bloqueo ya está retenido, el trabajo no se despacha. Este bloqueo se libera cuando el trabajo completa el procesamiento o falla en todos sus reintentos. De forma predeterminada, Laravel utilizará el controlador de caché predeterminado para obtener este bloqueo. Sin embargo, si deseas utilizar otro controlador para adquirir el bloqueo, puedes definir un método `uniqueVia` que devuelva el controlador de caché que se debe utilizar:

```php
use Illuminate\Contracts\Cache\Repository;
use Illuminate\Support\Facades\Cache;

class UpdateSearchIndex implements ShouldQueue, ShouldBeUnique
{
    // ...

    /**
     * Get the cache driver for the unique job lock.
     */
    public function uniqueVia(): Repository
    {
        return Cache::driver('redis');
    }
}
```

> **Nota:**
> Si solo necesita limitar el procesamiento simultáneo de un trabajo, utiliza el middleware de trabajo [WithoutOverlapping](../queues/#preventing-job-overlaps).

<a id="debounced-jobs"></a>
### Trabajos con antirrebote

A veces, es posible que desees asegurarte de que cuando el mismo trabajo se envíe muchas veces en un período corto, solo se ejecuta el último despacho. Puedes hacerlo agregando el atributo `DebounceFor` a tu trabajo:

```php
<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\Attributes\DebounceFor;

#[DebounceFor(30)]
class UpdateSearchIndex implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(public int $productId)
    {
    }

    /**
     * Get the debounce ID for the job.
     */
    public function debounceId(): string
    {
        return (string) $this->productId;
    }
}
```

En el ejemplo anterior, despachar repetidamente `UpdateSearchIndex` para el mismo producto en `30` segundos aplicará antirrebote al trabajo para que solo se ejecuta el último despacho.

Si deseas limitar el tiempo que se puede aplazar un trabajo reenviado con frecuencia, puedes proporcionar el argumento `maxWait` al atributo `DebounceFor`:

```php
#[DebounceFor(30, maxWait: 120)]
class UpdateSearchIndex implements ShouldQueue
{
    use Queueable;

    // ...
}
```

Puedes personalizar el almacén de caché utilizado para el seguimiento antirrebote definiendo un método `debounceVia` en tu trabajo:

```php
use Illuminate\Contracts\Cache\Repository;
use Illuminate\Support\Facades\Cache;

public function debounceVia(): Repository
{
    return Cache::driver('redis');
}
```

Si un trabajo con antirrebote es reemplazado por un despacho más reciente, Laravel enviará el evento `Illuminate\Queue\Events\JobDebounced` y eliminará el trabajo reemplazado de la cola.

> **Advertencia:**
> Los trabajos con antirrebote y los trabajos únicos se excluyen mutuamente. Un trabajo que utiliza el atributo `DebounceFor` no debería implementar `ShouldBeUnique`.

> **Advertencia:**
> Si tu aplicación despacha trabajos antirrebote desde múltiples servidores web o contenedores, debes asegurarte de que todos tus servidores se comuniquen con el mismo servidor de caché central.

<a id="encrypted-jobs"></a>
### Trabajos cifrados

Laravel te permite garantizar la privacidad e integridad de los datos de un trabajo a través de [cifrado](../encryption/). Para comenzar, simplemente agrega la interfaz `ShouldBeEncrypted` a la clase de trabajo. Una vez que esta interfaz se haya agregado a la clase, Laravel cifrará automáticamente tu trabajo antes de enviarlo a una cola:

```php
<?php

use Illuminate\Contracts\Queue\ShouldBeEncrypted;
use Illuminate\Contracts\Queue\ShouldQueue;

class UpdateSearchIndex implements ShouldQueue, ShouldBeEncrypted
{
    // ...
}
```

<a id="job-middleware"></a>
## Middleware de trabajos

El middleware de trabajos te permite envolver la ejecución de trabajos en cola con lógica personalizada, reduciendo el texto repetitivo en los trabajos mismos. Por ejemplo, considera el siguiente método `handle` que aprovecha las funciones de limitación de frecuencia de Redis de Laravel para permitir que solo se procese un trabajo cada cinco segundos:

```php
use Illuminate\Support\Facades\Redis;

/**
 * Execute the job.
 */
public function handle(): void
{
    Redis::throttle('key')->block(0)->allow(1)->every(5)->then(function () {
        info('Lock obtained...');

        // Handle job...
    }, function () {
        // Could not obtain lock...

        return $this->release(5);
    });
}
```

Si bien este código es válido, la implementación del método `handle` resulta difícil de leer porque está sobrecargada de lógica de limitación de frecuencia de Redis. Además, esta lógica de limitación de frecuencia se debe duplicar para cualquier otro trabajo al que queramos limitar la frecuencia. En lugar de limitar la frecuencia en el método que procesa el trabajo, podríamos definir un middleware de trabajo que maneje la limitación de la frecuencia:

```php
<?php

namespace App\Jobs\Middleware;

use Closure;
use Illuminate\Support\Facades\Redis;

class RateLimited
{
    /**
     * Process the queued job.
     *
     * @param  \Closure(object): void  $next
     */
    public function handle(object $job, Closure $next): void
    {
        Redis::throttle('key')
            ->block(0)->allow(1)->every(5)
            ->then(function () use ($job, $next) {
                // Lock obtained...

                $next($job);
            }, function () use ($job) {
                // Could not obtain lock...

                $job->release(5);
            });
    }
}
```

Como puedes ver, al igual que [middleware de ruta](../middleware/), el middleware del trabajo recibe el trabajo que se está procesando y un callback que debe invocarse para continuar procesando el trabajo.

Puedes generar una nueva clase de middleware de trabajo utilizando el comando `make:job-middleware` Artisan. Después de crear el middleware del trabajo, se pueden adjuntar a un trabajo devolviéndolos desde el método `middleware` del trabajo. Este método no existe en trabajos estructurados por el comando `make:job` Artisan, por lo que deberás agregarlo manualmente a tu clase de trabajo:

```php
use App\Jobs\Middleware\RateLimited;

/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [new RateLimited];
}
```

> **Nota:**
> El middleware de trabajo también se puedes asignar a [listeners de eventos en cola](../events/#queued-event-listeners), [mensajes de correo](../mail/#queueing-mail) y [notificaciones](../notifications/#queueing-notifications).

<a id="rate-limiting"></a>
### Limitación de frecuencia

Aunque acabamos de demostrar cómo escribir tu propio middleware de limitación de frecuencia de trabajo, Laravel en realidad incluye un middleware de limitación de frecuencia que puedes utilizar para limitar la frecuencia de trabajos. Al igual que [limitadores de frecuencia de ruta](../routing/#defining-rate-limiters), los limitadores de frecuencia de trabajo se definen utilizando el método `for` de la fachada `RateLimiter`.

Por ejemplo, es posible que desees permitir a los usuarios hacer una copia de seguridad de sus datos una vez por hora sin imponer dicho límite a los clientes premium. Para lograr esto, puedes definir un `RateLimiter` en el método `boot` de tu `AppServiceProvider`:

```php
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    RateLimiter::for('backups', function (object $job) {
        return $job->user->vipCustomer()
            ? Limit::none()
            : Limit::perHour(1)->by($job->user->id);
    });
}
```

En el ejemplo anterior, definimos un límite de frecuencia por hora; sin embargo, puedes definir fácilmente un límite de frecuencia basado en minutos utilizando el método `perMinute`. Además, puedes pasar cualquier valor que desees al método `by` del límite de frecuencia; sin embargo, este valor se utiliza con mayor frecuencia para segmentar los límites de frecuencia por cliente:

```php
return Limit::perMinute(50)->by($job->user->id);
```

Una vez que hayas definido tu límite de frecuencia, puedes adjuntar el limitador de frecuencia a tu trabajo utilizando el middleware `Illuminate\Queue\Middleware\RateLimited`. Cada vez que el trabajo excede el límite de frecuencia, este middleware devolverá el trabajo a la cola con un retraso adecuado según la duración del límite de frecuencia:

```php
use Illuminate\Queue\Middleware\RateLimited;

/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [new RateLimited('backups')];
}
```

Liberar un trabajo de frecuencia limitada nuevamente a la cola seguirá incrementando el número total de `attempts` del trabajo. Es posible que desees ajustar tus atributos `Tries` y `MaxExceptions` en tu clase de trabajo en consecuencia. O bien, es posible que desees utilizar el método [retryUntil](#time-based-attempts) para definir la cantidad de tiempo hasta que ya no se deba intentar el trabajo.

Usando el método `releaseAfter`, también puedes especificar la cantidad de segundos que deben transcurrir antes de que se intente nuevamente el trabajo liberado:

```php
/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new RateLimited('backups'))->releaseAfter(60)];
}
```

Si no desea que se vuelva a intentar un trabajo cuando tiene frecuencia limitada, puedes utilizar el método `dontRelease`:

```php
/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new RateLimited('backups'))->dontRelease()];
}
```

<a id="rate-limiting-with-redis"></a>
#### Limitación de frecuencia con Redis

Si estás utilizando Redis, puedes utilizar el middleware `Illuminate\Queue\Middleware\RateLimitedWithRedis`, que está optimizado para Redis y es más eficiente que el middleware básico de limitación de frecuencia:

```php
use Illuminate\Queue\Middleware\RateLimitedWithRedis;

public function middleware(): array
{
    return [new RateLimitedWithRedis('backups')];
}
```

El método `connection` se puede utilizar para especificar qué conexión de Redis debe utilizar el middleware:

```php
return [(new RateLimitedWithRedis('backups'))->connection('limiter')];
```

<a id="preventing-job-overlaps"></a>
### Prevención de superposiciones de trabajos

Laravel incluye un middleware `Illuminate\Queue\Middleware\WithoutOverlapping` que te permite evitar superposiciones de trabajos en función de una clave arbitraria. Esto puede resultar útil cuando un trabajo en cola modifica un recurso que solo debe ser modificado por un trabajo a la vez.

Por ejemplo, imaginemos que tienes un trabajo en cola que actualiza el puntaje crediticio de un usuario y deseas evitar que el trabajo de actualización del puntaje crediticio se superponga para el mismo ID de usuario. Para lograr esto, puedes devolver el middleware `WithoutOverlapping` desde el método `middleware` de tu trabajo:

```php
use Illuminate\Queue\Middleware\WithoutOverlapping;

/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [new WithoutOverlapping($this->user->id)];
}
```

Liberar un trabajo superpuesto nuevamente a la cola seguirá incrementando el número total de intentos del trabajo. Es posible que desees ajustar tus atributos `Tries` y `MaxExceptions` en tu clase de trabajo en consecuencia. Por ejemplo, dejar `Tries` en 1 como está de forma predeterminada evitaría que se vuelva a intentar cualquier trabajo superpuesto más adelante.

Cualquier trabajo superpuesto del mismo tipo se devolverá a la cola. También puedes especificar la cantidad de segundos que deben transcurrir antes de que se intente nuevamente el trabajo liberado:

```php
/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new WithoutOverlapping($this->order->id))->releaseAfter(60)];
}
```

Si deseas eliminar inmediatamente cualquier trabajo superpuesto para que no se vuelva a intentar, puedes utilizar el método `dontRelease`:

```php
/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new WithoutOverlapping($this->order->id))->dontRelease()];
}
```

El middleware `WithoutOverlapping` funciona con la función de bloqueo atómico de Laravel. A veces, tu trabajo puede fallar inesperadamente o expirar de tal manera que el bloqueo no se libera. Por lo tanto, puedes definir explícitamente un tiempo de vencimiento de bloqueo utilizando el método `expireAfter`. Por ejemplo, el siguiente ejemplo le indicará a Laravel que libere el bloqueo `WithoutOverlapping` tres minutos después de que el trabajo haya comenzado a procesarse:

```php
/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new WithoutOverlapping($this->order->id))->expireAfter(180)];
}
```

> **Advertencia:**
> El middleware `WithoutOverlapping` requiere un controlador de caché que admita [bloqueos](../cache/#atomic-locks). Actualmente, los controladores de caché `memcached`, `redis`, `dynamodb`, `database`, `file` y `array` admiten bloqueos atómicos.

<a id="sharing-lock-keys"></a>
#### Compartir claves de bloqueo entre clases de trabajo

De forma predeterminada, el middleware `WithoutOverlapping` solo evitará la superposición de trabajos de la misma clase. Por lo tanto, aunque dos clases de trabajo diferentes pueden usar la misma clave de bloqueo, no se evitará que se superpongan. Sin embargo, puedes indicarle a Laravel que aplique la clave en todas las clases de trabajo usando el método `shared`:

```php
use Illuminate\Queue\Middleware\WithoutOverlapping;

class ProviderIsDown
{
    // ...

    public function middleware(): array
    {
        return [
            (new WithoutOverlapping("status:{$this->provider}"))->shared(),
        ];
    }
}

class ProviderIsUp
{
    // ...

    public function middleware(): array
    {
        return [
            (new WithoutOverlapping("status:{$this->provider}"))->shared(),
        ];
    }
}
```

<a id="throttling-exceptions"></a>
### Limitación de excepciones

Laravel incluye un middleware `Illuminate\Queue\Middleware\ThrottlesExceptions` que te permite limitar las excepciones. Una vez que el trabajo genera un número determinado de excepciones, todos los intentos posteriores de ejecutar el trabajo se retrasan hasta que transcurra un intervalo de tiempo específico. Este middleware es particularmente útil para trabajos que interactúan con servicios de terceros que son inestables.

Por ejemplo, imaginemos un trabajo en cola que interactúa con una API de terceros que comienza a generar excepciones. Para limitar las excepciones, puedes devolver el middleware `ThrottlesExceptions` desde el método `middleware` de tu trabajo. Normalmente, este middleware debe combinarse con un trabajo que implemente [intentos basados ​​en el tiempo](#time-based-attempts):

```php
use DateTime;
use Illuminate\Queue\Middleware\ThrottlesExceptions;

/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [new ThrottlesExceptions(10, 5 * 60)];
}

/**
 * Determine the time at which the job should timeout.
 */
public function retryUntil(): DateTime
{
    return now()->plus(minutes: 30);
}
```

El primer argumento del constructor aceptado por el middleware es el número de excepciones que el trabajo puedes generar antes de ser limitado, mientras que el segundo argumento del constructor es el número de segundos que deben transcurrir antes de que el trabajo se intente nuevamente una vez que se ha limitado. En el ejemplo de código anterior, si el trabajo genera 10 excepciones consecutivas, esperaremos 5 minutos antes de intentar realizar el trabajo nuevamente, limitado por el límite de tiempo de 30 minutos.

Cuando un trabajo genera una excepción pero aún no se ha alcanzado el umbral de excepción, normalmente el trabajo se reintentará inmediatamente. Sin embargo, puedes especificar la cantidad de minutos que dicho trabajo debe retrasarse llamando al método `backoff` al adjuntar el middleware al trabajo:

```php
use Illuminate\Queue\Middleware\ThrottlesExceptions;

/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new ThrottlesExceptions(10, 5 * 60))->backoff(5)];
}
```

El método `backoff` también acepta una función anónima que recibe la excepción lanzada, lo que permite determinar dinámicamente el retraso:

```php
use App\Exceptions\RateLimitedException;
use Illuminate\Queue\Middleware\ThrottlesExceptions;
use Throwable;

/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new ThrottlesExceptions(10, 5 * 60))->backoff(
        fn (Throwable $throwable) => $throwable instanceof RateLimitedException
            ? $throwable->retryAfterMinutes()
            : 5
    )];
}
```

Internamente, este middleware utiliza el sistema de caché de Laravel para implementar la limitación de frecuencia, y el nombre de clase del trabajo se utiliza como "clave" de caché. Puedes anular esta clave llamando al método `by` al adjuntar el middleware a tu trabajo. Esto puede resultar útil si tienes varios trabajos que interactúan con el mismo servicio de terceros y deseas que compartan un "depósito" de limitación común para garantizar que respeten un único límite compartido:

```php
use Illuminate\Queue\Middleware\ThrottlesExceptions;

/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new ThrottlesExceptions(10, 10 * 60))->by('key')];
}
```

De forma predeterminada, este middleware limitará todas las excepciones. Puedes modificar este comportamiento invocando el método `when` al adjuntar el middleware a tu trabajo. La excepción solo se limitará si la función anónima proporcionada al método `when` devuelve `true`:

```php
use Illuminate\Http\Client\HttpClientException;
use Illuminate\Queue\Middleware\ThrottlesExceptions;

/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new ThrottlesExceptions(10, 10 * 60))->when(
        fn (Throwable $throwable) => $throwable instanceof HttpClientException
    )];
}
```

A diferencia del método `when`, que libera el trabajo nuevamente en la cola o genera una excepción, el método `deleteWhen` te permite eliminar el trabajo por completo cuando ocurre una excepción determinada:

```php
use App\Exceptions\CustomerDeletedException;
use Illuminate\Queue\Middleware\ThrottlesExceptions;

/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new ThrottlesExceptions(2, 10 * 60))->deleteWhen(CustomerDeletedException::class)];
}
```

Si deseas que las excepciones limitadas se informen al controlador de excepciones de tu aplicación, puedes hacerlo invocando el método `report` al adjuntar el middleware a tu trabajo. Opcionalmente, puedes proporcionar una función anónima al método `report` y la excepción solo se informará si la función anónima dada devuelve `true`:

```php
use Illuminate\Http\Client\HttpClientException;
use Illuminate\Queue\Middleware\ThrottlesExceptions;

/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new ThrottlesExceptions(10, 10 * 60))->report(
        fn (Throwable $throwable) => $throwable instanceof HttpClientException
    )];
}
```

<a id="throttling-exceptions-with-redis"></a>
#### Limitación de excepciones con Redis

Si estás utilizando Redis, puedes utilizar el middleware `Illuminate\Queue\Middleware\ThrottlesExceptionsWithRedis`, que está optimizado para Redis y es más eficiente que el middleware básico de limitación de excepciones:

```php
use Illuminate\Queue\Middleware\ThrottlesExceptionsWithRedis;

public function middleware(): array
{
    return [new ThrottlesExceptionsWithRedis(10, 10 * 60)];
}
```

El método `connection` se puede utilizar para especificar qué conexión de Redis debe utilizar el middleware:

```php
return [(new ThrottlesExceptionsWithRedis(10, 10 * 60))->connection('limiter')];
```

<a id="releasing-jobs"></a>
### Liberación de trabajos

El middleware `Release` te permite devolver un trabajo a la cola sin ejecutarlo. El método `Release::when` liberará el trabajo si la condición dada se evalúa como `true`, mientras que el método `Release::unless` liberará el trabajo si la condición se evalúa como `false`:

```php
use Illuminate\Queue\Middleware\Release;

/**
 * Get the middleware the job should pass through.
 */
public function middleware(): array
{
    return [
        Release::when($condition, releaseAfter: 60),
    ];
}
```

Liberar un trabajo nuevamente a la cola seguirá incrementando el número total de intentos del trabajo. Es posible que desees ajustar tus atributos `Tries` y `MaxExceptions` en tu clase de trabajo en consecuencia.

También puedes pasar un `Closure` a los métodos `when` y `unless` para una evaluación condicional más compleja:

```php
use Illuminate\Queue\Middleware\Release;

/**
 * Get the middleware the job should pass through.
 */
public function middleware(): array
{
    return [
        Release::when(function (): bool {
            return ! $this->order->isPaid();
        }, releaseAfter: 60),
    ];
}
```

<a id="skipping-jobs"></a>
### Omisión de trabajos

El middleware `Skip` te permite especificar que un trabajo debe omitirse o eliminarse sin necesidad de modificar la lógica del trabajo. El método `Skip::when` eliminará el trabajo si la condición dada se evalúa como `true`, mientras que el método `Skip::unless` eliminará el trabajo si la condición se evalúa como `false`:

```php
use Illuminate\Queue\Middleware\Skip;

/**
 * Get the middleware the job should pass through.
 */
public function middleware(): array
{
    return [
        Skip::when($condition),
    ];
}
```

También puedes pasar un `Closure` a los métodos `when` y `unless` para una evaluación condicional más compleja:

```php
use Illuminate\Queue\Middleware\Skip;

/**
 * Get the middleware the job should pass through.
 */
public function middleware(): array
{
    return [
        Skip::when(function (): bool {
            return $this->shouldSkip();
        }),
    ];
}
```

<a id="dispatching-jobs"></a>
## Despacho de trabajos

Una vez que hayas escrito tu clase de trabajo, puedes enviarla utilizando el método `dispatch` en el trabajo mismo. Los argumentos pasados ​​al método `dispatch` se entregarán al constructor del trabajo:

```php
<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessPodcast;
use App\Models\Podcast;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PodcastController extends Controller
{
    /**
     * Store a new podcast.
     */
    public function store(Request $request): RedirectResponse
    {
        $podcast = Podcast::create(/* ... */);

        // ...

        ProcessPodcast::dispatch($podcast);

        return redirect('/podcasts');
    }
}
```

Si deseas despachar un trabajo de forma condicional, puedes utilizar los métodos `dispatchIf` y `dispatchUnless`:

```php
ProcessPodcast::dispatchIf($accountActive, $podcast);

ProcessPodcast::dispatchUnless($accountSuspended, $podcast);
```

En las nuevas aplicaciones de Laravel, la conexión `database` se define como la cola predeterminada. Puedes especificar una conexión de cola predeterminada diferente cambiando la variable de entorno `QUEUE_CONNECTION` en el archivo `.env` de tu aplicación.

<a id="delayed-dispatching"></a>
### Despacho con retraso

Si deseas especificar que un trabajo no debe estar disponible inmediatamente para que un trabajador de la cola lo procese, puedes utilizar el método `delay` al despachar el trabajo. Por ejemplo, especificamos que un trabajo no debería estar disponible para su procesamiento hasta 10 minutos después de haber sido enviado:

```php
<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessPodcast;
use App\Models\Podcast;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PodcastController extends Controller
{
    /**
     * Store a new podcast.
     */
    public function store(Request $request): RedirectResponse
    {
        $podcast = Podcast::create(/* ... */);

        // ...

        ProcessPodcast::dispatch($podcast)
            ->delay(now()->plus(minutes: 10));

        return redirect('/podcasts');
    }
}
```

En algunos casos, los trabajos pueden tener configurado un retraso predeterminado. Si necesitas evitar este retraso y despachar un trabajo para su procesamiento inmediato, puedes utilizar el método `withoutDelay`:

```php
ProcessPodcast::dispatch($podcast)->withoutDelay();
```

> **Advertencia:**
> El servicio de cola de Amazon SQS tiene un tiempo de demora máximo de 15 minutos.

<a id="synchronous-dispatching"></a>
### Despacho sincrónico

Si deseas despachar un trabajo inmediatamente (sincrónicamente), puedes utilizar el método `dispatchSync`. Al utilizar este método, el trabajo no se pondrá en cola y se ejecutará inmediatamente dentro del proceso actual:

```php
<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessPodcast;
use App\Models\Podcast;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PodcastController extends Controller
{
    /**
     * Store a new podcast.
     */
    public function store(Request $request): RedirectResponse
    {
        $podcast = Podcast::create(/* ... */);

        // Create podcast...

        ProcessPodcast::dispatchSync($podcast);

        return redirect('/podcasts');
    }
}
```

<a id="deferred-dispatching"></a>
#### Despacho diferido

Al utilizar el despacho sincrónico diferido, puedes despachar un trabajo para que se procese durante el proceso actual, pero después de que se haya enviado la respuesta HTTP al usuario. Esto te permite procesar trabajos "en cola" de forma sincrónica sin ralentizar la experiencia de la aplicación del usuario. Para diferir la ejecución de un trabajo sincrónico, despache el trabajo a la conexión `deferred`:

```php
RecordDelivery::dispatch($order)->onConnection('deferred');
```

La conexión `deferred` también sirve como la [cola de conmutación por error](#queue-failover).

De manera similar, la conexión `background` procesa trabajos después de que se ha enviado la respuesta HTTP al usuario; sin embargo, el trabajo se procesa en un proceso PHP generado por separado, lo que permite que el trabajador de aplicación/PHP-FPM esté disponible para manejar otra solicitud HTTP entrante:

```php
RecordDelivery::dispatch($order)->onConnection('background');
```

<a id="bulk-dispatching"></a>
### Despacho masivo

Si necesitas enviar muchos trabajos independientes a la vez y no necesita [seguimiento por lotes](#job-batching) o callbacks, puedes utilizar el método `bulk` de la fachada `Bus`. Laravel agrupará los trabajos por tu conexión de cola configurada y nombre de cola y enviará cada grupo a la cola apropiada de forma masiva:

```php
use App\Jobs\ProcessUser;
use Illuminate\Support\Facades\Bus;

Bus::bulk(
    $users->map(fn ($user) => new ProcessUser($user))
);
```

<a id="preparing-jobs-before-dispatch"></a>
### Preparación de trabajos antes del despacho

Si un trabajo necesita preparar o inspeccionar su estado antes de enviarlo a la cola, el trabajo puede implementar la interfaz `Illuminate\Contracts\Queue\PreparesForDispatch`. Laravel invocará el método `prepareForDispatch` del trabajo antes de enviarlo. Si este método devuelve `false`, el trabajo no se despachará:

```php
<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\PreparesForDispatch;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Cache;

class SyncPodcasts implements PreparesForDispatch, ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public array $podcastIds,
    ) {}

    /**
     * Prepare the job before dispatching.
     */
    public function prepareForDispatch(): bool
    {
        return collect($this->podcastIds)
            ->reject(fn (int $id) => Cache::has("podcast-syncing:{$id}"))
            ->isNotEmpty();
    }
}
```

<a id="jobs-and-database-transactions"></a>
### Trabajos y transacciones de bases de datos

Si bien está perfectamente bien despachar trabajos dentro de transacciones de bases de datos, debes tener especial cuidado para asegurarte de que tu trabajo realmente pueda ejecutarse correctamente. Al despachar un trabajo dentro de una transacción, es posible que un trabajador procese el trabajo antes de que se haya confirmado la transacción principal. Cuando esto sucede, es posible que las actualizaciones que hayas realizado en los modelos o registros de la base de datos durante las transacciones de la base de datos aún no se reflejen en la base de datos. Además, es posible que cualquier modelo o registro de base de datos creado dentro de las transacciones no exista en la base de datos.

Afortunadamente, Laravel proporciona varios métodos para solucionar este problema. Primero, puedes configurar la opción de conexión `after_commit` en el array de configuración de tu conexión de cola:

```php
'redis' => [
    'driver' => 'redis',
    // ...
    'after_commit' => true,
],
```

Cuando la opción `after_commit` es `true`, puedes despachar trabajos dentro de transacciones de la base de datos; sin embargo, Laravel esperará hasta que se hayan confirmado las transacciones abiertas de la base de datos principal antes de despachar el trabajo. Por supuesto, si no hay ninguna transacción de base de datos abierta actualmente, el trabajo se despachará inmediatamente.

Si una transacción se revierte debido a una excepción que ocurre durante la transacción, los trabajos que se enviaron durante esa transacción se descartarán.

> **Nota:**
> Establecer la opción de configuración `after_commit` en `true` también hará que los listeners de eventos, mensajes de correo, notificaciones y eventos de transmisión en cola se envíen después de que se hayan confirmado todas las transacciones de la base de datos abierta.

<a id="specifying-commit-dispatch-behavior-inline"></a>
#### Especificación del comportamiento de despacho tras la confirmación para un trabajo

Si no estableces la opción de configuración de conexión de cola `after_commit` en `true`, aún puedes indicar que se debe despachar un trabajo específico después de que se hayan confirmado todas las transacciones de la base de datos abierta. Para lograr esto, puedes encadenar el método `afterCommit` en tu operación de despacho:

```php
use App\Jobs\ProcessPodcast;

ProcessPodcast::dispatch($podcast)->afterCommit();
```

Del mismo modo, si la opción de configuración `after_commit` está configurada en `true`, puedes indicar que un trabajo específico debe enviarse inmediatamente sin esperar a que se confirme ninguna transacción de base de datos abierta:

```php
ProcessPodcast::dispatch($podcast)->beforeCommit();
```

<a id="job-chaining"></a>
### Encadenamiento de trabajos

El encadenamiento de trabajos te permite especificar una lista de trabajos en cola que deben ejecutarse en secuencia después de que el trabajo principal se haya ejecutado correctamente. Si un trabajo de la secuencia falla, el resto de los trabajos no se ejecutarán. Para ejecutar una cadena de trabajos en cola, puedes utilizar el método `chain` proporcionado por la fachada `Bus`. El bus de comandos de Laravel es un componente de nivel inferior sobre el que se construye el despacho de trabajos en cola:

```php
use App\Jobs\OptimizePodcast;
use App\Jobs\ProcessPodcast;
use App\Jobs\ReleasePodcast;
use Illuminate\Support\Facades\Bus;

Bus::chain([
    new ProcessPodcast,
    new OptimizePodcast,
    new ReleasePodcast,
])->dispatch();
```

Además de encadenar instancias de clases de trabajo, también puedes encadenar funciones anónimas:

```php
Bus::chain([
    new ProcessPodcast,
    new OptimizePodcast,
    function () {
        Podcast::update(/* ... */);
    },
])->dispatch();
```

> **Advertencia:**
> Eliminar trabajos utilizando el método `$this->delete()` dentro del trabajo no impedirá que se procesen los trabajos encadenados. La cadena solo dejará de ejecutarse si falla un trabajo de la cadena.

<a id="chain-connection-queue"></a>
#### Conexión y cola de la cadena

Si deseas especificar la conexión y la cola que se deben usar para los trabajos encadenados, puedes usar los métodos `onConnection` y `onQueue`. Estos métodos especifican la conexión de la cola y el nombre de la cola que se deben usar a menos que al trabajo en cola se le asigne explícitamente una conexión/cola diferente:

```php
Bus::chain([
    new ProcessPodcast,
    new OptimizePodcast,
    new ReleasePodcast,
])->onConnection('redis')->onQueue('podcasts')->dispatch();
```

<a id="adding-jobs-to-the-chain"></a>
#### Agregar trabajos a la cadena

En ocasiones, es posible que necesites anteponer o agregar un trabajo a una cadena de trabajos existente desde otro trabajo de esa cadena. Puedes lograr esto utilizando los métodos `prependToChain` y `appendToChain`:

```php
/**
 * Execute the job.
 */
public function handle(): void
{
    // ...

    // Prepend to the current chain, run job immediately after current job...
    $this->prependToChain(new TranscribePodcast);

    // Append to the current chain, run job at end of chain...
    $this->appendToChain(new TranscribePodcast);
}
```

<a id="chain-failures"></a>
#### Fallos en la cadena

Al encadenar trabajos, puedes utilizar el método `catch` para especificar una función anónima que debe invocarse si falla un trabajo dentro de la cadena. El callback proporcionado recibirá la instancia `Throwable` que provocó el error del trabajo:

```php
use Illuminate\Support\Facades\Bus;
use Throwable;

Bus::chain([
    new ProcessPodcast,
    new OptimizePodcast,
    new ReleasePodcast,
])->catch(function (Throwable $e) {
    // A job within the chain has failed...
})->dispatch();
```

> **Advertencia:**
> Dado que los callbacks en cadena se serializan y ejecutan posteriormente por la cola de Laravel, no debes usar la variable `$this` dentro de los callbacks en cadena.

<a id="customizing-the-queue-and-connection"></a>
### Personalización de la cola y la conexión

<a id="dispatching-to-a-particular-queue"></a>
#### Despacho a una cola específica

Al despachar trabajos a diferentes colas, puedes "categorizar" tus trabajos en cola e incluso priorizar cuántos trabajadores asignas a varias colas. Ten en cuenta que esto no despacha trabajos a diferentes "conexiones" de cola según lo define tu archivo de configuración de cola, sino solo a colas específicas dentro de una única conexión. Para especificar la cola, utiliza el método `onQueue` al despachar el trabajo:

```php
<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessPodcast;
use App\Models\Podcast;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PodcastController extends Controller
{
    /**
     * Store a new podcast.
     */
    public function store(Request $request): RedirectResponse
    {
        $podcast = Podcast::create(/* ... */);

        // Create podcast...

        ProcessPodcast::dispatch($podcast)->onQueue('processing');

        return redirect('/podcasts');
    }
}
```

Alternativamente, puedes especificar la cola del trabajo llamando al método `onQueue` dentro del constructor del trabajo:

```php
<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ProcessPodcast implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        $this->onQueue('processing');
    }
}
```

<a id="dispatching-to-a-particular-connection"></a>
#### Despacho a una conexión específica

Si tu aplicación interactúa con varias conexiones de cola, puedes especificar a qué conexión despachar un trabajo utilizando el método `onConnection`:

```php
<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessPodcast;
use App\Models\Podcast;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PodcastController extends Controller
{
    /**
     * Store a new podcast.
     */
    public function store(Request $request): RedirectResponse
    {
        $podcast = Podcast::create(/* ... */);

        // Create podcast...

        ProcessPodcast::dispatch($podcast)->onConnection('sqs');

        return redirect('/podcasts');
    }
}
```

Puedes encadenar los métodos `onConnection` y `onQueue` para especificar la conexión y la cola para un trabajo:

```php
ProcessPodcast::dispatch($podcast)
    ->onConnection('sqs')
    ->onQueue('processing');
```

Alternativamente, puedes especificar la conexión del trabajo llamando al método `onConnection` dentro del constructor del trabajo:

```php
<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ProcessPodcast implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        $this->onConnection('sqs');
    }
}
```

<a id="queue-routing"></a>
#### Enrutamiento de cola

Puedes utilizar el método `route` de la fachada `Queue` para definir una conexión y una cola predeterminadas para clases de trabajo específicas. Esto es útil cuando desea garantizar que ciertos trabajos siempre utilizan colas específicas sin necesidad de especificar la conexión o cola en el trabajo.

Además de enrutar clases de trabajo específicas, también puedes pasar una interfaz, un trait o una clase principal al método `route`. Cuando hagas esto, cualquier trabajo que implemente la interfaz, use el trait o extienda la clase principal usará automáticamente la conexión y la cola configuradas.

Normalmente, deberías llamar al método `route` desde el método `boot` de un proveedor de servicios:

```php
use App\Concerns\RequiresVideo;
use App\Jobs\ProcessPodcast;
use App\Jobs\ProcessVideo;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Support\Facades\Queue;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Queue::route(ProcessPodcast::class, connection: 'redis', queue: 'podcasts');
    Queue::route(RequiresVideo::class, queue: 'video');
    Queue::route(ShouldBroadcast::class, queue: 'events');
}
```

Cuando se especifica una conexión sin cola, el trabajo se despachará a la cola predeterminada:

```php
Queue::route(ProcessPodcast::class, connection: 'redis');
```

También puedes enrutar varias clases de trabajo a la vez pasando un array al método `route`:

```php
Queue::route([
    ProcessPodcast::class => ['redis', 'podcasts'], // Connection and queue
    ProcessVideo::class => 'videos', // Queue only (uses default connection)
]);
```

> **Nota:**
> El trabajo aún puedes anular el enrutamiento de la cola por trabajo.

Puedes utilizar el método `forward` para redespachar trabajos de una cola a otra cola y/o conexión. Esto resulta útil cuando necesitas cambiar la infraestructura de la cola sin modificar trabajos individuales o ubicaciones de envío:

```php
Queue::forward('reports', 'reports.fifo', 'sqs');
Queue::forward('payments', connection: 'sqs');
Queue::forward('updates', 'notifications');
```

También puedes reenviar varias colas a la vez pasando un array:

```php
Queue::forward([
    'reports' => 'reports.fifo',
    'emails' => 'emails.fifo',
], connection: 'sqs');
```

Una conexión explícita configurada en un trabajo tiene prioridad sobre una conexión reenviada.

<a id="max-job-attempts-and-timeout"></a>
### Especificación del máximo de intentos y los tiempos de espera de los trabajos

<a id="max-attempts"></a>
#### Intentos máximos

Los intentos de trabajo son un concepto central del sistema de colas de Laravel y potencian muchas funciones avanzadas. Si bien pueden parecer confusos al principio, es importante comprender cómo funcionan antes de modificar la configuración predeterminada.

Cuando se despacha un trabajo, se coloca en la cola. Luego, un trabajador lo recoge e intenta ejecutarlo. Este es un intento de trabajo.

Sin embargo, un intento no significa necesariamente que se haya ejecutado el método `handle` del trabajo. Los intentos también se pueden "consumir" de varias formas:

<div class="content-list" markdown="1">

- El trabajo encuentra una excepción no controlada durante la ejecución.
- El trabajo se libera manualmente a la cola mediante `$this->release()`.
- El middleware como `WithoutOverlapping` o `RateLimited` no logra adquirir un bloqueo y libera el trabajo.
- El trabajo expiró.
- El método `handle` del trabajo se ejecuta y completa sin generar una excepción.

</div>

Probablemente no querrás seguir intentando ejecutar un trabajo indefinidamente. Por lo tanto, Laravel proporciona varias formas de especificar cuántas veces o durante cuánto tiempo se puede intentar un trabajo.

> **Nota:**
> De forma predeterminada, Laravel solo intentará realizar un trabajo una vez. Si tu trabajo utiliza middleware como `WithoutOverlapping` o `RateLimited`, o si estás liberando trabajos manualmente, probablemente necesitarás aumentar la cantidad de intentos permitidos a través de la opción `tries`.

Una forma de especificar el número máximo de veces que se puede intentar un trabajo es mediante el interruptor `--tries` en la línea de comando de Artisan. Esto se aplicará a todos los trabajos procesados ​​por el trabajador a menos que el trabajo que se procesa especifique la cantidad de veces que se puede intentar:

```shell
php artisan queue:work --tries=3
```

Si un trabajo excede su número máximo de intentos, se considerará un trabajo "fallido". Para obtener más información sobre cómo manejar trabajos fallidos, consulta la [documentación de trabajos fallidos](#dealing-with-failed-jobs). Si se proporciona `--tries=0` al comando `queue:work`, el trabajo se reintentará indefinidamente.

Puedes adoptar un enfoque más granular definiendo el número máximo de veces que se puede intentar un trabajo en la propia clase de trabajo utilizando el atributo `Tries`. Si se especifica el número máximo de intentos en el trabajo, tendrá prioridad sobre el valor `--tries` proporcionado en la línea de comando:

```php
<?php

namespace App\Jobs;

use Illuminate\Queue\Attributes\Tries;

#[Tries(5)]
class ProcessPodcast implements ShouldQueue
{
    // ...
}
```

Si necesitas control dinámico sobre los intentos máximos de un trabajo en particular, puedes definir un método `tries` en el trabajo:

```php
/**
 * Determine number of times the job may be attempted.
 */
public function tries(): int
{
    return 5;
}
```

<a id="time-based-attempts"></a>
#### Intentos basados ​​en el tiempo

Como alternativa a definir cuántas veces se puede intentar un trabajo antes de que falle, puedes definir un momento en el que ya no se debe intentar el trabajo. Esto permite intentar un trabajo cualquier número de veces dentro de un período de tiempo determinado. Para definir la hora a la que ya no se debe intentar un trabajo, agrega un método `retryUntil` a tu clase de trabajo. Este método debería devolver una instancia de `DateTime`:

```php
use DateTime;

/**
 * Determine the time at which the job should timeout.
 */
public function retryUntil(): DateTime
{
    return now()->plus(minutes: 10);
}
```

Si se definen tanto `retryUntil` como `tries`, Laravel da prioridad al método `retryUntil`.

> **Nota:**
> También puedes definir un atributo `Tries` o un método `retryUntil` en tus [listeners de eventos en cola](../events/#queued-event-listeners) y [notificaciones en cola](../notifications/#queueing-notifications).

<a id="max-exceptions"></a>
#### Excepciones máximas

A veces es posible que desees especificar que un trabajo se puede intentar muchas veces, pero debería fallar si los reintentos se activan por un número determinado de excepciones no controladas (en lugar de ser liberados directamente por el método `release`). Para lograr esto, puedes utilizar los atributos `Tries` y `MaxExceptions` en tu clase de trabajo:

```php
<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\Attributes\MaxExceptions;
use Illuminate\Queue\Attributes\Tries;
use Illuminate\Support\Facades\Redis;

#[Tries(25)]
#[MaxExceptions(3)]
class ProcessPodcast implements ShouldQueue
{
    use Queueable;

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Redis::throttle('key')->allow(10)->every(60)->then(function () {
            // Lock obtained, process the podcast...
        }, function () {
            // Unable to obtain lock...
            return $this->release(10);
        });
    }
}
```

En este ejemplo, el trabajo se devuelve a la cola con un retraso de diez segundos si la aplicación no puede obtener un bloqueo de Redis y se continuará reintentando hasta 25 veces. Sin embargo, el trabajo fallará si el trabajo genera tres excepciones no controladas.

De forma predeterminada, un intento que finaliza porque el proceso de trabajo falló o fue cancelado, como cuando se queda sin memoria, no cuenta para el número máximo de excepciones del trabajo. Si deseas que estos intentos cuenten como una excepción, puedes agregar el atributo `CountCrashesAsExceptions` a tu clase de trabajo:

```php
use Illuminate\Queue\Attributes\CountCrashesAsExceptions;
use Illuminate\Queue\Attributes\MaxExceptions;
use Illuminate\Queue\Attributes\Tries;

#[Tries(25)]
#[MaxExceptions(3)]
#[CountCrashesAsExceptions]
class ProcessPodcast implements ShouldQueue
{
    // ...
}
```

Cuando este atributo está presente, el trabajador almacena un marcador en la memoria caché de tu aplicación mientras se procesa el trabajo. Si el marcador aún existe la siguiente vez que se intenta realizar el trabajo, el intento anterior se cuenta como una excepción.

<a id="stopping-retries-by-exception"></a>
#### Detener reintentos por excepción

A veces, una excepción indica que un trabajo en cola debería fallar inmediatamente en lugar de liberarse para otro intento. Puedes configurar tipos de excepción que deberían detener los reintentos de trabajo utilizando el método de excepción `dontRetry` en el archivo `bootstrap/app.php` de tu aplicación:

```php
use App\Exceptions\InvalidPodcastSourceException;
use Illuminate\Foundation\Configuration\Exceptions;

->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->dontRetry([
        InvalidPodcastSourceException::class,
    ]);
})
```

Si necesitas más control sobre cuándo deben detenerse los reintentos, puedes proporcionar una función anónima al método `dontRetryWhen`. Cuando la función anónima devuelva `true`, el trabajo se marcará como fallido y no se volverá a intentar:

```php
use App\Exceptions\PodcastProcessingException;
use Illuminate\Foundation\Configuration\Exceptions;

->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->dontRetryWhen(function (PodcastProcessingException $e) {
        return $e->reason() === 'Subscription expired';
    });
})
```

<a id="timeout"></a>
#### Tiempo de espera

A menudo, sabes aproximadamente cuánto tiempo espera que tarden los trabajos en cola. Por este motivo, Laravel te permite especificar un valor de "tiempo de espera". De forma predeterminada, el valor del tiempo de espera es de 60 segundos. Si un trabajo se procesa durante más tiempo que el número de segundos especificado por el valor de tiempo de espera, el trabajador que procesa el trabajo saldrá con un error. Normalmente, el trabajador será reiniciado automáticamente por un [administrador de procesos configurado en tu servidor](#supervisor-configuration).

La cantidad máxima de segundos que se pueden ejecutar los trabajos se puede especificar usando el interruptor `--timeout` en la línea de comando de Artisan:

```shell
php artisan queue:work --timeout=30
```

Si el trabajo excede su máximo de intentos debido a que se agota repetidamente el tiempo de espera, se marcará como fallido.

También puedes definir la cantidad máxima de segundos que se debe permitir que se ejecute un trabajo usando el atributo `Timeout` en la clase de trabajo. Si se especifica el tiempo de espera en el trabajo, tendrá prioridad sobre cualquier tiempo de espera especificado en la línea de comando:

```php
<?php

namespace App\Jobs;

use Illuminate\Queue\Attributes\Timeout;

#[Timeout(120)]
class ProcessPodcast implements ShouldQueue
{
    // ...
}
```

A veces, es posible que los procesos de bloqueo de E/S, como sockets o conexiones HTTP salientes, no respeten el tiempo de espera especificado. Por lo tanto, cuando utilizas estas funciones, siempre debes intentar especificar un tiempo de espera utilizando también sus API. Por ejemplo, cuando utilizas [Guzzle](https://docs.guzzlephp.org), siempre debes especificar los tiempos de espera de conexión y de solicitud.

> **Advertencia:**
> Se debe instalar la extensión PHP [PCNTL](https://www.php.net/manual/en/book.pcntl.php) para especificar los tiempos de espera de los trabajos. Además, el valor de "tiempo de espera" de un trabajo siempre debe ser menor que su valor ["reintentar después"](#job-expiration). De lo contrario, es posible que se vuelva a intentar el trabajo antes de que haya terminado de ejecutarse o antes de que se agote el tiempo de espera. La opción `--timeout` no tiene ningún efecto cuando se invoca el comando `queue:work` con la opción `--once`.

<a id="failing-on-timeout"></a>
#### Fallo al agotar el tiempo de espera

Si deseas indicar que un trabajo debe marcarse como [fallido](#dealing-with-failed-jobs) en el tiempo de espera, puedes usar el atributo `FailOnTimeout` en la clase de trabajo:

```php
<?php

namespace App\Jobs;

use Illuminate\Queue\Attributes\FailOnTimeout;

#[FailOnTimeout]
class ProcessPodcast implements ShouldQueue
{
    // ...
}
```

> **Nota:**
> De forma predeterminada, cuando se agota el tiempo de espera de un trabajo, consume un intento y se devuelve a la cola (si se permiten reintentos). Sin embargo, si configuras el trabajo para que falle en el tiempo de espera, no se volverá a intentar, independientemente del valor establecido para los intentos.

<a id="sqs-fifo-and-fair-queues"></a>
### SQS FIFO y colas justas

Laravel admite las colas [Amazon SQS FIFO (primero en entrar, primero en salir)](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-fifo-queues.html) y [justas](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-fair-queues.html). Las colas FIFO te permiten procesar trabajos en el orden exacto en que se enviaron y, al mismo tiempo, garantizan un procesamiento exactamente una vez mediante la deduplicación de mensajes.

Las colas FIFO requieren un ID de grupo de mensajes para determinar qué trabajos se pueden procesar en paralelo. Los trabajos con el mismo ID de grupo se procesan secuencialmente, mientras que los mensajes con diferentes ID de grupo se pueden procesar simultáneamente.

Laravel proporciona un método `onGroup` fluido para especificar el ID del grupo de mensajes al despachar trabajos:

```php
ProcessOrder::dispatch($order)
    ->onGroup("customer-{$order->customer_id}");
```

Si despachas un trabajo a una cola SQS FIFO sin especificar un grupo de mensajes, Laravel usará el nombre de la cola como ID del grupo de mensajes.

Las colas SQS FIFO admiten la deduplicación de mensajes para garantizar un procesamiento exactamente una vez. Implemente un método `deduplicationId` en tu clase de trabajo para proporcionar un ID de deduplicación personalizado:

```php
<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ProcessSubscriptionRenewal implements ShouldQueue
{
    use Queueable;

    // ...

    /**
     * Get the job's deduplication ID.
     */
    public function deduplicationId(): string
    {
        return "renewal-{$this->subscription->id}";
    }
}
```

<a id="fair-queues"></a>
#### Colas justas

Si estás utilizando una cola estándar SQS, configurar un grupo de mensajes permite una cola justa. En otras palabras, una vez que asignes grupos, SQS los utilizará para mantener una entrega justa entre inquilinos/cargas de trabajo. No se requiere ninguna configuración adicional de Laravel.

En lugar de llamar a `onGroup` en el momento del despacho, también puedes definir un método `messageGroup` directamente en el trabajo:

```php
<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ProcessOrder implements ShouldQueue
{
    use Queueable;

    // ...

    /**
     * Get the job's message group.
     */
    public function messageGroup(): string
    {
        return "customer-{$this->order->customer_id}";
    }
}
```

<a id="fifo-listeners-mail-and-notifications"></a>
#### Listeners, correo y notificaciones FIFO

Al utilizar colas FIFO, también deberás definir grupos de mensajes en listeners, correo y notificaciones. Como alternativa, puedes enviar instancias en cola de estos objetos a una cola que no sea FIFO.

Para definir el grupo de mensajes para un [listener de eventos en cola](../events/#queued-event-listeners), define un método `messageGroup` en el listener. Opcionalmente, también puedes definir un método `deduplicator`, que recibe el evento y debe devolver una función anónima que genere el ID de deduplicación:

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use Closure;

class SendShipmentNotification
{
    // ...

    /**
     * Get the job's message group.
     */
    public function messageGroup(): string
    {
        return 'shipments';
    }

    /**
     * Get the job's deduplicator.
     */
    public function deduplicator(OrderShipped $event): Closure
    {
        return fn () => "shipment-notification-{$event->order->id}";
    }
}
```

Al enviar un [mensaje de correo](../mail/) que se pondrá en cola en una cola FIFO, debes invocar el método `onGroup` y opcionalmente el método `withDeduplicator` al enviar la notificación:

```php
use App\Mail\InvoicePaid;
use Illuminate\Support\Facades\Mail;

$invoicePaid = (new InvoicePaid($invoice))
    ->onGroup('invoices')
    ->withDeduplicator(fn () => 'invoices-'.$invoice->id);

Mail::to($request->user())->send($invoicePaid);
```

Al enviar una [notificación](../notifications/) que se pondrá en cola en una cola FIFO, debes invocar el método `onGroup` y, opcionalmente, el método `withDeduplicator` al enviar la notificación:

```php
use App\Notifications\InvoicePaid;

$invoicePaid = (new InvoicePaid($invoice))
    ->onGroup('invoices')
    ->withDeduplicator(fn () => 'invoices-'.$invoice->id);

$user->notify($invoicePaid);
```

<a id="queue-failover"></a>
### Conmutación por error de cola

El controlador de cola `failover` proporciona una funcionalidad de conmutación por error automática al despachar trabajos a la cola. Si la conexión de la cola principal de la configuración `failover` falla por algún motivo, Laravel intentará automáticamente despachar el trabajo a la siguiente conexión configurada en la lista. Esto es particularmente útil para garantizar una alta disponibilidad en entornos de producción donde la confiabilidad de la cola es crítica.

Para configurar una conexión de cola de conmutación por error, especifica el controlador `failover` y proporciona una serie de nombres de conexión para intentar en orden. De forma predeterminada, Laravel incluye un ejemplo de configuración de conmutación por error en el archivo de configuración `config/queue.php` de tu aplicación:

```php
'failover' => [
    'driver' => 'failover',
    'connections' => [
        'redis',
        'database',
        'sync',
    ],
],
```

Una vez que hayas configurado una conexión que utiliza el controlador `failover`, deberás configurar la conexión de conmutación por error como tu conexión de cola predeterminada en el archivo `.env` de tu aplicación para utilizar la funcionalidad de conmutación por error:

```ini
QUEUE_CONNECTION=failover
```

A continuación, inicia al menos un trabajador para cada conexión en tu lista de conexiones de conmutación por error:

```shell
php artisan queue:work redis
php artisan queue:work database
```

> **Nota:**
> No es necesario ejecutar un trabajador para las conexiones que utilizan los controladores de cola `sync`, `background` o `deferred`, ya que esos controladores procesan trabajos dentro del proceso PHP actual.

Cuando falla una operación de conexión de cola y se activa la conmutación por error, Laravel enviará el evento `Illuminate\Queue\Events\QueueFailedOver`, lo que te permitirá informar o registrar que una conexión de cola ha fallado.

> **Nota:**
> Si usas Laravel Horizon, recuerda que Horizon solo administra colas de Redis. Si tu lista de conmutación por error incluye `database`, debes ejecutar un proceso `php artisan queue:work database` normal junto con Horizon.

<a id="error-handling"></a>
### Manejo de errores

Si se produce una excepción mientras se procesa el trabajo, el trabajo se devolverá automáticamente a la cola para que se pueda intentar nuevamente. El trabajo se seguirá devolviendo a la cola hasta que se haya intentado el número máximo de veces permitido por tu aplicación. El número máximo de intentos está definido por el interruptor `--tries` utilizado en el comando `queue:work` Artisan. Alternativamente, el número máximo de intentos se puede definir en la propia clase de trabajo. Más información sobre cómo ejecutar el trabajador de cola [se puede encontrar a continuación](#running-the-queue-worker).

<a id="manually-releasing-a-job"></a>
#### Liberación manual de un trabajo

A veces es posible que desees volver a liberar manualmente un trabajo en la cola para poder intentarlo nuevamente más adelante. Puedes lograr esto llamando al método `release`:

```php
/**
 * Execute the job.
 */
public function handle(): void
{
    // ...

    $this->release();
}
```

De forma predeterminada, el método `release` devolverá el trabajo a la cola para su procesamiento inmediato. Sin embargo, puedes indicarle a la cola que no haga que el trabajo esté disponible para su procesamiento hasta que haya transcurrido una cantidad determinada de segundos pasando un número entero o una instancia de fecha al método `release`:

```php
$this->release(10);

$this->release(now()->plus(seconds: 10));
```

<a id="manually-failing-a-job"></a>
#### Fallar manualmente un trabajo

En ocasiones, es posible que necesites marcar manualmente un trabajo como "fallido". Para hacerlo, puedes llamar al método `fail`:

```php
/**
 * Execute the job.
 */
public function handle(): void
{
    // ...

    $this->fail();
}
```

Si deseas marcar tu trabajo como fallido debido a una excepción que hayas capturado, puedes pasar la excepción al método `fail`. O, para mayor comodidad, puedes pasar un mensaje de error de cadena que se convertirá en una excepción para ti:

```php
$this->fail($exception);

$this->fail('Something went wrong.');
```

> **Nota:**
> Para obtener más información sobre trabajos fallidos, consulta la [documentación sobre cómo solucionar errores de trabajo](#dealing-with-failed-jobs).

<a id="fail-jobs-on-exceptions"></a>
#### Marcar trabajos como fallidos ante excepciones específicas

El middleware de trabajo [middleware de trabajos](#job-middleware) `FailOnException` te permite cortocircuitar los reintentos cuando se lanzan excepciones específicas. Esto permite volver a intentarlo en excepciones transitorias, como errores de API externos, pero fallar permanentemente en el trabajo en excepciones persistentes, como la revocación de permisos de un usuario:

```php
<?php

namespace App\Jobs;

use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\Attributes\Tries;
use Illuminate\Queue\Middleware\FailOnException;
use Illuminate\Support\Facades\Http;

#[Tries(3)]
class SyncChatHistory implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public User $user,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $this->user->authorize('sync-chat-history');

        $response = Http::throw()->get(
            "https://chat.laravel.test/?user={$this->user->uuid}"
        );

        // ...
    }

    /**
     * Get the middleware the job should pass through.
     */
    public function middleware(): array
    {
        return [
            new FailOnException([AuthorizationException::class])
        ];
    }
}
```

<a id="job-batching"></a>
## Procesamiento de trabajos por lotes

La función de procesamiento por lotes de trabajos de Laravel te permite ejecutar fácilmente un grupo de trabajos en paralelo y luego realizar alguna acción cuando el lote de trabajos haya completado su ejecución.

Antes de comenzar, debes crear una migración de base de datos para crear una tabla que contendrá metainformación sobre tus lotes de trabajos, como su porcentaje de finalización. Esta migración se puede generar usando el comando `make:queue-batches-table` Artisan:

```shell
php artisan make:queue-batches-table

php artisan migrate
```

<a id="defining-batchable-jobs"></a>
### Definición de trabajos por lotes

Para definir un trabajo por lotes, debes [crear un trabajo en cola](#creating-jobs) como de costumbre; sin embargo, debes agregar el trait `Illuminate\Bus\Batchable` a la clase de trabajo. Este trait proporciona acceso a un método `batch` que se puede utilizar para recuperar el lote actual en el que se está ejecutando el trabajo:

```php
<?php

namespace App\Jobs;

use Illuminate\Bus\Batchable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ImportCsv implements ShouldQueue
{
    use Batchable, Queueable;

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        if ($this->batch()->cancelled()) {
            // Determine if the batch has been cancelled...

            return;
        }

        // Import a portion of the CSV file...
    }
}
```

<a id="dispatching-batches"></a>
### Despacho de lotes

Para enviar un lote de trabajos, se debe utilizar el método `batch` de la fachada `Bus`. Por supuesto, el procesamiento por lotes es principalmente útil cuando se combina con callbacks de finalización. Por lo tanto, puedes utilizar los métodos `then`, `catch` y `finally` para definir callbacks de finalización para el lote. Cada uno de estos callbacks recibirá una instancia de `Illuminate\Bus\Batch` cuando se invoquen.

Cuando se ejecutan varios trabajadores en cola, los trabajos del lote se procesarán en paralelo. Por lo tanto, el orden en que se completan los trabajos puede no ser el mismo que el orden en que se agregaron al lote. Consulta nuestra documentación sobre [cadenas de trabajos y lotes](#chains-and-batches) para obtener información sobre cómo ejecutar una serie de trabajos en secuencia.

En este ejemplo, imaginaremos que estamos poniendo en cola un lote de trabajos y cada uno de ellos procesa un número determinado de filas de un archivo CSV:

```php
use App\Jobs\ImportCsv;
use Illuminate\Bus\Batch;
use Illuminate\Support\Facades\Bus;
use Throwable;

$batch = Bus::batch([
    new ImportCsv(1, 100),
    new ImportCsv(101, 200),
    new ImportCsv(201, 300),
    new ImportCsv(301, 400),
    new ImportCsv(401, 500),
])->before(function (Batch $batch) {
    // The batch has been created but no jobs have been added...
})->progress(function (Batch $batch) {
    // A single job has completed successfully...
})->then(function (Batch $batch) {
    // All jobs completed successfully...
})->catch(function (Batch $batch, Throwable $e) {
    // Batch job failure detected...
})->finally(function (Batch $batch) {
    // The batch has finished executing...
})->dispatch();

return $batch->id;
```

El ID del lote, al que se puede acceder a través de la propiedad `$batch->id`, se puede utilizar para [consultar el bus de comandos](#inspecting-batches) de Laravel para obtener información sobre el lote después de haber sido enviado.

> **Advertencia:**
> Dado que los callbacks por lotes se serializan y ejecutan más adelante mediante la cola de Laravel, no debes utilizar la variable `$this` dentro de los callbacks. Además, dado que los trabajos por lotes están incluidos en transacciones de la base de datos, las declaraciones de la base de datos que desencadenan confirmaciones implícitas no deben ejecutarse dentro de los trabajos.

<a id="naming-batches"></a>
#### Nombrar lotes

Algunas herramientas como [Laravel Horizon](../horizon/) y [Laravel Telescope](../telescope/) pueden proporcionar información de depuración más fácil de usar para lotes si se nombran los lotes. Para asignar un nombre arbitrario a un lote, puedes llamar al método `name` mientras define el lote:

```php
$batch = Bus::batch([
    // ...
])->then(function (Batch $batch) {
    // All jobs completed successfully...
})->name('Import CSV')->dispatch();
```

<a id="batch-connection-queue"></a>
#### Conexión y cola del lote

Si deseas especificar la conexión y la cola que se deben usar para los trabajos por lotes, puedes usar los métodos `onConnection` y `onQueue`. Todos los trabajos por lotes deben ejecutarse dentro de la misma conexión y cola:

```php
$batch = Bus::batch([
    // ...
])->then(function (Batch $batch) {
    // All jobs completed successfully...
})->onConnection('redis')->onQueue('imports')->dispatch();
```

<a id="chains-and-batches"></a>
### Cadenas y lotes

Puedes definir un conjunto de [trabajos encadenados](#job-chaining) dentro de un lote colocando los trabajos encadenados dentro de un array. Por ejemplo, podemos ejecutar dos cadenas de trabajos en paralelo y ejecutar un callback cuando ambas cadenas de trabajos hayan terminado de procesarse:

```php
use App\Jobs\ReleasePodcast;
use App\Jobs\SendPodcastReleaseNotification;
use Illuminate\Bus\Batch;
use Illuminate\Support\Facades\Bus;

Bus::batch([
    [
        new ReleasePodcast(1),
        new SendPodcastReleaseNotification(1),
    ],
    [
        new ReleasePodcast(2),
        new SendPodcastReleaseNotification(2),
    ],
])->then(function (Batch $batch) {
    // All jobs completed successfully...
})->dispatch();
```

Por el contrario, puedes ejecutar lotes de trabajos dentro de una [cadena](#job-chaining) definiendo lotes dentro de la cadena. Por ejemplo, primero podría ejecutar un lote de trabajos para publicar varios podcasts y luego un lote de trabajos para enviar las notificaciones de lanzamiento:

```php
use App\Jobs\FlushPodcastCache;
use App\Jobs\ReleasePodcast;
use App\Jobs\SendPodcastReleaseNotification;
use Illuminate\Support\Facades\Bus;

Bus::chain([
    new FlushPodcastCache,
    Bus::batch([
        new ReleasePodcast(1),
        new ReleasePodcast(2),
    ]),
    Bus::batch([
        new SendPodcastReleaseNotification(1),
        new SendPodcastReleaseNotification(2),
    ]),
])->dispatch();
```

<a id="adding-jobs-to-batches"></a>
### Agregar trabajos a lotes

A veces puede resultar útil agregar trabajos adicionales a un lote desde dentro de un trabajo por lotes. Este patrón puede resultar útil cuando necesitas agrupar miles de trabajos que pueden tardar demasiado en enviarse durante una solicitud web. Por lo tanto, es posible que desees enviar un lote inicial de trabajos de "cargador" que hidraten el lote con aún más trabajos:

```php
$batch = Bus::batch([
    new LoadImportBatch,
    new LoadImportBatch,
    new LoadImportBatch,
])->then(function (Batch $batch) {
    // All jobs completed successfully...
})->name('Import Contacts')->dispatch();
```

En este ejemplo, usaremos el trabajo `LoadImportBatch` para hidratar el lote con trabajos adicionales. Para lograr esto, podemos usar el método `add` en la instancia por lotes a la que se puede acceder a través del método `batch` del trabajo:

```php
use App\Jobs\ImportContacts;
use Illuminate\Support\Collection;

/**
 * Execute the job.
 */
public function handle(): void
{
    if ($this->batch()->cancelled()) {
        return;
    }

    $this->batch()->add(Collection::times(1000, function () {
        return new ImportContacts;
    }));
}
```

> **Advertencia:**
> Sólo puedes agregar trabajos a un lote desde un trabajo que pertenezca al mismo lote.

<a id="inspecting-batches"></a>
### Inspección de lotes

La instancia `Illuminate\Bus\Batch` que se proporciona para los callbacks de finalización por lotes tiene una variedad de propiedades y métodos para ayudarte a interactuar e inspeccionar un lote determinado de trabajos:

```php
// The UUID of the batch...
$batch->id;

// The name of the batch (if applicable)...
$batch->name;

// The number of jobs assigned to the batch...
$batch->totalJobs;

// The number of jobs that have not been processed by the queue...
$batch->pendingJobs;

// The number of jobs that have failed...
$batch->failedJobs;

// The number of jobs that have been processed thus far...
$batch->processedJobs();

// The completion percentage of the batch (0-100)...
$batch->progress();

// Indicates if the batch has finished executing...
$batch->finished();

// Cancel the execution of the batch...
$batch->cancel();

// Indicates if the batch has been cancelled...
$batch->cancelled();
```

<a id="returning-batches-from-routes"></a>
#### Devolver lotes desde rutas

Todas las instancias de `Illuminate\Bus\Batch` son serializables en JSON, lo que significa que puedes devolverlas directamente desde una de las rutas de tu aplicación para recuperar una carga útil JSON que contiene información sobre el lote, incluido su progreso de finalización. Esto hace que sea conveniente mostrar información sobre el progreso de finalización del lote en la interfaz de usuario de tu aplicación.

Para recuperar un lote por su ID, puedes utilizar el método `findBatch` de la fachada `Bus`:

```php
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Route;

Route::get('/batch/{batchId}', function (string $batchId) {
    return Bus::findBatch($batchId);
});
```

<a id="cancelling-batches"></a>
### Cancelación de lotes

A veces es posible que necesites cancelar la ejecución de un lote determinado. Esto se puede lograr llamando al método `cancel` en la instancia `Illuminate\Bus\Batch`:

```php
/**
 * Execute the job.
 */
public function handle(): void
{
    if ($this->user->exceedsImportLimit()) {
        $this->batch()->cancel();

        return;
    }

    if ($this->batch()->cancelled()) {
        return;
    }
}
```

Como habrás notado en los ejemplos anteriores, los trabajos por lotes normalmente deben determinar si su lote correspondiente se canceló antes de continuar con la ejecución. Sin embargo, para mayor comodidad, puedes asignar el `SkipIfBatchCancelled` [middleware](#job-middleware) al trabajo. Como su nombre indica, este middleware le indicará a Laravel que no procese el trabajo si su lote correspondiente ha sido cancelado:

```php
use Illuminate\Queue\Middleware\SkipIfBatchCancelled;

/**
 * Get the middleware the job should pass through.
 */
public function middleware(): array
{
    return [new SkipIfBatchCancelled];
}
```

<a id="batch-failures"></a>
### Fallos de lotes

Cuando falla un trabajo por lotes, se invocará el callback `catch` (si está asignado). Este callback solo se invoca para el primer trabajo que falla dentro del lote.

<a id="allowing-failures"></a>
#### Permitir fallas

Cuando falla un trabajo dentro de un lote, Laravel marcará automáticamente el lote como "cancelado". Si lo deseas, puedes desactivar este comportamiento para que un error en el trabajo no marque automáticamente el lote como cancelado. Esto se puede lograr llamando al método `allowFailures` mientras se envía el lote:

```php
$batch = Bus::batch([
    // ...
])->then(function (Batch $batch) {
    // All jobs completed successfully...
})->allowFailures()->dispatch();
```

Opcionalmente, puedes proporcionar una función anónima al método `allowFailures`, que se ejecutará en cada falla del trabajo:

```php
$batch = Bus::batch([
    // ...
])->allowFailures(function (Batch $batch, $exception) {
    // Handle individual job failures...
})->dispatch();
```

<a id="retrying-failed-batch-jobs"></a>
#### Reintentar trabajos por lotes fallidos

Para mayor comodidad, Laravel proporciona un comando `queue:retry-batch` Artisan que te permite reintentar fácilmente todos los trabajos fallidos para un lote determinado. Este comando acepta el UUID del lote cuyos trabajos fallidos se deben reintentar:

```shell
php artisan queue:retry-batch 32dbc76c-4f82-4749-b610-a639fe0099b5
```

<a id="pruning-batches"></a>
### Depuración de lotes

Sin depuración, la tabla `job_batches` puede acumular registros muy rápidamente. Para mitigar esto, debes [programar](../scheduling/) el comando `queue:prune-batches` Artisan para que se ejecute diariamente:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('queue:prune-batches')->daily();
```

De forma predeterminada, se eliminarán todos los lotes terminados que tengan más de 24 horas. Puedes utilizar la opción `hours` al llamar al comando para determinar durante cuánto tiempo se conservarán los datos del lote. Por ejemplo, el siguiente comando eliminará todos los lotes que finalizaron hace más de 48 horas:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('queue:prune-batches --hours=48')->daily();
```

A veces, tu tabla `job_batches` puede acumular registros de lotes para lotes que nunca se completaron exitosamente, como lotes en los que un trabajo falló y ese trabajo nunca se volvió a intentar exitosamente. Puedes indicarle al comando `queue:prune-batches` que elimine estos registros de lotes sin terminar usando la opción `unfinished`:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('queue:prune-batches --hours=48 --unfinished=72')->daily();
```

Asimismo, tu tabla `job_batches` también puede acumular registros de lotes para lotes cancelados. Puedes indicarle al comando `queue:prune-batches` que elimine estos registros de lote cancelados usando la opción `cancelled`:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('queue:prune-batches --hours=48 --cancelled=72')->daily();
```

<a id="storing-batches-in-dynamodb"></a>
### Almacenamiento de lotes en DynamoDB

Laravel también brinda soporte para almacenar metainformación por lotes en [DynamoDB](https://aws.amazon.com/dynamodb) en lugar de una base de datos relacional. Sin embargo, deberás crear manualmente una tabla de DynamoDB para almacenar todos los registros del lote.

Normalmente, esta tabla debe denominarse `job_batches`, pero debes nombrar la tabla según el valor de configuración `queue.batching.table` dentro del archivo de configuración `queue` de tu aplicación.

<a id="dynamodb-batch-table-configuration"></a>
#### Configuración de la tabla por lotes de DynamoDB

La tabla `job_batches` debe tener una clave de partición primaria de cadena denominada `application` y una clave de clasificación primaria de cadena denominada `id`. La parte `application` de la clave contendrá el nombre de tu aplicación según lo definido por el valor de configuración `name` dentro del archivo de configuración `app` de tu aplicación. Dado que el nombre de la aplicación es parte de la clave de la tabla de DynamoDB, puedes usar la misma tabla para almacenar lotes de trabajos para múltiples aplicaciones de Laravel.

Además, puedes definir el atributo `ttl` para tu tabla si deseas aprovechar la [depuración automática de lotes](#pruning-batches-in-dynamodb).

<a id="dynamodb-configuration"></a>
#### Configuración de DynamoDB

A continuación, instala el SDK de AWS para que tu aplicación Laravel pueda comunicarse con Amazon DynamoDB:

```shell
composer require aws/aws-sdk-php
```

Luego, establece el valor de la opción de configuración `queue.batching.driver` en `dynamodb`. Además, debes definir las opciones de configuración `key`, `secret` y `region` dentro del array de configuración `batching`. Estas opciones se utilizarán para autenticarte con AWS. Cuando se utiliza el controlador `dynamodb`, la opción de configuración `queue.batching.database` no es necesaria:

```php
'batching' => [
    'driver' => env('QUEUE_BATCHING_DRIVER', 'dynamodb'),
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    'table' => 'job_batches',
],
```

<a id="pruning-batches-in-dynamodb"></a>
#### Depuración de lotes en DynamoDB

Cuando se utiliza [DynamoDB](https://aws.amazon.com/dynamodb) para almacenar información de lotes de trabajos, los comandos de depuración típicos utilizados para depurar lotes almacenados en una base de datos relacional no funcionarán. En su lugar, puedes utilizar [la funcionalidad TTL nativa de DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html) para eliminar automáticamente registros de lotes antiguos.

Si definiste tu tabla de DynamoDB con un atributo `ttl`, puedes definir parámetros de configuración para indicarle a Laravel cómo depurar registros por lotes. El valor de configuración `queue.batching.ttl_attribute` define el nombre del atributo que contiene el TTL, mientras que el valor de configuración `queue.batching.ttl` define la cantidad de segundos después de los cuales se puede eliminar un registro por lotes de la tabla de DynamoDB, en relación con la última vez que se actualizó el registro:

```php
'batching' => [
    'driver' => env('QUEUE_BATCHING_DRIVER', 'dynamodb'),
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    'table' => 'job_batches',
    'ttl_attribute' => 'ttl',
    'ttl' => 60 * 60 * 24 * 7, // 7 days...
],
```

<a id="queueing-closures"></a>
## Puesta en cola de funciones anónimas

En lugar de enviar una clase de trabajo a la cola, también puedes enviar una función anónima. Esto es excelente para tareas rápidas y simples que deben ejecutarse fuera del ciclo de solicitud actual. Al enviar funciones anónimas a la cola, el contenido del código de la función anónima está firmado criptográficamente para que no se pueda modificar en tránsito:

```php
use App\Models\Podcast;

$podcast = Podcast::find(1);

dispatch(function () use ($podcast) {
    $podcast->publish();
});
```

Para asignar un nombre a la función anónima de la cola que pueda ser utilizado por los paneles de informes de la cola, además de ser mostrado por el comando `queue:work`, puedes usar el método `name`:

```php
dispatch(function () {
    // ...
})->name('Publish Podcast');
```

Usando el método `catch`, puedes proporcionar una función anónima que debe ejecutarse si la función anónima de la cola no se completa exitosamente después de agotar todos los [intentos de reintento configurados](#max-job-attempts-and-timeout) de tu cola:

```php
use Throwable;

dispatch(function () use ($podcast) {
    $podcast->publish();
})->catch(function (Throwable $e) {
    // This job has failed...
});
```

> **Advertencia:**
> Dado que los callbacks `catch` son serializados y ejecutados posteriormente por la cola de Laravel, no debes usar la variable `$this` dentro de los callbacks `catch`.

<a id="running-the-queue-worker"></a>
## Ejecución del trabajador de cola

<a id="the-queue-work-command"></a>
### El comando `queue:work`

Laravel incluye un comando Artisan que iniciará un trabajador en cola y procesará nuevos trabajos a medida que se inserten en la cola. Puedes ejecutar el trabajador usando el comando `queue:work` Artisan. Ten en cuenta que una vez que se haya iniciado el comando `queue:work`, continuará ejecutándose hasta que se detenga manualmente o cierres tu terminal:

```shell
php artisan queue:work
```

> **Nota:**
> Para mantener el proceso `queue:work` ejecutándose permanentemente en segundo plano, debes utilizar un monitor de proceso como [Supervisor](#supervisor-configuration) para garantizar que el trabajador de la cola no deje de ejecutarse.

Puedes incluir el indicador `-v` al invocar el comando `queue:work` si deseas que los ID de trabajo procesados, los nombres de conexión y los nombres de cola se incluyan en la salida del comando:

```shell
php artisan queue:work -v
```

Recuerda, los trabajadores de la cola son procesos de larga duración y almacenan el estado de la aplicación iniciada en la memoria. Como resultado, no notarán cambios en tu código base una vez iniciados. Por lo tanto, durante el proceso de despliegue, asegúrate de [reiniciar los trabajadores de la cola](#queue-workers-and-deployment). Además, recuerda que cualquier estado estático creado o modificado por tu aplicación no se restablecerá automáticamente entre trabajos.

Alternativamente, puedes ejecutar el comando `queue:listen`. Al utilizar el comando `queue:listen`, no es necesario reiniciar manualmente el trabajador cuando desees recargar el código actualizado o restablecer el estado de la aplicación; sin embargo, este comando es significativamente menos eficiente que el comando `queue:work`:

```shell
php artisan queue:listen
```

<a id="running-multiple-queue-workers"></a>
#### Ejecución de varios trabajadores de cola

Para asignar varios trabajadores a una cola y procesar trabajos simultáneamente, simplemente debes iniciar varios procesos `queue:work`. Esto se puede hacer localmente a través de varias pestañas en tu terminal o en producción utilizando los ajustes de configuración de tu administrador de procesos. [Cuando utilizas Supervisor](#supervisor-configuration), puedes utilizar el valor de configuración `numprocs`.

<a id="specifying-the-connection-queue"></a>
#### Especificación de la conexión y la cola

También puedes especificar qué conexión de cola debe utilizar el trabajador. El nombre de la conexión pasado al comando `work` debe corresponder a una de las conexiones definidas en tu archivo de configuración `config/queue.php`:

```shell
php artisan queue:work redis
```

De forma predeterminada, el comando `queue:work` solo procesa trabajos para la cola predeterminada en una conexión determinada. Sin embargo, puedes personalizar aún más tu trabajador de cola procesando solo colas particulares para una conexión determinada. Por ejemplo, si todos tus correos electrónicos se procesan en una cola `emails` en tu conexión de cola `redis`, puedes ejecutar el siguiente comando para iniciar un trabajador que solo procese esa cola:

```shell
php artisan queue:work redis --queue=emails
```

<a id="processing-a-specified-number-of-jobs"></a>
#### Procesamiento de un número específico de trabajos

La opción `--once` se puede utilizar para indicarle al trabajador que procese solo un trabajo de la cola:

```shell
php artisan queue:work --once
```

La opción `--max-jobs` se puede utilizar para indicarle al trabajador que procese la cantidad dada de trabajos y luego salga. Esta opción puede ser útil cuando se combina con [Supervisor](#supervisor-configuration) para que tus trabajadores se reinicien automáticamente después de procesar una cantidad determinada de trabajos, liberando cualquier memoria que puedan haber acumulado:

```shell
php artisan queue:work --max-jobs=1000
```

<a id="processing-all-queued-jobs-then-exiting"></a>
#### Procesar todos los trabajos en cola y luego salir

La opción `--stop-when-empty` se puede utilizar para indicarle al trabajador que procese todos los trabajos y luego salga correctamente. Esta opción puede resultar útil al procesar colas de Laravel dentro de un contenedor Docker si deseas cerrar el contenedor después de que la cola esté vacía:

```shell
php artisan queue:work --stop-when-empty
```

<a id="processing-jobs-for-a-given-number-of-seconds"></a>
#### Procesamiento de trabajos durante un número determinado de segundos

La opción `--max-time` se puede utilizar para indicarle al trabajador que procese trabajos durante la cantidad de segundos especificada y luego salga. Esta opción puede ser útil cuando se combina con [Supervisor](#supervisor-configuration) para que tus trabajadores se reinicien automáticamente después de procesar trabajos durante un período de tiempo determinado, liberando cualquier memoria que puedan haber acumulado:

```shell
# Process jobs for one hour and then exit...
php artisan queue:work --max-time=3600
```

<a id="worker-sleep-duration"></a>
#### Duración de la espera del trabajador

Cuando haya trabajos disponibles en la cola, el trabajador seguirá procesando los trabajos sin demora entre trabajos. Sin embargo, la opción `sleep` determina cuántos segundos "dormirá" el trabajador si no hay trabajos disponibles. Por supuesto, mientras duerme, el trabajador no procesará ningún trabajo nuevo:

```shell
php artisan queue:work --sleep=3
```

<a id="maintenance-mode-queues"></a>
#### Modo de mantenimiento y colas

Mientras tu aplicación esté en [modo de mantenimiento](../configuration/#maintenance-mode), no se manejarán trabajos en cola. Los trabajos continuarán manejándose normalmente una vez que la aplicación salga del modo de mantenimiento.

Para obligar a los trabajadores de tu cola a procesar trabajos incluso si el modo de mantenimiento está habilitado, puedes usar la opción `--force`:

```shell
php artisan queue:work --force
```

<a id="resource-considerations"></a>
#### Consideraciones de recursos

La opción `--memory` especifica el límite de memoria en megabytes al que debe salir el trabajador. Por defecto, este límite es de 128 megabytes. También puedes especificar un porcentaje del `memory_limit` configurado en PHP:

```shell
php artisan queue:work --memory=60%
```

Los límites basados ​​en porcentajes requieren un PHP `memory_limit` finito. Si el límite de memoria de PHP es ilimitado (`-1`), utiliza un límite en megabytes. Un monitor de proceso como [Supervisor](#supervisor-configuration) puede reiniciar automáticamente al trabajador después de que sale.

Los trabajadores de cola persistentes no "reinician" el framework antes de procesar cada trabajo. Por lo tanto, debes liberar todos los recursos pesados ​​después de que se complete cada trabajo. Por ejemplo, si estás realizando [manipulación de imágenes](../images/) con la [biblioteca GD](https://www.php.net/manual/en/book.image.php), debes liberar la memoria con `imagedestroy` cuando hayas terminado de procesar la imagen.

<a id="queue-priorities"></a>
### Prioridades de cola

A veces es posible que desees priorizar cómo se procesan tus colas. Por ejemplo, en tu archivo de configuración `config/queue.php`, puedes configurar el `queue` predeterminado para tu conexión `redis` a `low`. Sin embargo, en ocasiones es posible que desees despachar un trabajo a una cola de prioridad `high` como esta:

```php
dispatch((new Job)->onQueue('high'));
```

Para iniciar un trabajador que verifique que todos los trabajos de la cola `high` se procesen antes de continuar con cualquier trabajo en la cola `low`, pasa una lista de nombres de cola delimitada por comas al comando `work`:

```shell
php artisan queue:work --queue=high,low
```

<a id="queue-workers-and-deployment"></a>
### Trabajadores de cola y despliegue

Dado que los trabajadores de la cola son procesos de larga duración, no notarán cambios en tu código sin ser reiniciados. Por lo tanto, la forma más sencilla de desplegar una aplicación utilizando trabajadores en cola es reiniciarlos durante el proceso de despliegue. Puedes reiniciar de forma ordenada a todos los trabajadores emitiendo el comando `queue:restart`:

```shell
php artisan queue:restart
```

Este comando indicará a todos los trabajadores de la cola que salgan correctamente después de terminar de procesar su trabajo actual para que no se pierdan trabajos existentes. Dado que los trabajadores de la cola saldrán cuando se ejecute el comando `queue:restart`, debes ejecutar un administrador de procesos como [Supervisor](#supervisor-configuration) para reiniciar automáticamente los trabajadores de la cola.

> **Nota:**
> La cola utiliza [caché](../cache/) para almacenar señales de reinicio, por lo que debes verificar que un controlador de caché esté configurado correctamente para tu aplicación antes de usar esta función.

<a id="reacting-to-worker-signals"></a>
### Reacción a las señales de los trabajadores

Cuando un trabajador de la cola recibe una señal de terminación como `SIGQUIT`, `SIGTERM` o `SIGINT` mientras procesa un trabajo, el trabajador finalizará su trabajo actual antes de salir. Sin embargo, es posible que tu trabajo deba reaccionar a la señal antes de que tu servidor u orquestador de contenedores detenga el proceso. Por ejemplo, es posible que un trabajo de importación de larga duración deba dejar de extraer nuevos registros y guardar su progreso actual.

Para reaccionar a las señales de los trabajadores desde un trabajo, implementa la interfaz `Illuminate\Contracts\Queue\Interruptible` y define un método `interrupted` en tu trabajo. El número de señal recibido por el trabajador se pasará al método `interrupted`:

```php
<?php

namespace App\Jobs;

use App\Models\Import;
use Illuminate\Contracts\Queue\Interruptible;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ImportProducts implements ShouldQueue, Interruptible
{
    use Queueable;

    protected bool $shouldStop = false;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Import $import,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        foreach ($this->import->pendingRows() as $row) {
            if ($this->shouldStop) {
                break;
            }

            // Import the product row...
        }

        $this->import->saveProgress();
    }

    /**
     * Handle a signal received by the queue worker.
     */
    public function interrupted(int $signal): void
    {
        $this->shouldStop = true;
    }
}
```

El método `interrupted` solo se invoca cuando el trabajador recibe una señal de proceso mientras el trabajo se está ejecutando actualmente. No reemplaza los [tiempos de espera](#worker-timeouts) ni el [método `failed`](#cleaning-up-after-failed-jobs) del trabajo.

<a id="job-expirations-and-timeouts"></a>
### Vencimientos y tiempos de espera de trabajos

<a id="job-expiration"></a>
#### Vencimiento del trabajo

En tu archivo de configuración `config/queue.php`, cada conexión de cola define una opción `retry_after`. Esta opción especifica cuántos segundos debe esperar la conexión de la cola antes de volver a intentar un trabajo que se está procesando. Por ejemplo, si el valor de `retry_after` se establece en `90`, el trabajo se devolverá a la cola si se ha estado procesando durante 90 segundos sin liberarse ni eliminarse. Normalmente, debes establecer el valor `retry_after` en la cantidad máxima de segundos que tus trabajos deberían tardar razonablemente en completar el procesamiento.

> **Advertencia:**
> La única conexión de cola que no contiene un valor `retry_after` es Amazon SQS. SQS volverá a intentar el trabajo según el [Tiempo de espera de visibilidad predeterminado](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/AboutVT.html) que se administra dentro de la consola de AWS.

<a id="worker-timeouts"></a>
#### Tiempos de espera de los trabajadores

El comando `queue:work` Artisan expone una opción `--timeout`. De forma predeterminada, el valor `--timeout` es 60 segundos. Si un trabajo se procesa durante más tiempo que el número de segundos especificado por el valor de tiempo de espera, el trabajador que procesa el trabajo saldrá con un error. Normalmente, el trabajador será reiniciado automáticamente por un [administrador de procesos configurado en tu servidor](#supervisor-configuration):

```shell
php artisan queue:work --timeout=60
```

La opción de configuración `retry_after` y la opción CLI `--timeout` son diferentes, pero funcionan juntas para garantizar que los trabajos no se pierdan y que los trabajos solo se procesen correctamente una vez.

> **Advertencia:**
> El valor `--timeout` siempre debe ser al menos varios segundos más corto que su valor de configuración `retry_after`. Esto garantizará que un trabajador que procesa un trabajo congelado siempre finalice antes de volver a intentarlo. Si tu opción `--timeout` es más larga que su valor de configuración `retry_after`, tus trabajos pueden procesarse dos veces.

<a id="pausing-and-resuming-queue-workers"></a>
### Pausar y reanudar trabajadores de cola

En ocasiones, es posible que necesites impedir temporalmente que un trabajador de la cola procese nuevos trabajos sin detenerlo por completo. Por ejemplo, es posible que desees pausar el procesamiento de trabajos durante el mantenimiento del sistema. Laravel proporciona los comandos `queue:pause` y `queue:continue` Artisan para pausar y reanudar los trabajadores de la cola.

Para pausar una cola específica, proporciona el nombre de la conexión de la cola y el nombre de la cola:

```shell
php artisan queue:pause database:default
```

En este ejemplo, `database` es el nombre de la conexión de la cola y `default` es el nombre de la cola. Una vez que se pausa una cola, cualquier trabajador que procese trabajos de esa cola terminará su trabajo actual, pero no retomará ningún trabajo nuevo hasta que se reanude la cola.

Para pausar el procesamiento de trabajos para cada cola en cada conexión, usa la opción `--all`:

```shell
php artisan queue:pause --all
```

Para reanudar el procesamiento de trabajos en una cola en pausa, utiliza el comando `queue:continue`:

```shell
php artisan queue:continue database:default
```

Para reanudar el procesamiento de trabajos para cada cola en cada conexión, usa la opción `--all` con el comando `queue:resume`:

```shell
php artisan queue:resume --all
```

Después de reanudar una cola, los trabajadores comenzarán a procesar nuevos trabajos de esa cola inmediatamente. Reanudar todas las colas no reanuda las colas que se pausaron individualmente. Ten en cuenta que pausar una cola no detiene el proceso del trabajador en sí; solo evita que el trabajador procese nuevos trabajos de la cola especificada.

<a id="worker-restart-and-pause-signals"></a>
#### Señales de reinicio y pausa del trabajador

De forma predeterminada, los trabajadores de la cola sondean el controlador de caché para detectar señales de reinicio y pausa en cada iteración del trabajo. Si bien este sondeo es esencial para responder a los comandos `queue:restart` y `queue:pause`, introduce una pequeña sobrecarga de rendimiento.

Si necesitas optimizar el rendimiento y no necesitas estas funciones de interrupción, puedes desactivar este sondeo globalmente llamando al método `withoutInterruptionPolling` en la fachada `Queue`. Normalmente, esto se debe hacer en el método `boot` de tu `AppServiceProvider`:

```php
use Illuminate\Support\Facades\Queue;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Queue::withoutInterruptionPolling();
}
```

Alternativamente, puedes deshabilitar el sondeo de reinicio o de pausa individualmente configurando las propiedades estáticas `$restartable` o `$pausable` en la clase `Illuminate\Queue\Worker`:

```php
use Illuminate\Queue\Worker;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Worker::$restartable = false;
    Worker::$pausable = false;
}
```

> **Advertencia:**
> Cuando el sondeo de interrupción está deshabilitado, los trabajadores no responderán a los comandos `queue:restart` o `queue:pause` (según las funciones que estén deshabilitadas).

<a id="supervisor-configuration"></a>
## Configuración de Supervisor

En producción, necesitas una forma de mantener en funcionamiento tus procesos `queue:work`. Un proceso `queue:work` puede dejar de ejecutarse por diversos motivos, como un tiempo de espera excedido del trabajador o la ejecución del comando `queue:restart`.

Por este motivo, necesitas configurar un monitor de procesos que pueda detectar cuándo salen tus procesos `queue:work` y reiniciarlos automáticamente. Además, los monitores de procesos pueden permitirte especificar cuántos procesos `queue:work` desea ejecutar simultáneamente. Supervisor es un monitor de procesos comúnmente utilizado en entornos Linux y discutiremos cómo configurarlo en la siguiente documentación.

<a id="installing-supervisor"></a>
#### Instalación de Supervisor

Supervisor es un monitor de procesos para el sistema operativo Linux y reiniciará automáticamente tus procesos `queue:work` si fallan. Para instalar Supervisor en Ubuntu, puedes usar el siguiente comando:

```shell
sudo apt-get install supervisor
```

> **Nota:**
> Si configurar y administrar Supervisor tú mismo te parece abrumador, considera usar [Laravel Cloud](https://cloud.laravel.com), que proporciona una plataforma completamente administrada para ejecutar trabajadores de cola de Laravel.

<a id="configuring-supervisor"></a>
#### Configuración de Supervisor

Los archivos de configuración de Supervisor normalmente se almacenan en el directorio `/etc/supervisor/conf.d`. Dentro de este directorio, puedes crear cualquier número de archivos de configuración que indiquen a Supervisor cómo se deben monitorear tus procesos. Por ejemplo, creemos un archivo `laravel-worker.conf` que inicia y monitoree los procesos `queue:work`:

```ini
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /home/forge/app.com/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=forge
numprocs=8
redirect_stderr=true
stdout_logfile=/home/forge/app.com/worker.log
stopwaitsecs=3600
```

En este ejemplo, la directiva `numprocs` le indicará al Supervisor que ejecuta ocho procesos `queue:work` y los supervise todos, reiniciándolos automáticamente si fallan. Debes cambiar la directiva `command` de la configuración para reflejar la conexión de cola deseada y las opciones de trabajo.

> **Advertencia:**
> Debes asegurarte de que el valor de `stopwaitsecs` sea mayor que la cantidad de segundos consumidos por tu trabajo de ejecución más larga. De lo contrario, Supervisor puede finalizar el trabajo antes de que termine de procesarse.

<a id="starting-supervisor"></a>
#### Inicio de Supervisor

Una vez creado el archivo de configuración, puedes actualizar la configuración del Supervisor e iniciar los procesos usando los siguientes comandos:

```shell
sudo supervisorctl reread

sudo supervisorctl update

sudo supervisorctl start "laravel-worker:*"
```

Para obtener más información sobre Supervisor, consulta la [documentación de Supervisor](http://supervisord.org/index.html).

<a id="dealing-with-failed-jobs"></a>
## Gestión de trabajos fallidos

A veces, los trabajos en cola fallarán. ¡No te preocupes, las cosas no siempre salen según lo planeado! Laravel incluye una forma conveniente de [especificar el número máximo de veces que se debe intentar un trabajo](#max-job-attempts-and-timeout). Después de que un trabajo asincrónico haya superado este número de intentos, se insertará en la tabla de base de datos `failed_jobs`. [Los trabajos](../queues/#synchronous-dispatching) enviados sincrónicamente que fallan no se almacenan en esta tabla y sus excepciones son manejadas inmediatamente por la aplicación.

Por lo general, ya está presente una migración para crear la tabla `failed_jobs` en las nuevas aplicaciones de Laravel. Sin embargo, si tu aplicación no contiene una migración para esta tabla, puedes usar el comando `make:queue-failed-table` para crear la migración:

```shell
php artisan make:queue-failed-table

php artisan migrate
```

Al ejecutar un proceso de [trabajador de cola](#running-the-queue-worker), puedes especificar la cantidad máxima de veces que se debe intentar un trabajo usando el interruptor `--tries` en el comando `queue:work`. Si no especificas un valor para la opción `--tries`, los trabajos solo se intentarán una vez o tantas veces como especifique el atributo `Tries` de la clase de trabajo:

```shell
php artisan queue:work redis --tries=3
```

Usando la opción `--backoff`, puedes especificar cuántos segundos debe esperar Laravel antes de volver a intentar un trabajo que ha encontrado una excepción. De forma predeterminada, un trabajo se devuelve inmediatamente a la cola para que se pueda intentar nuevamente:

```shell
php artisan queue:work redis --tries=3 --backoff=3
```

Si deseas configurar cuántos segundos debe esperar Laravel antes de volver a intentar un trabajo que ha encontrado una excepción por trabajo, puedes usar el atributo `Backoff` en tu clase de trabajo:

```php
<?php

namespace App\Jobs;

use Illuminate\Queue\Attributes\Backoff;

#[Backoff(3)]
class ProcessPodcast implements ShouldQueue
{
    // ...
}
```

Si necesitas una lógica más compleja para determinar el tiempo de espera del trabajo, puedes definir un método `backoff` en tu clase de trabajo:

```php
/**
 * Calculate the number of seconds to wait before retrying the job.
 */
public function backoff(): int
{
    return 3;
}
```

Puedes configurar fácilmente retrasos "exponenciales" definiendo una serie de valores de retraso. En este ejemplo, el retraso del reintento será de 1 segundo para el primer reintento, 5 segundos para el segundo reintento, 10 segundos para el tercer reintento y 10 segundos para cada reintento posterior si quedan más intentos:

```php
<?php

namespace App\Jobs;

use Illuminate\Queue\Attributes\Backoff;

#[Backoff([1, 5, 10])]
class ProcessPodcast implements ShouldQueue
{
    // ...
}
```

<a id="cleaning-up-after-failed-jobs"></a>
### Limpieza después de trabajos fallidos

Cuando falla un trabajo en particular, es posible que desees enviar una alerta a tus usuarios o revertir cualquier acción que el trabajo haya completado parcialmente. Para lograr esto, puedes definir un método `failed` en tu clase de trabajo. La instancia de `Throwable` que provocó que el trabajo fallara se pasará al método `failed`:

```php
<?php

namespace App\Jobs;

use App\Models\Podcast;
use App\Services\AudioProcessor;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Throwable;

class ProcessPodcast implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Podcast $podcast,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(AudioProcessor $processor): void
    {
        // Process uploaded podcast...
    }

    /**
     * Handle a job failure.
     */
    public function failed(?Throwable $exception): void
    {
        // Send user notification of failure, etc...
    }
}
```

> **Advertencia:**
> Se crea una nueva instancia del trabajo antes de invocar el método `failed`; por lo tanto, se perderá cualquier modificación de propiedad de clase que pueda haber ocurrido dentro del método `handle`.

Un trabajo fallido no es necesariamente aquel que encontró una excepción no controlada. También se puede considerar fallido un trabajo cuando ha agotado todos sus intentos permitidos. Estos intentos se pueden consumir de varias maneras:

<div class="content-list" markdown="1">

- El trabajo expiró.
- El trabajo encuentra una excepción no controlada durante la ejecución.
- El trabajo se devuelve a la cola de forma manual o mediante un middleware.

</div>

Si el último intento falla debido a una excepción lanzada durante la ejecución del trabajo, esa excepción se pasará al método `failed` del trabajo. Sin embargo, si el trabajo falla porque ha alcanzado el número máximo de intentos permitidos, `$exception` será una instancia de `Illuminate\Queue\MaxAttemptsExceededException`. De manera similar, si el trabajo falla debido a que se excede el tiempo de espera configurado, `$exception` será una instancia de `Illuminate\Queue\TimeoutExceededException`.

<a id="retrying-failed-jobs"></a>
### Reintentar trabajos fallidos

Para ver todos los trabajos fallidos que se han insertado en tu tabla de base de datos `failed_jobs`, puedes usar el comando `queue:failed` Artisan:

```shell
php artisan queue:failed
```

El comando `queue:failed` enumerará el ID del trabajo, la conexión, la cola, el momento del fallo y otra información sobre el trabajo. El ID del trabajo se puede utilizar para volver a intentar el trabajo fallido. Por ejemplo, para volver a intentar un trabajo fallido que tiene un ID de `ce7bb17c-cdd8-41f0-a8ec-7b4fef4e5ece`, ejecuta el siguiente comando:

```shell
php artisan queue:retry ce7bb17c-cdd8-41f0-a8ec-7b4fef4e5ece
```

Si es necesario, puedes pasar múltiples ID al comando:

```shell
php artisan queue:retry ce7bb17c-cdd8-41f0-a8ec-7b4fef4e5ece 91401d2c-0784-4f43-824c-34f94a33c24d
```

También puedes volver a intentar todos los trabajos fallidos para una cola en particular:

```shell
php artisan queue:retry --queue=name
```

Para volver a intentar todos los trabajos fallidos, ejecuta el comando `queue:retry` y pasa `all` como ID:

```shell
php artisan queue:retry all
```

Si deseas eliminar un trabajo fallido, puedes utilizar el comando `queue:forget`:

```shell
php artisan queue:forget 91401d2c-0784-4f43-824c-34f94a33c24d
```

> **Nota:**
> Cuando utilizas [Horizon](../horizon/), debes utilizar el comando `horizon:forget` para eliminar un trabajo fallido en lugar del comando `queue:forget`.

Para eliminar todos tus trabajos fallidos de la tabla `failed_jobs`, puedes usar el comando `queue:flush`:

```shell
php artisan queue:flush
```

El comando `queue:flush` elimina todos los registros de trabajos fallidos de tu cola, sin importar la antigüedad del trabajo fallido. Puedes usar la opción `--hours` para eliminar solo trabajos que fallaron hace una cierta cantidad de horas o antes:

```shell
php artisan queue:flush --hours=48
```

<a id="ignoring-missing-models"></a>
### Ignorar los modelos faltantes

Al inyectar un modelo de Eloquent en un trabajo, el modelo se serializa automáticamente antes de colocarse en la cola y volver a recuperarse de la base de datos cuando se procesa el trabajo. Sin embargo, si el modelo se eliminó mientras el trabajo esperaba ser procesado por un trabajador, tu trabajo puede fallar con un `ModelNotFoundException`.

Para mayor comodidad, puedes optar por eliminar automáticamente los trabajos a los que les faltan modelos utilizando el atributo `DeleteWhenMissingModels` en tu clase de trabajo. Cuando este atributo está presente, Laravel descartará silenciosamente el trabajo sin generar una excepción:

```php
<?php

namespace App\Jobs;

use Illuminate\Queue\Attributes\DeleteWhenMissingModels;

#[DeleteWhenMissingModels]
class ProcessPodcast implements ShouldQueue
{
    // ...
}
```

<a id="pruning-failed-jobs"></a>
### Depuración de trabajos fallidos

Puedes podar los registros en la tabla `failed_jobs` de tu aplicación invocando el comando `queue:prune-failed` Artisan:

```shell
php artisan queue:prune-failed
```

De forma predeterminada, se eliminarán todos los registros de trabajos fallidos que tengan más de 24 horas. Si proporcionas la opción `--hours` al comando, solo se conservarán los registros de trabajo fallidos que se insertaron dentro de las últimas N horas. Por ejemplo, el siguiente comando eliminará todos los registros de trabajos fallidos que se insertaron hace más de 48 horas:

```shell
php artisan queue:prune-failed --hours=48
```

<a id="storing-failed-jobs-in-dynamodb"></a>
### Almacenamiento de trabajos fallidos en DynamoDB

Laravel también brinda soporte para almacenar los registros de trabajos fallidos en [DynamoDB](https://aws.amazon.com/dynamodb) en lugar de una tabla de base de datos relacional. Sin embargo, debes crear manualmente una tabla de DynamoDB para almacenar todos los registros de trabajos fallidos. Normalmente, esta tabla debe llamarse `failed_jobs`, pero debes nombrar la tabla según el valor de configuración `queue.failed.table` dentro del archivo de configuración `queue` de tu aplicación.

La tabla `failed_jobs` debe tener una clave de partición primaria de cadena denominada `application` y una clave de clasificación primaria de cadena denominada `uuid`. La parte `application` de la clave contendrá el nombre de tu aplicación según lo definido por el valor de configuración `name` dentro del archivo de configuración `app` de tu aplicación. Dado que el nombre de la aplicación es parte de la clave de la tabla de DynamoDB, puedes usar la misma tabla para almacenar trabajos fallidos para múltiples aplicaciones de Laravel.

Además, asegúrate de instalar AWS SDK para que tu aplicación Laravel pueda comunicarse con Amazon DynamoDB:

```shell
composer require aws/aws-sdk-php
```

A continuación, establece el valor de la opción de configuración `queue.failed.driver` en `dynamodb`. Además, debes definir las opciones de configuración `key`, `secret` y `region` dentro del array de configuración del trabajo fallido. Estas opciones se utilizarán para autenticarte con AWS. Cuando se utiliza el controlador `dynamodb`, la opción de configuración `queue.failed.database` no es necesaria:

```php
'failed' => [
    'driver' => env('QUEUE_FAILED_DRIVER', 'dynamodb'),
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    'table' => 'failed_jobs',
],
```

<a id="disabling-failed-job-storage"></a>
### Deshabilitar el almacenamiento de trabajos fallidos

Puedes indicarle a Laravel que descarte los trabajos fallidos sin almacenarlos estableciendo el valor de la opción de configuración `queue.failed.driver` en `null`. Normalmente, esto se puede lograr mediante la variable de entorno `QUEUE_FAILED_DRIVER`:

```ini
QUEUE_FAILED_DRIVER=null
```

<a id="failed-job-events"></a>
### Eventos de trabajos fallidos

Si deseas registrar un listener de eventos que se invocará cuando falle un trabajo, puedes utilizar el método `failing` de la fachada `Queue`. Por ejemplo, podemos adjuntar una función anónima a este evento desde el método `boot` del `AppServiceProvider` que se incluye con Laravel:

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Queue;
use Illuminate\Support\ServiceProvider;
use Illuminate\Queue\Events\JobFailed;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // ...
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Queue::failing(function (JobFailed $event) {
            // $event->connectionName
            // $event->job
            // $event->exception
        });
    }
}
```

<a id="clearing-jobs-from-queues"></a>
## Borrar trabajos de colas

> **Nota:**
> Cuando utilizas [Horizon](../horizon/), debes utilizar el comando `horizon:clear` para borrar trabajos de la cola en lugar del comando `queue:clear`.

Si deseas eliminar todos los trabajos de la cola predeterminada de la conexión predeterminada, puedes hacerlo usando el comando `queue:clear` Artisan:

```shell
php artisan queue:clear
```

También puedes proporcionar el argumento `connection` y la opción `queue` para eliminar trabajos de una conexión y cola específicas:

```shell
php artisan queue:clear redis --queue=emails
```

> **Advertencia:**
> La eliminación de trabajos de las colas solo está disponible para los controladores de colas de bases de datos, SQS y Redis. Además, el proceso de eliminación de mensajes SQS tarda hasta 60 segundos, por lo que es posible que también se eliminen los trabajos enviados a la cola SQS hasta 60 segundos después de borrar la cola.

<a id="monitoring-your-queues"></a>
## Supervisión de las colas

Si tu cola recibe una afluencia repentina de trabajos, podría verse abrumada, lo que provocaría un largo tiempo de espera para que se completen los trabajos. Si lo deseas, Laravel puede alertarte cuando el recuento de trabajos en cola supere un umbral específico.

Para comenzar, debes programar el comando `queue:monitor` para [ejecutarlo cada minuto](../scheduling/). El comando acepta los nombres de las colas que deseas monitorear, así como el umbral de recuento de trabajos deseado:

```shell
php artisan queue:monitor redis:default,redis:deployments --max=100
```

Programar este comando por sí solo no es suficiente para activar una notificación que te avise del estado desbordado de la cola. Cuando el comando encuentra una cola cuyo recuento de trabajos supera su umbral, se enviará un evento `Illuminate\Queue\Events\QueueBusy`. Puedes escuchar este evento dentro del `AppServiceProvider` de tu aplicación para enviarte una notificación o enviársela a tu equipo de desarrollo:

```php
use App\Notifications\QueueHasLongWaitTime;
use Illuminate\Queue\Events\QueueBusy;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Event::listen(function (QueueBusy $event) {
        Notification::route('mail', 'dev@example.com')
            ->notify(new QueueHasLongWaitTime(
                $event->connectionName,
                $event->queue,
                $event->size
            ));
    });
}
```

<a id="testing"></a>
## Pruebas

Al probar el código que despacha trabajos, es posible que desees indicarle a Laravel que no ejecute el trabajo en sí, ya que el código del trabajo se puede probar directamente y por separado del código que lo despacha. Por supuesto, para probar el trabajo en sí, puedes crear una instancia de trabajo e invocar el método `handle` directamente en tu prueba.

Puedes utilizar el método `fake` de la fachada `Queue` para evitar que los trabajos en cola se envíen a la cola. Después de llamar al método `fake` de la fachada `Queue`, puedes comprobar que la aplicación intentó despachar trabajos a la cola:

```php tab=Pest
<?php

use App\Jobs\AnotherJob;
use App\Jobs\ShipOrder;
use Illuminate\Support\Facades\Queue;

test('orders can be shipped', function () {
    Queue::fake();

    // Perform order shipping...

    // Assert that no jobs were pushed...
    Queue::assertNothingPushed();

    // Assert a job was pushed to a given queue...
    Queue::assertPushedOn('queue-name', ShipOrder::class);

    // Assert a job was pushed
    Queue::assertPushed(ShipOrder::class);

    // Assert a job was pushed exactly once...
    Queue::assertPushedOnce(ShipOrder::class);

    // Assert a job was pushed twice...
    Queue::assertPushedTimes(ShipOrder::class, 2);

    // Assert a job was not pushed...
    Queue::assertNotPushed(AnotherJob::class);

    // Assert that a closure was pushed to the queue...
    Queue::assertClosurePushed();

    // Assert that a closure was not pushed...
    Queue::assertClosureNotPushed();

    // Assert the total number of jobs that were pushed...
    Queue::assertCount(3);
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use App\Jobs\AnotherJob;
use App\Jobs\ShipOrder;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_orders_can_be_shipped(): void
    {
        Queue::fake();

        // Perform order shipping...

        // Assert that no jobs were pushed...
        Queue::assertNothingPushed();

        // Assert a job was pushed to a given queue...
        Queue::assertPushedOn('queue-name', ShipOrder::class);

        // Assert a job was pushed
        Queue::assertPushed(ShipOrder::class);

        // Assert a job was pushed exactly once...
        Queue::assertPushedOnce(ShipOrder::class);

        // Assert a job was pushed twice...
        Queue::assertPushedTimes(ShipOrder::class, 2);

        // Assert a job was not pushed...
        Queue::assertNotPushed(AnotherJob::class);

        // Assert that a closure was pushed to the queue...
        Queue::assertClosurePushed();

        // Assert that a closure was not pushed...
        Queue::assertClosureNotPushed();

        // Assert the total number of jobs that were pushed...
        Queue::assertCount(3);
    }
}
```

Puedes pasar una función anónima a los métodos `assertPushed`, `assertNotPushed`, `assertClosurePushed` o `assertClosureNotPushed` para comprobar que se envió un trabajo que cumple una condición determinada. Si se despachó al menos un trabajo que cumple la condición dada, entonces la aserción será exitosa:

```php
use Illuminate\Queue\CallQueuedClosure;

Queue::assertPushed(function (ShipOrder $job) use ($order) {
    return $job->order->id === $order->id;
});

Queue::assertClosurePushed(function (CallQueuedClosure $job) {
    return $job->name === 'validate-order';
});
```

Alternativamente, puedes pasar un array de valores de propiedad esperados como segundo argumento de `assertPushed` o `assertNotPushed`, o como tercer argumento de `assertPushedOn`:

```php
Queue::assertPushed(ShipOrder::class, ['order' => $order]);

Queue::assertPushedOn('shipping', ShipOrder::class, ['order' => $order]);
```

Todas las propiedades especificadas deben coincidir. Los valores se comparan mediante igualdad estricta, mientras que los modelos de Eloquent se comparan mediante su método `is`. Los métodos `assertDispatched`, `assertNotDispatched`, `assertDispatchedSync` y `assertDispatchedAfterResponse` de la fachada `Bus` también aceptan un array de valores de propiedad esperados como segundo argumento.

<a id="faking-a-subset-of-jobs"></a>
### Simulación de un subconjunto de trabajos

Si solo necesita simular trabajos específicos mientras permite que los demás trabajos se ejecutan normalmente, puedes pasar los nombres de clase de los trabajos que deben simularse al método `fake`:

```php tab=Pest
test('orders can be shipped', function () {
    Queue::fake([
        ShipOrder::class,
    ]);

    // Perform order shipping...

    // Assert a job was pushed twice...
    Queue::assertPushedTimes(ShipOrder::class, 2);
});
```

```php tab=PHPUnit
public function test_orders_can_be_shipped(): void
{
    Queue::fake([
        ShipOrder::class,
    ]);

    // Perform order shipping...

    // Assert a job was pushed twice...
    Queue::assertPushedTimes(ShipOrder::class, 2);
}
```

Puedes simular todos los trabajos excepto un conjunto de trabajos específicos utilizando el método `except`:

```php
Queue::fake()->except([
    ShipOrder::class,
]);
```

<a id="testing-job-chains"></a>
### Pruebas de cadenas de trabajos

Para probar las cadenas de trabajo, deberás utilizar las capacidades de simulación de la fachada `Bus`. El método `assertChained` de la fachada `Bus` se puede utilizar para comprobar que se envió una [cadena de trabajos](../queues/#job-chaining). El método `assertChained` acepta una serie de trabajos encadenados como primer argumento:

```php
use App\Jobs\RecordShipment;
use App\Jobs\ShipOrder;
use App\Jobs\UpdateInventory;
use Illuminate\Support\Facades\Bus;

Bus::fake();

// ...

Bus::assertChained([
    ShipOrder::class,
    RecordShipment::class,
    UpdateInventory::class
]);
```

Como puedes ver en el ejemplo anterior, el array de trabajos encadenados puede ser un array de los nombres de clase del trabajo. Sin embargo, también puedes proporcionar un array de instancias reales de trabajos. Al hacerlo, Laravel se asegurará de que las instancias de trabajo sean de la misma clase y tengan los mismos valores de propiedad de los trabajos encadenados enviados por tu aplicación:

```php
Bus::assertChained([
    new ShipOrder,
    new RecordShipment,
    new UpdateInventory,
]);
```

Puedes utilizar el método `assertDispatchedWithoutChain` para comprobar que un trabajo se envió sin una cadena de trabajos:

```php
Bus::assertDispatchedWithoutChain(ShipOrder::class);
```

<a id="testing-chain-modifications"></a>
#### Prueba de modificaciones de la cadena

Si un trabajo encadenado [antepone o agrega trabajos a una cadena](#adding-jobs-to-the-chain) existente, puedes usar el método `assertHasChain` del trabajo para comprobar que el trabajo tiene la cadena esperada de trabajos restantes:

```php
$job = new ProcessPodcast;

$job->handle();

$job->assertHasChain([
    new TranscribePodcast,
    new OptimizePodcast,
    new ReleasePodcast,
]);
```

Se puedes utilizar el método `assertDoesntHaveChain` para comprobar que la cadena restante del trabajo está vacía:

```php
$job->assertDoesntHaveChain();
```

<a id="testing-chained-batches"></a>
#### Prueba de lotes encadenados

Si tu cadena de trabajos [contiene un lote de trabajos](#chains-and-batches), puedes comprobar que el lote encadenado coincide con tus expectativas insertando una definición `Bus::chainedBatch` dentro de tu aserción de cadena:

```php
use App\Jobs\ShipOrder;
use App\Jobs\UpdateInventory;
use Illuminate\Bus\PendingBatch;
use Illuminate\Support\Facades\Bus;

Bus::assertChained([
    new ShipOrder,
    Bus::chainedBatch(function (PendingBatch $batch) {
        return $batch->jobs->count() === 3;
    }),
    new UpdateInventory,
]);
```

<a id="testing-job-batches"></a>
### Pruebas de lotes de trabajos

El método `assertBatched` de la fachada `Bus` se puede utilizar para comprobar que se envió un [lote de trabajos](../queues/#job-batching). La función anónima dada al método `assertBatched` recibe una instancia de `Illuminate\Bus\PendingBatch`, que puede usarse para inspeccionar los trabajos dentro del lote:

```php
use Illuminate\Bus\PendingBatch;
use Illuminate\Support\Facades\Bus;

Bus::fake();

// ...

Bus::assertBatched(function (PendingBatch $batch) {
    return $batch->name == 'Import CSV' &&
           $batch->jobs->count() === 10;
});
```

El método `hasJobs` se puede utilizar en el lote pendiente para verificar que el lote contenga los trabajos esperados. El método acepta una serie de instancias de trabajo, nombres de clases o funciones anónimas:

```php
Bus::assertBatched(function (PendingBatch $batch) {
    return $batch->hasJobs([
        new ProcessCsvRow(row: 1),
        new ProcessCsvRow(row: 2),
        new ProcessCsvRow(row: 3),
    ]);
});
```

Cuando se utilizan funciones anónimas, la función anónima recibirá la instancia del trabajo. El tipo de trabajo esperado se inferirá de la declaración de tipo de la función anónima:

```php
Bus::assertBatched(function (PendingBatch $batch) {
    return $batch->hasJobs([
        fn (ProcessCsvRow $job) => $job->row === 1,
        fn (ProcessCsvRow $job) => $job->row === 2,
        fn (ProcessCsvRow $job) => $job->row === 3,
    ]);
});
```

Puedes utilizar el método `assertBatchCount` para comprobar que se envió una cantidad determinada de lotes:

```php
Bus::assertBatchCount(3);
```

Puedes utilizar `assertNothingBatched` para comprobar que no se enviaron lotes:

```php
Bus::assertNothingBatched();
```

<a id="testing-job-batch-interaction"></a>
#### Prueba de interacción entre trabajo y lote

Además, es posible que en ocasiones necesites probar la interacción de un trabajo individual con su lote subyacente. Por ejemplo, es posible que necesites probar si un trabajo canceló el procesamiento posterior de su lote. Para lograr esto, debes asignar un lote simulado al trabajo mediante el método `withFakeBatch`. El método `withFakeBatch` devuelve una tupla que contiene la instancia del trabajo y el lote simulado:

```php
[$job, $batch] = (new ShipOrder)->withFakeBatch();

$job->handle();

$this->assertTrue($batch->cancelled());
$this->assertEmpty($batch->added);
```

<a id="testing-job-queue-interactions"></a>
### Pruebas de interacciones entre trabajos y colas

A veces, es posible que necesites probar que un trabajo en cola [se libera nuevamente en la cola](#manually-releasing-a-job). O bien, es posible que debas comprobar que el trabajo se eliminó solo. Puedes probar estas interacciones de cola creando una instancia del trabajo e invocando el método `withFakeQueueInteractions`.

Una vez que se hayan simulado las interacciones de la cola del trabajo, puedes invocar el método `handle` en el trabajo. Después de invocar el trabajo, hay varios métodos de aserción disponibles para verificar las interacciones de la cola del trabajo:

```php
use App\Exceptions\CorruptedAudioException;
use App\Jobs\ProcessPodcast;

$job = (new ProcessPodcast)->withFakeQueueInteractions();

$job->handle();

$job->assertReleased(delay: 30);
$job->assertDeleted();
$job->assertNotDeleted();
$job->assertFailed();
$job->assertFailedWith(CorruptedAudioException::class);
$job->assertNotFailed();
```

<a id="job-events"></a>
## Eventos de trabajos

Usando los métodos `before` y `after` en la [fachada](../facades/) `Queue`, puedes especificar callbacks que se ejecutarán antes o después de que se procese un trabajo en cola. Estos callbacks son una gran oportunidad para realizar registros adicionales o incrementar estadísticas para un panel. Normalmente, debes llamar a estos métodos desde el método `boot` de un [proveedor de servicios](../providers/). Por ejemplo, podemos usar el `AppServiceProvider` que viene incluido con Laravel:

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Queue;
use Illuminate\Support\ServiceProvider;
use Illuminate\Queue\Events\JobProcessed;
use Illuminate\Queue\Events\JobProcessing;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // ...
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Queue::before(function (JobProcessing $event) {
            // $event->connectionName
            // $event->job
            // $event->job->payload()
        });

        Queue::after(function (JobProcessed $event) {
            // $event->connectionName
            // $event->job
            // $event->job->payload()
        });
    }
}
```

Usando el método `looping` en la [fachada](../facades/) `Queue`, puedes especificar callbacks que se ejecuten antes de que el trabajador intente recuperar un trabajo de una cola. Por ejemplo, puedes registrar una función anónima para revertir cualquier transacción que haya quedado abierta debido a un trabajo fallido anteriormente:

```php
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;

Queue::looping(function () {
    while (DB::transactionLevel() > 0) {
        DB::rollBack();
    }
});
```

Laravel también envía un evento `Illuminate\Queue\Events\WorkerIdle` cuando un trabajador de la cola no puede recuperar un trabajo de la cola:

```php
use Illuminate\Queue\Events\WorkerIdle;
use Illuminate\Support\Facades\Event;

Event::listen(function (WorkerIdle $event) {
    // $event->connectionName
    // $event->queue
    // $event->workerOptions
});
```
