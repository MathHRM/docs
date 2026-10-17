---
title: "Simulación de objetos"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Simulación de objetos](#mocking-objects)
- [Simulación de fachadas](#mocking-facades)
    - [Espías de fachada](#facade-spies)
- [Control del tiempo](#interacting-with-time)

<a id="introduction"></a>
## Introducción

Al probar aplicaciones Laravel, puede que quieras simular ciertos aspectos de tu aplicación para evitar que se ejecuten durante una prueba. Por ejemplo, al probar un controlador que despacha un evento, puedes simular los listeners para que no se ejecuten. Así puedes probar solo la respuesta HTTP del controlador sin preocuparte por los listeners, que puedes probar en sus propias pruebas.

Laravel proporciona métodos útiles para burlarse de eventos, trabajos y otras fachadas listas para usar. Estas funciones auxiliares ofrecen una capa de comodidad sobre Mockery, para que no tengas que realizar manualmente llamadas complejas a sus métodos.

<a id="mocking-objects"></a>
## Simulación de objetos

Al simular un objeto que se inyectará en tu aplicación mediante el [contenedor de servicios](../container/) de Laravel, debes vincular la instancia simulada al contenedor con el método `instance`. Así, el contenedor utilizará esa instancia en lugar de crear el objeto:

```php tab=Pest
use App\Service;
use Mockery;
use Mockery\MockInterface;

test('something can be mocked', function () {
    $this->instance(
        Service::class,
        Mockery::mock(Service::class, function (MockInterface $mock) {
            $mock->expects('process');
        })
    );
});
```

```php tab=PHPUnit
use App\Service;
use Mockery;
use Mockery\MockInterface;

public function test_something_can_be_mocked(): void
{
    $this->instance(
        Service::class,
        Mockery::mock(Service::class, function (MockInterface $mock) {
            $mock->expects('process');
        })
    );
}
```

Para simplificarlo, puedes utilizar el método `mock` proporcionado por la clase de caso de prueba base de Laravel. Por ejemplo, el siguiente ejemplo es equivalente al ejemplo anterior:

```php
use App\Service;
use Mockery\MockInterface;

$mock = $this->mock(Service::class, function (MockInterface $mock) {
    $mock->expects('process');
});
```

Puedes utilizar el método `partialMock` cuando solo necesites simular algunos métodos de un objeto. Los métodos que no se simulan se ejecutarán normalmente cuando se llamen:

```php
use App\Service;
use Mockery\MockInterface;

$mock = $this->partialMock(Service::class, function (MockInterface $mock) {
    $mock->expects('process');
});
```

Del mismo modo, si quieres [espiar](http://docs.mockery.io/en/latest/reference/spies.html) en un objeto, la clase de caso de prueba base de Laravel ofrece un método `spy` como contenedor práctico para el método `Mockery::spy`. Los spies se parecen a los mocks, pero registran las interacciones entre el spy y el código probado. Así puedes hacer aserciones después de ejecutar el código:

```php
use App\Service;

$spy = $this->spy(Service::class);

// ...

$spy->shouldHaveReceived('process');
```

<a id="mocking-facades"></a>
## Simulación de fachadas

A diferencia de los métodos estáticos tradicionales, puedes simular las [fachadas](../facades/) (incluidas [fachadas en tiempo real](../facades/#real-time-facades)). Esto ofrece una ventaja importante frente a los métodos estáticos tradicionales y le otorga la misma capacidad de prueba que tendrías al utilizar la inyección de dependencia tradicional. Al realizar pruebas, puede que quieras simular una llamada a una fachada de Laravel que ocurre en uno de tus controladores. Por ejemplo, observa la siguiente acción del controlador:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Cache;

class UserController extends Controller
{
    /**
     * Recuperar una lista de todos los usuarios de la aplicación.
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

Podemos simular la llamada a la fachada `Cache` usando el método `expects`, que devolverá una instancia de un simulacro [Mockery](https://github.com/padraic/mockery). Como Laravel resuelve y administra las fachadas mediante el [contenedor de servicios](../container/), son mucho más fáciles de probar que una clase estática convencional. Por ejemplo, simulemos la llamada al método `get` de la fachada `Cache`:

```php tab=Pest
<?php

use Illuminate\Support\Facades\Cache;

test('get index', function () {
    Cache::expects('get')
        ->with('key')
        ->andReturn('value');

    $response = $this->get('/users');

    // ...
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    public function test_get_index(): void
    {
        Cache::expects('get')
            ->with('key')
            ->andReturn('value');

        $response = $this->get('/users');

        // ...
    }
}
```

> **Advertencia:**
> No simules la fachada `Request`. En su lugar, pasa los datos de entrada que quieras a los [métodos de prueba HTTP](../http-tests/), como `get` y `post`, al ejecutar la prueba. Del mismo modo, en lugar de burlarse de la fachada `Config`, llama al método `Config::set` en tus pruebas.

<a id="facade-spies"></a>
### Espías de fachada

Si quieres usar [spies](http://docs.mockery.io/en/latest/reference/spies.html) en una fachada, puedes llamar al método `spy` en la fachada correspondiente. Los spies se parecen a los mocks, pero registran las interacciones entre el spy y el código probado. Así puedes hacer aserciones después de ejecutar el código:

```php tab=Pest
<?php

use Illuminate\Support\Facades\Cache;

test('values are stored in cache', function () {
    Cache::spy();

    $response = $this->get('/');

    $response->assertStatus(200);

    Cache::shouldHaveReceived('put')->with('name', 'Taylor', 10);
});
```

```php tab=PHPUnit
use Illuminate\Support\Facades\Cache;

public function test_values_are_stored_in_cache(): void
{
    Cache::spy();

    $response = $this->get('/');

    $response->assertStatus(200);

    Cache::shouldHaveReceived('put')->with('name', 'Taylor', 10);
}
```

<a id="interacting-with-time"></a>
## Controlar el tiempo

Al probar, puede que a veces necesites modificar la hora devuelta por funciones auxiliares como `now` o `Illuminate\Support\Carbon::now()`. Afortunadamente, la clase base de pruebas de Laravel incluye métodos que te permiten manipular la hora actual:

```php tab=Pest
test('time can be manipulated', function () {
    // Travel into the future...
    $this->travel(5)->milliseconds();
    $this->travel(5)->seconds();
    $this->travel(5)->minutes();
    $this->travel(5)->hours();
    $this->travel(5)->days();
    $this->travel(5)->weeks();
    $this->travel(5)->years();

    // Travel into the past...
    $this->travel(-5)->hours();

    // Travel to an explicit time...
    $this->travelTo(now()->minus(hours: 6));

    // Volver al momento presente...
    $this->travelBack();
});
```

```php tab=PHPUnit
public function test_time_can_be_manipulated(): void
{
    // Travel into the future...
    $this->travel(5)->milliseconds();
    $this->travel(5)->seconds();
    $this->travel(5)->minutes();
    $this->travel(5)->hours();
    $this->travel(5)->days();
    $this->travel(5)->weeks();
    $this->travel(5)->years();

    // Travel into the past...
    $this->travel(-5)->hours();

    // Travel to an explicit time...
    $this->travelTo(now()->minus(hours: 6));

    // Volver al momento presente...
    $this->travelBack();
}
```

También puedes pasar una función anónima a los distintos métodos de viaje en el tiempo. La función se ejecutará con el tiempo congelado en el momento especificado. Una vez ejecutado la función anónima, el tiempo se reanudará con normalidad:

```php
$this->travel(5)->days(function () {
    // Probar algo dentro de cinco días...
});

$this->travelTo(now()->minus(days: 10), function () {
    // Probar algo durante un momento determinado...
});
```

Puedes utilizar el método `freezeTime` para congelar la hora actual. De manera similar, el método `freezeSecond` congelará la hora actual, pero al comienzo del segundo actual:

```php
use Illuminate\Support\Carbon;

// Congelar el tiempo y reanudar el tiempo normal después de ejecutar el closure...
$this->freezeTime(function (Carbon $time) {
    // ...
});

// Congelar el tiempo en el segundo actual y reanudar el tiempo normal después de ejecutar el closure...
$this->freezeSecond(function (Carbon $time) {
    // ...
});
```

Como es de esperar, estos métodos son útiles para probar el comportamiento de aplicaciones sensibles al tiempo, por ejemplo, para bloquear hilos inactivos en un foro:

```php tab=Pest
use App\Models\Thread;

test('forum threads lock after one week of inactivity', function () {
    $thread = Thread::factory()->create();

    $this->travel(1)->week();

    expect($thread->isLockedByInactivity())->toBeTrue();
});
```

```php tab=PHPUnit
use App\Models\Thread;

public function test_forum_threads_lock_after_one_week_of_inactivity()
{
    $thread = Thread::factory()->create();

    $this->travel(1)->week();

    $this->assertTrue($thread->isLockedByInactivity());
}
```
