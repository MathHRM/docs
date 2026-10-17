---
title: "Base de datos: paginación"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Uso básico](#basic-usage)
    - [Paginación de resultados del generador de consultas](#paginating-query-builder-results)
    - [Paginando resultados elocuentes](#paginating-eloquent-results)
    - [Paginación del cursor](#cursor-pagination)
    - [Creación manual de un paginador](#manually-creating-a-paginator)
    - [Personalizar URL de paginación](#customizing-pagination-urls)
- [Mostrando resultados de paginación](#displaying-pagination-results)
    - [Ajustando la ventana de enlace de paginación](#adjusting-the-pagination-link-window)
    - [Conversión de resultados a JSON](#converting-results-to-json)
- [Personalizar la vista de paginación](#customizing-the-pagination-view)
    - [Usando Bootstrap](#using-bootstrap)
- [Métodos de instancia de Paginator y lengthAwarePaginator](#paginator-instance-methods)
- [Métodos de instancia del paginador de cursor](#cursor-paginator-instance-methods)

<a id="introduction"></a>
## Introducción

En otros marcos, la paginación puede resultar muy dolorosa. Esperamos que el enfoque de la paginación de Laravel sea un soplo de aire fresco. El paginador de Laravel está integrado con [query builder](../queries/) y [Eloquent ORM](../eloquent/) y proporciona una paginación conveniente y fácil de usar de registros de bases de datos sin configuración.

De forma predeterminada, el HTML generado por el paginador es compatible con el [marco CSS Tailwind](https://tailwindcss.com/); sin embargo, la compatibilidad con la paginación Bootstrap también está disponible.

<a id="tailwind"></a>
#### Viento de cola

Si está utilizando las vistas de paginación predeterminadas de Tailwind de Laravel con Tailwind 4.x, el archivo `resources/css/app.css` de su aplicación ya estará configurado correctamente para las vistas de paginación de `@source` Laravel:

```css
@import 'tailwindcss';

@source '../../vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php';
```

<a id="basic-usage"></a>
## Uso básico

<a id="paginating-query-builder-results"></a>
### Paginación de los resultados del Generador de consultas

Hay varias formas de paginar elementos. La más sencilla es utilizar el método `paginate` en el [generador de consultas](../queries/) o una [consulta Eloquent](../eloquent/). El método `paginate` se encarga automáticamente de establecer el "límite" y el "desplazamiento" de la consulta en función de la página actual que está viendo el usuario. De forma predeterminada, la página actual se detecta mediante el valor del argumento de cadena de consulta `page` en la solicitud HTTP. Laravel detecta automáticamente este valor y también se inserta automáticamente en los enlaces generados por el paginador.

En este ejemplo, el único argumento pasado al método `paginate` es la cantidad de elementos que desea que se muestren "por página". En este caso, especifiquemos que nos gustaría mostrar elementos `15` por página:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * Mostrar todos los usuarios de la aplicación.
     */
    public function index(): View
    {
        return view('user.index', [
            'users' => DB::table('users')->paginate(15)
        ]);
    }
}
```

<a id="simple-pagination"></a>
#### Paginación sencilla

El método `paginate` cuenta el número total de registros que coinciden con la consulta antes de recuperar los registros de la base de datos. Esto se hace para que el paginador sepa cuántas páginas de registros hay en total. Sin embargo, si no planea mostrar el número total de páginas en la interfaz de usuario de su aplicación, entonces la consulta del recuento de registros no es necesaria.

Por lo tanto, si solo necesita mostrar enlaces simples "Siguiente" y "Anterior" en la interfaz de usuario de su aplicación, puede usar el método `simplePaginate` para realizar una consulta única y eficiente:

```php
$users = DB::table('users')->simplePaginate(15);
```

<a id="paginating-eloquent-results"></a>
### Paginando resultados elocuentes

También puede paginar [consultas Eloquent](../eloquent/). En este ejemplo, paginaremos el modelo `App\Models\User` e indicaremos que planeamos mostrar 15 registros por página. Como puede ver, la sintaxis es casi idéntica a la paginación de los resultados del generador de consultas:

```php
use App\Models\User;

$users = User::paginate(15);
```

Por supuesto, puede llamar al método `paginate` después de establecer otras restricciones en la consulta, como las cláusulas `where`:

```php
$users = User::where('votes', '>', 100)->paginate(15);
```

También puedes utilizar el método `simplePaginate` al paginar modelos de Eloquent:

```php
$users = User::where('votes', '>', 100)->simplePaginate(15);
```

De manera similar, puede usar el método `cursorPaginate` para paginar con el cursor los modelos de Eloquent:

```php
$users = User::where('votes', '>', 100)->cursorPaginate(15);
```

<a id="multiple-paginator-instances-per-page"></a>
#### Varias instancias de paginador por página

A veces es posible que necesite representar dos paginadores separados en una sola pantalla representada por su aplicación. Sin embargo, si ambas instancias del paginador utilizan el parámetro de cadena de consulta `page` para almacenar la página actual, los dos paginadores entrarán en conflicto. Para resolver este conflicto, puede pasar el nombre del parámetro de cadena de consulta que desea utilizar para almacenar la página actual del paginador a través del tercer argumento proporcionado a los métodos `paginate`, `simplePaginate` y `cursorPaginate`:

```php
use App\Models\User;

$users = User::where('votes', '>', 100)->paginate(
    $perPage = 15, $columns = ['*'], $pageName = 'users'
);
```

<a id="cursor-pagination"></a>
### Paginación del cursor

Mientras que `paginate` y `simplePaginate` crean consultas usando la cláusula de "desplazamiento" de SQL, la paginación del cursor funciona mediante la construcción de cláusulas "dónde" que comparan los valores de las columnas ordenadas contenidas en la consulta, proporcionando el rendimiento de base de datos más eficiente disponible entre todos los métodos de paginación de Laravel. Este método de paginación es particularmente adecuado para grandes conjuntos de datos e interfaces de usuario de desplazamiento "infinito".

A diferencia de la paginación basada en desplazamiento, que incluye un número de página en la cadena de consulta de las URL generadas por el paginador, la paginación basada en cursor coloca una cadena de "cursor" en la cadena de consulta. El cursor es una cadena codificada que contiene la ubicación en la que debe comenzar a paginarse la siguiente consulta paginada y la dirección en la que debe paginarse:

```text
http://localhost/users?cursor=eyJpZCI6MTUsIl9wb2ludHNUb05leHRJdGVtcyI6dHJ1ZX0
```

Puede crear una instancia de paginador basado en cursor mediante el método `cursorPaginate` ofrecido por el generador de consultas. Este método devuelve una instancia de `Illuminate\Pagination\CursorPaginator`:

```php
$users = DB::table('users')->orderBy('id')->cursorPaginate(15);
```

Una vez que haya recuperado una instancia del paginador de cursor, puede [mostrar los resultados de la paginación](#displaying-pagination-results) como lo haría normalmente cuando utiliza los métodos `paginate` y `simplePaginate`. Para obtener más información sobre los métodos de instancia que ofrece el paginador de cursor, consulte la [documentación del método de instancia del paginador de cursor](#cursor-paginator-instance-methods).

> **Advertencia:**
> Su consulta debe contener una cláusula "ordenar por" para poder aprovechar la paginación del cursor. Además, las columnas por las que se ordena la consulta deben pertenecer a la tabla que estás paginando.

<a id="cursor-vs-offset-pagination"></a>
#### Cursor versus paginación desplazada

Para ilustrar las diferencias entre la paginación con desplazamiento y la paginación con cursor, examinemos algunos ejemplos de consultas SQL. Las dos consultas siguientes mostrarán la "segunda página" de resultados de una tabla `users` ordenada por `id`:

```sql
# Offset Pagination...
select * from users order by id asc limit 15 offset 15;

# Cursor Pagination...
select * from users where id > 15 order by id asc limit 15;
```

La consulta de paginación del cursor ofrece las siguientes ventajas sobre la paginación desplazada:

- Para conjuntos de datos grandes, la paginación del cursor ofrecerá un mejor rendimiento si las columnas "ordenar por" están indexadas. Esto se debe a que la cláusula de "compensación" analiza todos los datos coincidentes previamente.
- Para conjuntos de datos con escrituras frecuentes, la paginación compensada puede omitir registros o mostrar duplicados si los resultados se agregaron o eliminaron recientemente de la página que un usuario está viendo actualmente.

Sin embargo, la paginación del cursor tiene las siguientes limitaciones:

- Al igual que `simplePaginate`, la paginación del cursor solo se puede utilizar para mostrar enlaces "Siguiente" y "Anterior" y no admite la generación de enlaces con números de página.
- Requiere que el ordenamiento se base en al menos una columna única o una combinación de columnas que sean únicas. No se admiten columnas con valores `null`.
- Las expresiones de consulta en cláusulas "ordenar por" se admiten solo si tienen un alias y también se agregan a la cláusula "select".
- No se admiten expresiones de consulta con parámetros.

<a id="manually-creating-a-paginator"></a>
### Crear manualmente un paginador

A veces es posible que desees crear una instancia de paginación manualmente, pasándole una serie de elementos que ya tienes en la memoria. Puede hacerlo creando una instancia `Illuminate\Pagination\Paginator`, `Illuminate\Pagination\LengthAwarePaginator` o `Illuminate\Pagination\CursorPaginator`, según sus necesidades.

Las clases `Paginator` y `CursorPaginator` no necesitan conocer el número total de elementos en el conjunto de resultados; sin embargo, debido a esto, estas clases no tienen métodos para recuperar el índice de la última página. El `LengthAwarePaginator` acepta casi los mismos argumentos que el `Paginator`; sin embargo, requiere un recuento del número total de elementos en el conjunto de resultados.

En otras palabras, `Paginator` corresponde al método `simplePaginate` en el generador de consultas, `CursorPaginator` corresponde al método `cursorPaginate` y `LengthAwarePaginator` corresponde al método `paginate`.

> **Advertencia:**
> Al crear manualmente una instancia de paginador, debe "cortar" manualmente la matriz de resultados que pasa al paginador. Si no está seguro de cómo hacer esto, consulte la función PHP [array_slice](https://secure.php.net/manual/en/function.array-slice.php).

<a id="customizing-pagination-urls"></a>
### Personalización de las URL de paginación

De forma predeterminada, los enlaces generados por el paginador coincidirán con el URI de la solicitud actual. Sin embargo, el método `withPath` del paginador le permite personalizar el URI utilizado por el paginador al generar enlaces. Por ejemplo, si desea que el paginador genere enlaces como `http://example.com/admin/users?page=N`, debe pasar `/admin/users` al método `withPath`:

```php
use App\Models\User;

Route::get('/users', function () {
    $users = User::paginate(15);

    $users->withPath('/admin/users');

    // ...
});
```

<a id="appending-query-string-values"></a>
#### Agregar valores de cadena de consulta

Puede agregar enlaces de paginación a la cadena de consulta utilizando el método `appends`. Por ejemplo, para agregar `sort=votes` a cada enlace de paginación, debe realizar la siguiente llamada a `appends`:

```php
use App\Models\User;

Route::get('/users', function () {
    $users = User::paginate(15);

    $users->appends(['sort' => 'votes']);

    // ...
});
```

Puede utilizar el método `withQueryString` si desea agregar todos los valores de la cadena de consulta de la solicitud actual a los enlaces de paginación:

```php
$users = User::paginate(15)->withQueryString();
```

<a id="appending-hash-fragments"></a>
#### Agregar fragmentos de hash

Si necesita agregar un "fragmento hash" a las URL generadas por el paginador, puede usar el método `fragment`. Por ejemplo, para agregar `#users` al final de cada enlace de paginación, debe invocar el método `fragment` de esta manera:

```php
$users = User::paginate(15)->fragment('users');
```

<a id="displaying-pagination-results"></a>
## Mostrando resultados de paginación

Al llamar al método `paginate`, recibirá una instancia de `Illuminate\Pagination\LengthAwarePaginator`, mientras que al llamar al método `simplePaginate` se devuelve una instancia de `Illuminate\Pagination\Paginator`. Y, finalmente, llamar al método `cursorPaginate` devuelve una instancia de `Illuminate\Pagination\CursorPaginator`.

Estos objetos proporcionan varios métodos que describen el conjunto de resultados. Además de estos métodos auxiliares, las instancias del paginador son iteradores y pueden buclearse como una matriz. Entonces, una vez que haya recuperado los resultados, puede mostrarlos y representar los enlaces de la página usando [Blade](../blade/):

```blade
<div class="container">
    @foreach ($users as $user)
        {{ $user->name }}
    @endforeach
</div>

{{ $users->links() }}
```

El método `links` mostrará los enlaces al resto de las páginas del conjunto de resultados. Cada uno de estos enlaces ya contendrá la variable de cadena de consulta `page` adecuada. Recuerde, el HTML generado por el método `links` es compatible con el [marco CSS Tailwind](https://tailwindcss.com).

<a id="adjusting-the-pagination-link-window"></a>
### Ajustar la ventana del enlace de paginación

Cuando el paginador muestra enlaces de paginación, se muestra el número de página actual, así como los enlaces para las tres páginas anteriores y posteriores a la página actual. Usando el método `onEachSide`, puede controlar cuántos enlaces adicionales se muestran en cada lado de la página actual dentro de la ventana deslizante central de enlaces generada por el paginador:

```blade
{{ $users->onEachSide(5)->links() }}
```

<a id="converting-results-to-json"></a>
### Conversión de resultados a JSON

Las clases del paginador Laravel implementan el contrato de interfaz `Illuminate\Contracts\Support\Jsonable` y exponen el método `toJson`, por lo que es muy fácil convertir los resultados de la paginación a JSON. También puedes convertir una instancia de paginador a JSON devolviéndola desde una ruta o acción del controlador:

```php
use App\Models\User;

Route::get('/users', function () {
    return User::paginate();
});
```

El JSON del paginador incluirá metainformación como `total`, `current_page`, `last_page` y más. Los registros de resultados están disponibles a través de la clave `data` en la matriz JSON. A continuación se muestra un ejemplo del JSON creado al devolver una instancia de paginador desde una ruta:

```json
{
   "total": 50,
   "per_page": 15,
   "current_page": 1,
   "last_page": 4,
   "first_page_url": "http://laravel.app?page=1",
   "last_page_url": "http://laravel.app?page=4",
   "next_page_url": "http://laravel.app?page=2",
   "prev_page_url": null,
   "path": "http://laravel.app",
   "from": 1,
   "to": 15,
   "data":[
        {
            // Record...
        },
        {
            // Record...
        }
   ]
}
```

<a id="customizing-the-pagination-view"></a>
## Personalizando la vista de paginación

De forma predeterminada, las vistas representadas para mostrar los enlaces de paginación son compatibles con el marco [Tailwind CSS](https://tailwindcss.com). Sin embargo, si no utiliza Tailwind, puede definir sus propias vistas para representar estos enlaces. Al llamar al método `links` en una instancia del paginador, puede pasar el nombre de la vista como primer argumento del método:

```blade
{{ $paginator->links('view.name') }}

<!-- Passing additional data to the view... -->
{{ $paginator->links('view.name', ['foo' => 'bar']) }}
```

Sin embargo, la forma más sencilla de personalizar las vistas de paginación es exportarlas a su directorio `resources/views/vendor` usando el comando `vendor:publish`:

```shell
php artisan vendor:publish --tag=laravel-pagination
```

Este comando colocará las vistas en el directorio `resources/views/vendor/pagination` de su aplicación. El archivo `tailwind.blade.php` dentro de este directorio corresponde a la vista de paginación predeterminada. Puede editar este archivo para modificar el HTML de paginación.

Si desea designar un archivo diferente como vista de paginación predeterminada, puede invocar los métodos `defaultView` y `defaultSimpleView` del paginador dentro del método `boot` de su clase `App\Providers\AppServiceProvider`:

```php
<?php

namespace App\Providers;

use Illuminate\Pagination\Paginator;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Inicializar los servicios de la aplicación.
     */
    public function boot(): void
    {
        Paginator::defaultView('view-name');

        Paginator::defaultSimpleView('view-name');
    }
}
```

<a id="using-bootstrap"></a>
### Usando Bootstrap

Laravel incluye vistas de paginación creadas con [Bootstrap CSS](https://getbootstrap.com/). Para usar estas vistas en lugar de las vistas predeterminadas de Tailwind, puede llamar a los métodos `useBootstrapFour` o `useBootstrapFive` del paginador dentro del método `boot` de su clase `App\Providers\AppServiceProvider`:

```php
use Illuminate\Pagination\Paginator;

/**
 * Inicializar los servicios de la aplicación.
 */
public function boot(): void
{
    Paginator::useBootstrapFive();
    Paginator::useBootstrapFour();
}
```

<a id="paginator-instance-methods"></a>
## Métodos de instancia de Paginator/LongitudAwarePaginator

Cada instancia de paginador proporciona información de paginación adicional a través de los siguientes métodos:

<div class="overflow-auto">

| Método | Descripción |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `$paginator->count()` | Obtenga el número de elementos de la página actual.                                                                |
| `$paginator->currentPage()` | Obtenga el número de página actual.                                                                                 |
| `$paginator->firstItem()` | Obtenga el número de resultado del primer elemento de los resultados.                                                      |
| `$paginator->getOptions()` | Obtenga las opciones del paginador.                                                                                   |
| `$paginator->getUrlRange($start, $end)` | Cree una variedad de URL de paginación.                                                                           |
| `$paginator->hasPages()` | Determine si hay suficientes elementos para dividirlos en varias páginas.                                            |
| `$paginator->hasMorePages()` | Determine si hay más elementos en el almacén de datos.                                                         |
| `$paginator->items()` | Obtenga los elementos de la página actual.                                                                          |
| `$paginator->lastItem()` | Obtenga el número de resultado del último elemento de los resultados.                                                       |
| `$paginator->lastPage()` | Obtenga el número de página de la última página disponible. (No disponible cuando se utiliza `simplePaginate`).                 |
| `$paginator->nextPageUrl()` | Obtenga la URL de la página siguiente.                                                                               |
| `$paginator->onFirstPage()` | Determine si el paginador está en la primera página.                                                             |
| `$paginator->onLastPage()` | Determine si el paginador está en la última página.                                                              |
| `$paginator->perPage()` | El número de elementos que se mostrarán por página.                                                                    |
| `$paginator->previousPageUrl()` | Obtenga la URL de la página anterior.                                                                           |
| `$paginator->total()` | Determine el número total de elementos coincidentes en el almacén de datos. (No disponible cuando se utiliza `simplePaginate`). |
| `$paginator->url($page)` | Obtenga la URL de un número de página determinado.                                                                         |
| `$paginator->getPageName()` | Obtenga la variable de cadena de consulta utilizada para almacenar la página.                                                        |
| `$paginator->setPageName($name)` | Establezca la variable de cadena de consulta utilizada para almacenar la página.                                                        |
| `$paginator->through($callback)` | Transforma cada elemento mediante una devolución de llamada.                                                                        |

</div>

<a id="cursor-paginator-instance-methods"></a>
## Métodos de instancia del paginador de cursor

Cada instancia del paginador de cursor proporciona información de paginación adicional a través de los siguientes métodos:

<div class="overflow-auto">

| Método | Descripción |
| ------------------------------- | ----------------------------------------------------------------- |
| `$paginator->count()` | Obtenga el número de elementos de la página actual.                     |
| `$paginator->cursor()` | Obtenga la instancia del cursor actual.                                  |
| `$paginator->getOptions()` | Obtenga las opciones del paginador.                                        |
| `$paginator->hasPages()` | Determine si hay suficientes elementos para dividirlos en varias páginas. |
| `$paginator->hasMorePages()` | Determine si hay más elementos en el almacén de datos.              |
| `$paginator->getCursorName()` | Obtenga la variable de cadena de consulta utilizada para almacenar el cursor.           |
| `$paginator->items()` | Obtenga los elementos de la página actual.                               |
| `$paginator->nextCursor()` | Obtenga la instancia del cursor para el siguiente conjunto de elementos.                |
| `$paginator->nextPageUrl()` | Obtenga la URL de la página siguiente.                                    |
| `$paginator->onFirstPage()` | Determine si el paginador está en la primera página.                  |
| `$paginator->onLastPage()` | Determine si el paginador está en la última página.                   |
| `$paginator->perPage()` | El número de elementos que se mostrarán por página.                         |
| `$paginator->previousCursor()` | Obtenga la instancia del cursor para el conjunto de elementos anterior.            |
| `$paginator->previousPageUrl()` | Obtenga la URL de la página anterior.                                |
| `$paginator->setCursorName()` | Establezca la variable de cadena de consulta utilizada para almacenar el cursor.           |
| `$paginator->url($cursor)` | Obtenga la URL para una instancia de cursor determinada.                          |

</div>
