---
title: "Controladores"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Controladores de escritura](#writing-controllers)
    - [Controladores básicos](#basic-controllers)
    - [Controladores de acción simple](#single-action-controllers)
- [Middleware del controlador](#controller-middleware)
    - [Atributos del middleware](#middleware-attributes)
    - [Atributos de autorización](#authorization-attributes)
- [Controladores de recursos](#resource-controllers)
    - [Rutas de recursos parciales](#restful-partial-resource-routes)
    - [Recursos anidados](#restful-nested-resources)
    - [Nombrar rutas de recursos](#restful-naming-resource-routes)
    - [Denominación de parámetros de ruta de recursos](#restful-naming-resource-route-parameters)
    - [Alcance de rutas de recursos](#restful-scoping-resource-routes)
    - [Localización de URI de recursos](#restful-localizing-resource-uris)
    - [Controladores de recursos complementarios](#restful-supplementing-resource-controllers)
    - [Controladores de recursos Singleton](#singleton-resource-controllers)
    - [Controladores de recursos y middleware](#middleware-and-resource-controllers)
- [Inyección de Dependencia y Controladores](#dependency-injection-and-controllers)

<a id="introduction"></a>
## Introducción

En lugar de definir toda la lógica de manejo de solicitudes como cierres en sus archivos de ruta, es posible que desee organizar este comportamiento utilizando clases de "controlador". Los controladores pueden agrupar la lógica de manejo de solicitudes relacionadas en una sola clase. Por ejemplo, una clase `UserController` podría manejar todas las solicitudes entrantes relacionadas con los usuarios, incluidas mostrar, crear, actualizar y eliminar usuarios. De forma predeterminada, los controladores se almacenan en el directorio `app/Http/Controllers`.

<a id="writing-controllers"></a>
## Controladores de escritura

<a id="basic-controllers"></a>
### Controladores básicos

Para generar rápidamente un nuevo controlador, puede ejecutar el comando `make:controller` Artisan. De forma predeterminada, todos los controladores de su aplicación se almacenan en el directorio `app/Http/Controllers`:

```shell
php artisan make:controller UserController
```

Echemos un vistazo a un ejemplo de un controlador básico. Un controlador puede tener cualquier cantidad de métodos públicos que responderán a las solicitudes HTTP entrantes:

```php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * Show the profile for a given user.
     */
    public function show(string $id): View
    {
        return view('user.profile', [
            'user' => User::findOrFail($id)
        ]);
    }
}
```

Una vez que haya escrito una clase y un método de controlador, puede definir una ruta al método del controlador de la siguiente manera:

```php
use App\Http\Controllers\UserController;

Route::get('/user/{id}', [UserController::class, 'show']);
```

Cuando una solicitud entrante coincide con el URI de ruta especificado, se invocará el método `show` en la clase `App\Http\Controllers\UserController` y los parámetros de ruta se pasarán al método.

> **Nota:**
> Los controladores no son **requeridos** para extender una clase base. Sin embargo, a veces es conveniente extender una clase de controlador base que contenga métodos que deberían compartirse entre todos sus controladores.

<a id="single-action-controllers"></a>
### Controladores de acción única

Si una acción de controlador es particularmente compleja, puede que le resulte conveniente dedicar una clase de controlador completa a esa única acción. Para lograr esto, puede definir un único método `__invoke` dentro del controlador:

```php
<?php

namespace App\Http\Controllers;

class ProvisionServer extends Controller
{
    /**
     * Provision a new web server.
     */
    public function __invoke()
    {
        // ...
    }
}
```

Al registrar rutas para controladores de acción única, no es necesario especificar un método de controlador. En su lugar, puedes simplemente pasar el nombre del controlador al enrutador:

```php
use App\Http\Controllers\ProvisionServer;

Route::post('/server', ProvisionServer::class);
```

Puede generar un controlador invocable utilizando la opción `--invokable` del comando `make:controller` Artisan:

```shell
php artisan make:controller ProvisionServer --invokable
```

> **Nota:**
> Los códigos auxiliares del controlador se pueden personalizar usando [stub Publishing](../artisan/#stub-customization).

<a id="controller-middleware"></a>
## Middleware del controlador

[Se puede asignar Middleware](../middleware/) a las rutas del controlador en sus archivos de ruta:

```php
Route::get('/profile', [UserController::class, 'show'])->middleware('auth');
```

O puede que le resulte conveniente especificar middleware dentro de su clase de controlador. Para hacerlo, su controlador debe implementar la interfaz `HasMiddleware`, que dicta que el controlador debe tener un método estático `middleware`. A partir de este método, puede devolver una serie de middleware que debería aplicarse a las acciones del controlador:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class UserController implements HasMiddleware
{
    /**
     * Get the middleware that should be assigned to the controller.
     */
    public static function middleware(): array
    {
        return [
            'auth',
            new Middleware('log', only: ['index']),
            new Middleware('subscribed', except: ['store']),
        ];
    }

    // ...
}
```

También puede definir el middleware del controlador como cierres, lo que proporciona una manera conveniente de definir un middleware en línea sin escribir una clase de middleware completa:

```php
use Closure;
use Illuminate\Http\Request;

/**
 * Get the middleware that should be assigned to the controller.
 */
public static function middleware(): array
{
    return [
        function (Request $request, Closure $next) {
            return $next($request);
        },
    ];
}
```

<a id="middleware-attributes"></a>
### Atributos del middleware

También puedes asignar middleware a controladores usando atributos PHP:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth')]
#[Middleware('log', only: ['index'])]
#[Middleware('subscribed', except: ['store'])]
class UserController
{
    // ...
}
```

También puede colocar atributos de middleware en métodos de controlador individuales. El middleware asignado a los métodos se fusionará con el middleware asignado a nivel de clase:

```php
<?php

namespace App\Http\Controllers;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth')]
class UserController
{
    #[Middleware('log')]
    #[Middleware('subscribed')]
    public function index()
    {
        // ...
    }

    #[Middleware(static function (Request $request, Closure $next) {
        // ...

        return $next($request);
    })]
    public function store()
    {
        // ...
    }
}
```

Para excluir middleware de un controlador o de métodos de controlador individuales, utilice el atributo `WithoutMiddleware`. Puede utilizar los argumentos `only` y `except` para limitar un atributo de nivel de clase a métodos de controlador particulares:

```php
<?php

namespace App\Http\Controllers;

use App\Http\Middleware\EnsureTokenIsValid;
use Illuminate\Routing\Attributes\Controllers\WithoutMiddleware;

#[WithoutMiddleware('subscribed', except: ['index'])]
class UserController
{
    #[WithoutMiddleware(EnsureTokenIsValid::class)]
    public function index()
    {
        // ...
    }

    public function show()
    {
        // ...
    }
}
```

Los controladores secundarios heredan los atributos `WithoutMiddleware` de nivel de clase. El atributo solo puede eliminar el middleware de ruta y no se aplica al [middleware global](../middleware/#global-middleware).

<a id="authorization-attributes"></a>
### Atributos de autorización

Si autoriza acciones del controlador a través de políticas, puede utilizar el atributo `Authorize` como un acceso directo conveniente para el middleware `can`:

```php
<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Post;
use Illuminate\Routing\Attributes\Controllers\Authorize;

class CommentController
{
    #[Authorize('create', [Comment::class, 'post'])]
    public function store(Post $post)
    {
        // ...
    }

    #[Authorize('delete', 'comment')]
    public function destroy(Comment $comment)
    {
        // ...
    }
}
```

El primer argumento es la capacidad que desea autorizar. El segundo argumento es la clase de modelo, el parámetro de ruta o los parámetros que se deben pasar a la política.

<a id="resource-controllers"></a>
## Controladores de recursos

Si piensa en cada modelo de Eloquent en su aplicación como un "recurso", es típico realizar el mismo conjunto de acciones en cada recurso de su aplicación. Por ejemplo, imagine que su aplicación contiene un modelo `Photo` y un modelo `Movie`. Es probable que los usuarios puedan crear, leer, actualizar o eliminar estos recursos.

Debido a este caso de uso común, el enrutamiento de recursos de Laravel asigna las rutas típicas de creación, lectura, actualización y eliminación ("CRUD") a un controlador con una sola línea de código. Para comenzar, podemos usar la opción `--resource` del comando `make:controller` Artisan para crear rápidamente un controlador para manejar estas acciones:

```shell
php artisan make:controller PhotoController --resource
```

Este comando generará un controlador en `app/Http/Controllers/PhotoController.php`. El controlador contendrá un método para cada una de las operaciones de recursos disponibles. A continuación, puede registrar una ruta de recursos que apunte al controlador:

```php
use App\Http\Controllers\PhotoController;

Route::resource('photos', PhotoController::class);
```

Esta declaración de ruta única crea múltiples rutas para manejar una variedad de acciones en el recurso. El controlador generado ya tendrá métodos descartados para cada una de estas acciones. Recuerde, siempre puede obtener una descripción general rápida de las rutas de su aplicación ejecutando el comando `route:list` Artisan.

Incluso puedes registrar muchos controladores de recursos a la vez pasando una matriz al método `resources`:

```php
Route::resources([
    'photos' => PhotoController::class,
    'posts' => PostController::class,
]);
```

El método `softDeletableResources` registra muchos controladores de recursos que utilizan el método `withTrashed`:

```php
Route::softDeletableResources([
    'photos' => PhotoController::class,
    'posts' => PostController::class,
]);
```

<a id="actions-handled-by-resource-controllers"></a>
#### Acciones manejadas por controladores de recursos

<div class="overflow-auto">

| Verbo | URI | Acción | Nombre de la ruta |
| --------- | ---------------------- | ------- | -------------- |
| OBTENER | `/photos` | índice | fotos.indice |
| OBTENER | `/photos/create` | crear | fotos.crear |
| PUBLICAR | `/photos` | tienda | fotos.tienda |
| OBTENER | `/photos/{photo}` | mostrar | fotos.mostrar |
| OBTENER | `/photos/{photo}/edit` | editar | fotos.editar |
| PONER/PARCHE | `/photos/{photo}` | actualización | fotos.actualización |
| BORRAR | `/photos/{photo}` | destruir | fotos.destruir |

</div>

<a id="customizing-missing-model-behavior"></a>
#### Personalización del comportamiento del modelo faltante

Normalmente, se generará una respuesta HTTP 404 si no se encuentra un modelo de recurso vinculado implícitamente. Sin embargo, puede personalizar este comportamiento llamando al método `missing` al definir su ruta de recursos. El método `missing` acepta un cierre que se invocará si no se puede encontrar un modelo vinculado implícitamente para alguna de las rutas del recurso:

```php
use App\Http\Controllers\PhotoController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

Route::resource('photos', PhotoController::class)
    ->missing(function (Request $request) {
        return Redirect::route('photos.index');
    });
```

<a id="soft-deleted-models"></a>
#### Modelos eliminados temporalmente

Normalmente, el enlace de modelo implícito no recuperará los modelos que han sido [eliminados temporalmente](../eloquent/#soft-deleting) y, en su lugar, devolverá una respuesta HTTP 404. Sin embargo, puede indicarle al marco que permita modelos eliminados temporalmente invocando el método `withTrashed` al definir su ruta de recursos:

```php
use App\Http\Controllers\PhotoController;

Route::resource('photos', PhotoController::class)->withTrashed();
```

Llamar a `withTrashed` sin argumentos permitirá modelos eliminados temporalmente para las rutas de recursos `show`, `edit` y `update`. Puede especificar un subconjunto de estas rutas pasando una matriz al método `withTrashed`:

```php
Route::resource('photos', PhotoController::class)->withTrashed(['show']);
```

<a id="specifying-the-resource-model"></a>
#### Especificación del modelo de recurso

Si está utilizando [enlace de modelo de ruta](../routing/#route-model-binding) y desea que los métodos del controlador de recursos escriban sugerencias sobre una instancia de modelo, puede usar la opción `--model` al generar el controlador:

```shell
php artisan make:controller PhotoController --model=Photo --resource
```

<a id="generating-form-requests"></a>
#### Generando solicitudes de formulario

Puede proporcionar la opción `--requests` al generar un controlador de recursos para indicarle a Artisan que genere [clases de solicitud de formulario](../validation/#form-request-validation) para los métodos de almacenamiento y actualización del controlador:

```shell
php artisan make:controller PhotoController --model=Photo --resource --requests
```

<a id="restful-partial-resource-routes"></a>
### Rutas de recursos parciales

Al declarar una ruta de recursos, puede especificar un subconjunto de acciones que el controlador debe manejar en lugar del conjunto completo de acciones predeterminadas:

```php
use App\Http\Controllers\PhotoController;

Route::resource('photos', PhotoController::class)->only([
    'index', 'show'
]);

Route::resource('photos', PhotoController::class)->except([
    'create', 'store', 'update', 'destroy'
]);
```

<a id="api-resource-routes"></a>
#### Rutas de recursos API

Al declarar rutas de recursos que consumirán las API, normalmente querrá excluir rutas que presenten plantillas HTML como `create` y `edit`. Para mayor comodidad, puede utilizar el método `apiResource` para excluir automáticamente estas dos rutas:

```php
use App\Http\Controllers\PhotoController;

Route::apiResource('photos', PhotoController::class);
```

Puede registrar muchos controladores de recursos API a la vez pasando una matriz al método `apiResources`:

```php
use App\Http\Controllers\PhotoController;
use App\Http\Controllers\PostController;

Route::apiResources([
    'photos' => PhotoController::class,
    'posts' => PostController::class,
]);
```

Para generar rápidamente un controlador de recursos API que no incluya los métodos `create` o `edit`, use el modificador `--api` al ejecutar el comando `make:controller`:

```shell
php artisan make:controller PhotoController --api
```

<a id="restful-nested-resources"></a>
### Recursos anidados

A veces es posible que necesite definir rutas a un recurso anidado. Por ejemplo, un recurso fotográfico puede tener varios comentarios que se pueden adjuntar a la foto. Para anidar los controladores de recursos, puede utilizar la notación "punto" en su declaración de ruta:

```php
use App\Http\Controllers\PhotoCommentController;

Route::resource('photos.comments', PhotoCommentController::class);
```

Esta ruta registrará un recurso anidado al que se puede acceder con URI como el siguiente:

```text
/photos/{photo}/comments/{comment}
```

<a id="scoping-nested-resources"></a>
#### Determinación del alcance de los recursos anidados

La función [enlace de modelo implícito](../routing/#implicit-model-binding-scoping)] de Laravel puede abarcar automáticamente los enlaces anidados de modo que se confirme que el modelo secundario resuelto pertenece al modelo principal. Al utilizar el método `scoped` al definir su recurso anidado, puede habilitar el alcance automático e indicarle a Laravel por qué campo se debe recuperar el recurso secundario. Para obtener más información sobre cómo lograr esto, consulte la documentación sobre [alcance de rutas de recursos](#restful-scoping-resource-routes).

<a id="shallow-nesting"></a>
#### Anidamiento poco profundo

A menudo, no es del todo necesario tener tanto el ID del padre como el del niño dentro de un URI, ya que el ID del niño ya es un identificador único. Cuando utilice identificadores únicos, como claves primarias de incremento automático, para identificar sus modelos en segmentos de URI, puede optar por utilizar "anidamiento superficial":

```php
use App\Http\Controllers\CommentController;

Route::resource('photos.comments', CommentController::class)->shallow();
```

Esta definición de ruta definirá las siguientes rutas:

<div class="overflow-auto">

| Verbo | URI | Acción | Nombre de la ruta |
| --------- | --------------------------------- | ------- | ---------------------- |
| OBTENER | `/photos/{photo}/comments` | índice | fotos.comentarios.index |
| OBTENER | `/photos/{photo}/comments/create` | crear | fotos.comentarios.crear |
| PUBLICAR | `/photos/{photo}/comments` | tienda | fotos.comentarios.tienda |
| OBTENER | `/comments/{comment}` | mostrar | comentarios.mostrar |
| OBTENER | `/comments/{comment}/edit` | editar | comentarios.editar |
| PONER/PARCHE | `/comments/{comment}` | actualización | comentarios.actualización |
| BORRAR | `/comments/{comment}` | destruir | comentarios.destruir |

</div>

<a id="restful-naming-resource-routes"></a>
### Nombrar rutas de recursos

De forma predeterminada, todas las acciones del controlador de recursos tienen un nombre de ruta; sin embargo, puede anular estos nombres pasando una matriz `names` con los nombres de ruta que desee:

```php
use App\Http\Controllers\PhotoController;

Route::resource('photos', PhotoController::class)->names([
    'create' => 'photos.build'
]);
```

<a id="restful-naming-resource-route-parameters"></a>
### Nombrar parámetros de ruta de recursos

De forma predeterminada, `Route::resource` creará los parámetros de ruta para sus rutas de recursos según la versión "singularizada" del nombre del recurso. Puede anular esto fácilmente por recurso utilizando el método `parameters`. La matriz pasada al método `parameters` debe ser una matriz asociativa de nombres de recursos y nombres de parámetros:

```php
use App\Http\Controllers\AdminUserController;

Route::resource('users', AdminUserController::class)->parameters([
    'users' => 'admin_user'
]);
```

El ejemplo anterior genera el siguiente URI para la ruta `show` del recurso:

```text
/users/{admin_user}
```

<a id="restful-scoping-resource-routes"></a>
### Rutas de recursos de alcance

La función [enlace de modelo implícito con alcance](../routing/#implicit-model-binding-scoping) de Laravel puede abarcar automáticamente enlaces anidados de modo que se confirme que el modelo secundario resuelto pertenece al modelo principal. Al utilizar el método `scoped` al definir su recurso anidado, puede habilitar el alcance automático e indicarle a Laravel qué campo debe recuperar el recurso secundario:

```php
use App\Http\Controllers\PhotoCommentController;

Route::resource('photos.comments', PhotoCommentController::class)->scoped([
    'comment' => 'slug',
]);
```

Esta ruta registrará un recurso anidado con ámbito al que se puede acceder con URI como el siguiente:

```text
/photos/{photo}/comments/{comment:slug}
```

Cuando se utiliza un enlace implícito con clave personalizada como parámetro de ruta anidada, Laravel automáticamente aplicará el alcance de la consulta para recuperar el modelo anidado por parte de su padre usando convenciones para adivinar el nombre de la relación en el padre. En este caso, se asumirá que el modelo `Photo` tiene una relación denominada `comments` (el plural del nombre del parámetro de ruta) que se puede utilizar para recuperar el modelo `Comment`.

<a id="restful-localizing-resource-uris"></a>
### Localización de URI de recursos

De forma predeterminada, `Route::resource` creará URI de recursos utilizando verbos en inglés y reglas plurales. Si necesita localizar los verbos de acción `create` y `edit`, puede utilizar el método `Route::resourceVerbs`. Esto se puede hacer al comienzo del método `boot` dentro del `App\Providers\AppServiceProvider` de su aplicación:

```php
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Route::resourceVerbs([
        'create' => 'crear',
        'edit' => 'editar',
    ]);
}
```

El pluralizador de Laravel admite [varios idiomas diferentes que puede configurar según sus necesidades](../localization/#pluralization-language). Una vez que se hayan personalizado los verbos y el idioma de pluralización, un registro de ruta de recursos como `Route::resource('publicacion', PublicacionController::class)` producirá los siguientes URI:

```text
/publicacion/crear

/publicacion/{publicacion}/editar
```

<a id="restful-supplementing-resource-controllers"></a>
### Complementar controladores de recursos

Si necesita agregar rutas adicionales a un controlador de recursos más allá del conjunto predeterminado de rutas de recursos, debe definir esas rutas antes de llamar al método `Route::resource`; de lo contrario, las rutas definidas por el método `resource` pueden tener prioridad involuntariamente sobre sus rutas suplementarias:

```php
use App\Http\Controllers\PhotoController;

Route::get('/photos/popular', [PhotoController::class, 'popular']);
Route::resource('photos', PhotoController::class);
```

> **Nota:**
> Recuerde mantener sus controladores enfocados. Si habitualmente necesita métodos fuera del conjunto típico de acciones de recursos, considere dividir su controlador en dos controladores más pequeños.

<a id="singleton-resource-controllers"></a>
### Controladores de recursos Singleton

A veces, su aplicación tendrá recursos que pueden tener solo una instancia. Por ejemplo, el "perfil" de un usuario se puede editar o actualizar, pero un usuario no puede tener más de un "perfil". Asimismo, una imagen puede tener una única "miniatura". Estos recursos se denominan "recursos únicos", lo que significa que puede existir una y sólo una instancia del recurso. En estos escenarios, puede registrar un controlador de recursos "singleton":

```php
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::singleton('profile', ProfileController::class);
```

La definición de recurso singleton anterior registrará las siguientes rutas. Como puede ver, las rutas de "creación" no están registradas para recursos singleton y las rutas registradas no aceptan un identificador ya que solo puede existir una instancia del recurso:

<div class="overflow-auto">

| Verbo | URI | Acción | Nombre de la ruta |
| --------- | --------------- | ------ | -------------- |
| OBTENER | `/profile` | mostrar | perfil.mostrar |
| OBTENER | `/profile/edit` | editar | perfil.editar |
| PONER/PARCHE | `/profile` | actualización | perfil.actualización |

</div>

Los recursos singleton también se pueden anidar dentro de un recurso estándar:

```php
Route::singleton('photos.thumbnail', ThumbnailController::class);
```

En este ejemplo, el recurso `photos` recibiría todas las [rutas de recursos estándar](#actions-handled-by-resource-controllers); sin embargo, el recurso `thumbnail` sería un recurso único con las siguientes rutas:

<div class="overflow-auto">

| Verbo | URI | Acción | Nombre de la ruta |
| --------- | -------------------------------- | ------ | ----------------------- |
| OBTENER | `/photos/{photo}/thumbnail` | mostrar | fotos.miniatura.mostrar |
| OBTENER | `/photos/{photo}/thumbnail/edit` | editar | fotos.miniatura.editar |
| PONER/PARCHE | `/photos/{photo}/thumbnail` | actualización | fotos.miniatura.actualización |

</div>

<a id="creatable-singleton-resources"></a>
#### Recursos Singleton creables

En ocasiones, es posible que desee definir rutas de creación y almacenamiento para un recurso único. Para lograr esto, puede invocar el método `creatable` al registrar la ruta de recursos singleton:

```php
Route::singleton('photos.thumbnail', ThumbnailController::class)->creatable();
```

En este ejemplo, se registrarán las siguientes rutas. Como puede ver, también se registrará una ruta `DELETE` para recursos singleton creables:

<div class="overflow-auto">

| Verbo | URI | Acción | Nombre de la ruta |
| --------- | ---------------------------------- | ------- | ------------------------ |
| OBTENER | `/photos/{photo}/thumbnail/create` | crear | fotos.miniatura.crear |
| PUBLICAR | `/photos/{photo}/thumbnail` | tienda | fotos.thumbnail.store |
| OBTENER | `/photos/{photo}/thumbnail` | mostrar | fotos.miniatura.mostrar |
| OBTENER | `/photos/{photo}/thumbnail/edit` | editar | fotos.miniatura.editar |
| PONER/PARCHE | `/photos/{photo}/thumbnail` | actualización | fotos.miniatura.actualización |
| BORRAR | `/photos/{photo}/thumbnail` | destruir | fotos.miniatura.destruir |

</div>

Si desea que Laravel registre la ruta `DELETE` para un recurso singleton pero no registre las rutas de creación o almacenamiento, puede utilizar el método `destroyable`:

```php
Route::singleton(...)->destroyable();
```

<a id="api-singleton-resources"></a>
#### Recursos API Singleton

El método `apiSingleton` se puede utilizar para registrar un recurso singleton que se manipulará mediante una API, lo que hace que las rutas `create` y `edit` sean innecesarias:

```php
Route::apiSingleton('profile', ProfileController::class);
```

Por supuesto, los recursos API singleton también pueden ser `creatable`, que registrarán las rutas `store` y `destroy` para el recurso:

```php
Route::apiSingleton('photos.thumbnail', ProfileController::class)->creatable();
```
<a id="middleware-and-resource-controllers"></a>
### Controladores de recursos y middleware

Laravel le permite asignar middleware a todos, o solo a métodos específicos, de rutas de recursos utilizando los métodos `middleware`, `middlewareFor` y `withoutMiddlewareFor`. Estos métodos proporcionan un control detallado sobre qué middleware se aplica a cada acción de recurso.

#### Aplicación de middleware a todos los métodos

Puede utilizar el método `middleware` para asignar middleware a todas las rutas generadas por un recurso o una ruta de recurso única:

```php
Route::resource('users', UserController::class)
    ->middleware(['auth', 'verified']);

Route::singleton('profile', ProfileController::class)
    ->middleware('auth');
```

#### Aplicación de middleware a métodos específicos

Puede utilizar el método `middlewareFor` para asignar middleware a uno o más métodos específicos de un controlador de recursos determinado:

```php
Route::resource('users', UserController::class)
    ->middlewareFor('show', 'auth');

Route::apiResource('users', UserController::class)
    ->middlewareFor(['show', 'update'], 'auth');

Route::resource('users', UserController::class)
    ->middlewareFor('show', 'auth')
    ->middlewareFor('update', 'auth');

Route::apiResource('users', UserController::class)
    ->middlewareFor(['show', 'update'], ['auth', 'verified']);
```

El método `middlewareFor` también se puede utilizar junto con controladores de recursos singleton y API singleton:

```php
Route::singleton('profile', ProfileController::class)
    ->middlewareFor('show', 'auth');

Route::apiSingleton('profile', ProfileController::class)
    ->middlewareFor(['show', 'update'], 'auth');
```

#### Exclusión de middleware de métodos específicos

Puede utilizar el método `withoutMiddlewareFor` para excluir el middleware de métodos específicos de un controlador de recursos:

```php
Route::middleware(['auth', 'verified', 'subscribed'])->group(function () {
    Route::resource('users', UserController::class)
        ->withoutMiddlewareFor('index', ['auth', 'verified'])
        ->withoutMiddlewareFor(['create', 'store'], 'verified')
        ->withoutMiddlewareFor('destroy', 'subscribed');
});
```

<a id="dependency-injection-and-controllers"></a>
## Inyección de dependencia y controladores

<a id="constructor-injection"></a>
#### Inyección de constructor

El [contenedor de servicios Laravel](../container/) se utiliza para resolver todos los controladores de Laravel. Como resultado, puede escribir sugerencias sobre cualquier dependencia que su controlador pueda necesitar en su constructor. Las dependencias declaradas se resolverán e inyectarán automáticamente en la instancia del controlador:

```php
<?php

namespace App\Http\Controllers;

use App\Repositories\UserRepository;

class UserController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct(
        protected UserRepository $users,
    ) {}
}
```

<a id="method-injection"></a>
#### Método de inyección

Además de la inyección del constructor, también puede escribir sugerencias de dependencias en los métodos de su controlador. Un caso de uso común para la inyección de métodos es inyectar la instancia `Illuminate\Http\Request` en los métodos de su controlador:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Store a new user.
     */
    public function store(Request $request): RedirectResponse
    {
        $name = $request->name;

        // Store the user...

        return redirect('/users');
    }
}
```

Si su método de controlador también espera información de un parámetro de ruta, enumere sus argumentos de ruta después de sus otras dependencias. Por ejemplo, si su ruta se define así:

```php
use App\Http\Controllers\UserController;

Route::put('/user/{id}', [UserController::class, 'update']);
```

Aún puede escribir la sugerencia `Illuminate\Http\Request` y acceder a su parámetro `id` definiendo su método de controlador de la siguiente manera:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Update the given user.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        // Update the user...

        return redirect('/users');
    }
}
```
