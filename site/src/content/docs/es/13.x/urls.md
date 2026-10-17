---
title: "Generación de URL"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Conceptos básicos](#the-basics)
    - [Generando URL](#generating-urls)
    - [Accediendo a la URL actual](#accessing-the-current-url)
- [URL para rutas con nombre](#urls-for-named-routes)
    - [URL firmadas](#signed-urls)
- [URL para acciones del controlador ](#urls-for-controller-actions)
- [Objetos URI fluidos](#fluent-uri-objects)
- [Valores predeterminados](#default-values)

<a id="introduction"></a>
## Introducción

Laravel proporciona varios asistentes para ayudarle a generar URL para su aplicación. Estos ayudantes son principalmente útiles al crear enlaces en sus plantillas y respuestas API, o al generar respuestas de redireccionamiento a otra parte de su aplicación.

<a id="the-basics"></a>
## Los conceptos básicos

<a id="generating-urls"></a>
### Generando URL

El asistente `url` se puede utilizar para generar URL arbitrarias para su aplicación. La URL generada utilizará automáticamente el esquema (HTTP o HTTPS) y el host de la solicitud actual que maneja la aplicación:

```php
$post = App\Models\Post::find(1);

echo url("/posts/{$post->id}");

// http://example.com/posts/1
```

Para generar una URL con parámetros de cadena de consulta, puede utilizar el método `query`:

```php
echo url()->query('/posts', ['search' => 'Laravel']);

// https://example.com/posts?search=Laravel

echo url()->query('/posts?sort=latest', ['search' => 'Laravel']);

// http://example.com/posts?sort=latest&search=Laravel
```

Proporcionar parámetros de cadena de consulta que ya existen en la ruta sobrescribirá su valor existente:

```php
echo url()->query('/posts?sort=latest', ['sort' => 'oldest']);

// http://example.com/posts?sort=oldest
```

También se pueden pasar matrices de valores como parámetros de consulta. Estos valores se introducirán y codificarán correctamente en la URL generada:

```php
echo $url = url()->query('/posts', ['columns' => ['title', 'body']]);

// http://example.com/posts?columns%5B0%5D=title&columns%5B1%5D=body

echo urldecode($url);

// http://example.com/posts?columns[0]=title&columns[1]=body
```

<a id="accessing-the-current-url"></a>
### Accediendo a la URL actual

Si no se proporciona ninguna ruta al asistente `url`, se devuelve una instancia de `Illuminate\Routing\UrlGenerator`, lo que le permite acceder a información sobre la URL actual:

```php
// Obtener la URL actual sin la cadena de consulta...
echo url()->current();

// Obtener la URL actual, incluida la cadena de consulta...
echo url()->full();
```

También se puede acceder a cada uno de estos métodos a través de `URL` [facade](../facades/):

```php
use Illuminate\Support\Facades\URL;

echo URL::current();
```

<a id="accessing-the-previous-url"></a>
#### Accediendo a la URL anterior

A veces es útil saber la URL anterior desde la que visita el usuario. Puede acceder a la URL anterior a través de los métodos `previous` y `previousPath` del asistente `url`:

```php
// Obtener la URL completa de la solicitud anterior...
echo url()->previous();

// Obtener la ruta de la solicitud anterior...
echo url()->previousPath();
```

O, a través de [session](../session/), puede acceder a la URL anterior como una [instancia URI](#fluent-uri-objects) fluida:

```php
use Illuminate\Http\Request;

Route::post('/users', function (Request $request) {
    $previousUri = $request->session()->previousUri();

    // ...
});
```

También es posible recuperar el nombre de la ruta de la URL visitada anteriormente a través de la sesión:

```php
$previousRoute = $request->session()->previousRoute();
```

<a id="urls-for-named-routes"></a>
## URL para rutas con nombre

El asistente `route` se puede utilizar para generar URL a [rutas con nombre](../routing/#named-routes). Las rutas con nombre le permiten generar URL sin estar asociadas a la URL real definida en la ruta. Por lo tanto, si la URL de la ruta cambia, no es necesario realizar cambios en sus llamadas a la función `route`. Por ejemplo, imagine que su aplicación contiene una ruta definida como la siguiente:

```php
Route::get('/post/{post}', function (Post $post) {
    // ...
})->name('post.show');
```

Para generar una URL a esta ruta, puede utilizar el asistente `route` así:

```php
echo route('post.show', ['post' => 1]);

// http://example.com/post/1
```

Por supuesto, el asistente `route` también se puede utilizar para generar URL para rutas con múltiples parámetros:

```php
Route::get('/post/{post}/comment/{comment}', function (Post $post, Comment $comment) {
    // ...
})->name('comment.show');

echo route('comment.show', ['post' => 1, 'comment' => 3]);

// http://example.com/post/1/comment/3
```

Cualquier elemento de matriz adicional que no corresponda con los parámetros de definición de la ruta se agregará a la cadena de consulta de la URL:

```php
echo route('post.show', ['post' => 1, 'search' => 'rocket']);

// http://example.com/post/1?search=rocket
```

<a id="eloquent-models"></a>
#### Modelos elocuentes

A menudo generará URL utilizando la clave de ruta (normalmente la clave principal) de [Eloquent models](../eloquent/). Por este motivo, puede pasar modelos de Eloquent como valores de parámetros. El asistente `route` extraerá automáticamente la clave de ruta del modelo:

```php
echo route('post.show', ['post' => $post]);
```

<a id="signed-urls"></a>
### URL firmadas

Laravel le permite crear fácilmente URL "firmadas" para rutas con nombre. Estas URL tienen un hash de "firma" adjunto a la cadena de consulta que permite a Laravel verificar que la URL no ha sido modificada desde su creación. Las URL firmadas son especialmente útiles para rutas a las que se puede acceder públicamente pero que necesitan una capa de protección contra la manipulación de URL.

Por ejemplo, puede utilizar URL firmadas para implementar un enlace público de "cancelación de suscripción" que se envía por correo electrónico a sus clientes. Para crear una URL firmada para una ruta con nombre, utilice el método `signedRoute` de la fachada `URL`:

```php
use Illuminate\Support\Facades\URL;

return URL::signedRoute('unsubscribe', ['user' => 1]);
```

Puede excluir el dominio del hash de URL firmado proporcionando el argumento `absolute` al método `signedRoute`:

```php
return URL::signedRoute('unsubscribe', ['user' => 1], absolute: false);
```

Si desea generar una URL de ruta firmada temporal que caduque después de un período de tiempo específico, puede utilizar el método `temporarySignedRoute`. Cuando Laravel valida una URL de ruta firmada temporal, se asegurará de que la marca de tiempo de vencimiento codificada en la URL firmada no haya transcurrido:

```php
use Illuminate\Support\Facades\URL;

return URL::temporarySignedRoute(
    'unsubscribe', now()->plus(minutes: 30), ['user' => 1]
);
```

<a id="validating-signed-route-requests"></a>
#### Validación de solicitudes de ruta firmadas

Para verificar que una solicitud entrante tenga una firma válida, debe llamar al método `hasValidSignature` en la instancia `Illuminate\Http\Request` entrante:

```php
use Illuminate\Http\Request;

Route::get('/unsubscribe/{user}', function (Request $request) {
    if (! $request->hasValidSignature()) {
        abort(401);
    }

    // ...
})->name('unsubscribe');
```

A veces, es posible que necesite permitir que la interfaz de su aplicación agregue datos a una URL firmada, como cuando realiza la paginación del lado del cliente. Por lo tanto, puede especificar parámetros de consulta de solicitud que se deben ignorar al validar una URL firmada mediante el método `hasValidSignatureWhileIgnoring`. Recuerde, ignorar los parámetros permite que cualquiera pueda modificarlos en la solicitud:

```php
if (! $request->hasValidSignatureWhileIgnoring(['page', 'order'])) {
    abort(401);
}
```

En lugar de validar las URL firmadas utilizando la instancia de solicitud entrante, puede asignar `signed` (`Illuminate\Routing\Middleware\ValidateSignature`) [middleware](../middleware/) a la ruta. Si la solicitud entrante no tiene una firma válida, el middleware devolverá automáticamente una respuesta HTTP `403`:

```php
Route::post('/unsubscribe/{user}', function (Request $request) {
    // ...
})->name('unsubscribe')->middleware('signed');
```

Si sus URL firmadas no incluyen el dominio en el hash de URL, debe proporcionar el argumento `relative` al middleware:

```php
Route::post('/unsubscribe/{user}', function (Request $request) {
    // ...
})->name('unsubscribe')->middleware('signed:relative');
```

> **Advertencia:**
> Una firma solo cubre la ruta de la URL y la cadena de consulta. Cualquier otra entrada de solicitud, como un formulario o un cuerpo de solicitud JSON, no está firmada y el usuario puede modificarla libremente. Dado que Laravel fusiona estas fuentes de entrada y le da prioridad al cuerpo de la solicitud sobre la cadena de consulta, recuperar la entrada con cualquier método que no sea `query`, como `input`, `all` o una propiedad de solicitud dinámica, puede devolver valores sin firmar que anulan los valores de la cadena de consulta firmada. Por lo tanto, siempre debe recuperar valores con signo utilizando el método `query`, como `$request->query('email')`. Esto incluye solicitudes `GET`, ya que una solicitud `GET` especialmente diseñada aún puede contener un cuerpo de solicitud JSON.

<a id="responding-to-invalid-signed-routes"></a>
#### Responder a rutas firmadas no válidas

Cuando alguien visita una URL firmada que ha caducado, recibirá una página de error genérica para el código de estado HTTP `403`. Sin embargo, puede personalizar este comportamiento definiendo una función anónima de "renderización" personalizada para la excepción `InvalidSignatureException` en el archivo `bootstrap/app.php` de su aplicación:

```php
use Illuminate\Routing\Exceptions\InvalidSignatureException;

->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->render(function (InvalidSignatureException $e) {
        return response()->view('errors.link-expired', status: 403);
    });
})
```

<a id="urls-for-controller-actions"></a>
## URL para acciones del controlador

La función `action` genera una URL para la acción del controlador determinada:

```php
use App\Http\Controllers\HomeController;

$url = action([HomeController::class, 'index']);
```

Si el método del controlador acepta parámetros de ruta, puede pasar una matriz asociativa de parámetros de ruta como segundo argumento de la función:

```php
$url = action([UserController::class, 'profile'], ['id' => 1]);
```

<a id="fluent-uri-objects"></a>
## Objetos URI fluidos

La clase `Uri` de Laravel proporciona una interfaz cómoda y fluida para crear y manipular URI a través de objetos. Esta clase incluye la funcionalidad proporcionada por el paquete League URI subyacente y se integra perfectamente con el sistema de enrutamiento de Laravel.

Puede crear una instancia `Uri` fácilmente utilizando métodos estáticos:

```php
use App\Http\Controllers\UserController;
use App\Http\Controllers\InvokableController;
use Illuminate\Support\Uri;

// Generar una instancia de URI a partir de la cadena indicada...
$uri = Uri::of('https://example.com/path');

// Generar instancias de URI para rutas, rutas con nombre o acciones de controladores...
$uri = Uri::to('/dashboard');
$uri = Uri::route('users.show', ['user' => 1]);
$uri = Uri::signedRoute('users.show', ['user' => 1]);
$uri = Uri::temporarySignedRoute('user.index', now()->plus(minutes: 5));
$uri = Uri::action([UserController::class, 'index']);
$uri = Uri::action(InvokableController::class);

// Generar una instancia de URI a partir de la URL de la solicitud actual...
$uri = $request->uri();

// Generar una instancia de URI a partir de la URL de la solicitud anterior...
$uri = $request->session()->previousUri();
```

Una vez que tenga una instancia de URI, puede modificarla con fluidez:

```php
$uri = Uri::of('https://example.com')
    ->withScheme('http')
    ->withHost('test.com')
    ->withPort(8000)
    ->withPath('/users')
    ->withQuery(['page' => 2])
    ->withFragment('section-1');
```

Para obtener más información sobre cómo trabajar con objetos URI fluidos, consulte la [documentación de URI](../helpers/#uri).

<a id="default-values"></a>
## Valores predeterminados

Para algunas aplicaciones, es posible que desee especificar valores predeterminados para toda la solicitud para ciertos parámetros de URL. Por ejemplo, imagine que muchas de sus rutas definen un parámetro `{locale}`:

```php
Route::get('/{locale}/posts', function () {
    // ...
})->name('post.index');
```

Es engorroso pasar siempre el `locale` cada vez que llama al ayudante `route`. Por lo tanto, puede utilizar el método `URL::defaults` para definir un valor predeterminado para este parámetro que siempre se aplicará durante la solicitud actual. Es posible que desee llamar a este método desde una [ruta middleware](../middleware/#assigning-middleware-to-routes) para tener acceso a la solicitud actual:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Symfony\Component\HttpFoundation\Response;

class SetDefaultLocaleForUrls
{
    /**
     * Gestionar una solicitud entrante.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        URL::defaults(['locale' => $request->user()->locale]);

        return $next($request);
    }
}
```

Una vez que se haya establecido el valor predeterminado para el parámetro `locale`, ya no es necesario que pase su valor al generar URL a través del asistente `route`.

<a id="url-defaults-middleware-priority"></a>
#### Valores predeterminados de URL y prioridad de middleware

Establecer valores predeterminados de URL puede interferir con el manejo de Laravel de enlaces de modelos implícitos. Por lo tanto, debe [priorizar su middleware](../middleware/#sorting-middleware) que establece las URL predeterminadas para que se ejecuten antes que el propio middleware `SubstituteBindings` de Laravel. Puede lograr esto utilizando el método de middleware `priority` en el archivo `bootstrap/app.php` de su aplicación:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->prependToPriorityList(
        before: \Illuminate\Routing\Middleware\SubstituteBindings::class,
        prepend: \App\Http\Middleware\SetDefaultLocaleForUrls::class,
    );
})
```
