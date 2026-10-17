---
title: "Autenticación"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
    - [Kits de inicio](#starter-kits)
    - [Consideraciones sobre la base de datos](#introduction-database-considerations)
    - [Descripción general del ecosistema](#ecosystem-overview)
- [Inicio rápido de autenticación](#authentication-quickstart)
    - [Instalar un kit de inicio](#install-a-starter-kit)
    - [Recuperando el usuario autenticado](#retrieving-the-authenticated-user)
    - [Protegiendo Rutas](#protecting-routes)
    - [Limitación de inicio de sesión](#login-throttling)
- [Autenticación manual de usuarios](#authenticating-users)
    - [Recordando Usuarios](#remembering-users)
    - [Otros métodos de autenticación](#other-authentication-methods)
- [Autenticación básica HTTP](#http-basic-authentication)
    - [Autenticación básica HTTP sin estado](#stateless-http-basic-authentication)
- [Cerrar sesión](#logging-out)
    - [Invalidación de sesiones en otros dispositivos](#invalidating-sessions-on-other-devices)
- [Confirmación de contraseña](#password-confirmation)
    - [Configuración](#password-confirmation-configuration)
    - [Enrutamiento](#password-confirmation-routing)
    - [Protegiendo Rutas](#password-confirmation-protecting-routes)
- [Añadiendo guardias personalizados](#adding-custom-guards)
    - [Guardias de Solicitud de Cierre](#closure-request-guards)
- [Agregar proveedores de usuarios personalizados](#adding-custom-user-providers)
    - [El Contrato Usuario-Proveedor](#the-user-provider-contract)
    - [El Contrato Autenticable](#the-authenticatable-contract)
- [Repetición automática de contraseña](#automatic-password-rehashing)
- [Autenticación social](../socialite/)
- [Eventos](#events)

<a id="introduction"></a>
## Introducción

Muchas aplicaciones web ofrecen a sus usuarios una forma de autenticarse con la aplicación e "iniciar sesión". Implementar esta característica en aplicaciones web puede ser una tarea compleja y potencialmente riesgosa. Por esta razón, Laravel se esfuerza por brindarle las herramientas que necesita para implementar la autenticación de manera rápida, segura y sencilla.

En esencia, las instalaciones de autenticación de Laravel están compuestas por "guardias" y "proveedores". Los guardias definen cómo se autentican los usuarios para cada solicitud. Por ejemplo, Laravel se envía con una protección `session` que mantiene el estado mediante almacenamiento de sesión y cookies.

Los proveedores definen cómo se recuperan los usuarios de su almacenamiento persistente. Laravel incluye soporte para recuperar usuarios usando [Eloquent](../eloquent/) y el generador de consultas de base de datos. Sin embargo, usted es libre de definir proveedores adicionales según sea necesario para su aplicación.

El archivo de configuración de autenticación de su aplicación se encuentra en `config/auth.php`. Este archivo contiene varias opciones bien documentadas para modificar el comportamiento de los servicios de autenticación de Laravel.

> **Nota:**
> No se deben confundir los guardias y proveedores con "roles" y "permisos". Para obtener más información sobre cómo autorizar acciones de usuario mediante permisos, consulte la [documentación de autorización](../authorization/).

<a id="starter-kits"></a>
### Kits de inicio

¿Quieres empezar rápido? Instale un [kit de inicio de aplicación Laravel](../starter-kits/) en una aplicación Laravel nueva. Después de migrar su base de datos, navegue en su navegador hasta `/register` o cualquier otra URL asignada a su aplicación. ¡Los kits de inicio se encargarán de armar todo su sistema de autenticación!

**Incluso si elige no utilizar un kit de inicio en su aplicación final de Laravel, instalar un [kit de inicio](../starter-kits/) puede ser una maravillosa oportunidad para aprender cómo implementar todas las funciones de autenticación de Laravel en un proyecto de Laravel real.** Dado que los kits de inicio de Laravel contienen controladores, rutas y vistas de autenticación para usted, puede examinar el código dentro de estos archivos para aprender cómo se pueden implementar las funciones de autenticación de Laravel.

<a id="introduction-database-considerations"></a>
### Consideraciones sobre la base de datos

De forma predeterminada, Laravel incluye un `App\Models\User` [modelo Eloquent](../eloquent/) en su directorio `app/Models`. Este modelo se puede utilizar con el controlador de autenticación predeterminado de Eloquent.

Si su aplicación no utiliza Eloquent, puede utilizar el proveedor de autenticación `database` que utiliza el generador de consultas Laravel. Si su aplicación utiliza MongoDB, consulte la [documentación de autenticación de usuario de Laravel] oficial de MongoDB](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/user-authentication/).

Al crear el esquema de base de datos para el modelo `App\Models\User`, asegúrese de que la columna de contraseña tenga al menos 60 caracteres de longitud. Por supuesto, la migración de la tabla `users` que se incluye en las nuevas aplicaciones de Laravel ya crea una columna que excede esta longitud.

Además, debe verificar que su tabla `users` (o equivalente) contenga una columna de cadena `remember_token` que acepte valores NULL de 100 caracteres. Esta columna se utilizará para almacenar un token para los usuarios que seleccionen la opción "recordarme" al iniciar sesión en su aplicación. Nuevamente, la migración de tabla predeterminada `users` que se incluye en las nuevas aplicaciones de Laravel ya contiene esta columna.

<a id="ecosystem-overview"></a>
### Descripción general del ecosistema

Laravel ofrece varios paquetes relacionados con la autenticación. Antes de continuar, revisaremos el ecosistema de autenticación general en Laravel y discutiremos el propósito previsto de cada paquete.

Primero, considere cómo funciona la autenticación. Al utilizar un navegador web, el usuario proporcionará su nombre de usuario y contraseña a través de un formulario de inicio de sesión. Si estas credenciales son correctas, la aplicación almacenará información sobre el usuario autenticado en el archivo [session](../session/). Una cookie enviada al navegador contiene el ID de la sesión para que las solicitudes posteriores a la aplicación puedan asociar al usuario con la sesión correcta. Después de recibir la cookie de sesión, la aplicación recuperará los datos de la sesión según el ID de la sesión, tendrá en cuenta que la información de autenticación se ha almacenado en la sesión y considerará al usuario como "autenticado".

Cuando un servicio remoto necesita autenticarse para acceder a una API, normalmente no se utilizan cookies para la autenticación porque no hay un navegador web. En cambio, el servicio remoto envía un token API a la API en cada solicitud. La aplicación puede validar el token entrante con una tabla de tokens API válidos y "autenticar" la solicitud como realizada por el usuario asociado con ese token API.

<a id="laravels-built-in-browser-authentication-services"></a>
#### Servicios de autenticación del navegador integrados de Laravel

Laravel incluye servicios de sesión y autenticación integrados a los que normalmente se accede a través de las fachadas `Auth` y `Session`. Estas funciones proporcionan autenticación basada en cookies para solicitudes que se inician desde navegadores web. Proporcionan métodos que le permiten verificar las credenciales de un usuario y autenticarlo. Además, estos servicios almacenarán automáticamente los datos de autenticación adecuados en la sesión del usuario y emitirán la cookie de sesión del usuario. En esta documentación se incluye una explicación sobre cómo utilizar estos servicios.

**Kits de inicio de aplicación**

Como se analiza en esta documentación, puede interactuar con estos servicios de autenticación manualmente para crear la propia capa de autenticación de su aplicación. Sin embargo, para ayudarlo a comenzar más rápidamente, hemos lanzado [kits de inicio gratuitos](../starter-kits/) que brindan una estructura sólida y moderna de toda la capa de autenticación.

<a id="laravels-api-authentication-services"></a>
#### Servicios de autenticación API de Laravel

Laravel proporciona dos paquetes opcionales para ayudarle a administrar tokens API y autenticar solicitudes realizadas con tokens API: [Passport](../passport/) y [Sanctum](../sanctum/). Tenga en cuenta que estas bibliotecas y las bibliotecas de autenticación basadas en cookies integradas de Laravel no son mutuamente excluyentes. Estas bibliotecas se centran principalmente en la autenticación de tokens API, mientras que los servicios de autenticación integrados se centran en la autenticación del navegador basada en cookies. Muchas aplicaciones utilizarán tanto los servicios de autenticación basados ​​en cookies integrados de Laravel como uno de los paquetes de autenticación API de Laravel.

**Pasaporte**

Passport es un proveedor de autenticación OAuth2 que ofrece una variedad de "tipos de concesión" de OAuth2 que le permiten emitir varios tipos de tokens. En general, este es un paquete robusto y complejo para la autenticación API. Sin embargo, la mayoría de las aplicaciones no requieren las funciones complejas que ofrece la especificación OAuth2, lo que puede resultar confuso tanto para los usuarios como para los desarrolladores. Además, históricamente los desarrolladores han estado confundidos acerca de cómo autenticar aplicaciones SPA o aplicaciones móviles utilizando proveedores de autenticación OAuth2 como Passport.

**Santuario**

En respuesta a la complejidad de OAuth2 y la confusión de los desarrolladores, nos propusimos crear un paquete de autenticación más simple y optimizado que pudiera manejar tanto solicitudes web propias desde un navegador web como solicitudes API a través de tokens. Este objetivo se logró con el lanzamiento de [Laravel Sanctum](../sanctum/), que debe considerarse el paquete de autenticación preferido y recomendado para aplicaciones que ofrecerán una interfaz de usuario web propia además de una API, o que funcionarán con una aplicación de página única (SPA) que existe por separado de la aplicación backend de Laravel, o aplicaciones que ofrecen un cliente móvil.

Laravel Sanctum es un paquete de autenticación híbrido web/API que puede gestionar todo el proceso de autenticación de su aplicación. Esto es posible porque cuando las aplicaciones basadas en Sanctum reciben una solicitud, Sanctum primero determinará si la solicitud incluye una cookie de sesión que haga referencia a una sesión autenticada. Sanctum logra esto llamando a los servicios de autenticación integrados de Laravel que comentamos anteriormente. Si la solicitud no se autentica mediante una cookie de sesión, Sanctum inspeccionará la solicitud en busca de un token API. Si hay un token API presente, Sanctum autenticará la solicitud utilizando ese token. Para obtener más información sobre este proceso, consulte la documentación ](../sanctum/#how-it-works) de Sanctum ["cómo funciona".

<a id="summary-choosing-your-stack"></a>
#### Resumen y elección de su pila

En resumen, si se accederá a su aplicación mediante un navegador y está creando una aplicación Laravel monolítica, su aplicación utilizará los servicios de autenticación integrados de Laravel.

A continuación, si su aplicación ofrece una API que será consumida por terceros, podrá elegir entre [Passport](../passport/) o [Sanctum](../sanctum/) para proporcionar autenticación de token API para su aplicación. En general, se debe preferir Sanctum cuando sea posible, ya que es una solución simple y completa para la autenticación API, la autenticación SPA y la autenticación móvil, incluida la compatibilidad con "ámbitos" o "habilidades".

Si está creando una aplicación de una sola página (SPA) que funcionará con un backend de Laravel, debe usar [Laravel Sanctum](../sanctum/). Cuando utilice Sanctum, necesitará [implementar manualmente sus propias rutas de autenticación de backend](#authenticating-users) o utilizar [Laravel Fortify](../fortify/) como un servicio de autenticación sin cabeza que proporciona rutas y controladores para funciones como registro, restablecimiento de contraseña, verificación de correo electrónico y más.

Se puede elegir Passport cuando su aplicación necesita absolutamente todas las funciones proporcionadas por la especificación OAuth2. Además, si está creando un [servidor MCP](../mcp/) al que accederán los clientes AI, debe usar Passport, ya que los clientes MCP normalmente esperan [autenticarse usando OAuth](../mcp/#oauth).

Y, si desea comenzar rápidamente, nos complace recomendarle [nuestros kits de inicio de aplicaciones](../starter-kits/) como una forma rápida de iniciar una nueva aplicación Laravel que ya utiliza nuestra pila de autenticación preferida de los servicios de autenticación integrados de Laravel.

<a id="authentication-quickstart"></a>
## Inicio rápido de autenticación

> **Advertencia:**
> Esta parte de la documentación analiza la autenticación de usuarios a través de los [kits de inicio de aplicaciones Laravel](../starter-kits/), que incluyen andamios de interfaz de usuario para ayudarlo a comenzar rápidamente. Si desea integrarse directamente con los sistemas de autenticación de Laravel, consulte la documentación sobre [autenticación manual de usuarios](#authenticating-users).

<a id="install-a-starter-kit"></a>
### Instalar un kit de inicio

Primero, debes [instalar un kit de inicio de aplicación Laravel](../starter-kits/). Nuestros kits de inicio ofrecen puntos de partida bellamente diseñados para incorporar la autenticación en su nueva aplicación Laravel.

<a id="retrieving-the-authenticated-user"></a>
### Recuperando el usuario autenticado

Después de crear una aplicación a partir de un kit de inicio y permitir que los usuarios se registren y se autentiquen en su aplicación, a menudo necesitará interactuar con el usuario actualmente autenticado. Mientras maneja una solicitud entrante, puede acceder al usuario autenticado a través del método `user` de la fachada `Auth`:

```php
use Illuminate\Support\Facades\Auth;

// Retrieve the currently authenticated user...
$user = Auth::user();

// Retrieve the currently authenticated user's ID...
$id = Auth::id();
```

Alternativamente, una vez que un usuario está autenticado, puede acceder al usuario autenticado a través de una instancia `Illuminate\Http\Request`. Recuerde, las clases con sugerencias de tipo se inyectarán automáticamente en los métodos de su controlador. Al escribir el objeto `Illuminate\Http\Request`, puede obtener acceso conveniente al usuario autenticado desde cualquier método de controlador en su aplicación a través del método `user` de la solicitud:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class FlightController extends Controller
{
    /**
     * Update the flight information for an existing flight.
     */
    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        // ...

        return redirect('/flights');
    }
}
```

<a id="determining-if-the-current-user-is-authenticated"></a>
#### Determinar si el usuario actual está autenticado

Para determinar si el usuario que realiza la solicitud HTTP entrante está autenticado, puede utilizar el método `check` en la fachada `Auth`. Este método devolverá `true` si el usuario está autenticado:

```php
use Illuminate\Support\Facades\Auth;

if (Auth::check()) {
    // The user is logged in...
}
```

> **Nota:**
> Aunque es posible determinar si un usuario está autenticado utilizando el método `check`, normalmente utilizará un middleware para verificar que el usuario esté autenticado antes de permitirle acceder a determinadas rutas/controladores. Para obtener más información sobre esto, consulte la documentación sobre [protección de rutas](../authentication/#protecting-routes).

<a id="protecting-routes"></a>
### Proteger rutas

[El middleware de ruta ](../middleware/) se puede utilizar para permitir que solo los usuarios autenticados accedan a una ruta determinada. Laravel se envía con un middleware `auth`, que es un [alias de middleware](../middleware/#middleware-aliases) para la clase `Illuminate\Auth\Middleware\Authenticate`. Dado que Laravel ya tiene un alias interno para este middleware, todo lo que necesita hacer es adjuntar el middleware a una definición de ruta:

```php
Route::get('/flights', function () {
    // Only authenticated users may access this route...
})->middleware('auth');
```

<a id="redirecting-unauthenticated-users"></a>
#### Redireccionamiento de usuarios no autenticados

Cuando el middleware `auth` detecta un usuario no autenticado, lo redireccionará al `login` [llamado ruta](../routing/#named-routes). Puede modificar este comportamiento utilizando el método `redirectGuestsTo` dentro del archivo `bootstrap/app.php` de su aplicación:

```php
use Illuminate\Http\Request;

->withMiddleware(function (Middleware $middleware): void {
    $middleware->redirectGuestsTo('/login');

    // Using a closure...
    $middleware->redirectGuestsTo(fn (Request $request) => route('login'));
})
```

<a id="redirecting-authenticated-users"></a>
#### Redireccionamiento de usuarios autenticados

Cuando el middleware `guest` detecta un usuario autenticado, lo redireccionará a la ruta con nombre `dashboard` o `home`. Puede modificar este comportamiento utilizando el método `redirectUsersTo` dentro del archivo `bootstrap/app.php` de su aplicación:

```php
use Illuminate\Http\Request;

->withMiddleware(function (Middleware $middleware): void {
    $middleware->redirectUsersTo('/panel');

    // Using a closure...
    $middleware->redirectUsersTo(fn (Request $request) => route('panel'));
})
```

<a id="specifying-a-guard"></a>
#### Especificación de una guardia

Al adjuntar el middleware `auth` a una ruta, también puede especificar qué "guardia" se debe utilizar para autenticar al usuario. La protección especificada debe corresponder a una de las claves en la matriz `guards` de su archivo de configuración `auth.php`:

```php
Route::get('/flights', function () {
    // Only authenticated users may access this route...
})->middleware('auth:admin');
```

<a id="login-throttling"></a>
### Limitación de inicio de sesión

Si está utilizando uno de nuestros [kits de inicio de aplicaciones](../starter-kits/), la limitación de velocidad se aplicará automáticamente a los intentos de inicio de sesión. De forma predeterminada, el usuario no podrá iniciar sesión durante un minuto si no proporciona las credenciales correctas después de varios intentos. La limitación es exclusiva del nombre de usuario/dirección de correo electrónico del usuario y su dirección IP.

> **Nota:**
> Si desea limitar la velocidad de otras rutas en su aplicación, consulte la [documentación de limitación de velocidad](../routing/#rate-limiting).

<a id="authenticating-users"></a>
## Autenticar usuarios manualmente

No es necesario que utilice el andamio de autenticación incluido con los [kits de inicio de aplicaciones](../starter-kits/). Si decide no utilizar este andamio, deberá administrar la autenticación del usuario utilizando las clases de autenticación de Laravel directamente. ¡No te preocupes, es muy fácil!

Accederemos a los servicios de autenticación de Laravel a través de `Auth` [fachada](../facades/), por lo que tendremos que asegurarnos de importar la fachada `Auth` en la parte superior de la clase. A continuación, veamos el método `attempt`. El método `attempt` normalmente se usa para manejar los intentos de autenticación desde el formulario de "inicio de sesión" de su aplicación. Si la autenticación es exitosa, debe volver a generar la [session](../session/) del usuario para evitar la [session fixation](https://en.wikipedia.org/wiki/Session_fixation):

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    /**
     * Handle an authentication attempt.
     */
    public function authenticate(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();

            return redirect()->intended('dashboard');
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->onlyInput('email');
    }
}
```

El método `attempt` acepta una matriz de pares clave/valor como primer argumento. Los valores de la matriz se utilizarán para encontrar al usuario en la tabla de su base de datos. Entonces, en el ejemplo anterior, el usuario será recuperado por el valor de la columna `email`. Si se encuentra el usuario, la contraseña hash almacenada en la base de datos se comparará con el valor `password` pasado al método a través de la matriz. No debe aplicar hash al valor `password` de la solicitud entrante, ya que el marco automáticamente aplicará hash al valor antes de compararlo con la contraseña hash en la base de datos. Se iniciará una sesión autenticada para el usuario si las dos contraseñas hash coinciden.

Recuerde, los servicios de autenticación de Laravel recuperarán usuarios de su base de datos según la configuración de "proveedor" de su guardia de autenticación. En el archivo de configuración predeterminado `config/auth.php`, se especifica el proveedor de usuarios de Eloquent y se le indica que utilice el modelo `App\Models\User` al recuperar usuarios. Puede cambiar estos valores dentro de su archivo de configuración según las necesidades de su aplicación.

El método `attempt` devolverá `true` si la autenticación fue exitosa. De lo contrario, se devolverá `false`.

El método `intended` proporcionado por el redirector de Laravel redireccionará al usuario a la URL a la que intentaba acceder antes de ser interceptado por el middleware de autenticación. Se puede proporcionar un URI alternativo a este método en caso de que el destino previsto no esté disponible.

<a id="specifying-additional-conditions"></a>
#### Especificación de condiciones adicionales

Si lo desea, también puede agregar condiciones de consulta adicionales a la consulta de autenticación además del correo electrónico y la contraseña del usuario. Para lograr esto, simplemente podemos agregar las condiciones de consulta a la matriz pasada al método `attempt`. Por ejemplo, podemos verificar que el usuario esté marcado como "activo":

```php
if (Auth::attempt(['email' => $email, 'password' => $password, 'active' => 1])) {
    // Authentication was successful...
}
```

Para condiciones de consulta complejas, puede proporcionar un cierre en su conjunto de credenciales. Este cierre se invocará con la instancia de consulta, lo que le permitirá personalizar la consulta según las necesidades de su aplicación:

```php
use Illuminate\Database\Eloquent\Builder;

if (Auth::attempt([
    'email' => $email,
    'password' => $password,
    fn (Builder $query) => $query->has('activeSubscription'),
])) {
    // Authentication was successful...
}
```

> **Advertencia:**
> En estos ejemplos, `email` no es una opción obligatoria, simplemente se utiliza como ejemplo. Debe utilizar cualquier nombre de columna que corresponda a un "nombre de usuario" en la tabla de su base de datos.

El método `attemptWhen`, que recibe un cierre como segundo argumento, se puede utilizar para realizar una inspección más exhaustiva del usuario potencial antes de autenticarlo. El cierre recibe al usuario potencial y debe devolver `true` o `false` para indicar si el usuario puede estar autenticado:

```php
if (Auth::attemptWhen([
    'email' => $email,
    'password' => $password,
], function (User $user) {
    return $user->isNotBanned();
})) {
    // Authentication was successful...
}
```

<a id="accessing-specific-guard-instances"></a>
#### Acceso a instancias de guardia específicas

A través del método `guard` de la fachada `Auth`, puede especificar qué instancia de protección le gustaría utilizar al autenticar al usuario. Esto le permite administrar la autenticación para partes separadas de su aplicación utilizando tablas de usuario o modelos autentificables completamente separados.

El nombre de protección pasado al método `guard` debe corresponder a una de las protecciones configuradas en su archivo de configuración `auth.php`:

```php
if (Auth::guard('admin')->attempt($credentials)) {
    // ...
}
```

<a id="remembering-users"></a>
### Recordando a los usuarios

Muchas aplicaciones web incluyen una casilla de verificación "recordarme" en su formulario de inicio de sesión. Si desea proporcionar la funcionalidad "recordarme" en su aplicación, puede pasar un valor booleano como segundo argumento al método `attempt`.

Cuando este valor es `true`, Laravel mantendrá al usuario autenticado indefinidamente o hasta que cierre sesión manualmente. Su tabla `users` debe incluir la columna de cadena `remember_token`, que se utilizará para almacenar el token "recordarme". La migración de la tabla `users` incluida con las nuevas aplicaciones Laravel ya incluye esta columna:

```php
use Illuminate\Support\Facades\Auth;

if (Auth::attempt(['email' => $email, 'password' => $password], $remember)) {
    // The user is being remembered...
}
```

Si su aplicación ofrece la funcionalidad "recordarme", puede utilizar el método `viaRemember` para determinar si el usuario actualmente autenticado fue autenticado mediante la cookie "recordarme":

```php
use Illuminate\Support\Facades\Auth;

if (Auth::viaRemember()) {
    // ...
}
```

<a id="other-authentication-methods"></a>
### Otros métodos de autenticación

<a id="authenticate-a-user-instance"></a>
#### Autenticar una instancia de usuario

Si necesita configurar una instancia de usuario existente como el usuario actualmente autenticado, puede pasar la instancia de usuario al método `login` de la fachada `Auth`. La instancia de usuario proporcionada debe ser una implementación de `Illuminate\Contracts\Auth\Authenticatable` [contrato](../contracts/). El modelo `App\Models\User` incluido con Laravel ya implementa esta interfaz. Este método de autenticación es útil cuando ya tiene una instancia de usuario válida, como directamente después de que un usuario se registra en su aplicación:

```php
use Illuminate\Support\Facades\Auth;

Auth::login($user);
```

Puede pasar un valor booleano como segundo argumento al método `login`. Este valor indica si se desea la funcionalidad "recordarme" para la sesión autenticada. Recuerde, esto significa que la sesión quedará autenticada indefinidamente o hasta que el usuario cierre sesión manualmente en la aplicación:

```php
Auth::login($user, $remember = true);
```

Si es necesario, puede especificar una protección de autenticación antes de llamar al método `login`:

```php
Auth::guard('admin')->login($user);
```

<a id="authenticate-a-user-by-id"></a>
#### Autenticar a un usuario por ID

Para autenticar a un usuario utilizando la clave principal del registro de su base de datos, puede utilizar el método `loginUsingId`. Este método acepta la clave principal del usuario que desea autenticar:

```php
Auth::loginUsingId(1);
```

Puede pasar un valor booleano al argumento `remember` del método `loginUsingId`. Este valor indica si se desea la funcionalidad "recordarme" para la sesión autenticada. Recuerde, esto significa que la sesión quedará autenticada indefinidamente o hasta que el usuario cierre sesión manualmente en la aplicación:

```php
Auth::loginUsingId(1, remember: true);
```

<a id="authenticate-a-user-once"></a>
#### Autenticar a un usuario una vez

Puede utilizar el método `once` para autenticar a un usuario con la aplicación para una sola solicitud. No se utilizarán sesiones ni cookies al llamar a este método y no se enviará el evento `Login`:

```php
if (Auth::once($credentials)) {
    // ...
}
```

<a id="http-basic-authentication"></a>
## Autenticación básica HTTP

[Autenticación básica HTTP](https://en.wikipedia.org/wiki/Basic_access_authentication) proporciona una manera rápida de autenticar a los usuarios de su aplicación sin configurar una página de "inicio de sesión" dedicada. Para comenzar, adjunte el `auth.basic` [middleware](../middleware/) a una ruta. El middleware `auth.basic` se incluye con el marco Laravel, por lo que no es necesario definirlo:

```php
Route::get('/profile', function () {
    // Only authenticated users may access this route...
})->middleware('auth.basic');
```

Una vez que el middleware se haya adjuntado a la ruta, se le solicitarán automáticamente las credenciales cuando acceda a la ruta en su navegador. De forma predeterminada, el middleware `auth.basic` asumirá que la columna `email` en su tabla de base de datos `users` es el "nombre de usuario" del usuario.

<a id="a-note-on-fastcgi"></a>
#### Una nota sobre FastCGI

Si está utilizando [PHP FastCGI](https://www.php.net/manual/en/install.fpm.php) y Apache para servir su aplicación Laravel, es posible que la autenticación HTTP básica no funcione correctamente. Para corregir estos problemas, se pueden agregar las siguientes líneas al archivo `.htaccess` de su aplicación:

```apache
RewriteCond %{HTTP:Authorization} ^(.+)$
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
```

<a id="stateless-http-basic-authentication"></a>
### Autenticación básica HTTP sin estado

También puede utilizar la autenticación básica HTTP sin configurar una cookie de identificación de usuario en la sesión. Esto es principalmente útil si elige utilizar la autenticación HTTP para autenticar solicitudes en la API de su aplicación. Para lograr esto, [defina un middleware](../middleware/) que llame al método `onceBasic`. Si el método `onceBasic` no devuelve ninguna respuesta, la solicitud puede pasarse a la aplicación:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateOnceWithBasicAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        return Auth::onceBasic() ?: $next($request);
    }

}
```

A continuación, adjunte el middleware a una ruta:

```php
Route::get('/api/user', function () {
    // Only authenticated users may access this route...
})->middleware(AuthenticateOnceWithBasicAuth::class);
```

<a id="logging-out"></a>
## Cerrar sesión

Para cerrar la sesión de los usuarios manualmente en su aplicación, puede utilizar el método `logout` proporcionado por la fachada `Auth`. Esto eliminará la información de autenticación de la sesión del usuario para que las solicitudes posteriores no sean autenticadas.

Además de llamar al método `logout`, se recomienda invalidar la sesión del usuario y regenerar su [token CSRF](../csrf/). Después de cerrar la sesión del usuario, normalmente lo redirigiría a la raíz de su aplicación:

```php
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

/**
 * Log the user out of the application.
 */
public function logout(Request $request): RedirectResponse
{
    Auth::logout();

    $request->session()->invalidate();

    $request->session()->regenerateToken();

    return redirect('/');
}
```

<a id="invalidating-sessions-on-other-devices"></a>
### Invalidar sesiones en otros dispositivos

Laravel también proporciona un mecanismo para invalidar y "cerrar sesión" las sesiones de un usuario que están activas en otros dispositivos sin invalidar la sesión en su dispositivo actual. Esta función generalmente se utiliza cuando un usuario cambia o actualiza su contraseña y desea invalidar sesiones en otros dispositivos mientras mantiene autenticado el dispositivo actual.

Antes de comenzar, debe asegurarse de que el middleware `Illuminate\Session\Middleware\AuthenticateSession` esté incluido en las rutas que deben recibir autenticación de sesión. Normalmente, debe colocar este middleware en una definición de grupo de rutas para que pueda aplicarse a la mayoría de las rutas de su aplicación. De forma predeterminada, el middleware `AuthenticateSession` se puede adjuntar a una ruta utilizando `auth.session` [alias de middleware](../middleware/#middleware-aliases):

```php
Route::middleware(['auth', 'auth.session'])->group(function () {
    Route::get('/', function () {
        // ...
    });
});
```

Luego, puede utilizar el método `logoutOtherDevices` proporcionado por la fachada `Auth`. Este método requiere que el usuario confirme su contraseña actual, que su aplicación debe aceptar a través de un formulario de entrada:

```php
use Illuminate\Support\Facades\Auth;

Auth::logoutOtherDevices($currentPassword);
```

Cuando se invoca el método `logoutOtherDevices`, las otras sesiones del usuario se invalidarán por completo, lo que significa que se "desconectarán" de todos los guardias con los que fueron autenticados previamente.

<a id="password-confirmation"></a>
## Confirmación de contraseña

Mientras crea su aplicación, es posible que ocasionalmente tenga acciones que requieran que el usuario confirme su contraseña antes de realizar la acción o antes de que el usuario sea redirigido a un área confidencial de la aplicación. Laravel incluye middleware integrado para que este proceso sea muy sencillo. La implementación de esta característica requerirá que usted defina dos rutas: una ruta para mostrar una vista pidiendo al usuario que confirme su contraseña y otra ruta para confirmar que la contraseña es válida y redirigir al usuario a su destino previsto.

> **Nota:**
> La siguiente documentación analiza cómo integrarse directamente con las funciones de confirmación de contraseña de Laravel; sin embargo, si desea comenzar más rápidamente, los [kits de inicio de aplicaciones Laravel](../starter-kits/) incluyen soporte para esta función.

<a id="password-confirmation-configuration"></a>
### Configuración

Después de confirmar su contraseña, no se le pedirá al usuario que vuelva a confirmarla durante tres horas. Sin embargo, puede configurar el período de tiempo antes de que se le vuelva a solicitar al usuario su contraseña cambiando el valor de configuración `password_timeout` dentro del archivo de configuración `config/auth.php` de su aplicación.

<a id="password-confirmation-routing"></a>
### Enrutamiento

<a id="the-password-confirmation-form"></a>
#### El formulario de confirmación de contraseña

Primero, definiremos una ruta para mostrar una vista que solicita al usuario que confirme su contraseña:

```php
Route::get('/confirm-password', function () {
    return view('auth.confirm-password');
})->middleware('auth')->name('password.confirm');
```

Como es de esperar, la vista devuelta por esta ruta debe tener un formulario que contenga un campo `password`. Además, no dudes en incluir texto dentro de la vista que explique que el usuario está ingresando a un área protegida de la aplicación y debe confirmar su contraseña.

<a id="confirming-the-password"></a>
#### Confirmando la contraseña

A continuación, definiremos una ruta que manejará la solicitud del formulario desde la vista "confirmar contraseña". Esta ruta será la encargada de validar la contraseña y redirigir al usuario a su destino previsto:

```php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

Route::post('/confirm-password', function (Request $request) {
    if (! Hash::check($request->password, $request->user()->password)) {
        return back()->withErrors([
            'password' => ['The provided password does not match our records.']
        ]);
    }

    $request->session()->passwordConfirmed();

    return redirect()->intended();
})->middleware(['auth', 'throttle:6,1']);
```

Antes de continuar, examinemos esta ruta con más detalle. Primero, se determina que el campo `password` de la solicitud coincide realmente con la contraseña del usuario autenticado. Si la contraseña es válida, debemos informar a la sesión de Laravel que el usuario ha confirmado su contraseña. El método `passwordConfirmed` establecerá una marca de tiempo en la sesión del usuario que Laravel puede usar para determinar cuándo el usuario confirmó su contraseña por última vez. Finalmente, podemos redirigir al usuario a su destino previsto.

<a id="password-confirmation-protecting-routes"></a>
### Proteger rutas

Debe asegurarse de que a cualquier ruta que realice una acción que requiera una confirmación de contraseña reciente se le asigne el middleware `password.confirm`. Este middleware se incluye con la instalación predeterminada de Laravel y almacenará automáticamente el destino deseado del usuario en la sesión para que el usuario pueda ser redirigido a esa ubicación después de confirmar su contraseña. Después de almacenar el destino previsto del usuario en la sesión, el middleware redirigirá al usuario al `password.confirm` [ruta denominada ](../routing/#named-routes):

```php
Route::get('/settings', function () {
    // ...
})->middleware(['password.confirm']);

Route::post('/settings', function () {
    // ...
})->middleware(['password.confirm']);
```

<a id="adding-custom-guards"></a>
## Agregar guardias personalizados

Puede definir sus propios protectores de autenticación utilizando el método `extend` en la fachada `Auth`. Debe realizar su llamada al método `extend` dentro de un [proveedor de servicios](../providers/). Dado que Laravel ya viene con un `AppServiceProvider`, podemos colocar el código en ese proveedor:

```php
<?php

namespace App\Providers;

use App\Services\Auth\JwtGuard;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    // ...

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Auth::extend('jwt', function (Application $app, string $name, array $config) {
            // Return an instance of Illuminate\Contracts\Auth\Guard...

            return new JwtGuard(Auth::createUserProvider($config['provider']));
        });
    }
}
```

Como puede ver en el ejemplo anterior, la devolución de llamada pasada al método `extend` debería devolver una implementación de `Illuminate\Contracts\Auth\Guard`. Esta interfaz contiene algunos métodos que deberá implementar para definir una protección personalizada. Una vez que se haya definido su guardia personalizada, puede hacer referencia a la guardia en la configuración `guards` de su archivo de configuración `auth.php`:

```php
'guards' => [
    'api' => [
        'driver' => 'jwt',
        'provider' => 'users',
    ],
],
```

<a id="closure-request-guards"></a>
### Guardias de solicitud de cierre

La forma más sencilla de implementar un sistema de autenticación personalizado basado en solicitudes HTTP es mediante el método `Auth::viaRequest`. Este método le permite definir rápidamente su proceso de autenticación mediante un único cierre.

Para comenzar, llame al método `Auth::viaRequest` dentro del método `boot` del `AppServiceProvider` de su aplicación. El método `viaRequest` acepta un nombre de controlador de autenticación como primer argumento. Este nombre puede ser cualquier cadena que describa su guardia personalizada. El segundo argumento pasado al método debe ser un cierre que reciba la solicitud HTTP entrante y devuelva una instancia de usuario o, si falla la autenticación, `null`:

```php
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Auth::viaRequest('custom-token', function (Request $request) {
        return User::where('token', (string) $request->token)->first();
    });
}
```

Una vez que se haya definido su controlador de autenticación personalizado, puede configurarlo como controlador dentro de la configuración `guards` de su archivo de configuración `auth.php`:

```php
'guards' => [
    'api' => [
        'driver' => 'custom-token',
    ],
],
```

Finalmente, puede hacer referencia al guardia al asignar el middleware de autenticación a una ruta:

```php
Route::middleware('auth:api')->group(function () {
    // ...
});
```

<a id="adding-custom-user-providers"></a>
## Agregar proveedores de usuarios personalizados

Si no está utilizando una base de datos relacional tradicional para almacenar sus usuarios, necesitará ampliar Laravel con su propio proveedor de autenticación de usuarios. Usaremos el método `provider` en la fachada `Auth` para definir un proveedor de usuario personalizado. El solucionador del proveedor de usuarios debería devolver una implementación de `Illuminate\Contracts\Auth\UserProvider`:

```php
<?php

namespace App\Providers;

use App\Extensions\MongoUserProvider;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    // ...

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Auth::provider('mongo', function (Application $app, array $config) {
            // Return an instance of Illuminate\Contracts\Auth\UserProvider...

            return new MongoUserProvider($app->make('mongo.connection'));
        });
    }
}
```

Después de haber registrado el proveedor utilizando el método `provider`, puede cambiar al nuevo proveedor de usuario en su archivo de configuración `auth.php`. Primero, defina un `provider` que utilice su nuevo controlador:

```php
'providers' => [
    'users' => [
        'driver' => 'mongo',
    ],
],
```

Finalmente, puede hacer referencia a este proveedor en su configuración `guards`:

```php
'guards' => [
    'web' => [
        'driver' => 'session',
        'provider' => 'users',
    ],
],
```

<a id="the-user-provider-contract"></a>
### El contrato de usuario-proveedor

Las implementaciones de `Illuminate\Contracts\Auth\UserProvider` son responsables de obtener una implementación de `Illuminate\Contracts\Auth\Authenticatable` de un sistema de almacenamiento persistente, como MySQL, MongoDB, etc. Estas dos interfaces permiten que los mecanismos de autenticación de Laravel continúen funcionando independientemente de cómo se almacenen los datos del usuario o qué tipo de clase se utilice para representar al usuario autenticado:

Echemos un vistazo al contrato `Illuminate\Contracts\Auth\UserProvider`:

```php
<?php

namespace Illuminate\Contracts\Auth;

interface UserProvider
{
    public function retrieveById($identifier);
    public function retrieveByToken($identifier, $token);
    public function updateRememberToken(Authenticatable $user, $token);
    public function retrieveByCredentials(array $credentials);
    public function validateCredentials(Authenticatable $user, array $credentials);
    public function rehashPasswordIfRequired(Authenticatable $user, array $credentials, bool $force = false);
}
```

La función `retrieveById` normalmente recibe una clave que representa al usuario, como una ID de incremento automático de una base de datos MySQL. El método debe recuperar y devolver la implementación `Authenticatable` que coincida con el ID.

La función `retrieveByToken` recupera un usuario por su `$identifier` único y su `$token` "recordarme", generalmente almacenado en una columna de base de datos como `remember_token`. Al igual que con el método anterior, este método debe devolver la implementación `Authenticatable` con un valor de token coincidente.

El método `updateRememberToken` actualiza el `remember_token` de la instancia `$user` con el nuevo `$token`. Se asigna un token nuevo a los usuarios en un intento exitoso de autenticación "recordarme" o cuando el usuario cierra la sesión.

El método `retrieveByCredentials` recibe la matriz de credenciales pasadas al método `Auth::attempt` cuando intenta autenticarse con una aplicación. Luego, el método debería "consultar" el almacenamiento persistente subyacente para encontrar al usuario que coincida con esas credenciales. Normalmente, este método ejecutará una consulta con una condición "dónde" que busca un registro de usuario con un "nombre de usuario" que coincida con el valor de `$credentials['username']`. El método debería devolver una implementación de `Authenticatable`. **Este método no debe intentar realizar ninguna validación o autenticación de contraseña.**

El método `validateCredentials` debe comparar el `$user` dado con el `$credentials` para autenticar al usuario. Por ejemplo, este método normalmente utilizará el método `Hash::check` para comparar el valor de `$user->getAuthPassword()` con el valor de `$credentials['password']`. Este método debería devolver `true` o `false` indicando si la contraseña es válida.

El método `rehashPasswordIfRequired` debe repetir la contraseña de `$user` proporcionada si es necesario y es compatible. Por ejemplo, este método normalmente utilizará el método `Hash::needsRehash` para determinar si es necesario repetir el valor de `$credentials['password']`. Si es necesario repetir la contraseña, el método debe utilizar el método `Hash::make` para repetir la contraseña y actualizar el registro del usuario en el almacenamiento persistente subyacente.

<a id="the-authenticatable-contract"></a>
### El contrato autentificable

Ahora que hemos explorado cada uno de los métodos del `UserProvider`, echemos un vistazo al contrato `Authenticatable`. Recuerde, los proveedores de usuarios deben devolver implementaciones de esta interfaz de los métodos `retrieveById`, `retrieveByToken` y `retrieveByCredentials`:

```php
<?php

namespace Illuminate\Contracts\Auth;

interface Authenticatable
{
    public function getAuthIdentifierName();
    public function getAuthIdentifier();
    public function getAuthPasswordName();
    public function getAuthPassword();
    public function getRememberToken();
    public function setRememberToken($value);
    public function getRememberTokenName();
}
```

Esta interfaz es sencilla. El método `getAuthIdentifierName` debe devolver el nombre de la columna "clave principal" del usuario y el método `getAuthIdentifier` debe devolver la "clave principal" del usuario. Cuando se utiliza un back-end de MySQL, esta probablemente sería la clave principal de incremento automático asignada al registro de usuario. El método `getAuthPasswordName` debería devolver el nombre de la columna de contraseña del usuario. El método `getAuthPassword` debería devolver la contraseña hash del usuario.

Esta interfaz permite que el sistema de autenticación funcione con cualquier clase de "usuario", independientemente del ORM o capa de abstracción de almacenamiento que esté utilizando. De forma predeterminada, Laravel incluye una clase `App\Models\User` en el directorio `app/Models` que implementa esta interfaz.

<a id="automatic-password-rehashing"></a>
## Repetición automática de contraseña

El algoritmo de hash de contraseña predeterminado de Laravel es bcrypt. El "factor de trabajo" para los hashes de bcrypt se puede ajustar mediante el archivo de configuración `config/hashing.php` de su aplicación o la variable de entorno `BCRYPT_ROUNDS`.

Normalmente, el factor de trabajo de bcrypt debe aumentarse con el tiempo a medida que aumenta la potencia de procesamiento de la CPU/GPU. Si aumenta el factor de trabajo de bcrypt para su aplicación, Laravel repetirá elegante y automáticamente las contraseñas de los usuarios a medida que los usuarios se autentiquen con su aplicación a través de los kits de inicio de Laravel o cuando usted [autentique manualmente a los usuarios](#authenticating-users) mediante el método `attempt`.

Normalmente, la repetición automática de contraseñas no debería interrumpir su aplicación; sin embargo, puede desactivar este comportamiento publicando el archivo de configuración `hashing`:

```shell
php artisan config:publish hashing
```

Una vez que se haya publicado el archivo de configuración, puede establecer el valor de configuración `rehash_on_login` en `false`:

```php
'rehash_on_login' => false,
```

<a id="events"></a>
## Eventos

Laravel envía una variedad de [events](../events/) durante el proceso de autenticación. Puede [definir oyentes](../events/) para cualquiera de los siguientes eventos:

<div class="overflow-auto">

| Nombre del evento |
| ---------------------------------------------- |
| `Illuminate\Auth\Events\Registered` |
| `Illuminate\Auth\Events\Attempting` |
| `Illuminate\Auth\Events\Authenticated` |
| `Illuminate\Auth\Events\Login` |
| `Illuminate\Auth\Events\Failed` |
| `Illuminate\Auth\Events\Validated` |
| `Illuminate\Auth\Events\Verified` |
| `Illuminate\Auth\Events\Logout` |
| `Illuminate\Auth\Events\CurrentDeviceLogout` |
| `Illuminate\Auth\Events\OtherDeviceLogout` |
| `Illuminate\Auth\Events\Lockout` |
| `Illuminate\Auth\Events\PasswordReset` |
| `Illuminate\Auth\Events\PasswordResetLinkSent` |

</div>
