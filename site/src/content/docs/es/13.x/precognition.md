---
title: "Precognición"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Validación en vivo](#live-validation)
    - [Usando Vue](#using-vue)
    - [Usando React](#using-react)
    - [Usando Alpine y Blade](#using-alpine)
    - [Configurando Axios](#configuring-axios)
- [Validando matrices](#validating-arrays)
- [Personalizar reglas de validación](#customizing-validation-rules)
- [Manejo de cargas de archivos](#handling-file-uploads)
- [Gestión de efectos secundarios](#managing-side-effects)
- [Prueba](#testing)

<a id="introduction"></a>
## Introducción

Laravel Precognition le permite anticipar el resultado de una futura solicitud HTTP. Uno de los principales casos de uso de Precognition es la capacidad de proporcionar validación "en vivo" para su aplicación JavaScript frontend sin tener que duplicar las reglas de validación backend de su aplicación.

Cuando Laravel recibe una "solicitud precognitiva", ejecutará todo el middleware de la ruta y resolverá las dependencias del controlador de la ruta, incluida la validación [formulario request](../validation/#form-request-validation), pero en realidad no ejecutará el método del controlador de la ruta.

> **Nota:**
> A partir de Inertia 2.3, el soporte de precognición está integrado. Consulte la [documentación de Inertia Forms](https://inertiajs.com/forms) para obtener más información. Las versiones anteriores de Inertia requieren Precognition 0.x.

<a id="live-validation"></a>
## Validación en vivo

<a id="using-vue"></a>
### Usando Vue

Con Laravel Precognition, puede ofrecer experiencias de validación en vivo a sus usuarios sin tener que duplicar sus reglas de validación en su aplicación frontend Vue. Para ilustrar cómo funciona, creemos un formulario para crear nuevos usuarios dentro de nuestra aplicación.

Primero, para habilitar la precognición para una ruta, se debe agregar el middleware `HandlePrecognitiveRequests` a la definición de ruta. También debes crear un [formulario request](../validation/#form-request-validation) para albergar las reglas de validación de la ruta:

```php
use App\Http\Requests\StoreUserRequest;
use Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests;

Route::post('/users', function (StoreUserRequest $request) {
    // ...
})->middleware([HandlePrecognitiveRequests::class]);
```

A continuación, debe instalar los asistentes de interfaz de Laravel Precognition para Vue a través de NPM:

```shell
npm install laravel-precognition-vue
```

Con el paquete Laravel Precognition instalado, ahora puede crear un objeto de formulario utilizando la función `useForm` de Precognition, proporcionando el método HTTP (`post`), la URL de destino (`/users`) y los datos del formulario inicial.

Luego, para habilitar la validación en vivo, invoque el método `validate` del formulario en el evento `change` de cada entrada, proporcionando el nombre de la entrada:

```vue
<script setup>
import { useForm } from 'laravel-precognition-vue';

const form = useForm('post', '/users', {
    name: '',
    email: '',
});

const submit = () => form.submit();
</script>

<template>
    <form @submit.prevent="submit">
        <label for="name">Name</label>
        <input
            id="name"
            v-model="form.name"
            @change="form.validate('name')"
        />
        <div v-if="form.invalid('name')">
            {{ form.errors.name }}
        </div>

        <label for="email">Email</label>
        <input
            id="email"
            type="email"
            v-model="form.email"
            @change="form.validate('email')"
        />
        <div v-if="form.invalid('email')">
            {{ form.errors.email }}
        </div>

        <button :disabled="form.processing">
            Create User
        </button>
    </form>
</template>
```

Ahora, a medida que el usuario completa el formulario, Precognition proporcionará resultados de validación en vivo impulsados ​​por las reglas de validación en la solicitud del formulario de la ruta. Cuando se cambian las entradas del formulario, se enviará una solicitud de validación "precognitiva" antirrebote a su aplicación Laravel. Puede configurar el tiempo de espera de rebote llamando a la función `setValidationTimeout` del formulario:

```js
form.setValidationTimeout(3000);
```

Cuando una solicitud de validación está en curso, la propiedad `validating` del formulario será `true`:

```html
<div v-if="form.validating">
    Validating...
</div>
```

Cualquier error de validación devuelto durante una solicitud de validación o el envío de un formulario completará automáticamente el objeto `errors` del formulario:

```html
<div v-if="form.invalid('email')">
    {{ form.errors.email }}
</div>
```

Puede determinar si el formulario tiene algún error utilizando la propiedad `hasErrors` del formulario:

```html
<div v-if="form.hasErrors">
    <!-- ... -->
</div>
```

También puede determinar si una entrada pasó o no la validación pasando el nombre de la entrada a las funciones `valid` y `invalid` del formulario, respectivamente:

```html
<span v-if="form.valid('email')">
    ✅
</span>

<span v-else-if="form.invalid('email')">
    ❌
</span>
```

> **Advertencia:**
> Una entrada de formulario solo aparecerá como válida o no válida una vez que haya cambiado y se haya recibido una respuesta de validación.

Si está validando un subconjunto de las entradas de un formulario con Precognición, puede resultar útil borrar los errores manualmente. Puede utilizar la función `forgetError` del formulario para lograr esto:

```html
<input
    id="avatar"
    type="file"
    @change="(e) => {
        form.avatar = e.target.files[0]

        form.forgetError('avatar')
    }"
>
```

Como hemos visto, puede conectarse al evento `change` de una entrada y validar entradas individuales a medida que el usuario interactúa con ellas; sin embargo, es posible que deba validar las entradas con las que el usuario aún no ha interactuado. Esto es común cuando se crea un "asistente", donde desea validar todas las entradas visibles, ya sea que el usuario haya interactuado con ellas o no, antes de pasar al siguiente paso.

Para hacer esto con Precognition, debe llamar al método `validate` pasando los nombres de los campos que desea validar a la clave de configuración `only`. Puede manejar el resultado de la validación con devoluciones de llamada `onSuccess` o `onValidationError`:

```html
<button
    type="button"
    @click="form.validate({
        only: ['name', 'email', 'phone'],
        onSuccess: (response) => nextStep(),
        onValidationError: (response) => /* ... */,
    })"
>Next Step</button>
```

Por supuesto, también puede ejecutar código como reacción a la respuesta al envío del formulario. La función `submit` del formulario devuelve una promesa de solicitud de Axios. Esto proporciona una manera conveniente de acceder a la carga útil de respuesta, restablecer las entradas del formulario en caso de envío exitoso o manejar una solicitud fallida:

```js
const submit = () => form.submit()
    .then(response => {
        form.reset();

        alert('User created.');
    })
    .catch(error => {
        alert('An error occurred.');
    });
```

Puede determinar si una solicitud de envío de formulario está en proceso inspeccionando la propiedad `processing` del formulario:

```html
<button :disabled="form.processing">
    Submit
</button>
```

<a id="using-react"></a>
### Usando React

Con Laravel Precognition, puede ofrecer experiencias de validación en vivo a sus usuarios sin tener que duplicar sus reglas de validación en su aplicación frontend React. Para ilustrar cómo funciona, creemos un formulario para crear nuevos usuarios dentro de nuestra aplicación.

Primero, para habilitar la precognición para una ruta, se debe agregar el middleware `HandlePrecognitiveRequests` a la definición de ruta. También debes crear un [formulario request](../validation/#form-request-validation) para albergar las reglas de validación de la ruta:

```php
use App\Http\Requests\StoreUserRequest;
use Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests;

Route::post('/users', function (StoreUserRequest $request) {
    // ...
})->middleware([HandlePrecognitiveRequests::class]);
```

A continuación, debe instalar los asistentes de interfaz de Laravel Precognition para React a través de NPM:

```shell
npm install laravel-precognition-react
```

Con el paquete Laravel Precognition instalado, ahora puede crear un objeto de formulario utilizando la función `useForm` de Precognition, proporcionando el método HTTP (`post`), la URL de destino (`/users`) y los datos del formulario inicial.

Para habilitar la validación en vivo, debe escuchar el evento `change` y `blur` de cada entrada. En el controlador de eventos `change`, debes configurar los datos del formulario con la función `setData`, pasando el nombre de la entrada y el nuevo valor. Luego, en el controlador de eventos `blur`, invoque el método `validate` del formulario, proporcionando el nombre de la entrada:

```jsx
import { useForm } from 'laravel-precognition-react';

export default function Form() {
    const form = useForm('post', '/users', {
        name: '',
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        form.submit();
    };

    return (
        <form onSubmit={submit}>
            <label htmlFor="name">Name</label>
            <input
                id="name"
                value={form.data.name}
                onChange={(e) => form.setData('name', e.target.value)}
                onBlur={() => form.validate('name')}
            />
            {form.invalid('name') && <div>{form.errors.name}</div>}

            <label htmlFor="email">Email</label>
            <input
                id="email"
                value={form.data.email}
                onChange={(e) => form.setData('email', e.target.value)}
                onBlur={() => form.validate('email')}
            />
            {form.invalid('email') && <div>{form.errors.email}</div>}

            <button disabled={form.processing}>
                Create User
            </button>
        </form>
    );
};
```

Ahora, a medida que el usuario completa el formulario, Precognition proporcionará resultados de validación en vivo impulsados ​​por las reglas de validación en la solicitud del formulario de la ruta. Cuando se cambian las entradas del formulario, se enviará una solicitud de validación "precognitiva" antirrebote a su aplicación Laravel. Puede configurar el tiempo de espera de rebote llamando a la función `setValidationTimeout` del formulario:

```js
form.setValidationTimeout(3000);
```

Cuando una solicitud de validación está en curso, la propiedad `validating` del formulario será `true`:

```jsx
{form.validating && <div>Validating...</div>}
```

Cualquier error de validación devuelto durante una solicitud de validación o el envío de un formulario completará automáticamente el objeto `errors` del formulario:

```jsx
{form.invalid('email') && <div>{form.errors.email}</div>}
```

Puede determinar si el formulario tiene algún error utilizando la propiedad `hasErrors` del formulario:

```jsx
{form.hasErrors && <div><!-- ... --></div>}
```

También puede determinar si una entrada pasó o no la validación pasando el nombre de la entrada a las funciones `valid` y `invalid` del formulario, respectivamente:

```jsx
{form.valid('email') && <span>✅</span>}

{form.invalid('email') && <span>❌</span>}
```

> **Advertencia:**
> Una entrada de formulario solo aparecerá como válida o no válida una vez que haya cambiado y se haya recibido una respuesta de validación.

Si está validando un subconjunto de las entradas de un formulario con Precognición, puede resultar útil borrar los errores manualmente. Puede utilizar la función `forgetError` del formulario para lograr esto:

```jsx
<input
    id="avatar"
    type="file"
    onChange={(e) => {
        form.setData('avatar', e.target.files[0]);

        form.forgetError('avatar');
    }}
>
```

Como hemos visto, puede conectarse al evento `blur` de una entrada y validar entradas individuales a medida que el usuario interactúa con ellas; sin embargo, es posible que deba validar las entradas con las que el usuario aún no ha interactuado. Esto es común cuando se crea un "asistente", donde desea validar todas las entradas visibles, ya sea que el usuario haya interactuado con ellas o no, antes de pasar al siguiente paso.

Para hacer esto con Precognition, debe llamar al método `validate` pasando los nombres de los campos que desea validar a la clave de configuración `only`. Puede manejar el resultado de la validación con devoluciones de llamada `onSuccess` o `onValidationError`:

```jsx
<button
    type="button"
    onClick={() => form.validate({
        only: ['name', 'email', 'phone'],
        onSuccess: (response) => nextStep(),
        onValidationError: (response) => /* ... */,
    })}
>Next Step</button>
```

Por supuesto, también puede ejecutar código como reacción a la respuesta al envío del formulario. La función `submit` del formulario devuelve una promesa de solicitud de Axios. Esto proporciona una manera conveniente de acceder a la carga útil de respuesta, restablecer las entradas del formulario en un envío exitoso o manejar una solicitud fallida:

```js
const submit = (e) => {
    e.preventDefault();

    form.submit()
        .then(response => {
            form.reset();

            alert('User created.');
        })
        .catch(error => {
            alert('An error occurred.');
        });
};
```

Puede determinar si una solicitud de envío de formulario está en proceso inspeccionando la propiedad `processing` del formulario:

```html
<button disabled={form.processing}>
    Submit
</button>
```

<a id="using-alpine"></a>
### Usando Alpine y Blade

Con Laravel Precognition, puede ofrecer experiencias de validación en vivo a sus usuarios sin tener que duplicar sus reglas de validación en su aplicación Alpine frontal. Para ilustrar cómo funciona, creemos un formulario para crear nuevos usuarios dentro de nuestra aplicación.

Primero, para habilitar la precognición para una ruta, se debe agregar el middleware `HandlePrecognitiveRequests` a la definición de ruta. También debes crear un [formulario request](../validation/#form-request-validation) para albergar las reglas de validación de la ruta:

```php
use App\Http\Requests\CreateUserRequest;
use Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests;

Route::post('/users', function (CreateUserRequest $request) {
    // ...
})->middleware([HandlePrecognitiveRequests::class]);
```

A continuación, debe instalar los asistentes de interfaz de Laravel Precognition para Alpine a través de NPM:

```shell
npm install laravel-precognition-alpine
```

Luego, registre el complemento Precognition con Alpine en su archivo `resources/js/app.js`:

```js
import Alpine from 'alpinejs';
import Precognition from 'laravel-precognition-alpine';

window.Alpine = Alpine;

Alpine.plugin(Precognition);
Alpine.start();
```

Con el paquete Laravel Precognition instalado y registrado, ahora puede crear un objeto de formulario usando la "magia" `$form` de Precognition, proporcionando el método HTTP (`post`), la URL de destino (`/users`) y los datos del formulario inicial.

Para habilitar la validación en vivo, debe vincular los datos del formulario a su entrada relevante y luego escuchar el evento `change` de cada entrada. En el controlador de eventos `change`, debe invocar el método `validate` del formulario, proporcionando el nombre de la entrada:

```html
<form x-data="{
    form: $form('post', '/register', {
        name: '',
        email: '',
    }),
}">
    @csrf
    <label for="name">Name</label>
    <input
        id="name"
        name="name"
        x-model="form.name"
        @change="form.validate('name')"
    />
    <template x-if="form.invalid('name')">
        <div x-text="form.errors.name"></div>
    </template>

    <label for="email">Email</label>
    <input
        id="email"
        name="email"
        x-model="form.email"
        @change="form.validate('email')"
    />
    <template x-if="form.invalid('email')">
        <div x-text="form.errors.email"></div>
    </template>

    <button :disabled="form.processing">
        Create User
    </button>
</form>
```

Ahora, a medida que el usuario completa el formulario, Precognition proporcionará resultados de validación en vivo impulsados ​​por las reglas de validación en la solicitud del formulario de la ruta. Cuando se cambian las entradas del formulario, se enviará una solicitud de validación "precognitiva" antirrebote a su aplicación Laravel. Puede configurar el tiempo de espera de rebote llamando a la función `setValidationTimeout` del formulario:

```js
form.setValidationTimeout(3000);
```

Cuando una solicitud de validación está en curso, la propiedad `validating` del formulario será `true`:

```html
<template x-if="form.validating">
    <div>Validating...</div>
</template>
```

Cualquier error de validación devuelto durante una solicitud de validación o el envío de un formulario completará automáticamente el objeto `errors` del formulario:

```html
<template x-if="form.invalid('email')">
    <div x-text="form.errors.email"></div>
</template>
```

Puede determinar si el formulario tiene algún error utilizando la propiedad `hasErrors` del formulario:

```html
<template x-if="form.hasErrors">
    <div><!-- ... --></div>
</template>
```

También puede determinar si una entrada pasó o no la validación pasando el nombre de la entrada a las funciones `valid` y `invalid` del formulario, respectivamente:

```html
<template x-if="form.valid('email')">
    <span>✅</span>
</template>

<template x-if="form.invalid('email')">
    <span>❌</span>
</template>
```

> **Advertencia:**
> Una entrada de formulario solo aparecerá como válida o no válida una vez que haya cambiado y se haya recibido una respuesta de validación.

Como hemos visto, puede conectarse al evento `change` de una entrada y validar entradas individuales a medida que el usuario interactúa con ellas; sin embargo, es posible que deba validar las entradas con las que el usuario aún no ha interactuado. Esto es común cuando se crea un "asistente", donde desea validar todas las entradas visibles, ya sea que el usuario haya interactuado con ellas o no, antes de pasar al siguiente paso.

Para hacer esto con Precognition, debe llamar al método `validate` pasando los nombres de los campos que desea validar a la clave de configuración `only`. Puede manejar el resultado de la validación con devoluciones de llamada `onSuccess` o `onValidationError`:

```html
<button
    type="button"
    @click="form.validate({
        only: ['name', 'email', 'phone'],
        onSuccess: (response) => nextStep(),
        onValidationError: (response) => /* ... */,
    })"
>Next Step</button>
```

Puede determinar si una solicitud de envío de formulario está en proceso inspeccionando la propiedad `processing` del formulario:

```html
<button :disabled="form.processing">
    Submit
</button>
```

<a id="repopulating-old-form-data"></a>
#### Repoblación de datos de formularios antiguos

En el ejemplo de creación de usuarios analizado anteriormente, utilizamos Precognición para realizar la validación en vivo; sin embargo, estamos realizando un envío de formulario tradicional del lado del servidor para enviar el formulario. Por lo tanto, el formulario debe completarse con cualquier entrada "antigua" y errores de validación devueltos por el envío del formulario del lado del servidor:

```html
<form x-data="{
    form: $form('post', '/register', {
        name: '{{ old('name') }}',
        email: '{{ old('email') }}',
    }).setErrors({{ Js::from($errors->messages()) }}),
}">
```

Alternativamente, si desea enviar el formulario a través de XHR, puede utilizar la función `submit` del formulario, que devuelve una promesa de solicitud de Axios:

```html
<form
    x-data="{
        form: $form('post', '/register', {
            name: '',
            email: '',
        }),
        submit() {
            this.form.submit()
                .then(response => {
                    this.form.reset();

                    alert('User created.')
                })
                .catch(error => {
                    alert('An error occurred.');
                });
        },
    }"
    @submit.prevent="submit"
>
```

<a id="configuring-axios"></a>
### Configurando Axios

Las bibliotecas de validación de Precognition utilizan el cliente HTTP [Axios](https://github.com/axios/axios) para enviar solicitudes al backend de su aplicación. Para mayor comodidad, la instancia de Axios se puede personalizar si así lo requiere su aplicación. Por ejemplo, cuando utiliza la biblioteca `laravel-precognition-vue`, puede agregar encabezados de solicitud adicionales a cada solicitud saliente en el archivo `resources/js/app.js` de su aplicación:

```js
import { client } from 'laravel-precognition-vue';

client.axios().defaults.headers.common['Authorization'] = authToken;
```

O, si ya tiene una instancia de Axios configurada para su aplicación, puede indicarle a Precognition que use esa instancia en su lugar:

```js
import Axios from 'axios';
import { client } from 'laravel-precognition-vue';

window.axios = Axios.create()
window.axios.defaults.headers.common['Authorization'] = authToken;

client.use(window.axios)
```

<a id="validating-arrays"></a>
## Validación de matrices

Puede utilizar comodines para validar campos dentro de matrices u objetos anidados. Cada `*` coincide con un único segmento de ruta:

```js
// Validate email for all users in an array...
form.validate('users.*.email');

// Validate all fields in a profile object...
form.validate('profile.*');

// Validate all fields for all users...
form.validate('users.*.*');
```

<a id="customizing-validation-rules"></a>
## Personalización de reglas de validación

Es posible personalizar las reglas de validación ejecutadas durante una solicitud precognitiva utilizando el método `isPrecognitive` de la solicitud.

Por ejemplo, en un formulario de creación de usuario, es posible que queramos validar que una contraseña "no esté comprometida" solo en el envío del formulario final. Para solicitudes de validación precognitiva simplemente validaremos que la contraseña sea obligatoria y tenga un mínimo de 8 caracteres. Usando el método `isPrecognitive`, podemos personalizar las reglas definidas por nuestra solicitud de formulario:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'password' => [
                'required',
                $this->isPrecognitive()
                    ? Password::min(8)
                    : Password::min(8)->uncompromised(),
            ],
            // ...
        ];
    }
}
```

<a id="handling-file-uploads"></a>
## Manejo de cargas de archivos

De forma predeterminada, Laravel Precognition no carga ni valida archivos durante una solicitud de validación precognitiva. Esto garantiza que los archivos grandes no se carguen innecesariamente varias veces.

Debido a este comportamiento, debe asegurarse de que su aplicación [personalice las reglas de validación de la solicitud de formulario correspondiente](#customizing-validation-rules) para especificar que el campo solo sea obligatorio para envíos de formularios completos:

```php
/**
 * Get the validation rules that apply to the request.
 *
 * @return array
 */
public function rules()
{
    return [
        'avatar' => [
            ...$this->isPrecognitive() ? [] : ['required'],
            'image',
            'mimes:jpg,png',
            'dimensions:ratio=3/2',
        ],
        // ...
    ];
}
```

Si desea incluir archivos en cada solicitud de validación, puede invocar la función `validateFiles` en su instancia de formulario del lado del cliente:

```js
form.validateFiles();
```

<a id="managing-side-effects"></a>
## Manejo de efectos secundarios

Al agregar el middleware `HandlePrecognitiveRequests` a una ruta, debe considerar si hay efectos secundarios en _otro_ middleware que deban omitirse durante una solicitud precognitiva.

Por ejemplo, es posible que tenga un middleware que incremente el número total de "interacciones" que cada usuario tiene con su aplicación, pero es posible que no desee que las solicitudes precognitivas se cuenten como una interacción. Para lograr esto, podemos verificar el método `isPrecognitive` de la solicitud antes de incrementar el recuento de interacciones:

```php
<?php

namespace App\Http\Middleware;

use App\Facades\Interaction;
use Closure;
use Illuminate\Http\Request;

class InteractionMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): mixed
    {
        if (! $request->isPrecognitive()) {
            Interaction::incrementFor($request->user());
        }

        return $next($request);
    }
}
```

<a id="testing"></a>
## Pruebas

Si desea realizar solicitudes precognitivas en sus pruebas, `TestCase` de Laravel incluye un asistente `withPrecognition` que agregará el encabezado de solicitud `Precognition`.

Además, si desea afirmar que una solicitud precognitiva fue exitosa, por ejemplo, no devolvió ningún error de validación, puede usar el método `assertSuccessfulPrecognition` en la respuesta:

```php tab=Pest
it('validates registration form with precognition', function () {
    $response = $this->withPrecognition()
        ->post('/register', [
            'name' => 'Taylor Otwell',
        ]);

    $response->assertSuccessfulPrecognition();

    expect(User::count())->toBe(0);
});
```

```php tab=PHPUnit
public function test_it_validates_registration_form_with_precognition()
{
    $response = $this->withPrecognition()
        ->post('/register', [
            'name' => 'Taylor Otwell',
        ]);

    $response->assertSuccessfulPrecognition();
    $this->assertSame(0, User::count());
}
```
