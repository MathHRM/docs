---
title: "Pruebas de bases de datos"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
    - [Restablecer la base de datos después de cada prueba](#resetting-the-database-after-each-test)
- [Factorías de modelos](#model-factories)
- [Ejecución de seeders](#running-seeders)
- [Aserciones disponibles](#available-assertions)

<a id="introduction"></a>
## Introducción

Laravel proporciona una variedad de herramientas y aserciones útiles para facilitar las pruebas de tus aplicaciones que usan bases de datos. Además, las factorías de modelos y seeders de Laravel hacen que sea sencillo crear registros de bases de datos de prueba utilizando los modelos y relaciones de Eloquent de tu aplicación. Discutiremos todas estas potentes funciones en la siguiente documentación.

<a id="resetting-the-database-after-each-test"></a>
### Restablecer la base de datos después de cada prueba

Antes de continuar, analicemos cómo restablecer tu base de datos después de cada una de tus pruebas para que los datos de una prueba anterior no interfieran con las pruebas posteriores. El trait `Illuminate\Foundation\Testing\RefreshDatabase` incluido en Laravel se encargará de esto por ti. Simplemente usa el trait en tu clase de prueba:

```php tab=Pest
<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

pest()->use(RefreshDatabase::class);

test('basic example', function () {
    $response = $this->get('/');

    // ...
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    /**
     * A basic functional test example.
     */
    public function test_basic_example(): void
    {
        $response = $this->get('/');

        // ...
    }
}
```

El trait `Illuminate\Foundation\Testing\RefreshDatabase` no migra tu base de datos si su esquema está actualizado. En cambio, sólo ejecutará la prueba dentro de una transacción de base de datos. Por lo tanto, cualquier registro agregado a la base de datos mediante casos de prueba que no utilicen este trait pueden seguir existiendo en la base de datos.

Si quieres restablecer totalmente la base de datos, puedes usar los traits `Illuminate\Foundation\Testing\DatabaseMigrations` o `Illuminate\Foundation\Testing\DatabaseTruncation`. Sin embargo, ambas opciones son significativamente más lentas que el trait `RefreshDatabase`.

<a id="model-factories"></a>
## Factorías de modelos

Al realizar la prueba, puedes necesitar insertar algunos registros en tu base de datos antes de ejecutar la prueba. En lugar de especificar manualmente el valor de cada columna cuando creas estos datos de prueba, Laravel te permite definir un conjunto de atributos predeterminados para cada uno de tus [modelos Eloquent](../eloquent/) usando [factorías de modelos](../eloquent-factories/).

Para obtener más información sobre cómo crear y utilizar factorías de modelos para crear modelos, consulta la [documentación completa de las factorías de modelos](../eloquent-factories/). Una vez que hayas definido una factoría de modelos, puedes usar la factoría dentro de tu prueba para crear modelos:

```php tab=Pest
use App\Models\User;

test('models can be instantiated', function () {
    $user = User::factory()->create();

    // ...
});
```

```php tab=PHPUnit
use App\Models\User;

public function test_models_can_be_instantiated(): void
{
    $user = User::factory()->create();

    // ...
}
```

<a id="running-seeders"></a>
## Ejecución de seeders

Si quieres utilizar [seeders de base de datos](../seeding/) para poblar tu base de datos durante una prueba funcional, puedes invocar el método `seed`. De forma predeterminada, el método `seed` ejecutará el `DatabaseSeeder`, que debería ejecutar todas las demás seeders. Alternativamente, puedes pasar un nombre de clase de seeder específico al método `seed`:

```php tab=Pest
<?php

use Database\Seeders\OrderStatusSeeder;
use Database\Seeders\TransactionStatusSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

pest()->use(RefreshDatabase::class);

test('orders can be created', function () {
    // Ejecutar DatabaseSeeder...
    $this->seed();

    // Ejecutar un seeder específico...
    $this->seed(OrderStatusSeeder::class);

    // ...

    // Ejecutar un array de seeders específicos...
    $this->seed([
        OrderStatusSeeder::class,
        TransactionStatusSeeder::class,
        // ...
    ]);
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Database\Seeders\OrderStatusSeeder;
use Database\Seeders\TransactionStatusSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Probar la creación de un pedido nuevo.
     */
    public function test_orders_can_be_created(): void
    {
        // Ejecutar DatabaseSeeder...
        $this->seed();

        // Ejecutar un seeder específico...
        $this->seed(OrderStatusSeeder::class);

        // ...

        // Ejecutar un array de seeders específicos...
        $this->seed([
            OrderStatusSeeder::class,
            TransactionStatusSeeder::class,
            // ...
        ]);
    }
}
```

Alternativamente, puedes indicarle a Laravel que pueble automáticamente la base de datos antes de cada prueba que utilice el trait `RefreshDatabase`. Puedes lograrlo agregando el atributo `Seed` a tu clase de prueba base:

```php
<?php

namespace Tests;

use Illuminate\Foundation\Testing\Attributes\Seed;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

#[Seed]
abstract class TestCase extends BaseTestCase
{
}
```

Cuando el atributo `Seed` está presente, la prueba ejecutará la clase `Database\Seeders\DatabaseSeeder` antes de cada prueba que utilice el trait `RefreshDatabase`. Sin embargo, puedes especificar una seeder específica que debe ejecutarse utilizando el atributo `Seeder` en tu clase de prueba:

```php
<?php

namespace Tests\Feature;

use Database\Seeders\OrderStatusSeeder;
use Illuminate\Foundation\Testing\Attributes\Seeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

#[Seeder(OrderStatusSeeder::class)]
class OrderTest extends TestCase
{
    use RefreshDatabase;

    // ...
}
```

<a id="available-assertions"></a>
## Aserciones disponibles

Laravel proporciona varias aserciones de bases de datos para tus pruebas funcionales [Pest](https://pestphp.com) o [PHPUnit](https://phpunit.de). Discutiremos cada una de estas aserciones a continuación.

<a id="assert-database-count"></a>
#### assertDatabaseCount

Comprueba que una tabla en la base de datos contiene el número dado de registros:

```php
$this->assertDatabaseCount('users', 5);
```

<a id="assert-database-empty"></a>
#### assertDatabaseEmpty

Comprueba que una tabla en la base de datos no contiene registros:

```php
$this->assertDatabaseEmpty('users');
```

<a id="assert-database-has"></a>
#### assertDatabaseHas

Comprueba que una tabla en la base de datos contiene registros que coinciden con las restricciones de consulta de clave/valor dadas:

```php
$this->assertDatabaseHas('users', [
    'email' => 'sally@example.com',
]);
```

<a id="assert-database-missing"></a>
#### assertDatabaseMissing

Comprueba que una tabla en la base de datos no contiene registros que coincidan con las restricciones de consulta de clave/valor dadas:

```php
$this->assertDatabaseMissing('users', [
    'email' => 'sally@example.com',
]);
```

<a id="assert-deleted"></a>
#### assertSoftDeleted

El método `assertSoftDeleted` se puedes usar para comprobar que un modelo Eloquent determinado ha sido «eliminado de forma lógica»:

```php
$this->assertSoftDeleted($user);
```

<a id="assert-not-deleted"></a>
#### assertNotSoftDeleted

El método `assertNotSoftDeleted` se puedes usar para comprobar que un modelo Eloquent determinado no ha sido «eliminado de forma lógica»:

```php
$this->assertNotSoftDeleted($user);
```

<a id="assert-model-exists"></a>
#### assertModelExists

Comprueba que existe un modelo determinado o una colección de modelos en la base de datos:

```php
use App\Models\User;

$user = User::factory()->create();

$this->assertModelExists($user);
```

<a id="assert-model-missing"></a>
#### assertModelMissing

Comprueba que un modelo determinado o una colección de modelos no existe en la base de datos:

```php
use App\Models\User;

$user = User::factory()->create();

$user->delete();

$this->assertModelMissing($user);
```

<a id="expects-database-query-count"></a>
#### expectsDatabaseQueryCount

Se puedes invocar el método `expectsDatabaseQueryCount` al comienzo de la prueba para especificar el número total de consultas de base de datos que esperas ejecutar durante la prueba. Si el número real de consultas ejecutadas no coincide exactamente con esta expectativa, la prueba fallará:

```php
$this->expectsDatabaseQueryCount(5);

// Probar...
```
