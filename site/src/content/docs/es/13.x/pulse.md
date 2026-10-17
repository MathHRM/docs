---
title: "Pulso de Laravel"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Instalación](#installation)
    - [Configuración](#configuration)
- [Panel](#dashboard)
    - [Autorización](#dashboard-authorization)
    - [Personalización](#dashboard-customization)
    - [Resolviendo Usuarios](#dashboard-resolving-users)
    - [Tarjetas](#dashboard-cards)
- [Capturando entradas](#capturing-entries)
    - [Grabadores](#recorders)
    - [Filtrado](#filtering)
- [Rendimiento](#performance)
    - [Usando una base de datos diferente](#using-a-different-database)
    - [Redis Ingest](#ingest)
    - [Muestreo](#sampling)
    - [Recorte](#trimming)
    - [Manejo de excepciones de pulso](#pulse-exceptions)
- [Tarjetas personalizadas](#custom-cards)
    - [Componentes de la tarjeta](#custom-card-components)
    - [Estilo](#custom-card-styling)
    - [Captura y agregación de datos](#custom-card-data)

<a id="introduction"></a>
## Introducción

[Laravel Pulse](https://github.com/laravel/pulse) ofrece información de un vistazo sobre el rendimiento y el uso de su aplicación. Con Pulse, puede rastrear cuellos de botella como trabajos lentos y puntos finales, encontrar a sus usuarios más activos y más.

Para una depuración en profundidad de eventos individuales, consulte [Laravel Telescope](../telescope/).

<a id="installation"></a>
## Instalación

> **Advertencia:**
> La implementación de almacenamiento propio de Pulse actualmente requiere una base de datos MySQL, MariaDB o PostgreSQL. Si está utilizando un motor de base de datos diferente, necesitará una base de datos MySQL, MariaDB o PostgreSQL separada para sus datos de Pulse.

Puede instalar Pulse usando el administrador de paquetes de Composer:

```shell
composer require laravel/pulse
```

A continuación, debe publicar los archivos de configuración y migración de Pulse utilizando el comando `vendor:publish` Artisan:

```shell
php artisan vendor:publish --provider="Laravel\Pulse\PulseServiceProvider"
```

Finalmente, debes ejecutar el comando `migrate` para crear las tablas necesarias para almacenar los datos de Pulse:

```shell
php artisan migrate
```

Una vez que se hayan ejecutado las migraciones de la base de datos de Pulse, podrá acceder al panel de Pulse a través de la ruta `/pulse`.

> **Nota:**
> Si no desea almacenar datos de Pulse en la base de datos principal de su aplicación, puede [especificar una conexión de base de datos dedicada](#using-a-different-database).

<a id="configuration"></a>
### Configuración

Muchas de las opciones de configuración de Pulse se pueden controlar mediante variables de entorno. Para ver las opciones disponibles, registrar nuevos grabadores o configurar opciones avanzadas, puede publicar el archivo de configuración `config/pulse.php`:

```shell
php artisan vendor:publish --tag=pulse-config
```

<a id="dashboard"></a>
## Panel de control

<a id="dashboard-authorization"></a>
### Autorización

Se puede acceder al panel de Pulse a través de la ruta `/pulse`. De forma predeterminada, solo podrá acceder a este panel en el entorno `local`, por lo que deberá configurar la autorización para sus entornos de producción personalizando la puerta de autorización `'viewPulse'`. Puede lograr esto dentro del archivo `app/Providers/AppServiceProvider.php` de su aplicación:

```php
use App\Models\User;
use Illuminate\Support\Facades\Gate;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Gate::define('viewPulse', function (User $user) {
        return $user->isAdmin();
    });

    // ...
}
```

<a id="dashboard-customization"></a>
### Personalización

Las tarjetas y el diseño del panel de Pulse se pueden configurar publicando la vista del panel. La vista del panel se publicará en `resources/views/vendor/pulse/dashboard.blade.php`:

```shell
php artisan vendor:publish --tag=pulse-dashboard
```

El panel funciona con [Livewire](https://livewire.laravel.com/) y le permite personalizar las tarjetas y el diseño sin necesidad de reconstruir ningún recurso de JavaScript.

Dentro de este archivo, el componente `<x-pulse>` es responsable de representar el tablero y proporciona un diseño de cuadrícula para las tarjetas. Si desea que el tablero abarque todo el ancho de la pantalla, puede proporcionar el accesorio `full-width` al componente:

```blade
<x-pulse full-width>
    ...
</x-pulse>
```

De forma predeterminada, el componente `<x-pulse>` creará una cuadrícula de 12 columnas, pero puede personalizarla usando el accesorio `cols`:

```blade
<x-pulse cols="16">
    ...
</x-pulse>
```

Cada tarjeta acepta un accesorio `cols` y `rows` para controlar el espacio y el posicionamiento:

```blade
<livewire:pulse.usage cols="4" rows="2" />
```

La mayoría de las tarjetas también aceptan un accesorio `expand` para mostrar la tarjeta completa en lugar de desplazarse:

```blade
<livewire:pulse.slow-queries expand />
```

<a id="dashboard-resolving-users"></a>
### Resolviendo usuarios

Para las tarjetas que muestran información sobre sus usuarios, como la tarjeta de uso de aplicaciones, Pulse solo registrará la identificación del usuario. Al renderizar el panel, Pulse resolverá los campos `name` y `email` de su modelo `Authenticatable` predeterminado y mostrará avatares utilizando el servicio web Gravatar.

Puede personalizar los campos y el avatar invocando el método `Pulse::user` dentro de la clase `App\Providers\AppServiceProvider` de su aplicación.

El método `user` acepta una función anónima que recibirá el modelo `Authenticatable` que se mostrará y debe devolver una matriz que contenga información de `name`, `extra` y `avatar` para el usuario:

```php
use Laravel\Pulse\Facades\Pulse;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Pulse::user(fn ($user) => [
        'name' => $user->name,
        'extra' => $user->email,
        'avatar' => $user->avatar_url,
    ]);

    // ...
}
```

> **Nota:**
> Puede personalizar completamente cómo se captura y recupera el usuario autenticado implementando el contrato `Laravel\Pulse\Contracts\ResolvesUsers` y vinculándolo en el [contenedor de servicios](../container/#binding-a-singleton).

<a id="dashboard-cards"></a>
### Tarjetas

<a id="servers-card"></a>
#### Servidores

La tarjeta `<livewire:pulse.servers />` muestra el uso de recursos del sistema para todos los servidores que ejecutan el comando `pulse:check`. Consulte la documentación sobre [servers recorder](#servers-recorder) para obtener más información sobre los informes de recursos del sistema.

Si reemplaza un servidor en su infraestructura, es posible que desee dejar de mostrar el servidor inactivo en el panel de Pulse después de un período determinado. Puede lograr esto usando la propiedad `ignore-after`, que acepta la cantidad de segundos después de los cuales los servidores inactivos deben eliminarse del panel de Pulse. Alternativamente, puede proporcionar una cadena con formato de hora relativa, como `1 hour` o `3 days and 1 hour`:

```blade
<livewire:pulse.servers ignore-after="3 hours" />
```

<a id="application-usage-card"></a>
#### Uso de la aplicación

La tarjeta `<livewire:pulse.usage />` muestra los 10 usuarios principales que realizan solicitudes a su aplicación, envían trabajos y experimentan solicitudes lentas.

Si desea ver todas las métricas de uso en pantalla al mismo tiempo, puede incluir la tarjeta varias veces y especificar el atributo `type`:

```blade
<livewire:pulse.usage type="requests" />
<livewire:pulse.usage type="slow_requests" />
<livewire:pulse.usage type="jobs" />
```

Para aprender cómo personalizar la forma en que Pulse recupera y muestra la información del usuario, consulte nuestra documentación sobre [resolución de usuarios](#dashboard-resolving-users).

> **Nota:**
> Si su aplicación recibe muchas solicitudes o envía muchos trabajos, es posible que desee habilitar [sampling](#sampling). Consulte la documentación de [grabador de solicitudes de usuario](#user-requests-recorder), [grabador de trabajos de usuario](#user-jobs-recorder) y [grabador de trabajos lento](#slow-jobs-recorder) para obtener más información.

<a id="exceptions-card"></a>
#### Excepciones

La tarjeta `<livewire:pulse.exceptions />` muestra la frecuencia y la actualidad de las excepciones que ocurren en su aplicación. De forma predeterminada, las excepciones se agrupan según la clase de excepción y la ubicación donde ocurrieron. Consulte la documentación del [registrador de excepciones](#exceptions-recorder) para obtener más información.

<a id="queues-card"></a>
#### Colas

La tarjeta `<livewire:pulse.queues />` muestra el rendimiento de las colas en su aplicación, incluida la cantidad de trabajos en cola, procesamiento, procesados, liberados y fallidos. Consulte la documentación del grabador de colas ](#queues-recorder) para obtener más información.

<a id="slow-requests-card"></a>
#### Solicitudes lentas

La tarjeta `<livewire:pulse.slow-requests />` muestra las solicitudes entrantes a su aplicación que superan el umbral configurado, que es 1000 ms de forma predeterminada. Consulte la documentación del [registrador de solicitudes lentas](#slow-requests-recorder) para obtener más información.

<a id="slow-jobs-card"></a>
#### Trabajos lentos

La tarjeta `<livewire:pulse.slow-jobs />` muestra los trabajos en cola en su aplicación que exceden el umbral configurado, que es 1000 ms de forma predeterminada. Consulte la documentación de [registrador de trabajos lentos](#slow-jobs-recorder) para obtener más información.

<a id="slow-queries-card"></a>
#### Consultas lentas

La tarjeta `<livewire:pulse.slow-queries />` muestra las consultas de la base de datos en su aplicación que exceden el umbral configurado, que es 1000 ms de forma predeterminada.

De forma predeterminada, las consultas lentas se agrupan según la consulta SQL (sin enlaces) y la ubicación donde se produjeron, pero puede optar por no capturar la ubicación si desea agrupar únicamente según la consulta SQL.

Si encuentra problemas de rendimiento de procesamiento debido a consultas SQL extremadamente grandes que reciben resaltado de sintaxis, puede deshabilitar el resaltado agregando la propiedad `without-highlighting`:

```blade
<livewire:pulse.slow-queries without-highlighting />
```

Consulte la documentación [registrador de consultas lentas](#slow-queries-recorder) para obtener más información.

<a id="slow-outgoing-requests-card"></a>
#### Solicitudes salientes lentas

La tarjeta `<livewire:pulse.slow-outgoing-requests />` muestra las solicitudes salientes realizadas utilizando el [cliente HTTP](../http-client/) de Laravel que superan el umbral configurado, que es de 1000 ms de forma predeterminada.

De forma predeterminada, las entradas se agruparán por la URL completa. Sin embargo, es posible que desee normalizar o agrupar solicitudes salientes similares utilizando expresiones regulares. Consulte la documentación del [registrador de solicitudes de salida lenta](#slow-outgoing-requests-recorder) para obtener más información.

<a id="cache-card"></a>
#### Caché

La tarjeta `<livewire:pulse.cache />` muestra las estadísticas de aciertos y errores de caché para su aplicación, tanto globalmente como para claves individuales.

De forma predeterminada, las entradas se agruparán por clave. Sin embargo, es posible que desees normalizar o agrupar claves similares utilizando expresiones regulares. Consulte la documentación del [registrador de interacciones de caché](#cache-interactions-recorder) para obtener más información.

<a id="capturing-entries"></a>
## Capturando entradas

La mayoría de las grabadoras Pulse capturarán automáticamente entradas basadas en eventos del marco enviados por Laravel. Sin embargo, el [servidor grabador](#servers-recorder) y algunas tarjetas de terceros deben sondear información periódicamente. Para utilizar estas tarjetas, debe ejecutar el demonio `pulse:check` en todos sus servidores de aplicaciones individuales:

```shell
php artisan pulse:check
```

> **Nota:**
> Para mantener el proceso `pulse:check` ejecutándose permanentemente en segundo plano, debe utilizar un monitor de proceso como Supervisor para asegurarse de que el comando no deje de ejecutarse.

Como el comando `pulse:check` es un proceso de larga duración, no verá cambios en su código base sin reiniciarlo. Debe reiniciar correctamente el comando llamando al comando `pulse:restart` durante el proceso de implementación de su aplicación:

```shell
php artisan pulse:restart
```

> **Nota:**
> Pulse usa [cache](../cache/) para almacenar señales de reinicio, por lo que debe verificar que un controlador de caché esté configurado correctamente para su aplicación antes de usar esta función.

<a id="recorders"></a>
### Grabadoras

Los registradores son responsables de capturar las entradas de su aplicación para registrarlas en la base de datos de Pulse. Los registradores se registran y configuran en la sección `recorders` del [Archivo de configuración de pulso](#configuration).

<a id="cache-interactions-recorder"></a>
#### Interacciones de caché

La grabadora `CacheInteractions` captura información sobre los [aciertos y errores de caché](../cache/) que ocurren en su aplicación para mostrarla en la tarjeta [Cache](#cache-card).

Opcionalmente, puede ajustar la [frecuencia de muestreo](#sampling) y los patrones de teclas ignorados.

También puede configurar la agrupación de claves para que claves similares se agrupen como una sola entrada. Por ejemplo, es posible que desee eliminar los ID únicos de las claves que almacenan en caché el mismo tipo de información. Los grupos se configuran mediante una expresión regular para "buscar y reemplazar" partes de la clave. Se incluye un ejemplo en el archivo de configuración:

```php
Recorders\CacheInteractions::class => [
    // ...
    'groups' => [
        // '/:\d+/' => ':*',
    ],
],
```

Se utilizará el primer patrón que coincida. Si ningún patrón coincide, la clave se capturará tal cual.

<a id="exceptions-recorder"></a>
#### Excepciones

La grabadora `Exceptions` captura información sobre las excepciones reportables que ocurren en su aplicación para mostrarla en la tarjeta [Excepciones](#exceptions-card).

Opcionalmente, puede ajustar la [frecuencia de muestreo](#sampling) y los patrones de excepción ignorados. También puede configurar si desea capturar la ubicación desde la que se originó la excepción. La ubicación capturada se mostrará en el panel de Pulse, lo que puede ayudar a rastrear el origen de la excepción; sin embargo, si se produce la misma excepción en varias ubicaciones, aparecerá varias veces para cada ubicación única.

<a id="queues-recorder"></a>
#### Colas

La grabadora `Queues` captura información sobre las colas de su aplicación para mostrarla en el archivo [Queues](#queues-card).

Opcionalmente, puede ajustar la [frecuencia de muestreo](#sampling) y los patrones de trabajos ignorados.

<a id="slow-jobs-recorder"></a>
#### Trabajos lentos

La grabadora `SlowJobs` captura información sobre trabajos lentos que ocurren en su aplicación para mostrarla en la tarjeta [Slow Jobs](#slow-jobs-recorder).

Opcionalmente, puede ajustar el umbral de trabajo lento, [frecuencia de muestreo](#sampling) y los patrones de trabajo ignorados.

Es posible que tenga algunos trabajos que espere que le lleven más tiempo que otros. En esos casos, puede configurar umbrales por trabajo:

```php
Recorders\SlowJobs::class => [
    // ...
    'threshold' => [
        '#^App\\Jobs\\GenerateYearlyReports$#' => 5000,
        'default' => env('PULSE_SLOW_JOBS_THRESHOLD', 1000),
    ],
],
```

Si ningún patrón de expresión regular coincide con el nombre de clase del trabajo, se utilizará el valor `'default'`.

<a id="slow-outgoing-requests-recorder"></a>
#### Solicitudes salientes lentas

La grabadora `SlowOutgoingRequests` captura información sobre las solicitudes HTTP salientes realizadas utilizando el [cliente HTTP](../http-client/) de Laravel que excede el umbral configurado para su visualización en la tarjeta [Solicitudes salientes lentas](#slow-outgoing-requests-card).

Opcionalmente, puede ajustar el umbral de solicitud de salida lenta, [tasa de muestreo](#sampling) y los patrones de URL ignorados.

Es posible que tenga algunas solicitudes salientes que espere que demoren más que otras. En esos casos, puede configurar umbrales por solicitud:

```php
Recorders\SlowOutgoingRequests::class => [
    // ...
    'threshold' => [
        '#backup.zip$#' => 5000,
        'default' => env('PULSE_SLOW_OUTGOING_REQUESTS_THRESHOLD', 1000),
    ],
],
```

Si ningún patrón de expresión regular coincide con la URL de la solicitud, se utilizará el valor `'default'`.

También puede configurar la agrupación de URL para que las URL similares se agrupen como una sola entrada. Por ejemplo, es posible que desee eliminar ID únicos de las rutas URL o agruparlos solo por dominio. Los grupos se configuran mediante una expresión regular para "buscar y reemplazar" partes de la URL. Algunos ejemplos se incluyen en el archivo de configuración:

```php
Recorders\SlowOutgoingRequests::class => [
    // ...
    'groups' => [
        // '#^https://api\.github\.com/repos/.*$#' => 'api.github.com/repos/*',
        // '#^https?://([^/]*).*$#' => '\1',
        // '#/\d+#' => '/*',
    ],
],
```

Se utilizará el primer patrón que coincida. Si ningún patrón coincide, la URL se capturará tal cual.

<a id="slow-queries-recorder"></a>
#### Consultas lentas

La grabadora `SlowQueries` captura cualquier consulta de base de datos en su aplicación que exceda el umbral configurado para mostrarse en la tarjeta [Slow Queries](#slow-queries-card).

Opcionalmente, puede ajustar el umbral de consulta lenta, [tasa de muestreo](#sampling) y los patrones de consulta ignorados. También puede configurar si desea capturar la ubicación de la consulta. La ubicación capturada se mostrará en el panel de Pulse, lo que puede ayudar a rastrear el origen de la consulta; sin embargo, si se realiza la misma consulta en varias ubicaciones, aparecerá varias veces para cada ubicación única.

Es posible que tenga algunas consultas que espere que demoren más que otras. En esos casos, puede configurar umbrales por consulta:

```php
Recorders\SlowQueries::class => [
    // ...
    'threshold' => [
        '#^insert into `yearly_reports`#' => 5000,
        'default' => env('PULSE_SLOW_QUERIES_THRESHOLD', 1000),
    ],
],
```

Si ningún patrón de expresión regular coincide con el SQL de la consulta, se utilizará el valor `'default'`.

<a id="slow-requests-recorder"></a>
#### Solicitudes lentas

La grabadora `Requests` captura información sobre las solicitudes realizadas a su aplicación para mostrarlas en las tarjetas [Solicitudes lentas](#slow-requests-card) y [Uso de aplicaciones](#application-usage-card)].

Opcionalmente, puede ajustar el umbral de ruta lenta, [tasa de muestreo](#sampling) y las rutas ignoradas.

Es posible que tenga algunas solicitudes que espere que demoren más que otras. En esos casos, puede configurar umbrales por solicitud:

```php
Recorders\SlowRequests::class => [
    // ...
    'threshold' => [
        '#^/admin/#' => 5000,
        'default' => env('PULSE_SLOW_REQUESTS_THRESHOLD', 1000),
    ],
],
```

Si ningún patrón de expresión regular coincide con la URL de la solicitud, se utilizará el valor `'default'`.

<a id="servers-recorder"></a>
#### Servidores

La grabadora `Servers` captura el uso de CPU, memoria y almacenamiento de los servidores que alimentan su aplicación para mostrarla en la tarjeta [Servers](#servers-card). Esta grabadora requiere que el comando [pulse:check](#capturing-entries) se ejecute en cada uno de los servidores que desea monitorear.

Cada servidor de informes debe tener un nombre exclusivo. De forma predeterminada, Pulse utilizará el valor devuelto por la función `gethostname` de PHP. Si desea personalizar esto, puede configurar la variable de entorno `PULSE_SERVER_NAME`:

```env
PULSE_SERVER_NAME=load-balancer
```

El archivo de configuración de Pulse también le permite personalizar los directorios que se monitorean.

<a id="user-jobs-recorder"></a>
#### Trabajos de usuario

La grabadora `UserJobs` captura información sobre los usuarios que envían trabajos en su aplicación para mostrarla en la tarjeta [Uso de la aplicación](#application-usage-card).

Opcionalmente, puede ajustar la [frecuencia de muestreo](#sampling) y los patrones de trabajo ignorados.

<a id="user-requests-recorder"></a>
#### Solicitudes de usuario

La grabadora `UserRequests` captura información sobre los usuarios que realizan solicitudes a su aplicación para mostrarla en la tarjeta [Uso de la aplicación](#application-usage-card).

Opcionalmente, puede ajustar la [frecuencia de muestreo](#sampling) y los patrones de URL ignorados.

<a id="filtering"></a>
### Filtrado

Como hemos visto, muchos [recorders](#recorders) ofrecen la posibilidad de, mediante configuración, "ignorar" las entradas entrantes en función de su valor, como la URL de una solicitud. Sin embargo, a veces puede resultar útil filtrar registros en función de otros factores, como el usuario actualmente autenticado. Para filtrar estos registros, puede pasar una función anónima al método `filter` de Pulse. Normalmente, el método `filter` debe invocarse dentro del método `boot` del `AppServiceProvider` de su aplicación:

```php
use Illuminate\Support\Facades\Auth;
use Laravel\Pulse\Entry;
use Laravel\Pulse\Facades\Pulse;
use Laravel\Pulse\Value;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Pulse::filter(function (Entry|Value $entry) {
        return Auth::user()->isNotAdmin();
    });

    // ...
}
```

<a id="performance"></a>
## Rendimiento

Pulse ha sido diseñado para integrarse en una aplicación existente sin requerir ninguna infraestructura adicional. Sin embargo, para aplicaciones de alto tráfico, existen varias formas de eliminar cualquier impacto que Pulse pueda tener en el rendimiento de su aplicación.

<a id="using-a-different-database"></a>
### Usando una base de datos diferente

Para aplicaciones de alto tráfico, es posible que prefiera utilizar una conexión de base de datos dedicada para Pulse para evitar afectar la base de datos de su aplicación.

Puede personalizar la [conexión de base de datos](../database/#configuration) utilizada por Pulse configurando la variable de entorno `PULSE_DB_CONNECTION`.

```env
PULSE_DB_CONNECTION=pulse
```

<a id="ingest"></a>
### Ingesta de Redis

> **Advertencia:**
> Redis Ingest requiere Redis 6.2 o superior y `phpredis` o `predis` como controlador de cliente Redis configurado para la aplicación.

De forma predeterminada, Pulse almacenará las entradas directamente en la [conexión de base de datos configurada](#using-a-different-database) después de que se haya enviado la respuesta HTTP al cliente o se haya procesado un trabajo; sin embargo, puede utilizar el controlador de ingesta Redis de Pulse para enviar entradas a una secuencia de Redis. Esto se puede habilitar configurando la variable de entorno `PULSE_INGEST_DRIVER`:

```ini
PULSE_INGEST_DRIVER=redis
```

Pulse utilizará su [conexión Redis ](../redis/#configuration) predeterminada de forma predeterminada, pero puede personalizarla a través de la variable de entorno `PULSE_REDIS_CONNECTION`:

```ini
PULSE_REDIS_CONNECTION=pulse
```

> **Advertencia:**
> Cuando utilice el controlador de ingesta de Redis, su instalación de Pulse siempre debe utilizar una conexión de Redis diferente a la de su cola alimentada por Redis, si corresponde.

Cuando utilice la ingesta de Redis, deberá ejecutar el comando `pulse:work` para monitorear la transmisión y mover entradas de Redis a las tablas de la base de datos de Pulse.

```shell
php artisan pulse:work
```

> **Nota:**
> Para mantener el proceso `pulse:work` ejecutándose permanentemente en segundo plano, debe utilizar un monitor de proceso como Supervisor para garantizar que el trabajador Pulse no deje de ejecutarse.

Como el comando `pulse:work` es un proceso de larga duración, no verá cambios en su código base sin reiniciarlo. Debe reiniciar correctamente el comando llamando al comando `pulse:restart` durante el proceso de implementación de su aplicación:

```shell
php artisan pulse:restart
```

> **Nota:**
> Pulse usa [cache](../cache/) para almacenar señales de reinicio, por lo que debe verificar que un controlador de caché esté configurado correctamente para su aplicación antes de usar esta función.

<a id="sampling"></a>
### Muestreo

De forma predeterminada, Pulse capturará todos los eventos relevantes que ocurran en su aplicación. Para aplicaciones de alto tráfico, esto puede resultar en la necesidad de agregar millones de filas de bases de datos en el panel, especialmente durante períodos de tiempo más largos.

En su lugar, puede optar por habilitar el "muestreo" en ciertos registradores de datos Pulse. Por ejemplo, configurar la frecuencia de muestreo en `0.1` en la grabadora [User Requests](#user-requests-recorder) significará que solo registrará aproximadamente el 10 % de las solicitudes en su aplicación. En el tablero, los valores se ampliarán y tendrán el prefijo `~` para indicar que son una aproximación.

En general, cuantas más entradas tenga para una métrica particular, más baja podrá establecer de forma segura la frecuencia de muestreo sin sacrificar demasiada precisión.

<a id="trimming"></a>
### Recorte

Pulse recortará automáticamente sus entradas almacenadas una vez que estén fuera de la ventana del tablero. El recorte se produce cuando se ingieren datos mediante un sistema de lotería que se puede personalizar en Pulse [archivo de configuración](#configuration).

<a id="pulse-exceptions"></a>
### Manejo de excepciones de pulso

Si se produce una excepción al capturar datos de Pulse, como por ejemplo no poder conectarse a la base de datos de almacenamiento, Pulse silenciosamente fallará para evitar afectar su aplicación.

Si desea personalizar cómo se manejan estas excepciones, puede proporcionar una función anónima al método `handleExceptionsUsing`:

```php
use Laravel\Pulse\Facades\Pulse;
use Illuminate\Support\Facades\Log;

Pulse::handleExceptionsUsing(function ($e) {
    Log::debug('An exception happened in Pulse', [
        'message' => $e->getMessage(),
        'stack' => $e->getTraceAsString(),
    ]);
});
```

<a id="custom-cards"></a>
## Tarjetas personalizadas

Pulse le permite crear tarjetas personalizadas para mostrar datos relevantes para las necesidades específicas de su aplicación. Pulse utiliza [Livewire](https://livewire.laravel.com), por lo que es posible que desee [revisar su documentación](https://livewire.laravel.com/docs) antes de crear su primera tarjeta personalizada.

<a id="custom-card-components"></a>
### Componentes de la tarjeta

La creación de una tarjeta personalizada en Laravel Pulse comienza extendiendo el componente base `Card` Livewire y definiendo la vista correspondiente:

```php
namespace App\Livewire\Pulse;

use Laravel\Pulse\Livewire\Card;
use Livewire\Attributes\Lazy;

#[Lazy]
class TopSellers extends Card
{
    public function render()
    {
        return view('livewire.pulse.top-sellers');
    }
}
```

Al utilizar la función [carga diferida](https://livewire.laravel.com/docs/lazy)] de Livewire, el componente `Card` proporcionará automáticamente un marcador de posición que respete los atributos `cols` y `rows` pasados ​​a su componente.

Al escribir la vista correspondiente de su tarjeta Pulse, puede aprovechar los componentes Blade de Pulse para obtener una apariencia consistente:

```blade
<x-pulse::card :cols="$cols" :rows="$rows" :class="$class" wire:poll.5s="">
    <x-pulse::card-header name="Top Sellers">
        <x-slot:icon>
            ...
        </x-slot:icon>
    </x-pulse::card-header>

    <x-pulse::scroll :expand="$expand">
        ...
    </x-pulse::scroll>
</x-pulse::card>
```

Las variables `$cols`, `$rows`, `$class` y `$expand` deben pasarse a sus respectivos componentes Blade para que el diseño de la tarjeta se pueda personalizar desde la vista del panel. También es posible que desee incluir el atributo `wire:poll.5s=""` en su vista para que la tarjeta se actualice automáticamente.

Una vez que haya definido su componente y plantilla Livewire, la tarjeta puede incluirse en su [vista del panel](#dashboard-customization):

```blade
<x-pulse>
    ...

    <livewire:pulse.top-sellers cols="4" />
</x-pulse>
```

> **Nota:**
> Si su tarjeta está incluida en un paquete, deberá registrar el componente con Livewire utilizando el método `Livewire::component`.

<a id="custom-card-styling"></a>
### Estilo

Si su tarjeta requiere un estilo adicional más allá de las clases y componentes incluidos con Pulse, existen algunas opciones para incluir CSS personalizado para sus tarjetas.

<a id="custom-card-styling-vite"></a>
#### Integración de Laravel Vite

Si su tarjeta personalizada se encuentra dentro de la base del código de su aplicación y está utilizando la integración de Vite ](../vite/) de Laravel, puede actualizar su archivo `vite.config.js` para incluir un punto de entrada CSS dedicado para su tarjeta:

```js
laravel({
    input: [
        'resources/css/pulse/top-sellers.css',
        // ...
    ],
}),
```

Luego puede usar la directiva Blade `@vite` en su [vista del tablero](#dashboard-customization), especificando el punto de entrada CSS para su tarjeta:

```blade
<x-pulse>
    @vite('resources/css/pulse/top-sellers.css')

    ...
</x-pulse>
```

<a id="custom-card-styling-css"></a>
#### Archivos CSS

Para otros casos de uso, incluidas las tarjetas Pulse contenidas en un paquete, puede indicarle a Pulse que cargue hojas de estilo adicionales definiendo un método `css` en su componente Livewire que devuelva la ruta del archivo CSS:

```php
class TopSellers extends Card
{
    // ...

    protected function css()
    {
        return __DIR__.'/../../dist/top-sellers.css';
    }
}
```

Cuando esta tarjeta se incluye en el tablero, Pulse incluirá automáticamente el contenido de este archivo dentro de una etiqueta `<style>`, por lo que no es necesario publicarlo en el directorio `public`.

<a id="custom-card-styling-tailwind"></a>
#### CSS de viento de cola

Cuando utilice Tailwind CSS, debe crear un punto de entrada CSS dedicado. El siguiente ejemplo excluye los estilos base [Preflight](https://tailwindcss.com/docs/preflight) de Tailwind que ya están incluidos en Pulse, y aplica el alcance de Tailwind usando un selector CSS para evitar conflictos con las clases Tailwind de Pulse:

```css
@import "tailwindcss/theme.css";

@custom-variant dark (&:where(.dark, .dark *));
@source "./../../views/livewire/pulse/top-sellers.blade.php";

@theme {
  /* ... */
}

#top-sellers {
  @import "tailwindcss/utilities.css" source(none);
}
```

También deberá incluir un atributo `id` o `class` en la vista de su tarjeta que coincida con el selector CSS en su punto de entrada:

```blade
<x-pulse::card id="top-sellers" :cols="$cols" :rows="$rows" class="$class">
    ...
</x-pulse::card>
```

<a id="custom-card-data"></a>
### Captura y agregación de datos

Las tarjetas personalizadas pueden recuperar y mostrar datos desde cualquier lugar; sin embargo, es posible que desee aprovechar el potente y eficiente sistema de agregación y registro de datos de Pulse.

<a id="custom-card-data-capture"></a>
#### Capturando entradas

Pulse le permite grabar "entradas" utilizando el método `Pulse::record`:

```php
use Laravel\Pulse\Facades\Pulse;

Pulse::record('user_sale', $user->id, $sale->amount)
    ->sum()
    ->count();
```

El primer argumento proporcionado al método `record` es el `type` para la entrada que está registrando, mientras que el segundo argumento es el `key` que determina cómo se deben agrupar los datos agregados. Para la mayoría de los métodos de agregación, también deberá especificar un `value` para agregar. En el ejemplo anterior, el valor que se agrega es `$sale->amount`. Luego puede invocar uno o más métodos de agregación (como `sum`) para que Pulse pueda capturar valores preagregados en "depósitos" para una recuperación eficiente más adelante.

Los métodos de agregación disponibles son:

* `avg`
* `count`
* `max`
* `min`
* `sum`

> **Nota:**
> Al crear un paquete de tarjeta que capture la ID de usuario actualmente autenticada, debe utilizar el método `Pulse::resolveAuthenticatedUserId()`, que respeta cualquier [personalización del solucionador de usuario](#dashboard-resolving-users) realizada en la aplicación.

<a id="custom-card-data-retrieval"></a>
#### Recuperando datos agregados

Al ampliar el componente `Card` Livewire de Pulse, puede utilizar el método `aggregate` para recuperar datos agregados para el período que se está viendo en el panel:

```php
class TopSellers extends Card
{
    public function render()
    {
        return view('livewire.pulse.top-sellers', [
            'topSellers' => $this->aggregate('user_sale', ['sum', 'count'])
        ]);
    }
}
```

El método `aggregate` devuelve una colección de objetos PHP `stdClass`. Cada objeto contendrá la propiedad `key` capturada anteriormente, junto con claves para cada uno de los agregados solicitados:

```blade
@foreach ($topSellers as $seller)
    {{ $seller->key }}
    {{ $seller->sum }}
    {{ $seller->count }}
@endforeach
```

Pulse recuperará principalmente datos de los depósitos preagregados; por lo tanto, los agregados especificados deben haberse capturado por adelantado utilizando el método `Pulse::record`. El segmento más antiguo generalmente quedará parcialmente fuera del período, por lo que Pulse agregará las entradas más antiguas para llenar el vacío y brindar un valor preciso para todo el período, sin necesidad de agregar todo el período en cada solicitud de encuesta.

También puede recuperar un valor total para un tipo determinado utilizando el método `aggregateTotal`. Por ejemplo, el siguiente método recuperaría el total de todas las ventas de los usuarios en lugar de agruparlas por usuario.

```php
$total = $this->aggregateTotal('user_sale', 'sum');
```

<a id="custom-card-displaying-users"></a>
#### Mostrando usuarios

Cuando trabaje con agregados que registran un ID de usuario como clave, puede resolver las claves de los registros de usuario utilizando el método `Pulse::resolveUsers`:

```php
$aggregates = $this->aggregate('user_sale', ['sum', 'count']);

$users = Pulse::resolveUsers($aggregates->pluck('key'));

return view('livewire.pulse.top-sellers', [
    'sellers' => $aggregates->map(fn ($aggregate) => (object) [
        'user' => $users->find($aggregate->key),
        'sum' => $aggregate->sum,
        'count' => $aggregate->count,
    ])
]);
```

El método `find` devuelve un objeto que contiene las claves `name`, `extra` y `avatar`, que opcionalmente puede pasar directamente al componente Blade `<x-pulse::user-card>`:

```blade
<x-pulse::user-card :user="{{ $seller->user }}" :stats="{{ $seller->sum }}" />
```

<a id="custom-recorders"></a>
#### Grabadoras personalizadas

Es posible que los autores de paquetes deseen proporcionar clases de grabadora para permitir a los usuarios configurar la captura de datos.

Los registradores se registran en la sección `recorders` del archivo de configuración `config/pulse.php` de la aplicación:

```php
[
    // ...
    'recorders' => [
        Acme\Recorders\Deployments::class => [
            // ...
        ],

        // ...
    ],
]
```

Las grabadoras pueden escuchar eventos especificando una propiedad `$listen`. Pulse registrará automáticamente a los oyentes y llamará al método `record` de las grabadoras:

```php
<?php

namespace Acme\Recorders;

use Acme\Events\Deployment;
use Illuminate\Support\Facades\Config;
use Laravel\Pulse\Facades\Pulse;

class Deployments
{
    /**
     * The events to listen for.
     *
     * @var array<int, class-string>
     */
    public array $listen = [
        Deployment::class,
    ];

    /**
     * Record the deployment.
     */
    public function record(Deployment $event): void
    {
        $config = Config::get('pulse.recorders.'.static::class);

        Pulse::record(
            // ...
        );
    }
}
```
