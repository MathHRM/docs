---
title: "Respuestas HTTP"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Creando respuestas](#creating-responses)
    - [Adjuntar encabezados a las respuestas](#attaching-headers-to-responses)
    - [Adjuntar cookies a las respuestas](#attaching-cookies-to-responses)
    - [Cookies y cifrado](#cookies-and-encryption)
- [Redirecciones](#redirects)
    - [Redireccionamiento a rutas designadas](#redirecting-named-routes)
    - [Redireccionando a Acciones del Controlador](#redirecting-controller-actions)
    - [Redireccionamiento a dominios externos](#redirecting-external-domains)
    - [Redireccionamiento con datos de sesión flasheados](#redirecting-with-flashed-session-data)
- [Otros tipos de respuesta](#other-response-types)
    - [Ver respuestas](#view-responses)
    - [Respuestas JSON](#json-responses)
    - [Respuestas Markdown](#markdown-responses)
    - [Descargas de archivos](#file-downloads)
    - [Respuestas de archivo](#file-responses)
- [Respuestas transmitidas](#streamed-responses)
    - [Consumiendo respuestas transmitidas](#consuming-streamed-responses)
    - [Respuestas JSON transmitidas](#streamed-json-responses)
    - [Transmisiones de eventos (SSE) ](#event-streams)
    - [Descargas transmitidas](#streamed-downloads)
- [Macros de respuesta](#response-macros)

<a id="creating-responses"></a>
## Creando respuestas

<a id="strings-arrays"></a>
#### Cadenas y matrices

Todas las rutas y controladores deben devolver una respuesta que se enviará al navegador del usuario. Laravel proporciona varias formas diferentes de devolver respuestas. La respuesta más básica es devolver una cadena desde una ruta o controlador. El marco convertirá automáticamente la cadena en una respuesta HTTP completa:

```php
Route::get('/', function () {
    return 'Hello World';
});
```

Además de devolver cadenas de sus rutas y controladores, también puede devolver matrices. El marco convertirá automáticamente la matriz en una respuesta JSON:

```php
Route::get('/', function () {
    return [1, 2, 3];
});
```

> **Nota:**
> ¿Sabías que también puedes devolver [colecciones Eloquent](../eloquent-collections/) de tus rutas o controladores? Se convertirán automáticamente a JSON. ¡Pruébalo!

<a id="response-objects"></a>
#### Objetos de respuesta

Por lo general, no solo devolverá cadenas o matrices simples de sus acciones de ruta. En su lugar, devolverá instancias `Illuminate\Http\Response` completas o [views](../views/).

Devolver una instancia `Response` completa le permite personalizar el código de estado HTTP y los encabezados de la respuesta. Una instancia `Response` hereda de la clase `Symfony\Component\HttpFoundation\Response`, que proporciona una variedad de métodos para crear respuestas HTTP:

```php
Route::get('/home', function () {
    return response('Hello World', 200)
        ->header('Content-Type', 'text/plain');
});
```

<a id="eloquent-models-and-collections"></a>
#### Modelos y colecciones elocuentes

También puede devolver [modelos y colecciones de Eloquent ORM](../eloquent/) directamente desde sus rutas y controladores. Cuando lo haga, Laravel convertirá automáticamente los modelos y colecciones a respuestas JSON respetando los [atributos ocultos](../eloquent-serialization/#hiding-attributes-from-json):

```php
use App\Models\User;

Route::get('/user/{user}', function (User $user) {
    return $user;
});
```

<a id="attaching-headers-to-responses"></a>
### Adjuntar encabezados a las respuestas

Tenga en cuenta que la mayoría de los métodos de respuesta son encadenables, lo que permite la construcción fluida de instancias de respuesta. Por ejemplo, puede utilizar el método `header` para agregar una serie de encabezados a la respuesta antes de enviársela al usuario:

```php
return response($content)
    ->header('Content-Type', $type)
    ->header('X-Header-One', 'Header Value')
    ->header('X-Header-Two', 'Header Value');
```

O puede utilizar el método `withHeaders` para especificar una serie de encabezados que se agregarán a la respuesta:

```php
return response($content)
    ->withHeaders([
        'Content-Type' => $type,
        'X-Header-One' => 'Header Value',
        'X-Header-Two' => 'Header Value',
    ]);
```

Puede eliminar encabezados específicos de una respuesta saliente utilizando el método `withoutHeader`:

```php
return response($content)->withoutHeader('X-Debug');

return response($content)->withoutHeader(['X-Debug', 'X-Powered-By']);
```

<a id="cache-control-middleware"></a>
#### Middleware de control de caché

Laravel incluye un middleware `cache.headers`, que puede usarse para configurar rápidamente el encabezado `Cache-Control` para un grupo de rutas. Las directivas deben proporcionarse utilizando el equivalente en "caso serpiente" de la directiva de control de caché correspondiente y deben estar separadas por un punto y coma. Si se especifica `etag` en la lista de directivas, se establecerá automáticamente un hash xxh128 del contenido de la respuesta como identificador de ETag:

```php
Route::middleware('cache.headers:public;max_age=30;s_maxage=300;stale_while_revalidate=600;etag')->group(function () {
    Route::get('/privacy', function () {
        // ...
    });

    Route::get('/terms', function () {
        // ...
    });
});
```

<a id="attaching-cookies-to-responses"></a>
### Adjuntar cookies a las respuestas

Puede adjuntar una cookie a una instancia `Illuminate\Http\Response` saliente utilizando el método `cookie`. Debe pasar el nombre, el valor y la cantidad de minutos que la cookie debe considerarse válida para este método:

```php
return response('Hello World')->cookie(
    'name', 'value', $minutes
);
```

El método `cookie` también acepta algunos argumentos más que se utilizan con menos frecuencia. Generalmente, estos argumentos tienen el mismo propósito y significado que los argumentos que se darían al método [setcookie](https://secure.php.net/manual/en/function.setcookie.php) nativo de PHP:

```php
return response('Hello World')->cookie(
    'name', 'value', $minutes, $path, $domain, $secure, $httpOnly
);
```

Si desea asegurarse de que se envíe una cookie con la respuesta saliente pero aún no tiene una instancia de esa respuesta, puede usar la fachada `Cookie` para "poner en cola" las cookies para adjuntarlas a la respuesta cuando se envíe. El método `queue` acepta los argumentos necesarios para crear una instancia de cookie. Estas cookies se adjuntarán a la respuesta saliente antes de enviarla al navegador:

```php
use Illuminate\Support\Facades\Cookie;

Cookie::queue('name', 'value', $minutes);
```

<a id="generating-cookie-instances"></a>
#### Generando instancias de cookies

Si desea generar una instancia `Symfony\Component\HttpFoundation\Cookie` que pueda adjuntarse a una instancia de respuesta más adelante, puede utilizar el asistente global `cookie`. Esta cookie no se enviará de vuelta al cliente a menos que esté adjunta a una instancia de respuesta:

```php
$cookie = cookie('name', 'value', $minutes);

return response('Hello World')->cookie($cookie);
```

<a id="expiring-cookies-early"></a>
#### Cookies que caducan anticipadamente

Puede eliminar una cookie expirándola mediante el método `withoutCookie` o `withoutCookies` de una respuesta saliente:

```php
return response('Hello World')->withoutCookie('name');

return response('Hello World')->withoutCookies([
    'name',
    'email',
    'preferences',
]);
```

Si aún no tiene una instancia de la respuesta saliente, puede utilizar el método `expire` de la fachada `Cookie` para caducar una cookie:

```php
Cookie::expire('name');
```

<a id="cookies-and-encryption"></a>
### Cookies y cifrado

Por defecto, gracias al middleware `Illuminate\Cookie\Middleware\EncryptCookies`, todas las cookies generadas por Laravel están cifradas y firmadas para que el cliente no pueda modificarlas ni leerlas. Si desea deshabilitar el cifrado para un subconjunto de cookies generadas por su aplicación, puede utilizar el método `encryptCookies` en el archivo `bootstrap/app.php` de su aplicación:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->encryptCookies(except: [
        'cookie_name',
    ]);
})
```

> **Nota:**
> En general, el cifrado de cookies nunca debe desactivarse, ya que esto expone sus cookies a una posible exposición y manipulación de los datos del lado del cliente.

<a id="redirects"></a>
## Redirecciones

Las respuestas de redireccionamiento son instancias de la clase `Illuminate\Http\RedirectResponse` y contienen los encabezados adecuados necesarios para redirigir al usuario a otra URL. Hay varias formas de generar una instancia `RedirectResponse`. El método más sencillo es utilizar el asistente global `redirect`:

```php
Route::get('/dashboard', function () {
    return redirect('/home/dashboard');
});
```

A veces es posible que desee redirigir al usuario a su ubicación anterior, como cuando un formulario enviado no es válido. Puede hacerlo utilizando la función auxiliar global `back`. Dado que esta característica utiliza [session](../session/), asegúrese de que la ruta que llama a la función `back` utilice el grupo de middleware `web`:

```php
Route::post('/user/profile', function () {
    // Validate the request...

    return back()->withInput();
});
```

<a id="redirecting-named-routes"></a>
### Redirigir a rutas con nombre

Cuando llama al asistente `redirect` sin parámetros, se devuelve una instancia de `Illuminate\Routing\Redirector`, lo que le permite llamar a cualquier método en la instancia `Redirector`. Por ejemplo, para generar un `RedirectResponse` a una ruta con nombre, puede utilizar el método `route`:

```php
return redirect()->route('login');
```

Si su ruta tiene parámetros, puede pasarlos como segundo argumento al método `route`:

```php
// For a route with the following URI: /profile/{id}

return redirect()->route('profile', ['id' => 1]);
```

<a id="populating-parameters-via-eloquent-models"></a>
#### Completar parámetros mediante modelos elocuentes

Si está redirigiendo a una ruta con un parámetro "ID" que se completa desde un modelo Eloquent, puede pasar el modelo en sí. El ID se extraerá automáticamente:

```php
// For a route with the following URI: /profile/{id}

return redirect()->route('profile', [$user]);
```

Si desea personalizar el valor que se coloca en el parámetro de ruta, puede especificar la columna en la definición del parámetro de ruta (`/profile/{id:slug}`) o puede anular el método `getRouteKey` en su modelo de Eloquent:

```php
/**
 * Get the value of the model's route key.
 */
public function getRouteKey(): mixed
{
    return $this->slug;
}
```

<a id="redirecting-controller-actions"></a>
### Redirigir a acciones del controlador

También puede generar redireccionamientos a [controller action](../controllers/). Para hacerlo, pase el controlador y el nombre de la acción al método `action`:

```php
use App\Http\Controllers\UserController;

return redirect()->action([UserController::class, 'index']);
```

Si la ruta de su controlador requiere parámetros, puede pasarlos como segundo argumento al método `action`:

```php
return redirect()->action(
    [UserController::class, 'profile'], ['id' => 1]
);
```

<a id="redirecting-external-domains"></a>
### Redirigir a dominios externos

A veces es posible que necesites redirigir a un dominio fuera de tu aplicación. Puede hacerlo llamando al método `away`, que crea un `RedirectResponse` sin ninguna codificación, validación o verificación de URL adicional:

```php
return redirect()->away('https://www.google.com');
```

<a id="redirecting-with-flashed-session-data"></a>
### Redireccionamiento con datos de sesión flasheados

La redirección a una nueva URL y [los datos actualizados a la sesión](../session/#flash-data) generalmente se realizan al mismo tiempo. Normalmente, esto se hace después de realizar con éxito una acción cuando envía un mensaje de éxito a la sesión. Para mayor comodidad, puede crear una instancia `RedirectResponse` y actualizar los datos a la sesión en una cadena de método única y fluida:

```php
Route::post('/user/profile', function () {
    // ...

    return redirect('/dashboard')->with('status', 'Profile updated!');
});
```

Después de redirigir al usuario, puede mostrar el mensaje parpadeante del archivo [session](../session/). Por ejemplo, usando [sintaxis de Blade](../blade/):

```blade
@if (session('status'))
    <div class="alert alert-success">
        {{ session('status') }}
    </div>
@endif
```

<a id="redirecting-with-input"></a>
#### Redirigir con entrada

Puede utilizar el método `withInput` proporcionado por la instancia `RedirectResponse` para actualizar los datos de entrada de la solicitud actual a la sesión antes de redirigir al usuario a una nueva ubicación. Normalmente, esto se hace si el usuario ha encontrado un error de validación. Una vez que la entrada se haya actualizado a la sesión, puede [recuperarla fácilmente](../requests/#retrieving-old-input) durante la siguiente solicitud para volver a completar el formulario:

```php
return back()->withInput();
```

<a id="other-response-types"></a>
## Otros tipos de respuesta

El asistente `response` se puede utilizar para generar otros tipos de instancias de respuesta. Cuando se llama al asistente `response` sin argumentos, se devuelve una implementación de `Illuminate\Contracts\Routing\ResponseFactory` [contrato](../contracts/). Este contrato proporciona varios métodos útiles para generar respuestas.

<a id="view-responses"></a>
### Ver respuestas

Si necesita controlar el estado y los encabezados de la respuesta, pero también necesita devolver [view](../views/) como contenido de la respuesta, debe usar el método `view`:

```php
return response()
    ->view('hello', $data, 200)
    ->header('Content-Type', $type);
```

Por supuesto, si no necesita pasar un código de estado HTTP personalizado o encabezados personalizados, puede usar la función auxiliar global `view`.

<a id="json-responses"></a>
### Respuestas JSON

El método `json` establecerá automáticamente el encabezado `Content-Type` en `application/json`, además de convertir la matriz dada a JSON usando la función PHP `json_encode`:

```php
return response()->json([
    'name' => 'Abigail',
    'state' => 'CA',
]);
```

Si desea crear una respuesta JSONP, puede utilizar el método `json` en combinación con el método `withCallback`:

```php
return response()
    ->json(['name' => 'Abigail', 'state' => 'CA'])
    ->withCallback($request->input('callback'));
```

<a id="markdown-responses"></a>
### Respuestas Markdown

El método `markdown` se puede utilizar para devolver contenido de Markdown con el encabezado `Content-Type` configurado en `text/markdown`:

```php
return response()->markdown("# Hello\n\nWorld");
```

Puede pasar un código de estado HTTP personalizado y una serie de encabezados adicionales como segundo y tercer argumento:

```php
return response()->markdown('# Not Found', 404, ['X-Custom-Header' => 'Value']);
```

<a id="file-downloads"></a>
### Descargas de archivos

El método `download` se puede utilizar para generar una respuesta que obligue al navegador del usuario a descargar el archivo en la ruta indicada. El método `download` acepta un nombre de archivo como segundo argumento del método, lo que determinará el nombre de archivo que ve el usuario que descarga el archivo. Finalmente, puede pasar una serie de encabezados HTTP como tercer argumento del método:

```php
return response()->download($pathToFile);

return response()->download($pathToFile, $name, $headers);
```

> **Advertencia:**
> Symfony HttpFoundation, que administra las descargas de archivos, requiere que el archivo que se descarga tenga un nombre de archivo ASCII.

<a id="file-responses"></a>
### Archivar respuestas

El método `file` se puede utilizar para mostrar un archivo, como una imagen o PDF, directamente en el navegador del usuario en lugar de iniciar una descarga. Este método acepta la ruta absoluta al archivo como primer argumento y una serie de encabezados como segundo argumento:

```php
return response()->file($pathToFile);

return response()->file($pathToFile, $headers);
```

<a id="streamed-responses"></a>
## Respuestas transmitidas

Al transmitir datos al cliente a medida que se generan, puede reducir significativamente el uso de memoria y mejorar el rendimiento, especialmente para respuestas muy grandes. Las respuestas transmitidas permiten al cliente comenzar a procesar datos antes de que el servidor termine de enviarlos:

```php
Route::get('/stream', function () {
    return response()->stream(function (): void {
        foreach (['developer', 'admin'] as $string) {
            echo $string;
            ob_flush();
            flush();
            sleep(2); // Simulate delay between chunks...
        }
    }, 200, ['X-Accel-Buffering' => 'no']);
});
```

Para mayor comodidad, si el cierre que proporciona al método `stream` devuelve un [Generator](https://www.php.net/manual/en/language.generators.overview.php), Laravel vaciará automáticamente el búfer de salida entre las cadenas devueltas por el generador, además de desactivar el búfer de salida de Nginx:

```php
Route::post('/chat', function () {
    return response()->stream(function (): Generator {
        $stream = OpenAI::client()->chat()->createStreamed(...);

        foreach ($stream as $response) {
            yield $response->choices[0];
        }
    });
});
```

<a id="consuming-streamed-responses"></a>
### Consumir respuestas transmitidas

Las respuestas transmitidas se pueden consumir utilizando el paquete npm `stream` de Laravel, que proporciona una API conveniente para interactuar con las respuestas y los flujos de eventos de Laravel. Para comenzar, instale el paquete `@laravel/stream-react`, `@laravel/stream-vue` o `@laravel/stream-svelte`:

```shell tab=React
npm install @laravel/stream-react
```

```shell tab=Vue
npm install @laravel/stream-vue
```

```shell tab=Svelte
npm install @laravel/stream-svelte
```

Luego, se puede utilizar `useStream` para consumir el flujo de eventos. Después de proporcionar la URL de su transmisión, el enlace actualizará automáticamente el `data` con la respuesta concatenada a medida que se devuelva el contenido desde su aplicación Laravel:

```tsx tab=React
import { useStream } from "@laravel/stream-react";

function App() {
    const { data, isFetching, isStreaming, send } = useStream("chat");

    const sendMessage = () => {
        send({
            message: `Current timestamp: ${Date.now()}`,
        });
    };

    return (
        <div>
            <div>{data}</div>
            {isFetching && <div>Connecting...</div>}
            {isStreaming && <div>Generating...</div>}
            <button onClick={sendMessage}>Send Message</button>
        </div>
    );
}
```

```vue tab=Vue
<script setup lang="ts">
import { useStream } from "@laravel/stream-vue";

const { data, isFetching, isStreaming, send } = useStream("chat");

const sendMessage = () => {
    send({
        message: `Current timestamp: ${Date.now()}`,
    });
};
</script>

<template>
    <div>
        <div>{{ data }}</div>
        <div v-if="isFetching">Connecting...</div>
        <div v-if="isStreaming">Generating...</div>
        <button @click="sendMessage">Send Message</button>
    </div>
</template>
```

```svelte tab=Svelte
<script>
import { useStream } from "@laravel/stream-svelte";

const stream = useStream("chat");

const sendMessage = () => {
    stream.send({
        message: `Current timestamp: ${Date.now()}`,
    });
};
</script>

<div>
    <div>{$stream.data}</div>
    {#if $stream.isFetching}
        <div>Connecting...</div>
    {/if}
    {#if $stream.isStreaming}
        <div>Generating...</div>
    {/if}
    <button onclick={sendMessage}>Send Message</button>
</div>
```

Al enviar datos nuevamente a la transmisión a través de `send`, la conexión activa a la transmisión se cancela antes de enviar los nuevos datos. Todas las solicitudes se envían como solicitudes JSON `POST`.

> **Advertencia:**
> Dado que el enlace `useStream` realiza una solicitud `POST` a su aplicación, se requiere un token CSRF válido. La forma más sencilla de proporcionar el token CSRF es [incluirlo mediante una metaetiqueta en el encabezado del diseño de su aplicación](../csrf/#csrf-x-csrf-token).

El segundo argumento dado a `useStream` es un objeto de opciones que puede utilizar para personalizar el comportamiento de consumo de flujo. Los valores predeterminados para este objeto se muestran a continuación:

```tsx tab=React
import { useStream } from "@laravel/stream-react";

function App() {
    const { data } = useStream("chat", {
        id: undefined,
        initialInput: undefined,
        headers: undefined,
        csrfToken: undefined,
        onResponse: (response: Response) => void,
        onData: (data: string) => void,
        onCancel: () => void,
        onFinish: () => void,
        onError: (error: Error) => void,
    });

    return <div>{data}</div>;
}
```

```vue tab=Vue
<script setup lang="ts">
import { useStream } from "@laravel/stream-vue";

const { data } = useStream("chat", {
    id: undefined,
    initialInput: undefined,
    headers: undefined,
    csrfToken: undefined,
    onResponse: (response: Response) => void,
    onData: (data: string) => void,
    onCancel: () => void,
    onFinish: () => void,
    onError: (error: Error) => void,
});
</script>

<template>
    <div>{{ data }}</div>
</template>
```

```svelte tab=Svelte
<script>
import { useStream } from "@laravel/stream-svelte";

const stream = useStream("chat", {
    id: undefined,
    initialInput: undefined,
    headers: undefined,
    csrfToken: undefined,
    onResponse: (response) => {},
    onData: (data) => {},
    onCancel: () => {},
    onFinish: () => {},
    onError: (error) => {},
});
</script>

<div>{$stream.data}</div>
```

`onResponse` se activa después de una respuesta inicial exitosa de la transmisión y el [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) sin formato se pasa a la devolución de llamada. Se llama a `onData` a medida que se recibe cada fragmento; el fragmento actual se pasa a la devolución de llamada. Se llama a `onFinish` cuando finaliza una transmisión y cuando se genera un error durante el ciclo de recuperación/lectura.

De forma predeterminada, no se realiza una solicitud a la secuencia durante la inicialización. Puede pasar una carga útil inicial a la transmisión utilizando la opción `initialInput`:

```tsx tab=React
import { useStream } from "@laravel/stream-react";

function App() {
    const { data } = useStream("chat", {
        initialInput: {
            message: "Introduce yourself.",
        },
    });

    return <div>{data}</div>;
}
```

```vue tab=Vue
<script setup lang="ts">
import { useStream } from "@laravel/stream-vue";

const { data } = useStream("chat", {
    initialInput: {
        message: "Introduce yourself.",
    },
});
</script>

<template>
    <div>{{ data }}</div>
</template>
```

```svelte tab=Svelte
<script>
import { useStream } from "@laravel/stream-svelte";

const stream = useStream("chat", {
    initialInput: {
        message: "Introduce yourself.",
    },
});
</script>

<div>{$stream.data}</div>
```

Para cancelar una transmisión manualmente, puede usar el método `cancel` devuelto por el enlace:

```tsx tab=React
import { useStream } from "@laravel/stream-react";

function App() {
    const { data, cancel } = useStream("chat");

    return (
        <div>
            <div>{data}</div>
            <button onClick={cancel}>Cancel</button>
        </div>
    );
}
```

```vue tab=Vue
<script setup lang="ts">
import { useStream } from "@laravel/stream-vue";

const { data, cancel } = useStream("chat");
</script>

<template>
    <div>
        <div>{{ data }}</div>
        <button @click="cancel">Cancel</button>
    </div>
</template>
```

```svelte tab=Svelte
<script>
import { useStream } from "@laravel/stream-svelte";

const stream = useStream("chat");
</script>

<div>
    <div>{$stream.data}</div>
    <button onclick={() => stream.cancel()}>Cancel</button>
</div>
```

Cada vez que se utiliza el enlace `useStream`, se genera un `id` aleatorio para identificar la secuencia. Esto se envía de vuelta al servidor con cada solicitud en el encabezado `X-STREAM-ID`. Cuando consume la misma secuencia desde varios componentes, puede leer y escribir en la secuencia proporcionando su propio `id`:

```tsx tab=React
// App.tsx
import { useStream } from "@laravel/stream-react";

function App() {
    const { data, id } = useStream("chat");

    return (
        <div>
            <div>{data}</div>
            <StreamStatus id={id} />
        </div>
    );
}

// StreamStatus.tsx
import { useStream } from "@laravel/stream-react";

function StreamStatus({ id }) {
    const { isFetching, isStreaming } = useStream("chat", { id });

    return (
        <div>
            {isFetching && <div>Connecting...</div>}
            {isStreaming && <div>Generating...</div>}
        </div>
    );
}
```

```vue tab=Vue
<!-- App.vue -->
<script setup lang="ts">
import { useStream } from "@laravel/stream-vue";
import StreamStatus from "./StreamStatus.vue";

const { data, id } = useStream("chat");
</script>

<template>
    <div>
        <div>{{ data }}</div>
        <StreamStatus :id="id" />
    </div>
</template>

<!-- StreamStatus.vue -->
<script setup lang="ts">
import { useStream } from "@laravel/stream-vue";

const props = defineProps<{
    id: string;
}>();

const { isFetching, isStreaming } = useStream("chat", { id: props.id });
</script>

<template>
    <div>
        <div v-if="isFetching">Connecting...</div>
        <div v-if="isStreaming">Generating...</div>
    </div>
</template>
```

```svelte tab=Svelte
<!-- App.svelte -->
<script>
import { useStream } from "@laravel/stream-svelte";
import StreamStatus from "./StreamStatus.svelte";

const stream = useStream("chat");
</script>

<div>
    <div>{$stream.data}</div>
    <StreamStatus id={stream.id} />
</div>

<!-- StreamStatus.svelte -->
<script>
import { useStream } from "@laravel/stream-svelte";

let { id } = $props();

const stream = useStream("chat", { id });
</script>

<div>
    {#if $stream.isFetching}
        <div>Connecting...</div>
    {/if}
    {#if $stream.isStreaming}
        <div>Generating...</div>
    {/if}
</div>
```

<a id="streamed-json-responses"></a>
### Respuestas JSON transmitidas

Si necesita transmitir datos JSON de forma incremental, puede utilizar el método `streamJson`. Este método es especialmente útil para conjuntos de datos grandes que deben enviarse progresivamente al navegador en un formato que JavaScript pueda analizar fácilmente:

```php
use App\Models\User;

Route::get('/users.json', function () {
    return response()->streamJson([
        'users' => User::cursor(),
    ]);
});
```

El gancho `useJsonStream` es idéntico al gancho [useStream](#consuming-streamed-responses) excepto que intentará analizar los datos como JSON una vez que haya terminado de transmitir:

```tsx tab=React
import { useJsonStream } from "@laravel/stream-react";

type User = {
    id: number;
    name: string;
    email: string;
};

function App() {
    const { data, send } = useJsonStream<{ users: User[] }>("users");

    const loadUsers = () => {
        send({
            query: "taylor",
        });
    };

    return (
        <div>
            <ul>
                {data?.users.map((user) => (
                    <li>
                        {user.id}: {user.name}
                    </li>
                ))}
            </ul>
            <button onClick={loadUsers}>Load Users</button>
        </div>
    );
}
```

```vue tab=Vue
<script setup lang="ts">
import { useJsonStream } from "@laravel/stream-vue";

type User = {
    id: number;
    name: string;
    email: string;
};

const { data, send } = useJsonStream<{ users: User[] }>("users");

const loadUsers = () => {
    send({
        query: "taylor",
    });
};
</script>

<template>
    <div>
        <ul>
            <li v-for="user in data?.users" :key="user.id">
                {{ user.id }}: {{ user.name }}
            </li>
        </ul>
        <button @click="loadUsers">Load Users</button>
    </div>
</template>
```

```svelte tab=Svelte
<script>
import { useJsonStream } from "@laravel/stream-svelte";

const stream = useJsonStream("users");

const loadUsers = () => {
    stream.send({
        query: "taylor",
    });
};
</script>

<div>
    <ul>
        {#if $stream.data?.users}
            {#each $stream.data.users as user (user.id)}
                <li>{user.id}: {user.name}</li>
            {/each}
        {/if}
    </ul>
    <button onclick={loadUsers}>Load Users</button>
</div>
```

<a id="event-streams"></a>
### Flujos de eventos (SSE)

El método `eventStream` se puede utilizar para devolver una respuesta transmitida de eventos enviados por el servidor (SSE) utilizando el tipo de contenido `text/event-stream`. El método `eventStream` acepta un cierre que debería [producir respuestas](https://www.php.net/manual/en/language.generators.overview.php) a la secuencia a medida que las respuestas estén disponibles:

```php
Route::get('/chat', function () {
    return response()->eventStream(function () {
        $stream = OpenAI::client()->chat()->createStreamed(...);

        foreach ($stream as $response) {
            yield $response->choices[0];
        }
    });
});
```

Si desea personalizar el nombre del evento, puede generar una instancia de la clase `StreamedEvent`:

```php
use Illuminate\Http\StreamedEvent;

yield new StreamedEvent(
    event: 'update',
    data: $response->choices[0],
);
```

<a id="consuming-event-streams"></a>
#### Consumiendo transmisiones de eventos

Los flujos de eventos se pueden consumir utilizando el paquete npm `stream` de Laravel, que proporciona una API conveniente para interactuar con los flujos de eventos de Laravel. Para comenzar, instale el paquete `@laravel/stream-react`, `@laravel/stream-vue` o `@laravel/stream-svelte`:

```shell tab=React
npm install @laravel/stream-react
```

```shell tab=Vue
npm install @laravel/stream-vue
```

```shell tab=Svelte
npm install @laravel/stream-svelte
```

Luego, se puede utilizar `useEventStream` para consumir el flujo de eventos. Después de proporcionar la URL de su transmisión, el enlace actualizará automáticamente el `message` con la respuesta concatenada a medida que se devuelvan mensajes desde su aplicación Laravel:

```jsx tab=React
import { useEventStream } from "@laravel/stream-react";

function App() {
  const { message } = useEventStream("/chat");

  return <div>{message}</div>;
}
```

```vue tab=Vue
<script setup lang="ts">
import { useEventStream } from "@laravel/stream-vue";

const { message } = useEventStream("/chat");
</script>

<template>
  <div>{{ message }}</div>
</template>
```

```svelte tab=Svelte
<script>
import { useEventStream } from "@laravel/stream-svelte";

const eventStream = useEventStream("/chat");
</script>

<div>{$eventStream.message}</div>
```

El segundo argumento dado a `useEventStream` es un objeto de opciones que puede utilizar para personalizar el comportamiento de consumo de flujo. Los valores predeterminados para este objeto se muestran a continuación:

```jsx tab=React
import { useEventStream } from "@laravel/stream-react";

function App() {
  const { message } = useEventStream("/stream", {
    eventName: "update",
    onMessage: (message) => {
      //
    },
    onError: (error) => {
      //
    },
    onComplete: () => {
      //
    },
    endSignal: "</stream>",
    glue: " ",
  });

  return <div>{message}</div>;
}
```

```vue tab=Vue
<script setup lang="ts">
import { useEventStream } from "@laravel/stream-vue";

const { message } = useEventStream("/chat", {
  eventName: "update",
  onMessage: (message) => {
    // ...
  },
  onError: (error) => {
    // ...
  },
  onComplete: () => {
    // ...
  },
  endSignal: "</stream>",
  glue: " ",
});
</script>
```

```svelte tab=Svelte
<script>
import { useEventStream } from "@laravel/stream-svelte";

const eventStream = useEventStream("/chat", {
    eventName: "update",
    onMessage: (event) => {
        //
    },
    onError: (error) => {
        //
    },
    onComplete: () => {
        //
    },
    endSignal: "</stream>",
    glue: " ",
    replace: false,
});
</script>
```

Los flujos de eventos también se pueden consumir manualmente a través de un objeto [EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource) por parte de la interfaz de su aplicación. El método `eventStream` enviará automáticamente una actualización `</stream>` a la transmisión del evento cuando se complete la transmisión:

```js
const source = new EventSource('/chat');

source.addEventListener('update', (event) => {
    if (event.data === '</stream>') {
        source.close();

        return;
    }

    console.log(event.data);
});
```

Para personalizar el evento final que se envía a la secuencia de eventos, puede proporcionar una instancia `StreamedEvent` al argumento `endStreamWith` del método `eventStream`:

```php
return response()->eventStream(function () {
    // ...
}, endStreamWith: new StreamedEvent(event: 'update', data: '</stream>'));
```

<a id="streamed-downloads"></a>
### Descargas transmitidas

A veces es posible que desee convertir la respuesta de cadena de una operación determinada en una respuesta descargable sin tener que escribir el contenido de la operación en el disco. Puede utilizar el método `streamDownload` en este escenario. Este método acepta una devolución de llamada, un nombre de archivo y una matriz opcional de encabezados como argumentos:

```php
use App\Services\GitHub;

return response()->streamDownload(function () {
    echo GitHub::api('repo')
        ->contents()
        ->readme('laravel', 'laravel')['contents'];
}, 'laravel-readme.md');
```

<a id="response-macros"></a>
## Macros de respuesta

Si desea definir una respuesta personalizada que pueda reutilizar en una variedad de rutas y controladores, puede usar el método `macro` en la fachada `Response`. Normalmente, debe llamar a este método desde el método `boot` de uno de los [proveedores de servicios](../providers/) de su aplicación, como el proveedor de servicios `App\Providers\AppServiceProvider`:

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Response;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Response::macro('caps', function (string $value) {
            return Response::make(strtoupper($value));
        });
    }
}
```

La función `macro` acepta un nombre como primer argumento y un cierre como segundo argumento. El cierre de la macro se ejecutará al llamar al nombre de la macro desde una implementación `ResponseFactory` o el asistente `response`:

```php
return response()->caps('foo');
```
