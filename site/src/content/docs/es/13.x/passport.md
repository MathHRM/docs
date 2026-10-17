---
title: "Pasaporte Laravel"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
    - [¿Pasaporte o Santuario?](#passport-or-sanctum)
- [Instalación](#installation)
    - [Implementación de Passport](#deploying-passport)
    - [Actualización de Pasaporte](#upgrading-passport)
- [Configuración](#configuration)
    - [Vida útil del token](#token-lifetimes)
    - [Anulación de modelos predeterminados](#overriding-default-models)
    - [Anulación de rutas](#overriding-routes)
- [Código de autorización Grant](#authorization-code-grant)
    - [Gestión de Clientes](#managing-clients)
    - [Solicitando tokens](#requesting-tokens)
    - [Gestión de tokens](#managing-tokens)
    - [Fichas refrescantes](#refreshing-tokens)
    - [Revocando tokens](#revoking-tokens)
    - [Fichas de purga](#purging-tokens)
- [Concesión de código de autorización con PKCE](#code-grant-pkce)
    - [Creando el Cliente](#creating-a-auth-pkce-grant-client)
    - [Solicitando tokens](#requesting-auth-pkce-grant-tokens)
- [Concesión de autorización de dispositivo](#device-authorization-grant)
    - [Creación de un cliente de concesión de autorización de dispositivo](#creating-a-device-authorization-grant-client)
    - [Solicitando tokens](#requesting-device-authorization-grant-tokens)
- [Contraseña Grant](#password-grant)
    - [Creación de un cliente de concesión de contraseña](#creating-a-password-grant-client)
    - [Solicitando tokens](#requesting-password-grant-tokens)
    - [Solicitando todos los alcances](#requesting-all-scopes)
    - [Personalizar el Proveedor de Usuario](#customizing-the-user-provider)
    - [Personalizar el campo Nombre de usuario](#customizing-the-username-field)
    - [Personalizar la validación de contraseña](#customizing-the-password-validation)
- [Concesión implícita](#implicit-grant)
- [Concesión de credenciales de cliente](#client-credentials-grant)
    - [Recuperando tokens](#retrieving-tokens)
- [Fichas de acceso personal](#personal-access-tokens)
    - [Creación de un cliente de acceso personal](#creating-a-personal-access-client)
    - [Personalizar el Proveedor de Usuario](#customizing-the-user-provider-for-pat)
    - [Gestión de tokens de acceso personal](#managing-personal-access-tokens)
- [Protegiendo Rutas](#protecting-routes)
    - [A través de Middleware](#via-middleware)
    - [Pasando el Token de Acceso](#passing-the-access-token)
- [Alcances de token](#token-scopes)
    - [Definición de alcances](#defining-scopes)
    - [Alcance predeterminado](#default-scope)
    - [Asignación de ámbitos a tokens](#assigning-scopes-to-tokens)
    - [Comprobación de alcances](#checking-scopes)
- [Autenticación SPA](#spa-authentication)
- [Eventos](#events)
- [Prueba](#testing)

<a id="introduction"></a>
## Introducción

[Laravel Passport](https://github.com/laravel/passport) proporciona una implementación completa del servidor OAuth2 para su aplicación Laravel en cuestión de minutos. Passport está construido sobre el [servidor League OAuth2](https://github.com/thephpleague/oauth2-server) mantenido por Andy Millington y Simon Hamp.

> **Nota:**
> Esta documentación supone que ya está familiarizado con OAuth2. Si no sabe nada sobre OAuth2, considere familiarizarse con la [terminología](https://oauth2.thephpleague.com/terminology/) general y las características de OAuth2 antes de continuar.

<a id="passport-or-sanctum"></a>
### ¿Pasaporte o Santuario?

Antes de comenzar, es posible que desee determinar si su solicitud sería mejor atendida por Laravel Passport o [Laravel Sanctum](../sanctum/). Si es absolutamente necesario que su aplicación sea compatible con OAuth2, entonces debería utilizar Laravel Passport.

Sin embargo, si intenta autenticar una aplicación de una sola página, una aplicación móvil o emitir tokens API, debe usar [Laravel Sanctum](../sanctum/). Laravel Sanctum no es compatible con OAuth2; sin embargo, proporciona una experiencia de desarrollo de autenticación API mucho más sencilla.

<a id="installation"></a>
## Instalación

Puede instalar Laravel Passport mediante el comando `install:api` Artisan:

```shell
php artisan install:api --passport
```

Este comando publicará y ejecutará las migraciones de bases de datos necesarias para crear las tablas que su aplicación necesita para almacenar clientes OAuth2 y tokens de acceso. El comando también creará las claves de cifrado necesarias para generar tokens de acceso seguro.

Después de ejecutar el comando `install:api`, agregue el rasgo `Laravel\Passport\HasApiTokens` y la interfaz `Laravel\Passport\Contracts\OAuthenticatable` a su modelo `App\Models\User`. Este rasgo proporcionará algunos métodos de ayuda para su modelo que le permitirán inspeccionar el token y los alcances del usuario autenticado:

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

Finalmente, en el archivo de configuración `config/auth.php` de su aplicación, debe definir una protección de autenticación `api` y configurar la opción `driver` en `passport`. Esto le indicará a su aplicación que use `TokenGuard` de Passport al autenticar solicitudes API entrantes:

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
### Implementación de Pasaporte

Al implementar Passport en los servidores de su aplicación por primera vez, probablemente necesitará ejecutar el comando `passport:keys`. Este comando genera las claves de cifrado que Passport necesita para generar tokens de acceso. Las claves generadas normalmente no se mantienen en el control de código fuente:

```shell
php artisan passport:keys
```

Si es necesario, puede definir la ruta desde donde se deben cargar las claves de Passport. Puede utilizar el método `Passport::loadKeysFrom` para lograr esto. Normalmente, este método debe llamarse desde el método `boot` de la clase `App\Providers\AppServiceProvider` de su aplicación:

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
#### Cargando claves desde el entorno

Alternativamente, puede publicar el archivo de configuración de Passport usando el comando `vendor:publish` Artisan:

```shell
php artisan vendor:publish --tag=passport-config
```

Una vez publicado el archivo de configuración, puede cargar las claves de cifrado de su aplicación definiéndolas como variables de entorno:

```ini
PASSPORT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
<private key here>
-----END RSA PRIVATE KEY-----"

PASSPORT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
<public key here>
-----END PUBLIC KEY-----"
```

<a id="upgrading-passport"></a>
### Actualización de pasaporte

Al actualizar a una nueva versión principal de Passport, es importante que revise cuidadosamente [la guía de actualización](https://github.com/laravel/passport/blob/master/UPGRADE.md).

<a id="configuration"></a>
## Configuración

<a id="token-lifetimes"></a>
### Vida útil de los tokens

De forma predeterminada, Passport emite tokens de acceso de larga duración que caducan después de un año. Si desea configurar una vida útil del token más larga o más corta, puede utilizar los métodos `tokensExpireIn`, `refreshTokensExpireIn` y `personalAccessTokensExpireIn`. Estos métodos deben llamarse desde el método `boot` de la clase `App\Providers\AppServiceProvider` de su aplicación:

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

> **Advertencia:**
> Las columnas `expires_at` en las tablas de la base de datos de Passport son de solo lectura y solo para fines de visualización. Al emitir tokens, Passport almacena la información de vencimiento dentro de los tokens firmados y cifrados. Si necesita invalidar un token, debe [revocarlo](#revoking-tokens).

<a id="overriding-default-models"></a>
### Anulación de modelos predeterminados

Usted es libre de ampliar los modelos utilizados internamente por Passport definiendo su propio modelo y ampliando el modelo de Passport correspondiente:

```php
use Laravel\Passport\Client as PassportClient;

class Client extends PassportClient
{
    // ...
}
```

Después de definir su modelo, puede indicarle a Passport que use su modelo personalizado a través de la clase `Laravel\Passport\Passport`. Normalmente, debes informar a Passport sobre tus modelos personalizados en el método `boot` de la clase `App\Providers\AppServiceProvider` de tu aplicación:

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
### Anulación de rutas

A veces es posible que desee personalizar las rutas definidas por Passport. Para lograr esto, primero debe ignorar las rutas registradas por Passport agregando `Passport::ignoreRoutes` al método `register` del `AppServiceProvider` de su aplicación:

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

Luego, puedes copiar las rutas definidas por Passport en [su archivo de rutas](https://github.com/laravel/passport/blob/master/routes/web.php) al archivo `routes/web.php` de tu aplicación y modificarlas a tu gusto:

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
## Concesión de código de autorización

El uso de OAuth2 mediante códigos de autorización es la forma en que la mayoría de los desarrolladores están familiarizados con OAuth2. Cuando se utilizan códigos de autorización, una aplicación cliente redirigirá al usuario a su servidor, donde aprobará o denegará la solicitud para emitir un token de acceso al cliente.

Para comenzar, debemos indicarle a Passport cómo devolver nuestra vista de "autorización".

Toda la lógica de representación de la vista de autorización se puede personalizar utilizando los métodos apropiados disponibles a través de la clase `Laravel\Passport\Passport`. Normalmente, debes llamar a este método desde el método `boot` de la clase `App\Providers\AppServiceProvider` de tu aplicación:

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

Passport definirá automáticamente la ruta `/oauth/authorize` que devuelve esta vista. Su plantilla `auth.oauth.authorize` debe incluir un formulario que realice una solicitud POST a la ruta `passport.authorizations.approve` para aprobar la autorización y un formulario que realice una solicitud DELETE a la ruta `passport.authorizations.deny` para denegar la autorización. Las rutas `passport.authorizations.approve` y `passport.authorizations.deny` esperan los campos `state`, `client_id` y `auth_token`.

<a id="managing-clients"></a>
### Gestión de clientes

Los desarrolladores que creen aplicaciones que necesiten interactuar con la API de su aplicación deberán registrar su aplicación con la suya creando un "cliente". Normalmente, esto consiste en proporcionar el nombre de su aplicación y un URI al que su aplicación puede redirigir después de que los usuarios aprueben su solicitud de autorización.

<a id="managing-first-party-clients"></a>
#### Clientes propios

La forma más sencilla de crear un cliente es mediante el comando `passport:client` Artisan. Este comando se puede utilizar para crear clientes propios o probar la funcionalidad de OAuth2. Cuando ejecuta el comando `passport:client`, Passport le solicitará más información sobre su cliente y le proporcionará una ID de cliente y un secreto:

```shell
php artisan passport:client
```

Si desea permitir múltiples URI de redireccionamiento para su cliente, puede especificarlos usando una lista delimitada por comas cuando el comando `passport:client` le solicite el URI. Cualquier URI que contenga comas debe estar codificado como URI:

```shell
https://third-party-app.com/callback,https://example.com/oauth/redirect
```

<a id="managing-third-party-clients"></a>
#### Clientes de terceros

Dado que los usuarios de su aplicación no podrán utilizar el comando `passport:client`, puede usar el método `createAuthorizationCodeGrantClient` de la clase `Laravel\Passport\ClientRepository` para registrar un cliente para un usuario determinado:

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

El método `createAuthorizationCodeGrantClient` devuelve una instancia de `Laravel\Passport\Client`. Puede mostrar `$client->id` como ID de cliente y `$client->plainSecret` como secreto de cliente para el usuario.

<a id="requesting-tokens"></a>
### Solicitar tokens

<a id="requesting-tokens-redirecting-for-authorization"></a>
#### Redirigir para autorización

Una vez que se ha creado un cliente, los desarrolladores pueden usar su ID de cliente y su secreto para solicitar un código de autorización y un token de acceso desde su aplicación. Primero, la aplicación consumidora debe realizar una solicitud de redireccionamiento a la ruta `/oauth/authorize` de su aplicación de la siguiente manera:

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

El parámetro `prompt` se puede utilizar para especificar el comportamiento de autenticación de la aplicación Passport.

Si el valor `prompt` es `none`, Passport siempre generará un error de autenticación si el usuario aún no está autenticado con la aplicación Passport. Si el valor es `consent`, Passport siempre mostrará la pantalla de aprobación de autorización, incluso si todos los alcances se otorgaron previamente a la aplicación consumidora. Cuando el valor es `login`, la aplicación Passport siempre solicitará al usuario que vuelva a iniciar sesión en la aplicación, incluso si ya tiene una sesión existente.

Si no se proporciona ningún valor `prompt`, se solicitará autorización al usuario solo si no ha autorizado previamente el acceso a la aplicación consumidora para los ámbitos solicitados.

> **Nota:**
> Recuerde, la ruta `/oauth/authorize` ya está definida por Passport. No es necesario definir manualmente esta ruta.

<a id="approving-the-request"></a>
#### Aprobando la solicitud

Al recibir solicitudes de autorización, Passport responderá automáticamente según el valor del parámetro `prompt` (si está presente) y puede mostrar una plantilla al usuario que le permitirá aprobar o rechazar la solicitud de autorización. Si aprueban la solicitud, serán redirigidos nuevamente al `redirect_uri` especificado por la aplicación consumidora. El `redirect_uri` debe coincidir con la URL `redirect` que se especificó cuando se creó el cliente.

A veces es posible que desee omitir el mensaje de autorización, como cuando autoriza a un cliente propio. Puede lograr esto [extendiendo el modelo `Client`](#overriding-default-models) y definiendo un método `skipsAuthorization`. Si `skipsAuthorization` devuelve `true`, el cliente será aprobado y el usuario será redirigido de nuevo a `redirect_uri` inmediatamente, a menos que la aplicación consumidora haya configurado explícitamente el parámetro `prompt` al redirigir para autorización:

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
#### Conversión de códigos de autorización en tokens de acceso

Si el usuario aprueba la solicitud de autorización, será redirigido nuevamente a la aplicación consumidora. El consumidor primero debe verificar el parámetro `state` con el valor almacenado antes de la redirección. Si el parámetro de estado coincide, entonces el consumidor debe emitir una solicitud `POST` a su aplicación para solicitar un token de acceso. La solicitud debe incluir el código de autorización que emitió su aplicación cuando el usuario aprobó la solicitud de autorización:

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

Esta ruta `/oauth/token` devolverá una respuesta JSON que contiene los atributos `access_token`, `refresh_token` y `expires_in`. El atributo `expires_in` contiene el número de segundos hasta que caduque el token de acceso.

> **Nota:**
> Al igual que la ruta `/oauth/authorize`, Passport define la ruta `/oauth/token`. No es necesario definir manualmente esta ruta.

<a id="managing-tokens"></a>
### Gestión de tokens

Puede recuperar los tokens autorizados del usuario utilizando el método `tokens` del rasgo `Laravel\Passport\HasApiTokens`. Por ejemplo, esto puede usarse para ofrecer a sus usuarios un panel para realizar un seguimiento de sus conexiones con aplicaciones de terceros:

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
### Fichas refrescantes

Si su aplicación emite tokens de acceso de corta duración, los usuarios deberán actualizar sus tokens de acceso mediante el token de actualización que se les proporcionó cuando se emitió el token de acceso:

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

Esta ruta `/oauth/token` devolverá una respuesta JSON que contiene los atributos `access_token`, `refresh_token` y `expires_in`. El atributo `expires_in` contiene el número de segundos hasta que caduque el token de acceso.

<a id="revoking-tokens"></a>
### Revocar tokens

Puede revocar un token utilizando el método `revoke` en el modelo `Laravel\Passport\Token`. Puede revocar el token de actualización de un token utilizando el método `revoke` en el modelo `Laravel\Passport\RefreshToken`:

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
### Fichas de purga

Cuando los tokens hayan sido revocados o caducados, es posible que desee eliminarlos de la base de datos. El comando `passport:purge` Artisan incluido en Passport puede hacer esto por usted:

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

También puede configurar un [trabajo programado](../scheduling/) en el archivo `routes/console.php` de su aplicación para podar automáticamente sus tokens según un cronograma:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('passport:purge')->hourly();
```

<a id="code-grant-pkce"></a>
## Concesión de código de autorización con PKCE

La concesión del Código de autorización con "Clave de prueba para intercambio de código" (PKCE) es una forma segura de autenticar aplicaciones de una sola página o aplicaciones móviles para acceder a su API. Esta concesión se debe utilizar cuando no se puede garantizar que el secreto del cliente se almacenará de forma confidencial o para mitigar la amenaza de que un atacante intercepte el código de autorización. Una combinación de un "verificador de código" y un "desafío de código" reemplaza el secreto del cliente al intercambiar el código de autorización por un token de acceso.

<a id="creating-a-auth-pkce-grant-client"></a>
### Creando el cliente

Antes de que su aplicación pueda emitir tokens mediante la concesión del código de autorización con PKCE, deberá crear un cliente habilitado para PKCE. Puedes hacer esto usando el comando `passport:client` Artisan con la opción `--public`:

```shell
php artisan passport:client --public
```

<a id="requesting-auth-pkce-grant-tokens"></a>
### Solicitar tokens

<a id="code-verifier-code-challenge"></a>
#### Verificador de código y desafío de código

Como esta concesión de autorización no proporciona un secreto de cliente, los desarrolladores deberán generar una combinación de un verificador de código y un desafío de código para poder solicitar un token.

El verificador de código debe ser una cadena aleatoria de entre 43 y 128 caracteres que contenga letras, números y caracteres `"-"`, `"."`, `"_"`, `"~"`, como se define en la [especificación RFC 7636](https://tools.ietf.org/html/rfc7636).

El desafío del código debe ser una cadena codificada en Base64 con URL y caracteres seguros para el nombre de archivo. Se deben eliminar los caracteres finales `'='` y no deben aparecer saltos de línea, espacios en blanco ni otros caracteres adicionales.

```php
$encoded = base64_encode(hash('sha256', $codeVerifier, true));

$codeChallenge = strtr(rtrim($encoded, '='), '+/', '-_');
```

<a id="code-grant-pkce-redirecting-for-authorization"></a>
#### Redirigir para autorización

Una vez que se ha creado un cliente, puede usar la ID del cliente y el verificador de código generado y el desafío del código para solicitar un código de autorización y un token de acceso desde su aplicación. Primero, la aplicación consumidora debe realizar una solicitud de redireccionamiento a la ruta `/oauth/authorize` de su aplicación:

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
#### Conversión de códigos de autorización en tokens de acceso

Si el usuario aprueba la solicitud de autorización, será redirigido nuevamente a la aplicación consumidora. El consumidor debe verificar el parámetro `state` con el valor almacenado antes de la redirección, como en la concesión del código de autorización estándar.

Si el parámetro de estado coincide, el consumidor debe emitir una solicitud `POST` a su aplicación para solicitar un token de acceso. La solicitud debe incluir el código de autorización que emitió su aplicación cuando el usuario aprobó la solicitud de autorización junto con el código verificador generado originalmente:

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
## Concesión de autorización de dispositivo

La concesión de autorización de dispositivo OAuth2 permite que dispositivos de entrada limitada o sin navegador, como televisores y consolas de videojuegos, obtengan un token de acceso intercambiando un «código de dispositivo». Al utilizar este flujo, el cliente del dispositivo pedirá al usuario que utilice un dispositivo secundario, como otro equipo o un teléfono inteligente, y se conecte al servidor para introducir el «código de usuario» proporcionado y aprobar o denegar la solicitud de acceso.

Para comenzar, debemos indicarle a Passport cómo devolver nuestras vistas de "código de usuario" y "autorización".

Toda la lógica de representación de la vista de autorización se puede personalizar utilizando los métodos apropiados disponibles a través de la clase `Laravel\Passport\Passport`. Normalmente, deberías llamar a este método desde el método `boot` de la clase `App\Providers\AppServiceProvider` de tu aplicación.

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

Passport definirá automáticamente rutas que devuelvan estas vistas. Su plantilla `auth.oauth.device.user-code` debe incluir un formulario que realice una solicitud GET a la ruta `passport.device.authorizations.authorize`. La ruta `passport.device.authorizations.authorize` espera un parámetro de consulta `user_code`.

Su plantilla `auth.oauth.device.authorize` debe incluir un formulario que realice una solicitud POST a la ruta `passport.device.authorizations.approve` para aprobar la autorización y un formulario que realice una solicitud DELETE a la ruta `passport.device.authorizations.deny` para denegar la autorización. Las rutas `passport.device.authorizations.approve` y `passport.device.authorizations.deny` esperan los campos `state`, `client_id` y `auth_token`.

<a id="creating-a-device-authorization-grant-client"></a>
### Creación de un cliente de concesión de autorización de dispositivo

Antes de que su aplicación pueda emitir tokens a través de la concesión de autorización del dispositivo, deberá crear un cliente habilitado para el flujo de dispositivos. Puede hacer esto usando el comando `passport:client` Artisan con la opción `--device`. Este comando creará un cliente habilitado para el flujo de dispositivos de origen y le proporcionará una ID de cliente y un secreto:

```shell
php artisan passport:client --device
```

Además, puede utilizar el método `createDeviceAuthorizationGrantClient` en la clase `ClientRepository` para registrar un cliente de terceros que pertenece al usuario determinado:

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
### Solicitar tokens

<a id="device-code"></a>
#### Solicitar un código de dispositivo

Una vez que se ha creado un cliente, los desarrolladores pueden usar su ID de cliente para solicitar un código de dispositivo desde su aplicación. Primero, el dispositivo consumidor debe realizar una solicitud `POST` a la ruta `/oauth/device/code` de su aplicación para solicitar un código de dispositivo:

```php
use Illuminate\Support\Facades\Http;

$response = Http::asForm()->post('https://passport-app.test/oauth/device/code', [
    'client_id' => 'your-client-id',
    'scope' => 'user:read orders:create',
]);

return $response->json();
```

Esto devolverá una respuesta JSON que contiene los atributos `device_code`, `user_code`, `verification_uri`, `interval` y `expires_in`. El atributo `expires_in` contiene la cantidad de segundos hasta que caduque el código del dispositivo. El atributo `interval` contiene la cantidad de segundos que el dispositivo consumidor debe esperar entre solicitudes al sondear la ruta `/oauth/token` para evitar errores de límite de velocidad.

> **Nota:**
> Recuerde, la ruta `/oauth/device/code` ya está definida por Passport. No es necesario definir manualmente esta ruta.

<a id="user-code"></a>
#### Visualización del URI de verificación y el código de usuario

Una vez que se ha obtenido una solicitud de código de dispositivo, el dispositivo consumidor debe indicarle al usuario que use otro dispositivo y visite el `verification_uri` proporcionado e ingrese el `user_code` para aprobar la solicitud de autorización.

<a id="polling-token-request"></a>
#### Solicitud de token de sondeo

Dado que el usuario utilizará un dispositivo separado para otorgar (o denegar) el acceso, el dispositivo consumidor debe sondear la ruta `/oauth/token` de su aplicación para determinar cuándo el usuario respondió a la solicitud. El dispositivo consumidor debe utilizar el sondeo mínimo `interval` proporcionado en la respuesta JSON al solicitar el código del dispositivo para evitar errores de límite de velocidad:

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

Si el usuario aprobó la solicitud de autorización, se devolverá una respuesta JSON que contiene los atributos `access_token`, `refresh_token` y `expires_in`. El atributo `expires_in` contiene el número de segundos hasta que caduque el token de acceso.

<a id="password-grant"></a>
## Concesión de contraseña

> **Advertencia:**
> Ya no recomendamos el uso de tokens de concesión de contraseña. En su lugar, debe elegir [un tipo de concesión recomendado actualmente por OAuth2 Server](https://oauth2.thephpleague.com/authorization-server/which-grant/).

La concesión de contraseña de OAuth2 permite a sus otros clientes propios, como una aplicación móvil, obtener un token de acceso utilizando una dirección de correo electrónico/nombre de usuario y una contraseña. Esto le permite emitir tokens de acceso de forma segura a sus clientes propios sin necesidad de que sus usuarios pasen por todo el flujo de redireccionamiento del código de autorización OAuth2.

Para habilitar la concesión de contraseña, llame al método `enablePasswordGrant` en el método `boot` de la clase `App\Providers\AppServiceProvider` de su aplicación:

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
### Creación de un cliente de concesión de contraseña

Antes de que su aplicación pueda emitir tokens mediante la concesión de contraseña, deberá crear un cliente de concesión de contraseña. Puede hacer esto usando el comando `passport:client` Artisan con la opción `--password`.

```shell
php artisan passport:client --password
```

<a id="requesting-password-grant-tokens"></a>
### Solicitar tokens

Una vez que haya habilitado la concesión y haya creado un cliente de concesión de contraseña, puede solicitar un token de acceso emitiendo una solicitud `POST` a la ruta `/oauth/token` con la dirección de correo electrónico y la contraseña del usuario. Recuerde, esta ruta ya está registrada en Passport por lo que no es necesario definirla manualmente. Si la solicitud tiene éxito, recibirá `access_token` y `refresh_token` en la respuesta JSON del servidor:

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

> **Nota:**
> Recuerde, los tokens de acceso son de larga duración de forma predeterminada. Sin embargo, usted es libre de [configurar la vida útil máxima de su token de acceso](#configuration) si es necesario.

<a id="requesting-all-scopes"></a>
### Solicitando todos los ámbitos

Al utilizar la concesión de contraseña o la concesión de credenciales de cliente, es posible que desee autorizar el token para todos los ámbitos admitidos por su aplicación. Puede hacerlo solicitando el alcance `*`. Si solicita el alcance `*`, el método `can` en la instancia del token siempre devolverá `true`. Este alcance solo se puede asignar a un token emitido mediante la concesión `password` o `client_credentials`:

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
### Personalización del proveedor de usuarios

Si su aplicación utiliza más de un [proveedor de usuario de autenticación](../authentication/#introduction), puede especificar qué proveedor de usuario utiliza el cliente de concesión de contraseña proporcionando una opción `--provider` al crear el cliente mediante el comando `artisan passport:client --password`. El nombre del proveedor proporcionado debe coincidir con un proveedor válido definido en el archivo de configuración `config/auth.php` de su aplicación. Luego puede [proteger su ruta usando middleware](#multiple-authentication-guards) para asegurarse de que solo los usuarios del proveedor especificado de guardia estén autorizados.

<a id="customizing-the-username-field"></a>
### Personalizando el campo de nombre de usuario

Al autenticarse utilizando la concesión de contraseña, Passport utilizará el atributo `email` de su modelo autenticable como "nombre de usuario". Sin embargo, puede personalizar este comportamiento definiendo un método `findForPassport` en su modelo:

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
### Personalización de la validación de contraseña

Al autenticarse utilizando la concesión de contraseña, Passport utilizará el atributo `password` de su modelo para validar la contraseña proporcionada. Si su modelo no tiene un atributo `password` o desea personalizar la lógica de validación de contraseña, puede definir un método `validateForPassportPasswordGrant` en su modelo:

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
## Subvención implícita

> **Advertencia:**
> Ya no recomendamos el uso de tokens de concesión implícitos. En su lugar, debe elegir [un tipo de concesión recomendado actualmente por OAuth2 Server](https://oauth2.thephpleague.com/authorization-server/which-grant/).

La concesión implícita es similar a la concesión del código de autorización; sin embargo, el token se devuelve al cliente sin intercambiar un código de autorización. Esta concesión se utiliza más comúnmente para JavaScript o aplicaciones móviles donde las credenciales del cliente no se pueden almacenar de forma segura. Para habilitar la concesión, llame al método `enableImplicitGrant` en el método `boot` de la clase `App\Providers\AppServiceProvider` de su aplicación:

```php
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Passport::enableImplicitGrant();
}
```

Antes de que su aplicación pueda emitir tokens mediante la concesión implícita, deberá crear un cliente de concesión implícita. Puede hacer esto usando el comando `passport:client` Artisan con la opción `--implicit`.

```shell
php artisan passport:client --implicit
```

Una vez que se ha habilitado la concesión y se ha creado un cliente implícito, los desarrolladores pueden usar su ID de cliente para solicitar un token de acceso desde su aplicación. La aplicación consumidora debe realizar una solicitud de redireccionamiento a la ruta `/oauth/authorize` de su aplicación de la siguiente manera:

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

> **Nota:**
> Recuerde, la ruta `/oauth/authorize` ya está definida por Passport. No es necesario definir manualmente esta ruta.

<a id="client-credentials-grant"></a>
## Concesión de credenciales de cliente

La concesión de credenciales de cliente es adecuada para la autenticación de máquina a máquina. Por ejemplo, podría utilizar esta concesión en un trabajo programado que realice tareas de mantenimiento a través de una API.

Antes de que su aplicación pueda emitir tokens a través de la concesión de credenciales de cliente, deberá crear un cliente de concesión de credenciales de cliente. Puede hacer esto usando la opción `--client` del comando `passport:client` Artisan:

```shell
php artisan passport:client --client
```

A continuación, asigne el middleware `Laravel\Passport\Http\Middleware\EnsureClientIsResourceOwner` a una ruta:

```php
use Laravel\Passport\Http\Middleware\EnsureClientIsResourceOwner;

Route::get('/orders', function (Request $request) {
    // Access token is valid and the client is resource owner...
})->middleware(EnsureClientIsResourceOwner::class);
```

Para restringir el acceso a la ruta a ámbitos específicos, puede proporcionar una lista de los ámbitos requeridos al método `using`:

```php
Route::get('/orders', function (Request $request) {
    // Access token is valid, the client is resource owner, and has both "servers:read" and "servers:create" scopes...
})->middleware(EnsureClientIsResourceOwner::using('servers:read', 'servers:create'));
```

> **Advertencia:**
> El [servidor OAuth2 subyacente](https://oauth2.thephpleague.com/database-setup/#:~:text=Please%20note%20that,the%20bearer%20token.) establece el reclamo `sub` del token en el identificador del cliente para los tokens de credenciales del cliente. De forma predeterminada, Passport utiliza UUID para los clientes, por lo que no puede colisionar con la clave principal entera de un usuario. Sin embargo, si configuró `Passport::$clientUuids` en `false`, un token de credenciales de cliente puede resolver inadvertidamente un usuario cuyo ID coincide con el ID del cliente. En tales casos, el uso de este middleware no puede garantizar que el token entrante sea un token de credenciales de cliente.

<a id="retrieving-tokens"></a>
### Recuperando fichas

Para recuperar un token usando este tipo de concesión, realice una solicitud al punto final `oauth/token`:

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
## Tokens de acceso personal

A veces, es posible que los usuarios quieran emitir tokens de acceso para sí mismos sin pasar por el flujo de redireccionamiento del código de autorización típico. Permitir que los usuarios se emitan tokens a sí mismos a través de la interfaz de usuario de su aplicación puede ser útil para permitirles experimentar con su API o puede servir como un enfoque más simple para emitir tokens de acceso en general.

> **Nota:**
> Si su aplicación utiliza Passport principalmente para emitir tokens de acceso personal, considere usar [Laravel Sanctum](../sanctum/), la biblioteca propia y liviana de Laravel para emitir tokens de acceso API.

<a id="creating-a-personal-access-client"></a>
### Creando un cliente de acceso personal

Antes de que su aplicación pueda emitir tokens de acceso personal, deberá crear un cliente de acceso personal. Puede hacer esto ejecutando el comando `passport:client` Artisan con la opción `--personal`. Si ya ejecutó el comando `passport:install`, no necesita ejecutar este comando:

```shell
php artisan passport:client --personal
```

<a id="customizing-the-user-provider-for-pat"></a>
### Personalización del proveedor de usuarios

Si su aplicación utiliza más de un [proveedor de usuario de autenticación](../authentication/#introduction), puede especificar qué proveedor de usuario utiliza el cliente de concesión de acceso personal proporcionando una opción `--provider` al crear el cliente mediante el comando `artisan passport:client --personal`. El nombre del proveedor proporcionado debe coincidir con un proveedor válido definido en el archivo de configuración `config/auth.php` de su aplicación. Luego puede [proteger su ruta usando middleware](#multiple-authentication-guards) para asegurarse de que solo los usuarios del proveedor especificado de guardia estén autorizados.

<a id="managing-personal-access-tokens"></a>
### Gestión de tokens de acceso personal

Una vez que haya creado un cliente de acceso personal, puede emitir tokens para un usuario determinado utilizando el método `createToken` en la instancia del modelo `App\Models\User`. El método `createToken` acepta el nombre del token como primer argumento y una matriz opcional de [scopes](#token-scopes) como segundo argumento:

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
## Proteger rutas

<a id="via-middleware"></a>
### A través de middleware

Passport incluye un [guardia de autenticación](../authentication/#adding-custom-guards) que validará los tokens de acceso en las solicitudes entrantes. Una vez que haya configurado la protección `api` para usar el controlador `passport`, solo necesita especificar el middleware `auth:api` en cualquier ruta que requiera un token de acceso válido:

```php
Route::get('/user', function () {
    // Only API authenticated users may access this route...
})->middleware('auth:api');
```

> **Advertencia:**
> Si está utilizando [la concesión de credenciales de cliente](#client-credentials-grant), debe usar [el middleware `Laravel\Passport\Http\Middleware\EnsureClientIsResourceOwner`](#client-credentials-grant) para proteger sus rutas en lugar del middleware `auth:api`.

<a id="multiple-authentication-guards"></a>
#### Múltiples guardias de autenticación

Si su aplicación autentica diferentes tipos de usuarios que tal vez usan modelos Eloquent completamente diferentes, probablemente necesitará definir una configuración de protección para cada tipo de proveedor de usuario en su aplicación. Esto le permite proteger las solicitudes destinadas a proveedores de usuarios específicos. Por ejemplo, dada la siguiente configuración de protección, el archivo de configuración `config/auth.php`:

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

La siguiente ruta utilizará la protección `api-customers`, que utiliza el proveedor de usuario `customers`, para autenticar las solicitudes entrantes:

```php
Route::get('/customer', function () {
    // ...
})->middleware('auth:api-customers');
```

> **Nota:**
> Para obtener más información sobre el uso de proveedores de múltiples usuarios con Passport, consulte la [documentación de tokens de acceso personal](#customizing-the-user-provider-for-pat) y la [documentación de concesión de contraseña](#customizing-the-user-provider).

<a id="passing-the-access-token"></a>
### Pasando el token de acceso

Al llamar a rutas protegidas por Passport, los consumidores de API de su aplicación deben especificar su token de acceso como token `Bearer` en el encabezado `Authorization` de su solicitud. Por ejemplo, al utilizar la Fachada `Http`:

```php
use Illuminate\Support\Facades\Http;

$response = Http::withHeaders([
    'Accept' => 'application/json',
    'Authorization' => "Bearer $accessToken",
])->get('https://passport-app.test/api/user');

return $response->json();
```

<a id="token-scopes"></a>
## Alcances de tokens

Los alcances permiten a sus clientes API solicitar un conjunto específico de permisos cuando solicitan autorización para acceder a una cuenta. Por ejemplo, si está creando una aplicación de comercio electrónico, no todos los consumidores de API necesitarán la capacidad de realizar pedidos. En su lugar, puede permitir que los consumidores solo soliciten autorización para acceder a los estados de envío de los pedidos. En otras palabras, los ámbitos permiten a los usuarios de su aplicación limitar las acciones que una aplicación de terceros puede realizar en su nombre.

<a id="defining-scopes"></a>
### Definición de alcances

Puede definir los alcances de su API utilizando el método `Passport::tokensCan` en el método `boot` de la clase `App\Providers\AppServiceProvider` de su aplicación. El método `tokensCan` acepta una serie de nombres de alcance y descripciones de alcance. La descripción del alcance puede ser cualquier cosa que desee y se mostrará a los usuarios en la pantalla de aprobación de autorización:

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
### Alcance predeterminado

Si un cliente no solicita ningún ámbito específico, puede configurar su servidor Passport para adjuntar ámbitos predeterminados al token utilizando el método `defaultScopes`. Normalmente, debes llamar a este método desde el método `boot` de la clase `App\Providers\AppServiceProvider` de tu aplicación:

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
### Asignación de alcances a tokens

<a id="when-requesting-authorization-codes"></a>
#### Al solicitar códigos de autorización

Al solicitar un token de acceso mediante la concesión del código de autorización, los consumidores deben especificar los alcances deseados como el parámetro de cadena de consulta `scope`. El parámetro `scope` debe ser una lista de ámbitos delimitada por espacios:

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
#### Al emitir tokens de acceso personal

Si está emitiendo tokens de acceso personal utilizando el método `createToken` del modelo `App\Models\User`, puede pasar la matriz de ámbitos deseados como segundo argumento del método:

```php
$token = $user->createToken('My Token', ['orders:create'])->accessToken;
```

<a id="checking-scopes"></a>
### Comprobando alcances

Passport incluye dos middleware que se pueden usar para verificar que una solicitud entrante esté autenticada con un token al que se le ha otorgado un alcance determinado.

<a id="check-for-all-scopes"></a>
#### Verificar todos los ámbitos

El middleware `Laravel\Passport\Http\Middleware\CheckToken` se puede asignar a una ruta para verificar que el token de acceso de la solicitud entrante tenga todos los alcances enumerados:

```php
use Laravel\Passport\Http\Middleware\CheckToken;

Route::get('/orders', function () {
    // Access token has both "orders:read" and "orders:create" scopes...
})->middleware(['auth:api', CheckToken::using('orders:read', 'orders:create')]);
```

<a id="check-for-any-scopes"></a>
#### Verifique si hay alcances

El middleware `Laravel\Passport\Http\Middleware\CheckTokenForAnyScope` se puede asignar a una ruta para verificar que el token de acceso de la solicitud entrante tenga *al menos uno* de los alcances enumerados:

```php
use Laravel\Passport\Http\Middleware\CheckTokenForAnyScope;

Route::get('/orders', function () {
    // Access token has either "orders:read" or "orders:create" scope...
})->middleware(['auth:api', CheckTokenForAnyScope::using('orders:read', 'orders:create')]);
```

<a id="scope-attributes"></a>
#### Atributos de alcance

Si su aplicación usa [atributos de middleware del controlador ](../controllers/#middleware-attributes), puede usar el atributo `Laravel\Passport\Attributes\AuthorizeToken` como un acceso directo conveniente para el middleware de alcance de Passport:

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

De forma predeterminada, el atributo `AuthorizeToken` requiere todos los ámbitos indicados. Si pasa `anyScope: true`, la solicitud se autoriza cuando el token tiene al menos uno de los alcances indicados.

<a id="checking-scopes-on-a-token-instance"></a>
#### Comprobación de alcances en una instancia de token

Una vez que una solicitud autenticada de token de acceso haya ingresado a su aplicación, aún puede verificar si el token tiene un alcance determinado utilizando el método `tokenCan` en la instancia `App\Models\User` autenticada:

```php
use Illuminate\Http\Request;

Route::get('/orders', function (Request $request) {
    if ($request->user()->tokenCan('orders:create')) {
        // ...
    }
});
```

<a id="additional-scope-methods"></a>
#### Métodos de alcance adicionales

El método `scopeIds` devolverá una matriz de todos los ID/nombres definidos:

```php
use Laravel\Passport\Passport;

Passport::scopeIds();
```

El método `scopes` devolverá una matriz de todos los ámbitos definidos como instancias de `Laravel\Passport\Scope`:

```php
Passport::scopes();
```

El método `scopesFor` devolverá una matriz de instancias de `Laravel\Passport\Scope` que coinciden con los ID/nombres proporcionados:

```php
Passport::scopesFor(['user:read', 'orders:create']);
```

Puede determinar si un alcance determinado se ha definido utilizando el método `hasScope`:

```php
Passport::hasScope('orders:create');
```

<a id="spa-authentication"></a>
## Autenticación SPA

Al crear una API, puede resultar extremadamente útil poder consumir su propia API desde su aplicación JavaScript. Este enfoque para el desarrollo de API permite que su propia aplicación consuma la misma API que comparte con el mundo. La misma API puede ser consumida por su aplicación web, aplicaciones móviles, aplicaciones de terceros y cualquier SDK que pueda publicar en varios administradores de paquetes.

Normalmente, si desea consumir su API desde su aplicación JavaScript, deberá enviar manualmente un token de acceso a la aplicación y pasarlo con cada solicitud a su aplicación. Sin embargo, Passport incluye un middleware que puede manejar esto por usted. Todo lo que necesita hacer es agregar el middleware `CreateFreshApiToken` al grupo de middleware `web` en el archivo `bootstrap/app.php` de su aplicación:

```php
use Laravel\Passport\Http\Middleware\CreateFreshApiToken;

->withMiddleware(function (Middleware $middleware): void {
    $middleware->web(append: [
        CreateFreshApiToken::class,
    ]);
})
```

> **Advertencia:**
> Debe asegurarse de que el middleware `CreateFreshApiToken` sea el último middleware incluido en su pila de middleware.

Este middleware adjuntará una cookie `laravel_token` a sus respuestas salientes. Esta cookie contiene un JWT cifrado que Passport utilizará para autenticar solicitudes API desde su aplicación JavaScript. El JWT tiene una vida útil igual al valor de configuración `session.lifetime`. Ahora, dado que el navegador enviará automáticamente la cookie con todas las solicitudes posteriores, puede realizar solicitudes a la API de su aplicación sin pasar explícitamente un token de acceso:

```js
axios.get('/api/user')
    .then(response => {
        console.log(response.data);
    });
```

<a id="customizing-the-cookie-name"></a>
#### Personalización del nombre de la cookie

Si es necesario, puede personalizar el nombre de la cookie `laravel_token` utilizando el método `Passport::cookie`. Normalmente, este método debe llamarse desde el método `boot` de la clase `App\Providers\AppServiceProvider` de su aplicación:

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
#### Protección CSRF

Al utilizar este método de autenticación, deberá asegurarse de que se incluya un encabezado de token CSRF válido en sus solicitudes. El andamio predeterminado de JavaScript de Laravel incluido con la aplicación esqueleto y todos los kits de inicio incluye una instancia [Axios](https://github.com/axios/axios), que utilizará automáticamente el valor de la cookie `XSRF-TOKEN` cifrada para enviar un encabezado `X-XSRF-TOKEN` en solicitudes del mismo origen.

> **Nota:**
> Si elige enviar el encabezado `X-CSRF-TOKEN` en lugar de `X-XSRF-TOKEN`, deberá utilizar el token sin cifrar proporcionado por `csrf_token()`.

<a id="events"></a>
## Eventos

Passport genera eventos al emitir tokens de acceso y tokens de actualización. Puede [escuchar estos eventos](../events/) para podar o revocar otros tokens de acceso en su base de datos:

<div class="overflow-auto">

| Nombre del evento |
| ------------------------------------------------------ |
| `Laravel\Passport\Events\AccessTokenCreated` |
| `Laravel\Passport\Events\AccessTokenRevoked` |
| `Laravel\Passport\Events\RefreshTokenCreated` |

</div>

<a id="testing"></a>
## Pruebas

El método `actingAs` de Passport se puede utilizar para especificar el usuario actualmente autenticado, así como sus alcances. El primer argumento dado al método `actingAs` es la instancia del usuario y el segundo es una serie de alcances que se deben otorgar al token del usuario:

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

El método `actingAsClient` de Passport se puede utilizar para especificar el cliente actualmente autenticado, así como sus alcances. El primer argumento dado al método `actingAsClient` es la instancia del cliente y el segundo es una serie de alcances que se deben otorgar al token del cliente:

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
