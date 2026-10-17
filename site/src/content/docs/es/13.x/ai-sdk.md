---
title: "Laravel AI SDK"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Instalación](#installation)
    - [Configuración](#configuration)
    - [URL base personalizadas](#custom-base-urls)
    - [Proveedores compatibles con OpenAI](#openai-compatible-providers)
    - [Proveedores bajo demanda](#on-demand-providers)
    - [Compatibilidad con proveedores](#provider-support)
- [Agentes](#agents)
    - [Envío de prompts](#prompting)
    - [Contexto de la conversación](#conversation-context)
    - [Salida estructurada](#structured-output)
    - [Archivos adjuntos](#attachments)
    - [Transmisión en tiempo real](#streaming)
    - [Difusión](#broadcasting)
    - [Encolado](#queueing)
    - [Herramientas](#tools)
    - [Carga diferida de herramientas](#deferred-tool-loading)
    - [Herramientas de almacenamiento de archivos](#file-storage-tools)
    - [Herramientas MCP](#mcp-tools)
    - [Habilidades](#skills)
    - [Herramientas de los proveedores](#provider-tools)
    - [Subagentes](#sub-agents)
    - [Middleware](#middleware)
    - [Agentes anónimos](#anonymous-agents)
    - [Configuración de agentes](#agent-configuration)
    - [Opciones del proveedor](#provider-options)
    - [Almacenamiento de prompts en caché](#prompt-caching)
- [Aprobación humana de herramientas](#human-tool-approval)
    - [Flujo completo de aprobación](#complete-approval-flow)
- [Imágenes](#images)
- [Audio (TTS)](#audio)
- [Transcripción (STT)](#transcription)
- [Generación de resúmenes de texto](#text-summarization)
- [Embeddings](#embeddings)
    - [Embeddings multimodales](#multimodal-embeddings)
    - [Consultas de embeddings](#querying-embeddings)
    - [Almacenamiento de embeddings en caché](#caching-embeddings)
- [Reordenamiento](#reranking)
    - [Reordenamiento de colecciones](#reranking-collections)
- [Clasificación](#classification)
    - [Clasificación de imágenes](#classifying-images)
    - [Decisiones de sí o no](#yes-or-no-decisions)
    - [Selección a partir de colecciones](#choosing-from-collections)
- [Archivos](#files)
    - [Uso de archivos almacenados en conversaciones](#using-stored-files-in-conversations)
- [Almacenes vectoriales](#vector-stores)
    - [Adición de archivos a almacenes](#adding-files-to-stores)
- [Uso](#usage)
- [Conmutación por error](#failover)
- [Pruebas](#testing)
    - [Agentes](#testing-agents)
    - [Imágenes](#testing-images)
    - [Audio](#testing-audio)
    - [Transcripciones](#testing-transcriptions)
    - [Embeddings](#testing-embeddings)
    - [Reordenamiento](#testing-reranking)
    - [Clasificación](#testing-classification)
    - [Archivos](#testing-files)
    - [Almacenes vectoriales](#testing-vector-stores)
- [Eventos](#events)

<a id="introduction"></a>
## Introducción

El [Laravel AI SDK](https://github.com/laravel/ai) proporciona una API unificada y expresiva para interactuar con proveedores de IA como OpenAI, Anthropic, Gemini y otros. Con el AI SDK puedes crear agentes inteligentes con herramientas y salida estructurada, generar imágenes, sintetizar y transcribir audio, crear embeddings vectoriales y mucho más, mediante una interfaz coherente y adaptada a Laravel.

<a id="installation"></a>
## Instalación

Puedes instalar el Laravel AI SDK mediante Composer:

```shell
composer require laravel/ai
```

A continuación, debes publicar los archivos de configuración y migración del AI SDK mediante el comando Artisan `vendor:publish`:

```shell
php artisan vendor:publish --provider="Laravel\Ai\AiServiceProvider"
```

Por último, debes ejecutar las migraciones de la base de datos de tu aplicación. Esto creará las tablas `agent_conversations` y `agent_conversation_messages`, que el AI SDK utiliza para almacenar conversaciones:

```shell
php artisan migrate
```

<a id="configuration"></a>
### Configuración

Puedes definir las credenciales de tu proveedor de IA en el archivo de configuración `config/ai.php` de tu aplicación o como variables de entorno en su archivo `.env`:

```ini
ANTHROPIC_API_KEY=
AZURE_OPENAI_API_KEY=
COHERE_API_KEY=
DEEPSEEK_API_KEY=
ELEVENLABS_API_KEY=
GEMINI_API_KEY=
GROQ_API_KEY=
MISTRAL_API_KEY=
OLLAMA_API_KEY=
OPENAI_API_KEY=
OPENAI_COMPATIBLE_API_KEY=
OPENAI_COMPATIBLE_URL=
OPENROUTER_API_KEY=
JINA_API_KEY=
TYPESAFE_API_KEY=
VOYAGEAI_API_KEY=
XAI_API_KEY=
```

Los modelos predeterminados utilizados para texto, imágenes, audio, transcripción y embeddings también se pueden configurar en el archivo de configuración `config/ai.php` de tu aplicación.

<a id="custom-base-urls"></a>
### URL base personalizadas

De forma predeterminada, el Laravel AI SDK se conecta directamente al endpoint público de la API de cada proveedor. Sin embargo, puede que necesites enrutar las solicitudes a través de otro endpoint; por ejemplo, al utilizar un servicio proxy para centralizar la gestión de claves de API, implementar límites de frecuencia o enrutar el tráfico a través de una puerta de enlace corporativa.

Puedes configurar URL base personalizadas añadiendo un parámetro `url` a la configuración de tu proveedor:

```php
'providers' => [
    'openai' => [
        'driver' => 'openai',
        'key' => env('OPENAI_API_KEY'),
        'url' => env('OPENAI_URL'),
    ],

    'anthropic' => [
        'driver' => 'anthropic',
        'key' => env('ANTHROPIC_API_KEY'),
        'url' => env('ANTHROPIC_BASE_URL'),
    ],
],
```

Esto resulta útil al enrutar solicitudes a través de un servicio proxy (como LiteLLM o Azure OpenAI Gateway) o al utilizar endpoints alternativos.

Los siguientes proveedores admiten URL base personalizadas: OpenAI, Anthropic, Gemini, Groq, Cohere, DeepSeek, xAI y OpenRouter.

<a id="openai-compatible-providers"></a>
### Proveedores compatibles con OpenAI

Si utilizas una API compatible con OpenAI, como LM Studio, vLLM, Together, Fireworks o una puerta de enlace local, puedes configurar un proveedor `openai-compatible`. La opción `url` es obligatoria, mientras que `key` es opcional y se enviará como token de portador cuando esté presente:

```php
'providers' => [
    'local' => [
        'driver' => 'openai-compatible',
        'url' => env('LOCAL_AI_URL'),
        'key' => env('LOCAL_AI_API_KEY'),
    ],
],
```

Una vez configurado, puedes utilizar el proveedor con nombre como cualquier otro proveedor:

```php
agent()->prompt('What is Laravel?', provider: 'local', model: 'local-model');
```

También puedes configurar un modelo de texto predeterminado para el proveedor, de modo que no tengas que indicar un modelo explícitamente:

```php
'local' => [
    'driver' => 'openai-compatible',
    'url' => env('LOCAL_AI_URL'),
    'key' => env('LOCAL_AI_API_KEY'),
    'models' => [
        'text' => [
            'default' => env('LOCAL_AI_MODEL'),
        ],
    ],
],
```

Puedes añadir encabezados HTTP personalizados a todas las solicitudes salientes del proveedor definiendo un array `headers` en su configuración. Esto resulta útil cuando un endpoint requiere un encabezado adicional de identificación o autenticación además del token de portador:

```php
'local' => [
    'driver' => 'openai-compatible',
    'url' => env('LOCAL_AI_URL'),
    'key' => env('LOCAL_AI_API_KEY'),
    'headers' => [
        'X-Tenant-Id' => env('LOCAL_AI_TENANT_ID'),
    ],
],
```

Los proveedores compatibles con OpenAI admiten generación de texto, transmisión en tiempo real, herramientas, salida estructurada, imágenes adjuntas, embeddings y transcripción. Si tu endpoint requiere campos adicionales en el cuerpo de la solicitud, proporciónalos mediante las [opciones del proveedor](#provider-options).

<a id="openai-compatible-embeddings"></a>
#### Embeddings compatibles con OpenAI

Como los endpoints arbitrarios no tienen modelos conocidos, debes configurar un modelo de embeddings predeterminado para utilizar `embeddings()` con un proveedor compatible con OpenAI. También puedes configurar un valor fijo de dimensiones; si lo omites, la solicitud se envía sin el parámetro `dimensions` y se utilizan las dimensiones nativas del modelo.

```php
'local' => [
    'driver' => 'openai-compatible',
    'url' => env('LOCAL_AI_URL'),
    'key' => env('LOCAL_AI_API_KEY'),
    'models' => [
        'embeddings' => [
            'default' => 'text-embedding-qwen3-embedding-0.6b',
            'dimensions' => 1024, // optional
        ],
    ],
],
```

<a id="openai-compatible-transcriptions"></a>
#### Transcripciones compatibles con OpenAI

Del mismo modo, debes configurar un modelo de transcripción predeterminado para utilizar `Transcription` con un proveedor compatible con OpenAI. El audio se cargará en la ruta `/audio/transcriptions` del endpoint como una solicitud multipart estándar:

```php
'local' => [
    'driver' => 'openai-compatible',
    'url' => env('LOCAL_AI_URL'),
    'key' => env('LOCAL_AI_API_KEY'),
    'models' => [
        'transcription' => [
            'default' => 'whisper-1',
        ],
    ],
],
```

> **Nota:**
> Los proveedores compatibles con OpenAI y Groq no admiten diarización. Invocar el método `diarize` con estos proveedores lanzará una excepción.

<a id="on-demand-providers"></a>
### Proveedores bajo demanda

En ocasiones puede que necesites utilizar credenciales de proveedores que no están definidas en el archivo de configuración de tu aplicación, como claves de API almacenadas en la base de datos para cada inquilino de una aplicación multiinquilino. Puedes utilizar el método `Ai::build` para crear un proveedor a partir de un array de configuración. El array debe tener la misma estructura que una entrada de proveedor en el archivo de configuración `config/ai.php` de tu aplicación:

```php
use App\Ai\Agents\SalesCoach;
use Laravel\Ai\Ai;

$response = (new SalesCoach)->prompt('Analyze this sales transcript...', provider: [
    Ai::build([
        'driver' => 'anthropic',
        'key' => $user->anthropic_key,
    ]),
]);
```

Los proveedores bajo demanda se pueden utilizar en cualquier lugar que acepte un proveedor, incluidas las listas de [conmutación por error](#failover) y la generación de imágenes, audio, transcripciones y embeddings. Para especificar un modelo de un proveedor bajo demanda, incluye un array `models` en su configuración:

```php
$response = (new SalesCoach)->prompt('Analyze this sales transcript...', provider: [
    Ai::build(['driver' => 'anthropic', 'key' => $user->anthropic_key]),
    Ai::build([
        'driver' => 'openai',
        'key' => $user->openai_key,
        'models' => ['text' => ['default' => 'gpt-6']],
    ]),
]);
```

Cuando un agente deba utilizar siempre un proveedor bajo demanda, puedes devolverlo desde el método `provider` del agente. Como el proveedor se reconstruye cuando se utiliza el agente, este enfoque también funciona bien con los agentes [encolados](#queueing):

```php
use Laravel\Ai\Ai;
use Laravel\Ai\Providers\Provider;

public function provider(): Provider
{
    return Ai::build($this->user->aiConfiguration());
}
```

> **Nota:**
> Debes pasar los proveedores bajo demanda dentro de un array, como muestran los ejemplos anteriores. Si asignas un `name` a un proveedor bajo demanda en su array de configuración, el nombre no debe coincidir con un proveedor integrado ni con un proveedor definido en tu archivo de configuración `config/ai.php`.

<a id="provider-support"></a>
### Compatibilidad con proveedores

El AI SDK admite diversos proveedores en sus funcionalidades. La siguiente tabla resume los proveedores disponibles para cada funcionalidad:

<div class="overflow-auto">

| Funcionalidad | Proveedores |
|---|---|
| Texto | OpenAI, OpenAI Compatible, Anthropic, Gemini, Azure, Bedrock, Groq, xAI, DeepSeek, Mistral, Ollama, OpenRouter, Cohere |
| Imágenes | OpenAI, Gemini, xAI, Azure, Bedrock, OpenRouter |
| TTS | OpenAI, ElevenLabs, Gemini, Mistral, OpenRouter |
| STT | OpenAI, OpenAI Compatible, ElevenLabs, Groq, Mistral, Gemini, OpenRouter |
| Embeddings | OpenAI, OpenAI Compatible, Gemini, Azure, Bedrock, Cohere, Mistral, Jina, VoyageAI, Ollama, OpenRouter |
| Reordenamiento | Cohere, Jina, VoyageAI, Bedrock, OpenRouter |
| Clasificación | OpenAI, TypeSafe, OpenRouter |
| Archivos | OpenAI, Anthropic, Gemini, Azure, OpenRouter |

</div>

Puedes utilizar el enum `Laravel\Ai\Enums\Lab` para hacer referencia a los proveedores en tu código en lugar de usar cadenas simples:

```php
use Laravel\Ai\Enums\Lab;

Lab::Anthropic;
Lab::OpenAI;
Lab::OpenAiCompatible;
Lab::Gemini;
// ...
```

<a id="agents"></a>
## Agentes

Los agentes son el componente fundamental para interactuar con proveedores de IA en el Laravel AI SDK. Cada agente es una clase PHP dedicada que encapsula las instrucciones, el contexto de la conversación, las herramientas y el esquema de salida necesarios para interactuar con un modelo de lenguaje grande. Piensa en un agente como un asistente especializado —un asesor de ventas, un analizador de documentos o un bot de soporte— que configuras una vez y al que envías prompts según lo necesites en tu aplicación.

Puedes crear un agente mediante el comando Artisan `make:agent`:

```shell
php artisan make:agent SalesCoach

php artisan make:agent SalesCoach --structured
```

Dentro de la clase de agente generada, puedes definir el prompt del sistema o las instrucciones, el contexto de los mensajes, las herramientas disponibles y el esquema de salida (si corresponde):

```php
<?php

namespace App\Ai\Agents;

use App\Ai\Tools\RetrievePreviousTranscripts;
use App\Models\History;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Messages\Message;
use Laravel\Ai\Promptable;
use Stringable;

class SalesCoach implements Agent, Conversational, HasTools, HasStructuredOutput
{
    use Promptable;

    public function __construct(public User $user) {}

    /**
     * Obtener las instrucciones que debe seguir el agente.
     */
    public function instructions(): Stringable|string
    {
        return 'You are a sales coach, analyzing transcripts and providing feedback and an overall sales strength score.';
    }

    /**
     * Obtener la lista de mensajes que conforman la conversación hasta el momento.
     */
    public function messages(): iterable
    {
        return History::where('user_id', $this->user->id)
            ->latest()
            ->limit(50)
            ->get()
            ->reverse()
            ->map(function ($message) {
                return new Message($message->role, $message->content);
            })->all();
    }

    /**
     * Obtener las herramientas disponibles para el agente.
     *
     * @return Tool[]
     */
    public function tools(): iterable
    {
        return [
            new RetrievePreviousTranscripts,
        ];
    }

    /**
     * Obtener la definición del esquema de salida estructurada del agente.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'feedback' => $schema->string()->required(),
            'score' => $schema->integer()->min(1)->max(10)->required(),
        ];
    }
}
```

<a id="prompting"></a>
### Envío de prompts

Para enviar un prompt a un agente, primero crea una instancia mediante el método `make` o una instanciación estándar y, a continuación, llama a `prompt`:

```php
$response = (new SalesCoach)
    ->prompt('Analyze this sales transcript...');

return (string) $response;
```

El método `make` resuelve tu agente desde el contenedor, lo que permite la inyección automática de dependencias. También puedes pasar argumentos al constructor del agente:

```php
$agent = SalesCoach::make(user: $user);
```

Si pasas argumentos adicionales al método `prompt`, puedes sustituir el proveedor, el modelo o el tiempo de espera HTTP predeterminados al enviar el prompt:

```php
$response = (new SalesCoach)->prompt(
    'Analyze this sales transcript...',
    provider: Lab::Anthropic,
    model: 'claude-sonnet-5',
    timeout: 120,
);
```

<a id="raw-http-responses"></a>
#### Respuestas HTTP sin procesar

Cada respuesta devuelta por un agente que genera texto expone la respuesta HTTP sin procesar de la llamada subyacente a la API del proveedor mediante una propiedad `raw`. Esto te permite acceder a información específica del proveedor que no forma parte de la respuesta genérica del AI SDK: encabezados de límites de frecuencia, ID de solicitudes u otros campos exactos de la carga útil:

```php
$response = (new SalesCoach)->prompt('Analyze this sales transcript...');

$response->raw; // Illuminate\Http\Client\Response|null

$response->raw->header('X-RateLimit-Remaining-Requests');
$response->raw->json('id');
```

En un bucle de llamadas a herramientas, cada paso conserva la respuesta sin procesar de su propia solicitud:

```php
foreach ($response->steps as $step) {
    $step->raw?->header('X-RateLimit-Remaining-Requests');
}
```

> **Nota:** La propiedad `raw` es `null` al transmitir una respuesta en tiempo real, al utilizar el proveedor Bedrock (que realiza sus llamadas a la API mediante el AWS SDK en lugar de un cliente HTTP) y en las respuestas simuladas, a menos que se proporcione una explícitamente mediante `withRawResponse`.

<a id="conversation-context"></a>
### Contexto de la conversación

Si tu agente implementa la interfaz `Conversational`, puedes utilizar el método `messages` para devolver el contexto previo de la conversación, si corresponde:

```php
/**
 * Obtener la lista de mensajes que conforman la conversación hasta el momento.
 */
public function messages(): iterable
{
    return $this->user->history()
        ->latest()
        ->limit(50)
        ->get()
        ->reverse()
        ->map(fn ($message) => new Message(
            $message->role, $message->content,
        ))->all();
}
```

Si tu agente no implementa la interfaz `Conversational`, puedes utilizar el método `withMessages` para proporcionar el historial de la conversación para una única ejecución, como un historial enviado por el frontend de tu aplicación:

```php
use Laravel\Ai\Messages\Message;

$response = (new SalesCoach)
    ->withMessages([
        new Message('user', 'Analyze this sales transcript...'),
        new Message('assistant', 'The rep never asked for the close.'),
    ])
    ->prompt('What should they say next time?');
```

Los agentes que implementan la interfaz `Conversational` cargan su propio historial, por lo que combinar ambos enfoques lanzará una `LogicException`.

<a id="remembering-conversations"></a>
#### Conservación de conversaciones

> **Advertencia:** Antes de utilizar el trait `RemembersConversations`, debes publicar y ejecutar las migraciones del AI SDK mediante el comando Artisan `vendor:publish`. Estas migraciones crearán las tablas necesarias de la base de datos para almacenar conversaciones.

Si quieres que Laravel almacene y recupere automáticamente el historial de conversación de tu agente, puedes utilizar el trait `RemembersConversations`. Este trait proporciona una forma sencilla de guardar los mensajes de la conversación en la base de datos sin implementar manualmente la interfaz `Conversational`:

```php
<?php

namespace App\Ai\Agents;

use Laravel\Ai\Concerns\RemembersConversations;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Promptable;

class SalesCoach implements Agent, Conversational
{
    use Promptable, RemembersConversations;

    /**
     * Obtener las instrucciones que debe seguir el agente.
     */
    public function instructions(): string
    {
        return 'You are a sales coach...';
    }
}
```

Al utilizar el trait `RemembersConversations`, no definas manualmente un método `messages` en tu clase de agente. Si existe un método `messages`, tendrá prioridad sobre la implementación del trait y el historial de la conversación no se cargará desde la base de datos.

Para iniciar una nueva conversación para un usuario, llama al método `forUser` antes de enviar el prompt:

```php
$response = (new SalesCoach)->forUser($user)->prompt('Hello!');

$conversationId = $response->conversationId;
```

El ID de la conversación se devuelve en la respuesta y se puede almacenar para consultarlo más adelante. Si quieres recuperar todas las conversaciones de un usuario mediante Eloquent, puedes añadir el trait `HasConversations` a tu modelo de usuario:

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Ai\Concerns\HasConversations;

class User extends Authenticatable
{
    use HasConversations;
}
```

Una vez añadido el trait a tu modelo, puedes recuperar y consultar las conversaciones del usuario mediante la relación `conversations`:

```php
$conversations = $user->conversations()
    ->latest('updated_at')
    ->paginate(20);
```

Para continuar una conversación existente, utiliza el método `continue`:

```php
$response = (new SalesCoach)
    ->continue($conversationId, as: $user)
    ->prompt('Tell me more about that.');
```

Puedes utilizar el método `continueOrStart` para continuar la conversación indicada o iniciar una nueva si el ID proporcionado es `null`:

```php
$response = (new SalesCoach)
    ->continueOrStart($conversationId, as: $user)
    ->prompt('Hello!');
```

Al utilizar el trait `RemembersConversations`, los mensajes anteriores se cargan automáticamente y se incluyen en el contexto de la conversación al enviar prompts. Los nuevos mensajes (tanto del usuario como del asistente) se almacenan automáticamente después de cada interacción. Cada respuesta también contiene los ID de la conversación y de los mensajes almacenados:

```php
$response->conversationId;
$response->userMessageId;
$response->assistantMessageId;
```

<a id="conversation-participants"></a>
#### Participantes de la conversación

Aunque los usuarios son los participantes más habituales, las conversaciones pueden pertenecer a cualquier modelo de Eloquent. Utiliza el método `forParticipant` para iniciar una conversación para otro tipo de modelo:

```php
$response = (new SalesCoach)
    ->forParticipant($team)
    ->prompt('Review our latest sales results.');
```

La clase polimórfica y la clave primaria del participante se almacenan con la conversación. Por tanto, los modelos de distintos tipos que tienen la misma clave primaria, como `User` con ID `1` y `Team` con ID `1`, tienen historiales de conversación separados. El método `forUser` es un alias de `forParticipant`.

Puedes continuar la conversación más reciente del participante con el agente mediante el método `continueLastConversation`. Las conversaciones se limitan al agente, por lo que solo se continuarán aquellas en las que este haya participado:

```php
$response = (new SalesCoach)
    ->continueLastConversation($team)
    ->prompt('Tell me more about that.');
```

Al continuar una conversación concreta, pasa el participante al método `continue`:

```php
$response = (new SalesCoach)
    ->continue($conversationId, as: $team)
    ->prompt('Tell me more about that.');
```

El trait `HasConversations` se puede añadir a cualquier modelo de Eloquent que participe en conversaciones. La relación `conversations` resultante es una relación polimórfica limitada al tipo y la clave primaria de ese modelo. También puedes acceder al participante al que pertenece una conversación mediante su relación inversa:

```php
$conversations = $team->conversations;

$participant = $conversation->participant;
```

Si tu aplicación utiliza varios tipos de modelos de participantes, deberías considerar la definición de un [mapa polimórfico de Eloquent](../eloquent-relationships/#custom-polymorphic-types) para que los tipos de participantes almacenados no queden acoplados a los nombres de tus clases de modelo.

> **Advertencia:**
> Los métodos `continue` y `continueOrStart` no verifican que el participante indicado sea el propietario de la conversación. Tu aplicación debe autorizar el acceso a la conversación antes de continuarla.

<a id="inspecting-stored-conversations"></a>
#### Inspección de conversaciones almacenadas

Al mostrar una conversación a tus usuarios, a menudo necesitas detalles como los ID de mensajes, las marcas de tiempo y las llamadas a herramientas. Puedes resolver el almacén de conversaciones desde el contenedor de servicios para leer los mensajes almacenados sin consultar directamente las tablas del AI SDK:

```php
use Laravel\Ai\Contracts\ConversationStore;

$store = app(ConversationStore::class);
```

Los mensajes se paginan mediante un cursor, comenzando por los más recientes, y se devuelven como instancias de `StoredMessage`, que contienen el ID, las marcas de tiempo, el uso, los metadatos y los archivos adjuntos de cada mensaje:

```php
$messages = $store->paginateConversationMessages($conversationId, perPage: 25);

foreach ($messages as $message) {
    $message->id;
    $message->role;
    $message->content;
    $message->createdAt;
    $message->usage;
    $message->status;
}
```

Cada turno, que consiste en un prompt del usuario y la respuesta del asistente, se almacena como una lista de pasos. Un paso es una única solicitud al proveedor, por lo que un turno en el que el modelo llame a herramientas contendrá varios pasos. El resultado de cada herramienta se registra en la llamada a la herramienta que lo produjo. Los métodos `toolCalls`, `providerToolCalls` y `toolResults` aplanan estos pasos en orden, de modo que no tienes que recorrerlos manualmente:

```php
$message->steps;

$message->toolCalls();
$message->providerToolCalls();
$message->toolResults();
```

Una llamada a una herramienta contiene un `result` una vez ejecutada. Las llamadas que contienen un `approval_reason` pero ningún `result` aún esperan una [aprobación de herramienta](#human-tool-approval).

La propiedad `status` contiene una instancia de `Laravel\Ai\Enums\MessageStatus`. Un turno que falla a mitad de ejecución se almacena como `Failed` junto con los pasos que ya había completado, de modo que las llamadas a herramientas ejecutadas antes del fallo permanecen en el historial. Cuando la conversación continúa, cualquier llamada sin un resultado registrado se envía al modelo marcada como interrumpida, ya que Laravel no puede determinar si se ejecutó.

Antes de continuar una conversación mediante un ID proporcionado por el frontend de tu aplicación, debes verificar que la conversación se almacenó para el participante indicado:

```php
abort_unless($store->conversationBelongsTo(
    $conversationId, $user->getMorphClass(), $user->getKey()
), 403);
```

Si el turno más reciente está en pausa esperando una [aprobación de herramienta](#human-tool-approval), puedes mostrar sus llamadas a herramientas pendientes tras recargar la página sin reanudar la ejecución:

```php
foreach ($store->pendingApprovalsFor($conversationId) as $approval) {
    // $approval->id, $approval->tool, $approval->arguments, $approval->reason...
}
```

Estos métodos están definidos por los contratos `PaginatesConversations`, `VerifiesConversationOwnership` y `ResolvesPendingApprovals`. El almacén de base de datos incluido implementa los tres, mientras que un almacén personalizado puede implementar solo los contratos que necesite.

<a id="structured-output"></a>
### Salida estructurada

Si quieres que tu agente devuelva una salida estructurada, implementa la interfaz `HasStructuredOutput`, que requiere que tu agente defina un método `schema`:

```php
<?php

namespace App\Ai\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Promptable;

class SalesCoach implements Agent, HasStructuredOutput
{
    use Promptable;

    // ...

    /**
     * Obtener la definición del esquema de salida estructurada del agente.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'score' => $schema->integer()->required(),
        ];
    }
}
```

Al enviar un prompt a un agente que devuelve una salida estructurada, puedes acceder a la `StructuredAgentResponse` devuelta como si fuera un array:

```php
$response = (new SalesCoach)->prompt('Analyze this sales transcript...');

return $response['score'];
```

<a id="structured-output-nested-objects"></a>
#### Objetos anidados

Para definir una salida estructurada anidada, utiliza el método `object` con una función anónima:

```php
<?php

namespace App\Ai\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Promptable;

class SalesCoach implements Agent, HasStructuredOutput
{
    use Promptable;

    // ...

    /**
     * Obtener la definición del esquema de salida estructurada del agente.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'score' => $schema->integer()->required(),
            'metadata' => $schema->object(fn ($schema) => [
                'confidence' => $schema->string()->enum(['low', 'medium', 'high'])->required(),
                'language' => $schema->string()->required(),
            ])->required(),
        ];
    }
}
```

<a id="structured-output-arrays-of-objects"></a>
#### Arrays de objetos

Si tu agente debe devolver una lista de elementos estructurados, combina los métodos `array` y `object`:

```php
public function schema(JsonSchema $schema): array
{
    return [
        'feedback' => $schema->array()
            ->items(
                $schema->object(fn ($schema) => [
                    'comment' => $schema->string()->required(),
                    'score' => $schema->integer()->required(),
                ])
            )
            ->required(),
    ];
}
```

Si un valor puede coincidir con uno de varios esquemas, utiliza el método `anyOf`:

```php
public function schema(JsonSchema $schema): array
{
    return [
        'content' => $schema->anyOf([
            $schema->object(fn ($schema) => [
                'type' => $schema->string()->enum(['article'])->required(),
                'title' => $schema->string()->required(),
            ]),
            $schema->object(fn ($schema) => [
                'type' => $schema->string()->enum(['image'])->required(),
                'url' => $schema->string()->required(),
            ]),
        ])->required(),
    ];
}
```

<a id="attachments"></a>
### Archivos adjuntos

Al enviar un prompt, también puedes pasar archivos adjuntos para que el modelo inspeccione imágenes y documentos:

```php
use App\Ai\Agents\SalesCoach;
use Laravel\Ai\Files;

$response = (new SalesCoach)->prompt(
    'Analyze the attached sales transcript...',
    attachments: [
        Files\Document::fromStorage('transcript.pdf'), // Attach a document from a filesystem disk...
        Files\Document::fromPath('/home/laravel/transcript.md'), // Attach a document from a local path...
        $request->file('transcript'), // Attach an uploaded file...
    ]
);
```

Del mismo modo, puedes utilizar la clase `Laravel\Ai\Files\Image` para adjuntar imágenes a un prompt:

```php
use App\Ai\Agents\ImageAnalyzer;
use Laravel\Ai\Files;

$response = (new ImageAnalyzer)->prompt(
    'What is in this image?',
    attachments: [
        Files\Image::fromStorage('photo.jpg'), // Attach an image from a filesystem disk...
        Files\Image::fromPath('/home/laravel/photo.jpg'), // Attach an image from a local path...
        $request->file('photo'), // Attach an uploaded file...
    ]
);
```

<a id="streaming"></a>
### Transmisión en tiempo real

Puedes transmitir la respuesta de un agente en tiempo real invocando el método `stream`. La `StreamableAgentResponse` devuelta se puede devolver desde una ruta para enviar automáticamente una respuesta en tiempo real (SSE) al cliente:

```php
use App\Ai\Agents\SalesCoach;

Route::get('/coach', function () {
    return (new SalesCoach)->stream('Analyze this sales transcript...');
});
```

Puedes utilizar el método `then` para proporcionar una función anónima que se invocará cuando se haya transmitido toda la respuesta al cliente:

```php
use App\Ai\Agents\SalesCoach;
use Laravel\Ai\Responses\StreamedAgentResponse;

Route::get('/coach', function () {
    return (new SalesCoach)
        ->stream('Analyze this sales transcript...')
        ->then(function (StreamedAgentResponse $response) {
            // $response->text, $response->events, $response->usage...
        });
});
```

También puedes recorrer manualmente los eventos transmitidos:

```php
$stream = (new SalesCoach)->stream('Analyze this sales transcript...');

foreach ($stream as $event) {
    // ...
}
```

La respuesta también contiene el razonamiento del modelo y las fuentes que haya citado. Ambos se almacenan con el mensaje del asistente al utilizar el trait `RemembersConversations`:

```php
use Laravel\Ai\Responses\StreamedAgentResponse;

(new SalesCoach)
    ->stream('Analyze this sales transcript...')
    ->then(function (StreamedAgentResponse $response) {
        $response->reasoning; // '' unless the model returned reasoning text...
        $response->meta->citations;
    });
```

El razonamiento también está disponible en las respuestas devueltas por el método `prompt`.

<a id="streaming-using-the-vercel-ai-sdk-protocol"></a>
<a id="stream-protocols"></a>
#### Protocolos de transmisión

De forma predeterminada, las respuestas transmitidas utilizan el formato de eventos propio del AI SDK. Sin embargo, puedes utilizar en su lugar un protocolo de transmisión del frontend, lo que permite conectar tu agente a una interfaz de chat existente en vez de crear una propia.

Puedes transmitir los eventos mediante el [protocolo de transmisión de Vercel AI SDK](https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol) invocando el método `usingVercelDataProtocol` en la respuesta transmisible:

```php
use App\Ai\Agents\SalesCoach;

Route::get('/coach', function () {
    return (new SalesCoach)
        ->stream('Analyze this sales transcript...')
        ->usingVercelDataProtocol();
});
```

Puedes pasar un ID de mensaje si el frontend de tu aplicación asigna los suyos:

```php
->usingVercelDataProtocol($request->string('messageId'));
```

Como alternativa, puedes utilizar el método `usingAgentUserInteractionProtocol` para transmitir mediante el [protocolo Agent User Interaction (AG-UI)](https://docs.ag-ui.com):

```php
Route::post('/coach', function (Request $request) {
    return (new SalesCoach)
        ->forUser($request->user())
        ->stream($request->string('prompt'))
        ->usingAgentUserInteractionProtocol();
});
```

Los argumentos `threadId` y `runId` son opcionales y sus valores predeterminados son el ID de la conversación y el ID de la invocación:

```php
->usingAgentUserInteractionProtocol(
    threadId: $request->input('threadId'),
    runId: $request->input('runId'),
);
```

Para utilizar un protocolo que el AI SDK no implementa, puedes pasar tu propia implementación de `Laravel\Ai\Streaming\Protocols\StreamProtocol` al método `usingProtocol`:

```php
use App\Ai\Protocols\CustomProtocol;

return (new SalesCoach)
    ->stream('Analyze this sales transcript...')
    ->usingProtocol(new CustomProtocol);
```

<a id="chat-requests"></a>
<a id="frontend-integration"></a>
#### Integración con el frontend

Las interfaces de chat creadas con bibliotecas como `useChat` de Vercel o CopilotKit ya muestran mensajes, llamadas a herramientas y solicitudes de aprobación, por lo que tu aplicación solo necesita gestionar las solicitudes que envían. Cada solicitud contiene el historial de la conversación, el mensaje más reciente del usuario y las respuestas de aprobación de herramientas.

Los métodos `Vercel::chat` y `AgentUserInteraction::chat` convierten una solicitud de este tipo en un objeto que se puede pasar directamente al método `stream` de un agente:

```php
use Laravel\Ai\Vercel\Vercel;

Route::post('/chat', function (Request $request) {
    $chat = Vercel::chat($request);

    return (new SupportAgent)
        ->withMessages($chat->history())
        ->stream($chat)
        ->usingProtocol($chat->protocol());
});
```

Si la solicitud contiene [decisiones de aprobación](#human-tool-approval), el agente se reanudará utilizando esas decisiones. En caso contrario, se enviará al agente el mensaje más reciente del usuario y los archivos adjuntos de la solicitud. El método `protocol` devuelve el protocolo utilizado por el cliente.

> **Nota:**
> Los agentes que implementan la interfaz `Conversational` cargan su propio historial, por lo que se puede omitir el método `withMessages`.

El método `AgentUserInteraction::chat` proporciona la misma API para clientes AG-UI, además de los ID de hilo y ejecución de la solicitud:

```php
use Laravel\Ai\AgentUserInteraction\AgentUserInteraction;

$chat = AgentUserInteraction::chat($request);

$chat->threadId();
$chat->runId();
```

También puedes convertir los mensajes almacenados al formato que espera un cliente, para que este pueda mostrar una conversación anterior, por ejemplo, después de recargar la página:

```php
$messages = $conversation->messages()->oldest()->get();

return ['messages' => Vercel::toUiMessages($messages)];
```

El método `AgentUserInteraction::toClientState` realiza la misma conversión para clientes AG-UI, además de devolver las interrupciones de aprobación pendientes:

```php
return AgentUserInteraction::toClientState($messages);
```

<a id="broadcasting"></a>
### Difusión

Puedes difundir los eventos transmitidos de varias formas. En primer lugar, puedes invocar simplemente el método `broadcast` o `broadcastNow` en un evento transmitido:

```php
use App\Ai\Agents\SalesCoach;
use Illuminate\Broadcasting\Channel;

$stream = (new SalesCoach)->stream('Analyze this sales transcript...');

foreach ($stream as $event) {
    $event->broadcast(new Channel('channel-name'));
}
```

O puedes invocar el método `broadcastOnQueue` de un agente para encolar su operación y difundir los eventos transmitidos a medida que estén disponibles:

```php
(new SalesCoach)->broadcastOnQueue(
    'Analyze this sales transcript...',
    new Channel('channel-name'),
);
```

<a id="skipping-oversized-events"></a>
#### Omisión de eventos demasiado grandes

Algunas plataformas de difusión limitan los mensajes WebSocket a unos 10 KB. Los eventos de transmisión con muchos datos, como los resultados de herramientas grandes, pueden superar este límite y provocar un fallo en la difusión. Puedes excluir determinados tipos de eventos de la difusión mediante el atributo `WithoutBroadcasting`:

```php
<?php

namespace App\Ai\Agents;

use Laravel\Ai\Attributes\WithoutBroadcasting;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Promptable;
use Laravel\Ai\Streaming\Events\ToolCall;
use Laravel\Ai\Streaming\Events\ToolResult;

#[WithoutBroadcasting(ToolCall::class, ToolResult::class)]
class SearchAgent implements Agent, HasTools
{
    use Promptable;

    // ...
}
```

Los eventos excluidos nunca se difunden, pero se guardan igualmente en la tabla `agent_conversation_messages`, de modo que tu frontend pueda cargar los datos completos de las herramientas una vez finalizada la transmisión. Esto funciona tanto para la difusión encolada (`broadcastOnQueue`) como para la síncrona (`broadcast` / `broadcastNow`).

<a id="queueing"></a>
### Encolado

Mediante el método `queue` de un agente, puedes enviarle un prompt y permitir que procese la respuesta en segundo plano, manteniendo una experiencia rápida y fluida en tu aplicación. Los métodos `then` y `catch` permiten registrar funciones anónimas que se invocarán cuando haya una respuesta disponible o se produzca una excepción:

```php
use Illuminate\Http\Request;
use Laravel\Ai\Responses\AgentResponse;
use Throwable;

Route::post('/coach', function (Request $request) {
    (new SalesCoach)
        ->queue($request->input('transcript'))
        ->then(function (AgentResponse $response) {
            // ...
        })
        ->catch(function (Throwable $e) {
            // ...
        });

    return back();
});
```

<a id="tools"></a>
### Herramientas

Puedes utilizar herramientas para dotar a los agentes de funcionalidades adicionales que puedan usar al responder a prompts. Las herramientas se pueden crear mediante el comando Artisan `make:tool`:

```shell
php artisan make:tool RandomNumberGenerator
```

La herramienta generada se colocará en el directorio `app/Ai/Tools` de tu aplicación. Cada herramienta contiene un método `handle` que el agente invocará cuando necesite utilizarla:

```php
<?php

namespace App\Ai\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class RandomNumberGenerator implements Tool
{
    /**
     * Obtener la descripción del propósito de la herramienta.
     */
    public function description(): Stringable|string
    {
        return 'This tool may be used to generate cryptographically secure random numbers.';
    }

    /**
     * Ejecutar la herramienta.
     */
    public function handle(Request $request): Stringable|string
    {
        return (string) random_int($request['min'], $request['max']);
    }

    /**
     * Obtener la definición del esquema de la herramienta.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'min' => $schema->integer()->min(0)->required(),
            'max' => $schema->integer()->required(),
        ];
    }
}
```

Una vez definida tu herramienta, puedes devolverla desde el método `tools` de cualquiera de tus agentes:

```php
use App\Ai\Tools\RandomNumberGenerator;

/**
 * Obtener las herramientas disponibles para el agente.
 *
 * @return Tool[]
 */
public function tools(): iterable
{
    return [
        new RandomNumberGenerator,
    ];
}
```

<a id="runtime-tool-overrides"></a>
#### Sustitución de herramientas en tiempo de ejecución

El método `withTools` permite sustituir las herramientas declaradas por una instancia de agente. Esto resulta útil para conjuntos de herramientas específicos de cada inquilino o controlados mediante indicadores de funcionalidades:

```php
$response = (new SupportAgent)
    ->withTools([new LookupOrder])
    ->prompt('Where is order 12345?');
```

También puedes pasar una función anónima que reciba las herramientas declaradas del agente y permita añadirlas o filtrarlas:

```php
$response = (new SupportAgent)
    ->withTools(fn (array $tools) => [...$tools, new LookupOrder])
    ->prompt('Where is order 12345?');
```

<a id="validating-tool-arguments"></a>
#### Validación de argumentos de herramientas

Aunque el esquema de tu herramienta limita los argumentos que puede proporcionar un modelo, puedes validar los argumentos entrantes mediante el método `validate` de la solicitud:

```php
public function handle(Request $request): Stringable|string
{
    $validated = $request->validate([
        'city' => 'required|string',
        'days' => 'required|integer|max:7',
    ]);

    return $this->forecast($validated['city'], $validated['days']);
}
```

Cuando la validación falla, los mensajes de validación se devuelven al modelo como resultado de la herramienta, lo que le permite corregir los argumentos y volver a llamar a la herramienta.

<a id="repairing-tool-calls"></a>
#### Reparación de llamadas a herramientas

Utiliza el atributo `RepairToolCalls` para que un agente se recupere cuando un modelo llame a una herramienta local desconocida. Laravel devuelve al modelo la llamada fallida con los nombres de las herramientas locales disponibles, permitiéndole corregir la llamada:

```php
use Laravel\Ai\Attributes\RepairToolCalls;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Promptable;

#[RepairToolCalls]
class SupportAgent implements Agent, HasTools
{
    use Promptable;

    // ...
}
```

Cuando Laravel calcula automáticamente el número máximo de pasos, este atributo añade un paso para la llamada reparada. Los límites explícitos de `MaxSteps` no cambian.

<a id="similarity-search"></a>
#### Búsqueda por similitud

La herramienta `SimilaritySearch` permite a los agentes buscar documentos similares a una consulta mediante embeddings vectoriales almacenados en tu base de datos. Esto resulta útil para la generación aumentada por recuperación (RAG) cuando quieres que los agentes puedan buscar en los datos de tu aplicación.

La forma más sencilla de crear una herramienta de búsqueda por similitud es utilizar el método `usingModel` con un modelo de Eloquent que tenga embeddings vectoriales:

```php
use App\Models\Document;
use Laravel\Ai\Tools\SimilaritySearch;

public function tools(): iterable
{
    return [
        SimilaritySearch::usingModel(Document::class, 'embedding'),
    ];
}
```

El primer argumento es la clase del modelo de Eloquent y el segundo es la columna que contiene los embeddings vectoriales.

También puedes proporcionar un umbral mínimo de similitud entre `0.0` y `1.0` y una función anónima para personalizar la consulta:

```php
SimilaritySearch::usingModel(
    model: Document::class,
    column: 'embedding',
    minSimilarity: 0.7,
    limit: 10,
    query: fn ($query) => $query->where('published', true),
),
```

Para tener más control, puedes crear una herramienta de búsqueda por similitud con una función anónima personalizada que devuelva los resultados de la búsqueda:

```php
use App\Models\Document;
use Laravel\Ai\Tools\SimilaritySearch;

public function tools(): iterable
{
    return [
        new SimilaritySearch(using: function (string $query) {
            return Document::query()
                ->where('user_id', $this->user->id)
                ->whereVectorSimilarTo('embedding', $query)
                ->limit(10)
                ->get();
        }),
    ];
}
```

Puedes personalizar la descripción de la herramienta mediante el método `withDescription`:

```php
SimilaritySearch::usingModel(Document::class, 'embedding')
    ->withDescription('Search the knowledge base for relevant articles.'),
```

<a id="deferred-tool-loading"></a>
### Carga diferida de herramientas

De forma predeterminada, todas las herramientas que expone un agente se envían al proveedor con cada solicitud. Cuando un agente proporciona muchas herramientas, esto consume tokens y puede reducir la precisión del modelo al seleccionar herramientas. Mediante la herramienta de proveedor `ToolSearch` con OpenAI, Azure o Anthropic, puedes diferir las definiciones de las herramientas para que el proveedor solo las cargue cuando sean necesarias:

```php
use App\Ai\Tools\RefundOrder;
use App\Ai\Tools\SearchInvoices;
use App\Ai\Tools\Weather;
use Laravel\Ai\Providers\Tools\ToolSearch;

public function tools(): iterable
{
    return [
        new Weather,
        new ToolSearch(tools: [
            new SearchInvoices,
            new RefundOrder,
        ]),
    ];
}
```

Las herramientas envueltas no requieren ninguna modificación. El proveedor las buscará y cargará cuando sean relevantes para el prompt; después, el agente podrá llamarlas como a cualquier otra herramienta.

Al utilizar Anthropic, el argumento `strategy` permite determinar cómo debe buscar el proveedor las herramientas diferidas. Las estrategias admitidas son `regex` (predeterminada) y `bm25`:

```php
new ToolSearch(tools: [new SearchInvoices], strategy: 'bm25'),
```

Al utilizar Anthropic, puedes pasar opciones adicionales específicas del proveedor a la herramienta de búsqueda mediante el método `withProviderOptions`:

```php
(new ToolSearch(tools: [new SearchInvoices]))
    ->withProviderOptions(['cache_control' => ['type' => 'ephemeral']]),
```

> **Advertencia:**
> Los proveedores que no admitan la búsqueda de herramientas lanzarán una excepción en lugar de descartar silenciosamente las herramientas diferidas. Además, Anthropic requiere que se proporcione al menos una herramienta fuera del contenedor `ToolSearch`.

<a id="file-storage-tools"></a>
### Herramientas de almacenamiento de archivos

La fábrica de herramientas `FileStorage` permite dar a los agentes acceso a un [disco del sistema de archivos](../filesystem/) de Laravel. El método `all` devuelve herramientas que permiten al agente listar, leer, inspeccionar, generar URL para, escribir, eliminar, copiar y mover archivos en el disco indicado:

```php
use Laravel\Ai\Tools\FileStorage;

public function tools(): iterable
{
    return FileStorage::all('local');
}
```

Si tu agente solo debe poder inspeccionar archivos, utiliza el método `readOnly`:

```php
return FileStorage::readOnly('local');
```

Estos métodos devuelven una `Illuminate\Support\Collection`, lo que permite filtrar aún más las herramientas que se proporcionan al agente:

```php
use Laravel\Ai\Tools\Filesystem\DeleteFile;

return FileStorage::all('s3')
    ->reject(fn ($tool) => $tool instanceof DeleteFile);
```

<a id="mcp-tools"></a>
### Herramientas MCP

Si tu aplicación utiliza [Laravel MCP](../mcp/), puedes proporcionar a tus agentes herramientas expuestas por servidores de [Model Context Protocol](https://modelcontextprotocol.io). Mediante el [cliente de Laravel MCP](../mcp/#client), puedes conectarte a un servidor MCP remoto o local y pasar sus herramientas directamente a tu agente.

> **Nota:**
> Las herramientas MCP requieren que el paquete [Laravel MCP](../mcp/) esté instalado en tu aplicación.

Como el método `tools` de un cliente MCP devuelve una colección, expándela en el array `tools` de tu agente mediante el operador `...`:

```php
use App\Ai\Tools\RandomNumberGenerator;
use Laravel\Mcp\Client;

/**
 * Obtener las herramientas disponibles para el agente.
 *
 * @return Tool[]
 */
public function tools(): iterable
{
    return [
        ...Client::web('https://mcp.example.com')
            ->withToken($token)
            ->tools(),

        new RandomNumberGenerator,
    ];
}
```

El AI SDK envuelve automáticamente cada herramienta MCP para que el agente pueda llamarla como a cualquier otra herramienta. También puedes utilizar un [cliente MCP con nombre](../mcp/#named-clients):

```php
use Laravel\Mcp\Facades\Mcp;

public function tools(): iterable
{
    return [
        ...Mcp::client('github')->tools(),
    ];
}
```

O conectarte a un [servidor MCP local](../mcp/#client-connecting):

```php
use Laravel\Mcp\Client;

public function tools(): iterable
{
    return [
        ...Client::local('php', ['artisan', 'mcp:start'])->tools(),
    ];
}
```

Para obtener más información sobre cómo crear y autenticar clientes MCP, incluidos los tokens de portador y OAuth, consulta la [documentación del cliente MCP](../mcp/#client).

<a id="skills"></a>
### Habilidades

Las [habilidades de agentes](https://agentskills.io) son carpetas de instrucciones y archivos complementarios que enseñan a un agente a realizar una tarea concreta. Como las habilidades siguen un estándar abierto, la misma habilidad se puede compartir entre los agentes de tu aplicación y los agentes de programación que utilizas para crearla.

Cada habilidad es un directorio dentro del directorio `resources/skills` de tu aplicación que contiene un archivo `SKILL.md`. Los demás archivos del directorio, como documentos de referencia, se incluyen con la habilidad:

```text
resources/skills/
└── refund-policy/
    ├── SKILL.md
    └── references/EDGE-CASES.md
```

El archivo `SKILL.md` comienza con un frontmatter YAML que contiene el `name` de la habilidad y una `description` de cuándo debe utilizarse, seguido de sus instrucciones:

```markdown
---
name: refund-policy
description: Use when a customer asks for a refund or disputes a charge.
---

# Refund Policy

Customers may request a full refund within 30 days of purchase...
```

Si se omite el `name`, se utilizará el nombre del directorio de la habilidad. Las habilidades sin `description` se ignoran.

Para dar a un agente acceso a tus habilidades, implementa la interfaz `HasSkills` y devuelve las fuentes de tus habilidades desde el método `skills`:

```php
use Laravel\Ai\Contracts\HasSkills;
use Laravel\Ai\Skills\Skill;

class SupportAgent implements Agent, HasSkills
{
    use Promptable;

    public function skills(): iterable
    {
        return [
            resource_path('skills'),
            base_path('.agents/skills'),
            new Skill('house-style', 'Use when you write copy for a customer.', view('skills.house-style')),
            fn () => $this->user->team->skills->map(
                fn ($skill) => new Skill($skill->name, $skill->description, $skill->instructions)
            ),
        ];
    }
}
```

Las fuentes pueden ser directorios, instancias de `Skill` o funciones anónimas que devuelvan habilidades y que solo se invoquen cuando el agente las necesite. Cuando dos habilidades comparten un nombre, tiene prioridad la fuente que aparece primero.

El agente recibe una herramienta `LoadSkill` que enumera el nombre y la descripción de cada habilidad y carga sus instrucciones completas y los archivos de texto incluidos solo cuando un prompt lo requiere. No se devuelven archivos binarios ni archivos de más de 256 KB.

<a id="provider-tools"></a>
### Herramientas de los proveedores

Las herramientas de los proveedores son herramientas especiales implementadas de forma nativa por los proveedores de IA, que ofrecen capacidades como búsqueda web, obtención de URL y búsqueda de archivos. A diferencia de las herramientas normales, las ejecuta el propio proveedor en lugar de tu aplicación.

El método `tools` de tu agente puede devolver herramientas de los proveedores.

<a id="web-search"></a>
#### Búsqueda web

La herramienta de proveedor `WebSearch` permite a los agentes buscar información en tiempo real en la web. Esto resulta útil para responder preguntas sobre acontecimientos actuales, datos recientes o temas que pueden haber cambiado desde la fecha límite de entrenamiento del modelo.

**Proveedores compatibles:** Anthropic, OpenAI, Azure, Gemini, xAI, Groq, OpenRouter

```php
use Laravel\Ai\Providers\Tools\WebSearch;

public function tools(): iterable
{
    return [
        new WebSearch,
    ];
}
```

Puedes configurar la herramienta de búsqueda web para limitar el número de búsquedas o restringir los resultados a dominios específicos:

```php
(new WebSearch)->max(5)->allow(['laravel.com', 'php.net']),
```

Para refinar los resultados de búsqueda según la ubicación del usuario, utiliza el método `location`:

```php
(new WebSearch)->location(
    city: 'New York',
    region: 'NY',
    country: 'US'
);
```

> **Nota:**
> Groq solo admite la búsqueda web en sus modelos GPT-OSS e ignora los métodos `max`, `allow` y `location`.

<a id="web-fetch"></a>
#### Obtención de páginas web

La herramienta de proveedor `WebFetch` permite a los agentes obtener y leer el contenido de páginas web. Esto resulta útil cuando necesitas que el agente analice URL específicas o recupere información detallada de páginas web conocidas.

**Proveedores compatibles:** Anthropic, Gemini, OpenRouter

```php
use Laravel\Ai\Providers\Tools\WebFetch;

public function tools(): iterable
{
    return [
        new WebFetch,
    ];
}
```

Puedes configurar la herramienta de obtención de páginas web para limitar el número de obtenciones o restringirlas a dominios específicos:

```php
(new WebFetch)->max(3)->allow(['docs.laravel.com']),
```

<a id="file-search"></a>
#### Búsqueda de archivos

La herramienta de proveedor `FileSearch` permite a los agentes buscar entre los [archivos](#files) almacenados en [almacenes vectoriales](#vector-stores). Esto permite la generación aumentada por recuperación (RAG) al dejar que el agente busque información relevante en los documentos que has cargado.

**Proveedores compatibles:** OpenAI, Azure, Gemini, xAI

```php
use Laravel\Ai\Providers\Tools\FileSearch;

public function tools(): iterable
{
    return [
        new FileSearch(stores: ['store_id']),
    ];
}
```

Puedes proporcionar varios ID de almacenes vectoriales para buscar en varios almacenes:

```php
new FileSearch(stores: ['store_1', 'store_2']);
```

Si tus archivos tienen [metadatos](#adding-files-to-stores), puedes filtrar los resultados de búsqueda proporcionando un argumento `where`. Para filtros de igualdad sencillos, pasa un array:

```php
new FileSearch(stores: ['store_id'], where: [
    'author' => 'Taylor Otwell',
    'year' => 2026,
]);
```

Para filtros más complejos, puedes pasar una función anónima que reciba una instancia de `FileSearchQuery`:

```php
use Laravel\Ai\Providers\Tools\FileSearchQuery;

new FileSearch(stores: ['store_id'], where: fn (FileSearchQuery $query) =>
    $query->where('author', 'Taylor Otwell')
        ->whereNot('status', 'draft')
        ->whereIn('category', ['news', 'updates'])
);
```

<a id="code-execution"></a>
#### Ejecución de código

La herramienta de proveedor `CodeExecution` permite a los agentes ejecutar código en un entorno aislado alojado por el proveedor de IA. Esto resulta útil para realizar cálculos y analizar datos.

**Proveedores compatibles:** Anthropic, OpenAI, Azure, Gemini, xAI, Groq

```php
use Laravel\Ai\Providers\Tools\CodeExecution;

public function tools(): iterable
{
    return [new CodeExecution];
}
```

Al utilizar OpenAI o Azure, puedes poner [archivos almacenados](#files) a disposición del entorno aislado mediante las opciones del proveedor:

```php
(new CodeExecution)->withProviderOptions([
    'container' => ['type' => 'auto', 'file_ids' => ['file_123']],
]);
```

> **Nota:**
> Groq solo admite la ejecución de código en sus modelos GPT-OSS.

<a id="sub-agents"></a>
### Subagentes

El método `tools` de un agente también puede devolver otros agentes. Cuando un agente se devuelve como herramienta, el agente principal puede delegar una tarea concreta al subagente y utilizar su respuesta al responder al prompt original. Esto resulta útil cuando un agente de propósito general necesita acceder a agentes especializados con sus propias instrucciones, herramientas, configuración del modelo o preferencias de proveedor.

Por ejemplo, un agente de atención al cliente podría delegar las preguntas sobre la elegibilidad para reembolsos a un agente dedicado a reembolsos:

```php
<?php

namespace App\Ai\Agents;

use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Promptable;

class CustomerSupportAgent implements Agent, HasTools
{
    use Promptable;

    /**
     * Obtener las instrucciones que debe seguir el agente.
     */
    public function instructions(): string
    {
        return 'You help customers with account, order, and billing questions. Delegate refund policy questions to the refunds specialist.';
    }

    /**
     * Obtener las herramientas disponibles para el agente.
     *
     * @return Tool[]
     */
    public function tools(): iterable
    {
        return [
            new RefundsAgent,
        ];
    }
}
```

Para personalizar cómo se expone el subagente al agente principal, implementa la interfaz `CanActAsTool` en el subagente y define un nombre y una descripción para la herramienta:

```php
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Contracts\CanActAsTool;
use Laravel\Ai\Enums\Lab;

#[Provider(Lab::Anthropic)]
class RefundsAgent implements Agent, CanActAsTool, HasTools
{
    /**
     * Obtener el nombre de la herramienta del agente.
     */
    public function name(): string
    {
        return 'refunds_specialist';
    }

    /**
     * Obtener la descripción de la herramienta del agente.
     */
    public function description(): string
    {
        return 'Determine whether an order is eligible for a refund and explain the next step.';
    }

    // ...
}
```

Si un subagente no implementa `CanActAsTool`, Laravel utilizará el nombre base de su clase como nombre de la herramienta y una descripción genérica que pide al agente principal que pase una descripción de tarea clara y autosuficiente. Cada invocación del subagente se ejecuta de forma aislada y no recibe el historial de conversación del agente principal.

Cuando el agente principal [transmite en tiempo real](#streaming), sus subagentes también lo hacen. El agente principal emite eventos `ToolResult` que contienen el texto que el subagente ha producido hasta ese momento. Estos eventos se marcan como preliminares y van seguidos del resultado final de la llamada a la herramienta, por lo que puedes omitirlos al recorrer los eventos manualmente:

```php
use Laravel\Ai\Streaming\Events\ToolResult;

foreach ($stream as $event) {
    if ($event instanceof ToolResult && $event->preliminary) {
        continue;
    }

    // ...
}
```

Los valores de respuesta como `text`, `usage` y `toolResults` ignoran los eventos preliminares. El [protocolo de Vercel](#stream-protocols) los muestra como salida nativa de herramientas en tiempo real, por lo que `useChat` muestra el progreso sin código personalizado, mientras que el protocolo AG-UI los informa como instantáneas de actividad. El texto, el razonamiento, las citas y el uso de la respuesta completada incluyen los del subagente.

<a id="middleware"></a>
### Middleware

Los agentes admiten middleware, lo que permite interceptar y modificar cada paso de generación antes de enviarlo al proveedor. El middleware se invoca una vez por paso, por lo que una ejecución de tres pasos lo invocará tres veces. Puedes crear middleware mediante el comando Artisan `make:agent-middleware`:

```shell
php artisan make:agent-middleware LogPrompts
```

El middleware generado se colocará en el directorio `app/Ai/Middleware` de tu aplicación. Para añadir middleware a un agente, implementa la interfaz `HasMiddleware` y define un método `middleware` que devuelva un array de clases de middleware:

```php
<?php

namespace App\Ai\Agents;

use App\Ai\Middleware\LogPrompts;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasMiddleware;
use Laravel\Ai\Promptable;

class SalesCoach implements Agent, HasMiddleware
{
    use Promptable;

    // ...

    /**
     * Obtener el middleware del agente.
     */
    public function middleware(): array
    {
        return [
            new LogPrompts,
        ];
    }
}
```

Cada clase de middleware debe definir un método `handle` que reciba un `PendingStep` y un `Closure` que pase el paso al siguiente middleware:

```php
<?php

namespace App\Ai\Middleware;

use Closure;
use Illuminate\Support\Facades\Log;
use Laravel\Ai\PendingStep;

class LogPrompts
{
    /**
     * Gestionar el paso de generación pendiente.
     */
    public function handle(PendingStep $step, Closure $next)
    {
        Log::info('Prompting agent', ['model' => $step->model]);

        return $next($step);
    }
}
```

Además del `provider`, `model`, `instructions`, `messages` y `tools` que están a punto de enviarse, el paso expone los pasos ya completados, su uso combinado y el progreso de la ejecución:

```php
$step->steps;
$step->usage;

$step->number;
$step->isFirstStep();
$step->isFinalStep;
```

Los métodos `withModel`, `withInstructions`, `withMessages`, `withTools`, `onlyTools`, `withoutTools`, `withToolChoice`, `withMaxTokens` y `withProviderOptions` devuelven cada uno una copia del paso. Por ejemplo, puedes eliminar una herramienta costosa una vez que el agente la haya utilizado:

```php
public function handle(PendingStep $step, Closure $next)
{
    if (! $step->isFirstStep()) {
        $step = $step->withoutTools('SearchDocumentation');
    }

    return $next($step);
}
```

O puedes mantener un bucle largo de llamadas a herramientas dentro de la ventana de contexto resumiendo la parte central de la conversación:

```php
use App\Ai\Agents\Summarizer;
use Laravel\Ai\Messages\UserMessage;

public function handle(PendingStep $step, Closure $next)
{
    if (count($step->messages) > 40) {
        $summary = (new Summarizer)->prompt(
            collect(array_slice($step->messages, 1, -10))->map->content->implode("\n"),
        )->text;

        $step = $step->withMessages([
            $step->messages[0],
            new UserMessage("Summary of the conversation so far: {$summary}"),
            ...array_slice($step->messages, -10),
        ]);
    }

    return $next($step);
}
```

Los mensajes pasados al método `withMessages` solo cambian lo que se envía para el paso actual. Los pasos posteriores y la conversación almacenada siguen utilizando el historial completo, sin resumir.

Puedes utilizar el método `then` para ejecutar código una vez que el modelo haya respondido al paso, antes de que se ejecuten sus llamadas a herramientas. Esto funciona tanto para respuestas síncronas como para respuestas transmitidas en tiempo real:

```php
use Laravel\Ai\Gateway\StepResponse;

public function handle(PendingStep $step, Closure $next)
{
    return $next($step)->then(function (StepResponse $response) {
        Log::info('Agent responded', ['text' => $response->text]);
    });
}
```

El middleware debe devolver el resultado de `$next` o su propia `StepResponse` para responder al paso sin invocar el modelo, como al servir una respuesta en caché. Devolver cualquier otro valor lanzará una `LogicException`.

<a id="anonymous-agents"></a>
### Agentes anónimos

En ocasiones puede que quieras interactuar rápidamente con un modelo sin crear una clase de agente dedicada. Puedes crear un agente anónimo para un fin específico mediante la función `agent`:

```php
use function Laravel\Ai\{agent};

$response = agent(
    instructions: 'You are an expert at software development.',
    messages: [],
    tools: [],
)->prompt('Tell me about Laravel');
```

Los agentes anónimos también pueden producir salida estructurada:

```php
use Illuminate\Contracts\JsonSchema\JsonSchema;

use function Laravel\Ai\{agent};

$response = agent(
    schema: fn (JsonSchema $schema) => [
        'number' => $schema->integer()->required(),
    ],
)->prompt('Generate a random number less than 100');
```

<a id="agent-configuration"></a>
### Configuración de agentes

Puedes configurar las opciones de generación de texto de un agente mediante atributos de PHP. Están disponibles los siguientes atributos:

- `MaxSteps`: El número máximo de pasos que puede realizar el agente al utilizar herramientas.
- `MaxTokens`: El número máximo de tokens que puede generar el modelo.
- `Model`: El modelo que debe utilizar el agente.
- `Provider`: El proveedor de IA (o los proveedores para conmutación por error) que se utilizará para el agente.
- `Temperature`: La temperatura de muestreo utilizada para la generación (de 0.0 a 1.0).
- `Timeout`: El tiempo de espera HTTP en segundos para las solicitudes del agente (predeterminado: 60).
- `TopP`: La probabilidad de muestreo de núcleo utilizada para la generación (de 0.0 a 1.0).
- `UseCheapestModel`: Utiliza el modelo de texto más económico del proveedor para optimizar costos.
- `UseSmartestModel`: Utiliza el modelo de texto más capaz del proveedor para tareas complejas.

```php
<?php

namespace App\Ai\Agents;

use Laravel\Ai\Attributes\MaxSteps;
use Laravel\Ai\Attributes\MaxTokens;
use Laravel\Ai\Attributes\Model;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Attributes\Temperature;
use Laravel\Ai\Attributes\Timeout;
use Laravel\Ai\Attributes\TopP;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Promptable;

#[Provider(Lab::Anthropic)]
#[Model('claude-sonnet-5')]
#[MaxSteps(10)]
#[MaxTokens(4096)]
#[Temperature(0.7)]
#[Timeout(120)]
#[TopP(0.9)]
class SalesCoach implements Agent
{
    use Promptable;

    // ...
}
```

Los atributos `UseCheapestModel` y `UseSmartestModel` permiten seleccionar automáticamente el modelo más económico o más capaz de un proveedor sin especificar un nombre de modelo. Esto resulta útil cuando quieres optimizar el costo o la capacidad entre distintos proveedores:

```php
use Laravel\Ai\Attributes\UseCheapestModel;
use Laravel\Ai\Attributes\UseSmartestModel;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Promptable;

#[UseCheapestModel]
class SimpleSummarizer implements Agent
{
    use Promptable;

    // Will use the cheapest model (e.g., Haiku)...
}

#[UseSmartestModel]
class ComplexReasoner implements Agent
{
    use Promptable;

    // Will use the most capable model (e.g., Opus)...
}
```

> **Nota:**
> El modelo subyacente seleccionado por `UseCheapestModel` y `UseSmartestModel` puede cambiar entre versiones del Laravel AI SDK a medida que los proveedores publican nuevos modelos. Cambiar de modelo puede introducir cambios de comportamiento, parámetros obsoletos y diferencias significativas de costo. Si necesitas un modelo y unos precios estables y predecibles, especifica el modelo explícitamente mediante el atributo `Model`.

<a id="provider-options"></a>
### Opciones del proveedor

Si tu agente necesita pasar opciones específicas del proveedor (como el esfuerzo de razonamiento o los ajustes de penalización de OpenAI), implementa el contrato `HasProviderOptions` y define un método `providerOptions`:

```php
<?php

namespace App\Ai\Agents;

use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasProviderOptions;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Promptable;

class SalesCoach implements Agent, HasProviderOptions
{
    use Promptable;

    // ...

    /**
     * Obtener las opciones de generación específicas del provider.
     */
    public function providerOptions(Lab|string $provider): array
    {
        return match ($provider) {
            Lab::OpenAI => [
                'reasoning' => ['effort' => 'low'],
                'frequency_penalty' => 0.5,
                'presence_penalty' => 0.3,
            ],
            Lab::Anthropic => [
                'thinking' => ['budget_tokens' => 1024],
                'cache_control' => ['type' => 'ephemeral'],
            ],
            default => [],
        };
    }
}
```

El método `providerOptions` recibe el proveedor que se está utilizando (enum `Lab` o cadena), lo que permite devolver opciones distintas para cada proveedor. Esto es especialmente útil al utilizar la [conmutación por error](#failover), ya que cada proveedor alternativo puede recibir su propia configuración.

El ejemplo anterior de Anthropic también habilita el [almacenamiento de prompts en caché](#prompt-caching) mediante `cache_control`.

Los constructores de [imágenes](#images), [audio](#audio), [transcripción](#transcription), [embeddings](#embeddings) y [reordenamiento](#reranking) también aceptan opciones del proveedor:

```php
use Laravel\Ai\Audio;

$audio = Audio::of('I love coding with Laravel.')
    ->withProviderOptions(['speed' => 1.25])
    ->generate();
```

También puedes pasar una función anónima en lugar de un array; recibirá el proveedor que se está utilizando.

<a id="custom-http-headers"></a>
#### Encabezados HTTP personalizados

Los encabezados configurados para un proveedor en el archivo de configuración `config/ai.php` de tu aplicación se envían con todas las solicitudes que realiza. Para enviar encabezados por solicitud, como los metadatos utilizados por una puerta de enlace de IA, puedes utilizar el método `withHeaders`, disponible en los constructores de imágenes, audio, transcripción, embeddings y reordenamiento, así como en las [cargas de archivos](#files):

```php
use Laravel\Ai\Embeddings;

$embeddings = Embeddings::for($chunks)
    ->withHeaders(['cf-aig-metadata' => json_encode(['team' => $team->id])])
    ->withProviderOptions(['dimensions' => 1024])
    ->generate();
```

Los encabezados también se pueden proporcionar como una función anónima, que recibe el proveedor que se está utilizando. Los encabezados no se incluyen en el cuerpo de la solicitud ni afectan a las [claves de caché de embeddings](#caching-embeddings).

<a id="prompt-caching"></a>
### Almacenamiento de prompts en caché

La mayoría de los proveedores almacenan automáticamente en caché los prefijos de prompts repetidos y facturan la parte almacenada con un descuento. OpenAI, Gemini, Groq, DeepSeek y xAI no requieren configuración, y puedes consultar el ahorro mediante el uso de la respuesta:

```php
$response->usage->cacheReadInputTokens;
$response->usage->cacheWriteInputTokens;
```

Ambos recuentos son subconjuntos del total de tokens de entrada, que se explica con más detalle en la [documentación de uso](#usage).

Los proveedores `anthropic` y `bedrock` solo utilizan la caché cuando se solicita. Los atributos `CacheInstructions` y `CacheToolDefinitions` colocan un punto de corte de caché al final de las instrucciones y las definiciones de herramientas de tu agente, de modo que cada conversación lee ese prefijo de la caché en lugar de volver a escribirlo:

```php
use Laravel\Ai\Attributes\CacheInstructions;
use Laravel\Ai\Attributes\CacheToolDefinitions;

#[CacheInstructions]
#[CacheToolDefinitions]
class SalesCoach implements Agent
{
    use Promptable;

    // ...
}
```

Si tus instrucciones cambian en cada solicitud, por ejemplo, porque incluyen la fecha actual, utiliza únicamente `CacheToolDefinitions`. Al almacenar en caché un prefijo que cambia en cada solicitud, se crea una entrada nueva cada vez, por lo que pagas por escribirla en la caché sin reutilizarla nunca.

Los proveedores que no admiten estos atributos los ignoran, por lo que un agente puede declararlos de forma segura al utilizar la [conmutación por error](#failover).

Los prefijos almacenados en caché se conservan durante cinco minutos de forma predeterminada. Anthropic puede conservarlos durante una hora si pasas un TTL al atributo:

```php
#[CacheInstructions('1h')]
#[CacheToolDefinitions('1h')]
```

Como alternativa, puedes habilitar el almacenamiento automático en caché de Anthropic mediante una [opción del proveedor](#provider-options) `cache_control` de nivel superior. Esto coloca un único punto de corte después del último bloque de la solicitud, por lo que el punto de corte avanza a medida que crece la conversación y cada turno lee los anteriores desde la caché. Ambos mecanismos se pueden combinar.

> **Advertencia:**
> Como los proveedores construyen los prompts en el orden herramientas, instrucciones y mensajes, almacenar las instrucciones en caché durante una hora también requiere almacenar las definiciones de herramientas durante una hora. Combinar duraciones distintas lanza una `InvalidArgumentException`.

<a id="human-tool-approval"></a>
## Aprobación humana de herramientas

> **Advertencia:**
> La aprobación de herramientas requiere que el historial del turno pausado esté disponible al reanudar la ejecución. Debes utilizar un agente `Conversational`, como uno que use el trait `RemembersConversations`, o proporcionar el historial desde el frontend de tu aplicación mediante el [método `withMessages`](#conversation-context). Los agentes que no hagan ninguna de las dos cosas lanzarán una `ApprovalNotResumableException` cuando una herramienta pause la ejecución.

Las herramientas que realizan acciones sensibles o irreversibles pueden requerir aprobación humana antes de ejecutarse. Para que una herramienta admita aprobación, implementa el contrato `Approvable` y utiliza el trait `InteractsWithApprovals`. Las herramientas que admiten aprobación la requieren de forma predeterminada:

```php
<?php

namespace App\Ai\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\Storage;
use Laravel\Ai\Concerns\InteractsWithApprovals;
use Laravel\Ai\Contracts\Approvable;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class DeleteFile implements Approvable, Tool
{
    use InteractsWithApprovals;

    /**
     * Obtener la descripción del propósito de la herramienta.
     */
    public function description(): Stringable|string
    {
        return 'Delete a file from storage.';
    }

    /**
     * Ejecutar la herramienta.
     */
    public function handle(Request $request): Stringable|string
    {
        Storage::delete($request['path']);

        return "Deleted [{$request['path']}].";
    }

    /**
     * Obtener la definición del esquema de la herramienta.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'path' => $schema->string()->required(),
        ];
    }
}
```

Para determinar si se necesita aprobación en función de los argumentos de la llamada a la herramienta, define un método `needsApproval` en ella. Este método puede devolver un booleano o una instancia de `Approval` que incluya el motivo de la solicitud de aprobación:

```php
use Laravel\Ai\Approvals\Approval;

/**
 * Determinar si la herramienta requiere aprobación para la solicitud indicada.
 */
protected function needsApproval(Request $request): Approval|bool
{
    return str_starts_with($request['path'], 'temporary/')
        ? false
        : Approval::required('This will permanently delete a file.');
}
```

Puedes sustituir el requisito de aprobación de una herramienta al devolverla desde el método `tools` de un agente:

```php
public function tools(): iterable
{
    return [
        (new SendNotification)->withoutApproval(),
        (new DeleteFile)->requireApproval('Deletion review required.'),
    ];
}
```

Cuando se llama a una herramienta que admite aprobación, el agente se pausa antes de ejecutarla. Puedes inspeccionar las aprobaciones pendientes de la respuesta, que contienen el ID, el nombre de la herramienta, los argumentos y el motivo de aprobación de cada llamada:

```php
$response = (new FileAssistant)
    ->forUser($user)
    ->prompt('Delete the old invoice.');

if ($response->hasPendingApprovals()) {
    foreach ($response->pendingApprovals as $approval) {
        // $approval->id
        // $approval->tool
        // $approval->arguments
        // $approval->reason
    }
}
```

Para reanudar el agente, continúa la conversación y proporciona una instancia de `Decisions` que contenga una decisión para cada llamada a herramienta pendiente. Las decisiones pueden aprobar la llamada, rechazarla o editar sus argumentos antes de la ejecución:

```php
use Laravel\Ai\Approvals\Decision;
use Laravel\Ai\Approvals\Decisions;

$response = (new FileAssistant)
    ->continue($conversationId, as: $user)
    ->prompt(Decisions::from([
        'call_abc' => Decision::approve(),
        'call_ghi' => Decision::reject('The invoice must be retained.'),
    ]));
```

> **Importante:**
> Los turnos pausados se identifican por su conversación y las llamadas a herramientas pendientes, no por el participante que los pausó. Por tanto, tu aplicación debe autorizar el acceso a la conversación antes de reanudarla, como muestra el [flujo completo de aprobación](#complete-approval-flow), o verificar el acceso mediante el método `conversationBelongsTo` del almacén de conversaciones.

Los valores booleanos `true` y `false` se pueden utilizar como abreviaturas de aprobación y rechazo. Todas las llamadas a herramientas pendientes deben recibir una decisión. Los ID de llamadas desconocidos, ausentes o ya resueltos provocarán una `ApprovalMismatchException`. Puedes proporcionar una decisión predeterminada para las llamadas sin una decisión explícita mediante los métodos `approveRemaining` o `rejectRemaining`:

```php
$decisions = Decisions::from([
    'call_abc' => true,
])->rejectRemaining('Not approved.');

$response = (new FileAssistant)
    ->continue($conversationId, as: $user)
    ->prompt($decisions);
```

Un rechazo con resultado, como `Decision::reject('Not approved.')`, se devuelve al modelo para que pueda seguir respondiendo. Un rechazo sin resultado detiene el bucle de generación después de registrar el rechazo.

Los métodos `prompt`, `stream`, `queue`, `broadcast`, `broadcastNow` y `broadcastOnQueue` admiten la aprobación de herramientas.

Durante la transmisión en tiempo real y la difusión, una pausa se representa mediante un evento `tool_approval_request`. Al utilizar el [protocolo de transmisión de Vercel AI SDK](#stream-protocols), las solicitudes de aprobación y sus resultados se emiten mediante las partes nativas de aprobación de herramientas del protocolo, y el protocolo Agent User Interaction los informa como interrupciones.

Los clientes que utilizan cualquiera de los dos protocolos envían sus decisiones junto con el resto de la conversación, por lo que una [solicitud de chat](#frontend-integration) se puede pasar directamente al agente:

```php
$chat = Vercel::chat($request);

return (new FileAssistant)
    ->continue($conversationId, as: $request->user())
    ->stream($chat)
    ->usingProtocol($chat->protocol());
```

Cuando se reanuda un turno pausado, los pasos reanudados se integran en ese turno, de modo que cada turno se almacena como un único mensaje del asistente. La propiedad `assistantMessageId` de la respuesta contiene el ID del mensaje pausado, y el uso de ese mensaje incluye tanto la pausa como la reanudación.

Para los agentes encolados, la respuesta resultante se pasa al callback `then`, y Laravel también despacha un evento `ToolApprovalRequested`.

Laravel almacena el resultado de una herramienta aprobada antes de pedir al modelo que continúe. Si la generación falla después, la aprobación ya se ha resuelto. Continúa la conversación con un prompt de texto normal en lugar de volver a enviar las mismas decisiones de aprobación.

<a id="complete-approval-flow"></a>
### Flujo completo de aprobación

La siguiente ruta muestra un flujo completo de aprobación que acepta tanto un nuevo prompt de texto como decisiones de aprobación desde la pantalla de chat. Este ejemplo supone que el modelo `User` de la aplicación utiliza el trait `HasConversations`:

```php
use App\Ai\Agents\FileAssistant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\Rule;
use Laravel\Ai\Approvals\Decision;
use Laravel\Ai\Approvals\Decisions;
use Laravel\Ai\Models\Conversation;

Route::post('/chat/{conversation}', function (Request $request, Conversation $conversation) {
    Gate::authorize('view', $conversation);

    $validated = $request->validate([
        'message' => ['nullable', 'string', 'required_without:decisions', 'prohibits:decisions'],
        'decisions' => ['nullable', 'array', 'required_without:message', 'prohibits:message'],
        'decisions.*.action' => ['required_with:decisions', Rule::in(['approve', 'reject'])],
        'decisions.*.result' => ['nullable', 'string'],
    ]);

    $prompt = isset($validated['decisions'])
        ? Decisions::from(collect($validated['decisions'])->map(
            fn (array $decision) => match ($decision['action']) {
                'approve' => Decision::approve(),
                'reject' => Decision::reject($decision['result'] ?? null),
            }
        )->all())
        : $validated['message'];

    $response = (new FileAssistant)
        ->continue($conversation->id, as: $request->user())
        ->prompt($prompt);

    return [
        'conversation_id' => $response->conversationId,
        'status' => $response->hasPendingApprovals() ? 'awaiting_approval' : 'complete',
        'message' => $response->text,
        'approvals' => $response->pendingApprovals,
    ];
})->middleware('auth');
```

Cuando el estado de la respuesta sea `awaiting_approval`, la pantalla de chat debe mostrar las aprobaciones pendientes y enviar las opciones del usuario al mismo endpoint utilizando el ID de la llamada a la herramienta como clave de cada decisión. En caso contrario, la pantalla puede enviar un valor `message` simple:

```json
{
    "decisions": {
        "call_abc": {
            "action": "approve"
        },
        "call_def": {
            "action": "reject",
            "result": "The invoice must be retained."
        }
    }
}
```

<a id="images"></a>
## Imágenes

La clase `Laravel\Ai\Image` permite generar imágenes mediante los proveedores `openai`, `gemini` o `xai`:

```php
use Laravel\Ai\Image;

$image = Image::of('A donut sitting on the kitchen counter')->generate();

$rawContent = (string) $image;
```

Los métodos `square`, `portrait` y `landscape` permiten controlar la relación de aspecto de la imagen, mientras que el método `quality` orienta al modelo sobre la calidad final de la imagen (`high`, `medium`, `low`). El método `timeout` permite especificar el tiempo de espera HTTP en segundos:

```php
use Laravel\Ai\Image;

$image = Image::of('A donut sitting on the kitchen counter')
    ->quality('high')
    ->landscape()
    ->timeout(120)
    ->generate();
```

Puedes adjuntar imágenes de referencia mediante el método `attachments`:

```php
use Laravel\Ai\Files;
use Laravel\Ai\Image;

$image = Image::of('Update this photo of me to be in the style of an impressionist painting.')
    ->attachments([
        Files\Image::fromStorage('photo.jpg'),
        // Files\Image::fromPath('/home/laravel/photo.jpg'),
        // Files\Image::fromUrl('https://example.com/photo.jpg'),
        // $request->file('photo'),
    ])
    ->landscape()
    ->generate();
```

Algunos proveedores pueden generar varias imágenes en una única solicitud. OpenAI, Azure y xAI aceptan una [opción del proveedor](#provider-options) `n`, y la respuesta contendrá todas las imágenes devueltas:

```php
$response = Image::of('A donut sitting on the kitchen counter')
    ->withProviderOptions(['n' => 4])
    ->generate();

count($response);           // 4
$response->images;          // A collection of generated images...
$response->firstImage();    // The first generated image...
```

Las imágenes generadas se pueden almacenar fácilmente en el disco predeterminado configurado en el archivo de configuración `config/filesystems.php` de tu aplicación:

```php
$image = Image::of('A donut sitting on the kitchen counter');

$path = $image->store();
$path = $image->storeAs('image.jpg');
$path = $image->storePublicly();
$path = $image->storePubliclyAs('image.jpg');
```

La generación de imágenes también se puede encolar:

```php
use Laravel\Ai\Image;
use Laravel\Ai\Responses\ImageResponse;

Image::of('A donut sitting on the kitchen counter')
    ->portrait()
    ->queue()
    ->then(function (ImageResponse $image) {
        $path = $image->store();

        // ...
    });
```

<a id="audio"></a>
## Audio

La clase `Laravel\Ai\Audio` permite generar audio a partir del texto indicado:

```php
use Laravel\Ai\Audio;

$audio = Audio::of('I love coding with Laravel.')->generate();

$rawContent = (string) $audio;
```

También puedes generar audio a partir de una cadena mediante el método `toAudio` disponible en la clase `Stringable` de Laravel:

```php
use Illuminate\Support\Str;

$audio = Str::of('I love coding with Laravel.')->toAudio();
```

Los métodos `male`, `female` y `voice` permiten determinar la voz del audio generado:

```php
$audio = Audio::of('I love coding with Laravel.')
    ->female()
    ->generate();

$audio = Audio::of('I love coding with Laravel.')
    ->voice('voice-id-or-name')
    ->generate();
```

Del mismo modo, el método `instructions` permite orientar dinámicamente al modelo sobre cómo debe sonar el audio generado:

```php
$audio = Audio::of('I love coding with Laravel.')
    ->female()
    ->instructions('Said like a pirate')
    ->generate();
```

El audio generado se puede almacenar fácilmente en el disco predeterminado configurado en el archivo de configuración `config/filesystems.php` de tu aplicación:

```php
$audio = Audio::of('I love coding with Laravel.')->generate();

$path = $audio->store();
$path = $audio->storeAs('audio.mp3');
$path = $audio->storePublicly();
$path = $audio->storePubliclyAs('audio.mp3');
```

La generación de audio también se puede encolar:

```php
use Laravel\Ai\Audio;
use Laravel\Ai\Responses\AudioResponse;

Audio::of('I love coding with Laravel.')
    ->queue()
    ->then(function (AudioResponse $audio) {
        $path = $audio->store();

        // ...
    });
```

<a id="transcription"></a>
## Transcripciones

La clase `Laravel\Ai\Transcription` permite generar una transcripción del audio indicado:

```php
use Laravel\Ai\Transcription;

$transcript = Transcription::fromPath('/home/laravel/audio.mp3')->generate();
$transcript = Transcription::fromStorage('audio.mp3')->generate();
$transcript = Transcription::fromUpload($request->file('audio'))->generate();

return (string) $transcript;
```

El método `diarize` permite indicar que quieres que la respuesta incluya la transcripción con diarización además de la transcripción de texto sin procesar, lo que te permite acceder a la transcripción segmentada por hablante:

```php
$transcript = Transcription::fromStorage('audio.mp3')
    ->diarize()
    ->generate();
```

La generación de transcripciones también se puede encolar:

```php
use Laravel\Ai\Transcription;
use Laravel\Ai\Responses\TranscriptionResponse;

Transcription::fromStorage('audio.mp3')
    ->queue()
    ->then(function (TranscriptionResponse $transcript) {
        // ...
    });
```

<a id="text-summarization"></a>
## Generación de resúmenes de texto

Puedes resumir texto mediante el método `summarize` disponible en la clase `Stringable` de Laravel. De forma predeterminada, el resumen contendrá como máximo tres oraciones y se generará mediante el modelo de texto más económico del proveedor configurado:

```php
use Illuminate\Support\Str;

$summary = Str::of($article)->summarize();
```

Puedes especificar el número máximo de oraciones, el proveedor, el modelo y el tiempo de espera utilizados para generar el resumen. La clase `Str` también ofrece una versión estática del método:

```php
use Laravel\Ai\Enums\Lab;

$summary = Str::of($article)->summarize(
    sentences: 4,
    provider: Lab::Anthropic,
    model: 'claude-sonnet-5',
    timeout: 30,
);

$summary = Str::summarize($article, sentences: 4);
```

<a id="embeddings"></a>
## Embeddings

Puedes generar fácilmente embeddings vectoriales para cualquier cadena mediante el nuevo método `toEmbeddings` disponible en la clase `Stringable` de Laravel:

```php
use Illuminate\Support\Str;

$embeddings = Str::of('Napa Valley has great wine.')->toEmbeddings();
```

Como alternativa, puedes utilizar la clase `Embeddings` para generar embeddings para varias entradas a la vez:

```php
use Laravel\Ai\Embeddings;

$response = Embeddings::for([
    'Napa Valley has great wine.',
    'Laravel is a PHP framework.',
])->generate();

$response->embeddings; // [[0.123, 0.456, ...], [0.789, 0.012, ...]]
```

Puedes especificar las dimensiones y el proveedor de los embeddings:

```php
$response = Embeddings::for(['Napa Valley has great wine.'])
    ->dimensions(1536)
    ->generate(Lab::OpenAI, 'text-embedding-3-small');
```

<a id="multimodal-embeddings"></a>
### Embeddings multimodales

Además de cadenas, el método `Embeddings::for` acepta entradas de imagen, audio, documento y video, lo que permite generar embeddings para contenido que no sea texto. Gemini admite embeddings de imagen, audio, documento y video, mientras que VoyageAI admite embeddings de imagen y video:

```php
use Laravel\Ai\Embeddings;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Files\Image;
use Laravel\Ai\Files\Video;

$response = Embeddings::for([
    'A vineyard at sunset.',
    Image::fromStorage('vineyard.jpg'),
    Video::fromPath('/home/laravel/tour.mp4'),
])->generate(Lab::Gemini);
```

Las entradas multimodales utilizan las mismas [clases de archivos utilizadas para los adjuntos](#attachments). Estos archivos se pueden crear a partir de una ruta local, un disco del sistema de archivos, una URL remota o contenido codificado en Base64. Las imágenes, los documentos y los videos también se pueden crear a partir de archivos cargados, mientras que los documentos se pueden crear a partir de contenido de cadena sin procesar:

```php
use Laravel\Ai\Files\Audio;
use Laravel\Ai\Files\Document;
use Laravel\Ai\Files\Image;
use Laravel\Ai\Files\Video;

Image::fromPath('/home/laravel/photo.jpg');
Image::fromStorage('photo.jpg');
Image::fromUpload($request->file('photo'));

Audio::fromPath('/home/laravel/clip.mp3');
Audio::fromStorage('clip.mp3');
Audio::fromUpload($request->file('clip.mp3'));

Video::fromPath('/home/laravel/video.mp4');
Video::fromStorage('video.mp4');
Video::fromUpload($request->file('video'));

Document::fromUrl('https://example.com/report.pdf');
Document::fromString('Laravel is a PHP framework.', 'text/plain');
Document::fromUpload($request->file('report'));
```

> **Nota:**
> VoyageAI no permite mezclar contenido multimedia de URL remotas y contenido multimedia codificado en Base64 en una única solicitud. Los archivos locales, almacenados y cargados se envían como contenido codificado en Base64, y las entradas de texto se pueden combinar con cualquiera de las dos fuentes multimedia. Consulta la documentación de tu proveedor para determinar qué modelos y entradas multimodales están disponibles.

<a id="querying-embeddings"></a>
### Consultas de embeddings

Una vez generados los embeddings, normalmente los almacenarás en una columna `vector` de tu base de datos para consultarlos después. Laravel ofrece compatibilidad nativa con columnas vectoriales en PostgreSQL mediante la extensión `pgvector` y en MariaDB. Para empezar, define una columna `vector` en tu migración, especificando el número de dimensiones:

```php
Schema::ensureVectorExtensionExists();

Schema::create('documents', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->text('content');
    $table->vector('embedding', dimensions: 1536);
    $table->timestamps();
});
```

También puedes añadir un índice vectorial para acelerar las búsquedas por similitud. Al llamar a `index` en una columna vectorial, Laravel creará automáticamente un índice HNSW con distancia coseno:

```php
$table->vector('embedding', dimensions: 1536)->index();
```

En tu modelo de Eloquent, debes convertir la columna vectorial mediante el cast `AsVector`:

```php
use Illuminate\Database\Eloquent\Casts\AsVector;

protected function casts(): array
{
    return [
        'embedding' => AsVector::class,
    ];
}
```

Para consultar registros similares, utiliza el método `whereVectorSimilarTo`. Este método filtra los resultados según una similitud coseno mínima (entre `0.0` y `1.0`, donde `1.0` significa idéntico) y los ordena por similitud:

```php
use App\Models\Document;

$documents = Document::query()
    ->whereVectorSimilarTo('embedding', $queryEmbedding, minSimilarity: 0.4)
    ->limit(10)
    ->get();
```

El valor de `$queryEmbedding` puede ser un array de números de punto flotante o una cadena simple. Cuando se proporciona una cadena, Laravel genera automáticamente sus embeddings:

```php
$documents = Document::query()
    ->whereVectorSimilarTo('embedding', 'best wineries in Napa Valley')
    ->limit(10)
    ->get();
```

Si necesitas más control, puedes utilizar de forma independiente los métodos de nivel inferior `whereVectorDistanceLessThan`, `selectVectorDistance` y `orderByVectorDistance`:

```php
$documents = Document::query()
    ->select('*')
    ->selectVectorDistance('embedding', $queryEmbedding, as: 'distance')
    ->whereVectorDistanceLessThan('embedding', $queryEmbedding, maxDistance: 0.3)
    ->orderByVectorDistance('embedding', $queryEmbedding)
    ->limit(10)
    ->get();
```

Si quieres dar a un agente la capacidad de realizar búsquedas por similitud como herramienta, consulta la documentación de la herramienta [Búsqueda por similitud](#similarity-search).

> **Nota:**
> Las consultas vectoriales se admiten actualmente en conexiones PostgreSQL mediante la extensión `pgvector`, o en MariaDB 11.7 o posterior mediante su compatibilidad vectorial nativa.

<a id="caching-embeddings"></a>
### Almacenamiento de embeddings en caché

La generación de embeddings se puede almacenar en caché para evitar llamadas redundantes a la API para entradas idénticas. Para habilitar la caché, establece la opción de configuración `ai.caching.embeddings.cache` en `true`:

```php
'caching' => [
    'embeddings' => [
        'cache' => true,
        'store' => env('CACHE_STORE', 'database'),
        'individually' => true,
        // ...
    ],
],
```

Cuando la caché está habilitada, los embeddings se almacenan en ella durante 30 días. La clave de caché se basa en el proveedor, el modelo, las dimensiones y el contenido de entrada, lo que garantiza que las solicitudes idénticas devuelvan resultados en caché y las configuraciones distintas generen embeddings nuevos.

De forma predeterminada, el embedding de cada entrada se almacena en caché con su propia clave, por lo que una solicitud posterior puede encontrar en la caché entradas ya vistas aunque el conjunto de entradas o su orden haya cambiado. Para almacenar todo el conjunto de entradas con una única clave, establece la opción de configuración `ai.caching.embeddings.individually` en `false`.

También puedes habilitar la caché para una solicitud concreta mediante el método `cache`, incluso cuando esté deshabilitada globalmente:

```php
$response = Embeddings::for(['Napa Valley has great wine.'])
    ->cache()
    ->generate();
```

Puedes especificar una duración de caché personalizada en segundos:

```php
$response = Embeddings::for(['Napa Valley has great wine.'])
    ->cache(seconds: 3600) // Cache for 1 hour
    ->generate();
```

El método Stringable `toEmbeddings` también acepta un argumento `cache`:

```php
// Guardar en cache con la duración predeterminada...
$embeddings = Str::of('Napa Valley has great wine.')->toEmbeddings(cache: true);

// Guardar en cache durante un período específico...
$embeddings = Str::of('Napa Valley has great wine.')->toEmbeddings(cache: 3600);
```

<a id="reranking"></a>
## Reordenamiento

El reordenamiento permite cambiar el orden de una lista de documentos según su relevancia para una consulta. Esto resulta útil para mejorar los resultados de búsqueda mediante la comprensión semántica:

La clase `Laravel\Ai\Reranking` permite reordenar documentos:

```php
use Laravel\Ai\Reranking;

$response = Reranking::of([
    'Django is a Python web framework.',
    'Laravel is a PHP web application framework.',
    'React is a JavaScript library for building user interfaces.',
])->rerank('PHP frameworks');

// Acceder al resultado principal...
$response->first()->document; // "Laravel is a PHP web application framework."
$response->first()->score;    // 0.95
$response->first()->index;    // 1 (original position)
```

El método `limit` permite restringir el número de resultados devueltos, mientras que `timeout` permite especificar el tiempo de espera HTTP en segundos, cuyo valor predeterminado es 30:

```php
$response = Reranking::of($documents)
    ->limit(5)
    ->timeout(60)
    ->rerank('search query');
```

<a id="reranking-collections"></a>
### Reordenamiento de colecciones

Por comodidad, las colecciones de Laravel se pueden reordenar mediante la macro `rerank`. El primer argumento especifica los campos que se utilizarán para el reordenamiento y el segundo es la consulta:

```php
// Volver a ordenar por un solo campo...
$posts = Post::all()
    ->rerank('body', 'Laravel tutorials');

// Volver a ordenar por varios campos (enviados como JSON)...
$reranked = $posts->rerank(['title', 'body'], 'Laravel tutorials');

// Volver a ordenar usando un closure para crear el documento...
$reranked = $posts->rerank(
    fn ($post) => $post->title.': '.$post->body,
    'Laravel tutorials'
);
```

También puedes limitar el número de resultados y especificar un proveedor:

```php
$reranked = $posts->rerank(
    by: 'content',
    query: 'Laravel tutorials',
    limit: 10,
    provider: Lab::Cohere,
    timeout: 60,
);
```

<a id="classification"></a>
## Clasificación

> **Advertencia:**
> La clasificación es experimental actualmente y su API puede cambiar en futuras versiones menores del AI SDK.

La clasificación permite formular un conjunto fijo de preguntas sobre una cadena o un array de datos y recibir una respuesta tipada, respaldada por una probabilidad, para cada pregunta en lugar de texto libre. Esto resulta útil para el enrutamiento, la moderación y la puntuación, cuando necesitas comparar una respuesta con un umbral o realizar aserciones sobre ella en tus pruebas.

La clase `Laravel\Ai\Classification` permite clasificar contenido. A cada pregunta se le asigna una clave, y la respuesta correspondiente se puede recuperar de la respuesta general mediante esa clave:

```php
use Laravel\Ai\Classification;
use Laravel\Ai\Classification\Boolean;
use Laravel\Ai\Classification\Choice;
use Laravel\Ai\Classification\Score;

$result = Classification::of($supportRequest)
    ->questions([
        'urgent' => new Boolean('Does this request need an immediate response?', [
            'true' => 'Explicitly time-sensitive',
            'false' => 'No urgency expressed',
        ]),
        'department' => new Choice('Which team should handle this request?', [
            'billing' => 'Payments, invoices, and refunds',
            'technical' => 'Bugs, outages, and integrations',
            'sales' => 'Pricing, plans, and upgrades',
        ]),
        'frustration' => new Score('How frustrated is the customer?', [
            'Calm',
            'Frustrated',
            'Very angry',
        ]),
    ])
    ->classify();
```

Las preguntas `Boolean` devuelven la probabilidad de que la respuesta sea verdadera. El método `isTrue` permite determinar si esa probabilidad alcanza un umbral dado, cuyo valor predeterminado es `0.5`:

```php
$result['urgent']->probability;             // 0.94
$result['urgent']->isTrue(threshold: 0.8);  // true
```

Las preguntas `Choice` devuelven una de las opciones indicadas junto con la probabilidad de cada opción. La propiedad `confidence` indica el grado de certeza del proveedor sobre todo el conjunto de probabilidades y será `null` cuando el proveedor no pueda medirlo:

```php
$result['department']->choice;                      // 'technical'
$result['department']->probabilityOf('technical');  // 0.87
$result['department']->probabilities;               // ['billing' => 0.08, 'technical' => 0.87, 'sales' => 0.05]
$result['department']->confidence;                  // 0.82
```

Las preguntas `Score` devuelven una posición en los niveles ordenados que se han proporcionado. La propiedad `score` está ponderada por la probabilidad y puede situarse entre dos niveles, mientras que los métodos `level` y `label` describen el nivel más probable:

```php
$result['frustration']->score;          // 1.24, the probability-weighted level
$result['frustration']->level();        // 1, the most probable level
$result['frustration']->label();        // 'Frustrated'
$result['frustration']->normalized();   // 0.62, the score as a fraction of the highest level
$result['frustration']->probabilities;  // [0.12, 0.52, 0.36]
```

Los criterios de una pregunta `Boolean`, las descripciones de opciones de una pregunta `Choice` y los niveles de una pregunta `Score` pueden ser arrays cuando una única oración no sea suficiente. Las preguntas `Choice` requieren al menos dos opciones, mientras que las preguntas `Score` requieren al menos dos niveles.

La respuesta se puede recorrer, contar y consultar como un array. Además, el método `answer` permite recuperar una única respuesta, mientras que el método `collect` devuelve todas las respuestas como una [colección](../collections/):

```php
$result->answer('urgent');
$result->collect();

$result->usage;
$result->meta->provider;
```

<a id="classifying-images"></a>
### Clasificación de imágenes

Al utilizar OpenAI, puedes clasificar imágenes junto con el contenido indicado pasándolas como segundo argumento al método `of`. Las imágenes se pueden crear mediante las mismas [clases de archivos utilizadas para los adjuntos](#attachments):

```php
use Laravel\Ai\Classification;
use Laravel\Ai\Classification\Boolean;
use Laravel\Ai\Files\Image;

$result = Classification::of('Inspect the product in this photo.', [
    Image::fromPath($photo),
])
    ->question('damaged', new Boolean('Does the product have visible damage?'))
    ->classify(provider: 'openai');
```

<a id="yes-or-no-decisions"></a>
### Decisiones de sí o no

Para una única decisión de sí o no, puedes utilizar el método `decide` disponible en la clase `Stringable` de Laravel, que devuelve un booleano en lugar de una respuesta completa. Puedes describir qué significan un «sí» y un «no», y especificar la probabilidad que debe alcanzar la respuesta, cuyo valor predeterminado es `0.5`:

```php
use Illuminate\Support\Str;

if (Str::of($message)->decide('Is this spam?')) {
    // ...
}

$spam = Str::of($message)->decide('Is this spam?', criteria: [
    'true' => 'Unsolicited bulk mail.',
    'false' => 'A genuine message from a customer.',
], threshold: 0.9);
```

<a id="choosing-from-collections"></a>
### Selección a partir de colecciones

Para elegir rápidamente un único elemento de una lista de opciones, puedes utilizar el método `decide` disponible en la clase `Collection` de Laravel. El método acepta una pregunta y el texto que se debe clasificar, y devuelve el elemento elegido de la colección.

Las colecciones de cadenas y enums se pueden utilizar directamente, mientras que los demás elementos deben recibir un nombre mediante el argumento `by`. También puedes proporcionar un campo, un array de campos o una función anónima mediante el argumento `describe` para dar al modelo más detalles sobre cada opción:

```php
$department = collect(['billing', 'technical', 'sales'])
    ->decide('Which team should handle this request?', $ticket->body);

$priority = collect(Priority::cases())
    ->decide('How urgent is this request?', $ticket->body);

$department = Department::all()->decide(
    'Which department should handle this request?',
    $ticket->body,
    by: 'name',
    describe: 'description',
);
```

La descripción definida mediante el argumento `describe` sirve como criterio que utiliza el modelo para determinar si el texto coincide con esa opción, lo que resulta útil cuando el nombre de una opción por sí solo es ambiguo. Cuando se proporciona una función anónima al argumento `describe`, esta recibe cada elemento y debe devolver una cadena o un array que lo describa:

```php
$priority = collect(Priority::cases())->decide(
    'How urgent is this request?',
    $ticket->body,
    describe: fn (Priority $priority) => $priority->description(),
);
```

Cuando una colección de cadenas tiene claves de cadena, sus claves se utilizan como opciones y sus valores como descripciones, y se devuelve la clave elegida. Si se proporciona un `threshold` y la probabilidad de la opción elegida está por debajo de él, se devuelve `null`:

```php
$department = collect([
    'billing' => 'Payments, invoices, and refunds',
    'technical' => 'Bugs, outages, and integrations',
])->decide('Which team should handle this request?', $ticket->body, threshold: 0.6) ?? 'triage';
```

<a id="files"></a>
## Archivos

La clase `Laravel\Ai\Files` o las clases de archivos individuales permiten almacenar archivos en tu proveedor de IA para utilizarlos después en conversaciones. Esto resulta útil para documentos grandes o archivos que quieras referenciar varias veces sin volver a cargarlos:

```php
use Laravel\Ai\Files\Document;
use Laravel\Ai\Files\Image;

// Guardar un archivo desde una ruta local...
$response = Document::fromPath('/home/laravel/document.pdf')->put();
$response = Image::fromPath('/home/laravel/photo.jpg')->put();

// Guardar un archivo almacenado en un disk del filesystem...
$response = Document::fromStorage('document.pdf', disk: 'local')->put();
$response = Image::fromStorage('photo.jpg', disk: 'local')->put();

// Guardar un archivo almacenado en una URL remota...
$response = Document::fromUrl('https://example.com/document.pdf')->put();
$response = Image::fromUrl('https://example.com/photo.jpg')->put();

return $response->id;
```

También puedes almacenar contenido sin procesar o archivos cargados:

```php
use Laravel\Ai\Files;
use Laravel\Ai\Files\Document;

// Guardar contenido sin procesar...
$stored = Document::fromString('Hello, World!', 'text/plain')->put();

// Guardar un archivo subido...
$stored = Document::fromUpload($request->file('document'))->put();
```

Una vez almacenado un archivo, puedes hacer referencia a él al generar texto mediante agentes en lugar de volver a cargarlo:

```php
use App\Ai\Agents\SalesCoach;
use Laravel\Ai\Files;

$response = (new SalesCoach)->prompt(
    'Analyze the attached sales transcript...',
    attachments: [
        Files\Document::fromId('file-id') // Attach a stored document...
    ]
);
```

Para recuperar un archivo almacenado previamente, utiliza el método `get` en una instancia de archivo:

```php
use Laravel\Ai\Files\Document;

$file = Document::fromId('file-id')->get();

$file->id;
$file->mimeType();
```

Para eliminar un archivo del proveedor, utiliza el método `delete`:

```php
Document::fromId('file-id')->delete();
```

De forma predeterminada, la clase `Files` utiliza el proveedor de IA predeterminado configurado en el archivo de configuración `config/ai.php` de tu aplicación. Para la mayoría de las operaciones, puedes especificar otro proveedor mediante el argumento `provider`:

```php
$response = Document::fromPath(
    '/home/laravel/document.pdf'
)->put(provider: Lab::Anthropic);
```

Puedes pasar opciones de carga específicas del proveedor mediante el método `withProviderOptions`. Por ejemplo, puedes establecer el `purpose` del archivo de OpenAI:

```php
use Laravel\Ai\Files\Document;

$response = Document::fromPath('/home/laravel/knowledge.txt')
    ->withProviderOptions(['purpose' => 'assistants'])
    ->put();
```

Para limitar las opciones por proveedor, pasa una función anónima que reciba el proveedor actual:

```php
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Files\Document;

$response = Document::fromPath('/home/laravel/training.jsonl')
    ->withProviderOptions(fn (Lab|string $provider) => match ($provider) {
        Lab::OpenAI => ['purpose' => 'fine-tune'],
        default => [],
    })
    ->put();
```

<a id="using-stored-files-in-conversations"></a>
### Uso de archivos almacenados en conversaciones

Una vez almacenado un archivo en un proveedor, puedes referenciarlo en conversaciones de agentes mediante el método `fromId` de las clases `Document` o `Image`:

```php
use App\Ai\Agents\DocumentAnalyzer;
use Laravel\Ai\Files;
use Laravel\Ai\Files\Document;

$stored = Document::fromPath('/path/to/report.pdf')->put();

$response = (new DocumentAnalyzer)->prompt(
    'Summarize this document.',
    attachments: [
        Document::fromId($stored->id),
    ],
);
```

Del mismo modo, puedes referenciar imágenes almacenadas mediante la clase `Image`:

```php
use Laravel\Ai\Files;
use Laravel\Ai\Files\Image;

$stored = Image::fromPath('/path/to/photo.jpg')->put();

$response = (new ImageAnalyzer)->prompt(
    'What is in this image?',
    attachments: [
        Image::fromId($stored->id),
    ],
);
```

<a id="vector-stores"></a>
## Almacenes vectoriales

Los almacenes vectoriales permiten crear colecciones de archivos que admiten búsquedas y que se pueden utilizar para la generación aumentada por recuperación (RAG). La clase `Laravel\Ai\Stores` proporciona métodos para crear, recuperar y eliminar almacenes vectoriales:

```php
use Laravel\Ai\Stores;

// Crear un nuevo vector store...
$store = Stores::create('Knowledge Base');

// Crear un store con opciones adicionales...
$store = Stores::create(
    name: 'Knowledge Base',
    description: 'Documentation and reference materials.',
    expiresWhenIdleFor: days(30),
);

return $store->id;
```

Para recuperar un almacén vectorial existente por su ID, utiliza el método `get`:

```php
use Laravel\Ai\Stores;

$store = Stores::get('store_id');

$store->id;
$store->name;
$store->fileCounts;
$store->ready;
```

Para eliminar un almacén vectorial, utiliza el método `delete` de la clase `Stores` o de la instancia del almacén:

```php
use Laravel\Ai\Stores;

// Delete by ID...
Stores::delete('store_id');

// O eliminar mediante una instancia de store...
$store = Stores::get('store_id');

$store->delete();
```

<a id="adding-files-to-stores"></a>
### Adición de archivos a almacenes

Una vez que tengas un almacén vectorial, puedes añadirle [archivos](#files) mediante el método `add`. Los archivos añadidos a un almacén se indexan automáticamente para realizar búsquedas semánticas mediante la [herramienta de búsqueda de archivos del proveedor](#file-search):

```php
use Laravel\Ai\Files\Document;
use Laravel\Ai\Stores;

$store = Stores::get('store_id');

// Añadir un archivo que ya se haya almacenado con el provider...
$document = $store->add('file_id');
$document = $store->add(Document::fromId('file_id'));

// O guardar y añadir un archivo en un solo paso...
$document = $store->add(Document::fromPath('/path/to/document.pdf'));
$document = $store->add(Document::fromStorage('manual.pdf'));
$document = $store->add($request->file('document'));

$document->id;
$document->fileId;
```

> **Nota:** Normalmente, al añadir archivos almacenados previamente a almacenes vectoriales, el ID de documento devuelto coincide con el ID asignado previamente al archivo; sin embargo, algunos proveedores de almacenamiento vectorial pueden devolver un «ID de documento» nuevo y distinto. Por tanto, se recomienda almacenar siempre ambos ID en tu base de datos para consultarlos más adelante.

Al añadir un archivo a un almacén de Gemini, Laravel espera a que termine la importación para que el documento se pueda buscar una vez que la llamada regrese. Se lanzará una `Laravel\Ai\Exceptions\AiException` si la importación falla o supera los cinco minutos, por lo que puede convenirte añadir archivos de Gemini desde un [trabajo encolado](../queues/).

Puedes adjuntar metadatos a los archivos al añadirlos a un almacén. Estos metadatos se pueden utilizar después para filtrar los resultados de búsqueda al utilizar la [herramienta de búsqueda de archivos del proveedor](#file-search):

```php
$store->add(Document::fromPath('/path/to/document.pdf'), metadata: [
    'author' => 'Taylor Otwell',
    'department' => 'Engineering',
    'year' => 2026,
]);
```

Para quitar un archivo de un almacén, utiliza el método `remove`:

```php
$store->remove('file_id');
```

Quitar un archivo de un almacén vectorial no lo elimina del [almacenamiento de archivos](#files) del proveedor. Para quitar un archivo del almacén vectorial y eliminarlo permanentemente del almacenamiento de archivos, utiliza el argumento `deleteFile`:

```php
$store->remove('file_abc123', deleteFile: true);
```

<a id="usage"></a>
## Uso

Cada respuesta contiene una propiedad `usage` con los recuentos de tokens informados por el proveedor. Los recuentos de entrada y salida son totales, por lo que los tokens contados como tokens en caché o de razonamiento también se incluyen en el total correspondiente:

```php
$response = (new SalesCoach)->prompt('Analyze this sales transcript...');

$response->usage->inputTokens;
$response->usage->outputTokens;
$response->usage->totalTokens();
```

La generación de texto devuelve una instancia de `Laravel\Ai\Responses\Data\TextUsage`, que desglosa estos totales con más detalle. Cada uno de estos valores será `null`, en lugar de `0`, cuando el proveedor no lo informe:

```php
$response->usage->cacheReadInputTokens; // Subset of the input tokens read from a prompt cache...
$response->usage->cacheWriteInputTokens; // Subset of the input tokens written to a prompt cache...
$response->usage->reasoningTokens; // Subset of the output tokens spent on reasoning...

$response->usage->uncachedInputTokens(); // Input tokens that were neither read from nor written to the cache...
```

Las lecturas de caché, las escrituras en caché y la entrada sin caché se facturan con tarifas distintas, por lo que debes calcular el costo de estos tres recuentos por separado en lugar de utilizar únicamente el total de entrada.

Las demás capacidades devuelven un objeto de uso que contiene sus recuentos específicos:

<div class="overflow-auto">

| Capacidad | Objeto de uso | Añade |
|---|---|---|
| Texto, clasificación | `TextUsage` | Tokens de lectura de caché, escritura en caché y razonamiento |
| Imágenes | `ImageUsage` | `imageInputTokens` y `imageOutputTokens` |
| Transcripción | `TranscriptionUsage` | `audioSeconds`, la duración del audio transcrito |
| Reordenamiento | `RerankingUsage` | `searchUnits`, que algunos proveedores facturan en lugar de tokens |
| Audio, embeddings | `Usage` | |

</div>

No todos los proveedores informan todos los recuentos, y los recuentos que un proveedor no informe serán `null`:

```php
use Laravel\Ai\Image;
use Laravel\Ai\Transcription;

Image::of('A donut sitting on the kitchen counter')->generate()->usage->imageOutputTokens;

Transcription::fromPath('/home/laravel/meeting.mp3')->generate()->usage->audioSeconds;
```

<a id="failover"></a>
## Conmutación por error

Al enviar prompts o generar otros medios, puedes proporcionar un array de proveedores o modelos para cambiar automáticamente a un proveedor o modelo de respaldo si se produce una interrupción del servicio o se alcanza un límite de frecuencia en el proveedor principal:

```php
use App\Ai\Agents\SalesCoach;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Image;

$response = (new SalesCoach)->prompt(
    'Analyze this sales transcript...',
    provider: [Lab::OpenAI, Lab::Anthropic],
);

$image = Image::of('A donut sitting on the kitchen counter')
    ->generate(provider: [Lab::Gemini, Lab::xAI]);
```

La conmutación por error solo se produce cuando se lanza una `FailoverableException`, como por un límite de frecuencia (`RateLimitedException`), un proveedor sobrecargado o no disponible (`ProviderOverloadedException`) o créditos insuficientes (`InsufficientCreditsException`). Los errores normales, como los de validación o solicitud incorrecta, no activan la conmutación por error.

Cuando pasas una lista simple de proveedores, como `[Lab::OpenAI, Lab::Anthropic]`, cada proveedor utiliza su modelo predeterminado. Para especificar un modelo concreto para cada proveedor en la cadena de conmutación por error, pasa un array asociativo con claves de proveedor, utilizando el `value` del enum `Lab` como clave (los casos de enum no se pueden utilizar directamente como claves de arrays de PHP):

```php
use Laravel\Ai\Enums\Lab;

$response = (new SalesCoach)->prompt(
    'Analyze this sales transcript...',
    provider: [
        Lab::Gemini->value => 'gemini-3-flash-preview',
        Lab::DeepSeek->value => 'deepseek-v4-pro',
    ],
);
```

<a id="testing"></a>
## Pruebas

Al simular la generación encolada de imágenes, audio, transcripciones o embeddings, cualquier callback `then` registrado en la generación encolada se invocará con la respuesta simulada, lo que permite probar la lógica de dicho callback. Si prefieres que estos callbacks no se invoquen, también puedes simular la cola mediante `Queue::fake()`.

<a id="testing-agents"></a>
### Agentes

Para simular las respuestas de un agente durante las pruebas, llama al método `fake` de su clase. Opcionalmente, puedes proporcionar un array de respuestas o una función anónima:

```php
use App\Ai\Agents\SalesCoach;
use Laravel\Ai\Prompts\AgentPrompt;

// Generar automáticamente una respuesta fija para cada prompt...
SalesCoach::fake();

// Proporcionar una lista de respuestas para prompts...
SalesCoach::fake([
    'First response',
    'Second response',
]);

// Gestionar dinámicamente las respuestas según el prompt recibido...
SalesCoach::fake(function (AgentPrompt $prompt) {
    return 'Response for: '.$prompt->prompt;
});
```

Al simular un agente que devuelve salida estructurada, puedes proporcionar arrays como respuestas. El agente devolverá una respuesta estructurada que contenga los datos indicados:

```php
SalesCoach::fake([
    ['score' => 87],
]);
```

También puedes simular una respuesta que esté esperando aprobación de herramientas:

```php
use Laravel\Ai\Approvals\PendingApproval;
use Laravel\Ai\Responses\AgentResponse;

FileAssistant::fake([
    AgentResponse::fakeWithPendingApprovals([
        new PendingApproval(
            id: 'call_abc',
            tool: 'DeleteFile',
            arguments: ['path' => 'invoice.pdf'],
            reason: 'This will permanently delete a file.',
        ),
    ]),
]);

$response = (new FileAssistant)->prompt('Delete the invoice.');

$response->hasPendingApprovals(); // true
```

Además, puedes simular una respuesta que incluya razonamiento. La simulación emite eventos de razonamiento, por lo que este también se informa en las ejecuciones transmitidas en tiempo real:

```php
use Laravel\Ai\Responses\AgentResponse;

SalesCoach::fake([
    AgentResponse::fakeWithReasoning('They asked about pricing.', 'Plans start at $10.'),
]);

$response = (new SalesCoach)->stream('What does it cost?');

foreach ($response as $event) {
    // ...
}

$response->reasoning; // 'They asked about pricing.'
```

> **Nota:** Cuando se invoca `Agent::fake()` en un agente que devuelve salida estructurada y no se proporciona explícitamente una salida simulada, Laravel genera automáticamente datos simulados que coinciden con el esquema de salida definido por tu agente.

Después de enviar un prompt al agente, puedes realizar aserciones sobre los prompts recibidos:

```php
use Laravel\Ai\Prompts\AgentPrompt;

SalesCoach::assertPrompted('Analyze this...');

SalesCoach::assertPrompted(function (AgentPrompt $prompt) {
    return $prompt->contains('Analyze');
});

SalesCoach::assertPromptedTimes(3);

SalesCoach::assertNotPrompted('Missing prompt');

SalesCoach::assertNeverPrompted();
```

Al verificar una continuación de aprobación mediante aserciones, puedes inspeccionar las decisiones de aprobación del prompt:

```php
use Laravel\Ai\Approvals\Decisions;
use Laravel\Ai\Prompts\AgentPrompt;

FileAssistant::fake();

(new FileAssistant)->prompt(Decisions::from([
    'call_abc' => true,
]));

FileAssistant::assertPrompted(function (AgentPrompt $prompt) {
    return $prompt->hasApprovalDecisions()
        && $prompt->approvalDecisions->get('call_abc')->isApproved();
});
```

Para las invocaciones de agentes encoladas, utiliza los métodos de aserción de encolado:

```php
use Laravel\Ai\QueuedAgentPrompt;

SalesCoach::assertQueued('Analyze this...');

SalesCoach::assertQueued(function (QueuedAgentPrompt $prompt) {
    return $prompt->contains('Analyze');
});

SalesCoach::assertNotQueued('Missing prompt');

SalesCoach::assertNeverQueued();
```

Para garantizar que todas las invocaciones de agentes tengan una respuesta simulada correspondiente, puedes utilizar `preventStrayPrompts`. Si se invoca un agente sin una respuesta simulada definida, se lanzará una excepción:

```php
SalesCoach::fake()->preventStrayPrompts();
```

<a id="testing-images"></a>
### Imágenes

Puedes simular las generaciones de imágenes invocando el método `fake` de la clase `Image`. Una vez simuladas, puedes realizar diversas aserciones sobre los prompts de generación de imágenes registrados:

```php
use Laravel\Ai\Image;
use Laravel\Ai\Prompts\ImagePrompt;
use Laravel\Ai\Prompts\QueuedImagePrompt;

// Generar automáticamente una respuesta fija para cada prompt...
Image::fake();

// Proporcionar una lista de respuestas para prompts...
Image::fake([
    base64_encode($firstImage),
    base64_encode($secondImage),
]);

// Gestionar dinámicamente las respuestas según el prompt recibido...
Image::fake(function (ImagePrompt $prompt) {
    return base64_encode('...');
});
```

Después de generar imágenes, puedes realizar aserciones sobre los prompts recibidos:

```php
Image::assertGenerated(function (ImagePrompt $prompt) {
    return $prompt->contains('sunset') && $prompt->isLandscape();
});

Image::assertNotGenerated('Missing prompt');

Image::assertNothingGenerated();
```

Para las generaciones de imágenes encoladas, utiliza los métodos de aserción de encolado:

```php
Image::assertQueued(
    fn (QueuedImagePrompt $prompt) => $prompt->contains('sunset')
);

Image::assertNotQueued('Missing prompt');

Image::assertNothingQueued();
```

Para garantizar que todas las generaciones de imágenes tengan una respuesta simulada correspondiente, puedes utilizar `preventStrayImages`. Si se genera una imagen sin una respuesta simulada definida, se lanzará una excepción:

```php
Image::fake()->preventStrayImages();
```

<a id="testing-audio"></a>
### Audio

Puedes simular las generaciones de audio invocando el método `fake` de la clase `Audio`. Una vez simuladas, puedes realizar diversas aserciones sobre los prompts de generación de audio registrados:

```php
use Laravel\Ai\Audio;
use Laravel\Ai\Prompts\AudioPrompt;
use Laravel\Ai\Prompts\QueuedAudioPrompt;

// Generar automáticamente una respuesta fija para cada prompt...
Audio::fake();

// Proporcionar una lista de respuestas para prompts...
Audio::fake([
    base64_encode($firstAudio),
    base64_encode($secondAudio),
]);

// Gestionar dinámicamente las respuestas según el prompt recibido...
Audio::fake(function (AudioPrompt $prompt) {
    return base64_encode('...');
});
```

Después de generar audio, puedes realizar aserciones sobre los prompts recibidos:

```php
Audio::assertGenerated(function (AudioPrompt $prompt) {
    return $prompt->contains('Hello') && $prompt->isFemale();
});

Audio::assertNotGenerated('Missing prompt');

Audio::assertNothingGenerated();
```

Para las generaciones de audio encoladas, utiliza los métodos de aserción de encolado:

```php
Audio::assertQueued(
    fn (QueuedAudioPrompt $prompt) => $prompt->contains('Hello')
);

Audio::assertNotQueued('Missing prompt');

Audio::assertNothingQueued();
```

Para garantizar que todas las generaciones de audio tengan una respuesta simulada correspondiente, puedes utilizar `preventStrayAudio`. Si se genera audio sin una respuesta simulada definida, se lanzará una excepción:

```php
Audio::fake()->preventStrayAudio();
```

<a id="testing-transcriptions"></a>
### Transcripciones

Puedes simular las generaciones de transcripciones invocando el método `fake` de la clase `Transcription`. Una vez simuladas, puedes realizar diversas aserciones sobre los prompts de generación de transcripciones registrados:

```php
use Laravel\Ai\Transcription;
use Laravel\Ai\Prompts\TranscriptionPrompt;
use Laravel\Ai\Prompts\QueuedTranscriptionPrompt;

// Generar automáticamente una respuesta fija para cada prompt...
Transcription::fake();

// Proporcionar una lista de respuestas para prompts...
Transcription::fake([
    'First transcription text.',
    'Second transcription text.',
]);

// Gestionar dinámicamente las respuestas según el prompt recibido...
Transcription::fake(function (TranscriptionPrompt $prompt) {
    return 'Transcribed text...';
});
```

Después de generar transcripciones, puedes realizar aserciones sobre los prompts recibidos:

```php
Transcription::assertGenerated(function (TranscriptionPrompt $prompt) {
    return $prompt->language === 'en' && $prompt->isDiarized();
});

Transcription::assertNotGenerated(
    fn (TranscriptionPrompt $prompt) => $prompt->language === 'fr'
);

Transcription::assertNothingGenerated();
```

Para las generaciones de transcripciones encoladas, utiliza los métodos de aserción de encolado:

```php
Transcription::assertQueued(
    fn (QueuedTranscriptionPrompt $prompt) => $prompt->isDiarized()
);

Transcription::assertNotQueued(
    fn (QueuedTranscriptionPrompt $prompt) => $prompt->language === 'fr'
);

Transcription::assertNothingQueued();
```

Para garantizar que todas las generaciones de transcripciones tengan una respuesta simulada correspondiente, puedes utilizar `preventStrayTranscriptions`. Si se genera una transcripción sin una respuesta simulada definida, se lanzará una excepción:

```php
Transcription::fake()->preventStrayTranscriptions();
```

<a id="testing-embeddings"></a>
### Embeddings

Puedes simular las generaciones de embeddings invocando el método `fake` de la clase `Embeddings`. Una vez simuladas, puedes realizar diversas aserciones sobre los prompts de generación de embeddings registrados:

```php
use Laravel\Ai\Embeddings;
use Laravel\Ai\Prompts\EmbeddingsPrompt;
use Laravel\Ai\Prompts\QueuedEmbeddingsPrompt;

// Generar automáticamente embeddings ficticios con las dimensiones adecuadas para cada prompt...
Embeddings::fake();

// Proporcionar una lista de respuestas para prompts...
Embeddings::fake([
    [$firstEmbeddingVector],
    [$secondEmbeddingVector],
]);

// Gestionar dinámicamente las respuestas según el prompt recibido...
Embeddings::fake(function (EmbeddingsPrompt $prompt) {
    return array_map(
        fn () => Embeddings::fakeEmbedding($prompt->dimensions),
        $prompt->inputs
    );
});
```

Después de generar embeddings, puedes realizar aserciones sobre los prompts recibidos:

```php
Embeddings::assertGenerated(function (EmbeddingsPrompt $prompt) {
    return $prompt->contains('Laravel') && $prompt->dimensions === 1536;
});

Embeddings::assertNotGenerated(
    fn (EmbeddingsPrompt $prompt) => $prompt->contains('Other')
);

Embeddings::assertNothingGenerated();
```

Para las generaciones de embeddings encoladas, utiliza los métodos de aserción de encolado:

```php
Embeddings::assertQueued(
    fn (QueuedEmbeddingsPrompt $prompt) => $prompt->contains('Laravel')
);

Embeddings::assertNotQueued(
    fn (QueuedEmbeddingsPrompt $prompt) => $prompt->contains('Other')
);

Embeddings::assertNothingQueued();
```

Para garantizar que todas las generaciones de embeddings tengan una respuesta simulada correspondiente, puedes utilizar `preventStrayEmbeddings`. Si se generan embeddings sin una respuesta simulada definida, se lanzará una excepción:

```php
Embeddings::fake()->preventStrayEmbeddings();
```

<a id="testing-reranking"></a>
### Reordenamiento

Puedes simular las operaciones de reordenamiento invocando el método `fake` de la clase `Reranking`:

```php
use Laravel\Ai\Reranking;
use Laravel\Ai\Prompts\RerankingPrompt;
use Laravel\Ai\Responses\Data\RankedDocument;

// Generar automáticamente respuestas ficticias reordenadas...
Reranking::fake();

// Proporcionar respuestas personalizadas...
Reranking::fake([
    [
        new RankedDocument(index: 0, document: 'First', score: 0.95),
        new RankedDocument(index: 1, document: 'Second', score: 0.80),
    ],
]);
```

Después del reordenamiento, puedes realizar aserciones sobre las operaciones realizadas:

```php
Reranking::assertReranked(function (RerankingPrompt $prompt) {
    return $prompt->contains('Laravel') && $prompt->limit === 5;
});

Reranking::assertNotReranked(
    fn (RerankingPrompt $prompt) => $prompt->contains('Django')
);

Reranking::assertNothingReranked();
```

<a id="testing-classification"></a>
### Clasificación

Puedes simular la clasificación invocando el método `fake` de la clase `Classification`. Si no proporcionas respuestas personalizadas, Laravel generará automáticamente respuestas que coincidan con la estructura de cada pregunta:

```php
use Laravel\Ai\Classification;
use Laravel\Ai\Prompts\ClassificationPrompt;
use Laravel\Ai\Responses\Data\BooleanAnswer;
use Laravel\Ai\Responses\Data\ChoiceAnswer;

// Generar respuestas ficticias automáticamente...
Classification::fake();

// Proporcionar respuestas a preguntas específicas...
Classification::fake([
    [
        'urgent' => new BooleanAnswer(0.94),
        'department' => new ChoiceAnswer('technical', [
            'billing' => 0.08,
            'technical' => 0.87,
            'sales' => 0.05,
        ], confidence: 0.82),
    ],
]);

// Crear respuestas a partir del prompt...
Classification::fake(fn (ClassificationPrompt $prompt) => [
    'urgent' => new BooleanAnswer($prompt->contains('ASAP') ? 1.0 : 0.0),
]);
```

Las preguntas omitidas de una respuesta simulada seguirán recibiendo una respuesta generada, por lo que tus pruebas solo necesitan proporcionar las respuestas sobre las que realizan aserciones.

Después de clasificar, puedes realizar aserciones sobre las operaciones realizadas:

```php
Classification::assertClassified(function (ClassificationPrompt $prompt) {
    return $prompt->contains('refund') && $prompt->asks('department');
});

Classification::assertNotClassified(
    fn (ClassificationPrompt $prompt) => $prompt->asks('sentiment')
);

Classification::assertNothingClassified();
```

<a id="testing-files"></a>
### Archivos

Puedes simular las operaciones de archivos invocando el método `fake` de la clase `Files`:

```php
use Laravel\Ai\Files;

Files::fake();
```

Una vez simuladas las operaciones de archivos, puedes realizar aserciones sobre las cargas y eliminaciones realizadas:

```php
use Laravel\Ai\Contracts\Files\StorableFile;
use Laravel\Ai\Files\Document;

// Guardar archivos...
Document::fromString('Hello, Laravel!', mimeType: 'text/plain')
    ->as('hello.txt')
    ->put();

// Make assertions...
Files::assertStored(fn (StorableFile $file) =>
    (string) $file === 'Hello, Laravel!' &&
        $file->mimeType() === 'text/plain'
);

Files::assertNotStored(fn (StorableFile $file) =>
    (string) $file === 'Hello, World!'
);

Files::assertNothingStored();
```

Para realizar aserciones sobre las eliminaciones de archivos, puedes pasar un ID de archivo:

```php
Files::assertDeleted('file-id');
Files::assertNotDeleted('file-id');
Files::assertNothingDeleted();
```

<a id="testing-vector-stores"></a>
### Almacenes vectoriales

Puedes simular las operaciones de almacenes vectoriales invocando el método `fake` de la clase `Stores`. Simular los almacenes también simula automáticamente las [operaciones de archivos](#files):

```php
use Laravel\Ai\Stores;

Stores::fake();
```

Una vez simuladas las operaciones de almacenes, puedes realizar aserciones sobre los almacenes creados o eliminados:

```php
use Laravel\Ai\Stores;

// Crear el store...
$store = Stores::create('Knowledge Base');

// Make assertions...
Stores::assertCreated('Knowledge Base');

Stores::assertCreated(fn (string $name, ?string $description) =>
    $name === 'Knowledge Base'
);

Stores::assertNotCreated('Other Store');

Stores::assertNothingCreated();
```

Para realizar aserciones sobre las eliminaciones de almacenes, puedes proporcionar el ID del almacén:

```php
Stores::assertDeleted('store_id');
Stores::assertNotDeleted('other_store_id');
Stores::assertNothingDeleted();
```

Para verificar mediante aserciones que se añadieron o quitaron archivos de un almacén, utiliza los métodos de aserción de una instancia de `Store`:

```php
Stores::fake();

$store = Stores::get('store_id');

// Add / remove files...
$store->add('added_id');
$store->remove('removed_id');

// Make assertions...
$store->assertAdded('added_id');
$store->assertRemoved('removed_id');

$store->assertNotAdded('other_file_id');
$store->assertNotRemoved('other_file_id');
```

Si se almacena un archivo en el [almacenamiento de archivos](#files) del proveedor y se añade a un almacén vectorial en la misma solicitud, puede que no conozcas el ID del archivo asignado por el proveedor. En este caso, puedes pasar una función anónima al método `assertAdded` para realizar aserciones sobre el contenido del archivo añadido:

```php
use Laravel\Ai\Contracts\Files\StorableFile;
use Laravel\Ai\Files\Document;

$store->add(Document::fromString('Hello, World!', 'text/plain')->as('hello.txt'));

$store->assertAdded(fn (StorableFile $file) => $file->name() === 'hello.txt');
$store->assertAdded(fn (StorableFile $file) => $file->content() === 'Hello, World!');
```

<a id="events"></a>
## Eventos

El Laravel AI SDK despacha diversos [eventos](../events/), entre ellos:

- `AddingFileToStore`
- `AgentFailed`
- `AgentFailedOver`
- `AgentPrompted`
- `AgentStreamed`
- `AudioGenerated`
- `Classified`
- `Classifying`
- `CreatingStore`
- `EmbeddingsGenerated`
- `FileAddedToStore`
- `FileDeleted`
- `FileRemovedFromStore`
- `FileStored`
- `GeneratingAudio`
- `GeneratingEmbeddings`
- `GeneratingImage`
- `GeneratingTranscription`
- `ImageGenerated`
- `InvokingTool`
- `PromptingAgent`
- `ProviderFailedOver`
- `RemovingFileFromStore`
- `Reranked`
- `Reranking`
- `StartingStep`
- `StepCompleted`
- `StepFailed`
- `StoreCreated`
- `StoreDeleted`
- `StoringFile`
- `StreamingAgent`
- `ToolApprovalRequested`
- `ToolApprovalResolved`
- `ToolFailed`
- `ToolInvoked`
- `TranscriptionGenerated`

Puedes escuchar cualquiera de estos eventos para registrar o almacenar información sobre el uso del AI SDK.
