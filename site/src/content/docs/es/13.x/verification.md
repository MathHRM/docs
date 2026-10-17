---
title: "Verificación de correo electrónico"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
    - [Preparación del modelo](#model-preparation)
    - [Preparación de base de datos](#database-preparation)
- [Enrutamiento](#verification-routing)
    - [El aviso de verificación por correo electrónico](#the-email-verification-notice)
    - [El controlador de verificación de correo electrónico](#the-email-verification-handler)
    - [Reenviar el correo electrónico de verificación](#resending-the-verification-email)
    - [Protegiendo Rutas](#protecting-routes)
- [Personalización](#customization)
- [Eventos](#events)

<a id="introduction"></a>
## Introducción

Muchas aplicaciones web requieren que los usuarios verifiquen sus direcciones de correo electrónico antes de utilizar la aplicación. En lugar de obligarlo a volver a implementar esta función manualmente para cada aplicación que cree, Laravel proporciona convenientes servicios integrados para enviar y verificar solicitudes de verificación de correo electrónico.

> **Nota:**
> ¿Quieres empezar rápido? Instale uno de los [kits de inicio de aplicaciones Laravel](../starter-kits/) en una aplicación Laravel nueva. Los kits de inicio se encargarán de armar todo su sistema de autenticación, incluido el soporte de verificación por correo electrónico.

<a id="model-preparation"></a>
### Preparación del modelo

Antes de comenzar, verifique que su modelo `App\Models\User` implemente el contrato `Illuminate\Contracts\Auth\MustVerifyEmail`:

```php
<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements MustVerifyEmail
{
    use Notifiable;

    // ...
}
```

Una vez que se haya agregado esta interfaz a su modelo, los usuarios recién registrados recibirán automáticamente un correo electrónico que contiene un enlace de verificación de correo electrónico. Esto sucede sin problemas porque Laravel registra automáticamente el `Illuminate\Auth\Listeners\SendEmailVerificationNotification` [oyente](../events/) para el evento `Illuminate\Auth\Events\Registered`.

Si está implementando el registro manualmente dentro de su aplicación en lugar de usar [un kit de inicio](../starter-kits/), debe asegurarse de enviar el evento `Illuminate\Auth\Events\Registered` después de que el registro de un usuario sea exitoso:

```php
use Illuminate\Auth\Events\Registered;

event(new Registered($user));
```

<a id="database-preparation"></a>
### Preparación de la base de datos

A continuación, su tabla `users` debe contener una columna `email_verified_at` para almacenar la fecha y hora en que se verificó la dirección de correo electrónico del usuario. Normalmente, esto se incluye en la migración de base de datos `0001_01_01_000000_create_users_table.php` predeterminada de Laravel.

<a id="verification-routing"></a>
## Enrutamiento

Para implementar correctamente la verificación del correo electrónico, será necesario definir tres rutas. Primero, se necesitará una ruta para mostrar un aviso al usuario diciéndole que debe hacer clic en el enlace de verificación de correo electrónico en el correo electrónico de verificación que Laravel le envió después del registro.

En segundo lugar, se necesitará una ruta para manejar las solicitudes generadas cuando el usuario hace clic en el enlace de verificación del correo electrónico.

En tercer lugar, se necesitará una ruta para reenviar un enlace de verificación si el usuario pierde accidentalmente el primer enlace de verificación.

<a id="the-email-verification-notice"></a>
### El aviso de verificación de correo electrónico

Como se mencionó anteriormente, se debe definir una ruta que devolverá una vista que indique al usuario que haga clic en el enlace de verificación por correo electrónico que Laravel le envió por correo electrónico después del registro. Esta vista se mostrará a los usuarios cuando intenten acceder a otras partes de la aplicación sin verificar primero su dirección de correo electrónico. Recuerde, el enlace se envía automáticamente por correo electrónico al usuario siempre que su modelo `App\Models\User` implemente la interfaz `MustVerifyEmail`:

```php
Route::get('/email/verify', function () {
    return view('auth.verify-email');
})->middleware('auth')->name('verification.notice');
```

La ruta que devuelve el aviso de verificación por correo electrónico debe denominarse `verification.notice`. Es importante que a la ruta se le asigne este nombre exacto, ya que el middleware `verified` [incluido con Laravel](#protecting-routes) redirigirá automáticamente a este nombre de ruta si un usuario no ha verificado su dirección de correo electrónico.

> **Nota:**
> Al implementar manualmente la verificación por correo electrónico, usted mismo debe definir el contenido de la vista del aviso de verificación. Si desea un scaffolding que incluya todas las vistas de autenticación y verificación necesarias, consulte los [kits de inicio de aplicaciones Laravel](../starter-kits/).

<a id="the-email-verification-handler"></a>
### El controlador de verificación de correo electrónico

A continuación, debemos definir una ruta que manejará las solicitudes generadas cuando el usuario hace clic en el enlace de verificación de correo electrónico que se le envió por correo electrónico. Esta ruta debe denominarse `verification.verify` y se le deben asignar los middlewares `auth` y `signed`:

```php
use Illuminate\Foundation\Auth\EmailVerificationRequest;

Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
    $request->fulfill();

    return redirect('/home');
})->middleware(['auth', 'signed'])->name('verification.verify');
```

Antes de continuar, echemos un vistazo más de cerca a esta ruta. Primero, notará que estamos usando un tipo de solicitud `EmailVerificationRequest` en lugar de la instancia típica `Illuminate\Http\Request`. El `EmailVerificationRequest` es un [formulario de solicitud](../validation/#form-request-validation) que se incluye con Laravel. Esta solicitud se encargará automáticamente de validar los parámetros `id` y `hash` de la solicitud.

A continuación, podemos proceder directamente a llamar al método `fulfill` en la solicitud. Este método llamará al método `markEmailAsVerified` en el usuario autenticado y enviará el evento `Illuminate\Auth\Events\Verified`. El método `markEmailAsVerified` está disponible para el modelo `App\Models\User` predeterminado a través de la clase base `Illuminate\Foundation\Auth\User`. Una vez verificada la dirección de correo electrónico del usuario, podrás redirigirlo a donde desees.

<a id="resending-the-verification-email"></a>
### Reenviar el correo electrónico de verificación

A veces, un usuario puede extraviar o eliminar accidentalmente el correo electrónico de verificación de la dirección de correo electrónico. Para adaptarse a esto, es posible que desee definir una ruta que permita al usuario solicitar que se reenvíe el correo electrónico de verificación. Luego puede realizar una solicitud a esta ruta colocando un botón de envío de formulario simple dentro de su [vista de aviso de verificación](#the-email-verification-notice):

```php
use Illuminate\Http\Request;

Route::post('/email/verification-notification', function (Request $request) {
    $request->user()->sendEmailVerificationNotification();

    return back()->with('message', 'Verification link sent!');
})->middleware(['auth', 'throttle:6,1'])->name('verification.send');
```

<a id="protecting-routes"></a>
### Proteger rutas

[El middleware de ruta ](../middleware/) se puede utilizar para permitir que solo los usuarios verificados accedan a una ruta determinada. Laravel incluye un `verified` [alias de middleware](../middleware/#middleware-aliases), que es un alias para la clase de middleware `Illuminate\Auth\Middleware\EnsureEmailIsVerified`. Dado que Laravel ya registra automáticamente este alias, todo lo que necesita hacer es adjuntar el middleware `verified` a una definición de ruta. Normalmente, este middleware se combina con el middleware `auth`:

```php
Route::get('/profile', function () {
    // Only verified users may access this route...
})->middleware(['auth', 'verified']);
```

Si un usuario no verificado intenta acceder a una ruta a la que se le ha asignado este middleware, será redirigido automáticamente al `verification.notice` [llamado ruta](../routing/#named-routes).

<a id="customization"></a>
## Personalización

<a id="verification-email-customization"></a>
#### Personalización del correo electrónico de verificación

Aunque la notificación de verificación de correo electrónico predeterminada debería satisfacer los requisitos de la mayoría de las aplicaciones, Laravel le permite personalizar cómo se construye el mensaje de correo electrónico de verificación.

Para comenzar, pase una función anónima al método `toMailUsing` proporcionado por la notificación `Illuminate\Auth\Notifications\VerifyEmail`. La función anónima recibirá la instancia del modelo notificable que está recibiendo la notificación, así como la URL de verificación de correo electrónico firmada que el usuario debe visitar para verificar su dirección de correo electrónico. La función anónima debería devolver una instancia de `Illuminate\Notifications\Messages\MailMessage`. Normalmente, debes llamar al método `toMailUsing` desde el método `boot` de la clase `AppServiceProvider` de tu aplicación:

```php
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    // ...

    VerifyEmail::toMailUsing(function (object $notifiable, string $url) {
        return (new MailMessage)
            ->subject('Verify Email Address')
            ->line('Click the button below to verify your email address.')
            ->action('Verify Email Address', $url);
    });
}
```

> **Nota:**
> Para obtener más información sobre las notificaciones por correo, consulte la [documentación de notificación por correo](../notifications/#mail-notifications).

<a id="events"></a>
## Eventos

Cuando se utilizan los [kits de inicio de la aplicación Laravel](../starter-kits/), Laravel envía un `Illuminate\Auth\Events\Verified` [event](../events/) durante el proceso de verificación del correo electrónico. Si maneja manualmente la verificación por correo electrónico para su aplicación, es posible que desee enviar estos eventos manualmente una vez completada la verificación.
