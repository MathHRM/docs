---
title: "Cliente HTTP"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Haciendo solicitudes](#making-requests)
    - [Solicitar datos](#request-data)
    - [Encabezados](#headers)
    - [Autenticación](#authentication)
    - [Tiempo de espera](#timeout)
    - [Reintentos](#retries)
    - [Manejo de errores](#error-handling)
    - [Middleware Guzzle](#guzzle-middleware)
    - [Opciones de trago](#guzzle-options)
- [Solicitudes simultáneas](#concurrent-requests)
    - [Solicitar agrupación](#request-pooling)
    - [Solicitar procesamiento por lotes](#request-batching)
- [Macros](#macros)
- [Prueba](#testing)
    - [Respuestas falsas](#faking-responses)
    - [Solicitudes de inspección](#inspecting-requests)
    - [Prevención de solicitudes perdidas](#preventing-stray-requests)
- [Eventos](#events)

<a id="introduction"></a>
## Introducción

Laravel proporciona una API mínima y expresiva en torno al [cliente HTTP Guzzle](http://docs.guzzlephp.org/en/stable/), lo que le permite realizar rápidamente solicitudes HTTP salientes para comunicarse con otras aplicaciones web. El contenedor de Laravel en torno a Guzzle se centra en sus casos de uso más comunes y en una maravillosa experiencia para el desarrollador.

<a id="making-requests"></a>
## Realizar solicitudes

Para realizar solicitudes podrá utilizar los métodos `head`, `get`, `post`, `put`, `patch` y `delete` proporcionados por la fachada `Http`. Primero, examinemos cómo realizar una solicitud básica `GET` a otra URL:

```php
use Illuminate\Support\Facades\Http;

$response = Http::get('http://example.com');
```

El método `get` devuelve una instancia de `Illuminate\Http\Client\Response`, que proporciona una variedad de métodos que pueden usarse para inspeccionar la respuesta:

```php
$response->body() : string;
$response->json($key = null, $default = null, $flags = null) : mixed;
$response->object() : object;
$response->collect($key = null) : Illuminate\Support\Collection;
$response->resource() : resource;
$response->status() : int;
$response->successful() : bool;
$response->redirect(): bool;
$response->failed() : bool;
$response->clientError() : bool;
$response->header($header) : string;
$response->headers() : array;
```

El objeto `Illuminate\Http\Client\Response` también implementa la interfaz PHP `ArrayAccess`, lo que le permite acceder a los datos de respuesta JSON directamente en la respuesta:

```php
return Http::get('http://example.com/users/1')['name'];
```

Además de los métodos de respuesta enumerados anteriormente, se pueden utilizar los siguientes métodos para determinar si la respuesta tiene un código de estado específico:

```php
$response->ok() : bool;                  // 200 OK
$response->created() : bool;             // 201 Created
$response->accepted() : bool;            // 202 Accepted
$response->noContent() : bool;           // 204 No Content
$response->movedPermanently() : bool;    // 301 Moved Permanently
$response->found() : bool;               // 302 Found
$response->badRequest() : bool;          // 400 Bad Request
$response->unauthorized() : bool;        // 401 Unauthorized
$response->paymentRequired() : bool;     // 402 Payment Required
$response->forbidden() : bool;           // 403 Forbidden
$response->notFound() : bool;            // 404 Not Found
$response->requestTimeout() : bool;      // 408 Request Timeout
$response->conflict() : bool;            // 409 Conflict
$response->unprocessableEntity() : bool; // 422 Unprocessable Entity
$response->tooManyRequests() : bool;     // 429 Too Many Requests
$response->serverError() : bool;         // >= 500 Server Error
```

<a id="uri-templates"></a>
#### Plantillas URI

El cliente HTTP también le permite construir URL de solicitud utilizando la [especificación de plantilla URI](https://www.rfc-editor.org/rfc/rfc6570). Para definir los parámetros de URL que su plantilla de URI puede expandir, puede utilizar el método `withUrlParameters`:

```php
Http::withUrlParameters([
    'endpoint' => 'https://laravel.com',
    'page' => 'docs',
    'version' => '13.x',
    'topic' => 'validation',
])->get('{+endpoint}/{page}/{version}/{topic}');
```

<a id="dumping-requests"></a>
#### Solicitudes de dumping

Si desea volcar la instancia de solicitud saliente antes de enviarla y finalizar la ejecución del script, puede agregar el método `dd` al comienzo de la definición de su solicitud:

```php
return Http::dd()->get('http://example.com');
```

<a id="request-data"></a>
### Solicitar datos

Por supuesto, es común al realizar solicitudes `POST`, `PUT` y `PATCH` enviar datos adicionales con su solicitud, por lo que estos métodos aceptan una matriz de datos como segundo argumento. De forma predeterminada, los datos se enviarán utilizando el tipo de contenido `application/json`:

```php
use Illuminate\Support\Facades\Http;

$response = Http::post('http://example.com/users', [
    'name' => 'Steve',
    'role' => 'Network Administrator',
]);
```

<a id="get-request-query-parameters"></a>
#### OBTENER parámetros de consulta de solicitud

Al realizar solicitudes `GET`, puede agregar una cadena de consulta directamente a la URL o pasar una matriz de pares clave/valor como segundo argumento del método `get`:

```php
$response = Http::get('http://example.com/users', [
    'name' => 'Taylor',
    'page' => 1,
]);
```

Alternativamente, se puede utilizar el método `withQueryParameters`:

```php
Http::retry(3, 100)->withQueryParameters([
    'name' => 'Taylor',
    'page' => 1,
])->get('http://example.com/users');
```

<a id="sending-form-url-encoded-requests"></a>
#### Envío de solicitudes codificadas en URL del formulario

Si desea enviar datos utilizando el tipo de contenido `application/x-www-form-urlencoded`, debe llamar al método `asForm` antes de realizar su solicitud:

```php
$response = Http::asForm()->post('http://example.com/users', [
    'name' => 'Sara',
    'role' => 'Privacy Consultant',
]);
```

<a id="sending-a-raw-request-body"></a>
#### Envío de un cuerpo de solicitud sin formato

Puede utilizar el método `withBody` si desea proporcionar un cuerpo de solicitud sin formato al realizar una solicitud. El tipo de contenido se puede proporcionar mediante el segundo argumento del método:

```php
$response = Http::withBody(
    base64_encode($photo), 'image/jpeg'
)->post('http://example.com/photo');
```

<a id="multi-part-requests"></a>
#### Solicitudes de varias partes

Si desea enviar archivos como solicitudes de varias partes, debe llamar al método `attach` antes de realizar su solicitud. Este método acepta el nombre del archivo y su contenido. Si es necesario, puede proporcionar un tercer argumento que se considerará el nombre del archivo, mientras que se puede usar un cuarto argumento para proporcionar encabezados asociados con el archivo:

```php
$response = Http::attach(
    'attachment', file_get_contents('photo.jpg'), 'photo.jpg', ['Content-Type' => 'image/jpeg']
)->post('http://example.com/attachments');
```

En lugar de pasar el contenido sin formato de un archivo, puedes pasar un recurso de flujo:

```php
$photo = fopen('photo.jpg', 'r');

$response = Http::attach(
    'attachment', $photo, 'photo.jpg'
)->post('http://example.com/attachments');
```

<a id="headers"></a>
### Encabezados

Se pueden agregar encabezados a las solicitudes utilizando el método `withHeaders`. Este método `withHeaders` acepta una matriz de pares clave/valor:

```php
$response = Http::withHeaders([
    'X-First' => 'foo',
    'X-Second' => 'bar'
])->post('http://example.com/users', [
    'name' => 'Taylor',
]);
```

Puede utilizar el método `accept` para especificar el tipo de contenido que su aplicación espera en respuesta a su solicitud:

```php
$response = Http::accept('application/json')->get('http://example.com/users');
```

Para mayor comodidad, puede utilizar el método `acceptJson` para especificar rápidamente que su aplicación espera el tipo de contenido `application/json` en respuesta a su solicitud:

```php
$response = Http::acceptJson()->get('http://example.com/users');
```

El método `withHeaders` fusiona encabezados nuevos con los encabezados existentes de la solicitud. Si es necesario, puede reemplazar todos los encabezados por completo utilizando el método `replaceHeaders`:

```php
$response = Http::withHeaders([
    'X-Original' => 'foo',
])->replaceHeaders([
    'X-Replacement' => 'bar',
])->post('http://example.com/users', [
    'name' => 'Taylor',
]);
```

<a id="authentication"></a>
### Autenticación

Puede especificar credenciales de autenticación básica y resumida utilizando los métodos `withBasicAuth` y `withDigestAuth`, respectivamente:

```php
// Basic authentication...
$response = Http::withBasicAuth('taylor@laravel.com', 'secret')->post(/* ... */);

// Digest authentication...
$response = Http::withDigestAuth('taylor@laravel.com', 'secret')->post(/* ... */);
```

<a id="bearer-tokens"></a>
#### Fichas al portador

Si desea agregar rápidamente un token de portador al encabezado `Authorization` de la solicitud, puede utilizar el método `withToken`:

```php
$response = Http::withToken('token')->post(/* ... */);
```

<a id="timeout"></a>
### Tiempo de espera

El método `timeout` se puede utilizar para especificar el número máximo de segundos para esperar una respuesta. De forma predeterminada, el cliente HTTP expirará después de 30 segundos:

```php
$response = Http::timeout(3)->get(/* ... */);
```

Si se excede el tiempo de espera indicado, se generará una instancia de `Illuminate\Http\Client\ConnectionException`.

Puede especificar la cantidad máxima de segundos de espera al intentar conectarse a un servidor utilizando el método `connectTimeout`. El valor predeterminado es 10 segundos:

```php
$response = Http::connectTimeout(3)->get(/* ... */);
```

<a id="retries"></a>
### Reintentos

Si desea que el cliente HTTP reintente automáticamente la solicitud si se produce un error del cliente o del servidor, puede utilizar el método `retry`. El método `retry` acepta la cantidad máxima de veces que se debe intentar la solicitud y la cantidad de milisegundos que Laravel debe esperar entre intentos:

```php
$response = Http::retry(3, 100)->post(/* ... */);
```

Si desea calcular manualmente la cantidad de milisegundos para dormir entre intentos, puede pasar una función anónima como segundo argumento del método `retry`:

```php
use Exception;

$response = Http::retry(3, function (int $attempt, Exception $exception) {
    return $attempt * 100;
})->post(/* ... */);
```

Para mayor comodidad, también puede proporcionar una matriz como primer argumento del método `retry`. Esta matriz se utilizará para determinar cuántos milisegundos dormir entre intentos posteriores:

```php
$response = Http::retry([100, 200])->post(/* ... */);
```

Si es necesario, puede pasar un tercer argumento al método `retry`. El tercer argumento debería ser un invocable que determine si realmente se deben intentar los reintentos. Por ejemplo, es posible que desee volver a intentar la solicitud solo si la solicitud inicial encuentra un `ConnectionException`:

```php
use Illuminate\Http\Client\PendingRequest;
use Throwable;

$response = Http::retry(3, 100, function (Throwable $exception, PendingRequest $request) {
    return $exception instanceof ConnectionException;
})->post(/* ... */);
```

Si falla un intento de solicitud, es posible que desee realizar un cambio en la solicitud antes de realizar un nuevo intento. Puede lograr esto modificando el argumento de solicitud proporcionado al invocable que proporcionó al método `retry`. Por ejemplo, es posible que desee volver a intentar la solicitud con un nuevo token de autorización si el primer intento arrojó un error de autenticación:

```php
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\RequestException;
use Throwable;

$response = Http::withToken($this->getToken())->retry(2, 0, function (Throwable $exception, PendingRequest $request) {
    if (! $exception instanceof RequestException || $exception->response->status() !== 401) {
        return false;
    }

    $request->withToken($this->getNewToken());

    return true;
})->post(/* ... */);
```

Si todas las solicitudes fallan, se generará una instancia de `Illuminate\Http\Client\RequestException`. Si desea desactivar este comportamiento, puede proporcionar un argumento `throw` con un valor de `false`. Cuando está deshabilitado, se devolverá la última respuesta recibida por el cliente después de que se hayan intentado todos los reintentos:

```php
$response = Http::retry(3, 100, throw: false)->post(/* ... */);
```

> **Advertencia:**
> Si todas las solicitudes fallan debido a un problema de conexión, se generará un `Illuminate\Http\Client\ConnectionException` incluso cuando el argumento `throw` esté establecido en `false`.

<a id="error-handling"></a>
### Manejo de errores

A diferencia del comportamiento predeterminado de Guzzle, el contenedor de cliente HTTP de Laravel no genera excepciones en errores de cliente o servidor (respuestas de nivel `400` y `500` de los servidores). Puede determinar si uno de estos errores se devolvió utilizando los métodos `successful`, `clientError` o `serverError`:

```php
// Determine if the status code is >= 200 and < 300...
$response->successful();

// Determine if the status code is >= 400...
$response->failed();

// Determine if the response has a 400 level status code...
$response->clientError();

// Determine if the response has a 500 level status code...
$response->serverError();

// Immediately execute the given callback if there was a client or server error...
$response->onError(callable $callback);
```

<a id="throwing-exceptions"></a>
#### Lanzar excepciones

Si tiene una instancia de respuesta y desea generar una instancia de `Illuminate\Http\Client\RequestException` si el código de estado de respuesta indica un error del cliente o del servidor, puede usar los métodos `throw` o `throwIf`:

```php
use Illuminate\Http\Client\Response;

$response = Http::post(/* ... */);

// Throw an exception if a client or server error occurred...
$response->throw();

// Throw an exception if an error occurred and the given condition is true...
$response->throwIf($condition);

// Throw an exception if an error occurred and the given closure resolves to true...
$response->throwIf(fn (Response $response) => true);

// Throw an exception if an error occurred and the given condition is false...
$response->throwUnless($condition);

// Throw an exception if an error occurred and the given closure resolves to false...
$response->throwUnless(fn (Response $response) => false);

// Throw an exception if the response has a specific status code...
$response->throwIfStatus(403);

// Throw an exception unless the response has a specific status code...
$response->throwUnlessStatus(200);

// Throw an exception if a server error occurred (status >= 500)...
$response->throwIfServerError();

// Throw an exception if a client error occurred (status >= 400 and < 500)...
$response->throwIfClientError();

return $response['user']['id'];
```

La instancia `Illuminate\Http\Client\RequestException` tiene una propiedad pública `$response` que le permitirá inspeccionar la respuesta devuelta.

El método `throw` devuelve la instancia de respuesta si no se produjo ningún error, lo que le permite encadenar otras operaciones en el método `throw`:

```php
return Http::post(/* ... */)->throw()->json();
```

Si desea realizar alguna lógica adicional antes de que se produzca la excepción, puede pasar una función anónima al método `throw`. La excepción se lanzará automáticamente después de invocar la función anónima, por lo que no es necesario volver a lanzar la excepción desde la función anónima:

```php
use Illuminate\Http\Client\Response;
use Illuminate\Http\Client\RequestException;

return Http::post(/* ... */)->throw(function (Response $response, RequestException $e) {
    // ...
})->json();
```

De forma predeterminada, los mensajes `RequestException` se truncan a 120 caracteres cuando se registran o informan. Para personalizar o deshabilitar este comportamiento, puede utilizar los métodos `truncateAt` y `dontTruncate` al configurar el comportamiento registrado de su aplicación en su archivo `bootstrap/app.php`:

```php
use Illuminate\Http\Client\RequestException;

->registered(function (): void {
    // Truncate request exception messages to 240 characters...
    RequestException::truncateAt(240);

    // Disable request exception message truncation...
    RequestException::dontTruncate();
})
```

Alternativamente, puede personalizar el comportamiento de truncamiento de excepciones por solicitud utilizando el método `truncateExceptionsAt`:

```php
return Http::truncateExceptionsAt(240)->post(/* ... */);
```

<a id="guzzle-middleware"></a>
### Middleware Guzzle

Dado que el cliente HTTP de Laravel funciona con Guzzle, puede aprovechar [Guzzle Middleware](https://docs.guzzlephp.org/en/stable/handlers-and-middleware.html) para manipular la solicitud saliente o inspeccionar la respuesta entrante. Para manipular la solicitud saliente, registre un middleware Guzzle mediante el método `withRequestMiddleware`:

```php
use Illuminate\Support\Facades\Http;
use Psr\Http\Message\RequestInterface;

$response = Http::withRequestMiddleware(
    function (RequestInterface $request) {
        return $request->withHeader('X-Example', 'Value');
    }
)->get('http://example.com');
```

Asimismo, puede inspeccionar la respuesta HTTP entrante registrando un middleware mediante el método `withResponseMiddleware`:

```php
use Illuminate\Support\Facades\Http;
use Psr\Http\Message\ResponseInterface;

$response = Http::withResponseMiddleware(
    function (ResponseInterface $response) {
        $header = $response->getHeader('X-Example');

        // ...

        return $response;
    }
)->get('http://example.com');
```

<a id="global-middleware"></a>
#### Middleware global

A veces, es posible que desee registrar un middleware que se aplique a cada solicitud saliente y respuesta entrante. Para lograr esto, puede utilizar los métodos `globalRequestMiddleware` y `globalResponseMiddleware`. Normalmente, estos métodos se deben invocar en el método `boot` del `AppServiceProvider` de su aplicación:

```php
use Illuminate\Support\Facades\Http;

Http::globalRequestMiddleware(fn ($request) => $request->withHeader(
    'User-Agent', 'Example Application/1.0'
));

Http::globalResponseMiddleware(fn ($response) => $response->withHeader(
    'X-Finished-At', now()->toDateTimeString()
));
```

<a id="guzzle-options"></a>
### Opciones de trago

Puede especificar [opciones de solicitud Guzzle](http://docs.guzzlephp.org/en/stable/request-options.html) adicionales para una solicitud saliente utilizando el método `withOptions`. El método `withOptions` acepta una matriz de pares clave/valor:

```php
$response = Http::withOptions([
    'debug' => true,
])->get('http://example.com/users');
```

<a id="global-options"></a>
#### Opciones globales

Para configurar las opciones predeterminadas para cada solicitud saliente, puede utilizar el método `globalOptions`. Normalmente, este método debe invocarse desde el método `boot` del `AppServiceProvider` de su aplicación:

```php
use Illuminate\Support\Facades\Http;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Http::globalOptions([
        'allow_redirects' => false,
    ]);
}
```

<a id="concurrent-requests"></a>
## Solicitudes simultáneas

A veces, es posible que desee realizar varias solicitudes HTTP al mismo tiempo. En otras palabras, desea enviar varias solicitudes al mismo tiempo en lugar de emitirlas de forma secuencial. Esto puede generar mejoras sustanciales en el rendimiento al interactuar con API HTTP lentas.

<a id="request-pooling"></a>
### Solicitar agrupación

Afortunadamente, puedes lograr esto usando el método `pool`. El método `pool` acepta una función anónima que recibe una instancia `Illuminate\Http\Client\Pool`, lo que le permite agregar fácilmente solicitudes al grupo de solicitudes para su envío:

```php
use Illuminate\Http\Client\Pool;
use Illuminate\Support\Facades\Http;

$responses = Http::pool(fn (Pool $pool) => [
    $pool->get('http://localhost/first'),
    $pool->get('http://localhost/second'),
    $pool->get('http://localhost/third'),
]);

return $responses[0]->ok() &&
       $responses[1]->ok() &&
       $responses[2]->ok();
```

Como puede ver, se puede acceder a cada instancia de respuesta según el orden en que se agregó al grupo. Si lo deseas, puedes nombrar las solicitudes utilizando el método `as`, que te permite acceder a las respuestas correspondientes por nombre:

```php
use Illuminate\Http\Client\Pool;
use Illuminate\Support\Facades\Http;

$responses = Http::pool(fn (Pool $pool) => [
    $pool->as('first')->get('http://localhost/first'),
    $pool->as('second')->get('http://localhost/second'),
    $pool->as('third')->get('http://localhost/third'),
]);

return $responses['first']->ok();
```

La simultaneidad máxima del grupo de solicitudes se puede controlar proporcionando el argumento `concurrency` al método `pool`. Este valor determina el número máximo de solicitudes HTTP que pueden estar en curso simultáneamente mientras se procesa el grupo de solicitudes:

```php
$responses = Http::pool(fn (Pool $pool) => [
    // ...
], concurrency: 5);
```

Si una solicitud agrupada falla en el nivel de conexión (por ejemplo, un tiempo de espera o una falla de DNS), la entrada correspondiente en la matriz `$responses` será una instancia `Illuminate\Http\Client\ConnectionException` en lugar de una instancia `Response`:

```php
foreach ($responses as $response) {
    if ($response instanceof Throwable) {
        // The request failed to connect...
    } elseif ($response->failed()) {
        // The request connected but received an error response...
    }
}
```

<a id="customizing-concurrent-requests"></a>
#### Personalización de solicitudes simultáneas

El método `pool` no se puede encadenar con otros métodos de cliente HTTP, como los métodos `withHeaders` o `middleware`. Si desea aplicar encabezados personalizados o middleware a solicitudes agrupadas, debe configurar esas opciones en cada solicitud del grupo:

```php
use Illuminate\Http\Client\Pool;
use Illuminate\Support\Facades\Http;

$headers = [
    'X-Example' => 'example',
];

$responses = Http::pool(fn (Pool $pool) => [
    $pool->withHeaders($headers)->get('http://laravel.test/test'),
    $pool->withHeaders($headers)->get('http://laravel.test/test'),
    $pool->withHeaders($headers)->get('http://laravel.test/test'),
]);
```

<a id="request-batching"></a>
### Solicitar procesamiento por lotes

Otra forma de trabajar con solicitudes simultáneas en Laravel es utilizar el método `batch`. Al igual que el método `pool`, acepta una función anónima que recibe una instancia `Illuminate\Http\Client\Batch`, lo que le permite agregar fácilmente solicitudes al grupo de solicitudes para su envío, pero también le permite definir devoluciones de llamada de finalización:

```php
use Illuminate\Http\Client\Batch;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

$responses = Http::batch(fn (Batch $batch) => [
    $batch->get('http://localhost/first'),
    $batch->get('http://localhost/second'),
    $batch->get('http://localhost/third'),
])->before(function (Batch $batch) {
    // The batch has been created but no requests have been initialized...
})->progress(function (Batch $batch, int|string $key, Response $response) {
    // An individual request has completed successfully...
})->then(function (Batch $batch, array $results) {
    // All requests completed successfully...
})->catch(function (Batch $batch, int|string $key, Response|RequestException|ConnectionException $response) {
    // Batch request failure detected...
})->finally(function (Batch $batch, array $results) {
    // The batch has finished executing...
})->send();
```

Al igual que el método `pool`, puede utilizar el método `as` para nombrar sus solicitudes:

```php
$responses = Http::batch(fn (Batch $batch) => [
    $batch->as('first')->get('http://localhost/first'),
    $batch->as('second')->get('http://localhost/second'),
    $batch->as('third')->get('http://localhost/third'),
])->send();
```

Después de iniciar un `batch` llamando al método `send`, no puede agregarle nuevas solicitudes. Si intenta hacerlo, se generará una excepción `Illuminate\Http\Client\BatchInProgressException`.

La simultaneidad máxima del lote de solicitudes se puede controlar mediante el método `concurrency`. Este valor determina el número máximo de solicitudes HTTP que pueden estar en curso simultáneamente mientras se procesa el lote de solicitudes:

```php
$responses = Http::batch(fn (Batch $batch) => [
    // ...
])->concurrency(5)->send();
```

<a id="inspecting-batches"></a>
#### Inspeccionar lotes

La instancia `Illuminate\Http\Client\Batch` que se proporciona para las devoluciones de llamadas de finalización por lotes tiene una variedad de propiedades y métodos para ayudarlo a interactuar e inspeccionar un lote determinado de solicitudes:

```php
// The number of requests assigned to the batch...
$batch->totalRequests;

// The number of requests that have not been processed yet...
$batch->pendingRequests;

// The number of requests that have failed...
$batch->failedRequests;

// The number of requests that have been processed thus far...
$batch->processedRequests();

// Indicates if the batch has finished executing...
$batch->finished();

// Indicates if the batch has request failures...
$batch->hasFailures();
```
<a id="deferring-batches"></a>
#### Aplazar lotes

Cuando se invoca el método `defer`, el lote de solicitudes no se ejecuta inmediatamente. En cambio, Laravel ejecutará el lote después de que la respuesta HTTP de la solicitud de la aplicación actual haya sido enviada al usuario, haciendo que su aplicación se sienta rápida y receptiva:

```php
use Illuminate\Http\Client\Batch;
use Illuminate\Support\Facades\Http;

$responses = Http::batch(fn (Batch $batch) => [
    $batch->get('http://localhost/first'),
    $batch->get('http://localhost/second'),
    $batch->get('http://localhost/third'),
])->then(function (Batch $batch, array $results) {
    // All requests completed successfully...
})->defer();
```

<a id="macros"></a>
## Macros

El cliente HTTP Laravel le permite definir "macros", que pueden servir como un mecanismo fluido y expresivo para configurar rutas de solicitud y encabezados comunes al interactuar con servicios en toda su aplicación. Para comenzar, puede definir la macro dentro del método `boot` de la clase `App\Providers\AppServiceProvider` de su aplicación:

```php
use Illuminate\Support\Facades\Http;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Http::macro('github', function () {
        return Http::withHeaders([
            'X-Example' => 'example',
        ])->baseUrl('https://github.com');
    });
}
```

Una vez que se haya configurado su macro, puede invocarla desde cualquier lugar de su aplicación para crear una solicitud pendiente con la configuración especificada:

```php
$response = Http::github()->get('/');
```

<a id="testing"></a>
## Pruebas

Muchos servicios de Laravel brindan funcionalidad para ayudarlo a escribir pruebas de manera fácil y expresiva, y el cliente HTTP de Laravel no es una excepción. El método `fake` de la fachada `Http` le permite indicarle al cliente HTTP que devuelva respuestas simuladas o simuladas cuando se realizan solicitudes.

<a id="faking-responses"></a>
### Respuestas falsas

Por ejemplo, para indicarle al cliente HTTP que devuelva respuestas de código de estado `200` vacías para cada solicitud, puede llamar al método `fake` sin argumentos:

```php
use Illuminate\Support\Facades\Http;

Http::fake();

$response = Http::post(/* ... */);
```

<a id="faking-specific-urls"></a>
#### Falsificar URL específicas

Alternativamente, puede pasar una matriz al método `fake`. Las claves de la matriz deben representar patrones de URL que desea falsificar y sus respuestas asociadas. El carácter `*` se puede utilizar como carácter comodín. Puede utilizar el método `response` de la fachada `Http` para construir respuestas auxiliares/falsas para estos puntos finales:

```php
Http::fake([
    // Stub a JSON response for GitHub endpoints...
    'github.com/*' => Http::response(['foo' => 'bar'], 200, $headers),

    // Stub a string response for Google endpoints...
    'google.com/*' => Http::response('Hello World', 200, $headers),
]);
```

Cualquier solicitud realizada a URL que no hayan sido falsificadas se ejecutará. Si desea especificar un patrón de URL alternativo que resguardará todas las URL no coincidentes, puede utilizar un único carácter `*`:

```php
Http::fake([
    // Stub a JSON response for GitHub endpoints...
    'github.com/*' => Http::response(['foo' => 'bar'], 200, ['Headers']),

    // Stub a string response for all other endpoints...
    '*' => Http::response('Hello World', 200, ['Headers']),
]);
```

Por conveniencia, se pueden generar cadenas simples, JSON y respuestas vacías proporcionando una cadena, una matriz o un número entero como respuesta:

```php
Http::fake([
    'google.com/*' => 'Hello World',
    'github.com/*' => ['foo' => 'bar'],
    'chatgpt.com/*' => 200,
]);
```

<a id="faking-connection-exceptions"></a>
#### Falsificar excepciones

A veces es posible que necesites probar el comportamiento de tu aplicación si el cliente HTTP encuentra un `Illuminate\Http\Client\ConnectionException` al intentar realizar una solicitud. Puede indicarle al cliente HTTP que genere una excepción de conexión utilizando el método `failedConnection`:

```php
Http::fake([
    'github.com/*' => Http::failedConnection(),
]);
```

Para probar el comportamiento de su aplicación si se lanza un `Illuminate\Http\Client\RequestException`, puede usar el método `failedRequest`:

```php
$this->mock(GithubService::class)
    ->shouldReceive('getUser')
    ->andThrow(
        Http::failedRequest(['code' => 'not_found'], 404)
    );
```

<a id="faking-response-sequences"></a>
#### Secuencias de respuesta falsas

A veces es posible que necesites especificar que una única URL debe devolver una serie de respuestas falsas en un orden específico. Puede lograr esto utilizando el método `Http::sequence` para generar las respuestas:

```php
Http::fake([
    // Stub a series of responses for GitHub endpoints...
    'github.com/*' => Http::sequence()
        ->push('Hello World', 200)
        ->push(['foo' => 'bar'], 200)
        ->pushStatus(404),
]);
```

Cuando se hayan consumido todas las respuestas de una secuencia de respuestas, cualquier solicitud adicional hará que la secuencia de respuestas genere una excepción. Si desea especificar una respuesta predeterminada que se debe devolver cuando una secuencia está vacía, puede utilizar el método `whenEmpty`:

```php
Http::fake([
    // Stub a series of responses for GitHub endpoints...
    'github.com/*' => Http::sequence()
        ->push('Hello World', 200)
        ->push(['foo' => 'bar'], 200)
        ->whenEmpty(Http::response()),
]);
```

Si desea falsificar una secuencia de respuestas pero no necesita especificar un patrón de URL específico que deba falsificarse, puede utilizar el método `Http::fakeSequence`:

```php
Http::fakeSequence()
    ->push('Hello World', 200)
    ->whenEmpty(Http::response());
```

<a id="fake-callback"></a>
#### Devolución de llamada falsa

Si necesita una lógica más complicada para determinar qué respuestas devolver para determinados puntos finales, puede pasar una función anónima al método `fake`. esta función anónima recibirá una instancia de `Illuminate\Http\Client\Request` y debería devolver una instancia de respuesta. Dentro de su función anónima, puede realizar cualquier lógica que sea necesaria para determinar qué tipo de respuesta devolver:

```php
use Illuminate\Http\Client\Request;

Http::fake(function (Request $request) {
    return Http::response('Hello World', 200);
});
```

<a id="inspecting-requests"></a>
### Solicitudes de inspección

Al falsificar respuestas, es posible que en ocasiones desee inspeccionar las solicitudes que recibe el cliente para asegurarse de que su aplicación envíe los datos o encabezados correctos. Puede lograr esto llamando al método `Http::assertSent` después de llamar a `Http::fake`.

El método `assertSent` acepta una función anónima que recibirá una instancia `Illuminate\Http\Client\Request` y debería devolver un valor booleano que indique si la solicitud coincide con sus expectativas. Para que se supere la prueba, se debe haber emitido al menos una solicitud que cumpla con las expectativas dadas:

```php
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

Http::fake();

Http::withHeaders([
    'X-First' => 'foo',
])->post('http://example.com/users', [
    'name' => 'Taylor',
    'role' => 'Developer',
]);

Http::assertSent(function (Request $request) {
    return $request->hasHeader('X-First', 'foo') &&
           $request->url() == 'http://example.com/users' &&
           $request['name'] == 'Taylor' &&
           $request['role'] == 'Developer';
});
```

Si es necesario, puede afirmar que no se envió una solicitud específica utilizando el método `assertNotSent`:

```php
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

Http::fake();

Http::post('http://example.com/users', [
    'name' => 'Taylor',
    'role' => 'Developer',
]);

Http::assertNotSent(function (Request $request) {
    return $request->url() === 'http://example.com/posts';
});
```

Puede utilizar el método `assertSentCount` para afirmar cuántas solicitudes se "enviaron" durante la prueba:

```php
Http::fake();

Http::assertSentCount(5);
```

O puede utilizar el método `assertNothingSent` para afirmar que no se enviaron solicitudes durante la prueba:

```php
Http::fake();

Http::assertNothingSent();
```

<a id="recording-requests-and-responses"></a>
#### Grabación de solicitudes/respuestas

Puede utilizar el método `recorded` para recopilar todas las solicitudes y sus correspondientes respuestas. El método `recorded` devuelve una colección de matrices que contienen instancias de `Illuminate\Http\Client\Request` y `Illuminate\Http\Client\Response`:

```php
Http::fake([
    'https://laravel.com' => Http::response(status: 500),
    'https://nova.laravel.com/' => Http::response(),
]);

Http::get('https://laravel.com');
Http::get('https://nova.laravel.com/');

$recorded = Http::recorded();

[$request, $response] = $recorded[0];
```

Además, el método `recorded` acepta una función anónima que recibirá una instancia de `Illuminate\Http\Client\Request` y `Illuminate\Http\Client\Response` y puede usarse para filtrar pares de solicitud/respuesta según sus expectativas:

```php
use Illuminate\Http\Client\Request;
use Illuminate\Http\Client\Response;

Http::fake([
    'https://laravel.com' => Http::response(status: 500),
    'https://nova.laravel.com/' => Http::response(),
]);

Http::get('https://laravel.com');
Http::get('https://nova.laravel.com/');

$recorded = Http::recorded(function (Request $request, Response $response) {
    return $request->url() !== 'https://laravel.com' &&
           $response->successful();
});
```

<a id="preventing-stray-requests"></a>
### Prevención de solicitudes perdidas

Si desea asegurarse de que todas las solicitudes enviadas a través del cliente HTTP hayan sido falsificadas durante su prueba individual o conjunto de pruebas completo, puede llamar al método `preventStrayRequests`. Después de llamar a este método, cualquier solicitud que no tenga una respuesta falsa correspondiente generará una excepción en lugar de realizar la solicitud HTTP real:

```php
use Illuminate\Support\Facades\Http;

Http::preventStrayRequests();

Http::fake([
    'github.com/*' => Http::response('ok'),
]);

// An "ok" response is returned...
Http::get('https://github.com/laravel/framework');

// An exception is thrown...
Http::get('https://laravel.com');
```

A veces, es posible que desee evitar la mayoría de las solicitudes perdidas y al mismo tiempo permitir que se ejecuten solicitudes específicas. Para lograr esto, puede pasar una serie de patrones de URL al método `allowStrayRequests`. Se permitirá cualquier solicitud que coincida con uno de los patrones dados, mientras que todas las demás solicitudes seguirán generando una excepción:

```php
use Illuminate\Support\Facades\Http;

Http::preventStrayRequests();

Http::allowStrayRequests([
    'http://127.0.0.1:5000/*',
]);

// This request is executed...
Http::get('http://127.0.0.1:5000/generate');

// An exception is thrown...
Http::get('https://laravel.com');
```

<a id="events"></a>
## Eventos

Laravel activa tres eventos durante el proceso de envío de solicitudes HTTP. El evento `RequestSending` se activa antes de que se envíe una solicitud, mientras que el evento `ResponseReceived` se activa después de recibir una respuesta para una solicitud determinada. El evento `ConnectionFailed` se activa si no se recibe respuesta para una solicitud determinada.

Los eventos `RequestSending` y `ConnectionFailed` contienen una propiedad pública `$request` que puede usar para inspeccionar la instancia `Illuminate\Http\Client\Request`. Del mismo modo, el evento `ResponseReceived` contiene una propiedad `$request` así como una propiedad `$response` que puede usarse para inspeccionar la instancia `Illuminate\Http\Client\Response`. Puede crear [escuchas de eventos](../events/) para estos eventos dentro de su aplicación:

```php
use Illuminate\Http\Client\Events\RequestSending;

class LogRequest
{
    /**
     * Handle the event.
     */
    public function handle(RequestSending $event): void
    {
        // $event->request ...
    }
}
```
