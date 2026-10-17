---
title: "Base de datos: población"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Escritura de seeders](#writing-seeders)
    - [Uso de factorías de modelos](#using-model-factories)
    - [Invocación de seeders adicionales](#calling-additional-seeders)
    - [Silenciar eventos del modelo](#muting-model-events)
- [Ejecución de seeders](#running-seeders)

<a id="introduction"></a>
## Introducción

Laravel permite poblar tu base de datos mediante clases seeder. Todas las clases seeder se almacenan en el directorio `database/seeders`. De forma predeterminada, se define una clase `DatabaseSeeder`. Desde esta clase, puedes usar el método `call` para ejecutar otras clases seeder y controlar así el orden en que se puebla la base de datos.

> **Nota:**
> La [protección contra la asignación masiva](../eloquent/#mass-assignment) se desactiva automáticamente al poblar la base de datos.

<a id="writing-seeders"></a>
## Escritura de seeders

Para generar un seeder, ejecuta el [comando de Artisan](../artisan/) `make:seeder`. Todos los seeders generados por el framework se colocarán en el directorio `database/seeders`:

```shell
php artisan make:seeder UserSeeder
```

Una clase seeder solo contiene un método de forma predeterminada: `run`. Este método se invoca al ejecutar el [comando de Artisan](../artisan/) `db:seed`. Dentro del método `run`, puedes insertar datos en tu base de datos como desees. Puedes usar el [constructor de consultas](../queries/) para insertar datos manualmente o usar [factorías de modelos Eloquent](../eloquent-factories/).

Como ejemplo, modifiquemos la clase `DatabaseSeeder` predeterminada y agreguemos una instrucción de inserción en la base de datos al método `run`:

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Ejecutar los seeders de la base de datos.
     */
    public function run(): void
    {
        DB::table('users')->insert([
            'name' => Str::random(10),
            'email' => Str::random(10).'@example.com',
            'password' => Hash::make('password'),
        ]);
    }
}
```

> **Nota:**
> Puedes declarar los tipos de las dependencias que necesites en la firma del método `run`. Se resolverán automáticamente mediante el [contenedor de servicios](../container/) de Laravel.

<a id="using-model-factories"></a>
### Uso de factorías de modelos

Especificar manualmente los atributos de cada modelo al poblar la base de datos resulta engorroso. En su lugar, puedes usar [factorías de modelos](../eloquent-factories/) para generar cómodamente grandes cantidades de registros de la base de datos. Primero, consulta la [documentación de las factorías de modelos](../eloquent-factories/) para aprender a definir tus factorías.

Por ejemplo, creemos 50 usuarios, cada uno con una publicación relacionada:

```php
use App\Models\User;

/**
 * Ejecutar los seeders de la base de datos.
 */
public function run(): void
{
    User::factory()
        ->count(50)
        ->hasPosts(1)
        ->create();
}
```

<a id="calling-additional-seeders"></a>
### Invocación de seeders adicionales

Dentro de la clase `DatabaseSeeder`, puedes usar el método `call` para ejecutar clases seeder adicionales. El método `call` te permite dividir la población de tu base de datos en varios archivos para que ninguna clase seeder sea demasiado grande. El método `call` acepta un array de clases seeder que deben ejecutarse:

```php
/**
 * Ejecutar los seeders de la base de datos.
 */
public function run(): void
{
    $this->call([
        UserSeeder::class,
        PostSeeder::class,
        CommentSeeder::class,
    ]);
}
```

<a id="muting-model-events"></a>
### Silenciar eventos del modelo

Al ejecutar seeders, puedes querer evitar que los modelos despachen eventos. Puedes lograrlo usando el trait `WithoutModelEvents`. El trait `WithoutModelEvents` garantiza que no se despachen eventos del modelo, incluso si se ejecutan clases seeder adicionales mediante el método `call`:

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Ejecutar los seeders de la base de datos.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
        ]);
    }
}
```

<a id="running-seeders"></a>
## Ejecución de seeders

Puedes ejecutar el comando de Artisan `db:seed` para poblar tu base de datos. De forma predeterminada, el comando `db:seed` ejecuta la clase `Database\Seeders\DatabaseSeeder`, que a su vez puede invocar otras clases seeder. Sin embargo, puedes usar la opción `--class` para especificar una clase seeder que se ejecute individualmente:

```shell
php artisan db:seed

php artisan db:seed --class=UserSeeder
```

También puedes poblar tu base de datos usando el comando `migrate:fresh` junto con la opción `--seed`, que eliminará todas las tablas y volverá a ejecutar todas tus migraciones. Este comando es útil para reconstruir completamente tu base de datos. Puedes usar la opción `--seeder` para especificar un seeder concreto que ejecutar:

```shell
php artisan migrate:fresh --seed

php artisan migrate:fresh --seed --seeder=UserSeeder
```

<a id="forcing-seeding-production"></a>
#### Forzar la ejecución de seeders en producción

Algunas operaciones de población pueden alterar o eliminar datos. Para protegerte de la ejecución de comandos de población en tu base de datos de producción, se te pedirá confirmación antes de ejecutar los seeders en el entorno `production`. Para forzar su ejecución sin que se solicite confirmación, usa la opción `--force`:

```shell
php artisan db:seed --force
```
