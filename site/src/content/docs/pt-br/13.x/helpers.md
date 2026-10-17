---
title: "Helpers"
---

- [Introdução](#introduction)
- [Métodos Disponíveis](#available-methods)
- [Outros Utilitários](#other-utilities)
    - [Benchmarking](#benchmarking)
    - [Datas e Horas](#dates)
    - [Funções Adiadas](#deferred-functions)
    - [Lottery](#lottery)
    - [Pipeline](#pipeline)
    - [Sleep](#sleep)
    - [Timebox](#timebox)
    - [URI](#uri)

<a id="introduction"></a>
## Introdução

O Laravel inclui uma variedade de funções PHP "helper" globais. Muitas dessas funções são usadas pelo próprio framework; no entanto, você é livre para usá-las em suas próprias aplicações se as considerar convenientes.

<a id="available-methods"></a>
## Métodos Disponíveis

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
### Arrays e Objetos

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
### Caminhos

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
### Diversos

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
## Arrays e Objetos

<a id="method-array-accessible"></a>
#### `Arr::accessible()` {.collection-method .first-collection-method}

O método `Arr::accessible` determina se o valor fornecido é acessível como array:

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

O método `Arr::add` adiciona um determinado par chave / valor a um array se a chave fornecida ainda não existir no array ou estiver definida como `null`:

```php
use Illuminate\Support\Arr;

$array = Arr::add(['name' => 'Desk'], 'price', 100);

// ['name' => 'Desk', 'price' => 100]

$array = Arr::add(['name' => 'Desk', 'price' => null], 'price', 100);

// ['name' => 'Desk', 'price' => 100]
```

<a id="method-array-array"></a>
#### `Arr::array()` {.collection-method}

O método `Arr::array` recupera um valor de um array profundamente aninhado usando a notação de "ponto" (assim como [Arr::get()](#method-array-get) faz), mas lança uma `InvalidArgumentException` se o valor solicitado não for um `array`:

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

O método `Arr::boolean` recupera um valor de um array profundamente aninhado usando a notação de "ponto" (assim como [Arr::get()](#method-array-get) faz), mas lança uma `InvalidArgumentException` se o valor solicitado não for um `boolean`:

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

O método `Arr::collapse` reduz um array de arrays ou collections em um único array:

```php
use Illuminate\Support\Arr;

$array = Arr::collapse([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);

// [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

<a id="method-array-crossjoin"></a>
#### `Arr::crossJoin()` {.collection-method}

O método `Arr::crossJoin` faz o cross join dos arrays fornecidos, retornando um produto cartesiano com todas as permutações possíveis:

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

O método `Arr::divide` retorna dois arrays: um contendo as chaves e o outro contendo os valores do array fornecido:

```php
use Illuminate\Support\Arr;

[$keys, $values] = Arr::divide(['name' => 'Desk']);

// $keys: ['name']

// $values: ['Desk']
```

<a id="method-array-dot"></a>
#### `Arr::dot()` {.collection-method}

O método `Arr::dot` achata um array multidimensional em um array de um único nível que usa a notação de "ponto" para indicar a profundidade:

```php
use Illuminate\Support\Arr;

$array = ['products' => ['desk' => ['price' => 100]]];

$flattened = Arr::dot($array);

// ['products.desk.price' => 100]
```

<a id="method-array-every"></a>
#### `Arr::every()` {.collection-method}

O método `Arr::every` garante que todos os valores do array passem por um determinado teste de verdade:

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

O método `Arr::except` remove os pares chave / valor fornecidos de um array:

```php
use Illuminate\Support\Arr;

$array = ['name' => 'Desk', 'price' => 100];

$filtered = Arr::except($array, ['price']);

// ['name' => 'Desk']
```

<a id="method-array-except-values"></a>
#### `Arr::exceptValues()` {.collection-method}

O método `Arr::exceptValues` remove os valores especificados de um array:

```php
use Illuminate\Support\Arr;

$array = ['foo', 'bar', 'baz', 'qux'];

$filtered = Arr::exceptValues($array, ['foo', 'baz']);

// ['bar', 'qux']
```

Você também pode passar `true` para o argumento `strict` para usar comparações estritas de tipo ao filtrar:

```php
use Illuminate\Support\Arr;

$array = [1, '1', 2, '2'];

$filtered = Arr::exceptValues($array, [1, 2], strict: true);

// ['1', '2']
```

<a id="method-array-exists"></a>
#### `Arr::exists()` {.collection-method}

O método `Arr::exists` verifica se a chave fornecida existe no array informado:

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

O método `Arr::first` retorna o primeiro elemento de um array que passa por um determinado teste de verdade:

```php
use Illuminate\Support\Arr;

$array = [100, 200, 300];

$first = Arr::first($array, function (int $value, int $key) {
    return $value >= 150;
});

// 200
```

Um valor padrão também pode ser passado como terceiro parâmetro do método. Esse valor será retornado se nenhum valor passar no teste de verdade:

```php
use Illuminate\Support\Arr;

$first = Arr::first($array, $callback, $default);
```

<a id="method-array-flatten"></a>
#### `Arr::flatten()` {.collection-method}

O método `Arr::flatten` achata um array multidimensional em um array de um único nível:

```php
use Illuminate\Support\Arr;

$array = ['name' => 'Joe', 'languages' => ['PHP', 'Ruby']];

$flattened = Arr::flatten($array);

// ['Joe', 'PHP', 'Ruby']
```

<a id="method-array-float"></a>
#### `Arr::float()` {.collection-method}

O método `Arr::float` recupera um valor de um array profundamente aninhado usando a notação de "ponto" (assim como [Arr::get()](#method-array-get) faz), mas lança uma `InvalidArgumentException` se o valor solicitado não for um `float`:

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

O método `Arr::forget` remove um determinado par chave / valor de um array profundamente aninhado usando a notação de "ponto":

```php
use Illuminate\Support\Arr;

$array = ['products' => ['desk' => ['price' => 100]]];

Arr::forget($array, 'products.desk');

// ['products' => []]
```

<a id="method-array-from"></a>
#### `Arr::from()` {.collection-method}

O método `Arr::from` converte diversos tipos de entrada em um array PHP simples. Ele suporta uma variedade de tipos de entrada, incluindo arrays, objetos e várias interfaces comuns do Laravel, como `Arrayable`, `Enumerable`, `Jsonable` e `JsonSerializable`. Além disso, ele lida com instâncias de `Traversable` e `WeakMap`:

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

O método `Arr::get` recupera um valor de um array profundamente aninhado usando a notação de "ponto":

```php
use Illuminate\Support\Arr;

$array = ['products' => ['desk' => ['price' => 100]]];

$price = Arr::get($array, 'products.desk.price');

// 100
```

O método `Arr::get` também aceita um valor padrão, que será retornado se a chave especificada não estiver presente no array:

```php
use Illuminate\Support\Arr;

$discount = Arr::get($array, 'products.desk.discount', 0);

// 0
```

<a id="method-array-has"></a>
#### `Arr::has()` {.collection-method}

O método `Arr::has` verifica se um determinado item ou itens existem em um array usando a notação de "ponto":

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

O método `Arr::hasAll` determina se todas as chaves especificadas existem no array fornecido usando a notação de "ponto":

```php
use Illuminate\Support\Arr;

$array = ['name' => 'Taylor', 'language' => 'PHP'];

Arr::hasAll($array, ['name']); // true
Arr::hasAll($array, ['name', 'language']); // true
Arr::hasAll($array, ['name', 'IDE']); // false
```

<a id="method-array-hasany"></a>
#### `Arr::hasAny()` {.collection-method}

O método `Arr::hasAny` verifica se qualquer item de um determinado conjunto existe em um array usando a notação de "ponto":

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

O método `Arr::integer` recupera um valor de um array profundamente aninhado usando a notação de "ponto" (assim como [Arr::get()](#method-array-get) faz), mas lança uma `InvalidArgumentException` se o valor solicitado não for um `int`:

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

O método `Arr::isAssoc` retorna `true` se o array fornecido for um array associativo. Um array é considerado "associativo" se não possuir chaves numéricas sequenciais começando em zero:

```php
use Illuminate\Support\Arr;

$isAssoc = Arr::isAssoc(['product' => ['name' => 'Desk', 'price' => 100]]);

// true

$isAssoc = Arr::isAssoc([1, 2, 3]);

// false
```

<a id="method-array-islist"></a>
#### `Arr::isList()` {.collection-method}

O método `Arr::isList` retorna `true` se as chaves do array fornecido forem inteiros sequenciais começando em zero:

```php
use Illuminate\Support\Arr;

$isList = Arr::isList(['foo', 'bar', 'baz']);

// true

$isList = Arr::isList(['product' => ['name' => 'Desk', 'price' => 100]]);

// false
```

<a id="method-array-join"></a>
#### `Arr::join()` {.collection-method}

O método `Arr::join` une os elementos do array com uma string. Usando o terceiro argumento desse método, você também pode especificar a string de união para o elemento final do array:

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

O método `Arr::keyBy` indexa o array pela chave fornecida. Se vários itens tiverem a mesma chave, apenas o último aparecerá no novo array:

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

O método `Arr::last` retorna o último elemento de um array que passa por um determinado teste de verdade:

```php
use Illuminate\Support\Arr;

$array = [100, 200, 300, 110];

$last = Arr::last($array, function (int $value, int $key) {
    return $value >= 150;
});

// 300
```

Um valor padrão pode ser passado como terceiro argumento do método. Esse valor será retornado se nenhum valor passar no teste de verdade:

```php
use Illuminate\Support\Arr;

$last = Arr::last($array, $callback, $default);
```

<a id="method-array-map"></a>
#### `Arr::map()` {.collection-method}

O método `Arr::map` itera pelo array e passa cada valor e chave para o callback fornecido. O valor do array é substituído pelo valor retornado pelo callback:

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

O método `Arr::mapSpread` itera sobre o array, passando o valor de cada item aninhado para a closure fornecida. A closure é livre para modificar o item e retorná-lo, formando assim um novo array de itens modificados:

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

O método `Arr::mapWithKeys` itera pelo array e passa cada valor para o callback fornecido. O callback deve retornar um array associativo contendo um único par chave / valor:

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

O método `Arr::only` retorna apenas os pares chave / valor especificados do array fornecido:

```php
use Illuminate\Support\Arr;

$array = ['name' => 'Desk', 'price' => 100, 'orders' => 10];

$slice = Arr::only($array, ['name', 'price']);

// ['name' => 'Desk', 'price' => 100]
```

<a id="method-array-only-values"></a>
#### `Arr::onlyValues()` {.collection-method}

O método `Arr::onlyValues` retorna apenas os valores especificados de um array:

```php
use Illuminate\Support\Arr;

$array = ['foo', 'bar', 'baz', 'qux'];

$filtered = Arr::onlyValues($array, ['foo', 'baz']);

// ['foo', 'baz']
```

Você também pode passar `true` para o argumento `strict` para usar comparações estritas de tipo ao filtrar:

```php
use Illuminate\Support\Arr;

$array = [1, '1', 2, '2'];

$filtered = Arr::onlyValues($array, [1, 2], strict: true);

// [1, 2]
```

<a id="method-array-partition"></a>
#### `Arr::partition()` {.collection-method}

O método `Arr::partition` pode ser combinado com a desestruturação de arrays do PHP para separar os elementos que passam por um determinado teste de verdade daqueles que não passam:

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

O método `Arr::pluck` recupera todos os valores de uma determinada chave de um array:

```php
use Illuminate\Support\Arr;

$array = [
    ['developer' => ['id' => 1, 'name' => 'Taylor']],
    ['developer' => ['id' => 2, 'name' => 'Abigail']],
];

$names = Arr::pluck($array, 'developer.name');

// ['Taylor', 'Abigail']
```

Você também pode especificar como deseja que a lista resultante seja indexada:

```php
use Illuminate\Support\Arr;

$names = Arr::pluck($array, 'developer.name', 'developer.id');

// [1 => 'Taylor', 2 => 'Abigail']
```

<a id="method-array-prepend"></a>
#### `Arr::prepend()` {.collection-method}

O método `Arr::prepend` inserirá um item no início de um array:

```php
use Illuminate\Support\Arr;

$array = ['one', 'two', 'three', 'four'];

$array = Arr::prepend($array, 'zero');

// ['zero', 'one', 'two', 'three', 'four']
```

Se necessário, você pode especificar a chave que deve ser usada para o valor:

```php
use Illuminate\Support\Arr;

$array = ['price' => 100];

$array = Arr::prepend($array, 'Desk', 'name');

// ['name' => 'Desk', 'price' => 100]
```

<a id="method-array-prependkeyswith"></a>
#### `Arr::prependKeysWith()` {.collection-method}

O método `Arr::prependKeysWith` adiciona o prefixo fornecido a todos os nomes de chave de um array associativo:

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

O método `Arr::pull` retorna e remove um par chave / valor de um array:

```php
use Illuminate\Support\Arr;

$array = ['name' => 'Desk', 'price' => 100];

$name = Arr::pull($array, 'name');

// $name: Desk

// $array: ['price' => 100]
```

Um valor padrão pode ser passado como terceiro argumento do método. Esse valor será retornado se a chave não existir:

```php
use Illuminate\Support\Arr;

$value = Arr::pull($array, $key, $default);
```

<a id="method-array-push"></a>
#### `Arr::push()` {.collection-method}

O método `Arr::push` insere um item em um array usando a notação de "ponto". Se um array não existir na chave fornecida, ele será criado:

```php
use Illuminate\Support\Arr;

$array = [];

Arr::push($array, 'office.furniture', 'Desk');

// $array: ['office' => ['furniture' => ['Desk']]]
```

<a id="method-array-query"></a>
#### `Arr::query()` {.collection-method}

O método `Arr::query` converte o array em uma query string:

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

O método `Arr::random` retorna um valor aleatório de um array:

```php
use Illuminate\Support\Arr;

$array = [1, 2, 3, 4, 5];

$random = Arr::random($array);

// 4 - (retrieved randomly)
```

Você também pode especificar a quantidade de itens a retornar como um segundo argumento opcional. Observe que fornecer esse argumento retornará um array mesmo que apenas um item seja desejado:

```php
use Illuminate\Support\Arr;

$items = Arr::random($array, 2);

// [2, 5] - (retrieved randomly)
```

<a id="method-array-reject"></a>
#### `Arr::reject()` {.collection-method}

O método `Arr::reject` remove itens de um array usando a closure fornecida:

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

O método `Arr::select` seleciona um array de valores de um array:

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

O método `Arr::set` define um valor dentro de um array profundamente aninhado usando a notação de "ponto":

```php
use Illuminate\Support\Arr;

$array = ['products' => ['desk' => ['price' => 100]]];

Arr::set($array, 'products.desk.price', 200);

// ['products' => ['desk' => ['price' => 200]]]
```

<a id="method-array-shuffle"></a>
#### `Arr::shuffle()` {.collection-method}

O método `Arr::shuffle` embaralha aleatoriamente os itens do array:

```php
use Illuminate\Support\Arr;

$array = Arr::shuffle([1, 2, 3, 4, 5]);

// [3, 2, 5, 1, 4] - (generated randomly)
```

<a id="method-array-sole"></a>
#### `Arr::sole()` {.collection-method}

O método `Arr::sole` recupera um único valor de um array usando a closure fornecida. Se mais de um valor dentro do array corresponder ao teste de verdade fornecido, uma exceção `Illuminate\Support\MultipleItemsFoundException` será lançada. Se nenhum valor corresponder ao teste de verdade, uma exceção `Illuminate\Support\ItemNotFoundException` será lançada:

```php
use Illuminate\Support\Arr;

$array = ['Desk', 'Table', 'Chair'];

$value = Arr::sole($array, fn (string $value) => $value === 'Desk');

// 'Desk'
```

<a id="method-array-some"></a>
#### `Arr::some()` {.collection-method}

O método `Arr::some` garante que pelo menos um dos valores do array passe por um determinado teste de verdade:

```php
use Illuminate\Support\Arr;

$array = [1, 2, 3];

Arr::some($array, fn ($i) => $i > 2);

// true
```

<a id="method-array-sort"></a>
#### `Arr::sort()` {.collection-method}

O método `Arr::sort` ordena um array por seus valores:

```php
use Illuminate\Support\Arr;

$array = ['Desk', 'Table', 'Chair'];

$sorted = Arr::sort($array);

// ['Chair', 'Desk', 'Table']
```

Você também pode ordenar o array pelos resultados de uma closure fornecida:

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

O método `Arr::sortDesc` ordena um array em ordem decrescente por seus valores:

```php
use Illuminate\Support\Arr;

$array = ['Desk', 'Table', 'Chair'];

$sorted = Arr::sortDesc($array);

// ['Table', 'Desk', 'Chair']
```

Você também pode ordenar o array pelos resultados de uma closure fornecida:

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

O método `Arr::sortRecursive` ordena recursivamente um array usando a função `sort` para sub-arrays indexados numericamente e a função `ksort` para sub-arrays associativos:

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

Se você quiser que os resultados sejam ordenados em ordem decrescente, pode usar o método `Arr::sortRecursiveDesc`.

```php
$sorted = Arr::sortRecursiveDesc($array);
```

<a id="method-array-string"></a>
#### `Arr::string()` {.collection-method}

O método `Arr::string` recupera um valor de um array profundamente aninhado usando a notação de "ponto" (assim como [Arr::get()](#method-array-get) faz), mas lança uma `InvalidArgumentException` se o valor solicitado não for uma `string`:

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

O método `Arr::take` retorna um novo array com o número especificado de itens:

```php
use Illuminate\Support\Arr;

$array = [0, 1, 2, 3, 4, 5];

$chunk = Arr::take($array, 3);

// [0, 1, 2]
```

Você também pode passar um inteiro negativo para pegar o número especificado de itens a partir do final do array:

```php
$array = [0, 1, 2, 3, 4, 5];

$chunk = Arr::take($array, -2);

// [4, 5]
```

<a id="method-array-to-css-classes"></a>
#### `Arr::toCssClasses()` {.collection-method}

O método `Arr::toCssClasses` compila condicionalmente uma string de classes CSS. O método aceita um array de classes em que a chave do array contém a classe ou classes que você deseja adicionar, enquanto o valor é uma expressão booleana. Se o elemento do array tiver uma chave numérica, ele sempre será incluído na lista de classes renderizada:

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

O método `Arr::toCssStyles` compila condicionalmente uma string de estilos CSS. O método aceita um array de declarações CSS em que a chave do array contém a declaração CSS que você deseja adicionar, enquanto o valor é uma expressão booleana. Se o elemento do array tiver uma chave numérica, ele sempre será incluído na string de estilos CSS compilada:

```php
use Illuminate\Support\Arr;

$hasColor = true;

$array = ['background-color: blue', 'color: blue' => $hasColor];

$classes = Arr::toCssStyles($array);

/*
    'background-color: blue; color: blue;'
*/
```

Esse método alimenta a funcionalidade do Laravel que permite [mesclar classes com o attribute bag de um componente Blade](/en/blade/#conditionally-merge-classes), bem como a [diretiva Blade](/en/blade/#conditional-classes) `@class`.

<a id="method-array-undot"></a>
#### `Arr::undot()` {.collection-method}

O método `Arr::undot` expande um array unidimensional que usa a notação de "ponto" em um array multidimensional:

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

O método `Arr::where` filtra um array usando a closure fornecida:

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

O método `Arr::whereNotNull` remove todos os valores `null` do array fornecido:

```php
use Illuminate\Support\Arr;

$array = [0, null];

$filtered = Arr::whereNotNull($array);

// [0 => 0]
```

<a id="method-array-wrap"></a>
#### `Arr::wrap()` {.collection-method}

O método `Arr::wrap` envolve o valor fornecido em um array. Se o valor fornecido já for um array, ele será retornado sem modificação:

```php
use Illuminate\Support\Arr;

$string = 'Laravel';

$array = Arr::wrap($string);

// ['Laravel']
```

Se o valor fornecido for `null`, um array vazio será retornado:

```php
use Illuminate\Support\Arr;

$array = Arr::wrap(null);

// []
```

<a id="method-data-fill"></a>
#### `data_fill()` {.collection-method}

A função `data_fill` define um valor ausente dentro de um array ou objeto aninhado usando a notação de "ponto":

```php
$data = ['products' => ['desk' => ['price' => 100]]];

data_fill($data, 'products.desk.price', 200);

// ['products' => ['desk' => ['price' => 100]]]

data_fill($data, 'products.desk.discount', 10);

// ['products' => ['desk' => ['price' => 100, 'discount' => 10]]]
```

Essa função também aceita asteriscos como curingas e preencherá o alvo adequadamente:

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

A função `data_get` recupera um valor de um array ou objeto aninhado usando a notação de "ponto":

```php
$data = ['products' => ['desk' => ['price' => 100]]];

$price = data_get($data, 'products.desk.price');

// 100
```

A função `data_get` também aceita um valor padrão, que será retornado se a chave especificada não for encontrada:

```php
$discount = data_get($data, 'products.desk.discount', 0);

// 0
```

A função também aceita curingas usando asteriscos, que podem apontar para qualquer chave do array ou objeto:

```php
$data = [
    'product-one' => ['name' => 'Desk 1', 'price' => 100],
    'product-two' => ['name' => 'Desk 2', 'price' => 150],
];

data_get($data, '*.name');

// ['Desk 1', 'Desk 2'];
```

Os placeholders `{first}` e `{last}` podem ser usados para recuperar o primeiro ou o último item de um array:

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

A função `data_set` define um valor dentro de um array ou objeto aninhado usando a notação de "ponto":

```php
$data = ['products' => ['desk' => ['price' => 100]]];

data_set($data, 'products.desk.price', 200);

// ['products' => ['desk' => ['price' => 200]]]
```

Essa função também aceita curingas usando asteriscos e definirá valores no alvo adequadamente:

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

Por padrão, quaisquer valores existentes são sobrescritos. Se você quiser definir um valor apenas se ele não existir, pode passar `false` como quarto argumento da função:

```php
$data = ['products' => ['desk' => ['price' => 100]]];

data_set($data, 'products.desk.price', 200, overwrite: false);

// ['products' => ['desk' => ['price' => 100]]]
```

<a id="method-data-forget"></a>
#### `data_forget()` {.collection-method}

A função `data_forget` remove um valor dentro de um array ou objeto aninhado usando a notação de "ponto":

```php
$data = ['products' => ['desk' => ['price' => 100]]];

data_forget($data, 'products.desk.price');

// ['products' => ['desk' => []]]
```

Essa função também aceita curingas usando asteriscos e removerá valores no alvo adequadamente:

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

A função `head` retorna o primeiro elemento do array fornecido. Se o array estiver vazio, `false` será retornado:

```php
$array = [100, 200, 300];

$first = head($array);

// 100
```

<a id="method-last"></a>
#### `last()` {.collection-method}

A função `last` retorna o último elemento do array fornecido. Se o array estiver vazio, `false` será retornado:

```php
$array = [100, 200, 300];

$last = last($array);

// 300
```

<a id="numbers"></a>
## Números

<a id="method-number-abbreviate"></a>
#### `Number::abbreviate()` {.collection-method}

O método `Number::abbreviate` retorna o formato legível por humanos do valor numérico fornecido, com uma abreviação para as unidades:

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

O método `Number::clamp` garante que um determinado número permaneça dentro de um intervalo especificado. Se o número for menor que o mínimo, o valor mínimo é retornado. Se o número for maior que o máximo, o valor máximo é retornado:

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

O método `Number::currency` retorna a representação monetária do valor fornecido como uma string:

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

O método `Number::defaultCurrency` retorna a moeda padrão que está sendo usada pela classe `Number`:

```php
use Illuminate\Support\Number;

$currency = Number::defaultCurrency();

// USD
```

<a id="method-default-locale"></a>
#### `Number::defaultLocale()` {.collection-method}

O método `Number::defaultLocale` retorna o locale padrão que está sendo usado pela classe `Number`:

```php
use Illuminate\Support\Number;

$locale = Number::defaultLocale();

// en
```

<a id="method-number-file-size"></a>
#### `Number::fileSize()` {.collection-method}

O método `Number::fileSize` retorna a representação do tamanho de arquivo do valor em bytes fornecido como uma string:

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

O método `Number::forHumans` retorna o formato legível por humanos do valor numérico fornecido:

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

O método `Number::format` formata o número fornecido em uma string específica do locale:

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

O método `Number::ordinal` retorna a representação ordinal de um número:

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

O método `Number::pairs` gera um array de pares de números (sub-intervalos) com base em um intervalo e um valor de passo especificados. Esse método pode ser útil para dividir um intervalo maior de números em sub-intervalos menores e gerenciáveis para coisas como paginação ou tarefas em lote. O método `pairs` retorna um array de arrays, em que cada array interno representa um par (sub-intervalo) de números:

```php
use Illuminate\Support\Number;

$result = Number::pairs(25, 10);

// [[0, 9], [10, 19], [20, 25]]

$result = Number::pairs(25, 10, offset: 0);

// [[0, 10], [10, 20], [20, 25]]
```

<a id="method-number-parse"></a>
#### `Number::parse()` {.collection-method}

O método `Number::parse` analisa uma string numérica localizada usando o `NumberFormatter` do PHP:

```php
use Illuminate\Support\Number;

$result = Number::parse('10,123', locale: 'en');

// 10123.0

$result = Number::parse('10,123', locale: 'fr');

// 10.123
```

<a id="method-number-parse-int"></a>
#### `Number::parseInt()` {.collection-method}

O método `Number::parseInt` analisa uma string em um inteiro de acordo com o locale especificado:

```php
use Illuminate\Support\Number;

$result = Number::parseInt('10.123');

// (int) 10

$result = Number::parseInt('10,123', locale: 'fr');

// (int) 10
```

<a id="method-number-parse-float"></a>
#### `Number::parseFloat()` {.collection-method}

O método `Number::parseFloat` analisa uma string em um float de acordo com o locale especificado:

```php
use Illuminate\Support\Number;

$result = Number::parseFloat('10');

// (float) 10.0

$result = Number::parseFloat('10', locale: 'fr');

// (float) 10.0
```

<a id="method-number-percentage"></a>
#### `Number::percentage()` {.collection-method}

O método `Number::percentage` retorna a representação percentual do valor fornecido como uma string:

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

O método `Number::spell` transforma o número fornecido em uma string de palavras:

```php
use Illuminate\Support\Number;

$number = Number::spell(102);

// one hundred and two

$number = Number::spell(88, locale: 'fr');

// quatre-vingt-huit
```

O argumento `after` permite especificar um valor a partir do qual todos os números devem ser escritos por extenso:

```php
$number = Number::spell(10, after: 10);

// 10

$number = Number::spell(11, after: 10);

// eleven
```

O argumento `until` permite especificar um valor antes do qual todos os números devem ser escritos por extenso:

```php
$number = Number::spell(5, until: 10);

// five

$number = Number::spell(10, until: 10);

// 10
```

<a id="method-number-spell-ordinal"></a>
#### `Number::spellOrdinal()` {.collection-method}

O método `Number::spellOrdinal` retorna a representação ordinal do número como uma string de palavras:

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

O método `Number::trim` remove quaisquer dígitos zero finais após a casa decimal do número fornecido:

```php
use Illuminate\Support\Number;

$number = Number::trim(12.0);

// 12

$number = Number::trim(12.30);

// 12.3
```

<a id="method-number-use-locale"></a>
#### `Number::useLocale()` {.collection-method}

O método `Number::useLocale` define o locale numérico padrão globalmente, o que afeta como os números e a moeda são formatados por invocações subsequentes dos métodos da classe `Number`:

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

O método `Number::withLocale` executa a closure fornecida usando o locale especificado e, em seguida, restaura o locale original após a execução do callback:

```php
use Illuminate\Support\Number;

$number = Number::withLocale('de', function () {
    return Number::format(1500);
});
```

<a id="method-number-use-currency"></a>
#### `Number::useCurrency()` {.collection-method}

O método `Number::useCurrency` define a moeda numérica padrão globalmente, o que afeta como a moeda é formatada por invocações subsequentes dos métodos da classe `Number`:

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

O método `Number::withCurrency` executa a closure fornecida usando a moeda especificada e, em seguida, restaura a moeda original após a execução do callback:

```php
use Illuminate\Support\Number;

$number = Number::withCurrency('GBP', function () {
    // ...
});
```

<a id="paths"></a>
## Caminhos

<a id="method-app-path"></a>
#### `app_path()` {.collection-method}

A função `app_path` retorna o caminho totalmente qualificado para o diretório `app` da sua aplicação. Você também pode usar a função `app_path` para gerar um caminho totalmente qualificado para um arquivo relativo ao diretório da aplicação:

```php
$path = app_path();

$path = app_path('Http/Controllers/Controller.php');
```

<a id="method-base-path"></a>
#### `base_path()` {.collection-method}

A função `base_path` retorna o caminho totalmente qualificado para o diretório raiz da sua aplicação. Você também pode usar a função `base_path` para gerar um caminho totalmente qualificado para um determinado arquivo relativo ao diretório raiz do projeto:

```php
$path = base_path();

$path = base_path('vendor/bin');
```

<a id="method-config-path"></a>
#### `config_path()` {.collection-method}

A função `config_path` retorna o caminho totalmente qualificado para o diretório `config` da sua aplicação. Você também pode usar a função `config_path` para gerar um caminho totalmente qualificado para um determinado arquivo dentro do diretório de configuração da aplicação:

```php
$path = config_path();

$path = config_path('app.php');
```

<a id="method-database-path"></a>
#### `database_path()` {.collection-method}

A função `database_path` retorna o caminho totalmente qualificado para o diretório `database` da sua aplicação. Você também pode usar a função `database_path` para gerar um caminho totalmente qualificado para um determinado arquivo dentro do diretório database:

```php
$path = database_path();

$path = database_path('factories/UserFactory.php');
```

<a id="method-lang-path"></a>
#### `lang_path()` {.collection-method}

A função `lang_path` retorna o caminho totalmente qualificado para o diretório `lang` da sua aplicação. Você também pode usar a função `lang_path` para gerar um caminho totalmente qualificado para um determinado arquivo dentro do diretório:

```php
$path = lang_path();

$path = lang_path('en/messages.php');
```

> **Nota:**
> Por padrão, o esqueleto da aplicação Laravel não inclui o diretório `lang`. Se você quiser personalizar os arquivos de idioma do Laravel, pode publicá-los por meio do comando Artisan `lang:publish`.

<a id="method-public-path"></a>
#### `public_path()` {.collection-method}

A função `public_path` retorna o caminho totalmente qualificado para o diretório `public` da sua aplicação. Você também pode usar a função `public_path` para gerar um caminho totalmente qualificado para um determinado arquivo dentro do diretório public:

```php
$path = public_path();

$path = public_path('css/app.css');
```

<a id="method-resource-path"></a>
#### `resource_path()` {.collection-method}

A função `resource_path` retorna o caminho totalmente qualificado para o diretório `resources` da sua aplicação. Você também pode usar a função `resource_path` para gerar um caminho totalmente qualificado para um determinado arquivo dentro do diretório resources:

```php
$path = resource_path();

$path = resource_path('sass/app.scss');
```

<a id="method-storage-path"></a>
#### `storage_path()` {.collection-method}

A função `storage_path` retorna o caminho totalmente qualificado para o diretório `storage` da sua aplicação. Você também pode usar a função `storage_path` para gerar um caminho totalmente qualificado para um determinado arquivo dentro do diretório storage:

```php
$path = storage_path();

$path = storage_path('app/file.txt');
```

<a id="urls"></a>
## URLs

<a id="method-action"></a>
#### `action()` {.collection-method}

A função `action` gera uma URL para a action de controller fornecida:

```php
use App\Http\Controllers\HomeController;

$url = action([HomeController::class, 'index']);
```

Se o método aceitar parâmetros de rota, você pode passá-los como segundo argumento do método:

```php
$url = action([UserController::class, 'profile'], ['id' => 1]);
```

<a id="method-asset"></a>
#### `asset()` {.collection-method}

A função `asset` gera uma URL para um asset usando o esquema atual da requisição (HTTP ou HTTPS):

```php
$url = asset('img/photo.jpg');
```

Você pode configurar o host da URL do asset definindo a variável `ASSET_URL` no seu arquivo `.env`. Isso pode ser útil se você hospedar seus assets em um serviço externo como o Amazon S3 ou outra CDN:

```php
// ASSET_URL=http://example.com/assets

$url = asset('img/photo.jpg'); // http://example.com/assets/img/photo.jpg
```

<a id="method-route"></a>
#### `route()` {.collection-method}

A função `route` gera uma URL para uma determinada [rota nomeada](/en/routing/#named-routes):

```php
$url = route('route.name');
```

Se a rota aceitar parâmetros, você pode passá-los como segundo argumento da função:

```php
$url = route('route.name', ['id' => 1]);
```

Por padrão, a função `route` gera uma URL absoluta. Se você quiser gerar uma URL relativa, pode passar `false` como terceiro argumento da função:

```php
$url = route('route.name', ['id' => 1], false);
```

<a id="method-secure-asset"></a>
#### `secure_asset()` {.collection-method}

A função `secure_asset` gera uma URL para um asset usando HTTPS:

```php
$url = secure_asset('img/photo.jpg');
```

<a id="method-secure-url"></a>
#### `secure_url()` {.collection-method}

A função `secure_url` gera uma URL HTTPS totalmente qualificada para o caminho fornecido. Segmentos de URL adicionais podem ser passados no segundo argumento da função:

```php
$url = secure_url('user/profile');

$url = secure_url('user/profile', [1]);
```

<a id="method-to-action"></a>
#### `to_action()` {.collection-method}

A função `to_action` gera uma [resposta HTTP de redirecionamento](/en/responses/#redirects) para uma determinada action de controller:

```php
use App\Http\Controllers\UserController;

return to_action([UserController::class, 'show'], ['user' => 1]);
```

Se necessário, você pode passar o código de status HTTP que deve ser atribuído ao redirecionamento e quaisquer cabeçalhos de resposta adicionais como terceiro e quarto argumentos do método `to_action`:

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

A função `to_route` gera uma [resposta HTTP de redirecionamento](/en/responses/#redirects) para uma determinada [rota nomeada](/en/routing/#named-routes):

```php
return to_route('users.show', ['user' => 1]);
```

Se necessário, você pode passar o código de status HTTP que deve ser atribuído ao redirecionamento e quaisquer cabeçalhos de resposta adicionais como terceiro e quarto argumentos do método `to_route`:

```php
return to_route('users.show', ['user' => 1], 302, ['X-Framework' => 'Laravel']);
```

<a id="method-uri"></a>
#### `uri()` {.collection-method}

A função `uri` gera uma [instância de URI fluente](#uri) para a URI fornecida:

```php
$uri = uri('https://example.com')
    ->withPath('/users')
    ->withQuery(['page' => 1]);
```

Se a função `uri` receber um array contendo um par de controller e método invocáveis, a função criará uma instância `Uri` para o caminho de rota do método do controller:

```php
use App\Http\Controllers\UserController;

$uri = uri([UserController::class, 'show'], ['user' => $user]);
```

Se o controller for invocável, você pode simplesmente fornecer o nome da classe do controller:

```php
use App\Http\Controllers\UserIndexController;

$uri = uri(UserIndexController::class);
```

Se o valor fornecido à função `uri` corresponder ao nome de uma [rota nomeada](/en/routing/#named-routes), uma instância `Uri` será gerada para o caminho dessa rota:

```php
$uri = uri('users.show', ['user' => $user]);
```

<a id="method-url"></a>
#### `url()` {.collection-method}

A função `url` gera uma URL totalmente qualificada para o caminho fornecido:

```php
$url = url('user/profile');

$url = url('user/profile', [1]);
```

Se nenhum caminho for fornecido, uma instância `Illuminate\Routing\UrlGenerator` é retornada:

```php
$current = url()->current();

$full = url()->full();

$previous = url()->previous();
```

Para mais informações sobre como trabalhar com a função `url`, consulte a [documentação de geração de URL](/en/urls/#generating-urls).

<a id="miscellaneous"></a>
## Diversos

<a id="method-abort"></a>
#### `abort()` {.collection-method}

A função `abort` lança [uma exceção HTTP](/en/errors/#http-exceptions) que será renderizada pelo [manipulador de exceções](/en/errors/#handling-exceptions):

```php
abort(403);
```

Você também pode fornecer a mensagem da exceção e cabeçalhos de resposta HTTP personalizados que devem ser enviados ao navegador:

```php
abort(403, 'Unauthorized.', $headers);
```

<a id="method-abort-if"></a>
#### `abort_if()` {.collection-method}

A função `abort_if` lança uma exceção HTTP se uma determinada expressão booleana for avaliada como `true`:

```php
abort_if(! Auth::user()->isAdmin(), 403);
```

Assim como o método `abort`, você também pode fornecer o texto de resposta da exceção como terceiro argumento e um array de cabeçalhos de resposta personalizados como quarto argumento da função.

<a id="method-abort-unless"></a>
#### `abort_unless()` {.collection-method}

A função `abort_unless` lança uma exceção HTTP se uma determinada expressão booleana for avaliada como `false`:

```php
abort_unless(Auth::user()->isAdmin(), 403);
```

Assim como o método `abort`, você também pode fornecer o texto de resposta da exceção como terceiro argumento e um array de cabeçalhos de resposta personalizados como quarto argumento da função.

<a id="method-app"></a>
#### `app()` {.collection-method}

A função `app` retorna a instância do [service container](/en/container/):

```php
$container = app();
```

Você pode passar um nome de classe ou interface para resolvê-lo a partir do container:

```php
$api = app('HelpSpot\API');
```

<a id="method-auth"></a>
#### `auth()` {.collection-method}

A função `auth` retorna uma instância do [autenticador](/en/authentication/). Você pode usá-la como alternativa à facade `Auth`:

```php
$user = auth()->user();
```

Se necessário, você pode especificar qual instância de guard deseja acessar:

```php
$user = auth('admin')->user();
```

<a id="method-back"></a>
#### `back()` {.collection-method}

A função `back` gera uma [resposta HTTP de redirecionamento](/en/responses/#redirects) para a localização anterior do usuário:

```php
return back($status = 302, $headers = [], $fallback = '/');

return back();
```

<a id="method-bcrypt"></a>
#### `bcrypt()` {.collection-method}

A função `bcrypt` faz o [hash](/en/hashing/) do valor fornecido usando Bcrypt. Você pode usar essa função como alternativa à facade `Hash`:

```php
$password = bcrypt('my-secret-password');
```

<a id="method-blank"></a>
#### `blank()` {.collection-method}

A função `blank` determina se o valor fornecido é "blank" (vazio):

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

Para o inverso de `blank`, veja a função [filled](#method-filled).

<a id="method-broadcast"></a>
#### `broadcast()` {.collection-method}

A função `broadcast` faz o [broadcast](/en/broadcasting/) do [evento](/en/events/) fornecido para seus listeners:

```php
broadcast(new UserRegistered($user));

broadcast(new UserRegistered($user))->toOthers();
```

<a id="method-broadcast-if"></a>
#### `broadcast_if()` {.collection-method}

A função `broadcast_if` faz o [broadcast](/en/broadcasting/) do [evento](/en/events/) fornecido para seus listeners se uma determinada expressão booleana for avaliada como `true`:

```php
broadcast_if($user->isActive(), new UserRegistered($user));

broadcast_if($user->isActive(), new UserRegistered($user))->toOthers();
```

<a id="method-broadcast-unless"></a>
#### `broadcast_unless()` {.collection-method}

A função `broadcast_unless` faz o [broadcast](/en/broadcasting/) do [evento](/en/events/) fornecido para seus listeners se uma determinada expressão booleana for avaliada como `false`:

```php
broadcast_unless($user->isBanned(), new UserRegistered($user));

broadcast_unless($user->isBanned(), new UserRegistered($user))->toOthers();
```

<a id="method-cache"></a>
#### `cache()` {.collection-method}

A função `cache` pode ser usada para obter valores do [cache](/en/cache/). Se a chave fornecida não existir no cache, um valor padrão opcional será retornado:

```php
$value = cache('key');

$value = cache('key', 'default');
```

Você pode adicionar itens ao cache passando um array de pares chave / valor para a função. Você também deve passar o número de segundos ou a duração pela qual o valor em cache deve ser considerado válido:

```php
cache(['key' => 'value'], 300);

cache(['key' => 'value'], now()->plus(seconds: 10));
```

<a id="method-class-uses-recursive"></a>
#### `class_uses_recursive()` {.collection-method}

A função `class_uses_recursive` retorna todas as traits usadas por uma classe, incluindo as traits usadas por todas as suas classes pai:

```php
$traits = class_uses_recursive(App\Models\User::class);
```

<a id="method-collect"></a>
#### `collect()` {.collection-method}

A função `collect` cria uma instância de [collection](/en/collections/) a partir do valor fornecido:

```php
$collection = collect(['Taylor', 'Abigail']);
```

<a id="method-config"></a>
#### `config()` {.collection-method}

A função `config` obtém o valor de uma variável de [configuração](/en/configuration/). Os valores de configuração podem ser acessados usando a sintaxe de "ponto", que inclui o nome do arquivo e a opção que você deseja acessar. Você também pode fornecer um valor padrão que será retornado se a opção de configuração não existir:

```php
$value = config('app.timezone');

$value = config('app.timezone', $default);
```

Você pode definir variáveis de configuração em tempo de execução passando um array de pares chave / valor. No entanto, observe que essa função afeta apenas o valor de configuração da requisição atual e não atualiza seus valores de configuração reais:

```php
config(['app.debug' => true]);
```

<a id="method-context"></a>
#### `context()` {.collection-method}

A função `context` obtém o valor do [context](/en/context/) atual. Você também pode fornecer um valor padrão que será retornado se a chave de context não existir:

```php
$value = context('trace_id');

$value = context('trace_id', $default);
```

Você pode definir valores de context passando um array de pares chave / valor:

```php
use Illuminate\Support\Str;

context(['trace_id' => Str::uuid()->toString()]);
```

<a id="method-cookie"></a>
#### `cookie()` {.collection-method}

A função `cookie` cria uma nova instância de [cookie](/en/requests/#cookies):

```php
$cookie = cookie('name', 'value', $minutes);
```

<a id="method-csrf-field"></a>
#### `csrf_field()` {.collection-method}

A função `csrf_field` gera um campo de input HTML `hidden` contendo o valor do token CSRF. Por exemplo, usando a [sintaxe Blade](/en/blade/):

```blade
{{ csrf_field() }}
```

<a id="method-csrf-token"></a>
#### `csrf_token()` {.collection-method}

A função `csrf_token` recupera o valor do token CSRF atual:

```php
$token = csrf_token();
```

<a id="method-decrypt"></a>
#### `decrypt()` {.collection-method}

A função `decrypt` [descriptografa](/en/encryption/) o valor fornecido. Você pode usar essa função como alternativa à facade `Crypt`:

```php
$password = decrypt($value);
```

Para o inverso de `decrypt`, veja a função [encrypt](#method-encrypt).

<a id="method-dd"></a>
#### `dd()` {.collection-method}

A função `dd` faz o dump das variáveis fornecidas e encerra a execução do script:

```php
dd($value);

dd($value1, $value2, $value3, ...);
```

Se você não quiser interromper a execução do seu script, use a função [dump](#method-dump).

<a id="method-dispatch"></a>
#### `dispatch()` {.collection-method}

A função `dispatch` envia o [job](/en/queues/#creating-jobs) fornecido para a [fila de jobs](/en/queues/) do Laravel:

```php
dispatch(new App\Jobs\SendEmails);
```

<a id="method-dispatch-sync"></a>
#### `dispatch_sync()` {.collection-method}

A função `dispatch_sync` envia o job fornecido para a fila [sync](/en/queues/#synchronous-dispatching) para que seja processado imediatamente:

```php
dispatch_sync(new App\Jobs\SendEmails);
```

<a id="method-dump"></a>
#### `dump()` {.collection-method}

A função `dump` faz o dump das variáveis fornecidas:

```php
dump($value);

dump($value1, $value2, $value3, ...);
```

Se você quiser interromper a execução do script após fazer o dump das variáveis, use a função [dd](#method-dd).

<a id="method-encrypt"></a>
#### `encrypt()` {.collection-method}

A função `encrypt` [criptografa](/en/encryption/) o valor fornecido. Você pode usar essa função como alternativa à facade `Crypt`:

```php
$secret = encrypt('my-secret-value');
```

Para o inverso de `encrypt`, veja a função [decrypt](#method-decrypt).

<a id="method-env"></a>
#### `env()` {.collection-method}

A função `env` recupera o valor de uma [variável de ambiente](/en/configuration/#environment-configuration) ou retorna um valor padrão:

```php
$env = env('APP_ENV');

$env = env('APP_ENV', 'production');
```

> **Aviso:**
> Se você executar o comando `config:cache` durante o processo de deploy, deve certificar-se de estar chamando a função `env` apenas de dentro dos seus arquivos de configuração. Uma vez que a configuração tenha sido colocada em cache, o arquivo `.env` não será carregado e todas as chamadas à função `env` retornarão variáveis de ambiente externas, como variáveis de ambiente em nível de servidor ou de sistema, ou `null`.

<a id="method-event"></a>
#### `event()` {.collection-method}

A função `event` despacha o [evento](/en/events/) fornecido para seus listeners:

```php
event(new UserRegistered($user));
```

<a id="method-fake"></a>
#### `fake()` {.collection-method}

A função `fake` resolve um singleton do [Faker](https://github.com/FakerPHP/Faker) a partir do container, o que pode ser útil ao criar dados falsos em model factories, seeding de banco de dados, testes e prototipagem de views:

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

Por padrão, a função `fake` utilizará a opção de configuração `app.faker_locale` na sua configuração `config/app.php`. Normalmente, essa opção de configuração é definida por meio da variável de ambiente `APP_FAKER_LOCALE`. Você também pode especificar o locale passando-o para a função `fake`. Cada locale resolverá um singleton individual:

```php
fake('nl_NL')->name();
```

<a id="method-filled"></a>
#### `filled()` {.collection-method}

A função `filled` determina se o valor fornecido não é "blank" (vazio):

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

Para o inverso de `filled`, veja a função [blank](#method-blank).

<a id="method-info"></a>
#### `info()` {.collection-method}

A função `info` escreverá informações no [log](/en/logging/) da sua aplicação:

```php
info('Some helpful information!');
```

Um array de dados contextuais também pode ser passado para a função:

```php
info('User login attempt failed.', ['id' => $user->id]);
```

<a id="method-literal"></a>
#### `literal()` {.collection-method}

A função `literal` cria uma nova instância de [stdClass](https://www.php.net/manual/en/class.stdclass.php) com os argumentos nomeados fornecidos como propriedades:

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

A função `logger` pode ser usada para escrever uma mensagem de nível `debug` no [log](/en/logging/):

```php
logger('Debug message');
```

Um array de dados contextuais também pode ser passado para a função:

```php
logger('User has logged in.', ['id' => $user->id]);
```

Uma instância de [logger](/en/logging/) será retornada se nenhum valor for passado para a função:

```php
logger()->error('You are not allowed here.');
```

<a id="method-method-field"></a>
#### `method_field()` {.collection-method}

A função `method_field` gera um campo de input HTML `hidden` contendo o valor falsificado do verbo HTTP do formulário. Por exemplo, usando a [sintaxe Blade](/en/blade/):

```blade
<form method="POST">
    {{ method_field('DELETE') }}
</form>
```

<a id="method-now"></a>
#### `now()` {.collection-method}

A função `now` cria uma nova instância `Illuminate\Support\Carbon` para o horário atual:

```php
$now = now();
```

<a id="method-old"></a>
#### `old()` {.collection-method}

A função `old` [recupera](/en/requests/#retrieving-input) um valor de [input antigo](/en/requests/#old-input) armazenado temporariamente na sessão:

```php
$value = old('value');

$value = old('value', 'default');
```

Como o "valor padrão" fornecido como segundo argumento da função `old` frequentemente é um atributo de um model Eloquent, o Laravel permite que você simplesmente passe o model Eloquent inteiro como segundo argumento da função `old`. Ao fazer isso, o Laravel assumirá que o primeiro argumento fornecido à função `old` é o nome do atributo Eloquent que deve ser considerado o "valor padrão":

```blade
{{ old('name', $user->name) }}

// Is equivalent to...

{{ old('name', $user) }}
```

<a id="method-once"></a>
#### `once()` {.collection-method}

A função `once` executa o callback fornecido e armazena o resultado em memória pela duração da requisição. Quaisquer chamadas subsequentes à função `once` com o mesmo callback retornarão o resultado previamente armazenado em cache:

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

Quando a função `once` é executada de dentro de uma instância de objeto, o resultado em cache será exclusivo para aquela instância de objeto:

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

A função `optional` aceita qualquer argumento e permite acessar propriedades ou chamar métodos naquele objeto. Se o objeto fornecido for `null`, as propriedades e métodos retornarão `null` em vez de causar um erro:

```php
return optional($user->address)->street;

{!! old('name', optional($user)->name) !!}
```

A função `optional` também aceita uma closure como segundo argumento. A closure será invocada se o valor fornecido como primeiro argumento não for null:

```php
return optional(User::find($id), function (User $user) {
    return $user->name;
});
```

<a id="method-policy"></a>
#### `policy()` {.collection-method}

O método `policy` recupera uma instância de [policy](/en/authorization/#creating-policies) para uma determinada classe:

```php
$policy = policy(App\Models\User::class);
```

<a id="method-redirect"></a>
#### `redirect()` {.collection-method}

A função `redirect` retorna uma [resposta HTTP de redirecionamento](/en/responses/#redirects) ou retorna a instância do redirector se chamada sem argumentos:

```php
return redirect($to = null, $status = 302, $headers = [], $secure = null);

return redirect('/home');

return redirect()->route('route.name');
```

<a id="method-report"></a>
#### `report()` {.collection-method}

A função `report` reportará uma exceção usando o seu [manipulador de exceções](/en/errors/#handling-exceptions):

```php
report($e);
```

A função `report` também aceita uma string como argumento. Quando uma string é fornecida à função, a função criará uma exceção com a string fornecida como sua mensagem:

```php
report('Something went wrong.');
```

<a id="method-report-if"></a>
#### `report_if()` {.collection-method}

A função `report_if` reportará uma exceção usando o seu [manipulador de exceções](/en/errors/#handling-exceptions) se uma determinada expressão booleana for avaliada como `true`:

```php
report_if($shouldReport, $e);

report_if($shouldReport, 'Something went wrong.');
```

<a id="method-report-unless"></a>
#### `report_unless()` {.collection-method}

A função `report_unless` reportará uma exceção usando o seu [manipulador de exceções](/en/errors/#handling-exceptions) se uma determinada expressão booleana for avaliada como `false`:

```php
report_unless($reportingDisabled, $e);

report_unless($reportingDisabled, 'Something went wrong.');
```

<a id="method-request"></a>
#### `request()` {.collection-method}

A função `request` retorna a instância da [requisição](/en/requests/) atual ou obtém o valor de um campo de input da requisição atual:

```php
$request = request();

$value = request('key', $default);
```

<a id="method-rescue"></a>
#### `rescue()` {.collection-method}

A função `rescue` executa a closure fornecida e captura quaisquer exceções que ocorram durante sua execução. Todas as exceções capturadas serão enviadas ao seu [manipulador de exceções](/en/errors/#handling-exceptions); no entanto, a requisição continuará sendo processada:

```php
return rescue(function () {
    return $this->method();
});
```

Você também pode passar um segundo argumento para a função `rescue`. Esse argumento será o valor "padrão" que deve ser retornado se uma exceção ocorrer ao executar a closure:

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

Um argumento `report` pode ser fornecido à função `rescue` para determinar se a exceção deve ser reportada por meio da função `report`:

```php
return rescue(function () {
    return $this->method();
}, report: function (Throwable $throwable) {
    return $throwable instanceof InvalidArgumentException;
});
```

<a id="method-resolve"></a>
#### `resolve()` {.collection-method}

A função `resolve` resolve um determinado nome de classe ou interface em uma instância usando o [service container](/en/container/):

```php
$api = resolve('HelpSpot\API');
```

<a id="method-response"></a>
#### `response()` {.collection-method}

A função `response` cria uma instância de [resposta](/en/responses/) ou obtém uma instância da response factory:

```php
return response('Hello World', 200, $headers);

return response()->json(['foo' => 'bar'], 200, $headers);
```

<a id="method-retry"></a>
#### `retry()` {.collection-method}

A função `retry` tenta executar o callback fornecido até que o limite máximo de tentativas seja atingido. Se o callback não lançar uma exceção, seu valor de retorno será retornado. Se o callback lançar uma exceção, ele será automaticamente tentado novamente. Se a contagem máxima de tentativas for excedida, a exceção será lançada:

```php
return retry(5, function () {
    // Attempt 5 times while resting 100ms between attempts...
}, 100);
```

A duração do sleep também aceita uma instância `CarbonInterval`:

```php
use function Illuminate\Support\seconds;

return retry(5, function () {
    // Attempt 5 times while resting 5 seconds between attempts...
}, seconds(5));
```

Se você quiser calcular manualmente o número de milissegundos para dormir entre as tentativas, pode passar uma closure como terceiro argumento da função `retry`:

```php
use Exception;

return retry(5, function () {
    // ...
}, function (int $attempt, Exception $exception) {
    return $attempt * 100;
});
```

Por conveniência, você pode fornecer um array como primeiro argumento da função `retry`. Esse array será usado para determinar quantos milissegundos dormir entre as tentativas subsequentes:

```php
return retry([100, 200], function () {
    // Sleep for 100ms on first retry, 200ms on second retry...
});
```

Para tentar novamente apenas sob condições específicas, você pode passar uma closure como quarto argumento da função `retry`:

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

A função `session` pode ser usada para obter ou definir valores da [sessão](/en/session/):

```php
$value = session('key');
```

Você pode definir valores passando um array de pares chave / valor para a função:

```php
session(['chairs' => 7, 'instruments' => 3]);
```

O armazenamento da sessão será retornado se nenhum valor for passado para a função:

```php
$value = session()->get('key');

session()->put('key', $value);
```

<a id="method-tap"></a>
#### `tap()` {.collection-method}

A função `tap` aceita dois argumentos: um `$value` arbitrário e uma closure. O `$value` será passado para a closure e, em seguida, retornado pela função `tap`. O valor de retorno da closure é irrelevante:

```php
$user = tap(User::first(), function (User $user) {
    $user->name = 'Taylor';

    $user->save();
});
```

Se nenhuma closure for passada para a função `tap`, você pode chamar qualquer método no `$value` fornecido. O valor de retorno do método que você chamar sempre será `$value`, independentemente do que o método realmente retorna em sua definição. Por exemplo, o método `update` do Eloquent normalmente retorna um inteiro. No entanto, podemos forçar o método a retornar o próprio model encadeando a chamada do método `update` por meio da função `tap`:

```php
$user = tap($user)->update([
    'name' => $name,
    'email' => $email,
]);
```

Para adicionar um método `tap` a uma classe, você pode adicionar a trait `Illuminate\Support\Traits\Tappable` à classe. O método `tap` dessa trait aceita uma Closure como seu único argumento. A própria instância do objeto será passada para a Closure e, em seguida, retornada pelo método `tap`:

```php
return $user->tap(function (User $user) {
    // ...
});
```

<a id="method-throw-if"></a>
#### `throw_if()` {.collection-method}

A função `throw_if` lança a exceção fornecida se uma determinada expressão booleana for avaliada como `true`:

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

A função `throw_unless` lança a exceção fornecida se uma determinada expressão booleana for avaliada como `false`:

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

A função `today` cria uma nova instância `Illuminate\Support\Carbon` para a data atual:

```php
$today = today();
```

<a id="method-trait-uses-recursive"></a>
#### `trait_uses_recursive()` {.collection-method}

A função `trait_uses_recursive` retorna todas as traits usadas por uma trait:

```php
$traits = trait_uses_recursive(\Illuminate\Notifications\Notifiable::class);
```

<a id="method-transform"></a>
#### `transform()` {.collection-method}

A função `transform` executa uma closure sobre um determinado valor se o valor não for [blank](#method-blank) e, em seguida, retorna o valor de retorno da closure:

```php
$callback = function (int $value) {
    return $value * 2;
};

$result = transform(5, $callback);

// 10
```

Um valor padrão ou closure pode ser passado como terceiro argumento da função. Esse valor será retornado se o valor fornecido for blank:

```php
$result = transform(null, $callback, 'The value is blank');

// The value is blank
```

<a id="method-validator"></a>
#### `validator()` {.collection-method}

A função `validator` cria uma nova instância de [validator](/en/validation/) com os argumentos fornecidos. Você pode usá-la como alternativa à facade `Validator`:

```php
$validator = validator($data, $rules, $messages);
```

<a id="method-value"></a>
#### `value()` {.collection-method}

A função `value` retorna o valor que lhe é fornecido. No entanto, se você passar uma closure para a função, a closure será executada e seu valor retornado será retornado:

```php
$result = value(true);

// true

$result = value(function () {
    return false;
});

// false
```

Argumentos adicionais podem ser passados para a função `value`. Se o primeiro argumento for uma closure, os parâmetros adicionais serão passados para a closure como argumentos; caso contrário, serão ignorados:

```php
$result = value(function (string $name) {
    return $name;
}, 'Taylor');

// 'Taylor'
```

<a id="method-view"></a>
#### `view()` {.collection-method}

A função `view` recupera uma instância de [view](/en/views/):

```php
return view('auth.login');
```

<a id="method-with"></a>
#### `with()` {.collection-method}

A função `with` retorna o valor que lhe é fornecido. Se uma closure for passada como segundo argumento da função, a closure será executada e seu valor retornado será retornado:

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

A função `when` retorna o valor que lhe é fornecido se uma determinada condição for avaliada como `true`. Caso contrário, `null` é retornado. Se uma closure for passada como segundo argumento da função, a closure será executada e seu valor retornado será retornado:

```php
$value = when(true, 'Hello World');

$value = when(true, fn () => 'Hello World');
```

A função `when` é primariamente útil para renderizar condicionalmente atributos HTML:

```blade
<div {!! when($condition, 'wire:poll="calculate"') !!}>
    ...
</div>
```

<a id="other-utilities"></a>
## Outros Utilitários

<a id="benchmarking"></a>
### Benchmarking

Às vezes você pode querer testar rapidamente o desempenho de certas partes da sua aplicação. Nessas ocasiões, você pode utilizar a classe de suporte `Benchmark` para medir o número de milissegundos que os callbacks fornecidos levam para serem concluídos:

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

Por padrão, os callbacks fornecidos serão executados uma vez (uma iteração), e sua duração será exibida no navegador / console.

Para invocar um callback mais de uma vez, você pode especificar o número de iterações em que o callback deve ser invocado como segundo argumento do método. Ao executar um callback mais de uma vez, a classe `Benchmark` retornará o número médio de milissegundos que levou para executar o callback em todas as iterações:

```php
Benchmark::dd(fn () => User::count(), iterations: 10); // 0.5 ms
```

Às vezes, você pode querer fazer o benchmark da execução de um callback e ainda obter o valor retornado pelo callback. O método `value` retornará uma tupla contendo o valor retornado pelo callback e o número de milissegundos que levou para executá-lo:

```php
[$count, $duration] = Benchmark::value(fn () => User::count());
```

<a id="dates"></a>
### Datas e Horas

O Laravel inclui o [Carbon](https://carbon.nesbot.com/guide/getting-started/introduction.html), uma poderosa biblioteca de manipulação de data e hora. Para criar uma nova instância `Carbon`, você pode invocar a função `now`. Essa função está disponível globalmente dentro da sua aplicação Laravel:

```php
$now = now();
```

Ou você pode criar uma nova instância `Carbon` usando a classe `Illuminate\Support\Carbon`:

```php
use Illuminate\Support\Carbon;

$now = Carbon::now();
```

O Laravel também complementa as instâncias `Carbon` com os métodos `plus` e `minus`, permitindo a manipulação fácil da data e hora da instância:

```php
return now()->plus(minutes: 5);
return now()->plus(hours: 8);
return now()->plus(weeks: 4);

return now()->minus(minutes: 5);
return now()->minus(hours: 8);
return now()->minus(weeks: 4);
```

Para uma discussão aprofundada sobre o Carbon e seus recursos, consulte a [documentação oficial do Carbon](https://carbon.nesbot.com/guide/getting-started/introduction.html).

<a id="interval-functions"></a>
#### Funções de Intervalo

O Laravel também oferece as funções `milliseconds`, `seconds`, `minutes`, `hours`, `days`, `weeks`, `months` e `years`, que retornam instâncias `CarbonInterval`, que estendem a classe [DateInterval](https://www.php.net/manual/en/class.dateinterval.php) do PHP. Essas funções podem ser usadas em qualquer lugar em que o Laravel aceite uma instância `DateInterval`:

```php
use Illuminate\Support\Facades\Cache;

use function Illuminate\Support\{minutes};

Cache::put('metrics', $metrics, minutes(10));
```

<a id="deferred-functions"></a>
### Funções Adiadas

Embora os [jobs enfileirados](/en/queues/) do Laravel permitam enfileirar tarefas para processamento em segundo plano, às vezes você pode ter tarefas simples que gostaria de adiar sem configurar ou manter um worker de fila de longa execução.

As funções adiadas permitem adiar a execução de uma closure até depois que a resposta HTTP tenha sido enviada ao usuário, mantendo sua aplicação rápida e responsiva. Para adiar a execução de uma closure, simplesmente passe a closure para a função `Illuminate\Support\defer`:

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

Por padrão, as funções adiadas só serão executadas se a resposta HTTP, o comando Artisan ou o job enfileirado a partir do qual `Illuminate\Support\defer` é invocado for concluído com sucesso. Isso significa que as funções adiadas não serão executadas se uma requisição resultar em uma resposta HTTP `4xx` ou `5xx`. Se você quiser que uma função adiada sempre seja executada, pode encadear o método `always` à sua função adiada:

```php
defer(fn () => Metrics::reportOrder($order))->always();
```

> **Aviso:**
> Se você tiver a [extensão Swoole do PHP](https://www.php.net/manual/en/book.swoole.php) instalada, a função `defer` do Laravel pode entrar em conflito com a própria função global `defer` do Swoole, levando a erros do servidor web. Certifique-se de chamar o helper `defer` do Laravel usando o namespace explicitamente: `use function Illuminate\Support\defer;`

<a id="cancelling-deferred-functions"></a>
#### Cancelando Funções Adiadas

Se você precisar cancelar uma função adiada antes que ela seja executada, pode usar o método `forget` para cancelar a função pelo seu nome. Para nomear uma função adiada, forneça um segundo argumento à função `Illuminate\Support\defer`:

```php
defer(fn () => Metrics::report(), 'reportMetrics');

defer()->forget('reportMetrics');
```

<a id="disabling-deferred-functions-in-tests"></a>
#### Desabilitando Funções Adiadas em Testes

Ao escrever testes, pode ser útil desabilitar as funções adiadas. Você pode chamar `withoutDefer` no seu teste para instruir o Laravel a invocar todas as funções adiadas imediatamente:

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

Se você quiser desabilitar as funções adiadas para todos os testes dentro de um test case, pode chamar o método `withoutDefer` a partir do método `setUp` na sua classe base `TestCase`:

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
### Lottery

A classe lottery do Laravel pode ser usada para executar callbacks com base em um conjunto de probabilidades fornecidas. Isso pode ser particularmente útil quando você deseja executar código apenas para uma porcentagem das requisições recebidas:

```php
use Illuminate\Support\Lottery;

Lottery::odds(1, 20)
    ->winner(fn () => $user->won())
    ->loser(fn () => $user->lost())
    ->choose();
```

Você pode combinar a classe lottery do Laravel com outros recursos do Laravel. Por exemplo, você pode querer reportar apenas uma pequena porcentagem de queries lentas ao seu manipulador de exceções. E, como a classe lottery é callable, podemos passar uma instância da classe para qualquer método que aceite callables:

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
#### Testando Lotteries

O Laravel fornece alguns métodos simples que permitem testar facilmente as invocações de lottery da sua aplicação:

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
### Pipeline

A facade `Pipeline` do Laravel fornece uma maneira conveniente de "encanar" (pipe) uma determinada entrada por meio de uma série de classes invocáveis, closures ou callables, dando a cada classe a oportunidade de inspecionar ou modificar a entrada e invocar o próximo callable no pipeline:

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

Como você pode ver, cada classe invocável ou closure no pipeline recebe a entrada e uma closure `$next`. Invocar a closure `$next` invocará o próximo callable no pipeline. Como você deve ter notado, isso é muito semelhante ao [middleware](/en/middleware/).

Quando o último callable no pipeline invoca a closure `$next`, o callable fornecido ao método `then` será invocado. Normalmente, esse callable simplesmente retornará a entrada fornecida. Por conveniência, se você quiser apenas retornar a entrada após ela ter sido processada, pode usar o método `thenReturn`.

É claro que, como discutido anteriormente, você não está limitado a fornecer closures ao seu pipeline. Você também pode fornecer classes invocáveis. Se um nome de classe for fornecido, a classe será instanciada por meio do [service container](/en/container/) do Laravel, permitindo que as dependências sejam injetadas na classe invocável:

```php
$user = Pipeline::send($user)
    ->through([
        GenerateProfilePhoto::class,
        ActivateSubscription::class,
        SendWelcomeEmail::class,
    ])
    ->thenReturn();
```

O método `withinTransaction` pode ser invocado no pipeline para envolver automaticamente todas as etapas do pipeline dentro de uma única transação de banco de dados:

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
### Sleep

A classe `Sleep` do Laravel é um wrapper leve em torno das funções nativas `sleep` e `usleep` do PHP, oferecendo maior testabilidade e também expondo uma API amigável ao desenvolvedor para trabalhar com o tempo:

```php
use Illuminate\Support\Sleep;

$waiting = true;

while ($waiting) {
    Sleep::for(1)->second();

    $waiting = /* ... */;
}
```

A classe `Sleep` oferece uma variedade de métodos que permitem trabalhar com diferentes unidades de tempo:

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

Para combinar facilmente unidades de tempo, você pode usar o método `and`:

```php
Sleep::for(1)->second()->and(10)->milliseconds();
```

<a id="testing-sleep"></a>
#### Testando Sleep

Ao testar código que utiliza a classe `Sleep` ou as funções nativas de sleep do PHP, seu teste pausará a execução. Como você deve esperar, isso torna sua suíte de testes significativamente mais lenta. Por exemplo, imagine que você está testando o seguinte código:

```php
$waiting = /* ... */;

$seconds = 1;

while ($waiting) {
    Sleep::for($seconds++)->seconds();

    $waiting = /* ... */;
}
```

Normalmente, testar esse código levaria _pelo menos_ um segundo. Felizmente, a classe `Sleep` nos permite "fingir" o sleep para que nossa suíte de testes permaneça rápida:

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

Ao fazer o fake da classe `Sleep`, a pausa de execução real é ignorada, levando a um teste substancialmente mais rápido.

Uma vez que a classe `Sleep` tenha sido fakeada, é possível fazer asserções contra os "sleeps" esperados que deveriam ter ocorrido. Para ilustrar isso, vamos imaginar que estamos testando um código que pausa a execução três vezes, com cada pausa aumentando em um único segundo. Usando o método `assertSequence`, podemos afirmar que nosso código "dormiu" pela quantidade de tempo adequada enquanto mantemos nosso teste rápido:

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

É claro que a classe `Sleep` oferece uma variedade de outras asserções que você pode usar ao testar:

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

Às vezes pode ser útil realizar uma ação sempre que um fake sleep ocorre. Para conseguir isso, você pode fornecer um callback ao método `whenFakingSleep`. No exemplo a seguir, usamos os [helpers de manipulação de tempo](/en/mocking/#interacting-with-time) do Laravel para avançar o tempo instantaneamente pela duração de cada sleep:

```php
use Carbon\CarbonInterval as Duration;

$this->freezeTime();

Sleep::fake();

Sleep::whenFakingSleep(function (Duration $duration) {
    // Progress time when faking sleep...
    $this->travel($duration->totalMilliseconds)->milliseconds();
});
```

Como avançar o tempo é um requisito comum, o método `fake` aceita um argumento `syncWithCarbon` para manter o Carbon em sincronia ao fazer sleep dentro de um teste:

```php
Sleep::fake(syncWithCarbon: true);

$start = now();

Sleep::for(1)->second();

$start->diffForHumans(); // 1 second ago
```

O Laravel usa a classe `Sleep` internamente sempre que está pausando a execução. Por exemplo, o helper [retry](#method-retry) usa a classe `Sleep` ao fazer sleep, permitindo testabilidade aprimorada ao usar esse helper.

<a id="timebox"></a>
### Timebox

A classe `Timebox` do Laravel garante que o callback fornecido sempre leve uma quantidade fixa de tempo para ser executado, mesmo que sua execução real seja concluída antes. Isso é particularmente útil para operações criptográficas e verificações de autenticação de usuário, em que atacantes podem explorar variações no tempo de execução para inferir informações sensíveis.

Se a execução exceder a duração fixa, o `Timebox` não tem efeito. Cabe ao desenvolvedor escolher um tempo suficientemente longo como duração fixa para considerar os piores cenários.

O método call aceita uma closure e um limite de tempo em microssegundos, e então executa a closure e aguarda até que o limite de tempo seja atingido:

```php
use Illuminate\Support\Timebox;

(new Timebox)->call(function ($timebox) {
    // ...
}, microseconds: 10000);
```

Se uma exceção for lançada dentro da closure, essa classe respeitará o atraso definido e relançará a exceção após o atraso.

<a id="uri"></a>
### URI

A classe `Uri` do Laravel fornece uma interface conveniente e fluente para criar e manipular URIs. Essa classe encapsula a funcionalidade fornecida pelo pacote subjacente League URI e integra-se perfeitamente ao sistema de roteamento do Laravel.

Você pode criar uma instância `Uri` facilmente usando métodos estáticos:

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

Uma vez que você tenha uma instância de URI, pode modificá-la de forma fluente:

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
#### Inspecionando URIs

A classe `Uri` também permite inspecionar facilmente os vários componentes da URI subjacente:

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
#### Manipulando Query Strings

A classe `Uri` oferece vários métodos que podem ser usados para manipular a query string de uma URI. O método `withQuery` pode ser usado para mesclar parâmetros adicionais de query string na query string existente:

```php
$uri = $uri->withQuery(['sort' => 'name']);
```

O método `withQueryIfMissing` pode ser usado para mesclar parâmetros adicionais de query string na query string existente se as chaves fornecidas ainda não existirem na query string:

```php
$uri = $uri->withQueryIfMissing(['page' => 1]);
```

O método `replaceQuery` pode ser usado para substituir completamente a query string existente por uma nova:

```php
$uri = $uri->replaceQuery(['page' => 1]);
```

O método `pushOntoQuery` pode ser usado para adicionar parâmetros adicionais a um parâmetro de query string que tem um valor de array:

```php
$uri = $uri->pushOntoQuery('filter', ['active', 'pending']);
```

O método `withoutQuery` pode ser usado para remover parâmetros da query string:

```php
$uri = $uri->withoutQuery(['page']);
```

<a id="generating-responses-from-uris"></a>
#### Gerando Respostas a Partir de URIs

O método `redirect` pode ser usado para gerar uma instância `RedirectResponse` para a URI fornecida:

```php
$uri = Uri::of('https://example.com');

return $uri->redirect();
```

Ou você pode simplesmente retornar a instância `Uri` de uma rota ou action de controller, o que gerará automaticamente uma resposta de redirecionamento para a URI retornada:

```php
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Uri;

Route::get('/redirect', function () {
    return Uri::to('/index')
        ->withQuery(['sort' => 'name']);
});
```
