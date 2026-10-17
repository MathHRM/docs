---
title: "Laravel AI SDK"
---

- [Introdução](#introduction)
- [Instalação](#installation)
    - [Configuração](#configuration)
    - [URLs Base Personalizadas](#custom-base-urls)
    - [Provedores Compatíveis com OpenAI](#openai-compatible-providers)
    - [Provedores Sob Demanda](#on-demand-providers)
    - [Suporte a Provedores](#provider-support)
- [Agents](#agents)
    - [Prompting](#prompting)
    - [Contexto de Conversa](#conversation-context)
    - [Saída Estruturada](#structured-output)
    - [Anexos](#attachments)
    - [Streaming](#streaming)
    - [Broadcasting](#broadcasting)
    - [Enfileiramento](#queueing)
    - [Tools](#tools)
    - [Carregamento Adiado de Tools](#deferred-tool-loading)
    - [Tools de Armazenamento de Arquivos](#file-storage-tools)
    - [MCP Tools](#mcp-tools)
    - [Skills](#skills)
    - [Tools de Provedor](#provider-tools)
    - [Sub-Agents](#sub-agents)
    - [Middleware](#middleware)
    - [Agents Anônimos](#anonymous-agents)
    - [Configuração de Agent](#agent-configuration)
    - [Opções de Provedor](#provider-options)
    - [Cache de Prompt](#prompt-caching)
- [Aprovação Humana de Tool](#human-tool-approval)
    - [Fluxo Completo de Aprovação](#complete-approval-flow)
- [Imagens](#images)
- [Áudio (TTS)](#audio)
- [Transcrição (STT)](#transcription)
- [Resumo de Texto](#text-summarization)
- [Embeddings](#embeddings)
    - [Embeddings Multimodais](#multimodal-embeddings)
    - [Consultando Embeddings](#querying-embeddings)
    - [Cache de Embeddings](#caching-embeddings)
- [Reranking](#reranking)
    - [Reranking de Coleções](#reranking-collections)
- [Classificação](#classification)
    - [Classificando Imagens](#classifying-images)
    - [Decisões Sim ou Não](#yes-or-no-decisions)
    - [Escolhendo a Partir de Coleções](#choosing-from-collections)
- [Arquivos](#files)
    - [Usando Arquivos Armazenados em Conversas](#using-stored-files-in-conversations)
- [Vector Stores](#vector-stores)
    - [Adicionando Arquivos aos Stores](#adding-files-to-stores)
- [Uso](#usage)
- [Failover](#failover)
- [Testes](#testing)
    - [Agents](#testing-agents)
    - [Imagens](#testing-images)
    - [Áudio](#testing-audio)
    - [Transcrições](#testing-transcriptions)
    - [Embeddings](#testing-embeddings)
    - [Reranking](#testing-reranking)
    - [Classificação](#testing-classification)
    - [Arquivos](#testing-files)
    - [Vector Stores](#testing-vector-stores)
- [Eventos](#events)

<a id="introduction"></a>
## Introdução

O [Laravel AI SDK](https://github.com/laravel/ai) fornece uma API unificada e expressiva para interagir com provedores de IA como OpenAI, Anthropic, Gemini e outros. Com o AI SDK, você pode construir agents inteligentes com tools e saída estruturada, gerar imagens, sintetizar e transcrever áudio, criar embeddings vetoriais e muito mais — tudo usando uma interface consistente e amigável ao Laravel.

<a id="installation"></a>
## Instalação

Você pode instalar o Laravel AI SDK via Composer:

```shell
composer require laravel/ai
```

Em seguida, você deve publicar os arquivos de configuração e migration do AI SDK usando o comando Artisan `vendor:publish`:

```shell
php artisan vendor:publish --provider="Laravel\Ai\AiServiceProvider"
```

Por fim, você deve executar as migrations de banco de dados da sua aplicação. Isso criará as tabelas `agent_conversations` e `agent_conversation_messages` que o AI SDK usa para alimentar seu armazenamento de conversas:

```shell
php artisan migrate
```

<a id="configuration"></a>
### Configuração

Você pode definir as credenciais dos seus provedores de IA no arquivo de configuração `config/ai.php` da sua aplicação ou como variáveis de ambiente no arquivo `.env` da sua aplicação:

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

Os modelos padrão usados para texto, imagens, áudio, transcrição e embeddings também podem ser configurados no arquivo de configuração `config/ai.php` da sua aplicação.

<a id="custom-base-urls"></a>
### URLs Base Personalizadas

Por padrão, o Laravel AI SDK se conecta diretamente ao endpoint público da API de cada provedor. No entanto, você pode precisar rotear requisições através de um endpoint diferente - por exemplo, ao usar um serviço de proxy para centralizar o gerenciamento de chaves de API, implementar rate limiting ou rotear tráfego através de um gateway corporativo.

Você pode configurar URLs base personalizadas adicionando um parâmetro `url` à configuração do seu provedor:

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

Isso é útil ao rotear requisições através de um serviço de proxy (como LiteLLM ou Azure OpenAI Gateway) ou ao usar endpoints alternativos.

URLs base personalizadas são suportadas para os seguintes provedores: OpenAI, Anthropic, Gemini, Groq, Cohere, DeepSeek, xAI e OpenRouter.

<a id="openai-compatible-providers"></a>
### Provedores Compatíveis com OpenAI

Se você estiver usando uma API compatível com OpenAI, como LM Studio, vLLM, Together, Fireworks ou um gateway local, você pode configurar um provedor `openai-compatible`. A opção `url` é obrigatória, enquanto a opção `key` é opcional e será enviada como um bearer token quando presente:

```php
'providers' => [
    'local' => [
        'driver' => 'openai-compatible',
        'url' => env('LOCAL_AI_URL'),
        'key' => env('LOCAL_AI_API_KEY'),
    ],
],
```

Uma vez configurado, você pode usar o provedor nomeado como qualquer outro provedor:

```php
agent()->prompt('What is Laravel?', provider: 'local', model: 'local-model');
```

Você também pode configurar um modelo de texto padrão para o provedor de forma que não precise passar um modelo explicitamente:

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

Você pode adicionar cabeçalhos HTTP personalizados a cada requisição de saída do provedor definindo um array `headers` em sua configuração. Isso é útil quando um endpoint requer um cabeçalho adicional de identificação ou autenticação além do bearer token:

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

Provedores compatíveis com OpenAI suportam geração de texto, streaming, tools, saída estruturada, anexos de imagem, embeddings e transcrição. Se o seu endpoint exigir campos adicionais no corpo da requisição, forneça-os usando [opções de provedor](#provider-options).

<a id="openai-compatible-embeddings"></a>
#### Embeddings Compatíveis com OpenAI

Como endpoints arbitrários não possuem modelos conhecidos, você deve configurar um modelo de embeddings padrão para usar `embeddings()` com um provedor compatível com OpenAI. Você também pode configurar um valor fixo de dimensões; se omitido, a requisição é enviada sem um parâmetro `dimensions` e as dimensões nativas do modelo são usadas.

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
#### Transcrições Compatíveis com OpenAI

Da mesma forma, você deve configurar um modelo de transcrição padrão para usar `Transcription` com um provedor compatível com OpenAI. O áudio será enviado para a rota `/audio/transcriptions` do endpoint como uma requisição multipart padrão:

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
> Provedores compatíveis com OpenAI e Groq não suportam diarização. Invocar o método `diarize` ao usar esses provedores lançará uma exceção.

<a id="on-demand-providers"></a>
### Provedores Sob Demanda

Às vezes você pode precisar usar credenciais de provedor que não estão definidas no arquivo de configuração da sua aplicação, como chaves de API armazenadas no seu banco de dados para cada tenant de uma aplicação multi-tenant. Você pode usar o método `Ai::build` para criar um provedor a partir de um array de configuração. O array deve ter a mesma estrutura de uma entrada de provedor no arquivo de configuração `config/ai.php` da sua aplicação:

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

Provedores sob demanda podem ser usados em qualquer lugar onde um provedor é aceito, incluindo listas de [failover](#failover) e ao gerar imagens, áudio, transcrições e embeddings. Para especificar um modelo para um provedor sob demanda, inclua um array `models` em sua configuração:

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

Quando um agent deve sempre usar um provedor sob demanda, você pode retornar o provedor a partir do método `provider` do agent. Como o provedor é reconstruído quando o agent é usado, essa abordagem também funciona bem para agents [enfileirados](#queueing):

```php
use Laravel\Ai\Ai;
use Laravel\Ai\Providers\Provider;

public function provider(): Provider
{
    return Ai::build($this->user->aiConfiguration());
}
```

> **Nota:**
> Você deve passar provedores sob demanda dentro de um array, como mostrado nos exemplos acima. Se você der a um provedor sob demanda um `name` em seu array de configuração, o nome não pode corresponder a um provedor embutido ou a um provedor definido no seu arquivo de configuração `config/ai.php`.

<a id="provider-support"></a>
### Suporte a Provedores

O AI SDK suporta uma variedade de provedores em seus recursos. A tabela a seguir resume quais provedores estão disponíveis para cada recurso:

<div class="overflow-auto">

| Recurso | Provedores |
|---|---|
| Texto | OpenAI, OpenAI Compatible, Anthropic, Gemini, Azure, Bedrock, Groq, xAI, DeepSeek, Mistral, Ollama, OpenRouter, Cohere |
| Imagens | OpenAI, Gemini, xAI, Azure, Bedrock, OpenRouter |
| TTS | OpenAI, ElevenLabs, Gemini, Mistral, OpenRouter |
| STT | OpenAI, OpenAI Compatible, ElevenLabs, Groq, Mistral, Gemini, OpenRouter |
| Embeddings | OpenAI, OpenAI Compatible, Gemini, Azure, Bedrock, Cohere, Mistral, Jina, VoyageAI, Ollama, OpenRouter |
| Reranking | Cohere, Jina, VoyageAI, Bedrock, OpenRouter |
| Classificação | OpenAI, TypeSafe, OpenRouter |
| Arquivos | OpenAI, Anthropic, Gemini, Azure, OpenRouter |

</div>

A enum `Laravel\Ai\Enums\Lab` pode ser usada para referenciar provedores ao longo do seu código em vez de usar strings simples:

```php
use Laravel\Ai\Enums\Lab;

Lab::Anthropic;
Lab::OpenAI;
Lab::OpenAiCompatible;
Lab::Gemini;
// ...
```

<a id="agents"></a>
## Agents

Agents são o bloco de construção fundamental para interagir com provedores de IA no Laravel AI SDK. Cada agent é uma classe PHP dedicada que encapsula as instruções, o contexto de conversa, as tools e o schema de saída necessários para interagir com um large language model. Pense em um agent como um assistente especializado — um coach de vendas, um analisador de documentos, um bot de suporte — que você configura uma vez e usa via prompt conforme necessário ao longo da sua aplicação.

Você pode criar um agent via comando Artisan `make:agent`:

```shell
php artisan make:agent SalesCoach

php artisan make:agent SalesCoach --structured
```

Dentro da classe de agent gerada, você pode definir o system prompt / instruções, o contexto de mensagens, as tools disponíveis e o schema de saída (se aplicável):

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
     * Get the instructions that the agent should follow.
     */
    public function instructions(): Stringable|string
    {
        return 'You are a sales coach, analyzing transcripts and providing feedback and an overall sales strength score.';
    }

    /**
     * Get the list of messages comprising the conversation so far.
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
     * Get the tools available to the agent.
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
     * Get the agent's structured output schema definition.
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
### Prompting

Para fazer o prompt de um agent, primeiro crie uma instância usando o método `make` ou instanciação padrão, então chame `prompt`:

```php
$response = (new SalesCoach)
    ->prompt('Analyze this sales transcript...');

return (string) $response;
```

O método `make` resolve seu agent a partir do container, permitindo injeção automática de dependências. Você também pode passar argumentos para o construtor do agent:

```php
$agent = SalesCoach::make(user: $user);
```

Ao passar argumentos adicionais para o método `prompt`, você pode sobrescrever o provedor padrão, o modelo ou o timeout HTTP ao fazer o prompt:

```php
$response = (new SalesCoach)->prompt(
    'Analyze this sales transcript...',
    provider: Lab::Anthropic,
    model: 'claude-sonnet-5',
    timeout: 120,
);
```

<a id="raw-http-responses"></a>
#### Respostas HTTP Brutas

Toda resposta retornada de um agent gerador de texto expõe a resposta HTTP bruta da chamada à API do provedor subjacente por meio de uma propriedade `raw`. Isso lhe dá acesso a informações específicas do provedor que não fazem parte da resposta genérica do AI SDK - cabeçalhos de rate limit, IDs de requisição ou outros campos exatos do payload:

```php
$response = (new SalesCoach)->prompt('Analyze this sales transcript...');

$response->raw; // Illuminate\Http\Client\Response|null

$response->raw->header('X-RateLimit-Remaining-Requests');
$response->raw->json('id');
```

Em um loop de chamada de tools, cada step retém a resposta bruta de sua própria requisição:

```php
foreach ($response->steps as $step) {
    $step->raw?->header('X-RateLimit-Remaining-Requests');
}
```

> **Nota:** A propriedade `raw` é `null` ao fazer streaming de uma resposta, ao usar o provedor Bedrock (que realiza suas chamadas de API via AWS SDK em vez de um cliente HTTP) e em respostas falsas (faked), a menos que uma seja fornecida explicitamente via `withRawResponse`.

<a id="conversation-context"></a>
### Contexto de Conversa

Se o seu agent implementa a interface `Conversational`, você pode usar o método `messages` para retornar o contexto de conversa anterior, se aplicável:

```php
/**
 * Get the list of messages comprising the conversation so far.
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

Se o seu agent não implementa a interface `Conversational`, você pode usar o método `withMessages` para fornecer o histórico de conversa para uma única execução, como um histórico postado pelo frontend da sua aplicação:

```php
use Laravel\Ai\Messages\Message;

$response = (new SalesCoach)
    ->withMessages([
        new Message('user', 'Analyze this sales transcript...'),
        new Message('assistant', 'The rep never asked for the close.'),
    ])
    ->prompt('What should they say next time?');
```

Agents que implementam a interface `Conversational` carregam seu próprio histórico, portanto combinar as duas abordagens lançará uma `LogicException`.

<a id="remembering-conversations"></a>
#### Lembrando Conversas

> **Aviso:** Antes de usar a trait `RemembersConversations`, você deve publicar e executar as migrations do AI SDK usando o comando Artisan `vendor:publish`. Essas migrations criarão as tabelas de banco de dados necessárias para armazenar conversas.

Se você quiser que o Laravel armazene e recupere automaticamente o histórico de conversa do seu agent, você pode usar a trait `RemembersConversations`. Essa trait fornece uma maneira simples de persistir mensagens de conversa no banco de dados sem implementar manualmente a interface `Conversational`:

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
     * Get the instructions that the agent should follow.
     */
    public function instructions(): string
    {
        return 'You are a sales coach...';
    }
}
```

Ao usar a trait `RemembersConversations`, não defina manualmente um método `messages` na sua classe de agent. Se um método `messages` estiver presente, ele terá precedência sobre a implementação da trait e o histórico de conversa não será carregado do banco de dados.

Para iniciar uma nova conversa para um usuário, chame o método `forUser` antes de fazer o prompt:

```php
$response = (new SalesCoach)->forUser($user)->prompt('Hello!');

$conversationId = $response->conversationId;
```

O ID da conversa é retornado na resposta e pode ser armazenado para referência futura. Se você quiser recuperar todas as conversas de um usuário usando Eloquent, você pode adicionar a trait `HasConversations` ao seu modelo de usuário:

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

Uma vez que a trait foi adicionada ao seu modelo, você pode recuperar e consultar as conversas do usuário por meio da relação `conversations`:

```php
$conversations = $user->conversations()
    ->latest('updated_at')
    ->paginate(20);
```

Para continuar uma conversa existente, use o método `continue`:

```php
$response = (new SalesCoach)
    ->continue($conversationId, as: $user)
    ->prompt('Tell me more about that.');
```

O método `continueOrStart` pode ser usado para continuar a conversa fornecida ou iniciar uma nova conversa se o ID fornecido for `null`:

```php
$response = (new SalesCoach)
    ->continueOrStart($conversationId, as: $user)
    ->prompt('Hello!');
```

Ao usar a trait `RemembersConversations`, as mensagens anteriores são automaticamente carregadas e incluídas no contexto de conversa ao fazer o prompt. Novas mensagens (tanto de usuário quanto de assistant) são automaticamente armazenadas após cada interação. Cada resposta também contém os IDs da conversa e das mensagens que foram armazenadas:

```php
$response->conversationId;
$response->userMessageId;
$response->assistantMessageId;
```

<a id="conversation-participants"></a>
#### Participantes de Conversa

Embora usuários sejam os participantes de conversa mais comuns, as conversas podem pertencer a qualquer modelo Eloquent. Use o método `forParticipant` para iniciar uma conversa para outro tipo de modelo:

```php
$response = (new SalesCoach)
    ->forParticipant($team)
    ->prompt('Review our latest sales results.');
```

A classe morph e a chave primária do participante são armazenadas com a conversa. Portanto, modelos de tipos diferentes que têm a mesma chave primária, como `User` ID `1` e `Team` ID `1`, têm históricos de conversa separados. O método `forUser` é um alias para `forParticipant`.

Você pode continuar a conversa mais recente do participante com o agent usando o método `continueLastConversation`. As conversas são escopadas ao agent, portanto apenas conversas das quais o agent participou serão continuadas:

```php
$response = (new SalesCoach)
    ->continueLastConversation($team)
    ->prompt('Tell me more about that.');
```

Ao continuar uma conversa específica, passe o participante para o método `continue`:

```php
$response = (new SalesCoach)
    ->continue($conversationId, as: $team)
    ->prompt('Tell me more about that.');
```

A trait `HasConversations` pode ser adicionada a qualquer modelo Eloquent que participe de conversas. A relação `conversations` resultante é uma relação polimórfica escopada ao tipo e chave primária daquele modelo. Você também pode acessar o participante que é dono de uma conversa por meio de sua relação inversa:

```php
$conversations = $team->conversations;

$participant = $conversation->participant;
```

Se a sua aplicação usar múltiplos tipos de modelos de participantes, você deve considerar definir um [morph map do Eloquent](/en/eloquent-relationships/#custom-polymorphic-types) para que os tipos de participantes armazenados não fiquem acoplados aos nomes das suas classes de modelo.

> **Aviso:**
> Os métodos `continue` e `continueOrStart` não verificam se o participante fornecido é dono da conversa. Sua aplicação deve autorizar o acesso à conversa antes de continuá-la.

<a id="inspecting-stored-conversations"></a>
#### Inspecionando Conversas Armazenadas

Ao exibir uma conversa aos seus usuários, você frequentemente precisa de detalhes como IDs de mensagens, timestamps e chamadas de tool. Você pode resolver o store de conversa a partir do service container para ler as mensagens armazenadas sem consultar diretamente as tabelas do AI SDK:

```php
use Laravel\Ai\Contracts\ConversationStore;

$store = app(ConversationStore::class);
```

As mensagens são paginadas das mais novas primeiro usando um cursor e são retornadas como instâncias de `StoredMessage`, que contêm o ID de cada mensagem, timestamps, uso, metadados e anexos:

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

Cada turno, que consiste em um prompt do usuário e a resposta do assistant, é armazenado como uma lista de steps. Um step é uma única requisição ao provedor, portanto um turno em que o modelo chama tools conterá vários steps. Cada resultado de tool é registrado na chamada de tool que o produziu. Os métodos `toolCalls`, `providerToolCalls` e `toolResults` achatam esses steps em ordem, de forma que você não precise percorrê-los por conta própria:

```php
$message->steps;

$message->toolCalls();
$message->providerToolCalls();
$message->toolResults();
```

Uma chamada de tool contém um `result` assim que foi executada. Chamadas de tool que contêm um `approval_reason` mas nenhum `result` ainda estão aguardando uma [aprovação de tool](#human-tool-approval).

A propriedade `status` contém uma instância de `Laravel\Ai\Enums\MessageStatus`. Um turno que falhou parcialmente é armazenado como `Failed` junto com os steps que já havia completado, portanto chamadas de tool que executaram antes da falha permanecem no histórico. Quando a conversa continua, qualquer chamada de tool sem um resultado registrado é enviada ao modelo marcada como interrompida, já que o Laravel não pode determinar se ela foi executada.

Antes de continuar uma conversa por meio de um ID fornecido pelo frontend da sua aplicação, você deve verificar que a conversa foi armazenada para o participante fornecido:

```php
abort_unless($store->conversationBelongsTo(
    $conversationId, $user->getMorphClass(), $user->getKey()
), 403);
```

Se o turno mais recente estiver pausado aguardando [aprovação de tool](#human-tool-approval), você pode renderizar suas chamadas de tool pendentes após um recarregamento de página sem retomar a execução:

```php
foreach ($store->pendingApprovalsFor($conversationId) as $approval) {
    // $approval->id, $approval->tool, $approval->arguments, $approval->reason...
}
```

Esses métodos são definidos pelos contratos `PaginatesConversations`, `VerifiesConversationOwnership` e `ResolvesPendingApprovals`. O store de banco de dados incluído implementa os três, enquanto um store personalizado pode implementar apenas os contratos de que precisa.

<a id="structured-output"></a>
### Saída Estruturada

Se você quiser que o seu agent retorne saída estruturada, implemente a interface `HasStructuredOutput`, que exige que o seu agent defina um método `schema`:

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
     * Get the agent's structured output schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'score' => $schema->integer()->required(),
        ];
    }
}
```

Ao fazer o prompt de um agent que retorna saída estruturada, você pode acessar a `StructuredAgentResponse` retornada como um array:

```php
$response = (new SalesCoach)->prompt('Analyze this sales transcript...');

return $response['score'];
```

<a id="structured-output-nested-objects"></a>
#### Objetos Aninhados

Para definir saída estruturada aninhada, use o método `object` com uma closure:

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
     * Get the agent's structured output schema definition.
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
#### Arrays de Objetos

Se o seu agent deve retornar uma lista de itens estruturados, combine os métodos `array` e `object`:

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

Se um valor pode corresponder a um de vários schemas, use o método `anyOf`:

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
### Anexos

Ao fazer o prompt, você também pode passar anexos junto com o prompt para permitir que o modelo inspecione imagens e documentos:

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

Da mesma forma, a classe `Laravel\Ai\Files\Image` pode ser usada para anexar imagens a um prompt:

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
### Streaming

Você pode fazer streaming da resposta de um agent invocando o método `stream`. A `StreamableAgentResponse` retornada pode ser retornada de uma rota para enviar automaticamente uma resposta de streaming (SSE) ao cliente:

```php
use App\Ai\Agents\SalesCoach;

Route::get('/coach', function () {
    return (new SalesCoach)->stream('Analyze this sales transcript...');
});
```

O método `then` pode ser usado para fornecer uma closure que será invocada quando toda a resposta tiver sido transmitida ao cliente:

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

Alternativamente, você pode iterar pelos eventos transmitidos manualmente:

```php
$stream = (new SalesCoach)->stream('Analyze this sales transcript...');

foreach ($stream as $event) {
    // ...
}
```

A resposta também contém o raciocínio (reasoning) do modelo e quaisquer fontes que ele citou. Ambos são armazenados com a mensagem do assistant ao usar a trait `RemembersConversations`:

```php
use Laravel\Ai\Responses\StreamedAgentResponse;

(new SalesCoach)
    ->stream('Analyze this sales transcript...')
    ->then(function (StreamedAgentResponse $response) {
        $response->reasoning; // '' unless the model returned reasoning text...
        $response->meta->citations;
    });
```

O raciocínio também está disponível nas respostas retornadas pelo método `prompt`.

<a id="streaming-using-the-vercel-ai-sdk-protocol"></a>
<a id="stream-protocols"></a>
#### Protocolos de Stream

Por padrão, as respostas transmitidas usam o formato de eventos próprio do AI SDK. No entanto, você pode usar um protocolo de streaming de frontend em vez disso, o que permite parear seu agent com uma interface de chat existente em vez de construir a sua própria.

Você pode fazer streaming dos eventos usando o [protocolo de stream do Vercel AI SDK](https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol) invocando o método `usingVercelDataProtocol` na resposta transmitível:

```php
use App\Ai\Agents\SalesCoach;

Route::get('/coach', function () {
    return (new SalesCoach)
        ->stream('Analyze this sales transcript...')
        ->usingVercelDataProtocol();
});
```

Você pode passar um ID de mensagem se o frontend da sua aplicação atribuir o seu próprio:

```php
->usingVercelDataProtocol($request->string('messageId'));
```

Alternativamente, o método `usingAgentUserInteractionProtocol` pode ser usado para fazer streaming usando o [protocolo Agent User Interaction (AG-UI)](https://docs.ag-ui.com):

```php
Route::post('/coach', function (Request $request) {
    return (new SalesCoach)
        ->forUser($request->user())
        ->stream($request->string('prompt'))
        ->usingAgentUserInteractionProtocol();
});
```

Os argumentos `threadId` e `runId` são opcionais e usam como padrão o ID da conversa e o ID da invocação:

```php
->usingAgentUserInteractionProtocol(
    threadId: $request->input('threadId'),
    runId: $request->input('runId'),
);
```

Para usar um protocolo que o AI SDK não implementa, você pode passar a sua própria implementação de `Laravel\Ai\Streaming\Protocols\StreamProtocol` ao método `usingProtocol`:

```php
use App\Ai\Protocols\CustomProtocol;

return (new SalesCoach)
    ->stream('Analyze this sales transcript...')
    ->usingProtocol(new CustomProtocol);
```

<a id="chat-requests"></a>
<a id="frontend-integration"></a>
#### Integração com Frontend

Interfaces de chat construídas com bibliotecas como o `useChat` da Vercel ou o CopilotKit já renderizam mensagens, chamadas de tool e prompts de aprovação, de forma que sua aplicação só precisa lidar com as requisições que elas enviam. Cada requisição contém o histórico de conversa, a mensagem mais recente do usuário e quaisquer respostas de aprovação de tool.

Os métodos `Vercel::chat` e `AgentUserInteraction::chat` convertem tal requisição em um objeto que pode ser passado diretamente ao método `stream` de um agent:

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

Se a requisição contiver [decisões de aprovação](#human-tool-approval), o agent retomará usando essas decisões. Caso contrário, o agent recebe o prompt com a mensagem de usuário e os anexos mais recentes da requisição. O método `protocol` retorna o protocolo usado pelo cliente.

> **Nota:**
> Agents que implementam a interface `Conversational` carregam seu próprio histórico, portanto o método `withMessages` pode ser omitido.

O método `AgentUserInteraction::chat` fornece a mesma API para clientes AG-UI, além dos IDs de thread e run da requisição:

```php
use Laravel\Ai\AgentUserInteraction\AgentUserInteraction;

$chat = AgentUserInteraction::chat($request);

$chat->threadId();
$chat->runId();
```

Você também pode converter mensagens armazenadas de volta ao formato que um cliente espera, permitindo que o cliente exiba uma conversa anterior, como após um recarregamento de página:

```php
$messages = $conversation->messages()->oldest()->get();

return ['messages' => Vercel::toUiMessages($messages)];
```

O método `AgentUserInteraction::toClientState` realiza a mesma conversão para clientes AG-UI, além de retornar quaisquer interrupções de aprovação pendentes:

```php
return AgentUserInteraction::toClientState($messages);
```

<a id="broadcasting"></a>
### Broadcasting

Você pode fazer broadcast de eventos transmitidos de algumas formas diferentes. Primeiro, você pode simplesmente invocar o método `broadcast` ou `broadcastNow` em um evento transmitido:

```php
use App\Ai\Agents\SalesCoach;
use Illuminate\Broadcasting\Channel;

$stream = (new SalesCoach)->stream('Analyze this sales transcript...');

foreach ($stream as $event) {
    $event->broadcast(new Channel('channel-name'));
}
```

Ou, você pode invocar o método `broadcastOnQueue` de um agent para enfileirar a operação do agent e fazer broadcast dos eventos transmitidos conforme eles ficam disponíveis:

```php
(new SalesCoach)->broadcastOnQueue(
    'Analyze this sales transcript...',
    new Channel('channel-name'),
);
```

<a id="skipping-oversized-events"></a>
#### Ignorando Eventos Muito Grandes

Algumas plataformas de broadcasting limitam mensagens WebSocket a cerca de 10KB. Eventos de stream com muitos dados, como grandes resultados de tool, podem exceder esse limite e fazer o broadcasting falhar. Você pode excluir tipos específicos de eventos do broadcasting usando o atributo `WithoutBroadcasting`:

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

Os eventos excluídos nunca são transmitidos via broadcast, mas ainda são persistidos na tabela `agent_conversation_messages`, de forma que o seu frontend possa carregar os dados completos da tool após a conclusão do stream. Isso funciona tanto para broadcasting enfileirado (`broadcastOnQueue`) quanto síncrono (`broadcast` / `broadcastNow`).

<a id="queueing"></a>
### Enfileiramento

Usando o método `queue` de um agent, você pode fazer o prompt do agent, mas permitir que ele processe a resposta em segundo plano, mantendo sua aplicação rápida e responsiva. Os métodos `then` e `catch` podem ser usados para registrar closures que serão invocadas quando uma resposta estiver disponível ou se uma exceção ocorrer:

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
### Tools

Tools podem ser usadas para dar aos agents funcionalidades adicionais que eles podem utilizar ao responder a prompts. Tools podem ser criadas usando o comando Artisan `make:tool`:

```shell
php artisan make:tool RandomNumberGenerator
```

A tool gerada será colocada no diretório `app/Ai/Tools` da sua aplicação. Cada tool contém um método `handle` que será invocado pelo agent quando ele precisar utilizar a tool:

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
     * Get the description of the tool's purpose.
     */
    public function description(): Stringable|string
    {
        return 'This tool may be used to generate cryptographically secure random numbers.';
    }

    /**
     * Execute the tool.
     */
    public function handle(Request $request): Stringable|string
    {
        return (string) random_int($request['min'], $request['max']);
    }

    /**
     * Get the tool's schema definition.
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

Uma vez que você definiu sua tool, você pode retorná-la a partir do método `tools` de qualquer um dos seus agents:

```php
use App\Ai\Tools\RandomNumberGenerator;

/**
 * Get the tools available to the agent.
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
#### Sobrescritas de Tools em Tempo de Execução

O método `withTools` pode ser usado para substituir as tools declaradas por uma instância de agent. Isso é útil para conjuntos de tools por tenant ou controlados por feature flags:

```php
$response = (new SupportAgent)
    ->withTools([new LookupOrder])
    ->prompt('Where is order 12345?');
```

Você também pode passar uma closure, que recebe as tools declaradas do agent, permitindo que você as acrescente ou filtre:

```php
$response = (new SupportAgent)
    ->withTools(fn (array $tools) => [...$tools, new LookupOrder])
    ->prompt('Where is order 12345?');
```

<a id="validating-tool-arguments"></a>
#### Validando Argumentos de Tool

Embora o schema da sua tool restrinja os argumentos que um modelo pode fornecer, você pode validar os argumentos recebidos usando o método `validate` da request:

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

Quando a validação falha, as mensagens de validação são retornadas ao modelo como o resultado da tool, permitindo que ele corrija os argumentos e chame a tool novamente.

<a id="repairing-tool-calls"></a>
#### Reparando Chamadas de Tool

Use o atributo `RepairToolCalls` para permitir que um agent se recupere quando um modelo chama uma tool local desconhecida. O Laravel retorna a chamada que falhou ao modelo com os nomes das tools locais disponíveis, permitindo que ele corrija a chamada:

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

Quando o Laravel deriva o número máximo de steps automaticamente, este atributo adiciona um step para a chamada reparada. Limites explícitos de `MaxSteps` permanecem inalterados.

<a id="similarity-search"></a>
#### Busca por Similaridade

A tool `SimilaritySearch` permite que agents busquem por documentos similares a uma dada query usando embeddings vetoriais armazenados no seu banco de dados. Isso é útil para retrieval-augmented generation (RAG) quando você quer dar aos agents acesso para buscar nos dados da sua aplicação.

A maneira mais simples de criar uma tool de busca por similaridade é usando o método `usingModel` com um modelo Eloquent que possui embeddings vetoriais:

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

O primeiro argumento é a classe do modelo Eloquent, e o segundo argumento é a coluna que contém os embeddings vetoriais.

Você também pode fornecer um limiar mínimo de similaridade entre `0.0` e `1.0` e uma closure para personalizar a query:

```php
SimilaritySearch::usingModel(
    model: Document::class,
    column: 'embedding',
    minSimilarity: 0.7,
    limit: 10,
    query: fn ($query) => $query->where('published', true),
),
```

Para mais controle, você pode criar uma tool de busca por similaridade com uma closure personalizada que retorna os resultados da busca:

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

Você pode personalizar a descrição da tool usando o método `withDescription`:

```php
SimilaritySearch::usingModel(Document::class, 'embedding')
    ->withDescription('Search the knowledge base for relevant articles.'),
```

<a id="deferred-tool-loading"></a>
### Carregamento Adiado de Tools

Por padrão, cada tool que um agent expõe é enviada ao provedor a cada requisição. Quando um agent fornece um grande número de tools, isso consome tokens e pode reduzir a precisão da seleção de tool do modelo. Usando a tool de provedor `ToolSearch` com OpenAI, Azure ou Anthropic, você pode adiar as definições de tools de forma que o provedor só as carregue quando forem necessárias:

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

As tools encapsuladas não requerem nenhuma modificação. O provedor buscará e as carregará quando forem relevantes para o prompt, após o que o agent pode chamá-las como qualquer outra tool.

Ao usar Anthropic, o argumento `strategy` pode ser usado para determinar como o provedor deve buscar por tools adiadas. As estratégias suportadas são `regex` (padrão) e `bm25`:

```php
new ToolSearch(tools: [new SearchInvoices], strategy: 'bm25'),
```

Ao usar Anthropic, opções adicionais específicas do provedor podem ser passadas à tool de busca usando o método `withProviderOptions`:

```php
(new ToolSearch(tools: [new SearchInvoices]))
    ->withProviderOptions(['cache_control' => ['type' => 'ephemeral']]),
```

> **Aviso:**
> Provedores que não suportam busca de tools lançarão uma exceção em vez de descartar silenciosamente as tools adiadas. Além disso, Anthropic exige que pelo menos uma tool seja fornecida fora do encapsulamento `ToolSearch`.

<a id="file-storage-tools"></a>
### Tools de Armazenamento de Arquivos

A factory de tools `FileStorage` permite que você dê aos agents acesso a um [disk de filesystem](/en/filesystem/) do Laravel. O método `all` retorna tools que permitem ao agent listar, ler, inspecionar, gerar URLs, gravar, excluir, copiar e mover arquivos no disk fornecido:

```php
use Laravel\Ai\Tools\FileStorage;

public function tools(): iterable
{
    return FileStorage::all('local');
}
```

Se o seu agent deve ser capaz apenas de inspecionar arquivos, use o método `readOnly`:

```php
return FileStorage::readOnly('local');
```

Esses métodos retornam uma `Illuminate\Support\Collection`, permitindo que você filtre ainda mais as tools fornecidas ao agent:

```php
use Laravel\Ai\Tools\Filesystem\DeleteFile;

return FileStorage::all('s3')
    ->reject(fn ($tool) => $tool instanceof DeleteFile);
```

<a id="mcp-tools"></a>
### MCP Tools

Se a sua aplicação usa [Laravel MCP](/en/mcp/), você pode dar aos seus agents tools expostas por servidores [Model Context Protocol](https://modelcontextprotocol.io). Usando o [cliente Laravel MCP](/en/mcp/#client), você pode conectar-se a um servidor MCP remoto ou local e passar suas tools diretamente ao seu agent.

> **Nota:**
> MCP tools requerem que o pacote [Laravel MCP](/en/mcp/) esteja instalado na sua aplicação.

Como o método `tools` de um cliente MCP retorna uma collection, faça o spread dela no array `tools` do seu agent usando o operador `...`:

```php
use App\Ai\Tools\RandomNumberGenerator;
use Laravel\Mcp\Client;

/**
 * Get the tools available to the agent.
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

O AI SDK automaticamente encapsula cada MCP tool para que o agent possa chamá-la como qualquer outra tool. Você também pode usar um [cliente MCP nomeado](/en/mcp/#named-clients):

```php
use Laravel\Mcp\Facades\Mcp;

public function tools(): iterable
{
    return [
        ...Mcp::client('github')->tools(),
    ];
}
```

Ou conectar-se a um [servidor MCP local](/en/mcp/#client-connecting):

```php
use Laravel\Mcp\Client;

public function tools(): iterable
{
    return [
        ...Client::local('php', ['artisan', 'mcp:start'])->tools(),
    ];
}
```

Para mais informações sobre criação e autenticação de clientes MCP, incluindo bearer tokens e OAuth, consulte a [documentação do cliente MCP](/en/mcp/#client).

<a id="skills"></a>
### Skills

[Agent Skills](https://agentskills.io) são pastas de instruções e arquivos de suporte que ensinam um agent a realizar uma tarefa específica. Como as skills seguem um padrão aberto, a mesma skill pode ser compartilhada entre os agents da sua aplicação e os coding agents que você usa para construir sua aplicação.

Cada skill é um diretório dentro do diretório `resources/skills` da sua aplicação que contém um arquivo `SKILL.md`. Quaisquer outros arquivos no diretório, como documentos de referência, são empacotados com a skill:

```text
resources/skills/
└── refund-policy/
    ├── SKILL.md
    └── references/EDGE-CASES.md
```

O arquivo `SKILL.md` começa com frontmatter YAML contendo o `name` da skill e uma `description` de quando a skill deve ser usada, seguido pelas instruções da skill:

```markdown
---
name: refund-policy
description: Use when a customer asks for a refund or disputes a charge.
---

# Refund Policy

Customers may request a full refund within 30 days of purchase...
```

Se o `name` for omitido, o nome do diretório da skill será usado. Skills sem uma `description` são ignoradas.

Para dar a um agent acesso às suas skills, implemente a interface `HasSkills` e retorne suas fontes de skill a partir do método `skills`:

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

Fontes podem ser diretórios, instâncias de `Skill` ou closures que retornam skills, que só são invocadas quando o agent precisa delas. Quando duas skills compartilham um nome, a fonte listada primeiro tem precedência.

O agent recebe uma tool `LoadSkill` que lista o nome e a descrição de cada skill, carregando as instruções completas de uma skill e seus arquivos de texto empacotados apenas quando um prompt o exige. Arquivos binários e arquivos maiores que 256 KB não são retornados.

<a id="provider-tools"></a>
### Tools de Provedor

Tools de provedor são tools especiais implementadas nativamente pelos provedores de IA, oferecendo capacidades como busca na web, fetch de URLs e busca de arquivos. Diferentemente de tools regulares, as tools de provedor são executadas pelo próprio provedor em vez da sua aplicação.

Tools de provedor podem ser retornadas pelo método `tools` do seu agent.

<a id="web-search"></a>
#### Busca na Web

A tool de provedor `WebSearch` permite que agents busquem na web por informações em tempo real. Isso é útil para responder perguntas sobre eventos atuais, dados recentes ou tópicos que podem ter mudado desde o corte de treinamento do modelo.

**Provedores suportados:** Anthropic, OpenAI, Azure, Gemini, xAI, Groq, OpenRouter

```php
use Laravel\Ai\Providers\Tools\WebSearch;

public function tools(): iterable
{
    return [
        new WebSearch,
    ];
}
```

Você pode configurar a tool de busca na web para limitar o número de buscas ou restringir resultados a domínios específicos:

```php
(new WebSearch)->max(5)->allow(['laravel.com', 'php.net']),
```

Para refinar os resultados de busca com base na localização do usuário, use o método `location`:

```php
(new WebSearch)->location(
    city: 'New York',
    region: 'NY',
    country: 'US'
);
```

> **Nota:**
> Groq suporta busca na web apenas em seus modelos GPT-OSS e ignora os métodos `max`, `allow` e `location`.

<a id="web-fetch"></a>
#### Web Fetch

A tool de provedor `WebFetch` permite que agents busquem e leiam o conteúdo de páginas web. Isso é útil quando você precisa que o agent analise URLs específicas ou recupere informações detalhadas de páginas web conhecidas.

**Provedores suportados:** Anthropic, Gemini, OpenRouter

```php
use Laravel\Ai\Providers\Tools\WebFetch;

public function tools(): iterable
{
    return [
        new WebFetch,
    ];
}
```

Você pode configurar a tool de web fetch para limitar o número de fetches ou restringir a domínios específicos:

```php
(new WebFetch)->max(3)->allow(['docs.laravel.com']),
```

<a id="file-search"></a>
#### Busca de Arquivos

A tool de provedor `FileSearch` permite que agents busquem através de [arquivos](#files) armazenados em [vector stores](#vector-stores). Isso habilita retrieval-augmented generation (RAG) permitindo que o agent busque informações relevantes nos seus documentos enviados.

**Provedores suportados:** OpenAI, Azure, Gemini, xAI

```php
use Laravel\Ai\Providers\Tools\FileSearch;

public function tools(): iterable
{
    return [
        new FileSearch(stores: ['store_id']),
    ];
}
```

Você pode fornecer múltiplos IDs de vector store para buscar em múltiplos stores:

```php
new FileSearch(stores: ['store_1', 'store_2']);
```

Se os seus arquivos têm [metadados](#adding-files-to-stores), você pode filtrar os resultados da busca fornecendo um argumento `where`. Para filtros simples de igualdade, passe um array:

```php
new FileSearch(stores: ['store_id'], where: [
    'author' => 'Taylor Otwell',
    'year' => 2026,
]);
```

Para filtros mais complexos, você pode passar uma closure que recebe uma instância de `FileSearchQuery`:

```php
use Laravel\Ai\Providers\Tools\FileSearchQuery;

new FileSearch(stores: ['store_id'], where: fn (FileSearchQuery $query) =>
    $query->where('author', 'Taylor Otwell')
        ->whereNot('status', 'draft')
        ->whereIn('category', ['news', 'updates'])
);
```

<a id="code-execution"></a>
#### Execução de Código

A tool de provedor `CodeExecution` permite que agents executem código em um sandbox hospedado pelo provedor de IA. Isso é útil para realizar cálculos e analisar dados.

**Provedores suportados:** Anthropic, OpenAI, Azure, Gemini, xAI, Groq

```php
use Laravel\Ai\Providers\Tools\CodeExecution;

public function tools(): iterable
{
    return [new CodeExecution];
}
```

Ao usar OpenAI ou Azure, você pode disponibilizar [arquivos armazenados](#files) ao sandbox via opções de provedor:

```php
(new CodeExecution)->withProviderOptions([
    'container' => ['type' => 'auto', 'file_ids' => ['file_123']],
]);
```

> **Nota:**
> Groq suporta execução de código apenas em seus modelos GPT-OSS.

<a id="sub-agents"></a>
### Sub-Agents

Agents também podem ser retornados a partir do método `tools` de outro agent. Quando um agent é retornado como uma tool, o agent pai pode delegar uma tarefa específica ao sub-agent e usar a resposta do sub-agent ao responder ao prompt original. Isso é útil quando um agent de propósito geral precisa de acesso a agents especializados com suas próprias instruções, tools, configuração de modelo ou preferências de provedor.

Por exemplo, um agent de suporte ao cliente poderia delegar perguntas de elegibilidade de reembolso a um agent de reembolsos dedicado:

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
     * Get the instructions that the agent should follow.
     */
    public function instructions(): string
    {
        return 'You help customers with account, order, and billing questions. Delegate refund policy questions to the refunds specialist.';
    }

    /**
     * Get the tools available to the agent.
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

Para personalizar como o sub-agent é exposto ao agent pai, implemente a interface `CanActAsTool` no sub-agent e defina um nome e uma descrição voltados para tool:

```php
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Contracts\CanActAsTool;
use Laravel\Ai\Enums\Lab;

#[Provider(Lab::Anthropic)]
class RefundsAgent implements Agent, CanActAsTool, HasTools
{
    /**
     * Get the agent's tool name.
     */
    public function name(): string
    {
        return 'refunds_specialist';
    }

    /**
     * Get the agent's tool description.
     */
    public function description(): string
    {
        return 'Determine whether an order is eligible for a refund and explain the next step.';
    }

    // ...
}
```

Se um sub-agent não implementa `CanActAsTool`, o Laravel usará o basename da classe do agent como o nome da tool e uma descrição genérica que pede ao agent pai que passe uma descrição de tarefa clara e autocontida. Cada invocação de sub-agent é executada isoladamente e não recebe o histórico de conversa do agent pai.

Quando o agent pai está fazendo [streaming](#streaming), seus sub-agents também fazem streaming. O agent pai emite eventos `ToolResult` contendo o texto que o sub-agent produziu até o momento. Esses eventos são marcados como preliminares e são seguidos pelo resultado final da chamada de tool, de forma que você pode ignorá-los ao iterar eventos manualmente:

```php
use Laravel\Ai\Streaming\Events\ToolResult;

foreach ($stream as $event) {
    if ($event instanceof ToolResult && $event->preliminary) {
        continue;
    }

    // ...
}
```

Valores de resposta como `text`, `usage` e `toolResults` ignoram eventos preliminares. O [protocolo Vercel](#stream-protocols) os renderiza como saída nativa de tool de streaming, de forma que o `useChat` exibe o progresso sem nenhum código personalizado, enquanto o protocolo AG-UI os reporta como snapshots de atividade. O texto, raciocínio, citações e uso da resposta concluída incluem os do sub-agent.

<a id="middleware"></a>
### Middleware

Agents suportam middleware, permitindo que você intercepte e modifique cada step de geração antes que ele seja enviado ao provedor. O middleware é invocado uma vez por step, portanto uma execução que leva três steps o invocará três vezes. Middleware pode ser criado usando o comando Artisan `make:agent-middleware`:

```shell
php artisan make:agent-middleware LogPrompts
```

O middleware gerado será colocado no diretório `app/Ai/Middleware` da sua aplicação. Para adicionar middleware a um agent, implemente a interface `HasMiddleware` e defina um método `middleware` que retorna um array de classes de middleware:

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
     * Get the agent's middleware.
     */
    public function middleware(): array
    {
        return [
            new LogPrompts,
        ];
    }
}
```

Cada classe de middleware deve definir um método `handle` que recebe um `PendingStep` e uma `Closure` que passa o step para o próximo middleware:

```php
<?php

namespace App\Ai\Middleware;

use Closure;
use Illuminate\Support\Facades\Log;
use Laravel\Ai\PendingStep;

class LogPrompts
{
    /**
     * Handle the pending generation step.
     */
    public function handle(PendingStep $step, Closure $next)
    {
        Log::info('Prompting agent', ['model' => $step->model]);

        return $next($step);
    }
}
```

Além de `provider`, `model`, `instructions`, `messages` e `tools` que estão prestes a ser enviados, o step expõe os steps que já foram concluídos, seu uso combinado e o progresso da execução:

```php
$step->steps;
$step->usage;

$step->number;
$step->isFirstStep();
$step->isFinalStep;
```

Os métodos `withModel`, `withInstructions`, `withMessages`, `withTools`, `onlyTools`, `withoutTools`, `withToolChoice`, `withMaxTokens` e `withProviderOptions` cada um retorna uma cópia do step. Por exemplo, você pode remover uma tool cara assim que o agent a tiver usado:

```php
public function handle(PendingStep $step, Closure $next)
{
    if (! $step->isFirstStep()) {
        $step = $step->withoutTools('SearchDocumentation');
    }

    return $next($step);
}
```

Ou, você pode manter um longo loop de chamadas de tool dentro da janela de contexto resumindo o meio da conversa:

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

Mensagens passadas ao método `withMessages` só alteram o que é enviado para o step atual. Steps posteriores e a conversa armazenada continuam a usar o histórico completo e não resumido.

Você pode usar o método `then` para executar código assim que o modelo tiver respondido ao step, antes que suas chamadas de tool sejam executadas. Isso funciona tanto para respostas síncronas quanto de streaming:

```php
use Laravel\Ai\Gateway\StepResponse;

public function handle(PendingStep $step, Closure $next)
{
    return $next($step)->then(function (StepResponse $response) {
        Log::info('Agent responded', ['text' => $response->text]);
    });
}
```

O middleware deve retornar o resultado de `$next` ou sua própria `StepResponse` para responder ao step sem invocar o modelo, como ao servir uma resposta em cache. Retornar qualquer outro valor lançará uma `LogicException`.

<a id="anonymous-agents"></a>
### Agents Anônimos

Às vezes você pode querer interagir rapidamente com um modelo sem criar uma classe de agent dedicada. Você pode criar um agent anônimo e ad-hoc usando a função `agent`:

```php
use function Laravel\Ai\{agent};

$response = agent(
    instructions: 'You are an expert at software development.',
    messages: [],
    tools: [],
)->prompt('Tell me about Laravel');
```

Agents anônimos também podem produzir saída estruturada:

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
### Configuração de Agent

Você pode configurar opções de geração de texto para um agent usando atributos PHP. Os seguintes atributos estão disponíveis:

- `MaxSteps`: O número máximo de steps que o agent pode executar ao usar tools.
- `MaxTokens`: O número máximo de tokens que o modelo pode gerar.
- `Model`: O modelo que o agent deve usar.
- `Provider`: O provedor de IA (ou provedores para failover) a usar para o agent.
- `Temperature`: A temperatura de sampling a usar para a geração (0.0 a 1.0).
- `Timeout`: O timeout HTTP em segundos para requisições do agent (padrão: 60).
- `TopP`: A probabilidade de nucleus sampling a usar para a geração (0.0 a 1.0).
- `UseCheapestModel`: Usa o modelo de texto mais barato do provedor para otimização de custo.
- `UseSmartestModel`: Usa o modelo de texto mais capaz do provedor para tarefas complexas.

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

Os atributos `UseCheapestModel` e `UseSmartestModel` permitem que você selecione automaticamente o modelo mais econômico ou mais capaz para um dado provedor sem especificar um nome de modelo. Isso é útil quando você quer otimizar por custo ou capacidade entre diferentes provedores:

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
> O modelo subjacente selecionado por `UseCheapestModel` e `UseSmartestModel` pode mudar entre releases do Laravel AI SDK conforme os provedores lançam novos modelos. Trocar de modelos pode introduzir mudanças de comportamento, parâmetros depreciados e diferenças significativas de custo. Se você precisa de um modelo e preços estáveis e previsíveis, especifique o modelo explicitamente usando o atributo `Model`.

<a id="provider-options"></a>
### Opções de Provedor

Se o seu agent precisa passar opções específicas do provedor (como o esforço de raciocínio da OpenAI ou configurações de penalidade), implemente o contrato `HasProviderOptions` e defina um método `providerOptions`:

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
     * Get provider-specific generation options.
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

O método `providerOptions` recebe o provedor atualmente em uso (enum `Lab` ou string), permitindo que você retorne opções diferentes por provedor. Isso é especialmente útil ao usar [failover](#failover), já que cada provedor de fallback pode receber sua própria configuração.

O exemplo de Anthropic acima também habilita [cache de prompt](#prompt-caching) via `cache_control`.

Os builders de [imagem](#images), [áudio](#audio), [transcrição](#transcription), [embedding](#embeddings) e [reranking](#reranking) também aceitam opções de provedor:

```php
use Laravel\Ai\Audio;

$audio = Audio::of('I love coding with Laravel.')
    ->withProviderOptions(['speed' => 1.25])
    ->generate();
```

Você também pode passar uma closure em vez de um array, que receberá o provedor atualmente em uso.

<a id="custom-http-headers"></a>
#### Cabeçalhos HTTP Personalizados

Cabeçalhos configurados para um provedor no arquivo de configuração `config/ai.php` da sua aplicação são enviados com cada requisição que aquele provedor faz. Para enviar cabeçalhos por requisição, como metadados usados por um gateway de IA, você pode usar o método `withHeaders`, que está disponível nos builders de imagem, áudio, transcrição, embedding e reranking, bem como em [uploads de arquivos](#files):

```php
use Laravel\Ai\Embeddings;

$embeddings = Embeddings::for($chunks)
    ->withHeaders(['cf-aig-metadata' => json_encode(['team' => $team->id])])
    ->withProviderOptions(['dimensions' => 1024])
    ->generate();
```

Cabeçalhos também podem ser fornecidos como uma closure, que recebe o provedor atualmente em uso. Cabeçalhos não são incluídos no corpo da requisição e não afetam as [chaves de cache de embedding](#caching-embeddings).

<a id="prompt-caching"></a>
### Cache de Prompt

A maioria dos provedores armazena em cache prefixos de prompt repetidos automaticamente e cobra a porção em cache com desconto. OpenAI, Gemini, Groq, DeepSeek e xAI não requerem configuração, e você pode inspecionar a economia por meio do uso da resposta:

```php
$response->usage->cacheReadInputTokens;
$response->usage->cacheWriteInputTokens;
```

Ambas essas contagens são subconjuntos do total de input tokens, o que é discutido mais adiante na [documentação de uso](#usage).

Os provedores `anthropic` e `bedrock` só armazenam em cache quando solicitado. Os atributos `CacheInstructions` e `CacheToolDefinitions` colocam um breakpoint de cache no final das instruções e das definições de tool do seu agent, de forma que cada conversa lê aquele prefixo do cache em vez de reescrevê-lo:

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

Se as suas instruções mudam a cada requisição, como quando incorporam a data atual, use `CacheToolDefinitions` sozinho. Armazenar em cache um prefixo que muda a cada requisição cria uma nova entrada de cache a cada vez, portanto você paga para gravá-lo no cache sem jamais reutilizá-lo.

Provedores que não suportam esses atributos os ignoram, de forma que um agent pode declará-los com segurança enquanto usa [failover](#failover).

Prefixos em cache são retidos por cinco minutos por padrão. A Anthropic pode retê-los por uma hora se você passar um TTL ao atributo:

```php
#[CacheInstructions('1h')]
#[CacheToolDefinitions('1h')]
```

Alternativamente, o cache automático da Anthropic pode ser habilitado por meio de uma [opção de provedor](#provider-options) `cache_control` de nível superior. Isso coloca um único breakpoint após o último bloco da requisição, de forma que o breakpoint avança conforme a conversa cresce e cada turno lê os turnos anteriores do cache. Ambos os mecanismos podem ser combinados.

> **Aviso:**
> Como os provedores constroem prompts na ordem tools, instruções e mensagens, armazenar instruções em cache por uma hora também requer armazenar as definições de tool em cache por uma hora. Misturar os dois lança uma `InvalidArgumentException`.

<a id="human-tool-approval"></a>
## Aprovação Humana de Tool

> **Aviso:**
> A aprovação de tool requer que o histórico do turno pausado esteja disponível quando a execução é retomada. Você deve usar um agent `Conversational`, como um que usa a trait `RemembersConversations`, ou fornecer o histórico a partir do frontend da sua aplicação usando o [método `withMessages`](#conversation-context). Agents que não fazem nenhum dos dois lançarão uma `ApprovalNotResumableException` quando uma tool pausa.

Tools que realizam ações sensíveis ou irreversíveis podem exigir aprovação humana antes de serem executadas. Para tornar uma tool aprovável, implemente o contrato `Approvable` e use a trait `InteractsWithApprovals`. Tools aprováveis requerem aprovação por padrão:

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
     * Get the description of the tool's purpose.
     */
    public function description(): Stringable|string
    {
        return 'Delete a file from storage.';
    }

    /**
     * Execute the tool.
     */
    public function handle(Request $request): Stringable|string
    {
        Storage::delete($request['path']);

        return "Deleted [{$request['path']}].";
    }

    /**
     * Get the tool's schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'path' => $schema->string()->required(),
        ];
    }
}
```

Para determinar se a aprovação é necessária com base nos argumentos da chamada de tool, defina um método `needsApproval` na tool. Este método pode retornar um booleano ou uma instância de `Approval` que inclui um motivo para a solicitação de aprovação:

```php
use Laravel\Ai\Approvals\Approval;

/**
 * Determine whether the tool needs approval for the given request.
 */
protected function needsApproval(Request $request): Approval|bool
{
    return str_starts_with($request['path'], 'temporary/')
        ? false
        : Approval::required('This will permanently delete a file.');
}
```

Você pode sobrescrever a exigência de aprovação de uma tool ao retorná-la a partir do método `tools` de um agent:

```php
public function tools(): iterable
{
    return [
        (new SendNotification)->withoutApproval(),
        (new DeleteFile)->requireApproval('Deletion review required.'),
    ];
}
```

Quando uma tool aprovável é chamada, o agent pausa antes de executá-la. Você pode inspecionar as aprovações pendentes da resposta, que contêm o ID, o nome da tool, os argumentos e o motivo de aprovação de cada chamada de tool:

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

Para retomar o agent, continue a conversa e forneça uma instância de `Decisions` contendo uma decisão para cada chamada de tool pendente. Decisões podem aprovar a chamada, rejeitá-la ou editar seus argumentos antes da execução:

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
> Turnos pausados são correspondidos por sua conversa e chamadas de tool pendentes, não pelo participante que os pausou. Portanto, sua aplicação deve autorizar o acesso à conversa antes de retomá-la, como demonstrado no [fluxo completo de aprovação](#complete-approval-flow), ou verificar o acesso usando o método `conversationBelongsTo` do store de conversa.

Os valores booleanos `true` e `false` podem ser usados como atalho para aprovação e rejeição. Toda chamada de tool pendente deve receber uma decisão. IDs de chamada de tool desconhecidos, ausentes ou previamente resolvidos causarão o lançamento de uma `ApprovalMismatchException`. Você pode fornecer um padrão para chamadas sem uma decisão explícita usando os métodos `approveRemaining` ou `rejectRemaining`:

```php
$decisions = Decisions::from([
    'call_abc' => true,
])->rejectRemaining('Not approved.');

$response = (new FileAssistant)
    ->continue($conversationId, as: $user)
    ->prompt($decisions);
```

Uma rejeição com um resultado, como `Decision::reject('Not approved.')`, é retornada ao modelo para que ele possa continuar respondendo. Uma rejeição sem um resultado interrompe o loop de geração após registrar a rejeição.

A aprovação de tool é suportada pelos métodos `prompt`, `stream`, `queue`, `broadcast`, `broadcastNow` e `broadcastOnQueue`.

Durante o streaming e o broadcasting, uma pausa é representada por um evento `tool_approval_request`. Ao usar o [protocolo de stream do Vercel AI SDK](#stream-protocols), as solicitações e resultados de aprovação são emitidos usando as partes nativas de aprovação de tool do protocolo, e o protocolo Agent User Interaction as reporta como interrupções.

Clientes que usam qualquer um dos protocolos postam suas decisões junto com o restante da conversa, de forma que uma [requisição de chat](#frontend-integration) pode ser passada diretamente ao agent:

```php
$chat = Vercel::chat($request);

return (new FileAssistant)
    ->continue($conversationId, as: $request->user())
    ->stream($chat)
    ->usingProtocol($chat->protocol());
```

Quando um turno pausado é retomado, os steps retomados são mesclados naquele turno, de forma que cada turno é armazenado como uma única mensagem de assistant. O `assistantMessageId` da resposta contém o ID da mensagem pausada, e o uso daquela mensagem inclui tanto a pausa quanto a retomada.

Para agents enfileirados, a resposta resultante é passada ao callback `then`, e o Laravel também despacha um evento `ToolApprovalRequested`.

O Laravel armazena o resultado de uma tool aprovada antes de pedir ao modelo que continue. Se a geração então falhar, a aprovação já foi resolvida. Continue a conversa com um prompt de texto normal em vez de submeter as mesmas decisões de aprovação novamente.

<a id="complete-approval-flow"></a>
### Fluxo Completo de Aprovação

A rota a seguir demonstra um fluxo completo de aprovação, aceitando tanto um novo prompt de texto quanto decisões de aprovação da tela de chat. Este exemplo assume que o modelo `User` da aplicação usa a trait `HasConversations`:

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

Quando o status da resposta é `awaiting_approval`, a tela de chat deve renderizar as aprovações pendentes e submeter as escolhas do usuário ao mesmo endpoint usando o ID da chamada de tool como a chave de cada decisão. Caso contrário, a tela pode submeter um valor `message` simples:

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
## Imagens

A classe `Laravel\Ai\Image` pode ser usada para gerar imagens usando os provedores `openai`, `gemini` ou `xai`:

```php
use Laravel\Ai\Image;

$image = Image::of('A donut sitting on the kitchen counter')->generate();

$rawContent = (string) $image;
```

Os métodos `square`, `portrait` e `landscape` podem ser usados para controlar a proporção da imagem, enquanto o método `quality` pode ser usado para orientar o modelo sobre a qualidade final da imagem (`high`, `medium`, `low`). O método `timeout` pode ser usado para especificar o timeout HTTP em segundos:

```php
use Laravel\Ai\Image;

$image = Image::of('A donut sitting on the kitchen counter')
    ->quality('high')
    ->landscape()
    ->timeout(120)
    ->generate();
```

Você pode anexar imagens de referência usando o método `attachments`:

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

Alguns provedores podem gerar múltiplas imagens em uma única requisição. OpenAI, Azure e xAI aceitam uma [opção de provedor](#provider-options) `n`, e a resposta conterá todas as imagens que foram retornadas:

```php
$response = Image::of('A donut sitting on the kitchen counter')
    ->withProviderOptions(['n' => 4])
    ->generate();

count($response);           // 4
$response->images;          // A collection of generated images...
$response->firstImage();    // The first generated image...
```

Imagens geradas podem ser facilmente armazenadas no disk padrão configurado no arquivo de configuração `config/filesystems.php` da sua aplicação:

```php
$image = Image::of('A donut sitting on the kitchen counter');

$path = $image->store();
$path = $image->storeAs('image.jpg');
$path = $image->storePublicly();
$path = $image->storePubliclyAs('image.jpg');
```

A geração de imagens também pode ser enfileirada:

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
## Áudio

A classe `Laravel\Ai\Audio` pode ser usada para gerar áudio a partir do texto fornecido:

```php
use Laravel\Ai\Audio;

$audio = Audio::of('I love coding with Laravel.')->generate();

$rawContent = (string) $audio;
```

Você também pode gerar áudio a partir de uma string usando o método `toAudio` disponível por meio da classe `Stringable` do Laravel:

```php
use Illuminate\Support\Str;

$audio = Str::of('I love coding with Laravel.')->toAudio();
```

Os métodos `male`, `female` e `voice` podem ser usados para determinar a voz do áudio gerado:

```php
$audio = Audio::of('I love coding with Laravel.')
    ->female()
    ->generate();

$audio = Audio::of('I love coding with Laravel.')
    ->voice('voice-id-or-name')
    ->generate();
```

Da mesma forma, o método `instructions` pode ser usado para orientar dinamicamente o modelo sobre como o áudio gerado deve soar:

```php
$audio = Audio::of('I love coding with Laravel.')
    ->female()
    ->instructions('Said like a pirate')
    ->generate();
```

Áudio gerado pode ser facilmente armazenado no disk padrão configurado no arquivo de configuração `config/filesystems.php` da sua aplicação:

```php
$audio = Audio::of('I love coding with Laravel.')->generate();

$path = $audio->store();
$path = $audio->storeAs('audio.mp3');
$path = $audio->storePublicly();
$path = $audio->storePubliclyAs('audio.mp3');
```

A geração de áudio também pode ser enfileirada:

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
## Transcrições

A classe `Laravel\Ai\Transcription` pode ser usada para gerar uma transcrição do áudio fornecido:

```php
use Laravel\Ai\Transcription;

$transcript = Transcription::fromPath('/home/laravel/audio.mp3')->generate();
$transcript = Transcription::fromStorage('audio.mp3')->generate();
$transcript = Transcription::fromUpload($request->file('audio'))->generate();

return (string) $transcript;
```

O método `diarize` pode ser usado para indicar que você gostaria que a resposta incluísse a transcrição diarizada além da transcrição de texto bruto, permitindo que você acesse a transcrição segmentada por falante:

```php
$transcript = Transcription::fromStorage('audio.mp3')
    ->diarize()
    ->generate();
```

A geração de transcrição também pode ser enfileirada:

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
## Resumo de Texto

Você pode resumir texto usando o método `summarize` disponível por meio da classe `Stringable` do Laravel. Por padrão, o resumo conterá no máximo três frases e será gerado usando o modelo de texto mais barato do provedor configurado:

```php
use Illuminate\Support\Str;

$summary = Str::of($article)->summarize();
```

Você pode especificar o número máximo de frases, o provedor, o modelo e o timeout usados para gerar o resumo. A classe `Str` também oferece uma versão estática do método:

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

Você pode gerar facilmente embeddings vetoriais para qualquer string fornecida usando o novo método `toEmbeddings` disponível por meio da classe `Stringable` do Laravel:

```php
use Illuminate\Support\Str;

$embeddings = Str::of('Napa Valley has great wine.')->toEmbeddings();
```

Alternativamente, você pode usar a classe `Embeddings` para gerar embeddings para múltiplos inputs de uma vez:

```php
use Laravel\Ai\Embeddings;

$response = Embeddings::for([
    'Napa Valley has great wine.',
    'Laravel is a PHP framework.',
])->generate();

$response->embeddings; // [[0.123, 0.456, ...], [0.789, 0.012, ...]]
```

Você pode especificar as dimensões e o provedor para os embeddings:

```php
$response = Embeddings::for(['Napa Valley has great wine.'])
    ->dimensions(1536)
    ->generate(Lab::OpenAI, 'text-embedding-3-small');
```

<a id="multimodal-embeddings"></a>
### Embeddings Multimodais

Além de strings, o método `Embeddings::for` aceita inputs de imagem, áudio, documento e vídeo, permitindo que você gere embeddings para conteúdo que não seja texto. Gemini suporta embeddings de imagem, áudio, documento e vídeo, enquanto VoyageAI suporta embeddings de imagem e vídeo:

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

Inputs multimodais usam as mesmas [classes de arquivo usadas para anexos](#attachments). Esses arquivos podem ser criados a partir de um path local, um disk de filesystem, uma URL remota ou conteúdo codificado em Base64. Imagens, documentos e vídeos também podem ser criados a partir de arquivos enviados, enquanto documentos podem ser criados a partir de conteúdo de string bruto:

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
> VoyageAI não permite que mídia por URL remota e mídia codificada em Base64 sejam misturadas em uma única requisição. Arquivos locais, armazenados e enviados são enviados como conteúdo codificado em Base64, e inputs de texto podem ser combinados com qualquer uma das fontes de mídia. Consulte a documentação do seu provedor para determinar quais modelos e inputs multimodais estão disponíveis.

<a id="querying-embeddings"></a>
### Consultando Embeddings

Uma vez que você gerou embeddings, você tipicamente os armazenará em uma coluna `vector` no seu banco de dados para consulta posterior. O Laravel fornece suporte nativo para colunas de vetor no PostgreSQL via extensão `pgvector` e no MariaDB. Para começar, defina uma coluna `vector` na sua migration, especificando o número de dimensões:

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

Você também pode adicionar um índice de vetor para acelerar as buscas por similaridade. Ao chamar `index` em uma coluna de vetor, o Laravel automaticamente criará um índice HNSW com distância de cosseno:

```php
$table->vector('embedding', dimensions: 1536)->index();
```

No seu modelo Eloquent, você deve fazer o cast da coluna de vetor usando o cast `AsVector`:

```php
use Illuminate\Database\Eloquent\Casts\AsVector;

protected function casts(): array
{
    return [
        'embedding' => AsVector::class,
    ];
}
```

Para consultar registros similares, use o método `whereVectorSimilarTo`. Este método filtra os resultados por uma similaridade de cosseno mínima (entre `0.0` e `1.0`, onde `1.0` é idêntico) e ordena os resultados por similaridade:

```php
use App\Models\Document;

$documents = Document::query()
    ->whereVectorSimilarTo('embedding', $queryEmbedding, minSimilarity: 0.4)
    ->limit(10)
    ->get();
```

O `$queryEmbedding` pode ser um array de floats ou uma string simples. Quando uma string é fornecida, o Laravel automaticamente gerará embeddings para ela:

```php
$documents = Document::query()
    ->whereVectorSimilarTo('embedding', 'best wineries in Napa Valley')
    ->limit(10)
    ->get();
```

Se você precisa de mais controle, você pode usar os métodos de nível mais baixo `whereVectorDistanceLessThan`, `selectVectorDistance` e `orderByVectorDistance` de forma independente:

```php
$documents = Document::query()
    ->select('*')
    ->selectVectorDistance('embedding', $queryEmbedding, as: 'distance')
    ->whereVectorDistanceLessThan('embedding', $queryEmbedding, maxDistance: 0.3)
    ->orderByVectorDistance('embedding', $queryEmbedding)
    ->limit(10)
    ->get();
```

Se você quiser dar a um agent a capacidade de realizar buscas por similaridade como uma tool, confira a documentação da tool [Busca por Similaridade](#similarity-search).

> **Nota:**
> Consultas de vetor são atualmente suportadas em conexões PostgreSQL usando a extensão `pgvector`, ou no MariaDB 11.7 ou posterior usando seu suporte nativo a vetores.

<a id="caching-embeddings"></a>
### Cache de Embeddings

A geração de embeddings pode ser armazenada em cache para evitar chamadas de API redundantes para inputs idênticos. Para habilitar o cache, defina a opção de configuração `ai.caching.embeddings.cache` como `true`:

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

Quando o cache está habilitado, embeddings são armazenados em cache por 30 dias. A chave de cache é baseada no provedor, modelo, dimensões e conteúdo de input, garantindo que requisições idênticas retornem resultados em cache enquanto configurações diferentes geram embeddings novos.

Por padrão, o embedding de cada input é armazenado em cache sob sua própria chave, de forma que uma requisição posterior pode acertar o cache para inputs que ela já viu mesmo quando o conjunto de inputs ou sua ordem mudou. Para em vez disso armazenar todo o conjunto de inputs sob uma única chave, defina a opção de configuração `ai.caching.embeddings.individually` como `false`.

Você também pode habilitar o cache para uma requisição específica usando o método `cache`, mesmo quando o cache global está desabilitado:

```php
$response = Embeddings::for(['Napa Valley has great wine.'])
    ->cache()
    ->generate();
```

Você pode especificar uma duração de cache personalizada em segundos:

```php
$response = Embeddings::for(['Napa Valley has great wine.'])
    ->cache(seconds: 3600) // Cache for 1 hour
    ->generate();
```

O método Stringable `toEmbeddings` também aceita um argumento `cache`:

```php
// Cache with default duration...
$embeddings = Str::of('Napa Valley has great wine.')->toEmbeddings(cache: true);

// Cache for a specific duration...
$embeddings = Str::of('Napa Valley has great wine.')->toEmbeddings(cache: 3600);
```

<a id="reranking"></a>
## Reranking

Reranking permite que você reordene uma lista de documentos com base em sua relevância para uma dada query. Isso é útil para melhorar os resultados de busca usando compreensão semântica:

A classe `Laravel\Ai\Reranking` pode ser usada para fazer rerank de documentos:

```php
use Laravel\Ai\Reranking;

$response = Reranking::of([
    'Django is a Python web framework.',
    'Laravel is a PHP web application framework.',
    'React is a JavaScript library for building user interfaces.',
])->rerank('PHP frameworks');

// Access the top result...
$response->first()->document; // "Laravel is a PHP web application framework."
$response->first()->score;    // 0.95
$response->first()->index;    // 1 (original position)
```

O método `limit` pode ser usado para restringir o número de resultados retornados, enquanto o método `timeout` pode ser usado para especificar o timeout HTTP em segundos, que usa 30 como padrão:

```php
$response = Reranking::of($documents)
    ->limit(5)
    ->timeout(60)
    ->rerank('search query');
```

<a id="reranking-collections"></a>
### Reranking de Coleções

Por conveniência, collections do Laravel podem ter rerank aplicado usando o macro `rerank`. O primeiro argumento especifica qual(is) campo(s) usar para o reranking, e o segundo argumento é a query:

```php
// Rerank by a single field...
$posts = Post::all()
    ->rerank('body', 'Laravel tutorials');

// Rerank by multiple fields (sent as JSON)...
$reranked = $posts->rerank(['title', 'body'], 'Laravel tutorials');

// Rerank using a closure to build the document...
$reranked = $posts->rerank(
    fn ($post) => $post->title.': '.$post->body,
    'Laravel tutorials'
);
```

Você também pode limitar o número de resultados e especificar um provedor:

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
## Classificação

> **Aviso:**
> A classificação é atualmente experimental e sua API pode mudar em releases minor futuros do AI SDK.

A classificação permite que você faça um conjunto fixo de perguntas sobre uma dada string ou array de dados e receba uma resposta tipada, respaldada por uma probabilidade, para cada pergunta em vez de texto de forma livre. Isso é útil para roteamento, moderação e pontuação, onde você precisa comparar uma resposta com um limiar ou fazer asserções sobre ela em seus testes.

A classe `Laravel\Ai\Classification` pode ser usada para classificar conteúdo. Cada pergunta recebe uma chave, e a resposta correspondente pode ser recuperada da resposta usando aquela chave:

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

Perguntas `Boolean` retornam a probabilidade de que a resposta seja "true". O método `isTrue` pode ser usado para determinar se aquela probabilidade atinge um dado limiar, que usa `0.5` como padrão:

```php
$result['urgent']->probability;             // 0.94
$result['urgent']->isTrue(threshold: 0.8);  // true
```

Perguntas `Choice` retornam uma das opções fornecidas junto com a probabilidade de cada opção. A propriedade `confidence` indica quão certo o provedor está em todo o conjunto de probabilidades, e será `null` quando o provedor não conseguir medi-la:

```php
$result['department']->choice;                      // 'technical'
$result['department']->probabilityOf('technical');  // 0.87
$result['department']->probabilities;               // ['billing' => 0.08, 'technical' => 0.87, 'sales' => 0.05]
$result['department']->confidence;                  // 0.82
```

Perguntas `Score` retornam uma posição nos níveis ordenados que foram fornecidos. A propriedade `score` é ponderada por probabilidade e pode cair entre dois níveis, enquanto os métodos `level` e `label` descrevem o nível mais provável:

```php
$result['frustration']->score;          // 1.24, the probability-weighted level
$result['frustration']->level();        // 1, the most probable level
$result['frustration']->label();        // 'Frustrated'
$result['frustration']->normalized();   // 0.62, the score as a fraction of the highest level
$result['frustration']->probabilities;  // [0.12, 0.52, 0.36]
```

Os critérios fornecidos a uma pergunta `Boolean`, as descrições de opções fornecidas a uma pergunta `Choice` e os níveis fornecidos a uma pergunta `Score` podem cada um ser um array quando uma única frase não é suficiente. Perguntas `Choice` requerem pelo menos duas opções, enquanto perguntas `Score` requerem pelo menos dois níveis.

A resposta pode ser iterada, contada e acessada como um array. Além disso, o método `answer` pode ser usado para recuperar uma única resposta, enquanto o método `collect` retorna todas as respostas como uma [collection](/en/collections/):

```php
$result->answer('urgent');
$result->collect();

$result->usage;
$result->meta->provider;
```

<a id="classifying-images"></a>
### Classificando Imagens

Ao usar OpenAI, imagens podem ser classificadas junto com o conteúdo fornecido passando-as como o segundo argumento ao método `of`. Imagens podem ser criadas usando as mesmas [classes de arquivo usadas para anexos](#attachments):

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
### Decisões Sim ou Não

Para uma única decisão sim ou não, você pode usar o método `decide` disponível por meio da classe `Stringable` do Laravel, que retorna um booleano em vez de uma resposta completa. Você pode descrever o que um "sim" e um "não" significam, e especificar a probabilidade que a resposta deve atingir, que usa `0.5` como padrão:

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
### Escolhendo a Partir de Coleções

Para escolher rapidamente um único item de uma lista de opções, você pode usar o método `decide` disponível na classe `Collection` do Laravel. O método aceita uma pergunta e o texto a classificar, e retorna o item escolhido da collection.

Collections de strings e enums podem ser usadas diretamente, enquanto outros itens devem ser nomeados usando o argumento `by`. Você também pode fornecer um campo, array de campos ou closure via o argumento `describe` para dar ao modelo mais detalhes sobre cada opção:

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

A descrição definida via o argumento `describe` serve como o critério que o modelo usa para determinar se o texto corresponde àquela opção, o que é útil quando o nome de uma opção sozinho é ambíguo. Quando uma closure é fornecida ao argumento `describe`, ela recebe cada item e deve retornar uma string ou array descrevendo-o:

```php
$priority = collect(Priority::cases())->decide(
    'How urgent is this request?',
    $ticket->body,
    describe: fn (Priority $priority) => $priority->description(),
);
```

Quando uma collection de strings é indexada por strings, suas chaves são usadas como as opções e seus valores como suas descrições, e a chave escolhida é retornada. Se um `threshold` for fornecido e a probabilidade da opção escolhida estiver abaixo dele, `null` é retornado:

```php
$department = collect([
    'billing' => 'Payments, invoices, and refunds',
    'technical' => 'Bugs, outages, and integrations',
])->decide('Which team should handle this request?', $ticket->body, threshold: 0.6) ?? 'triage';
```

<a id="files"></a>
## Arquivos

A classe `Laravel\Ai\Files` ou as classes de arquivo individuais podem ser usadas para armazenar arquivos com o seu provedor de IA para uso posterior em conversas. Isso é útil para documentos grandes ou arquivos que você quer referenciar múltiplas vezes sem reenviar:

```php
use Laravel\Ai\Files\Document;
use Laravel\Ai\Files\Image;

// Store a file from a local path...
$response = Document::fromPath('/home/laravel/document.pdf')->put();
$response = Image::fromPath('/home/laravel/photo.jpg')->put();

// Store a file that is stored on a filesystem disk...
$response = Document::fromStorage('document.pdf', disk: 'local')->put();
$response = Image::fromStorage('photo.jpg', disk: 'local')->put();

// Store a file that is stored on a remote URL...
$response = Document::fromUrl('https://example.com/document.pdf')->put();
$response = Image::fromUrl('https://example.com/photo.jpg')->put();

return $response->id;
```

Você também pode armazenar conteúdo bruto ou arquivos enviados:

```php
use Laravel\Ai\Files;
use Laravel\Ai\Files\Document;

// Store raw content...
$stored = Document::fromString('Hello, World!', 'text/plain')->put();

// Store an uploaded file...
$stored = Document::fromUpload($request->file('document'))->put();
```

Uma vez que um arquivo foi armazenado, você pode referenciar o arquivo ao gerar texto via agents em vez de reenviar o arquivo:

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

Para recuperar um arquivo previamente armazenado, use o método `get` em uma instância de arquivo:

```php
use Laravel\Ai\Files\Document;

$file = Document::fromId('file-id')->get();

$file->id;
$file->mimeType();
```

Para excluir um arquivo do provedor, use o método `delete`:

```php
Document::fromId('file-id')->delete();
```

Por padrão, a classe `Files` usa o provedor de IA padrão configurado no arquivo de configuração `config/ai.php` da sua aplicação. Para a maioria das operações, você pode especificar um provedor diferente usando o argumento `provider`:

```php
$response = Document::fromPath(
    '/home/laravel/document.pdf'
)->put(provider: Lab::Anthropic);
```

Você pode passar opções de upload específicas do provedor usando o método `withProviderOptions`. Por exemplo, você pode definir o `purpose` de arquivo da OpenAI:

```php
use Laravel\Ai\Files\Document;

$response = Document::fromPath('/home/laravel/knowledge.txt')
    ->withProviderOptions(['purpose' => 'assistants'])
    ->put();
```

Para escopar opções por provedor, passe uma closure que recebe o provedor atual:

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
### Usando Arquivos Armazenados em Conversas

Uma vez que um arquivo foi armazenado com um provedor, você pode referenciá-lo em conversas de agent usando o método `fromId` nas classes `Document` ou `Image`:

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

Da mesma forma, imagens armazenadas podem ser referenciadas usando a classe `Image`:

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
## Vector Stores

Vector stores permitem que você crie coleções pesquisáveis de arquivos que podem ser usadas para retrieval-augmented generation (RAG). A classe `Laravel\Ai\Stores` fornece métodos para criar, recuperar e excluir vector stores:

```php
use Laravel\Ai\Stores;

// Create a new vector store...
$store = Stores::create('Knowledge Base');

// Create a store with additional options...
$store = Stores::create(
    name: 'Knowledge Base',
    description: 'Documentation and reference materials.',
    expiresWhenIdleFor: days(30),
);

return $store->id;
```

Para recuperar um vector store existente por seu ID, use o método `get`:

```php
use Laravel\Ai\Stores;

$store = Stores::get('store_id');

$store->id;
$store->name;
$store->fileCounts;
$store->ready;
```

Para excluir um vector store, use o método `delete` na classe `Stores` ou na instância do store:

```php
use Laravel\Ai\Stores;

// Delete by ID...
Stores::delete('store_id');

// Or delete via a store instance...
$store = Stores::get('store_id');

$store->delete();
```

<a id="adding-files-to-stores"></a>
### Adicionando Arquivos aos Stores

Uma vez que você tem um vector store, você pode adicionar [arquivos](#files) a ele usando o método `add`. Arquivos adicionados a um store são automaticamente indexados para busca semântica usando a [tool de provedor de busca de arquivos](#file-search):

```php
use Laravel\Ai\Files\Document;
use Laravel\Ai\Stores;

$store = Stores::get('store_id');

// Add a file that has already been stored with the provider...
$document = $store->add('file_id');
$document = $store->add(Document::fromId('file_id'));

// Or, store and add a file in one step...
$document = $store->add(Document::fromPath('/path/to/document.pdf'));
$document = $store->add(Document::fromStorage('manual.pdf'));
$document = $store->add($request->file('document'));

$document->id;
$document->fileId;
```

> **Nota:** Tipicamente, ao adicionar arquivos previamente armazenados a vector stores, o ID do documento retornado corresponderá ao ID previamente atribuído do arquivo; no entanto, alguns provedores de vector storage podem retornar um novo "ID de documento" diferente. Portanto, é recomendado que você sempre armazene ambos os IDs no seu banco de dados para referência futura.

Ao adicionar um arquivo a um store Gemini, o Laravel aguarda a conclusão da importação para que o documento seja pesquisável assim que a chamada retornar. Uma `Laravel\Ai\Exceptions\AiException` será lançada se a importação falhar ou exceder cinco minutos, portanto você pode querer adicionar arquivos Gemini a partir de um [job enfileirado](/en/queues/).

Você pode anexar metadados a arquivos ao adicioná-los a um store. Esses metadados podem posteriormente ser usados para filtrar resultados de busca ao usar a [tool de provedor de busca de arquivos](#file-search):

```php
$store->add(Document::fromPath('/path/to/document.pdf'), metadata: [
    'author' => 'Taylor Otwell',
    'department' => 'Engineering',
    'year' => 2026,
]);
```

Para remover um arquivo de um store, use o método `remove`:

```php
$store->remove('file_id');
```

Remover um arquivo de um vector store não o remove do [armazenamento de arquivos](#files) do provedor. Para remover um arquivo do vector store e excluí-lo permanentemente do armazenamento de arquivos, use o argumento `deleteFile`:

```php
$store->remove('file_abc123', deleteFile: true);
```

<a id="usage"></a>
## Uso

Toda resposta contém uma propriedade `usage` contendo as contagens de tokens reportadas pelo provedor. As contagens de input e output são totais, portanto tokens contados como tokens em cache ou de raciocínio também estão incluídos no total ao qual pertencem:

```php
$response = (new SalesCoach)->prompt('Analyze this sales transcript...');

$response->usage->inputTokens;
$response->usage->outputTokens;
$response->usage->totalTokens();
```

A geração de texto retorna uma instância de `Laravel\Ai\Responses\Data\TextUsage`, que detalha esses totais ainda mais. Cada um desses valores será `null`, em vez de `0`, quando o provedor não o reporta:

```php
$response->usage->cacheReadInputTokens; // Subset of the input tokens read from a prompt cache...
$response->usage->cacheWriteInputTokens; // Subset of the input tokens written to a prompt cache...
$response->usage->reasoningTokens; // Subset of the output tokens spent on reasoning...

$response->usage->uncachedInputTokens(); // Input tokens that were neither read from nor written to the cache...
```

Leituras de cache, gravações de cache e input sem cache são cobrados a taxas diferentes, portanto você deve precificar essas três contagens separadamente em vez de usar apenas o total de input.

As demais capacidades retornam um objeto de uso contendo as contagens específicas delas:

<div class="overflow-auto">

| Capacidade | Objeto de uso | Adiciona |
|---|---|---|
| Texto, classificação | `TextUsage` | Tokens de leitura de cache, gravação de cache e raciocínio |
| Imagens | `ImageUsage` | `imageInputTokens` e `imageOutputTokens` |
| Transcrição | `TranscriptionUsage` | `audioSeconds`, a duração do áudio transcrito |
| Reranking | `RerankingUsage` | `searchUnits`, que alguns provedores cobram em vez de tokens |
| Áudio, embeddings | `Usage` | |

</div>

Nem todo provedor reporta todas as contagens, e contagens que um provedor não reporta serão `null`:

```php
use Laravel\Ai\Image;
use Laravel\Ai\Transcription;

Image::of('A donut sitting on the kitchen counter')->generate()->usage->imageOutputTokens;

Transcription::fromPath('/home/laravel/meeting.mp3')->generate()->usage->audioSeconds;
```

<a id="failover"></a>
## Failover

Ao fazer prompt ou gerar outras mídias, você pode fornecer um array de provedores / modelos para fazer failover automaticamente para um provedor / modelo de backup se uma interrupção de serviço ou rate limit for encontrado no provedor primário:

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

O failover só ocorre quando uma `FailoverableException` é lançada — como um rate limit (`RateLimitedException`), um provedor sobrecarregado ou indisponível (`ProviderOverloadedException`) ou créditos insuficientes (`InsufficientCreditsException`). Erros comuns, como um erro de validação ou bad request, não acionarão o failover.

Quando você passa uma lista simples de provedores, como `[Lab::OpenAI, Lab::Anthropic]`, cada provedor usa seu modelo padrão. Para especificar um modelo específico para cada provedor na cadeia de failover, passe um array associativo indexado pelo provedor, usando o `value` da enum `Lab` como chave (casos de enum não podem ser usados diretamente como chaves de array PHP):

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
## Testes

Ao fazer fake da geração enfileirada de imagem, áudio, transcrição ou embeddings, qualquer callback `then` registrado na geração enfileirada será invocado com a resposta falsa, permitindo que você teste a lógica contida dentro do callback. Se você preferir que esses callbacks não sejam invocados, você também pode fazer fake da fila usando `Queue::fake()`.

<a id="testing-agents"></a>
### Agents

Para fazer fake das respostas de um agent durante testes, chame o método `fake` na classe do agent. Você pode opcionalmente fornecer um array de respostas ou uma closure:

```php
use App\Ai\Agents\SalesCoach;
use Laravel\Ai\Prompts\AgentPrompt;

// Automatically generate a fixed response for every prompt...
SalesCoach::fake();

// Provide a list of prompt responses...
SalesCoach::fake([
    'First response',
    'Second response',
]);

// Dynamically handle prompt responses based on the incoming prompt...
SalesCoach::fake(function (AgentPrompt $prompt) {
    return 'Response for: '.$prompt->prompt;
});
```

Ao fazer fake de um agent que retorna saída estruturada, você pode fornecer arrays como respostas. O agent retornará uma resposta estruturada contendo os dados fornecidos:

```php
SalesCoach::fake([
    ['score' => 87],
]);
```

Você também pode fazer fake de uma resposta que está aguardando aprovação de tool:

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

Além disso, você pode fazer fake de uma resposta que inclui raciocínio. O fake emite eventos de raciocínio, portanto o raciocínio é reportado em execuções transmitidas também:

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

> **Nota:** Quando `Agent::fake()` é invocado em um agent que retorna saída estruturada e nenhum output falso foi fornecido explicitamente, o Laravel automaticamente gerará dados falsos que correspondem ao schema de saída definido do seu agent.

Após fazer o prompt do agent, você pode fazer asserções sobre os prompts que foram recebidos:

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

Ao fazer a asserção de uma continuação de aprovação, você pode inspecionar as decisões de aprovação do prompt:

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

Para invocações de agent enfileiradas, use os métodos de asserção de fila:

```php
use Laravel\Ai\QueuedAgentPrompt;

SalesCoach::assertQueued('Analyze this...');

SalesCoach::assertQueued(function (QueuedAgentPrompt $prompt) {
    return $prompt->contains('Analyze');
});

SalesCoach::assertNotQueued('Missing prompt');

SalesCoach::assertNeverQueued();
```

Para garantir que todas as invocações de agent tenham uma resposta falsa correspondente, você pode usar `preventStrayPrompts`. Se um agent for invocado sem uma resposta falsa definida, uma exceção será lançada:

```php
SalesCoach::fake()->preventStrayPrompts();
```

<a id="testing-images"></a>
### Imagens

Gerações de imagem podem ser falsas invocando o método `fake` na classe `Image`. Uma vez que a imagem foi falsificada, várias asserções podem ser realizadas contra os prompts de geração de imagem registrados:

```php
use Laravel\Ai\Image;
use Laravel\Ai\Prompts\ImagePrompt;
use Laravel\Ai\Prompts\QueuedImagePrompt;

// Automatically generate a fixed response for every prompt...
Image::fake();

// Provide a list of prompt responses...
Image::fake([
    base64_encode($firstImage),
    base64_encode($secondImage),
]);

// Dynamically handle prompt responses based on the incoming prompt...
Image::fake(function (ImagePrompt $prompt) {
    return base64_encode('...');
});
```

Após gerar imagens, você pode fazer asserções sobre os prompts que foram recebidos:

```php
Image::assertGenerated(function (ImagePrompt $prompt) {
    return $prompt->contains('sunset') && $prompt->isLandscape();
});

Image::assertNotGenerated('Missing prompt');

Image::assertNothingGenerated();
```

Para gerações de imagem enfileiradas, use os métodos de asserção de fila:

```php
Image::assertQueued(
    fn (QueuedImagePrompt $prompt) => $prompt->contains('sunset')
);

Image::assertNotQueued('Missing prompt');

Image::assertNothingQueued();
```

Para garantir que todas as gerações de imagem tenham uma resposta falsa correspondente, você pode usar `preventStrayImages`. Se uma imagem for gerada sem uma resposta falsa definida, uma exceção será lançada:

```php
Image::fake()->preventStrayImages();
```

<a id="testing-audio"></a>
### Áudio

Gerações de áudio podem ser falsas invocando o método `fake` na classe `Audio`. Uma vez que o áudio foi falsificado, várias asserções podem ser realizadas contra os prompts de geração de áudio registrados:

```php
use Laravel\Ai\Audio;
use Laravel\Ai\Prompts\AudioPrompt;
use Laravel\Ai\Prompts\QueuedAudioPrompt;

// Automatically generate a fixed response for every prompt...
Audio::fake();

// Provide a list of prompt responses...
Audio::fake([
    base64_encode($firstAudio),
    base64_encode($secondAudio),
]);

// Dynamically handle prompt responses based on the incoming prompt...
Audio::fake(function (AudioPrompt $prompt) {
    return base64_encode('...');
});
```

Após gerar áudio, você pode fazer asserções sobre os prompts que foram recebidos:

```php
Audio::assertGenerated(function (AudioPrompt $prompt) {
    return $prompt->contains('Hello') && $prompt->isFemale();
});

Audio::assertNotGenerated('Missing prompt');

Audio::assertNothingGenerated();
```

Para gerações de áudio enfileiradas, use os métodos de asserção de fila:

```php
Audio::assertQueued(
    fn (QueuedAudioPrompt $prompt) => $prompt->contains('Hello')
);

Audio::assertNotQueued('Missing prompt');

Audio::assertNothingQueued();
```

Para garantir que todas as gerações de áudio tenham uma resposta falsa correspondente, você pode usar `preventStrayAudio`. Se áudio for gerado sem uma resposta falsa definida, uma exceção será lançada:

```php
Audio::fake()->preventStrayAudio();
```

<a id="testing-transcriptions"></a>
### Transcrições

Gerações de transcrição podem ser falsas invocando o método `fake` na classe `Transcription`. Uma vez que a transcrição foi falsificada, várias asserções podem ser realizadas contra os prompts de geração de transcrição registrados:

```php
use Laravel\Ai\Transcription;
use Laravel\Ai\Prompts\TranscriptionPrompt;
use Laravel\Ai\Prompts\QueuedTranscriptionPrompt;

// Automatically generate a fixed response for every prompt...
Transcription::fake();

// Provide a list of prompt responses...
Transcription::fake([
    'First transcription text.',
    'Second transcription text.',
]);

// Dynamically handle prompt responses based on the incoming prompt...
Transcription::fake(function (TranscriptionPrompt $prompt) {
    return 'Transcribed text...';
});
```

Após gerar transcrições, você pode fazer asserções sobre os prompts que foram recebidos:

```php
Transcription::assertGenerated(function (TranscriptionPrompt $prompt) {
    return $prompt->language === 'en' && $prompt->isDiarized();
});

Transcription::assertNotGenerated(
    fn (TranscriptionPrompt $prompt) => $prompt->language === 'fr'
);

Transcription::assertNothingGenerated();
```

Para gerações de transcrição enfileiradas, use os métodos de asserção de fila:

```php
Transcription::assertQueued(
    fn (QueuedTranscriptionPrompt $prompt) => $prompt->isDiarized()
);

Transcription::assertNotQueued(
    fn (QueuedTranscriptionPrompt $prompt) => $prompt->language === 'fr'
);

Transcription::assertNothingQueued();
```

Para garantir que todas as gerações de transcrição tenham uma resposta falsa correspondente, você pode usar `preventStrayTranscriptions`. Se uma transcrição for gerada sem uma resposta falsa definida, uma exceção será lançada:

```php
Transcription::fake()->preventStrayTranscriptions();
```

<a id="testing-embeddings"></a>
### Embeddings

Gerações de embeddings podem ser falsas invocando o método `fake` na classe `Embeddings`. Uma vez que embeddings foram falsificados, várias asserções podem ser realizadas contra os prompts de geração de embeddings registrados:

```php
use Laravel\Ai\Embeddings;
use Laravel\Ai\Prompts\EmbeddingsPrompt;
use Laravel\Ai\Prompts\QueuedEmbeddingsPrompt;

// Automatically generate fake embeddings of the proper dimensions for every prompt...
Embeddings::fake();

// Provide a list of prompt responses...
Embeddings::fake([
    [$firstEmbeddingVector],
    [$secondEmbeddingVector],
]);

// Dynamically handle prompt responses based on the incoming prompt...
Embeddings::fake(function (EmbeddingsPrompt $prompt) {
    return array_map(
        fn () => Embeddings::fakeEmbedding($prompt->dimensions),
        $prompt->inputs
    );
});
```

Após gerar embeddings, você pode fazer asserções sobre os prompts que foram recebidos:

```php
Embeddings::assertGenerated(function (EmbeddingsPrompt $prompt) {
    return $prompt->contains('Laravel') && $prompt->dimensions === 1536;
});

Embeddings::assertNotGenerated(
    fn (EmbeddingsPrompt $prompt) => $prompt->contains('Other')
);

Embeddings::assertNothingGenerated();
```

Para gerações de embeddings enfileiradas, use os métodos de asserção de fila:

```php
Embeddings::assertQueued(
    fn (QueuedEmbeddingsPrompt $prompt) => $prompt->contains('Laravel')
);

Embeddings::assertNotQueued(
    fn (QueuedEmbeddingsPrompt $prompt) => $prompt->contains('Other')
);

Embeddings::assertNothingQueued();
```

Para garantir que todas as gerações de embeddings tenham uma resposta falsa correspondente, você pode usar `preventStrayEmbeddings`. Se embeddings forem gerados sem uma resposta falsa definida, uma exceção será lançada:

```php
Embeddings::fake()->preventStrayEmbeddings();
```

<a id="testing-reranking"></a>
### Reranking

Operações de reranking podem ser falsas invocando o método `fake` na classe `Reranking`:

```php
use Laravel\Ai\Reranking;
use Laravel\Ai\Prompts\RerankingPrompt;
use Laravel\Ai\Responses\Data\RankedDocument;

// Automatically generate a fake reranked responses...
Reranking::fake();

// Provide custom responses...
Reranking::fake([
    [
        new RankedDocument(index: 0, document: 'First', score: 0.95),
        new RankedDocument(index: 1, document: 'Second', score: 0.80),
    ],
]);
```

Após o reranking, você pode fazer asserções sobre as operações que foram realizadas:

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
### Classificação

A classificação pode ser falsa invocando o método `fake` na classe `Classification`. Se nenhuma resposta personalizada for fornecida, o Laravel automaticamente gerará respostas que correspondem ao formato de cada pergunta:

```php
use Laravel\Ai\Classification;
use Laravel\Ai\Prompts\ClassificationPrompt;
use Laravel\Ai\Responses\Data\BooleanAnswer;
use Laravel\Ai\Responses\Data\ChoiceAnswer;

// Automatically generate fake answers...
Classification::fake();

// Provide answers for specific questions...
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

// Build answers from the prompt...
Classification::fake(fn (ClassificationPrompt $prompt) => [
    'urgent' => new BooleanAnswer($prompt->contains('ASAP') ? 1.0 : 0.0),
]);
```

Perguntas que são omitidas de uma resposta falsa ainda receberão uma resposta gerada, portanto seus testes só precisam fornecer as respostas contra as quais fazem asserções.

Após classificar, você pode fazer asserções sobre as operações que foram realizadas:

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
### Arquivos

Operações de arquivo podem ser falsas invocando o método `fake` na classe `Files`:

```php
use Laravel\Ai\Files;

Files::fake();
```

Uma vez que operações de arquivo foram falsificadas, você pode fazer asserções sobre os uploads e exclusões que ocorreram:

```php
use Laravel\Ai\Contracts\Files\StorableFile;
use Laravel\Ai\Files\Document;

// Store files...
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

Para fazer asserções contra exclusões de arquivo, você pode passar um ID de arquivo:

```php
Files::assertDeleted('file-id');
Files::assertNotDeleted('file-id');
Files::assertNothingDeleted();
```

<a id="testing-vector-stores"></a>
### Vector Stores

Operações de vector store podem ser falsas invocando o método `fake` na classe `Stores`. Fazer fake de stores também fará fake de [operações de arquivo](#files) automaticamente:

```php
use Laravel\Ai\Stores;

Stores::fake();
```

Uma vez que operações de store foram falsificadas, você pode fazer asserções sobre os stores que foram criados ou excluídos:

```php
use Laravel\Ai\Stores;

// Create store...
$store = Stores::create('Knowledge Base');

// Make assertions...
Stores::assertCreated('Knowledge Base');

Stores::assertCreated(fn (string $name, ?string $description) =>
    $name === 'Knowledge Base'
);

Stores::assertNotCreated('Other Store');

Stores::assertNothingCreated();
```

Para fazer asserções contra exclusões de store, você pode fornecer o ID do store:

```php
Stores::assertDeleted('store_id');
Stores::assertNotDeleted('other_store_id');
Stores::assertNothingDeleted();
```

Para fazer a asserção de que arquivos foram adicionados ou removidos de um store, use os métodos de asserção em uma dada instância de `Store`:

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

Se um arquivo é armazenado no [armazenamento de arquivos](#files) do provedor e adicionado a um vector store na mesma requisição, você pode não saber o ID do provedor do arquivo. Nesse caso, você pode passar uma closure ao método `assertAdded` para fazer a asserção contra o conteúdo do arquivo adicionado:

```php
use Laravel\Ai\Contracts\Files\StorableFile;
use Laravel\Ai\Files\Document;

$store->add(Document::fromString('Hello, World!', 'text/plain')->as('hello.txt'));

$store->assertAdded(fn (StorableFile $file) => $file->name() === 'hello.txt');
$store->assertAdded(fn (StorableFile $file) => $file->content() === 'Hello, World!');
```

<a id="events"></a>
## Eventos

O Laravel AI SDK despacha uma variedade de [eventos](/en/events/), incluindo:

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

Você pode escutar qualquer um desses eventos para registrar ou armazenar informações de uso do AI SDK.
