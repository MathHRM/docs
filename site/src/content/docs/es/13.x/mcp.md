---
title: "Laravel MCP"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Instalación](#installation)
    - [Publicación de rutas](#publishing-routes)
- [Creación de servidores](#creating-servers)
    - [Registro del servidor](#server-registration)
    - [Servidores web](#web-servers)
    - [Servidores locales](#local-servers)
    - [Sugerencias de caché](#cache-hints)
- [Herramientas](#tools)
    - [Creación de herramientas](#creating-tools)
    - [Catálogos de herramientas con capacidad de búsqueda](#searchable-tool-catalogs)
    - [Esquemas de entrada de herramientas](#tool-input-schemas)
    - [Esquemas de salida de herramientas](#tool-output-schemas)
    - [Validación de argumentos de herramientas](#validating-tool-arguments)
    - [Inyección de dependencias de herramientas](#tool-dependency-injection)
    - [Anotaciones de herramientas](#tool-annotations)
    - [Registro condicional de herramientas](#conditional-tool-registration)
    - [Respuestas de la herramienta](#tool-responses)
- [Los prompts](#prompts)
    - [Creación de prompts](#creating-prompts)
    - [Argumentos de prompts](#prompt-arguments)
    - [Validación de argumentos de prompts](#validating-prompt-arguments)
    - [Inyección de dependencias de prompts](#prompt-dependency-injection)
    - [Registro condicional de prompts](#conditional-prompt-registration)
    - [Respuestas de prompts](#prompt-responses)
- [Recursos](#resources)
    - [Creación de recursos](#creating-resources)
    - [Plantillas de recursos](#resource-templates)
    - [URI de recurso y tipo MIME](#resource-uri-and-mime-type)
    - [Solicitud de recursos](#resource-request)
    - [Inyección de dependencias de recursos](#resource-dependency-injection)
    - [Anotaciones de recursos](#resource-annotations)
    - [Registro condicional de recursos](#conditional-resource-registration)
    - [Respuestas de recursos](#resource-responses)
- [Aplicaciones](#apps)
    - [Creación de recursos de aplicaciones](#creating-app-resources)
    - [Representación de aplicaciones desde herramientas](#rendering-apps-from-tools)
    - [Visibilidad de la herramienta de la aplicación](#app-tool-visibility)
    - [Configuración de la aplicación](#app-configuration)
    - [Creación de aplicaciones con Boost](#building-apps-with-boost)
- [Metadatos](#metadata)
- [Iconos](#icons)
- [Autenticación](#authentication)
    - [OAuth 2.1](#oauth)
    - [Sanctum](#sanctum)
- [Autorización](#authorization)
- [Cliente MCP](#client)
    - [Conexión a servidores](#client-connecting)
    - [Clientes con nombre](#named-clients)
    - [Autenticación de cliente](#client-authentication)
    - [Herramientas](#client-tools)
    - [Los prompts](#client-prompts)
    - [Recursos](#client-resources)
- [Pruebas de servidores](#testing-servers)
    - [MCP Inspector](#mcp-inspector)
    - [Pruebas unitarias](#unit-tests)

<a id="introduction"></a>
## Introducción

[Laravel MCP](https://github.com/laravel/mcp) proporciona una forma sencilla y elegante para que los clientes de IA interactúen con tu aplicación Laravel a través del [Model Context Protocol](https://modelcontextprotocol.io/docs/getting-started/intro). Ofrece una interfaz expresiva y fluida para definir servidores, herramientas, recursos y prompts que permiten interacciones impulsadas por IA con tu aplicación.

<a id="installation"></a>
## Instalación

Para comenzar, instala Laravel MCP en tu proyecto usando el administrador de paquetes de Composer:

```shell
composer require laravel/mcp
```

<a id="publishing-routes"></a>
### Publicación de rutas

Después de instalar Laravel MCP, ejecuta el comando `vendor:publish` Artisan para publicar el archivo `routes/ai.php` donde definirás tus servidores MCP:

```shell
php artisan vendor:publish --tag=ai-routes
```

Este comando crea el archivo `routes/ai.php` en el directorio `routes` de tu aplicación, que utilizarás para registrar tus servidores MCP.

<a id="creating-servers"></a>
## Creación de servidores

Puedes crear un servidor MCP utilizando el comando `make:mcp-server` Artisan. Los servidores actúan como el punto de comunicación central que expone las capacidades de MCP, como herramientas, recursos y prompts, a los clientes de IA:

```shell
php artisan make:mcp-server WeatherServer
```

Este comando creará una nueva clase de servidor en el directorio `app/Mcp/Servers`. La clase de servidor generada extiende la clase base `Laravel\Mcp\Server` de Laravel MCP y proporciona atributos y propiedades para configurar el servidor y registrar herramientas, recursos y prompts:

```php
<?php

namespace App\Mcp\Servers;

use Laravel\Mcp\Server\Attributes\Instructions;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Version;
use Laravel\Mcp\Server;

#[Name('Weather Server')]
#[Version('1.0.0')]
#[Instructions('This server provides weather information and forecasts.')]
class WeatherServer extends Server
{
    /**
     * The tools registered with this MCP server.
     *
     * @var array<int, class-string<\Laravel\Mcp\Server\Tool>>
     */
    protected array $tools = [
        // GetCurrentWeatherTool::class,
    ];

    /**
     * The resources registered with this MCP server.
     *
     * @var array<int, class-string<\Laravel\Mcp\Server\Resource>>
     */
    protected array $resources = [
        // WeatherGuidelinesResource::class,
    ];

    /**
     * The prompts registered with this MCP server.
     *
     * @var array<int, class-string<\Laravel\Mcp\Server\Prompt>>
     */
    protected array $prompts = [
        // DescribeWeatherPrompt::class,
    ];
}
```

<a id="server-registration"></a>
### Registro del servidor

Una vez que hayas creado un servidor, debes registrarlo en tu archivo `routes/ai.php` para que sea accesible. Laravel MCP proporciona dos métodos para registrar servidores: `web` para servidores accesibles mediante HTTP y `local` para servidores de línea de comandos.

<a id="web-servers"></a>
### Servidores web

Los servidores web son los tipos de servidores más comunes y se puede acceder a ellos mediante solicitudes HTTP POST, lo que los hace ideales para clientes de IA remotos o integraciones basadas en web. Registra un servidor web utilizando el método `web`:

```php
use App\Mcp\Servers\WeatherServer;
use Laravel\Mcp\Facades\Mcp;

Mcp::web('/mcp/weather', WeatherServer::class);
```

Al igual que las rutas normales, puedes aplicar middleware para proteger tus servidores web:

```php
Mcp::web('/mcp/weather', WeatherServer::class)
    ->middleware(['throttle:mcp']);
```

<a id="local-servers"></a>
### Servidores locales

Los servidores locales se ejecutan como comandos Artisan, perfectos para crear integraciones de asistentes de IA locales como [Laravel Boost](../installation/#installing-laravel-boost). Registra un servidor local utilizando el método `local`:

```php
use App\Mcp\Servers\WeatherServer;
use Laravel\Mcp\Facades\Mcp;

Mcp::local('weather', WeatherServer::class);
```

Una vez registrado, normalmente no necesitarás ejecutar manualmente el comando `mcp:start` Artisan. En su lugar, configura tu cliente MCP (agente de IA) para iniciar el servidor o usa el [MCP Inspector](#mcp-inspector).

<a id="cache-hints"></a>
### Sugerencias de caché

Laravel MCP incluye sugerencias de caché con respuestas que pueden almacenarse en caché, como descubrimiento de servidores, listas de primitivas y lecturas de recursos. De forma predeterminada, estas respuestas están marcadas como privadas con un tiempo de vida de cero milisegundos.

Puedes personalizar la sugerencia de caché predeterminada para un servidor utilizando el atributo `Cacheable`:

```php
use Laravel\Mcp\Enums\CacheScope;
use Laravel\Mcp\Server\Attributes\Cacheable;

#[Cacheable(ttlMs: 60_000, scope: CacheScope::Public)]
class WeatherServer extends Server
{
    /**
     * Obtener las indicaciones de cache para métodos MCP individuales.
     *
     * @return array<string, \Laravel\Mcp\Server\Attributes\Cacheable>
     */
    protected function cacheHints(): array
    {
        return [
            'tools/list' => new Cacheable(ttlMs: 30_000, scope: CacheScope::Public),
        ];
    }
}
```

El alcance `CacheScope::Private` limita las respuestas almacenadas en caché al mismo contexto de autorización, mientras que `CacheScope::Public` permite compartir respuestas entre usuarios. Las sugerencias de caché son orientativas; el cliente o host MCP determina si una respuesta realmente se almacena en caché. Las sugerencias específicas del método devueltas por `cacheHints` tienen prioridad sobre el atributo `Cacheable` del servidor.

Puedes anular la sugerencia de caché del servidor para un recurso individual aplicando el atributo `Cacheable` a la clase de recurso:

```php
#[Cacheable(ttlMs: 300_000, scope: CacheScope::Public)]
class WeatherGuidelinesResource extends Resource
{
    // ...
}
```

El atributo `Cacheable` de un recurso tiene prioridad sobre la sugerencia específica del método y la sugerencia predeterminada del servidor.

<a id="tools"></a>
## Herramientas

Las herramientas permiten que tu servidor exponga la funcionalidad a la que los clientes de IA pueden llamar. Permiten que los modelos de lenguaje realicen acciones, ejecuten código o interactúen con sistemas externos:

```php
<?php

namespace App\Mcp\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tool;

#[Description('Fetches the current weather forecast for a specified location.')]
class CurrentWeatherTool extends Tool
{
    /**
     * Gestionar la solicitud de la herramienta.
     */
    public function handle(Request $request): Response
    {
        $location = $request->get('location');

        // Obtener el clima...

        return Response::text('The weather is...');
    }

    /**
     * Obtener el esquema de entrada de la herramienta.
     *
     * @return array<string, \Illuminate\JsonSchema\Types\Type>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'location' => $schema->string()
                ->description('The location to get the weather for.')
                ->required(),
        ];
    }
}
```

<a id="creating-tools"></a>
### Creación de herramientas

Para crear una herramienta, ejecuta el comando `make:mcp-tool` Artisan:

```shell
php artisan make:mcp-tool CurrentWeatherTool
```

Después de crear una herramienta, regístrala en la propiedad `$tools` de tu servidor:

```php
<?php

namespace App\Mcp\Servers;

use App\Mcp\Tools\CurrentWeatherTool;
use Laravel\Mcp\Server;

class WeatherServer extends Server
{
    /**
     * The tools registered with this MCP server.
     *
     * @var array<int, class-string<\Laravel\Mcp\Server\Tool>>
     */
    protected array $tools = [
        CurrentWeatherTool::class,
    ];
}
```

<a id="searchable-tool-catalogs"></a>
### Catálogos de herramientas con capacidad de búsqueda

Los servidores con muchas herramientas pueden colocar algunas herramientas en un catálogo con capacidad de búsqueda en lugar de anunciar cada herramienta al cliente de IA. Un catálogo con capacidad de búsqueda expone dos herramientas: `search_tools`, que busca en el catálogo por nombre de herramienta, descripción y esquema de entrada; y `execute_tools`, que invoca una o más herramientas devueltas por una búsqueda.

Para crear un catálogo con capacidad de búsqueda, usa la clase `ToolSearch` como clave de array en la propiedad `$tools` de tu servidor:

```php
<?php

namespace App\Mcp\Servers;

use App\Mcp\Tools\CurrentWeatherTool;
use App\Mcp\Tools\HistoricalWeatherTool;
use App\Mcp\Tools\WeatherAlertsTool;
use Laravel\Mcp\Server;
use Laravel\Mcp\Server\Tools\ToolSearch;

class WeatherServer extends Server
{
    /**
     * The tools registered with this MCP server.
     *
     * @var array<int|string, \Laravel\Mcp\Server\Tool|class-string<\Laravel\Mcp\Server\Tool>|array<int, \Laravel\Mcp\Server\Tool|class-string<\Laravel\Mcp\Server\Tool>>>
     */
    protected array $tools = [
        CurrentWeatherTool::class,

        ToolSearch::class => [
            HistoricalWeatherTool::class,
            WeatherAlertsTool::class,
        ],
    ];
}
```

En este ejemplo, `CurrentWeatherTool` se anuncia directamente, mientras que las herramientas de datos meteorológicos históricos y alertas meteorológicas están disponibles a través del catálogo de búsqueda. El registro de herramientas condicional aún se respeta cuando se buscan o ejecutan herramientas del catálogo.

La cantidad máxima de herramientas que se pueden ejecutar en una llamada `execute_tools` y el tamaño máximo de respuesta están controlados por los valores de configuración `mcp.tool_search.max_tool_calls` y `mcp.tool_search.max_output_bytes`.

<a id="tool-name-title-description"></a>
#### Nombre, título y descripción de la herramienta

De forma predeterminada, el nombre y el título de la herramienta se derivan del nombre de la clase. Por ejemplo, `CurrentWeatherTool` tendrá el nombre `current-weather` y el título `Current Weather Tool`. Puedes personalizar estos valores utilizando los atributos `Name` y `Title`:

```php
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Title;

#[Name('get-optimistic-weather')]
#[Title('Get Optimistic Weather Forecast')]
class CurrentWeatherTool extends Tool
{
    // ...
}
```

Las descripciones de las herramientas no se generan automáticamente. Siempre debes proporcionar una descripción significativa utilizando el atributo `Description`:

```php
use Laravel\Mcp\Server\Attributes\Description;

#[Description('Fetches the current weather forecast for a specified location.')]
class CurrentWeatherTool extends Tool
{
    //
}
```

> **Nota:**
> La descripción es una parte fundamental de los metadatos de la herramienta, ya que ayuda a los modelos de IA a comprender cuándo y cómo utilizar la herramienta de forma eficaz.

<a id="tool-input-schemas"></a>
### Esquemas de entrada de herramientas

Las herramientas pueden definir esquemas de entrada para especificar qué argumentos aceptan de los clientes de IA. Utiliza el constructor `Illuminate\Contracts\JsonSchema\JsonSchema` de Laravel para definir los requisitos de entrada de tu herramienta:

```php
<?php

namespace App\Mcp\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Server\Tool;

class CurrentWeatherTool extends Tool
{
    /**
     * Obtener el esquema de entrada de la herramienta.
     *
     * @return array<string, \Illuminate\JsonSchema\Types\Type>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'location' => $schema->string()
                ->description('The location to get the weather for.')
                ->required(),

            'units' => $schema->string()
                ->enum(['celsius', 'fahrenheit'])
                ->description('The temperature units to use.')
                ->default('celsius'),
        ];
    }
}
```

<a id="tool-output-schemas"></a>
### Esquemas de salida de herramientas

Las herramientas pueden definir [esquemas de salida](https://modelcontextprotocol.io/specification/2026-07-28/server/tools#output-schema) para especificar la estructura de sus respuestas. Esto permite una mejor integración con clientes de IA que necesitan resultados de herramientas analizables. Utiliza el método `outputSchema` para definir la estructura de salida de tu herramienta:

```php
<?php

namespace App\Mcp\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Server\Tool;

class CurrentWeatherTool extends Tool
{
    /**
     * Obtener el esquema de salida de la herramienta.
     *
     * @return array<string, \Illuminate\JsonSchema\Types\Type>
     */
    public function outputSchema(JsonSchema $schema): array
    {
        return [
            'temperature' => $schema->number()
                ->description('Temperature in Celsius')
                ->required(),

            'conditions' => $schema->string()
                ->description('Weather conditions')
                ->required(),

            'humidity' => $schema->integer()
                ->description('Humidity percentage')
                ->required(),
        ];
    }
}
```

<a id="validating-tool-arguments"></a>
### Validación de argumentos de la herramienta

Las definiciones de esquema JSON proporcionan una estructura básica para los argumentos de las herramientas, pero es posible que también desees aplicar reglas de validación más complejas.

Laravel MCP se integra perfectamente con las [funciones de validación](../validation/) de Laravel. Puedes validar los argumentos entrantes de la herramienta dentro del método `handle` de tu herramienta:

```php
<?php

namespace App\Mcp\Tools;

use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class CurrentWeatherTool extends Tool
{
    /**
     * Gestionar la solicitud de la herramienta.
     */
    public function handle(Request $request): Response
    {
        $validated = $request->validate([
            'location' => 'required|string|max:100',
            'units' => 'in:celsius,fahrenheit',
        ]);

        // Obtener datos meteorológicos usando los argumentos validados...
    }
}
```

En caso de error de validación, los clientes de IA actuarán en función de los mensajes de error que proporciones. Como tal, es fundamental proporcionar mensajes de error claros y procesables:

```php
$validated = $request->validate([
    'location' => ['required','string','max:100'],
    'units' => 'in:celsius,fahrenheit',
],[
    'location.required' => 'You must specify a location to get the weather for. For example, "New York City" or "Tokyo".',
    'units.in' => 'You must specify either "celsius" or "fahrenheit" for the units.',
]);
```

<a id="tool-dependency-injection"></a>
#### Inyección de dependencias de herramientas

El [contenedor de servicios](../container/) de Laravel se utiliza para resolver todas las herramientas. Como resultado, puedes declarar mediante tipos cualquier dependencia que tu herramienta pueda necesitar en su constructor. Las dependencias declaradas se resolverán e inyectarán automáticamente en la instancia de la herramienta:

```php
<?php

namespace App\Mcp\Tools;

use App\Repositories\WeatherRepository;
use Laravel\Mcp\Server\Tool;

class CurrentWeatherTool extends Tool
{
    /**
     * Crear una nueva instancia de tool.
     */
    public function __construct(
        protected WeatherRepository $weather,
    ) {}

    // ...
}
```

Además de la inyección del constructor, también puedes declarar dependencias mediante tipos en el método `handle()` de tu herramienta. El contenedor de servicios resolverá e inyectará automáticamente las dependencias cuando se llame al método:

```php
<?php

namespace App\Mcp\Tools;

use App\Repositories\WeatherRepository;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class CurrentWeatherTool extends Tool
{
    /**
     * Gestionar la solicitud de la herramienta.
     */
    public function handle(Request $request, WeatherRepository $weather): Response
    {
        $location = $request->get('location');

        $forecast = $weather->getForecastFor($location);

        // ...
    }
}
```

<a id="tool-annotations"></a>
### Anotaciones de herramientas

Puedes mejorar tus herramientas con [anotaciones](https://modelcontextprotocol.io/specification/2026-07-28/schema#toolannotations) para proporcionar metadatos adicionales a los clientes de IA. Estas anotaciones ayudan a los modelos de IA a comprender el comportamiento y las capacidades de la herramienta. Las anotaciones se agregan a las herramientas mediante atributos:

```php
<?php

namespace App\Mcp\Tools;

use Laravel\Mcp\Server\Tools\Annotations\IsIdempotent;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;
use Laravel\Mcp\Server\Tool;

#[IsIdempotent]
#[IsReadOnly]
class CurrentWeatherTool extends Tool
{
    //
}
```

Las anotaciones disponibles incluyen:

<div class="overflow-auto">

| Anotación | Tipo | Descripción |
| ------------------ | ------- | -------------------------------------------------------------------------------------- |
| `#[IsReadOnly]` | booleano | Indica que la herramienta no modifica su entorno.                                          |
| `#[IsDestructive]` | booleano | Indica que la herramienta puede realizar actualizaciones destructivas (solo significativas cuando no son de solo lectura).     |
| `#[IsIdempotent]` | booleano | Indica que las llamadas repetidas con los mismos argumentos no tienen ningún efecto adicional (cuando no son de solo lectura). |
| `#[IsOpenWorld]` | booleano | Indica que la herramienta puede interactuar con entidades externas.                                      |

</div>

Los valores de anotación se pueden establecer explícitamente usando argumentos booleanos:

```php
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;
use Laravel\Mcp\Server\Tools\Annotations\IsDestructive;
use Laravel\Mcp\Server\Tools\Annotations\IsOpenWorld;
use Laravel\Mcp\Server\Tools\Annotations\IsIdempotent;
use Laravel\Mcp\Server\Tool;

#[IsReadOnly(true)]
#[IsDestructive(false)]
#[IsOpenWorld(false)]
#[IsIdempotent(true)]
class CurrentWeatherTool extends Tool
{
    //
}
```

<a id="conditional-tool-registration"></a>
### Registro condicional de herramientas

Puedes registrar herramientas condicionalmente en tiempo de ejecución implementando el método `shouldRegister` en tu clase de herramienta. Este método te permite determinar si una herramienta debe estar disponible según el estado de la aplicación, la configuración o los parámetros de solicitud:

```php
<?php

namespace App\Mcp\Tools;

use Laravel\Mcp\Request;
use Laravel\Mcp\Server\Tool;

class CurrentWeatherTool extends Tool
{
    /**
     * Determinar si se debe registrar el tool.
     */
    public function shouldRegister(Request $request): bool
    {
        return $request?->user()?->subscribed() ?? false;
    }
}
```

Cuando el método `shouldRegister` de una herramienta devuelve `false`, no aparecerá en la lista de herramientas disponibles y los clientes de IA no podrán invocarlo.

<a id="tool-responses"></a>
### Respuestas de la herramienta

Las herramientas deben devolver una instancia de `Laravel\Mcp\Response`. La clase Response proporciona varios métodos convenientes para crear diferentes tipos de respuestas:

Para respuestas de texto simples, utiliza el método `text`:

```php
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;

/**
 * Gestionar la solicitud de la herramienta.
 */
public function handle(Request $request): Response
{
    // ...

    return Response::text('Weather Summary: Sunny, 72°F');
}
```

Para indicar que se produjo un error durante la ejecución de la herramienta, utiliza el método `error`:

```php
return Response::error('Unable to fetch weather data. Please try again.');
```

Para devolver contenido de imagen o audio, utiliza los métodos `image` y `audio`:

```php
return Response::image(file_get_contents(storage_path('weather/radar.png')), 'image/png');

return Response::audio(file_get_contents(storage_path('weather/alert.mp3')), 'audio/mp3');
```

También puedes cargar contenido de imagen y audio directamente desde un disco del sistema de archivos Laravel utilizando el método `fromStorage`. El tipo MIME se detectará automáticamente a partir del archivo:

```php
return Response::fromStorage('weather/radar.png');
```

Si es necesario, puedes especificar un disco en particular o anular el tipo MIME:

```php
return Response::fromStorage('weather/radar.png', disk: 's3');

return Response::fromStorage('weather/radar.png', mimeType: 'image/webp');
```

<a id="multiple-content-responses"></a>
#### Respuestas de contenido múltiple

Las herramientas pueden devolver múltiples contenidos al devolver un array de instancias `Response`:

```php
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;

/**
 * Gestionar la solicitud de la herramienta.
 *
 * @return array<int, \Laravel\Mcp\Response>
 */
public function handle(Request $request): array
{
    // ...

    return [
        Response::text('Weather Summary: Sunny, 72°F'),
        Response::text("**Detailed Forecast**\n- Morning: 65°F\n- Afternoon: 78°F\n- Evening: 70°F")
    ];
}
```

<a id="structured-responses"></a>
#### Respuestas estructuradas

Las herramientas pueden devolver [contenido estructurado](https://modelcontextprotocol.io/specification/2026-07-28/server/tools#structured-content) utilizando el método `structured`. Esto proporciona datos analizables para clientes de IA y al mismo tiempo mantiene la compatibilidad con versiones anteriores de una representación de texto codificada en JSON:

```php
return Response::structured([
    'temperature' => 22.5,
    'conditions' => 'Partly cloudy',
    'humidity' => 65,
]);
```

Si necesitas proporcionar texto personalizado junto con contenido estructurado, utiliza el método `withStructuredContent` en la fábrica de respuestas:

```php
return Response::make(
    Response::text('Weather is 22.5°C and sunny')
)->withStructuredContent([
    'temperature' => 22.5,
    'conditions' => 'Sunny',
]);
```

<a id="streaming-responses"></a>
#### Respuestas en streaming

Para operaciones de larga duración o transmisión de datos en tiempo real, las herramientas pueden devolver un [generador](https://www.php.net/manual/en/language.generators.overview.php) desde su método `handle`. Esto permite enviar actualizaciones intermedias al cliente antes de la respuesta final:

```php
<?php

namespace App\Mcp\Tools;

use Generator;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class CurrentWeatherTool extends Tool
{
    /**
     * Gestionar la solicitud de la herramienta.
     *
     * @return \Generator<int, \Laravel\Mcp\Response>
     */
    public function handle(Request $request): Generator
    {
        $locations = $request->array('locations');

        foreach ($locations as $index => $location) {
            yield Response::notification('processing/progress', [
                'current' => $index + 1,
                'total' => count($locations),
                'location' => $location,
            ]);

            yield Response::text($this->forecastFor($location));
        }
    }
}
```

Cuando se utilizan servidores basados ​​en web, las respuestas en streaming abren automáticamente un flujo SSE (Eventos enviados por el servidor) y envían cada mensaje generado como un evento al cliente.

<a id="prompts"></a>
## Prompts

[Los prompts](https://modelcontextprotocol.io/specification/2026-07-28/server/prompts) permiten que tu servidor comparta plantillas de mensajes reutilizables que los clientes de IA pueden usar para interactuar con modelos de lenguaje. Proporcionan una forma estandarizada de estructurar consultas e interacciones comunes.

<a id="creating-prompts"></a>
### Creación de prompts

Para crear un prompt, ejecuta el comando `make:mcp-prompt` Artisan:

```shell
php artisan make:mcp-prompt DescribeWeatherPrompt
```

Después de crear un prompt, regístralo en la propiedad `$prompts` de tu servidor:

```php
<?php

namespace App\Mcp\Servers;

use App\Mcp\Prompts\DescribeWeatherPrompt;
use Laravel\Mcp\Server;

class WeatherServer extends Server
{
    /**
     * The prompts registered with this MCP server.
     *
     * @var array<int, class-string<\Laravel\Mcp\Server\Prompt>>
     */
    protected array $prompts = [
        DescribeWeatherPrompt::class,
    ];
}
```

<a id="prompt-name-title-and-description"></a>
#### Nombre, título y descripción del prompt

De forma predeterminada, el nombre y el título del prompt se derivan del nombre de la clase. Por ejemplo, `DescribeWeatherPrompt` tendrá el nombre `describe-weather` y el título `Describe Weather Prompt`. Puedes personalizar estos valores utilizando los atributos `Name` y `Title`:

```php
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Title;

#[Name('weather-assistant')]
#[Title('Weather Assistant Prompt')]
class DescribeWeatherPrompt extends Prompt
{
    // ...
}
```

Las descripciones de prompts no se generan automáticamente. Siempre debes proporcionar una descripción significativa utilizando el atributo `Description`:

```php
use Laravel\Mcp\Server\Attributes\Description;

#[Description('Generates a natural-language explanation of the weather for a given location.')]
class DescribeWeatherPrompt extends Prompt
{
    //
}
```

> **Nota:**
> La descripción es una parte fundamental de los metadatos del prompt, ya que ayuda a los modelos de IA a comprender cuándo y cómo aprovechar al máximo el prompt.

<a id="prompt-arguments"></a>
### Argumentos de prompts

Los prompts pueden definir argumentos que permiten a los clientes de IA personalizar la plantilla del prompt con valores específicos. Utiliza el método `arguments` para definir qué argumentos acepta tu prompt:

```php
<?php

namespace App\Mcp\Prompts;

use Laravel\Mcp\Server\Prompt;
use Laravel\Mcp\Server\Prompts\Argument;

class DescribeWeatherPrompt extends Prompt
{
    /**
     * Obtener los argumentos del prompt.
     *
     * @return array<int, \Laravel\Mcp\Server\Prompts\Argument>
     */
    public function arguments(): array
    {
        return [
            new Argument(
                name: 'tone',
                description: 'The tone to use in the weather description (e.g., formal, casual, humorous).',
                required: true,
            ),
        ];
    }
}
```

<a id="validating-prompt-arguments"></a>
### Validación de argumentos de prompts

Los argumentos de prompts se validan automáticamente en función de su definición, pero es posible que también desees aplicar reglas de validación más complejas.

Laravel MCP se integra perfectamente con las [funciones de validación](../validation/) de Laravel. Puedes validar los argumentos del prompt entrante dentro del método `handle` del prompt:

```php
<?php

namespace App\Mcp\Prompts;

use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Prompt;

class DescribeWeatherPrompt extends Prompt
{
    /**
     * Gestionar la solicitud del prompt.
     */
    public function handle(Request $request): Response
    {
        $validated = $request->validate([
            'tone' => 'required|string|max:50',
        ]);

        $tone = $validated['tone'];

        // Generar la respuesta al prompt con el tono indicado...
    }
}
```

En caso de error de validación, los clientes de IA actuarán en función de los mensajes de error que proporciones. Como tal, es fundamental proporcionar mensajes de error claros y procesables:

```php
$validated = $request->validate([
    'tone' => ['required','string','max:50'],
],[
    'tone.*' => 'You must specify a tone for the weather description. Examples include "formal", "casual", or "humorous".',
]);
```

<a id="prompt-dependency-injection"></a>
### Inyección de dependencias de prompts

El [contenedor de servicios](../container/) de Laravel se utiliza para resolver todos los prompts. Como resultado, puedes declarar mediante tipos cualquier dependencia que tu prompt pueda necesitar en su constructor. Las dependencias declaradas se resolverán e inyectarán automáticamente en la instancia del prompt:

```php
<?php

namespace App\Mcp\Prompts;

use App\Repositories\WeatherRepository;
use Laravel\Mcp\Server\Prompt;

class DescribeWeatherPrompt extends Prompt
{
    /**
     * Crear una nueva instancia de prompt.
     */
    public function __construct(
        protected WeatherRepository $weather,
    ) {}

    //
}
```

Además de la inyección del constructor, también puedes declarar dependencias mediante tipos en el método `handle` del prompt. El contenedor de servicios resolverá e inyectará automáticamente las dependencias cuando se llame al método:

```php
<?php

namespace App\Mcp\Prompts;

use App\Repositories\WeatherRepository;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Prompt;

class DescribeWeatherPrompt extends Prompt
{
    /**
     * Gestionar la solicitud del prompt.
     */
    public function handle(Request $request, WeatherRepository $weather): Response
    {
        $isAvailable = $weather->isServiceAvailable();

        // ...
    }
}
```

<a id="conditional-prompt-registration"></a>
### Registro condicional de prompts

Puedes registrar prompts condicionalmente en tiempo de ejecución implementando el método `shouldRegister` en tu clase de prompt. Este método te permite determinar si un prompt debe estar disponible según el estado de la aplicación, la configuración o los parámetros de solicitud:

```php
<?php

namespace App\Mcp\Prompts;

use Laravel\Mcp\Request;
use Laravel\Mcp\Server\Prompt;

class CurrentWeatherPrompt extends Prompt
{
    /**
     * Determinar si se debe registrar el prompt.
     */
    public function shouldRegister(Request $request): bool
    {
        return $request?->user()?->subscribed() ?? false;
    }
}
```

Cuando el método `shouldRegister` de un prompt devuelve `false`, no aparecerá en la lista de prompts disponibles y los clientes de IA no podrán invocarlo.

<a id="prompt-responses"></a>
### Respuestas de prompts

Los prompts pueden devolver una única instancia `Laravel\Mcp\Response` o un iterable de instancias `Laravel\Mcp\Response`. Estas respuestas resumen el contenido que se enviará al cliente de IA:

```php
<?php

namespace App\Mcp\Prompts;

use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Prompt;

class DescribeWeatherPrompt extends Prompt
{
    /**
     * Gestionar la solicitud del prompt.
     *
     * @return array<int, \Laravel\Mcp\Response>
     */
    public function handle(Request $request): array
    {
        $tone = $request->string('tone');

        $systemMessage = "You are a helpful weather assistant. Please provide a weather description in a {$tone} tone.";

        $userMessage = "What is the current weather like in New York City?";

        return [
            Response::text($systemMessage)->asAssistant(),
            Response::text($userMessage),
        ];
    }
}
```

Puedes utilizar el método `asAssistant()` para indicar que un mensaje de respuesta debe tratarse como si proviniera del asistente de IA, mientras que los mensajes normales se tratan como entrada del usuario.

<a id="resources"></a>
## Recursos

[Los recursos](https://modelcontextprotocol.io/specification/2026-07-28/server/resources) permiten que tu servidor exponga datos y contenido que los clientes de IA pueden leer y usar como contexto al interactuar con modelos de lenguaje. Proporcionan una forma de compartir información estática o dinámica, como documentación, configuración o cualquier dato que ayude a informar las respuestas de la IA.

<a id="creating-resources"></a>
## Creación de recursos

Para crear un recurso, ejecuta el comando `make:mcp-resource` Artisan:

```shell
php artisan make:mcp-resource WeatherGuidelinesResource
```

Después de crear un recurso, regístralo en la propiedad `$resources` de tu servidor:

```php
<?php

namespace App\Mcp\Servers;

use App\Mcp\Resources\WeatherGuidelinesResource;
use Laravel\Mcp\Server;

class WeatherServer extends Server
{
    /**
     * The resources registered with this MCP server.
     *
     * @var array<int, class-string<\Laravel\Mcp\Server\Resource>>
     */
    protected array $resources = [
        WeatherGuidelinesResource::class,
    ];
}
```

<a id="resource-name-title-and-description"></a>
#### Nombre, título y descripción del recurso

De forma predeterminada, el nombre y el título del recurso se derivan del nombre de la clase. Por ejemplo, `WeatherGuidelinesResource` tendrá el nombre `weather-guidelines` y el título `Weather Guidelines Resource`. Puedes personalizar estos valores utilizando los atributos `Name` y `Title`:

```php
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Title;

#[Name('weather-api-docs')]
#[Title('Weather API Documentation')]
class WeatherGuidelinesResource extends Resource
{
    // ...
}
```

Las descripciones de recursos no se generan automáticamente. Siempre debes proporcionar una descripción significativa utilizando el atributo `Description`:

```php
use Laravel\Mcp\Server\Attributes\Description;

#[Description('Comprehensive guidelines for using the Weather API.')]
class WeatherGuidelinesResource extends Resource
{
    //
}
```

> **Nota:**
> La descripción es una parte fundamental de los metadatos del recurso, ya que ayuda a los modelos de IA a comprender cuándo y cómo utilizar el recurso de forma eficaz.

<a id="resource-templates"></a>
### Plantillas de recursos

[Las plantillas de recursos](https://modelcontextprotocol.io/specification/2026-07-28/server/resources#resource-templates) permiten que tu servidor exponga recursos dinámicos que coincidan con patrones de URI con variables. En lugar de definir un URI estático para cada recurso, puedes crear un único recurso que gestiona múltiples URI según un patrón de plantilla.

<a id="creating-resource-templates"></a>
#### Creación de plantillas de recursos

Para crear una plantilla de recursos, implementa la interfaz `HasUriTemplate` en tu clase de recurso y define un método `uriTemplate` que devuelva una instancia de `UriTemplate`:

```php
<?php

namespace App\Mcp\Resources;

use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\MimeType;
use Laravel\Mcp\Server\Contracts\HasUriTemplate;
use Laravel\Mcp\Server\Resource;
use Laravel\Mcp\Support\UriTemplate;

#[Description('Access user files by ID')]
#[MimeType('text/plain')]
class UserFileResource extends Resource implements HasUriTemplate
{
    /**
     * Obtener la plantilla URI de este resource.
     */
    public function uriTemplate(): UriTemplate
    {
        return new UriTemplate('file://users/{userId}/files/{fileId}');
    }

    /**
     * Gestionar la solicitud del recurso.
     */
    public function handle(Request $request): Response
    {
        $userId = $request->get('userId');
        $fileId = $request->get('fileId');

        // Obtener y devolver el contenido del archivo...

        return Response::text($content);
    }
}
```

Cuando un recurso implementa la interfaz `HasUriTemplate`, se registrará como una plantilla de recurso en lugar de un recurso estático. Luego, los clientes de IA pueden solicitar recursos utilizando URI que coincidan con el patrón de plantilla, y las variables del URI se extraerán automáticamente y estarán disponibles en el método `handle` de tu recurso.

<a id="uri-template-syntax"></a>
#### Sintaxis de plantilla URI

Las plantillas de URI utilizan marcadores de posición encerrados entre llaves para definir segmentos variables en el URI:

```php
new UriTemplate('file://users/{userId}');
new UriTemplate('file://users/{userId}/files/{fileId}');
new UriTemplate('https://api.example.com/{version}/{resource}/{id}');
```

<a id="accessing-template-variables"></a>
#### Acceso a variables de plantilla

Cuando un URI coincide con tu plantilla de recursos, las variables extraídas se fusionan automáticamente en la solicitud y se puede acceder a ellas mediante el método `get`:

```php
<?php

namespace App\Mcp\Resources;

use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Contracts\HasUriTemplate;
use Laravel\Mcp\Server\Resource;
use Laravel\Mcp\Support\UriTemplate;

class UserProfileResource extends Resource implements HasUriTemplate
{
    public function uriTemplate(): UriTemplate
    {
        return new UriTemplate('file://users/{userId}/profile');
    }

    public function handle(Request $request): Response
    {
        // Acceder a la variable extraída
        $userId = $request->get('userId');

        // Acceder a la URI completa si es necesario
        $uri = $request->uri();

        // Obtener el perfil del usuario...

        return Response::text("Profile for user {$userId}");
    }
}
```

El objeto `Request` proporciona tanto las variables extraídas como el URI original que se solicitó, ofreciéndote contexto completo para procesar la solicitud de recurso.

<a id="resource-uri-and-mime-type"></a>
### URI de recurso y tipo MIME

Cada recurso se identifica mediante un URI único y tiene un tipo MIME asociado que ayuda a los clientes de IA a comprender el formato del recurso.

De forma predeterminada, el URI del recurso se genera en función del nombre del recurso, por lo que `WeatherGuidelinesResource` tendrá un URI de `weather://resources/weather-guidelines`. El tipo MIME predeterminado es `text/plain`.

Puedes personalizar estos valores utilizando los atributos `Uri` y `MimeType`:

```php
<?php

namespace App\Mcp\Resources;

use Laravel\Mcp\Server\Attributes\MimeType;
use Laravel\Mcp\Server\Attributes\Uri;
use Laravel\Mcp\Server\Resource;

#[Uri('weather://resources/guidelines')]
#[MimeType('application/pdf')]
class WeatherGuidelinesResource extends Resource
{
}
```

El URI y el tipo MIME ayudan a los clientes de IA a determinar cómo procesar e interpretar el contenido del recurso de manera adecuada.

<a id="resource-request"></a>
### Solicitud de recursos

A diferencia de las herramientas y los prompts, los recursos no pueden definir esquemas o argumentos de entrada. Sin embargo, aún puedes interactuar con el objeto de solicitud dentro del método `handle` de tu recurso:

```php
<?php

namespace App\Mcp\Resources;

use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Resource;

class WeatherGuidelinesResource extends Resource
{
    /**
     * Gestionar la solicitud del recurso.
     */
    public function handle(Request $request): Response
    {
        // ...
    }
}
```

<a id="resource-dependency-injection"></a>
### Inyección de dependencias de recursos

El [contenedor de servicios](../container/) de Laravel se utiliza para resolver todos los recursos. Como resultado, puedes declarar mediante tipos cualquier dependencia que tu recurso pueda necesitar en su constructor. Las dependencias declaradas se resolverán e inyectarán automáticamente en la instancia del recurso:

```php
<?php

namespace App\Mcp\Resources;

use App\Repositories\WeatherRepository;
use Laravel\Mcp\Server\Resource;

class WeatherGuidelinesResource extends Resource
{
    /**
     * Crear una nueva instancia de resource.
     */
    public function __construct(
        protected WeatherRepository $weather,
    ) {}

    // ...
}
```

Además de la inyección del constructor, también puedes declarar dependencias mediante tipos en el método `handle` de tu recurso. El contenedor de servicios resolverá e inyectará automáticamente las dependencias cuando se llame al método:

```php
<?php

namespace App\Mcp\Resources;

use App\Repositories\WeatherRepository;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Resource;

class WeatherGuidelinesResource extends Resource
{
    /**
     * Gestionar la solicitud del recurso.
     */
    public function handle(WeatherRepository $weather): Response
    {
        $guidelines = $weather->guidelines();

        return Response::text($guidelines);
    }
}
```

<a id="resource-annotations"></a>
### Anotaciones de recursos

Puedes mejorar tus recursos con [anotaciones](https://modelcontextprotocol.io/specification/2026-07-28/schema#annotations) para proporcionar metadatos adicionales a los clientes de IA. Las anotaciones se agregan a los recursos mediante atributos:

```php
<?php

namespace App\Mcp\Resources;

use Laravel\Mcp\Enums\Role;
use Laravel\Mcp\Server\Annotations\Audience;
use Laravel\Mcp\Server\Annotations\LastModified;
use Laravel\Mcp\Server\Annotations\Priority;
use Laravel\Mcp\Server\Resource;

#[Audience(Role::User)]
#[LastModified('2025-01-12T15:00:58Z')]
#[Priority(0.9)]
class UserDashboardResource extends Resource
{
    //
}
```

Las anotaciones disponibles incluyen:

<div class="overflow-auto">

| Anotación | Tipo | Descripción |
| ----------------- | ------------- | --------------------------------------------------------------------- |
| `#[Audience]` | Rol o array | Especifica la audiencia prevista (`Role::User`, `Role::Assistant` o ambos). |
| `#[Priority]` | número de coma flotante | Una puntuación numérica entre 0,0 y 1,0 indica la importancia de los recursos.       |
| `#[LastModified]` | cadena | Una marca de tiempo ISO 8601 que muestra cuándo se actualizó el recurso por última vez.           |

</div>

<a id="conditional-resource-registration"></a>
### Registro condicional de recursos

Puedes registrar recursos condicionalmente en tiempo de ejecución implementando el método `shouldRegister` en tu clase de recurso. Este método te permite determinar si un recurso debe estar disponible según el estado de la aplicación, la configuración o los parámetros de solicitud:

```php
<?php

namespace App\Mcp\Resources;

use Laravel\Mcp\Request;
use Laravel\Mcp\Server\Resource;

class WeatherGuidelinesResource extends Resource
{
    /**
     * Determinar si se debe registrar el resource.
     */
    public function shouldRegister(Request $request): bool
    {
        return $request?->user()?->subscribed() ?? false;
    }
}
```

Cuando el método `shouldRegister` de un recurso devuelve `false`, no aparecerá en la lista de recursos disponibles y los clientes de IA no podrán acceder a él.

<a id="resource-responses"></a>
### Respuestas de recursos

Los recursos deben devolver una instancia de `Laravel\Mcp\Response`. La clase Response proporciona varios métodos convenientes para crear diferentes tipos de respuestas:

Para contenido de texto simple, utiliza el método `text`:

```php
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;

/**
 * Gestionar la solicitud del recurso.
 */
public function handle(Request $request): Response
{
    // ...

    return Response::text($weatherData);
}
```

<a id="resource-link-responses"></a>
#### Respuestas del enlace de recursos

Para devolver un enlace de recurso, utiliza el método `resourceLink`, proporcionando el URI y el nombre. A diferencia de un recurso integrado, un enlace de recurso devuelve un puntero URI que el cliente de IA recupera de forma independiente:

```php
return Response::resourceLink(
    uri: 'file:///data/report.json',
    name: 'monthly-report',
    mimeType: 'application/json',
);
```

También puedes pasar una clase o instancia de recurso registrada, que heredará automáticamente el URI, el nombre, el título, la descripción y el tipo MIME del recurso:

```php
return Response::resourceLink(new WeatherForecastResource);
```

<a id="resource-blob-responses"></a>
#### Respuestas de blobs

Para devolver contenido del blob, usa el método `blob` y proporciona el contenido del blob:

```php
return Response::blob(file_get_contents(storage_path('weather/radar.png')));
```

Al devolver contenido de blob, el tipo MIME estará determinado por el tipo MIME configurado del recurso:

```php
<?php

namespace App\Mcp\Resources;

use Laravel\Mcp\Server\Attributes\MimeType;
use Laravel\Mcp\Server\Resource;

#[MimeType('image/png')]
class WeatherGuidelinesResource extends Resource
{
    //
}
```

<a id="resource-error-responses"></a>
#### Respuestas de error

Para indicar que se produjo un error durante la recuperación de recursos, utiliza el método `error()`:

```php
return Response::error('Unable to fetch weather data for the specified location.');
```

<a id="apps"></a>
## Aplicaciones

Laravel MCP admite [MCP Apps](https://modelcontextprotocol.io/extensions/apps/overview), una extensión del Model Context Protocol que permite que las herramientas representen aplicaciones HTML interactivas dentro de iframes en espacio aislado en hosts compatibles. Esto te permite crear paneles, formularios, visualizaciones y otras experiencias enriquecedoras que van más allá de las respuestas de texto sin formato.

Una aplicación MCP consta de dos partes que funcionan juntas:

- Un **recurso de aplicación** que devuelve el HTML autónomo de tu aplicación.
- Una **herramienta** que está vinculada al recurso de la aplicación mediante el atributo `#[RendersApp]`. Cuando se llama a la herramienta, el host busca y representa el recurso vinculado.

<a id="creating-app-resources"></a>
### Creación de recursos de aplicaciones

Puedes crear un recurso de aplicación usando el comando `make:mcp-app-resource` Artisan:

```shell
php artisan make:mcp-app-resource WeatherDashboardApp
```

Este comando crea dos archivos: una clase PHP en `app/Mcp/Resources` y una vista Blade en `resources/views/mcp`. El nombre de la vista se infiere automáticamente del nombre de la clase. Por ejemplo, `WeatherDashboardApp` se asigna a `mcp.weather-dashboard-app`:

```php
<?php

namespace App\Mcp\Resources;

use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\AppMeta;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\AppResource;

#[Description('An interactive weather dashboard.')]
#[AppMeta]
class WeatherDashboardApp extends AppResource
{
    /**
     * Gestionar la solicitud de recurso de la app.
     */
    public function handle(Request $request): Response
    {
        return Response::view('mcp.weather-dashboard-app', [
            'title' => $this->title(),
        ]);
    }
}
```

`AppResource` extiende la clase base `Resource` y configura automáticamente el esquema URI `ui://` y el tipo MIME `text/html;profile=mcp-app` requerido por la especificación de aplicaciones MCP. Como cualquier otro recurso, debes registrarlo en el array `$resources` de tu servidor.

La vista Blade generada utiliza el componente `<x-mcp::app>`, que representa un documento HTML completo con el SDK de MCP del lado del cliente incluido y listo para usar:

```blade
<x-mcp::app :title="$title">
    <x-slot:head>
        <script type="module">
        createMcpApp(async (app) => {
            document.getElementById('run-btn').addEventListener('click', async () => {
                const result = await app.callServerTool('get-weather-data', {});
                document.getElementById('output').textContent = result.content[0]?.text ?? '';
            });
        });
        </script>
    </x-slot:head>

    <div id="app">
        <button id="run-btn">Refresh</button>
        <p id="output"></p>
    </div>
</x-mcp::app>
```

El SDK incluido proporciona el `createMcpApp` global y se encarga de conectar el iframe al servidor, aplicar temas de host y exponer funciones auxiliares como `callServerTool`, `sendMessage`, `openLink` y callbacks de eventos. Para obtener la API completa del lado del cliente, consulta la [especificación de aplicaciones MCP](https://modelcontextprotocol.io/extensions/apps/overview).

<a id="rendering-apps-from-tools"></a>
### Representación de aplicaciones desde herramientas

Para mostrar un recurso de aplicación, vincula una herramienta mediante el atributo `#[RendersApp]`. Cuando se llama a la herramienta, Laravel MCP incluye el URI del recurso en los metadatos de la herramienta para que el host pueda representar la aplicación en un iframe de espacio aislado:

```php
<?php

namespace App\Mcp\Tools;

use App\Mcp\Resources\WeatherDashboardApp;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\RendersApp;
use Laravel\Mcp\Server\Tool;

#[RendersApp(resource: WeatherDashboardApp::class)]
class ShowWeatherDashboard extends Tool
{
    /**
     * Gestionar la solicitud de la herramienta.
     */
    public function handle(Request $request): Response
    {
        return Response::text('Weather dashboard loaded.');
    }
}
```

Laravel MCP anuncia automáticamente la extensión `io.modelcontextprotocol/ui` dentro de la capacidad `extensions` del servidor cada vez que se registra cualquier `AppResource`, por lo que no se requiere configuración de servidor adicional.

<a id="app-tool-visibility"></a>
### Visibilidad de la herramienta de la aplicación

Cada herramienta `#[RendersApp]` puede limitar quién puede invocarla mediante el argumento `visibility`. Esto es útil para exponer herramientas privadas, solo de aplicaciones, a las que la interfaz de usuario llama para cargar o actualizar datos sin que esas herramientas sean visibles para el modelo:

```php
use Laravel\Mcp\Server\Attributes\RendersApp;
use Laravel\Mcp\Server\Ui\Enums\Visibility;

#[RendersApp(resource: WeatherDashboardApp::class, visibility: [Visibility::App])]
class GetWeatherData extends Tool
{
    // ...
}
```

La enumeración `Visibility` tiene dos casos, `Model` y `App`, y el valor predeterminado es ambos. Utiliza `[Visibility::App]` para acciones de backend que la interfaz de usuario llama directamente, o `[Visibility::Model]` para que una herramienta no esté disponible para la interfaz de usuario.

<a id="app-configuration"></a>
### Configuración de la aplicación

El atributo `#[AppMeta]` en el recurso de tu aplicación configura la Política de seguridad de contenido del iframe, los permisos del navegador y cualquier script de biblioteca que deba incluirse en el `<head>` de la vista:

```php
use Laravel\Mcp\Server\Attributes\AppMeta;
use Laravel\Mcp\Server\Ui\Enums\Library;
use Laravel\Mcp\Server\Ui\Enums\Permission;

#[AppMeta(
    connectDomains: ['https://api.weather.com'],
    permissions: [Permission::Geolocation],
    libraries: [Library::Tailwind, Library::Alpine],
)]
class WeatherDashboardApp extends AppResource
{
    // ...
}
```

La enumeración `Library` incluye scripts CDN preconfigurados para bibliotecas front-end comunes, como `Library::Tailwind` y `Library::Alpine`, y sus orígenes CDN se fusionan automáticamente en el CSP. La enumeración `Permission` cubre permisos del navegador como `Camera`, `Microphone`, `Geolocation` y `ClipboardWrite`.

Para la configuración calculada o dinámica, sobrescribe el método `appMeta` en tu recurso utilizando los constructores fluidos `AppMeta`, `Csp` y `Permissions` del espacio de nombres `Laravel\Mcp\Server\Ui`.

<a id="building-apps-with-boost"></a>
### Creación de aplicaciones con Boost

Laravel MCP incluye una referencia de la skill [Boost](../boost/) dedicada para crear aplicaciones MCP. Si tienes [Laravel Boost](../boost/) instalado, tu agente de codificación de IA puede invocar la skill `mcp-development` y pedirle que cree un recurso de aplicación, una vista Blade y una herramienta vinculada para ti.

Para obtener la referencia completa del protocolo, incluida la API completa del lado del cliente y los detalles del esquema, consulta la [documentación oficial de aplicaciones MCP](https://modelcontextprotocol.io/extensions/apps/overview).

<a id="metadata"></a>
## Metadatos

Laravel MCP también admite el campo `_meta` como se define en la [especificación MCP](https://modelcontextprotocol.io/specification/2026-07-28/basic#_meta), que es requerido por ciertos clientes o integraciones de MCP. Los metadatos se pueden aplicar a todas las primitivas de MCP, incluidas herramientas, recursos y prompts, así como a sus respuestas.

Puedes adjuntar metadatos al contenido de la respuesta individual utilizando el método `withMeta`:

```php
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;

/**
 * Gestionar la solicitud de la herramienta.
 */
public function handle(Request $request): Response
{
    return Response::text('The weather is sunny.')
        ->withMeta(['source' => 'weather-api', 'cached' => true]);
}
```

Para obtener metadatos a nivel de resultados que se apliquen a todo el contenedor de la respuesta, envuelve tus respuestas con `Response::make` y llama a `withMeta` en la instancia de fábrica de respuestas devuelta:

```php
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;

/**
 * Gestionar la solicitud de la herramienta.
 */
public function handle(Request $request): ResponseFactory
{
    return Response::make(
        Response::text('The weather is sunny.')
    )->withMeta(['request_id' => '12345']);
}
```

Para adjuntar metadatos a una herramienta, recurso o prompt, define una propiedad `$meta` en la clase:

```php
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tool;

#[Description('Fetches the current weather forecast.')]
class CurrentWeatherTool extends Tool
{
    protected ?array $meta = [
        'version' => '2.0',
        'author' => 'Weather Team',
    ];

    // ...
}
```

<a id="icons"></a>
## Iconos

Los clientes MCP pueden mostrar iconos para tu servidor y sus primitivas. Puedes declarar iconos en un servidor, herramienta, recurso o prompt utilizando el atributo `Icon`:

```php
use Laravel\Mcp\Enums\IconTheme;
use Laravel\Mcp\Server\Attributes\Icon;

#[Icon('mcp/server.png', mimeType: 'image/png', sizes: ['48x48'])]
#[Icon('mcp/server-dark.svg', theme: IconTheme::Dark)]
class WeatherServer extends Server
{
    // ...
}
```

El atributo `Icon` es repetible, por lo que puedes declarar varios íconos para proporcionar diferentes tamaños o variantes de temas claros y oscuros.

Alternativamente, puedes definir íconos mediante programación anulando el método `icons`, que es útil cuando un ícono depende de las condiciones de tiempo de ejecución:

```php
use Laravel\Mcp\Schema\Icon;

class CurrentWeatherTool extends Tool
{
    /**
     * Obtener los iconos de la herramienta.
     *
     * @return array<int, Icon>
     */
    public function icons(): array
    {
        return [
            Icon::from('mcp/tool.png', mimeType: 'image/png'),
        ];
    }
}
```

Los iconos definidos mediante el atributo y el método `icons` se combinan automáticamente. Las rutas de los iconos se resuelven de la siguiente manera:

<div class="content-list" markdown="1">

- Las rutas con un esquema URI, como `https:` o `data:`, se utilizan tal cual.
- Las rutas relativas se resuelven en una URL utilizando la función auxiliar `asset` de Laravel.

</div>

<a id="authentication"></a>
## Autenticación

Al igual que las rutas, puedes autenticar servidores web MCP con middleware. Agregar autenticación a tu servidor MCP requerirá que un usuario se autentique antes de utilizar cualquier capacidad del servidor.

Esta sección cubre clientes de IA externos que acceden a **los servidores MCP de tu aplicación**. Para conectar tu aplicación al servidor MCP de otro servicio utilizando las credenciales de un usuario, consulta [autenticación del cliente](#client-authentication) en su lugar.

Hay dos formas de autenticar el acceso a tu servidor MCP: autenticación simple basada en token a través de [Laravel Sanctum](../sanctum/) o cualquier token que se pase a través del encabezado HTTP `Authorization`. O puedes autenticarte a través de OAuth usando [Laravel Passport](../passport/).

<a id="oauth"></a>
### OAuth 2.1

La forma más sólida de proteger tus servidores MCP basados ​​en web es con OAuth usando [Laravel Passport](../passport/).

Al autenticar tu servidor MCP a través de OAuth, invoca el método `Mcp::oauthRoutes` en tu archivo `routes/ai.php` para registrar las rutas de registro de cliente y descubrimiento de OAuth2 requeridas. Luego, aplica el middleware `auth:api` de Passport a tu ruta `Mcp::web` en tu archivo `routes/ai.php`:

```php
use App\Mcp\Servers\WeatherExample;
use Laravel\Mcp\Facades\Mcp;

Mcp::oauthRoutes();

Mcp::web('/mcp/weather', WeatherExample::class)
    ->middleware('auth:api');
```

#### Nueva instalación de Passport

Si tu aplicación aún no utiliza Laravel Passport, sigue la [guía de instalación e implementación de Passport](../passport/#installation) para agregar Passport a tu aplicación. Debes tener un modelo `OAuthenticatable`, un nuevo guard de autenticación y claves de Passport antes de continuar.

A continuación, debes publicar la vista de autorización de Passport proporcionada por Laravel MCP:

```shell
php artisan vendor:publish --tag=mcp-views
```

Luego, indica a Passport que use esta vista usando el método `Passport::authorizationView`. Normalmente, este método debe invocarse en el método `boot` del `AppServiceProvider` de tu aplicación:

```php
use Laravel\Passport\Passport;

/**
 * Inicializar los servicios de la aplicación.
 */
public function boot(): void
{
    Passport::authorizationView(function ($parameters) {
        return view('mcp.authorize', $parameters);
    });
}
```

Esta vista se mostrará al usuario final durante la autenticación para rechazar o aprobar el intento de autenticación del agente de IA.

![Ejemplo de pantalla de autorización](data:image/png;base64,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)

> **Nota:**
> En este escenario, simplemente usamos OAuth como capa de traducción al modelo autenticable subyacente. Estamos ignorando muchos aspectos de OAuth, como los ámbitos.

#### Uso de una instalación de Passport existente

Si tu aplicación ya usa Laravel Passport, Laravel MCP debería funcionar perfectamente dentro de tu instalación de Passport existente, pero actualmente no se admiten alcances personalizados ya que OAuth se usa principalmente como una capa de traducción para el modelo autenticable subyacente.

Laravel MCP, a través del método `Mcp::oauthRoutes` discutido anteriormente, agrega, anuncia y utiliza un único alcance `mcp:use`.

#### Passport frente a Sanctum

OAuth2.1 es el mecanismo de autenticación documentado en la especificación del Model Context Protocol y es el más ampliamente admitido entre los clientes MCP. Por ese motivo, recomendamos utilizar Passport cuando sea posible.

Si tu aplicación ya utiliza [Sanctum](../sanctum/), agregar Passport puede resultar engorroso. En este caso, recomendamos usar Sanctum sin Passport hasta que tengas un requisito claro y necesario para usar un cliente MCP que solo admita OAuth.

<a id="sanctum"></a>
### Sanctum

Si deseas proteger tu servidor MCP usando [Sanctum](../sanctum/), simplemente agrega el middleware de autenticación de Sanctum a tu servidor en tu archivo `routes/ai.php`. Luego, asegúrate de que tus clientes MCP proporcionen un encabezado `Authorization: Bearer <token>` para garantizar una autenticación exitosa:

```php
use App\Mcp\Servers\WeatherExample;
use Laravel\Mcp\Facades\Mcp;

Mcp::web('/mcp/demo', WeatherExample::class)
    ->middleware('auth:sanctum');
```

<a id="custom-mcp-authentication"></a>
#### Autenticación MCP personalizada

Si tu aplicación emite sus propios tokens API personalizados, puedes autenticar tu servidor MCP asignando cualquier middleware que desees a tus rutas `Mcp::web`. Tu middleware personalizado puede inspeccionar el encabezado `Authorization` manualmente para autenticar la solicitud MCP entrante.

<a id="authorization"></a>
## Autorización

Puedes acceder al usuario actualmente autenticado a través del método `$request->user()`, lo que te permite realizar [verificaciones de autorización](../authorization/) dentro de tus herramientas y recursos de MCP:

```php
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;

/**
 * Gestionar la solicitud de la herramienta.
 */
public function handle(Request $request): Response
{
    if (! $request->user()->can('read-weather')) {
        return Response::error('Permission denied.');
    }

    // ...
}
```

<a id="client"></a>
## Cliente MCP

Además de crear servidores, Laravel MCP incluye un cliente para conectarse a otros servidores MCP, ya sean propios o de terceros. El cliente permite que tu aplicación descubra y llame a las herramientas expuestas por un servidor MCP, lo cual es especialmente útil para brindarles a tus [agentes de IA](../ai-sdk/#mcp-tools) acceso a capacidades proporcionadas por servidores MCP externos.

Por ejemplo, una aplicación de chat puede conectarse al servidor MCP de GitHub utilizando el token de GitHub de cada usuario, lo que permite a tu agente responder preguntas sobre los repositorios de ese usuario. En este escenario, tu aplicación es el cliente MCP; no es necesario crear un servidor MCP ni registrar rutas `Mcp::web`.

<a id="client-connecting"></a>
### Conexión a servidores

Puedes conectarte a un servidor MCP accesible mediante HTTP utilizando el método `Client::web`, pasando la URL del servidor:

```php
use Laravel\Mcp\Client;

$client = Client::web('https://api.githubcopilot.com/mcp/');
```

Para conectarte a un servidor MCP local que se ejecuta como un comando, usa el método `Client::local`, proporcionando el comando y los argumentos necesarios para iniciar el servidor:

```php
use Laravel\Mcp\Client;

$client = Client::local('php', ['artisan', 'mcp:start']);
```

El cliente se conecta de forma diferida y establece automáticamente la conexión la primera vez que enumera o llama a las herramientas. Si necesitas administrar la conexión manualmente, puedes utilizar los métodos `connect`, `connected` y `disconnect`:

```php
$client->connect();

if ($client->connected()) {
    $capabilities = $client->capabilities();
    $server = $client->serverInfo();
}

$client->disconnect();
```

Puedes personalizar el tiempo de espera de la solicitud utilizando el método `withTimeout`:

```php
$client = Client::web('https://api.githubcopilot.com/mcp/')->withTimeout(30);
```

<a id="named-clients"></a>
### Clientes con nombre

En lugar de crear un cliente cada vez que lo necesites, opcionalmente puedes registrar clientes con nombre reutilizables. El método `registerClient` nombra una conexión saliente; no expone un servidor MCP ni autoriza a un usuario. El registro normalmente se realiza mediante el método `boot` de un proveedor de servicios utilizando la fachada `Mcp`:

```php
use Laravel\Mcp\Client;
use Laravel\Mcp\Facades\Mcp;

Mcp::registerClient('github', fn () => Client::web('https://api.githubcopilot.com/mcp/'));
```

Una vez registrado, podrás resolver el cliente en cualquier lugar de tu aplicación por su nombre:

```php
use Laravel\Mcp\Facades\Mcp;

$client = Mcp::client('github');
```

Los clientes con nombre se resuelven una vez por solicitud y se desconectan automáticamente al final del ciclo de vida de la solicitud.

<a id="client-authentication"></a>
### Autenticación del cliente

<a id="client-bearer-tokens"></a>
#### Tokens Bearer

Para conectarte a un servidor MCP web protegido por un token Bearer, utiliza el método `withToken`. Puedes pasar una cadena de token o una función anónima que resuelva el token de forma diferida:

```php
use Illuminate\Support\Facades\Auth;
use Laravel\Mcp\Client;

$client = Client::web('https://api.githubcopilot.com/mcp/')->withToken(
    config('services.github_mcp.token'),
);

$client = Client::web('https://api.githubcopilot.com/mcp/')->withToken(
    fn () => Auth::user()->github_mcp_token,
);
```

Si ya obtuviste un token adecuado a través de [Socialite](../socialite/) u otro flujo de vinculación de cuentas, pasa ese token a `withToken`; no es necesario registrar rutas MCP OAuth.

<a id="client-oauth"></a>
#### Vincular cuentas de usuario con OAuth

Imagina una aplicación de chat donde los usuarios se conectan a un servicio de gestión de proyectos y luego le hacen preguntas a un agente como "¿Cuáles de mis tareas están atrasadas?" El servicio de gestión de proyectos externo expone un servidor MCP protegido por OAuth. Tu aplicación debe redirigir a cada usuario a la pantalla de consentimiento del servicio, intercambiar su aprobación por un token y almacenar ese token para futuras llamadas a herramientas.

Laravel MCP maneja este flujo de vinculación de cuentas utilizando `withOAuth` y `Mcp::oAuthRoutesFor`. Primero, registra un cliente con nombre en un proveedor de servicios. Las credenciales del cliente OAuth identifican tu aplicación en el servicio, mientras que `withToken` proporciona el token de acceso guardado del usuario conectado al llamar a las herramientas:

```php
use Illuminate\Support\Facades\Auth;
use Laravel\Mcp\Client;
use Laravel\Mcp\Facades\Mcp;

Mcp::registerClient('projects', fn () => Client::web('https://projects.example.com/mcp')
    ->withOAuth(
        clientId: config('services.projects.client_id'),
        clientSecret: config('services.projects.client_secret'),
    )
    ->withToken(fn () => Auth::user()->projects_token));
```

> **Nota:**
> Se pueden omitir los argumentos `clientId` y `clientSecret`. Laravel utilizará un [Documento de metadatos de ID de cliente](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization/client-registration#client-id-metadata-documents) cuando el servidor de autorización los admita, recurriendo a [registro dinámico de cliente](https://datatracker.ietf.org/doc/html/rfc7591) para servidores heredados.

El servidor de autorización debe anunciar la compatibilidad con el método de desafío de código PKCE `S256` en los metadatos de su servidor de autorización. Laravel rechazará el intento de autorización si no se anuncia el soporte de PKCE.

A continuación, registra las rutas de vinculación de cuentas en tu archivo `routes/ai.php`. El callback recibe el nombre del cliente y el resultado `TokenSet`, lo que te permite guardar el token para el usuario que inició sesión:

```php
use Illuminate\Support\Facades\Auth;
use Laravel\Mcp\Client\OAuth\TokenSet;
use Laravel\Mcp\Facades\Mcp;

Mcp::oAuthRoutesFor('projects', function (string $client, TokenSet $token) {
    Auth::user()->update([
        'projects_token' => $token->accessToken,
    ]);

    return redirect('/chat');
}, middleware: ['web', 'auth']);
```

El método `oAuthRoutesFor` registra tres rutas con nombre: una ruta de conexión (`mcp.oauth.{client}.connect`) que redirige al usuario al servidor de autorización, una ruta de callback (`mcp.oauth.{client}.callback`) que intercambia el código de autorización e invoca a tu manejador, y una ruta pública del documento de metadatos de ID de cliente (`mcp.oauth.{client}.client-metadata`).

Las rutas de conexión y callback utilizan el grupo de middleware `web` de forma predeterminada; el ejemplo anterior de vinculación de cuentas agrega `auth` para requerir que un usuario haya iniciado sesión. La ruta de metadatos no utiliza este middleware porque el servidor de autorización debe poder recuperarlo.

Tu botón "Conectar servicio de proyecto" debería enviar al usuario a la ruta de conexión:

```php
return redirect()->route('mcp.oauth.projects.connect');
```

Laravel redirige al usuario al servicio para aprobar el acceso, intercambia el código de autorización a su regreso e invoca tu callback. En solicitudes de chat posteriores, el cliente con nombre utiliza el token guardado. Por ejemplo, un [agente de AI SDK](../ai-sdk/#mcp-tools) puede exponer las herramientas del servicio:

```php
public function tools(): iterable
{
    return [
        ...Mcp::client('projects')->tools(),
    ];
}
```

Almacena tokens usando [casts](../eloquent-mutators/#encrypted-casting) cifrados y ocúltalos de la serialización del modelo. Si el servicio emite tokens que vencen, también conserva el token de actualización y la información de vencimiento del `TokenSet` y gestiona la renovación antes de realizar llamadas a la herramienta. Para los agentes en cola, resuelve las credenciales de un usuario proporcionado explícitamente en lugar de `Auth::user()`.

> **Nota:**
> `Mcp::oAuthRoutesFor` conecta a tus usuarios a un servicio externo. Por el contrario, `Mcp::oauthRoutes` permite que los clientes de IA externos se autentiquen en tus propios servidores MCP mediante Passport. No necesitas Passport ni `Mcp::oauthRoutes` para el flujo de vinculación de cuentas anterior.

<a id="client-metadata"></a>
#### Metadatos del cliente

El documento de metadatos describe tu aplicación como un cliente público de OAuth y utiliza el `APP_URL` de tu aplicación para generar el ID del cliente y la URL de callback. Por lo tanto, debes asegurarte de que la variable de entorno `APP_URL` esté configurada correctamente en producción. Puedes personalizar la ruta de metadatos y proporcionar metadatos adicionales utilizando los argumentos `clientMetadataUri` y `clientMetadata`:

```php
use Laravel\Mcp\Client\OAuth\TokenSet;
use Laravel\Mcp\Facades\Mcp;

Mcp::oAuthRoutesFor(
    'projects',
    function (string $client, TokenSet $token) {
        // Guardar el token...

        return redirect('/dashboard');
    },
    clientMetadataUri: 'oauth/projects/client.json',
    clientMetadata: [
        'client_name' => 'Acme Dashboard',
        'logo_uri' => 'https://acme.com/logo.png',
    ],
);
```

<a id="client-tools"></a>
### Herramientas

Puedes recuperar las herramientas expuestas por un servidor MCP utilizando el método `tools`, que devuelve una colección de herramientas indexadas por nombre:

```php
use Laravel\Mcp\Facades\Mcp;

$tools = Mcp::client('github')->tools();

foreach ($tools as $tool) {
    $tool->name;
    $tool->title;
    $tool->description;
    $tool->inputSchema;
}
```

El cliente pagina automáticamente a través de todas las herramientas disponibles. Puedes limitar la cantidad de herramientas devueltas utilizando el argumento `limit`:

```php
$tools = Mcp::client('github')->tools(limit: 10);
```

Para invocar una herramienta, utiliza el método `callTool`, pasando el nombre de la herramienta y un array de argumentos. La instancia `ToolResult` devuelta expone la respuesta de la herramienta:

```php
use Laravel\Mcp\Facades\Mcp;

$result = Mcp::client('github')->callTool('list_issues', [
    'owner' => 'laravel',
    'repo' => 'framework',
]);

$result->text(); // The text content of the response...
(string) $result; // Equivalent to calling text()...
$result->isError; // Whether the tool reported an error...
$result->structuredContent;  // Structured content, if any...
```

Alternativamente, puedes llamar a una herramienta directamente desde una instancia de herramienta listada:

```php
$tools = Mcp::client('github')->tools();

$result = $tools['list_issues']->call([
    'owner' => 'laravel',
    'repo' => 'framework',
]);
```

Si estás creando agentes con [Laravel AI SDK](../ai-sdk/), también puedes proporcionar herramientas desde un cliente MCP directamente a un agente, permitiendo que el modelo las llame mientras responde a un prompt. Consulta la sección [Herramientas MCP](../ai-sdk/#mcp-tools) de la documentación de AI SDK para obtener más información.

<a id="client-prompts"></a>
### Prompts

Puedes recuperar los prompts expuestos por un servidor MCP utilizando el método `prompts`, que devuelve una colección de prompts indexados por nombre:

```php
use Laravel\Mcp\Facades\Mcp;

$prompts = Mcp::client('github')->prompts();

foreach ($prompts as $prompt) {
    $prompt->name;
    $prompt->title;
    $prompt->description;
    $prompt->arguments;
}
```

El cliente pagina automáticamente a través de todos los prompts disponibles. Puedes limitar la cantidad de prompts devueltos utilizando el argumento `limit`:

```php
$prompts = Mcp::client('github')->prompts(limit: 10);
```

Para recuperar un prompt, utiliza el método `getPrompt`, pasando el nombre del prompt y un array de argumentos. La instancia `PromptResult` devuelta expone los mensajes generados:

```php
use Laravel\Mcp\Facades\Mcp;

$result = Mcp::client('github')->getPrompt('issue_to_fix_workflow', [
    'owner' => 'laravel',
    'repo' => 'framework',
    'title' => 'Fix typo in README',
    'description' => 'The installation section has a typo.',
]);

$result->text(); // The text content of the messages...
(string) $result; // Equivalent to calling text()...
$result->messages; // The raw messages returned by the prompt...
$result->description; // The prompt description, if any...
```

<a id="client-resources"></a>
### Recursos

Puedes recuperar los recursos expuestos por un servidor MCP utilizando el método `resources`, que devuelve una colección de recursos indexados por URI:

```php
use Laravel\Mcp\Facades\Mcp;

$resources = Mcp::client('github')->resources();

foreach ($resources as $resource) {
    $resource->uri;
    $resource->name;
    $resource->title;
    $resource->description;
    $resource->mimeType;
    $resource->size;
}
```

El cliente pagina automáticamente a través de todos los recursos disponibles. Puedes limitar la cantidad de recursos devueltos utilizando el argumento `limit`:

```php
$resources = Mcp::client('github')->resources(limit: 10);
```

Para leer un recurso, utiliza el método `readResource`, pasando el URI del recurso. La instancia `ResourceReadResult` devuelta expone el contenido del recurso:

```php
use Laravel\Mcp\Facades\Mcp;

$result = Mcp::client('github')->readResource('repo://laravel/framework/contents/README.md');

$result->content(); // The content of the resource, decoding base64 blobs as needed...
(string) $result; // Equivalent to calling content()...
$result->mimeType(); // The MIME type of the resource, if any...
$result->contents; // The raw contents returned by the resource...
```

<a id="testing-servers"></a>
## Pruebas de servidores

Puedes probar tus servidores MCP utilizando el MCP Inspector integrado o escribiendo pruebas unitarias.

<a id="mcp-inspector"></a>
### MCP Inspector

El [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector) es una herramienta interactiva para probar y depurar tus servidores MCP. Úsalo para conectarte a tu servidor, verificar la autenticación y probar herramientas, recursos y prompts.

Puedes ejecutar el inspector para cualquier servidor registrado:

```shell
# Web server...
php artisan mcp:inspector mcp/weather

# Local server named "weather"...
php artisan mcp:inspector weather
```

Este comando inicia MCP Inspector y proporciona la configuración del cliente que puedes copiar en tu cliente MCP para asegurarte de que todo esté configurado correctamente. Si tu servidor web está protegido por un middleware de autenticación, asegúrate de incluir los encabezados requeridos, como un token Bearer `Authorization`, al conectarte.

<a id="unit-tests"></a>
### Pruebas unitarias

Puedes escribir pruebas unitarias para tus servidores, herramientas, recursos y prompts de MCP.

Para comenzar, crea un nuevo caso de prueba e invoca la primitiva deseada en el servidor que lo registra. Por ejemplo, para probar una herramienta en `WeatherServer`:

```php tab=Pest
test('tool', function () {
    $response = WeatherServer::tool(CurrentWeatherTool::class, [
        'location' => 'New York City',
        'units' => 'fahrenheit',
    ]);

    $response
        ->assertOk()
        ->assertSee('The current weather in New York City is 72°F and sunny.');
});
```

```php tab=PHPUnit
/**
 * Probar una herramienta.
 */
public function test_tool(): void
{
    $response = WeatherServer::tool(CurrentWeatherTool::class, [
        'location' => 'New York City',
        'units' => 'fahrenheit',
    ]);

    $response
        ->assertOk()
        ->assertSee('The current weather in New York City is 72°F and sunny.');
}
```

De manera similar, puedes probar prompts y recursos:

```php
$response = WeatherServer::prompt(...);
$response = WeatherServer::resource(...);
```

También puedes actuar como usuario autenticado encadenando el método `actingAs` antes de invocar la primitiva:

```php
$response = WeatherServer::actingAs($user)->tool(...);
```

Una vez que recibas la respuesta, puedes utilizar varios métodos de aserción para verificar el contenido y el estado de la respuesta.

Puedes comprobar que una respuesta fue exitosa utilizando el método `assertOk`. Esto comprueba que la respuesta no tenga ningún error:

```php
$response->assertOk();
```

Puedes comprobar que una respuesta contiene texto específico utilizando el método `assertSee`:

```php
$response->assertSee('The current weather in New York City is 72°F and sunny.');
```

Puedes comprobar que una respuesta contiene un error utilizando el método `assertHasErrors`:

```php
$response->assertHasErrors();

$response->assertHasErrors([
    'Something went wrong.',
]);
```

Puedes comprobar que una respuesta no contiene un error utilizando el método `assertHasNoErrors`:

```php
$response->assertHasNoErrors();
```

Puedes comprobar que una respuesta contiene metadatos específicos utilizando los métodos `assertName()`, `assertTitle()` y `assertDescription()`:

```php
$response->assertName('current-weather');
$response->assertTitle('Current Weather Tool');
$response->assertDescription('Fetches the current weather forecast for a specified location.');
```

Puedes comprobar que las notificaciones se enviaron utilizando los métodos `assertSentNotification` y `assertNotificationCount`:

```php
$response->assertSentNotification('processing/progress', [
    'step' => 1,
    'total' => 5,
]);

$response->assertSentNotification('processing/progress', [
    'step' => 2,
    'total' => 5,
]);

$response->assertNotificationCount(5);
```

Finalmente, si deseas inspeccionar el contenido de la respuesta sin procesar, puedes utilizar los métodos `dd` o `dump` para generar la respuesta con fines de depuración:

```php
$response->dd();
$response->dump();
```
