---
title: "Notas de la versión"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Esquema de versiones](#versioning-scheme)
- [Política de soporte](#support-policy)
- [Laravel 13](#laravel-13)

<a id="versioning-scheme"></a>
## Esquema de versiones

Laravel y sus otros paquetes propios siguen [versionado semántico](https://semver.org). Las versiones principales del framework se publican cada año (aproximadamente en el primer trimestre), mientras que las versiones menores y de parches pueden publicarse cada semana. Las versiones menores y de parches **nunca** deben contener cambios incompatibles.

Al hacer referencia al framework de Laravel o a sus componentes desde tu aplicación o paquete, siempre debes usar una restricción de versión como `^13.0`, ya que las principales versiones de Laravel incluyen cambios incompatibles. Sin embargo, nos esforzamos por garantizar siempre que puedas actualizar a una nueva versión principal en un día o menos.

<a id="named-arguments"></a>
#### Argumentos con nombre

[Los argumentos con nombre](https://www.php.net/manual/en/functions.arguments.php#functions.named-arguments) no están cubiertos por las pautas de compatibilidad con versiones anteriores de Laravel. Podemos optar por cambiar el nombre de los argumentos de la función cuando sea necesario para mejorar el código base de Laravel. Por lo tanto, el uso de argumentos con nombre al llamar a métodos de Laravel debe hacerse con cautela y entendiendo que los nombres de los parámetros pueden cambiar en el futuro.

<a id="support-policy"></a>
## Política de soporte

Para todas las versiones de Laravel, se proporcionan correcciones de errores durante 18 meses y correcciones de seguridad durante 2 años. Para todas las bibliotecas adicionales, solo la última versión principal recibe correcciones de errores. Además, revisa las versiones de la base de datos [compatibles con Laravel](../database/#introduction).

<div class="overflow-auto">

| Versión | PHP (*) | Lanzamiento | Corrección de errores hasta | Correcciones de seguridad hasta |
| ------- |-----------| ------------------- | ------------------- | -------------------- |
| 10 | 8.1 - 8.3 | 14 de febrero de 2023 | 6 de agosto de 2024 | 4 de febrero de 2025 |
| 11 | 8.2 - 8.4 | 12 de marzo de 2024 | 3 de septiembre de 2025 | 12 de marzo de 2026 |
| 12 | 8.2 - 8.5 | 24 de febrero de 2025 | 13 de agosto de 2026 | 24 de febrero de 2027 |
| 13 | 8.3 - 8.5 | 17 de marzo de 2026 | Tercer trimestre de 2027 | 17 de marzo de 2028 |

</div>

<div class="version-colors">
    <div class="end-of-life">
        <div class="color-box"></div>
        <div>Fin de vida útil</div>
    </div>
    <div class="security-fixes">
        <div class="color-box"></div>
        <div>Solo correcciones de seguridad</div>
    </div>
</div>

(*) Versiones PHP soportadas

<a id="laravel-13"></a>
## Laravel 13

Laravel 13 continúa la cadencia de lanzamiento anual de Laravel con un enfoque en flujos de trabajo nativos de IA, valores predeterminados más sólidos y API de desarrollador más expresivas. Esta versión incluye primitivas de IA propias, recursos JSON:API, capacidades de búsqueda semántica/vectorial y mejoras incrementales en colas, caché y seguridad.

<a id="minimal-breaking-changes"></a>
### Cambios incompatibles mínimos

Gran parte de nuestro enfoque durante este ciclo de lanzamiento ha sido minimizar los cambios incompatibles. En cambio, nos hemos dedicado a ofrecer mejoras continuas en la experiencia de desarrollo durante todo el año que no alteren el funcionamiento de las aplicaciones existentes.

Por lo tanto, la versión Laravel 13 es una actualización relativamente menor en términos de esfuerzo, y al mismo tiempo ofrece nuevas capacidades sustanciales. En vista de esto, la mayoría de las aplicaciones de Laravel pueden actualizarse a Laravel 13 sin cambiar mucho el código de la aplicación.

<a id="php-8"></a>
### PHP 8.3

Laravel 13.x requiere una versión mínima de PHP 8.3.

<a id="ai-sdk"></a>
### Laravel AI SDK

Laravel 13 presenta el propio [Laravel AI SDK](https://laravel.com/ai), que proporciona una API unificada para generación de texto, agentes que llaman a herramientas, embeddings, audio, imágenes e integraciones de almacén de vectores.

Con el AI SDK, puedes crear funcionalidades de IA independientes del proveedor y mantener una experiencia de desarrollador consistente y nativa de Laravel.

Por ejemplo, puedes enviar un prompt a un agente básico con una sola llamada:

```php
use App\Ai\Agents\SalesCoach;

$response = SalesCoach::make()->prompt('Analyze this sales transcript...');

return (string) $response;
```

El Laravel AI SDK también puede generar imágenes, audio y embeddings:

Para casos de uso de generación visual, el SDK ofrece una API limpia para crear imágenes a partir de indicaciones en lenguaje sencillo:

```php
use Laravel\Ai\Image;

$image = Image::of('A donut sitting on the kitchen counter')->generate();

$rawContent = (string) $image;
```

Para experiencias de voz, puedes sintetizar audio con sonido natural a partir de texto para asistentes, narraciones y funciones de accesibilidad:

```php
use Laravel\Ai\Audio;

$audio = Audio::of('I love coding with Laravel.')->generate();

$rawContent = (string) $audio;
```

Y para flujos de trabajo de búsqueda y recuperación semántica, puedes generar embeddings directamente a partir de cadenas:

```php
use Illuminate\Support\Str;

$embeddings = Str::of('Napa Valley has great wine.')->toEmbeddings();
```

<a id="json-api"></a>
### Recursos JSON:API

Laravel ahora incluye [recursos JSON:API](../eloquent-resources/#jsonapi-resources) propios, lo que facilita la devolución de respuestas que cumplan con la especificación JSON:API.

Los recursos JSON:API manejan la serialización de objetos de recursos, la inclusión de relaciones, conjuntos de campos reducidos, enlaces y encabezados de respuesta compatibles con JSON:API.

<a id="request-forgery-protection"></a>
### Protección contra falsificación de solicitudes

Por seguridad, el middleware [protección contra falsificación de solicitudes](../csrf/#preventing-csrf-requests) de Laravel se ha mejorado y formalizado como `PreventRequestForgery`, agregando verificación de solicitudes con reconocimiento del origen y al mismo tiempo preservando la compatibilidad con la protección CSRF basada en tokens.

<a id="queue-routing"></a>
### Enrutamiento de colas

Laravel 13 agrega [enrutamiento de cola por clase](../queues/#queue-routing) a través de `Queue::route(...)`, lo que te permite definir reglas de enrutamiento de cola/conexión predeterminadas para trabajos específicos en un lugar central:

```php
Queue::route(ProcessPodcast::class, connection: 'redis', queue: 'podcasts');
```

<a id="php-attributes"></a>
### Atributos PHP expandidos

Laravel 13 continúa expandiendo el soporte de atributos PHP propios en todo el framework, lo que permite declarar configuraciones y comportamientos habituales junto a tus clases y métodos.

Las adiciones notables incluyen atributos de controlador y autorización como [`#[Middleware]`](../controllers/#controller-middleware) y [`#[Authorize]`](../controllers/#authorization-attributes), así como controles de trabajo orientados a cola como [`#[Tries]`](../queues/#max-job-attempts-and-timeout), [`#[Backoff]`](../queues/#dealing-with-failed-jobs), [`#[Timeout]`](../queues/#max-job-attempts-and-timeout) y [`#[FailOnTimeout]`](../queues/#failing-on-timeout).

Por ejemplo, el middleware del controlador y las comprobaciones de políticas ahora se pueden declarar directamente en clases y métodos:

```php
<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Post;
use Illuminate\Routing\Attributes\Controllers\Authorize;
use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth')]
class CommentController
{
    #[Middleware('subscribed')]
    #[Authorize('create', [Comment::class, 'post'])]
    public function store(Post $post)
    {
        // ...
    }
}
```

También se han introducido atributos adicionales en las API de Eloquent, eventos, notificaciones, validación, pruebas y serialización de recursos, lo que te ofrece una opción consistente basada en atributos en más áreas del framework.

<a id="cache-touch"></a>
### Extensión TTL de caché

Laravel ahora incluye [`Cache::touch(...)`](../cache/), que te permite ampliar el TTL de un elemento de caché existente sin recuperar su valor y volver a almacenarlo.

<a id="semantic-search"></a>
### Búsqueda semántica/vectorial

Laravel 13 amplía sus capacidades de búsqueda semántica con soporte nativo para consultas vectoriales, flujos de trabajo con embeddings y API relacionadas documentadas en [búsqueda](../search/#semantic-vector-search), [consultas](../queries/#vector-similarity-clauses) y el [AI SDK](../ai-sdk/#embeddings).

Estas características facilitan la creación de experiencias de búsqueda impulsadas por IA utilizando PostgreSQL + `pgvector`, incluida la búsqueda de similitudes con embeddings generados directamente a partir de cadenas.

Por ejemplo, puedes ejecutar búsquedas de similitud semántica directamente desde el generador de consultas:

```php
$documents = DB::table('documents')
    ->whereVectorSimilarTo('embedding', 'Best wineries in Napa Valley')
    ->limit(10)
    ->get();
```
