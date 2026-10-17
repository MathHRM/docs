---
title: "Collections"
---

- [Introdução](#introduction)
    - [Criando Collections](#creating-collections)
    - [Estendendo Collections](#extending-collections)
- [Métodos Disponíveis](#available-methods)
- [Higher Order Messages](#higher-order-messages)
- [Lazy Collections](#lazy-collections)
    - [Introdução](#lazy-collection-introduction)
    - [Criando Lazy Collections](#creating-lazy-collections)
    - [O Contract Enumerable](#the-enumerable-contract)
    - [Métodos de Lazy Collection](#lazy-collection-methods)

<a id="introduction"></a>
## Introdução

A classe `Illuminate\Support\Collection` fornece um wrapper fluente e conveniente para trabalhar com arrays de dados. Por exemplo, confira o código a seguir. Usaremos o helper `collect` para criar uma nova instância de collection a partir do array, executar a função `strtoupper` em cada elemento e, em seguida, remover todos os elementos vazios:

```php
$collection = collect(['Taylor', 'Abigail', null])->map(function (?string $name) {
    return strtoupper($name);
})->reject(function (string $name) {
    return empty($name);
});
```

Como você pode ver, a classe `Collection` permite encadear seus métodos para realizar mapeamento e redução fluentes do array subjacente. Em geral, as collections são imutáveis, o que significa que cada método de `Collection` retorna uma instância de `Collection` totalmente nova.

<a id="creating-collections"></a>
### Criando Collections

Como mencionado acima, o helper `collect` retorna uma nova instância `Illuminate\Support\Collection` para o array fornecido. Portanto, criar uma collection é tão simples quanto:

```php
$collection = collect([1, 2, 3]);
```

Você também pode criar uma collection usando os métodos [make](#method-make) e [fromJson](#method-fromjson).

> **Nota:**
> Os resultados de queries do [Eloquent](/en/eloquent/) são sempre retornados como instâncias de `Collection`.

<a id="extending-collections"></a>
### Estendendo Collections

As collections são "macroable", o que permite adicionar métodos adicionais à classe `Collection` em tempo de execução. O método `macro` da classe `Illuminate\Support\Collection` aceita uma closure que será executada quando sua macro for chamada. A closure da macro pode acessar os outros métodos da collection por meio de `$this`, exatamente como se fosse um método real da classe collection. Por exemplo, o código a seguir adiciona um método `toUpper` à classe `Collection`:

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

Normalmente, você deve declarar as macros de collection no método `boot` de um [service provider](/en/providers/).

<a id="macro-arguments"></a>
#### Argumentos de Macro

Se necessário, você pode definir macros que aceitam argumentos adicionais:

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
## Métodos Disponíveis

Para a maior parte do restante da documentação de collections, discutiremos cada método disponível na classe `Collection`. Lembre-se de que todos esses métodos podem ser encadeados para manipular fluentemente o array subjacente. Além disso, quase todos os métodos retornam uma nova instância de `Collection`, permitindo que você preserve a cópia original da collection quando necessário:

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
## Listagem de Métodos

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

O método `after` retorna o item após o item fornecido. `null` é retornado se o item fornecido não for encontrado ou for o último item:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->after(3);

// 4

$collection->after(5);

// null
```

Esse método pesquisa o item fornecido usando comparação "loose" (frouxa), o que significa que uma string contendo um valor inteiro será considerada igual a um inteiro de mesmo valor. Para usar comparação "strict" (estrita), você pode fornecer o argumento `strict` ao método:

```php
collect([2, 4, 6, 8])->after('4', strict: true);

// null
```

Alternativamente, você pode fornecer sua própria closure para pesquisar o primeiro item que passe por um determinado teste de verdade:

```php
collect([2, 4, 6, 8])->after(function (int $item, int $key) {
    return $item > 5;
});

// 8
```

<a id="method-all"></a>
#### `all()` {.collection-method}

O método `all` retorna o array subjacente representado pela collection:

```php
collect([1, 2, 3])->all();

// [1, 2, 3]
```

<a id="method-average"></a>
#### `average()` {.collection-method}

Alias para o método [avg](#method-avg).

<a id="method-avg"></a>
#### `avg()` {.collection-method}

O método `avg` retorna o [valor médio](https://en.wikipedia.org/wiki/Average) de uma determinada chave:

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

O método `before` é o oposto do método [after](#method-after). Ele retorna o item antes do item fornecido. `null` é retornado se o item fornecido não for encontrado ou for o primeiro item:

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

O método `chunk` quebra a collection em várias collections menores de um tamanho determinado:

```php
$collection = collect([1, 2, 3, 4, 5, 6, 7]);

$chunks = $collection->chunk(4);

$chunks->all();

// [[1, 2, 3, 4], [5, 6, 7]]
```

Esse método é especialmente útil em [views](/en/views/) ao trabalhar com um sistema de grid como o [Bootstrap](https://getbootstrap.com/docs/5.3/layout/grid/). Por exemplo, imagine que você tem uma collection de models [Eloquent](/en/eloquent/) que deseja exibir em um grid:

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

O método `chunkBy` quebra a collection em várias collections menores agrupando itens adjacentes que têm o mesmo valor para uma determinada chave ou callback. Por exemplo, você pode agrupar produtos adjacentes que compartilham o mesmo parent:

```php
$chunks = $products->chunkBy('parent');
```

Ao contrário do método `groupBy`, itens com o mesmo valor que não são adjacentes são colocados em chunks separados:

```php
$collection = collect([1, 1, 2, 2, 1]);

$chunks = $collection->chunkBy(fn (int $value) => $value);

$chunks->all();

// [[1, 1], [2, 2], [1]]
```

<a id="method-chunkwhile"></a>
#### `chunkWhile()` {.collection-method}

O método `chunkWhile` quebra a collection em várias collections menores com base na avaliação do callback fornecido. A variável `$chunk` passada para a closure pode ser usada para inspecionar o elemento anterior:

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

O método `collapse` reduz uma collection de arrays ou collections em uma única collection plana:

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

O método `collapseWithKeys` achata uma collection de arrays ou collections em uma única collection, mantendo as chaves originais intactas. Se a collection já estiver plana, ele retornará uma collection vazia:

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

O método `collect` retorna uma nova instância de `Collection` com os itens atualmente na collection:

```php
$collectionA = collect([1, 2, 3]);

$collectionB = $collectionA->collect();

$collectionB->all();

// [1, 2, 3]
```

O método `collect` é primariamente útil para converter [lazy collections](#lazy-collections) em instâncias padrão de `Collection`:

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
> O método `collect` é especialmente útil quando você tem uma instância de `Enumerable` e precisa de uma instância de collection não-lazy. Como `collect()` faz parte do contract `Enumerable`, você pode usá-lo com segurança para obter uma instância de `Collection`.

<a id="method-combine"></a>
#### `combine()` {.collection-method}

O método `combine` combina os valores da collection, como chaves, com os valores de outro array ou collection:

```php
$collection = collect(['name', 'age']);

$combined = $collection->combine(['George', 29]);

$combined->all();

// ['name' => 'George', 'age' => 29]
```

<a id="method-concat"></a>
#### `concat()` {.collection-method}

O método `concat` anexa os valores do array ou collection fornecido ao final de outra collection:

```php
$collection = collect(['John Doe']);

$concatenated = $collection->concat(['Jane Doe'])->concat(['name' => 'Johnny Doe']);

$concatenated->all();

// ['John Doe', 'Jane Doe', 'Johnny Doe']
```

O método `concat` reindexa numericamente as chaves dos itens concatenados à collection original. Para manter as chaves em collections associativas, veja o método [merge](#method-merge).

<a id="method-contains"></a>
#### `contains()` {.collection-method}

O método `contains` determina se a collection contém um determinado item. Você pode passar uma closure para o método `contains` para determinar se um elemento existe na collection que corresponda a um determinado teste de verdade:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->contains(function (int $value, int $key) {
    return $value > 5;
});

// false
```

Alternativamente, você pode passar uma string para o método `contains` para determinar se a collection contém um determinado valor de item:

```php
$collection = collect(['name' => 'Desk', 'price' => 100]);

$collection->contains('Desk');

// true

$collection->contains('New York');

// false
```

Você também pode passar um par chave / valor para o método `contains`, que determinará se o par fornecido existe na collection:

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Chair', 'price' => 100],
]);

$collection->contains('product', 'Bookcase');

// false
```

O método `contains` usa comparações "loose" ao verificar valores de item, o que significa que uma string com um valor inteiro será considerada igual a um inteiro de mesmo valor. Use o método [containsStrict](#method-containsstrict) para filtrar usando comparações "strict".

Para o inverso de `contains`, veja o método [doesntContain](#method-doesntcontain).

<a id="method-containsstrict"></a>
#### `containsStrict()` {.collection-method}

Esse método tem a mesma assinatura do método [contains](#method-contains); no entanto, todos os valores são comparados usando comparações "strict".

> **Nota:**
> O comportamento desse método é modificado ao usar [Eloquent Collections](/en/eloquent-collections/#method-contains).

<a id="method-count"></a>
#### `count()` {.collection-method}

O método `count` retorna o número total de itens na collection:

```php
$collection = collect([1, 2, 3, 4]);

$collection->count();

// 4
```

<a id="method-countBy"></a>
#### `countBy()` {.collection-method}

O método `countBy` conta as ocorrências de valores na collection. Por padrão, o método conta as ocorrências de cada elemento, permitindo que você conte certos "tipos" de elementos na collection:

```php
$collection = collect([1, 2, 2, 2, 3]);

$counted = $collection->countBy();

$counted->all();

// [1 => 1, 2 => 3, 3 => 1]
```

Você pode passar uma closure para o método `countBy` para contar todos os itens por um valor personalizado:

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

O método `crossJoin` faz o cross join dos valores da collection entre os arrays ou collections fornecidos, retornando um produto cartesiano com todas as combinações possíveis:

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

O método `dd` faz o dump dos itens da collection e encerra a execução do script:

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

Se você não quiser interromper a execução do script, use o método [dump](#method-dump).

<a id="method-diff"></a>
#### `diff()` {.collection-method}

O método `diff` compara a collection com outra collection ou um `array` PHP simples com base em seus valores. Esse método retornará os valores na collection original que não estão presentes na collection fornecida:

```php
$collection = collect([1, 2, 3, 4, 5]);

$diff = $collection->diff([2, 4, 6, 8]);

$diff->all();

// [1, 3, 5]
```

> **Nota:**
> O comportamento desse método é modificado ao usar [Eloquent Collections](/en/eloquent-collections/#method-diff).

<a id="method-diffassoc"></a>
#### `diffAssoc()` {.collection-method}

O método `diffAssoc` compara a collection com outra collection ou um `array` PHP simples com base em suas chaves e valores. Esse método retornará os pares chave / valor na collection original que não estão presentes na collection fornecida:

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

Ao contrário de `diffAssoc`, `diffAssocUsing` aceita uma função de callback fornecida pelo usuário para a comparação dos índices:

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

O callback deve ser uma função de comparação que retorna um inteiro menor que, igual a, ou maior que zero. Para mais informações, consulte a documentação do PHP sobre [array_diff_uassoc](https://www.php.net/array_diff_uassoc#refsect1-function.array-diff-uassoc-parameters), que é a função PHP que o método `diffAssocUsing` utiliza internamente.

<a id="method-diffkeys"></a>
#### `diffKeys()` {.collection-method}

O método `diffKeys` compara a collection com outra collection ou um `array` PHP simples com base em suas chaves. Esse método retornará os pares chave / valor na collection original que não estão presentes na collection fornecida:

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

O método `doesntContain` determina se a collection não contém um determinado item. Você pode passar uma closure para o método `doesntContain` para determinar se um elemento não existe na collection que corresponda a um determinado teste de verdade:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->doesntContain(function (int $value, int $key) {
    return $value < 5;
});

// false
```

Alternativamente, você pode passar uma string para o método `doesntContain` para determinar se a collection não contém um determinado valor de item:

```php
$collection = collect(['name' => 'Desk', 'price' => 100]);

$collection->doesntContain('Table');

// true

$collection->doesntContain('Desk');

// false
```

Você também pode passar um par chave / valor para o método `doesntContain`, que determinará se o par fornecido não existe na collection:

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Chair', 'price' => 100],
]);

$collection->doesntContain('product', 'Bookcase');

// true
```

O método `doesntContain` usa comparações "loose" ao verificar valores de item, o que significa que uma string com um valor inteiro será considerada igual a um inteiro de mesmo valor.

<a id="method-doesntcontainstrict"></a>
#### `doesntContainStrict()` {.collection-method}

Esse método tem a mesma assinatura do método [doesntContain](#method-doesntcontain); no entanto, todos os valores são comparados usando comparações "strict".

<a id="method-dot"></a>
#### `dot()` {.collection-method}

O método `dot` achata uma collection multidimensional em uma collection de um único nível que usa a notação de "ponto" para indicar a profundidade:

```php
$collection = collect(['products' => ['desk' => ['price' => 100]]]);

$flattened = $collection->dot();

$flattened->all();

// ['products.desk.price' => 100]
```

<a id="method-dump"></a>
#### `dump()` {.collection-method}

O método `dump` faz o dump dos itens da collection:

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

Se você quiser interromper a execução do script após fazer o dump da collection, use o método [dd](#method-dd).

<a id="method-duplicates"></a>
#### `duplicates()` {.collection-method}

O método `duplicates` recupera e retorna valores duplicados da collection:

```php
$collection = collect(['a', 'b', 'a', 'c', 'b']);

$collection->duplicates();

// [2 => 'a', 4 => 'b']
```

Se a collection contiver arrays ou objetos, você pode passar a chave dos atributos cujos valores duplicados deseja verificar:

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

Esse método tem a mesma assinatura do método [duplicates](#method-duplicates); no entanto, todos os valores são comparados usando comparações "strict".

<a id="method-each"></a>
#### `each()` {.collection-method}

O método `each` itera sobre os itens da collection e passa cada item para uma closure:

```php
$collection = collect([1, 2, 3, 4]);

$collection->each(function (int $item, int $key) {
    // ...
});
```

Se você quiser parar de iterar pelos itens, pode retornar `false` da sua closure:

```php
$collection->each(function (int $item, int $key) {
    if (/* condition */) {
        return false;
    }
});
```

<a id="method-eachspread"></a>
#### `eachSpread()` {.collection-method}

O método `eachSpread` itera sobre os itens da collection, passando o valor de cada item aninhado para o callback fornecido:

```php
$collection = collect([['John Doe', 35], ['Jane Doe', 33]]);

$collection->eachSpread(function (string $name, int $age) {
    // ...
});
```

Você pode parar de iterar pelos itens retornando `false` do callback:

```php
$collection->eachSpread(function (string $name, int $age) {
    return false;
});
```

<a id="method-ensure"></a>
#### `ensure()` {.collection-method}

O método `ensure` pode ser usado para verificar se todos os elementos de uma collection são de um determinado tipo ou lista de tipos. Caso contrário, uma `UnexpectedValueException` será lançada:

```php
return $collection->ensure(User::class);

return $collection->ensure([User::class, Customer::class]);
```

Tipos primitivos como `string`, `int`, `float`, `bool` e `array` também podem ser especificados:

```php
return $collection->ensure('int');
```

> **Aviso:**
> O método `ensure` não garante que elementos de tipos diferentes não serão adicionados à collection posteriormente.

<a id="method-every"></a>
#### `every()` {.collection-method}

O método `every` pode ser usado para verificar se todos os elementos de uma collection passam por um determinado teste de verdade:

```php
collect([1, 2, 3, 4])->every(function (int $value, int $key) {
    return $value > 2;
});

// false
```

Se a collection estiver vazia, o método `every` retornará true:

```php
$collection = collect([]);

$collection->every(function (int $value, int $key) {
    return $value > 2;
});

// true
```

<a id="method-except"></a>
#### `except()` {.collection-method}

O método `except` retorna todos os itens da collection, exceto aqueles com as chaves especificadas:

```php
$collection = collect(['product_id' => 1, 'price' => 100, 'discount' => false]);

$filtered = $collection->except(['price', 'discount']);

$filtered->all();

// ['product_id' => 1]
```

Para o inverso de `except`, veja o método [only](#method-only).

> **Nota:**
> O comportamento desse método é modificado ao usar [Eloquent Collections](/en/eloquent-collections/#method-except).

<a id="method-filter"></a>
#### `filter()` {.collection-method}

O método `filter` filtra a collection usando o callback fornecido, mantendo apenas os itens que passam por um determinado teste de verdade:

```php
$collection = collect([1, 2, 3, 4]);

$filtered = $collection->filter(function (int $value, int $key) {
    return $value > 2;
});

$filtered->all();

// [3, 4]
```

Se nenhum callback for fornecido, todas as entradas da collection que forem equivalentes a `false` serão removidas:

```php
$collection = collect([1, 2, 3, null, false, '', 0, []]);

$collection->filter()->all();

// [1, 2, 3]
```

Para o inverso de `filter`, veja o método [reject](#method-reject).

<a id="method-first"></a>
#### `first()` {.collection-method}

O método `first` retorna o primeiro elemento da collection que passa por um determinado teste de verdade:

```php
collect([1, 2, 3, 4])->first(function (int $value, int $key) {
    return $value > 2;
});

// 3
```

Você também pode chamar o método `first` sem argumentos para obter o primeiro elemento da collection. Se a collection estiver vazia, `null` é retornado:

```php
collect([1, 2, 3, 4])->first();

// 1
```

<a id="method-first-or-fail"></a>
#### `firstOrFail()` {.collection-method}

O método `firstOrFail` é idêntico ao método `first`; no entanto, se nenhum resultado for encontrado, uma exceção `Illuminate\Support\ItemNotFoundException` será lançada:

```php
collect([1, 2, 3, 4])->firstOrFail(function (int $value, int $key) {
    return $value > 5;
});

// Throws ItemNotFoundException...
```

Você também pode chamar o método `firstOrFail` sem argumentos para obter o primeiro elemento da collection. Se a collection estiver vazia, uma exceção `Illuminate\Support\ItemNotFoundException` será lançada:

```php
collect([])->firstOrFail();

// Throws ItemNotFoundException...
```

<a id="method-first-where"></a>
#### `firstWhere()` {.collection-method}

O método `firstWhere` retorna o primeiro elemento da collection com o par chave / valor fornecido:

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

Você também pode chamar o método `firstWhere` com um operador de comparação:

```php
$collection->firstWhere('age', '>=', 18);

// ['name' => 'Diego', 'age' => 23]
```

Assim como o método [where](#method-where), você pode passar um argumento ao método `firstWhere`. Nesse cenário, o método `firstWhere` retornará o primeiro item em que o valor da chave de item fornecida seja "truthy":

```php
$collection->firstWhere('age');

// ['name' => 'Linda', 'age' => 14]
```

<a id="method-flatmap"></a>
#### `flatMap()` {.collection-method}

O método `flatMap` itera pela collection e passa cada valor para a closure fornecida. A closure é livre para modificar o item e retorná-lo, formando assim uma nova collection de itens modificados. Em seguida, o array é achatado em um nível:

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

O método `flatten` achata uma collection multidimensional em uma única dimensão:

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

Se necessário, você pode passar um argumento de "profundidade" ao método `flatten`:

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

Neste exemplo, chamar `flatten` sem fornecer a profundidade também teria achatado os arrays aninhados, resultando em `['iPhone 6S', 'Apple', 'Galaxy S7', 'Samsung']`. Fornecer uma profundidade permite especificar o número de níveis em que os arrays aninhados serão achatados.

<a id="method-flip"></a>
#### `flip()` {.collection-method}

O método `flip` troca as chaves da collection por seus valores correspondentes:

```php
$collection = collect(['name' => 'Taylor', 'framework' => 'Laravel']);

$flipped = $collection->flip();

$flipped->all();

// ['Taylor' => 'name', 'Laravel' => 'framework']
```

<a id="method-forget"></a>
#### `forget()` {.collection-method}

O método `forget` remove um item da collection pela sua chave:

```php
$collection = collect(['name' => 'Taylor', 'framework' => 'Laravel']);

// Forget a single key...
$collection->forget('name');

// ['framework' => 'Laravel']

// Forget multiple keys...
$collection->forget(['name', 'framework']);

// []
```

> **Aviso:**
> Ao contrário da maioria dos outros métodos de collection, `forget` não retorna uma nova collection modificada; ele modifica e retorna a collection na qual é chamado.

<a id="method-forpage"></a>
#### `forPage()` {.collection-method}

O método `forPage` retorna uma nova collection contendo os itens que estariam presentes em um determinado número de página. O método aceita o número da página como primeiro argumento e a quantidade de itens a exibir por página como segundo argumento:

```php
$collection = collect([1, 2, 3, 4, 5, 6, 7, 8, 9]);

$chunk = $collection->forPage(2, 3);

$chunk->all();

// [4, 5, 6]
```

<a id="method-fromjson"></a>
#### `fromJson()` {.collection-method}

O método estático `fromJson` cria uma nova instância de collection decodificando uma determinada string JSON usando a função PHP `json_decode`:

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

O método `get` retorna o item em uma determinada chave. Se a chave não existir, `null` é retornado:

```php
$collection = collect(['name' => 'Taylor', 'framework' => 'Laravel']);

$value = $collection->get('name');

// Taylor
```

Você pode, opcionalmente, passar um valor padrão como segundo argumento:

```php
$collection = collect(['name' => 'Taylor', 'framework' => 'Laravel']);

$value = $collection->get('age', 34);

// 34
```

Você pode até passar um callback como valor padrão do método. O resultado do callback será retornado se a chave especificada não existir:

```php
$collection->get('email', function () {
    return 'taylor@example.com';
});

// taylor@example.com
```

<a id="method-groupby"></a>
#### `groupBy()` {.collection-method}

O método `groupBy` agrupa os itens da collection por uma determinada chave:

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

Em vez de passar uma `key` de string, você pode passar um callback. O callback deve retornar o valor pelo qual você deseja indexar o grupo:

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

Múltiplos critérios de agrupamento podem ser passados como um array. Cada elemento do array será aplicado ao nível correspondente dentro de um array multidimensional:

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

O método `has` determina se uma determinada chave existe na collection:

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

O método `hasAny` determina se qualquer uma das chaves fornecidas existe na collection:

```php
$collection = collect(['account_id' => 1, 'product' => 'Desk', 'amount' => 5]);

$collection->hasAny(['product', 'price']);

// true

$collection->hasAny(['name', 'price']);

// false
```

<a id="method-hasmany"></a>
#### `hasMany()` {.collection-method}

O método `hasMany` determina se a collection contém múltiplos itens:

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

O método `hasSole` determina se a collection contém um único item, opcionalmente correspondendo aos critérios fornecidos:

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

O método `implode` une os itens de uma collection. Seus argumentos dependem do tipo de itens na collection. Se a collection contiver arrays ou objetos, você deve passar a chave dos atributos que deseja unir e a string "glue" (cola) que deseja colocar entre os valores:

```php
$collection = collect([
    ['account_id' => 1, 'product' => 'Desk'],
    ['account_id' => 2, 'product' => 'Chair'],
]);

$collection->implode('product', ', ');

// 'Desk, Chair'
```

Se a collection contiver strings simples ou valores numéricos, você deve passar a string "glue" como único argumento do método:

```php
collect([1, 2, 3, 4, 5])->implode('-');

// '1-2-3-4-5'
```

Você pode passar uma closure para o método `implode` se quiser formatar os valores que estão sendo unidos:

```php
$collection->implode(function (array $item, int $key) {
    return strtoupper($item['product']);
}, ', ');

// 'DESK, CHAIR'
```

<a id="method-intersect"></a>
#### `intersect()` {.collection-method}

O método `intersect` remove da collection original quaisquer valores que não estejam presentes no array ou collection fornecido. A collection resultante preservará as chaves da collection original:

```php
$collection = collect(['Desk', 'Sofa', 'Chair']);

$intersect = $collection->intersect(['Desk', 'Chair', 'Bookcase']);

$intersect->all();

// [0 => 'Desk', 2 => 'Chair']
```

> **Nota:**
> O comportamento desse método é modificado ao usar [Eloquent Collections](/en/eloquent-collections/#method-intersect).

<a id="method-intersectusing"></a>
#### `intersectUsing()` {.collection-method}

O método `intersectUsing` remove da collection original quaisquer valores que não estejam presentes no array ou collection fornecido, usando um callback personalizado para comparar os valores. A collection resultante preservará as chaves da collection original:

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

O método `intersectAssoc` compara a collection original com outra collection ou array, retornando os pares chave / valor que estão presentes em todas as collections fornecidas:

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

O método `intersectAssocUsing` compara a collection original com outra collection ou array, retornando os pares chave / valor que estão presentes em ambas, usando um callback de comparação personalizado para comparar as chaves:

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

O método `intersectByKeys` remove da collection original quaisquer chaves e seus valores correspondentes que não estejam presentes no array ou collection fornecido:

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

O método `isEmpty` retorna `true` se a collection estiver vazia; caso contrário, `false` é retornado:

```php
collect([])->isEmpty();

// true
```

<a id="method-isnotempty"></a>
#### `isNotEmpty()` {.collection-method}

O método `isNotEmpty` retorna `true` se a collection não estiver vazia; caso contrário, `false` é retornado:

```php
collect([])->isNotEmpty();

// false
```

<a id="method-join"></a>
#### `join()` {.collection-method}

O método `join` une os valores da collection com uma string. Usando o segundo argumento desse método, você também pode especificar como o elemento final deve ser anexado à string:

```php
collect(['a', 'b', 'c'])->join(', '); // 'a, b, c'
collect(['a', 'b', 'c'])->join(', ', ', and '); // 'a, b, and c'
collect(['a', 'b'])->join(', ', ' and '); // 'a and b'
collect(['a'])->join(', ', ' and '); // 'a'
collect([])->join(', ', ' and '); // ''
```

<a id="method-keyby"></a>
#### `keyBy()` {.collection-method}

O método `keyBy` indexa a collection pela chave fornecida. Se vários itens tiverem a mesma chave, apenas o último aparecerá na nova collection:

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

Você também pode passar um callback ao método. O callback deve retornar o valor pelo qual indexar a collection:

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

O método `keys` retorna todas as chaves da collection:

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

O método `last` retorna o último elemento da collection que passa por um determinado teste de verdade:

```php
collect([1, 2, 3, 4])->last(function (int $value, int $key) {
    return $value < 3;
});

// 2
```

Você também pode chamar o método `last` sem argumentos para obter o último elemento da collection. Se a collection estiver vazia, `null` é retornado:

```php
collect([1, 2, 3, 4])->last();

// 4
```

<a id="method-lazy"></a>
#### `lazy()` {.collection-method}

O método `lazy` retorna uma nova instância de [LazyCollection](#lazy-collections) a partir do array subjacente de itens:

```php
$lazyCollection = collect([1, 2, 3, 4])->lazy();

$lazyCollection::class;

// Illuminate\Support\LazyCollection

$lazyCollection->all();

// [1, 2, 3, 4]
```

Isso é especialmente útil quando você precisa realizar transformações em uma `Collection` enorme que contém muitos itens:

```php
$count = $hugeCollection
    ->lazy()
    ->where('country', 'FR')
    ->where('balance', '>', '100')
    ->count();
```

Ao converter a collection em uma `LazyCollection`, evitamos ter que alocar uma enorme quantidade de memória adicional. Embora a collection original ainda mantenha _seus_ valores em memória, os filtros subsequentes não o farão. Portanto, praticamente nenhuma memória adicional será alocada ao filtrar os resultados da collection.

<a id="method-macro"></a>
#### `macro()` {.collection-method}

O método estático `macro` permite adicionar métodos à classe `Collection` em tempo de execução. Consulte a documentação sobre [estendendo collections](#extending-collections) para mais informações.

<a id="method-make"></a>
#### `make()` {.collection-method}

O método estático `make` cria uma nova instância de collection. Veja a seção [Criando Collections](#creating-collections).

```php
use Illuminate\Support\Collection;

$collection = Collection::make([1, 2, 3]);
```

<a id="method-map"></a>
#### `map()` {.collection-method}

O método `map` itera pela collection e passa cada valor para o callback fornecido. O callback é livre para modificar o item e retorná-lo, formando assim uma nova collection de itens modificados:

```php
$collection = collect([1, 2, 3, 4, 5]);

$multiplied = $collection->map(function (int $item, int $key) {
    return $item * 2;
});

$multiplied->all();

// [2, 4, 6, 8, 10]
```

> **Aviso:**
> Como a maioria dos outros métodos de collection, `map` retorna uma nova instância de collection; ele não modifica a collection na qual é chamado. Se você quiser transformar a collection original, use o método [transform](#method-transform).

<a id="method-mapinto"></a>
#### `mapInto()` {.collection-method}

O método `mapInto()` itera sobre a collection, criando uma nova instância da classe fornecida passando o valor para o construtor:

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

O método `mapSpread` itera sobre os itens da collection, passando o valor de cada item aninhado para a closure fornecida. A closure é livre para modificar o item e retorná-lo, formando assim uma nova collection de itens modificados:

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

O método `mapToGroups` agrupa os itens da collection pela closure fornecida. A closure deve retornar um array associativo contendo um único par chave / valor, formando assim uma nova collection de valores agrupados:

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

O método `mapWithKeys` itera pela collection e passa cada valor para o callback fornecido. O callback deve retornar um array associativo contendo um único par chave / valor:

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

O método `max` retorna o valor máximo de uma determinada chave:

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

O método `median` retorna o [valor mediano](https://en.wikipedia.org/wiki/Median) de uma determinada chave:

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

O método `merge` mescla o array ou collection fornecido com a collection original. Se uma chave de string nos itens fornecidos corresponder a uma chave de string na collection original, o valor do item fornecido sobrescreverá o valor na collection original:

```php
$collection = collect(['product_id' => 1, 'price' => 100]);

$merged = $collection->merge(['price' => 200, 'discount' => false]);

$merged->all();

// ['product_id' => 1, 'price' => 200, 'discount' => false]
```

Se as chaves do item fornecido forem numéricas, os valores serão anexados ao final da collection:

```php
$collection = collect(['Desk', 'Chair']);

$merged = $collection->merge(['Bookcase', 'Door']);

$merged->all();

// ['Desk', 'Chair', 'Bookcase', 'Door']
```

<a id="method-mergerecursive"></a>
#### `mergeRecursive()` {.collection-method}

O método `mergeRecursive` mescla recursivamente o array ou collection fornecido com a collection original. Se uma chave de string nos itens fornecidos corresponder a uma chave de string na collection original, então os valores dessas chaves são mesclados em um array, e isso é feito recursivamente:

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

O método `min` retorna o valor mínimo de uma determinada chave:

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

O método `mode` retorna o [valor de moda](https://en.wikipedia.org/wiki/Mode_(statistics)) de uma determinada chave:

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

O método `multiply` cria o número especificado de cópias de todos os itens da collection:

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

O método `nth` cria uma nova collection composta por cada n-ésimo elemento:

```php
$collection = collect(['a', 'b', 'c', 'd', 'e', 'f']);

$collection->nth(4);

// ['a', 'e']
```

Você pode, opcionalmente, passar um offset inicial como segundo argumento:

```php
$collection->nth(4, 1);

// ['b', 'f']
```

<a id="method-only"></a>
#### `only()` {.collection-method}

O método `only` retorna os itens da collection com as chaves especificadas:

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

Para o inverso de `only`, veja o método [except](#method-except).

> **Nota:**
> O comportamento desse método é modificado ao usar [Eloquent Collections](/en/eloquent-collections/#method-only).

<a id="method-pad"></a>
#### `pad()` {.collection-method}

O método `pad` preencherá o array com o valor fornecido até que o array atinja o tamanho especificado. Esse método se comporta como a função PHP [array_pad](https://secure.php.net/manual/en/function.array-pad.php).

Para preencher à esquerda, você deve especificar um tamanho negativo. Nenhum preenchimento ocorrerá se o valor absoluto do tamanho fornecido for menor ou igual ao comprimento do array:

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

O método `partition` pode ser combinado com a desestruturação de arrays do PHP para separar os elementos que passam por um determinado teste de verdade daqueles que não passam:

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
> O comportamento desse método é modificado ao interagir com [Eloquent collections](/en/eloquent-collections/#method-partition).

<a id="method-percentage"></a>
#### `percentage()` {.collection-method}

O método `percentage` pode ser usado para determinar rapidamente a porcentagem de itens da collection que passam por um determinado teste de verdade:

```php
$collection = collect([1, 1, 2, 2, 2, 3]);

$percentage = $collection->percentage(fn (int $value) => $value === 1);

// 33.33
```

Por padrão, a porcentagem será arredondada para duas casas decimais. No entanto, você pode personalizar esse comportamento fornecendo um segundo argumento ao método:

```php
$percentage = $collection->percentage(fn (int $value) => $value === 1, precision: 3);

// 33.333
```

<a id="method-pipe"></a>
#### `pipe()` {.collection-method}

O método `pipe` passa a collection para a closure fornecida e retorna o resultado da closure executada:

```php
$collection = collect([1, 2, 3]);

$piped = $collection->pipe(function (Collection $collection) {
    return $collection->sum();
});

// 6
```

<a id="method-pipeinto"></a>
#### `pipeInto()` {.collection-method}

O método `pipeInto` cria uma nova instância da classe fornecida e passa a collection para o construtor:

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

O método `pipeThrough` passa a collection para o array de closures fornecido e retorna o resultado das closures executadas:

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

O método `pluck` recupera todos os valores de uma determinada chave:

```php
$collection = collect([
    ['product_id' => 'prod-100', 'name' => 'Desk'],
    ['product_id' => 'prod-200', 'name' => 'Chair'],
]);

$plucked = $collection->pluck('name');

$plucked->all();

// ['Desk', 'Chair']
```

Você também pode especificar como deseja que a collection resultante seja indexada:

```php
$plucked = $collection->pluck('name', 'product_id');

$plucked->all();

// ['prod-100' => 'Desk', 'prod-200' => 'Chair']
```

O método `pluck` também suporta recuperar valores aninhados usando a notação de "ponto":

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

Se existirem chaves duplicadas, o último elemento correspondente será inserido na collection resultante:

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

O método `pop` remove e retorna o último item da collection. Se a collection estiver vazia, `null` será retornado:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->pop();

// 5

$collection->all();

// [1, 2, 3, 4]
```

Você pode passar um inteiro ao método `pop` para remover e retornar múltiplos itens do final de uma collection:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->pop(3);

// collect([5, 4, 3])

$collection->all();

// [1, 2]
```

<a id="method-prepend"></a>
#### `prepend()` {.collection-method}

O método `prepend` adiciona um item ao início da collection:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->prepend(0);

$collection->all();

// [0, 1, 2, 3, 4, 5]
```

Você também pode passar um segundo argumento para especificar a chave do item inserido no início:

```php
$collection = collect(['one' => 1, 'two' => 2]);

$collection->prepend(0, 'zero');

$collection->all();

// ['zero' => 0, 'one' => 1, 'two' => 2]
```

<a id="method-pull"></a>
#### `pull()` {.collection-method}

O método `pull` remove e retorna um item da collection pela sua chave:

```php
$collection = collect(['product_id' => 'prod-100', 'name' => 'Desk']);

$collection->pull('name');

// 'Desk'

$collection->all();

// ['product_id' => 'prod-100']
```

<a id="method-push"></a>
#### `push()` {.collection-method}

O método `push` anexa um item ao final da collection:

```php
$collection = collect([1, 2, 3, 4]);

$collection->push(5);

$collection->all();

// [1, 2, 3, 4, 5]
```

Você também pode fornecer múltiplos itens para anexar ao final da collection:

```php
$collection = collect([1, 2, 3, 4]);

$collection->push(5, 6, 7);

$collection->all();

// [1, 2, 3, 4, 5, 6, 7]
```

<a id="method-put"></a>
#### `put()` {.collection-method}

O método `put` define a chave e o valor fornecidos na collection:

```php
$collection = collect(['product_id' => 1, 'name' => 'Desk']);

$collection->put('price', 100);

$collection->all();

// ['product_id' => 1, 'name' => 'Desk', 'price' => 100]
```

<a id="method-random"></a>
#### `random()` {.collection-method}

O método `random` retorna um item aleatório da collection:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->random();

// 4 - (retrieved randomly)
```

Você pode passar um inteiro para `random` para especificar quantos itens gostaria de recuperar aleatoriamente. Uma collection de itens é sempre retornada quando você passa explicitamente o número de itens que deseja receber:

```php
$random = $collection->random(3);

$random->all();

// [2, 4, 5] - (retrieved randomly)
```

Se a instância da collection tiver menos itens do que o solicitado, o método `random` lançará uma `InvalidArgumentException`.

O método `random` também aceita uma closure, que receberá a instância atual da collection:

```php
use Illuminate\Support\Collection;

$random = $collection->random(fn (Collection $items) => min(10, count($items)));

$random->all();

// [1, 2, 3, 4, 5] - (retrieved randomly)
```

<a id="method-range"></a>
#### `range()` {.collection-method}

O método `range` retorna uma collection contendo inteiros entre o intervalo especificado:

```php
$collection = collect()->range(3, 6);

$collection->all();

// [3, 4, 5, 6]
```

<a id="method-reduce"></a>
#### `reduce()` {.collection-method}

O método `reduce` reduz a collection a um único valor, passando o resultado de cada iteração para a iteração subsequente:

```php
$collection = collect([1, 2, 3]);

$total = $collection->reduce(function (?int $carry, int $item) {
    return $carry + $item;
});

// 6
```

O valor de `$carry` na primeira iteração é `null`; no entanto, você pode especificar seu valor inicial passando um segundo argumento para `reduce`:

```php
$collection->reduce(function (int $carry, int $item) {
    return $carry + $item;
}, 4);

// 10
```

O método `reduce` também passa as chaves do array para o callback fornecido:

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

O método `reduceInto` reduz a collection a um único valor mutando o valor inicial fornecido. Ao contrário do método `reduce`, o callback fornecido não precisa retornar o valor acumulado:

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

Ao reduzir para um escalar ou array, você deve aceitá-lo por referência no callback para que suas mutações sejam aplicadas ao valor original:

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

O método `reduceSpread` reduz a collection a um array de valores, passando os resultados de cada iteração para a iteração subsequente. Esse método é semelhante ao método `reduce`; no entanto, ele pode aceitar múltiplos valores iniciais:

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

O método `reject` filtra a collection usando a closure fornecida. A closure deve retornar `true` se o item deve ser removido da collection resultante:

```php
$collection = collect([1, 2, 3, 4]);

$filtered = $collection->reject(function (int $value, int $key) {
    return $value > 2;
});

$filtered->all();

// [1, 2]
```

Para o inverso do método `reject`, veja o método [filter](#method-filter).

<a id="method-replace"></a>
#### `replace()` {.collection-method}

O método `replace` se comporta de forma semelhante ao `merge`; no entanto, além de sobrescrever os itens correspondentes que têm chaves de string, o método `replace` também sobrescreverá os itens da collection que têm chaves numéricas correspondentes:

```php
$collection = collect(['Taylor', 'Abigail', 'James']);

$replaced = $collection->replace([1 => 'Victoria', 3 => 'Finn']);

$replaced->all();

// ['Taylor', 'Victoria', 'James', 'Finn']
```

<a id="method-replacerecursive"></a>
#### `replaceRecursive()` {.collection-method}

O método `replaceRecursive` se comporta de forma semelhante ao `replace`, mas entrará recursivamente nos arrays e aplicará o mesmo processo de substituição aos valores internos:

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

O método `reverse` inverte a ordem dos itens da collection, preservando as chaves originais:

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

O método `search` pesquisa o valor fornecido na collection e retorna sua chave se encontrado. Se o item não for encontrado, `false` é retornado:

```php
$collection = collect([2, 4, 6, 8]);

$collection->search(4);

// 1
```

A pesquisa é feita usando comparação "loose", o que significa que uma string com um valor inteiro será considerada igual a um inteiro de mesmo valor. Para usar comparação "strict", passe `true` como segundo argumento do método:

```php
collect([2, 4, 6, 8])->search('4', strict: true);

// false
```

Alternativamente, você pode fornecer sua própria closure para pesquisar o primeiro item que passe por um determinado teste de verdade:

```php
collect([2, 4, 6, 8])->search(function (int $item, int $key) {
    return $item > 5;
});

// 2
```

<a id="method-select"></a>
#### `select()` {.collection-method}

O método `select` seleciona as chaves fornecidas da collection, de forma semelhante a uma instrução `SELECT` do SQL:

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

O método `shift` remove e retorna o primeiro item da collection:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->shift();

// 1

$collection->all();

// [2, 3, 4, 5]
```

Você pode passar um inteiro ao método `shift` para remover e retornar múltiplos itens do início de uma collection:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->shift(3);

// collect([1, 2, 3])

$collection->all();

// [4, 5]
```

<a id="method-shuffle"></a>
#### `shuffle()` {.collection-method}

O método `shuffle` embaralha aleatoriamente os itens da collection:

```php
$collection = collect([1, 2, 3, 4, 5]);

$shuffled = $collection->shuffle();

$shuffled->all();

// [3, 2, 5, 1, 4] - (generated randomly)
```

<a id="method-skip"></a>
#### `skip()` {.collection-method}

O método `skip` retorna uma nova collection, com o número fornecido de elementos removidos do início da collection:

```php
$collection = collect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

$collection = $collection->skip(4);

$collection->all();

// [5, 6, 7, 8, 9, 10]
```

<a id="method-skipuntil"></a>
#### `skipUntil()` {.collection-method}

O método `skipUntil` pula os itens da collection enquanto o callback fornecido retornar `false`. Uma vez que o callback retorne `true`, todos os itens restantes da collection serão retornados como uma nova collection:

```php
$collection = collect([1, 2, 3, 4]);

$subset = $collection->skipUntil(function (int $item) {
    return $item >= 3;
});

$subset->all();

// [3, 4]
```

Você também pode passar um valor simples ao método `skipUntil` para pular todos os itens até que o valor fornecido seja encontrado:

```php
$collection = collect([1, 2, 3, 4]);

$subset = $collection->skipUntil(3);

$subset->all();

// [3, 4]
```

> **Aviso:**
> Se o valor fornecido não for encontrado ou o callback nunca retornar `true`, o método `skipUntil` retornará uma collection vazia.

<a id="method-skipwhile"></a>
#### `skipWhile()` {.collection-method}

O método `skipWhile` pula os itens da collection enquanto o callback fornecido retornar `true`. Uma vez que o callback retorne `false`, todos os itens restantes da collection serão retornados como uma nova collection:

```php
$collection = collect([1, 2, 3, 4]);

$subset = $collection->skipWhile(function (int $item) {
    return $item <= 3;
});

$subset->all();

// [4]
```

> **Aviso:**
> Se o callback nunca retornar `false`, o método `skipWhile` retornará uma collection vazia.

<a id="method-slice"></a>
#### `slice()` {.collection-method}

O método `slice` retorna uma fatia da collection começando no índice fornecido:

```php
$collection = collect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

$slice = $collection->slice(4);

$slice->all();

// [5, 6, 7, 8, 9, 10]
```

Se você quiser limitar o tamanho da fatia retornada, passe o tamanho desejado como segundo argumento do método:

```php
$slice = $collection->slice(4, 2);

$slice->all();

// [5, 6]
```

A fatia retornada preservará as chaves por padrão. Se você não quiser preservar as chaves originais, pode usar o método [values](#method-values) para reindexá-las.

<a id="method-sliding"></a>
#### `sliding()` {.collection-method}

O método `sliding` retorna uma nova collection de chunks representando uma visão de "janela deslizante" dos itens da collection:

```php
$collection = collect([1, 2, 3, 4, 5]);

$chunks = $collection->sliding(2);

$chunks->toArray();

// [[1, 2], [2, 3], [3, 4], [4, 5]]
```

Isso é especialmente útil em conjunto com o método [eachSpread](#method-eachspread):

```php
$transactions->sliding(2)->eachSpread(function ($previous, $current) {
    $current->total = $previous->total + $current->amount;
});
```

Você pode, opcionalmente, passar um segundo valor de "step" (passo), que determina a distância entre o primeiro item de cada chunk:

```php
$collection = collect([1, 2, 3, 4, 5]);

$chunks = $collection->sliding(3, step: 2);

$chunks->toArray();

// [[1, 2, 3], [3, 4, 5]]
```

<a id="method-sole"></a>
#### `sole()` {.collection-method}

O método `sole` retorna o primeiro elemento da collection que passa por um determinado teste de verdade, mas apenas se o teste de verdade corresponder a exatamente um elemento:

```php
collect([1, 2, 3, 4])->sole(function (int $value, int $key) {
    return $value === 2;
});

// 2
```

Você também pode passar um par chave / valor ao método `sole`, que retornará o primeiro elemento da collection que corresponda ao par fornecido, mas apenas se exatamente um elemento corresponder:

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Chair', 'price' => 100],
]);

$collection->sole('product', 'Chair');

// ['product' => 'Chair', 'price' => 100]
```

Alternativamente, você também pode chamar o método `sole` sem argumento para obter o primeiro elemento da collection se houver apenas um elemento:

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
]);

$collection->sole();

// ['product' => 'Desk', 'price' => 200]
```

Se não houver elementos na collection que devam ser retornados pelo método `sole`, uma exceção `\Illuminate\Support\ItemNotFoundException` será lançada. Se houver mais de um elemento que deva ser retornado, uma `\Illuminate\Support\MultipleItemsFoundException` será lançada.

<a id="method-some"></a>
#### `some()` {.collection-method}

Alias para o método [contains](#method-contains).

<a id="method-sort"></a>
#### `sort()` {.collection-method}

O método `sort` ordena a collection. A collection ordenada mantém as chaves do array original, então no exemplo a seguir usaremos o método [values](#method-values) para redefinir as chaves para índices numerados consecutivamente:

```php
$collection = collect([5, 3, 1, 2, 4]);

$sorted = $collection->sort();

$sorted->values()->all();

// [1, 2, 3, 4, 5]
```

Se suas necessidades de ordenação forem mais avançadas, você pode passar um callback para `sort` com seu próprio algoritmo. Consulte a documentação do PHP sobre [uasort](https://secure.php.net/manual/en/function.uasort.php#refsect1-function.uasort-parameters), que é o que o método `sort` da collection utiliza internamente.

> **Nota:**
> Se você precisar ordenar uma collection de arrays ou objetos aninhados, veja os métodos [sortBy](#method-sortby) e [sortByDesc](#method-sortbydesc).

<a id="method-sortby"></a>
#### `sortBy()` {.collection-method}

O método `sortBy` ordena a collection pela chave fornecida. A collection ordenada mantém as chaves do array original, então no exemplo a seguir usaremos o método [values](#method-values) para redefinir as chaves para índices numerados consecutivamente:

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

O método `sortBy` aceita [sort flags](https://www.php.net/manual/en/function.sort.php) como seu segundo argumento:

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

Alternativamente, você pode passar sua própria closure para determinar como ordenar os valores da collection:

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

Se você quiser ordenar sua collection por múltiplos atributos, pode passar um array de operações de ordenação ao método `sortBy`. Cada operação de ordenação deve ser um array composto pelo atributo pelo qual deseja ordenar e a direção da ordenação desejada:

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

Ao ordenar uma collection por múltiplos atributos, você também pode fornecer closures que definem cada operação de ordenação:

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

Esse método tem a mesma assinatura do método [sortBy](#method-sortby), mas ordenará a collection na ordem oposta.

<a id="method-sortdesc"></a>
#### `sortDesc()` {.collection-method}

Esse método ordenará a collection na ordem oposta à do método [sort](#method-sort):

```php
$collection = collect([5, 3, 1, 2, 4]);

$sorted = $collection->sortDesc();

$sorted->values()->all();

// [5, 4, 3, 2, 1]
```

Ao contrário de `sort`, você não pode passar uma closure para `sortDesc`. Em vez disso, você deve usar o método [sort](#method-sort) e inverter sua comparação.

<a id="method-sortkeys"></a>
#### `sortKeys()` {.collection-method}

O método `sortKeys` ordena a collection pelas chaves do array associativo subjacente:

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

Esse método tem a mesma assinatura do método [sortKeys](#method-sortkeys), mas ordenará a collection na ordem oposta.

<a id="method-sortkeysusing"></a>
#### `sortKeysUsing()` {.collection-method}

O método `sortKeysUsing` ordena a collection pelas chaves do array associativo subjacente usando um callback:

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

O callback deve ser uma função de comparação que retorna um inteiro menor que, igual a, ou maior que zero. Para mais informações, consulte a documentação do PHP sobre [uksort](https://www.php.net/manual/en/function.uksort.php#refsect1-function.uksort-parameters), que é a função PHP que o método `sortKeysUsing` utiliza internamente.

<a id="method-splice"></a>
#### `splice()` {.collection-method}

O método `splice` remove e retorna uma fatia de itens começando no índice especificado:

```php
$collection = collect([1, 2, 3, 4, 5]);

$chunk = $collection->splice(2);

$chunk->all();

// [3, 4, 5]

$collection->all();

// [1, 2]
```

Você pode passar um segundo argumento para limitar o tamanho da collection resultante:

```php
$collection = collect([1, 2, 3, 4, 5]);

$chunk = $collection->splice(2, 1);

$chunk->all();

// [3]

$collection->all();

// [1, 2, 4, 5]
```

Além disso, você pode passar um terceiro argumento contendo os novos itens para substituir os itens removidos da collection:

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

O método `split` quebra uma collection no número de grupos fornecido:

```php
$collection = collect([1, 2, 3, 4, 5]);

$groups = $collection->split(3);

$groups->all();

// [[1, 2], [3, 4], [5]]
```

<a id="method-splitin"></a>
#### `splitIn()` {.collection-method}

O método `splitIn` quebra uma collection no número de grupos fornecido, preenchendo completamente os grupos não-terminais antes de alocar o restante ao grupo final:

```php
$collection = collect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

$groups = $collection->splitIn(3);

$groups->all();

// [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10]]
```

<a id="method-sum"></a>
#### `sum()` {.collection-method}

O método `sum` retorna a soma de todos os itens da collection:

```php
collect([1, 2, 3, 4, 5])->sum();

// 15
```

Se a collection contiver arrays ou objetos aninhados, você deve passar uma chave que será usada para determinar quais valores somar:

```php
$collection = collect([
    ['name' => 'JavaScript: The Good Parts', 'pages' => 176],
    ['name' => 'JavaScript: The Definitive Guide', 'pages' => 1096],
]);

$collection->sum('pages');

// 1272
```

Além disso, você pode passar sua própria closure para determinar quais valores da collection somar:

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

O método `take` retorna uma nova collection com o número especificado de itens:

```php
$collection = collect([0, 1, 2, 3, 4, 5]);

$chunk = $collection->take(3);

$chunk->all();

// [0, 1, 2]
```

Você também pode passar um inteiro negativo para pegar o número especificado de itens a partir do final da collection:

```php
$collection = collect([0, 1, 2, 3, 4, 5]);

$chunk = $collection->take(-2);

$chunk->all();

// [4, 5]
```

<a id="method-takeuntil"></a>
#### `takeUntil()` {.collection-method}

O método `takeUntil` retorna os itens da collection até que o callback fornecido retorne `true`:

```php
$collection = collect([1, 2, 3, 4]);

$subset = $collection->takeUntil(function (int $item) {
    return $item >= 3;
});

$subset->all();

// [1, 2]
```

Você também pode passar um valor simples ao método `takeUntil` para obter os itens até que o valor fornecido seja encontrado:

```php
$collection = collect([1, 2, 3, 4]);

$subset = $collection->takeUntil(3);

$subset->all();

// [1, 2]
```

> **Aviso:**
> Se o valor fornecido não for encontrado ou o callback nunca retornar `true`, o método `takeUntil` retornará todos os itens da collection.

<a id="method-takewhile"></a>
#### `takeWhile()` {.collection-method}

O método `takeWhile` retorna os itens da collection até que o callback fornecido retorne `false`:

```php
$collection = collect([1, 2, 3, 4]);

$subset = $collection->takeWhile(function (int $item) {
    return $item < 3;
});

$subset->all();

// [1, 2]
```

> **Aviso:**
> Se o callback nunca retornar `false`, o método `takeWhile` retornará todos os itens da collection.

<a id="method-tap"></a>
#### `tap()` {.collection-method}

O método `tap` passa a collection para o callback fornecido, permitindo que você "entre" (tap) na collection em um ponto específico e faça algo com os itens sem afetar a própria collection. A collection é então retornada pelo método `tap`:

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

O método estático `times` cria uma nova collection invocando a closure fornecida um número especificado de vezes:

```php
$collection = Collection::times(10, function (int $number) {
    return $number * 9;
});

$collection->all();

// [9, 18, 27, 36, 45, 54, 63, 72, 81, 90]
```

<a id="method-toarray"></a>
#### `toArray()` {.collection-method}

O método `toArray` converte a collection em um `array` PHP simples. Se os valores da collection forem models [Eloquent](/en/eloquent/), os models também serão convertidos em arrays:

```php
$collection = collect(['name' => 'Desk', 'price' => 200]);

$collection->toArray();

// ['name' => 'Desk', 'price' => 200]
```

> **Aviso:**
> `toArray` também converte todos os objetos aninhados da collection que sejam uma instância de `Arrayable` em um array. Se você quiser obter o array bruto subjacente à collection, use o método [all](#method-all).

<a id="method-tojson"></a>
#### `toJson()` {.collection-method}

O método `toJson` converte a collection em uma string serializada em JSON:

```php
$collection = collect(['name' => 'Desk', 'price' => 200]);

$collection->toJson();

// '{"name":"Desk","price":200}'
```

<a id="method-to-pretty-json"></a>
#### `toPrettyJson()` {.collection-method}

O método `toPrettyJson` converte a collection em uma string JSON formatada usando a opção `JSON_PRETTY_PRINT`:

```php
$collection = collect(['name' => 'Desk', 'price' => 200]);

$collection->toPrettyJson();
```

<a id="method-transform"></a>
#### `transform()` {.collection-method}

O método `transform` itera sobre a collection e chama o callback fornecido com cada item da collection. Os itens da collection serão substituídos pelos valores retornados pelo callback:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->transform(function (int $item, int $key) {
    return $item * 2;
});

$collection->all();

// [2, 4, 6, 8, 10]
```

> **Aviso:**
> Ao contrário da maioria dos outros métodos de collection, `transform` modifica a própria collection. Se você quiser criar uma nova collection, use o método [map](#method-map).

<a id="method-undot"></a>
#### `undot()` {.collection-method}

O método `undot` expande uma collection unidimensional que usa a notação de "ponto" em uma collection multidimensional:

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

O método `union` adiciona o array fornecido à collection. Se o array fornecido contiver chaves que já estão na collection original, os valores da collection original serão preferidos:

```php
$collection = collect([1 => ['a'], 2 => ['b']]);

$union = $collection->union([3 => ['c'], 1 => ['d']]);

$union->all();

// [1 => ['a'], 2 => ['b'], 3 => ['c']]
```

<a id="method-unique"></a>
#### `unique()` {.collection-method}

O método `unique` retorna todos os itens únicos da collection. A collection retornada mantém as chaves do array original, então no exemplo a seguir usaremos o método [values](#method-values) para redefinir as chaves para índices numerados consecutivamente:

```php
$collection = collect([1, 1, 2, 2, 3, 4, 2]);

$unique = $collection->unique();

$unique->values()->all();

// [1, 2, 3, 4]
```

Ao lidar com arrays ou objetos aninhados, você pode especificar a chave usada para determinar a unicidade:

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

Por fim, você também pode passar sua própria closure para o método `unique` para especificar qual valor deve determinar a unicidade de um item:

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

O método `unique` usa comparações "loose" ao verificar valores de item, o que significa que uma string com um valor inteiro será considerada igual a um inteiro de mesmo valor. Use o método [uniqueStrict](#method-uniquestrict) para filtrar usando comparações "strict".

> **Nota:**
> O comportamento desse método é modificado ao usar [Eloquent Collections](/en/eloquent-collections/#method-unique).

<a id="method-uniquestrict"></a>
#### `uniqueStrict()` {.collection-method}

Esse método tem a mesma assinatura do método [unique](#method-unique); no entanto, todos os valores são comparados usando comparações "strict".

<a id="method-unless"></a>
#### `unless()` {.collection-method}

O método `unless` executará o callback fornecido a menos que o primeiro argumento fornecido ao método seja avaliado como `true`. A instância da collection e o primeiro argumento fornecido ao método `unless` serão fornecidos à closure:

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

Um segundo callback pode ser passado ao método `unless`. O segundo callback será executado quando o primeiro argumento fornecido ao método `unless` for avaliado como `true`:

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

Para o inverso de `unless`, veja o método [when](#method-when).

<a id="method-unlessempty"></a>
#### `unlessEmpty()` {.collection-method}

Alias para o método [whenNotEmpty](#method-whennotempty).

<a id="method-unlessnotempty"></a>
#### `unlessNotEmpty()` {.collection-method}

Alias para o método [whenEmpty](#method-whenempty).

<a id="method-unwrap"></a>
#### `unwrap()` {.collection-method}

O método estático `unwrap` retorna os itens subjacentes da collection a partir do valor fornecido quando aplicável:

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

O método `value` recupera um determinado valor do primeiro elemento da collection:

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

O método `values` retorna uma nova collection com as chaves redefinidas para inteiros consecutivos:

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

O método `when` executará o callback fornecido quando o primeiro argumento fornecido ao método for avaliado como `true`. A instância da collection e o primeiro argumento fornecido ao método `when` serão fornecidos à closure:

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

Um segundo callback pode ser passado ao método `when`. O segundo callback será executado quando o primeiro argumento fornecido ao método `when` for avaliado como `false`:

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

Para o inverso de `when`, veja o método [unless](#method-unless).

<a id="method-whenempty"></a>
#### `whenEmpty()` {.collection-method}

O método `whenEmpty` executará o callback fornecido quando a collection estiver vazia:

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

Uma segunda closure pode ser passada ao método `whenEmpty`, que será executada quando a collection não estiver vazia:

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

Para o inverso de `whenEmpty`, veja o método [whenNotEmpty](#method-whennotempty).

<a id="method-whennotempty"></a>
#### `whenNotEmpty()` {.collection-method}

O método `whenNotEmpty` executará o callback fornecido quando a collection não estiver vazia:

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

Uma segunda closure pode ser passada ao método `whenNotEmpty`, que será executada quando a collection estiver vazia:

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

Para o inverso de `whenNotEmpty`, veja o método [whenEmpty](#method-whenempty).

<a id="method-where"></a>
#### `where()` {.collection-method}

O método `where` filtra a collection por um determinado par chave / valor:

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

O método `where` usa comparações "loose" ao verificar valores de item, o que significa que uma string com um valor inteiro será considerada igual a um inteiro de mesmo valor. Use o método [whereStrict](#method-wherestrict) para filtrar usando comparações "strict", ou os métodos [whereNull](#method-wherenull) e [whereNotNull](#method-wherenotnull) para filtrar valores `null`.

Opcionalmente, você pode passar um operador de comparação como segundo parâmetro. Os operadores suportados são: '===', '!==', '!=', '==', '=', '<>', '>', '<', '>=' e '<=':

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

Esse método tem a mesma assinatura do método [where](#method-where); no entanto, todos os valores são comparados usando comparações "strict".

<a id="method-wherebetween"></a>
#### `whereBetween()` {.collection-method}

O método `whereBetween` filtra a collection determinando se um valor de item especificado está dentro de um determinado intervalo:

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

O método `whereIn` remove da collection os elementos que não têm um valor de item especificado contido no array fornecido:

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

O método `whereIn` usa comparações "loose" ao verificar valores de item, o que significa que uma string com um valor inteiro será considerada igual a um inteiro de mesmo valor. Use o método [whereInStrict](#method-whereinstrict) para filtrar usando comparações "strict".

<a id="method-whereinstrict"></a>
#### `whereInStrict()` {.collection-method}

Esse método tem a mesma assinatura do método [whereIn](#method-wherein); no entanto, todos os valores são comparados usando comparações "strict".

<a id="method-whereinstanceof"></a>
#### `whereInstanceOf()` {.collection-method}

O método `whereInstanceOf` filtra a collection por um determinado tipo de classe:

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

O método `whereNotBetween` filtra a collection determinando se um valor de item especificado está fora de um determinado intervalo:

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

O método `whereNotIn` remove da collection os elementos que têm um valor de item especificado contido no array fornecido:

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

O método `whereNotIn` usa comparações "loose" ao verificar valores de item, o que significa que uma string com um valor inteiro será considerada igual a um inteiro de mesmo valor. Use o método [whereNotInStrict](#method-wherenotinstrict) para filtrar usando comparações "strict".

<a id="method-wherenotinstrict"></a>
#### `whereNotInStrict()` {.collection-method}

Esse método tem a mesma assinatura do método [whereNotIn](#method-wherenotin); no entanto, todos os valores são comparados usando comparações "strict".

<a id="method-wherenotnull"></a>
#### `whereNotNull()` {.collection-method}

O método `whereNotNull` retorna os itens da collection em que a chave fornecida não é `null`:

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

O método `whereNull` retorna os itens da collection em que a chave fornecida é `null`:

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

O método estático `wrap` envolve o valor fornecido em uma collection quando aplicável:

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

O método `zip` mescla os valores do array fornecido com os valores da collection original em seus índices correspondentes:

```php
$collection = collect(['Chair', 'Desk']);

$zipped = $collection->zip([100, 200]);

$zipped->all();

// [['Chair', 100], ['Desk', 200]]
```

<a id="higher-order-messages"></a>
## Higher Order Messages

As collections também fornecem suporte para "higher order messages", que são atalhos para realizar ações comuns em collections. Os métodos de collection que fornecem higher order messages são: [average](#method-average), [avg](#method-avg), [contains](#method-contains), [each](#method-each), [every](#method-every), [filter](#method-filter), [first](#method-first), [flatMap](#method-flatmap), [groupBy](#method-groupby), [keyBy](#method-keyby), [map](#method-map), [max](#method-max), [min](#method-min), [partition](#method-partition), [reject](#method-reject), [skipUntil](#method-skipuntil), [skipWhile](#method-skipwhile), [some](#method-some), [sortBy](#method-sortby), [sortByDesc](#method-sortbydesc), [sum](#method-sum), [takeUntil](#method-takeuntil), [takeWhile](#method-takewhile) e [unique](#method-unique).

Cada higher order message pode ser acessada como uma propriedade dinâmica em uma instância de collection. Por exemplo, vamos usar a higher order message `each` para chamar um método em cada objeto dentro de uma collection:

```php
use App\Models\User;

$users = User::where('votes', '>', 500)->get();

$users->each->markAsVip();
```

Da mesma forma, podemos usar a higher order message `sum` para reunir o número total de "votes" de uma collection de usuários:

```php
$users = User::where('group', 'Development')->get();

return $users->sum->votes;
```

<a id="lazy-collections"></a>
## Lazy Collections

<a id="lazy-collection-introduction"></a>
### Introdução

> **Aviso:**
> Antes de aprender mais sobre as lazy collections do Laravel, reserve um tempo para se familiarizar com os [generators do PHP](https://www.php.net/manual/en/language.generators.overview.php).

Para complementar a já poderosa classe `Collection`, a classe `LazyCollection` aproveita os [generators](https://www.php.net/manual/en/language.generators.overview.php) do PHP para permitir que você trabalhe com conjuntos de dados muito grandes mantendo o uso de memória baixo.

Por exemplo, imagine que sua aplicação precisa processar um arquivo de log de vários gigabytes enquanto aproveita os métodos de collection do Laravel para fazer o parsing dos logs. Em vez de ler o arquivo inteiro na memória de uma só vez, as lazy collections podem ser usadas para manter apenas uma pequena parte do arquivo na memória em um determinado momento:

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

Ou imagine que você precisa iterar por 10.000 models Eloquent. Ao usar collections tradicionais do Laravel, todos os 10.000 models Eloquent devem ser carregados na memória ao mesmo tempo:

```php
use App\Models\User;

$users = User::all()->filter(function (User $user) {
    return $user->id > 500;
});
```

No entanto, o método `cursor` do query builder retorna uma instância de `LazyCollection`. Isso permite que você ainda execute uma única query no banco de dados, mas também mantenha apenas um model Eloquent carregado na memória por vez. Neste exemplo, o callback `filter` não é executado até que realmente iteremos sobre cada usuário individualmente, permitindo uma redução drástica no uso de memória:

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
### Criando Lazy Collections

Para criar uma instância de lazy collection, você deve passar uma função generator do PHP para o método `make` da collection:

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
### O Contract Enumerable

Quase todos os métodos disponíveis na classe `Collection` também estão disponíveis na classe `LazyCollection`. Ambas as classes implementam o contract `Illuminate\Support\Enumerable`, que define os seguintes métodos:

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

> **Aviso:**
> Métodos que mutam a collection (como `shift`, `pop`, `prepend` etc.) **não** estão disponíveis na classe `LazyCollection`.

<a id="lazy-collection-methods"></a>
### Métodos de Lazy Collection

Além dos métodos definidos no contract `Enumerable`, a classe `LazyCollection` contém os seguintes métodos:

<a id="method-takeUntilTimeout"></a>
#### `takeUntilTimeout()` {.collection-method}

O método `takeUntilTimeout` retorna uma nova lazy collection que enumerará os valores até o horário especificado. Após esse horário, a collection então parará de enumerar:

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

Para ilustrar o uso desse método, imagine uma aplicação que envia faturas do banco de dados usando um cursor. Você poderia definir uma [tarefa agendada](/en/scheduling/) que é executada a cada 15 minutos e processa faturas por no máximo 14 minutos:

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

Enquanto o método `each` chama o callback fornecido para cada item da collection imediatamente, o método `tapEach` só chama o callback fornecido à medida que os itens são retirados da lista um por um:

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

O método `throttle` limitará a taxa (throttle) da lazy collection de modo que cada valor seja retornado após o número especificado de segundos. Esse método é especialmente útil para situações em que você pode estar interagindo com APIs externas que limitam a taxa de requisições recebidas:

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

O método `remember` retorna uma nova lazy collection que lembrará quaisquer valores que já foram enumerados e não os recuperará novamente em enumerações subsequentes da collection:

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

O método `withHeartbeat` permite que você execute um callback em intervalos de tempo regulares enquanto uma lazy collection está sendo enumerada. Isso é particularmente útil para operações de longa execução que exigem tarefas de manutenção periódicas, como estender locks ou enviar atualizações de progresso:

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
