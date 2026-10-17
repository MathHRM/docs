---
title: "Laravel Fortify"
---

- [Introdução](#introduction)
    - [O que é o Fortify?](#what-is-fortify)
    - [Quando Devo Usar o Fortify?](#when-should-i-use-fortify)
- [Instalação](#installation)
    - [Recursos do Fortify](#fortify-features)
    - [Desabilitando Views](#disabling-views)
- [Autenticação](#authentication)
    - [Personalizando a Autenticação do Usuário](#customizing-user-authentication)
    - [Personalizando o Pipeline de Autenticação](#customizing-the-authentication-pipeline)
    - [Personalizando Redirecionamentos](#customizing-authentication-redirects)
- [Autenticação de Dois Fatores](#two-factor-authentication)
    - [Habilitando a Autenticação de Dois Fatores](#enabling-two-factor-authentication)
    - [Autenticando Com a Autenticação de Dois Fatores](#authenticating-with-two-factor-authentication)
    - [Desabilitando a Autenticação de Dois Fatores](#disabling-two-factor-authentication)
- [Passkeys](#passkeys)
    - [Habilitando Passkeys](#enabling-passkeys)
    - [Cliente JavaScript](#passkeys-javascript-client)
    - [Autenticando Com Passkeys](#authenticating-with-passkeys)
    - [Confirmando a Senha Com Passkeys](#confirming-password-with-passkeys)
    - [Registrando Passkeys](#registering-passkeys)
    - [Excluindo Passkeys](#deleting-passkeys)
- [Registro](#registration)
    - [Personalizando o Registro](#customizing-registration)
- [Redefinição de Senha](#password-reset)
    - [Solicitando um Link de Redefinição de Senha](#requesting-a-password-reset-link)
    - [Redefinindo a Senha](#resetting-the-password)
    - [Personalizando as Redefinições de Senha](#customizing-password-resets)
- [Verificação de E-mail](#email-verification)
    - [Protegendo Rotas](#protecting-routes)
- [Confirmação de Senha](#password-confirmation)

<a id="introduction"></a>
## Introdução

O [Laravel Fortify](https://github.com/laravel/fortify) é uma implementação de backend de autenticação agnóstica ao frontend para o Laravel. O Fortify registra as rotas e controllers necessários para implementar todos os recursos de autenticação do Laravel, incluindo login, registro, redefinição de senha, verificação de e-mail e muito mais. Após instalar o Fortify, você pode executar o comando Artisan `route:list` para ver as rotas que o Fortify registrou.

Como o Fortify não fornece sua própria interface de usuário, ele foi feito para ser combinado com a sua própria interface de usuário, que faz requisições às rotas que ele registra. Discutiremos exatamente como fazer requisições a essas rotas no restante desta documentação.

> **Nota:**
> Lembre-se, o Fortify é um pacote feito para dar a você um ponto de partida na implementação dos recursos de autenticação do Laravel. **Você não é obrigado a usá-lo.** Você sempre tem a liberdade de interagir manualmente com os serviços de autenticação do Laravel seguindo a documentação disponível na documentação de [autenticação](/pt-br/authentication/), [redefinição de senha](/pt-br/passwords/) e [verificação de e-mail](/pt-br/verification/).

<a id="what-is-fortify"></a>
### O que é o Fortify?

Como mencionado anteriormente, o Laravel Fortify é uma implementação de backend de autenticação agnóstica ao frontend para o Laravel. O Fortify registra as rotas e controllers necessários para implementar todos os recursos de autenticação do Laravel, incluindo login, registro, redefinição de senha, verificação de e-mail e muito mais.

**Você não é obrigado a usar o Fortify para usar os recursos de autenticação do Laravel.** Você sempre tem a liberdade de interagir manualmente com os serviços de autenticação do Laravel seguindo a documentação disponível na documentação de [autenticação](/pt-br/authentication/), [redefinição de senha](/pt-br/passwords/) e [verificação de e-mail](/pt-br/verification/).

Se você é novo no Laravel, pode querer explorar [nossos starter kits de aplicação](/pt-br/starter-kits/). Os starter kits de aplicação do Laravel usam o Fortify internamente para fornecer o scaffolding de autenticação da sua aplicação, que inclui uma interface de usuário construída com [Tailwind CSS](https://tailwindcss.com). Isso permite que você estude e se familiarize com os recursos de autenticação do Laravel.

O Laravel Fortify essencialmente pega as rotas e controllers dos nossos starter kits de aplicação e os oferece como um pacote que não inclui uma interface de usuário. Isso permite que você ainda faça o scaffolding rapidamente da implementação de backend da camada de autenticação da sua aplicação sem estar vinculado a nenhuma opinião específica de frontend.

<a id="when-should-i-use-fortify"></a>
### Quando Devo Usar o Fortify?

Você pode estar se perguntando quando é apropriado usar o Laravel Fortify. Primeiro, se você está usando um dos [starter kits de aplicação](/pt-br/starter-kits/) do Laravel, não precisa instalar o Laravel Fortify, pois todos os starter kits de aplicação do Laravel usam o Fortify e já fornecem uma implementação de autenticação completa.

Se você não está usando um starter kit de aplicação e sua aplicação precisa de recursos de autenticação, você tem duas opções: implementar manualmente os recursos de autenticação da sua aplicação ou usar o Laravel Fortify para fornecer a implementação de backend desses recursos.

Se você optar por instalar o Fortify, sua interface de usuário fará requisições às rotas de autenticação do Fortify que são detalhadas nesta documentação para autenticar e registrar usuários.

Se você optar por interagir manualmente com os serviços de autenticação do Laravel em vez de usar o Fortify, pode fazê-lo seguindo a documentação disponível na documentação de [autenticação](/pt-br/authentication/), [redefinição de senha](/pt-br/passwords/) e [verificação de e-mail](/pt-br/verification/).

<a id="laravel-fortify-and-laravel-sanctum"></a>
#### Laravel Fortify e Laravel Sanctum

Alguns desenvolvedores ficam confusos quanto à diferença entre o [Laravel Sanctum](/pt-br/sanctum/) e o Laravel Fortify. Como os dois pacotes resolvem dois problemas diferentes, porém relacionados, o Laravel Fortify e o Laravel Sanctum não são mutuamente exclusivos nem pacotes concorrentes.

O Laravel Sanctum se preocupa apenas com o gerenciamento de tokens de API e com a autenticação de usuários existentes usando cookies de sessão ou tokens. O Sanctum não fornece nenhuma rota que lide com registro de usuários, redefinição de senha, etc.

Se você estiver tentando construir manualmente a camada de autenticação para uma aplicação que oferece uma API ou serve como backend para uma single-page application, é totalmente possível que você utilize tanto o Laravel Fortify (para registro de usuários, redefinição de senha, etc.) quanto o Laravel Sanctum (gerenciamento de tokens de API, autenticação de sessão).

<a id="installation"></a>
## Instalação

Para começar, instale o Fortify usando o gerenciador de pacotes Composer:

```shell
composer require laravel/fortify
```

Em seguida, publique os recursos do Fortify usando o comando Artisan `fortify:install`:

```shell
php artisan fortify:install
```

Este comando publicará as actions do Fortify no seu diretório `app/Actions`, que será criado caso não exista. Além disso, o `FortifyServiceProvider`, o arquivo de configuração e todas as migrations de banco de dados necessárias serão publicados.

Em seguida, você deve migrar seu banco de dados:

```shell
php artisan migrate
```

<a id="fortify-features"></a>
### Recursos do Fortify

O arquivo de configuração `fortify` contém um array de configuração `features`. Este array define quais rotas / recursos de backend o Fortify irá expor por padrão. Recomendamos que você habilite apenas os seguintes recursos, que são os recursos básicos de autenticação fornecidos pela maioria das aplicações Laravel:

```php
'features' => [
    Features::registration(),
    Features::resetPasswords(),
    Features::emailVerification(),
],
```

<a id="disabling-views"></a>
### Desabilitando Views

Por padrão, o Fortify define rotas que têm a intenção de retornar views, como uma tela de login ou de registro. No entanto, se você está construindo uma single-page application orientada a JavaScript, pode não precisar dessas rotas. Por esse motivo, você pode desabilitar essas rotas inteiramente definindo o valor de configuração `views` dentro do arquivo de configuração `config/fortify.php` da sua aplicação como `false`:

```php
'views' => false,
```

<a id="disabling-views-and-password-reset"></a>
#### Desabilitando Views e a Redefinição de Senha

Se você optar por desabilitar as views do Fortify e for implementar recursos de redefinição de senha para sua aplicação, ainda deve definir uma rota chamada `password.reset` que seja responsável por exibir a view de "redefinir senha" da sua aplicação. Isso é necessário porque a notificação `Illuminate\Auth\Notifications\ResetPassword` do Laravel gerará a URL de redefinição de senha através da rota nomeada `password.reset`.

<a id="authentication"></a>
## Autenticação

Para começar, precisamos instruir o Fortify sobre como retornar nossa view de "login". Lembre-se, o Fortify é uma biblioteca de autenticação headless. Se você gostaria de uma implementação de frontend dos recursos de autenticação do Laravel já concluída para você, deve usar um [starter kit de aplicação](/pt-br/starter-kits/).

Toda a lógica de renderização das views de autenticação pode ser personalizada usando os métodos apropriados disponíveis na classe `Laravel\Fortify\Fortify`. Normalmente, você deve chamar este método a partir do método `boot` da classe `App\Providers\FortifyServiceProvider` da sua aplicação. O Fortify se encarregará de definir a rota `/login` que retorna esta view:

```php
use Laravel\Fortify\Fortify;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Fortify::loginView(function () {
        return view('auth.login');
    });

    // ...
}
```

Seu template de login deve incluir um formulário que faz uma requisição POST para `/login`. O endpoint `/login` espera uma string `email` / `username` e uma `password`. O nome do campo de e-mail / username deve corresponder ao valor `username` dentro do arquivo de configuração `config/fortify.php`. Além disso, um campo booleano `remember` pode ser fornecido para indicar que o usuário gostaria de usar a funcionalidade "lembrar de mim" fornecida pelo Laravel.

Se a tentativa de login for bem-sucedida, o Fortify irá redirecioná-lo para a URI configurada através da opção de configuração `home` dentro do arquivo de configuração `fortify` da sua aplicação. Se a requisição de login foi uma requisição XHR, uma resposta HTTP 200 será retornada.

Se a requisição não foi bem-sucedida, o usuário será redirecionado de volta à tela de login e os erros de validação estarão disponíveis para você através da [variável de template Blade](/pt-br/validation/#quick-displaying-the-validation-errors) compartilhada `$errors`. Ou, no caso de uma requisição XHR, os erros de validação serão retornados com a resposta HTTP 422.

<a id="customizing-user-authentication"></a>
### Personalizando a Autenticação do Usuário

O Fortify irá recuperar e autenticar automaticamente o usuário com base nas credenciais fornecidas e no guard de autenticação configurado para sua aplicação. No entanto, às vezes você pode desejar ter total personalização sobre como as credenciais de login são autenticadas e os usuários são recuperados. Felizmente, o Fortify permite que você realize isso facilmente usando o método `Fortify::authenticateUsing`.

Este método aceita uma closure que recebe a requisição HTTP recebida. A closure é responsável por validar as credenciais de login anexadas à requisição e retornar a instância de usuário associada. Se as credenciais forem inválidas ou nenhum usuário puder ser encontrado, `null` ou `false` deve ser retornado pela closure. Normalmente, este método deve ser chamado a partir do método `boot` do seu `FortifyServiceProvider`:

```php
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Laravel\Fortify\Fortify;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Fortify::authenticateUsing(function (Request $request) {
        $user = User::where('email', $request->email)->first();

        if ($user &&
            Hash::check($request->password, $user->password)) {
            return $user;
        }
    });

    // ...
}
```

<a id="authentication-guard"></a>
#### Guard de Autenticação

Você pode personalizar o guard de autenticação usado pelo Fortify dentro do arquivo de configuração `fortify` da sua aplicação. No entanto, você deve garantir que o guard configurado seja uma implementação de `Illuminate\Contracts\Auth\StatefulGuard`. Se você está tentando usar o Laravel Fortify para autenticar uma SPA, deve usar o guard `web` padrão do Laravel em combinação com o [Laravel Sanctum](https://laravel.com/docs/sanctum).

<a id="customizing-the-authentication-pipeline"></a>
### Personalizando o Pipeline de Autenticação

O Laravel Fortify autentica as requisições de login através de um pipeline de classes invocáveis. Se desejar, você pode definir um pipeline personalizado de classes pelo qual as requisições de login devem passar. Cada classe deve ter um método `__invoke` que recebe a instância `Illuminate\Http\Request` recebida e, como um [middleware](/pt-br/middleware/), uma variável `$next` que é invocada para passar a requisição para a próxima classe no pipeline.

Para definir seu pipeline personalizado, você pode usar o método `Fortify::authenticateThrough`. Este método aceita uma closure que deve retornar o array de classes pelo qual a requisição de login deve passar. Normalmente, este método deve ser chamado a partir do método `boot` da classe `App\Providers\FortifyServiceProvider` da sua aplicação.

O exemplo abaixo contém a definição de pipeline padrão que você pode usar como ponto de partida ao fazer suas próprias modificações:

```php
use Laravel\Fortify\Actions\AttemptToAuthenticate;
use Laravel\Fortify\Actions\CanonicalizeUsername;
use Laravel\Fortify\Actions\EnsureLoginIsNotThrottled;
use Laravel\Fortify\Actions\PrepareAuthenticatedSession;
use Laravel\Fortify\Actions\RedirectIfTwoFactorAuthenticatable;
use Laravel\Fortify\Features;
use Laravel\Fortify\Fortify;
use Illuminate\Http\Request;

Fortify::authenticateThrough(function (Request $request) {
    return array_filter([
            config('fortify.limiters.login') ? null : EnsureLoginIsNotThrottled::class,
            config('fortify.lowercase_usernames') ? CanonicalizeUsername::class : null,
            Features::enabled(Features::twoFactorAuthentication()) ? RedirectIfTwoFactorAuthenticatable::class : null,
            AttemptToAuthenticate::class,
            PrepareAuthenticatedSession::class,
    ]);
});
```

#### Throttling de Autenticação

Por padrão, o Fortify irá aplicar throttling às tentativas de autenticação usando o middleware `EnsureLoginIsNotThrottled`. Este middleware aplica throttling às tentativas que são exclusivas de uma combinação de username e endereço IP.

Algumas aplicações podem exigir uma abordagem diferente para o throttling das tentativas de autenticação, como aplicar throttling apenas pelo endereço IP. Portanto, o Fortify permite que você especifique seu próprio [rate limiter](/pt-br/routing/#rate-limiting) através da opção de configuração `fortify.limiters.login`. Naturalmente, essa opção de configuração está localizada no arquivo de configuração `config/fortify.php` da sua aplicação.

> **Nota:**
> Utilizar uma combinação de throttling, [autenticação de dois fatores](/pt-br/fortify/#two-factor-authentication) e um firewall de aplicação web (WAF) externo fornecerá a defesa mais robusta para os usuários legítimos da sua aplicação.

<a id="customizing-authentication-redirects"></a>
### Personalizando Redirecionamentos

Se a tentativa de login for bem-sucedida, o Fortify irá redirecioná-lo para a URI configurada através da opção de configuração `home` dentro do arquivo de configuração `fortify` da sua aplicação. Se a requisição de login foi uma requisição XHR, uma resposta HTTP 200 será retornada. Após um usuário sair da aplicação, o usuário será redirecionado para a URI `/`.

Se você precisar de personalização avançada desse comportamento, pode vincular implementações dos contracts `LoginResponse` e `LogoutResponse` ao [service container](/pt-br/container/) do Laravel. Normalmente, isso deve ser feito dentro do método `register` da classe `App\Providers\FortifyServiceProvider` da sua aplicação:

```php
use Laravel\Fortify\Contracts\LogoutResponse;

/**
 * Register any application services.
 */
public function register(): void
{
    $this->app->instance(LogoutResponse::class, new class implements LogoutResponse {
        public function toResponse($request)
        {
            return redirect('/');
        }
    });
}
```

<a id="two-factor-authentication"></a>
## Autenticação de Dois Fatores

Quando o recurso de autenticação de dois fatores do Fortify está habilitado, o usuário é obrigado a inserir um token numérico de seis dígitos durante o processo de autenticação. Este token é gerado usando uma senha de uso único baseada em tempo (TOTP) que pode ser obtida em qualquer aplicação de autenticação móvel compatível com TOTP, como o Google Authenticator.

Antes de começar, você deve primeiro garantir que o modelo `App\Models\User` da sua aplicação usa a trait `Laravel\Fortify\TwoFactorAuthenticatable`:

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    use Notifiable, TwoFactorAuthenticatable;
}
```

Em seguida, você deve construir uma tela dentro da sua aplicação onde os usuários possam gerenciar suas configurações de autenticação de dois fatores. Esta tela deve permitir que o usuário habilite e desabilite a autenticação de dois fatores, bem como regenere seus códigos de recuperação de autenticação de dois fatores.

> Por padrão, o array `features` do arquivo de configuração `fortify` instrui as configurações de autenticação de dois fatores do Fortify a exigir a confirmação de senha antes da modificação. Portanto, sua aplicação deve implementar o recurso de [confirmação de senha](#password-confirmation) do Fortify antes de continuar.

<a id="enabling-two-factor-authentication"></a>
### Habilitando a Autenticação de Dois Fatores

Para começar a habilitar a autenticação de dois fatores, sua aplicação deve fazer uma requisição POST ao endpoint `/user/two-factor-authentication` definido pelo Fortify. Se a requisição for bem-sucedida, o usuário será redirecionado de volta à URL anterior e a variável de sessão `status` será definida como `two-factor-authentication-enabled`. Você pode detectar essa variável de sessão `status` dentro dos seus templates para exibir a mensagem de sucesso apropriada. Se a requisição foi uma requisição XHR, uma resposta HTTP `200` será retornada.

Após optar por habilitar a autenticação de dois fatores, o usuário ainda deve "confirmar" sua configuração de autenticação de dois fatores fornecendo um código válido de autenticação de dois fatores. Portanto, sua mensagem de "sucesso" deve instruir o usuário de que a confirmação da autenticação de dois fatores ainda é necessária:

```html
@if (session('status') == 'two-factor-authentication-enabled')
    <div class="mb-4 font-medium text-sm">
        Please finish configuring two-factor authentication below.
    </div>
@endif
```

Em seguida, você deve exibir o QR code de autenticação de dois fatores para o usuário escanear em sua aplicação de autenticação. Se você está usando Blade para renderizar o frontend da sua aplicação, pode recuperar o SVG do QR code usando o método `twoFactorQrCodeSvg` disponível na instância do usuário:

```php
$request->user()->twoFactorQrCodeSvg();
```

Se você está construindo um frontend alimentado por JavaScript, pode fazer uma requisição XHR GET ao endpoint `/user/two-factor-qr-code` para recuperar o QR code de autenticação de dois fatores do usuário. Este endpoint retornará um objeto JSON contendo uma chave `svg`.

<a id="confirming-two-factor-authentication"></a>
#### Confirmando a Autenticação de Dois Fatores

Além de exibir o QR code de autenticação de dois fatores do usuário, você deve fornecer um campo de texto onde o usuário possa fornecer um código de autenticação válido para "confirmar" sua configuração de autenticação de dois fatores. Este código deve ser fornecido à aplicação Laravel através de uma requisição POST ao endpoint `/user/confirmed-two-factor-authentication` definido pelo Fortify.

Se a requisição for bem-sucedida, o usuário será redirecionado de volta à URL anterior e a variável de sessão `status` será definida como `two-factor-authentication-confirmed`:

```html
@if (session('status') == 'two-factor-authentication-confirmed')
    <div class="mb-4 font-medium text-sm">
        Two-factor authentication confirmed and enabled successfully.
    </div>
@endif
```

Se a requisição ao endpoint de confirmação da autenticação de dois fatores foi feita através de uma requisição XHR, uma resposta HTTP `200` será retornada.

<a id="displaying-the-recovery-codes"></a>
#### Exibindo os Códigos de Recuperação

Você também deve exibir os códigos de recuperação de dois fatores do usuário. Esses códigos de recuperação permitem que o usuário se autentique caso perca o acesso ao seu dispositivo móvel. Se você está usando Blade para renderizar o frontend da sua aplicação, pode acessar os códigos de recuperação através da instância do usuário autenticado:

```php
(array) $request->user()->recoveryCodes();
```

Se você está construindo um frontend alimentado por JavaScript, pode fazer uma requisição XHR GET ao endpoint `/user/two-factor-recovery-codes`. Este endpoint retornará um array JSON contendo os códigos de recuperação do usuário.

Para regenerar os códigos de recuperação do usuário, sua aplicação deve fazer uma requisição POST ao endpoint `/user/two-factor-recovery-codes`.

<a id="authenticating-with-two-factor-authentication"></a>
### Autenticando Com a Autenticação de Dois Fatores

Durante o processo de autenticação, o Fortify irá redirecionar automaticamente o usuário para a tela de desafio de autenticação de dois fatores da sua aplicação. No entanto, se sua aplicação estiver fazendo uma requisição de login XHR, a resposta JSON retornada após uma tentativa de autenticação bem-sucedida conterá um objeto JSON que tem uma propriedade booleana `two_factor`. Você deve inspecionar esse valor para saber se deve redirecionar para a tela de desafio de autenticação de dois fatores da sua aplicação.

Para começar a implementar a funcionalidade de autenticação de dois fatores, precisamos instruir o Fortify sobre como retornar nossa view de desafio de autenticação de dois fatores. Toda a lógica de renderização das views de autenticação do Fortify pode ser personalizada usando os métodos apropriados disponíveis na classe `Laravel\Fortify\Fortify`. Normalmente, você deve chamar este método a partir do método `boot` da classe `App\Providers\FortifyServiceProvider` da sua aplicação:

```php
use Laravel\Fortify\Fortify;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Fortify::twoFactorChallengeView(function () {
        return view('auth.two-factor-challenge');
    });

    // ...
}
```

O Fortify se encarregará de definir a rota `/two-factor-challenge` que retorna esta view. Seu template `two-factor-challenge` deve incluir um formulário que faz uma requisição POST ao endpoint `/two-factor-challenge`. A action `/two-factor-challenge` espera um campo `code` que contém um token TOTP válido ou um campo `recovery_code` que contém um dos códigos de recuperação do usuário.

Se a tentativa de login for bem-sucedida, o Fortify irá redirecionar o usuário para a URI configurada através da opção de configuração `home` dentro do arquivo de configuração `fortify` da sua aplicação. Se a requisição de login foi uma requisição XHR, uma resposta HTTP 204 será retornada.

Se a requisição não foi bem-sucedida, o usuário será redirecionado de volta à tela de desafio de dois fatores e os erros de validação estarão disponíveis para você através da [variável de template Blade](/pt-br/validation/#quick-displaying-the-validation-errors) compartilhada `$errors`. Ou, no caso de uma requisição XHR, os erros de validação serão retornados com uma resposta HTTP 422.

<a id="disabling-two-factor-authentication"></a>
### Desabilitando a Autenticação de Dois Fatores

Para desabilitar a autenticação de dois fatores, sua aplicação deve fazer uma requisição DELETE ao endpoint `/user/two-factor-authentication`. Lembre-se, os endpoints de autenticação de dois fatores do Fortify exigem [confirmação de senha](#password-confirmation) antes de serem chamados.

<a id="passkeys"></a>
## Passkeys

O Fortify suporta autenticação por passkey usando WebAuthn. As passkeys permitem que os usuários se autentiquem sem senhas usando autenticadores de plataforma, como Face ID, Touch ID, Windows Hello ou chaves de segurança de hardware.

<a id="enabling-passkeys"></a>
### Habilitando Passkeys

Para começar, garanta que o recurso `passkeys` esteja habilitado no arquivo de configuração `fortify` da sua aplicação:

```php
use Laravel\Fortify\Features;

'features' => [
    // ...
    Features::passkeys([
        'confirmPassword' => true,
    ]),
],
```

A opção `confirmPassword` determina se o Fortify exige a [confirmação de senha](#password-confirmation) antes que as passkeys possam ser registradas ou excluídas.

Em seguida, garanta que o modelo `App\Models\User` da sua aplicação implemente `Laravel\Fortify\Contracts\PasskeyUser` e use a trait `Laravel\Fortify\PasskeyAuthenticatable`:

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;

class User extends Authenticatable implements PasskeyUser
{
    use Notifiable, PasskeyAuthenticatable;
}
```

As opções de configuração de passkeys do Fortify podem ser personalizadas usando o array de configuração `passkeys` no arquivo `config/fortify.php` da sua aplicação:

```php
'passkeys' => [
    'relying_party_id' => parse_url(config('app.url'), PHP_URL_HOST),
    'allowed_origins' => [config('app.url')],
    'user_handle_secret' => config('app.key'),
    'timeout' => 60000,
],
```

> **Nota:**
> O Fortify envolve o pacote Composer `laravel/passkeys` e o configura para você. Se você está usando o recurso de passkeys do Fortify, deve configurar as passkeys usando o arquivo `config/fortify.php` da sua aplicação. Você não precisa publicar o arquivo de configuração `laravel/passkeys`, e quaisquer valores definidos lá serão sobrescritos pelo Fortify.

O `relying_party_id` deve corresponder ao domínio da sua aplicação. O array `allowed_origins` lista as origens do navegador que podem completar o registro e a autenticação de passkey. O `user_handle_secret` é usado para derivar identificadores de usuário opacos, garantindo que o mesmo usuário seja reconhecido entre os registros de passkey. A opção `timeout` controla por quanto tempo as operações de registro e autenticação de passkey podem permanecer ativas.

O Fortify aplica um rate limiter de passkeys dedicado às suas rotas de login, confirmação e registro de passkey. Se necessário, você pode personalizá-lo usando a opção de configuração `fortify.limiters.passkeys` e uma definição `RateLimiter::for(...)` correspondente.

<a id="passkeys-javascript-client"></a>
### Cliente JavaScript

Se você está construindo um frontend personalizado, incluindo uma aplicação Blade com scripts no lado do navegador, pode usar o pacote oficial [`@laravel/passkeys`](https://www.npmjs.com/package/@laravel/passkeys). Este pacote lida com as cerimônias WebAuthn do navegador e envia requisições aos endpoints de passkey do Fortify.

Instale o pacote via npm:

```shell
npm install @laravel/passkeys
```

Em seguida, você pode iniciar o registro e a verificação de passkey a partir do seu frontend:

```js
import { Passkeys } from "@laravel/passkeys";

await Passkeys.register({ name: "MacBook Pro" });
await Passkeys.verify();
```

Se sua aplicação usa URIs de endpoint de passkey personalizadas, você pode sobrepor as rotas por chamada:

```js
await Passkeys.verify({
    routes: {
        options: "/passkeys/confirm/options",
        submit: "/passkeys/confirm",
    },
});

await Passkeys.register({
    name: "MacBook Pro",
    routes: {
        options: "/user/passkeys/options",
        submit: "/user/passkeys",
    },
});
```

O pacote também fornece helpers para React, Vue e Svelte via `@laravel/passkeys/react`, `@laravel/passkeys/vue` e `@laravel/passkeys/svelte`.

<a id="authenticating-with-passkeys"></a>
### Autenticando Com Passkeys

Para autenticar um usuário com uma passkey, sua aplicação deve primeiro fazer uma requisição GET ao endpoint `/passkeys/login/options`. Este endpoint retorna as opções de desafio WebAuthn que seu frontend deve passar para `navigator.credentials.get(...)`.

Depois que o navegador retornar uma credencial, sua aplicação deve fazer uma requisição POST para `/passkeys/login` com o payload da credencial. Você também pode incluir um campo booleano `remember`.

Se a requisição for bem-sucedida, o Fortify fará o login do usuário no guard configurado e retornará um dos seguintes:

<div class="content-list" markdown="1">

- Uma resposta de redirecionamento para o destino pretendido para requisições padrão.
- Uma resposta HTTP `200` contendo um payload JSON com uma chave `redirect` para requisições XHR.

</div>

<a id="confirming-password-with-passkeys"></a>
### Confirmando a Senha Com Passkeys

Para sessões autenticadas, o Fortify fornece endpoints de confirmação de passkey que satisfazem o requisito de confirmação de senha do Laravel para a sessão atual.

Para confirmar com uma passkey, sua aplicação deve primeiro fazer uma requisição GET para `/passkeys/confirm/options`. Este endpoint retorna as opções de desafio WebAuthn que seu frontend deve passar para `navigator.credentials.get(...)`.

Depois que o navegador retornar uma credencial, sua aplicação deve fazer uma requisição POST para `/passkeys/confirm` com o payload da credencial.

Se a requisição for bem-sucedida, o Fortify marca a sessão atual como senha confirmada e retorna um dos seguintes:

<div class="content-list" markdown="1">

- Uma resposta de redirecionamento para o destino pretendido para requisições padrão.
- Uma resposta HTTP `200` contendo um payload JSON com uma chave `redirect` para requisições XHR.

</div>

<a id="registering-passkeys"></a>
### Registrando Passkeys

Para registrar uma passkey para um usuário autenticado, sua aplicação deve primeiro fazer uma requisição GET para `/user/passkeys/options`. Este endpoint retorna as opções de criação WebAuthn que seu frontend deve passar para `navigator.credentials.create(...)`.

Depois que o navegador retornar uma credencial, sua aplicação deve fazer uma requisição POST para `/user/passkeys` com um campo `name` e um campo `credential` contendo o objeto [`PublicKeyCredential`](https://developer.mozilla.org/en-US/docs/Web/API/PublicKeyCredential) serializado retornado por `navigator.credentials.create(...)`.

Se a requisição for bem-sucedida, o Fortify retornará um dos seguintes:

<div class="content-list" markdown="1">

- Uma resposta de redirecionamento de volta com um status `passkey-registered` na sessão para requisições padrão.
- Uma resposta HTTP `200` com um payload JSON contendo uma chave `status`, junto com o `id` e o `name` da passkey recém-registrada.

</div>

<a id="deleting-passkeys"></a>
### Excluindo Passkeys

Para excluir uma passkey, sua aplicação deve fazer uma requisição DELETE para `/user/passkeys/{passkey}`.

Se a requisição for bem-sucedida, o Fortify retornará um dos seguintes:

<div class="content-list" markdown="1">

- Uma resposta de redirecionamento de volta com um status `passkey-deleted` na sessão para requisições padrão.
- Uma resposta HTTP `200` com um payload JSON contendo uma chave `status` para requisições XHR.

</div>

<a id="registration"></a>
## Registro

Para começar a implementar a funcionalidade de registro da nossa aplicação, precisamos instruir o Fortify sobre como retornar nossa view de "registro". Lembre-se, o Fortify é uma biblioteca de autenticação headless. Se você gostaria de uma implementação de frontend dos recursos de autenticação do Laravel já concluída para você, deve usar um [starter kit de aplicação](/pt-br/starter-kits/).

Toda a lógica de renderização das views do Fortify pode ser personalizada usando os métodos apropriados disponíveis na classe `Laravel\Fortify\Fortify`. Normalmente, você deve chamar este método a partir do método `boot` do seu `App\Providers\FortifyServiceProvider`:

```php
use Laravel\Fortify\Fortify;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Fortify::registerView(function () {
        return view('auth.register');
    });

    // ...
}
```

O Fortify se encarregará de definir a rota `/register` que retorna esta view. Seu template `register` deve incluir um formulário que faz uma requisição POST ao endpoint `/register` definido pelo Fortify.

O endpoint `/register` espera uma string `name`, um endereço de e-mail / username em string, e campos `password` e `password_confirmation`. O nome do campo de e-mail / username deve corresponder ao valor de configuração `username` definido dentro do arquivo de configuração `fortify` da sua aplicação.

Se a tentativa de registro for bem-sucedida, o Fortify irá redirecionar o usuário para a URI configurada através da opção de configuração `home` dentro do arquivo de configuração `fortify` da sua aplicação. Se a requisição foi uma requisição XHR, uma resposta HTTP 201 será retornada.

Se a requisição não foi bem-sucedida, o usuário será redirecionado de volta à tela de registro e os erros de validação estarão disponíveis para você através da [variável de template Blade](/pt-br/validation/#quick-displaying-the-validation-errors) compartilhada `$errors`. Ou, no caso de uma requisição XHR, os erros de validação serão retornados com uma resposta HTTP 422.

<a id="customizing-registration"></a>
### Personalizando o Registro

O processo de validação e criação de usuário pode ser personalizado modificando a action `App\Actions\Fortify\CreateNewUser` que foi gerada quando você instalou o Laravel Fortify.

<a id="password-reset"></a>
## Redefinição de Senha

<a id="requesting-a-password-reset-link"></a>
### Solicitando um Link de Redefinição de Senha

Para começar a implementar a funcionalidade de redefinição de senha da nossa aplicação, precisamos instruir o Fortify sobre como retornar nossa view de "esqueci minha senha". Lembre-se, o Fortify é uma biblioteca de autenticação headless. Se você gostaria de uma implementação de frontend dos recursos de autenticação do Laravel já concluída para você, deve usar um [starter kit de aplicação](/pt-br/starter-kits/).

Toda a lógica de renderização das views do Fortify pode ser personalizada usando os métodos apropriados disponíveis na classe `Laravel\Fortify\Fortify`. Normalmente, você deve chamar este método a partir do método `boot` da classe `App\Providers\FortifyServiceProvider` da sua aplicação:

```php
use Laravel\Fortify\Fortify;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Fortify::requestPasswordResetLinkView(function () {
        return view('auth.forgot-password');
    });

    // ...
}
```

O Fortify se encarregará de definir o endpoint `/forgot-password` que retorna esta view. Seu template `forgot-password` deve incluir um formulário que faz uma requisição POST ao endpoint `/forgot-password`.

O endpoint `/forgot-password` espera um campo `email` em string. O nome deste campo / coluna do banco de dados deve corresponder ao valor de configuração `email` dentro do arquivo de configuração `fortify` da sua aplicação.

<a id="handling-the-password-reset-link-request-response"></a>
#### Tratando a Resposta da Requisição do Link de Redefinição de Senha

Se a requisição do link de redefinição de senha for bem-sucedida, o Fortify irá redirecionar o usuário de volta ao endpoint `/forgot-password` e enviar um e-mail ao usuário com um link seguro que ele pode usar para redefinir sua senha. Se a requisição foi uma requisição XHR, uma resposta HTTP 200 será retornada.

Após ser redirecionado de volta ao endpoint `/forgot-password` após uma requisição bem-sucedida, a variável de sessão `status` pode ser usada para exibir o status da tentativa de requisição do link de redefinição de senha.

O valor da variável de sessão `$status` corresponderá a uma das strings de tradução definidas no [arquivo de linguagem](/pt-br/localization/) `passwords` da sua aplicação. Se você gostaria de personalizar esse valor e ainda não publicou os arquivos de linguagem do Laravel, pode fazê-lo através do comando Artisan `lang:publish`:

```html
@if (session('status'))
    <div class="mb-4 font-medium text-sm text-green-600">
        {{ session('status') }}
    </div>
@endif
```

Se a requisição não foi bem-sucedida, o usuário será redirecionado de volta à tela de requisição do link de redefinição de senha e os erros de validação estarão disponíveis para você através da [variável de template Blade](/pt-br/validation/#quick-displaying-the-validation-errors) compartilhada `$errors`. Ou, no caso de uma requisição XHR, os erros de validação serão retornados com uma resposta HTTP 422.

<a id="resetting-the-password"></a>
### Redefinindo a Senha

Para finalizar a implementação da funcionalidade de redefinição de senha da nossa aplicação, precisamos instruir o Fortify sobre como retornar nossa view de "redefinir senha".

Toda a lógica de renderização das views do Fortify pode ser personalizada usando os métodos apropriados disponíveis na classe `Laravel\Fortify\Fortify`. Normalmente, você deve chamar este método a partir do método `boot` da classe `App\Providers\FortifyServiceProvider` da sua aplicação:

```php
use Laravel\Fortify\Fortify;
use Illuminate\Http\Request;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Fortify::resetPasswordView(function (Request $request) {
        return view('auth.reset-password', ['request' => $request]);
    });

    // ...
}
```

O Fortify se encarregará de definir a rota para exibir esta view. Seu template `reset-password` deve incluir um formulário que faz uma requisição POST para `/reset-password`.

O endpoint `/reset-password` espera um campo `email` em string, um campo `password`, um campo `password_confirmation` e um campo oculto chamado `token` que contém o valor de `request()->route('token')`. O nome do campo "email" / coluna do banco de dados deve corresponder ao valor de configuração `email` definido dentro do arquivo de configuração `fortify` da sua aplicação.

<a id="handling-the-password-reset-response"></a>
#### Tratando a Resposta da Redefinição de Senha

Se a requisição de redefinição de senha for bem-sucedida, o Fortify irá redirecionar de volta para a rota `/login` para que o usuário possa fazer login com sua nova senha. Além disso, uma variável de sessão `status` será definida para que você possa exibir o status de sucesso da redefinição na sua tela de login:

```blade
@if (session('status'))
    <div class="mb-4 font-medium text-sm text-green-600">
        {{ session('status') }}
    </div>
@endif
```

Se a requisição foi uma requisição XHR, uma resposta HTTP 200 será retornada.

Se a requisição não foi bem-sucedida, o usuário será redirecionado de volta à tela de redefinição de senha e os erros de validação estarão disponíveis para você através da [variável de template Blade](/pt-br/validation/#quick-displaying-the-validation-errors) compartilhada `$errors`. Ou, no caso de uma requisição XHR, os erros de validação serão retornados com uma resposta HTTP 422.

<a id="customizing-password-resets"></a>
### Personalizando as Redefinições de Senha

O processo de redefinição de senha pode ser personalizado modificando a action `App\Actions\Fortify\ResetUserPassword` que foi gerada quando você instalou o Laravel Fortify.

<a id="email-verification"></a>
## Verificação de E-mail

Após o registro, você pode desejar que os usuários verifiquem seu endereço de e-mail antes de continuarem acessando sua aplicação. Para começar, garanta que o recurso `emailVerification` esteja habilitado no array `features` do seu arquivo de configuração `fortify`. Em seguida, você deve garantir que sua classe `App\Models\User` implemente a interface `Illuminate\Contracts\Auth\MustVerifyEmail`.

Uma vez concluídas essas duas etapas de configuração, os usuários recém-registrados receberão um e-mail solicitando que verifiquem a posse do seu endereço de e-mail. No entanto, precisamos informar ao Fortify como exibir a tela de verificação de e-mail que informa ao usuário que ele precisa clicar no link de verificação no e-mail.

Toda a lógica de renderização das views do Fortify pode ser personalizada usando os métodos apropriados disponíveis na classe `Laravel\Fortify\Fortify`. Normalmente, você deve chamar este método a partir do método `boot` da classe `App\Providers\FortifyServiceProvider` da sua aplicação:

```php
use Laravel\Fortify\Fortify;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Fortify::verifyEmailView(function () {
        return view('auth.verify-email');
    });

    // ...
}
```

O Fortify se encarregará de definir a rota que exibe esta view quando um usuário é redirecionado para o endpoint `/email/verify` pelo middleware `verified` embutido do Laravel.

Seu template `verify-email` deve incluir uma mensagem informativa instruindo o usuário a clicar no link de verificação de e-mail que foi enviado para seu endereço de e-mail.

<a id="resending-email-verification-links"></a>
#### Reenviando Links de Verificação de E-mail

Se desejar, você pode adicionar um botão ao template `verify-email` da sua aplicação que dispara uma requisição POST ao endpoint `/email/verification-notification`. Quando este endpoint recebe uma requisição, um novo link de e-mail de verificação será enviado por e-mail ao usuário, permitindo que ele obtenha um novo link de verificação caso o anterior tenha sido acidentalmente excluído ou perdido.

Se a requisição para reenviar o e-mail do link de verificação for bem-sucedida, o Fortify irá redirecionar o usuário de volta ao endpoint `/email/verify` com uma variável de sessão `status`, permitindo que você exiba uma mensagem informativa ao usuário informando que a operação foi bem-sucedida. Se a requisição foi uma requisição XHR, uma resposta HTTP 202 será retornada:

```blade
@if (session('status') == 'verification-link-sent')
    <div class="mb-4 font-medium text-sm text-green-600">
        A new email verification link has been emailed to you!
    </div>
@endif
```

<a id="protecting-routes"></a>
### Protegendo Rotas

Para especificar que uma rota ou grupo de rotas exige que o usuário tenha verificado seu endereço de e-mail, você deve anexar o middleware `verified` embutido do Laravel à rota. O alias do middleware `verified` é registrado automaticamente pelo Laravel e serve como um alias para o middleware `Illuminate\Auth\Middleware\EnsureEmailIsVerified`:

```php
Route::get('/dashboard', function () {
    // ...
})->middleware(['verified']);
```

<a id="password-confirmation"></a>
## Confirmação de Senha

Ao construir sua aplicação, você pode ocasionalmente ter actions que devem exigir que o usuário confirme sua senha antes que a action seja executada. Normalmente, essas rotas são protegidas pelo middleware `password.confirm` embutido do Laravel.

Para começar a implementar a funcionalidade de confirmação de senha, precisamos instruir o Fortify sobre como retornar a view de "confirmação de senha" da nossa aplicação. Lembre-se, o Fortify é uma biblioteca de autenticação headless. Se você gostaria de uma implementação de frontend dos recursos de autenticação do Laravel já concluída para você, deve usar um [starter kit de aplicação](/pt-br/starter-kits/).

Toda a lógica de renderização das views do Fortify pode ser personalizada usando os métodos apropriados disponíveis na classe `Laravel\Fortify\Fortify`. Normalmente, você deve chamar este método a partir do método `boot` da classe `App\Providers\FortifyServiceProvider` da sua aplicação:

```php
use Laravel\Fortify\Fortify;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Fortify::confirmPasswordView(function () {
        return view('auth.confirm-password');
    });

    // ...
}
```

O Fortify se encarregará de definir o endpoint `/user/confirm-password` que retorna esta view. Seu template `confirm-password` deve incluir um formulário que faz uma requisição POST ao endpoint `/user/confirm-password`. O endpoint `/user/confirm-password` espera um campo `password` que contém a senha atual do usuário.

Se a senha corresponder à senha atual do usuário, o Fortify irá redirecionar o usuário para a rota que ele estava tentando acessar. Se a requisição foi uma requisição XHR, uma resposta HTTP 201 será retornada.

Se a requisição não foi bem-sucedida, o usuário será redirecionado de volta à tela de confirmação de senha e os erros de validação estarão disponíveis para você através da variável de template Blade compartilhada `$errors`. Ou, no caso de uma requisição XHR, os erros de validação serão retornados com uma resposta HTTP 422.
