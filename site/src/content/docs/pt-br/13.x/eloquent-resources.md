---
title: "Eloquent: API Resources"
---

- [Introdução](#introduction)
- [Gerando Resources](#generating-resources)
- [Visão Geral do Conceito](#concept-overview)
    - [Coleções de Resources](#resource-collections)
- [Escrevendo Resources](#writing-resources)
    - [Envelopamento de Dados](#data-wrapping)
    - [Paginação](#pagination)
    - [Atributos Condicionais](#conditional-attributes)
    - [Relacionamentos Condicionais](#conditional-relationships)
    - [Adicionando Metadados](#adding-meta-data)
- [Resources JSON:API](#jsonapi-resources)
    - [Gerando Resources JSON:API](#generating-jsonapi-resources)
    - [Definindo Atributos](#defining-jsonapi-attributes)
    - [Definindo Relacionamentos](#defining-jsonapi-relationships)
    - [Tipo e ID do Resource](#jsonapi-resource-type-and-id)
    - [Sparse Fieldsets e Includes](#jsonapi-sparse-fieldsets-and-includes)
    - [Links e Meta](#jsonapi-links-and-meta)
- [Respostas de Resources](#resource-responses)

<a id="introduction"></a>
## Introdução

Ao construir uma API, você pode precisar de uma camada de transformação que fique entre seus models Eloquent e as respostas JSON que são de fato retornadas aos usuários da sua aplicação. Por exemplo, você pode desejar exibir certos atributos para um subconjunto de usuários e não para outros, ou pode desejar sempre incluir certos relacionamentos na representação JSON dos seus models. As classes de resource do Eloquent permitem que você transforme seus models e coleções de models em JSON de forma expressiva e fácil.

É claro que você sempre pode converter models ou coleções do Eloquent em JSON usando seus métodos `toJson`; no entanto, os resources do Eloquent fornecem um controle mais granular e robusto sobre a serialização JSON dos seus models e seus relacionamentos.

<a id="generating-resources"></a>
## Gerando Resources

Para gerar uma classe de resource, você pode usar o comando Artisan `make:resource`. Por padrão, os resources serão colocados no diretório `app/Http/Resources` da sua aplicação. Resources estendem a classe `Illuminate\Http\Resources\Json\JsonResource`:

```shell
php artisan make:resource UserResource
```

<a id="generating-resource-collections"></a>
#### Coleções de Resources

Além de gerar resources que transformam models individuais, você pode gerar resources responsáveis por transformar coleções de models. Isso permite que suas respostas JSON incluam links e outras informações meta que sejam relevantes para uma coleção inteira de um determinado resource.

Para criar uma coleção de resources, você deve usar a flag `--collection` ao criar o resource. Ou, incluir a palavra `Collection` no nome do resource indicará ao Laravel que ele deve criar um resource de coleção. Resources de coleção estendem a classe `Illuminate\Http\Resources\Json\ResourceCollection`:

```shell
php artisan make:resource User --collection

php artisan make:resource UserCollection
```

<a id="concept-overview"></a>
## Visão Geral do Conceito

> **Note:**
> Esta é uma visão geral de alto nível sobre resources e coleções de resources. Você é fortemente encorajado a ler as outras seções desta documentação para obter um entendimento mais profundo da customização e do poder oferecidos a você pelos resources.

Antes de mergulhar em todas as opções disponíveis para você ao escrever resources, vamos primeiro dar uma olhada de alto nível em como os resources são usados dentro do Laravel. Uma classe de resource representa um único model que precisa ser transformado em uma estrutura JSON. Por exemplo, aqui está uma classe de resource `UserResource` simples:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
```

Toda classe de resource define um método `toArray` que retorna o array de atributos que deve ser convertido em JSON quando o resource é retornado como resposta de uma rota ou método de controller.

Observe que podemos acessar as propriedades do model diretamente a partir da variável `$this`. Isso ocorre porque uma classe de resource automaticamente faz o proxy do acesso a propriedades e métodos para o model subjacente, permitindo um acesso conveniente. Uma vez que o resource esteja definido, ele pode ser retornado de uma rota ou controller. O resource aceita a instância do model subjacente via seu construtor:

```php
use App\Http\Resources\UserResource;
use App\Models\User;

Route::get('/user/{id}', function (string $id) {
    return new UserResource(User::findOrFail($id));
});
```

Por conveniência, você pode usar o método `toResource` do model, que usará as convenções do framework para descobrir automaticamente o resource subjacente do model:

```php
return User::findOrFail($id)->toResource();
```

Ao invocar o método `toResource`, o Laravel tentará localizar um resource que corresponda ao nome do model e que seja opcionalmente sufixado com `Resource` dentro do namespace `Http\Resources` mais próximo do namespace do model.

Se a sua classe de resource não seguir essa convenção de nomenclatura ou estiver localizada em um namespace diferente, você pode especificar o resource padrão para o model usando o atributo `UseResource`:

```php
<?php

namespace App\Models;

use App\Http\Resources\CustomUserResource;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\UseResource;

#[UseResource(CustomUserResource::class)]
class User extends Model
{
    // ...
}
```

Alternativamente, você pode especificar a classe de resource passando-a para o método `toResource`:

```php
return User::findOrFail($id)->toResource(CustomUserResource::class);
```

<a id="resource-collections"></a>
### Coleções de Resources

Se você estiver retornando uma coleção de resources ou uma resposta paginada, você deve usar o método `collection` fornecido pela sua classe de resource ao criar a instância do resource na sua rota ou controller:

```php
use App\Http\Resources\UserResource;
use App\Models\User;

Route::get('/users', function () {
    return UserResource::collection(User::all());
});
```

Ou, por conveniência, você pode usar o método `toResourceCollection` da coleção Eloquent, que usará as convenções do framework para descobrir automaticamente a coleção de resources subjacente do model:

```php
return User::all()->toResourceCollection();
```

Ao invocar o método `toResourceCollection`, o Laravel tentará localizar uma coleção de resources que corresponda ao nome do model e que seja sufixada com `Collection` dentro do namespace `Http\Resources` mais próximo do namespace do model.

Se a sua classe de coleção de resources não seguir essa convenção de nomenclatura ou estiver localizada em um namespace diferente, você pode especificar a coleção de resources padrão para o model usando o atributo `UseResourceCollection`:

```php
<?php

namespace App\Models;

use App\Http\Resources\CustomUserCollection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\UseResourceCollection;

#[UseResourceCollection(CustomUserCollection::class)]
class User extends Model
{
    // ...
}
```

Alternativamente, você pode especificar a classe de coleção de resources passando-a para o método `toResourceCollection`:

```php
return User::all()->toResourceCollection(CustomUserCollection::class);
```

<a id="custom-resource-collections"></a>
#### Coleções de Resources Customizadas

Por padrão, as coleções de resources não permitem nenhuma adição de metadados customizados que possam precisar ser retornados com a sua coleção. Se você quiser customizar a resposta da coleção de resources, você pode criar um resource dedicado para representar a coleção:

```shell
php artisan make:resource UserCollection
```

Uma vez que a classe de coleção de resources tenha sido gerada, você pode facilmente definir quaisquer metadados que devam ser incluídos com a resposta:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class UserCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection,
            'links' => [
                'self' => 'link-value',
            ],
        ];
    }
}
```

Após definir sua coleção de resources, ela pode ser retornada de uma rota ou controller:

```php
use App\Http\Resources\UserCollection;
use App\Models\User;

Route::get('/users', function () {
    return new UserCollection(User::all());
});
```

Ou, por conveniência, você pode usar o método `toResourceCollection` da coleção Eloquent, que usará as convenções do framework para descobrir automaticamente a coleção de resources subjacente do model:

```php
return User::all()->toResourceCollection();
```

Ao invocar o método `toResourceCollection`, o Laravel tentará localizar uma coleção de resources que corresponda ao nome do model e que seja sufixada com `Collection` dentro do namespace `Http\Resources` mais próximo do namespace do model.

<a id="preserving-collection-keys"></a>
#### Preservando as Chaves da Coleção

Ao retornar uma coleção de resources de uma rota, o Laravel redefine as chaves da coleção para que fiquem em ordem numérica. No entanto, você pode usar o atributo `PreserveKeys` na sua classe de resource para indicar se as chaves originais de uma coleção devem ser preservadas:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Attributes\PreserveKeys;
use Illuminate\Http\Resources\Json\JsonResource;

#[PreserveKeys]
class UserResource extends JsonResource
{
    // ...
}
```

Quando a propriedade `preserveKeys` é definida como `true`, as chaves da coleção serão preservadas quando a coleção for retornada de uma rota ou controller:

```php
use App\Http\Resources\UserResource;
use App\Models\User;

Route::get('/users', function () {
    return UserResource::collection(User::all()->keyBy->id);
});
```

<a id="customizing-the-underlying-resource-class"></a>
#### Customizando a Classe de Resource Subjacente

Normalmente, a propriedade `$this->collection` de uma coleção de resources é automaticamente populada com o resultado do mapeamento de cada item da coleção para sua classe de resource singular. A classe de resource singular é assumida como sendo o nome da classe da coleção sem a parte final `Collection` do nome da classe. Além disso, dependendo da sua preferência pessoal, a classe de resource singular pode ou não ser sufixada com `Resource`.

Por exemplo, `UserCollection` tentará mapear as instâncias de usuário fornecidas para o resource `UserResource`. Para customizar esse comportamento, você pode usar o atributo `Collects` na sua coleção de resources:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Attributes\Collects;
use Illuminate\Http\Resources\Json\ResourceCollection;

#[Collects(Member::class)]
class UserCollection extends ResourceCollection
{
    // ...
}
```

<a id="writing-resources"></a>
## Escrevendo Resources

> **Note:**
> Se você não leu a [visão geral do conceito](#concept-overview), você é fortemente encorajado a fazê-lo antes de prosseguir com esta documentação.

Os resources só precisam transformar um determinado model em um array. Portanto, cada resource contém um método `toArray` que traduz os atributos do seu model em um array amigável para API que pode ser retornado das rotas ou controllers da sua aplicação:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
```

Uma vez que um resource tenha sido definido, ele pode ser retornado diretamente de uma rota ou controller:

```php
use App\Models\User;

Route::get('/user/{id}', function (string $id) {
    return User::findOrFail($id)->toResource();
});
```

<a id="relationships"></a>
#### Relacionamentos

Se você quiser incluir resources relacionados na sua resposta, você pode adicioná-los ao array retornado pelo método `toArray` do seu resource. Neste exemplo, usaremos o método `collection` do resource `PostResource` para adicionar os posts de blog do usuário à resposta do resource:

```php
use App\Http\Resources\PostResource;
use Illuminate\Http\Request;

/**
 * Transform the resource into an array.
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        'posts' => PostResource::collection($this->posts),
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
}
```

> **Note:**
> Se você quiser incluir relacionamentos apenas quando eles já tiverem sido carregados, confira a documentação sobre [relacionamentos condicionais](#conditional-relationships).

<a id="writing-resource-collections"></a>
#### Coleções de Resources

Enquanto os resources transformam um único model em um array, as coleções de resources transformam uma coleção de models em um array. No entanto, não é absolutamente necessário definir uma classe de coleção de resources para cada um dos seus models, já que todas as coleções de models Eloquent fornecem um método `toResourceCollection` para gerar uma coleção de resources "ad-hoc" em tempo real:

```php
use App\Models\User;

Route::get('/users', function () {
    return User::all()->toResourceCollection();
});
```

No entanto, se você precisar customizar os metadados retornados com a coleção, é necessário definir sua própria coleção de resources:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class UserCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection,
            'links' => [
                'self' => 'link-value',
            ],
        ];
    }
}
```

Assim como os resources singulares, as coleções de resources podem ser retornadas diretamente das rotas ou controllers:

```php
use App\Http\Resources\UserCollection;
use App\Models\User;

Route::get('/users', function () {
    return new UserCollection(User::all());
});
```

Ou, por conveniência, você pode usar o método `toResourceCollection` da coleção Eloquent, que usará as convenções do framework para descobrir automaticamente a coleção de resources subjacente do model:

```php
return User::all()->toResourceCollection();
```

Ao invocar o método `toResourceCollection`, o Laravel tentará localizar uma coleção de resources que corresponda ao nome do model e que seja sufixada com `Collection` dentro do namespace `Http\Resources` mais próximo do namespace do model.

<a id="data-wrapping"></a>
### Envelopamento de Dados

Por padrão, o seu resource mais externo é envelopado em uma chave `data` quando a resposta do resource é convertida em JSON. Assim, por exemplo, uma resposta típica de coleção de resources se parece com a seguinte:

```json
{
    "data": [
        {
            "id": 1,
            "name": "Eladio Schroeder Sr.",
            "email": "therese28@example.com"
        },
        {
            "id": 2,
            "name": "Liliana Mayert",
            "email": "evandervort@example.com"
        }
    ]
}
```

Se você quiser desativar o envelopamento do resource mais externo, você deve invocar o método `withoutWrapping` na classe base `Illuminate\Http\Resources\Json\JsonResource`. Normalmente, você deve chamar esse método a partir do seu `AppServiceProvider` ou outro [service provider](/pt-br/providers/) que é carregado em cada requisição à sua aplicação:

```php
<?php

namespace App\Providers;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // ...
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        JsonResource::withoutWrapping();
    }
}
```

> **Warning:**
> O método `withoutWrapping` afeta apenas a resposta mais externa e não removerá as chaves `data` que você adiciona manualmente às suas próprias coleções de resources.

<a id="wrapping-nested-resources"></a>
#### Envelopando Resources Aninhados

Você tem total liberdade para determinar como os relacionamentos do seu resource são envelopados. Se você quiser que todas as coleções de resources sejam envelopadas em uma chave `data`, independentemente do seu aninhamento, você deve definir uma classe de coleção de resources para cada resource e retornar a coleção dentro de uma chave `data`.

Você pode estar se perguntando se isso fará com que o seu resource mais externo seja envelopado em duas chaves `data`. Não se preocupe, o Laravel nunca deixará seus resources serem acidentalmente envelopados duas vezes, então você não precisa se preocupar com o nível de aninhamento da coleção de resources que está transformando:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class CommentsCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return ['data' => $this->collection];
    }
}
```

<a id="data-wrapping-and-pagination"></a>
#### Envelopamento de Dados e Paginação

Ao retornar coleções paginadas via uma resposta de resource, o Laravel envelopará os dados do seu resource em uma chave `data` mesmo que o método `withoutWrapping` tenha sido chamado. Isso ocorre porque as respostas paginadas sempre contêm chaves `meta` e `links` com informações sobre o estado do paginador:

```json
{
    "data": [
        {
            "id": 1,
            "name": "Eladio Schroeder Sr.",
            "email": "therese28@example.com"
        },
        {
            "id": 2,
            "name": "Liliana Mayert",
            "email": "evandervort@example.com"
        }
    ],
    "links":{
        "first": "http://example.com/users?page=1",
        "last": "http://example.com/users?page=1",
        "prev": null,
        "next": null
    },
    "meta":{
        "current_page": 1,
        "from": 1,
        "last_page": 1,
        "path": "http://example.com/users",
        "per_page": 15,
        "to": 10,
        "total": 10
    }
}
```

<a id="pagination"></a>
### Paginação

Você pode passar uma instância de paginador do Laravel para o método `collection` de um resource ou para uma coleção de resources customizada:

```php
use App\Http\Resources\UserCollection;
use App\Models\User;

Route::get('/users', function () {
    return new UserCollection(User::paginate());
});
```

Ou, por conveniência, você pode usar o método `toResourceCollection` do paginador, que usará as convenções do framework para descobrir automaticamente a coleção de resources subjacente do model paginado:

```php
return User::paginate()->toResourceCollection();
```

As respostas paginadas sempre contêm chaves `meta` e `links` com informações sobre o estado do paginador:

```json
{
    "data": [
        {
            "id": 1,
            "name": "Eladio Schroeder Sr.",
            "email": "therese28@example.com"
        },
        {
            "id": 2,
            "name": "Liliana Mayert",
            "email": "evandervort@example.com"
        }
    ],
    "links":{
        "first": "http://example.com/users?page=1",
        "last": "http://example.com/users?page=1",
        "prev": null,
        "next": null
    },
    "meta":{
        "current_page": 1,
        "from": 1,
        "last_page": 1,
        "path": "http://example.com/users",
        "per_page": 15,
        "to": 10,
        "total": 10
    }
}
```

<a id="customizing-the-pagination-information"></a>
#### Customizando as Informações de Paginação

Se você quiser customizar as informações incluídas nas chaves `links` ou `meta` da resposta de paginação, você pode definir um método `paginationInformation` no resource. Este método receberá os dados `$paginated` e o array de informações `$default`, que é um array contendo as chaves `links` e `meta`:

```php
/**
 * Customize the pagination information for the resource.
 *
 * @param  \Illuminate\Http\Request  $request
 * @param  array  $paginated
 * @param  array  $default
 * @return array
 */
public function paginationInformation($request, $paginated, $default)
{
    $default['links']['custom'] = 'https://example.com';

    return $default;
}
```

<a id="conditional-attributes"></a>
### Atributos Condicionais

Às vezes você pode desejar incluir um atributo em uma resposta de resource apenas se uma determinada condição for atendida. Por exemplo, você pode desejar incluir um valor apenas se o usuário atual for um "administrador". O Laravel fornece uma variedade de métodos auxiliares para ajudá-lo nessa situação. O método `when` pode ser usado para adicionar condicionalmente um atributo a uma resposta de resource:

```php
/**
 * Transform the resource into an array.
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        'secret' => $this->when($request->user()->isAdmin(), 'secret-value'),
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
}
```

Neste exemplo, a chave `secret` só será retornada na resposta final do resource se o método `isAdmin` do usuário autenticado retornar `true`. Se o método retornar `false`, a chave `secret` será removida da resposta do resource antes de ser enviada ao cliente. O método `when` permite que você defina seus resources de forma expressiva sem recorrer a instruções condicionais ao construir o array.

O método `when` também aceita uma closure como seu segundo argumento, permitindo que você calcule o valor resultante apenas se a condição fornecida for `true`:

```php
'secret' => $this->when($request->user()->isAdmin(), function () {
    return 'secret-value';
}),
```

O método `whenHas` pode ser usado para incluir um atributo se ele estiver de fato presente no model subjacente:

```php
'name' => $this->whenHas('name'),
```

Adicionalmente, o método `whenNotNull` pode ser usado para incluir um atributo na resposta do resource se o atributo não for null:

```php
'name' => $this->whenNotNull($this->name),
```

<a id="merging-conditional-attributes"></a>
#### Mesclando Atributos Condicionais

Às vezes você pode ter vários atributos que devem ser incluídos na resposta do resource com base na mesma condição. Nesse caso, você pode usar o método `mergeWhen` para incluir os atributos na resposta apenas quando a condição fornecida for `true`:

```php
/**
 * Transform the resource into an array.
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        $this->mergeWhen($request->user()->isAdmin(), [
            'first-secret' => 'value',
            'second-secret' => 'value',
        ]),
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
}
```

Novamente, se a condição fornecida for `false`, esses atributos serão removidos da resposta do resource antes de ser enviada ao cliente.

> **Warning:**
> O método `mergeWhen` não deve ser usado dentro de arrays que misturam chaves string e numéricas. Além disso, ele não deve ser usado dentro de arrays com chaves numéricas que não estejam ordenadas sequencialmente.

<a id="conditional-relationships"></a>
### Relacionamentos Condicionais

Além de carregar atributos condicionalmente, você pode incluir relacionamentos condicionalmente nas suas respostas de resource com base em se o relacionamento já foi carregado no model. Isso permite que seu controller decida quais relacionamentos devem ser carregados no model e que seu resource possa facilmente incluí-los apenas quando eles tiverem sido de fato carregados. Em última análise, isso torna mais fácil evitar problemas de consulta "N+1" dentro dos seus resources.

O método `whenLoaded` pode ser usado para carregar um relacionamento condicionalmente. Para evitar carregar relacionamentos desnecessariamente, este método aceita o nome do relacionamento em vez do próprio relacionamento:

```php
use App\Http\Resources\PostResource;

/**
 * Transform the resource into an array.
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        'posts' => PostResource::collection($this->whenLoaded('posts')),
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
}
```

Neste exemplo, se o relacionamento não tiver sido carregado, a chave `posts` será removida da resposta do resource antes de ser enviada ao cliente.

<a id="conditional-relationship-counts"></a>
#### Contagens de Relacionamentos Condicionais

Além de incluir relacionamentos condicionalmente, você pode incluir "contagens" de relacionamentos condicionalmente nas suas respostas de resource com base em se a contagem do relacionamento foi carregada no model:

```php
new UserResource($user->loadCount('posts'));
```

O método `whenCounted` pode ser usado para incluir condicionalmente a contagem de um relacionamento na sua resposta de resource. Este método evita incluir o atributo desnecessariamente se a contagem dos relacionamentos não estiver presente:

```php
/**
 * Transform the resource into an array.
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        'posts_count' => $this->whenCounted('posts'),
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
}
```

Neste exemplo, se a contagem do relacionamento `posts` não tiver sido carregada, a chave `posts_count` será removida da resposta do resource antes de ser enviada ao cliente.

Outros tipos de agregados, como `avg`, `sum`, `min` e `max`, também podem ser carregados condicionalmente usando o método `whenAggregated`:

```php
'words_avg' => $this->whenAggregated('posts', 'words', 'avg'),
'words_sum' => $this->whenAggregated('posts', 'words', 'sum'),
'words_min' => $this->whenAggregated('posts', 'words', 'min'),
'words_max' => $this->whenAggregated('posts', 'words', 'max'),
```

<a id="conditional-pivot-information"></a>
#### Informações de Pivot Condicionais

Além de incluir informações de relacionamento condicionalmente nas suas respostas de resource, você pode incluir condicionalmente dados das tabelas intermediárias de relacionamentos muitos-para-muitos usando o método `whenPivotLoaded`. O método `whenPivotLoaded` aceita o nome da tabela pivot como seu primeiro argumento. O segundo argumento deve ser uma closure que retorna o valor a ser retornado se a informação do pivot estiver disponível no model:

```php
/**
 * Transform the resource into an array.
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'expires_at' => $this->whenPivotLoaded('role_user', function () {
            return $this->pivot->expires_at;
        }),
    ];
}
```

Se o seu relacionamento estiver usando um [model de tabela intermediária customizado](/pt-br/eloquent-relationships/#defining-custom-intermediate-table-models), você pode passar uma instância do model de tabela intermediária como o primeiro argumento para o método `whenPivotLoaded`:

```php
'expires_at' => $this->whenPivotLoaded(new Membership, function () {
    return $this->pivot->expires_at;
}),
```

Se a sua tabela intermediária estiver usando um accessor diferente de `pivot`, você pode usar o método `whenPivotLoadedAs`:

```php
/**
 * Transform the resource into an array.
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'expires_at' => $this->whenPivotLoadedAs('subscription', 'role_user', function () {
            return $this->subscription->expires_at;
        }),
    ];
}
```

<a id="adding-meta-data"></a>
### Adicionando Metadados

Alguns padrões de API JSON exigem a adição de metadados às suas respostas de resource e de coleção de resources. Isso geralmente inclui coisas como `links` para o resource ou resources relacionados, ou metadados sobre o próprio resource. Se você precisar retornar metadados adicionais sobre um resource, inclua-os no seu método `toArray`. Por exemplo, você pode incluir informações de `links` ao transformar uma coleção de resources:

```php
/**
 * Transform the resource into an array.
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
{
    return [
        'data' => $this->collection,
        'links' => [
            'self' => 'link-value',
        ],
    ];
}
```

Ao retornar metadados adicionais dos seus resources, você nunca precisa se preocupar em acidentalmente sobrescrever as chaves `links` ou `meta` que são automaticamente adicionadas pelo Laravel ao retornar respostas paginadas. Quaisquer `links` adicionais que você definir serão mesclados com os links fornecidos pelo paginador.

<a id="top-level-meta-data"></a>
#### Metadados de Nível Superior

Às vezes você pode desejar incluir certos metadados com uma resposta de resource apenas se o resource for o resource mais externo sendo retornado. Normalmente, isso inclui informações meta sobre a resposta como um todo. Para definir esses metadados, adicione um método `with` à sua classe de resource. Este método deve retornar um array de metadados a serem incluídos com a resposta do resource apenas quando o resource for o resource mais externo sendo transformado:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class UserCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return parent::toArray($request);
    }

    /**
     * Get additional data that should be returned with the resource array.
     *
     * @return array<string, mixed>
     */
    public function with(Request $request): array
    {
        return [
            'meta' => [
                'key' => 'value',
            ],
        ];
    }
}
```

<a id="adding-meta-data-when-constructing-resources"></a>
#### Adicionando Metadados ao Construir Resources

Você também pode adicionar dados de nível superior ao construir instâncias de resource na sua rota ou controller. O método `additional`, que está disponível em todos os resources, aceita um array de dados que deve ser adicionado à resposta do resource:

```php
return User::all()
    ->load('roles')
    ->toResourceCollection()
    ->additional(['meta' => [
        'key' => 'value',
    ]]);
```

<a id="jsonapi-resources"></a>
## Resources JSON:API

O Laravel vem com `JsonApiResource`, uma classe de resource que produz respostas em conformidade com a [especificação JSON:API](https://jsonapi.org/). Ela estende a classe padrão `JsonResource` e automaticamente lida com a estrutura do objeto resource, relacionamentos, sparse fieldsets, includes, avaliação lazy de atributos e define o cabeçalho `Content-Type` como `application/vnd.api+json`.

> **Note:**
> Os resources JSON:API do Laravel lidam com a serialização das suas respostas. Se você também precisar fazer o parse de parâmetros de query JSON:API recebidos, como filtros e ordenações, o [Laravel Query Builder da Spatie](https://spatie.be/docs/laravel-query-builder) é um ótimo pacote complementar.

<a id="generating-jsonapi-resources"></a>
### Gerando Resources JSON:API

Para gerar um resource JSON:API, use o comando Artisan `make:resource` com a flag `--json-api`:

```shell
php artisan make:resource PostResource --json-api
```

A classe gerada estenderá `Illuminate\Http\Resources\JsonApi\JsonApiResource` e incluirá as propriedades `$attributes` e `$relationships` para você definir:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\JsonApi\JsonApiResource;

class PostResource extends JsonApiResource
{
    /**
     * The resource's attributes.
     */
    public $attributes = [
        // ...
    ];

    /**
     * The resource's relationships.
     */
    public $relationships = [
        // ...
    ];
}
```

Os resources JSON:API podem ser retornados de rotas e controllers assim como os resources padrão:

```php
use App\Http\Resources\PostResource;
use App\Models\Post;

Route::get('/api/posts/{post}', function (Post $post) {
    return new PostResource($post);
});
```

Ou, por conveniência, você pode usar o método `toResource` do model:

```php
Route::get('/api/posts/{post}', function (Post $post) {
    return $post->toResource();
});
```

Isso produzirá uma resposta em conformidade com JSON:API:

```json
{
    "data": {
        "id": "1",
        "type": "posts",
        "attributes": {
            "title": "Hello World",
            "body": "This is my first post."
        }
    }
}
```

Para retornar uma coleção de resources JSON:API, use o método `collection` ou o método de conveniência `toResourceCollection`:

```php
return PostResource::collection(Post::all());

return Post::all()->toResourceCollection();
```

<a id="defining-jsonapi-attributes"></a>
### Definindo Atributos

Existem duas maneiras de definir quais atributos são incluídos no seu resource JSON:API.

A abordagem mais simples é definir uma propriedade `$attributes` no seu resource. Você pode listar os nomes dos atributos como valores, que serão lidos diretamente do model subjacente:

```php
public $attributes = [
    'title',
    'body',
    'created_at',
];
```

Se um atributo for caro de calcular, você pode retorná-lo de `toAttributes` como uma closure para que seja avaliado apenas quando o atributo for de fato necessário na resposta.

Ou, para controle total sobre os atributos do resource, você pode sobrescrever o método `toAttributes` no resource:

```php
/**
 * Get the resource's attributes.
 *
 * @return array<string, mixed>
 */
public function toAttributes(Request $request): array
{
    return [
        'title' => $this->title,
        'body' => $this->body,
        'is_published' => fn () => $this->published_at !== null,
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
}
```

<a id="defining-jsonapi-relationships"></a>
### Definindo Relacionamentos

Os resources JSON:API suportam a definição de relacionamentos que seguem a especificação JSON:API. Os relacionamentos só são serializados quando solicitados pelo cliente via o parâmetro de query `include`.

#### A Propriedade `$relationships`

Você pode definir os relacionamentos incluíveis do seu resource via a propriedade `$relationships` no seu resource:

```php
public $relationships = [
    'author',
    'comments',
];
```

Ao listar o nome de um relacionamento como valor, o Laravel resolverá o relacionamento Eloquent correspondente e descobrirá automaticamente a classe de resource apropriada. Se você precisar especificar a classe de resource explicitamente, você pode definir o relacionamento como um par chave / classe:

```php
use App\Http\Resources\UserResource;

public $relationships = [
    'author' => UserResource::class,
    'comments',
];
```

Alternativamente, você pode sobrescrever o método `toRelationships` no resource:

```php
/**
 * Get the resource's relationships.
 */
public function toRelationships(Request $request): array
{
    return [
        'author' => UserResource::class,
        'comments' => fn () => CommentResource::collection(
            $request->user()->is($this->resource)
                ? $this->comments
                : $this->comments->where('is_public', true),
        ),
    ];
}
```

Usar closures lhe dá mais controle sobre o payload do relacionamento, enquanto ainda resolve o relacionamento apenas quando o cliente o solicita.

#### Incluindo Relacionamentos

Os clientes podem solicitar resources relacionados usando o parâmetro de query `include`:

```
GET /api/posts/1?include=author,comments
```

Isso produz uma resposta com objetos identificadores de resource na chave `relationships` e objetos resource completos no array `included` de nível superior:

```json
{
    "data": {
        "id": "1",
        "type": "posts",
        "attributes": {
            "title": "Hello World"
        },
        "relationships": {
            "author": {
                "data": {
                    "id": "1",
                    "type": "users"
                }
            },
            "comments": {
                "data": [
                    {
                        "id": "1",
                        "type": "comments"
                    }
                ]
            }
        }
    },
    "included": [
        {
            "id": "1",
            "type": "users",
            "attributes": {
                "name": "Taylor Otwell"
            }
        },
        {
            "id": "1",
            "type": "comments",
            "attributes": {
                "body": "Great post!"
            }
        }
    ]
}
```

Relacionamentos aninhados podem ser incluídos usando a notação de ponto:

```
GET /api/posts/1?include=comments.author
```

<a id="jsonapi-relationship-depth"></a>
#### Profundidade de Relacionamento

Por padrão, os includes de relacionamentos aninhados são limitados a uma profundidade máxima. Você pode customizar esse limite usando o método `maxRelationshipDepth`, normalmente em um dos service providers da sua aplicação:

```php
use Illuminate\Http\Resources\JsonApi\JsonApiResource;

JsonApiResource::maxRelationshipDepth(3);
```

<a id="jsonapi-resource-type-and-id"></a>
### Tipo e ID do Resource

Por padrão, o `type` do resource é derivado do nome da classe do resource. Por exemplo, `PostResource` produz o tipo `posts` e `BlogPostResource` produz `blog_posts`. O `id` do resource é resolvido a partir da chave primária do model.

Se você precisar customizar esses valores, você pode sobrescrever os métodos `toType` e `toId` no seu resource:

```php
/**
 * Get the resource's type.
 */
public function toType(Request $request): string
{
    return 'articles';
}

/**
 * Get the resource's ID.
 */
public function toId(Request $request): string
{
    return (string) $this->uuid;
}
```

Isso é particularmente útil quando o `type` de um resource deve diferir do nome da sua classe, como quando um `AuthorResource` envolve um model `User` e deve gerar o tipo `authors`.

<a id="jsonapi-sparse-fieldsets-and-includes"></a>
### Sparse Fieldsets e Includes

Os resources JSON:API suportam [sparse fieldsets](https://jsonapi.org/format/#fetching-sparse-fieldsets), permitindo que os clientes solicitem apenas atributos específicos para cada tipo de resource usando o parâmetro de query `fields`:

```
GET /api/posts?fields[posts]=title,created_at&fields[users]=name
```

Isso incluirá apenas os atributos `title` e `created_at` para resources `posts`, e o atributo `name` para resources `users`.

<a id="jsonapi-ignoring-query-string"></a>
#### Ignorando a Query String

Se você quiser desativar a filtragem de sparse fieldset para uma determinada resposta de resource, você pode chamar o método `ignoreFieldsAndIncludesInQueryString`:

```php
return $post->toResource()
    ->ignoreFieldsAndIncludesInQueryString();
```

<a id="jsonapi-including-previously-loaded-relationships"></a>
#### Incluindo Relacionamentos Carregados Anteriormente

Por padrão, os relacionamentos só são incluídos na resposta quando solicitados via o parâmetro de query `include`. Se você quiser incluir todos os relacionamentos previamente eager-loaded independentemente da query string, você pode chamar o método `includePreviouslyLoadedRelationships`:

```php
return $post->load('author', 'comments')
    ->toResource()
    ->includePreviouslyLoadedRelationships();
```

<a id="jsonapi-links-and-meta"></a>
### Links e Meta

Você pode adicionar informações de links e meta aos seus objetos resource JSON:API sobrescrevendo os métodos `toLinks` e `toMeta` no resource:

```php
/**
 * Get the resource's links.
 */
public function toLinks(Request $request): array
{
    return [
        'self' => route('api.posts.show', $this->resource),
    ];
}

/**
 * Get the resource's meta information.
 */
public function toMeta(Request $request): array
{
    return [
        'readable_created_at' => $this->created_at->diffForHumans(),
    ];
}
```

Isso adicionará as chaves `links` e `meta` ao objeto resource na resposta:

```json
{
    "data": {
        "id": "1",
        "type": "posts",
        "attributes": {
            "title": "Hello World"
        },
        "links": {
            "self": "https://example.com/api/posts/1"
        },
        "meta": {
            "readable_created_at": "2 hours ago"
        }
    }
}
```

<a id="resource-responses"></a>
## Respostas de Resources

Como você já leu, os resources podem ser retornados diretamente de rotas e controllers:

```php
use App\Models\User;

Route::get('/user/{id}', function (string $id) {
    return User::findOrFail($id)->toResource();
});
```

No entanto, às vezes você pode precisar customizar a resposta HTTP de saída antes de ela ser enviada ao cliente. Existem duas maneiras de fazer isso. Primeiro, você pode encadear o método `response` no resource. Este método retornará uma instância de `Illuminate\Http\JsonResponse`, dando a você controle total sobre os cabeçalhos da resposta:

```php
use App\Http\Resources\UserResource;
use App\Models\User;

Route::get('/user', function () {
    return User::find(1)
        ->toResource()
        ->response()
        ->header('X-Value', 'True');
});
```

Alternativamente, você pode definir um método `withResponse` dentro do próprio resource. Este método será chamado quando o resource for retornado como o resource mais externo em uma resposta:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
        ];
    }

    /**
     * Customize the outgoing response for the resource.
     */
    public function withResponse(Request $request, JsonResponse $response): void
    {
        $response->header('X-Value', 'True');
    }
}
```
