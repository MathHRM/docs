---
title: "Validación"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Inicio rápido de validación](#validation-quickstart)
    - [Definición de las rutas](#quick-defining-the-routes)
    - [Creación del controlador](#quick-creating-the-controller)
    - [Escribir la lógica de validación](#quick-writing-the-validation-logic)
    - [Mostrar los errores de validación](#quick-displaying-the-validation-errors)
    - [Volver a completar formularios](#repopulating-forms)
    - [Una nota sobre los campos opcionales](#a-note-on-optional-fields)
    - [Formato de respuesta de error de validación](#validation-error-response-format)
- [Validación de solicitudes de formulario](#form-request-validation)
    - [Creación de solicitudes de formulario](#creating-form-requests)
    - [Autorización de solicitudes de formulario](#authorizing-form-requests)
    - [Personalización de los mensajes de error](#customizing-the-error-messages)
    - [Preparación de los datos de entrada para la validación](#preparing-input-for-validation)
- [Creación manual de validadores](#manually-creating-validators)
    - [Redirección automática](#automatic-redirection)
    - [Bolsas de errores con nombre](#named-error-bags)
    - [Personalización de los mensajes de error](#manual-customizing-the-error-messages)
    - [Realizar validación adicional](#performing-additional-validation)
- [Trabajar con entradas validadas](#working-with-validated-input)
- [Trabajar con mensajes de error](#working-with-error-messages)
    - [Especificación de mensajes personalizados en archivos de idioma](#specifying-custom-messages-in-language-files)
    - [Especificación de atributos en archivos de idioma](#specifying-attribute-in-language-files)
    - [Especificación de valores en archivos de idioma](#specifying-values-in-language-files)
- [Reglas de validación disponibles](#available-validation-rules)
    - [Constructores de reglas](#rule-builders)
- [Agregar reglas condicionalmente](#conditionally-adding-rules)
- [Validación de arrays](#validating-arrays)
    - [Validación de datos de entrada de arrays anidados](#validating-nested-array-input)
    - [Índices y posiciones de mensajes de error](#error-message-indexes-and-positions)
- [Validación de archivos](#validating-files)
- [Validación de contraseñas](#validating-passwords)
- [Reglas de validación personalizadas](#custom-validation-rules)
    - [Uso de objetos de regla](#using-rule-objects)
    - [Uso de funciones anónimas](#using-closures)
    - [Reglas implícitas](#implicit-rules)

<a id="introduction"></a>
## Introducción

Laravel proporciona varios enfoques diferentes para validar los datos entrantes de tu aplicación. Lo más común es utilizar el método `validate` disponible en todas las solicitudes HTTP entrantes. Sin embargo, también discutiremos otros enfoques de validación.

Laravel incluye una amplia variedad de reglas de validación convenientes que puedes aplicar a los datos, incluso brinda la capacidad de validar si los valores son únicos en una tabla de base de datos determinada. Cubriremos cada una de estas reglas de validación en detalle para que te familiarices con todas las funciones de validación de Laravel.

<a id="validation-quickstart"></a>
## Inicio rápido de validación

Para conocesr las potentes funciones de validación de Laravel, veamos un ejemplo completo de cómo validar un formulario y mostrar los mensajes de error al usuario. Al leer esta descripción general de alto nivel, podrá obtener una buena comprensión general de cómo validar los datos de solicitudes entrantes usando Laravel:

<a id="quick-defining-the-routes"></a>
### Definición de las rutas

Primero, supongamos que tenemos las siguientes rutas definidas en nuestro archivo `routes/web.php`:

```php
use App\Http\Controllers\PostController;

Route::get('/post/create', [PostController::class, 'create']);
Route::post('/post', [PostController::class, 'store']);
```

La ruta `GET` mostrará un formulario para que el usuario cree una nueva publicación de blog, mientras que la ruta `POST` almacenará la nueva publicación de blog en la base de datos.

<a id="quick-creating-the-controller"></a>
### Creación del controlador

A continuación, echemos un vistazo a un controlador simple que maneja las solicitudes entrantes a estas rutas. Dejaremos el método `store` vacío por ahora:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class PostController extends Controller
{
    /**
     * Show the form to create a new blog post.
     */
    public function create(): View
    {
        return view('post.create');
    }

    /**
     * Store a new blog post.
     */
    public function store(Request $request): RedirectResponse
    {
        // Validate and store the blog post...

        $post = /** ... */

        return to_route('post.show', ['post' => $post->id]);
    }
}
```

<a id="quick-writing-the-validation-logic"></a>
### Escribir la lógica de validación

Ahora estamos listos para completar nuestro método `store` con la lógica para validar la nueva publicación del blog. Para ello utilizaremos el método `validate` proporcionado por el objeto `Illuminate\Http\Request`. Si se cumplen las reglas de validación, tu código seguirá ejecutándose normalmente; sin embargo, si la validación falla, se generará una excepción `Illuminate\Validation\ValidationException` y se enviará automáticamente al usuario la respuesta de error adecuada.

Si la validación falla durante una solicitud HTTP tradicional, se generará una respuesta de redireccionamiento a la URL anterior. Si la solicitud entrante es una solicitud XHR, se devolverá una [respuesta JSON que contiene los mensajes de error de validación](#validation-error-response-format).

Para comprender mejor el método `validate`, volvamos al método `store`:

```php
/**
 * Store a new blog post.
 */
public function store(Request $request): RedirectResponse
{
    $validated = $request->validate([
        'title' => ['required', 'unique:posts', 'max:255'],
        'body' => ['required'],
    ]);

    // The blog post is valid...

    return redirect('/posts');
}
```

Como puedes ver, las reglas de validación se pasan al método `validate`. No te preocupes: todas las reglas de validación disponibles están [documentadas](#available-validation-rules). Nuevamente, si la validación falla, se generará automáticamente la respuesta adecuada. Si la validación se supera, nuestro controlador continuará ejecutándose normalmente.

Además, puedes utilizar el método `validateWithBag` para validar una solicitud y almacenar cualquier mensaje de error dentro de una [bolsa de errores con nombre](#named-error-bags):

```php
$validated = $request->validateWithBag('post', [
    'title' => ['required', 'unique:posts', 'max:255'],
    'body' => ['required'],
]);
```

<a id="stopping-on-first-validation-failure"></a>
#### Detenerse ante el primer error de validación

A veces es posible que desees dejar de ejecutar reglas de validación en un atributo después del primer error de validación. Para ello, asigna la regla `bail` al atributo:

```php
$request->validate([
    'title' => ['bail', 'required', 'unique:posts', 'max:255'],
    'body' => ['required'],
]);
```

En este ejemplo, si falla la regla `unique` en el atributo `title`, no se verificará la regla `max`. Las reglas se validarán en el orden en que se asignen.

<a id="a-note-on-nested-attributes"></a>
#### Una nota sobre los atributos anidados

Si la solicitud HTTP entrante contiene datos de campos "anidados", puedes especificar estos campos en tus reglas de validación usando la sintaxis de "punto":

```php
$request->validate([
    'title' => ['required', 'unique:posts', 'max:255'],
    'author.name' => ['required'],
    'author.description' => ['required'],
]);
```

Por otro lado, si el nombre de tu campo contiene un punto literal, puedes evitar explícitamente que esto se interprete como una sintaxis de "punto" escapando el punto con una barra invertida:

```php
$request->validate([
    'title' => ['required', 'unique:posts', 'max:255'],
    'v1\.0' => ['required'],
]);
```

<a id="quick-displaying-the-validation-errors"></a>
### Mostrar los errores de validación

Entonces, ¿qué pasa si los campos de solicitud entrantes no pasan las reglas de validación dadas? Como se mencionó anteriormente, Laravel redirigirá automáticamente al usuario a su ubicación anterior. Además, todos los errores de validación y [datos de entrada de la solicitud](../requests/#retrieving-old-input) se [guardarán temporalmente en la sesión](../session/#flash-data).

El middleware `Illuminate\View\Middleware\ShareErrorsFromSession`, proporcionado por el grupo de middleware `web`, comparte una variable `$errors` con todas las vistas de tu aplicación. Cuando se aplica este middleware, siempre habrá una variable `$errors` disponible en tus vistas, lo que te permitirá asumir cómodamente que la variable `$errors` siempre está definida y se puede utilizar de forma segura. La variable `$errors` será una instancia de `Illuminate\Support\MessageBag`. Para obtener más información sobre cómo trabajar con este objeto, [consulta su documentación](#working-with-error-messages).

Entonces, en nuestro ejemplo, el usuario será redirigido al método `create` de nuestro controlador cuando falle la validación, lo que nos permitirá mostrar los mensajes de error en la vista:

```blade
<!-- /resources/views/post/create.blade.php -->

<h1>Create Post</h1>

@if ($errors->any())
    <div class="alert alert-danger">
        <ul>
            @foreach ($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
@endif

<!-- Create Post Form -->
```

<a id="quick-customizing-the-error-messages"></a>
#### Personalización de los mensajes de error

Cada una de las reglas de validación integradas de Laravel tiene un mensaje de error que se encuentra en el archivo `lang/en/validation.php` de tu aplicación. Si tu aplicación no tiene un directorio `lang`, puedes indicarle a Laravel que lo cree usando el comando Artisan `lang:publish`.

Dentro del archivo `lang/en/validation.php`, encontrará una entrada de traducción para cada regla de validación. Puedes cambiar o modificar estos mensajes según las necesidades de tu aplicación.

Además, puedes copiar este archivo a otro directorio de idioma para traducir los mensajes al idioma de tu aplicación. Para obtener más información sobre la localización de Laravel, consulta la [documentación de localización](../localization/).

> **Advertencia:**
> De forma predeterminada, el esqueleto de la aplicación Laravel no incluye el directorio `lang`. Si deseas personalizar los archivos de idioma de Laravel, puedes publicarlos mediante el comando Artisan `lang:publish`.

<a id="quick-xhr-requests-and-validation"></a>
#### Solicitudes XHR y validación

En este ejemplo, utilizamos un formulario tradicional para enviar datos a la aplicación. Sin embargo, muchas aplicaciones reciben solicitudes XHR desde una interfaz con JavaScript. Cuando se utiliza el método `validate` durante una solicitud XHR, Laravel no generará una respuesta de redireccionamiento. En cambio, Laravel genera una [respuesta JSON que contiene todos los errores de validación](#validation-error-response-format). Esta respuesta JSON se enviará con un código de estado HTTP 422.

<a id="the-at-error-directive"></a>
#### La directiva `@error`

Puedes utilizar la directiva `@error` [Blade](../blade/) para determinar rápidamente si existen mensajes de error de validación para un atributo determinado. Dentro de una directiva `@error`, puedes imprimir la variable `$message` para mostrar el mensaje de error:

```blade
<!-- /resources/views/post/create.blade.php -->

<label for="title">Post Title</label>

<input
    id="title"
    type="text"
    name="title"
    class="@error('title') is-invalid @enderror"
/>

@error('title')
    <div class="alert alert-danger">{{ $message }}</div>
@enderror
```

Si estás utilizando [bolsas de error con nombre](#named-error-bags), puedes pasar el nombre de la bolsa de error como segundo argumento de la directiva `@error`:

```blade
<input ... class="@error('title', 'post') is-invalid @enderror">
```

<a id="repopulating-forms"></a>
### Volver a completar formularios

Cuando Laravel genera una respuesta de redireccionamiento debido a un error de validación, el framework [guardará temporalmente todos los datos de entrada de la solicitud en la sesión](../session/#flash-data). Esto se hace para que puedas acceder cómodamente a la entrada durante la siguiente solicitud y volver a completar el formulario que el usuario intentó enviar.

Para recuperar los datos de entrada guardados temporalmente de la solicitud anterior, invoca el método `old` en una instancia de `Illuminate\Http\Request`. El método `old` extraerá los datos de entrada guardados temporalmente de la [sesión](../session/):

```php
$title = $request->old('title');
```

Laravel también proporciona un helper global `old`. Si muestras datos de entrada anteriores dentro de una [plantilla Blade](../blade/), es más conveniente utilizar el helper `old` para volver a llenar el formulario. Si no existe ninguna dato de entrada anterior para el campo dado, se devolverá `null`:

```blade
<input type="text" name="title" value="{{ old('title') }}">
```

<a id="a-note-on-optional-fields"></a>
### Una nota sobre los campos opcionales

De forma predeterminada, Laravel incluye el middleware `TrimStrings` y `ConvertEmptyStringsToNull` en la pila de middleware global de tu aplicación. Debido a esto, a menudo necesitarás marcar tus campos de solicitud "opcionales" como `nullable` si no deseas que el validador considere los valores de `null` como no válidos. Por ejemplo:

```php
$request->validate([
    'title' => ['required', 'unique:posts', 'max:255'],
    'body' => ['required'],
    'publish_at' => ['nullable', 'date'],
]);
```

En este ejemplo, especificamos que el campo `publish_at` puede ser `null` o una representación de fecha válida. Si el modificador `nullable` no se agrega a la definición de la regla, el validador considerará que `null` es una fecha no válida.

<a id="validation-error-response-format"></a>
### Formato de respuesta de error de validación

Cuando tu aplicación genera una excepción `Illuminate\Validation\ValidationException` y la solicitud HTTP entrante espera una respuesta JSON, Laravel formateará automáticamente los mensajes de error y devolverá una respuesta HTTP `422 Unprocessable Entity`.

A continuación, puedes revisar un ejemplo del formato de respuesta JSON para errores de validación. Ten en cuenta que las claves de error anidadas se aplanan en formato de notación de "puntos":

```json
{
    "message": "The team name field must be a string. (and 4 more errors)",
    "errors": {
        "team_name": [
            "The team name field must be a string.",
            "The team name field must be at least 1 characters."
        ],
        "authorization.role": [
            "The selected authorization.role is invalid."
        ],
        "users.0.email": [
            "The users.0.email field is required."
        ],
        "users.2.email": [
            "The users.2.email field must be a valid email address."
        ]
    }
}
```

<a id="form-request-validation"></a>
## Validación de solicitudes de formulario

<a id="creating-form-requests"></a>
### Creación de solicitudes de formulario

Para escenarios de validación más complejos, es posible que desees crear una "solicitud de formulario". Las solicitudes de formulario son clases de solicitud personalizadas que encapsulan su propia lógica de validación y autorización. Para crear una clase de solicitud de formulario, puedes utilizar el comando de la CLI de Artisan `make:request`:

```shell
php artisan make:request StorePostRequest
```

La clase de solicitud de formulario generada se colocará en el directorio `app/Http/Requests`. Si este directorio no existe, se creará cuando ejecutes el comando `make:request`. Cada solicitud de formulario generada por Laravel tiene dos métodos: `authorize` y `rules`.

Como habrás deducido, el método `authorize` es responsable de determinar si el usuario actualmente autenticado puede realizar la acción representada por la solicitud, mientras que el método `rules` devuelve las reglas de validación que deben aplicarse a los datos de la solicitud:

```php
/**
 * Get the validation rules that apply to the request.
 *
 * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
 */
public function rules(): array
{
    return [
        'title' => ['required', 'unique:posts', 'max:255'],
        'body' => ['required'],
    ];
}
```

> **Nota:**
> Puedes declarar los tipos de las dependencias que necesites en la firma del método `rules`. Se resolverán automáticamente mediante el [contenedor de servicios](../container/) de Laravel.

Entonces, ¿cómo se evalúan las reglas de validación? Solo necesitas declarar el tipo de la solicitud en el método de tu controlador. La solicitud del formulario entrante se valida antes de llamar al método del controlador, lo que significa que no necesitas saturar tu controlador con ninguna lógica de validación:

```php
/**
 * Store a new blog post.
 */
public function store(StorePostRequest $request): RedirectResponse
{
    // The incoming request is valid...

    // Retrieve the validated input data...
    $validated = $request->validated();

    // Retrieve a portion of the validated input data...
    $validated = $request->safe()->only(['name', 'email']);
    $validated = $request->safe()->except(['name', 'email']);

    // Store the blog post...

    return redirect('/posts');
}
```

Si la validación falla, se generará una respuesta de redireccionamiento para enviar al usuario de regreso a su ubicación anterior. Los errores también se guardarán temporalmente en la sesión para que estén disponibles para su visualización. Si la solicitud fue una solicitud XHR, se devolverá al usuario una respuesta HTTP con un código de estado 422 que incluye una [representación JSON de los errores de validación](#validation-error-response-format).

> **Nota:**
> ¿Necesitas agregar validación de solicitud de formulario en tiempo real a tu frontend de Laravel con Inertia? Consulta [Laravel Precognition](../precognition/).

<a id="performing-additional-validation-on-form-requests"></a>
#### Validación adicional

A veces es necesario realizar una validación adicional una vez completada la validación inicial. Puedes lograr esto utilizando el método `after` de la solicitud de formulario.

El método `after` debe devolver un array de invocables o funciones anónimas que se invocarán una vez completada la validación. Los invocables proporcionados recibirán una instancia `Illuminate\Validation\Validator`, lo que te permitirá generar mensajes de error adicionales si es necesario:

```php
use Illuminate\Validation\Validator;

/**
 * Get the "after" validation callables for the request.
 */
public function after(): array
{
    return [
        function (Validator $validator) {
            if ($this->somethingElseIsInvalid()) {
                $validator->errors()->add(
                    'field',
                    'Something is wrong with this field!'
                );
            }
        }
    ];
}
```

Como se señaló, el array devuelto por el método `after` también puede contener clases invocables. El método `__invoke` de estas clases recibirá una instancia `Illuminate\Validation\Validator`:

```php
use App\Validation\ValidateShippingTime;
use App\Validation\ValidateUserStatus;
use Illuminate\Validation\Validator;

/**
 * Get the "after" validation callables for the request.
 */
public function after(): array
{
    return [
        new ValidateUserStatus,
        new ValidateShippingTime,
        function (Validator $validator) {
            //
        }
    ];
}
```

<a id="request-stopping-on-first-validation-rule-failure"></a>
#### Detenerse ante el primer error de validación

Al agregar el atributo `StopOnFirstFailure` a tu clase de solicitud, puedes informar al validador que debe dejar de validar todos los atributos una vez que se haya producido un único error de validación:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\Attributes\StopOnFirstFailure;
use Illuminate\Foundation\Http\FormRequest;

#[StopOnFirstFailure]
class StorePostRequest extends FormRequest
{
    // ...
}
```

<a id="request-failing-on-unknown-fields"></a>
#### Rechazar campos desconocidos

Al agregar el atributo `FailOnUnknownFields` a tu clase de solicitud, puedes indicarle a Laravel que rechace cualquier campo entrante que no esté definido por las reglas de validación de tu solicitud:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\Attributes\FailOnUnknownFields;
use Illuminate\Foundation\Http\FormRequest;

#[FailOnUnknownFields]
class StorePostRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'title' => ['required', 'string'],
            'body' => ['required', 'string'],
        ];
    }
}
```

También puedes habilitar este comportamiento globalmente para todas las solicitudes de formulario desde tu `AppServiceProvider`:

```php
use Illuminate\Foundation\Http\FormRequest;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    FormRequest::failOnUnknownFields();
}
```

Si es necesario, puedes desactivar este comportamiento para una solicitud específica pasando `false` al atributo:

```php
#[FailOnUnknownFields(false)]
class PublicWebhookRequest extends FormRequest
{
    // ...
}
```

Rechazar campos desconocidos puede brindar protección adicional contra problemas de estilo de asignación masiva al evitar que claves de entrada inesperadas fluyan más profundamente en tu aplicación. Sin embargo, aún debes configurar las propiedades `$fillable` / `$guarded` de tu modelo y conservar solo las entradas validadas y confiables.

<a id="customizing-the-redirect-location"></a>
#### Personalización de la ubicación de redireccionamiento

Cuando falla la validación de la solicitud del formulario, se generará una respuesta de redireccionamiento para enviar al usuario de regreso a su ubicación anterior. Sin embargo, puedes personalizar este comportamiento. Para hacerlo, puedes utilizar el atributo `RedirectTo` en tu solicitud de formulario:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\Attributes\RedirectTo;
use Illuminate\Foundation\Http\FormRequest;

#[RedirectTo('/dashboard')]
class StorePostRequest extends FormRequest
{
    // ...
}
```

O, si deseas redirigir a los usuarios a una ruta con nombre, puedes utilizar el atributo `RedirectToRoute` en su lugar:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\Attributes\RedirectToRoute;
use Illuminate\Foundation\Http\FormRequest;

#[RedirectToRoute('dashboard')]
class StorePostRequest extends FormRequest
{
    // ...
}
```

<a id="customizing-the-error-bag"></a>
#### Personalización de la bolsa de errores

Cuando falla la validación de la solicitud de formulario, los errores se guardan temporalmente en la bolsa de errores `default`. Si necesitas almacenar los errores en una [bolsa de errores con nombre](#named-error-bags) diferente, puedes usar el atributo `ErrorBag` en tu solicitud de formulario:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\Attributes\ErrorBag;
use Illuminate\Foundation\Http\FormRequest;

#[ErrorBag('login')]
class LoginRequest extends FormRequest
{
    // ...
}
```

<a id="authorizing-form-requests"></a>
### Autorización de solicitudes de formulario

La clase de solicitud de formulario también contiene un método `authorize`. Con este método, puedes determinar si el usuario autenticado realmente tiene la autoridad para actualizar un recurso determinado. Por ejemplo, puedes determinar si un usuario realmente posee un comentario de blog que está intentando actualizar. Lo más probable es que interactúes con tus [puertas de autorización y políticas](../authorization/) mediante este método:

```php
use App\Models\Comment;

/**
 * Determine if the user is authorized to make this request.
 */
public function authorize(): bool
{
    $comment = Comment::find($this->route('comment'));

    return $comment && $this->user()->can('update', $comment);
}
```

Dado que todas las solicitudes de formulario extienden la clase de solicitud base de Laravel, podemos usar el método `user` para acceder al usuario actualmente autenticado. Además, observa la llamada al método `route` en el ejemplo anterior. Este método te otorga acceso a los parámetros de URI definidos en la ruta que se llama, como el parámetro `{comment}` en el siguiente ejemplo:

```php
Route::post('/comment/{comment}');
```

Por lo tanto, si tu aplicación aprovecha [vinculación de modelos de ruta](../routing/#route-model-binding), tu código puede ser aún más conciso accediendo al modelo resuelto como propiedad de la solicitud:

```php
return $this->user()->can('update', $this->comment);
```

Si el método `authorize` devuelve `false`, se devolverá automáticamente una respuesta HTTP con un código de estado 403 y tu método de controlador no se ejecutará.

Si planeas manejar la lógica de autorización para la solicitud en otra parte de tu aplicación, puedes eliminar el método `authorize` por completo o simplemente devolver `true`:

```php
/**
 * Determine if the user is authorized to make this request.
 */
public function authorize(): bool
{
    return true;
}
```

> **Nota:**
> Puedes declarar los tipos de las dependencias que necesites en la firma del método `authorize`. Se resolverán automáticamente mediante el [contenedor de servicios](../container/) de Laravel.

<a id="customizing-the-error-messages"></a>
### Personalización de los mensajes de error

Puedes personalizar los mensajes de error utilizados por la solicitud del formulario sobrescribiendo el método `messages`. Este método debería devolver un array de pares de atributo/regla y sus correspondientes mensajes de error:

```php
/**
 * Get the error messages for the defined validation rules.
 *
 * @return array<string, string>
 */
public function messages(): array
{
    return [
        'title.required' => 'A title is required',
        'body.required' => 'A message is required',
    ];
}
```

<a id="customizing-the-validation-attributes"></a>
#### Personalización de los atributos de validación

Muchos de los mensajes de error de las reglas de validación integradas de Laravel contienen un marcador de posición `:attribute`. Si deseas reemplazar el marcador de posición `:attribute` de tu mensaje de validación con un nombre de atributo personalizado, puedes especificar los nombres personalizados sobrescribiendo el método `attributes`. Este método debería devolver un array de pares de atributo/nombre:

```php
/**
 * Get custom attributes for validator errors.
 *
 * @return array<string, string>
 */
public function attributes(): array
{
    return [
        'email' => 'email address',
    ];
}
```

<a id="preparing-input-for-validation"></a>
### Preparación de los datos de entrada para la validación

Si necesitas preparar o sanear algún dato de la solicitud antes de aplicar tus reglas de validación, puedes utilizar el método `prepareForValidation`:

```php
use Illuminate\Support\Str;

/**
 * Prepare the data for validation.
 */
protected function prepareForValidation(): void
{
    $this->merge([
        'slug' => Str::slug($this->slug),
    ]);
}
```

Del mismo modo, si necesitas normalizar cualquier dato de la solicitud una vez completada la validación, puedes utilizar el método `passedValidation`:

```php
/**
 * Handle a passed validation attempt.
 */
protected function passedValidation(): void
{
    $this->replace(['name' => 'Taylor']);
}
```

<a id="manually-creating-validators"></a>
## Creación manual de validadores

Si no deseas utilizar el método `validate` en la solicitud, puedes crear una instancia de validador manualmente utilizando la [fachada](../facades/) `Validator`. El método `make` en la fachada genera una nueva instancia de validador:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PostController extends Controller
{
    /**
     * Store a new blog post.
     */
    public function store(Request $request): RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => ['required', 'unique:posts', 'max:255'],
            'body' => ['required'],
        ]);

        if ($validator->fails()) {
            return redirect('/post/create')
                ->withErrors($validator)
                ->withInput();
        }

        // Retrieve the validated input...
        $validated = $validator->validated();

        // Retrieve a portion of the validated input...
        $validated = $validator->safe()->only(['name', 'email']);
        $validated = $validator->safe()->except(['name', 'email']);

        // Store the blog post...

        return redirect('/posts');
    }
}
```

El primer argumento pasado al método `make` son los datos bajo validación. El segundo argumento es un array de reglas de validación que deben aplicarse a los datos.

Después de determinar si la validación de la solicitud falló, puedes usar el método `withErrors` para guardar temporalmente los mensajes de error en la sesión. Al utilizar este método, la variable `$errors` se compartirá automáticamente con tus vistas después de la redirección, lo que te permitirá mostrárselas fácilmente al usuario. El método `withErrors` acepta un validador, un `MessageBag` o un `array` de PHP.

#### Detenerse ante el primer error de validación

El método `stopOnFirstFailure` informará al validador que debe dejar de validar todos los atributos una vez que se haya producido un único error de validación:

```php
if ($validator->stopOnFirstFailure()->fails()) {
    // ...
}
```

<a id="automatic-redirection"></a>
### Redirección automática

Si deseas crear una instancia de validador manualmente pero aún así aprovechar la redirección automática que ofrece el método `validate` de la solicitud HTTP, puedes llamar al método `validate` en una instancia de validador existente. Si la validación falla, el usuario será redirigido automáticamente o, en el caso de una solicitud XHR, se devolverá una [respuesta JSON](#validation-error-response-format):

```php
Validator::make($request->all(), [
    'title' => ['required', 'unique:posts', 'max:255'],
    'body' => ['required'],
])->validate();
```

Puedes utilizar el método `validateWithBag` para almacenar los mensajes de error en una [bolsa de errores con nombre](#named-error-bags) si la validación falla:

```php
Validator::make($request->all(), [
    'title' => ['required', 'unique:posts', 'max:255'],
    'body' => ['required'],
])->validateWithBag('post');
```

<a id="named-error-bags"></a>
### Bolsas de errores con nombre

Si tienes varios formularios en una sola página, es posible que desees nombrar el `MessageBag` que contiene los errores de validación, lo que te permitirá recuperar los mensajes de error de un formulario específico. Para lograr esto, pasa un nombre como segundo argumento a `withErrors`:

```php
return redirect('/register')->withErrors($validator, 'login');
```

Luego podrá acceder a la instancia denominada `MessageBag` desde la variable `$errors`:

```blade
{{ $errors->login->first('email') }}
```

<a id="manual-customizing-the-error-messages"></a>
### Personalización de los mensajes de error

Si es necesario, puedes proporcionar mensajes de error personalizados que una instancia de validador debería usar en lugar de los mensajes de error predeterminados proporcionados por Laravel. Hay varias formas de especificar mensajes personalizados. Primero, puedes pasar los mensajes personalizados como tercer argumento al método `Validator::make`:

```php
$validator = Validator::make($input, $rules, $messages = [
    'required' => 'The :attribute field is required.',
]);
```

En este ejemplo, el marcador de posición `:attribute` se reemplazará por el nombre real del campo bajo validación. También puedes utilizar otros marcadores de posición en los mensajes de validación. Por ejemplo:

```php
$messages = [
    'same' => 'The :attribute and :other must match.',
    'size' => 'The :attribute must be exactly :size.',
    'between' => 'The :attribute value :input is not between :min - :max.',
    'in' => 'The :attribute must be one of the following types: :values',
];
```

<a id="specifying-a-custom-message-for-a-given-attribute"></a>
#### Especificación de un mensaje personalizado para un atributo determinado

A veces es posible que desees especificar un mensaje de error personalizado solo para un atributo específico. Puedes hacerlo utilizando la notación de "puntos". Especifica primero el nombre del atributo, seguido de la regla:

```php
$messages = [
    'email.required' => 'We need to know your email address!',
];
```

<a id="specifying-custom-attribute-values"></a>
#### Especificación de valores de atributos personalizados

Muchos de los mensajes de error integrados de Laravel incluyen un marcador de posición `:attribute` que se reemplaza con el nombre del campo o atributo bajo validación. Para personalizar los valores utilizados para reemplazar estos marcadores de posición para campos específicos, puedes pasar un array de atributos personalizados como cuarto argumento del método `Validator::make`:

```php
$validator = Validator::make($input, $rules, $messages, [
    'email' => 'email address',
]);
```

<a id="performing-additional-validation"></a>
### Realizar validación adicional

A veces es necesario realizar una validación adicional una vez completada la validación inicial. Puedes lograr esto utilizando el método `after` del validador. El método `after` acepta una función anónima o un array de invocables que se invocarán una vez completada la validación. Los invocables proporcionados recibirán una instancia `Illuminate\Validation\Validator`, lo que te permitirá generar mensajes de error adicionales si es necesario:

```php
use Illuminate\Support\Facades\Validator;

$validator = Validator::make(/* ... */);

$validator->after(function ($validator) {
    if ($this->somethingElseIsInvalid()) {
        $validator->errors()->add(
            'field', 'Something is wrong with this field!'
        );
    }
});

if ($validator->fails()) {
    // ...
}
```

Como se señaló, el método `after` también acepta un array de invocables, lo cual es particularmente conveniente si tu lógica "después de la validación" está encapsulada en clases invocables, que recibirán una instancia `Illuminate\Validation\Validator` a través de su método `__invoke`:

```php
use App\Validation\ValidateShippingTime;
use App\Validation\ValidateUserStatus;

$validator->after([
    new ValidateUserStatus,
    new ValidateShippingTime,
    function ($validator) {
        // ...
    },
]);
```

<a id="working-with-validated-input"></a>
## Trabajar con entradas validadas

Después de validar los datos de la solicitud entrante mediante una solicitud de formulario o una instancia de validador creada manualmente, es posible que desees recuperar los datos de la solicitud entrante que realmente se sometieron a validación. Esto se puede lograr de varias maneras. Primero, puedes llamar al método `validated` en una solicitud de formulario o instancia de validador. Este método devuelve un array de los datos que se validaron:

```php
$validated = $request->validated();

$validated = $validator->validated();
```

Alternativamente, puedes llamar al método `safe` en una solicitud de formulario o instancia de validador. Este método devuelve una instancia de `Illuminate\Support\ValidatedInput`. Este objeto expone los métodos `only`, `except` y `all` para recuperar un subconjunto de los datos validados o el array completo de datos validados:

```php
$validated = $request->safe()->only(['name', 'email']);

$validated = $request->safe()->except(['name', 'email']);

$validated = $request->safe()->all();
```

Además, la instancia `Illuminate\Support\ValidatedInput` se puede iterar y acceder a ella como un array:

```php
// Validated data may be iterated...
foreach ($request->safe() as $key => $value) {
    // ...
}

// Validated data may be accessed as an array...
$validated = $request->safe();

$email = $validated['email'];
```

Si deseas agregar campos adicionales a los datos validados, puedes llamar al método `merge`:

```php
$validated = $request->safe()->merge(['name' => 'Taylor Otwell']);
```

Si deseas recuperar los datos validados como una instancia de [colección](../collections/), puedes llamar al método `collect`:

```php
$collection = $request->safe()->collect();
```

<a id="working-with-error-messages"></a>
## Trabajar con mensajes de error

Después de llamar al método `errors` en una instancia `Validator`, recibirá una instancia `Illuminate\Support\MessageBag`, que tiene una variedad de métodos convenientes para trabajar con mensajes de error. La variable `$errors` que está disponible automáticamente para todas las vistas también es una instancia de la clase `MessageBag`.

<a id="retrieving-the-first-error-message-for-a-field"></a>
#### Recuperar el primer mensaje de error de un campo

Para recuperar el primer mensaje de error para un campo determinado, utiliza el método `first`:

```php
$errors = $validator->errors();

echo $errors->first('email');
```

<a id="retrieving-all-error-messages-for-a-field"></a>
#### Recuperar todos los mensajes de error de un campo

Si necesitas recuperar un array de todos los mensajes de un campo determinado, utiliza el método `get`:

```php
foreach ($errors->get('email') as $message) {
    // ...
}
```

Si estás validando un campo de formulario de array, puedes recuperar todos los mensajes para cada uno de los elementos del array utilizando el carácter `*`:

```php
foreach ($errors->get('attachments.*') as $message) {
    // ...
}
```

<a id="retrieving-all-error-messages-for-all-fields"></a>
#### Recuperar todos los mensajes de error para todos los campos

Para recuperar un array de todos los mensajes para todos los campos, utiliza el método `all`:

```php
foreach ($errors->all() as $message) {
    // ...
}
```

<a id="determining-if-messages-exist-for-a-field"></a>
#### Determinar si existen mensajes para un campo

El método `has` se puede utilizar para determinar si existe algún mensaje de error para un campo determinado:

```php
if ($errors->has('email')) {
    // ...
}
```

<a id="specifying-custom-messages-in-language-files"></a>
### Especificación de mensajes personalizados en archivos de idioma

Cada una de las reglas de validación integradas de Laravel tiene un mensaje de error que se encuentra en el archivo `lang/en/validation.php` de tu aplicación. Si tu aplicación no tiene un directorio `lang`, puedes indicarle a Laravel que lo cree usando el comando Artisan `lang:publish`.

Dentro del archivo `lang/en/validation.php`, encontrará una entrada de traducción para cada regla de validación. Puedes cambiar o modificar estos mensajes según las necesidades de tu aplicación.

Además, puedes copiar este archivo a otro directorio de idioma para traducir los mensajes al idioma de tu aplicación. Para obtener más información sobre la localización de Laravel, consulta la [documentación de localización](../localization/).

> **Advertencia:**
> De forma predeterminada, el esqueleto de la aplicación Laravel no incluye el directorio `lang`. Si deseas personalizar los archivos de idioma de Laravel, puedes publicarlos mediante el comando Artisan `lang:publish`.

<a id="custom-messages-for-specific-attributes"></a>
#### Mensajes personalizados para atributos específicos

Puedes personalizar los mensajes de error utilizados para combinaciones de reglas y atributos específicos dentro de los archivos de idioma de validación de tu aplicación. Para hacerlo, agrega las personalizaciones de tus mensajes al array `custom` del archivo de idioma `lang/xx/validation.php` de tu aplicación:

```php
'custom' => [
    'email' => [
        'required' => 'We need to know your email address!',
        'max' => 'Your email address is too long!'
    ],
],
```

<a id="specifying-attribute-in-language-files"></a>
### Especificación de atributos en archivos de idioma

Muchos de los mensajes de error integrados de Laravel incluyen un marcador de posición `:attribute` que se reemplaza con el nombre del campo o atributo bajo validación. Si deseas que la parte `:attribute` de tu mensaje de validación se reemplace con un valor personalizado, puedes especificar el nombre del atributo personalizado en el array `attributes` de tu archivo de idioma `lang/xx/validation.php`:

```php
'attributes' => [
    'email' => 'email address',
],
```

> **Advertencia:**
> De forma predeterminada, el esqueleto de la aplicación Laravel no incluye el directorio `lang`. Si deseas personalizar los archivos de idioma de Laravel, puedes publicarlos mediante el comando Artisan `lang:publish`.

<a id="specifying-values-in-language-files"></a>
### Especificación de valores en archivos de idioma

Algunos de los mensajes de error de las reglas de validación integradas de Laravel contienen un marcador de posición `:value` que se reemplaza con el valor actual del atributo de solicitud. Sin embargo, es posible que ocasionalmente necesites reemplazar la parte `:value` de tu mensaje de validación con una representación personalizada del valor. Por ejemplo, considera la siguiente regla que especifica que se requiere un número de tarjeta de crédito si `payment_type` tiene un valor de `cc`:

```php
Validator::make($request->all(), [
    'credit_card_number' => ['required_if:payment_type,cc']
]);
```

Si esta regla de validación falla, generará el siguiente mensaje de error:

```text
The credit card number field is required when payment type is cc.
```

En lugar de mostrar `cc` como valor del tipo de pago, puedes especificar una representación de valor más fácil de usar en tu archivo de idioma `lang/xx/validation.php` definiendo un array `values`:

```php
'values' => [
    'payment_type' => [
        'cc' => 'credit card'
    ],
],
```

> **Advertencia:**
> De forma predeterminada, el esqueleto de la aplicación Laravel no incluye el directorio `lang`. Si deseas personalizar los archivos de idioma de Laravel, puedes publicarlos mediante el comando Artisan `lang:publish`.

Después de definir este valor, la regla de validación generará el siguiente mensaje de error:

```text
The credit card number field is required when payment type is credit card.
```

<a id="available-validation-rules"></a>
## Reglas de validación disponibles

A continuación se muestra una lista de todas las reglas de validación disponibles y su función:

<style>
    .collection-method-list > p {
        columns: 10.8em 3; -moz-columns: 10.8em 3; -webkit-columns: 10.8em 3;
    }

    .collection-method-list a {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>

#### Booleanos

<div class="collection-method-list" markdown="1">

[Aceptado](#rule-accepted)
[Aceptado si](#rule-accepted-if)
[Booleano](#rule-boolean)
[Rechazado](#rule-declined)
[Rechazado si](#rule-declined-if)

</div>

#### Cadenas

<div class="collection-method-list" markdown="1">

[URL activa](#rule-active-url)
[Letras](#rule-alpha)
[Letras y guiones](#rule-alpha-dash)
[Alfanumérico](#rule-alpha-num)
[ASCII](#rule-ascii)
[Confirmado](#rule-confirmed)
[Contraseña actual](#rule-current-password)
[Diferente](#rule-different)
[No comienza con](#rule-doesnt-start-with)
[No termina con](#rule-doesnt-end-with)
[Correo electrónico](#rule-email)
[Termina con](#rule-ends-with)
[Enum](#rule-enum)
[Color hexadecimal](#rule-hex-color)
[En](#rule-in)
[Dirección IP](#rule-ip)
[JSON](#rule-json)
[Minúscula](#rule-lowercase)
[Dirección MAC](#rule-mac)
[Máximo](#rule-max)
[Mínimo](#rule-min)
[No en](#rule-not-in)
[Expresión regular](#rule-regex)
[No coincide con la expresión regular](#rule-not-regex)
[Mismo](#rule-same)
[Tamaño](#rule-size)
[Empieza con](#rule-starts-with)
[Cadena](#rule-string)
[Mayúsculas](#rule-uppercase)
[URL](#rule-url)
[ULID](#rule-ulid)
[UUID](#rule-uuid)

</div>

#### Números

<div class="collection-method-list" markdown="1">

[Entre](#rule-between)
[Decimal](#rule-decimal)
[Diferente](#rule-different)
[Dígitos](#rule-digits)
[Dígitos entre](#rule-digits-between)
[Mayor que](#rule-gt)
[Mayor o igual que](#rule-gte)
[Entero](#rule-integer)
[Menor que](#rule-lt)
[Menor o igual que](#rule-lte)
[Máximo](#rule-max)
[Dígitos máximos](#rule-max-digits)
[Mínimo](#rule-min)
[Dígitos mínimos](#rule-min-digits)
[Múltiplo de](#rule-multiple-of)
[Numérico](#rule-numeric)
[Mismo](#rule-same)
[Tamaño](#rule-size)

</div>

#### Arrays

<div class="collection-method-list" markdown="1">

[Array](#rule-array)
[Claves de array](#rule-array-keys)
[Entre](#rule-between)
[Contiene](#rule-contains)
[No contiene](#rule-doesnt-contain)
[Distinto](#rule-distinct)
[En array](#rule-in-array)
[En claves de array](#rule-in-array-keys)
[Lista](#rule-list)
[Máximo](#rule-max)
[Mínimo](#rule-min)
[Tamaño](#rule-size)

</div>

#### Fechas

<div class="collection-method-list" markdown="1">

[Después](#rule-after)
[Después o igual](#rule-after-or-equal)
[Antes](#rule-before)
[Antes o igual](#rule-before-or-equal)
[Fecha](#rule-date)
[Fecha es igual a](#rule-date-equals)
[Formato de fecha](#rule-date-format)
[Diferente](#rule-different)
[Zona horaria](#rule-timezone)

</div>

#### Archivos

<div class="collection-method-list" markdown="1">

[Entre](#rule-between)
[Dimensiones](#rule-dimensions)
[Codificación](#rule-encoding)
[Extensiones](#rule-extensions)
[Archivo](#rule-file)
[Imagen](#rule-image)
[Máximo](#rule-max)
[Mínimo](#rule-min)
[Tipos MIME](#rule-mimetypes)
[Tipo MIME por extensión de archivo](#rule-mimes)
[Tamaño](#rule-size)

</div>

#### Base de datos

<div class="collection-method-list" markdown="1">

[Existe](#rule-exists)
[Único](#rule-unique)

</div>

#### Utilidades

<div class="collection-method-list" markdown="1">

[Cualquiera de](#rule-anyof)
[Detener ante el primer error](#rule-bail)
[Excluir](#rule-exclude)
[Excluir si](#rule-exclude-if)
[Excluir a menos que](#rule-exclude-unless)
[Excluir con](#rule-exclude-with)
[Excluir sin](#rule-exclude-without)
[Rellenado](#rule-filled)
[Falta](#rule-missing)
[Ausente si](#rule-missing-if)
[Falta a menos que](#rule-missing-unless)
[Falta con](#rule-missing-with)
[Ausente con todos](#rule-missing-with-all)
[Anulable](#rule-nullable)
[Presente](#rule-present)
[Presente si](#rule-present-if)
[Presente a menos que](#rule-present-unless)
[Presente con](#rule-present-with)
[Presente con todos](#rule-present-with-all)
[Prohibido](#rule-prohibited)
[Prohibido si](#rule-prohibited-if)
[Prohibido si se acepta](#rule-prohibited-if-accepted)
[Prohibido si se rechaza](#rule-prohibited-if-declined)
[Prohibido a menos que](#rule-prohibited-unless)
[Prohíbe](#rule-prohibits)
[Requerido](#rule-required)
[Obligatorio si](#rule-required-if)
[Obligatorio si se acepta](#rule-required-if-accepted)
[Obligatorio si se rechaza](#rule-required-if-declined)
[Obligatorio a menos que](#rule-required-unless)
[Requerido con](#rule-required-with)
[Obligatorio con todos](#rule-required-with-all)
[Obligatorio sin](#rule-required-without)
[Obligatorio sin ninguno](#rule-required-without-all)
[Claves de array requeridas](#rule-required-array-keys)
[A veces](#validating-when-present)

</div>

<a id="rule-builders"></a>
### Constructores de reglas

Además de las cadenas, se pueden definir muchas reglas de validación utilizando métodos de la clase `Illuminate\Validation\Rule`. Estos métodos ofrecen autocompletado en el IDE y se pueden combinar con reglas de cadena:

```php
use Illuminate\Validation\Rule;

'name' => [Rule::required(), Rule::string()->max(255)],
'terms' => [Rule::accepted()],
'enabled' => [Rule::boolean()],
'website' => [Rule::nullable(), Rule::activeUrl()],
```

Los nombres de los métodos utilizan camelCase, como `Rule::hexColor()`, `Rule::macAddress()` y `Rule::requiredArrayKeys(['name', 'email'])`. Las reglas que dependen de otros campos aceptan los nombres de los campos o los valores de comparación como argumentos:

```php
'terms' => [Rule::acceptedIf('account_type', ['personal', 'business'])],
'nickname' => [Rule::excludeWith('name')],
'email' => [Rule::requiredWithout(['phone', 'mobile'])],
'settings' => [Rule::presentIf('account_type', 'business')],
```

Los métodos `acceptedIf`, `declinedIf`, `missingIf`, `missingUnless`, `presentIf` y `presentUnless` aceptan un valor de comparación o un array de valores de comparación. Métodos como `requiredWith`, `requiredWithAll`, `requiredWithout`, `requiredWithoutAll`, `missingWith`, `missingWithAll`, `presentWith`, `presentWithAll` y `prohibits` aceptan un array de nombres de campo o múltiples argumentos de nombre de campo.

También se pueden definir expresiones regulares utilizando los métodos `regex` y `notRegex`:

```php
'username' => [Rule::required(), Rule::regex('/^[a-z]+$/i')],
'code' => [Rule::notRegex('/^test-/i')],
```

<a id="rule-accepted"></a>
#### accepted

El campo bajo validación debe ser `"yes"`, `"on"`, `1`, `"1"`, `true` o `"true"`. Esto es útil para validar la aceptación de los "Términos de servicio" o campos similares.

<a id="rule-accepted-if"></a>
#### accepted_if:anotherfield,value,...

El campo bajo validación debe ser `"yes"`, `"on"`, `1`, `"1"`, `true` o `"true"` si otro campo bajo validación es igual a un valor especificado. Esto es útil para validar la aceptación de los "Términos de servicio" o campos similares.

<a id="rule-active-url"></a>
#### active_url

El campo bajo validación debe tener un registro A o AAAA válido según la función PHP `dns_get_record`. El nombre de host de la URL proporcionada se extrae utilizando la función PHP `parse_url` antes de pasarlo a `dns_get_record`.

Al probar reglas de validación que realizan búsquedas de DNS, como `active_url` y `email:dns`, puedes utilizar el método `Validator::fakeDnsLookups`. Esto simula las búsquedas de DNS y al mismo tiempo conserva el otro comportamiento de validación de las reglas:

```php
use Illuminate\Support\Facades\Validator;

Validator::fakeDnsLookups();
```

<a id="rule-after"></a>
#### after:_date_

El campo bajo validación debe ser un valor posterior a una fecha determinada. Las fechas se pasarán a la función PHP `strtotime` para convertirlas en una instancia `DateTime` válida:

```php
'start_date' => ['required', 'date', 'after:tomorrow']
```

En lugar de pasar una cadena de fecha para que `strtotime` la evalúe, puedes especificar otro campo para comparar con la fecha:

```php
'finish_date' => ['required', 'date', 'after:start_date']
```

Para mayor comodidad, se pueden construir reglas basadas en fechas utilizando el constructor de reglas fluido `date`:

```php
use Illuminate\Validation\Rule;

'start_date' => [
    'required',
    Rule::date()->after(today()->addDays(7)),
],
```

Se pueden utilizar los métodos `afterToday` y `todayOrAfter` para expresar, mediante una interfaz fluida, que la fecha debe ser posterior a hoy o igual o posterior a hoy, respectivamente:

```php
'start_date' => [
    'required',
    Rule::date()->afterToday(),
],
```

<a id="rule-after-or-equal"></a>
#### after\_or\_equal:_date_

El campo bajo validación debe ser un valor posterior o igual a la fecha indicada. Para obtener más información, consulta la regla [after](#rule-after).

Para mayor comodidad, se pueden construir reglas basadas en fechas utilizando el constructor de reglas fluido `date`:

```php
use Illuminate\Validation\Rule;

'start_date' => [
    'required',
    Rule::date()->afterOrEqual(today()->addDays(7)),
],
```

<a id="rule-anyof"></a>
#### anyOf

La regla de validación `Rule::anyOf` te permite especificar que el campo bajo validación debe satisfacer cualquiera de los conjuntos de reglas de validación dados. Por ejemplo, la siguiente regla validará que el campo `username` sea una dirección de correo electrónico o una cadena alfanumérica (incluidos guiones) de al menos 6 caracteres:

```php
use Illuminate\Validation\Rule;

'username' => [
    'required',
    Rule::anyOf([
        ['string', 'email'],
        ['string', 'alpha_dash', 'min:6'],
    ]),
],
```

<a id="rule-alpha"></a>
#### alpha

El campo bajo validación debe contener caracteres alfabéticos Unicode contenidos en [\p{L}](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AL%3A%5D&g=&i=) y [\p{M}](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AM%3A%5D&g=&i=).

Para restringir esta regla de validación a caracteres en el rango ASCII (`a-z` y `A-Z`), puedes proporcionar la opción `ascii` a la regla de validación:

```php
'username' => ['alpha:ascii'],
```

<a id="rule-alpha-dash"></a>
#### alpha_dash

El campo bajo validación debe contener caracteres alfanuméricos Unicode completamente contenidos en [\p{L}](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AL%3A%5D&g=&i=), [\p{M}](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AM%3A%5D&g=&i=), [\p{N}](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AN%3A%5D&g=&i=), así como guiones ASCII (`-`) y guiones bajos ASCII (`_`).

Para restringir esta regla de validación a caracteres en el rango ASCII (`a-z`, `A-Z` y `0-9`), puedes proporcionar la opción `ascii` a la regla de validación:

```php
'username' => ['alpha_dash:ascii'],
```

<a id="rule-alpha-num"></a>
#### alpha_num

El campo bajo validación debe estar compuesto exclusivamente por caracteres alfanuméricos Unicode contenidos en [\p{L}](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AL%3A%5D&g=&i=), [\p{M}](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AM%3A%5D&g=&i=) y [\p{N}](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AN%3A%5D&g=&i=).

Para restringir esta regla de validación a caracteres en el rango ASCII (`a-z`, `A-Z` y `0-9`), puedes proporcionar la opción `ascii` a la regla de validación:

```php
'username' => ['alpha_num:ascii'],
```

<a id="rule-array"></a>
#### array

El campo bajo validación debe ser un `array` de PHP.

Cuando se proporcionan valores adicionales a la regla `array`, cada clave del array de entrada debe estar presente dentro de la lista de valores proporcionada a la regla. En el siguiente ejemplo, la clave `admin` en el array de entrada no es válida porque no está contenida en la lista de valores proporcionada a la regla `array`:

```php
use Illuminate\Support\Facades\Validator;

$input = [
    'user' => [
        'name' => 'Taylor Otwell',
        'username' => 'taylorotwell',
        'admin' => true,
    ],
];

Validator::make($input, [
    'user' => ['array:name,username'],
]);
```

En general, siempre debes especificar las claves de array que pueden estar presentes dentro de tu array.

<a id="rule-array-keys"></a>
#### array_keys:_foo_,_bar_,...

El campo bajo validación debe ser un `array` de PHP cuyas claves estén todas incluidas en la lista proporcionada. Se debe proporcionar al menos una clave:

```php
'user' => ['array_keys:name,username'],
```

Para mayor comodidad, puedes utilizar el método `Rule::arrayKeys`:

```php
'user' => [Rule::arrayKeys('name', 'username')],
```

<a id="rule-ascii"></a>
#### ascii

El campo bajo validación debe contener exclusivamente caracteres ASCII de 7 bits.

<a id="rule-bail"></a>
#### bail

Deja de ejecutar reglas de validación para el campo después del primer error de validación.

Mientras que la regla `bail` solo dejará de validar un campo específico cuando encuentre un error de validación, el método `stopOnFirstFailure` informará al validador que debe dejar de validar todos los atributos una vez que se haya producido un único error de validación:

```php
if ($validator->stopOnFirstFailure()->fails()) {
    // ...
}
```

<a id="rule-before"></a>
#### before:_date_

El campo bajo validación debe ser un valor anterior a la fecha indicada. Las fechas se pasarán a la función PHP `strtotime` para convertirlas en una instancia `DateTime` válida. Además, al igual que la regla [after](#rule-after), el nombre de otro campo bajo validación se puede proporcionar como el valor de `date`.

Para mayor comodidad, también se pueden crear reglas basadas en fechas utilizando el constructor de reglas fluido `date`:

```php
use Illuminate\Validation\Rule;

'start_date' => [
    'required',
    Rule::date()->before(today()->subDays(7)),
],
```

Se pueden utilizar los métodos `beforeToday` y `todayOrBefore` para expresar, mediante una interfaz fluida, que la fecha debe ser anterior a hoy o igual o anterior a hoy, respectivamente:

```php
'start_date' => [
    'required',
    Rule::date()->beforeToday(),
],
```

<a id="rule-before-or-equal"></a>
#### before\_or\_equal:_date_

El campo bajo validación debe ser un valor anterior o igual a la fecha dada. Las fechas se pasarán a la función PHP `strtotime` para convertirlas en una instancia `DateTime` válida. Además, al igual que la regla [after](#rule-after), el nombre de otro campo bajo validación se puede proporcionar como el valor de `date`.

Para mayor comodidad, también se pueden crear reglas basadas en fechas utilizando el constructor de reglas fluido `date`:

```php
use Illuminate\Validation\Rule;

'start_date' => [
    'required',
    Rule::date()->beforeOrEqual(today()->subDays(7)),
],
```

<a id="rule-between"></a>
#### between:_min_,_max_

El campo bajo validación debe tener un tamaño entre el _min_ y el _max_ dados (inclusive). Las cadenas, números, arrays y archivos se evalúan de la misma manera que la regla [size](#rule-size).

<a id="rule-boolean"></a>
#### boolean

El campo bajo validación debe poder convertirse en booleano. Las entradas aceptadas son `true`, `false`, `1`, `0`, `"1"` y `"0"`.

Puedes utilizar el parámetro `strict` para considerar válido el campo solo si su valor es `true` o `false`:

```php
'foo' => ['boolean:strict']
```

Alternativamente, puedes utilizar el método `Rule::boolean`, pasando `true` para permitir una validación estricta:

```php
'foo' => [Rule::boolean(true)],
```

<a id="rule-confirmed"></a>
#### confirmed

El campo bajo validación debe tener un campo coincidente de `{field}_confirmation`. Por ejemplo, si el campo bajo validación es `password`, debe haber un campo `password_confirmation` coincidente en la entrada.

También puedes pasar un nombre de campo de confirmación personalizado. Por ejemplo, `confirmed:repeat_username` esperará que el campo `repeat_username` coincida con el campo bajo validación.

También puedes utilizar el método `Rule::confirmed`, especificando un campo de confirmación personalizado mediante el método `customField`:

```php
'username' => [Rule::confirmed()->customField('repeat_username')],
```

<a id="rule-contains"></a>
#### contains:_foo_,_bar_,...

El campo bajo validación debe ser un array que contenga todos los valores de parámetros dados. Dado que esta regla a menudo requiere aplicar `implode` a un array, se puede usar el método `Rule::contains` para construir la regla con fluidez:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($data, [
    'roles' => [
        'required',
        'array',
        Rule::contains(['admin', 'editor']),
    ],
]);
```

<a id="rule-doesnt-contain"></a>
#### doesnt_contain:_foo_,_bar_,...

El campo bajo validación debe ser un array que no contenga ninguno de los valores de parámetro dados. Dado que esta regla a menudo requiere aplicar `implode` a un array, se puede usar el método `Rule::doesntContain` para construir la regla con fluidez:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($data, [
    'roles' => [
        'required',
        'array',
        Rule::doesntContain(['admin', 'editor']),
    ],
]);
```

<a id="rule-current-password"></a>
#### current_password

El campo bajo validación debe coincidir con la contraseña del usuario autenticado. Puedes especificar un [guard de autenticación](../authentication/) usando el primer parámetro de la regla:

```php
'password' => ['current_password:api']
```

Alternativamente, puedes utilizar el método `Rule::currentPassword` y especificar el guard de autenticación mediante el método `guard`:

```php
'password' => [Rule::currentPassword()->guard('api')],
```

<a id="rule-date"></a>
#### date

El campo bajo validación debe ser una fecha válida y no relativa según la función PHP `strtotime`.

<a id="rule-date-equals"></a>
#### date_equals:_date_

El campo bajo validación debe ser igual a la fecha indicada. Las fechas se pasarán a la función PHP `strtotime` para convertirlas en una instancia `DateTime` válida.

Para mayor comodidad, se pueden construir reglas basadas en fechas utilizando el constructor de reglas fluido `date`:

```php
use Illuminate\Validation\Rule;

'start_date' => [Rule::date()->equals('2026-01-01')],
```

El método `equals` acepta una cadena de fecha, una instancia de `DateTimeInterface` o el nombre de otro campo con el que comparar.

<a id="rule-date-format"></a>
#### date_format:_format_,...

El campo bajo validación debe coincidir con uno de los _formats_ dados. Debe utilizar **una de las dos reglas**, `date` o `date_format` al validar un campo, no ambos. Esta regla de validación admite todos los formatos admitidos por la [clase DateTime](https://www.php.net/manual/en/class.datetime.php) de PHP.

Para mayor comodidad, se pueden construir reglas basadas en fechas utilizando el constructor de reglas fluido `date`:

```php
use Illuminate\Validation\Rule;

'start_date' => [
    'required',
    Rule::date()->format('Y-m-d'),
],
```

<a id="rule-decimal"></a>
#### decimal:_min_,_max_

El campo bajo validación debe ser numérico y debe contener el número especificado de decimales:

```php
// Must have exactly two decimal places (9.99)...
'price' => ['decimal:2']

// Must have between 2 and 4 decimal places...
'price' => ['decimal:2,4']
```

<a id="rule-declined"></a>
#### declined

El campo bajo validación debe ser `"no"`, `"off"`, `0`, `"0"`, `false` o `"false"`.

<a id="rule-declined-if"></a>
#### declined_if:anotherfield,value,...

El campo bajo validación debe ser `"no"`, `"off"`, `0`, `"0"`, `false` o `"false"` si otro campo bajo validación es igual a un valor especificado.

<a id="rule-different"></a>
#### different:_field_

El campo bajo validación debe tener un valor diferente al _field_.

<a id="rule-digits"></a>
#### digits:_value_

El número entero bajo validación debe tener una longitud exacta de _value_.

<a id="rule-digits-between"></a>
#### digits_between:_min_,_max_

El número entero bajo validación debe tener una longitud entre el _min_ y el _max_ dados.

<a id="rule-dimensions"></a>
#### dimensions

El archivo bajo validación debe ser una imagen que cumpla con las restricciones de dimensión especificadas por los parámetros de la regla:

```php
'avatar' => ['dimensions:min_width=100,min_height=200']
```

Las restricciones disponibles son: _min\_width_, _max\_width_, _min\_height_, _max\_height_, _width_, _height_, _ratio_, _min\_ratio_, _max\_ratio_.

Una restricción de _ratio_ debe representarse como ancho dividido por alto. Esto se puede especificar mediante una fracción como `3/2` o un flotante como `1.5`:

```php
'avatar' => ['dimensions:ratio=3/2']
```

Las restricciones _min\_ratio_ y _max\_ratio_ se pueden utilizar para definir un rango de relaciones de aspecto aceptables:

```php
'avatar' => ['dimensions:min_ratio=1/2,max_ratio=3/2']
```

Dado que esta regla requiere varios argumentos, suele ser más conveniente utilizar el método `Rule::dimensions` para construir la regla con fluidez:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($data, [
    'avatar' => [
        'required',
        Rule::dimensions()
            ->maxWidth(1000)
            ->maxHeight(500)
            ->ratio(3 / 2),
    ],
]);
```

También puedes utilizar los métodos `minRatio`, `maxRatio` y `ratioBetween` para definir con fluidez restricciones de relación:

```php
Rule::dimensions()->ratioBetween(min: 1 / 2, max: 3 / 2);
```

<a id="rule-distinct"></a>
#### distinct

Al validar arrays, el campo bajo validación no debe tener valores duplicados:

```php
'foo.*.id' => ['distinct']
```

La regla distinct utiliza comparaciones no estrictas de variables de forma predeterminada. Para utilizar comparaciones estrictas, puedes agregar el parámetro `strict` a tu definición de regla de validación:

```php
'foo.*.id' => ['distinct:strict']
```

Puedes agregar `ignore_case` a los argumentos de la regla de validación para que la regla ignore las diferencias entre mayúsculas y minúsculas:

```php
'foo.*.id' => ['distinct:ignore_case']
```

Alternativamente, puedes usar el método `Rule::distinct`, encadenando los métodos `strict` y `ignoreCase` según sea necesario:

```php
'foo.*.id' => [Rule::distinct()->strict()->ignoreCase()],
```

<a id="rule-doesnt-start-with"></a>
#### doesnt_start_with:_foo_,_bar_,...

El campo bajo validación no debe comenzar con uno de los valores dados.

<a id="rule-doesnt-end-with"></a>
#### doesnt_end_with:_foo_,_bar_,...

El campo bajo validación no debe terminar con uno de los valores dados.

<a id="rule-email"></a>
#### email

El campo bajo validación debe tener el formato de una dirección de correo electrónico. Esta regla de validación utiliza el paquete [egulias/email-validator](https://github.com/egulias/EmailValidator) para validar la dirección de correo electrónico. De forma predeterminada, se aplica el validador `RFCValidation`, pero también puedes aplicar otros estilos de validación:

```php
'email' => ['email:rfc,dns']
```

El ejemplo anterior aplicará las validaciones `RFCValidation` y `DNSCheckValidation`. Aquí hay una lista completa de estilos de validación que puedes aplicar:

<div class="content-list" markdown="1">

- `rfc`: `RFCValidation` - Valida la dirección de correo electrónico según [RFC admitidos](https://github.com/egulias/EmailValidator?tab=readme-ov-file#supported-rfcs).
- `strict`: `NoRFCWarningsValidation` - Valida el correo electrónico de acuerdo con [RFC admitidos](https://github.com/egulias/EmailValidator?tab=readme-ov-file#supported-rfcs), fallando cuando se encuentran advertencias (por ejemplo, puntos al final y varios puntos consecutivos).
- `dns`: `DNSCheckValidation`: asegúrate de que el dominio de la dirección de correo electrónico tenga un registro MX válido.
- `spoof`: `SpoofCheckValidation`: asegúrate de que la dirección de correo electrónico no contenga homógrafos ni caracteres Unicode engañosos.
- `filter`: `FilterEmailValidation` - Asegúrate de que la dirección de correo electrónico sea válida según la función `filter_var` de PHP.
- `filter_unicode`: `FilterEmailValidation::unicode()` - Asegúrate de que la dirección de correo electrónico sea válida según la función `filter_var` de PHP, permitiendo algunos caracteres Unicode.

</div>

Para mayor comodidad, se pueden crear reglas de validación de correo electrónico utilizando el constructor de reglas fluido:

```php
use Illuminate\Validation\Rule;

$request->validate([
    'email' => [
        'required',
        Rule::email()
            ->rfcCompliant(strict: false)
            ->validateMxRecord()
            ->preventSpoofing()
    ],
]);
```

El validador `dns` realiza una búsqueda de DNS real para confirmar que el dominio de la dirección tiene un registro MX válido. No determina si existe un buzón individual.

Dado que tus pruebas no deben depender de búsquedas de DNS en vivo, puedes usar el método `Validator::fakeDnsLookups` para [simular búsquedas de DNS](#rule-active-url) mientras se continúan ejecutando otras validaciones solicitadas, como `rfc`:

```php
use Illuminate\Support\Facades\Validator;

Validator::fakeDnsLookups();
```

Esto permite que tu aplicación siga usando tus reglas de validación existentes mientras realiza la prueba:

```php
'email' => ['required', 'email:rfc,dns'],
```

> **Advertencia:**
> Los validadores `dns` y `spoof` requieren la extensión PHP `intl`.

<a id="rule-encoding"></a>
#### encoding:*encoding_type*

El campo bajo validación debe coincidir con la codificación de caracteres especificada. Esta regla utiliza la función `mb_check_encoding` de PHP para verificar la codificación del archivo o valor de cadena dado. Para mayor comodidad, la regla `encoding` se puede construir utilizando el constructor fluido de reglas de archivos de Laravel:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\File;

Validator::validate($input, [
    'attachment' => [
        'required',
        File::types(['csv'])
            ->encoding('utf-8'),
    ],
]);
```

<a id="rule-ends-with"></a>
#### ends_with:_foo_,_bar_,...

El campo bajo validación debe terminar con uno de los valores dados.

<a id="rule-enum"></a>
#### enum

La regla `Enum` es una regla basada en clases que valida si el campo bajo validación contiene un valor de enumeración válido. La regla `Enum` acepta el nombre de la enumeración como único argumento del constructor. Al validar valores primitivos, se debe proporcionar una enumeración con valores asociados para la regla `Enum`:

```php
use App\Enums\ServerStatus;
use Illuminate\Validation\Rule;

$request->validate([
    'status' => [Rule::enum(ServerStatus::class)],
]);
```

Los métodos `only` y `except` de la regla `Enum` se pueden usar para limitar qué casos de enumeración deben considerarse válidos:

```php
Rule::enum(ServerStatus::class)
    ->only([ServerStatus::Pending, ServerStatus::Active]);

Rule::enum(ServerStatus::class)
    ->except([ServerStatus::Pending, ServerStatus::Active]);
```

El método `when` se puede utilizar para modificar condicionalmente la regla `Enum`:

```php
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

Rule::enum(ServerStatus::class)
    ->when(
        Auth::user()->isAdmin(),
        fn ($rule) => $rule->only(...),
        fn ($rule) => $rule->only(...),
    );
```

<a id="rule-exclude"></a>
#### exclude

El campo bajo validación se excluirá de los datos de la solicitud devueltos por los métodos `validate` y `validated`.

<a id="rule-exclude-if"></a>
#### exclude_if:_anotherfield_,_value_

El campo bajo validación se excluirá de los datos de solicitud devueltos por los métodos `validate` y `validated` si el campo _anotherfield_ es igual a _value_.

Si se requiere una lógica de exclusión condicional compleja, puedes utilizar el método `Rule::excludeIf`. Este método acepta un booleano o una función anónima. Cuando se proporciona una función anónima, la función anónima debe devolver `true` o `false` para indicar si el campo bajo validación debe excluirse:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($request->all(), [
    'role_id' => [Rule::excludeIf($request->user()->is_admin)],
]);

Validator::make($request->all(), [
    'role_id' => [Rule::excludeIf(fn () => $request->user()->is_admin)],
]);
```

<a id="rule-exclude-unless"></a>
#### exclude_unless:_anotherfield_,_value_

El campo bajo validación se excluirá de los datos de solicitud devueltos por los métodos `validate` y `validated` a menos que el campo de _anotherfield_ sea igual a _value_. Si _value_ es `null` (`exclude_unless:name,null`), el campo bajo validación se excluirá a menos que el campo de comparación sea `null` o que falte el campo de comparación en los datos de la solicitud.

Si se requiere una lógica de exclusión condicional compleja, puedes utilizar el método `Rule::excludeUnless`. Este método acepta un booleano o una función anónima. Cuando se proporciona una función anónima, la función anónima debe devolver `true` o `false` para indicar si el campo bajo validación no debe excluirse:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($request->all(), [
    'role_id' => [Rule::excludeUnless($request->user()->is_admin)],
]);

Validator::make($request->all(), [
    'role_id' => [Rule::excludeUnless(fn () => $request->user()->is_admin)],
]);
```

<a id="rule-exclude-with"></a>
#### exclude_with:_anotherfield_

El campo bajo validación se excluirá de los datos de solicitud devueltos por los métodos `validate` y `validated` si el campo _anotherfield_ está presente.

<a id="rule-exclude-without"></a>
#### exclude_without:_anotherfield_

El campo bajo validación se excluirá de los datos de solicitud devueltos por los métodos `validate` y `validated` si el campo _anotherfield_ no está presente.

<a id="rule-exists"></a>
#### exists:_table_,_column_

El campo bajo validación debe existir en una tabla de base de datos determinada.

<a id="basic-usage-of-exists-rule"></a>
#### Uso básico de la regla exists

```php
'state' => ['exists:states']
```

Si no se especifica la opción `column`, se utilizará el nombre del campo. Entonces, en este caso, la regla validará que la tabla de base de datos `states` contenga un registro con un valor de columna `state` que coincida con el valor del atributo `state` de la solicitud.

<a id="specifying-a-custom-column-name"></a>
#### Especificación de un nombre de columna personalizado

Puedes especificar explícitamente el nombre de la columna de la base de datos que debe usar la regla de validación colocándolo después del nombre de la tabla de la base de datos:

```php
'state' => ['exists:states,abbreviation']
```

En ocasiones, es posible que necesites especificar una conexión de base de datos específica que se utilizará para la consulta `exists`. Puedes lograr esto anteponiendo el nombre de la conexión al nombre de la tabla:

```php
'email' => ['exists:connection.staff,email']
```

En lugar de especificar el nombre de la tabla directamente, puedes especificar el modelo Eloquent que debe usarse para determinar el nombre de la tabla:

```php
'user_id' => ['exists:App\Models\User,id']
```

Si deseas personalizar la consulta ejecutada por la regla de validación, puedes utilizar la clase `Rule` para definir la regla con fluidez.

```php
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($data, [
    'email' => [
        'required',
        Rule::exists('staff')->where(function (Builder $query) {
            $query->where('account_id', 1);
        }),
    ],
]);
```

Puedes especificar explícitamente el nombre de la columna de la base de datos que debe usar la regla `exists` generada por el método `Rule::exists` proporcionando el nombre de la columna como segundo argumento del método `exists`:

```php
'state' => [Rule::exists('states', 'abbreviation')],
```

A veces, es posible que desees validar si existe un array de valores en la base de datos. Puedes hacerlo agregando las reglas `exists` y [array](#rule-array) al campo que se está validando:

```php
'states' => ['array', Rule::exists('states', 'abbreviation')],
```

Cuando ambas reglas se asignan a un campo, Laravel creará automáticamente una consulta única para determinar si todos los valores dados existen en la tabla especificada.

<a id="rule-extensions"></a>
#### extensions:_foo_,_bar_,...

El archivo bajo validación debe tener una extensión asignada por el usuario correspondiente a una de las extensiones enumeradas:

```php
'photo' => ['required', 'extensions:jpg,png'],
```

> **Advertencia:**
> Nunca debes confiar en validar un archivo únicamente por su extensión asignada por el usuario. Por lo general, esta regla siempre debe usarse en combinación con las reglas [mimes](#rule-mimes) o [mimetypes](#rule-mimetypes).

<a id="rule-file"></a>
#### file

El campo bajo validación debe ser un archivo cargado correctamente.

<a id="rule-filled"></a>
#### filled

El campo bajo validación no debe estar vacío cuando esté presente.

<a id="rule-gt"></a>
#### gt:_field_

El campo bajo validación debe ser mayor que el _field_ o _value_ dado. Los dos campos deben ser del mismo tipo. Las cadenas, números, arrays y archivos se evalúan utilizando las mismas convenciones que la regla [size](#rule-size).

<a id="rule-gte"></a>
#### gte:_field_

El campo bajo validación debe ser mayor o igual al _field_ o _value_ dado. Los dos campos deben ser del mismo tipo. Las cadenas, números, arrays y archivos se evalúan utilizando las mismas convenciones que la regla [size](#rule-size).

<a id="rule-hex-color"></a>
#### hex_color

El campo bajo validación debe contener un valor de color válido en formato [hexadecimal](https://developer.mozilla.org/en-US/docs/Web/CSS/hex-color).

<a id="rule-image"></a>
#### image

El archivo bajo validación debe ser una imagen (jpg, jpeg, png, bmp, gif, webp, avif, heic o heif).

> **Advertencia:**
> De forma predeterminada, la regla image no permite archivos SVG debido a la posibilidad de vulnerabilidades XSS. Si necesitas permitir archivos SVG, puedes proporcionar la directiva `allow_svg` a la regla `image` (`image:allow_svg`).

<a id="rule-in"></a>
#### in:_foo_,_bar_,...

El campo bajo validación debe estar incluido en la lista de valores proporcionada. Dado que esta regla a menudo requiere aplicar `implode` a un array, se puede usar el método `Rule::in` para construir la regla con fluidez:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($data, [
    'zones' => [
        'required',
        Rule::in(['first-zone', 'second-zone']),
    ],
]);
```

Cuando la regla `in` se combina con la regla `array`, cada valor del array de entrada debe estar presente dentro de la lista de valores proporcionada a la regla `in`. En el siguiente ejemplo, el código de aeropuerto `LAS` en el array de entrada no es válido porque no está incluido en la lista de aeropuertos proporcionada a la regla `in`:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

$input = [
    'airports' => ['NYC', 'LAS'],
];

Validator::make($input, [
    'airports' => [
        'required',
        'array',
    ],
    'airports.*' => Rule::in(['NYC', 'LIT']),
]);
```

<a id="rule-in-array"></a>
#### in_array:_anotherfield_.*

El campo bajo validación debe existir en los valores de _anotherfield_.

<a id="rule-in-array-keys"></a>
#### in_array_keys:_value_.*

El campo bajo validación debe ser un array que tenga al menos uno de los _values_ dados como clave dentro del array:

```php
'config' => ['array', 'in_array_keys:timezone']
```

<a id="rule-integer"></a>
#### integer

El campo bajo validación debe ser un número entero.

Puedes utilizar el parámetro `strict` para considerar válido el campo solo si su tipo es `integer`. Las cadenas con valores enteros se considerarán inválidas:

```php
'age' => ['integer:strict']
```

> **Advertencia:**
> Esta regla de validación no verifica que la entrada sea del tipo de variable "entero", solo que la entrada sea de un tipo aceptado por la regla `FILTER_VALIDATE_INT` de PHP. Si necesitas validar la entrada como un número, utiliza esta regla en combinación con [la regla de validación `numeric`](#rule-numeric).

<a id="rule-ip"></a>
#### ip

El campo bajo validación debe ser una dirección IP.

También puedes utilizar el método `Rule::ip`, restringiendo opcionalmente la versión de IP a `4` o `6`:

```php
'ip_address' => [Rule::ip()],
'ipv4_address' => [Rule::ip()->version(4)],
'ipv6_address' => [Rule::ip()->version(6)],
```

<a id="ipv4"></a>
#### ipv4

El campo bajo validación debe ser una dirección IPv4.

<a id="ipv6"></a>
#### ipv6

El campo bajo validación debe ser una dirección IPv6.

<a id="rule-json"></a>
#### json

El campo bajo validación debe ser una cadena JSON válida.

<a id="rule-lt"></a>
#### lt:_field_

El campo bajo validación debe ser menor que el _field_ dado. Los dos campos deben ser del mismo tipo. Las cadenas, números, arrays y archivos se evalúan utilizando las mismas convenciones que la regla [size](#rule-size).

<a id="rule-lte"></a>
#### lte:_field_

El campo bajo validación debe ser menor o igual que el _field_ dado. Los dos campos deben ser del mismo tipo. Las cadenas, números, arrays y archivos se evalúan utilizando las mismas convenciones que la regla [size](#rule-size).

<a id="rule-lowercase"></a>
#### lowercase

El campo bajo validación debe estar en minúsculas.

<a id="rule-list"></a>
#### list

El campo bajo validación debe ser un array que sea una lista. Un array se considera una lista si sus claves constan de números consecutivos del 0 al `count($array) - 1`.

<a id="rule-mac"></a>
#### mac_address

El campo bajo validación debe ser una dirección MAC.

<a id="rule-max"></a>
#### max:_value_

El campo bajo validación debe ser menor o igual a un _value_ máximo. Las cadenas, números, arrays y archivos se evalúan de la misma manera que la regla [size](#rule-size).

<a id="rule-max-digits"></a>
#### max_digits:_value_

El número entero bajo validación debe tener una longitud máxima de _value_.

<a id="rule-mimetypes"></a>
#### mimetypes:_text/plain_,...

El archivo bajo validación debe coincidir con uno de los tipos MIME dados:

```php
'video' => ['mimetypes:video/avi,video/mpeg,video/quicktime'],

'media' => ['mimetypes:image/*,video/*'],
```

Para determinar el tipo MIME del archivo cargado, se leerá el contenido del archivo y el framework intentará adivinar el tipo MIME, que puede ser diferente del tipo MIME proporcionado por el cliente.

<a id="rule-mimes"></a>
#### mimes:_foo_,_bar_,...

El archivo bajo validación debe tener un tipo MIME correspondiente a una de las extensiones enumeradas:

```php
'photo' => ['mimes:jpg,bmp,png']
```

Aunque solo necesitas especificar las extensiones, esta regla en realidad valida el tipo MIME del archivo leyendo el contenido del archivo y adivinando su tipo MIME. Puedes encontrar una lista completa de los tipos MIME y sus correspondientes extensiones en la siguiente ubicación:

[https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types](https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types)

<a id="mime-types-and-extensions"></a>
#### Tipos y extensiones MIME

Esta regla de validación no verifica la concordancia entre el tipo MIME y la extensión que el usuario asignó al archivo. Por ejemplo, la regla de validación `mimes:png` consideraría que un archivo que contenga contenido PNG válido es una imagen PNG válida, incluso si el archivo se llama `photo.txt`. Si deseas validar la extensión del archivo asignada por el usuario, puedes utilizar la regla [extensions](#rule-extensions).

<a id="rule-min"></a>
#### min:_value_

El campo bajo validación debe tener un _value_ mínimo. Las cadenas, números, arrays y archivos se evalúan de la misma manera que la regla [size](#rule-size).

<a id="rule-min-digits"></a>
#### min_digits:_value_

El número entero bajo validación debe tener una longitud mínima de _value_.

<a id="rule-multiple-of"></a>
#### multiple_of:_value_

El campo bajo validación debe ser un múltiplo de _value_.

<a id="rule-missing"></a>
#### missing

El campo bajo validación no debe estar presente en los datos de entrada.

<a id="rule-missing-if"></a>
#### missing_if:_anotherfield_,_value_,...

El campo bajo validación no debe estar presente si el campo _anotherfield_ es igual a cualquier _value_.

<a id="rule-missing-unless"></a>
#### missing_unless:_anotherfield_,_value_

El campo bajo validación no debe estar presente a menos que el campo _anotherfield_ sea igual a cualquier _value_.

<a id="rule-missing-with"></a>
#### missing_with:_foo_,_bar_,...

El campo bajo validación no debe estar presente _solo si_ cualquiera de los otros campos especificados está presente.

<a id="rule-missing-with-all"></a>
#### missing_with_all:_foo_,_bar_,...

El campo bajo validación no debe estar presente _solo si_ todos los demás campos especificados están presentes.

<a id="rule-not-in"></a>
#### not_in:_foo_,_bar_,...

El campo bajo validación no debe estar incluido en la lista de valores proporcionada. Se puede utilizar el método `Rule::notIn` para construir la regla con fluidez:

```php
use Illuminate\Validation\Rule;

Validator::make($data, [
    'toppings' => [
        'required',
        Rule::notIn(['sprinkles', 'cherries']),
    ],
]);
```

<a id="rule-not-regex"></a>
#### not_regex:_pattern_

El campo bajo validación no debe coincidir con la expresión regular dada.

Internamente, esta regla utiliza la función PHP `preg_match`. El patrón especificado debe obedecer al mismo formato requerido por `preg_match` y, por lo tanto, también incluir delimitadores válidos. Por ejemplo: `'email' => ['not_regex:/^.+$/i']`.

<a id="rule-nullable"></a>
#### nullable

El campo bajo validación puede ser `null`.

<a id="rule-numeric"></a>
#### numeric

El campo bajo validación debe ser [numérico](https://www.php.net/manual/en/function.is-numeric.php).

Puedes utilizar el parámetro `strict` para considerar válido el campo solo si su valor es de tipo entero o flotante. Las cadenas numéricas se considerarán inválidas:

```php
'amount' => ['numeric:strict']
```

<a id="rule-present"></a>
#### present

El campo bajo validación debe existir en los datos de entrada.

<a id="rule-present-if"></a>
#### present_if:_anotherfield_,_value_,...

El campo bajo validación debe estar presente si el campo _anotherfield_ es igual a cualquier _value_.

<a id="rule-present-unless"></a>
#### present_unless:_anotherfield_,_value_

El campo bajo validación debe estar presente a menos que el campo _anotherfield_ sea igual a cualquier _value_.

<a id="rule-present-with"></a>
#### present_with:_foo_,_bar_,...

El campo bajo validación debe estar presente _solo si_ cualquiera de los otros campos especificados está presente.

<a id="rule-present-with-all"></a>
#### present_with_all:_foo_,_bar_,...

El campo bajo validación debe estar presente _solo si_ todos los demás campos especificados están presentes.

<a id="rule-prohibited"></a>
#### prohibited

El campo bajo validación debe faltar o estar vacío. Un campo está "vacío" si cumple uno de los siguientes criterios:

<div class="content-list" markdown="1">

- El valor es `null`.
- El valor es una cadena vacía.
- El valor es un array vacío o un objeto `Countable` vacío.
- El valor es un archivo cargado con una ruta vacía.

</div>

<a id="rule-prohibited-if"></a>
#### prohibited_if:_anotherfield_,_value_,...

El campo bajo validación debe faltar o estar vacío si el campo _anotherfield_ es igual a cualquier _value_. Un campo está "vacío" si cumple uno de los siguientes criterios:

<div class="content-list" markdown="1">

- El valor es `null`.
- El valor es una cadena vacía.
- El valor es un array vacío o un objeto `Countable` vacío.
- El valor es un archivo cargado con una ruta vacía.

</div>

Si se requiere una lógica de prohibición condicional compleja, puedes utilizar el método `Rule::prohibitedIf`. Este método acepta un booleano o una función anónima. Cuando se proporciona una función anónima, la función anónima debe devolver `true` o `false` para indicar si el campo bajo validación debe estar prohibido:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($request->all(), [
    'role_id' => [Rule::prohibitedIf($request->user()->is_admin)],
]);

Validator::make($request->all(), [
    'role_id' => [Rule::prohibitedIf(fn () => $request->user()->is_admin)],
]);
```

<a id="rule-prohibited-if-accepted"></a>
#### prohibited_if_accepted:_anotherfield_,...

El campo bajo validación debe faltar o estar vacío si el campo _anotherfield_ es igual a `"yes"`, `"on"`, `1`, `"1"`, `true` o `"true"`.

<a id="rule-prohibited-if-declined"></a>
#### prohibited_if_declined:_anotherfield_,...

El campo bajo validación debe faltar o estar vacío si el campo _anotherfield_ es igual a `"no"`, `"off"`, `0`, `"0"`, `false` o `"false"`.

<a id="rule-prohibited-unless"></a>
#### prohibited_unless:_anotherfield_,_value_,...

El campo bajo validación debe faltar o estar vacío a menos que el campo _anotherfield_ sea igual a cualquier _value_. Un campo está "vacío" si cumple uno de los siguientes criterios:

<div class="content-list" markdown="1">

- El valor es `null`.
- El valor es una cadena vacía.
- El valor es un array vacío o un objeto `Countable` vacío.
- El valor es un archivo cargado con una ruta vacía.

</div>

Si se requiere una lógica de prohibición condicional compleja, puedes utilizar el método `Rule::prohibitedUnless`. Este método acepta un booleano o una función anónima. Cuando se proporciona una función anónima, la función anónima debe devolver `true` o `false` para indicar si el campo bajo validación no debe estar prohibido:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($request->all(), [
    'role_id' => [Rule::prohibitedUnless($request->user()->is_admin)],
]);

Validator::make($request->all(), [
    'role_id' => [Rule::prohibitedUnless(fn () => $request->user()->is_admin)],
]);
```

<a id="rule-prohibits"></a>
#### prohibits:_anotherfield_,...

Si el campo bajo validación está presente y no está vacío, todos los campos en _anotherfield_ deben faltar o estar vacíos. Un campo está "vacío" si cumple uno de los siguientes criterios:

<div class="content-list" markdown="1">

- El valor es `null`.
- El valor es una cadena vacía.
- El valor es un array vacío o un objeto `Countable` vacío.
- El valor es un archivo cargado con una ruta vacía.

</div>

<a id="rule-regex"></a>
#### regex:_pattern_

El campo bajo validación debe coincidir con la expresión regular dada.

Internamente, esta regla utiliza la función PHP `preg_match`. El patrón especificado debe obedecer al mismo formato requerido por `preg_match` y, por lo tanto, también incluir delimitadores válidos. Por ejemplo: `'email' => ['regex:/^.+@.+$/i']`.

<a id="rule-required"></a>
#### required

El campo bajo validación debe estar presente en los datos de entrada y no vacío. Un campo está "vacío" si cumple uno de los siguientes criterios:

<div class="content-list" markdown="1">

- El valor es `null`.
- El valor es una cadena vacía.
- El valor es un array vacío o un objeto `Countable` vacío.
- El valor es un archivo cargado sin ruta.

</div>

<a id="rule-required-if"></a>
#### required_if:_anotherfield_,_value_,...

El campo bajo validación debe estar presente y no vacío si el campo _anotherfield_ es igual a cualquier _value_.

Si deseas construir una condición más compleja para la regla `required_if`, puedes utilizar el método `Rule::requiredIf`. Este método acepta un booleano o una función anónima. Cuando se pasa una función anónima, la función anónima debe devolver `true` o `false` para indicar si el campo bajo validación es obligatorio:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($request->all(), [
    'role_id' => [Rule::requiredIf($request->user()->is_admin)],
]);

Validator::make($request->all(), [
    'role_id' => [Rule::requiredIf(fn () => $request->user()->is_admin)],
]);
```

<a id="rule-required-if-accepted"></a>
#### required_if_accepted:_anotherfield_,...

El campo bajo validación debe estar presente y no vacío si el campo _anotherfield_ es igual a `"yes"`, `"on"`, `1`, `"1"`, `true` o `"true"`.

<a id="rule-required-if-declined"></a>
#### required_if_declined:_anotherfield_,...

El campo bajo validación debe estar presente y no vacío si el campo _anotherfield_ es igual a `"no"`, `"off"`, `0`, `"0"`, `false` o `"false"`.

<a id="rule-required-unless"></a>
#### required_unless:_anotherfield_,_value_,...

El campo bajo validación debe estar presente y no vacío a menos que el campo _anotherfield_ sea igual a cualquier _value_. Esto también significa que _anotherfield_ debe estar presente en los datos de la solicitud a menos que el _value_ sea `null`. Si _value_ es `null` (`required_unless:name,null`), el campo bajo validación será obligatorio a menos que el campo de comparación sea `null` o que falte el campo de comparación en los datos de la solicitud.

Si deseas construir una condición más compleja para la regla `required_unless`, puedes utilizar el método `Rule::requiredUnless`. Este método acepta un booleano o una función anónima. Cuando se pasa una función anónima, la función anónima debe devolver `true` o `false` para indicar si el campo bajo validación no es obligatorio:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($request->all(), [
    'role_id' => [Rule::requiredUnless($request->user()->is_admin)],
]);

Validator::make($request->all(), [
    'role_id' => [Rule::requiredUnless(fn () => $request->user()->is_admin)],
]);
```

<a id="rule-required-with"></a>
#### required_with:_foo_,_bar_,...

El campo bajo validación debe estar presente y no vacío _solo si_ cualquiera de los otros campos especificados está presente y no vacío.

<a id="rule-required-with-all"></a>
#### required_with_all:_foo_,_bar_,...

El campo bajo validación debe estar presente y no vacío _solo si_ todos los demás campos especificados están presentes y no vacíos.

<a id="rule-required-without"></a>
#### required_without:_foo_,_bar_,...

El campo bajo validación debe estar presente y no vacío _solo cuando_ cualquiera de los otros campos especificados esté vacío o no esté presente.

<a id="rule-required-without-all"></a>
#### required_without_all:_foo_,_bar_,...

El campo bajo validación debe estar presente y no vacío _solo cuando_ todos los demás campos especificados estén vacíos o no presentes.

<a id="rule-required-array-keys"></a>
#### required_array_keys:_foo_,_bar_,...

El campo bajo validación debe ser un array y debe contener al menos las claves especificadas.

<a id="rule-same"></a>
#### same:_field_

El _field_ proporcionado debe coincidir con el campo bajo validación.

<a id="rule-size"></a>
#### size:_value_

El campo bajo validación debe tener un tamaño que coincida con el _value_ dado. Para datos de cadena, _value_ corresponde al número de caracteres. Para datos numéricos, _value_ corresponde a un valor entero determinado (el atributo también debe tener la regla `numeric` o `integer`). Para un array, _size_ corresponde al `count` del array. Para archivos, _size_ corresponde al tamaño del archivo en kilobytes. Veamos algunos ejemplos:

```php
// Validate that a string is exactly 12 characters long...
'title' => ['size:12'];

// Validate that a provided integer equals 10...
'seats' => ['integer', 'size:10'];

// Validate that an array has exactly 5 elements...
'tags' => ['array', 'size:5'];

// Validate that an uploaded file is exactly 512 kilobytes...
'image' => ['file', 'size:512'];
```

<a id="rule-starts-with"></a>
#### starts_with:_foo_,_bar_,...

El campo bajo validación debe comenzar con uno de los valores dados.

<a id="rule-string"></a>
#### string

El campo bajo validación debe ser una cadena. Si deseas permitir que el campo también sea `null`, debes asignar la regla `nullable` al campo.

Para mayor comodidad, las reglas de validación de cadenas también se pueden construir utilizando el constructor de reglas fluido `Rule::string()`:

```php
use Illuminate\Validation\Rule;

'title' => [
    'required',
    Rule::string()
        ->min(3)
        ->max(255)
        ->alphaDash(ascii: true),
],
```

El constructor de reglas de cadenas proporciona métodos para restricciones de cadenas comunes, incluidas `alpha`, `alphaDash`, `alphaNumeric`, `ascii`, `between`, `doesntEndWith`, `doesntStartWith`, `endsWith`, `exactly`, `lowercase`, `max`, `min`, `startsWith` y `uppercase`. Dado que el constructor de reglas es condicional, también puedes utilizar los métodos `when` y `unless` para aplicar restricciones de forma condicional.

<a id="rule-timezone"></a>
#### timezone

El campo bajo validación debe ser un identificador de zona horaria válido según el método `DateTimeZone::listIdentifiers`.

Los argumentos [aceptados por el método `DateTimeZone::listIdentifiers`](https://www.php.net/manual/en/datetimezone.listidentifiers.php) también se pueden proporcionar a esta regla de validación:

```php
'timezone' => ['required', 'timezone:all'];

'timezone' => ['required', 'timezone:Africa'];

'timezone' => ['required', 'timezone:per_country,US'];
```

Alternativamente, puedes usar el método `Rule::timezone`, pasando cualquier argumento `listIdentifiers` como un array:

```php
'timezone' => [Rule::timezone(['per_country', 'US'])],
```

<a id="rule-unique"></a>
#### unique:_table_,_column_

El campo bajo validación no debe existir dentro de la tabla de base de datos dada.

**Especificar un nombre de tabla/columna personalizado:**

En lugar de especificar el nombre de la tabla directamente, puedes especificar el modelo Eloquent que debe usarse para determinar el nombre de la tabla:

```php
'email' => ['unique:App\Models\User,email_address']
```

La opción `column` se puede utilizar para especificar la columna de base de datos correspondiente al campo. Si no se especifica la opción `column`, se utilizará el nombre del campo bajo validación.

```php
'email' => ['unique:users,email_address']
```

**Especificar una conexión de base de datos personalizada**

En ocasiones, es posible que necesites configurar una conexión personalizada para las consultas de la base de datos realizadas por el validador. Para lograr esto, puedes anteponer el nombre de la conexión al nombre de la tabla:

```php
'email' => ['unique:connection.users,email_address']
```

**Forzar una regla unique para ignorar un ID determinado:**

A veces, es posible que desees ignorar un ID determinado durante la validación de unicidad. Por ejemplo, considera una pantalla de "actualizar perfil" que incluye el nombre del usuario, la dirección de correo electrónico y la ubicación. Probablemente querrás verificar que la dirección de correo electrónico sea única. Sin embargo, si el usuario solo cambia el campo de nombre y no el campo de correo electrónico, no deseas que se genere un error de validación porque el usuario ya es el propietario de la dirección de correo electrónico en cuestión.

Para indicarle al validador que ignore el ID del usuario, usaremos la clase `Rule` para definir la regla con fluidez.

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($data, [
    'email' => [
        'required',
        Rule::unique('users')->ignore($user->id),
    ],
]);
```

> **Advertencia:**
> Nunca debes pasar ninguna entrada de solicitud controlada por el usuario al método `ignore`. En su lugar, solo debes pasar un ID único generado por el sistema, como un ID autoincremental o un UUID de una instancia del modelo Eloquent. De lo contrario, tu aplicación será vulnerable a un ataque de inyección SQL.

En lugar de pasar el valor de la clave del modelo al método `ignore`, también puedes pasar la instancia completa del modelo. Laravel extraerá automáticamente la clave del modelo:

```php
Rule::unique('users')->ignore($user);
```

Si tu tabla utiliza un nombre de columna de clave principal distinto de `id`, puedes especificar el nombre de la columna al llamar al método `ignore`:

```php
Rule::unique('users')->ignore($user->id, 'user_id');
```

De forma predeterminada, la regla `unique` comprobará la unicidad de la columna que coincide con el nombre del atributo que se está validando. Sin embargo, puedes pasar un nombre de columna diferente como segundo argumento del método `unique`:

```php
Rule::unique('users', 'email_address')->ignore($user->id);
```

**Agregar cláusulas where adicionales:**

Puedes especificar condiciones de consulta adicionales personalizando la consulta utilizando el método `where`. Por ejemplo, agreguemos una condición de consulta que limite el alcance de la consulta para buscar solo registros que tengan un valor de columna `account_id` de `1`:

```php
'email' => Rule::unique('users')->where(fn (Builder $query) => $query->where('account_id', 1))
```

**Ignorar registros eliminados de forma lógica en comprobaciones únicas:**

De forma predeterminada, la regla unique incluye registros eliminados de forma lógica al determinar la unicidad. Para excluir registros eliminados de forma lógica de la verificación de unicidad, puedes invocar el método `withoutTrashed`:

```php
Rule::unique('users')->withoutTrashed();
```

Si tu modelo utiliza un nombre de columna distinto de `deleted_at` para registros eliminados de forma lógica, puedes proporcionar el nombre de la columna al invocar el método `withoutTrashed`:

```php
Rule::unique('users')->withoutTrashed('was_deleted_at');
```

<a id="rule-uppercase"></a>
#### uppercase

El campo bajo validación debe estar en mayúsculas.

<a id="rule-url"></a>
#### url

El campo bajo validación debe ser una URL válida.

Si deseas especificar los protocolos URL que deben considerarse válidos, puedes pasarlos como parámetros de regla de validación:

```php
'url' => ['url:http,https'],

'game' => ['url:minecraft,steam'],
```

Alternativamente, puedes utilizar el método `Rule::url`, especificando los protocolos permitidos mediante el método `protocols`:

```php
'url' => [Rule::url()->protocols(['http', 'https'])],
```

<a id="rule-ulid"></a>
#### ulid

El campo bajo validación debe ser un [Identificador universalmente único lexicográfico ordenable](https://github.com/ulid/spec) (ULID) válido.

<a id="rule-uuid"></a>
#### uuid

El campo bajo validación debe ser un identificador único universal (UUID) RFC 9562 (versión 1, 3, 4, 5, 6, 7 u 8) válido.

También puedes validar que el UUID proporcionado coincida con una especificación de UUID por versión:

```php
'uuid' => ['uuid:4']
```

Alternativamente, puedes usar el método `Rule::uuid` y especificar la versión del UUID mediante el método `version`:

```php
'uuid' => [Rule::uuid()->version(4)],
```

<a id="conditionally-adding-rules"></a>
## Agregar reglas condicionalmente

<a id="skipping-validation-when-fields-have-certain-values"></a>
#### Omitir la validación cuando los campos tienen ciertos valores

Es posible que en ocasiones desees no validar un campo determinado si otro campo tiene un valor determinado. Puedes lograr esto utilizando la regla de validación `exclude_if`. En este ejemplo, los campos `appointment_date` y `doctor_name` no se validarán si el campo `has_appointment` tiene un valor de `false`:

```php
use Illuminate\Support\Facades\Validator;

$validator = Validator::make($data, [
    'has_appointment' => ['required', 'boolean'],
    'appointment_date' => ['exclude_if:has_appointment,false', 'required', 'date'],
    'doctor_name' => ['exclude_if:has_appointment,false', 'required', 'string'],
]);
```

Alternativamente, puedes usar la regla `exclude_unless` para no validar un campo determinado a menos que otro campo tenga un valor determinado:

```php
$validator = Validator::make($data, [
    'has_appointment' => ['required', 'boolean'],
    'appointment_date' => ['exclude_unless:has_appointment,true', 'required', 'date'],
    'doctor_name' => ['exclude_unless:has_appointment,true', 'required', 'string'],
]);
```

<a id="validating-when-present"></a>
#### Validación cuando el campo esté presente

En algunas situaciones, es posible que desees ejecutar comprobaciones de validación en un campo **solo** si ese campo está presente en los datos que se están validando. Para lograr esto rápidamente, agrega la regla `sometimes` a tu lista de reglas:

```php
$validator = Validator::make($data, [
    'email' => ['sometimes', 'required', 'email'],
]);
```

En el ejemplo anterior, el campo `email` solo se validará si está presente en el array `$data`.

> **Nota:**
> Si estás intentando validar un campo que siempre debería estar presente pero que puede estar vacío, consulta [esta nota sobre los campos opcionales](#a-note-on-optional-fields).

<a id="complex-conditional-validation"></a>
#### Validación condicional compleja

A veces es posible que desees agregar reglas de validación basadas en una lógica condicional más compleja. Por ejemplo, es posible que desees solicitar un campo determinado solo si otro campo tiene un valor mayor que 100. O puedes necesitar que dos campos tengan un valor determinado solo cuando hay otro campo presente. Agregar estas reglas de validación no tiene por qué ser complicado. Primero, crea una instancia `Validator` con tus _reglas estáticas_ que nunca cambian:

```php
use Illuminate\Support\Facades\Validator;

$validator = Validator::make($request->all(), [
    'email' => ['required', 'email'],
    'games' => ['required', 'integer', 'min:0'],
]);
```

Supongamos que nuestra aplicación web es para coleccionistas de juegos. Si un coleccionista de juegos se registra en nuestra aplicación y posee más de 100 juegos, queremos que explique por qué posee tantos juegos. Por ejemplo, tal vez tengan una tienda de reventa de juegos o tal vez simplemente les guste coleccionar juegos. Para agregar este requisito de forma condicional, podemos usar el método `sometimes` en la instancia `Validator`.

```php
use Illuminate\Support\Fluent;

$validator->sometimes('reason', ['required', 'max:500'], function (Fluent $input) {
    return $input->games >= 100;
});
```

El primer argumento pasado al método `sometimes` es el nombre del campo que estamos validando condicionalmente. El segundo argumento es una lista de las reglas que queremos agregar. Si la función anónima pasada como tercer argumento devuelve `true`, se agregarán las reglas. Este método facilita la creación de validaciones condicionales complejas. Incluso puedes agregar validaciones condicionales para varios campos a la vez:

```php
$validator->sometimes(['reason', 'cost'], 'required', function (Fluent $input) {
    return $input->games >= 100;
});
```

> **Nota:**
> El parámetro `$input` pasado a tu función anónima será una instancia de `Illuminate\Support\Fluent` y podrá usarse para acceder a tus entradas y archivos bajo validación.

<a id="complex-conditional-array-validation"></a>
#### Validación condicional compleja de arrays

A veces es posible que desees validar un campo basándose en otro campo en el mismo array anidado cuyo índice no conoces. En estas situaciones, puedes permitir que tu función anónima reciba un segundo argumento que será el elemento individual actual en el array que se está validando:

```php
$input = [
    'channels' => [
        [
            'type' => 'email',
            'address' => 'abigail@example.com',
        ],
        [
            'type' => 'url',
            'address' => 'https://example.com',
        ],
    ],
];

$validator->sometimes('channels.*.address', 'email', function (Fluent $input, Fluent $item) {
    return $item->type === 'email';
});

$validator->sometimes('channels.*.address', 'url', function (Fluent $input, Fluent $item) {
    return $item->type !== 'email';
});
```

Al igual que el parámetro `$input` pasado a la función anónima, el parámetro `$item` es una instancia de `Illuminate\Support\Fluent` cuando los datos del atributo son un array; de lo contrario, es una cadena.

<a id="validating-arrays"></a>
## Validación de arrays

Como se analiza en la [documentación de la regla de validación de arrays](#rule-array), la regla `array` acepta una lista de claves de array permitidas. Si hay claves adicionales presentes dentro del array, la validación fallará:

```php
use Illuminate\Support\Facades\Validator;

$input = [
    'user' => [
        'name' => 'Taylor Otwell',
        'username' => 'taylorotwell',
        'admin' => true,
    ],
];

Validator::make($input, [
    'user' => ['array:name,username'],
]);
```

En general, siempre debes especificar las claves de array que pueden estar presentes dentro de tu array. De lo contrario, los métodos `validate` y `validated` del validador devolverán todos los datos validados, incluido el array y todas sus claves, incluso si esas claves no fueron validadas por otras reglas de validación de arrays anidados.

<a id="validating-nested-array-input"></a>
### Validación de datos de entrada de arrays anidados

Validar los campos de entrada de formularios anidados basados en arrays no tiene por qué ser una molestia. Puedes utilizar "notación de puntos" para validar atributos dentro de un array. Por ejemplo, si la solicitud HTTP entrante contiene un campo `photos[profile]`, puedes validarlo así:

```php
use Illuminate\Support\Facades\Validator;

$validator = Validator::make($request->all(), [
    'photos.profile' => ['required', 'image'],
]);
```

También puedes validar cada elemento de un array. Por ejemplo, para validar que cada correo electrónico en un campo de entrada de array determinado sea único, puedes hacer lo siguiente:

```php
$validator = Validator::make($request->all(), [
    'users.*.email' => ['email', 'unique:users'],
    'users.*.first_name' => ['required_with:users.*.last_name'],
]);
```

Del mismo modo, puedes utilizar el carácter `*` al especificar [mensajes de validación personalizados en tus archivos de idioma](#custom-messages-for-specific-attributes), lo que facilita el uso de un único mensaje de validación para campos basados en arrays:

```php
'custom' => [
    'users.*.email' => [
        'unique' => 'Each user must have a unique email address',
    ]
],
```

<a id="accessing-nested-array-data"></a>
#### Acceso a datos de arrays anidados

A veces es posible que necesites acceder al valor de un elemento de array anidado determinado al asignar reglas de validación al atributo. Puedes lograr esto utilizando el método `Rule::forEach`. El método `forEach` acepta una función anónima que se invocará para cada iteración del atributo de array bajo validación y recibirá el valor del atributo y el nombre de atributo explícito y completamente expandido. La función anónima debería devolver un array de reglas para asignar al elemento del array:

```php
use App\Rules\HasPermission;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

$validator = Validator::make($request->all(), [
    'companies.*.id' => Rule::forEach(function (string|null $value, string $attribute) {
        return [
            Rule::exists(Company::class, 'id'),
            new HasPermission('manage-company', $value),
        ];
    }),
]);
```

<a id="error-message-indexes-and-positions"></a>
### Índices y posiciones de mensajes de error

Al validar arrays, es posible que desees hacer referencia al índice o la posición de un elemento en particular que falló la validación dentro del mensaje de error que muestra tu aplicación. Para lograr esto, puedes incluir los marcadores de posición `:index` (comienza desde `0`), `:position` (comienza desde `1`) o `:ordinal-position` (comienza desde `1st`) dentro de tu [mensaje de validación personalizado](#manual-customizing-the-error-messages):

```php
use Illuminate\Support\Facades\Validator;

$input = [
    'photos' => [
        [
            'name' => 'BeachVacation.jpg',
            'description' => 'A photo of my beach vacation!',
        ],
        [
            'name' => 'GrandCanyon.jpg',
            'description' => '',
        ],
    ],
];

Validator::validate($input, [
    'photos.*.description' => ['required'],
], [
    'photos.*.description.required' => 'Please describe photo #:position.',
]);
```

Dado el ejemplo anterior, la validación fallará y se mostrará al usuario el siguiente error: _"Describa la foto número 2"._

Si es necesario, puedes hacer referencia a índices y posiciones más profundamente anidados a través de `second-index`, `second-position`, `third-index`, `third-position`, etc.

```php
'photos.*.attributes.*.string' => 'Invalid attribute for photo #:second-position.',
```

<a id="validating-files"></a>
## Validación de archivos

Laravel proporciona una variedad de reglas de validación que pueden usarse para validar archivos cargados, como `mimes`, `image`, `min` y `max`. Si bien puedes especificar estas reglas individualmente al validar archivos, Laravel también ofrece un constructor de reglas de validación de archivos fluido que puede resultarte conveniente:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\File;

Validator::validate($input, [
    'attachment' => [
        'required',
        File::types(['mp3', 'wav'])
            ->min(1024)
            ->max(12 * 1024),
    ],
]);
```

<a id="validating-files-file-types"></a>
#### Validación de tipos de archivos

Aunque solo necesitas especificar las extensiones al invocar el método `types`, este método en realidad valida el tipo MIME del archivo leyendo el contenido del archivo y adivinando su tipo MIME. Puedes encontrar una lista completa de los tipos MIME y sus correspondientes extensiones en la siguiente ubicación:

[https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types](https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types)

<a id="validating-files-file-sizes"></a>
#### Validación de tamaños de archivos

Para mayor comodidad, los tamaños de archivo mínimo y máximo se pueden especificar como una cadena con un sufijo que indica las unidades de tamaño del archivo. Se admiten los sufijos `kb`, `mb`, `gb` y `tb`:

```php
File::types(['mp3', 'wav'])
    ->min('1kb')
    ->max('10mb');
```

<a id="validating-files-image-files"></a>
#### Validación de archivos de imagen

Si tu aplicación acepta imágenes cargadas por tus usuarios, puedes utilizar el método constructor `image` de la regla `File` para asegurarse de que el archivo bajo validación sea una imagen (jpg, jpeg, png, bmp, gif, webp, avif, heic o heif).

Además, se podrá utilizar la regla `dimensions` para limitar las dimensiones de la imagen:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

Validator::validate($input, [
    'photo' => [
        'required',
        File::image()
            ->min(1024)
            ->max(12 * 1024)
            ->dimensions(Rule::dimensions()->maxWidth(1000)->maxHeight(500)),
    ],
]);
```

> **Nota:**
> Puedes encontrar más información sobre la validación de las dimensiones de la imagen en la [documentación de reglas de dimensiones](#rule-dimensions).

> **Advertencia:**
> De forma predeterminada, la regla `image` no permite archivos SVG debido a la posibilidad de vulnerabilidades XSS. Si necesitas permitir archivos SVG, puedes pasar `allowSvg: true` a la regla `image`: `File::image(allowSvg: true)`.

<a id="validating-files-image-dimensions"></a>
#### Validación de dimensiones de imagen

También puedes validar las dimensiones de una imagen. Por ejemplo, para validar que una imagen cargada tenga al menos 1000 píxeles de ancho y 500 píxeles de alto, puedes utilizar la regla `dimensions`:

```php
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

File::image()->dimensions(
    Rule::dimensions()
        ->maxWidth(1000)
        ->maxHeight(500)
);
```

> **Nota:**
> Puedes encontrar más información sobre la validación de las dimensiones de la imagen en la [documentación de reglas de dimensiones](#rule-dimensions).

<a id="validating-passwords"></a>
## Validación de contraseñas

Para garantizar que las contraseñas tengan un nivel adecuado de complejidad, puedes utilizar el objeto de regla `Password` de Laravel:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

$validator = Validator::make($request->all(), [
    'password' => ['required', 'confirmed', Password::min(8)],
]);
```

El objeto de regla `Password` te permite personalizar fácilmente los requisitos de complejidad de la contraseña para tu aplicación, como especificar que las contraseñas requieran al menos una letra, número, símbolo o caracteres que combinen mayúsculas y minúsculas:

```php
// Require at least 8 characters...
Password::min(8);

// Require at most 256 characters...
Password::min(16)->max(256);

// Require at least one letter...
Password::min(8)->letters();

// Require at least one uppercase and one lowercase letter...
Password::min(8)->mixedCase();

// Require at least one number...
Password::min(8)->numbers();

// Require at least one symbol...
Password::min(8)->symbols();
```

Además, puedes asegurarte de que una contraseña no se haya visto comprometida en una filtración pública de contraseñas utilizando el método `uncompromised`:

```php
Password::min(8)->uncompromised();
```

Internamente, el objeto de regla `Password` utiliza el modelo [k-Anonymity](https://en.wikipedia.org/wiki/K-anonymity) para determinar si una contraseña se ha filtrado a través del servicio [haveibeenpwned.com](https://haveibeenpwned.com) sin sacrificar la privacidad o seguridad del usuario.

De forma predeterminada, si una contraseña aparece al menos una vez en una filtración de datos, se considerará comprometida. Puedes personalizar este umbral utilizando el primer argumento del método `uncompromised`:

```php
// Ensure the password appears no more than 3 times in the same data leak...
Password::min(8)->uncompromised(3);
```

Por supuesto, puedes encadenar todos los métodos de los ejemplos anteriores:

```php
Password::min(8)
    ->max(256)
    ->letters()
    ->mixedCase()
    ->numbers()
    ->symbols()
    ->uncompromised();
```

Puedes convertir un objeto de regla `Password` en una cadena adecuada para el atributo HTML `passwordrules` utilizando el método `toPasswordRulesString`:

```blade
<input
    type="password"
    name="password"
    autocomplete="new-password"
    passwordrules="{{ Password::defaults()->toPasswordRulesString() }}"
/>
```

<a id="defining-default-password-rules"></a>
#### Definición de reglas de contraseña predeterminadas

Puede que te resulte conveniente especificar las reglas de validación predeterminadas para las contraseñas en una única ubicación de tu aplicación. Puedes lograr esto fácilmente utilizando el método `Password::defaults`, que acepta una función anónima. La función anónima dada al método `defaults` debería devolver la configuración predeterminada de la regla Password. Normalmente, el método `defaults` se debe llamar dentro del método `boot` de uno de los proveedores de servicios de tu aplicación:

```php
use Illuminate\Validation\Rules\Password;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Password::defaults(function () {
        $rule = Password::min(8);

        return $this->app->isProduction()
            ? $rule->mixedCase()->uncompromised()
            : $rule;
    });
}
```

Luego, cuando desees aplicar las reglas predeterminadas a una contraseña particular que se está validando, puedes invocar el método `defaults` sin argumentos:

```php
'password' => ['required', Password::defaults()],
```

En ocasiones, es posible que desees adjuntar reglas de validación adicionales a tus reglas de validación de contraseña predeterminadas. Puedes utilizar el método `rules` para lograr esto:

```php
use App\Rules\ZxcvbnRule;

Password::defaults(function () {
    $rule = Password::min(8)->rules([new ZxcvbnRule]);

    // ...
});
```

<a id="custom-validation-rules"></a>
## Reglas de validación personalizadas

<a id="using-rule-objects"></a>
### Uso de objetos de regla

Laravel proporciona una variedad de reglas de validación útiles; sin embargo, es posible que desees definir tus propias reglas. Un método para registrar reglas de validación personalizadas es utilizar objetos de reglas. Para generar un nuevo objeto de regla, puedes utilizar el comando Artisan `make:rule`. Usemos este comando para generar una regla que verifique que una cadena esté en mayúsculas. Laravel colocará la nueva regla en el directorio `app/Rules`. Si este directorio no existe, Laravel lo creará cuando ejecutes el comando Artisan para crear tu regla:

```shell
php artisan make:rule Uppercase
```

Una vez creada la regla, estamos listos para definir su comportamiento. Un objeto de regla contiene un único método: `validate`. Este método recibe el nombre del atributo, su valor y un callback que debe invocarse en caso de error con el mensaje de error de validación:

```php
<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class Uppercase implements ValidationRule
{
    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (strtoupper($value) !== $value) {
            $fail('The :attribute must be uppercase.');
        }
    }
}
```

Una vez que se haya definido la regla, puedes adjuntarla a un validador pasando una instancia del objeto de regla con tus otras reglas de validación:

```php
use App\Rules\Uppercase;

$request->validate([
    'name' => ['required', 'string', new Uppercase],
]);
```

#### Traducir mensajes de validación

En lugar de proporcionar un mensaje de error literal a la función anónima `$fail`, también puedes proporcionar una [clave de cadena de traducción](../localization/) e indicarle a Laravel que traduzca el mensaje de error:

```php
if (strtoupper($value) !== $value) {
    $fail('validation.uppercase')->translate();
}
```

Si es necesario, puedes proporcionar reemplazos de marcadores de posición y el idioma preferido como primer y segundo argumento del método `translate`:

```php
$fail('validation.location')->translate([
    'value' => $this->value,
], 'fr');
```

#### Acceso a datos adicionales

Si tu clase de regla de validación personalizada necesita acceder a todos los demás datos sometidos a validación, tu clase de regla puede implementar la interfaz `Illuminate\Contracts\Validation\DataAwareRule`. Esta interfaz requiere que tu clase defina un método `setData`. Laravel invocará automáticamente este método (antes de que continúe la validación) con todos los datos bajo validación:

```php
<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\DataAwareRule;
use Illuminate\Contracts\Validation\ValidationRule;

class Uppercase implements DataAwareRule, ValidationRule
{
    /**
     * All of the data under validation.
     *
     * @var array<string, mixed>
     */
    protected $data = [];

    // ...

    /**
     * Set the data under validation.
     *
     * @param  array<string, mixed>  $data
     */
    public function setData(array $data): static
    {
        $this->data = $data;

        return $this;
    }
}
```

O, si tu regla de validación requiere acceso a la instancia del validador que realiza la validación, puedes implementar la interfaz `ValidatorAwareRule`:

```php
<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\ValidatorAwareRule;
use Illuminate\Validation\Validator;

class Uppercase implements ValidationRule, ValidatorAwareRule
{
    /**
     * The validator instance.
     *
     * @var \Illuminate\Validation\Validator
     */
    protected $validator;

    // ...

    /**
     * Set the current validator.
     */
    public function setValidator(Validator $validator): static
    {
        $this->validator = $validator;

        return $this;
    }
}
```

<a id="using-closures"></a>
### Uso de funciones anónimas

Si solo necesitas la funcionalidad de una regla personalizada una vez en tu aplicación, puedes usar una función anónima en lugar de un objeto de regla. La función anónima recibe el nombre del atributo, el valor del atributo y un callback `$fail` que debe llamarse si falla la validación:

```php
use Illuminate\Support\Facades\Validator;
use Closure;

$validator = Validator::make($request->all(), [
    'title' => [
        'required',
        'max:255',
        function (string $attribute, mixed $value, Closure $fail) {
            if ($value === 'foo') {
                $fail("The {$attribute} is invalid.");
            }
        },
    ],
]);
```

<a id="implicit-rules"></a>
### Reglas implícitas

De forma predeterminada, cuando un atributo que se está validando no está presente o contiene una cadena vacía, no se ejecutan las reglas de validación normales, incluidas las reglas personalizadas. Por ejemplo, la regla [unique](#rule-unique) no se ejecutará en una cadena vacía:

```php
use Illuminate\Support\Facades\Validator;

$rules = ['name' => ['unique:users,name']];

$input = ['name' => ''];

Validator::make($input, $rules)->passes(); // true
```

Para que se ejecute una regla personalizada incluso cuando un atributo está vacío, la regla debe implicar que el atributo es obligatorio. Para generar rápidamente un nuevo objeto de regla implícita, puedes usar el comando Artisan `make:rule` con la opción `--implicit`:

```shell
php artisan make:rule Uppercase --implicit
```

> **Advertencia:**
> Una regla "implícita" solo _implica_ que el atributo es obligatorio. Depende de ti si realmente invalida un atributo faltante o vacío.