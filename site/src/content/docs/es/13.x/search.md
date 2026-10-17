---
title: "Buscar"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
    - [Búsqueda de texto completo](#introduction-full-text-search)
    - [Búsqueda semántica/vectorial](#introduction-semantic-vector-search)
    - [Reclasificación](#introduction-reranking)
    - [Motores de búsqueda Scout](#introduction-scout-search-engines)
- [Búsqueda de texto completo](#full-text-search)
    - [Agregar índices de texto completo](#adding-full-text-indexes)
    - [Ejecución de consultas de texto completo](#running-full-text-queries)
- [Búsqueda semántica/vectorial](#semantic-vector-search)
    - [Generando incrustaciones](#generating-embeddings)
    - [Almacenamiento e indexación de vectores](#storing-and-indexing-vectors)
    - [Consulta por similitud](#querying-by-similarity)
- [Resultados de reclasificación](#reranking-results)
- [Laravel Scout](#laravel-scout)
    - [Motor de base de datos](#database-engine)
    - [Motores de terceros](#third-party-engines)
- [Combinando Técnicas](#combining-techniques)

<a id="introduction"></a>
## Introducción

Casi todas las aplicaciones necesitan búsqueda. Ya sea que sus usuarios estén buscando artículos relevantes en una base de conocimientos, explorando un catálogo de productos o haciendo preguntas en lenguaje natural sobre un corpus de documentos, Laravel proporciona herramientas integradas para manejar cada uno de estos escenarios y, a menudo, no necesita ningún servicio externo para llegar allí.

La mayoría de las aplicaciones encontrarán que las opciones integradas basadas en bases de datos proporcionadas por Laravel son más que suficientes: los servicios de búsqueda externos solo son necesarios cuando necesita funciones como tolerancia a errores tipográficos, filtrado por facetas o búsqueda geográfica a escala masiva.

<a id="introduction-full-text-search"></a>
#### Búsqueda de texto completo

Cuando necesita una clasificación de relevancia de palabras clave (donde la base de datos califica y clasifica los resultados en función de qué tan bien coinciden con los términos de búsqueda), el método de creación de consultas `whereFullText` de Laravel aprovecha los índices nativos de texto completo en MariaDB, MySQL y PostgreSQL. La búsqueda de texto completo comprende los límites y las raíces de las palabras, por lo que una búsqueda de "en ejecución" puede coincidir con registros que contengan "ejecutar". No se requiere ningún servicio externo.

<a id="introduction-semantic-vector-search"></a>
#### Búsqueda semántica/vectorial

Para la búsqueda semántica impulsada por IA que coincide con los resultados por *significado* en lugar de palabras clave exactas, el método de creación de consultas `whereVectorSimilarTo` utiliza incrustaciones de vectores almacenados en PostgreSQL con la extensión `pgvector` o MariaDB. Por ejemplo, una búsqueda de "las mejores bodegas del Valle de Napa" puede generar un artículo titulado "Los mejores viñedos para visitar", aunque las palabras no se superpongan. La búsqueda vectorial requiere PostgreSQL con la extensión `pgvector` o MariaDB 11.7 o posterior, así como [Laravel AI SDK](../ai-sdk/).

<a id="introduction-reranking"></a>
#### Reclasificación

[AI SDK](../ai-sdk/) de Laravel proporciona capacidades de reclasificación que utilizan modelos de IA para reordenar cualquier conjunto de resultados por relevancia semántica para una consulta. La reclasificación es especialmente poderosa como segunda etapa después de un paso de recuperación inicial rápido, como la búsqueda de texto completo, lo que le brinda velocidad y precisión semántica.

<a id="introduction-scout-search-engines"></a>
#### Búsqueda de Laravel Scout

Para aplicaciones que desean un rasgo `Searchable` que mantenga sincronizados automáticamente los índices de búsqueda con los modelos Eloquent, [Laravel Scout](../scout/) ofrece un motor de base de datos integrado y controladores para servicios de terceros como Algolia, Meilisearch, Typesense y Turbopuffer.

<a id="full-text-search"></a>
## Búsqueda de texto completo

Si bien las consultas `LIKE` funcionan bien para la coincidencia simple de subcadenas, no entienden el lenguaje. Una búsqueda `LIKE` de "en ejecución" no encontrará un registro que contenga "ejecutar" y los resultados no se clasifican por relevancia; simplemente se devuelven en cualquier orden en que los encuentre la base de datos. La búsqueda de texto completo resuelve ambos problemas mediante el uso de índices especializados que comprenden los límites de las palabras, la raíz y la puntuación de relevancia, lo que permite que la base de datos devuelva primero los resultados más relevantes.

La búsqueda rápida de texto completo está integrada en MariaDB, MySQL y PostgreSQL; no se requiere ningún servicio de búsqueda externo. Solo necesita agregar un índice de texto completo a las columnas que desea buscar y luego usar el método del generador de consultas `whereFullText` para buscarlas.

> **Advertencia:**
> Actualmente, MariaDB, MySQL y PostgreSQL admiten la búsqueda de texto completo.

<a id="adding-full-text-indexes"></a>
### Agregar índices de texto completo

Para utilizar la búsqueda de texto completo, primero agregue un índice de texto completo a las columnas que desea buscar. Puede agregar el índice a una sola columna o pasar una matriz de columnas para crear un índice compuesto que busque en varios campos a la vez:

```php
Schema::create('articles', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->text('body');
    $table->timestamps();

    $table->fullText(['title', 'body']);
});
```

En PostgreSQL, puede especificar una configuración de idioma para el índice, que controla cómo se derivan las palabras:

```php
$table->fullText('body')->language('english');
```

Para obtener más información sobre la creación de índices, consulte la [documentación de migración](../migrations/#available-index-types).

<a id="running-full-text-queries"></a>
### Ejecución de consultas de texto completo

Una vez que el índice esté en su lugar, utilice el método de creación de consultas `whereFullText` para buscarlo. Laravel generará el SQL apropiado para el controlador de su base de datos, por ejemplo, `MATCH(...) AGAINST(...)` en MariaDB y MySQL, y `to_tsvector(...) @@ plainto_tsquery(...)` en PostgreSQL:

```php
$articles = Article::whereFullText('body', 'web developer')->get();
```

Cuando se utiliza MariaDB y MySQL, los resultados se ordenan automáticamente por puntuación de relevancia. En PostgreSQL, `whereFullText` filtra los registros coincidentes, pero no los ordena por relevancia; si necesita un orden automático por relevancia en PostgreSQL, considere usar el motor de base de datos de Scout](#database-engine), que maneja esto por usted.

Si creó un índice compuesto de texto completo en varias columnas, puede buscar en todas ellas pasando la misma matriz de columnas a `whereFullText`:

```php
$articles = Article::whereFullText(
    ['title', 'body'], 'web developer'
)->get();
```

El método `orWhereFullText` se puede utilizar para agregar una cláusula de búsqueda de texto completo como condición "o". Para obtener detalles completos, consulte la [documentación del generador de consultas](../queries/#full-text-where-clauses).

<a id="semantic-vector-search"></a>
## Búsqueda semántica/vectorial

La búsqueda de texto completo se basa en palabras clave coincidentes: las palabras de la consulta deben aparecer (de alguna forma) en los datos. La búsqueda semántica adopta un enfoque fundamentalmente diferente: utiliza incrustaciones de vectores generados por IA para representar el *significado* del texto como matrices de números, y luego encuentra resultados cuyo significado es más similar a la consulta. Por ejemplo, una búsqueda de "las mejores bodegas del Valle de Napa" puede generar un artículo titulado "Los mejores viñedos para visitar", aunque las palabras no se superpongan en absoluto.

El flujo de trabajo básico para la búsqueda vectorial es: generar una incrustación (una matriz numérica) para cada contenido y almacenarla junto con sus datos, luego, en el momento de la búsqueda, generar una incrustación para la consulta del usuario y encontrar las incrustaciones almacenadas más cercanas a ella en el espacio vectorial.

> **Nota:**
> La búsqueda de vectores requiere [Laravel AI SDK](../ai-sdk/) y es compatible con PostgreSQL (requiere la extensión `pgvector`), MariaDB 11.7 o posterior y MongoDB (requiere el [paquete Laravel MongoDB](https://laravel.com/docs/13.x/mongodb)). Todas las bases de datos de Postgres en [Laravel Cloud](https://laravel.com/cloud) ya tienen instalado `pgvector`.

<a id="generating-embeddings"></a>
### Generando incrustaciones

Una incrustación es una matriz numérica de alta dimensión (normalmente cientos o miles de números) que representa el significado semántico de un fragmento de texto. Puede generar incrustaciones para una cadena usando el método `toEmbeddings` disponible en la clase `Stringable` de Laravel:

```php
use Illuminate\Support\Str;

$embedding = Str::of('Napa Valley has great wine.')->toEmbeddings();
```

Para generar incrustaciones para múltiples entradas a la vez (lo cual es más eficiente que generarlas una a la vez, ya que solo requiere una única llamada API al proveedor de incrustaciones), use la clase `Embeddings`:

```php
use Laravel\Ai\Embeddings;

$response = Embeddings::for([
    'Napa Valley has great wine.',
    'Laravel is a PHP framework.',
])->generate();

$response->embeddings; // [[0.123, 0.456, ...], [0.789, 0.012, ...]]
```

Para obtener más detalles sobre la configuración de proveedores de integración, la personalización de dimensiones y el almacenamiento en caché, consulte la [documentación AI SDK](../ai-sdk/#embeddings).

<a id="storing-and-indexing-vectors"></a>
### Almacenamiento e indexación de vectores

Para almacenar incrustaciones de vectores, defina una columna `vector` en su migración, especificando el número de dimensiones que coincidan con la salida de su proveedor de incrustaciones (por ejemplo, 1536 para el modelo `text-embedding-3-small` de OpenAI). También debe llamar a `index` en la columna para crear un índice HNSW (Hierarchical Navigable Small World), que acelera drásticamente las búsquedas de similitudes en grandes conjuntos de datos:

```php
Schema::ensureVectorExtensionExists();

Schema::create('documents', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->text('content');
    $table->vector('embedding', dimensions: 1536)->index();
    $table->timestamps();
});
```

El método `Schema::ensureVectorExtensionExists` garantiza que la extensión `pgvector` esté habilitada en su base de datos PostgreSQL antes de crear la tabla.

En su modelo Eloquent, use la conversión `AsVector` para que Laravel maneje automáticamente la conversión entre matrices PHP y el formato vectorial de la base de datos:

```php
use Illuminate\Database\Eloquent\Casts\AsVector;

protected function casts(): array
{
    return [
        'embedding' => AsVector::class,
    ];
}
```

Para obtener más detalles sobre índices y columnas vectoriales, consulte la [documentación de migración](../migrations/#available-column-types).

<a id="querying-by-similarity"></a>
### Consulta por similitud

Una vez que haya almacenado incrustaciones para su contenido, puede buscar registros similares utilizando el método `whereVectorSimilarTo`. Este método compara la incrustación dada con los vectores almacenados usando similitud de coseno, filtra los resultados por debajo del umbral `minSimilarity` y ordena automáticamente los resultados por relevancia, con los registros más similares primero. El umbral debe ser un valor entre `0.0` y `1.0`, donde `1.0` significa que los vectores son idénticos:

```php
$documents = Document::query()
    ->whereVectorSimilarTo('embedding', $queryEmbedding, minSimilarity: 0.4)
    ->limit(10)
    ->get();
```

Para su comodidad, cuando se proporciona una cadena simple en lugar de una matriz de incrustación, Laravel generará automáticamente la incrustación utilizando su proveedor de incrustación configurado. Esto significa que puede pasar la consulta de búsqueda del usuario directamente sin convertirla manualmente en una incrustación primero:

```php
$documents = Document::query()
    ->whereVectorSimilarTo('embedding', 'best wineries in Napa Valley')
    ->limit(10)
    ->get();
```

Para un control de nivel inferior sobre consultas vectoriales, también están disponibles los métodos `whereVectorDistanceLessThan`, `selectVectorDistance` y `orderByVectorDistance`. Estos métodos le permiten trabajar directamente con valores de distancia en lugar de puntuaciones de similitud, seleccionar la distancia calculada como una columna en sus resultados o controlar manualmente el orden. Para obtener detalles completos, consulte la [documentación del generador de consultas](../queries/#vector-similarity-clauses) y la [documentación del SDK de AI](../ai-sdk/#querying-embeddings).

<a id="reranking-results"></a>
## Resultados de reclasificación

La reclasificación es una técnica en la que un modelo de IA reordena un conjunto de resultados según la relevancia semántica de cada resultado para una consulta determinada. A diferencia de la búsqueda vectorial, que requiere calcular previamente y almacenar incrustaciones, la reclasificación funciona en cualquier colección de texto: toma el contenido sin procesar y la consulta como entrada y devuelve los elementos ordenados por relevancia.

La reclasificación es especialmente poderosa como segunda etapa después de un rápido paso de recuperación inicial. Por ejemplo, puede utilizar la búsqueda de texto completo para limitar rápidamente miles de registros a los 50 candidatos principales y luego utilizar la reclasificación para colocar los resultados más relevantes en la parte superior. Este patrón de "recuperar y luego reclasificar" le brinda velocidad y precisión semántica.

Puede reclasificar una serie de cadenas utilizando la clase `Reranking`:

```php
use Laravel\Ai\Reranking;

$response = Reranking::of([
    'Django is a Python web framework.',
    'Laravel is a PHP web application framework.',
    'React is a JavaScript library for building user interfaces.',
])->rerank('PHP frameworks');

$response->first()->document; // "Laravel is a PHP web application framework."
```

Las colecciones de Laravel también tienen una macro `rerank` que acepta un nombre de campo (o función anónima) y una consulta, lo que facilita la reclasificación de los resultados de Eloquent:

```php
$articles = Article::all()
    ->rerank('body', 'Laravel tutorials');
```

Para obtener detalles completos sobre la configuración de proveedores de reclasificación y las opciones disponibles, consulte la [documentación AI SDK](../ai-sdk/#reranking).

<a id="laravel-scout"></a>
## Laravel Scout

Las técnicas de búsqueda descritas anteriormente son todos métodos de creación de consultas que usted llama directamente en su código. [Laravel Scout](../scout/) adopta un enfoque diferente: proporciona un rasgo `Searchable` que usted agrega a sus modelos Eloquent, y Scout mantiene automáticamente sus índices de búsqueda sincronizados a medida que se crean, actualizan y eliminan registros. Esto es particularmente conveniente cuando desea que siempre se puedan realizar búsquedas en sus modelos sin administrar manualmente las actualizaciones del índice.

<a id="database-engine"></a>
### Motor de base de datos

El motor de base de datos integrado de Scout realiza búsquedas de texto completo y `LIKE` en su base de datos existente, sin necesidad de servicios externos ni infraestructura adicional. Simplemente agregue el rasgo `Searchable` a su modelo y defina un método `toSearchableArray` que devuelva las columnas que desea que se puedan buscar.

Puede utilizar atributos PHP para controlar la estrategia de búsqueda para cada columna. `SearchUsingFullText` utilizará el índice de texto completo de su base de datos, `SearchUsingPrefix` solo coincidirá desde el principio de la cadena (`example%`) y cualquier columna sin un atributo utilizará una estrategia `LIKE` predeterminada con comodines en ambos lados (`%example%`):

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Attributes\SearchUsingFullText;
use Laravel\Scout\Attributes\SearchUsingPrefix;
use Laravel\Scout\Searchable;

class Article extends Model
{
    use Searchable;

    #[SearchUsingPrefix(['id'])]
    #[SearchUsingFullText(['title', 'body'])]
    public function toSearchableArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'body' => $this->body,
        ];
    }
}
```

> **Advertencia:**
> Antes de especificar que una columna debe utilizar restricciones de consulta de texto completo, asegúrese de que a la columna se le haya asignado un [índice de texto completo](../migrations/#available-index-types).

Una vez agregado el rasgo, puede buscar su modelo utilizando el método `search` de Scout. El motor de base de datos de Scout ordenará automáticamente los resultados por relevancia, incluso en PostgreSQL:

```php
$articles = Article::search('Laravel')->get();
```

El motor de base de datos es una excelente opción cuando sus necesidades de búsqueda son moderadas y desea la comodidad de la sincronización automática del índice de Scout sin implementar un servicio externo. Maneja bien los casos de uso de búsqueda más comunes, incluido el filtrado, la paginación y el manejo de registros eliminados temporalmente. Para obtener detalles completos, consulte la [documentación Scout](../scout/#database-engine).

<a id="third-party-engines"></a>
### Motores de terceros

Scout también admite motores de búsqueda de terceros como [Algolia](https://www.algolia.com/), [Meilisearch](https://www.meilisearch.com) y [Typesense](https://typesense.org). Estos servicios de búsqueda dedicados ofrecen funciones avanzadas como tolerancia a errores tipográficos, filtrado por facetas, búsqueda geográfica y reglas de clasificación personalizadas, funciones que se vuelven importantes a gran escala o cuando se necesita una experiencia de búsqueda altamente refinada a medida que se escribe.

Dado que Scout proporciona una API unificada en todos sus controladores, cambiar posteriormente del motor de base de datos a un motor de terceros requiere cambios mínimos de código. Puede comenzar con el motor de base de datos y migrar a un servicio de terceros solo si las necesidades de su aplicación superan lo que la base de datos puede proporcionar.

Para obtener detalles completos sobre la configuración de motores de terceros, consulte la [documentación de Scout](../scout/).

> **Nota:**
> Muchas aplicaciones nunca necesitan un motor de búsqueda externo. Las técnicas integradas descritas en esta página cubren la gran mayoría de los casos de uso.

<a id="combining-techniques"></a>
## Combinando técnicas

Las técnicas de búsqueda descritas en esta página no son mutuamente excluyentes; combinarlas a menudo produce los mejores resultados. Aquí hay dos patrones comunes que demuestran cómo estas herramientas funcionan juntas.

**Recuperación de texto completo + Reclasificación**

Utilice la búsqueda de texto completo para limitar rápidamente un conjunto de datos grande a un conjunto de candidatos y luego aplique una reclasificación para ordenar esos candidatos por relevancia semántica. Esto le brinda la velocidad de la búsqueda de texto completo nativa de la base de datos con la precisión de la puntuación de relevancia impulsada por IA:

```php
$articles = Article::query()
    ->whereFullText('body', $request->input('query'))
    ->limit(50)
    ->get()
    ->rerank('body', $request->input('query'), limit: 10);
```

**Búsqueda vectorial + Filtros tradicionales**

Combine la similitud de vectores con cláusulas estándar `where` para ampliar la búsqueda semántica a un subconjunto de registros. Esto es útil cuando desea una búsqueda basada en el significado pero necesita restringir los resultados por propiedad, categoría o cualquier otro atributo:

```php
$documents = Document::query()
    ->where('team_id', $user->team_id)
    ->whereVectorSimilarTo('embedding', $request->input('query'))
    ->limit(10)
    ->get();
```
