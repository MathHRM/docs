---
title: "Laravel Scout"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Instalación](#installation)
    - [Cola](#queueing)
- [Requisitos previos del controlador](#driver-prerequisites)
    - [Algolia](#algolia)
    - [Meilisearch](#meilisearch)
    - [Typesense](#typesense)
    - [Turbopuffer](#turbopuffer)
- [Configuración](#configuration)
    - [Configuración de datos de búsqueda](#configuring-searchable-data)
- [Base de datos/Motores de recopilación](#database-and-collection-engines)
    - [Motor de base de datos](#database-engine)
    - [Motor de colección](#collection-engine)
- [Configuración del motor de terceros](#third-party-engine-configuration)
    - [Configuración de índices de modelo](#configuring-model-indexes)
    - [Algolia](#algolia-configuration)
    - [Meilisearch](#meilisearch-configuration)
    - [Typesense](#typesense-configuration)
    - [Turbopuffer](#turbopuffer-configuration)
- [Indexación de motores de terceros](#indexing)
    - [Importación por lotes](#batch-import)
    - [Agregar registros](#adding-records)
    - [Actualización de registros](#updating-records)
    - [Eliminación de registros](#removing-records)
    - [Pausar indexación](#pausing-indexing)
    - [Instancias de modelo de búsqueda condicional](#conditionally-searchable-model-instances)
- [Buscando](#searching)
    - [Donde Cláusulas](#where-clauses)
    - [Búsqueda Semántica](#semantic-search)
    - [Paginación](#pagination)
    - [Eliminación suave](#soft-deleting)
    - [Personalizar búsquedas en el motor](#customizing-engine-searches)
- [Motores personalizados](#custom-engines)

<a id="introduction"></a>
## Introducción

[Laravel Scout](https://github.com/laravel/scout) proporciona una solución sencilla basada en controladores para agregar búsqueda de texto completo a sus [modelos Eloquent](../eloquent/). Utilizando observadores modelo, Scout mantendrá automáticamente sus índices de búsqueda sincronizados con sus registros de Eloquent.

Scout se entrega con un motor `database` incorporado que utiliza índices de texto completo MySQL/PostgreSQL y cláusulas `LIKE` para buscar en su base de datos existente, sin necesidad de servicios externos. Para la mayoría de las aplicaciones, esto es todo lo que necesita. Para obtener una descripción general de todas las opciones de búsqueda disponibles en Laravel, consulte la [documentación de búsqueda](../search/).

Scout también incluye controladores para [Algolia](https://www.algolia.com/), [Meilisearch](https://www.meilisearch.com), [Typesense](https://typesense.org) y [Turbopuffer](https://turbopuffer.com) cuando necesita funciones como tolerancia a errores tipográficos, filtrado por facetas, búsqueda de vectores o búsqueda geográfica a escala masiva. También está disponible un controlador de "colección" para el desarrollo local y usted también puede escribir [motores personalizados](#custom-engines).

<a id="installation"></a>
## Instalación

Primero, instale Scout a través del administrador de paquetes de Composer:

```shell
composer require laravel/scout
```

Después de instalar Scout, debe publicar el archivo de configuración de Scout usando el comando `vendor:publish` Artisan. Este comando publicará el archivo de configuración `scout.php` en el directorio `config` de su aplicación:

```shell
php artisan vendor:publish --provider="Laravel\Scout\ScoutServiceProvider"
```

Finalmente, agregue el rasgo `Laravel\Scout\Searchable` al modelo que desea que se pueda buscar. Este rasgo registrará un observador de modelo que automáticamente mantendrá el modelo sincronizado con su controlador de búsqueda:

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
### Cola

Cuando utilice un motor que no sea el motor `database` o `collection`, debería considerar seriamente configurar un [controlador de cola](../queues/) antes de usar la biblioteca. Ejecutar un trabajador de cola permitirá a Scout poner en cola todas las operaciones que sincronizan la información de su modelo con sus índices de búsqueda, proporcionando tiempos de respuesta mucho mejores para la interfaz web de su aplicación.

Una vez que haya configurado un controlador de cola, establezca el valor de la opción `queue` en su archivo de configuración `config/scout.php` en `true`:

```php
'queue' => true,
```

Incluso cuando la opción `queue` está configurada en `false`, es importante recordar que algunos controladores Scout como Algolia y Meilisearch siempre indexan registros de forma asincrónica. En otras palabras, aunque la operación de índice se haya completado dentro de su aplicación Laravel, es posible que el motor de búsqueda no refleje los registros nuevos y actualizados de inmediato.

Para especificar la conexión y la cola que utilizan sus trabajos de Scout, puede definir la opción de configuración `queue` como una matriz:

```php
'queue' => [
    'connection' => 'redis',
    'queue' => 'scout'
],
```

Por supuesto, si personaliza la conexión y la cola que utilizan los trabajos de Scout, debe ejecutar un trabajador de cola para procesar los trabajos en esa conexión y cola:

```shell
php artisan queue:work redis --queue=scout
```

<a id="unique-jobs"></a>
#### Trabajos únicos

En aplicaciones con mucha escritura, es posible que desee evitar que Scout ponga en cola trabajos duplicados para los mismos registros del modelo. Puede optar por trabajos de indexación únicos registrando las clases de trabajo `MakeSearchableUniquely` y `RemoveFromSearchUniquely`, generalmente dentro del método `boot` de un proveedor de servicios:

```php
use Laravel\Scout\Jobs\MakeSearchableUniquely;
use Laravel\Scout\Jobs\RemoveFromSearchUniquely;
use Laravel\Scout\Scout;

Scout::makeSearchableUsing(MakeSearchableUniquely::class);
Scout::removeFromSearchUsing(RemoveFromSearchUniquely::class);
```

Estos trabajos utilizan los [bloqueos de trabajo únicos](../queues/#unique-jobs) de Laravel para evitar enviar operaciones de indexación en cola duplicadas para los mismos registros de modelo con capacidad de búsqueda mientras un trabajo coincidente ya está en cola.

<a id="driver-prerequisites"></a>
## Requisitos previos del controlador

<a id="algolia"></a>
### Algolia

Cuando utilice el controlador Algolia, debe configurar sus credenciales Algolia `id` y `secret` en su archivo de configuración `config/scout.php`. Una vez que se hayan configurado sus credenciales, también deberá instalar el SDK PHP de Algolia a través del administrador de paquetes de Composer:

```shell
composer require algolia/algoliasearch-client-php
```

<a id="meilisearch"></a>
### Meilibúsqueda

[Meilisearch](https://www.meilisearch.com) es un motor de búsqueda rápido y de código abierto que admite búsquedas de texto completo, semánticas e híbridas. Si no está seguro de cómo instalar Meilisearch en su máquina local, puede usar [Laravel Sail](../sail/#meilisearch), el entorno de desarrollo Docker oficialmente compatible de Laravel. Para producción, puede [autohospedar](https://www.meilisearch.com/docs/learn/self_hosted/getting_started_with_self_hosted_meilisearch) Meilisearch o usar [Meilisearch Cloud](https://www.meilisearch.com/cloud).

Cuando utilice el controlador Meilisearch, deberá instalar el SDK PHP de Meilisearch a través del administrador de paquetes Composer:

```shell
composer require meilisearch/meilisearch-php http-interop/http-factory-guzzle
```

Luego, configure la variable de entorno `SCOUT_DRIVER`, así como sus credenciales de Meilisearch `host` y `key` dentro del archivo `.env` de su aplicación:

```ini
SCOUT_DRIVER=meilisearch
MEILISEARCH_HOST=http://127.0.0.1:7700
MEILISEARCH_KEY=masterKey
```

Para obtener más información sobre Meilisearch, consulte la [documentación de Meilisearch](https://www.meilisearch.com/docs/getting_started/overview).

<a id="typesense"></a>
### Sentido tipográfico

[Typesense](https://typesense.org) es un motor de búsqueda de código abierto ultrarrápido y admite búsqueda de palabras clave, búsqueda semántica, búsqueda geográfica y búsqueda de vectores.

Puedes [autohospedar](https://typesense.org/docs/guide/install-typesense.html#option-2-local-machine-self-hosting) Typesense o usar [Typesense Cloud](https://cloud.typesense.org).

Para comenzar a usar Typesense con Scout, instale el SDK PHP de Typesense a través del administrador de paquetes Composer:

```shell
composer require typesense/typesense-php
```

Luego, configure la variable de entorno `SCOUT_DRIVER`, así como su host Typesense y las credenciales de la clave API dentro del archivo .env de su aplicación:

```ini
SCOUT_DRIVER=typesense
TYPESENSE_API_KEY=masterKey
TYPESENSE_HOST=localhost
```

Si está utilizando [Laravel Sail](../sail/), es posible que deba ajustar la variable de entorno `TYPESENSE_HOST` para que coincida con el nombre del contenedor Docker. Opcionalmente, también puede especificar el puerto, la ruta y el protocolo de su instalación:

```ini
TYPESENSE_PORT=8108
TYPESENSE_PATH=
TYPESENSE_PROTOCOL=http
```

Puede encontrar configuraciones adicionales y definiciones de esquemas para sus colecciones de Typesense en el archivo de configuración `config/scout.php` de su aplicación. Para obtener más información sobre Typesense, consulte la [documentación de Typesense](https://typesense.org/docs/guide/#quick-start).

<a id="turbopuffer"></a>
### Turbopuffer

[Turbopuffer](https://turbopuffer.com) es un motor de búsqueda que admite búsquedas híbridas, semánticas y de texto completo. Para utilizar el controlador Turbopuffer, configure la variable de entorno `SCOUT_DRIVER` y proporcione su clave API Turbopuffer:

```ini
SCOUT_DRIVER=turbopuffer
TURBOPUFFER_API_KEY=tpuf_...
TURBOPUFFER_REGION=gcp-us-central1
```

La variable de entorno `TURBOPUFFER_REGION` es opcional y su valor predeterminado es `gcp-us-central1`.

<a id="configuration"></a>
## Configuración

<a id="configuring-searchable-data"></a>
### Configuración de datos que se pueden buscar

De forma predeterminada, el formulario `toArray` completo de un modelo determinado se conservará en su índice de búsqueda. Si desea personalizar los datos que se sincronizan con el índice de búsqueda, puede anular el método `toSearchableArray` en el modelo:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class Post extends Model
{
    use Searchable;

    /**
     * Obtener el array de datos indexables del modelo.
     *
     * @return array<string, mixed>
     */
    public function toSearchableArray(): array
    {
        $array = $this->toArray();

        // Personalizar el array de datos...

        return $array;
    }
}
```

<a id="configuring-search-engines-per-model"></a>
#### Configuración de motores de modelo

Al buscar, Scout normalmente utilizará el motor de búsqueda predeterminado especificado en el archivo de configuración `scout` de su aplicación. Sin embargo, el motor de búsqueda de un modelo en particular se puede cambiar anulando el método `searchableUsing` en el modelo:

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
     * Obtener el engine usado para indexar el modelo.
     */
    public function searchableUsing(): Engine
    {
        return Scout::engine('meilisearch');
    }
}
```

<a id="database-and-collection-engines"></a>
## Motores de base de datos/recopilación

<a id="database-engine"></a>
### Motor de base de datos

> **Advertencia:**
> El motor de base de datos actualmente admite MySQL y PostgreSQL, los cuales brindan soporte para una indexación rápida de columnas de texto completo.

El motor `database` utiliza índices de texto completo MySQL/PostgreSQL y cláusulas `LIKE` para buscar directamente en su base de datos existente. Para muchas aplicaciones, esta es la forma más sencilla y práctica de agregar búsqueda: no se requiere ningún servicio externo ni infraestructura adicional.

Para utilizar el motor de base de datos, establezca la variable de entorno `SCOUT_DRIVER` en `database`:

```ini
SCOUT_DRIVER=database
```

Una vez configurado, puede [definir sus datos de búsqueda](#configuring-searchable-data) y comenzar [ejecutar consultas de búsqueda](#searching) en sus modelos. A diferencia de los motores de terceros, el motor de base de datos no requiere ningún paso de indexación por separado: busca directamente en las tablas de su base de datos.

<a id="database-semantic-and-hybrid-search"></a>
#### Búsqueda semántica e híbrida

El motor de base de datos admite búsqueda semántica e híbrida cuando se utiliza PostgreSQL con la extensión `pgvector`. Para comenzar, agregue una columna de vector que acepte valores NULL y un índice de texto completo a la tabla de su modelo. La columna del vector debe aceptar valores NULL porque Scout almacena la incrustación después de que el modelo haya persistido:

```php
Schema::ensureVectorExtensionExists();

Schema::table('articles', function (Blueprint $table) {
    // ...

    $table->vector('embedding', dimensions: 1536)->nullable();
    $table->vectorIndex('embedding');
    $table->fullText(['title', 'body']);
});
```

A continuación, defina un método `toSearchableEmbedding` en el modelo. Este método puede devolver el texto fuente que Scout debería incrustar o una matriz de incrustación precalculada. Scout almacena las incrustaciones en la columna `embedding` de forma predeterminada; para utilizar otra columna, defina un método `searchableEmbeddingColumn` en el modelo.

#### Personalización de estrategias de búsqueda en bases de datos

De forma predeterminada, el motor de base de datos ejecutará una consulta `LIKE` contra cada atributo del modelo que haya [configurado como searchable](#configuring-searchable-data). Sin embargo, puede asignar estrategias de búsqueda más eficientes a columnas específicas. El atributo `SearchUsingFullText` utilizará el índice de texto completo de su base de datos para esa columna, mientras que `SearchUsingPrefix` solo coincidirá con el comienzo de las cadenas (`example%`) en lugar de buscar dentro de la cadena completa (`%example%`).

Para definir este comportamiento, asigne atributos PHP al método `toSearchableArray` de su modelo. Cualquier columna sin un atributo seguirá utilizando la estrategia predeterminada `LIKE`:

```php
use Laravel\Scout\Attributes\SearchUsingFullText;
use Laravel\Scout\Attributes\SearchUsingPrefix;

/**
 * Obtener el array de datos indexables del modelo.
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

> **Advertencia:**
> Antes de especificar que una columna debe utilizar restricciones de consulta de texto completo, asegúrese de que a la columna se le haya asignado un [índice de texto completo](../migrations/#available-index-types).

<a id="collection-engine"></a>
### Motor de recopilación

El motor de "colección" está destinado a prototipos rápidos, conjuntos de datos extremadamente pequeños (unos pocos cientos de registros) o pruebas en ejecución. Recupera todos los registros posibles de su base de datos y utiliza el asistente `Str::is` de Laravel para filtrarlos en PHP, por lo que no requiere ninguna indexación ni funciones específicas de la base de datos. Para cualquier cosa que vaya más allá de los casos de uso triviales, debe utilizar el [motor de base de datos](#database-engine) en su lugar.

Para utilizar el motor de recopilación, simplemente puede establecer el valor de la variable de entorno `SCOUT_DRIVER` en `collection`, o especificar el controlador `collection` directamente en el archivo de configuración `scout` de su aplicación:

```ini
SCOUT_DRIVER=collection
```

Una vez que haya especificado el controlador de colección como su controlador preferido, puede comenzar a [ejecutar consultas de búsqueda](#searching) en sus modelos. La indexación de motores de búsqueda, como la indexación necesaria para generar índices de Algolia, Meilisearch o Typesense, no es necesaria cuando se utiliza el motor de recopilación.

#### Diferencias con el motor de base de datos

Mientras que el motor de base de datos utiliza índices de texto completo y cláusulas `LIKE` para encontrar registros coincidentes de manera eficiente, el motor de recopilación extrae todos los registros y los filtra en PHP. El motor de recopilación es la opción más portátil, ya que funciona en todas las bases de datos relacionales compatibles con Laravel (incluidos SQLite y SQL Server); sin embargo, es significativamente menos eficiente que el motor de base de datos y no debe usarse con conjuntos de datos grandes.

<a id="third-party-engine-configuration"></a>
## Configuración del motor de terceros

Las siguientes opciones de configuración sólo son relevantes cuando se utiliza un motor de búsqueda de terceros como Algolia, Meilisearch o Typesense. Si está utilizando el [motor de base de datos](#database-engine), puede omitir esta sección.

<a id="configuring-model-indexes"></a>
### Configuración de índices de modelo

Cuando se utiliza un motor de terceros, cada modelo de Eloquent se sincroniza con un "índice" de búsqueda determinado, que contiene todos los registros buscables para ese modelo. De forma predeterminada, cada modelo persistirá en un índice que coincida con el nombre de "tabla" típico del modelo. Normalmente, ésta es la forma plural del nombre del modelo; sin embargo, puede personalizar el índice del modelo anulando el método `searchableAs` en el modelo:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class Post extends Model
{
    use Searchable;

    /**
     * Obtener el nombre del índice asociado al modelo.
     */
    public function searchableAs(): string
    {
        return 'posts_index';
    }
}
```

> **Nota:**
> El método `searchableAs` no tiene ningún efecto cuando se utiliza el motor de base de datos, que siempre busca directamente en la tabla de la base de datos del modelo.

<a id="configuring-the-model-id"></a>
#### Configuración de la ID del modelo

De forma predeterminada, Scout utilizará la clave principal del modelo como ID/clave única del modelo que se almacena en el índice de búsqueda. Si necesita personalizar este comportamiento cuando utiliza un motor de terceros, puede anular los métodos `getScoutKey` y `getScoutKeyName` en el modelo:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class User extends Model
{
    use Searchable;

    /**
     * Obtener el valor usado para indexar el modelo.
     */
    public function getScoutKey(): mixed
    {
        return $this->email;
    }

    /**
     * Obtener el nombre de clave usado para indexar el modelo.
     */
    public function getScoutKeyName(): mixed
    {
        return 'email';
    }
}
```

> **Nota:**
> Los métodos `getScoutKey` y `getScoutKeyName` no tienen efecto cuando se utiliza el motor de base de datos, que siempre utiliza la clave primaria del modelo.

<a id="algolia-configuration"></a>
### Algolia

<a id="algolia-index-settings"></a>
#### Configuración de índice

A veces es posible que desee configurar ajustes adicionales en sus índices de Algolia. Si bien puede administrar estas configuraciones a través de la interfaz de usuario de Algolia, a veces es más eficiente administrar el estado deseado de la configuración de su índice directamente desde el archivo de configuración `config/scout.php` de su aplicación.

Este enfoque le permite implementar estas configuraciones a través del proceso de implementación automatizada de su aplicación, evitando la configuración manual y garantizando la coherencia en múltiples entornos. Puede configurar atributos filtrables, clasificación, facetas o [cualquier otra configuración admitida](https://www.algolia.com/doc/rest-api/search/#tag/Indices/operation/setSettings).

Para comenzar, agregue configuraciones para cada índice en el archivo de configuración `config/scout.php` de su aplicación:

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

Si el modelo subyacente a un índice determinado se puede eliminar temporalmente y está incluido en la matriz `index-settings`, Scout incluirá automáticamente soporte para facetado en modelos eliminados temporalmente en ese índice. Si no tiene otros atributos de facetas que definir para un índice de modelo eliminable temporalmente, puede simplemente agregar una entrada vacía a la matriz `index-settings` para ese modelo:

```php
'index-settings' => [
    Flight::class => []
],
```

Después de configurar los ajustes de índice de su aplicación, debe invocar el comando `scout:sync-index-settings` Artisan. Este comando informará a Algolia sobre la configuración de índice configurada actualmente. Para su comodidad, es posible que desee que este comando forme parte de su proceso de implementación:

```shell
php artisan scout:sync-index-settings
```

<a id="algolia-identifying-users"></a>
#### Identificación de usuarios

Scout le permite identificar automáticamente a los usuarios cuando usa Algolia. Asociar al usuario autenticado con operaciones de búsqueda puede resultar útil al visualizar sus análisis de búsqueda en el panel de Algolia. Puede habilitar la identificación de usuarios definiendo una variable de entorno `SCOUT_IDENTIFY` como `true` en el archivo `.env` de su aplicación:

```ini
SCOUT_IDENTIFY=true
```

Al habilitar esta función también se pasará la dirección IP de la solicitud y el identificador principal de su usuario autenticado a Algolia para que estos datos se asocien con cualquier solicitud de búsqueda realizada por el usuario.

<a id="meilisearch-configuration"></a>
### Meilibúsqueda

<a id="meilisearch-index-settings"></a>
#### Configuración de índice

Meilisearch requiere que usted predefina configuraciones de búsqueda de índice, como atributos filtrables, atributos ordenables y [otros campos de configuración admitidos](https://docs.meilisearch.com/reference/api/settings.html).

Los atributos filtrables son cualquier atributo que planea filtrar al invocar el método `where` de Scout, mientras que los atributos ordenables son cualquier atributo por el que planea ordenar al invocar el método `orderBy` de Scout. Para definir la configuración de su índice, ajuste la parte `index-settings` de su entrada de configuración `meilisearch` en el archivo de configuración `scout` de su aplicación:

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

Si el modelo subyacente a un índice determinado se puede eliminar temporalmente y está incluido en la matriz `index-settings`, Scout incluirá automáticamente soporte para filtrar modelos eliminados temporalmente en ese índice. Si no tiene otros atributos filtrables u ordenables para definir para un índice de modelo eliminable temporalmente, puede simplemente agregar una entrada vacía a la matriz `index-settings` para ese modelo:

```php
'index-settings' => [
    Flight::class => []
],
```

Después de configurar los ajustes de índice de su aplicación, debe invocar el comando `scout:sync-index-settings` Artisan. Este comando informará a Meilisearch sobre la configuración de índice configurada actualmente. Para su comodidad, es posible que desee que este comando forme parte de su proceso de implementación:

```shell
php artisan scout:sync-index-settings
```

<a id="meilisearch-semantic-and-hybrid-search"></a>
#### Búsqueda semántica e híbrida

Para utilizar la búsqueda semántica o híbrida con Meilisearch, configure un incrustador en la configuración del índice y la configuración de incrustación para cada modelo con capacidad de búsqueda:

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

El método `toSearchableEmbedding` del modelo puede devolver texto fuente, que Scout incrusta utilizando [Laravel AI SDK](../ai-sdk/), o una matriz de incrustación precalculada. Después de actualizar la configuración, ejecute el comando `scout:sync-index-settings`.

Alternativamente, puede utilizar las incrustaciones nativas de Meilisearch configurando la incrustación `driver` en `meilisearch`. En este modo, Meilisearch genera incrustaciones de documentos y consultas utilizando el incrustador configurado, por lo que no se requieren la opción `dimensions` ni el método `toSearchableEmbedding`:

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

Cuando se utilizan incrustaciones nativas, Scout no generará ni agregará vectores a los documentos indexados. Aún puede proporcionar un vector de consulta precalculado utilizando la opción de búsqueda `vector`. Al igual que con otras configuraciones de índice, ejecute el comando `scout:sync-index-settings` después de actualizar la configuración del incrustador.

Para obtener más información sobre las fuentes de integración disponibles y sus opciones, consulte la [documentación de búsqueda híbrida de Meilisearch](https://www.meilisearch.com/docs/capabilities/hybrid_search/getting_started).

<a id="meilisearch-data-types"></a>
#### Tipos de datos que se pueden buscar

Meilisearch solo realizará operaciones de filtrado (`>`, `<`, etc.) en datos del tipo correcto. Al personalizar sus datos de búsqueda, debe asegurarse de que los valores numéricos se conviertan en su tipo correcto:

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
### Sentido tipográfico

<a id="typesense-searchable-data"></a>
#### Preparación de datos que se pueden buscar

Al utilizar Typesense, sus modelos de búsqueda deben definir un método `toSearchableArray` que convierta la clave principal de su modelo en una cadena y la fecha de creación en una marca de tiempo UNIX:

```php
/**
 * Obtener el array de datos indexables del modelo.
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

También debe definir sus esquemas de colección Typesense en el archivo `config/scout.php` de su aplicación. Un esquema de colección describe los tipos de datos de cada campo que se puede buscar a través de Typesense. Para obtener más información sobre todas las opciones de esquema disponibles, consulte la [documentación de Typesense](https://typesense.org/docs/latest/api/collections.html#schema-parameters).

Si necesita cambiar el esquema de su colección Typesense después de haberlo definido, puede ejecutar `scout:flush` y `scout:import`, que eliminarán todos los datos indexados existentes y recrearán el esquema. O puede utilizar la API de Typesense para modificar el esquema de la colección sin eliminar ningún dato indexado.

Si su modelo de búsqueda se puede eliminar temporalmente, debe definir un campo `__soft_deleted` en el esquema Typesense correspondiente del modelo dentro del archivo de configuración `config/scout.php` de su aplicación:

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
#### Incrustaciones

Para habilitar la búsqueda semántica e híbrida, defina una configuración `embedding` y un campo vectorial en la configuración Typesense del modelo. De forma predeterminada, Scout usa [Laravel AI SDK](../ai-sdk/) para generar incrustaciones:

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

El método `toSearchableEmbedding` de su modelo debería devolver el texto fuente que Scout debería incrustar o una matriz de incrustación precalculada:

```php
public function toSearchableEmbedding(): string|array
{
    return $this->title.' '.$this->body;
}
```

<a id="typesense-dynamic-search-parameters"></a>
#### Parámetros de búsqueda dinámica

Typesense le permite modificar sus [parámetros de búsqueda](https://typesense.org/docs/latest/api/search.html#search-parameters) dinámicamente al realizar una operación de búsqueda mediante el método `options`:

```php
use App\Models\Todo;

Todo::search('Groceries')->options([
    'query_by' => 'title, description'
])->get();
```

<a id="turbopuffer-configuration"></a>
### Turbopuffer

Turbopuffer requiere un esquema y atributos de búsqueda para cada modelo. Defínalos en la matriz `model-settings` de su configuración `turbopuffer` dentro del archivo de configuración `scout`:

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

Los valores numéricos asignados a `searchable-attributes` son pesos relativos BM25. En el ejemplo anterior, las coincidencias en el título del artículo aportan tres veces la puntuación de las coincidencias en el cuerpo.

Para habilitar la búsqueda semántica e híbrida, agregue una configuración `embedding` y un esquema vectorial a la configuración del modelo:

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

El método `toSearchableEmbedding` de su modelo debería devolver el texto fuente que Scout debería incrustar o una matriz de incrustación precalculada. Scout genera incrustaciones de texto fuente utilizando [Laravel AI SDK](../ai-sdk/).

Alternativamente, puede usar las incrustaciones nativas de Turbopuffer sin instalar el SDK de Laravel AI o definir un método `toSearchableEmbedding`. Establezca el controlador de incorporación en `turbopuffer` y configure un esquema `embed` en el atributo de origen con capacidad de búsqueda:

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

El atributo de origen debe incluirse en la salida `toSearchableArray` del modelo.

<a id="indexing"></a>
## Indexación de motores de terceros

> **Nota:**
> Las funciones de indexación descritas en esta sección son principalmente relevantes cuando se utiliza un motor de terceros (Algolia, Meilisearch, Typesense o Turbopuffer). El motor de base de datos busca directamente en las tablas de su base de datos, por lo que no requiere gestión manual de índices.

<a id="batch-import"></a>
### Importación por lotes

Si está instalando Scout en un proyecto existente, es posible que ya tenga registros de base de datos que necesite importar a sus índices. Scout proporciona un comando `scout:import` Artisan que puede utilizar para importar todos sus registros existentes en sus índices de búsqueda:

```shell
php artisan scout:import "App\Models\Post"
```

El comando `scout:queue-import` se puede utilizar para importar todos sus registros existentes usando [trabajos en cola](../queues/):

```shell
php artisan scout:queue-import "App\Models\Post" --chunk=500
```

El comando `flush` se puede utilizar para eliminar todos los registros de un modelo de sus índices de búsqueda:

```shell
php artisan scout:flush "App\Models\Post"
```

<a id="modifying-the-import-query"></a>
#### Modificación de la consulta de importación

Si desea modificar la consulta que se utiliza para recuperar todos sus modelos para la importación por lotes, puede definir un método `makeAllSearchableUsing` en su modelo. Este es un gran lugar para agregar cualquier carga de relaciones que pueda ser necesaria antes de importar sus modelos:

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

> **Advertencia:**
> Es posible que el método `makeAllSearchableUsing` no sea aplicable cuando se utiliza una cola para importar modelos por lotes. Las relaciones [no se restauran](../queues/#handling-relationships) cuando los trabajos procesan las colecciones de modelos.

<a id="adding-records"></a>
### Agregar registros

Una vez que haya agregado el rasgo `Laravel\Scout\Searchable` a un modelo, todo lo que necesita hacer es `save` o `create` una instancia de modelo y se agregará automáticamente a su índice de búsqueda. Si ha configurado Scout para [usar colas](#queueing), su trabajador de cola realizará esta operación en segundo plano:

```php
use App\Models\Order;

$order = new Order;

// ...

$order->save();
```

<a id="adding-records-via-query"></a>
#### Agregar registros mediante consulta

Si desea agregar una colección de modelos a su índice de búsqueda mediante una consulta Eloquent, puede encadenar el método `searchable` en la consulta Eloquent. El método `searchable` [fragmentará los resultados](../eloquent/#chunking-results) de la consulta y agregará los registros a su índice de búsqueda. Nuevamente, si ha configurado Scout para usar colas, sus trabajadores de cola importarán todos los fragmentos en segundo plano:

```php
use App\Models\Order;

Order::where('price', '>', 100)->searchable();
```

También puedes llamar al método `searchable` en una instancia de relación Eloquent:

```php
$user->orders()->searchable();
```

O, si ya tiene una colección de modelos Eloquent en la memoria, puede llamar al método `searchable` en la instancia de la colección para agregar las instancias del modelo a su índice correspondiente:

```php
$orders->searchable();
```

> **Nota:**
> El método `searchable` puede considerarse una operación "upsert". En otras palabras, si el registro del modelo ya está en su índice, se actualizará. Si no existe en el índice de búsqueda, se agregará al índice.

<a id="updating-records"></a>
### Actualización de registros

Para actualizar un modelo con capacidad de búsqueda, solo necesita actualizar las propiedades de la instancia del modelo y `save` el modelo en su base de datos. Scout persistirá automáticamente los cambios en su índice de búsqueda:

```php
use App\Models\Order;

$order = Order::find(1);

// Actualizar el pedido...

$order->save();
```

También puede invocar el método `searchable` en una instancia de consulta de Eloquent para actualizar una colección de modelos. Si los modelos no existen en su índice de búsqueda, se crearán:

```php
Order::where('price', '>', 100)->searchable();
```

Si desea actualizar los registros del índice de búsqueda para todos los modelos en una relación, puede invocar `searchable` en la instancia de la relación:

```php
$user->orders()->searchable();
```

O, si ya tiene una colección de modelos Eloquent en la memoria, puede llamar al método `searchable` en la instancia de la colección para actualizar las instancias del modelo en su índice correspondiente:

```php
$orders->searchable();
```

<a id="modifying-records-before-importing"></a>
#### Modificar registros antes de importar

A veces es posible que necesite preparar la colección de modelos antes de que se puedan realizar búsquedas. Por ejemplo, es posible que desee cargar una relación para que los datos de la relación se puedan agregar de manera eficiente a su índice de búsqueda. Para lograr esto, defina un método `makeSearchableUsing` en el modelo correspondiente:

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
#### Actualización condicional del índice de búsqueda

De forma predeterminada, Scout reindexará un modelo actualizado independientemente de los atributos que se modificaron. Si desea personalizar este comportamiento, puede definir un método `searchIndexShouldBeUpdated` en su modelo:

```php
/**
 * Determinar si se debe actualizar el índice de búsqueda.
 */
public function searchIndexShouldBeUpdated(): bool
{
    return $this->wasRecentlyCreated || $this->wasChanged(['title', 'body']);
}
```

<a id="removing-records"></a>
### Eliminación de registros

Para eliminar un registro de su índice, simplemente puede `delete` el modelo de la base de datos. Esto se puede hacer incluso si está utilizando [modelos ](../eloquent/#soft-deleting) eliminados temporalmente:

```php
use App\Models\Order;

$order = Order::find(1);

$order->delete();
```

Si no desea recuperar el modelo antes de eliminar el registro, puede utilizar el método `unsearchable` en una instancia de consulta de Eloquent:

```php
Order::where('price', '>', 100)->unsearchable();
```

Si desea eliminar los registros del índice de búsqueda para todos los modelos en una relación, puede invocar `unsearchable` en la instancia de la relación:

```php
$user->orders()->unsearchable();
```

O, si ya tiene una colección de modelos Eloquent en la memoria, puede llamar al método `unsearchable` en la instancia de la colección para eliminar las instancias del modelo de su índice correspondiente:

```php
$orders->unsearchable();
```

Para eliminar todos los registros del modelo de su índice correspondiente, puede invocar el método `removeAllFromSearch`:

```php
Order::removeAllFromSearch();
```

<a id="pausing-indexing"></a>
### Pausar la indexación

A veces es posible que necesites realizar un lote de operaciones de Eloquent en un modelo sin sincronizar los datos del modelo con tu índice de búsqueda. Puede hacer esto usando el método `withoutSyncingToSearch`. Este método acepta una función anónima única que se ejecutará inmediatamente. Cualquier operación de modelo que ocurra dentro de la función anónima no se sincronizará con el índice del modelo:

```php
use App\Models\Order;

Order::withoutSyncingToSearch(function () {
    // Perform model actions...
});
```

<a id="conditionally-searchable-model-instances"></a>
### Instancias de modelo con capacidad de búsqueda condicional

A veces es posible que necesites hacer que un modelo solo se pueda buscar bajo ciertas condiciones. Por ejemplo, imagine que tiene el modelo `App\Models\Post` que puede estar en uno de dos estados: "borrador" y "publicado". Es posible que solo quieras permitir que se puedan buscar publicaciones "publicadas". Para lograr esto, puede definir un método `shouldBeSearchable` en su modelo:

```php
/**
 * Determinar si el modelo se debe poder buscar.
 */
public function shouldBeSearchable(): bool
{
    return $this->isPublished();
}
```

El método `shouldBeSearchable` solo se aplica cuando se manipulan modelos a través de los métodos, consultas o relaciones `save` y `create`. Hacer que se puedan buscar modelos o colecciones directamente utilizando el método `searchable` anulará el resultado del método `shouldBeSearchable`.

> **Advertencia:**
> El método `shouldBeSearchable` no es aplicable cuando se utiliza el motor de "base de datos" de Scout, ya que todos los datos que se pueden buscar siempre se almacenan en la base de datos. Para lograr un comportamiento similar al utilizar el motor de base de datos, debe utilizar las cláusulas [where](#where-clauses) en su lugar.

<a id="searching"></a>
## Buscando

Puede comenzar a buscar un modelo utilizando el método `search`. El método de búsqueda acepta una sola cadena que se utilizará para buscar sus modelos. Luego debes encadenar el método `get` en la consulta de búsqueda para recuperar los modelos Eloquent que coinciden con la consulta de búsqueda dada:

```php
use App\Models\Order;

$orders = Order::search('Star Trek')->get();
```

Dado que las búsquedas de Scout devuelven una colección de modelos Eloquent, incluso puedes devolver los resultados directamente desde una ruta o controlador y se convertirán automáticamente a JSON:

```php
use App\Models\Order;
use Illuminate\Http\Request;

Route::get('/search', function (Request $request) {
    return Order::search($request->search)->get();
});
```

Si desea obtener los resultados de búsqueda sin procesar antes de convertirlos a modelos Eloquent, puede utilizar el método `raw`:

```php
$orders = Order::search('Star Trek')->raw();
```

<a id="semantic-search"></a>
### Búsqueda semántica

La base de datos, los motores Meilisearch, Typesense y Turbopuffer admiten la búsqueda semántica, que relaciona registros según el significado de una consulta. Cuando Scout genera incrustaciones, las búsquedas semánticas e híbridas requieren [Laravel AI SDK](../ai-sdk/). [Las incrustaciones nativas de Typesense](#typesense-embeddings), [las incrustaciones nativas de Turbopuffer](#turbopuffer-configuration) y los vectores de consulta precalculados no requieren el SDK de AI de Laravel.

Después de configurar las incrustaciones para el motor seleccionado, invoque el método `semantic` en una consulta de búsqueda:

```php
$articles = Article::search('staying cool in the summer')
    ->semantic()
    ->get();
```

Puede proporcionar un umbral mínimo de similitud cuando lo admita el motor seleccionado:

```php
$articles = Article::search('renewable energy storage')
    ->semantic(minSimilarity: 0.6)
    ->get();
```

Para combinar la búsqueda semántica y de texto completo, utilice el método `hybrid`. Sus dos primeros argumentos controlan los pesos relativos del texto y los resultados semánticos:

```php
$articles = Article::search('renewable energy storage')
    ->hybrid(textWeight: 1, semanticWeight: 2)
    ->get();
```

<a id="custom-indexes"></a>
#### Índices personalizados

Cuando se realizan búsquedas utilizando motores de terceros, las consultas de búsqueda normalmente se realizarán en el índice especificado por el método [searchableAs](#configuring-model-indexes) del modelo. Sin embargo, puede utilizar el método `within` para especificar un índice personalizado en el que se debe buscar:

```php
$orders = Order::search('Star Trek')
    ->within('tv_shows_popularity_desc')
    ->get();
```

<a id="where-clauses"></a>
### Cláusulas Dónde

Scout le permite agregar cláusulas "dónde" a sus consultas de búsqueda. Por ejemplo, las comprobaciones de igualdad básicas son útiles para determinar el alcance de las consultas de búsqueda según el ID del propietario:

```php
use App\Models\Order;

$orders = Order::search('Star Trek')->where('user_id', 1)->get();
```

También puede utilizar los operadores de comparación `=`, `!=`, `<`, `>`, `>=`, `<=` para crear consultas más avanzadas:

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

Además, se puede utilizar el método `whereIn` para verificar que el valor de una columna determinada esté contenido dentro de la matriz determinada:

```php
$orders = Order::search('Star Trek')->whereIn(
    'status', ['open', 'paid']
)->get();
```

El método `whereNotIn` verifica que el valor de la columna dada no esté contenido en la matriz dada:

```php
$orders = Order::search('Star Trek')->whereNotIn(
    'status', ['closed']
)->get();
```

> **Advertencia:**
> Si su aplicación utiliza Meilisearch, debe configurar los [atributos filtrables](#meilisearch-index-settings) de su aplicación antes de utilizar las cláusulas "dónde" de Scout.

<a id="customizing-the-eloquent-results-query"></a>
#### Personalización de la consulta de resultados elocuentes

Después de que Scout recupera una lista de modelos Eloquent coincidentes del motor de búsqueda de su aplicación, Eloquent se utiliza para recuperar todos los modelos coincidentes por sus claves principales. Puede personalizar esta consulta invocando el método `query`. El método `query` acepta una función anónima que recibirá la instancia del generador de consultas Eloquent como argumento:

```php
use App\Models\Order;
use Illuminate\Database\Eloquent\Builder;

$orders = Order::search('Star Trek')
    ->query(fn (Builder $query) => $query->with('invoices'))
    ->get();
```

Cuando se utiliza un motor de terceros, esta devolución de llamada se invoca después de que los modelos relevantes ya se hayan recuperado del motor de búsqueda, por lo que no debe usarse para "filtrar" resultados; use las cláusulas [Scout donde](#where-clauses) en su lugar. Sin embargo, cuando se utiliza el motor de base de datos, las restricciones del método `query` se aplican directamente a la consulta de la base de datos, por lo que también puede usarlo para filtrar.

<a id="pagination"></a>
### Paginación

Además de recuperar una colección de modelos, puede paginar los resultados de su búsqueda utilizando el método `paginate`. Este método devolverá una instancia `Illuminate\Pagination\LengthAwarePaginator` como si hubiera [paginado una consulta tradicional de Eloquent](../pagination/):

```php
use App\Models\Order;

$orders = Order::search('Star Trek')->paginate();
```

Puede especificar cuántos modelos recuperar por página pasando la cantidad como primer argumento al método `paginate`:

```php
$orders = Order::search('Star Trek')->paginate(15);
```

Cuando utilice el motor de base de datos, también puede utilizar el método `simplePaginate`. A diferencia de `paginate`, que recupera el número total de registros coincidentes para poder mostrar números de página, `simplePaginate` solo determina si hay más resultados más allá de la página actual, lo que lo hace más eficiente para conjuntos de datos grandes donde solo se necesitan enlaces "anteriores" y "siguientes":

```php
$orders = Order::search('Star Trek')->simplePaginate(15);
```

Una vez que haya recuperado los resultados, puede mostrar los resultados y representar los enlaces de la página usando [Blade](../blade/) como si hubiera paginado una consulta tradicional de Eloquent:

```html
<div class="container">
    @foreach ($orders as $order)
        {{ $order->price }}
    @endforeach
</div>

{{ $orders->links() }}
```

Por supuesto, si desea recuperar los resultados de la paginación como JSON, puede devolver la instancia del paginador directamente desde una ruta o controlador:

```php
use App\Models\Order;
use Illuminate\Http\Request;

Route::get('/orders', function (Request $request) {
    return Order::search($request->input('query'))->paginate(15);
});
```

> **Advertencia:**
> Dado que los motores de búsqueda no conocen las definiciones de alcance global de su modelo Eloquent, no debe utilizar alcances globales en aplicaciones que utilizan paginación Scout. O debería recrear las restricciones del alcance global cuando realice búsquedas a través de Scout.

<a id="soft-deleting"></a>
### Eliminación suave

Si sus modelos indexados son [eliminación temporal](../eloquent/#soft-deleting) y necesita buscar sus modelos eliminados temporalmente, configure la opción `soft_delete` del archivo de configuración `config/scout.php` en `true`:

```php
'soft_delete' => true,
```

Cuando esta opción de configuración es `true`, Scout no eliminará los modelos eliminados temporalmente del índice de búsqueda. En su lugar, establecerá un atributo `__soft_deleted` oculto en el registro indexado. Luego, puede utilizar los métodos `withTrashed` o `onlyTrashed` para recuperar los registros eliminados temporalmente durante la búsqueda:

```php
use App\Models\Order;

// Include trashed records when retrieving results...
$orders = Order::search('Star Trek')->withTrashed()->get();

// Only include trashed records when retrieving results...
$orders = Order::search('Star Trek')->onlyTrashed()->get();
```

> **Nota:**
> Cuando un modelo eliminado temporalmente se elimina permanentemente usando `forceDelete`, Scout lo eliminará automáticamente del índice de búsqueda.

<a id="customizing-engine-searches"></a>
### Personalización de las búsquedas en el motor

Si necesita realizar una personalización avanzada del comportamiento de búsqueda de un motor, puede pasar una función anónima como segundo argumento del método `search`. Por ejemplo, podría utilizar esta devolución de llamada para agregar datos de ubicación geográfica a sus opciones de búsqueda antes de que la consulta de búsqueda se pase a Algolia:

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
## Motores personalizados

<a id="writing-the-engine"></a>
#### Escribiendo el motor

Si uno de los motores de búsqueda integrados de Scout no se adapta a sus necesidades, puede escribir su propio motor personalizado y registrarlo en Scout. Su motor debería ampliar la clase abstracta `Laravel\Scout\Engines\Engine`. Esta clase abstracta contiene ocho métodos que su motor personalizado debe implementar:

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

Puede resultarle útil revisar las implementaciones de estos métodos en la clase `Laravel\Scout\Engines\AlgoliaEngine`. Esta clase le proporcionará un buen punto de partida para aprender cómo implementar cada uno de estos métodos en su propio motor.

<a id="registering-the-engine"></a>
#### Registro del motor

Una vez que haya escrito su motor personalizado, puede registrarlo con Scout utilizando el método `extend` del administrador de motores Scout. El administrador del motor de Scout se puede resolver desde el contenedor de servicios de Laravel. Debes llamar al método `extend` desde el método `boot` de tu clase `App\Providers\AppServiceProvider` o cualquier otro proveedor de servicios utilizado por tu aplicación:

```php
use App\ScoutExtensions\MySqlSearchEngine;
use Laravel\Scout\EngineManager;

/**
 * Inicializar los servicios de la aplicación.
 */
public function boot(): void
{
    resolve(EngineManager::class)->extend('mysql', function () {
        return new MySqlSearchEngine;
    });
}
```

Una vez que su motor haya sido registrado, puede especificarlo como su Scout `driver` predeterminado en el archivo de configuración `config/scout.php` de su aplicación:

```php
'driver' => 'mysql',
```
