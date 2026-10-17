---
title: "Desarrollo de paquetes"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
    - [Creando un paquete](#creating-a-package)
    - [Una nota sobre Fachadas](#a-note-on-facades)
- [Paquete descubrimiento](#package-discovery)
- [Proveedores de servicios](#service-providers)
- [Recursos](#resources)
    - [Configuración](#configuration)
    - [Rutas](#routes)
    - [Migraciones](#migrations)
    - [Archivos de idioma](#language-files)
    - [Vistas](#views)
    - [Ver componentes](#view-components)
    - ["Acerca de" Comando Artesano](#about-artisan-command)
- [Comandos](#commands)
    - [Optimizar comandos](#optimize-commands)
    - [Recargar comandos](#reload-commands)
- [Bienes Públicos](#public-assets)
- [Publicación de grupos de archivos](#publishing-file-groups)

<a id="introduction"></a>
## Introducción

Los paquetes son la forma principal de agregar funcionalidad a Laravel. Los paquetes pueden ser cualquier cosa, desde una excelente manera de trabajar con fechas como [Carbon](https://github.com/briannesbitt/Carbon) o un paquete que le permite asociar archivos con modelos de Eloquent como [Laravel Media Library](https://github.com/spatie/laravel-medialibrary).

Hay diferentes tipos de paquetes. Algunos paquetes son independientes, lo que significa que funcionan con cualquier marco PHP. Carbon y Pest son ejemplos de paquetes independientes. Cualquiera de estos paquetes se puede utilizar con Laravel solicitándolos en su archivo `composer.json`.

Por otro lado, otros paquetes están diseñados específicamente para usarse con Laravel. Estos paquetes pueden tener rutas, controladores, vistas y configuraciones destinadas específicamente a mejorar una aplicación Laravel. Esta guía cubre principalmente el desarrollo de aquellos paquetes que son específicos de Laravel.

<a id="creating-a-package"></a>
### Creando un paquete

La forma más sencilla de empezar a crear un nuevo paquete Laravel es el [esqueleto oficial de paquetes Laravel](https://github.com/laravel/package-skeleton). El esqueleto proporciona todo lo que necesita para crear un paquete Laravel, incluido un proveedor de servicios, pruebas mediante Pest, análisis estático mediante Larastan, formato de código mediante Pint y una aplicación de banco de trabajo para el desarrollo de paquetes de un extremo a otro. Puede crear un nuevo paquete usando el comando `package` del [instalador de Laravel CLI](../installation/#creating-a-laravel-project):

```shell
laravel package my-package
```

Un script de configuración interactivo personalizará el esqueleto de su paquete, configurando su espacio de nombres, proveedor de servicios y solo las funciones que necesita, como archivos de configuración, rutas, vistas, traducciones, migraciones, activos, comandos y una fachada.

<a id="a-note-on-facades"></a>
### Una nota sobre fachadas

Al escribir una aplicación Laravel, generalmente no importa si usa contratos o fachadas, ya que ambos proporcionan niveles esencialmente iguales de capacidad de prueba. Sin embargo, al escribir paquetes, su paquete normalmente no tendrá acceso a todos los ayudantes de prueba de Laravel. Si desea poder escribir las pruebas de su paquete como si el paquete estuviera instalado dentro de una aplicación Laravel típica, puede usar el paquete [Orchestral Testbench](https://github.com/orchestral/testbench).

<a id="package-discovery"></a>
## Descubrimiento de paquetes

El archivo `bootstrap/providers.php` de una aplicación Laravel contiene la lista de proveedores de servicios que Laravel debe cargar. Sin embargo, en lugar de requerir que los usuarios agreguen manualmente su proveedor de servicios a la lista, puede definir el proveedor en la sección `extra` del archivo `composer.json` de su paquete para que Laravel lo cargue automáticamente. Además de los proveedores de servicios, también puede enumerar cualquier [facades](../facades/) que desee que se registre:

```json
"extra": {
    "laravel": {
        "providers": [
            "Barryvdh\\Debugbar\\ServiceProvider"
        ],
        "aliases": {
            "Debugbar": "Barryvdh\\Debugbar\\Facade"
        }
    }
},
```

Una vez que su paquete haya sido configurado para descubrimiento, Laravel registrará automáticamente sus proveedores de servicios y fachadas cuando se instale, creando una experiencia de instalación conveniente para los usuarios de su paquete.

<a id="opting-out-of-package-discovery"></a>
#### Optar por no participar en el descubrimiento de paquetes

Si es el consumidor de un paquete y desea deshabilitar la detección de paquetes para un paquete, puede incluir el nombre del paquete en la sección `extra` del archivo `composer.json` de su aplicación:

```json
"extra": {
    "laravel": {
        "dont-discover": [
            "barryvdh/laravel-debugbar"
        ]
    }
},
```

Puede deshabilitar la detección de paquetes para todos los paquetes utilizando el carácter `*` dentro de la directiva `dont-discover` de su aplicación:

```json
"extra": {
    "laravel": {
        "dont-discover": [
            "*"
        ]
    }
},
```

<a id="service-providers"></a>
## Proveedores de servicios

[Los proveedores de servicios](../providers/) son el punto de conexión entre su paquete y Laravel. Un proveedor de servicios es responsable de vincular cosas al [contenedor de servicios](../container/) de Laravel e informar a Laravel dónde cargar los recursos del paquete, como vistas, configuración y archivos de idioma.

Un proveedor de servicios amplía la clase `Illuminate\Support\ServiceProvider` y contiene dos métodos: `register` y `boot`. La clase base `ServiceProvider` se encuentra en el paquete `illuminate/support` Composer, que debe agregar a las dependencias de su propio paquete. Para obtener más información sobre la estructura y el propósito de los proveedores de servicios, consulte [su documentación](../providers/).

<a id="resources"></a>
## Recursos

<a id="configuration"></a>
### Configuración

Normalmente, deberá publicar el archivo de configuración de su paquete en el directorio `config` de la aplicación. Esto permitirá a los usuarios de su paquete anular fácilmente sus opciones de configuración predeterminadas. Para permitir que se publiquen sus archivos de configuración, llame al método `publishes` desde el método `boot` de su proveedor de servicios:

```php
/**
 * Bootstrap any package services.
 */
public function boot(): void
{
    $this->publishes([
        __DIR__.'/../config/courier.php' => config_path('courier.php'),
    ]);
}
```

Ahora, cuando los usuarios de su paquete ejecuten el comando `vendor:publish` de Laravel, su archivo se copiará a la ubicación de publicación especificada. Una vez publicada su configuración, se podrá acceder a sus valores como a cualquier otro archivo de configuración:

```php
$value = config('courier.option');
```

> **Advertencia:**
> No debes definir cierres en tus archivos de configuración. No se pueden serializar correctamente cuando los usuarios ejecutan el comando `config:cache` Artisan.

<a id="default-package-configuration"></a>
#### Configuración del paquete predeterminado

También puede fusionar su propio archivo de configuración del paquete con la copia publicada de la aplicación. Esto permitirá a sus usuarios definir solo las opciones que realmente desean anular en la copia publicada del archivo de configuración. Para fusionar los valores del archivo de configuración, utilice el método `mergeConfigFrom` dentro del método `register` de su proveedor de servicios.

El método `mergeConfigFrom` acepta la ruta al archivo de configuración de su paquete como primer argumento y el nombre de la copia de la aplicación del archivo de configuración como segundo argumento:

```php
/**
 * Register any package services.
 */
public function register(): void
{
    $this->mergeConfigFrom(
        __DIR__.'/../config/courier.php', 'courier'
    );
}
```

> **Advertencia:**
> Este método solo fusiona el primer nivel de la matriz de configuración. Si sus usuarios definen parcialmente una matriz de configuración multidimensional, las opciones que faltan no se fusionarán.

<a id="routes"></a>
### Rutas

Si su paquete contiene rutas, puede cargarlas usando el método `loadRoutesFrom`. Este método determinará automáticamente si las rutas de la aplicación están almacenadas en caché y no cargará su archivo de rutas si las rutas ya están almacenadas en caché:

```php
/**
 * Bootstrap any package services.
 */
public function boot(): void
{
    $this->loadRoutesFrom(__DIR__.'/../routes/web.php');
}
```

<a id="migrations"></a>
### Migraciones

Si su paquete contiene [migraciones de base de datos](../migrations/), puede usar el método `publishesMigrations` para informar a Laravel que el directorio o archivo dado contiene migraciones. Cuando Laravel publique las migraciones, actualizará automáticamente la marca de tiempo dentro de su nombre de archivo para reflejar la fecha y hora actuales:

```php
/**
 * Bootstrap any package services.
 */
public function boot(): void
{
    $this->publishesMigrations([
        __DIR__.'/../database/migrations' => database_path('migrations'),
    ]);
}
```

<a id="language-files"></a>
### Archivos de idioma

Si su paquete contiene [archivos de idioma](../localization/), puede usar el método `loadTranslationsFrom` para informar a Laravel cómo cargarlos. Por ejemplo, si su paquete se llama `courier`, debe agregar lo siguiente al método `boot` de su proveedor de servicios:

```php
/**
 * Bootstrap any package services.
 */
public function boot(): void
{
    $this->loadTranslationsFrom(__DIR__.'/../lang', 'courier');
}
```

Se hace referencia a las líneas de traducción de paquetes mediante la convención de sintaxis `package::file.line`. Por lo tanto, puede cargar la línea `welcome` del paquete `courier` desde el archivo `messages` de esta manera:

```php
echo trans('courier::messages.welcome');
```

Puede registrar archivos de traducción JSON para su paquete utilizando el método `loadJsonTranslationsFrom`. Este método acepta la ruta al directorio que contiene los archivos de traducción JSON de su paquete:

```php
/**
 * Bootstrap any package services.
 */
public function boot(): void
{
    $this->loadJsonTranslationsFrom(__DIR__.'/../lang');
}
```

<a id="publishing-language-files"></a>
#### Publicación de archivos de idioma

Si desea publicar los archivos de idioma de su paquete en el directorio `lang/vendor` de la aplicación, puede utilizar el método `publishes` del proveedor de servicios. El método `publishes` acepta una variedad de rutas de paquetes y sus ubicaciones de publicación deseadas. Por ejemplo, para publicar los archivos de idioma para el paquete `courier`, puede hacer lo siguiente:

```php
/**
 * Bootstrap any package services.
 */
public function boot(): void
{
    $this->loadTranslationsFrom(__DIR__.'/../lang', 'courier');

    $this->publishes([
        __DIR__.'/../lang' => $this->app->langPath('vendor/courier'),
    ]);
}
```

Ahora, cuando los usuarios de su paquete ejecuten el comando `vendor:publish` Artisan de Laravel, los archivos de idioma de su paquete se publicarán en la ubicación de publicación especificada.

<a id="views"></a>
### Vistas

Para registrar las [views](../views/) de su paquete con Laravel, debe indicarle a Laravel dónde se encuentran las vistas. Puede hacerlo utilizando el método `loadViewsFrom` del proveedor de servicios. El método `loadViewsFrom` acepta dos argumentos: la ruta a sus plantillas de vista y el nombre de su paquete. Por ejemplo, si el nombre de su paquete es `courier`, agregaría lo siguiente al método `boot` de su proveedor de servicios:

```php
/**
 * Bootstrap any package services.
 */
public function boot(): void
{
    $this->loadViewsFrom(__DIR__.'/../resources/views', 'courier');
}
```

Se hace referencia a las vistas de paquetes mediante la convención de sintaxis `package::view`. Entonces, una vez que su ruta de vista esté registrada en un proveedor de servicios, puede cargar la vista `dashboard` desde el paquete `courier` de esta manera:

```php
Route::get('/dashboard', function () {
    return view('courier::dashboard');
});
```

<a id="overriding-package-views"></a>
#### Anulación de vistas de paquetes

Cuando utiliza el método `loadViewsFrom`, Laravel en realidad registra dos ubicaciones para sus vistas: el directorio `resources/views/vendor` de la aplicación y el directorio que usted especifica. Entonces, usando el paquete `courier` como ejemplo, Laravel primero verificará si el desarrollador ha colocado una versión personalizada de la vista en el directorio `resources/views/vendor/courier`. Luego, si la vista no se ha personalizado, Laravel buscará el directorio de vista de paquetes que especificó en su llamada a `loadViewsFrom`. Esto facilita a los usuarios del paquete personalizar/anular las vistas de su paquete.

<a id="publishing-views"></a>
#### Vistas de publicación

Si desea que sus vistas estén disponibles para su publicación en el directorio `resources/views/vendor` de la aplicación, puede utilizar el método `publishes` del proveedor de servicios. El método `publishes` acepta una variedad de rutas de vista de paquetes y sus ubicaciones de publicación deseadas:

```php
/**
 * Bootstrap the package services.
 */
public function boot(): void
{
    $this->loadViewsFrom(__DIR__.'/../resources/views', 'courier');

    $this->publishes([
        __DIR__.'/../resources/views' => resource_path('views/vendor/courier'),
    ]);
}
```

Ahora, cuando los usuarios de su paquete ejecuten el comando `vendor:publish` Artisan de Laravel, las vistas de su paquete se copiarán en la ubicación de publicación especificada.

<a id="view-components"></a>
### Ver componentes

Si está creando un paquete que utiliza componentes Blade o colocando componentes en directorios no convencionales, necesitará registrar manualmente su clase de componente y su alias de etiqueta HTML para que Laravel sepa dónde encontrar el componente. Normalmente deberías registrar tus componentes en el método `boot` del proveedor de servicios de tu paquete:

```php
use Illuminate\Support\Facades\Blade;
use VendorPackage\View\Components\AlertComponent;

/**
 * Bootstrap your package's services.
 */
public function boot(): void
{
    Blade::component('package-alert', AlertComponent::class);
}
```

Una vez que su componente haya sido registrado, podrá renderizarlo usando su alias de etiqueta:

```blade
<x-package-alert/>
```

<a id="autoloading-package-components"></a>
#### Componentes del paquete de carga automática

Alternativamente, puede utilizar el método `componentNamespace` para cargar automáticamente las clases de componentes por convención. Por ejemplo, un paquete `Nightshade` podría tener componentes `Calendar` y `ColorPicker` que residen dentro del espacio de nombres `Nightshade\Views\Components`:

```php
use Illuminate\Support\Facades\Blade;

/**
 * Bootstrap your package's services.
 */
public function boot(): void
{
    Blade::componentNamespace('Nightshade\\Views\\Components', 'nightshade');
}
```

Esto permitirá el uso de componentes del paquete por parte del espacio de nombres de su proveedor utilizando la sintaxis `package-name::`:

```blade
<x-nightshade::calendar />
<x-nightshade::color-picker />
```

Blade detectará automáticamente la clase que está vinculada a este componente escribiendo en Pascal el nombre del componente. Los subdirectorios también son compatibles con la notación de "puntos".

<a id="anonymous-components"></a>
#### Componentes anónimos

Si su paquete contiene componentes anónimos, deben colocarse dentro de un directorio `components` del directorio "vistas" de su paquete (como lo especifica el [método loadViewsFrom](#views)). Luego, puede representarlos anteponiendo al nombre del componente el espacio de nombres de vista del paquete:

```blade
<x-courier::alert />
```

<a id="about-artisan-command"></a>
### "Acerca de" Comando Artesano

El comando `about` Artisan integrado de Laravel proporciona una sinopsis del entorno y la configuración de la aplicación. Los paquetes pueden enviar información adicional a la salida de este comando a través de la clase `AboutCommand`. Normalmente, esta información se puede agregar desde el método `boot` de su proveedor de servicios de paquetes:

```php
use Illuminate\Foundation\Console\AboutCommand;

/**
 * Bootstrap any package services.
 */
public function boot(): void
{
    AboutCommand::add('My Package', fn () => ['Version' => '1.0.0']);
}
```

<a id="commands"></a>
## Comandos

Para registrar los comandos Artisan de su paquete con Laravel, puede usar el método `commands`. Este método espera una serie de nombres de clases de comando. Una vez registrados los comandos, podrá ejecutarlos utilizando el [Artisan CLI](../artisan/):

```php
use Courier\Console\Commands\InstallCommand;
use Courier\Console\Commands\NetworkCommand;

/**
 * Bootstrap any package services.
 */
public function boot(): void
{
    if ($this->app->runningInConsole()) {
        $this->commands([
            InstallCommand::class,
            NetworkCommand::class,
        ]);
    }
}
```

<a id="optimize-commands"></a>
### Optimizar comandos

El comando de optimización [](../deployment/#optimization) de Laravel almacena en caché la configuración, los eventos, las rutas y las vistas de la aplicación. Usando el método `optimizes`, puede registrar los comandos Artisan propios de su paquete que deben invocarse cuando se ejecutan los comandos `optimize` y `optimize:clear`:

```php
/**
 * Bootstrap any package services.
 */
public function boot(): void
{
    if ($this->app->runningInConsole()) {
        $this->optimizes(
            optimize: 'package:optimize',
            clear: 'package:clear-optimizations',
        );
    }
}
```

<a id="reload-commands"></a>
### Recargar comandos

El [comando de recarga](../deployment/#reloading-services) de Laravel finaliza cualquier servicio en ejecución para que un monitor de proceso del sistema pueda reiniciarlo automáticamente. Usando el método `reloads`, puede registrar los comandos Artisan propios de su paquete que deben invocarse cuando se ejecuta el comando `reload`:

```php
/**
 * Bootstrap any package services.
 */
public function boot(): void
{
    if ($this->app->runningInConsole()) {
        $this->reloads('package:reload');
    }
}
```

<a id="public-assets"></a>
## Bienes Públicos

Su paquete puede tener recursos como JavaScript, CSS e imágenes. Para publicar estos activos en el directorio `public` de la aplicación, utilice el método `publishes` del proveedor de servicios. En este ejemplo, también agregaremos una etiqueta de grupo de activos `public`, que puede usarse para publicar fácilmente grupos de activos relacionados:

```php
/**
 * Bootstrap any package services.
 */
public function boot(): void
{
    $this->publishes([
        __DIR__.'/../public' => public_path('vendor/courier'),
    ], 'public');
}
```

Ahora, cuando los usuarios de su paquete ejecuten el comando `vendor:publish`, sus activos se copiarán en la ubicación de publicación especificada. Dado que los usuarios normalmente necesitarán sobrescribir los recursos cada vez que se actualice el paquete, pueden usar el indicador `--force`:

```shell
php artisan vendor:publish --tag=public --force
```

<a id="publishing-file-groups"></a>
## Publicación de grupos de archivos

Es posible que desee publicar grupos de activos y recursos de paquetes por separado. Por ejemplo, es posible que desee permitir que sus usuarios publiquen los archivos de configuración de su paquete sin verse obligados a publicar los activos de su paquete. Puede hacerlo "etiquetándolos" cuando llame al método `publishes` desde el proveedor de servicios de un paquete. Por ejemplo, usemos etiquetas para definir dos grupos de publicación para el paquete `courier` (`courier-config` y `courier-migrations`) en el método `boot` del proveedor de servicios del paquete:

```php
/**
 * Bootstrap any package services.
 */
public function boot(): void
{
    $this->publishes([
        __DIR__.'/../config/package.php' => config_path('package.php')
    ], 'courier-config');

    $this->publishesMigrations([
        __DIR__.'/../database/migrations/' => database_path('migrations')
    ], 'courier-migrations');
}
```

Ahora sus usuarios pueden publicar estos grupos por separado haciendo referencia a su etiqueta al ejecutar el comando `vendor:publish`:

```shell
php artisan vendor:publish --tag=courier-config
```

Sus usuarios también pueden publicar todos los archivos publicables definidos por el proveedor de servicios de su paquete usando el indicador `--provider`:

```shell
php artisan vendor:publish --provider="Your\Package\ServiceProvider"
```
