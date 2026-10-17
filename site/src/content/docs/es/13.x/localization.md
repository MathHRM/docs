---
title: "Localización"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
    - [Publicación de los archivos de idioma](#publishing-the-language-files)
    - [Configuración de Locale](#configuring-the-locale)
    - [Lenguaje de pluralización](#pluralization-language)
- [Definición de cadenas de traducción](#defining-translation-strings)
    - [Usando teclas cortas](#using-short-keys)
    - [Uso de cadenas de traducción como claves](#using-translation-strings-as-keys)
- [Recuperando cadenas de traducción](#retrieving-translation-strings)
    - [Reemplazar parámetros en cadenas de traducción](#replacing-parameters-in-translation-strings)
    - [Pluralización](#pluralization)
- [Anulación de archivos de idioma del paquete](#overriding-package-language-files)

<a id="introduction"></a>
## Introducción

> **Nota:**
> De forma predeterminada, el esqueleto de la aplicación Laravel no incluye el directorio `lang`. Si desea personalizar los archivos de idioma de Laravel, puede publicarlos mediante el comando `lang:publish` Artisan.

Las funciones de localización de Laravel proporcionan una manera conveniente de recuperar cadenas en varios idiomas, lo que le permite admitir fácilmente varios idiomas dentro de su aplicación.

Laravel proporciona dos formas de gestionar cadenas de traducción. En primer lugar, las cadenas de idioma pueden almacenarse en archivos dentro del directorio `lang` de la aplicación. Dentro de este directorio, puede haber subdirectorios para cada idioma admitido por la aplicación. Este es el enfoque que utiliza Laravel para administrar cadenas de traducción para funciones integradas de Laravel, como mensajes de error de validación:

```text
/lang
    /en
        messages.php
    /es
        messages.php
```

O bien, se pueden definir cadenas de traducción dentro de archivos JSON que se colocan dentro del directorio `lang`. Al adoptar este enfoque, cada idioma admitido por su aplicación tendría un archivo JSON correspondiente dentro de este directorio. Este enfoque se recomienda para aplicaciones que tienen una gran cantidad de cadenas traducibles:

```text
/lang
    en.json
    es.json
```

Discutiremos cada enfoque para administrar cadenas de traducción en esta documentación.

<a id="publishing-the-language-files"></a>
### Publicación de archivos de idioma

De forma predeterminada, el esqueleto de la aplicación Laravel no incluye el directorio `lang`. Si desea personalizar los archivos de idioma de Laravel o crear los suyos propios, debe crear una estructura estructural del directorio `lang` mediante el comando `lang:publish` Artisan. El comando `lang:publish` creará el directorio `lang` en su aplicación y publicará el conjunto predeterminado de archivos de idioma utilizados por Laravel:

```shell
php artisan lang:publish
```

<a id="configuring-the-locale"></a>
### Configurando la configuración regional

El idioma predeterminado para su aplicación se almacena en la opción de configuración `locale` del archivo de configuración `config/app.php`, que normalmente se establece mediante la variable de entorno `APP_LOCALE`. Usted es libre de modificar este valor para adaptarlo a las necesidades de su aplicación.

También puede configurar un "idioma alternativo", que se utilizará cuando el idioma predeterminado no contenga una cadena de traducción determinada. Al igual que el idioma predeterminado, el idioma alternativo también se configura en el archivo de configuración `config/app.php` y su valor generalmente se establece mediante la variable de entorno `APP_FALLBACK_LOCALE`.

Puede modificar el idioma predeterminado para una única solicitud HTTP en tiempo de ejecución utilizando el método `setLocale` proporcionado por la fachada `App`:

```php
use Illuminate\Support\Facades\App;

Route::get('/greeting/{locale}', function (string $locale) {
    if (! in_array($locale, ['en', 'es', 'fr'])) {
        abort(400);
    }

    App::setLocale($locale);

    // ...
});
```

<a id="determining-the-current-locale"></a>
#### Determinación de la configuración regional actual

Puede utilizar los métodos `currentLocale` y `isLocale` en la fachada `App` para determinar la configuración regional actual o verificar si la configuración regional es un valor determinado:

```php
use Illuminate\Support\Facades\App;

$locale = App::currentLocale();

if (App::isLocale('en')) {
    // ...
}
```

<a id="pluralization-language"></a>
### Lenguaje de pluralización

<style>
.code-list-no-flex-break code {
    display: contents !important;
}
</style>

<div class="code-list-no-flex-break">

Puede indicarle al "pluralizador" de Laravel, que utiliza Eloquent y otras partes del marco para convertir cadenas singulares en cadenas plurales, que utilice un idioma que no sea el inglés. Esto se puede lograr invocando el método `useLanguage` dentro del método `boot` de uno de los proveedores de servicios de su aplicación. Los idiomas admitidos actualmente por el pluralizador son: `french`, `norwegian-bokmal`, `portuguese`, `spanish` y `turkish`:

</div>

```php
use Illuminate\Support\Pluralizer;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Pluralizer::useLanguage('spanish');

    // ...
}
```

> **Advertencia:**
> Si personaliza el idioma del pluralizador, debe definir explícitamente los [nombres de tabla](../eloquent/#table-names). de su modelo Eloquent.

<a id="defining-translation-strings"></a>
## Definición de cadenas de traducción

<a id="using-short-keys"></a>
### Usando teclas cortas

Normalmente, las cadenas de traducción se almacenan en archivos dentro del directorio `lang`. Dentro de este directorio, debe haber un subdirectorio para cada idioma admitido por su aplicación. Este es el enfoque que utiliza Laravel para administrar cadenas de traducción para funciones integradas de Laravel, como mensajes de error de validación:

```text
/lang
    /en
        messages.php
    /es
        messages.php
```

Todos los archivos de idioma devuelven una serie de cadenas con clave. Por ejemplo:

```php
<?php

// lang/en/messages.php

return [
    'welcome' => 'Welcome to our application!',
];
```

> **Advertencia:**
> Para idiomas que difieren según el territorio, debe nombrar los directorios de idiomas de acuerdo con la norma ISO 15897. Por ejemplo, se debe usar "en_GB" para inglés británico en lugar de "en-gb".

<a id="using-translation-strings-as-keys"></a>
### Uso de cadenas de traducción como claves

Para aplicaciones con una gran cantidad de cadenas traducibles, definir cada cadena con una "clave corta" puede resultar confuso al hacer referencia a las claves en sus vistas y es engorroso inventar continuamente claves para cada cadena de traducción admitida por su aplicación.

Por esta razón, Laravel también brinda soporte para definir cadenas de traducción utilizando la traducción "predeterminada" de la cadena como clave. Los archivos de idioma que utilizan cadenas de traducción como claves se almacenan como archivos JSON en el directorio `lang`. Por ejemplo, si tu aplicación tiene una traducción al español, debes crear un archivo `lang/es.json`:

```json
{
    "I love programming.": "Me encanta programar."
}
```

#### Conflictos de clave/archivo

No debe definir claves de cadena de traducción que entren en conflicto con otros nombres de archivos de traducción. Por ejemplo, traducir `__('Action')` para la configuración regional "NL" mientras existe un archivo `nl/action.php` pero no existe un archivo `nl.json`, el traductor devolverá el contenido completo de `nl/action.php`.

<a id="retrieving-translation-strings"></a>
## Recuperando cadenas de traducción

Puede recuperar cadenas de traducción de sus archivos de idioma utilizando la función auxiliar `__`. Si está utilizando "teclas cortas" para definir sus cadenas de traducción, debe pasar el archivo que contiene la clave y la clave misma a la función `__` usando la sintaxis de "punto". Por ejemplo, recuperemos la cadena de traducción `welcome` del archivo de idioma `lang/en/messages.php`:

```php
echo __('messages.welcome');
```

Si la cadena de traducción especificada no existe, la función `__` devolverá la clave de la cadena de traducción. Entonces, usando el ejemplo anterior, la función `__` devolvería `messages.welcome` si la cadena de traducción no existe.

Si está utilizando sus [cadenas de traducción predeterminadas como claves de traducción](#using-translation-strings-as-keys), debe pasar la traducción predeterminada de su cadena a la función `__`;

```php
echo __('I love programming.');
```

Nuevamente, si la cadena de traducción no existe, la función `__` devolverá la clave de la cadena de traducción que se le proporcionó.

Si está utilizando el [motor de plantillas Blade](../blade/), puede usar la sintaxis de eco `{{ }}` para mostrar la cadena de traducción:

```blade
{{ __('messages.welcome') }}
```

<a id="replacing-parameters-in-translation-strings"></a>
### Reemplazo de parámetros en cadenas de traducción

Si lo desea, puede definir marcadores de posición en sus cadenas de traducción. Todos los marcadores de posición tienen el prefijo `:`. Por ejemplo, puedes definir un mensaje de bienvenida con un nombre de marcador de posición:

```php
'welcome' => 'Welcome, :name',
```

Para reemplazar los marcadores de posición al recuperar una cadena de traducción, puede pasar una serie de reemplazos como segundo argumento de la función `__`:

```php
echo __('messages.welcome', ['name' => 'dayle']);
```

Si su marcador de posición contiene todas las letras mayúsculas, o solo tiene la primera letra en mayúscula, el valor traducido se escribirá en mayúscula en consecuencia:

```php
'welcome' => 'Welcome, :NAME', // Welcome, DAYLE
'goodbye' => 'Goodbye, :Name', // Goodbye, Dayle
```

<a id="object-replacement-formatting"></a>
#### Formato de reemplazo de objetos

Si intenta proporcionar un objeto como marcador de posición de traducción, se invocará el método `__toString` del objeto. El método [__toString](https://www.php.net/manual/en/language.oop5.magic.php#object.tostring) es uno de los "métodos mágicos" integrados de PHP. Sin embargo, a veces es posible que no tenga control sobre el método `__toString` de una clase determinada, como cuando la clase con la que está interactuando pertenece a una biblioteca de terceros.

En estos casos, Laravel le permite registrar un controlador de formato personalizado para ese tipo particular de objeto. Para lograr esto, debe invocar el método `stringable` del traductor. El método `stringable` acepta una función anónima, que debería indicar el tipo de objeto que es responsable de formatear. Normalmente, el método `stringable` debe invocarse dentro del método `boot` de la clase `AppServiceProvider` de su aplicación:

```php
use Illuminate\Support\Facades\Lang;
use Money\Money;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Lang::stringable(function (Money $money) {
        return $money->formatTo('en_GB');
    });
}
```

<a id="pluralization"></a>
### Pluralización

La pluralización es un problema complejo, ya que diferentes idiomas tienen una variedad de reglas complejas para la pluralización; sin embargo, Laravel puede ayudarte a traducir cadenas de manera diferente según las reglas de pluralización que definas. Usando un carácter `|`, puedes distinguir las formas singular y plural de una cadena:

```php
'apples' => 'There is one apple|There are many apples',
```

Por supuesto, la pluralización también se admite cuando se utilizan [cadenas de traducción como claves](#using-translation-strings-as-keys):

```json
{
    "There is one apple|There are many apples": "Hay una manzana|Hay muchas manzanas"
}
```

Incluso puedes crear reglas de pluralización más complejas que especifiquen cadenas de traducción para múltiples rangos de valores:

```php
'apples' => '{0} There are none|[1,19] There are some|[20,*] There are many',
```

Después de definir una cadena de traducción que tiene opciones de pluralización, puede usar la función `trans_choice` para recuperar la línea para un "recuento" determinado. En este ejemplo, dado que el recuento es mayor que uno, se devuelve la forma plural de la cadena de traducción:

```php
echo trans_choice('messages.apples', 10);
```

También puede definir atributos de marcador de posición en cadenas de pluralización. Estos marcadores de posición se pueden reemplazar pasando una matriz como tercer argumento de la función `trans_choice`:

```php
'minutes_ago' => '{1} :value minute ago|[2,*] :value minutes ago',

echo trans_choice('time.minutes_ago', 5, ['value' => 5]);
```

Si desea mostrar el valor entero que se pasó a la función `trans_choice`, puede utilizar el marcador de posición integrado `:count`:

```php
'apples' => '{0} There are none|{1} There is one|[2,*] There are :count',
```

<a id="overriding-package-language-files"></a>
## Anulación de archivos de idioma del paquete

Algunos paquetes pueden enviarse con sus propios archivos de idioma. En lugar de cambiar los archivos principales del paquete para modificar estas líneas, puede anularlos colocando archivos en el directorio `lang/vendor/{package}/{locale}`.

Entonces, por ejemplo, si necesita anular las cadenas de traducción al inglés en `messages.php` para un paquete llamado `skyrim/hearthfire`, debe colocar un archivo de idioma en: `lang/vendor/hearthfire/en/messages.php`. Dentro de este archivo, solo debe definir las cadenas de traducción que desea anular. Cualquier cadena de traducción que no anule se seguirá cargando desde los archivos de idioma originales del paquete.
