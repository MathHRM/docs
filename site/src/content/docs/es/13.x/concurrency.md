---
title: "Concurrencia"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Ejecución de tareas concurrentes](#running-concurrent-tasks)
    - [Resultados con nombre](#named-results)
    - [Tiempos de espera de tareas](#task-timeouts)
- [Aplazamiento de tareas concurrentes](#deferring-concurrent-tasks)

<a id="introduction"></a>
## Introducción

A veces necesitas ejecutar varias tareas lentas que no dependen unas de otras. En muchos casos, ejecutar las tareas de forma concurrente puede mejorar considerablemente el rendimiento. La fachada `Concurrency` de Laravel ofrece una API sencilla y práctica para ejecutar funciones anónimas de forma concurrente.

<a id="how-it-works"></a>
#### Cómo funciona

Laravel logra la concurrencia serializando las funciones anónimas proporcionadas y despachándolas a un comando oculto de la CLI de Artisan, que las deserializa y las invoca en su propio proceso PHP. Tras invocar la función anónima, el valor resultante se serializa y se devuelve al proceso padre.

La fachada `Concurrency` admite tres controladores: `process` (el predeterminado), `fork` y `sync`.

El controlador `fork` ofrece un rendimiento mejorado en comparación con el controlador `process` predeterminado, pero solo puede usarse dentro del contexto CLI de PHP, ya que PHP no admite la bifurcación durante las solicitudes web. Antes de utilizar el controlador `fork`, debes instalar el paquete `spatie/fork`:

```shell
composer require spatie/fork
```

El controlador `sync` es útil principalmente durante las pruebas cuando quieres deshabilitar toda la concurrencia y ejecutar las funciones anónimas proporcionadas en secuencia dentro del proceso padre.

<a id="running-concurrent-tasks"></a>
## Ejecución de tareas concurrentes

Para ejecutar tareas concurrentes, puedes invocar el método `run` de la fachada `Concurrency`. El método `run` acepta un array de funciones anónimas que deben ejecutarse simultáneamente en procesos PHP secundarios:

```php
use Illuminate\Support\Facades\Concurrency;
use Illuminate\Support\Facades\DB;

[$userCount, $orderCount] = Concurrency::run([
    fn () => DB::table('users')->count(),
    fn () => DB::table('orders')->count(),
]);
```

Para utilizar un controlador específico, puedes usar el método `driver`:

```php
$results = Concurrency::driver('fork')->run(...);
```

O, para cambiar el controlador de concurrencia predeterminado, debes publicar el archivo de configuración `concurrency` mediante el comando de Artisan `config:publish` y actualizar la opción `default` dentro del archivo:

```shell
php artisan config:publish concurrency
```

<a id="named-results"></a>
### Resultados con nombre

Si quieres acceder a los resultados de las tareas concurrentes por nombre en lugar de por posición, puedes proporcionar un array asociativo de funciones anónimas. Cada resultado se devolverá con la misma clave que su función anónima correspondiente:

```php
use Illuminate\Support\Facades\Concurrency;
use Illuminate\Support\Facades\DB;

$results = Concurrency::run([
    'users' => fn () => DB::table('users')->count(),
    'orders' => fn () => DB::table('orders')->count(),
]);

$userCount = $results['users'];
$orderCount = $results['orders'];
```

<a id="task-timeouts"></a>
### Tiempos de espera de tareas

Al usar el controlador `process` (el predeterminado), puedes especificar el número máximo de segundos que una tarea concurrente puede ejecutarse antes de que se la termine, proporcionando un tiempo de espera al método `run`:

```php
use Illuminate\Support\Facades\Concurrency;
use Illuminate\Support\Facades\DB;

[$userCount, $orderCount] = Concurrency::run([
    fn () => DB::table('users')->count(),
    fn () => DB::table('orders')->count(),
], timeout: 30);
```

También puedes proporcionar una instancia de `CarbonInterval` si prefieres una definición de tiempo de espera más expresiva:

```php
use Illuminate\Support\Facades\Concurrency;

use function Illuminate\Support\seconds;

Concurrency::run([...], timeout: seconds(30));
```

<a id="deferring-concurrent-tasks"></a>
## Aplazamiento de tareas concurrentes

Si quieres ejecutar un array de funciones anónimas de forma concurrente, pero no necesitas los resultados que devuelven, considera usar el método `defer`. Al invocar el método `defer`, las funciones anónimas proporcionadas no se ejecutan inmediatamente. Laravel las ejecutará de forma concurrente después de enviar la respuesta HTTP al usuario:

```php
use App\Services\Metrics;
use Illuminate\Support\Facades\Concurrency;

Concurrency::defer([
    fn () => Metrics::report('users'),
    fn () => Metrics::report('orders'),
]);
```
