---
title: "Laravel Passport"
---

- [Introdução](#introduction)
    - [Passport ou Sanctum?](#passport-or-sanctum)
- [Instalação](#installation)
    - [Fazendo Deploy do Passport](#deploying-passport)
    - [Atualizando o Passport](#upgrading-passport)
- [Configuração](#configuration)
    - [Tempos de Vida dos Tokens](#token-lifetimes)
    - [Sobrescrevendo os Modelos Padrão](#overriding-default-models)
    - [Sobrescrevendo as Rotas](#overriding-routes)
- [Authorization Code Grant](#authorization-code-grant)
    - [Gerenciando Clients](#managing-clients)
    - [Solicitando Tokens](#requesting-tokens)
    - [Gerenciando Tokens](#managing-tokens)
    - [Atualizando Tokens](#refreshing-tokens)
    - [Revogando Tokens](#revoking-tokens)
    - [Removendo Tokens](#purging-tokens)
- [Authorization Code Grant Com PKCE](#code-grant-pkce)
    - [Criando o Client](#creating-a-auth-pkce-grant-client)
    - [Solicitando Tokens](#requesting-auth-pkce-grant-tokens)
- [Device Authorization Grant](#device-authorization-grant)
    - [Criando um Client de Device Authorization Grant](#creating-a-device-authorization-grant-client)
    - [Solicitando Tokens](#requesting-device-authorization-grant-tokens)
- [Password Grant](#password-grant)
    - [Criando um Client de Password Grant](#creating-a-password-grant-client)
    - [Solicitando Tokens](#requesting-password-grant-tokens)
    - [Solicitando Todos os Scopes](#requesting-all-scopes)
    - [Personalizando o User Provider](#customizing-the-user-provider)
    - [Personalizando o Campo Username](#customizing-the-username-field)
    - [Personalizando a Validação de Senha](#customizing-the-password-validation)
- [Implicit Grant](#implicit-grant)
- [Client Credentials Grant](#client-credentials-grant)
    - [Recuperando Tokens](#retrieving-tokens)
- [Personal Access Tokens](#personal-access-tokens)
    - [Criando um Personal Access Client](#creating-a-personal-access-client)
    - [Personalizando o User Provider](#customizing-the-user-provider-for-pat)
    - [Gerenciando Personal Access Tokens](#managing-personal-access-tokens)
- [Protegendo Rotas](#protecting-routes)
    - [Via Middleware](#via-middleware)
    - [Passando o Access Token](#passing-the-access-token)
- [Scopes de Token](#token-scopes)
    - [Definindo Scopes](#defining-scopes)
    - [Scope Padrão](#default-scope)
    - [Atribuindo Scopes aos Tokens](#assigning-scopes-to-tokens)
    - [Verificando Scopes](#checking-scopes)
- [Autenticação de SPA](#spa-authentication)
- [Eventos](#events)
- [Testes](#testing)

<a id="introduction"></a>
## Introdução

O [Laravel Passport](https://github.com/laravel/passport) fornece uma implementação completa de servidor OAuth2 para a sua aplicação Laravel em questão de minutos. O Passport é construído sobre o [servidor OAuth2 da League](https://github.com/thephpleague/oauth2-server), que é mantido por Andy Millington e Simon Hamp.

> **Note:**
> Esta documentação pressupõe que você já esteja familiarizado com o OAuth2. Se você não sabe nada sobre OAuth2, considere se familiarizar com a [terminologia](https://oauth2.thephpleague.com/terminology/) geral e os recursos do OAuth2 antes de continuar.

<a id="passport-or-sanctum"></a>
### Passport ou Sanctum?

Antes de começar, você pode querer determinar se a sua aplicação seria melhor atendida pelo Laravel Passport ou pelo [Laravel Sanctum](/en/sanctum/). Se a sua aplicação absolutamente precisa de suporte a OAuth2, então você deve usar o Laravel Passport.

No entanto, se você está tentando autenticar uma single-page application, uma aplicação mobile ou emitir tokens de API, você deve usar o [Laravel Sanctum](/en/sanctum/). O Laravel Sanctum não suporta OAuth2; no entanto, ele fornece uma experiência de desenvolvimento de autenticação de API muito mais simples.

<a id="installation"></a>
## Instalação

Você pode instalar o Laravel Passport através do comando Artisan `install:api`:

```shell
php artisan install:api --passport
```

Esse comando publicará e executará as migrations de banco de dados necessárias para criar as tabelas de que a sua aplicação precisa para armazenar clients OAuth2 e access tokens. O comando também criará as chaves de criptografia necessárias para gerar access tokens seguros.

Após executar o comando `install:api`, adicione a trait `Laravel\Passport\HasApiTokens` e a interface `Laravel\Passport\Contracts\OAuthenticatable` ao seu modelo `App\Models\User`. Essa trait fornecerá alguns métodos auxiliares ao seu modelo que permitem inspecionar o token e os scopes do usuário autenticado:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\Contracts\OAuthenticatable;
use Laravel\Passport\HasApiTokens;

class User extends Authenticatable implements OAuthenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
}
```

Por fim, no arquivo de configuração `config/auth.php` da sua aplicação, você deve definir um guard de autenticação `api` e definir a opção `driver` como `passport`. Isso instruirá a sua aplicação a usar o `TokenGuard` do Passport ao autenticar requisições de API recebidas:

```php
'guards' => [
    'web' => [
        'driver' => 'session',
        'provider' => 'users',
    ],

    'api' => [
        'driver' => 'passport',
        'provider' => 'users',
    ],
],
```

<a id="deploying-passport"></a>
### Fazendo Deploy do Passport

Ao fazer o deploy do Passport nos servidores da sua aplicação pela primeira vez, você provavelmente precisará executar o comando `passport:keys`. Esse comando gera as chaves de criptografia de que o Passport precisa para gerar access tokens. As chaves geradas normalmente não são mantidas no controle de versão:

```shell
php artisan passport:keys
```

Se necessário, você pode definir o caminho de onde as chaves do Passport devem ser carregadas. Você pode usar o método `Passport::loadKeysFrom` para fazer isso. Normalmente, esse método deve ser chamado a partir do método `boot` da classe `App\Providers\AppServiceProvider` da sua aplicação:

```php
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Passport::loadKeysFrom(__DIR__.'/../secrets/oauth');
}
```

<a id="loading-keys-from-the-environment"></a>
#### Carregando Chaves do Ambiente

Alternativamente, você pode publicar o arquivo de configuração do Passport usando o comando Artisan `vendor:publish`:

```shell
php artisan vendor:publish --tag=passport-config
```

Depois que o arquivo de configuração tiver sido publicado, você pode carregar as chaves de criptografia da sua aplicação definindo-as como variáveis de ambiente:

```ini
PASSPORT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
<private key here>
-----END RSA PRIVATE KEY-----"

PASSPORT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
<public key here>
-----END PUBLIC KEY-----"
```

<a id="upgrading-passport"></a>
### Atualizando o Passport

Ao atualizar para uma nova versão major do Passport, é importante que você revise cuidadosamente [o guia de atualização](https://github.com/laravel/passport/blob/master/UPGRADE.md).

<a id="configuration"></a>
## Configuração

<a id="token-lifetimes"></a>
### Tempos de Vida dos Tokens

Por padrão, o Passport emite access tokens de longa duração que expiram após um ano. Se você quiser configurar um tempo de vida de token maior / menor, você pode usar os métodos `tokensExpireIn`, `refreshTokensExpireIn` e `personalAccessTokensExpireIn`. Esses métodos devem ser chamados a partir do método `boot` da classe `App\Providers\AppServiceProvider` da sua aplicação:

```php
use Carbon\CarbonInterval;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Passport::tokensExpireIn(CarbonInterval::days(15));
    Passport::refreshTokensExpireIn(CarbonInterval::days(30));
    Passport::personalAccessTokensExpireIn(CarbonInterval::months(6));
}
```

> **Warning:**
> As colunas `expires_at` nas tabelas de banco de dados do Passport são somente leitura e apenas para fins de exibição. Ao emitir tokens, o Passport armazena as informações de expiração dentro dos tokens assinados e criptografados. Se você precisar invalidar um token, você deve [revogá-lo](#revoking-tokens).

<a id="overriding-default-models"></a>
### Sobrescrevendo os Modelos Padrão

Você é livre para estender os modelos usados internamente pelo Passport definindo seu próprio modelo e estendendo o modelo correspondente do Passport:

```php
use Laravel\Passport\Client as PassportClient;

class Client extends PassportClient
{
    // ...
}
```

Depois de definir seu modelo, você pode instruir o Passport a usar seu modelo personalizado através da classe `Laravel\Passport\Passport`. Normalmente, você deve informar o Passport sobre seus modelos personalizados no método `boot` da classe `App\Providers\AppServiceProvider` da sua aplicação:

```php
use App\Models\Passport\AuthCode;
use App\Models\Passport\Client;
use App\Models\Passport\DeviceCode;
use App\Models\Passport\RefreshToken;
use App\Models\Passport\Token;
use Laravel\Passport\Passport;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Passport::useTokenModel(Token::class);
    Passport::useRefreshTokenModel(RefreshToken::class);
    Passport::useAuthCodeModel(AuthCode::class);
    Passport::useClientModel(Client::class);
    Passport::useDeviceCodeModel(DeviceCode::class);
}
```

<a id="overriding-routes"></a>
### Sobrescrevendo as Rotas

Às vezes, você pode querer personalizar as rotas definidas pelo Passport. Para fazer isso, você primeiro precisa ignorar as rotas registradas pelo Passport adicionando `Passport::ignoreRoutes` ao método `register` do `AppServiceProvider` da sua aplicação:

```php
use Laravel\Passport\Passport;

/**
 * Register any application services.
 */
public function register(): void
{
    Passport::ignoreRoutes();
}
```

Em seguida, você pode copiar as rotas definidas pelo Passport em [seu arquivo de rotas](https://github.com/laravel/passport/blob/master/routes/web.php) para o arquivo `routes/web.php` da sua aplicação e modificá-las ao seu gosto:

```php
Route::group([
    'as' => 'passport.',
    'prefix' => config('passport.path', 'oauth'),
    'namespace' => '\Laravel\Passport\Http\Controllers',
], function () {
    // Passport routes...
});
```

<a id="authorization-code-grant"></a>
## Authorization Code Grant

Usar OAuth2 via authorization codes é como a maioria dos desenvolvedores está familiarizada com OAuth2. Ao usar authorization codes, uma aplicação cliente redirecionará um usuário para o seu servidor, onde ele aprovará ou negará a solicitação de emissão de um access token para o client.

Para começar, precisamos instruir o Passport sobre como retornar nossa view de "autorização".

Toda a lógica de renderização da view de autorização pode ser personalizada usando os métodos apropriados disponíveis através da classe `Laravel\Passport\Passport`. Normalmente, você deve chamar esse método a partir do método `boot` da classe `App\Providers\AppServiceProvider` da sua aplicação:

```php
use Inertia\Inertia;
use Laravel\Passport\Passport;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    // By providing a view name...
    Passport::authorizationView('auth.oauth.authorize');

    // By providing a closure...
    Passport::authorizationView(
        fn ($parameters) => Inertia::render('Auth/OAuth/Authorize', [
            'request' => $parameters['request'],
            'authToken' => $parameters['authToken'],
            'client' => $parameters['client'],
            'user' => $parameters['user'],
            'scopes' => $parameters['scopes'],
        ])
    );
}
```

O Passport definirá automaticamente a rota `/oauth/authorize` que retorna essa view. Seu template `auth.oauth.authorize` deve incluir um formulário que faz uma requisição POST para a rota `passport.authorizations.approve` para aprovar a autorização e um formulário que faz uma requisição DELETE para a rota `passport.authorizations.deny` para negar a autorização. As rotas `passport.authorizations.approve` e `passport.authorizations.deny` esperam os campos `state`, `client_id` e `auth_token`.

<a id="managing-clients"></a>
### Gerenciando Clients

Desenvolvedores que constroem aplicações que precisam interagir com a API da sua aplicação precisarão registrar sua aplicação com a sua criando um "client". Normalmente, isso consiste em fornecer o nome da aplicação deles e uma URI para a qual a sua aplicação possa redirecionar após os usuários aprovarem a solicitação de autorização.

<a id="managing-first-party-clients"></a>
#### Clients Primários (First-Party)

A maneira mais simples de criar um client é usando o comando Artisan `passport:client`. Esse comando pode ser usado para criar clients primários ou para testar sua funcionalidade OAuth2. Quando você executa o comando `passport:client`, o Passport solicitará mais informações sobre seu client e fornecerá a você um ID e secret de client:

```shell
php artisan passport:client
```

Se você quiser permitir múltiplas URIs de redirecionamento para seu client, você pode especificá-las usando uma lista separada por vírgulas quando solicitado pela URI pelo comando `passport:client`. Quaisquer URIs que contenham vírgulas devem ser codificadas em URI:

```shell
https://third-party-app.com/callback,https://example.com/oauth/redirect
```

<a id="managing-third-party-clients"></a>
#### Clients de Terceiros (Third-Party)

Como os usuários da sua aplicação não poderão utilizar o comando `passport:client`, você pode usar o método `createAuthorizationCodeGrantClient` da classe `Laravel\Passport\ClientRepository` para registrar um client para um determinado usuário:

```php
use App\Models\User;
use Laravel\Passport\ClientRepository;

$user = User::find($userId);

// Creating an OAuth app client that belongs to the given user...
$client = app(ClientRepository::class)->createAuthorizationCodeGrantClient(
    user: $user,
    name: 'Example App',
    redirectUris: ['https://third-party-app.com/callback'],
    confidential: false,
    enableDeviceFlow: true
);

// Retrieving all the OAuth app clients that belong to the user...
$clients = $user->oauthApps()->get();
```

O método `createAuthorizationCodeGrantClient` retorna uma instância de `Laravel\Passport\Client`. Você pode exibir o `$client->id` como o ID do client e o `$client->plainSecret` como o secret do client para o usuário.

<a id="requesting-tokens"></a>
### Solicitando Tokens

<a id="requesting-tokens-redirecting-for-authorization"></a>
#### Redirecionando para Autorização

Uma vez que um client tenha sido criado, os desenvolvedores podem usar seu ID e secret de client para solicitar um authorization code e um access token da sua aplicação. Primeiro, a aplicação consumidora deve fazer uma requisição de redirecionamento para a rota `/oauth/authorize` da sua aplicação, assim:

```php
use Illuminate\Http\Request;
use Illuminate\Support\Str;

Route::get('/redirect', function (Request $request) {
    $request->session()->put('state', $state = Str::random(40));

    $query = http_build_query([
        'client_id' => 'your-client-id',
        'redirect_uri' => 'https://third-party-app.com/callback',
        'response_type' => 'code',
        'scope' => 'user:read orders:create',
        'state' => $state,
        // 'prompt' => '', // "none", "consent", or "login"
    ]);

    return redirect('https://passport-app.test/oauth/authorize?'.$query);
});
```

O parâmetro `prompt` pode ser usado para especificar o comportamento de autenticação da aplicação Passport.

Se o valor de `prompt` for `none`, o Passport sempre lançará um erro de autenticação se o usuário ainda não estiver autenticado na aplicação Passport. Se o valor for `consent`, o Passport sempre exibirá a tela de aprovação de autorização, mesmo que todos os scopes já tenham sido concedidos anteriormente à aplicação consumidora. Quando o valor for `login`, a aplicação Passport sempre solicitará que o usuário faça login novamente na aplicação, mesmo que ele já tenha uma sessão existente.

Se nenhum valor de `prompt` for fornecido, o usuário será solicitado a autorizar apenas se não tiver autorizado anteriormente o acesso à aplicação consumidora para os scopes solicitados.

> **Note:**
> Lembre-se, a rota `/oauth/authorize` já é definida pelo Passport. Você não precisa definir manualmente essa rota.

<a id="approving-the-request"></a>
#### Aprovando a Solicitação

Ao receber solicitações de autorização, o Passport responderá automaticamente com base no valor do parâmetro `prompt` (se presente) e pode exibir um template para o usuário permitindo que ele aprove ou negue a solicitação de autorização. Se ele aprovar a solicitação, será redirecionado de volta para a `redirect_uri` que foi especificada pela aplicação consumidora. A `redirect_uri` deve corresponder à URL de `redirect` que foi especificada quando o client foi criado.

Às vezes, você pode querer pular o prompt de autorização, como ao autorizar um client primário. Você pode fazer isso [estendendo o modelo `Client`](#overriding-default-models) e definindo um método `skipsAuthorization`. Se o `skipsAuthorization` retornar `true`, o client será aprovado e o usuário será redirecionado de volta para a `redirect_uri` imediatamente, a menos que a aplicação consumidora tenha definido explicitamente o parâmetro `prompt` ao redirecionar para autorização:

```php
<?php

namespace App\Models\Passport;

use Illuminate\Contracts\Auth\Authenticatable;
use Laravel\Passport\Client as BaseClient;

class Client extends BaseClient
{
    /**
     * Determine if the client should skip the authorization prompt.
     *
     * @param  \Laravel\Passport\Scope[]  $scopes
     */
    public function skipsAuthorization(Authenticatable $user, array $scopes): bool
    {
        return $this->firstParty();
    }
}
```

<a id="requesting-tokens-converting-authorization-codes-to-access-tokens"></a>
#### Convertendo Authorization Codes em Access Tokens

Se o usuário aprovar a solicitação de autorização, ele será redirecionado de volta para a aplicação consumidora. O consumidor deve primeiro verificar o parâmetro `state` em relação ao valor que foi armazenado antes do redirecionamento. Se o parâmetro state corresponder, então o consumidor deve emitir uma requisição `POST` para a sua aplicação para solicitar um access token. A requisição deve incluir o authorization code que foi emitido pela sua aplicação quando o usuário aprovou a solicitação de autorização:

```php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

Route::get('/callback', function (Request $request) {
    $state = $request->session()->pull('state');

    throw_unless(
        strlen($state) > 0 && $state === $request->state,
        InvalidArgumentException::class,
        'Invalid state value.'
    );

    $response = Http::asForm()->post('https://passport-app.test/oauth/token', [
        'grant_type' => 'authorization_code',
        'client_id' => 'your-client-id',
        'client_secret' => 'your-client-secret',
        'redirect_uri' => 'https://third-party-app.com/callback',
        'code' => $request->code,
    ]);

    return $response->json();
});
```

Essa rota `/oauth/token` retornará uma resposta JSON contendo os atributos `access_token`, `refresh_token` e `expires_in`. O atributo `expires_in` contém o número de segundos até que o access token expire.

> **Note:**
> Assim como a rota `/oauth/authorize`, a rota `/oauth/token` é definida para você pelo Passport. Não há necessidade de definir manualmente essa rota.

<a id="managing-tokens"></a>
### Gerenciando Tokens

Você pode recuperar os tokens autorizados do usuário usando o método `tokens` da trait `Laravel\Passport\HasApiTokens`. Por exemplo, isso pode ser usado para oferecer aos seus usuários um dashboard para acompanhar suas conexões com aplicações de terceiros:

```php
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Date;
use Laravel\Passport\Token;

$user = User::find($userId);

// Retrieving all of the valid tokens for the user...
$tokens = $user->tokens()
    ->where('revoked', false)
    ->where('expires_at', '>', Date::now())
    ->get();

// Retrieving all the user's connections to third-party OAuth app clients...
$connections = $tokens->load('client')
    ->reject(fn (Token $token) => $token->client->firstParty())
    ->groupBy('client_id')
    ->map(fn (Collection $tokens) => [
        'client' => $tokens->first()->client,
        'scopes' => $tokens->pluck('scopes')->flatten()->unique()->values()->all(),
        'tokens_count' => $tokens->count(),
    ])
    ->values();
```

<a id="refreshing-tokens"></a>
### Atualizando Tokens

Se a sua aplicação emite access tokens de curta duração, os usuários precisarão atualizar seus access tokens através do refresh token que foi fornecido a eles quando o access token foi emitido:

```php
use Illuminate\Support\Facades\Http;

$response = Http::asForm()->post('https://passport-app.test/oauth/token', [
    'grant_type' => 'refresh_token',
    'refresh_token' => 'the-refresh-token',
    'client_id' => 'your-client-id',
    'client_secret' => 'your-client-secret', // Required for confidential clients only...
    'scope' => 'user:read orders:create',
]);

return $response->json();
```

Essa rota `/oauth/token` retornará uma resposta JSON contendo os atributos `access_token`, `refresh_token` e `expires_in`. O atributo `expires_in` contém o número de segundos até que o access token expire.

<a id="revoking-tokens"></a>
### Revogando Tokens

Você pode revogar um token usando o método `revoke` no modelo `Laravel\Passport\Token`. Você pode revogar o refresh token de um token usando o método `revoke` no modelo `Laravel\Passport\RefreshToken`:

```php
use Laravel\Passport\Passport;
use Laravel\Passport\Token;

$token = Passport::token()->find($tokenId);

// Revoke an access token...
$token->revoke();

// Revoke the token's refresh token...
$token->refreshToken?->revoke();

// Revoke all of the user's tokens...
User::find($userId)->tokens()->each(function (Token $token) {
    $token->revoke();
    $token->refreshToken?->revoke();
});
```

<a id="purging-tokens"></a>
### Removendo Tokens

Quando os tokens tiverem sido revogados ou expirados, você pode querer removê-los do banco de dados. O comando Artisan `passport:purge` incluído no Passport pode fazer isso por você:

```shell
# Purge revoked and expired tokens, auth codes, and device codes...
php artisan passport:purge

# Only purge tokens expired for more than 6 hours...
php artisan passport:purge --expired --hours=6

# Only purge revoked tokens, auth codes, and device codes...
php artisan passport:purge --revoked

# Only purge expired tokens, auth codes, and device codes...
php artisan passport:purge --expired
```

Você também pode configurar um [job agendado](/en/scheduling/) no arquivo `routes/console.php` da sua aplicação para podar automaticamente seus tokens em um agendamento:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('passport:purge')->hourly();
```

<a id="code-grant-pkce"></a>
## Authorization Code Grant Com PKCE

O Authorization Code grant com "Proof Key for Code Exchange" (PKCE) é uma maneira segura de autenticar single page applications ou aplicações mobile para acessar sua API. Esse grant deve ser usado quando você não pode garantir que o client secret será armazenado de forma confidencial ou para mitigar a ameaça de ter o authorization code interceptado por um atacante. Uma combinação de um "code verifier" e um "code challenge" substitui o client secret ao trocar o authorization code por um access token.

<a id="creating-a-auth-pkce-grant-client"></a>
### Criando o Client

Antes que a sua aplicação possa emitir tokens via authorization code grant com PKCE, você precisará criar um client habilitado para PKCE. Você pode fazer isso usando o comando Artisan `passport:client` com a opção `--public`:

```shell
php artisan passport:client --public
```

<a id="requesting-auth-pkce-grant-tokens"></a>
### Solicitando Tokens

<a id="code-verifier-code-challenge"></a>
#### Code Verifier e Code Challenge

Como esse authorization grant não fornece um client secret, os desenvolvedores precisarão gerar uma combinação de um code verifier e um code challenge para solicitar um token.

O code verifier deve ser uma string aleatória de entre 43 e 128 caracteres contendo letras, números e os caracteres `"-"`, `"."`, `"_"`, `"~"`, conforme definido na [especificação RFC 7636](https://tools.ietf.org/html/rfc7636).

O code challenge deve ser uma string codificada em Base64 com caracteres seguros para URL e nome de arquivo. Os caracteres `'='` finais devem ser removidos e nenhuma quebra de linha, espaço em branco ou outros caracteres adicionais devem estar presentes.

```php
$encoded = base64_encode(hash('sha256', $codeVerifier, true));

$codeChallenge = strtr(rtrim($encoded, '='), '+/', '-_');
```

<a id="code-grant-pkce-redirecting-for-authorization"></a>
#### Redirecionando para Autorização

Uma vez que um client tenha sido criado, você pode usar o ID do client e o code verifier e code challenge gerados para solicitar um authorization code e um access token da sua aplicação. Primeiro, a aplicação consumidora deve fazer uma requisição de redirecionamento para a rota `/oauth/authorize` da sua aplicação:

```php
use Illuminate\Http\Request;
use Illuminate\Support\Str;

Route::get('/redirect', function (Request $request) {
    $request->session()->put('state', $state = Str::random(40));

    $request->session()->put(
        'code_verifier', $codeVerifier = Str::random(128)
    );

    $codeChallenge = strtr(rtrim(
        base64_encode(hash('sha256', $codeVerifier, true))
    , '='), '+/', '-_');

    $query = http_build_query([
        'client_id' => 'your-client-id',
        'redirect_uri' => 'https://third-party-app.com/callback',
        'response_type' => 'code',
        'scope' => 'user:read orders:create',
        'state' => $state,
        'code_challenge' => $codeChallenge,
        'code_challenge_method' => 'S256',
        // 'prompt' => '', // "none", "consent", or "login"
    ]);

    return redirect('https://passport-app.test/oauth/authorize?'.$query);
});
```

<a id="code-grant-pkce-converting-authorization-codes-to-access-tokens"></a>
#### Convertendo Authorization Codes em Access Tokens

Se o usuário aprovar a solicitação de autorização, ele será redirecionado de volta para a aplicação consumidora. O consumidor deve verificar o parâmetro `state` em relação ao valor que foi armazenado antes do redirecionamento, como no Authorization Code Grant padrão.

Se o parâmetro state corresponder, o consumidor deve emitir uma requisição `POST` para a sua aplicação para solicitar um access token. A requisição deve incluir o authorization code que foi emitido pela sua aplicação quando o usuário aprovou a solicitação de autorização, juntamente com o code verifier gerado originalmente:

```php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

Route::get('/callback', function (Request $request) {
    $state = $request->session()->pull('state');

    $codeVerifier = $request->session()->pull('code_verifier');

    throw_unless(
        strlen($state) > 0 && $state === $request->state,
        InvalidArgumentException::class
    );

    $response = Http::asForm()->post('https://passport-app.test/oauth/token', [
        'grant_type' => 'authorization_code',
        'client_id' => 'your-client-id',
        'redirect_uri' => 'https://third-party-app.com/callback',
        'code_verifier' => $codeVerifier,
        'code' => $request->code,
    ]);

    return $response->json();
});
```

<a id="device-authorization-grant"></a>
## Device Authorization Grant

O device authorization grant do OAuth2 permite que dispositivos sem navegador ou com entrada limitada, como TVs e consoles de videogame, obtenham um access token trocando um "device code". Ao usar o device flow, o device client instruirá o usuário a usar um dispositivo secundário, como um computador ou um smartphone, e se conectar ao seu servidor onde ele inserirá o "user code" fornecido e aprovará ou negará a solicitação de acesso.

Para começar, precisamos instruir o Passport sobre como retornar nossas views de "user code" e "autorização".

Toda a lógica de renderização da view de autorização pode ser personalizada usando os métodos apropriados disponíveis através da classe `Laravel\Passport\Passport`. Normalmente, você deve chamar esse método a partir do método `boot` da classe `App\Providers\AppServiceProvider` da sua aplicação.

```php
use Inertia\Inertia;
use Laravel\Passport\Passport;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    // By providing a view name...
    Passport::deviceUserCodeView('auth.oauth.device.user-code');
    Passport::deviceAuthorizationView('auth.oauth.device.authorize');

    // By providing a closure...
    Passport::deviceUserCodeView(
        fn ($parameters) => Inertia::render('Auth/OAuth/Device/UserCode')
    );

    Passport::deviceAuthorizationView(
        fn ($parameters) => Inertia::render('Auth/OAuth/Device/Authorize', [
            'request' => $parameters['request'],
            'authToken' => $parameters['authToken'],
            'client' => $parameters['client'],
            'user' => $parameters['user'],
            'scopes' => $parameters['scopes'],
        ])
    );

    // ...
}
```

O Passport definirá automaticamente rotas que retornam essas views. Seu template `auth.oauth.device.user-code` deve incluir um formulário que faz uma requisição GET para a rota `passport.device.authorizations.authorize`. A rota `passport.device.authorizations.authorize` espera um parâmetro de query `user_code`.

Seu template `auth.oauth.device.authorize` deve incluir um formulário que faz uma requisição POST para a rota `passport.device.authorizations.approve` para aprovar a autorização e um formulário que faz uma requisição DELETE para a rota `passport.device.authorizations.deny` para negar a autorização. As rotas `passport.device.authorizations.approve` e `passport.device.authorizations.deny` esperam os campos `state`, `client_id` e `auth_token`.

<a id="creating-a-device-authorization-grant-client"></a>
### Criando um Client de Device Authorization Grant

Antes que a sua aplicação possa emitir tokens via device authorization grant, você precisará criar um client habilitado para device flow. Você pode fazer isso usando o comando Artisan `passport:client` com a opção `--device`. Esse comando criará um client primário habilitado para device flow e fornecerá a você um ID e secret de client:

```shell
php artisan passport:client --device
```

Adicionalmente, você pode usar o método `createDeviceAuthorizationGrantClient` na classe `ClientRepository` para registrar um client de terceiros que pertence ao usuário fornecido:

```php
use App\Models\User;
use Laravel\Passport\ClientRepository;

$user = User::find($userId);

$client = app(ClientRepository::class)->createDeviceAuthorizationGrantClient(
    user: $user,
    name: 'Example Device',
    confidential: false,
);
```

<a id="requesting-device-authorization-grant-tokens"></a>
### Solicitando Tokens

<a id="device-code"></a>
#### Solicitando um Device Code

Uma vez que um client tenha sido criado, os desenvolvedores podem usar seu ID de client para solicitar um device code da sua aplicação. Primeiro, o dispositivo consumidor deve fazer uma requisição `POST` para a rota `/oauth/device/code` da sua aplicação para solicitar um device code:

```php
use Illuminate\Support\Facades\Http;

$response = Http::asForm()->post('https://passport-app.test/oauth/device/code', [
    'client_id' => 'your-client-id',
    'scope' => 'user:read orders:create',
]);

return $response->json();
```

Isso retornará uma resposta JSON contendo os atributos `device_code`, `user_code`, `verification_uri`, `interval` e `expires_in`. O atributo `expires_in` contém o número de segundos até que o device code expire. O atributo `interval` contém o número de segundos que o dispositivo consumidor deve esperar entre as requisições ao fazer polling na rota `/oauth/token` para evitar erros de rate limit.

> **Note:**
> Lembre-se, a rota `/oauth/device/code` já é definida pelo Passport. Você não precisa definir manualmente essa rota.

<a id="user-code"></a>
#### Exibindo a Verification URI e o User Code

Uma vez que uma solicitação de device code tenha sido obtida, o dispositivo consumidor deve instruir o usuário a usar outro dispositivo e visitar a `verification_uri` fornecida e inserir o `user_code` para aprovar a solicitação de autorização.

<a id="polling-token-request"></a>
#### Requisição de Token por Polling

Como o usuário usará um dispositivo separado para conceder (ou negar) acesso, o dispositivo consumidor deve fazer polling na rota `/oauth/token` da sua aplicação para determinar quando o usuário respondeu à solicitação. O dispositivo consumidor deve usar o `interval` de polling mínimo fornecido na resposta JSON ao solicitar o device code para evitar erros de rate limit:

```php
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Sleep;

$interval = 5;

do {
    Sleep::for($interval)->seconds();

    $response = Http::asForm()->post('https://passport-app.test/oauth/token', [
        'grant_type' => 'urn:ietf:params:oauth:grant-type:device_code',
        'client_id' => 'your-client-id',
        'client_secret' => 'your-client-secret', // Required for confidential clients only...
        'device_code' => 'the-device-code',
    ]);

    if ($response->json('error') === 'slow_down') {
        $interval += 5;
    }
} while (in_array($response->json('error'), ['authorization_pending', 'slow_down']));

return $response->json();
```

Se o usuário tiver aprovado a solicitação de autorização, isso retornará uma resposta JSON contendo os atributos `access_token`, `refresh_token` e `expires_in`. O atributo `expires_in` contém o número de segundos até que o access token expire.

<a id="password-grant"></a>
## Password Grant

> **Warning:**
> Não recomendamos mais o uso de tokens de password grant. Em vez disso, você deve escolher [um tipo de grant que seja atualmente recomendado pelo OAuth2 Server](https://oauth2.thephpleague.com/authorization-server/which-grant/).

O password grant do OAuth2 permite que seus outros clients primários, como uma aplicação mobile, obtenham um access token usando um endereço de e-mail / username e senha. Isso permite que você emita access tokens de forma segura para seus clients primários sem exigir que seus usuários passem por todo o fluxo de redirecionamento de authorization code do OAuth2.

Para habilitar o password grant, chame o método `enablePasswordGrant` no método `boot` da classe `App\Providers\AppServiceProvider` da sua aplicação:

```php
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Passport::enablePasswordGrant();
}
```

<a id="creating-a-password-grant-client"></a>
### Criando um Client de Password Grant

Antes que a sua aplicação possa emitir tokens via password grant, você precisará criar um client de password grant. Você pode fazer isso usando o comando Artisan `passport:client` com a opção `--password`.

```shell
php artisan passport:client --password
```

<a id="requesting-password-grant-tokens"></a>
### Solicitando Tokens

Uma vez que você tenha habilitado o grant e criado um client de password grant, você pode solicitar um access token emitindo uma requisição `POST` para a rota `/oauth/token` com o endereço de e-mail e a senha do usuário. Lembre-se, essa rota já é registrada pelo Passport, então não há necessidade de defini-la manualmente. Se a requisição for bem-sucedida, você receberá um `access_token` e um `refresh_token` na resposta JSON do servidor:

```php
use Illuminate\Support\Facades\Http;

$response = Http::asForm()->post('https://passport-app.test/oauth/token', [
    'grant_type' => 'password',
    'client_id' => 'your-client-id',
    'client_secret' => 'your-client-secret', // Required for confidential clients only...
    'username' => 'taylor@laravel.com',
    'password' => 'my-password',
    'scope' => 'user:read orders:create',
]);

return $response->json();
```

> **Note:**
> Lembre-se, os access tokens são de longa duração por padrão. No entanto, você é livre para [configurar seu tempo de vida máximo de access token](#configuration) se necessário.

<a id="requesting-all-scopes"></a>
### Solicitando Todos os Scopes

Ao usar o password grant ou o client credentials grant, você pode querer autorizar o token para todos os scopes suportados pela sua aplicação. Você pode fazer isso solicitando o scope `*`. Se você solicitar o scope `*`, o método `can` na instância do token sempre retornará `true`. Esse scope só pode ser atribuído a um token que é emitido usando o grant `password` ou `client_credentials`:

```php
use Illuminate\Support\Facades\Http;

$response = Http::asForm()->post('https://passport-app.test/oauth/token', [
    'grant_type' => 'password',
    'client_id' => 'your-client-id',
    'client_secret' => 'your-client-secret', // Required for confidential clients only...
    'username' => 'taylor@laravel.com',
    'password' => 'my-password',
    'scope' => '*',
]);
```

<a id="customizing-the-user-provider"></a>
### Personalizando o User Provider

Se a sua aplicação usa mais de um [user provider de autenticação](/en/authentication/#introduction), você pode especificar qual user provider o client de password grant usa fornecendo uma opção `--provider` ao criar o client via o comando `artisan passport:client --password`. O nome do provider fornecido deve corresponder a um provider válido definido no arquivo de configuração `config/auth.php` da sua aplicação. Você pode então [proteger sua rota usando middleware](#multiple-authentication-guards) para garantir que apenas usuários do provider especificado do guard sejam autorizados.

<a id="customizing-the-username-field"></a>
### Personalizando o Campo Username

Ao autenticar usando o password grant, o Passport usará o atributo `email` do seu modelo autenticável como o "username". No entanto, você pode personalizar esse comportamento definindo um método `findForPassport` no seu modelo:

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\Bridge\Client;
use Laravel\Passport\Contracts\OAuthenticatable;
use Laravel\Passport\HasApiTokens;

class User extends Authenticatable implements OAuthenticatable
{
    use HasApiTokens, Notifiable;

    /**
     * Find the user instance for the given username.
     */
    public function findForPassport(string $username, Client $client): User
    {
        return $this->where('username', $username)->first();
    }
}
```

<a id="customizing-the-password-validation"></a>
### Personalizando a Validação de Senha

Ao autenticar usando o password grant, o Passport usará o atributo `password` do seu modelo para validar a senha fornecida. Se o seu modelo não tiver um atributo `password` ou se você quiser personalizar a lógica de validação de senha, você pode definir um método `validateForPassportPasswordGrant` no seu modelo:

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Laravel\Passport\Contracts\OAuthenticatable;
use Laravel\Passport\HasApiTokens;

class User extends Authenticatable implements OAuthenticatable
{
    use HasApiTokens, Notifiable;

    /**
     * Validate the password of the user for the Passport password grant.
     */
    public function validateForPassportPasswordGrant(string $password): bool
    {
        return Hash::check($password, $this->password);
    }
}
```

<a id="implicit-grant"></a>
## Implicit Grant

> **Warning:**
> Não recomendamos mais o uso de tokens de implicit grant. Em vez disso, você deve escolher [um tipo de grant que seja atualmente recomendado pelo OAuth2 Server](https://oauth2.thephpleague.com/authorization-server/which-grant/).

O implicit grant é similar ao authorization code grant; no entanto, o token é retornado ao client sem a troca de um authorization code. Esse grant é mais comumente usado para aplicações JavaScript ou mobile onde as credenciais do client não podem ser armazenadas com segurança. Para habilitar o grant, chame o método `enableImplicitGrant` no método `boot` da classe `App\Providers\AppServiceProvider` da sua aplicação:

```php
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Passport::enableImplicitGrant();
}
```

Antes que a sua aplicação possa emitir tokens via implicit grant, você precisará criar um client de implicit grant. Você pode fazer isso usando o comando Artisan `passport:client` com a opção `--implicit`.

```shell
php artisan passport:client --implicit
```

Uma vez que o grant tenha sido habilitado e um client implicit tenha sido criado, os desenvolvedores podem usar seu ID de client para solicitar um access token da sua aplicação. A aplicação consumidora deve fazer uma requisição de redirecionamento para a rota `/oauth/authorize` da sua aplicação, assim:

```php
use Illuminate\Http\Request;

Route::get('/redirect', function (Request $request) {
    $request->session()->put('state', $state = Str::random(40));

    $query = http_build_query([
        'client_id' => 'your-client-id',
        'redirect_uri' => 'https://third-party-app.com/callback',
        'response_type' => 'token',
        'scope' => 'user:read orders:create',
        'state' => $state,
        // 'prompt' => '', // "none", "consent", or "login"
    ]);

    return redirect('https://passport-app.test/oauth/authorize?'.$query);
});
```

> **Note:**
> Lembre-se, a rota `/oauth/authorize` já é definida pelo Passport. Você não precisa definir manualmente essa rota.

<a id="client-credentials-grant"></a>
## Client Credentials Grant

O client credentials grant é adequado para autenticação máquina a máquina. Por exemplo, você pode usar esse grant em um job agendado que está realizando tarefas de manutenção sobre uma API.

Antes que a sua aplicação possa emitir tokens via client credentials grant, você precisará criar um client de client credentials grant. Você pode fazer isso usando a opção `--client` do comando Artisan `passport:client`:

```shell
php artisan passport:client --client
```

Em seguida, atribua o middleware `Laravel\Passport\Http\Middleware\EnsureClientIsResourceOwner` a uma rota:

```php
use Laravel\Passport\Http\Middleware\EnsureClientIsResourceOwner;

Route::get('/orders', function (Request $request) {
    // Access token is valid and the client is resource owner...
})->middleware(EnsureClientIsResourceOwner::class);
```

Para restringir o acesso à rota a scopes específicos, você pode fornecer uma lista dos scopes necessários ao método `using`:

```php
Route::get('/orders', function (Request $request) {
    // Access token is valid, the client is resource owner, and has both "servers:read" and "servers:create" scopes...
})->middleware(EnsureClientIsResourceOwner::using('servers:read', 'servers:create'));
```

> **Warning:**
> O [servidor OAuth2 subjacente](https://oauth2.thephpleague.com/database-setup/#:~:text=Please%20note%20that,the%20bearer%20token.) define a claim `sub` do token como o identificador do client para tokens de client credentials. Por padrão, o Passport usa UUIDs para clients, então isso não pode colidir com a chave primária inteira de um usuário. No entanto, se você definiu `Passport::$clientUuids` como `false`, um token de client credentials pode inadvertidamente resolver um usuário cujo ID corresponda ao ID do client. Nesses casos, o uso desse middleware não pode garantir que o token recebido seja um token de client credentials.

<a id="retrieving-tokens"></a>
### Recuperando Tokens

Para recuperar um token usando esse tipo de grant, faça uma requisição ao endpoint `oauth/token`:

```php
use Illuminate\Support\Facades\Http;

$response = Http::asForm()->post('https://passport-app.test/oauth/token', [
    'grant_type' => 'client_credentials',
    'client_id' => 'your-client-id',
    'client_secret' => 'your-client-secret',
    'scope' => 'servers:read servers:create',
]);

return $response->json()['access_token'];
```

<a id="personal-access-tokens"></a>
## Personal Access Tokens

Às vezes, seus usuários podem querer emitir access tokens para si mesmos sem passar pelo típico fluxo de redirecionamento de authorization code. Permitir que os usuários emitam tokens para si mesmos através da UI da sua aplicação pode ser útil para permitir que os usuários experimentem sua API ou pode servir como uma abordagem mais simples para emitir access tokens em geral.

> **Note:**
> Se a sua aplicação usa o Passport primariamente para emitir personal access tokens, considere usar o [Laravel Sanctum](/en/sanctum/), a biblioteca primária leve do Laravel para emitir access tokens de API.

<a id="creating-a-personal-access-client"></a>
### Criando um Personal Access Client

Antes que a sua aplicação possa emitir personal access tokens, você precisará criar um personal access client. Você pode fazer isso executando o comando Artisan `passport:client` com a opção `--personal`. Se você já executou o comando `passport:install`, você não precisa executar este comando:

```shell
php artisan passport:client --personal
```

<a id="customizing-the-user-provider-for-pat"></a>
### Personalizando o User Provider

Se a sua aplicação usa mais de um [user provider de autenticação](/en/authentication/#introduction), você pode especificar qual user provider o client de personal access grant usa fornecendo uma opção `--provider` ao criar o client via o comando `artisan passport:client --personal`. O nome do provider fornecido deve corresponder a um provider válido definido no arquivo de configuração `config/auth.php` da sua aplicação. Você pode então [proteger sua rota usando middleware](#multiple-authentication-guards) para garantir que apenas usuários do provider especificado do guard sejam autorizados.

<a id="managing-personal-access-tokens"></a>
### Gerenciando Personal Access Tokens

Uma vez que você tenha criado um personal access client, você pode emitir tokens para um determinado usuário usando o método `createToken` na instância do modelo `App\Models\User`. O método `createToken` aceita o nome do token como seu primeiro argumento e um array opcional de [scopes](#token-scopes) como seu segundo argumento:

```php
use App\Models\User;
use Illuminate\Support\Facades\Date;
use Laravel\Passport\Token;

$user = User::find($userId);

// Creating a token without scopes...
$token = $user->createToken('My Token')->accessToken;

// Creating a token with scopes...
$token = $user->createToken('My Token', ['user:read', 'orders:create'])->accessToken;

// Creating a token with all scopes...
$token = $user->createToken('My Token', ['*'])->accessToken;

// Retrieving all the valid personal access tokens that belong to the user...
$tokens = $user->tokens()
    ->with('client')
    ->where('revoked', false)
    ->where('expires_at', '>', Date::now())
    ->get()
    ->filter(fn (Token $token) => $token->client->hasGrantType('personal_access'));
```

<a id="protecting-routes"></a>
## Protegendo Rotas

<a id="via-middleware"></a>
### Via Middleware

O Passport inclui um [guard de autenticação](/en/authentication/#adding-custom-guards) que validará access tokens em requisições recebidas. Uma vez que você tenha configurado o guard `api` para usar o driver `passport`, você só precisa especificar o middleware `auth:api` em quaisquer rotas que devam exigir um access token válido:

```php
Route::get('/user', function () {
    // Only API authenticated users may access this route...
})->middleware('auth:api');
```

> **Warning:**
> Se você estiver usando o [client credentials grant](#client-credentials-grant), você deve usar [o middleware `Laravel\Passport\Http\Middleware\EnsureClientIsResourceOwner`](#client-credentials-grant) para proteger suas rotas em vez do middleware `auth:api`.

<a id="multiple-authentication-guards"></a>
#### Múltiplos Guards de Autenticação

Se a sua aplicação autentica diferentes tipos de usuários que talvez usem modelos Eloquent inteiramente diferentes, você provavelmente precisará definir uma configuração de guard para cada tipo de user provider na sua aplicação. Isso permite que você proteja requisições destinadas a user providers específicos. Por exemplo, dada a seguinte configuração de guard no arquivo de configuração `config/auth.php`:

```php
'guards' => [
    'api' => [
        'driver' => 'passport',
        'provider' => 'users',
    ],

    'api-customers' => [
        'driver' => 'passport',
        'provider' => 'customers',
    ],
],
```

A seguinte rota utilizará o guard `api-customers`, que usa o user provider `customers`, para autenticar requisições recebidas:

```php
Route::get('/customer', function () {
    // ...
})->middleware('auth:api-customers');
```

> **Note:**
> Para mais informações sobre o uso de múltiplos user providers com o Passport, consulte a [documentação de personal access tokens](#customizing-the-user-provider-for-pat) e a [documentação de password grant](#customizing-the-user-provider).

<a id="passing-the-access-token"></a>
### Passando o Access Token

Ao chamar rotas que são protegidas pelo Passport, os consumidores da API da sua aplicação devem especificar seu access token como um token `Bearer` no cabeçalho `Authorization` da requisição deles. Por exemplo, ao usar a Facade `Http`:

```php
use Illuminate\Support\Facades\Http;

$response = Http::withHeaders([
    'Accept' => 'application/json',
    'Authorization' => "Bearer $accessToken",
])->get('https://passport-app.test/api/user');

return $response->json();
```

<a id="token-scopes"></a>
## Scopes de Token

Os scopes permitem que seus clients de API solicitem um conjunto específico de permissões ao solicitar autorização para acessar uma conta. Por exemplo, se você está construindo uma aplicação de e-commerce, nem todos os consumidores da API precisarão da capacidade de realizar pedidos. Em vez disso, você pode permitir que os consumidores solicitem autorização apenas para acessar os status de envio dos pedidos. Em outras palavras, os scopes permitem que os usuários da sua aplicação limitem as ações que uma aplicação de terceiros pode realizar em seu nome.

<a id="defining-scopes"></a>
### Definindo Scopes

Você pode definir os scopes da sua API usando o método `Passport::tokensCan` no método `boot` da classe `App\Providers\AppServiceProvider` da sua aplicação. O método `tokensCan` aceita um array de nomes de scope e descrições de scope. A descrição do scope pode ser qualquer coisa que você desejar e será exibida aos usuários na tela de aprovação de autorização:

```php
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Passport::tokensCan([
        'user:read' => 'Retrieve the user info',
        'orders:create' => 'Place orders',
        'orders:read:status' => 'Check order status',
    ]);
}
```

<a id="default-scope"></a>
### Scope Padrão

Se um client não solicitar nenhum scope específico, você pode configurar seu servidor Passport para anexar scopes padrão ao token usando o método `defaultScopes`. Normalmente, você deve chamar esse método a partir do método `boot` da classe `App\Providers\AppServiceProvider` da sua aplicação:

```php
use Laravel\Passport\Passport;

Passport::tokensCan([
    'user:read' => 'Retrieve the user info',
    'orders:create' => 'Place orders',
    'orders:read:status' => 'Check order status',
]);

Passport::defaultScopes([
    'user:read',
    'orders:create',
]);
```

<a id="assigning-scopes-to-tokens"></a>
### Atribuindo Scopes aos Tokens

<a id="when-requesting-authorization-codes"></a>
#### Ao Solicitar Authorization Codes

Ao solicitar um access token usando o authorization code grant, os consumidores devem especificar os scopes desejados como o parâmetro de query string `scope`. O parâmetro `scope` deve ser uma lista de scopes separada por espaços:

```php
Route::get('/redirect', function () {
    $query = http_build_query([
        'client_id' => 'your-client-id',
        'redirect_uri' => 'https://third-party-app.com/callback',
        'response_type' => 'code',
        'scope' => 'user:read orders:create',
    ]);

    return redirect('https://passport-app.test/oauth/authorize?'.$query);
});
```

<a id="when-issuing-personal-access-tokens"></a>
#### Ao Emitir Personal Access Tokens

Se você está emitindo personal access tokens usando o método `createToken` do modelo `App\Models\User`, você pode passar o array de scopes desejados como o segundo argumento para o método:

```php
$token = $user->createToken('My Token', ['orders:create'])->accessToken;
```

<a id="checking-scopes"></a>
### Verificando Scopes

O Passport inclui dois middleware que podem ser usados para verificar que uma requisição recebida está autenticada com um token que recebeu um determinado scope.

<a id="check-for-all-scopes"></a>
#### Verificar Todos os Scopes

O middleware `Laravel\Passport\Http\Middleware\CheckToken` pode ser atribuído a uma rota para verificar que o access token da requisição recebida possui todos os scopes listados:

```php
use Laravel\Passport\Http\Middleware\CheckToken;

Route::get('/orders', function () {
    // Access token has both "orders:read" and "orders:create" scopes...
})->middleware(['auth:api', CheckToken::using('orders:read', 'orders:create')]);
```

<a id="check-for-any-scopes"></a>
#### Verificar Qualquer Scope

O middleware `Laravel\Passport\Http\Middleware\CheckTokenForAnyScope` pode ser atribuído a uma rota para verificar que o access token da requisição recebida possui *pelo menos um* dos scopes listados:

```php
use Laravel\Passport\Http\Middleware\CheckTokenForAnyScope;

Route::get('/orders', function () {
    // Access token has either "orders:read" or "orders:create" scope...
})->middleware(['auth:api', CheckTokenForAnyScope::using('orders:read', 'orders:create')]);
```

<a id="scope-attributes"></a>
#### Atributos de Scope

Se a sua aplicação usa [atributos de middleware de controller](/en/controllers/#middleware-attributes), você pode usar o atributo `Laravel\Passport\Attributes\AuthorizeToken` como um atalho conveniente para o middleware de scope do Passport:

```php
<?php

namespace App\Http\Controllers;

use Laravel\Passport\Attributes\AuthorizeToken;

#[AuthorizeToken('orders:read')]
#[AuthorizeToken('orders:create', only: ['store'])]
class OrderController
{
    #[AuthorizeToken(['orders:read', 'orders:create'], anyScope: true)]
    public function index()
    {
        // Access token has either "orders:read" or "orders:create" scope...
    }

    public function store()
    {
        // Access token has both "orders:read" and "orders:create" scopes...
    }
}
```

Por padrão, o atributo `AuthorizeToken` exige todos os scopes fornecidos. Se você passar `anyScope: true`, a requisição é autorizada quando o token possui pelo menos um dos scopes fornecidos.

<a id="checking-scopes-on-a-token-instance"></a>
#### Verificando Scopes em uma Instância de Token

Uma vez que uma requisição autenticada por access token tenha entrado na sua aplicação, você ainda pode verificar se o token possui um determinado scope usando o método `tokenCan` na instância autenticada de `App\Models\User`:

```php
use Illuminate\Http\Request;

Route::get('/orders', function (Request $request) {
    if ($request->user()->tokenCan('orders:create')) {
        // ...
    }
});
```

<a id="additional-scope-methods"></a>
#### Métodos Adicionais de Scope

O método `scopeIds` retornará um array de todos os IDs / nomes definidos:

```php
use Laravel\Passport\Passport;

Passport::scopeIds();
```

O método `scopes` retornará um array de todos os scopes definidos como instâncias de `Laravel\Passport\Scope`:

```php
Passport::scopes();
```

O método `scopesFor` retornará um array de instâncias de `Laravel\Passport\Scope` correspondentes aos IDs / nomes fornecidos:

```php
Passport::scopesFor(['user:read', 'orders:create']);
```

Você pode determinar se um determinado scope foi definido usando o método `hasScope`:

```php
Passport::hasScope('orders:create');
```

<a id="spa-authentication"></a>
## Autenticação de SPA

Ao construir uma API, pode ser extremamente útil poder consumir sua própria API a partir da sua aplicação JavaScript. Essa abordagem ao desenvolvimento de API permite que sua própria aplicação consuma a mesma API que você está compartilhando com o mundo. A mesma API pode ser consumida pela sua aplicação web, aplicações mobile, aplicações de terceiros e quaisquer SDKs que você possa publicar em vários gerenciadores de pacotes.

Normalmente, se você quiser consumir sua API a partir da sua aplicação JavaScript, você precisaria enviar manualmente um access token para a aplicação e passá-lo a cada requisição à sua aplicação. No entanto, o Passport inclui um middleware que pode cuidar disso para você. Tudo o que você precisa fazer é anexar o middleware `CreateFreshApiToken` ao grupo de middleware `web` no arquivo `bootstrap/app.php` da sua aplicação:

```php
use Laravel\Passport\Http\Middleware\CreateFreshApiToken;

->withMiddleware(function (Middleware $middleware): void {
    $middleware->web(append: [
        CreateFreshApiToken::class,
    ]);
})
```

> **Warning:**
> Você deve garantir que o middleware `CreateFreshApiToken` seja o último middleware listado na sua stack de middleware.

Esse middleware anexará um cookie `laravel_token` às suas respostas de saída. Esse cookie contém um JWT criptografado que o Passport usará para autenticar requisições de API da sua aplicação JavaScript. O JWT tem um tempo de vida igual ao valor da sua configuração `session.lifetime`. Agora, como o navegador enviará automaticamente o cookie com todas as requisições subsequentes, você pode fazer requisições à API da sua aplicação sem passar explicitamente um access token:

```js
axios.get('/api/user')
    .then(response => {
        console.log(response.data);
    });
```

<a id="customizing-the-cookie-name"></a>
#### Personalizando o Nome do Cookie

Se necessário, você pode personalizar o nome do cookie `laravel_token` usando o método `Passport::cookie`. Normalmente, esse método deve ser chamado a partir do método `boot` da classe `App\Providers\AppServiceProvider` da sua aplicação:

```php
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Passport::cookie('custom_name');
}
```

<a id="csrf-protection"></a>
#### Proteção CSRF

Ao usar esse método de autenticação, você precisará garantir que um cabeçalho de token CSRF válido seja incluído nas suas requisições. O scaffolding JavaScript padrão do Laravel incluído na aplicação esqueleto e em todos os starter kits inclui uma instância do [Axios](https://github.com/axios/axios), que usará automaticamente o valor do cookie `XSRF-TOKEN` criptografado para enviar um cabeçalho `X-XSRF-TOKEN` em requisições de mesma origem.

> **Note:**
> Se você escolher enviar o cabeçalho `X-CSRF-TOKEN` em vez de `X-XSRF-TOKEN`, você precisará usar o token não criptografado fornecido por `csrf_token()`.

<a id="events"></a>
## Eventos

O Passport dispara eventos ao emitir access tokens e refresh tokens. Você pode [ouvir esses eventos](/en/events/) para podar ou revogar outros access tokens no seu banco de dados:

<div class="overflow-auto">

| Event Name                                    |
| --------------------------------------------- |
| `Laravel\Passport\Events\AccessTokenCreated`  |
| `Laravel\Passport\Events\AccessTokenRevoked`  |
| `Laravel\Passport\Events\RefreshTokenCreated` |

</div>

<a id="testing"></a>
## Testes

O método `actingAs` do Passport pode ser usado para especificar o usuário atualmente autenticado, bem como seus scopes. O primeiro argumento fornecido ao método `actingAs` é a instância do usuário e o segundo é um array de scopes que devem ser concedidos ao token do usuário:

```php tab=Pest
use App\Models\User;
use Laravel\Passport\Passport;

test('orders can be created', function () {
    Passport::actingAs(
        User::factory()->create(),
        ['orders:create']
    );

    $response = $this->post('/api/orders');

    $response->assertStatus(201);
});
```

```php tab=PHPUnit
use App\Models\User;
use Laravel\Passport\Passport;

public function test_orders_can_be_created(): void
{
    Passport::actingAs(
        User::factory()->create(),
        ['orders:create']
    );

    $response = $this->post('/api/orders');

    $response->assertStatus(201);
}
```

O método `actingAsClient` do Passport pode ser usado para especificar o client atualmente autenticado, bem como seus scopes. O primeiro argumento fornecido ao método `actingAsClient` é a instância do client e o segundo é um array de scopes que devem ser concedidos ao token do client:

```php tab=Pest
use Laravel\Passport\Client;
use Laravel\Passport\Passport;

test('servers can be retrieved', function () {
    Passport::actingAsClient(
        Client::factory()->create(),
        ['servers:read']
    );

    $response = $this->get('/api/servers');

    $response->assertStatus(200);
});
```

```php tab=PHPUnit
use Laravel\Passport\Client;
use Laravel\Passport\Passport;

public function test_servers_can_be_retrieved(): void
{
    Passport::actingAsClient(
        Client::factory()->create(),
        ['servers:read']
    );

    $response = $this->get('/api/servers');

    $response->assertStatus(200);
}
```
