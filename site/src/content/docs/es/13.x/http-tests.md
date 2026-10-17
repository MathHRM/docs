---
title: "Pruebas HTTP"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Haciendo solicitudes](#making-requests)
    - [Personalizar encabezados de solicitud](#customizing-request-headers)
    - [Galletas](#cookies)
    - [Sesión/Autenticación](#session-and-authentication)
    - [Respuestas de depuración](#debugging-responses)
    - [Manejo de excepciones](#exception-handling)
- [Prueba de API JSON](#testing-json-apis)
    - [Pruebas JSON fluidas](#fluent-json-testing)
- [Cargas de archivos de prueba](#testing-file-uploads)
- [Vistas de prueba](#testing-views)
    - [Renderizado de Blade y componentes](#rendering-blade-and-components)
- [Rutas de almacenamiento en caché](#caching-routes)
- [Aseveraciones disponibles](#available-assertions)
    - [Aseveraciones de respuesta](#response-assertions)
    - [Aseveraciones de autenticación](#authentication-assertions)
    - [Afirmaciones de Validación](#validation-assertions)

<a id="introduction"></a>
## Introducción

Laravel proporciona una API muy fluida para realizar solicitudes HTTP a su aplicación y examinar las respuestas. Por ejemplo, eche un vistazo a la prueba de funciones que se define a continuación:

```php tab=Pest
<?php

test('the application returns a successful response', function () {
    $response = $this->get('/');

    $response->assertStatus(200);
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }
}
```

El método `get` realiza una solicitud `GET` en la aplicación, mientras que el método `assertStatus` afirma que la respuesta devuelta debe tener el código de estado HTTP proporcionado. Además de esta simple afirmación, Laravel también contiene una variedad de afirmaciones para inspeccionar los encabezados de respuesta, el contenido, la estructura JSON y más.

<a id="making-requests"></a>
## Realizar solicitudes

Para realizar una solicitud a su aplicación, puede invocar los métodos `get`, `post`, `put`, `patch` o `delete` dentro de su prueba. En realidad, estos métodos no emiten una solicitud HTTP "real" a su aplicación. En cambio, toda la solicitud de red se simula internamente.

En lugar de devolver una instancia de `Illuminate\Http\Response`, los métodos de solicitud de prueba devuelven una instancia de `Illuminate\Testing\TestResponse`, que proporciona una [variedad de afirmaciones útiles](#available-assertions) que le permiten inspeccionar las respuestas de su aplicación:

```php tab=Pest
<?php

test('basic request', function () {
    $response = $this->get('/');

    $response->assertStatus(200);
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_a_basic_request(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }
}
```

En general, cada una de sus pruebas solo debe realizar una solicitud a su aplicación. Puede producirse un comportamiento inesperado si se ejecutan varias solicitudes dentro de un único método de prueba.

> **Nota:**
> Para mayor comodidad, el middleware CSRF se desactiva automáticamente al ejecutar pruebas.

<a id="customizing-request-headers"></a>
### Personalización de encabezados de solicitud

Puede utilizar el método `withHeaders` para personalizar los encabezados de la solicitud antes de enviarla a la aplicación. Este método le permite agregar cualquier encabezado personalizado que desee a la solicitud:

```php tab=Pest
<?php

test('interacting with headers', function () {
    $response = $this->withHeaders([
        'X-Header' => 'Value',
    ])->post('/user', ['name' => 'Sally']);

    $response->assertStatus(201);
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic functional test example.
     */
    public function test_interacting_with_headers(): void
    {
        $response = $this->withHeaders([
            'X-Header' => 'Value',
        ])->post('/user', ['name' => 'Sally']);

        $response->assertStatus(201);
    }
}
```

<a id="cookies"></a>
### Galletas

Puede utilizar los métodos `withCookie` o `withCookies` para establecer valores de cookies antes de realizar una solicitud. El método `withCookie` acepta un nombre de cookie y un valor como sus dos argumentos, mientras que el método `withCookies` acepta una matriz de pares de nombre/valor:

```php tab=Pest
<?php

test('interacting with cookies', function () {
    $response = $this->withCookie('color', 'blue')->get('/');

    $response = $this->withCookies([
        'color' => 'blue',
        'name' => 'Taylor',
    ])->get('/');

    //
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_interacting_with_cookies(): void
    {
        $response = $this->withCookie('color', 'blue')->get('/');

        $response = $this->withCookies([
            'color' => 'blue',
            'name' => 'Taylor',
        ])->get('/');

        //
    }
}
```

<a id="session-and-authentication"></a>
### Sesión/Autenticación

Laravel proporciona varios ayudantes para interactuar con la sesión durante las pruebas HTTP. Primero, puede configurar los datos de la sesión en una matriz determinada utilizando el método `withSession`. Esto es útil para cargar la sesión con datos antes de emitir una solicitud a su aplicación:

```php tab=Pest
<?php

test('interacting with the session', function () {
    $response = $this->withSession(['banned' => false])->get('/');

    //
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_interacting_with_the_session(): void
    {
        $response = $this->withSession(['banned' => false])->get('/');

        //
    }
}
```

La sesión de Laravel se utiliza normalmente para mantener el estado del usuario actualmente autenticado. Por lo tanto, el método auxiliar `actingAs` proporciona una forma sencilla de autenticar a un usuario determinado como el usuario actual. Por ejemplo, podemos usar un [modelo factory](../eloquent-factories/) para generar y autenticar un usuario:

```php tab=Pest
<?php

use App\Models\User;

test('an action that requires authentication', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->withSession(['banned' => false])
        ->get('/');

    //
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_an_action_that_requires_authentication(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->withSession(['banned' => false])
            ->get('/');

        //
    }
}
```

También puede especificar qué guardia debe usarse para autenticar al usuario determinado pasando el nombre del guardia como segundo argumento del método `actingAs`. La protección proporcionada al método `actingAs` también se convertirá en la protección predeterminada durante la prueba:

```php
$this->actingAs($user, 'web');
```

Si desea asegurarse de que la solicitud no esté autenticada, puede utilizar el método `actingAsGuest`:

```php
$this->actingAsGuest();
```

<a id="debugging-responses"></a>
### Respuestas de depuración

Después de realizar una solicitud de prueba para su aplicación, se pueden usar los métodos `dump`, `dumpHeaders` y `dumpSession` para examinar y depurar el contenido de la respuesta:

```php tab=Pest
<?php

test('basic test', function () {
    $response = $this->get('/');

    $response->dump();
    $response->dumpHeaders();
    $response->dumpSession();
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_basic_test(): void
    {
        $response = $this->get('/');

        $response->dump();
        $response->dumpHeaders();
        $response->dumpSession();
    }
}
```

Como alternativa, puede utilizar los métodos `dd`, `ddHeaders`, `ddBody`, `ddJson` y `ddSession` para volcar información sobre la respuesta y luego detener la ejecución:

```php tab=Pest
<?php

test('basic test', function () {
    $response = $this->get('/');

    $response->dd();
    $response->ddHeaders();
    $response->ddBody();
    $response->ddJson();
    $response->ddSession();
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_basic_test(): void
    {
        $response = $this->get('/');

        $response->dd();
        $response->ddHeaders();
        $response->ddBody();
        $response->ddJson();
        $response->ddSession();
    }
}
```

<a id="exception-handling"></a>
### Manejo de excepciones

A veces es posible que necesites probar que tu aplicación esté generando una excepción específica. Para lograr esto, puede "falsificar" el controlador de excepciones a través de la fachada `Exceptions`. Una vez que se ha falsificado el controlador de excepciones, puede utilizar los métodos `assertReported` y `assertNotReported` para realizar afirmaciones contra las excepciones que se generaron durante la solicitud:

```php tab=Pest
<?php

use App\Exceptions\InvalidOrderException;
use Illuminate\Support\Facades\Exceptions;

test('exception is thrown', function () {
    Exceptions::fake();

    $response = $this->get('/order/1');

    // Assert an exception was thrown...
    Exceptions::assertReported(InvalidOrderException::class);

    // Assert against the exception...
    Exceptions::assertReported(function (InvalidOrderException $e) {
        return $e->getMessage() === 'The order was invalid.';
    });
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use App\Exceptions\InvalidOrderException;
use Illuminate\Support\Facades\Exceptions;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_exception_is_thrown(): void
    {
        Exceptions::fake();

        $response = $this->get('/');

        // Assert an exception was thrown...
        Exceptions::assertReported(InvalidOrderException::class);

        // Assert against the exception...
        Exceptions::assertReported(function (InvalidOrderException $e) {
            return $e->getMessage() === 'The order was invalid.';
        });
    }
}
```

Los métodos `assertNotReported` y `assertNothingReported` se pueden usar para afirmar que no se lanzó una excepción determinada durante la solicitud o que no se lanzó ninguna excepción:

```php
Exceptions::assertNotReported(InvalidOrderException::class);

Exceptions::assertNothingReported();
```

Puede deshabilitar totalmente el manejo de excepciones para una solicitud determinada invocando el método `withoutExceptionHandling` antes de realizar su solicitud:

```php
$response = $this->withoutExceptionHandling()->get('/');
```

Además, si desea asegurarse de que su aplicación no utilice funciones que han quedado obsoletas por el lenguaje PHP o las bibliotecas que utiliza su aplicación, puede invocar el método `withoutDeprecationHandling` antes de realizar su solicitud. Cuando el manejo de obsolescencia está deshabilitado, las advertencias de obsolescencia se convertirán en excepciones, lo que provocará que la prueba falle:

```php
$response = $this->withoutDeprecationHandling()->get('/');
```

El método `assertThrows` se puede utilizar para afirmar que el código dentro de una función anónima determinada genera una excepción del tipo especificado:

```php
$this->assertThrows(
    fn () => (new ProcessOrder)->execute(),
    OrderInvalid::class
);
```

Si desea inspeccionar y hacer afirmaciones contra la excepción que se genera, puede proporcionar una función anónima como segundo argumento del método `assertThrows`:

```php
$this->assertThrows(
    fn () => (new ProcessOrder)->execute(),
    fn (OrderInvalid $e) => $e->orderId() === 123
);
```

El método `assertDoesntThrow` se puede utilizar para afirmar que el código dentro de una función anónima determinada no genera ninguna excepción:

```php
$this->assertDoesntThrow(fn () => (new ProcessOrder)->execute());
```

<a id="testing-json-apis"></a>
## Prueba de API JSON

Laravel también proporciona varios ayudantes para probar las API JSON y sus respuestas. Por ejemplo, los métodos `json`, `getJson`, `postJson`, `putJson`, `patchJson`, `deleteJson` y `optionsJson` se pueden utilizar para emitir solicitudes JSON con varios verbos HTTP. También puedes pasar fácilmente datos y encabezados a estos métodos. Para comenzar, escribamos una prueba para realizar una solicitud `POST` a `/api/user` y afirmar que se devolvieron los datos JSON esperados:

```php tab=Pest
<?php

test('making an api request', function () {
    $response = $this->postJson('/api/user', ['name' => 'Sally']);

    $response
        ->assertStatus(201)
        ->assertJson([
            'created' => true,
        ]);
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic functional test example.
     */
    public function test_making_an_api_request(): void
    {
        $response = $this->postJson('/api/user', ['name' => 'Sally']);

        $response
            ->assertStatus(201)
            ->assertJson([
                'created' => true,
            ]);
    }
}
```

Además, se puede acceder a los datos de respuesta JSON como variables de matriz en la respuesta, lo que le resulta conveniente inspeccionar los valores individuales devueltos dentro de una respuesta JSON:

```php tab=Pest
expect($response['created'])->toBeTrue();
```

```php tab=PHPUnit
$this->assertTrue($response['created']);
```

> **Nota:**
> El método `assertJson` convierte la respuesta en una matriz para verificar que la matriz dada existe dentro de la respuesta JSON devuelta por la aplicación. Entonces, si hay otras propiedades en la respuesta JSON, esta prueba pasará siempre que el fragmento dado esté presente.

<a id="verifying-exact-match"></a>
#### Confirmación de coincidencias JSON exactas

Como se mencionó anteriormente, el método `assertJson` se puede utilizar para afirmar que existe un fragmento de JSON dentro de la respuesta JSON. Si desea verificar que una matriz determinada **coincide exactamente** con el JSON devuelto por su aplicación, debe utilizar el método `assertExactJson`:

```php tab=Pest
<?php

test('asserting an exact json match', function () {
    $response = $this->postJson('/user', ['name' => 'Sally']);

    $response
        ->assertStatus(201)
        ->assertExactJson([
            'created' => true,
        ]);
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic functional test example.
     */
    public function test_asserting_an_exact_json_match(): void
    {
        $response = $this->postJson('/user', ['name' => 'Sally']);

        $response
            ->assertStatus(201)
            ->assertExactJson([
                'created' => true,
            ]);
    }
}
```

<a id="verifying-json-paths"></a>
#### Afirmación en rutas JSON

Si desea verificar que la respuesta JSON contiene los datos proporcionados en una ruta especificada, debe utilizar el método `assertJsonPath`:

```php tab=Pest
<?php

test('asserting a json path value', function () {
    $response = $this->postJson('/user', ['name' => 'Sally']);

    $response
        ->assertStatus(201)
        ->assertJsonPath('team.owner.name', 'Darian');
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic functional test example.
     */
    public function test_asserting_a_json_paths_value(): void
    {
        $response = $this->postJson('/user', ['name' => 'Sally']);

        $response
            ->assertStatus(201)
            ->assertJsonPath('team.owner.name', 'Darian');
    }
}
```

El método `assertJsonPath` también acepta una función anónima, que puede usarse para determinar dinámicamente si la afirmación debe pasar:

```php
$response->assertJsonPath('team.owner.name', fn (string $name) => strlen($name) >= 3);
```

Si necesita afirmar varias rutas JSON a la vez, puede utilizar el método `assertJsonPaths`. El valor esperado para cada camino también puede ser una función anónima:

```php
$response->assertJsonPaths([
    'team.owner.name' => 'Darian',
    'team.owner.email' => fn (string $email) => str($email)->is('*@laravel.com'),
    'team.members.0.name' => 'Sally',
]);
```

Puede utilizar el método `assertJsonMissingPaths` para afirmar que faltan varias rutas JSON en la respuesta:

```php
$response->assertJsonMissingPaths([
    'team.owner.password',
    'team.members.0.api_token',
]);
```

<a id="fluent-json-testing"></a>
### Pruebas JSON fluidas

Laravel también ofrece una hermosa manera de probar con fluidez las respuestas JSON de su aplicación. Para comenzar, pase una función anónima al método `assertJson`. esta función anónima se invocará con una instancia de `Illuminate\Testing\Fluent\AssertableJson` que se puede utilizar para realizar afirmaciones contra el JSON que devolvió su aplicación. El método `where` se puede usar para hacer afirmaciones sobre un atributo particular del JSON, mientras que el método `missing` se puede usar para afirmar que falta un atributo particular en el JSON:

```php tab=Pest
use Illuminate\Testing\Fluent\AssertableJson;

test('fluent json', function () {
    $response = $this->getJson('/users/1');

    $response
        ->assertJson(fn (AssertableJson $json) =>
            $json->where('id', 1)
                ->where('name', 'Victoria Faith')
                ->where('email', fn (string $email) => str($email)->is('victoria@gmail.com'))
                ->whereNot('status', 'pending')
                ->missing('password')
                ->etc()
        );
});
```

```php tab=PHPUnit
use Illuminate\Testing\Fluent\AssertableJson;

/**
 * A basic functional test example.
 */
public function test_fluent_json(): void
{
    $response = $this->getJson('/users/1');

    $response
        ->assertJson(fn (AssertableJson $json) =>
            $json->where('id', 1)
                ->where('name', 'Victoria Faith')
                ->where('email', fn (string $email) => str($email)->is('victoria@gmail.com'))
                ->whereNot('status', 'pending')
                ->missing('password')
                ->etc()
        );
}
```

#### Comprender el método `etc`

En el ejemplo anterior, habrás notado que invocamos el método `etc` al final de nuestra cadena de aserciones. Este método informa a Laravel que puede haber otros atributos presentes en el objeto JSON. Si no se utiliza el método `etc`, la prueba fallará si existen otros atributos contra los que no realizó afirmaciones en el objeto JSON.

La intención detrás de este comportamiento es protegerlo de exponer involuntariamente información confidencial en sus respuestas JSON al obligarlo a hacer una afirmación explícita sobre el atributo o permitir explícitamente atributos adicionales a través del método `etc`.

Sin embargo, debe tener en cuenta que no incluir el método `etc` en su cadena de aserciones no garantiza que no se agreguen atributos adicionales a las matrices anidadas dentro de su objeto JSON. El método `etc` solo garantiza que no existan atributos adicionales en el nivel de anidamiento en el que se invoca el método `etc`.

<a id="asserting-json-attribute-presence-and-absence"></a>
#### Afirmar presencia / ausencia del atributo

Para afirmar que un atributo está presente o ausente, puede utilizar los métodos `has` y `missing`:

```php
$response->assertJson(fn (AssertableJson $json) =>
    $json->has('data')
        ->missing('message')
);
```

Además, los métodos `hasAll` y `missingAll` permiten afirmar la presencia o ausencia de múltiples atributos simultáneamente:

```php
$response->assertJson(fn (AssertableJson $json) =>
    $json->hasAll(['status', 'data'])
        ->missingAll(['message', 'code'])
);
```

Puede utilizar el método `hasAny` para determinar si al menos uno de una lista determinada de atributos está presente:

```php
$response->assertJson(fn (AssertableJson $json) =>
    $json->has('status')
        ->hasAny('data', 'message', 'code')
);
```

<a id="asserting-against-json-collections"></a>
#### Afirmación contra colecciones JSON

A menudo, su ruta devolverá una respuesta JSON que contiene varios elementos, como varios usuarios:

```php
Route::get('/users', function () {
    return User::all();
});
```

En estas situaciones, podemos utilizar el método `has` del objeto JSON fluido para hacer afirmaciones contra los usuarios incluidos en la respuesta. Por ejemplo, supongamos que la respuesta JSON contiene tres usuarios. A continuación, haremos algunas afirmaciones sobre el primer usuario de la colección utilizando el método `first`. El método `first` acepta una función anónima que recibe otra cadena JSON afirmable que podemos usar para hacer afirmaciones sobre el primer objeto de la colección JSON:

```php
$response
    ->assertJson(fn (AssertableJson $json) =>
        $json->has(3)
            ->first(fn (AssertableJson $json) =>
                $json->where('id', 1)
                    ->where('name', 'Victoria Faith')
                    ->where('email', fn (string $email) => str($email)->is('victoria@gmail.com'))
                    ->missing('password')
                    ->etc()
            )
    );
```

Si desea hacer las mismas afirmaciones sobre todos los elementos de una colección JSON, puede utilizar el método `each`:

```php
$response
  ->assertJson(fn (AssertableJson $json) =>
      $json->has(3)
          ->each(fn (AssertableJson $json) =>
              $json->whereType('id', 'integer')
                  ->whereType('name', 'string')
                  ->whereType('email', 'string')
                  ->missing('password')
                  ->etc()
          )
  );
```

<a id="scoping-json-collection-assertions"></a>
#### Determinación del alcance de las afirmaciones de la colección JSON

A veces, las rutas de su aplicación devolverán colecciones JSON a las que se les asignan claves con nombre:

```php
Route::get('/users', function () {
    return [
        'meta' => [...],
        'users' => User::all(),
    ];
});
```

Al probar estas rutas, puede utilizar el método `has` para hacer valer la cantidad de elementos de la colección. Además, puede utilizar el método `has` para determinar el alcance de una cadena de aserciones:

```php
$response
    ->assertJson(fn (AssertableJson $json) =>
        $json->has('meta')
            ->has('users', 3)
            ->has('users.0', fn (AssertableJson $json) =>
                $json->where('id', 1)
                    ->where('name', 'Victoria Faith')
                    ->where('email', fn (string $email) => str($email)->is('victoria@gmail.com'))
                    ->missing('password')
                    ->etc()
            )
    );
```

Sin embargo, en lugar de realizar dos llamadas separadas al método `has` para hacer valer la colección `users`, puede realizar una única llamada que proporcione una función anónima como tercer parámetro. Al hacerlo, la función anónima se invocará automáticamente y su alcance será el primer elemento de la colección:

```php
$response
    ->assertJson(fn (AssertableJson $json) =>
        $json->has('meta')
            ->has('users', 3, fn (AssertableJson $json) =>
                $json->where('id', 1)
                    ->where('name', 'Victoria Faith')
                    ->where('email', fn (string $email) => str($email)->is('victoria@gmail.com'))
                    ->missing('password')
                    ->etc()
            )
    );
```

<a id="asserting-json-types"></a>
#### Afirmar tipos JSON

Es posible que solo desee afirmar que las propiedades de la respuesta JSON son de un tipo determinado. La clase `Illuminate\Testing\Fluent\AssertableJson` proporciona los métodos `whereType` y `whereAllType` para hacer precisamente eso:

```php
$response->assertJson(fn (AssertableJson $json) =>
    $json->whereType('id', 'integer')
        ->whereAllType([
            'users.0.name' => 'string',
            'meta' => 'array'
        ])
);
```

Puede especificar varios tipos utilizando el carácter `|` o pasando una matriz de tipos como segundo parámetro al método `whereType`. La afirmación será exitosa si el valor de respuesta es cualquiera de los tipos enumerados:

```php
$response->assertJson(fn (AssertableJson $json) =>
    $json->whereType('name', 'string|null')
        ->whereType('id', ['string', 'integer'])
);
```

Los métodos `whereType` y `whereAllType` reconocen los siguientes tipos: `string`, `integer`, `double`, `boolean`, `array` y `null`.

<a id="testing-file-uploads"></a>
## Cargas de archivos de prueba

La clase `Illuminate\Http\UploadedFile` proporciona un método `fake` que puede usarse para generar archivos o imágenes ficticias para realizar pruebas. Esto, combinado con el método `fake` de la fachada `Storage`, simplifica enormemente las pruebas de carga de archivos. Por ejemplo, puedes combinar estas dos funciones para probar fácilmente un formulario de carga de avatar:

```php tab=Pest
<?php

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('avatars can be uploaded', function () {
    Storage::fake('avatars');

    $file = UploadedFile::fake()->image('avatar.jpg');

    $response = $this->post('/avatar', [
        'avatar' => $file,
    ]);

    Storage::disk('avatars')->assertExists($file->hashName());
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_avatars_can_be_uploaded(): void
    {
        Storage::fake('avatars');

        $file = UploadedFile::fake()->image('avatar.jpg');

        $response = $this->post('/avatar', [
            'avatar' => $file,
        ]);

        Storage::disk('avatars')->assertExists($file->hashName());
    }
}
```

Si desea afirmar que un archivo determinado no existe, puede utilizar el método `assertMissing` proporcionado por la fachada `Storage`:

```php
Storage::fake('avatars');

// ...

Storage::disk('avatars')->assertMissing('missing.jpg');
```

<a id="fake-file-customization"></a>
#### Personalización de archivos falsos

Al crear archivos utilizando el método `fake` proporcionado por la clase `UploadedFile`, puede especificar el ancho, alto y tamaño de la imagen (en kilobytes) para probar mejor las reglas de validación de su aplicación:

```php
UploadedFile::fake()->image('avatar.jpg', $width, $height)->size(100);
```

Además de crear imágenes, puedes crear archivos de cualquier otro tipo utilizando el método `create`:

```php
UploadedFile::fake()->create('document.pdf', $sizeInKilobytes);
```

Si es necesario, puede pasar un argumento `$mimeType` al método para definir explícitamente el tipo MIME que debe devolver el archivo:

```php
UploadedFile::fake()->create(
    'document.pdf', $sizeInKilobytes, 'application/pdf'
);
```

<a id="testing-views"></a>
## Vistas de prueba

Laravel también le permite representar una vista sin realizar una solicitud HTTP simulada a la aplicación. Para lograr esto, puede llamar al método `view` dentro de su prueba. El método `view` acepta el nombre de la vista y una matriz de datos opcional. El método devuelve una instancia de `Illuminate\Testing\TestView`, que ofrece varios métodos para realizar afirmaciones cómodamente sobre el contenido de la vista:

```php tab=Pest
<?php

test('a welcome view can be rendered', function () {
    $view = $this->view('welcome', ['name' => 'Taylor']);

    $view->assertSee('Taylor');
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_a_welcome_view_can_be_rendered(): void
    {
        $view = $this->view('welcome', ['name' => 'Taylor']);

        $view->assertSee('Taylor');
    }
}
```

La clase `TestView` proporciona los siguientes métodos de aserción: `assertSee`, `assertSeeInOrder`, `assertSeeText`, `assertSeeTextInOrder`, `assertDontSee` y `assertDontSeeText`.

Si es necesario, puede obtener el contenido de la vista renderizada sin formato al convertir la instancia `TestView` en una cadena:

```php
$contents = (string) $this->view('welcome');
```

<a id="sharing-errors"></a>
#### Errores al compartir

Algunas vistas pueden depender de errores compartidos en la [bolsa de errores global proporcionada por Laravel](../validation/#quick-displaying-the-validation-errors). Para hidratar la bolsa de errores con mensajes de error, puede utilizar el método `withViewErrors`:

```php
$view = $this->withViewErrors([
    'name' => ['Please provide a valid name.']
])->view('form');

$view->assertSee('Please provide a valid name.');
```

<a id="rendering-blade-and-components"></a>
### Renderizado de cuchillas y componentes

Si es necesario, puede utilizar el método `blade` para evaluar y representar una cadena [Blade](../blade/)] sin formato. Al igual que el método `view`, el método `blade` devuelve una instancia de `Illuminate\Testing\TestView`:

```php
$view = $this->blade(
    '<x-component :name="$name" />',
    ['name' => 'Taylor']
);

$view->assertSee('Taylor');
```

Puede utilizar el método `component` para evaluar y renderizar un [Componente Blade](../blade/#components). El método `component` devuelve una instancia de `Illuminate\Testing\TestComponent`:

```php
$view = $this->component(Profile::class, ['name' => 'Taylor']);

$view->assertSee('Taylor');
```

<a id="caching-routes"></a>
## Rutas de almacenamiento en caché

Antes de ejecutar una prueba, Laravel inicia una instancia nueva de la aplicación, incluida la recopilación de todas las rutas definidas. Si sus aplicaciones tienen muchos archivos de ruta, es posible que desee agregar el rasgo `Illuminate\Foundation\Testing\WithCachedRoutes` a sus casos de prueba. En las pruebas que utilizan este rasgo, las rutas se crean una vez y se almacenan en la memoria, lo que significa que el proceso de recopilación de rutas solo se ejecuta una vez para todas las pruebas de su suite:

```php tab=Pest
<?php

use App\Http\Controllers\UserController;
use Illuminate\Foundation\Testing\WithCachedRoutes;

pest()->use(WithCachedRoutes::class);

test('basic example', function () {
    $this->get(action([UserController::class, 'index']));

    // ...
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use App\Http\Controllers\UserController;
use Illuminate\Foundation\Testing\WithCachedRoutes;
use Tests\TestCase;

class BasicTest extends TestCase
{
    use WithCachedRoutes;

    /**
     * A basic functional test example.
     */
    public function test_basic_example(): void
    {
        $response = $this->get(action([UserController::class, 'index']));

        // ...
    }
}
```

<a id="available-assertions"></a>
## Afirmaciones disponibles

<a id="response-assertions"></a>
### Afirmaciones de respuesta

La clase `Illuminate\Testing\TestResponse` de Laravel proporciona una variedad de métodos de aserción personalizados que puede utilizar al probar su aplicación. Se puede acceder a estas aserciones en la respuesta devuelta por los métodos de prueba `json`, `get`, `post`, `put` y `delete`:

<style>
    .collection-method-list > p {
        columns: 14.4em 2; -moz-columns: 14.4em 2; -webkit-columns: 14.4em 2;
    }

    .collection-method-list a {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>

<div class="collection-method-list" markdown="1">

[afirmarAceptado](#assert-accepted)
[afirmarBadRequest](#assert-bad-request)
[afirmarClientError](#assert-client-error)
[afirmarConflict](#assert-conflict)
[afirmarCookie](#assert-cookie)
[afirmarCookieExpired](#assert-cookie-expired)
[afirmarCookieNotExpired](#assert-cookie-not-expired)
[afirmarCookieMissing](#assert-cookie-missing)
[afirmarCreado](#assert-created)
[afirmarDontSee](#assert-dont-see)
[afirmarDontSeeText](#assert-dont-see-text)
[afirmarDescargar](#assert-download)
[afirmaExactJson](#assert-exact-json)
[afirmarExactJsonStructure](#assert-exact-json-structure)
[afirmaciónFailedDependency](#assert-failed-dependency)
[afirmarProhibido](#assert-forbidden)
[afirmarFound](#assert-found)
[afirmarGone](#assert-gone)
[assertHeader](#assert-header)
[assertHeaderContains](#assert-header-contains)
[afirmarHeaderMissing](#assert-header-missing)
[afirmarInternalServerError](#assert-internal-server-error)
[afirmarJson](#assert-json)
[afirmarJsonCount](#assert-json-count)
[afirmarJsonFragment](#assert-json-fragment)
[afirmarJsonIsArray](#assert-json-is-array)
[assertJsonIsObject](#assert-json-is-object)
[afirmarJsonMissing](#assert-json-missing)
[assertJsonMissingExact](#assert-json-missing-exact)
[assertJsonMissingValidationErrors](#assert-json-missing-validation-errors)
[afirmarJsonPath](#assert-json-path)
[afirmarJsonPaths](#assert-json-paths)
[afirmarJsonMissingPath](#assert-json-missing-path)
[afirmarJsonMissingPaths](#assert-json-missing-paths)
[assertJsonStructure](#assert-json-structure)
[assertJsonValidationErrors](#assert-json-validation-errors)
[assertJsonValidationErrorFor](#assert-json-validation-error-for)
[afirmarUbicación](#assert-location)
[afirmarMétodoNoAllowed](#assert-method-not-allowed)
[afirmarMovidoPermanentemente](#assert-moved-permanently)
[afirmarContenido](#assert-content)
[afirmarNoContent](#assert-no-content)
[afirmarStreamed](#assert-streamed)
[afirmarContenidoTransmitido](#assert-streamed-content)
[afirmarNotFound](#assert-not-found)
[afirmaOk](#assert-ok)
[afirmarPagoRequerido](#assert-payment-required)
[afirmarPlainCookie](#assert-plain-cookie)
[afirmarRedirect](#assert-redirect)
[afirmarRedirectBack](#assert-redirect-back)
[afirmarRedirectBackWithErrors](#assert-redirect-back-with-errors)
[afirmarRedirectBackSinErrors](#assert-redirect-back-without-errors)
[assertRedirectContains](#assert-redirect-contains)
[afirmarRedirectToRoute](#assert-redirect-to-route)
[afirmarRedirectToSignedRoute](#assert-redirect-to-signed-route)
[assertRequestTimeout](#assert-request-timeout)
[afirmarVer](#assert-see)
[afirmarVerEnOrder](#assert-see-in-order)
[afirmarVerText](#assert-see-text)
[afirmarVerTextoEnOrder](#assert-see-text-in-order)
[afirmarServerError](#assert-server-error)
[afirmarServicioNo Disponible](#assert-service-unavailable)
[afirmarSessionHas](#assert-session-has)
[afirmarSessionHasInput](#assert-session-has-input)
[afirmarSessionHasAll](#assert-session-has-all)
[afirmarSessionTieneErrors](#assert-session-has-errors)
[afirmarSessionTieneErrorsIn](#assert-session-has-errors-in)
[afirmarSessionHasNoErrors](#assert-session-has-no-errors)
[afirmar que la sesión no tiene errores](#assert-session-doesnt-have-errors)
[afirmarSessionMissing](#assert-session-missing)
[afirmarSessionMissingInput](#assert-session-missing-input)
[afirmarEstado](#assert-status)
[afirmarExitoso](#assert-successful)
[afirmarDemasiadasSolicitudes](#assert-too-many-requests)
[afirmarNo autorizado](#assert-unauthorized)
[afirmarInprocesable](#assert-unprocessable)
[afirmarUnsupportedMediaType](#assert-unsupported-media-type)
[afirmarValid](#assert-valid)
[afirmarInvalid](#assert-invalid)
[afirmarViewHas](#assert-view-has)
[afirmarViewHasAll](#assert-view-has-all)
[afirmarViewIs](#assert-view-is)
[afirmarViewMissing](#assert-view-missing)

</div>

<a id="assert-accepted"></a>
#### assertAccepted

Afirme que la respuesta tiene un código de estado HTTP aceptado (202):

```php
$response->assertAccepted();
```

<a id="assert-bad-request"></a>
#### assertBadRequest

Afirme que la respuesta tiene un código de estado HTTP de solicitud incorrecta (400):

```php
$response->assertBadRequest();
```

<a id="assert-client-error"></a>
#### assertClientError

Afirme que la respuesta tiene un código de estado HTTP de error de cliente (>= 400, < 500):

```php
$response->assertClientError();
```

<a id="assert-conflict"></a>
#### assertConflict

Afirme que la respuesta tiene un código de estado HTTP de conflicto (409):

```php
$response->assertConflict();
```

<a id="assert-cookie"></a>
#### assertCookie

Afirme que la respuesta contiene la cookie proporcionada:

```php
$response->assertCookie($cookieName, $value = null);
```

<a id="assert-cookie-expired"></a>
#### assertCookieExpired

Afirme que la respuesta contiene la cookie proporcionada y que está caducada:

```php
$response->assertCookieExpired($cookieName);
```

<a id="assert-cookie-not-expired"></a>
#### assertCookieNotExpired

Afirme que la respuesta contiene la cookie proporcionada y que no ha caducado:

```php
$response->assertCookieNotExpired($cookieName);
```

<a id="assert-cookie-missing"></a>
#### assertCookieMissing

Afirme que la respuesta no contiene la cookie proporcionada:

```php
$response->assertCookieMissing($cookieName);
```

<a id="assert-created"></a>
#### assertCreated

Afirme que la respuesta tiene un código de estado HTTP 201:

```php
$response->assertCreated();
```

<a id="assert-dont-see"></a>
#### assertDontSee

Afirme que la cadena proporcionada no está contenida en la respuesta devuelta por la aplicación. Esta afirmación escapará automáticamente de la cadena dada a menos que pase un segundo argumento de `false`:

```php
$response->assertDontSee($value, $escape = true);
```

<a id="assert-dont-see-text"></a>
#### assertDontSeeText

Afirme que la cadena proporcionada no está contenida en el texto de respuesta. Esta afirmación escapará automáticamente de la cadena proporcionada a menos que pase un segundo argumento de `false`. Este método pasará el contenido de la respuesta a la función PHP `strip_tags` antes de realizar la afirmación:

```php
$response->assertDontSeeText($value, $escape = true);
```

<a id="assert-download"></a>
#### assertDownload

Afirme que la respuesta es una "descarga". Normalmente, esto significa que la ruta invocada que devolvió la respuesta devolvió una respuesta `Response::download`, `BinaryFileResponse` o `Storage::download`:

```php
$response->assertDownload();
```

Si lo desea, puede afirmar que al archivo descargable se le asignó un nombre de archivo determinado:

```php
$response->assertDownload('image.jpg');
```

<a id="assert-exact-json"></a>
#### assertExactJson

Afirme que la respuesta contiene una coincidencia exacta de los datos JSON proporcionados:

```php
$response->assertExactJson(array $data);
```

<a id="assert-exact-json-structure"></a>
#### assertExactJsonStructure

Afirme que la respuesta contiene una coincidencia exacta de la estructura JSON dada:

```php
$response->assertExactJsonStructure(array $data);
```

Este método es una variante más estricta de [assertJsonStructure](#assert-json-structure). A diferencia de `assertJsonStructure`, este método fallará si la respuesta contiene claves que no están incluidas explícitamente en la estructura JSON esperada.

<a id="assert-failed-dependency"></a>
#### assertFailedDependency

Afirme que la respuesta tiene un código de estado HTTP de dependencia fallida (424):

```php
$response->assertFailedDependency();
```

<a id="assert-forbidden"></a>
#### assertForbidden

Afirme que la respuesta tiene un código de estado HTTP prohibido (403):

```php
$response->assertForbidden();
```

<a id="assert-found"></a>
#### assertFound

Afirme que la respuesta tiene un código de estado HTTP encontrado (302):

```php
$response->assertFound();
```

<a id="assert-gone"></a>
#### assertGone

Afirme que la respuesta tiene un código de estado HTTP (410):

```php
$response->assertGone();
```

<a id="assert-header"></a>
#### assertHeader

Afirme que el encabezado y el valor dados están presentes en la respuesta:

```php
$response->assertHeader($headerName, $value = null);
```

<a id="assert-header-contains"></a>
#### assertHeaderContains

Afirme que el encabezado dado contiene un valor de subcadena determinado:

```php
$response->assertHeaderContains($headerName, $value);
```

<a id="assert-header-missing"></a>
#### assertHeaderMissing

Afirme que el encabezado proporcionado no está presente en la respuesta:

```php
$response->assertHeaderMissing($headerName);
```

<a id="assert-internal-server-error"></a>
#### assertInternalServerError

Afirme que la respuesta tiene un código de estado HTTP de "Error interno del servidor" (500):

```php
$response->assertInternalServerError();
```

<a id="assert-json"></a>
#### assertJson

Afirme que la respuesta contiene los datos JSON proporcionados:

```php
$response->assertJson(array $data, $strict = false);
```

El método `assertJson` convierte la respuesta en una matriz para verificar que la matriz dada existe dentro de la respuesta JSON devuelta por la aplicación. Entonces, si hay otras propiedades en la respuesta JSON, esta prueba pasará siempre que el fragmento dado esté presente.

<a id="assert-json-count"></a>
#### assertJsonCount

Afirme que el JSON de respuesta tiene una matriz con la cantidad esperada de elementos en la clave dada:

```php
$response->assertJsonCount($count, $key = null);
```

<a id="assert-json-fragment"></a>
#### assertJsonFragment

Afirme que la respuesta contiene los datos JSON proporcionados en cualquier parte de la respuesta:

```php
Route::get('/users', function () {
    return [
        'users' => [
            [
                'name' => 'Taylor Otwell',
            ],
        ],
    ];
});

$response->assertJsonFragment(['name' => 'Taylor Otwell']);
```

<a id="assert-json-is-array"></a>
#### assertJsonIsArray

Afirme que el JSON de respuesta es una matriz:

```php
$response->assertJsonIsArray();
```

<a id="assert-json-is-object"></a>
#### assertJsonIsObject

Afirme que el JSON de respuesta es un objeto:

```php
$response->assertJsonIsObject();
```

<a id="assert-json-missing"></a>
#### assertJsonMissing

Afirme que la respuesta no contiene los datos JSON proporcionados:

```php
$response->assertJsonMissing(array $data);
```

<a id="assert-json-missing-exact"></a>
#### assertJsonMissingExact

Afirme que la respuesta no contiene los datos JSON exactos:

```php
$response->assertJsonMissingExact(array $data);
```

<a id="assert-json-missing-validation-errors"></a>
#### assertJsonMissingValidationErrors

Afirme que la respuesta no tiene errores de validación JSON para las claves proporcionadas:

```php
$response->assertJsonMissingValidationErrors($keys);
```

> **Nota:**
> El método más genérico [assertValid](#assert-valid) se puede utilizar para afirmar que una respuesta no tiene errores de validación que se devolvieron como JSON **y** que no se enviaron errores al almacenamiento de la sesión.

<a id="assert-json-path"></a>
#### assertJsonPath

Afirme que la respuesta contiene los datos proporcionados en la ruta especificada:

```php
$response->assertJsonPath($path, $expectedValue);
```

Por ejemplo, si su aplicación devuelve la siguiente respuesta JSON:

```json
{
    "user": {
        "name": "Steve Schoger"
    }
}
```

Puede afirmar que la propiedad `name` del objeto `user` coincide con un valor determinado de la siguiente manera:

```php
$response->assertJsonPath('user.name', 'Steve Schoger');
```

<a id="assert-json-paths"></a>
#### assertJsonPaths

Afirme que la respuesta contiene los datos proporcionados en las rutas especificadas:

```php
$response->assertJsonPaths(array $paths);
```

Por ejemplo, puedes afirmar varios valores dentro de la respuesta a la vez:

```php
$response->assertJsonPaths([
    'user.name' => 'Steve Schoger',
    'user.email' => fn (string $email) => str($email)->endsWith('@laravel.com'),
]);
```

<a id="assert-json-missing-path"></a>
#### assertJsonMissingPath

Afirme que la respuesta no contiene la ruta proporcionada:

```php
$response->assertJsonMissingPath($path);
```

Por ejemplo, si su aplicación devuelve la siguiente respuesta JSON:

```json
{
    "user": {
        "name": "Steve Schoger"
    }
}
```

Puede afirmar que no contiene la propiedad `email` del objeto `user`:

```php
$response->assertJsonMissingPath('user.email');
```

<a id="assert-json-missing-paths"></a>
#### assertJsonMissingPaths

Afirme que la respuesta no contiene las rutas proporcionadas:

```php
$response->assertJsonMissingPaths($paths);
```

Por ejemplo, puede afirmar que faltan varias rutas en la respuesta:

```php
$response->assertJsonMissingPaths([
    'user.email',
    'user.password',
]);
```

<a id="assert-json-structure"></a>
#### assertJsonStructure

Afirme que la respuesta tiene una estructura JSON determinada:

```php
$response->assertJsonStructure(array $structure);
```

Por ejemplo, si la respuesta JSON devuelta por su aplicación contiene los siguientes datos:

```json
{
    "user": {
        "name": "Steve Schoger"
    }
}
```

Puede afirmar que la estructura JSON coincide con sus expectativas de la siguiente manera:

```php
$response->assertJsonStructure([
    'user' => [
        'name',
    ]
]);
```

A veces, las respuestas JSON devueltas por su aplicación pueden contener matrices de objetos:

```json
{
    "user": [
        {
            "name": "Steve Schoger",
            "age": 55,
            "location": "Earth"
        },
        {
            "name": "Mary Schoger",
            "age": 60,
            "location": "Earth"
        }
    ]
}
```

En esta situación, puede utilizar el carácter `*` para hacer valer la estructura de todos los objetos de la matriz:

```php
$response->assertJsonStructure([
    'user' => [
        '*' => [
             'name',
             'age',
             'location'
        ]
    ]
]);
```

<a id="assert-json-validation-errors"></a>
#### assertJsonValidationErrors

Afirme que la respuesta tiene los errores de validación JSON proporcionados para las claves proporcionadas. Este método debe usarse cuando se afirma contra respuestas donde los errores de validación se devuelven como una estructura JSON en lugar de mostrarse en la sesión:

```php
$response->assertJsonValidationErrors(array $data, $responseKey = 'errors');
```

> **Nota:**
> El método más genérico [assertInvalid](#assert-invalid) se puede utilizar para afirmar que una respuesta tiene errores de validación devueltos como JSON **o** que los errores se enviaron al almacenamiento de la sesión.

<a id="assert-json-validation-error-for"></a>
#### assertJsonValidationErrorFor

Afirme que la respuesta tiene errores de validación JSON para la clave proporcionada:

```php
$response->assertJsonValidationErrorFor(string $key, $responseKey = 'errors');
```

<a id="assert-method-not-allowed"></a>
#### assertMethodNotAllowed

Afirme que la respuesta tiene un código de estado HTTP de método no permitido (405):

```php
$response->assertMethodNotAllowed();
```

<a id="assert-moved-permanently"></a>
#### assertMovedPermanently

Afirme que la respuesta tiene un código de estado HTTP movido permanentemente (301):

```php
$response->assertMovedPermanently();
```

<a id="assert-location"></a>
#### assertLocation

Afirme que la respuesta tiene el valor de URI proporcionado en el encabezado `Location`:

```php
$response->assertLocation($uri);
```

<a id="assert-content"></a>
#### assertContent

Afirme que la cadena proporcionada coincide con el contenido de la respuesta:

```php
$response->assertContent($value);
```

<a id="assert-no-content"></a>
#### assertNoContent

Afirme que la respuesta tiene el código de estado HTTP proporcionado y no tiene contenido:

```php
$response->assertNoContent($status = 204);
```

<a id="assert-streamed"></a>
#### assertStreamed

Afirme que la respuesta fue una respuesta transmitida:

    $respuesta->assertStreamed();

<a id="assert-streamed-content"></a>
#### assertStreamedContent

Afirme que la cadena proporcionada coincide con el contenido de la respuesta transmitida:

```php
$response->assertStreamedContent($value);
```

<a id="assert-not-found"></a>
#### assertNotFound

Afirme que la respuesta tiene un código de estado HTTP no encontrado (404):

```php
$response->assertNotFound();
```

<a id="assert-ok"></a>
#### assertOk

Afirme que la respuesta tiene un código de estado HTTP 200:

```php
$response->assertOk();
```

<a id="assert-payment-required"></a>
#### assertPaymentRequired

Afirme que la respuesta tiene un código de estado HTTP de pago requerido (402):

```php
$response->assertPaymentRequired();
```

<a id="assert-plain-cookie"></a>
#### assertPlainCookie

Afirme que la respuesta contiene la cookie no cifrada proporcionada:

```php
$response->assertPlainCookie($cookieName, $value = null);
```

<a id="assert-redirect"></a>
#### assertRedirect

Afirme que la respuesta es una redirección al URI proporcionado:

```php
$response->assertRedirect($uri = null);
```

<a id="assert-redirect-back"></a>
#### assertRedirectBack

Confirme si la respuesta redirige a la página anterior:

```php
$response->assertRedirectBack();
```

<a id="assert-redirect-back-with-errors"></a>
#### assertRedirectBackWithErrors

Confirme si la respuesta redirige a la página anterior y la [sesión tiene los errores](#assert-session-has-errors) indicados:

```php
$response->assertRedirectBackWithErrors(
    array $keys = [], $format = null, $errorBag = 'default'
);
```

<a id="assert-redirect-back-without-errors"></a>
#### assertRedirectBackWithoutErrors

Afirme si la respuesta redirige a la página anterior y si la sesión no contiene ningún mensaje de error:

```php
$response->assertRedirectBackWithoutErrors();
```

<a id="assert-redirect-contains"></a>
#### assertRedirectContains

Confirme si la respuesta redirige a un URI que contiene la cadena proporcionada:

```php
$response->assertRedirectContains($string);
```

<a id="assert-redirect-to-route"></a>
#### assertRedirectToRoute

Afirme que la respuesta es una redirección a la [ruta nombrada](../routing/#named-routes):

```php
$response->assertRedirectToRoute($name, $parameters = []);
```

<a id="assert-redirect-to-signed-route"></a>
#### assertRedirectToSignedRoute

Afirme que la respuesta es una redirección a la [ruta firmada](../urls/#signed-urls):

```php
$response->assertRedirectToSignedRoute($name = null, $parameters = []);
```

<a id="assert-request-timeout"></a>
#### assertRequestTimeout

Afirme que la respuesta tiene un código de estado HTTP de tiempo de espera de solicitud (408):

```php
$response->assertRequestTimeout();
```

<a id="assert-see"></a>
#### assertSee

Afirme que la cadena dada está contenida en la respuesta. Esta afirmación escapará automáticamente de la cadena dada a menos que pase un segundo argumento de `false`:

```php
$response->assertSee($value, $escape = true);
```

<a id="assert-see-in-order"></a>
#### assertSeeInOrder

Afirme que las cadenas dadas están contenidas en orden dentro de la respuesta. Esta afirmación escapará automáticamente de las cadenas dadas a menos que pase un segundo argumento de `false`:

```php
$response->assertSeeInOrder(array $values, $escape = true);
```

<a id="assert-see-text"></a>
#### assertSeeText

Afirme que la cadena proporcionada está contenida en el texto de respuesta. Esta afirmación escapará automáticamente de la cadena proporcionada a menos que pase un segundo argumento de `false`. El contenido de la respuesta se pasará a la función PHP `strip_tags` antes de realizar la afirmación:

```php
$response->assertSeeText($value, $escape = true);
```

<a id="assert-see-text-in-order"></a>
#### assertSeeTextInOrder

Afirme que las cadenas proporcionadas están contenidas en orden dentro del texto de respuesta. Esta afirmación escapará automáticamente de las cadenas dadas a menos que pase un segundo argumento de `false`. El contenido de la respuesta se pasará a la función PHP `strip_tags` antes de realizar la afirmación:

```php
$response->assertSeeTextInOrder(array $values, $escape = true);
```

<a id="assert-server-error"></a>
#### assertServerError

Afirme que la respuesta tiene un código de estado HTTP de error de servidor (>= 500, <600):

```php
$response->assertServerError();
```

<a id="assert-service-unavailable"></a>
#### assertServiceUnavailable

Afirme que la respuesta tiene un código de estado HTTP "Servicio no disponible" (503):

```php
$response->assertServiceUnavailable();
```

<a id="assert-session-has"></a>
#### assertSessionHas

Afirme que la sesión contiene el dato dado:

```php
$response->assertSessionHas($key, $value = null);
```

Si es necesario, se puede proporcionar una función anónima como segundo argumento del método `assertSessionHas`. La afirmación pasará si la función anónima devuelve `true`:

```php
$response->assertSessionHas($key, function (User $value) {
    return $value->name === 'Taylor Otwell';
});
```

<a id="assert-session-has-input"></a>
#### assertSessionHasInput

Afirme que la sesión tiene un valor determinado en el [matriz de entrada parpadeante](../responses/#redirecting-with-flashed-session-data):

```php
$response->assertSessionHasInput($key, $value = null);
```

Si es necesario, se puede proporcionar una función anónima como segundo argumento del método `assertSessionHasInput`. La afirmación pasará si la función anónima devuelve `true`:

```php
use Illuminate\Support\Facades\Crypt;

$response->assertSessionHasInput($key, function (string $value) {
    return Crypt::decryptString($value) === 'secret';
});
```

<a id="assert-session-has-all"></a>
#### assertSessionHasAll

Afirme que la sesión contiene una matriz determinada de pares clave/valor:

```php
$response->assertSessionHasAll(array $data);
```

Por ejemplo, si la sesión de su aplicación contiene las claves `name` y `status`, puede afirmar que ambas existen y tienen los valores especificados de esta manera:

```php
$response->assertSessionHasAll([
    'name' => 'Taylor Otwell',
    'status' => 'active',
]);
```

<a id="assert-session-has-errors"></a>
#### assertSessionHasErrors

Afirme que la sesión contiene un error para el `$keys` dado. Si `$keys` es una matriz asociativa, afirme que la sesión contiene un mensaje de error específico (valor) para cada campo (clave). Este método debe usarse al probar rutas que muestran errores de validación en la sesión en lugar de devolverlos como una estructura JSON:

```php
$response->assertSessionHasErrors(
    array $keys = [], $format = null, $errorBag = 'default'
);
```

Por ejemplo, para afirmar que los campos `name` y `email` tienen mensajes de error de validación que se enviaron a la sesión, puede invocar el método `assertSessionHasErrors` de esta manera:

```php
$response->assertSessionHasErrors(['name', 'email']);
```

O puede afirmar que un campo determinado tiene un mensaje de error de validación particular:

```php
$response->assertSessionHasErrors([
    'name' => 'The given name was invalid.'
]);
```

> **Nota:**
> El método más genérico [assertInvalid](#assert-invalid) se puede utilizar para afirmar que una respuesta tiene errores de validación devueltos como JSON **o** que los errores se enviaron al almacenamiento de la sesión.

<a id="assert-session-has-errors-in"></a>
#### assertSessionHasErrorsIn

Afirme que la sesión contiene un error para el `$keys` dado dentro de un [error bag](../validation/#named-error-bags) específico. Si `$keys` es una matriz asociativa, asevere que la sesión contiene un mensaje de error específico (valor) para cada campo (clave), dentro de la bolsa de errores:

```php
$response->assertSessionHasErrorsIn($errorBag, $keys = [], $format = null);
```

<a id="assert-session-has-no-errors"></a>
#### assertSessionHasNoErrors

Afirmar que la sesión no tiene errores de validación:

```php
$response->assertSessionHasNoErrors();
```

<a id="assert-session-doesnt-have-errors"></a>
#### assertSessionDoesntHaveErrors

Afirme que la sesión no tiene errores de validación para las claves proporcionadas:

```php
$response->assertSessionDoesntHaveErrors($keys = [], $format = null, $errorBag = 'default');
```

> **Nota:**
> El método más genérico [assertValid](#assert-valid) se puede utilizar para afirmar que una respuesta no tiene errores de validación que se devolvieron como JSON **y** que no se enviaron errores al almacenamiento de la sesión.

<a id="assert-session-missing"></a>
#### assertSessionMissing

Afirme que la sesión no contiene la clave proporcionada:

```php
$response->assertSessionMissing($key);
```

<a id="assert-session-missing-input"></a>
#### assertSessionMissingInput

Afirme que a la sesión le falta la clave de entrada proporcionada en la matriz de entrada flasheada:

```php
$response->assertSessionMissingInput($key);
```

<a id="assert-status"></a>
#### assertStatus

Afirme que la respuesta tiene un código de estado HTTP determinado:

```php
$response->assertStatus($code);
```

<a id="assert-successful"></a>
#### assertSuccessful

Afirme que la respuesta tiene un código de estado HTTP exitoso (>= 200 y <300):

```php
$response->assertSuccessful();
```

<a id="assert-too-many-requests"></a>
#### assertTooManyRequests

Afirme que la respuesta tiene demasiadas solicitudes (429) Código de estado HTTP:

```php
$response->assertTooManyRequests();
```

<a id="assert-unauthorized"></a>
#### assertUnauthorized

Afirme que la respuesta tiene un código de estado HTTP no autorizado (401):

```php
$response->assertUnauthorized();
```

<a id="assert-unprocessable"></a>
#### assertUnprocessable

Afirme que la respuesta tiene un código de estado HTTP de entidad no procesable (422):

```php
$response->assertUnprocessable();
```

<a id="assert-unsupported-media-type"></a>
#### assertUnsupportedMediaType

Afirme que la respuesta tiene un código de estado HTTP de tipo de medio no compatible (415):

```php
$response->assertUnsupportedMediaType();
```

<a id="assert-valid"></a>
#### assertValid

Afirme que la respuesta no tiene errores de validación para las claves proporcionadas. Este método se puede utilizar para afirmar respuestas en las que los errores de validación se devuelven como una estructura JSON o en las que los errores de validación se han mostrado a la sesión:

```php
// Assert that no validation errors are present...
$response->assertValid();

// Assert that the given keys do not have validation errors...
$response->assertValid(['name', 'email']);
```

<a id="assert-invalid"></a>
#### assertInvalid

Afirme que la respuesta tiene errores de validación para las claves proporcionadas. Este método se puede utilizar para afirmar respuestas en las que los errores de validación se devuelven como una estructura JSON o en las que los errores de validación se han mostrado a la sesión:

```php
$response->assertInvalid(['name', 'email']);
```

También puede afirmar que una clave determinada tiene un mensaje de error de validación particular. Al hacerlo, puede proporcionar el mensaje completo o solo una pequeña parte del mensaje:

```php
$response->assertInvalid([
    'name' => 'The name field is required.',
    'email' => 'valid email address',
]);
```

Si desea afirmar que los campos proporcionados son los únicos campos con errores de validación, puede utilizar el método `assertOnlyInvalid`:

```php
$response->assertOnlyInvalid(['name', 'email']);
```

<a id="assert-view-has"></a>
#### assertViewHas

Afirme que la vista de respuesta contiene un dato determinado:

```php
$response->assertViewHas($key, $value = null);
```

Pasar una función anónima como segundo argumento del método `assertViewHas` le permitirá inspeccionar y hacer afirmaciones sobre un dato de vista en particular:

```php
$response->assertViewHas('user', function (User $user) {
    return $user->name === 'Taylor';
});
```

Además, se puede acceder a los datos de visualización como variables de matriz en la respuesta, lo que le permite inspeccionarlas cómodamente:

```php tab=Pest
expect($response['name'])->toBe('Taylor');
```

```php tab=PHPUnit
$this->assertEquals('Taylor', $response['name']);
```

<a id="assert-view-has-all"></a>
#### assertViewHasAll

Afirme que la vista de respuesta tiene una lista determinada de datos:

```php
$response->assertViewHasAll(array $data);
```

Este método se puede utilizar para afirmar que la vista simplemente contiene datos que coinciden con las claves dadas:

```php
$response->assertViewHasAll([
    'name',
    'email',
]);
```

O puede afirmar que los datos de la vista están presentes y tienen valores específicos:

```php
$response->assertViewHasAll([
    'name' => 'Taylor Otwell',
    'email' => 'taylor@example.com,',
]);
```

<a id="assert-view-is"></a>
#### assertViewIs

Afirme que la vista dada fue devuelta por la ruta:

```php
$response->assertViewIs($value);
```

<a id="assert-view-missing"></a>
#### assertViewMissing

Afirme que la clave de datos proporcionada no estuvo disponible para la vista devuelta en la respuesta de la aplicación:

```php
$response->assertViewMissing($key);
```

<a id="authentication-assertions"></a>
### Afirmaciones de autenticación

Laravel también proporciona una variedad de afirmaciones relacionadas con la autenticación que puede utilizar dentro de las pruebas de funciones de su aplicación. Tenga en cuenta que estos métodos se invocan en la propia clase de prueba y no en la instancia `Illuminate\Testing\TestResponse` devuelta por métodos como `get` y `post`.

<a id="assert-authenticated"></a>
#### assertAuthenticated

Afirmar que un usuario está autenticado:

```php
$this->assertAuthenticated($guard = null);
```

<a id="assert-guest"></a>
#### assertGuest

Afirmar que un usuario no está autenticado:

```php
$this->assertGuest($guard = null);
```

<a id="assert-authenticated-as"></a>
#### assertAuthenticatedAs

Afirmar que un usuario específico está autenticado:

```php
$this->assertAuthenticatedAs($user, $guard = null);
```

<a id="validation-assertions"></a>
## Afirmaciones de validación

Laravel proporciona dos afirmaciones principales relacionadas con la validación que puede utilizar para garantizar que los datos proporcionados en su solicitud sean válidos o no válidos.

<a id="validation-assert-valid"></a>
#### assertValid

Afirme que la respuesta no tiene errores de validación para las claves proporcionadas. Este método se puede utilizar para afirmar respuestas en las que los errores de validación se devuelven como una estructura JSON o en las que los errores de validación se han mostrado a la sesión:

```php
// Assert that no validation errors are present...
$response->assertValid();

// Assert that the given keys do not have validation errors...
$response->assertValid(['name', 'email']);
```

<a id="validation-assert-invalid"></a>
#### assertInvalid

Afirme que la respuesta tiene errores de validación para las claves proporcionadas. Este método se puede utilizar para afirmar respuestas en las que los errores de validación se devuelven como una estructura JSON o en las que los errores de validación se han mostrado a la sesión:

```php
$response->assertInvalid(['name', 'email']);
```

También puede afirmar que una clave determinada tiene un mensaje de error de validación particular. Al hacerlo, puede proporcionar el mensaje completo o solo una pequeña parte del mensaje:

```php
$response->assertInvalid([
    'name' => 'The name field is required.',
    'email' => 'valid email address',
]);
```
