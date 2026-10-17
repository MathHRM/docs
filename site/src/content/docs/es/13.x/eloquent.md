---
title: "Eloquent: primeros pasos"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Generación de clases de modelo](#generating-model-classes)
- [Convenciones de los modelos Eloquent](#eloquent-model-conventions)
    - [Nombres de tabla](#table-names)
    - [Claves primarias](#primary-keys)
    - [Claves UUID y ULID](#uuid-and-ulid-keys)
    - [Marcas de tiempo](#timestamps)
    - [Conexiones de base de datos](#database-connections)
    - [Valores de atributos predeterminados](#default-attribute-values)
    - [Actualización de atributos después de las escrituras](#refreshing-attributes-after-writes)
    - [Configuración del modo estricto de Eloquent](#configuring-eloquent-strictness)
- [Recuperación de modelos](#retrieving-models)
    - [Colecciones](#collections)
    - [Procesamiento de resultados por lotes](#chunking-results)
    - [Procesamiento por lotes mediante colecciones diferidas](#chunking-using-lazy-collections)
    - [Cursores](#cursors)
    - [Subconsultas avanzadas](#advanced-subqueries)
- [Recuperación de modelos individuales y agregados](#retrieving-single-models)
    - [Recuperar o crear modelos](#retrieving-or-creating-models)
    - [Recuperación de agregados](#retrieving-aggregates)
- [Inserción y actualización de modelos](#inserting-and-updating-models)
    - [Inserciones](#inserts)
    - [Actualizaciones](#updates)
    - [Asignación masiva](#mass-assignment)
    - [Inserciones o actualizaciones](#upserts)
- [Eliminar modelos](#deleting-models)
    - [Eliminación lógica](#soft-deleting)
    - [Consulta de modelos eliminados de forma lógica](#querying-soft-deleted-models)
- [Poda de modelos](#pruning-models)
- [Replicación de modelos](#replicating-models)
- [Ámbitos de consulta](#query-scopes)
    - [Ámbitos globales](#global-scopes)
    - [Ámbitos locales](#local-scopes)
    - [Atributos pendientes](#pending-attributes)
- [Comparación de modelos](#comparing-models)
- [Eventos](#events)
    - [Uso de funciones anónimas](#events-using-closures)
    - [Observadores](#observers)
    - [Silenciar eventos](#muting-events)

<a id="introduction"></a>
## Introducción

Laravel incluye Eloquent, un mapeador relacional de objetos (ORM) que hace que sea agradable interactuar con tu base de datos. Cuando se utiliza Eloquent, cada tabla de base de datos tiene un "Modelo" correspondiente que se utiliza para interactuar con esa tabla. Además de recuperar registros de la tabla de la base de datos, los modelos Eloquent también te permiten insertar, actualizar y eliminar registros de la tabla.

> **Nota:**
> Antes de comenzar, asegúrate de configurar una conexión de base de datos en el archivo de configuración `config/database.php` de tu aplicación. Para obtener más información sobre cómo configurar tu base de datos, consulta [la documentación de configuración de la base de datos](../database/#configuration).

<a id="generating-model-classes"></a>
## Generación de clases de modelo

Para comenzar, creemos un modelo Eloquent. Los modelos normalmente se encuentran en el directorio `app\Models` y amplían la clase `Illuminate\Database\Eloquent\Model`. Puedes utilizar el `make:model` [comando Artisan](../artisan/) para generar un nuevo modelo:

```shell
php artisan make:model Flight
```

Si deseas generar una [migración de base de datos](../migrations/) cuando generas el modelo, puedes usar la opción `--migration` o `-m`:

```shell
php artisan make:model Flight --migration
```

Puedes generar otros tipos de clases al generar un modelo, como factories, seeders, políticas, controladores y solicitudes de formulario. Además, estas opciones se pueden combinar para crear varias clases a la vez:

```shell
# Generate a model and a FlightFactory class...
php artisan make:model Flight --factory
php artisan make:model Flight -f

# Generate a model and a FlightSeeder class...
php artisan make:model Flight --seed
php artisan make:model Flight -s

# Generate a model and a FlightController class...
php artisan make:model Flight --controller
php artisan make:model Flight -c

# Generate a model, FlightController resource class, and form request classes...
php artisan make:model Flight --controller --resource --requests
php artisan make:model Flight -crR

# Generate a model and a FlightPolicy class...
php artisan make:model Flight --policy

# Generate a model and a migration, factory, seeder, and controller...
php artisan make:model Flight -mfsc

# Shortcut to generate a model, migration, factory, seeder, policy, controller, and form requests...
php artisan make:model Flight --all
php artisan make:model Flight -a

# Generate a pivot model...
php artisan make:model Member --pivot
php artisan make:model Member -p
```

<a id="inspecting-models"></a>
#### Inspeccionar modelos

A veces puede resultar difícil determinar todos los atributos y relaciones disponibles de un modelo con solo revisar su código. En su lugar, prueba el comando `model:show` Artisan, que proporciona una descripción general conveniente de todos los atributos y relaciones del modelo:

```shell
php artisan model:show Flight
```

<a id="eloquent-model-conventions"></a>
## Convenciones de los modelos Eloquent

Los modelos generados por el comando `make:model` se colocarán en el directorio `app/Models`. Examinemos una clase de modelo básica y analicemos algunas de las convenciones clave de Eloquent:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    // ...
}
```

<a id="table-names"></a>
### Nombres de tablas

Después de echar un vistazo al ejemplo anterior, es posible que hayas notado que no le dijimos a Eloquent qué tabla de base de datos corresponde a nuestro modelo `Flight`. Por convención, el nombre plural de la clase en "snake_case" se utilizará como nombre de la tabla a menos que se especifique explícitamente otro nombre. Entonces, en este caso, Eloquent asumirá que el modelo `Flight` almacena registros en la tabla `flights`, mientras que un modelo `AirTrafficController` almacenaría registros en una tabla `air_traffic_controllers`.

Si la tabla de base de datos correspondiente de tu modelo no se ajusta a esta convención, puedes especificar manualmente el nombre de la tabla del modelo usando el atributo `Table`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;

#[Table('my_flights')]
class Flight extends Model
{
    // ...
}
```


<a id="primary-keys"></a>
### Claves primarias

Eloquent también asumirá que la tabla de base de datos correspondiente a cada modelo tiene una columna de clave primaria denominada `id`. Si es necesario, puedes especificar una columna diferente que sirva como clave primaria de tu modelo usando el argumento `key` en el atributo `Table`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;

#[Table(key: 'flight_id')]
class Flight extends Model
{
    // ...
}
```

Además, Eloquent asume que la clave primaria es un valor entero incremental, lo que significa que Eloquent convertirá automáticamente la clave primaria en un número entero. Si deseas utilizar una clave primaria no incremental o no numérica, debes especificar los argumentos `keyType` y `incrementing` en el atributo `Table`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;

#[Table(key: 'uuid', keyType: 'string', incrementing: false)]
class Flight extends Model
{
    // ...
}
```

Si solo necesitas deshabilitar los ID de incremento automático, puedes usar el atributo `WithoutIncrementing`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\WithoutIncrementing;
use Illuminate\Database\Eloquent\Model;

#[WithoutIncrementing]
class Flight extends Model
{
    // ...
}
```

<a id="composite-primary-keys"></a>
#### Claves primarias "compuestas"

Eloquent requiere que cada modelo tenga al menos una "ID" de identificación única que pueda servir como clave primaria. Los modelos Eloquent no admiten claves primarias "compuestas". Sin embargo, tú es libre de agregar índices únicos de varias columnas adicionales a las tablas de tu base de datos, además de la clave primaria de identificación única de la tabla.

<a id="uuid-and-ulid-keys"></a>
### Claves UUID y ULID

En lugar de utilizar números enteros que se incrementan automáticamente como claves primarias de tu modelo Eloquent, puedes optar por utilizar UUID. Los UUID son identificadores alfanuméricos universalmente únicos que tienen 36 caracteres.

Si deseas que un modelo use una clave UUID en lugar de una clave entera de incremento automático, puedes usar el trait `Illuminate\Database\Eloquent\Concerns\HasUuids` en el modelo. Por supuesto, debes asegurarte de que el modelo tenga una [columna de clave primaria equivalente a UUID](../migrations/#column-method-uuid):

```php
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    use HasUuids;

    // ...
}

$article = Article::create(['title' => 'Traveling to Europe']);

$article->id; // "018f2b5c-6a7f-7b12-9d6f-2f8a4e0c9c11"
```

De forma predeterminada, el trait `HasUuids` generará [identificadores UUIDv7](../strings/#method-str-uuid7) para tus modelos. Estos UUID son más eficientes para el almacenamiento de bases de datos indexadas porque se pueden ordenar lexicográficamente.

Puedes anular el proceso de generación de UUID para un modelo determinado definiendo un método `newUniqueId` en el modelo. Además, puedes especificar qué columnas deben recibir UUID definiendo un método `uniqueIds` en el modelo:

```php
use Ramsey\Uuid\Uuid;

/**
 * Generate a new UUID for the model.
 */
public function newUniqueId(): string
{
    return (string) Uuid::uuid4();
}

/**
 * Get the columns that should receive a unique identifier.
 *
 * @return array<int, string>
 */
public function uniqueIds(): array
{
    return ['id', 'discount_code'];
}
```

Si lo deseas, puedes optar por utilizar "ULID" en lugar de UUID. Los ULID son similares a los UUID; sin embargo, sólo tienen 26 caracteres de longitud. Al igual que los UUID ordenados, los ULID se pueden ordenar lexicográficamente para una indexación eficiente de la base de datos. Para utilizar ULID, debes utilizar el trait `Illuminate\Database\Eloquent\Concerns\HasUlids` en tu modelo. También debes asegurarte de que el modelo tenga una [columna de clave primaria equivalente a ULID](../migrations/#column-method-ulid):

```php
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    use HasUlids;

    // ...
}

$article = Article::create(['title' => 'Traveling to Asia']);

$article->id; // "01gd4d3tgrrfqeda94gdbtdk5c"
```

<a id="timestamps"></a>
### Marcas de tiempo

De forma predeterminada, Eloquent espera que existan columnas `created_at` y `updated_at` en la tabla de base de datos correspondiente de tu modelo. Eloquent establecerá automáticamente los valores de estas columnas cuando se creen o actualicen modelos. Si no deseas que Eloquent administre estas columnas automáticamente, puedes configurar `timestamps` en `false` en el atributo `Table` de tu modelo:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;

#[Table(timestamps: false)]
class Flight extends Model
{
    // ...
}
```

Si solo necesitas deshabilitar las marcas de tiempo, puedes usar el atributo `WithoutTimestamps`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\WithoutTimestamps;
use Illuminate\Database\Eloquent\Model;

#[WithoutTimestamps]
class Flight extends Model
{
    // ...
}
```

Si necesitas personalizar el formato de las marcas de tiempo de tu modelo, puedes usar el argumento `dateFormat` en el atributo `Table`. Esto determina cómo se almacenan los atributos de fecha en la base de datos:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;

#[Table(dateFormat: 'U')]
class Flight extends Model
{
    // ...
}
```

Si solo necesitas definir un formato de fecha, puedes usar el atributo `DateFormat`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\DateFormat;
use Illuminate\Database\Eloquent\Model;

#[DateFormat('U')]
class Flight extends Model
{
    // ...
}
```

Si necesitas personalizar los nombres de las columnas utilizadas para almacenar las marcas de tiempo, puedes definir las constantes `CREATED_AT` y `UPDATED_AT` en tu modelo:

```php
<?php

class Flight extends Model
{
    /**
     * The name of the "created at" column.
     *
     * @var string|null
     */
    public const CREATED_AT = 'creation_date';

    /**
     * The name of the "updated at" column.
     *
     * @var string|null
     */
    public const UPDATED_AT = 'updated_date';
}
```

Si deseas realizar operaciones de modelo sin que se modifique la marca de tiempo `updated_at` del modelo, puedes operar en el modelo dentro de una función anónima pasada al método `withoutTimestamps`:

```php
Model::withoutTimestamps(fn () => $post->increment('reads'));
```

<a id="database-connections"></a>
### Conexiones de bases de datos

De forma predeterminada, todos los modelos de Eloquent utilizarán la conexión de base de datos predeterminada que esté configurada para tu aplicación. Si deseas especificar una conexión diferente que se debe usar al interactuar con un modelo en particular, puedes usar el atributo `Connection`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Connection;
use Illuminate\Database\Eloquent\Model;

#[Connection('mysql')]
class Flight extends Model
{
    // ...
}
```

<a id="default-attribute-values"></a>
### Valores de atributos predeterminados

De forma predeterminada, una instancia de modelo recién creada no contendrá ningún valor de atributo. Si deseas definir los valores predeterminados para algunos de los atributos de tu modelo, puedes definir una propiedad `$attributes` en tu modelo. Los valores de atributos colocados en el array `$attributes` deben estar en su formato sin procesar y "almacenable", como si acabaran de leerse de la base de datos:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    /**
     * The model's default values for attributes.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'options' => '[]',
        'delayed' => false,
    ];
}
```

<a id="refreshing-attributes-after-writes"></a>
### Actualización de atributos después de las escrituras

Si tu base de datos contiene columnas generadas, puedes configurar Eloquent para actualizar atributos específicos después de insertar o actualizar un modelo. Para hacerlo, define el atributo `Refreshes` en tu modelo:

```php
use Illuminate\Database\Eloquent\Attributes\Refreshes;

#[Refreshes('name')]
class User extends Model
{
    // ...
}
```

Puedes especificar múltiples atributos como un array:

```php
#[Refreshes(['name', 'slug'])]
```

Una vez escrito el modelo, los atributos configurados se actualizarán desde la base de datos.

<a id="configuring-eloquent-strictness"></a>
### Configuración del modo estricto de Eloquent

Laravel ofrece varios métodos que te permiten configurar el comportamiento y el grado de exigencia de Eloquent en distintas situaciones.

Primero, el método `preventLazyLoading` acepta un argumento booleano opcional que indica si se debe evitar la carga diferida. Por ejemplo, es posible que desees deshabilitar la carga diferida solo en entornos que no sean de producción para que tu entorno de producción continúe funcionando normalmente incluso si una relación de carga diferida está presente accidentalmente en el código de producción. Normalmente, este método debe invocarse en el método `boot` del `AppServiceProvider` de tu aplicación:

```php
use Illuminate\Database\Eloquent\Model;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Model::preventLazyLoading(! $this->app->isProduction());
}
```

Además, puedes indicarle a Laravel que lance una excepción al intentar asignar un valor a un atributo que no admite asignación masiva invocando el método `preventSilentlyDiscardingAttributes`. Esto puede ayudar a evitar errores inesperados durante el desarrollo local al intentar establecer un atributo que no se ha agregado al array `fillable` del modelo:

```php
Model::preventSilentlyDiscardingAttributes(! $this->app->isProduction());
```

<a id="retrieving-models"></a>
## Recuperación de modelos

Una vez que hayas creado un modelo y [tu tabla de base de datos asociada](../migrations/#generating-migrations), estarás listo para comenzar a recuperar datos de tu base de datos. Puedes considerar cada modelo de Eloquent como un poderoso [constructor de consultas](../queries/) que te permite consultar con fluidez la tabla de la base de datos asociada con el modelo. El método `all` del modelo recuperará todos los registros de la tabla de base de datos asociada al modelo:

```php
use App\Models\Flight;

foreach (Flight::all() as $flight) {
    echo $flight->name;
}
```

<a id="building-queries"></a>
#### Construcción de consultas

El método Eloquent `all` devolverá todos los resultados en la tabla del modelo. Sin embargo, dado que cada modelo de Eloquent sirve como [constructor de consultas](../queries/), puedes agregar restricciones adicionales a las consultas y luego invocar el método `get` para recuperar los resultados:

```php
$flights = Flight::where('active', 1)
    ->orderBy('name')
    ->limit(10)
    ->get();
```

> **Nota:**
> Dado que los modelos de Eloquent son constructores de consultas, debes revisar todos los métodos proporcionados por el [constructor de consultas](../queries/). Puedes utilizar cualquiera de estos métodos al escribir tus consultas de Eloquent.

<a id="refreshing-models"></a>
#### Actualización de modelos

Si ya tienes una instancia de un modelo de Eloquent que se recuperó de la base de datos, puedes "actualizar" el modelo utilizando los métodos `fresh` y `refresh`. El método `fresh` volverá a recuperar el modelo de la base de datos. La instancia del modelo existente no se verá afectada:

```php
$flight = Flight::where('number', 'FR 900')->first();

$freshFlight = $flight->fresh();
```

El método `refresh` rehidratará el modelo existente utilizando datos nuevos de la base de datos. Además, también se actualizarán todas las relaciones cargadas:

```php
$flight = Flight::where('number', 'FR 900')->first();

$flight->number = 'FR 456';

$flight->refresh();

$flight->number; // "FR 900"
```

Si necesitas actualizar un modelo y adquirir un bloqueo pesimista dentro de una transacción, puedes utilizar el método `refreshForUpdate`. Este método recarga el modelo usando un bloqueo `FOR UPDATE`:

```php
DB::transaction(function () use ($flight) {
    $flight->refreshForUpdate();

    // Update the locked model...
});
```

<a id="collections"></a>
### Colecciones

Como hemos visto, los métodos de Eloquent como `all` y `get` recuperan múltiples registros de la base de datos. Sin embargo, estos métodos no devuelven un array PHP simple. En su lugar, se devuelve una instancia de `Illuminate\Database\Eloquent\Collection`.

La clase Eloquent `Collection` extiende la clase base `Illuminate\Support\Collection` de Laravel, que proporciona una [variedad de métodos útiles](../collections/#available-methods) para interactuar con colecciones de datos. Por ejemplo, el método `reject` se puede utilizar para eliminar modelos de una colección según los resultados de una función anónima invocada:

```php
$flights = Flight::where('destination', 'Paris')->get();

$flights = $flights->reject(function (Flight $flight) {
    return $flight->cancelled;
});
```

Además de los métodos proporcionados por la clase de colección base de Laravel, la clase de colección Eloquent proporciona [algunos métodos adicionales](../eloquent-collections/#available-methods) que están diseñados específicamente para interactuar con colecciones de modelos Eloquent.

Dado que todas las colecciones de Laravel implementan las interfaces iterables de PHP, puedes recorrer las colecciones como si fueran un array:

```php
foreach ($flights as $flight) {
    echo $flight->name;
}
```

<a id="chunking-results"></a>
### Procesamiento de resultados por lotes

Tu aplicación puede quedarse sin memoria si intenta cargar decenas de miles de registros de Eloquent mediante los métodos `all` o `get`. En lugar de utilizar estos métodos, se puede utilizar el método `chunk` para procesar una gran cantidad de modelos de manera más eficiente.

El método `chunk` recuperará un subconjunto de modelos Eloquent y los pasará a una función anónima para su procesamiento. Dado que solo se recupera el lote actual de modelos Eloquent a la vez, el método `chunk` proporcionará un uso de memoria significativamente reducido cuando se trabaje con una gran cantidad de modelos:

```php
use App\Models\Flight;
use Illuminate\Database\Eloquent\Collection;

Flight::chunk(200, function (Collection $flights) {
    foreach ($flights as $flight) {
        // ...
    }
});
```

El primer argumento pasado al método `chunk` es el número de registros que deseas recibir por "lote". La función anónima pasada como segundo argumento se invocará para cada lote que se recupere de la base de datos. Se ejecutará una consulta de base de datos para recuperar cada lote de registros pasados a la función anónima.

Si estás filtrando los resultados del método `chunk` en función de una columna que también actualizarás mientras iteras sobre los resultados, debes utilizar el método `chunkById`. El uso del método `chunk` en estos escenarios podría generar resultados inesperados e inconsistentes. Internamente, el método `chunkById` siempre recuperará modelos con una columna `id` mayor que el último modelo en el lote anterior:

```php
Flight::where('departed', true)
    ->chunkById(200, function (Collection $flights) {
        $flights->each->update(['departed' => false]);
    }, column: 'id');
```

Dado que los métodos `chunkById` y `lazyById` agregan sus propias condiciones where a la consulta que se está ejecutando, normalmente deberías [agrupar lógicamente](../queries/#logical-grouping) tus propias condiciones dentro de una función anónima:

```php
Flight::where(function ($query) {
    $query->where('delayed', true)->orWhere('cancelled', true);
})->chunkById(200, function (Collection $flights) {
    $flights->each->update([
        'departed' => false,
        'cancelled' => true
    ]);
}, column: 'id');
```

<a id="chunking-using-lazy-collections"></a>
### Procesamiento por lotes mediante colecciones diferidas

El método `lazy` funciona de manera similar al [método `chunk`](#chunking-results) en el sentido de que, detrás de escena, ejecuta la consulta por lotes. Sin embargo, en lugar de pasar cada lote directamente a un callback tal como está, el método `lazy` devuelve una [LazyCollection](../collections/#lazy-collections) aplanada de modelos Eloquent, que te permite interactuar con los resultados como una sola secuencia:

```php
use App\Models\Flight;

foreach (Flight::lazy() as $flight) {
    // ...
}
```

Si estás filtrando los resultados del método `lazy` en función de una columna que también actualizarás mientras iteras sobre los resultados, debes utilizar el método `lazyById`. Internamente, el método `lazyById` siempre recuperará modelos con una columna `id` mayor que el último modelo del lote anterior:

```php
Flight::where('departed', true)
    ->lazyById(200, column: 'id')
    ->each->update(['departed' => false]);
```

Puedes filtrar los resultados según el orden descendente de `id` utilizando el método `lazyByIdDesc`.

<a id="cursors"></a>
### Cursores

De manera similar al método `lazy`, el método `cursor` se puede utilizar para reducir significativamente el consumo de memoria de tu aplicación al iterar a través de decenas de miles de registros del modelo Eloquent.

El método `cursor` solo ejecutará una única consulta de base de datos; sin embargo, los modelos individuales de Eloquent no se hidratarán hasta que realmente se recorran. Por lo tanto, solo se mantiene en la memoria un modelo de Eloquent en un momento dado mientras se itera sobre el cursor.

> **Advertencia:**
> Dado que el método `cursor` solo mantiene un único modelo Eloquent en la memoria a la vez, no puede realizar una carga anticipada de relaciones. Si necesitas cargar relaciones de forma anticipada, considera utilizar [el método `lazy`](#chunking-using-lazy-collections) en su lugar.

Internamente, el método `cursor` utiliza PHP [generadores](https://www.php.net/manual/en/language.generators.overview.php) para implementar esta funcionalidad:

```php
use App\Models\Flight;

foreach (Flight::where('destination', 'Zurich')->cursor() as $flight) {
    // ...
}
```

`cursor` devuelve una instancia de `Illuminate\Support\LazyCollection`. [Las colecciones diferidas](../collections/#lazy-collections) te permiten utilizar muchos de los métodos de colección disponibles en las colecciones típicas de Laravel mientras solo carga un único modelo en la memoria a la vez:

```php
use App\Models\User;

$users = User::cursor()->filter(function (User $user) {
    return $user->id > 500;
});

foreach ($users as $user) {
    echo $user->id;
}
```

Aunque el método `cursor` utiliza mucha menos memoria que una consulta normal (al mantener solo un modelo Eloquent en la memoria a la vez), eventualmente se quedará sin memoria. Esto se debe a que el controlador PDO de PHP almacena internamente en caché todos los resultados de las consultas sin procesar en su [búfer](https://www.php.net/manual/en/mysqlinfo.concepts.buffering.php). Si estás tratando con una gran cantidad de registros de Eloquent, considera usar [el método `lazy`](#chunking-using-lazy-collections) en su lugar.

<a id="advanced-subqueries"></a>
### Subconsultas avanzadas

<a id="subquery-selects"></a>
#### Selecciones de subconsulta

Eloquent también ofrece soporte avanzado para subconsultas, que te permite extraer información de tablas relacionadas en una sola consulta. Por ejemplo, imaginemos que tenemos una tabla `destinations` de destinos de vuelos y una tabla `flights` de vuelos a esos destinos. La tabla `flights` contiene una columna `arrived_at` que indica cuándo llegó el vuelo a su destino.

Usando la funcionalidad de subconsulta disponible para los métodos `select` y `addSelect` del constructor de consultas, podemos seleccionar todos los `destinations` y el nombre del vuelo que llegó más recientemente a ese destino usando una sola consulta:

```php
use App\Models\Destination;
use App\Models\Flight;

return Destination::addSelect(['last_flight' => Flight::select('name')
    ->whereColumn('destination_id', 'destinations.id')
    ->orderByDesc('arrived_at')
    ->limit(1)
])->get();
```

<a id="subquery-ordering"></a>
#### Orden de subconsultas

Además, la función `orderBy` del constructor de consultas admite subconsultas. Siguiendo con nuestro ejemplo de vuelo, podemos usar esta funcionalidad para ordenar todos los destinos según cuándo llegó el último vuelo a ese destino. Nuevamente, esto se puede hacer mientras se ejecuta una única consulta a la base de datos:

```php
return Destination::orderByDesc(
    Flight::select('arrived_at')
        ->whereColumn('destination_id', 'destinations.id')
        ->orderByDesc('arrived_at')
        ->limit(1)
)->get();
```

<a id="retrieving-single-models"></a>
## Recuperación de modelos individuales y agregados

Además de recuperar todos los registros que coinciden con una consulta determinada, también puedes recuperar registros individuales utilizando los métodos `find`, `first` o `firstWhere`. En lugar de devolver una colección de modelos, estos métodos devuelven una única instancia de modelo:

```php
use App\Models\Flight;

// Retrieve a model by its primary key...
$flight = Flight::find(1);

// Retrieve the first model matching the query constraints...
$flight = Flight::where('active', 1)->first();

// Alternative to retrieving the first model matching the query constraints...
$flight = Flight::firstWhere('active', 1);
```

A veces es posible que desees realizar alguna otra acción si no se encuentran resultados. Los métodos `findOr` y `firstOr` devolverán una única instancia de modelo o, si no se encuentran resultados, ejecutarán la función anónima dada. El valor devuelto por la función anónima se considerará el resultado del método:

```php
$flight = Flight::findOr(1, function () {
    // ...
});

$flight = Flight::where('legs', '>', 3)->firstOr(function () {
    // ...
});
```

<a id="not-found-exceptions"></a>
#### Excepciones por modelos no encontrados

A veces es posible que desees lanzar una excepción si no se encuentra un modelo. Esto es particularmente útil en rutas o controladores. Los métodos `findOrFail` y `firstOrFail` recuperarán el primer resultado de la consulta; sin embargo, si no se encuentra ningún resultado, se lanzará una excepción `Illuminate\Database\Eloquent\ModelNotFoundException`:

```php
$flight = Flight::findOrFail(1);

$flight = Flight::where('legs', '>', 3)->firstOrFail();
```

Si no se captura la excepción `ModelNotFoundException`, se envía automáticamente una respuesta HTTP 404 al cliente:

```php
use App\Models\Flight;

Route::get('/api/flights/{id}', function (string $id) {
    return Flight::findOrFail($id);
});
```

<a id="retrieving-or-creating-models"></a>
### Recuperar o crear modelos

El método `firstOrCreate` intentará localizar un registro de base de datos utilizando los pares de columna/valor dados. Si el modelo no se puede encontrar en la base de datos, se insertará un registro con los atributos resultantes de fusionar el array del primer argumento con el array opcional del segundo argumento.

El método `firstOrNew`, al igual que `firstOrCreate`, intentará localizar un registro en la base de datos que coincida con los atributos dados. Sin embargo, si no se encuentra un modelo, se devolverá una nueva instancia de modelo. Ten en cuenta que el modelo devuelto por `firstOrNew` aún no se ha guardado en la base de datos. Deberás llamar manualmente al método `save` para guardarlo:

```php
use App\Models\Flight;

// Retrieve flight by name or create it if it doesn't exist...
$flight = Flight::firstOrCreate([
    'name' => 'London to Paris'
]);

// Retrieve flight by name or create it with the name, delayed, and arrival_time attributes...
$flight = Flight::firstOrCreate(
    ['name' => 'London to Paris'],
    ['delayed' => 1, 'arrival_time' => '11:30']
);

// Retrieve flight by name or instantiate a new Flight instance...
$flight = Flight::firstOrNew([
    'name' => 'London to Paris'
]);

// Retrieve flight by name or instantiate with the name, delayed, and arrival_time attributes...
$flight = Flight::firstOrNew(
    ['name' => 'Tokyo to Sydney'],
    ['delayed' => 1, 'arrival_time' => '11:30']
);
```

<a id="retrieving-aggregates"></a>
### Recuperación de agregados

Al interactuar con modelos de Eloquent, también puedes utilizar `count`, `sum`, `max` y otros [métodos agregados](../queries/#aggregates) proporcionados por el [constructor de consultas de Laravel](../queries/). Como es de esperar, estos métodos devuelven un valor escalar en lugar de una instancia del modelo Eloquent:

```php
$count = Flight::where('active', 1)->count();

$max = Flight::where('active', 1)->max('price');
```

<a id="inserting-and-updating-models"></a>
## Insertar y actualizar modelos

<a id="inserts"></a>
### Inserciones

Por supuesto, cuando usamos Eloquent, no solo necesitamos recuperar modelos de la base de datos. También necesitamos insertar nuevos registros. Afortunadamente, Eloquent lo hace sencillo. Para insertar un nuevo registro en la base de datos, debes crear una instancia de un nuevo modelo y establecer atributos en el modelo. Luego, llama al método `save` en la instancia del modelo:

```php
<?php

namespace App\Http\Controllers;

use App\Models\Flight;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class FlightController extends Controller
{
    /**
     * Store a new flight in the database.
     */
    public function store(Request $request): RedirectResponse
    {
        // Validate the request...

        $flight = new Flight;

        $flight->name = $request->name;

        $flight->save();

        return redirect('/flights');
    }
}
```

En este ejemplo, asignamos el campo `name` de la solicitud HTTP entrante al atributo `name` de la instancia del modelo `App\Models\Flight`. Cuando llamamos al método `save`, se insertará un registro en la base de datos. Las marcas de tiempo `created_at` y `updated_at` del modelo se configurarán automáticamente cuando se llame al método `save`, por lo que no es necesario configurarlas manualmente.

Si deseas guardar el modelo dentro de una transacción de base de datos, puedes utilizar el método `saveOrFail`. Si se produce una excepción durante el guardado, la transacción se revertirá automáticamente:

```php
$flight->saveOrFail();
```

Alternativamente, puedes utilizar el método `create` para "guardar" un nuevo modelo utilizando una única instrucción PHP. La instancia del modelo insertado te será devuelta mediante el método `create`:

```php
use App\Models\Flight;

$flight = Flight::create([
    'name' => 'London to Paris',
]);
```

Sin embargo, antes de utilizar el método `create`, deberás especificar un atributo `Fillable` o `Guarded` en tu clase de modelo. Estos atributos son necesarios porque todos los modelos de Eloquent están protegidos contra vulnerabilidades de asignación masiva de forma predeterminada. Para obtener más información sobre la asignación masiva, consulta la [documentación de asignación masiva](#mass-assignment).

<a id="updates"></a>
### Actualizaciones

El método `save` también se puede utilizar para actualizar modelos que ya existen en la base de datos. Para actualizar un modelo, debes recuperarlo y configurar los atributos que desees actualizar. Luego, debes llamar al método `save` del modelo. Nuevamente, la marca de tiempo `updated_at` se actualizará automáticamente, por lo que no es necesario establecer su valor manualmente:

```php
use App\Models\Flight;

$flight = Flight::find(1);

$flight->name = 'Paris to London';

$flight->save();
```

Si deseas actualizar el modelo dentro de una transacción de base de datos, puedes utilizar el método `updateOrFail`. Si se produce una excepción durante la actualización, la transacción se revertirá automáticamente:

```php
$flight->updateOrFail(['name' => 'Paris to London']);
```

En ocasiones, es posible que necesites actualizar un modelo existente o crear un modelo nuevo si no existe ningún modelo coincidente. Al igual que el método `firstOrCreate`, el método `updateOrCreate` guarda el modelo, por lo que no es necesario llamar manualmente al método `save`.

En el siguiente ejemplo, si existe un vuelo con una ubicación `departure` de `Oakland` y una ubicación `destination` de `San Diego`, se actualizarán sus columnas `price` y `discounted`. Si no existe tal vuelo, se creará un nuevo vuelo que contiene los atributos resultantes de fusionar el primer array de argumentos con el segundo array de argumentos:

```php
$flight = Flight::updateOrCreate(
    ['departure' => 'Oakland', 'destination' => 'San Diego'],
    ['price' => 99, 'discounted' => 1]
);
```

Al utilizar métodos como `firstOrCreate` o `updateOrCreate`, es posible que no sepas si se ha creado un nuevo modelo o si se ha actualizado uno existente. La propiedad `wasRecentlyCreated` indica si el modelo se creó durante tu ciclo de vida actual:

```php
$flight = Flight::updateOrCreate(
    // ...
);

if ($flight->wasRecentlyCreated) {
    // New flight record was inserted...
}
```

<a id="mass-updates"></a>
#### Actualizaciones masivas

Las actualizaciones también se pueden realizar en modelos que coincidan con una consulta determinada. En este ejemplo, todos los vuelos que sean `active` y tengan un `destination` de `San Diego` se marcarán como retrasados:

```php
Flight::where('active', 1)
    ->where('destination', 'San Diego')
    ->update(['delayed' => 1]);
```

El método `update` espera un array de pares de columnas y valores que representen las columnas que deben actualizarse. El método `update` devuelve el número de filas afectadas.

> **Advertencia:**
> Al emitir una actualización masiva a través de Eloquent, los eventos de modelo `saving`, `saved`, `updating` y `updated` no se activarán para los modelos actualizados. Esto se debe a que los modelos nunca se recuperan cuando se emite una actualización masiva.

<a id="examining-attribute-changes"></a>
#### Examinar cambios de atributos

Eloquent proporciona los métodos `isDirty`, `isClean` y `wasChanged` para examinar el estado interno de tu modelo y determinar cómo han cambiado tus atributos desde que se recuperó originalmente el modelo.

El método `isDirty` determina si alguno de los atributos del modelo ha cambiado desde que se recuperó el modelo. Puedes pasar un nombre de atributo específico o un array de atributos al método `isDirty` para determinar si alguno de los atributos está "sucio". El método `isClean` determinará si un atributo no ha cambiado desde que se recuperó el modelo. Este método también acepta un argumento de atributo opcional:

```php
use App\Models\User;

$user = User::create([
    'first_name' => 'Taylor',
    'last_name' => 'Otwell',
    'title' => 'Developer',
]);

$user->title = 'Painter';

$user->isDirty(); // true
$user->isDirty('title'); // true
$user->isDirty('first_name'); // false
$user->isDirty(['first_name', 'title']); // true

$user->isClean(); // false
$user->isClean('title'); // false
$user->isClean('first_name'); // true
$user->isClean(['first_name', 'title']); // false

$user->save();

$user->isDirty(); // false
$user->isClean(); // true
```

El método `wasChanged` determina si se cambió algún atributo la última vez que se guardó el modelo dentro del ciclo de solicitud actual. Si es necesario, puedes pasar un nombre de atributo para ver si se cambió un atributo en particular:

```php
$user = User::create([
    'first_name' => 'Taylor',
    'last_name' => 'Otwell',
    'title' => 'Developer',
]);

$user->title = 'Painter';

$user->save();

$user->wasChanged(); // true
$user->wasChanged('title'); // true
$user->wasChanged(['title', 'slug']); // true
$user->wasChanged('first_name'); // false
$user->wasChanged(['first_name', 'title']); // true
```

El método `getOriginal` devuelve un array que contiene los atributos originales del modelo independientemente de cualquier cambio en el modelo desde que se recuperó. Si es necesario, puedes pasar un nombre de atributo específico para obtener el valor original de un atributo en particular:

```php
$user = User::find(1);

$user->name; // John
$user->email; // john@example.com

$user->name = 'Jack';
$user->name; // Jack

$user->getOriginal('name'); // John
$user->getOriginal(); // Array of original attributes...
```

El método `getChanges` devuelve un array que contiene los atributos que cambiaron la última vez que se guardó el modelo, mientras que el método `getPrevious` devuelve un array que contiene los valores de los atributos originales antes de que se guardara el modelo por última vez:

```php
$user = User::find(1);

$user->name; // John
$user->email; // john@example.com

$user->update([
    'name' => 'Jack',
    'email' => 'jack@example.com',
]);

$user->getChanges();

/*
    [
        'name' => 'Jack',
        'email' => 'jack@example.com',
    ]
*/

$user->getPrevious();

/*
    [
        'name' => 'John',
        'email' => 'john@example.com',
    ]
*/
```

<a id="mass-assignment"></a>
### Asignación masiva

Puedes utilizar el método `create` para "guardar" un nuevo modelo utilizando una única declaración PHP. La instancia del modelo insertado te será devuelta mediante el método:

```php
use App\Models\Flight;

$flight = Flight::create([
    'name' => 'London to Paris',
]);
```

Sin embargo, antes de utilizar el método `create`, deberás especificar un atributo `Fillable` o `Guarded` en tu clase de modelo. Estos atributos son necesarios porque todos los modelos de Eloquent están protegidos contra vulnerabilidades de asignación masiva de forma predeterminada.

Una vulnerabilidad de asignación masiva ocurre cuando un usuario pasa un campo de solicitud HTTP inesperado y ese campo cambia una columna en tu base de datos que no esperaba. Por ejemplo, un usuario malintencionado podría enviar un parámetro `is_admin` a través de una solicitud HTTP, que luego se pasa al método `create` de tu modelo, lo que permite al usuario obtener privilegios de administrador.

Entonces, para comenzar, debes definir qué atributos del modelo deseas que sean asignables en masa. Puedes hacer esto usando el atributo `Fillable` en el modelo. Por ejemplo, hagamos que el atributo `name` de nuestro modelo `Flight` sea asignable en masa:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name'])]
class Flight extends Model
{
    // ...
}
```

Una vez que hayas especificado qué atributos se pueden asignar en masa, puedes utilizar el método `create` para insertar un nuevo registro en la base de datos. El método `create` devuelve la instancia del modelo recién creada:

```php
$flight = Flight::create(['name' => 'London to Paris']);
```

Si ya tienes una instancia de modelo, puedes usar el método `fill` para completarla con una serie de atributos:

```php
$flight->fill(['name' => 'Amsterdam to Frankfurt']);
```

<a id="mass-assignment-json-columns"></a>
#### Asignación masiva y columnas JSON

Al asignar columnas JSON, la clave de asignación masiva de cada columna se debe especificar en el atributo `Fillable` de tu modelo. Por seguridad, Laravel no admite la actualización de atributos JSON anidados cuando se utiliza el atributo `Guarded`:

```php
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['options->enabled'])]
class Flight extends Model
{
    // ...
}
```

<a id="allowing-mass-assignment"></a>
#### Permitir asignación masiva

Si deseas que todos tus atributos sean asignables en masa, puedes utilizar el atributo `Unguarded` en tu modelo. Si eliges desproteger tu modelo, debes tener especial cuidado en crear siempre a mano los arrays pasados a los métodos `fill`, `create` y `update` de Eloquent:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class Flight extends Model
{
    // ...
}
```

<a id="mass-assignment-exceptions"></a>
#### Excepciones de asignaciones masivas

De forma predeterminada, los atributos que no están incluidos en el atributo `Fillable` se descartan silenciosamente al realizar operaciones de asignación masiva. En producción, este es el comportamiento esperado; sin embargo, durante el desarrollo local puede generar confusión sobre por qué los cambios de modelo no están surtiendo efecto.

Si lo deseas, puedes indicarle a Laravel que lance una excepción al intentar asignar un valor a un atributo que no admite asignación masiva invocando el método `preventSilentlyDiscardingAttributes`. Normalmente, este método debe invocarse en el método `boot` de la clase `AppServiceProvider` de tu aplicación:

```php
use Illuminate\Database\Eloquent\Model;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Model::preventSilentlyDiscardingAttributes($this->app->isLocal());
}
```

<a id="upserts"></a>
### Inserciones o actualizaciones

El método `upsert` de Eloquent se puede utilizar para actualizar o crear registros en una única operación atómica. El primer argumento del método consta de los valores a insertar o actualizar, mientras que el segundo argumento enumera las columnas que identifican de forma única los registros dentro de la tabla asociada. El tercer y último argumento del método es un array de columnas que deben actualizarse si ya existe un registro coincidente en la base de datos. El método `upsert` establecerá automáticamente las marcas de tiempo `created_at` y `updated_at` si las marcas de tiempo están habilitadas en el modelo:

```php
Flight::upsert([
    ['departure' => 'Oakland', 'destination' => 'San Diego', 'price' => 99],
    ['departure' => 'Chicago', 'destination' => 'New York', 'price' => 150]
], uniqueBy: ['departure', 'destination'], update: ['price']);
```

> **Advertencia:**
> Todas las bases de datos, excepto SQL Server, requieren que las columnas del segundo argumento del método `upsert` tengan un índice "primario" o "único". Además, los controladores de bases de datos MariaDB y MySQL ignoran el segundo argumento del método `upsert` y siempre utilizan los índices "primario" y "único" de la tabla para detectar registros existentes.

<a id="deleting-models"></a>
## Eliminación de modelos

Para eliminar un modelo, puedes llamar al método `delete` en la instancia del modelo:

```php
use App\Models\Flight;

$flight = Flight::find(1);

$flight->delete();
```

Si deseas eliminar el modelo dentro de una transacción de base de datos, puedes utilizar el método `deleteOrFail`. Si se produce una excepción durante la eliminación, la transacción se revertirá automáticamente:

```php
$flight->deleteOrFail();
```

<a id="deleting-an-existing-model-by-its-primary-key"></a>
#### Eliminar un modelo existente por su clave primaria

En el ejemplo anterior, recuperamos el modelo de la base de datos antes de llamar al método `delete`. Sin embargo, si conoces la clave primaria del modelo, puedes eliminar el modelo sin recuperarlo explícitamente llamando al método `destroy`. Además de aceptar la clave primaria única, el método `destroy` aceptará múltiples claves primarias, un array de claves primarias o una [colección](../collections/) de claves primarias:

```php
Flight::destroy(1);

Flight::destroy(1, 2, 3);

Flight::destroy([1, 2, 3]);

Flight::destroy(collect([1, 2, 3]));
```

Si estás utilizando [modelos con eliminación lógica](#soft-deleting), puedes eliminar modelos permanentemente mediante el método `forceDestroy`:

```php
Flight::forceDestroy(1);
```

> **Advertencia:**
> El método `destroy` carga cada modelo individualmente y llama al método `delete` para que los eventos `deleting` y `deleted` se despachen correctamente para cada modelo.

<a id="deleting-models-using-queries"></a>
#### Eliminación de modelos mediante consultas

Por supuesto, puedes crear una consulta Eloquent para eliminar todos los modelos que coincidan con los criterios de tu consulta. En este ejemplo, eliminaremos todos los vuelos marcados como inactivos. Al igual que las actualizaciones masivas, las eliminaciones masivas no despacharán eventos de modelo para los modelos que se eliminan:

```php
$deleted = Flight::where('active', 0)->delete();
```

Para eliminar todos los modelos de una tabla, debes ejecutar una consulta sin agregar ninguna condición:

```php
$deleted = Flight::query()->delete();
```

> **Advertencia:**
> Al ejecutar una declaración de eliminación masiva a través de Eloquent, los eventos de modelo `deleting` y `deleted` no se despacharán para los modelos eliminados. Esto se debe a que los modelos nunca se recuperan al ejecutar la declaración de eliminación.

<a id="soft-deleting"></a>
### Eliminación lógica

Además de eliminar registros de tu base de datos, Eloquent también puede "eliminar de forma lógica" modelos. Cuando los modelos se eliminan de forma lógica, en realidad no se eliminan de tu base de datos. En su lugar, se establece un atributo `deleted_at` en el modelo que indica la fecha y hora en que se "eliminó" el modelo. Para habilitar eliminaciones lógicas para un modelo, agrega el trait `Illuminate\Database\Eloquent\SoftDeletes` al modelo:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Flight extends Model
{
    use SoftDeletes;
}
```

> **Nota:**
> El trait `SoftDeletes` convertirá automáticamente el atributo `deleted_at` en una instancia `DateTime`/`Carbon`.

También debes agregar la columna `deleted_at` a la tabla de tu base de datos. El [constructor de esquemas](../migrations/) de Laravel contiene un método auxiliar para crear esta columna:

```php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('flights', function (Blueprint $table) {
    $table->softDeletes();
});

Schema::table('flights', function (Blueprint $table) {
    $table->dropSoftDeletes();
});
```

Ahora, cuando llama al método `delete` en el modelo, la columna `deleted_at` se establecerá en la fecha y hora actuales. Sin embargo, el registro de la base de datos del modelo se dejará en la tabla. Al consultar un modelo que utiliza eliminaciones lógicas, los modelos eliminados de forma lógica se excluirán automáticamente de todos los resultados de la consulta.

Para determinar si una instancia de modelo determinada se ha eliminado de forma lógica, puedes utilizar el método `trashed`:

```php
if ($flight->trashed()) {
    // ...
}
```

<a id="restoring-soft-deleted-models"></a>
#### Restauración de modelos eliminados de forma lógica

A veces es posible que desees restaurar un modelo eliminado de forma lógica. Para restaurar un modelo eliminado de forma lógica, puedes llamar al método `restore` en una instancia de modelo. El método `restore` establecerá la columna `deleted_at` del modelo en `null`:

```php
$flight->restore();
```

También puedes utilizar el método `restore` en una consulta para restaurar varios modelos. Nuevamente, al igual que otras operaciones "masivas", esto no despachará ningún evento de modelo para los modelos que se restauran:

```php
Flight::withTrashed()
    ->where('airline_id', 1)
    ->restore();
```

El método `restore` también se puede utilizar al crear consultas de [relaciones](../eloquent-relationships/):

```php
$flight->history()->restore();
```

<a id="permanently-deleting-models"></a>
#### Eliminación permanente de modelos

A veces es posible que necesites eliminar realmente un modelo de tu base de datos. Puedes utilizar el método `forceDelete` para eliminar permanentemente un modelo eliminado de forma lógica de la tabla de la base de datos:

```php
$flight->forceDelete();
```

También puedes utilizar el método `forceDelete` al crear consultas de relaciones de Eloquent:

```php
$flight->history()->forceDelete();
```

<a id="querying-soft-deleted-models"></a>
### Consulta de modelos eliminados de forma lógica

<a id="including-soft-deleted-models"></a>
#### Inclusión de modelos eliminados de forma lógica

Como se señaló anteriormente, los modelos eliminados de forma lógica se excluirán automáticamente de los resultados de la consulta. Sin embargo, puedes forzar la inclusión de modelos eliminados de forma lógica en los resultados de una consulta llamando al método `withTrashed` en la consulta:

```php
use App\Models\Flight;

$flights = Flight::withTrashed()
    ->where('account_id', 1)
    ->get();
```

También se puede llamar al método `withTrashed` al crear una consulta de [relaciones](../eloquent-relationships/):

```php
$flight->history()->withTrashed()->get();
```

<a id="retrieving-only-soft-deleted-models"></a>
#### Recuperar solo modelos eliminados de forma lógica

El método `onlyTrashed` recuperará **solo** modelos eliminados de forma lógica:

```php
$flights = Flight::onlyTrashed()
    ->where('airline_id', 1)
    ->get();
```

<a id="pruning-models"></a>
## Poda de modelos

A veces es posible que desees eliminar periódicamente los modelos que ya no son necesarios. Para lograr esto, puedes agregar el trait `Illuminate\Database\Eloquent\Prunable` o `Illuminate\Database\Eloquent\MassPrunable` a los modelos que deseas podar periódicamente. Después de agregar uno de los traits al modelo, implementa un método `prunable` que devuelva un constructor de consultas Eloquent que resuelve los modelos que ya no son necesarios:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Prunable;

class Flight extends Model
{
    use Prunable;

    /**
     * Get the prunable model query.
     */
    public function prunable(): Builder
    {
        return static::where('created_at', '<=', now()->minus(months: 1));
    }
}
```

Al marcar modelos como `Prunable`, también puedes definir un método `pruning` en el modelo. Este método se llamará antes de que se elimine el modelo. Este método puede resultar útil para eliminar cualquier recurso adicional asociado con el modelo, como archivos almacenados, antes de que el modelo se elimine permanentemente de la base de datos:

```php
/**
 * Prepare the model for pruning.
 */
protected function pruning(): void
{
    // ...
}
```

Después de configurar tu modelo apto para la poda, debes programar el comando `model:prune` Artisan en el archivo `routes/console.php` de tu aplicación. Eres libre de elegir el intervalo apropiado en el que se debe ejecutar este comando:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('model:prune')->daily();
```

Detrás de escena, el comando `model:prune` detectará automáticamente modelos aptos para la poda dentro del directorio `app/Models` de tu aplicación. Si tus modelos están en una ubicación diferente, puedes usar la opción `--model` para especificar los nombres de las clases de modelo:

```php
Schedule::command('model:prune', [
    '--model' => [Address::class, Flight::class],
])->daily();
```

Si deseas excluir ciertos modelos de la poda mientras podas todos los demás modelos detectados, puedes usar la opción `--except`:

```php
Schedule::command('model:prune', [
    '--except' => [Address::class, Flight::class],
])->daily();
```

Puedes probar tu consulta `prunable` ejecutando el comando `model:prune` con la opción `--pretend`. En este modo de simulación, el comando `model:prune` simplemente informará cuántos registros se eliminarían si el comando realmente se ejecutara:

```shell
php artisan model:prune --pretend
```

> **Advertencia:**
> Los modelos con eliminación lógica se eliminarán permanentemente (`forceDelete`) si coinciden con la consulta de poda.

<a id="mass-pruning"></a>
#### Poda masiva

Cuando los modelos están marcados con el trait `Illuminate\Database\Eloquent\MassPrunable`, los modelos se eliminan de la base de datos mediante consultas de eliminación masiva. Por lo tanto, no se invocará el método `pruning` ni se despacharán los eventos de los modelos `deleting` y `deleted`. Esto se debe a que los modelos nunca se recuperan antes de eliminarlos, lo que hace que el proceso de poda sea mucho más eficiente:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\MassPrunable;

class Flight extends Model
{
    use MassPrunable;

    /**
     * Get the prunable model query.
     */
    public function prunable(): Builder
    {
        return static::where('created_at', '<=', now()->minus(months: 1));
    }
}
```

<a id="replicating-models"></a>
## Replicación de modelos

Puedes crear una copia no guardada de una instancia de modelo existente utilizando el método `replicate`. Este método es particularmente útil cuando tienes instancias de modelo que comparten muchos de los mismos atributos:

```php
use App\Models\Address;

$shipping = Address::create([
    'type' => 'shipping',
    'line_1' => '123 Example Street',
    'city' => 'Victorville',
    'state' => 'CA',
    'postcode' => '90001',
]);

$billing = $shipping->replicate()->fill([
    'type' => 'billing'
]);

$billing->save();
```

Para excluir uno o más atributos para que no se repliquen en el nuevo modelo, puedes pasar un array al método `replicate`:

```php
$flight = Flight::create([
    'destination' => 'LAX',
    'origin' => 'LHR',
    'last_flown' => '2020-03-04 11:00:00',
    'last_pilot_id' => 747,
]);

$flight = $flight->replicate([
    'last_flown',
    'last_pilot_id'
]);
```

<a id="query-scopes"></a>
## Ámbitos de consulta

<a id="global-scopes"></a>
### Ámbitos globales

Los ámbitos globales te permiten agregar restricciones a todas las consultas para un modelo determinado. La propia [funcionalidad de eliminación lógica](#soft-deleting) de Laravel utiliza ámbitos globales para recuperar solo modelos "no eliminados" de la base de datos. Escribir tus propios ámbitos globales puede proporcionar una manera cómoda y sencilla de asegurarte de que cada consulta para un modelo determinado reciba ciertas restricciones.

<a id="generating-scopes"></a>
#### Generación de ámbitos

Para generar un nuevo ámbito global, puedes invocar el comando `make:scope` Artisan, que colocará el ámbito generado en el directorio `app/Models/Scopes` de tu aplicación:

```shell
php artisan make:scope AncientScope
```

<a id="writing-global-scopes"></a>
#### Definición de ámbitos globales

Escribir un ámbito global es simple. Primero, usa el comando `make:scope` para generar una clase que implemente la interfaz `Illuminate\Database\Eloquent\Scope`. La interfaz `Scope` requiere que implementes un método: `apply`. El método `apply` puede agregar restricciones `where` u otros tipos de cláusulas a la consulta según sea necesario:

```php
<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class AncientScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model): void
    {
        $builder->where('created_at', '<', now()->minus(years: 2000));
    }
}
```

> **Nota:**
> Si tu ámbito global agrega columnas a la cláusula de selección de la consulta, debes usar el método `addSelect` en lugar de `select`. Esto evitará el reemplazo involuntario de la cláusula de selección existente de la consulta.

<a id="applying-global-scopes"></a>
#### Aplicación de ámbitos globales

Para asignar un ámbito global a un modelo, simplemente puedes colocar el atributo `ScopedBy` en el modelo:

```php
<?php

namespace App\Models;

use App\Models\Scopes\AncientScope;
use Illuminate\Database\Eloquent\Attributes\ScopedBy;

#[ScopedBy([AncientScope::class])]
class User extends Model
{
    //
}
```

O puedes registrar manualmente el ámbito global anulando el método `booted` del modelo e invocando el método `addGlobalScope` del modelo. El método `addGlobalScope` acepta una instancia de tu ámbito como único argumento:

```php
<?php

namespace App\Models;

use App\Models\Scopes\AncientScope;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::addGlobalScope(new AncientScope);
    }
}
```

Después de agregar el ámbito en el ejemplo anterior al modelo `App\Models\User`, una llamada al método `User::all()` ejecutará la siguiente consulta SQL:

```sql
select * from `users` where `created_at` < 0021-02-18 00:00:00
```

<a id="anonymous-global-scopes"></a>
#### Ámbitos globales anónimos

Eloquent también te permite definir ámbitos globales mediante funciones anónimas, lo cual es particularmente útil para ámbitos simples que no justifican una clase propia separada. Al definir un ámbito global mediante una función anónima, debes proporcionar un nombre de ámbito de tu elección como primer argumento del método `addGlobalScope`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::addGlobalScope('ancient', function (Builder $builder) {
            $builder->where('created_at', '<', now()->minus(years: 2000));
        });
    }
}
```

<a id="removing-global-scopes"></a>
#### Eliminación de ámbitos globales

Si deseas eliminar un ámbito global para una consulta determinada, puedes utilizar el método `withoutGlobalScope`. Este método acepta el nombre de clase del ámbito global como único argumento:

```php
User::withoutGlobalScope(AncientScope::class)->get();
```

O, si definiste el ámbito global usando una función anónima, debes pasar el nombre de cadena que asignaste al ámbito global:

```php
User::withoutGlobalScope('ancient')->get();
```

Si deseas eliminar varios o incluso todos los ámbitos globales de la consulta, puedes utilizar los métodos `withoutGlobalScopes` y `withoutGlobalScopesExcept`:

```php
// Remove all of the global scopes...
User::withoutGlobalScopes()->get();

// Remove some of the global scopes...
User::withoutGlobalScopes([
    FirstScope::class, SecondScope::class
])->get();

// Remove all global scopes except the given ones...
User::withoutGlobalScopesExcept([
    SecondScope::class,
])->get();
```

<a id="local-scopes"></a>
### Ámbitos locales

Los ámbitos locales te permiten definir conjuntos comunes de restricciones de consulta que puedes reutilizar fácilmente en toda tu aplicación. Por ejemplo, es posible que necesites recuperar con frecuencia todos los usuarios que se consideran "populares". Para definir un ámbito, agrega el atributo `Scope` a un método Eloquent.

Los ámbitos siempre deben devolver la misma instancia del constructor de consultas o `void`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * Scope a query to only include popular users.
     */
    #[Scope]
    protected function popular(Builder $query): void
    {
        $query->where('votes', '>', 100);
    }

    /**
     * Scope a query to only include active users.
     */
    #[Scope]
    protected function active(Builder $query): void
    {
        $query->where('active', 1);
    }
}
```

<a id="utilizing-a-local-scope"></a>
#### Uso de un ámbito local

Una vez que se ha definido el ámbito, puedes llamar a los métodos de ámbito al consultar el modelo. Incluso puedes encadenar llamadas a varios ámbitos:

```php
use App\Models\User;

$users = User::popular()->active()->orderBy('created_at')->get();
```

La combinación de múltiples ámbitos del modelo Eloquent a través de un operador de consulta `or` puede requerir el uso de funciones anónimas para lograr la [agrupación lógica](../queries/#logical-grouping) correcta:

```php
$users = User::popular()->orWhere(function (Builder $query) {
    $query->active();
})->get();
```

Sin embargo, dado que esto puede ser engorroso, Laravel proporciona un método `orWhere` de "orden superior" que te permite encadenar ámbitos con fluidez sin el uso de funciones anónimas:

```php
$users = User::popular()->orWhere->active()->get();
```

<a id="dynamic-scopes"></a>
#### Ámbitos dinámicos

A veces es posible que desees definir un ámbito que acepte parámetros. Para comenzar, simplemente agrega tus parámetros adicionales a la firma de tu método de ámbito. Los parámetros de ámbito deben definirse después del parámetro `$query`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * Scope a query to only include users of a given type.
     */
    #[Scope]
    protected function ofType(Builder $query, string $type): void
    {
        $query->where('type', $type);
    }
}
```

Una vez que los argumentos esperados se hayan agregado a la firma de tu método de ámbito, puedes pasar los argumentos al llamar al ámbito:

```php
$users = User::ofType('admin')->get();
```

Los métodos de ámbito definidos mediante atributos deben ser `protected`. Al llamar a un ámbito definido mediante un atributo desde dentro de la clase de modelo, llama al ámbito a través de una instancia del constructor de consultas, como `static::query()->ofType('admin')`, para garantizar que la llamada se enrute a través dla gestión de ámbitos de Eloquent.

<a id="pending-attributes"></a>
### Atributos pendientes

Si deseas utilizar ámbitos para crear modelos que tengan los mismos atributos que los utilizados para restringir el ámbito, puedes utilizar el método `withAttributes` al crear la consulta de ámbito:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    /**
     * Scope the query to only include drafts.
     */
    #[Scope]
    protected function draft(Builder $query): void
    {
        $query->withAttributes([
            'hidden' => true,
        ]);
    }
}
```

El método `withAttributes` agregará condiciones `where` a la consulta usando los atributos dados, y también agregará los atributos dados a cualquier modelo creado a través del ámbito:

```php
$draft = Post::draft()->create(['title' => 'In Progress']);

$draft->hidden; // true
```

Para indicarle al método `withAttributes` que no agregue condiciones `where` a la consulta, puedes establecer el argumento `asConditions` en `false`:

```php
$query->withAttributes([
    'hidden' => true,
], asConditions: false);
```

<a id="comparing-models"></a>
## Comparación de modelos

A veces es posible que necesites determinar si dos modelos son "iguales" o no. Los métodos `is` y `isNot` se pueden utilizar para verificar rápidamente que dos modelos tengan la misma clave primaria, tabla y conexión de base de datos o no:

```php
if ($post->is($anotherPost)) {
    // ...
}

if ($post->isNot($anotherPost)) {
    // ...
}
```

Los métodos `is` y `isNot` también están disponibles cuando se utilizan `belongsTo`, `hasOne`, `morphTo` y `morphOne` [relaciones](../eloquent-relationships/). Este método es particularmente útil cuando deseas comparar un modelo relacionado sin emitir una consulta para recuperar ese modelo:

```php
if ($post->author()->is($user)) {
    // ...
}
```

<a id="events"></a>
## Eventos

> **Nota:**
> ¿Quieres difundir tus eventos de Eloquent directamente a tu aplicación del lado del cliente? Consulta la [difusión de eventos de modelos](../broadcasting/#model-broadcasting) de Laravel.

Los modelos Eloquent despachan varios eventos, lo que te permite intervenir a los siguientes momentos del ciclo de vida de un modelo: `retrieved`, `creating`, `created`, `updating`, `updated`, `saving`, `saved`, `deleting`, `deleted`, `trashed`, `forceDeleting`, `forceDeleted`, `restoring`, `restored` y `replicating`.

El evento `retrieved` se despachará cuando se recupere un modelo existente de la base de datos. Cuando se guarda un nuevo modelo por primera vez, se despacharán los eventos `creating` y `created`. Los eventos `updating`/`updated` se despacharán cuando se modifique un modelo existente y se llame al método `save`. Los eventos `saving`/`saved` se despacharán cuando se cree o actualice un modelo, incluso si los atributos del modelo no se han cambiado. Los nombres de eventos que terminan en `-ing` se despachan antes de que se guarden los cambios en el modelo, mientras que los eventos que terminan en `-ed` se despachan después de que se guarden los cambios en el modelo.

Para comenzar a escuchar eventos del modelo, define una propiedad `$dispatchesEvents` en tu modelo de Eloquent. Esta propiedad asigna varios puntos del ciclo de vida del modelo Eloquent a tus propias [clases de evento](../events/). Cada clase de evento de modelo debería esperar recibir una instancia del modelo afectado a través de su constructor:

```php
<?php

namespace App\Models;

use App\Events\UserDeleted;
use App\Events\UserSaved;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * The event map for the model.
     *
     * @var array<string, string>
     */
    protected $dispatchesEvents = [
        'saved' => UserSaved::class,
        'deleted' => UserDeleted::class,
    ];
}
```

Después de definir y mapear tus eventos de Eloquent, puedes usar [listeners de eventos](../events/#defining-listeners) para manejar los eventos.

> **Advertencia:**
> Al emitir una consulta de actualización o eliminación masiva a través de Eloquent, los eventos de modelo `saved`, `updated`, `deleting` y `deleted` no se despacharán para los modelos afectados. Esto se debe a que los modelos nunca se recuperan cuando se realizan actualizaciones o eliminaciones masivas.

<a id="events-using-closures"></a>
### Uso de funciones anónimas

En lugar de utilizar clases de eventos personalizadas, puedes registrar funciones anónimas que se ejecutan cuando se despachan varios eventos del modelo. Normalmente, debes registrar estas funciones anónimas en el método `booted` de tu modelo:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::created(function (User $user) {
            // ...
        });
    }
}
```

Si es necesario, puedes utilizar [listeners de eventos anónimos en cola](../events/#queueable-anonymous-event-listeners) al registrar eventos de modelo. Esto le indicará a Laravel que ejecute el listener de eventos del modelo en segundo plano usando la [cola](../queues/) de tu aplicación:

```php
use function Illuminate\Events\queueable;

static::created(queueable(function (User $user) {
    // ...
}));
```

<a id="observers"></a>
### Observadores

<a id="defining-observers"></a>
#### Definición de observadores

Si estás escuchando muchos eventos en un modelo determinado, puedes utilizar observadores para agrupar a todos tus listeners en una sola clase. Las clases de observador tienen nombres de métodos que reflejan los eventos de Eloquent que deseas escuchar. Cada uno de estos métodos recibe el modelo afectado como único argumento. El comando `make:observer` Artisan es la forma más sencilla de crear una nueva clase de observador:

```shell
php artisan make:observer UserObserver --model=User
```

Este comando colocará el nuevo observador en tu directorio `app/Observers`. Si este directorio no existe, Artisan lo creará por tú. Tu nuevo observador se verá así:

```php
<?php

namespace App\Observers;

use App\Models\User;

class UserObserver
{
    /**
     * Handle the User "created" event.
     */
    public function created(User $user): void
    {
        // ...
    }

    /**
     * Handle the User "updated" event.
     */
    public function updated(User $user): void
    {
        // ...
    }

    /**
     * Handle the User "deleted" event.
     */
    public function deleted(User $user): void
    {
        // ...
    }

    /**
     * Handle the User "restored" event.
     */
    public function restored(User $user): void
    {
        // ...
    }

    /**
     * Handle the User "forceDeleted" event.
     */
    public function forceDeleted(User $user): void
    {
        // ...
    }
}
```

Para registrar un observador, podrá colocar el atributo `ObservedBy` en el modelo correspondiente:

```php
use App\Observers\UserObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;

#[ObservedBy([UserObserver::class])]
class User extends Authenticatable
{
    //
}
```

O puedes registrar manualmente un observador invocando el método `observe` en el modelo que deseas observar. Puedes registrar observadores en el método `boot` de la clase `AppServiceProvider` de tu aplicación:

```php
use App\Models\User;
use App\Observers\UserObserver;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    User::observe(UserObserver::class);
}
```

> **Nota:**
> Hay eventos adicionales que un observador puede escuchar, como `saving` y `retrieved`. Estos eventos se describen en la documentación de [eventos](#events).

<a id="observers-and-database-transactions"></a>
#### Observadores y transacciones de bases de datos

Cuando se crean modelos dentro de una transacción de base de datos, es posible que desees indicarle a un observador que solo ejecute sus controladores de eventos después de que se confirme la transacción de la base de datos. Puedes lograr esto implementando la interfaz `ShouldHandleEventsAfterCommit` en tu observador. Si una transacción de base de datos no está en progreso, los controladores de eventos se ejecutarán inmediatamente:

```php
<?php

namespace App\Observers;

use App\Models\User;
use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit;

class UserObserver implements ShouldHandleEventsAfterCommit
{
    /**
     * Handle the User "created" event.
     */
    public function created(User $user): void
    {
        // ...
    }
}
```

<a id="muting-events"></a>
### Silenciar eventos

Es posible que en ocasiones necesites "silenciar" temporalmente todos los eventos activados por un modelo. Puedes lograr esto utilizando el método `withoutEvents`. El método `withoutEvents` acepta una función anónima como único argumento. Cualquier código ejecutado dentro de esta función anónima no despachará eventos de modelo y cualquier valor devuelto por la función anónima será devuelto por el método `withoutEvents`:

```php
use App\Models\User;

$user = User::withoutEvents(function () {
    User::findOrFail(1)->delete();

    return User::find(2);
});
```

<a id="saving-a-single-model-without-events"></a>
#### Guardar un modelo único sin eventos

A veces es posible que desees "guardar" un modelo determinado sin despachar ningún evento. Puedes lograr esto utilizando el método `saveQuietly`:

```php
$user = User::findOrFail(1);

$user->name = 'Victoria Faith';

$user->saveQuietly();
```

También puedes "actualizar", "eliminar", "eliminar de forma lógica", "restaurar" y "replicar" un modelo determinado sin despachar ningún evento:

```php
$user->deleteQuietly();
$user->forceDeleteQuietly();
$user->restoreQuietly();
```
