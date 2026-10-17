---
title: "Sanctum de Laravel"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
    - [Cómo funciona](#how-it-works)
- [Instalación](#installation)
- [Configuración](#configuration)
    - [Anulación de modelos predeterminados](#overriding-default-models)
- [Autenticación de token API](#api-token-authentication)
    - [Emisión de tokens API](#issuing-api-tokens)
    - [Habilidades simbólicas](#token-abilities)
    - [Protegiendo Rutas](#protecting-routes)
    - [Revocando tokens](#revoking-tokens)
    - [Caducidad del token](#token-expiration)
- [Autenticación SPA](#spa-authentication)
    - [Configuración](#spa-configuration)
    - [Autenticando](#spa-authenticating)
    - [Protegiendo Rutas](#protecting-spa-routes)
    - [Autorización de canales de transmisión privados](#authorizing-private-broadcast-channels)
- [Autenticación de aplicaciones móviles](#mobile-application-authentication)
    - [Emisión de tokens API](#issuing-mobile-api-tokens)
    - [Protegiendo Rutas](#protecting-mobile-api-routes)
    - [Revocando tokens](#revoking-mobile-api-tokens)
- [Prueba](#testing)

<a id="introduction"></a>
## Introducción

[Laravel Sanctum](https://github.com/laravel/sanctum) proporciona un sistema de autenticación liviano para SPA (aplicaciones de una sola página), aplicaciones móviles y API simples basadas en tokens. Sanctum permite que cada usuario de su aplicación genere múltiples tokens API para su cuenta. A estos tokens se les pueden otorgar habilidades/alcances que especifican qué acciones pueden realizar los tokens.

<a id="how-it-works"></a>
### Cómo funciona

Laravel Sanctum existe para resolver dos problemas distintos. Analicemos cada uno de ellos antes de profundizar en la biblioteca.

<a id="how-it-works-api-tokens"></a>
#### Fichas API

En primer lugar, Sanctum es un paquete sencillo que puede utilizar para emitir tokens API a sus usuarios sin la complicación de OAuth. Esta característica está inspirada en GitHub y otras aplicaciones que emiten "tokens de acceso personal". Por ejemplo, imagine que la "configuración de la cuenta" de su aplicación tiene una pantalla donde un usuario puede generar un token API para su cuenta. Puede utilizar Sanctum para generar y administrar esos tokens. Estos tokens suelen tener un tiempo de caducidad muy largo (años), pero el usuario puede revocarlos manualmente en cualquier momento.

Laravel Sanctum ofrece esta característica almacenando tokens API de usuario en una única tabla de base de datos y autenticando solicitudes HTTP entrantes a través del encabezado `Authorization` que debe contener un token API válido.

<a id="how-it-works-spa-authentication"></a>
#### Autenticación SPA

En segundo lugar, Sanctum existe para ofrecer una forma sencilla de autenticar aplicaciones de una sola página (SPA) que necesitan comunicarse con una API basada en Laravel. Estos SPA pueden existir en el mismo repositorio que su aplicación Laravel o pueden ser un repositorio completamente separado, como un SPA creado con Next.js o Nuxt.

Para esta función, Sanctum no utiliza tokens de ningún tipo. En cambio, Sanctum utiliza los servicios de autenticación de sesión basados ​​en cookies integrados de Laravel. Normalmente, Sanctum utiliza el protector de autenticación `web` de Laravel para lograr esto. Esto proporciona los beneficios de la protección CSRF, la autenticación de sesión y también protege contra la fuga de las credenciales de autenticación a través de XSS.

Sanctum solo intentará autenticarse mediante cookies cuando la solicitud entrante se origine en su propia interfaz de SPA. Cuando Sanctum examina una solicitud HTTP entrante, primero buscará una cookie de autenticación y, si no hay ninguna, Sanctum examinará el encabezado `Authorization` en busca de un token API válido.

> **Nota:**
> Está perfectamente bien usar Sanctum solo para la autenticación de token API o solo para la autenticación SPA. El hecho de que utilice Sanctum no significa que deba utilizar ambas funciones que ofrece.

<a id="installation"></a>
## Instalación

Puede instalar Laravel Sanctum mediante el comando `install:api` Artisan:

```shell
php artisan install:api
```

A continuación, si planea utilizar Sanctum para autenticar un SPA, consulte la sección [Autenticación de SPA](#spa-authentication) de esta documentación.

<a id="configuration"></a>
## Configuración

<a id="overriding-default-models"></a>
### Anulación de modelos predeterminados

Aunque normalmente no es necesario, puede ampliar el modelo `PersonalAccessToken` utilizado internamente por Sanctum:

```php
use Laravel\Sanctum\PersonalAccessToken as SanctumPersonalAccessToken;

class PersonalAccessToken extends SanctumPersonalAccessToken
{
    // ...
}
```

Luego, puede indicarle a Sanctum que use su modelo personalizado mediante el método `usePersonalAccessTokenModel` proporcionado por Sanctum. Normalmente, deberías llamar a este método en el método `boot` del archivo `AppServiceProvider` de tu aplicación:

```php
use App\Models\Sanctum\PersonalAccessToken;
use Laravel\Sanctum\Sanctum;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Sanctum::usePersonalAccessTokenModel(PersonalAccessToken::class);
}
```

<a id="api-token-authentication"></a>
## Autenticación de token API

> **Nota:**
> No debe utilizar tokens API para autenticar su propio SPA propio. En su lugar, utilice las funciones de autenticación SPA integradas de Sanctum](#spa-authentication).

<a id="issuing-api-tokens"></a>
### Emitir tokens API

Sanctum le permite emitir tokens de API/tokens de acceso personal que pueden usarse para autenticar solicitudes de API en su aplicación. Al realizar solicitudes utilizando tokens API, el token debe incluirse en el encabezado `Authorization` como token `Bearer`.

Para comenzar a emitir tokens para los usuarios, su modelo de Usuario debe usar el rasgo `Laravel\Sanctum\HasApiTokens`:

```php
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
}
```

Para emitir un token, puede utilizar el método `createToken`. El método `createToken` devuelve una instancia de `Laravel\Sanctum\NewAccessToken`. Los tokens API se procesan mediante hash SHA-256 antes de almacenarse en su base de datos, pero puede acceder al valor de texto sin formato del token utilizando la propiedad `plainTextToken` de la instancia `NewAccessToken`. Debe mostrar este valor al usuario inmediatamente después de que se haya creado el token:

```php
use Illuminate\Http\Request;

Route::post('/tokens/create', function (Request $request) {
    $token = $request->user()->createToken($request->token_name);

    return ['token' => $token->plainTextToken];
});
```

Puede acceder a todos los tokens del usuario utilizando la relación Eloquent `tokens` proporcionada por el rasgo `HasApiTokens`:

```php
foreach ($user->tokens as $token) {
    // ...
}
```

<a id="token-abilities"></a>
### Habilidades simbólicas

Sanctum te permite asignar "habilidades" a las fichas. Las capacidades tienen un propósito similar al de los "ámbitos" de OAuth. Puede pasar una serie de capacidades de cadena como segundo argumento al método `createToken`:

```php
return $user->createToken('token-name', ['server:update'])->plainTextToken;
```

Al manejar una solicitud entrante autenticada por Sanctum, puede determinar si el token tiene una capacidad determinada utilizando los métodos `tokenCan` o `tokenCant`:

```php
if ($user->tokenCan('server:update')) {
    // ...
}

if ($user->tokenCant('server:update')) {
    // ...
}
```

<a id="token-ability-middleware"></a>
#### Middleware de capacidad de token

Sanctum también incluye dos middleware que se pueden usar para verificar que una solicitud entrante esté autenticada con un token al que se le ha otorgado una capacidad determinada. Para comenzar, defina los siguientes alias de middleware en el archivo `bootstrap/app.php` de su aplicación:

```php
use Laravel\Sanctum\Http\Middleware\CheckAbilities;
use Laravel\Sanctum\Http\Middleware\CheckForAnyAbility;

->withMiddleware(function (Middleware $middleware): void {
    $middleware->alias([
        'abilities' => CheckAbilities::class,
        'ability' => CheckForAnyAbility::class,
    ]);
})
```

El middleware `abilities` se puede asignar a una ruta para verificar que el token de la solicitud entrante tenga todas las capacidades enumeradas:

```php
Route::get('/orders', function () {
    // Token has both "check-status" and "place-orders" abilities...
})->middleware(['auth:sanctum', 'abilities:check-status,place-orders']);
```

El middleware `ability` se puede asignar a una ruta para verificar que el token de la solicitud entrante tenga *al menos una* de las capacidades enumeradas:

```php
Route::get('/orders', function () {
    // Token has the "check-status" or "place-orders" ability...
})->middleware(['auth:sanctum', 'ability:check-status,place-orders']);
```

<a id="first-party-ui-initiated-requests"></a>
#### Solicitudes iniciadas por la interfaz de usuario propia

Para mayor comodidad, el método `tokenCan` siempre devolverá `true` si la solicitud autenticada entrante provino de su SPA propio y está utilizando la [autenticación de SPA](#spa-authentication)] integrada de Sanctum.

Sin embargo, esto no significa necesariamente que su aplicación deba permitir al usuario realizar la acción. Por lo general, las [políticas de autorización](../authorization/#creating-policies) de su aplicación determinarán si al token se le ha otorgado el permiso para realizar las capacidades y también verificarán que la instancia de usuario en sí debe tener permiso para realizar la acción.

Por ejemplo, si imaginamos una aplicación que gestiona servidores, esto podría significar comprobar que el token está autorizado para actualizar servidores **y** que el servidor pertenece al usuario:

```php
return $request->user()->id === $server->user_id &&
       $request->user()->tokenCan('server:update');
```

Al principio, permitir que se llame al método `tokenCan` y siempre devuelva `true` para solicitudes iniciadas por la interfaz de usuario de origen puede parecer extraño; sin embargo, es conveniente poder asumir siempre que hay un token API disponible y que se puede inspeccionar mediante el método `tokenCan`. Al adoptar este enfoque, siempre puede llamar al método `tokenCan` dentro de las políticas de autorización de su aplicación sin preocuparse de si la solicitud se activó desde la interfaz de usuario de su aplicación o fue iniciada por uno de los consumidores externos de su API.

<a id="protecting-routes"></a>
### Proteger rutas

Para proteger las rutas de modo que todas las solicitudes entrantes deban autenticarse, debe adjuntar el protector de autenticación `sanctum` a sus rutas protegidas dentro de sus archivos de ruta `routes/web.php` y `routes/api.php`. Esta protección garantizará que las solicitudes entrantes se autentiquen como solicitudes con estado, autenticadas por cookies o que contengan un encabezado de token de API válido si la solicitud proviene de un tercero.

Quizás se pregunte por qué le sugerimos que autentique las rutas dentro del archivo `routes/web.php` de su aplicación utilizando la protección `sanctum`. Recuerde, Sanctum primero intentará autenticar las solicitudes entrantes utilizando la cookie de autenticación de sesión típica de Laravel. Si esa cookie no está presente, Sanctum intentará autenticar la solicitud utilizando un token en el encabezado `Authorization` de la solicitud. Además, autenticar todas las solicitudes mediante Sanctum garantiza que siempre podremos llamar al método `tokenCan` en la instancia de usuario actualmente autenticada:

```php
use Illuminate\Http\Request;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
```

<a id="revoking-tokens"></a>
### Revocar tokens

Puede "revocar" tokens eliminándolos de su base de datos utilizando la relación `tokens` proporcionada por el rasgo `Laravel\Sanctum\HasApiTokens`:

```php
// Revoke all tokens...
$user->tokens()->delete();

// Revoke the token that was used to authenticate the current request...
$request->user()->currentAccessToken()->delete();

// Revoke a specific token...
$user->tokens()->where('id', $tokenId)->delete();
```

<a id="token-expiration"></a>
### Vencimiento del token

De forma predeterminada, los tokens de Sanctum nunca caducan y solo pueden invalidarse [revocando el token](#revoking-tokens). Sin embargo, si desea configurar un tiempo de vencimiento para los tokens API de su aplicación, puede hacerlo a través de la opción de configuración `expiration` definida en el archivo de configuración `sanctum` de su aplicación. Esta opción de configuración define la cantidad de minutos hasta que un token emitido se considerará caducado:

```php
'expiration' => 525600,
```

Si desea especificar el tiempo de vencimiento de cada token de forma independiente, puede hacerlo proporcionando el tiempo de vencimiento como tercer argumento del método `createToken`:

```php
return $user->createToken(
    'token-name', ['*'], now()->plus(weeks: 1)
)->plainTextToken;
```

Si ha configurado un tiempo de vencimiento de token para su aplicación, es posible que también desee [programar una tarea](../scheduling/) para eliminar los tokens vencidos de su aplicación. Afortunadamente, Sanctum incluye un comando `sanctum:prune-expired` Artisan que puedes usar para lograr esto. Por ejemplo, puede configurar una tarea programada para eliminar todos los registros de la base de datos de tokens vencidos que hayan estado vencidos durante al menos 24 horas:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('sanctum:prune-expired --hours=24')->daily();
```

<a id="spa-authentication"></a>
## Autenticación SPA

Sanctum también existe para proporcionar un método simple para autenticar aplicaciones de una sola página (SPA) que necesitan comunicarse con una API basada en Laravel. Estos SPA pueden existir en el mismo repositorio que su aplicación Laravel o pueden ser un repositorio completamente separado.

Para esta función, Sanctum no utiliza tokens de ningún tipo. En cambio, Sanctum utiliza los servicios de autenticación de sesión basados ​​en cookies integrados de Laravel. Este enfoque de autenticación proporciona los beneficios de la protección CSRF, la autenticación de sesión y también protege contra la fuga de las credenciales de autenticación a través de XSS.

> **Advertencia:**
> Para poder autenticarse, su SPA y API deben compartir el mismo dominio de nivel superior. Sin embargo, pueden ubicarse en diferentes subdominios. Además, debe asegurarse de enviar el encabezado `Accept: application/json` y el encabezado `Referer` o `Origin` con su solicitud.

<a id="spa-configuration"></a>
### Configuración

<a id="configuring-your-first-party-domains"></a>
#### Configuración de sus dominios propios

Primero, debe configurar desde qué dominios realizará solicitudes su SPA. Puede configurar estos dominios utilizando la opción de configuración `stateful` en su archivo de configuración `sanctum`. Esta configuración determina qué dominios mantendrán la autenticación "con estado" utilizando cookies de sesión de Laravel al realizar solicitudes a su API.

Para ayudarlo a configurar sus dominios con estado propios, Sanctum proporciona dos funciones auxiliares que puede incluir en la configuración. Primero, `Sanctum::currentApplicationUrlWithPort()` devolverá la URL de la aplicación actual desde la variable de entorno `APP_URL`, y `Sanctum::currentRequestHost()` inyectará un marcador de posición en la lista de dominios con estado que, en tiempo de ejecución, será reemplazado por el host de la solicitud actual para que todas las solicitudes con el mismo dominio se consideren con estado.

> **Advertencia:**
> Si accede a su aplicación a través de una URL que incluye un puerto (`127.0.0.1:8000`), debe asegurarse de incluir el número de puerto con el dominio.

<a id="sanctum-middleware"></a>
#### Middleware de Sanctum

A continuación, debe indicarle a Laravel que las solicitudes entrantes de su SPA puedan autenticarse utilizando las cookies de sesión de Laravel, y al mismo tiempo permitir que las solicitudes de terceros o aplicaciones móviles se autentiquen utilizando tokens API. Esto se puede lograr fácilmente invocando el método de middleware `statefulApi` en el archivo `bootstrap/app.php` de su aplicación:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->statefulApi();
})
```

<a id="cors-and-cookies"></a>
#### CORS y cookies

Si tiene problemas para autenticarse con su aplicación desde un SPA que se ejecuta en un subdominio separado, es probable que haya configurado mal su CORS (intercambio de recursos entre orígenes) o la configuración de cookies de sesión.

El archivo de configuración `config/cors.php` no se publica de forma predeterminada. Si necesita personalizar las opciones CORS de Laravel, debe publicar el archivo de configuración `cors` completo usando el comando `config:publish` Artisan:

```shell
php artisan config:publish cors
```

A continuación, debe asegurarse de que la configuración CORS de su aplicación devuelva el encabezado `Access-Control-Allow-Credentials` con un valor de `True`. Esto se puede lograr configurando la opción `supports_credentials` dentro del archivo de configuración `config/cors.php` de su aplicación en `true`.

Además, debe habilitar las opciones `withCredentials` y `withXSRFToken` en la instancia global `axios` de su aplicación. Esto se puede realizar en su archivo `resources/js/app.js`. Si no está utilizando Axios para realizar solicitudes HTTP desde su interfaz, debe realizar la configuración equivalente en su propio cliente HTTP:

```js
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;
```

Finalmente, debe asegurarse de que la configuración del dominio de cookies de sesión de su aplicación admita cualquier subdominio de su dominio raíz. Puede lograr esto anteponiendo al dominio un prefijo `.` dentro del archivo de configuración `config/session.php` de su aplicación:

```php
'domain' => '.domain.com',
```

<a id="spa-authenticating"></a>
### Autenticación

<a id="csrf-protection"></a>
#### Protección CSRF

Para autenticar su SPA, la página de "inicio de sesión" de su SPA primero debe realizar una solicitud al punto final `/sanctum/csrf-cookie` para inicializar la protección CSRF para la aplicación:

```js
axios.get('/sanctum/csrf-cookie').then(response => {
    // Login...
});
```

Durante esta solicitud, Laravel configurará una cookie `XSRF-TOKEN` que contiene el token CSRF actual. Luego, este token debe descodificarse en URL y pasarse en un encabezado `X-XSRF-TOKEN` en solicitudes posteriores, lo que algunas bibliotecas de cliente HTTP como Axios y Angular HttpClient harán automáticamente por usted. Si su biblioteca HTTP de JavaScript no establece el valor por usted, deberá configurar manualmente el encabezado `X-XSRF-TOKEN` para que coincida con el valor decodificado de la URL de la cookie `XSRF-TOKEN` establecida por esta ruta.

<a id="logging-in"></a>
#### Iniciar sesión

Una vez que se haya inicializado la protección CSRF, debe realizar una solicitud `POST` a la ruta `/login` de su aplicación Laravel. Esta ruta `/login` puede [implementarse manualmente](../authentication/#authenticating-users) o utilizar un paquete de autenticación sin interfaz de usuario como [Laravel Fortify](../fortify/).

Si la solicitud de inicio de sesión tiene éxito, será autenticado y las solicitudes posteriores a las rutas de su aplicación se autenticarán automáticamente a través de la cookie de sesión que la aplicación Laravel emitió a su cliente. Además, dado que su aplicación ya realizó una solicitud a la ruta `/sanctum/csrf-cookie`, las solicitudes posteriores deberían recibir protección CSRF automáticamente siempre que su cliente HTTP JavaScript envíe el valor de la cookie `XSRF-TOKEN` en el encabezado `X-XSRF-TOKEN`.

Por supuesto, si la sesión de su usuario expira debido a falta de actividad, las solicitudes posteriores a la aplicación Laravel pueden recibir una respuesta de error HTTP 401 o 419. En este caso, debes redirigir al usuario a la página de inicio de sesión de tu SPA.

Dado que este enfoque de autenticación SPA se basa en sesiones, puede utilizar los servicios de autenticación estándar de Laravel, incluida la funcionalidad ["recordarme"](../authentication/#remembering-users).

> **Advertencia:**
> Usted es libre de escribir su propio punto final `/login`; sin embargo, debe asegurarse de que autentique al usuario utilizando los servicios de autenticación estándar basados ​​en sesiones que proporciona Laravel ](../authentication/#authenticating-users). Normalmente, esto significa utilizar la protección de autenticación `web`.

<a id="protecting-spa-routes"></a>
### Proteger rutas

Para proteger las rutas de modo que todas las solicitudes entrantes deban autenticarse, debe adjuntar el protector de autenticación `sanctum` a sus rutas API dentro de su archivo `routes/api.php`. Esta protección garantizará que las solicitudes entrantes se autentiquen como solicitudes autenticadas con estado de su SPA o contengan un encabezado de token de API válido si la solicitud es de un tercero:

```php
use Illuminate\Http\Request;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
```

<a id="authorizing-private-broadcast-channels"></a>
### Autorización de canales de transmisión privados

Si su SPA necesita autenticarse con [canales de transmisión privados/de presencia](../broadcasting/#authorizing-channels), debe eliminar la entrada `channels` del método `withRouting` contenido en el archivo `bootstrap/app.php` de su aplicación. En su lugar, debe invocar el método `withBroadcasting` para poder especificar el middleware correcto para las rutas de transmisión de su aplicación:

```php
return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        // ...
    )
    ->withBroadcasting(
        __DIR__.'/../routes/channels.php',
        ['prefix' => 'api', 'middleware' => ['api', 'auth:sanctum']],
    )
    ->create();
```

A continuación, para que las solicitudes de autorización de Pusher tengan éxito, deberá proporcionar un Pusher `authorizer` personalizado al inicializar [Laravel Echo](../broadcasting/#client-side-installation). Esto permite que su aplicación configure Pusher para usar la instancia `axios` que está [configurada correctamente para solicitudes entre dominios](#cors-and-cookies):

```js
window.Echo = new Echo({
    broadcaster: "pusher",
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    encrypted: true,
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    authorizer: (channel, options) => {
        return {
            authorize: (socketId, callback) => {
                axios.post('/api/broadcasting/auth', {
                    socket_id: socketId,
                    channel_name: channel.name
                })
                .then(response => {
                    callback(false, response.data);
                })
                .catch(error => {
                    callback(true, error);
                });
            }
        };
    },
})
```

<a id="mobile-application-authentication"></a>
## Autenticación de aplicaciones móviles

También puede utilizar tokens Sanctum para autenticar las solicitudes de su aplicación móvil en su API. El proceso para autenticar solicitudes de aplicaciones móviles es similar a autenticar solicitudes de API de terceros; sin embargo, existen pequeñas diferencias en la forma de emitir los tokens API.

<a id="issuing-mobile-api-tokens"></a>
### Emitir tokens API

Para comenzar, cree una ruta que acepte el correo electrónico/nombre de usuario, la contraseña y el nombre del dispositivo del usuario, luego intercambie esas credenciales por un nuevo token de Sanctum. El "nombre del dispositivo" proporcionado a este punto final tiene fines informativos y puede tener cualquier valor que desee. En general, el valor del nombre del dispositivo debe ser un nombre que el usuario reconozca, como "iPhone 17 de Nuno".

Normalmente, realizará una solicitud al punto final del token desde la pantalla de "inicio de sesión" de su aplicación móvil. El punto final devolverá el token API en texto plano que luego podrá almacenarse en el dispositivo móvil y usarse para realizar solicitudes API adicionales:

```php
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

Route::post('/sanctum/token', function (Request $request) {
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
        'device_name' => 'required',
    ]);

    $user = User::where('email', $request->email)->first();

    if (! $user || ! Hash::check($request->password, $user->password)) {
        throw ValidationException::withMessages([
            'email' => ['The provided credentials are incorrect.'],
        ]);
    }

    return $user->createToken($request->device_name)->plainTextToken;
});
```

Cuando la aplicación móvil utiliza el token para realizar una solicitud de API a su aplicación, debe pasar el token en el encabezado `Authorization` como token `Bearer`.

> **Nota:**
> Al emitir tokens para una aplicación móvil, también puede especificar [token skills](#token-abilities).

<a id="protecting-mobile-api-routes"></a>
### Proteger rutas

Como se documentó anteriormente, puede proteger las rutas para que todas las solicitudes entrantes deban autenticarse adjuntando el protector de autenticación `sanctum` a las rutas:

```php
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
```

<a id="revoking-mobile-api-tokens"></a>
### Revocar tokens

Para permitir a los usuarios revocar tokens API emitidos a dispositivos móviles, puede enumerarlos por nombre, junto con un botón "Revocar", dentro de una parte de "configuración de cuenta" de la interfaz de usuario de su aplicación web. Cuando el usuario hace clic en el botón "Revocar", puede eliminar el token de la base de datos. Recuerde, puede acceder a los tokens API de un usuario a través de la relación `tokens` proporcionada por el rasgo `Laravel\Sanctum\HasApiTokens`:

```php
// Revoke all tokens...
$user->tokens()->delete();

// Revoke a specific token...
$user->tokens()->where('id', $tokenId)->delete();
```

<a id="testing"></a>
## Pruebas

Durante la prueba, se puede utilizar el método `Sanctum::actingAs` para autenticar a un usuario y especificar qué capacidades se deben otorgar a su token:

```php tab=Pest
use App\Models\User;
use Laravel\Sanctum\Sanctum;

test('task list can be retrieved', function () {
    Sanctum::actingAs(
        User::factory()->create(),
        ['view-tasks']
    );

    $response = $this->get('/api/task');

    $response->assertOk();
});
```

```php tab=PHPUnit
use App\Models\User;
use Laravel\Sanctum\Sanctum;

public function test_task_list_can_be_retrieved(): void
{
    Sanctum::actingAs(
        User::factory()->create(),
        ['view-tasks']
    );

    $response = $this->get('/api/task');

    $response->assertOk();
}
```

Si desea otorgar todas las habilidades al token, debe incluir `*` en la lista de habilidades proporcionada al método `actingAs`:

```php
Sanctum::actingAs(
    User::factory()->create(),
    ['*']
);
```
