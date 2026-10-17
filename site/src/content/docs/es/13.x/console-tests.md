---
title: "Pruebas de consola"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Expectativas de éxito/fracaso](#success-failure-expectations)
- [Expectativas de entrada/salida](#input-output-expectations)
- [Eventos de consola](#console-events)

<a id="introduction"></a>
## Introducción

Además de simplificar las pruebas HTTP, Laravel proporciona una API simple para probar los [comandos de consola personalizados de tu aplicación](../artisan/).

<a id="success-failure-expectations"></a>
## Expectativas de éxito/fracaso

Para comenzar, exploremos cómo realizar aserciones con respecto al código de salida de un comando Artisan. Para lograr esto, usaremos el método `artisan` para invocar un comando Artisan desde nuestra prueba. Luego, usaremos el método `assertExitCode` para comprobar que el comando se completó con un código de salida determinado:

```php tab=Pest
test('console command', function () {
    $this->artisan('inspire')->assertExitCode(0);
});
```

```php tab=PHPUnit
/**
 * Probar un comando de consola.
 */
public function test_console_command(): void
{
    $this->artisan('inspire')->assertExitCode(0);
}
```

Puedes usar el método `assertNotExitCode` para comprobar que el comando no salió con un código de salida determinado:

```php
$this->artisan('inspire')->assertNotExitCode(1);
```

Por supuesto, todos los comandos del terminal normalmente salen con un código de estado de `0` cuando tienen éxito y un código de salida distinto de cero cuando no tienen éxito. Por lo tanto, por conveniencia, puedes usar las aserciones `assertSuccessful` y `assertFailed` para comprobar que un comando determinado salió con un código de salida exitoso o no:

```php
$this->artisan('inspire')->assertSuccessful();

$this->artisan('inspire')->assertFailed();
```

<a id="input-output-expectations"></a>
## Expectativas de entrada/salida

Laravel te permite "simular" fácilmente la entrada del usuario para tus comandos de consola utilizando el método `expectsQuestion`. Además, puedes especificar el código de salida y el texto que esperas que genere el comando de la consola utilizando los métodos `assertExitCode` y `expectsOutput`. Por ejemplo, considera el siguiente comando de consola:

```php
Artisan::command('question', function () {
    $name = $this->ask('What is your name?');

    $language = $this->choice('Which language do you prefer?', [
        'PHP',
        'Ruby',
        'Python',
    ]);

    $this->line('Your name is '.$name.' and you prefer '.$language.'.');
});
```

Puedes probar este comando con la siguiente prueba:

```php tab=Pest
test('console command', function () {
    $this->artisan('question')
        ->expectsQuestion('What is your name?', 'Taylor Otwell')
        ->expectsQuestion('Which language do you prefer?', 'PHP')
        ->expectsOutput('Your name is Taylor Otwell and you prefer PHP.')
        ->doesntExpectOutput('Your name is Taylor Otwell and you prefer Ruby.')
        ->assertExitCode(0);
});
```

```php tab=PHPUnit
/**
 * Probar un comando de consola.
 */
public function test_console_command(): void
{
    $this->artisan('question')
        ->expectsQuestion('What is your name?', 'Taylor Otwell')
        ->expectsQuestion('Which language do you prefer?', 'PHP')
        ->expectsOutput('Your name is Taylor Otwell and you prefer PHP.')
        ->doesntExpectOutput('Your name is Taylor Otwell and you prefer Ruby.')
        ->assertExitCode(0);
}
```

Si usas las funciones `search` o `multisearch` proporcionadas por [Laravel Prompts](../prompts/), puedes usar la aserción `expectsSearch` para simular la entrada, los resultados de búsqueda y la selección del usuario:

```php tab=Pest
test('console command', function () {
    $this->artisan('example')
        ->expectsSearch('What is your name?', search: 'Tay', answers: [
            'Taylor Otwell',
            'Taylor Swift',
            'Darian Taylor'
        ], answer: 'Taylor Otwell')
        ->assertExitCode(0);
});
```

```php tab=PHPUnit
/**
 * Probar un comando de consola.
 */
public function test_console_command(): void
{
    $this->artisan('example')
        ->expectsSearch('What is your name?', search: 'Tay', answers: [
            'Taylor Otwell',
            'Taylor Swift',
            'Darian Taylor'
        ], answer: 'Taylor Otwell')
        ->assertExitCode(0);
}
```

También puedes comprobar que un comando de consola no genera ningún resultado utilizando el método `doesntExpectOutput`:

```php tab=Pest
test('console command', function () {
    $this->artisan('example')
        ->doesntExpectOutput()
        ->assertExitCode(0);
});
```

```php tab=PHPUnit
/**
 * Probar un comando de consola.
 */
public function test_console_command(): void
{
    $this->artisan('example')
        ->doesntExpectOutput()
        ->assertExitCode(0);
}
```

Los métodos `expectsOutputToContain` y `doesntExpectOutputToContain` se pueden utilizar para realizar aserciones sobre una parte de la salida:

```php tab=Pest
test('console command', function () {
    $this->artisan('example')
        ->expectsOutputToContain('Taylor')
        ->assertExitCode(0);
});
```

```php tab=PHPUnit
/**
 * Probar un comando de consola.
 */
public function test_console_command(): void
{
    $this->artisan('example')
        ->expectsOutputToContain('Taylor')
        ->assertExitCode(0);
}
```

<a id="confirmation-expectations"></a>
#### Expectativas de confirmación

Al escribir un comando que espera confirmación en forma de respuesta "sí" o "no", puedes usar el método `expectsConfirmation`:

```php
$this->artisan('module:import')
    ->expectsConfirmation('Do you really wish to run this command?', 'no')
    ->assertExitCode(1);
```

<a id="table-expectations"></a>
#### Expectativas sobre tablas

Si tu comando muestra una tabla de información utilizando el método `table` de Artisan, puede resultar engorroso escribir expectativas de salida para toda la tabla. En su lugar, puedes usar el método `expectsTable`. Este método acepta los encabezados de la tabla como primer argumento y los datos de la tabla como segundo argumento:

```php
$this->artisan('users:all')
    ->expectsTable([
        'ID',
        'Email',
    ], [
        [1, 'taylor@example.com'],
        [2, 'abigail@example.com'],
    ]);
```

<a id="console-events"></a>
## Eventos de consola

De forma predeterminada, los eventos `Illuminate\Console\Events\CommandStarting` y `Illuminate\Console\Events\CommandFinished` no se despachan mientras se ejecutan las pruebas de tu aplicación. Sin embargo, puedes habilitar estos eventos para una clase de prueba determinada agregando el trait `Illuminate\Foundation\Testing\WithConsoleEvents` a la clase:

```php tab=Pest
<?php

use Illuminate\Foundation\Testing\WithConsoleEvents;

pest()->use(WithConsoleEvents::class);

// ...
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\WithConsoleEvents;
use Tests\TestCase;

class ConsoleEventTest extends TestCase
{
    use WithConsoleEvents;

    // ...
}
```
