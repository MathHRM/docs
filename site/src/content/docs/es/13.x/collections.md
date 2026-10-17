---
title: "Colecciones"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
    - [Crear colecciones](#creating-collections)
    - [Extender colecciones](#extending-collections)
- [Métodos disponibles](#available-methods)
- [Mensajes de orden superior](#higher-order-messages)
- [Colecciones diferidas](#lazy-collections)
    - [Introducción](#lazy-collection-introduction)
    - [Crear colecciones diferidas](#creating-lazy-collections)
    - [El contrato Enumerable](#the-enumerable-contract)
    - [Métodos de las colecciones diferidas](#lazy-collection-methods)

<a id="introduction"></a>
## Introducción

La clase `Illuminate\Support\Collection` proporciona una envoltura fluida y práctica para trabajar con arrays de datos. Por ejemplo, observa el siguiente código. Usaremos el helper `collect` para crear una nueva instancia de colección a partir del array, ejecutar la función `strtoupper` en cada elemento y eliminar todos los elementos vacíos:

```php
$collection = collect(['Taylor', 'Abigail', null])->map(function (?string $name) {
    return strtoupper($name);
})->reject(function (string $name) {
    return empty($name);
});
```

Como puedes ver, la clase `Collection` permite encadenar sus métodos para transformar y reducir el array subyacente de forma fluida. En general, las colecciones son inmutables, lo que significa que cada método de `Collection` devuelve una instancia de `Collection` completamente nueva.

<a id="creating-collections"></a>
### Crear colecciones

Como se mencionó anteriormente, el helper `collect` devuelve una nueva instancia de `Illuminate\Support\Collection` para el array dado. Por lo tanto, crear una colección es tan sencillo como:

```php
$collection = collect([1, 2, 3]);
```

También puedes crear una colección mediante los métodos [make](#method-make) y [fromJson](#method-fromjson).

> **Nota:**
> Los resultados de las consultas de [Eloquent](../eloquent/) siempre se devuelven como instancias de `Collection`.

<a id="extending-collections"></a>
### Extender colecciones

Las colecciones admiten macros, lo que permite agregar métodos adicionales a la clase `Collection` en tiempo de ejecución. El método `macro` de la clase `Illuminate\Support\Collection` acepta una función anónima que se ejecutará cuando se invoque la macro. La función anónima de la macro puede acceder a los demás métodos de la colección mediante `$this`, como si fuera un método real de la clase de colección. Por ejemplo, el siguiente código agrega un método `toUpper` a la clase `Collection`:

```php
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

Collection::macro('toUpper', function () {
    return $this->map(function (string $value) {
        return Str::upper($value);
    });
});

$collection = collect(['first', 'second']);

$upper = $collection->toUpper();

// ['FIRST', 'SECOND']
```

Por lo general, debes declarar las macros de colección en el método `boot` de un [proveedor de servicios](../providers/).

<a id="macro-arguments"></a>
#### Argumentos de las macros

Si es necesario, puedes definir macros que acepten argumentos adicionales:

```php
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Lang;

Collection::macro('toLocale', function (string $locale) {
    return $this->map(function (string $value) use ($locale) {
        return Lang::get($value, [], $locale);
    });
});

$collection = collect(['first', 'second']);

$translated = $collection->toLocale('es');

// ['primero', 'segundo'];
```

<a id="available-methods"></a>
## Métodos disponibles

En la mayor parte del resto de la documentación de colecciones, explicaremos cada método disponible en la clase `Collection`. Recuerda que todos estos métodos se pueden encadenar para manipular el array subyacente de forma fluida. Además, casi todos los métodos devuelven una nueva instancia de `Collection`, lo que permite conservar la copia original de la colección cuando sea necesario:

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

<div class="collection-method-list" markdown="1">

[after](#method-after)
[all](#method-all)
[average](#method-average)
[avg](#method-avg)
[before](#method-before)
[chunk](#method-chunk)
[chunkBy](#method-chunkby)
[chunkWhile](#method-chunkwhile)
[collapse](#method-collapse)
[collapseWithKeys](#method-collapsewithkeys)
[collect](#method-collect)
[combine](#method-combine)
[concat](#method-concat)
[contains](#method-contains)
[containsStrict](#method-containsstrict)
[count](#method-count)
[countBy](#method-countBy)
[crossJoin](#method-crossjoin)
[dd](#method-dd)
[diff](#method-diff)
[diffAssoc](#method-diffassoc)
[diffAssocUsing](#method-diffassocusing)
[diffKeys](#method-diffkeys)
[doesntContain](#method-doesntcontain)
[doesntContainStrict](#method-doesntcontainstrict)
[dot](#method-dot)
[dump](#method-dump)
[duplicates](#method-duplicates)
[duplicatesStrict](#method-duplicatesstrict)
[each](#method-each)
[eachSpread](#method-eachspread)
[ensure](#method-ensure)
[every](#method-every)
[except](#method-except)
[filter](#method-filter)
[first](#method-first)
[firstOrFail](#method-first-or-fail)
[firstWhere](#method-first-where)
[flatMap](#method-flatmap)
[flatten](#method-flatten)
[flip](#method-flip)
[forget](#method-forget)
[forPage](#method-forpage)
[fromJson](#method-fromjson)
[get](#method-get)
[groupBy](#method-groupby)
[has](#method-has)
[hasAny](#method-hasany)
[hasMany](#method-hasmany)
[hasSole](#method-hassole)
[implode](#method-implode)
[intersect](#method-intersect)
[intersectUsing](#method-intersectusing)
[intersectAssoc](#method-intersectAssoc)
[intersectAssocUsing](#method-intersectassocusing)
[intersectByKeys](#method-intersectbykeys)
[isEmpty](#method-isempty)
[isNotEmpty](#method-isnotempty)
[join](#method-join)
[keyBy](#method-keyby)
[keys](#method-keys)
[last](#method-last)
[lazy](#method-lazy)
[macro](#method-macro)
[make](#method-make)
[map](#method-map)
[mapInto](#method-mapinto)
[mapSpread](#method-mapspread)
[mapToGroups](#method-maptogroups)
[mapWithKeys](#method-mapwithkeys)
[max](#method-max)
[median](#method-median)
[merge](#method-merge)
[mergeRecursive](#method-mergerecursive)
[min](#method-min)
[mode](#method-mode)
[multiply](#method-multiply)
[nth](#method-nth)
[only](#method-only)
[pad](#method-pad)
[partition](#method-partition)
[percentage](#method-percentage)
[pipe](#method-pipe)
[pipeInto](#method-pipeinto)
[pipeThrough](#method-pipethrough)
[pluck](#method-pluck)
[pop](#method-pop)
[prepend](#method-prepend)
[pull](#method-pull)
[push](#method-push)
[put](#method-put)
[random](#method-random)
[range](#method-range)
[reduce](#method-reduce)
[reduceInto](#method-reduce-into)
[reduceSpread](#method-reduce-spread)
[reject](#method-reject)
[replace](#method-replace)
[replaceRecursive](#method-replacerecursive)
[reverse](#method-reverse)
[search](#method-search)
[select](#method-select)
[shift](#method-shift)
[shuffle](#method-shuffle)
[skip](#method-skip)
[skipUntil](#method-skipuntil)
[skipWhile](#method-skipwhile)
[slice](#method-slice)
[sliding](#method-sliding)
[sole](#method-sole)
[some](#method-some)
[sort](#method-sort)
[sortBy](#method-sortby)
[sortByDesc](#method-sortbydesc)
[sortDesc](#method-sortdesc)
[sortKeys](#method-sortkeys)
[sortKeysDesc](#method-sortkeysdesc)
[sortKeysUsing](#method-sortkeysusing)
[splice](#method-splice)
[split](#method-split)
[splitIn](#method-splitin)
[sum](#method-sum)
[take](#method-take)
[takeUntil](#method-takeuntil)
[takeWhile](#method-takewhile)
[tap](#method-tap)
[times](#method-times)
[toArray](#method-toarray)
[toJson](#method-tojson)
[toPrettyJson](#method-to-pretty-json)
[transform](#method-transform)
[undot](#method-undot)
[union](#method-union)
[unique](#method-unique)
[uniqueStrict](#method-uniquestrict)
[unless](#method-unless)
[unlessEmpty](#method-unlessempty)
[unlessNotEmpty](#method-unlessnotempty)
[unwrap](#method-unwrap)
[value](#method-value)
[values](#method-values)
[when](#method-when)
[whenEmpty](#method-whenempty)
[whenNotEmpty](#method-whennotempty)
[where](#method-where)
[whereStrict](#method-wherestrict)
[whereBetween](#method-wherebetween)
[whereIn](#method-wherein)
[whereInStrict](#method-whereinstrict)
[whereInstanceOf](#method-whereinstanceof)
[whereNotBetween](#method-wherenotbetween)
[whereNotIn](#method-wherenotin)
[whereNotInStrict](#method-wherenotinstrict)
[whereNotNull](#method-wherenotnull)
[whereNull](#method-wherenull)
[wrap](#method-wrap)
[zip](#method-zip)

</div>

<a id="method-listing"></a>
## Lista de métodos

<style>
    .collection-method code {
        font-size: 14px;
    }

    .collection-method:not(.first-collection-method) {
        margin-top: 50px;
    }
</style>

<a id="method-after"></a>
#### `after()` {.collection-method .first-collection-method}

El método `after` devuelve el elemento posterior al elemento dado. Devuelve `null` si el elemento dado no se encuentra o es el último elemento:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->after(3);

// 4

$collection->after(5);

// null
```

Este método busca el elemento dado mediante una comparación «flexible», lo que significa que una cadena que contiene un valor entero se considera igual a un entero del mismo valor. Para usar una comparación «estricta», puedes proporcionar el argumento `strict` al método:

```php
collect([2, 4, 6, 8])->after('4', strict: true);

// null
```

Como alternativa, puedes proporcionar tu propia función anónima para buscar el primer elemento que cumpla una condición dada:

```php
collect([2, 4, 6, 8])->after(function (int $item, int $key) {
    return $item > 5;
});

// 8
```

<a id="method-all"></a>
#### `all()` {.collection-method}

El método `all` devuelve el array subyacente representado por la colección:

```php
collect([1, 2, 3])->all();

// [1, 2, 3]
```

<a id="method-average"></a>
#### `average()` {.collection-method}

Alias del método [avg](#method-avg).

<a id="method-avg"></a>
#### `avg()` {.collection-method}

El método `avg` devuelve el [valor promedio](https://en.wikipedia.org/wiki/Average) de una clave dada:

```php
$average = collect([
    ['foo' => 10],
    ['foo' => 10],
    ['foo' => 20],
    ['foo' => 40]
])->avg('foo');

// 20

$average = collect([1, 1, 2, 4])->avg();

// 2
```

<a id="method-before"></a>
#### `before()` {.collection-method}

El método `before` es el opuesto al método [after](#method-after). Devuelve el elemento anterior al elemento dado. Devuelve `null` si el elemento dado no se encuentra o es el primer elemento:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->before(3);

// 2

$collection->before(1);

// null

collect([2, 4, 6, 8])->before('4', strict: true);

// null

collect([2, 4, 6, 8])->before(function (int $item, int $key) {
    return $item > 5;
});

// 4
```

<a id="method-chunk"></a>
#### `chunk()` {.collection-method}

El método `chunk` divide la colección en varias colecciones más pequeñas de un tamaño dado:

```php
$collection = collect([1, 2, 3, 4, 5, 6, 7]);

$chunks = $collection->chunk(4);

$chunks->all();

// [[1, 2, 3, 4], [5, 6, 7]]
```

Este método es especialmente útil en las [vistas](../views/) al trabajar con un sistema de cuadrícula como [Bootstrap](https://getbootstrap.com/docs/5.3/layout/grid/). Por ejemplo, imagina que tienes una colección de modelos de [Eloquent](../eloquent/) que quieres mostrar en una cuadrícula:

```blade
@foreach ($products->chunk(3) as $chunk)
    <div class="row">
        @foreach ($chunk as $product)
            <div class="col-xs-4">{{ $product->name }}</div>
        @endforeach
    </div>
@endforeach
```

<a id="method-chunkby"></a>
#### `chunkBy()` {.collection-method}

El método `chunkBy` divide la colección en varias colecciones más pequeñas agrupando los elementos adyacentes que tienen el mismo valor para una clave o callback dado. Por ejemplo, puedes agrupar productos adyacentes que comparten el mismo padre:

```php
$chunks = $products->chunkBy('parent');
```

A diferencia del método `groupBy`, los elementos con el mismo valor que no son adyacentes se colocan en fragmentos separados:

```php
$collection = collect([1, 1, 2, 2, 1]);

$chunks = $collection->chunkBy(fn (int $value) => $value);

$chunks->all();

// [[1, 1], [2, 2], [1]]
```

<a id="method-chunkwhile"></a>
#### `chunkWhile()` {.collection-method}

El método `chunkWhile` divide la colección en varias colecciones más pequeñas según la evaluación del callback dado. La variable `$chunk` que se pasa a la función anónima se puede usar para inspeccionar el elemento anterior:

```php
$collection = collect(str_split('AABBCCCD'));

$chunks = $collection->chunkWhile(function (string $value, int $key, Collection $chunk) {
    return $value === $chunk->last();
});

$chunks->all();

// [['A', 'A'], ['B', 'B'], ['C', 'C', 'C'], ['D']]
```

<a id="method-collapse"></a>
#### `collapse()` {.collection-method}

El método `collapse` aplana una colección de arrays o colecciones en una sola colección plana:

```php
$collection = collect([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
]);

$collapsed = $collection->collapse();

$collapsed->all();

// [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

<a id="method-collapsewithkeys"></a>
#### `collapseWithKeys()` {.collection-method}

El método `collapseWithKeys` aplana una colección de arrays o colecciones en una sola colección, manteniendo intactas las claves originales. Si la colección ya es plana, devuelve una colección vacía:

```php
$collection = collect([
    ['first'  => collect([1, 2, 3])],
    ['second' => [4, 5, 6]],
    ['third'  => collect([7, 8, 9])]
]);

$collapsed = $collection->collapseWithKeys();

$collapsed->all();

// [
//     'first'  => [1, 2, 3],
//     'second' => [4, 5, 6],
//     'third'  => [7, 8, 9],
// ]
```

<a id="method-collect"></a>
#### `collect()` {.collection-method}

El método `collect` devuelve una nueva instancia de `Collection` con los elementos que están actualmente en la colección:

```php
$collectionA = collect([1, 2, 3]);

$collectionB = $collectionA->collect();

$collectionB->all();

// [1, 2, 3]
```

El método `collect` es útil principalmente para convertir [colecciones diferidas](#lazy-collections) en instancias estándar de `Collection`:

```php
$lazyCollection = LazyCollection::make(function () {
    yield 1;
    yield 2;
    yield 3;
});

$collection = $lazyCollection->collect();

$collection::class;

// 'Illuminate\Support\Collection'

$collection->all();

// [1, 2, 3]
```

> **Nota:**
> El método `collect` es especialmente útil cuando tienes una instancia de `Enumerable` y necesitas una instancia de colección no diferida. Como `collect()` forma parte del contrato `Enumerable`, puedes usarlo con seguridad para obtener una instancia de `Collection`.

<a id="method-combine"></a>
#### `combine()` {.collection-method}

El método `combine` combina los valores de la colección, como claves, con los valores de otro array o colección:

```php
$collection = collect(['name', 'age']);

$combined = $collection->combine(['George', 29]);

$combined->all();

// ['name' => 'George', 'age' => 29]
```

<a id="method-concat"></a>
#### `concat()` {.collection-method}

El método `concat` agrega los valores del array o colección dado al final de otra colección:

```php
$collection = collect(['John Doe']);

$concatenated = $collection->concat(['Jane Doe'])->concat(['name' => 'Johnny Doe']);

$concatenated->all();

// ['John Doe', 'Jane Doe', 'Johnny Doe']
```

El método `concat` reindexa numéricamente las claves de los elementos concatenados a la colección original. Para mantener las claves en colecciones asociativas, consulta el método [merge](#method-merge).

<a id="method-contains"></a>
#### `contains()` {.collection-method}

El método `contains` determina si la colección contiene un elemento dado. Puedes pasar una función anónima al método `contains` para determinar si existe en la colección un elemento que cumpla una condición dada:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->contains(function (int $value, int $key) {
    return $value > 5;
});

// false
```

Como alternativa, puedes pasar una cadena al método `contains` para determinar si la colección contiene un valor de elemento dado:

```php
$collection = collect(['name' => 'Desk', 'price' => 100]);

$collection->contains('Desk');

// true

$collection->contains('New York');

// false
```

También puedes pasar un par clave / valor al método `contains`, que determinará si el par dado existe en la colección:

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Chair', 'price' => 100],
]);

$collection->contains('product', 'Bookcase');

// false
```

El método `contains` usa comparaciones «flexibles» al comprobar los valores de los elementos, lo que significa que una cadena con un valor entero se considera igual a un entero del mismo valor. Usa el método [containsStrict](#method-containsstrict) para filtrar mediante comparaciones «estrictas».

Para la operación inversa de `contains`, consulta el método [doesntContain](#method-doesntcontain).

<a id="method-containsstrict"></a>
#### `containsStrict()` {.collection-method}

Este método tiene la misma firma que el método [contains](#method-contains); sin embargo, todos los valores se comparan mediante comparaciones «estrictas».

> **Nota:**
> El comportamiento de este método cambia al usar [colecciones de Eloquent](../eloquent-collections/#method-contains).

<a id="method-count"></a>
#### `count()` {.collection-method}

El método `count` devuelve el número total de elementos de la colección:

```php
$collection = collect([1, 2, 3, 4]);

$collection->count();

// 4
```

<a id="method-countBy"></a>
#### `countBy()` {.collection-method}

El método `countBy` cuenta las apariciones de valores en la colección. De forma predeterminada, cuenta las apariciones de cada elemento, lo que permite contar ciertos «tipos» de elementos en la colección:

```php
$collection = collect([1, 2, 2, 2, 3]);

$counted = $collection->countBy();

$counted->all();

// [1 => 1, 2 => 3, 3 => 1]
```

Puedes pasar una función anónima al método `countBy` para contar todos los elementos según un valor personalizado:

```php
$collection = collect(['alice@gmail.com', 'bob@yahoo.com', 'carlos@gmail.com']);

$counted = $collection->countBy(function (string $email) {
    return substr(strrchr($email, '@'), 1);
});

$counted->all();

// ['gmail.com' => 2, 'yahoo.com' => 1]
```

<a id="method-crossjoin"></a>
#### `crossJoin()` {.collection-method}

El método `crossJoin` realiza una unión cruzada de los valores de la colección con los arrays o colecciones dados y devuelve un producto cartesiano con todas las combinaciones posibles:

```php
$collection = collect([1, 2]);

$matrix = $collection->crossJoin(['a', 'b']);

$matrix->all();

/*
    [
        [1, 'a'],
        [1, 'b'],
        [2, 'a'],
        [2, 'b'],
    ]
*/

$collection = collect([1, 2]);

$matrix = $collection->crossJoin(['a', 'b'], ['I', 'II']);

$matrix->all();

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

<a id="method-dd"></a>
#### `dd()` {.collection-method}

El método `dd` vuelca los elementos de la colección y termina la ejecución del script:

```php
$collection = collect(['John Doe', 'Jane Doe']);

$collection->dd();

/*
    array:2 [
        0 => "John Doe"
        1 => "Jane Doe"
    ]
*/
```

Si no quieres detener la ejecución del script, usa el método [dump](#method-dump).

<a id="method-diff"></a>
#### `diff()` {.collection-method}

El método `diff` compara la colección con otra colección o un `array` de PHP simple según sus valores. Devuelve los valores de la colección original que no están presentes en la colección dada:

```php
$collection = collect([1, 2, 3, 4, 5]);

$diff = $collection->diff([2, 4, 6, 8]);

$diff->all();

// [1, 3, 5]
```

> **Nota:**
> El comportamiento de este método cambia al usar [colecciones de Eloquent](../eloquent-collections/#method-diff).

<a id="method-diffassoc"></a>
#### `diffAssoc()` {.collection-method}

El método `diffAssoc` compara la colección con otra colección o un `array` de PHP simple según sus claves y valores. Devuelve los pares clave / valor de la colección original que no están presentes en la colección dada:

```php
$collection = collect([
    'color' => 'orange',
    'type' => 'fruit',
    'remain' => 6,
]);

$diff = $collection->diffAssoc([
    'color' => 'yellow',
    'type' => 'fruit',
    'remain' => 3,
    'used' => 6,
]);

$diff->all();

// ['color' => 'orange', 'remain' => 6]
```

<a id="method-diffassocusing"></a>
#### `diffAssocUsing()` {.collection-method}

A diferencia de `diffAssoc`, `diffAssocUsing` acepta un callback proporcionado por el usuario para comparar los índices:

```php
$collection = collect([
    'color' => 'orange',
    'type' => 'fruit',
    'remain' => 6,
]);

$diff = $collection->diffAssocUsing([
    'Color' => 'yellow',
    'Type' => 'fruit',
    'Remain' => 3,
], 'strnatcasecmp');

$diff->all();

// ['color' => 'orange', 'remain' => 6]
```

El callback debe ser una función de comparación que devuelva un entero menor, igual o mayor que cero. Para obtener más información, consulta la documentación de PHP sobre [array_diff_uassoc](https://www.php.net/array_diff_uassoc#refsect1-function.array-diff-uassoc-parameters), que es la función de PHP que el método `diffAssocUsing` utiliza internamente.

<a id="method-diffkeys"></a>
#### `diffKeys()` {.collection-method}

El método `diffKeys` compara la colección con otra colección o un `array` de PHP simple según sus claves. Devuelve los pares clave / valor de la colección original que no están presentes en la colección dada:

```php
$collection = collect([
    'one' => 10,
    'two' => 20,
    'three' => 30,
    'four' => 40,
    'five' => 50,
]);

$diff = $collection->diffKeys([
    'two' => 2,
    'four' => 4,
    'six' => 6,
    'eight' => 8,
]);

$diff->all();

// ['one' => 10, 'three' => 30, 'five' => 50]
```

<a id="method-doesntcontain"></a>
#### `doesntContain()` {.collection-method}

El método `doesntContain` determina si la colección no contiene un elemento dado. Puedes pasar una función anónima al método `doesntContain` para determinar si no existe en la colección un elemento que cumpla una condición dada:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->doesntContain(function (int $value, int $key) {
    return $value < 5;
});

// false
```

Como alternativa, puedes pasar una cadena al método `doesntContain` para determinar si la colección no contiene un valor de elemento dado:

```php
$collection = collect(['name' => 'Desk', 'price' => 100]);

$collection->doesntContain('Table');

// true

$collection->doesntContain('Desk');

// false
```

También puedes pasar un par clave / valor al método `doesntContain`, que determinará si el par dado no existe en la colección:

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Chair', 'price' => 100],
]);

$collection->doesntContain('product', 'Bookcase');

// true
```

El método `doesntContain` usa comparaciones «flexibles» al comprobar los valores de los elementos, lo que significa que una cadena con un valor entero se considera igual a un entero del mismo valor.

<a id="method-doesntcontainstrict"></a>
#### `doesntContainStrict()` {.collection-method}

Este método tiene la misma firma que el método [doesntContain](#method-doesntcontain); sin embargo, todos los valores se comparan mediante comparaciones «estrictas».

<a id="method-dot"></a>
#### `dot()` {.collection-method}

El método `dot` aplana una colección multidimensional en una colección de un solo nivel que usa la notación de puntos para indicar la profundidad:

```php
$collection = collect(['products' => ['desk' => ['price' => 100]]]);

$flattened = $collection->dot();

$flattened->all();

// ['products.desk.price' => 100]
```

<a id="method-dump"></a>
#### `dump()` {.collection-method}

El método `dump` vuelca los elementos de la colección:

```php
$collection = collect(['John Doe', 'Jane Doe']);

$collection->dump();

/*
    array:2 [
        0 => "John Doe"
        1 => "Jane Doe"
    ]
*/
```

Si quieres detener la ejecución del script después de volcar la colección, usa el método [dd](#method-dd).

<a id="method-duplicates"></a>
#### `duplicates()` {.collection-method}

El método `duplicates` obtiene y devuelve los valores duplicados de la colección:

```php
$collection = collect(['a', 'b', 'a', 'c', 'b']);

$collection->duplicates();

// [2 => 'a', 4 => 'b']
```

Si la colección contiene arrays u objetos, puedes pasar la clave de los atributos cuyos valores duplicados quieres comprobar:

```php
$employees = collect([
    ['email' => 'abigail@example.com', 'position' => 'Developer'],
    ['email' => 'james@example.com', 'position' => 'Designer'],
    ['email' => 'victoria@example.com', 'position' => 'Developer'],
]);

$employees->duplicates('position');

// [2 => 'Developer']
```

<a id="method-duplicatesstrict"></a>
#### `duplicatesStrict()` {.collection-method}

Este método tiene la misma firma que el método [duplicates](#method-duplicates); sin embargo, todos los valores se comparan mediante comparaciones «estrictas».

<a id="method-each"></a>
#### `each()` {.collection-method}

El método `each` recorre los elementos de la colección y pasa cada elemento a una función anónima:

```php
$collection = collect([1, 2, 3, 4]);

$collection->each(function (int $item, int $key) {
    // ...
});
```

Si quieres dejar de recorrer los elementos, puedes devolver `false` desde la función anónima:

```php
$collection->each(function (int $item, int $key) {
    if (/* condition */) {
        return false;
    }
});
```

<a id="method-eachspread"></a>
#### `eachSpread()` {.collection-method}

El método `eachSpread` recorre los elementos de la colección y pasa cada valor de elemento anidado al callback dado:

```php
$collection = collect([['John Doe', 35], ['Jane Doe', 33]]);

$collection->eachSpread(function (string $name, int $age) {
    // ...
});
```

Puedes dejar de recorrer los elementos devolviendo `false` desde el callback:

```php
$collection->eachSpread(function (string $name, int $age) {
    return false;
});
```

<a id="method-ensure"></a>
#### `ensure()` {.collection-method}

El método `ensure` se puede usar para verificar que todos los elementos de una colección sean de un tipo o de una lista de tipos dados. De lo contrario, se lanzará una excepción `UnexpectedValueException`:

```php
return $collection->ensure(User::class);

return $collection->ensure([User::class, Customer::class]);
```

También se pueden especificar tipos primitivos como `string`, `int`, `float`, `bool` y `array`:

```php
return $collection->ensure('int');
```

> **Advertencia:**
> El método `ensure` no garantiza que posteriormente no se agreguen a la colección elementos de otros tipos.

<a id="method-every"></a>
#### `every()` {.collection-method}

El método `every` se puede usar para verificar que todos los elementos de una colección cumplan una condición dada:

```php
collect([1, 2, 3, 4])->every(function (int $value, int $key) {
    return $value > 2;
});

// false
```

Si la colección está vacía, el método `every` devuelve true:

```php
$collection = collect([]);

$collection->every(function (int $value, int $key) {
    return $value > 2;
});

// true
```

<a id="method-except"></a>
#### `except()` {.collection-method}

El método `except` devuelve todos los elementos de la colección salvo aquellos con las claves especificadas:

```php
$collection = collect(['product_id' => 1, 'price' => 100, 'discount' => false]);

$filtered = $collection->except(['price', 'discount']);

$filtered->all();

// ['product_id' => 1]
```

Para la operación inversa de `except`, consulta el método [only](#method-only).

> **Nota:**
> El comportamiento de este método cambia al usar [colecciones de Eloquent](../eloquent-collections/#method-except).

<a id="method-filter"></a>
#### `filter()` {.collection-method}

El método `filter` filtra la colección mediante el callback dado y conserva únicamente los elementos que cumplen una condición dada:

```php
$collection = collect([1, 2, 3, 4]);

$filtered = $collection->filter(function (int $value, int $key) {
    return $value > 2;
});

$filtered->all();

// [3, 4]
```

Si no se proporciona un callback, se eliminarán todas las entradas de la colección equivalentes a `false`:

```php
$collection = collect([1, 2, 3, null, false, '', 0, []]);

$collection->filter()->all();

// [1, 2, 3]
```

Para la operación inversa de `filter`, consulta el método [reject](#method-reject).

<a id="method-first"></a>
#### `first()` {.collection-method}

El método `first` devuelve el primer elemento de la colección que cumple una condición dada:

```php
collect([1, 2, 3, 4])->first(function (int $value, int $key) {
    return $value > 2;
});

// 3
```

También puedes invocar el método `first` sin argumentos para obtener el primer elemento de la colección. Si la colección está vacía, devuelve `null`:

```php
collect([1, 2, 3, 4])->first();

// 1
```

<a id="method-first-or-fail"></a>
#### `firstOrFail()` {.collection-method}

El método `firstOrFail` es idéntico al método `first`; sin embargo, si no se encuentra ningún resultado, se lanzará una excepción `Illuminate\Support\ItemNotFoundException`:

```php
collect([1, 2, 3, 4])->firstOrFail(function (int $value, int $key) {
    return $value > 5;
});

// Throws ItemNotFoundException...
```

También puedes invocar el método `firstOrFail` sin argumentos para obtener el primer elemento de la colección. Si la colección está vacía, se lanzará una excepción `Illuminate\Support\ItemNotFoundException`:

```php
collect([])->firstOrFail();

// Throws ItemNotFoundException...
```

<a id="method-first-where"></a>
#### `firstWhere()` {.collection-method}

El método `firstWhere` devuelve el primer elemento de la colección con el par clave / valor dado:

```php
$collection = collect([
    ['name' => 'Regena', 'age' => null],
    ['name' => 'Linda', 'age' => 14],
    ['name' => 'Diego', 'age' => 23],
    ['name' => 'Linda', 'age' => 84],
]);

$collection->firstWhere('name', 'Linda');

// ['name' => 'Linda', 'age' => 14]
```

También puedes invocar el método `firstWhere` con un operador de comparación:

```php
$collection->firstWhere('age', '>=', 18);

// ['name' => 'Diego', 'age' => 23]
```

Al igual que con el método [where](#method-where), puedes pasar un argumento al método `firstWhere`. En este caso, el método `firstWhere` devuelve el primer elemento cuyo valor para la clave dada se evalúe como verdadero:

```php
$collection->firstWhere('age');

// ['name' => 'Linda', 'age' => 14]
```

<a id="method-flatmap"></a>
#### `flatMap()` {.collection-method}

El método `flatMap` recorre la colección y pasa cada valor a la función anónima dada. La función anónima puede modificar el elemento y devolverlo, formando así una nueva colección de elementos modificados. Después, el array se aplana un nivel:

```php
$collection = collect([
    ['name' => 'Sally'],
    ['school' => 'Arkansas'],
    ['age' => 28]
]);

$flattened = $collection->flatMap(function (array $values) {
    return array_map('strtoupper', $values);
});

$flattened->all();

// ['name' => 'SALLY', 'school' => 'ARKANSAS', 'age' => '28'];
```

<a id="method-flatten"></a>
#### `flatten()` {.collection-method}

El método `flatten` aplana una colección multidimensional en una sola dimensión:

```php
$collection = collect([
    'name' => 'Taylor',
    'languages' => [
        'PHP', 'JavaScript'
    ]
]);

$flattened = $collection->flatten();

$flattened->all();

// ['Taylor', 'PHP', 'JavaScript'];
```

Si es necesario, puedes pasar al método `flatten` un argumento de profundidad:

```php
$collection = collect([
    'Apple' => [
        [
            'name' => 'iPhone 6S',
            'brand' => 'Apple'
        ],
    ],
    'Samsung' => [
        [
            'name' => 'Galaxy S7',
            'brand' => 'Samsung'
        ],
    ],
]);

$products = $collection->flatten(1);

$products->values()->all();

/*
    [
        ['name' => 'iPhone 6S', 'brand' => 'Apple'],
        ['name' => 'Galaxy S7', 'brand' => 'Samsung'],
    ]
*/
```

En este ejemplo, invocar `flatten` sin proporcionar la profundidad también habría aplanado los arrays anidados, lo que daría como resultado `['iPhone 6S', 'Apple', 'Galaxy S7', 'Samsung']`. Proporcionar una profundidad permite especificar cuántos niveles de arrays anidados se aplanarán.

<a id="method-flip"></a>
#### `flip()` {.collection-method}

El método `flip` intercambia las claves de la colección con sus valores correspondientes:

```php
$collection = collect(['name' => 'Taylor', 'framework' => 'Laravel']);

$flipped = $collection->flip();

$flipped->all();

// ['Taylor' => 'name', 'Laravel' => 'framework']
```

<a id="method-forget"></a>
#### `forget()` {.collection-method}

El método `forget` elimina un elemento de la colección por su clave:

```php
$collection = collect(['name' => 'Taylor', 'framework' => 'Laravel']);

// Forget a single key...
$collection->forget('name');

// ['framework' => 'Laravel']

// Forget multiple keys...
$collection->forget(['name', 'framework']);

// []
```

> **Advertencia:**
> A diferencia de la mayoría de los demás métodos de colección, `forget` no devuelve una nueva colección modificada; modifica y devuelve la colección sobre la que se invoca.

<a id="method-forpage"></a>
#### `forPage()` {.collection-method}

El método `forPage` devuelve una nueva colección que contiene los elementos que estarían presentes en un número de página dado. El método acepta el número de página como primer argumento y el número de elementos que se mostrarán por página como segundo argumento:

```php
$collection = collect([1, 2, 3, 4, 5, 6, 7, 8, 9]);

$chunk = $collection->forPage(2, 3);

$chunk->all();

// [4, 5, 6]
```

<a id="method-fromjson"></a>
#### `fromJson()` {.collection-method}

El método estático `fromJson` crea una nueva instancia de colección decodificando una cadena JSON dada mediante la función de PHP `json_decode`:

```php
use Illuminate\Support\Collection;

$json = json_encode([
    'name' => 'Taylor Otwell',
    'role' => 'Developer',
    'status' => 'Active',
]);

$collection = Collection::fromJson($json);
```

<a id="method-get"></a>
#### `get()` {.collection-method}

El método `get` devuelve el elemento de una clave dada. Si la clave no existe, devuelve `null`:

```php
$collection = collect(['name' => 'Taylor', 'framework' => 'Laravel']);

$value = $collection->get('name');

// Taylor
```

De forma opcional, puedes pasar un valor predeterminado como segundo argumento:

```php
$collection = collect(['name' => 'Taylor', 'framework' => 'Laravel']);

$value = $collection->get('age', 34);

// 34
```

Incluso puedes pasar un callback como valor predeterminado del método. El resultado del callback se devolverá si la clave especificada no existe:

```php
$collection->get('email', function () {
    return 'taylor@example.com';
});

// taylor@example.com
```

<a id="method-groupby"></a>
#### `groupBy()` {.collection-method}

El método `groupBy` agrupa los elementos de la colección según una clave dada:

```php
$collection = collect([
    ['account_id' => 'account-x10', 'product' => 'Chair'],
    ['account_id' => 'account-x10', 'product' => 'Bookcase'],
    ['account_id' => 'account-x11', 'product' => 'Desk'],
]);

$grouped = $collection->groupBy('account_id');

$grouped->all();

/*
    [
        'account-x10' => [
            ['account_id' => 'account-x10', 'product' => 'Chair'],
            ['account_id' => 'account-x10', 'product' => 'Bookcase'],
        ],
        'account-x11' => [
            ['account_id' => 'account-x11', 'product' => 'Desk'],
        ],
    ]
*/
```

En lugar de pasar una cadena `key`, puedes pasar un callback. El callback debe devolver el valor que quieres usar como clave del grupo:

```php
$grouped = $collection->groupBy(function (array $item, int $key) {
    return substr($item['account_id'], -3);
});

$grouped->all();

/*
    [
        'x10' => [
            ['account_id' => 'account-x10', 'product' => 'Chair'],
            ['account_id' => 'account-x10', 'product' => 'Bookcase'],
        ],
        'x11' => [
            ['account_id' => 'account-x11', 'product' => 'Desk'],
        ],
    ]
*/
```

Puedes pasar varios criterios de agrupación como un array. Cada elemento del array se aplicará al nivel correspondiente de un array multidimensional:

```php
$data = new Collection([
    10 => ['user' => 1, 'skill' => 1, 'roles' => ['Role_1', 'Role_3']],
    20 => ['user' => 2, 'skill' => 1, 'roles' => ['Role_1', 'Role_2']],
    30 => ['user' => 3, 'skill' => 2, 'roles' => ['Role_1']],
    40 => ['user' => 4, 'skill' => 2, 'roles' => ['Role_2']],
]);

$result = $data->groupBy(['skill', function (array $item) {
    return $item['roles'];
}], preserveKeys: true);

/*
[
    1 => [
        'Role_1' => [
            10 => ['user' => 1, 'skill' => 1, 'roles' => ['Role_1', 'Role_3']],
            20 => ['user' => 2, 'skill' => 1, 'roles' => ['Role_1', 'Role_2']],
        ],
        'Role_3' => [
            10 => ['user' => 1, 'skill' => 1, 'roles' => ['Role_1', 'Role_3']],
        ],
        'Role_2' => [
            20 => ['user' => 2, 'skill' => 1, 'roles' => ['Role_1', 'Role_2']],
        ],
    ],
    2 => [
        'Role_1' => [
            30 => ['user' => 3, 'skill' => 2, 'roles' => ['Role_1']],
        ],
        'Role_2' => [
            40 => ['user' => 4, 'skill' => 2, 'roles' => ['Role_2']],
        ],
    ],
];
*/
```

<a id="method-has"></a>
#### `has()` {.collection-method}

El método `has` determina si una clave dada existe en la colección:

```php
$collection = collect(['account_id' => 1, 'product' => 'Desk', 'amount' => 5]);

$collection->has('product');

// true

$collection->has(['product', 'amount']);

// true

$collection->has(['amount', 'price']);

// false
```

<a id="method-hasany"></a>
#### `hasAny()` {.collection-method}

El método `hasAny` determina si alguna de las claves dadas existe en la colección:

```php
$collection = collect(['account_id' => 1, 'product' => 'Desk', 'amount' => 5]);

$collection->hasAny(['product', 'price']);

// true

$collection->hasAny(['name', 'price']);

// false
```

<a id="method-hasmany"></a>
#### `hasMany()` {.collection-method}

El método `hasMany` determina si la colección contiene varios elementos:

```php
collect([])->hasMany();

// false

collect(['1'])->hasMany();

// false

collect([1, 2, 3])->hasMany();

// true

collect([
    ['age' => 2],
    ['age' => 3],
])->hasMany(fn ($item) => $item['age'] === 2);

// false
```

<a id="method-hassole"></a>
#### `hasSole()` {.collection-method}

El método `hasSole` determina si la colección contiene un único elemento que, opcionalmente, coincida con los criterios dados:

```php
collect([])->hasSole();

// false

collect(['1'])->hasSole();

// true

collect([1, 2, 3])->hasSole(fn (int $item) => $item === 2);

// true
```

<a id="method-implode"></a>
#### `implode()` {.collection-method}

El método `implode` une los elementos de una colección. Sus argumentos dependen del tipo de elementos de la colección. Si contiene arrays u objetos, debes pasar la clave de los atributos que quieres unir y la cadena separadora que quieres colocar entre los valores:

```php
$collection = collect([
    ['account_id' => 1, 'product' => 'Desk'],
    ['account_id' => 2, 'product' => 'Chair'],
]);

$collection->implode('product', ', ');

// 'Desk, Chair'
```

Si la colección contiene cadenas simples o valores numéricos, debes pasar el separador como único argumento del método:

```php
collect([1, 2, 3, 4, 5])->implode('-');

// '1-2-3-4-5'
```

Puedes pasar una función anónima al método `implode` si quieres dar formato a los valores que se van a unir:

```php
$collection->implode(function (array $item, int $key) {
    return strtoupper($item['product']);
}, ', ');

// 'DESK, CHAIR'
```

<a id="method-intersect"></a>
#### `intersect()` {.collection-method}

El método `intersect` elimina de la colección original los valores que no están presentes en el array o colección dado. La colección resultante conservará las claves de la colección original:

```php
$collection = collect(['Desk', 'Sofa', 'Chair']);

$intersect = $collection->intersect(['Desk', 'Chair', 'Bookcase']);

$intersect->all();

// [0 => 'Desk', 2 => 'Chair']
```

> **Nota:**
> El comportamiento de este método cambia al usar [colecciones de Eloquent](../eloquent-collections/#method-intersect).

<a id="method-intersectusing"></a>
#### `intersectUsing()` {.collection-method}

El método `intersectUsing` elimina de la colección original los valores que no están presentes en el array o colección dado, usando un callback personalizado para comparar los valores. La colección resultante conservará las claves de la colección original:

```php
$collection = collect(['Desk', 'Sofa', 'Chair']);

$intersect = $collection->intersectUsing(['desk', 'chair', 'bookcase'], function (string $a, string $b) {
    return strcasecmp($a, $b);
});

$intersect->all();

// [0 => 'Desk', 2 => 'Chair']
```

<a id="method-intersectAssoc"></a>
#### `intersectAssoc()` {.collection-method}

El método `intersectAssoc` compara la colección original con otra colección o array y devuelve los pares clave / valor que están presentes en todas las colecciones dadas:

```php
$collection = collect([
    'color' => 'red',
    'size' => 'M',
    'material' => 'cotton'
]);

$intersect = $collection->intersectAssoc([
    'color' => 'blue',
    'size' => 'M',
    'material' => 'polyester'
]);

$intersect->all();

// ['size' => 'M']
```

<a id="method-intersectassocusing"></a>
#### `intersectAssocUsing()` {.collection-method}

El método `intersectAssocUsing` compara la colección original con otra colección o array y devuelve los pares clave / valor que están presentes en ambos, usando un callback de comparación personalizado para comparar las claves:

```php
$collection = collect([
    'color' => 'red',
    'Size' => 'M',
    'material' => 'cotton',
]);

$intersect = $collection->intersectAssocUsing([
    'color' => 'blue',
    'size' => 'M',
    'material' => 'polyester',
], function (string $a, string $b) {
    return strcasecmp($a, $b);
});

$intersect->all();

// ['Size' => 'M']
```

<a id="method-intersectbykeys"></a>
#### `intersectByKeys()` {.collection-method}

El método `intersectByKeys` elimina de la colección original las claves y sus valores correspondientes que no están presentes en el array o colección dado:

```php
$collection = collect([
    'serial' => 'UX301', 'type' => 'screen', 'year' => 2009,
]);

$intersect = $collection->intersectByKeys([
    'reference' => 'UX404', 'type' => 'tab', 'year' => 2011,
]);

$intersect->all();

// ['type' => 'screen', 'year' => 2009]
```

<a id="method-isempty"></a>
#### `isEmpty()` {.collection-method}

El método `isEmpty` devuelve `true` si la colección está vacía; de lo contrario, devuelve `false`:

```php
collect([])->isEmpty();

// true
```

<a id="method-isnotempty"></a>
#### `isNotEmpty()` {.collection-method}

El método `isNotEmpty` devuelve `true` si la colección no está vacía; de lo contrario, devuelve `false`:

```php
collect([])->isNotEmpty();

// false
```

<a id="method-join"></a>
#### `join()` {.collection-method}

El método `join` une los valores de la colección con una cadena. Mediante el segundo argumento de este método, también puedes especificar cómo se debe agregar el último elemento a la cadena:

```php
collect(['a', 'b', 'c'])->join(', '); // 'a, b, c'
collect(['a', 'b', 'c'])->join(', ', ', and '); // 'a, b, and c'
collect(['a', 'b'])->join(', ', ' and '); // 'a and b'
collect(['a'])->join(', ', ' and '); // 'a'
collect([])->join(', ', ' and '); // ''
```

<a id="method-keyby"></a>
#### `keyBy()` {.collection-method}

El método `keyBy` asigna las claves de la colección según la clave dada. Si varios elementos tienen la misma clave, solo el último aparecerá en la nueva colección:

```php
$collection = collect([
    ['product_id' => 'prod-100', 'name' => 'Desk'],
    ['product_id' => 'prod-200', 'name' => 'Chair'],
]);

$keyed = $collection->keyBy('product_id');

$keyed->all();

/*
    [
        'prod-100' => ['product_id' => 'prod-100', 'name' => 'Desk'],
        'prod-200' => ['product_id' => 'prod-200', 'name' => 'Chair'],
    ]
*/
```

También puedes pasar un callback al método. El callback debe devolver el valor que se usará como clave de la colección:

```php
$keyed = $collection->keyBy(function (array $item, int $key) {
    return strtoupper($item['product_id']);
});

$keyed->all();

/*
    [
        'PROD-100' => ['product_id' => 'prod-100', 'name' => 'Desk'],
        'PROD-200' => ['product_id' => 'prod-200', 'name' => 'Chair'],
    ]
*/
```

<a id="method-keys"></a>
#### `keys()` {.collection-method}

El método `keys` devuelve todas las claves de la colección:

```php
$collection = collect([
    'prod-100' => ['product_id' => 'prod-100', 'name' => 'Desk'],
    'prod-200' => ['product_id' => 'prod-200', 'name' => 'Chair'],
]);

$keys = $collection->keys();

$keys->all();

// ['prod-100', 'prod-200']
```

<a id="method-last"></a>
#### `last()` {.collection-method}

El método `last` devuelve el último elemento de la colección que cumple una condición dada:

```php
collect([1, 2, 3, 4])->last(function (int $value, int $key) {
    return $value < 3;
});

// 2
```

También puedes invocar el método `last` sin argumentos para obtener el último elemento de la colección. Si la colección está vacía, devuelve `null`:

```php
collect([1, 2, 3, 4])->last();

// 4
```

<a id="method-lazy"></a>
#### `lazy()` {.collection-method}

El método `lazy` devuelve una nueva instancia de [LazyCollection](#lazy-collections) a partir del array subyacente de elementos:

```php
$lazyCollection = collect([1, 2, 3, 4])->lazy();

$lazyCollection::class;

// Illuminate\Support\LazyCollection

$lazyCollection->all();

// [1, 2, 3, 4]
```

Esto es especialmente útil cuando necesitas realizar transformaciones sobre una `Collection` enorme que contiene muchos elementos:

```php
$count = $hugeCollection
    ->lazy()
    ->where('country', 'FR')
    ->where('balance', '>', '100')
    ->count();
```

Al convertir la colección en una `LazyCollection`, evitamos tener que asignar una gran cantidad de memoria adicional. Aunque la colección original sigue manteniendo _sus_ valores en memoria, los filtros posteriores no lo harán. Por lo tanto, prácticamente no se asignará memoria adicional al filtrar los resultados de la colección.

<a id="method-macro"></a>
#### `macro()` {.collection-method}

El método estático `macro` permite agregar métodos a la clase `Collection` en tiempo de ejecución. Consulta la documentación sobre cómo [extender colecciones](#extending-collections) para obtener más información.

<a id="method-make"></a>
#### `make()` {.collection-method}

El método estático `make` crea una nueva instancia de colección. Consulta la sección [Crear colecciones](#creating-collections).

```php
use Illuminate\Support\Collection;

$collection = Collection::make([1, 2, 3]);
```

<a id="method-map"></a>
#### `map()` {.collection-method}

El método `map` recorre la colección y pasa cada valor al callback dado. El callback puede modificar el elemento y devolverlo, formando así una nueva colección de elementos modificados:

```php
$collection = collect([1, 2, 3, 4, 5]);

$multiplied = $collection->map(function (int $item, int $key) {
    return $item * 2;
});

$multiplied->all();

// [2, 4, 6, 8, 10]
```

> **Advertencia:**
> Al igual que la mayoría de los demás métodos de colección, `map` devuelve una nueva instancia de colección; no modifica la colección sobre la que se invoca. Si quieres transformar la colección original, usa el método [transform](#method-transform).

<a id="method-mapinto"></a>
#### `mapInto()` {.collection-method}

El método `mapInto()` recorre la colección y crea una nueva instancia de la clase dada pasando el valor al constructor:

```php
class Currency
{
    /**
     * Create a new currency instance.
     */
    function __construct(
        public string $code,
    ) {}
}

$collection = collect(['USD', 'EUR', 'GBP']);

$currencies = $collection->mapInto(Currency::class);

$currencies->all();

// [Currency('USD'), Currency('EUR'), Currency('GBP')]
```

<a id="method-mapspread"></a>
#### `mapSpread()` {.collection-method}

El método `mapSpread` recorre los elementos de la colección y pasa cada valor de elemento anidado a la función anónima dada. La función anónima puede modificar el elemento y devolverlo, formando así una nueva colección de elementos modificados:

```php
$collection = collect([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

$chunks = $collection->chunk(2);

$sequence = $chunks->mapSpread(function (int $even, int $odd) {
    return $even + $odd;
});

$sequence->all();

// [1, 5, 9, 13, 17]
```

<a id="method-maptogroups"></a>
#### `mapToGroups()` {.collection-method}

El método `mapToGroups` agrupa los elementos de la colección mediante la función anónima dada. La función anónima debe devolver un array asociativo que contenga un único par clave / valor, formando así una nueva colección de valores agrupados:

```php
$collection = collect([
    [
        'name' => 'John Doe',
        'department' => 'Sales',
    ],
    [
        'name' => 'Jane Doe',
        'department' => 'Sales',
    ],
    [
        'name' => 'Johnny Doe',
        'department' => 'Marketing',
    ]
]);

$grouped = $collection->mapToGroups(function (array $item, int $key) {
    return [$item['department'] => $item['name']];
});

$grouped->all();

/*
    [
        'Sales' => ['John Doe', 'Jane Doe'],
        'Marketing' => ['Johnny Doe'],
    ]
*/

$grouped->get('Sales')->all();

// ['John Doe', 'Jane Doe']
```

<a id="method-mapwithkeys"></a>
#### `mapWithKeys()` {.collection-method}

El método `mapWithKeys` recorre la colección y pasa cada valor al callback dado. El callback debe devolver un array asociativo que contenga un único par clave / valor:

```php
$collection = collect([
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
]);

$keyed = $collection->mapWithKeys(function (array $item, int $key) {
    return [$item['email'] => $item['name']];
});

$keyed->all();

/*
    [
        'john@example.com' => 'John',
        'jane@example.com' => 'Jane',
    ]
*/
```

<a id="method-max"></a>
#### `max()` {.collection-method}

El método `max` devuelve el valor máximo de una clave dada:

```php
$max = collect([
    ['foo' => 10],
    ['foo' => 20]
])->max('foo');

// 20

$max = collect([1, 2, 3, 4, 5])->max();

// 5
```

<a id="method-median"></a>
#### `median()` {.collection-method}

El método `median` devuelve el [valor de la mediana](https://en.wikipedia.org/wiki/Median) de una clave dada:

```php
$median = collect([
    ['foo' => 10],
    ['foo' => 10],
    ['foo' => 20],
    ['foo' => 40]
])->median('foo');

// 15

$median = collect([1, 1, 2, 4])->median();

// 1.5
```

<a id="method-merge"></a>
#### `merge()` {.collection-method}

El método `merge` combina el array o colección dado con la colección original. Si una clave de cadena de los elementos dados coincide con una clave de cadena de la colección original, el valor del elemento dado sobrescribirá el valor de la colección original:

```php
$collection = collect(['product_id' => 1, 'price' => 100]);

$merged = $collection->merge(['price' => 200, 'discount' => false]);

$merged->all();

// ['product_id' => 1, 'price' => 200, 'discount' => false]
```

Si las claves de los elementos dados son numéricas, los valores se agregarán al final de la colección:

```php
$collection = collect(['Desk', 'Chair']);

$merged = $collection->merge(['Bookcase', 'Door']);

$merged->all();

// ['Desk', 'Chair', 'Bookcase', 'Door']
```

<a id="method-mergerecursive"></a>
#### `mergeRecursive()` {.collection-method}

El método `mergeRecursive` combina recursivamente el array o colección dado con la colección original. Si una clave de cadena de los elementos dados coincide con una clave de cadena de la colección original, los valores de estas claves se combinan en un array, y esto se realiza de forma recursiva:

```php
$collection = collect(['product_id' => 1, 'price' => 100]);

$merged = $collection->mergeRecursive([
    'product_id' => 2,
    'price' => 200,
    'discount' => false
]);

$merged->all();

// ['product_id' => [1, 2], 'price' => [100, 200], 'discount' => false]
```

<a id="method-min"></a>
#### `min()` {.collection-method}

El método `min` devuelve el valor mínimo de una clave dada:

```php
$min = collect([
    ['foo' => 10],
    ['foo' => 20]
])->min('foo');

// 10

$min = collect([1, 2, 3, 4, 5])->min();

// 1
```

<a id="method-mode"></a>
#### `mode()` {.collection-method}

El método `mode` devuelve el [valor de la moda](https://en.wikipedia.org/wiki/Mode_(statistics)) de una clave dada:

```php
$mode = collect([
    ['foo' => 10],
    ['foo' => 10],
    ['foo' => 20],
    ['foo' => 40]
])->mode('foo');

// [10]

$mode = collect([1, 1, 2, 4])->mode();

// [1]

$mode = collect([1, 1, 2, 2])->mode();

// [1, 2]
```

<a id="method-multiply"></a>
#### `multiply()` {.collection-method}

El método `multiply` crea el número especificado de copias de todos los elementos de la colección:

```php
$users = collect([
    ['name' => 'User #1', 'email' => 'user1@example.com'],
    ['name' => 'User #2', 'email' => 'user2@example.com'],
])->multiply(3);

/*
    [
        ['name' => 'User #1', 'email' => 'user1@example.com'],
        ['name' => 'User #2', 'email' => 'user2@example.com'],
        ['name' => 'User #1', 'email' => 'user1@example.com'],
        ['name' => 'User #2', 'email' => 'user2@example.com'],
        ['name' => 'User #1', 'email' => 'user1@example.com'],
        ['name' => 'User #2', 'email' => 'user2@example.com'],
    ]
*/
```

<a id="method-nth"></a>
#### `nth()` {.collection-method}

El método `nth` crea una nueva colección formada por cada enésimo elemento:

```php
$collection = collect(['a', 'b', 'c', 'd', 'e', 'f']);

$collection->nth(4);

// ['a', 'e']
```

De forma opcional, puedes pasar un desplazamiento inicial como segundo argumento:

```php
$collection->nth(4, 1);

// ['b', 'f']
```

<a id="method-only"></a>
#### `only()` {.collection-method}

El método `only` devuelve los elementos de la colección con las claves especificadas:

```php
$collection = collect([
    'product_id' => 1,
    'name' => 'Desk',
    'price' => 100,
    'discount' => false
]);

$filtered = $collection->only(['product_id', 'name']);

$filtered->all();

// ['product_id' => 1, 'name' => 'Desk']
```

Para la operación inversa de `only`, consulta el método [except](#method-except).

> **Nota:**
> El comportamiento de este método cambia al usar [colecciones de Eloquent](../eloquent-collections/#method-only).

<a id="method-pad"></a>
#### `pad()` {.collection-method}

El método `pad` rellena el array con el valor dado hasta que el array alcanza el tamaño especificado. Este método se comporta como la función de PHP [array_pad](https://secure.php.net/manual/en/function.array-pad.php).

Para rellenar por la izquierda, debes especificar un tamaño negativo. No se realizará ningún relleno si el valor absoluto del tamaño dado es menor o igual que la longitud del array:

```php
$collection = collect(['A', 'B', 'C']);

$filtered = $collection->pad(5, 0);

$filtered->all();

// ['A', 'B', 'C', 0, 0]

$filtered = $collection->pad(-5, 0);

$filtered->all();

// [0, 0, 'A', 'B', 'C']
```

<a id="method-partition"></a>
#### `partition()` {.collection-method}

El método `partition` se puede combinar con la desestructuración de arrays de PHP para separar los elementos que cumplen una condición dada de aquellos que no la cumplen:

```php
$collection = collect([1, 2, 3, 4, 5, 6]);

[$underThree, $equalOrAboveThree] = $collection->partition(function (int $i) {
    return $i < 3;
});

$underThree->all();

// [1, 2]

$equalOrAboveThree->all();

// [3, 4, 5, 6]
```

> **Nota:**
> El comportamiento de este método cambia al interactuar con [colecciones de Eloquent](../eloquent-collections/#method-partition).

<a id="method-percentage"></a>
#### `percentage()` {.collection-method}

El método `percentage` se puede usar para determinar rápidamente el porcentaje de elementos de la colección que cumplen una condición dada:

```php
$collection = collect([1, 1, 2, 2, 2, 3]);

$percentage = $collection->percentage(fn (int $value) => $value === 1);

// 33.33
```

De forma predeterminada, el porcentaje se redondea a dos decimales. Sin embargo, puedes personalizar este comportamiento proporcionando un segundo argumento al método:

```php
$percentage = $collection->percentage(fn (int $value) => $value === 1, precision: 3);

// 33.333
```

<a id="method-pipe"></a>
#### `pipe()` {.collection-method}

El método `pipe` pasa la colección a la función anónima dada y devuelve el resultado de su ejecución:

```php
$collection = collect([1, 2, 3]);

$piped = $collection->pipe(function (Collection $collection) {
    return $collection->sum();
});

// 6
```

<a id="method-pipeinto"></a>
#### `pipeInto()` {.collection-method}

El método `pipeInto` crea una nueva instancia de la clase dada y pasa la colección al constructor:

```php
class ResourceCollection
{
    /**
     * Create a new ResourceCollection instance.
     */
    public function __construct(
        public Collection $collection,
    ) {}
}

$collection = collect([1, 2, 3]);

$resource = $collection->pipeInto(ResourceCollection::class);

$resource->collection->all();

// [1, 2, 3]
```

<a id="method-pipethrough"></a>
#### `pipeThrough()` {.collection-method}

El método `pipeThrough` pasa la colección al array de funciones anónimas dado y devuelve el resultado de su ejecución:

```php
use Illuminate\Support\Collection;

$collection = collect([1, 2, 3]);

$result = $collection->pipeThrough([
    function (Collection $collection) {
        return $collection->merge([4, 5]);
    },
    function (Collection $collection) {
        return $collection->sum();
    },
]);

// 15
```

<a id="method-pluck"></a>
#### `pluck()` {.collection-method}

El método `pluck` obtiene todos los valores de una clave dada:

```php
$collection = collect([
    ['product_id' => 'prod-100', 'name' => 'Desk'],
    ['product_id' => 'prod-200', 'name' => 'Chair'],
]);

$plucked = $collection->pluck('name');

$plucked->all();

// ['Desk', 'Chair']
```

También puedes especificar cómo quieres asignar las claves a la colección resultante:

```php
$plucked = $collection->pluck('name', 'product_id');

$plucked->all();

// ['prod-100' => 'Desk', 'prod-200' => 'Chair']
```

El método `pluck` también permite obtener valores anidados mediante la notación de puntos:

```php
$collection = collect([
    [
        'name' => 'Laracon',
        'speakers' => [
            'first_day' => ['Rosa', 'Judith'],
        ],
    ],
    [
        'name' => 'VueConf',
        'speakers' => [
            'first_day' => ['Abigail', 'Joey'],
        ],
    ],
]);

$plucked = $collection->pluck('speakers.first_day');

$plucked->all();

// [['Rosa', 'Judith'], ['Abigail', 'Joey']]
```

Si existen claves duplicadas, se insertará en la colección obtenida el último elemento coincidente:

```php
$collection = collect([
    ['brand' => 'Tesla',  'color' => 'red'],
    ['brand' => 'Pagani', 'color' => 'white'],
    ['brand' => 'Tesla',  'color' => 'black'],
    ['brand' => 'Pagani', 'color' => 'orange'],
]);

$plucked = $collection->pluck('color', 'brand');

$plucked->all();

// ['Tesla' => 'black', 'Pagani' => 'orange']
```

<a id="method-pop"></a>
#### `pop()` {.collection-method}

El método `pop` elimina y devuelve el último elemento de la colección. Si la colección está vacía, devuelve `null`:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->pop();

// 5

$collection->all();

// [1, 2, 3, 4]
```

Puedes pasar un entero al método `pop` para eliminar y devolver varios elementos del final de una colección:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->pop(3);

// collect([5, 4, 3])

$collection->all();

// [1, 2]
```

<a id="method-prepend"></a>
#### `prepend()` {.collection-method}

El método `prepend` agrega un elemento al principio de la colección:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->prepend(0);

$collection->all();

// [0, 1, 2, 3, 4, 5]
```

También puedes pasar un segundo argumento para especificar la clave del elemento agregado al principio:

```php
$collection = collect(['one' => 1, 'two' => 2]);

$collection->prepend(0, 'zero');

$collection->all();

// ['zero' => 0, 'one' => 1, 'two' => 2]
```

<a id="method-pull"></a>
#### `pull()` {.collection-method}

El método `pull` elimina y devuelve un elemento de la colección por su clave:

```php
$collection = collect(['product_id' => 'prod-100', 'name' => 'Desk']);

$collection->pull('name');

// 'Desk'

$collection->all();

// ['product_id' => 'prod-100']
```

<a id="method-push"></a>
#### `push()` {.collection-method}

El método `push` agrega un elemento al final de la colección:

```php
$collection = collect([1, 2, 3, 4]);

$collection->push(5);

$collection->all();

// [1, 2, 3, 4, 5]
```

También puedes proporcionar varios elementos para agregarlos al final de la colección:

```php
$collection = collect([1, 2, 3, 4]);

$collection->push(5, 6, 7);

$collection->all();

// [1, 2, 3, 4, 5, 6, 7]
```

<a id="method-put"></a>
#### `put()` {.collection-method}

El método `put` establece la clave y el valor dados en la colección:

```php
$collection = collect(['product_id' => 1, 'name' => 'Desk']);

$collection->put('price', 100);

$collection->all();

// ['product_id' => 1, 'name' => 'Desk', 'price' => 100]
```

<a id="method-random"></a>
#### `random()` {.collection-method}

El método `random` devuelve un elemento aleatorio de la colección:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->random();

// 4 - (retrieved randomly)
```

Puedes pasar un entero a `random` para especificar cuántos elementos quieres obtener aleatoriamente. Siempre se devuelve una colección de elementos cuando se pasa explícitamente el número de elementos que quieres recibir:

```php
$random = $collection->random(3);

$random->all();

// [2, 4, 5] - (retrieved randomly)
```

Si la instancia de colección tiene menos elementos de los solicitados, el método `random` lanzará una excepción `InvalidArgumentException`.

El método `random` también acepta una función anónima, que recibirá la instancia de colección actual:

```php
use Illuminate\Support\Collection;

$random = $collection->random(fn (Collection $items) => min(10, count($items)));

$random->all();

// [1, 2, 3, 4, 5] - (retrieved randomly)
```

<a id="method-range"></a>
#### `range()` {.collection-method}

El método `range` devuelve una colección que contiene los enteros del intervalo especificado:

```php
$collection = collect()->range(3, 6);

$collection->all();

// [3, 4, 5, 6]
```

<a id="method-reduce"></a>
#### `reduce()` {.collection-method}

El método `reduce` reduce la colección a un único valor, pasando el resultado de cada iteración a la siguiente:

```php
$collection = collect([1, 2, 3]);

$total = $collection->reduce(function (?int $carry, int $item) {
    return $carry + $item;
});

// 6
```

El valor de `$carry` en la primera iteración es `null`; sin embargo, puedes especificar su valor inicial pasando un segundo argumento a `reduce`:

```php
$collection->reduce(function (int $carry, int $item) {
    return $carry + $item;
}, 4);

// 10
```

El método `reduce` también pasa las claves del array al callback dado:

```php
$collection = collect([
    'usd' => 1400,
    'gbp' => 1200,
    'eur' => 1000,
]);

$ratio = [
    'usd' => 1,
    'gbp' => 1.37,
    'eur' => 1.22,
];

$collection->reduce(function (int $carry, int $value, string $key) use ($ratio) {
    return $carry + ($value * $ratio[$key]);
}, 0);

// 4264
```

<a id="method-reduce-into"></a>
#### `reduceInto()` {.collection-method}

El método `reduceInto` reduce la colección a un único valor modificando el valor inicial dado. A diferencia del método `reduce`, el callback dado no necesita devolver el valor acumulado:

```php
class OrderStats
{
    public int $total = 0;

    public int $count = 0;
}

$orders = collect([
    ['amount' => 100],
    ['amount' => 250],
    ['amount' => 50],
]);

$stats = $orders->reduceInto(new OrderStats, function (OrderStats $stats, array $order) {
    $stats->total += $order['amount'];
    $stats->count++;
});

$stats->total;

// 400
```

Al reducir a un escalar o array, debes aceptarlo por referencia en el callback para que las modificaciones se apliquen al valor original:

```php
$collection = collect([1, 2, 3, 4, 5]);

$even = $collection->reduceInto([], function (array &$result, int $value) {
    if ($value % 2 === 0) {
        $result[] = $value;
    }
});

// [2, 4]
```

<a id="method-reduce-spread"></a>
#### `reduceSpread()` {.collection-method}

El método `reduceSpread` reduce la colección a un array de valores, pasando los resultados de cada iteración a la siguiente. Este método es similar al método `reduce`; sin embargo, puede aceptar varios valores iniciales:

```php
[$creditsRemaining, $batch] = Image::where('status', 'unprocessed')
    ->get()
    ->reduceSpread(function (int $creditsRemaining, Collection $batch, Image $image) {
        if ($creditsRemaining >= $image->creditsRequired()) {
            $batch->push($image);

            $creditsRemaining -= $image->creditsRequired();
        }

        return [$creditsRemaining, $batch];
    }, $creditsAvailable, collect());
```

<a id="method-reject"></a>
#### `reject()` {.collection-method}

El método `reject` filtra la colección mediante la función anónima dada. La función anónima debe devolver `true` si el elemento debe eliminarse de la colección resultante:

```php
$collection = collect([1, 2, 3, 4]);

$filtered = $collection->reject(function (int $value, int $key) {
    return $value > 2;
});

$filtered->all();

// [1, 2]
```

Para la operación inversa del método `reject`, consulta el método [filter](#method-filter).

<a id="method-replace"></a>
#### `replace()` {.collection-method}

El método `replace` se comporta de forma similar a `merge`; sin embargo, además de sobrescribir los elementos coincidentes con claves de cadena, el método `replace` también sobrescribe los elementos de la colección que tengan claves numéricas coincidentes:

```php
$collection = collect(['Taylor', 'Abigail', 'James']);

$replaced = $collection->replace([1 => 'Victoria', 3 => 'Finn']);

$replaced->all();

// ['Taylor', 'Victoria', 'James', 'Finn']
```

<a id="method-replacerecursive"></a>
#### `replaceRecursive()` {.collection-method}

El método `replaceRecursive` se comporta de forma similar a `replace`, pero recorre los arrays recursivamente y aplica el mismo proceso de reemplazo a los valores internos:

```php
$collection = collect([
    'Taylor',
    'Abigail',
    [
        'James',
        'Victoria',
        'Finn'
    ]
]);

$replaced = $collection->replaceRecursive([
    'Charlie',
    2 => [1 => 'King']
]);

$replaced->all();

// ['Charlie', 'Abigail', ['James', 'King', 'Finn']]
```

<a id="method-reverse"></a>
#### `reverse()` {.collection-method}

El método `reverse` invierte el orden de los elementos de la colección y conserva las claves originales:

```php
$collection = collect(['a', 'b', 'c', 'd', 'e']);

$reversed = $collection->reverse();

$reversed->all();

/*
    [
        4 => 'e',
        3 => 'd',
        2 => 'c',
        1 => 'b',
        0 => 'a',
    ]
*/
```

<a id="method-search"></a>
#### `search()` {.collection-method}

El método `search` busca el valor dado en la colección y devuelve su clave si lo encuentra. Si no se encuentra el elemento, devuelve `false`:

```php
$collection = collect([2, 4, 6, 8]);

$collection->search(4);

// 1
```

La búsqueda se realiza mediante una comparación «flexible», lo que significa que una cadena con un valor entero se considera igual a un entero del mismo valor. Para usar una comparación «estricta», pasa `true` como segundo argumento al método:

```php
collect([2, 4, 6, 8])->search('4', strict: true);

// false
```

Como alternativa, puedes proporcionar tu propia función anónima para buscar el primer elemento que cumpla una condición dada:

```php
collect([2, 4, 6, 8])->search(function (int $item, int $key) {
    return $item > 5;
});

// 2
```

<a id="method-select"></a>
#### `select()` {.collection-method}

El método `select` selecciona las claves dadas de la colección, de forma similar a una instrucción SQL `SELECT`:

```php
$users = collect([
    ['name' => 'Taylor Otwell', 'role' => 'Developer', 'status' => 'active'],
    ['name' => 'Victoria Faith', 'role' => 'Researcher', 'status' => 'active'],
]);

$users->select(['name', 'role']);

/*
    [
        ['name' => 'Taylor Otwell', 'role' => 'Developer'],
        ['name' => 'Victoria Faith', 'role' => 'Researcher'],
    ],
*/
```

<a id="method-shift"></a>
#### `shift()` {.collection-method}

El método `shift` elimina y devuelve el primer elemento de la colección:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->shift();

// 1

$collection->all();

// [2, 3, 4, 5]
```

Puedes pasar un entero al método `shift` para eliminar y devolver varios elementos del principio de una colección:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->shift(3);

// collect([1, 2, 3])

$collection->all();

// [4, 5]
```

<a id="method-shuffle"></a>
#### `shuffle()` {.collection-method}

El método `shuffle` mezcla aleatoriamente los elementos de la colección:

```php
$collection = collect([1, 2, 3, 4, 5]);

$shuffled = $collection->shuffle();

$shuffled->all();

// [3, 2, 5, 1, 4] - (generated randomly)
```

<a id="method-skip"></a>
#### `skip()` {.collection-method}

El método `skip` devuelve una nueva colección en la que se ha eliminado del principio el número dado de elementos:

```php
$collection = collect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

$collection = $collection->skip(4);

$collection->all();

// [5, 6, 7, 8, 9, 10]
```

<a id="method-skipuntil"></a>
#### `skipUntil()` {.collection-method}

El método `skipUntil` omite elementos de la colección mientras el callback dado devuelve `false`. Una vez que el callback devuelve `true`, todos los elementos restantes de la colección se devuelven como una nueva colección:

```php
$collection = collect([1, 2, 3, 4]);

$subset = $collection->skipUntil(function (int $item) {
    return $item >= 3;
});

$subset->all();

// [3, 4]
```

También puedes pasar un valor simple al método `skipUntil` para omitir todos los elementos hasta encontrar el valor dado:

```php
$collection = collect([1, 2, 3, 4]);

$subset = $collection->skipUntil(3);

$subset->all();

// [3, 4]
```

> **Advertencia:**
> Si no se encuentra el valor dado o el callback nunca devuelve `true`, el método `skipUntil` devuelve una colección vacía.

<a id="method-skipwhile"></a>
#### `skipWhile()` {.collection-method}

El método `skipWhile` omite elementos de la colección mientras el callback dado devuelve `true`. Una vez que el callback devuelve `false`, todos los elementos restantes de la colección se devuelven como una nueva colección:

```php
$collection = collect([1, 2, 3, 4]);

$subset = $collection->skipWhile(function (int $item) {
    return $item <= 3;
});

$subset->all();

// [4]
```

> **Advertencia:**
> Si el callback nunca devuelve `false`, el método `skipWhile` devuelve una colección vacía.

<a id="method-slice"></a>
#### `slice()` {.collection-method}

El método `slice` devuelve una porción de la colección que comienza en el índice dado:

```php
$collection = collect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

$slice = $collection->slice(4);

$slice->all();

// [5, 6, 7, 8, 9, 10]
```

Si quieres limitar el tamaño de la porción devuelta, pasa el tamaño deseado como segundo argumento al método:

```php
$slice = $collection->slice(4, 2);

$slice->all();

// [5, 6]
```

La porción devuelta conservará las claves de forma predeterminada. Si no quieres conservar las claves originales, puedes usar el método [values](#method-values) para reindexarlas.

<a id="method-sliding"></a>
#### `sliding()` {.collection-method}

El método `sliding` devuelve una nueva colección de fragmentos que representan una vista de «ventana deslizante» de los elementos de la colección:

```php
$collection = collect([1, 2, 3, 4, 5]);

$chunks = $collection->sliding(2);

$chunks->toArray();

// [[1, 2], [2, 3], [3, 4], [4, 5]]
```

Esto es especialmente útil en combinación con el método [eachSpread](#method-eachspread):

```php
$transactions->sliding(2)->eachSpread(function ($previous, $current) {
    $current->total = $previous->total + $current->amount;
});
```

De forma opcional, puedes pasar un segundo valor de «paso», que determina la distancia entre el primer elemento de cada fragmento:

```php
$collection = collect([1, 2, 3, 4, 5]);

$chunks = $collection->sliding(3, step: 2);

$chunks->toArray();

// [[1, 2, 3], [3, 4, 5]]
```

<a id="method-sole"></a>
#### `sole()` {.collection-method}

El método `sole` devuelve el primer elemento de la colección que cumple una condición dada, pero solo si la condición coincide exactamente con un elemento:

```php
collect([1, 2, 3, 4])->sole(function (int $value, int $key) {
    return $value === 2;
});

// 2
```

También puedes pasar un par clave / valor al método `sole`, que devolverá el primer elemento de la colección que coincida con el par dado, pero solo si coincide exactamente un elemento:

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Chair', 'price' => 100],
]);

$collection->sole('product', 'Chair');

// ['product' => 'Chair', 'price' => 100]
```

Como alternativa, también puedes invocar el método `sole` sin argumentos para obtener el primer elemento de la colección si solo hay un elemento:

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
]);

$collection->sole();

// ['product' => 'Desk', 'price' => 200]
```

Si no hay elementos en la colección que el método `sole` deba devolver, se lanzará una excepción `\Illuminate\Support\ItemNotFoundException`. Si hay más de un elemento que deba devolver, se lanzará una excepción `\Illuminate\Support\MultipleItemsFoundException`.

<a id="method-some"></a>
#### `some()` {.collection-method}

Alias del método [contains](#method-contains).

<a id="method-sort"></a>
#### `sort()` {.collection-method}

El método `sort` ordena la colección. La colección ordenada mantiene las claves originales del array, por lo que en el siguiente ejemplo usaremos el método [values](#method-values) para restablecer las claves a índices numerados consecutivamente:

```php
$collection = collect([5, 3, 1, 2, 4]);

$sorted = $collection->sort();

$sorted->values()->all();

// [1, 2, 3, 4, 5]
```

Si tus necesidades de ordenación son más avanzadas, puedes pasar un callback a `sort` con tu propio algoritmo. Consulta la documentación de PHP sobre [uasort](https://secure.php.net/manual/en/function.uasort.php#refsect1-function.uasort-parameters), que es la función que el método `sort` de la colección utiliza internamente.

> **Nota:**
> Si necesitas ordenar una colección de arrays anidados u objetos, consulta los métodos [sortBy](#method-sortby) y [sortByDesc](#method-sortbydesc).

<a id="method-sortby"></a>
#### `sortBy()` {.collection-method}

El método `sortBy` ordena la colección según la clave dada. La colección ordenada mantiene las claves originales del array, por lo que en el siguiente ejemplo usaremos el método [values](#method-values) para restablecer las claves a índices numerados consecutivamente:

```php
$collection = collect([
    ['name' => 'Desk', 'price' => 200],
    ['name' => 'Chair', 'price' => 100],
    ['name' => 'Bookcase', 'price' => 150],
]);

$sorted = $collection->sortBy('price');

$sorted->values()->all();

/*
    [
        ['name' => 'Chair', 'price' => 100],
        ['name' => 'Bookcase', 'price' => 150],
        ['name' => 'Desk', 'price' => 200],
    ]
*/
```

El método `sortBy` acepta [opciones de ordenación](https://www.php.net/manual/en/function.sort.php) como segundo argumento:

```php
$collection = collect([
    ['title' => 'Item 1'],
    ['title' => 'Item 12'],
    ['title' => 'Item 3'],
]);

$sorted = $collection->sortBy('title', SORT_NATURAL);

$sorted->values()->all();

/*
    [
        ['title' => 'Item 1'],
        ['title' => 'Item 3'],
        ['title' => 'Item 12'],
    ]
*/
```

Como alternativa, puedes pasar tu propia función anónima para determinar cómo ordenar los valores de la colección:

```php
$collection = collect([
    ['name' => 'Desk', 'colors' => ['Black', 'Mahogany']],
    ['name' => 'Chair', 'colors' => ['Black']],
    ['name' => 'Bookcase', 'colors' => ['Red', 'Beige', 'Brown']],
]);

$sorted = $collection->sortBy(function (array $product, int $key) {
    return count($product['colors']);
});

$sorted->values()->all();

/*
    [
        ['name' => 'Chair', 'colors' => ['Black']],
        ['name' => 'Desk', 'colors' => ['Black', 'Mahogany']],
        ['name' => 'Bookcase', 'colors' => ['Red', 'Beige', 'Brown']],
    ]
*/
```

Si quieres ordenar la colección por varios atributos, puedes pasar un array de operaciones de ordenación al método `sortBy`. Cada operación debe ser un array que contenga el atributo por el que quieres ordenar y la dirección de la ordenación deseada:

```php
$collection = collect([
    ['name' => 'Taylor Otwell', 'age' => 34],
    ['name' => 'Abigail Otwell', 'age' => 30],
    ['name' => 'Taylor Otwell', 'age' => 36],
    ['name' => 'Abigail Otwell', 'age' => 32],
]);

$sorted = $collection->sortBy([
    ['name', 'asc'],
    ['age', 'desc'],
]);

$sorted->values()->all();

/*
    [
        ['name' => 'Abigail Otwell', 'age' => 32],
        ['name' => 'Abigail Otwell', 'age' => 30],
        ['name' => 'Taylor Otwell', 'age' => 36],
        ['name' => 'Taylor Otwell', 'age' => 34],
    ]
*/
```

Al ordenar una colección por varios atributos, también puedes proporcionar funciones anónimas que definan cada operación de ordenación:

```php
$collection = collect([
    ['name' => 'Taylor Otwell', 'age' => 34],
    ['name' => 'Abigail Otwell', 'age' => 30],
    ['name' => 'Taylor Otwell', 'age' => 36],
    ['name' => 'Abigail Otwell', 'age' => 32],
]);

$sorted = $collection->sortBy([
    fn (array $a, array $b) => $a['name'] <=> $b['name'],
    fn (array $a, array $b) => $b['age'] <=> $a['age'],
]);

$sorted->values()->all();

/*
    [
        ['name' => 'Abigail Otwell', 'age' => 32],
        ['name' => 'Abigail Otwell', 'age' => 30],
        ['name' => 'Taylor Otwell', 'age' => 36],
        ['name' => 'Taylor Otwell', 'age' => 34],
    ]
*/
```

<a id="method-sortbydesc"></a>
#### `sortByDesc()` {.collection-method}

Este método tiene la misma firma que el método [sortBy](#method-sortby), pero ordena la colección en el orden opuesto.

<a id="method-sortdesc"></a>
#### `sortDesc()` {.collection-method}

Este método ordena la colección en el orden opuesto al método [sort](#method-sort):

```php
$collection = collect([5, 3, 1, 2, 4]);

$sorted = $collection->sortDesc();

$sorted->values()->all();

// [5, 4, 3, 2, 1]
```

A diferencia de `sort`, no puedes pasar una función anónima a `sortDesc`. En su lugar, debes usar el método [sort](#method-sort) e invertir la comparación.

<a id="method-sortkeys"></a>
#### `sortKeys()` {.collection-method}

El método `sortKeys` ordena la colección según las claves del array asociativo subyacente:

```php
$collection = collect([
    'id' => 22345,
    'first' => 'John',
    'last' => 'Doe',
]);

$sorted = $collection->sortKeys();

$sorted->all();

/*
    [
        'first' => 'John',
        'id' => 22345,
        'last' => 'Doe',
    ]
*/
```

<a id="method-sortkeysdesc"></a>
#### `sortKeysDesc()` {.collection-method}

Este método tiene la misma firma que el método [sortKeys](#method-sortkeys), pero ordena la colección en el orden opuesto.

<a id="method-sortkeysusing"></a>
#### `sortKeysUsing()` {.collection-method}

El método `sortKeysUsing` ordena la colección según las claves del array asociativo subyacente mediante un callback:

```php
$collection = collect([
    'ID' => 22345,
    'first' => 'John',
    'last' => 'Doe',
]);

$sorted = $collection->sortKeysUsing('strnatcasecmp');

$sorted->all();

/*
    [
        'first' => 'John',
        'ID' => 22345,
        'last' => 'Doe',
    ]
*/
```

El callback debe ser una función de comparación que devuelva un entero menor, igual o mayor que cero. Para obtener más información, consulta la documentación de PHP sobre [uksort](https://www.php.net/manual/en/function.uksort.php#refsect1-function.uksort-parameters), que es la función de PHP que el método `sortKeysUsing` utiliza internamente.

<a id="method-splice"></a>
#### `splice()` {.collection-method}

El método `splice` elimina y devuelve una porción de elementos que comienza en el índice especificado:

```php
$collection = collect([1, 2, 3, 4, 5]);

$chunk = $collection->splice(2);

$chunk->all();

// [3, 4, 5]

$collection->all();

// [1, 2]
```

Puedes pasar un segundo argumento para limitar el tamaño de la colección resultante:

```php
$collection = collect([1, 2, 3, 4, 5]);

$chunk = $collection->splice(2, 1);

$chunk->all();

// [3]

$collection->all();

// [1, 2, 4, 5]
```

Además, puedes pasar un tercer argumento que contenga los nuevos elementos para reemplazar los elementos eliminados de la colección:

```php
$collection = collect([1, 2, 3, 4, 5]);

$chunk = $collection->splice(2, 1, [10, 11]);

$chunk->all();

// [3]

$collection->all();

// [1, 2, 10, 11, 4, 5]
```

<a id="method-split"></a>
#### `split()` {.collection-method}

El método `split` divide una colección en el número dado de grupos:

```php
$collection = collect([1, 2, 3, 4, 5]);

$groups = $collection->split(3);

$groups->all();

// [[1, 2], [3, 4], [5]]
```

<a id="method-splitin"></a>
#### `splitIn()` {.collection-method}

El método `splitIn` divide una colección en el número dado de grupos y llena por completo los grupos no finales antes de asignar los elementos restantes al grupo final:

```php
$collection = collect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

$groups = $collection->splitIn(3);

$groups->all();

// [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10]]
```

<a id="method-sum"></a>
#### `sum()` {.collection-method}

El método `sum` devuelve la suma de todos los elementos de la colección:

```php
collect([1, 2, 3, 4, 5])->sum();

// 15
```

Si la colección contiene arrays anidados u objetos, debes pasar una clave que se usará para determinar qué valores sumar:

```php
$collection = collect([
    ['name' => 'JavaScript: The Good Parts', 'pages' => 176],
    ['name' => 'JavaScript: The Definitive Guide', 'pages' => 1096],
]);

$collection->sum('pages');

// 1272
```

Además, puedes pasar tu propia función anónima para determinar qué valores de la colección sumar:

```php
$collection = collect([
    ['name' => 'Chair', 'colors' => ['Black']],
    ['name' => 'Desk', 'colors' => ['Black', 'Mahogany']],
    ['name' => 'Bookcase', 'colors' => ['Red', 'Beige', 'Brown']],
]);

$collection->sum(function (array $product) {
    return count($product['colors']);
});

// 6
```

<a id="method-take"></a>
#### `take()` {.collection-method}

El método `take` devuelve una nueva colección con el número especificado de elementos:

```php
$collection = collect([0, 1, 2, 3, 4, 5]);

$chunk = $collection->take(3);

$chunk->all();

// [0, 1, 2]
```

También puedes pasar un entero negativo para tomar el número especificado de elementos del final de la colección:

```php
$collection = collect([0, 1, 2, 3, 4, 5]);

$chunk = $collection->take(-2);

$chunk->all();

// [4, 5]
```

<a id="method-takeuntil"></a>
#### `takeUntil()` {.collection-method}

El método `takeUntil` devuelve los elementos de la colección hasta que el callback dado devuelve `true`:

```php
$collection = collect([1, 2, 3, 4]);

$subset = $collection->takeUntil(function (int $item) {
    return $item >= 3;
});

$subset->all();

// [1, 2]
```

También puedes pasar un valor simple al método `takeUntil` para obtener los elementos hasta encontrar el valor dado:

```php
$collection = collect([1, 2, 3, 4]);

$subset = $collection->takeUntil(3);

$subset->all();

// [1, 2]
```

> **Advertencia:**
> Si no se encuentra el valor dado o el callback nunca devuelve `true`, el método `takeUntil` devuelve todos los elementos de la colección.

<a id="method-takewhile"></a>
#### `takeWhile()` {.collection-method}

El método `takeWhile` devuelve los elementos de la colección hasta que el callback dado devuelve `false`:

```php
$collection = collect([1, 2, 3, 4]);

$subset = $collection->takeWhile(function (int $item) {
    return $item < 3;
});

$subset->all();

// [1, 2]
```

> **Advertencia:**
> Si el callback nunca devuelve `false`, el método `takeWhile` devuelve todos los elementos de la colección.

<a id="method-tap"></a>
#### `tap()` {.collection-method}

El método `tap` pasa la colección al callback dado, lo que permite intervenir en la colección en un punto específico y hacer algo con los elementos sin afectar a la propia colección. Después, el método `tap` devuelve la colección:

```php
collect([2, 4, 3, 1, 5])
    ->sort()
    ->tap(function (Collection $collection) {
        Log::debug('Values after sorting', $collection->values()->all());
    })
    ->shift();

// 1
```

<a id="method-times"></a>
#### `times()` {.collection-method}

El método estático `times` crea una nueva colección invocando la función anónima dada el número especificado de veces:

```php
$collection = Collection::times(10, function (int $number) {
    return $number * 9;
});

$collection->all();

// [9, 18, 27, 36, 45, 54, 63, 72, 81, 90]
```

<a id="method-toarray"></a>
#### `toArray()` {.collection-method}

El método `toArray` convierte la colección en un `array` de PHP simple. Si los valores de la colección son modelos de [Eloquent](../eloquent/), los modelos también se convertirán en arrays:

```php
$collection = collect(['name' => 'Desk', 'price' => 200]);

$collection->toArray();

// ['name' => 'Desk', 'price' => 200]
```

> **Advertencia:**
> `toArray` también convierte en arrays todos los objetos anidados de la colección que sean instancias de `Arrayable`. Si quieres obtener el array subyacente de la colección sin procesar, usa el método [all](#method-all).

<a id="method-tojson"></a>
#### `toJson()` {.collection-method}

El método `toJson` convierte la colección en una cadena serializada en JSON:

```php
$collection = collect(['name' => 'Desk', 'price' => 200]);

$collection->toJson();

// '{"name":"Desk","price":200}'
```

<a id="method-to-pretty-json"></a>
#### `toPrettyJson()` {.collection-method}

El método `toPrettyJson` convierte la colección en una cadena JSON con formato mediante la opción `JSON_PRETTY_PRINT`:

```php
$collection = collect(['name' => 'Desk', 'price' => 200]);

$collection->toPrettyJson();
```

<a id="method-transform"></a>
#### `transform()` {.collection-method}

El método `transform` recorre la colección e invoca el callback dado con cada elemento de la colección. Los elementos de la colección se reemplazarán por los valores devueltos por el callback:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->transform(function (int $item, int $key) {
    return $item * 2;
});

$collection->all();

// [2, 4, 6, 8, 10]
```

> **Advertencia:**
> A diferencia de la mayoría de los demás métodos de colección, `transform` modifica la propia colección. Si quieres crear una nueva colección, usa el método [map](#method-map).

<a id="method-undot"></a>
#### `undot()` {.collection-method}

El método `undot` expande una colección unidimensional que usa la notación de puntos en una colección multidimensional:

```php
$person = collect([
    'name.first_name' => 'Marie',
    'name.last_name' => 'Valentine',
    'address.line_1' => '2992 Eagle Drive',
    'address.line_2' => '',
    'address.suburb' => 'Detroit',
    'address.state' => 'MI',
    'address.postcode' => '48219'
]);

$person = $person->undot();

$person->toArray();

/*
    [
        "name" => [
            "first_name" => "Marie",
            "last_name" => "Valentine",
        ],
        "address" => [
            "line_1" => "2992 Eagle Drive",
            "line_2" => "",
            "suburb" => "Detroit",
            "state" => "MI",
            "postcode" => "48219",
        ],
    ]
*/
```

<a id="method-union"></a>
#### `union()` {.collection-method}

El método `union` agrega el array dado a la colección. Si el array dado contiene claves que ya están en la colección original, se dará preferencia a los valores de la colección original:

```php
$collection = collect([1 => ['a'], 2 => ['b']]);

$union = $collection->union([3 => ['c'], 1 => ['d']]);

$union->all();

// [1 => ['a'], 2 => ['b'], 3 => ['c']]
```

<a id="method-unique"></a>
#### `unique()` {.collection-method}

El método `unique` devuelve todos los elementos únicos de la colección. La colección devuelta mantiene las claves originales del array, por lo que en el siguiente ejemplo usaremos el método [values](#method-values) para restablecer las claves a índices numerados consecutivamente:

```php
$collection = collect([1, 1, 2, 2, 3, 4, 2]);

$unique = $collection->unique();

$unique->values()->all();

// [1, 2, 3, 4]
```

Al trabajar con arrays anidados u objetos, puedes especificar la clave que se usará para determinar la unicidad:

```php
$collection = collect([
    ['name' => 'iPhone 6', 'brand' => 'Apple', 'type' => 'phone'],
    ['name' => 'iPhone 5', 'brand' => 'Apple', 'type' => 'phone'],
    ['name' => 'Apple Watch', 'brand' => 'Apple', 'type' => 'watch'],
    ['name' => 'Galaxy S6', 'brand' => 'Samsung', 'type' => 'phone'],
    ['name' => 'Galaxy Gear', 'brand' => 'Samsung', 'type' => 'watch'],
]);

$unique = $collection->unique('brand');

$unique->values()->all();

/*
    [
        ['name' => 'iPhone 6', 'brand' => 'Apple', 'type' => 'phone'],
        ['name' => 'Galaxy S6', 'brand' => 'Samsung', 'type' => 'phone'],
    ]
*/
```

Por último, también puedes pasar tu propia función anónima al método `unique` para especificar qué valor debe determinar la unicidad de un elemento:

```php
$unique = $collection->unique(function (array $item) {
    return $item['brand'].$item['type'];
});

$unique->values()->all();

/*
    [
        ['name' => 'iPhone 6', 'brand' => 'Apple', 'type' => 'phone'],
        ['name' => 'Apple Watch', 'brand' => 'Apple', 'type' => 'watch'],
        ['name' => 'Galaxy S6', 'brand' => 'Samsung', 'type' => 'phone'],
        ['name' => 'Galaxy Gear', 'brand' => 'Samsung', 'type' => 'watch'],
    ]
*/
```

El método `unique` usa comparaciones «flexibles» al comprobar los valores de los elementos, lo que significa que una cadena con un valor entero se considera igual a un entero del mismo valor. Usa el método [uniqueStrict](#method-uniquestrict) para filtrar mediante comparaciones «estrictas».

> **Nota:**
> El comportamiento de este método cambia al usar [colecciones de Eloquent](../eloquent-collections/#method-unique).

<a id="method-uniquestrict"></a>
#### `uniqueStrict()` {.collection-method}

Este método tiene la misma firma que el método [unique](#method-unique); sin embargo, todos los valores se comparan mediante comparaciones «estrictas».

<a id="method-unless"></a>
#### `unless()` {.collection-method}

El método `unless` ejecuta el callback dado a menos que el primer argumento pasado al método se evalúe como `true`. La instancia de colección y el primer argumento pasado al método `unless` se proporcionan a la función anónima:

```php
$collection = collect([1, 2, 3]);

$collection->unless(true, function (Collection $collection, bool $value) {
    return $collection->push(4);
});

$collection->unless(false, function (Collection $collection, bool $value) {
    return $collection->push(5);
});

$collection->all();

// [1, 2, 3, 5]
```

Puedes pasar un segundo callback al método `unless`. El segundo callback se ejecutará cuando el primer argumento pasado al método `unless` se evalúe como `true`:

```php
$collection = collect([1, 2, 3]);

$collection->unless(true, function (Collection $collection, bool $value) {
    return $collection->push(4);
}, function (Collection $collection, bool $value) {
    return $collection->push(5);
});

$collection->all();

// [1, 2, 3, 5]
```

Para la operación inversa de `unless`, consulta el método [when](#method-when).

<a id="method-unlessempty"></a>
#### `unlessEmpty()` {.collection-method}

Alias del método [whenNotEmpty](#method-whennotempty).

<a id="method-unlessnotempty"></a>
#### `unlessNotEmpty()` {.collection-method}

Alias del método [whenEmpty](#method-whenempty).

<a id="method-unwrap"></a>
#### `unwrap()` {.collection-method}

El método estático `unwrap` devuelve los elementos subyacentes de la colección a partir del valor dado cuando corresponde:

```php
Collection::unwrap(collect('John Doe'));

// ['John Doe']

Collection::unwrap(['John Doe']);

// ['John Doe']

Collection::unwrap('John Doe');

// 'John Doe'
```

<a id="method-value"></a>
#### `value()` {.collection-method}

El método `value` obtiene un valor dado del primer elemento de la colección:

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Speaker', 'price' => 400],
]);

$value = $collection->value('price');

// 200
```

<a id="method-values"></a>
#### `values()` {.collection-method}

El método `values` devuelve una nueva colección con las claves restablecidas a enteros consecutivos:

```php
$collection = collect([
    10 => ['product' => 'Desk', 'price' => 200],
    11 => ['product' => 'Speaker', 'price' => 400],
]);

$values = $collection->values();

$values->all();

/*
    [
        0 => ['product' => 'Desk', 'price' => 200],
        1 => ['product' => 'Speaker', 'price' => 400],
    ]
*/
```

<a id="method-when"></a>
#### `when()` {.collection-method}

El método `when` ejecuta el callback dado cuando el primer argumento pasado al método se evalúa como `true`. La instancia de colección y el primer argumento pasado al método `when` se proporcionan a la función anónima:

```php
$collection = collect([1, 2, 3]);

$collection->when(true, function (Collection $collection, bool $value) {
    return $collection->push(4);
});

$collection->when(false, function (Collection $collection, bool $value) {
    return $collection->push(5);
});

$collection->all();

// [1, 2, 3, 4]
```

Puedes pasar un segundo callback al método `when`. El segundo callback se ejecutará cuando el primer argumento pasado al método `when` se evalúe como `false`:

```php
$collection = collect([1, 2, 3]);

$collection->when(false, function (Collection $collection, bool $value) {
    return $collection->push(4);
}, function (Collection $collection, bool $value) {
    return $collection->push(5);
});

$collection->all();

// [1, 2, 3, 5]
```

Para la operación inversa de `when`, consulta el método [unless](#method-unless).

<a id="method-whenempty"></a>
#### `whenEmpty()` {.collection-method}

El método `whenEmpty` ejecuta el callback dado cuando la colección está vacía:

```php
$collection = collect(['Michael', 'Tom']);

$collection->whenEmpty(function (Collection $collection) {
    return $collection->push('Adam');
});

$collection->all();

// ['Michael', 'Tom']

$collection = collect();

$collection->whenEmpty(function (Collection $collection) {
    return $collection->push('Adam');
});

$collection->all();

// ['Adam']
```

Puedes pasar una segunda función anónima al método `whenEmpty`, que se ejecutará cuando la colección no esté vacía:

```php
$collection = collect(['Michael', 'Tom']);

$collection->whenEmpty(function (Collection $collection) {
    return $collection->push('Adam');
}, function (Collection $collection) {
    return $collection->push('Taylor');
});

$collection->all();

// ['Michael', 'Tom', 'Taylor']
```

Para la operación inversa de `whenEmpty`, consulta el método [whenNotEmpty](#method-whennotempty).

<a id="method-whennotempty"></a>
#### `whenNotEmpty()` {.collection-method}

El método `whenNotEmpty` ejecuta el callback dado cuando la colección no está vacía:

```php
$collection = collect(['Michael', 'Tom']);

$collection->whenNotEmpty(function (Collection $collection) {
    return $collection->push('Adam');
});

$collection->all();

// ['Michael', 'Tom', 'Adam']

$collection = collect();

$collection->whenNotEmpty(function (Collection $collection) {
    return $collection->push('Adam');
});

$collection->all();

// []
```

Puedes pasar una segunda función anónima al método `whenNotEmpty`, que se ejecutará cuando la colección esté vacía:

```php
$collection = collect();

$collection->whenNotEmpty(function (Collection $collection) {
    return $collection->push('Adam');
}, function (Collection $collection) {
    return $collection->push('Taylor');
});

$collection->all();

// ['Taylor']
```

Para la operación inversa de `whenNotEmpty`, consulta el método [whenEmpty](#method-whenempty).

<a id="method-where"></a>
#### `where()` {.collection-method}

El método `where` filtra la colección según un par clave / valor dado:

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Chair', 'price' => 100],
    ['product' => 'Bookcase', 'price' => 150],
    ['product' => 'Door', 'price' => 100],
]);

$filtered = $collection->where('price', 100);

$filtered->all();

/*
    [
        ['product' => 'Chair', 'price' => 100],
        ['product' => 'Door', 'price' => 100],
    ]
*/
```

El método `where` usa comparaciones «flexibles» al comprobar los valores de los elementos, lo que significa que una cadena con un valor entero se considera igual a un entero del mismo valor. Usa el método [whereStrict](#method-wherestrict) para filtrar mediante comparaciones «estrictas», o los métodos [whereNull](#method-wherenull) y [whereNotNull](#method-wherenotnull) para filtrar valores `null`.

De forma opcional, puedes pasar un operador de comparación como segundo parámetro. Los operadores admitidos son: '===', '!==', '!=', '==', '=', '<>', '>', '<', '>=' y '<=':

```php
$collection = collect([
    ['name' => 'Jim', 'platform' => 'Mac'],
    ['name' => 'Sally', 'platform' => 'Mac'],
    ['name' => 'Sue', 'platform' => 'Linux'],
]);

$filtered = $collection->where('platform', '!=', 'Linux');

$filtered->all();

/*
    [
        ['name' => 'Jim', 'platform' => 'Mac'],
        ['name' => 'Sally', 'platform' => 'Mac'],
    ]
*/
```

<a id="method-wherestrict"></a>
#### `whereStrict()` {.collection-method}

Este método tiene la misma firma que el método [where](#method-where); sin embargo, todos los valores se comparan mediante comparaciones «estrictas».

<a id="method-wherebetween"></a>
#### `whereBetween()` {.collection-method}

El método `whereBetween` filtra la colección determinando si un valor de elemento especificado está dentro de un intervalo dado:

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Chair', 'price' => 80],
    ['product' => 'Bookcase', 'price' => 150],
    ['product' => 'Pencil', 'price' => 30],
    ['product' => 'Door', 'price' => 100],
]);

$filtered = $collection->whereBetween('price', [100, 200]);

$filtered->all();

/*
    [
        ['product' => 'Desk', 'price' => 200],
        ['product' => 'Bookcase', 'price' => 150],
        ['product' => 'Door', 'price' => 100],
    ]
*/
```

<a id="method-wherein"></a>
#### `whereIn()` {.collection-method}

El método `whereIn` elimina de la colección los elementos que no tienen un valor de elemento especificado contenido en el array dado:

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Chair', 'price' => 100],
    ['product' => 'Bookcase', 'price' => 150],
    ['product' => 'Door', 'price' => 100],
]);

$filtered = $collection->whereIn('price', [150, 200]);

$filtered->all();

/*
    [
        ['product' => 'Desk', 'price' => 200],
        ['product' => 'Bookcase', 'price' => 150],
    ]
*/
```

El método `whereIn` usa comparaciones «flexibles» al comprobar los valores de los elementos, lo que significa que una cadena con un valor entero se considera igual a un entero del mismo valor. Usa el método [whereInStrict](#method-whereinstrict) para filtrar mediante comparaciones «estrictas».

<a id="method-whereinstrict"></a>
#### `whereInStrict()` {.collection-method}

Este método tiene la misma firma que el método [whereIn](#method-wherein); sin embargo, todos los valores se comparan mediante comparaciones «estrictas».

<a id="method-whereinstanceof"></a>
#### `whereInstanceOf()` {.collection-method}

El método `whereInstanceOf` filtra la colección según un tipo de clase dado:

```php
use App\Models\User;
use App\Models\Post;

$collection = collect([
    new User,
    new User,
    new Post,
]);

$filtered = $collection->whereInstanceOf(User::class);

$filtered->all();

// [App\Models\User, App\Models\User]
```

<a id="method-wherenotbetween"></a>
#### `whereNotBetween()` {.collection-method}

El método `whereNotBetween` filtra la colección determinando si un valor de elemento especificado está fuera de un intervalo dado:

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Chair', 'price' => 80],
    ['product' => 'Bookcase', 'price' => 150],
    ['product' => 'Pencil', 'price' => 30],
    ['product' => 'Door', 'price' => 100],
]);

$filtered = $collection->whereNotBetween('price', [100, 200]);

$filtered->all();

/*
    [
        ['product' => 'Chair', 'price' => 80],
        ['product' => 'Pencil', 'price' => 30],
    ]
*/
```

<a id="method-wherenotin"></a>
#### `whereNotIn()` {.collection-method}

El método `whereNotIn` elimina de la colección los elementos que tienen un valor de elemento especificado contenido en el array dado:

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Chair', 'price' => 100],
    ['product' => 'Bookcase', 'price' => 150],
    ['product' => 'Door', 'price' => 100],
]);

$filtered = $collection->whereNotIn('price', [150, 200]);

$filtered->all();

/*
    [
        ['product' => 'Chair', 'price' => 100],
        ['product' => 'Door', 'price' => 100],
    ]
*/
```

El método `whereNotIn` usa comparaciones «flexibles» al comprobar los valores de los elementos, lo que significa que una cadena con un valor entero se considera igual a un entero del mismo valor. Usa el método [whereNotInStrict](#method-wherenotinstrict) para filtrar mediante comparaciones «estrictas».

<a id="method-wherenotinstrict"></a>
#### `whereNotInStrict()` {.collection-method}

Este método tiene la misma firma que el método [whereNotIn](#method-wherenotin); sin embargo, todos los valores se comparan mediante comparaciones «estrictas».

<a id="method-wherenotnull"></a>
#### `whereNotNull()` {.collection-method}

El método `whereNotNull` devuelve los elementos de la colección cuya clave dada no es `null`:

```php
$collection = collect([
    ['name' => 'Desk'],
    ['name' => null],
    ['name' => 'Bookcase'],
    ['name' => 0],
    ['name' => ''],
]);

$filtered = $collection->whereNotNull('name');

$filtered->all();

/*
    [
        ['name' => 'Desk'],
        ['name' => 'Bookcase'],
        ['name' => 0],
        ['name' => ''],
    ]
*/
```

<a id="method-wherenull"></a>
#### `whereNull()` {.collection-method}

El método `whereNull` devuelve los elementos de la colección cuya clave dada es `null`:

```php
$collection = collect([
    ['name' => 'Desk'],
    ['name' => null],
    ['name' => 'Bookcase'],
    ['name' => 0],
    ['name' => ''],
]);

$filtered = $collection->whereNull('name');

$filtered->all();

/*
    [
        ['name' => null],
    ]
*/
```

<a id="method-wrap"></a>
#### `wrap()` {.collection-method}

El método estático `wrap` envuelve el valor dado en una colección cuando corresponde:

```php
use Illuminate\Support\Collection;

$collection = Collection::wrap('John Doe');

$collection->all();

// ['John Doe']

$collection = Collection::wrap(['John Doe']);

$collection->all();

// ['John Doe']

$collection = Collection::wrap(collect('John Doe'));

$collection->all();

// ['John Doe']
```

<a id="method-zip"></a>
#### `zip()` {.collection-method}

El método `zip` combina los valores del array dado con los valores de la colección original en sus índices correspondientes:

```php
$collection = collect(['Chair', 'Desk']);

$zipped = $collection->zip([100, 200]);

$zipped->all();

// [['Chair', 100], ['Desk', 200]]
```

<a id="higher-order-messages"></a>
## Mensajes de orden superior

Las colecciones también admiten «mensajes de orden superior», que son atajos para realizar acciones comunes sobre colecciones. Los métodos de colección que proporcionan mensajes de orden superior son: [average](#method-average), [avg](#method-avg), [contains](#method-contains), [each](#method-each), [every](#method-every), [filter](#method-filter), [first](#method-first), [flatMap](#method-flatmap), [groupBy](#method-groupby), [keyBy](#method-keyby), [map](#method-map), [max](#method-max), [min](#method-min), [partition](#method-partition), [reject](#method-reject), [skipUntil](#method-skipuntil), [skipWhile](#method-skipwhile), [some](#method-some), [sortBy](#method-sortby), [sortByDesc](#method-sortbydesc), [sum](#method-sum), [takeUntil](#method-takeuntil), [takeWhile](#method-takewhile) y [unique](#method-unique).

Se puede acceder a cada mensaje de orden superior como una propiedad dinámica de una instancia de colección. Por ejemplo, usemos el mensaje de orden superior `each` para invocar un método en cada objeto de una colección:

```php
use App\Models\User;

$users = User::where('votes', '>', 500)->get();

$users->each->markAsVip();
```

Del mismo modo, podemos usar el mensaje de orden superior `sum` para obtener el número total de «votos» de una colección de usuarios:

```php
$users = User::where('group', 'Development')->get();

return $users->sum->votes;
```

<a id="lazy-collections"></a>
## Colecciones diferidas

<a id="lazy-collection-introduction"></a>
### Introducción

> **Advertencia:**
> Antes de aprender más sobre las colecciones diferidas de Laravel, dedica un tiempo a familiarizarte con los [generadores de PHP](https://www.php.net/manual/en/language.generators.overview.php).

Como complemento de la ya potente clase `Collection`, la clase `LazyCollection` utiliza los [generadores](https://www.php.net/manual/en/language.generators.overview.php) de PHP para permitirte trabajar con conjuntos de datos muy grandes y mantener bajo el uso de memoria.

Por ejemplo, imagina que tu aplicación necesita procesar un archivo de registro de varios gigabytes y aprovechar los métodos de colección de Laravel para analizar los registros. En lugar de leer todo el archivo en memoria de una vez, se pueden usar colecciones diferidas para mantener solo una pequeña parte del archivo en memoria en cada momento:

```php
use App\Models\LogEntry;
use Illuminate\Support\LazyCollection;

LazyCollection::make(function () {
    $handle = fopen('log.txt', 'r');

    while (($line = fgets($handle)) !== false) {
        yield $line;
    }

    fclose($handle);
})->chunk(4)->map(function (LazyCollection $lines) {
    return LogEntry::fromLines($lines);
})->each(function (LogEntry $logEntry) {
    // Process the log entry...
});
```

O imagina que necesitas recorrer 10,000 modelos de Eloquent. Al usar las colecciones tradicionales de Laravel, los 10,000 modelos de Eloquent deben cargarse en memoria al mismo tiempo:

```php
use App\Models\User;

$users = User::all()->filter(function (User $user) {
    return $user->id > 500;
});
```

Sin embargo, el método `cursor` del constructor de consultas devuelve una instancia de `LazyCollection`. Esto permite seguir ejecutando una sola consulta a la base de datos, pero manteniendo solo un modelo de Eloquent cargado en memoria en cada momento. En este ejemplo, el callback `filter` no se ejecuta hasta que realmente recorremos cada usuario individualmente, lo que permite reducir drásticamente el uso de memoria:

```php
use App\Models\User;

$users = User::cursor()->filter(function (User $user) {
    return $user->id > 500;
});

foreach ($users as $user) {
    echo $user->id;
}
```

<a id="creating-lazy-collections"></a>
### Crear colecciones diferidas

Para crear una instancia de colección diferida, debes pasar una función generadora de PHP al método `make` de la colección:

```php
use Illuminate\Support\LazyCollection;

LazyCollection::make(function () {
    $handle = fopen('log.txt', 'r');

    while (($line = fgets($handle)) !== false) {
        yield $line;
    }

    fclose($handle);
});
```

<a id="the-enumerable-contract"></a>
### El contrato Enumerable

Casi todos los métodos disponibles en la clase `Collection` también están disponibles en la clase `LazyCollection`. Ambas clases implementan el contrato `Illuminate\Support\Enumerable`, que define los siguientes métodos:

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

<div class="collection-method-list" markdown="1">

[all](#method-all)
[average](#method-average)
[avg](#method-avg)
[chunk](#method-chunk)
[chunkBy](#method-chunkby)
[chunkWhile](#method-chunkwhile)
[collapse](#method-collapse)
[collect](#method-collect)
[combine](#method-combine)
[concat](#method-concat)
[contains](#method-contains)
[containsStrict](#method-containsstrict)
[count](#method-count)
[countBy](#method-countBy)
[crossJoin](#method-crossjoin)
[dd](#method-dd)
[diff](#method-diff)
[diffAssoc](#method-diffassoc)
[diffKeys](#method-diffkeys)
[dump](#method-dump)
[duplicates](#method-duplicates)
[duplicatesStrict](#method-duplicatesstrict)
[each](#method-each)
[eachSpread](#method-eachspread)
[every](#method-every)
[except](#method-except)
[filter](#method-filter)
[first](#method-first)
[firstOrFail](#method-first-or-fail)
[firstWhere](#method-first-where)
[flatMap](#method-flatmap)
[flatten](#method-flatten)
[flip](#method-flip)
[forPage](#method-forpage)
[get](#method-get)
[groupBy](#method-groupby)
[has](#method-has)
[implode](#method-implode)
[intersect](#method-intersect)
[intersectAssoc](#method-intersectAssoc)
[intersectByKeys](#method-intersectbykeys)
[isEmpty](#method-isempty)
[isNotEmpty](#method-isnotempty)
[join](#method-join)
[keyBy](#method-keyby)
[keys](#method-keys)
[last](#method-last)
[macro](#method-macro)
[make](#method-make)
[map](#method-map)
[mapInto](#method-mapinto)
[mapSpread](#method-mapspread)
[mapToGroups](#method-maptogroups)
[mapWithKeys](#method-mapwithkeys)
[max](#method-max)
[median](#method-median)
[merge](#method-merge)
[mergeRecursive](#method-mergerecursive)
[min](#method-min)
[mode](#method-mode)
[nth](#method-nth)
[only](#method-only)
[pad](#method-pad)
[partition](#method-partition)
[pipe](#method-pipe)
[pluck](#method-pluck)
[random](#method-random)
[reduce](#method-reduce)
[reduceInto](#method-reduce-into)
[reject](#method-reject)
[replace](#method-replace)
[replaceRecursive](#method-replacerecursive)
[reverse](#method-reverse)
[search](#method-search)
[shuffle](#method-shuffle)
[skip](#method-skip)
[slice](#method-slice)
[sole](#method-sole)
[some](#method-some)
[sort](#method-sort)
[sortBy](#method-sortby)
[sortByDesc](#method-sortbydesc)
[sortKeys](#method-sortkeys)
[sortKeysDesc](#method-sortkeysdesc)
[split](#method-split)
[sum](#method-sum)
[take](#method-take)
[tap](#method-tap)
[times](#method-times)
[toArray](#method-toarray)
[toJson](#method-tojson)
[union](#method-union)
[unique](#method-unique)
[uniqueStrict](#method-uniquestrict)
[unless](#method-unless)
[unlessEmpty](#method-unlessempty)
[unlessNotEmpty](#method-unlessnotempty)
[unwrap](#method-unwrap)
[values](#method-values)
[when](#method-when)
[whenEmpty](#method-whenempty)
[whenNotEmpty](#method-whennotempty)
[where](#method-where)
[whereStrict](#method-wherestrict)
[whereBetween](#method-wherebetween)
[whereIn](#method-wherein)
[whereInStrict](#method-whereinstrict)
[whereInstanceOf](#method-whereinstanceof)
[whereNotBetween](#method-wherenotbetween)
[whereNotIn](#method-wherenotin)
[whereNotInStrict](#method-wherenotinstrict)
[wrap](#method-wrap)
[zip](#method-zip)

</div>

> **Advertencia:**
> Los métodos que modifican la colección (como `shift`, `pop`, `prepend`, etc.) **no** están disponibles en la clase `LazyCollection`.

<a id="lazy-collection-methods"></a>
### Métodos de las colecciones diferidas

Además de los métodos definidos en el contrato `Enumerable`, la clase `LazyCollection` contiene los siguientes métodos:

<a id="method-takeUntilTimeout"></a>
#### `takeUntilTimeout()` {.collection-method}

El método `takeUntilTimeout` devuelve una nueva colección diferida que enumerará valores hasta la hora especificada. Después de esa hora, la colección dejará de enumerarlos:

```php
$lazyCollection = LazyCollection::times(INF)
    ->takeUntilTimeout(now()->plus(minutes: 1));

$lazyCollection->each(function (int $number) {
    dump($number);

    sleep(1);
});

// 1
// 2
// ...
// 58
// 59
```

Para ilustrar el uso de este método, imagina una aplicación que envía facturas de la base de datos mediante un cursor. Podrías definir una [tarea programada](../scheduling/) que se ejecute cada 15 minutos y procese facturas durante un máximo de 14 minutos:

```php
use App\Models\Invoice;
use Illuminate\Support\Carbon;

Invoice::pending()->cursor()
    ->takeUntilTimeout(
        Carbon::createFromTimestamp(LARAVEL_START)->add(14, 'minutes')
    )
    ->each(fn (Invoice $invoice) => $invoice->submit());
```

<a id="method-tapEach"></a>
#### `tapEach()` {.collection-method}

Mientras que el método `each` invoca de inmediato el callback dado para cada elemento de la colección, el método `tapEach` solo invoca el callback dado a medida que los elementos se extraen de la lista uno por uno:

```php
// Nothing has been dumped so far...
$lazyCollection = LazyCollection::times(INF)->tapEach(function (int $value) {
    dump($value);
});

// Three items are dumped...
$array = $lazyCollection->take(3)->all();

// 1
// 2
// 3
```

<a id="method-throttle"></a>
#### `throttle()` {.collection-method}

El método `throttle` limita la velocidad de la colección diferida para que cada valor se devuelva después del número especificado de segundos. Este método es especialmente útil en situaciones en las que interactúas con API externas que limitan la frecuencia de las solicitudes entrantes:

```php
use App\Models\User;

User::where('vip', true)
    ->cursor()
    ->throttle(seconds: 1)
    ->each(function (User $user) {
        // Call external API...
    });
```

<a id="method-remember"></a>
#### `remember()` {.collection-method}

El método `remember` devuelve una nueva colección diferida que recuerda los valores que ya se han enumerado y no vuelve a obtenerlos en enumeraciones posteriores de la colección:

```php
// No query has been executed yet...
$users = User::cursor()->remember();

// The query is executed...
// The first 5 users are hydrated from the database...
$users->take(5)->all();

// First 5 users come from the collection's cache...
// The rest are hydrated from the database...
$users->take(20)->all();
```

<a id="method-with-heartbeat"></a>
#### `withHeartbeat()` {.collection-method}

El método `withHeartbeat` permite ejecutar un callback a intervalos regulares mientras se enumera una colección diferida. Esto es especialmente útil para operaciones prolongadas que requieren tareas de mantenimiento periódicas, como extender bloqueos o enviar actualizaciones del progreso:

```php
use Carbon\CarbonInterval;
use Illuminate\Support\Facades\Cache;

$lock = Cache::lock('generate-reports', seconds: 60 * 5);

if ($lock->get()) {
    try {
        Report::where('status', 'pending')
            ->lazy()
            ->withHeartbeat(
                CarbonInterval::minutes(4),
                fn () => $lock->refresh()
            )
            ->each(fn ($report) => $report->process());
    } finally {
        $lock->release();
    }
}
```
