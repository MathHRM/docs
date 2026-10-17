---
title: "Fortificar Laravel"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
    - [¿Qué es Fortify?](#what-is-fortify)
    - [¿Cuándo debo usar Fortify?](#when-should-i-use-fortify)
- [Instalación](#installation)
    - [Características de Fortificar](#fortify-features)
    - [Deshabilitar vistas](#disabling-views)
- [Autenticación](#authentication)
    - [Personalizar la autenticación de usuario](#customizing-user-authentication)
    - [Personalizar el proceso de autenticación](#customizing-the-authentication-pipeline)
    - [Personalizar redirecciones](#customizing-authentication-redirects)
- [Autenticación de dos factores](#two-factor-authentication)
    - [Habilitación de la autenticación de dos factores](#enabling-two-factor-authentication)
    - [Autenticación con autenticación de dos factores](#authenticating-with-two-factor-authentication)
    - [Desactivación de la autenticación de dos factores](#disabling-two-factor-authentication)
- [Claves de acceso](#passkeys)
    - [Habilitación de claves de acceso](#enabling-passkeys)
    - [Cliente JavaScript](#passkeys-javascript-client)
    - [Autenticación con claves de acceso](#authenticating-with-passkeys)
    - [Confirmación de contraseña con claves de acceso](#confirming-password-with-passkeys)
    - [Registro de claves de acceso](#registering-passkeys)
    - [Eliminar claves de acceso](#deleting-passkeys)
- [Registro](#registration)
    - [Personalizar Registro](#customizing-registration)
- [Restablecer contraseña](#password-reset)
    - [Solicitar un enlace para restablecer contraseña](#requesting-a-password-reset-link)
    - [Restablecer la contraseña](#resetting-the-password)
    - [Personalizar restablecimiento de contraseña](#customizing-password-resets)
- [Verificación por correo electrónico](#email-verification)
    - [Protegiendo Rutas](#protecting-routes)
- [Confirmación de contraseña](#password-confirmation)

<a id="introduction"></a>
## Introducción

[Laravel Fortify](https://github.com/laravel/fortify) es una implementación de backend de autenticación independiente del frontend para Laravel. Fortify registra las rutas y los controladores necesarios para implementar todas las funciones de autenticación de Laravel, incluido el inicio de sesión, el registro, el restablecimiento de contraseña, la verificación de correo electrónico y más. Después de instalar Fortify, puede ejecutar el comando `route:list` Artisan para ver las rutas que Fortify ha registrado.

Dado que Fortify no proporciona su propia interfaz de usuario, debe combinarse con su propia interfaz de usuario, que realiza solicitudes a las rutas que registra. Discutiremos exactamente cómo realizar solicitudes a estas rutas en el resto de esta documentación.

> **Nota:**
> Recuerde, Fortify es un paquete destinado a brindarle una ventaja para comenzar a implementar las funciones de autenticación de Laravel. **No es necesario que lo utilices.** Siempre eres libre de interactuar manualmente con los servicios de autenticación de Laravel siguiendo la documentación disponible en la documentación [authentication](../authentication/), [restablecimiento de contraseña](../passwords/) y [verificación de correo electrónico](../verification/).

<a id="what-is-fortify"></a>
### ¿Qué es Fortificar?

Como se mencionó anteriormente, Laravel Fortify es una implementación de backend de autenticación independiente del frontend para Laravel. Fortify registra las rutas y los controladores necesarios para implementar todas las funciones de autenticación de Laravel, incluido el inicio de sesión, el registro, el restablecimiento de contraseña, la verificación de correo electrónico y más.

**No es necesario que utilice Fortify para utilizar las funciones de autenticación de Laravel.** Siempre puede interactuar manualmente con los servicios de autenticación de Laravel siguiendo la documentación disponible en la [autenticación](../authentication/), [restablecimiento de contraseña](../passwords/) y [documentación de verificación por correo electrónico](../verification/).

Si es nuevo en Laravel, es posible que desee explorar [nuestros kits de inicio de aplicaciones](../starter-kits/). Los kits de inicio de aplicaciones de Laravel utilizan Fortify internamente para proporcionar un andamiaje de autenticación para su aplicación que incluye una interfaz de usuario creada con [Tailwind CSS](https://tailwindcss.com). Esto le permite estudiar y sentirse cómodo con las funciones de autenticación de Laravel.

Básicamente, Laravel Fortify toma las rutas y los controladores de nuestros kits de inicio de aplicaciones y los ofrece como un paquete que no incluye una interfaz de usuario. Esto le permite seguir avanzando rápidamente en la implementación de backend de la capa de autenticación de su aplicación sin estar atado a ninguna opinión de frontend en particular.

<a id="when-should-i-use-fortify"></a>
### ¿Cuándo debo usar Fortify?

Quizás se pregunte cuándo es apropiado utilizar Laravel Fortify. Primero, si está utilizando uno de los [kits de inicio de aplicaciones](../starter-kits/)] de Laravel, no necesita instalar Laravel Fortify ya que todos los kits de inicio de aplicaciones de Laravel usan Fortify y ya proporcionan una implementación de autenticación completa.

Si no está utilizando un kit de inicio de aplicación y su aplicación necesita funciones de autenticación, tiene dos opciones: implementar manualmente las funciones de autenticación de su aplicación o usar Laravel Fortify para proporcionar la implementación de backend de estas funciones.

Si elige instalar Fortify, su interfaz de usuario realizará solicitudes a las rutas de autenticación de Fortify que se detallan en esta documentación para autenticar y registrar usuarios.

Si elige interactuar manualmente con los servicios de autenticación de Laravel en lugar de usar Fortify, puede hacerlo siguiendo la documentación disponible en la documentación [authentication](../authentication/), [restablecimiento de contraseña](../passwords/) y [verificación de correo electrónico](../verification/).

<a id="laravel-fortify-and-laravel-sanctum"></a>
#### Laravel Fortificar y Laravel Sanctum

Algunos desarrolladores se confunden con la diferencia entre [Laravel Sanctum](../sanctum/) y Laravel Fortify. Debido a que los dos paquetes resuelven dos problemas diferentes pero relacionados, Laravel Fortify y Laravel Sanctum no son paquetes mutuamente excluyentes ni competidores.

Laravel Sanctum solo se ocupa de administrar tokens API y autenticar a los usuarios existentes mediante cookies o tokens de sesión. Sanctum no proporciona ninguna ruta que maneje el registro de usuarios, el restablecimiento de contraseñas, etc.

Si está intentando crear manualmente la capa de autenticación para una aplicación que ofrece una API o sirve como backend para una aplicación de una sola página, es muy posible que utilice tanto Laravel Fortify (para registro de usuarios, restablecimiento de contraseñas, etc.) como Laravel Sanctum (administración de tokens API, autenticación de sesiones).

<a id="installation"></a>
## Instalación

Para comenzar, instale Fortify usando el administrador de paquetes de Composer:

```shell
composer require laravel/fortify
```

A continuación, publique los recursos de Fortify usando el comando `fortify:install` Artisan:

```shell
php artisan fortify:install
```

Este comando publicará las acciones de Fortify en su directorio `app/Actions`, que se creará si no existe. Además, se publicarán el `FortifyServiceProvider`, el archivo de configuración y todas las migraciones de bases de datos necesarias.

A continuación, debes migrar tu base de datos:

```shell
php artisan migrate
```

<a id="fortify-features"></a>
### Funciones de fortalecimiento

El archivo de configuración `fortify` contiene una matriz de configuración `features`. Esta matriz define qué rutas/características de backend expondrá Fortify de forma predeterminada. Le recomendamos que solo habilite las siguientes funciones, que son las funciones de autenticación básicas proporcionadas por la mayoría de las aplicaciones Laravel:

```php
'features' => [
    Features::registration(),
    Features::resetPasswords(),
    Features::emailVerification(),
],
```

<a id="disabling-views"></a>
### Deshabilitar vistas

De forma predeterminada, Fortify define rutas destinadas a devolver vistas, como una pantalla de inicio de sesión o una pantalla de registro. Sin embargo, si está creando una aplicación de una sola página basada en JavaScript, es posible que no necesite estas rutas. Por ese motivo, puede deshabilitar estas rutas por completo estableciendo el valor de configuración `views` dentro del archivo de configuración `config/fortify.php` de su aplicación en `false`:

```php
'views' => false,
```

<a id="disabling-views-and-password-reset"></a>
#### Deshabilitar vistas y restablecer contraseña

Si elige deshabilitar las vistas de Fortify e implementará funciones de restablecimiento de contraseña para su aplicación, aún debe definir una ruta denominada `password.reset` que sea responsable de mostrar la vista de "restablecer contraseña" de su aplicación. Esto es necesario porque la notificación `Illuminate\Auth\Notifications\ResetPassword` de Laravel generará la URL de restablecimiento de contraseña a través de la ruta con nombre `password.reset`.

<a id="authentication"></a>
## Autenticación

Para comenzar, debemos indicarle a Fortify cómo regresar a nuestra vista de "inicio de sesión". Recuerde, Fortify es una biblioteca de autenticación sin interfaz de usuario. Si desea una implementación de interfaz de las funciones de autenticación de Laravel que ya están completadas para usted, debe usar un [kit de inicio de aplicación](../starter-kits/).

Toda la lógica de representación de la vista de autenticación se puede personalizar utilizando los métodos apropiados disponibles a través de la clase `Laravel\Fortify\Fortify`. Normalmente, deberías llamar a este método desde el método `boot` de la clase `App\Providers\FortifyServiceProvider` de tu aplicación. Fortify se encargará de definir la ruta `/login` que devuelve esta vista:

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

Su plantilla de inicio de sesión debe incluir un formulario que realice una solicitud POST a `/login`. El punto final `/login` espera una cadena `email`/`username` y una `password`. El nombre del campo de correo electrónico/nombre de usuario debe coincidir con el valor `username` dentro del archivo de configuración `config/fortify.php`. Además, se puede proporcionar un campo booleano `remember` para indicar que al usuario le gustaría utilizar la funcionalidad "recordarme" proporcionada por Laravel.

Si el intento de inicio de sesión tiene éxito, Fortify lo redirigirá al URI configurado mediante la opción de configuración `home` dentro del archivo de configuración `fortify` de su aplicación. Si la solicitud de inicio de sesión fue una solicitud XHR, se devolverá una respuesta HTTP 200.

Si la solicitud no fue exitosa, el usuario será redirigido nuevamente a la pantalla de inicio de sesión y los errores de validación estarán disponibles a través del archivo compartido `$errors` [variable de plantilla Blade](../validation/#quick-displaying-the-validation-errors). O, en el caso de una solicitud XHR, los errores de validación se devolverán con la respuesta HTTP 422.

<a id="customizing-user-authentication"></a>
### Personalización de la autenticación de usuario

Fortify recuperará y autenticará automáticamente al usuario según las credenciales proporcionadas y la protección de autenticación configurada para su aplicación. Sin embargo, es posible que en ocasiones desee tener una personalización completa sobre cómo se autentican las credenciales de inicio de sesión y se recuperan los usuarios. Afortunadamente, Fortify le permite lograr esto fácilmente utilizando el método `Fortify::authenticateUsing`.

Este método acepta una función anónima que recibe la solicitud HTTP entrante. La función anónima es responsable de validar las credenciales de inicio de sesión adjuntas a la solicitud y devolver la instancia de usuario asociada. Si las credenciales no son válidas o no se puede encontrar ningún usuario, la función anónima debe devolver `null` o `false`. Normalmente, este método debe llamarse desde el método `boot` de su `FortifyServiceProvider`:

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
#### Guardia de autenticación

Puede personalizar la protección de autenticación utilizada por Fortify dentro del archivo de configuración `fortify` de su aplicación. Sin embargo, debe asegurarse de que la protección configurada sea una implementación de `Illuminate\Contracts\Auth\StatefulGuard`. Si está intentando utilizar Laravel Fortify para autenticar un SPA, debe utilizar la protección `web` predeterminada de Laravel en combinación con [Laravel Sanctum](https://laravel.com/docs/sanctum).

<a id="customizing-the-authentication-pipeline"></a>
### Personalización del canal de autenticación

Laravel Fortify autentica las solicitudes de inicio de sesión a través de una canalización de clases invocables. Si lo desea, puede definir una canalización personalizada de clases a través de las cuales se deben canalizar las solicitudes de inicio de sesión. Cada clase debe tener un método `__invoke` que reciba la instancia `Illuminate\Http\Request` entrante y, como [middleware](../middleware/), una variable `$next` que se invoca para pasar la solicitud a la siguiente clase en la canalización.

Para definir su canalización personalizada, puede utilizar el método `Fortify::authenticateThrough`. Este método acepta una función anónima que debería devolver la matriz de clases para canalizar la solicitud de inicio de sesión. Normalmente, este método debe llamarse desde el método `boot` de su clase `App\Providers\FortifyServiceProvider`.

El siguiente ejemplo contiene la definición de canalización predeterminada que puede utilizar como punto de partida al realizar sus propias modificaciones:

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

#### Limitación de autenticación

De forma predeterminada, Fortify limitará los intentos de autenticación utilizando el middleware `EnsureLoginIsNotThrottled`. Este middleware limita los intentos que son exclusivos de una combinación de nombre de usuario y dirección IP.

Algunas aplicaciones pueden requerir un enfoque diferente para limitar los intentos de autenticación, como limitar únicamente por dirección IP. Por lo tanto, Fortify le permite especificar su propio [limitador de velocidad](../routing/#rate-limiting) a través de la opción de configuración `fortify.limiters.login`. Por supuesto, esta opción de configuración se encuentra en el archivo de configuración `config/fortify.php` de su aplicación.

> **Nota:**
> El uso de una combinación de aceleración, [autenticación de dos factores](../fortify/#two-factor-authentication) y un firewall de aplicaciones web (WAF) externo proporcionará la defensa más sólida para los usuarios legítimos de sus aplicaciones.

<a id="customizing-authentication-redirects"></a>
### Personalización de redirecciones

Si el intento de inicio de sesión tiene éxito, Fortify lo redirigirá al URI configurado mediante la opción de configuración `home` dentro del archivo de configuración `fortify` de su aplicación. Si la solicitud de inicio de sesión fue una solicitud XHR, se devolverá una respuesta HTTP 200. Después de que un usuario cierra sesión en la aplicación, se le redirigirá al URI `/`.

Si necesita una personalización avanzada de este comportamiento, puede vincular implementaciones de los contratos `LoginResponse` y `LogoutResponse` en Laravel [contenedor de servicios](../container/). Normalmente, esto se debe hacer dentro del método `register` de la clase `App\Providers\FortifyServiceProvider` de su aplicación:

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
## Autenticación de dos factores

Cuando la función de autenticación de dos factores de Fortify está habilitada, el usuario debe ingresar un token numérico de seis dígitos durante el proceso de autenticación. Este token se genera utilizando una contraseña de un solo uso basada en el tiempo (TOTP) que se puede recuperar desde cualquier aplicación de autenticación móvil compatible con TOTP, como Google Authenticator.

Antes de comenzar, primero debe asegurarse de que el modelo `App\Models\User` de su aplicación utilice el rasgo `Laravel\Fortify\TwoFactorAuthenticatable`:

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

A continuación, debe crear una pantalla dentro de su aplicación donde los usuarios puedan administrar su configuración de autenticación de dos factores. Esta pantalla debería permitir al usuario habilitar y deshabilitar la autenticación de dos factores, así como regenerar sus códigos de recuperación de autenticación de dos factores.

> De forma predeterminada, la matriz `features` del archivo de configuración `fortify` indica a la configuración de autenticación de dos factores de Fortify que requiera la confirmación de la contraseña antes de la modificación. Por lo tanto, su aplicación debe implementar la función [confirmación de contraseña](#password-confirmation)] de Fortify antes de continuar.

<a id="enabling-two-factor-authentication"></a>
### Habilitación de la autenticación de dos factores

Para comenzar a habilitar la autenticación de dos factores, su aplicación debe realizar una solicitud POST al punto final `/user/two-factor-authentication` definido por Fortify. Si la solicitud tiene éxito, el usuario será redirigido a la URL anterior y la variable de sesión `status` se establecerá en `two-factor-authentication-enabled`. Puede detectar esta variable de sesión `status` dentro de sus plantillas para mostrar el mensaje de éxito apropiado. Si la solicitud fue una solicitud XHR, se devolverá la respuesta HTTP `200`.

Después de elegir habilitar la autenticación de dos factores, el usuario aún debe "confirmar" su configuración de autenticación de dos factores proporcionando un código de autenticación de dos factores válido. Por lo tanto, su mensaje de "éxito" debería indicarle al usuario que aún se requiere la confirmación de autenticación de dos factores:

```html
@if (session('status') == 'two-factor-authentication-enabled')
    <div class="mb-4 font-medium text-sm">
        Please finish configuring two-factor authentication below.
    </div>
@endif
```

A continuación, debe mostrar el código QR de autenticación de dos factores para que el usuario lo escanee en su aplicación de autenticación. Si está utilizando Blade para representar la interfaz de su aplicación, puede recuperar el código QR SVG utilizando el método `twoFactorQrCodeSvg` disponible en la instancia de usuario:

```php
$request->user()->twoFactorQrCodeSvg();
```

Si está creando una interfaz con JavaScript, puede realizar una solicitud XHR GET al punto final `/user/two-factor-qr-code` para recuperar el código QR de autenticación de dos factores del usuario. Este punto final devolverá un objeto JSON que contiene una clave `svg`.

<a id="confirming-two-factor-authentication"></a>
#### Confirmación de la autenticación de dos factores

Además de mostrar el código QR de autenticación de dos factores del usuario, debe proporcionar una entrada de texto donde el usuario pueda proporcionar un código de autenticación válido para "confirmar" su configuración de autenticación de dos factores. Este código debe proporcionarse a la aplicación Laravel mediante una solicitud POST al punto final `/user/confirmed-two-factor-authentication` definido por Fortify.

Si la solicitud tiene éxito, el usuario será redirigido a la URL anterior y la variable de sesión `status` se establecerá en `two-factor-authentication-confirmed`:

```html
@if (session('status') == 'two-factor-authentication-confirmed')
    <div class="mb-4 font-medium text-sm">
        Two-factor authentication confirmed and enabled successfully.
    </div>
@endif
```

Si la solicitud al punto final de confirmación de autenticación de dos factores se realizó a través de una solicitud XHR, se devolverá una respuesta HTTP `200`.

<a id="displaying-the-recovery-codes"></a>
#### Visualización de los códigos de recuperación

También debe mostrar los códigos de recuperación de dos factores del usuario. Estos códigos de recuperación permiten al usuario autenticarse si pierde el acceso a su dispositivo móvil. Si está utilizando Blade para representar la interfaz de su aplicación, puede acceder a los códigos de recuperación a través de la instancia de usuario autenticado:

```php
(array) $request->user()->recoveryCodes();
```

Si está creando una interfaz con JavaScript, puede realizar una solicitud XHR GET al punto final `/user/two-factor-recovery-codes`. Este punto final devolverá una matriz JSON que contiene los códigos de recuperación del usuario.

Para regenerar los códigos de recuperación del usuario, su aplicación debe realizar una solicitud POST al punto final `/user/two-factor-recovery-codes`.

<a id="authenticating-with-two-factor-authentication"></a>
### Autenticación con autenticación de dos factores

Durante el proceso de autenticación, Fortify redirigirá automáticamente al usuario a la pantalla de desafío de autenticación de dos factores de su aplicación. Sin embargo, si su aplicación realiza una solicitud de inicio de sesión XHR, la respuesta JSON devuelta después de un intento de autenticación exitoso contendrá un objeto JSON que tiene una propiedad booleana `two_factor`. Debe inspeccionar este valor para saber si debe redirigir a la pantalla de desafío de autenticación de dos factores de su aplicación.

Para comenzar a implementar la funcionalidad de autenticación de dos factores, debemos indicarle a Fortify cómo devolver nuestra vista de desafío de autenticación de dos factores. Toda la lógica de representación de la vista de autenticación de Fortify se puede personalizar utilizando los métodos apropiados disponibles a través de la clase `Laravel\Fortify\Fortify`. Normalmente, debes llamar a este método desde el método `boot` de la clase `App\Providers\FortifyServiceProvider` de tu aplicación:

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

Fortify se encargará de definir la ruta `/two-factor-challenge` que devuelve esta vista. Su plantilla `two-factor-challenge` debe incluir un formulario que realice una solicitud POST al punto final `/two-factor-challenge`. La acción `/two-factor-challenge` espera un campo `code` que contenga un token TOTP válido o un campo `recovery_code` que contenga uno de los códigos de recuperación del usuario.

Si el intento de inicio de sesión tiene éxito, Fortify redirigirá al usuario al URI configurado mediante la opción de configuración `home` dentro del archivo de configuración `fortify` de su aplicación. Si la solicitud de inicio de sesión fue una solicitud XHR, se devolverá una respuesta HTTP 204.

Si la solicitud no fue exitosa, el usuario será redirigido nuevamente a la pantalla de desafío de dos factores y los errores de validación estarán disponibles a través del archivo `$errors` compartido [variable de plantilla Blade](../validation/#quick-displaying-the-validation-errors). O, en el caso de una solicitud XHR, los errores de validación se devolverán con una respuesta HTTP 422.

<a id="disabling-two-factor-authentication"></a>
### Deshabilitar la autenticación de dos factores

Para deshabilitar la autenticación de dos factores, su aplicación debe realizar una solicitud DELETE al punto final `/user/two-factor-authentication`. Recuerde, los puntos finales de autenticación de dos factores de Fortify requieren [confirmación de contraseña](#password-confirmation) antes de ser llamados.

<a id="passkeys"></a>
## Claves de acceso

Fortify admite la autenticación de clave de acceso mediante WebAuthn. Las claves de acceso permiten a los usuarios autenticarse sin contraseñas utilizando autenticadores de plataforma como Face ID, Touch ID, Windows Hello o claves de seguridad de hardware.

<a id="enabling-passkeys"></a>
### Habilitación de claves de acceso

Para comenzar, asegúrese de que la función `passkeys` esté habilitada en el archivo de configuración `fortify` de su aplicación:

```php
use Laravel\Fortify\Features;

'features' => [
    // ...
    Features::passkeys([
        'confirmPassword' => true,
    ]),
],
```

La opción `confirmPassword` determina si Fortify requiere [confirmación de contraseña](#password-confirmation) antes de que las claves de acceso puedan registrarse o eliminarse.

A continuación, asegúrese de que el modelo `App\Models\User` de su aplicación implemente `Laravel\Fortify\Contracts\PasskeyUser` y utilice el rasgo `Laravel\Fortify\PasskeyAuthenticatable`:

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

Las opciones de configuración de claves de acceso de Fortify se pueden personalizar utilizando la matriz de configuración `passkeys` en el archivo `config/fortify.php` de su aplicación:

```php
'passkeys' => [
    'relying_party_id' => parse_url(config('app.url'), PHP_URL_HOST),
    'allowed_origins' => [config('app.url')],
    'user_handle_secret' => config('app.key'),
    'timeout' => 60000,
],
```

> **Nota:**
> Fortify envuelve el paquete `laravel/passkeys` Composer y lo configura por usted. Si está utilizando la función de claves de acceso de Fortify, debe configurar las claves de acceso utilizando el archivo `config/fortify.php` de su aplicación. No es necesario publicar el archivo de configuración `laravel/passkeys`, y Fortify anulará cualquier valor definido allí.

El `relying_party_id` debe coincidir con el dominio de su aplicación. La matriz `allowed_origins` enumera los orígenes del navegador que pueden completar el registro y la autenticación de la clave de acceso. El `user_handle_secret` se utiliza para derivar identificadores de usuario opacos, lo que garantiza que se reconozca al mismo usuario en todos los registros de claves de acceso. La opción `timeout` controla cuánto tiempo pueden permanecer activas las operaciones de autenticación y registro de clave de acceso.

Fortify aplica un limitador de tasa de claves de acceso dedicado a sus rutas de inicio de sesión, confirmación y registro de claves de acceso. Si es necesario, puede personalizarlo utilizando la opción de configuración `fortify.limiters.passkeys` y una definición `RateLimiter::for(...)` correspondiente.

<a id="passkeys-javascript-client"></a>
### Cliente JavaScript

Si está creando una interfaz personalizada, incluida una aplicación Blade con scripts del lado del navegador, puede utilizar el paquete oficial [`@laravel/passkeys`](https://www.npmjs.com/package/@laravel/passkeys). Este paquete maneja las ceremonias WebAuthn del navegador y envía solicitudes a los puntos finales de clave de acceso de Fortify.

Instale el paquete a través de npm:

```shell
npm install @laravel/passkeys
```

Luego, puede iniciar el registro y la verificación de la clave de acceso desde su interfaz:

```js
import { Passkeys } from "@laravel/passkeys";

await Passkeys.register({ name: "MacBook Pro" });
await Passkeys.verify();
```

Si su aplicación utiliza URI de punto final de clave de acceso personalizados, puede anular las rutas por llamada:

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

El paquete también proporciona ayudantes de React, Vue y Svelte a través de `@laravel/passkeys/react`, `@laravel/passkeys/vue` y `@laravel/passkeys/svelte`.

<a id="authenticating-with-passkeys"></a>
### Autenticación con claves de acceso

Para autenticar a un usuario con una clave de acceso, su aplicación primero debe realizar una solicitud GET al punto final `/passkeys/login/options`. Este punto final devuelve las opciones de desafío de WebAuthn que su interfaz debe pasar a `navigator.credentials.get(...)`.

Después de que el navegador devuelva una credencial, su aplicación debe realizar una solicitud POST a `/passkeys/login` con la carga útil de la credencial. También puede incluir un campo booleano `remember`.

Si la solicitud tiene éxito, Fortify iniciará la sesión del usuario en la guardia configurada y devolverá:

<div class="content-list" markdown="1">

- Una respuesta de redireccionamiento a su destino previsto para solicitudes estándar.
- Una respuesta HTTP `200` que contiene una carga útil JSON con una clave `redirect` para solicitudes XHR.

</div>

<a id="confirming-password-with-passkeys"></a>
### Confirmación de contraseña con claves de acceso

Para sesiones autenticadas, Fortify proporciona puntos finales de confirmación de clave de acceso que satisfacen el requisito de confirmación de contraseña de Laravel para la sesión actual.

Para confirmar con una clave de acceso, su aplicación primero debe realizar una solicitud GET a `/passkeys/confirm/options`. Este punto final devuelve las opciones de desafío de WebAuthn que su interfaz debe pasar a `navigator.credentials.get(...)`.

Después de que el navegador devuelva una credencial, su aplicación debe realizar una solicitud POST a `/passkeys/confirm` con la carga útil de la credencial.

Si la solicitud tiene éxito, Fortify marca la sesión actual como contraseña confirmada y devuelve:

<div class="content-list" markdown="1">

- Una respuesta de redireccionamiento a su destino previsto para solicitudes estándar.
- Una respuesta HTTP `200` que contiene una carga útil JSON con una clave `redirect` para solicitudes XHR.

</div>

<a id="registering-passkeys"></a>
### Registro de claves de acceso

Para registrar una clave de acceso para un usuario autenticado, su aplicación primero debe realizar una solicitud GET a `/user/passkeys/options`. Este punto final devuelve las opciones de creación de WebAuthn que su interfaz debe pasar a `navigator.credentials.create(...)`.

Después de que el navegador devuelva una credencial, su aplicación debe realizar una solicitud POST a `/user/passkeys` con un campo `name` y un campo `credential` que contenga el objeto serializado [`PublicKeyCredential`](https://developer.mozilla.org/en-US/docs/Web/API/PublicKeyCredential) devuelto por `navigator.credentials.create(...)`.

Si la solicitud tiene éxito, Fortify devolverá:

<div class="content-list" markdown="1">

- Una respuesta de redireccionamiento con un estado `passkey-registered` en la sesión para solicitudes estándar.
- Una respuesta HTTP `200` con una carga útil JSON que contiene una clave `status`, junto con las claves de acceso `id` y `name` recién registradas.

</div>

<a id="deleting-passkeys"></a>
### Eliminación de claves de acceso

Para eliminar una clave de acceso, su aplicación debe realizar una solicitud DELETE a `/user/passkeys/{passkey}`.

Si la solicitud tiene éxito, Fortify devolverá:

<div class="content-list" markdown="1">

- Una respuesta de redireccionamiento con un estado `passkey-deleted` en la sesión para solicitudes estándar.
- Una respuesta HTTP `200` con una carga útil JSON que contiene una clave `status` para solicitudes XHR.

</div>

<a id="registration"></a>
## Registro

Para comenzar a implementar la funcionalidad de registro de nuestra aplicación, debemos indicarle a Fortify cómo devolver nuestra vista de "registro". Recuerde, Fortify es una biblioteca de autenticación sin interfaz de usuario. Si desea una implementación de interfaz de las funciones de autenticación de Laravel que ya están completadas para usted, debe usar un [kit de inicio de aplicación](../starter-kits/).

Toda la lógica de representación de vistas de Fortify se puede personalizar utilizando los métodos apropiados disponibles a través de la clase `Laravel\Fortify\Fortify`. Normalmente, deberías llamar a este método desde el método `boot` de tu clase `App\Providers\FortifyServiceProvider`:

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

Fortify se encargará de definir la ruta `/register` que devuelve esta vista. Su plantilla `register` debe incluir un formulario que realice una solicitud POST al punto final `/register` definido por Fortify.

El punto final `/register` espera una cadena `name`, una cadena de dirección de correo electrónico/nombre de usuario, `password` y campos `password_confirmation`. El nombre del campo de correo electrónico/nombre de usuario debe coincidir con el valor de configuración `username` definido en el archivo de configuración `fortify` de su aplicación.

Si el intento de registro tiene éxito, Fortify redirigirá al usuario al URI configurado mediante la opción de configuración `home` dentro del archivo de configuración `fortify` de su aplicación. Si la solicitud fue una solicitud XHR, se devolverá una respuesta HTTP 201.

Si la solicitud no fue exitosa, el usuario será redirigido nuevamente a la pantalla de registro y los errores de validación estarán disponibles a través del archivo compartido `$errors` [variable de plantilla Blade](../validation/#quick-displaying-the-validation-errors). O, en el caso de una solicitud XHR, los errores de validación se devolverán con una respuesta HTTP 422.

<a id="customizing-registration"></a>
### Personalización del registro

El proceso de validación y creación de usuarios se puede personalizar modificando la acción `App\Actions\Fortify\CreateNewUser` que se generó cuando instaló Laravel Fortify.

<a id="password-reset"></a>
## Restablecer contraseña

<a id="requesting-a-password-reset-link"></a>
### Solicitar un enlace para restablecer la contraseña

Para comenzar a implementar la funcionalidad de restablecimiento de contraseña de nuestra aplicación, debemos indicarle a Fortify cómo recuperar nuestra vista de "contraseña olvidada". Recuerde, Fortify es una biblioteca de autenticación sin interfaz de usuario. Si desea una implementación de interfaz de las funciones de autenticación de Laravel que ya están completadas para usted, debe usar un [kit de inicio de aplicación](../starter-kits/).

Toda la lógica de representación de vistas de Fortify se puede personalizar utilizando los métodos apropiados disponibles a través de la clase `Laravel\Fortify\Fortify`. Normalmente, debes llamar a este método desde el método `boot` de la clase `App\Providers\FortifyServiceProvider` de tu aplicación:

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

Fortify se encargará de definir el punto final `/forgot-password` que devuelve esta vista. Su plantilla `forgot-password` debe incluir un formulario que realice una solicitud POST al punto final `/forgot-password`.

El punto final `/forgot-password` espera un campo de cadena `email`. El nombre de este campo/columna de base de datos debe coincidir con el valor de configuración `email` dentro del archivo de configuración `fortify` de su aplicación.

<a id="handling-the-password-reset-link-request-response"></a>
#### Manejo de la respuesta a la solicitud de enlace de restablecimiento de contraseña

Si la solicitud del enlace de restablecimiento de contraseña fue exitosa, Fortify redirigirá al usuario nuevamente al punto final `/forgot-password` y le enviará un correo electrónico con un enlace seguro que puede usar para restablecer su contraseña. Si la solicitud fue una solicitud XHR, se devolverá una respuesta HTTP 200.

Después de ser redirigido nuevamente al punto final `/forgot-password` después de una solicitud exitosa, la variable de sesión `status` se puede usar para mostrar el estado del intento de solicitud de enlace de restablecimiento de contraseña.

El valor de la variable de sesión `$status` coincidirá con una de las cadenas de traducción definidas en el archivo `passwords` [archivo de idioma](../localization/). Si desea personalizar este valor y no ha publicado los archivos de idioma de Laravel, puede hacerlo mediante el comando `lang:publish` Artisan:

```html
@if (session('status'))
    <div class="mb-4 font-medium text-sm text-green-600">
        {{ session('status') }}
    </div>
@endif
```

Si la solicitud no fue exitosa, el usuario será redirigido nuevamente a la pantalla de enlace de solicitud de restablecimiento de contraseña y los errores de validación estarán disponibles para usted a través del archivo compartido `$errors` [variable de plantilla Blade](../validation/#quick-displaying-the-validation-errors). O, en el caso de una solicitud XHR, los errores de validación se devolverán con una respuesta HTTP 422.

<a id="resetting-the-password"></a>
### Restablecer la contraseña

Para terminar de implementar la funcionalidad de restablecimiento de contraseña de nuestra aplicación, debemos indicarle a Fortify cómo regresar a nuestra vista de "restablecer contraseña".

Toda la lógica de representación de vistas de Fortify se puede personalizar utilizando los métodos apropiados disponibles a través de la clase `Laravel\Fortify\Fortify`. Normalmente, debes llamar a este método desde el método `boot` de la clase `App\Providers\FortifyServiceProvider` de tu aplicación:

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

Fortify se encargará de definir la ruta para mostrar esta vista. Su plantilla `reset-password` debe incluir un formulario que realice una solicitud POST a `/reset-password`.

El punto final `/reset-password` espera un campo de cadena `email`, un campo `password`, un campo `password_confirmation` y un campo oculto denominado `token` que contiene el valor de `request()->route('token')`. El nombre del campo "correo electrónico"/columna de base de datos debe coincidir con el valor de configuración `email` definido en el archivo de configuración `fortify` de su aplicación.

<a id="handling-the-password-reset-response"></a>
#### Manejo de la respuesta de restablecimiento de contraseña

Si la solicitud de restablecimiento de contraseña fue exitosa, Fortify lo redirigirá nuevamente a la ruta `/login` para que el usuario pueda iniciar sesión con su nueva contraseña. Además, se configurará una variable de sesión `status` para que pueda mostrar el estado exitoso del reinicio en su pantalla de inicio de sesión:

```blade
@if (session('status'))
    <div class="mb-4 font-medium text-sm text-green-600">
        {{ session('status') }}
    </div>
@endif
```

Si la solicitud fue una solicitud XHR, se devolverá una respuesta HTTP 200.

Si la solicitud no fue exitosa, el usuario será redirigido nuevamente a la pantalla de restablecimiento de contraseña y los errores de validación estarán disponibles para usted a través del archivo compartido `$errors` [variable de plantilla Blade](../validation/#quick-displaying-the-validation-errors). O, en el caso de una solicitud XHR, los errores de validación se devolverán con una respuesta HTTP 422.

<a id="customizing-password-resets"></a>
### Personalización del restablecimiento de contraseña

El proceso de restablecimiento de contraseña se puede personalizar modificando la acción `App\Actions\Fortify\ResetUserPassword` que se generó cuando instaló Laravel Fortify.

<a id="email-verification"></a>
## Verificación por correo electrónico

Después del registro, es posible que desee que los usuarios verifiquen su dirección de correo electrónico antes de continuar accediendo a su aplicación. Para comenzar, asegúrese de que la función `emailVerification` esté habilitada en la matriz `features` del archivo de configuración `fortify`. A continuación, debe asegurarse de que su clase `App\Models\User` implemente la interfaz `Illuminate\Contracts\Auth\MustVerifyEmail`.

Una vez que se hayan completado estos dos pasos de configuración, los usuarios recién registrados recibirán un correo electrónico solicitándoles que verifiquen la propiedad de su dirección de correo electrónico. Sin embargo, debemos informar a Fortify cómo mostrar la pantalla de verificación de correo electrónico que informa al usuario que debe hacer clic en el enlace de verificación en el correo electrónico.

Toda la lógica de representación de la vista de Fortify se puede personalizar utilizando los métodos apropiados disponibles a través de la clase `Laravel\Fortify\Fortify`. Normalmente, debes llamar a este método desde el método `boot` de la clase `App\Providers\FortifyServiceProvider` de tu aplicación:

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

Fortify se encargará de definir la ruta que muestra esta vista cuando el middleware `verified` integrado de Laravel redirige a un usuario al punto final `/email/verify`.

Su plantilla `verify-email` debe incluir un mensaje informativo que indique al usuario que haga clic en el enlace de verificación de correo electrónico que se envió a su dirección de correo electrónico.

<a id="resending-email-verification-links"></a>
#### Reenviar enlaces de verificación de correo electrónico

Si lo desea, puede agregar un botón a la plantilla `verify-email` de su aplicación que activa una solicitud POST al punto final `/email/verification-notification`. Cuando este punto final recibe una solicitud, se enviará al usuario un nuevo enlace de correo electrónico de verificación, lo que le permitirá obtener un nuevo enlace de verificación si el anterior se eliminó o se perdió accidentalmente.

Si la solicitud para reenviar el correo electrónico del enlace de verificación fue exitosa, Fortify redirigirá al usuario nuevamente al punto final `/email/verify` con una variable de sesión `status`, lo que le permitirá mostrar un mensaje informativo al usuario informándole que la operación fue exitosa. Si la solicitud fue una solicitud XHR, se devolverá una respuesta HTTP 202:

```blade
@if (session('status') == 'verification-link-sent')
    <div class="mb-4 font-medium text-sm text-green-600">
        A new email verification link has been emailed to you!
    </div>
@endif
```

<a id="protecting-routes"></a>
### Proteger rutas

Para especificar que una ruta o grupo de rutas requiere que el usuario haya verificado su dirección de correo electrónico, debe adjuntar el middleware `verified` integrado de Laravel a la ruta. Laravel registra automáticamente el alias del middleware `verified` y sirve como alias para el middleware `Illuminate\Auth\Middleware\EnsureEmailIsVerified`:

```php
Route::get('/dashboard', function () {
    // ...
})->middleware(['verified']);
```

<a id="password-confirmation"></a>
## Confirmación de contraseña

Mientras crea su aplicación, es posible que ocasionalmente tenga acciones que requieran que el usuario confirme su contraseña antes de realizar la acción. Normalmente, estas rutas están protegidas por el middleware `password.confirm` integrado de Laravel.

Para comenzar a implementar la funcionalidad de confirmación de contraseña, debemos indicarle a Fortify cómo devolver la vista de "confirmación de contraseña" de nuestra aplicación. Recuerde, Fortify es una biblioteca de autenticación sin interfaz de usuario. Si desea una implementación de interfaz de las funciones de autenticación de Laravel que ya están completadas para usted, debe usar un [kit de inicio de aplicación](../starter-kits/).

Toda la lógica de representación de vistas de Fortify se puede personalizar utilizando los métodos apropiados disponibles a través de la clase `Laravel\Fortify\Fortify`. Normalmente, debes llamar a este método desde el método `boot` de la clase `App\Providers\FortifyServiceProvider` de tu aplicación:

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

Fortify se encargará de definir el punto final `/user/confirm-password` que devuelve esta vista. Su plantilla `confirm-password` debe incluir un formulario que realice una solicitud POST al punto final `/user/confirm-password`. El punto final `/user/confirm-password` espera un campo `password` que contiene la contraseña actual del usuario.

Si la contraseña coincide con la contraseña actual del usuario, Fortify redirigirá al usuario a la ruta a la que intentaba acceder. Si la solicitud fue una solicitud XHR, se devolverá una respuesta HTTP 201.

Si la solicitud no fue exitosa, el usuario será redirigido nuevamente a la pantalla de confirmación de contraseña y los errores de validación estarán disponibles a través de la variable de plantilla compartida `$errors` Blade. O, en el caso de una solicitud XHR, los errores de validación se devolverán con una respuesta HTTP 422.
