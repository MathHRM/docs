---
title: "Base de datos: introducción"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
    - [Configuración](#configuration)
    - [Conexiones de lectura y escritura](#read-and-write-connections)
    - [Conexiones PostgreSQL agrupadas](#pooled-postgresql-connections)
- [Ejecución de consultas SQL](#running-queries)
    - [Usando múltiples conexiones de bases de datos](#using-multiple-database-connections)
    - [Ejecución de consultas analíticas en Vitess](#running-analytical-queries-on-vitess)
    - [Escuchando eventos de consulta](#listening-for-query-events)
    - [Supervisión del tiempo de consulta acumulativo](#monitoring-cumulative-query-time)
- [Transacciones de base de datos](#database-transactions)
- [Conectando a la Base de Datos CLI](#connecting-to-the-database-cli)
- [Inspeccionando sus bases de datos](#inspecting-your-databases)
- [Monitoreo de sus bases de datos](#monitoring-your-databases)

<a id="introduction"></a>
## Introducción

Casi todas las aplicaciones web modernas interactúan con una base de datos. Laravel hace que la interacción con bases de datos sea extremadamente simple en una variedad de bases de datos compatibles utilizando SQL sin formato, un [generador de consultas fluido](../queries/) y el [Eloquent ORM](../eloquent/). Actualmente, Laravel proporciona soporte propio para cinco bases de datos:

<div class="content-list" markdown="1">

- MariaDB 10.3+ ([Política de versión](https://mariadb.org/about/#maintenance-policy))
- MySQL 5.7+ ([Política de versión](https://en.wikipedia.org/wiki/MySQL#Release_history))
- PostgreSQL 10.0+ ([Política de versión](https://www.postgresql.org/support/versioning/))
- SQLite 3.26.0+
- SQL Server 2017+ ([Política de versión](https://docs.microsoft.com/en-us/lifecycle/products/?products=sql-server))

</div>

Además, MongoDB es compatible a través del paquete `mongodb/laravel-mongodb`, que MongoDB mantiene oficialmente. Consulte la [documentación de Laravel MongoDB](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/) para obtener más información.

<a id="configuration"></a>
### Configuración

La configuración de los servicios de base de datos de Laravel se encuentra en el archivo de configuración `config/database.php` de su aplicación. En este archivo, puede definir todas las conexiones de su base de datos, así como especificar qué conexión debe usarse de forma predeterminada. La mayoría de las opciones de configuración dentro de este archivo están determinadas por los valores de las variables de entorno de su aplicación. En este archivo se proporcionan ejemplos para la mayoría de los sistemas de bases de datos compatibles con Laravel.

De forma predeterminada, la muestra [configuración del entorno](../configuration/#environment-configuration) de Laravel está lista para usar con [Laravel Sail](../sail/), que es una configuración de Docker para desarrollar aplicaciones Laravel en su máquina local. Sin embargo, usted es libre de modificar la configuración de su base de datos según sea necesario para su base de datos local.

<a id="sqlite-configuration"></a>
#### Configuración de SQLite

Las bases de datos SQLite están contenidas en un único archivo en su sistema de archivos. Puede crear una nueva base de datos SQLite usando el comando `touch` en su terminal: `touch database/database.sqlite`. Una vez creada la base de datos, puede configurar fácilmente sus variables de entorno para que apunten a esta base de datos colocando la ruta absoluta a la base de datos en la variable de entorno `DB_DATABASE`:

```ini
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/database.sqlite
```

De forma predeterminada, las restricciones de clave externa están habilitadas para las conexiones SQLite. Si desea deshabilitarlos, debe configurar la variable de entorno `DB_FOREIGN_KEYS` en `false`:

```ini
DB_FOREIGN_KEYS=false
```

> **Nota:**
> Si utiliza el [instalador de Laravel](../installation/#creating-a-laravel-project) para crear su aplicación Laravel y selecciona SQLite como su base de datos, Laravel creará automáticamente un archivo `database/database.sqlite` y ejecutará las [migraciones de base de datos](../migrations/) predeterminadas por usted.

<a id="mssql-configuration"></a>
#### Configuración del servidor Microsoft SQL

Para utilizar una base de datos de Microsoft SQL Server, debe asegurarse de tener instaladas las extensiones PHP `sqlsrv` y `pdo_sqlsrv`, así como cualquier dependencia que puedan requerir, como el controlador ODBC de Microsoft SQL.

<a id="configuration-using-urls"></a>
#### Configuración mediante URL

Normalmente, las conexiones de bases de datos se configuran utilizando múltiples valores de configuración como `host`, `database`, `username`, `password`, etc. Cada uno de estos valores de configuración tiene su propia variable de entorno correspondiente. Esto significa que al configurar la información de conexión de su base de datos en un servidor de producción, necesita administrar varias variables de entorno.

Algunos proveedores de bases de datos administradas, como AWS y Heroku, proporcionan una única "URL" de base de datos que contiene toda la información de conexión de la base de datos en una sola cadena. Una URL de base de datos de ejemplo puede parecerse a la siguiente:

```html
mysql://root:password@127.0.0.1/forge?charset=UTF-8
```

Estas URL suelen seguir una convención de esquema estándar:

```html
driver://username:password@host:port/database?options
```

Para mayor comodidad, Laravel admite estas URL como una alternativa a la configuración de su base de datos con múltiples opciones de configuración. Si la opción de configuración `url` (o la variable de entorno `DB_URL` correspondiente) está presente, se utilizará para extraer la conexión de la base de datos y la información de credenciales.

<a id="read-and-write-connections"></a>
### Conexiones de lectura y escritura

A veces es posible que desee utilizar una conexión de base de datos para declaraciones SELECT y otra para declaraciones INSERT, UPDATE y DELETE. Laravel hace que esto sea muy sencillo y siempre se utilizarán las conexiones adecuadas, ya sea que esté utilizando consultas sin formato, el generador de consultas o Eloquent ORM.

Para ver cómo se deben configurar las conexiones de lectura/escritura, veamos este ejemplo:

```php
'mysql' => [
    'driver' => 'mysql',
    
    'read' => [
        'host' => [
            '192.168.1.1',
            '196.168.1.2',
        ],
    ],
    'write' => [
        'host' => [
            '192.168.1.3',
        ],
    ],
    'sticky' => true,
    
    'port' => env('DB_PORT', '3306'),
    'database' => env('DB_DATABASE', 'laravel'),
    'username' => env('DB_USERNAME', 'root'),
    'password' => env('DB_PASSWORD', ''),
    'unix_socket' => env('DB_SOCKET', ''),
    'charset' => env('DB_CHARSET', 'utf8mb4'),
    'collation' => env('DB_COLLATION', 'utf8mb4_unicode_ci'),
    'prefix' => '',
    'prefix_indexes' => true,
    'strict' => true,
    'engine' => null,
    'options' => extension_loaded('pdo_mysql') ? array_filter([
        (PHP_VERSION_ID >= 80500 ? \Pdo\Mysql::ATTR_SSL_CA : \PDO::MYSQL_ATTR_SSL_CA) => env('MYSQL_ATTR_SSL_CA'),
    ]) : [],
],
```

Tenga en cuenta que se han agregado tres claves a la matriz de configuración: `read`, `write` y `sticky`. Las claves `read` y `write` tienen valores de matriz que contienen una única clave: `host`. El resto de las opciones de base de datos para las conexiones `read` y `write` se fusionarán desde la matriz de configuración principal `mysql`.

Solo necesita colocar elementos en las matrices `read` y `write` si desea anular los valores de la matriz principal `mysql`. Entonces, en este caso, `192.168.1.1` se usará como host para la conexión de "lectura", mientras que `192.168.1.3` se usará para la conexión de "escritura". Las credenciales de la base de datos, el prefijo, el juego de caracteres y todas las demás opciones de la matriz principal `mysql` se compartirán entre ambas conexiones. Cuando existen varios valores en la matriz de configuración `host`, se elegirá aleatoriamente un host de base de datos para cada solicitud.

<a id="the-sticky-option"></a>
#### La opción `sticky`

La opción `sticky` es un valor *opcional* que se puede utilizar para permitir la lectura inmediata de registros que se han escrito en la base de datos durante el ciclo de solicitud actual. Si la opción `sticky` está habilitada y se ha realizado una operación de "escritura" en la base de datos durante el ciclo de solicitud actual, cualquier operación de "lectura" adicional utilizará la conexión de "escritura". Esto garantiza que cualquier dato escrito durante el ciclo de solicitud se pueda leer inmediatamente desde la base de datos durante esa misma solicitud. Depende de usted decidir si este es el comportamiento deseado para su aplicación.

<a id="pooled-postgresql-connections"></a>
### Conexiones PostgreSQL agrupadas

Muchos proveedores administrados de PostgreSQL ofrecen agrupación de conexiones en modo transacción a través de servicios como PgBouncer o proxy de conexión. Estos agrupadores son ideales para consultas de aplicaciones, pero algunas operaciones de esquema, migraciones y comandos de mantenimiento requieren una conexión directa a la base de datos.

Para utilizar un agrupador de transacciones con PostgreSQL, configure la conexión agrupada como de costumbre y proporcione detalles de conexión directa a través de la opción de configuración `direct`:

```php
'pgsql' => [
    'driver' => 'pgsql',
    // ...
    'pooled' => env('DB_POOLED', false),
    'direct' => array_filter([
        'host' => env('DB_DIRECT_HOST'),
        'port' => env('DB_DIRECT_PORT'),
        'username' => env('DB_DIRECT_USERNAME'),
        'password' => env('DB_DIRECT_PASSWORD'),
        'sslmode' => env('DB_DIRECT_SSLMODE'),
    ]),
],
```

Cuando una conexión PostgreSQL se configura como agrupada, Laravel habilita automáticamente las preparaciones emuladas para la conexión agrupada. La conexión directa hereda cualquier opción no definida explícitamente en la configuración `direct` y utiliza preparaciones nativas de forma predeterminada.

Laravel utiliza automáticamente la conexión directa para migraciones, volcados de esquemas y restauraciones, `db:wipe`, `db:show` y `db:table`. El comando `db` también utiliza la conexión directa de forma predeterminada cuando el modo agrupado está habilitado y se configura una conexión directa; en su lugar, puede pasar la opción `--pooled` para conectarse a la conexión agrupada:

```shell
php artisan db --pooled
```

Si necesita utilizar explícitamente la conexión directa en su aplicación, agregue el sufijo `::direct` al nombre de la conexión:

```php
DB::connection('pgsql::direct')->statement('create extension if not exists "uuid-ossp"');
```

<a id="running-queries"></a>
## Ejecución de consultas SQL

Una vez que haya configurado la conexión de su base de datos, puede ejecutar consultas utilizando la fachada `DB`. La fachada `DB` proporciona métodos para cada tipo de consulta: `select`, `update`, `insert`, `delete` y `statement`.

<a id="running-a-select-query"></a>
#### Ejecución de una consulta de selección

Para ejecutar una consulta SELECT básica, puede utilizar el método `select` en la fachada `DB`:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * Mostrar una lista de todos los usuarios de la aplicación.
     */
    public function index(): View
    {
        $users = DB::select('select * from users where active = ?', [1]);

        return view('user.index', ['users' => $users]);
    }
}
```

El primer argumento pasado al método `select` es la consulta SQL, mientras que el segundo argumento son los enlaces de parámetros que deben vincularse a la consulta. Normalmente, estos son los valores de las restricciones de la cláusula `where`. El enlace de parámetros proporciona protección contra la inyección de SQL.

El método `select` siempre devolverá un `array` de resultados. Cada resultado dentro de la matriz será un objeto PHP `stdClass` que representa un registro de la base de datos:

```php
use Illuminate\Support\Facades\DB;

$users = DB::select('select * from users');

foreach ($users as $user) {
    echo $user->name;
}
```

<a id="selecting-scalar-values"></a>
#### Selección de valores escalares

A veces, la consulta de su base de datos puede dar como resultado un valor escalar único. En lugar de tener que recuperar el resultado escalar de la consulta de un objeto de registro, Laravel le permite recuperar este valor directamente usando el método `scalar`:

```php
$burgers = DB::scalar(
    "select count(case when food = 'burger' then 1 end) as burgers from menu"
);
```

<a id="selecting-multiple-result-sets"></a>
#### Seleccionar múltiples conjuntos de resultados

Si su aplicación llama a procedimientos almacenados que devuelven múltiples conjuntos de resultados, puede usar el método `selectResultSets` para recuperar todos los conjuntos de resultados devueltos por el procedimiento almacenado:

```php
[$options, $notifications] = DB::selectResultSets(
    "CALL get_user_options_and_notifications(?)", [$request->user()->id]
);
```

<a id="using-named-bindings"></a>
#### Uso de enlaces con nombre

En lugar de utilizar `?` para representar los enlaces de parámetros, puede ejecutar una consulta utilizando enlaces con nombre:

```php
$results = DB::select('select * from users where id = :id', ['id' => 1]);
```

<a id="running-an-insert-statement"></a>
#### Ejecutar una declaración de inserción

Para ejecutar una instrucción `insert`, puede utilizar el método `insert` en la fachada `DB`. Al igual que `select`, este método acepta la consulta SQL como primer argumento y enlaces como segundo argumento:

```php
use Illuminate\Support\Facades\DB;

DB::insert('insert into users (id, name) values (?, ?)', [1, 'Marc']);
```

<a id="running-an-update-statement"></a>
#### Ejecución de una declaración de actualización

Se debe utilizar el método `update` para actualizar los registros existentes en la base de datos. El número de filas afectadas por la declaración lo devuelve el método:

```php
use Illuminate\Support\Facades\DB;

$affected = DB::update(
    'update users set votes = 100 where name = ?',
    ['Anita']
);
```

<a id="running-a-delete-statement"></a>
#### Ejecutar una declaración de eliminación

Se debe utilizar el método `delete` para eliminar registros de la base de datos. Al igual que `update`, el número de filas afectadas será devuelto por el método:

```php
use Illuminate\Support\Facades\DB;

$deleted = DB::delete('delete from users');
```

<a id="running-a-general-statement"></a>
#### Ejecución de una declaración general

Algunas declaraciones de bases de datos no devuelven ningún valor. Para este tipo de operaciones se podrá utilizar el método `statement` sobre la fachada `DB`:

```php
DB::statement('drop table users');
```

<a id="running-an-unprepared-statement"></a>
#### Ejecución de una declaración no preparada

A veces es posible que desee ejecutar una declaración SQL sin vincular ningún valor. Puede utilizar el método `unprepared` de la fachada `DB` para lograr esto:

```php
DB::unprepared('update users set votes = 100 where name = "Dries"');
```

> **Advertencia:**
> Dado que las declaraciones no preparadas no vinculan parámetros, pueden ser vulnerables a la inyección de SQL. Nunca debe permitir valores controlados por el usuario dentro de una declaración no preparada.

<a id="implicit-commits-in-transactions"></a>
#### Confirmaciones implícitas

Al utilizar los métodos `statement` y `unprepared` de la fachada `DB` dentro de las transacciones, debe tener cuidado de evitar declaraciones que causen [compromisos implícitos](https://dev.mysql.com/doc/refman/8.0/en/implicit-commit.html). Estas declaraciones harán que el motor de la base de datos confirme indirectamente toda la transacción, dejando a Laravel sin conocimiento del nivel de transacción de la base de datos. Un ejemplo de tal declaración es la creación de una tabla de base de datos:

```php
DB::unprepared('create table a (col varchar(1) null)');
```

Consulte el manual de MySQL para obtener [una lista de todas las declaraciones](https://dev.mysql.com/doc/refman/8.0/en/implicit-commit.html) que activan confirmaciones implícitas.

<a id="using-multiple-database-connections"></a>
### Uso de múltiples conexiones de bases de datos

Si su aplicación define múltiples conexiones en su archivo de configuración `config/database.php`, puede acceder a cada conexión a través del método `connection` proporcionado por la fachada `DB`. El nombre de la conexión pasado al método `connection` debe corresponder a una de las conexiones enumeradas en su archivo de configuración `config/database.php` o configurada en tiempo de ejecución utilizando el asistente `config`:

```php
use Illuminate\Support\Facades\DB;

$users = DB::connection('sqlite')->select(/* ... */);
```

Puede acceder a la instancia de PDO subyacente sin procesar de una conexión utilizando el método `getPdo` en una instancia de conexión:

```php
$pdo = DB::connection()->getPdo();
```

<a id="running-analytical-queries-on-vitess"></a>
### Ejecución de consultas analíticas en Vitess

Cuando utilice una base de datos Vitess, como PlanetScale, puede utilizar el método `olap` para ejecutar consultas analíticas utilizando la carga de trabajo OLAP:

```php
use Illuminate\Support\Facades\DB;

$totals = DB::connection('mysql')->olap(fn ($connection) => $connection->table('orders')
    ->selectRaw('customer_id, sum(total) as total')
    ->groupBy('customer_id')
    ->get()
);
```

Laravel configura la carga de trabajo en las conexiones de lectura y escritura, luego la restablece a OLTP cuando finaliza la devolución de llamada, incluso si se produce una excepción. El método `olap` devuelve el resultado de la devolución de llamada. En conexiones MySQL que no utilizan Vitess, la devolución de llamada se ejecuta sin cambiar la carga de trabajo.

Puede determinar si una conexión MySQL utiliza Vitess mediante el método `isVitess`:

```php
$isVitess = DB::connection('mysql')->isVitess();
```

<a id="listening-for-query-events"></a>
### Escucha de eventos de consulta

Si desea especificar una función anónima que se invoca para cada consulta SQL ejecutada por su aplicación, puede utilizar el método `listen` de la fachada `DB`. Este método puede resultar útil para registrar consultas o depurar. Puede registrar la función anónima de su escucha de consultas en el método `boot` de un [proveedor de servicios](../providers/):

```php
<?php

namespace App\Providers;

use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Registrar los servicios de la aplicación.
     */
    public function register(): void
    {
        // ...
    }

    /**
     * Inicializar los servicios de la aplicación.
     */
    public function boot(): void
    {
        DB::listen(function (QueryExecuted $query) {
            // $query->sql;
            // $query->bindings;
            // $query->time;
            // $query->toRawSql();
        });
    }
}
```

<a id="monitoring-cumulative-query-time"></a>
### Monitoreo del tiempo de consulta acumulativo

Un cuello de botella común en el rendimiento de las aplicaciones web modernas es la cantidad de tiempo que dedican a consultar bases de datos. Afortunadamente, Laravel puede invocar una función anónima o devolución de llamada de su elección cuando pasa demasiado tiempo consultando la base de datos durante una sola solicitud. Para comenzar, proporcione un umbral de tiempo de consulta (en milisegundos) y una función anónima para el método `whenQueryingForLongerThan`. Puede invocar este método en el método `boot` de un [proveedor de servicios](../providers/):

```php
<?php

namespace App\Providers;

use Illuminate\Database\Connection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Events\QueryExecuted;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Registrar los servicios de la aplicación.
     */
    public function register(): void
    {
        // ...
    }

    /**
     * Inicializar los servicios de la aplicación.
     */
    public function boot(): void
    {
        DB::whenQueryingForLongerThan(500, function (Connection $connection, QueryExecuted $event) {
            // Notify development team...
        });
    }
}
```

<a id="database-transactions"></a>
## Transacciones de base de datos

Puede utilizar el método `transaction` proporcionado por la fachada `DB` para ejecutar un conjunto de operaciones dentro de una transacción de base de datos. Si se produce una excepción durante la función anónima de la transacción, la transacción se revertirá automáticamente y se volverá a generar la excepción. Si la función anónima se ejecuta exitosamente, la transacción se confirmará automáticamente. No necesita preocuparse por revertir o confirmar manualmente mientras usa el método `transaction`:

```php
use Illuminate\Support\Facades\DB;

DB::transaction(function () {
    DB::update('update users set votes = 1');

    DB::delete('delete from posts');
});
```

<a id="handling-deadlocks"></a>
#### Manejo de puntos muertos

El método `transaction` acepta un segundo argumento opcional que define el número de veces que se debe reintentar una transacción cuando se produce un punto muerto. Una vez agotados estos intentos, se lanzará una excepción:

```php
use Illuminate\Support\Facades\DB;

DB::transaction(function () {
    DB::update('update users set votes = 1');

    DB::delete('delete from posts');
}, attempts: 5);
```

<a id="manually-using-transactions"></a>
#### Uso manual de transacciones

Si desea iniciar una transacción manualmente y tener control total sobre las reversiones y confirmaciones, puede utilizar el método `beginTransaction` proporcionado por la fachada `DB`:

```php
use Illuminate\Support\Facades\DB;

DB::beginTransaction();
```

Puede revertir la transacción mediante el método `rollBack`:

```php
DB::rollBack();
```

Por último, puedes confirmar una transacción mediante el método `commit`:

```php
DB::commit();
```

> **Nota:**
> Los métodos de transacción de la fachada `DB` controlan las transacciones tanto para el [generador de consultas](../queries/) como para el [Eloquent ORM](../eloquent/).

<a id="connecting-to-the-database-cli"></a>
## Conexión a la CLI de la base de datos

Si desea conectarse a la CLI de su base de datos, puede usar el comando `db` Artisan:

```shell
php artisan db
```

Si es necesario, puede especificar un nombre de conexión de base de datos para conectarse a una conexión de base de datos que no sea la conexión predeterminada:

```shell
php artisan db mysql
```

<a id="inspecting-your-databases"></a>
## Inspeccionando sus bases de datos

Con los comandos de Artisan `db:show` y `db:table`, puede obtener información valiosa sobre su base de datos y sus tablas asociadas. Para ver una descripción general de su base de datos, incluido su tamaño, tipo, número de conexiones abiertas y un resumen de sus tablas, puede usar el comando `db:show`:

```shell
php artisan db:show
```

Puede especificar qué conexión de base de datos debe inspeccionarse proporcionando el nombre de la conexión de base de datos al comando mediante la opción `--database`:

```shell
php artisan db:show --database=pgsql
```

Si desea incluir recuentos de filas de la tabla y detalles de la vista de la base de datos dentro del resultado del comando, puede proporcionar las opciones `--counts` y `--views`, respectivamente. En bases de datos grandes, la recuperación de recuentos de filas y detalles de visualización puede ser lenta:

```shell
php artisan db:show --counts --views
```

Además, puede utilizar los siguientes métodos `Schema` para inspeccionar su base de datos:

```php
use Illuminate\Support\Facades\Schema;

$tables = Schema::getTables();
$views = Schema::getViews();
$columns = Schema::getColumns('users');
$indexes = Schema::getIndexes('users');
$foreignKeys = Schema::getForeignKeys('users');
```

Si desea inspeccionar una conexión de base de datos que no es la conexión predeterminada de su aplicación, puede utilizar el método `connection`:

```php
$columns = Schema::connection('sqlite')->getColumns('users');
```

<a id="table-overview"></a>
#### Descripción general de la tabla

Si desea obtener una descripción general de una tabla individual dentro de su base de datos, puede ejecutar el comando `db:table` Artisan. Este comando proporciona una descripción general de una tabla de base de datos, incluidas sus columnas, tipos, atributos, claves e índices:

```shell
php artisan db:table users
```

<a id="monitoring-your-databases"></a>
## Monitoreo de sus bases de datos

Usando el comando `db:monitor` Artisan, puede indicarle a Laravel que envíe un evento `Illuminate\Database\Events\DatabaseBusy` si su base de datos administra más de un número específico de conexiones abiertas.

Para comenzar, debe programar el comando `db:monitor` para [ejecutar cada minuto](../scheduling/). El comando acepta los nombres de las configuraciones de conexión de la base de datos que desea monitorear, así como el número máximo de conexiones abiertas que deben tolerarse antes de enviar un evento:

```shell
php artisan db:monitor --databases=mysql,pgsql --max=100
```

Programar este comando por sí solo no es suficiente para activar una notificación que le alerta sobre la cantidad de conexiones abiertas. Cuando el comando encuentra una base de datos que tiene un recuento de conexiones abiertas que excede su umbral, se enviará un evento `DatabaseBusy`. Debe escuchar este evento dentro del `AppServiceProvider` de su aplicación para poder enviarle una notificación a usted o a su equipo de desarrollo:

```php
use App\Notifications\DatabaseApproachingMaxConnections;
use Illuminate\Database\Events\DatabaseBusy;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;

/**
 * Inicializar los servicios de la aplicación.
 */
public function boot(): void
{
    Event::listen(function (DatabaseBusy $event) {
        Notification::route('mail', 'dev@example.com')
            ->notify(new DatabaseApproachingMaxConnections(
                $event->connectionName,
                $event->connections
            ));
    });
}
```
