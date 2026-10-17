---
title: "Laravel Dusk"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Instalación](#installation)
    - [Administración de instalaciones de ChromeDriver](#managing-chromedriver-installations)
    - [Uso de otros navegadores](#using-other-browsers)
- [Primeros pasos](#getting-started)
    - [Generación de pruebas](#generating-tests)
    - [Restablecer la base de datos después de cada prueba](#resetting-the-database-after-each-test)
    - [Ejecución de pruebas](#running-tests)
    - [Gestión del entorno](#environment-handling)
- [Conceptos básicos del navegador](#browser-basics)
    - [Creación de navegadores](#creating-browsers)
    - [Navegación](#navigation)
    - [Cambiar el tamaño de las ventanas del navegador](#resizing-browser-windows)
    - [Macros del navegador](#browser-macros)
    - [Autenticación](#authentication)
    - [Cookies](#cookies)
    - [Ejecución de JavaScript](#executing-javascript)
    - [Tomar una captura de pantalla](#taking-a-screenshot)
    - [Almacenamiento de la salida de la consola en disco](#storing-console-output-to-disk)
    - [Almacenamiento de la código fuente de la página en disco](#storing-page-source-to-disk)
- [Interacción con elementos](#interacting-with-elements)
    - [Selectores de Dusk](#dusk-selectors)
    - [Texto, Valores y Atributos](#text-values-and-attributes)
    - [Interacción con formularios](#interacting-with-forms)
    - [Adjuntar archivos](#attaching-files)
    - [Presionar botones](#pressing-buttons)
    - [Hacer clic en enlaces](#clicking-links)
    - [Uso del teclado](#using-the-keyboard)
    - [Uso del ratón](#using-the-mouse)
    - [Diálogos de JavaScript](#javascript-dialogs)
    - [Interacción con marcos en línea](#interacting-with-iframes)
    - [Ámbito de los selectores](#scoping-selectors)
    - [Espera de elementos](#waiting-for-elements)
    - [Desplazar un elemento a la vista](#scrolling-an-element-into-view)
- [Aserciones disponibles](#available-assertions)
- [Páginas](#pages)
    - [Generación de páginas](#generating-pages)
    - [Configuración de páginas](#configuring-pages)
    - [Navegación a páginas](#navigating-to-pages)
    - [Selectores abreviados](#shorthand-selectors)
    - [Métodos de página](#page-methods)
- [Componentes](#components)
    - [Generación de componentes](#generating-components)
    - [Uso de componentes](#using-components)
- [Integración continua](#continuous-integration)
    - [Heroku CI](#running-tests-on-heroku-ci)
    - [Travis CI](#running-tests-on-travis-ci)
    - [GitHub Actions](#running-tests-on-github-actions)
    - [Chipper CI](#running-tests-on-chipper-ci)

<a id="introduction"></a>
## Introducción

> **Advertencia:**
> [Pest 4](https://pestphp.com/) ahora incluye pruebas automatizadas de navegador que ofrecen importantes mejoras de rendimiento y usabilidad en comparación con Laravel Dusk. Para proyectos nuevos, recomendamos utilizar Pest para probar el navegador.

[Laravel Dusk](https://github.com/laravel/dusk) proporciona una API de prueba y automatización del navegador expresiva y fácil de usar. De forma predeterminada, Dusk no requiere que instales JDK o Selenium en tu equipo local. En cambio, Dusk utiliza una instalación independiente de [ChromeDriver](https://sites.google.com/chromium.org/driver). Sin embargo, puedes utilizar cualquier otro controlador compatible con Selenium que desees.

<a id="installation"></a>
## Instalación

Para comenzar, debes instalar [Google Chrome](https://www.google.com/chrome) y agregar la dependencia de Composer `laravel/dusk` a tu proyecto:

```shell
composer require laravel/dusk --dev
```

> **Advertencia:**
> Si estás registrando manualmente el proveedor de servicios de Dusk, **nunca** debes registrarlo en tu entorno de producción, ya que hacerlo podría dar lugar a que usuarios arbitrarios puedan autenticarse con tu aplicación.

Después de instalar el paquete Dusk, ejecuta el comando de Artisan `dusk:install`. El comando `dusk:install` creará un directorio `tests/Browser`, una prueba de Dusk de ejemplo, e instalará el binario del controlador Chrome para tu sistema operativo:

```shell
php artisan dusk:install
```

A continuación, configura la variable de entorno `APP_URL` en el archivo `.env` de tu aplicación. Este valor debe coincidir con la URL que utilizas para acceder a tu aplicación en un navegador.

> **Nota:**
> Si estás utilizando [Laravel Sail](../sail/) para administrar tu entorno de desarrollo local, consulta también la documentación de Sail sobre [configurar y ejecutar pruebas de Dusk](../sail/#laravel-dusk).

<a id="managing-chromedriver-installations"></a>
### Gestión de instalaciones de ChromeDriver

Si deseas instalar una versión de ChromeDriver diferente a la que instala Laravel Dusk mediante el comando `dusk:install`, puedes usar el comando `dusk:chrome-driver`:

```shell
# Install the latest version of ChromeDriver for your OS...
php artisan dusk:chrome-driver

# Install a given version of ChromeDriver for your OS...
php artisan dusk:chrome-driver 86

# Install a given version of ChromeDriver for all supported OSs...
php artisan dusk:chrome-driver --all

# Install the version of ChromeDriver that matches the detected version of Chrome / Chromium for your OS...
php artisan dusk:chrome-driver --detect
```

> **Advertencia:**
> Dusk requiere que los binarios `chromedriver` sean ejecutables. Si tienes problemas al ejecutar Dusk, debes asegurarte de que los binarios sean ejecutables usando el siguiente comando: `chmod -R 0755 vendor/laravel/dusk/bin/`.

<a id="using-other-browsers"></a>
### Uso de otros navegadores

De forma predeterminada, Dusk usa Google Chrome y una instalación independiente de [ChromeDriver](https://sites.google.com/chromium.org/driver) para ejecutar las pruebas de tu navegador. Sin embargo, puedes iniciar tu propio servidor Selenium y ejecutar tus pruebas en cualquier navegador que desees.

Para comenzar, abre tu archivo `tests/DuskTestCase.php`, que es el caso de prueba base de Dusk para tu aplicación. Dentro de este archivo, puedes eliminar la llamada al método `startChromeDriver`. Esto evitará que Dusk inicie automáticamente ChromeDriver:

```php
/**
 * Prepare for Dusk test execution.
 *
 * @beforeClass
 */
public static function prepare(): void
{
    // static::startChromeDriver();
}
```

A continuación, puedes modificar el método `driver` para conectarte a la URL y al puerto de tu elección. Además, puedes modificar las "capacidades deseadas" que deben pasarse al WebDriver:

```php
use Facebook\WebDriver\Remote\RemoteWebDriver;

/**
 * Create the RemoteWebDriver instance.
 */
protected function driver(): RemoteWebDriver
{
    return RemoteWebDriver::create(
        'http://localhost:4444/wd/hub', DesiredCapabilities::phantomjs()
    );
}
```

<a id="getting-started"></a>
## Primeros pasos

<a id="generating-tests"></a>
### Generación de pruebas

Para generar una prueba de Dusk, usa el comando de Artisan `dusk:make`. La prueba generada se colocará en el directorio `tests/Browser`:

```shell
php artisan dusk:make LoginTest
```

<a id="resetting-the-database-after-each-test"></a>
### Restablecer la base de datos después de cada prueba

La mayoría de las pruebas que escribas interactuarán con páginas que recuperan datos de la base de datos de tu aplicación; sin embargo, tus pruebas de Dusk nunca deben usar el trait `RefreshDatabase`. El trait `RefreshDatabase` aprovecha las transacciones de la base de datos que no serán aplicables ni estarán disponibles en las solicitudes HTTP. En cambio, tienes dos opciones: el trait `DatabaseMigrations` y el trait `DatabaseTruncation`.

<a id="reset-migrations"></a>
#### Uso de migraciones de bases de datos

El trait `DatabaseMigrations` ejecutará las migraciones de tu base de datos antes de cada prueba. Sin embargo, eliminar y volver a crear las tablas de tu base de datos para cada prueba suele ser más lento que truncar las tablas:

```php tab=Pest
<?php

use Illuminate\Foundation\Testing\DatabaseMigrations;

pest()->use(DatabaseMigrations::class);

//
```

```php tab=PHPUnit
<?php

namespace Tests\Browser;

use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class ExampleTest extends DuskTestCase
{
    use DatabaseMigrations;

    //
}
```

> **Advertencia:**
> Las bases de datos SQLite en memoria no se pueden utilizar al ejecutar pruebas de Dusk. Dado que el navegador se ejecuta dentro de su propio proceso, no podrá acceder a las bases de datos en memoria de otros procesos.

<a id="reset-truncation"></a>
#### Uso del truncamiento de la base de datos

El trait `DatabaseTruncation` migrará tu base de datos en la primera prueba para garantizar que las tablas de tu base de datos se hayan creado correctamente. Sin embargo, en pruebas posteriores, las tablas de la base de datos simplemente se truncarán, lo que proporciona un aumento de velocidad en comparación con la repetición de todas las migraciones de bases de datos:

```php tab=Pest
<?php

use Illuminate\Foundation\Testing\DatabaseTruncation;

pest()->use(DatabaseTruncation::class);

//
```

```php tab=PHPUnit
<?php

namespace Tests\Browser;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTruncation;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class ExampleTest extends DuskTestCase
{
    use DatabaseTruncation;

    //
}
```

De forma predeterminada, este trait truncará todas las tablas excepto la tabla `migrations`. Si deseas personalizar las tablas que deben truncarse, puedes definir una propiedad `$tablesToTruncate` en tu clase de prueba:

> **Nota:**
> Si estás utilizando Pest, debes definir propiedades o métodos en la clase base `DuskTestCase` o en cualquier clase de la que herede tu archivo de prueba.

```php
/**
 * Indicates which tables should be truncated.
 *
 * @var array
 */
protected $tablesToTruncate = ['users'];
```

Alternativamente, puedes definir una propiedad `$exceptTables` en tu clase de prueba para especificar qué tablas deben excluirse del truncamiento:

```php
/**
 * Indicates which tables should be excluded from truncation.
 *
 * @var array
 */
protected $exceptTables = ['users'];
```

Para especificar las conexiones de bases de datos cuyas tablas deben truncarse, puedes definir una propiedad `$connectionsToTruncate` en tu clase de prueba:

```php
/**
 * Indicates which connections should have their tables truncated.
 *
 * @var array
 */
protected $connectionsToTruncate = ['mysql'];
```

Si deseas ejecutar código antes o después de realizar el truncamiento de la base de datos, puedes definir los métodos `beforeTruncatingDatabase` o `afterTruncatingDatabase` en tu clase de prueba:

```php
/**
 * Perform any work that should take place before the database has started truncating.
 */
protected function beforeTruncatingDatabase(): void
{
    //
}

/**
 * Perform any work that should take place after the database has finished truncating.
 */
protected function afterTruncatingDatabase(): void
{
    //
}
```

<a id="running-tests"></a>
### Ejecución de pruebas

Para ejecutar las pruebas de tu navegador, ejecuta el comando de Artisan `dusk`:

```shell
php artisan dusk
```

Si tuviste errores en las pruebas la última vez que ejecutaste el comando `dusk`, puedes ahorrar tiempo volviendo a ejecutar las pruebas fallidas primero usando el comando `dusk:fails`:

```shell
php artisan dusk:fails
```

El comando `dusk` acepta cualquier argumento que normalmente acepta el ejecutor de pruebas Pest/PHPUnit, como permitirte ejecutar solo las pruebas para un [grupo](https://docs.phpunit.de/en/10.5/annotations.html#group):

```shell
php artisan dusk --group=foo
```

> **Nota:**
> Si estás utilizando [Laravel Sail](../sail/) para administrar tu entorno de desarrollo local, consulta la documentación de Sail sobre [configurar y ejecutar pruebas de Dusk](../sail/#laravel-dusk).

<a id="manually-starting-chromedriver"></a>
#### Iniciar ChromeDriver manualmente

De forma predeterminada, Dusk intentará iniciar ChromeDriver automáticamente. Si esto no funciona para tu sistema en particular, puedes iniciar ChromeDriver manualmente antes de ejecutar el comando `dusk`. Si eliges iniciar ChromeDriver manualmente, debes comentar la siguiente línea de tu archivo `tests/DuskTestCase.php`:

```php
/**
 * Prepare for Dusk test execution.
 *
 * @beforeClass
 */
public static function prepare(): void
{
    // static::startChromeDriver();
}
```

Además, si inicias ChromeDriver en un puerto distinto al 9515, debes modificar el método `driver` de la misma clase para reflejar el puerto correcto:

```php
use Facebook\WebDriver\Remote\RemoteWebDriver;

/**
 * Create the RemoteWebDriver instance.
 */
protected function driver(): RemoteWebDriver
{
    return RemoteWebDriver::create(
        'http://localhost:9515', DesiredCapabilities::chrome()
    );
}
```

<a id="environment-handling"></a>
### Gestión del entorno

Para forzar a Dusk a usar su propio archivo de entorno al ejecutar pruebas, crea un archivo `.env.dusk.{environment}` en la raíz de tu proyecto. Por ejemplo, si vas a iniciar el comando `dusk` desde tu entorno `local`, debes crear un archivo `.env.dusk.local`.

Al ejecutar pruebas, Dusk hará una copia de seguridad de tu archivo `.env` y cambiará el nombre de tu archivo de entorno de Dusk a `.env`. Una vez que se hayan completado las pruebas, se restaurará tu archivo `.env`.

<a id="browser-basics"></a>
## Conceptos básicos del navegador

<a id="creating-browsers"></a>
### Creación de navegadores

Para comenzar, escribamos una prueba que verifique que podemos iniciar sesión en nuestra aplicación. Después de generar una prueba, podemos modificarla para navegar a la página de inicio de sesión, ingresar algunas credenciales y hacer clic en el botón "Iniciar sesión". Para crear una instancia de navegador, puedes llamar al método `browse` desde tu prueba de Dusk:

```php tab=Pest
<?php

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;

pest()->use(DatabaseMigrations::class);

test('basic example', function () {
    $user = User::factory()->create([
        'email' => 'taylor@laravel.com',
    ]);

    $this->browse(function (Browser $browser) use ($user) {
        $browser->visit('/login')
            ->type('email', $user->email)
            ->type('password', 'password')
            ->press('Login')
            ->assertPathIs('/home');
    });
});
```

```php tab=PHPUnit
<?php

namespace Tests\Browser;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class ExampleTest extends DuskTestCase
{
    use DatabaseMigrations;

    /**
     * A basic browser test example.
     */
    public function test_basic_example(): void
    {
        $user = User::factory()->create([
            'email' => 'taylor@laravel.com',
        ]);

        $this->browse(function (Browser $browser) use ($user) {
            $browser->visit('/login')
                ->type('email', $user->email)
                ->type('password', 'password')
                ->press('Login')
                ->assertPathIs('/home');
        });
    }
}
```

Como puedes ver en el ejemplo anterior, el método `browse` acepta una función anónima. Dusk pasará automáticamente una instancia del navegador a esta función anónima y es el objeto principal que se utiliza para interactuar y hacer aserciones sobre tu aplicación.

<a id="creating-multiple-browsers"></a>
#### Creación de varios navegadores

A veces es posible que necesites varios navegadores para realizar una prueba correctamente. Por ejemplo, es posible que se necesiten varios navegadores para probar una pantalla de chat que interactúa con websockets. Para crear múltiples navegadores, simplemente agrega más argumentos del navegador a la firma de la función anónima proporcionada al método `browse`:

```php
$this->browse(function (Browser $first, Browser $second) {
    $first->loginAs(User::find(1))
        ->visit('/home')
        ->waitForText('Message');

    $second->loginAs(User::find(2))
        ->visit('/home')
        ->waitForText('Message')
        ->type('message', 'Hey Taylor')
        ->press('Send');

    $first->waitForText('Hey Taylor')
        ->assertSee('Jeffrey Way');
});
```

<a id="navigation"></a>
### Navegación

El método `visit` se puede utilizar para navegar a un URI determinado dentro de tu aplicación:

```php
$browser->visit('/login');
```

Puedes utilizar el método `visitRoute` para navegar a una [ruta nombrada](../routing/#named-routes):

```php
$browser->visitRoute($routeName, $parameters);
```

Puedes navegar "hacia atrás" y "adelante" utilizando los métodos `back` y `forward`:

```php
$browser->back();

$browser->forward();
```

Puedes utilizar el método `refresh` para actualizar la página:

```php
$browser->refresh();
```

<a id="resizing-browser-windows"></a>
### Cambiar el tamaño de las ventanas del navegador

Puedes utilizar el método `resize` para ajustar el tamaño de la ventana del navegador:

```php
$browser->resize(1920, 1080);
```

Se puede utilizar el método `maximize` para maximizar la ventana del navegador:

```php
$browser->maximize();
```

El método `fitContent` cambiará el tamaño de la ventana del navegador para que coincida con el tamaño de su contenido:

```php
$browser->fitContent();
```

Cuando una prueba falla, Dusk cambiará automáticamente el tamaño del navegador para que se ajuste al contenido antes de tomar una captura de pantalla. Puedes desactivar esta función llamando al método `disableFitOnFailure` dentro de tu prueba:

```php
$browser->disableFitOnFailure();
```

Puedes utilizar el método `move` para mover la ventana del navegador a una posición diferente en tu pantalla:

```php
$browser->move($x = 100, $y = 100);
```

<a id="browser-macros"></a>
### Macros del navegador

Si deseas definir un método de navegador personalizado que puedas reutilizar en una variedad de pruebas, puedes usar el método `macro` en la clase `Browser`. Normalmente, debes llamar a este método desde el [método `boot` del proveedor de servicios](../providers/):

```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Dusk\Browser;

class DuskServiceProvider extends ServiceProvider
{
    /**
     * Register Dusk's browser macros.
     */
    public function boot(): void
    {
        Browser::macro('scrollToElement', function (string $element = null) {
            $this->script("$('html, body').animate({ scrollTop: $('$element').offset().top }, 0);");

            return $this;
        });
    }
}
```

El método `macro` acepta un nombre como primer argumento y una función anónima como segundo. La función anónima de la macro se ejecutará al llamar a la macro como método en una instancia `Browser`:

```php
$this->browse(function (Browser $browser) use ($user) {
    $browser->visit('/pay')
        ->scrollToElement('#credit-card-details')
        ->assertSee('Enter Credit Card Details');
});
```

<a id="authentication"></a>
### Autenticación

A menudo, probarás páginas que requieren autenticación. Puedes utilizar el método `loginAs` de Dusk para evitar interactuar con la pantalla de inicio de sesión de tu aplicación durante cada prueba. El método `loginAs` acepta una clave primaria asociada con tu modelo autenticable o una instancia de modelo autenticable:

```php
use App\Models\User;
use Laravel\Dusk\Browser;

$this->browse(function (Browser $browser) {
    $browser->loginAs(User::find(1))
        ->visit('/home');
});
```

> **Advertencia:**
> Después de utilizar el método `loginAs`, la sesión del usuario se mantendrá para todas las pruebas dentro del archivo.

<a id="cookies"></a>
### Cookies

Puedes utilizar el método `cookie` para obtener o establecer el valor de una cookie cifrada. Por defecto, todas las cookies creadas por Laravel están cifradas:

```php
$browser->cookie('name');

$browser->cookie('name', 'Taylor');
```

Puedes utilizar el método `plainCookie` para obtener o establecer el valor de una cookie no cifrada:

```php
$browser->plainCookie('name');

$browser->plainCookie('name', 'Taylor');
```

Puedes utilizar el método `deleteCookie` para eliminar la cookie proporcionada:

```php
$browser->deleteCookie('name');
```

<a id="executing-javascript"></a>
### Ejecución de JavaScript

Puedes utilizar el método `script` para ejecutar declaraciones JavaScript arbitrarias dentro del navegador:

```php
$browser->script('document.documentElement.scrollTop = 0');

$browser->script([
    'document.body.scrollTop = 0',
    'document.documentElement.scrollTop = 0',
]);

$output = $browser->script('return window.location.pathname');
```

<a id="taking-a-screenshot"></a>
### Tomar una captura de pantalla

Puedes utilizar el método `screenshot` para tomar una captura de pantalla y almacenarla con el nombre de archivo indicado. Todas las capturas de pantalla se almacenarán en el directorio `tests/Browser/screenshots`:

```php
$browser->screenshot('filename');
```

El método `responsiveScreenshots` se puede utilizar para realizar una serie de capturas de pantalla en varios puntos de quiebre:

```php
$browser->responsiveScreenshots('filename');
```

El método `screenshotElement` se puede utilizar para tomar una captura de pantalla de un elemento específico de la página:

```php
$browser->screenshotElement('#selector', 'filename');
```

<a id="storing-console-output-to-disk"></a>
### Almacenamiento de la salida de la consola en disco

Puedes utilizar el método `storeConsoleLog` para escribir la salida de la consola del navegador actual en el disco con el nombre de archivo proporcionado. La salida de la consola se almacenará en el directorio `tests/Browser/console`:

```php
$browser->storeConsoleLog('filename');
```

<a id="storing-page-source-to-disk"></a>
### Almacenamiento del código fuente de la página en disco

Puedes utilizar el método `storeSource` para escribir el código fuente de la página actual en el disco con el nombre de archivo proporcionado. El código fuente de la página se almacenará en el directorio `tests/Browser/source`:

```php
$browser->storeSource('filename');
```

<a id="interacting-with-elements"></a>
## Interacción con elementos

<a id="dusk-selectors"></a>
### Selectores de Dusk

Elegir buenos selectores de CSS para interactuar con elementos es una de las partes más difíciles de escribir pruebas de Dusk. Con el tiempo, los cambios en la interfaz pueden hacer que selectores de CSS como los siguientes interrumpan tus pruebas:

```html
// HTML...

<button>Login</button>
```

```php
// Test...

$browser->click('.login-page .container div > button');
```

Los selectores de Dusk te permiten concentrarte en escribir pruebas efectivas en lugar de recordar los selectores de CSS. Para definir un selector, agrega un atributo `dusk` a tu elemento HTML. Luego, al interactuar con un navegador Dusk, antepón `@` al selector para manipular el elemento adjunto dentro de tu prueba:

```html
// HTML...

<button dusk="login-button">Login</button>
```

```php
// Test...

$browser->click('@login-button');
```

Si lo deseas, puedes personalizar el atributo HTML que utiliza el selector Dusk mediante el método `selectorHtmlAttribute`. Normalmente, este método debe llamarse desde el método `boot` del `AppServiceProvider` de tu aplicación:

```php
use Laravel\Dusk\Dusk;

Dusk::selectorHtmlAttribute('data-dusk');
```

<a id="text-values-and-attributes"></a>
### Texto, valores y atributos

<a id="retrieving-setting-values"></a>
#### Recuperar y configurar valores

Dusk proporciona varios métodos para interactuar con el valor actual, el texto mostrado y los atributos de los elementos en la página. Por ejemplo, para obtener el "valor" de un elemento que coincide con un selector CSS o Dusk determinado, utiliza el método `value`:

```php
// Retrieve the value...
$value = $browser->value('selector');

// Set the value...
$browser->value('selector', 'value');
```

Puedes utilizar el método `inputValue` para obtener el "valor" de un elemento de entrada que tiene un nombre de campo determinado:

```php
$value = $browser->inputValue('field');
```

<a id="retrieving-text"></a>
#### Obtener texto

El método `text` se puede utilizar para recuperar el texto mostrado de un elemento que coincide con el selector dado:

```php
$text = $browser->text('selector');
```

<a id="retrieving-attributes"></a>
#### Obtener atributos

Finalmente, el método `attribute` se puede utilizar para recuperar el valor de un atributo de un elemento que coincida con el selector dado:

```php
$attribute = $browser->attribute('selector', 'value');
```

<a id="interacting-with-forms"></a>
### Interacción con formularios

<a id="typing-values"></a>
#### Escribir valores

Dusk proporciona una variedad de métodos para interactuar con formularios y elementos de entrada. Primero, veamos un ejemplo de cómo escribir texto en un campo de entrada:

```php
$browser->type('email', 'taylor@laravel.com');
```

Ten en cuenta que, aunque el método acepta uno si es necesario, no estamos obligados a pasar un selector CSS al método `type`. Si no se proporciona un selector de CSS, Dusk buscará un campo `input` o `textarea` con el atributo `name` dado.

Para agregar texto a un campo sin borrar su contenido, puedes usar el método `append`:

```php
$browser->type('tags', 'foo')
    ->append('tags', ', bar, baz');
```

Puedes borrar el valor de una entrada utilizando el método `clear`:

```php
$browser->clear('email');
```

Puedes indicarle a Dusk que escriba lentamente usando el método `typeSlowly`. De forma predeterminada, Dusk hará una pausa de 100 milisegundos entre pulsaciones de teclas. Para personalizar la cantidad de tiempo entre pulsaciones de teclas, puedes pasar la cantidad adecuada de milisegundos como tercer argumento del método:

```php
$browser->typeSlowly('mobile', '+1 (202) 555-5555');

$browser->typeSlowly('mobile', '+1 (202) 555-5555', 300);
```

Puedes utilizar el método `appendSlowly` para agregar texto lentamente:

```php
$browser->type('tags', 'foo')
    ->appendSlowly('tags', ', bar, baz');
```

<a id="dropdowns"></a>
#### Menús desplegables

Para seleccionar un valor disponible en un elemento `select`, puedes utilizar el método `select`. Al igual que el método `type`, el método `select` no requiere un selector CSS completo. Al pasar un valor al método `select`, debes pasar el valor de la opción subyacente en lugar del texto para mostrar:

```php
$browser->select('size', 'Large');
```

Puedes seleccionar una opción aleatoria omitiendo el segundo argumento:

```php
$browser->select('size');
```

Al proporcionar un array como segundo argumento del método `select`, puedes indicarle al método que seleccione múltiples opciones:

```php
$browser->select('categories', ['Art', 'Music']);
```

<a id="checkboxes"></a>
#### Casillas de verificación

Para "marcar" la entrada de una casilla de verificación, puedes utilizar el método `check`. Como muchos otros métodos relacionados con la entrada, no se requiere un selector CSS completo. Si no se puede encontrar una coincidencia del selector CSS, Dusk buscará una casilla de verificación con un atributo `name` coincidente:

```php
$browser->check('terms');
```

El método `uncheck` se puede utilizar para "desmarcar" una entrada de casilla de verificación:

```php
$browser->uncheck('terms');
```

<a id="radio-buttons"></a>
#### Botones de opción

Para "seleccionar" una opción de entrada `radio`, puedes utilizar el método `radio`. Como muchos otros métodos relacionados con la entrada, no se requiere un selector CSS completo. Si no se puede encontrar una coincidencia del selector CSS, Dusk buscará una entrada `radio` con los atributos `name` y `value` coincidentes:

```php
$browser->radio('size', 'large');
```

<a id="attaching-files"></a>
### Adjuntar archivos

El método `attach` se puede utilizar para adjuntar un archivo a un elemento de entrada `file`. Como muchos otros métodos relacionados con la entrada, no se requiere un selector CSS completo. Si no se puede encontrar una coincidencia del selector CSS, Dusk buscará una entrada `file` con un atributo `name` coincidente:

```php
$browser->attach('photo', __DIR__.'/photos/mountains.png');
```

> **Advertencia:**
> La función de adjuntar requiere que la extensión PHP `Zip` esté instalada y habilitada en tu servidor.

<a id="pressing-buttons"></a>
### Presionar botones

El método `press` se puede utilizar para hacer clic en un elemento de botón en la página. El argumento dado al método `press` puede ser el texto mostrado del botón o un selector CSS/Dusk:

```php
$browser->press('Login');
```

Al enviar formularios, muchas aplicaciones desactivan el botón de envío del formulario después de presionarlo y luego lo vuelven a activar cuando se completa la solicitud HTTP del envío del formulario. Para presionar un botón y esperar a que se vuelva a habilitar, puedes usar el método `pressAndWaitFor`:

```php
// Press the button and wait a maximum of 5 seconds for it to be enabled...
$browser->pressAndWaitFor('Save');

// Press the button and wait a maximum of 1 second for it to be enabled...
$browser->pressAndWaitFor('Save', 1);
```

<a id="clicking-links"></a>
### Hacer clic en enlaces

Para hacer clic en un enlace, puedes utilizar el método `clickLink` en la instancia del navegador. El método `clickLink` hará clic en el enlace que tiene el texto mostrado:

```php
$browser->clickLink($linkText);
```

Puedes utilizar el método `seeLink` para determinar si un enlace con el texto mostrado dado es visible en la página:

```php
if ($browser->seeLink($linkText)) {
    // ...
}
```

> **Advertencia:**
> Estos métodos interactúan con jQuery. Si jQuery no está disponible en la página, Dusk lo inyectará automáticamente en la página para que esté disponible durante la prueba.

<a id="using-the-keyboard"></a>
### Uso del teclado

El método `keys` te permite proporcionar secuencias de entrada más complejas a un elemento determinado de lo que normalmente permite el método `type`. Por ejemplo, puedes indicarle a Dusk que mantenga presionadas las teclas modificadoras mientras ingresas valores. En este ejemplo, la tecla `shift` se mantendrá presionada mientras se ingresa `taylor` en el elemento que coincide con el selector dado. Después de escribir `taylor`, se escribirá `swift` sin ninguna tecla modificadora:

```php
$browser->keys('selector', ['{shift}', 'taylor'], 'swift');
```

Otro caso de uso valioso para el método `keys` es enviar una combinación de "atajo de teclado" al selector CSS principal de tu aplicación:

```php
$browser->keys('.app', ['{command}', 'j']);
```

> **Nota:**
> Todas las teclas modificadoras, como `{command}`, están envueltas en caracteres `{}` y coinciden con las constantes definidas en la clase `Facebook\WebDriver\WebDriverKeys`, que se puede [encontrar en GitHub](https://github.com/php-webdriver/php-webdriver/blob/master/lib/WebDriverKeys.php).

<a id="fluent-keyboard-interactions"></a>
#### Interacciones fluidas con el teclado

Dusk también proporciona un método `withKeyboard`, que te permite realizar con fluidez interacciones complejas con el teclado a través de la clase `Laravel\Dusk\Keyboard`. La clase `Keyboard` proporciona los métodos `press`, `release`, `type` y `pause`:

```php
use Laravel\Dusk\Keyboard;

$browser->withKeyboard(function (Keyboard $keyboard) {
    $keyboard->press('c')
        ->pause(1000)
        ->release('c')
        ->type(['c', 'e', 'o']);
});
```

<a id="keyboard-macros"></a>
#### Macros de teclado

Si deseas definir interacciones de teclado personalizadas que puedas reutilizar fácilmente en todo tu conjunto de pruebas, puedes utilizar el método `macro` proporcionado por la clase `Keyboard`. Normalmente, debes llamar a este método desde el [método `boot` del proveedor de servicios](../providers/):

```php
<?php

namespace App\Providers;

use Facebook\WebDriver\WebDriverKeys;
use Illuminate\Support\ServiceProvider;
use Laravel\Dusk\Keyboard;
use Laravel\Dusk\OperatingSystem;

class DuskServiceProvider extends ServiceProvider
{
    /**
     * Register Dusk's browser macros.
     */
    public function boot(): void
    {
        Keyboard::macro('copy', function (string $element = null) {
            $this->type([
                OperatingSystem::onMac() ? WebDriverKeys::META : WebDriverKeys::CONTROL, 'c',
            ]);

            return $this;
        });

        Keyboard::macro('paste', function (string $element = null) {
            $this->type([
                OperatingSystem::onMac() ? WebDriverKeys::META : WebDriverKeys::CONTROL, 'v',
            ]);

            return $this;
        });
    }
}
```

El método `macro` acepta un nombre como primer argumento y una función anónima como segundo. La función anónima de la macro se ejecutará al llamar a la macro como método en una instancia `Keyboard`:

```php
$browser->click('@textarea')
    ->withKeyboard(fn (Keyboard $keyboard) => $keyboard->copy())
    ->click('@another-textarea')
    ->withKeyboard(fn (Keyboard $keyboard) => $keyboard->paste());
```

<a id="using-the-mouse"></a>
### Uso del ratón

<a id="clicking-on-elements"></a>
#### Hacer clic en elementos

El método `click` se puede utilizar para hacer clic en un elemento que coincida con el selector CSS o Dusk dado:

```php
$browser->click('.selector');
```

Se puede utilizar el método `clickAtXPath` para hacer clic en un elemento que coincida con la expresión XPath dada:

```php
$browser->clickAtXPath('//div[@class = "selector"]');
```

El método `clickAtPoint` se puede utilizar para hacer clic en el elemento superior en un par de coordenadas determinado en relación con el área visible del navegador:

```php
$browser->clickAtPoint($x = 0, $y = 0);
```

Se puede utilizar el método `doubleClick` para simular el doble clic de un ratón:

```php
$browser->doubleClick();

$browser->doubleClick('.selector');
```

El método `rightClick` se puede utilizar para simular el clic derecho de un ratón:

```php
$browser->rightClick();

$browser->rightClick('.selector');
```

El método `clickAndHold` se puede utilizar para simular que se hace clic y se mantiene presionado un botón del ratón. Una llamada posterior al método `releaseMouse` deshará este comportamiento y soltará el botón del ratón:

```php
$browser->clickAndHold('.selector');

$browser->clickAndHold()
    ->pause(1000)
    ->releaseMouse();
```

El método `controlClick` se puede utilizar para simular el evento `ctrl+click` dentro del navegador:

```php
$browser->controlClick();

$browser->controlClick('.selector');
```

Se puede utilizar el método `clickWhenVisible` o `clickWhenEnabled` para esperar a que un elemento esté listo antes de hacer clic en él exactamente una vez:

```php
$browser->clickWhenVisible('@save-button');
$browser->clickWhenEnabled('@submit-button');
```

<a id="mouseover"></a>
#### Pasar el ratón por encima

El método `mouseover` se puede utilizar cuando necesites mover el ratón sobre un elemento que coincida con el selector CSS o Dusk dado:

```php
$browser->mouseover('.selector');
```

<a id="drag-drop"></a>
#### Arrastrar y soltar

El método `drag` se puede utilizar para arrastrar un elemento que coincida con el selector dado a otro elemento:

```php
$browser->drag('.from-selector', '.to-selector');
```

O puedes arrastrar un elemento en una sola dirección:

```php
$browser->dragLeft('.selector', $pixels = 10);
$browser->dragRight('.selector', $pixels = 10);
$browser->dragUp('.selector', $pixels = 10);
$browser->dragDown('.selector', $pixels = 10);
```

Finalmente, puedes arrastrar un elemento según un desplazamiento determinado:

```php
$browser->dragOffset('.selector', $x = 10, $y = 10);
```

<a id="javascript-dialogs"></a>
### Diálogos de JavaScript

Dusk proporciona varios métodos para interactuar con los cuadros de diálogo de JavaScript. Por ejemplo, puedes utilizar el método `waitForDialog` para esperar a que aparezca un cuadro de diálogo de JavaScript. Este método acepta un argumento opcional que indica cuántos segundos esperar hasta que aparezca el cuadro de diálogo:

```php
$browser->waitForDialog($seconds = null);
```

El método `assertDialogOpened` se puede utilizar para verificar que se ha mostrado un cuadro de diálogo y contiene el mensaje dado:

```php
$browser->assertDialogOpened('Dialog message');
```

Si el cuadro de diálogo de JavaScript contiene un campo de entrada, puedes utilizar el método `typeInDialog` para escribir un valor en ese campo:

```php
$browser->typeInDialog('Hello World');
```

Para cerrar un cuadro de diálogo JavaScript abierto haciendo clic en el botón "Aceptar", puedes invocar el método `acceptDialog`:

```php
$browser->acceptDialog();
```

Para cerrar un cuadro de diálogo JavaScript abierto haciendo clic en el botón "Cancelar", puedes invocar el método `dismissDialog`:

```php
$browser->dismissDialog();
```

<a id="interacting-with-iframes"></a>
### Interactuar con marcos en línea

Si necesitas interactuar con elementos dentro de un iframe, puedes utilizar el método `withinFrame`. Todas las interacciones de elementos que tengan lugar dentro de la función anónima proporcionada al método `withinFrame` tendrán como ámbito el contexto del iframe especificado:

```php
$browser->withinFrame('#credit-card-details', function ($browser) {
    $browser->type('input[name="cardnumber"]', '4242424242424242')
        ->type('input[name="exp-date"]', '1224')
        ->type('input[name="cvc"]', '123')
        ->press('Pay');
});
```

<a id="scoping-selectors"></a>
### Ámbito de los selectores

A veces es posible que desees realizar varias operaciones limitando todas las operaciones dentro de un selector determinado. Por ejemplo, es posible que desees verificar que existe texto solo dentro de una tabla y luego hacer clic en un botón dentro de esa tabla. Puedes utilizar el método `with` para lograr esto. Todas las operaciones realizadas dentro de la función anónima dada al método `with` tendrán como alcance el selector original:

```php
$browser->with('.table', function (Browser $table) {
    $table->assertSee('Hello World')
        ->clickLink('Delete');
});
```

Es posible que en ocasiones necesites ejecutar aserciones fuera del alcance actual. Puedes utilizar los métodos `elsewhere` y `elsewhereWhenAvailable` para lograr esto:

```php
$browser->with('.table', function (Browser $table) {
    // Current scope is `body .table`...

    $browser->elsewhere('.page-title', function (Browser $title) {
        // Current scope is `body .page-title`...
        $title->assertSee('Hello World');
    });

    $browser->elsewhereWhenAvailable('.page-title', function (Browser $title) {
        // Current scope is `body .page-title`...
        $title->assertSee('Hello World');
    });
});
```

<a id="waiting-for-elements"></a>
### Espera de elementos

Cuando se prueban aplicaciones que utilizan JavaScript de manera extensiva, a menudo es necesario "esperar" a que ciertos elementos o datos estén disponibles antes de continuar con una prueba. Dusk facilita esta tarea. Utilizando una variedad de métodos, puedes esperar a que los elementos se vuelvan visibles en la página o incluso esperar hasta que una expresión JavaScript determinada se evalúe como `true`.

<a id="waiting"></a>
#### Espera

Si solo necesitas pausar la prueba durante un número determinado de milisegundos, utiliza el método `pause`:

```php
$browser->pause(1000);
```

Si necesitas pausar la prueba solo si una condición determinada es `true`, utiliza el método `pauseIf`:

```php
$browser->pauseIf(App::environment('production'), 1000);
```

Del mismo modo, si necesitas pausar la prueba a menos que una condición determinada sea `true`, puedes utilizar el método `pauseUnless`:

```php
$browser->pauseUnless(App::environment('testing'), 1000);
```

<a id="waiting-for-selectors"></a>
#### Espera de selectores

El método `waitFor` se puede utilizar para pausar la ejecución de la prueba hasta que el elemento que coincida con el selector CSS o Dusk dado se muestre en la página. De forma predeterminada, esto pausará la prueba durante un máximo de cinco segundos antes de generar una excepción. Si es necesario, puedes pasar un umbral de tiempo de espera personalizado como segundo argumento del método:

```php
// Wait a maximum of five seconds for the selector...
$browser->waitFor('.selector');

// Wait a maximum of one second for the selector...
$browser->waitFor('.selector', 1);
```

También puedes esperar hasta que el elemento que coincida con el selector dado contenga el texto dado:

```php
// Wait a maximum of five seconds for the selector to contain the given text...
$browser->waitForTextIn('.selector', 'Hello World');

// Wait a maximum of one second for the selector to contain the given text...
$browser->waitForTextIn('.selector', 'Hello World', 1);
```

También puedes esperar hasta que el elemento que coincida con el selector dado desaparezca de la página:

```php
// Wait a maximum of five seconds until the selector is missing...
$browser->waitUntilMissing('.selector');

// Wait a maximum of one second until the selector is missing...
$browser->waitUntilMissing('.selector', 1);
```

O puedes esperar hasta que el elemento que coincida con el selector dado esté habilitado o deshabilitado:

```php
// Wait a maximum of five seconds until the selector is enabled...
$browser->waitUntilEnabled('.selector');

// Wait a maximum of one second until the selector is enabled...
$browser->waitUntilEnabled('.selector', 1);

// Wait a maximum of five seconds until the selector is disabled...
$browser->waitUntilDisabled('.selector');

// Wait a maximum of one second until the selector is disabled...
$browser->waitUntilDisabled('.selector', 1);
```

<a id="scoping-selectors-when-available"></a>
#### Ámbito de los selectores cuando estén disponibles

En ocasiones, es posible que desees esperar a que aparezca un elemento que coincida con un selector determinado y luego interactuar con el elemento. Por ejemplo, es posible que desees esperar hasta que esté disponible una ventana modal y luego presionar el botón "Aceptar" dentro de la ventana modal. Se puede utilizar el método `whenAvailable` para lograr esto. Todas las operaciones de elementos realizadas dentro de la función anónima dada tendrán como alcance el selector original:

```php
$browser->whenAvailable('.modal', function (Browser $modal) {
    $modal->assertSee('Hello World')
        ->press('OK');
});
```

<a id="waiting-for-text"></a>
#### Espera de texto

El método `waitForText` se puede utilizar para esperar hasta que el texto dado se muestre en la página:

```php
// Wait a maximum of five seconds for the text...
$browser->waitForText('Hello World');

// Wait a maximum of one second for the text...
$browser->waitForText('Hello World', 1);
```

Puedes utilizar el método `waitUntilMissingText` para esperar hasta que el texto mostrado se haya eliminado de la página:

```php
// Wait a maximum of five seconds for the text to be removed...
$browser->waitUntilMissingText('Hello World');

// Wait a maximum of one second for the text to be removed...
$browser->waitUntilMissingText('Hello World', 1);
```

<a id="waiting-for-links"></a>
#### Espera de enlaces

El método `waitForLink` se puede utilizar para esperar hasta que el texto del enlace dado se muestre en la página:

```php
// Wait a maximum of five seconds for the link...
$browser->waitForLink('Create');

// Wait a maximum of one second for the link...
$browser->waitForLink('Create', 1);
```

<a id="waiting-for-inputs"></a>
#### Espera de campos de entrada

El método `waitForInput` se puede utilizar para esperar hasta que el campo de entrada dado esté visible en la página:

```php
// Wait a maximum of five seconds for the input...
$browser->waitForInput($field);

// Wait a maximum of one second for the input...
$browser->waitForInput($field, 1);
```

<a id="waiting-on-the-page-location"></a>
#### Espera de la ubicación de la página

Al realizar una aserción de ruta como `$browser->assertPathIs('/home')`, la aserción puede fallar si `window.location.pathname` se actualiza de forma asincrónica. Puedes utilizar el método `waitForLocation` para esperar a que la ubicación tenga un valor determinado:

```php
$browser->waitForLocation('/secret');
```

El método `waitForLocation` también se puede utilizar para esperar a que la ubicación de la ventana actual sea una URL completa:

```php
$browser->waitForLocation('https://example.com/path');
```

También puedes esperar por una [ubicación de ruta nombrada ](../routing/#named-routes):

```php
$browser->waitForRoute($routeName, $parameters);
```

<a id="waiting-for-page-reloads"></a>
#### Espera de recargas de página

Si necesitas esperar a que se vuelva a cargar una página después de realizar una acción, utiliza el método `waitForReload`:

```php
use Laravel\Dusk\Browser;

$browser->waitForReload(function (Browser $browser) {
    $browser->press('Submit');
})
->assertSee('Success!');
```

Dado que la necesidad de esperar a que la página se vuelva a cargar generalmente ocurre después de hacer clic en un botón, puedes usar el método `clickAndWaitForReload` por conveniencia:

```php
$browser->clickAndWaitForReload('.selector')
    ->assertSee('something');
```

<a id="waiting-on-javascript-expressions"></a>
#### Espera de expresiones de JavaScript

A veces es posible que desees pausar la ejecución de una prueba hasta que una expresión JavaScript determinada se evalúe como `true`. Puedes lograr esto fácilmente utilizando el método `waitUntil`. Al pasar una expresión a este método, no es necesario incluir la palabra clave `return` ni un punto y coma final:

```php
// Wait a maximum of five seconds for the expression to be true...
$browser->waitUntil('App.data.servers.length > 0');

// Wait a maximum of one second for the expression to be true...
$browser->waitUntil('App.data.servers.length > 0', 1);
```

<a id="waiting-on-vue-expressions"></a>
#### Espera de expresiones de Vue

Los métodos `waitUntilVue` y `waitUntilVueIsNot` se pueden usar para esperar hasta que un atributo de un [componente Vue](https://vuejs.org) tenga un valor determinado:

```php
// Wait until the component attribute contains the given value...
$browser->waitUntilVue('user.name', 'Taylor', '@user');

// Wait until the component attribute doesn't contain the given value...
$browser->waitUntilVueIsNot('user.name', null, '@user');
```

<a id="waiting-for-javascript-events"></a>
#### Espera de eventos de JavaScript

El método `waitForEvent` se puede utilizar para pausar la ejecución de una prueba hasta que ocurra un evento de JavaScript:

```php
$browser->waitForEvent('load');
```

El listener de eventos se vincula al alcance actual, que es el elemento `body` de forma predeterminada. Cuando se utiliza un selector con ámbito, el listener de eventos se vinculará al elemento coincidente:

```php
$browser->with('iframe', function (Browser $iframe) {
    // Wait for the iframe's load event...
    $iframe->waitForEvent('load');
});
```

También puedes proporcionar un selector como segundo argumento del método `waitForEvent` para vincular el listener de eventos a un elemento específico:

```php
$browser->waitForEvent('load', '.selector');
```

También puedes esperar eventos en los objetos `document` y `window`:

```php
// Wait until the document is scrolled...
$browser->waitForEvent('scroll', 'document');

// Wait a maximum of five seconds until the window is resized...
$browser->waitForEvent('resize', 'window', 5);
```

<a id="waiting-with-a-callback"></a>
#### Espera con un callback

Muchos de los métodos de "espera" en Dusk se basan en el método subyacente `waitUsing`. Puedes utilizar este método directamente para esperar a que una función anónima determinada devuelva `true`. El método `waitUsing` acepta el número máximo de segundos de espera, el intervalo en el que se debe evaluar la función anónima, la función anónima y un mensaje de error opcional:

```php
$browser->waitUsing(10, 1, function () use ($something) {
    return $something->isReady();
}, "Something wasn't ready in time.");
```

<a id="scrolling-an-element-into-view"></a>
### Desplazar un elemento a la vista

A veces es posible que no puedas hacer clic en un elemento porque está fuera del área visible del navegador. El método `scrollIntoView` desplazará la ventana del navegador hasta que el elemento en el selector dado esté dentro de la vista:

```php
$browser->scrollIntoView('.selector')
    ->click('.selector');
```

<a id="available-assertions"></a>
## Aserciones disponibles

Dusk proporciona una variedad de aserciones que puedes hacer sobre tu aplicación. Todas las aserciones disponibles están documentadas en la siguiente lista:

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

<div class="collection-method-list" markdown="1">

[assertTitle](#assert-title)
[assertTitleContains](#assert-title-contains)
[assertUrlIs](#assert-url-is)
[assertSchemeIs](#assert-scheme-is)
[assertSchemeIsNot](#assert-scheme-is-not)
[assertHostIs](#assert-host-is)
[assertHostIsNot](#assert-host-is-not)
[assertPortIs](#assert-port-is)
[assertPortIsNot](#assert-port-is-not)
[assertPathBeginsWith](#assert-path-begins-with)
[assertPathEndsWith](#assert-path-ends-with)
[assertPathContains](#assert-path-contains)
[assertPathIs](#assert-path-is)
[assertPathIsNot](#assert-path-is-not)
[assertRouteIs](#assert-route-is)
[assertQueryStringHas](#assert-query-string-has)
[assertQueryStringMissing](#assert-query-string-missing)
[assertFragmentIs](#assert-fragment-is)
[assertFragmentBeginsWith](#assert-fragment-begins-with)
[assertFragmentIsNot](#assert-fragment-is-not)
[assertHasCookie](#assert-has-cookie)
[assertHasPlainCookie](#assert-has-plain-cookie)
[assertCookieMissing](#assert-cookie-missing)
[assertPlainCookieMissing](#assert-plain-cookie-missing)
[assertCookieValue](#assert-cookie-value)
[assertPlainCookieValue](#assert-plain-cookie-value)
[assertSee](#assert-see)
[assertDontSee](#assert-dont-see)
[assertSeeIn](#assert-see-in)
[assertDontSeeIn](#assert-dont-see-in)
[assertSeeAnythingIn](#assert-see-anything-in)
[assertSeeNothingIn](#assert-see-nothing-in)
[assertCount](#assert-count)
[assertScript](#assert-script)
[assertSourceHas](#assert-source-has)
[assertSourceMissing](#assert-source-missing)
[assertSeeLink](#assert-see-link)
[assertDontSeeLink](#assert-dont-see-link)
[assertInputValue](#assert-input-value)
[assertInputValueIsNot](#assert-input-value-is-not)
[assertChecked](#assert-checked)
[assertNotChecked](#assert-not-checked)
[assertIndeterminate](#assert-indeterminate)
[assertRadioSelected](#assert-radio-selected)
[assertRadioNotSelected](#assert-radio-not-selected)
[assertSelected](#assert-selected)
[assertNotSelected](#assert-not-selected)
[assertSelectHasOptions](#assert-select-has-options)
[assertSelectMissingOptions](#assert-select-missing-options)
[assertSelectHasOption](#assert-select-has-option)
[assertSelectMissingOption](#assert-select-missing-option)
[assertValue](#assert-value)
[assertValueIsNot](#assert-value-is-not)
[assertAttribute](#assert-attribute)
[assertAttributeMissing](#assert-attribute-missing)
[assertAttributeContains](#assert-attribute-contains)
[assertAttributeDoesntContain](#assert-attribute-doesnt-contain)
[assertAriaAttribute](#assert-aria-attribute)
[assertDataAttribute](#assert-data-attribute)
[assertVisible](#assert-visible)
[assertPresent](#assert-present)
[assertNotPresent](#assert-not-present)
[assertMissing](#assert-missing)
[assertInputPresent](#assert-input-present)
[assertInputMissing](#assert-input-missing)
[assertDialogOpened](#assert-dialog-opened)
[assertEnabled](#assert-enabled)
[assertDisabled](#assert-disabled)
[assertButtonEnabled](#assert-button-enabled)
[assertButtonDisabled](#assert-button-disabled)
[assertFocused](#assert-focused)
[assertNotFocused](#assert-not-focused)
[assertAuthenticated](#assert-authenticated)
[assertGuest](#assert-guest)
[assertAuthenticatedAs](#assert-authenticated-as)
[assertVue](#assert-vue)
[assertVueIsNot](#assert-vue-is-not)
[assertVueContains](#assert-vue-contains)
[assertVueDoesntContain](#assert-vue-doesnt-contain)

</div>

<a id="assert-title"></a>
#### assertTitle

Verifica que el título de la página coincide con el texto proporcionado:

```php
$browser->assertTitle($title);
```

<a id="assert-title-contains"></a>
#### assertTitleContains

Verifica que el título de la página contiene el texto indicado:

```php
$browser->assertTitleContains($title);
```

<a id="assert-url-is"></a>
#### assertUrlIs

Verifica que la URL actual (sin la cadena de consulta) coincide con la cadena proporcionada:

```php
$browser->assertUrlIs($url);
```

<a id="assert-scheme-is"></a>
#### assertSchemeIs

Verifica que el esquema de URL actual coincide con el esquema dado:

```php
$browser->assertSchemeIs($scheme);
```

<a id="assert-scheme-is-not"></a>
#### assertSchemeIsNot

Verifica que el esquema de URL actual no coincide con el esquema dado:

```php
$browser->assertSchemeIsNot($scheme);
```

<a id="assert-host-is"></a>
#### assertHostIs

Verifica que el host URL actual coincide con el host dado:

```php
$browser->assertHostIs($host);
```

<a id="assert-host-is-not"></a>
#### assertHostIsNot

Verifica que el host URL actual no coincide con el host dado:

```php
$browser->assertHostIsNot($host);
```

<a id="assert-port-is"></a>
#### assertPortIs

Verifica que el puerto URL actual coincide con el puerto dado:

```php
$browser->assertPortIs($port);
```

<a id="assert-port-is-not"></a>
#### assertPortIsNot

Verifica que el puerto URL actual no coincide con el puerto dado:

```php
$browser->assertPortIsNot($port);
```

<a id="assert-path-begins-with"></a>
#### assertPathBeginsWith

Verifica que la ruta URL actual comienza con la ruta proporcionada:

```php
$browser->assertPathBeginsWith('/home');
```

<a id="assert-path-ends-with"></a>
#### assertPathEndsWith

Verifica que la ruta URL actual termina con la ruta proporcionada:

```php
$browser->assertPathEndsWith('/home');
```

<a id="assert-path-contains"></a>
#### assertPathContains

Verifica que la ruta URL actual contiene la ruta proporcionada:

```php
$browser->assertPathContains('/home');
```

<a id="assert-path-is"></a>
#### assertPathIs

Verifica que la ruta actual coincide con la ruta dada:

```php
$browser->assertPathIs('/home');
```

<a id="assert-path-is-not"></a>
#### assertPathIsNot

Verifica que la ruta actual no coincide con la ruta dada:

```php
$browser->assertPathIsNot('/home');
```

<a id="assert-route-is"></a>
#### assertRouteIs

Verifica que la URL actual coincide con la [URL de la ruta nombrada ](../routing/#named-routes) dada:

```php
$browser->assertRouteIs($name, $parameters);
```

<a id="assert-query-string-has"></a>
#### assertQueryStringHas

Verifica que el parámetro de cadena de consulta proporcionado está presente:

```php
$browser->assertQueryStringHas($name);
```

Verifica que el parámetro de cadena de consulta dado está presente y tiene un valor dado:

```php
$browser->assertQueryStringHas($name, $value);
```

<a id="assert-query-string-missing"></a>
#### assertQueryStringMissing

Verifica que falta el parámetro de cadena de consulta proporcionado:

```php
$browser->assertQueryStringMissing($name);
```

<a id="assert-fragment-is"></a>
#### assertFragmentIs

Verifica que el fragmento hash actual de la URL coincide con el fragmento dado:

```php
$browser->assertFragmentIs('anchor');
```

<a id="assert-fragment-begins-with"></a>
#### assertFragmentBeginsWith

Verifica que el fragmento hash actual de la URL comienza con el fragmento dado:

```php
$browser->assertFragmentBeginsWith('anchor');
```

<a id="assert-fragment-is-not"></a>
#### assertFragmentIsNot

Verifica que el fragmento hash actual de la URL no coincide con el fragmento dado:

```php
$browser->assertFragmentIsNot('anchor');
```

<a id="assert-has-cookie"></a>
#### assertHasCookie

Verifica que la cookie cifrada proporcionada está presente:

```php
$browser->assertHasCookie($name);
```

<a id="assert-has-plain-cookie"></a>
#### assertHasPlainCookie

Verifica que la cookie no cifrada proporcionada está presente:

```php
$browser->assertHasPlainCookie($name);
```

<a id="assert-cookie-missing"></a>
#### assertCookieMissing

Verifica que la cookie cifrada proporcionada no está presente:

```php
$browser->assertCookieMissing($name);
```

<a id="assert-plain-cookie-missing"></a>
#### assertPlainCookieMissing

Verifica que la cookie no cifrada proporcionada no está presente:

```php
$browser->assertPlainCookieMissing($name);
```

<a id="assert-cookie-value"></a>
#### assertCookieValue

Verifica que una cookie cifrada tiene un valor determinado:

```php
$browser->assertCookieValue($name, $value);
```

<a id="assert-plain-cookie-value"></a>
#### assertPlainCookieValue

Verifica que una cookie no cifrada tiene un valor determinado:

```php
$browser->assertPlainCookieValue($name, $value);
```

<a id="assert-see"></a>
#### assertSee

Verifica que el texto dado está presente en la página:

```php
$browser->assertSee($text);
```

<a id="assert-dont-see"></a>
#### assertDontSee

Verifica que el texto proporcionado no está presente en la página:

```php
$browser->assertDontSee($text);
```

<a id="assert-see-in"></a>
#### assertSeeIn

Verifica que el texto dado está presente dentro del selector:

```php
$browser->assertSeeIn($selector, $text);
```

<a id="assert-dont-see-in"></a>
#### assertDontSeeIn

Verifica que el texto proporcionado no está presente en el selector:

```php
$browser->assertDontSeeIn($selector, $text);
```

<a id="assert-see-anything-in"></a>
#### assertSeeAnythingIn

Verifica que cualquier texto está presente dentro del selector:

```php
$browser->assertSeeAnythingIn($selector);
```

<a id="assert-see-nothing-in"></a>
#### assertSeeNothingIn

Verifica que no hay ningún texto presente dentro del selector:

```php
$browser->assertSeeNothingIn($selector);
```

<a id="assert-count"></a>
#### assertCount

Verifica que los elementos que coinciden con el selector dado aparecen el número de veces especificado:

```php
$browser->assertCount($selector, $count);
```

<a id="assert-script"></a>
#### assertScript

Verifica que la expresión JavaScript dada se evalúa como el valor dado:

```php
$browser->assertScript('window.isLoaded')
    ->assertScript('document.readyState', 'complete');
```

<a id="assert-source-has"></a>
#### assertSourceHas

Verifica que el código fuente proporcionado está presente en la página:

```php
$browser->assertSourceHas($code);
```

<a id="assert-source-missing"></a>
#### assertSourceMissing

Verifica que el código fuente proporcionado no está presente en la página:

```php
$browser->assertSourceMissing($code);
```

<a id="assert-see-link"></a>
#### assertSeeLink

Verifica que el enlace proporcionado está presente en la página:

```php
$browser->assertSeeLink($linkText);
```

<a id="assert-dont-see-link"></a>
#### assertDontSeeLink

Verifica que el enlace proporcionado no está presente en la página:

```php
$browser->assertDontSeeLink($linkText);
```

<a id="assert-input-value"></a>
#### assertInputValue

Verifica que el campo de entrada dado tiene el valor dado:

```php
$browser->assertInputValue($field, $value);
```

<a id="assert-input-value-is-not"></a>
#### assertInputValueIsNot

Verifica que el campo de entrada dado no tiene el valor dado:

```php
$browser->assertInputValueIsNot($field, $value);
```

<a id="assert-checked"></a>
#### assertChecked

Verifica que la casilla de verificación dada está marcada:

```php
$browser->assertChecked($field);
```

<a id="assert-not-checked"></a>
#### assertNotChecked

Verifica que la casilla de verificación dada no está marcada:

```php
$browser->assertNotChecked($field);
```

<a id="assert-indeterminate"></a>
#### assertIndeterminate

Verifica que la casilla de verificación dada está en un estado indeterminado:

```php
$browser->assertIndeterminate($field);
```

<a id="assert-radio-selected"></a>
#### assertRadioSelected

Verifica que el campo de radio dado está seleccionado:

```php
$browser->assertRadioSelected($field, $value);
```

<a id="assert-radio-not-selected"></a>
#### assertRadioNotSelected

Verifica que el campo de radio dado no está seleccionado:

```php
$browser->assertRadioNotSelected($field, $value);
```

<a id="assert-selected"></a>
#### assertSelected

Verifica que el menú desplegable dado tiene seleccionado el valor dado:

```php
$browser->assertSelected($field, $value);
```

<a id="assert-not-selected"></a>
#### assertNotSelected

Verifica que el menú desplegable dado no tiene seleccionado el valor dado:

```php
$browser->assertNotSelected($field, $value);
```

<a id="assert-select-has-options"></a>
#### assertSelectHasOptions

Verifica que el array de valores dado está disponible para ser seleccionado:

```php
$browser->assertSelectHasOptions($field, $values);
```

<a id="assert-select-missing-options"></a>
#### assertSelectMissingOptions

Verifica que el array de valores dado no está disponible para ser seleccionado:

```php
$browser->assertSelectMissingOptions($field, $values);
```

<a id="assert-select-has-option"></a>
#### assertSelectHasOption

Verifica que el valor dado está disponible para ser seleccionado en el campo dado:

```php
$browser->assertSelectHasOption($field, $value);
```

<a id="assert-select-missing-option"></a>
#### assertSelectMissingOption

Verifica que el valor dado no está disponible para ser seleccionado:

```php
$browser->assertSelectMissingOption($field, $value);
```

<a id="assert-value"></a>
#### assertValue

Verifica que el elemento que coincide con el selector dado tiene el valor dado:

```php
$browser->assertValue($selector, $value);
```

<a id="assert-value-is-not"></a>
#### assertValueIsNot

Verifica que el elemento que coincide con el selector dado no tiene el valor dado:

```php
$browser->assertValueIsNot($selector, $value);
```

<a id="assert-attribute"></a>
#### assertAttribute

Verifica que el elemento que coincide con el selector dado tiene el valor dado en el atributo proporcionado:

```php
$browser->assertAttribute($selector, $attribute, $value);
```

<a id="assert-attribute-missing"></a>
#### assertAttributeMissing

Verifica que al elemento que coincide con el selector dado le falta el atributo proporcionado:

```php
$browser->assertAttributeMissing($selector, $attribute);
```

<a id="assert-attribute-contains"></a>
#### assertAttributeContains

Verifica que el elemento que coincide con el selector dado contiene el valor dado en el atributo proporcionado:

```php
$browser->assertAttributeContains($selector, $attribute, $value);
```

<a id="assert-attribute-doesnt-contain"></a>
#### assertAttributeDoesntContain

Verifica que el elemento que coincide con el selector dado no contiene el valor dado en el atributo proporcionado:

```php
$browser->assertAttributeDoesntContain($selector, $attribute, $value);
```

<a id="assert-aria-attribute"></a>
#### assertAriaAttribute

Verifica que el elemento que coincide con el selector dado tiene el valor dado en el atributo aria proporcionado:

```php
$browser->assertAriaAttribute($selector, $attribute, $value);
```

Por ejemplo, dado el marcado `<button aria-label="Add"></button>`, puedes hacer aserciones sobre el atributo `aria-label` de la siguiente manera:

```php
$browser->assertAriaAttribute('button', 'label', 'Add');
```

<a id="assert-data-attribute"></a>
#### assertDataAttribute

Verifica que el elemento que coincide con el selector dado tiene el valor dado en el atributo de datos proporcionado:

```php
$browser->assertDataAttribute($selector, $attribute, $value);
```

Por ejemplo, dado el marcado `<tr id="row-1" data-content="attendees"></tr>`, puedes hacer aserciones sobre el atributo `data-content` de la siguiente manera:

```php
$browser->assertDataAttribute('#row-1', 'content', 'attendees');
```

<a id="assert-visible"></a>
#### assertVisible

Verifica que el elemento que coincide con el selector dado es visible:

```php
$browser->assertVisible($selector);
```

<a id="assert-present"></a>
#### assertPresent

Verifica que el elemento que coincide con el selector dado está presente en el código fuente:

```php
$browser->assertPresent($selector);
```

<a id="assert-not-present"></a>
#### assertNotPresent

Verifica que el elemento que coincide con el selector dado no está presente en el código fuente:

```php
$browser->assertNotPresent($selector);
```

<a id="assert-missing"></a>
#### assertMissing

Verifica que el elemento que coincide con el selector dado no es visible:

```php
$browser->assertMissing($selector);
```

<a id="assert-input-present"></a>
#### assertInputPresent

Verifica que una entrada con el nombre indicado está presente:

```php
$browser->assertInputPresent($name);
```

<a id="assert-input-missing"></a>
#### assertInputMissing

Verifica que una entrada con el nombre indicado no está presente en el código fuente:

```php
$browser->assertInputMissing($name);
```

<a id="assert-dialog-opened"></a>
#### assertDialogOpened

Verifica que se ha abierto un cuadro de diálogo de JavaScript con el mensaje dado:

```php
$browser->assertDialogOpened($message);
```

<a id="assert-enabled"></a>
#### assertEnabled

Verifica que el campo dado está habilitado:

```php
$browser->assertEnabled($field);
```

<a id="assert-disabled"></a>
#### assertDisabled

Verifica que el campo dado está deshabilitado:

```php
$browser->assertDisabled($field);
```

<a id="assert-button-enabled"></a>
#### assertButtonEnabled

Verifica que el botón dado está habilitado:

```php
$browser->assertButtonEnabled($button);
```

<a id="assert-button-disabled"></a>
#### assertButtonDisabled

Verifica que el botón dado está deshabilitado:

```php
$browser->assertButtonDisabled($button);
```

<a id="assert-focused"></a>
#### assertFocused

Verifica que el campo dado está enfocado:

```php
$browser->assertFocused($field);
```

<a id="assert-not-focused"></a>
#### assertNotFocused

Verifica que el campo dado no está enfocado:

```php
$browser->assertNotFocused($field);
```

<a id="assert-authenticated"></a>
#### assertAuthenticated

Verifica que el usuario está autenticado:

```php
$browser->assertAuthenticated();
```

<a id="assert-guest"></a>
#### assertGuest

Verifica que el usuario no está autenticado:

```php
$browser->assertGuest();
```

<a id="assert-authenticated-as"></a>
#### assertAuthenticatedAs

Verifica que el usuario está autenticado como el usuario indicado:

```php
$browser->assertAuthenticatedAs($user);
```

<a id="assert-vue"></a>
#### assertVue

Dusk incluso te permite hacer aserciones sobre el estado de los datos del [componente Vue](https://vuejs.org). Por ejemplo, imagina que tu aplicación contiene el siguiente componente de Vue:

    // HTML...

    <profile dusk="profile-component"></profile>

    // Component Definition...

    Vue.component('profile', {
        template: '<div>{{ user.name }}</div>',

        data: function () {
            return {
                user: {
                    name: 'Taylor'
                }
            };
        }
    });

Puedes verificar el estado del componente Vue de esta manera:

```php tab=Pest
test('vue', function () {
    $this->browse(function (Browser $browser) {
        $browser->visit('/')
            ->assertVue('user.name', 'Taylor', '@profile-component');
    });
});
```

```php tab=PHPUnit
/**
 * A basic Vue test example.
 */
public function test_vue(): void
{
    $this->browse(function (Browser $browser) {
        $browser->visit('/')
            ->assertVue('user.name', 'Taylor', '@profile-component');
    });
}
```

<a id="assert-vue-is-not"></a>
#### assertVueIsNot

Verifica que una propiedad de datos determinada de un componente de Vue no coincide con el valor dado:

```php
$browser->assertVueIsNot($property, $value, $componentSelector = null);
```

<a id="assert-vue-contains"></a>
#### assertVueContains

Verifica que una propiedad de datos determinada de un componente de Vue es un array y contiene el valor dado:

```php
$browser->assertVueContains($property, $value, $componentSelector = null);
```

<a id="assert-vue-doesnt-contain"></a>
#### assertVueDoesntContain

Verifica que una propiedad de datos determinada de un componente de Vue es un array y no contiene el valor dado:

```php
$browser->assertVueDoesntContain($property, $value, $componentSelector = null);
```

<a id="pages"></a>
## Páginas

A veces, las pruebas requieren la realización secuencial de varias acciones complicadas. Esto puede hacer que tus pruebas sean más difíciles de leer y comprender. Dusk Pages te permite definir acciones expresivas que luego se pueden realizar en una página determinada mediante un único método. Las páginas también te permiten definir accesos directos a selectores comunes para tu aplicación o para una sola página.

<a id="generating-pages"></a>
### Generación de páginas

Para generar un objeto de página, ejecuta el comando de Artisan `dusk:page`. Todos los objetos de la página se colocarán en el directorio `tests/Browser/Pages` de tu aplicación:

```shell
php artisan dusk:page Login
```

<a id="configuring-pages"></a>
### Configuración de páginas

De forma predeterminada, las páginas tienen tres métodos: `url`, `assert` y `elements`. Ahora analizaremos los métodos `url` y `assert`. El método `elements` se [explicará con más detalle a continuación](#shorthand-selectors).

<a id="the-url-method"></a>
#### El método `url`

El método `url` debería devolver la ruta de la URL que representa la página. Dusk utilizará esta URL cuando navegues a la página en el navegador:

```php
/**
 * Get the URL for the page.
 */
public function url(): string
{
    return '/login';
}
```

<a id="the-assert-method"></a>
#### El método `assert`

El método `assert` puede realizar las aserciones necesarias para verificar que el navegador se encuentra realmente en la página determinada. En realidad, no es necesario colocar nada dentro de este método; sin embargo, puedes hacer estas aserciones si lo deseas. Estas aserciones se ejecutarán automáticamente al navegar a la página:

```php
/**
 * Assert that the browser is on the page.
 */
public function assert(Browser $browser): void
{
    $browser->assertPathIs($this->url());
}
```

<a id="navigating-to-pages"></a>
### Navegación a páginas

Una vez que se ha definido una página, puedes navegar hasta ella utilizando el método `visit`:

```php
use Tests\Browser\Pages\Login;

$browser->visit(new Login);
```

A veces, es posible que ya estés en una página determinada y necesites "cargar" los selectores y métodos de la página en el contexto de prueba actual. Esto es común cuando se presiona un botón y se te redirige a una página determinada sin navegar explícitamente hacia ella. En esta situación, puedes utilizar el método `on` para cargar la página:

```php
use Tests\Browser\Pages\CreatePlaylist;

$browser->visit('/dashboard')
    ->clickLink('Create Playlist')
    ->on(new CreatePlaylist)
    ->assertSee('@create');
```

<a id="shorthand-selectors"></a>
### Selectores abreviados

El método `elements` dentro de las clases de página te permite definir accesos directos rápidos y fáciles de recordar para cualquier selector de CSS en tu página. Por ejemplo, definamos un acceso directo para el campo de entrada "correo electrónico" de la página de inicio de sesión de la aplicación:

```php
/**
 * Get the element shortcuts for the page.
 *
 * @return array<string, string>
 */
public function elements(): array
{
    return [
        '@email' => 'input[name=email]',
    ];
}
```

Una vez que se haya definido el acceso directo, puedes usar el selector abreviado en cualquier lugar donde normalmente usarías un selector CSS completo:

```php
$browser->type('@email', 'taylor@laravel.com');
```

<a id="global-shorthand-selectors"></a>
#### Selectores abreviados globales

Después de instalar Dusk, se colocará una clase base `Page` en tu directorio `tests/Browser/Pages`. Esta clase contiene un método `siteElements` que puede usarse para definir selectores abreviados globales que deberían estar disponibles en todas las páginas de tu aplicación:

```php
/**
 * Get the global element shortcuts for the site.
 *
 * @return array<string, string>
 */
public static function siteElements(): array
{
    return [
        '@element' => '#selector',
    ];
}
```

<a id="page-methods"></a>
### Métodos de página

Además de los métodos predeterminados definidos en las páginas, puedes definir métodos adicionales que pueden usarse durante tus pruebas. Por ejemplo, imaginemos que estamos creando una aplicación de gestión de música. Una acción común para una página de la aplicación podría ser crear una lista de reproducción. En lugar de reescribir la lógica para crear una lista de reproducción en cada prueba, puedes definir un método `createPlaylist` en una clase de página:

```php
<?php

namespace Tests\Browser\Pages;

use Laravel\Dusk\Browser;
use Laravel\Dusk\Page;

class Dashboard extends Page
{
    // Other page methods...

    /**
     * Create a new playlist.
     */
    public function createPlaylist(Browser $browser, string $name): void
    {
        $browser->type('name', $name)
            ->check('share')
            ->press('Create Playlist');
    }
}
```

Una vez que se haya definido el método, podrás usarlo dentro de cualquier prueba que utilice la página. La instancia del navegador se pasará automáticamente como primer argumento a los métodos de página personalizados:

```php
use Tests\Browser\Pages\Dashboard;

$browser->visit(new Dashboard)
    ->createPlaylist('My Playlist')
    ->assertSee('My Playlist');
```

<a id="components"></a>
## Componentes

Los componentes son similares a los "objetos de página" de Dusk, pero están destinados a partes de la interfaz de usuario y funcionalidades que se reutilizan en toda tu aplicación, como una barra de navegación o una ventana de notificación. Por ello, los componentes no están vinculados a URL específicas.

<a id="generating-components"></a>
### Generación de componentes

Para generar un componente, ejecuta el comando de Artisan `dusk:component`. Los nuevos componentes se colocan en el directorio `tests/Browser/Components`:

```shell
php artisan dusk:component DatePicker
```

Como se muestra arriba, un "selector de fecha" es un ejemplo de un componente que podría existir en toda tu aplicación en una variedad de páginas. Puede resultar engorroso escribir manualmente la lógica de automatización del navegador para seleccionar una fecha en docenas de pruebas en todo tu conjunto de pruebas. En su lugar, podemos definir un componente de Dusk para representar el selector de fecha, permitiéndonos encapsular esa lógica dentro del componente:

```php
<?php

namespace Tests\Browser\Components;

use Laravel\Dusk\Browser;
use Laravel\Dusk\Component as BaseComponent;

class DatePicker extends BaseComponent
{
    /**
     * Get the root selector for the component.
     */
    public function selector(): string
    {
        return '.date-picker';
    }

    /**
     * Assert that the browser page contains the component.
     */
    public function assert(Browser $browser): void
    {
        $browser->assertVisible($this->selector());
    }

    /**
     * Get the element shortcuts for the component.
     *
     * @return array<string, string>
     */
    public function elements(): array
    {
        return [
            '@date-field' => 'input.datepicker-input',
            '@year-list' => 'div > div.datepicker-years',
            '@month-list' => 'div > div.datepicker-months',
            '@day-list' => 'div > div.datepicker-days',
        ];
    }

    /**
     * Select the given date.
     */
    public function selectDate(Browser $browser, int $year, int $month, int $day): void
    {
        $browser->click('@date-field')
            ->within('@year-list', function (Browser $browser) use ($year) {
                $browser->click($year);
            })
            ->within('@month-list', function (Browser $browser) use ($month) {
                $browser->click($month);
            })
            ->within('@day-list', function (Browser $browser) use ($day) {
                $browser->click($day);
            });
    }
}
```

<a id="using-components"></a>
### Uso de componentes

Una vez definido el componente, podemos seleccionar fácilmente una fecha dentro del selector de fechas de cualquier prueba. Y, si cambia la lógica necesaria para seleccionar una fecha, solo necesitamos actualizar el componente:

```php tab=Pest
<?php

use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\Browser\Components\DatePicker;

pest()->use(DatabaseMigrations::class);

test('basic example', function () {
    $this->browse(function (Browser $browser) {
        $browser->visit('/')
            ->within(new DatePicker, function (Browser $browser) {
                $browser->selectDate(2019, 1, 30);
            })
            ->assertSee('January');
    });
});
```

```php tab=PHPUnit
<?php

namespace Tests\Browser;

use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\Browser\Components\DatePicker;
use Tests\DuskTestCase;

class ExampleTest extends DuskTestCase
{
    /**
     * A basic component test example.
     */
    public function test_basic_example(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/')
                ->within(new DatePicker, function (Browser $browser) {
                    $browser->selectDate(2019, 1, 30);
                })
                ->assertSee('January');
        });
    }
}
```

El método `component` se puede utilizar para recuperar una instancia del navegador cuyo ámbito es el componente dado:

```php
$datePicker = $browser->component(new DatePickerComponent);

$datePicker->selectDate(2019, 1, 30);

$datePicker->assertSee('January');
```

<a id="continuous-integration"></a>
## Integración continua

> **Advertencia:**
> La mayoría de las configuraciones de integración continua de Dusk esperan que tu aplicación Laravel se sirva utilizando el servidor de desarrollo PHP integrado en el puerto 8000. Por lo tanto, antes de continuar, debes asegurarte de que tu entorno de integración continua tenga un valor de variable de entorno `APP_URL` de `http://127.0.0.1:8000`.

<a id="running-tests-on-heroku-ci"></a>
### Heroku CI

Para ejecutar pruebas de Dusk en [Heroku CI](https://www.heroku.com/continuous-integration), agrega el siguiente paquete de compilación y scripts de Google Chrome a tu archivo de Heroku `app.json`:

```json
{
  "environments": {
    "test": {
      "buildpacks": [
        { "url": "heroku/php" },
        { "url": "https://github.com/heroku/heroku-buildpack-chrome-for-testing" }
      ],
      "scripts": {
        "test-setup": "cp .env.testing .env",
        "test": "nohup bash -c './vendor/laravel/dusk/bin/chromedriver-linux --port=9515 > /dev/null 2>&1 &' && nohup bash -c 'php artisan serve --no-reload > /dev/null 2>&1 &' && php artisan dusk"
      }
    }
  }
}
```

<a id="running-tests-on-travis-ci"></a>
### Travis CI

Para ejecutar tus pruebas de Dusk en [Travis CI](https://travis-ci.org), usa la siguiente configuración `.travis.yml`. Dado que Travis CI no es un entorno gráfico, necesitaremos realizar algunos pasos adicionales para iniciar un navegador Chrome. Además, usaremos `php artisan serve` para iniciar el servidor web integrado de PHP:

```yaml
language: php

php:
  - 8.2

addons:
  chrome: stable

install:
  - cp .env.testing .env
  - travis_retry composer install --no-interaction --prefer-dist
  - php artisan key:generate
  - php artisan dusk:chrome-driver

before_script:
  - google-chrome-stable --headless --disable-gpu --remote-debugging-port=9222 http://localhost &
  - php artisan serve --no-reload &

script:
  - php artisan dusk
```

<a id="running-tests-on-github-actions"></a>
### GitHub Actions

Si estás utilizando [GitHub Actions](https://github.com/features/actions) para ejecutar tus pruebas de Dusk, puedes usar el siguiente archivo de configuración como punto de partida. Al igual que TravisCI, usaremos el comando `php artisan serve` para iniciar el servidor web integrado de PHP:

```yaml
name: CI
on: [push]
jobs:

  dusk-php:
    runs-on: ubuntu-latest
    env:
      APP_URL: "http://127.0.0.1:8000"
      DB_USERNAME: root
      DB_PASSWORD: root
      MAIL_MAILER: log
    steps:
      - uses: actions/checkout@v5
      - name: Prepare The Environment
        run: cp .env.example .env
      - name: Create Database
        run: |
          sudo systemctl start mysql
          mysql --user="root" --password="root" -e "CREATE DATABASE \`my-database\` character set UTF8mb4 collate utf8mb4_bin;"
      - name: Install Composer Dependencies
        run: composer install --no-progress --prefer-dist --optimize-autoloader
      - name: Generate Application Key
        run: php artisan key:generate
      - name: Upgrade Chrome Driver
        run: php artisan dusk:chrome-driver --detect
      - name: Start Chrome Driver
        run: ./vendor/laravel/dusk/bin/chromedriver-linux --port=9515 &
      - name: Run Laravel Server
        run: php artisan serve --no-reload &
      - name: Run Dusk Tests
        run: php artisan dusk
      - name: Upload Screenshots
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: screenshots
          path: tests/Browser/screenshots
      - name: Upload Console Logs
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: console
          path: tests/Browser/console
```

<a id="running-tests-on-chipper-ci"></a>
### Chipper CI

Si estás utilizando [Chipper CI](https://chipperci.com) para ejecutar tus pruebas de Dusk, puedes utilizar el siguiente archivo de configuración como punto de partida. Usaremos el servidor integrado de PHP para ejecutar Laravel y poder escuchar las solicitudes:

```yaml
# file .chipperci.yml
version: 1

environment:
  php: 8.2
  node: 16

# Include Chrome in the build environment
services:
  - dusk

# Build all commits
on:
   push:
      branches: .*

pipeline:
  - name: Setup
    cmd: |
      cp -v .env.example .env
      composer install --no-interaction --prefer-dist --optimize-autoloader
      php artisan key:generate

      # Create a dusk env file, ensuring APP_URL uses BUILD_HOST
      cp -v .env .env.dusk.ci
      sed -i "s@APP_URL=.*@APP_URL=http://$BUILD_HOST:8000@g" .env.dusk.ci

  - name: Compile Assets
    cmd: |
      npm ci --no-audit
      npm run build

  - name: Browser Tests
    cmd: |
      php -S [::0]:8000 -t public 2>server.log &
      sleep 2
      php artisan dusk:chrome-driver $CHROME_DRIVER
      php artisan dusk --env=ci
```

Para obtener más información sobre cómo ejecutar pruebas de Dusk en Chipper CI, incluido cómo usar bases de datos, consulta la [documentación oficial de Chipper CI](https://chipperci.com/docs/testing/laravel-dusk-new/).
