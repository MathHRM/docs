---
title: "Funciones auxiliares"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Métodos disponibles](#available-methods)
- [Otras utilidades](#other-utilities)
    - [Medición del rendimiento](#benchmarking)
    - [Fechas y horas](#dates)
    - [Funciones diferidas](#deferred-functions)
    - [Lotería](#lottery)
    - [Canalización](#pipeline)
    - [Pausas](#sleep)
    - [Tiempo fijo](#timebox)
    - [URI](#uri)

<a id="introduction"></a>
## Introducción

Laravel incluye diversas funciones auxiliares globales de PHP. Muchas de estas funciones son utilizadas por el propio framework; sin embargo, puedes usarlas en tus propias aplicaciones si te resultan útiles.

<a id="available-methods"></a>
## Métodos disponibles

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
</style>

<a id="arrays-and-objects-method-list"></a>
### Arrays y objetos

<div class="collection-method-list" markdown="1">

[Arr::accessible](#method-array-accessible)
[Arr::add](#method-array-add)
[Arr::array](#method-array-array)
[Arr::boolean](#method-array-boolean)
[Arr::collapse](#method-array-collapse)
[Arr::crossJoin](#method-array-crossjoin)
[Arr::divide](#method-array-divide)
[Arr::dot](#method-array-dot)
[Arr::every](#method-array-every)
[Arr::except](#method-array-except)
[Arr::exceptValues](#method-array-except-values)
[Arr::exists](#method-array-exists)
[Arr::first](#method-array-first)
[Arr::flatten](#method-array-flatten)
[Arr::float](#method-array-float)
[Arr::forget](#method-array-forget)
[Arr::from](#method-array-from)
[Arr::get](#method-array-get)
[Arr::has](#method-array-has)
[Arr::hasAll](#method-array-hasall)
[Arr::hasAny](#method-array-hasany)
[Arr::integer](#method-array-integer)
[Arr::isAssoc](#method-array-isassoc)
[Arr::isList](#method-array-islist)
[Arr::join](#method-array-join)
[Arr::keyBy](#method-array-keyby)
[Arr::last](#method-array-last)
[Arr::map](#method-array-map)
[Arr::mapSpread](#method-array-map-spread)
[Arr::mapWithKeys](#method-array-map-with-keys)
[Arr::only](#method-array-only)
[Arr::onlyValues](#method-array-only-values)
[Arr::partition](#method-array-partition)
[Arr::pluck](#method-array-pluck)
[Arr::prepend](#method-array-prepend)
[Arr::prependKeysWith](#method-array-prependkeyswith)
[Arr::pull](#method-array-pull)
[Arr::push](#method-array-push)
[Arr::query](#method-array-query)
[Arr::random](#method-array-random)
[Arr::reject](#method-array-reject)
[Arr::select](#method-array-select)
[Arr::set](#method-array-set)
[Arr::shuffle](#method-array-shuffle)
[Arr::sole](#method-array-sole)
[Arr::some](#method-array-some)
[Arr::sort](#method-array-sort)
[Arr::sortDesc](#method-array-sort-desc)
[Arr::sortRecursive](#method-array-sort-recursive)
[Arr::string](#method-array-string)
[Arr::take](#method-array-take)
[Arr::toCssClasses](#method-array-to-css-classes)
[Arr::toCssStyles](#method-array-to-css-styles)
[Arr::undot](#method-array-undot)
[Arr::where](#method-array-where)
[Arr::whereNotNull](#method-array-where-not-null)
[Arr::wrap](#method-array-wrap)
[data_fill](#method-data-fill)
[data_get](#method-data-get)
[data_set](#method-data-set)
[data_forget](#method-data-forget)
[head](#method-head)
[last](#method-last)
</div>

<a id="numbers-method-list"></a>
### Números

<div class="collection-method-list" markdown="1">

[Number::abbreviate](#method-number-abbreviate)
[Number::clamp](#method-number-clamp)
[Number::currency](#method-number-currency)
[Number::defaultCurrency](#method-default-currency)
[Number::defaultLocale](#method-default-locale)
[Number::fileSize](#method-number-file-size)
[Number::forHumans](#method-number-for-humans)
[Number::format](#method-number-format)
[Number::ordinal](#method-number-ordinal)
[Number::pairs](#method-number-pairs)
[Number::parse](#method-number-parse)
[Number::parseInt](#method-number-parse-int)
[Number::parseFloat](#method-number-parse-float)
[Number::percentage](#method-number-percentage)
[Number::spell](#method-number-spell)
[Number::spellOrdinal](#method-number-spell-ordinal)
[Number::trim](#method-number-trim)
[Number::useLocale](#method-number-use-locale)
[Number::withLocale](#method-number-with-locale)
[Number::useCurrency](#method-number-use-currency)
[Number::withCurrency](#method-number-with-currency)

</div>

<a id="paths-method-list"></a>
### Rutas de archivos

<div class="collection-method-list" markdown="1">

[app_path](#method-app-path)
[base_path](#method-base-path)
[config_path](#method-config-path)
[database_path](#method-database-path)
[lang_path](#method-lang-path)
[public_path](#method-public-path)
[resource_path](#method-resource-path)
[storage_path](#method-storage-path)

</div>

<a id="urls-method-list"></a>
### URLs

<div class="collection-method-list" markdown="1">

[action](#method-action)
[asset](#method-asset)
[route](#method-route)
[secure_asset](#method-secure-asset)
[secure_url](#method-secure-url)
[to_action](#method-to-action)
[to_route](#method-to-route)
[uri](#method-uri)
[url](#method-url)

</div>

<a id="miscellaneous-method-list"></a>
### Otras funciones

<div class="collection-method-list" markdown="1">

[abort](#method-abort)
[abort_if](#method-abort-if)
[abort_unless](#method-abort-unless)
[app](#method-app)
[auth](#method-auth)
[back](#method-back)
[bcrypt](#method-bcrypt)
[blank](#method-blank)
[broadcast](#method-broadcast)
[broadcast_if](#method-broadcast-if)
[broadcast_unless](#method-broadcast-unless)
[cache](#method-cache)
[class_uses_recursive](#method-class-uses-recursive)
[collect](#method-collect)
[config](#method-config)
[context](#method-context)
[cookie](#method-cookie)
[csrf_field](#method-csrf-field)
[csrf_token](#method-csrf-token)
[decrypt](#method-decrypt)
[dd](#method-dd)
[dispatch](#method-dispatch)
[dispatch_sync](#method-dispatch-sync)
[dump](#method-dump)
[encrypt](#method-encrypt)
[env](#method-env)
[event](#method-event)
[fake](#method-fake)
[filled](#method-filled)
[info](#method-info)
[literal](#method-literal)
[logger](#method-logger)
[method_field](#method-method-field)
[now](#method-now)
[old](#method-old)
[once](#method-once)
[optional](#method-optional)
[policy](#method-policy)
[redirect](#method-redirect)
[report](#method-report)
[report_if](#method-report-if)
[report_unless](#method-report-unless)
[request](#method-request)
[rescue](#method-rescue)
[resolve](#method-resolve)
[response](#method-response)
[retry](#method-retry)
[session](#method-session)
[tap](#method-tap)
[throw_if](#method-throw-if)
[throw_unless](#method-throw-unless)
[today](#method-today)
[trait_uses_recursive](#method-trait-uses-recursive)
[transform](#method-transform)
[validator](#method-validator)
[value](#method-value)
[view](#method-view)
[with](#method-with)
[when](#method-when)

</div>

<a id="arrays"></a>
## Arrays y objetos

<a id="method-array-accessible"></a>
#### `Arr::accessible()` {.collection-method .first-collection-method}

El método `Arr::accessible` determina si se puede acceder al valor dado como un array:

```php
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;

$isAccessible = Arr::accessible(['a' => 1, 'b' => 2]);

// true

$isAccessible = Arr::accessible(new Collection);

// true

$isAccessible = Arr::accessible('abc');

// false

$isAccessible = Arr::accessible(new stdClass);

// false
```

<a id="method-array-add"></a>
#### `Arr::add()` {.collection-method}

El método `Arr::add` agrega un par clave / valor a un array si la clave dada aún no existe en el array o está establecida en `null`:

```php
use Illuminate\Support\Arr;

$array = Arr::add(['name' => 'Desk'], 'price', 100);

// ['name' => 'Desk', 'price' => 100]

$array = Arr::add(['name' => 'Desk', 'price' => null], 'price', 100);

// ['name' => 'Desk', 'price' => 100]
```

<a id="method-array-array"></a>
#### `Arr::array()` {.collection-method}

El método `Arr::array` obtiene un valor de un array con varios niveles de anidamiento mediante la notación de puntos (al igual que [Arr::get()](#method-array-get)), pero lanza una excepción `InvalidArgumentException` si el valor solicitado no es un `array`:

```php
use Illuminate\Support\Arr;

$array = ['name' => 'Joe', 'languages' => ['PHP', 'Ruby']];

$value = Arr::array($array, 'languages');

// ['PHP', 'Ruby']

$value = Arr::array($array, 'name');

// throws InvalidArgumentException
```

<a id="method-array-boolean"></a>
#### `Arr::boolean()` {.collection-method}

El método `Arr::boolean` obtiene un valor de un array con varios niveles de anidamiento mediante la notación de puntos (al igual que [Arr::get()](#method-array-get)), pero lanza una excepción `InvalidArgumentException` si el valor solicitado no es un `boolean`:

```php
use Illuminate\Support\Arr;

$array = ['name' => 'Joe', 'available' => true];

$value = Arr::boolean($array, 'available');

// true

$value = Arr::boolean($array, 'name');

// throws InvalidArgumentException
```


<a id="method-array-collapse"></a>
#### `Arr::collapse()` {.collection-method}

El método `Arr::collapse` combina un array de arrays o colecciones en un único array:

```php
use Illuminate\Support\Arr;

$array = Arr::collapse([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);

// [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

<a id="method-array-crossjoin"></a>
#### `Arr::crossJoin()` {.collection-method}

El método `Arr::crossJoin` realiza una unión cruzada de los arrays dados y devuelve un producto cartesiano con todas las permutaciones posibles:

```php
use Illuminate\Support\Arr;

$matrix = Arr::crossJoin([1, 2], ['a', 'b']);

/*
    [
        [1, 'a'],
        [1, 'b'],
        [2, 'a'],
        [2, 'b'],
    ]
*/

$matrix = Arr::crossJoin([1, 2], ['a', 'b'], ['I', 'II']);

/*
    [
        [1, 'a', 'I'],
        [1, 'a', 'II'],
        [1, 'b', 'I'],
        [1, 'b', 'II'],
        [2, 'a', 'I'],
        [2, 'a', 'II'],
        [2, 'b', 'I'],
        [2, 'b', 'II'],
    ]
*/
```

<a id="method-array-divide"></a>
#### `Arr::divide()` {.collection-method}

El método `Arr::divide` devuelve dos arrays: uno con las claves y otro con los valores del array dado:

```php
use Illuminate\Support\Arr;

[$keys, $values] = Arr::divide(['name' => 'Desk']);

// $keys: ['name']

// $values: ['Desk']
```

<a id="method-array-dot"></a>
#### `Arr::dot()` {.collection-method}

El método `Arr::dot` aplana un array multidimensional en un array de un solo nivel que utiliza la notación de puntos para indicar la profundidad:

```php
use Illuminate\Support\Arr;

$array = ['products' => ['desk' => ['price' => 100]]];

$flattened = Arr::dot($array);

// ['products.desk.price' => 100]
```

<a id="method-array-every"></a>
#### `Arr::every()` {.collection-method}

El método `Arr::every` comprueba que todos los valores del array superen una prueba de veracidad dada:

```php
use Illuminate\Support\Arr;

$array = [1, 2, 3];

Arr::every($array, fn ($i) => $i > 0);

// true

Arr::every($array, fn ($i) => $i > 2);

// false
```

<a id="method-array-except"></a>
#### `Arr::except()` {.collection-method}

El método `Arr::except` elimina los pares clave / valor dados de un array:

```php
use Illuminate\Support\Arr;

$array = ['name' => 'Desk', 'price' => 100];

$filtered = Arr::except($array, ['price']);

// ['name' => 'Desk']
```

<a id="method-array-except-values"></a>
#### `Arr::exceptValues()` {.collection-method}

El método `Arr::exceptValues` elimina los valores especificados de un array:

```php
use Illuminate\Support\Arr;

$array = ['foo', 'bar', 'baz', 'qux'];

$filtered = Arr::exceptValues($array, ['foo', 'baz']);

// ['bar', 'qux']
```

También puedes pasar `true` al argumento `strict` para utilizar comparaciones estrictas de tipos al filtrar:

```php
use Illuminate\Support\Arr;

$array = [1, '1', 2, '2'];

$filtered = Arr::exceptValues($array, [1, 2], strict: true);

// ['1', '2']
```

<a id="method-array-exists"></a>
#### `Arr::exists()` {.collection-method}

El método `Arr::exists` comprueba que la clave dada exista en el array proporcionado:

```php
use Illuminate\Support\Arr;

$array = ['name' => 'John Doe', 'age' => 17];

$exists = Arr::exists($array, 'name');

// true

$exists = Arr::exists($array, 'salary');

// false
```

<a id="method-array-first"></a>
#### `Arr::first()` {.collection-method}

El método `Arr::first` devuelve el primer elemento de un array que supere una prueba de veracidad dada:

```php
use Illuminate\Support\Arr;

$array = [100, 200, 300];

$first = Arr::first($array, function (int $value, int $key) {
    return $value >= 150;
});

// 200
```

También puedes pasar un valor predeterminado como tercer parámetro del método. Este valor se devolverá si ningún valor supera la prueba de veracidad:

```php
use Illuminate\Support\Arr;

$first = Arr::first($array, $callback, $default);
```

<a id="method-array-flatten"></a>
#### `Arr::flatten()` {.collection-method}

El método `Arr::flatten` aplana un array multidimensional en un array de un solo nivel:

```php
use Illuminate\Support\Arr;

$array = ['name' => 'Joe', 'languages' => ['PHP', 'Ruby']];

$flattened = Arr::flatten($array);

// ['Joe', 'PHP', 'Ruby']
```

<a id="method-array-float"></a>
#### `Arr::float()` {.collection-method}

El método `Arr::float` obtiene un valor de un array con varios niveles de anidamiento mediante la notación de puntos (al igual que [Arr::get()](#method-array-get)), pero lanza una excepción `InvalidArgumentException` si el valor solicitado no es un `float`:

```php
use Illuminate\Support\Arr;

$array = ['name' => 'Joe', 'balance' => 123.45];

$value = Arr::float($array, 'balance');

// 123.45

$value = Arr::float($array, 'name');

// throws InvalidArgumentException
```

<a id="method-array-forget"></a>
#### `Arr::forget()` {.collection-method}

El método `Arr::forget` elimina los pares clave / valor dados de un array con varios niveles de anidamiento mediante la notación de puntos:

```php
use Illuminate\Support\Arr;

$array = ['products' => ['desk' => ['price' => 100]]];

Arr::forget($array, 'products.desk');

// ['products' => []]
```

<a id="method-array-from"></a>
#### `Arr::from()` {.collection-method}

El método `Arr::from` convierte varios tipos de entrada en un array PHP simple. Admite distintos tipos de entrada, incluidos arrays, objetos y varias interfaces habituales de Laravel, como `Arrayable`, `Enumerable`, `Jsonable` y `JsonSerializable`. Además, gestiona instancias de `Traversable` y `WeakMap`:

```php
use Illuminate\Support\Arr;

Arr::from((object) ['foo' => 'bar']); // ['foo' => 'bar']

class TestJsonableObject implements Jsonable
{
    public function toJson($options = 0)
    {
        return json_encode(['foo' => 'bar']);
    }
}

Arr::from(new TestJsonableObject); // ['foo' => 'bar']
```

<a id="method-array-get"></a>
#### `Arr::get()` {.collection-method}

El método `Arr::get` obtiene un valor de un array con varios niveles de anidamiento mediante la notación de puntos:

```php
use Illuminate\Support\Arr;

$array = ['products' => ['desk' => ['price' => 100]]];

$price = Arr::get($array, 'products.desk.price');

// 100
```

El método `Arr::get` también acepta un valor predeterminado, que se devolverá si la clave especificada no está presente en el array:

```php
use Illuminate\Support\Arr;

$discount = Arr::get($array, 'products.desk.discount', 0);

// 0
```

<a id="method-array-has"></a>
#### `Arr::has()` {.collection-method}

El método `Arr::has` comprueba si uno o varios elementos dados existen en un array mediante la notación de puntos:

```php
use Illuminate\Support\Arr;

$array = ['product' => ['name' => 'Desk', 'price' => 100]];

$contains = Arr::has($array, 'product.name');

// true

$contains = Arr::has($array, ['product.price', 'product.discount']);

// false
```

<a id="method-array-hasall"></a>
#### `Arr::hasAll()` {.collection-method}

El método `Arr::hasAll` determina si todas las claves especificadas existen en el array dado mediante la notación de puntos:

```php
use Illuminate\Support\Arr;

$array = ['name' => 'Taylor', 'language' => 'PHP'];

Arr::hasAll($array, ['name']); // true
Arr::hasAll($array, ['name', 'language']); // true
Arr::hasAll($array, ['name', 'IDE']); // false
```

<a id="method-array-hasany"></a>
#### `Arr::hasAny()` {.collection-method}

El método `Arr::hasAny` comprueba si algún elemento de un conjunto dado existe en un array mediante la notación de puntos:

```php
use Illuminate\Support\Arr;

$array = ['product' => ['name' => 'Desk', 'price' => 100]];

$contains = Arr::hasAny($array, 'product.name');

// true

$contains = Arr::hasAny($array, ['product.name', 'product.discount']);

// true

$contains = Arr::hasAny($array, ['category', 'product.discount']);

// false
```

<a id="method-array-integer"></a>
#### `Arr::integer()` {.collection-method}

El método `Arr::integer` obtiene un valor de un array con varios niveles de anidamiento mediante la notación de puntos (al igual que [Arr::get()](#method-array-get)), pero lanza una excepción `InvalidArgumentException` si el valor solicitado no es un `int`:

```php
use Illuminate\Support\Arr;

$array = ['name' => 'Joe', 'age' => 42];

$value = Arr::integer($array, 'age');

// 42

$value = Arr::integer($array, 'name');

// throws InvalidArgumentException
```

<a id="method-array-isassoc"></a>
#### `Arr::isAssoc()` {.collection-method}

El método `Arr::isAssoc` devuelve `true` si el array dado es asociativo. Un array se considera «asociativo» si no tiene claves numéricas consecutivas que comiencen en cero:

```php
use Illuminate\Support\Arr;

$isAssoc = Arr::isAssoc(['product' => ['name' => 'Desk', 'price' => 100]]);

// true

$isAssoc = Arr::isAssoc([1, 2, 3]);

// false
```

<a id="method-array-islist"></a>
#### `Arr::isList()` {.collection-method}

El método `Arr::isList` devuelve `true` si las claves del array dado son números enteros consecutivos que comienzan en cero:

```php
use Illuminate\Support\Arr;

$isList = Arr::isList(['foo', 'bar', 'baz']);

// true

$isList = Arr::isList(['product' => ['name' => 'Desk', 'price' => 100]]);

// false
```

<a id="method-array-join"></a>
#### `Arr::join()` {.collection-method}

El método `Arr::join` une los elementos de un array con una cadena. Mediante el tercer argumento de este método, también puedes especificar la cadena de unión para el último elemento del array:

```php
use Illuminate\Support\Arr;

$array = ['Tailwind', 'Alpine', 'Laravel', 'Livewire'];

$joined = Arr::join($array, ', ');

// Tailwind, Alpine, Laravel, Livewire

$joined = Arr::join($array, ', ', ', and ');

// Tailwind, Alpine, Laravel, and Livewire
```

<a id="method-array-keyby"></a>
#### `Arr::keyBy()` {.collection-method}

El método `Arr::keyBy` asigna claves al array según la clave dada. Si varios elementos tienen la misma clave, solo el último aparecerá en el nuevo array:

```php
use Illuminate\Support\Arr;

$array = [
    ['product_id' => 'prod-100', 'name' => 'Desk'],
    ['product_id' => 'prod-200', 'name' => 'Chair'],
];

$keyed = Arr::keyBy($array, 'product_id');

/*
    [
        'prod-100' => ['product_id' => 'prod-100', 'name' => 'Desk'],
        'prod-200' => ['product_id' => 'prod-200', 'name' => 'Chair'],
    ]
*/
```

<a id="method-array-last"></a>
#### `Arr::last()` {.collection-method}

El método `Arr::last` devuelve el último elemento de un array que supere una prueba de veracidad dada:

```php
use Illuminate\Support\Arr;

$array = [100, 200, 300, 110];

$last = Arr::last($array, function (int $value, int $key) {
    return $value >= 150;
});

// 300
```

Puedes pasar un valor predeterminado como tercer argumento del método. Este valor se devolverá si ningún valor supera la prueba de veracidad:

```php
use Illuminate\Support\Arr;

$last = Arr::last($array, $callback, $default);
```

<a id="method-array-map"></a>
#### `Arr::map()` {.collection-method}

El método `Arr::map` recorre el array y pasa cada valor y clave a la función de retorno dada. El valor del array se sustituye por el valor devuelto por la función de retorno:

```php
use Illuminate\Support\Arr;

$array = ['first' => 'james', 'last' => 'kirk'];

$mapped = Arr::map($array, function (string $value, string $key) {
    return ucfirst($value);
});

// ['first' => 'James', 'last' => 'Kirk']
```

<a id="method-array-map-spread"></a>
#### `Arr::mapSpread()` {.collection-method}

El método `Arr::mapSpread` recorre el array y pasa cada valor de los elementos anidados a la función anónima dada. Esta puede modificar el elemento y devolverlo, formando así un nuevo array de elementos modificados:

```php
use Illuminate\Support\Arr;

$array = [
    [0, 1],
    [2, 3],
    [4, 5],
    [6, 7],
    [8, 9],
];

$mapped = Arr::mapSpread($array, function (int $even, int $odd) {
    return $even + $odd;
});

/*
    [1, 5, 9, 13, 17]
*/
```

<a id="method-array-map-with-keys"></a>
#### `Arr::mapWithKeys()` {.collection-method}

El método `Arr::mapWithKeys` recorre el array y pasa cada valor a la función de retorno dada. La función de retorno debe devolver un array asociativo que contenga un único par clave / valor:

```php
use Illuminate\Support\Arr;

$array = [
    [
        'name' => 'John',
        'department' => 'Sales',
        'email' => 'john@example.com',
    ],
    [
        'name' => 'Jane',
        'department' => 'Marketing',
        'email' => 'jane@example.com',
    ]
];

$mapped = Arr::mapWithKeys($array, function (array $item, int $key) {
    return [$item['email'] => $item['name']];
});

/*
    [
        'john@example.com' => 'John',
        'jane@example.com' => 'Jane',
    ]
*/
```

<a id="method-array-only"></a>
#### `Arr::only()` {.collection-method}

El método `Arr::only` devuelve únicamente los pares clave / valor especificados del array dado:

```php
use Illuminate\Support\Arr;

$array = ['name' => 'Desk', 'price' => 100, 'orders' => 10];

$slice = Arr::only($array, ['name', 'price']);

// ['name' => 'Desk', 'price' => 100]
```

<a id="method-array-only-values"></a>
#### `Arr::onlyValues()` {.collection-method}

El método `Arr::onlyValues` devuelve únicamente los valores especificados de un array:

```php
use Illuminate\Support\Arr;

$array = ['foo', 'bar', 'baz', 'qux'];

$filtered = Arr::onlyValues($array, ['foo', 'baz']);

// ['foo', 'baz']
```

También puedes pasar `true` al argumento `strict` para utilizar comparaciones estrictas de tipos al filtrar:

```php
use Illuminate\Support\Arr;

$array = [1, '1', 2, '2'];

$filtered = Arr::onlyValues($array, [1, 2], strict: true);

// [1, 2]
```

<a id="method-array-partition"></a>
#### `Arr::partition()` {.collection-method}

El método `Arr::partition` puede combinarse con la desestructuración de arrays de PHP para separar los elementos que superan una prueba de veracidad dada de los que no la superan:

```php
<?php

use Illuminate\Support\Arr;

$numbers = [1, 2, 3, 4, 5, 6];

[$underThree, $equalOrAboveThree] = Arr::partition($numbers, function (int $i) {
    return $i < 3;
});

dump($underThree);

// [1, 2]

dump($equalOrAboveThree);

// [3, 4, 5, 6]
```

<a id="method-array-pluck"></a>
#### `Arr::pluck()` {.collection-method}

El método `Arr::pluck` obtiene todos los valores de una clave dada de un array:

```php
use Illuminate\Support\Arr;

$array = [
    ['developer' => ['id' => 1, 'name' => 'Taylor']],
    ['developer' => ['id' => 2, 'name' => 'Abigail']],
];

$names = Arr::pluck($array, 'developer.name');

// ['Taylor', 'Abigail']
```

También puedes especificar cómo deben asignarse las claves de la lista resultante:

```php
use Illuminate\Support\Arr;

$names = Arr::pluck($array, 'developer.name', 'developer.id');

// [1 => 'Taylor', 2 => 'Abigail']
```

<a id="method-array-prepend"></a>
#### `Arr::prepend()` {.collection-method}

El método `Arr::prepend` agrega un elemento al principio de un array:

```php
use Illuminate\Support\Arr;

$array = ['one', 'two', 'three', 'four'];

$array = Arr::prepend($array, 'zero');

// ['zero', 'one', 'two', 'three', 'four']
```

Si es necesario, puedes especificar la clave que debe utilizarse para el valor:

```php
use Illuminate\Support\Arr;

$array = ['price' => 100];

$array = Arr::prepend($array, 'Desk', 'name');

// ['name' => 'Desk', 'price' => 100]
```

<a id="method-array-prependkeyswith"></a>
#### `Arr::prependKeysWith()` {.collection-method}

El método `Arr::prependKeysWith` antepone el prefijo dado a todos los nombres de clave de un array asociativo:

```php
use Illuminate\Support\Arr;

$array = [
    'name' => 'Desk',
    'price' => 100,
];

$keyed = Arr::prependKeysWith($array, 'product.');

/*
    [
        'product.name' => 'Desk',
        'product.price' => 100,
    ]
*/
```

<a id="method-array-pull"></a>
#### `Arr::pull()` {.collection-method}

El método `Arr::pull` devuelve y elimina un par clave / valor de un array:

```php
use Illuminate\Support\Arr;

$array = ['name' => 'Desk', 'price' => 100];

$name = Arr::pull($array, 'name');

// $name: Desk

// $array: ['price' => 100]
```

Puedes pasar un valor predeterminado como tercer argumento del método. Este valor se devolverá si la clave no existe:

```php
use Illuminate\Support\Arr;

$value = Arr::pull($array, $key, $default);
```

<a id="method-array-push"></a>
#### `Arr::push()` {.collection-method}

El método `Arr::push` agrega un elemento a un array mediante la notación de puntos. Si no existe un array en la clave dada, se creará:

```php
use Illuminate\Support\Arr;

$array = [];

Arr::push($array, 'office.furniture', 'Desk');

// $array: ['office' => ['furniture' => ['Desk']]]
```

<a id="method-array-query"></a>
#### `Arr::query()` {.collection-method}

El método `Arr::query` convierte el array en una cadena de consulta:

```php
use Illuminate\Support\Arr;

$array = [
    'name' => 'Taylor',
    'order' => [
        'column' => 'created_at',
        'direction' => 'desc'
    ]
];

Arr::query($array);

// name=Taylor&order%5Bcolumn%5D=created_at&order%5Bdirection%5D=desc
```

<a id="method-array-random"></a>
#### `Arr::random()` {.collection-method}

El método `Arr::random` devuelve un valor aleatorio de un array:

```php
use Illuminate\Support\Arr;

$array = [1, 2, 3, 4, 5];

$random = Arr::random($array);

// 4 - (retrieved randomly)
```

También puedes especificar la cantidad de elementos que se devolverán como segundo argumento opcional. Ten en cuenta que proporcionar este argumento devolverá un array aunque solo se desee un elemento:

```php
use Illuminate\Support\Arr;

$items = Arr::random($array, 2);

// [2, 5] - (retrieved randomly)
```

<a id="method-array-reject"></a>
#### `Arr::reject()` {.collection-method}

El método `Arr::reject` elimina elementos de un array mediante la función anónima dada:

```php
use Illuminate\Support\Arr;

$array = [100, '200', 300, '400', 500];

$filtered = Arr::reject($array, function (string|int $value, int $key) {
    return is_string($value);
});

// [0 => 100, 2 => 300, 4 => 500]
```

<a id="method-array-select"></a>
#### `Arr::select()` {.collection-method}

El método `Arr::select` selecciona un array de valores de un array:

```php
use Illuminate\Support\Arr;

$array = [
    ['id' => 1, 'name' => 'Desk', 'price' => 200],
    ['id' => 2, 'name' => 'Table', 'price' => 150],
    ['id' => 3, 'name' => 'Chair', 'price' => 300],
];

Arr::select($array, ['name', 'price']);

// [['name' => 'Desk', 'price' => 200], ['name' => 'Table', 'price' => 150], ['name' => 'Chair', 'price' => 300]]
```

<a id="method-array-set"></a>
#### `Arr::set()` {.collection-method}

El método `Arr::set` establece un valor dentro de un array con varios niveles de anidamiento mediante la notación de puntos:

```php
use Illuminate\Support\Arr;

$array = ['products' => ['desk' => ['price' => 100]]];

Arr::set($array, 'products.desk.price', 200);

// ['products' => ['desk' => ['price' => 200]]]
```

<a id="method-array-shuffle"></a>
#### `Arr::shuffle()` {.collection-method}

El método `Arr::shuffle` mezcla aleatoriamente los elementos del array:

```php
use Illuminate\Support\Arr;

$array = Arr::shuffle([1, 2, 3, 4, 5]);

// [3, 2, 5, 1, 4] - (generated randomly)
```

<a id="method-array-sole"></a>
#### `Arr::sole()` {.collection-method}

El método `Arr::sole` obtiene un único valor de un array mediante la función anónima dada. Si más de un valor del array coincide con la prueba de veracidad dada, se lanzará una excepción `Illuminate\Support\MultipleItemsFoundException`. Si ningún valor coincide con la prueba de veracidad, se lanzará una excepción `Illuminate\Support\ItemNotFoundException`:

```php
use Illuminate\Support\Arr;

$array = ['Desk', 'Table', 'Chair'];

$value = Arr::sole($array, fn (string $value) => $value === 'Desk');

// 'Desk'
```

<a id="method-array-some"></a>
#### `Arr::some()` {.collection-method}

El método `Arr::some` comprueba que al menos uno de los valores del array supere una prueba de veracidad dada:

```php
use Illuminate\Support\Arr;

$array = [1, 2, 3];

Arr::some($array, fn ($i) => $i > 2);

// true
```

<a id="method-array-sort"></a>
#### `Arr::sort()` {.collection-method}

El método `Arr::sort` ordena un array por sus valores:

```php
use Illuminate\Support\Arr;

$array = ['Desk', 'Table', 'Chair'];

$sorted = Arr::sort($array);

// ['Chair', 'Desk', 'Table']
```

También puedes ordenar el array según los resultados de una función anónima dada:

```php
use Illuminate\Support\Arr;

$array = [
    ['name' => 'Desk'],
    ['name' => 'Table'],
    ['name' => 'Chair'],
];

$sorted = array_values(Arr::sort($array, function (array $value) {
    return $value['name'];
}));

/*
    [
        ['name' => 'Chair'],
        ['name' => 'Desk'],
        ['name' => 'Table'],
    ]
*/
```

<a id="method-array-sort-desc"></a>
#### `Arr::sortDesc()` {.collection-method}

El método `Arr::sortDesc` ordena un array en orden descendente por sus valores:

```php
use Illuminate\Support\Arr;

$array = ['Desk', 'Table', 'Chair'];

$sorted = Arr::sortDesc($array);

// ['Table', 'Desk', 'Chair']
```

También puedes ordenar el array según los resultados de una función anónima dada:

```php
use Illuminate\Support\Arr;

$array = [
    ['name' => 'Desk'],
    ['name' => 'Table'],
    ['name' => 'Chair'],
];

$sorted = array_values(Arr::sortDesc($array, function (array $value) {
    return $value['name'];
}));

/*
    [
        ['name' => 'Table'],
        ['name' => 'Desk'],
        ['name' => 'Chair'],
    ]
*/
```

<a id="method-array-sort-recursive"></a>
#### `Arr::sortRecursive()` {.collection-method}

El método `Arr::sortRecursive` ordena recursivamente un array mediante la función `sort` para los subarrays con índices numéricos y la función `ksort` para los subarrays asociativos:

```php
use Illuminate\Support\Arr;

$array = [
    ['Roman', 'Taylor', 'Li'],
    ['PHP', 'Ruby', 'JavaScript'],
    ['one' => 1, 'two' => 2, 'three' => 3],
];

$sorted = Arr::sortRecursive($array);

/*
    [
        ['JavaScript', 'PHP', 'Ruby'],
        ['one' => 1, 'three' => 3, 'two' => 2],
        ['Li', 'Roman', 'Taylor'],
    ]
*/
```

Si deseas ordenar los resultados en orden descendente, puedes utilizar el método `Arr::sortRecursiveDesc`.

```php
$sorted = Arr::sortRecursiveDesc($array);
```

<a id="method-array-string"></a>
#### `Arr::string()` {.collection-method}

El método `Arr::string` obtiene un valor de un array con varios niveles de anidamiento mediante la notación de puntos (al igual que [Arr::get()](#method-array-get)), pero lanza una excepción `InvalidArgumentException` si el valor solicitado no es un `string`:

```php
use Illuminate\Support\Arr;

$array = ['name' => 'Joe', 'languages' => ['PHP', 'Ruby']];

$value = Arr::string($array, 'name');

// Joe

$value = Arr::string($array, 'languages');

// throws InvalidArgumentException
```

<a id="method-array-take"></a>
#### `Arr::take()` {.collection-method}

El método `Arr::take` devuelve un nuevo array con la cantidad especificada de elementos:

```php
use Illuminate\Support\Arr;

$array = [0, 1, 2, 3, 4, 5];

$chunk = Arr::take($array, 3);

// [0, 1, 2]
```

También puedes pasar un entero negativo para tomar la cantidad especificada de elementos desde el final del array:

```php
$array = [0, 1, 2, 3, 4, 5];

$chunk = Arr::take($array, -2);

// [4, 5]
```

<a id="method-array-to-css-classes"></a>
#### `Arr::toCssClasses()` {.collection-method}

El método `Arr::toCssClasses` compila condicionalmente una cadena de clases CSS. El método acepta un array de clases donde la clave contiene la clase o las clases que deseas agregar, mientras que el valor es una expresión booleana. Si el elemento del array tiene una clave numérica, siempre se incluirá en la lista de clases renderizada:

```php
use Illuminate\Support\Arr;

$isActive = false;
$hasError = true;

$array = ['p-4', 'font-bold' => $isActive, 'bg-red' => $hasError];

$classes = Arr::toCssClasses($array);

/*
    'p-4 bg-red'
*/
```

<a id="method-array-to-css-styles"></a>
#### `Arr::toCssStyles()` {.collection-method}

El método `Arr::toCssStyles` compila condicionalmente una cadena de estilos CSS. El método acepta un array de declaraciones CSS donde la clave contiene la declaración CSS que deseas agregar, mientras que el valor es una expresión booleana. Si el elemento del array tiene una clave numérica, siempre se incluirá en la cadena de estilos CSS compilada:

```php
use Illuminate\Support\Arr;

$hasColor = true;

$array = ['background-color: blue', 'color: blue' => $hasColor];

$classes = Arr::toCssStyles($array);

/*
    'background-color: blue; color: blue;'
*/
```

Este método permite la funcionalidad de Laravel para [combinar clases con la bolsa de atributos de un componente Blade](../blade/#conditionally-merge-classes), así como la [directiva Blade](../blade/#conditional-classes) `@class`.

<a id="method-array-undot"></a>
#### `Arr::undot()` {.collection-method}

El método `Arr::undot` expande un array unidimensional que utiliza la notación de puntos en un array multidimensional:

```php
use Illuminate\Support\Arr;

$array = [
    'user.name' => 'Kevin Malone',
    'user.occupation' => 'Accountant',
];

$array = Arr::undot($array);

// ['user' => ['name' => 'Kevin Malone', 'occupation' => 'Accountant']]
```

<a id="method-array-where"></a>
#### `Arr::where()` {.collection-method}

El método `Arr::where` filtra un array mediante la función anónima dada:

```php
use Illuminate\Support\Arr;

$array = [100, '200', 300, '400', 500];

$filtered = Arr::where($array, function (string|int $value, int $key) {
    return is_string($value);
});

// [1 => '200', 3 => '400']
```

<a id="method-array-where-not-null"></a>
#### `Arr::whereNotNull()` {.collection-method}

El método `Arr::whereNotNull` elimina todos los valores `null` del array dado:

```php
use Illuminate\Support\Arr;

$array = [0, null];

$filtered = Arr::whereNotNull($array);

// [0 => 0]
```

<a id="method-array-wrap"></a>
#### `Arr::wrap()` {.collection-method}

El método `Arr::wrap` envuelve el valor dado en un array. Si el valor dado ya es un array, se devolverá sin modificaciones:

```php
use Illuminate\Support\Arr;

$string = 'Laravel';

$array = Arr::wrap($string);

// ['Laravel']
```

Si el valor dado es `null`, se devolverá un array vacío:

```php
use Illuminate\Support\Arr;

$array = Arr::wrap(null);

// []
```

<a id="method-data-fill"></a>
#### `data_fill()` {.collection-method}

La función `data_fill` establece un valor faltante dentro de un array u objeto anidado mediante la notación de puntos:

```php
$data = ['products' => ['desk' => ['price' => 100]]];

data_fill($data, 'products.desk.price', 200);

// ['products' => ['desk' => ['price' => 100]]]

data_fill($data, 'products.desk.discount', 10);

// ['products' => ['desk' => ['price' => 100, 'discount' => 10]]]
```

Esta función también acepta asteriscos como comodines y rellenará el destino según corresponda:

```php
$data = [
    'products' => [
        ['name' => 'Desk 1', 'price' => 100],
        ['name' => 'Desk 2'],
    ],
];

data_fill($data, 'products.*.price', 200);

/*
    [
        'products' => [
            ['name' => 'Desk 1', 'price' => 100],
            ['name' => 'Desk 2', 'price' => 200],
        ],
    ]
*/
```

<a id="method-data-get"></a>
#### `data_get()` {.collection-method}

La función `data_get` obtiene un valor de un array u objeto anidado mediante la notación de puntos:

```php
$data = ['products' => ['desk' => ['price' => 100]]];

$price = data_get($data, 'products.desk.price');

// 100
```

La función `data_get` también acepta un valor predeterminado, que se devolverá si no se encuentra la clave especificada:

```php
$discount = data_get($data, 'products.desk.discount', 0);

// 0
```

La función también acepta comodines mediante asteriscos, que pueden apuntar a cualquier clave del array u objeto:

```php
$data = [
    'product-one' => ['name' => 'Desk 1', 'price' => 100],
    'product-two' => ['name' => 'Desk 2', 'price' => 150],
];

data_get($data, '*.name');

// ['Desk 1', 'Desk 2'];
```

Los marcadores `{first}` y `{last}` pueden utilizarse para obtener los primeros o últimos elementos de un array:

```php
$flight = [
    'segments' => [
        ['from' => 'LHR', 'departure' => '9:00', 'to' => 'IST', 'arrival' => '15:00'],
        ['from' => 'IST', 'departure' => '16:00', 'to' => 'PKX', 'arrival' => '20:00'],
    ],
];

data_get($flight, 'segments.{first}.arrival');

// 15:00
```

<a id="method-data-set"></a>
#### `data_set()` {.collection-method}

La función `data_set` establece un valor dentro de un array u objeto anidado mediante la notación de puntos:

```php
$data = ['products' => ['desk' => ['price' => 100]]];

data_set($data, 'products.desk.price', 200);

// ['products' => ['desk' => ['price' => 200]]]
```

Esta función también acepta comodines mediante asteriscos y establecerá los valores en el destino según corresponda:

```php
$data = [
    'products' => [
        ['name' => 'Desk 1', 'price' => 100],
        ['name' => 'Desk 2', 'price' => 150],
    ],
];

data_set($data, 'products.*.price', 200);

/*
    [
        'products' => [
            ['name' => 'Desk 1', 'price' => 200],
            ['name' => 'Desk 2', 'price' => 200],
        ],
    ]
*/
```

De forma predeterminada, se sobrescriben los valores existentes. Si deseas establecer un valor únicamente cuando no exista, puedes pasar `false` como cuarto argumento de la función:

```php
$data = ['products' => ['desk' => ['price' => 100]]];

data_set($data, 'products.desk.price', 200, overwrite: false);

// ['products' => ['desk' => ['price' => 100]]]
```

<a id="method-data-forget"></a>
#### `data_forget()` {.collection-method}

La función `data_forget` elimina un valor dentro de un array u objeto anidado mediante la notación de puntos:

```php
$data = ['products' => ['desk' => ['price' => 100]]];

data_forget($data, 'products.desk.price');

// ['products' => ['desk' => []]]
```

Esta función también acepta comodines mediante asteriscos y eliminará los valores del destino según corresponda:

```php
$data = [
    'products' => [
        ['name' => 'Desk 1', 'price' => 100],
        ['name' => 'Desk 2', 'price' => 150],
    ],
];

data_forget($data, 'products.*.price');

/*
    [
        'products' => [
            ['name' => 'Desk 1'],
            ['name' => 'Desk 2'],
        ],
    ]
*/
```

<a id="method-head"></a>
#### `head()` {.collection-method}

La función `head` devuelve el primer elemento del array dado. Si el array está vacío, se devolverá `false`:

```php
$array = [100, 200, 300];

$first = head($array);

// 100
```

<a id="method-last"></a>
#### `last()` {.collection-method}

La función `last` devuelve el último elemento del array dado. Si el array está vacío, se devolverá `false`:

```php
$array = [100, 200, 300];

$last = last($array);

// 300
```

<a id="numbers"></a>
## Números

<a id="method-number-abbreviate"></a>
#### `Number::abbreviate()` {.collection-method}

El método `Number::abbreviate` devuelve el formato legible del valor numérico proporcionado, con una abreviatura para las unidades:

```php
use Illuminate\Support\Number;

$number = Number::abbreviate(1000);

// 1K

$number = Number::abbreviate(489939);

// 490K

$number = Number::abbreviate(1230000, precision: 2);

// 1.23M
```

<a id="method-number-clamp"></a>
#### `Number::clamp()` {.collection-method}

El método `Number::clamp` garantiza que un número dado permanezca dentro de un rango especificado. Si el número es inferior al mínimo, se devuelve el valor mínimo. Si el número es superior al máximo, se devuelve el valor máximo:

```php
use Illuminate\Support\Number;

$number = Number::clamp(105, min: 10, max: 100);

// 100

$number = Number::clamp(5, min: 10, max: 100);

// 10

$number = Number::clamp(10, min: 10, max: 100);

// 10

$number = Number::clamp(20, min: 10, max: 100);

// 20
```

<a id="method-number-currency"></a>
#### `Number::currency()` {.collection-method}

El método `Number::currency` devuelve la representación monetaria del valor dado como una cadena:

```php
use Illuminate\Support\Number;

$currency = Number::currency(1000);

// $1,000.00

$currency = Number::currency(1000, in: 'EUR');

// €1,000.00

$currency = Number::currency(1000, in: 'EUR', locale: 'de');

// 1.000,00 €

$currency = Number::currency(1000, in: 'EUR', locale: 'de', precision: 0);

// 1.000 €
```

<a id="method-default-currency"></a>
#### `Number::defaultCurrency()` {.collection-method}

El método `Number::defaultCurrency` devuelve la moneda predeterminada que utiliza la clase `Number`:

```php
use Illuminate\Support\Number;

$currency = Number::defaultCurrency();

// USD
```

<a id="method-default-locale"></a>
#### `Number::defaultLocale()` {.collection-method}

El método `Number::defaultLocale` devuelve la configuración regional predeterminada que utiliza la clase `Number`:

```php
use Illuminate\Support\Number;

$locale = Number::defaultLocale();

// en
```

<a id="method-number-file-size"></a>
#### `Number::fileSize()` {.collection-method}

El método `Number::fileSize` devuelve la representación del tamaño de archivo del valor dado en bytes como una cadena:

```php
use Illuminate\Support\Number;

$size = Number::fileSize(1024);

// 1 KB

$size = Number::fileSize(1024 * 1024);

// 1 MB

$size = Number::fileSize(1024, precision: 2);

// 1.00 KB
```

<a id="method-number-for-humans"></a>
#### `Number::forHumans()` {.collection-method}

El método `Number::forHumans` devuelve el formato legible del valor numérico proporcionado:

```php
use Illuminate\Support\Number;

$number = Number::forHumans(1000);

// 1 thousand

$number = Number::forHumans(489939);

// 490 thousand

$number = Number::forHumans(1230000, precision: 2);

// 1.23 million
```

<a id="method-number-format"></a>
#### `Number::format()` {.collection-method}

El método `Number::format` da formato al número dado como una cadena según la configuración regional:

```php
use Illuminate\Support\Number;

$number = Number::format(100000);

// 100,000

$number = Number::format(100000, precision: 2);

// 100,000.00

$number = Number::format(100000.123, maxPrecision: 2);

// 100,000.12

$number = Number::format(100000, locale: 'de');

// 100.000
```

<a id="method-number-ordinal"></a>
#### `Number::ordinal()` {.collection-method}

El método `Number::ordinal` devuelve la representación ordinal de un número:

```php
use Illuminate\Support\Number;

$number = Number::ordinal(1);

// 1st

$number = Number::ordinal(2);

// 2nd

$number = Number::ordinal(21);

// 21st
```

<a id="method-number-pairs"></a>
#### `Number::pairs()` {.collection-method}

El método `Number::pairs` genera un array de pares de números (subrangos) a partir de un rango y un valor de incremento especificados. Este método puede resultar útil para dividir un rango grande de números en subrangos más pequeños y manejables para tareas como la paginación o el procesamiento por lotes. El método `pairs` devuelve un array de arrays, donde cada array interno representa un par (subrango) de números:

```php
use Illuminate\Support\Number;

$result = Number::pairs(25, 10);

// [[0, 9], [10, 19], [20, 25]]

$result = Number::pairs(25, 10, offset: 0);

// [[0, 10], [10, 20], [20, 25]]
```

<a id="method-number-parse"></a>
#### `Number::parse()` {.collection-method}

El método `Number::parse` analiza una cadena numérica localizada mediante `NumberFormatter` de PHP:

```php
use Illuminate\Support\Number;

$result = Number::parse('10,123', locale: 'en');

// 10123.0

$result = Number::parse('10,123', locale: 'fr');

// 10.123
```

<a id="method-number-parse-int"></a>
#### `Number::parseInt()` {.collection-method}

El método `Number::parseInt` convierte una cadena en un entero según la configuración regional especificada:

```php
use Illuminate\Support\Number;

$result = Number::parseInt('10.123');

// (int) 10

$result = Number::parseInt('10,123', locale: 'fr');

// (int) 10
```

<a id="method-number-parse-float"></a>
#### `Number::parseFloat()` {.collection-method}

El método `Number::parseFloat` convierte una cadena en un número de punto flotante según la configuración regional especificada:

```php
use Illuminate\Support\Number;

$result = Number::parseFloat('10');

// (float) 10.0

$result = Number::parseFloat('10', locale: 'fr');

// (float) 10.0
```

<a id="method-number-percentage"></a>
#### `Number::percentage()` {.collection-method}

El método `Number::percentage` devuelve la representación porcentual del valor dado como una cadena:

```php
use Illuminate\Support\Number;

$percentage = Number::percentage(10);

// 10%

$percentage = Number::percentage(10, precision: 2);

// 10.00%

$percentage = Number::percentage(10.123, maxPrecision: 2);

// 10.12%

$percentage = Number::percentage(10, precision: 2, locale: 'de');

// 10,00%
```

<a id="method-number-spell"></a>
#### `Number::spell()` {.collection-method}

El método `Number::spell` transforma el número dado en una cadena de palabras:

```php
use Illuminate\Support\Number;

$number = Number::spell(102);

// one hundred and two

$number = Number::spell(88, locale: 'fr');

// quatre-vingt-huit
```

El argumento `after` permite especificar un valor después del cual todos los números deben escribirse con palabras:

```php
$number = Number::spell(10, after: 10);

// 10

$number = Number::spell(11, after: 10);

// eleven
```

El argumento `until` permite especificar un valor antes del cual todos los números deben escribirse con palabras:

```php
$number = Number::spell(5, until: 10);

// five

$number = Number::spell(10, until: 10);

// 10
```

<a id="method-number-spell-ordinal"></a>
#### `Number::spellOrdinal()` {.collection-method}

El método `Number::spellOrdinal` devuelve la representación ordinal del número como una cadena de palabras:

```php
use Illuminate\Support\Number;

$number = Number::spellOrdinal(1);

// first

$number = Number::spellOrdinal(2);

// second

$number = Number::spellOrdinal(21);

// twenty-first
```

<a id="method-number-trim"></a>
#### `Number::trim()` {.collection-method}

El método `Number::trim` elimina los ceros finales después del punto decimal del número dado:

```php
use Illuminate\Support\Number;

$number = Number::trim(12.0);

// 12

$number = Number::trim(12.30);

// 12.3
```

<a id="method-number-use-locale"></a>
#### `Number::useLocale()` {.collection-method}

El método `Number::useLocale` establece globalmente la configuración regional predeterminada para los números, lo que afecta al formato de los números y las monedas en las invocaciones posteriores de los métodos de la clase `Number`:

```php
use Illuminate\Support\Number;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Number::useLocale('de');
}
```

<a id="method-number-with-locale"></a>
#### `Number::withLocale()` {.collection-method}

El método `Number::withLocale` ejecuta la función anónima dada con la configuración regional especificada y después restaura la configuración regional original una vez que se ha ejecutado la función de retorno:

```php
use Illuminate\Support\Number;

$number = Number::withLocale('de', function () {
    return Number::format(1500);
});
```

<a id="method-number-use-currency"></a>
#### `Number::useCurrency()` {.collection-method}

El método `Number::useCurrency` establece globalmente la moneda predeterminada para los números, lo que afecta al formato de las monedas en las invocaciones posteriores de los métodos de la clase `Number`:

```php
use Illuminate\Support\Number;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Number::useCurrency('GBP');
}
```

<a id="method-number-with-currency"></a>
#### `Number::withCurrency()` {.collection-method}

El método `Number::withCurrency` ejecuta la función anónima dada con la moneda especificada y después restaura la moneda original una vez que se ha ejecutado la función de retorno:

```php
use Illuminate\Support\Number;

$number = Number::withCurrency('GBP', function () {
    // ...
});
```

<a id="paths"></a>
## Rutas de archivos

<a id="method-app-path"></a>
#### `app_path()` {.collection-method}

La función `app_path` devuelve la ruta absoluta al directorio `app` de tu aplicación. También puedes utilizar la función `app_path` para generar una ruta absoluta a un archivo relativo al directorio de la aplicación:

```php
$path = app_path();

$path = app_path('Http/Controllers/Controller.php');
```

<a id="method-base-path"></a>
#### `base_path()` {.collection-method}

La función `base_path` devuelve la ruta absoluta al directorio raíz de tu aplicación. También puedes utilizar la función `base_path` para generar una ruta absoluta a un archivo dado relativo al directorio raíz del proyecto:

```php
$path = base_path();

$path = base_path('vendor/bin');
```

<a id="method-config-path"></a>
#### `config_path()` {.collection-method}

La función `config_path` devuelve la ruta absoluta al directorio `config` de tu aplicación. También puedes utilizar la función `config_path` para generar una ruta absoluta a un archivo dado dentro del directorio de configuración de la aplicación:

```php
$path = config_path();

$path = config_path('app.php');
```

<a id="method-database-path"></a>
#### `database_path()` {.collection-method}

La función `database_path` devuelve la ruta absoluta al directorio `database` de tu aplicación. También puedes utilizar la función `database_path` para generar una ruta absoluta a un archivo dado dentro del directorio de la base de datos:

```php
$path = database_path();

$path = database_path('factories/UserFactory.php');
```

<a id="method-lang-path"></a>
#### `lang_path()` {.collection-method}

La función `lang_path` devuelve la ruta absoluta al directorio `lang` de tu aplicación. También puedes utilizar la función `lang_path` para generar una ruta absoluta a un archivo dado dentro de ese directorio:

```php
$path = lang_path();

$path = lang_path('en/messages.php');
```

> **Nota:**
> De forma predeterminada, la estructura inicial de una aplicación Laravel no incluye el directorio `lang`. Si deseas personalizar los archivos de idioma de Laravel, puedes publicarlos mediante el comando Artisan `lang:publish`.

<a id="method-public-path"></a>
#### `public_path()` {.collection-method}

La función `public_path` devuelve la ruta absoluta al directorio `public` de tu aplicación. También puedes utilizar la función `public_path` para generar una ruta absoluta a un archivo dado dentro del directorio público:

```php
$path = public_path();

$path = public_path('css/app.css');
```

<a id="method-resource-path"></a>
#### `resource_path()` {.collection-method}

La función `resource_path` devuelve la ruta absoluta al directorio `resources` de tu aplicación. También puedes utilizar la función `resource_path` para generar una ruta absoluta a un archivo dado dentro del directorio de recursos:

```php
$path = resource_path();

$path = resource_path('sass/app.scss');
```

<a id="method-storage-path"></a>
#### `storage_path()` {.collection-method}

La función `storage_path` devuelve la ruta absoluta al directorio `storage` de tu aplicación. También puedes utilizar la función `storage_path` para generar una ruta absoluta a un archivo dado dentro del directorio de almacenamiento:

```php
$path = storage_path();

$path = storage_path('app/file.txt');
```

<a id="urls"></a>
## URLs

<a id="method-action"></a>
#### `action()` {.collection-method}

La función `action` genera una URL para la acción de controlador dada:

```php
use App\Http\Controllers\HomeController;

$url = action([HomeController::class, 'index']);
```

Si el método acepta parámetros de ruta, puedes pasarlos como segundo argumento del método:

```php
$url = action([UserController::class, 'profile'], ['id' => 1]);
```

<a id="method-asset"></a>
#### `asset()` {.collection-method}

La función `asset` genera una URL para un recurso utilizando el esquema actual de la solicitud (HTTP o HTTPS):

```php
$url = asset('img/photo.jpg');
```

Puedes configurar el host de las URLs de recursos mediante la variable `ASSET_URL` de tu archivo `.env`. Esto puede resultar útil si alojas tus recursos en un servicio externo como Amazon S3 u otra CDN:

```php
// ASSET_URL=http://example.com/assets

$url = asset('img/photo.jpg'); // http://example.com/assets/img/photo.jpg
```

<a id="method-route"></a>
#### `route()` {.collection-method}

La función `route` genera una URL para una [ruta con nombre](../routing/#named-routes) dada:

```php
$url = route('route.name');
```

Si la ruta acepta parámetros, puedes pasarlos como segundo argumento de la función:

```php
$url = route('route.name', ['id' => 1]);
```

De forma predeterminada, la función `route` genera una URL absoluta. Si deseas generar una URL relativa, puedes pasar `false` como tercer argumento de la función:

```php
$url = route('route.name', ['id' => 1], false);
```

<a id="method-secure-asset"></a>
#### `secure_asset()` {.collection-method}

La función `secure_asset` genera una URL para un recurso mediante HTTPS:

```php
$url = secure_asset('img/photo.jpg');
```

<a id="method-secure-url"></a>
#### `secure_url()` {.collection-method}

La función `secure_url` genera una URL HTTPS absoluta para la ruta dada. Puedes pasar segmentos adicionales de la URL en el segundo argumento de la función:

```php
$url = secure_url('user/profile');

$url = secure_url('user/profile', [1]);
```

<a id="method-to-action"></a>
#### `to_action()` {.collection-method}

La función `to_action` genera una [respuesta HTTP de redirección](../responses/#redirects) para una acción de controlador dada:

```php
use App\Http\Controllers\UserController;

return to_action([UserController::class, 'show'], ['user' => 1]);
```

Si es necesario, puedes pasar el código de estado HTTP que debe asignarse a la redirección y las cabeceras de respuesta adicionales como tercer y cuarto argumento del método `to_action`:

```php
return to_action(
    [UserController::class, 'show'],
    ['user' => 1],
    302,
    ['X-Framework' => 'Laravel']
);
```

<a id="method-to-route"></a>
#### `to_route()` {.collection-method}

La función `to_route` genera una [respuesta HTTP de redirección](../responses/#redirects) para una [ruta con nombre](../routing/#named-routes) dada:

```php
return to_route('users.show', ['user' => 1]);
```

Si es necesario, puedes pasar el código de estado HTTP que debe asignarse a la redirección y las cabeceras de respuesta adicionales como tercer y cuarto argumento del método `to_route`:

```php
return to_route('users.show', ['user' => 1], 302, ['X-Framework' => 'Laravel']);
```

<a id="method-uri"></a>
#### `uri()` {.collection-method}

La función `uri` genera una [instancia URI fluida](#uri) para la URI dada:

```php
$uri = uri('https://example.com')
    ->withPath('/users')
    ->withQuery(['page' => 1]);
```

Si se pasa a la función `uri` un array que contiene un par de controlador y método invocable, la función creará una instancia de `Uri` para la ruta del método del controlador:

```php
use App\Http\Controllers\UserController;

$uri = uri([UserController::class, 'show'], ['user' => $user]);
```

Si el controlador es invocable, puedes proporcionar simplemente el nombre de la clase del controlador:

```php
use App\Http\Controllers\UserIndexController;

$uri = uri(UserIndexController::class);
```

Si el valor dado a la función `uri` coincide con el nombre de una [ruta con nombre](../routing/#named-routes), se generará una instancia de `Uri` para esa ruta:

```php
$uri = uri('users.show', ['user' => $user]);
```

<a id="method-url"></a>
#### `url()` {.collection-method}

La función `url` genera una URL absoluta para la ruta dada:

```php
$url = url('user/profile');

$url = url('user/profile', [1]);
```

Si no se proporciona ninguna ruta, se devuelve una instancia de `Illuminate\Routing\UrlGenerator`:

```php
$current = url()->current();

$full = url()->full();

$previous = url()->previous();
```

Para obtener más información sobre cómo trabajar con la función `url`, consulta la [documentación sobre generación de URLs](../urls/#generating-urls).

<a id="miscellaneous"></a>
## Otras funciones

<a id="method-abort"></a>
#### `abort()` {.collection-method}

La función `abort` lanza [una excepción HTTP](../errors/#http-exceptions) que será renderizada por el [gestor de excepciones](../errors/#handling-exceptions):

```php
abort(403);
```

También puedes proporcionar el mensaje de la excepción y las cabeceras de respuesta HTTP personalizadas que deben enviarse al navegador:

```php
abort(403, 'Unauthorized.', $headers);
```

<a id="method-abort-if"></a>
#### `abort_if()` {.collection-method}

La función `abort_if` lanza una excepción HTTP si una expresión booleana dada se evalúa como `true`:

```php
abort_if(! Auth::user()->isAdmin(), 403);
```

Al igual que con el método `abort`, también puedes proporcionar el texto de respuesta de la excepción como tercer argumento y un array de cabeceras de respuesta personalizadas como cuarto argumento de la función.

<a id="method-abort-unless"></a>
#### `abort_unless()` {.collection-method}

La función `abort_unless` lanza una excepción HTTP si una expresión booleana dada se evalúa como `false`:

```php
abort_unless(Auth::user()->isAdmin(), 403);
```

Al igual que con el método `abort`, también puedes proporcionar el texto de respuesta de la excepción como tercer argumento y un array de cabeceras de respuesta personalizadas como cuarto argumento de la función.

<a id="method-app"></a>
#### `app()` {.collection-method}

La función `app` devuelve la instancia del [contenedor de servicios](../container/):

```php
$container = app();
```

Puedes pasar el nombre de una clase o interfaz para resolverla desde el contenedor:

```php
$api = app('HelpSpot\API');
```

<a id="method-auth"></a>
#### `auth()` {.collection-method}

La función `auth` devuelve una instancia de [autenticador](../authentication/). Puedes utilizarla como alternativa a la fachada `Auth`:

```php
$user = auth()->user();
```

Si es necesario, puedes especificar a qué instancia de guard deseas acceder:

```php
$user = auth('admin')->user();
```

<a id="method-back"></a>
#### `back()` {.collection-method}

La función `back` genera una [respuesta HTTP de redirección](../responses/#redirects) a la ubicación anterior del usuario:

```php
return back($status = 302, $headers = [], $fallback = '/');

return back();
```

<a id="method-bcrypt"></a>
#### `bcrypt()` {.collection-method}

La función `bcrypt` [calcula el hash](../hashing/) del valor dado mediante Bcrypt. Puedes utilizar esta función como alternativa a la fachada `Hash`:

```php
$password = bcrypt('my-secret-password');
```

<a id="method-blank"></a>
#### `blank()` {.collection-method}

La función `blank` determina si el valor dado está «vacío»:

```php
blank('');
blank('   ');
blank(null);
blank(collect());

// true

blank(0);
blank(true);
blank(false);

// false
```

Para la operación inversa a `blank`, consulta la función [filled](#method-filled).

<a id="method-broadcast"></a>
#### `broadcast()` {.collection-method}

La función `broadcast` [difunde](../broadcasting/) el [evento](../events/) dado a sus listeners:

```php
broadcast(new UserRegistered($user));

broadcast(new UserRegistered($user))->toOthers();
```

<a id="method-broadcast-if"></a>
#### `broadcast_if()` {.collection-method}

La función `broadcast_if` [difunde](../broadcasting/) el [evento](../events/) dado a sus listeners si una expresión booleana dada se evalúa como `true`:

```php
broadcast_if($user->isActive(), new UserRegistered($user));

broadcast_if($user->isActive(), new UserRegistered($user))->toOthers();
```

<a id="method-broadcast-unless"></a>
#### `broadcast_unless()` {.collection-method}

La función `broadcast_unless` [difunde](../broadcasting/) el [evento](../events/) dado a sus listeners si una expresión booleana dada se evalúa como `false`:

```php
broadcast_unless($user->isBanned(), new UserRegistered($user));

broadcast_unless($user->isBanned(), new UserRegistered($user))->toOthers();
```

<a id="method-cache"></a>
#### `cache()` {.collection-method}

La función `cache` puede utilizarse para obtener valores de la [caché](../cache/). Si la clave dada no existe en la caché, se devolverá un valor predeterminado opcional:

```php
$value = cache('key');

$value = cache('key', 'default');
```

Puedes agregar elementos a la caché pasando un array de pares clave / valor a la función. También debes pasar la cantidad de segundos o la duración durante la cual el valor almacenado en caché debe considerarse válido:

```php
cache(['key' => 'value'], 300);

cache(['key' => 'value'], now()->plus(seconds: 10));
```

<a id="method-class-uses-recursive"></a>
#### `class_uses_recursive()` {.collection-method}

La función `class_uses_recursive` devuelve todos los traits utilizados por una clase, incluidos los traits utilizados por todas sus clases padre:

```php
$traits = class_uses_recursive(App\Models\User::class);
```

<a id="method-collect"></a>
#### `collect()` {.collection-method}

La función `collect` crea una instancia de [colección](../collections/) a partir del valor dado:

```php
$collection = collect(['Taylor', 'Abigail']);
```

<a id="method-config"></a>
#### `config()` {.collection-method}

La función `config` obtiene el valor de una variable de [configuración](../configuration/). Puedes acceder a los valores de configuración mediante la sintaxis de puntos, que incluye el nombre del archivo y la opción a la que deseas acceder. También puedes proporcionar un valor predeterminado que se devolverá si la opción de configuración no existe:

```php
$value = config('app.timezone');

$value = config('app.timezone', $default);
```

Puedes establecer variables de configuración durante la ejecución pasando un array de pares clave / valor. Sin embargo, ten en cuenta que esta función solo afecta al valor de configuración para la solicitud actual y no actualiza los valores de configuración reales:

```php
config(['app.debug' => true]);
```

<a id="method-context"></a>
#### `context()` {.collection-method}

La función `context` obtiene el valor del [contexto](../context/) actual. También puedes proporcionar un valor predeterminado que se devolverá si la clave de contexto no existe:

```php
$value = context('trace_id');

$value = context('trace_id', $default);
```

Puedes establecer valores de contexto pasando un array de pares clave / valor:

```php
use Illuminate\Support\Str;

context(['trace_id' => Str::uuid()->toString()]);
```

<a id="method-cookie"></a>
#### `cookie()` {.collection-method}

La función `cookie` crea una nueva instancia de [cookie](../requests/#cookies):

```php
$cookie = cookie('name', 'value', $minutes);
```

<a id="method-csrf-field"></a>
#### `csrf_field()` {.collection-method}

La función `csrf_field` genera un campo de entrada HTML `hidden` que contiene el valor del token CSRF. Por ejemplo, utilizando la [sintaxis de Blade](../blade/):

```blade
{{ csrf_field() }}
```

<a id="method-csrf-token"></a>
#### `csrf_token()` {.collection-method}

La función `csrf_token` obtiene el valor del token CSRF actual:

```php
$token = csrf_token();
```

<a id="method-decrypt"></a>
#### `decrypt()` {.collection-method}

La función `decrypt` [descifra](../encryption/) el valor dado. Puedes utilizar esta función como alternativa a la fachada `Crypt`:

```php
$password = decrypt($value);
```

Para la operación inversa a `decrypt`, consulta la función [encrypt](#method-encrypt).

<a id="method-dd"></a>
#### `dd()` {.collection-method}

La función `dd` muestra el contenido de las variables dadas y finaliza la ejecución del script:

```php
dd($value);

dd($value1, $value2, $value3, ...);
```

Si no deseas detener la ejecución de tu script, utiliza la función [dump](#method-dump).

<a id="method-dispatch"></a>
#### `dispatch()` {.collection-method}

La función `dispatch` agrega el [trabajo](../queues/#creating-jobs) dado a la [cola de trabajos](../queues/) de Laravel:

```php
dispatch(new App\Jobs\SendEmails);
```

<a id="method-dispatch-sync"></a>
#### `dispatch_sync()` {.collection-method}

La función `dispatch_sync` agrega el trabajo dado a la cola [sync](../queues/#synchronous-dispatching) para que se procese inmediatamente:

```php
dispatch_sync(new App\Jobs\SendEmails);
```

<a id="method-dump"></a>
#### `dump()` {.collection-method}

La función `dump` muestra el contenido de las variables dadas:

```php
dump($value);

dump($value1, $value2, $value3, ...);
```

Si deseas detener la ejecución del script después de mostrar las variables, utiliza la función [dd](#method-dd).

<a id="method-encrypt"></a>
#### `encrypt()` {.collection-method}

La función `encrypt` [cifra](../encryption/) el valor dado. Puedes utilizar esta función como alternativa a la fachada `Crypt`:

```php
$secret = encrypt('my-secret-value');
```

Para la operación inversa a `encrypt`, consulta la función [decrypt](#method-decrypt).

<a id="method-env"></a>
#### `env()` {.collection-method}

La función `env` obtiene el valor de una [variable de entorno](../configuration/#environment-configuration) o devuelve un valor predeterminado:

```php
$env = env('APP_ENV');

$env = env('APP_ENV', 'production');
```

> **Advertencia:**
> Si ejecutas el comando `config:cache` durante el proceso de despliegue, debes asegurarte de llamar a la función `env` únicamente desde tus archivos de configuración. Una vez almacenada en caché la configuración, el archivo `.env` no se cargará y todas las llamadas a la función `env` devolverán variables de entorno externas, como las del servidor o del sistema, o `null`.

<a id="method-event"></a>
#### `event()` {.collection-method}

La función `event` despacha el [evento](../events/) dado a sus listeners:

```php
event(new UserRegistered($user));
```

<a id="method-fake"></a>
#### `fake()` {.collection-method}

La función `fake` resuelve una instancia singleton de [Faker](https://github.com/FakerPHP/Faker) desde el contenedor, lo que puede resultar útil al crear datos ficticios en fábricas de modelos, al poblar bases de datos, en pruebas y en prototipos de vistas:

```blade
@for ($i = 0; $i < 10; $i++)
    <dl>
        <dt>Name</dt>
        <dd>{{ fake()->name() }}</dd>

        <dt>Email</dt>
        <dd>{{ fake()->unique()->safeEmail() }}</dd>
    </dl>
@endfor
```

De forma predeterminada, la función `fake` utilizará la opción `app.faker_locale` de tu configuración en `config/app.php`. Normalmente, esta opción se establece mediante la variable de entorno `APP_FAKER_LOCALE`. También puedes especificar la configuración regional pasándola a la función `fake`. Cada configuración regional resolverá un singleton individual:

```php
fake('nl_NL')->name();
```

<a id="method-filled"></a>
#### `filled()` {.collection-method}

La función `filled` determina si el valor dado no está «vacío»:

```php
filled(0);
filled(true);
filled(false);

// true

filled('');
filled('   ');
filled(null);
filled(collect());

// false
```

Para la operación inversa a `filled`, consulta la función [blank](#method-blank).

<a id="method-info"></a>
#### `info()` {.collection-method}

La función `info` escribirá información en el [registro](../logging/) de tu aplicación:

```php
info('Some helpful information!');
```

También puedes pasar un array de datos de contexto a la función:

```php
info('User login attempt failed.', ['id' => $user->id]);
```

<a id="method-literal"></a>
#### `literal()` {.collection-method}

La función `literal` crea una nueva instancia de [stdClass](https://www.php.net/manual/en/class.stdclass.php) con los argumentos con nombre dados como propiedades:

```php
$obj = literal(
    name: 'Joe',
    languages: ['PHP', 'Ruby'],
);

$obj->name; // 'Joe'
$obj->languages; // ['PHP', 'Ruby']
```

<a id="method-logger"></a>
#### `logger()` {.collection-method}

La función `logger` puede utilizarse para escribir un mensaje de nivel `debug` en el [registro](../logging/):

```php
logger('Debug message');
```

También puedes pasar un array de datos de contexto a la función:

```php
logger('User has logged in.', ['id' => $user->id]);
```

Se devolverá una instancia del [registrador](../logging/) si no se pasa ningún valor a la función:

```php
logger()->error('You are not allowed here.');
```

<a id="method-method-field"></a>
#### `method_field()` {.collection-method}

La función `method_field` genera un campo de entrada HTML `hidden` que contiene el valor simulado del verbo HTTP del formulario. Por ejemplo, utilizando la [sintaxis de Blade](../blade/):

```blade
<form method="POST">
    {{ method_field('DELETE') }}
</form>
```

<a id="method-now"></a>
#### `now()` {.collection-method}

La función `now` crea una nueva instancia de `Illuminate\Support\Carbon` para la hora actual:

```php
$now = now();
```

<a id="method-old"></a>
#### `old()` {.collection-method}

La función `old` [obtiene](../requests/#retrieving-input) un valor de [entrada anterior](../requests/#old-input) almacenado temporalmente en la sesión:

```php
$value = old('value');

$value = old('value', 'default');
```

Como el «valor predeterminado» proporcionado como segundo argumento de la función `old` suele ser un atributo de un modelo Eloquent, Laravel permite pasar simplemente el modelo Eloquent completo como segundo argumento de la función `old`. Al hacerlo, Laravel asumirá que el primer argumento proporcionado a la función `old` es el nombre del atributo de Eloquent que debe considerarse el «valor predeterminado»:

```blade
{{ old('name', $user->name) }}

// Is equivalent to...

{{ old('name', $user) }}
```

<a id="method-once"></a>
#### `once()` {.collection-method}

La función `once` ejecuta la función de retorno dada y almacena el resultado en la caché de memoria durante la solicitud. Las llamadas posteriores a la función `once` con la misma función de retorno devolverán el resultado previamente almacenado en caché:

```php
function random(): int
{
    return once(function () {
        return random_int(1, 1000);
    });
}

random(); // 123
random(); // 123 (cached result)
random(); // 123 (cached result)
```

Cuando la función `once` se ejecuta desde una instancia de objeto, el resultado almacenado en caché será exclusivo de esa instancia:

```php
<?php

class NumberService
{
    public function all(): array
    {
        return once(fn () => [1, 2, 3]);
    }
}

$service = new NumberService;

$service->all();
$service->all(); // (cached result)

$secondService = new NumberService;

$secondService->all();
$secondService->all(); // (cached result)
```
<a id="method-optional"></a>
#### `optional()` {.collection-method}

La función `optional` acepta cualquier argumento y permite acceder a propiedades o llamar a métodos de ese objeto. Si el objeto dado es `null`, las propiedades y los métodos devolverán `null` en lugar de provocar un error:

```php
return optional($user->address)->street;

{!! old('name', optional($user)->name) !!}
```

La función `optional` también acepta una función anónima como segundo argumento. La función anónima se invocará si el valor proporcionado como primer argumento no es nulo:

```php
return optional(User::find($id), function (User $user) {
    return $user->name;
});
```

<a id="method-policy"></a>
#### `policy()` {.collection-method}

El método `policy` obtiene una instancia de [política](../authorization/#creating-policies) para una clase dada:

```php
$policy = policy(App\Models\User::class);
```

<a id="method-redirect"></a>
#### `redirect()` {.collection-method}

La función `redirect` devuelve una [respuesta HTTP de redirección](../responses/#redirects), o devuelve la instancia del redireccionador si se llama sin argumentos:

```php
return redirect($to = null, $status = 302, $headers = [], $secure = null);

return redirect('/home');

return redirect()->route('route.name');
```

<a id="method-report"></a>
#### `report()` {.collection-method}

La función `report` notificará una excepción mediante tu [gestor de excepciones](../errors/#handling-exceptions):

```php
report($e);
```

La función `report` también acepta una cadena como argumento. Cuando se proporciona una cadena a la función, esta creará una excepción con la cadena dada como mensaje:

```php
report('Something went wrong.');
```

<a id="method-report-if"></a>
#### `report_if()` {.collection-method}

La función `report_if` notificará una excepción mediante tu [gestor de excepciones](../errors/#handling-exceptions) si una expresión booleana dada se evalúa como `true`:

```php
report_if($shouldReport, $e);

report_if($shouldReport, 'Something went wrong.');
```

<a id="method-report-unless"></a>
#### `report_unless()` {.collection-method}

La función `report_unless` notificará una excepción mediante tu [gestor de excepciones](../errors/#handling-exceptions) si una expresión booleana dada se evalúa como `false`:

```php
report_unless($reportingDisabled, $e);

report_unless($reportingDisabled, 'Something went wrong.');
```

<a id="method-request"></a>
#### `request()` {.collection-method}

La función `request` devuelve la instancia de la [solicitud](../requests/) actual u obtiene el valor de un campo de entrada de la solicitud actual:

```php
$request = request();

$value = request('key', $default);
```

<a id="method-rescue"></a>
#### `rescue()` {.collection-method}

La función `rescue` ejecuta la función anónima dada y captura las excepciones que se produzcan durante su ejecución. Todas las excepciones capturadas se enviarán a tu [gestor de excepciones](../errors/#handling-exceptions); sin embargo, la solicitud continuará procesándose:

```php
return rescue(function () {
    return $this->method();
});
```

También puedes pasar un segundo argumento a la función `rescue`. Este argumento será el valor «predeterminado» que debe devolverse si se produce una excepción al ejecutar la función anónima:

```php
return rescue(function () {
    return $this->method();
}, false);

return rescue(function () {
    return $this->method();
}, function () {
    return $this->failure();
});
```

Puedes proporcionar un argumento `report` a la función `rescue` para determinar si la excepción debe notificarse mediante la función `report`:

```php
return rescue(function () {
    return $this->method();
}, report: function (Throwable $throwable) {
    return $throwable instanceof InvalidArgumentException;
});
```

<a id="method-resolve"></a>
#### `resolve()` {.collection-method}

La función `resolve` resuelve un nombre de clase o interfaz dado en una instancia mediante el [contenedor de servicios](../container/):

```php
$api = resolve('HelpSpot\API');
```

<a id="method-response"></a>
#### `response()` {.collection-method}

La función `response` crea una instancia de [respuesta](../responses/) u obtiene una instancia de la fábrica de respuestas:

```php
return response('Hello World', 200, $headers);

return response()->json(['foo' => 'bar'], 200, $headers);
```

<a id="method-retry"></a>
#### `retry()` {.collection-method}

La función `retry` intenta ejecutar la función de retorno dada hasta alcanzar el límite máximo de intentos especificado. Si la función de retorno no lanza una excepción, se devolverá su valor de retorno. Si lanza una excepción, se volverá a intentar automáticamente. Si se supera la cantidad máxima de intentos, se lanzará la excepción:

```php
return retry(5, function () {
    // Attempt 5 times while resting 100ms between attempts...
}, 100);
```

La duración de la pausa también acepta una instancia de `CarbonInterval`:

```php
use function Illuminate\Support\seconds;

return retry(5, function () {
    // Attempt 5 times while resting 5 seconds between attempts...
}, seconds(5));
```

Si deseas calcular manualmente la cantidad de milisegundos de pausa entre intentos, puedes pasar una función anónima como tercer argumento de la función `retry`:

```php
use Exception;

return retry(5, function () {
    // ...
}, function (int $attempt, Exception $exception) {
    return $attempt * 100;
});
```

Para mayor comodidad, puedes proporcionar un array como primer argumento de la función `retry`. Este array se utilizará para determinar cuántos milisegundos deben transcurrir entre los intentos sucesivos:

```php
return retry([100, 200], function () {
    // Sleep for 100ms on first retry, 200ms on second retry...
});
```

Para reintentar únicamente bajo condiciones específicas, puedes pasar una función anónima como cuarto argumento de la función `retry`:

```php
use App\Exceptions\TemporaryException;
use Exception;

return retry(5, function () {
    // ...
}, 100, function (Exception $exception) {
    return $exception instanceof TemporaryException;
});
```

<a id="method-session"></a>
#### `session()` {.collection-method}

La función `session` puede utilizarse para obtener o establecer valores de [sesión](../session/):

```php
$value = session('key');
```

Puedes establecer valores pasando un array de pares clave / valor a la función:

```php
session(['chairs' => 7, 'instruments' => 3]);
```

Se devolverá el almacén de sesión si no se pasa ningún valor a la función:

```php
$value = session()->get('key');

session()->put('key', $value);
```

<a id="method-tap"></a>
#### `tap()` {.collection-method}

La función `tap` acepta dos argumentos: un `$value` arbitrario y una función anónima. El `$value` se pasará a la función anónima y después será devuelto por la función `tap`. El valor de retorno de la función anónima es irrelevante:

```php
$user = tap(User::first(), function (User $user) {
    $user->name = 'Taylor';

    $user->save();
});
```

Si no se pasa ninguna función anónima a la función `tap`, puedes llamar a cualquier método del `$value` dado. El valor de retorno del método que llames siempre será `$value`, independientemente de lo que el método devuelva realmente en su definición. Por ejemplo, el método `update` de Eloquent normalmente devuelve un entero. Sin embargo, podemos forzar que el método devuelva el propio modelo encadenando la llamada al método `update` mediante la función `tap`:

```php
$user = tap($user)->update([
    'name' => $name,
    'email' => $email,
]);
```

Para agregar un método `tap` a una clase, puedes agregar el trait `Illuminate\Support\Traits\Tappable` a la clase. El método `tap` de este trait acepta una Closure como único argumento. La propia instancia del objeto se pasará a la Closure y después será devuelta por el método `tap`:

```php
return $user->tap(function (User $user) {
    // ...
});
```

<a id="method-throw-if"></a>
#### `throw_if()` {.collection-method}

La función `throw_if` lanza la excepción dada si una expresión booleana dada se evalúa como `true`:

```php
throw_if(! Auth::user()->isAdmin(), AuthorizationException::class);

throw_if(
    ! Auth::user()->isAdmin(),
    AuthorizationException::class,
    'You are not allowed to access this page.'
);
```

<a id="method-throw-unless"></a>
#### `throw_unless()` {.collection-method}

La función `throw_unless` lanza la excepción dada si una expresión booleana dada se evalúa como `false`:

```php
throw_unless(Auth::user()->isAdmin(), AuthorizationException::class);

throw_unless(
    Auth::user()->isAdmin(),
    AuthorizationException::class,
    'You are not allowed to access this page.'
);
```

<a id="method-today"></a>
#### `today()` {.collection-method}

La función `today` crea una nueva instancia de `Illuminate\Support\Carbon` para la fecha actual:

```php
$today = today();
```

<a id="method-trait-uses-recursive"></a>
#### `trait_uses_recursive()` {.collection-method}

La función `trait_uses_recursive` devuelve todos los traits utilizados por un trait:

```php
$traits = trait_uses_recursive(\Illuminate\Notifications\Notifiable::class);
```

<a id="method-transform"></a>
#### `transform()` {.collection-method}

La función `transform` ejecuta una función anónima sobre un valor dado si el valor no está [vacío](#method-blank) y después devuelve el valor de retorno de la función anónima:

```php
$callback = function (int $value) {
    return $value * 2;
};

$result = transform(5, $callback);

// 10
```

Puedes pasar un valor predeterminado o una función anónima como tercer argumento de la función. Este valor se devolverá si el valor dado está vacío:

```php
$result = transform(null, $callback, 'The value is blank');

// The value is blank
```

<a id="method-validator"></a>
#### `validator()` {.collection-method}

La función `validator` crea una nueva instancia de [validador](../validation/) con los argumentos dados. Puedes utilizarla como alternativa a la fachada `Validator`:

```php
$validator = validator($data, $rules, $messages);
```

<a id="method-value"></a>
#### `value()` {.collection-method}

La función `value` devuelve el valor que recibe. Sin embargo, si pasas una función anónima a la función, esta se ejecutará y se devolverá su valor de retorno:

```php
$result = value(true);

// true

$result = value(function () {
    return false;
});

// false
```

Puedes pasar argumentos adicionales a la función `value`. Si el primer argumento es una función anónima, los parámetros adicionales se pasarán a esta como argumentos; de lo contrario, se ignorarán:

```php
$result = value(function (string $name) {
    return $name;
}, 'Taylor');

// 'Taylor'
```

<a id="method-view"></a>
#### `view()` {.collection-method}

La función `view` obtiene una instancia de [vista](../views/):

```php
return view('auth.login');
```

<a id="method-with"></a>
#### `with()` {.collection-method}

La función `with` devuelve el valor que recibe. Si se pasa una función anónima como segundo argumento, esta se ejecutará y se devolverá su valor de retorno:

```php
$callback = function (mixed $value) {
    return is_numeric($value) ? $value * 2 : 0;
};

$result = with(5, $callback);

// 10

$result = with(null, $callback);

// 0

$result = with(5, null);

// 5
```

<a id="method-when"></a>
#### `when()` {.collection-method}

La función `when` devuelve el valor que recibe si una condición dada se evalúa como `true`. En caso contrario, se devuelve `null`. Si se pasa una función anónima como segundo argumento, esta se ejecutará y se devolverá su valor de retorno:

```php
$value = when(true, 'Hello World');

$value = when(true, fn () => 'Hello World');
```

La función `when` resulta útil principalmente para renderizar atributos HTML de forma condicional:

```blade
<div {!! when($condition, 'wire:poll="calculate"') !!}>
    ...
</div>
```

<a id="other-utilities"></a>
## Otras utilidades

<a id="benchmarking"></a>
### Medición del rendimiento

A veces puedes querer comprobar rápidamente el rendimiento de ciertas partes de tu aplicación. En esas ocasiones, puedes utilizar la clase auxiliar `Benchmark` para medir la cantidad de milisegundos que tardan en completarse las funciones de retorno dadas:

```php
<?php

use App\Models\User;
use Illuminate\Support\Benchmark;

Benchmark::dd(fn () => User::find(1)); // 0.1 ms

Benchmark::dd([
    'Scenario 1' => fn () => User::count(), // 0.5 ms
    'Scenario 2' => fn () => User::all()->count(), // 20.0 ms
]);
```

De forma predeterminada, las funciones de retorno dadas se ejecutarán una vez (una iteración) y su duración se mostrará en el navegador o la consola.

Para invocar una función de retorno más de una vez, puedes especificar la cantidad de iteraciones como segundo argumento del método. Al ejecutar una función de retorno más de una vez, la clase `Benchmark` devolverá el promedio de milisegundos que tardó en ejecutarse en todas las iteraciones:

```php
Benchmark::dd(fn () => User::count(), iterations: 10); // 0.5 ms
```

A veces puedes querer medir la ejecución de una función de retorno y seguir obteniendo el valor que devuelve. El método `value` devolverá una tupla que contiene el valor devuelto por la función de retorno y la cantidad de milisegundos que tardó en ejecutarse:

```php
[$count, $duration] = Benchmark::value(fn () => User::count());
```

<a id="dates"></a>
### Fechas y horas

Laravel incluye [Carbon](https://carbon.nesbot.com/guide/getting-started/introduction.html), una potente biblioteca para manipular fechas y horas. Para crear una nueva instancia de `Carbon`, puedes invocar la función `now`. Esta función está disponible globalmente en tu aplicación Laravel:

```php
$now = now();
```

O bien, puedes crear una nueva instancia de `Carbon` mediante la clase `Illuminate\Support\Carbon`:

```php
use Illuminate\Support\Carbon;

$now = Carbon::now();
```

Laravel también amplía las instancias de `Carbon` con los métodos `plus` y `minus`, lo que permite manipular fácilmente la fecha y la hora de la instancia:

```php
return now()->plus(minutes: 5);
return now()->plus(hours: 8);
return now()->plus(weeks: 4);

return now()->minus(minutes: 5);
return now()->minus(hours: 8);
return now()->minus(weeks: 4);
```

Para obtener una explicación detallada de Carbon y sus características, consulta la [documentación oficial de Carbon](https://carbon.nesbot.com/guide/getting-started/introduction.html).

<a id="interval-functions"></a>
#### Funciones de intervalos

Laravel también ofrece las funciones `milliseconds`, `seconds`, `minutes`, `hours`, `days`, `weeks`, `months` y `years`, que devuelven instancias de `CarbonInterval`, las cuales extienden la clase [DateInterval](https://www.php.net/manual/en/class.dateinterval.php) de PHP. Estas funciones pueden utilizarse en cualquier lugar donde Laravel acepte una instancia de `DateInterval`:

```php
use Illuminate\Support\Facades\Cache;

use function Illuminate\Support\{minutes};

Cache::put('metrics', $metrics, minutes(10));
```

<a id="deferred-functions"></a>
### Funciones diferidas

Aunque los [trabajos en cola](../queues/) de Laravel permiten poner tareas en cola para su procesamiento en segundo plano, a veces puedes tener tareas sencillas que deseas diferir sin configurar ni mantener un proceso de trabajo de cola de larga duración.

Las funciones diferidas permiten posponer la ejecución de una función anónima hasta después de que se haya enviado la respuesta HTTP al usuario, manteniendo la sensación de rapidez y fluidez de tu aplicación. Para diferir la ejecución de una función anónima, simplemente pásala a la función `Illuminate\Support\defer`:

```php
use App\Services\Metrics;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use function Illuminate\Support\defer;

Route::post('/orders', function (Request $request) {
    // Create order...

    defer(fn () => Metrics::reportOrder($order));

    return $order;
});
```

De forma predeterminada, las funciones diferidas solo se ejecutarán si la respuesta HTTP, el comando Artisan o el trabajo en cola desde el que se invoca `Illuminate\Support\defer` finaliza correctamente. Esto significa que las funciones diferidas no se ejecutarán si una solicitud produce una respuesta HTTP `4xx` o `5xx`. Si deseas que una función diferida se ejecute siempre, puedes encadenar el método `always` a tu función diferida:

```php
defer(fn () => Metrics::reportOrder($order))->always();
```

> **Advertencia:**
> Si tienes instalada la [extensión Swoole de PHP](https://www.php.net/manual/en/book.swoole.php), la función `defer` de Laravel puede entrar en conflicto con la propia función global `defer` de Swoole y provocar errores del servidor web. Asegúrate de llamar a la función auxiliar `defer` de Laravel especificando explícitamente su espacio de nombres: `use function Illuminate\Support\defer;`

<a id="cancelling-deferred-functions"></a>
#### Cancelación de funciones diferidas

Si necesitas cancelar una función diferida antes de que se ejecute, puedes utilizar el método `forget` para cancelarla por su nombre. Para asignar un nombre a una función diferida, proporciona un segundo argumento a la función `Illuminate\Support\defer`:

```php
defer(fn () => Metrics::report(), 'reportMetrics');

defer()->forget('reportMetrics');
```

<a id="disabling-deferred-functions-in-tests"></a>
#### Desactivación de funciones diferidas en las pruebas

Al escribir pruebas, puede resultar útil desactivar las funciones diferidas. Puedes llamar a `withoutDefer` en tu prueba para indicar a Laravel que invoque inmediatamente todas las funciones diferidas:

```php tab=Pest
test('without defer', function () {
    $this->withoutDefer();

    // ...
});
```

```php tab=PHPUnit
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_without_defer(): void
    {
        $this->withoutDefer();

        // ...
    }
}
```

Si deseas desactivar las funciones diferidas para todas las pruebas de un caso de prueba, puedes llamar al método `withoutDefer` desde el método `setUp` de tu clase base `TestCase`:

```php
<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void// [tl! add:start]
    {
        parent::setUp();

        $this->withoutDefer();
    }// [tl! add:end]
}
```

<a id="lottery"></a>
### Lotería

La clase de lotería de Laravel puede utilizarse para ejecutar funciones de retorno según unas probabilidades dadas. Esto puede resultar especialmente útil cuando solo deseas ejecutar código para un porcentaje de las solicitudes entrantes:

```php
use Illuminate\Support\Lottery;

Lottery::odds(1, 20)
    ->winner(fn () => $user->won())
    ->loser(fn () => $user->lost())
    ->choose();
```

Puedes combinar la clase de lotería de Laravel con otras características de Laravel. Por ejemplo, puedes querer notificar a tu gestor de excepciones solo un pequeño porcentaje de las consultas lentas. Además, como la clase de lotería es invocable, podemos pasar una instancia de la clase a cualquier método que acepte elementos invocables:

```php
use Carbon\CarbonInterval;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Lottery;

DB::whenQueryingForLongerThan(
    CarbonInterval::seconds(2),
    Lottery::odds(1, 100)->winner(fn () => report('Querying > 2 seconds.')),
);
```

<a id="testing-lotteries"></a>
#### Pruebas de loterías

Laravel proporciona algunos métodos sencillos para probar fácilmente las invocaciones de lotería de tu aplicación:

```php
// Lottery will always win...
Lottery::alwaysWin();

// Lottery will always lose...
Lottery::alwaysLose();

// Lottery will win then lose, and finally return to normal behavior...
Lottery::fix([true, false]);

// Lottery will return to normal behavior...
Lottery::determineResultsNormally();
```

<a id="pipeline"></a>
### Canalización

La fachada `Pipeline` de Laravel proporciona una forma práctica de pasar una entrada dada por una serie de clases invocables, funciones anónimas u otros elementos invocables, dando a cada clase la oportunidad de inspeccionar o modificar la entrada e invocar el siguiente elemento de la canalización:

```php
use Closure;
use App\Models\User;
use Illuminate\Support\Facades\Pipeline;

$user = Pipeline::send($user)
    ->through([
        function (User $user, Closure $next) {
            // ...

            return $next($user);
        },
        function (User $user, Closure $next) {
            // ...

            return $next($user);
        },
    ])
    ->then(fn (User $user) => $user);
```

Como puedes ver, cada clase invocable o función anónima de la canalización recibe la entrada y una función anónima `$next`. Al invocar la función anónima `$next`, se invocará el siguiente elemento de la canalización. Como habrás observado, esto es muy similar al [middleware](../middleware/).

Cuando el último elemento invocable de la canalización invoque la función anónima `$next`, se invocará el elemento proporcionado al método `then`. Normalmente, este simplemente devolverá la entrada dada. Para mayor comodidad, si solo deseas devolver la entrada después de que se haya procesado, puedes utilizar el método `thenReturn`.

Por supuesto, como se explicó anteriormente, no estás limitado a proporcionar funciones anónimas a tu canalización. También puedes proporcionar clases invocables. Si se proporciona el nombre de una clase, esta se instanciará mediante el [contenedor de servicios](../container/) de Laravel, lo que permite inyectar dependencias en la clase invocable:

```php
$user = Pipeline::send($user)
    ->through([
        GenerateProfilePhoto::class,
        ActivateSubscription::class,
        SendWelcomeEmail::class,
    ])
    ->thenReturn();
```

Puedes invocar el método `withinTransaction` en la canalización para envolver automáticamente todos sus pasos en una única transacción de base de datos:

```php
$user = Pipeline::send($user)
    ->withinTransaction()
    ->through([
        ProcessOrder::class,
        TransferFunds::class,
        UpdateInventory::class,
    ])
    ->thenReturn();
```

<a id="sleep"></a>
### Pausas

La clase `Sleep` de Laravel es una envoltura ligera de las funciones nativas `sleep` y `usleep` de PHP, que facilita las pruebas y ofrece una API cómoda para trabajar con el tiempo:

```php
use Illuminate\Support\Sleep;

$waiting = true;

while ($waiting) {
    Sleep::for(1)->second();

    $waiting = /* ... */;
}
```

La clase `Sleep` ofrece diversos métodos que permiten trabajar con distintas unidades de tiempo:

```php
// Return a value after sleeping...
$result = Sleep::for(1)->second()->then(fn () => 1 + 1);

// Sleep while a given value is true...
Sleep::for(1)->second()->while(fn () => shouldKeepSleeping());

// Pause execution for 90 seconds...
Sleep::for(1.5)->minutes();

// Pause execution for 2 seconds...
Sleep::for(2)->seconds();

// Pause execution for 500 milliseconds...
Sleep::for(500)->milliseconds();

// Pause execution for 5,000 microseconds...
Sleep::for(5000)->microseconds();

// Pause execution until a given time...
Sleep::until(now()->plus(minutes: 1));

// Alias of PHP's native "sleep" function...
Sleep::sleep(2);

// Alias of PHP's native "usleep" function...
Sleep::usleep(5000);
```

Para combinar fácilmente unidades de tiempo, puedes utilizar el método `and`:

```php
Sleep::for(1)->second()->and(10)->milliseconds();
```

<a id="testing-sleep"></a>
#### Pruebas de pausas

Al probar código que utiliza la clase `Sleep` o las funciones nativas de pausa de PHP, tu prueba pausará la ejecución. Como es de esperar, esto hace que tu conjunto de pruebas sea considerablemente más lento. Por ejemplo, imagina que estás probando el siguiente código:

```php
$waiting = /* ... */;

$seconds = 1;

while ($waiting) {
    Sleep::for($seconds++)->seconds();

    $waiting = /* ... */;
}
```

Normalmente, probar este código tardaría _al menos_ un segundo. Afortunadamente, la clase `Sleep` permite «simular» las pausas para que nuestro conjunto de pruebas siga siendo rápido:

```php tab=Pest
it('waits until ready', function () {
    Sleep::fake();

    // ...
});
```

```php tab=PHPUnit
public function test_it_waits_until_ready()
{
    Sleep::fake();

    // ...
}
```

Al simular la clase `Sleep`, se omite la pausa real de la ejecución, lo que da lugar a una prueba considerablemente más rápida.

Una vez simulada la clase `Sleep`, es posible realizar aserciones sobre las «pausas» esperadas que deberían haberse producido. Para ilustrarlo, imaginemos que estamos probando código que pausa la ejecución tres veces y aumenta cada pausa en un segundo. Mediante el método `assertSequence`, podemos comprobar que nuestro código «pausó» durante el tiempo correcto manteniendo la rapidez de la prueba:

```php tab=Pest
it('checks if ready three times', function () {
    Sleep::fake();

    // ...

    Sleep::assertSequence([
        Sleep::for(1)->second(),
        Sleep::for(2)->seconds(),
        Sleep::for(3)->seconds(),
    ]);
});
```

```php tab=PHPUnit
public function test_it_checks_if_ready_three_times()
{
    Sleep::fake();

    // ...

    Sleep::assertSequence([
        Sleep::for(1)->second(),
        Sleep::for(2)->seconds(),
        Sleep::for(3)->seconds(),
    ]);
}
```

Por supuesto, la clase `Sleep` ofrece otras aserciones que puedes utilizar en tus pruebas:

```php
use Carbon\CarbonInterval as Duration;
use Illuminate\Support\Sleep;

// Assert that sleep was called 3 times...
Sleep::assertSleptTimes(3);

// Assert against the duration of sleep...
Sleep::assertSlept(function (Duration $duration): bool {
    return /* ... */;
}, times: 1);

// Assert that the Sleep class was never invoked...
Sleep::assertNeverSlept();

// Assert that, even if Sleep was called, no execution paused occurred...
Sleep::assertInsomniac();
```

A veces puede resultar útil realizar una acción cada vez que se produzca una pausa simulada. Para lograrlo, puedes proporcionar una función de retorno al método `whenFakingSleep`. En el siguiente ejemplo, utilizamos las [funciones auxiliares de manipulación del tiempo](../mocking/#interacting-with-time) de Laravel para adelantar instantáneamente el tiempo según la duración de cada pausa:

```php
use Carbon\CarbonInterval as Duration;

$this->freezeTime();

Sleep::fake();

Sleep::whenFakingSleep(function (Duration $duration) {
    // Progress time when faking sleep...
    $this->travel($duration->totalMilliseconds)->milliseconds();
});
```

Como adelantar el tiempo es un requisito habitual, el método `fake` acepta un argumento `syncWithCarbon` para mantener Carbon sincronizado al realizar pausas dentro de una prueba:

```php
Sleep::fake(syncWithCarbon: true);

$start = now();

Sleep::for(1)->second();

$start->diffForHumans(); // 1 second ago
```

Laravel utiliza internamente la clase `Sleep` siempre que pausa la ejecución. Por ejemplo, la función auxiliar [retry](#method-retry) utiliza la clase `Sleep` al hacer pausas, lo que facilita las pruebas al utilizar esa función auxiliar.

<a id="timebox"></a>
### Tiempo fijo

La clase `Timebox` de Laravel garantiza que la función de retorno dada siempre tarde una cantidad fija de tiempo en ejecutarse, incluso si su ejecución real termina antes. Esto resulta especialmente útil para operaciones criptográficas y comprobaciones de autenticación de usuarios, donde los atacantes podrían aprovechar las variaciones en el tiempo de ejecución para deducir información confidencial.

Si la ejecución supera la duración fija, `Timebox` no tiene efecto. Corresponde al desarrollador elegir una duración fija suficientemente larga para contemplar los peores escenarios.

El método call acepta una función anónima y un límite de tiempo en microsegundos, después ejecuta la función anónima y espera hasta alcanzar el límite de tiempo:

```php
use Illuminate\Support\Timebox;

(new Timebox)->call(function ($timebox) {
    // ...
}, microseconds: 10000);
```

Si se lanza una excepción dentro de la función anónima, esta clase respetará el retraso definido y volverá a lanzar la excepción después del retraso.

<a id="uri"></a>
### URI

La clase `Uri` de Laravel proporciona una interfaz práctica y fluida para crear y manipular URIs. Esta clase envuelve la funcionalidad proporcionada por el paquete League URI subyacente y se integra perfectamente con el sistema de enrutamiento de Laravel.

Puedes crear fácilmente una instancia de `Uri` mediante métodos estáticos:

```php
use App\Http\Controllers\UserController;
use App\Http\Controllers\InvokableController;
use Illuminate\Support\Uri;

// Generate a URI instance from the given string...
$uri = Uri::of('https://example.com/path');

// Generate URI instances to paths, named routes, or controller actions...
$uri = Uri::to('/dashboard');
$uri = Uri::route('users.show', ['user' => 1]);
$uri = Uri::signedRoute('users.show', ['user' => 1]);
$uri = Uri::temporarySignedRoute('user.index', now()->plus(minutes: 5));
$uri = Uri::action([UserController::class, 'index']);
$uri = Uri::action(InvokableController::class);

// Generate a URI instance from the current request URL...
$uri = $request->uri();
```

Una vez que tengas una instancia de URI, puedes modificarla de forma fluida:

```php
$uri = Uri::of('https://example.com')
    ->withScheme('http')
    ->withHost('test.com')
    ->withPort(8000)
    ->withPath('/users')
    ->withQuery(['page' => 2])
    ->withFragment('section-1');
```

<a id="inspecting-uris"></a>
#### Inspección de URIs

La clase `Uri` también permite inspeccionar fácilmente los distintos componentes de la URI subyacente:

```php
$scheme = $uri->scheme();
$authority = $uri->authority();
$host = $uri->host();
$port = $uri->port();
$path = $uri->path();
$segments = $uri->pathSegments();
$query = $uri->query();
$fragment = $uri->fragment();
```

<a id="manipulating-query-strings"></a>
#### Manipulación de cadenas de consulta

La clase `Uri` ofrece varios métodos que pueden utilizarse para manipular la cadena de consulta de una URI. El método `withQuery` puede utilizarse para combinar parámetros de consulta adicionales con la cadena de consulta existente:

```php
$uri = $uri->withQuery(['sort' => 'name']);
```

El método `withQueryIfMissing` puede utilizarse para combinar parámetros de consulta adicionales con la cadena de consulta existente si las claves dadas aún no existen en ella:

```php
$uri = $uri->withQueryIfMissing(['page' => 1]);
```

El método `replaceQuery` puede utilizarse para sustituir completamente la cadena de consulta existente por una nueva:

```php
$uri = $uri->replaceQuery(['page' => 1]);
```

El método `pushOntoQuery` puede utilizarse para agregar parámetros adicionales a un parámetro de la cadena de consulta cuyo valor sea un array:

```php
$uri = $uri->pushOntoQuery('filter', ['active', 'pending']);
```

El método `withoutQuery` puede utilizarse para eliminar parámetros de la cadena de consulta:

```php
$uri = $uri->withoutQuery(['page']);
```

<a id="generating-responses-from-uris"></a>
#### Generación de respuestas a partir de URIs

El método `redirect` puede utilizarse para generar una instancia de `RedirectResponse` hacia la URI dada:

```php
$uri = Uri::of('https://example.com');

return $uri->redirect();
```

O bien, puedes devolver simplemente la instancia de `Uri` desde una ruta o acción de controlador, lo que generará automáticamente una respuesta de redirección a la URI devuelta:

```php
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Uri;

Route::get('/redirect', function () {
    return Uri::to('/index')
        ->withQuery(['sort' => 'name']);
});
```
