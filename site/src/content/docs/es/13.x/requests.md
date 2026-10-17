---
title: "Solicitudes HTTP"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Interactuando con la Solicitud](#interacting-with-the-request)
    - [Accediendo a la Solicitud](#accessing-the-request)
    - [Ruta de solicitud, host y método](#request-path-and-method)
    - [Encabezados de solicitud](#request-headers)
    - [Solicitar dirección IP](#request-ip-address)
    - [Negociación de contenidos](#content-negotiation)
    - [Solicitudes PSR-7](#psr7-requests)
- [Entrada](#input)
    - [Recuperando entrada](#retrieving-input)
    - [Presencia de entrada](#input-presence)
    - [Fusionando entrada adicional](#merging-additional-input)
    - [Entrada antigua](#old-input)
    - [Galletas](#cookies)
    - [Recorte y normalización de entrada](#input-trimming-and-normalization)
- [Archivos](#files)
    - [Recuperando archivos cargados](#retrieving-uploaded-files)
    - [Almacenamiento de archivos cargados](#storing-uploaded-files)
- [Configuración de servidores proxy de confianza](#configuring-trusted-proxies)
- [Configuración de hosts confiables](#configuring-trusted-hosts)

<a id="introduction"></a>
## Introducción

La clase `Illuminate\Http\Request` de Laravel proporciona una forma orientada a objetos de interactuar con la solicitud HTTP actual que maneja su aplicación, así como recuperar la entrada, las cookies y los archivos que se enviaron con la solicitud.

<a id="interacting-with-the-request"></a>
## Interactuando con la solicitud

<a id="accessing-the-request"></a>
### Accediendo a la Solicitud

Para obtener una instancia de la solicitud HTTP actual mediante inyección de dependencia, debe escribir una sugerencia de la clase `Illuminate\Http\Request` en su método de cierre de ruta o de controlador. Laravel [contenedor de servicio](../container/)] inyectará automáticamente la instancia de solicitud entrante:

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
        $name = $request->input('name');

        // Store the user...

        return redirect('/users');
    }
}
```

Como se mencionó, también puede escribir una pista sobre la clase `Illuminate\Http\Request` en el cierre de una ruta. El contenedor de servicios inyectará automáticamente la solicitud entrante en el cierre cuando se ejecute:

```php
use Illuminate\Http\Request;

Route::get('/', function (Request $request) {
    // ...
});
```

<a id="dependency-injection-route-parameters"></a>
#### Inyección de dependencia y parámetros de ruta

Si su método de controlador también espera información de un parámetro de ruta, debe enumerar sus parámetros de ruta después de sus otras dependencias. Por ejemplo, si su ruta se define así:

```php
use App\Http\Controllers\UserController;

Route::put('/user/{id}', [UserController::class, 'update']);
```

Aún puede escribir la sugerencia `Illuminate\Http\Request` y acceder a su parámetro de ruta `id` definiendo su método de controlador de la siguiente manera:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Update the specified user.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        // Update the user...

        return redirect('/users');
    }
}
```

<a id="request-path-and-method"></a>
### Ruta de solicitud, host y método

La instancia `Illuminate\Http\Request` proporciona una variedad de métodos para examinar la solicitud HTTP entrante y extiende la clase `Symfony\Component\HttpFoundation\Request`. Discutiremos algunos de los métodos más importantes a continuación.

<a id="retrieving-the-request-path"></a>
#### Recuperando la ruta de solicitud

El método `path` devuelve la información de la ruta de la solicitud. Entonces, si la solicitud entrante está dirigida a `http://example.com/foo/bar`, el método `path` devolverá `foo/bar`:

```php
$uri = $request->path();
```

<a id="inspecting-the-request-path"></a>
#### Inspeccionando la ruta/ruta de la solicitud

El método `is` le permite verificar que la ruta de la solicitud entrante coincida con un patrón determinado. Puede utilizar el carácter `*` como comodín cuando utilice este método:

```php
if ($request->is('admin/*')) {
    // ...
}
```

Usando el método `routeIs`, puede determinar si la solicitud entrante coincide con una [ruta nombrada](../routing/#named-routes):

```php
if ($request->routeIs('admin.*')) {
    // ...
}
```

<a id="retrieving-the-request-url"></a>
#### Recuperando la URL de solicitud

Para recuperar la URL completa de la solicitud entrante, puede utilizar los métodos `url` o `fullUrl`. El método `url` devolverá la URL sin la cadena de consulta, mientras que el método `fullUrl` incluye la cadena de consulta:

```php
$url = $request->url();

$urlWithQueryString = $request->fullUrl();
```

Si desea agregar datos de cadena de consulta a la URL actual, puede llamar al método `fullUrlWithQuery`. Este método fusiona la matriz dada de variables de cadena de consulta con la cadena de consulta actual:

```php
$request->fullUrlWithQuery(['type' => 'phone']);
```

Si desea obtener la URL actual sin un parámetro de cadena de consulta determinado, puede utilizar el método `fullUrlWithoutQuery`:

```php
$request->fullUrlWithoutQuery(['type']);
```

<a id="retrieving-the-request-host"></a>
#### Recuperando el host de solicitud

Puede recuperar el "host" de la solicitud entrante mediante los métodos `host`, `httpHost` y `schemeAndHttpHost`:

```php
// http://localhost:8000
$request->host(); // localhost
$request->httpHost(); // localhost:8000
$request->schemeAndHttpHost(); // http://localhost:8000
```

<a id="retrieving-the-request-method"></a>
#### Recuperando el método de solicitud

El método `method` devolverá el verbo HTTP para la solicitud. Puede utilizar el método `isMethod` para verificar que el verbo HTTP coincida con una cadena determinada:

```php
$method = $request->method();

if ($request->isMethod('post')) {
    // ...
}
```

<a id="request-headers"></a>
### Solicitar encabezados

Puede recuperar un encabezado de solicitud de la instancia `Illuminate\Http\Request` utilizando el método `header`. Si el encabezado no está presente en la solicitud, se devolverá `null`. Sin embargo, el método `header` acepta un segundo argumento opcional que se devolverá si el encabezado no está presente en la solicitud:

```php
$value = $request->header('X-Header-Name');

$value = $request->header('X-Header-Name', 'default');
```

El método `hasHeader` se puede utilizar para determinar si la solicitud contiene un encabezado determinado:

```php
if ($request->hasHeader('X-Header-Name')) {
    // ...
}
```

Por conveniencia, se puede utilizar el método `bearerToken` para recuperar un token de portador del encabezado `Authorization`. Si no existe dicho encabezado, se devolverá una cadena vacía:

```php
$token = $request->bearerToken();
```

<a id="request-ip-address"></a>
### Solicitar dirección IP

El método `ip` se puede utilizar para recuperar la dirección IP del cliente que realizó la solicitud a su aplicación:

```php
$ipAddress = $request->ip();
```

Si desea recuperar una serie de direcciones IP, incluidas todas las direcciones IP de clientes que fueron reenviadas por servidores proxy, puede utilizar el método `ips`. La dirección IP del cliente "original" estará al final de la matriz:

```php
$ipAddresses = $request->ips();
```

En general, las direcciones IP deben considerarse entradas no confiables, controladas por el usuario y utilizadas únicamente con fines informativos.

<a id="content-negotiation"></a>
### Negociación de contenidos

Laravel proporciona varios métodos para inspeccionar los tipos de contenido solicitados de la solicitud entrante a través del encabezado `Accept`. Primero, el método `getAcceptableContentTypes` devolverá una matriz que contiene todos los tipos de contenido aceptados por la solicitud:

```php
$contentTypes = $request->getAcceptableContentTypes();
```

El método `accepts` acepta una variedad de tipos de contenido y devuelve `true` si la solicitud acepta alguno de los tipos de contenido. De lo contrario, se devolverá `false`:

```php
if ($request->accepts(['text/html', 'application/json'])) {
    // ...
}
```

Puede utilizar el método `prefers` para determinar qué tipo de contenido de una determinada variedad de tipos de contenido es el más preferido por la solicitud. Si la solicitud no acepta ninguno de los tipos de contenido proporcionados, se devolverá `null`:

```php
$preferred = $request->prefers(['text/html', 'application/json']);
```

Dado que muchas aplicaciones solo sirven HTML o JSON, puede utilizar el método `expectsJson` para determinar rápidamente si la solicitud entrante espera una respuesta JSON:

```php
if ($request->expectsJson()) {
    // ...
}
```

Si necesita determinar si la solicitud prefiere específicamente Markdown o aceptará Markdown entre otros tipos de contenido, como cuando atiende a agentes de IA u otros clientes que consumen respuestas de Markdown, puede usar los métodos `wantsMarkdown` y `acceptsMarkdown`:

```php
if ($request->wantsMarkdown()) {
    // The client's most preferred content type is text/markdown...
}

if ($request->acceptsMarkdown()) {
    // The client accepts Markdown responses...
}
```

<a id="psr7-requests"></a>
### Solicitudes de PSR-7

El [estándar PSR-7](https://www.php-fig.org/psr/psr-7/) especifica interfaces para mensajes HTTP, incluidas solicitudes y respuestas. Si desea obtener una instancia de una solicitud PSR-7 en lugar de una solicitud Laravel, primero deberá instalar algunas bibliotecas. Laravel utiliza el componente *Symfony HTTP Message Bridge* para convertir solicitudes y respuestas típicas de Laravel en implementaciones compatibles con PSR-7:

```shell
composer require symfony/psr-http-message-bridge
composer require nyholm/psr7
```

Una vez que haya instalado estas bibliotecas, puede obtener una solicitud PSR-7 escribiendo sugerencias en la interfaz de solicitud en su método de cierre de ruta o controlador:

```php
use Psr\Http\Message\ServerRequestInterface;

Route::get('/', function (ServerRequestInterface $request) {
    // ...
});
```

> **Nota:**
> Si devuelve una instancia de respuesta PSR-7 desde una ruta o controlador, se volverá a convertir automáticamente en una instancia de respuesta de Laravel y el marco la mostrará.

<a id="input"></a>
## Entrada

<a id="retrieving-input"></a>
### Recuperando entrada

<a id="retrieving-all-input-data"></a>
#### Recuperando todos los datos de entrada

Puede recuperar todos los datos de entrada de la solicitud entrante como `array` utilizando el método `all`. Este método se puede utilizar independientemente de si la solicitud entrante proviene de un formulario HTML o es una solicitud XHR:

```php
$input = $request->all();
```

Con el método `collect`, puede recuperar todos los datos de entrada de la solicitud entrante como [colección](../collections/):

```php
$input = $request->collect();
```

El método `collect` también le permite recuperar un subconjunto de la entrada de la solicitud entrante como una colección:

```php
$request->collect('users')->each(function (string $user) {
    // ...
});
```

<a id="retrieving-an-input-value"></a>
#### Recuperar un valor de entrada

Usando algunos métodos simples, puede acceder a todas las entradas del usuario desde su instancia `Illuminate\Http\Request` sin preocuparse por qué verbo HTTP se usó para la solicitud. Independientemente del verbo HTTP, se puede utilizar el método `input` para recuperar la entrada del usuario:

```php
$name = $request->input('name');
```

Puede pasar un valor predeterminado como segundo argumento al método `input`. Este valor se devolverá si el valor de entrada solicitado no está presente en la solicitud:

```php
$name = $request->input('name', 'Sally');
```

Cuando trabaje con formularios que contienen entradas de matriz, utilice la notación de "puntos" para acceder a las matrices:

```php
$name = $request->input('products.0.name');

$names = $request->input('products.*.name');
```

Puede llamar al método `input` sin ningún argumento para recuperar todos los valores de entrada como una matriz asociativa:

```php
$input = $request->input();
```

<a id="retrieving-input-from-the-query-string"></a>
#### Recuperar datos de la cadena de consulta

Mientras que el método `input` recupera valores de toda la carga útil de la solicitud (incluida la cadena de consulta), el método `query` solo recuperará valores de la cadena de consulta:

```php
$name = $request->query('name');
```

Si los datos del valor de la cadena de consulta solicitada no están presentes, se devolverá el segundo argumento de este método:

```php
$name = $request->query('name', 'Helen');
```

Puede llamar al método `query` sin ningún argumento para recuperar todos los valores de la cadena de consulta como una matriz asociativa:

```php
$query = $request->query();
```

<a id="retrieving-json-input-values"></a>
#### Recuperar valores de entrada JSON

Al enviar solicitudes JSON a su aplicación, puede acceder a los datos JSON a través del método `input` siempre que el encabezado `Content-Type` de la solicitud esté configurado correctamente en `application/json`. Incluso puede utilizar la sintaxis de "punto" para recuperar valores anidados dentro de matrices/objetos JSON:

```php
$name = $request->input('user.name');
```

<a id="retrieving-stringable-input-values"></a>
#### Recuperar valores de entrada encadenables

En lugar de recuperar los datos de entrada de la solicitud como un `string` primitivo, puede usar el método `string` para recuperar los datos de la solicitud como una instancia de [Illuminate\Support\Stringable](../strings/):

```php
$name = $request->string('name')->trim();
```

<a id="retrieving-integer-input-values"></a>
#### Recuperar valores de entrada enteros

Para recuperar valores de entrada como números enteros, puede utilizar el método `integer`. Este método intentará convertir el valor de entrada a un número entero. Si la entrada no está presente, devolverá el valor predeterminado que especifique. Esto es particularmente útil para paginación u otras entradas numéricas:

```php
$perPage = $request->integer('per_page');
```

<a id="retrieving-boolean-input-values"></a>
#### Recuperar valores de entrada booleanos

Cuando se trata de elementos HTML como casillas de verificación, su aplicación puede recibir valores "veraces" que en realidad son cadenas. Por ejemplo, "verdadero" o "activo". Para mayor comodidad, puede utilizar el método `boolean` para recuperar estos valores como booleanos. El método `boolean` devuelve `true` para 1, "1", verdadero, "verdadero", "activado" y "sí". Todos los demás valores devolverán `false`:

```php
$archived = $request->boolean('archived');
```

<a id="retrieving-array-input-values"></a>
#### Recuperando valores de entrada de matriz

Los valores de entrada que contienen matrices se pueden recuperar utilizando el método `array`. Este método siempre convertirá el valor de entrada en una matriz. Si la solicitud no contiene un valor de entrada con el nombre dado, se devolverá una matriz vacía:

```php
$versions = $request->array('versions');
```

<a id="retrieving-date-input-values"></a>
#### Recuperar valores de entrada de fecha

Para mayor comodidad, los valores de entrada que contienen fechas/horas se pueden recuperar como instancias de Carbon utilizando el método `date`. Si la solicitud no contiene un valor de entrada con el nombre indicado, se devolverá `null`:

```php
$birthday = $request->date('birthday');
```

El segundo y tercer argumento aceptados por el método `date` se pueden usar para especificar el formato de fecha y la zona horaria, respectivamente:

```php
$elapsed = $request->date('elapsed', '!H:i', 'Europe/Madrid');
```

Si el valor de entrada está presente pero tiene un formato no válido, se generará un `InvalidArgumentException`; por lo tanto, se recomienda validar la entrada antes de invocar el método `date`.

<a id="retrieving-interval-input-values"></a>
#### Recuperar valores de entrada de intervalo

Los valores de entrada que contienen duraciones se pueden recuperar como instancias `CarbonInterval` utilizando el método `interval`. Si la solicitud no contiene un valor de entrada con el nombre indicado, se devolverá `null`:

```php
$duration = $request->interval('duration');
```

Si el valor de entrada es numérico, puede proporcionar una unidad como segundo argumento. La unidad puede ser una cadena como `second`, `minute` o `day`, o una instancia de enumeración `Carbon\Unit`:

```php
use Carbon\Unit;

$timeout = $request->interval('timeout', 'second');

$delay = $request->interval('delay', Unit::Minute);
```

Si el valor de entrada está presente pero tiene un formato no válido, se generará un `InvalidArgumentException`; por lo tanto, se recomienda validar la entrada antes de invocar el método `interval`.

<a id="retrieving-enum-input-values"></a>
#### Recuperando valores de entrada de enumeración

Los valores de entrada que corresponden a [PHP enums](https://www.php.net/manual/en/language.types.enumerations.php) también se pueden recuperar de la solicitud. Si la solicitud no contiene un valor de entrada con el nombre dado o la enumeración no tiene un valor de respaldo que coincida con el valor de entrada, se devolverá `null`. El método `enum` acepta el nombre del valor de entrada y la clase de enumeración como primer y segundo argumento:

```php
use App\Enums\Status;

$status = $request->enum('status', Status::class);
```

También puede proporcionar un valor predeterminado que se devolverá si el valor falta o no es válido:

```php
$status = $request->enum('status', Status::class, Status::Pending);
```

Si el valor de entrada es una matriz de valores que corresponden a una enumeración PHP, puede usar el método `enums` para recuperar la matriz de valores como instancias de enumeración:

```php
use App\Enums\Product;

$products = $request->enums('products', Product::class);
```

<a id="retrieving-input-via-dynamic-properties"></a>
#### Recuperar entradas mediante propiedades dinámicas

También puede acceder a la entrada del usuario mediante propiedades dinámicas en la instancia `Illuminate\Http\Request`. Por ejemplo, si uno de los formularios de su aplicación contiene un campo `name`, puede acceder al valor del campo de esta manera:

```php
$name = $request->name;
```

Al usar propiedades dinámicas, Laravel primero buscará el valor del parámetro en la carga útil de la solicitud. Si no está presente, Laravel buscará el campo en los parámetros de la ruta coincidente.

<a id="retrieving-a-portion-of-the-input-data"></a>
#### Recuperar una parte de los datos de entrada

Si necesita recuperar un subconjunto de los datos de entrada, puede utilizar los métodos `only` y `except`. Ambos métodos aceptan un único `array` o una lista dinámica de argumentos:

```php
$input = $request->only(['username', 'password']);

$input = $request->only('username', 'password');

$input = $request->except(['credit_card']);

$input = $request->except('credit_card');
```

> **Advertencia:**
> El método `only` devuelve todos los pares clave/valor que usted solicita; sin embargo, no devolverá pares clave/valor que no estén presentes en la solicitud.

<a id="input-presence"></a>
### Presencia de entrada

Puede utilizar el método `has` para determinar si hay un valor presente en la solicitud. El método `has` devuelve `true` si el valor está presente en la solicitud:

```php
if ($request->has('name')) {
    // ...
}
```

Cuando se le proporciona una matriz, el método `has` determinará si todos los valores especificados están presentes:

```php
if ($request->has(['name', 'email'])) {
    // ...
}
```

El método `hasAny` devuelve `true` si alguno de los valores especificados está presente:

```php
if ($request->hasAny(['name', 'email'])) {
    // ...
}
```

El método `whenHas` ejecutará el cierre dado si hay un valor presente en la solicitud:

```php
$request->whenHas('name', function (string $input) {
    // ...
});
```

Se puede pasar un segundo cierre al método `whenHas` que se ejecutará si el valor especificado no está presente en la solicitud:

```php
$request->whenHas('name', function (string $input) {
    // The "name" value is present...
}, function () {
    // The "name" value is not present...
});
```

Si desea determinar si un valor está presente en la solicitud y no es una cadena vacía, puede utilizar el método `filled`:

```php
if ($request->filled('name')) {
    // ...
}
```

Si desea determinar si falta un valor en la solicitud o es una cadena vacía, puede utilizar el método `isNotFilled`:

```php
if ($request->isNotFilled('name')) {
    // ...
}
```

Cuando se le proporciona una matriz, el método `isNotFilled` determinará si todos los valores especificados faltan o están vacíos:

```php
if ($request->isNotFilled(['name', 'email'])) {
    // ...
}
```

El método `anyFilled` devuelve `true` si alguno de los valores especificados no es una cadena vacía:

```php
if ($request->anyFilled(['name', 'email'])) {
    // ...
}
```

El método `whenFilled` ejecutará el cierre dado si hay un valor presente en la solicitud y no es una cadena vacía:

```php
$request->whenFilled('name', function (string $input) {
    // ...
});
```

Se puede pasar un segundo cierre al método `whenFilled` que se ejecutará si el valor especificado no se "completa":

```php
$request->whenFilled('name', function (string $input) {
    // The "name" value is filled...
}, function () {
    // The "name" value is not filled...
});
```

Para determinar si una clave determinada está ausente en la solicitud, puede utilizar los métodos `missing` y `whenMissing`:

```php
if ($request->missing('name')) {
    // ...
}

$request->whenMissing('name', function () {
    // The "name" value is missing...
}, function () {
    // The "name" value is present...
});
```

<a id="merging-additional-input"></a>
### Fusionando entradas adicionales

A veces es posible que necesites fusionar manualmente entradas adicionales con los datos de entrada existentes de la solicitud. Para lograr esto, puede utilizar el método `merge`. Si una clave de entrada determinada ya existe en la solicitud, se sobrescribirá con los datos proporcionados al método `merge`:

```php
$request->merge(['votes' => 0]);
```

El método `mergeIfMissing` se puede utilizar para fusionar entradas en la solicitud si las claves correspondientes aún no existen dentro de los datos de entrada de la solicitud:

```php
$request->mergeIfMissing(['votes' => 0]);
```

<a id="old-input"></a>
### Entrada antigua

Laravel le permite conservar la entrada de una solicitud durante la siguiente solicitud. Esta característica es particularmente útil para volver a completar formularios después de detectar errores de validación. Sin embargo, si está utilizando las [funciones de validación ](../validation/) incluidas en Laravel, es posible que no necesite usar manualmente estos métodos de actualización de entrada de sesión directamente, ya que algunas de las funciones de validación integradas de Laravel los llamarán automáticamente.

<a id="flashing-input-to-the-session"></a>
#### Entrada intermitente a la sesión

El método `flash` en la clase `Illuminate\Http\Request` mostrará la entrada actual en [session](../session/) para que esté disponible durante la próxima solicitud del usuario a la aplicación:

```php
$request->flash();
```

También puede utilizar los métodos `flashOnly` y `flashExcept` para actualizar un subconjunto de los datos de la solicitud en la sesión. Estos métodos son útiles para mantener información confidencial, como contraseñas, fuera de la sesión:

```php
$request->flashOnly(['username', 'email']);

$request->flashExcept('password');
```

<a id="flashing-input-then-redirecting"></a>
#### Entrada intermitente y luego redirección

Dado que a menudo querrás actualizar la entrada a la sesión y luego redirigir a la página anterior, puedes encadenar fácilmente la entrada flash en una redirección usando el método `withInput`:

```php
return redirect('/form')->withInput();

return redirect()->route('user.create')->withInput();

return redirect('/form')->withInput(
    $request->except('password')
);
```

<a id="retrieving-old-input"></a>
#### Recuperando entradas antiguas

Para recuperar la entrada actualizada de la solicitud anterior, invoque el método `old` en una instancia de `Illuminate\Http\Request`. El método `old` extraerá los datos de entrada previamente actualizados del [session](../session/):

```php
$username = $request->old('username');
```

Laravel también proporciona un asistente global `old`. Si muestra entradas antiguas dentro de una [plantilla Blade](../blade/), es más conveniente utilizar el asistente `old` para volver a llenar el formulario. Si no existe ninguna entrada antigua para el campo dado, se devolverá `null`:

```blade
<input type="text" name="username" value="{{ old('username') }}">
```

<a id="cookies"></a>
### Galletas

<a id="retrieving-cookies-from-requests"></a>
#### Recuperar cookies de solicitudes

Todas las cookies creadas por el marco Laravel están cifradas y firmadas con un código de autenticación, lo que significa que se considerarán inválidas si el cliente las modifica. Para recuperar un valor de cookie de la solicitud, utilice el método `cookie` en una instancia `Illuminate\Http\Request`:

```php
$value = $request->cookie('name');
```

<a id="input-trimming-and-normalization"></a>
## Recorte y normalización de entradas

De forma predeterminada, Laravel incluye el middleware `Illuminate\Foundation\Http\Middleware\TrimStrings` y `Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull` en la pila de middleware global de su aplicación. Este middleware recortará automáticamente todos los campos de cadena entrantes en la solicitud, así como también convertirá cualquier campo de cadena vacío a `null`. Esto le permite no tener que preocuparse por estos problemas de normalización en sus rutas y controladores.

#### Deshabilitar la normalización de entrada

Si desea deshabilitar este comportamiento para todas las solicitudes, puede eliminar los dos middleware de la pila de middleware de su aplicación invocando el método `$middleware->remove` en el archivo `bootstrap/app.php` de su aplicación:

```php
use Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull;
use Illuminate\Foundation\Http\Middleware\TrimStrings;

->withMiddleware(function (Middleware $middleware): void {
    $middleware->remove([
        ConvertEmptyStringsToNull::class,
        TrimStrings::class,
    ]);
})
```

Si desea deshabilitar el recorte de cadenas y la conversión de cadenas vacías para un subconjunto de solicitudes a su aplicación, puede usar los métodos de middleware `trimStrings` y `convertEmptyStringsToNull` dentro del archivo `bootstrap/app.php` de su aplicación. Ambos métodos aceptan una serie de cierres, que deberían devolver `true` o `false` para indicar si se debe omitir la normalización de entrada:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->convertEmptyStringsToNull(except: [
        fn (Request $request) => $request->is('admin/*'),
    ]);

    $middleware->trimStrings(except: [
        fn (Request $request) => $request->is('admin/*'),
    ]);
})
```

<a id="files"></a>
## Archivos

<a id="retrieving-uploaded-files"></a>
### Recuperando archivos cargados

Puede recuperar archivos cargados desde una instancia `Illuminate\Http\Request` usando el método `file` o usando propiedades dinámicas. El método `file` devuelve una instancia de la clase `Illuminate\Http\UploadedFile`, que extiende la clase PHP `SplFileInfo` y proporciona una variedad de métodos para interactuar con el archivo:

```php
$file = $request->file('photo');

$file = $request->photo;
```

Puede determinar si un archivo está presente en la solicitud utilizando el método `hasFile`:

```php
if ($request->hasFile('photo')) {
    // ...
}
```

Si el archivo cargado es una imagen que necesita manipular antes de almacenar, puede usar el método `image` para recuperar una instancia `Illuminate\Image\Image`, o `null` si el archivo no está presente:

```php
$image = $request->image('photo');
```

Para obtener más información sobre la manipulación de imágenes, consulte la [documentación de manipulación de imágenes](../images/)] completa.

<a id="validating-successful-uploads"></a>
#### Validación de cargas exitosas

Además de verificar si el archivo está presente, puede verificar que no hubo problemas al cargar el archivo mediante el método `isValid`:

```php
if ($request->file('photo')->isValid()) {
    // ...
}
```

<a id="file-paths-extensions"></a>
#### Rutas de archivo y extensiones

La clase `UploadedFile` también contiene métodos para acceder a la ruta completa del archivo y su extensión. El método `extension` intentará adivinar la extensión del archivo en función de su contenido. Esta extensión puede ser diferente de la extensión proporcionada por el cliente:

```php
$path = $request->photo->path();

$extension = $request->photo->extension();
```

<a id="other-file-methods"></a>
#### Otros métodos de archivo

Hay una variedad de otros métodos disponibles en las instancias `UploadedFile`. Consulte la [documentación API para la clase](https://github.com/symfony/symfony/blob/6.0/src/Symfony/Component/HttpFoundation/File/UploadedFile.php) para obtener más información sobre estos métodos.

<a id="storing-uploaded-files"></a>
### Almacenamiento de archivos cargados

Para almacenar un archivo cargado, normalmente utilizará uno de sus [sistemas de archivos](../filesystem/). La clase `UploadedFile` tiene un método `store` que moverá un archivo cargado a uno de sus discos, que puede ser una ubicación en su sistema de archivos local o una ubicación de almacenamiento en la nube como Amazon S3.

El método `store` acepta la ruta donde se debe almacenar el archivo en relación con el directorio raíz configurado del sistema de archivos. Esta ruta no debe contener un nombre de archivo, ya que se generará automáticamente una identificación única que servirá como nombre de archivo.

El método `store` también acepta un segundo argumento opcional para el nombre del disco que debe usarse para almacenar el archivo. El método devolverá la ruta del archivo relativa a la raíz del disco:

```php
$path = $request->photo->store('images');

$path = $request->photo->store('images', 's3');
```

Si no desea que se genere automáticamente un nombre de archivo, puede utilizar el método `storeAs`, que acepta la ruta, el nombre del archivo y el nombre del disco como argumentos:

```php
$path = $request->photo->storeAs('images', 'filename.jpg');

$path = $request->photo->storeAs('images', 'filename.jpg', 's3');
```

> **Nota:**
> Para obtener más información sobre el almacenamiento de archivos en Laravel, consulte la [documentación de almacenamiento de archivos](../filesystem/)] completa.

<a id="configuring-trusted-proxies"></a>
## Configuración de servidores proxy confiables

Al ejecutar sus aplicaciones detrás de un balanceador de carga que termina los certificados TLS/SSL, puede notar que su aplicación a veces no genera enlaces HTTPS cuando usa el asistente `url`. Normalmente, esto se debe a que su aplicación recibe tráfico desde su balanceador de carga en el puerto 80 y no sabe que debe generar enlaces seguros.

Para resolver esto, puede habilitar el middleware `Illuminate\Http\Middleware\TrustProxies` que se incluye en su aplicación Laravel, que le permite personalizar rápidamente los balanceadores de carga o proxies en los que su aplicación debe confiar. Sus servidores proxy de confianza deben especificarse utilizando el método de middleware `trustProxies` en el archivo `bootstrap/app.php` de su aplicación:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->trustProxies(at: [
        '192.168.1.1',
        '10.0.0.0/8',
    ]);
})
```

Además de configurar los servidores proxy confiables, también puede configurar los encabezados de proxy en los que se debe confiar:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->trustProxies(headers: Request::HEADER_X_FORWARDED_FOR |
        Request::HEADER_X_FORWARDED_HOST |
        Request::HEADER_X_FORWARDED_PORT |
        Request::HEADER_X_FORWARDED_PROTO |
        Request::HEADER_X_FORWARDED_AWS_ELB
    );
})
```

> **Nota:**
> Si utiliza AWS Elastic Load Balancing, el valor `headers` debe ser `Request::HEADER_X_FORWARDED_AWS_ELB`. Si su balanceador de carga usa el encabezado `Forwarded` estándar de [RFC 7239](https://www.rfc-editor.org/rfc/rfc7239#section-4), el valor `headers` debe ser `Request::HEADER_FORWARDED`. Para obtener más información sobre las constantes que se pueden utilizar en el valor `headers`, consulte la documentación de Symfony sobre [confiar en proxies](https://symfony.com/doc/current/deployment/proxies.html).

<a id="trusting-all-proxies"></a>
#### Confiar en todos los proxy

Si utiliza Amazon AWS u otro proveedor de balanceadores de carga "en la nube", es posible que no conozca las direcciones IP de sus balanceadores reales. En este caso, puede utilizar `*` para confiar en todos los servidores proxy:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->trustProxies(at: '*');
})
```

<a id="configuring-trusted-hosts"></a>
## Configuración de hosts confiables

De forma predeterminada, Laravel responderá a todas las solicitudes que reciba independientemente del contenido del encabezado `Host` de la solicitud HTTP. Además, el valor del encabezado `Host` se utilizará al generar URL absolutas para su aplicación durante una solicitud web.

Normalmente, debe configurar su servidor web, como Nginx o Apache, para enviar solo solicitudes a su aplicación que coincidan con un nombre de host determinado. Sin embargo, si no tiene la capacidad de personalizar su servidor web directamente y necesita indicarle a Laravel que solo responda a ciertos nombres de host, puede hacerlo habilitando el middleware `Illuminate\Http\Middleware\TrustHosts` para su aplicación.

Para habilitar el middleware `TrustHosts`, debe invocar el método de middleware `trustHosts` en el archivo `bootstrap/app.php` de su aplicación. Usando el argumento `at` de este método, puede especificar los nombres de host a los que debe responder su aplicación. La cadena del nombre de host se trata como una expresión regular. Se rechazarán las solicitudes entrantes con otros encabezados `Host`:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->trustHosts(at: ['^laravel\.test$']);
})
```

De forma predeterminada, las solicitudes provenientes de subdominios de la URL de la aplicación también son de confianza automáticamente. Si desea desactivar este comportamiento, puede utilizar el argumento `subdomains`:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->trustHosts(at: ['^laravel\.test$'], subdomains: false);
})
```

Si necesita acceder a los archivos de configuración o la base de datos de su aplicación para determinar sus hosts confiables, puede proporcionar un cierre al argumento `at`:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->trustHosts(at: fn () => config('app.trusted_hosts'));
})
```
