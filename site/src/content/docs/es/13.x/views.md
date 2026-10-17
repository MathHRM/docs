---
title: "Vistas"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
    - [Escribir vistas en React/Svelte/Vue](#writing-views-in-react-svelte-or-vue)
- [Creación y renderizado de vistas](#creating-and-rendering-views)
    - [Directorios de vistas anidadas](#nested-view-directories)
    - [Creando la primera vista disponible](#creating-the-first-available-view)
    - [Determinar si existe una vista](#determining-if-a-view-exists)
- [Pasar datos a vistas](#passing-data-to-views)
    - [Compartir datos con todas las vistas](#sharing-data-with-all-views)
- [Ver Compositores](#view-composers)
    - [Ver creadores](#view-creators)
- [Optimización de vistas](#optimizing-views)

<a id="introduction"></a>
## Introducción

Por supuesto, no es práctico devolver cadenas completas de documentos HTML directamente desde sus rutas y controladores. Afortunadamente, las vistas proporcionan una manera conveniente de colocar todo nuestro HTML en archivos separados.

Las vistas separan la lógica de su controlador/aplicación de su lógica de presentación y se almacenan en el directorio `resources/views`. Cuando se usa Laravel, las plantillas de vista generalmente se escriben usando el [lenguaje de plantillas Blade](../blade/). Una vista simple podría verse así:

```blade
<!-- View stored in resources/views/greeting.blade.php -->

<html>
    <body>
        <h1>Hello, {{ $name }}</h1>
    </body>
</html>
```

Dado que esta vista está almacenada en `resources/views/greeting.blade.php`, podemos devolverla usando el asistente global `view` de esta manera:

```php
Route::get('/', function () {
    return view('greeting', ['name' => 'James']);
});
```

> **Nota:**
> ¿Busca más información sobre cómo escribir plantillas Blade? Consulte la [documentación de Blade](../blade/) completa] para comenzar.

<a id="writing-views-in-react-svelte-or-vue"></a>
### Escribir vistas en React/Svelte/Vue

En lugar de escribir sus plantillas de interfaz en PHP a través de Blade, muchos desarrolladores han comenzado a preferir escribir sus plantillas usando React, Svelte o Vue. Laravel hace que esto sea sencillo gracias a [Inertia](https://inertiajs.com/), una biblioteca que hace que sea muy fácil vincular su interfaz React/Svelte/Vue a su backend Laravel sin las complejidades típicas de construir un SPA.

Nuestros [kits de inicio de aplicaciones React, Svelte y Vue](../starter-kits/) le brindan un excelente punto de partida para su próxima aplicación Laravel impulsada por Inertia.

<a id="creating-and-rendering-views"></a>
## Creación y renderizado de vistas

Puede crear una vista colocando un archivo con la extensión `.blade.php` en el directorio `resources/views` de su aplicación o usando el comando `make:view` Artisan:

```shell
php artisan make:view greeting
```

La extensión `.blade.php` informa al marco que el archivo contiene una [plantilla Blade](../blade/). Las plantillas Blade contienen HTML y directivas Blade que le permiten repetir valores fácilmente, crear declaraciones "si", iterar sobre datos y más.

Una vez que haya creado una vista, puede devolverla desde una de las rutas o controladores de su aplicación utilizando el asistente global `view`:

```php
Route::get('/', function () {
    return view('greeting', ['name' => 'James']);
});
```

También se pueden devolver vistas utilizando la fachada `View`:

```php
use Illuminate\Support\Facades\View;

return View::make('greeting', ['name' => 'James']);
```

Como puede ver, el primer argumento pasado al asistente `view` corresponde al nombre del archivo de vista en el directorio `resources/views`. El segundo argumento es una serie de datos que deberían estar disponibles para la vista. En este caso, estamos pasando la variable `name`, que se muestra en la vista usando [sintaxis Blade](../blade/).

<a id="nested-view-directories"></a>
### Directorios de vistas anidadas

Las vistas también pueden anidarse dentro de subdirectorios del directorio `resources/views`. Se puede utilizar la notación de "puntos" para hacer referencia a vistas anidadas. Por ejemplo, si su vista está almacenada en `resources/views/admin/profile.blade.php`, puede devolverla desde una de las rutas/controladores de su aplicación de esta manera:

```php
return view('admin.profile', $data);
```

> **Advertencia:**
> Ver nombres de directorios no debe contener el carácter `.`.

<a id="creating-the-first-available-view"></a>
### Creando la primera vista disponible

Usando el método `first` de la fachada `View`, puede crear la primera vista que existe en una matriz de vistas determinada. Esto puede resultar útil si su aplicación o paquete permite personalizar o sobrescribir las vistas:

```php
use Illuminate\Support\Facades\View;

return View::first(['custom.admin', 'admin'], $data);
```

<a id="determining-if-a-view-exists"></a>
### Determinar si existe una vista

Si necesita determinar si existe una vista, puede utilizar la fachada `View`. El método `exists` devolverá `true` si la vista existe:

```php
use Illuminate\Support\Facades\View;

if (View::exists('admin.profile')) {
    // ...
}
```

<a id="passing-data-to-views"></a>
## Pasar datos a vistas

Como vio en los ejemplos anteriores, puede pasar una serie de datos a las vistas para que esos datos estén disponibles para la vista:

```php
return view('greetings', ['name' => 'Victoria']);
```

Al pasar información de esta manera, los datos deben ser una matriz con pares clave/valor. Después de proporcionar datos a una vista, puede acceder a cada valor dentro de su vista utilizando las claves de datos, como `<?php echo $name; ?>`.

Como alternativa a pasar una matriz completa de datos a la función auxiliar `view`, puede usar el método `with` para agregar datos individuales a la vista. El método `with` devuelve una instancia del objeto de vista para que pueda continuar encadenando métodos antes de devolver la vista:

```php
return view('greeting')
    ->with('name', 'Victoria')
    ->with('occupation', 'Astronaut');
```

<a id="sharing-data-with-all-views"></a>
### Compartir datos con todas las vistas

En ocasiones, es posible que necesite compartir datos con todas las vistas que representa su aplicación. Puede hacerlo utilizando el método `share` de la fachada `View`. Normalmente, debe realizar llamadas al método `share` dentro del método `boot` de un proveedor de servicios. Puede agregarlos a la clase `App\Providers\AppServiceProvider` o generar un proveedor de servicios independiente para alojarlos:

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Registrar los servicios de la aplicación.
     */
    public function register(): void
    {
        // ...
    }

    /**
     * Inicializar los servicios de la aplicación.
     */
    public function boot(): void
    {
        View::share('key', 'value');
    }
}
```

<a id="view-composers"></a>
## Ver compositores

Los compositores de vistas son devoluciones de llamada o métodos de clase que se llaman cuando se representa una vista. Si tiene datos que desea vincular a una vista cada vez que se representa esa vista, un compositor de vistas puede ayudarlo a organizar esa lógica en una única ubicación. Los compositores de vistas pueden resultar particularmente útiles si múltiples rutas o controladores devuelven la misma vista dentro de su aplicación y siempre necesita un dato particular.

Normalmente, los compositores de vistas se registrarán dentro de uno de los [proveedores de servicios](../providers/). En este ejemplo, asumiremos que el `App\Providers\AppServiceProvider` albergará esta lógica.

Usaremos el método `composer` de la fachada `View` para registrar el compositor de vistas. Laravel no incluye un directorio predeterminado para los compositores de vistas basados ​​en clases, por lo que eres libre de organizarlos como desees. Por ejemplo, podría crear un directorio `app/View/Composers` para albergar todos los compositores de vistas de su aplicación:

```php
<?php

namespace App\Providers;

use App\View\Composers\ProfileComposer;
use Illuminate\Support\Facades;
use Illuminate\Support\ServiceProvider;
use Illuminate\View\View;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Registrar los servicios de la aplicación.
     */
    public function register(): void
    {
        // ...
    }

    /**
     * Inicializar los servicios de la aplicación.
     */
    public function boot(): void
    {
        // Using class-based composers...
        Facades\View::composer('profile', ProfileComposer::class);

        // Using closure-based composers...
        Facades\View::composer('welcome', function (View $view) {
            // ...
        });

        Facades\View::composer('dashboard', function (View $view) {
            // ...
        });
    }
}
```

Ahora que hemos registrado el compositor, el método `compose` de la clase `App\View\Composers\ProfileComposer` se ejecutará cada vez que se renderice la vista `profile`. Echemos un vistazo a un ejemplo de la clase de compositor:

```php
<?php

namespace App\View\Composers;

use App\Repositories\UserRepository;
use Illuminate\View\View;

class ProfileComposer
{
    /**
     * Crear un nuevo composer de perfil.
     */
    public function __construct(
        protected UserRepository $users,
    ) {}

    /**
     * Bind data to the view.
     */
    public function compose(View $view): void
    {
        $view->with('count', $this->users->count());
    }
}
```

Como puede ver, todos los compositores de vistas se resuelven a través del [contenedor de servicios](../container/), por lo que puede escribir sugerencias sobre cualquier dependencia que necesite dentro del constructor de un compositor.

<a id="attaching-a-composer-to-multiple-views"></a>
#### Adjuntar un compositor a varias vistas

Puede adjuntar un compositor de vistas a varias vistas a la vez pasando una serie de vistas como primer argumento del método `composer`:

```php
use App\Views\Composers\MultiComposer;
use Illuminate\Support\Facades\View;

View::composer(
    ['profile', 'dashboard'],
    MultiComposer::class
);
```

El método `composer` también acepta el carácter `*` como comodín, lo que le permite adjuntar un compositor a todas las vistas:

```php
use Illuminate\Support\Facades;
use Illuminate\View\View;

Facades\View::composer('*', function (View $view) {
    // ...
});
```

<a id="view-creators"></a>
### Ver creadores

Los "creadores" de vistas son muy similares a los compositores de vistas; sin embargo, se ejecutan inmediatamente después de crear una instancia de la vista en lugar de esperar hasta que la vista esté a punto de renderizarse. Para registrar un creador de vistas, utilice el método `creator`:

```php
use App\View\Creators\ProfileCreator;
use Illuminate\Support\Facades\View;

View::creator('profile', ProfileCreator::class);
```

<a id="optimizing-views"></a>
## Optimización de vistas

De forma predeterminada, las vistas de la plantilla Blade se compilan según demanda. Cuando se ejecuta una solicitud que representa una vista, Laravel determinará si existe una versión compilada de la vista. Si el archivo existe, Laravel determinará si la vista no compilada se ha modificado más recientemente que la vista compilada. Si la vista compilada no existe o la vista no compilada ha sido modificada, Laravel volverá a compilar la vista.

La compilación de vistas durante la solicitud puede tener un pequeño impacto negativo en el rendimiento, por lo que Laravel proporciona el comando `view:cache` Artisan para precompilar todas las vistas utilizadas por su aplicación. Para obtener un mayor rendimiento, es posible que desee ejecutar este comando como parte de su proceso de implementación:

```shell
php artisan view:cache
```

Puede utilizar el comando `view:clear` para borrar la vista caché:

```shell
php artisan view:clear
```
