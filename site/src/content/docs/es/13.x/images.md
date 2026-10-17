---
title: "Manipulación de imágenes"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Instalación](#installation)
    - [Configuración](#configuration)
- [Leyendo Imágenes](#reading-images)
    - [Archivos cargados](#uploaded-files)
    - [Archivos de almacenamiento](#storage-files)
    - [Otras fuentes](#other-sources)
- [Manipulación de imágenes](#manipulating-images)
    - [Cambiar el tamaño de las imágenes](#resizing-images)
    - [Otras Transformaciones](#other-transformations)
- [Codificación de imágenes](#encoding-images)
- [Almacenamiento de imágenes](#storing-images)
- [Inspeccionando imágenes](#inspecting-images)
- [Controladores de imagen](#image-drivers)
    - [Controladores de imagen personalizados](#custom-image-drivers)
    - [Transformaciones personalizadas](#custom-transformations)

<a id="introduction"></a>
## Introducción

Laravel proporciona una API de manipulación fluida de imágenes que le permite cambiar el tamaño, recortar, codificar y almacenar imágenes utilizando las mismas convenciones expresivas que se encuentran en todo el marco. Las funciones de imagen de Laravel funcionan con [Intervention Image](https://image.intervention.io/) y son compatibles con las extensiones PHP GD e Imagick.

La API de imágenes es útil cuando se trabaja con archivos cargados, archivos almacenados en Laravel [discos del sistema de archivos](../filesystem/), archivos locales, URL remotas o bytes de imágenes sin formato:

```php
use Illuminate\Support\Facades\Image;

$path = Image::fromStorage('avatars/photo.jpg', 'public')
    ->cover(400, 400)
    ->toWebp()
    ->quality(80)
    ->storePublicly('avatars', 'public');
```

> **Advertencia:**
> La manipulación de imágenes puede consumir mucha CPU y memoria. Considere realizar cargas de trabajo de procesamiento de imágenes grandes en un [trabajo en cola](../queues/) en lugar de hacerlo durante la solicitud HTTP que recibe la carga.

<a id="installation"></a>
## Instalación

Antes de utilizar las funciones de manipulación de imágenes de Laravel, instale el paquete Intervention Image a través de Composer:

```shell
composer require intervention/image:^4.0
```

También debe asegurarse de que su instalación PHP tenga instalada la extensión GD o Imagick, dependiendo del controlador que utilizará su aplicación.

<a id="configuration"></a>
### Configuración

El archivo de configuración de imagen de Laravel se encuentra en `config/images.php`. Si su aplicación no tiene un archivo de configuración `images`, puede publicarlo usando el comando `config:publish` Artisan:

```shell
php artisan config:publish images
```

El archivo de configuración de imagen le permite especificar el controlador de imagen predeterminado de su aplicación. También puede especificar el controlador predeterminado utilizando la variable de entorno `IMAGE_DRIVER`. Los controladores compatibles son `gd` y `imagick`:

```ini
IMAGE_DRIVER=imagick
```

<a id="reading-images"></a>
## Leyendo imágenes

La fachada `Image` proporciona varios métodos para leer imágenes de fuentes comunes. El contenido de la imagen se carga de forma diferida, por lo que la fuente normalmente no se lee hasta que se procesa la imagen o se solicitan sus bytes.

<a id="uploaded-files"></a>
### Archivos cargados

Puede recuperar una imagen cargada de una solicitud entrante utilizando el método `image`. Este método devuelve una instancia `Illuminate\Image\Image` para el archivo cargado, o `null` si el archivo no está presente:

```php
use Illuminate\Http\Request;

Route::post('/avatar', function (Request $request) {
    $request->validate(['avatar' => ['required', 'image']]);

    $path = $request->image('avatar')
        ->cover(400, 400)
        ->toWebp()
        ->storePublicly('avatars', 'public');

    // ...
});
```

Alternativamente, puede crear una instancia de imagen a partir de una instancia `Illuminate\Http\UploadedFile` usando el método `fromUpload`:

```php
use Illuminate\Support\Facades\Image;

$image = Image::fromUpload($request->file('avatar'));
```

Cuando se crea una imagen a partir de un archivo cargado, puede recuperar el archivo cargado subyacente utilizando el método `file`:

```php
$file = $image->file();
```

<a id="storage-files"></a>
### Archivos de almacenamiento

Puede crear una instancia de imagen a partir de un archivo almacenado en uno de los [discos del sistema de archivos ](../filesystem/) de su aplicación utilizando el método `fromStorage`. El primer argumento es la ruta al archivo, mientras que el segundo argumento es el nombre del disco:

```php
use Illuminate\Support\Facades\Image;

$image = Image::fromStorage('avatars/photo.jpg', disk: 'public');
```

También puede crear instancias de imágenes directamente desde una instancia de disco del sistema de archivos usando el método `image`:

```php
use Illuminate\Support\Facades\Storage;

$image = Storage::disk('public')->image('avatars/photo.jpg');
```

<a id="other-sources"></a>
### Otras fuentes

La fachada `Image` también incluye métodos para crear instancias de imágenes a partir de bytes sin formato, rutas de archivos locales, URL remotas y cadenas codificadas en Base64:

```php
use Illuminate\Support\Facades\Image;

$image = Image::fromBytes($contents);
$image = Image::fromBase64($base64);
$image = Image::fromPath(storage_path('app/avatars/photo.jpg'));
$image = Image::fromUrl('https://example.com/photo.jpg');
```

<a id="manipulating-images"></a>
## Manipulación de imágenes

Las instancias de imágenes son inmutables. Cada método de manipulación devuelve una nueva instancia de imagen con la transformación adjunta a su canal de procesamiento, lo que permite encadenar métodos con fluidez:

```php
$image = $request->image('avatar')
    ->orient()
    ->cover(400, 400)
    ->sharpen(10);
```

Las transformaciones se procesan en el orden en que se agregan al canal de imágenes y la imagen solo se codifica una vez al final.

<a id="resizing-images"></a>
### Cambiar el tamaño de las imágenes

El método `resize` cambia el tamaño de una imagen a las dimensiones dadas. Puede proporcionar tanto el ancho como el alto, o proporcionar solo una dimensión usando argumentos con nombre:

```php
$image = $image->resize(800, 600);
$image = $image->resize(width: 800);
$image = $image->resize(height: 600);
```

El método `scale` reduce proporcionalmente una imagen para que se ajuste a las dimensiones dadas. Este método nunca aumentará el tamaño de una imagen:

```php
$image = $image->scale(800, 600);
$image = $image->scale(width: 800);
$image = $image->scale(height: 600);
```

El método `cover` cambia el tamaño y recorta una imagen para cubrir completamente las dimensiones dadas:

```php
$image = $image->cover(400, 400);
```

El método `contain` cambia el tamaño de una imagen para que se ajuste a las dimensiones dadas y al mismo tiempo conserva la imagen completa. Si es necesario, el espacio vacío se rellenará utilizando el color de fondo opcional:

```php
$image = $image->contain(400, 400);
$image = $image->contain(400, 400, '#ffffff');
$image = $image->contain(400, 400, 'dominant');
```

Puede especificar `dominant` como color de fondo para llenar el espacio vacío utilizando el color dominante de la imagen.

Puede recortar una imagen utilizando el método `crop`. Los primeros dos argumentos son el ancho y el alto deseados, y los argumentos tercero y cuarto opcionales especifican las coordenadas `x` y `y` del cultivo:

```php
$image = $image->crop(300, 200);
$image = $image->crop(300, 200, x: 50, y: 25);
```

<a id="other-transformations"></a>
### Otras transformaciones

Laravel también proporciona una variedad de métodos adicionales de transformación de imágenes:

```php
$image = $image->orient();
$image = $image->rotate(90);
$image = $image->rotate(90, '#ffffff');
$image = $image->rotate(90, 'dominant');
$image = $image->blur(5);
$image = $image->grayscale();
$image = $image->sharpen(10);
$image = $image->flipVertically();
$image = $image->flipHorizontally();
```

El método `orient` gira la imagen según sus datos de orientación EXIF. El método `rotate` gira la imagen en el sentido de las agujas del reloj en el ángulo dado y acepta un color de fondo opcional. Los métodos `blur` y `sharpen` aceptan valores entre `0` y `100`.

<a id="conditional-transformations"></a>
#### Transformaciones condicionales

Las instancias de imagen admiten el rasgo `Conditionable` de Laravel, lo que le permite aplicar transformaciones condicionalmente utilizando los métodos `when` y `unless`:

```php
$image = $request->image('avatar')
    ->when($request->boolean('crop'), fn ($image) => $image->cover(400, 400))
    ->unless($request->boolean('preserve_format'), fn ($image) => $image->toWebp());
```

<a id="encoding-images"></a>
## Codificación de imágenes

De forma predeterminada, las imágenes procesadas se codifican utilizando su formato original. Sin embargo, puede convertir la imagen a otro formato compatible antes de recuperarla o almacenarla:

```php
$image = $image->toWebp();
$image = $image->toJpg();
$image = $image->toJpeg();
$image = $image->toPng();
$image = $image->toGif();
$image = $image->toAvif();
$image = $image->toBmp();
```

Puede utilizar el método `quality` para configurar la calidad de salida. La calidad quedará fijada entre `1` y `100`:

```php
$image = $image->toWebp()->quality(80);
```

El método `optimize` es un atajo conveniente para convertir la imagen a un formato determinado y configurar su calidad. De forma predeterminada, las imágenes están optimizadas como imágenes WebP con una calidad de `70`:

```php
$image = $image->optimize();

$image = $image->optimize(format: 'jpg', quality: 85);
```

Puede recuperar el contenido de la imagen procesada como una cadena de bytes, una cadena codificada en base64 o un URI de datos:

```php
$bytes = $image->toBytes();
$base64 = $image->toBase64();
$dataUri = $image->toDataUri();
```

Una instancia de imagen también se puede convertir en una cadena para recuperar un URI de datos:

```php
$dataUri = (string) $image;
```

<a id="storing-images"></a>
## Almacenamiento de imágenes

El método `store` almacena la imagen procesada en uno de los discos del sistema de archivos de su aplicación. Al igual que los archivos cargados, Laravel generará un nombre de archivo único y devolverá la ruta almacenada. El segundo argumento se puede utilizar para especificar el disco:

```php
$path = $request->image('avatar')
    ->cover(400, 400)
    ->store(path: 'avatars');

$path = $request->image('avatar')
    ->cover(400, 400)
    ->store(path: 'avatars', disk: 's3');
```

Puede utilizar el método `storeAs` para especificar el nombre del archivo almacenado:

```php
$path = $request->image('avatar')
    ->cover(400, 400)
    ->storeAs(path: 'avatars', name: 'avatar.jpg', disk: 'public');
```

Los métodos `storePublicly` y `storePubliclyAs` almacenan la imagen con visibilidad `public`:

```php
$path = $request->image('avatar')
    ->cover(400, 400)
    ->storePublicly(path: 'avatars', disk: 'public');

$path = $request->image('avatar')
    ->cover(400, 400)
    ->storePubliclyAs(path: 'avatars', name: 'avatar.webp', disk: 'public');
```

Si la imagen no se pudo almacenar, los métodos de almacenamiento devuelven `false`.

<a id="inspecting-images"></a>
## Inspeccionar imágenes

Puede recuperar el tipo MIME, la extensión, las dimensiones, el ancho, el alto y el color dominante de la imagen utilizando los siguientes métodos:

```php
$mimeType = $image->mimeType();
$extension = $image->extension();

[$width, $height] = $image->dimensions();
$width = $image->width();
$height = $image->height();

$dominantColor = $image->dominantColor();
```

Estos métodos operan sobre la imagen procesada. Por ejemplo, llamar a `width` después de `cover(400, 400)` devolverá `400`.

<a id="image-drivers"></a>
## Controladores de imagen

<a id="custom-image-drivers"></a>
### Controladores de imagen personalizados

El administrador de imágenes de Laravel amplía la clase base `Illuminate\Support\Manager` de Laravel. Esto significa que puede registrar controladores de imágenes personalizados utilizando el método `extend` disponible en el administrador de imágenes y en la fachada `Image`.

Los controladores de imágenes personalizados deben implementar la interfaz `Illuminate\Contracts\Image\Driver`. El método `process` recibe el contenido de la imagen original y el `Illuminate\Image\ImagePipeline` ordenado que debe aplicarse a la imagen y debe devolver los bytes de la imagen procesada. El método `dimensions` debería devolver el ancho y el alto de la imagen, mientras que el método `dominantColor` debería devolver el color promedio de la imagen como una cadena hexadecimal:

```php
<?php

namespace App\Images;

use Illuminate\Contracts\Image\Driver;
use Illuminate\Image\ImagePipeline;

class VipsDriver implements Driver
{
    /**
     * Process the given image contents with the specified pipeline.
     */
    public function process(string $contents, ImagePipeline $pipeline): string
    {
        // Apply the pipeline's transformations and output options...

        return $contents;
    }

    /**
     * Get the dimensions of the given image contents.
     */
    public function dimensions(string $contents): array
    {
        // Read the image's width and height...

        return [0, 0];
    }

    /**
     * Get the dominant (average) color of the image as a hex string.
     */
    public function dominantColor(string $contents): string
    {
        // Calculate the image's average color...

        return '#000000';
    }

    /**
     * Register a transformation handler.
     */
    public function transformUsing(string $transformation, callable $callback): static
    {
        // Store the handler so it may be applied while processing the pipeline...

        return $this;
    }
}
```

> **Nota:**
> Para comprender mejor cómo implementar un controlador de imagen personalizado, puede revisar la clase `Illuminate\Image\Drivers\InterventionDriver` incorporada en el marco.

Una vez que haya implementado su controlador personalizado, puede registrarlo utilizando el método `extend` de la fachada `Image`. Normalmente, esto se debe hacer con el método `boot` de un proveedor de servicios:

```php
use App\Images\VipsDriver;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\Facades\Image;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Image::extend('vips', function (Application $app) {
        return new VipsDriver;
    });
}
```

Después de registrar el controlador, puede usarlo para una imagen específica usando el método `using`:

```php
$image = $request->image('avatar')
    ->using('vips')
    ->cover(400, 400);
```

También puede configurar un controlador personalizado como controlador de imagen predeterminado de su aplicación usando la opción `default` en el archivo de configuración `config/images.php` de su aplicación o la variable de entorno `IMAGE_DRIVER`:

```ini
IMAGE_DRIVER=vips
```

<a id="custom-transformations"></a>
### Transformaciones personalizadas

Las aplicaciones y los paquetes pueden definir transformaciones personalizadas mediante la creación de una clase que implemente el contrato `Illuminate\Contracts\Image\Transformation`. Luego se pueden agregar transformaciones personalizadas a una canalización de imágenes utilizando el método `transform`:

```php
<?php

namespace App\Images\Transformations;

use Illuminate\Contracts\Image\Transformation;

class Pixelate implements Transformation
{
    public function __construct(
        public readonly int $size,
    ) {
        //
    }
}
```

A continuación, registre un controlador para la transformación y un controlador utilizando el método `transformUsing` de la fachada `Image`. Normalmente, esto se debe hacer con el método `boot` de un proveedor de servicios:

```php
use App\Images\Transformations\Pixelate;
use Illuminate\Support\Facades\Image;
use Intervention\Image\Interfaces\ImageInterface;

Image::transformUsing('gd', Pixelate::class, function (ImageInterface $image, Pixelate $transformation) {
    return $image->pixelate($transformation->size);
});
```

Una vez que se haya registrado el controlador de transformación, puede aplicar la transformación a una imagen:

```php
use App\Images\Transformations\Pixelate;

$image = $request->image('avatar')
    ->transform(new Pixelate(12))
    ->store('avatars');
```
