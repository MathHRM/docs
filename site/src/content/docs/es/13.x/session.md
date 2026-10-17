---
title: "Sesión HTTP"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
    - [Configuración](#configuration)
    - [Requisitos previos del controlador](#driver-prerequisites)
- [Interactuando con la sesión](#interacting-with-the-session)
    - [Recuperando datos](#retrieving-data)
    - [Almacenamiento de datos](#storing-data)
    - [Datos Flash](#flash-data)
    - [Eliminando datos](#deleting-data)
    - [Regenerando la sesión ID](#regenerating-the-session-id)
- [Caché de sesión](#session-cache)
- [Bloqueo de sesión](#session-blocking)
- [Agregar controladores de sesión personalizados](#adding-custom-session-drivers)
    - [Implementación del controlador ](#implementing-the-driver)
    - [Registro del controlador ](#registering-the-driver)

<a id="introduction"></a>
## Introducción

Dado que las aplicaciones controladas por HTTP no tienen estado, las sesiones proporcionan una forma de almacenar información sobre el usuario en múltiples solicitudes. Esa información del usuario generalmente se coloca en un almacén/backend persistente al que se puede acceder desde solicitudes posteriores.

Laravel se entrega con una variedad de backends de sesión a los que se accede a través de una API expresiva y unificada. Se incluye soporte para backends populares como [Memcached](https://memcached.org), [Redis](https://redis.io) y bases de datos.

<a id="configuration"></a>
### Configuración

El archivo de configuración de sesión de su aplicación se almacena en `config/session.php`. Asegúrese de revisar las opciones disponibles en este archivo. De forma predeterminada, Laravel está configurado para usar el controlador de sesión `database`.

La opción de configuración de sesión `driver` define dónde se almacenarán los datos de la sesión para cada solicitud. Laravel incluye una variedad de controladores:

<div class="content-list" markdown="1">

- `file`: las sesiones se almacenan en `storage/framework/sessions`.
- `cookie`: las sesiones se almacenan en cookies seguras y cifradas.
- `database`: las sesiones se almacenan en una base de datos relacional.
- `memcached` / `redis`: las sesiones se almacenan en uno de estos rápidos almacenes basados ​​en caché.
- `dynamodb`: las sesiones se almacenan en AWS DynamoDB.
- `array`: las sesiones se almacenan en una matriz PHP y no persistirán.

</div>

> **Nota:**
> El controlador de matriz se utiliza principalmente durante las [pruebas](../testing/) y evita que los datos almacenados en la sesión persistan.

<a id="driver-prerequisites"></a>
### Requisitos previos del controlador

<a id="database"></a>
#### Base de datos

Cuando utilice el controlador de sesión `database`, deberá asegurarse de tener una tabla de base de datos que contenga los datos de la sesión. Normalmente, esto se incluye en el `0001_01_01_000000_create_users_table.php` predeterminado de Laravel [migración de base de datos](../migrations/); sin embargo, si por algún motivo no tiene una tabla `sessions`, puede usar el comando `make:session-table` Artisan para generar esta migración:

```shell
php artisan make:session-table

php artisan migrate
```

<a id="redis"></a>
#### Redis

Antes de usar sesiones de Redis con Laravel, deberá instalar la extensión PHP PhpRedis a través de PECL o instalar el paquete `predis/predis` a través de Composer. Para obtener más información sobre la configuración de Redis, consulte la [documentación de Redis](../redis/#configuration).

> **Nota:**
> La variable de entorno `SESSION_CONNECTION` o la opción `connection` en el archivo de configuración `session.php` se pueden usar para especificar qué conexión de Redis se usa para el almacenamiento de sesiones.

<a id="interacting-with-the-session"></a>
## Interactuando con la sesión

<a id="retrieving-data"></a>
### Recuperando datos

Hay dos formas principales de trabajar con datos de sesión en Laravel: el asistente global `session` y mediante una instancia `Request`. Primero, veamos cómo acceder a la sesión a través de una instancia `Request`, que puede recibir sugerencias de tipo en un método de función anónima de ruta o de controlador. Recuerde, las dependencias del método del controlador se inyectan automáticamente a través de Laravel [contenedor de servicio](../container/):

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * Mostrar el perfil del usuario indicado.
     */
    public function show(Request $request, string $id): View
    {
        $value = $request->session()->get('key');

        // ...

        $user = $this->users->find($id);

        return view('user.profile', ['user' => $user]);
    }
}
```

Cuando recupera un elemento de la sesión, también puede pasar un valor predeterminado como segundo argumento al método `get`. Este valor predeterminado se devolverá si la clave especificada no existe en la sesión. Si pasa una función anónima como valor predeterminado al método `get` y la clave solicitada no existe, la función anónima se ejecutará y se devolverá su resultado:

```php
$value = $request->session()->get('key', 'default');

$value = $request->session()->get('key', function () {
    return 'default';
});
```

<a id="the-global-session-helper"></a>
#### El asistente de sesión global

También puede utilizar la función PHP global `session` para recuperar y almacenar datos en la sesión. Cuando se llama al asistente `session` con un único argumento de cadena, devolverá el valor de esa clave de sesión. Cuando se llama al asistente con una matriz de pares clave/valor, esos valores se almacenarán en la sesión:

```php
Route::get('/home', function () {
    // Recuperar un dato de la session...
    $value = session('key');

    // Specifying a default value...
    $value = session('key', 'default');

    // Almacenar un dato en la session...
    session(['key' => 'value']);
});
```

> **Nota:**
> Hay poca diferencia práctica entre usar la sesión a través de una instancia de solicitud HTTP y usar el asistente global `session`. Ambos métodos son [comprobables](../testing/) mediante el método `assertSessionHas` que está disponible en todos sus casos de prueba.

<a id="retrieving-all-session-data"></a>
#### Recuperando todos los datos de la sesión

Si desea recuperar todos los datos de la sesión, puede utilizar el método `all`:

```php
$data = $request->session()->all();
```

<a id="retrieving-a-portion-of-the-session-data"></a>
#### Recuperando una parte de los datos de la sesión

Los métodos `only` y `except` se pueden utilizar para recuperar un subconjunto de los datos de la sesión:

```php
$data = $request->session()->only(['username', 'email']);

$data = $request->session()->except(['username', 'email']);
```

<a id="determining-if-an-item-exists-in-the-session"></a>
#### Determinar si un elemento existe en la sesión

Para determinar si un elemento está presente en la sesión, puede utilizar el método `has`. El método `has` devuelve `true` si el elemento está presente y no es `null`:

```php
if ($request->session()->has('users')) {
    // ...
}
```

Para determinar si un elemento está presente en la sesión, incluso si su valor es `null`, puede utilizar el método `exists`:

```php
if ($request->session()->exists('users')) {
    // ...
}
```

Para determinar si un elemento no está presente en la sesión, puede utilizar el método `missing`. El método `missing` devuelve `true` si el elemento no está presente:

```php
if ($request->session()->missing('users')) {
    // ...
}
```

<a id="storing-data"></a>
### Almacenamiento de datos

Para almacenar datos en la sesión, normalmente utilizará el método `put` de la instancia de solicitud o el asistente global `session`:

```php
// Mediante una instancia de request...
$request->session()->put('key', 'value');

// Mediante el helper global "session"...
session(['key' => 'value']);
```

<a id="pushing-to-array-session-values"></a>
#### Añadir elementos a valores de sesión de tipo array

El método `push` se puede utilizar para insertar un nuevo valor en un valor de sesión que es una matriz. Por ejemplo, si la clave `user.teams` contiene una matriz de nombres de equipos, puede insertar un nuevo valor en la matriz de la siguiente manera:

```php
$request->session()->push('user.teams', 'developers');
```

<a id="retrieving-deleting-an-item"></a>
#### Recuperar y eliminar un elemento

El método `pull` recuperará y eliminará un elemento de la sesión en una sola declaración:

```php
$value = $request->session()->pull('key', 'default');
```

<a id="incrementing-and-decrementing-session-values"></a>
#### Incrementar y disminuir los valores de sesión

Si los datos de su sesión contienen un número entero que desea incrementar o disminuir, puede utilizar los métodos `increment` y `decrement`:

```php
$request->session()->increment('count');

$request->session()->increment('count', $incrementBy = 2);

$request->session()->decrement('count');

$request->session()->decrement('count', $decrementBy = 2);
```

<a id="flash-data"></a>
### Datos flash

A veces es posible que desee almacenar elementos en la sesión para la siguiente solicitud. Puede hacerlo utilizando el método `flash`. Los datos almacenados en la sesión utilizando este método estarán disponibles inmediatamente y durante la solicitud HTTP posterior. Después de la solicitud HTTP posterior, los datos actualizados se eliminarán. Los datos flash son útiles principalmente para mensajes de estado de corta duración:

```php
$request->session()->flash('status', 'Task was successful!');
```

Si necesita conservar sus datos flash para varias solicitudes, puede utilizar el método `reflash`, que conservará todos los datos flash para una solicitud adicional. Si solo necesita conservar datos flash específicos, puede utilizar el método `keep`:

```php
$request->session()->reflash();

$request->session()->keep(['username', 'email']);
```

Para conservar sus datos flash solo para la solicitud actual, puede utilizar el método `now`:

```php
$request->session()->now('status', 'Task was successful!');
```

<a id="deleting-data"></a>
### Eliminación de datos

El método `forget` eliminará un dato de la sesión. Si desea eliminar todos los datos de la sesión, puede utilizar el método `flush`:

```php
// Olvidar una sola clave...
$request->session()->forget('name');

// Olvidar varias claves...
$request->session()->forget(['name', 'status']);

$request->session()->flush();
```

<a id="regenerating-the-session-id"></a>
### Regenerando el ID de sesión

La regeneración del ID de sesión a menudo se realiza para evitar que usuarios malintencionados aprovechen un ataque [session fixation](https://owasp.org/www-community/attacks/Session_fixation) en su aplicación.

Laravel regenera automáticamente el ID de sesión durante la autenticación si está utilizando uno de los Laravel [kits de inicio de aplicaciones](../starter-kits/) o [Laravel Fortify](../fortify/); sin embargo, si necesita regenerar manualmente el ID de sesión, puede utilizar el método `regenerate`:

```php
$request->session()->regenerate();
```

Si necesita regenerar el ID de sesión y eliminar todos los datos de la sesión en una sola declaración, puede utilizar el método `invalidate`:

```php
$request->session()->invalidate();
```

<a id="session-cache"></a>
## Caché de sesión

El caché de sesión de Laravel proporciona una manera conveniente de almacenar en caché datos que se limitan a una sesión de usuario individual. A diferencia del caché de aplicación global, los datos del caché de sesión se aíslan automáticamente por sesión y se limpian cuando la sesión caduca o se destruye. El caché de sesión admite todos los [métodos familiares de caché de Laravel](../cache/) como `get`, `put`, `remember`, `forget` y más, pero con alcance para la sesión actual.

La caché de sesión es perfecta para almacenar datos temporales específicos del usuario que desea conservar en múltiples solicitudes dentro de la misma sesión, pero que no necesita almacenar de forma permanente. Esto incluye cosas como datos de formularios, cálculos temporales, respuestas API o cualquier otro dato efímero que deba vincularse a la sesión de un usuario específico.

Puede acceder al caché de la sesión a través del método `cache` en la sesión:

```php
$discount = $request->session()->cache()->get('discount');

$request->session()->cache()->put(
    'discount', 10, now()->plus(minutes: 5)
);
```

Para obtener más información sobre los métodos de caché de Laravel, consulte la [documentación de caché](../cache/).

<a id="session-blocking"></a>
## Bloqueo de sesión

> **Advertencia:**
> Para utilizar el bloqueo de sesión, su aplicación debe utilizar un controlador de caché que admita [bloqueos atómicos](../cache/#atomic-locks). Actualmente, esos controladores de caché incluyen los controladores `memcached`, `dynamodb`, `redis`, `mongodb` (incluidos en el paquete oficial `mongodb/laravel-mongodb`), `database`, `file` y `array`. Además, no puede utilizar el controlador de sesión `cookie`.

De forma predeterminada, Laravel permite que las solicitudes que utilizan la misma sesión se ejecuten simultáneamente. Entonces, por ejemplo, si usa una biblioteca HTTP de JavaScript para realizar dos solicitudes HTTP a su aplicación, ambas se ejecutarán al mismo tiempo. Para muchas aplicaciones, esto no es un problema; sin embargo, la pérdida de datos de la sesión puede ocurrir en un pequeño subconjunto de aplicaciones que realizan solicitudes simultáneas a dos puntos finales de aplicaciones diferentes y ambos escriben datos en la sesión.

Para mitigar esto, Laravel proporciona una funcionalidad que le permite limitar las solicitudes simultáneas para una sesión determinada. Para comenzar, simplemente puede encadenar el método `block` en su definición de ruta. En este ejemplo, una solicitud entrante al punto final `/profile` adquiriría un bloqueo de sesión. Mientras se mantiene este bloqueo, cualquier solicitud entrante a los puntos finales `/profile` o `/order` que compartan el mismo ID de sesión esperará a que la primera solicitud termine de ejecutarse antes de continuar con su ejecución:

```php
Route::post('/profile', function () {
    // ...
})->block($lockSeconds = 10, $waitSeconds = 10);

Route::post('/order', function () {
    // ...
})->block($lockSeconds = 10, $waitSeconds = 10);
```

El método `block` acepta dos argumentos opcionales. El primer argumento aceptado por el método `block` es el número máximo de segundos que se debe mantener el bloqueo de la sesión antes de liberarlo. Por supuesto, si la solicitud termina de ejecutarse antes de este tiempo, el bloqueo se liberará antes.

El segundo argumento aceptado por el método `block` es el número de segundos que debe esperar una solicitud mientras intenta obtener un bloqueo de sesión. Se generará un `Illuminate\Contracts\Cache\LockTimeoutException` si la solicitud no puede obtener un bloqueo de sesión dentro del número de segundos indicado.

Si no se pasa ninguno de estos argumentos, el bloqueo se obtendrá durante un máximo de 10 segundos y las solicitudes esperarán un máximo de 10 segundos mientras intentan obtener un bloqueo:

```php
Route::post('/profile', function () {
    // ...
})->block();
```

<a id="adding-custom-session-drivers"></a>
## Agregar controladores de sesión personalizados

<a id="implementing-the-driver"></a>
### Implementación del controlador

Si ninguno de los controladores de sesión existentes se ajusta a las necesidades de su aplicación, Laravel permite escribir su propio controlador de sesión. Su controlador de sesión personalizado debe implementar el `SessionHandlerInterface` integrado de PHP. Esta interfaz contiene sólo algunos métodos simples. Una implementación de MongoDB fragmentada se parece a la siguiente:

```php
<?php

namespace App\Extensions;

class MongoSessionHandler implements \SessionHandlerInterface
{
    public function open($savePath, $sessionName) {}
    public function close() {}
    public function read($sessionId) {}
    public function write($sessionId, $data) {}
    public function destroy($sessionId) {}
    public function gc($lifetime) {}
}
```

Dado que Laravel no incluye un directorio predeterminado para albergar sus extensiones. Eres libre de colocarlos donde quieras. En este ejemplo, hemos creado un directorio `Extensions` para albergar el `MongoSessionHandler`.

Dado que el propósito de estos métodos no es fácilmente comprensible, a continuación se ofrece una descripción general del propósito de cada método:

<div class="content-list" markdown="1">

- El método `open` normalmente se usaría en sistemas de almacenamiento de sesiones basados ​​en archivos. Dado que Laravel viene con un controlador de sesión `file`, rara vez necesitarás poner algo en este método. Simplemente puedes dejar este método vacío.
- El método `close`, al igual que el método `open`, normalmente también puede descartarse. Para la mayoría de los conductores, no es necesario.
- El método `read` debe devolver la versión de cadena de los datos de la sesión asociados con el `$sessionId` dado. No es necesario realizar ninguna serialización ni otra codificación al recuperar o almacenar datos de sesión en su controlador, ya que Laravel realizará la serialización por usted.
- El método `write` debe escribir la cadena `$data` asociada con `$sessionId` en algún sistema de almacenamiento persistente, como MongoDB u otro sistema de almacenamiento de su elección. Nuevamente, no debes realizar ninguna serialización; Laravel ya lo habrá manejado por ti.
- El método `destroy` debería eliminar los datos asociados con `$sessionId` del almacenamiento persistente.
- El método `gc` debería destruir todos los datos de la sesión que sean anteriores al `$lifetime` dado, que es una cantidad de segundos. Para sistemas con caducidad automática como Memcached y Redis, este método puede dejarse vacío.

</div>

<a id="registering-the-driver"></a>
### Registro del conductor

Una vez que se haya implementado su controlador, estará listo para registrarlo en Laravel. Para agregar controladores adicionales al backend de sesión de Laravel, puede usar el método `extend` proporcionado por `Session` [facade](../facades/). Debe llamar al método `extend` desde el método `boot` de un [proveedor de servicios](../providers/). Puede hacer esto desde el `App\Providers\AppServiceProvider` existente o crear un proveedor completamente nuevo:

```php
<?php

namespace App\Providers;

use App\Extensions\MongoSessionHandler;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\ServiceProvider;

class SessionServiceProvider extends ServiceProvider
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
        Session::extend('mongo', function (Application $app) {
            // Devolver una implementación de SessionHandlerInterface...
            return new MongoSessionHandler;
        });
    }
}
```

Una vez que se haya registrado el controlador de sesión, puede especificar el controlador `mongo` como el controlador de sesión de su aplicación utilizando la variable de entorno `SESSION_DRIVER` o dentro del archivo de configuración `config/session.php` de la aplicación.
