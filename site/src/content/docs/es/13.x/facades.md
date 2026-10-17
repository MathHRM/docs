---
title: "Fachadas"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Cuándo utilizar Fachadas](#when-to-use-facades)
    - [Fachadas vs Inyección de Dependencia](#facades-vs-dependency-injection)
    - [Fachadas vs. Funciones auxiliares](#facades-vs-helper-functions)
- [Cómo funcionan las fachadas](#how-facades-work)
- [Fachadas en Tiempo Real](#real-time-facades)
- [Referencia de Clase de Fachada](#facade-class-reference)

<a id="introduction"></a>
## Introducción

A lo largo de la documentación de Laravel, verá ejemplos de código que interactúa con las funciones de Laravel a través de "fachadas". Las fachadas proporcionan una interfaz "estática" para las clases que están disponibles en el [contenedor de servicios](../container/). Laravel viene con muchas fachadas que brindan acceso a casi todas las funciones de Laravel.

Las fachadas de Laravel sirven como "proxies estáticos" para las clases subyacentes en el contenedor de servicios, brindando el beneficio de una sintaxis concisa y expresiva al tiempo que mantienen más capacidad de prueba y flexibilidad que los métodos estáticos tradicionales. Está perfectamente bien si no entiendes totalmente cómo funcionan las fachadas; simplemente sigue la corriente y continúa aprendiendo sobre Laravel.

Todas las fachadas de Laravel están definidas en el espacio de nombres `Illuminate\Support\Facades`. Así, podemos acceder fácilmente a una fachada así:

```php
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;

Route::get('/cache', function () {
    return Cache::get('key');
});
```

A lo largo de la documentación de Laravel, muchos de los ejemplos utilizarán fachadas para demostrar diversas características del marco.

<a id="helper-functions"></a>
#### Funciones auxiliares

Para complementar las fachadas, Laravel ofrece una variedad de "funciones auxiliares" globales que hacen que sea aún más fácil interactuar con las características comunes de Laravel. Algunas de las funciones auxiliares comunes con las que puede interactuar son `view`, `response`, `url`, `config` y más. Cada función auxiliar ofrecida por Laravel está documentada con su característica correspondiente; sin embargo, hay una lista completa disponible en la [documentación auxiliar](../helpers/).

Por ejemplo, en lugar de usar la fachada `Illuminate\Support\Facades\Response` para generar una respuesta JSON, podemos simplemente usar la función `response`. Debido a que las funciones auxiliares están disponibles globalmente, no es necesario importar ninguna clase para poder usarlas:

```php
use Illuminate\Support\Facades\Response;

Route::get('/users', function () {
    return Response::json([
        // ...
    ]);
});

Route::get('/users', function () {
    return response()->json([
        // ...
    ]);
});
```

<a id="when-to-use-facades"></a>
## Cuándo utilizar fachadas

Las fachadas tienen muchos beneficios. Proporcionan una sintaxis concisa y memorable que le permite utilizar las funciones de Laravel sin recordar nombres de clases largos que deben inyectarse o configurarse manualmente. Además, debido a su uso exclusivo de los métodos dinámicos de PHP, son fáciles de probar.

Sin embargo, se debe tener cierto cuidado al utilizar fachadas. El principal peligro de las fachadas es el "deslizamiento del alcance" de clase. Dado que las fachadas son tan fáciles de usar y no requieren inyección, puede resultar fácil dejar que sus clases sigan creciendo y utilizar muchas fachadas en una sola clase. Al utilizar la inyección de dependencia, este potencial se mitiga mediante la retroalimentación visual que le brinda un constructor grande de que su clase está creciendo demasiado. Por lo tanto, al utilizar fachadas, preste especial atención al tamaño de su clase para que su ámbito de responsabilidad sea limitado. Si su clase se está volviendo demasiado grande, considere dividirla en varias clases más pequeñas.

<a id="facades-vs-dependency-injection"></a>
### Fachadas vs. Inyección de Dependencia

Uno de los principales beneficios de la inyección de dependencia es la capacidad de intercambiar implementaciones de la clase inyectada. Esto es útil durante las pruebas, ya que puede inyectar un simulacro o un código auxiliar y afirmar que se llamaron varios métodos en el código auxiliar.

Normalmente, no sería posible simular o eliminar un método de clase verdaderamente estático. Sin embargo, dado que las fachadas utilizan métodos dinámicos para enviar llamadas a métodos a objetos resueltos desde el contenedor de servicios, en realidad podemos probar las fachadas tal como lo haríamos con una instancia de clase inyectada. Por ejemplo, dada la siguiente ruta:

```php
use Illuminate\Support\Facades\Cache;

Route::get('/cache', function () {
    return Cache::get('key');
});
```

Usando los métodos de prueba de fachada de Laravel, podemos escribir la siguiente prueba para verificar que el método `Cache::get` fue llamado con el argumento que esperábamos:

```php tab=Pest
use Illuminate\Support\Facades\Cache;

test('basic example', function () {
    Cache::shouldReceive('get')
        ->with('key')
        ->andReturn('value');

    $response = $this->get('/cache');

    $response->assertSee('value');
});
```

```php tab=PHPUnit
use Illuminate\Support\Facades\Cache;

/**
 * A basic functional test example.
 */
public function test_basic_example(): void
{
    Cache::shouldReceive('get')
        ->with('key')
        ->andReturn('value');

    $response = $this->get('/cache');

    $response->assertSee('value');
}
```

<a id="facades-vs-helper-functions"></a>
### Fachadas versus funciones auxiliares

Además de las fachadas, Laravel incluye una variedad de funciones "ayudantes" que pueden realizar tareas comunes como generar vistas, activar eventos, enviar trabajos o enviar respuestas HTTP. Muchas de estas funciones auxiliares cumplen la misma función que una fachada correspondiente. Por ejemplo, esta llamada de fachada y la llamada de ayuda son equivalentes:

```php
return Illuminate\Support\Facades\View::make('profile');

return view('profile');
```

No existe absolutamente ninguna diferencia práctica entre fachadas y funciones auxiliares. Cuando utilice funciones auxiliares, aún puede probarlas exactamente como lo haría con la fachada correspondiente. Por ejemplo, dada la siguiente ruta:

```php
Route::get('/cache', function () {
    return cache('key');
});
```

El asistente `cache` llamará al método `get` en la clase subyacente a la fachada `Cache`. Entonces, aunque estemos usando la función auxiliar, podemos escribir la siguiente prueba para verificar que el método fue llamado con el argumento que esperábamos:

```php
use Illuminate\Support\Facades\Cache;

/**
 * A basic functional test example.
 */
public function test_basic_example(): void
{
    Cache::shouldReceive('get')
        ->with('key')
        ->andReturn('value');

    $response = $this->get('/cache');

    $response->assertSee('value');
}
```

<a id="how-facades-work"></a>
## Cómo funcionan las fachadas

En una aplicación Laravel, una fachada es una clase que proporciona acceso a un objeto desde el contenedor. La maquinaria que hace que esto funcione es de la clase `Facade`. Las fachadas de Laravel y cualquier fachada personalizada que cree ampliarán la clase base `Illuminate\Support\Facades\Facade`.

La clase base `Facade` utiliza el método mágico `__callStatic()` para diferir llamadas desde su fachada a un objeto resuelto desde el contenedor. En el siguiente ejemplo, se realiza una llamada al sistema de caché de Laravel. Al echar un vistazo a este código, se podría suponer que se está llamando al método estático `get` en la clase `Cache`:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Cache;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * Show the profile for the given user.
     */
    public function showProfile(string $id): View
    {
        $user = Cache::get('user:'.$id);

        return view('profile', ['user' => $user]);
    }
}
```

Observe que cerca de la parte superior del archivo estamos "importando" la fachada `Cache`. Esta fachada sirve como proxy para acceder a la implementación subyacente de la interfaz `Illuminate\Contracts\Cache\Factory`. Cualquier llamada que hagamos usando la fachada se pasará a la instancia subyacente del servicio de caché de Laravel.

Si miramos esa clase `Illuminate\Support\Facades\Cache`, verás que no existe ningún método estático `get`:

```php
class Cache extends Facade
{
    /**
     * Get the registered name of the component.
     */
    protected static function getFacadeAccessor(): string
    {
        return 'cache';
    }
}
```

En cambio, la fachada `Cache` extiende la clase base `Facade` y define el método `getFacadeAccessor()`. El trabajo de este método es devolver el nombre de un enlace de contenedor de servicios. Cuando un usuario hace referencia a cualquier método estático en la fachada `Cache`, Laravel resuelve el enlace `cache` desde el [contenedor de servicio](../container/) y ejecuta el método solicitado (en este caso, `get`) contra ese objeto.

<a id="real-time-facades"></a>
## Fachadas en tiempo real

Al utilizar fachadas en tiempo real, puede tratar cualquier clase de su aplicación como si fuera una fachada. Para ilustrar cómo se puede utilizar esto, primero examinemos algo de código que no utiliza fachadas en tiempo real. Por ejemplo, supongamos que nuestro modelo `Podcast` tiene un método `publish`. Sin embargo, para publicar el podcast, necesitamos inyectar una instancia `Publisher`:

```php
<?php

namespace App\Models;

use App\Contracts\Publisher;
use Illuminate\Database\Eloquent\Model;

class Podcast extends Model
{
    /**
     * Publish the podcast.
     */
    public function publish(Publisher $publisher): void
    {
        $this->update(['publishing' => now()]);

        $publisher->publish($this);
    }
}
```

Inyectar una implementación de editor en el método nos permite probar fácilmente el método de forma aislada, ya que podemos burlarnos del editor inyectado. Sin embargo, requiere que pasemos siempre una instancia del editor cada vez que llamemos al método `publish`. Al utilizar fachadas en tiempo real, podemos mantener la misma capacidad de prueba sin tener que pasar explícitamente una instancia `Publisher`. Para generar una fachada en tiempo real, anteponga el espacio de nombres de la clase importada con `Facades`:

```php
<?php

namespace App\Models;

use App\Contracts\Publisher; // [tl! remove]
use Facades\App\Contracts\Publisher; // [tl! add]
use Illuminate\Database\Eloquent\Model;

class Podcast extends Model
{
    /**
     * Publish the podcast.
     */
    public function publish(Publisher $publisher): void // [tl! remove]
    public function publish(): void // [tl! add]
    {
        $this->update(['publishing' => now()]);

        $publisher->publish($this); // [tl! remove]
        Publisher::publish($this); // [tl! add]
    }
}
```

Cuando se utiliza la fachada en tiempo real, la implementación del editor se resolverá fuera del contenedor de servicios utilizando la parte de la interfaz o el nombre de clase que aparece después del prefijo `Facades`. Al realizar las pruebas, podemos utilizar los asistentes de pruebas de fachada integrados de Laravel para simular esta llamada a este método:

```php tab=Pest
<?php

use App\Models\Podcast;
use Facades\App\Contracts\Publisher;
use Illuminate\Foundation\Testing\RefreshDatabase;

pest()->use(RefreshDatabase::class);

test('podcast can be published', function () {
    $podcast = Podcast::factory()->create();

    Publisher::shouldReceive('publish')->once()->with($podcast);

    $podcast->publish();
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use App\Models\Podcast;
use Facades\App\Contracts\Publisher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PodcastTest extends TestCase
{
    use RefreshDatabase;

    /**
     * A test example.
     */
    public function test_podcast_can_be_published(): void
    {
        $podcast = Podcast::factory()->create();

        Publisher::shouldReceive('publish')->once()->with($podcast);

        $podcast->publish();
    }
}
```

<a id="facade-class-reference"></a>
## Referencia de clase de fachada

A continuación encontrará cada fachada y su clase subyacente. Esta es una herramienta útil para profundizar rápidamente en la documentación API para una raíz de fachada determinada. La clave [vinculación del contenedor de servicios](../container/) también se incluye cuando corresponde.

<div class="overflow-auto">

| Fachada | Clase | Encuadernación de contenedores de servicios |
| --- | --- | --- |
| Aplicación | [Illuminate\Foundation\Application](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Foundation/Application.html) | `app` |
| Artesano | [Illuminate\Contracts\Console\Kernel](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Contracts/Console/Kernel.html) |   |
| Autenticación (instancia) | [Illuminate\Contracts\Auth\Guard](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Contracts/Auth/Guard.html) | `auth.driver` |
| Autenticación | [Illuminate\Auth\AuthManager](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Auth/AuthManager.html) | `auth` |
| Hoja | [Illuminate\View\Compilers\BladeCompiler](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/View/Compilers/BladeCompiler.html) | `blade.compiler` |
| Difusión (instancia) | [Illuminate\Contracts\Broadcasting\Broadcaster](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Contracts/Broadcasting/Broadcaster.html) |   |
| Transmisión | [Illuminate\Contracts\Broadcasting\Factory](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Contracts/Broadcasting/Factory.html) |   |
| Autobús | [Illuminate\Contracts\Bus\Dispatcher](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Contracts/Bus/Dispatcher.html) |   |
| Caché (instancia) | [Illuminate\Cache\Repository](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Cache/Repository.html) | `cache.store` |
| Caché | [Illuminate\Cache\CacheManager](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Cache/CacheManager.html) | `cache` |
| Nube | [Illuminate\Foundation\Cloud\CloudManager](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Foundation/Cloud/CloudManager.html) |   |
| Configuración | [Illuminate\Config\Repository](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Config/Repository.html) | `config` |
| Contexto | [Illuminate\Log\Context\Repository](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Log/Context/Repository.html) |   |
| Galleta | [Illuminate\Cookie\CookieJar](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Cookie/CookieJar.html) | `cookie` |
| Cripta | [Illuminate\Encryption\Encrypter](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Encryption/Encrypter.html) | `encrypter` |
| Fecha | [Illuminate\Support\DateFactory](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Support/DateFactory.html) | `date` |
| Base de datos (instancia) | [Illuminate\Database\Connection](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Database/Connection.html) | `db.connection` |
| Base de datos | [Illuminate\Database\DatabaseManager](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Database/DatabaseManager.html) | `db` |
| Evento | [Illuminate\Events\Dispatcher](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Events/Dispatcher.html) | `events` |
| Excepciones (instancia) | [Illuminate\Contracts\Debug\ExceptionHandler](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Contracts/Debug/ExceptionHandler.html) |   |
| Excepciones | [Illuminate\Foundation\Exceptions\Handler](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Foundation/Exceptions/Handler.html) |   |
| Archivo | [Illuminate\Filesystem\Filesystem](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Filesystem/Filesystem.html) | `files` |
| Puerta | [Illuminate\Contracts\Auth\Access\Gate](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Contracts/Auth/Access/Gate.html) |   |
| Hachís | [Illuminate\Contracts\Hashing\Hasher](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Contracts/Hashing/Hasher.html) | `hash` |
| HTTP | [Illuminate\Http\Client\Factory](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Http/Client/Factory.html) |   |
| Idioma | [Illuminate\Translation\Translator](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Translation/Translator.html) | `translator` |
| Iniciar sesión | [Illuminate\Log\LogManager](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Log/LogManager.html) | `log` |
| Correo (instancia) | [Illuminate\Mail\Mailer](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Mail/Mailer.html) | `mailer` |
| Correo | [Illuminate\Mail\MailManager](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Mail/MailManager.html) | `mail.manager` |
| Notificación | [Illuminate\Notifications\ChannelManager](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Notifications/ChannelManager.html) |   |
| Contraseña (instancia) | [Illuminate\Auth\Passwords\PasswordBroker](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Auth/Passwords/PasswordBroker.html) | `auth.password.broker` |
| Contraseña | [Illuminate\Auth\Passwords\PasswordBrokerManager](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Auth/Passwords/PasswordBrokerManager.html) | `auth.password` |
| Canalización (instancia) | [Illuminate\Pipeline\Pipeline](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Pipeline/Pipeline.html) |   |
| Proceso | [Illuminate\Process\Factory](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Process/Factory.html) |   |
| Cola (clase base) | [Illuminate\Queue\Queue](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Queue/Queue.html) |   |
| Cola (instancia) | [Illuminate\Contracts\Queue\Queue](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Contracts/Queue/Queue.html) | `queue.connection` |
| Cola | [Illuminate\Queue\QueueManager](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Queue/QueueManager.html) | `queue` |
| Limitador de velocidad | [Illuminate\Cache\RateLimiter](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Cache/RateLimiter.html) |   |
| Redirigir | [Illuminate\Routing\Redirector](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Routing/Redirector.html) | `redirect` |
| Redis (instancia) | [Illuminate\Redis\Connections\Connection](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Redis/Connections/Connection.html) | `redis.connection` |
| Redis | [Illuminate\Redis\RedisManager](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Redis/RedisManager.html) | `redis` |
| Solicitar | [Illuminate\Http\Request](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Http/Request.html) | `request` |
| Respuesta (instancia) | [Illuminate\Http\Response](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Http/Response.html) |   |
| Respuesta | [Illuminate\Contracts\Routing\ResponseFactory](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Contracts/Routing/ResponseFactory.html) |   |
| Ruta | [Illuminate\Routing\Router](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Routing/Router.html) | `router` |
| Horario | [Illuminate\Console\Scheduling\Schedule](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Console/Scheduling/Schedule.html) |   |
| Esquema | [Illuminate\Database\Schema\Builder](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Database/Schema/Builder.html) |   |
| Sesión (instancia) | [Illuminate\Session\Store](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Session/Store.html) | `session.store` |
| Sesión | [Illuminate\Session\SessionManager](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Session/SessionManager.html) | `session` |
| Almacenamiento (instancia) | [Illuminate\Contracts\Filesystem\Filesystem](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Contracts/Filesystem/Filesystem.html) | `filesystem.disk` |
| Almacenamiento | [Illuminate\Filesystem\FilesystemManager](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Filesystem/FilesystemManager.html) | `filesystem` |
| URL | [Illuminate\Routing\UrlGenerator](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Routing/UrlGenerator.html) | `url` |
| Validador (instancia) | [Illuminate\Validation\Validator](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Validation/Validator.html) |   |
| Validador | [Illuminate\Validation\Factory](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Validation/Factory.html) | `validator` |
| Ver (instancia) | [Illuminate\View\View](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/View/View.html) |   |
| Ver | [Illuminate\View\Factory](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/View/Factory.html) | `view` |
| invitar | [Illuminate\Foundation\Vite](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Foundation/Vite.html) |   |

</div>
