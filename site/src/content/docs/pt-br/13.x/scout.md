---
title: "Laravel Scout"
---

- [Introdução](#introduction)
- [Instalação](#installation)
    - [Enfileiramento](#queueing)
- [Pré-requisitos dos Drivers](#driver-prerequisites)
    - [Algolia](#algolia)
    - [Meilisearch](#meilisearch)
    - [Typesense](#typesense)
    - [Turbopuffer](#turbopuffer)
- [Configuração](#configuration)
    - [Configurando os Dados Pesquisáveis](#configuring-searchable-data)
- [Engines de Banco de Dados / Coleção](#database-and-collection-engines)
    - [Engine de Banco de Dados](#database-engine)
    - [Engine de Coleção](#collection-engine)
- [Configuração de Engines de Terceiros](#third-party-engine-configuration)
    - [Configurando os Índices do Modelo](#configuring-model-indexes)
    - [Algolia](#algolia-configuration)
    - [Meilisearch](#meilisearch-configuration)
    - [Typesense](#typesense-configuration)
    - [Turbopuffer](#turbopuffer-configuration)
- [Indexação em Engines de Terceiros](#indexing)
    - [Importação em Lote](#batch-import)
    - [Adicionando Registros](#adding-records)
    - [Atualizando Registros](#updating-records)
    - [Removendo Registros](#removing-records)
    - [Pausando a Indexação](#pausing-indexing)
    - [Instâncias de Modelo Pesquisáveis Condicionalmente](#conditionally-searchable-model-instances)
- [Pesquisando](#searching)
    - [Cláusulas Where](#where-clauses)
    - [Pesquisa Semântica](#semantic-search)
    - [Paginação](#pagination)
    - [Soft Delete](#soft-deleting)
    - [Personalizando as Pesquisas da Engine](#customizing-engine-searches)
- [Engines Personalizadas](#custom-engines)

<a id="introduction"></a>
## Introdução

O [Laravel Scout](https://github.com/laravel/scout) fornece uma solução simples, baseada em drivers, para adicionar pesquisa full-text aos seus [modelos Eloquent](/en/eloquent/). Utilizando observers de modelo, o Scout mantém automaticamente seus índices de pesquisa sincronizados com seus registros Eloquent.

O Scout vem com uma engine `database` integrada que utiliza índices full-text do MySQL / PostgreSQL e cláusulas `LIKE` para pesquisar no seu banco de dados existente — sem necessidade de serviço externo. Para a maioria das aplicações, isso é tudo o que você precisa. Para uma visão geral de todas as opções de pesquisa disponíveis no Laravel, consulte a [documentação de pesquisa](/en/search/).

O Scout também inclui drivers para [Algolia](https://www.algolia.com/), [Meilisearch](https://www.meilisearch.com), [Typesense](https://typesense.org) e [Turbopuffer](https://turbopuffer.com) para quando você precisar de recursos como tolerância a erros de digitação, filtragem facetada, pesquisa vetorial ou geopesquisa em grande escala. Um driver de "collection" também está disponível para desenvolvimento local, e você também é livre para escrever [engines personalizadas](#custom-engines).

<a id="installation"></a>
## Instalação

Primeiro, instale o Scout através do gerenciador de pacotes Composer:

```shell
composer require laravel/scout
```

Após instalar o Scout, você deve publicar o arquivo de configuração do Scout usando o comando Artisan `vendor:publish`. Esse comando publicará o arquivo de configuração `scout.php` no diretório `config` da sua aplicação:

```shell
php artisan vendor:publish --provider="Laravel\Scout\ScoutServiceProvider"
```

Por fim, adicione a trait `Laravel\Scout\Searchable` ao modelo que você deseja tornar pesquisável. Essa trait registrará um observer de modelo que manterá automaticamente o modelo sincronizado com seu driver de pesquisa:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class Post extends Model
{
    use Searchable;
}
```

<a id="queueing"></a>
### Enfileiramento

Ao utilizar uma engine que não seja a `database` ou a `collection`, você deve considerar seriamente configurar um [driver de fila](/en/queues/) antes de usar a biblioteca. Executar um worker de fila permitirá que o Scout enfileire todas as operações que sincronizam as informações do seu modelo com seus índices de pesquisa, proporcionando tempos de resposta muito melhores para a interface web da sua aplicação.

Uma vez que você tenha configurado um driver de fila, defina o valor da opção `queue` no seu arquivo de configuração `config/scout.php` como `true`:

```php
'queue' => true,
```

Mesmo quando a opção `queue` está definida como `false`, é importante lembrar que alguns drivers do Scout, como Algolia e Meilisearch, sempre indexam registros de forma assíncrona. Em outras palavras, mesmo que a operação de indexação tenha sido concluída dentro da sua aplicação Laravel, o próprio mecanismo de pesquisa pode não refletir os registros novos e atualizados imediatamente.

Para especificar a conexão e a fila que seus jobs do Scout utilizam, você pode definir a opção de configuração `queue` como um array:

```php
'queue' => [
    'connection' => 'redis',
    'queue' => 'scout'
],
```

Obviamente, se você personalizar a conexão e a fila que os jobs do Scout utilizam, você deve executar um worker de fila para processar os jobs naquela conexão e fila:

```shell
php artisan queue:work redis --queue=scout
```

<a id="unique-jobs"></a>
#### Jobs Únicos

Em aplicações com grande volume de escrita, você pode querer impedir que o Scout enfileire jobs duplicados para os mesmos registros de modelo. Você pode optar por jobs de indexação únicos registrando as classes de job `MakeSearchableUniquely` e `RemoveFromSearchUniquely`, normalmente dentro do método `boot` de um service provider:

```php
use Laravel\Scout\Jobs\MakeSearchableUniquely;
use Laravel\Scout\Jobs\RemoveFromSearchUniquely;
use Laravel\Scout\Scout;

Scout::makeSearchableUsing(MakeSearchableUniquely::class);
Scout::removeFromSearchUsing(RemoveFromSearchUniquely::class);
```

Esses jobs utilizam os [locks de jobs únicos](/en/queues/#unique-jobs) do Laravel para evitar o despacho de operações de indexação enfileiradas duplicadas para os mesmos registros de modelo pesquisáveis enquanto um job correspondente já estiver enfileirado.

<a id="driver-prerequisites"></a>
## Pré-requisitos dos Drivers

<a id="algolia"></a>
### Algolia

Ao utilizar o driver Algolia, você deve configurar suas credenciais `id` e `secret` do Algolia no seu arquivo de configuração `config/scout.php`. Uma vez que suas credenciais tenham sido configuradas, você também precisará instalar o SDK PHP do Algolia através do gerenciador de pacotes Composer:

```shell
composer require algolia/algoliasearch-client-php
```

<a id="meilisearch"></a>
### Meilisearch

O [Meilisearch](https://www.meilisearch.com) é um mecanismo de pesquisa rápido e open source que suporta pesquisa full-text, semântica e híbrida. Se você não tiver certeza de como instalar o Meilisearch na sua máquina local, você pode usar o [Laravel Sail](/en/sail/#meilisearch), o ambiente de desenvolvimento Docker oficialmente suportado pelo Laravel. Para produção, você pode [hospedar você mesmo](https://www.meilisearch.com/docs/learn/self_hosted/getting_started_with_self_hosted_meilisearch) o Meilisearch ou usar o [Meilisearch Cloud](https://www.meilisearch.com/cloud).

Ao utilizar o driver Meilisearch, você precisará instalar o SDK PHP do Meilisearch através do gerenciador de pacotes Composer:

```shell
composer require meilisearch/meilisearch-php http-interop/http-factory-guzzle
```

Em seguida, defina a variável de ambiente `SCOUT_DRIVER`, bem como suas credenciais `host` e `key` do Meilisearch, no arquivo `.env` da sua aplicação:

```ini
SCOUT_DRIVER=meilisearch
MEILISEARCH_HOST=http://127.0.0.1:7700
MEILISEARCH_KEY=masterKey
```

Para mais informações sobre o Meilisearch, consulte a [documentação do Meilisearch](https://www.meilisearch.com/docs/getting_started/overview).

<a id="typesense"></a>
### Typesense

O [Typesense](https://typesense.org) é um mecanismo de pesquisa open source extremamente rápido e suporta pesquisa por palavra-chave, pesquisa semântica, geopesquisa e pesquisa vetorial.

Você pode [hospedar você mesmo](https://typesense.org/docs/guide/install-typesense.html#option-2-local-machine-self-hosting) o Typesense ou usar o [Typesense Cloud](https://cloud.typesense.org).

Para começar a usar o Typesense com o Scout, instale o SDK PHP do Typesense através do gerenciador de pacotes Composer:

```shell
composer require typesense/typesense-php
```

Em seguida, defina a variável de ambiente `SCOUT_DRIVER`, bem como suas credenciais de host e chave de API do Typesense, no arquivo .env da sua aplicação:

```ini
SCOUT_DRIVER=typesense
TYPESENSE_API_KEY=masterKey
TYPESENSE_HOST=localhost
```

Se você estiver usando o [Laravel Sail](/en/sail/), pode ser necessário ajustar a variável de ambiente `TYPESENSE_HOST` para corresponder ao nome do container Docker. Você também pode, opcionalmente, especificar a porta, o caminho e o protocolo da sua instalação:

```ini
TYPESENSE_PORT=8108
TYPESENSE_PATH=
TYPESENSE_PROTOCOL=http
```

Configurações adicionais e definições de schema para suas collections do Typesense podem ser encontradas no arquivo de configuração `config/scout.php` da sua aplicação. Para mais informações sobre o Typesense, consulte a [documentação do Typesense](https://typesense.org/docs/guide/#quick-start).

<a id="turbopuffer"></a>
### Turbopuffer

O [Turbopuffer](https://turbopuffer.com) é um mecanismo de pesquisa que suporta pesquisa full-text, semântica e híbrida. Para usar o driver Turbopuffer, defina a variável de ambiente `SCOUT_DRIVER` e forneça sua chave de API do Turbopuffer:

```ini
SCOUT_DRIVER=turbopuffer
TURBOPUFFER_API_KEY=tpuf_...
TURBOPUFFER_REGION=gcp-us-central1
```

A variável de ambiente `TURBOPUFFER_REGION` é opcional e tem como padrão `gcp-us-central1`.

<a id="configuration"></a>
## Configuração

<a id="configuring-searchable-data"></a>
### Configurando os Dados Pesquisáveis

Por padrão, toda a forma `toArray` de um determinado modelo será persistida em seu índice de pesquisa. Se você quiser personalizar os dados que são sincronizados com o índice de pesquisa, você pode sobrescrever o método `toSearchableArray` no modelo:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class Post extends Model
{
    use Searchable;

    /**
     * Get the indexable data array for the model.
     *
     * @return array<string, mixed>
     */
    public function toSearchableArray(): array
    {
        $array = $this->toArray();

        // Customize the data array...

        return $array;
    }
}
```

<a id="configuring-search-engines-per-model"></a>
#### Configurando as Engines do Modelo

Ao pesquisar, o Scout normalmente usará a engine de pesquisa padrão especificada no arquivo de configuração `scout` da sua aplicação. No entanto, a engine de pesquisa de um modelo específico pode ser alterada sobrescrevendo o método `searchableUsing` no modelo:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Engines\Engine;
use Laravel\Scout\Scout;
use Laravel\Scout\Searchable;

class User extends Model
{
    use Searchable;

    /**
     * Get the engine used to index the model.
     */
    public function searchableUsing(): Engine
    {
        return Scout::engine('meilisearch');
    }
}
```

<a id="database-and-collection-engines"></a>
## Engines de Banco de Dados / Coleção

<a id="database-engine"></a>
### Engine de Banco de Dados

> **Warning:**
> A engine de banco de dados atualmente suporta MySQL e PostgreSQL, ambos os quais fornecem suporte para indexação rápida de colunas full-text.

A engine `database` utiliza índices full-text do MySQL / PostgreSQL e cláusulas `LIKE` para pesquisar diretamente no seu banco de dados existente. Para muitas aplicações, esta é a maneira mais simples e prática de adicionar pesquisa — sem necessidade de serviço externo ou infraestrutura adicional.

Para usar a engine de banco de dados, defina a variável de ambiente `SCOUT_DRIVER` como `database`:

```ini
SCOUT_DRIVER=database
```

Uma vez configurada, você pode [definir seus dados pesquisáveis](#configuring-searchable-data) e começar a [executar consultas de pesquisa](#searching) contra seus modelos. Diferentemente das engines de terceiros, a engine de banco de dados não requer uma etapa de indexação separada — ela pesquisa diretamente nas tabelas do seu banco de dados.

<a id="database-semantic-and-hybrid-search"></a>
#### Pesquisa Semântica e Híbrida

A engine de banco de dados suporta pesquisa semântica e híbrida ao utilizar o PostgreSQL com a extensão `pgvector`. Para começar, adicione uma coluna de vetor anulável e um índice full-text à tabela do seu modelo. A coluna de vetor deve ser anulável porque o Scout armazena o embedding após o modelo ter sido persistido:

```php
Schema::ensureVectorExtensionExists();

Schema::table('articles', function (Blueprint $table) {
    // ...

    $table->vector('embedding', dimensions: 1536)->nullable();
    $table->vectorIndex('embedding');
    $table->fullText(['title', 'body']);
});
```

Em seguida, defina um método `toSearchableEmbedding` no modelo. Esse método pode retornar o texto-fonte que o Scout deve transformar em embedding ou um array de embedding pré-computado. O Scout armazena os embeddings na coluna `embedding` por padrão; para usar outra coluna, defina um método `searchableEmbeddingColumn` no modelo.

#### Personalizando as Estratégias de Pesquisa no Banco de Dados

Por padrão, a engine de banco de dados executará uma consulta `LIKE` contra todos os atributos do modelo que você [configurou como pesquisáveis](#configuring-searchable-data). No entanto, você pode atribuir estratégias de pesquisa mais eficientes a colunas específicas. O atributo `SearchUsingFullText` usará o índice full-text do seu banco de dados para aquela coluna, enquanto o `SearchUsingPrefix` corresponderá apenas ao início das strings (`example%`) em vez de pesquisar dentro de toda a string (`%example%`).

Para definir esse comportamento, atribua atributos PHP ao método `toSearchableArray` do seu modelo. Quaisquer colunas sem um atributo continuarão usando a estratégia `LIKE` padrão:

```php
use Laravel\Scout\Attributes\SearchUsingFullText;
use Laravel\Scout\Attributes\SearchUsingPrefix;

/**
 * Get the indexable data array for the model.
 *
 * @return array<string, mixed>
 */
#[SearchUsingPrefix(['id', 'email'])]
#[SearchUsingFullText(['bio'])]
public function toSearchableArray(): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        'bio' => $this->bio,
    ];
}
```

> **Warning:**
> Antes de especificar que uma coluna deve usar restrições de consulta full-text, certifique-se de que a coluna tenha recebido um [índice full-text](/en/migrations/#available-index-types).

<a id="collection-engine"></a>
### Engine de Coleção

A engine "collection" é destinada a protótipos rápidos, conjuntos de dados extremamente pequenos (algumas centenas de registros) ou execução de testes. Ela recupera todos os registros possíveis do seu banco de dados e usa o helper `Str::is` do Laravel para filtrá-los em PHP, de modo que não requer qualquer indexação ou recursos específicos de banco de dados. Para qualquer coisa além de casos de uso triviais, você deve usar a [engine de banco de dados](#database-engine).

Para usar a engine de coleção, você pode simplesmente definir o valor da variável de ambiente `SCOUT_DRIVER` como `collection`, ou especificar o driver `collection` diretamente no arquivo de configuração `scout` da sua aplicação:

```ini
SCOUT_DRIVER=collection
```

Uma vez que você tenha especificado o driver de coleção como seu driver preferido, você pode começar a [executar consultas de pesquisa](#searching) contra seus modelos. A indexação do mecanismo de pesquisa, como a indexação necessária para popular os índices do Algolia, Meilisearch ou Typesense, é desnecessária ao usar a engine de coleção.

#### Diferenças em Relação à Engine de Banco de Dados

Enquanto a engine de banco de dados usa índices full-text e cláusulas `LIKE` para encontrar registros correspondentes de forma eficiente, a engine de coleção recupera todos os registros e os filtra em PHP. A engine de coleção é a opção mais portável, pois funciona em todos os bancos de dados relacionais suportados pelo Laravel (incluindo SQLite e SQL Server); no entanto, ela é significativamente menos eficiente do que a engine de banco de dados e não deve ser usada com conjuntos de dados grandes.

<a id="third-party-engine-configuration"></a>
## Configuração de Engines de Terceiros

As seguintes opções de configuração são relevantes apenas ao utilizar um mecanismo de pesquisa de terceiros, como Algolia, Meilisearch ou Typesense. Se você estiver usando a [engine de banco de dados](#database-engine), você pode pular esta seção.

<a id="configuring-model-indexes"></a>
### Configurando os Índices do Modelo

Ao utilizar uma engine de terceiros, cada modelo Eloquent é sincronizado com um determinado "índice" de pesquisa, que contém todos os registros pesquisáveis daquele modelo. Por padrão, cada modelo será persistido em um índice que corresponde ao nome típico da "tabela" do modelo. Normalmente, essa é a forma plural do nome do modelo; no entanto, você é livre para personalizar o índice do modelo sobrescrevendo o método `searchableAs` no modelo:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class Post extends Model
{
    use Searchable;

    /**
     * Get the name of the index associated with the model.
     */
    public function searchableAs(): string
    {
        return 'posts_index';
    }
}
```

> **Note:**
> O método `searchableAs` não tem efeito ao usar a engine de banco de dados, que sempre pesquisa diretamente na tabela de banco de dados do modelo.

<a id="configuring-the-model-id"></a>
#### Configurando o ID do Modelo

Por padrão, o Scout usará a chave primária do modelo como o ID / chave única do modelo que é armazenado no índice de pesquisa. Se você precisar personalizar esse comportamento ao usar uma engine de terceiros, você pode sobrescrever os métodos `getScoutKey` e `getScoutKeyName` no modelo:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class User extends Model
{
    use Searchable;

    /**
     * Get the value used to index the model.
     */
    public function getScoutKey(): mixed
    {
        return $this->email;
    }

    /**
     * Get the key name used to index the model.
     */
    public function getScoutKeyName(): mixed
    {
        return 'email';
    }
}
```

> **Note:**
> Os métodos `getScoutKey` e `getScoutKeyName` não têm efeito ao usar a engine de banco de dados, que sempre usa a chave primária do modelo.

<a id="algolia-configuration"></a>
### Algolia

<a id="algolia-index-settings"></a>
#### Configurações de Índice

Às vezes, você pode querer configurar ajustes adicionais nos seus índices do Algolia. Embora você possa gerenciar essas configurações através da interface do Algolia, às vezes é mais eficiente gerenciar o estado desejado da configuração do seu índice diretamente a partir do arquivo de configuração `config/scout.php` da sua aplicação.

Essa abordagem permite que você implante essas configurações através do pipeline de deploy automatizado da sua aplicação, evitando a configuração manual e garantindo consistência entre múltiplos ambientes. Você pode configurar atributos filtráveis, ranking, faceting ou [quaisquer outras configurações suportadas](https://www.algolia.com/doc/rest-api/search/#tag/Indices/operation/setSettings).

Para começar, adicione as configurações para cada índice no arquivo de configuração `config/scout.php` da sua aplicação:

```php
use App\Models\User;
use App\Models\Flight;

'algolia' => [
    'id' => env('ALGOLIA_APP_ID', ''),
    'secret' => env('ALGOLIA_SECRET', ''),
    'index-settings' => [
        User::class => [
            'searchableAttributes' => ['id', 'name', 'email'],
            'attributesForFaceting'=> ['filterOnly(email)'],
            // Other settings fields...
        ],
        Flight::class => [
            'searchableAttributes'=> ['id', 'destination'],
        ],
    ],
],
```

Se o modelo subjacente a um determinado índice for soft deletable e estiver incluído no array `index-settings`, o Scout incluirá automaticamente suporte para faceting em modelos com soft delete naquele índice. Se você não tiver outros atributos de faceting para definir para um índice de modelo soft deletable, você pode simplesmente adicionar uma entrada vazia ao array `index-settings` para aquele modelo:

```php
'index-settings' => [
    Flight::class => []
],
```

Após configurar as configurações de índice da sua aplicação, você deve invocar o comando Artisan `scout:sync-index-settings`. Esse comando informará ao Algolia sobre as configurações de índice atualmente configuradas. Por conveniência, você pode querer tornar esse comando parte do seu processo de deploy:

```shell
php artisan scout:sync-index-settings
```

<a id="algolia-identifying-users"></a>
#### Identificando Usuários

O Scout permite que você identifique usuários automaticamente ao usar o Algolia. Associar o usuário autenticado às operações de pesquisa pode ser útil ao visualizar suas análises de pesquisa no dashboard do Algolia. Você pode habilitar a identificação de usuários definindo uma variável de ambiente `SCOUT_IDENTIFY` como `true` no arquivo `.env` da sua aplicação:

```ini
SCOUT_IDENTIFY=true
```

Habilitar esse recurso também passará o endereço IP da requisição e o identificador primário do seu usuário autenticado ao Algolia, de modo que esses dados sejam associados a qualquer requisição de pesquisa feita pelo usuário.

<a id="meilisearch-configuration"></a>
### Meilisearch

<a id="meilisearch-index-settings"></a>
#### Configurações de Índice

O Meilisearch exige que você predefina as configurações de pesquisa do índice, como atributos filtráveis, atributos ordenáveis e [outros campos de configuração suportados](https://docs.meilisearch.com/reference/api/settings.html).

Atributos filtráveis são quaisquer atributos pelos quais você planeja filtrar ao invocar o método `where` do Scout, enquanto atributos ordenáveis são quaisquer atributos pelos quais você planeja ordenar ao invocar o método `orderBy` do Scout. Para definir as configurações do seu índice, ajuste a parte `index-settings` da entrada de configuração `meilisearch` no arquivo de configuração `scout` da sua aplicação:

```php
use App\Models\User;
use App\Models\Flight;

'meilisearch' => [
    'host' => env('MEILISEARCH_HOST', 'http://localhost:7700'),
    'key' => env('MEILISEARCH_KEY', null),
    'index-settings' => [
        User::class => [
            'filterableAttributes'=> ['id', 'name', 'email'],
            'sortableAttributes' => ['created_at'],
            // Other settings fields...
        ],
        Flight::class => [
            'filterableAttributes'=> ['id', 'destination'],
            'sortableAttributes' => ['updated_at'],
        ],
    ],
],
```

Se o modelo subjacente a um determinado índice for soft deletable e estiver incluído no array `index-settings`, o Scout incluirá automaticamente suporte para filtrar em modelos com soft delete naquele índice. Se você não tiver outros atributos filtráveis ou ordenáveis para definir para um índice de modelo soft deletable, você pode simplesmente adicionar uma entrada vazia ao array `index-settings` para aquele modelo:

```php
'index-settings' => [
    Flight::class => []
],
```

Após configurar as configurações de índice da sua aplicação, você deve invocar o comando Artisan `scout:sync-index-settings`. Esse comando informará ao Meilisearch sobre as configurações de índice atualmente configuradas. Por conveniência, você pode querer tornar esse comando parte do seu processo de deploy:

```shell
php artisan scout:sync-index-settings
```

<a id="meilisearch-semantic-and-hybrid-search"></a>
#### Pesquisa Semântica e Híbrida

Para usar a pesquisa semântica ou híbrida com o Meilisearch, configure um embedder nas configurações de índice e configurações de embedding para cada modelo pesquisável:

```php
'meilisearch' => [
    // ...
    'index-settings' => [
        Article::class => [
            'embedders' => [
                'default' => [
                    'source' => 'userProvided',
                    'dimensions' => 1536,
                ],
            ],
        ],
    ],
    'model-settings' => [
        Article::class => [
            'embedding' => [
                'embedder' => 'default',
                'dimensions' => 1536,
            ],
        ],
    ],
],
```

O método `toSearchableEmbedding` do modelo pode retornar o texto-fonte, que o Scout transforma em embedding usando o [Laravel AI SDK](/en/ai-sdk/), ou um array de embedding pré-computado. Após atualizar a configuração, execute o comando `scout:sync-index-settings`.

Alternativamente, você pode usar os embeddings nativos do Meilisearch definindo o `driver` de embedding como `meilisearch`. Nesse modo, o Meilisearch gera os embeddings de documento e de consulta usando o embedder configurado, de modo que a opção `dimensions` e o método `toSearchableEmbedding` não são necessários:

```php
'meilisearch' => [
    'index-settings' => [
        Article::class => [
            'embedders' => [
                'default' => [
                    'source' => 'openAi',
                    'apiKey' => env('OPENAI_API_KEY'),
                    'model' => 'text-embedding-3-small',
                    'documentTemplate' => 'An article titled {{ doc.title }}: {{ doc.body }}',
                ],
            ],
        ],
    ],
    'model-settings' => [
        Article::class => [
            'embedding' => [
                'embedder' => 'default',
                'driver' => 'meilisearch',
            ],
        ],
    ],
],
```

Ao usar embeddings nativos, o Scout não gerará nem adicionará vetores aos documentos indexados. Você ainda pode fornecer um vetor de consulta pré-computado usando a opção de pesquisa `vector`. Assim como outras configurações de índice, execute o comando `scout:sync-index-settings` após atualizar a configuração do embedder.

Para mais informações sobre as fontes de embedder disponíveis e suas opções, consulte a [documentação de pesquisa híbrida do Meilisearch](https://www.meilisearch.com/docs/capabilities/hybrid_search/getting_started).

<a id="meilisearch-data-types"></a>
#### Tipos de Dados Pesquisáveis

O Meilisearch só realizará operações de filtro (`>`, `<`, etc.) em dados do tipo correto. Ao personalizar seus dados pesquisáveis, você deve garantir que os valores numéricos sejam convertidos para o seu tipo correto:

```php
public function toSearchableArray()
{
    return [
        'id' => (int) $this->id,
        'name' => $this->name,
        'price' => (float) $this->price,
    ];
}
```

<a id="typesense-configuration"></a>
### Typesense

<a id="typesense-searchable-data"></a>
#### Preparando os Dados Pesquisáveis

Ao utilizar o Typesense, seus modelos pesquisáveis devem definir um método `toSearchableArray` que converte a chave primária do seu modelo em uma string e a data de criação em um timestamp UNIX:

```php
/**
 * Get the indexable data array for the model.
 *
 * @return array<string, mixed>
 */
public function toSearchableArray(): array
{
    return array_merge($this->toArray(),[
        'id' => (string) $this->id,
        'created_at' => $this->created_at->timestamp,
    ]);
}
```

Você também deve definir os schemas das suas collections do Typesense no arquivo `config/scout.php` da sua aplicação. Um schema de collection descreve os tipos de dados de cada campo que é pesquisável via Typesense. Para mais informações sobre todas as opções de schema disponíveis, consulte a [documentação do Typesense](https://typesense.org/docs/latest/api/collections.html#schema-parameters).

Se você precisar alterar o schema da sua collection do Typesense após ter sido definido, você pode executar `scout:flush` e `scout:import`, que excluirão todos os dados indexados existentes e recriarão o schema. Ou, você pode usar a API do Typesense para modificar o schema da collection sem remover nenhum dado indexado.

Se o seu modelo pesquisável for soft deletable, você deve definir um campo `__soft_deleted` no schema do Typesense correspondente ao modelo, no arquivo de configuração `config/scout.php` da sua aplicação:

```php
User::class => [
    'collection-schema' => [
        'fields' => [
            // ...
            [
                'name' => '__soft_deleted',
                'type' => 'int32',
                'optional' => true,
            ],
        ],
    ],
],
```

<a id="typesense-embeddings"></a>
#### Embeddings

Para habilitar a pesquisa semântica e híbrida, defina uma configuração `embedding` e um campo de vetor na configuração do Typesense do modelo. Por padrão, o Scout usa o [Laravel AI SDK](/en/ai-sdk/) para gerar embeddings:

```php
use App\Models\Article;

'model-settings' => [
    Article::class => [
        'collection-schema' => [
            'fields' => [
                ['name' => 'title', 'type' => 'string'],
                ['name' => 'embedding', 'type' => 'float[]', 'num_dim' => 1536],
            ],
        ],
        'search-parameters' => ['query_by' => 'title'],
        'embedding' => [
            'attribute' => 'embedding',
            'dimensions' => 1536,
        ],
    ],
],
```

O método `toSearchableEmbedding` do seu modelo deve retornar o texto-fonte que o Scout deve transformar em embedding ou um array de embedding pré-computado:

```php
public function toSearchableEmbedding(): string|array
{
    return $this->title.' '.$this->body;
}
```

<a id="typesense-dynamic-search-parameters"></a>
#### Parâmetros de Pesquisa Dinâmicos

O Typesense permite que você modifique seus [parâmetros de pesquisa](https://typesense.org/docs/latest/api/search.html#search-parameters) dinamicamente ao realizar uma operação de pesquisa através do método `options`:

```php
use App\Models\Todo;

Todo::search('Groceries')->options([
    'query_by' => 'title, description'
])->get();
```

<a id="turbopuffer-configuration"></a>
### Turbopuffer

O Turbopuffer exige um schema e atributos pesquisáveis para cada modelo. Defina-os no array `model-settings` da sua configuração `turbopuffer` dentro do arquivo de configuração `scout`:

```php
use App\Models\Article;

'turbopuffer' => [
    // ...
    'model-settings' => [
        Article::class => [
            'searchable-attributes' => [
                'title' => 3,
                'body' => 1,
            ],
            'schema' => [
                'title' => ['type' => 'string', 'full_text_search' => true],
                'body' => ['type' => 'string', 'full_text_search' => true],
                'status' => ['type' => 'string'],
            ],
        ],
    ],
],
```

Os valores numéricos atribuídos a `searchable-attributes` são pesos BM25 relativos. No exemplo acima, correspondências no título do artigo contribuem com três vezes a pontuação de correspondências no corpo.

Para habilitar a pesquisa semântica e híbrida, adicione uma configuração `embedding` e um schema de vetor à configuração do modelo:

```php
'turbopuffer' => [
    // ...
    'model-settings' => [
        Article::class => [
            'searchable-attributes' => [
                'title' => 3,
                'body' => 1,
            ],
            'embedding' => [
                'attribute' => 'embedding',
                'dimensions' => 1536,
            ],
            'schema' => [
                'title' => ['type' => 'string', 'full_text_search' => true],
                'body' => ['type' => 'string', 'full_text_search' => true],
                'embedding' => ['type' => '[1536]f32', 'ann' => true],
            ],
        ],
    ],
],
```

O método `toSearchableEmbedding` do seu modelo deve retornar o texto-fonte que o Scout deve transformar em embedding ou um array de embedding pré-computado. O Scout gera embeddings de texto-fonte usando o [Laravel AI SDK](/en/ai-sdk/).

Alternativamente, você pode usar os embeddings nativos do Turbopuffer sem instalar o Laravel AI SDK ou definir um método `toSearchableEmbedding`. Defina o driver de embedding como `turbopuffer` e configure um schema `embed` no atributo de origem pesquisável:

```php
'embedding' => [
    'driver' => 'turbopuffer',
    'attribute' => 'embedding_text',
],

'schema' => [
    // ...
    'embedding_text' => [
        'type' => 'string',
        'embed' => [
            'model' => 'voyage/voyage-4',
            'dimensions' => 1024,
            'attribute' => 'embedding',
        ],
    ],
],
```

O atributo de origem deve ser incluído na saída do método `toSearchableArray` do modelo.

<a id="indexing"></a>
## Indexação em Engines de Terceiros

> **Note:**
> Os recursos de indexação descritos nesta seção são primariamente relevantes ao usar uma engine de terceiros (Algolia, Meilisearch, Typesense ou Turbopuffer). A engine de banco de dados pesquisa diretamente nas tabelas do seu banco de dados, portanto não requer gerenciamento manual de índices.

<a id="batch-import"></a>
### Importação em Lote

Se você estiver instalando o Scout em um projeto existente, você já pode ter registros de banco de dados que precisa importar para seus índices. O Scout fornece um comando Artisan `scout:import` que você pode usar para importar todos os seus registros existentes para seus índices de pesquisa:

```shell
php artisan scout:import "App\Models\Post"
```

O comando `scout:queue-import` pode ser usado para importar todos os seus registros existentes usando [jobs enfileirados](/en/queues/):

```shell
php artisan scout:queue-import "App\Models\Post" --chunk=500
```

O comando `flush` pode ser usado para remover todos os registros de um modelo dos seus índices de pesquisa:

```shell
php artisan scout:flush "App\Models\Post"
```

<a id="modifying-the-import-query"></a>
#### Modificando a Consulta de Importação

Se você quiser modificar a consulta usada para recuperar todos os seus modelos para importação em lote, você pode definir um método `makeAllSearchableUsing` no seu modelo. Este é um ótimo lugar para adicionar qualquer eager loading de relacionamento que possa ser necessário antes de importar seus modelos:

```php
use Illuminate\Database\Eloquent\Builder;

/**
 * Modify the query used to retrieve models when making all of the models searchable.
 */
protected function makeAllSearchableUsing(Builder $query): Builder
{
    return $query->with('author');
}
```

> **Warning:**
> O método `makeAllSearchableUsing` pode não ser aplicável ao usar uma fila para importar modelos em lote. Os relacionamentos [não são restaurados](/en/queues/#handling-relationships) quando as coleções de modelos são processadas por jobs.

<a id="adding-records"></a>
### Adicionando Registros

Uma vez que você tenha adicionado a trait `Laravel\Scout\Searchable` a um modelo, tudo o que você precisa fazer é dar `save` ou `create` em uma instância de modelo e ela será automaticamente adicionada ao seu índice de pesquisa. Se você configurou o Scout para [usar filas](#queueing), essa operação será realizada em segundo plano pelo seu worker de fila:

```php
use App\Models\Order;

$order = new Order;

// ...

$order->save();
```

<a id="adding-records-via-query"></a>
#### Adicionando Registros via Consulta

Se você quiser adicionar uma coleção de modelos ao seu índice de pesquisa via uma consulta Eloquent, você pode encadear o método `searchable` à consulta Eloquent. O método `searchable` fará o [chunk dos resultados](/en/eloquent/#chunking-results) da consulta e adicionará os registros ao seu índice de pesquisa. Novamente, se você configurou o Scout para usar filas, todos os chunks serão importados em segundo plano pelos seus workers de fila:

```php
use App\Models\Order;

Order::where('price', '>', 100)->searchable();
```

Você também pode chamar o método `searchable` em uma instância de relacionamento Eloquent:

```php
$user->orders()->searchable();
```

Ou, se você já tiver uma coleção de modelos Eloquent em memória, você pode chamar o método `searchable` na instância da coleção para adicionar as instâncias de modelo ao seu índice correspondente:

```php
$orders->searchable();
```

> **Note:**
> O método `searchable` pode ser considerado uma operação de "upsert". Em outras palavras, se o registro do modelo já estiver no seu índice, ele será atualizado. Se não existir no índice de pesquisa, ele será adicionado ao índice.

<a id="updating-records"></a>
### Atualizando Registros

Para atualizar um modelo pesquisável, você só precisa atualizar as propriedades da instância do modelo e dar `save` no modelo no seu banco de dados. O Scout persistirá automaticamente as alterações no seu índice de pesquisa:

```php
use App\Models\Order;

$order = Order::find(1);

// Update the order...

$order->save();
```

Você também pode invocar o método `searchable` em uma instância de consulta Eloquent para atualizar uma coleção de modelos. Se os modelos não existirem no seu índice de pesquisa, eles serão criados:

```php
Order::where('price', '>', 100)->searchable();
```

Se você quiser atualizar os registros do índice de pesquisa para todos os modelos em um relacionamento, você pode invocar o `searchable` na instância do relacionamento:

```php
$user->orders()->searchable();
```

Ou, se você já tiver uma coleção de modelos Eloquent em memória, você pode chamar o método `searchable` na instância da coleção para atualizar as instâncias de modelo no seu índice correspondente:

```php
$orders->searchable();
```

<a id="modifying-records-before-importing"></a>
#### Modificando Registros Antes de Importar

Às vezes, você pode precisar preparar a coleção de modelos antes de torná-los pesquisáveis. Por exemplo, você pode querer fazer eager load de um relacionamento para que os dados do relacionamento possam ser adicionados de forma eficiente ao seu índice de pesquisa. Para fazer isso, defina um método `makeSearchableUsing` no modelo correspondente:

```php
use Illuminate\Database\Eloquent\Collection;

/**
 * Modify the collection of models being made searchable.
 */
public function makeSearchableUsing(Collection $models): Collection
{
    return $models->load('author');
}
```

<a id="conditionally-updating-the-search-index"></a>
#### Atualizando o Índice de Pesquisa Condicionalmente

Por padrão, o Scout reindexará um modelo atualizado independentemente de quais atributos foram modificados. Se você quiser personalizar esse comportamento, você pode definir um método `searchIndexShouldBeUpdated` no seu modelo:

```php
/**
 * Determine if the search index should be updated.
 */
public function searchIndexShouldBeUpdated(): bool
{
    return $this->wasRecentlyCreated || $this->wasChanged(['title', 'body']);
}
```

<a id="removing-records"></a>
### Removendo Registros

Para remover um registro do seu índice, você pode simplesmente dar `delete` no modelo do banco de dados. Isso pode ser feito mesmo se você estiver usando modelos com [soft delete](/en/eloquent/#soft-deleting):

```php
use App\Models\Order;

$order = Order::find(1);

$order->delete();
```

Se você não quiser recuperar o modelo antes de excluir o registro, você pode usar o método `unsearchable` em uma instância de consulta Eloquent:

```php
Order::where('price', '>', 100)->unsearchable();
```

Se você quiser remover os registros do índice de pesquisa para todos os modelos em um relacionamento, você pode invocar o `unsearchable` na instância do relacionamento:

```php
$user->orders()->unsearchable();
```

Ou, se você já tiver uma coleção de modelos Eloquent em memória, você pode chamar o método `unsearchable` na instância da coleção para remover as instâncias de modelo do seu índice correspondente:

```php
$orders->unsearchable();
```

Para remover todos os registros do modelo do seu índice correspondente, você pode invocar o método `removeAllFromSearch`:

```php
Order::removeAllFromSearch();
```

<a id="pausing-indexing"></a>
### Pausando a Indexação

Às vezes, você pode precisar realizar um lote de operações Eloquent em um modelo sem sincronizar os dados do modelo com seu índice de pesquisa. Você pode fazer isso usando o método `withoutSyncingToSearch`. Esse método aceita uma única closure que será executada imediatamente. Quaisquer operações de modelo que ocorram dentro da closure não serão sincronizadas com o índice do modelo:

```php
use App\Models\Order;

Order::withoutSyncingToSearch(function () {
    // Perform model actions...
});
```

<a id="conditionally-searchable-model-instances"></a>
### Instâncias de Modelo Pesquisáveis Condicionalmente

Às vezes, você pode precisar tornar um modelo pesquisável apenas sob certas condições. Por exemplo, imagine que você tenha um modelo `App\Models\Post` que pode estar em um de dois estados: "draft" e "published". Você pode querer permitir que apenas posts "published" sejam pesquisáveis. Para fazer isso, você pode definir um método `shouldBeSearchable` no seu modelo:

```php
/**
 * Determine if the model should be searchable.
 */
public function shouldBeSearchable(): bool
{
    return $this->isPublished();
}
```

O método `shouldBeSearchable` só é aplicado ao manipular modelos através dos métodos `save` e `create`, consultas ou relacionamentos. Tornar modelos ou coleções pesquisáveis diretamente usando o método `searchable` sobrescreverá o resultado do método `shouldBeSearchable`.

> **Warning:**
> O método `shouldBeSearchable` não é aplicável ao usar a engine "database" do Scout, pois todos os dados pesquisáveis são sempre armazenados no banco de dados. Para obter um comportamento similar ao usar a engine de banco de dados, você deve usar [cláusulas where](#where-clauses).

<a id="searching"></a>
## Pesquisando

Você pode começar a pesquisar um modelo usando o método `search`. O método search aceita uma única string que será usada para pesquisar seus modelos. Você deve então encadear o método `get` à consulta de pesquisa para recuperar os modelos Eloquent que correspondem à consulta de pesquisa fornecida:

```php
use App\Models\Order;

$orders = Order::search('Star Trek')->get();
```

Como as pesquisas do Scout retornam uma coleção de modelos Eloquent, você pode até retornar os resultados diretamente de uma rota ou controller e eles serão automaticamente convertidos para JSON:

```php
use App\Models\Order;
use Illuminate\Http\Request;

Route::get('/search', function (Request $request) {
    return Order::search($request->search)->get();
});
```

Se você quiser obter os resultados de pesquisa brutos antes de serem convertidos em modelos Eloquent, você pode usar o método `raw`:

```php
$orders = Order::search('Star Trek')->raw();
```

<a id="semantic-search"></a>
### Pesquisa Semântica

As engines database, Meilisearch, Typesense e Turbopuffer suportam pesquisa semântica, que corresponde a registros com base no significado de uma consulta. Quando o Scout gera embeddings, as pesquisas semânticas e híbridas requerem o [Laravel AI SDK](/en/ai-sdk/). Os [embeddings nativos do Typesense](#typesense-embeddings), os [embeddings nativos do Turbopuffer](#turbopuffer-configuration) e os vetores de consulta pré-computados não requerem o Laravel AI SDK.

Após configurar os embeddings para a engine selecionada, invoque o método `semantic` em uma consulta de pesquisa:

```php
$articles = Article::search('staying cool in the summer')
    ->semantic()
    ->get();
```

Você pode fornecer um limite mínimo de similaridade quando suportado pela engine selecionada:

```php
$articles = Article::search('renewable energy storage')
    ->semantic(minSimilarity: 0.6)
    ->get();
```

Para combinar pesquisa full-text e semântica, use o método `hybrid`. Seus dois primeiros argumentos controlam os pesos relativos dos resultados de texto e semânticos:

```php
$articles = Article::search('renewable energy storage')
    ->hybrid(textWeight: 1, semanticWeight: 2)
    ->get();
```

<a id="custom-indexes"></a>
#### Índices Personalizados

Ao pesquisar usando engines de terceiros, as consultas de pesquisa normalmente serão realizadas no índice especificado pelo método [searchableAs](#configuring-model-indexes) do modelo. No entanto, você pode usar o método `within` para especificar um índice personalizado que deve ser pesquisado em vez disso:

```php
$orders = Order::search('Star Trek')
    ->within('tv_shows_popularity_desc')
    ->get();
```

<a id="where-clauses"></a>
### Cláusulas Where

O Scout permite que você adicione cláusulas "where" às suas consultas de pesquisa. Por exemplo, verificações básicas de igualdade são úteis para limitar as consultas de pesquisa por um ID de proprietário:

```php
use App\Models\Order;

$orders = Order::search('Star Trek')->where('user_id', 1)->get();
```

Você também pode usar os operadores de comparação `=`, `!=`, `<`, `>`, `>=`, `<=` para construir consultas mais avançadas:

```php
Order::search('Star Trek')
  ->where('status', '=', 'completed')
  ->where('is_refunded', '!=', true)
  ->where('total_price', '>', 100)
  ->where('shipping_cost', '<', 20)
  ->where('discount_percent', '>=', 10)
  ->where('item_count', '<=', 5)
  ->get();
```

Além disso, o método `whereIn` pode ser usado para verificar que o valor de uma determinada coluna está contido no array fornecido:

```php
$orders = Order::search('Star Trek')->whereIn(
    'status', ['open', 'paid']
)->get();
```

O método `whereNotIn` verifica que o valor da coluna fornecida não está contido no array fornecido:

```php
$orders = Order::search('Star Trek')->whereNotIn(
    'status', ['closed']
)->get();
```

> **Warning:**
> Se a sua aplicação estiver usando o Meilisearch, você deve configurar os [atributos filtráveis](#meilisearch-index-settings) da sua aplicação antes de utilizar as cláusulas "where" do Scout.

<a id="customizing-the-eloquent-results-query"></a>
#### Personalizando a Consulta de Resultados Eloquent

Depois que o Scout recupera uma lista de modelos Eloquent correspondentes do mecanismo de pesquisa da sua aplicação, o Eloquent é usado para recuperar todos os modelos correspondentes por suas chaves primárias. Você pode personalizar essa consulta invocando o método `query`. O método `query` aceita uma closure que receberá a instância do query builder do Eloquent como argumento:

```php
use App\Models\Order;
use Illuminate\Database\Eloquent\Builder;

$orders = Order::search('Star Trek')
    ->query(fn (Builder $query) => $query->with('invoices'))
    ->get();
```

Ao usar uma engine de terceiros, esse callback é invocado após os modelos relevantes já terem sido recuperados do mecanismo de pesquisa, portanto não deve ser usado para "filtrar" resultados — use as [cláusulas where do Scout](#where-clauses). No entanto, ao usar a engine de banco de dados, as restrições do método `query` são aplicadas diretamente à consulta de banco de dados, de modo que você também pode usá-lo para filtragem.

<a id="pagination"></a>
### Paginação

Além de recuperar uma coleção de modelos, você pode paginar seus resultados de pesquisa usando o método `paginate`. Esse método retornará uma instância de `Illuminate\Pagination\LengthAwarePaginator`, exatamente como se você tivesse [paginado uma consulta Eloquent tradicional](/en/pagination/):

```php
use App\Models\Order;

$orders = Order::search('Star Trek')->paginate();
```

Você pode especificar quantos modelos recuperar por página passando a quantidade como o primeiro argumento para o método `paginate`:

```php
$orders = Order::search('Star Trek')->paginate(15);
```

Ao usar a engine de banco de dados, você também pode usar o método `simplePaginate`. Diferentemente do `paginate`, que recupera o número total de registros correspondentes para poder exibir os números de página, o `simplePaginate` apenas determina se há mais resultados além da página atual — tornando-o mais eficiente para grandes conjuntos de dados onde você só precisa de links de "anterior" e "próximo":

```php
$orders = Order::search('Star Trek')->simplePaginate(15);
```

Uma vez que você tenha recuperado os resultados, você pode exibir os resultados e renderizar os links de página usando o [Blade](/en/blade/), exatamente como se você tivesse paginado uma consulta Eloquent tradicional:

```html
<div class="container">
    @foreach ($orders as $order)
        {{ $order->price }}
    @endforeach
</div>

{{ $orders->links() }}
```

Obviamente, se você quiser recuperar os resultados da paginação como JSON, você pode retornar a instância do paginator diretamente de uma rota ou controller:

```php
use App\Models\Order;
use Illuminate\Http\Request;

Route::get('/orders', function (Request $request) {
    return Order::search($request->input('query'))->paginate(15);
});
```

> **Warning:**
> Como os mecanismos de pesquisa não têm conhecimento das definições de global scope do seu modelo Eloquent, você não deve utilizar global scopes em aplicações que utilizam a paginação do Scout. Ou, você deve recriar as restrições do global scope ao pesquisar via Scout.

<a id="soft-deleting"></a>
### Soft Delete

Se os seus modelos indexados usam [soft delete](/en/eloquent/#soft-deleting) e você precisa pesquisar seus modelos com soft delete, defina a opção `soft_delete` do arquivo de configuração `config/scout.php` como `true`:

```php
'soft_delete' => true,
```

Quando essa opção de configuração for `true`, o Scout não removerá os modelos com soft delete do índice de pesquisa. Em vez disso, ele definirá um atributo oculto `__soft_deleted` no registro indexado. Então, você pode usar os métodos `withTrashed` ou `onlyTrashed` para recuperar os registros com soft delete ao pesquisar:

```php
use App\Models\Order;

// Include trashed records when retrieving results...
$orders = Order::search('Star Trek')->withTrashed()->get();

// Only include trashed records when retrieving results...
$orders = Order::search('Star Trek')->onlyTrashed()->get();
```

> **Note:**
> Quando um modelo com soft delete é permanentemente excluído usando `forceDelete`, o Scout o removerá do índice de pesquisa automaticamente.

<a id="customizing-engine-searches"></a>
### Personalizando as Pesquisas da Engine

Se você precisar realizar uma personalização avançada do comportamento de pesquisa de uma engine, você pode passar uma closure como o segundo argumento para o método `search`. Por exemplo, você poderia usar esse callback para adicionar dados de geolocalização às suas opções de pesquisa antes que a consulta de pesquisa seja passada ao Algolia:

```php
use Algolia\AlgoliaSearch\SearchIndex;
use App\Models\Order;

Order::search(
    'Star Trek',
    function (SearchIndex $algolia, string $query, array $options) {
        $options['body']['query']['bool']['filter']['geo_distance'] = [
            'distance' => '1000km',
            'location' => ['lat' => 36, 'lon' => 111],
        ];

        return $algolia->search($query, $options);
    }
)->get();
```

<a id="custom-engines"></a>
## Engines Personalizadas

<a id="writing-the-engine"></a>
#### Escrevendo a Engine

Se uma das engines de pesquisa integradas do Scout não atender às suas necessidades, você pode escrever sua própria engine personalizada e registrá-la com o Scout. Sua engine deve estender a classe abstrata `Laravel\Scout\Engines\Engine`. Essa classe abstrata contém oito métodos que sua engine personalizada deve implementar:

```php
use Laravel\Scout\Builder;

abstract public function update($models);
abstract public function delete($models);
abstract public function search(Builder $builder);
abstract public function paginate(Builder $builder, $perPage, $page);
abstract public function mapIds($results);
abstract public function map(Builder $builder, $results, $model);
abstract public function getTotalCount($results);
abstract public function flush($model);
```

Você pode achar útil revisar as implementações desses métodos na classe `Laravel\Scout\Engines\AlgoliaEngine`. Essa classe fornecerá a você um bom ponto de partida para aprender como implementar cada um desses métodos na sua própria engine.

<a id="registering-the-engine"></a>
#### Registrando a Engine

Uma vez que você tenha escrito sua engine personalizada, você pode registrá-la com o Scout usando o método `extend` do gerenciador de engines do Scout. O gerenciador de engines do Scout pode ser resolvido a partir do service container do Laravel. Você deve chamar o método `extend` a partir do método `boot` da sua classe `App\Providers\AppServiceProvider` ou qualquer outro service provider usado pela sua aplicação:

```php
use App\ScoutExtensions\MySqlSearchEngine;
use Laravel\Scout\EngineManager;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    resolve(EngineManager::class)->extend('mysql', function () {
        return new MySqlSearchEngine;
    });
}
```

Uma vez que sua engine tenha sido registrada, você pode especificá-la como seu `driver` padrão do Scout no arquivo de configuração `config/scout.php` da sua aplicação:

```php
'driver' => 'mysql',
```
