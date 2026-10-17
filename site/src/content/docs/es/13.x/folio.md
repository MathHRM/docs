---
title: "Folio Laravel"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Instalación](#installation)
    - [Rutas de página / URIs](#page-paths-uris)
    - [Enrutamiento de subdominio](#subdomain-routing)
- [Creando Rutas](#creating-routes)
    - [Rutas anidadas](#nested-routes)
    - [Índice de rutas](#index-routes)
- [Parámetros de ruta](#route-parameters)
- [Enlace de modelo de ruta](#route-model-binding)
    - [Modelos eliminados temporalmente](#soft-deleted-models)
- [Ganchos de renderizado](#render-hooks)
- [Rutas nombradas](#named-routes)
- [Middleware](#middleware)
- [Almacenamiento en caché de ruta](#route-caching)

<a id="introduction"></a>
## Introducción

[Laravel Folio](https://github.com/laravel/folio) es un potente enrutador basado en páginas diseñado para simplificar el enrutamiento en aplicaciones Laravel. Con Laravel Folio, generar una ruta se vuelve tan sencillo como crear una plantilla Blade dentro del directorio `resources/views/pages` de su aplicación.

Por ejemplo, para crear una página a la que se pueda acceder desde la URL `/greeting`, simplemente cree un archivo `greeting.blade.php` en el directorio `resources/views/pages` de su aplicación:

```blade
<div>
    Hello World
</div>
```

<a id="installation"></a>
## Instalación

Para comenzar, instale Folio en su proyecto usando el administrador de paquetes de Composer:

```shell
composer require laravel/folio
```

Después de instalar Folio, puede ejecutar el comando `folio:install` Artisan, que instalará el proveedor de servicios de Folio en su aplicación. Este proveedor de servicios registra el directorio donde Folio buscará rutas/páginas:

```shell
php artisan folio:install
```

<a id="page-paths-uris"></a>
### Rutas de página/URI

De forma predeterminada, Folio ofrece páginas desde el directorio `resources/views/pages` de su aplicación, pero puede personalizar estos directorios en el método `boot` de su proveedor de servicios Folio.

Por ejemplo, a veces puede resultar conveniente especificar varias rutas de Folio en la misma aplicación Laravel. Es posible que desee tener un directorio separado de páginas Folio para el área "admin" de su aplicación, mientras usa otro directorio para el resto de las páginas de su aplicación.

Puede lograr esto utilizando los métodos `Folio::path` y `Folio::uri`. El método `path` registra un directorio que Folio escaneará en busca de páginas al enrutar solicitudes HTTP entrantes, mientras que el método `uri` especifica el "URI base" para ese directorio de páginas:

```php
use Laravel\Folio\Folio;

Folio::path(resource_path('views/pages/guest'))->uri('/');

Folio::path(resource_path('views/pages/admin'))
    ->uri('/admin')
    ->middleware([
        '*' => [
            'auth',
            'verified',

            // ...
        ],
    ]);
```

<a id="subdomain-routing"></a>
### Enrutamiento de subdominio

También puede enrutar a páginas según el subdominio de la solicitud entrante. Por ejemplo, es posible que desee enrutar solicitudes de `admin.example.com` a un directorio de páginas diferente al del resto de sus páginas Folio. Puede lograr esto invocando el método `domain` después de invocar el método `Folio::path`:

```php
use Laravel\Folio\Folio;

Folio::domain('admin.example.com')
    ->path(resource_path('views/pages/admin'));
```

El método `domain` también le permite capturar partes del dominio o subdominio como parámetros. Estos parámetros se inyectarán en la plantilla de su página:

```php
use Laravel\Folio\Folio;

Folio::domain('{account}.example.com')
    ->path(resource_path('views/pages/admin'));
```

<a id="creating-routes"></a>
## Creando rutas

Puede crear una ruta Folio colocando una plantilla Blade en cualquiera de sus directorios montados en Folio. De forma predeterminada, Folio monta el directorio `resources/views/pages`, pero puede personalizar estos directorios en el método `boot` de su proveedor de servicios Folio.

Una vez que se haya colocado una plantilla Blade en un directorio montado en Folio, podrá acceder a ella inmediatamente a través de su navegador. Por ejemplo, se puede acceder a una página ubicada en `pages/schedule.blade.php` en su navegador en `http://example.com/schedule`.

Para ver rápidamente una lista de todas sus páginas/rutas de Folio, puede invocar el comando `folio:list` Artisan:

```shell
php artisan folio:list
```

<a id="nested-routes"></a>
### Rutas anidadas

Puede crear una ruta anidada creando uno o más directorios dentro de uno de los directorios de Folio. Por ejemplo, para crear una página a la que se pueda acceder a través de `/user/profile`, cree una plantilla `profile.blade.php` dentro del directorio `pages/user`:

```shell
php artisan folio:page user/profile

# pages/user/profile.blade.php → /user/profile
```

<a id="index-routes"></a>
### Rutas de índice

A veces, es posible que desee convertir una página determinada en el "índice" de un directorio. Al colocar una plantilla `index.blade.php` dentro de un directorio Folio, cualquier solicitud a la raíz de ese directorio se enrutará a esa página:

```shell
php artisan folio:page index
# pages/index.blade.php → /

php artisan folio:page users/index
# pages/users/index.blade.php → /users
```

<a id="route-parameters"></a>
## Parámetros de ruta

A menudo, necesitarás insertar segmentos de la URL de la solicitud entrante en tu página para poder interactuar con ellos. Por ejemplo, es posible que necesite acceder al "ID" del usuario cuyo perfil se muestra. Para lograr esto, puede encapsular un segmento del nombre del archivo de la página entre corchetes:

```shell
php artisan folio:page "users/[id]"

# pages/users/[id].blade.php → /users/1
```

Se puede acceder a los segmentos capturados como variables dentro de su plantilla Blade:

```html
<div>
    User {{ $id }}
</div>
```

Para capturar múltiples segmentos, puede prefijar el segmento encapsulado con tres puntos `...`:

```shell
php artisan folio:page "users/[...ids]"

# pages/users/[...ids].blade.php → /users/1/2/3
```

Al capturar varios segmentos, los segmentos capturados se inyectarán en la página como una matriz:

```html
<ul>
    @foreach ($ids as $id)
        <li>User {{ $id }}</li>
    @endforeach
</ul>
```

<a id="route-model-binding"></a>
## Enlace del modelo de ruta

Si un segmento comodín del nombre de archivo de la plantilla de su página corresponde a uno de los modelos Eloquent de su aplicación, Folio aprovechará automáticamente las capacidades de enlace del modelo de ruta de Laravel e intentará inyectar la instancia del modelo resuelto en su página:

```shell
php artisan folio:page "users/[User]"

# pages/users/[User].blade.php → /users/1
```

Se puede acceder a los modelos capturados como variables dentro de su plantilla Blade. El nombre de la variable del modelo se convertirá a "camel case":

```html
<div>
    User {{ $user->id }}
</div>
```

#### Personalización de la clave

A veces es posible que desees resolver modelos enlazados de Eloquent utilizando una columna que no sea `id`. Para hacerlo, puede especificar la columna en el nombre del archivo de la página. Por ejemplo, una página con el nombre de archivo `[Post:slug].blade.php` intentará resolver el modelo enlazado a través de la columna `slug` en lugar de la columna `id`.

En Windows, debes usar `-` para separar el nombre del modelo de la clave: `[Post-slug].blade.php`.

#### Ubicación del modelo

De forma predeterminada, Folio buscará su modelo dentro del directorio `app/Models` de su aplicación. Sin embargo, si es necesario, puede especificar el nombre de clase de modelo completo en el nombre de archivo de su plantilla:

```shell
php artisan folio:page "users/[.App.Models.User]"

# pages/users/[.App.Models.User].blade.php → /users/1
```

<a id="soft-deleted-models"></a>
### Modelos eliminados temporalmente

De forma predeterminada, los modelos que se han eliminado temporalmente no se recuperan al resolver enlaces de modelos implícitos. Sin embargo, si lo desea, puede indicarle a Folio que recupere los modelos eliminados temporalmente invocando la función `withTrashed` dentro de la plantilla de la página:

```php
<?php

use function Laravel\Folio\{withTrashed};

withTrashed();

?>

<div>
    User {{ $user->id }}
</div>
```

<a id="render-hooks"></a>
## Ganchos de renderizado

De forma predeterminada, Folio devolverá el contenido de la plantilla Blade de la página como respuesta a la solicitud entrante. Sin embargo, puede personalizar la respuesta invocando la función `render` dentro de la plantilla de la página.

La función `render` acepta una función anónima que recibirá la instancia `View` procesada por Folio, lo que le permitirá agregar datos adicionales a la vista o personalizar la respuesta completa. Además de recibir la instancia `View`, también se proporcionarán parámetros de ruta adicionales o enlaces de modelo a la función anónima `render`:

```php
<?php

use App\Models\Post;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

use function Laravel\Folio\render;

render(function (View $view, Post $post) {
    if (! Auth::user()->can('view', $post)) {
        return response('Unauthorized', 403);
    }

    return $view->with('photos', $post->author->photos);
}); ?>

<div>
    {{ $post->content }}
</div>

<div>
    This author has also taken {{ count($photos) }} photos.
</div>
```

<a id="named-routes"></a>
## Rutas con nombre

Puede especificar un nombre para la ruta de una página determinada utilizando la función `name`:

```php
<?php

use function Laravel\Folio\name;

name('users.index');
```

Al igual que las rutas con nombre de Laravel, puede usar la función `route` para generar URL a páginas Folio a las que se les ha asignado un nombre:

```blade
<a href="{{ route('users.index') }}">
    All Users
</a>
```

Si la página tiene parámetros, simplemente puede pasar sus valores a la función `route`:

```php
route('users.show', ['user' => $user]);
```

<a id="middleware"></a>
## Middleware

Puede aplicar middleware a una página específica invocando la función `middleware` dentro de la plantilla de la página:

```php
<?php

use function Laravel\Folio\{middleware};

middleware(['auth', 'verified']);

?>

<div>
    Dashboard
</div>
```

O, para asignar middleware a un grupo de páginas, puede encadenar el método `middleware` después de invocar el método `Folio::path`.

Para especificar a qué páginas se debe aplicar el middleware, se puede codificar la matriz de middleware utilizando los patrones de URL correspondientes de las páginas a las que se debe aplicar. El carácter `*` se puede utilizar como carácter comodín:

```php
use Laravel\Folio\Folio;

Folio::path(resource_path('views/pages'))->middleware([
    'admin/*' => [
        'auth',
        'verified',

        // ...
    ],
]);
```

Puede incluir funciones anónimas en la matriz de middleware para definir middleware anónimo en línea:

```php
use Closure;
use Illuminate\Http\Request;
use Laravel\Folio\Folio;

Folio::path(resource_path('views/pages'))->middleware([
    'admin/*' => [
        'auth',
        'verified',

        function (Request $request, Closure $next) {
            // ...

            return $next($request);
        },
    ],
]);
```

<a id="route-caching"></a>
## Almacenamiento en caché de ruta

Al usar Folio, siempre debes aprovechar las [capacidades de almacenamiento en caché de rutas de Laravel](../routing/#route-caching). Folio escucha el comando `route:cache` Artisan para garantizar que las definiciones de páginas de Folio y los nombres de rutas se almacenen en caché correctamente para lograr el máximo rendimiento.
