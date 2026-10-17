---
title: "Estructura del directorio"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [El directorio raíz](#the-root-directory)
    - [El directorio `app`](#the-root-app-directory)
    - [El Directorio `bootstrap`](#the-bootstrap-directory)
    - [El directorio `config`](#the-config-directory)
    - [El directorio `database`](#the-database-directory)
    - [El Directorio `public`](#the-public-directory)
    - [El directorio `resources`](#the-resources-directory)
    - [El directorio `routes`](#the-routes-directory)
    - [El directorio `storage`](#the-storage-directory)
    - [El Directorio `tests`](#the-tests-directory)
    - [El directorio `vendor`](#the-vendor-directory)
- [El directorio de aplicaciones](#the-app-directory)
    - [El directorio `Broadcasting`](#the-broadcasting-directory)
    - [El Directorio `Console`](#the-console-directory)
    - [El Directorio `Events`](#the-events-directory)
    - [El directorio `Exceptions`](#the-exceptions-directory)
    - [El directorio `Http`](#the-http-directory)
    - [El directorio `Jobs`](#the-jobs-directory)
    - [El directorio `Listeners`](#the-listeners-directory)
    - [El directorio `Mail`](#the-mail-directory)
    - [El directorio `Models`](#the-models-directory)
    - [El directorio `Notifications`](#the-notifications-directory)
    - [El directorio `Policies`](#the-policies-directory)
    - [El directorio `Providers`](#the-providers-directory)
    - [El Directorio `Rules`](#the-rules-directory)

<a id="introduction"></a>
## Introducción

La estructura predeterminada de la aplicación Laravel está destinada a proporcionar un excelente punto de partida para aplicaciones grandes y pequeñas. Pero eres libre de organizar tu aplicación como quieras. Laravel casi no impone restricciones sobre dónde se encuentra una clase determinada, siempre que Composer pueda cargar automáticamente la clase.

<a id="the-root-directory"></a>
## El directorio raíz

<a id="the-root-app-directory"></a>
### El directorio de aplicaciones

El directorio `app` contiene el código principal de su aplicación. Pronto exploraremos este directorio con más detalle; sin embargo, casi todas las clases de su aplicación estarán en este directorio.

<a id="the-bootstrap-directory"></a>
### El directorio Bootstrap

El directorio `bootstrap` contiene el archivo `app.php` que inicia el marco. Este directorio también alberga un directorio `cache` que contiene archivos generados por el marco para la optimización del rendimiento, como los archivos de caché de rutas y servicios.

<a id="the-config-directory"></a>
### El directorio de configuración

El directorio `config`, como su nombre lo indica, contiene todos los archivos de configuración de su aplicación. Es una gran idea leer todos estos archivos y familiarizarse con todas las opciones disponibles.

<a id="the-database-directory"></a>
### El directorio de la base de datos

El directorio `database` contiene las migraciones de su base de datos, las fábricas de modelos y las semillas. Si lo desea, también puede utilizar este directorio para contener una base de datos SQLite.

<a id="the-public-directory"></a>
### El directorio público

El directorio `public` contiene el archivo `index.php`, que es el punto de entrada para todas las solicitudes que ingresan a su aplicación y configura la carga automática. Este directorio también alberga sus activos, como imágenes, JavaScript y CSS.

<a id="the-resources-directory"></a>
### El directorio de recursos

El directorio `resources` contiene sus [views](../views/) así como sus recursos sin compilar y sin compilar, como CSS o JavaScript.

<a id="the-routes-directory"></a>
### El directorio de rutas

El directorio `routes` contiene todas las definiciones de ruta para su aplicación. De forma predeterminada, se incluyen dos archivos de ruta con Laravel: `web.php` y `console.php`.

El archivo `web.php` contiene rutas que Laravel coloca en el grupo de middleware `web`, que proporciona estado de sesión, protección CSRF y cifrado de cookies. Si su aplicación no ofrece una API RESTful sin estado, lo más probable es que todas sus rutas se definan en el archivo `web.php`.

El archivo `console.php` es donde puede definir todos los comandos de la consola basados ​​en funciones anónimas. Cada función anónima está vinculada a una instancia de comando, lo que permite un enfoque simple para interactuar con los métodos IO de cada comando. Aunque este archivo no define rutas HTTP, define puntos de entrada (rutas) basados ​​en la consola a su aplicación. También puede [programar tareas ](../scheduling/) en el archivo `console.php`.

Opcionalmente, puede instalar archivos de ruta adicionales para rutas API (`api.php`) y canales de transmisión (`channels.php`), mediante los comandos `install:api` y `install:broadcasting` Artisan.

El archivo `api.php` contiene rutas que no tienen estado, por lo que las solicitudes que ingresan a la aplicación a través de estas rutas deben autenticarse [a través de tokens](../sanctum/) y no tendrán acceso al estado de la sesión.

El archivo `channels.php` es donde puede registrar todos los [canales de transmisión de eventos ](../broadcasting/) que admite su aplicación.

<a id="the-storage-directory"></a>
### El directorio de almacenamiento

El directorio `storage` contiene sus registros, plantillas Blade compiladas, sesiones basadas en archivos, cachés de archivos y otros archivos generados por el marco. Este directorio está segregado en los directorios `app`, `framework` y `logs`. El directorio `app` se puede utilizar para almacenar cualquier archivo generado por su aplicación. El directorio `framework` se utiliza para almacenar archivos y cachés generados por el marco. Finalmente, el directorio `logs` contiene los archivos de registro de su aplicación.

El directorio `storage/app/public` se puede utilizar para almacenar archivos generados por el usuario, como avatares de perfil, que deberían ser accesibles públicamente. Debe crear un enlace simbólico en `public/storage` que apunte a este directorio. Puede crear el enlace usando el comando `php artisan storage:link` Artisan.

<a id="the-tests-directory"></a>
### El directorio de pruebas

El directorio `tests` contiene sus pruebas automatizadas. Por ejemplo, las pruebas unitarias y de funciones [Pest](https://pestphp.com) o [PHPUnit](https://phpunit.de/)] se proporcionan listas para usar. Cada clase de prueba debe tener como sufijo la palabra `Test`. Puede ejecutar sus pruebas utilizando los comandos `/vendor/bin/pest` o `/vendor/bin/phpunit`. O, si desea una representación más detallada y hermosa de los resultados de sus pruebas, puede ejecutarlas usando el comando `php artisan test` Artisan.

<a id="the-vendor-directory"></a>
### El directorio de proveedores

El directorio `vendor` contiene sus dependencias de [Composer](https://getcomposer.org).

<a id="the-app-directory"></a>
## El directorio de aplicaciones

La mayor parte de su aplicación se encuentra en el directorio `app`. De forma predeterminada, este directorio tiene un espacio de nombres en `App` y Composer lo carga automáticamente utilizando el [estándar de carga automática PSR-4](https://www.php-fig.org/psr/psr-4/).

De forma predeterminada, el directorio `app` contiene los directorios `Http`, `Models` y `Providers`. Sin embargo, con el tiempo, se generarán una variedad de otros directorios dentro del directorio de la aplicación a medida que utilice los comandos make Artisan para generar clases. Por ejemplo, el directorio `app/Console` no existirá hasta que ejecute el comando `make:command` Artisan para generar una clase de comando.

Los directorios `Console` y `Http` se explican con más detalle en sus respectivas secciones a continuación, pero piense en los directorios `Console` y `Http` como si proporcionaran una API en el núcleo de su aplicación. El protocolo HTTP y la CLI son mecanismos para interactuar con su aplicación, pero en realidad no contienen lógica de aplicación. En otras palabras, son dos formas de emitir comandos a tu aplicación. El directorio `Console` contiene todos sus comandos Artisan, mientras que el directorio `Http` contiene sus controladores, middleware y solicitudes.

> **Nota:**
> Muchas de las clases en el directorio `app` pueden ser generadas por Artisan mediante comandos. Para revisar los comandos disponibles, ejecute el comando `php artisan list make` en su terminal.

<a id="the-broadcasting-directory"></a>
### El directorio de radiodifusión

El directorio `Broadcasting` contiene todas las clases de canales de transmisión para su aplicación. Estas clases se generan utilizando el comando `make:channel`. Este directorio no existe de forma predeterminada, pero se creará cuando crees tu primer canal. Para obtener más información sobre los canales, consulte la documentación en [transmisión de eventos](../broadcasting/).

<a id="the-console-directory"></a>
### El directorio de la consola

El directorio `Console` contiene todos los comandos Artisan personalizados para su aplicación. Estos comandos se pueden generar usando el comando `make:command`.

<a id="the-events-directory"></a>
### El directorio de eventos

Este directorio no existe de forma predeterminada, pero será creado automáticamente mediante los comandos `event:generate` y `make:event` Artisan. El directorio `Events` alberga [clases de eventos](../events/). Los eventos se pueden utilizar para alertar a otras partes de su aplicación de que se ha producido una acción determinada, lo que proporciona una gran flexibilidad y desacoplamiento.

<a id="the-exceptions-directory"></a>
### El directorio de excepciones

El directorio `Exceptions` contiene todas las excepciones personalizadas para su aplicación. Estas excepciones se pueden generar usando el comando `make:exception`.

<a id="the-http-directory"></a>
### El directorio HTTP

El directorio `Http` contiene sus controladores, middleware y solicitudes de formulario. Casi toda la lógica para manejar las solicitudes que ingresan a su aplicación se ubicará en este directorio.

<a id="the-jobs-directory"></a>
### El directorio de empleos

Este directorio no existe de forma predeterminada, pero se creará automáticamente si ejecuta el comando `make:job` Artisan. El directorio `Jobs` alberga los [trabajos en cola](../queues/) para su aplicación. Los trabajos pueden ser puestos en cola por su aplicación o ejecutarse sincrónicamente dentro del ciclo de vida de la solicitud actual. Los trabajos que se ejecutan sincrónicamente durante la solicitud actual a veces se denominan "comandos", ya que son una implementación del [patrón de comando](https://en.wikipedia.org/wiki/Command_pattern).

<a id="the-listeners-directory"></a>
### El directorio de oyentes

Este directorio no existe de forma predeterminada, pero se creará automáticamente si ejecuta los comandos `event:generate` o `make:listener` Artisan. El directorio `Listeners` contiene las clases que manejan su archivo [events](../events/). Los detectores de eventos reciben una instancia de evento y realizan lógica en respuesta al evento que se activa. Por ejemplo, un evento `UserRegistered` podría ser manejado por un oyente `SendWelcomeEmail`.

<a id="the-mail-directory"></a>
### El directorio de correo

Este directorio no existe de forma predeterminada, pero se creará automáticamente si ejecuta el comando `make:mail` Artisan. El directorio `Mail` contiene todas sus [clases que representan correos electrónicos](../mail/) enviados por su aplicación. Los objetos de correo le permiten encapsular toda la lógica de crear un correo electrónico en una clase única y simple que puede enviarse mediante el método `Mail::send`.

<a id="the-models-directory"></a>
### El directorio de modelos

El directorio `Models` contiene todas sus [clases de modelo Eloquent](../eloquent/). El Eloquent ORM incluido con Laravel proporciona una implementación ActiveRecord hermosa y simple para trabajar con su base de datos. Cada tabla de base de datos tiene un "Modelo" correspondiente que se utiliza para interactuar con esa tabla. Los modelos le permiten consultar datos en sus tablas, así como insertar nuevos registros en la tabla.

<a id="the-notifications-directory"></a>
### El directorio de notificaciones

Este directorio no existe de forma predeterminada, pero se creará automáticamente si ejecuta el comando `make:notification` Artisan. El directorio `Notifications` contiene todas las [notificaciones](../notifications/) "transaccionales" que envía su aplicación, como notificaciones simples sobre eventos que suceden dentro de su aplicación. La función de notificación de Laravel abstrae el envío de notificaciones a través de una variedad de controladores, como correo electrónico, Slack, SMS o se almacena en una base de datos.

<a id="the-policies-directory"></a>
### El directorio de políticas

Este directorio no existe de forma predeterminada, pero se creará automáticamente si ejecuta el comando `make:policy` Artisan. El directorio `Policies` contiene las [clases de política de autorización](../authorization/) para su aplicación. Las políticas se utilizan para determinar si un usuario puede realizar una acción determinada contra un recurso.

<a id="the-providers-directory"></a>
### El directorio de proveedores

El directorio `Providers` contiene todos los [proveedores de servicios](../providers/) para su aplicación. Los proveedores de servicios inician su aplicación vinculando servicios en el contenedor de servicios, registrando eventos o realizando cualquier otra tarea para preparar su aplicación para las solicitudes entrantes.

En una nueva aplicación Laravel, este directorio ya contendrá el `AppServiceProvider`. Usted es libre de agregar sus propios proveedores a este directorio según sea necesario.

<a id="the-rules-directory"></a>
### El directorio de reglas

Este directorio no existe de forma predeterminada, pero se creará automáticamente si ejecuta el comando `make:rule` Artisan. El directorio `Rules` contiene los objetos de reglas de validación personalizados para su aplicación. Las reglas se utilizan para encapsular una lógica de validación complicada en un objeto simple. Para obtener más información, consulte la [documentación de validación](../validation/).
