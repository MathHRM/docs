---
title: "Base de datos: Generador de consultas"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Ejecución de consultas de base de datos](#running-database-queries)
    - [Resultados de fragmentación](#chunking-results)
    - [Resultados de la transmisión Lazily](#streaming-results-lazily)
    - [Agregados](#aggregates)
- [Seleccionar declaraciones](#select-statements)
- [Expresiones sin formato](#raw-expressions)
- [Se une a ](#joins)
- [Uniones](#unions)
- [Cláusulas Dónde Básicas](#basic-where-clauses)
    - [Donde Cláusulas](#where-clauses)
    - [O Cláusulas Donde](#or-where-clauses)
    - [Cláusulas donde no](#where-not-clauses)
    - [Donde hay alguna/todas/ninguna cláusulas](#where-any-all-none-clauses)
    - [JSON Cláusulas Where](#json-where-clauses)
    - [Cláusulas Where adicionales](#additional-where-clauses)
    - [Agrupación lógica](#logical-grouping)
- [Cláusulas Where avanzadas](#advanced-where-clauses)
    - [Donde Existen Cláusulas](#where-exists-clauses)
    - [Subconsulta Donde Cláusulas](#subquery-where-clauses)
    - [Texto completo de las cláusulas Where](#full-text-where-clauses)
    - [Cláusulas de similitud vectorial](#vector-similarity-clauses)
- [Ordenación, Agrupación, Límite y Desplazamiento](#ordering-grouping-limit-and-offset)
    - [Pedido](#ordering)
    - [Agrupación](#grouping)
    - [Límite y compensación](#limit-and-offset)
- [Cláusulas Condicionales](#conditional-clauses)
- [Insertar declaraciones](#insert-statements)
    - [Upserts](#upserts)
- [Declaraciones de actualización](#update-statements)
    - [Actualización de columnas JSON](#updating-json-columns)
    - [Incremento y Decremento](#increment-and-decrement)
- [Eliminar declaraciones](#delete-statements)
- [Bloqueo pesimista](#pessimistic-locking)
- [Componentes de consulta reutilizables](#reusable-query-components)
- [Depuración](#debugging)

<a id="introduction"></a>
## Introducción

El generador de consultas de bases de datos de Laravel proporciona una interfaz cómoda y fluida para crear y ejecutar consultas de bases de datos. Puede usarse para realizar la mayoría de las operaciones de bases de datos en su aplicación y funciona perfectamente con todos los sistemas de bases de datos compatibles con Laravel.

El generador de consultas de Laravel utiliza el enlace de parámetros PDO para proteger su aplicación contra ataques de inyección SQL. No es necesario limpiar ni desinfectar las cadenas pasadas al generador de consultas como enlaces de consulta.

> **Advertencia:**
> PDO no admite nombres de columnas vinculantes. Por lo tanto, nunca debe permitir que la entrada del usuario dicte los nombres de las columnas a las que hacen referencia sus consultas, incluidas las columnas "ordenar por".

<a id="running-database-queries"></a>
## Ejecución de consultas de bases de datos

<a id="retrieving-all-rows-from-a-table"></a>
#### Recuperar todas las filas de una tabla

Puede utilizar el método `table` proporcionado por la fachada `DB` para comenzar una consulta. El método `table` devuelve una instancia fluida del generador de consultas para la tabla dada, lo que le permite encadenar más restricciones en la consulta y luego, finalmente, recuperar los resultados de la consulta utilizando el método `get`:

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
        $users = DB::table('users')->get();

        return view('user.index', ['users' => $users]);
    }
}
```

El método `get` devuelve una instancia `Illuminate\Support\Collection` que contiene los resultados de la consulta donde cada resultado es una instancia del objeto PHP `stdClass`. Puede acceder al valor de cada columna accediendo a la columna como una propiedad del objeto:

```php
use Illuminate\Support\Facades\DB;

$users = DB::table('users')->get();

foreach ($users as $user) {
    echo $user->name;
}
```

> **Nota:**
> Las colecciones de Laravel proporcionan una variedad de métodos extremadamente poderosos para mapear y reducir datos. Para obtener más información sobre las colecciones de Laravel, consulte la [documentación de la colección](../collections/).

<a id="retrieving-a-single-row-column-from-a-table"></a>
#### Recuperar una sola fila/columna de una tabla

Si solo necesita recuperar una sola fila de una tabla de base de datos, puede usar el método `first` de la fachada `DB`. Este método devolverá un único objeto `stdClass`:

```php
$user = DB::table('users')->where('name', 'John')->first();

return $user->email;
```

Si desea recuperar una sola fila de una tabla de base de datos, pero arroja un `Illuminate\Database\RecordNotFoundException` si no se encuentra ninguna fila coincidente, puede utilizar el método `firstOrFail`. Si no se detecta el `RecordNotFoundException`, se envía automáticamente una respuesta HTTP 404 al cliente:

```php
$user = DB::table('users')->where('name', 'John')->firstOrFail();
```

Si no necesita una fila completa, puede extraer un valor único de un registro utilizando el método `value`. Este método devolverá el valor de la columna directamente:

```php
$email = DB::table('users')->where('name', 'John')->value('email');
```

Para recuperar una sola fila por su valor de columna `id`, utilice el método `find`:

```php
$user = DB::table('users')->find(3);
```

<a id="retrieving-a-list-of-column-values"></a>
#### Recuperar una lista de valores de columna

Si desea recuperar una instancia `Illuminate\Support\Collection` que contiene los valores de una sola columna, puede utilizar el método `pluck`. En este ejemplo, recuperaremos una colección de títulos de usuarios:

```php
use Illuminate\Support\Facades\DB;

$titles = DB::table('users')->pluck('title');

foreach ($titles as $title) {
    echo $title;
}
```

Puede especificar la columna que la colección resultante debe usar como clave proporcionando un segundo argumento al método `pluck`:

```php
$titles = DB::table('users')->pluck('title', 'name');

foreach ($titles as $name => $title) {
    echo $title;
}
```

<a id="chunking-results"></a>
### Resultados de fragmentación

Si necesita trabajar con miles de registros de bases de datos, considere utilizar el método `chunk` proporcionado por la fachada `DB`. Este método recupera una pequeña porción de resultados a la vez y introduce cada porción en una función anónima para su procesamiento. Por ejemplo, recuperemos la tabla `users` completa en fragmentos de 100 registros a la vez:

```php
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

DB::table('users')->orderBy('id')->chunk(100, function (Collection $users) {
    foreach ($users as $user) {
        // ...
    }
});
```

Puede detener el procesamiento de más fragmentos devolviendo `false` desde la función anónima:

```php
DB::table('users')->orderBy('id')->chunk(100, function (Collection $users) {
    // Procesar los registros...

    return false;
});
```

Si actualiza los registros de la base de datos mientras fragmenta los resultados, los resultados de la fragmentación podrían cambiar de maneras inesperadas. Si planea actualizar los registros recuperados durante la fragmentación, siempre es mejor utilizar el método `chunkById`. Este método paginará automáticamente los resultados según la clave principal del registro:

```php
DB::table('users')->where('active', false)
    ->chunkById(100, function (Collection $users) {
        foreach ($users as $user) {
            DB::table('users')
                ->where('id', $user->id)
                ->update(['active' => true]);
        }
    });
```

Dado que los métodos `chunkById` y `lazyById` agregan sus propias condiciones "dónde" a la consulta que se está ejecutando, normalmente deberías [agrupar lógicamente](#logical-grouping) tus propias condiciones dentro de una función anónima:

```php
DB::table('users')->where(function ($query) {
    $query->where('credits', 1)->orWhere('credits', 2);
})->chunkById(100, function (Collection $users) {
    foreach ($users as $user) {
        DB::table('users')
            ->where('id', $user->id)
            ->update(['credits' => 3]);
    }
});
```

> **Advertencia:**
> Al actualizar o eliminar registros dentro de la devolución de llamada del fragmento, cualquier cambio en la clave principal o las claves externas podría afectar la consulta del fragmento. Esto podría provocar que los registros no se incluyan en los resultados fragmentados.

<a id="streaming-results-lazily"></a>
### Transmisión de resultados perezosamente

El método `lazy` funciona de manera similar al método de fragmentos ](#chunking-results) en el sentido de que ejecuta la consulta en fragmentos. Sin embargo, en lugar de pasar cada fragmento a una devolución de llamada, el método `lazy()` devuelve un [LazyCollection](../collections/#lazy-collections), que le permite interactuar con los resultados como una sola secuencia:

```php
use Illuminate\Support\Facades\DB;

DB::table('users')->orderBy('id')->lazy()->each(function (object $user) {
    // ...
});
```

Una vez más, si planea actualizar los registros recuperados mientras los itera, es mejor utilizar los métodos `lazyById` o `lazyByIdDesc`. Estos métodos paginarán automáticamente los resultados según la clave principal del registro:

```php
DB::table('users')->where('active', false)
    ->lazyById()->each(function (object $user) {
        DB::table('users')
            ->where('id', $user->id)
            ->update(['active' => true]);
    });
```

> **Advertencia:**
> Al actualizar o eliminar registros mientras se itera sobre ellos, cualquier cambio en la clave principal o las claves externas podría afectar la consulta del fragmento. Esto podría provocar que los registros no se incluyan en los resultados.

<a id="aggregates"></a>
### Agregados

El generador de consultas también proporciona una variedad de métodos para recuperar valores agregados como `count`, `max`, `min`, `avg` y `sum`. Puede llamar a cualquiera de estos métodos después de construir su consulta:

```php
use Illuminate\Support\Facades\DB;

$users = DB::table('users')->count();

$price = DB::table('orders')->max('price');
```

Por supuesto, puede combinar estos métodos con otras cláusulas para ajustar cómo se calcula su valor agregado:

```php
$price = DB::table('orders')
    ->where('finalized', 1)
    ->avg('price');
```

<a id="determining-if-records-exist"></a>
#### Determinar si existen registros

En lugar de utilizar el método `count` para determinar si existe algún registro que coincida con las restricciones de su consulta, puede utilizar los métodos `exists` y `doesntExist`:

```php
if (DB::table('orders')->where('finalized', 1)->exists()) {
    // ...
}

if (DB::table('orders')->where('finalized', 1)->doesntExist()) {
    // ...
}
```

<a id="select-statements"></a>
## Seleccionar declaraciones

<a id="specifying-a-select-clause"></a>
#### Especificación de una cláusula de selección

Es posible que no siempre desee seleccionar todas las columnas de una tabla de base de datos. Con el método `select`, puede especificar una cláusula de "selección" personalizada para la consulta:

```php
use Illuminate\Support\Facades\DB;

$users = DB::table('users')
    ->select('name', 'email as user_email')
    ->get();
```

El método `distinct` le permite forzar que la consulta devuelva resultados distintos:

```php
$users = DB::table('users')->distinct()->get();
```

Si ya tiene una instancia del generador de consultas y desea agregar una columna a su cláusula de selección existente, puede usar el método `addSelect`:

```php
$query = DB::table('users')->select('name');

$users = $query->addSelect('age')->get();
```

<a id="raw-expressions"></a>
## Expresiones sin procesar

A veces es posible que necesites insertar una cadena arbitraria en una consulta. Para crear una expresión de cadena sin formato, puede utilizar el método `raw` proporcionado por la fachada `DB`:

```php
$users = DB::table('users')
    ->select(DB::raw('count(*) as user_count, status'))
    ->where('status', '<>', 1)
    ->groupBy('status')
    ->get();
```

> **Advertencia:**
> Las declaraciones sin procesar se inyectarán en la consulta como cadenas, por lo que debe tener mucho cuidado para evitar crear vulnerabilidades de inyección SQL.

<a id="raw-methods"></a>
### Métodos crudos

En lugar de utilizar el método `DB::raw`, también puede utilizar los siguientes métodos para insertar una expresión sin formato en varias partes de su consulta. **Recuerde, Laravel no puede garantizar que cualquier consulta que utilice expresiones sin formato esté protegida contra vulnerabilidades de inyección SQL.**

<a id="selectraw"></a>
#### `selectRaw`

Se puede utilizar el método `selectRaw` en lugar de `addSelect(DB::raw(/* ... */))`. Este método acepta una matriz opcional de enlaces como segundo argumento:

```php
$orders = DB::table('orders')
    ->selectRaw('price * ? as price_with_tax', [1.0825])
    ->get();
```

<a id="whereraw-orwhereraw"></a>
#### `whereRaw / orWhereRaw`

Los métodos `whereRaw` y `orWhereRaw` se pueden utilizar para insertar una cláusula "dónde" sin formato en su consulta. Estos métodos aceptan una matriz opcional de enlaces como segundo argumento:

```php
$orders = DB::table('orders')
    ->whereRaw('price > IF(state = "TX", ?, 100)', [200])
    ->get();
```

<a id="havingraw-orhavingraw"></a>
#### `havingRaw / orHavingRaw`

Los métodos `havingRaw` y `orHavingRaw` se pueden utilizar para proporcionar una cadena sin formato como valor de la cláusula "tener". Estos métodos aceptan una matriz opcional de enlaces como segundo argumento:

```php
$orders = DB::table('orders')
    ->select('department', DB::raw('SUM(price) as total_sales'))
    ->groupBy('department')
    ->havingRaw('SUM(price) > ?', [2500])
    ->get();
```

<a id="orderbyraw"></a>
#### `orderByRaw`

El método `orderByRaw` se puede utilizar para proporcionar una cadena sin formato como valor de la cláusula "ordenar por":

```php
$orders = DB::table('orders')
    ->orderByRaw('updated_at - created_at DESC')
    ->get();
```

<a id="groupbyraw"></a>
#### `groupByRaw`

El método `groupByRaw` se puede utilizar para proporcionar una cadena sin formato como valor de la cláusula `group by`:

```php
$orders = DB::table('orders')
    ->select('city', 'state')
    ->groupByRaw('city, state')
    ->get();
```

<a id="joins"></a>
## Se une

<a id="inner-join-clause"></a>
#### Cláusula de unión interna

El generador de consultas también se puede utilizar para agregar cláusulas de unión a sus consultas. Para realizar una "unión interna" básica, puede utilizar el método `join` en una instancia del generador de consultas. El primer argumento pasado al método `join` es el nombre de la tabla a la que necesita unirse, mientras que los argumentos restantes especifican las restricciones de columna para la unión. Incluso puedes unir varias tablas en una sola consulta:

```php
use Illuminate\Support\Facades\DB;

$users = DB::table('users')
    ->join('contacts', 'users.id', '=', 'contacts.user_id')
    ->join('orders', 'users.id', '=', 'orders.user_id')
    ->select('users.*', 'contacts.phone', 'orders.price')
    ->get();
```

<a id="left-join-right-join-clause"></a>
#### Cláusula de unión izquierda / unión derecha

Si desea realizar una "unión izquierda" o una "unión derecha" en lugar de una "unión interna", utilice los métodos `leftJoin` o `rightJoin`. Estos métodos tienen la misma firma que el método `join`:

```php
$users = DB::table('users')
    ->leftJoin('posts', 'users.id', '=', 'posts.user_id')
    ->get();

$users = DB::table('users')
    ->rightJoin('posts', 'users.id', '=', 'posts.user_id')
    ->get();
```

<a id="cross-join-clause"></a>
#### Cláusula de unión cruzada

Puede utilizar el método `crossJoin` para realizar una "unión cruzada". Las uniones cruzadas generan un producto cartesiano entre la primera tabla y la tabla unida:

```php
$sizes = DB::table('sizes')
    ->crossJoin('colors')
    ->get();
```

<a id="advanced-join-clauses"></a>
#### Cláusulas de unión avanzada

También puede especificar cláusulas de unión más avanzadas. Para comenzar, pase una función anónima como segundo argumento al método `join`. La función anónima recibirá una instancia `Illuminate\Database\Query\JoinClause` que le permitirá especificar restricciones en la cláusula "join":

```php
DB::table('users')
    ->join('contacts', function (JoinClause $join) {
        $join->on('users.id', '=', 'contacts.user_id')->orOn(/* ... */);
    })
    ->get();
```

Si desea utilizar una cláusula "dónde" en sus uniones, puede utilizar los métodos `where` y `orWhere` proporcionados por la instancia `JoinClause`. En lugar de comparar dos columnas, estos métodos compararán la columna con un valor:

```php
DB::table('users')
    ->join('contacts', function (JoinClause $join) {
        $join->on('users.id', '=', 'contacts.user_id')
            ->where('contacts.user_id', '>', 5);
    })
    ->get();
```

<a id="subquery-joins"></a>
#### Uniones de subconsultas

Puede utilizar los métodos `joinSub`, `leftJoinSub` y `rightJoinSub` para unir una consulta a una subconsulta. Cada uno de estos métodos recibe tres argumentos: la subconsulta, su alias de tabla y una función anónima que define las columnas relacionadas. En este ejemplo, recuperaremos una colección de usuarios donde cada registro de usuario también contiene la marca de tiempo `created_at` de la publicación de blog más reciente del usuario:

```php
$latestPosts = DB::table('posts')
    ->select('user_id', DB::raw('MAX(created_at) as last_post_created_at'))
    ->where('is_published', true)
    ->groupBy('user_id');

$users = DB::table('users')
    ->joinSub($latestPosts, 'latest_posts', function (JoinClause $join) {
        $join->on('users.id', '=', 'latest_posts.user_id');
    })->get();
```

<a id="lateral-joins"></a>
#### Uniones laterales

> **Advertencia:**
> Las uniones laterales actualmente son compatibles con PostgreSQL, MySQL >= 8.0.14 y SQL Server.

Puede utilizar los métodos `joinLateral` y `leftJoinLateral` para realizar una "unión lateral" con una subconsulta. Cada uno de estos métodos recibe dos argumentos: la subconsulta y su alias de tabla. Las condiciones de unión deben especificarse dentro de la cláusula `where` de la subconsulta dada. Las uniones laterales se evalúan para cada fila y pueden hacer referencia a columnas fuera de la subconsulta.

En este ejemplo, recuperaremos una colección de usuarios, así como las tres publicaciones de blog más recientes del usuario. Cada usuario puede generar hasta tres filas en el conjunto de resultados: una para cada una de sus publicaciones de blog más recientes. La condición de unión se especifica con una cláusula `whereColumn` dentro de la subconsulta, que hace referencia a la fila del usuario actual:

```php
$latestPosts = DB::table('posts')
    ->select('id as post_id', 'title as post_title', 'created_at as post_created_at')
    ->whereColumn('user_id', 'users.id')
    ->orderBy('created_at', 'desc')
    ->limit(3);

$users = DB::table('users')
    ->joinLateral($latestPosts, 'latest_posts')
    ->get();
```

<a id="unions"></a>
## Sindicatos

El generador de consultas también proporciona un método conveniente para "unir" dos o más consultas. Por ejemplo, puede crear una consulta inicial y utilizar el método `union` para unirla con más consultas:

```php
use Illuminate\Support\Facades\DB;

$usersWithoutFirstName = DB::table('users')
    ->whereNull('first_name');

$users = DB::table('users')
    ->whereNull('last_name')
    ->union($usersWithoutFirstName)
    ->get();
```

Además del método `union`, el generador de consultas proporciona un método `unionAll`. A las consultas que se combinan utilizando el método `unionAll` no se les eliminarán los resultados duplicados. El método `unionAll` tiene la misma firma de método que el método `union`.

<a id="basic-where-clauses"></a>
## Cláusulas Where básicas

<a id="where-clauses"></a>
### Cláusulas Dónde

Puede utilizar el método `where` del generador de consultas para agregar cláusulas "dónde" a la consulta. La llamada más básica al método `where` requiere tres argumentos. El primer argumento es el nombre de la columna. El segundo argumento es un operador, que puede ser cualquiera de los operadores admitidos por la base de datos. El tercer argumento es el valor a comparar con el valor de la columna.

Por ejemplo, la siguiente consulta recupera usuarios donde el valor de la columna `votes` es igual a `100` y el valor de la columna `age` es mayor que `35`:

```php
$users = DB::table('users')
    ->where('votes', '=', 100)
    ->where('age', '>', 35)
    ->get();
```

Por conveniencia, si desea verificar que una columna es `=` con un valor determinado, puede pasar el valor como segundo argumento al método `where`. Laravel asumirá que le gustaría utilizar el operador `=`:

```php
$users = DB::table('users')->where('votes', 100)->get();
```

También puede proporcionar una matriz asociativa al método `where` para realizar consultas rápidamente en varias columnas:

```php
$users = DB::table('users')->where([
    'first_name' => 'Jane',
    'last_name' => 'Doe',
])->get();
```

Como se mencionó anteriormente, puede utilizar cualquier operador que sea compatible con su sistema de base de datos:

```php
$users = DB::table('users')
    ->where('votes', '>=', 100)
    ->get();

$users = DB::table('users')
    ->where('votes', '<>', 100)
    ->get();

$users = DB::table('users')
    ->where('name', 'like', 'T%')
    ->get();
```

También puede pasar una serie de condiciones a la función `where`. Cada elemento de la matriz debe ser una matriz que contenga los tres argumentos que normalmente se pasan al método `where`:

```php
$users = DB::table('users')->where([
    ['status', '=', '1'],
    ['subscribed', '<>', '1'],
])->get();
```

> **Advertencia:**
> PDO no admite nombres de columnas vinculantes. Por lo tanto, nunca debe permitir que la entrada del usuario dicte los nombres de las columnas a las que hacen referencia sus consultas, incluidas las columnas "ordenar por".

> **Advertencia:**
> MySQL y MariaDB encasillan automáticamente cadenas a números enteros en comparaciones de números de cadena. En este proceso, las cadenas no numéricas se convierten a `0`, lo que puede generar resultados inesperados. Por ejemplo, si su tabla tiene una columna `secret` con un valor de `aaa` y ejecuta `User::where('secret', 0)`, se devolverá esa fila. Para evitar esto, asegúrese de que todos los valores estén encasillados en sus tipos apropiados antes de usarlos en consultas.

<a id="or-where-clauses"></a>
### O cláusulas donde

Al encadenar llamadas al método `where` del generador de consultas, las cláusulas "dónde" se unirán utilizando el operador `and`. Sin embargo, puede utilizar el método `orWhere` para unir una cláusula a la consulta utilizando el operador `or`. El método `orWhere` acepta los mismos argumentos que el método `where`:

```php
$users = DB::table('users')
    ->where('votes', '>', 100)
    ->orWhere('name', 'John')
    ->get();
```

Si necesita agrupar una condición "o" entre paréntesis, puede pasar una función anónima como primer argumento del método `orWhere`:

```php
use Illuminate\Database\Query\Builder;

$users = DB::table('users')
    ->where('votes', '>', 100)
    ->orWhere(function (Builder $query) {
        $query->where('name', 'Abigail')
            ->where('votes', '>', 50);
        })
    ->get();
```

El ejemplo anterior producirá el siguiente SQL:

```sql
select * from users where votes > 100 or (name = 'Abigail' and votes > 50)
```

> **Advertencia:**
> Siempre debe agrupar las llamadas `orWhere` para evitar comportamientos inesperados cuando se aplican alcances globales.

<a id="where-not-clauses"></a>
### Cláusulas donde no

Los métodos `whereNot` y `orWhereNot` se pueden utilizar para negar un grupo determinado de restricciones de consulta. Por ejemplo, la siguiente consulta excluye productos que están en liquidación o que tienen un precio inferior a diez:

```php
$products = DB::table('products')
    ->whereNot(function (Builder $query) {
        $query->where('clearance', true)
            ->orWhere('price', '<', 10);
        })
    ->get();
```

<a id="where-any-all-none-clauses"></a>
### Donde Cualquiera / Todas / Ninguna Cláusulas

A veces es posible que necesite aplicar las mismas restricciones de consulta a varias columnas. Por ejemplo, es posible que desee recuperar todos los registros donde cualquier columna de una lista determinada sea `LIKE` un valor determinado. Puede lograr esto utilizando el método `whereAny`:

```php
$users = DB::table('users')
    ->where('active', true)
    ->whereAny([
        'name',
        'email',
        'phone',
    ], 'like', 'Example%')
    ->get();
```

La consulta anterior dará como resultado el siguiente SQL:

```sql
SELECT *
FROM users
WHERE active = true AND (
    name LIKE 'Example%' OR
    email LIKE 'Example%' OR
    phone LIKE 'Example%'
)
```

De manera similar, el método `whereAll` se puede utilizar para recuperar registros donde todas las columnas dadas coincidan con una restricción determinada:

```php
$posts = DB::table('posts')
    ->where('published', true)
    ->whereAll([
        'title',
        'content',
    ], 'like', '%Laravel%')
    ->get();
```

La consulta anterior dará como resultado el siguiente SQL:

```sql
SELECT *
FROM posts
WHERE published = true AND (
    title LIKE '%Laravel%' AND
    content LIKE '%Laravel%'
)
```

El método `whereNone` se puede utilizar para recuperar registros donde ninguna de las columnas dadas coincide con una restricción determinada:

```php
$albums = DB::table('albums')
    ->where('published', true)
    ->whereNone([
        'title',
        'lyrics',
        'tags',
    ], 'like', '%explicit%')
    ->get();
```

La consulta anterior dará como resultado el siguiente SQL:

```sql
SELECT *
FROM albums
WHERE published = true AND NOT (
    title LIKE '%explicit%' OR
    lyrics LIKE '%explicit%' OR
    tags LIKE '%explicit%'
)
```

<a id="json-where-clauses"></a>
### JSON Cláusulas Dónde

Laravel también admite la consulta de tipos de columnas JSON en bases de datos que brindan soporte para tipos de columnas JSON. Actualmente, esto incluye MariaDB 10.3+, MySQL 8.0+, PostgreSQL 12.0+, SQL Server 2017+ y SQLite 3.39.0+. Para consultar una columna JSON, utilice el operador `->`:

```php
$users = DB::table('users')
    ->where('preferences->dining->meal', 'salad')
    ->get();

$users = DB::table('users')
    ->whereIn('preferences->dining->meal', ['pasta', 'salad', 'sandwiches'])
    ->get();
```

Puede utilizar los métodos `whereJsonContains` y `whereJsonDoesntContain` para consultar matrices JSON:

```php
$users = DB::table('users')
    ->whereJsonContains('options->languages', 'en')
    ->get();

$users = DB::table('users')
    ->whereJsonDoesntContain('options->languages', 'en')
    ->get();
```

Si su aplicación utiliza las bases de datos MariaDB, MySQL o PostgreSQL, puede pasar una matriz de valores a los métodos `whereJsonContains` y `whereJsonDoesntContain`:

```php
$users = DB::table('users')
    ->whereJsonContains('options->languages', ['en', 'de'])
    ->get();

$users = DB::table('users')
    ->whereJsonDoesntContain('options->languages', ['en', 'de'])
    ->get();
```

Además, puede utilizar los métodos `whereJsonContainsKey` o `whereJsonDoesntContainKey` para recuperar los resultados que incluyen o no una clave JSON:

```php
$users = DB::table('users')
    ->whereJsonContainsKey('preferences->dietary_requirements')
    ->get();

$users = DB::table('users')
    ->whereJsonDoesntContainKey('preferences->dietary_requirements')
    ->get();
```

Finalmente, puedes usar el método `whereJsonLength` para consultar matrices JSON por su longitud:

```php
$users = DB::table('users')
    ->whereJsonLength('options->languages', 0)
    ->get();

$users = DB::table('users')
    ->whereJsonLength('options->languages', '>', 1)
    ->get();
```

<a id="additional-where-clauses"></a>
### Cláusulas Where adicionales

**dóndeMe gusta / oDóndeMe gusta / dóndeNoMe gusta / oDóndeNoMe gusta**

El método `whereLike` le permite agregar cláusulas "LIKE" a su consulta para la coincidencia de patrones. Estos métodos proporcionan una forma independiente de la base de datos de realizar consultas de coincidencia de cadenas, con la capacidad de alternar la distinción entre mayúsculas y minúsculas. De forma predeterminada, la coincidencia de cadenas no distingue entre mayúsculas y minúsculas:

```php
$users = DB::table('users')
    ->whereLike('name', '%John%')
    ->get();
```

Puede habilitar una búsqueda que distinga entre mayúsculas y minúsculas mediante el argumento `caseSensitive`:

```php
$users = DB::table('users')
    ->whereLike('name', '%John%', caseSensitive: true)
    ->get();
```

El método `orWhereLike` le permite agregar una cláusula "o" con una condición LIKE:

```php
$users = DB::table('users')
    ->where('votes', '>', 100)
    ->orWhereLike('name', '%John%')
    ->get();
```

El método `whereNotLike` le permite agregar cláusulas "NOT LIKE" a su consulta:

```php
$users = DB::table('users')
    ->whereNotLike('name', '%John%')
    ->get();
```

De manera similar, puede usar `orWhereNotLike` para agregar una cláusula "o" con una condición NO ME GUSTA:

```php
$users = DB::table('users')
    ->where('votes', '>', 100)
    ->orWhereNotLike('name', '%John%')
    ->get();
```

> **Advertencia:**
> La opción de búsqueda que distingue entre mayúsculas y minúsculas `whereLike` actualmente no se admite en SQL Server.

**dóndeEn / dóndeNoEn / oDóndeEn / oDóndeNoEn**

El método `whereIn` verifica que el valor de una columna determinada esté contenido dentro de la matriz determinada:

```php
$users = DB::table('users')
    ->whereIn('id', [1, 2, 3])
    ->get();
```

El método `whereNotIn` verifica que el valor de la columna dada no esté contenido en la matriz dada:

```php
$users = DB::table('users')
    ->whereNotIn('id', [1, 2, 3])
    ->get();
```

También puede proporcionar un objeto de consulta como segundo argumento del método `whereIn`:

```php
$activeUsers = DB::table('users')->select('id')->where('is_active', 1);

$comments = DB::table('comments')
    ->whereIn('user_id', $activeUsers)
    ->get();
```

El ejemplo anterior producirá el siguiente SQL:

```sql
select * from comments where user_id in (
    select id
    from users
    where is_active = 1
)
```

> **Advertencia:**
> Si está agregando una gran variedad de enlaces de enteros a su consulta, se pueden usar los métodos `whereIntegerInRaw` o `whereIntegerNotInRaw` para reducir en gran medida el uso de memoria.

**dóndeentre/odóndeentre**

El método `whereBetween` verifica que el valor de una columna esté entre dos valores:

```php
$users = DB::table('users')
    ->whereBetween('votes', [1, 100])
    ->get();
```

**dondeNoEntre / oDondeNoEntre**

El método `whereNotBetween` verifica que el valor de una columna se encuentre fuera de dos valores:

```php
$users = DB::table('users')
    ->whereNotBetween('votes', [1, 100])
    ->get();
```

**whereBetweenColumns/whereNotBetweenColumns/orWhereBetweenColumns/orWhereNotBetweenColumns**

El método `whereBetweenColumns` verifica que el valor de una columna esté entre los dos valores de dos columnas en la misma fila de la tabla:

```php
$patients = DB::table('patients')
    ->whereBetweenColumns('weight', ['minimum_allowed_weight', 'maximum_allowed_weight'])
    ->get();
```

El método `whereNotBetweenColumns` verifica que el valor de una columna se encuentre fuera de los dos valores de dos columnas en la misma fila de la tabla:

```php
$patients = DB::table('patients')
    ->whereNotBetweenColumns('weight', ['minimum_allowed_weight', 'maximum_allowed_weight'])
    ->get();
```

**dondeValorEntre / dondeValorNoEntre / oDondeValorEntre / oDondeValorNoEntre**

El método `whereValueBetween` verifica que un valor determinado esté entre los valores de dos columnas del mismo tipo en la misma fila de la tabla:

```php
$products = DB::table('products')
    ->whereValueBetween(100, ['min_price', 'max_price'])
    ->get();
```

El método `whereValueNotBetween` verifica que un valor se encuentre fuera de los valores de dos columnas en la misma fila de la tabla:

```php
$products = DB::table('products')
    ->whereValueNotBetween(100, ['min_price', 'max_price'])
    ->get();
```

**dondeNulo / dondeNoNull / oDondeNull / oDondeNoNull**

El método `whereNull` verifica que el valor de la columna dada sea `NULL`:

```php
$users = DB::table('users')
    ->whereNull('updated_at')
    ->get();
```

El método `whereNotNull` verifica que el valor de la columna no sea `NULL`:

```php
$users = DB::table('users')
    ->whereNotNull('updated_at')
    ->get();
```

**dondeNullSafeEquals / o WhereNullSafeEquals**

Los métodos `whereNullSafeEquals` y `orWhereNullSafeEquals` se pueden usar para comparar el valor de una columna con un valor determinado mientras se tratan dos valores `NULL` como iguales:

```php
$lastLoginIp = $request->input('last_login_ip');

$users = DB::table('users')
    ->whereNullSafeEquals('last_login_ip', $lastLoginIp)
    ->get();
```

**dóndeFecha / dóndeMes / dóndeDía / dóndeAño / dóndeHora**

El método `whereDate` se puede utilizar para comparar el valor de una columna con una fecha:

```php
$users = DB::table('users')
    ->whereDate('created_at', '2016-12-31')
    ->get();
```

El método `whereMonth` se puede utilizar para comparar el valor de una columna con un mes específico:

```php
$users = DB::table('users')
    ->whereMonth('created_at', '12')
    ->get();
```

El método `whereDay` se puede utilizar para comparar el valor de una columna con un día específico del mes:

```php
$users = DB::table('users')
    ->whereDay('created_at', '31')
    ->get();
```

El método `whereYear` se puede utilizar para comparar el valor de una columna con un año específico:

```php
$users = DB::table('users')
    ->whereYear('created_at', '2016')
    ->get();
```

El método `whereTime` se puede utilizar para comparar el valor de una columna con un tiempo específico:

```php
$users = DB::table('users')
    ->whereTime('created_at', '=', '11:20:45')
    ->get();
```

**dondePasado / dondeFuturo / dondeHoy / dondeAntesHoy / dondeDespuésHoy**

Los métodos `wherePast` y `whereFuture` se pueden utilizar para determinar si el valor de una columna es pasado o futuro:

```php
$invoices = DB::table('invoices')
    ->wherePast('due_at')
    ->get();

$invoices = DB::table('invoices')
    ->whereFuture('due_at')
    ->get();
```

Los métodos `whereNowOrPast` y `whereNowOrFuture` se pueden utilizar para determinar si el valor de una columna es pasado o futuro, incluida la fecha y hora actuales:

```php
$invoices = DB::table('invoices')
    ->whereNowOrPast('due_at')
    ->get();

$invoices = DB::table('invoices')
    ->whereNowOrFuture('due_at')
    ->get();
```

Los métodos `whereToday`, `whereBeforeToday` y `whereAfterToday` se pueden utilizar para determinar si el valor de una columna es hoy, antes de hoy o después de hoy, respectivamente:

```php
$invoices = DB::table('invoices')
    ->whereToday('due_at')
    ->get();

$invoices = DB::table('invoices')
    ->whereBeforeToday('due_at')
    ->get();

$invoices = DB::table('invoices')
    ->whereAfterToday('due_at')
    ->get();
```

De manera similar, los métodos `whereTodayOrBefore` y `whereTodayOrAfter` se pueden usar para determinar si el valor de una columna es anterior o posterior a hoy, incluida la fecha de hoy:

```php
$invoices = DB::table('invoices')
    ->whereTodayOrBefore('due_at')
    ->get();

$invoices = DB::table('invoices')
    ->whereTodayOrAfter('due_at')
    ->get();
```

**dondeColumna / oDóndeColumna**

Se puede utilizar el método `whereColumn` para verificar que dos columnas sean iguales:

```php
$users = DB::table('users')
    ->whereColumn('first_name', 'last_name')
    ->get();
```

También puedes pasar un operador de comparación al método `whereColumn`:

```php
$users = DB::table('users')
    ->whereColumn('updated_at', '>', 'created_at')
    ->get();
```

También puede pasar una serie de comparaciones de columnas al método `whereColumn`. Estas condiciones se unirán mediante el operador `and`:

```php
$users = DB::table('users')
    ->whereColumn([
        ['first_name', '=', 'last_name'],
        ['updated_at', '>', 'created_at'],
    ])->get();
```

<a id="logical-grouping"></a>
### Agrupación lógica

A veces es posible que necesite agrupar varias cláusulas "dónde" entre paréntesis para lograr la agrupación lógica deseada de su consulta. De hecho, generalmente siempre debe agrupar las llamadas al método `orWhere` entre paréntesis para evitar un comportamiento de consulta inesperado. Para lograr esto, puede pasar una función anónima al método `where`:

```php
$users = DB::table('users')
    ->where('name', '=', 'John')
    ->where(function (Builder $query) {
        $query->where('votes', '>', 100)
            ->orWhere('title', '=', 'Admin');
    })
    ->get();
```

Como puede ver, pasar una función anónima al método `where` le indica al generador de consultas que comience un grupo de restricciones. La función anónima recibirá una instancia del generador de consultas que puede usar para establecer las restricciones que deben estar contenidas dentro del grupo de paréntesis. El ejemplo anterior producirá el siguiente SQL:

```sql
select * from users where name = 'John' and (votes > 100 or title = 'Admin')
```

> **Advertencia:**
> Siempre debe agrupar las llamadas `orWhere` para evitar comportamientos inesperados cuando se aplican alcances globales.

<a id="advanced-where-clauses"></a>
## Cláusulas Where avanzadas

<a id="where-exists-clauses"></a>
### Cláusulas donde existen

El método `whereExists` le permite escribir cláusulas SQL "donde existen". El método `whereExists` acepta una función anónima que recibirá una instancia del generador de consultas, lo que le permitirá definir la consulta que debe colocarse dentro de la cláusula "exists":

```php
$users = DB::table('users')
    ->whereExists(function (Builder $query) {
        $query->select(DB::raw(1))
            ->from('orders')
            ->whereColumn('orders.user_id', 'users.id');
    })
    ->get();
```

Alternativamente, puede proporcionar un objeto de consulta al método `whereExists` en lugar de una función anónima:

```php
$orders = DB::table('orders')
    ->select(DB::raw(1))
    ->whereColumn('orders.user_id', 'users.id');

$users = DB::table('users')
    ->whereExists($orders)
    ->get();
```

Los dos ejemplos anteriores producirán el siguiente SQL:

```sql
select * from users
where exists (
    select 1
    from orders
    where orders.user_id = users.id
)
```

<a id="subquery-where-clauses"></a>
### Subconsulta Cláusulas Where

A veces es posible que necesites construir una cláusula "dónde" que compare los resultados de una subconsulta con un valor determinado. Puede lograr esto pasando una función anónima y un valor al método `where`. Por ejemplo, la siguiente consulta recuperará todos los usuarios que tengan una "membresía" reciente de un tipo determinado;

```php
use App\Models\User;
use Illuminate\Database\Query\Builder;

$users = User::where(function (Builder $query) {
    $query->select('type')
        ->from('membership')
        ->whereColumn('membership.user_id', 'users.id')
        ->orderByDesc('membership.start_date')
        ->limit(1);
}, 'Pro')->get();
```

O bien, es posible que necesite crear una cláusula "dónde" que compare una columna con los resultados de una subconsulta. Puede lograr esto pasando una columna, un operador y una función anónima al método `where`. Por ejemplo, la siguiente consulta recuperará todos los registros de ingresos donde el monto sea menor que el promedio;

```php
use App\Models\Income;
use Illuminate\Database\Query\Builder;

$incomes = Income::where('amount', '<', function (Builder $query) {
    $query->selectRaw('avg(i.amount)')->from('incomes as i');
})->get();
```

<a id="full-text-where-clauses"></a>
### Texto completo de las cláusulas Where

> **Advertencia:**
> Texto completo donde las cláusulas son actualmente compatibles con MariaDB, MySQL y PostgreSQL.

Los métodos `whereFullText` y `orWhereFullText` se pueden usar para agregar cláusulas "dónde" de texto completo a una consulta para columnas que tienen [índices de texto completo](../migrations/#available-index-types). Laravel transformará estos métodos en el SQL apropiado para el sistema de base de datos subyacente. Por ejemplo, se generará una cláusula `MATCH AGAINST` para aplicaciones que utilicen MariaDB o MySQL:

```php
$users = DB::table('users')
    ->whereFullText('bio', 'web developer')
    ->get();
```

<a id="vector-similarity-clauses"></a>
### Cláusulas de similitud de vectores

> **Nota:**
> Actualmente, las cláusulas de similitud de vectores se admiten en conexiones PostgreSQL que utilizan la extensión `pgvector` y MariaDB 11.7 o posterior. Para obtener información sobre la definición de índices y columnas vectoriales, consulte la [documentación de migración](../migrations/#available-column-types).

El método `whereVectorSimilarTo` filtra los resultados por similitud de coseno con un vector determinado y ordena los resultados por relevancia. El umbral `minSimilarity` debe ser un valor entre `0.0` y `1.0`, donde `1.0` es idéntico:

```php
$documents = DB::table('documents')
    ->whereVectorSimilarTo('embedding', $queryEmbedding, minSimilarity: 0.4)
    ->limit(10)
    ->get();
```

Cuando se proporciona una cadena simple como argumento vectorial, Laravel generará automáticamente incrustaciones usando [Laravel AI SDK](../ai-sdk/#embeddings):

```php
$documents = DB::table('documents')
    ->whereVectorSimilarTo('embedding', 'Best wineries in Napa Valley')
    ->limit(10)
    ->get();
```

De forma predeterminada, `whereVectorSimilarTo` también ordena los resultados por distancia (los más similares primero). Puede desactivar este orden pasando `false` como argumento `order`:

```php
$documents = DB::table('documents')
    ->whereVectorSimilarTo('embedding', $queryEmbedding, minSimilarity: 0.4, order: false)
    ->orderBy('created_at', 'desc')
    ->limit(10)
    ->get();
```

Si necesita más control, puede utilizar los métodos `selectVectorDistance`, `whereVectorDistanceLessThan` y `orderByVectorDistance` de forma independiente:

```php
$documents = DB::table('documents')
    ->select('*')
    ->selectVectorDistance('embedding', $queryEmbedding, as: 'distance')
    ->whereVectorDistanceLessThan('embedding', $queryEmbedding, maxDistance: 0.3)
    ->orderByVectorDistance('embedding', $queryEmbedding)
    ->limit(10)
    ->get();
```

Cuando se utiliza PostgreSQL, se debe cargar la extensión `pgvector` antes de poder crear las columnas `vector`:

```php
Schema::ensureVectorExtensionExists();
```

<a id="ordering-grouping-limit-and-offset"></a>
## Ordenar, agrupar, limitar y compensar

<a id="ordering"></a>
### Realizar pedidos

<a id="orderby"></a>
#### El método `orderBy`

El método `orderBy` le permite ordenar los resultados de la consulta por una columna determinada. El primer argumento aceptado por el método `orderBy` debe ser la columna por la que desea ordenar, mientras que el segundo argumento determina la dirección de la clasificación y puede ser `asc` o `desc`:

```php
$users = DB::table('users')
    ->orderBy('name', 'desc')
    ->get();
```

Para ordenar por múltiples columnas, simplemente puede invocar `orderBy` tantas veces como sea necesario:

```php
$users = DB::table('users')
    ->orderBy('name', 'desc')
    ->orderBy('email', 'asc')
    ->get();
```

La dirección de clasificación es opcional y es ascendente de forma predeterminada. Si desea ordenar en orden descendente, puede especificar el segundo parámetro para el método `orderBy`, o simplemente usar `orderByDesc`:

```php
$users = DB::table('users')
    ->orderByDesc('verified_at')
    ->get();
```

Finalmente, utilizando el operador `->`, los resultados se pueden ordenar por un valor dentro de una columna JSON:

```php
$corporations = DB::table('corporations')
    ->where('country', 'US')
    ->orderBy('location->state')
    ->get();
```

<a id="latest-oldest"></a>
#### Los métodos `latest` y `oldest`

Los métodos `latest` y `oldest` le permiten ordenar fácilmente los resultados por fecha. De forma predeterminada, el resultado se ordenará según la columna `created_at` de la tabla. O puede pasar el nombre de la columna por la que desea ordenar:

```php
$user = DB::table('users')
    ->latest()
    ->first();
```

<a id="random-ordering"></a>
#### Orden aleatorio

El método `inRandomOrder` se puede utilizar para ordenar los resultados de la consulta de forma aleatoria. Por ejemplo, puedes utilizar este método para buscar un usuario aleatorio:

```php
$randomUser = DB::table('users')
    ->inRandomOrder()
    ->first();
```

<a id="removing-existing-orderings"></a>
#### Eliminación de pedidos existentes

El método `reorder` elimina todas las cláusulas "ordenar por" que se han aplicado previamente a la consulta:

```php
$query = DB::table('users')->orderBy('name');

$unorderedUsers = $query->reorder()->get();
```

Puede pasar una columna y una dirección al llamar al método `reorder` para eliminar todas las cláusulas "ordenar por" existentes y aplicar un orden completamente nuevo a la consulta:

```php
$query = DB::table('users')->orderBy('name');

$usersOrderedByEmail = $query->reorder('email', 'desc')->get();
```

Para mayor comodidad, puede utilizar el método `reorderDesc` para reordenar los resultados de la consulta en orden descendente:

```php
$query = DB::table('users')->orderBy('name');

$usersOrderedByEmail = $query->reorderDesc('email')->get();
```

<a id="grouping"></a>
### Agrupación

<a id="groupby-having"></a>
#### Los métodos `groupBy` y `having`

Como es de esperar, los métodos `groupBy` y `having` se pueden utilizar para agrupar los resultados de la consulta. La firma del método `having` es similar a la del método `where`:

```php
$users = DB::table('users')
    ->groupBy('account_id')
    ->having('account_id', '>', 100)
    ->get();
```

Puede utilizar el método `havingBetween` para filtrar los resultados dentro de un rango determinado:

```php
$report = DB::table('orders')
    ->selectRaw('count(id) as number_of_orders, customer_id')
    ->groupBy('customer_id')
    ->havingBetween('number_of_orders', [5, 15])
    ->get();
```

Puede pasar varios argumentos al método `groupBy` para agrupar por varias columnas:

```php
$users = DB::table('users')
    ->groupBy('first_name', 'status')
    ->having('account_id', '>', 100)
    ->get();
```

Para crear declaraciones `having` más avanzadas, consulte el método [havingRaw](#raw-methods).

<a id="limit-and-offset"></a>
### Límite y compensación

Puede utilizar los métodos `limit` y `offset` para limitar la cantidad de resultados devueltos por la consulta o para omitir una cantidad determinada de resultados en la consulta:

```php
$users = DB::table('users')
    ->offset(10)
    ->limit(5)
    ->get();
```

<a id="conditional-clauses"></a>
## Cláusulas condicionales

A veces es posible que desee que se apliquen determinadas cláusulas de consulta a una consulta basada en otra condición. Por ejemplo, es posible que solo desee aplicar una declaración `where` si un valor de entrada determinado está presente en la solicitud HTTP entrante. Puede lograr esto utilizando el método `when`:

```php
$role = $request->input('role');

$users = DB::table('users')
    ->when($role, function (Builder $query, string $role) {
        $query->where('role_id', $role);
    })
    ->get();
```

El método `when` solo ejecuta la función anónima dada cuando el primer argumento es `true`. Si el primer argumento es `false`, no se ejecutará la función anónima. Entonces, en el ejemplo anterior, la función anónima dada al método `when` solo se invocará si el campo `role` está presente en la solicitud entrante y se evalúa como `true`.

Puede pasar otra función anónima como tercer argumento del método `when`. Esta función anónima solo se ejecutará si el primer argumento se evalúa como `false`. Para ilustrar cómo se puede utilizar esta característica, la usaremos para configurar el orden predeterminado de una consulta:

```php
$sortByVotes = $request->boolean('sort_by_votes');

$users = DB::table('users')
    ->when($sortByVotes, function (Builder $query, bool $sortByVotes) {
        $query->orderBy('votes');
    }, function (Builder $query) {
        $query->orderBy('name');
    })
    ->get();
```

<a id="insert-statements"></a>
## Insertar declaraciones

El generador de consultas también proporciona un método `insert` que se puede utilizar para insertar registros en la tabla de la base de datos. El método `insert` acepta una matriz de nombres y valores de columnas:

```php
DB::table('users')->insert([
    'email' => 'kayla@example.com',
    'votes' => 0
]);
```

Puede insertar varios registros a la vez pasando una serie de matrices. Cada matriz representa un registro que debe insertarse en la tabla:

```php
DB::table('users')->insert([
    ['email' => 'picard@example.com', 'votes' => 0],
    ['email' => 'janeway@example.com', 'votes' => 0],
]);
```

El método `insertOrIgnore` ignorará los errores al insertar registros en la base de datos. Al utilizar este método, debe tener en cuenta que se ignorarán los errores de registros duplicados y que también se pueden ignorar otros tipos de errores según el motor de la base de datos. Por ejemplo, `insertOrIgnore` [omitirá el modo estricto de MySQL](https://dev.mysql.com/doc/refman/en/sql-mode.html#ignore-effect-on-execution):

```php
DB::table('users')->insertOrIgnore([
    ['id' => 1, 'email' => 'sisko@example.com'],
    ['id' => 2, 'email' => 'archer@example.com'],
]);
```

El método `insertUsing` insertará nuevos registros en la tabla mientras usa una subconsulta para determinar los datos que se deben insertar:

```php
DB::table('pruned_users')->insertUsing([
    'id', 'name', 'email', 'email_verified_at'
], DB::table('users')->select(
    'id', 'name', 'email', 'email_verified_at'
)->where('updated_at', '<=', now()->minus(months: 1)));
```

<a id="auto-incrementing-ids"></a>
#### ID de incremento automático

Si la tabla tiene una identificación de incremento automático, use el método `insertGetId` para insertar un registro y luego recuperar la identificación:

```php
$id = DB::table('users')->insertGetId(
    ['email' => 'john@example.com', 'votes' => 0]
);
```

> **Advertencia:**
> Cuando se utiliza PostgreSQL, el método `insertGetId` espera que la columna de incremento automático se llame `id`. Si desea recuperar el ID de una "secuencia" diferente, puede pasar el nombre de la columna como segundo parámetro al método `insertGetId`.

<a id="upserts"></a>
### Actualizaciones

El método `upsert` insertará registros que no existen y actualizará los registros que ya existen con nuevos valores que pueda especificar. El primer argumento del método consta de los valores a insertar o actualizar, mientras que el segundo argumento enumera las columnas que identifican de forma única los registros dentro de la tabla asociada. El tercer y último argumento del método es una serie de columnas que deben actualizarse si ya existe un registro coincidente en la base de datos:

```php
DB::table('flights')->upsert(
    [
        ['departure' => 'Oakland', 'destination' => 'San Diego', 'price' => 99],
        ['departure' => 'Chicago', 'destination' => 'New York', 'price' => 150]
    ],
    ['departure', 'destination'],
    ['price']
);
```

En el ejemplo anterior, Laravel intentará insertar dos registros. Si ya existe un registro con los mismos valores de columna `departure` y `destination`, Laravel actualizará la columna `price` de ese registro.

> **Advertencia:**
> Todas las bases de datos, excepto SQL Server, requieren que las columnas del segundo argumento del método `upsert` tengan un índice "primario" o "único". Además, los controladores de bases de datos MariaDB y MySQL ignoran el segundo argumento del método `upsert` y siempre utilizan los índices "primario" y "único" de la tabla para detectar registros existentes.

<a id="update-statements"></a>
## Declaraciones de actualización

Además de insertar registros en la base de datos, el generador de consultas también puede actualizar los registros existentes utilizando el método `update`. El método `update`, al igual que el método `insert`, acepta una matriz de pares de columnas y valores que indican las columnas que se actualizarán. El método `update` devuelve el número de filas afectadas. Puede restringir la consulta `update` utilizando cláusulas `where`:

```php
$affected = DB::table('users')
    ->where('id', 1)
    ->update(['votes' => 1]);
```

<a id="update-or-insert"></a>
#### Actualizar o Insertar

A veces es posible que desee actualizar un registro existente en la base de datos o crearlo si no existe ningún registro coincidente. En este escenario, se puede utilizar el método `updateOrInsert`. El método `updateOrInsert` acepta dos argumentos: una matriz de condiciones mediante las cuales encontrar el registro y una matriz de pares de columnas y valores que indican las columnas que se actualizarán.

El método `updateOrInsert` intentará localizar un registro de base de datos coincidente utilizando los pares de valores y columnas del primer argumento. Si el registro existe, se actualizará con los valores del segundo argumento. Si no se puede encontrar el registro, se insertará un nuevo registro con los atributos combinados de ambos argumentos:

```php
DB::table('users')
    ->updateOrInsert(
        ['email' => 'john@example.com', 'name' => 'John'],
        ['votes' => '2']
    );
```

Puede proporcionar una función anónima al método `updateOrInsert` para personalizar los atributos que se actualizan o insertan en la base de datos en función de la existencia de un registro coincidente:

```php
DB::table('users')->updateOrInsert(
    ['user_id' => $user_id],
    fn ($exists) => $exists ? [
        'name' => $data['name'],
        'email' => $data['email'],
    ] : [
        'name' => $data['name'],
        'email' => $data['email'],
        'marketable' => true,
    ],
);
```

<a id="updating-json-columns"></a>
### Actualización de columnas JSON

Al actualizar una columna JSON, debe utilizar la sintaxis `->` para actualizar la clave adecuada en el objeto JSON. Esta operación es compatible con MariaDB 10.3+, MySQL 5.7+ y PostgreSQL 9.5+:

```php
$affected = DB::table('users')
    ->where('id', 1)
    ->update(['options->enabled' => true]);
```

<a id="increment-and-decrement"></a>
### Incremento y decremento

El generador de consultas también proporciona métodos convenientes para incrementar o disminuir el valor de una columna determinada. Ambos métodos aceptan al menos un argumento: la columna a modificar. Se puede proporcionar un segundo argumento para especificar la cantidad en la que se debe incrementar o disminuir la columna:

```php
DB::table('users')->increment('votes');

DB::table('users')->increment('votes', 5);

DB::table('users')->decrement('votes');

DB::table('users')->decrement('votes', 5);
```

Si es necesario, también puede especificar columnas adicionales para actualizar durante la operación de incremento o decremento:

```php
DB::table('users')->increment('votes', 1, ['name' => 'John']);
```

Además, puede incrementar o disminuir varias columnas a la vez utilizando los métodos `incrementEach` y `decrementEach`:

```php
DB::table('users')->incrementEach([
    'votes' => 5,
    'balance' => 100,
]);
```

<a id="delete-statements"></a>
## Eliminar declaraciones

El método `delete` del generador de consultas se puede utilizar para eliminar registros de la tabla. El método `delete` devuelve el número de filas afectadas. Puede restringir las declaraciones `delete` agregando cláusulas "dónde" antes de llamar al método `delete`:

```php
$deleted = DB::table('users')->delete();

$deleted = DB::table('users')->where('votes', '>', 100)->delete();
```

<a id="pessimistic-locking"></a>
## Bloqueo pesimista

El generador de consultas también incluye algunas funciones para ayudarle a lograr un "bloqueo pesimista" al ejecutar sus declaraciones `select`. Para ejecutar una declaración con un "bloqueo compartido", puede llamar al método `sharedLock`. Un bloqueo compartido evita que las filas seleccionadas se modifiquen hasta que se confirme su transacción:

```php
DB::table('users')
    ->where('votes', '>', 100)
    ->sharedLock()
    ->get();
```

Alternativamente, puede utilizar el método `lockForUpdate`. Un bloqueo "para actualización" evita que los registros seleccionados se modifiquen o se seleccionen con otro bloqueo compartido:

```php
DB::table('users')
    ->where('votes', '>', 100)
    ->lockForUpdate()
    ->get();
```

Si bien no es obligatorio, se recomienda envolver los candados pesimistas dentro de una [transaction](../database/#database-transactions). Esto garantiza que los datos recuperados permanezcan inalterados en la base de datos hasta que se complete toda la operación. En caso de falla, la transacción revertirá cualquier cambio y liberará los bloqueos automáticamente:

```php
DB::transaction(function () {
    $sender = DB::table('users')
        ->lockForUpdate()
        ->find(1);

    $receiver = DB::table('users')
        ->lockForUpdate()
        ->find(2);

    if ($sender->balance < 100) {
        throw new RuntimeException('Balance too low.');
    }

    DB::table('users')
        ->where('id', $sender->id)
        ->update([
            'balance' => $sender->balance - 100
        ]);

    DB::table('users')
        ->where('id', $receiver->id)
        ->update([
            'balance' => $receiver->balance + 100
        ]);
});
```

<a id="reusable-query-components"></a>
## Componentes de consulta reutilizables

Si tiene una lógica de consulta repetida en toda su aplicación, puede extraer la lógica en objetos reutilizables utilizando los métodos `tap` y `pipe` del generador de consultas. Imagine que tiene estas dos consultas diferentes en su aplicación:

```php
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

$destination = $request->query('destination');

DB::table('flights')
    ->when($destination, function (Builder $query, string $destination) {
        $query->where('destination', $destination);
    })
    ->orderByDesc('price')
    ->get();

// ...

$destination = $request->query('destination');

DB::table('flights')
    ->when($destination, function (Builder $query, string $destination) {
        $query->where('destination', $destination);
    })
    ->where('user', $request->user()->id)
    ->orderBy('destination')
    ->get();
```

Es posible que desee extraer el filtrado de destino que es común entre las consultas en un objeto reutilizable:

```php
<?php

namespace App\Scopes;

use Illuminate\Database\Query\Builder;

class DestinationFilter
{
    public function __construct(
        private ?string $destination,
    ) {
        //
    }

    public function __invoke(Builder $query): void
    {
        $query->when($this->destination, function (Builder $query) {
            $query->where('destination', $this->destination);
        });
    }
}
```

Luego, puede utilizar el método `tap` del generador de consultas para aplicar la lógica del objeto a la consulta:

```php
use App\Scopes\DestinationFilter;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

DB::table('flights')
    ->when($destination, function (Builder $query, string $destination) { // [tl! remove]
        $query->where('destination', $destination); // [tl! remove]
    }) // [tl! remove]
    ->tap(new DestinationFilter($destination)) // [tl! add]
    ->orderByDesc('price')
    ->get();

// ...

DB::table('flights')
    ->when($destination, function (Builder $query, string $destination) { // [tl! remove]
        $query->where('destination', $destination); // [tl! remove]
    }) // [tl! remove]
    ->tap(new DestinationFilter($destination)) // [tl! add]
    ->where('user', $request->user()->id)
    ->orderBy('destination')
    ->get();
```

<a id="query-pipes"></a>
#### Canalizaciones de consulta

El método `tap` siempre devolverá el generador de consultas. Si desea extraer un objeto que ejecuta la consulta y devuelve otro valor, puede utilizar el método `pipe` en su lugar.

Considere el siguiente objeto de consulta que contiene lógica [pagination](../pagination/) compartida utilizada en toda una aplicación. A diferencia de `DestinationFilter`, que aplica condiciones de consulta a la consulta, el objeto `Paginate` ejecuta la consulta y devuelve una instancia de paginador:

```php
<?php

namespace App\Scopes;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Query\Builder;

class Paginate
{
    public function __construct(
        private string $sortBy = 'timestamp',
        private string $sortDirection = 'desc',
        private int $perPage = 25,
    ) {
        //
    }

    public function __invoke(Builder $query): LengthAwarePaginator
    {
        return $query->orderBy($this->sortBy, $this->sortDirection)
            ->paginate($this->perPage, pageName: 'p');
    }
}
```

Usando el método `pipe` del generador de consultas, podemos aprovechar este objeto para aplicar nuestra lógica de paginación compartida:

```php
$flights = DB::table('flights')
    ->tap(new DestinationFilter($destination))
    ->pipe(new Paginate);
```

<a id="debugging"></a>
## Depuración

Puede utilizar los métodos `dd` y `dump` mientras crea una consulta para volcar los enlaces de consulta actuales y SQL. El método `dd` mostrará la información de depuración y luego dejará de ejecutar la solicitud. El método `dump` mostrará la información de depuración pero permitirá que la solicitud continúe ejecutándose:

```php
DB::table('users')->where('votes', '>', 100)->dd();

DB::table('users')->where('votes', '>', 100)->dump();
```

Los métodos `dumpRawSql` y `ddRawSql` se pueden invocar en una consulta para volcar el SQL de la consulta con todos los enlaces de parámetros sustituidos correctamente:

```php
DB::table('users')->where('votes', '>', 100)->dumpRawSql();

DB::table('users')->where('votes', '>', 100)->ddRawSql();
```
