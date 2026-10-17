---
title: "Banco de Dados: Construtor de Consultas"
---

- [Introdução](#introduction)
- [Executando Consultas ao Banco de Dados](#running-database-queries)
    - [Dividindo Resultados em Blocos (Chunking)](#chunking-results)
    - [Transmitindo Resultados de Forma Preguiçosa (Lazy)](#streaming-results-lazily)
    - [Agregações](#aggregates)
- [Instruções Select](#select-statements)
- [Expressões Brutas (Raw)](#raw-expressions)
- [Joins](#joins)
- [Unions](#unions)
- [Cláusulas Where Básicas](#basic-where-clauses)
    - [Cláusulas Where](#where-clauses)
    - [Cláusulas Or Where](#or-where-clauses)
    - [Cláusulas Where Not](#where-not-clauses)
    - [Cláusulas Where Any / All / None](#where-any-all-none-clauses)
    - [Cláusulas Where para JSON](#json-where-clauses)
    - [Cláusulas Where Adicionais](#additional-where-clauses)
    - [Agrupamento Lógico](#logical-grouping)
- [Cláusulas Where Avançadas](#advanced-where-clauses)
    - [Cláusulas Where Exists](#where-exists-clauses)
    - [Cláusulas Where com Subconsulta](#subquery-where-clauses)
    - [Cláusulas Where de Texto Completo (Full Text)](#full-text-where-clauses)
    - [Cláusulas de Similaridade de Vetores](#vector-similarity-clauses)
- [Ordenação, Agrupamento, Limit e Offset](#ordering-grouping-limit-and-offset)
    - [Ordenação](#ordering)
    - [Agrupamento](#grouping)
    - [Limit e Offset](#limit-and-offset)
- [Cláusulas Condicionais](#conditional-clauses)
- [Instruções Insert](#insert-statements)
    - [Upserts](#upserts)
- [Instruções Update](#update-statements)
    - [Atualizando Colunas JSON](#updating-json-columns)
    - [Incremento e Decremento](#increment-and-decrement)
- [Instruções Delete](#delete-statements)
- [Bloqueio Pessimista](#pessimistic-locking)
- [Componentes de Consulta Reutilizáveis](#reusable-query-components)
- [Depuração](#debugging)

<a id="introduction"></a>
## Introdução

O construtor de consultas (query builder) de banco de dados do Laravel fornece uma interface conveniente e fluente para criar e executar consultas ao banco de dados. Ele pode ser usado para realizar a maioria das operações de banco de dados em sua aplicação e funciona perfeitamente com todos os sistemas de banco de dados suportados pelo Laravel.

O construtor de consultas do Laravel usa vinculação de parâmetros do PDO para proteger sua aplicação contra ataques de injeção de SQL. Não há necessidade de limpar ou sanitizar strings passadas ao construtor de consultas como vinculações de consulta (query bindings).

> **Warning:**
> O PDO não suporta a vinculação de nomes de colunas. Portanto, você nunca deve permitir que a entrada do usuário determine os nomes das colunas referenciadas por suas consultas, incluindo as colunas de "order by".

<a id="running-database-queries"></a>
## Executando Consultas ao Banco de Dados

<a id="retrieving-all-rows-from-a-table"></a>
#### Recuperando Todas as Linhas de uma Tabela

Você pode usar o método `table` fornecido pela facade `DB` para iniciar uma consulta. O método `table` retorna uma instância fluente do construtor de consultas para a tabela informada, permitindo que você encadeie mais restrições à consulta e, por fim, recupere os resultados da consulta usando o método `get`:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * Show a list of all of the application's users.
     */
    public function index(): View
    {
        $users = DB::table('users')->get();

        return view('user.index', ['users' => $users]);
    }
}
```

O método `get` retorna uma instância de `Illuminate\Support\Collection` contendo os resultados da consulta, onde cada resultado é uma instância do objeto `stdClass` do PHP. Você pode acessar o valor de cada coluna acessando a coluna como uma propriedade do objeto:

```php
use Illuminate\Support\Facades\DB;

$users = DB::table('users')->get();

foreach ($users as $user) {
    echo $user->name;
}
```

> **Note:**
> As collections do Laravel fornecem uma variedade de métodos extremamente poderosos para mapear e reduzir dados. Para mais informações sobre as collections do Laravel, confira a [documentação de collections](/pt-br/collections/).

<a id="retrieving-a-single-row-column-from-a-table"></a>
#### Recuperando uma Única Linha / Coluna de uma Tabela

Se você precisa apenas recuperar uma única linha de uma tabela de banco de dados, pode usar o método `first` da facade `DB`. Este método retornará um único objeto `stdClass`:

```php
$user = DB::table('users')->where('name', 'John')->first();

return $user->email;
```

Se você quiser recuperar uma única linha de uma tabela de banco de dados, mas lançar uma `Illuminate\Database\RecordNotFoundException` caso nenhuma linha correspondente seja encontrada, você pode usar o método `firstOrFail`. Se a `RecordNotFoundException` não for capturada, uma resposta HTTP 404 é automaticamente enviada de volta ao cliente:

```php
$user = DB::table('users')->where('name', 'John')->firstOrFail();
```

Se você não precisa de uma linha inteira, pode extrair um único valor de um registro usando o método `value`. Este método retornará o valor da coluna diretamente:

```php
$email = DB::table('users')->where('name', 'John')->value('email');
```

Para recuperar uma única linha pelo valor de sua coluna `id`, use o método `find`:

```php
$user = DB::table('users')->find(3);
```

<a id="retrieving-a-list-of-column-values"></a>
#### Recuperando uma Lista de Valores de Coluna

Se você quiser recuperar uma instância de `Illuminate\Support\Collection` contendo os valores de uma única coluna, pode usar o método `pluck`. Neste exemplo, recuperaremos uma collection de títulos de usuários:

```php
use Illuminate\Support\Facades\DB;

$titles = DB::table('users')->pluck('title');

foreach ($titles as $title) {
    echo $title;
}
```

Você pode especificar a coluna que a collection resultante deve usar como suas chaves fornecendo um segundo argumento ao método `pluck`:

```php
$titles = DB::table('users')->pluck('title', 'name');

foreach ($titles as $name => $title) {
    echo $title;
}
```

<a id="chunking-results"></a>
### Dividindo Resultados em Blocos (Chunking)

Se você precisa trabalhar com milhares de registros de banco de dados, considere usar o método `chunk` fornecido pela facade `DB`. Este método recupera um pequeno bloco de resultados por vez e alimenta cada bloco em uma closure para processamento. Por exemplo, vamos recuperar a tabela `users` inteira em blocos de 100 registros por vez:

```php
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

DB::table('users')->orderBy('id')->chunk(100, function (Collection $users) {
    foreach ($users as $user) {
        // ...
    }
});
```

Você pode impedir que mais blocos sejam processados retornando `false` da closure:

```php
DB::table('users')->orderBy('id')->chunk(100, function (Collection $users) {
    // Process the records...

    return false;
});
```

Se você está atualizando registros de banco de dados enquanto divide os resultados em blocos, seus resultados de bloco podem mudar de maneiras inesperadas. Se você planeja atualizar os registros recuperados durante o chunking, é sempre melhor usar o método `chunkById`. Este método paginará automaticamente os resultados com base na chave primária do registro:

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

Como os métodos `chunkById` e `lazyById` adicionam suas próprias condições "where" à consulta sendo executada, você normalmente deve [agrupar logicamente](#logical-grouping) suas próprias condições dentro de uma closure:

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

> **Warning:**
> Ao atualizar ou excluir registros dentro do callback do bloco, quaisquer alterações na chave primária ou em chaves estrangeiras podem afetar a consulta de bloco. Isso poderia potencialmente resultar em registros não sendo incluídos nos resultados divididos em blocos.

<a id="streaming-results-lazily"></a>
### Transmitindo Resultados de Forma Preguiçosa (Lazy)

O método `lazy` funciona de forma semelhante ao [método chunk](#chunking-results) no sentido de que executa a consulta em blocos. No entanto, em vez de passar cada bloco para um callback, o método `lazy()` retorna uma [LazyCollection](/pt-br/collections/#lazy-collections), que permite que você interaja com os resultados como um único fluxo:

```php
use Illuminate\Support\Facades\DB;

DB::table('users')->orderBy('id')->lazy()->each(function (object $user) {
    // ...
});
```

Mais uma vez, se você planeja atualizar os registros recuperados enquanto itera sobre eles, é melhor usar os métodos `lazyById` ou `lazyByIdDesc`. Esses métodos paginarão automaticamente os resultados com base na chave primária do registro:

```php
DB::table('users')->where('active', false)
    ->lazyById()->each(function (object $user) {
        DB::table('users')
            ->where('id', $user->id)
            ->update(['active' => true]);
    });
```

> **Warning:**
> Ao atualizar ou excluir registros enquanto itera sobre eles, quaisquer alterações na chave primária ou em chaves estrangeiras podem afetar a consulta de bloco. Isso poderia potencialmente resultar em registros não sendo incluídos nos resultados.

<a id="aggregates"></a>
### Agregações

O construtor de consultas também fornece uma variedade de métodos para recuperar valores agregados como `count`, `max`, `min`, `avg` e `sum`. Você pode chamar qualquer um desses métodos após construir sua consulta:

```php
use Illuminate\Support\Facades\DB;

$users = DB::table('users')->count();

$price = DB::table('orders')->max('price');
```

É claro que você pode combinar esses métodos com outras cláusulas para ajustar como seu valor agregado é calculado:

```php
$price = DB::table('orders')
    ->where('finalized', 1)
    ->avg('price');
```

<a id="determining-if-records-exist"></a>
#### Determinando se Registros Existem

Em vez de usar o método `count` para determinar se existem registros que correspondem às restrições de sua consulta, você pode usar os métodos `exists` e `doesntExist`:

```php
if (DB::table('orders')->where('finalized', 1)->exists()) {
    // ...
}

if (DB::table('orders')->where('finalized', 1)->doesntExist()) {
    // ...
}
```

<a id="select-statements"></a>
## Instruções Select

<a id="specifying-a-select-clause"></a>
#### Especificando uma Cláusula Select

Nem sempre você vai querer selecionar todas as colunas de uma tabela de banco de dados. Usando o método `select`, você pode especificar uma cláusula "select" personalizada para a consulta:

```php
use Illuminate\Support\Facades\DB;

$users = DB::table('users')
    ->select('name', 'email as user_email')
    ->get();
```

O método `distinct` permite que você force a consulta a retornar resultados distintos:

```php
$users = DB::table('users')->distinct()->get();
```

Se você já possui uma instância do construtor de consultas e deseja adicionar uma coluna à sua cláusula select existente, você pode usar o método `addSelect`:

```php
$query = DB::table('users')->select('name');

$users = $query->addSelect('age')->get();
```

<a id="raw-expressions"></a>
## Expressões Brutas (Raw)

Às vezes, você pode precisar inserir uma string arbitrária em uma consulta. Para criar uma expressão de string bruta, você pode usar o método `raw` fornecido pela facade `DB`:

```php
$users = DB::table('users')
    ->select(DB::raw('count(*) as user_count, status'))
    ->where('status', '<>', 1)
    ->groupBy('status')
    ->get();
```

> **Warning:**
> Instruções brutas serão injetadas na consulta como strings, então você deve ser extremamente cuidadoso para evitar a criação de vulnerabilidades de injeção de SQL.

<a id="raw-methods"></a>
### Métodos Raw

Em vez de usar o método `DB::raw`, você também pode usar os seguintes métodos para inserir uma expressão bruta em várias partes da sua consulta. **Lembre-se, o Laravel não pode garantir que qualquer consulta que use expressões brutas esteja protegida contra vulnerabilidades de injeção de SQL.**

<a id="selectraw"></a>
#### `selectRaw`

O método `selectRaw` pode ser usado no lugar de `addSelect(DB::raw(/* ... */))`. Este método aceita um array opcional de vinculações como seu segundo argumento:

```php
$orders = DB::table('orders')
    ->selectRaw('price * ? as price_with_tax', [1.0825])
    ->get();
```

<a id="whereraw-orwhereraw"></a>
#### `whereRaw / orWhereRaw`

Os métodos `whereRaw` e `orWhereRaw` podem ser usados para injetar uma cláusula "where" bruta em sua consulta. Esses métodos aceitam um array opcional de vinculações como seu segundo argumento:

```php
$orders = DB::table('orders')
    ->whereRaw('price > IF(state = "TX", ?, 100)', [200])
    ->get();
```

<a id="havingraw-orhavingraw"></a>
#### `havingRaw / orHavingRaw`

Os métodos `havingRaw` e `orHavingRaw` podem ser usados para fornecer uma string bruta como o valor da cláusula "having". Esses métodos aceitam um array opcional de vinculações como seu segundo argumento:

```php
$orders = DB::table('orders')
    ->select('department', DB::raw('SUM(price) as total_sales'))
    ->groupBy('department')
    ->havingRaw('SUM(price) > ?', [2500])
    ->get();
```

<a id="orderbyraw"></a>
#### `orderByRaw`

O método `orderByRaw` pode ser usado para fornecer uma string bruta como o valor da cláusula "order by":

```php
$orders = DB::table('orders')
    ->orderByRaw('updated_at - created_at DESC')
    ->get();
```

<a id="groupbyraw"></a>
#### `groupByRaw`

O método `groupByRaw` pode ser usado para fornecer uma string bruta como o valor da cláusula `group by`:

```php
$orders = DB::table('orders')
    ->select('city', 'state')
    ->groupByRaw('city, state')
    ->get();
```

<a id="joins"></a>
## Joins

<a id="inner-join-clause"></a>
#### Cláusula Inner Join

O construtor de consultas também pode ser usado para adicionar cláusulas join às suas consultas. Para executar um "inner join" básico, você pode usar o método `join` em uma instância do construtor de consultas. O primeiro argumento passado ao método `join` é o nome da tabela com a qual você precisa fazer o join, enquanto os argumentos restantes especificam as restrições de coluna para o join. Você pode até fazer join de várias tabelas em uma única consulta:

```php
use Illuminate\Support\Facades\DB;

$users = DB::table('users')
    ->join('contacts', 'users.id', '=', 'contacts.user_id')
    ->join('orders', 'users.id', '=', 'orders.user_id')
    ->select('users.*', 'contacts.phone', 'orders.price')
    ->get();
```

<a id="left-join-right-join-clause"></a>
#### Cláusula Left Join / Right Join

Se você quiser executar um "left join" ou "right join" em vez de um "inner join", use os métodos `leftJoin` ou `rightJoin`. Esses métodos têm a mesma assinatura que o método `join`:

```php
$users = DB::table('users')
    ->leftJoin('posts', 'users.id', '=', 'posts.user_id')
    ->get();

$users = DB::table('users')
    ->rightJoin('posts', 'users.id', '=', 'posts.user_id')
    ->get();
```

<a id="cross-join-clause"></a>
#### Cláusula Cross Join

Você pode usar o método `crossJoin` para executar um "cross join". Cross joins geram um produto cartesiano entre a primeira tabela e a tabela do join:

```php
$sizes = DB::table('sizes')
    ->crossJoin('colors')
    ->get();
```

<a id="advanced-join-clauses"></a>
#### Cláusulas Join Avançadas

Você também pode especificar cláusulas join mais avançadas. Para começar, passe uma closure como segundo argumento para o método `join`. A closure receberá uma instância de `Illuminate\Database\Query\JoinClause` que permite que você especifique restrições na cláusula "join":

```php
DB::table('users')
    ->join('contacts', function (JoinClause $join) {
        $join->on('users.id', '=', 'contacts.user_id')->orOn(/* ... */);
    })
    ->get();
```

Se você quiser usar uma cláusula "where" em seus joins, pode usar os métodos `where` e `orWhere` fornecidos pela instância `JoinClause`. Em vez de comparar duas colunas, esses métodos compararão a coluna com um valor:

```php
DB::table('users')
    ->join('contacts', function (JoinClause $join) {
        $join->on('users.id', '=', 'contacts.user_id')
            ->where('contacts.user_id', '>', 5);
    })
    ->get();
```

<a id="subquery-joins"></a>
#### Joins com Subconsultas

Você pode usar os métodos `joinSub`, `leftJoinSub` e `rightJoinSub` para fazer o join de uma consulta a uma subconsulta. Cada um desses métodos recebe três argumentos: a subconsulta, seu alias de tabela e uma closure que define as colunas relacionadas. Neste exemplo, recuperaremos uma collection de usuários onde cada registro de usuário também contém o timestamp `created_at` da postagem de blog publicada mais recentemente pelo usuário:

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
#### Lateral Joins

> **Warning:**
> Lateral joins atualmente são suportados pelo PostgreSQL, MySQL >= 8.0.14 e SQL Server.

Você pode usar os métodos `joinLateral` e `leftJoinLateral` para executar um "lateral join" com uma subconsulta. Cada um desses métodos recebe dois argumentos: a subconsulta e seu alias de tabela. A(s) condição(ões) de join deve(m) ser especificada(s) dentro da cláusula `where` da subconsulta fornecida. Lateral joins são avaliados para cada linha e podem referenciar colunas fora da subconsulta.

Neste exemplo, recuperaremos uma collection de usuários, bem como as três postagens de blog mais recentes do usuário. Cada usuário pode produzir até três linhas no conjunto de resultados: uma para cada uma de suas postagens de blog mais recentes. A condição de join é especificada com uma cláusula `whereColumn` dentro da subconsulta, referenciando a linha do usuário atual:

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
## Unions

O construtor de consultas também fornece um método conveniente para fazer "union" de duas ou mais consultas. Por exemplo, você pode criar uma consulta inicial e usar o método `union` para uni-la com mais consultas:

```php
use Illuminate\Support\Facades\DB;

$usersWithoutFirstName = DB::table('users')
    ->whereNull('first_name');

$users = DB::table('users')
    ->whereNull('last_name')
    ->union($usersWithoutFirstName)
    ->get();
```

Além do método `union`, o construtor de consultas fornece um método `unionAll`. Consultas combinadas usando o método `unionAll` não terão seus resultados duplicados removidos. O método `unionAll` tem a mesma assinatura de método que o método `union`.

<a id="basic-where-clauses"></a>
## Cláusulas Where Básicas

<a id="where-clauses"></a>
### Cláusulas Where

Você pode usar o método `where` do construtor de consultas para adicionar cláusulas "where" à consulta. A chamada mais básica ao método `where` requer três argumentos. O primeiro argumento é o nome da coluna. O segundo argumento é um operador, que pode ser qualquer um dos operadores suportados pelo banco de dados. O terceiro argumento é o valor a ser comparado com o valor da coluna.

Por exemplo, a consulta a seguir recupera usuários onde o valor da coluna `votes` é igual a `100` e o valor da coluna `age` é maior que `35`:

```php
$users = DB::table('users')
    ->where('votes', '=', 100)
    ->where('age', '>', 35)
    ->get();
```

Por conveniência, se você quer verificar que uma coluna é `=` a um valor fornecido, você pode passar o valor como o segundo argumento ao método `where`. O Laravel assumirá que você gostaria de usar o operador `=`:

```php
$users = DB::table('users')->where('votes', 100)->get();
```

Você também pode fornecer um array associativo ao método `where` para consultar rapidamente várias colunas:

```php
$users = DB::table('users')->where([
    'first_name' => 'Jane',
    'last_name' => 'Doe',
])->get();
```

Como mencionado anteriormente, você pode usar qualquer operador suportado pelo seu sistema de banco de dados:

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

Você também pode passar um array de condições à função `where`. Cada elemento do array deve ser um array contendo os três argumentos normalmente passados ao método `where`:

```php
$users = DB::table('users')->where([
    ['status', '=', '1'],
    ['subscribed', '<>', '1'],
])->get();
```

> **Warning:**
> O PDO não suporta a vinculação de nomes de colunas. Portanto, você nunca deve permitir que a entrada do usuário determine os nomes das colunas referenciadas por suas consultas, incluindo as colunas de "order by".

> **Warning:**
> O MySQL e o MariaDB fazem typecast automático de strings para inteiros em comparações entre strings e números. Nesse processo, strings não numéricas são convertidas para `0`, o que pode levar a resultados inesperados. Por exemplo, se sua tabela tem uma coluna `secret` com um valor de `aaa` e você executa `User::where('secret', 0)`, essa linha será retornada. Para evitar isso, garanta que todos os valores sejam convertidos (typecast) para seus tipos apropriados antes de usá-los em consultas.

<a id="or-where-clauses"></a>
### Cláusulas Or Where

Ao encadear chamadas ao método `where` do construtor de consultas, as cláusulas "where" serão unidas usando o operador `and`. No entanto, você pode usar o método `orWhere` para unir uma cláusula à consulta usando o operador `or`. O método `orWhere` aceita os mesmos argumentos que o método `where`:

```php
$users = DB::table('users')
    ->where('votes', '>', 100)
    ->orWhere('name', 'John')
    ->get();
```

Se você precisa agrupar uma condição "or" entre parênteses, pode passar uma closure como primeiro argumento ao método `orWhere`:

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

O exemplo acima produzirá o seguinte SQL:

```sql
select * from users where votes > 100 or (name = 'Abigail' and votes > 50)
```

> **Warning:**
> Você deve sempre agrupar chamadas a `orWhere` para evitar comportamento inesperado quando escopos globais (global scopes) são aplicados.

<a id="where-not-clauses"></a>
### Cláusulas Where Not

Os métodos `whereNot` e `orWhereNot` podem ser usados para negar um grupo específico de restrições de consulta. Por exemplo, a consulta a seguir exclui produtos que estão em liquidação ou que têm um preço menor que dez:

```php
$products = DB::table('products')
    ->whereNot(function (Builder $query) {
        $query->where('clearance', true)
            ->orWhere('price', '<', 10);
        })
    ->get();
```

<a id="where-any-all-none-clauses"></a>
### Cláusulas Where Any / All / None

Às vezes, você pode precisar aplicar as mesmas restrições de consulta a várias colunas. Por exemplo, você pode querer recuperar todos os registros onde qualquer uma das colunas em uma lista fornecida seja `LIKE` a um valor fornecido. Você pode fazer isso usando o método `whereAny`:

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

A consulta acima resultará no seguinte SQL:

```sql
SELECT *
FROM users
WHERE active = true AND (
    name LIKE 'Example%' OR
    email LIKE 'Example%' OR
    phone LIKE 'Example%'
)
```

De forma semelhante, o método `whereAll` pode ser usado para recuperar registros onde todas as colunas fornecidas correspondem a uma restrição fornecida:

```php
$posts = DB::table('posts')
    ->where('published', true)
    ->whereAll([
        'title',
        'content',
    ], 'like', '%Laravel%')
    ->get();
```

A consulta acima resultará no seguinte SQL:

```sql
SELECT *
FROM posts
WHERE published = true AND (
    title LIKE '%Laravel%' AND
    content LIKE '%Laravel%'
)
```

O método `whereNone` pode ser usado para recuperar registros onde nenhuma das colunas fornecidas corresponde a uma restrição fornecida:

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

A consulta acima resultará no seguinte SQL:

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
### Cláusulas Where para JSON

O Laravel também suporta a consulta de tipos de coluna JSON em bancos de dados que fornecem suporte para tipos de coluna JSON. Atualmente, isso inclui MariaDB 10.3+, MySQL 8.0+, PostgreSQL 12.0+, SQL Server 2017+ e SQLite 3.39.0+. Para consultar uma coluna JSON, use o operador `->`:

```php
$users = DB::table('users')
    ->where('preferences->dining->meal', 'salad')
    ->get();

$users = DB::table('users')
    ->whereIn('preferences->dining->meal', ['pasta', 'salad', 'sandwiches'])
    ->get();
```

Você pode usar os métodos `whereJsonContains` e `whereJsonDoesntContain` para consultar arrays JSON:

```php
$users = DB::table('users')
    ->whereJsonContains('options->languages', 'en')
    ->get();

$users = DB::table('users')
    ->whereJsonDoesntContain('options->languages', 'en')
    ->get();
```

Se sua aplicação usa os bancos de dados MariaDB, MySQL ou PostgreSQL, você pode passar um array de valores aos métodos `whereJsonContains` e `whereJsonDoesntContain`:

```php
$users = DB::table('users')
    ->whereJsonContains('options->languages', ['en', 'de'])
    ->get();

$users = DB::table('users')
    ->whereJsonDoesntContain('options->languages', ['en', 'de'])
    ->get();
```

Além disso, você pode usar os métodos `whereJsonContainsKey` ou `whereJsonDoesntContainKey` para recuperar os resultados que incluem ou não incluem uma chave JSON:

```php
$users = DB::table('users')
    ->whereJsonContainsKey('preferences->dietary_requirements')
    ->get();

$users = DB::table('users')
    ->whereJsonDoesntContainKey('preferences->dietary_requirements')
    ->get();
```

Por fim, você pode usar o método `whereJsonLength` para consultar arrays JSON pelo seu comprimento:

```php
$users = DB::table('users')
    ->whereJsonLength('options->languages', 0)
    ->get();

$users = DB::table('users')
    ->whereJsonLength('options->languages', '>', 1)
    ->get();
```

<a id="additional-where-clauses"></a>
### Cláusulas Where Adicionais

**whereLike / orWhereLike / whereNotLike / orWhereNotLike**

O método `whereLike` permite que você adicione cláusulas "LIKE" à sua consulta para correspondência de padrões. Esses métodos fornecem uma maneira agnóstica de banco de dados de realizar consultas de correspondência de strings, com a capacidade de alternar a sensibilidade a maiúsculas e minúsculas. Por padrão, a correspondência de strings não diferencia maiúsculas de minúsculas:

```php
$users = DB::table('users')
    ->whereLike('name', '%John%')
    ->get();
```

Você pode ativar uma busca que diferencia maiúsculas de minúsculas por meio do argumento `caseSensitive`:

```php
$users = DB::table('users')
    ->whereLike('name', '%John%', caseSensitive: true)
    ->get();
```

O método `orWhereLike` permite que você adicione uma cláusula "or" com uma condição LIKE:

```php
$users = DB::table('users')
    ->where('votes', '>', 100)
    ->orWhereLike('name', '%John%')
    ->get();
```

O método `whereNotLike` permite que você adicione cláusulas "NOT LIKE" à sua consulta:

```php
$users = DB::table('users')
    ->whereNotLike('name', '%John%')
    ->get();
```

De forma semelhante, você pode usar `orWhereNotLike` para adicionar uma cláusula "or" com uma condição NOT LIKE:

```php
$users = DB::table('users')
    ->where('votes', '>', 100)
    ->orWhereNotLike('name', '%John%')
    ->get();
```

> **Warning:**
> A opção de busca com diferenciação de maiúsculas e minúsculas do `whereLike` atualmente não é suportada no SQL Server.

**whereIn / whereNotIn / orWhereIn / orWhereNotIn**

O método `whereIn` verifica que o valor de uma coluna fornecida está contido no array fornecido:

```php
$users = DB::table('users')
    ->whereIn('id', [1, 2, 3])
    ->get();
```

O método `whereNotIn` verifica que o valor da coluna fornecida não está contido no array fornecido:

```php
$users = DB::table('users')
    ->whereNotIn('id', [1, 2, 3])
    ->get();
```

Você também pode fornecer um objeto de consulta como o segundo argumento do método `whereIn`:

```php
$activeUsers = DB::table('users')->select('id')->where('is_active', 1);

$comments = DB::table('comments')
    ->whereIn('user_id', $activeUsers)
    ->get();
```

O exemplo acima produzirá o seguinte SQL:

```sql
select * from comments where user_id in (
    select id
    from users
    where is_active = 1
)
```

> **Warning:**
> Se você está adicionando um array grande de vinculações de inteiros à sua consulta, os métodos `whereIntegerInRaw` ou `whereIntegerNotInRaw` podem ser usados para reduzir muito o uso de memória.

**whereBetween / orWhereBetween**

O método `whereBetween` verifica que o valor de uma coluna está entre dois valores:

```php
$users = DB::table('users')
    ->whereBetween('votes', [1, 100])
    ->get();
```

**whereNotBetween / orWhereNotBetween**

O método `whereNotBetween` verifica que o valor de uma coluna está fora de dois valores:

```php
$users = DB::table('users')
    ->whereNotBetween('votes', [1, 100])
    ->get();
```

**whereBetweenColumns / whereNotBetweenColumns / orWhereBetweenColumns / orWhereNotBetweenColumns**

O método `whereBetweenColumns` verifica que o valor de uma coluna está entre os dois valores de duas colunas na mesma linha da tabela:

```php
$patients = DB::table('patients')
    ->whereBetweenColumns('weight', ['minimum_allowed_weight', 'maximum_allowed_weight'])
    ->get();
```

O método `whereNotBetweenColumns` verifica que o valor de uma coluna está fora dos dois valores de duas colunas na mesma linha da tabela:

```php
$patients = DB::table('patients')
    ->whereNotBetweenColumns('weight', ['minimum_allowed_weight', 'maximum_allowed_weight'])
    ->get();
```

**whereValueBetween / whereValueNotBetween / orWhereValueBetween / orWhereValueNotBetween**

O método `whereValueBetween` verifica que um valor fornecido está entre os valores de duas colunas do mesmo tipo na mesma linha da tabela:

```php
$products = DB::table('products')
    ->whereValueBetween(100, ['min_price', 'max_price'])
    ->get();
```

O método `whereValueNotBetween` verifica que um valor está fora dos valores de duas colunas na mesma linha da tabela:

```php
$products = DB::table('products')
    ->whereValueNotBetween(100, ['min_price', 'max_price'])
    ->get();
```

**whereNull / whereNotNull / orWhereNull / orWhereNotNull**

O método `whereNull` verifica que o valor da coluna fornecida é `NULL`:

```php
$users = DB::table('users')
    ->whereNull('updated_at')
    ->get();
```

O método `whereNotNull` verifica que o valor da coluna não é `NULL`:

```php
$users = DB::table('users')
    ->whereNotNull('updated_at')
    ->get();
```

**whereNullSafeEquals / orWhereNullSafeEquals**

Os métodos `whereNullSafeEquals` e `orWhereNullSafeEquals` podem ser usados para comparar o valor de uma coluna com um valor fornecido tratando dois valores `NULL` como iguais:

```php
$lastLoginIp = $request->input('last_login_ip');

$users = DB::table('users')
    ->whereNullSafeEquals('last_login_ip', $lastLoginIp)
    ->get();
```

**whereDate / whereMonth / whereDay / whereYear / whereTime**

O método `whereDate` pode ser usado para comparar o valor de uma coluna com uma data:

```php
$users = DB::table('users')
    ->whereDate('created_at', '2016-12-31')
    ->get();
```

O método `whereMonth` pode ser usado para comparar o valor de uma coluna com um mês específico:

```php
$users = DB::table('users')
    ->whereMonth('created_at', '12')
    ->get();
```

O método `whereDay` pode ser usado para comparar o valor de uma coluna com um dia específico do mês:

```php
$users = DB::table('users')
    ->whereDay('created_at', '31')
    ->get();
```

O método `whereYear` pode ser usado para comparar o valor de uma coluna com um ano específico:

```php
$users = DB::table('users')
    ->whereYear('created_at', '2016')
    ->get();
```

O método `whereTime` pode ser usado para comparar o valor de uma coluna com um horário específico:

```php
$users = DB::table('users')
    ->whereTime('created_at', '=', '11:20:45')
    ->get();
```

**wherePast / whereFuture / whereToday / whereBeforeToday / whereAfterToday**

Os métodos `wherePast` e `whereFuture` podem ser usados para determinar se o valor de uma coluna está no passado ou no futuro:

```php
$invoices = DB::table('invoices')
    ->wherePast('due_at')
    ->get();

$invoices = DB::table('invoices')
    ->whereFuture('due_at')
    ->get();
```

Os métodos `whereNowOrPast` e `whereNowOrFuture` podem ser usados para determinar se o valor de uma coluna está no passado ou no futuro, incluindo a data e o horário atuais:

```php
$invoices = DB::table('invoices')
    ->whereNowOrPast('due_at')
    ->get();

$invoices = DB::table('invoices')
    ->whereNowOrFuture('due_at')
    ->get();
```

Os métodos `whereToday`, `whereBeforeToday` e `whereAfterToday` podem ser usados para determinar se o valor de uma coluna é hoje, antes de hoje ou depois de hoje, respectivamente:

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

De forma semelhante, os métodos `whereTodayOrBefore` e `whereTodayOrAfter` podem ser usados para determinar se o valor de uma coluna é antes de hoje ou depois de hoje, incluindo a data de hoje:

```php
$invoices = DB::table('invoices')
    ->whereTodayOrBefore('due_at')
    ->get();

$invoices = DB::table('invoices')
    ->whereTodayOrAfter('due_at')
    ->get();
```

**whereColumn / orWhereColumn**

O método `whereColumn` pode ser usado para verificar que duas colunas são iguais:

```php
$users = DB::table('users')
    ->whereColumn('first_name', 'last_name')
    ->get();
```

Você também pode passar um operador de comparação ao método `whereColumn`:

```php
$users = DB::table('users')
    ->whereColumn('updated_at', '>', 'created_at')
    ->get();
```

Você também pode passar um array de comparações de colunas ao método `whereColumn`. Essas condições serão unidas usando o operador `and`:

```php
$users = DB::table('users')
    ->whereColumn([
        ['first_name', '=', 'last_name'],
        ['updated_at', '>', 'created_at'],
    ])->get();
```

<a id="logical-grouping"></a>
### Agrupamento Lógico

Às vezes, você pode precisar agrupar várias cláusulas "where" entre parênteses para alcançar o agrupamento lógico desejado de sua consulta. Na verdade, você geralmente deve sempre agrupar chamadas ao método `orWhere` entre parênteses para evitar comportamento de consulta inesperado. Para fazer isso, você pode passar uma closure ao método `where`:

```php
$users = DB::table('users')
    ->where('name', '=', 'John')
    ->where(function (Builder $query) {
        $query->where('votes', '>', 100)
            ->orWhere('title', '=', 'Admin');
    })
    ->get();
```

Como você pode ver, passar uma closure ao método `where` instrui o construtor de consultas a iniciar um grupo de restrições. A closure receberá uma instância do construtor de consultas que você pode usar para definir as restrições que devem ser contidas dentro do grupo de parênteses. O exemplo acima produzirá o seguinte SQL:

```sql
select * from users where name = 'John' and (votes > 100 or title = 'Admin')
```

> **Warning:**
> Você deve sempre agrupar chamadas a `orWhere` para evitar comportamento inesperado quando escopos globais (global scopes) são aplicados.

<a id="advanced-where-clauses"></a>
## Cláusulas Where Avançadas

<a id="where-exists-clauses"></a>
### Cláusulas Where Exists

O método `whereExists` permite que você escreva cláusulas SQL "where exists". O método `whereExists` aceita uma closure que receberá uma instância do construtor de consultas, permitindo que você defina a consulta que deve ser colocada dentro da cláusula "exists":

```php
$users = DB::table('users')
    ->whereExists(function (Builder $query) {
        $query->select(DB::raw(1))
            ->from('orders')
            ->whereColumn('orders.user_id', 'users.id');
    })
    ->get();
```

Como alternativa, você pode fornecer um objeto de consulta ao método `whereExists` em vez de uma closure:

```php
$orders = DB::table('orders')
    ->select(DB::raw(1))
    ->whereColumn('orders.user_id', 'users.id');

$users = DB::table('users')
    ->whereExists($orders)
    ->get();
```

Ambos os exemplos acima produzirão o seguinte SQL:

```sql
select * from users
where exists (
    select 1
    from orders
    where orders.user_id = users.id
)
```

<a id="subquery-where-clauses"></a>
### Cláusulas Where com Subconsulta

Às vezes, você pode precisar construir uma cláusula "where" que compara os resultados de uma subconsulta com um valor fornecido. Você pode fazer isso passando uma closure e um valor ao método `where`. Por exemplo, a consulta a seguir recuperará todos os usuários que têm uma "membership" recente de um tipo fornecido;

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

Ou, você pode precisar construir uma cláusula "where" que compara uma coluna com os resultados de uma subconsulta. Você pode fazer isso passando uma coluna, um operador e uma closure ao método `where`. Por exemplo, a consulta a seguir recuperará todos os registros de rendimento em que o valor é menor que a média;

```php
use App\Models\Income;
use Illuminate\Database\Query\Builder;

$incomes = Income::where('amount', '<', function (Builder $query) {
    $query->selectRaw('avg(i.amount)')->from('incomes as i');
})->get();
```

<a id="full-text-where-clauses"></a>
### Cláusulas Where de Texto Completo (Full Text)

> **Warning:**
> Cláusulas where de texto completo atualmente são suportadas pelo MariaDB, MySQL e PostgreSQL.

Os métodos `whereFullText` e `orWhereFullText` podem ser usados para adicionar cláusulas "where" de texto completo a uma consulta para colunas que têm [índices de texto completo](/pt-br/migrations/#available-index-types). Esses métodos serão transformados no SQL apropriado para o sistema de banco de dados subjacente pelo Laravel. Por exemplo, uma cláusula `MATCH AGAINST` será gerada para aplicações que utilizam MariaDB ou MySQL:

```php
$users = DB::table('users')
    ->whereFullText('bio', 'web developer')
    ->get();
```

<a id="vector-similarity-clauses"></a>
### Cláusulas de Similaridade de Vetores

> **Note:**
> Cláusulas de similaridade de vetores atualmente são suportadas em conexões PostgreSQL usando a extensão `pgvector` e no MariaDB 11.7 ou posterior. Para informações sobre definição de colunas e índices de vetores, consulte a [documentação de migrations](/pt-br/migrations/#available-column-types).

O método `whereVectorSimilarTo` filtra resultados por similaridade de cosseno em relação a um vetor fornecido e ordena os resultados por relevância. O limite `minSimilarity` deve ser um valor entre `0.0` e `1.0`, onde `1.0` é idêntico:

```php
$documents = DB::table('documents')
    ->whereVectorSimilarTo('embedding', $queryEmbedding, minSimilarity: 0.4)
    ->limit(10)
    ->get();
```

Quando uma string simples é fornecida como argumento de vetor, o Laravel gerará automaticamente embeddings para ela usando o [Laravel AI SDK](/pt-br/ai-sdk/#embeddings):

```php
$documents = DB::table('documents')
    ->whereVectorSimilarTo('embedding', 'Best wineries in Napa Valley')
    ->limit(10)
    ->get();
```

Por padrão, o `whereVectorSimilarTo` também ordena os resultados por distância (mais similar primeiro). Você pode desativar essa ordenação passando `false` como argumento `order`:

```php
$documents = DB::table('documents')
    ->whereVectorSimilarTo('embedding', $queryEmbedding, minSimilarity: 0.4, order: false)
    ->orderBy('created_at', 'desc')
    ->limit(10)
    ->get();
```

Se você precisa de mais controle, pode usar os métodos `selectVectorDistance`, `whereVectorDistanceLessThan` e `orderByVectorDistance` de forma independente:

```php
$documents = DB::table('documents')
    ->select('*')
    ->selectVectorDistance('embedding', $queryEmbedding, as: 'distance')
    ->whereVectorDistanceLessThan('embedding', $queryEmbedding, maxDistance: 0.3)
    ->orderByVectorDistance('embedding', $queryEmbedding)
    ->limit(10)
    ->get();
```

Ao utilizar o PostgreSQL, a extensão `pgvector` deve ser carregada antes que colunas `vector` possam ser criadas:

```php
Schema::ensureVectorExtensionExists();
```

<a id="ordering-grouping-limit-and-offset"></a>
## Ordenação, Agrupamento, Limit e Offset

<a id="ordering"></a>
### Ordenação

<a id="orderby"></a>
#### O Método `orderBy`

O método `orderBy` permite que você ordene os resultados da consulta por uma coluna fornecida. O primeiro argumento aceito pelo método `orderBy` deve ser a coluna pela qual você deseja ordenar, enquanto o segundo argumento determina a direção da ordenação e pode ser `asc` ou `desc`:

```php
$users = DB::table('users')
    ->orderBy('name', 'desc')
    ->get();
```

Para ordenar por várias colunas, você pode simplesmente invocar `orderBy` quantas vezes forem necessárias:

```php
$users = DB::table('users')
    ->orderBy('name', 'desc')
    ->orderBy('email', 'asc')
    ->get();
```

A direção da ordenação é opcional e é ascendente por padrão. Se você quer ordenar em ordem descendente, pode especificar o segundo parâmetro do método `orderBy`, ou simplesmente usar `orderByDesc`:

```php
$users = DB::table('users')
    ->orderByDesc('verified_at')
    ->get();
```

Por fim, usando o operador `->`, os resultados podem ser ordenados por um valor dentro de uma coluna JSON:

```php
$corporations = DB::table('corporations')
    ->where('country', 'US')
    ->orderBy('location->state')
    ->get();
```

<a id="latest-oldest"></a>
#### Os Métodos `latest` e `oldest`

Os métodos `latest` e `oldest` permitem que você ordene facilmente os resultados por data. Por padrão, o resultado será ordenado pela coluna `created_at` da tabela. Ou, você pode passar o nome da coluna pela qual deseja ordenar:

```php
$user = DB::table('users')
    ->latest()
    ->first();
```

<a id="random-ordering"></a>
#### Ordenação Aleatória

O método `inRandomOrder` pode ser usado para ordenar os resultados da consulta aleatoriamente. Por exemplo, você pode usar este método para buscar um usuário aleatório:

```php
$randomUser = DB::table('users')
    ->inRandomOrder()
    ->first();
```

<a id="removing-existing-orderings"></a>
#### Removendo Ordenações Existentes

O método `reorder` remove todas as cláusulas "order by" que foram aplicadas anteriormente à consulta:

```php
$query = DB::table('users')->orderBy('name');

$unorderedUsers = $query->reorder()->get();
```

Você pode passar uma coluna e uma direção ao chamar o método `reorder` para remover todas as cláusulas "order by" existentes e aplicar uma ordenação totalmente nova à consulta:

```php
$query = DB::table('users')->orderBy('name');

$usersOrderedByEmail = $query->reorder('email', 'desc')->get();
```

Por conveniência, você pode usar o método `reorderDesc` para reordenar os resultados da consulta em ordem descendente:

```php
$query = DB::table('users')->orderBy('name');

$usersOrderedByEmail = $query->reorderDesc('email')->get();
```

<a id="grouping"></a>
### Agrupamento

<a id="groupby-having"></a>
#### Os Métodos `groupBy` e `having`

Como você pode esperar, os métodos `groupBy` e `having` podem ser usados para agrupar os resultados da consulta. A assinatura do método `having` é semelhante à do método `where`:

```php
$users = DB::table('users')
    ->groupBy('account_id')
    ->having('account_id', '>', 100)
    ->get();
```

Você pode usar o método `havingBetween` para filtrar os resultados dentro de um intervalo fornecido:

```php
$report = DB::table('orders')
    ->selectRaw('count(id) as number_of_orders, customer_id')
    ->groupBy('customer_id')
    ->havingBetween('number_of_orders', [5, 15])
    ->get();
```

Você pode passar vários argumentos ao método `groupBy` para agrupar por várias colunas:

```php
$users = DB::table('users')
    ->groupBy('first_name', 'status')
    ->having('account_id', '>', 100)
    ->get();
```

Para construir instruções `having` mais avançadas, consulte o método [havingRaw](#raw-methods).

<a id="limit-and-offset"></a>
### Limit e Offset

Você pode usar os métodos `limit` e `offset` para limitar o número de resultados retornados pela consulta ou para pular um número fornecido de resultados na consulta:

```php
$users = DB::table('users')
    ->offset(10)
    ->limit(5)
    ->get();
```

<a id="conditional-clauses"></a>
## Cláusulas Condicionais

Às vezes, você pode querer que certas cláusulas de consulta sejam aplicadas a uma consulta com base em outra condição. Por exemplo, você pode querer aplicar uma instrução `where` apenas se um valor de entrada fornecido estiver presente na requisição HTTP recebida. Você pode fazer isso usando o método `when`:

```php
$role = $request->input('role');

$users = DB::table('users')
    ->when($role, function (Builder $query, string $role) {
        $query->where('role_id', $role);
    })
    ->get();
```

O método `when` só executa a closure fornecida quando o primeiro argumento é `true`. Se o primeiro argumento for `false`, a closure não será executada. Então, no exemplo acima, a closure fornecida ao método `when` só será invocada se o campo `role` estiver presente na requisição recebida e for avaliado como `true`.

Você pode passar outra closure como terceiro argumento ao método `when`. Esta closure só será executada se o primeiro argumento for avaliado como `false`. Para ilustrar como esse recurso pode ser usado, vamos usá-lo para configurar a ordenação padrão de uma consulta:

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
## Instruções Insert

O construtor de consultas também fornece um método `insert` que pode ser usado para inserir registros na tabela de banco de dados. O método `insert` aceita um array de nomes de colunas e valores:

```php
DB::table('users')->insert([
    'email' => 'kayla@example.com',
    'votes' => 0
]);
```

Você pode inserir vários registros de uma vez passando um array de arrays. Cada array representa um registro que deve ser inserido na tabela:

```php
DB::table('users')->insert([
    ['email' => 'picard@example.com', 'votes' => 0],
    ['email' => 'janeway@example.com', 'votes' => 0],
]);
```

O método `insertOrIgnore` ignorará erros ao inserir registros no banco de dados. Ao usar este método, você deve estar ciente de que erros de registros duplicados serão ignorados e outros tipos de erros também podem ser ignorados dependendo do mecanismo de banco de dados. Por exemplo, `insertOrIgnore` irá [contornar o strict mode do MySQL](https://dev.mysql.com/doc/refman/en/sql-mode.html#ignore-effect-on-execution):

```php
DB::table('users')->insertOrIgnore([
    ['id' => 1, 'email' => 'sisko@example.com'],
    ['id' => 2, 'email' => 'archer@example.com'],
]);
```

O método `insertUsing` inserirá novos registros na tabela enquanto usa uma subconsulta para determinar os dados que devem ser inseridos:

```php
DB::table('pruned_users')->insertUsing([
    'id', 'name', 'email', 'email_verified_at'
], DB::table('users')->select(
    'id', 'name', 'email', 'email_verified_at'
)->where('updated_at', '<=', now()->minus(months: 1)));
```

<a id="auto-incrementing-ids"></a>
#### IDs Auto-Incrementais

Se a tabela tem um id auto-incremental, use o método `insertGetId` para inserir um registro e então recuperar o ID:

```php
$id = DB::table('users')->insertGetId(
    ['email' => 'john@example.com', 'votes' => 0]
);
```

> **Warning:**
> Ao usar o PostgreSQL, o método `insertGetId` espera que a coluna auto-incremental seja nomeada `id`. Se você quiser recuperar o ID de uma "sequence" diferente, pode passar o nome da coluna como segundo parâmetro ao método `insertGetId`.

<a id="upserts"></a>
### Upserts

O método `upsert` inserirá registros que não existem e atualizará os registros que já existem com novos valores que você pode especificar. O primeiro argumento do método consiste nos valores a inserir ou atualizar, enquanto o segundo argumento lista a(s) coluna(s) que identificam unicamente os registros dentro da tabela associada. O terceiro e último argumento do método é um array de colunas que devem ser atualizadas se um registro correspondente já existir no banco de dados:

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

No exemplo acima, o Laravel tentará inserir dois registros. Se um registro já existir com os mesmos valores das colunas `departure` e `destination`, o Laravel atualizará a coluna `price` desse registro.

> **Warning:**
> Todos os bancos de dados, exceto o SQL Server, exigem que as colunas no segundo argumento do método `upsert` tenham um índice "primary" ou "unique". Além disso, os drivers de banco de dados MariaDB e MySQL ignoram o segundo argumento do método `upsert` e sempre usam os índices "primary" e "unique" da tabela para detectar registros existentes.

<a id="update-statements"></a>
## Instruções Update

Além de inserir registros no banco de dados, o construtor de consultas também pode atualizar registros existentes usando o método `update`. O método `update`, assim como o método `insert`, aceita um array de pares de coluna e valor indicando as colunas a serem atualizadas. O método `update` retorna o número de linhas afetadas. Você pode restringir a consulta de `update` usando cláusulas `where`:

```php
$affected = DB::table('users')
    ->where('id', 1)
    ->update(['votes' => 1]);
```

<a id="update-or-insert"></a>
#### Update ou Insert

Às vezes, você pode querer atualizar um registro existente no banco de dados ou criá-lo se nenhum registro correspondente existir. Nesse cenário, o método `updateOrInsert` pode ser usado. O método `updateOrInsert` aceita dois argumentos: um array de condições pelas quais encontrar o registro e um array de pares de coluna e valor indicando as colunas a serem atualizadas.

O método `updateOrInsert` tentará localizar um registro de banco de dados correspondente usando os pares de coluna e valor do primeiro argumento. Se o registro existir, ele será atualizado com os valores do segundo argumento. Se o registro não puder ser encontrado, um novo registro será inserido com os atributos mesclados de ambos os argumentos:

```php
DB::table('users')
    ->updateOrInsert(
        ['email' => 'john@example.com', 'name' => 'John'],
        ['votes' => '2']
    );
```

Você pode fornecer uma closure ao método `updateOrInsert` para personalizar os atributos que são atualizados ou inseridos no banco de dados com base na existência de um registro correspondente:

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
### Atualizando Colunas JSON

Ao atualizar uma coluna JSON, você deve usar a sintaxe `->` para atualizar a chave apropriada no objeto JSON. Esta operação é suportada no MariaDB 10.3+, MySQL 5.7+ e PostgreSQL 9.5+:

```php
$affected = DB::table('users')
    ->where('id', 1)
    ->update(['options->enabled' => true]);
```

<a id="increment-and-decrement"></a>
### Incremento e Decremento

O construtor de consultas também fornece métodos convenientes para incrementar ou decrementar o valor de uma coluna fornecida. Ambos os métodos aceitam pelo menos um argumento: a coluna a modificar. Um segundo argumento pode ser fornecido para especificar a quantidade pela qual a coluna deve ser incrementada ou decrementada:

```php
DB::table('users')->increment('votes');

DB::table('users')->increment('votes', 5);

DB::table('users')->decrement('votes');

DB::table('users')->decrement('votes', 5);
```

Se necessário, você também pode especificar colunas adicionais para atualizar durante a operação de incremento ou decremento:

```php
DB::table('users')->increment('votes', 1, ['name' => 'John']);
```

Além disso, você pode incrementar ou decrementar várias colunas de uma vez usando os métodos `incrementEach` e `decrementEach`:

```php
DB::table('users')->incrementEach([
    'votes' => 5,
    'balance' => 100,
]);
```

<a id="delete-statements"></a>
## Instruções Delete

O método `delete` do construtor de consultas pode ser usado para excluir registros da tabela. O método `delete` retorna o número de linhas afetadas. Você pode restringir instruções `delete` adicionando cláusulas "where" antes de chamar o método `delete`:

```php
$deleted = DB::table('users')->delete();

$deleted = DB::table('users')->where('votes', '>', 100)->delete();
```

<a id="pessimistic-locking"></a>
## Bloqueio Pessimista

O construtor de consultas também inclui algumas funções para ajudá-lo a alcançar "bloqueio pessimista" ao executar suas instruções `select`. Para executar uma instrução com um "shared lock", você pode chamar o método `sharedLock`. Um shared lock impede que as linhas selecionadas sejam modificadas até que sua transação seja commitada:

```php
DB::table('users')
    ->where('votes', '>', 100)
    ->sharedLock()
    ->get();
```

Como alternativa, você pode usar o método `lockForUpdate`. Um lock "for update" impede que os registros selecionados sejam modificados ou selecionados com outro shared lock:

```php
DB::table('users')
    ->where('votes', '>', 100)
    ->lockForUpdate()
    ->get();
```

Embora não seja obrigatório, é recomendado envolver bloqueios pessimistas dentro de uma [transação](/pt-br/database/#database-transactions). Isso garante que os dados recuperados permaneçam inalterados no banco de dados até que toda a operação seja concluída. Em caso de falha, a transação reverterá quaisquer alterações e liberará os bloqueios automaticamente:

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
## Componentes de Consulta Reutilizáveis

Se você tem lógica de consulta repetida em toda a sua aplicação, pode extrair a lógica em objetos reutilizáveis usando os métodos `tap` e `pipe` do construtor de consultas. Imagine que você tenha estas duas consultas diferentes em sua aplicação:

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

Você pode querer extrair a filtragem de destino que é comum entre as consultas em um objeto reutilizável:

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

Então, você pode usar o método `tap` do construtor de consultas para aplicar a lógica do objeto à consulta:

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
#### Query Pipes

O método `tap` sempre retornará o construtor de consultas. Se você quiser extrair um objeto que executa a consulta e retorna outro valor, você pode usar o método `pipe`.

Considere o seguinte objeto de consulta que contém lógica de [paginação](/pt-br/pagination/) compartilhada usada em toda a aplicação. Diferentemente do `DestinationFilter`, que aplica condições de consulta à consulta, o objeto `Paginate` executa a consulta e retorna uma instância de paginator:

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

Usando o método `pipe` do construtor de consultas, podemos aproveitar este objeto para aplicar nossa lógica de paginação compartilhada:

```php
$flights = DB::table('flights')
    ->tap(new DestinationFilter($destination))
    ->pipe(new Paginate);
```

<a id="debugging"></a>
## Depuração

Você pode usar os métodos `dd` e `dump` enquanto constrói uma consulta para despejar (dump) as vinculações atuais da consulta e o SQL. O método `dd` exibirá as informações de depuração e então interromperá a execução da requisição. O método `dump` exibirá as informações de depuração, mas permitirá que a requisição continue executando:

```php
DB::table('users')->where('votes', '>', 100)->dd();

DB::table('users')->where('votes', '>', 100)->dump();
```

Os métodos `dumpRawSql` e `ddRawSql` podem ser invocados em uma consulta para despejar o SQL da consulta com todas as vinculações de parâmetros devidamente substituídas:

```php
DB::table('users')->where('votes', '>', 100)->dumpRawSql();

DB::table('users')->where('votes', '>', 100)->ddRawSql();
```
