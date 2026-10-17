---
title: "Almacenamiento de archivos"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Configuración](#configuration)
    - [El controlador local](#the-local-driver)
    - [El disco público](#the-public-disk)
    - [Requisitos previos del controlador](#driver-prerequisites)
    - [Sistemas de archivos con alcance, de solo lectura y de lectura directa](#scoped-and-read-only-filesystems)
    - [Sistemas de archivos compatibles con Amazon S3](#amazon-s3-compatible-filesystems)
- [Obtención de instancias de disco](#obtaining-disk-instances)
    - [Discos bajo demanda](#on-demand-disks)
- [Recuperando archivos](#retrieving-files)
    - [Descargando archivos](#downloading-files)
    - [URL de archivos](#file-urls)
    - [URL temporales](#temporary-urls)
    - [Metadatos del archivo](#file-metadata)
- [Almacenamiento de archivos](#storing-files)
    - [Anteponer y agregar a archivos](#prepending-appending-to-files)
    - [Copiar y mover archivos](#copying-moving-files)
    - [Transmisión automática](#automatic-streaming)
    - [Cargas de archivos](#file-uploads)
    - [Visibilidad de archivos](#file-visibility)
    - [Manipulación de imágenes](#image-manipulation)
- [Eliminar archivos](#deleting-files)
- [Directorios](#directories)
- [Prueba](#testing)
- [Sistemas de archivos personalizados](#custom-filesystems)

<a id="introduction"></a>
## Introducción

Laravel proporciona una poderosa abstracción del sistema de archivos gracias al maravilloso paquete PHP [Flysystem](https://github.com/thephpleague/flysystem) de Frank de Jonge. La integración de Laravel Flysystem proporciona controladores simples para trabajar con sistemas de archivos locales, SFTP y Amazon S3. Aún mejor, es increíblemente sencillo cambiar entre estas opciones de almacenamiento entre su máquina de desarrollo local y su servidor de producción, ya que la API sigue siendo la misma para cada sistema.

<a id="configuration"></a>
## Configuración

El archivo de configuración del sistema de archivos de Laravel se encuentra en `config/filesystems.php`. Dentro de este archivo, puede configurar todos los "discos" de su sistema de archivos. Cada disco representa un controlador de almacenamiento y una ubicación de almacenamiento particulares. En el archivo de configuración se incluyen configuraciones de ejemplo para cada controlador compatible para que pueda modificar la configuración para reflejar sus preferencias y credenciales de almacenamiento.

El controlador `local` interactúa con archivos almacenados localmente en el servidor que ejecuta la aplicación Laravel, mientras que el controlador de almacenamiento `sftp` se usa para FTP basado en claves SSH. El controlador `s3` se utiliza para escribir en el servicio de almacenamiento en la nube S3 de Amazon.

> **Nota:**
> Puede configurar tantos discos como desee e incluso puede tener varios discos que utilicen el mismo controlador.

<a id="the-local-driver"></a>
### El conductor local

Cuando se utiliza el controlador `local`, todas las operaciones de archivo son relativas al directorio `root` definido en su archivo de configuración `filesystems`. De forma predeterminada, este valor se establece en el directorio `storage/app/private`. Por lo tanto, el siguiente método escribiría en `storage/app/private/example.txt`:

```php
use Illuminate\Support\Facades\Storage;

Storage::disk('local')->put('example.txt', 'Contents');
```

<a id="the-public-disk"></a>
### El disco público

El disco `public` incluido en el archivo de configuración `filesystems` de su aplicación está destinado a archivos a los que se podrá acceder públicamente. De forma predeterminada, el disco `public` utiliza el controlador `local` y almacena sus archivos en `storage/app/public`.

Si su disco `public` utiliza el controlador `local` y desea que estos archivos sean accesibles desde la web, debe crear un enlace simbólico desde el directorio de origen `storage/app/public` al directorio de destino `public/storage`:

Para crear el enlace simbólico, puede utilizar el comando `storage:link` Artisan:

```shell
php artisan storage:link
```

Una vez que se haya almacenado un archivo y se haya creado el enlace simbólico, puede crear una URL para los archivos utilizando el asistente `asset`:

```php
echo asset('storage/file.txt');
```

Puede configurar enlaces simbólicos adicionales en su archivo de configuración `filesystems`. Cada uno de los enlaces configurados se creará cuando ejecute el comando `storage:link`:

```php
'links' => [
    public_path('storage') => storage_path('app/public'),
    public_path('images') => storage_path('app/images'),
],
```

El comando `storage:unlink` se puede utilizar para destruir los enlaces simbólicos configurados:

```shell
php artisan storage:unlink
```

<a id="driver-prerequisites"></a>
### Requisitos previos del controlador

<a id="s3-driver-configuration"></a>
#### Configuración del controlador S3

Antes de utilizar el controlador S3, deberá instalar el paquete Flysystem S3 a través del administrador de paquetes Composer:

```shell
composer require league/flysystem-aws-s3-v3 "^3.0" --with-all-dependencies
```

Una matriz de configuración de disco S3 se encuentra en su archivo de configuración `config/filesystems.php`. Normalmente, debe configurar su información y credenciales de S3 utilizando las siguientes variables de entorno a las que hace referencia el archivo de configuración `config/filesystems.php`:

```ini
AWS_ACCESS_KEY_ID=<your-key-id>
AWS_SECRET_ACCESS_KEY=<your-secret-access-key>
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=<your-bucket-name>
AWS_USE_PATH_STYLE_ENDPOINT=false
```

Para mayor comodidad, estas variables de entorno coinciden con la convención de nomenclatura utilizada por la AWS CLI.

<a id="ftp-driver-configuration"></a>
#### Configuración del controlador FTP

Antes de utilizar el controlador FTP, deberá instalar el paquete FTP Flysystem a través del administrador de paquetes Composer:

```shell
composer require league/flysystem-ftp "^3.0"
```

Las integraciones Flysystem de Laravel funcionan muy bien con FTP; sin embargo, no se incluye una configuración de muestra con el archivo de configuración predeterminado `config/filesystems.php` del marco. Si necesita configurar un sistema de archivos FTP, puede utilizar el siguiente ejemplo de configuración:

```php
'ftp' => [
    'driver' => 'ftp',
    'host' => env('FTP_HOST'),
    'username' => env('FTP_USERNAME'),
    'password' => env('FTP_PASSWORD'),

    // Optional FTP Settings...
    // 'port' => env('FTP_PORT', 21),
    // 'root' => env('FTP_ROOT'),
    // 'passive' => true,
    // 'ssl' => true,
    // 'timeout' => 30,
],
```

<a id="sftp-driver-configuration"></a>
#### Configuración del controlador SFTP

Antes de utilizar el controlador SFTP, deberá instalar el paquete SFTP Flysystem a través del administrador de paquetes Composer:

```shell
composer require league/flysystem-sftp-v3 "^3.0"
```

Las integraciones Flysystem de Laravel funcionan muy bien con SFTP; sin embargo, no se incluye una configuración de muestra con el archivo de configuración predeterminado `config/filesystems.php` del marco. Si necesita configurar un sistema de archivos SFTP, puede utilizar el siguiente ejemplo de configuración:

```php
'sftp' => [
    'driver' => 'sftp',
    'host' => env('SFTP_HOST'),

    // Settings for basic authentication...
    'username' => env('SFTP_USERNAME'),
    'password' => env('SFTP_PASSWORD'),

    // Settings for SSH key-based authentication with encryption password...
    'privateKey' => env('SFTP_PRIVATE_KEY'),
    'passphrase' => env('SFTP_PASSPHRASE'),

    // Settings for file / directory permissions...
    'visibility' => 'private', // `private` = 0600, `public` = 0644
    'directory_visibility' => 'private', // `private` = 0700, `public` = 0755

    // Optional SFTP Settings...
    // 'hostFingerprint' => env('SFTP_HOST_FINGERPRINT'),
    // 'maxTries' => 4,
    // 'passphrase' => env('SFTP_PASSPHRASE'),
    // 'port' => env('SFTP_PORT', 22),
    // 'root' => env('SFTP_ROOT', ''),
    // 'timeout' => 30,
    // 'useAgent' => true,
],
```

<a id="scoped-and-read-only-filesystems"></a>
### Sistemas de archivos con alcance, de solo lectura y de lectura directa

Los discos con alcance le permiten definir un sistema de archivos donde todas las rutas tienen automáticamente el prefijo de ruta determinado. Antes de crear un disco de sistema de archivos con ámbito, deberá instalar un paquete Flysystem adicional a través del administrador de paquetes de Composer:

```shell
composer require league/flysystem-path-prefixing "^3.0"
```

Puede crear una instancia con alcance de ruta de cualquier disco del sistema de archivos existente definiendo un disco que utilice el controlador `scoped`. Por ejemplo, puede crear un disco que limite su disco `s3` existente a un prefijo de ruta específico y luego cada operación de archivo que utilice su disco con alcance utilizará el prefijo especificado:

```php
's3-videos' => [
    'driver' => 'scoped',
    'disk' => 's3',
    'prefix' => 'path/to/videos',
],
```

Los discos de "sólo lectura" le permiten crear discos con sistema de archivos que no permiten operaciones de escritura. Antes de utilizar la opción de configuración `read-only`, deberá instalar un paquete Flysystem adicional a través del administrador de paquetes Composer:

```shell
composer require league/flysystem-read-only "^3.0"
```

A continuación, puede incluir la opción de configuración `read-only` en una o más de las matrices de configuración de su disco:

```php
's3-videos' => [
    'driver' => 's3',
    // ...
    'read-only' => true,
],
```

Los discos de lectura le permiten migrar archivos entre discos sin tiempo de inactividad. Al leer un archivo, Laravel verifica primero el disco principal. Si el archivo solo existe en el disco de reserva, Laravel lee el archivo del disco de reserva y lo copia en el disco principal para futuras solicitudes:

```php
'assets' => [
    'driver' => 'read-through',
    'primary' => 's3',
    'fallback' => 'legacy-s3',
],
```

Las escrituras y los listados de directorios tienen como objetivo el disco principal. Las comprobaciones de existencia de archivos y metadatos utilizan cualquiera de los discos sin copiar archivos al disco principal. Si falla la copia de un archivo alternativo al disco principal, la lectura aún se realiza correctamente de forma predeterminada. Para generar una excepción, establezca la opción de configuración `throw_on_promotion_failure` en `true`.

<a id="amazon-s3-compatible-filesystems"></a>
### Sistemas de archivos compatibles con Amazon S3

De forma predeterminada, el archivo de configuración `filesystems` de su aplicación contiene una configuración de disco para el disco `s3`. Además de utilizar este disco para interactuar con [Amazon S3](https://aws.amazon.com/s3/), puede usarlo para interactuar con cualquier servicio de almacenamiento de archivos compatible con S3, como [RustFS](https://github.com/rustfs/rustfs), [DigitalOcean Spaces](https://www.digitalocean.com/products/spaces/), [Vultr Object Storage](https://www.vultr.com/products/object-storage/), [Cloudflare R2](https://www.cloudflare.com/developer-platform/products/r2/), o [Hetzner Cloud Storage](https://www.hetzner.com/storage/object-storage/).

Normalmente, después de actualizar las credenciales del disco para que coincidan con las credenciales del servicio que planea utilizar, solo necesita actualizar el valor de la opción de configuración `endpoint`. El valor de esta opción normalmente se define mediante la variable de entorno `AWS_ENDPOINT`:

```php
'endpoint' => env('AWS_ENDPOINT', 'https://rustfs:9000'),
```

<a id="obtaining-disk-instances"></a>
## Obtención de instancias de disco

La fachada `Storage` se puede utilizar para interactuar con cualquiera de sus discos configurados. Por ejemplo, puede utilizar el método `put` en la fachada para almacenar un avatar en el disco predeterminado. Si llama a métodos en la fachada `Storage` sin llamar primero al método `disk`, el método se pasará automáticamente al disco predeterminado:

```php
use Illuminate\Support\Facades\Storage;

Storage::put('avatars/1', $content);
```

Si su aplicación interactúa con varios discos, puede usar el método `disk` en la fachada `Storage` para trabajar con archivos en un disco en particular:

```php
Storage::disk('s3')->put('avatars/1', $content);
```

<a id="on-demand-disks"></a>
### Discos bajo demanda

A veces es posible que desee crear un disco en tiempo de ejecución utilizando una configuración determinada sin que esa configuración esté realmente presente en el archivo de configuración `filesystems` de su aplicación. Para lograr esto, puede pasar una matriz de configuración al método `build` de la fachada `Storage`:

```php
use Illuminate\Support\Facades\Storage;

$disk = Storage::build([
    'driver' => 'local',
    'root' => '/path/to/root',
]);

$disk->put('image.jpg', $content);
```

<a id="retrieving-files"></a>
## Recuperando archivos

El método `get` se puede utilizar para recuperar el contenido de un archivo. El método devolverá el contenido de la cadena sin formato del archivo. Recuerde, todas las rutas de archivos deben especificarse en relación con la ubicación "raíz" del disco:

```php
$contents = Storage::get('file.jpg');
```

Si el archivo que está recuperando contiene JSON, puede utilizar el método `json` para recuperar el archivo y decodificar su contenido:

```php
$orders = Storage::json('orders.json');
```

Se puede utilizar el método `exists` para determinar si existe un archivo en el disco:

```php
if (Storage::disk('s3')->exists('file.jpg')) {
    // ...
}
```

Se puede utilizar el método `missing` para determinar si falta un archivo en el disco:

```php
if (Storage::disk('s3')->missing('file.jpg')) {
    // ...
}
```

<a id="downloading-files"></a>
### Descargando archivos

El método `download` se puede utilizar para generar una respuesta que obligue al navegador del usuario a descargar el archivo en la ruta indicada. El método `download` acepta un nombre de archivo como segundo argumento del método, lo que determinará el nombre de archivo que ve el usuario que descarga el archivo. Finalmente, puede pasar una serie de encabezados HTTP como tercer argumento del método:

```php
return Storage::download('file.jpg');

return Storage::download('file.jpg', $name, $headers);
```

<a id="file-urls"></a>
### URL de archivos

Puede utilizar el método `url` para obtener la URL de un archivo determinado. Si está utilizando el controlador `local`, normalmente antepondrá `/storage` a la ruta proporcionada y devolverá una URL relativa al archivo. Si está utilizando el controlador `s3`, se devolverá la URL remota completa:

```php
use Illuminate\Support\Facades\Storage;

$url = Storage::url('file.jpg');
```

Cuando se utiliza el controlador `local`, todos los archivos a los que se debe acceder públicamente deben colocarse en el directorio `storage/app/public`. Además, debe [crear un enlace simbólico](#the-public-disk) en `public/storage` que apunte al directorio `storage/app/public`.

> **Advertencia:**
> Cuando se utiliza el controlador `local`, el valor de retorno de `url` no está codificado en URL. Por este motivo, recomendamos almacenar siempre sus archivos utilizando nombres que creen URL válidas.

<a id="url-host-customization"></a>
#### Personalización del host de URL

Si desea modificar el host para las URL generadas utilizando la fachada `Storage`, puede agregar o cambiar la opción `url` en la matriz de configuración del disco:

```php
'public' => [
    'driver' => 'local',
    'root' => storage_path('app/public'),
    'url' => env('APP_URL').'/storage',
    'visibility' => 'public',
    'throw' => false,
],
```

<a id="temporary-urls"></a>
### URL temporales

Con el método `temporaryUrl`, puede crear URL temporales para archivos almacenados con los controladores `local` y `s3`. Este método acepta una ruta y una instancia `DateTime` que especifica cuándo debe caducar la URL:

```php
use Illuminate\Support\Facades\Storage;

$url = Storage::temporaryUrl(
    'file.jpg', now()->plus(minutes: 5)
);
```

<a id="enabling-local-temporary-urls"></a>
#### Habilitación de URL temporales locales

Si comenzó a desarrollar su aplicación antes de que se introdujera la compatibilidad con URL temporales en el controlador `local`, es posible que necesite habilitar las URL temporales locales. Para hacerlo, agregue la opción `serve` a la matriz de configuración de su disco `local` dentro del archivo de configuración `config/filesystems.php`:

```php
'local' => [
    'driver' => 'local',
    'root' => storage_path('app/private'),
    'serve' => true, // [tl! add]
    'throw' => false,
],
```

<a id="s3-request-parameters"></a>
#### Parámetros de solicitud de S3

Si necesita especificar [parámetros de solicitud de S3](https://docs.aws.amazon.com/AmazonS3/latest/API/RESTObjectGET.html#RESTObjectGET-requests)] adicionales, puede pasar la matriz de parámetros de solicitud como tercer argumento del método `temporaryUrl`:

```php
$url = Storage::temporaryUrl(
    'file.jpg',
    now()->plus(minutes: 5),
    [
        'ResponseContentType' => 'application/octet-stream',
        'ResponseContentDisposition' => 'attachment; filename=file2.jpg',
    ]
);
```

<a id="customizing-temporary-urls"></a>
#### Personalización de URL temporales

Si necesita personalizar cómo se crean las URL temporales para un disco de almacenamiento específico, puede utilizar el método `buildTemporaryUrlsUsing`. Por ejemplo, esto puede resultar útil si tiene un controlador que le permite descargar archivos almacenados en un disco que normalmente no admite URL temporales. Normalmente, este método debe llamarse desde el método `boot` de un proveedor de servicios:

```php
<?php

namespace App\Providers;

use DateTime;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Storage::disk('local')->buildTemporaryUrlsUsing(
            function (string $path, DateTime $expiration, array $options) {
                return URL::temporarySignedRoute(
                    'files.download',
                    $expiration,
                    array_merge($options, ['path' => $path])
                );
            }
        );
    }
}
```

<a id="temporary-upload-urls"></a>
#### URL de carga temporal

> **Advertencia:**
> La capacidad de generar URL de carga temporales solo es compatible con los controladores `s3` y `local`.

Si necesita generar una URL temporal que pueda usarse para cargar un archivo directamente desde su aplicación del lado cliente, puede usar el método `temporaryUploadUrl`. Este método acepta una ruta y una instancia `DateTime` que especifica cuándo debe caducar la URL. El método `temporaryUploadUrl` devuelve una matriz asociativa que puede desestructurarse en la URL de carga y los encabezados que deben incluirse con la solicitud de carga:

```php
use Illuminate\Support\Facades\Storage;

['url' => $url, 'headers' => $headers] = Storage::temporaryUploadUrl(
    'file.jpg', now()->plus(minutes: 5)
);
```

Este método es útil principalmente en entornos sin servidor que requieren que la aplicación del lado del cliente cargue archivos directamente en un sistema de almacenamiento en la nube como Amazon S3.

<a id="file-metadata"></a>
### Metadatos del archivo

Además de leer y escribir archivos, Laravel también puede proporcionar información sobre los propios archivos. Por ejemplo, se puede utilizar el método `size` para obtener el tamaño de un archivo en bytes:

```php
use Illuminate\Support\Facades\Storage;

$size = Storage::size('file.jpg');
```

El método `lastModified` devuelve la marca de tiempo UNIX de la última vez que se modificó el archivo:

```php
$time = Storage::lastModified('file.jpg');
```

El tipo MIME de un archivo determinado se puede obtener mediante el método `mimeType`:

```php
$mime = Storage::mimeType('file.jpg');
```

<a id="file-paths"></a>
#### Rutas de archivos

Puede utilizar el método `path` para obtener la ruta de un archivo determinado. Si está utilizando el controlador `local`, esto devolverá la ruta absoluta al archivo. Si está utilizando el controlador `s3`, este método devolverá la ruta relativa al archivo en el depósito S3:

```php
use Illuminate\Support\Facades\Storage;

$path = Storage::path('file.jpg');
```

<a id="storing-files"></a>
## Almacenamiento de archivos

El método `put` se puede utilizar para almacenar el contenido del archivo en un disco. También puede pasar un PHP `resource` al método `put`, que utilizará el soporte de flujo subyacente de Flysystem. Recuerde, todas las rutas de archivos deben especificarse en relación con la ubicación "raíz" configurada para el disco:

```php
use Illuminate\Support\Facades\Storage;

Storage::put('file.jpg', $contents);

Storage::put('file.jpg', $resource);
```

<a id="failed-writes"></a>
#### Escrituras fallidas

Si el método `put` (u otras operaciones de "escritura") no puede escribir el archivo en el disco, se devolverá `false`:

```php
if (! Storage::put('file.jpg', $contents)) {
    // The file could not be written to disk...
}
```

Si lo desea, puede definir la opción `throw` dentro de la matriz de configuración del disco de su sistema de archivos. Cuando esta opción se define como `true`, los métodos de "escritura" como `put` generarán una instancia de `League\Flysystem\UnableToWriteFile` cuando las operaciones de escritura fallen:

```php
'public' => [
    'driver' => 'local',
    // ...
    'throw' => true,
],
```

Alternativamente, puede definir la opción `report` dentro de la matriz de configuración del disco de su sistema de archivos. Cuando esta opción se define como `true`, Laravel registrará la excepción subyacente utilizando el controlador de excepciones de su aplicación cuando falle una operación de "escritura", sin generar la excepción ni interrumpir el valor de retorno de la operación de escritura:

```php
'public' => [
    'driver' => 'local',
    // ...
    'report' => true,
],
```

Si no se definen las opciones `throw` ni `report`, el disco devolverá silenciosamente `false` en caso de falla y la excepción subyacente no se generará ni registrará.

<a id="prepending-appending-to-files"></a>
### Anteponer y anexar archivos

Los métodos `prepend` y `append` le permiten escribir al principio o al final de un archivo:

```php
Storage::prepend('file.log', 'Prepended Text');

Storage::append('file.log', 'Appended Text');
```

<a id="copying-moving-files"></a>
### Copiar y mover archivos

El método `copy` se puede usar para copiar un archivo existente a una nueva ubicación en el disco, mientras que el método `move` se puede usar para cambiar el nombre o mover un archivo existente a una nueva ubicación:

```php
Storage::copy('old/file.jpg', 'new/file.jpg');

Storage::move('old/file.jpg', 'new/file.jpg');
```

Puede utilizar los métodos `copyToDisk` y `moveToDisk` para copiar o mover un archivo a otro disco. La ruta del archivo de origen se utilizará en el disco de destino a menos que proporcione un tercer argumento:

```php
Storage::disk('local')->copyToDisk('s3', 'reports/report.csv');

Storage::disk('local')->moveToDisk(
    's3', 'reports/report.csv', 'archive/report.csv'
);
```

<a id="automatic-streaming"></a>
### Transmisión automática

La transmisión de archivos al almacenamiento ofrece un uso de memoria significativamente reducido. Si desea que Laravel administre automáticamente la transmisión de un archivo determinado a su ubicación de almacenamiento, puede usar el método `putFile` o `putFileAs`. Este método acepta una instancia `Illuminate\Http\File` o `Illuminate\Http\UploadedFile` y transmitirá automáticamente el archivo a la ubicación deseada:

```php
use Illuminate\Http\File;
use Illuminate\Support\Facades\Storage;

// Automatically generate a unique ID for filename...
$path = Storage::putFile('photos', new File('/path/to/photo'));

// Manually specify a filename...
$path = Storage::putFileAs('photos', new File('/path/to/photo'), 'photo.jpg');
```

Hay algunas cosas importantes a tener en cuenta sobre el método `putFile`. Tenga en cuenta que solo especificamos un nombre de directorio y no un nombre de archivo. De forma predeterminada, el método `putFile` generará una identificación única que servirá como nombre de archivo. La extensión del archivo se determinará examinando el tipo MIME del archivo. La ruta al archivo será devuelta por el método `putFile` para que pueda almacenar la ruta, incluido el nombre del archivo generado, en su base de datos.

Los métodos `putFile` y `putFileAs` también aceptan un argumento para especificar la "visibilidad" del archivo almacenado. Esto es particularmente útil si está almacenando el archivo en un disco en la nube como Amazon S3 y desea que el archivo sea accesible públicamente a través de URL generadas:

```php
Storage::putFile('photos', new File('/path/to/photo'), 'public');
```

<a id="file-uploads"></a>
### Cargas de archivos

En las aplicaciones web, uno de los casos de uso más comunes para almacenar archivos es almacenar archivos cargados por el usuario, como fotografías y documentos. Laravel hace que sea muy fácil almacenar archivos cargados utilizando el método `store` en una instancia de archivo cargado. Llame al método `store` con la ruta en la que desea almacenar el archivo cargado:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserAvatarController extends Controller
{
    /**
     * Update the avatar for the user.
     */
    public function update(Request $request): string
    {
        $path = $request->file('avatar')->store('avatars');

        return $path;
    }
}
```

Hay algunas cosas importantes a tener en cuenta sobre este ejemplo. Tenga en cuenta que solo especificamos un nombre de directorio, no un nombre de archivo. De forma predeterminada, el método `store` generará una identificación única que servirá como nombre de archivo. La extensión del archivo se determinará examinando el tipo MIME del archivo. La ruta al archivo será devuelta por el método `store` para que pueda almacenar la ruta, incluido el nombre del archivo generado, en su base de datos.

También puede llamar al método `putFile` en la fachada `Storage` para realizar la misma operación de almacenamiento de archivos que en el ejemplo anterior:

```php
$path = Storage::putFile('avatars', $request->file('avatar'));
```

<a id="specifying-a-file-name"></a>
#### Especificación de un nombre de archivo

Si no desea que se asigne automáticamente un nombre de archivo a su archivo almacenado, puede usar el método `storeAs`, que recibe la ruta, el nombre de archivo y el disco (opcional) como argumentos:

```php
$path = $request->file('avatar')->storeAs(
    'avatars', $request->user()->id
);
```

También puede utilizar el método `putFileAs` en la fachada `Storage`, que realizará la misma operación de almacenamiento de archivos que en el ejemplo anterior:

```php
$path = Storage::putFileAs(
    'avatars', $request->file('avatar'), $request->user()->id
);
```

> **Advertencia:**
> Los caracteres Unicode no imprimibles y no válidos se eliminarán automáticamente de las rutas de los archivos. Por lo tanto, es posible que desees desinfectar las rutas de tus archivos antes de pasarlas a los métodos de almacenamiento de archivos de Laravel. Las rutas de los archivos se normalizan utilizando el método `League\Flysystem\WhitespacePathNormalizer::normalizePath`.

<a id="specifying-a-disk"></a>
#### Especificación de un disco

De forma predeterminada, el método `store` de este archivo cargado utilizará su disco predeterminado. Si desea especificar otro disco, pase el nombre del disco como segundo argumento al método `store`:

```php
$path = $request->file('avatar')->store(
    'avatars/'.$request->user()->id, 's3'
);
```

Si está utilizando el método `storeAs`, puede pasar el nombre del disco como tercer argumento del método:

```php
$path = $request->file('avatar')->storeAs(
    'avatars',
    $request->user()->id,
    's3'
);
```

<a id="other-uploaded-file-information"></a>
#### Otra información del archivo cargado

Si desea obtener el nombre original y la extensión del archivo cargado, puede hacerlo utilizando los métodos `getClientOriginalName` y `getClientOriginalExtension`:

```php
$file = $request->file('avatar');

$name = $file->getClientOriginalName();
$extension = $file->getClientOriginalExtension();
```

Sin embargo, tenga en cuenta que los métodos `getClientOriginalName` y `getClientOriginalExtension` se consideran inseguros, ya que un usuario malintencionado puede alterar el nombre y la extensión del archivo. Por este motivo, normalmente deberías preferir los métodos `hashName` y `extension` para obtener un nombre y una extensión para la carga del archivo determinado:

```php
$file = $request->file('avatar');

$name = $file->hashName(); // Generate a unique, random name...
$extension = $file->extension(); // Determine the file's extension based on the file's MIME type...
```

<a id="file-visibility"></a>
### Visibilidad de archivos

En la integración Flysystem de Laravel, la "visibilidad" es una abstracción de los permisos de archivos en múltiples plataformas. Los archivos pueden declararse `public` o `private`. Cuando un archivo se declara `public`, estás indicando que el archivo generalmente debería ser accesible para otros. Por ejemplo, cuando utiliza el controlador S3, puede recuperar las URL de los archivos `public`.

Puede configurar la visibilidad al escribir el archivo mediante el método `put`:

```php
use Illuminate\Support\Facades\Storage;

Storage::put('file.jpg', $contents, 'public');
```

Si el archivo ya se ha almacenado, su visibilidad se puede recuperar y configurar mediante los métodos `getVisibility` y `setVisibility`:

```php
$visibility = Storage::getVisibility('file.jpg');

Storage::setVisibility('file.jpg', 'public');
```

Al interactuar con archivos cargados, puede utilizar los métodos `storePublicly` y `storePubliclyAs` para almacenar el archivo cargado con visibilidad `public`:

```php
$path = $request->file('avatar')->storePublicly('avatars', 's3');

$path = $request->file('avatar')->storePubliclyAs(
    'avatars',
    $request->user()->id,
    's3'
);
```

<a id="image-manipulation"></a>
### Manipulación de imágenes

Si necesita cambiar el tamaño, recortar o convertir una imagen cargada antes de almacenarla, puede usar las [funciones de manipulación de imágenes](../images/) de Laravel:

```php
$path = $request->image('avatar')
    ->cover(400, 400)
    ->toWebp()
    ->storePublicly('avatars', 'public');
```

También puedes crear una instancia de imagen a partir de un archivo ya almacenado en uno de los discos de tu sistema de archivos:

```php
$image = Storage::disk('public')->image('avatars/photo.jpg');
```

<a id="local-files-and-visibility"></a>
#### Archivos locales y visibilidad

Cuando se utiliza el controlador `local`, `public` [visibilidad](#file-visibility) se traduce en permisos `0755` para directorios y permisos `0644` para archivos. Puede modificar las asignaciones de permisos en el archivo de configuración `filesystems` de su aplicación:

```php
'local' => [
    'driver' => 'local',
    'root' => storage_path('app'),
    'permissions' => [
        'file' => [
            'public' => 0644,
            'private' => 0600,
        ],
        'dir' => [
            'public' => 0755,
            'private' => 0700,
        ],
    ],
    'throw' => false,
],
```

<a id="deleting-files"></a>
## Eliminar archivos

El método `delete` acepta un único nombre de archivo o una serie de archivos para eliminar:

```php
use Illuminate\Support\Facades\Storage;

Storage::delete('file.jpg');

Storage::delete(['file.jpg', 'file2.jpg']);
```

Si es necesario, puede especificar el disco desde el que se debe eliminar el archivo:

```php
use Illuminate\Support\Facades\Storage;

Storage::disk('s3')->delete('path/file.jpg');
```

<a id="directories"></a>
## Directorios

<a id="get-all-files-within-a-directory"></a>
#### Obtener todos los archivos dentro de un directorio

El método `files` devuelve una matriz de todos los archivos dentro de un directorio determinado. Si desea recuperar una lista de todos los archivos dentro de un directorio determinado, incluidos los subdirectorios, puede utilizar el método `allFiles`:

```php
use Illuminate\Support\Facades\Storage;

$files = Storage::files($directory);

$files = Storage::allFiles($directory);
```

<a id="get-all-directories-within-a-directory"></a>
#### Obtener todos los directorios dentro de un directorio

El método `directories` devuelve una matriz de todos los directorios dentro de un directorio determinado. Si desea recuperar una lista de todos los directorios dentro de un directorio determinado, incluidos los subdirectorios, puede utilizar el método `allDirectories`:

```php
$directories = Storage::directories($directory);

$directories = Storage::allDirectories($directory);
```

<a id="create-a-directory"></a>
#### Crear un directorio

El método `makeDirectory` creará el directorio proporcionado, incluidos los subdirectorios necesarios:

```php
Storage::makeDirectory($directory);
```

<a id="delete-a-directory"></a>
#### Eliminar un directorio

Finalmente, se puede utilizar el método `deleteDirectory` para eliminar un directorio y todos sus archivos:

```php
Storage::deleteDirectory($directory);
```

<a id="testing"></a>
## Pruebas

El método `fake` de la fachada `Storage` le permite generar fácilmente un disco falso que, combinado con las utilidades de generación de archivos de la clase `Illuminate\Http\UploadedFile`, simplifica enormemente las pruebas de carga de archivos. Por ejemplo:

```php tab=Pest
<?php

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('albums can be uploaded', function () {
    Storage::fake('photos');

    $response = $this->json('POST', '/photos', [
        UploadedFile::fake()->image('photo1.jpg'),
        UploadedFile::fake()->image('photo2.jpg')
    ]);

    // Assert one or more files were stored...
    Storage::disk('photos')->assertExists('photo1.jpg');
    Storage::disk('photos')->assertExists(['photo1.jpg', 'photo2.jpg']);

    // Assert one or more files were not stored...
    Storage::disk('photos')->assertMissing('missing.jpg');
    Storage::disk('photos')->assertMissing(['missing.jpg', 'non-existing.jpg']);

    // Assert that the number of files in a given directory matches the expected count...
    Storage::disk('photos')->assertCount('/wallpapers', 2);

    // Assert that a given directory is empty...
    Storage::disk('photos')->assertDirectoryEmpty('/wallpapers');

    // Assert that the disk contains no files...
    Storage::disk('photos')->assertEmpty();
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
    public function test_albums_can_be_uploaded(): void
    {
        Storage::fake('photos');

        $response = $this->json('POST', '/photos', [
            UploadedFile::fake()->image('photo1.jpg'),
            UploadedFile::fake()->image('photo2.jpg')
        ]);

        // Assert one or more files were stored...
        Storage::disk('photos')->assertExists('photo1.jpg');
        Storage::disk('photos')->assertExists(['photo1.jpg', 'photo2.jpg']);

        // Assert one or more files were not stored...
        Storage::disk('photos')->assertMissing('missing.jpg');
        Storage::disk('photos')->assertMissing(['missing.jpg', 'non-existing.jpg']);

        // Assert that the number of files in a given directory matches the expected count...
        Storage::disk('photos')->assertCount('/wallpapers', 2);

        // Assert that a given directory is empty...
        Storage::disk('photos')->assertDirectoryEmpty('/wallpapers');

        // Assert that the disk contains no files...
        Storage::disk('photos')->assertEmpty();
    }
}
```

De forma predeterminada, el método `fake` eliminará todos los archivos en su directorio temporal. Si desea conservar estos archivos, puede utilizar el método "persistentFake". Para obtener más información sobre cómo probar la carga de archivos, puede consultar la [información de la documentación de prueba HTTP sobre carga de archivos](../http-tests/#testing-file-uploads).

> **Advertencia:**
> El método `image` requiere la [extensión GD](https://www.php.net/manual/en/book.image.php).

<a id="custom-filesystems"></a>
## Sistemas de archivos personalizados

La integración Flysystem de Laravel brinda soporte para varios "controladores" listos para usar; sin embargo, Flysystem no se limita a estos y tiene adaptadores para muchos otros sistemas de almacenamiento. Puede crear un controlador personalizado si desea utilizar uno de estos adaptadores adicionales en su aplicación Laravel.

Para definir un sistema de archivos personalizado necesitará un adaptador Flysystem. Agreguemos un adaptador de Dropbox mantenido por la comunidad a nuestro proyecto:

```shell
composer require spatie/flysystem-dropbox
```

A continuación, puede registrar el controlador dentro del método `boot` de uno de los [proveedores de servicios](../providers/). Para lograr esto, debes utilizar el método `extend` de la fachada `Storage`:

```php
<?php

namespace App\Providers;

use Illuminate\Contracts\Foundation\Application;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\ServiceProvider;
use League\Flysystem\Filesystem;
use Spatie\Dropbox\Client as DropboxClient;
use Spatie\FlysystemDropbox\DropboxAdapter;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // ...
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Storage::extend('dropbox', function (Application $app, array $config) {
            $adapter = new DropboxAdapter(new DropboxClient(
                $config['authorization_token']
            ));

            return new FilesystemAdapter(
                new Filesystem($adapter, $config),
                $adapter,
                $config
            );
        });
    }
}
```

El primer argumento del método `extend` es el nombre del controlador y el segundo es un cierre que recibe las variables `$app` y `$config`. El cierre debe devolver una instancia de `Illuminate\Filesystem\FilesystemAdapter`. La variable `$config` contiene los valores definidos en `config/filesystems.php` para el disco especificado.

Una vez que haya creado y registrado el proveedor de servicios de la extensión, puede utilizar el controlador `dropbox` en su archivo de configuración `config/filesystems.php`.
