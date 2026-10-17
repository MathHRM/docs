---
title: "Eventos"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Generando Eventos y Oyentes](#generating-events-and-listeners)
- [Registro de eventos y oyentes](#registering-events-and-listeners)
    - [Descubrimiento de eventos](#event-discovery)
    - [Registro manual de eventos](#manually-registering-events)
    - [Oyentes de cierre](#closure-listeners)
- [Definición de eventos](#defining-events)
- [Definición de oyentes](#defining-listeners)
- [Oyentes de eventos en cola](#queued-event-listeners)
    - [Interactuando manualmente con Queue](#manually-interacting-with-the-queue)
    - [Oyentes de eventos en cola y transacciones de bases de datos](#queued-event-listeners-and-database-transactions)
    - [Middleware de escucha en cola](#queued-listener-middleware)
    - [Oyentes en cola cifrados](#encrypted-queued-listeners)
    - [Oyentes de eventos únicos](#unique-event-listeners)
        - [Mantener a los oyentes únicos hasta que comience el procesamiento](#keeping-listeners-unique-until-processing-begins)
        - [Bloqueos de oyente únicos](#unique-listener-locks)
    - [Listeners de eventos con debounce](#debounced-event-listeners)
    - [Manejo de trabajos fallidos](#handling-failed-jobs)
- [Envío de eventos](#dispatching-events)
    - [Envío de eventos después de transacciones de base de datos](#dispatching-events-after-database-transactions)
    - [Aplazamiento de eventos](#deferring-events)
- [Suscriptores del evento](#event-subscribers)
    - [Suscriptores de eventos de escritura](#writing-event-subscribers)
    - [Registrar suscriptores de eventos](#registering-event-subscribers)
- [Prueba](#testing)
    - [Fingiendo un subconjunto de eventos](#faking-a-subset-of-events)
    - [Falsificaciones de eventos con alcance](#scoped-event-fakes)

<a id="introduction"></a>
## Introducción

Los eventos de Laravel proporcionan una implementación de patrón de observador simple, lo que le permite suscribirse y escuchar varios eventos que ocurren dentro de su aplicación. Las clases de eventos normalmente se almacenan en el directorio `app/Events`, mientras que sus oyentes se almacenan en `app/Listeners`. No se preocupe si no ve estos directorios en su aplicación, ya que se crearán automáticamente a medida que genere eventos y oyentes utilizando los comandos de la consola Artisan.

Los eventos sirven como una excelente manera de desacoplar varios aspectos de su aplicación, ya que un solo evento puede tener múltiples oyentes que no dependen unos de otros. Por ejemplo, es posible que desees enviar una notificación de Slack a tu usuario cada vez que se envíe un pedido. En lugar de acoplar su código de procesamiento de pedidos a su código de notificación de Slack, puede generar un evento `App\Events\OrderShipped` que un oyente puede recibir y usar para enviar una notificación de Slack.

<a id="generating-events-and-listeners"></a>
## Generando eventos y oyentes

Para generar rápidamente eventos y oyentes, puede utilizar los comandos de Artisan `make:event` y `make:listener`:

```shell
php artisan make:event PodcastProcessed

php artisan make:listener SendPodcastNotification --event=PodcastProcessed
```

Para mayor comodidad, también puede invocar los comandos Artisan `make:event` y `make:listener` sin argumentos adicionales. Cuando lo hagas, Laravel te pedirá automáticamente el nombre de la clase y, al crear un oyente, el evento que debe escuchar:

```shell
php artisan make:event

php artisan make:listener
```

<a id="registering-events-and-listeners"></a>
## Registro de eventos y oyentes

<a id="event-discovery"></a>
### Descubrimiento de eventos

De forma predeterminada, Laravel buscará y registrará automáticamente sus detectores de eventos escaneando el directorio `Listeners` de su aplicación. Cuando Laravel encuentra cualquier método de clase de escucha que comience con `handle` o `__invoke`, Laravel registrará esos métodos como detectores de eventos para el evento que se indica en la firma del método:

```php
use App\Events\PodcastProcessed;

class SendPodcastNotification
{
    /**
     * Handle the event.
     */
    public function handle(PodcastProcessed $event): void
    {
        // ...
    }
}
```

Puedes escuchar múltiples eventos usando los tipos de unión de PHP:

```php
/**
 * Handle the event.
 */
public function handle(PodcastProcessed|PodcastPublished $event): void
{
    // ...
}
```

Si planea almacenar sus oyentes en un directorio diferente o dentro de varios directorios, puede indicarle a Laravel que escanee esos directorios usando el método `withEvents` en el archivo `bootstrap/app.php` de su aplicación:

```php
->withEvents(discover: [
    __DIR__.'/../app/Domain/Orders/Listeners',
])
```

Puede buscar oyentes en varios directorios similares utilizando el carácter `*` como comodín:

```php
->withEvents(discover: [
    __DIR__.'/../app/Domain/*/Listeners',
])
```

El comando `event:list` se puede utilizar para enumerar todos los oyentes registrados en su aplicación:

```shell
php artisan event:list
```

<a id="event-discovery-in-production"></a>
#### Descubrimiento de eventos en producción

Para aumentar la velocidad de su aplicación, debe almacenar en caché un manifiesto de todos los oyentes de su aplicación utilizando los comandos `optimize` o `event:cache` Artisan. Normalmente, este comando debe ejecutarse como parte del [proceso de implementación](../deployment/#optimization). El marco utilizará este manifiesto para acelerar el proceso de registro del evento. El comando `event:clear` se puede utilizar para destruir la caché de eventos.

<a id="dynamic-event-discovery"></a>
#### Descubrimiento dinámico de eventos

Para controlar dinámicamente si se descubre un determinado oyente, puede implementar la interfaz `ShouldBeDiscovered` en la clase de oyente y definir un método `shouldBeDiscovered` que devuelva un valor booleano. Si el método devuelve `false`, el oyente no se registrará durante el descubrimiento de eventos:

```php
use Illuminate\Contracts\Events\ShouldBeDiscovered;

class SendPodcastNotification implements ShouldBeDiscovered
{
    /**
     * Handle the event.
     */
    public function handle(PodcastProcessed $event): void
    {
        // ...
    }

    /**
     * Determine if the listener should be discovered.
     */
    public static function shouldBeDiscovered(): bool
    {
        return app()->environment('production');
    }
}
```

<a id="manually-registering-events"></a>
### Registro manual de eventos

Usando la fachada `Event`, puede registrar manualmente eventos y sus correspondientes oyentes dentro del método `boot` del `AppServiceProvider` de su aplicación:

```php
use App\Domain\Orders\Events\PodcastProcessed;
use App\Domain\Orders\Listeners\SendPodcastNotification;
use Illuminate\Support\Facades\Event;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Event::listen(
        PodcastProcessed::class,
        SendPodcastNotification::class,
    );
}
```

El comando `event:list` se puede utilizar para enumerar todos los oyentes registrados en su aplicación:

```shell
php artisan event:list
```

<a id="closure-listeners"></a>
### Oyentes de cierre

Normalmente, los oyentes se definen como clases; sin embargo, también puede registrar manualmente detectores de eventos basados ​​en cierres en el método `boot` del `AppServiceProvider` de su aplicación:

```php
use App\Events\PodcastProcessed;
use Illuminate\Support\Facades\Event;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Event::listen(function (PodcastProcessed $event) {
        // ...
    });
}
```

<a id="queueable-anonymous-event-listeners"></a>
#### Oyentes de eventos anónimos en cola

Al registrar detectores de eventos basados ​​en cierres, puede incluir el cierre del detector dentro de la función `Illuminate\Events\queueable` para indicarle a Laravel que ejecute el detector usando [queue](../queues/):

```php
use App\Events\PodcastProcessed;
use function Illuminate\Events\queueable;
use Illuminate\Support\Facades\Event;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Event::listen(queueable(function (PodcastProcessed $event) {
        // ...
    }));
}
```

Al igual que los trabajos en cola, puede utilizar los métodos `onConnection`, `onQueue` y `delay` para personalizar la ejecución del oyente en cola:

```php
Event::listen(queueable(function (PodcastProcessed $event) {
    // ...
})->onConnection('redis')->onQueue('podcasts')->delay(now()->plus(seconds: 10)));
```

Si desea gestionar errores de escucha anónimos en cola, puede proporcionar un cierre al método `catch` mientras define el escucha `queueable`. Este cierre recibirá la instancia del evento y la instancia `Throwable` que provocó el error del oyente:

```php
use App\Events\PodcastProcessed;
use function Illuminate\Events\queueable;
use Illuminate\Support\Facades\Event;
use Throwable;

Event::listen(queueable(function (PodcastProcessed $event) {
    // ...
})->catch(function (PodcastProcessed $event, Throwable $e) {
    // The queued listener failed...
}));
```

<a id="wildcard-event-listeners"></a>
#### Oyentes de eventos comodín

También puede registrar oyentes utilizando el carácter `*` como parámetro comodín, lo que le permite capturar múltiples eventos en el mismo oyente. Los oyentes comodín reciben el nombre del evento como primer argumento y toda la matriz de datos del evento como segundo argumento:

```php
Event::listen('event.*', function (string $eventName, array $data) {
    // ...
});
```

<a id="defining-events"></a>
## Definición de eventos

Una clase de evento es esencialmente un contenedor de datos que contiene la información relacionada con el evento. Por ejemplo, supongamos que un evento `App\Events\OrderShipped` recibe un [objeto Eloquent ORM](../eloquent/):

```php
<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderShipped
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public Order $order,
    ) {}
}
```

Como puede ver, esta clase de evento no contiene lógica. Es un contenedor para la instancia `App\Models\Order` que se compró. El rasgo `SerializesModels` utilizado por el evento serializará elegantemente cualquier modelo de Eloquent si el objeto del evento se serializa usando la función `serialize` de PHP, como cuando se utiliza [oyentes en cola](#queued-event-listeners).

<a id="defining-listeners"></a>
## Definición de oyentes

A continuación, echemos un vistazo al oyente de nuestro evento de ejemplo. Los detectores de eventos reciben instancias de eventos en su método `handle`. El comando `make:listener` Artisan, cuando se invoca con la opción `--event`, importará automáticamente la clase de evento adecuada y escribirá una sugerencia del evento en el método `handle`. Dentro del método `handle`, podrá realizar cualquier acción necesaria para responder al evento:

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;

class SendShipmentNotification
{
    /**
     * Create the event listener.
     */
    public function __construct() {}

    /**
     * Handle the event.
     */
    public function handle(OrderShipped $event): void
    {
        // Access the order using $event->order...
    }
}
```

> **Nota:**
> Sus oyentes de eventos también pueden escribir sugerencias sobre cualquier dependencia que necesiten en sus constructores. Todos los detectores de eventos se resuelven a través del [contenedor de servicios ](../container/) de Laravel, por lo que las dependencias se inyectarán automáticamente.

<a id="stopping-the-propagation-of-an-event"></a>
#### Detener la propagación de un evento

En ocasiones, es posible que desee detener la propagación de un evento a otros oyentes. Puede hacerlo devolviendo `false` desde el método `handle` de su oyente.

<a id="queued-event-listeners"></a>
## Oyentes de eventos en cola

Poner en cola a los oyentes puede resultar beneficioso si su oyente va a realizar una tarea lenta, como enviar un correo electrónico o realizar una solicitud HTTP. Antes de utilizar oyentes en cola, asegúrese de [configurar su queue](../queues/) e iniciar un trabajador de cola en su servidor o entorno de desarrollo local.

Para especificar que un oyente debe estar en cola, agregue la interfaz `ShouldQueue` a la clase de oyente. Los oyentes generados por los comandos `make:listener` Artisan ya tienen esta interfaz importada al espacio de nombres actual para que pueda usarla inmediatamente:

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendShipmentNotification implements ShouldQueue
{
    // ...
}
```

¡Eso es todo! Ahora, cuando se envía un evento manejado por este oyente, el despachador de eventos pondrá en cola automáticamente al oyente utilizando el [sistema de cola](../queues/). Si no se genera ninguna excepción cuando la cola ejecuta el escucha, el trabajo en cola se eliminará automáticamente una vez que haya terminado de procesarse.

<a id="customizing-the-queue-connection-queue-name"></a>
#### Personalización de la conexión, el nombre y el retraso de la cola

Si desea personalizar la conexión de cola, el nombre de la cola o el tiempo de retardo de la cola de un detector de eventos, puede usar los atributos `Connection`, `Queue` y `Delay` en su clase de detector:

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\Attributes\Connection;
use Illuminate\Queue\Attributes\Delay;
use Illuminate\Queue\Attributes\Queue;

#[Connection('sqs')]
#[Queue('listeners')]
#[Delay(60)]
class SendShipmentNotification implements ShouldQueue
{
    // ...
}
```
Si desea definir la conexión de cola del oyente, el nombre de la cola o el retraso en tiempo de ejecución, puede definir los métodos `viaConnection`, `viaQueue` o `withDelay` en el oyente:

```php
/**
 * Get the name of the listener's queue connection.
 */
public function viaConnection(): string
{
    return 'sqs';
}

/**
 * Get the name of the listener's queue.
 */
public function viaQueue(): string
{
    return 'listeners';
}

/**
 * Get the number of seconds before the job should be processed.
 */
public function withDelay(OrderShipped $event): int
{
    return $event->highPriority ? 0 : 60;
}
```

Si desea que todos sus oyentes en cola utilicen la misma cola sin personalizar cada clase de oyente, puede [enrutar el contrato `ShouldQueue` a una cola](../queues/#queue-routing) en su lugar.

<a id="conditionally-queueing-listeners"></a>
#### Oyentes en cola condicional

A veces, es posible que deba determinar si un oyente debe ponerse en cola en función de algunos datos que solo están disponibles en tiempo de ejecución. Para lograr esto, se puede agregar un método `shouldQueue` a un oyente para determinar si el oyente debe estar en cola. Si el método `shouldQueue` devuelve `false`, el oyente no estará en cola:

```php
<?php

namespace App\Listeners;

use App\Events\OrderCreated;
use Illuminate\Contracts\Queue\ShouldQueue;

class RewardGiftCard implements ShouldQueue
{
    /**
     * Reward a gift card to the customer.
     */
    public function handle(OrderCreated $event): void
    {
        // ...
    }

    /**
     * Determine whether the listener should be queued.
     */
    public function shouldQueue(OrderCreated $event): bool
    {
        return $event->order->subtotal >= 5000;
    }
}
```

<a id="manually-interacting-with-the-queue"></a>
### Interactuar manualmente con la cola

Si necesita acceder manualmente a los métodos `delete` y `release` del trabajo de cola subyacente del oyente, puede hacerlo utilizando el rasgo `Illuminate\Queue\InteractsWithQueue`. Este rasgo se importa de forma predeterminada en los oyentes generados y proporciona acceso a estos métodos:

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendShipmentNotification implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     */
    public function handle(OrderShipped $event): void
    {
        if ($condition) {
            $this->release(30);
        }
    }
}
```

<a id="queued-event-listeners-and-database-transactions"></a>
### Oyentes de eventos en cola y transacciones de bases de datos

Cuando los oyentes en cola se envían dentro de transacciones de la base de datos, la cola puede procesarlos antes de que se haya confirmado la transacción de la base de datos. Cuando esto sucede, es posible que las actualizaciones que haya realizado en los modelos o registros de la base de datos durante la transacción de la base de datos aún no se reflejen en la base de datos. Además, es posible que cualquier modelo o registro de base de datos creado dentro de la transacción no exista en la base de datos. Si su oyente depende de estos modelos, pueden ocurrir errores inesperados cuando se procesa el trabajo que distribuye al oyente en cola.

Si la opción de configuración `after_commit` de su conexión de cola está configurada en `false`, aún puede indicar que se debe enviar un escucha en cola particular después de que se hayan confirmado todas las transacciones de la base de datos abierta implementando la interfaz `ShouldQueueAfterCommit` en la clase de escucha:

```php
<?php

namespace App\Listeners;

use Illuminate\Contracts\Queue\ShouldQueueAfterCommit;
use Illuminate\Queue\InteractsWithQueue;

class SendShipmentNotification implements ShouldQueueAfterCommit
{
    use InteractsWithQueue;
}
```

> **Nota:**
> Para obtener más información sobre cómo solucionar estos problemas, revise la documentación sobre [trabajos en cola y transacciones de bases de datos](../queues/#jobs-and-database-transactions).

<a id="queued-listener-middleware"></a>
### Middleware de escucha en cola

Los oyentes en cola también pueden utilizar [job middleware](../queues/#job-middleware). El middleware de trabajo le permite ajustar la lógica personalizada a la ejecución de los oyentes en cola, reduciendo el texto repetitivo en los propios oyentes. Después de crear el middleware del trabajo, se pueden adjuntar a un oyente devolviéndolos desde el método `middleware` del oyente:

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use App\Jobs\Middleware\RateLimited;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendShipmentNotification implements ShouldQueue
{
    /**
     * Handle the event.
     */
    public function handle(OrderShipped $event): void
    {
        // Process the event...
    }

    /**
     * Get the middleware the listener should pass through.
     *
     * @return array<int, object>
     */
    public function middleware(OrderShipped $event): array
    {
        return [new RateLimited];
    }
}
```

<a id="encrypted-queued-listeners"></a>
#### Oyentes en cola cifrados

Laravel le permite garantizar la privacidad y la integridad de los datos de un oyente en cola a través de [encryption](../encryption/). Para comenzar, simplemente agregue la interfaz `ShouldBeEncrypted` a la clase de escucha. Una vez que esta interfaz se haya agregado a la clase, Laravel cifrará automáticamente a su oyente antes de enviarlo a una cola:

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use Illuminate\Contracts\Queue\ShouldBeEncrypted;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendShipmentNotification implements ShouldQueue, ShouldBeEncrypted
{
    // ...
}
```

<a id="unique-event-listeners"></a>
### Oyentes de eventos únicos

> **Advertencia:**
> Los oyentes únicos requieren un controlador de caché que admita [locks](../cache/#atomic-locks). Actualmente, los controladores de caché `memcached`, `redis`, `dynamodb`, `database`, `file` y `array` admiten bloqueos atómicos.

A veces, es posible que desee asegurarse de que solo haya una instancia de un oyente específico en la cola en cualquier momento. Puede hacerlo implementando la interfaz `ShouldBeUnique` en su clase de escucha:

```php
<?php

namespace App\Listeners;

use App\Events\LicenseSaved;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;

class AcquireProductKey implements ShouldQueue, ShouldBeUnique
{
    public function __invoke(LicenseSaved $event): void
    {
        // ...
    }
}
```

En el ejemplo anterior, el oyente `AcquireProductKey` es único. Por lo tanto, el oyente no se pondrá en cola si ya hay otra instancia del oyente en la cola y no ha terminado de procesarse. Esto garantiza que solo se adquiera una clave de producto para cada licencia, incluso si la licencia se guarda varias veces en rápida sucesión.

En ciertos casos, es posible que desee definir una "clave" específica que haga que el oyente sea único o puede que desee especificar un tiempo de espera más allá del cual el oyente ya no seguirá siendo único. Para lograr esto, puede definir propiedades o métodos `uniqueId` y `uniqueFor` en su clase de escucha. Los métodos reciben la instancia del evento, lo que le permite usar datos del evento para construir el valor de retorno:

```php
<?php

namespace App\Listeners;

use App\Events\LicenseSaved;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;

class AcquireProductKey implements ShouldQueue, ShouldBeUnique
{
    /**
     * The number of seconds after which the listener's unique lock will be released.
     *
     * @var int
     */
    public $uniqueFor = 3600;

    public function __invoke(LicenseSaved $event): void
    {
        // ...
    }

    /**
     * Get the unique ID for the listener.
     */
    public function uniqueId(LicenseSaved $event): string
    {
        return 'listener:'.$event->license->id;
    }
}
```

En el ejemplo anterior, el oyente `AcquireProductKey` es único por ID de licencia. Por lo tanto, cualquier envío nuevo del oyente para la misma licencia se ignorará hasta que el oyente existente haya completado el procesamiento. Esto evita que se adquieran claves de producto duplicadas para la misma licencia. Además, si el oyente existente no se procesa dentro de una hora, se liberará el bloqueo único y se podrá poner en cola otro oyente con la misma clave única.

> **Advertencia:**
> Si su aplicación envía eventos desde múltiples servidores web o contenedores, debe asegurarse de que todos sus servidores se comuniquen con el mismo servidor de caché central para que Laravel pueda determinar con precisión si un oyente es único.

<a id="keeping-listeners-unique-until-processing-begins"></a>
#### Mantener a los oyentes únicos hasta que comience el procesamiento

De forma predeterminada, los oyentes únicos se "desbloquean" después de que un oyente completa el procesamiento o falla en todos sus reintentos. Sin embargo, puede haber situaciones en las que desee que su oyente se desbloquee inmediatamente antes de procesarlo. Para lograr esto, su oyente debe implementar el contrato `ShouldBeUniqueUntilProcessing` en lugar del contrato `ShouldBeUnique`:

```php
<?php

namespace App\Listeners;

use App\Events\LicenseSaved;
use Illuminate\Contracts\Queue\ShouldBeUniqueUntilProcessing;
use Illuminate\Contracts\Queue\ShouldQueue;

class AcquireProductKey implements ShouldQueue, ShouldBeUniqueUntilProcessing
{
    // ...
}
```

<a id="unique-listener-locks"></a>
#### Bloqueos de escucha únicos

Detrás de escena, cuando se envía un oyente `ShouldBeUnique`, Laravel intenta adquirir un [lock](../cache/#atomic-locks) con la clave `uniqueId`. Si el bloqueo ya está retenido, no se envía al oyente. Este bloqueo se libera cuando el oyente completa el procesamiento o falla en todos sus reintentos. De forma predeterminada, Laravel utilizará el controlador de caché predeterminado para obtener este bloqueo. Sin embargo, si desea utilizar otro controlador para adquirir el bloqueo, puede definir un método `uniqueVia` que devuelva el controlador de caché que se debe utilizar:

```php
<?php

namespace App\Listeners;

use App\Events\LicenseSaved;
use Illuminate\Contracts\Cache\Repository;
use Illuminate\Support\Facades\Cache;

class AcquireProductKey implements ShouldQueue, ShouldBeUnique
{
    // ...

    /**
     * Get the cache driver for the unique listener lock.
     */
    public function uniqueVia(LicenseSaved $event): Repository
    {
        return Cache::driver('redis');
    }
}
```

> **Nota:**
> Si solo necesita limitar el procesamiento simultáneo de un oyente, utilice el middleware de trabajo [WithoutOverlapping](../queues/#preventing-job-overlaps).

<a id="debounced-event-listeners"></a>
### Listeners de eventos con debounce

A veces, es posible que desee manejar solo la última instancia de un evento enviado repetidamente en un período corto. Puede hacerlo agregando el atributo `DebounceFor` a un oyente en cola:

```php
<?php

namespace App\Listeners;

use App\Events\ProductUpdated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\Attributes\DebounceFor;

#[DebounceFor(30)]
class UpdateProductSearchIndex implements ShouldQueue
{
    /**
     * Handle the event.
     */
    public function handle(ProductUpdated $event): void
    {
        // Update the product's search index...
    }

    /**
     * Get the debounce ID for the listener.
     */
    public function debounceId(ProductUpdated $event): string
    {
        return (string) $event->product->getKey();
    }
}
```

En el ejemplo anterior, enviar repetidamente eventos `ProductUpdated` para el mismo producto en un intervalo de `30` segundos aplicará debounce al listener para que solo se maneje el último evento. Los diferentes ID de debounce se manejan de forma independiente.

Si desea limitar el tiempo que un evento enviado con frecuencia puede aplazar a un oyente, puede proporcionar el argumento `maxWait` al atributo `DebounceFor`:

```php
#[DebounceFor(30, maxWait: 120)]
class UpdateProductSearchIndex implements ShouldQueue
{
    // ...
}
```

Puede personalizar el almacén de caché utilizado para el seguimiento de debounce definiendo un método `debounceVia` en su oyente. El método recibe la instancia del evento y debería devolver un repositorio de caché:

```php
use Illuminate\Contracts\Cache\Repository;
use Illuminate\Support\Facades\Cache;

public function debounceVia(ProductUpdated $event): Repository
{
    return Cache::driver('redis');
}
```

Los listeners con debounce y los oyentes únicos se excluyen mutuamente. Un oyente que utilice el atributo `DebounceFor` no debería implementar `ShouldBeUnique`.

> **Advertencia:**
> Si su aplicación envía eventos desde múltiples servidores web o contenedores, debe asegurarse de que todos sus servidores se comuniquen con el mismo servidor de caché central.

<a id="handling-failed-jobs"></a>
### Manejo de trabajos fallidos

A veces, los oyentes de eventos en cola pueden fallar. Si el oyente en cola excede el número máximo de intentos definido por su trabajador de cola, se llamará al método `failed` en su oyente. El método `failed` recibe la instancia del evento y el `Throwable` que provocó el error:

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Throwable;

class SendShipmentNotification implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     */
    public function handle(OrderShipped $event): void
    {
        // ...
    }

    /**
     * Handle a job failure.
     */
    public function failed(OrderShipped $event, Throwable $exception): void
    {
        // ...
    }
}
```

<a id="specifying-queued-listener-maximum-attempts"></a>
#### Especificación de intentos máximos de escucha en cola

Si uno de sus oyentes en cola encuentra un error, probablemente no desee que vuelva a intentarlo indefinidamente. Por lo tanto, Laravel proporciona varias formas de especificar cuántas veces o durante cuánto tiempo se puede intentar un oyente.

Puede usar el atributo `Tries` en su clase de escucha para especificar cuántas veces se puede intentar el escucha antes de que se considere que ha fallado:

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\Attributes\Tries;
use Illuminate\Queue\InteractsWithQueue;

#[Tries(5)]
class SendShipmentNotification implements ShouldQueue
{
    use InteractsWithQueue;

    // ...
}
```

Como alternativa a definir cuántas veces se puede intentar un escucha antes de que falle, puede definir un momento en el que ya no se debe intentar el escucha. Esto permite intentar un oyente cualquier cantidad de veces dentro de un período de tiempo determinado. Para definir el momento en el que ya no se debe intentar un escucha, agregue un método `retryUntil` a su clase de escucha. Este método debería devolver una instancia `DateTimeInterface`:

```php
use DateTimeInterface;

/**
 * Determine the time at which the listener should timeout.
 */
public function retryUntil(): DateTimeInterface
{
    return now()->plus(minutes: 5);
}
```

Si se definen tanto `retryUntil` como `tries`, Laravel da prioridad al método `retryUntil`.

<a id="specifying-queued-listener-backoff"></a>
#### Especificación de retroceso del oyente en cola

Si desea configurar cuántos segundos debe esperar Laravel antes de volver a intentar un oyente que ha encontrado una excepción, puede usar el atributo `Backoff` en su clase de oyente:

```php
<?php

namespace App\Listeners;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\Attributes\Backoff;

#[Backoff(3)]
class SendShipmentNotification implements ShouldQueue
{
    // ...
}
```

Si necesita una lógica más compleja para determinar el tiempo de espera de los oyentes, puede definir un método `backoff` en su clase de oyente:

```php
/**
 * Calculate the number of seconds to wait before retrying the queued listener.
 */
public function backoff(OrderShipped $event): int
{
    return 3;
}
```

Puede configurar fácilmente retrocesos "exponenciales" devolviendo una matriz de valores de retroceso del método `backoff`. En este ejemplo, el retraso del reintento será de 1 segundo para el primer reintento, 5 segundos para el segundo reintento, 10 segundos para el tercer reintento y 10 segundos para cada reintento posterior si quedan más intentos:

```php
/**
 * Calculate the number of seconds to wait before retrying the queued listener.
 *
 * @return list<int>
 */
public function backoff(OrderShipped $event): array
{
    return [1, 5, 10];
}
```

<a id="specifying-queued-listener-max-exceptions"></a>
#### Especificación de excepciones máximas de escucha en cola

A veces es posible que desee especificar que un escucha en cola se puede intentar muchas veces, pero debería fallar si los reintentos se activan por un número determinado de excepciones no controladas (en lugar de ser liberados directamente por el método `release`). Para lograr esto, puede usar los atributos `Tries` y `MaxExceptions` en su clase de oyente:

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\Attributes\MaxExceptions;
use Illuminate\Queue\Attributes\Tries;
use Illuminate\Queue\InteractsWithQueue;

#[Tries(25)]
#[MaxExceptions(3)]
class SendShipmentNotification implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     */
    public function handle(OrderShipped $event): void
    {
        // Process the event...
    }
}
```

En este ejemplo, se reintentará al oyente hasta 25 veces. Sin embargo, el oyente fallará si genera tres excepciones no controladas.

<a id="specifying-queued-listener-timeout"></a>
#### Especificación del tiempo de espera del oyente en cola

A menudo, usted sabe aproximadamente cuánto tiempo espera que tarden los oyentes en cola. Por este motivo, Laravel le permite especificar un valor de "tiempo de espera". Si un oyente procesa durante más tiempo que el número de segundos especificado por el valor de tiempo de espera, el trabajador que procesa al oyente saldrá con un error. Puede definir la cantidad máxima de segundos que se le debe permitir ejecutar a un oyente usando el atributo `Timeout` en su clase de oyente:

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\Attributes\Timeout;

#[Timeout(120)]
class SendShipmentNotification implements ShouldQueue
{
    // ...
}
```

Si desea indicar que un oyente debe marcarse como fallido en el tiempo de espera, puede usar el atributo `FailOnTimeout` en la clase de oyente:

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\Attributes\FailOnTimeout;

#[FailOnTimeout]
class SendShipmentNotification implements ShouldQueue
{
    // ...
}
```

<a id="dispatching-events"></a>
## Envío de eventos

Para enviar un evento, puede llamar al método estático `dispatch` en el evento. Este método está disponible en el evento mediante el rasgo `Illuminate\Foundation\Events\Dispatchable`. Cualquier argumento pasado al método `dispatch` se pasará al constructor del evento:

```php
<?php

namespace App\Http\Controllers;

use App\Events\OrderShipped;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class OrderShipmentController extends Controller
{
    /**
     * Ship the given order.
     */
    public function store(Request $request): RedirectResponse
    {
        $order = Order::findOrFail($request->order_id);

        // Order shipment logic...

        OrderShipped::dispatch($order);

        return redirect('/orders');
    }
}
```

Si desea enviar un evento de forma condicional, puede utilizar los métodos `dispatchIf` y `dispatchUnless`:

```php
OrderShipped::dispatchIf($condition, $order);

OrderShipped::dispatchUnless($condition, $order);
```

> **Nota:**
> Al realizar pruebas, puede resultar útil afirmar que ciertos eventos se enviaron sin activar realmente a sus oyentes. Los [ayudantes de prueba integrados ](#testing) de Laravel lo hacen muy fácil.

<a id="dispatching-events-after-database-transactions"></a>
### Envío de eventos después de transacciones de base de datos

A veces, es posible que desee indicarle a Laravel que solo envíe un evento después de que se haya confirmado la transacción activa de la base de datos. Para hacerlo, puede implementar la interfaz `ShouldDispatchAfterCommit` en la clase de evento.

Esta interfaz le indica a Laravel que no envíe el evento hasta que se confirme la transacción de la base de datos actual. Si la transacción falla, el evento será descartado. Si no hay ninguna transacción de base de datos en curso cuando se envía el evento, el evento se enviará inmediatamente:

```php
<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderShipped implements ShouldDispatchAfterCommit
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public Order $order,
    ) {}
}
```

<a id="deferring-events"></a>
### Aplazar eventos

Los eventos diferidos le permiten retrasar el envío de eventos del modelo y la ejecución de detectores de eventos hasta que se haya completado un bloque de código específico. Esto es particularmente útil cuando necesita asegurarse de que todos los registros relacionados se creen antes de que se activen los detectores de eventos.

Para aplazar eventos, proporcione un cierre al método `Event::defer()`:

```php
use App\Models\User;
use Illuminate\Support\Facades\Event;

Event::defer(function () {
    $user = User::create(['name' => 'Victoria Otwell']);

    $user->posts()->create(['title' => 'My first post!']);
});
```

Todos los eventos desencadenados dentro del cierre se enviarán después de que se ejecute el cierre. Esto garantiza que los detectores de eventos tengan acceso a todos los registros relacionados que se crearon durante la ejecución diferida. Si ocurre una excepción dentro del cierre, los eventos diferidos no se enviarán.

Para posponer solo eventos específicos, pase una serie de eventos como segundo argumento al método `defer`:

```php
use App\Models\User;
use Illuminate\Support\Facades\Event;

Event::defer(function () {
    $user = User::create(['name' => 'Victoria Otwell']);

    $user->posts()->create(['title' => 'My first post!']);
}, ['eloquent.created: '.User::class]);
```

<a id="event-subscribers"></a>
## Suscriptores de eventos

<a id="writing-event-subscribers"></a>
### Escritura de suscriptores de eventos

Los suscriptores de eventos son clases que pueden suscribirse a múltiples eventos desde la propia clase de suscriptor, lo que le permite definir varios controladores de eventos dentro de una sola clase. Los suscriptores deben definir un método `subscribe`, que recibe una instancia del despachador de eventos. Puede llamar al método `listen` en el despachador determinado para registrar detectores de eventos:

```php
<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Events\Dispatcher;

class UserEventSubscriber
{
    /**
     * Handle user login events.
     */
    public function handleUserLogin(Login $event): void {}

    /**
     * Handle user logout events.
     */
    public function handleUserLogout(Logout $event): void {}

    /**
     * Register the listeners for the subscriber.
     */
    public function subscribe(Dispatcher $events): void
    {
        $events->listen(
            Login::class,
            [UserEventSubscriber::class, 'handleUserLogin']
        );

        $events->listen(
            Logout::class,
            [UserEventSubscriber::class, 'handleUserLogout']
        );
    }
}
```

Si sus métodos de escucha de eventos están definidos dentro del propio suscriptor, puede que le resulte más conveniente devolver una serie de eventos y nombres de métodos del método `subscribe` del suscriptor. Laravel determinará automáticamente el nombre de la clase del suscriptor al registrar los oyentes de eventos:

```php
<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Events\Dispatcher;

class UserEventSubscriber
{
    /**
     * Handle user login events.
     */
    public function handleUserLogin(Login $event): void {}

    /**
     * Handle user logout events.
     */
    public function handleUserLogout(Logout $event): void {}

    /**
     * Register the listeners for the subscriber.
     *
     * @return array<string, string>
     */
    public function subscribe(Dispatcher $events): array
    {
        return [
            Login::class => 'handleUserLogin',
            Logout::class => 'handleUserLogout',
        ];
    }
}
```

<a id="registering-event-subscribers"></a>
### Registro de suscriptores de eventos

Después de escribir al suscriptor, Laravel registrará automáticamente los métodos de controlador dentro del suscriptor si siguen las [convenciones de descubrimiento de eventos](#event-discovery) de Laravel. De lo contrario, puede registrar manualmente a su suscriptor utilizando el método `subscribe` de la fachada `Event`. Normalmente, esto se debe hacer dentro del método `boot` del `AppServiceProvider` de su aplicación:

```php
<?php

namespace App\Providers;

use App\Listeners\UserEventSubscriber;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Event::subscribe(UserEventSubscriber::class);
    }
}
```

<a id="testing"></a>
## Pruebas

Al probar el código que envía eventos, es posible que desee indicarle a Laravel que no ejecute realmente los oyentes del evento, ya que el código del oyente se puede probar directamente y por separado del código que envía el evento correspondiente. Por supuesto, para probar el propio oyente, puede crear una instancia de oyente e invocar el método `handle` directamente en su prueba.

Usando el método `fake` de la fachada `Event`, puede evitar que los oyentes se ejecuten, ejecutar el código bajo prueba y luego afirmar qué eventos fueron enviados por su aplicación usando los métodos `assertDispatched`, `assertNotDispatched` y `assertNothingDispatched`:

```php tab=Pest
<?php

use App\Events\OrderFailedToShip;
use App\Events\OrderShipped;
use Illuminate\Support\Facades\Event;

test('orders can be shipped', function () {
    Event::fake();

    // Perform order shipping...

    // Assert that an event was dispatched...
    Event::assertDispatched(OrderShipped::class);

    // Assert an event was dispatched twice...
    Event::assertDispatched(OrderShipped::class, 2);

    // Assert an event was dispatched once...
    Event::assertDispatchedOnce(OrderShipped::class);

    // Assert an event was not dispatched...
    Event::assertNotDispatched(OrderFailedToShip::class);

    // Assert that no events were dispatched...
    Event::assertNothingDispatched();
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use App\Events\OrderFailedToShip;
use App\Events\OrderShipped;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * Test order shipping.
     */
    public function test_orders_can_be_shipped(): void
    {
        Event::fake();

        // Perform order shipping...

        // Assert that an event was dispatched...
        Event::assertDispatched(OrderShipped::class);

        // Assert an event was dispatched twice...
        Event::assertDispatched(OrderShipped::class, 2);

        // Assert an event was dispatched once...
        Event::assertDispatchedOnce(OrderShipped::class);

        // Assert an event was not dispatched...
        Event::assertNotDispatched(OrderFailedToShip::class);

        // Assert that no events were dispatched...
        Event::assertNothingDispatched();
    }
}
```

Puede pasar un cierre a los métodos `assertDispatched` o `assertNotDispatched` para afirmar que se envió un evento que pasa una "prueba de verdad" determinada. Si se envió al menos un evento que pasa la prueba de verdad dada, entonces la afirmación será exitosa:

```php
Event::assertDispatched(function (OrderShipped $event) use ($order) {
    return $event->order->id === $order->id;
});
```

Alternativamente, puede pasar una matriz de valores de propiedad esperados como segundo argumento a `assertDispatched` o `assertNotDispatched`:

```php
Event::assertDispatched(OrderShipped::class, ['order' => $order]);
```

Todas las propiedades especificadas deben coincidir. Los valores se comparan mediante igualdad estricta, mientras que los modelos de Eloquent se comparan mediante su método `is`.

Si simplemente desea afirmar que un detector de eventos está escuchando un evento determinado, puede utilizar el método `assertListening`:

```php
Event::assertListening(
    OrderShipped::class,
    SendShipmentNotification::class
);
```

> **Advertencia:**
> Después de llamar a `Event::fake()`, no se ejecutará ningún detector de eventos. Por lo tanto, si sus pruebas utilizan fábricas de modelos que dependen de eventos, como la creación de un UUID durante el evento `creating` de un modelo, debe llamar a `Event::fake()` **después** de usar sus fábricas.

<a id="faking-a-subset-of-events"></a>
### Fingir un subconjunto de eventos

Si solo desea falsificar detectores de eventos para un conjunto específico de eventos, puede pasarlos al método `fake` o `fakeFor`:

```php tab=Pest
test('orders can be processed', function () {
    Event::fake([
        OrderCreated::class,
    ]);

    $order = Order::factory()->create();

    Event::assertDispatched(OrderCreated::class);

    // Other events are dispatched as normal...
    $order->update([
        // ...
    ]);
});
```

```php tab=PHPUnit
/**
 * Test order process.
 */
public function test_orders_can_be_processed(): void
{
    Event::fake([
        OrderCreated::class,
    ]);

    $order = Order::factory()->create();

    Event::assertDispatched(OrderCreated::class);

    // Other events are dispatched as normal...
    $order->update([
        // ...
    ]);
}
```

Puede falsificar todos los eventos excepto un conjunto de eventos específicos utilizando el método `except`:

```php
Event::fake()->except([
    OrderCreated::class,
]);
```

<a id="scoped-event-fakes"></a>
### Falsificaciones de eventos con alcance

Si solo desea falsificar detectores de eventos durante una parte de su prueba, puede usar el método `fakeFor`:

```php tab=Pest
<?php

use App\Events\OrderCreated;
use App\Models\Order;
use Illuminate\Support\Facades\Event;

test('orders can be processed', function () {
    $order = Event::fakeFor(function () {
        $order = Order::factory()->create();

        Event::assertDispatched(OrderCreated::class);

        return $order;
    });

    // Events are dispatched as normal and observers will run...
    $order->update([
        // ...
    ]);
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use App\Events\OrderCreated;
use App\Models\Order;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * Test order process.
     */
    public function test_orders_can_be_processed(): void
    {
        $order = Event::fakeFor(function () {
            $order = Order::factory()->create();

            Event::assertDispatched(OrderCreated::class);

            return $order;
        });

        // Events are dispatched as normal and observers will run...
        $order->update([
            // ...
        ]);
    }
}
```
