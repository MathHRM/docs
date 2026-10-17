---
title: "Protección CSRF"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#csrf-introduction)
- [Prevención de solicitudes CSRF](#preventing-csrf-requests)
    - [Verificación de origen](#origin-verification)
    - [Exclusión de URI](#csrf-excluding-uris)
- [X-CSRF-Token](#csrf-x-csrf-token)
- [X-XSRF-Token](#csrf-x-xsrf-token)

<a id="csrf-introduction"></a>
## Introducción

Las falsificaciones de solicitudes entre sitios son un tipo de explotación maliciosa mediante el cual se ejecutan comandos no autorizados en nombre de un usuario autenticado. Afortunadamente, Laravel facilita la protección de tu aplicación contra [ataques de falsificación de solicitudes entre sitios](https://en.wikipedia.org/wiki/Cross-site_request_forgery) (CSRF).

<a id="csrf-explanation"></a>
#### Una explicación de la vulnerabilidad

En caso de que no estés familiarizado con las falsificaciones de solicitudes entre sitios, analicemos un ejemplo de cómo se puede explotar esta vulnerabilidad. Imagina que tu aplicación tiene una ruta `/user/email` que acepta una solicitud `POST` para cambiar la dirección de correo electrónico del usuario autenticado. Lo más probable es que esta ruta espere que un campo de entrada `email` contenga la dirección de correo electrónico que el usuario desea comenzar a utilizar.

Sin protección CSRF, un sitio web malintencionado podría crear un formulario HTML que apunte a la ruta `/user/email` de tu aplicación y envíe la propia dirección de correo electrónico del usuario malintencionado:

```blade
<form action="https://your-application.com/user/email" method="POST">
    <input type="email" value="malicious-email@example.com">
</form>

<script>
    document.forms[0].submit();
</script>
```

Si el sitio web malicioso envía automáticamente el formulario al cargarse la página, al atacante le basta con atraer a un usuario desprevenido de tu aplicación a su sitio web para que se cambie la dirección de correo electrónico de ese usuario en tu aplicación.

Para evitar esta vulnerabilidad, debemos inspeccionar cada solicitud entrante `POST`, `PUT`, `PATCH`, `DELETE` o `QUERY` en busca de un valor secreto de sesión al que la aplicación maliciosa no pueda acceder.

<a id="preventing-csrf-requests"></a>
## Prevención de solicitudes CSRF

El [middleware](../middleware/) `Illuminate\Foundation\Http\Middleware\PreventRequestForgery`, que se incluye en el grupo de middleware `web` de forma predeterminada, protege tu aplicación contra falsificaciones de solicitudes entre sitios mediante un enfoque de dos capas.

Primero, el middleware comprueba el encabezado `Sec-Fetch-Site` del navegador. Los navegadores modernos configuran automáticamente este encabezado en cada solicitud, indicando si se originó en el mismo origen, el mismo sitio o otro sitio. Si el encabezado indica que la solicitud provino del mismo origen, la solicitud se permite inmediatamente sin ninguna verificación de token.

Si la verificación de origen no pasa (por ejemplo, porque la solicitud proviene de un navegador antiguo que no envía el encabezado `Sec-Fetch-Site` o porque la conexión no es segura), el middleware recurre a la validación de token CSRF tradicional.

Laravel genera automáticamente un "token" CSRF para cada [sesión de usuario](../session/) activa administrada por la aplicación. Este token se utiliza para verificar que el usuario autenticado es la persona que realmente realiza las solicitudes a la aplicación. Dado que este token se almacena en la sesión del usuario y cambia cada vez que se regenera la sesión, una aplicación maliciosa no puede acceder a él.

Se puede acceder al token CSRF de la sesión actual a través de la sesión de la solicitud o mediante la función auxiliar `csrf_token`:

```php
use Illuminate\Http\Request;

Route::get('/token', function (Request $request) {
    $token = $request->session()->token();

    $token = csrf_token();

    // ...
});
```

Cada vez que definas un formulario HTML "POST", "PUT", "PATCH" o "DELETE" en tu aplicación, debes incluir un campo CSRF `_token` oculto en el formulario para que el middleware de protección CSRF pueda validar la solicitud. Para mayor comodidad, puedes utilizar la directiva Blade `@csrf` para generar el campo de entrada del token oculto:

```blade
<form method="POST" action="/profile">
    @csrf

    <!-- Equivalent to... -->
    <input type="hidden" name="_token" value="{{ csrf_token() }}" />
</form>
```

<a id="csrf-tokens-and-spas"></a>
#### Tokens CSRF y SPA

Si estás creando una SPA que utiliza Laravel como backend de API, debes consultar la [documentación de Laravel Sanctum](../sanctum/) para obtener información sobre cómo autenticarte con tu API y protegerte contra vulnerabilidades CSRF.

<a id="origin-verification"></a>
### Verificación de origen

Como se mencionó anteriormente, el middleware de falsificación de solicitudes de Laravel primero verifica el encabezado `Sec-Fetch-Site` para determinar si la solicitud proviene del mismo origen. De forma predeterminada, si esta verificación no pasa, el middleware recurre a la validación del token CSRF.

Sin embargo, si quieres confiar únicamente en la verificación de origen y deshabilitar completamente la validación alternativa del token CSRF, puedes hacerlo utilizando el método `preventRequestForgery` en el archivo `bootstrap/app.php` de tu aplicación:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->preventRequestForgery(originOnly: true);
})
```

Cuando se utiliza el modo de solo origen, las solicitudes que no superan la verificación de origen recibirán una respuesta HTTP `403` en lugar de la respuesta `419` normalmente asociada con discrepancias de tokens CSRF.

> **Advertencia:**
> El encabezado `Sec-Fetch-Site` solo lo envían los navegadores a través de conexiones seguras (HTTPS). Si tu aplicación no se entrega a través de HTTPS, la verificación de origen no estará disponible y el middleware recurrirá a la validación del token CSRF.

Si tu aplicación necesita aceptar solicitudes de subdominios (por ejemplo, `dashboard.example.com` acepta solicitudes de `example.com`), puedes permitir solicitudes del mismo sitio además de solicitudes del mismo origen:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->preventRequestForgery(allowSameSite: true);
})
```

<a id="csrf-excluding-uris"></a>
### Exclusión de URI de la protección CSRF

A veces puede que quieras excluir un conjunto de URI de la protección CSRF. Por ejemplo, si estás utilizando [Stripe](https://stripe.com) para procesar pagos y estás utilizando su sistema de webhook, deberás excluir la ruta del controlador de webhook de Stripe de la protección CSRF, ya que Stripe no sabrá qué token CSRF enviar a tus rutas.

Normalmente, debes colocar este tipo de rutas fuera del grupo de middleware `web` que Laravel aplica a todas las rutas en el archivo `routes/web.php`. Sin embargo, también puedes excluir rutas específicas proporcionando sus URI al método `preventRequestForgery` en el archivo `bootstrap/app.php` de tu aplicación:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->preventRequestForgery(except: [
        'stripe/*',
        'http://example.com/foo/bar',
        'http://example.com/foo/*',
    ]);
})
```

> **Nota:**
> Para mayor comodidad, el middleware CSRF se desactiva automáticamente para todas las rutas al [ejecutar pruebas](../testing/).

<a id="csrf-x-csrf-token"></a>
## X-CSRF-TOKEN

Además de verificar el token CSRF como parámetro POST, el middleware `PreventRequestForgery` también verificará el encabezado de solicitud `X-CSRF-TOKEN`. Podrías, por ejemplo, almacenar el token en una etiqueta HTML `meta`:

```blade
<meta name="csrf-token" content="{{ csrf_token() }}">
```

Luego, puedes indicarle a una biblioteca como jQuery que agregue automáticamente el token a todos los encabezados de solicitud. Esto proporciona una protección CSRF sencilla y cómoda para tus aplicaciones basadas en AJAX que utilizan tecnología JavaScript heredada:

```js
$.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
});
```

<a id="csrf-x-xsrf-token"></a>
## X-XSRF-TOKEN

Laravel almacena el token CSRF actual en una cookie `XSRF-TOKEN` cifrada que se incluye con cada respuesta generada por el framework. Puedes utilizar el valor de la cookie para configurar el encabezado de solicitud `X-XSRF-TOKEN`.

Esta cookie se envía principalmente para comodidad del desarrollador, ya que algunos frameworks y bibliotecas de JavaScript, como Angular y Axios, colocan automáticamente su valor en el encabezado `X-XSRF-TOKEN` en solicitudes del mismo origen.
