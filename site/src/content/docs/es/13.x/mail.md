---
title: "Correo"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
    - [Configuración](#configuration)
    - [Requisitos previos del controlador](#driver-prerequisites)
    - [Configuración de conmutación por error](#failover-configuration)
    - [Configuración de turnos por turnos](#round-robin-configuration)
- [Generando mensajes de correo](#generating-mailables)
- [Escribiendo mensajes de correo](#writing-mailables)
    - [Configuración del remitente](#configuring-the-sender)
    - [Configurando la Vista](#configuring-the-view)
    - [Ver datos](#view-data)
    - [Adjuntos](#attachments)
    - [Adjuntos en línea](#inline-attachments)
    - [Objetos adjuntables](#attachable-objects)
    - [Encabezados](#headers)
    - [Etiquetas y Metadatos](#tags-and-metadata)
    - [Personalizar el mensaje Symfony](#customizing-the-symfony-message)
- [Rebajas de correos](#markdown-mailables)
    - [Generando Markdown Mailables](#generating-markdown-mailables)
    - [Escribir mensajes de rebajas](#writing-markdown-messages)
    - [Personalizar los componentes](#customizing-the-components)
- [Enviando correo](#sending-mail)
    - [Correo en cola](#queueing-mail)
- [Representación de mensajes de correo](#rendering-mailables)
    - [Vista previa de mensajes de correo en el navegador](#previewing-mailables-in-the-browser)
- [Localización de mensajes de correo](#localizing-mailables)
- [Prueba](#testing-mailables)
    - [Prueba de contenido que se puede enviar por correo](#testing-mailable-content)
    - [Prueba de envío por correo](#testing-mailable-sending)
- [Correo y desarrollo local](#mail-and-local-development)
- [Eventos](#events)
- [Transportes personalizados](#custom-transports)
    - [Transportes Symfony adicionales](#additional-symfony-transports)

<a id="introduction"></a>
## Introducción

Enviar correo electrónico no tiene por qué ser complicado. Laravel proporciona una API de correo electrónico limpia y sencilla impulsada por el popular componente [Symfony Mailer](https://symfony.com/doc/current/mailer.html). Laravel y Symfony Mailer proporcionan controladores para enviar correo electrónico a través de SMTP, Cloudflare, Mailgun, Postmark, Resend, Amazon SES y `sendmail`, lo que le permite comenzar rápidamente a enviar correo a través de un servicio local o basado en la nube de su elección.

<a id="configuration"></a>
### Configuración

Los servicios de correo electrónico de Laravel se pueden configurar a través del archivo de configuración `config/mail.php` de su aplicación. Cada remitente de correo configurado dentro de este archivo puede tener su propia configuración única e incluso su propio "transporte" exclusivo, lo que permite que su aplicación utilice diferentes servicios de correo electrónico para enviar ciertos mensajes de correo electrónico. Por ejemplo, su aplicación podría usar Postmark para enviar correos electrónicos transaccionales mientras usa Amazon SES para enviar correos electrónicos masivos.

Dentro de su archivo de configuración `mail`, encontrará una matriz de configuración `mailers`. Esta matriz contiene una entrada de configuración de muestra para cada uno de los principales controladores/transportes de correo admitidos por Laravel, mientras que el valor de configuración `default` determina qué correo se utilizará de forma predeterminada cuando su aplicación necesite enviar un mensaje de correo electrónico.

<a id="driver-prerequisites"></a>
### Requisitos previos del conductor/transporte

Los controladores basados ​​en API, como Mailgun, Postmark y Resend, suelen ser más sencillos y rápidos que enviar correo a través de servidores SMTP. Siempre que sea posible, le recomendamos que utilice uno de estos controladores.

<a id="cloudflare-driver"></a>
#### Controlador de Cloudflare

Para utilizar el controlador Cloudflare, instale el cliente HTTP de Symfony a través de Composer:

```shell
composer require symfony/http-client
```

A continuación, deberá realizar dos cambios en el archivo de configuración `config/mail.php` de su aplicación. Primero, configure su correo predeterminado en `cloudflare`:

```php
'default' => env('MAIL_MAILER', 'cloudflare'),
```

En segundo lugar, agregue la siguiente matriz de configuración a su matriz de `mailers`:

```php
'cloudflare' => [
    'transport' => 'cloudflare',
],
```

Después de configurar el correo predeterminado de su aplicación, agregue las siguientes opciones a su archivo de configuración `config/services.php`:

```php
'cloudflare' => [
    'account_id' => env('CLOUDFLARE_ACCOUNT_ID'),
    'key' => env('CLOUDFLARE_KEY'),
],
```

<a id="mailgun-driver"></a>
#### Conductor de pistola de correo

Para utilizar el controlador Mailgun, instale el transporte Mailgun Mailer de Symfony a través de Composer:

```shell
composer require symfony/mailgun-mailer symfony/http-client
```

A continuación, deberá realizar dos cambios en el archivo de configuración `config/mail.php` de su aplicación. Primero, configure su correo predeterminado en `mailgun`:

```php
'default' => env('MAIL_MAILER', 'mailgun'),
```

En segundo lugar, agregue la siguiente matriz de configuración a su matriz de `mailers`:

```php
'mailgun' => [
    'transport' => 'mailgun',
    // 'client' => [
    //     'timeout' => 5,
    // ],
],
```

Después de configurar el correo predeterminado de su aplicación, agregue las siguientes opciones a su archivo de configuración `config/services.php`:

```php
'mailgun' => [
    'domain' => env('MAILGUN_DOMAIN'),
    'secret' => env('MAILGUN_SECRET'),
    'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
    'scheme' => 'https',
],
```

Si no está utilizando Estados Unidos [Mailgun región](https://documentation.mailgun.com/docs/mailgun/api-reference/api-overview#mailgun-regions), puede definir el punto final de su región en el archivo de configuración `services`:

```php
'mailgun' => [
    'domain' => env('MAILGUN_DOMAIN'),
    'secret' => env('MAILGUN_SECRET'),
    'endpoint' => env('MAILGUN_ENDPOINT', 'api.eu.mailgun.net'),
    'scheme' => 'https',
],
```

<a id="postmark-driver"></a>
#### Controlador de matasellos

Para utilizar el controlador [Postmark](https://postmarkapp.com/), instale el transporte Postmark Mailer de Symfony a través de Composer:

```shell
composer require symfony/postmark-mailer symfony/http-client
```

A continuación, configure la opción `default` en el archivo de configuración `config/mail.php` de su aplicación en `postmark`. Después de configurar el correo predeterminado de su aplicación, asegúrese de que su archivo de configuración `config/services.php` contenga las siguientes opciones:

```php
'postmark' => [
    'key' => env('POSTMARK_API_KEY'),
],
```

Si desea especificar el flujo de mensajes de matasellos que debe utilizar un remitente determinado, puede agregar la opción de configuración `message_stream_id` a la matriz de configuración del remitente. Esta matriz de configuración se puede encontrar en el archivo de configuración `config/mail.php` de su aplicación:

```php
'postmark' => [
    'transport' => 'postmark',
    'message_stream_id' => env('POSTMARK_MESSAGE_STREAM_ID'),
    // 'client' => [
    //     'timeout' => 5,
    // ],
],
```

De esta manera, también podrá configurar varios sobres postales con matasellos con diferentes flujos de mensajes.

<a id="resend-driver"></a>
#### Reenviar controlador

Para utilizar el controlador [Resend](https://resend.com/), instale el SDK PHP de Resend a través de Composer:

```shell
composer require resend/resend-php
```

A continuación, configure la opción `default` en el archivo de configuración `config/mail.php` de su aplicación en `resend`. Después de configurar el correo predeterminado de su aplicación, asegúrese de que su archivo de configuración `config/services.php` contenga las siguientes opciones:

```php
'resend' => [
    'key' => env('RESEND_API_KEY'),
],
```

<a id="ses-driver"></a>
#### Conductor SES

Para utilizar el controlador de Amazon SES, primero debe instalar el SDK de Amazon AWS para PHP. Puede instalar esta biblioteca a través del administrador de paquetes de Composer:

```shell
composer require aws/aws-sdk-php
```

A continuación, configure la opción `default` en su archivo de configuración `config/mail.php` en `ses` y verifique que su archivo de configuración `config/services.php` contenga las siguientes opciones:

```php
'ses' => [
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
],
```

Para utilizar AWS [credenciales temporales](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp_use-resources.html) a través de un token de sesión, puede agregar una clave `token` a la configuración SES de su aplicación:

```php
'ses' => [
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    'token' => env('AWS_SESSION_TOKEN'),
],
```

Para interactuar con las [funciones de administración de suscripciones](https://docs.aws.amazon.com/ses/latest/dg/sending-email-subscription-management.html) de SES, puede devolver el encabezado `X-Ses-List-Management-Options` en la matriz devuelta por el método [headers](#headers) de un mensaje de correo:

```php
/**
 * Obtener los encabezados del mensaje.
 */
public function headers(): Headers
{
    return new Headers(
        text: [
            'X-Ses-List-Management-Options' => 'contactListName=MyContactList;topicName=MyTopic',
        ],
    );
}
```

Para enviar un correo electrónico a través de un SES [tenant](https://docs.aws.amazon.com/ses/latest/dg/tenants.html), puede devolver el encabezado `X-Ses-Tenant-Name` del método `headers`. Laravel pasará el valor del encabezado como la opción `TenantName` a SES al enviar el mensaje:

```php
public function headers(): Headers
{
    return new Headers(
        text: [
            'X-Ses-Tenant-Name' => 'tenant-id',
        ],
    );
}
```

Si desea definir [opciones adicionales](https://docs.aws.amazon.com/aws-sdk-php/v3/api/api-sesv2-2019-09-27.html#sendemail) que Laravel debe pasar al método `SendEmail` del SDK de AWS al enviar un correo electrónico, puede definir una matriz `options` dentro de su configuración `ses`:

```php
'ses' => [
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    'options' => [
        'ConfigurationSetName' => 'MyConfigurationSet',
        'EmailTags' => [
            ['Name' => 'foo', 'Value' => 'bar'],
        ],
    ],
],
```

<a id="failover-configuration"></a>
### Configuración de conmutación por error

A veces, un servicio externo que haya configurado para enviar el correo de su aplicación puede no funcionar. En estos casos, puede resultar útil definir una o más configuraciones de entrega de correo de respaldo que se utilizarán en caso de que su controlador de entrega principal no funcione.

Para lograr esto, debe definir un envío de correo dentro del archivo de configuración `mail` de su aplicación que utilice el transporte `failover`. La matriz de configuración para el correo `failover` de su aplicación debe contener una matriz de `mailers` que haga referencia al orden en el que se deben elegir los correos configurados para su entrega:

```php
'mailers' => [
    'failover' => [
        'transport' => 'failover',
        'mailers' => [
            'postmark',
            'mailgun',
            'sendmail',
        ],
        'retry_after' => 60,
    ],

    // ...
],
```

Una vez que haya configurado un correo que utiliza el transporte `failover`, deberá configurar el correo de conmutación por error como su correo predeterminado en el archivo `.env` de su aplicación para utilizar la funcionalidad de conmutación por error:

```ini
MAIL_MAILER=failover
```

<a id="round-robin-configuration"></a>
### Configuración por turnos

El transporte `roundrobin` le permite distribuir su carga de trabajo de correo entre varios remitentes. Para comenzar, defina un envío de correo dentro del archivo de configuración `mail` de su aplicación que utilice el transporte `roundrobin`. La matriz de configuración para el correo `roundrobin` de su aplicación debe contener una matriz de `mailers` que haga referencia a qué correos configurados se deben usar para la entrega:

```php
'mailers' => [
    'roundrobin' => [
        'transport' => 'roundrobin',
        'mailers' => [
            'ses',
            'postmark',
        ],
        'retry_after' => 60,
    ],

    // ...
],
```

Una vez que se haya definido su remitente por turnos, debe configurar este remitente como el predeterminado utilizado por su aplicación especificando su nombre como el valor de la clave de configuración `default` dentro del archivo de configuración `mail` de su aplicación:

```php
'default' => env('MAIL_MAILER', 'roundrobin'),
```

El transporte por turnos selecciona un correo aleatorio de la lista de correos configurados y luego cambia al siguiente correo disponible para cada correo electrónico posterior. A diferencia del transporte `failover`, que ayuda a lograr *[alta disponibilidad](https://en.wikipedia.org/wiki/High_availability)*, el transporte `roundrobin` proporciona *[equilibrio de carga](https://en.wikipedia.org/wiki/Load_balancing_(computing))*.

<a id="generating-mailables"></a>
## Generando correos electrónicos

Al crear aplicaciones Laravel, cada tipo de correo electrónico enviado por su aplicación se representa como una clase "enviable por correo". Estas clases se almacenan en el directorio `app/Mail`. No se preocupe si no ve este directorio en su aplicación, ya que se generará cuando cree su primera clase que se puede enviar por correo usando el comando `make:mail` Artisan:

```shell
php artisan make:mail OrderShipped
```

<a id="writing-mailables"></a>
## Escribir mensajes por correo

Una vez que haya generado una clase que se pueda enviar por correo, ábrala para que podamos explorar su contenido. La configuración de la clase que se puede enviar por correo se realiza mediante varios métodos, incluidos los métodos `envelope`, `content` y `attachments`.

El método `envelope` devuelve un objeto `Illuminate\Mail\Mailables\Envelope` que define el asunto y, en ocasiones, los destinatarios del mensaje. El método `content` devuelve un objeto `Illuminate\Mail\Mailables\Content` que define la [plantilla Blade](../blade/) que se utilizará para generar el contenido del mensaje.

<a id="configuring-the-sender"></a>
### Configurando el remitente

<a id="using-the-envelope"></a>
#### Usando el sobre

Primero, exploremos la configuración del remitente del correo electrónico. O, en otras palabras, de quién será "de" el correo electrónico. Hay dos formas de configurar el remitente. Primero, puede especificar la dirección "de" en el sobre de su mensaje:

```php
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Envelope;

/**
 * Obtener el sobre del mensaje.
 */
public function envelope(): Envelope
{
    return new Envelope(
        from: new Address('jeffrey@example.com', 'Jeffrey Way'),
        subject: 'Order Shipped',
    );
}
```

Si lo desea, también puede especificar una dirección `replyTo`:

```php
return new Envelope(
    from: new Address('jeffrey@example.com', 'Jeffrey Way'),
    replyTo: [
        new Address('taylor@example.com', 'Taylor Otwell'),
    ],
    subject: 'Order Shipped',
);
```

<a id="using-a-global-from-address"></a>
#### Usando una dirección global `from`

Sin embargo, si su aplicación utiliza la misma dirección "de" para todos sus correos electrónicos, puede resultar engorroso agregarla a cada clase de correo que genere. En su lugar, puede especificar una dirección "de" global en su archivo de configuración `config/mail.php`. Esta dirección se utilizará si no se especifica ninguna otra dirección "de" dentro de la clase de envío por correo:

```php
'from' => [
    'address' => env('MAIL_FROM_ADDRESS', 'hello@example.com'),
    'name' => env('MAIL_FROM_NAME', 'Example'),
],
```

Además, puede definir una dirección global "reply_to" dentro de su archivo de configuración `config/mail.php`:

```php
'reply_to' => [
    'address' => 'example@example.com',
    'name' => 'App Name',
],
```

<a id="configuring-the-view"></a>
### Configurando la vista

Dentro del método `content` de una clase que se puede enviar por correo, puede definir el `view` o qué plantilla se debe utilizar al representar el contenido del correo electrónico. Dado que cada correo electrónico normalmente utiliza una [plantilla Blade](../blade/) para representar su contenido, usted tiene todo el poder y la conveniencia del motor de plantillas Blade al crear el HTML de su correo electrónico:

```php
/**
 * Obtener la definición del contenido del mensaje.
 */
public function content(): Content
{
    return new Content(
        view: 'mail.orders.shipped',
    );
}
```

> **Nota:**
> Es posible que desee crear un directorio `resources/views/mail` para albergar todas sus plantillas de correo electrónico; sin embargo, usted es libre de colocarlos donde desee dentro de su directorio `resources/views`.

<a id="plain-text-emails"></a>
#### Correos electrónicos de texto sin formato

Si desea definir una versión de texto sin formato de su correo electrónico, puede especificar la plantilla de texto sin formato al crear la definición `Content` del mensaje. Al igual que el parámetro `view`, el parámetro `text` debe ser un nombre de plantilla que se utilizará para representar el contenido del correo electrónico. Eres libre de definir una versión HTML y de texto sin formato de tu mensaje:

```php
/**
 * Obtener la definición del contenido del mensaje.
 */
public function content(): Content
{
    return new Content(
        view: 'mail.orders.shipped',
        text: 'mail.orders.shipped-text'
    );
}
```

Para mayor claridad, el parámetro `html` se puede utilizar como alias del parámetro `view`:

```php
return new Content(
    html: 'mail.orders.shipped',
    text: 'mail.orders.shipped-text'
);
```

<a id="view-data"></a>
### Ver datos

<a id="via-public-properties"></a>
#### A través de propiedades públicas

Normalmente, querrás pasar algunos datos a tu vista que puedas utilizar al representar el HTML del correo electrónico. Hay dos formas de hacer que los datos estén disponibles para su vista. Primero, cualquier propiedad pública definida en su clase que se puede enviar por correo estará automáticamente disponible para la vista. Entonces, por ejemplo, puede pasar datos al constructor de su clase que se puede enviar por correo y establecer esos datos en propiedades públicas definidas en la clase:

```php
<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Queue\SerializesModels;

class OrderShipped extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Crear una nueva instancia del mensaje.
     */
    public function __construct(
        public Order $order,
    ) {}

    /**
     * Obtener la definición del contenido del mensaje.
     */
    public function content(): Content
    {
        return new Content(
            view: 'mail.orders.shipped',
        );
    }
}
```

Una vez que los datos se hayan configurado en una propiedad pública, estarán disponibles automáticamente en su vista, por lo que podrá acceder a ellos como accedería a cualquier otro dato en sus plantillas Blade:

```blade
<div>
    Price: {{ $order->price }}
</div>
```

<a id="via-the-with-parameter"></a>
#### A través del parámetro `with`:

Si desea personalizar el formato de los datos de su correo electrónico antes de enviarlos a la plantilla, puede pasar manualmente sus datos a la vista a través del parámetro `with` de la definición `Content`. Normalmente, seguirás pasando datos a través del constructor de la clase que se puede enviar por correo; sin embargo, debe configurar estos datos en las propiedades `protected` o `private` para que los datos no estén disponibles automáticamente para la plantilla:

```php
<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Queue\SerializesModels;

class OrderShipped extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Crear una nueva instancia del mensaje.
     */
    public function __construct(
        protected Order $order,
    ) {}

    /**
     * Obtener la definición del contenido del mensaje.
     */
    public function content(): Content
    {
        return new Content(
            view: 'mail.orders.shipped',
            with: [
                'orderName' => $this->order->name,
                'orderPrice' => $this->order->price,
            ],
        );
    }
}
```

Una vez que los datos se hayan pasado a través del parámetro `with`, estarán disponibles automáticamente en su vista, por lo que podrá acceder a ellos como accedería a cualquier otro dato en sus plantillas Blade:

```blade
<div>
    Price: {{ $orderPrice }}
</div>
```

<a id="attachments"></a>
### Adjuntos

Para agregar archivos adjuntos a un correo electrónico, agregará archivos adjuntos a la matriz devuelta por el método `attachments` del mensaje. Primero, puede agregar un archivo adjunto proporcionando una ruta de archivo al método `fromPath` proporcionado por la clase `Attachment`:

```php
use Illuminate\Mail\Mailables\Attachment;

/**
 * Obtener los archivos adjuntos del mensaje.
 *
 * @return array<int, \Illuminate\Mail\Mailables\Attachment>
 */
public function attachments(): array
{
    return [
        Attachment::fromPath('/path/to/file'),
    ];
}
```

Al adjuntar archivos a un mensaje, también puede especificar el nombre para mostrar y/o el tipo MIME para el archivo adjunto utilizando los métodos `as` y `withMime`:

```php
/**
 * Obtener los archivos adjuntos del mensaje.
 *
 * @return array<int, \Illuminate\Mail\Mailables\Attachment>
 */
public function attachments(): array
{
    return [
        Attachment::fromPath('/path/to/file')
            ->as('name.pdf')
            ->withMime('application/pdf'),
    ];
}
```

<a id="attaching-files-from-disk"></a>
#### Adjuntar archivos desde el disco

Si ha almacenado un archivo en uno de sus [discos del sistema de archivos](../filesystem/), puede adjuntarlo al correo electrónico utilizando el método de archivo adjunto `fromStorage`:

```php
/**
 * Obtener los archivos adjuntos del mensaje.
 *
 * @return array<int, \Illuminate\Mail\Mailables\Attachment>
 */
public function attachments(): array
{
    return [
        Attachment::fromStorage('/path/to/file'),
    ];
}
```

Por supuesto, también puedes especificar el nombre del archivo adjunto y el tipo MIME:

```php
/**
 * Obtener los archivos adjuntos del mensaje.
 *
 * @return array<int, \Illuminate\Mail\Mailables\Attachment>
 */
public function attachments(): array
{
    return [
        Attachment::fromStorage('/path/to/file')
            ->as('name.pdf')
            ->withMime('application/pdf'),
    ];
}
```

Se puede utilizar el método `fromStorageDisk` si necesita especificar un disco de almacenamiento distinto al disco predeterminado:

```php
/**
 * Obtener los archivos adjuntos del mensaje.
 *
 * @return array<int, \Illuminate\Mail\Mailables\Attachment>
 */
public function attachments(): array
{
    return [
        Attachment::fromStorageDisk('s3', '/path/to/file')
            ->as('name.pdf')
            ->withMime('application/pdf'),
    ];
}
```

<a id="raw-data-attachments"></a>
#### Datos adjuntos sin procesar

El método de archivo adjunto `fromData` se puede utilizar para adjuntar una cadena sin formato de bytes como archivo adjunto. Por ejemplo, puede utilizar este método si ha generado un PDF en la memoria y desea adjuntarlo al correo electrónico sin escribirlo en el disco. El método `fromData` acepta una función anónima que resuelve los bytes de datos sin procesar, así como el nombre que se debe asignar al archivo adjunto:

```php
/**
 * Obtener los archivos adjuntos del mensaje.
 *
 * @return array<int, \Illuminate\Mail\Mailables\Attachment>
 */
public function attachments(): array
{
    return [
        Attachment::fromData(fn () => $this->pdf, 'Report.pdf')
            ->withMime('application/pdf'),
    ];
}
```

<a id="inline-attachments"></a>
### Archivos adjuntos en línea

Incrustar imágenes en línea en sus correos electrónicos suele ser engorroso; sin embargo, Laravel proporciona una manera conveniente de adjuntar imágenes a sus correos electrónicos. Para incrustar una imagen en línea, utilice el método `embed` en la variable `$message` dentro de su plantilla de correo electrónico. Laravel automáticamente pone la variable `$message` a disposición de todas sus plantillas de correo electrónico, por lo que no necesita preocuparse por pasarla manualmente:

```blade
<body>
    Here is an image:

    <img src="{{ $message->embed($pathToImage) }}">
</body>
```

> **Advertencia:**
> La variable `$message` no está disponible en las plantillas de mensajes de texto sin formato ya que los mensajes de texto sin formato no utilizan archivos adjuntos en línea.

<a id="embedding-raw-data-attachments"></a>
#### Incrustar archivos adjuntos de datos sin procesar

Si ya tiene una cadena de datos de imagen sin procesar que desea incrustar en una plantilla de correo electrónico, puede llamar al método `embedData` en la variable `$message`. Al llamar al método `embedData`, deberá proporcionar un nombre de archivo que se debe asignar a la imagen incrustada:

```blade
<body>
    Here is an image from raw data:

    <img src="{{ $message->embedData($data, 'example-image.jpg') }}">
</body>
```

<a id="attachable-objects"></a>
### Objetos adjuntables

Si bien adjuntar archivos a mensajes a través de rutas de cadena simples suele ser suficiente, en muchos casos las entidades adjuntables dentro de su aplicación están representadas por clases. Por ejemplo, si su aplicación adjunta una foto a un mensaje, su aplicación también puede tener un modelo `Photo` que represente esa foto. Cuando ese sea el caso, ¿no sería conveniente simplemente pasar el modelo `Photo` al método `attach`? Los objetos acoplables le permiten hacer precisamente eso.

Para comenzar, implemente la interfaz `Illuminate\Contracts\Mail\Attachable` en el objeto que se podrá adjuntar a los mensajes. Esta interfaz dicta que su clase define un método `toMailAttachment` que devuelve una instancia de `Illuminate\Mail\Attachment`:

```php
<?php

namespace App\Models;

use Illuminate\Contracts\Mail\Attachable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Mail\Attachment;

class Photo extends Model implements Attachable
{
    /**
     * Obtener la representación adjuntable del modelo.
     */
    public function toMailAttachment(): Attachment
    {
        return Attachment::fromPath('/path/to/file');
    }
}
```

Una vez que haya definido su objeto adjuntable, puede devolver una instancia de ese objeto desde el método `attachments` al crear un mensaje de correo electrónico:

```php
/**
 * Obtener los archivos adjuntos del mensaje.
 *
 * @return array<int, \Illuminate\Mail\Mailables\Attachment>
 */
public function attachments(): array
{
    return [$this->photo];
}
```

Por supuesto, los datos adjuntos pueden almacenarse en un servicio de almacenamiento de archivos remoto como Amazon S3. Por lo tanto, Laravel también le permite generar instancias de archivos adjuntos a partir de datos almacenados en uno de los [discos del sistema de archivos](../filesystem/):

```php
// Crear un archivo adjunto a partir de un archivo en el disk predeterminado...
return Attachment::fromStorage($this->path);

// Crear un archivo adjunto a partir de un archivo en un disk específico...
return Attachment::fromStorageDisk('backblaze', $this->path);
```

Además, puede crear instancias de archivos adjuntos a través de datos que tenga en la memoria. Para lograr esto, proporcione una función anónima al método `fromData`. La función anónima debe devolver los datos sin procesar que representan el archivo adjunto:

```php
return Attachment::fromData(fn () => $this->content, 'Photo Name');
```

Laravel también proporciona métodos adicionales que puede utilizar para personalizar sus archivos adjuntos. Por ejemplo, puede utilizar los métodos `as` y `withMime` para personalizar el nombre del archivo y el tipo MIME:

```php
return Attachment::fromPath('/path/to/file')
    ->as('Photo Name')
    ->withMime('image/jpeg');
```

<a id="headers"></a>
### Encabezados

A veces es posible que necesites adjuntar encabezados adicionales al mensaje saliente. Por ejemplo, es posible que necesite configurar un `Message-Id` personalizado u otros encabezados de texto arbitrarios.

Para lograr esto, defina un método `headers` en su correo. El método `headers` debería devolver una instancia de `Illuminate\Mail\Mailables\Headers`. Esta clase acepta los parámetros `messageId`, `references` y `text`. Por supuesto, puede proporcionar sólo los parámetros que necesita para su mensaje en particular:

```php
use Illuminate\Mail\Mailables\Headers;

/**
 * Obtener los encabezados del mensaje.
 */
public function headers(): Headers
{
    return new Headers(
        messageId: 'custom-message-id@example.com',
        references: ['previous-message@example.com'],
        text: [
            'X-Custom-Header' => 'Custom Value',
        ],
    );
}
```

<a id="tags-and-metadata"></a>
### Etiquetas y metadatos

Algunos proveedores de correo electrónico de terceros, como Mailgun y Postmark, admiten "etiquetas" y "metadatos" de mensajes, que pueden usarse para agrupar y rastrear los correos electrónicos enviados por su aplicación. Puede agregar etiquetas y metadatos a un mensaje de correo electrónico a través de su definición `Envelope`:

```php
use Illuminate\Mail\Mailables\Envelope;

/**
 * Obtener el sobre del mensaje.
 *
 * @return \Illuminate\Mail\Mailables\Envelope
 */
public function envelope(): Envelope
{
    return new Envelope(
        subject: 'Order Shipped',
        tags: ['shipment'],
        metadata: [
            'order_id' => $this->order->id,
        ],
    );
}
```

Si su aplicación utiliza el controlador Mailgun, puede consultar la documentación de Mailgun para obtener más información sobre [tags](https://documentation.mailgun.com/docs/mailgun/user-manual/tracking-messages/#tags) y [metadata](https://documentation.mailgun.com/docs/mailgun/user-manual/sending-messages/#attaching-metadata-to-messages). Asimismo, también se puede consultar la documentación de Matasellos para obtener más información sobre su soporte para [tags](https://postmarkapp.com/blog/tags-support-for-smtp) y [metadata](https://postmarkapp.com/support/article/1125-custom-metadata-faq).

Si su aplicación utiliza Amazon SES para enviar correos electrónicos, debe utilizar el método `metadata` para adjuntar [SES "tags"](https://docs.aws.amazon.com/ses/latest/APIReference/API_MessageTag.html) al mensaje.

<a id="customizing-the-symfony-message"></a>
### Personalizando el mensaje de Symfony

Las capacidades de correo de Laravel están impulsadas por Symfony Mailer. Laravel te permite registrar devoluciones de llamadas personalizadas que se invocarán con la instancia de Symfony Message antes de enviar el mensaje. Esto le brinda la oportunidad de personalizar profundamente el mensaje antes de enviarlo. Para lograr esto, defina un parámetro `using` en su definición `Envelope`:

```php
use Illuminate\Mail\Mailables\Envelope;
use Symfony\Component\Mime\Email;

/**
 * Obtener el sobre del mensaje.
 */
public function envelope(): Envelope
{
    return new Envelope(
        subject: 'Order Shipped',
        using: [
            function (Email $message) {
                // ...
            },
        ]
    );
}
```

<a id="markdown-mailables"></a>
## Envíos de rebajas

Los mensajes por correo Markdown le permiten aprovechar las plantillas y componentes prediseñados de [notificaciones por correo](../notifications/#mail-notifications) en sus mensajes por correo. Dado que los mensajes están escritos en Markdown, Laravel puede generar hermosas plantillas HTML responsivas para los mensajes y al mismo tiempo genera automáticamente una contraparte de texto sin formato.

<a id="generating-markdown-mailables"></a>
### Generando mensajes de descuento por correo

Para generar un mailable con una plantilla de Markdown correspondiente, puede usar la opción `--markdown` del comando `make:mail` Artisan:

```shell
php artisan make:mail OrderShipped --markdown=mail.orders.shipped
```

Luego, al configurar la definición `Content` que se puede enviar por correo dentro de su método `content`, use el parámetro `markdown` en lugar del parámetro `view`:

```php
use Illuminate\Mail\Mailables\Content;

/**
 * Obtener la definición del contenido del mensaje.
 */
public function content(): Content
{
    return new Content(
        markdown: 'mail.orders.shipped',
        with: [
            'url' => $this->orderUrl,
        ],
    );
}
```

<a id="writing-markdown-messages"></a>
### Escribir mensajes de rebajas

Los correos electrónicos de Markdown utilizan una combinación de componentes Blade y sintaxis de Markdown que le permiten construir fácilmente mensajes de correo mientras aprovecha los componentes de interfaz de usuario de correo electrónico prediseñados de Laravel:

```blade
<x-mail::message>
# Order Shipped

Your order has been shipped!

<x-mail::button :url="$url">
View Order
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
```

> **Nota:**
> No utilice demasiada sangría al escribir correos electrónicos de Markdown. Según los estándares de Markdown, los analizadores de Markdown representarán el contenido sangrado como bloques de código.

<a id="button-component"></a>
#### Componente de botón

El componente del botón representa un enlace de botón centrado. El componente acepta dos argumentos, un `url` y un `color` opcional. Los colores admitidos son `primary`, `success` y `error`. Puede agregar tantos componentes de botón a un mensaje como desee:

```blade
<x-mail::button :url="$url" color="success">
View Order
</x-mail::button>
```

<a id="panel-component"></a>
#### Componente del panel

El componente del panel representa el bloque de texto dado en un panel que tiene un color de fondo ligeramente diferente al del resto del mensaje. Esto le permite llamar la atención sobre un bloque de texto determinado:

```blade
<x-mail::panel>
This is the panel content.
</x-mail::panel>
```

<a id="table-component"></a>
#### Componente de tabla

El componente de tabla le permite transformar una tabla Markdown en una tabla HTML. El componente acepta la tabla Markdown como contenido. La alineación de columnas de la tabla se admite mediante la sintaxis de alineación de tabla Markdown predeterminada:

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

Puede exportar todos los componentes de correo de Markdown a su propia aplicación para personalizarlos. Para exportar los componentes, utilice el comando `vendor:publish` Artisan para publicar la etiqueta de activo `laravel-mail`:

```shell
php artisan vendor:publish --tag=laravel-mail
```

Este comando publicará los componentes de correo de Markdown en el directorio `resources/views/vendor/mail`. El directorio `mail` contendrá un directorio `html` y un directorio `text`, cada uno con sus respectivas representaciones de cada componente disponible. Eres libre de personalizar estos componentes como quieras.

<a id="customizing-the-css"></a>
#### Personalizando el CSS

Después de exportar los componentes, el directorio `resources/views/vendor/mail/html/themes` contendrá un archivo `default.css`. Puede personalizar el CSS en este archivo y sus estilos se convertirán automáticamente en estilos CSS en línea dentro de las representaciones HTML de sus mensajes de correo Markdown.

Si desea crear un tema completamente nuevo para los componentes Markdown de Laravel, puede colocar un archivo CSS en el directorio `html/themes`. Después de nombrar y guardar su archivo CSS, actualice la opción `theme` del archivo de configuración `config/mail.php` de su aplicación para que coincida con el nombre de su nuevo tema.

Para personalizar el tema de un correo individual, puede configurar la propiedad `$theme` de la clase de correo con el nombre del tema que se debe utilizar al enviar ese correo.

<a id="sending-mail"></a>
## Enviando correo

Para enviar un mensaje, utilice el método `to` en el `Mail` [facade](../facades/). El método `to` acepta una dirección de correo electrónico, una instancia de usuario o una colección de usuarios. Si pasa un objeto o una colección de objetos, el remitente utilizará automáticamente sus propiedades `email` y `name` al determinar los destinatarios del correo electrónico, así que asegúrese de que estos atributos estén disponibles en sus objetos. Una vez que haya especificado sus destinatarios, puede pasar una instancia de su clase de envío por correo al método `send`:

```php
<?php

namespace App\Http\Controllers;

use App\Mail\OrderShipped;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class OrderShipmentController extends Controller
{
    /**
     * Enviar el pedido indicado.
     */
    public function store(Request $request): RedirectResponse
    {
        $order = Order::findOrFail($request->order_id);

        // Ship the order...

        Mail::to($request->user())->send(new OrderShipped($order));

        return redirect('/orders');
    }
}
```

No está limitado a especificar simplemente los destinatarios "a" al enviar un mensaje. Eres libre de configurar destinatarios "para", "cc" y "cco" encadenando sus respectivos métodos:

```php
Mail::to($request->user())
    ->cc($moreUsers)
    ->bcc($evenMoreUsers)
    ->send(new OrderShipped($order));
```

<a id="looping-over-recipients"></a>
#### Recorriendo los destinatarios

Ocasionalmente, es posible que necesites enviar un correo a una lista de destinatarios iterando sobre una serie de destinatarios/direcciones de correo electrónico. Sin embargo, dado que el método `to` agrega direcciones de correo electrónico a la lista de destinatarios del envío por correo, cada iteración del ciclo enviará otro correo electrónico a cada destinatario anterior. Por lo tanto, siempre debes volver a crear la instancia que se puede enviar por correo para cada destinatario:

```php
foreach (['taylor@example.com', 'dries@example.com'] as $recipient) {
    Mail::to($recipient)->send(new OrderShipped($order));
}
```

<a id="sending-mail-via-a-specific-mailer"></a>
#### Envío de correo a través de un correo específico

De forma predeterminada, Laravel enviará correos electrónicos utilizando el programa de correo configurado como el programa de correo `default` en el archivo de configuración `mail` de su aplicación. Sin embargo, puede utilizar el método `mailer` para enviar un mensaje utilizando una configuración de correo específica:

```php
Mail::mailer('postmark')
    ->to($request->user())
    ->send(new OrderShipped($order));
```

<a id="queueing-mail"></a>
### Correo en cola

<a id="queueing-a-mail-message"></a>
#### Poner en cola un mensaje de correo

Dado que el envío de mensajes de correo electrónico puede afectar negativamente el tiempo de respuesta de su aplicación, muchos desarrolladores optan por poner en cola los mensajes de correo electrónico para enviarlos en segundo plano. Laravel hace esto fácil usando su [cola unificada API](../queues/). Para poner en cola un mensaje de correo, utilice el método `queue` en la fachada `Mail` después de especificar los destinatarios del mensaje:

```php
Mail::to($request->user())
    ->cc($moreUsers)
    ->bcc($evenMoreUsers)
    ->queue(new OrderShipped($order));
```

Este método se encargará automáticamente de enviar un trabajo a la cola para que el mensaje se envíe en segundo plano. Deberá [configurar sus colas](../queues/) antes de utilizar esta función.

<a id="delayed-message-queueing"></a>
#### Cola de mensajes retrasada

Si desea retrasar la entrega de un mensaje de correo electrónico en cola, puede utilizar el método `later`. Como primer argumento, el método `later` acepta una instancia `DateTime` que indica cuándo se debe enviar el mensaje:

```php
Mail::to($request->user())
    ->cc($moreUsers)
    ->bcc($evenMoreUsers)
    ->later(now()->plus(minutes: 10), new OrderShipped($order));
```

<a id="pushing-to-specific-queues"></a>
#### Empujando a colas específicas

Dado que todas las clases que se pueden enviar por correo generadas con el comando `make:mail` utilizan el rasgo `Illuminate\Bus\Queueable`, puede llamar a los métodos `onQueue` y `onConnection` en cualquier instancia de clase que se puede enviar por correo, lo que le permite especificar la conexión y el nombre de la cola para el mensaje:

```php
$message = (new OrderShipped($order))
    ->onConnection('sqs')
    ->onQueue('emails');

Mail::to($request->user())
    ->cc($moreUsers)
    ->bcc($evenMoreUsers)
    ->queue($message);
```

Alternativamente, puede especificar la conexión y la cola usando los atributos `Connection` y `Queue` en la clase que se puede enviar por correo:

```php
use Illuminate\Queue\Attributes\Connection;
use Illuminate\Queue\Attributes\Queue;

#[Connection('sqs')]
#[Queue('emails')]
class OrderShipped extends Mailable
{
    // ...
}
```

<a id="queueing-by-default"></a>
#### Cola por defecto

Si tiene clases que se pueden enviar por correo y desea que siempre estén en cola, puede implementar el contrato `ShouldQueue` en la clase. Ahora, incluso si llama al método `send` al enviar el correo, el envío por correo seguirá estando en cola ya que implementa el contrato:

```php
use Illuminate\Contracts\Queue\ShouldQueue;

class OrderShipped extends Mailable implements ShouldQueue
{
    // ...
}
```

<a id="queued-mailables-and-database-transactions"></a>
#### Envíos de correo en cola y transacciones de bases de datos

Cuando los mensajes de correo en cola se envían dentro de transacciones de la base de datos, la cola puede procesarlos antes de que se haya confirmado la transacción de la base de datos. Cuando esto sucede, es posible que las actualizaciones que haya realizado en los modelos o registros de la base de datos durante la transacción de la base de datos aún no se reflejen en la base de datos. Además, es posible que cualquier modelo o registro de base de datos creado dentro de la transacción no exista en la base de datos. Si su envío por correo depende de estos modelos, pueden ocurrir errores inesperados cuando se procesa el trabajo que envía el envío por correo en cola.

Si la opción de configuración `after_commit` de su conexión de cola está configurada en `false`, aún puede indicar que se debe enviar un correo en cola en particular después de que se hayan confirmado todas las transacciones de la base de datos abierta llamando al método `afterCommit` al enviar el mensaje de correo:

```php
Mail::to($request->user())->send(
    (new OrderShipped($order))->afterCommit()
);
```

Alternativamente, puedes llamar al método `afterCommit` desde el constructor de tu correo:

```php
<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OrderShipped extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * Crear una nueva instancia del mensaje.
     */
    public function __construct()
    {
        $this->afterCommit();
    }
}
```

> **Nota:**
> Para obtener más información sobre cómo solucionar estos problemas, revise la documentación sobre [trabajos en cola y transacciones de bases de datos](../queues/#jobs-and-database-transactions).

<a id="queued-email-failures"></a>
#### Errores de correo electrónico en cola

Cuando falla un correo electrónico en cola, se invocará el método `failed` en la clase que se puede enviar por correo en cola si se ha definido. La instancia `Throwable` que provocó que fallara el correo electrónico en cola se pasará al método `failed`:

```php
<?php

namespace App\Mail;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Throwable;

class OrderDelayed extends Mailable implements ShouldQueue
{
    use SerializesModels;

    /**
     * Gestionar el fallo de un correo en cola.
     */
    public function failed(Throwable $exception): void
    {
        // ...
    }
}
```

<a id="rendering-mailables"></a>
## Representación de mensajes por correo

A veces es posible que desees capturar el contenido HTML de un correo sin enviarlo. Para lograr esto, puede llamar al método `render` del envío por correo. Este método devolverá el contenido HTML evaluado del envío por correo como una cadena:

```php
use App\Mail\InvoicePaid;
use App\Models\Invoice;

$invoice = Invoice::find(1);

return (new InvoicePaid($invoice))->render();
```

<a id="previewing-mailables-in-the-browser"></a>
### Vista previa de mensajes de correo en el navegador

Al diseñar una plantilla de envío por correo, es conveniente obtener una vista previa rápida del envío por correo renderizado en su navegador como una plantilla Blade típica. Por esta razón, Laravel le permite devolver cualquier envío por correo directamente desde una función anónima de ruta o un controlador. Cuando se devuelve un correo, se representará y mostrará en el navegador, lo que le permitirá obtener una vista previa rápida de su diseño sin necesidad de enviarlo a una dirección de correo electrónico real:

```php
Route::get('/mailable', function () {
    $invoice = App\Models\Invoice::find(1);

    return new App\Mail\InvoicePaid($invoice);
});
```

<a id="localizing-mailables"></a>
## Localización de correos electrónicos

Laravel le permite enviar mensajes de correo en una configuración regional distinta a la actual de la solicitud, e incluso recordará esta configuración regional si el correo está en cola.

Para lograr esto, la fachada `Mail` ofrece un método `locale` para configurar el idioma deseado. La aplicación cambiará a esta configuración regional cuando se evalúe la plantilla del envío por correo y luego volverá a la configuración regional anterior cuando se complete la evaluación:

```php
Mail::to($request->user())->locale('es')->send(
    new OrderShipped($order)
);
```

<a id="user-preferred-locales"></a>
#### Configuraciones regionales preferidas del usuario

A veces, las aplicaciones almacenan la configuración regional preferida de cada usuario. Al implementar el contrato `HasLocalePreference` en uno o más de sus modelos, puede indicarle a Laravel que use esta configuración regional almacenada al enviar correo:

```php
use Illuminate\Contracts\Translation\HasLocalePreference;

class User extends Model implements HasLocalePreference
{
    /**
     * Obtener la configuración regional preferida del usuario.
     */
    public function preferredLocale(): string
    {
        return $this->locale;
    }
}
```

Una vez que haya implementado la interfaz, Laravel utilizará automáticamente la configuración regional preferida al enviar mensajes de correo y notificaciones al modelo. Por lo tanto, no es necesario llamar al método `locale` cuando se utiliza esta interfaz:

```php
Mail::to($request->user())->send(new OrderShipped($order));
```

<a id="testing-mailables"></a>
## Pruebas

<a id="testing-mailable-content"></a>
### Prueba de contenido que se puede enviar por correo

Laravel proporciona una variedad de métodos para inspeccionar la estructura de su correo. Además, Laravel proporciona varios métodos convenientes para probar que su correo electrónico tenga el contenido que espera:

```php tab=Pest
use App\Mail\InvoicePaid;
use App\Models\User;

test('mailable content', function () {
    $user = User::factory()->create();

    $mailable = new InvoicePaid($user);

    $mailable->assertFrom('jeffrey@example.com');
    $mailable->assertTo('taylor@example.com');
    $mailable->assertHasCc('abigail@example.com');
    $mailable->assertHasBcc('victoria@example.com');
    $mailable->assertHasReplyTo('tyler@example.com');
    $mailable->assertHasSubject('Invoice Paid');
    $mailable->assertHasTag('example-tag');
    $mailable->assertHasMetadata('key', 'value');

    $mailable->assertSeeInHtml($user->email);
    $mailable->assertDontSeeInHtml('Invoice Not Paid');
    $mailable->assertSeeInOrderInHtml(['Invoice Paid', 'Thanks']);

    $mailable->assertSeeInText($user->email);
    $mailable->assertDontSeeInText('Invoice Not Paid');
    $mailable->assertSeeInOrderInText(['Invoice Paid', 'Thanks']);

    $mailable->assertHasAttachment('/path/to/file');
    $mailable->assertHasAttachment(Attachment::fromPath('/path/to/file'));
    $mailable->assertHasAttachedData($pdfData, 'name.pdf', ['mime' => 'application/pdf']);
    $mailable->assertHasAttachmentFromStorage('/path/to/file', 'name.pdf', ['mime' => 'application/pdf']);
    $mailable->assertHasAttachmentFromStorageDisk('s3', '/path/to/file', 'name.pdf', ['mime' => 'application/pdf']);
});
```

```php tab=PHPUnit
use App\Mail\InvoicePaid;
use App\Models\User;

public function test_mailable_content(): void
{
    $user = User::factory()->create();

    $mailable = new InvoicePaid($user);

    $mailable->assertFrom('jeffrey@example.com');
    $mailable->assertTo('taylor@example.com');
    $mailable->assertHasCc('abigail@example.com');
    $mailable->assertHasBcc('victoria@example.com');
    $mailable->assertHasReplyTo('tyler@example.com');
    $mailable->assertHasSubject('Invoice Paid');
    $mailable->assertHasTag('example-tag');
    $mailable->assertHasMetadata('key', 'value');

    $mailable->assertSeeInHtml($user->email);
    $mailable->assertDontSeeInHtml('Invoice Not Paid');
    $mailable->assertSeeInOrderInHtml(['Invoice Paid', 'Thanks']);

    $mailable->assertSeeInText($user->email);
    $mailable->assertDontSeeInText('Invoice Not Paid');
    $mailable->assertSeeInOrderInText(['Invoice Paid', 'Thanks']);

    $mailable->assertHasAttachment('/path/to/file');
    $mailable->assertHasAttachment(Attachment::fromPath('/path/to/file'));
    $mailable->assertHasAttachedData($pdfData, 'name.pdf', ['mime' => 'application/pdf']);
    $mailable->assertHasAttachmentFromStorage('/path/to/file', 'name.pdf', ['mime' => 'application/pdf']);
    $mailable->assertHasAttachmentFromStorageDisk('s3', '/path/to/file', 'name.pdf', ['mime' => 'application/pdf']);
}
```

Como es de esperar, las aserciones "HTML" afirman que la versión HTML de su envío por correo contiene una cadena determinada, mientras que las aserciones de "texto" afirman que la versión de texto plano de su envío por correo contiene una cadena determinada.

<a id="testing-mailable-sending"></a>
### Prueba de envío por correo

Le sugerimos probar el contenido de sus mensajes de correo por separado de las pruebas que afirman que un mensaje de correo determinado fue "enviado" a un usuario específico. Normalmente, el contenido de los mensajes de correo no es relevante para el código que está probando, y basta con afirmar que Laravel recibió instrucciones de enviar un mensaje de correo determinado.

Puede utilizar el método `fake` de la fachada `Mail` para evitar que se envíe correo. Después de llamar al método `fake` de la fachada `Mail`, puede afirmar que los mailables recibieron instrucciones de enviarse a los usuarios e incluso inspeccionar los datos que recibieron los mailables:

```php tab=Pest
<?php

use App\Mail\OrderShipped;
use Illuminate\Support\Facades\Mail;

test('orders can be shipped', function () {
    Mail::fake();

    // Perform order shipping...

    // Comprobar que no se haya enviado ningún mailable...
    Mail::assertNothingSent();

    // Comprobar que se haya enviado un mailable...
    Mail::assertSent(OrderShipped::class);

    // Comprobar que un mailable se haya enviado dos veces...
    Mail::assertSent(OrderShipped::class, 2);

    // Comprobar que se haya enviado un mailable a una dirección de correo electrónico...
    Mail::assertSent(OrderShipped::class, 'example@laravel.com');

    // Comprobar que se haya enviado un mailable a varias direcciones de correo electrónico...
    Mail::assertSent(OrderShipped::class, ['example@laravel.com', '...']);

    // Comprobar que no se haya enviado un mailable...
    Mail::assertNotSent(AnotherMailable::class);

    // Comprobar que un mailable se haya enviado dos veces...
    Mail::assertSentTimes(OrderShipped::class, 2);

    // Comprobar que se haya enviado un mailable exactamente una vez...
    Mail::assertSentOnce(OrderShipped::class);

    // Comprobar que se hayan enviado 3 mailables en total...
    Mail::assertSentCount(3);
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use App\Mail\OrderShipped;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_orders_can_be_shipped(): void
    {
        Mail::fake();

        // Perform order shipping...

        // Comprobar que no se haya enviado ningún mailable...
        Mail::assertNothingSent();

        // Comprobar que se haya enviado un mailable...
        Mail::assertSent(OrderShipped::class);

        // Comprobar que un mailable se haya enviado dos veces...
        Mail::assertSent(OrderShipped::class, 2);

        // Comprobar que se haya enviado un mailable a una dirección de correo electrónico...
        Mail::assertSent(OrderShipped::class, 'example@laravel.com');

        // Comprobar que se haya enviado un mailable a varias direcciones de correo electrónico...
        Mail::assertSent(OrderShipped::class, ['example@laravel.com', '...']);

        // Comprobar que no se haya enviado un mailable...
        Mail::assertNotSent(AnotherMailable::class);

        // Comprobar que un mailable se haya enviado dos veces...
        Mail::assertSentTimes(OrderShipped::class, 2);

        // Comprobar que se haya enviado un mailable exactamente una vez...
        Mail::assertSentOnce(OrderShipped::class);

        // Comprobar que se hayan enviado 3 mailables en total...
        Mail::assertSentCount(3);
    }
}
```

Si está poniendo en cola mensajes de correo para su entrega en segundo plano, debe utilizar el método `assertQueued` en lugar de `assertSent`:

```php
Mail::assertQueued(OrderShipped::class);
Mail::assertQueuedOnce(OrderShipped::class);
Mail::assertNotQueued(OrderShipped::class);
Mail::assertNothingQueued();
Mail::assertQueuedCount(3);
```

También puede afirmar el número total de mensajes de correo que se han enviado o puesto en cola utilizando el método `assertOutgoingCount`:

```php
Mail::assertOutgoingCount(3);
```

Puede pasar una función anónima a los métodos `assertSent`, `assertNotSent`, `assertQueued` o `assertNotQueued` para afirmar que se envió un correo que pasa una "prueba de veracidad" determinada. Si se envió al menos un correo que pasa la prueba de verdad dada, entonces la afirmación será exitosa:

```php
Mail::assertSent(function (OrderShipped $mail) use ($order) {
    return $mail->order->id === $order->id;
});
```

Al llamar a los métodos de aserción de la fachada `Mail`, la instancia de envío por correo aceptada por la función anónima proporcionada expone métodos útiles para examinar el envío por correo:

```php
Mail::assertSent(OrderShipped::class, function (OrderShipped $mail) use ($user) {
    return $mail->hasTo($user->email) &&
           $mail->hasCc('...') &&
           $mail->hasBcc('...') &&
           $mail->hasReplyTo('...') &&
           $mail->hasFrom('...') &&
           $mail->hasSubject('...') &&
           $mail->hasMetadata('order_id', $mail->order->id) &&
           $mail->usesMailer('ses');
});
```

La instancia de envío por correo también incluye varios métodos útiles para examinar los archivos adjuntos en un envío por correo:

```php
use Illuminate\Mail\Mailables\Attachment;

Mail::assertSent(OrderShipped::class, function (OrderShipped $mail) {
    return $mail->hasAttachment(
        Attachment::fromPath('/path/to/file')
            ->as('name.pdf')
            ->withMime('application/pdf')
    );
});

Mail::assertSent(OrderShipped::class, function (OrderShipped $mail) {
    return $mail->hasAttachment(
        Attachment::fromStorageDisk('s3', '/path/to/file')
    );
});

Mail::assertSent(OrderShipped::class, function (OrderShipped $mail) use ($pdfData) {
    return $mail->hasAttachment(
        Attachment::fromData(fn () => $pdfData, 'name.pdf')
    );
});
```

Es posible que haya notado que existen dos métodos para afirmar que el correo no se envió: `assertNotSent` y `assertNotQueued`. A veces es posible que desees afirmar que no se envió ningún correo **o** en cola. Para lograr esto, puede utilizar los métodos `assertNothingOutgoing` y `assertNotOutgoing`:

```php
Mail::assertNothingOutgoing();

Mail::assertNotOutgoing(function (OrderShipped $mail) use ($order) {
    return $mail->order->id === $order->id;
});
```

<a id="mail-and-local-development"></a>
## Correo y Desarrollo Local

Al desarrollar una aplicación que envía correo electrónico, probablemente no desee enviar correos electrónicos a direcciones de correo electrónico activas. Laravel proporciona varias formas de "deshabilitar" el envío real de correos electrónicos durante el desarrollo local.

<a id="log-driver"></a>
#### Controlador de registro

En lugar de enviar sus correos electrónicos, el controlador de correo `log` escribirá todos los mensajes de correo electrónico en sus archivos de registro para su inspección. Normalmente, este controlador sólo se utilizaría durante el desarrollo local. Para obtener más información sobre cómo configurar su aplicación por entorno, consulte la [documentación de configuración](../configuration/#environment-configuration).

<a id="mailtrap"></a>
#### HOLA / Mailtrap / Mailpit

Alternativamente, puede utilizar un servicio como [HELO](https://usehelo.com) o [Mailtrap](https://mailtrap.io) y el controlador `smtp` para enviar sus mensajes de correo electrónico a un buzón "ficticio" donde podrá verlos en un cliente de correo electrónico real. Este enfoque tiene la ventaja de permitirle inspeccionar los correos electrónicos finales en el visor de mensajes de Mailtrap.

Si está utilizando [Laravel Sail](../sail/), puede obtener una vista previa de sus mensajes usando [Mailpit](https://github.com/axllent/mailpit). Cuando Sail se está ejecutando, puede acceder a la interfaz de Mailpit en: `http://localhost:8025`.

<a id="using-a-global-to-address"></a>
#### Usando una dirección global `to`

Finalmente, puede especificar una dirección "a" global invocando el método `alwaysTo` ofrecido por la fachada `Mail`. Normalmente, este método debe llamarse desde el método `boot` de uno de los proveedores de servicios de su aplicación:

```php
use Illuminate\Support\Facades\Mail;

/**
 * Inicializar los servicios de la aplicación.
 */
public function boot(): void
{
    if ($this->app->environment('local')) {
        Mail::alwaysTo('taylor@example.com');
    }
}
```

Cuando se utiliza el método `alwaysTo`, se eliminarán todas las direcciones "cc" o "cco" adicionales en los mensajes de correo.

<a id="events"></a>
## Eventos

Laravel envía dos eventos mientras envía mensajes de correo. El evento `MessageSending` se envía antes de enviar un mensaje, mientras que el evento `MessageSent` se envía después de enviar un mensaje. Recuerde, estos eventos se envían cuando el correo se *envía*, no cuando está en cola. Puede crear [escuchas de eventos](../events/) para estos eventos dentro de su aplicación:

```php
use Illuminate\Mail\Events\MessageSending;
// use Illuminate\Mail\Events\MessageSent;

class LogMessage
{
    /**
     * Gestionar el evento.
     */
    public function handle(MessageSending $event): void
    {
        // ...
    }
}
```

<a id="custom-transports"></a>
## Transportes personalizados

Laravel incluye una variedad de transportes de correo; sin embargo, es posible que desee escribir sus propios transportes para enviar correo electrónico a través de otros servicios que Laravel no admite de forma inmediata. Para comenzar, defina una clase que extienda la clase `Symfony\Component\Mailer\Transport\AbstractTransport`. Luego, implemente los métodos `doSend` y `__toString` en su transporte:

```php
<?php

namespace App\Mail;

use MailchimpTransactional\ApiClient;
use Symfony\Component\Mailer\SentMessage;
use Symfony\Component\Mailer\Transport\AbstractTransport;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\MessageConverter;

class MailchimpTransport extends AbstractTransport
{
    /**
     * Crear una nueva instancia de transport de Mailchimp.
     */
    public function __construct(
        protected ApiClient $client,
    ) {
        parent::__construct();
    }

    /**
     * {@inheritDoc}
     */
    protected function doSend(SentMessage $message): void
    {
        $email = MessageConverter::toEmail($message->getOriginalMessage());

        $this->client->messages->send(['message' => [
            'from_email' => $email->getFrom(),
            'to' => collect($email->getTo())->map(function (Address $email) {
                return ['email' => $email->getAddress(), 'type' => 'to'];
            })->all(),
            'subject' => $email->getSubject(),
            'text' => $email->getTextBody(),
        ]]);
    }

    /**
     * Obtener la representación en cadena del transport.
     */
    public function __toString(): string
    {
        return 'mailchimp';
    }
}
```

Una vez que haya definido su transporte personalizado, podrá registrarlo a través del método `extend` proporcionado por la fachada `Mail`. Normalmente, esto se debe hacer dentro del método `boot` del `AppServiceProvider` de su aplicación. Se pasará un argumento `$config` a la función anónima proporcionada al método `extend`. Este argumento contendrá la matriz de configuración definida para el correo en el archivo de configuración `config/mail.php` de la aplicación:

```php
use App\Mail\MailchimpTransport;
use Illuminate\Support\Facades\Mail;
use MailchimpTransactional\ApiClient;

/**
 * Inicializar los servicios de la aplicación.
 */
public function boot(): void
{
    Mail::extend('mailchimp', function (array $config = []) {
        $client = new ApiClient;

        $client->setApiKey($config['key']);

        return new MailchimpTransport($client);
    });
}
```

Una vez que su transporte personalizado haya sido definido y registrado, puede crear una definición de correo dentro del archivo de configuración `config/mail.php` de su aplicación que utilice el nuevo transporte:

```php
'mailchimp' => [
    'transport' => 'mailchimp',
    'key' => env('MAILCHIMP_API_KEY'),
    // ...
],
```

<a id="additional-symfony-transports"></a>
### Transportes adicionales de Symfony

Laravel incluye soporte para algunos transportes de correo existentes mantenidos por Symfony como Mailgun y Postmark. Sin embargo, es posible que desees ampliar Laravel con soporte para transportes adicionales mantenidos por Symfony. Puede hacerlo solicitando el correo Symfony necesario a través de Composer y registrando el transporte con Laravel. Por ejemplo, puedes instalar y registrar el programa de correo Symfony "Brevo" (anteriormente "Sendinblue"):

```shell
composer require symfony/brevo-mailer symfony/http-client
```

Una vez que se haya instalado el paquete de correo Brevo, puede agregar una entrada para sus credenciales de API Brevo al archivo de configuración `services` de su aplicación:

```php
'brevo' => [
    'key' => env('BREVO_API_KEY'),
],
```

A continuación, puede utilizar el método `extend` de la fachada `Mail` para registrar el transporte con Laravel. Normalmente, esto se debe hacer dentro del método `boot` de un proveedor de servicios:

```php
use Illuminate\Support\Facades\Mail;
use Symfony\Component\Mailer\Bridge\Brevo\Transport\BrevoTransportFactory;
use Symfony\Component\Mailer\Transport\Dsn;

/**
 * Inicializar los servicios de la aplicación.
 */
public function boot(): void
{
    Mail::extend('brevo', function () {
        return (new BrevoTransportFactory)->create(
            new Dsn(
                'brevo+api',
                'default',
                config('services.brevo.key')
            )
        );
    });
}
```

Una vez que se haya registrado su transporte, puede crear una definición de correo dentro del archivo de configuración `config/mail.php` de su aplicación que utilice el nuevo transporte:

```php
'brevo' => [
    'transport' => 'brevo',
    // ...
],
```
