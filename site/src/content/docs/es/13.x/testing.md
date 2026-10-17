---
title: "Pruebas: cómo empezar"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Medio Ambiente](#environment)
- [Creando pruebas](#creating-tests)
- [Ejecución de pruebas](#running-tests)
    - [Ejecución de pruebas en paralelo](#running-tests-in-parallel)
    - [Cobertura de prueba de informes](#reporting-test-coverage)
    - [Pruebas de perfilado](#profiling-tests)
- [Almacenamiento en caché de configuración](#configuration-caching)

<a id="introduction"></a>
## Introducción

Laravel está construido pensando en las pruebas. De hecho, la compatibilidad con pruebas con [Pest](https://pestphp.com) y [PHPUnit](https://phpunit.de) está incluida de fábrica y ya hay un archivo `phpunit.xml` configurado para su aplicación. El marco también incluye métodos auxiliares convenientes que le permiten probar sus aplicaciones de manera expresiva.

De forma predeterminada, el directorio `tests` de su aplicación contiene dos directorios: `Feature` y `Unit`. Las pruebas unitarias son pruebas que se centran en una porción muy pequeña y aislada de su código. De hecho, la mayoría de las pruebas unitarias probablemente se centren en un único método. Las pruebas dentro de su directorio de pruebas "Unidad" no inician su aplicación Laravel y, por lo tanto, no pueden acceder a la base de datos de su aplicación u otros servicios de marco.

Las pruebas de funciones pueden probar una porción más grande de su código, incluida la forma en que varios objetos interactúan entre sí o incluso una solicitud HTTP completa a un punto final JSON. **Generalmente, la mayoría de sus pruebas deben ser pruebas de funciones. Este tipo de pruebas brindan la mayor confianza de que su sistema en su conjunto funciona según lo previsto.**

Se proporciona un archivo `ExampleTest.php` en los directorios de prueba `Feature` y `Unit`. Después de instalar una nueva aplicación Laravel, ejecute los comandos `vendor/bin/pest`, `vendor/bin/phpunit` o `php artisan test` para ejecutar sus pruebas.

<a id="environment"></a>
## Medio ambiente

Al ejecutar pruebas, Laravel establecerá automáticamente el [entorno de configuración](../configuration/#environment-configuration) en `testing` debido a las variables de entorno definidas en el archivo `phpunit.xml`. Laravel también configura automáticamente la sesión y el caché en el controlador `array` para que no se conserven datos de sesión o caché durante la prueba.

Usted es libre de definir otros valores de configuración del entorno de prueba según sea necesario. Las variables de entorno `testing` se pueden configurar en el archivo `phpunit.xml` de su aplicación, pero asegúrese de borrar su caché de configuración usando el comando `config:clear` Artisan antes de ejecutar sus pruebas.

<a id="the-env-testing-environment-file"></a>
#### El archivo de entorno `.env.testing`

Además, puede crear un archivo `.env.testing` en la raíz de su proyecto. Este archivo se utilizará en lugar del archivo `.env` al ejecutar pruebas de Pest y PHPUnit o al ejecutar comandos Artisan con la opción `--env=testing`.

<a id="creating-tests"></a>
## Creando pruebas

Para crear un nuevo caso de prueba, utilice el comando `make:test` Artisan. De forma predeterminada, las pruebas se colocarán en el directorio `tests/Feature`:

```shell
php artisan make:test UserTest
```

Si desea crear una prueba dentro del directorio `tests/Unit`, puede usar la opción `--unit` al ejecutar el comando `make:test`:

```shell
php artisan make:test UserTest --unit
```

Si tiene una clase de prueba que depende principalmente de las funciones de prueba de Laravel, pero un método de prueba específico no necesita que se inicie el marco, puede aplicar el atributo `#[UnitTest]` a ese método para omitir el inicio de la aplicación solo para esa prueba.

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\Attributes\UnitTest;
use Tests\TestCase;

class LocationServiceTest extends TestCase
{
    public function test_get_coordinates_resolves_address(): void
    {
        // This test uses Laravel's testing features...
    }

    #[UnitTest]
    public function test_get_state_returns_state_from_abbreviation(): void
    {
        // This test runs without booting the application...
    }
}
```

> **Nota:**
> Los resguardos de prueba se pueden personalizar usando [stub Publishing](../artisan/#stub-customization).

Una vez que se haya generado la prueba, puede definir la prueba como lo haría normalmente usando Pest o PHPUnit. Para ejecutar sus pruebas, ejecute el comando `vendor/bin/pest`, `vendor/bin/phpunit` o `php artisan test` desde su terminal:

```php tab=Pest
<?php

test('basic', function () {
    expect(true)->toBeTrue();
});
```

```php tab=PHPUnit
<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_basic_test(): void
    {
        $this->assertTrue(true);
    }
}
```

> **Advertencia:**
> Si define sus propios métodos `setUp` / `tearDown` dentro de una clase de prueba, asegúrese de llamar a los métodos `parent::setUp()` / `parent::tearDown()` respectivos en la clase principal. Normalmente, debe invocar `parent::setUp()` al inicio de su propio método `setUp` y `parent::tearDown()` al final de su método `tearDown`.

<a id="running-tests"></a>
## Ejecución de pruebas

Como se mencionó anteriormente, una vez que haya escrito las pruebas, puede ejecutarlas usando `pest` o `phpunit`:

```shell tab=Pest
./vendor/bin/pest
```

```shell tab=PHPUnit
./vendor/bin/phpunit
```

Además de los comandos `pest` o `phpunit`, puede utilizar el comando `test` Artisan para ejecutar sus pruebas. El ejecutor de pruebas Artisan proporciona informes de prueba detallados para facilitar el desarrollo y la depuración:

```shell
php artisan test
```

Cualquier argumento que se pueda pasar a los comandos `pest` o `phpunit` también se puede pasar al comando Artisan `test`:

```shell
php artisan test --testsuite=Feature --stop-on-failure
```

<a id="running-tests-in-parallel"></a>
### Ejecución de pruebas en paralelo

De forma predeterminada, Laravel y Pest/PHPUnit ejecutan sus pruebas de forma secuencial dentro de un solo proceso. Sin embargo, puede reducir en gran medida la cantidad de tiempo que lleva ejecutar las pruebas ejecutando pruebas simultáneamente en varios procesos. Para comenzar, debe instalar el paquete `brianium/paratest` Composer como una dependencia "dev". Luego, incluya la opción `--parallel` al ejecutar el comando `test` Artisan:

```shell
composer require brianium/paratest --dev

php artisan test --parallel
```

De forma predeterminada, Laravel creará tantos procesos como núcleos de CPU disponibles en su máquina. Sin embargo, puede ajustar la cantidad de procesos usando la opción `--processes`:

```shell
php artisan test --parallel --processes=4
```

> **Advertencia:**
> Al ejecutar pruebas en paralelo, es posible que algunas opciones de Pest/PHPUnit (como `--do-not-cache-result`) no estén disponibles.

<a id="parallel-testing-and-databases"></a>
#### Pruebas paralelas y bases de datos

Siempre que haya configurado una conexión de base de datos principal, Laravel maneja automáticamente la creación y migración de una base de datos de prueba para cada proceso paralelo que ejecuta sus pruebas. Las bases de datos de prueba tendrán el sufijo un token de proceso que es único por proceso. Por ejemplo, si tiene dos procesos de prueba paralelos, Laravel creará y utilizará las bases de datos de prueba `your_db_test_1` y `your_db_test_2`.

De forma predeterminada, las bases de datos de prueba persisten entre llamadas al comando `test` Artisan para que puedan usarse nuevamente en invocaciones posteriores de `test`. Sin embargo, puede volver a crearlos utilizando la opción `--recreate-databases`:

```shell
php artisan test --parallel --recreate-databases
```

<a id="parallel-testing-hooks"></a>
#### Ganchos de prueba paralelos

En ocasiones, es posible que necesite preparar ciertos recursos utilizados por las pruebas de su aplicación para que puedan ser utilizados de forma segura por múltiples procesos de prueba.

Usando la fachada `ParallelTesting`, puede especificar el código que se ejecutará en `setUp` y `tearDown` de un proceso o caso de prueba. Las funciones anónimas dadas reciben las variables `$token` y `$testCase` que contienen el token de proceso y el caso de prueba actual, respectivamente:

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\ParallelTesting;
use Illuminate\Support\ServiceProvider;
use PHPUnit\Framework\TestCase;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Inicializar los servicios de la aplicación.
     */
    public function boot(): void
    {
        ParallelTesting::setUpProcess(function (int $token) {
            // ...
        });

        ParallelTesting::setUpTestCase(function (int $token, TestCase $testCase) {
            // ...
        });

        // Executed when a test database is created...
        ParallelTesting::setUpTestDatabase(function (string $database, int $token) {
            Artisan::call('db:seed');
        });

        ParallelTesting::tearDownTestCase(function (int $token, TestCase $testCase) {
            // ...
        });

        ParallelTesting::tearDownProcess(function (int $token) {
            // ...
        });
    }
}
```

<a id="accessing-the-parallel-testing-token"></a>
#### Accediendo al token de prueba paralela

Si desea acceder al "token" del proceso paralelo actual desde cualquier otra ubicación en el código de prueba de su aplicación, puede utilizar el método `token`. Este token es un identificador de cadena único para un proceso de prueba individual y puede usarse para segmentar recursos en procesos de prueba paralelos. Por ejemplo, Laravel agrega automáticamente este token al final de las bases de datos de prueba creadas por cada proceso de prueba paralelo:

    $token = ParallelTesting::token();

<a id="reporting-test-coverage"></a>
### Informes de cobertura de pruebas

> **Advertencia:**
> Esta característica requiere [Xdebug](https://xdebug.org) o [PCOV](https://pecl.php.net/package/pcov).

Al ejecutar las pruebas de su aplicación, es posible que desee determinar si sus casos de prueba realmente cubren el código de la aplicación y cuánto código de la aplicación se utiliza al ejecutar las pruebas. Para lograr esto, puede proporcionar la opción `--coverage` al invocar el comando `test`:

```shell
php artisan test --coverage
```

<a id="enforcing-a-minimum-coverage-threshold"></a>
#### Hacer cumplir un umbral mínimo de cobertura

Puede utilizar la opción `--min` para definir un umbral mínimo de cobertura de prueba para su aplicación. El conjunto de pruebas fallará si no se alcanza este umbral:

```shell
php artisan test --coverage --min=80.3
```

<a id="profiling-tests"></a>
### Pruebas de creación de perfiles

El ejecutor de pruebas Artisan también incluye un mecanismo conveniente para enumerar las pruebas más lentas de su aplicación. Invoque el comando `test` con la opción `--profile` para que se le presente una lista de sus diez pruebas más lentas, lo que le permitirá investigar fácilmente qué pruebas se pueden mejorar para acelerar su conjunto de pruebas:

```shell
php artisan test --profile
```

<a id="configuration-caching"></a>
## Almacenamiento en caché de configuración

Al ejecutar pruebas, Laravel inicia la aplicación para cada método de prueba individual. Sin un archivo de configuración almacenado en caché, cada archivo de configuración de su aplicación debe cargarse al inicio de una prueba. Para crear la configuración una vez y reutilizarla para todas las pruebas en una sola ejecución, puede usar el rasgo `Illuminate\Foundation\Testing\WithCachedConfig`:

```php tab=Pest
<?php

use Illuminate\Foundation\Testing\WithCachedConfig;

pest()->use(WithCachedConfig::class);

// ...
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\WithCachedConfig;
use Tests\TestCase;

class ConfigTest extends TestCase
{
    use WithCachedConfig;

    // ...
}
```
