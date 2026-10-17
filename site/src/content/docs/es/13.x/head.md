---
title: "Cabeza de Laravel"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Instalación](#installation)
- [Inicio rápido](#quickstart)
- [Precedencia de resolución](#resolution-precedence)
- [Definición de metadatos](#defining-metadata)
    - [Valores predeterminados](#defaults)
    - [Metadatos de ruta](#route-metadata)
    - [Metadatos de tiempo de ejecución](#runtime-metadata)
    - [Páginas de error](#error-pages)
- [Abrir gráfico](#open-graph)
    - [Tarjetas X / Twitter](#twitter-cards)
- [Colores del tema](#theme-colors)
- [Metadatos e íconos de la aplicación](#app-metadata-and-icons)
- [Aplicaciones web progresivas](#progressive-web-apps)
- [Rendimiento y descubrimiento](#performance-and-discovery)
- [Etiquetas personalizadas](#custom-tags)
- [Esquemas](#schemas)
    - [Pan rallado](#breadcrumbs)
    - [Preguntas frecuentes](#faqs)
    - [Esquemas personalizados](#custom-schemas)
- [Representación](#rendering)
    - [Blade](#blade)
    - [Livewire](#livewire)
    - [Inertia](#inertia)

<a id="introduction"></a>
## Introducción

[Laravel Head](https://github.com/laravel/head) proporciona una API fluida para administrar el elemento de documento `<head>` de su aplicación, incluidos títulos y metaetiquetas, metadatos de Open Graph, URL canónicas, directivas de robots, sugerencias de rendimiento y datos estructurados. Funciona con Blade, Livewire e Inertia.

<a id="installation"></a>
## Instalación

Puede instalar Laravel Head usando el administrador de paquetes de Composer:

```shell
composer require laravel/head
```

<a id="quickstart"></a>
## Inicio rápido

Registre los valores predeterminados de todo el sitio en un proveedor de servicios:

```php
use Laravel\Head\Facades\Head;
use Laravel\Head\HeadBuilder;

Head::defaults(fn (HeadBuilder $head) => $head
    ->title('Laravel', suffix: ' - Laravel')
    ->description('Build something great.'));
```

Establezca metadatos específicos de la página en tiempo de ejecución:

```php
Head::title($post->title)
    ->description($post->description);
```

Representa las etiquetas resueltas en tu diseño:

```blade
<head>
    @head
</head>
```

<a id="resolution-precedence"></a>
## Prioridad de resolución

Los metadatos de la página se resuelven a partir de cinco capas, enumeradas de menor a mayor prioridad:

1. Valores predeterminados de página
2. Metadatos del grupo de rutas
3. Metadatos de ruta
4. Metadatos en tiempo de ejecución
5. Metadatos de error

Las capas superiores reemplazan las capas inferiores campo por campo. Por ejemplo, un título de tiempo de ejecución reemplaza el título de la ruta sin reemplazar la descripción de la ruta. Las secciones siguientes describen cómo configurar metadatos en cada capa. Para obtener información sobre cómo representar los metadatos resueltos en Blade, Livewire e Inertia, consulte [Rendering](#rendering).

<a id="defining-metadata"></a>
## Definición de metadatos

Laravel Head le permite definir metadatos utilizando valores predeterminados de todo el sitio, metadatos de ruta, llamadas en tiempo de ejecución y definiciones de páginas de error.

<a id="defaults"></a>
### Valores predeterminados

Registrar valores predeterminados de página en un proveedor de servicios:

```php
use Laravel\Head\Enums\OgType;
use Laravel\Head\Facades\Head;
use Laravel\Head\HeadBuilder;

Head::defaults(function (HeadBuilder $head) {
    $head
        ->title('Laravel', suffix: ' - Laravel')
        ->description('Build something great.')
        ->canonical()
        ->og(siteName: 'Laravel', type: OgType::Website)
        ->searchableByRobots()
        ->preconnect('https://fonts.example.com');
});
```

Los valores predeterminados son la capa de metadatos de página de menor prioridad. Si no hay metadatos de ruta, tiempo de ejecución o error que establezcan un título, `Laravel` se representa tal cual. Cuando una capa superior establece un título de página, se aplica el sufijo heredado, por lo que `Head::title('About')` representa `About - Laravel`. Pase `exact: true` para títulos que deben ignorar un prefijo o sufijo heredado.

Llamar a `Head::canonical()` genera una URL canónica utilizando la URL de solicitud actual. Para establecer una URL explícita, pase una cadena como `Head::canonical('/about')`. Las URL canónicas están normalizadas a `https` de forma predeterminada; pase `forceHttps: false` para preservar el esquema de solicitud.

Las directivas de robots se pueden pasar como una cadena sin formato, como casos de enumeración `RobotsRule` o como una lista que combina ambas formas. Las listas se representan como directivas separadas por comas, por lo que `Head::robots([RobotsRule::NoIndex, RobotsRule::NoFollow])` representa `noindex, nofollow`.

Por conveniencia, el método `searchableByRobots` representa `all`, mientras que el método `hiddenFromRobots` representa `none`.

<a id="route-metadata"></a>
### Metadatos de ruta

Puede definir metadatos directamente en las rutas, lo cual es especialmente útil para páginas semiestáticas cuyos metadatos se conocen de antemano.

<a id="routes-and-groups"></a>
#### Rutas y Grupos

```php
Route::view('/contact', 'contact')
    ->name('contact')
    ->withHead(
        title: 'Contact Us',
        description: 'Get in touch.',
    );
```

Los metadatos de ruta compartida se pueden aplicar a un grupo en cualquier posición de la cadena:

```php
Route::withHead(robots: 'noindex, nofollow')
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/dashboard', DashboardController::class)
            ->name('dashboard')
            ->withHead(title: 'Dashboard');
    });
```

También puede definir metadatos para rutas de recursos y singleton:

```php
Route::resource('posts', PostController::class)->withHead(
    robots: 'index, follow',
);

Route::singleton('profile', ProfileController::class)->withHead(
    title: 'Your Profile',
);
```

El método `withHead` almacena matrices simples a través de la API de metadatos de ruta nativa de Laravel. Es equivalente a llamar al método `metadata` con los atributos anidados bajo una clave `head`, de modo que los metadatos sigan siendo compatibles con las rutas almacenadas en caché.

Los argumentos con nombre se limitan intencionalmente a las propiedades de ruta integradas de Laravel Head para que los editores y el análisis estático puedan detectar nombres mal escritos. Los atributos de ruta registrados por los creadores de etiquetas personalizadas se pueden pasar a través de `extensions`:

```php
Route::get('/article', ArticleController::class)->withHead(
    title: 'Article',
    extensions: ['readingTime' => 4],
);
```

<a id="supported-properties"></a>
#### Propiedades admitidas

Las propiedades de ruta admitidas se asignan a los mismos nombres que los métodos del generador fluido:

| Categoría | Propiedades |
| --- | --- |
| Documento | `title`, `description`, `canonical`, `robots` |
| Metadatos de la aplicación | `themeColor`, `applicationName`, `colorScheme`, `referrer`, `viewport`, `appleWebAppTitle`, `webAppCapable`, `appleWebAppStatusBarStyle` |
| Sociales | `og`, `ogImage`, `ogVideo`, `ogAudio`, `twitter`, `twitterImage` |
| Rendimiento | `preload`, `prefetch`, `preconnect`, `dnsPrefetch` |
| Descubrimiento | `alternates`, `feed`, `icon`, `favicon`, `appleTouchIcon`, `appleTouchStartupImage`, `maskIcon`, `manifest` |
| Datos estructurados | `schema` |
| Etiquetas personalizadas | `meta`, `link` |

Los nombres de opciones anidadas utilizan el mismo nombre `camelCase` que la API fluida, como `forceHttps`, `siteName` y `secureUrl`.

Las propiedades repetibles, como `ogImage`, `preload`, `feed`, `schema`, `icon` y `appleTouchStartupImage`, aceptan un valor único o una lista.

<a id="runtime-metadata"></a>
### Metadatos de tiempo de ejecución

Cuando un valor no se conoce hasta que llega una solicitud, como el título de una publicación que se está viendo, puedes configurarlo en tiempo de ejecución:

```php
use Laravel\Head\Facades\Head;

public function __invoke(Post $post): Response
{
    Head::title($post->title);

    // ...
}
```

Las llamadas en tiempo de ejecución realizadas a través de la fachada `Head` anulan los metadatos de ruta para los datos dependientes de la solicitud. Los controladores y las acciones son los lugares más comunes para realizar estas llamadas:

```php
use App\Models\Post;
use Laravel\Head\Facades\Head;

public function show(Post $post)
{
    Head::title($post->title)
        ->description($post->description);

    return view('posts.show', ['post' => $post]);
}
```

Se combinan varias llamadas en tiempo de ejecución en el orden en que se ejecutan. Para campos de valor único como título, descripción, URL canónica y directivas de robots, la llamada posterior tiene prioridad. Los campos repetibles conservan varias entradas, pero agregar la misma clave nuevamente actualiza la entrada anterior. Para el método `ogImage`, la URL es la clave:

```php
Head::ogImage('/images/cover.jpg', alt: 'Draft cover')
    ->ogImage('/images/gallery.jpg', alt: 'Gallery image')
    ->ogImage('/images/cover.jpg', alt: 'Final cover', width: 1200, height: 630);
```

```html
<meta property="og:image" content="/images/cover.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Final cover">
<meta property="og:image" content="/images/gallery.jpg">
<meta property="og:image:alt" content="Gallery image">
```

Los medios Open Graph heredados de sus valores predeterminados actúan como alternativa. Cuando los metadatos de ruta, tiempo de ejecución o error definen sus propios medios del mismo tipo, los medios predeterminados se reemplazan en lugar de fusionarse, por lo que el `og:image` de una página tiene prioridad sobre una imagen predeterminada de todo el sitio.

Puede definir metadatos condicionales con fluidez utilizando los métodos `when` y `unless`:

```php
Head::title($post->title)
    ->when($post->isDraft(), fn ($head) => $head->hiddenFromRobots());
```

<a id="error-pages"></a>
### Páginas de error

Normalmente, debes registrar metadatos de error dentro del método `boot` de la clase `AppServiceProvider` de tu aplicación:

```php
use Laravel\Head\ErrorPages;
use Laravel\Head\Facades\Head;

/**
 * Inicializar los servicios de la aplicación.
 */
public function boot(): void
{
    Head::errors(function (ErrorPages $errors) {
        $errors->defaults(robots: 'noindex, follow');

        $errors->status(
            404,
            title: 'Page Not Found',
            description: 'The page you are looking for could not be found.',
        );
    });
}
```

Los métodos `defaults` y `status` también aceptan la misma devolución de llamada del generador fluido utilizada por `Head::defaults()`:

```php
use Laravel\Head\ErrorPages;
use Laravel\Head\Facades\Head;
use Laravel\Head\HeadBuilder;

Head::errors(function (ErrorPages $errors) {
    $errors->status(404, fn (HeadBuilder $head) => $head
        ->title('Page Not Found')
        ->description('The page you are looking for could not be found.'));
});
```

Cuando se genera una respuesta para un estado de error registrado, esos metadatos tienen prioridad sobre todas las demás capas.

Laravel detecta automáticamente el estado de la respuesta al representar una vista de error o ejecutar un enlace de fase de respuesta como el método `handleExceptionsUsing()` de Inertia. Si representa una respuesta de error dentro de una devolución de llamada `$exceptions->render()`, llame a `Head::status(404)` antes de renderizar para que se apliquen los metadatos del error.

<a id="open-graph"></a>
## Abrir gráfico

Puede configurar las propiedades de Open Graph utilizando el método `og`. Se pueden agregar medios repetibles utilizando los métodos de nivel superior, que aceptan argumentos con nombre directamente:

```php
use Laravel\Head\Enums\ImageType;
use Laravel\Head\Enums\OgType;

Head::og(type: OgType::Article, title: $post->title)
    ->ogImage($post->hero_image_url)
    ->ogImage(
        $post->gallery_image_url,
        alt: $post->gallery_image_alt,
        width: 1200,
        height: 630,
        type: ImageType::Jpeg,
    );
```

Los métodos `ogImage`, `ogVideo` y `ogAudio` aceptan una URL como primer argumento, junto con argumentos con nombre opcionales, como `alt`, `width`, `height`, `type` y `secureUrl`, cuando son compatibles con la especificación Open Graph.

Puede pasar tipos MIME de imágenes como casos de enumeración `ImageType` en cualquier lugar donde la API acepte una imagen `type`, como `ImageType::Svg`, `ImageType::Png`, `ImageType::Jpeg` y `ImageType::Webp`.

> **Nota:**
> Los documentos `title` y `description` completan automáticamente los valores faltantes de `og:title` y `og:description`.

Para una única imagen de Open Graph sin otros atributos, puede pasar el argumento con nombre `image` al método `og`:

```php
Head::og(
    type: OgType::Website,
    title: $page->title,
    description: $page->description,
    image: $page->og_image_url,
);
```

Las llamadas `og(image: ...)` y `ogImage(...)` escriben en la misma lista de imágenes subyacentes, por lo que puede usar la que sea más expresiva en el sitio de la llamada. Puede utilizar el método [`meta`](#custom-tags) para extensiones personalizadas de Open Graph, como propiedades de productos o artículos.

<a id="twitter-cards"></a>
### X / Tarjetas de Twitter

Para representar tarjetas X/Twitter con el mismo título, descripción e imagen utilizadas por Open Graph, registre `twitter()` en sus valores predeterminados:

```php
use Laravel\Head\Enums\TwitterCard;
use Laravel\Head\Facades\Head;
use Laravel\Head\HeadBuilder;

Head::defaults(fn (HeadBuilder $head) => $head->twitter(
    card: TwitterCard::SummaryWithLargeImage,
));
```

Luego configure los metadatos a nivel de página:

```php
Head::title('Introducing Laravel Head')
    ->description('A fluent API for Laravel document head metadata.')
    ->ogImage('https://example.com/social.jpg', alt: 'Introducing Laravel Head');
```

Esto muestra las etiquetas de Twitter coincidentes:

```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Introducing Laravel Head">
<meta name="twitter:description" content="A fluent API for Laravel document head metadata.">
<meta name="twitter:image" content="https://example.com/social.jpg">
<meta name="twitter:image:alt" content="Introducing Laravel Head">
```

Puedes personalizar páginas individuales con valores explícitos de Twitter:

```php
Head::twitter(title: $post->social_title)
    ->twitterImage($post->social_image_url, alt: $post->title);
```

Los metadatos de ruta aceptan `twitter` y `twitterImage`.

<a id="theme-colors"></a>
## Colores del tema

Puede configurar los colores del tema globalmente, por ruta o en tiempo de ejecución:

```php
Head::themeColor('#0f172a');
```

Esto genera una etiqueta `<meta name="theme-color">`. Para colores de tema específicos de medios, puede usar la enumeración `Media`:

```php
use Laravel\Head\Enums\Media;

Head::themeColor('#ffffff', media: Media::Light)
    ->themeColor('#111827', media: Media::Dark);
```

La enumeración `Media` también incluye `Portrait` y `Landscape`. El argumento `media` también acepta una cadena de consulta de medios personalizada.

Los metadatos de ruta admiten un único color de tema a través de la misma clave `camelCase`:

```php
Route::view('/dashboard', 'dashboard')->withHead(
    themeColor: '#0f172a',
);
```

<a id="app-metadata-and-icons"></a>
## Metadatos e íconos de la aplicación

Laravel Head incluye métodos para metadatos comunes de navegadores y aplicaciones:

```php
use Laravel\Head\Enums\ImageType;
use Laravel\Head\Enums\Media;

Head::applicationName('Laravel')
    ->colorScheme('light dark')
    ->referrer('strict-origin-when-cross-origin')
    ->viewport('width=device-width, initial-scale=1')
    ->appleWebAppTitle('Laravel')
    ->webAppCapable()
    ->appleWebAppStatusBarStyle('black')
    ->favicon('/favicon.svg', type: ImageType::Svg)
    ->icon('/favicon-32x32.png', type: ImageType::Png, sizes: '32x32')
    ->appleTouchIcon('/apple-touch-icon.png', sizes: '180x180')
    ->appleTouchStartupImage('/launch.png', media: Media::Portrait)
    ->maskIcon('/safari-pinned-tab.svg', color: '#111827')
    ->manifest('/site.webmanifest');
```

El método `favicon` es un alias del método `icon` y acepta los mismos argumentos `type`, `sizes` y `media`.

Los metadatos de ruta usan los mismos nombres:

```php
use Laravel\Head\Enums\ImageType;
use Laravel\Head\Enums\Media;

Route::view('/dashboard', 'dashboard')->withHead(
    applicationName: 'Laravel',
    colorScheme: 'light dark',
    appleWebAppTitle: 'Laravel',
    webAppCapable: true,
    appleWebAppStatusBarStyle: 'black',
    favicon: [
        ['href' => '/favicon.svg', 'type' => ImageType::Svg],
        ['href' => '/favicon-32x32.png', 'type' => ImageType::Png, 'sizes' => '32x32'],
    ],
    appleTouchIcon: ['href' => '/apple-touch-icon.png', 'sizes' => '180x180'],
    appleTouchStartupImage: ['href' => '/launch.png', 'media' => Media::Portrait],
    manifest: '/site.webmanifest',
);
```

<a id="progressive-web-apps"></a>
## Aplicaciones web progresivas

El método `pwa` configura las etiquetas de documento común `<head>` necesarias para una aplicación web instalable:

```php
Head::pwa(
    name: 'Laravel',
    manifest: '/site.webmanifest',
    themeColor: '#0f172a',
    appleTouchIcon: '/apple-touch-icon.png',
    appleWebAppStatusBarStyle: 'black',
);
```

Esto representa el nombre de la aplicación, el enlace del manifiesto de la aplicación web y los metadatos independientes de iOS. Si se proporcionan, también se representan el color del tema, el estilo de la barra de estado de Apple y el ícono táctil de Apple. La creación del manifiesto de la aplicación web y el registro de un trabajador de servicio siguen siendo responsabilidad de su aplicación.

Puede utilizar el método `pwa` en valores predeterminados o metadatos de tiempo de ejecución. Los metadatos de ruta admiten las propiedades individuales que se muestran arriba.

<a id="performance-and-discovery"></a>
## Rendimiento y descubrimiento

Laravel Head ofrece sugerencias de rendimiento, enlaces de paginación, alternativas de configuración regional y descubrimiento de feeds:

```php
Head::preload(asset('fonts/inter.woff2'), as: 'font', crossorigin: true)
    ->prefetch(asset('images/next.webp'))
    ->preconnect('https://cdn.example.com')
    ->dnsPrefetch('https://analytics.example.com')
    ->paginate($posts)
    ->alternates([
        'en' => 'https://example.com/en/about',
        'fr' => 'https://example.com/fr/about',
        'x-default' => 'https://example.com/about',
    ])
    ->feed('/feed', title: 'Laravel RSS')
    ->feed('/feed.atom', type: 'atom', title: 'Laravel Atom');
```

Para los activos locales, `preloadAsset()` y `prefetchAsset()` resuelven la URL a través del asistente `asset()` y detectan el atributo `as` de la extensión del archivo. Las precargas de fuentes incluyen automáticamente `crossorigin`, que la especificación de precarga requiere incluso para fuentes del mismo origen:

```php
Head::preloadAsset('fonts/inter.woff2')
    ->prefetchAsset('images/next.webp');
```

```html
<link rel="preload" href="https://example.com/fonts/inter.woff2" as="font" crossorigin>
<link rel="prefetch" href="https://example.com/images/next.webp" as="image">
```

Puede pasar `as` explícitamente para anular la detección. El método `preloadAsset` generará una excepción cuando el atributo `as` no se pueda detectar desde la extensión porque los navegadores ignoran las cargas previas sin este atributo; el método `prefetchAsset` simplemente lo omitirá.

<a id="custom-tags"></a>
## Etiquetas personalizadas

Para etiquetas sin un método dedicado, utilice `meta()` y `link()`:

```php
Head::meta('format-detection', 'telephone=no')
    ->meta('article:author', $post->author->name)
    ->link('search', '/opensearch.xml', [
        'type' => 'application/opensearchdescription+xml',
        'title' => 'Laravel Search',
    ])
    ->link('me', 'https://social.example.com/@laravel');
```

Puede incluir una consulta de medios en una metaetiqueta cuando el navegador solo debe aplicar la etiqueta en condiciones coincidentes:

```php
use Laravel\Head\Enums\Media;

Head::meta('theme-color', '#ffffff', media: Media::Light)
    ->meta('theme-color', '#111827', media: Media::Dark);
```

El método `meta` utiliza el atributo `name` para metaetiquetas normales. Para las claves que normalmente usan el atributo `property`, como Open Graph (`og:`) o metadatos de artículos (`article:`), el método cambia automáticamente:

```php
Head::meta('description', 'About Laravel')
    ->meta('og:title', 'About Laravel');
```

```html
<meta name="description" content="About Laravel">
<meta property="og:title" content="About Laravel">
```

Puede pasar `property: true` o `property: false` para seleccionar explícitamente cualquiera de los atributos.

<a id="schemas"></a>
## esquemas

Los creadores de esquemas integrados cubren los tipos JSON-LD comunes:

```php
use Laravel\Head\Enums\OfferAvailability;
use Laravel\Head\Facades\Schema;

Head::schema(
    Schema::product()
        ->name($product->name)
        ->offers(
            Schema::offer()
                ->price($product->price)
                ->currency('USD')
                ->availability(OfferAvailability::InStock)
        )
);
```

Los métodos integrados de fábrica son `article`, `blogPosting`, `product`, `offer`, `brand`, `breadcrumbs`, `faq`, `organization`, `person`, `webPage`, y `webSite`. Los métodos de fábrica desconocidos crean un objeto de esquema genérico, por lo que aún puedes expresar tipos personalizados de Schema.org.

Cuando los datos del esquema JSON-LD no son válidos, Laravel Head genera una excepción en entornos que no son de producción y registra una advertencia en producción.

<a id="breadcrumbs"></a>
### Pan rallado

Los elementos de miga de pan se pueden agregar uno a la vez o en masa. Las posiciones se asignan automáticamente en el orden en que se agregan los elementos:

```php
Head::schema(
    Schema::breadcrumbs()->items([
        'Home' => route('home'),
        'Shop' => route('shop.index'),
        'Shoes' => route('shop.category', 'shoes'),
    ])
);
```

Puede utilizar el método `item` para agregar un único elemento de ruta de navegación:

```php
Schema::breadcrumbs()
    ->item('Home', route('home'))
    ->item('Shop', route('shop.index'));
```

<a id="faqs"></a>
### Preguntas frecuentes

Las entradas de preguntas frecuentes siguen el mismo patrón. Puede agregarlos uno a la vez usando el método `question` o de forma masiva usando el método `questions`:

```php
Head::schema(
    Schema::faq()->questions([
        'What is Laravel Head?' => 'A fluent API for managing the document head.',
        'Is it free?' => 'Yes, it is open source.',
    ])
);
```

<a id="custom-schemas"></a>
### Esquemas personalizados

Puede registrar explícitamente tipos de esquemas personalizados:

```php
use DateTimeInterface;
use Laravel\Head\Facades\Schema;
use Laravel\Head\Schema\SchemaObject;
use Laravel\Head\SchemaType;

#[SchemaType('JobPosting')]
class JobPosting extends SchemaObject
{
    public function title(string $title): static
    {
        return $this->set('title', $title);
    }

    public function datePosted(DateTimeInterface|string $date): static
    {
        return $this->date('datePosted', $date);
    }
}

Schema::register(JobPosting::class);

Head::schema(
    Schema::jobPosting()
        ->title('Senior Laravel Developer')
        ->datePosted(now())
);
```

<a id="rendering"></a>
## Representación

Laravel Head resuelve los metadatos de la página en etiquetas para la respuesta actual. La forma en que se representan estas etiquetas depende de la pila de su aplicación.

El renderizador HTML impulsa la directiva `@head` y los elementos renderizados que Laravel Head comparte con Inertia a través del accesorio `head`. El procesador de matrices impulsa `Head::toArray()` para aplicaciones que necesitan los metadatos resueltos como datos estructurados.

<a id="blade"></a>
### Blade

Renderice las etiquetas acumuladas en el `<head>` de su diseño con la directiva `@head`:

```blade
<head>
    <meta charset="utf-8">
    @head
</head>
```

La directiva `@head` se representa de forma sincrónica, por lo que debes definir los metadatos de la página antes de que se represente el diseño.

<a id="livewire"></a>
### Livewire

Las aplicaciones Livewire utilizan la misma directiva `@head` en el diseño de sus documentos:

```blade
<head>
    @head
</head>

<body>
    {{ $slot }}

    @livewireScripts
</body>
```

No se requiere ninguna configuración específica de Livewire. Los metadatos de Laravel Head se resuelven por solicitud y el solucionador tiene un alcance de solicitud. Por lo tanto, cada visita a `wire:navigate` recupera un documento nuevo cuya salida `@head` refleja los metadatos de la ruta de destino. Las páginas visitadas con `wire:navigate` reciben los metadatos de ruta, tiempo de ejecución y error adecuados sin necesidad de código principal a nivel de componente.

<a id="inertia"></a>
### Inertia

Utilice la misma directiva `@head` en su plantilla raíz de Inertia, junto con los componentes propios de Inertia:

```blade
<html>
<head>
    <meta charset="utf-8">
    @head

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    <x-inertia::head />
</head>
<body>
    <x-inertia::app />
</body>
</html>
```

Cuando se instala Inertia, Laravel Head comparte automáticamente el encabezado administrado por la página como una matriz de cadenas de elementos renderizados bajo un accesorio `head` en cada objeto de página:

```json
{
    "props": {
        "head": [
            "<title data-inertia=\"title\">Dashboard - Laravel</title>",
            "<meta data-inertia=\"description\" name=\"description\" content=\"Your application overview.\">"
        ]
    }
}
```

Habilite la opción `serverHead` de Inertia dondequiera que su aplicación llame a `createInertiaApp()`. La opción está disponible en Inertia 3.5 y posteriores:

```js
createInertiaApp({
    // ...
    serverHead: true,
});
```

Cada elemento administrado por página tiene una clave `data-inertia` estable. La directiva `@head` genera el documento inicial, después de lo cual Inertia adopta esos elementos y los mantiene sincronizados durante las visitas estándar, [visitas instantáneas](https://inertiajs.com/docs/v3/the-basics/instant-visits) y navegación hacia adelante y hacia atrás. Los elementos están presentes en la respuesta HTML inicial, por lo que los rastreadores y los robots de vista previa de enlaces pueden leerlos sin ejecutar JavaScript. No se requiere ningún componente `<Head>` del lado del cliente.

Esto funciona con o sin [renderizado del lado del servidor (SSR)](https://inertiajs.com/docs/v3/advanced/server-side-rendering). Si su aplicación tiene un punto de entrada SSR independiente, habilite `serverHead` allí también. Laravel Head deduplica automáticamente los elementos administrados por la página entre `@head` y `<x-inertia::head />`, independientemente de su orden, al tiempo que conserva otros elementos del encabezado producidos por JavaScript SSR.

> **Nota:**
> Al agregar Laravel Head a una aplicación de Inertia existente, elimine cualquier devolución de llamada de título de `resources/js/app.tsx` y `resources/js/ssr.tsx` para que Laravel Head pueda administrar el título del documento final y mueva las etiquetas administradas por el [componente `<Head>`](https://inertiajs.com/docs/v3/the-basics/title-and-meta) de Inertia a Laravel Head para que los dos nunca definan el mismo elemento.

El accesorio `head` se omite en las respuestas de recarga parcial, por lo que Inertia conserva el encabezado de la última página completa. Las visitas instantáneas también retienen al jefe actual hasta que llega la respuesta en segundo plano. Si su aplicación ya usa la propiedad `head`, cambie su nombre en un proveedor de servicios:

```php
use Laravel\Head\Facades\Head;

public function boot(): void
{
    Head::inertia(prop: '_head');
}
```

Luego apunte Inertia al mismo accesorio con `serverHead: '_head'`.

<a id="static-inertia-tags"></a>
#### Etiquetas de Inertia estática

La mayoría de las etiquetas deben vivir en valores predeterminados, metadatos de ruta o metadatos de tiempo de ejecución para que Laravel Head pueda resolver el valor correcto para cada página. Utilice globales de Inertia solo para etiquetas de documentos representadas en la primera respuesta HTML y que Inertia no modifique durante el resto de la sesión.

Regístrelos en un proveedor de servicios con `Head::inertiaGlobals()`:

```php
use Laravel\Head\Facades\Head;
use Laravel\Head\HeadBuilder;

Head::inertiaGlobals(function (HeadBuilder $head) {
    $head
        ->viewport('width=device-width, initial-scale=1')
        ->colorScheme('light dark')
        ->icon('/favicon.svg', type: 'image/svg+xml')
        ->appleTouchIcon('/apple-touch-icon.png', sizes: '180x180')
        ->manifest('/site.webmanifest');
});
```

Los globales de Inertia están excluidos de la propiedad `head`, se representan sin los atributos de propiedad de `data-inertia` y nunca se actualizan después de la primera respuesta. Estos globales son adecuados para sugerencias estables del navegador, como ventana gráfica, combinación de colores, favicons, íconos táctiles y manifiestos. Si una etiqueta es específica de una página, relevante para SEO o puede anularse más adelante, colóquela en `defaults`, metadatos de ruta o metadatos de tiempo de ejecución.

Las aplicaciones que necesitan los metadatos resueltos como datos estructurados en lugar de etiquetas representadas pueden llamar a `Head::toArray()`. Los datos devueltos incluyen títulos, valores de Open Graph, esquemas JSON-LD y otros metadatos resueltos.
