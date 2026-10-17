---
title: "Cadenas"
translationSourceCommit: "b1924db03c74b31fad5fc2f0d951406ca224a335"
---

- [Introducción](#introduction)
- [Métodos disponibles](#available-methods)

<a id="introduction"></a>
## Introducción

Laravel incluye diversas funciones para manipular valores de cadena. El propio framework utiliza muchas de estas funciones; sin embargo, puedes usarlas en tus propias aplicaciones si te resultan útiles.

<a id="available-methods"></a>
## Métodos disponibles

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

<a id="strings-method-list"></a>
### Cadenas

<div class="collection-method-list" markdown="1">

[\__](#method-__)
[class_basename](#method-class-basename)
[e](#method-e)
[preg_replace_array](#method-preg-replace-array)
[Str::after](#method-str-after)
[Str::afterLast](#method-str-after-last)
[Str::apa](#method-str-apa)
[Str::ascii](#method-str-ascii)
[Str::before](#method-str-before)
[Str::beforeLast](#method-str-before-last)
[Str::between](#method-str-between)
[Str::betweenFirst](#method-str-between-first)
[Str::camel](#method-camel-case)
[Str::charAt](#method-char-at)
[Str::chopStart](#method-str-chop-start)
[Str::chopEnd](#method-str-chop-end)
[Str::contains](#method-str-contains)
[Str::containsAll](#method-str-contains-all)
[Str::counted](#method-str-counted)
[Str::doesntContain](#method-str-doesnt-contain)
[Str::doesntEndWith](#method-str-doesnt-end-with)
[Str::doesntStartWith](#method-str-doesnt-start-with)
[Str::deduplicate](#method-deduplicate)
[Str::endsWith](#method-ends-with)
[Str::excerpt](#method-excerpt)
[Str::finish](#method-str-finish)
[Str::fromBase64](#method-str-from-base64)
[Str::headline](#method-str-headline)
[Str::initials](#method-str-initials)
[Str::inlineMarkdown](#method-str-inline-markdown)
[Str::is](#method-str-is)
[Str::isAscii](#method-str-is-ascii)
[Str::isJson](#method-str-is-json)
[Str::isUlid](#method-str-is-ulid)
[Str::isUrl](#method-str-is-url)
[Str::isUuid](#method-str-is-uuid)
[Str::kebab](#method-kebab-case)
[Str::lcfirst](#method-str-lcfirst)
[Str::length](#method-str-length)
[Str::limit](#method-str-limit)
[Str::lower](#method-str-lower)
[Str::markdown](#method-str-markdown)
[Str::mask](#method-str-mask)
[Str::match](#method-str-match)
[Str::matchAll](#method-str-match-all)
[Str::isMatch](#method-str-is-match)
[Str::orderedUuid](#method-str-ordered-uuid)
[Str::padBoth](#method-str-padboth)
[Str::padLeft](#method-str-padleft)
[Str::padRight](#method-str-padright)
[Str::password](#method-str-password)
[Str::plural](#method-str-plural)
[Str::pluralStudly](#method-str-plural-studly)
[Str::position](#method-str-position)
[Str::random](#method-str-random)
[Str::remove](#method-str-remove)
[Str::repeat](#method-str-repeat)
[Str::replace](#method-str-replace)
[Str::replaceArray](#method-str-replace-array)
[Str::replaceFirst](#method-str-replace-first)
[Str::replaceLast](#method-str-replace-last)
[Str::replaceMatches](#method-str-replace-matches)
[Str::replaceStart](#method-str-replace-start)
[Str::replaceEnd](#method-str-replace-end)
[Str::reverse](#method-str-reverse)
[Str::singular](#method-str-singular)
[Str::slug](#method-str-slug)
[Str::snake](#method-snake-case)
[Str::squish](#method-str-squish)
[Str::start](#method-str-start)
[Str::startsWith](#method-starts-with)
[Str::studly](#method-studly-case)
[Str::substr](#method-str-substr)
[Str::substrCount](#method-str-substrcount)
[Str::substrReplace](#method-str-substrreplace)
[Str::swap](#method-str-swap)
[Str::take](#method-take)
[Str::title](#method-title-case)
[Str::toBase64](#method-str-to-base64)
[Str::transliterate](#method-str-transliterate)
[Str::trim](#method-str-trim)
[Str::ltrim](#method-str-ltrim)
[Str::rtrim](#method-str-rtrim)
[Str::ucfirst](#method-str-ucfirst)
[Str::ucsplit](#method-str-ucsplit)
[Str::ucwords](#method-str-ucwords)
[Str::upper](#method-str-upper)
[Str::ulid](#method-str-ulid)
[Str::unwrap](#method-str-unwrap)
[Str::uuid](#method-str-uuid)
[Str::uuid7](#method-str-uuid7)
[Str::wordCount](#method-str-word-count)
[Str::wordWrap](#method-str-word-wrap)
[Str::words](#method-str-words)
[Str::wrap](#method-str-wrap)
[str](#method-str)
[trans](#method-trans)
[trans_choice](#method-trans-choice)

</div>

<a id="fluent-strings-method-list"></a>
### Cadenas fluidas

<div class="collection-method-list" markdown="1">

[after](#method-fluent-str-after)
[afterLast](#method-fluent-str-after-last)
[apa](#method-fluent-str-apa)
[append](#method-fluent-str-append)
[ascii](#method-fluent-str-ascii)
[basename](#method-fluent-str-basename)
[before](#method-fluent-str-before)
[beforeLast](#method-fluent-str-before-last)
[between](#method-fluent-str-between)
[betweenFirst](#method-fluent-str-between-first)
[camel](#method-fluent-str-camel)
[charAt](#method-fluent-str-char-at)
[classBasename](#method-fluent-str-class-basename)
[chopStart](#method-fluent-str-chop-start)
[chopEnd](#method-fluent-str-chop-end)
[contains](#method-fluent-str-contains)
[containsAll](#method-fluent-str-contains-all)
[counted](#method-fluent-str-counted)
[decrypt](#method-fluent-str-decrypt)
[deduplicate](#method-fluent-str-deduplicate)
[dirname](#method-fluent-str-dirname)
[doesntContain](#method-fluent-str-doesnt-contain)
[doesntEndWith](#method-fluent-str-doesnt-end-with)
[doesntStartWith](#method-fluent-str-doesnt-start-with)
[encrypt](#method-fluent-str-encrypt)
[endsWith](#method-fluent-str-ends-with)
[exactly](#method-fluent-str-exactly)
[excerpt](#method-fluent-str-excerpt)
[explode](#method-fluent-str-explode)
[finish](#method-fluent-str-finish)
[fromBase64](#method-fluent-str-from-base64)
[hash](#method-fluent-str-hash)
[headline](#method-fluent-str-headline)
[initials](#method-fluent-str-initials)
[inlineMarkdown](#method-fluent-str-inline-markdown)
[is](#method-fluent-str-is)
[isAscii](#method-fluent-str-is-ascii)
[isEmpty](#method-fluent-str-is-empty)
[isNotEmpty](#method-fluent-str-is-not-empty)
[isJson](#method-fluent-str-is-json)
[isUlid](#method-fluent-str-is-ulid)
[isUrl](#method-fluent-str-is-url)
[isUuid](#method-fluent-str-is-uuid)
[kebab](#method-fluent-str-kebab)
[lcfirst](#method-fluent-str-lcfirst)
[length](#method-fluent-str-length)
[limit](#method-fluent-str-limit)
[lower](#method-fluent-str-lower)
[markdown](#method-fluent-str-markdown)
[mask](#method-fluent-str-mask)
[match](#method-fluent-str-match)
[matchAll](#method-fluent-str-match-all)
[isMatch](#method-fluent-str-is-match)
[newLine](#method-fluent-str-new-line)
[padBoth](#method-fluent-str-padboth)
[padLeft](#method-fluent-str-padleft)
[padRight](#method-fluent-str-padright)
[pipe](#method-fluent-str-pipe)
[plural](#method-fluent-str-plural)
[position](#method-fluent-str-position)
[prepend](#method-fluent-str-prepend)
[remove](#method-fluent-str-remove)
[repeat](#method-fluent-str-repeat)
[replace](#method-fluent-str-replace)
[replaceArray](#method-fluent-str-replace-array)
[replaceFirst](#method-fluent-str-replace-first)
[replaceLast](#method-fluent-str-replace-last)
[replaceMatches](#method-fluent-str-replace-matches)
[replaceStart](#method-fluent-str-replace-start)
[replaceEnd](#method-fluent-str-replace-end)
[scan](#method-fluent-str-scan)
[singular](#method-fluent-str-singular)
[slug](#method-fluent-str-slug)
[snake](#method-fluent-str-snake)
[split](#method-fluent-str-split)
[squish](#method-fluent-str-squish)
[start](#method-fluent-str-start)
[startsWith](#method-fluent-str-starts-with)
[stripTags](#method-fluent-str-strip-tags)
[studly](#method-fluent-str-studly)
[substr](#method-fluent-str-substr)
[substrReplace](#method-fluent-str-substrreplace)
[swap](#method-fluent-str-swap)
[take](#method-fluent-str-take)
[tap](#method-fluent-str-tap)
[test](#method-fluent-str-test)
[title](#method-fluent-str-title)
[toBase64](#method-fluent-str-to-base64)
[toHtmlString](#method-fluent-str-to-html-string)
[toUri](#method-fluent-str-to-uri)
[transliterate](#method-fluent-str-transliterate)
[trim](#method-fluent-str-trim)
[ltrim](#method-fluent-str-ltrim)
[rtrim](#method-fluent-str-rtrim)
[ucfirst](#method-fluent-str-ucfirst)
[ucsplit](#method-fluent-str-ucsplit)
[ucwords](#method-fluent-str-ucwords)
[unwrap](#method-fluent-str-unwrap)
[upper](#method-fluent-str-upper)
[when](#method-fluent-str-when)
[whenContains](#method-fluent-str-when-contains)
[whenContainsAll](#method-fluent-str-when-contains-all)
[whenDoesntEndWith](#method-fluent-str-when-doesnt-end-with)
[whenDoesntStartWith](#method-fluent-str-when-doesnt-start-with)
[whenEmpty](#method-fluent-str-when-empty)
[whenNotEmpty](#method-fluent-str-when-not-empty)
[whenStartsWith](#method-fluent-str-when-starts-with)
[whenEndsWith](#method-fluent-str-when-ends-with)
[whenExactly](#method-fluent-str-when-exactly)
[whenNotExactly](#method-fluent-str-when-not-exactly)
[whenIs](#method-fluent-str-when-is)
[whenIsAscii](#method-fluent-str-when-is-ascii)
[whenIsUlid](#method-fluent-str-when-is-ulid)
[whenIsUuid](#method-fluent-str-when-is-uuid)
[whenTest](#method-fluent-str-when-test)
[wordCount](#method-fluent-str-word-count)
[words](#method-fluent-str-words)
[wrap](#method-fluent-str-wrap)

</div>

<a id="strings"></a>
## Cadenas

<a id="method-__"></a>
#### `__()` {.collection-method}

La función `__` traduce la cadena de traducción o clave de traducción indicada mediante tus [archivos de idioma](../localization/):

```php
echo __('Welcome to our application');

echo __('messages.welcome');
```

Si la cadena o clave de traducción especificada no existe, la función `__` devuelve el valor indicado. Por lo tanto, en el ejemplo anterior, la función `__` devolvería `messages.welcome` si esa clave de traducción no existiera.

<a id="method-class-basename"></a>
#### `class_basename()` {.collection-method}

La función `class_basename` devuelve el nombre de la clase indicada sin su espacio de nombres:

```php
$class = class_basename('Foo\Bar\Baz');

// Baz
```

<a id="method-e"></a>
#### `e()` {.collection-method}

La función `e` ejecuta la función `htmlspecialchars` de PHP con la opción `double_encode` establecida en `true` de forma predeterminada:

```php
echo e('<html>foo</html>');

// &lt;html&gt;foo&lt;/html&gt;
```

<a id="method-preg-replace-array"></a>
#### `preg_replace_array()` {.collection-method}

La función `preg_replace_array` reemplaza un patrón indicado en la cadena de forma secuencial mediante un array:

```php
$string = 'The event will take place between :start and :end';

$replaced = preg_replace_array('/:[a-z_]+/', ['8:30', '9:00'], $string);

// The event will take place between 8:30 and 9:00
```

<a id="method-str-after"></a>
#### `Str::after()` {.collection-method}

El método `Str::after` devuelve todo lo que aparece después del valor indicado en una cadena. Si el valor no existe en la cadena, se devuelve la cadena completa:

```php
use Illuminate\Support\Str;

$slice = Str::after('This is my name', 'This is');

// ' my name'
```

<a id="method-str-after-last"></a>
#### `Str::afterLast()` {.collection-method}

El método `Str::afterLast` devuelve todo lo que aparece después de la última aparición del valor indicado en una cadena. Si el valor no existe en la cadena, se devuelve la cadena completa:

```php
use Illuminate\Support\Str;

$slice = Str::afterLast('App\Http\Controllers\Controller', '\\');

// 'Controller'
```

<a id="method-str-apa"></a>
#### `Str::apa()` {.collection-method}

El método `Str::apa` convierte la cadena indicada a mayúsculas de título según las [directrices de la APA](https://apastyle.apa.org/style-grammar-guidelines/capitalization/title-case):

```php
use Illuminate\Support\Str;

$title = Str::apa('Creating A Project');

// 'Creating a Project'
```

<a id="method-str-ascii"></a>
#### `Str::ascii()` {.collection-method}

El método `Str::ascii` intenta transliterar la cadena a un valor ASCII:

```php
use Illuminate\Support\Str;

$slice = Str::ascii('û');

// 'u'
```

<a id="method-str-before"></a>
#### `Str::before()` {.collection-method}

El método `Str::before` devuelve todo lo que aparece antes del valor indicado en una cadena:

```php
use Illuminate\Support\Str;

$slice = Str::before('This is my name', 'my name');

// 'This is '
```

<a id="method-str-before-last"></a>
#### `Str::beforeLast()` {.collection-method}

El método `Str::beforeLast` devuelve todo lo que aparece antes de la última aparición del valor indicado en una cadena:

```php
use Illuminate\Support\Str;

$slice = Str::beforeLast('This is my name', 'is');

// 'This '
```

<a id="method-str-between"></a>
#### `Str::between()` {.collection-method}

El método `Str::between` devuelve la parte de una cadena que se encuentra entre dos valores:

```php
use Illuminate\Support\Str;

$slice = Str::between('This is my name', 'This', 'name');

// ' is my '
```

<a id="method-str-between-first"></a>
#### `Str::betweenFirst()` {.collection-method}

El método `Str::betweenFirst` devuelve la parte más pequeña posible de una cadena entre dos valores:

```php
use Illuminate\Support\Str;

$slice = Str::betweenFirst('[a] bc [d]', '[', ']');

// 'a'
```

<a id="method-camel-case"></a>
#### `Str::camel()` {.collection-method}

El método `Str::camel` convierte la cadena indicada a `camelCase`:

```php
use Illuminate\Support\Str;

$converted = Str::camel('foo_bar');

// 'fooBar'
```

<a id="method-char-at"></a>
#### `Str::charAt()` {.collection-method}

El método `Str::charAt` devuelve el carácter en el índice especificado. Si el índice está fuera de los límites, se devuelve `false`:

```php
use Illuminate\Support\Str;

$character = Str::charAt('This is my name.', 6);

// 's'
```

<a id="method-str-chop-start"></a>
#### `Str::chopStart()` {.collection-method}

El método `Str::chopStart` elimina la primera aparición del valor indicado solo si este aparece al principio de la cadena:

```php
use Illuminate\Support\Str;

$url = Str::chopStart('https://laravel.com', 'https://');

// 'laravel.com'
```

También puedes pasar un array como segundo argumento. Si la cadena comienza con alguno de los valores del array, ese valor se elimina de la cadena:

```php
use Illuminate\Support\Str;

$url = Str::chopStart('http://laravel.com', ['https://', 'http://']);

// 'laravel.com'
```

<a id="method-str-chop-end"></a>
#### `Str::chopEnd()` {.collection-method}

El método `Str::chopEnd` elimina la última aparición del valor indicado solo si este aparece al final de la cadena:

```php
use Illuminate\Support\Str;

$url = Str::chopEnd('app/Models/Photograph.php', '.php');

// 'app/Models/Photograph'
```

También puedes pasar un array como segundo argumento. Si la cadena termina con alguno de los valores del array, ese valor se elimina de la cadena:

```php
use Illuminate\Support\Str;

$url = Str::chopEnd('laravel.com/index.php', ['/index.html', '/index.php']);

// 'laravel.com'
```

<a id="method-str-contains"></a>
#### `Str::contains()` {.collection-method}

El método `Str::contains` determina si la cadena indicada contiene el valor indicado. De forma predeterminada, este método distingue entre mayúsculas y minúsculas:

```php
use Illuminate\Support\Str;

$contains = Str::contains('This is my name', 'my');

// true
```

También puedes pasar un array de valores para determinar si la cadena indicada contiene alguno de los valores del array:

```php
use Illuminate\Support\Str;

$contains = Str::contains('This is my name', ['my', 'foo']);

// true
```

Puedes desactivar la distinción entre mayúsculas y minúsculas estableciendo el argumento `ignoreCase` en `true`:

```php
use Illuminate\Support\Str;

$contains = Str::contains('This is my name', 'MY', ignoreCase: true);

// true
```

<a id="method-str-contains-all"></a>
#### `Str::containsAll()` {.collection-method}

El método `Str::containsAll` determina si la cadena indicada contiene todos los valores de un array indicado:

```php
use Illuminate\Support\Str;

$containsAll = Str::containsAll('This is my name', ['my', 'name']);

// true
```

Puedes desactivar la distinción entre mayúsculas y minúsculas estableciendo el argumento `ignoreCase` en `true`:

```php
use Illuminate\Support\Str;

$containsAll = Str::containsAll('This is my name', ['MY', 'NAME'], ignoreCase: true);

// true
```

<a id="method-str-doesnt-contain"></a>
#### `Str::doesntContain()` {.collection-method}

El método `Str::doesntContain` determina si la cadena indicada no contiene el valor indicado. De forma predeterminada, este método distingue entre mayúsculas y minúsculas:

```php
use Illuminate\Support\Str;

$doesntContain = Str::doesntContain('This is name', 'my');

// true
```

También puedes pasar un array de valores para determinar si la cadena indicada no contiene ninguno de los valores del array:

```php
use Illuminate\Support\Str;

$doesntContain = Str::doesntContain('This is name', ['my', 'framework']);

// true
```

Puedes desactivar la distinción entre mayúsculas y minúsculas estableciendo el argumento `ignoreCase` en `true`:

```php
use Illuminate\Support\Str;

$doesntContain = Str::doesntContain('This is name', 'MY', ignoreCase: true);

// true
```

<a id="method-deduplicate"></a>
#### `Str::deduplicate()` {.collection-method}

El método `Str::deduplicate` reemplaza las apariciones consecutivas de un carácter por una sola aparición de ese carácter en la cadena indicada. De forma predeterminada, el método elimina los espacios duplicados:

```php
use Illuminate\Support\Str;

$result = Str::deduplicate('The   Laravel   Framework');

// The Laravel Framework
```

Puedes especificar otro carácter del que eliminar duplicados pasándolo como segundo argumento al método:

```php
use Illuminate\Support\Str;

$result = Str::deduplicate('The---Laravel---Framework', '-');

// The-Laravel-Framework
```

<a id="method-str-doesnt-end-with"></a>
#### `Str::doesntEndWith()` {.collection-method}

El método `Str::doesntEndWith` determina si la cadena indicada no termina con el valor indicado:

```php
use Illuminate\Support\Str;

$result = Str::doesntEndWith('This is my name', 'dog');

// true
```

También puedes pasar un array de valores para determinar si la cadena indicada no termina con ninguno de los valores del array:

```php
use Illuminate\Support\Str;

$result = Str::doesntEndWith('This is my name', ['this', 'foo']);

// true

$result = Str::doesntEndWith('This is my name', ['name', 'foo']);

// false
```

<a id="method-str-doesnt-start-with"></a>
#### `Str::doesntStartWith()` {.collection-method}

El método `Str::doesntStartWith` determina si la cadena indicada no comienza con el valor indicado:

```php
use Illuminate\Support\Str;

$result = Str::doesntStartWith('This is my name', 'That');

// true
```

Si se pasa un array de valores posibles, el método `doesntStartWith` devuelve `true` si la cadena no comienza con ninguno de los valores indicados:

```php
$result = Str::doesntStartWith('This is my name', ['What', 'That', 'There']);

// true
```

<a id="method-ends-with"></a>
#### `Str::endsWith()` {.collection-method}

El método `Str::endsWith` determina si la cadena indicada termina con el valor indicado:

```php
use Illuminate\Support\Str;

$result = Str::endsWith('This is my name', 'name');

// true
```

También puedes pasar un array de valores para determinar si la cadena indicada termina con alguno de los valores del array:

```php
use Illuminate\Support\Str;

$result = Str::endsWith('This is my name', ['name', 'foo']);

// true

$result = Str::endsWith('This is my name', ['this', 'foo']);

// false
```

<a id="method-excerpt"></a>
#### `Str::excerpt()` {.collection-method}

El método `Str::excerpt` extrae un fragmento de una cadena que coincide con la primera aparición de una frase en esa cadena:

```php
use Illuminate\Support\Str;

$excerpt = Str::excerpt('This is my name', 'my', [
    'radius' => 3
]);

// '...is my na...'
```

La opción `radius`, cuyo valor predeterminado es `100`, permite definir el número de caracteres que deben aparecer a cada lado de la cadena truncada.

Además, puedes usar la opción `omission` para definir la cadena que se antepondrá y se añadirá al final de la cadena truncada:

```php
use Illuminate\Support\Str;

$excerpt = Str::excerpt('This is my name', 'name', [
    'radius' => 3,
    'omission' => '(...) '
]);

// '(...) my name'
```

<a id="method-str-finish"></a>
#### `Str::finish()` {.collection-method}

El método `Str::finish` añade una sola aparición del valor indicado a una cadena si esta aún no termina con ese valor:

```php
use Illuminate\Support\Str;

$adjusted = Str::finish('this/string', '/');

// this/string/

$adjusted = Str::finish('this/string/', '/');

// this/string/
```

<a id="method-str-from-base64"></a>
#### `Str::fromBase64()` {.collection-method}

El método `Str::fromBase64` decodifica la cadena Base64 indicada:

```php
use Illuminate\Support\Str;

$decoded = Str::fromBase64('TGFyYXZlbA==');

// Laravel
```

<a id="method-str-headline"></a>
#### `Str::headline()` {.collection-method}

El método `Str::headline` convierte cadenas delimitadas por cambios entre mayúsculas y minúsculas, guiones o guiones bajos en una cadena delimitada por espacios, con la primera letra de cada palabra en mayúscula:

```php
use Illuminate\Support\Str;

$headline = Str::headline('steve_jobs');

// Steve Jobs

$headline = Str::headline('EmailNotificationSent');

// Email Notification Sent
```

<a id="method-str-initials"></a>
#### `Str::initials()` {.collection-method}

El método `Str::initials` devuelve las iniciales de una cadena indicada y, opcionalmente, las convierte a mayúsculas:

```php
use Illuminate\Support\Str;

$initials = Str::initials('taylor otwell');

// to

$initials = Str::initials('taylor otwell', capitalize: true);

// TO
```

<a id="method-str-inline-markdown"></a>
#### `Str::inlineMarkdown()` {.collection-method}

El método `Str::inlineMarkdown` convierte Markdown con la sintaxis de GitHub a HTML en línea mediante [CommonMark](https://commonmark.thephpleague.com/). Sin embargo, a diferencia del método `markdown`, no envuelve todo el HTML generado en un elemento de bloque:

```php
use Illuminate\Support\Str;

$html = Str::inlineMarkdown('**Laravel**');

// <strong>Laravel</strong>
```

#### Seguridad de Markdown

De forma predeterminada, Markdown admite HTML sin procesar, lo que expone vulnerabilidades de scripting entre sitios (XSS) al usarse con entradas de usuario sin procesar. Según la [documentación de seguridad de CommonMark](https://commonmark.thephpleague.com/security/), puedes usar la opción `html_input` para escapar o eliminar el HTML sin procesar, y la opción `allow_unsafe_links` para especificar si se permiten enlaces inseguros. Si necesitas permitir algo de HTML sin procesar, debes pasar el Markdown compilado por un purificador de HTML:

```php
use Illuminate\Support\Str;

Str::inlineMarkdown('Inject: <script>alert("Hello XSS!");</script>', [
    'html_input' => 'strip',
    'allow_unsafe_links' => false,
]);

// Inject: alert(&quot;Hello XSS!&quot;);
```

<a id="method-str-is"></a>
#### `Str::is()` {.collection-method}

El método `Str::is` determina si una cadena indicada coincide con un patrón indicado. Se pueden usar asteriscos como comodines:

```php
use Illuminate\Support\Str;

$matches = Str::is('foo*', 'foobar');

// true

$matches = Str::is('baz*', 'foobar');

// false
```

Puedes desactivar la distinción entre mayúsculas y minúsculas estableciendo el argumento `ignoreCase` en `true`:

```php
use Illuminate\Support\Str;

$matches = Str::is('*.jpg', 'photo.JPG', ignoreCase: true);

// true
```

<a id="method-str-is-ascii"></a>
#### `Str::isAscii()` {.collection-method}

El método `Str::isAscii` determina si una cadena indicada es ASCII de 7 bits:

```php
use Illuminate\Support\Str;

$isAscii = Str::isAscii('Taylor');

// true

$isAscii = Str::isAscii('ü');

// false
```

<a id="method-str-is-json"></a>
#### `Str::isJson()` {.collection-method}

El método `Str::isJson` determina si la cadena indicada es JSON válido:

```php
use Illuminate\Support\Str;

$result = Str::isJson('[1,2,3]');

// true

$result = Str::isJson('{"first": "John", "last": "Doe"}');

// true

$result = Str::isJson('{first: "John", last: "Doe"}');

// false
```

<a id="method-str-is-url"></a>
#### `Str::isUrl()` {.collection-method}

El método `Str::isUrl` determina si la cadena indicada es una URL válida:

```php
use Illuminate\Support\Str;

$isUrl = Str::isUrl('http://example.com');

// true

$isUrl = Str::isUrl('laravel');

// false
```

El método `isUrl` considera válidos muchos protocolos. Sin embargo, puedes especificar qué protocolos deben considerarse válidos proporcionándolos al método `isUrl`:

```php
$isUrl = Str::isUrl('http://example.com', ['http', 'https']);
```

<a id="method-str-is-ulid"></a>
#### `Str::isUlid()` {.collection-method}

El método `Str::isUlid` determina si la cadena indicada es un ULID válido:

```php
use Illuminate\Support\Str;

$isUlid = Str::isUlid('01gd6r360bp37zj17nxb55yv40');

// true

$isUlid = Str::isUlid('laravel');

// false
```

<a id="method-str-is-uuid"></a>
#### `Str::isUuid()` {.collection-method}

El método `Str::isUuid` determina si la cadena indicada es un UUID válido:

```php
use Illuminate\Support\Str;

$isUuid = Str::isUuid('a0a2a2d2-0b87-4a18-83f2-2529882be2de');

// true

$isUuid = Str::isUuid('laravel');

// false
```

También puedes validar que el UUID indicado cumpla una especificación UUID por versión (1, 3, 4, 5, 6, 7 u 8):

```php
use Illuminate\Support\Str;

$isUuid = Str::isUuid('a0a2a2d2-0b87-4a18-83f2-2529882be2de', version: 4);

// true

$isUuid = Str::isUuid('a0a2a2d2-0b87-4a18-83f2-2529882be2de', version: 1);

// false
```

<a id="method-kebab-case"></a>
#### `Str::kebab()` {.collection-method}

El método `Str::kebab` convierte la cadena indicada a `kebab-case`:

```php
use Illuminate\Support\Str;

$converted = Str::kebab('fooBar');

// foo-bar
```

<a id="method-str-lcfirst"></a>
#### `Str::lcfirst()` {.collection-method}

El método `Str::lcfirst` devuelve la cadena indicada con el primer carácter en minúscula:

```php
use Illuminate\Support\Str;

$string = Str::lcfirst('Foo Bar');

// foo Bar
```

<a id="method-str-length"></a>
#### `Str::length()` {.collection-method}

El método `Str::length` devuelve la longitud de la cadena indicada:

```php
use Illuminate\Support\Str;

$length = Str::length('Laravel');

// 7
```

<a id="method-str-limit"></a>
#### `Str::limit()` {.collection-method}

El método `Str::limit` trunca la cadena indicada a la longitud especificada:

```php
use Illuminate\Support\Str;

$truncated = Str::limit('The quick brown fox jumps over the lazy dog', 20);

// The quick brown fox...
```

Puedes pasar un tercer argumento al método para cambiar la cadena que se añadirá al final de la cadena truncada:

```php
$truncated = Str::limit('The quick brown fox jumps over the lazy dog', 20, ' (...)');

// The quick brown fox (...)
```

Si deseas conservar palabras completas al truncar la cadena, puedes usar el argumento `preserveWords`. Cuando este argumento es `true`, la cadena se trunca en el límite de palabra completa más cercano:

```php
$truncated = Str::limit('The quick brown fox', 12, preserveWords: true);

// The quick...
```

<a id="method-str-lower"></a>
#### `Str::lower()` {.collection-method}

El método `Str::lower` convierte la cadena indicada a minúsculas:

```php
use Illuminate\Support\Str;

$converted = Str::lower('LARAVEL');

// laravel
```

<a id="method-str-markdown"></a>
#### `Str::markdown()` {.collection-method}

El método `Str::markdown` convierte Markdown con la sintaxis de GitHub a HTML mediante [CommonMark](https://commonmark.thephpleague.com/):

```php
use Illuminate\Support\Str;

$html = Str::markdown('# Laravel');

// <h1>Laravel</h1>

$html = Str::markdown('# Taylor <b>Otwell</b>', [
    'html_input' => 'strip',
]);

// <h1>Taylor Otwell</h1>
```

#### Seguridad de Markdown

De forma predeterminada, Markdown admite HTML sin procesar, lo que expone vulnerabilidades de scripting entre sitios (XSS) al usarse con entradas de usuario sin procesar. Según la [documentación de seguridad de CommonMark](https://commonmark.thephpleague.com/security/), puedes usar la opción `html_input` para escapar o eliminar el HTML sin procesar, y la opción `allow_unsafe_links` para especificar si se permiten enlaces inseguros. Si necesitas permitir algo de HTML sin procesar, debes pasar el Markdown compilado por un purificador de HTML:

```php
use Illuminate\Support\Str;

Str::markdown('Inject: <script>alert("Hello XSS!");</script>', [
    'html_input' => 'strip',
    'allow_unsafe_links' => false,
]);

// <p>Inject: alert(&quot;Hello XSS!&quot;);</p>
```

<a id="method-str-mask"></a>
#### `Str::mask()` {.collection-method}

El método `Str::mask` oculta parte de una cadena con un carácter repetido y puede usarse para ocultar segmentos de cadenas, como direcciones de correo electrónico y números de teléfono:

```php
use Illuminate\Support\Str;

$string = Str::mask('taylor@example.com', '*', 3);

// tay***************
```

Si es necesario, puedes proporcionar un número negativo como tercer argumento al método `mask`, lo que indica al método que comience a ocultar caracteres a la distancia indicada desde el final de la cadena:

```php
$string = Str::mask('taylor@example.com', '*', -15, 3);

// tay***@example.com
```

<a id="method-str-match"></a>
#### `Str::match()` {.collection-method}

El método `Str::match` devuelve la parte de una cadena que coincide con un patrón de expresión regular indicado:

```php
use Illuminate\Support\Str;

$result = Str::match('/bar/', 'foo bar');

// 'bar'

$result = Str::match('/foo (.*)/', 'foo bar');

// 'bar'
```

<a id="method-str-match-all"></a>
#### `Str::matchAll()` {.collection-method}

El método `Str::matchAll` devuelve una colección con las partes de una cadena que coinciden con un patrón de expresión regular indicado:

```php
use Illuminate\Support\Str;

$result = Str::matchAll('/bar/', 'bar foo bar');

// collect(['bar', 'bar'])
```

Si especificas un grupo de captura en la expresión, Laravel devuelve una colección con las coincidencias del primer grupo de captura:

```php
use Illuminate\Support\Str;

$result = Str::matchAll('/f(\w*)/', 'bar fun bar fly');

// collect(['un', 'ly']);
```

Si no se encuentran coincidencias, se devuelve una colección vacía.

<a id="method-str-is-match"></a>
#### `Str::isMatch()` {.collection-method}

El método `Str::isMatch` devuelve `true` si la cadena coincide con una expresión regular indicada:

```php
use Illuminate\Support\Str;

$result = Str::isMatch('/foo (.*)/', 'foo bar');

// true

$result = Str::isMatch('/foo (.*)/', 'laravel');

// false
```

<a id="method-str-ordered-uuid"></a>
#### `Str::orderedUuid()` {.collection-method}

El método `Str::orderedUuid` genera un UUID con la marca de tiempo al principio que puede almacenarse de forma eficiente en una columna indexada de la base de datos. Cada UUID generado mediante este método se ordena después de los UUID generados previamente mediante el método:

```php
use Illuminate\Support\Str;

return (string) Str::orderedUuid();
```

<a id="method-str-padboth"></a>
#### `Str::padBoth()` {.collection-method}

El método `Str::padBoth` envuelve la función `str_pad` de PHP y rellena ambos lados de una cadena con otra cadena hasta que la cadena final alcanza la longitud deseada:

```php
use Illuminate\Support\Str;

$padded = Str::padBoth('James', 10, '_');

// '__James___'

$padded = Str::padBoth('James', 10);

// '  James   '
```

<a id="method-str-padleft"></a>
#### `Str::padLeft()` {.collection-method}

El método `Str::padLeft` envuelve la función `str_pad` de PHP y rellena el lado izquierdo de una cadena con otra cadena hasta que la cadena final alcanza la longitud deseada:

```php
use Illuminate\Support\Str;

$padded = Str::padLeft('James', 10, '-=');

// '-=-=-James'

$padded = Str::padLeft('James', 10);

// '     James'
```

<a id="method-str-padright"></a>
#### `Str::padRight()` {.collection-method}

El método `Str::padRight` envuelve la función `str_pad` de PHP y rellena el lado derecho de una cadena con otra cadena hasta que la cadena final alcanza la longitud deseada:

```php
use Illuminate\Support\Str;

$padded = Str::padRight('James', 10, '-');

// 'James-----'

$padded = Str::padRight('James', 10);

// 'James     '
```

<a id="method-str-password"></a>
#### `Str::password()` {.collection-method}

El método `Str::password` puede usarse para generar una contraseña aleatoria y segura de una longitud indicada. La contraseña consta de una combinación de letras, números y símbolos. De forma predeterminada, las contraseñas tienen 32 caracteres:

```php
use Illuminate\Support\Str;

$password = Str::password();

// 'EbJo2vE-AS:U,$%_gkrV4n,q~1xy/-_4'

$password = Str::password(12);

// 'qwuar>#V|i]N'
```

<a id="method-str-counted"></a>
#### `Str::counted()` {.collection-method}

El método `Str::counted` convierte una cadena que contiene una palabra en singular a su forma singular o plural según el recuento indicado y antepone el recuento formateado al resultado:

```php
use Illuminate\Support\Str;

$label = Str::counted('order', 1);

// 1 order

$label = Str::counted('order', 1000);

// 1,000 orders
```

<a id="method-str-plural"></a>
#### `Str::plural()` {.collection-method}

El método `Str::plural` convierte una cadena que contiene una palabra en singular a su forma plural. Esta función admite [cualquiera de los idiomas compatibles con el pluralizador de Laravel](../localization/#pluralization-language):

```php
use Illuminate\Support\Str;

$plural = Str::plural('car');

// cars

$plural = Str::plural('child');

// children
```

Puedes proporcionar un entero como segundo argumento de la función para obtener la forma singular o plural de la cadena:

```php
use Illuminate\Support\Str;

$plural = Str::plural('child', 2);

// children

$singular = Str::plural('child', 1);

// child
```

Puedes proporcionar el argumento `prependCount` para anteponer el `$count` formateado a la cadena pluralizada:

```php
use Illuminate\Support\Str;

$label = Str::plural('car', 1000, prependCount: true);

// 1,000 cars
```

<a id="method-str-plural-studly"></a>
#### `Str::pluralStudly()` {.collection-method}

El método `Str::pluralStudly` convierte una cadena que contiene una palabra en singular con formato StudlyCase a su forma plural. Esta función admite [cualquiera de los idiomas compatibles con el pluralizador de Laravel](../localization/#pluralization-language):

```php
use Illuminate\Support\Str;

$plural = Str::pluralStudly('VerifiedHuman');

// VerifiedHumans

$plural = Str::pluralStudly('UserFeedback');

// UserFeedback
```

Puedes proporcionar un entero como segundo argumento de la función para obtener la forma singular o plural de la cadena:

```php
use Illuminate\Support\Str;

$plural = Str::pluralStudly('VerifiedHuman', 2);

// VerifiedHumans

$singular = Str::pluralStudly('VerifiedHuman', 1);

// VerifiedHuman
```

<a id="method-str-position"></a>
#### `Str::position()` {.collection-method}

El método `Str::position` devuelve la posición de la primera aparición de una subcadena en una cadena. Si la subcadena no existe en la cadena indicada, se devuelve `false`:

```php
use Illuminate\Support\Str;

$position = Str::position('Hello, World!', 'Hello');

// 0

$position = Str::position('Hello, World!', 'W');

// 7
```

<a id="method-str-random"></a>
#### `Str::random()` {.collection-method}

El método `Str::random` genera una cadena aleatoria de la longitud especificada. Esta función usa la función `random_bytes` de PHP:

```php
use Illuminate\Support\Str;

$random = Str::random(40);
```

Durante las pruebas, puede resultar útil simular el valor que devuelve el método `Str::random`. Para ello, puedes usar el método `createRandomStringsUsing`:

```php
Str::createRandomStringsUsing(function () {
    return 'fake-random-string';
});
```

Para indicar al método `random` que vuelva a generar cadenas aleatorias de forma normal, puedes invocar el método `createRandomStringsNormally`:

```php
Str::createRandomStringsNormally();
```

<a id="method-str-remove"></a>
#### `Str::remove()` {.collection-method}

El método `Str::remove` elimina el valor o array de valores indicados de la cadena:

```php
use Illuminate\Support\Str;

$string = 'Peter Piper picked a peck of pickled peppers.';

$removed = Str::remove('e', $string);

// Ptr Pipr pickd a pck of pickld ppprs.
```

También puedes pasar `false` como tercer argumento al método `remove` para ignorar las diferencias entre mayúsculas y minúsculas al eliminar cadenas.

<a id="method-str-repeat"></a>
#### `Str::repeat()` {.collection-method}

El método `Str::repeat` repite la cadena indicada:

```php
use Illuminate\Support\Str;

$string = 'a';

$repeat = Str::repeat($string, 5);

// aaaaa
```

<a id="method-str-replace"></a>
#### `Str::replace()` {.collection-method}

El método `Str::replace` reemplaza una cadena indicada dentro de la cadena:

```php
use Illuminate\Support\Str;

$string = 'Laravel 11.x';

$replaced = Str::replace('11.x', '12.x', $string);

// Laravel 12.x
```

El método `replace` también acepta un argumento `caseSensitive`. De forma predeterminada, el método `replace` distingue entre mayúsculas y minúsculas:

```php
$replaced = Str::replace(
    'php',
    'Laravel',
    'PHP Framework for Web Artisans',
    caseSensitive: false
);

// Laravel Framework for Web Artisans
```

<a id="method-str-replace-array"></a>
#### `Str::replaceArray()` {.collection-method}

El método `Str::replaceArray` reemplaza un valor indicado en la cadena de forma secuencial mediante un array:

```php
use Illuminate\Support\Str;

$string = 'The event will take place between ? and ?';

$replaced = Str::replaceArray('?', ['8:30', '9:00'], $string);

// The event will take place between 8:30 and 9:00
```

<a id="method-str-replace-first"></a>
#### `Str::replaceFirst()` {.collection-method}

El método `Str::replaceFirst` reemplaza la primera aparición de un valor indicado en una cadena:

```php
use Illuminate\Support\Str;

$replaced = Str::replaceFirst('the', 'a', 'the quick brown fox jumps over the lazy dog');

// a quick brown fox jumps over the lazy dog
```

<a id="method-str-replace-last"></a>
#### `Str::replaceLast()` {.collection-method}

El método `Str::replaceLast` reemplaza la última aparición de un valor indicado en una cadena:

```php
use Illuminate\Support\Str;

$replaced = Str::replaceLast('the', 'a', 'the quick brown fox jumps over the lazy dog');

// the quick brown fox jumps over a lazy dog
```

<a id="method-str-replace-matches"></a>
#### `Str::replaceMatches()` {.collection-method}

El método `Str::replaceMatches` reemplaza todas las partes de una cadena que coinciden con un patrón por la cadena de reemplazo indicada:

```php
use Illuminate\Support\Str;

$replaced = Str::replaceMatches(
    pattern: '/[^A-Za-z0-9]++/',
    replace: '',
    subject: '(+1) 501-555-1000'
);

// '15015551000'
```

El método `replaceMatches` también acepta una clausura que se invoca con cada parte de la cadena que coincide con el patrón indicado, lo que permite ejecutar la lógica de reemplazo dentro de la clausura y devolver el valor reemplazado:

```php
use Illuminate\Support\Str;

$replaced = Str::replaceMatches('/\d/', function (array $matches) {
    return '['.$matches[0].']';
}, '123');

// '[1][2][3]'
```

<a id="method-str-replace-start"></a>
#### `Str::replaceStart()` {.collection-method}

El método `Str::replaceStart` reemplaza la primera aparición del valor indicado solo si este aparece al principio de la cadena:

```php
use Illuminate\Support\Str;

$replaced = Str::replaceStart('Hello', 'Laravel', 'Hello World');

// Laravel World

$replaced = Str::replaceStart('World', 'Laravel', 'Hello World');

// Hello World
```

<a id="method-str-replace-end"></a>
#### `Str::replaceEnd()` {.collection-method}

El método `Str::replaceEnd` reemplaza la última aparición del valor indicado solo si este aparece al final de la cadena:

```php
use Illuminate\Support\Str;

$replaced = Str::replaceEnd('World', 'Laravel', 'Hello World');

// Hello Laravel

$replaced = Str::replaceEnd('Hello', 'Laravel', 'Hello World');

// Hello World
```

<a id="method-str-reverse"></a>
#### `Str::reverse()` {.collection-method}

El método `Str::reverse` invierte la cadena indicada:

```php
use Illuminate\Support\Str;

$reversed = Str::reverse('Hello World');

// dlroW olleH
```

<a id="method-str-singular"></a>
#### `Str::singular()` {.collection-method}

El método `Str::singular` convierte una cadena a su forma singular. Esta función admite [cualquiera de los idiomas compatibles con el pluralizador de Laravel](../localization/#pluralization-language):

```php
use Illuminate\Support\Str;

$singular = Str::singular('cars');

// car

$singular = Str::singular('children');

// child
```

<a id="method-str-slug"></a>
#### `Str::slug()` {.collection-method}

El método `Str::slug` genera un «slug» adecuado para URLs a partir de la cadena indicada:

```php
use Illuminate\Support\Str;

$slug = Str::slug('Laravel 5 Framework', '-');

// laravel-5-framework
```

<a id="method-snake-case"></a>
#### `Str::snake()` {.collection-method}

El método `Str::snake` convierte la cadena indicada a `snake_case`:

```php
use Illuminate\Support\Str;

$converted = Str::snake('fooBar');

// foo_bar

$converted = Str::snake('fooBar', '-');

// foo-bar
```

<a id="method-str-squish"></a>
#### `Str::squish()` {.collection-method}

El método `Str::squish` elimina todos los espacios en blanco sobrantes de una cadena, incluidos los espacios sobrantes entre palabras:

```php
use Illuminate\Support\Str;

$string = Str::squish('    laravel    framework    ');

// laravel framework
```

<a id="method-str-start"></a>
#### `Str::start()` {.collection-method}

El método `Str::start` añade una sola aparición del valor indicado a una cadena si esta aún no comienza con ese valor:

```php
use Illuminate\Support\Str;

$adjusted = Str::start('this/string', '/');

// /this/string

$adjusted = Str::start('/this/string', '/');

// /this/string
```

<a id="method-starts-with"></a>
#### `Str::startsWith()` {.collection-method}

El método `Str::startsWith` determina si la cadena indicada comienza con el valor indicado:

```php
use Illuminate\Support\Str;

$result = Str::startsWith('This is my name', 'This');

// true
```

Si se pasa un array de valores posibles, el método `startsWith` devuelve `true` si la cadena comienza con alguno de los valores indicados:

```php
$result = Str::startsWith('This is my name', ['This', 'That', 'There']);

// true
```

<a id="method-studly-case"></a>
#### `Str::studly()` {.collection-method}

El método `Str::studly` convierte la cadena indicada a `StudlyCase`:

```php
use Illuminate\Support\Str;

$converted = Str::studly('foo_bar');

// FooBar
```

<a id="method-str-substr"></a>
#### `Str::substr()` {.collection-method}

El método `Str::substr` devuelve la parte de la cadena especificada por los parámetros de inicio y longitud:

```php
use Illuminate\Support\Str;

$converted = Str::substr('The Laravel Framework', 4, 7);

// Laravel
```

<a id="method-str-substrcount"></a>
#### `Str::substrCount()` {.collection-method}

El método `Str::substrCount` devuelve el número de apariciones de un valor indicado en la cadena indicada:

```php
use Illuminate\Support\Str;

$count = Str::substrCount('If you like ice cream, you will like snow cones.', 'like');

// 2
```

<a id="method-str-substrreplace"></a>
#### `Str::substrReplace()` {.collection-method}

El método `Str::substrReplace` reemplaza texto dentro de una parte de una cadena, comenzando en la posición especificada por el tercer argumento y reemplazando el número de caracteres especificado por el cuarto argumento. Al pasar `0` como cuarto argumento del método, la cadena se inserta en la posición especificada sin reemplazar ninguno de sus caracteres existentes:

```php
use Illuminate\Support\Str;

$result = Str::substrReplace('1300', ':', 2);
// 13:

$result = Str::substrReplace('1300', ':', 2, 0);
// 13:00
```

<a id="method-str-swap"></a>
#### `Str::swap()` {.collection-method}

El método `Str::swap` reemplaza varios valores en la cadena indicada mediante la función `strtr` de PHP:

```php
use Illuminate\Support\Str;

$string = Str::swap([
    'Tacos' => 'Burritos',
    'great' => 'fantastic',
], 'Tacos are great!');

// Burritos are fantastic!
```

<a id="method-take"></a>
#### `Str::take()` {.collection-method}

El método `Str::take` devuelve un número especificado de caracteres desde el principio de una cadena:

```php
use Illuminate\Support\Str;

$taken = Str::take('Build something amazing!', 5);

// Build
```

<a id="method-title-case"></a>
#### `Str::title()` {.collection-method}

El método `Str::title` convierte la cadena indicada a `Title Case`:

```php
use Illuminate\Support\Str;

$converted = Str::title('a nice title uses the correct case');

// A Nice Title Uses The Correct Case
```

<a id="method-str-to-base64"></a>
#### `Str::toBase64()` {.collection-method}

El método `Str::toBase64` convierte la cadena indicada a Base64:

```php
use Illuminate\Support\Str;

$base64 = Str::toBase64('Laravel');

// TGFyYXZlbA==
```

<a id="method-str-transliterate"></a>
#### `Str::transliterate()` {.collection-method}

El método `Str::transliterate` intenta convertir una cadena indicada a su representación ASCII más cercana:

```php
use Illuminate\Support\Str;

$email = Str::transliterate('ⓣⓔⓢⓣ@ⓛⓐⓡⓐⓥⓔⓛ.ⓒⓞⓜ');

// 'test@laravel.com'
```

<a id="method-str-trim"></a>
#### `Str::trim()` {.collection-method}

El método `Str::trim` elimina espacios en blanco (u otros caracteres) del principio y del final de la cadena indicada. A diferencia de la función nativa `trim` de PHP, el método `Str::trim` también elimina caracteres de espacio en blanco Unicode:

```php
use Illuminate\Support\Str;

$string = Str::trim(' foo bar ');

// 'foo bar'
```

<a id="method-str-ltrim"></a>
#### `Str::ltrim()` {.collection-method}

El método `Str::ltrim` elimina espacios en blanco (u otros caracteres) del principio de la cadena indicada. A diferencia de la función nativa `ltrim` de PHP, el método `Str::ltrim` también elimina caracteres de espacio en blanco Unicode:

```php
use Illuminate\Support\Str;

$string = Str::ltrim('  foo bar  ');

// 'foo bar  '
```

<a id="method-str-rtrim"></a>
#### `Str::rtrim()` {.collection-method}

El método `Str::rtrim` elimina espacios en blanco (u otros caracteres) del final de la cadena indicada. A diferencia de la función nativa `rtrim` de PHP, el método `Str::rtrim` también elimina caracteres de espacio en blanco Unicode:

```php
use Illuminate\Support\Str;

$string = Str::rtrim('  foo bar  ');

// '  foo bar'
```

<a id="method-str-ucfirst"></a>
#### `Str::ucfirst()` {.collection-method}

El método `Str::ucfirst` devuelve la cadena indicada con el primer carácter en mayúscula:

```php
use Illuminate\Support\Str;

$string = Str::ucfirst('foo bar');

// Foo bar
```

<a id="method-str-ucsplit"></a>
#### `Str::ucsplit()` {.collection-method}

El método `Str::ucsplit` divide la cadena indicada en un array por los caracteres en mayúscula:

```php
use Illuminate\Support\Str;

$segments = Str::ucsplit('FooBar');

// [0 => 'Foo', 1 => 'Bar']
```

<a id="method-str-ucwords"></a>
#### `Str::ucwords()` {.collection-method}

El método `Str::ucwords` convierte a mayúscula el primer carácter de cada palabra de la cadena indicada:

```php
use Illuminate\Support\Str;

$string = Str::ucwords('laravel framework');

// Laravel Framework
```

<a id="method-str-upper"></a>
#### `Str::upper()` {.collection-method}

El método `Str::upper` convierte la cadena indicada a mayúsculas:

```php
use Illuminate\Support\Str;

$string = Str::upper('laravel');

// LARAVEL
```

<a id="method-str-ulid"></a>
#### `Str::ulid()` {.collection-method}

El método `Str::ulid` genera un ULID, que es un identificador único compacto y ordenado por tiempo:

```php
use Illuminate\Support\Str;

return (string) Str::ulid();

// 01gd6r360bp37zj17nxb55yv40
```

Si deseas obtener una instancia de fecha `Illuminate\Support\Carbon` que represente la fecha y hora en que se creó un ULID indicado, puedes usar el método `createFromId` proporcionado por la integración de Carbon de Laravel:

```php
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

$date = Carbon::createFromId((string) Str::ulid());
```

Durante las pruebas, puede resultar útil simular el valor que devuelve el método `Str::ulid`. Para ello, puedes usar el método `createUlidsUsing`:

```php
use Symfony\Component\Uid\Ulid;

Str::createUlidsUsing(function () {
    return new Ulid('01HRDBNHHCKNW2AK4Z29SN82T9');
});
```

Para indicar al método `ulid` que vuelva a generar ULID de forma normal, puedes invocar el método `createUlidsNormally`:

```php
Str::createUlidsNormally();
```

<a id="method-str-unwrap"></a>
#### `Str::unwrap()` {.collection-method}

El método `Str::unwrap` elimina las cadenas especificadas del principio y del final de una cadena indicada:

```php
use Illuminate\Support\Str;

Str::unwrap('-Laravel-', '-');

// Laravel

Str::unwrap('{framework: "Laravel"}', '{', '}');

// framework: "Laravel"
```

<a id="method-str-uuid"></a>
#### `Str::uuid()` {.collection-method}

El método `Str::uuid` genera un UUID (versión 4):

```php
use Illuminate\Support\Str;

return (string) Str::uuid();
```

Durante las pruebas, puede resultar útil simular el valor que devuelve el método `Str::uuid`. Para ello, puedes usar el método `createUuidsUsing`:

```php
use Ramsey\Uuid\Uuid;

Str::createUuidsUsing(function () {
    return Uuid::fromString('eadbfeac-5258-45c2-bab7-ccb9b5ef74f9');
});
```

Para indicar al método `uuid` que vuelva a generar UUID de forma normal, puedes invocar el método `createUuidsNormally`:

```php
Str::createUuidsNormally();
```

<a id="method-str-uuid7"></a>
#### `Str::uuid7()` {.collection-method}

El método `Str::uuid7` genera un UUID (versión 7):

```php
use Illuminate\Support\Str;

return (string) Str::uuid7();
```

Puedes pasar un `DateTimeInterface` como parámetro opcional que se usará para generar el UUID ordenado:

```php
return (string) Str::uuid7(time: now());
```

<a id="method-str-word-count"></a>
#### `Str::wordCount()` {.collection-method}

El método `Str::wordCount` devuelve el número de palabras que contiene una cadena:

```php
use Illuminate\Support\Str;

Str::wordCount('Hello, world!'); // 2
```

<a id="method-str-word-wrap"></a>
#### `Str::wordWrap()` {.collection-method}

El método `Str::wordWrap` ajusta las líneas de una cadena a un número indicado de caracteres:

```php
use Illuminate\Support\Str;

$text = "The quick brown fox jumped over the lazy dog.";

Str::wordWrap($text, characters: 20, break: "<br />\n");

/*
The quick brown fox<br />
jumped over the lazy<br />
dog.
*/
```

<a id="method-str-words"></a>
#### `Str::words()` {.collection-method}

El método `Str::words` limita el número de palabras de una cadena. Puedes pasar una cadena adicional a este método mediante su tercer argumento para especificar qué cadena se debe añadir al final de la cadena truncada:

```php
use Illuminate\Support\Str;

return Str::words('Perfectly balanced, as all things should be.', 3, ' >>>');

// Perfectly balanced, as >>>
```

<a id="method-str-wrap"></a>
#### `Str::wrap()` {.collection-method}

El método `Str::wrap` envuelve la cadena indicada con una cadena o un par de cadenas adicionales:

```php
use Illuminate\Support\Str;

Str::wrap('Laravel', '"');

// "Laravel"

Str::wrap('is', before: 'This ', after: ' Laravel!');

// This is Laravel!
```

<a id="method-str"></a>
#### `str()` {.collection-method}

La función `str` devuelve una nueva instancia de `Illuminate\Support\Stringable` a partir de la cadena indicada. Esta función equivale al método `Str::of`:

```php
$string = str('Taylor')->append(' Otwell');

// 'Taylor Otwell'
```

Si no se proporciona ningún argumento a la función `str`, esta devuelve un objeto que delega las llamadas a métodos en `Illuminate\Support\Str`:

```php
$snake = str()->snake('FooBar');

// 'foo_bar'
```

<a id="method-trans"></a>
#### `trans()` {.collection-method}

La función `trans` traduce la clave de traducción indicada mediante tus [archivos de idioma](../localization/):

```php
echo trans('messages.welcome');
```

Si la clave de traducción especificada no existe, la función `trans` devuelve la clave indicada. Por lo tanto, en el ejemplo anterior, la función `trans` devolvería `messages.welcome` si la clave de traducción no existiera.

<a id="method-trans-choice"></a>
#### `trans_choice()` {.collection-method}

La función `trans_choice` traduce la clave de traducción indicada con flexión gramatical:

```php
echo trans_choice('messages.notifications', $unreadCount);
```

Si la clave de traducción especificada no existe, la función `trans_choice` devuelve la clave indicada. Por lo tanto, en el ejemplo anterior, la función `trans_choice` devolvería `messages.notifications` si la clave de traducción no existiera.

<a id="fluent-strings"></a>
## Cadenas fluidas

Las cadenas fluidas proporcionan una interfaz más fluida y orientada a objetos para trabajar con valores de cadena, lo que permite encadenar varias operaciones sobre cadenas con una sintaxis más legible que las operaciones tradicionales.

<a id="method-fluent-str-after"></a>
#### `after` {.collection-method}

El método `after` devuelve todo lo que aparece después del valor indicado en una cadena. Si el valor no existe en la cadena, se devuelve la cadena completa:

```php
use Illuminate\Support\Str;

$slice = Str::of('This is my name')->after('This is');

// ' my name'
```

<a id="method-fluent-str-after-last"></a>
#### `afterLast` {.collection-method}

El método `afterLast` devuelve todo lo que aparece después de la última aparición del valor indicado en una cadena. Si el valor no existe en la cadena, se devuelve la cadena completa:

```php
use Illuminate\Support\Str;

$slice = Str::of('App\Http\Controllers\Controller')->afterLast('\\');

// 'Controller'
```

<a id="method-fluent-str-apa"></a>
#### `apa` {.collection-method}

El método `apa` convierte la cadena indicada a mayúsculas de título según las [directrices de la APA](https://apastyle.apa.org/style-grammar-guidelines/capitalization/title-case):

```php
use Illuminate\Support\Str;

$converted = Str::of('a nice title uses the correct case')->apa();

// A Nice Title Uses the Correct Case
```

<a id="method-fluent-str-append"></a>
#### `append` {.collection-method}

El método `append` añade los valores indicados al final de la cadena:

```php
use Illuminate\Support\Str;

$string = Str::of('Taylor')->append(' Otwell');

// 'Taylor Otwell'
```

<a id="method-fluent-str-ascii"></a>
#### `ascii` {.collection-method}

El método `ascii` intenta transliterar la cadena a un valor ASCII:

```php
use Illuminate\Support\Str;

$string = Str::of('ü')->ascii();

// 'u'
```

<a id="method-fluent-str-basename"></a>
#### `basename` {.collection-method}

El método `basename` devuelve el componente de nombre final de la cadena indicada:

```php
use Illuminate\Support\Str;

$string = Str::of('/foo/bar/baz')->basename();

// 'baz'
```

Si es necesario, puedes proporcionar una «extensión» que se eliminará del componente final:

```php
use Illuminate\Support\Str;

$string = Str::of('/foo/bar/baz.jpg')->basename('.jpg');

// 'baz'
```

<a id="method-fluent-str-before"></a>
#### `before` {.collection-method}

El método `before` devuelve todo lo que aparece antes del valor indicado en una cadena:

```php
use Illuminate\Support\Str;

$slice = Str::of('This is my name')->before('my name');

// 'This is '
```

<a id="method-fluent-str-before-last"></a>
#### `beforeLast` {.collection-method}

El método `beforeLast` devuelve todo lo que aparece antes de la última aparición del valor indicado en una cadena:

```php
use Illuminate\Support\Str;

$slice = Str::of('This is my name')->beforeLast('is');

// 'This '
```

<a id="method-fluent-str-between"></a>
#### `between` {.collection-method}

El método `between` devuelve la parte de una cadena que se encuentra entre dos valores:

```php
use Illuminate\Support\Str;

$converted = Str::of('This is my name')->between('This', 'name');

// ' is my '
```

<a id="method-fluent-str-between-first"></a>
#### `betweenFirst` {.collection-method}

El método `betweenFirst` devuelve la parte más pequeña posible de una cadena entre dos valores:

```php
use Illuminate\Support\Str;

$converted = Str::of('[a] bc [d]')->betweenFirst('[', ']');

// 'a'
```

<a id="method-fluent-str-camel"></a>
#### `camel` {.collection-method}

El método `camel` convierte la cadena indicada a `camelCase`:

```php
use Illuminate\Support\Str;

$converted = Str::of('foo_bar')->camel();

// 'fooBar'
```

<a id="method-fluent-str-char-at"></a>
#### `charAt` {.collection-method}

El método `charAt` devuelve el carácter en el índice especificado. Si el índice está fuera de los límites, se devuelve `false`:

```php
use Illuminate\Support\Str;

$character = Str::of('This is my name.')->charAt(6);

// 's'
```

<a id="method-fluent-str-class-basename"></a>
#### `classBasename` {.collection-method}

El método `classBasename` devuelve el nombre de la clase indicada sin su espacio de nombres:

```php
use Illuminate\Support\Str;

$class = Str::of('Foo\Bar\Baz')->classBasename();

// 'Baz'
```

<a id="method-fluent-str-chop-start"></a>
#### `chopStart` {.collection-method}

El método `chopStart` elimina la primera aparición del valor indicado solo si este aparece al principio de la cadena:

```php
use Illuminate\Support\Str;

$url = Str::of('https://laravel.com')->chopStart('https://');

// 'laravel.com'
```

También puedes pasar un array. Si la cadena comienza con alguno de los valores del array, ese valor se elimina de la cadena:

```php
use Illuminate\Support\Str;

$url = Str::of('http://laravel.com')->chopStart(['https://', 'http://']);

// 'laravel.com'
```

<a id="method-fluent-str-chop-end"></a>
#### `chopEnd` {.collection-method}

El método `chopEnd` elimina la última aparición del valor indicado solo si este aparece al final de la cadena:

```php
use Illuminate\Support\Str;

$url = Str::of('https://laravel.com')->chopEnd('.com');

// 'https://laravel'
```

También puedes pasar un array. Si la cadena termina con alguno de los valores del array, ese valor se elimina de la cadena:

```php
use Illuminate\Support\Str;

$url = Str::of('http://laravel.com')->chopEnd(['.com', '.io']);

// 'http://laravel'
```

<a id="method-fluent-str-contains"></a>
#### `contains` {.collection-method}

El método `contains` determina si la cadena indicada contiene el valor indicado. De forma predeterminada, este método distingue entre mayúsculas y minúsculas:

```php
use Illuminate\Support\Str;

$contains = Str::of('This is my name')->contains('my');

// true
```

También puedes pasar un array de valores para determinar si la cadena indicada contiene alguno de los valores del array:

```php
use Illuminate\Support\Str;

$contains = Str::of('This is my name')->contains(['my', 'foo']);

// true
```

Puedes desactivar la distinción entre mayúsculas y minúsculas estableciendo el argumento `ignoreCase` en `true`:

```php
use Illuminate\Support\Str;

$contains = Str::of('This is my name')->contains('MY', ignoreCase: true);

// true
```

<a id="method-fluent-str-contains-all"></a>
#### `containsAll` {.collection-method}

El método `containsAll` determina si la cadena indicada contiene todos los valores del array indicado:

```php
use Illuminate\Support\Str;

$containsAll = Str::of('This is my name')->containsAll(['my', 'name']);

// true
```

Puedes desactivar la distinción entre mayúsculas y minúsculas estableciendo el argumento `ignoreCase` en `true`:

```php
use Illuminate\Support\Str;

$containsAll = Str::of('This is my name')->containsAll(['MY', 'NAME'], ignoreCase: true);

// true
```

<a id="method-fluent-str-decrypt"></a>
#### `decrypt` {.collection-method}

El método `decrypt` [descifra](../encryption/) la cadena cifrada:

```php
use Illuminate\Support\Str;

$decrypted = $encrypted->decrypt();

// 'secret'
```

Para la operación inversa de `decrypt`, consulta el método [encrypt](#method-fluent-str-encrypt).

<a id="method-fluent-str-deduplicate"></a>
#### `deduplicate` {.collection-method}

El método `deduplicate` reemplaza las apariciones consecutivas de un carácter por una sola aparición de ese carácter en la cadena indicada. De forma predeterminada, el método elimina los espacios duplicados:

```php
use Illuminate\Support\Str;

$result = Str::of('The   Laravel   Framework')->deduplicate();

// The Laravel Framework
```

Puedes especificar otro carácter del que eliminar duplicados pasándolo como primer argumento al método:

```php
use Illuminate\Support\Str;

$result = Str::of('The---Laravel---Framework')->deduplicate('-');

// The-Laravel-Framework
```

<a id="method-fluent-str-dirname"></a>
#### `dirname` {.collection-method}

El método `dirname` devuelve la parte correspondiente al directorio padre de la cadena indicada:

```php
use Illuminate\Support\Str;

$string = Str::of('/foo/bar/baz')->dirname();

// '/foo/bar'
```

Si es necesario, puedes especificar cuántos niveles de directorio deseas quitar de la cadena:

```php
use Illuminate\Support\Str;

$string = Str::of('/foo/bar/baz')->dirname(2);

// '/foo'
```

<a id="method-fluent-str-doesnt-contain"></a>
#### `doesntContain()` {.collection-method}

El método `doesntContain` determina si la cadena indicada no contiene el valor indicado. Este método es el inverso del método [contains](#method-fluent-str-contains). De forma predeterminada, distingue entre mayúsculas y minúsculas:

```php
use Illuminate\Support\Str;

$doesntContain = Str::of('This is name')->doesntContain('my');

// true
```

También puedes pasar un array de valores para determinar si la cadena indicada no contiene ninguno de los valores del array:

```php
use Illuminate\Support\Str;

$doesntContain = Str::of('This is name')->doesntContain(['my', 'framework']);

// true
```

Puedes desactivar la distinción entre mayúsculas y minúsculas estableciendo el argumento `ignoreCase` en `true`:

```php
use Illuminate\Support\Str;

$doesntContain = Str::of('This is my name')->doesntContain('MY', ignoreCase: true);

// false
```

<a id="method-fluent-str-doesnt-end-with"></a>
#### `doesntEndWith` {.collection-method}

El método `doesntEndWith` determina si la cadena indicada no termina con el valor indicado:

```php
use Illuminate\Support\Str;

$result = Str::of('This is my name')->doesntEndWith('dog');

// true
```

También puedes pasar un array de valores para determinar si la cadena indicada no termina con ninguno de los valores del array:

```php
use Illuminate\Support\Str;

$result = Str::of('This is my name')->doesntEndWith(['this', 'foo']);

// true

$result = Str::of('This is my name')->doesntEndWith(['name', 'foo']);

// false
```

<a id="method-fluent-str-doesnt-start-with"></a>
#### `doesntStartWith` {.collection-method}

El método `doesntStartWith` determina si la cadena indicada no comienza con el valor indicado:

```php
use Illuminate\Support\Str;

$result = Str::of('This is my name')->doesntStartWith('That');

// true
```

También puedes pasar un array de valores para determinar si la cadena indicada no comienza con ninguno de los valores del array:

```php
use Illuminate\Support\Str;

$result = Str::of('This is my name')->doesntStartWith(['What', 'That', 'There']);

// true
```

<a id="method-fluent-str-encrypt"></a>
#### `encrypt` {.collection-method}

El método `encrypt` [cifra](../encryption/) la cadena:

```php
use Illuminate\Support\Str;

$encrypted = Str::of('secret')->encrypt();
```

Para la operación inversa de `encrypt`, consulta el método [decrypt](#method-fluent-str-decrypt).

<a id="method-fluent-str-ends-with"></a>
#### `endsWith` {.collection-method}

El método `endsWith` determina si la cadena indicada termina con el valor indicado:

```php
use Illuminate\Support\Str;

$result = Str::of('This is my name')->endsWith('name');

// true
```

También puedes pasar un array de valores para determinar si la cadena indicada termina con alguno de los valores del array:

```php
use Illuminate\Support\Str;

$result = Str::of('This is my name')->endsWith(['name', 'foo']);

// true

$result = Str::of('This is my name')->endsWith(['this', 'foo']);

// false
```

<a id="method-fluent-str-exactly"></a>
#### `exactly` {.collection-method}

El método `exactly` determina si la cadena indicada coincide exactamente con otra cadena:

```php
use Illuminate\Support\Str;

$result = Str::of('Laravel')->exactly('Laravel');

// true
```

<a id="method-fluent-str-excerpt"></a>
#### `excerpt` {.collection-method}

El método `excerpt` extrae un fragmento de la cadena que coincide con la primera aparición de una frase en ella:

```php
use Illuminate\Support\Str;

$excerpt = Str::of('This is my name')->excerpt('my', [
    'radius' => 3
]);

// '...is my na...'
```

La opción `radius`, cuyo valor predeterminado es `100`, permite definir el número de caracteres que deben aparecer a cada lado de la cadena truncada.

Además, puedes usar la opción `omission` para cambiar la cadena que se antepondrá y se añadirá al final de la cadena truncada:

```php
use Illuminate\Support\Str;

$excerpt = Str::of('This is my name')->excerpt('name', [
    'radius' => 3,
    'omission' => '(...) '
]);

// '(...) my name'
```

<a id="method-fluent-str-explode"></a>
#### `explode` {.collection-method}

El método `explode` divide la cadena por el delimitador indicado y devuelve una colección que contiene cada sección de la cadena dividida:

```php
use Illuminate\Support\Str;

$collection = Str::of('foo bar baz')->explode(' ');

// collect(['foo', 'bar', 'baz'])
```

<a id="method-fluent-str-finish"></a>
#### `finish` {.collection-method}

El método `finish` añade una sola aparición del valor indicado a una cadena si esta aún no termina con ese valor:

```php
use Illuminate\Support\Str;

$adjusted = Str::of('this/string')->finish('/');

// this/string/

$adjusted = Str::of('this/string/')->finish('/');

// this/string/
```

<a id="method-fluent-str-from-base64"></a>
#### `fromBase64` {.collection-method}

El método `fromBase64` decodifica la cadena Base64 indicada:

```php
use Illuminate\Support\Str;

$decoded = Str::of('TGFyYXZlbA==')->fromBase64();

// Laravel
```

<a id="method-fluent-str-hash"></a>
#### `hash` {.collection-method}

El método `hash` genera el hash de la cadena mediante el [algoritmo](https://www.php.net/manual/en/function.hash-algos.php) indicado:

```php
use Illuminate\Support\Str;

$hashed = Str::of('secret')->hash(algorithm: 'sha256');

// '2bb80d537b1da3e38bd30361aa855686bde0eacd7162fef6a25fe97bf527a25b'
```

<a id="method-fluent-str-headline"></a>
#### `headline` {.collection-method}

El método `headline` convierte cadenas delimitadas por cambios entre mayúsculas y minúsculas, guiones o guiones bajos en una cadena delimitada por espacios, con la primera letra de cada palabra en mayúscula:

```php
use Illuminate\Support\Str;

$headline = Str::of('taylor_otwell')->headline();

// Taylor Otwell

$headline = Str::of('EmailNotificationSent')->headline();

// Email Notification Sent
```

<a id="method-fluent-str-initials"></a>
#### `initials` {.collection-method}

El método `initials` convierte la cadena en sus iniciales:

```php
use Illuminate\Support\Str;

$initials = Str::of('Taylor Otwell')->initials()->upper();

// TO
```

<a id="method-fluent-str-inline-markdown"></a>
#### `inlineMarkdown` {.collection-method}

El método `inlineMarkdown` convierte Markdown con la sintaxis de GitHub a HTML en línea mediante [CommonMark](https://commonmark.thephpleague.com/). Sin embargo, a diferencia del método `markdown`, no envuelve todo el HTML generado en un elemento de bloque:

```php
use Illuminate\Support\Str;

$html = Str::of('**Laravel**')->inlineMarkdown();

// <strong>Laravel</strong>
```

#### Seguridad de Markdown

De forma predeterminada, Markdown admite HTML sin procesar, lo que expone vulnerabilidades de scripting entre sitios (XSS) al usarse con entradas de usuario sin procesar. Según la [documentación de seguridad de CommonMark](https://commonmark.thephpleague.com/security/), puedes usar la opción `html_input` para escapar o eliminar el HTML sin procesar, y la opción `allow_unsafe_links` para especificar si se permiten enlaces inseguros. Si necesitas permitir algo de HTML sin procesar, debes pasar el Markdown compilado por un purificador de HTML:

```php
use Illuminate\Support\Str;

Str::of('Inject: <script>alert("Hello XSS!");</script>')->inlineMarkdown([
    'html_input' => 'strip',
    'allow_unsafe_links' => false,
]);

// Inject: alert(&quot;Hello XSS!&quot;);
```

<a id="method-fluent-str-is"></a>
#### `is` {.collection-method}

El método `is` determina si una cadena indicada coincide con un patrón indicado. Se pueden usar asteriscos como comodines

```php
use Illuminate\Support\Str;

$matches = Str::of('foobar')->is('foo*');

// true

$matches = Str::of('foobar')->is('baz*');

// false
```

<a id="method-fluent-str-is-ascii"></a>
#### `isAscii` {.collection-method}

El método `isAscii` determina si una cadena indicada es una cadena ASCII:

```php
use Illuminate\Support\Str;

$result = Str::of('Taylor')->isAscii();

// true

$result = Str::of('ü')->isAscii();

// false
```

<a id="method-fluent-str-is-empty"></a>
#### `isEmpty` {.collection-method}

El método `isEmpty` determina si la cadena indicada está vacía:

```php
use Illuminate\Support\Str;

$result = Str::of('  ')->trim()->isEmpty();

// true

$result = Str::of('Laravel')->trim()->isEmpty();

// false
```

<a id="method-fluent-str-is-not-empty"></a>
#### `isNotEmpty` {.collection-method}

El método `isNotEmpty` determina si la cadena indicada no está vacía:

```php
use Illuminate\Support\Str;

$result = Str::of('  ')->trim()->isNotEmpty();

// false

$result = Str::of('Laravel')->trim()->isNotEmpty();

// true
```

<a id="method-fluent-str-is-json"></a>
#### `isJson` {.collection-method}

El método `isJson` determina si una cadena indicada es JSON válido:

```php
use Illuminate\Support\Str;

$result = Str::of('[1,2,3]')->isJson();

// true

$result = Str::of('{"first": "John", "last": "Doe"}')->isJson();

// true

$result = Str::of('{first: "John", last: "Doe"}')->isJson();

// false
```

<a id="method-fluent-str-is-ulid"></a>
#### `isUlid` {.collection-method}

El método `isUlid` determina si una cadena indicada es un ULID:

```php
use Illuminate\Support\Str;

$result = Str::of('01gd6r360bp37zj17nxb55yv40')->isUlid();

// true

$result = Str::of('Taylor')->isUlid();

// false
```

<a id="method-fluent-str-is-url"></a>
#### `isUrl` {.collection-method}

El método `isUrl` determina si una cadena indicada es una URL:

```php
use Illuminate\Support\Str;

$result = Str::of('http://example.com')->isUrl();

// true

$result = Str::of('Taylor')->isUrl();

// false
```

El método `isUrl` considera válidos muchos protocolos. Sin embargo, puedes especificar qué protocolos deben considerarse válidos proporcionándolos al método `isUrl`:

```php
$result = Str::of('http://example.com')->isUrl(['http', 'https']);
```

<a id="method-fluent-str-is-uuid"></a>
#### `isUuid` {.collection-method}

El método `isUuid` determina si una cadena indicada es un UUID:

```php
use Illuminate\Support\Str;

$result = Str::of('5ace9ab9-e9cf-4ec6-a19d-5881212a452c')->isUuid();

// true

$result = Str::of('Taylor')->isUuid();

// false
```

También puedes validar que el UUID indicado cumpla una especificación UUID por versión (1, 3, 4, 5, 6, 7 u 8):

```php
use Illuminate\Support\Str;

$isUuid = Str::of('a0a2a2d2-0b87-4a18-83f2-2529882be2de')->isUuid(version: 4);

// true

$isUuid = Str::of('a0a2a2d2-0b87-4a18-83f2-2529882be2de')->isUuid(version: 1);

// false
```

<a id="method-fluent-str-kebab"></a>
#### `kebab` {.collection-method}

El método `kebab` convierte la cadena indicada a `kebab-case`:

```php
use Illuminate\Support\Str;

$converted = Str::of('fooBar')->kebab();

// foo-bar
```

<a id="method-fluent-str-lcfirst"></a>
#### `lcfirst` {.collection-method}

El método `lcfirst` devuelve la cadena indicada con el primer carácter en minúscula:

```php
use Illuminate\Support\Str;

$string = Str::of('Foo Bar')->lcfirst();

// foo Bar
```

<a id="method-fluent-str-length"></a>
#### `length` {.collection-method}

El método `length` devuelve la longitud de la cadena indicada:

```php
use Illuminate\Support\Str;

$length = Str::of('Laravel')->length();

// 7
```

<a id="method-fluent-str-limit"></a>
#### `limit` {.collection-method}

El método `limit` trunca la cadena indicada a la longitud especificada:

```php
use Illuminate\Support\Str;

$truncated = Str::of('The quick brown fox jumps over the lazy dog')->limit(20);

// The quick brown fox...
```

También puedes pasar un segundo argumento para cambiar la cadena que se añadirá al final de la cadena truncada:

```php
$truncated = Str::of('The quick brown fox jumps over the lazy dog')->limit(20, ' (...)');

// The quick brown fox (...)
```

Si deseas conservar palabras completas al truncar la cadena, puedes usar el argumento `preserveWords`. Cuando este argumento es `true`, la cadena se trunca en el límite de palabra completa más cercano:

```php
$truncated = Str::of('The quick brown fox')->limit(12, preserveWords: true);

// The quick...
```

<a id="method-fluent-str-lower"></a>
#### `lower` {.collection-method}

El método `lower` convierte la cadena indicada a minúsculas:

```php
use Illuminate\Support\Str;

$result = Str::of('LARAVEL')->lower();

// 'laravel'
```

<a id="method-fluent-str-markdown"></a>
#### `markdown` {.collection-method}

El método `markdown` convierte Markdown con la sintaxis de GitHub a HTML:

```php
use Illuminate\Support\Str;

$html = Str::of('# Laravel')->markdown();

// <h1>Laravel</h1>

$html = Str::of('# Taylor <b>Otwell</b>')->markdown([
    'html_input' => 'strip',
]);

// <h1>Taylor Otwell</h1>
```

#### Seguridad de Markdown

De forma predeterminada, Markdown admite HTML sin procesar, lo que expone vulnerabilidades de scripting entre sitios (XSS) al usarse con entradas de usuario sin procesar. Según la [documentación de seguridad de CommonMark](https://commonmark.thephpleague.com/security/), puedes usar la opción `html_input` para escapar o eliminar el HTML sin procesar, y la opción `allow_unsafe_links` para especificar si se permiten enlaces inseguros. Si necesitas permitir algo de HTML sin procesar, debes pasar el Markdown compilado por un purificador de HTML:

```php
use Illuminate\Support\Str;

Str::of('Inject: <script>alert("Hello XSS!");</script>')->markdown([
    'html_input' => 'strip',
    'allow_unsafe_links' => false,
]);

// <p>Inject: alert(&quot;Hello XSS!&quot;);</p>
```

<a id="method-fluent-str-mask"></a>
#### `mask` {.collection-method}

El método `mask` oculta parte de una cadena con un carácter repetido y puede usarse para ocultar segmentos de cadenas, como direcciones de correo electrónico y números de teléfono:

```php
use Illuminate\Support\Str;

$string = Str::of('taylor@example.com')->mask('*', 3);

// tay***************
```

Si es necesario, puedes proporcionar números negativos como segundo o tercer argumento al método `mask`, lo que indica al método que comience a ocultar caracteres a la distancia indicada desde el final de la cadena:

```php
$string = Str::of('taylor@example.com')->mask('*', -15, 3);

// tay***@example.com

$string = Str::of('taylor@example.com')->mask('*', 4, -4);

// tayl**********.com
```

<a id="method-fluent-str-match"></a>
#### `match` {.collection-method}

El método `match` devuelve la parte de una cadena que coincide con un patrón de expresión regular indicado:

```php
use Illuminate\Support\Str;

$result = Str::of('foo bar')->match('/bar/');

// 'bar'

$result = Str::of('foo bar')->match('/foo (.*)/');

// 'bar'
```

<a id="method-fluent-str-match-all"></a>
#### `matchAll` {.collection-method}

El método `matchAll` devuelve una colección con las partes de una cadena que coinciden con un patrón de expresión regular indicado:

```php
use Illuminate\Support\Str;

$result = Str::of('bar foo bar')->matchAll('/bar/');

// collect(['bar', 'bar'])
```

Si especificas un grupo de captura en la expresión, Laravel devuelve una colección con las coincidencias del primer grupo de captura:

```php
use Illuminate\Support\Str;

$result = Str::of('bar fun bar fly')->matchAll('/f(\w*)/');

// collect(['un', 'ly']);
```

Si no se encuentran coincidencias, se devuelve una colección vacía.

<a id="method-fluent-str-is-match"></a>
#### `isMatch` {.collection-method}

El método `isMatch` devuelve `true` si la cadena coincide con una expresión regular indicada:

```php
use Illuminate\Support\Str;

$result = Str::of('foo bar')->isMatch('/foo (.*)/');

// true

$result = Str::of('laravel')->isMatch('/foo (.*)/');

// false
```

<a id="method-fluent-str-new-line"></a>
#### `newLine` {.collection-method}

El método `newLine` añade un carácter de «fin de línea» al final de una cadena:

```php
use Illuminate\Support\Str;

$padded = Str::of('Laravel')->newLine()->append('Framework');

// 'Laravel
//  Framework'
```

<a id="method-fluent-str-padboth"></a>
#### `padBoth` {.collection-method}

El método `padBoth` envuelve la función `str_pad` de PHP y rellena ambos lados de una cadena con otra cadena hasta que la cadena final alcanza la longitud deseada:

```php
use Illuminate\Support\Str;

$padded = Str::of('James')->padBoth(10, '_');

// '__James___'

$padded = Str::of('James')->padBoth(10);

// '  James   '
```

<a id="method-fluent-str-padleft"></a>
#### `padLeft` {.collection-method}

El método `padLeft` envuelve la función `str_pad` de PHP y rellena el lado izquierdo de una cadena con otra cadena hasta que la cadena final alcanza la longitud deseada:

```php
use Illuminate\Support\Str;

$padded = Str::of('James')->padLeft(10, '-=');

// '-=-=-James'

$padded = Str::of('James')->padLeft(10);

// '     James'
```

<a id="method-fluent-str-padright"></a>
#### `padRight` {.collection-method}

El método `padRight` envuelve la función `str_pad` de PHP y rellena el lado derecho de una cadena con otra cadena hasta que la cadena final alcanza la longitud deseada:

```php
use Illuminate\Support\Str;

$padded = Str::of('James')->padRight(10, '-');

// 'James-----'

$padded = Str::of('James')->padRight(10);

// 'James     '
```

<a id="method-fluent-str-pipe"></a>
#### `pipe` {.collection-method}

El método `pipe` permite transformar la cadena pasando su valor actual al callable indicado:

```php
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$hash = Str::of('Laravel')->pipe('md5')->prepend('Checksum: ');

// 'Checksum: a5c95b86291ea299fcbe64458ed12702'

$closure = Str::of('foo')->pipe(function (Stringable $str) {
    return 'bar';
});

// 'bar'
```

<a id="method-fluent-str-counted"></a>
#### `counted` {.collection-method}

El método `counted` convierte una cadena que contiene una palabra en singular a su forma singular o plural según el recuento indicado y antepone el recuento formateado al resultado:

```php
use Illuminate\Support\Str;

$label = Str::of('order')->counted(1);

// 1 order

$label = Str::of('order')->counted(1000);

// 1,000 orders
```

<a id="method-fluent-str-plural"></a>
#### `plural` {.collection-method}

El método `plural` convierte una cadena que contiene una palabra en singular a su forma plural. Esta función admite [cualquiera de los idiomas compatibles con el pluralizador de Laravel](../localization/#pluralization-language):

```php
use Illuminate\Support\Str;

$plural = Str::of('car')->plural();

// cars

$plural = Str::of('child')->plural();

// children
```

Puedes proporcionar un argumento entero a la función para obtener la forma singular o plural de la cadena:

```php
use Illuminate\Support\Str;

$plural = Str::of('child')->plural(2);

// children

$plural = Str::of('child')->plural(1);

// child
```

Puedes proporcionar el argumento `prependCount` para anteponer el `$count` formateado a la cadena pluralizada:

```php
use Illuminate\Support\Str;

$label = Str::of('car')->plural(1000, prependCount: true);

// 1,000 cars
```

<a id="method-fluent-str-position"></a>
#### `position` {.collection-method}

El método `position` devuelve la posición de la primera aparición de una subcadena en una cadena. Si la subcadena no existe en la cadena, se devuelve `false`:

```php
use Illuminate\Support\Str;

$position = Str::of('Hello, World!')->position('Hello');

// 0

$position = Str::of('Hello, World!')->position('W');

// 7
```

<a id="method-fluent-str-prepend"></a>
#### `prepend` {.collection-method}

El método `prepend` antepone los valores indicados a la cadena:

```php
use Illuminate\Support\Str;

$string = Str::of('Framework')->prepend('Laravel ');

// Laravel Framework
```

<a id="method-fluent-str-remove"></a>
#### `remove` {.collection-method}

El método `remove` elimina el valor o array de valores indicados de la cadena:

```php
use Illuminate\Support\Str;

$string = Str::of('Arkansas is quite beautiful!')->remove('quite ');

// Arkansas is beautiful!
```

También puedes pasar `false` como segundo parámetro para ignorar las diferencias entre mayúsculas y minúsculas al eliminar cadenas.

<a id="method-fluent-str-repeat"></a>
#### `repeat` {.collection-method}

El método `repeat` repite la cadena indicada:

```php
use Illuminate\Support\Str;

$repeated = Str::of('a')->repeat(5);

// aaaaa
```

<a id="method-fluent-str-replace"></a>
#### `replace` {.collection-method}

El método `replace` reemplaza una cadena indicada dentro de la cadena:

```php
use Illuminate\Support\Str;

$replaced = Str::of('Laravel 6.x')->replace('6.x', '7.x');

// Laravel 7.x
```

El método `replace` también acepta un argumento `caseSensitive`. De forma predeterminada, el método `replace` distingue entre mayúsculas y minúsculas:

```php
$replaced = Str::of('macOS 13.x')->replace(
    'macOS', 'iOS', caseSensitive: false
);
```

<a id="method-fluent-str-replace-array"></a>
#### `replaceArray` {.collection-method}

El método `replaceArray` reemplaza un valor indicado en la cadena de forma secuencial mediante un array:

```php
use Illuminate\Support\Str;

$string = 'The event will take place between ? and ?';

$replaced = Str::of($string)->replaceArray('?', ['8:30', '9:00']);

// The event will take place between 8:30 and 9:00
```

<a id="method-fluent-str-replace-first"></a>
#### `replaceFirst` {.collection-method}

El método `replaceFirst` reemplaza la primera aparición de un valor indicado en una cadena:

```php
use Illuminate\Support\Str;

$replaced = Str::of('the quick brown fox jumps over the lazy dog')->replaceFirst('the', 'a');

// a quick brown fox jumps over the lazy dog
```

<a id="method-fluent-str-replace-last"></a>
#### `replaceLast` {.collection-method}

El método `replaceLast` reemplaza la última aparición de un valor indicado en una cadena:

```php
use Illuminate\Support\Str;

$replaced = Str::of('the quick brown fox jumps over the lazy dog')->replaceLast('the', 'a');

// the quick brown fox jumps over a lazy dog
```

<a id="method-fluent-str-replace-matches"></a>
#### `replaceMatches` {.collection-method}

El método `replaceMatches` reemplaza todas las partes de una cadena que coinciden con un patrón por la cadena de reemplazo indicada:

```php
use Illuminate\Support\Str;

$replaced = Str::of('(+1) 501-555-1000')->replaceMatches('/[^A-Za-z0-9]++/', '');

// '15015551000'
```

El método `replaceMatches` también acepta una clausura que se invoca con cada parte de la cadena que coincide con el patrón indicado, lo que permite ejecutar la lógica de reemplazo dentro de la clausura y devolver el valor reemplazado:

```php
use Illuminate\Support\Str;

$replaced = Str::of('123')->replaceMatches('/\d/', function (array $matches) {
    return '['.$matches[0].']';
});

// '[1][2][3]'
```

<a id="method-fluent-str-replace-start"></a>
#### `replaceStart` {.collection-method}

El método `replaceStart` reemplaza la primera aparición del valor indicado solo si este aparece al principio de la cadena:

```php
use Illuminate\Support\Str;

$replaced = Str::of('Hello World')->replaceStart('Hello', 'Laravel');

// Laravel World

$replaced = Str::of('Hello World')->replaceStart('World', 'Laravel');

// Hello World
```

<a id="method-fluent-str-replace-end"></a>
#### `replaceEnd` {.collection-method}

El método `replaceEnd` reemplaza la última aparición del valor indicado solo si este aparece al final de la cadena:

```php
use Illuminate\Support\Str;

$replaced = Str::of('Hello World')->replaceEnd('World', 'Laravel');

// Hello Laravel

$replaced = Str::of('Hello World')->replaceEnd('Hello', 'Laravel');

// Hello World
```

<a id="method-fluent-str-scan"></a>
#### `scan` {.collection-method}

El método `scan` analiza la entrada de una cadena y la convierte en una colección según un formato admitido por la [función `sscanf` de PHP](https://www.php.net/manual/en/function.sscanf.php):

```php
use Illuminate\Support\Str;

$collection = Str::of('filename.jpg')->scan('%[^.].%s');

// collect(['filename', 'jpg'])
```

<a id="method-fluent-str-singular"></a>
#### `singular` {.collection-method}

El método `singular` convierte una cadena a su forma singular. Esta función admite [cualquiera de los idiomas compatibles con el pluralizador de Laravel](../localization/#pluralization-language):

```php
use Illuminate\Support\Str;

$singular = Str::of('cars')->singular();

// car

$singular = Str::of('children')->singular();

// child
```

<a id="method-fluent-str-slug"></a>
#### `slug` {.collection-method}

El método `slug` genera un «slug» adecuado para URLs a partir de la cadena indicada:

```php
use Illuminate\Support\Str;

$slug = Str::of('Laravel Framework')->slug('-');

// laravel-framework
```

<a id="method-fluent-str-snake"></a>
#### `snake` {.collection-method}

El método `snake` convierte la cadena indicada a `snake_case`:

```php
use Illuminate\Support\Str;

$converted = Str::of('fooBar')->snake();

// foo_bar
```

<a id="method-fluent-str-split"></a>
#### `split` {.collection-method}

El método `split` divide una cadena en una colección mediante una expresión regular:

```php
use Illuminate\Support\Str;

$segments = Str::of('one, two, three')->split('/[\s,]+/');

// collect(["one", "two", "three"])
```

<a id="method-fluent-str-squish"></a>
#### `squish` {.collection-method}

El método `squish` elimina todos los espacios en blanco sobrantes de una cadena, incluidos los espacios sobrantes entre palabras:

```php
use Illuminate\Support\Str;

$string = Str::of('    laravel    framework    ')->squish();

// laravel framework
```

<a id="method-fluent-str-start"></a>
#### `start` {.collection-method}

El método `start` añade una sola aparición del valor indicado a una cadena si esta aún no comienza con ese valor:

```php
use Illuminate\Support\Str;

$adjusted = Str::of('this/string')->start('/');

// /this/string

$adjusted = Str::of('/this/string')->start('/');

// /this/string
```

<a id="method-fluent-str-starts-with"></a>
#### `startsWith` {.collection-method}

El método `startsWith` determina si la cadena indicada comienza con el valor indicado:

```php
use Illuminate\Support\Str;

$result = Str::of('This is my name')->startsWith('This');

// true
```

También puedes pasar un array de valores para determinar si la cadena indicada comienza con alguno de los valores del array:

```php
use Illuminate\Support\Str;

$result = Str::of('This is my name')->startsWith(['This', 'That']);

// true
```

<a id="method-fluent-str-strip-tags"></a>
#### `stripTags` {.collection-method}

El método `stripTags` elimina todas las etiquetas HTML y PHP de una cadena:

```php
use Illuminate\Support\Str;

$result = Str::of('<a href="https://laravel.com">Taylor <b>Otwell</b></a>')->stripTags();

// Taylor Otwell

$result = Str::of('<a href="https://laravel.com">Taylor <b>Otwell</b></a>')->stripTags('<b>');

// Taylor <b>Otwell</b>
```

<a id="method-fluent-str-studly"></a>
#### `studly` {.collection-method}

El método `studly` convierte la cadena indicada a `StudlyCase`:

```php
use Illuminate\Support\Str;

$converted = Str::of('foo_bar')->studly();

// FooBar
```

<a id="method-fluent-str-substr"></a>
#### `substr` {.collection-method}

El método `substr` devuelve la parte de la cadena especificada por los parámetros de inicio y longitud indicados:

```php
use Illuminate\Support\Str;

$string = Str::of('Laravel Framework')->substr(8);

// Framework

$string = Str::of('Laravel Framework')->substr(8, 5);

// Frame
```

<a id="method-fluent-str-substrreplace"></a>
#### `substrReplace` {.collection-method}

El método `substrReplace` reemplaza texto dentro de una parte de una cadena, comenzando en la posición especificada por el segundo argumento y reemplazando el número de caracteres especificado por el tercer argumento. Al pasar `0` como tercer argumento del método, la cadena se inserta en la posición especificada sin reemplazar ninguno de sus caracteres existentes:

```php
use Illuminate\Support\Str;

$string = Str::of('1300')->substrReplace(':', 2);

// 13:

$string = Str::of('The Framework')->substrReplace(' Laravel', 3, 0);

// The Laravel Framework
```

<a id="method-fluent-str-swap"></a>
#### `swap` {.collection-method}

El método `swap` reemplaza varios valores en la cadena mediante la función `strtr` de PHP:

```php
use Illuminate\Support\Str;

$string = Str::of('Tacos are great!')
    ->swap([
        'Tacos' => 'Burritos',
        'great' => 'fantastic',
    ]);

// Burritos are fantastic!
```

<a id="method-fluent-str-take"></a>
#### `take` {.collection-method}

El método `take` devuelve un número especificado de caracteres desde el principio de la cadena:

```php
use Illuminate\Support\Str;

$taken = Str::of('Build something amazing!')->take(5);

// Build
```

<a id="method-fluent-str-tap"></a>
#### `tap` {.collection-method}

El método `tap` pasa la cadena a la clausura indicada, lo que permite examinarla e interactuar con ella sin modificarla. El método `tap` devuelve la cadena original independientemente de lo que devuelva la clausura:

```php
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('Laravel')
    ->append(' Framework')
    ->tap(function (Stringable $string) {
        dump('String after append: '.$string);
    })
    ->upper();

// LARAVEL FRAMEWORK
```

<a id="method-fluent-str-test"></a>
#### `test` {.collection-method}

El método `test` determina si una cadena coincide con el patrón de expresión regular indicado:

```php
use Illuminate\Support\Str;

$result = Str::of('Laravel Framework')->test('/Laravel/');

// true
```

<a id="method-fluent-str-title"></a>
#### `title` {.collection-method}

El método `title` convierte la cadena indicada a `Title Case`:

```php
use Illuminate\Support\Str;

$converted = Str::of('a nice title uses the correct case')->title();

// A Nice Title Uses The Correct Case
```

<a id="method-fluent-str-to-base64"></a>
#### `toBase64` {.collection-method}

El método `toBase64` convierte la cadena indicada a Base64:

```php
use Illuminate\Support\Str;

$base64 = Str::of('Laravel')->toBase64();

// TGFyYXZlbA==
```

<a id="method-fluent-str-to-html-string"></a>
#### `toHtmlString` {.collection-method}

El método `toHtmlString` convierte la cadena indicada en una instancia de `Illuminate\Support\HtmlString`, que no se escapa al renderizarse en plantillas Blade:

```php
use Illuminate\Support\Str;

$htmlString = Str::of('Nuno Maduro')->toHtmlString();
```

<a id="method-fluent-str-to-uri"></a>
#### `toUri` {.collection-method}

El método `toUri` convierte la cadena indicada en una instancia de [Illuminate\Support\Uri](../helpers/#uri):

```php
use Illuminate\Support\Str;

$uri = Str::of('https://example.com')->toUri();
```

<a id="method-fluent-str-transliterate"></a>
#### `transliterate` {.collection-method}

El método `transliterate` intenta convertir una cadena indicada a su representación ASCII más cercana:

```php
use Illuminate\Support\Str;

$email = Str::of('ⓣⓔⓢⓣ@ⓛⓐⓡⓐⓥⓔⓛ.ⓒⓞⓜ')->transliterate();

// 'test@laravel.com'
```

<a id="method-fluent-str-trim"></a>
#### `trim` {.collection-method}

El método `trim` elimina los espacios de los extremos de la cadena indicada. A diferencia de la función nativa `trim` de PHP, el método `trim` de Laravel también elimina caracteres de espacio en blanco Unicode:

```php
use Illuminate\Support\Str;

$string = Str::of('  Laravel  ')->trim();

// 'Laravel'

$string = Str::of('/Laravel/')->trim('/');

// 'Laravel'
```

<a id="method-fluent-str-ltrim"></a>
#### `ltrim` {.collection-method}

El método `ltrim` elimina los espacios del extremo izquierdo de la cadena. A diferencia de la función nativa `ltrim` de PHP, el método `ltrim` de Laravel también elimina caracteres de espacio en blanco Unicode:

```php
use Illuminate\Support\Str;

$string = Str::of('  Laravel  ')->ltrim();

// 'Laravel  '

$string = Str::of('/Laravel/')->ltrim('/');

// 'Laravel/'
```

<a id="method-fluent-str-rtrim"></a>
#### `rtrim` {.collection-method}

El método `rtrim` elimina los espacios del extremo derecho de la cadena indicada. A diferencia de la función nativa `rtrim` de PHP, el método `rtrim` de Laravel también elimina caracteres de espacio en blanco Unicode:

```php
use Illuminate\Support\Str;

$string = Str::of('  Laravel  ')->rtrim();

// '  Laravel'

$string = Str::of('/Laravel/')->rtrim('/');

// '/Laravel'
```

<a id="method-fluent-str-ucfirst"></a>
#### `ucfirst` {.collection-method}

El método `ucfirst` devuelve la cadena indicada con el primer carácter en mayúscula:

```php
use Illuminate\Support\Str;

$string = Str::of('foo bar')->ucfirst();

// Foo bar
```

<a id="method-fluent-str-ucsplit"></a>
#### `ucsplit` {.collection-method}

El método `ucsplit` divide la cadena indicada en una colección por los caracteres en mayúscula:

```php
use Illuminate\Support\Str;

$string = Str::of('Foo Bar')->ucsplit();

// collect(['Foo ', 'Bar'])
```

<a id="method-fluent-str-ucwords"></a>
#### `ucwords` {.collection-method}

El método `ucwords` convierte a mayúscula el primer carácter de cada palabra de la cadena indicada:

```php
use Illuminate\Support\Str;

$string = Str::of('laravel framework')->ucwords();

// Laravel Framework
```

<a id="method-fluent-str-unwrap"></a>
#### `unwrap` {.collection-method}

El método `unwrap` elimina las cadenas especificadas del principio y del final de una cadena indicada:

```php
use Illuminate\Support\Str;

Str::of('-Laravel-')->unwrap('-');

// Laravel

Str::of('{framework: "Laravel"}')->unwrap('{', '}');

// framework: "Laravel"
```

<a id="method-fluent-str-upper"></a>
#### `upper` {.collection-method}

El método `upper` convierte la cadena indicada a mayúsculas:

```php
use Illuminate\Support\Str;

$adjusted = Str::of('laravel')->upper();

// LARAVEL
```

<a id="method-fluent-str-when"></a>
#### `when` {.collection-method}

El método `when` invoca la clausura indicada si una condición indicada es `true`. La clausura recibe la instancia de cadena fluida:

```php
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('Taylor')
    ->when(true, function (Stringable $string) {
        return $string->append(' Otwell');
    });

// 'Taylor Otwell'
```

Si es necesario, puedes pasar otra clausura como tercer parámetro al método `when`. Esta clausura se ejecutará si el parámetro de condición se evalúa como `false`.

<a id="method-fluent-str-when-contains"></a>
#### `whenContains` {.collection-method}

El método `whenContains` invoca la clausura indicada si la cadena contiene el valor indicado. La clausura recibe la instancia de cadena fluida:

```php
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('tony stark')
    ->whenContains('tony', function (Stringable $string) {
        return $string->title();
    });

// 'Tony Stark'
```

Si es necesario, puedes pasar otra clausura como tercer parámetro. La clausura se invocará si la cadena no contiene el valor indicado.

También puedes pasar un array de valores para determinar si la cadena indicada contiene alguno de los valores del array:

```php
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('tony stark')
    ->whenContains(['tony', 'hulk'], function (Stringable $string) {
        return $string->title();
    });

// Tony Stark
```

<a id="method-fluent-str-when-contains-all"></a>
#### `whenContainsAll` {.collection-method}

El método `whenContainsAll` invoca la clausura indicada si la cadena contiene todas las subcadenas indicadas. La clausura recibe la instancia de cadena fluida:

```php
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('tony stark')
    ->whenContainsAll(['tony', 'stark'], function (Stringable $string) {
        return $string->title();
    });

// 'Tony Stark'
```

Si es necesario, puedes pasar otra clausura como tercer parámetro. La clausura se invocará si el parámetro de condición se evalúa como `false`.

<a id="method-fluent-str-when-doesnt-end-with"></a>
#### `whenDoesntEndWith` {.collection-method}

El método `whenDoesntEndWith` invoca la clausura indicada si la cadena no termina con la subcadena indicada. La clausura recibe la instancia de cadena fluida:

```php
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('disney world')->whenDoesntEndWith('land', function (Stringable $string) {
    return $string->title();
});

// 'Disney World'
```

<a id="method-fluent-str-when-doesnt-start-with"></a>
#### `whenDoesntStartWith` {.collection-method}

El método `whenDoesntStartWith` invoca la clausura indicada si la cadena no comienza con la subcadena indicada. La clausura recibe la instancia de cadena fluida:

```php
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('disney world')->whenDoesntStartWith('sea', function (Stringable $string) {
    return $string->title();
});

// 'Disney World'
```

<a id="method-fluent-str-when-empty"></a>
#### `whenEmpty` {.collection-method}

El método `whenEmpty` invoca la clausura indicada si la cadena está vacía. Si la clausura devuelve un valor, el método `whenEmpty` también devuelve ese valor. Si la clausura no devuelve un valor, se devuelve la instancia de cadena fluida:

```php
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('  ')->trim()->whenEmpty(function (Stringable $string) {
    return $string->prepend('Laravel');
});

// 'Laravel'
```

<a id="method-fluent-str-when-not-empty"></a>
#### `whenNotEmpty` {.collection-method}

El método `whenNotEmpty` invoca la clausura indicada si la cadena no está vacía. Si la clausura devuelve un valor, el método `whenNotEmpty` también devuelve ese valor. Si la clausura no devuelve un valor, se devuelve la instancia de cadena fluida:

```php
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('Framework')->whenNotEmpty(function (Stringable $string) {
    return $string->prepend('Laravel ');
});

// 'Laravel Framework'
```

<a id="method-fluent-str-when-starts-with"></a>
#### `whenStartsWith` {.collection-method}

El método `whenStartsWith` invoca la clausura indicada si la cadena comienza con la subcadena indicada. La clausura recibe la instancia de cadena fluida:

```php
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('disney world')->whenStartsWith('disney', function (Stringable $string) {
    return $string->title();
});

// 'Disney World'
```

<a id="method-fluent-str-when-ends-with"></a>
#### `whenEndsWith` {.collection-method}

El método `whenEndsWith` invoca la clausura indicada si la cadena termina con la subcadena indicada. La clausura recibe la instancia de cadena fluida:

```php
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('disney world')->whenEndsWith('world', function (Stringable $string) {
    return $string->title();
});

// 'Disney World'
```

<a id="method-fluent-str-when-exactly"></a>
#### `whenExactly` {.collection-method}

El método `whenExactly` invoca la clausura indicada si la cadena coincide exactamente con la cadena indicada. La clausura recibe la instancia de cadena fluida:

```php
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('laravel')->whenExactly('laravel', function (Stringable $string) {
    return $string->title();
});

// 'Laravel'
```

<a id="method-fluent-str-when-not-exactly"></a>
#### `whenNotExactly` {.collection-method}

El método `whenNotExactly` invoca la clausura indicada si la cadena no coincide exactamente con la cadena indicada. La clausura recibe la instancia de cadena fluida:

```php
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('framework')->whenNotExactly('laravel', function (Stringable $string) {
    return $string->title();
});

// 'Framework'
```

<a id="method-fluent-str-when-is"></a>
#### `whenIs` {.collection-method}

El método `whenIs` invoca la clausura indicada si la cadena coincide con un patrón indicado. Se pueden usar asteriscos como comodines. La clausura recibe la instancia de cadena fluida:

```php
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('foo/bar')->whenIs('foo/*', function (Stringable $string) {
    return $string->append('/baz');
});

// 'foo/bar/baz'
```

<a id="method-fluent-str-when-is-ascii"></a>
#### `whenIsAscii` {.collection-method}

El método `whenIsAscii` invoca la clausura indicada si la cadena es ASCII de 7 bits. La clausura recibe la instancia de cadena fluida:

```php
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('laravel')->whenIsAscii(function (Stringable $string) {
    return $string->title();
});

// 'Laravel'
```

<a id="method-fluent-str-when-is-ulid"></a>
#### `whenIsUlid` {.collection-method}

El método `whenIsUlid` invoca la clausura indicada si la cadena es un ULID válido. La clausura recibe la instancia de cadena fluida:

```php
use Illuminate\Support\Str;

$string = Str::of('01gd6r360bp37zj17nxb55yv40')->whenIsUlid(function (Stringable $string) {
    return $string->substr(0, 8);
});

// '01gd6r36'
```

<a id="method-fluent-str-when-is-uuid"></a>
#### `whenIsUuid` {.collection-method}

El método `whenIsUuid` invoca la clausura indicada si la cadena es un UUID válido. La clausura recibe la instancia de cadena fluida:

```php
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('a0a2a2d2-0b87-4a18-83f2-2529882be2de')->whenIsUuid(function (Stringable $string) {
    return $string->substr(0, 8);
});

// 'a0a2a2d2'
```

<a id="method-fluent-str-when-test"></a>
#### `whenTest` {.collection-method}

El método `whenTest` invoca la clausura indicada si la cadena coincide con la expresión regular indicada. La clausura recibe la instancia de cadena fluida:

```php
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('laravel framework')->whenTest('/laravel/', function (Stringable $string) {
    return $string->title();
});

// 'Laravel Framework'
```

<a id="method-fluent-str-word-count"></a>
#### `wordCount` {.collection-method}

El método `wordCount` devuelve el número de palabras que contiene una cadena:

```php
use Illuminate\Support\Str;

Str::of('Hello, world!')->wordCount(); // 2
```

<a id="method-fluent-str-words"></a>
#### `words` {.collection-method}

El método `words` limita el número de palabras de una cadena. Si es necesario, puedes especificar una cadena adicional que se añadirá al final de la cadena truncada:

```php
use Illuminate\Support\Str;

$string = Str::of('Perfectly balanced, as all things should be.')->words(3, ' >>>');

// Perfectly balanced, as >>>
```

<a id="method-fluent-str-wrap"></a>
#### `wrap` {.collection-method}

El método `wrap` envuelve la cadena indicada con una cadena o un par de cadenas adicionales:

```php
use Illuminate\Support\Str;

Str::of('Laravel')->wrap('"');

// "Laravel"

Str::of('is')->wrap(before: 'This ', after: ' Laravel!');

// This is Laravel!
```
