---
title: "Enrutamiento"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Enrutamiento básico](#basic-routing)
    - [Los archivos de ruta predeterminados](#the-default-route-files)
    - [Rutas de redireccionamiento](#redirect-routes)
    - [Ver Rutas](#view-routes)
    - [Listando sus rutas](#listing-your-routes)
    - [Personalización de ruta](#routing-customization)
- [Parámetros de ruta](#route-parameters)
    - [Parámetros requeridos](#required-parameters)
    - [Parámetros opcionales](#parameters-optional-parameters)
    - [Restricciones de expresión regular](#parameters-regular-expression-constraints)
- [Rutas nombradas](#named-routes)
- [Grupos de rutas](#route-groups)
    - [Middleware](#route-group-middleware)
    - [Controladores](#route-group-controllers)
    - [Enrutamiento de subdominio](#route-group-subdomain-routing)
    - [Prefijos de ruta](#route-group-prefixes)
    - [Prefijos de nombre de ruta](#route-group-name-prefixes)
- [Enlace de modelo de ruta](#route-model-binding)
    - [Enlace implícito](#implicit-binding)
    - [Enlace de enumeración implícito](#implicit-enum-binding)
    - [Enlace explícito](#explicit-binding)
- [Rutas alternativas](#fallback-routes)
- [Limitación de velocidad](#rate-limiting)
    - [Definición de limitadores de velocidad](#defining-rate-limiters)
    - [Conexión de limitadores de velocidad a rutas](#attaching-rate-limiters-to-routes)
- [Método de formulario Spoofing](#form-method-spoofing)
- [Accediendo a la Ruta Actual](#accessing-the-current-route)
- [Compartir recursos entre orígenes (CORS)](#cors)
- [Almacenamiento en caché de ruta](#route-caching)

<a id="basic-routing"></a>
## Enrutamiento básico

Las rutas Laravel más básicas aceptan un URI y una función anónima, proporcionando un método muy simple y expresivo para definir rutas y comportamiento sin archivos de configuración de enrutamiento complicados:

```php
use Illuminate\Support\Facades\Route;

Route::get('/greeting', function () {
    return 'Hello World';
});
```

<a id="the-default-route-files"></a>
### Los archivos de ruta predeterminados

Todas las rutas de Laravel están definidas en sus archivos de ruta, que se encuentran en el directorio `routes`. Laravel carga automáticamente estos archivos utilizando la configuración especificada en el archivo `bootstrap/app.php` de su aplicación. El archivo `routes/web.php` define rutas que son para su interfaz web. A estas rutas se les asigna el `web` [grupo de middleware](../middleware/#laravels-default-middleware-groups), que proporciona características como estado de sesión y protección CSRF.

Para la mayoría de las aplicaciones, comenzará definiendo rutas en su archivo `routes/web.php`. Se puede acceder a las rutas definidas en `routes/web.php` ingresando la URL de la ruta definida en su navegador. Por ejemplo, puede acceder a la siguiente ruta navegando hasta `http://example.com/user` en su navegador:

```php
use App\Http\Controllers\UserController;

Route::get('/user', [UserController::class, 'index']);
```

<a id="api-routes"></a>
#### Rutas API

Si su aplicación también ofrecerá una API sin estado, puede habilitar el enrutamiento de API usando el comando `install:api` Artisan:

```shell
php artisan install:api
```

El comando `install:api` instala [Laravel Sanctum](../sanctum/), que proporciona una protección de autenticación de token API robusta pero simple que se puede utilizar para autenticar consumidores de API de terceros, SPA o aplicaciones móviles. Además, el comando `install:api` crea el archivo `routes/api.php`:

```php
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
```

Por supuesto, puede omitir el middleware `auth:sanctum` en rutas que deberían ser accesibles públicamente.

Las rutas en `routes/api.php` no tienen estado y están asignadas al `api` [grupo de middleware](../middleware/#laravels-default-middleware-groups). Además, el prefijo URI `/api` se aplica automáticamente a estas rutas, por lo que no es necesario aplicarlo manualmente a cada ruta del archivo. Puede cambiar el prefijo modificando el archivo `bootstrap/app.php` de su aplicación:

```php
->withRouting(
    api: __DIR__.'/../routes/api.php',
    apiPrefix: 'api/admin',
    // ...
)
```

<a id="available-router-methods"></a>
#### Métodos de enrutador disponibles

El enrutador le permite registrar rutas que responden a cualquier verbo HTTP:

```php
Route::get($uri, $callback);
Route::post($uri, $callback);
Route::put($uri, $callback);
Route::patch($uri, $callback);
Route::delete($uri, $callback);
Route::options($uri, $callback);
Route::query($uri, $callback);
```

El método `query` registra una ruta que responde al verbo HTTP `QUERY`, lo que permite a los clientes enviar un cuerpo de solicitud para una consulta. Las rutas `QUERY` en el grupo de middleware `web` están sujetas a la [protección CSRF](../csrf/).

A veces es posible que necesites registrar una ruta que responda a varios verbos HTTP. Puede hacerlo utilizando el método `match`. O incluso puede registrar una ruta que responda a todos los verbos HTTP, incluido `QUERY`, utilizando el método `any`:

```php
Route::match(['get', 'post'], '/', function () {
    // ...
});

Route::any('/', function () {
    // ...
});
```

> **Nota:**
> Al definir varias rutas que comparten el mismo URI, las rutas que utilizan los métodos `get`, `post`, `put`, `patch`, `delete`, `options` y `query` deben definirse antes que las rutas que utilizan `any`. Métodos `match` y `redirect`. Esto garantiza que la solicitud entrante coincida con la ruta correcta.

<a id="dependency-injection"></a>
#### Inyección de dependencia

Puede escribir sugerencias sobre cualquier dependencia requerida por su ruta en la firma de devolución de llamada de su ruta. Las dependencias declaradas serán resueltas e inyectadas automáticamente en la devolución de llamada por Laravel [contenedor de servicio](../container/). Por ejemplo, puede escribir una sugerencia para la clase `Illuminate\Http\Request` para que la solicitud HTTP actual se inyecte automáticamente en su devolución de llamada de ruta:

```php
use Illuminate\Http\Request;

Route::get('/users', function (Request $request) {
    // ...
});
```

<a id="csrf-protection"></a>
#### Protección CSRF

Recuerde, cualquier formulario HTML que apunte a rutas `POST`, `PUT`, `PATCH` o `DELETE` definidas en el archivo de rutas `web` debe incluir un campo de token CSRF. En caso contrario, la solicitud será rechazada. Puede leer más sobre la protección CSRF en la [documentación CSRF](../csrf/):

```blade
<form method="POST" action="/profile">
    @csrf
    ...
</form>
```

<a id="redirect-routes"></a>
### Rutas de redireccionamiento

Si está definiendo una ruta que redirige a otro URI, puede utilizar el método `Route::redirect`. Este método proporciona un atajo conveniente para que no tenga que definir una ruta completa o un controlador para realizar una redirección simple:

```php
Route::redirect('/here', '/there');
```

De forma predeterminada, `Route::redirect` devuelve un código de estado `302`. Puede personalizar el código de estado utilizando el tercer parámetro opcional:

```php
Route::redirect('/here', '/there', 301);
```

O puede utilizar el método `Route::permanentRedirect` para devolver un código de estado `301`:

```php
Route::permanentRedirect('/here', '/there');
```

> **Advertencia:**
> Cuando se utilizan parámetros de ruta en rutas de redireccionamiento, Laravel reserva los siguientes parámetros y no se pueden utilizar: `destination` y `status`.

<a id="view-routes"></a>
### Ver rutas

Si su ruta solo necesita devolver un [view](../views/), puede usar el método `Route::view`. Al igual que el método `redirect`, este método proporciona un acceso directo simple para que no tenga que definir una ruta o un controlador completo. El método `view` acepta un URI como primer argumento y un nombre de vista como segundo argumento. Además, puede proporcionar una serie de datos para pasar a la vista como un tercer argumento opcional:

```php
Route::view('/welcome', 'welcome');

Route::view('/welcome', 'welcome', ['name' => 'Taylor']);
```

> **Advertencia:**
> Cuando se usan parámetros de ruta en ver rutas, Laravel reserva los siguientes parámetros y no se pueden usar: `view`, `data`, `status` y `headers`.

<a id="listing-your-routes"></a>
### Enumerar sus rutas

El comando `route:list` Artisan puede proporcionar fácilmente una descripción general de todas las rutas definidas por su aplicación:

```shell
php artisan route:list
```

De forma predeterminada, el middleware de ruta asignado a cada ruta no se mostrará en la salida `route:list`; sin embargo, puede indicarle a Laravel que muestre el middleware de ruta y los nombres de los grupos de middleware agregando la opción `-v` al comando:

```shell
php artisan route:list -v

# Expand middleware groups...
php artisan route:list -vv
```

También puedes indicarle a Laravel que solo muestre rutas cuyo URI contenga una cadena determinada:

```shell
php artisan route:list --path=api
```

Además, puede indicarle a Laravel que oculte cualquier ruta definida por paquetes de terceros proporcionando la opción `--except-vendor` al ejecutar el comando `route:list`:

```shell
php artisan route:list --except-vendor
```

Del mismo modo, también puede indicarle a Laravel que solo muestre rutas definidas por paquetes de terceros proporcionando la opción `--only-vendor` al ejecutar el comando `route:list`:

```shell
php artisan route:list --only-vendor
```

<a id="routing-customization"></a>
### Personalización de rutas

De forma predeterminada, las rutas de su aplicación se configuran y cargan mediante el archivo `bootstrap/app.php`:

```php
<?php

use Illuminate\Foundation\Application;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )->create();
```

Sin embargo, a veces es posible que desee definir un archivo completamente nuevo para que contenga un subconjunto de las rutas de su aplicación. Para lograr esto, puede proporcionar una función anónima `then` al método `withRouting`. Dentro de esta función anónima, podrá registrar cualquier ruta adicional que sea necesaria para su aplicación:

```php
use Illuminate\Support\Facades\Route;

->withRouting(
    web: __DIR__.'/../routes/web.php',
    commands: __DIR__.'/../routes/console.php',
    health: '/up',
    then: function () {
        Route::middleware('api')
            ->prefix('webhooks')
            ->name('webhooks.')
            ->group(base_path('routes/webhooks.php'));
    },
)
```

O incluso puede tomar control total sobre el registro de rutas proporcionando una función anónima `using` al método `withRouting`. Cuando se pasa este argumento, el marco no registrará ninguna ruta HTTP y usted es responsable de registrar manualmente todas las rutas:

```php
use Illuminate\Support\Facades\Route;

->withRouting(
    commands: __DIR__.'/../routes/console.php',
    using: function () {
        Route::middleware('api')
            ->prefix('api')
            ->group(base_path('routes/api.php'));

        Route::middleware('web')
            ->group(base_path('routes/web.php'));
    },
)
```

<a id="route-parameters"></a>
## Parámetros de ruta

<a id="required-parameters"></a>
### Parámetros requeridos

A veces necesitarás capturar segmentos del URI dentro de tu ruta. Por ejemplo, es posible que necesite capturar la identificación de un usuario desde la URL. Puede hacerlo definiendo parámetros de ruta:

```php
Route::get('/user/{id}', function (string $id) {
    return 'User '.$id;
});
```

Puede definir tantos parámetros de ruta como requiera su ruta:

```php
Route::get('/posts/{post}/comments/{comment}', function (string $postId, string $commentId) {
    // ...
});
```

Los parámetros de ruta siempre están entre llaves `{}` y deben constar de caracteres alfabéticos. Los guiones bajos (`_`) también son aceptables dentro de los nombres de los parámetros de ruta. Los parámetros de ruta se inyectan en los controladores/devoluciones de llamada de ruta según su orden; los nombres de los argumentos del controlador/devolución de llamada de ruta no importan.

<a id="parameters-and-dependency-injection"></a>
#### Parámetros e inyección de dependencia

Si su ruta tiene dependencias que le gustaría que el contenedor de servicios Laravel inyecte automáticamente en la devolución de llamada de su ruta, debe enumerar los parámetros de su ruta después de sus dependencias:

```php
use Illuminate\Http\Request;

Route::get('/user/{id}', function (Request $request, string $id) {
    return 'User '.$id;
});
```

<a id="parameters-optional-parameters"></a>
### Parámetros opcionales

En ocasiones, es posible que necesite especificar un parámetro de ruta que no siempre esté presente en el URI. Puede hacerlo colocando una marca `?` después del nombre del parámetro. Asegúrese de darle a la variable correspondiente de la ruta un valor predeterminado:

```php
Route::get('/user/{name?}', function (?string $name = null) {
    return $name;
});

Route::get('/user/{name?}', function (?string $name = 'John') {
    return $name;
});
```

<a id="parameters-regular-expression-constraints"></a>
### Restricciones de expresiones regulares

Puede restringir el formato de sus parámetros de ruta utilizando el método `where` en una instancia de ruta. El método `where` acepta el nombre del parámetro y una expresión regular que define cómo se debe restringir el parámetro:

```php
Route::get('/user/{name}', function (string $name) {
    // ...
})->where('name', '[A-Za-z]+');

Route::get('/user/{id}', function (string $id) {
    // ...
})->where('id', '[0-9]+');

Route::get('/user/{id}/{name}', function (string $id, string $name) {
    // ...
})->where(['id' => '[0-9]+', 'name' => '[a-z]+']);
```

Para mayor comodidad, algunos patrones de expresiones regulares de uso común tienen métodos auxiliares que le permiten agregar rápidamente restricciones de patrón a sus rutas:

```php
Route::get('/user/{id}/{name}', function (string $id, string $name) {
    // ...
})->whereNumber('id')->whereAlpha('name');

Route::get('/user/{name}', function (string $name) {
    // ...
})->whereAlphaNumeric('name');

Route::get('/user/{id}', function (string $id) {
    // ...
})->whereUuid('id');

Route::get('/user/{id}', function (string $id) {
    // ...
})->whereUlid('id');

Route::get('/category/{category}', function (string $category) {
    // ...
})->whereIn('category', ['movie', 'song', 'painting']);

Route::get('/category/{category}', function (string $category) {
    // ...
})->whereIn('category', CategoryEnum::cases());
```

Si la solicitud entrante no coincide con las restricciones del patrón de ruta, se devolverá una respuesta HTTP 404.

<a id="parameters-global-constraints"></a>
#### Restricciones globales

Si desea que un parámetro de ruta esté siempre restringido por una expresión regular determinada, puede utilizar el método `pattern`. Debes definir estos patrones en el método `boot` de la clase `App\Providers\AppServiceProvider` de tu aplicación:

```php
use Illuminate\Support\Facades\Route;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Route::pattern('id', '[0-9]+');
}
```

Una vez definido el patrón, se aplica automáticamente a todas las rutas utilizando ese nombre de parámetro:

```php
Route::get('/user/{id}', function (string $id) {
    // Only executed if {id} is numeric...
});
```

<a id="parameters-encoded-forward-slashes"></a>
#### Barras diagonales codificadas

El componente de enrutamiento de Laravel permite que todos los caracteres excepto `/` estén presentes dentro de los valores de los parámetros de ruta. Debe permitir explícitamente que `/` forme parte de su marcador de posición mediante una expresión regular de condición `where`:

```php
Route::get('/search/{search}', function (string $search) {
    return $search;
})->where('search', '.*');
```

> **Advertencia:**
> Las barras diagonales codificadas solo se admiten dentro del último segmento de ruta.

<a id="named-routes"></a>
## Rutas con nombre

Las rutas con nombre permiten la generación conveniente de URL o redireccionamientos para rutas específicas. Puede especificar un nombre para una ruta encadenando el método `name` en la definición de ruta:

```php
Route::get('/user/profile', function () {
    // ...
})->name('profile');
```

También puede especificar nombres de ruta para acciones del controlador:

```php
Route::get(
    '/user/profile',
    [UserProfileController::class, 'show']
)->name('profile');
```

> **Advertencia:**
> Los nombres de las rutas siempre deben ser únicos.

<a id="generating-urls-to-named-routes"></a>
#### Generación de URL para rutas con nombre

Una vez que haya asignado un nombre a una ruta determinada, puede usar el nombre de la ruta al generar URL o redirecciones a través de las funciones auxiliares `route` y `redirect` de Laravel:

```php
// Generating URLs...
$url = route('profile');

// Generating Redirects...
return redirect()->route('profile');

return to_route('profile');
```

Si la ruta nombrada define parámetros, puede pasar los parámetros como segundo argumento a la función `route`. Los parámetros proporcionados se insertarán automáticamente en la URL generada en sus posiciones correctas:

```php
Route::get('/user/{id}/profile', function (string $id) {
    // ...
})->name('profile');

$url = route('profile', ['id' => 1]);
```

Si pasa parámetros adicionales en la matriz, esos pares clave/valor se agregarán automáticamente a la cadena de consulta de la URL generada:

```php
Route::get('/user/{id}/profile', function (string $id) {
    // ...
})->name('profile');

$url = route('profile', ['id' => 1, 'photos' => 'yes']);

// http://example.com/user/1/profile?photos=yes
```

> **Nota:**
> A veces, es posible que desee especificar valores predeterminados para toda la solicitud para los parámetros de URL, como la configuración regional actual. Para lograr esto, puede utilizar el [URL::método predeterminado](../urls/#default-values).

<a id="inspecting-the-current-route"></a>
#### Inspeccionando la ruta actual

Si desea determinar si la solicitud actual se enruta a una ruta con nombre determinada, puede utilizar el método `named` en una instancia de ruta. Por ejemplo, puede verificar el nombre de la ruta actual desde un middleware de ruta:

```php
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Handle an incoming request.
 *
 * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
 */
public function handle(Request $request, Closure $next): Response
{
    if ($request->route()->named('profile')) {
        // ...
    }

    return $next($request);
}
```

<a id="route-groups"></a>
## Grupos de rutas

Los grupos de rutas le permiten compartir atributos de ruta, como middleware, en una gran cantidad de rutas sin necesidad de definir esos atributos en cada ruta individual.

Los grupos anidados intentan "fusionar" atributos de forma inteligente con su grupo principal. Las condiciones de middleware y `where` se fusionan mientras se añaden nombres y prefijos. Los delimitadores de espacios de nombres y barras diagonales en los prefijos de URI se agregan automáticamente cuando corresponde.

<a id="route-group-middleware"></a>
### Middleware

Para asignar [middleware](../middleware/) a todas las rutas dentro de un grupo, puede utilizar el método `middleware` antes de definir el grupo. El middleware se ejecuta en el orden en que aparecen en la matriz:

```php
Route::middleware(['first', 'second'])->group(function () {
    Route::get('/', function () {
        // Uses first & second middleware...
    });

    Route::get('/user/profile', function () {
        // Uses first & second middleware...
    });
});
```

<a id="route-group-controllers"></a>
### Controladores

Si un grupo de rutas utiliza el mismo [controller](../controllers/), puede usar el método `controller` para definir el controlador común para todas las rutas dentro del grupo. Luego, al definir las rutas, solo necesitas proporcionar el método del controlador que invocan:

```php
use App\Http\Controllers\OrderController;

Route::controller(OrderController::class)->group(function () {
    Route::get('/orders/{id}', 'show');
    Route::post('/orders', 'store');
});
```

<a id="route-group-subdomain-routing"></a>
### Enrutamiento de subdominio

Los grupos de rutas también se pueden utilizar para manejar el enrutamiento de subdominios. A los subdominios se les pueden asignar parámetros de ruta al igual que los URI de ruta, lo que le permite capturar una parte del subdominio para usarlo en su ruta o controlador. El subdominio se puede especificar llamando al método `domain` antes de definir el grupo:

```php
Route::domain('{account}.example.com')->group(function () {
    Route::get('/user/{id}', function (string $account, string $id) {
        // ...
    });
});
```

<a id="route-group-prefixes"></a>
### Prefijos de ruta

El método `prefix` se puede utilizar para prefijar cada ruta del grupo con un URI determinado. Por ejemplo, es posible que desee anteponer a todos los URI de ruta dentro del grupo el prefijo `admin`:

```php
Route::prefix('admin')->group(function () {
    Route::get('/users', function () {
        // Matches The "/admin/users" URL
    });
});
```

<a id="route-group-name-prefixes"></a>
### Prefijos de nombre de ruta

El método `name` se puede utilizar para prefijar cada nombre de ruta en el grupo con una cadena determinada. Por ejemplo, es posible que desee anteponer a los nombres de todas las rutas del grupo el prefijo `admin`. La cadena proporcionada tiene el prefijo del nombre de la ruta exactamente como se especifica, por lo que nos aseguraremos de proporcionar el carácter final `.` en el prefijo:

```php
Route::name('admin.')->group(function () {
    Route::get('/users', function () {
        // Route assigned name "admin.users"...
    })->name('users');
});
```

<a id="route-model-binding"></a>
## Enlace del modelo de ruta

Al inyectar un ID de modelo a una ruta o acción del controlador, a menudo consultará la base de datos para recuperar el modelo que corresponde a ese ID. El enlace del modelo de ruta de Laravel proporciona una manera conveniente de inyectar automáticamente las instancias del modelo directamente en sus rutas. Por ejemplo, en lugar de inyectar el ID de un usuario, puede inyectar toda la instancia del modelo `User` que coincida con el ID proporcionado.

<a id="implicit-binding"></a>
### Enlace implícito

Laravel resuelve automáticamente los modelos Eloquent definidos en rutas o acciones del controlador cuyos nombres de variables con sugerencias de tipo coinciden con el nombre de un segmento de ruta. Por ejemplo:

```php
use App\Models\User;

Route::get('/users/{user}', function (User $user) {
    return $user->email;
});
```

Dado que la variable `$user` se insinúa como el modelo Eloquent `App\Models\User` y el nombre de la variable coincide con el segmento URI `{user}`, Laravel inyectará automáticamente la instancia del modelo que tiene una ID que coincida con el valor correspondiente del URI de solicitud. Si no se encuentra una instancia de modelo coincidente en la base de datos, se generará automáticamente una respuesta HTTP 404.

Por supuesto, la vinculación implícita también es posible cuando se utilizan métodos de controlador. Nuevamente, tenga en cuenta que el segmento URI `{user}` coincide con la variable `$user` en el controlador que contiene una sugerencia de tipo `App\Models\User`:

```php
use App\Http\Controllers\UserController;
use App\Models\User;

// Route definition...
Route::get('/users/{user}', [UserController::class, 'show']);

// Controller method definition...
public function show(User $user)
{
    return view('user.profile', ['user' => $user]);
}
```

<a id="implicit-soft-deleted-models"></a>
#### Modelos eliminados temporalmente

Normalmente, el enlace de modelo implícito no recuperará modelos que hayan sido [eliminados temporalmente](../eloquent/#soft-deleting). Sin embargo, puede indicarle al enlace implícito que recupere estos modelos encadenando el método `withTrashed` en la definición de su ruta:

```php
use App\Models\User;

Route::get('/users/{user}', function (User $user) {
    return $user->email;
})->withTrashed();
```

<a id="customizing-the-default-key-name"></a>
#### Personalización de la clave

A veces es posible que desees resolver los modelos de Eloquent utilizando una columna distinta de `id`. Para hacerlo, puede especificar la columna en la definición del parámetro de ruta:

```php
use App\Models\Post;

Route::get('/posts/{post:slug}', function (Post $post) {
    return $post;
});
```

Si desea que el enlace del modelo utilice siempre una columna de base de datos distinta de `id` al recuperar una clase de modelo determinada, puede aplicar el atributo `RouteKey` al modelo Eloquent:

```php
use Illuminate\Database\Eloquent\Attributes\RouteKey;
use Illuminate\Database\Eloquent\Model;

#[RouteKey('slug')]
class Post extends Model
{
    // ...
}
```

<a id="implicit-model-binding-scoping"></a>
#### Claves personalizadas y alcance

Al vincular implícitamente varios modelos de Eloquent en una única definición de ruta, es posible que desee establecer el alcance del segundo modelo de Eloquent de modo que deba ser hijo del modelo de Eloquent anterior. Por ejemplo, considere esta definición de ruta que recupera una publicación de blog mediante slug para un usuario específico:

```php
use App\Models\Post;
use App\Models\User;

Route::get('/users/{user}/posts/{post:slug}', function (User $user, Post $post) {
    return $post;
});
```

Cuando se utiliza un enlace implícito con clave personalizada como parámetro de ruta anidada, Laravel automáticamente aplicará el alcance de la consulta para recuperar el modelo anidado por parte de su padre usando convenciones para adivinar el nombre de la relación en el padre. En este caso, se asumirá que el modelo `User` tiene una relación denominada `posts` (la forma plural del nombre del parámetro de ruta) que se puede utilizar para recuperar el modelo `Post`.

Si lo desea, puede indicarle a Laravel que alcance los enlaces "secundarios" incluso cuando no se proporciona una clave personalizada. Para hacerlo, puede invocar el método `scopeBindings` al definir su ruta:

```php
use App\Models\Post;
use App\Models\User;

Route::get('/users/{user}/posts/{post}', function (User $user, Post $post) {
    return $post;
})->scopeBindings();
```

O bien, puede indicar a un grupo completo de definiciones de ruta que utilicen enlaces de ámbito:

```php
Route::scopeBindings()->group(function () {
    Route::get('/users/{user}/posts/{post}', function (User $user, Post $post) {
        return $post;
    });
});
```

De manera similar, puede indicarle explícitamente a Laravel que no alcance los enlaces invocando el método `withoutScopedBindings`:

```php
Route::get('/users/{user}/posts/{post:slug}', function (User $user, Post $post) {
    return $post;
})->withoutScopedBindings();
```

<a id="customizing-missing-model-behavior"></a>
#### Personalización del comportamiento del modelo faltante

Normalmente, se generará una respuesta HTTP 404 si no se encuentra un modelo vinculado implícitamente. Sin embargo, puede personalizar este comportamiento llamando al método `missing` al definir su ruta. El método `missing` acepta una función anónima que se invocará si no se puede encontrar un modelo vinculado implícitamente:

```php
use App\Http\Controllers\LocationsController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

Route::get('/locations/{location:slug}', [LocationsController::class, 'show'])
    ->name('locations.view')
    ->missing(function (Request $request) {
        return Redirect::route('locations.index');
    });
```

<a id="implicit-enum-binding"></a>
### Vinculación de enumeración implícita

PHP 8.1 introdujo soporte para [Enums](https://www.php.net/manual/en/language.enumerations.backed.php). Para complementar esta característica, Laravel le permite escribir una sugerencia [Enum](https://www.php.net/manual/en/language.enumerations.backed.php) respaldada por cadena en su definición de ruta y Laravel solo invocará la ruta si ese segmento de ruta corresponde a un valor Enum válido. De lo contrario, se devolverá automáticamente una respuesta HTTP 404. Por ejemplo, dada la siguiente enumeración:

```php
<?php

namespace App\Enums;

enum Category: string
{
    case Fruits = 'fruits';
    case People = 'people';
}
```

Puede definir una ruta que solo se invocará si el segmento de ruta `{category}` es `fruits` o `people`. De lo contrario, Laravel devolverá una respuesta HTTP 404:

```php
use App\Enums\Category;
use Illuminate\Support\Facades\Route;

Route::get('/categories/{category}', function (Category $category) {
    return $category->value;
});
```

<a id="explicit-binding"></a>
### Enlace explícito

No es necesario utilizar la resolución de modelo implícita basada en convenciones de Laravel para poder utilizar el enlace de modelo. También puede definir explícitamente cómo los parámetros de ruta corresponden a los modelos. Para registrar un enlace explícito, utilice el método `model` del enrutador para especificar la clase para un parámetro determinado. Debes definir tus enlaces de modelo explícitos al comienzo del método `boot` de tu clase `AppServiceProvider`:

```php
use App\Models\User;
use Illuminate\Support\Facades\Route;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Route::model('user', User::class);
}
```

A continuación, defina una ruta que contenga un parámetro `{user}`:

```php
use App\Models\User;

Route::get('/users/{user}', function (User $user) {
    // ...
});
```

Como hemos vinculado todos los parámetros `{user}` al modelo `App\Models\User`, se inyectará una instancia de esa clase en la ruta. Entonces, por ejemplo, una solicitud a `users/1` inyectará la instancia `User` de la base de datos que tiene un ID de `1`.

Si no se encuentra una instancia de modelo coincidente en la base de datos, se generará automáticamente una respuesta HTTP 404.

<a id="customizing-the-resolution-logic"></a>
#### Personalización de la lógica de resolución

Si desea definir su propia lógica de resolución de enlace de modelo, puede utilizar el método `Route::bind`. La función anónima que pase al método `bind` recibirá el valor del segmento URI y deberá devolver la instancia de la clase que debe inyectarse en la ruta. Nuevamente, esta personalización debe realizarse en el método `boot` del `AppServiceProvider` de su aplicación:

```php
use App\Models\User;
use Illuminate\Support\Facades\Route;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Route::bind('user', function (string $value) {
        return User::where('name', $value)->firstOrFail();
    });
}
```

Alternativamente, puede anular el método `resolveRouteBinding` en su modelo Eloquent. Este método recibirá el valor del segmento URI y debería devolver la instancia de la clase que debería inyectarse en la ruta:

```php
/**
 * Retrieve the model for a bound value.
 *
 * @param  mixed  $value
 * @param  string|null  $field
 * @return \Illuminate\Database\Eloquent\Model|null
 */
public function resolveRouteBinding($value, $field = null)
{
    return $this->where('name', $value)->firstOrFail();
}
```

Si una ruta utiliza [alcance de enlace implícito](#implicit-model-binding-scoping), se utilizará el método `resolveChildRouteBinding` para resolver el enlace secundario del modelo principal:

```php
/**
 * Retrieve the child model for a bound value.
 *
 * @param  string  $childType
 * @param  mixed  $value
 * @param  string|null  $field
 * @return \Illuminate\Database\Eloquent\Model|null
 */
public function resolveChildRouteBinding($childType, $value, $field)
{
    return parent::resolveChildRouteBinding($childType, $value, $field);
}
```

<a id="fallback-routes"></a>
## Rutas alternativas

Usando el método `Route::fallback`, puede definir una ruta que se ejecutará cuando ninguna otra ruta coincida con la solicitud entrante. Normalmente, las solicitudes no controladas mostrarán automáticamente una página "404" a través del controlador de excepciones de su aplicación. Sin embargo, dado que normalmente definiría la ruta `fallback` dentro de su archivo `routes/web.php`, todo el middleware del grupo de middleware `web` se aplicará a la ruta. Eres libre de agregar middleware adicional a esta ruta según sea necesario:

```php
Route::fallback(function () {
    // ...
});
```

<a id="rate-limiting"></a>
## Limitación de velocidad

<a id="defining-rate-limiters"></a>
### Definición de limitadores de velocidad

Laravel incluye servicios de limitación de velocidad potentes y personalizables que puede utilizar para restringir la cantidad de tráfico para una ruta o grupo de rutas determinado. Para comenzar, debe definir configuraciones del limitador de velocidad que satisfagan las necesidades de su aplicación.

Los limitadores de velocidad se pueden definir dentro del método `boot` de la clase `App\Providers\AppServiceProvider` de su aplicación:

```php
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    RateLimiter::for('api', function (Request $request) {
        return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
    });
}
```

Los limitadores de velocidad se definen utilizando el método `for` de la fachada `RateLimiter`. El método `for` acepta un nombre de limitador de velocidad y una función anónima que devuelve la configuración de límite que debe aplicarse a las rutas asignadas al limitador de velocidad. La configuración de límites son instancias de la clase `Illuminate\Cache\RateLimiting\Limit`. Esta clase contiene métodos "constructores" útiles para que pueda definir rápidamente su límite. El nombre del limitador de velocidad puede ser cualquier cadena que desee:

```php
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    RateLimiter::for('global', function (Request $request) {
        return Limit::perMinute(1000);
    });
}
```

Si la solicitud entrante excede el límite de velocidad especificado, Laravel devolverá automáticamente una respuesta con un código de estado HTTP 429. Si desea definir su propia respuesta que debe devolverse mediante un límite de tasa, puede utilizar el método `response`:

```php
RateLimiter::for('global', function (Request $request) {
    return Limit::perMinute(1000)->response(function (Request $request, array $headers) {
        return response('Custom response...', 429, $headers);
    });
});
```

Dado que las devoluciones de llamada del limitador de velocidad reciben la instancia de solicitud HTTP entrante, puede crear el límite de velocidad apropiado dinámicamente en función de la solicitud entrante o del usuario autenticado:

```php
RateLimiter::for('uploads', function (Request $request) {
    return $request->user()?->vipCustomer()
        ? Limit::none()
        : Limit::perHour(10);
});
```

<a id="segmenting-rate-limits"></a>
#### Límites de tasa de segmentación

A veces es posible que desees segmentar los límites de tarifas por algún valor arbitrario. Por ejemplo, es posible que desee permitir que los usuarios accedan a una ruta determinada 100 veces por minuto por dirección IP. Para lograr esto, puede utilizar el método `by` al crear su límite de tasa:

```php
RateLimiter::for('uploads', function (Request $request) {
    return $request->user()->vipCustomer()
        ? Limit::none()
        : Limit::perMinute(100)->by($request->ip());
});
```

Para ilustrar esta característica con otro ejemplo, podemos limitar el acceso a la ruta a 100 veces por minuto por ID de usuario autenticado o 10 veces por minuto por dirección IP para invitados:

```php
RateLimiter::for('uploads', function (Request $request) {
    return $request->user()
        ? Limit::perMinute(100)->by($request->user()->id)
        : Limit::perMinute(10)->by($request->ip());
});
```

<a id="multiple-rate-limits"></a>
#### Límites de tarifas múltiples

Si es necesario, puede devolver una serie de límites de velocidad para una configuración de limitador de velocidad determinada. Cada límite de tarifa se evaluará para la ruta según el orden en que se colocan dentro de la matriz:

```php
RateLimiter::for('login', function (Request $request) {
    return [
        Limit::perMinute(500),
        Limit::perMinute(3)->by($request->input('email')),
    ];
});
```

Si asigna varios límites de tasa segmentados por valores `by` idénticos, debe asegurarse de que cada valor `by` sea único. La forma más sencilla de lograr esto es anteponer los valores dados al método `by`:

```php
RateLimiter::for('uploads', function (Request $request) {
    return [
        Limit::perMinute(10)->by('minute:'.$request->user()->id),
        Limit::perDay(1000)->by('day:'.$request->user()->id),
    ];
});
```

<a id="response-base-rate-limiting"></a>
#### Limitación de tasa basada en respuestas

Además de limitar la velocidad de las solicitudes entrantes, Laravel le permite limitar la velocidad en función de la respuesta utilizando el método `after`. Esto es útil cuando solo desea contar ciertas respuestas para el límite de tasa, como errores de validación, respuestas 404 u otros códigos de estado HTTP específicos.

El método `after` acepta una función anónima que recibe la respuesta y debe devolver `true` si la respuesta debe contarse para el límite de tasa, o `false` si debe ignorarse. Esto es particularmente útil para prevenir ataques de enumeración al limitar las respuestas 404 consecutivas o permitir a los usuarios reintentar solicitudes que fallan en la validación sin agotar su límite de velocidad en un punto final que solo debería limitar las operaciones exitosas:

```php
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

RateLimiter::for('resource-not-found', function (Request $request) {
    return Limit::perMinute(10)
        ->by($request->user()?->id ?: $request->ip())
        ->after(function (Response $response) {
            // Only count 404 responses toward the rate limit to prevent enumeration...
            return $response->status() === 404;
        });
});
```

<a id="attaching-rate-limiters-to-routes"></a>
### Adjuntar limitadores de velocidad a las rutas

Se pueden adjuntar limitadores de velocidad a rutas o grupos de rutas utilizando `throttle` [middleware](../middleware/). El middleware del acelerador acepta el nombre del limitador de velocidad que desea asignar a la ruta:

```php
Route::middleware(['throttle:uploads'])->group(function () {
    Route::post('/audio', function () {
        // ...
    });

    Route::post('/video', function () {
        // ...
    });
});
```

<a id="throttling-with-redis"></a>
#### Limitación con Redis

De forma predeterminada, el middleware `throttle` está asignado a la clase `Illuminate\Routing\Middleware\ThrottleRequests`. Sin embargo, si está utilizando Redis como controlador de caché de su aplicación, es posible que desee indicarle a Laravel que use Redis para administrar la limitación de velocidad. Para hacerlo, debe utilizar el método `throttleWithRedis` en el archivo `bootstrap/app.php` de su aplicación. Este método asigna el middleware `throttle` a la clase de middleware `Illuminate\Routing\Middleware\ThrottleRequestsWithRedis`:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->throttleWithRedis();
    // ...
})
```

<a id="form-method-spoofing"></a>
## Falsificación del método del formulario

Los formularios HTML no admiten acciones `PUT`, `PATCH` o `DELETE`. Por lo tanto, al definir rutas `PUT`, `PATCH` o `DELETE` que se llaman desde un formulario HTML, deberá agregar un campo `_method` oculto al formulario. El valor enviado con el campo `_method` se utilizará como método de solicitud HTTP:

```blade
<form action="/example" method="POST">
    <input type="hidden" name="_method" value="PUT">
    <input type="hidden" name="_token" value="{{ csrf_token() }}">
</form>
```

Para mayor comodidad, puede utilizar la directiva `@method` [Blade](../blade/) para generar el campo de entrada `_method`:

```blade
<form action="/example" method="POST">
    @method('PUT')
    @csrf
</form>
```

<a id="accessing-the-current-route"></a>
## Accediendo a la ruta actual

Puede utilizar los métodos `current`, `currentRouteName` y `currentRouteAction` en la fachada `Route` para acceder a información sobre la ruta que maneja la solicitud entrante:

```php
use Illuminate\Support\Facades\Route;

$route = Route::current(); // Illuminate\Routing\Route
$name = Route::currentRouteName(); // string
$action = Route::currentRouteAction(); // string
```

Puede consultar la documentación de la API tanto para la [clase subyacente de la fachada de ruta](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Routing/Router.html) como para la [instancia de ruta](https://api.laravel.comhttps://laravel.com/docs/13.x/Illuminate/Routing/Route.html) para revisar todos los métodos que están disponibles en el enrutador y las clases de ruta.

<a id="cors"></a>
## Intercambio de recursos entre orígenes (CORS)

Laravel puede responder automáticamente a las solicitudes HTTP CORS `OPTIONS` con valores que usted configure. Las solicitudes `OPTIONS` serán manejadas automáticamente por el `HandleCors` [middleware](../middleware/) que se incluye automáticamente en la pila de middleware global de su aplicación.

A veces, es posible que necesite personalizar los valores de configuración de CORS para su aplicación. Puede hacerlo publicando el archivo de configuración `cors` usando el comando `config:publish` Artisan:

```shell
php artisan config:publish cors
```

Este comando colocará un archivo de configuración `cors.php` dentro del directorio `config` de su aplicación.

> **Nota:**
> Para obtener más información sobre CORS y los encabezados CORS, consulte la [documentación web de MDN en CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#The_HTTP_response_headers).

<a id="route-caching"></a>
## Almacenamiento en caché de ruta

Al implementar su aplicación en producción, debe aprovechar el caché de ruta de Laravel. El uso del caché de rutas reducirá drásticamente la cantidad de tiempo que lleva registrar todas las rutas de su aplicación. Para generar un caché de ruta, ejecute el comando `route:cache` Artisan:

```shell
php artisan route:cache
```

Después de ejecutar este comando, su archivo de rutas en caché se cargará en cada solicitud. Recuerde, si agrega rutas nuevas, deberá generar un caché de rutas nuevo. Debido a esto, solo debes ejecutar el comando `route:cache` durante la implementación de tu proyecto.

Puede utilizar el comando `route:clear` para borrar el caché de ruta:

```shell
php artisan route:clear
```
