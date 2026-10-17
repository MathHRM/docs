---
title: "Base de datos: Migraciones"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Generando Migraciones](#generating-migrations)
    - [Aplastando Migraciones](#squashing-migrations)
- [Estructura de migración](#migration-structure)
- [Ejecución de migraciones](#running-migrations)
    - [Revertir migraciones](#rolling-back-migrations)
- [Tablas](#tables)
    - [Creando tablas](#creating-tables)
    - [Actualización de tablas](#updating-tables)
    - [Renombrar/eliminar tablas](#renaming-and-dropping-tables)
- [Columnas](#columns)
    - [Creando columnas](#creating-columns)
    - [Tipos de columnas disponibles](#available-column-types)
    - [Modificadores de columna](#column-modifiers)
    - [Modificando columnas](#modifying-columns)
    - [Renombrar columnas](#renaming-columns)
    - [Eliminar columnas](#dropping-columns)
- [Índices](#indexes)
    - [Creación de índices](#creating-indexes)
    - [Renombrar índices](#renaming-indexes)
    - [Eliminando índices](#dropping-indexes)
    - [Restricciones de clave externa](#foreign-key-constraints)
- [Eventos](#events)

<a id="introduction"></a>
## Introducción

Las migraciones son como control de versiones de su base de datos, lo que le permite a su equipo definir y compartir la definición del esquema de la base de datos de la aplicación. Si alguna vez tuvo que decirle a un compañero de equipo que agregue manualmente una columna a su esquema de base de datos local después de realizar los cambios desde el control de fuente, se ha enfrentado al problema que resuelven las migraciones de bases de datos.

Laravel `Schema` [facade](../facades/) proporciona soporte independiente de la base de datos para crear y manipular tablas en todos los sistemas de bases de datos compatibles con Laravel. Normalmente, las migraciones utilizarán esta fachada para crear y modificar tablas y columnas de bases de datos.

<a id="generating-migrations"></a>
## Generando Migraciones

Puede utilizar el comando `make:migration` [Artisan command](../artisan/) para generar una migración de base de datos. La nueva migración se colocará en su directorio `database/migrations`. Cada nombre de archivo de migración contiene una marca de tiempo que permite a Laravel determinar el orden de las migraciones:

```shell
php artisan make:migration create_flights_table
```

Laravel usará el nombre de la migración para intentar adivinar el nombre de la tabla y si la migración creará o no una nueva tabla. Si Laravel puede determinar el nombre de la tabla a partir del nombre de la migración, Laravel completará previamente el archivo de migración generado con la tabla especificada. De lo contrario, puede simplemente especificar la tabla en el archivo de migración manualmente.

Si desea especificar una ruta personalizada para la migración generada, puede usar la opción `--path` al ejecutar el comando `make:migration`. La ruta proporcionada debe ser relativa a la ruta base de su aplicación.

> **Nota:**
> Los resguardos de migración se pueden personalizar usando [stub Publishing](../artisan/#stub-customization).

<a id="squashing-migrations"></a>
### Aplastando las migraciones

A medida que crea su aplicación, puede acumular más y más migraciones con el tiempo. Esto puede hacer que su directorio `database/migrations` se llene con potencialmente cientos de migraciones. Si lo desea, puede "comprimir" sus migraciones en un único archivo SQL. Para comenzar, ejecute el comando `schema:dump`:

```shell
php artisan schema:dump

# Dump the current database schema and prune all existing migrations...
php artisan schema:dump --prune
```

Cuando ejecute este comando, Laravel escribirá un archivo de "esquema" en el directorio `database/schema` de su aplicación. El nombre del archivo de esquema corresponderá a la conexión de la base de datos. Ahora, cuando intente migrar su base de datos y no se hayan ejecutado otras migraciones, Laravel primero ejecutará las declaraciones SQL en el archivo de esquema de la conexión de base de datos que está utilizando. Después de ejecutar las declaraciones SQL del archivo de esquema, Laravel ejecutará todas las migraciones restantes que no formaron parte del volcado del esquema.

Si las pruebas de su aplicación usan una conexión de base de datos diferente a la que usa normalmente durante el desarrollo local, debe asegurarse de haber volcado un archivo de esquema usando esa conexión de base de datos para que sus pruebas puedan construir su base de datos. Es posible que desees hacer esto después de deshacerte de la conexión de base de datos que normalmente utilizas durante el desarrollo local:

```shell
php artisan schema:dump
php artisan schema:dump --database=testing --prune
```

Debe enviar el archivo de esquema de su base de datos al control de código fuente para que otros desarrolladores nuevos de su equipo puedan crear rápidamente la estructura de base de datos inicial de su aplicación.

> **Advertencia:**
> La eliminación de migraciones solo está disponible para las bases de datos MariaDB, MySQL, PostgreSQL y SQLite y utiliza el cliente de línea de comandos de la base de datos.

<a id="migration-structure"></a>
## Estructura de migración

Una clase de migración contiene dos métodos: `up` y `down`. El método `up` se utiliza para agregar nuevas tablas, columnas o índices a su base de datos, mientras que el método `down` debe revertir las operaciones realizadas por el método `up`.

Dentro de ambos métodos, puede utilizar el generador de esquemas de Laravel para crear y modificar tablas de forma expresiva. Para conocer todos los métodos disponibles en el constructor `Schema`, [consulte su documentación](#creating-tables). Por ejemplo, la siguiente migración crea una tabla `flights`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ejecutar las migraciones.
     */
    public function up(): void
    {
        Schema::create('flights', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('airline');
            $table->timestamps();
        });
    }

    /**
     * Revertir las migrations.
     */
    public function down(): void
    {
        Schema::drop('flights');
    }
};
```

<a id="setting-the-migration-connection"></a>
#### Configuración de la conexión de migración

Si su migración interactuará con una conexión de base de datos distinta a la conexión de base de datos predeterminada de su aplicación, debe configurar la propiedad `$connection` de su migración:

```php
/**
 * The database connection that should be used by the migration.
 *
 * @var string
 */
protected $connection = 'pgsql';

/**
 * Ejecutar las migraciones.
 */
public function up(): void
{
    // ...
}
```

<a id="skipping-migrations"></a>
#### Saltarse las migraciones

A veces, una migración puede estar destinada a admitir una función que aún no está activa y no desea que se ejecute todavía. En este caso, puede definir un método `shouldRun` en la migración. Si el método `shouldRun` devuelve `false`, se omitirá la migración:

```php
use App\Models\Flight;
use Laravel\Pennant\Feature;

/**
 * Determinar si se debe ejecutar esta migración.
 */
public function shouldRun(): bool
{
    return Feature::active(Flight::class);
}
```

<a id="running-migrations"></a>
## Ejecutando migraciones

Para ejecutar todas sus migraciones pendientes, ejecute el comando `migrate` Artisan:

```shell
php artisan migrate
```

Si desea ver qué migraciones ya se han ejecutado y cuáles aún están pendientes, puede utilizar el comando `migrate:status` Artisan:

```shell
php artisan migrate:status
```

Si proporciona la opción `--step` al comando `migrate`, el comando ejecutará cada migración como su propio lote, lo que le permitirá revertir migraciones individuales más adelante utilizando el comando `migrate:rollback`:

```shell
php artisan migrate --step
```

Si desea ver las declaraciones SQL que ejecutarán las migraciones sin ejecutarlas realmente, puede proporcionar el indicador `--pretend` al comando `migrate`:

```shell
php artisan migrate --pretend
```

<a id="isolating-migration-execution"></a>
#### Aislar la ejecución de la migración

Si está implementando su aplicación en varios servidores y ejecuta migraciones como parte de su proceso de implementación, probablemente no desee que dos servidores intenten migrar la base de datos al mismo tiempo. Para evitar esto, puede utilizar la opción `isolated` al invocar el comando `migrate`.

Cuando se proporciona la opción `isolated`, Laravel adquirirá un bloqueo atómico utilizando el controlador de caché de su aplicación antes de intentar ejecutar sus migraciones. Todos los demás intentos de ejecutar el comando `migrate` mientras se mantiene ese bloqueo no se ejecutarán; sin embargo, el comando seguirá saliendo con un código de estado de salida exitoso:

```shell
php artisan migrate --isolated
```

> **Advertencia:**
> Para utilizar esta función, su aplicación debe utilizar el controlador de caché `memcached`, `redis`, `dynamodb`, `database`, `file` o `array` como controlador de caché predeterminado de su aplicación. Además, todos los servidores deben comunicarse con el mismo servidor de caché central.

<a id="forcing-migrations-to-run-in-production"></a>
#### Forzar la ejecución de migraciones en producción

Algunas operaciones de migración son destructivas, lo que significa que pueden provocar la pérdida de datos. Para protegerlo de la ejecución de estos comandos en su base de datos de producción, se le pedirá confirmación antes de ejecutar los comandos. Para forzar la ejecución de los comandos sin un aviso, utilice el indicador `--force`:

```shell
php artisan migrate --force
```

<a id="rolling-back-migrations"></a>
### Revertir las migraciones

Para revertir la última operación de migración, puede utilizar el comando `rollback` Artisan. Este comando revierte el último "lote" de migraciones, que puede incluir varios archivos de migración:

```shell
php artisan migrate:rollback
```

Puede revertir un número limitado de migraciones proporcionando la opción `step` al comando `rollback`. Por ejemplo, el siguiente comando revertirá las últimas cinco migraciones:

```shell
php artisan migrate:rollback --step=5
```

Puede revertir un "lote" específico de migraciones proporcionando la opción `batch` al comando `rollback`, donde la opción `batch` corresponde a un valor de lote dentro de la tabla de base de datos `migrations` de su aplicación. Por ejemplo, el siguiente comando revertirá todas las migraciones en el lote tres:

```shell
php artisan migrate:rollback --batch=3
```

Si desea ver las declaraciones SQL que ejecutarán las migraciones sin ejecutarlas realmente, puede proporcionar el indicador `--pretend` al comando `migrate:rollback`:

```shell
php artisan migrate:rollback --pretend
```

El comando `migrate:reset` revertirá todas las migraciones de su aplicación:

```shell
php artisan migrate:reset
```

<a id="roll-back-migrate-using-a-single-command"></a>
#### Revertir y migrar usando un solo comando

El comando `migrate:refresh` revertirá todas sus migraciones y luego ejecutará el comando `migrate`. Este comando recrea efectivamente toda su base de datos:

```shell
php artisan migrate:refresh

# Refresh the database and run all database seeds...
php artisan migrate:refresh --seed
```

Puede revertir y volver a migrar un número limitado de migraciones proporcionando la opción `step` al comando `refresh`. Por ejemplo, el siguiente comando revertirá y volverá a migrar las últimas cinco migraciones:

```shell
php artisan migrate:refresh --step=5
```

<a id="drop-all-tables-migrate"></a>
#### Eliminar todas las tablas y migrar

El comando `migrate:fresh` eliminará todas las tablas de la base de datos y luego ejecutará el comando `migrate`:

```shell
php artisan migrate:fresh

php artisan migrate:fresh --seed
```

De forma predeterminada, el comando `migrate:fresh` solo elimina tablas de la conexión de base de datos predeterminada. Sin embargo, puede utilizar la opción `--database` para especificar la conexión de base de datos que se debe migrar. El nombre de la conexión de la base de datos debe corresponder a una conexión definida en el archivo `database` de su aplicación [archivo de configuración](../configuration/):

```shell
php artisan migrate:fresh --database=admin
```

> **Advertencia:**
> El comando `migrate:fresh` eliminará todas las tablas de la base de datos independientemente de su prefijo. Este comando debe usarse con precaución al desarrollar en una base de datos compartida con otras aplicaciones.

<a id="tables"></a>
## Tablas

<a id="creating-tables"></a>
### Creando tablas

Para crear una nueva tabla de base de datos, utilice el método `create` en la fachada `Schema`. El método `create` acepta dos argumentos: el primero es el nombre de la tabla, mientras que el segundo es una función anónima que recibe un objeto `Blueprint` que puede usarse para definir la nueva tabla:

```php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('email');
    $table->timestamps();
});
```

Al crear la tabla, puede utilizar cualquiera de los [métodos de columna](#creating-columns) del generador de esquemas para definir las columnas de la tabla.

<a id="determining-table-column-existence"></a>
#### Determinación de la existencia de tablas/columnas

Puede determinar la existencia de una tabla, columna o índice utilizando los métodos `hasTable`, `hasColumn` y `hasIndex`:

```php
if (Schema::hasTable('users')) {
    // The "users" table exists...
}

if (Schema::hasColumn('users', 'email')) {
    // The "users" table exists and has an "email" column...
}

if (Schema::hasIndex('users', ['email'], 'unique')) {
    // The "users" table exists and has a unique index on the "email" column...
}
```

<a id="database-connection-table-options"></a>
#### Conexión de base de datos y opciones de tabla

Si desea realizar una operación de esquema en una conexión de base de datos que no es la conexión predeterminada de su aplicación, utilice el método `connection`:

```php
Schema::connection('sqlite')->create('users', function (Blueprint $table) {
    $table->id();
});
```

Además, se pueden utilizar algunas otras propiedades y métodos para definir otros aspectos de la creación de la tabla. La propiedad `engine` se puede usar para especificar el motor de almacenamiento de la tabla cuando se usa MariaDB o MySQL:

```php
Schema::create('users', function (Blueprint $table) {
    $table->engine('InnoDB');

    // ...
});
```

Las propiedades `charset` y `collation` se pueden usar para especificar el juego de caracteres y la intercalación de la tabla creada cuando se usa MariaDB o MySQL:

```php
Schema::create('users', function (Blueprint $table) {
    $table->charset('utf8mb4');
    $table->collation('utf8mb4_unicode_ci');

    // ...
});
```

Se puede utilizar el método `temporary` para indicar que la tabla debe ser "temporal". Las tablas temporales solo son visibles para la sesión de base de datos de la conexión actual y se eliminan automáticamente cuando se cierra la conexión:

```php
Schema::create('calculations', function (Blueprint $table) {
    $table->temporary();

    // ...
});
```

Si desea agregar un "comentario" a una tabla de base de datos, puede invocar el método `comment` en la instancia de la tabla. Actualmente, los comentarios de tabla solo son compatibles con MariaDB, MySQL y PostgreSQL:

```php
Schema::create('calculations', function (Blueprint $table) {
    $table->comment('Business calculations');

    // ...
});
```

<a id="updating-tables"></a>
### Actualizando tablas

El método `table` en la fachada `Schema` se puede utilizar para actualizar tablas existentes. Al igual que el método `create`, el método `table` acepta dos argumentos: el nombre de la tabla y una función anónima que recibe una instancia de `Blueprint` que puede usar para agregar columnas o índices a la tabla:

```php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('users', function (Blueprint $table) {
    $table->integer('votes');
});
```

<a id="renaming-and-dropping-tables"></a>
### Cambiar nombre/eliminar tablas

Para cambiar el nombre de una tabla de base de datos existente, utilice el método `rename`:

```php
use Illuminate\Support\Facades\Schema;

Schema::rename($from, $to);
```

Para eliminar una tabla existente, puede utilizar los métodos `drop` o `dropIfExists`:

```php
Schema::drop('users');

Schema::dropIfExists('users');
```

<a id="renaming-tables-with-foreign-keys"></a>
#### Cambiar el nombre de tablas con claves externas

Antes de cambiar el nombre de una tabla, debe verificar que cualquier restricción de clave externa en la tabla tenga un nombre explícito en sus archivos de migración en lugar de permitir que Laravel asigne un nombre basado en convenciones. De lo contrario, el nombre de la restricción de clave externa hará referencia al nombre de la tabla anterior.

<a id="columns"></a>
## Columnas

<a id="creating-columns"></a>
### Creando columnas

El método `table` en la fachada `Schema` se puede utilizar para actualizar tablas existentes. Al igual que el método `create`, el método `table` acepta dos argumentos: el nombre de la tabla y una función anónima que recibe una instancia de `Illuminate\Database\Schema\Blueprint` que puede usar para agregar columnas a la tabla:

```php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('users', function (Blueprint $table) {
    $table->integer('votes');
});
```

<a id="available-column-types"></a>
### Tipos de columnas disponibles

El modelo del generador de esquemas ofrece una variedad de métodos que corresponden a los diferentes tipos de columnas que puede agregar a las tablas de su base de datos. Cada uno de los métodos disponibles se enumeran en la siguiente tabla:

<style>
    .collection-method-list > p {
        columns: 10.8em 3; -moz-columns: 10.8em 3; -webkit-columns: 10.8em 3;
    }

    .collection-method-list a {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .collection-method code {
        font-size: 14px;
    }

    .collection-method:not(.first-collection-method) {
        margin-top: 50px;
    }
</style>

<a id="booleans-method-list"></a>
#### Tipos booleanos

<div class="collection-method-list" markdown="1">

[booleano](#column-method-boolean)

</div>

<a id="strings-and-texts-method-list"></a>
#### Tipos de cadenas y texto

<div class="collection-method-list" markdown="1">

[char](#column-method-char)
[textolargo](#column-method-longText)
[textomedio](#column-method-mediumText)
[cadena](#column-method-string)
[texto](#column-method-text)
[tinyText](#column-method-tinyText)

</div>

<a id="numbers--method-list"></a>
#### Tipos numéricos

<div class="collection-method-list" markdown="1">

[grandesIncrementos](#column-method-bigIncrements)
[granInteger](#column-method-bigInteger)
[decimal](#column-method-decimal)
[doble](#column-method-double)
[float](#column-method-float)
[id](#column-method-id)
[incrementos](#column-method-increments)
[entero](#column-method-integer)
[incrementosmedios](#column-method-mediumIncrements)
[medioInteger](#column-method-mediumInteger)
[pequeños incrementos](#column-method-smallIncrements)
[pequeñoInteger](#column-method-smallInteger)
[tinyIncrements](#column-method-tinyIncrements)
[tinyInteger](#column-method-tinyInteger)
[sin firmarBigInteger](#column-method-unsignedBigInteger)
[entero sin firmar](#column-method-unsignedInteger)
[unsignedMediumInteger](#column-method-unsignedMediumInteger)
[unsignedSmallInteger](#column-method-unsignedSmallInteger)
[sin firmarTinyInteger](#column-method-unsignedTinyInteger)

</div>

<a id="dates-and-times-method-list"></a>
#### Tipos de fecha y hora

<div class="collection-method-list" markdown="1">

[fechaHora](#column-method-dateTime)
[fechaHoraTz](#column-method-dateTimeTz)
[fecha](#column-method-date)
[hora](#column-method-time)
[horaTz](#column-method-timeTz)
[marca de tiempo](#column-method-timestamp)
[marcas de tiempo](#column-method-timestamps)
[marcas de tiempoTz](#column-method-timestampsTz)
[softDeletes](#column-method-softDeletes)
[softDeletesTz](#column-method-softDeletesTz)
[año](#column-method-year)

</div>

<a id="binaries-method-list"></a>
#### Tipos binarios

<div class="collection-method-list" markdown="1">

[binario](#column-method-binary)

</div>

<a id="object-and-jsons-method-list"></a>
#### Tipos de objetos y Json

<div class="collection-method-list" markdown="1">

[json](#column-method-json)
[jsonb](#column-method-jsonb)

</div>

<a id="uuids-and-ulids-method-list"></a>
#### Tipos de UUID y ULID

<div class="collection-method-list" markdown="1">

[ulid](#column-method-ulid)
[ulidMorphs](#column-method-ulidMorphs)
[uuid](#column-method-uuid)
[uuidMorphs](#column-method-uuidMorphs)
[nullableUlidMorphs](#column-method-nullableUlidMorphs)
[nullableUuidMorphs](#column-method-nullableUuidMorphs)

</div>

<a id="spatials-method-list"></a>
#### Tipos espaciales

<div class="collection-method-list" markdown="1">

[geografía](#column-method-geography)
[geometría](#column-method-geometry)

</div>

<a id="relationship-method-list"></a>
#### Tipos de relación

<div class="collection-method-list" markdown="1">

[extranjeroId](#column-method-foreignId)
[identificador extranjeroFor](#column-method-foreignIdFor)
[extranjeroUlid](#column-method-foreignUlid)
[extranjeroUuid](#column-method-foreignUuid)
[extranjeroUuidFor](#column-method-foreignUuidFor)
[morfos](#column-method-morphs)
[nullableMorphs](#column-method-nullableMorphs)

</div>

<a id="specifics-method-list"></a>
#### Tipos de especialidad

<div class="collection-method-list" markdown="1">

[enum](#column-method-enum)
[set](#column-method-set)
[direcciónmac](#column-method-macAddress)
[direcciónip](#column-method-ipAddress)
[recuerdeToken](#column-method-rememberToken)
[vector](#column-method-vector)

</div>

<a id="column-method-bigIncrements"></a>
#### `bigIncrements()` {.método-colección .método-primera-colección}

El método `bigIncrements` crea una columna equivalente `UNSIGNED BIGINT` (clave principal) de incremento automático:

```php
$table->bigIncrements('id');
```

<a id="column-method-bigInteger"></a>
#### `bigInteger()` {.método-colección}

El método `bigInteger` crea una columna equivalente a `BIGINT`:

```php
$table->bigInteger('votes');
```

<a id="column-method-binary"></a>
#### `binary()` {.método-colección}

El método `binary` crea una columna equivalente a `BLOB`:

```php
$table->binary('photo');
```

Al utilizar MySQL, MariaDB o SQL Server, puede pasar los argumentos `length` y `fixed` para crear la columna equivalente `VARBINARY` o `BINARY`:

```php
$table->binary('data', length: 16); // VARBINARY(16)

$table->binary('data', length: 16, fixed: true); // BINARY(16)
```

<a id="column-method-boolean"></a>
#### `boolean()` {.método-colección}

El método `boolean` crea una columna equivalente a `BOOLEAN`:

```php
$table->boolean('confirmed');
```

<a id="column-method-char"></a>
#### `char()` {.método-colección}

El método `char` crea una columna equivalente a `CHAR` con una longitud determinada:

```php
$table->char('name', length: 100);
```

<a id="column-method-dateTimeTz"></a>
#### `dateTimeTz()` {.método-colección}

El método `dateTimeTz` crea una columna equivalente a `DATETIME` (con zona horaria) con una precisión de fracciones de segundo opcional:

```php
$table->dateTimeTz('created_at', precision: 0);
```

<a id="column-method-dateTime"></a>
#### `dateTime()` {.método-colección}

El método `dateTime` crea una columna equivalente a `DATETIME` con una precisión de fracciones de segundo opcional:

```php
$table->dateTime('created_at', precision: 0);
```

<a id="column-method-date"></a>
#### `date()` {.método-colección}

El método `date` crea una columna equivalente a `DATE`:

```php
$table->date('created_at');
```

<a id="column-method-decimal"></a>
#### `decimal()` {.método-colección}

El método `decimal` crea una columna equivalente a `DECIMAL` con la precisión (dígitos totales) y la escala (dígitos decimales) dadas:

```php
$table->decimal('amount', total: 8, places: 2);
```

<a id="column-method-double"></a>
#### `double()` {.método-colección}

El método `double` crea una columna equivalente a `DOUBLE`:

```php
$table->double('amount');
```

<a id="column-method-enum"></a>
#### `enum()` {.método-colección}

El método `enum` crea una columna equivalente `ENUM` con los valores válidos dados:

```php
$table->enum('difficulty', ['easy', 'hard']);
```

Por supuesto, puedes usar el método `Enum::cases()` en lugar de definir manualmente una matriz de valores permitidos:

```php
use App\Enums\Difficulty;

$table->enum('difficulty', Difficulty::cases());
```

<a id="column-method-float"></a>
#### `float()` {.método-colección}

El método `float` crea una columna equivalente a `FLOAT` con la precisión dada:

```php
$table->float('amount', precision: 53);
```

<a id="column-method-foreignId"></a>
#### `foreignId()` {.método-colección}

El método `foreignId` crea una columna equivalente a `UNSIGNED BIGINT`:

```php
$table->foreignId('user_id');
```

<a id="column-method-foreignIdFor"></a>
#### `foreignIdFor()` {.método-colección}

El método `foreignIdFor` agrega una columna equivalente `{column}_id` para una clase de modelo determinada. El tipo de columna será `UNSIGNED BIGINT`, `CHAR(36)` o `CHAR(26)` según el tipo de clave del modelo:

```php
$table->foreignIdFor(User::class);
```

<a id="column-method-foreignUlid"></a>
#### `foreignUlid()` {.método-colección}

El método `foreignUlid` crea una columna equivalente a `ULID`:

```php
$table->foreignUlid('user_id');
```

<a id="column-method-foreignUuid"></a>
#### `foreignUuid()` {.método-colección}

El método `foreignUuid` crea una columna equivalente a `UUID`:

```php
$table->foreignUuid('user_id');
```

<a id="column-method-foreignUuidFor"></a>
#### `foreignUuidFor()` {.método-colección}

El método `foreignUuidFor` agrega una columna equivalente a UUID `{column}_id` para una clase de modelo determinada:

```php
$table->foreignUuidFor(User::class);
```

<a id="column-method-geography"></a>
#### `geography()` {.método-colección}

El método `geography` crea una columna equivalente a `GEOGRAPHY` con el tipo espacial y SRID (Identificador del sistema de referencia espacial) dados:

```php
$table->geography('coordinates', subtype: 'point', srid: 4326);
```

> **Nota:**
> La compatibilidad con tipos espaciales depende del controlador de su base de datos. Consulte la documentación de su base de datos. Si su aplicación utiliza una base de datos PostgreSQL, debe instalar la extensión [PostGIS](https://postgis.net) antes de poder utilizar el método `geography`.

<a id="column-method-geometry"></a>
#### `geometry()` {.método-colección}

El método `geometry` crea una columna equivalente a `GEOMETRY` con el tipo espacial y SRID (Identificador del sistema de referencia espacial) dados:

```php
$table->geometry('positions', subtype: 'point', srid: 0);
```

> **Nota:**
> La compatibilidad con tipos espaciales depende del controlador de su base de datos. Consulte la documentación de su base de datos. Si su aplicación utiliza una base de datos PostgreSQL, debe instalar la extensión [PostGIS](https://postgis.net) antes de poder utilizar el método `geometry`.

<a id="column-method-id"></a>
#### `id()` {.método-colección}

El método `id` es un alias del método `bigIncrements`. De forma predeterminada, el método creará una columna `id`; sin embargo, puede pasar un nombre de columna si desea asignar un nombre diferente a la columna:

```php
$table->id();
```

<a id="column-method-increments"></a>
#### `increments()` {.método-colección}

El método `increments` crea una columna equivalente a `UNSIGNED INTEGER` de incremento automático como clave principal:

```php
$table->increments('id');
```

<a id="column-method-integer"></a>
#### `integer()` {.método-colección}

El método `integer` crea una columna equivalente a `INTEGER`:

```php
$table->integer('votes');
```

<a id="column-method-ipAddress"></a>
#### `ipAddress()` {.método-colección}

El método `ipAddress` crea una columna equivalente a `VARCHAR`:

```php
$table->ipAddress('visitor');
```

Cuando se utiliza PostgreSQL, se creará una columna `INET`.

<a id="column-method-json"></a>
#### `json()` {.método-colección}

El método `json` crea una columna equivalente a `JSON`:

```php
$table->json('options');
```

Al utilizar SQLite, se creará una columna `TEXT`.

<a id="column-method-jsonb"></a>
#### `jsonb()` {.método-colección}

El método `jsonb` crea una columna equivalente a `JSONB`:

```php
$table->jsonb('options');
```

Al utilizar SQLite, se creará una columna `TEXT`.

<a id="column-method-longText"></a>
#### `longText()` {.método-colección}

El método `longText` crea una columna equivalente a `LONGTEXT`:

```php
$table->longText('description');
```

Al utilizar MySQL o MariaDB, puede aplicar un juego de caracteres `binary` a la columna para crear una columna equivalente a `LONGBLOB`:

```php
$table->longText('data')->charset('binary'); // LONGBLOB
```

<a id="column-method-macAddress"></a>
#### `macAddress()` {.método-colección}

El método `macAddress` crea una columna destinada a contener una dirección MAC. Algunos sistemas de bases de datos, como PostgreSQL, tienen un tipo de columna dedicada para este tipo de datos. Otros sistemas de bases de datos utilizarán una columna equivalente a una cadena:

```php
$table->macAddress('device');
```

<a id="column-method-mediumIncrements"></a>
#### `mediumIncrements()` {.método-colección}

El método `mediumIncrements` crea una columna equivalente a `UNSIGNED MEDIUMINT` de incremento automático como clave principal:

```php
$table->mediumIncrements('id');
```

<a id="column-method-mediumInteger"></a>
#### `mediumInteger()` {.método-colección}

El método `mediumInteger` crea una columna equivalente a `MEDIUMINT`:

```php
$table->mediumInteger('votes');
```

<a id="column-method-mediumText"></a>
#### `mediumText()` {.método-colección}

El método `mediumText` crea una columna equivalente a `MEDIUMTEXT`:

```php
$table->mediumText('description');
```

Al utilizar MySQL o MariaDB, puede aplicar un juego de caracteres `binary` a la columna para crear una columna equivalente a `MEDIUMBLOB`:

```php
$table->mediumText('data')->charset('binary'); // MEDIUMBLOB
```

<a id="column-method-morphs"></a>
#### `morphs()` {.método-colección}

El método `morphs` es un método conveniente que agrega una columna equivalente `{column}_type` `VARCHAR` y una columna equivalente `{column}_id`. El tipo de columna para `{column}_id` será `UNSIGNED BIGINT`, `CHAR(36)` o `CHAR(26)` según el tipo de clave del modelo.

Este método está destinado a utilizarse al definir las columnas necesarias para una [Relación Eloquent](../eloquent-relationships/). En el siguiente ejemplo, se crearían las columnas `taggable_type` y `taggable_id`:

```php
$table->morphs('taggable');
```

<a id="column-method-nullableMorphs"></a>
#### `nullableMorphs()` {.método-colección}

El método es similar al método [morphs](#column-method-morphs); sin embargo, las columnas que se crean serán "nullable":

```php
$table->nullableMorphs('taggable');
```

<a id="column-method-nullableUlidMorphs"></a>
#### `nullableUlidMorphs()` {.método-colección}

El método es similar al método [ulidMorphs](#column-method-ulidMorphs); sin embargo, las columnas que se crean serán "nullable":

```php
$table->nullableUlidMorphs('taggable');
```

<a id="column-method-nullableUuidMorphs"></a>
#### `nullableUuidMorphs()` {.método-colección}

El método es similar al método [uuidMorphs](#column-method-uuidMorphs); sin embargo, las columnas que se crean serán "nullable":

```php
$table->nullableUuidMorphs('taggable');
```

<a id="column-method-rememberToken"></a>
#### `rememberToken()` {.método-colección}

El método `rememberToken` crea una columna equivalente a `VARCHAR(100)` que admite valores NULL y está destinada a almacenar el token de autenticación actual "recordarme" [token](../authentication/#remembering-users):

```php
$table->rememberToken();
```

<a id="column-method-set"></a>
#### `set()` {.método-colección}

El método `set` crea una columna equivalente `SET` con la lista dada de valores válidos:

```php
$table->set('flavors', ['strawberry', 'vanilla']);
```

<a id="column-method-smallIncrements"></a>
#### `smallIncrements()` {.método-colección}

El método `smallIncrements` crea una columna equivalente a `UNSIGNED SMALLINT` de incremento automático como clave principal:

```php
$table->smallIncrements('id');
```

<a id="column-method-smallInteger"></a>
#### `smallInteger()` {.método-colección}

El método `smallInteger` crea una columna equivalente a `SMALLINT`:

```php
$table->smallInteger('votes');
```

<a id="column-method-softDeletesTz"></a>
#### `softDeletesTz()` {.método-colección}

El método `softDeletesTz` agrega una columna equivalente a valores anulables `deleted_at` `TIMESTAMP` (con zona horaria) con una precisión de fracciones de segundo opcional. Esta columna está destinada a almacenar la marca de tiempo `deleted_at` necesaria para la funcionalidad de "eliminación temporal" de Eloquent:

```php
$table->softDeletesTz('deleted_at', precision: 0);
```

<a id="column-method-softDeletes"></a>
#### `softDeletes()` {.método-colección}

El método `softDeletes` agrega una columna equivalente a `deleted_at` `TIMESTAMP` que acepta valores NULL con una precisión opcional de fracciones de segundo. Esta columna está destinada a almacenar la marca de tiempo `deleted_at` necesaria para la funcionalidad de "eliminación temporal" de Eloquent:

```php
$table->softDeletes('deleted_at', precision: 0);
```

<a id="column-method-string"></a>
#### `string()` {.método-colección}

El método `string` crea una columna equivalente a `VARCHAR` de la longitud dada:

```php
$table->string('name', length: 100);
```

<a id="column-method-text"></a>
#### `text()` {.método-colección}

El método `text` crea una columna equivalente a `TEXT`:

```php
$table->text('description');
```

Al utilizar MySQL o MariaDB, puede aplicar un juego de caracteres `binary` a la columna para crear una columna equivalente a `BLOB`:

```php
$table->text('data')->charset('binary'); // BLOB
```

<a id="column-method-timeTz"></a>
#### `timeTz()` {.método-colección}

El método `timeTz` crea una columna equivalente a `TIME` (con zona horaria) con una precisión de fracciones de segundo opcional:

```php
$table->timeTz('sunrise', precision: 0);
```

<a id="column-method-time"></a>
#### `time()` {.método-colección}

El método `time` crea una columna equivalente a `TIME` con una precisión de fracciones de segundo opcional:

```php
$table->time('sunrise', precision: 0);
```

<a id="column-method-timestampTz"></a>
#### `timestampTz()` {.método-colección}

El método `timestampTz` crea una columna equivalente a `TIMESTAMP` (con zona horaria) con una precisión de fracciones de segundo opcional:

```php
$table->timestampTz('added_at', precision: 0);
```

<a id="column-method-timestamp"></a>
#### `timestamp()` {.método-colección}

El método `timestamp` crea una columna equivalente a `TIMESTAMP` con una precisión de fracciones de segundo opcional:

```php
$table->timestamp('added_at', precision: 0);
```

<a id="column-method-timestampsTz"></a>
#### `timestampsTz()` {.método-colección}

El método `timestampsTz` crea columnas equivalentes `created_at` y `updated_at` `TIMESTAMP` (con zona horaria) con una precisión de fracciones de segundo opcional:

```php
$table->timestampsTz(precision: 0);
```

<a id="column-method-timestamps"></a>
#### `timestamps()` {.método-colección}

El método `timestamps` crea columnas equivalentes `created_at` y `updated_at` `TIMESTAMP` con una precisión de fracciones de segundo opcional:

```php
$table->timestamps(precision: 0);
```

<a id="column-method-tinyIncrements"></a>
#### `tinyIncrements()` {.método-colección}

El método `tinyIncrements` crea una columna equivalente a `UNSIGNED TINYINT` de incremento automático como clave principal:

```php
$table->tinyIncrements('id');
```

<a id="column-method-tinyInteger"></a>
#### `tinyInteger()` {.método-colección}

El método `tinyInteger` crea una columna equivalente a `TINYINT`:

```php
$table->tinyInteger('votes');
```

<a id="column-method-tinyText"></a>
#### `tinyText()` {.método-colección}

El método `tinyText` crea una columna equivalente a `TINYTEXT`:

```php
$table->tinyText('notes');
```

Al utilizar MySQL o MariaDB, puede aplicar un juego de caracteres `binary` a la columna para crear una columna equivalente a `TINYBLOB`:

```php
$table->tinyText('data')->charset('binary'); // TINYBLOB
```

<a id="column-method-unsignedBigInteger"></a>
#### `unsignedBigInteger()` {.método-colección}

El método `unsignedBigInteger` crea una columna equivalente a `UNSIGNED BIGINT`:

```php
$table->unsignedBigInteger('votes');
```

<a id="column-method-unsignedInteger"></a>
#### `unsignedInteger()` {.método-colección}

El método `unsignedInteger` crea una columna equivalente a `UNSIGNED INTEGER`:

```php
$table->unsignedInteger('votes');
```

<a id="column-method-unsignedMediumInteger"></a>
#### `unsignedMediumInteger()` {.método-colección}

El método `unsignedMediumInteger` crea una columna equivalente a `UNSIGNED MEDIUMINT`:

```php
$table->unsignedMediumInteger('votes');
```

<a id="column-method-unsignedSmallInteger"></a>
#### `unsignedSmallInteger()` {.método-colección}

El método `unsignedSmallInteger` crea una columna equivalente a `UNSIGNED SMALLINT`:

```php
$table->unsignedSmallInteger('votes');
```

<a id="column-method-unsignedTinyInteger"></a>
#### `unsignedTinyInteger()` {.método-colección}

El método `unsignedTinyInteger` crea una columna equivalente a `UNSIGNED TINYINT`:

```php
$table->unsignedTinyInteger('votes');
```

<a id="column-method-ulidMorphs"></a>
#### `ulidMorphs()` {.método-colección}

El método `ulidMorphs` es un método conveniente que agrega una columna equivalente `{column}_type` `VARCHAR` y una columna equivalente `{column}_id` `CHAR(26)`.

Este método está destinado a utilizarse al definir las columnas necesarias para una [Relación Eloquent](../eloquent-relationships/) polimórfica que utiliza identificadores ULID. En el siguiente ejemplo, se crearían las columnas `taggable_type` y `taggable_id`:

```php
$table->ulidMorphs('taggable');
```

<a id="column-method-uuidMorphs"></a>
#### `uuidMorphs()` {.método-colección}

El método `uuidMorphs` es un método conveniente que agrega una columna equivalente `{column}_type` `VARCHAR` y una columna equivalente `{column}_id` `CHAR(36)`.

Este método está destinado a utilizarse al definir las columnas necesarias para una [relación Eloquent polimórfica](../eloquent-relationships/#polymorphic-relationships) que utiliza identificadores UUID. En el siguiente ejemplo, se crearían las columnas `taggable_type` y `taggable_id`:

```php
$table->uuidMorphs('taggable');
```

<a id="column-method-ulid"></a>
#### `ulid()` {.método-colección}

El método `ulid` crea una columna equivalente a `ULID`:

```php
$table->ulid('id');
```

<a id="column-method-uuid"></a>
#### `uuid()` {.método-colección}

El método `uuid` crea una columna equivalente a `UUID`:

```php
$table->uuid('id');
```

<a id="column-method-vector"></a>
#### `vector()` {.método-colección}

El método `vector` crea una columna equivalente a `vector`:

```php
$table->vector('embedding', dimensions: 1536);
```

Las columnas vectoriales se admiten en conexiones PostgreSQL utilizando la extensión `pgvector` y MariaDB 11.7 o posterior. Cuando se utiliza PostgreSQL, se debe cargar `pgvector` antes de poder crear las columnas `vector`:

```php
Schema::ensureVectorExtensionExists();
```

Para acelerar [consultas de similitud de vectores](../queries/#vector-similarity-clauses), puede agregar un índice de vector a la columna. Llamar al método `index` en una columna `vector` crea un índice vectorial usando la distancia del coseno:

```php
$table->vector('embedding', dimensions: 1536)->index();
```

<a id="column-method-year"></a>
#### `year()` {.método-colección}

El método `year` crea una columna equivalente a `YEAR`:

```php
$table->year('birth_year');
```

<a id="column-modifiers"></a>
### Modificadores de columna

Además de los tipos de columnas enumerados anteriormente, existen varios "modificadores" de columnas que puede utilizar al agregar una columna a una tabla de base de datos. Por ejemplo, para hacer que la columna sea "anulable", puede utilizar el método `nullable`:

```php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('users', function (Blueprint $table) {
    $table->string('email')->nullable();
});
```

La siguiente tabla contiene todos los modificadores de columna disponibles. Esta lista no incluye [modificadores de índice](#creating-indexes):

<div class="overflow-auto">

| Modificador | Descripción |
| ----------------------------------- | ---------------------------------------------------------------------------------------------- |
| `->after('column')` | Coloque la columna "después" de otra columna (MariaDB/MySQL).                                     |
| `->autoIncrement()` | Establezca las columnas `INTEGER` como de incremento automático (clave principal).                                      |
| `->charset('utf8mb4')` | Especifique un juego de caracteres para la columna (MariaDB/MySQL).                                      |
| `->collation('utf8mb4_unicode_ci')` | Especifique una intercalación para la columna.                                                            |
| `->comment('my comment')` | Agregar un comentario a una columna (MariaDB/MySQL/PostgreSQL).                                      |
| `->default($value)` | Especifique un valor "predeterminado" para la columna.                                                      |
| `->first()` | Coloque la columna "primera" en la tabla (MariaDB/MySQL).                                       |
| `->from($integer)` | Establezca el valor inicial de un campo de incremento automático (MariaDB/MySQL/PostgreSQL).           |
| `->instant()` | Agregue o modifique la columna mediante una operación instantánea (MySQL).                                   |
| `->invisible()` | Haga que la columna sea "invisible" para las consultas `SELECT *` (MariaDB/MySQL).                           |
| `->lock($mode)` | Especifique un modo de bloqueo para la operación de columna (MySQL).                                          |
| `->nullable($value = true)` | Permita que los valores `NULL` se inserten en la columna.                                            |
| `->storedAs($expression)` | Cree una columna generada almacenada (MariaDB/MySQL/PostgreSQL/SQLite).                      |
| `->unsigned()` | Establezca las columnas `INTEGER` como `UNSIGNED` (MariaDB/MySQL).                                         |
| `->using($expression)` | Especifique una expresión de conversión al cambiar el tipo de columna (PostgreSQL).                       |
| `->useCurrent()` | Configure las columnas `TIMESTAMP` para usar `CURRENT_TIMESTAMP` como valor predeterminado.                           |
| `->useCurrentOnUpdate()` | Configure las columnas `TIMESTAMP` para usar `CURRENT_TIMESTAMP` cuando se actualice un registro (MariaDB/MySQL). |
| `->virtualAs($expression)` | Cree una columna virtual generada (MariaDB/MySQL/SQLite).                                  |
| `->generatedAs($expression)` | Cree una columna de identidad con opciones de secuencia especificadas (PostgreSQL).                        |
| `->always()` | Define la precedencia de los valores de secuencia sobre la entrada de una columna de identidad (PostgreSQL).      |

</div>

<a id="default-expressions"></a>
#### Expresiones predeterminadas

El modificador `default` acepta un valor o una instancia de `Illuminate\Database\Query\Expression`. El uso de una instancia `Expression` evitará que Laravel incluya el valor entre comillas y le permitirá utilizar funciones específicas de la base de datos. Una situación en la que esto resulta particularmente útil es cuando necesita asignar valores predeterminados a columnas JSON:

```php
<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Query\Expression;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Ejecutar las migraciones.
     */
    public function up(): void
    {
        Schema::create('flights', function (Blueprint $table) {
            $table->id();
            $table->json('movies')->default(new Expression('(JSON_ARRAY())'));
            $table->timestamps();
        });
    }
};
```

> **Advertencia:**
> La compatibilidad con expresiones predeterminadas depende del controlador de la base de datos, la versión de la base de datos y el tipo de campo. Consulte la documentación de su base de datos.

<a id="column-order"></a>
#### Orden de columnas

Cuando se utiliza la base de datos MariaDB o MySQL, se puede utilizar el método `after` para agregar columnas después de una columna existente en el esquema:

```php
$table->after('password', function (Blueprint $table) {
    $table->string('address_line1');
    $table->string('address_line2');
    $table->string('city');
});
```

<a id="instant-column-operations"></a>
#### Operaciones de columna instantáneas

Cuando utilice MySQL, puede encadenar el modificador `instant` en una definición de columna para indicar que la columna debe agregarse o modificarse utilizando el algoritmo "instantáneo" de MySQL. Este algoritmo permite realizar ciertos cambios de esquema sin una reconstrucción completa de la tabla, lo que los hace casi instantáneos independientemente del tamaño de la tabla:

```php
$table->string('name')->nullable()->instant();
```

Las adiciones instantáneas de columnas solo pueden agregar columnas al final de la tabla, por lo que el modificador `instant` no se puede combinar con los modificadores `after` o `first`. Además, el algoritmo no admite todos los tipos de columnas u operaciones. Si la operación solicitada es incompatible, MySQL generará un error.

Consulte la [documentación de MySQL](https://dev.mysql.com/doc/refman/8.0/en/innodb-online-ddl-operations.html) para determinar qué operaciones son compatibles con modificaciones instantáneas de columnas.

<a id="ddl-locking"></a>
#### Bloqueo DDL

Cuando utilice MySQL, puede encadenar el modificador `lock` en definiciones de columna, índice o clave externa para controlar el bloqueo de la tabla durante las operaciones del esquema. MySQL admite varios modos de bloqueo: `none` permite lecturas y escrituras simultáneas, `shared` permite lecturas simultáneas pero bloquea escrituras, `exclusive` bloquea todos los accesos simultáneos y `default` permite a MySQL elegir el modo más apropiado:

```php
$table->string('name')->lock('none');

$table->index('email')->lock('shared');
```

Si el modo de bloqueo solicitado es incompatible con la operación, MySQL generará un error. El modificador `lock` se puede combinar con el modificador `instant` para optimizar aún más los cambios de esquema:

```php
$table->string('name')->instant()->lock('none');
```

<a id="modifying-columns"></a>
### Modificando columnas

El método `change` le permite modificar el tipo y los atributos de las columnas existentes. Por ejemplo, es posible que desee aumentar el tamaño de una columna `string`. Para ver el método `change` en acción, aumentemos el tamaño de la columna `name` de 25 a 50. Para lograr esto, simplemente definimos el nuevo estado de la columna y luego llamamos al método `change`:

```php
Schema::table('users', function (Blueprint $table) {
    $table->string('name', 50)->change();
});
```

Al modificar una columna, debe incluir explícitamente todos los modificadores que desea mantener en la definición de la columna; cualquier atributo que falte se eliminará. Por ejemplo, para conservar los atributos `unsigned`, `default` y `comment`, debe llamar explícitamente a cada modificador al cambiar la columna:

```php
Schema::table('users', function (Blueprint $table) {
    $table->integer('votes')->unsigned()->default(1)->comment('my comment')->change();
});
```

El método `change` no cambia los índices de la columna. Por lo tanto, puede utilizar modificadores de índice para agregar o eliminar explícitamente un índice al modificar la columna:

```php
// Añadir un índice...
$table->bigIncrements('id')->primary()->change();

// Eliminar un índice...
$table->char('postal_code', 10)->unique(false)->change();
```

<a id="postgresql-column-modifications"></a>
#### Modificaciones de columnas de PostgreSQL

Al cambiar el tipo de columna en PostgreSQL, puede usar el modificador `using` para especificar la expresión utilizada para convertir los valores existentes:

```php
Schema::table('users', function (Blueprint $table) {
    $table->date('birthday')->using('birthday::date')->change();
});
```

<a id="renaming-columns"></a>
### Cambiar el nombre de las columnas

Para cambiar el nombre de una columna, puede utilizar el método `renameColumn` proporcionado por el generador de esquemas:

```php
Schema::table('users', function (Blueprint $table) {
    $table->renameColumn('from', 'to');
});
```

<a id="dropping-columns"></a>
### Dejar caer columnas

Para eliminar una columna, puede utilizar el método `dropColumn` en el generador de esquemas:

```php
Schema::table('users', function (Blueprint $table) {
    $table->dropColumn('votes');
});
```

Puede eliminar varias columnas de una tabla pasando una matriz de nombres de columnas al método `dropColumn`:

```php
Schema::table('users', function (Blueprint $table) {
    $table->dropColumn(['votes', 'avatar', 'location']);
});
```

<a id="available-command-aliases"></a>
#### Alias de comando disponibles

Laravel proporciona varios métodos convenientes relacionados con la eliminación de tipos comunes de columnas. Cada uno de estos métodos se describe en la siguiente tabla:

<div class="overflow-auto">

| Comando | Descripción |
| ----------------------------------- | ----------------------------------------------- |
| `$table->dropMorphs('morphable');` | Elimine las columnas `morphable_type` y `morphable_id`. |
| `$table->dropRememberToken();` | Suelte la columna `remember_token`.                     |
| `$table->dropSoftDeletes();` | Suelte la columna `deleted_at`.                         |
| `$table->dropSoftDeletesTz();` | Alias ​​del método `dropSoftDeletes()`.                  |
| `$table->dropTimestamps();` | Elimine las columnas `created_at` y `updated_at`.       |
| `$table->dropTimestampsTz();` | Alias ​​del método `dropTimestamps()`.                   |

</div>

<a id="indexes"></a>
## Índices

<a id="creating-indexes"></a>
### Creando índices

El generador de esquemas de Laravel admite varios tipos de índices. El siguiente ejemplo crea una nueva columna `email` y especifica que sus valores deben ser únicos. Para crear el índice, podemos encadenar el método `unique` en la definición de la columna:

```php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('users', function (Blueprint $table) {
    $table->string('email')->unique();
});
```

Alternativamente, puede crear el índice después de definir la columna. Para hacerlo, debe llamar al método `unique` en el plano del generador de esquemas. Este método acepta el nombre de la columna que debería recibir un índice único:

```php
$table->unique('email');
```

Incluso puedes pasar una matriz de columnas a un método de índice para crear un índice compuesto (o compuesto):

```php
$table->index(['account_id', 'created_at']);
```

Al crear un índice, Laravel generará automáticamente un nombre de índice basado en la tabla, los nombres de las columnas y el tipo de índice, pero puedes pasar un segundo argumento al método para especificar el nombre del índice tú mismo:

```php
$table->unique('email', 'unique_email');
```

<a id="available-index-types"></a>
#### Tipos de índice disponibles

La clase de modelo del generador de esquemas de Laravel proporciona métodos para crear cada tipo de índice admitido por Laravel. Cada método de índice acepta un segundo argumento opcional para especificar el nombre del índice. Si se omite, el nombre se derivará de los nombres de la tabla y las columnas utilizadas para el índice, así como del tipo de índice. Cada uno de los métodos de índice disponibles se describe en la siguiente tabla:

<div class="overflow-auto">

| Comando | Descripción |
| ------------------------------------------------ | -------------------------------------------------------------- |
| `$table->primary('id');` | Agrega una clave principal.                                            |
| `$table->primary(['id', 'parent_id']);` | Agrega claves compuestas.                                           |
| `$table->unique('email');` | Agrega un índice único.                                           |
| `$table->index('state');` | Agrega un índice.                                                 |
| `$table->fullText('body');` | Agrega un índice de texto completo (MariaDB/MySQL/PostgreSQL).         |
| `$table->fullText('body')->language('english');` | Agrega un índice de texto completo del idioma especificado (PostgreSQL). |
| `$table->spatialIndex('location');` | Agrega un índice espacial (excepto SQLite).                          |
| `$table->vectorIndex('embedding');` | Agrega un índice vectorial (MariaDB/PostgreSQL).                    |

</div>

<a id="online-index-creation"></a>
#### Creación de índice en línea

De forma predeterminada, la creación de un índice en una tabla grande puede bloquear la tabla y bloquear lecturas o escrituras mientras se crea el índice. Al utilizar PostgreSQL o SQL Server, puede encadenar el método `online` a una definición de índice para crear el índice sin bloquear la tabla, lo que permite que su aplicación continúe leyendo y escribiendo datos durante la creación del índice:

```php
$table->unique('email')->online();
```

Cuando se usa PostgreSQL, esto agrega la opción `CONCURRENTLY` a la declaración de creación del índice. Cuando se utiliza SQL Server, esto agrega la opción `WITH (online = on)`.

Al usar MySQL, puede encadenar el modificador `inplace` a un índice o definición de clave externa para especificar que la operación debe usar el algoritmo `INPLACE`:

```php
$table->index('email')->inplace();

$table->foreign('user_id')->references('id')->on('users')->inplace();
```

El modificador `inplace` se puede combinar con el modificador `lock` para controlar el bloqueo de la mesa durante la operación:

```php
$table->index('email')->inplace()->lock('none');
```

Cuando se utiliza el modificador `inplace` para una operación de clave externa, las comprobaciones de clave externa deben estar deshabilitadas.

Consulte la [documentación de MySQL](https://dev.mysql.com/doc/refman/8.0/en/innodb-online-ddl-operations.html) para determinar qué operaciones admiten el algoritmo `INPLACE` y los modos de bloqueo.

<a id="renaming-indexes"></a>
### Cambiar el nombre de los índices

Para cambiar el nombre de un índice, puede utilizar el método `renameIndex` proporcionado por el modelo del generador de esquemas. Este método acepta el nombre del índice actual como primer argumento y el nombre deseado como segundo argumento:

```php
$table->renameIndex('from', 'to');
```

<a id="dropping-indexes"></a>
### Índices de caída

Para eliminar un índice, debe especificar el nombre del índice. De forma predeterminada, Laravel asigna automáticamente un nombre de índice según el nombre de la tabla, el nombre de la columna indexada y el tipo de índice. A continuación se muestran algunos ejemplos:

<div class="overflow-auto">

| Comando | Descripción |
| ---------------------------------------------------------------------- | ----------------------------------------------------- |
| `$table->dropPrimary('users_id_primary');` | Suelte una clave principal de la tabla "usuarios".                  |
| `$table->dropUnique('users_email_unique');` | Elimine un índice único de la tabla "usuarios".                 |
| `$table->dropIndex('geo_state_index');` | Elimine un índice básico de la tabla "geo".                    |
| `$table->dropFullText('posts_body_fulltext');` | Suelte un índice de texto completo de la tabla "publicaciones".              |
| `$table->dropSpatialIndex('geo_location_spatialindex');` | Suelte un índice espacial de la tabla "geo" (excepto SQLite). |
| `$table->dropVectorIndex('documents_embedding_vectorindex');` | Suelte un índice de vector de la tabla "documentos".             |

</div>

Si pasa una matriz de columnas a un método que elimina índices, el nombre del índice convencional se generará en función del nombre de la tabla, las columnas y el tipo de índice:

```php
Schema::table('geo', function (Blueprint $table) {
    $table->dropIndex(['state']); // Drops index 'geo_state_index'
});
```

<a id="foreign-key-constraints"></a>
### Restricciones de clave externa

Laravel también brinda soporte para crear restricciones de clave externa, que se utilizan para forzar la integridad referencial a nivel de base de datos. Por ejemplo, definamos una columna `user_id` en la tabla `posts` que hace referencia a la columna `id` en una tabla `users`:

```php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('posts', function (Blueprint $table) {
    $table->unsignedBigInteger('user_id');

    $table->foreign('user_id')->references('id')->on('users');
});
```

Dado que esta sintaxis es bastante detallada, Laravel proporciona métodos adicionales y más concisos que utilizan convenciones para brindar una mejor experiencia al desarrollador. Cuando utilice el método `foreignId` para crear su columna, el ejemplo anterior se puede reescribir así:

```php
Schema::table('posts', function (Blueprint $table) {
    $table->foreignId('user_id')->constrained();
});
```

El método `foreignId` crea una columna equivalente a `UNSIGNED BIGINT`, mientras que el método `constrained` utilizará convenciones para determinar la tabla y la columna a las que se hace referencia. Si el nombre de su tabla no coincide con las convenciones de Laravel, puede proporcionarlo manualmente al método `constrained`. Además, también se puede especificar el nombre que se le debe asignar al índice generado:

```php
Schema::table('posts', function (Blueprint $table) {
    $table->foreignId('user_id')->constrained(
        table: 'users', indexName: 'posts_user_id'
    );
});
```

También puede especificar la acción deseada para las propiedades "al eliminar" y "al actualizar" de la restricción:

```php
$table->foreignId('user_id')
    ->constrained()
    ->onUpdate('cascade')
    ->onDelete('cascade');
```

También se proporciona una sintaxis expresiva alternativa para estas acciones:

<div class="overflow-auto">

| Método | Descripción |
| ----------------------- | ------------------------------------------------- |
| `$table->cascadeOnUpdate();` | Las actualizaciones deberían realizarse en cascada.                           |
| `$table->restrictOnUpdate();` | Las actualizaciones deben estar restringidas.                     |
| `$table->nullOnUpdate();` | Las actualizaciones deben establecer el valor de la clave externa en nulo. |
| `$table->noActionOnUpdate();` | No hay acción sobre las actualizaciones.                             |
| `$table->cascadeOnDelete();` | Las eliminaciones deben caer en cascada.                           |
| `$table->restrictOnDelete();` | Las eliminaciones deben estar restringidas.                     |
| `$table->nullOnDelete();` | Las eliminaciones deben establecer el valor de la clave externa en nulo. |
| `$table->noActionOnDelete();` | Evita eliminaciones si existen registros secundarios.          |

</div>

Cualquier [modificador de columna](#column-modifiers) adicional debe llamarse antes del método `constrained`:

```php
$table->foreignId('user_id')
    ->nullable()
    ->constrained();
```

<a id="dropping-foreign-keys"></a>
#### Eliminación de claves externas

Para eliminar una clave externa, puede utilizar el método `dropForeign`, pasando el nombre de la restricción de clave externa que se eliminará como argumento. Las restricciones de clave externa utilizan la misma convención de nomenclatura que los índices. En otras palabras, el nombre de la restricción de clave externa se basa en el nombre de la tabla y las columnas de la restricción, seguido del sufijo "\_foreign":

```php
$table->dropForeign('posts_user_id_foreign');
```

Alternativamente, puede pasar una matriz que contenga el nombre de la columna que contiene la clave externa al método `dropForeign`. La matriz se convertirá en un nombre de restricción de clave externa utilizando las convenciones de nomenclatura de restricciones de Laravel:

```php
$table->dropForeign(['user_id']);
```

<a id="toggling-foreign-key-constraints"></a>
#### Alternar restricciones de clave externa

Puede habilitar o deshabilitar restricciones de clave externa dentro de sus migraciones utilizando los siguientes métodos:

```php
Schema::enableForeignKeyConstraints();

Schema::disableForeignKeyConstraints();

Schema::withoutForeignKeyConstraints(function () {
    // Constraints disabled within this closure...
});
```

> **Advertencia:**
> SQLite deshabilita las restricciones de clave externa de forma predeterminada. Cuando utilice SQLite, asegúrese de [habilitar el soporte de clave externa](../database/#configuration) en la configuración de su base de datos antes de intentar crearlas en sus migraciones.

<a id="events"></a>
## Eventos

Para mayor comodidad, cada operación de migración enviará un [event](../events/). Con la excepción de `SchemaDumped` y `SchemaLoaded`, todos los eventos siguientes implementan la interfaz `Illuminate\Contracts\Database\Events\MigrationEvent`:

<div class="overflow-auto">

| Clase | Descripción |
| ------------------------------------------------ | ------------------------------------------------ |
| `Illuminate\Database\Events\DatabaseRefreshed` | El comando `migrate:fresh` o `migrate:refresh` ha finalizado. |
| `Illuminate\Database\Events\MigrationsStarted` | Un lote de migraciones está a punto de ejecutarse.   |
| `Illuminate\Database\Events\MigrationsEnded` | Ha finalizado un lote de migraciones.              |
| `Illuminate\Database\Events\MigrationStarted` | Está a punto de ejecutarse una única migración.      |
| `Illuminate\Database\Events\MigrationEnded` | Una única migración ha finalizado.                 |
| `Illuminate\Database\Events\NoPendingMigrations` | Un comando de migración no encontró migraciones pendientes. |
| `Illuminate\Database\Events\SchemaDumped` | Ha finalizado un volcado de esquema de base de datos.             |
| `Illuminate\Database\Events\SchemaLoaded` | Se ha cargado un volcado de esquema de base de datos existente.     |

</div>
