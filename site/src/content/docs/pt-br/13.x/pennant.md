---
title: "Laravel Pennant"
---

- [Introdução](#introduction)
- [Instalação](#installation)
- [Configuração](#configuration)
- [Definindo Features](#defining-features)
    - [Features Baseadas em Classe](#class-based-features)
- [Verificando Features](#checking-features)
    - [Execução Condicional](#conditional-execution)
    - [O Trait `HasFeatures`](#the-has-features-trait)
    - [Diretiva Blade](#blade-directive)
    - [Middleware](#middleware)
    - [Interceptando Verificações de Feature](#intercepting-feature-checks)
    - [Cache em Memória](#in-memory-cache)
- [Scope](#scope)
    - [Especificando o Scope](#specifying-the-scope)
    - [Scope Global](#global-scope)
    - [Scope Padrão](#default-scope)
    - [Scope Nullable](#nullable-scope)
    - [Identificando o Scope](#identifying-scope)
    - [Serializando o Scope](#serializing-scope)
- [Valores de Feature Ricos](#rich-feature-values)
- [Recuperando Múltiplas Features](#retrieving-multiple-features)
- [Eager Loading](#eager-loading)
- [Atualizando Valores](#updating-values)
    - [Atualizações em Massa](#bulk-updates)
    - [Purgando Features](#purging-features)
- [Testes](#testing)
- [Adicionando Drivers Pennant Customizados](#adding-custom-pennant-drivers)
    - [Implementando o Driver](#implementing-the-driver)
    - [Registrando o Driver](#registering-the-driver)
    - [Definindo Features Externamente](#defining-features-externally)
- [Events](#events)

<a id="introduction"></a>
## Introdução

O [Laravel Pennant](https://github.com/laravel/pennant) é um pacote de feature flag simples e leve - sem excessos. Feature flags permitem que você lance novas funcionalidades da aplicação de forma incremental e com confiança, teste A/B novos designs de interface, complemente uma estratégia de desenvolvimento baseada em trunk e muito mais.

<a id="installation"></a>
## Instalação

Primeiro, instale o Pennant no seu projeto usando o gerenciador de pacotes Composer:

```shell
composer require laravel/pennant
```

Em seguida, você deve publicar os arquivos de configuração e migration do Pennant usando o comando Artisan `vendor:publish`:

```shell
php artisan vendor:publish --provider="Laravel\Pennant\PennantServiceProvider"
```

Por fim, você deve executar as migrations de banco de dados da sua aplicação. Isso criará uma tabela `features` que o Pennant usa para alimentar seu driver `database`:

```shell
php artisan migrate
```

<a id="configuration"></a>
## Configuração

Após publicar os assets do Pennant, seu arquivo de configuração estará localizado em `config/pennant.php`. Este arquivo de configuração permite que você especifique o mecanismo de armazenamento padrão que será usado pelo Pennant para armazenar valores de feature flag resolvidos.

O Pennant inclui suporte para armazenar valores de feature flag resolvidos em um array em memória via o driver `array`. Ou, o Pennant pode armazenar valores de feature flag resolvidos de forma persistente em um banco de dados relacional via o driver `database`, que é o mecanismo de armazenamento padrão usado pelo Pennant.

<a id="defining-features"></a>
## Definindo Features

Para definir uma feature, você pode usar o método `define` oferecido pela facade `Feature`. Você precisará fornecer um nome para a feature, bem como uma closure que será invocada para resolver o valor inicial da feature.

Normalmente, as features são definidas em um service provider usando a facade `Feature`. A closure receberá o "scope" para a verificação da feature. Mais comumente, o scope é o usuário atualmente autenticado. Neste exemplo, definiremos uma feature para lançar incrementalmente uma nova API aos usuários da nossa aplicação:

```php
<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Support\Lottery;
use Illuminate\Support\ServiceProvider;
use Laravel\Pennant\Feature;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Feature::define('new-api', fn (User $user) => match (true) {
            $user->isInternalTeamMember() => true,
            $user->isHighTrafficCustomer() => false,
            default => Lottery::odds(1 / 100),
        });
    }
}
```

Como você pode ver, temos as seguintes regras para nossa feature:

- Todos os membros da equipe interna devem estar usando a nova API.
- Quaisquer clientes de alto tráfego não devem estar usando a nova API.
- Caso contrário, a feature deve ser atribuída aleatoriamente aos usuários com uma chance de 1 em 100 de estar ativa.

Na primeira vez que a feature `new-api` é verificada para um determinado usuário, o resultado da closure será armazenado pelo driver de armazenamento. Na próxima vez que a feature for verificada contra o mesmo usuário, o valor será recuperado do armazenamento e a closure não será invocada.

Por conveniência, se uma definição de feature retorna apenas uma lottery, você pode omitir a closure completamente:

    Feature::define('site-redesign', Lottery::odds(1, 1000));

<a id="class-based-features"></a>
### Features Baseadas em Classe

O Pennant também permite que você defina features baseadas em classe. Ao contrário das definições de feature baseadas em closure, não há necessidade de registrar uma feature baseada em classe em um service provider. Para criar uma feature baseada em classe, você pode invocar o comando Artisan `pennant:feature`. Por padrão, a classe de feature será colocada no diretório `app/Features` da sua aplicação:

```shell
php artisan pennant:feature NewApi
```

Ao escrever uma classe de feature, você só precisa definir um método `resolve`, que será invocado para resolver o valor inicial da feature para um determinado scope. Novamente, o scope será normalmente o usuário atualmente autenticado:

```php
<?php

namespace App\Features;

use App\Models\User;
use Illuminate\Support\Lottery;

class NewApi
{
    /**
     * Resolve the feature's initial value.
     */
    public function resolve(User $user): mixed
    {
        return match (true) {
            $user->isInternalTeamMember() => true,
            $user->isHighTrafficCustomer() => false,
            default => Lottery::odds(1 / 100),
        };
    }
}
```

Se você quiser resolver manualmente uma instância de uma feature baseada em classe, você pode invocar o método `instance` na facade `Feature`:

```php
use App\Features\NewApi;
use Laravel\Pennant\Feature;

$instance = Feature::instance(NewApi::class);
```

> **Note:**
> As classes de feature são resolvidas via o [container](/pt-br/container/), então você pode injetar dependências no construtor da classe de feature quando necessário.

#### Customizando o Nome Armazenado da Feature

Por padrão, o Pennant armazenará o nome totalmente qualificado da classe de feature. Se você quiser desacoplar o nome armazenado da feature da estrutura interna da aplicação, você pode adicionar o atributo `Name` na classe de feature. O valor deste atributo será armazenado no lugar do nome da classe:

```php
<?php

namespace App\Features;

use Laravel\Pennant\Attributes\Name;

#[Name('new-api')]
class NewApi
{
    // ...
}
```

<a id="checking-features"></a>
## Verificando Features

Para determinar se uma feature está ativa, você pode usar o método `active` na facade `Feature`. Por padrão, as features são verificadas contra o usuário atualmente autenticado:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Laravel\Pennant\Feature;

class PodcastController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        return Feature::active('new-api')
            ? $this->resolveNewApiResponse($request)
            : $this->resolveLegacyApiResponse($request);
    }

    // ...
}
```

Embora as features sejam verificadas contra o usuário atualmente autenticado por padrão, você pode facilmente verificar a feature contra outro usuário ou [scope](#scope). Para fazer isso, use o método `for` oferecido pela facade `Feature`:

```php
return Feature::for($user)->active('new-api')
    ? $this->resolveNewApiResponse($request)
    : $this->resolveLegacyApiResponse($request);
```

O Pennant também oferece alguns métodos de conveniência adicionais que podem ser úteis ao determinar se uma feature está ativa ou não:

```php
// Determine if all of the given features are active...
Feature::allAreActive(['new-api', 'site-redesign']);

// Determine if any of the given features are active...
Feature::someAreActive(['new-api', 'site-redesign']);

// Determine if a feature is inactive...
Feature::inactive('new-api');

// Determine if all of the given features are inactive...
Feature::allAreInactive(['new-api', 'site-redesign']);

// Determine if any of the given features are inactive...
Feature::someAreInactive(['new-api', 'site-redesign']);
```

> **Note:**
> Ao usar o Pennant fora de um contexto HTTP, como em um comando Artisan ou um job enfileirado, você deve normalmente [especificar explicitamente o scope da feature](#specifying-the-scope). Alternativamente, você pode definir um [scope padrão](#default-scope) que leve em conta tanto contextos HTTP autenticados quanto contextos não autenticados.

<a id="checking-class-based-features"></a>
#### Verificando Features Baseadas em Classe

Para features baseadas em classe, você deve fornecer o nome da classe ao verificar a feature:

```php
<?php

namespace App\Http\Controllers;

use App\Features\NewApi;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Laravel\Pennant\Feature;

class PodcastController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        return Feature::active(NewApi::class)
            ? $this->resolveNewApiResponse($request)
            : $this->resolveLegacyApiResponse($request);
    }

    // ...
}
```

<a id="conditional-execution"></a>
### Execução Condicional

O método `when` pode ser usado para executar de forma fluente uma determinada closure se uma feature estiver ativa. Adicionalmente, uma segunda closure pode ser fornecida e será executada se a feature estiver inativa:

```php
<?php

namespace App\Http\Controllers;

use App\Features\NewApi;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Laravel\Pennant\Feature;

class PodcastController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        return Feature::when(NewApi::class,
            fn () => $this->resolveNewApiResponse($request),
            fn () => $this->resolveLegacyApiResponse($request),
        );
    }

    // ...
}
```

O método `unless` serve como o inverso do método `when`, executando a primeira closure se a feature estiver inativa:

```php
return Feature::unless(NewApi::class,
    fn () => $this->resolveLegacyApiResponse($request),
    fn () => $this->resolveNewApiResponse($request),
);
```

<a id="the-has-features-trait"></a>
### O Trait `HasFeatures`

O trait `HasFeatures` do Pennant pode ser adicionado ao model `User` da sua aplicação (ou qualquer outro model que tenha features) para fornecer uma maneira fluente e conveniente de verificar features diretamente a partir do model:

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Pennant\Concerns\HasFeatures;

class User extends Authenticatable
{
    use HasFeatures;

    // ...
}
```

Uma vez que o trait tenha sido adicionado ao seu model, você pode facilmente verificar features invocando o método `features`:

```php
if ($user->features()->active('new-api')) {
    // ...
}
```

É claro que o método `features` fornece acesso a muitos outros métodos convenientes para interagir com features:

```php
// Values...
$value = $user->features()->value('purchase-button');
$values = $user->features()->values(['new-api', 'purchase-button']);

// State...
$user->features()->active('new-api');
$user->features()->allAreActive(['new-api', 'server-api']);
$user->features()->someAreActive(['new-api', 'server-api']);

$user->features()->inactive('new-api');
$user->features()->allAreInactive(['new-api', 'server-api']);
$user->features()->someAreInactive(['new-api', 'server-api']);

// Conditional execution...
$user->features()->when('new-api',
    fn () => /* ... */,
    fn () => /* ... */,
);

$user->features()->unless('new-api',
    fn () => /* ... */,
    fn () => /* ... */,
);
```

<a id="blade-directive"></a>
### Diretiva Blade

Para tornar a verificação de features no Blade uma experiência fluida, o Pennant oferece as diretivas `@feature` e `@featureany`:

```blade
@feature('site-redesign')
    <!-- 'site-redesign' is active -->
@else
    <!-- 'site-redesign' is inactive -->
@endfeature

@featureany(['site-redesign', 'beta'])
    <!-- 'site-redesign' or `beta` is active -->
@endfeatureany
```

<a id="middleware"></a>
### Middleware

O Pennant também inclui um [middleware](/pt-br/middleware/) que pode ser usado para verificar se o usuário atualmente autenticado tem acesso a uma feature antes mesmo de uma rota ser invocada. Você pode atribuir o middleware a uma rota e especificar as features necessárias para acessar a rota. Se qualquer uma das features especificadas estiver inativa para o usuário atualmente autenticado, uma resposta HTTP `400 Bad Request` será retornada pela rota. Múltiplas features podem ser passadas para o método estático `using`.

```php
use Illuminate\Support\Facades\Route;
use Laravel\Pennant\Middleware\EnsureFeaturesAreActive;

Route::get('/api/servers', function () {
    // ...
})->middleware(EnsureFeaturesAreActive::using('new-api', 'servers-api'));
```

<a id="customizing-the-response"></a>
#### Customizando a Resposta

Se você quiser customizar a resposta que é retornada pelo middleware quando uma das features listadas está inativa, você pode usar o método `whenInactive` fornecido pelo middleware `EnsureFeaturesAreActive`. Normalmente, este método deve ser invocado dentro do método `boot` de um dos service providers da sua aplicação:

```php
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Laravel\Pennant\Middleware\EnsureFeaturesAreActive;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    EnsureFeaturesAreActive::whenInactive(
        function (Request $request, array $features) {
            return new Response(status: 403);
        }
    );

    // ...
}
```

<a id="intercepting-feature-checks"></a>
### Interceptando Verificações de Feature

Às vezes pode ser útil realizar algumas verificações em memória antes de recuperar o valor armazenado de uma determinada feature. Imagine que você está desenvolvendo uma nova API por trás de uma feature flag e deseja a capacidade de desativar a nova API sem perder nenhum dos valores de feature resolvidos no armazenamento. Se você notar um bug na nova API, você poderia facilmente desativá-la para todos, exceto os membros da equipe interna, corrigir o bug e, em seguida, reativar a nova API para os usuários que anteriormente tinham acesso à feature.

Você pode conseguir isso com o método `before` de uma [feature baseada em classe](#class-based-features). Quando presente, o método `before` é sempre executado em memória antes de recuperar o valor do armazenamento. Se um valor não-`null` for retornado do método, ele será usado no lugar do valor armazenado da feature durante a duração da requisição:

```php
<?php

namespace App\Features;

use App\Models\User;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Lottery;

class NewApi
{
    /**
     * Run an always-in-memory check before the stored value is retrieved.
     */
    public function before(User $user): mixed
    {
        if (Config::get('features.new-api.disabled')) {
            return $user->isInternalTeamMember();
        }
    }

    /**
     * Resolve the feature's initial value.
     */
    public function resolve(User $user): mixed
    {
        return match (true) {
            $user->isInternalTeamMember() => true,
            $user->isHighTrafficCustomer() => false,
            default => Lottery::odds(1 / 100),
        };
    }
}
```

Você também poderia usar essa feature para agendar o lançamento global de uma feature que anteriormente estava por trás de uma feature flag:

```php
<?php

namespace App\Features;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;

class NewApi
{
    /**
     * Run an always-in-memory check before the stored value is retrieved.
     */
    public function before(User $user): mixed
    {
        if (Config::get('features.new-api.disabled')) {
            return $user->isInternalTeamMember();
        }

        if (Carbon::parse(Config::get('features.new-api.rollout-date'))->isPast()) {
            return true;
        }
    }

    // ...
}
```

<a id="in-memory-cache"></a>
### Cache em Memória

Ao verificar uma feature, o Pennant criará um cache em memória do resultado. Se você estiver usando o driver `database`, isso significa que verificar novamente a mesma feature flag dentro de uma única requisição não disparará consultas adicionais ao banco de dados. Isso também garante que a feature tenha um resultado consistente durante a duração da requisição.

Se você precisar fazer o flush manual do cache em memória, você pode usar o método `flushCache` oferecido pela facade `Feature`:

```php
Feature::flushCache();
```

<a id="scope"></a>
## Scope

<a id="specifying-the-scope"></a>
### Especificando o Scope

Como discutido, as features são normalmente verificadas contra o usuário atualmente autenticado. No entanto, isso pode nem sempre atender às suas necessidades. Portanto, é possível especificar o scope contra o qual você gostaria de verificar uma determinada feature via o método `for` da facade `Feature`:

```php
return Feature::for($user)->active('new-api')
    ? $this->resolveNewApiResponse($request)
    : $this->resolveLegacyApiResponse($request);
```

É claro que os scopes de feature não estão limitados a "usuários". Imagine que você construiu uma nova experiência de faturamento que está lançando para equipes inteiras em vez de usuários individuais. Talvez você queira que as equipes mais antigas tenham um lançamento mais lento do que as equipes mais novas. Sua closure de resolução de feature pode se parecer com o seguinte:

```php
use App\Models\Team;
use Illuminate\Support\Carbon;
use Illuminate\Support\Lottery;
use Laravel\Pennant\Feature;

Feature::define('billing-v2', function (Team $team) {
    if ($team->created_at->isAfter(new Carbon('1st Jan, 2023'))) {
        return true;
    }

    if ($team->created_at->isAfter(new Carbon('1st Jan, 2019'))) {
        return Lottery::odds(1 / 100);
    }

    return Lottery::odds(1 / 1000);
});
```

Você notará que a closure que definimos não está esperando um `User`, mas está esperando um model `Team`. Para determinar se esta feature está ativa para a equipe de um usuário, você deve passar a equipe para o método `for` oferecido pela facade `Feature`:

```php
if (Feature::for($user->team)->active('billing-v2')) {
    return redirect('/billing/v2');
}

// ...
```

<a id="global-scope"></a>
### Scope Global

Para verificar ou interagir com uma feature usando um scope global, independentemente do resolver de scope padrão configurado, use o método `globally`. Isso é útil para feature flags em toda a aplicação, como habilitar temporariamente o comportamento de manutenção ou lançar uma feature para todos os usuários:

```php
Feature::globally()->active('new-api');

Feature::globally()->activate('new-api');
```

<a id="default-scope"></a>
### Scope Padrão

Também é possível customizar o scope padrão que o Pennant usa para verificar features. Por exemplo, talvez todas as suas features sejam verificadas contra a equipe do usuário atualmente autenticado em vez do usuário. Em vez de ter que chamar `Feature::for($user->team)` toda vez que você verifica uma feature, você pode especificar a equipe como o scope padrão. Normalmente, isso deve ser feito em um dos service providers da sua aplicação:

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;
use Laravel\Pennant\Feature;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Feature::resolveScopeUsing(fn ($driver) => Auth::user()?->team);

        // ...
    }
}
```

Se nenhum scope for explicitamente fornecido via o método `for`, a verificação da feature agora usará a equipe do usuário atualmente autenticado como scope padrão:

```php
Feature::active('billing-v2');

// Is now equivalent to...

Feature::for($user->team)->active('billing-v2');
```

<a id="nullable-scope"></a>
### Scope Nullable

Se o scope que você fornece ao verificar uma feature for `null` e a definição da feature não suportar `null` via um tipo nullable ou incluindo `null` em um tipo union, o Pennant automaticamente retornará `false` como o valor de resultado da feature.

Portanto, se o scope que você está passando para uma feature for potencialmente `null` e você quiser que o resolver de valor da feature seja invocado, você deve levar isso em conta na definição da sua feature. Um scope `null` pode ocorrer se você verificar uma feature dentro de um comando Artisan, job enfileirado ou rota não autenticada. Como geralmente não há um usuário autenticado nesses contextos, o scope padrão será `null`.

Se você nem sempre [especifica explicitamente o scope da sua feature](#specifying-the-scope), então você deve garantir que o tipo do scope seja "nullable" e tratar o valor de scope `null` dentro da lógica de definição da sua feature:

```php
use App\Models\User;
use Illuminate\Support\Lottery;
use Laravel\Pennant\Feature;

Feature::define('new-api', fn (User $user) => match (true) {// [tl! remove]
Feature::define('new-api', fn (User|null $user) => match (true) {// [tl! add]
    $user === null => true,// [tl! add]
    $user->isInternalTeamMember() => true,
    $user->isHighTrafficCustomer() => false,
    default => Lottery::odds(1 / 100),
});
```

<a id="identifying-scope"></a>
### Identificando o Scope

Os drivers de armazenamento `array` e `database` integrados do Pennant sabem como armazenar corretamente identificadores de scope para todos os tipos de dados PHP, bem como models Eloquent. No entanto, se a sua aplicação utilizar um driver Pennant de terceiros, esse driver pode não saber como armazenar corretamente um identificador para um model Eloquent ou outros tipos customizados na sua aplicação.

Diante disso, o Pennant permite que você formate valores de scope para armazenamento implementando o contrato `FeatureScopeable` nos objetos da sua aplicação que são usados como scopes do Pennant.

Por exemplo, imagine que você está usando dois drivers de feature diferentes em uma única aplicação: o driver `database` integrado e um driver "Flag Rocket" de terceiros. O driver "Flag Rocket" não sabe como armazenar corretamente um model Eloquent. Em vez disso, ele requer uma instância de `FlagRocketUser`. Ao implementar o método `toFeatureIdentifier` definido pelo contrato `FeatureScopeable`, podemos customizar o valor de scope armazenável fornecido a cada driver usado pela nossa aplicação:

```php
<?php

namespace App\Models;

use FlagRocket\FlagRocketUser;
use Illuminate\Database\Eloquent\Model;
use Laravel\Pennant\Contracts\FeatureScopeable;

class User extends Model implements FeatureScopeable
{
    /**
     * Cast the object to a feature scope identifier for the given driver.
     */
    public function toFeatureIdentifier(string $driver): mixed
    {
        return match($driver) {
            'database' => $this,
            'flag-rocket' => FlagRocketUser::fromId($this->flag_rocket_id),
        };
    }
}
```

<a id="serializing-scope"></a>
### Serializando o Scope

Por padrão, o Pennant usará um nome totalmente qualificado de classe ao armazenar uma feature associada a um model Eloquent. Se você já estiver usando um [morph map do Eloquent](/pt-br/eloquent-relationships/#custom-polymorphic-types), você pode optar por fazer com que o Pennant também use o morph map para desacoplar a feature armazenada da estrutura da sua aplicação.

Para fazer isso, após definir seu morph map do Eloquent em um service provider, você pode invocar o método `useMorphMap` da facade `Feature`:

```php
use Illuminate\Database\Eloquent\Relations\Relation;
use Laravel\Pennant\Feature;

Relation::enforceMorphMap([
    'post' => 'App\Models\Post',
    'video' => 'App\Models\Video',
]);

Feature::useMorphMap();
```

<a id="rich-feature-values"></a>
## Valores de Feature Ricos

Até agora, mostramos principalmente as features como estando em um estado binário, significando que elas estão "ativas" ou "inativas", mas o Pennant também permite que você armazene valores ricos.

Por exemplo, imagine que você está testando três novas cores para o botão "Comprar agora" da sua aplicação. Em vez de retornar `true` ou `false` da definição da feature, você pode em vez disso retornar uma string:

```php
use Illuminate\Support\Arr;
use Laravel\Pennant\Feature;

Feature::define('purchase-button', fn (User $user) => Arr::random([
    'blue-sapphire',
    'seafoam-green',
    'tart-orange',
]));
```

Você pode recuperar o valor da feature `purchase-button` usando o método `value`:

```php
$color = Feature::value('purchase-button');
```

A diretiva Blade incluída no Pennant também facilita a renderização condicional de conteúdo com base no valor atual da feature:

```blade
@feature('purchase-button', 'blue-sapphire')
    <!-- 'blue-sapphire' is active -->
@elsefeature('purchase-button', 'seafoam-green')
    <!-- 'seafoam-green' is active -->
@elsefeature('purchase-button', 'tart-orange')
    <!-- 'tart-orange' is active -->
@endfeature
```

> **Note:**
> Ao usar valores ricos, é importante saber que uma feature é considerada "ativa" quando tem qualquer valor diferente de `false`.

Ao chamar o método [condicional `when`](#conditional-execution), o valor rico da feature será fornecido à primeira closure:

```php
Feature::when('purchase-button',
    fn ($color) => /* ... */,
    fn () => /* ... */,
);
```

Da mesma forma, ao chamar o método condicional `unless`, o valor rico da feature será fornecido à segunda closure opcional:

```php
Feature::unless('purchase-button',
    fn () => /* ... */,
    fn ($color) => /* ... */,
);
```

<a id="retrieving-multiple-features"></a>
## Recuperando Múltiplas Features

O método `values` permite a recuperação de múltiplas features para um determinado scope:

```php
Feature::values(['billing-v2', 'purchase-button']);

// [
//     'billing-v2' => false,
//     'purchase-button' => 'blue-sapphire',
// ]
```

Ou, você pode usar o método `all` para recuperar os valores de todas as features definidas para um determinado scope:

```php
Feature::all();

// [
//     'billing-v2' => false,
//     'purchase-button' => 'blue-sapphire',
//     'site-redesign' => true,
// ]
```

No entanto, as features baseadas em classe são registradas dinamicamente e não são conhecidas pelo Pennant até que sejam explicitamente verificadas. Isso significa que as features baseadas em classe da sua aplicação podem não aparecer nos resultados retornados pelo método `all` se elas ainda não tiverem sido verificadas durante a requisição atual.

Se você quiser garantir que as classes de feature sejam sempre incluídas ao usar o método `all`, você pode usar as capacidades de descoberta de features do Pennant. Para começar, invoque o método `discover` em um dos service providers da sua aplicação:

```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Pennant\Feature;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Feature::discover();

        // ...
    }
}
```

O método `discover` registrará todas as classes de feature no diretório `app/Features` da sua aplicação. O método `all` agora incluirá essas classes em seus resultados, independentemente de terem sido verificadas durante a requisição atual:

```php
Feature::all();

// [
//     'App\Features\NewApi' => true,
//     'billing-v2' => false,
//     'purchase-button' => 'blue-sapphire',
//     'site-redesign' => true,
// ]
```

<a id="eager-loading"></a>
## Eager Loading

Embora o Pennant mantenha um cache em memória de todas as features resolvidas para uma única requisição, ainda é possível encontrar problemas de desempenho. Para aliviar isso, o Pennant oferece a capacidade de fazer eager load de valores de feature.

Para ilustrar isso, imagine que estamos verificando se uma feature está ativa dentro de um loop:

```php
use Laravel\Pennant\Feature;

foreach ($users as $user) {
    if (Feature::for($user)->active('notifications-beta')) {
        $user->notify(new RegistrationSuccess);
    }
}
```

Assumindo que estamos usando o driver de banco de dados, este código executará uma consulta ao banco de dados para cada usuário no loop - executando potencialmente centenas de consultas. No entanto, usando o método `load` do Pennant, podemos remover esse potencial gargalo de desempenho fazendo eager load dos valores de feature para uma coleção de usuários ou scopes:

```php
Feature::for($users)->load(['notifications-beta']);

foreach ($users as $user) {
    if (Feature::for($user)->active('notifications-beta')) {
        $user->notify(new RegistrationSuccess);
    }
}
```

Para carregar valores de feature apenas quando eles ainda não tiverem sido carregados, você pode usar o método `loadMissing`:

```php
Feature::for($users)->loadMissing([
    'new-api',
    'purchase-button',
    'notifications-beta',
]);
```

Você pode carregar todas as features definidas usando o método `loadAll`:

```php
Feature::for($users)->loadAll();
```

<a id="updating-values"></a>
## Atualizando Valores

Quando o valor de uma feature é resolvido pela primeira vez, o driver subjacente armazenará o resultado no armazenamento. Isso é frequentemente necessário para garantir uma experiência consistente para seus usuários entre requisições. No entanto, às vezes, você pode querer atualizar manualmente o valor armazenado da feature.

Para fazer isso, você pode usar os métodos `activate` e `deactivate` para alternar uma feature "ligada" ou "desligada":

```php
use Laravel\Pennant\Feature;

// Activate the feature for the default scope...
Feature::activate('new-api');

// Deactivate the feature for the given scope...
Feature::for($user->team)->deactivate('billing-v2');
```

Também é possível definir manualmente um valor rico para uma feature fornecendo um segundo argumento para o método `activate`:

```php
Feature::activate('purchase-button', 'seafoam-green');
```

Para instruir o Pennant a esquecer o valor armazenado de uma feature, você pode usar o método `forget`. Quando a feature for verificada novamente, o Pennant resolverá o valor da feature a partir da sua definição de feature:

```php
Feature::forget('purchase-button');
```

<a id="bulk-updates"></a>
### Atualizações em Massa

Para atualizar os valores de feature armazenados em massa, você pode usar os métodos `activateForEveryone` e `deactivateForEveryone`.

Por exemplo, imagine que você agora está confiante na estabilidade da feature `new-api` e escolheu a melhor cor de `'purchase-button'` para o seu fluxo de checkout - você pode atualizar o valor armazenado para todos os usuários de acordo:

```php
use Laravel\Pennant\Feature;

Feature::activateForEveryone('new-api');

Feature::activateForEveryone('purchase-button', 'seafoam-green');
```

Alternativamente, você pode desativar a feature para todos os usuários:

```php
Feature::deactivateForEveryone('new-api');
```

> **Note:**
> Isso só atualizará os valores de feature resolvidos que foram armazenados pelo driver de armazenamento do Pennant. Você também precisará atualizar a definição da feature na sua aplicação.

<a id="purging-features"></a>
### Purgando Features

Às vezes, pode ser útil purgar uma feature inteira do armazenamento. Isso é tipicamente necessário se você removeu a feature da sua aplicação ou fez ajustes na definição da feature que você gostaria de lançar para todos os usuários.

Você pode remover todos os valores armazenados de uma feature usando o método `purge`:

```php
// Purging a single feature...
Feature::purge('new-api');

// Purging multiple features...
Feature::purge(['new-api', 'purchase-button']);
```

Se você quiser purgar _todas_ as features do armazenamento, você pode invocar o método `purge` sem nenhum argumento:

```php
Feature::purge();
```

Como pode ser útil purgar features como parte do pipeline de deploy da sua aplicação, o Pennant inclui um comando Artisan `pennant:purge` que purgará as features fornecidas do armazenamento:

```shell
php artisan pennant:purge new-api

php artisan pennant:purge new-api purchase-button
```

Também é possível purgar todas as features _exceto_ aquelas em uma determinada lista de features. Por exemplo, imagine que você queira purgar todas as features, mas manter os valores das features "new-api" e "purchase-button" no armazenamento. Para fazer isso, você pode passar esses nomes de feature para a opção `--except`:

```shell
php artisan pennant:purge --except=new-api --except=purchase-button
```

Por conveniência, o comando `pennant:purge` também suporta uma flag `--except-registered`. Esta flag indica que todas as features, exceto aquelas explicitamente registradas em um service provider, devem ser purgadas:

```shell
php artisan pennant:purge --except-registered
```

<a id="testing"></a>
## Testes

Ao testar código que interage com feature flags, a maneira mais fácil de controlar o valor retornado da feature flag nos seus testes é simplesmente redefinir a feature. Por exemplo, imagine que você tem a seguinte feature definida em um dos service providers da sua aplicação:

```php
use Illuminate\Support\Arr;
use Laravel\Pennant\Feature;

Feature::define('purchase-button', fn () => Arr::random([
    'blue-sapphire',
    'seafoam-green',
    'tart-orange',
]));
```

Para modificar o valor retornado da feature nos seus testes, você pode redefinir a feature no início do teste. O teste a seguir sempre passará, mesmo que a implementação `Arr::random()` ainda esteja presente no service provider:

```php tab=Pest
use Laravel\Pennant\Feature;

test('it can control feature values', function () {
    Feature::define('purchase-button', 'seafoam-green');

    expect(Feature::value('purchase-button'))->toBe('seafoam-green');
});
```

```php tab=PHPUnit
use Laravel\Pennant\Feature;

public function test_it_can_control_feature_values()
{
    Feature::define('purchase-button', 'seafoam-green');

    $this->assertSame('seafoam-green', Feature::value('purchase-button'));
}
```

A mesma abordagem pode ser usada para features baseadas em classe:

```php tab=Pest
use Laravel\Pennant\Feature;

test('it can control feature values', function () {
    Feature::define(NewApi::class, true);

    expect(Feature::value(NewApi::class))->toBeTrue();
});
```

```php tab=PHPUnit
use App\Features\NewApi;
use Laravel\Pennant\Feature;

public function test_it_can_control_feature_values()
{
    Feature::define(NewApi::class, true);

    $this->assertTrue(Feature::value(NewApi::class));
}
```

Se a sua feature estiver retornando uma instância de `Lottery`, há um punhado de [helpers de teste úteis disponíveis](/pt-br/helpers/#testing-lotteries).

<a id="store-configuration"></a>
#### Configuração de Store

Você pode configurar o store que o Pennant usará durante os testes definindo a variável de ambiente `PENNANT_STORE` no arquivo `phpunit.xml` da sua aplicação:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit colors="true">
    <!-- ... -->
    <php>
        <env name="PENNANT_STORE" value="array"/>
        <!-- ... -->
    </php>
</phpunit>
```

<a id="adding-custom-pennant-drivers"></a>
## Adicionando Drivers Pennant Customizados

<a id="implementing-the-driver"></a>
#### Implementando o Driver

Se nenhum dos drivers de armazenamento existentes do Pennant atender às necessidades da sua aplicação, você pode escrever seu próprio driver de armazenamento. Seu driver customizado deve implementar a interface `Laravel\Pennant\Contracts\Driver`:

```php
<?php

namespace App\Extensions;

use Laravel\Pennant\Contracts\Driver;

class RedisFeatureDriver implements Driver
{
    public function define(string $feature, callable $resolver): void {}
    public function defined(): array {}
    public function getAll(array $features): array {}
    public function get(string $feature, mixed $scope): mixed {}
    public function set(string $feature, mixed $scope, mixed $value): void {}
    public function setForAllScopes(string $feature, mixed $value): void {}
    public function delete(string $feature, mixed $scope): void {}
    public function purge(array|null $features): void {}
}
```

Agora, só precisamos implementar cada um desses métodos usando uma conexão Redis. Para um exemplo de como implementar cada um desses métodos, dê uma olhada no `Laravel\Pennant\Drivers\DatabaseDriver` no [código-fonte do Pennant](https://github.com/laravel/pennant/blob/1.x/src/Drivers/DatabaseDriver.php)

> **Note:**
> O Laravel não vem com um diretório para conter suas extensões. Você é livre para colocá-las em qualquer lugar que desejar. Neste exemplo, criamos um diretório `Extensions` para abrigar o `RedisFeatureDriver`.

<a id="registering-the-driver"></a>
#### Registrando o Driver

Uma vez que seu driver tenha sido implementado, você está pronto para registrá-lo no Laravel. Para adicionar drivers adicionais ao Pennant, você pode usar o método `extend` fornecido pela facade `Feature`. Você deve chamar o método `extend` a partir do método `boot` de um dos [service providers](/pt-br/providers/) da sua aplicação:

```php
<?php

namespace App\Providers;

use App\Extensions\RedisFeatureDriver;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\ServiceProvider;
use Laravel\Pennant\Feature;

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
        Feature::extend('redis', function (Application $app) {
            return new RedisFeatureDriver($app->make('redis'), $app->make('events'), []);
        });
    }
}
```

Uma vez que o driver tenha sido registrado, você pode usar o driver `redis` no arquivo de configuração `config/pennant.php` da sua aplicação:

```php
'stores' => [

    'redis' => [
        'driver' => 'redis',
        'connection' => null,
    ],

    // ...

],
```

<a id="defining-features-externally"></a>
### Definindo Features Externamente

Se o seu driver for um wrapper em torno de uma plataforma de feature flag de terceiros, você provavelmente definirá features na plataforma em vez de usar o método `Feature::define` do Pennant. Se for esse o caso, seu driver customizado também deve implementar a interface `Laravel\Pennant\Contracts\DefinesFeaturesExternally`:

```php
<?php

namespace App\Extensions;

use Laravel\Pennant\Contracts\Driver;
use Laravel\Pennant\Contracts\DefinesFeaturesExternally;

class FeatureFlagServiceDriver implements Driver, DefinesFeaturesExternally
{
    /**
     * Get the features defined for the given scope.
     */
    public function definedFeaturesForScope(mixed $scope): array {}

    /* ... */
}
```

O método `definedFeaturesForScope` deve retornar uma lista de nomes de feature definidos para o scope fornecido.

<a id="events"></a>
## Events

O Pennant despacha uma variedade de events que podem ser úteis ao rastrear feature flags em toda a sua aplicação.

### `Laravel\Pennant\Events\FeatureRetrieved`

Este event é despachado sempre que uma [feature é verificada](#checking-features). Este event pode ser útil para criar e rastrear métricas contra o uso de uma feature flag em toda a sua aplicação.

### `Laravel\Pennant\Events\FeatureResolved`

Este event é despachado na primeira vez que o valor de uma feature é resolvido para um scope específico.

### `Laravel\Pennant\Events\UnknownFeatureResolved`

Este event é despachado na primeira vez que uma feature desconhecida é resolvida para um scope específico. Escutar este event pode ser útil se você pretendia remover uma feature flag, mas acidentalmente deixou referências dispersas a ela em toda a sua aplicação:

```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;
use Laravel\Pennant\Events\UnknownFeatureResolved;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Event::listen(function (UnknownFeatureResolved $event) {
            Log::error("Resolving unknown feature [{$event->feature}].");
        });
    }
}
```

### `Laravel\Pennant\Events\DynamicallyRegisteringFeatureClass`

Este event é despachado quando uma [feature baseada em classe](#class-based-features) é verificada dinamicamente pela primeira vez durante uma requisição.

### `Laravel\Pennant\Events\UnexpectedNullScopeEncountered`

Este event é despachado quando um scope `null` é passado para uma definição de feature que [não suporta null](#nullable-scope).

Esta situação é tratada de forma elegante e a feature retornará `false`. No entanto, se você quiser desativar esse comportamento gracioso padrão da feature, você pode registrar um listener para este event no método `boot` do `AppServiceProvider` da sua aplicação:

```php
use Illuminate\Support\Facades\Log;
use Laravel\Pennant\Events\UnexpectedNullScopeEncountered;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Event::listen(UnexpectedNullScopeEncountered::class, fn () => abort(500));
}
```

### `Laravel\Pennant\Events\FeatureUpdated`

Este event é despachado ao atualizar uma feature para um scope, geralmente chamando `activate` ou `deactivate`.

### `Laravel\Pennant\Events\FeatureUpdatedForAllScopes`

Este event é despachado ao atualizar uma feature para todos os scopes, geralmente chamando `activateForEveryone` ou `deactivateForEveryone`.

### `Laravel\Pennant\Events\FeatureDeleted`

Este event é despachado ao deletar uma feature para um scope, geralmente chamando `forget`.

### `Laravel\Pennant\Events\FeaturesPurged`

Este event é despachado ao purgar features específicas.

### `Laravel\Pennant\Events\AllFeaturesPurged`

Este event é despachado ao purgar todas as features.
