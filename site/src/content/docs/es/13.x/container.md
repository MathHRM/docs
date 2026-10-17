---
title: "Contenedor de servicio"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
    - [Resolución de configuración cero](#zero-configuration-resolution)
    - [Cuándo utilizar el contenedor](#when-to-use-the-container)
- [Encuadernación](#binding)
    - [Conceptos básicos de encuadernación](#binding-basics)
    - [Vinculación de interfaces a implementaciones](#binding-interfaces-to-implementations)
    - [Enlace contextual](#contextual-binding)
    - [Atributos contextuales](#contextual-attributes)
    - [Primitivas vinculantes](#binding-primitives)
    - [Variadics tipo vinculantes](#binding-typed-variadics)
    - [Etiquetado](#tagging)
    - [Extensión de enlaces](#extending-bindings)
- [Resolviendo](#resolving)
    - [El método de creación](#the-make-method)
    - [Inyección automática](#automatic-injection)
- [Método de Invocación e Inyección](#method-invocation-and-injection)
- [Eventos de contenedor](#container-events)
    - [Reencuadernación](#rebinding)
- [PSR-11](#psr-11)

<a id="introduction"></a>
## Introducción

El contenedor de servicios Laravel es una herramienta poderosa para administrar dependencias de clases y realizar inyección de dependencias. La inyección de dependencia es una frase elegante que esencialmente significa esto: las dependencias de clase se "inyectan" en la clase a través del constructor o, en algunos casos, métodos "establecedores".

Veamos un ejemplo sencillo:

```php
<?php

namespace App\Http\Controllers;

use App\Services\AppleMusic;
use Illuminate\View\View;

class PodcastController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct(
        protected AppleMusic $apple,
    ) {}

    /**
     * Show information about the given podcast.
     */
    public function show(string $id): View
    {
        return view('podcasts.show', [
            'podcast' => $this->apple->findPodcast($id)
        ]);
    }
}
```

En este ejemplo, el `PodcastController` necesita recuperar podcasts de una fuente de datos como Apple Music. Entonces, **inyectaremos** un servicio que sea capaz de recuperar podcasts. Dado que el servicio se inyecta, podemos "simular" fácilmente o crear una implementación ficticia del servicio `AppleMusic` al probar nuestra aplicación.

Un conocimiento profundo del contenedor de servicios de Laravel es esencial para crear una aplicación grande y potente, así como para contribuir al núcleo de Laravel.

<a id="zero-configuration-resolution"></a>
### Resolución de configuración cero

Si una clase no tiene dependencias o solo depende de otras clases concretas (no de interfaces), no es necesario instruir al contenedor sobre cómo resolver esa clase. Por ejemplo, puede colocar el siguiente código en su archivo `routes/web.php`:

```php
<?php

class Service
{
    // ...
}

Route::get('/', function (Service $service) {
    dd($service::class);
});
```

En este ejemplo, acceder a la ruta `/` de su aplicación resolverá automáticamente la clase `Service` y la inyectará en el controlador de su ruta. Esto cambia las reglas del juego. Significa que puede desarrollar su aplicación y aprovechar la inyección de dependencia sin preocuparse por archivos de configuración inflados.

Afortunadamente, muchas de las clases que escribirá al crear una aplicación Laravel reciben automáticamente sus dependencias a través del contenedor, incluidos [controllers](../controllers/), [event listeningers](../events/), [middleware](../middleware/) y más. Además, puede escribir sugerencias de dependencias en el método `handle` de [trabajos en cola](../queues/). Una vez que prueba el poder de la inyección automática y de dependencia de configuración cero, parece imposible desarrollarse sin ella.

<a id="when-to-use-the-container"></a>
### Cuándo utilizar el contenedor

Gracias a la resolución de configuración cero, a menudo escribirá sugerencias de dependencias en rutas, controladores, detectores de eventos y otros lugares sin siquiera interactuar manualmente con el contenedor. Por ejemplo, puede escribir una sugerencia del objeto `Illuminate\Http\Request` en su definición de ruta para poder acceder fácilmente a la solicitud actual. Aunque nunca tenemos que interactuar con el contenedor para escribir este código, este gestiona la inyección de estas dependencias detrás de escena:

```php
use Illuminate\Http\Request;

Route::get('/', function (Request $request) {
    // ...
});
```

En muchos casos, gracias a la inyección automática de dependencias y [facades](../facades/), puede crear aplicaciones Laravel sin **nunca** vincular o resolver manualmente nada desde el contenedor. **Entonces, ¿cuándo interactuarías manualmente con el contenedor?** Examinemos dos situaciones.

Primero, si escribe una clase que implementa una interfaz y desea escribir una sugerencia de esa interfaz en una ruta o constructor de clase, debe [decirle al contenedor cómo resolver esa interfaz](#binding-interfaces-to-implementations). En segundo lugar, si está [escribiendo un paquete Laravel](../packages/) que planea compartir con otros desarrolladores de Laravel, es posible que deba vincular los servicios de su paquete al contenedor.

<a id="binding"></a>
## vinculante

<a id="binding-basics"></a>
### Conceptos básicos de encuadernación

<a id="simple-bindings"></a>
#### Enlaces simples

Casi todos los enlaces de su contenedor de servicios se registrarán en [proveedores de servicios](../providers/), por lo que la mayoría de estos ejemplos demostrarán el uso del contenedor en ese contexto.

Dentro de un proveedor de servicios, siempre tiene acceso al contenedor a través de la propiedad `$this->app`. Podemos registrar un enlace usando el método `bind`, pasando el nombre de la clase o interfaz que deseamos registrar junto con una función anónima que devuelva una instancia de la clase:

```php
use App\Services\Transistor;
use App\Services\PodcastParser;
use Illuminate\Contracts\Foundation\Application;

$this->app->bind(Transistor::class, function (Application $app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

Tenga en cuenta que recibimos el contenedor en sí como argumento para el solucionador. Luego podemos usar el contenedor para resolver subdependencias del objeto que estamos construyendo.

Como se mencionó, normalmente interactuará con el contenedor dentro de los proveedores de servicios; sin embargo, si desea interactuar con el contenedor fuera de un proveedor de servicios, puede hacerlo a través de `App` [facade](../facades/):

```php
use App\Services\Transistor;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\Facades\App;

App::bind(Transistor::class, function (Application $app) {
    // ...
});
```

Puede utilizar el método `bindIf` para registrar un enlace de contenedor solo si aún no se ha registrado un enlace para el tipo determinado:

```php
$this->app->bindIf(Transistor::class, function (Application $app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

Para mayor comodidad, puede omitir proporcionar el nombre de clase o interfaz que desea registrar como un argumento separado y en su lugar permitir que Laravel infiera el tipo del tipo de retorno de la función anónima que proporciona al método `bind`:

```php
App::bind(function (Application $app): Transistor {
    return new Transistor($app->make(PodcastParser::class));
});
```

> **Nota:**
> No es necesario vincular clases al contenedor si no dependen de ninguna interfaz. No es necesario que se le indique al contenedor cómo construir estos objetos, ya que puede resolverlos automáticamente mediante la reflexión.

<a id="binding-a-singleton"></a>
#### Vinculación de un singleton

El método `singleton` vincula una clase o interfaz al contenedor que solo debe resolverse una vez. Una vez que se resuelve un enlace singleton, se devolverá la misma instancia de objeto en llamadas posteriores al contenedor:

```php
use App\Services\Transistor;
use App\Services\PodcastParser;
use Illuminate\Contracts\Foundation\Application;

$this->app->singleton(Transistor::class, function (Application $app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

Puede utilizar el método `singletonIf` para registrar un enlace de contenedor singleton solo si aún no se ha registrado un enlace para el tipo determinado:

```php
$this->app->singletonIf(Transistor::class, function (Application $app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

<a id="singleton-attribute"></a>
#### Atributo único

Alternativamente, puede marcar una interfaz o clase con el atributo `#[Singleton]` para indicarle al contenedor que debe resolverse una vez:

```php
<?php

namespace App\Services;

use Illuminate\Container\Attributes\Singleton;

#[Singleton]
class Transistor
{
    // ...
}
```

<a id="binding-scoped"></a>
#### Enlace de singletons con alcance

El método `scoped` vincula una clase o interfaz al contenedor que solo debe resolverse una vez dentro de un determinado ciclo de vida de solicitud/trabajo de Laravel. Si bien este método es similar al método `singleton`, las instancias registradas usando el método `scoped` se eliminarán cada vez que la aplicación Laravel inicie un nuevo "ciclo de vida", como cuando un trabajador [Laravel Octane](../octane/) procesa una nueva solicitud o cuando un trabajador de cola Laravel [](../queues/) procesa un nuevo trabajo:

```php
use App\Services\Transistor;
use App\Services\PodcastParser;
use Illuminate\Contracts\Foundation\Application;

$this->app->scoped(Transistor::class, function (Application $app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

Puede utilizar el método `scopedIf` para registrar un enlace de contenedor con ámbito solo si aún no se ha registrado un enlace para el tipo determinado:

```php
$this->app->scopedIf(Transistor::class, function (Application $app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

<a id="scoped-attribute"></a>
#### Atributo de ámbito

Alternativamente, puede marcar una interfaz o clase con el atributo `#[Scoped]` para indicarle al contenedor que debe resolverse una vez dentro de una solicitud/ciclo de vida de trabajo de Laravel determinado:

```php
<?php

namespace App\Services;

use Illuminate\Container\Attributes\Scoped;

#[Scoped]
class Transistor
{
    // ...
}
```

<a id="binding-instances"></a>
#### Instancias de enlace

También puede vincular una instancia de objeto existente al contenedor utilizando el método `instance`. La instancia dada siempre se devolverá en llamadas posteriores al contenedor:

```php
use App\Services\Transistor;
use App\Services\PodcastParser;

$service = new Transistor(new PodcastParser);

$this->app->instance(Transistor::class, $service);
```

<a id="binding-interfaces-to-implementations"></a>
### Enlace de interfaces a implementaciones

Una característica muy poderosa del contenedor de servicios es su capacidad para vincular una interfaz a una implementación determinada. Por ejemplo, supongamos que tenemos una interfaz `EventPusher` y una implementación `RedisEventPusher`. Una vez que hayamos codificado nuestra implementación `RedisEventPusher` de esta interfaz, podemos registrarla en el contenedor de servicios de esta manera:

```php
use App\Contracts\EventPusher;
use App\Services\RedisEventPusher;

$this->app->bind(EventPusher::class, RedisEventPusher::class);
```

Esta declaración le dice al contenedor que debe inyectar `RedisEventPusher` cuando una clase necesita una implementación de `EventPusher`. Ahora podemos escribir sugerencias para la interfaz `EventPusher` en el constructor de una clase resuelta por el contenedor. Recuerde, los controladores, detectores de eventos, middleware y varios otros tipos de clases dentro de las aplicaciones Laravel siempre se resuelven utilizando el contenedor:

```php
use App\Contracts\EventPusher;

/**
 * Create a new class instance.
 */
public function __construct(
    protected EventPusher $pusher,
) {}
```

<a id="bind-attribute"></a>
#### Atributo de enlace

Laravel también proporciona un atributo `Bind` para mayor comodidad. Puede aplicar este atributo a cualquier interfaz para indicarle a Laravel qué implementación debe inyectarse automáticamente cada vez que se solicite esa interfaz. Al utilizar el atributo `Bind`, no es necesario realizar ningún registro de servicio adicional en los proveedores de servicios de su aplicación.

Además, se pueden colocar múltiples atributos `Bind` en una interfaz para configurar una implementación diferente que se debe inyectar para un conjunto determinado de entornos:

```php
<?php

namespace App\Contracts;

use App\Services\FakeEventPusher;
use App\Services\RedisEventPusher;
use Illuminate\Container\Attributes\Bind;

#[Bind(RedisEventPusher::class)]
#[Bind(FakeEventPusher::class, environments: ['local', 'testing'])]
interface EventPusher
{
    // ...
}
```

Además, se pueden aplicar los atributos [Singleton](#singleton-attribute) y [Scoped](#scoped-attribute)] para indicar si los enlaces del contenedor deben resolverse una vez o una vez por solicitud/ciclo de vida del trabajo:

```php
use App\Services\RedisEventPusher;
use Illuminate\Container\Attributes\Bind;
use Illuminate\Container\Attributes\Singleton;

#[Bind(RedisEventPusher::class)]
#[Singleton]
interface EventPusher
{
    // ...
}
```

Para enlaces que dependen de una condición arbitraria, puede utilizar el atributo `BindWhen`. La función anónima puede recibir el contenedor y debe devolver `true` cuando se debe aplicar la vinculación. Los atributos `Bind` y `BindWhen` se evalúan en el orden en que se declaran:

```php
use App\Services\BetaEventPusher;
use Illuminate\Container\Attributes\BindWhen;
use Laravel\Pennant\Feature;

#[BindWhen(BetaEventPusher::class, static fn () => Feature::active('beta-events'))]
interface EventPusher
{
    // ...
}
```

> **Nota:**
> El atributo `BindWhen` requiere PHP 8.5 o superior.

<a id="contextual-binding"></a>
### Enlace contextual

A veces es posible que tenga dos clases que utilicen la misma interfaz, pero desee inyectar implementaciones diferentes en cada clase. Por ejemplo, dos controladores pueden depender de diferentes implementaciones del `Illuminate\Contracts\Filesystem\Filesystem` [contrato](../contracts/). Laravel proporciona una interfaz sencilla y fluida para definir este comportamiento:

```php
use App\Http\Controllers\PhotoController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\VideoController;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Support\Facades\Storage;

$this->app->when(PhotoController::class)
    ->needs(Filesystem::class)
    ->give(function () {
        return Storage::disk('local');
    });

$this->app->when([VideoController::class, UploadController::class])
    ->needs(Filesystem::class)
    ->give(function () {
        return Storage::disk('s3');
    });
```

<a id="contextual-attributes"></a>
### Atributos contextuales

Dado que el enlace contextual se utiliza a menudo para inyectar implementaciones de controladores o valores de configuración, Laravel ofrece una variedad de atributos de enlace contextual que permiten inyectar este tipo de valores sin definir manualmente los enlaces contextuales en sus proveedores de servicios.

Por ejemplo, el atributo `Storage` se puede utilizar para inyectar un [disco de almacenamiento](../filesystem/):

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Container\Attributes\Storage;
use Illuminate\Contracts\Filesystem\Filesystem;

class PhotoController extends Controller
{
    public function __construct(
        #[Storage('local')] protected Filesystem $filesystem
    ) {
        // ...
    }
}
```

Además del atributo `Storage`, Laravel ofrece `Auth`, `Cache`, `Config`, `Context`, `DB`, `Give`, `Log`, `RequestAttribute`, `RouteParameter` y [Atributos Tag](#tagging):

```php
<?php

namespace App\Http\Controllers;

use App\Contracts\UserRepository;
use App\Models\Organization;
use App\Models\Photo;
use App\Repositories\DatabaseRepository;
use Illuminate\Container\Attributes\Auth;
use Illuminate\Container\Attributes\Cache;
use Illuminate\Container\Attributes\Config;
use Illuminate\Container\Attributes\Context;
use Illuminate\Container\Attributes\DB;
use Illuminate\Container\Attributes\Give;
use Illuminate\Container\Attributes\Log;
use Illuminate\Container\Attributes\RequestAttribute;
use Illuminate\Container\Attributes\RouteParameter;
use Illuminate\Container\Attributes\Tag;
use Illuminate\Contracts\Auth\Guard;
use Illuminate\Contracts\Cache\Repository;
use Illuminate\Database\Connection;
use Psr\Log\LoggerInterface;

class PhotoController extends Controller
{
    public function __construct(
        #[Auth('web')] protected Guard $auth,
        #[Cache('redis')] protected Repository $cache,
        #[Config('app.timezone')] protected string $timezone,
        #[Context('uuid')] protected string $uuid,
        #[Context('ulid', hidden: true)] protected string $ulid,
        #[DB('mysql')] protected Connection $connection,
        #[Give(DatabaseRepository::class)] protected UserRepository $users,
        #[Log('daily')] protected LoggerInterface $log,
        #[RequestAttribute('organization')] protected Organization $organization,
        #[RouteParameter] protected Photo $photo,
        #[Tag('reports')] protected iterable $reports,
    ) {
        // ...
    }
}
```

El atributo `RouteParameter` resolverá el parámetro de ruta que coincide con el nombre de la variable. Si es necesario, puede especificar explícitamente el nombre del parámetro de ruta: `#[RouteParameter('photo')]`.

El atributo `RequestAttribute` resolverá el valor almacenado bajo la clave dada en la [bolsa de atributos](https://symfony.com/doc/current/components/http_foundation.html#accessing-request-data): `#[RequestAttribute('organization')]` de la solicitud actual.

Además, Laravel proporciona un atributo `CurrentUser` para inyectar el usuario actualmente autenticado en una ruta o clase determinada:

```php
use App\Models\User;
use Illuminate\Container\Attributes\CurrentUser;

Route::get('/user', function (#[CurrentUser] User $user) {
    return $user;
})->middleware('auth');
```

<a id="defining-custom-attributes"></a>
#### Definición de atributos personalizados

Puede crear sus propios atributos contextuales implementando el contrato `Illuminate\Contracts\Container\ContextualAttribute`. El contenedor llamará al método `resolve` de su atributo, que debería resolver el valor que debe inyectarse en la clase utilizando el atributo. En el siguiente ejemplo, volveremos a implementar el atributo `Config` integrado de Laravel:

```php
<?php

namespace App\Attributes;

use Attribute;
use Illuminate\Contracts\Container\Container;
use Illuminate\Contracts\Container\ContextualAttribute;
use ReflectionParameter;

#[Attribute(Attribute::TARGET_PARAMETER)]
class Config implements ContextualAttribute
{
    /**
     * Create a new attribute instance.
     */
    public function __construct(public string $key, public mixed $default = null)
    {
    }

    /**
     * Resolve the configuration value.
     *
     * @param  self  $attribute
     * @param  \Illuminate\Contracts\Container\Container  $container
     * @param  \ReflectionParameter  $parameter
     * @return mixed
     */
    public static function resolve(self $attribute, Container $container, ReflectionParameter $parameter)
    {
        return $container->make('config')->get($attribute->key, $attribute->default);
    }
}
```

<a id="binding-primitives"></a>
### Primitivas vinculantes

A veces es posible que tenga una clase que reciba algunas clases inyectadas, pero que también necesite un valor primitivo inyectado, como un número entero. Puede utilizar fácilmente el enlace contextual para inyectar cualquier valor que su clase pueda necesitar:

```php
use App\Http\Controllers\UserController;

$this->app->when(UserController::class)
    ->needs('$variableName')
    ->give($value);
```

A veces, una clase puede depender de una serie de instancias [tagged](#tagging). Usando el método `giveTagged`, puedes inyectar fácilmente todos los enlaces del contenedor con esa etiqueta:

```php
$this->app->when(ReportAggregator::class)
    ->needs('$reports')
    ->giveTagged('reports');
```

Si necesita inyectar un valor de uno de los archivos de configuración de su aplicación, puede usar el método `giveConfig`:

```php
$this->app->when(ReportAggregator::class)
    ->needs('$timezone')
    ->giveConfig('app.timezone');
```

<a id="binding-typed-variadics"></a>
### Variádicas escritas vinculantes

Ocasionalmente, es posible que tengas una clase que reciba una matriz de objetos escritos usando un argumento de constructor variado:

```php
<?php

use App\Models\Filter;
use App\Services\Logger;

class Firewall
{
    /**
     * The filter instances.
     *
     * @var array
     */
    protected $filters;

    /**
     * Create a new class instance.
     */
    public function __construct(
        protected Logger $logger,
        Filter ...$filters,
    ) {
        $this->filters = $filters;
    }
}
```

Usando el enlace contextual, puede resolver esta dependencia proporcionando al método `give` una función anónima que devuelva una matriz de instancias `Filter` resueltas:

```php
$this->app->when(Firewall::class)
    ->needs(Filter::class)
    ->give(function (Application $app) {
          return [
              $app->make(NullFilter::class),
              $app->make(ProfanityFilter::class),
              $app->make(TooLongFilter::class),
          ];
    });
```

Para mayor comodidad, también puede proporcionar una serie de nombres de clases para que el contenedor los resuelva siempre que `Firewall` necesite instancias de `Filter`:

```php
$this->app->when(Firewall::class)
    ->needs(Filter::class)
    ->give([
        NullFilter::class,
        ProfanityFilter::class,
        TooLongFilter::class,
    ]);
```

<a id="variadic-tag-dependencies"></a>
#### Dependencias de etiquetas variables

A veces, una clase puede tener una dependencia variable que se insinúa como una clase determinada (`Report ...$reports`). Usando los métodos `needs` y `giveTagged`, puedes inyectar fácilmente todos los enlaces del contenedor con esa [etiqueta](#tagging) para la dependencia dada:

```php
$this->app->when(ReportAggregator::class)
    ->needs(Report::class)
    ->giveTagged('reports');
```

<a id="tagging"></a>
### Etiquetado

En ocasiones, es posible que necesite resolver toda una determinada "categoría" de vinculación. Por ejemplo, quizás esté creando un analizador de informes que reciba una serie de muchas implementaciones de interfaz `Report` diferentes. Después de registrar las implementaciones `Report`, puede asignarles una etiqueta utilizando el método `tag`:

```php
$this->app->bind(CpuReport::class, function () {
    // ...
});

$this->app->bind(MemoryReport::class, function () {
    // ...
});

$this->app->tag([CpuReport::class, MemoryReport::class], 'reports');
```

Una vez que los servicios hayan sido etiquetados, podrá resolverlos todos fácilmente mediante el método `tagged` del contenedor:

```php
$this->app->bind(ReportAnalyzer::class, function (Application $app) {
    return new ReportAnalyzer($app->tagged('reports'));
});
```

<a id="extending-bindings"></a>
### Ampliar enlaces

El método `extend` permite la modificación de servicios resueltos. Por ejemplo, cuando se resuelve un servicio, puede ejecutar código adicional para decorar o configurar el servicio. El método `extend` acepta dos argumentos, la clase de servicio que está extendiendo y una función anónima que debería devolver el servicio modificado. La función anónima recibe el servicio que se está resolviendo y la instancia del contenedor:

```php
$this->app->extend(Service::class, function (Service $service, Application $app) {
    return new DecoratedService($service);
});
```

<a id="resolving"></a>
## Resolviendo

<a id="the-make-method"></a>
### El método `make`

Puede utilizar el método `make` para resolver una instancia de clase desde el contenedor. El método `make` acepta el nombre de la clase o interfaz que desea resolver:

```php
use App\Services\Transistor;

$transistor = $this->app->make(Transistor::class);
```

Si algunas de las dependencias de su clase no se pueden resolver a través del contenedor, puede inyectarlas pasándolas como una matriz asociativa al método `makeWith`. Por ejemplo, podemos pasar manualmente el argumento del constructor `$id` requerido por el servicio `Transistor`:

```php
use App\Services\Transistor;

$transistor = $this->app->makeWith(Transistor::class, ['id' => 1]);
```

El método `bound` se puede utilizar para determinar si una clase o interfaz se ha vinculado explícitamente en el contenedor:

```php
if ($this->app->bound(Transistor::class)) {
    // ...
}
```

Si está fuera de un proveedor de servicios en una ubicación de su código que no tiene acceso a la variable `$app`, puede usar `App` [facade](../facades/) o `app` [helper](../helpers/#method-app) para resolver una instancia de clase desde el contenedor:

```php
use App\Services\Transistor;
use Illuminate\Support\Facades\App;

$transistor = App::make(Transistor::class);

$transistor = app(Transistor::class);
```

Si desea que la instancia del contenedor Laravel se inyecte en una clase que el contenedor está resolviendo, puede escribir una pista de la clase `Illuminate\Container\Container` en el constructor de su clase:

```php
use Illuminate\Container\Container;

/**
 * Create a new class instance.
 */
public function __construct(
    protected Container $container,
) {}
```

<a id="automatic-injection"></a>
### Inyección automática

Alternativamente, y lo que es más importante, puede escribir una pista de la dependencia en el constructor de una clase que se resuelve mediante el contenedor, incluidos [controllers](../controllers/), [event listeningers](../events/), [middleware](../middleware/) y más. Además, puede escribir sugerencias de dependencias en el método `handle` de [trabajos en cola](../queues/). En la práctica, así es como el contenedor debería resolver la mayoría de sus objetos.

Por ejemplo, puede escribir sugerencias sobre un servicio definido por su aplicación en el constructor de un controlador. El servicio se resolverá e inyectará automáticamente en la clase:

```php
<?php

namespace App\Http\Controllers;

use App\Services\AppleMusic;

class PodcastController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct(
        protected AppleMusic $apple,
    ) {}

    /**
     * Show information about the given podcast.
     */
    public function show(string $id): Podcast
    {
        return $this->apple->findPodcast($id);
    }
}
```

<a id="method-invocation-and-injection"></a>
## Invocación e inyección de métodos

A veces es posible que desees invocar un método en una instancia de objeto mientras permites que el contenedor inyecte automáticamente las dependencias de ese método. Por ejemplo, dada la siguiente clase:

```php
<?php

namespace App;

use App\Services\AppleMusic;

class PodcastStats
{
    /**
     * Generate a new podcast stats report.
     */
    public function generate(AppleMusic $apple): array
    {
        return [
            // ...
        ];
    }
}
```

Puede invocar el método `generate` a través del contenedor de esta manera:

```php
use App\PodcastStats;
use Illuminate\Support\Facades\App;

$stats = App::call([new PodcastStats, 'generate']);
```

El método `call` acepta cualquier PHP invocable. El método `call` del contenedor puede incluso usarse para invocar una función anónima mientras se inyectan automáticamente sus dependencias:

```php
use App\Services\AppleMusic;
use Illuminate\Support\Facades\App;

$result = App::call(function (AppleMusic $apple) {
    // ...
});
```

<a id="container-events"></a>
## Eventos de contenedores

El contenedor de servicios activa un evento cada vez que resuelve un objeto. Puedes escuchar este evento usando el método `resolving`:

```php
use App\Services\Transistor;
use Illuminate\Contracts\Foundation\Application;

$this->app->resolving(Transistor::class, function (Transistor $transistor, Application $app) {
    // Called when container resolves objects of type "Transistor"...
});

$this->app->resolving(function (mixed $object, Application $app) {
    // Called when container resolves object of any type...
});
```

Como puede ver, el objeto que se está resolviendo se pasará a la devolución de llamada, lo que le permitirá establecer propiedades adicionales en el objeto antes de entregárselo a su consumidor.

<a id="rebinding"></a>
### Reenlazando

El método `rebinding` le permite escuchar cuándo un servicio se vuelve a vincular al contenedor, lo que significa que se registra nuevamente o se anula después de su vinculación inicial. Esto puede resultar útil cuando necesita actualizar dependencias o modificar el comportamiento cada vez que se actualiza un enlace específico:

```php
use App\Contracts\PodcastPublisher;
use App\Services\SpotifyPublisher;
use App\Services\TransistorPublisher;
use Illuminate\Contracts\Foundation\Application;

$this->app->bind(PodcastPublisher::class, SpotifyPublisher::class);

$this->app->rebinding(
    PodcastPublisher::class,
    function (Application $app, PodcastPublisher $newInstance) {
        //
    },
);

// New binding will trigger rebinding closure...
$this->app->bind(PodcastPublisher::class, TransistorPublisher::class);
```

<a id="psr-11"></a>
## PSR-11

El contenedor de servicios de Laravel implementa la interfaz [PSR-11](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-11-container.md). Por lo tanto, puede escribir una sugerencia en la interfaz del contenedor PSR-11 para obtener una instancia del contenedor Laravel:

```php
use App\Services\Transistor;
use Psr\Container\ContainerInterface;

Route::get('/', function (ContainerInterface $container) {
    $service = $container->get(Transistor::class);

    // ...
});
```

Se lanza una excepción si el identificador proporcionado no se puede resolver. La excepción será una instancia de `Psr\Container\NotFoundExceptionInterface` si el identificador nunca estuvo vinculado. Si el identificador estaba vinculado pero no se pudo resolver, se generará una instancia de `Psr\Container\ContainerExceptionInterface`.
