---
title: "Laravel socialité"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Instalación](#installation)
- [Actualizando Socialite](#upgrading-socialite)
- [Configuración](#configuration)
- [Autenticación](#authentication)
    - [Enrutamiento](#routing)
    - [Autenticación y Almacenamiento](#authentication-and-storage)
    - [Acceso a ámbitos](#access-scopes)
    - [Alcances de Slack Bot](#slack-bot-scopes)
    - [Parámetros opcionales](#optional-parameters)
- [Recuperando detalles del usuario](#retrieving-user-details)
- [Prueba](#testing)

<a id="introduction"></a>
## Introducción

Además de la autenticación típica basada en formularios, Laravel también proporciona una manera sencilla y conveniente de autenticarse con proveedores de OAuth usando [Laravel Socialite](https://github.com/laravel/socialite). Actualmente, Socialite admite la autenticación a través de Facebook, X, LinkedIn, Google, GitHub, GitLab, Bitbucket y Slack.

> **Nota:**
> Los adaptadores para otras plataformas están disponibles a través del sitio web [Socialite Providers](https://socialiteproviders.com/) impulsado por la comunidad.

<a id="installation"></a>
## Instalación

Para comenzar con Socialite, use el administrador de paquetes de Composer para agregar el paquete a las dependencias de su proyecto:

```shell
composer require laravel/socialite
```

<a id="upgrading-socialite"></a>
## Actualización de la alta sociedad

Al actualizar a una nueva versión principal de Socialite, es importante que revise cuidadosamente [la guía de actualización](https://github.com/laravel/socialite/blob/master/UPGRADE.md).

<a id="configuration"></a>
## Configuración

Antes de usar Socialite, deberá agregar credenciales para los proveedores de OAuth que utiliza su aplicación. Normalmente, estas credenciales se pueden recuperar creando una "aplicación de desarrollador" dentro del panel del servicio con el que se autenticará.

Estas credenciales deben colocarse en el archivo de configuración `config/services.php` de su aplicación y deben usar la clave `facebook`, `x`, `linkedin-openid`, `google`, `github`, `gitlab`, `bitbucket`, `slack` o `slack-openid`, según los proveedores que requiera su aplicación:

```php
'github' => [
    'client_id' => env('GITHUB_CLIENT_ID'),
    'client_secret' => env('GITHUB_CLIENT_SECRET'),
    'redirect' => 'http://example.com/callback-url',
],
```

> **Nota:**
> Si la opción `redirect` contiene una ruta relativa, se resolverá automáticamente en una URL completa.

<a id="authentication"></a>
## Autenticación

<a id="routing"></a>
### Enrutamiento

Para autenticar a los usuarios utilizando un proveedor de OAuth, necesitará dos rutas: una para redirigir al usuario al proveedor de OAuth y otra para recibir la devolución de llamada del proveedor después de la autenticación. Las rutas de ejemplo siguientes demuestran la implementación de ambas rutas:

```php
use Laravel\Socialite\Socialite;

Route::get('/auth/redirect', function () {
    return Socialite::driver('github')->redirect();
});

Route::get('/auth/callback', function () {
    $user = Socialite::driver('github')->user();

    // $user->token
});
```

El método `redirect` proporcionado por la fachada `Socialite` se encarga de redirigir al usuario al proveedor de OAuth, mientras que el método `user` examinará la solicitud entrante y recuperará la información del usuario del proveedor después de haber aprobado la solicitud de autenticación.

<a id="authentication-and-storage"></a>
### Autenticación y almacenamiento

Una vez que el usuario ha sido recuperado del proveedor de OAuth, puede determinar si el usuario existe en la base de datos de su aplicación y [autenticar al usuario](../authentication/#authenticate-a-user-instance). Si el usuario no existe en la base de datos de su aplicación, normalmente creará un nuevo registro en su base de datos para representar al usuario:

```php
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Socialite;

Route::get('/auth/callback', function () {
    $githubUser = Socialite::driver('github')->user();

    $user = User::updateOrCreate([
        'github_id' => $githubUser->id,
    ], [
        'name' => $githubUser->name,
        'email' => $githubUser->email,
        'github_token' => $githubUser->token,
        'github_refresh_token' => $githubUser->refreshToken,
    ]);

    Auth::login($user);

    return redirect('/dashboard');
});
```

> **Nota:**
> Para obtener más información sobre qué información de usuario está disponible en proveedores de OAuth específicos, consulte la documentación en [recuperación de detalles del usuario](#retrieving-user-details).

<a id="access-scopes"></a>
### Ámbitos de acceso

Antes de redirigir al usuario, puede utilizar el método `scopes` para especificar los "ámbitos" que deben incluirse en la solicitud de autenticación. Este método fusionará todos los ámbitos especificados anteriormente con los ámbitos que usted especifique:

```php
use Laravel\Socialite\Socialite;

return Socialite::driver('github')
    ->scopes(['read:user', 'public_repo'])
    ->redirect();
```

Puede sobrescribir todos los ámbitos existentes en la solicitud de autenticación utilizando el método `setScopes`:

```php
return Socialite::driver('github')
    ->setScopes(['read:user', 'public_repo'])
    ->redirect();
```

<a id="slack-bot-scopes"></a>
### Visores de bots flojos

La API de Slack proporciona [diferentes tipos de tokens de acceso](https://api.slack.com/authentication/token-types), cada uno con su propio conjunto de [alcances de permiso](https://api.slack.com/scopes). Socialite es compatible con los siguientes tipos de tokens de acceso de Slack:

<div class="content-list" markdown="1">

- Bot (con el prefijo `xoxb-`)
- Usuario (con el prefijo `xoxp-`)

</div>

De forma predeterminada, el controlador `slack` generará un token `user` y al invocar el método `user` del controlador se devolverán los detalles del usuario.

Los tokens de bot son útiles principalmente si su aplicación enviará notificaciones a espacios de trabajo externos de Slack que son propiedad de los usuarios de su aplicación. Para generar un token de bot, invoque el método `asBotUser` antes de redirigir al usuario a Slack para su autenticación:

```php
return Socialite::driver('slack')
    ->asBotUser()
    ->setScopes(['chat:write', 'chat:write.public', 'chat:write.customize'])
    ->redirect();
```

Además, debes invocar el método `asBotUser` antes de invocar el método `user` después de que Slack redirija al usuario nuevamente a tu aplicación después de la autenticación:

```php
$user = Socialite::driver('slack')->asBotUser()->user();
```

Al generar un token de bot, el método `user` seguirá devolviendo una instancia de `Laravel\Socialite\Two\User`; sin embargo, solo se hidratará la propiedad `token`. Este token se puede almacenar para [enviar notificaciones a los espacios de trabajo de Slack del usuario autenticado](../notifications/#notifying-external-slack-workspaces).

<a id="optional-parameters"></a>
### Parámetros opcionales

Varios proveedores de OAuth admiten otros parámetros opcionales en la solicitud de redireccionamiento. Para incluir parámetros opcionales en la solicitud, llame al método `with` con una matriz asociativa:

```php
use Laravel\Socialite\Socialite;

return Socialite::driver('google')
    ->with(['hd' => 'example.com'])
    ->redirect();
```

> **Advertencia:**
> Cuando utilice el método `with`, tenga cuidado de no pasar ninguna palabra clave reservada como `state` o `response_type`.

<a id="retrieving-user-details"></a>
## Recuperando detalles del usuario

Después de que el usuario sea redirigido a la ruta de devolución de llamada de autenticación de su aplicación, puede recuperar los detalles del usuario utilizando el método `user` de Socialite. El objeto de usuario devuelto por el método `user` proporciona una variedad de propiedades y métodos que puede utilizar para almacenar información sobre el usuario en su propia base de datos.

Es posible que haya diferentes propiedades y métodos disponibles en este objeto dependiendo de si el proveedor de OAuth con el que se está autenticando admite OAuth 1.0 o OAuth 2.0:

```php
use Laravel\Socialite\Socialite;

Route::get('/auth/callback', function () {
    $user = Socialite::driver('github')->user();

    // OAuth 2.0 providers...
    $token = $user->token;
    $refreshToken = $user->refreshToken;
    $expiresIn = $user->expiresIn;

    // OAuth 1.0 providers...
    $token = $user->token;
    $tokenSecret = $user->tokenSecret;

    // All providers...
    $user->getId();
    $user->getNickname();
    $user->getName();
    $user->getEmail();
    $user->getAvatar();
});
```

<a id="retrieving-user-details-from-a-token-oauth2"></a>
#### Recuperar detalles de usuario de un token

Si ya tiene un token de acceso válido para un usuario, puede recuperar sus detalles de usuario utilizando el método `userFromToken` de Socialite:

```php
use Laravel\Socialite\Socialite;

$user = Socialite::driver('github')->userFromToken($token);
```

Si utiliza el inicio de sesión limitado de Facebook a través de una aplicación de iOS, Facebook devolverá un token OIDC en lugar de un token de acceso. Para recuperar los detalles del usuario del token OIDC, proporcione el nonce utilizado para iniciar el inicio de sesión en el método `userFromToken`:

```php
$user = Socialite::driver('facebook')->userFromToken($token, $nonce);
```

<a id="stateless-authentication"></a>
#### Autenticación sin estado

El método `stateless` se puede utilizar para deshabilitar la verificación del estado de la sesión. Esto es útil al agregar autenticación social a una API sin estado que no utiliza sesiones basadas en cookies:

```php
use Laravel\Socialite\Socialite;

return Socialite::driver('google')->stateless()->user();
```

<a id="testing"></a>
## Pruebas

Laravel Socialite proporciona una manera conveniente de probar los flujos de autenticación de OAuth sin realizar solicitudes reales a los proveedores de OAuth. El método `fake` le permite burlarse del comportamiento del proveedor de OAuth y definir los datos del usuario que deben devolverse.

<a id="faking-the-redirect"></a>
#### Falsificar el redireccionamiento

Para probar que su aplicación redirige correctamente a los usuarios a un proveedor de OAuth, puede invocar el método `fake` antes de realizar una solicitud a su ruta de redireccionamiento. Esto hará que Socialite devuelva una redirección a una URL de autorización falsa en lugar de redirigir al proveedor de OAuth real:

```php
use Laravel\Socialite\Socialite;

test('user is redirected to github', function () {
    Socialite::fake('github');

    $response = $this->get('/auth/github/redirect');

    $response->assertRedirect();
});
```

<a id="faking-the-callback"></a>
#### Fingir la devolución de llamada

Para probar la ruta de devolución de llamada de su aplicación, puede invocar el método `fake` y proporcionar una instancia `User` que debe devolverse cuando su aplicación solicita los detalles del usuario al proveedor. La instancia `User` se puede crear utilizando el método `fake`:

```php
use Laravel\Socialite\Socialite;
use Laravel\Socialite\Two\User;

test('user can login with github', function () {
    Socialite::fake('github', User::fake([
        'id' => 'github-123',
        'name' => 'Jason Beggs',
        'email' => 'jason@example.com',
    ]));

    $response = $this->get('/auth/github/callback');

    $response->assertRedirect('/dashboard');

    $this->assertDatabaseHas('users', [
        'name' => 'Jason Beggs',
        'email' => 'jason@example.com',
        'github_id' => 'github-123',
    ]);
});
```

De forma predeterminada, la instancia `User` incluirá valores de token OAuth falsos. Si es necesario, puede anular estos valores pasando atributos adicionales al método `fake`:

```php
$fakeUser = User::fake([
    'id' => 'github-123',
    'name' => 'Jason Beggs',
    'email' => 'jason@example.com',
    'token' => 'fake-token',
    'refreshToken' => 'fake-refresh-token',
    'expiresIn' => 3600,
    'approvedScopes' => ['read', 'write'],
]);
```

Los usuarios de OAuth 1 pueden ser falsificados utilizando la clase `Laravel\Socialite\One\User`.
