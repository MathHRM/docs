---
title: "Explotación florestal"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Configuración](#configuration)
    - [Controladores de canales disponibles](#available-channel-drivers)
    - [Requisitos previos del canal](#channel-prerequisites)
    - [Advertencias de obsolescencia del registro](#logging-deprecation-warnings)
- [Construcción de pilas de troncos](#building-log-stacks)
- [Escribir mensajes de registro](#writing-log-messages)
    - [Información Contextual](#contextual-information)
    - [Escritura en canales específicos](#writing-to-specific-channels)
- [Personalización del canal de monólogo](#monolog-channel-customization)
    - [Personalizar Monolog para Canales](#customizing-monolog-for-channels)
    - [Creación de canales de controlador de Monolog](#creating-monolog-handler-channels)
    - [Creación de canales personalizados a través de Factories](#creating-custom-channels-via-factories)
- [Mensajes de registro de seguimiento usando Pail](#tailing-log-messages-using-pail)
    - [Instalación](#pail-installation)
    - [Uso](#pail-usage)
    - [Filtrado de registros](#pail-filtering-logs)

<a id="introduction"></a>
## Introducción

Para ayudarlo a aprender más sobre lo que sucede dentro de su aplicación, Laravel proporciona servicios de registro sólidos que le permiten registrar mensajes en archivos, el registro de errores del sistema e incluso a Slack para notificar a todo su equipo.

El registro de Laravel se basa en "canales". Cada canal representa una forma específica de escribir información de registro. Por ejemplo, el canal `single` escribe archivos de registro en un único archivo de registro, mientras que el canal `slack` envía mensajes de registro a Slack. Los mensajes de registro se pueden escribir en varios canales según su gravedad.

Debajo del capó, Laravel utiliza la biblioteca [Monolog](https://github.com/Seldaek/monolog), que brinda soporte para una variedad de potentes controladores de registros. Laravel hace que sea muy fácil configurar estos controladores, permitiéndole mezclarlos y combinarlos para personalizar el manejo de registros de su aplicación.

<a id="configuration"></a>
## Configuración

Todas las opciones de configuración que controlan el comportamiento de registro de su aplicación se encuentran en el archivo de configuración `config/logging.php`. Este archivo le permite configurar los canales de registro de su aplicación, así que asegúrese de revisar cada uno de los canales disponibles y sus opciones. Revisaremos algunas opciones comunes a continuación.

De forma predeterminada, Laravel utilizará el canal `stack` al registrar mensajes. El canal `stack` se utiliza para agregar múltiples canales de registro en un solo canal. Para obtener más información sobre la construcción de pilas, consulte la [documentación a continuación](#building-log-stacks).

<a id="available-channel-drivers"></a>
### Controladores de canal disponibles

Cada canal de registro funciona con un "controlador". El controlador determina cómo y dónde se graba realmente el mensaje de registro. Los siguientes controladores de canales de registro están disponibles en todas las aplicaciones de Laravel. Ya hay una entrada para la mayoría de estos controladores en el archivo de configuración `config/logging.php` de su aplicación, así que asegúrese de revisar este archivo para familiarizarse con su contenido:

<div class="overflow-auto">

| Nombre | Descripción |
| ------------ | -------------------------------------------------------------- |
| `custom` | Un controlador que llama a una fábrica específica para crear un canal.         |
| `daily` | Un controlador Monolog basado en `RotatingFileHandler` que rota diariamente.    |
| `monthly` | Un controlador Monolog basado en `RotatingFileHandler` que rota mensualmente.  |
| `errorlog` | Un controlador Monolog basado en `ErrorLogHandler`.                           |
| `monolog` | Un controlador de fábrica de Monolog que puede utilizar cualquier controlador Monolog compatible. |
| `single` | Un canal de registro basado en un único archivo o ruta (`StreamHandler`).        |
| `slack` | Un controlador Monolog basado en `SlackWebhookHandler`.                        |
| `stack` | Un contenedor para facilitar la creación de canales "multicanal".           |
| `syslog` | Un controlador Monolog basado en `SyslogHandler`.                              |

</div>

> **Nota:**
> Consulte la documentación sobre [personalización avanzada del canal](#monolog-channel-customization) para obtener más información sobre los controladores `monolog` y `custom`.

<a id="configuring-the-channel-name"></a>
#### Configurando el nombre del canal

De forma predeterminada, se crea una instancia de Monolog con un "nombre de canal" que coincide con el entorno actual, como `production` o `local`. Para cambiar este valor, puede agregar una opción `name` a la configuración de su canal:

```php
'stack' => [
    'driver' => 'stack',
    'name' => 'channel-name',
    'channels' => ['single', 'slack'],
],
```

<a id="channel-prerequisites"></a>
### Requisitos previos del canal

<a id="configuring-the-single-daily-and-monthly-channels"></a>
#### Configuración de los canales únicos, diarios y mensuales

Los canales `single`, `daily` y `monthly` tienen tres opciones de configuración opcionales: `bubble`, `permission` y `locking`.

<div class="overflow-auto">

| Nombre | Descripción | Predeterminado |
| ------------ | -------------------------------------------------------------------------------------- | ------- |
| `bubble` | Indica si los mensajes deben aparecer en otros canales después de ser manejados. | `true` |
| `locking` | Intente bloquear el archivo de registro antes de escribir en él.                            | `false` |
| `permission` | Los permisos del archivo de registro.                                                   | `0644` |

</div>

Además, la política de retención para los canales `daily` y `monthly` se puede configurar mediante la opción de configuración `max_files`. La variable de entorno `LOG_DAILY_DAYS` también se puede utilizar para configurar la retención para el canal `daily`.

<a id="configuring-the-papertrail-channel"></a>
#### Configuración del canal Papertrail

El canal `papertrail` requiere las opciones de configuración `host` y `port`. Estos se pueden definir mediante las variables de entorno `PAPERTRAIL_URL` y `PAPERTRAIL_PORT`. Puede obtener estos valores en [Papertrail](https://help.papertrailapp.com/kb/configuration/configuring-centralized-logging-from-php-apps/#send-events-from-php-app).

<a id="configuring-the-slack-channel"></a>
#### Configurando el canal Slack

El canal `slack` requiere una opción de configuración `url`. Este valor se puede definir mediante la variable de entorno `LOG_SLACK_WEBHOOK_URL`. Esta URL debe coincidir con la URL de un [webhook entrante](https://slack.com/apps/A0F7XDUAZ-incoming-webhooks) que haya configurado para su equipo de Slack.

De forma predeterminada, Slack solo recibirá registros en el nivel `critical` y superior; sin embargo, puede ajustar esto usando la variable de entorno `LOG_LEVEL` o modificando la opción de configuración `level` dentro de la matriz de configuración de su canal de registro de Slack.

<a id="logging-deprecation-warnings"></a>
### Advertencias de obsolescencia del registro

PHP, Laravel y otras bibliotecas a menudo notifican a sus usuarios que algunas de sus funciones han quedado obsoletas y se eliminarán en una versión futura. Si desea registrar estas advertencias de obsolescencia, puede especificar su canal de registro `deprecations` preferido utilizando la variable de entorno `LOG_DEPRECATIONS_CHANNEL` o dentro del archivo de configuración `config/logging.php` de su aplicación:

```php
'deprecations' => [
    'channel' => env('LOG_DEPRECATIONS_CHANNEL', 'null'),
    'trace' => env('LOG_DEPRECATIONS_TRACE', false),
],

'channels' => [
    // ...
]
```

O puede definir un canal de registro denominado `deprecations`. Si existe un canal de registro con este nombre, siempre se utilizará para registrar desaprobaciones:

```php
'channels' => [
    'deprecations' => [
        'driver' => 'single',
        'path' => storage_path('logs/php-deprecation-warnings.log'),
    ],
],
```

<a id="building-log-stacks"></a>
## Construyendo pilas de registros

Como se mencionó anteriormente, el controlador `stack` le permite combinar múltiples canales en un solo canal de registro para mayor comodidad. Para ilustrar cómo utilizar las pilas de registros, echemos un vistazo a una configuración de ejemplo que podría ver en una aplicación de producción:

```php
'channels' => [
    'stack' => [
        'driver' => 'stack',
        'channels' => ['syslog', 'slack'], // [tl! add]
        'ignore_exceptions' => false,
    ],

    'syslog' => [
        'driver' => 'syslog',
        'level' => env('LOG_LEVEL', 'debug'),
        'facility' => env('LOG_SYSLOG_FACILITY', LOG_USER),
        'replace_placeholders' => true,
    ],

    'slack' => [
        'driver' => 'slack',
        'url' => env('LOG_SLACK_WEBHOOK_URL'),
        'username' => env('LOG_SLACK_USERNAME', 'Laravel Log'),
        'emoji' => env('LOG_SLACK_EMOJI', ':boom:'),
        'level' => env('LOG_LEVEL', 'critical'),
        'replace_placeholders' => true,
    ],
],
```

Analicemos esta configuración. Primero, observe que nuestro canal `stack` agrega otros dos canales a través de su opción `channels`: `syslog` y `slack`. Entonces, al registrar mensajes, ambos canales tendrán la oportunidad de registrar el mensaje. Sin embargo, como veremos a continuación, el hecho de que estos canales realmente registren el mensaje puede estar determinado por la gravedad/"nivel" del mensaje.

<a id="log-levels"></a>
#### Niveles de registro

Tome nota de la opción de configuración `level` presente en las configuraciones de canal `syslog` y `slack` en el ejemplo anterior. Esta opción determina el "nivel" mínimo que debe tener un mensaje para que el canal lo registre. Monolog, que impulsa los servicios de registro de Laravel, ofrece todos los niveles de registro definidos en la [especificación RFC 5424](https://tools.ietf.org/html/rfc5424). En orden descendente de gravedad, estos niveles de registro son: **emergencia**, **alerta**, **crítico**, **error**, **advertencia**, **aviso**, **información** y **depuración**.

Entonces, imagina que registramos un mensaje usando el método `debug`:

```php
Log::debug('An informational message.');
```

Dada nuestra configuración, el canal `syslog` escribirá el mensaje en el registro del sistema; sin embargo, dado que el mensaje de error no es `critical` o superior, no se enviará a Slack. Sin embargo, si registramos un mensaje `emergency`, se enviará tanto al registro del sistema como a Slack, ya que el nivel `emergency` está por encima de nuestro umbral de nivel mínimo para ambos canales:

```php
Log::emergency('The system is down!');
```

<a id="writing-log-messages"></a>
## Escritura de mensajes de registro

Puede escribir información en los registros utilizando `Log` [facade](../facades/). Como se mencionó anteriormente, el registrador proporciona los ocho niveles de registro definidos en la [especificación RFC 5424](https://tools.ietf.org/html/rfc5424): **emergencia**, **alerta**, **crítico**, **error**, **advertencia**, **aviso**, **información** y **depuración**:

```php
use Illuminate\Support\Facades\Log;

Log::emergency($message);
Log::alert($message);
Log::critical($message);
Log::error($message);
Log::warning($message);
Log::notice($message);
Log::info($message);
Log::debug($message);
```

Puede llamar a cualquiera de estos métodos para registrar un mensaje para el nivel correspondiente. De forma predeterminada, el mensaje se escribirá en el canal de registro predeterminado según lo configurado en su archivo de configuración `logging`:

```php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * Show the profile for the given user.
     */
    public function show(string $id): View
    {
        Log::info('Showing the user profile for user: {id}', ['id' => $id]);

        return view('user.profile', [
            'user' => User::findOrFail($id)
        ]);
    }
}
```

<a id="contextual-information"></a>
### Información contextual

Se puede pasar una serie de datos contextuales a los métodos de registro. Estos datos contextuales serán formateados y mostrados con el mensaje de registro:

```php
use Illuminate\Support\Facades\Log;

Log::info('User {id} failed to login.', ['id' => $user->id]);
```

Ocasionalmente, es posible que desee especificar alguna información contextual que debe incluirse con todas las entradas de registro posteriores en un canal en particular. Por ejemplo, es posible que desee registrar un ID de solicitud asociado con cada solicitud entrante en su aplicación. Para lograr esto, puede llamar al método `withContext` de la fachada `Log`:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class AssignRequestId
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $requestId = (string) Str::uuid();

        Log::withContext([
            'request-id' => $requestId
        ]);

        $response = $next($request);

        $response->headers->set('Request-Id', $requestId);

        return $response;
    }
}
```

Si desea compartir información contextual en _todos_ los canales de registro, puede invocar el método `Log::shareContext()`. Este método proporcionará la información contextual a todos los canales creados y a los canales que se creen posteriormente:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class AssignRequestId
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $requestId = (string) Str::uuid();

        Log::shareContext([
            'request-id' => $requestId
        ]);

        // ...
    }
}
```

> **Nota:**
> Si necesita compartir el contexto del registro mientras procesa trabajos en cola, puede utilizar [job middleware](../queues/#job-middleware).

<a id="writing-to-specific-channels"></a>
### Escribir en canales específicos

A veces es posible que desee registrar un mensaje en un canal que no sea el canal predeterminado de su aplicación. Puede utilizar el método `channel` en la fachada `Log` para recuperar e iniciar sesión en cualquier canal definido en su archivo de configuración:

```php
use Illuminate\Support\Facades\Log;

Log::channel('slack')->info('Something happened!');
```

Si desea crear una pila de registro bajo demanda que consta de varios canales, puede utilizar el método `stack`:

```php
Log::stack(['single', 'slack'])->info('Something happened!');
```

<a id="on-demand-channels"></a>
#### Canales bajo demanda

También es posible crear un canal bajo demanda proporcionando la configuración en tiempo de ejecución sin que esa configuración esté presente en el archivo de configuración `logging` de su aplicación. Para lograr esto, puede pasar una matriz de configuración al método `build` de la fachada `Log`:

```php
use Illuminate\Support\Facades\Log;

Log::build([
  'driver' => 'single',
  'path' => storage_path('logs/custom.log'),
])->info('Something happened!');
```

Es posible que también desee incluir un canal bajo demanda en una pila de registro bajo demanda. Esto se puede lograr incluyendo su instancia de canal bajo demanda en la matriz pasada al método `stack`:

```php
use Illuminate\Support\Facades\Log;

$channel = Log::build([
  'driver' => 'single',
  'path' => storage_path('logs/custom.log'),
]);

Log::stack(['slack', $channel])->info('Something happened!');
```

<a id="monolog-channel-customization"></a>
## Personalización del canal Monolog

<a id="customizing-monolog-for-channels"></a>
### Personalización de Monolog para canales

A veces es posible que necesites un control total sobre cómo se configura Monolog para un canal existente. Por ejemplo, es posible que desee configurar una implementación personalizada de Monolog `FormatterInterface` para el canal `single` integrado de Laravel.

Para comenzar, defina una matriz `tap` en la configuración del canal. La matriz `tap` debe contener una lista de clases que deberían tener la oportunidad de personalizar (o "aprovechar") la instancia de Monolog después de su creación. No existe una ubicación convencional donde se deban ubicar estas clases, por lo que puede crear un directorio dentro de su aplicación para contener estas clases:

```php
'single' => [
    'driver' => 'single',
    'tap' => [App\Logging\CustomizeFormatter::class],
    'path' => storage_path('logs/laravel.log'),
    'level' => env('LOG_LEVEL', 'debug'),
    'replace_placeholders' => true,
],
```

Una vez que haya configurado la opción `tap` en su canal, estará listo para definir la clase que personalizará su instancia de Monolog. Esta clase solo necesita un único método: `__invoke`, que recibe una instancia `Illuminate\Log\Logger`. La instancia `Illuminate\Log\Logger` envía todas las llamadas a métodos a la instancia Monolog subyacente:

```php
<?php

namespace App\Logging;

use Illuminate\Log\Logger;
use Monolog\Formatter\LineFormatter;

class CustomizeFormatter
{
    /**
     * Customize the given logger instance.
     */
    public function __invoke(Logger $logger): void
    {
        foreach ($logger->getHandlers() as $handler) {
            $handler->setFormatter(new LineFormatter(
                '[%datetime%] %channel%.%level_name%: %message% %context% %extra%'
            ));
        }
    }
}
```

> **Nota:**
> Todas sus clases "tap" se resuelven mediante el [contenedor de servicio](../container/), por lo que cualquier dependencia del constructor que requieran se inyectará automáticamente.

<a id="creating-monolog-handler-channels"></a>
### Creación de canales de controlador de monolog

Monolog tiene una variedad de [controladores disponibles](https://github.com/Seldaek/monolog/tree/main/src/Monolog/Handler) y Laravel no incluye un canal integrado para cada uno. En algunos casos, es posible que desee crear un canal personalizado que sea simplemente una instancia de un controlador Monolog específico que no tenga un controlador de registro Laravel correspondiente. Estos canales se pueden crear fácilmente utilizando el controlador `monolog`.

Cuando se utiliza el controlador `monolog`, la opción de configuración `handler` se utiliza para especificar qué controlador se creará una instancia. Opcionalmente, cualquier parámetro del constructor que necesite el controlador se puede especificar usando la opción de configuración `handler_with`:

```php
'logentries' => [
    'driver'  => 'monolog',
    'handler' => Monolog\Handler\SyslogUdpHandler::class,
    'handler_with' => [
        'host' => 'my.logentries.internal.datahubhost.company.com',
        'port' => '10000',
    ],
],
```

<a id="monolog-formatters"></a>
#### Formateadores de monólogos

Cuando se utiliza el controlador `monolog`, se utilizará Monolog `LineFormatter` como formateador predeterminado. Sin embargo, puede personalizar el tipo de formateador pasado al controlador usando las opciones de configuración `formatter` y `formatter_with`:

```php
'browser' => [
    'driver' => 'monolog',
    'handler' => Monolog\Handler\BrowserConsoleHandler::class,
    'formatter' => Monolog\Formatter\HtmlFormatter::class,
    'formatter_with' => [
        'dateFormat' => 'Y-m-d',
    ],
],
```

Si está utilizando un controlador Monolog que es capaz de proporcionar su propio formateador, puede establecer el valor de la opción de configuración `formatter` en `default`:

```php
'newrelic' => [
    'driver' => 'monolog',
    'handler' => Monolog\Handler\NewRelicHandler::class,
    'formatter' => 'default',
],
```

<a id="monolog-processors"></a>
#### Procesadores monólogos

Monolog también puede procesar mensajes antes de registrarlos. Puede crear sus propios procesadores o utilizar los [procesadores existentes que ofrece Monolog](https://github.com/Seldaek/monolog/tree/main/src/Monolog/Processor).

Si desea personalizar los procesadores para un controlador `monolog`, agregue un valor de configuración `processors` a la configuración de su canal:

```php
'memory' => [
    'driver' => 'monolog',
    'handler' => Monolog\Handler\StreamHandler::class,
    'handler_with' => [
        'stream' => 'php://stderr',
    ],
    'processors' => [
        // Simple syntax...
        Monolog\Processor\MemoryUsageProcessor::class,

        // With options...
        [
            'processor' => Monolog\Processor\PsrLogMessageProcessor::class,
            'with' => ['removeUsedContextFields' => true],
        ],
    ],
],
```

<a id="creating-custom-channels-via-factories"></a>
### Creación de canales personalizados a través de fábricas

Si desea definir un canal completamente personalizado en el que tenga control total sobre la creación de instancias y la configuración de Monolog, puede especificar un tipo de controlador `custom` en su archivo de configuración `config/logging.php`. Su configuración debe incluir una opción `via` que contenga el nombre de la clase de fábrica que se invocará para crear la instancia de Monolog:

```php
'channels' => [
    'example-custom-channel' => [
        'driver' => 'custom',
        'via' => App\Logging\CreateCustomLogger::class,
    ],
],
```

Una vez que haya configurado el canal del controlador `custom`, estará listo para definir la clase que creará su instancia de Monolog. Esta clase solo necesita un único método `__invoke` que debería devolver la instancia del registrador Monolog. El método recibirá la matriz de configuración de canales como único argumento:

```php
<?php

namespace App\Logging;

use Monolog\Logger;

class CreateCustomLogger
{
    /**
     * Create a custom Monolog instance.
     */
    public function __invoke(array $config): Logger
    {
        return new Logger(/* ... */);
    }
}
```

<a id="tailing-log-messages-using-pail"></a>
## Mensajes de registro de seguimiento utilizando Pail

A menudo, es posible que necesites seguir los registros de tu aplicación en tiempo real. Por ejemplo, al depurar un problema o al monitorear los registros de su aplicación para detectar tipos específicos de errores.

Laravel Pail es un paquete que le permite sumergirse fácilmente en los archivos de registro de su aplicación Laravel directamente desde la línea de comandos. A diferencia del comando estándar `tail`, Pail está diseñado para funcionar con cualquier controlador de registro, incluidos [Laravel Nightwatch](https://nightwatch.laravel.com), Sentry o Flare. Además, Pail proporciona un conjunto de filtros útiles para ayudarle a encontrar rápidamente lo que está buscando.

<img src="https://laravel.com/img/docs/pail-example.png">

<a id="pail-installation"></a>
### Instalación

> **Advertencia:**
> Laravel Pail requiere la extensión PHP [PCNTL](https://www.php.net/manual/en/book.pcntl.php).

Para comenzar, instale Pail en su proyecto usando el administrador de paquetes de Composer:

```shell
composer require --dev laravel/pail
```

<a id="pail-usage"></a>
### Uso

Para comenzar a seguir registros, ejecute el comando `pail`:

```shell
php artisan pail
```

Para aumentar la detalle de la salida y evitar el truncamiento (...), utilice la opción `-v`:

```shell
php artisan pail -v
```

Para obtener máxima detalle y mostrar seguimientos de pila de excepciones, utilice la opción `-vv`:

```shell
php artisan pail -vv
```

Para detener los registros de residuos, presione `Ctrl+C` en cualquier momento.

<a id="pail-filtering-logs"></a>
### Filtrado de registros

<a id="pail-filtering-logs-filter-option"></a>
#### `--filter`

Puede utilizar la opción `--filter` para filtrar registros por tipo, archivo, mensaje y contenido de seguimiento de pila:

```shell
php artisan pail --filter="QueryException"
```

<a id="pail-filtering-logs-message-option"></a>
#### `--message`

Para filtrar registros solo por su mensaje, puede usar la opción `--message`:

```shell
php artisan pail --message="User created"
```

<a id="pail-filtering-logs-level-option"></a>
#### `--level`

La opción `--level` se puede utilizar para filtrar registros por su [nivel de registro](#log-levels):

```shell
php artisan pail --level=error
```

<a id="pail-filtering-logs-user-option"></a>
#### `--user`

Para mostrar solo los registros que se escribieron mientras un usuario determinado estaba autenticado, puede proporcionar el ID del usuario en la opción `--user`:

```shell
php artisan pail --user=1
```
