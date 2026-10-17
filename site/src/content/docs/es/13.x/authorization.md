---
title: "Autorización"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Puertas](#gates)
    - [Escribiendo puertas](#writing-gates)
    - [Autorizando Acciones](#authorizing-actions-via-gates)
    - [Respuestas de puerta](#gate-responses)
    - [Interceptación de controles de puerta](#intercepting-gate-checks)
    - [Autorización en línea](#inline-authorization)
- [Creando Políticas](#creating-policies)
    - [Generando Políticas](#generating-policies)
    - [Políticas de registro](#registering-policies)
- [Redacción de políticas](#writing-policies)
    - [Métodos de política](#policy-methods)
    - [Respuestas de políticas](#policy-responses)
    - [Métodos sin modelos](#methods-without-models)
    - [Usuarios invitados](#guest-users)
    - [Filtros de políticas](#policy-filters)
- [Autorización de acciones mediante políticas](#authorizing-actions-using-policies)
    - [A través del modelo de usuario](#via-the-user-model)
    - [A través de la fachada de la puerta](#via-the-gate-facade)
    - [A través de Middleware](#via-middleware)
    - [Vía Blade Templates](#via-blade-templates)
    - [Proporcionando contexto adicional](#supplying-additional-context)
- [Autorización e Inertia](#authorization-and-inertia)

<a id="introduction"></a>
## Introducción

Además de proporcionar servicios [authentication](../authentication/) integrados, Laravel también proporciona una forma sencilla de autorizar acciones del usuario contra un recurso determinado. Por ejemplo, aunque un usuario esté autenticado, es posible que no esté autorizado a actualizar o eliminar ciertos modelos de Eloquent o registros de bases de datos administrados por su aplicación. Las funciones de autorización de Laravel proporcionan una forma sencilla y organizada de gestionar este tipo de comprobaciones de autorización.

Laravel proporciona dos formas principales de autorizar acciones: [gates](#gates) y [policies](#creating-policies). Piense en puertas y políticas como rutas y controladores. Las puertas proporcionan un enfoque de autorización simple y basado en funciones anónimas, mientras que las políticas, como los controladores, agrupan la lógica en torno a un modelo o recurso en particular. En esta documentación, primero exploraremos las puertas y luego examinaremos las políticas.

No es necesario elegir entre utilizar exclusivamente puertas o utilizar exclusivamente políticas al crear una aplicación. Lo más probable es que la mayoría de las aplicaciones contengan alguna combinación de puertas y políticas, ¡y eso está perfectamente bien! Las puertas son más aplicables a acciones que no están relacionadas con ningún modelo o recurso, como ver un panel de administrador. Por el contrario, las políticas deben usarse cuando se desea autorizar una acción para un modelo o recurso en particular.

<a id="gates"></a>
## Puertas

<a id="writing-gates"></a>
### Puertas de escritura

> **Advertencia:**
> Las puertas son una excelente manera de aprender los conceptos básicos de las funciones de autorización de Laravel; sin embargo, al crear aplicaciones Laravel sólidas, debería considerar usar [policies](#creating-policies) para organizar sus reglas de autorización.

Las puertas son simplemente funciones anónimas que determinan si un usuario está autorizado a realizar una acción determinada. Normalmente, las puertas se definen dentro del método `boot` de la clase `App\Providers\AppServiceProvider` utilizando la fachada `Gate`. Gates siempre recibe una instancia de usuario como primer argumento y, opcionalmente, puede recibir argumentos adicionales, como un modelo Eloquent relevante.

En este ejemplo, definiremos una puerta para determinar si un usuario puede actualizar un modelo `App\Models\Post` determinado. La puerta logrará esto comparando el `id` del usuario con el `user_id` del usuario que creó la publicación:

```php
use App\Models\Post;
use App\Models\User;
use Illuminate\Support\Facades\Gate;

/**
 * Inicializar los servicios de la aplicación.
 */
public function boot(): void
{
    Gate::define('update-post', function (User $user, Post $post) {
        return $user->id === $post->user_id;
    });
}
```

Al igual que los controladores, las puertas también se pueden definir utilizando una matriz de devolución de llamada de clase:

```php
use App\Policies\PostPolicy;
use Illuminate\Support\Facades\Gate;

/**
 * Inicializar los servicios de la aplicación.
 */
public function boot(): void
{
    Gate::define('update-post', [PostPolicy::class, 'update']);
}
```

<a id="authorizing-actions-via-gates"></a>
### Autorizar acciones

Para autorizar una acción mediante puertas se deben utilizar los métodos `allows` o `denies` proporcionados por la fachada `Gate`. Tenga en cuenta que no es necesario que pase el usuario actualmente autenticado a estos métodos. Laravel se encargará automáticamente de pasar al usuario a la función anónima de la puerta. Es típico llamar a los métodos de autorización de puerta dentro de los controladores de su aplicación antes de realizar una acción que requiera autorización:

```php
<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class PostController extends Controller
{
    /**
     * Actualizar la publicación indicada.
     */
    public function update(Request $request, Post $post): RedirectResponse
    {
        if (! Gate::allows('update-post', $post)) {
            abort(403);
        }

        // Actualizar la publicación...

        return redirect('/posts');
    }
}
```

Si desea determinar si un usuario distinto del usuario actualmente autenticado está autorizado a realizar una acción, puede utilizar el método `forUser` en la fachada `Gate`:

```php
if (Gate::forUser($user)->allows('update-post', $post)) {
    // The user can update the post...
}

if (Gate::forUser($user)->denies('update-post', $post)) {
    // The user can't update the post...
}
```

Puede autorizar varias acciones a la vez utilizando los métodos `any` o `none`:

```php
if (Gate::any(['update-post', 'delete-post'], $post)) {
    // The user can update or delete the post...
}

if (Gate::none(['update-post', 'delete-post'], $post)) {
    // The user can't update or delete the post...
}
```

<a id="authorizing-or-throwing-exceptions"></a>
#### Autorizar o lanzar excepciones

Si desea intentar autorizar una acción y generar automáticamente un `Illuminate\Auth\Access\AuthorizationException` si el usuario no tiene permiso para realizar la acción determinada, puede utilizar el método `authorize` de la fachada `Gate`. Laravel convierte automáticamente las instancias de `AuthorizationException` en una respuesta HTTP 403:

```php
Gate::authorize('update-post', $post);

// The action is authorized...
```

<a id="gates-supplying-additional-context"></a>
#### Proporcionar contexto adicional

Los métodos de puerta para autorizar capacidades (`allows`, `denies`, `check`, `any`, `none`, `authorize`, `can`, `cannot`) y la autorización [Directivas Blade](#via-blade-templates) (`@can`, `@cannot`, `@canany`) pueden recibir una matriz como segundo argumento. Estos elementos de la matriz se pasan como parámetros para la función anónima de la puerta y se pueden usar como contexto adicional al tomar decisiones de autorización:

```php
use App\Models\Category;
use App\Models\User;
use Illuminate\Support\Facades\Gate;

Gate::define('create-post', function (User $user, Category $category, bool $pinned) {
    if (! $user->canPublishToGroup($category->group)) {
        return false;
    } elseif ($pinned && ! $user->canPinPosts()) {
        return false;
    }

    return true;
});

if (Gate::check('create-post', [$category, $pinned])) {
    // The user can create the post...
}
```

<a id="gate-responses"></a>
### Respuestas de la puerta

Hasta ahora, sólo hemos examinado puertas que devuelven valores booleanos simples. Sin embargo, a veces es posible que desees devolver una respuesta más detallada, incluido un mensaje de error. Para hacerlo, puede devolver un `Illuminate\Auth\Access\Response` desde su puerta:

```php
use App\Models\User;
use Illuminate\Auth\Access\Response;
use Illuminate\Support\Facades\Gate;

Gate::define('edit-settings', function (User $user) {
    return $user->isAdmin
        ? Response::allow()
        : Response::deny('You must be an administrator.');
});
```

Incluso cuando devuelva una respuesta de autorización de su puerta, el método `Gate::allows` seguirá devolviendo un valor booleano simple; sin embargo, puede utilizar el método `Gate::inspect` para que la puerta devuelva la respuesta de autorización completa:

```php
$response = Gate::inspect('edit-settings');

if ($response->allowed()) {
    // The action is authorized...
} else {
    echo $response->message();
}
```

Cuando se utiliza el método `Gate::authorize`, que arroja un `AuthorizationException` si la acción no está autorizada, el mensaje de error proporcionado por la respuesta de autorización se propagará a la respuesta HTTP:

```php
Gate::authorize('edit-settings');

// The action is authorized...
```

<a id="customizing-gate-response-status"></a>
#### Personalización del estado de respuesta HTTP

Cuando se deniega una acción a través de una puerta, se devuelve una respuesta HTTP `403`; sin embargo, a veces puede resultar útil devolver un código de estado HTTP alternativo. Puede personalizar el código de estado HTTP devuelto por una verificación de autorización fallida utilizando el constructor estático `denyWithStatus` en la clase `Illuminate\Auth\Access\Response`:

```php
use App\Models\User;
use Illuminate\Auth\Access\Response;
use Illuminate\Support\Facades\Gate;

Gate::define('edit-settings', function (User $user) {
    return $user->isAdmin
        ? Response::allow()
        : Response::denyWithStatus(404);
});
```

Debido a que ocultar recursos mediante una respuesta `404` es un patrón tan común para las aplicaciones web, se ofrece el método `denyAsNotFound` por conveniencia:

```php
use App\Models\User;
use Illuminate\Auth\Access\Response;
use Illuminate\Support\Facades\Gate;

Gate::define('edit-settings', function (User $user) {
    return $user->isAdmin
        ? Response::allow()
        : Response::denyAsNotFound();
});
```

<a id="intercepting-gate-checks"></a>
### Intercepción de controles de puerta

A veces, es posible que desees otorgar todas las habilidades a un usuario específico. Puede utilizar el método `before` para definir una función anónima que se ejecuta antes de todas las demás comprobaciones de autorización:

```php
use App\Models\User;
use Illuminate\Support\Facades\Gate;

Gate::before(function (User $user, string $ability) {
    if ($user->isAdministrator()) {
        return true;
    }
});
```

Si la función anónima `before` devuelve un resultado no nulo, ese resultado se considerará el resultado de la verificación de autorización.

Puede utilizar el método `after` para definir una función anónima que se ejecutará después de todas las demás comprobaciones de autorización:

```php
use App\Models\User;

Gate::after(function (User $user, string $ability, bool|null $result, mixed $arguments) {
    if ($user->isAdministrator()) {
        return true;
    }
});
```

Los valores devueltos por las funciones anónimas `after` no anularán el resultado de la verificación de autorización a menos que la puerta o la política devuelvan `null`.

<a id="inline-authorization"></a>
### Autorización en línea

En ocasiones, es posible que desee determinar si el usuario actualmente autenticado está autorizado a realizar una acción determinada sin escribir una puerta dedicada que corresponda a la acción. Laravel le permite realizar este tipo de comprobaciones de autorización "en línea" mediante los métodos `Gate::allowIf` y `Gate::denyIf`. La autorización en línea no ejecuta ningún gancho de autorización definido ["antes" o "después"](#intercepting-gate-checks):

```php
use App\Models\User;
use Illuminate\Support\Facades\Gate;

Gate::allowIf(fn (User $user) => $user->isAdministrator());

Gate::denyIf(fn (User $user) => $user->banned());
```

Si la acción no está autorizada o si ningún usuario está autenticado actualmente, Laravel generará automáticamente una excepción `Illuminate\Auth\Access\AuthorizationException`. Las instancias de `AuthorizationException` se convierten automáticamente en una respuesta HTTP 403 mediante el controlador de excepciones de Laravel.

<a id="creating-policies"></a>
## Creando políticas

<a id="generating-policies"></a>
### Generando políticas

Las políticas son clases que organizan la lógica de autorización en torno a un modelo o recurso en particular. Por ejemplo, si su aplicación es un blog, puede tener un modelo `App\Models\Post` y un `App\Policies\PostPolicy` correspondiente para autorizar acciones del usuario, como crear o actualizar publicaciones.

Puede generar una política utilizando el comando `make:policy` Artisan. La política generada se colocará en el directorio `app/Policies`. Si este directorio no existe en su aplicación, Laravel lo creará por usted:

```shell
php artisan make:policy PostPolicy
```

El comando `make:policy` generará una clase de política vacía. Si desea generar una clase con métodos de política de ejemplo relacionados con la visualización, creación, actualización y eliminación del recurso, puede proporcionar una opción `--model` al ejecutar el comando:

```shell
php artisan make:policy PostPolicy --model=Post
```

<a id="registering-policies"></a>
### Registrar políticas

<a id="policy-discovery"></a>
#### Descubrimiento de políticas

De forma predeterminada, Laravel descubre políticas automáticamente siempre que el modelo y la política sigan las convenciones de nomenclatura estándar de Laravel. Específicamente, las políticas deben estar en un directorio `Policies` en o encima del directorio que contiene sus modelos. Así, por ejemplo, los modelos pueden ubicarse en el directorio `app/Models` mientras que las políticas pueden ubicarse en el directorio `app/Policies`. En esta situación, Laravel buscará políticas en `app/Models/Policies` y luego en `app/Policies`. Además, el nombre de la política debe coincidir con el nombre del modelo y tener el sufijo `Policy`. Entonces, un modelo `User` correspondería a una clase de póliza `UserPolicy`.

Si desea definir su propia lógica de descubrimiento de políticas, puede registrar una devolución de llamada de descubrimiento de políticas personalizada utilizando el método `Gate::guessPolicyNamesUsing`. Normalmente, este método debe llamarse desde el método `boot` del `AppServiceProvider` de su aplicación:

```php
use Illuminate\Support\Facades\Gate;

Gate::guessPolicyNamesUsing(function (string $modelClass) {
    // Devolver el nombre de la policy class del modelo indicado...
});
```

<a id="manually-registering-policies"></a>
#### Registro manual de políticas

Usando la fachada `Gate`, puede registrar manualmente políticas y sus modelos correspondientes dentro del método `boot` del `AppServiceProvider` de su aplicación:

```php
use App\Models\Order;
use App\Policies\OrderPolicy;
use Illuminate\Support\Facades\Gate;

/**
 * Inicializar los servicios de la aplicación.
 */
public function boot(): void
{
    Gate::policy(Order::class, OrderPolicy::class);
}
```

Alternativamente, puedes colocar el atributo `UsePolicy` en una clase de modelo para informar a Laravel de la política correspondiente del modelo:

```php
<?php

namespace App\Models;

use App\Policies\OrderPolicy;
use Illuminate\Database\Eloquent\Attributes\UsePolicy;
use Illuminate\Database\Eloquent\Model;

#[UsePolicy(OrderPolicy::class)]
class Order extends Model
{
    //
}
```

<a id="writing-policies"></a>
## Redacción de políticas

<a id="policy-methods"></a>
### Métodos de política

Una vez registrada la clase de política, podrá agregar métodos para cada acción que autorice. Por ejemplo, definamos un método `update` en nuestro `PostPolicy` que determina si un `App\Models\User` determinado puede actualizar una instancia `App\Models\Post` determinada.

El método `update` recibirá una instancia `User` y `Post` como argumentos, y debe devolver `true` o `false` indicando si el usuario está autorizado a actualizar el `Post` dado. Entonces, en este ejemplo, verificaremos que el `id` del usuario coincida con el `user_id` de la publicación:

```php
<?php

namespace App\Policies;

use App\Models\Post;
use App\Models\User;

class PostPolicy
{
    /**
     * Determinar si el usuario puede actualizar la publicación indicada.
     */
    public function update(User $user, Post $post): bool
    {
        return $user->id === $post->user_id;
    }
}
```

Puede continuar definiendo métodos adicionales en la política según sea necesario para las diversas acciones que autoriza. Por ejemplo, puede definir los métodos `view` o `delete` para autorizar varias acciones relacionadas con `Post`, pero recuerde que puede darle a sus métodos de política el nombre que desee.

Si utilizó la opción `--model` al generar su póliza a través de la consola Artisan, ya contendrá métodos para las acciones `viewAny`, `view`, `create`, `update`, `delete`, `restore` y `forceDelete`.

> **Nota:**
> Todas las políticas se resuelven a través del [contenedor de servicios](../container/) de Laravel, lo que le permite escribir sugerencias sobre las dependencias necesarias en el constructor de la política para que se inyecten automáticamente.

<a id="policy-responses"></a>
### Respuestas políticas

Hasta ahora, sólo hemos examinado métodos de políticas que devuelven valores booleanos simples. Sin embargo, a veces es posible que desees devolver una respuesta más detallada, incluido un mensaje de error. Para hacerlo, puede devolver una instancia `Illuminate\Auth\Access\Response` desde su método de política:

```php
use App\Models\Post;
use App\Models\User;
use Illuminate\Auth\Access\Response;

/**
 * Determinar si el usuario puede actualizar la publicación indicada.
 */
public function update(User $user, Post $post): Response
{
    return $user->id === $post->user_id
        ? Response::allow()
        : Response::deny('You do not own this post.');
}
```

Al devolver una respuesta de autorización de su política, el método `Gate::allows` seguirá devolviendo un valor booleano simple; sin embargo, puede utilizar el método `Gate::inspect` para que la puerta devuelva la respuesta de autorización completa:

```php
use Illuminate\Support\Facades\Gate;

$response = Gate::inspect('update', $post);

if ($response->allowed()) {
    // The action is authorized...
} else {
    echo $response->message();
}
```

Cuando se utiliza el método `Gate::authorize`, que arroja un `AuthorizationException` si la acción no está autorizada, el mensaje de error proporcionado por la respuesta de autorización se propagará a la respuesta HTTP:

```php
Gate::authorize('update', $post);

// The action is authorized...
```

<a id="customizing-policy-response-status"></a>
#### Personalización del estado de respuesta HTTP

Cuando se deniega una acción mediante un método de política, se devuelve una respuesta HTTP `403`; sin embargo, a veces puede resultar útil devolver un código de estado HTTP alternativo. Puede personalizar el código de estado HTTP devuelto por una verificación de autorización fallida utilizando el constructor estático `denyWithStatus` en la clase `Illuminate\Auth\Access\Response`:

```php
use App\Models\Post;
use App\Models\User;
use Illuminate\Auth\Access\Response;

/**
 * Determinar si el usuario puede actualizar la publicación indicada.
 */
public function update(User $user, Post $post): Response
{
    return $user->id === $post->user_id
        ? Response::allow()
        : Response::denyWithStatus(404);
}
```

Debido a que ocultar recursos mediante una respuesta `404` es un patrón tan común para las aplicaciones web, se ofrece el método `denyAsNotFound` por conveniencia:

```php
use App\Models\Post;
use App\Models\User;
use Illuminate\Auth\Access\Response;

/**
 * Determinar si el usuario puede actualizar la publicación indicada.
 */
public function update(User $user, Post $post): Response
{
    return $user->id === $post->user_id
        ? Response::allow()
        : Response::denyAsNotFound();
}
```

<a id="methods-without-models"></a>
### Métodos sin modelos

Algunos métodos de política solo reciben una instancia del usuario actualmente autenticado. Esta situación es más común al autorizar acciones `create`. Por ejemplo, si está creando un blog, es posible que desee determinar si un usuario está autorizado a crear alguna publicación. En estas situaciones, su método de política solo debe esperar recibir una instancia de usuario:

```php
/**
 * Determinar si el usuario indicado puede crear publicaciones.
 */
public function create(User $user): bool
{
    return $user->role == 'writer';
}
```

<a id="guest-users"></a>
### Usuarios invitados

De forma predeterminada, todas las puertas y políticas devuelven automáticamente `false` si la solicitud HTTP entrante no fue iniciada por un usuario autenticado. Sin embargo, puede permitir que estas comprobaciones de autorización pasen a sus puertas y políticas declarando una sugerencia de tipo "opcional" o proporcionando un valor predeterminado `null` para la definición del argumento del usuario:

```php
<?php

namespace App\Policies;

use App\Models\Post;
use App\Models\User;

class PostPolicy
{
    /**
     * Determinar si el usuario puede actualizar la publicación indicada.
     */
    public function update(?User $user, Post $post): bool
    {
        return $user?->id === $post->user_id;
    }
}
```

<a id="policy-filters"></a>
### Filtros de políticas

Para ciertos usuarios, es posible que desee autorizar todas las acciones dentro de una política determinada. Para lograr esto, defina un método `before` en la política. El método `before` se ejecutará antes que cualquier otro método de la política, lo que le brindará la oportunidad de autorizar la acción antes de que se llame realmente al método de política previsto. Esta característica se usa más comúnmente para autorizar a los administradores de aplicaciones a realizar cualquier acción:

```php
use App\Models\User;

/**
 * Perform pre-authorization checks.
 */
public function before(User $user, string $ability): bool|null
{
    if ($user->isAdministrator()) {
        return true;
    }

    return null;
}
```

Si desea denegar todas las comprobaciones de autorización para un tipo particular de usuario, puede devolver `false` desde el método `before`. Si se devuelve `null`, la verificación de autorización pasará al método de política.

> **Advertencia:**
> No se llamará al método `before` de una clase de política si la clase no contiene un método con un nombre que coincida con el nombre de la capacidad que se está verificando.

<a id="authorizing-actions-using-policies"></a>
## Autorizar acciones mediante políticas

<a id="via-the-user-model"></a>
### A través del modelo de usuario

El modelo `App\Models\User` que se incluye con su aplicación Laravel incluye dos métodos útiles para autorizar acciones: `can` y `cannot`. Los métodos `can` y `cannot` reciben el nombre de la acción que se desea autorizar y el modelo correspondiente. Por ejemplo, determinemos si un usuario está autorizado a actualizar un modelo `App\Models\Post` determinado. Normalmente, esto se hará dentro de un método de controlador:

```php
<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PostController extends Controller
{
    /**
     * Actualizar la publicación indicada.
     */
    public function update(Request $request, Post $post): RedirectResponse
    {
        if ($request->user()->cannot('update', $post)) {
            abort(403);
        }

        // Actualizar la publicación...

        return redirect('/posts');
    }
}
```

Si se registra una [política](#registering-policies) para el modelo dado, el método `can` llamará automáticamente a la política apropiada y devolverá el resultado booleano. Si no se registra ninguna política para el modelo, el método `can` intentará llamar a la puerta basada en función anónima que coincida con el nombre de acción dado.

<a id="user-model-actions-that-dont-require-models"></a>
#### Acciones que no requieren modelos

Recuerde, algunas acciones pueden corresponder a métodos de política como `create` que no requieren una instancia de modelo. En estas situaciones, puede pasar un nombre de clase al método `can`. El nombre de la clase se utilizará para determinar qué política utilizar al autorizar la acción:

```php
<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PostController extends Controller
{
    /**
     * Crear una publicación.
     */
    public function store(Request $request): RedirectResponse
    {
        if ($request->user()->cannot('create', Post::class)) {
            abort(403);
        }

        // Crear la publicación...

        return redirect('/posts');
    }
}
```

<a id="via-the-gate-facade"></a>
### A través de la fachada `Gate`

Además de los métodos útiles proporcionados para el modelo `App\Models\User`, siempre puede autorizar acciones a través del método `authorize` de la fachada `Gate`.

Al igual que el método `can`, este método acepta el nombre de la acción que desea autorizar y el modelo correspondiente. Si la acción no está autorizada, el método `authorize` generará una excepción `Illuminate\Auth\Access\AuthorizationException` que el controlador de excepciones de Laravel convertirá automáticamente en una respuesta HTTP con un código de estado 403:

```php
<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class PostController extends Controller
{
    /**
     * Actualizar la entrada de blog indicada.
     *
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function update(Request $request, Post $post): RedirectResponse
    {
        Gate::authorize('update', $post);

        // The current user can update the blog post...

        return redirect('/posts');
    }
}
```

<a id="controller-actions-that-dont-require-models"></a>
#### Acciones que no requieren modelos

Como se analizó anteriormente, algunos métodos de políticas como `create` no requieren una instancia de modelo. En estas situaciones, debes pasar un nombre de clase al método `authorize`. El nombre de la clase se utilizará para determinar qué política utilizar al autorizar la acción:

```php
use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

/**
 * Crear una nueva entrada de blog.
 *
 * @throws \Illuminate\Auth\Access\AuthorizationException
 */
public function create(Request $request): RedirectResponse
{
    Gate::authorize('create', Post::class);

    // The current user can create blog posts...

    return redirect('/posts');
}
```

<a id="via-middleware"></a>
### A través de middleware

Laravel incluye un middleware que puede autorizar acciones incluso antes de que la solicitud entrante llegue a sus rutas o controladores. De forma predeterminada, el middleware `Illuminate\Auth\Middleware\Authorize` se puede adjuntar a una ruta utilizando el alias `can` [middleware](../middleware/#middleware-aliases), que Laravel registra automáticamente. Exploremos un ejemplo del uso del middleware `can` para autorizar que un usuario pueda actualizar una publicación:

```php
use App\Models\Post;

Route::put('/post/{post}', function (Post $post) {
    // The current user may update the post...
})->middleware('can:update,post');
```

En este ejemplo, le pasamos dos argumentos al middleware `can`. El primero es el nombre de la acción que deseamos autorizar y el segundo es el parámetro de ruta que deseamos pasar al método de política. En este caso, dado que estamos utilizando [enlace de modelo implícito](../routing/#implicit-binding), se pasará un modelo `App\Models\Post` al método de política. Si el usuario no está autorizado a realizar la acción determinada, el middleware devolverá una respuesta HTTP con un código de estado 403.

Para mayor comodidad, también puede adjuntar el middleware `can` a su ruta utilizando el método `can`:

```php
use App\Models\Post;

Route::put('/post/{post}', function (Post $post) {
    // The current user may update the post...
})->can('update', 'post');
```

Si está utilizando [atributos de middleware del controlador ](../controllers/#middleware-attributes), puede aplicar el middleware `can` a través del atributo `Authorize`:

```php
use Illuminate\Routing\Attributes\Controllers\Authorize;

#[Authorize('update', 'post')]
public function update(Post $post)
{
    // The current user may update the post...
}
```

<a id="middleware-actions-that-dont-require-models"></a>
#### Acciones que no requieren modelos

Nuevamente, algunos métodos de políticas como `create` no requieren una instancia de modelo. En estas situaciones, puede pasar un nombre de clase al middleware. El nombre de la clase se utilizará para determinar qué política utilizar al autorizar la acción:

```php
Route::post('/post', function () {
    // The current user may create posts...
})->middleware('can:create,App\Models\Post');
```

Especificar el nombre completo de la clase dentro de una definición de middleware de cadena puede resultar engorroso. Por ese motivo, puede optar por adjuntar el middleware `can` a su ruta utilizando el método `can`:

```php
use App\Models\Post;

Route::post('/post', function () {
    // The current user may create posts...
})->can('create', Post::class);
```

<a id="via-blade-templates"></a>
### A través de plantillas Blade

Al escribir plantillas de Blade, es posible que desee mostrar una parte de la página solo si el usuario está autorizado a realizar una acción determinada. Por ejemplo, es posible que desees mostrar un formulario de actualización para una publicación de blog solo si el usuario realmente puede actualizar la publicación. En esta situación, puede utilizar las directivas `@can` y `@cannot`:

```blade
@can('update', $post)
    <!-- The current user can update the post... -->
@elsecan('create', App\Models\Post::class)
    <!-- The current user can create new posts... -->
@else
    <!-- ... -->
@endcan

@cannot('update', $post)
    <!-- The current user cannot update the post... -->
@elsecannot('create', App\Models\Post::class)
    <!-- The current user cannot create new posts... -->
@endcannot
```

Estas directivas son atajos convenientes para escribir declaraciones `@if` y `@unless`. Las declaraciones `@can` y `@cannot` anteriores son equivalentes a las siguientes declaraciones:

```blade
@if (Auth::user()->can('update', $post))
    <!-- The current user can update the post... -->
@endif

@unless (Auth::user()->can('update', $post))
    <!-- The current user cannot update the post... -->
@endunless
```

También puede determinar si un usuario está autorizado a realizar alguna acción entre un conjunto determinado de acciones. Para lograr esto, utilice la directiva `@canany`:

```blade
@canany(['update', 'view', 'delete'], $post)
    <!-- The current user can update, view, or delete the post... -->
@elsecanany(['create'], \App\Models\Post::class)
    <!-- The current user can create a post... -->
@endcanany
```

<a id="blade-actions-that-dont-require-models"></a>
#### Acciones que no requieren modelos

Como la mayoría de los otros métodos de autorización, puede pasar un nombre de clase a las directivas `@can` y `@cannot` si la acción no requiere una instancia de modelo:

```blade
@can('create', App\Models\Post::class)
    <!-- The current user can create posts... -->
@endcan

@cannot('create', App\Models\Post::class)
    <!-- The current user can't create posts... -->
@endcannot
```

<a id="supplying-additional-context"></a>
### Proporcionar contexto adicional

Al autorizar acciones mediante políticas, puede pasar una matriz como segundo argumento a las distintas funciones de autorización y ayudantes. El primer elemento de la matriz se utilizará para determinar qué política se debe invocar, mientras que el resto de los elementos de la matriz se pasan como parámetros al método de política y se pueden utilizar como contexto adicional al tomar decisiones de autorización. Por ejemplo, considere la siguiente definición del método `PostPolicy` que contiene un parámetro `$category` adicional:

```php
/**
 * Determinar si el usuario puede actualizar la publicación indicada.
 */
public function update(User $user, Post $post, int $category): bool
{
    return $user->id === $post->user_id &&
           $user->canUpdateCategory($category);
}
```

Al intentar determinar si el usuario autenticado puede actualizar una publicación determinada, podemos invocar este método de política de la siguiente manera:

```php
/**
 * Actualizar la entrada de blog indicada.
 *
 * @throws \Illuminate\Auth\Access\AuthorizationException
 */
public function update(Request $request, Post $post): RedirectResponse
{
    Gate::authorize('update', [$post, $request->category]);

    // The current user can update the blog post...

    return redirect('/posts');
}
```

<a id="authorization-and-inertia"></a>
## Autorización e Inertia

Aunque la autorización siempre debe manejarse en el servidor, a menudo puede ser conveniente proporcionar a su aplicación frontend datos de autorización para representar correctamente la interfaz de usuario de su aplicación. Laravel no define una convención requerida para exponer información de autorización a una interfaz impulsada por Inertia.

Sin embargo, si está utilizando uno de los kits de inicio ](../starter-kits/) basados ​​​​en Inertia de Laravel, su aplicación ya contiene un middleware `HandleInertiaRequests`. Dentro del método `share` de este middleware, puede devolver datos compartidos que se proporcionarán a todas las páginas de Inertia en su aplicación. Estos datos compartidos pueden servir como una ubicación conveniente para definir la información de autorización para el usuario:

```php
<?php

namespace App\Http\Middleware;

use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    // ...

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request)
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                'permissions' => [
                    'post' => [
                        'create' => $request->user()->can('create', Post::class),
                    ],
                ],
            ],
        ];
    }
}
```
