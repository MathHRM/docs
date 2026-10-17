---
title: "Restablecer contraseñas"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
    - [Configuración](#configuration)
    - [Requisitos previos del controlador](#driver-prerequisites)
    - [Preparación del modelo](#model-preparation)
    - [Configuración de hosts confiables](#configuring-trusted-hosts)
- [Enrutamiento](#routing)
    - [Solicitando el enlace para restablecer contraseña](#requesting-the-password-reset-link)
    - [Restablecer la contraseña](#resetting-the-password)
- [Eliminación de tokens caducados](#deleting-expired-tokens)
- [Personalización](#password-customization)

<a id="introduction"></a>
## Introducción

La mayoría de las aplicaciones web ofrecen a los usuarios una forma de restablecer sus contraseñas olvidadas. En lugar de obligarlo a volver a implementar esto manualmente para cada aplicación que cree, Laravel proporciona servicios convenientes para enviar enlaces de restablecimiento de contraseña y restablecimiento seguro de contraseñas.

> **Nota:**
> ¿Quieres empezar rápido? Instale un Laravel [kit de inicio de aplicación](../starter-kits/) en una aplicación Laravel nueva. Los kits de inicio de Laravel se encargarán de armar todo su sistema de autenticación, incluido el restablecimiento de contraseñas olvidadas.

<a id="configuration"></a>
### Configuración

El archivo de configuración de restablecimiento de contraseña de su aplicación se almacena en `config/auth.php`. Asegúrese de revisar las opciones disponibles en este archivo. De forma predeterminada, Laravel está configurado para usar el controlador de restablecimiento de contraseña `database`.

La opción de configuración de restablecimiento de contraseña `driver` define dónde se almacenarán los datos de restablecimiento de contraseña. Laravel incluye dos controladores:

<div class="content-list" markdown="1">

- `database`: los datos de restablecimiento de contraseña se almacenan en una base de datos relacional.
- `cache`: los datos de restablecimiento de contraseña se almacenan en uno de sus almacenes basados ​​en caché.

</div>

<a id="driver-prerequisites"></a>
### Requisitos previos del controlador

<a id="database"></a>
#### Base de datos

Cuando se utiliza el controlador `database` predeterminado, se debe crear una tabla para almacenar los tokens de restablecimiento de contraseña de su aplicación. Normalmente, esto se incluye en la migración de base de datos `0001_01_01_000000_create_users_table.php` predeterminada de Laravel.

<a id="cache"></a>
#### Caché

También hay un controlador de caché disponible para manejar restablecimientos de contraseñas, que no requiere una tabla de base de datos dedicada. Las entradas se codifican mediante un hash SHA-256 de la dirección de correo electrónico del usuario:

```php
'passwords' => [
    'users' => [
        'driver' => 'cache',
        'provider' => 'users',
        'store' => 'passwords', // Optional...
        'expire' => 60,
        'throttle' => 60,
    ],
],
```

Para evitar que una llamada a `artisan cache:clear` borre los datos de restablecimiento de contraseña, opcionalmente puede especificar un almacén de caché separado con la clave de configuración `store`. El valor debe corresponder a una tienda configurada en su valor de configuración `config/cache.php`.

<a id="model-preparation"></a>
### Preparación del modelo

Antes de usar las funciones de restablecimiento de contraseña de Laravel, el modelo `App\Models\User` de su aplicación debe usar el rasgo `Illuminate\Notifications\Notifiable`. Normalmente, este rasgo ya está incluido en el modelo predeterminado `App\Models\User` que se crea con nuevas aplicaciones de Laravel.

A continuación, verifique que su modelo `App\Models\User` implemente el contrato `Illuminate\Contracts\Auth\CanResetPassword`. El modelo `App\Models\User` incluido con el marco ya implementa esta interfaz y utiliza el rasgo `Illuminate\Auth\Passwords\CanResetPassword` para incluir los métodos necesarios para implementar la interfaz.

<a id="configuring-trusted-hosts"></a>
### Configuración de hosts confiables

De forma predeterminada, Laravel responderá a todas las solicitudes que reciba independientemente del contenido del encabezado `Host` de la solicitud HTTP. Además, el valor del encabezado `Host` se utilizará al generar URL absolutas para su aplicación durante una solicitud web.

Normalmente, debe configurar su servidor web, como Nginx o Apache, para enviar solo solicitudes a su aplicación que coincidan con un nombre de host determinado. Sin embargo, si no tiene la capacidad de personalizar su servidor web directamente y necesita indicarle a Laravel que solo responda a ciertos nombres de host, puede hacerlo utilizando el método de middleware `trustHosts` en el archivo `bootstrap/app.php` de su aplicación. Esto es particularmente importante cuando su aplicación ofrece la función de restablecimiento de contraseña.

Para obtener más información sobre este método de middleware, consulte la [documentación de middleware de TrustHosts](../requests/#configuring-trusted-hosts).

<a id="routing"></a>
## Enrutamiento

Para implementar correctamente el soporte para permitir a los usuarios restablecer sus contraseñas, necesitaremos definir varias rutas. Primero, necesitaremos un par de rutas para permitir al usuario solicitar un enlace de restablecimiento de contraseña a través de su dirección de correo electrónico. En segundo lugar, necesitaremos un par de rutas para manejar el restablecimiento de la contraseña una vez que el usuario visita el enlace de restablecimiento de contraseña que se le envía por correo electrónico y completa el formulario de restablecimiento de contraseña.

<a id="requesting-the-password-reset-link"></a>
### Solicitar el enlace para restablecer la contraseña

<a id="the-password-reset-link-request-form"></a>
#### El formulario de solicitud de enlace para restablecer contraseña

Primero, definiremos las rutas necesarias para solicitar enlaces de restablecimiento de contraseña. Para comenzar, definiremos una ruta que devuelva una vista con el formulario de solicitud de enlace de restablecimiento de contraseña:

```php
Route::get('/forgot-password', function () {
    return view('auth.forgot-password');
})->middleware('guest')->name('password.request');
```

La vista devuelta por esta ruta debe tener un formulario que contenga un campo `email`, que permitirá al usuario solicitar un enlace de restablecimiento de contraseña para una dirección de correo electrónico determinada.

<a id="password-reset-link-handling-the-form-submission"></a>
#### Manejo del envío del formulario

A continuación, definiremos una ruta que maneje la solicitud de envío del formulario desde la vista "Olvidé mi contraseña". Esta ruta será la encargada de validar la dirección de correo electrónico y enviar la solicitud de restablecimiento de contraseña al usuario correspondiente:

```php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;

Route::post('/forgot-password', function (Request $request) {
    $request->validate(['email' => 'required|email']);

    $status = Password::sendResetLink(
        $request->only('email')
    );

    return $status === Password::ResetLinkSent
        ? back()->with(['status' => __($status)])
        : back()->withErrors(['email' => __($status)]);
})->middleware('guest')->name('password.email');
```

Antes de continuar, examinemos esta ruta con más detalle. Primero, se valida el atributo `email` de la solicitud. A continuación, utilizaremos el "agente de contraseñas" integrado de Laravel (a través de la fachada `Password`) para enviar un enlace de restablecimiento de contraseña al usuario. El agente de contraseñas se encargará de recuperar al usuario mediante el campo indicado (en este caso, la dirección de correo electrónico) y de enviarle un enlace para restablecer la contraseña a través del [sistema de notificación ](../notifications/) integrado de Laravel.

El método `sendResetLink` devuelve un slug de "estado". Este estado se puede traducir utilizando los ayudantes [localization](../localization/) de Laravel para mostrar un mensaje fácil de usar al usuario sobre el estado de su solicitud. La traducción del estado de restablecimiento de contraseña está determinada por el archivo de idioma `lang/{lang}/passwords.php` de su aplicación. Una entrada para cada valor posible del slug de estado se encuentra dentro del archivo de idioma `passwords`.

> **Nota:**
> De forma predeterminada, el esqueleto de la aplicación Laravel no incluye el directorio `lang`. Si desea personalizar los archivos de idioma de Laravel, puede publicarlos mediante el comando `lang:publish` Artisan.

Quizás se pregunte cómo sabe Laravel cómo recuperar el registro de usuario de la base de datos de su aplicación cuando llama al método `sendResetLink` de la fachada `Password`. El agente de contraseñas de Laravel utiliza los "proveedores de usuarios" de su sistema de autenticación para recuperar registros de la base de datos. El proveedor de usuario utilizado por el agente de contraseñas se configura dentro de la matriz de configuración `passwords` de su archivo de configuración `config/auth.php`. Para obtener más información sobre cómo escribir proveedores de usuarios personalizados, consulte la [documentación de autenticación](../authentication/#adding-custom-user-providers).

> **Nota:**
> Al implementar manualmente el restablecimiento de contraseñas, usted mismo debe definir el contenido de las vistas y rutas. Si desea un andamiaje que incluya toda la lógica de autenticación y verificación necesaria, consulte los [kits de inicio de aplicaciones Laravel](../starter-kits/).

<a id="resetting-the-password"></a>
### Restablecer la contraseña

<a id="the-password-reset-form"></a>
#### El formulario de restablecimiento de contraseña

A continuación, definiremos las rutas necesarias para restablecer la contraseña una vez que el usuario haga clic en el enlace de restablecimiento de contraseña que se le envió por correo electrónico y proporcione una nueva contraseña. Primero, definamos la ruta que mostrará el formulario de restablecimiento de contraseña que se muestra cuando el usuario hace clic en el enlace de restablecimiento de contraseña. Esta ruta recibirá un parámetro `token` que usaremos más adelante para verificar la solicitud de restablecimiento de contraseña:

```php
Route::get('/reset-password/{token}', function (string $token) {
    return view('auth.reset-password', ['token' => $token]);
})->middleware('guest')->name('password.reset');
```

La vista que devuelve esta ruta debe mostrar un formulario que contiene un campo `email`, un campo `password`, un campo `password_confirmation` y un campo `token` oculto, que debe contener el valor del secreto `$token` recibido por nuestra ruta.

<a id="password-reset-handling-the-form-submission"></a>
#### Manejo del envío del formulario

Por supuesto, necesitamos definir una ruta para manejar realmente el envío del formulario de restablecimiento de contraseña. Esta ruta será la encargada de validar la solicitud entrante y actualizar la contraseña del usuario en la base de datos:

```php
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

Route::post('/reset-password', function (Request $request) {
    $request->validate([
        'token' => 'required',
        'email' => 'required|email',
        'password' => 'required|min:8|confirmed',
    ]);

    $status = Password::reset(
        $request->only('email', 'password', 'password_confirmation', 'token'),
        function (User $user, string $password) {
            $user->forceFill([
                'password' => Hash::make($password)
            ])->setRememberToken(Str::random(60));

            $user->save();

            event(new PasswordReset($user));
        }
    );

    return $status === Password::PasswordReset
        ? redirect()->route('login')->with('status', __($status))
        : back()->withErrors(['email' => [__($status)]]);
})->middleware('guest')->name('password.update');
```

Antes de continuar, examinemos esta ruta con más detalle. Primero, se validan los atributos `token`, `email` y `password` de la solicitud. A continuación, utilizaremos el "agente de contraseñas" integrado de Laravel (a través de la fachada `Password`) para validar las credenciales de solicitud de restablecimiento de contraseña.

Si el token, la dirección de correo electrónico y la contraseña proporcionados al agente de contraseñas son válidos, se invocará la función anónima pasada al método `reset`. Dentro de esta función anónima, que recibe la instancia de usuario y la contraseña en texto plano proporcionada en el formulario de restablecimiento de contraseña, podemos actualizar la contraseña del usuario en la base de datos.

El método `reset` devuelve un slug de "estado". Este estado se puede traducir utilizando los ayudantes [localization](../localization/) de Laravel para mostrar un mensaje fácil de usar al usuario sobre el estado de su solicitud. La traducción del estado de restablecimiento de contraseña está determinada por el archivo de idioma `lang/{lang}/passwords.php` de su aplicación. Una entrada para cada valor posible del slug de estado se encuentra dentro del archivo de idioma `passwords`. Si su aplicación no contiene un directorio `lang`, puede crearlo usando el comando `lang:publish` Artisan.

Antes de continuar, es posible que se pregunte cómo sabe Laravel cómo recuperar el registro de usuario de la base de datos de su aplicación cuando llama al método `reset` de la fachada `Password`. El agente de contraseñas de Laravel utiliza los "proveedores de usuarios" de su sistema de autenticación para recuperar registros de la base de datos. El proveedor de usuario utilizado por el agente de contraseñas se configura dentro de la matriz de configuración `passwords` de su archivo de configuración `config/auth.php`. Para obtener más información sobre cómo escribir proveedores de usuarios personalizados, consulte la [documentación de autenticación](../authentication/#adding-custom-user-providers).

<a id="deleting-expired-tokens"></a>
## Eliminación de tokens caducados

Si está utilizando el controlador `database`, los tokens de restablecimiento de contraseña que hayan caducado seguirán presentes en su base de datos. Sin embargo, puede eliminar fácilmente estos registros usando el comando `auth:clear-resets` Artisan:

```shell
php artisan auth:clear-resets
```

Si desea automatizar este proceso, considere agregar el comando al [scheduler](../scheduling/): de su aplicación:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('auth:clear-resets')->everyFifteenMinutes();
```

<a id="password-customization"></a>
## Personalización

<a id="reset-link-customization"></a>
#### Restablecer personalización del enlace

Puede personalizar la URL del enlace de restablecimiento de contraseña utilizando el método `createUrlUsing` proporcionado por la clase de notificación `ResetPassword`. Este método acepta una función anónima que recibe la instancia de usuario que recibe la notificación, así como el token de enlace de restablecimiento de contraseña. Normalmente, debe llamar a este método desde el método `boot` del `AppServiceProvider` de su aplicación:

```php
use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    ResetPassword::createUrlUsing(function (User $user, string $token) {
        return 'https://example.com/reset-password?token='.$token;
    });
}
```

<a id="reset-email-customization"></a>
#### Restablecer personalización de correo electrónico

Puede modificar fácilmente la clase de notificación utilizada para enviar el enlace de restablecimiento de contraseña al usuario. Para comenzar, anule el método `sendPasswordResetNotification` en su modelo `App\Models\User`. Dentro de este método, puede enviar la notificación utilizando cualquier [clase de notificación](../notifications/) de su propia creación. El restablecimiento de contraseña `$token` es el primer argumento recibido por el método. Puede utilizar este `$token` para crear la URL de restablecimiento de contraseña de su elección y enviar su notificación al usuario:

```php
use App\Notifications\ResetPasswordNotification;

/**
 * Send a password reset notification to the user.
 *
 * @param  string  $token
 */
public function sendPasswordResetNotification($token): void
{
    $url = 'https://example.com/reset-password?token='.$token;

    $this->notify(new ResetPasswordNotification($url));
}
```
