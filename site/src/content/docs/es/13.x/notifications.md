---
title: "Notificaciones"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Generación de notificaciones](#generating-notifications)
- [Envío de notificaciones](#sending-notifications)
    - [Uso del trait Notifiable](#using-the-notifiable-trait)
    - [Uso de la fachada Notification](#using-the-notification-facade)
    - [Especificar canales de entrega](#specifying-delivery-channels)
    - [Notificaciones en cola](#queueing-notifications)
    - [Notificaciones bajo demanda](#on-demand-notifications)
- [Notificaciones por correo](#mail-notifications)
    - [Formato de los mensajes de correo](#formatting-mail-messages)
    - [Personalizar el remitente](#customizing-the-sender)
    - [Personalizar el destinatario](#customizing-the-recipient)
    - [Personalizar el asunto](#customizing-the-subject)
    - [Personalizar el mailer](#customizing-the-mailer)
    - [Personalizar las plantillas](#customizing-the-templates)
    - [Adjuntos](#mail-attachments)
    - [Agregar etiquetas y metadatos](#adding-tags-metadata)
    - [Personalizar el mensaje Symfony](#customizing-the-symfony-message)
    - [Uso de mailables](#using-mailables)
    - [Vista previa de notificaciones por correo](#previewing-mail-notifications)
- [Notificaciones por correo con Markdown](#markdown-mail-notifications)
    - [Generación del mensaje](#generating-the-message)
    - [Escritura del mensaje](#writing-the-message)
    - [Personalizar los componentes](#customizing-the-components)
- [Notificaciones de base de datos](#database-notifications)
    - [Requisitos previos](#database-prerequisites)
    - [Formato de las notificaciones de base de datos](#formatting-database-notifications)
    - [Acceso a las notificaciones](#accessing-the-notifications)
    - [Marcar notificaciones como leídas](#marking-notifications-as-read)
- [Notificaciones de difusión](#broadcast-notifications)
    - [Requisitos previos](#broadcast-prerequisites)
    - [Formato de las notificaciones de difusión](#formatting-broadcast-notifications)
    - [Escucha de notificaciones](#listening-for-notifications)
- [Notificaciones SMS](#sms-notifications)
    - [Requisitos previos](#sms-prerequisites)
    - [Formato de las notificaciones SMS](#formatting-sms-notifications)
    - [Personalizar el número "De"](#customizing-the-from-number)
    - [Agregar una referencia de cliente](#adding-a-client-reference)
    - [Enrutamiento de notificaciones SMS](#routing-sms-notifications)
- [Notificaciones de Slack](#slack-notifications)
    - [Requisitos previos](#slack-prerequisites)
    - [Formato de las notificaciones de Slack](#formatting-slack-notifications)
    - [Interactividad de Slack](#slack-interactivity)
    - [Enrutamiento de notificaciones de Slack](#routing-slack-notifications)
    - [Notificación de espacios de trabajo externos de Slack](#notifying-external-slack-workspaces)
- [Localización de notificaciones](#localizing-notifications)
- [Pruebas](#testing)
- [Eventos de notificación](#notification-events)
- [Canales personalizados](#custom-channels)

<a id="introduction"></a>
## Introducción

Además de admitir [envío de correo electrónico](../mail/), Laravel brinda soporte para enviar notificaciones a través de una variedad de canales de entrega, incluidos correo electrónico, SMS (a través de [Vonage](https://www.vonage.com/communications-apis/), anteriormente conocido como Nexmo) y [Slack](https://slack.com). Además, se ha creado una variedad de [canales de notificación creados por la comunidad](https://laravel-notification-channels.com/about/#suggesting-a-new-channel) para enviar notificaciones a través de docenas de canales diferentes. Las notificaciones también pueden almacenarse en una base de datos para que puedan mostrarse en tu interfaz web.

Normalmente, las notificaciones deben ser mensajes breves e informativos que notifiquen a los usuarios sobre algo que ocurrió en tu aplicación. Por ejemplo, si estás escribiendo una aplicación de facturación, puedes enviar una notificación de "Factura pagada" a tus usuarios a través de los canales de correo electrónico y SMS.

<a id="generating-notifications"></a>
## Generación de notificaciones

En Laravel, cada notificación está representada por una única clase que normalmente se almacena en el directorio `app/Notifications`. No te preocupes si no ves este directorio en tu aplicación; se creará automáticamente cuando ejecutes el comando `make:notification` Artisan:

```shell
php artisan make:notification InvoicePaid
```

Este comando colocará una nueva clase de notificación en tu directorio `app/Notifications`. Cada clase de notificación contiene un método `via` y un número variable de métodos de creación de mensajes, como `toMail` o `toDatabase`, que convierten la notificación en un mensaje personalizado para ese canal en particular.

<a id="sending-notifications"></a>
## Envío de notificaciones

<a id="using-the-notifiable-trait"></a>
### Uso del trait Notifiable

Las notificaciones se pueden enviar de dos maneras: usando el método `notify` del trait `Notifiable` o usando la [fachada](../facades/) `Notification`. El trait `Notifiable` se incluye en el modelo `App\Models\User` de tu aplicación de forma predeterminada:

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;
}
```

El método `notify` proporcionado por este trait espera recibir una instancia de notificación:

```php
use App\Notifications\InvoicePaid;

$user->notify(new InvoicePaid($invoice));
```

> **Nota:**
> Recuerda, puedes utilizar el trait `Notifiable` en cualquiera de tus modelos. No estás limitado a incluirlo únicamente en tu modelo `User`.

<a id="using-the-notification-facade"></a>
### Uso de la fachada Notification

Alternativamente, puedes enviar notificaciones a través de la [fachada](../facades/) `Notification`. Este enfoque es útil cuando necesitas enviar una notificación a varias entidades notificables, como un conjunto de usuarios. Para enviar notificaciones usando la fachada, pasa todas las entidades notificables y la instancia de notificación al método `send`:

```php
use Illuminate\Support\Facades\Notification;

Notification::send($users, new InvoicePaid($invoice));
```

También puedes enviar notificaciones inmediatamente utilizando el método `sendNow`. Este método enviará la notificación inmediatamente incluso si la notificación implementa la interfaz `ShouldQueue`:

```php
Notification::sendNow($developers, new DeploymentCompleted($deployment));
```

<a id="specifying-delivery-channels"></a>
### Especificación de canales de entrega

Cada clase de notificación tiene un método `via` que determina en qué canales se entregará la notificación. Las notificaciones podrán enviarse en los canales `mail`, `database`, `broadcast`, `vonage` y `slack`.

> **Nota:**
> Si deseas utilizar otros canales de entrega como Telegram o Pusher, consulta el [sitio web de canales de notificación de Laravel mantenido por la comunidad](http://laravel-notification-channels.com).

El método `via` recibe una instancia `$notifiable`, que será una instancia de la clase a la que se envía la notificación. Puedes utilizar `$notifiable` para determinar en qué canales se debe enviar la notificación:

```php
/**
 * Get the notification's delivery channels.
 *
 * @return array<int, string>
 */
public function via(object $notifiable): array
{
    return $notifiable->prefers_sms ? ['vonage'] : ['mail', 'database'];
}
```

<a id="queueing-notifications"></a>
### Notificaciones en cola

> **Advertencia:**
> Antes de poner en cola las notificaciones, debes configurar tu cola e [iniciar un trabajador](../queues/#running-the-queue-worker).

El envío de notificaciones puede llevar tiempo, especialmente si el canal necesita realizar una llamada API externa para entregar la notificación. Para acelerar el tiempo de respuesta de tu aplicación, deja que tu notificación se ponga en cola agregando la interfaz `ShouldQueue` y el trait `Queueable` a tu clase. La interfaz y el trait ya están importados para todas las notificaciones generadas con el comando `make:notification`, por lo que puedes agregarlos inmediatamente a tu clase de notificación:

```php
<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class InvoicePaid extends Notification implements ShouldQueue
{
    use Queueable;

    // ...
}
```

Una vez que se haya agregado la interfaz `ShouldQueue` a tu notificación, podrás enviar la notificación como de costumbre. Laravel detectará la interfaz `ShouldQueue` en la clase y automáticamente pondrá en cola la entrega de la notificación:

```php
$user->notify(new InvoicePaid($invoice));
```

Al poner en cola las notificaciones, se creará un trabajo en cola para cada combinación de destinatario y canal. Por ejemplo, se enviarán seis trabajos a la cola si tu notificación tiene tres destinatarios y dos canales.

<a id="delaying-notifications"></a>
#### Retrasar notificaciones

Si deseas retrasar la entrega de la notificación, puedes encadenar el método `delay` en tu instancia de notificación:

```php
$delay = now()->plus(minutes: 10);

$user->notify((new InvoicePaid($invoice))->delay($delay));
```

Puedes pasar un array al método `delay` para especificar la cantidad de retraso para canales específicos:

```php
$user->notify((new InvoicePaid($invoice))->delay([
    'mail' => now()->plus(minutes: 5),
    'sms' => now()->plus(minutes: 10),
]));
```

Alternativamente, puedes definir un método `withDelay` en la propia clase de notificación. El método `withDelay` debería devolver un array de nombres de canales y valores de retardo:

```php
/**
 * Determine the notification's delivery delay.
 *
 * @return array<string, \Illuminate\Support\Carbon>
 */
public function withDelay(object $notifiable): array
{
    return [
        'mail' => now()->plus(minutes: 5),
        'sms' => now()->plus(minutes: 10),
    ];
}
```

<a id="customizing-the-notification-queue-connection"></a>
#### Personalización de la conexión de la cola de notificaciones

De forma predeterminada, las notificaciones en cola se pondrán en cola utilizando la conexión de cola predeterminada de tu aplicación. Si deseas especificar una conexión diferente que debe usarse para una notificación en particular, puedes llamar al método `onConnection` desde el constructor de tu notificación:

```php
<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class InvoicePaid extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct()
    {
        $this->onConnection('redis');
    }
}
```

O, si deseas especificar una conexión de cola específica que debe usarse para cada canal de notificación admitido por la notificación, puedes definir un método `viaConnections` en tu notificación. Este método debería devolver un array de pares de nombre de canal/nombre de conexión de cola:

```php
/**
 * Determine which connections should be used for each notification channel.
 *
 * @return array<string, string>
 */
public function viaConnections(): array
{
    return [
        'mail' => 'redis',
        'database' => 'sync',
    ];
}
```

<a id="customizing-notification-channel-queues"></a>
#### Personalización de colas de canales de notificación

Si deseas especificar una cola específica que debe usarse para cada canal de notificación admitido por la notificación, puedes definir un método `viaQueues` en tu notificación. Este método debería devolver un array de pares de nombre de canal/nombre de cola:

```php
/**
 * Determine which queues should be used for each notification channel.
 *
 * @return array<string, string>
 */
public function viaQueues(): array
{
    return [
        'mail' => 'mail-queue',
        'slack' => 'slack-queue',
    ];
}
```

<a id="customizing-queued-notification-job-properties"></a>
#### Personalización de los atributos de los trabajos de notificación en cola

Puedes personalizar el comportamiento del trabajo en cola subyacente definiendo atributos de cola en tu clase de notificación. Estos atributos serán heredados por el trabajo en cola que envía la notificación:

```php
<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Queue\Attributes\FailOnTimeout;
use Illuminate\Queue\Attributes\MaxExceptions;
use Illuminate\Queue\Attributes\Timeout;
use Illuminate\Queue\Attributes\Tries;

#[Tries(5)]
#[Timeout(120)]
#[MaxExceptions(3)]
#[FailOnTimeout]
class InvoicePaid extends Notification implements ShouldQueue
{
    use Queueable;

    // ...
}
```

Si deseas garantizar la privacidad y la integridad de los datos de una notificación en cola a través de [cifrado](../encryption/), agrega la interfaz `ShouldBeEncrypted` a tu clase de notificación:

```php
<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeEncrypted;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class InvoicePaid extends Notification implements ShouldQueue, ShouldBeEncrypted
{
    use Queueable;

    // ...
}
```

Además de definir estos atributos directamente en tu clase de notificación, también puedes definir los métodos `backoff` y `retryUntil` para especificar la estrategia de retroceso y el tiempo de espera de reintento para el trabajo de notificación en cola:

```php
use DateTime;

/**
 * Calculate the number of seconds to wait before retrying the notification.
 */
public function backoff(): int
{
    return 3;
}

/**
 * Determine the time at which the notification should timeout.
 */
public function retryUntil(): DateTime
{
    return now()->plus(minutes: 5);
}
```

> **Nota:**
> Para obtener más información sobre estos atributos y métodos de trabajo, revisa la documentación sobre [trabajos en cola](../queues/#max-job-attempts-and-timeout).

<a id="queued-notification-middleware"></a>
#### Middleware de notificación en cola

Las notificaciones en cola pueden definir middleware [al igual que los trabajos en cola](../queues/#job-middleware). Para comenzar, define un método `middleware` en tu clase de notificación. El método `middleware` recibirá las variables `$notifiable` y `$channel`, que te permitirán personalizar el middleware devuelto según el destino de la notificación:

```php
use Illuminate\Queue\Middleware\RateLimited;

/**
 * Get the middleware the notification job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(object $notifiable, string $channel)
{
    return match ($channel) {
        'mail' => [new RateLimited('postmark')],
        'slack' => [new RateLimited('slack')],
        default => [],
    };
}
```

<a id="queued-notifications-and-database-transactions"></a>
#### Notificaciones en cola y transacciones de bases de datos

Cuando las notificaciones en cola se envían dentro de transacciones de la base de datos, la cola puede procesarlas antes de que se haya confirmado la transacción de la base de datos. Cuando esto sucede, es posible que las actualizaciones que hayas realizado en los modelos o registros de la base de datos durante la transacción de la base de datos aún no se reflejen en la base de datos. Además, es posible que cualquier modelo o registro de base de datos creado dentro de la transacción no exista en la base de datos. Si tu notificación depende de estos modelos, pueden ocurrir errores inesperados cuando se procesa el trabajo que envía la notificación en cola.

Si la opción de configuración `after_commit` de tu conexión de cola está configurada en `false`, aún puedes indicar que se debe enviar una notificación en cola particular después de que se hayan confirmado todas las transacciones abiertas de la base de datos llamando al método `afterCommit` al enviar la notificación:

```php
use App\Notifications\InvoicePaid;

$user->notify((new InvoicePaid($invoice))->afterCommit());
```

Alternativamente, puedes llamar al método `afterCommit` desde el constructor de tu notificación:

```php
<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class InvoicePaid extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct()
    {
        $this->afterCommit();
    }
}
```

> **Nota:**
> Para obtener más información sobre cómo solucionar estos problemas, revisa la documentación sobre [trabajos en cola y transacciones de bases de datos](../queues/#jobs-and-database-transactions).

<a id="determining-if-the-queued-notification-should-be-sent"></a>
#### Determinar si se debe enviar una notificación en cola

Una vez que se ha enviado una notificación en cola a la cola para su procesamiento en segundo plano, normalmente un trabajador de la cola la aceptará y la enviará al destinatario previsto.

Sin embargo, si deseas tomar la decisión final sobre si la notificación en cola debe enviarse después de que un trabajador de cola la procese, puedes definir un método `shouldSend` en la clase de notificación. Si este método devuelve `false`, la notificación no se enviará:

```php
/**
 * Determine if the notification should be sent.
 */
public function shouldSend(object $notifiable, string $channel): bool
{
    return $this->invoice->isPaid();
}
```

<a id="after-sending-notifications"></a>
#### Después de enviar notificaciones

Si deseas ejecutar código después de que se haya enviado una notificación, puedes definir un método `afterSending` en la clase de notificación. Este método recibirá la entidad notificable, el nombre del canal y la respuesta del canal:

```php
/**
 * Handle the notification after it has been sent.
 */
public function afterSending(object $notifiable, string $channel, mixed $response): void
{
    // ...
}
```

<a id="on-demand-notifications"></a>
### Notificaciones bajo demanda

A veces es posible que necesites enviar una notificación a alguien que no está almacenado como "usuario" de tu aplicación. Usando el método `route` de la fachada `Notification`, puedes especificar información de enrutamiento de notificación ad-hoc antes de enviar la notificación:

```php
use Illuminate\Broadcasting\Channel;
use Illuminate\Support\Facades\Notification;

Notification::route('mail', 'taylor@example.com')
    ->route('vonage', '5555555555')
    ->route('slack', '#slack-channel')
    ->route('broadcast', [new Channel('channel-name')])
    ->notify(new InvoicePaid($invoice));
```

Si deseas proporcionar el nombre del destinatario al enviar una notificación bajo demanda a la ruta `mail`, puedes proporcionar un array que contenga la dirección de correo electrónico como clave y el nombre como valor del primer elemento de el array:

```php
Notification::route('mail', [
    'barrett@example.com' => 'Barrett Blair',
])->notify(new InvoicePaid($invoice));
```

Con el método `routes`, puedes proporcionar información de enrutamiento ad hoc para múltiples canales de notificación a la vez:

```php
Notification::routes([
    'mail' => ['barrett@example.com' => 'Barrett Blair'],
    'vonage' => '5555555555',
])->notify(new InvoicePaid($invoice));
```

<a id="mail-notifications"></a>
## Notificaciones por correo

<a id="formatting-mail-messages"></a>
### Formatear mensajes de correo

Si una notificación admite el envío como correo electrónico, debes definir un método `toMail` en la clase de notificación. Este método recibirá una entidad `$notifiable` y debería devolver una instancia `Illuminate\Notifications\Messages\MailMessage`.

La clase `MailMessage` contiene algunos métodos simples para ayudarte a crear mensajes de correo electrónico transaccionales. Los mensajes de correo pueden contener líneas de texto así como un "llamado a la acción". Echemos un vistazo a un método de ejemplo `toMail`:

```php
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    $url = url('/invoice/'.$this->invoice->id);

    return (new MailMessage)
        ->greeting('Hello!')
        ->line('One of your invoices has been paid!')
        ->lineIf($this->amount > 0, "Amount paid: {$this->amount}")
        ->action('View Invoice', $url)
        ->line('Thank you for using our application!');
}
```

> **Nota:**
> Ten en cuenta que estamos utilizando `$this->invoice->id` en nuestro método `toMail`. Puedes pasar cualquier dato que tu notificación necesite para generar tu mensaje al constructor de la notificación.

En este ejemplo, registramos un saludo, una línea de texto, una llamada a la acción y luego otra línea de texto. Estos métodos proporcionados por el objeto `MailMessage` hacen que sea sencillo y rápido formatear pequeños correos electrónicos transaccionales. Luego, el canal de correo traducirá los componentes del mensaje en una hermosa plantilla de correo electrónico HTML responsiva con una contraparte de texto sin formato. A continuación se muestra un ejemplo de un correo electrónico generado por el canal `mail`:

<img src="https://laravel.com/img/docs/notification-example-2.png">

> **Nota:**
> Al enviar notificaciones por correo, asegúrate de configurar la opción de configuración `name` en tu archivo de configuración `config/app.php`. Este valor se utilizará en el encabezado y pie de página de tus mensajes de notificación por correo.

<a id="error-messages"></a>
#### Mensajes de error

Algunas notificaciones informan a los usuarios sobre errores, como el pago fallido de una factura. Puedes indicar que un mensaje de correo se refiere a un error llamando al método `error` al crear tu mensaje. Cuando se utiliza el método `error` en un mensaje de correo, el botón de llamada a la acción será rojo en lugar de negro:

```php
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->error()
        ->subject('Invoice Payment Failed')
        ->line('...');
}
```

<a id="other-mail-notification-formatting-options"></a>
#### Otras opciones de formato de notificación de correo

En lugar de definir las "líneas" de texto en la clase de notificación, puedes usar el método `view` para especificar una plantilla personalizada que se debe usar para representar el correo electrónico de notificación:

```php
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)->view(
        'mail.invoice.paid', ['invoice' => $this->invoice]
    );
}
```

Puedes especificar una vista de texto sin formato para el mensaje de correo pasando el nombre de la vista como el segundo elemento de un array que se proporciona al método `view`:

```php
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)->view(
        ['mail.invoice.paid', 'mail.invoice.paid-text'],
        ['invoice' => $this->invoice]
    );
}
```

O, si tu mensaje solo tiene una vista de texto sin formato, puedes utilizar el método `text`:

```php
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)->text(
        'mail.invoice.paid-text', ['invoice' => $this->invoice]
    );
}
```

<a id="customizing-the-sender"></a>
### Personalización del remitente

De forma predeterminada, la dirección y el nombre del remitente del correo electrónico se definen en el archivo de configuración `config/mail.php`. Sin embargo, puedes especificar la dirección de remitente para una notificación específica utilizando el método `from`:

```php
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->from('barrett@example.com', 'Barrett Blair')
        ->line('...');
}
```

<a id="customizing-the-recipient"></a>
### Personalización del destinatario

Al enviar notificaciones a través del canal `mail`, el sistema de notificaciones buscará automáticamente una propiedad `email` en tu entidad notificable. Puedes personalizar qué dirección de correo electrónico se utiliza para enviar la notificación definiendo un método `routeNotificationForMail` en la entidad notificable:

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Notifications\Notification;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * Route notifications for the mail channel.
     *
     * @return  array<string, string>|string
     */
    public function routeNotificationForMail(Notification $notification): array|string
    {
        // Return email address only...
        return $this->email_address;

        // Return email address and name...
        return [$this->email_address => $this->name];
    }
}
```

<a id="customizing-the-subject"></a>
### Personalización del asunto

De forma predeterminada, el asunto del correo electrónico es el nombre de clase de la notificación con el formato "Mayúsculas iniciales". Entonces, si tu clase de notificación se llama `InvoicePaid`, el asunto del correo electrónico será `Invoice Paid`. Si deseas especificar un asunto diferente para el mensaje, puedes llamar al método `subject` al crear tu mensaje:

```php
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->subject('Notification Subject')
        ->line('...');
}
```

<a id="customizing-the-mailer"></a>
### Personalización del mailer

De forma predeterminada, la notificación por correo electrónico se enviará utilizando el mailer predeterminado definido en el archivo de configuración `config/mail.php`. Sin embargo, puedes especificar un mailer diferente en tiempo de ejecución llamando al método `mailer` al generar tu mensaje:

```php
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->mailer('postmark')
        ->line('...');
}
```

<a id="customizing-the-templates"></a>
### Personalización de las plantillas

Puedes modificar la plantilla HTML y de texto sin formato utilizada por las notificaciones por correo publicando los recursos del paquete de notificaciones. Después de ejecutar este comando, las plantillas de notificación por correo se ubicarán en el directorio `resources/views/vendor/notifications`:

```shell
php artisan vendor:publish --tag=laravel-notifications
```

<a id="mail-attachments"></a>
### Adjuntos

Para agregar archivos adjuntos a una notificación por correo electrónico, utiliza el método `attach` mientras creas tu mensaje. El método `attach` acepta la ruta absoluta al archivo como primer argumento:

```php
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->greeting('Hello!')
        ->attach('/path/to/file');
}
```

> **Nota:**
> El método `attach` que ofrecen los mensajes de correo de notificación también acepta [objetos adjuntables](../mail/#attachable-objects). Consulta la [documentación completa sobre objetos adjuntables](../mail/#attachable-objects) para obtener más información.

Al adjuntar archivos a un mensaje, también puedes especificar el nombre para mostrar y/o el tipo MIME pasando un `array` como segundo argumento del método `attach`:

```php
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->greeting('Hello!')
        ->attach('/path/to/file', [
            'as' => 'name.pdf',
            'mime' => 'application/pdf',
        ]);
}
```

Cuando sea necesario, se pueden adjuntar varios archivos a un mensaje utilizando el método `attachMany`:

```php
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->greeting('Hello!')
        ->attachMany([
            '/path/to/forge.svg',
            '/path/to/vapor.svg' => [
                'as' => 'Logo.svg',
                'mime' => 'image/svg+xml',
            ],
        ]);
}
```

Puedes utilizar el método `attachFromStorageDisk` para adjuntar un archivo que existe en un [disco del sistema de archivos](../filesystem/) específico. Este método acepta el nombre del disco y la ruta al archivo en ese disco:

```php
use App\Mail\InvoicePaid as InvoicePaidMailable;

/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): Mailable
{
    return (new InvoicePaidMailable($this->invoice))
        ->to($notifiable->email)
        ->attachFromStorageDisk('s3', '/path/to/file', 'invoice.pdf', [
            'mime' => 'application/pdf',
        ]);
}
```

<a id="raw-data-attachments"></a>
#### Datos adjuntos sin procesar

El método `attachData` se puede utilizar para adjuntar una cadena sin formato de bytes como archivo adjunto. Al llamar al método `attachData`, debes proporcionar el nombre de archivo que se debe asignar al archivo adjunto:

```php
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->greeting('Hello!')
        ->attachData($this->pdf, 'name.pdf', [
            'mime' => 'application/pdf',
        ]);
}
```

<a id="adding-tags-metadata"></a>
### Agregar etiquetas y metadatos

Algunos proveedores de correo electrónico de terceros, como Mailgun y Postmark, admiten "etiquetas" y "metadatos" de mensajes, que pueden usarse para agrupar y rastrear los correos electrónicos enviados por tu aplicación. Puedes agregar etiquetas y metadatos a un mensaje de correo electrónico mediante los métodos `tag` y `metadata`:

```php
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->greeting('Comment Upvoted!')
        ->tag('upvote')
        ->metadata('comment_id', $this->comment->id);
}
```

Si tu aplicación utiliza el controlador Mailgun, puedes consultar la documentación de Mailgun para obtener más información sobre [etiquetas](https://documentation.mailgun.com/docs/mailgun/user-manual/tracking-messages/#tags) y [metadatos](https://documentation.mailgun.com/docs/mailgun/user-manual/sending-messages/#attaching-metadata-to-messages). Asimismo, también se puede consultar la documentación de Postmark para obtener más información sobre su soporte para [etiquetas](https://postmarkapp.com/blog/tags-support-for-smtp) y [metadatos](https://postmarkapp.com/support/article/1125-custom-metadata-faq).

Si tu aplicación utiliza Amazon SES para enviar correos electrónicos, debes utilizar el método `metadata` para adjuntar ["etiquetas" de SES](https://docs.aws.amazon.com/ses/latest/APIReference/API_MessageTag.html) al mensaje.

<a id="customizing-the-symfony-message"></a>
### Personalización del mensaje de Symfony

El método `withSymfonyMessage` de la clase `MailMessage` te permite registrar una función anónima que será invocado con la instancia de Symfony Message antes de enviar el mensaje. Esto te brinda la oportunidad de personalizar profundamente el mensaje antes de entregarlo:

```php
use Symfony\Component\Mime\Email;

/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->withSymfonyMessage(function (Email $message) {
            $message->getHeaders()->addTextHeader(
                'Custom-Header', 'Header Value'
            );
        });
}
```

<a id="using-mailables"></a>
### Uso de mailables

Si es necesario, puedes devolver un [objeto mailable](../mail/) completo desde el método `toMail` de tu notificación. Al devolver un `Mailable` en lugar de un `MailMessage`, deberás especificar el destinatario del mensaje utilizando el método `to` del objeto mailable:

```php
use App\Mail\InvoicePaid as InvoicePaidMailable;
use Illuminate\Mail\Mailable;

/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): Mailable
{
    return (new InvoicePaidMailable($this->invoice))
        ->to($notifiable->email);
}
```

<a id="mailables-and-on-demand-notifications"></a>
#### Mailables y notificaciones bajo demanda

Si envías una [notificación bajo demanda](#on-demand-notifications), la instancia `$notifiable` proporcionada al método `toMail` será una instancia de `Illuminate\Notifications\AnonymousNotifiable`, que ofrece un método `routeNotificationFor` que puede usarse para recuperar la dirección de correo electrónico a la que se debe enviar la notificación bajo demanda:

```php
use App\Mail\InvoicePaid as InvoicePaidMailable;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Mail\Mailable;

/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): Mailable
{
    $address = $notifiable instanceof AnonymousNotifiable
        ? $notifiable->routeNotificationFor('mail')
        : $notifiable->email;

    return (new InvoicePaidMailable($this->invoice))
        ->to($address);
}
```

<a id="previewing-mail-notifications"></a>
### Vista previa de notificaciones por correo

Al diseñar una plantilla de notificación de correo, es conveniente obtener una vista previa rápida del mensaje de correo renderizado en tu navegador como una plantilla típica de Blade. Por esta razón, Laravel te permite devolver cualquier mensaje de correo generado por una notificación de correo directamente desde una función anónima de ruta o un controlador. Cuando se devuelve un `MailMessage`, se renderizará y mostrará en el navegador, lo que te permitirá obtener una vista previa rápida de tu diseño sin necesidad de enviarlo a una dirección de correo electrónico real:

```php
use App\Models\Invoice;
use App\Notifications\InvoicePaid;

Route::get('/notification', function () {
    $invoice = Invoice::find(1);

    return (new InvoicePaid($invoice))
        ->toMail($invoice->user);
});
```

<a id="markdown-mail-notifications"></a>
## Notificaciones por correo con Markdown

Las notificaciones por correo de Markdown te permiten aprovechar las plantillas prediseñadas de notificaciones por correo, al tiempo que te brindan más libertad para escribir mensajes más largos y personalizados. Dado que los mensajes están escritos en Markdown, Laravel puede generar hermosas plantillas HTML responsivas para los mensajes y al mismo tiempo genera automáticamente una contraparte de texto sin formato.

<a id="generating-the-message"></a>
### Generación del mensaje

Para generar una notificación con una plantilla de Markdown correspondiente, puedes usar la opción `--markdown` del comando `make:notification` Artisan:

```shell
php artisan make:notification InvoicePaid --markdown=mail.invoice.paid
```

Como todas las demás notificaciones por correo, las notificaciones que utilizan plantillas de Markdown deben definir un método `toMail` en tu clase de notificación. Sin embargo, en lugar de utilizar los métodos `line` y `action` para construir la notificación, utiliza el método `markdown` para especificar el nombre de la plantilla Markdown que se debe utilizar. Se puede pasar un array de datos que deseas que estén disponibles para la plantilla como segundo argumento del método:

```php
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    $url = url('/invoice/'.$this->invoice->id);

    return (new MailMessage)
        ->subject('Invoice Paid')
        ->markdown('mail.invoice.paid', ['url' => $url]);
}
```

<a id="writing-the-message"></a>
### Escritura del mensaje

Las notificaciones por correo de Markdown utilizan una combinación de componentes Blade y sintaxis de Markdown que te permiten crear notificaciones fácilmente mientras aprovechas los componentes de notificación prediseñados de Laravel:

```blade
<x-mail::message>
# Invoice Paid

Your invoice has been paid!

<x-mail::button :url="$url">
View Invoice
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
```

> **Nota:**
> No utilices demasiada sangría al escribir correos electrónicos de Markdown. Según los estándares de Markdown, los analizadores de Markdown representarán el contenido sangrado como bloques de código.

<a id="button-component"></a>
#### Componente de botón

El componente de botón representa un enlace de botón centrado. El componente acepta dos argumentos, una `url` y un `color` opcional. Los colores admitidos son `primary`, `green` y `red`. Puedes agregar tantos componentes de botón a una notificación como desees:

```blade
<x-mail::button :url="$url" color="green">
View Invoice
</x-mail::button>
```

<a id="panel-component"></a>
#### Componente del panel

El componente del panel representa el bloque de texto dado en un panel que tiene un color de fondo ligeramente diferente al del resto de la notificación. Esto te permite llamar la atención sobre un bloque de texto determinado:

```blade
<x-mail::panel>
This is the panel content.
</x-mail::panel>
```

<a id="table-component"></a>
#### Componente de tabla

El componente de tabla te permite transformar una tabla Markdown en una tabla HTML. El componente acepta la tabla Markdown como contenido. La alineación de columnas de la tabla se admite mediante la sintaxis de alineación de tabla Markdown predeterminada:

```blade
<x-mail::table>
| Laravel       | Table         | Example       |
| ------------- | :-----------: | ------------: |
| Col 2 is      | Centered      | $10           |
| Col 3 is      | Right-Aligned | $20           |
</x-mail::table>
```

<a id="customizing-the-components"></a>
### Personalización de los componentes

Puedes exportar todos los componentes de notificación de Markdown a tu propia aplicación para personalizarlos. Para exportar los componentes, utiliza el comando `vendor:publish` Artisan para publicar la etiqueta de recursos `laravel-mail`:

```shell
php artisan vendor:publish --tag=laravel-mail
```

Este comando publicará los componentes de correo de Markdown en el directorio `resources/views/vendor/mail`. El directorio `mail` contendrá un directorio `html` y un directorio `text`, cada uno con sus respectivas representaciones de cada componente disponible. Eres libre de personalizar estos componentes como quieras.

<a id="customizing-the-css"></a>
#### Personalización del CSS

Después de exportar los componentes, el directorio `resources/views/vendor/mail/html/themes` contendrá un archivo `default.css`. Puedes personalizar el CSS en este archivo y sus estilos se incluirán automáticamente en las representaciones HTML de tus notificaciones de Markdown.

Si deseas crear un tema completamente nuevo para los componentes Markdown de Laravel, puedes colocar un archivo CSS en el directorio `html/themes`. Después de nombrar y guardar tu archivo CSS, actualiza la opción `theme` del archivo de configuración `mail` para que coincida con el nombre de tu nuevo tema.

Para personalizar el tema de una notificación individual, puedes llamar al método `theme` mientras creas el mensaje de correo de la notificación. El método `theme` acepta el nombre del tema que se debe utilizar al enviar la notificación:

```php
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->theme('invoice')
        ->subject('Invoice Paid')
        ->markdown('mail.invoice.paid', ['url' => $url]);
}
```

<a id="database-notifications"></a>
## Notificaciones de base de datos

<a id="database-prerequisites"></a>
### Requisitos previos

El canal de notificación `database` almacena la información de notificación en una tabla de base de datos. Esta tabla contendrá información como el tipo de notificación, así como una estructura de datos JSON que describe la notificación.

Puedes consultar la tabla para mostrar las notificaciones en la interfaz de usuario de tu aplicación. Pero, antes de poder hacer eso, deberás crear una tabla de base de datos para guardar tus notificaciones. Puedes utilizar el comando `make:notifications-table` para generar una [migración](../migrations/) con el esquema de tabla adecuado:

```shell
php artisan make:notifications-table

php artisan migrate
```

> **Nota:**
> Si tus modelos notificables utilizan [Claves primarias UUID o ULID](../eloquent/#uuid-and-ulid-keys), debes reemplazar el método `morphs` con [uuidMorphs](../migrations/#column-method-uuidMorphs) o [ulidMorphs](../migrations/#column-method-ulidMorphs) en la migración de la tabla de notificaciones.

<a id="formatting-database-notifications"></a>
### Formatear notificaciones de bases de datos

Si una notificación admite el almacenamiento en una tabla de base de datos, debes definir un método `toDatabase` o `toArray` en la clase de notificación. Este método recibirá una entidad `$notifiable` y debería devolver un array PHP simple. El array devuelto se codificará como JSON y se almacenará en la columna `data` de tu tabla `notifications`. Echemos un vistazo a un método de ejemplo `toArray`:

```php
/**
 * Get the array representation of the notification.
 *
 * @return array<string, mixed>
 */
public function toArray(object $notifiable): array
{
    return [
        'invoice_id' => $this->invoice->id,
        'amount' => $this->invoice->amount,
    ];
}
```

Cuando se almacena una notificación en la base de datos de tu aplicación, la columna `type` se establecerá en el nombre de clase de la notificación de forma predeterminada y la columna `read_at` será `null`. Sin embargo, puedes personalizar este comportamiento definiendo los métodos `databaseType` y `initialDatabaseReadAtValue` en tu clase de notificación:

```php
use Illuminate\Support\Carbon;

/**
 * Get the notification's database type.
 */
public function databaseType(object $notifiable): string
{
    return 'invoice-paid';
}

/**
 * Get the initial value for the "read_at" column.
 */
public function initialDatabaseReadAtValue(): ?Carbon
{
    return null;
}
```

<a id="todatabase-vs-toarray"></a>
#### `toDatabase` frente a `toArray`

El método `toArray` también lo utiliza el canal `broadcast` para determinar qué datos transmitir a tu interfaz con JavaScript. Si deseas tener dos representaciones de array diferentes para los canales `database` y `broadcast`, debes definir un método `toDatabase` en lugar de un método `toArray`.

<a id="accessing-the-notifications"></a>
### Acceso a las notificaciones

Una vez que las notificaciones se almacenan en la base de datos, necesitas una forma conveniente de acceder a ellas desde sus entidades notificables. El trait `Illuminate\Notifications\Notifiable`, que se incluye en el modelo `App\Models\User` predeterminado de Laravel, incluye una [relación de Eloquent](../eloquent-relationships/) `notifications` que devuelve las notificaciones de la entidad. Para recuperar notificaciones, puedes acceder a este método como a cualquier otra relación de Eloquent. De forma predeterminada, las notificaciones se ordenarán por la marca de tiempo `created_at` con las notificaciones más recientes al comienzo de la colección:

```php
$user = App\Models\User::find(1);

foreach ($user->notifications as $notification) {
    echo $notification->type;
}
```

Si deseas recuperar sólo las notificaciones "no leídas", puedes utilizar la relación `unreadNotifications`. Nuevamente, estas notificaciones se ordenarán por la marca de tiempo `created_at` con las notificaciones más recientes al comienzo de la colección:

```php
$user = App\Models\User::find(1);

foreach ($user->unreadNotifications as $notification) {
    echo $notification->type;
}
```

Si deseas recuperar sólo las notificaciones "leídas", puedes utilizar la relación `readNotifications`:

```php
$user = App\Models\User::find(1);

foreach ($user->readNotifications as $notification) {
    echo $notification->type;
}
```

> **Nota:**
> Para acceder a tus notificaciones desde tu cliente JavaScript, debes definir un controlador de notificaciones para tu aplicación que devuelva las notificaciones para una entidad notificable, como el usuario actual. Luego puedes realizar una solicitud HTTP a la URL de ese controlador desde tu cliente JavaScript.

<a id="marking-notifications-as-read"></a>
### Marcar notificaciones como leídas

Normalmente, querrás marcar una notificación como "leída" cuando un usuario la vea. El trait `Illuminate\Notifications\Notifiable` proporciona un método `markAsRead`, que actualiza la columna `read_at` en el registro de la base de datos de la notificación:

```php
$user = App\Models\User::find(1);

foreach ($user->unreadNotifications as $notification) {
    $notification->markAsRead();
}
```

Sin embargo, en lugar de recorrer cada notificación, puedes utilizar el método `markAsRead` directamente en una colección de notificaciones:

```php
$user->unreadNotifications->markAsRead();
```

También puedes utilizar una consulta de actualización masiva para marcar todas las notificaciones como leídas sin recuperarlas de la base de datos:

```php
$user = App\Models\User::find(1);

$user->unreadNotifications()->update(['read_at' => now()]);
```

Puedes eliminar las notificaciones con `delete` para eliminarlas de la tabla por completo:

```php
$user->notifications()->delete();
```

<a id="broadcast-notifications"></a>
## Notificaciones de difusión

<a id="broadcast-prerequisites"></a>
### Requisitos previos

Antes de transmitir notificaciones, debes configurar y estar familiarizado con los [servicios de difusión de eventos](../broadcasting/) de Laravel. La difusión de eventos proporciona una forma de reaccionar a los eventos de Laravel del lado del servidor desde tu interfaz con JavaScript.

<a id="formatting-broadcast-notifications"></a>
### Formatear notificaciones de difusión

El canal `broadcast` transmite notificaciones utilizando los [servicios de difusión de eventos](../broadcasting/) de Laravel, lo que permite que tu interfaz con JavaScript detecte notificaciones en tiempo real. Si una notificación admite la transmisión, puedes definir un método `toBroadcast` en la clase de notificación. Este método recibirá una entidad `$notifiable` y debería devolver una instancia `BroadcastMessage`. Si el método `toBroadcast` no existe, se utilizará el método `toArray` para recopilar los datos que deben transmitirse. Los datos devueltos se codificarán como JSON y se transmitirán a tu interfaz con JavaScript. Echemos un vistazo a un método de ejemplo `toBroadcast`:

```php
use Illuminate\Notifications\Messages\BroadcastMessage;

/**
 * Get the broadcastable representation of the notification.
 */
public function toBroadcast(object $notifiable): BroadcastMessage
{
    return new BroadcastMessage([
        'invoice_id' => $this->invoice->id,
        'amount' => $this->invoice->amount,
    ]);
}
```

<a id="broadcast-queue-configuration"></a>
#### Configuración de la cola de transmisión

Todas las notificaciones de difusión están en cola para su transmisión. Si deseas configurar la conexión de cola o el nombre de cola que se utiliza para poner en cola la operación de transmisión, puedes usar los métodos `onConnection` y `onQueue` de `BroadcastMessage`:

```php
return (new BroadcastMessage($data))
    ->onConnection('sqs')
    ->onQueue('broadcasts');
```

<a id="customizing-the-notification-type"></a>
#### Personalización del tipo de notificación

Además de los datos que especifiques, todas las notificaciones de difusión también tienen un campo `type` que contiene el nombre de clase completo de la notificación. Si deseas personalizar la notificación `type`, puedes definir un método `broadcastType` en la clase de notificación:

```php
/**
 * Get the type of the notification being broadcast.
 */
public function broadcastType(): string
{
    return 'broadcast.message';
}
```

<a id="listening-for-notifications"></a>
### Escucha de notificaciones

Las notificaciones se transmitirán en un canal privado formateado según la convención `{notifiable}.{id}`. Por lo tanto, si envías una notificación a una instancia `App\Models\User` con un ID de `1`, la notificación se transmitirá en el canal privado `App.Models.User.1`. Cuando usas [Laravel Echo](../broadcasting/#client-side-installation), puedes escuchar fácilmente las notificaciones en un canal usando el método `notification`:

```js
Echo.private('App.Models.User.' + userId)
    .notification((notification) => {
        console.log(notification.type);
    });
```

<a id="using-react-or-vue"></a>
#### Uso de React, Vue o Svelte

Laravel Echo incluye hooks de React, Vue y Svelte que hacen que sea sencillo escuchar las notificaciones. Para comenzar, invoca el hook `useEchoNotification`, que se utiliza para escuchar notificaciones. El hook `useEchoNotification` abandonará automáticamente los canales cuando se desmonte el componente consumidor:

```js tab=React
import { useEchoNotification } from "@laravel/echo-react";

useEchoNotification(
    `App.Models.User.${userId}`,
    (notification) => {
        console.log(notification.type);
    },
);
```

```vue tab=Vue
<script setup lang="ts">
import { useEchoNotification } from "@laravel/echo-vue";

useEchoNotification(
    `App.Models.User.${userId}`,
    (notification) => {
        console.log(notification.type);
    },
);
</script>
```

```svelte tab=Svelte
<script>
import { useEchoNotification } from "@laravel/echo-svelte";

useEchoNotification(
    `App.Models.User.${userId}`,
    (notification) => {
        console.log(notification.type);
    },
);
</script>
```

De forma predeterminada, el hook escucha todas las notificaciones. Para especificar los tipos de notificaciones que te gustaría escuchar, puedes proporcionar una cadena o un array de tipos a `useEchoNotification`:

```js tab=React
import { useEchoNotification } from "@laravel/echo-react";

useEchoNotification(
    `App.Models.User.${userId}`,
    (notification) => {
        console.log(notification.type);
    },
    'App.Notifications.InvoicePaid',
);
```

```vue tab=Vue
<script setup lang="ts">
import { useEchoNotification } from "@laravel/echo-vue";

useEchoNotification(
    `App.Models.User.${userId}`,
    (notification) => {
        console.log(notification.type);
    },
    'App.Notifications.InvoicePaid',
);
</script>
```

```svelte tab=Svelte
<script>
import { useEchoNotification } from "@laravel/echo-svelte";

useEchoNotification(
    `App.Models.User.${userId}`,
    (notification) => {
        console.log(notification.type);
    },
    'App.Notifications.InvoicePaid',
);
</script>
```

También puedes especificar la forma de los datos de la carga útil de notificación, lo que proporciona mayor seguridad de tipos y comodidad de edición:

```ts
type InvoicePaidNotification = {
    invoice_id: number;
    created_at: string;
};

useEchoNotification<InvoicePaidNotification>(
    `App.Models.User.${userId}`,
    (notification) => {
        console.log(notification.invoice_id);
        console.log(notification.created_at);
        console.log(notification.type);
    },
    'App.Notifications.InvoicePaid',
);
```

<a id="customizing-the-notification-channel"></a>
#### Personalización del canal de notificación

Si deseas personalizar en qué canal se transmiten las notificaciones de difusión de una entidad, puedes definir un método `receivesBroadcastNotificationsOn` en la entidad notificable:

```php
<?php

namespace App\Models;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * The channels the user receives notification broadcasts on.
     */
    public function receivesBroadcastNotificationsOn(): string
    {
        return 'users.'.$this->id;
    }
}
```

<a id="sms-notifications"></a>
## Notificaciones por SMS

<a id="sms-prerequisites"></a>
### Requisitos previos

El envío de notificaciones por SMS en Laravel funciona con [Vonage](https://www.vonage.com/) (anteriormente conocido como Nexmo). Antes de poder enviar notificaciones a través de Vonage, debes instalar los paquetes `laravel/vonage-notification-channel` y `guzzlehttp/guzzle`:

```shell
composer require laravel/vonage-notification-channel guzzlehttp/guzzle
```

El paquete incluye un [archivo de configuración](https://github.com/laravel/vonage-notification-channel/blob/3.x/config/vonage.php). Sin embargo, no es necesario que exportes este archivo de configuración a tu propia aplicación. Simplemente puedes usar las variables de entorno `VONAGE_KEY` y `VONAGE_SECRET` para definir tus claves públicas y secretas de Vonage.

Después de definir tus claves, debes configurar una variable de entorno `VONAGE_SMS_FROM` que define el número de teléfono desde el que se deben enviar tus mensajes SMS de forma predeterminada. Puedes generar este número de teléfono dentro del panel de control de Vonage:

```ini
VONAGE_SMS_FROM=15556666666
```

<a id="formatting-sms-notifications"></a>
### Formatear notificaciones por SMS

Si una notificación admite el envío como SMS, debes definir un método `toVonage` en la clase de notificación. Este método recibirá una entidad `$notifiable` y debería devolver una instancia `Illuminate\Notifications\Messages\VonageMessage`:

```php
use Illuminate\Notifications\Messages\VonageMessage;

/**
 * Get the Vonage / SMS representation of the notification.
 */
public function toVonage(object $notifiable): VonageMessage
{
    return (new VonageMessage)
        ->content('Your SMS message content');
}
```

<a id="unicode-content"></a>
#### Contenido Unicode

Si tu mensaje SMS contendrá caracteres Unicode, debes llamar al método `unicode` al construir la instancia `VonageMessage`:

```php
use Illuminate\Notifications\Messages\VonageMessage;

/**
 * Get the Vonage / SMS representation of the notification.
 */
public function toVonage(object $notifiable): VonageMessage
{
    return (new VonageMessage)
        ->content('Your unicode message')
        ->unicode();
}
```

<a id="customizing-the-from-number"></a>
### Personalización del número "De"

Si deseas enviar algunas notificaciones desde un número de teléfono que es diferente del número de teléfono especificado por tu variable de entorno `VONAGE_SMS_FROM`, puedes llamar al método `from` en una instancia `VonageMessage`:

```php
use Illuminate\Notifications\Messages\VonageMessage;

/**
 * Get the Vonage / SMS representation of the notification.
 */
public function toVonage(object $notifiable): VonageMessage
{
    return (new VonageMessage)
        ->content('Your SMS message content')
        ->from('15554443333');
}
```

<a id="adding-a-client-reference"></a>
### Agregar una referencia de cliente

Si deseas realizar un seguimiento de los costos por usuario, equipo o cliente, puedes agregar una "referencia de cliente" a la notificación. Vonage te permitirá generar informes utilizando la referencia de este cliente para que puedas comprender mejor el uso de SMS de un cliente en particular. La referencia del cliente puede ser cualquier cadena de hasta 40 caracteres:

```php
use Illuminate\Notifications\Messages\VonageMessage;

/**
 * Get the Vonage / SMS representation of the notification.
 */
public function toVonage(object $notifiable): VonageMessage
{
    return (new VonageMessage)
        ->clientReference((string) $notifiable->id)
        ->content('Your SMS message content');
}
```

<a id="routing-sms-notifications"></a>
### Enrutamiento de notificaciones por SMS

Para enrutar las notificaciones de Vonage al número de teléfono adecuado, define un método `routeNotificationForVonage` en tu entidad notificable:

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Notifications\Notification;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * Route notifications for the Vonage channel.
     */
    public function routeNotificationForVonage(Notification $notification): string
    {
        return $this->phone_number;
    }
}
```

<a id="slack-notifications"></a>
## Notificaciones de Slack

<a id="slack-prerequisites"></a>
### Requisitos previos

Antes de enviar notificaciones de Slack, debes instalar el canal de notificaciones de Slack a través de Composer:

```shell
composer require laravel/slack-notification-channel
```

Además, debes crear una [Slack App](https://api.slack.com/apps?new_app=1) para tu espacio de trabajo de Slack.

Si solo necesitas enviar notificaciones al mismo espacio de trabajo de Slack en el que se creó la aplicación, debes asegurarte de que tu aplicación tenga los alcances `chat:write`, `chat:write.public` y `chat:write.customize`. Estos ámbitos se pueden agregar desde la pestaña de administración de aplicaciones "OAuth y permisos" dentro de Slack.

A continuación, copia el "Token OAuth de usuario de bot" de la aplicación y colócalo dentro de un array de configuración `slack` en el archivo de configuración `services.php` de tu aplicación. Este token se puede encontrar en la pestaña "OAuth y permisos" dentro de Slack:

```php
'slack' => [
    'notifications' => [
        'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
        'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
    ],
],
```

<a id="slack-app-distribution"></a>
#### Distribución de aplicaciones

Si tu aplicación enviará notificaciones a espacios de trabajo externos de Slack que son propiedad de los usuarios de tu aplicación, deberás "distribuir" tu aplicación a través de Slack. La distribución de la aplicación se puede administrar desde la pestaña "Administrar distribución" de tu aplicación dentro de Slack. Una vez que tu aplicación haya sido distribuida, podrás usar [Socialite](../socialite/) para [obtener tokens de Slack Bot](../socialite/#slack-bot-scopes) en nombre de los usuarios de tu aplicación.

<a id="formatting-slack-notifications"></a>
### Formatear notificaciones de Slack

Si una notificación admite el envío como mensaje de Slack, debes definir un método `toSlack` en la clase de notificación. Este método recibirá una entidad `$notifiable` y debería devolver una instancia `Illuminate\Notifications\Slack\SlackMessage`. Puedes crear notificaciones enriquecidas utilizando el [Block Kit de la API de Slack](https://api.slack.com/block-kit). Se puede obtener una vista previa del siguiente ejemplo en [Block Kit Builder de Slack](https://app.slack.com/block-kit-builder/T01KWS6K23Z#%7B%22blocks%22:%5B%7B%22type%22:%22header%22,%22text%22:%7B%22type%22:%22plain_text%22,%22text%22:%22Invoice%20Paid%22%7D%7D,%7B%22type%22:%22context%22,%22elements%22:%5B%7B%22type%22:%22plain_text%22,%22text%22:%22Customer%20%231234%22%7D%5D%7D,%7B%22type%22:%22section%22,%22text%22:%7B%22type%22:%22plain_text%22,%22text%22:%22An%20invoice%20has%20been%20paid.%22%7D,%22fields%22:%5B%7B%22type%22:%22mrkdwn%22,%22text%22:%22*Invoice%20No:*%5Cn1000%22%7D,%7B%22type%22:%22mrkdwn%22,%22text%22:%22*Invoice%20Recipient:*%5Cntaylor@laravel.com%22%7D%5D%7D,%7B%22type%22:%22divider%22%7D,%7B%22type%22:%22section%22,%22text%22:%7B%22type%22:%22plain_text%22,%22text%22:%22Congratulations!%22%7D%7D%5D%7D):

```php
use Illuminate\Notifications\Slack\BlockKit\Blocks\ContextBlock;
use Illuminate\Notifications\Slack\BlockKit\Blocks\SectionBlock;
use Illuminate\Notifications\Slack\SlackMessage;

/**
 * Get the Slack representation of the notification.
 */
public function toSlack(object $notifiable): SlackMessage
{
    return (new SlackMessage)
        ->text('One of your invoices has been paid!')
        ->headerBlock('Invoice Paid')
        ->contextBlock(function (ContextBlock $block) {
            $block->text('Customer #1234');
        })
        ->sectionBlock(function (SectionBlock $block) {
            $block->text('An invoice has been paid.');
            $block->field("*Invoice No:*\n1000")->markdown();
            $block->field("*Invoice Recipient:*\ntaylor@laravel.com")->markdown();
        })
        ->dividerBlock()
        ->sectionBlock(function (SectionBlock $block) {
            $block->text('Congratulations!');
        });
}
```

<a id="using-slacks-block-kit-builder-template"></a>
#### Uso de la plantilla de Block Kit Builder de Slack

En lugar de utilizar los métodos fluidos del generador de mensajes para construir tu mensaje de Block Kit, puedes proporcionar la carga útil JSON sin procesar generada por el Block Kit Builder de Slack al método `usingBlockKitTemplate`:

```php
use Illuminate\Notifications\Slack\SlackMessage;
use Illuminate\Support\Str;

/**
 * Get the Slack representation of the notification.
 */
public function toSlack(object $notifiable): SlackMessage
{
    $template = <<<JSON
        {
          "blocks": [
            {
              "type": "header",
              "text": {
                "type": "plain_text",
                "text": "Team Announcement"
              }
            },
            {
              "type": "section",
              "text": {
                "type": "plain_text",
                "text": "We are hiring!"
              }
            }
          ]
        }
    JSON;

    return (new SlackMessage)
        ->usingBlockKitTemplate($template);
}
```

<a id="slack-interactivity"></a>
### Interactividad de Slack

El sistema de notificación Block Kit de Slack proporciona potentes funciones para [manejar la interacción del usuario](https://api.slack.com/interactivity/handling). Para utilizar estas funciones, tu aplicación de Slack debe tener habilitada la "Interactividad" y una "URL de solicitud" configurada que apunte a una URL proporcionada por tu aplicación. Estas configuraciones se pueden administrar desde la pestaña de administración de aplicaciones "Interactividad y accesos directos" dentro de Slack.

En el siguiente ejemplo, que utiliza el método `actionsBlock`, Slack enviará una solicitud `POST` a tu "URL de solicitud" con una carga útil que contiene el usuario de Slack que hizo clic en el botón, el ID del botón en el que se hizo clic y más. Luego, tu aplicación puede determinar la acción a realizar en función de la carga útil. También debes [verificar que la solicitud](https://api.slack.com/authentication/verifying-requests-from-slack) fue realizada por Slack:

```php
use Illuminate\Notifications\Slack\BlockKit\Blocks\ActionsBlock;
use Illuminate\Notifications\Slack\BlockKit\Blocks\ContextBlock;
use Illuminate\Notifications\Slack\BlockKit\Blocks\SectionBlock;
use Illuminate\Notifications\Slack\SlackMessage;

/**
 * Get the Slack representation of the notification.
 */
public function toSlack(object $notifiable): SlackMessage
{
    return (new SlackMessage)
        ->text('One of your invoices has been paid!')
        ->headerBlock('Invoice Paid')
        ->contextBlock(function (ContextBlock $block) {
            $block->text('Customer #1234');
        })
        ->sectionBlock(function (SectionBlock $block) {
            $block->text('An invoice has been paid.');
        })
        ->actionsBlock(function (ActionsBlock $block) {
             // ID defaults to "button_acknowledge_invoice"...
            $block->button('Acknowledge Invoice')->primary();

            // Manually configure the ID...
            $block->button('Deny')->danger()->id('deny_invoice');
        });
}
```

<a id="slack-confirmation-modals"></a>
#### Ventanas modales de confirmación

Si deseas que se solicite a los usuarios que confirmen una acción antes de realizarla, puedes invocar el método `confirm` al definir tu botón. El método `confirm` acepta un mensaje y una función anónima que recibe una instancia `ConfirmObject`:

```php
use Illuminate\Notifications\Slack\BlockKit\Blocks\ActionsBlock;
use Illuminate\Notifications\Slack\BlockKit\Blocks\ContextBlock;
use Illuminate\Notifications\Slack\BlockKit\Blocks\SectionBlock;
use Illuminate\Notifications\Slack\BlockKit\Composites\ConfirmObject;
use Illuminate\Notifications\Slack\SlackMessage;

/**
 * Get the Slack representation of the notification.
 */
public function toSlack(object $notifiable): SlackMessage
{
    return (new SlackMessage)
        ->text('One of your invoices has been paid!')
        ->headerBlock('Invoice Paid')
        ->contextBlock(function (ContextBlock $block) {
            $block->text('Customer #1234');
        })
        ->sectionBlock(function (SectionBlock $block) {
            $block->text('An invoice has been paid.');
        })
        ->actionsBlock(function (ActionsBlock $block) {
            $block->button('Acknowledge Invoice')
                ->primary()
                ->confirm(
                    'Acknowledge the payment and send a thank you email?',
                    function (ConfirmObject $dialog) {
                        $dialog->confirm('Yes');
                        $dialog->deny('No');
                    }
                );
        });
}
```

<a id="inspecting-slack-blocks"></a>
#### Inspección de bloques de Slack

Si deseas inspeccionar rápidamente los bloques que has estado construyendo, puedes invocar el método `dd` en la instancia `SlackMessage`. El método `dd` generará y volcará una URL al [Block Kit Builder](https://app.slack.com/block-kit-builder/) de Slack, que muestra una vista previa de la carga útil y la notificación en tu navegador. Puedes pasar `true` al método `dd` para volcar la carga útil sin procesar:

```php
return (new SlackMessage)
    ->text('One of your invoices has been paid!')
    ->headerBlock('Invoice Paid')
    ->dd();
```

<a id="routing-slack-notifications"></a>
### Enrutamiento de notificaciones de Slack

Para dirigir las notificaciones de Slack al equipo y canal de Slack apropiados, define un método `routeNotificationForSlack` en tu modelo notificable. Este método puede devolver uno de tres valores:

- `null` - que difiere el enrutamiento al canal configurado en la propia notificación. Puedes utilizar el método `to` al crear tu `SlackMessage` para configurar el canal dentro de la notificación.
- Una cadena que especifica el canal de Slack al que enviar la notificación, p. `#support-channel`.
- Una instancia `SlackRoute`, que te permite especificar un token OAuth y un nombre de canal, p. `SlackRoute::make($this->slack_channel, $this->slack_token)`. Este método debe usarse para enviar notificaciones a espacios de trabajo externos.

Por ejemplo, devolver `#support-channel` desde el método `routeNotificationForSlack` enviará la notificación al canal `#support-channel` en el espacio de trabajo asociado con el token OAuth del usuario de bot ubicado en el archivo de configuración `services.php` de tu aplicación:

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Notifications\Notification;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * Route notifications for the Slack channel.
     */
    public function routeNotificationForSlack(Notification $notification): mixed
    {
        return '#support-channel';
    }
}
```

<a id="notifying-external-slack-workspaces"></a>
### Notificación de espacios de trabajo externos de Slack

> **Nota:**
> Antes de enviar notificaciones a espacios de trabajo externos de Slack, tu aplicación de Slack debe ser [distribuida](#slack-app-distribution).

Por supuesto, a menudo querrás enviar notificaciones a los espacios de trabajo de Slack propiedad de los usuarios de tu aplicación. Para hacerlo, primero deberás obtener un token de Slack OAuth para el usuario. Afortunadamente, [Laravel Socialite](../socialite/) incluye un controlador de Slack que te permitirá autenticar fácilmente a los usuarios de tu aplicación con Slack y [obtener un token de bot](../socialite/#slack-bot-scopes).

Una vez que hayas obtenido el token del bot y lo hayas almacenado en la base de datos de tu aplicación, puedes utilizar el método `SlackRoute::make` para enrutar una notificación al espacio de trabajo del usuario. Además, es probable que tu aplicación deba ofrecer una oportunidad para que el usuario especifique a qué canal se deben enviar las notificaciones:

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Slack\SlackRoute;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * Route notifications for the Slack channel.
     */
    public function routeNotificationForSlack(Notification $notification): mixed
    {
        return SlackRoute::make($this->slack_channel, $this->slack_token);
    }
}
```

<a id="localizing-notifications"></a>
## Localización de notificaciones

Laravel te permite enviar notificaciones en una configuración regional distinta a la configuración regional actual de la solicitud HTTP, e incluso recordará esta configuración regional si la notificación está en cola.

Para lograr esto, la clase `Illuminate\Notifications\Notification` ofrece un método `locale` para configurar el idioma deseado. La aplicación cambiará a esta configuración regional cuando se evalúe la notificación y luego volverá a la configuración regional anterior cuando se complete la evaluación:

```php
$user->notify((new InvoicePaid($invoice))->locale('es'));
```

La localización de múltiples entidades notificables también se puede lograr a través de la fachada `Notification`:

```php
Notification::locale('es')->send(
    $users, new InvoicePaid($invoice)
);
```

<a id="user-preferred-locales"></a>
#### Configuraciones regionales preferidas del usuario

A veces, las aplicaciones almacenan la configuración regional preferida de cada usuario. Al implementar el contrato `HasLocalePreference` en tu modelo notificable, puedes indicarle a Laravel que use esta configuración regional almacenada al enviar una notificación:

```php
use Illuminate\Contracts\Translation\HasLocalePreference;

class User extends Model implements HasLocalePreference
{
    /**
     * Get the user's preferred locale.
     */
    public function preferredLocale(): string
    {
        return $this->locale;
    }
}
```

Una vez que hayas implementado la interfaz, Laravel utilizará automáticamente la configuración regional preferida al enviar notificaciones y mensajes por correo al modelo. Por lo tanto, no es necesario llamar al método `locale` cuando se utiliza esta interfaz:

```php
$user->notify(new InvoicePaid($invoice));
```

<a id="testing"></a>
## Pruebas

Puedes utilizar el método `fake` de la fachada `Notification` para evitar que se envíen notificaciones. Normalmente, el envío de notificaciones no está relacionado con el código que realmente estás probando. Lo más probable es que sea suficiente simplemente afirmar que Laravel recibió instrucciones de enviar una notificación determinada.

Después de llamar al método `fake` de la fachada `Notification`, puedes afirmar que se ordenó que las notificaciones se enviaran a los usuarios e incluso inspeccionar los datos que recibieron las notificaciones:

```php tab=Pest
<?php

use App\Notifications\OrderShipped;
use Illuminate\Support\Facades\Notification;

test('orders can be shipped', function () {
    Notification::fake();

    // Perform order shipping...

    // Assert that no notifications were sent...
    Notification::assertNothingSent();

    // Assert a notification was sent to the given users...
    Notification::assertSentTo(
        [$user], OrderShipped::class
    );

    // Assert a notification was not sent...
    Notification::assertNotSentTo(
        [$user], AnotherNotification::class
    );

    // Assert a notification was sent twice...
    Notification::assertSentTimes(WeeklyReminder::class, 2);

    // Assert that a notification was sent to a user exactly once...
    Notification::assertSentToOnce($user, OrderShipped::class);

    // Assert that a given number of notifications were sent...
    Notification::assertCount(3);
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use App\Notifications\OrderShipped;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_orders_can_be_shipped(): void
    {
        Notification::fake();

        // Perform order shipping...

        // Assert that no notifications were sent...
        Notification::assertNothingSent();

        // Assert a notification was sent to the given users...
        Notification::assertSentTo(
            [$user], OrderShipped::class
        );

        // Assert a notification was not sent...
        Notification::assertNotSentTo(
            [$user], AnotherNotification::class
        );

        // Assert a notification was sent twice...
        Notification::assertSentTimes(WeeklyReminder::class, 2);

        // Assert that a notification was sent to a user exactly once...
        Notification::assertSentToOnce($user, OrderShipped::class);

        // Assert that a given number of notifications were sent...
        Notification::assertCount(3);
    }
}
```

Puedes pasar una función anónima a los métodos `assertSentTo` o `assertNotSentTo` para afirmar que se envió una notificación que pasa una "prueba de veracidad" determinada. Si se envió al menos una notificación que pasa la prueba de veracidad dada, entonces la afirmación será exitosa:

```php
Notification::assertSentTo(
    $user,
    function (OrderShipped $notification, array $channels) use ($order) {
        return $notification->order->id === $order->id;
    }
);
```

Alternativamente, puedes pasar un array de valores de propiedad esperados como tercer argumento a `assertSentTo` o `assertNotSentTo`:

```php
Notification::assertSentTo($user, OrderShipped::class, ['order' => $order]);
```

Todas las propiedades especificadas deben coincidir. Los valores se comparan mediante igualdad estricta, mientras que los modelos de Eloquent se comparan mediante su método `is`. También puedes pasar un array de valores de propiedad esperados como segundo argumento de `assertSentOnDemand`.

<a id="testing-on-demand-notifications"></a>
#### Notificaciones bajo demanda

Si el código que estás probando envía [notificaciones bajo demanda](#on-demand-notifications), puedes probar que la notificación bajo demanda se envió mediante el método `assertSentOnDemand`:

```php
Notification::assertSentOnDemand(OrderShipped::class);
Notification::assertSentOnDemandOnce(OrderShipped::class);
```

Al pasar una función anónima como segundo argumento del método `assertSentOnDemand`, puedes determinar si se envió una notificación bajo demanda a la dirección de "ruta" correcta:

```php
Notification::assertSentOnDemand(
    OrderShipped::class,
    function (OrderShipped $notification, array $channels, object $notifiable) use ($user) {
        return $notifiable->routes['mail'] === $user->email;
    }
);
```

<a id="notification-events"></a>
## Eventos de notificación

<a id="notification-sending-event"></a>
#### Evento de envío de notificación

Cuando se está enviando una notificación, el sistema de notificaciones despacha el evento `Illuminate\Notifications\Events\NotificationSending`. Contiene la entidad "notificable" y la propia instancia de notificación. Puedes crear [listeners de eventos](../events/) para este evento dentro de tu aplicación:

```php
use Illuminate\Notifications\Events\NotificationSending;

class CheckNotificationStatus
{
    /**
     * Handle the event.
     */
    public function handle(NotificationSending $event): void
    {
        // ...
    }
}
```

La notificación no se enviará si un listener de eventos para el evento `NotificationSending` devuelve `false` desde su método `handle`:

```php
/**
 * Handle the event.
 */
public function handle(NotificationSending $event): bool
{
    return false;
}
```

Dentro de un listener de eventos, puedes acceder a las propiedades `notifiable`, `notification` y `channel` del evento para obtener más información sobre el destinatario de la notificación o la notificación misma:

```php
/**
 * Handle the event.
 */
public function handle(NotificationSending $event): void
{
    // $event->channel
    // $event->notifiable
    // $event->notification
}
```

<a id="notification-sent-event"></a>
#### Evento de notificación enviada

Cuando se envía una notificación, el sistema de notificación despacha el [evento](../events/) `Illuminate\Notifications\Events\NotificationSent`. Contiene la entidad "notificable" y la propia instancia de notificación. Puedes crear [listeners de eventos](../events/) para este evento dentro de tu aplicación:

```php
use Illuminate\Notifications\Events\NotificationSent;

class LogNotification
{
    /**
     * Handle the event.
     */
    public function handle(NotificationSent $event): void
    {
        // ...
    }
}
```

Dentro de un listener de eventos, puedes acceder a las propiedades `notifiable`, `notification`, `channel` y `response` del evento para obtener más información sobre el destinatario de la notificación o la notificación misma:

```php
/**
 * Handle the event.
 */
public function handle(NotificationSent $event): void
{
    // $event->channel
    // $event->notifiable
    // $event->notification
    // $event->response
}
```

<a id="custom-channels"></a>
## Canales personalizados

Laravel viene con varios canales de notificación, pero es posible que desees escribir tus propios controladores para enviar notificaciones a través de otros canales. Laravel lo hace simple. Para comenzar, define una clase que contenga un método `send`. El método debería recibir dos argumentos: `$notifiable` y `$notification`.

Dentro del método `send`, puedes llamar a métodos en la notificación para recuperar un objeto de mensaje comprendido por tu canal y luego enviar la notificación a la instancia `$notifiable` como desees:

```php
<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

class VoiceChannel
{
    /**
     * Send the given notification.
     */
    public function send(object $notifiable, Notification $notification): void
    {
        $message = $notification->toVoice($notifiable);

        // Send notification to the $notifiable instance...
    }
}
```

Una vez que se haya definido tu clase de canal de notificación, puedes devolver el nombre de clase del método `via` de cualquiera de tus notificaciones. En este ejemplo, el método `toVoice` de tu notificación puede devolver cualquier objeto que elijas para representar mensajes de voz. Por ejemplo, podrías definir tu propia clase `VoiceMessage` para representar estos mensajes:

```php
<?php

namespace App\Notifications;

use App\Notifications\Messages\VoiceMessage;
use App\Notifications\VoiceChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class InvoicePaid extends Notification
{
    use Queueable;

    /**
     * Get the notification channels.
     */
    public function via(object $notifiable): string
    {
        return VoiceChannel::class;
    }

    /**
     * Get the voice representation of the notification.
     */
    public function toVoice(object $notifiable): VoiceMessage
    {
        // ...
    }
}
```
