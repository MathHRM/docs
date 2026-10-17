---
title: "Procesos"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Invocando Procesos](#invoking-processes)
    - [Opciones de proceso](#process-options)
    - [Salida del proceso](#process-output)
    - [Tuberías](#process-pipelines)
- [Procesos Asincrónicos](#asynchronous-processes)
    - [ID de proceso y señales](#process-ids-and-signals)
    - [Salida de proceso asíncrono](#asynchronous-process-output)
    - [Tiempos de espera de procesos asincrónicos](#asynchronous-process-timeouts)
- [Procesos Concurrentes](#concurrent-processes)
    - [Nombrar procesos de grupo](#naming-pool-processes)
    - [ID de proceso de grupo y señales](#pool-process-ids-and-signals)
- [Prueba](#testing)
    - [Simulación de procesos](#faking-processes)
    - [Simulación de procesos específicos](#faking-specific-processes)
    - [Secuencias de procesos simulados](#faking-process-sequences)
    - [Simulación de ciclos de vida de procesos asincrónicos](#faking-asynchronous-process-lifecycles)
    - [Afirmaciones disponibles](#available-assertions)
    - [Prevención de procesos perdidos](#preventing-stray-processes)

<a id="introduction"></a>
## Introducción

Laravel proporciona una API mínima y expresiva en torno al [componente de proceso Symfony](https://symfony.com/doc/current/components/process.html), lo que le permite invocar cómodamente procesos externos desde su aplicación Laravel. Las características del proceso de Laravel se centran en los casos de uso más comunes y en una maravillosa experiencia para el desarrollador.

<a id="invoking-processes"></a>
## Invocar procesos

Para invocar un proceso, puede utilizar los métodos `run` y `start` que ofrece la fachada `Process`. El método `run` invocará un proceso y esperará a que termine de ejecutarse, mientras que el método `start` se utiliza para la ejecución asincrónica del proceso. Examinaremos ambos enfoques en esta documentación. Primero, examinemos cómo invocar un proceso sincrónico básico e inspeccionar su resultado:

```php
use Illuminate\Support\Facades\Process;

$result = Process::run('ls -la');

return $result->output();
```

Por supuesto, la instancia `Illuminate\Contracts\Process\ProcessResult` devuelta por el método `run` ofrece una variedad de métodos útiles que pueden usarse para inspeccionar el resultado del proceso:

```php
$result = Process::run('ls -la');

$result->command();
$result->successful();
$result->failed();
$result->output();
$result->errorOutput();
$result->exitCode();
```

<a id="throwing-exceptions"></a>
#### Lanzar excepciones

Si tiene un resultado de proceso y desea generar una instancia de `Illuminate\Process\Exceptions\ProcessFailedException` si el código de salida es mayor que cero (lo que indica falla), puede usar los métodos `throw` y `throwIf`. Si el proceso no falló, se devolverá la instancia `ProcessResult`:

```php
$result = Process::run('ls -la')->throw();

$result = Process::run('ls -la')->throwIf($condition);
```

<a id="process-options"></a>
### Opciones de proceso

Por supuesto, es posible que necesites personalizar el comportamiento de un proceso antes de invocarlo. Afortunadamente, Laravel te permite modificar una variedad de características del proceso, como el directorio de trabajo, el tiempo de espera y las variables de entorno.

<a id="working-directory-path"></a>
#### Ruta del directorio de trabajo

Puede utilizar el método `path` para especificar el directorio de trabajo del proceso. Si no se invoca este método, el proceso heredará el directorio de trabajo del script PHP que se está ejecutando actualmente:

```php
$result = Process::path(__DIR__)->run('ls -la');
```

<a id="input"></a>
#### Entrada

Puede proporcionar información a través de la "entrada estándar" del proceso utilizando el método `input`:

```php
$result = Process::input('Hello World')->run('cat');
```

<a id="timeouts"></a>
#### Tiempos de espera

De forma predeterminada, los procesos generarán una instancia de `Illuminate\Process\Exceptions\ProcessTimedOutException` después de ejecutarse durante más de 60 segundos. Sin embargo, puede personalizar este comportamiento mediante el método `timeout`:

```php
$result = Process::timeout(120)->run('bash import.sh');
```

Los métodos `timeout` y `idleTimeout` también aceptan instancias `CarbonInterval`:

```php
use function Illuminate\Support\minutes;

$result = Process::timeout(minutes(2))->run('bash import.sh');
```

O, si desea desactivar por completo el tiempo de espera del proceso, puede invocar el método `forever`:

```php
$result = Process::forever()->run('bash import.sh');
```

El método `idleTimeout` se puede utilizar para especificar la cantidad máxima de segundos que el proceso puede ejecutarse sin devolver ningún resultado:

```php
$result = Process::timeout(60)->idleTimeout(30)->run('bash import.sh');
```

<a id="environment-variables"></a>
#### Variables de entorno

Se pueden proporcionar variables de entorno al proceso mediante el método `env`. El proceso invocado también heredará todas las variables de entorno definidas por su sistema:

```php
$result = Process::forever()
    ->env(['IMPORT_PATH' => __DIR__])
    ->run('bash import.sh');
```

Si desea eliminar una variable de entorno heredada del proceso invocado, puede proporcionar a esa variable de entorno un valor de `false`:

```php
$result = Process::forever()
    ->env(['LOAD_PATH' => false])
    ->run('bash import.sh');
```

<a id="tty-mode"></a>
#### Modo TTY

Se puede utilizar el método `tty` para habilitar el modo TTY para su proceso. El modo TTY conecta la entrada y salida del proceso con la entrada y salida de su programa, permitiendo que su proceso abra un editor como Vim o Nano como proceso:

```php
Process::forever()->tty()->run('vim');
```

> **Advertencia:**
> El modo TTY no es compatible con Windows.

<a id="process-output"></a>
### Salida del proceso

Como se analizó anteriormente, se puede acceder a la salida del proceso utilizando los métodos `output` (stdout) y `errorOutput` (stderr) en un resultado de proceso:

```php
use Illuminate\Support\Facades\Process;

$result = Process::run('ls -la');

echo $result->output();
echo $result->errorOutput();
```

Sin embargo, la salida también se puede recopilar en tiempo real pasando una función anónima como segundo argumento del método `run`. La función anónima recibirá dos argumentos: el "tipo" de salida (`stdout` o `stderr`) y la cadena de salida misma:

```php
$result = Process::run('ls -la', function (string $type, string $output) {
    echo $output;
});
```

Laravel también ofrece los métodos `seeInOutput` y `seeInErrorOutput`, que proporcionan una manera conveniente de determinar si una cadena determinada estaba contenida en la salida del proceso:

```php
if (Process::run('ls -la')->seeInOutput('laravel')) {
    // ...
}
```

<a id="disabling-process-output"></a>
#### Deshabilitar la salida del proceso

Si su proceso escribe una cantidad significativa de resultados que no le interesan, puede conservar memoria deshabilitando por completo la recuperación de resultados. Para lograr esto, invoque el método `quietly` mientras construye el proceso:

```php
use Illuminate\Support\Facades\Process;

$result = Process::quietly()->run('bash import.sh');
```

<a id="process-pipelines"></a>
### Tuberías

A veces es posible que desee convertir la salida de un proceso en la entrada de otro proceso. A esto se le suele denominar "canalizar" la salida de un proceso a otro. El método `pipe` proporcionado por las fachadas `Process` hace que esto sea fácil de lograr. El método `pipe` ejecutará los procesos canalizados sincrónicamente y devolverá el resultado del proceso para el último proceso en el canal:

```php
use Illuminate\Process\Pipe;
use Illuminate\Support\Facades\Process;

$result = Process::pipe(function (Pipe $pipe) {
    $pipe->command('cat example.txt');
    $pipe->command('grep -i "laravel"');
});

if ($result->successful()) {
    // ...
}
```

Si no necesita personalizar los procesos individuales que componen la canalización, simplemente puede pasar una serie de cadenas de comando al método `pipe`:

```php
$result = Process::pipe([
    'cat example.txt',
    'grep -i "laravel"',
]);
```

El resultado del proceso se puede recopilar en tiempo real pasando una función anónima como segundo argumento del método `pipe`. La función anónima recibirá dos argumentos: el "tipo" de salida (`stdout` o `stderr`) y la cadena de salida misma:

```php
$result = Process::pipe(function (Pipe $pipe) {
    $pipe->command('cat example.txt');
    $pipe->command('grep -i "laravel"');
}, function (string $type, string $output) {
    echo $output;
});
```

Laravel también le permite asignar claves de cadena a cada proceso dentro de una canalización mediante el método `as`. Esta clave también se pasará a la función anónima de salida proporcionada al método `pipe`, lo que le permitirá determinar a qué proceso pertenece la salida:

```php
$result = Process::pipe(function (Pipe $pipe) {
    $pipe->as('first')->command('cat example.txt');
    $pipe->as('second')->command('grep -i "laravel"');
}, function (string $type, string $output, string $key) {
    // ...
});
```

<a id="asynchronous-processes"></a>
## Procesos asincrónicos

Mientras que el método `run` invoca procesos de forma sincrónica, el método `start` se puede utilizar para invocar un proceso de forma asincrónica. Esto permite que su aplicación continúe realizando otras tareas mientras el proceso se ejecuta en segundo plano. Una vez que se haya invocado el proceso, puede utilizar el método `running` para determinar si el proceso aún se está ejecutando:

```php
$process = Process::timeout(120)->start('bash import.sh');

while ($process->running()) {
    // ...
}

$result = $process->wait();
```

Como habrás notado, puedes invocar el método `wait` para esperar hasta que el proceso termine de ejecutarse y recuperar la instancia `ProcessResult`:

```php
$process = Process::timeout(120)->start('bash import.sh');

// ...

$result = $process->wait();
```

<a id="process-ids-and-signals"></a>
### ID de proceso y señales

El método `id` se puede utilizar para recuperar el ID de proceso asignado por el sistema operativo del proceso en ejecución:

```php
$process = Process::start('bash import.sh');

return $process->id();
```

Puede utilizar el método `signal` para enviar una "señal" al proceso en ejecución. Puede encontrar una lista de constantes de señal predefinidas en la [documentación PHP](https://www.php.net/manual/en/pcntl.constants.php):

```php
$process->signal(SIGUSR2);
```

<a id="asynchronous-process-output"></a>
### Salida del proceso asincrónico

Mientras se ejecuta un proceso asincrónico, puede acceder a toda su salida actual utilizando los métodos `output` y `errorOutput`; sin embargo, puede utilizar `latestOutput` y `latestErrorOutput` para acceder al resultado del proceso que ha ocurrido desde la última vez que se recuperó el resultado:

```php
$process = Process::timeout(120)->start('bash import.sh');

while ($process->running()) {
    echo $process->latestOutput();
    echo $process->latestErrorOutput();

    sleep(1);
}
```

Al igual que el método `run`, la salida también se puede recopilar en tiempo real a partir de procesos asincrónicos pasando una función anónima como segundo argumento del método `start`. La función anónima recibirá dos argumentos: el "tipo" de salida (`stdout` o `stderr`) y la cadena de salida misma:

```php
$process = Process::start('bash import.sh', function (string $type, string $output) {
    echo $output;
});

$result = $process->wait();
```

En lugar de esperar hasta que el proceso haya finalizado, puede utilizar el método `waitUntil` para dejar de esperar según el resultado del proceso. Laravel dejará de esperar a que finalice el proceso cuando la función anónima dada al método `waitUntil` devuelva `true`:

```php
$process = Process::start('bash import.sh');

$process->waitUntil(function (string $type, string $output) {
    return $output === 'Ready...';
});
```

<a id="asynchronous-process-timeouts"></a>
### Tiempos de espera de procesos asincrónicos

Mientras se ejecuta un proceso asincrónico, puede verificar que el proceso no haya agotado el tiempo de espera utilizando el método `ensureNotTimedOut`. Este método generará una [excepción de tiempo de espera](#timeouts) si el proceso agotó el tiempo de espera:

```php
$process = Process::timeout(120)->start('bash import.sh');

while ($process->running()) {
    $process->ensureNotTimedOut();

    // ...

    sleep(1);
}
```

<a id="concurrent-processes"></a>
## Procesos concurrentes

Laravel también facilita la gestión de un conjunto de procesos asincrónicos y simultáneos, lo que le permite ejecutar fácilmente muchas tareas simultáneamente. Para comenzar, invoque el método `pool`, que acepta una función anónima que recibe una instancia de `Illuminate\Process\Pool`.

Dentro de esta función anónima se pueden definir los procesos que pertenecen al pool. Una vez que se inicia un grupo de procesos mediante el método `start`, puede acceder a la [colección](../collections/) de procesos en ejecución mediante el método `running`:

```php
use Illuminate\Process\Pool;
use Illuminate\Support\Facades\Process;

$pool = Process::pool(function (Pool $pool) {
    $pool->path(__DIR__)->command('bash import-1.sh');
    $pool->path(__DIR__)->command('bash import-2.sh');
    $pool->path(__DIR__)->command('bash import-3.sh');
})->start(function (string $type, string $output, int $key) {
    // ...
});

while ($pool->running()->isNotEmpty()) {
    // ...
}

$results = $pool->wait();
```

Como puede ver, puede esperar a que todos los procesos del grupo terminen de ejecutarse y resuelvan sus resultados mediante el método `wait`. El método `wait` devuelve un objeto de matriz accesible que le permite acceder a la instancia `ProcessResult` de cada proceso en el grupo mediante su clave:

```php
$results = $pool->wait();

echo $results[0]->output();
```

O, por conveniencia, se puede usar el método `concurrently` para iniciar un grupo de procesos asincrónicos y esperar inmediatamente sus resultados. Esto puede proporcionar una sintaxis particularmente expresiva cuando se combina con las capacidades de desestructuración de matrices de PHP:

```php
[$first, $second, $third] = Process::concurrently(function (Pool $pool) {
    $pool->path(__DIR__)->command('ls -la');
    $pool->path(app_path())->command('ls -la');
    $pool->path(storage_path())->command('ls -la');
});

echo $first->output();
```

<a id="naming-pool-processes"></a>
### Nombrar procesos de grupo

Acceder a los resultados del grupo de procesos mediante una clave numérica no es muy expresivo; por lo tanto, Laravel le permite asignar claves de cadena a cada proceso dentro de un grupo mediante el método `as`. Esta clave también se pasará a la función anónima proporcionada al método `start`, lo que le permitirá determinar a qué proceso pertenece la salida:

```php
$pool = Process::pool(function (Pool $pool) {
    $pool->as('first')->command('bash import-1.sh');
    $pool->as('second')->command('bash import-2.sh');
    $pool->as('third')->command('bash import-3.sh');
})->start(function (string $type, string $output, string $key) {
    // ...
});

$results = $pool->wait();

return $results['first']->output();
```

<a id="pool-process-ids-and-signals"></a>
### Identificadores y señales de procesos de grupo

Dado que el método `running` del grupo de procesos proporciona una colección de todos los procesos invocados dentro del grupo, puede acceder fácilmente a los ID de los procesos del grupo subyacente:

```php
$processIds = $pool->running()->map->id();
```

Y, para mayor comodidad, puede invocar el método `signal` en un grupo de procesos para enviar una señal a cada proceso dentro del grupo:

```php
$pool->signal(SIGUSR2);
```

<a id="testing"></a>
## Pruebas

Muchos servicios de Laravel brindan funcionalidad para ayudarlo a escribir pruebas de manera fácil y expresiva, y el servicio de procesos de Laravel no es una excepción. El método `fake` de la fachada `Process` le permite indicarle a Laravel que devuelva resultados simulados cuando se invocan procesos.

<a id="faking-processes"></a>
### Simulación de procesos

Para explorar la capacidad de Laravel para simular procesos, imaginemos una ruta que invoca un proceso:

```php
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Route;

Route::get('/import', function () {
    Process::run('bash import.sh');

    return 'Import complete!';
});
```

Al probar esta ruta, podemos indicarle a Laravel que devuelva un resultado de proceso simulado y exitoso para cada proceso invocado llamando al método `fake` en la fachada `Process` sin argumentos. Además, podemos incluso [afirmar](#available-assertions) que se "ejecutó" un proceso determinado:

```php tab=Pest
<?php

use Illuminate\Contracts\Process\ProcessResult;
use Illuminate\Process\PendingProcess;
use Illuminate\Support\Facades\Process;

test('process is invoked', function () {
    Process::fake();

    $response = $this->get('/import');

    // Simple process assertion...
    Process::assertRan('bash import.sh');

    // O inspeccionar la configuración del proceso...
    Process::assertRan(function (PendingProcess $process, ProcessResult $result) {
        return $process->command === 'bash import.sh' &&
               $process->timeout === 60;
    });
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Illuminate\Contracts\Process\ProcessResult;
use Illuminate\Process\PendingProcess;
use Illuminate\Support\Facades\Process;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_process_is_invoked(): void
    {
        Process::fake();

        $response = $this->get('/import');

        // Simple process assertion...
        Process::assertRan('bash import.sh');

        // O inspeccionar la configuración del proceso...
        Process::assertRan(function (PendingProcess $process, ProcessResult $result) {
            return $process->command === 'bash import.sh' &&
                   $process->timeout === 60;
        });
    }
}
```

Como se analizó, invocar el método `fake` en la fachada `Process` le indicará a Laravel que siempre devuelva un resultado de proceso exitoso sin salida. Sin embargo, puede especificar fácilmente la salida y el código de salida para procesos simulados utilizando el método `result` de la fachada `Process`:

```php
Process::fake([
    '*' => Process::result(
        output: 'Test output',
        errorOutput: 'Test error output',
        exitCode: 1,
    ),
]);
```

<a id="faking-specific-processes"></a>
### Simulación de procesos específicos

Como habrás notado en un ejemplo anterior, la fachada `Process` te permite especificar diferentes resultados simulados por proceso pasando una matriz al método `fake`.

Las claves de la matriz deben representar patrones de comando que desea simular y sus resultados asociados. El carácter `*` se puede utilizar como carácter comodín. En realidad, se invocará cualquier comando de proceso que no haya sido simulado. Puede utilizar el método `result` de la fachada `Process` para construir resultados simulados para estos comandos:

```php
Process::fake([
    'cat *' => Process::result(
        output: 'Test "cat" output',
    ),
    'ls *' => Process::result(
        output: 'Test "ls" output',
    ),
]);
```

Si no necesita personalizar el código de salida o la salida de error de un proceso simulado, puede que le resulte más conveniente especificar los resultados del proceso simulado como cadenas simples:

```php
Process::fake([
    'cat *' => 'Test "cat" output',
    'ls *' => 'Test "ls" output',
]);
```

<a id="faking-process-sequences"></a>
### Secuencias de procesos simulados

Si el código que está probando invoca varios procesos con el mismo comando, es posible que desee asignar un resultado de proceso simulado diferente a cada invocación de proceso. Puede lograr esto mediante el método `sequence` de la fachada `Process`:

```php
Process::fake([
    'ls *' => Process::sequence()
        ->push(Process::result('First invocation'))
        ->push(Process::result('Second invocation')),
]);
```

<a id="faking-asynchronous-process-lifecycles"></a>
### Simulación de los ciclos de vida de procesos asincrónicos

Hasta ahora, hemos analizado principalmente la simulación de procesos que se invocan sincrónicamente utilizando el método `run`. Sin embargo, si intenta probar código que interactúa con procesos asincrónicos invocados mediante `start`, es posible que necesite un enfoque más sofisticado para describir sus procesos simulados.

Por ejemplo, imaginemos la siguiente ruta que interactúa con un proceso asincrónico:

```php
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;

Route::get('/import', function () {
    $process = Process::start('bash import.sh');

    while ($process->running()) {
        Log::info($process->latestOutput());
        Log::info($process->latestErrorOutput());
    }

    return 'Done';
});
```

Para simular correctamente este proceso, debemos poder describir cuántas veces el método `running` debería devolver `true`. Además, es posible que deseemos especificar varias líneas de salida que deben devolverse en secuencia. Para lograr esto, podemos utilizar el método `describe` de la fachada `Process`:

```php
Process::fake([
    'bash import.sh' => Process::describe()
        ->output('First line of standard output')
        ->errorOutput('First line of error output')
        ->output('Second line of standard output')
        ->exitCode(0)
        ->iterations(3),
]);
```

Profundicemos en el ejemplo anterior. Usando los métodos `output` y `errorOutput`, podemos especificar múltiples líneas de salida que se devolverán en secuencia. Se puede utilizar el método `exitCode` para especificar el código de salida final del proceso simulado. Finalmente, el método `iterations` se puede utilizar para especificar cuántas veces el método `running` debe devolver `true`.

<a id="available-assertions"></a>
### Afirmaciones disponibles

Como se comentó anteriormente](#faking-processes), Laravel proporciona varias afirmaciones de proceso para sus pruebas de funciones. Discutiremos cada una de estas afirmaciones a continuación.

<a id="assert-process-ran"></a>
#### assertRan

Afirmar que se invocó un proceso determinado:

```php
use Illuminate\Support\Facades\Process;

Process::assertRan('ls -la');
```

Cuando el proceso fue invocado con una matriz de argumentos, puedes pasar la misma matriz a la aserción:

```php
Process::assertRan(['php', 'artisan', 'migrate']);
```

Los métodos `assertRanTimes` y `assertDidntRun` también aceptan comandos de matriz.

El método `assertRan` también acepta una función anónima, que recibirá una instancia de un proceso y un resultado del proceso, lo que le permitirá inspeccionar las opciones configuradas del proceso. Si esta función anónima devuelve `true`, la aserción "pasará":

```php
Process::assertRan(fn ($process, $result) =>
    $process->command === 'ls -la' &&
    $process->path === __DIR__ &&
    $process->timeout === 60
);
```

El `$process` pasado a la función anónima `assertRan` es una instancia de `Illuminate\Process\PendingProcess`, mientras que el `$result` es una instancia de `Illuminate\Contracts\Process\ProcessResult`.

<a id="assert-process-didnt-run"></a>
#### assertDidntRun

Afirmar que no se invocó un proceso determinado:

```php
use Illuminate\Support\Facades\Process;

Process::assertDidntRun('ls -la');
```

Al igual que el método `assertRan`, el método `assertDidntRun` también acepta una función anónima, que recibirá una instancia de un proceso y el resultado del proceso, lo que le permitirá inspeccionar las opciones configuradas del proceso. Si esta función anónima devuelve `true`, la aserción "fallará":

```php
Process::assertDidntRun(fn (PendingProcess $process, ProcessResult $result) =>
    $process->command === 'ls -la'
);
```

<a id="assert-process-ran-times"></a>
#### assertRanTimes

Afirmar que un proceso determinado fue invocado un número determinado de veces:

```php
use Illuminate\Support\Facades\Process;

Process::assertRanTimes('ls -la', times: 3);
```

El método `assertRanTimes` también acepta una función anónima, que recibirá una instancia de `PendingProcess` y `ProcessResult`, lo que le permitirá inspeccionar las opciones configuradas del proceso. Si esta función anónima devuelve `true` y el proceso se invocó la cantidad especificada de veces, la aserción "pasará":

```php
Process::assertRanTimes(function (PendingProcess $process, ProcessResult $result) {
    return $process->command === 'ls -la';
}, times: 3);
```

<a id="assert-processes-ran-in-order"></a>
#### assertRanInOrder

Afirmar que los procesos fueron invocados en un orden determinado:

```php
Process::assertRanInOrder([
    'git fetch',
    'composer install',
]);
```

El método `assertRanInOrder` acepta cadenas de comandos, matrices de argumentos de comandos o funciones anónimas como las demás afirmaciones del proceso.

<a id="preventing-stray-processes"></a>
### Prevención de procesos perdidos

Si desea asegurarse de que todos los procesos invocados tengan resultados simulados durante una prueba o un conjunto completo de pruebas, puede llamar al método `preventStrayProcesses`. Después de llamar a este método, cualquier proceso que no tenga un resultado simulado correspondiente generará una excepción en lugar de iniciar un proceso real:

```php
use Illuminate\Support\Facades\Process;

Process::preventStrayProcesses();

Process::fake([
    'ls *' => 'Test output...',
]);

// Fake response is returned...
Process::run('ls -la');

// An exception is thrown...
Process::run('bash import.sh');
```
