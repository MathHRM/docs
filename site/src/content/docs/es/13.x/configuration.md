---
title: "Configuración"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Configuración del entorno](#environment-configuration)
    - [Tipos de variables de entorno](#environment-variable-types)
    - [Recuperando la configuración del entorno](#retrieving-environment-configuration)
    - [Determinación del entorno actual](#determining-the-current-environment)
    - [Archivos de entorno de cifrado](#encrypting-environment-files)
- [Acceso a valores de configuración](#accessing-configuration-values)
- [Almacenamiento en caché de configuración](#configuration-caching)
- [Publicación de configuración](#configuration-publishing)
- [Modo de depuración](#debug-mode)
- [Modo de mantenimiento](#maintenance-mode)

<a id="introduction"></a>
## Introducción

Todos los archivos de configuración para el marco Laravel se almacenan en el directorio `config`. Cada opción está documentada, así que siéntase libre de revisar los archivos y familiarizarse con las opciones disponibles.

Estos archivos de configuración le permiten configurar cosas como la información de conexión de su base de datos, la información de su servidor de correo, así como otros valores de configuración básicos, como la URL de su aplicación y la clave de cifrado.

<a id="the-about-command"></a>
#### El comando `about`

Laravel puede mostrar una descripción general de la configuración, los controladores y el entorno de su aplicación a través del comando `about` Artisan.

```shell
php artisan about
```

Si solo está interesado en una sección particular del resultado general de la aplicación, puede filtrar esa sección usando la opción `--only`:

```shell
php artisan about --only=environment
```

O, para explorar en detalle los valores de un archivo de configuración específico, puede usar el comando `config:show` Artisan:

```shell
php artisan config:show database
```

<a id="environment-configuration"></a>
## Configuración del entorno

A menudo resulta útil tener diferentes valores de configuración según el entorno donde se ejecuta la aplicación. Por ejemplo, es posible que desee utilizar localmente un controlador de caché diferente al que utiliza en su servidor de producción.

Para que esto sea muy fácil, Laravel utiliza la biblioteca PHP [DotEnv](https://github.com/vlucas/phpdotenv)]. En una instalación nueva de Laravel, el directorio raíz de su aplicación contendrá un archivo `.env.example` que define muchas variables de entorno comunes. Durante el proceso de instalación de Laravel, este archivo se copiará automáticamente a `.env`.

El archivo `.env` predeterminado de Laravel contiene algunos valores de configuración comunes que pueden diferir según si su aplicación se ejecuta localmente o en un servidor web de producción. Luego, estos valores son leídos por los archivos de configuración dentro del directorio `config` utilizando la función `env` de Laravel.

Si está desarrollando con un equipo, es posible que desee continuar incluyendo y actualizando el archivo `.env.example` con su aplicación. Al colocar valores de marcador de posición en el archivo de configuración de ejemplo, otros desarrolladores de su equipo pueden ver claramente qué variables de entorno son necesarias para ejecutar su aplicación.

> **Nota:**
> Cualquier variable en su archivo `.env` puede ser anulada por variables de entorno externas, como variables de entorno a nivel de servidor o de sistema.

<a id="environment-file-security"></a>
#### Seguridad de archivos del entorno

Su archivo `.env` no debe enviarse al control de fuente de su aplicación, ya que cada desarrollador/servidor que utilice su aplicación podría requerir una configuración de entorno diferente. Además, esto sería un riesgo de seguridad en caso de que un intruso obtenga acceso a su repositorio de control de fuente, ya que cualquier credencial confidencial quedaría expuesta.

Sin embargo, es posible cifrar su archivo de entorno utilizando el [cifrado de entorno](#encrypting-environment-files). Los archivos de entorno cifrados se pueden colocar de forma segura en el control de código fuente.

<a id="additional-environment-files"></a>
#### Archivos de entorno adicionales

Antes de cargar las variables de entorno de su aplicación, Laravel determina si se ha proporcionado externamente una variable de entorno `APP_ENV` o si se ha especificado el argumento CLI `--env`. Si es así, Laravel intentará cargar un archivo `.env.[APP_ENV]` si existe. Si no existe, se cargará el archivo `.env` predeterminado.

<a id="environment-variable-types"></a>
### Tipos de variables de entorno

Todas las variables en sus archivos `.env` generalmente se analizan como cadenas, por lo que se han creado algunos valores reservados para permitirle devolver una gama más amplia de tipos de la función `env()`:

<div class="overflow-auto">

| Valor `.env` | Valor `env()` |
| ------------ | ------------- |
| verdadero | (booleano) verdadero |
| (verdadero) | (booleano) verdadero |
| falso | (booleano) falso |
| (falso) | (booleano) falso |
| vacío | (cadena) '' |
| (vacío) | (cadena) '' |
| nulo | (nulo) nulo |
| (nulo) | (nulo) nulo |

</div>

Si necesita definir una variable de entorno con un valor que contiene espacios, puede hacerlo encerrando el valor entre comillas dobles:

```ini
APP_NAME="My Application"
```

<a id="retrieving-environment-configuration"></a>
### Recuperando la configuración del entorno

Todas las variables enumeradas en el archivo `.env` se cargarán en el superglobal PHP `$_ENV` cuando su aplicación reciba una solicitud. Sin embargo, puede utilizar la función `env` para recuperar valores de estas variables en sus archivos de configuración. De hecho, si revisas los archivos de configuración de Laravel, notarás que muchas de las opciones ya utilizan esta función:

```php
'debug' => (bool) env('APP_DEBUG', false),
```

El segundo valor pasado a la función `env` es el "valor predeterminado". Este valor se devolverá si no existe ninguna variable de entorno para la clave proporcionada.

<a id="determining-the-current-environment"></a>
### Determinando el entorno actual

El entorno de aplicación actual se determina mediante la variable `APP_ENV` de su archivo `.env`. Puede acceder a este valor a través del método `environment` en `App` [facade](../facades/):

```php
use Illuminate\Support\Facades\App;

$environment = App::environment();
```

También puede pasar argumentos al método `environment` para determinar si el entorno coincide con un valor determinado. El método devolverá `true` si el entorno coincide con alguno de los valores dados:

```php
if (App::environment('local')) {
    // The environment is local
}

if (App::environment(['local', 'staging'])) {
    // The environment is either local OR staging...
}
```

> **Nota:**
> La detección del entorno de la aplicación actual se puede anular definiendo una variable de entorno `APP_ENV` a nivel de servidor.

<a id="encrypting-environment-files"></a>
### Cifrado de archivos del entorno

Los archivos del entorno no cifrados nunca deben almacenarse en el control de código fuente. Sin embargo, Laravel le permite cifrar los archivos de su entorno para que puedan agregarse de forma segura al control de código fuente con el resto de su aplicación.

<a id="encryption"></a>
#### Cifrado

Para cifrar un archivo de entorno, puede utilizar el comando `env:encrypt`:

```shell
php artisan env:encrypt
```

La ejecución del comando `env:encrypt` cifrará su archivo `.env` y colocará el contenido cifrado en un archivo `.env.encrypted`. La clave de descifrado se presenta en el resultado del comando y debe almacenarse en un administrador de contraseñas seguro. Si desea proporcionar su propia clave de cifrado, puede utilizar la opción `--key` al invocar el comando:

```shell
php artisan env:encrypt --key=3UVsEgGVK36XN82KKeyLFMhvosbZN1aF
```

> **Nota:**
> La longitud de la clave proporcionada debe coincidir con la longitud de la clave requerida por el cifrado que se utiliza. De forma predeterminada, Laravel utilizará el cifrado `AES-256-CBC` que requiere una clave de 32 caracteres. Eres libre de utilizar cualquier cifrado compatible con [encrypter](../encryption/) de Laravel pasando la opción `--cipher` al invocar el comando.

Si su aplicación tiene varios archivos de entorno, como `.env` y `.env.staging`, puede especificar el archivo de entorno que debe cifrarse proporcionando el nombre del entorno mediante la opción `--env`:

```shell
php artisan env:encrypt --env=staging
```

<a id="readable-variable-names"></a>
#### Nombres de variables legibles

Al cifrar su archivo de entorno, puede utilizar la opción `--readable` para conservar los nombres de las variables visibles mientras cifra sus valores:

```shell
php artisan env:encrypt --readable
```

Esto producirá un archivo cifrado con el siguiente formato:

```ini
APP_NAME=eyJpdiI6...
APP_ENV=eyJpdiI6...
APP_KEY=eyJpdiI6...
APP_DEBUG=eyJpdiI6...
APP_URL=eyJpdiI6...
```

El uso del formato legible le permite ver qué variables de entorno existen sin exponer datos confidenciales. También facilita mucho la revisión de las solicitudes de extracción, ya que puede ver qué variables se agregaron, eliminaron o cambiaron de nombre sin necesidad de descifrar el archivo.

Al descifrar archivos del entorno, Laravel detecta automáticamente qué formato se utilizó, por lo que no se necesitan opciones adicionales para el comando `env:decrypt`.

> **Nota:**
> Cuando se utiliza la opción `--readable`, los comentarios y las líneas en blanco del archivo de entorno original no se incluyen en la salida cifrada.

<a id="updating-readable-environment-files"></a>
#### Actualización de archivos de entorno legibles

Al actualizar un archivo de entorno cifrado legible, Laravel conserva los valores sin cambios y elimina las variables que ya no existen en el archivo de entorno de origen:

```shell
php artisan env:encrypt --readable --key=3UVsEgGVK36XN82KKeyLFMhvosbZN1aF
```

El archivo cifrado se creará si no existe. Al actualizar un archivo existente, proporcione la misma clave de cifrado y cifrado utilizados para crearlo. Si el archivo no se puede descifrar, el comando fallará sin sobrescribirlo.

Para cifrar todos los valores nuevamente, use la opción `--force`. Esto le permite cambiar la clave de cifrado o reemplazar un archivo cifrado no válido:

```shell
php artisan env:encrypt --readable --force --key=3UVsEgGVK36XN82KKeyLFMhvosbZN1aF
```

<a id="decryption"></a>
#### Descifrado

Para descifrar un archivo de entorno, puede utilizar el comando `env:decrypt`. Este comando requiere una clave de descifrado, que Laravel recuperará de la variable de entorno `LARAVEL_ENV_ENCRYPTION_KEY`:

```shell
php artisan env:decrypt
```

O bien, la clave se puede proporcionar directamente al comando mediante la opción `--key`:

```shell
php artisan env:decrypt --key=3UVsEgGVK36XN82KKeyLFMhvosbZN1aF
```

Cuando se invoca el comando `env:decrypt`, Laravel descifrará el contenido del archivo `.env.encrypted` y colocará el contenido descifrado en el archivo `.env`.

La opción `--cipher` se puede proporcionar al comando `env:decrypt` para utilizar un cifrado de cifrado personalizado:

```shell
php artisan env:decrypt --key=qUWuNRdfuImXcKxZ --cipher=AES-128-CBC
```

Si su aplicación tiene varios archivos de entorno, como `.env` y `.env.staging`, puede especificar el archivo de entorno que debe descifrarse proporcionando el nombre del entorno mediante la opción `--env`:

```shell
php artisan env:decrypt --env=staging
```

Para sobrescribir un archivo de entorno existente, puede proporcionar la opción `--force` al comando `env:decrypt`:

```shell
php artisan env:decrypt --force
```

<a id="accessing-configuration-values"></a>
## Acceso a los valores de configuración

Puede acceder fácilmente a sus valores de configuración utilizando la fachada `Config` o la función global `config` desde cualquier lugar de su aplicación. Se puede acceder a los valores de configuración utilizando la sintaxis "punto", que incluye el nombre del archivo y la opción a la que desea acceder. También se puede especificar un valor predeterminado que se devolverá si la opción de configuración no existe:

```php
use Illuminate\Support\Facades\Config;

$value = Config::get('app.timezone');

$value = config('app.timezone');

// Retrieve a default value if the configuration value does not exist...
$value = config('app.timezone', 'Asia/Seoul');
```

Para establecer valores de configuración en tiempo de ejecución, puede invocar el método `set` de la fachada `Config` o pasar una matriz a la función `config`:

```php
Config::set('app.timezone', 'America/Chicago');

config(['app.timezone' => 'America/Chicago']);
```

Para ayudar con el análisis estático, la fachada `Config` también proporciona métodos de recuperación de configuración escrita. Si el valor de configuración recuperado no coincide con el tipo esperado, se generará una excepción:

```php
Config::string('config-key');
Config::integer('config-key');
Config::float('config-key');
Config::boolean('config-key');
Config::array('config-key');
Config::collection('config-key');
```

<a id="configuration-caching"></a>
## Almacenamiento en caché de configuración

Para aumentar la velocidad de su aplicación, debe almacenar en caché todos sus archivos de configuración en un solo archivo usando el comando `config:cache` Artisan. Esto combinará todas las opciones de configuración para su aplicación en un solo archivo que el marco puede cargar rápidamente.

Normalmente debería ejecutar el comando `php artisan config:cache` como parte de su proceso de implementación de producción. El comando no debe ejecutarse durante el desarrollo local, ya que será necesario cambiar las opciones de configuración con frecuencia durante el desarrollo de la aplicación.

Una vez que la configuración se haya almacenado en caché, el marco no cargará el archivo `.env` de su aplicación durante las solicitudes o los comandos de Artisan; por lo tanto, la función `env` solo devolverá variables de entorno externas a nivel del sistema.

Por este motivo, debe asegurarse de llamar únicamente a la función `env` desde los archivos de configuración de su aplicación (`config`). Puede ver muchos ejemplos de esto examinando los archivos de configuración predeterminados de Laravel. Se puede acceder a los valores de configuración desde cualquier lugar de su aplicación utilizando la función `config` [descrita anteriormente](#accessing-configuration-values).

El comando `config:clear` se puede utilizar para purgar la configuración almacenada en caché:

```shell
php artisan config:clear
```

> **Advertencia:**
> Si ejecuta el comando `config:cache` durante el proceso de implementación, debe asegurarse de llamar solo a la función `env` desde sus archivos de configuración. Una vez que la configuración se haya almacenado en caché, el archivo `.env` no se cargará; por lo tanto, la función `env` solo devolverá variables de entorno externas a nivel del sistema.

<a id="configuration-publishing"></a>
## Publicación de configuración

La mayoría de los archivos de configuración de Laravel ya están publicados en el directorio `config` de su aplicación; sin embargo, ciertos archivos de configuración como `cors.php` y `view.php` no se publican de forma predeterminada, ya que la mayoría de las aplicaciones nunca necesitarán modificarlos.

Sin embargo, puede utilizar el comando `config:publish` Artisan para publicar cualquier archivo de configuración que no esté publicado de forma predeterminada:

```shell
php artisan config:publish

php artisan config:publish --all
```

<a id="debug-mode"></a>
## Modo de depuración

La opción `debug` en su archivo de configuración `config/app.php` determina cuánta información sobre un error se muestra realmente al usuario. De forma predeterminada, esta opción está configurada para respetar el valor de la variable de entorno `APP_DEBUG`, que se almacena en su archivo `.env`.

> **Advertencia:**
> Para el desarrollo local, debe configurar la variable de entorno `APP_DEBUG` en `true`. **En su entorno de producción, este valor siempre debe ser `false`. Si la variable se establece en `true` en producción, corre el riesgo de exponer valores de configuración confidenciales a los usuarios finales de su aplicación.**

<a id="maintenance-mode"></a>
## Modo de mantenimiento

Cuando su aplicación esté en modo de mantenimiento, se mostrará una vista personalizada para todas las solicitudes de su aplicación. Esto facilita "deshabilitar" su aplicación mientras se actualiza o cuando realiza el mantenimiento. Se incluye una verificación del modo de mantenimiento en la pila de middleware predeterminada para su aplicación. Si la aplicación está en modo de mantenimiento, se generará una instancia `Symfony\Component\HttpKernel\Exception\HttpException` con un código de estado de 503.

Para habilitar el modo de mantenimiento, ejecute el comando `down` Artisan:

```shell
php artisan down
```

Si desea que el encabezado HTTP `Refresh` se envíe con todas las respuestas del modo de mantenimiento, puede proporcionar la opción `refresh` al invocar el comando `down`. El encabezado `Refresh` le indicará al navegador que actualice automáticamente la página después de la cantidad de segundos especificada:

```shell
php artisan down --refresh=15
```

También puede proporcionar una opción `retry` al comando `down`, que se establecerá como el valor del encabezado HTTP `Retry-After`, aunque los navegadores generalmente ignoran este encabezado:

```shell
php artisan down --retry=60
```

<a id="bypassing-maintenance-mode"></a>
#### Omitir el modo de mantenimiento

Para permitir que se omita el modo de mantenimiento mediante un token secreto, puede usar la opción `secret` para especificar un token de omisión del modo de mantenimiento:

```shell
php artisan down --secret="1630542a-246b-4b66-afa1-dd72a4c43515"
```

Después de colocar la aplicación en modo de mantenimiento, puede navegar a la URL de la aplicación que coincida con este token y Laravel emitirá una cookie de omisión del modo de mantenimiento en su navegador:

```shell
https://example.com/1630542a-246b-4b66-afa1-dd72a4c43515
```

Si desea que Laravel genere el token secreto por usted, puede usar la opción `with-secret`. El secreto se le mostrará una vez que la aplicación esté en modo de mantenimiento:

```shell
php artisan down --with-secret
```

Al acceder a esta ruta oculta, serás redirigido a la ruta `/` de la aplicación. Una vez que la cookie se haya enviado a su navegador, podrá navegar por la aplicación normalmente como si no estuviera en modo de mantenimiento.

> **Nota:**
> Su secreto de modo de mantenimiento normalmente debe consistir en caracteres alfanuméricos y, opcionalmente, guiones. Debes evitar el uso de caracteres que tengan un significado especial en URL como `?` o `&`.

<a id="maintenance-mode-on-multiple-servers"></a>
#### Modo de mantenimiento en varios servidores

De forma predeterminada, Laravel determina si su aplicación está en modo de mantenimiento utilizando un sistema basado en archivos. Esto significa que para activar el modo de mantenimiento, se debe ejecutar el comando `php artisan down` en cada servidor que aloja su aplicación.

Alternativamente, Laravel ofrece un método basado en caché para manejar el modo de mantenimiento. Este método requiere ejecutar el comando `php artisan down` en un solo servidor. Para utilizar este enfoque, modifique las variables del modo de mantenimiento en el archivo `.env` de su aplicación. Debe seleccionar un caché `store` al que puedan acceder todos sus servidores. Esto garantiza que el estado del modo de mantenimiento se mantenga consistentemente en todos los servidores:

```ini
APP_MAINTENANCE_DRIVER=cache
APP_MAINTENANCE_STORE=database
```

<a id="pre-rendering-the-maintenance-mode-view"></a>
#### Representación previa de la vista del modo de mantenimiento

Si utiliza el comando `php artisan down` durante la implementación, sus usuarios aún pueden encontrar errores ocasionalmente si acceden a la aplicación mientras se actualizan las dependencias de Composer u otros componentes de la infraestructura. Esto ocurre porque una parte importante del marco de trabajo de Laravel debe iniciarse para determinar que su aplicación está en modo de mantenimiento y representar la vista en modo de mantenimiento utilizando el motor de plantillas.

Por esta razón, Laravel le permite prerenderizar una vista en modo de mantenimiento que se devolverá al comienzo del ciclo de solicitud. Esta vista se representa antes de que se haya cargado cualquiera de las dependencias de su aplicación. Puede renderizar previamente una plantilla de su elección utilizando la opción `render` del comando `down`:

```shell
php artisan down --render="errors::503"
```

<a id="redirecting-maintenance-mode-requests"></a>
#### Redirigir solicitudes de modo de mantenimiento

Mientras está en modo de mantenimiento, Laravel mostrará la vista del modo de mantenimiento para todas las URL de aplicaciones a las que el usuario intenta acceder. Si lo desea, puede indicarle a Laravel que redirija todas las solicitudes a una URL específica. Esto se puede lograr usando la opción `redirect`. Por ejemplo, es posible que desee redirigir todas las solicitudes al URI `/`:

```shell
php artisan down --redirect=/
```

<a id="disabling-maintenance-mode"></a>
#### Desactivar el modo de mantenimiento

Para deshabilitar el modo de mantenimiento, use el comando `up`:

```shell
php artisan up
```

> **Nota:**
> Puede personalizar la plantilla del modo de mantenimiento predeterminado definiendo su propia plantilla en `resources/views/errors/503.blade.php`.

<a id="maintenance-mode-queues"></a>
#### Modo de mantenimiento y colas

Mientras su aplicación esté en modo de mantenimiento, no se manejará ningún [trabajo en cola](../queues/). Los trabajos continuarán manejándose normalmente una vez que la aplicación salga del modo de mantenimiento.

<a id="alternatives-to-maintenance-mode"></a>
#### Alternativas al modo de mantenimiento

Dado que el modo de mantenimiento requiere que su aplicación tenga varios segundos de tiempo de inactividad, considere ejecutar sus aplicaciones en una plataforma completamente administrada como [Laravel Cloud](https://cloud.laravel.com) para lograr una implementación sin tiempo de inactividad con Laravel.
