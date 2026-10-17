---
title: "Plantillas Blade"
translationSourceCommit: "b1924db03c74b31fad5fc2f0d951406ca224a335"
---

- [Introducción](#introduction)
    - [Potencia Blade con Livewire](#supercharging-blade-with-livewire)
- [Mostrar datos](#displaying-data)
    - [Codificación de entidades HTML](#html-entity-encoding)
    - [Blade y los frameworks de JavaScript](#blade-and-javascript-frameworks)
- [Directivas de Blade](#blade-directives)
    - [Sentencias if](#if-statements)
    - [Sentencias switch](#switch-statements)
    - [Bucles](#loops)
    - [La variable del bucle](#the-loop-variable)
    - [Clases condicionales](#conditional-classes)
    - [Atributos adicionales](#additional-attributes)
    - [Incluir subvistas](#including-subviews)
    - [La directiva `@once`](#the-once-directive)
    - [PHP sin procesar](#raw-php)
    - [Fuentes](#fonts)
    - [Comentarios](#comments)
- [Componentes](#components)
    - [Renderizar componentes](#rendering-components)
    - [Componentes de índice](#index-components)
    - [Pasar datos a componentes](#passing-data-to-components)
    - [Atributos de componentes](#component-attributes)
    - [Palabras clave reservadas](#reserved-keywords)
    - [Slots](#slots)
    - [Vistas de componentes en línea](#inline-component-views)
    - [Componentes dinámicos](#dynamic-components)
    - [Registrar componentes manualmente](#manually-registering-components)
- [Componentes anónimos](#anonymous-components)
    - [Componentes de índice anónimos](#anonymous-index-components)
    - [Propiedades de datos / atributos](#data-properties-attributes)
    - [Acceder a datos del componente padre](#accessing-parent-data)
    - [Rutas de componentes anónimos](#anonymous-component-paths)
- [Crear diseños](#building-layouts)
    - [Diseños con componentes](#layouts-using-components)
    - [Diseños con herencia de plantillas](#layouts-using-template-inheritance)
- [Formularios](#forms)
    - [Campo CSRF](#csrf-field)
    - [Campo de método](#method-field)
    - [Errores de validación](#validation-errors)
- [Pilas](#stacks)
- [Inyección de servicios](#service-injection)
- [Renderizar plantillas Blade en línea](#rendering-inline-blade-templates)
- [Renderizar fragmentos de Blade](#rendering-blade-fragments)
- [Extender Blade](#extending-blade)
    - [Manejadores de salida personalizados](#custom-echo-handlers)
    - [Sentencias if personalizadas](#custom-if-statements)

<a id="introduction"></a>
## Introducción

Blade es el motor de plantillas sencillo pero potente incluido en Laravel. A diferencia de algunos motores de plantillas PHP, Blade no te impide utilizar código PHP puro en tus plantillas. De hecho, todas las plantillas Blade se compilan en código PHP puro y se almacenan en caché hasta que se modifican, por lo que Blade prácticamente no añade sobrecarga a tu aplicación. Los archivos de plantillas Blade usan la extensión `.blade.php` y normalmente se almacenan en el directorio `resources/views`.

Puedes devolver vistas Blade desde rutas o controladores mediante la función auxiliar global `view`. Por supuesto, como se menciona en la documentación sobre [vistas](../views/), puedes pasar datos a la vista Blade mediante el segundo argumento de la función auxiliar `view`:

```php
Route::get('/', function () {
    return view('greeting', ['name' => 'Finn']);
});
```

<a id="supercharging-blade-with-livewire"></a>
### Potencia Blade con Livewire

¿Quieres llevar tus plantillas Blade al siguiente nivel y crear interfaces dinámicas con facilidad? Consulta [Laravel Livewire](https://livewire.laravel.com). Livewire te permite escribir componentes Blade ampliados con funciones dinámicas que normalmente solo serían posibles mediante frameworks de frontend como React, Svelte o Vue. Es una excelente forma de crear interfaces modernas y reactivas sin las complejidades, el renderizado del lado del cliente ni los pasos de compilación de muchos frameworks de JavaScript.

<a id="displaying-data"></a>
## Mostrar datos

Puedes mostrar los datos que se pasan a tus vistas Blade envolviendo la variable entre llaves. Por ejemplo, dada la siguiente ruta:

```php
Route::get('/', function () {
    return view('welcome', ['name' => 'Samantha']);
});
```

Puedes mostrar el contenido de la variable `name` así:

```blade
Hello, {{ $name }}.
```

> **Nota:**
> Las sentencias de salida `{{ }}` de Blade se envían automáticamente a través de la función `htmlspecialchars` de PHP para evitar ataques XSS.

Además de mostrar el contenido de las variables pasadas a la vista, también puedes mostrar los resultados de cualquier función PHP. De hecho, puedes incluir cualquier código PHP que desees dentro de una sentencia de salida de Blade:

```blade
The current UNIX timestamp is {{ time() }}.
```

<a id="html-entity-encoding"></a>
### Codificación de entidades HTML

De forma predeterminada, Blade (y la función Laravel `e`) codificarán dos veces las entidades HTML. Si deseas desactivar la doble codificación, llama al método `Blade::withoutDoubleEncoding` desde el método `boot` de tu `AppServiceProvider`:

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Inicializar los servicios de la aplicación.
     */
    public function boot(): void
    {
        Blade::withoutDoubleEncoding();
    }
}
```

<a id="displaying-unescaped-data"></a>
#### Mostrar datos sin escapar

De forma predeterminada, las declaraciones Blade `{{ }}` se envían automáticamente a través de la función `htmlspecialchars` de PHP para evitar ataques XSS. Si no deseas que se escapen tus datos, puedes utilizar la siguiente sintaxis:

```blade
Hello, {!! $name !!}.
```

> **Advertencia:**
> Ten mucho cuidado al mostrar contenido proporcionado por los usuarios de tu aplicación. Normalmente debes usar la sintaxis con escape de dobles llaves para evitar ataques XSS al mostrar datos proporcionados por los usuarios.

<a id="blade-and-javascript-frameworks"></a>
### Blade y los frameworks de JavaScript

Dado que muchos frameworks de JavaScript también usan llaves para indicar que una expresión debe mostrarse en el navegador, puedes usar el símbolo `@` para indicar al motor de renderizado de Blade que una expresión debe permanecer intacta. Por ejemplo:

```blade
<h1>Laravel</h1>

Hello, @{{ name }}.
```

En este ejemplo, Blade eliminará el símbolo `@`; sin embargo, la expresión `{{ name }}` permanecerá intacta por el motor Blade, lo que permitirá que tu framework de JavaScript la represente.

También puedes usar el símbolo `@` para escapar directivas de Blade:

```blade
{{-- Blade template --}}
@@if()

<!-- HTML output -->
@if()
```

<a id="rendering-json"></a>
#### Renderizar JSON

A veces puedes pasar un array a tu vista con la intención de renderizarlo como JSON para inicializar una variable de JavaScript. Por ejemplo:

```blade
<script>
    var app = <?php echo json_encode($array); ?>;
</script>
```

Sin embargo, en lugar de llamar manualmente a `json_encode`, puedes usar el método `Illuminate\Support\Js::from`. El método `from` acepta los mismos argumentos que la función `json_encode` de PHP; además, garantiza que el JSON resultante se haya escapado correctamente para incluirlo entre comillas HTML. El método `from` devuelve una sentencia JavaScript `JSON.parse` en forma de cadena que convierte el objeto o array dado en un objeto JavaScript válido:

```blade
<script>
    var app = {{ Illuminate\Support\Js::from($array) }};
</script>
```

Las últimas versiones del esqueleto de la aplicación Laravel incluyen una fachada `Js`, que proporciona un acceso conveniente a esta funcionalidad dentro de tus plantillas Blade:

```blade
<script>
    var app = {{ Js::from($array) }};
</script>
```

> **Advertencia:**
> Sólo debes usar el método `Js::from` para representar las variables existentes como JSON. La plantilla de Blade se basa en expresiones regulares y los intentos de pasar una expresión compleja a la directiva pueden causar fallas inesperadas.

<a id="the-at-verbatim-directive"></a>
#### La directiva `@verbatim`

Si muestras variables de JavaScript en gran parte de tu plantilla, puedes envolver el HTML con la directiva `@verbatim` para no tener que anteponer el símbolo `@` a cada sentencia de salida de Blade:

```blade
@verbatim
    <div class="container">
        Hello, {{ name }}.
    </div>
@endverbatim
```

<a id="blade-directives"></a>
## Directivas de Blade

Además de la herencia de plantillas y la visualización de datos, Blade también proporciona atajos convenientes para estructuras de control PHP comunes, como sentencias condicionales y bucles. Estos atajos proporcionan una forma muy limpia y concisa de trabajar con estructuras de control de PHP y al mismo tiempo siguen siendo familiares para sus equivalentes en PHP.

<a id="if-statements"></a>
### Sentencias if

Puedes construir declaraciones `if` utilizando las directivas `@if`, `@elseif`, `@else` y `@endif`. Estas directivas funcionan de manera idéntica a sus equivalentes en PHP:

```blade
@if (count($records) === 1)
    I have one record!
@elseif (count($records) > 1)
    I have multiple records!
@else
    I don't have any records!
@endif
```

Para mayor comodidad, Blade también proporciona una directiva `@unless`:

```blade
@unless (Auth::check())
    You are not signed in.
@endunless
```

Además de las directivas condicionales ya analizadas, las directivas `@isset` y `@empty` pueden usarse como atajos convenientes para sus respectivas funciones PHP:

```blade
@isset($records)
    // $records is defined and is not null...
@endisset

@empty($records)
    // $records is "empty"...
@endempty
```

<a id="authentication-directives"></a>
#### Directivas de autenticación

Las directivas `@auth` y `@guest` se pueden utilizar para determinar rápidamente si el usuario actual está [autenticado](../authentication/) o es un invitado:

```blade
@auth
    // The user is authenticated...
@endauth

@guest
    // The user is not authenticated...
@endguest
```

Si es necesario, puedes especificar la protección de autenticación que se debe verificar al usar las directivas `@auth` y `@guest`:

```blade
@auth('admin')
    // The user is authenticated...
@endauth

@guest('admin')
    // The user is not authenticated...
@endguest
```

<a id="environment-directives"></a>
#### Directivas de entorno

Puedes verificar si la aplicación se está ejecutando en el entorno de producción usando la directiva `@production`:

```blade
@production
    // Production specific content...
@endproduction
```

O puedes determinar si la aplicación se está ejecutando en un entorno específico utilizando la directiva `@env`:

```blade
@env('staging')
    // The application is running in "staging"...
@endenv

@env(['staging', 'production'])
    // The application is running in "staging" or "production"...
@endenv
```

<a id="section-directives"></a>
#### Directivas de sección

Puedes determinar si una sección de herencia de plantilla tiene contenido utilizando la directiva `@hasSection`:

```blade
@hasSection('navigation')
    <div class="pull-right">
        @yield('navigation')
    </div>

    <div class="clearfix"></div>
@endif
```

Puedes utilizar la directiva `sectionMissing` para determinar si una sección no tiene contenido:

```blade
@sectionMissing('navigation')
    <div class="pull-right">
        @include('default-navigation')
    </div>
@endif
```

<a id="session-directives"></a>
#### Directivas de sesión

La directiva `@session` se puede utilizar para determinar si existe un valor [sesión](../session/). Si el valor de la sesión existe, se evaluará el contenido de la plantilla dentro de las directivas `@session` y `@endsession`. Dentro del contenido de la directiva `@session`, puedes mostrar la variable `$value` para mostrar el valor de la sesión:

```blade
@session('status')
    <div class="p-4 bg-green-100">
        {{ $value }}
    </div>
@endsession
```

<a id="context-directives"></a>
#### Directivas de contexto

La directiva `@context` se puede utilizar para determinar si existe un valor [contexto](../context/). Si el valor de contexto existe, se evaluará el contenido de la plantilla dentro de las directivas `@context` y `@endcontext`. Dentro del contenido de la directiva `@context`, puedes mostrar la variable `$value` para mostrar el valor de contexto:

```blade
@context('canonical')
    <link href="{{ $value }}" rel="canonical">
@endcontext
```

<a id="switch-statements"></a>
### Sentencias switch

Las sentencias switch se pueden construir utilizando las directivas `@switch`, `@case`, `@break`, `@default` y `@endswitch`:

```blade
@switch($i)
    @case(1)
        First case...
        @break

    @case(2)
        Second case...
        @break

    @default
        Default case...
@endswitch
```

<a id="loops"></a>
### Bucles

Además de las declaraciones condicionales, Blade proporciona directivas simples para trabajar con estructuras de bucle de PHP. Nuevamente, cada una de estas directivas funciona de manera idéntica a sus equivalentes en PHP:

```blade
@for ($i = 0; $i < 10; $i++)
    The current value is {{ $i }}
@endfor

@foreach ($users as $user)
    <p>This is user {{ $user->id }}</p>
@endforeach

@forelse ($users as $user)
    <li>{{ $user->name }}</li>
@empty
    <p>No users</p>
@endforelse

@while (true)
    <p>I'm looping forever.</p>
@endwhile
```

> **Nota:**
> Mientras iteras a través de un bucle `foreach`, puedes utilizar la [variable de bucle](#the-loop-variable) para obtener información valiosa sobre el bucle, como por ejemplo si te encuentras en la primera o última iteración del bucle.

Al usar bucles, también puedes omitir la iteración actual o finalizar el bucle usando las directivas `@continue` y `@break`:

```blade
@foreach ($users as $user)
    @if ($user->type == 1)
        @continue
    @endif

    <li>{{ $user->name }}</li>

    @if ($user->number == 5)
        @break
    @endif
@endforeach
```

También puedes incluir la condición de continuación o interrupción dentro de la declaración directiva:

```blade
@foreach ($users as $user)
    @continue($user->type == 1)

    <li>{{ $user->name }}</li>

    @break($user->number == 5)
@endforeach
```

<a id="the-loop-variable"></a>
### La variable del bucle

Mientras se itera a través de un bucle `foreach`, una variable `$loop` estará disponible dentro de tu bucle. Esta variable proporciona acceso a algunos datos útiles, como el índice del bucle actual y si esta es la primera o la última iteración del bucle:

```blade
@foreach ($users as $user)
    @if ($loop->first)
        This is the first iteration.
    @endif

    @if ($loop->last)
        This is the last iteration.
    @endif

    <p>This is user {{ $user->id }}</p>
@endforeach
```

Si estás en un bucle anidado, puedes acceder a la variable `$loop` del bucle principal a través de la propiedad `parent`:

```blade
@foreach ($users as $user)
    @foreach ($user->posts as $post)
        @if ($loop->parent->first)
            This is the first iteration of the parent loop.
        @endif
    @endforeach
@endforeach
```

La variable `$loop` también contiene una variedad de otras propiedades útiles:

<div class="overflow-auto">

| Propiedad | Descripción |
| ------------------ | ------------------------------------------------------ |
| `$loop->index` | El índice de la iteración del bucle actual (comienza en 0). |
| `$loop->iteration` | La iteración del bucle actual (comienza en 1).              |
| `$loop->remaining` | Las iteraciones que quedan en el bucle.                  |
| `$loop->count` | El número total de elementos del array que se itera. |
| `$loop->first` | Si esta es la primera iteración del bucle.  |
| `$loop->last` | Si esta es la última iteración del bucle.   |
| `$loop->even` | Si esta es una iteración par del bucle. |
| `$loop->odd` | Si esta es una iteración impar del bucle. |
| `$loop->depth` | El nivel de anidamiento del bucle actual.                 |
| `$loop->parent` | Cuando está en un bucle anidado, la variable del bucle principal.     |

</div>

<a id="conditional-classes"></a>
### Clases y estilos condicionales

La directiva `@class` compila condicionalmente una cadena de clase CSS. La directiva acepta un array de clases donde la clave del array contiene la clase o clases que deseas agregar, mientras que el valor es una expresión booleana. Si el elemento del array tiene una clave numérica, siempre se incluirá en la lista de clases renderizadas:

```blade
@php
    $isActive = false;
    $hasError = true;
@endphp

<span @class([
    'p-4',
    'font-bold' => $isActive,
    'text-gray-500' => ! $isActive,
    'bg-red' => $hasError,
])></span>

<span class="p-4 text-gray-500 bg-red"></span>
```

Asimismo, la directiva `@style` se puede utilizar para agregar condicionalmente estilos CSS en línea a un elemento HTML:

```blade
@php
    $isActive = true;
@endphp

<span @style([
    'background-color: red',
    'font-weight: bold' => $isActive,
])></span>

<span style="background-color: red; font-weight: bold;"></span>
```

<a id="additional-attributes"></a>
### Atributos adicionales

Para mayor comodidad, puedes utilizar la directiva `@checked` para indicar fácilmente si una determinada casilla de verificación HTML está "marcada". Esta directiva mostrará `checked` si la condición proporcionada se evalúa como `true`:

```blade
<input
    type="checkbox"
    name="active"
    value="active"
    @checked(old('active', $user->active))
/>
```

Asimismo, la directiva `@selected` se puede utilizar para indicar si una opción de selección determinada debe "seleccionarse":

```blade
<select name="version">
    @foreach ($product->versions as $version)
        <option value="{{ $version }}" @selected(old('version') == $version)>
            {{ $version }}
        </option>
    @endforeach
</select>
```

Además, la directiva `@disabled` se puede utilizar para indicar si un elemento determinado debe "deshabilitarse":

```blade
<button type="submit" @disabled($errors->isNotEmpty())>Submit</button>
```

Además, la directiva `@readonly` se puede utilizar para indicar si un elemento determinado debe ser de "solo lectura":

```blade
<input
    type="email"
    name="email"
    value="email@laravel.com"
    @readonly($user->isNotAdmin())
/>
```

Además, la directiva `@required` se puede utilizar para indicar si un elemento determinado debe ser "requerido":

```blade
<input
    type="text"
    name="title"
    value="title"
    @required($user->isAdmin())
/>
```

<a id="including-subviews"></a>
### Incluir subvistas

> **Nota:**
> Aunque puedes usar la directiva `@include`, los [componentes](#components) de Blade proporcionan funciones similares y ofrecen varias ventajas frente a `@include`, como la vinculación de datos y atributos.

La directiva `@include` de Blade te permite incluir una vista Blade desde otra vista. Todas las variables que están disponibles para la vista principal estarán disponibles para la vista incluida:

```blade
<div>
    @include('shared.errors')

    <form>
        <!-- Form Contents -->
    </form>
</div>
```

Aunque la vista incluida hereda todos los datos disponibles en la vista padre, también puedes pasar un array de datos adicionales que deban estar disponibles para la vista incluida:

```blade
@include('view.name', ['status' => 'complete'])
```

Si intentas `@include` una vista que no existe, Laravel arrojará un error. Si deseas incluir una vista que puede estar presente o no, debes utilizar la directiva `@includeIf`:

```blade
@includeIf('view.name', ['status' => 'complete'])
```

Si deseas incluir una vista con `@include` cuando una expresión booleana se evalúe como `true` o `false`, puedes usar las directivas `@includeWhen` y `@includeUnless`:

```blade
@includeWhen($boolean, 'view.name', ['status' => 'complete'])

@includeUnless($boolean, 'view.name', ['status' => 'complete'])
```

Para incluir la primera vista que exista de un array de vistas dado, puedes usar la directiva `includeFirst`:

```blade
@includeFirst(['custom.admin', 'admin'], ['status' => 'complete'])
```

Si deseas incluir una vista sin heredar ninguna variable de la vista principal, puedes utilizar la directiva `@includeIsolated`. La vista incluida solo tendrá acceso a las variables que pases explícitamente:

```blade
@includeIsolated('view.name', ['user' => $user])
```

> **Advertencia:**
> Debes evitar el uso de las constantes `__DIR__` y `__FILE__` en tus vistas Blade, ya que se referirán a la ubicación de la vista compilada y almacenada en caché.

<a id="rendering-views-for-collections"></a>
#### Renderizar vistas para colecciones

Puedes combinar bucles e inclusiones en una línea con la directiva `@each` de Blade:

```blade
@each('view.name', $jobs, 'job')
```

El primer argumento de la directiva `@each` es la vista a representar para cada elemento del array o colección. El segundo argumento es el array o colección sobre la que deseas iterar, mientras que el tercer argumento es el nombre de la variable que se asignará a la iteración actual dentro de la vista. Entonces, por ejemplo, si estás iterando sobre un array de `jobs`, normalmente querrás acceder a cada trabajo como una variable `job` dentro de la vista. La clave de array para la iteración actual estará disponible como la variable `key` dentro de la vista.

También puedes pasar un cuarto argumento a la directiva `@each`. Este argumento determina la vista que se representará si el array dado está vacío.

```blade
@each('view.name', $jobs, 'job', 'view.empty')
```

> **Advertencia:**
> Las vistas renderizadas a través de `@each` no heredan las variables de la vista principal. Si la vista secundaria requiere estas variables, debes utilizar las directivas `@foreach` y `@include` en su lugar.

<a id="the-once-directive"></a>
### La directiva `@once`

La directiva `@once` te permite definir una parte de la plantilla que solo se evaluará una vez por ciclo de renderizado. Esto puede resultar útil para insertar una determinada parte de JavaScript en el encabezado de la página usando [pilas](#stacks). Por ejemplo, si estás renderizando un [componente](#components) determinado dentro de un bucle, es posible que desees enviar JavaScript solo al encabezado la primera vez que se renderiza el componente:

```blade
@once
    @push('scripts')
        <script>
            // Your custom JavaScript...
        </script>
    @endpush
@endonce
```

Dado que la directiva `@once` se utiliza a menudo junto con las directivas `@push` o `@prepend`, las directivas `@pushOnce` y `@prependOnce` están disponibles para tu comodidad:

```blade
@pushOnce('scripts')
    <script>
        // Your custom JavaScript...
    </script>
@endPushOnce
```

Si envías contenido duplicado desde dos plantillas Blade independientes, debes proporcionar un identificador único como segundo argumento de la directiva `@pushOnce` para garantizar que el contenido solo se represente una vez:

```blade
<!-- pie-chart.blade.php -->
@pushOnce('scripts', 'chart.js')
    <script src="/chart.js"></script>
@endPushOnce

<!-- line-chart.blade.php -->
@pushOnce('scripts', 'chart.js')
    <script src="/chart.js"></script>
@endPushOnce
```

<a id="raw-php"></a>
### PHP sin procesar

En algunas situaciones, resulta útil incrustar código PHP en tus vistas. Puedes utilizar la directiva Blade `@php` para ejecutar un bloque de PHP simple dentro de tu plantilla:

```blade
@php
    $counter = 1;
@endphp
```

O, si sólo necesitas usar PHP para importar una clase, puedes usar la directiva `@use`:

```blade
@use('App\Models\Flight')
```

Se puede proporcionar un segundo argumento a la directiva `@use` para asignar un alias a la clase importada:

```blade
@use('App\Models\Flight', 'FlightModel')
```

Si tienes varias clases dentro del mismo espacio de nombres, puedes agrupar las importaciones de esas clases:

```blade
@use('App\Models\{Flight, Airport}')
```

La directiva `@use` también admite la importación de funciones y constantes PHP anteponiendo a la ruta de importación los modificadores `function` o `const`:

```blade
@use(function App\Helpers\format_currency)
@use(const App\Constants\MAX_ATTEMPTS)
```

Al igual que las importaciones de clases, también se admiten alias para funciones y constantes:

```blade
@use(function App\Helpers\format_currency, 'formatMoney')
@use(const App\Constants\MAX_ATTEMPTS, 'MAX_TRIES')
```

Las importaciones agrupadas también son compatibles con modificadores de función y constantes, lo que te permite importar múltiples símbolos desde el mismo espacio de nombres en una sola directiva:

```blade
@use(function App\Helpers\{format_currency, format_date})
@use(const App\Constants\{MAX_ATTEMPTS, DEFAULT_TIMEOUT})
```

<a id="fonts"></a>
### Fuentes

Al usar [la optimización de fuente Vite de Laravel](../vite/#working-with-fonts), puedes usar la directiva `@fonts` para representar los enlaces de precarga de fuentes configurados y el CSS de fuentes en línea en el diseño de tu aplicación:

```blade
<!doctype html>
<head>
    {{-- ... --}}

    @fonts
    @vite('resources/js/app.js')
</head>
```

La directiva `@fonts` muestra todas las familias de fuentes configuradas en tu archivo `vite.config.js`. Por lo general, la directiva debe colocarse en el `<head>` del diseño raíz de tu aplicación antes de cualquier contenido que utilice esas fuentes.

Si una página solo necesita algunas de las fuentes configuradas, puedes pasar uno o más alias de fuentes a la directiva:

```blade
{{-- Load a single font alias... --}}
@fonts('sans')

{{-- Load multiple font aliases... --}}
@fonts(['sans', 'mono'])
```

Los alias de fuentes se configuran usando la opción `alias` al definir fuentes en tu configuración de Vite. La directiva `@fonts` llama al método `fonts` proporcionado por la fachada `Vite`, que también se puede invocar directamente:

```blade
{{ Vite::fonts(['sans', 'mono']) }}
```

<a id="comments"></a>
### Comentarios

Blade también te permite definir comentarios en tus vistas. Sin embargo, a diferencia de los comentarios HTML, los comentarios de Blade no se incluyen en el HTML devuelto por tu aplicación:

```blade
{{-- This comment will not be present in the rendered HTML --}}
```

<a id="components"></a>
## Componentes

Los componentes y los slots brindan beneficios similares a las secciones, diseños e inclusiones; sin embargo, algunos pueden encontrar más fácil de entender el modelo mental de componentes y slots. Hay dos enfoques para escribir componentes: componentes basados ​​en clases y componentes anónimos.

Para crear un componente basado en clases, puedes utilizar el comando `make:component` Artisan. Para ilustrar cómo utilizar los componentes, crearemos un componente `Alert` simple. El comando `make:component` colocará el componente en el directorio `app/View/Components`:

```shell
php artisan make:component Alert
```

El comando `make:component` también creará una plantilla de vista para el componente. La vista se colocará en el directorio `resources/views/components`. Al escribir componentes para tu propia aplicación, los componentes se descubren automáticamente dentro del directorio `app/View/Components` y `resources/views/components`, por lo que normalmente no es necesario registrar más componentes.

También puedes crear componentes dentro de subdirectorios:

```shell
php artisan make:component Forms/Input
```

El comando anterior creará un componente `Input` en el directorio `app/View/Components/Forms` y la vista se colocará en el directorio `resources/views/components/forms`.

<a id="manually-registering-package-components"></a>
#### Registrar manualmente componentes de paquetes

Al escribir componentes para tu propia aplicación, los componentes se descubren automáticamente dentro del directorio `app/View/Components` y el directorio `resources/views/components`.

Sin embargo, si estás creando un paquete que utiliza componentes Blade, deberás registrar manualmente tu clase de componente y tu alias de etiqueta HTML. Normalmente deberías registrar tus componentes en el método `boot` del proveedor de servicios de tu paquete:

```php
use Illuminate\Support\Facades\Blade;

/**
 * Inicializar los servicios del package.
 */
public function boot(): void
{
    Blade::component('package-alert', Alert::class);
}
```

Una vez que tu componente haya sido registrado, podrás renderizarlo usando tu alias de etiqueta:

```blade
<x-package-alert/>
```

Alternativamente, puedes utilizar el método `componentNamespace` para cargar automáticamente las clases de componentes por convención. Por ejemplo, un paquete `Nightshade` podría tener componentes `Calendar` y `ColorPicker` que residen dentro del espacio de nombres `Nightshade\Views\Components`:

```php
use Illuminate\Support\Facades\Blade;

/**
 * Inicializar los servicios del package.
 */
public function boot(): void
{
    Blade::componentNamespace('Nightshade\\Views\\Components', 'nightshade');
}
```

Esto permitirá el uso de componentes del paquete por parte del espacio de nombres de tu proveedor utilizando la sintaxis `package-name::`:

```blade
<x-nightshade::calendar />
<x-nightshade::color-picker />
```

Blade detectará automáticamente la clase que está vinculada a este componente escribiendo en Pascal el nombre del componente. Los subdirectorios también son compatibles con la notación de "puntos".

<a id="rendering-components"></a>
### Renderizar componentes

Para mostrar un componente, puedes usar una etiqueta de componente Blade dentro de una de tus plantillas Blade. Las etiquetas de componentes Blade comienzan con la cadena `x-` seguida del nombre de la clase del componente en kebab case:

```blade
<x-alert/>

<x-user-profile/>
```

Si la clase de componente está anidada más profundamente dentro del directorio `app/View/Components`, puedes usar el carácter `.` para indicar el anidamiento del directorio. Por ejemplo, si asumimos que un componente está ubicado en `app/View/Components/Inputs/Button.php`, podemos representarlo así:

```blade
<x-inputs.button/>
```

Si deseas renderizar tu componente de forma condicional, puedes definir un método `shouldRender` en tu clase de componente. Si el método `shouldRender` devuelve `false`, el componente no se procesará:

```php
use Illuminate\Support\Str;

/**
 * Whether the component should be rendered
 */
public function shouldRender(): bool
{
    return Str::length($this->message) > 0;
}
```

<a id="index-components"></a>
### Componentes de índice

A veces, los componentes forman parte de un grupo de componentes y es posible que desees agrupar los componentes relacionados en un único directorio. Por ejemplo, imagina un componente "tarjeta" con la siguiente estructura de clases:

```text
App\View\Components\Card\Card
App\View\Components\Card\Header
App\View\Components\Card\Body
```

Dado que el componente raíz `Card` está anidado dentro de un directorio `Card`, podrías esperar tener que renderizarlo mediante `<x-card.card>`. Sin embargo, cuando el nombre del archivo de un componente coincide con el nombre de su directorio, Laravel asume automáticamente que se trata del componente "raíz" y permite renderizarlo sin repetir el nombre del directorio:

```blade
<x-card>
    <x-card.header>...</x-card.header>
    <x-card.body>...</x-card.body>
</x-card>
```

<a id="passing-data-to-components"></a>
### Pasar datos a componentes

Puedes pasar datos a los componentes Blade mediante atributos HTML. Puedes pasar valores primitivos literales mediante cadenas de atributos HTML simples. Las expresiones y variables PHP deben pasarse mediante atributos que usen el carácter `:` como prefijo:

```blade
<x-alert type="error" :message="$message"/>
```

Debes definir todos los atributos de datos del componente en su constructor de clase. Todas las propiedades públicas de un componente estarán automáticamente disponibles para la vista del componente. No es necesario pasar los datos a la vista desde el método `render` del componente:

```php
<?php

namespace App\View\Components;

use Illuminate\View\Component;
use Illuminate\View\View;

class Alert extends Component
{
    /**
     * Crear la instancia del componente.
     */
    public function __construct(
        public string $type,
        public string $message,
    ) {}

    /**
     * Obtener la vista / el contenido que representa el componente.
     */
    public function render(): View
    {
        return view('components.alert');
    }
}
```

Cuando se renderiza tu componente, puedes mostrar el contenido de las variables públicas de tu componente mostrando las variables por nombre:

```blade
<div class="alert alert-{{ $type }}">
    {{ $message }}
</div>
```

<a id="casing"></a>
#### Convenciones de mayúsculas y minúsculas

Los argumentos del constructor de componentes se deben especificar usando `camelCase`, mientras que se debe usar `kebab-case` al hacer referencia a los nombres de los argumentos en tus atributos HTML. Por ejemplo, dado el siguiente constructor de componentes:

```php
/**
 * Crear la instancia del componente.
 */
public function __construct(
    public string $alertType,
) {}
```

El argumento `$alertType` se puede proporcionar al componente de la siguiente manera:

```blade
<x-alert alert-type="danger" />
```

<a id="short-attribute-syntax"></a>
#### Sintaxis abreviada de atributos

Al pasar atributos a componentes, también puedes utilizar una sintaxis de "atributo corto". Esto suele ser conveniente ya que los nombres de los atributos frecuentemente coinciden con los nombres de las variables a las que corresponden:

```blade
{{-- Short attribute syntax... --}}
<x-profile :$userId :$name />

{{-- Is equivalent to... --}}
<x-profile :user-id="$userId" :name="$name" />
```

<a id="escaping-attribute-rendering"></a>
#### Escapar el renderizado de atributos

Dado que algunos frameworks de JavaScript como Alpine.js también usan atributos con el prefijo de dos puntos, puedes usar un prefijo de dos puntos dobles (`::`) para indicar a Blade que el atributo no es una expresión PHP. Por ejemplo, dado el siguiente componente:

```blade
<x-button ::class="{ danger: isDeleting }">
    Submit
</x-button>
```

Blade renderizará el siguiente HTML:

```blade
<button :class="{ danger: isDeleting }">
    Submit
</button>
```

<a id="component-methods"></a>
#### Métodos de componentes

Además de que las variables públicas estén disponibles para la plantilla de tu componente, se puede invocar cualquier método público del componente. Por ejemplo, imagina un componente que tiene un método `isSelected`:

```php
/**
 * Determinar si la opción indicada es la opción seleccionada actualmente.
 */
public function isSelected(string $option): bool
{
    return $option === $this->selected;
}
```

Puedes ejecutar este método desde tu plantilla de componente invocando la variable que coincide con el nombre del método:

```blade
<option {{ $isSelected($value) ? 'selected' : '' }} value="{{ $value }}">
    {{ $label }}
</option>
```

<a id="using-attributes-slots-within-component-class"></a>
#### Acceder a atributos y slots dentro de las clases de componentes

Los componentes Blade también te permiten acceder al nombre, los atributos y el slot del componente dentro del método de renderizado de la clase. Sin embargo, para acceder a estos datos, debes devolver una función anónima desde el método `render` del componente:

```php
use Closure;

/**
 * Obtener la vista / el contenido que representa el componente.
 */
public function render(): Closure
{
    return function () {
        return '<div {{ $attributes }}>Components content</div>';
    };
}
```

La función anónima devuelta por el método `render` del componente también puede recibir un array `$data` como único argumento. Este array contiene varios elementos que proporcionan información sobre el componente:

```php
return function (array $data) {
    // $data['componentName'];
    // $data['attributes'];
    // $data['slot'];

    return '<div {{ $attributes }}>Components content</div>';
};
```

> **Advertencia:**
> Los elementos del array `$data` nunca deben incrustarse directamente en la cadena Blade devuelta por tu método `render`, ya que hacerlo podría permitir la ejecución remota de código a través de contenido de atributos maliciosos.

El valor de `componentName` equivale al nombre usado en la etiqueta HTML después del prefijo `x-`. Por tanto, el valor de `componentName` para `<x-alert />` será `alert`. El elemento `attributes` contiene todos los atributos presentes en la etiqueta HTML. El elemento `slot` es una instancia de `Illuminate\View\ComponentSlot` con el contenido del slot del componente.

La función anónima debe devolver una cadena. Si esta corresponde a una vista existente, se renderizará esa vista; de lo contrario, se evaluará como una vista Blade en línea.

<a id="additional-dependencies"></a>
#### Dependencias adicionales

Si tu componente requiere dependencias del [contenedor de servicios](../container/) de Laravel, puedes enumerarlas antes de cualquiera de los atributos de datos del componente y el contenedor los inyectará automáticamente:

```php
use App\Services\AlertCreator;

/**
 * Crear la instancia del componente.
 */
public function __construct(
    public AlertCreator $creator,
    public string $type,
    public string $message,
) {}
```

<a id="hiding-attributes-and-methods"></a>
#### Ocultar atributos / métodos

Si deseas evitar que algunos métodos o propiedades públicos queden expuestos como variables en tu plantilla de componente, puedes agregarlos a una propiedad de array `$except` en tu componente:

```php
<?php

namespace App\View\Components;

use Illuminate\View\Component;

class Alert extends Component
{
    /**
     * The properties / methods that should not be exposed to the component template.
     *
     * @var array
     */
    protected $except = ['type'];

    /**
     * Crear la instancia del componente.
     */
    public function __construct(
        public string $type,
    ) {}
}
```

<a id="component-attributes"></a>
### Atributos de componentes

Ya hemos examinado cómo pasar atributos de datos a un componente; sin embargo, a veces es posible que necesites especificar atributos HTML adicionales, como `class`, que no forman parte de los datos necesarios para que un componente funcione. Normalmente, deseas pasar estos atributos adicionales al elemento raíz de la plantilla del componente. Por ejemplo, imagina que queremos renderizar un componente `alert` así:

```blade
<x-alert type="error" :message="$message" class="mt-4"/>
```

Todos los atributos que no forman parte del constructor del componente se agregarán automáticamente a la "bolsa de atributos" del componente. Esta bolsa de atributos se pone automáticamente a disposición del componente a través de la variable `$attributes`. Todos los atributos se pueden representar dentro del componente mostrando esta variable:

```blade
<div {{ $attributes }}>
    <!-- Component content -->
</div>
```

> **Advertencia:**
> En este momento no se admite el uso de directivas como `@env` dentro de las etiquetas de componentes. Por ejemplo, `<x-alert :live="@env('production')"/>` no se compilará.

<a id="default-merged-attributes"></a>
#### Atributos predeterminados / combinados

A veces es posible que necesites especificar valores predeterminados para los atributos o fusionar valores adicionales en algunos de los atributos del componente. Para lograr esto, puedes utilizar el método `merge` de la bolsa de atributos. Este método es particularmente útil para definir un conjunto de clases CSS predeterminadas que siempre deben aplicarse a un componente:

```blade
<div {{ $attributes->merge(['class' => 'alert alert-'.$type]) }}>
    {{ $message }}
</div>
```

Si asumimos que este componente se utiliza así:

```blade
<x-alert type="error" :message="$message" class="mb-4"/>
```

El HTML final renderizado del componente tendrá el siguiente aspecto:

```blade
<div class="alert alert-error mb-4">
    <!-- Contents of the $message variable -->
</div>
```

<a id="conditionally-merge-classes"></a>
#### Combinar clases de forma condicional

A veces es posible que desees fusionar clases si una condición determinada es `true`. Puedes lograr esto mediante el método `class`, que acepta un array de clases donde la clave del array contiene la clase o clases que deseas agregar, mientras que el valor es una expresión booleana. Si el elemento del array tiene una clave numérica, siempre se incluirá en la lista de clases renderizadas:

```blade
<div {{ $attributes->class(['p-4', 'bg-red' => $hasError]) }}>
    {{ $message }}
</div>
```

Si necesitas fusionar otros atributos en tu componente, puedes encadenar el método `merge` al método `class`:

```blade
<button {{ $attributes->class(['p-4'])->merge(['type' => 'button']) }}>
    {{ $slot }}
</button>
```

> **Nota:**
> Si necesitas compilar clases condicionalmente en otros elementos HTML que no deberían recibir atributos combinados, puedes usar la directiva [@class](#conditional-classes).

<a id="non-class-attribute-merging"></a>
#### Combinar atributos distintos de class

Al fusionar atributos que no son atributos `class`, los valores proporcionados al método `merge` se considerarán los valores "predeterminados" del atributo. Sin embargo, a diferencia del atributo `class`, estos atributos no se fusionarán con los valores de atributos inyectados. En cambio, se sobrescribirán. Por ejemplo, la implementación de un componente `button` puede verse similar a la siguiente:

```blade
<button {{ $attributes->merge(['type' => 'button']) }}>
    {{ $slot }}
</button>
```

Para renderizar el componente del botón con un `type` personalizado, se puede especificar al consumir el componente. Si no se especifica ningún tipo, se utilizará el tipo `button`:

```blade
<x-button type="submit">
    Submit
</x-button>
```

El HTML renderizado del componente `button` en este ejemplo sería:

```blade
<button type="submit">
    Submit
</button>
```

Si deseas que un atributo distinto de `class` tenga su valor predeterminado y los valores inyectados unidos, puedes utilizar el método `prepends`. En este ejemplo, el atributo `data-controller` siempre comenzará con `profile-controller` y cualquier valor adicional de `data-controller` inyectado se colocará después de este valor predeterminado:

```blade
<div {{ $attributes->merge(['data-controller' => $attributes->prepends('profile-controller')]) }}>
    {{ $slot }}
</div>
```

<a id="filtering-attributes"></a>
#### Obtener y filtrar atributos

Puedes filtrar atributos mediante el método `filter`. Este método acepta una función anónima que debe devolver `true` si deseas conservar el atributo en la bolsa de atributos:

```blade
{{ $attributes->filter(fn (string $value, string $key) => $key == 'foo') }}
```

Para mayor comodidad, puedes utilizar el método `whereStartsWith` para recuperar todos los atributos cuyas claves comiencen con una cadena determinada:

```blade
{{ $attributes->whereStartsWith('wire:model') }}
```

Por el contrario, el método `whereDoesntStartWith` se puede utilizar para excluir todos los atributos cuyas claves comiencen con una cadena determinada:

```blade
{{ $attributes->whereDoesntStartWith('wire:model') }}
```

Usando el método `first`, puedes representar el primer atributo en una bolsa de atributos determinada:

```blade
{{ $attributes->whereStartsWith('wire:model')->first() }}
```

Si deseas comprobar si un atributo está presente en el componente, puedes utilizar el método `has`. Este método acepta el nombre del atributo como único argumento y devuelve un valor booleano que indica si el atributo está presente o no:

```blade
@if ($attributes->has('class'))
    <div>Class attribute is present</div>
@endif
```

Si se pasa un array al método `has`, el método determinará si todos los atributos dados están presentes en el componente:

```blade
@if ($attributes->has(['name', 'class']))
    <div>All of the attributes are present</div>
@endif
```

El método `hasAny` se puede utilizar para determinar si alguno de los atributos dados está presente en el componente:

```blade
@if ($attributes->hasAny(['href', ':href', 'v-bind:href']))
    <div>One of the attributes is present</div>
@endif
```

Puedes recuperar el valor de un atributo específico utilizando el método `get`:

```blade
{{ $attributes->get('class') }}
```

El método `only` se puede utilizar para recuperar solo los atributos con las claves dadas:

```blade
{{ $attributes->only(['class']) }}
```

El método `except` se puede utilizar para recuperar todos los atributos excepto aquellos con las claves dadas:

```blade
{{ $attributes->except(['class']) }}
```

<a id="reserved-keywords"></a>
### Palabras clave reservadas

De forma predeterminada, algunas palabras clave están reservadas para uso interno de Blade con el fin de representar componentes. Las siguientes palabras clave no se pueden definir como propiedades públicas o nombres de métodos dentro de tus componentes:

<div class="content-list" markdown="1">

- `data`
- `render`
- `resolve`
- `resolveView`
- `shouldRender`
- `view`
- `withAttributes`
- `withName`

</div>

<a id="slots"></a>
### Slots

A menudo necesitarás pasar contenido adicional a tu componente a través de "slots". Los slots de componentes se representan mostrando la variable `$slot`. Para explorar este concepto, imaginemos que un componente `alert` tiene el siguiente marcado:

```blade
<!-- /resources/views/components/alert.blade.php -->

<div class="alert alert-danger">
    {{ $slot }}
</div>
```

Podemos pasar contenido al `slot` inyectando contenido en el componente:

```blade
<x-alert>
    <strong>Whoops!</strong> Something went wrong!
</x-alert>
```

A veces, es posible que un componente necesite representar varios slots diferentes en diferentes ubicaciones dentro del componente. Modifiquemos nuestro componente de alerta para permitir la inyección de un slot de "título":

```blade
<!-- /resources/views/components/alert.blade.php -->

<span class="alert-title">{{ $title }}</span>

<div class="alert alert-danger">
    {{ $slot }}
</div>
```

Puedes definir el contenido del slot con nombre utilizando la etiqueta `x-slot`. Cualquier contenido que no esté dentro de una etiqueta `x-slot` explícita se pasará al componente en la variable `$slot`:

```xml
<x-alert>
    <x-slot:title>
        Server Error
    </x-slot>

    <strong>Whoops!</strong> Something went wrong!
</x-alert>
```

Puedes invocar el método `isEmpty` de un slot para determinar si el slot contiene contenido:

```blade
<span class="alert-title">{{ $title }}</span>

<div class="alert alert-danger">
    @if ($slot->isEmpty())
        This is default content if the slot is empty.
    @else
        {{ $slot }}
    @endif
</div>
```

Además, se puede utilizar el método `hasActualContent` para determinar si el slot contiene algún contenido "real" que no sea un comentario HTML:

```blade
@if ($slot->hasActualContent())
    The scope has non-comment content.
@endif
```

<a id="scoped-slots"></a>
#### Slots con ámbito

Si has usado un framework de JavaScript como Vue, puede que conozcas los "slots con ámbito", que permiten acceder a datos o métodos del componente desde un slot. Puedes conseguir un comportamiento similar en Laravel definiendo métodos o propiedades públicos en el componente y accediendo a él desdel slot mediante la variable `$component`. En este ejemplo, supondremos que el componente `x-alert` tiene un método público `formatAlert` definido en su clase:

```blade
<x-alert>
    <x-slot:title>
        {{ $component->formatAlert('Server Error') }}
    </x-slot>

    <strong>Whoops!</strong> Something went wrong!
</x-alert>
```

<a id="slot-attributes"></a>
#### Atributos de slots

Al igual que los componentes Blade, puedes asignar [atributos](#component-attributes) adicionales a slots como nombres de clases CSS:

```xml
<x-card class="shadow-sm">
    <x-slot:heading class="font-bold">
        Heading
    </x-slot>

    Content

    <x-slot:footer class="text-sm">
        Footer
    </x-slot>
</x-card>
```

Para interactuar con los atributos del slot, puedes acceder a la propiedad `attributes` de la variable del slot. Para obtener más información sobre cómo interactuar con los atributos, consulta la documentación sobre [atributos del componente](#component-attributes):

```blade
@props([
    'heading',
    'footer',
])

<div {{ $attributes->class(['border']) }}>
    <h1 {{ $heading->attributes->class(['text-lg']) }}>
        {{ $heading }}
    </h1>

    {{ $slot }}

    <footer {{ $footer->attributes->class(['text-gray-700']) }}>
        {{ $footer }}
    </footer>
</div>
```

<a id="inline-component-views"></a>
### Vistas de componentes en línea

Para componentes muy pequeños, puede resultar engorroso administrar tanto la clase de componente como la plantilla de vista del componente. Por este motivo, puedes devolver el marcado del componente directamente desde el método `render`:

```php
/**
 * Obtener la vista / el contenido que representa el componente.
 */
public function render(): string
{
    return <<<'blade'
        <div class="alert alert-danger">
            {{ $slot }}
        </div>
    blade;
}
```

<a id="generating-inline-view-components"></a>
#### Generar componentes con vistas en línea

Para crear un componente que represente una vista en línea, puedes usar la opción `inline` al ejecutar el comando `make:component`:

```shell
php artisan make:component Alert --inline
```

<a id="dynamic-components"></a>
### Componentes dinámicos

A veces es posible que necesites renderizar un componente pero no sepas qué componente debe renderizarse hasta el tiempo de ejecución. En esta situación, puedes utilizar el componente `dynamic-component` integrado de Laravel para representar el componente en función de un valor o variable de tiempo de ejecución:

```blade
// $componentName = "secondary-button";

<x-dynamic-component :component="$componentName" class="mt-4" />
```

<a id="manually-registering-components"></a>
### Registrar componentes manualmente

> **Advertencia:**
> La siguiente documentación sobre el registro manual de componentes se aplica principalmente a quienes escriben paquetes de Laravel que incluyen componentes de vista. Si no estás escribiendo un paquete, es posible que esta parte de la documentación del componente no sea relevante para ti.

Al escribir componentes para tu propia aplicación, los componentes se descubren automáticamente dentro del directorio `app/View/Components` y el directorio `resources/views/components`.

Sin embargo, si estás creando un paquete que utiliza componentes Blade o colocando componentes en directorios no convencionales, necesitarás registrar manualmente tu clase de componente y tu alias de etiqueta HTML para que Laravel sepa dónde encontrar el componente. Normalmente deberías registrar tus componentes en el método `boot` del proveedor de servicios de tu paquete:

```php
use Illuminate\Support\Facades\Blade;
use VendorPackage\View\Components\AlertComponent;

/**
 * Inicializar los servicios del package.
 */
public function boot(): void
{
    Blade::component('package-alert', AlertComponent::class);
}
```

Una vez que tu componente haya sido registrado, podrás renderizarlo usando tu alias de etiqueta:

```blade
<x-package-alert/>
```

#### Carga automática de componentes de paquetes

Alternativamente, puedes utilizar el método `componentNamespace` para cargar automáticamente las clases de componentes por convención. Por ejemplo, un paquete `Nightshade` podría tener componentes `Calendar` y `ColorPicker` que residen dentro del espacio de nombres `Nightshade\Views\Components`:

```php
use Illuminate\Support\Facades\Blade;

/**
 * Inicializar los servicios del package.
 */
public function boot(): void
{
    Blade::componentNamespace('Nightshade\\Views\\Components', 'nightshade');
}
```

Esto permitirá el uso de componentes del paquete por parte del espacio de nombres de tu proveedor utilizando la sintaxis `package-name::`:

```blade
<x-nightshade::calendar />
<x-nightshade::color-picker />
```

Blade detectará automáticamente la clase que está vinculada a este componente escribiendo en Pascal el nombre del componente. Los subdirectorios también son compatibles con la notación de "puntos".

<a id="anonymous-components"></a>
## Componentes anónimos

Al igual que los componentes en línea, los componentes anónimos proporcionan un mecanismo para administrar un componente a través de un único archivo. Sin embargo, los componentes anónimos utilizan un archivo de vista y no tienen ninguna clase asociada. Para definir un componente anónimo, solo necesitas colocar una plantilla Blade dentro de tu directorio `resources/views/components`. Por ejemplo, suponiendo que hayas definido un componente en `resources/views/components/alert.blade.php`, simplemente puedes representarlo así:

```blade
<x-alert/>
```

Puedes utilizar el carácter `.` para indicar si un componente está anidado más profundamente dentro del directorio `components`. Por ejemplo, suponiendo que el componente esté definido en `resources/views/components/inputs/button.blade.php`, puedes representarlo así:

```blade
<x-inputs.button/>
```

Para crear un componente anónimo a través de Artisan, puedes usar el indicador `--view` al invocar el comando `make:component`:

```shell
php artisan make:component forms.input --view
```

El comando anterior creará un archivo Blade en `resources/views/components/forms/input.blade.php` que se puede representar como un componente a través de `<x-forms.input />`.

<a id="anonymous-index-components"></a>
### Componentes de índice anónimos

A veces, cuando un componente se compone de muchas plantillas Blade, es posible que desees agrupar las plantillas del componente determinado dentro de un único directorio. Por ejemplo, imagina un componente "acordeón" con la siguiente estructura de directorios:

```text
/resources/views/components/accordion.blade.php
/resources/views/components/accordion/item.blade.php
```

Esta estructura de directorio te permite representar el componente de acordeón y su elemento de la siguiente manera:

```blade
<x-accordion>
    <x-accordion.item>
        ...
    </x-accordion.item>
</x-accordion>
```

Sin embargo, para renderizar el componente de acordeón a través de `x-accordion`, nos vimos obligados a colocar la plantilla del componente de acordeón "índice" en el directorio `resources/views/components` en lugar de anidarla dentro del directorio `accordion` con las otras plantillas relacionadas con el acordeón.

Afortunadamente, Blade te permite colocar un archivo que coincida con el nombre del directorio del componente dentro del propio directorio del componente. Cuando esta plantilla existe, se puede representar como el elemento "raíz" del componente aunque esté anidada dentro de un directorio. Entonces, podemos continuar usando la misma sintaxis de Blade proporcionada en el ejemplo anterior; sin embargo, ajustaremos nuestra estructura de directorios así:

```text
/resources/views/components/accordion/accordion.blade.php
/resources/views/components/accordion/item.blade.php
```

<a id="data-properties-attributes"></a>
### Propiedades de datos / atributos

Dado que los componentes anónimos no tienen ninguna clase asociada, es posible que te preguntes cómo diferenciar qué datos deben pasarse al componente como variables y qué atributos deben colocarse en el [bolsa de atributos](#component-attributes).

Puedes especificar qué atributos deben considerarse variables de datos utilizando la directiva `@props` en la parte superior de la plantilla Blade de tu componente. Todos los demás atributos del componente estarán disponibles a través de la bolsa de atributos del componente. Si deseas darle a una variable de datos un valor predeterminado, puedes especificar el nombre de la variable como clave de array y el valor predeterminado como valor de array:

```blade
<!-- /resources/views/components/alert.blade.php -->

@props(['type' => 'info', 'message'])

<div {{ $attributes->merge(['class' => 'alert alert-'.$type]) }}>
    {{ $message }}
</div>
```

Dada la definición del componente anterior, podemos representar el componente así:

```blade
<x-alert type="error" :message="$message" class="mb-4"/>
```

<a id="accessing-parent-data"></a>
### Acceder a datos del componente padre

A veces es posible que desees acceder a datos de un componente principal dentro de un componente secundario. En estos casos, puedes utilizar la directiva `@aware`. Por ejemplo, imagina que estamos creando un componente de menú complejo que consta de un `<x-menu>` principal y un `<x-menu.item>` secundario:

```blade
<x-menu color="purple">
    <x-menu.item>...</x-menu.item>
    <x-menu.item>...</x-menu.item>
</x-menu>
```

El componente `<x-menu>` puede tener una implementación como la siguiente:

```blade
<!-- /resources/views/components/menu/index.blade.php -->

@props(['color' => 'gray'])

<ul {{ $attributes->merge(['class' => 'bg-'.$color.'-200']) }}>
    {{ $slot }}
</ul>
```

Debido a que la propiedad `color` solo se pasó al padre (`<x-menu>`), no estará disponible dentro de `<x-menu.item>`. Sin embargo, si utilizamos la directiva `@aware`, también podemos hacerla disponible dentro de `<x-menu.item>`:

```blade
<!-- /resources/views/components/menu/item.blade.php -->

@aware(['color' => 'gray'])

<li {{ $attributes->merge(['class' => 'text-'.$color.'-800']) }}>
    {{ $slot }}
</li>
```

> **Advertencia:**
> La directiva `@aware` no puede acceder a datos del padre que no se pasen explícitamente al componente padre mediante atributos HTML. Los valores predeterminados de `@props` que no se pasen explícitamente al componente padre no son accesibles mediante la directiva `@aware`.

<a id="anonymous-component-paths"></a>
### Rutas de componentes anónimos

Como se analizó anteriormente, los componentes anónimos generalmente se definen colocando una plantilla Blade dentro de tu directorio `resources/views/components`. Sin embargo, es posible que en ocasiones desees registrar otras rutas de componentes anónimos con Laravel además de la ruta predeterminada.

El método `anonymousComponentPath` acepta como primer argumento la "ruta" a la ubicación de los componentes anónimos y como segundo argumento un "espacio de nombres" opcional al que pertenecerán. Normalmente debes llamar a este método desde el método `boot` de uno de los [proveedores de servicios](../providers/) de tu aplicación:

```php
/**
 * Inicializar los servicios de la aplicación.
 */
public function boot(): void
{
    Blade::anonymousComponentPath(__DIR__.'/../components');
}
```

Cuando las rutas de los componentes se registran sin un prefijo específico, como en el ejemplo anterior, es posible que se representen en los componentes de Blade sin el prefijo correspondiente también. Por ejemplo, si existe un componente `panel.blade.php` en la ruta registrada anteriormente, se puede representar así:

```blade
<x-panel />
```

Puedes proporcionar un "espacio de nombres" como prefijo mediante el segundo argumento del método `anonymousComponentPath`:

```php
Blade::anonymousComponentPath(__DIR__.'/../components', 'dashboard');
```

Cuando se proporciona un prefijo, los componentes dentro de ese "espacio de nombres" se pueden representar anteponiendo el espacio de nombres del componente al nombre del componente cuando se representa el componente:

```blade
<x-dashboard::panel />
```

<a id="building-layouts"></a>
## Crear diseños

<a id="layouts-using-components"></a>
### Diseños con componentes

La mayoría de las aplicaciones web mantienen el mismo diseño general en varias páginas. Sería increíblemente engorroso y difícil mantener nuestra aplicación si tuviéramos que repetir todo el diseño HTML en cada vista que creemos. Afortunadamente, es conveniente definir este diseño como un único [componente Blade](#components) y luego usarlo en toda nuestra aplicación.

<a id="defining-the-layout-component"></a>
#### Definir el componente de diseño

Por ejemplo, imaginemos que estamos creando una aplicación de lista de "cosas por hacer". Podríamos definir un componente `layout` similar al siguiente:

```blade
<!-- resources/views/components/layout.blade.php -->

<html>
    <head>
        <title>{{ $title ?? 'Todo Manager' }}</title>
    </head>
    <body>
        <h1>Todos</h1>
        <hr/>
        {{ $slot }}
    </body>
</html>
```

<a id="applying-the-layout-component"></a>
#### Aplicar el componente de diseño

Una vez que se ha definido el componente `layout`, podemos crear una vista Blade que utilice el componente. En este ejemplo, definiremos una vista simple que muestra nuestra lista de tareas:

```blade
<!-- resources/views/tasks.blade.php -->

<x-layout>
    @foreach ($tasks as $task)
        <div>{{ $task }}</div>
    @endforeach
</x-layout>
```

Recuerda, el contenido que se inyecta en un componente se proporcionará a la variable `$slot` predeterminada dentro de nuestro componente `layout`. Como habrás notado, nuestro `layout` también respeta un slot `$title` si se proporciona uno; de lo contrario, se muestra un título predeterminado. Podemos inyectar un título personalizado desde nuestra vista de lista de tareas utilizando la sintaxis de slot estándar que se analiza en la [documentación del componente](#components):

```blade
<!-- resources/views/tasks.blade.php -->

<x-layout>
    <x-slot:title>
        Custom Title
    </x-slot>

    @foreach ($tasks as $task)
        <div>{{ $task }}</div>
    @endforeach
</x-layout>
```

Ahora que hemos definido nuestras vistas de diseño y lista de tareas, solo necesitamos devolver la vista `task` desde una ruta:

```php
use App\Models\Task;

Route::get('/tasks', function () {
    return view('tasks', ['tasks' => Task::all()]);
});
```

<a id="layouts-using-template-inheritance"></a>
### Diseños con herencia de plantillas

<a id="defining-a-layout"></a>
#### Definir un diseño

Los diseños también se pueden crear mediante "herencia de plantilla". Esta era la forma principal de crear aplicaciones antes de la introducción de [componentes](#components).

Para empezar, veamos un ejemplo sencillo. Primero, examinaremos el diseño de una página. Dado que la mayoría de las aplicaciones web mantienen el mismo diseño general en varias páginas, es conveniente definir este diseño como una única vista Blade:

```blade
<!-- resources/views/layouts/app.blade.php -->

<html>
    <head>
        <title>App Name - @yield('title')</title>
    </head>
    <body>
        @section('sidebar')
            This is the master sidebar.
        @show

        <div class="container">
            @yield('content')
        </div>
    </body>
</html>
```

Como puedes ver, este archivo contiene marcado HTML típico. Sin embargo, ten en cuenta las directivas `@section` y `@yield`. La directiva `@section`, como su nombre lo indica, define una sección de contenido, mientras que la directiva `@yield` se utiliza para mostrar el contenido de una sección determinada.

Ahora que hemos definido un diseño para nuestra aplicación, definamos una página secundaria que herede el diseño.

<a id="extending-a-layout"></a>
#### Extender un diseño

Al definir una vista secundaria, utiliza la directiva Blade `@extends` para especificar qué diseño debe "heredar" la vista secundaria. Las vistas que amplían un diseño Blade pueden inyectar contenido en las secciones del diseño utilizando directivas `@section`. Recuerda, como se ve en el ejemplo anterior, el contenido de estas secciones se mostrará en el diseño usando `@yield`:

```blade
<!-- resources/views/child.blade.php -->

@extends('layouts.app')

@section('title', 'Page Title')

@section('sidebar')
    @@parent

    <p>This is appended to the master sidebar.</p>
@endsection

@section('content')
    <p>This is my body content.</p>
@endsection
```

En este ejemplo, la sección `sidebar` utiliza la directiva `@@parent` para agregar (en lugar de sobrescribir) contenido a la barra lateral del diseño. La directiva `@@parent` será reemplazada por el contenido del diseño cuando se represente la vista.

> **Nota:**
> A diferencia del ejemplo anterior, esta sección `sidebar` termina con `@endsection` en lugar de `@show`. La directiva `@endsection` solo define una sección, mientras que `@show` define y **muestra inmediatamente** la sección.

La directiva `@yield` también acepta un valor predeterminado como segundo parámetro. Este valor se representará si la sección que se genera no está definida:

```blade
@yield('content', 'Default content')
```

<a id="forms"></a>
## Formularios

<a id="csrf-field"></a>
### Campo CSRF

Cada vez que definas un formulario HTML en tu aplicación, debes incluir un campo oculto con el token CSRF para que el middleware de [protección CSRF](../csrf/) pueda validar la solicitud. Puedes usar la directiva Blade `@csrf` para generar este campo:

```blade
<form method="POST" action="/profile">
    @csrf

    ...
</form>
```

<a id="method-field"></a>
### Campo de método

Dado que los formularios HTML no pueden realizar solicitudes `PUT`, `PATCH` o `DELETE`, deberás agregar un campo `_method` oculto para falsificar estos verbos HTTP. La directiva Blade `@method` puede crear este campo por ti:

```blade
<form action="/foo/bar" method="POST">
    @method('PUT')

    ...
</form>
```

<a id="validation-errors"></a>
### Errores de validación

La directiva `@error` se puede utilizar para comprobar rápidamente si existen [mensajes de error de validación](../validation/#quick-displaying-the-validation-errors) para un atributo determinado. Dentro de una directiva `@error`, puedes mostrar la variable `$message` para mostrar el mensaje de error:

```blade
<!-- /resources/views/post/create.blade.php -->

<label for="title">Post Title</label>

<input
    id="title"
    type="text"
    class="@error('title') is-invalid @enderror"
/>

@error('title')
    <div class="alert alert-danger">{{ $message }}</div>
@enderror
```

Dado que la directiva `@error` se compila en una declaración "if", puedes usar la directiva `@else` para representar contenido cuando no hay un error para un atributo:

```blade
<!-- /resources/views/auth.blade.php -->

<label for="email">Email address</label>

<input
    id="email"
    type="email"
    class="@error('email') is-invalid @else is-valid @enderror"
/>
```

Puedes pasar [el nombre de una bolsa de error específica](../validation/#named-error-bags) como segundo parámetro de la directiva `@error` para recuperar mensajes de error de validación en páginas que contienen varios formularios:

```blade
<!-- /resources/views/auth.blade.php -->

<label for="email">Email address</label>

<input
    id="email"
    type="email"
    class="@error('email', 'login') is-invalid @enderror"
/>

@error('email', 'login')
    <div class="alert alert-danger">{{ $message }}</div>
@enderror
```

<a id="stacks"></a>
## Pilas

Blade te permite añadir contenido a pilas con nombre que puedes renderizar en otra parte de una vista o diseño. Esto resulta especialmente útil para especificar las bibliotecas JavaScript que necesitan tus vistas hijas:

```blade
@push('scripts')
    <script src="/example.js"></script>
@endpush
```

Si deseas añadir contenido con `@push` cuando una expresión booleana se evalúe como `true`, puedes usar la directiva `@pushIf`:

```blade
@pushIf($shouldPush, 'scripts')
    <script src="/example.js"></script>
@endPushIf
```

Puedes añadir contenido a una pila tantas veces como necesites. Para renderizar todo su contenido, pasa el nombre de la pila a la directiva `@stack`:

```blade
<head>
    <!-- Head Contents -->

    @stack('scripts')
</head>
```

La directiva `@stack` representa el contenido que se ha enviado en el momento en que se alcanza. No se incluirá el contenido enviado posteriormente, como el de un componente representado bajo la directiva `@stack` en el mismo componente de diseño. Si necesitas realizar push desde dichos componentes, coloca la directiva `@stack` después de ellos, por ejemplo al final de la etiqueta `<body>`.

Si deseas anteponer contenido al comienzo de una pila, debes usar la directiva `@prepend`:

```blade
@push('scripts')
    This will be second...
@endpush

// Later...

@prepend('scripts')
    This will be first...
@endprepend
```

La directiva `@hasstack` se puede utilizar para determinar si una pila está vacía:

```blade
@hasstack('list')
    <ul>
        @stack('list')
    </ul>
@endif
```

<a id="service-injection"></a>
## Inyección de servicios

Puedes usar la directiva `@inject` para obtener un servicio del [contenedor de servicios](../container/) de Laravel. El primer argumento de `@inject` es el nombre de la variable que contendrá el servicio, mientras que el segundo es el nombre de la clase o interfaz del servicio que deseas resolver:

```blade
@inject('metrics', 'App\Services\MetricsService')

<div>
    Monthly Revenue: {{ $metrics->monthlyRevenue() }}.
</div>
```

<a id="rendering-inline-blade-templates"></a>
## Renderizar plantillas Blade en línea

A veces es posible que necesites transformar una cadena de plantilla Blade sin formato en HTML válido. Puedes lograr esto utilizando el método `render` proporcionado por la fachada `Blade`. El método `render` acepta la cadena de plantilla Blade y un array de datos opcional para proporcionar a la plantilla:

```php
use Illuminate\Support\Facades\Blade;

return Blade::render('Hello, {{ $name }}', ['name' => 'Julian Bashir']);
```

Laravel genera plantillas Blade en línea escribiéndolas en el directorio `storage/framework/views`. Si deseas que Laravel elimine estos archivos temporales después de renderizar la plantilla Blade, puedes proporcionar el argumento `deleteCachedView` al método:

```php
return Blade::render(
    'Hello, {{ $name }}',
    ['name' => 'Julian Bashir'],
    deleteCachedView: true
);
```

<a id="rendering-blade-fragments"></a>
## Renderizar fragmentos de Blade

Cuando usas frameworks de frontend como [Turbo](https://turbo.hotwired.dev/) y [htmx](https://htmx.org/), es posible que ocasionalmente necesites devolver solo una parte de una plantilla Blade dentro de tu respuesta HTTP. Los "fragmentos" de Blade te permiten hacer precisamente eso. Para comenzar, coloca una parte de tu plantilla Blade dentro de las directivas `@fragment` y `@endfragment`:

```blade
@fragment('user-list')
    <ul>
        @foreach ($users as $user)
            <li>{{ $user->name }}</li>
        @endforeach
    </ul>
@endfragment
```

Luego, al representar la vista que utiliza esta plantilla, puedes invocar el método `fragment` para especificar que solo se debe incluir el fragmento especificado en la respuesta HTTP saliente:

```php
return view('dashboard', ['users' => $users])->fragment('user-list');
```

El método `fragmentIf` te permite devolver condicionalmente un fragmento de una vista según una condición determinada. De lo contrario, se devolverá la vista completa:

```php
return view('dashboard', ['users' => $users])
    ->fragmentIf($request->hasHeader('HX-Request'), 'user-list');
```

Los métodos `fragments` y `fragmentsIf` te permiten devolver múltiples fragmentos de vista en la respuesta. Los fragmentos se concatenarán juntos:

```php
view('dashboard', ['users' => $users])
    ->fragments(['user-list', 'comment-list']);

view('dashboard', ['users' => $users])
    ->fragmentsIf(
        $request->hasHeader('HX-Request'),
        ['user-list', 'comment-list']
    );
```

<a id="extending-blade"></a>
## Extender Blade

Blade te permite definir tus propias directivas personalizadas utilizando el método `directive`. Cuando el compilador Blade encuentre la directiva personalizada, llamará al callback proporcionado con la expresión que contiene la directiva.

El siguiente ejemplo crea una directiva `@datetime($var)` que formatea un `$var` determinado, que debería ser una instancia de `DateTime`:

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Blade;
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
        Blade::directive('datetime', function (string $expression) {
            return "<?php echo ($expression)->format('m/d/Y H:i'); ?>";
        });
    }
}
```

Como puedes ver, encadenaremos el método `format` a cualquier expresión que se pase a la directiva. Entonces, en este ejemplo, el PHP final generado por esta directiva será:

```php
<?php echo ($var)->format('m/d/Y H:i'); ?>
```

> **Advertencia:**
> Después de actualizar la lógica de una directiva Blade, deberás eliminar todas las vistas Blade almacenadas en caché. Las vistas Blade almacenadas en caché se pueden eliminar usando el comando `view:clear` Artisan.

<a id="custom-echo-handlers"></a>
### Manejadores de salida personalizados

Si intentas mostrar un objeto usando Blade, se invocará el método `__toString` del objeto. El método [__toString](https://www.php.net/manual/en/language.oop5.magic.php#object.tostring) es uno de los "métodos mágicos" integrados de PHP. Sin embargo, a veces es posible que no tengas control sobre el método `__toString` de una clase determinada, como cuando la clase con la que estás interactuando pertenece a una biblioteca de terceros.

En estos casos, Blade te permite registrar un manejador de salida personalizado para ese tipo de objeto. Para ello, debes invocar el método `stringable` de Blade. El método `stringable` acepta una función anónima. Esta función anónima debe declarar el tipo del objeto que se encarga de renderizar. Normalmente debes invocar el método `stringable` dentro del método `boot` de la clase `AppServiceProvider` de tu aplicación:

```php
use Illuminate\Support\Facades\Blade;
use Money\Money;

/**
 * Inicializar los servicios de la aplicación.
 */
public function boot(): void
{
    Blade::stringable(function (Money $money) {
        return $money->formatTo('en_GB');
    });
}
```

Una vez que se haya definido tu manejador de salida personalizado, simplemente puedes mostrar el objeto en tu plantilla Blade:

```blade
Cost: {{ $money }}
```

<a id="custom-if-statements"></a>
### Sentencias if personalizadas

Programar una directiva personalizada a veces es más complejo de lo necesario cuando se definen declaraciones condicionales personalizadas y simples. Por ese motivo, Blade proporciona un método `Blade::if` que te permite definir rápidamente directivas condicionales personalizadas mediante funciones anónimas. Por ejemplo, definamos un condicional personalizado que verifique el "disco" predeterminado configurado para la aplicación. Esto lo podremos hacer en el método `boot` de nuestro `AppServiceProvider`:

```php
use Illuminate\Support\Facades\Blade;

/**
 * Inicializar los servicios de la aplicación.
 */
public function boot(): void
{
    Blade::if('disk', function (string $value) {
        return config('filesystems.default') === $value;
    });
}
```

Una vez que se haya definido el condicional personalizado, puedes usarlo dentro de tus plantillas:

```blade
@disk('local')
    <!-- The application is using the local disk... -->
@elsedisk('s3')
    <!-- The application is using the s3 disk... -->
@else
    <!-- The application is using some other disk... -->
@enddisk

@unlessdisk('local')
    <!-- The application is not using the local disk... -->
@enddisk
```
