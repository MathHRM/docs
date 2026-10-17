---
title: "Strings"
---

- [Introdução](#introduction)
- [Métodos Disponíveis](#available-methods)

<a id="introduction"></a>
## Introdução

O Laravel inclui uma variedade de funções para manipular valores de string. Muitas dessas funções são usadas pelo próprio framework; no entanto, você é livre para usá-las em suas próprias aplicações se as considerar convenientes.

<a id="available-methods"></a>
## Métodos Disponíveis

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
### Strings

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
### Fluent Strings

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
## Strings

<a id="method-__"></a>
#### `__()` {.collection-method}

A função `__` traduz a string de tradução ou chave de tradução fornecida usando seus [arquivos de idioma](/pt-br/localization/):

```php
echo __('Welcome to our application');

echo __('messages.welcome');
```

Se a string de tradução ou chave especificada não existir, a função `__` retornará o valor fornecido. Então, usando o exemplo acima, a função `__` retornaria `messages.welcome` se essa chave de tradução não existir.

<a id="method-class-basename"></a>
#### `class_basename()` {.collection-method}

A função `class_basename` retorna o nome da classe fornecida com o namespace da classe removido:

```php
$class = class_basename('Foo\Bar\Baz');

// Baz
```

<a id="method-e"></a>
#### `e()` {.collection-method}

A função `e` executa a função `htmlspecialchars` do PHP com a opção `double_encode` definida como `true` por padrão:

```php
echo e('<html>foo</html>');

// &lt;html&gt;foo&lt;/html&gt;
```

<a id="method-preg-replace-array"></a>
#### `preg_replace_array()` {.collection-method}

A função `preg_replace_array` substitui um padrão fornecido na string sequencialmente usando um array:

```php
$string = 'The event will take place between :start and :end';

$replaced = preg_replace_array('/:[a-z_]+/', ['8:30', '9:00'], $string);

// The event will take place between 8:30 and 9:00
```

<a id="method-str-after"></a>
#### `Str::after()` {.collection-method}

O método `Str::after` retorna tudo que vem após o valor fornecido em uma string. A string inteira será retornada se o valor não existir dentro da string:

```php
use Illuminate\Support\Str;

$slice = Str::after('This is my name', 'This is');

// ' my name'
```

<a id="method-str-after-last"></a>
#### `Str::afterLast()` {.collection-method}

O método `Str::afterLast` retorna tudo que vem após a última ocorrência do valor fornecido em uma string. A string inteira será retornada se o valor não existir dentro da string:

```php
use Illuminate\Support\Str;

$slice = Str::afterLast('App\Http\Controllers\Controller', '\\');

// 'Controller'
```

<a id="method-str-apa"></a>
#### `Str::apa()` {.collection-method}

O método `Str::apa` converte a string fornecida para title case seguindo as [diretrizes da APA](https://apastyle.apa.org/style-grammar-guidelines/capitalization/title-case):

```php
use Illuminate\Support\Str;

$title = Str::apa('Creating A Project');

// 'Creating a Project'
```

<a id="method-str-ascii"></a>
#### `Str::ascii()` {.collection-method}

O método `Str::ascii` tentará transliterar a string para um valor ASCII:

```php
use Illuminate\Support\Str;

$slice = Str::ascii('û');

// 'u'
```

<a id="method-str-before"></a>
#### `Str::before()` {.collection-method}

O método `Str::before` retorna tudo que vem antes do valor fornecido em uma string:

```php
use Illuminate\Support\Str;

$slice = Str::before('This is my name', 'my name');

// 'This is '
```

<a id="method-str-before-last"></a>
#### `Str::beforeLast()` {.collection-method}

O método `Str::beforeLast` retorna tudo que vem antes da última ocorrência do valor fornecido em uma string:

```php
use Illuminate\Support\Str;

$slice = Str::beforeLast('This is my name', 'is');

// 'This '
```

<a id="method-str-between"></a>
#### `Str::between()` {.collection-method}

O método `Str::between` retorna a porção de uma string entre dois valores:

```php
use Illuminate\Support\Str;

$slice = Str::between('This is my name', 'This', 'name');

// ' is my '
```

<a id="method-str-between-first"></a>
#### `Str::betweenFirst()` {.collection-method}

O método `Str::betweenFirst` retorna a menor porção possível de uma string entre dois valores:

```php
use Illuminate\Support\Str;

$slice = Str::betweenFirst('[a] bc [d]', '[', ']');

// 'a'
```

<a id="method-camel-case"></a>
#### `Str::camel()` {.collection-method}

O método `Str::camel` converte a string fornecida para `camelCase`:

```php
use Illuminate\Support\Str;

$converted = Str::camel('foo_bar');

// 'fooBar'
```

<a id="method-char-at"></a>
#### `Str::charAt()` {.collection-method}

O método `Str::charAt` retorna o caractere no índice especificado. Se o índice estiver fora dos limites, `false` é retornado:

```php
use Illuminate\Support\Str;

$character = Str::charAt('This is my name.', 6);

// 's'
```

<a id="method-str-chop-start"></a>
#### `Str::chopStart()` {.collection-method}

O método `Str::chopStart` remove a primeira ocorrência do valor fornecido apenas se o valor aparecer no início da string:

```php
use Illuminate\Support\Str;

$url = Str::chopStart('https://laravel.com', 'https://');

// 'laravel.com'
```

Você também pode passar um array como segundo argumento. Se a string começar com qualquer um dos valores do array, esse valor será removido da string:

```php
use Illuminate\Support\Str;

$url = Str::chopStart('http://laravel.com', ['https://', 'http://']);

// 'laravel.com'
```

<a id="method-str-chop-end"></a>
#### `Str::chopEnd()` {.collection-method}

O método `Str::chopEnd` remove a última ocorrência do valor fornecido apenas se o valor aparecer no final da string:

```php
use Illuminate\Support\Str;

$url = Str::chopEnd('app/Models/Photograph.php', '.php');

// 'app/Models/Photograph'
```

Você também pode passar um array como segundo argumento. Se a string terminar com qualquer um dos valores do array, esse valor será removido da string:

```php
use Illuminate\Support\Str;

$url = Str::chopEnd('laravel.com/index.php', ['/index.html', '/index.php']);

// 'laravel.com'
```

<a id="method-str-contains"></a>
#### `Str::contains()` {.collection-method}

O método `Str::contains` determina se a string fornecida contém o valor fornecido. Por padrão, este método diferencia maiúsculas de minúsculas:

```php
use Illuminate\Support\Str;

$contains = Str::contains('This is my name', 'my');

// true
```

Você também pode passar um array de valores para determinar se a string fornecida contém algum dos valores do array:

```php
use Illuminate\Support\Str;

$contains = Str::contains('This is my name', ['my', 'foo']);

// true
```

Você pode desativar a diferenciação de maiúsculas e minúsculas definindo o argumento `ignoreCase` como `true`:

```php
use Illuminate\Support\Str;

$contains = Str::contains('This is my name', 'MY', ignoreCase: true);

// true
```

<a id="method-str-contains-all"></a>
#### `Str::containsAll()` {.collection-method}

O método `Str::containsAll` determina se a string fornecida contém todos os valores de um array fornecido:

```php
use Illuminate\Support\Str;

$containsAll = Str::containsAll('This is my name', ['my', 'name']);

// true
```

Você pode desativar a diferenciação de maiúsculas e minúsculas definindo o argumento `ignoreCase` como `true`:

```php
use Illuminate\Support\Str;

$containsAll = Str::containsAll('This is my name', ['MY', 'NAME'], ignoreCase: true);

// true
```

<a id="method-str-doesnt-contain"></a>
#### `Str::doesntContain()` {.collection-method}

O método `Str::doesntContain` determina se a string fornecida não contém o valor fornecido. Por padrão, este método diferencia maiúsculas de minúsculas:

```php
use Illuminate\Support\Str;

$doesntContain = Str::doesntContain('This is name', 'my');

// true
```

Você também pode passar um array de valores para determinar se a string fornecida não contém nenhum dos valores do array:

```php
use Illuminate\Support\Str;

$doesntContain = Str::doesntContain('This is name', ['my', 'framework']);

// true
```

Você pode desativar a diferenciação de maiúsculas e minúsculas definindo o argumento `ignoreCase` como `true`:

```php
use Illuminate\Support\Str;

$doesntContain = Str::doesntContain('This is name', 'MY', ignoreCase: true);

// true
```

<a id="method-deduplicate"></a>
#### `Str::deduplicate()` {.collection-method}

O método `Str::deduplicate` substitui instâncias consecutivas de um caractere por uma única instância desse caractere na string fornecida. Por padrão, o método deduplica espaços:

```php
use Illuminate\Support\Str;

$result = Str::deduplicate('The   Laravel   Framework');

// The Laravel Framework
```

Você pode especificar um caractere diferente para deduplicar passando-o como segundo argumento do método:

```php
use Illuminate\Support\Str;

$result = Str::deduplicate('The---Laravel---Framework', '-');

// The-Laravel-Framework
```

<a id="method-str-doesnt-end-with"></a>
#### `Str::doesntEndWith()` {.collection-method}

O método `Str::doesntEndWith` determina se a string fornecida não termina com o valor fornecido:

```php
use Illuminate\Support\Str;

$result = Str::doesntEndWith('This is my name', 'dog');

// true
```

Você também pode passar um array de valores para determinar se a string fornecida não termina com nenhum dos valores do array:

```php
use Illuminate\Support\Str;

$result = Str::doesntEndWith('This is my name', ['this', 'foo']);

// true

$result = Str::doesntEndWith('This is my name', ['name', 'foo']);

// false
```

<a id="method-str-doesnt-start-with"></a>
#### `Str::doesntStartWith()` {.collection-method}

O método `Str::doesntStartWith` determina se a string fornecida não começa com o valor fornecido:

```php
use Illuminate\Support\Str;

$result = Str::doesntStartWith('This is my name', 'That');

// true
```

Se um array de valores possíveis for passado, o método `doesntStartWith` retornará `true` se a string não começar com nenhum dos valores fornecidos:

```php
$result = Str::doesntStartWith('This is my name', ['What', 'That', 'There']);

// true
```

<a id="method-ends-with"></a>
#### `Str::endsWith()` {.collection-method}

O método `Str::endsWith` determina se a string fornecida termina com o valor fornecido:

```php
use Illuminate\Support\Str;

$result = Str::endsWith('This is my name', 'name');

// true
```

Você também pode passar um array de valores para determinar se a string fornecida termina com algum dos valores do array:

```php
use Illuminate\Support\Str;

$result = Str::endsWith('This is my name', ['name', 'foo']);

// true

$result = Str::endsWith('This is my name', ['this', 'foo']);

// false
```

<a id="method-excerpt"></a>
#### `Str::excerpt()` {.collection-method}

O método `Str::excerpt` extrai um trecho de uma string fornecida que corresponde à primeira instância de uma frase dentro dessa string:

```php
use Illuminate\Support\Str;

$excerpt = Str::excerpt('This is my name', 'my', [
    'radius' => 3
]);

// '...is my na...'
```

A opção `radius`, que tem como padrão `100`, permite que você defina o número de caracteres que devem aparecer de cada lado da string truncada.

Além disso, você pode usar a opção `omission` para definir a string que será anteposta e acrescentada à string truncada:

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

O método `Str::finish` adiciona uma única instância do valor fornecido a uma string se ela ainda não terminar com esse valor:

```php
use Illuminate\Support\Str;

$adjusted = Str::finish('this/string', '/');

// this/string/

$adjusted = Str::finish('this/string/', '/');

// this/string/
```

<a id="method-str-from-base64"></a>
#### `Str::fromBase64()` {.collection-method}

O método `Str::fromBase64` decodifica a string Base64 fornecida:

```php
use Illuminate\Support\Str;

$decoded = Str::fromBase64('TGFyYXZlbA==');

// Laravel
```

<a id="method-str-headline"></a>
#### `Str::headline()` {.collection-method}

O método `Str::headline` converterá strings delimitadas por maiúsculas/minúsculas, hifens ou sublinhados em uma string delimitada por espaços com a primeira letra de cada palavra em maiúscula:

```php
use Illuminate\Support\Str;

$headline = Str::headline('steve_jobs');

// Steve Jobs

$headline = Str::headline('EmailNotificationSent');

// Email Notification Sent
```

<a id="method-str-initials"></a>
#### `Str::initials()` {.collection-method}

O método `Str::initials` retornará as iniciais de uma string fornecida, opcionalmente deixando-as em maiúsculas:

```php
use Illuminate\Support\Str;

$initials = Str::initials('taylor otwell');

// to

$initials = Str::initials('taylor otwell', capitalize: true);

// TO
```

<a id="method-str-inline-markdown"></a>
#### `Str::inlineMarkdown()` {.collection-method}

O método `Str::inlineMarkdown` converte Markdown no estilo do GitHub em HTML inline usando [CommonMark](https://commonmark.thephpleague.com/). No entanto, diferentemente do método `markdown`, ele não envolve todo o HTML gerado em um elemento de nível de bloco:

```php
use Illuminate\Support\Str;

$html = Str::inlineMarkdown('**Laravel**');

// <strong>Laravel</strong>
```

#### Segurança do Markdown

Por padrão, o Markdown suporta HTML bruto, o que exporá vulnerabilidades de Cross-Site Scripting (XSS) quando usado com entrada bruta do usuário. Conforme a [documentação de segurança do CommonMark](https://commonmark.thephpleague.com/security/), você pode usar a opção `html_input` para escapar ou remover o HTML bruto, e a opção `allow_unsafe_links` para especificar se deve permitir links inseguros. Se você precisar permitir algum HTML bruto, deve passar seu Markdown compilado por um HTML Purifier:

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

O método `Str::is` determina se uma string fornecida corresponde a um padrão fornecido. Asteriscos podem ser usados como valores curinga:

```php
use Illuminate\Support\Str;

$matches = Str::is('foo*', 'foobar');

// true

$matches = Str::is('baz*', 'foobar');

// false
```

Você pode desativar a diferenciação de maiúsculas e minúsculas definindo o argumento `ignoreCase` como `true`:

```php
use Illuminate\Support\Str;

$matches = Str::is('*.jpg', 'photo.JPG', ignoreCase: true);

// true
```

<a id="method-str-is-ascii"></a>
#### `Str::isAscii()` {.collection-method}

O método `Str::isAscii` determina se uma string fornecida é ASCII de 7 bits:

```php
use Illuminate\Support\Str;

$isAscii = Str::isAscii('Taylor');

// true

$isAscii = Str::isAscii('ü');

// false
```

<a id="method-str-is-json"></a>
#### `Str::isJson()` {.collection-method}

O método `Str::isJson` determina se a string fornecida é um JSON válido:

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

O método `Str::isUrl` determina se a string fornecida é uma URL válida:

```php
use Illuminate\Support\Str;

$isUrl = Str::isUrl('http://example.com');

// true

$isUrl = Str::isUrl('laravel');

// false
```

O método `isUrl` considera uma ampla gama de protocolos como válidos. No entanto, você pode especificar os protocolos que devem ser considerados válidos fornecendo-os ao método `isUrl`:

```php
$isUrl = Str::isUrl('http://example.com', ['http', 'https']);
```

<a id="method-str-is-ulid"></a>
#### `Str::isUlid()` {.collection-method}

O método `Str::isUlid` determina se a string fornecida é um ULID válido:

```php
use Illuminate\Support\Str;

$isUlid = Str::isUlid('01gd6r360bp37zj17nxb55yv40');

// true

$isUlid = Str::isUlid('laravel');

// false
```

<a id="method-str-is-uuid"></a>
#### `Str::isUuid()` {.collection-method}

O método `Str::isUuid` determina se a string fornecida é um UUID válido:

```php
use Illuminate\Support\Str;

$isUuid = Str::isUuid('a0a2a2d2-0b87-4a18-83f2-2529882be2de');

// true

$isUuid = Str::isUuid('laravel');

// false
```

Você também pode validar que o UUID fornecido corresponde a uma especificação de UUID por versão (1, 3, 4, 5, 6, 7 ou 8):

```php
use Illuminate\Support\Str;

$isUuid = Str::isUuid('a0a2a2d2-0b87-4a18-83f2-2529882be2de', version: 4);

// true

$isUuid = Str::isUuid('a0a2a2d2-0b87-4a18-83f2-2529882be2de', version: 1);

// false
```

<a id="method-kebab-case"></a>
#### `Str::kebab()` {.collection-method}

O método `Str::kebab` converte a string fornecida para `kebab-case`:

```php
use Illuminate\Support\Str;

$converted = Str::kebab('fooBar');

// foo-bar
```

<a id="method-str-lcfirst"></a>
#### `Str::lcfirst()` {.collection-method}

O método `Str::lcfirst` retorna a string fornecida com o primeiro caractere em minúscula:

```php
use Illuminate\Support\Str;

$string = Str::lcfirst('Foo Bar');

// foo Bar
```

<a id="method-str-length"></a>
#### `Str::length()` {.collection-method}

O método `Str::length` retorna o comprimento da string fornecida:

```php
use Illuminate\Support\Str;

$length = Str::length('Laravel');

// 7
```

<a id="method-str-limit"></a>
#### `Str::limit()` {.collection-method}

O método `Str::limit` trunca a string fornecida para o comprimento especificado:

```php
use Illuminate\Support\Str;

$truncated = Str::limit('The quick brown fox jumps over the lazy dog', 20);

// The quick brown fox...
```

Você pode passar um terceiro argumento ao método para alterar a string que será acrescentada ao final da string truncada:

```php
$truncated = Str::limit('The quick brown fox jumps over the lazy dog', 20, ' (...)');

// The quick brown fox (...)
```

Se você quiser preservar palavras completas ao truncar a string, pode utilizar o argumento `preserveWords`. Quando este argumento é `true`, a string será truncada no limite da palavra completa mais próxima:

```php
$truncated = Str::limit('The quick brown fox', 12, preserveWords: true);

// The quick...
```

<a id="method-str-lower"></a>
#### `Str::lower()` {.collection-method}

O método `Str::lower` converte a string fornecida para minúsculas:

```php
use Illuminate\Support\Str;

$converted = Str::lower('LARAVEL');

// laravel
```

<a id="method-str-markdown"></a>
#### `Str::markdown()` {.collection-method}

O método `Str::markdown` converte Markdown no estilo do GitHub em HTML usando [CommonMark](https://commonmark.thephpleague.com/):

```php
use Illuminate\Support\Str;

$html = Str::markdown('# Laravel');

// <h1>Laravel</h1>

$html = Str::markdown('# Taylor <b>Otwell</b>', [
    'html_input' => 'strip',
]);

// <h1>Taylor Otwell</h1>
```

#### Segurança do Markdown

Por padrão, o Markdown suporta HTML bruto, o que exporá vulnerabilidades de Cross-Site Scripting (XSS) quando usado com entrada bruta do usuário. Conforme a [documentação de segurança do CommonMark](https://commonmark.thephpleague.com/security/), você pode usar a opção `html_input` para escapar ou remover o HTML bruto, e a opção `allow_unsafe_links` para especificar se deve permitir links inseguros. Se você precisar permitir algum HTML bruto, deve passar seu Markdown compilado por um HTML Purifier:

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

O método `Str::mask` mascara uma porção de uma string com um caractere repetido e pode ser usado para ofuscar segmentos de strings como endereços de e-mail e números de telefone:

```php
use Illuminate\Support\Str;

$string = Str::mask('taylor@example.com', '*', 3);

// tay***************
```

Se necessário, você pode fornecer um número negativo como terceiro argumento ao método `mask`, o que instruirá o método a começar a mascarar na distância fornecida a partir do final da string:

```php
$string = Str::mask('taylor@example.com', '*', -15, 3);

// tay***@example.com
```

<a id="method-str-match"></a>
#### `Str::match()` {.collection-method}

O método `Str::match` retornará a porção de uma string que corresponde a um padrão de expressão regular fornecido:

```php
use Illuminate\Support\Str;

$result = Str::match('/bar/', 'foo bar');

// 'bar'

$result = Str::match('/foo (.*)/', 'foo bar');

// 'bar'
```

<a id="method-str-match-all"></a>
#### `Str::matchAll()` {.collection-method}

O método `Str::matchAll` retornará uma collection contendo as porções de uma string que correspondem a um padrão de expressão regular fornecido:

```php
use Illuminate\Support\Str;

$result = Str::matchAll('/bar/', 'bar foo bar');

// collect(['bar', 'bar'])
```

Se você especificar um grupo de correspondência dentro da expressão, o Laravel retornará uma collection com as correspondências do primeiro grupo de correspondência:

```php
use Illuminate\Support\Str;

$result = Str::matchAll('/f(\w*)/', 'bar fun bar fly');

// collect(['un', 'ly']);
```

Se nenhuma correspondência for encontrada, uma collection vazia será retornada.

<a id="method-str-is-match"></a>
#### `Str::isMatch()` {.collection-method}

O método `Str::isMatch` retornará `true` se a string corresponder a uma expressão regular fornecida:

```php
use Illuminate\Support\Str;

$result = Str::isMatch('/foo (.*)/', 'foo bar');

// true

$result = Str::isMatch('/foo (.*)/', 'laravel');

// false
```

<a id="method-str-ordered-uuid"></a>
#### `Str::orderedUuid()` {.collection-method}

O método `Str::orderedUuid` gera um UUID com "timestamp primeiro" que pode ser armazenado de forma eficiente em uma coluna de banco de dados indexada. Cada UUID gerado usando este método será ordenado após os UUIDs gerados anteriormente usando o método:

```php
use Illuminate\Support\Str;

return (string) Str::orderedUuid();
```

<a id="method-str-padboth"></a>
#### `Str::padBoth()` {.collection-method}

O método `Str::padBoth` encapsula a função `str_pad` do PHP, preenchendo ambos os lados de uma string com outra string até que a string final atinja um comprimento desejado:

```php
use Illuminate\Support\Str;

$padded = Str::padBoth('James', 10, '_');

// '__James___'

$padded = Str::padBoth('James', 10);

// '  James   '
```

<a id="method-str-padleft"></a>
#### `Str::padLeft()` {.collection-method}

O método `Str::padLeft` encapsula a função `str_pad` do PHP, preenchendo o lado esquerdo de uma string com outra string até que a string final atinja um comprimento desejado:

```php
use Illuminate\Support\Str;

$padded = Str::padLeft('James', 10, '-=');

// '-=-=-James'

$padded = Str::padLeft('James', 10);

// '     James'
```

<a id="method-str-padright"></a>
#### `Str::padRight()` {.collection-method}

O método `Str::padRight` encapsula a função `str_pad` do PHP, preenchendo o lado direito de uma string com outra string até que a string final atinja um comprimento desejado:

```php
use Illuminate\Support\Str;

$padded = Str::padRight('James', 10, '-');

// 'James-----'

$padded = Str::padRight('James', 10);

// 'James     '
```

<a id="method-str-password"></a>
#### `Str::password()` {.collection-method}

O método `Str::password` pode ser usado para gerar uma senha segura e aleatória de um comprimento fornecido. A senha consistirá em uma combinação de letras, números e símbolos. Por padrão, as senhas têm 32 caracteres de comprimento:

```php
use Illuminate\Support\Str;

$password = Str::password();

// 'EbJo2vE-AS:U,$%_gkrV4n,q~1xy/-_4'

$password = Str::password(12);

// 'qwuar>#V|i]N'
```

<a id="method-str-counted"></a>
#### `Str::counted()` {.collection-method}

O método `Str::counted` converte uma string de palavra no singular para sua forma singular ou plural com base na contagem fornecida e prefixa o resultado com a contagem formatada:

```php
use Illuminate\Support\Str;

$label = Str::counted('order', 1);

// 1 order

$label = Str::counted('order', 1000);

// 1,000 orders
```

<a id="method-str-plural"></a>
#### `Str::plural()` {.collection-method}

O método `Str::plural` converte uma string de palavra no singular para sua forma plural. Esta função suporta [qualquer um dos idiomas suportados pelo pluralizador do Laravel](/pt-br/localization/#pluralization-language):

```php
use Illuminate\Support\Str;

$plural = Str::plural('car');

// cars

$plural = Str::plural('child');

// children
```

Você pode fornecer um inteiro como segundo argumento à função para recuperar a forma singular ou plural da string:

```php
use Illuminate\Support\Str;

$plural = Str::plural('child', 2);

// children

$singular = Str::plural('child', 1);

// child
```

O argumento `prependCount` pode ser fornecido para prefixar a string pluralizada com a `$count` formatada:

```php
use Illuminate\Support\Str;

$label = Str::plural('car', 1000, prependCount: true);

// 1,000 cars
```

<a id="method-str-plural-studly"></a>
#### `Str::pluralStudly()` {.collection-method}

O método `Str::pluralStudly` converte uma string de palavra no singular formatada em studly caps case para sua forma plural. Esta função suporta [qualquer um dos idiomas suportados pelo pluralizador do Laravel](/pt-br/localization/#pluralization-language):

```php
use Illuminate\Support\Str;

$plural = Str::pluralStudly('VerifiedHuman');

// VerifiedHumans

$plural = Str::pluralStudly('UserFeedback');

// UserFeedback
```

Você pode fornecer um inteiro como segundo argumento à função para recuperar a forma singular ou plural da string:

```php
use Illuminate\Support\Str;

$plural = Str::pluralStudly('VerifiedHuman', 2);

// VerifiedHumans

$singular = Str::pluralStudly('VerifiedHuman', 1);

// VerifiedHuman
```

<a id="method-str-position"></a>
#### `Str::position()` {.collection-method}

O método `Str::position` retorna a posição da primeira ocorrência de uma substring em uma string. Se a substring não existir na string fornecida, `false` é retornado:

```php
use Illuminate\Support\Str;

$position = Str::position('Hello, World!', 'Hello');

// 0

$position = Str::position('Hello, World!', 'W');

// 7
```

<a id="method-str-random"></a>
#### `Str::random()` {.collection-method}

O método `Str::random` gera uma string aleatória do comprimento especificado. Esta função usa a função `random_bytes` do PHP:

```php
use Illuminate\Support\Str;

$random = Str::random(40);
```

Durante os testes, pode ser útil "falsear" (fake) o valor que é retornado pelo método `Str::random`. Para fazer isso, você pode usar o método `createRandomStringsUsing`:

```php
Str::createRandomStringsUsing(function () {
    return 'fake-random-string';
});
```

Para instruir o método `random` a voltar a gerar strings aleatórias normalmente, você pode invocar o método `createRandomStringsNormally`:

```php
Str::createRandomStringsNormally();
```

<a id="method-str-remove"></a>
#### `Str::remove()` {.collection-method}

O método `Str::remove` remove o valor fornecido ou array de valores da string:

```php
use Illuminate\Support\Str;

$string = 'Peter Piper picked a peck of pickled peppers.';

$removed = Str::remove('e', $string);

// Ptr Pipr pickd a pck of pickld ppprs.
```

Você também pode passar `false` como terceiro argumento ao método `remove` para ignorar maiúsculas e minúsculas ao remover strings.

<a id="method-str-repeat"></a>
#### `Str::repeat()` {.collection-method}

O método `Str::repeat` repete a string fornecida:

```php
use Illuminate\Support\Str;

$string = 'a';

$repeat = Str::repeat($string, 5);

// aaaaa
```

<a id="method-str-replace"></a>
#### `Str::replace()` {.collection-method}

O método `Str::replace` substitui uma string fornecida dentro da string:

```php
use Illuminate\Support\Str;

$string = 'Laravel 11.x';

$replaced = Str::replace('11.x', '12.x', $string);

// Laravel 12.x
```

O método `replace` também aceita um argumento `caseSensitive`. Por padrão, o método `replace` diferencia maiúsculas de minúsculas:

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

O método `Str::replaceArray` substitui um valor fornecido na string sequencialmente usando um array:

```php
use Illuminate\Support\Str;

$string = 'The event will take place between ? and ?';

$replaced = Str::replaceArray('?', ['8:30', '9:00'], $string);

// The event will take place between 8:30 and 9:00
```

<a id="method-str-replace-first"></a>
#### `Str::replaceFirst()` {.collection-method}

O método `Str::replaceFirst` substitui a primeira ocorrência de um valor fornecido em uma string:

```php
use Illuminate\Support\Str;

$replaced = Str::replaceFirst('the', 'a', 'the quick brown fox jumps over the lazy dog');

// a quick brown fox jumps over the lazy dog
```

<a id="method-str-replace-last"></a>
#### `Str::replaceLast()` {.collection-method}

O método `Str::replaceLast` substitui a última ocorrência de um valor fornecido em uma string:

```php
use Illuminate\Support\Str;

$replaced = Str::replaceLast('the', 'a', 'the quick brown fox jumps over the lazy dog');

// the quick brown fox jumps over a lazy dog
```

<a id="method-str-replace-matches"></a>
#### `Str::replaceMatches()` {.collection-method}

O método `Str::replaceMatches` substitui todas as porções de uma string que correspondem a um padrão pela string de substituição fornecida:

```php
use Illuminate\Support\Str;

$replaced = Str::replaceMatches(
    pattern: '/[^A-Za-z0-9]++/',
    replace: '',
    subject: '(+1) 501-555-1000'
);

// '15015551000'
```

O método `replaceMatches` também aceita uma closure que será invocada com cada porção da string que corresponde ao padrão fornecido, permitindo que você execute a lógica de substituição dentro da closure e retorne o valor substituído:

```php
use Illuminate\Support\Str;

$replaced = Str::replaceMatches('/\d/', function (array $matches) {
    return '['.$matches[0].']';
}, '123');

// '[1][2][3]'
```

<a id="method-str-replace-start"></a>
#### `Str::replaceStart()` {.collection-method}

O método `Str::replaceStart` substitui a primeira ocorrência do valor fornecido apenas se o valor aparecer no início da string:

```php
use Illuminate\Support\Str;

$replaced = Str::replaceStart('Hello', 'Laravel', 'Hello World');

// Laravel World

$replaced = Str::replaceStart('World', 'Laravel', 'Hello World');

// Hello World
```

<a id="method-str-replace-end"></a>
#### `Str::replaceEnd()` {.collection-method}

O método `Str::replaceEnd` substitui a última ocorrência do valor fornecido apenas se o valor aparecer no final da string:

```php
use Illuminate\Support\Str;

$replaced = Str::replaceEnd('World', 'Laravel', 'Hello World');

// Hello Laravel

$replaced = Str::replaceEnd('Hello', 'Laravel', 'Hello World');

// Hello World
```

<a id="method-str-reverse"></a>
#### `Str::reverse()` {.collection-method}

O método `Str::reverse` inverte a string fornecida:

```php
use Illuminate\Support\Str;

$reversed = Str::reverse('Hello World');

// dlroW olleH
```

<a id="method-str-singular"></a>
#### `Str::singular()` {.collection-method}

O método `Str::singular` converte uma string para sua forma singular. Esta função suporta [qualquer um dos idiomas suportados pelo pluralizador do Laravel](/pt-br/localization/#pluralization-language):

```php
use Illuminate\Support\Str;

$singular = Str::singular('cars');

// car

$singular = Str::singular('children');

// child
```

<a id="method-str-slug"></a>
#### `Str::slug()` {.collection-method}

O método `Str::slug` gera um "slug" amigável para URL a partir da string fornecida:

```php
use Illuminate\Support\Str;

$slug = Str::slug('Laravel 5 Framework', '-');

// laravel-5-framework
```

<a id="method-snake-case"></a>
#### `Str::snake()` {.collection-method}

O método `Str::snake` converte a string fornecida para `snake_case`:

```php
use Illuminate\Support\Str;

$converted = Str::snake('fooBar');

// foo_bar

$converted = Str::snake('fooBar', '-');

// foo-bar
```

<a id="method-str-squish"></a>
#### `Str::squish()` {.collection-method}

O método `Str::squish` remove todos os espaços em branco supérfluos de uma string, incluindo espaços em branco supérfluos entre palavras:

```php
use Illuminate\Support\Str;

$string = Str::squish('    laravel    framework    ');

// laravel framework
```

<a id="method-str-start"></a>
#### `Str::start()` {.collection-method}

O método `Str::start` adiciona uma única instância do valor fornecido a uma string se ela ainda não começar com esse valor:

```php
use Illuminate\Support\Str;

$adjusted = Str::start('this/string', '/');

// /this/string

$adjusted = Str::start('/this/string', '/');

// /this/string
```

<a id="method-starts-with"></a>
#### `Str::startsWith()` {.collection-method}

O método `Str::startsWith` determina se a string fornecida começa com o valor fornecido:

```php
use Illuminate\Support\Str;

$result = Str::startsWith('This is my name', 'This');

// true
```

Se um array de valores possíveis for passado, o método `startsWith` retornará `true` se a string começar com qualquer um dos valores fornecidos:

```php
$result = Str::startsWith('This is my name', ['This', 'That', 'There']);

// true
```

<a id="method-studly-case"></a>
#### `Str::studly()` {.collection-method}

O método `Str::studly` converte a string fornecida para `StudlyCase`:

```php
use Illuminate\Support\Str;

$converted = Str::studly('foo_bar');

// FooBar
```

<a id="method-str-substr"></a>
#### `Str::substr()` {.collection-method}

O método `Str::substr` retorna a porção da string especificada pelos parâmetros de início e comprimento:

```php
use Illuminate\Support\Str;

$converted = Str::substr('The Laravel Framework', 4, 7);

// Laravel
```

<a id="method-str-substrcount"></a>
#### `Str::substrCount()` {.collection-method}

O método `Str::substrCount` retorna o número de ocorrências de um valor fornecido na string fornecida:

```php
use Illuminate\Support\Str;

$count = Str::substrCount('If you like ice cream, you will like snow cones.', 'like');

// 2
```

<a id="method-str-substrreplace"></a>
#### `Str::substrReplace()` {.collection-method}

O método `Str::substrReplace` substitui texto dentro de uma porção de uma string, começando na posição especificada pelo terceiro argumento e substituindo o número de caracteres especificado pelo quarto argumento. Passar `0` para o quarto argumento do método inserirá a string na posição especificada sem substituir nenhum dos caracteres existentes na string:

```php
use Illuminate\Support\Str;

$result = Str::substrReplace('1300', ':', 2);
// 13:

$result = Str::substrReplace('1300', ':', 2, 0);
// 13:00
```

<a id="method-str-swap"></a>
#### `Str::swap()` {.collection-method}

O método `Str::swap` substitui vários valores na string fornecida usando a função `strtr` do PHP:

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

O método `Str::take` retorna um número especificado de caracteres a partir do início de uma string:

```php
use Illuminate\Support\Str;

$taken = Str::take('Build something amazing!', 5);

// Build
```

<a id="method-title-case"></a>
#### `Str::title()` {.collection-method}

O método `Str::title` converte a string fornecida para `Title Case`:

```php
use Illuminate\Support\Str;

$converted = Str::title('a nice title uses the correct case');

// A Nice Title Uses The Correct Case
```

<a id="method-str-to-base64"></a>
#### `Str::toBase64()` {.collection-method}

O método `Str::toBase64` converte a string fornecida para Base64:

```php
use Illuminate\Support\Str;

$base64 = Str::toBase64('Laravel');

// TGFyYXZlbA==
```

<a id="method-str-transliterate"></a>
#### `Str::transliterate()` {.collection-method}

O método `Str::transliterate` tentará converter uma string fornecida em sua representação ASCII mais próxima:

```php
use Illuminate\Support\Str;

$email = Str::transliterate('ⓣⓔⓢⓣ@ⓛⓐⓡⓐⓥⓔⓛ.ⓒⓞⓜ');

// 'test@laravel.com'
```

<a id="method-str-trim"></a>
#### `Str::trim()` {.collection-method}

O método `Str::trim` remove espaços em branco (ou outros caracteres) do início e do final da string fornecida. Diferentemente da função nativa `trim` do PHP, o método `Str::trim` também remove caracteres de espaço em branco unicode:

```php
use Illuminate\Support\Str;

$string = Str::trim(' foo bar ');

// 'foo bar'
```

<a id="method-str-ltrim"></a>
#### `Str::ltrim()` {.collection-method}

O método `Str::ltrim` remove espaços em branco (ou outros caracteres) do início da string fornecida. Diferentemente da função nativa `ltrim` do PHP, o método `Str::ltrim` também remove caracteres de espaço em branco unicode:

```php
use Illuminate\Support\Str;

$string = Str::ltrim('  foo bar  ');

// 'foo bar  '
```

<a id="method-str-rtrim"></a>
#### `Str::rtrim()` {.collection-method}

O método `Str::rtrim` remove espaços em branco (ou outros caracteres) do final da string fornecida. Diferentemente da função nativa `rtrim` do PHP, o método `Str::rtrim` também remove caracteres de espaço em branco unicode:

```php
use Illuminate\Support\Str;

$string = Str::rtrim('  foo bar  ');

// '  foo bar'
```

<a id="method-str-ucfirst"></a>
#### `Str::ucfirst()` {.collection-method}

O método `Str::ucfirst` retorna a string fornecida com o primeiro caractere em maiúscula:

```php
use Illuminate\Support\Str;

$string = Str::ucfirst('foo bar');

// Foo bar
```

<a id="method-str-ucsplit"></a>
#### `Str::ucsplit()` {.collection-method}

O método `Str::ucsplit` divide a string fornecida em um array por caracteres maiúsculos:

```php
use Illuminate\Support\Str;

$segments = Str::ucsplit('FooBar');

// [0 => 'Foo', 1 => 'Bar']
```

<a id="method-str-ucwords"></a>
#### `Str::ucwords()` {.collection-method}

O método `Str::ucwords` converte o primeiro caractere de cada palavra na string fornecida para maiúscula:

```php
use Illuminate\Support\Str;

$string = Str::ucwords('laravel framework');

// Laravel Framework
```

<a id="method-str-upper"></a>
#### `Str::upper()` {.collection-method}

O método `Str::upper` converte a string fornecida para maiúsculas:

```php
use Illuminate\Support\Str;

$string = Str::upper('laravel');

// LARAVEL
```

<a id="method-str-ulid"></a>
#### `Str::ulid()` {.collection-method}

O método `Str::ulid` gera um ULID, que é um identificador único compacto e ordenado por tempo:

```php
use Illuminate\Support\Str;

return (string) Str::ulid();

// 01gd6r360bp37zj17nxb55yv40
```

Se você quiser recuperar uma instância de data `Illuminate\Support\Carbon` representando a data e o horário em que um ULID fornecido foi criado, você pode usar o método `createFromId` fornecido pela integração do Carbon com o Laravel:

```php
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

$date = Carbon::createFromId((string) Str::ulid());
```

Durante os testes, pode ser útil "falsear" (fake) o valor que é retornado pelo método `Str::ulid`. Para fazer isso, você pode usar o método `createUlidsUsing`:

```php
use Symfony\Component\Uid\Ulid;

Str::createUlidsUsing(function () {
    return new Ulid('01HRDBNHHCKNW2AK4Z29SN82T9');
});
```

Para instruir o método `ulid` a voltar a gerar ULIDs normalmente, você pode invocar o método `createUlidsNormally`:

```php
Str::createUlidsNormally();
```

<a id="method-str-unwrap"></a>
#### `Str::unwrap()` {.collection-method}

O método `Str::unwrap` remove as strings especificadas do início e do final de uma string fornecida:

```php
use Illuminate\Support\Str;

Str::unwrap('-Laravel-', '-');

// Laravel

Str::unwrap('{framework: "Laravel"}', '{', '}');

// framework: "Laravel"
```

<a id="method-str-uuid"></a>
#### `Str::uuid()` {.collection-method}

O método `Str::uuid` gera um UUID (versão 4):

```php
use Illuminate\Support\Str;

return (string) Str::uuid();
```

Durante os testes, pode ser útil "falsear" (fake) o valor que é retornado pelo método `Str::uuid`. Para fazer isso, você pode usar o método `createUuidsUsing`:

```php
use Ramsey\Uuid\Uuid;

Str::createUuidsUsing(function () {
    return Uuid::fromString('eadbfeac-5258-45c2-bab7-ccb9b5ef74f9');
});
```

Para instruir o método `uuid` a voltar a gerar UUIDs normalmente, você pode invocar o método `createUuidsNormally`:

```php
Str::createUuidsNormally();
```

<a id="method-str-uuid7"></a>
#### `Str::uuid7()` {.collection-method}

O método `Str::uuid7` gera um UUID (versão 7):

```php
use Illuminate\Support\Str;

return (string) Str::uuid7();
```

Um `DateTimeInterface` pode ser passado como parâmetro opcional que será usado para gerar o UUID ordenado:

```php
return (string) Str::uuid7(time: now());
```

<a id="method-str-word-count"></a>
#### `Str::wordCount()` {.collection-method}

O método `Str::wordCount` retorna o número de palavras que uma string contém:

```php
use Illuminate\Support\Str;

Str::wordCount('Hello, world!'); // 2
```

<a id="method-str-word-wrap"></a>
#### `Str::wordWrap()` {.collection-method}

O método `Str::wordWrap` quebra uma string em um número fornecido de caracteres:

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

O método `Str::words` limita o número de palavras em uma string. Uma string adicional pode ser passada a este método via seu terceiro argumento para especificar qual string deve ser acrescentada ao final da string truncada:

```php
use Illuminate\Support\Str;

return Str::words('Perfectly balanced, as all things should be.', 3, ' >>>');

// Perfectly balanced, as >>>
```

<a id="method-str-wrap"></a>
#### `Str::wrap()` {.collection-method}

O método `Str::wrap` envolve a string fornecida com uma string adicional ou par de strings:

```php
use Illuminate\Support\Str;

Str::wrap('Laravel', '"');

// "Laravel"

Str::wrap('is', before: 'This ', after: ' Laravel!');

// This is Laravel!
```

<a id="method-str"></a>
#### `str()` {.collection-method}

A função `str` retorna uma nova instância de `Illuminate\Support\Stringable` da string fornecida. Esta função é equivalente ao método `Str::of`:

```php
$string = str('Taylor')->append(' Otwell');

// 'Taylor Otwell'
```

Se nenhum argumento for fornecido à função `str`, a função retorna um objeto que faz proxy de chamadas de método para `Illuminate\Support\Str`:

```php
$snake = str()->snake('FooBar');

// 'foo_bar'
```

<a id="method-trans"></a>
#### `trans()` {.collection-method}

A função `trans` traduz a chave de tradução fornecida usando seus [arquivos de idioma](/pt-br/localization/):

```php
echo trans('messages.welcome');
```

Se a chave de tradução especificada não existir, a função `trans` retornará a chave fornecida. Então, usando o exemplo acima, a função `trans` retornaria `messages.welcome` se a chave de tradução não existir.

<a id="method-trans-choice"></a>
#### `trans_choice()` {.collection-method}

A função `trans_choice` traduz a chave de tradução fornecida com inflexão:

```php
echo trans_choice('messages.notifications', $unreadCount);
```

Se a chave de tradução especificada não existir, a função `trans_choice` retornará a chave fornecida. Então, usando o exemplo acima, a função `trans_choice` retornaria `messages.notifications` se a chave de tradução não existir.

<a id="fluent-strings"></a>
## Fluent Strings

Fluent strings fornecem uma interface mais fluente e orientada a objetos para trabalhar com valores de string, permitindo que você encadeie várias operações de string usando uma sintaxe mais legível em comparação com operações de string tradicionais.

<a id="method-fluent-str-after"></a>
#### `after` {.collection-method}

O método `after` retorna tudo que vem após o valor fornecido em uma string. A string inteira será retornada se o valor não existir dentro da string:

```php
use Illuminate\Support\Str;

$slice = Str::of('This is my name')->after('This is');

// ' my name'
```

<a id="method-fluent-str-after-last"></a>
#### `afterLast` {.collection-method}

O método `afterLast` retorna tudo que vem após a última ocorrência do valor fornecido em uma string. A string inteira será retornada se o valor não existir dentro da string:

```php
use Illuminate\Support\Str;

$slice = Str::of('App\Http\Controllers\Controller')->afterLast('\\');

// 'Controller'
```

<a id="method-fluent-str-apa"></a>
#### `apa` {.collection-method}

O método `apa` converte a string fornecida para title case seguindo as [diretrizes da APA](https://apastyle.apa.org/style-grammar-guidelines/capitalization/title-case):

```php
use Illuminate\Support\Str;

$converted = Str::of('a nice title uses the correct case')->apa();

// A Nice Title Uses the Correct Case
```

<a id="method-fluent-str-append"></a>
#### `append` {.collection-method}

O método `append` acrescenta os valores fornecidos à string:

```php
use Illuminate\Support\Str;

$string = Str::of('Taylor')->append(' Otwell');

// 'Taylor Otwell'
```

<a id="method-fluent-str-ascii"></a>
#### `ascii` {.collection-method}

O método `ascii` tentará transliterar a string para um valor ASCII:

```php
use Illuminate\Support\Str;

$string = Str::of('ü')->ascii();

// 'u'
```

<a id="method-fluent-str-basename"></a>
#### `basename` {.collection-method}

O método `basename` retornará o componente de nome final da string fornecida:

```php
use Illuminate\Support\Str;

$string = Str::of('/foo/bar/baz')->basename();

// 'baz'
```

Se necessário, você pode fornecer uma "extensão" que será removida do componente final:

```php
use Illuminate\Support\Str;

$string = Str::of('/foo/bar/baz.jpg')->basename('.jpg');

// 'baz'
```

<a id="method-fluent-str-before"></a>
#### `before` {.collection-method}

O método `before` retorna tudo que vem antes do valor fornecido em uma string:

```php
use Illuminate\Support\Str;

$slice = Str::of('This is my name')->before('my name');

// 'This is '
```

<a id="method-fluent-str-before-last"></a>
#### `beforeLast` {.collection-method}

O método `beforeLast` retorna tudo que vem antes da última ocorrência do valor fornecido em uma string:

```php
use Illuminate\Support\Str;

$slice = Str::of('This is my name')->beforeLast('is');

// 'This '
```

<a id="method-fluent-str-between"></a>
#### `between` {.collection-method}

O método `between` retorna a porção de uma string entre dois valores:

```php
use Illuminate\Support\Str;

$converted = Str::of('This is my name')->between('This', 'name');

// ' is my '
```

<a id="method-fluent-str-between-first"></a>
#### `betweenFirst` {.collection-method}

O método `betweenFirst` retorna a menor porção possível de uma string entre dois valores:

```php
use Illuminate\Support\Str;

$converted = Str::of('[a] bc [d]')->betweenFirst('[', ']');

// 'a'
```

<a id="method-fluent-str-camel"></a>
#### `camel` {.collection-method}

O método `camel` converte a string fornecida para `camelCase`:

```php
use Illuminate\Support\Str;

$converted = Str::of('foo_bar')->camel();

// 'fooBar'
```

<a id="method-fluent-str-char-at"></a>
#### `charAt` {.collection-method}

O método `charAt` retorna o caractere no índice especificado. Se o índice estiver fora dos limites, `false` é retornado:

```php
use Illuminate\Support\Str;

$character = Str::of('This is my name.')->charAt(6);

// 's'
```

<a id="method-fluent-str-class-basename"></a>
#### `classBasename` {.collection-method}

O método `classBasename` retorna o nome da classe fornecida com o namespace da classe removido:

```php
use Illuminate\Support\Str;

$class = Str::of('Foo\Bar\Baz')->classBasename();

// 'Baz'
```

<a id="method-fluent-str-chop-start"></a>
#### `chopStart` {.collection-method}

O método `chopStart` remove a primeira ocorrência do valor fornecido apenas se o valor aparecer no início da string:

```php
use Illuminate\Support\Str;

$url = Str::of('https://laravel.com')->chopStart('https://');

// 'laravel.com'
```

Você também pode passar um array. Se a string começar com qualquer um dos valores do array, esse valor será removido da string:

```php
use Illuminate\Support\Str;

$url = Str::of('http://laravel.com')->chopStart(['https://', 'http://']);

// 'laravel.com'
```

<a id="method-fluent-str-chop-end"></a>
#### `chopEnd` {.collection-method}

O método `chopEnd` remove a última ocorrência do valor fornecido apenas se o valor aparecer no final da string:

```php
use Illuminate\Support\Str;

$url = Str::of('https://laravel.com')->chopEnd('.com');

// 'https://laravel'
```

Você também pode passar um array. Se a string terminar com qualquer um dos valores do array, esse valor será removido da string:

```php
use Illuminate\Support\Str;

$url = Str::of('http://laravel.com')->chopEnd(['.com', '.io']);

// 'http://laravel'
```

<a id="method-fluent-str-contains"></a>
#### `contains` {.collection-method}

O método `contains` determina se a string fornecida contém o valor fornecido. Por padrão, este método diferencia maiúsculas de minúsculas:

```php
use Illuminate\Support\Str;

$contains = Str::of('This is my name')->contains('my');

// true
```

Você também pode passar um array de valores para determinar se a string fornecida contém algum dos valores do array:

```php
use Illuminate\Support\Str;

$contains = Str::of('This is my name')->contains(['my', 'foo']);

// true
```

Você pode desativar a diferenciação de maiúsculas e minúsculas definindo o argumento `ignoreCase` como `true`:

```php
use Illuminate\Support\Str;

$contains = Str::of('This is my name')->contains('MY', ignoreCase: true);

// true
```

<a id="method-fluent-str-contains-all"></a>
#### `containsAll` {.collection-method}

O método `containsAll` determina se a string fornecida contém todos os valores do array fornecido:

```php
use Illuminate\Support\Str;

$containsAll = Str::of('This is my name')->containsAll(['my', 'name']);

// true
```

Você pode desativar a diferenciação de maiúsculas e minúsculas definindo o argumento `ignoreCase` como `true`:

```php
use Illuminate\Support\Str;

$containsAll = Str::of('This is my name')->containsAll(['MY', 'NAME'], ignoreCase: true);

// true
```

<a id="method-fluent-str-decrypt"></a>
#### `decrypt` {.collection-method}

O método `decrypt` [descriptografa](/pt-br/encryption/) a string criptografada:

```php
use Illuminate\Support\Str;

$decrypted = $encrypted->decrypt();

// 'secret'
```

Para o inverso de `decrypt`, veja o método [encrypt](#method-fluent-str-encrypt).

<a id="method-fluent-str-deduplicate"></a>
#### `deduplicate` {.collection-method}

O método `deduplicate` substitui instâncias consecutivas de um caractere por uma única instância desse caractere na string fornecida. Por padrão, o método deduplica espaços:

```php
use Illuminate\Support\Str;

$result = Str::of('The   Laravel   Framework')->deduplicate();

// The Laravel Framework
```

Você pode especificar um caractere diferente para deduplicar passando-o como primeiro argumento do método:

```php
use Illuminate\Support\Str;

$result = Str::of('The---Laravel---Framework')->deduplicate('-');

// The-Laravel-Framework
```

<a id="method-fluent-str-dirname"></a>
#### `dirname` {.collection-method}

O método `dirname` retorna a porção do diretório pai da string fornecida:

```php
use Illuminate\Support\Str;

$string = Str::of('/foo/bar/baz')->dirname();

// '/foo/bar'
```

Se necessário, você pode especificar quantos níveis de diretório deseja remover da string:

```php
use Illuminate\Support\Str;

$string = Str::of('/foo/bar/baz')->dirname(2);

// '/foo'
```

<a id="method-fluent-str-doesnt-contain"></a>
#### `doesntContain()` {.collection-method}

O método `doesntContain` determina se a string fornecida não contém o valor fornecido. Este método é o inverso do método [contains](#method-fluent-str-contains). Por padrão, este método diferencia maiúsculas de minúsculas:

```php
use Illuminate\Support\Str;

$doesntContain = Str::of('This is name')->doesntContain('my');

// true
```

Você também pode passar um array de valores para determinar se a string fornecida não contém nenhum dos valores do array:

```php
use Illuminate\Support\Str;

$doesntContain = Str::of('This is name')->doesntContain(['my', 'framework']);

// true
```

Você pode desativar a diferenciação de maiúsculas e minúsculas definindo o argumento `ignoreCase` como `true`:

```php
use Illuminate\Support\Str;

$doesntContain = Str::of('This is my name')->doesntContain('MY', ignoreCase: true);

// false
```

<a id="method-fluent-str-doesnt-end-with"></a>
#### `doesntEndWith` {.collection-method}

O método `doesntEndWith` determina se a string fornecida não termina com o valor fornecido:

```php
use Illuminate\Support\Str;

$result = Str::of('This is my name')->doesntEndWith('dog');

// true
```

Você também pode passar um array de valores para determinar se a string fornecida não termina com nenhum dos valores do array:

```php
use Illuminate\Support\Str;

$result = Str::of('This is my name')->doesntEndWith(['this', 'foo']);

// true

$result = Str::of('This is my name')->doesntEndWith(['name', 'foo']);

// false
```

<a id="method-fluent-str-doesnt-start-with"></a>
#### `doesntStartWith` {.collection-method}

O método `doesntStartWith` determina se a string fornecida não começa com o valor fornecido:

```php
use Illuminate\Support\Str;

$result = Str::of('This is my name')->doesntStartWith('That');

// true
```

Você também pode passar um array de valores para determinar se a string fornecida não começa com nenhum dos valores do array:

```php
use Illuminate\Support\Str;

$result = Str::of('This is my name')->doesntStartWith(['What', 'That', 'There']);

// true
```

<a id="method-fluent-str-encrypt"></a>
#### `encrypt` {.collection-method}

O método `encrypt` [criptografa](/pt-br/encryption/) a string:

```php
use Illuminate\Support\Str;

$encrypted = Str::of('secret')->encrypt();
```

Para o inverso de `encrypt`, veja o método [decrypt](#method-fluent-str-decrypt).

<a id="method-fluent-str-ends-with"></a>
#### `endsWith` {.collection-method}

O método `endsWith` determina se a string fornecida termina com o valor fornecido:

```php
use Illuminate\Support\Str;

$result = Str::of('This is my name')->endsWith('name');

// true
```

Você também pode passar um array de valores para determinar se a string fornecida termina com algum dos valores do array:

```php
use Illuminate\Support\Str;

$result = Str::of('This is my name')->endsWith(['name', 'foo']);

// true

$result = Str::of('This is my name')->endsWith(['this', 'foo']);

// false
```

<a id="method-fluent-str-exactly"></a>
#### `exactly` {.collection-method}

O método `exactly` determina se a string fornecida é uma correspondência exata com outra string:

```php
use Illuminate\Support\Str;

$result = Str::of('Laravel')->exactly('Laravel');

// true
```

<a id="method-fluent-str-excerpt"></a>
#### `excerpt` {.collection-method}

O método `excerpt` extrai um trecho da string que corresponde à primeira instância de uma frase dentro dessa string:

```php
use Illuminate\Support\Str;

$excerpt = Str::of('This is my name')->excerpt('my', [
    'radius' => 3
]);

// '...is my na...'
```

A opção `radius`, que tem como padrão `100`, permite que você defina o número de caracteres que devem aparecer de cada lado da string truncada.

Além disso, você pode usar a opção `omission` para alterar a string que será anteposta e acrescentada à string truncada:

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

O método `explode` divide a string pelo delimitador fornecido e retorna uma collection contendo cada seção da string dividida:

```php
use Illuminate\Support\Str;

$collection = Str::of('foo bar baz')->explode(' ');

// collect(['foo', 'bar', 'baz'])
```

<a id="method-fluent-str-finish"></a>
#### `finish` {.collection-method}

O método `finish` adiciona uma única instância do valor fornecido a uma string se ela ainda não terminar com esse valor:

```php
use Illuminate\Support\Str;

$adjusted = Str::of('this/string')->finish('/');

// this/string/

$adjusted = Str::of('this/string/')->finish('/');

// this/string/
```

<a id="method-fluent-str-from-base64"></a>
#### `fromBase64` {.collection-method}

O método `fromBase64` decodifica a string Base64 fornecida:

```php
use Illuminate\Support\Str;

$decoded = Str::of('TGFyYXZlbA==')->fromBase64();

// Laravel
```

<a id="method-fluent-str-hash"></a>
#### `hash` {.collection-method}

O método `hash` gera o hash da string usando o [algoritmo](https://www.php.net/manual/en/function.hash-algos.php) fornecido:

```php
use Illuminate\Support\Str;

$hashed = Str::of('secret')->hash(algorithm: 'sha256');

// '2bb80d537b1da3e38bd30361aa855686bde0eacd7162fef6a25fe97bf527a25b'
```

<a id="method-fluent-str-headline"></a>
#### `headline` {.collection-method}

O método `headline` converterá strings delimitadas por maiúsculas/minúsculas, hifens ou sublinhados em uma string delimitada por espaços com a primeira letra de cada palavra em maiúscula:

```php
use Illuminate\Support\Str;

$headline = Str::of('taylor_otwell')->headline();

// Taylor Otwell

$headline = Str::of('EmailNotificationSent')->headline();

// Email Notification Sent
```

<a id="method-fluent-str-initials"></a>
#### `initials` {.collection-method}

O método `initials` converterá a string em suas iniciais:

```php
use Illuminate\Support\Str;

$initials = Str::of('Taylor Otwell')->initials()->upper();

// TO
```

<a id="method-fluent-str-inline-markdown"></a>
#### `inlineMarkdown` {.collection-method}

O método `inlineMarkdown` converte Markdown no estilo do GitHub em HTML inline usando [CommonMark](https://commonmark.thephpleague.com/). No entanto, diferentemente do método `markdown`, ele não envolve todo o HTML gerado em um elemento de nível de bloco:

```php
use Illuminate\Support\Str;

$html = Str::of('**Laravel**')->inlineMarkdown();

// <strong>Laravel</strong>
```

#### Segurança do Markdown

Por padrão, o Markdown suporta HTML bruto, o que exporá vulnerabilidades de Cross-Site Scripting (XSS) quando usado com entrada bruta do usuário. Conforme a [documentação de segurança do CommonMark](https://commonmark.thephpleague.com/security/), você pode usar a opção `html_input` para escapar ou remover o HTML bruto, e a opção `allow_unsafe_links` para especificar se deve permitir links inseguros. Se você precisar permitir algum HTML bruto, deve passar seu Markdown compilado por um HTML Purifier:

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

O método `is` determina se uma string fornecida corresponde a um padrão fornecido. Asteriscos podem ser usados como valores curinga

```php
use Illuminate\Support\Str;

$matches = Str::of('foobar')->is('foo*');

// true

$matches = Str::of('foobar')->is('baz*');

// false
```

<a id="method-fluent-str-is-ascii"></a>
#### `isAscii` {.collection-method}

O método `isAscii` determina se uma string fornecida é uma string ASCII:

```php
use Illuminate\Support\Str;

$result = Str::of('Taylor')->isAscii();

// true

$result = Str::of('ü')->isAscii();

// false
```

<a id="method-fluent-str-is-empty"></a>
#### `isEmpty` {.collection-method}

O método `isEmpty` determina se a string fornecida está vazia:

```php
use Illuminate\Support\Str;

$result = Str::of('  ')->trim()->isEmpty();

// true

$result = Str::of('Laravel')->trim()->isEmpty();

// false
```

<a id="method-fluent-str-is-not-empty"></a>
#### `isNotEmpty` {.collection-method}

O método `isNotEmpty` determina se a string fornecida não está vazia:

```php
use Illuminate\Support\Str;

$result = Str::of('  ')->trim()->isNotEmpty();

// false

$result = Str::of('Laravel')->trim()->isNotEmpty();

// true
```

<a id="method-fluent-str-is-json"></a>
#### `isJson` {.collection-method}

O método `isJson` determina se uma string fornecida é um JSON válido:

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

O método `isUlid` determina se uma string fornecida é um ULID:

```php
use Illuminate\Support\Str;

$result = Str::of('01gd6r360bp37zj17nxb55yv40')->isUlid();

// true

$result = Str::of('Taylor')->isUlid();

// false
```

<a id="method-fluent-str-is-url"></a>
#### `isUrl` {.collection-method}

O método `isUrl` determina se uma string fornecida é uma URL:

```php
use Illuminate\Support\Str;

$result = Str::of('http://example.com')->isUrl();

// true

$result = Str::of('Taylor')->isUrl();

// false
```

O método `isUrl` considera uma ampla gama de protocolos como válidos. No entanto, você pode especificar os protocolos que devem ser considerados válidos fornecendo-os ao método `isUrl`:

```php
$result = Str::of('http://example.com')->isUrl(['http', 'https']);
```

<a id="method-fluent-str-is-uuid"></a>
#### `isUuid` {.collection-method}

O método `isUuid` determina se uma string fornecida é um UUID:

```php
use Illuminate\Support\Str;

$result = Str::of('5ace9ab9-e9cf-4ec6-a19d-5881212a452c')->isUuid();

// true

$result = Str::of('Taylor')->isUuid();

// false
```

Você também pode validar que o UUID fornecido corresponde a uma especificação de UUID por versão (1, 3, 4, 5, 6, 7 ou 8):

```php
use Illuminate\Support\Str;

$isUuid = Str::of('a0a2a2d2-0b87-4a18-83f2-2529882be2de')->isUuid(version: 4);

// true

$isUuid = Str::of('a0a2a2d2-0b87-4a18-83f2-2529882be2de')->isUuid(version: 1);

// false
```

<a id="method-fluent-str-kebab"></a>
#### `kebab` {.collection-method}

O método `kebab` converte a string fornecida para `kebab-case`:

```php
use Illuminate\Support\Str;

$converted = Str::of('fooBar')->kebab();

// foo-bar
```

<a id="method-fluent-str-lcfirst"></a>
#### `lcfirst` {.collection-method}

O método `lcfirst` retorna a string fornecida com o primeiro caractere em minúscula:

```php
use Illuminate\Support\Str;

$string = Str::of('Foo Bar')->lcfirst();

// foo Bar
```

<a id="method-fluent-str-length"></a>
#### `length` {.collection-method}

O método `length` retorna o comprimento da string fornecida:

```php
use Illuminate\Support\Str;

$length = Str::of('Laravel')->length();

// 7
```

<a id="method-fluent-str-limit"></a>
#### `limit` {.collection-method}

O método `limit` trunca a string fornecida para o comprimento especificado:

```php
use Illuminate\Support\Str;

$truncated = Str::of('The quick brown fox jumps over the lazy dog')->limit(20);

// The quick brown fox...
```

Você também pode passar um segundo argumento para alterar a string que será acrescentada ao final da string truncada:

```php
$truncated = Str::of('The quick brown fox jumps over the lazy dog')->limit(20, ' (...)');

// The quick brown fox (...)
```

Se você quiser preservar palavras completas ao truncar a string, pode utilizar o argumento `preserveWords`. Quando este argumento é `true`, a string será truncada no limite da palavra completa mais próxima:

```php
$truncated = Str::of('The quick brown fox')->limit(12, preserveWords: true);

// The quick...
```

<a id="method-fluent-str-lower"></a>
#### `lower` {.collection-method}

O método `lower` converte a string fornecida para minúsculas:

```php
use Illuminate\Support\Str;

$result = Str::of('LARAVEL')->lower();

// 'laravel'
```

<a id="method-fluent-str-markdown"></a>
#### `markdown` {.collection-method}

O método `markdown` converte Markdown no estilo do GitHub em HTML:

```php
use Illuminate\Support\Str;

$html = Str::of('# Laravel')->markdown();

// <h1>Laravel</h1>

$html = Str::of('# Taylor <b>Otwell</b>')->markdown([
    'html_input' => 'strip',
]);

// <h1>Taylor Otwell</h1>
```

#### Segurança do Markdown

Por padrão, o Markdown suporta HTML bruto, o que exporá vulnerabilidades de Cross-Site Scripting (XSS) quando usado com entrada bruta do usuário. Conforme a [documentação de segurança do CommonMark](https://commonmark.thephpleague.com/security/), você pode usar a opção `html_input` para escapar ou remover o HTML bruto, e a opção `allow_unsafe_links` para especificar se deve permitir links inseguros. Se você precisar permitir algum HTML bruto, deve passar seu Markdown compilado por um HTML Purifier:

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

O método `mask` mascara uma porção de uma string com um caractere repetido e pode ser usado para ofuscar segmentos de strings como endereços de e-mail e números de telefone:

```php
use Illuminate\Support\Str;

$string = Str::of('taylor@example.com')->mask('*', 3);

// tay***************
```

Se necessário, você pode fornecer números negativos como segundo ou terceiro argumento ao método `mask`, o que instruirá o método a começar a mascarar na distância fornecida a partir do final da string:

```php
$string = Str::of('taylor@example.com')->mask('*', -15, 3);

// tay***@example.com

$string = Str::of('taylor@example.com')->mask('*', 4, -4);

// tayl**********.com
```

<a id="method-fluent-str-match"></a>
#### `match` {.collection-method}

O método `match` retornará a porção de uma string que corresponde a um padrão de expressão regular fornecido:

```php
use Illuminate\Support\Str;

$result = Str::of('foo bar')->match('/bar/');

// 'bar'

$result = Str::of('foo bar')->match('/foo (.*)/');

// 'bar'
```

<a id="method-fluent-str-match-all"></a>
#### `matchAll` {.collection-method}

O método `matchAll` retornará uma collection contendo as porções de uma string que correspondem a um padrão de expressão regular fornecido:

```php
use Illuminate\Support\Str;

$result = Str::of('bar foo bar')->matchAll('/bar/');

// collect(['bar', 'bar'])
```

Se você especificar um grupo de correspondência dentro da expressão, o Laravel retornará uma collection com as correspondências do primeiro grupo de correspondência:

```php
use Illuminate\Support\Str;

$result = Str::of('bar fun bar fly')->matchAll('/f(\w*)/');

// collect(['un', 'ly']);
```

Se nenhuma correspondência for encontrada, uma collection vazia será retornada.

<a id="method-fluent-str-is-match"></a>
#### `isMatch` {.collection-method}

O método `isMatch` retornará `true` se a string corresponder a uma expressão regular fornecida:

```php
use Illuminate\Support\Str;

$result = Str::of('foo bar')->isMatch('/foo (.*)/');

// true

$result = Str::of('laravel')->isMatch('/foo (.*)/');

// false
```

<a id="method-fluent-str-new-line"></a>
#### `newLine` {.collection-method}

O método `newLine` acrescenta um caractere de "fim de linha" a uma string:

```php
use Illuminate\Support\Str;

$padded = Str::of('Laravel')->newLine()->append('Framework');

// 'Laravel
//  Framework'
```

<a id="method-fluent-str-padboth"></a>
#### `padBoth` {.collection-method}

O método `padBoth` encapsula a função `str_pad` do PHP, preenchendo ambos os lados de uma string com outra string até que a string final atinja o comprimento desejado:

```php
use Illuminate\Support\Str;

$padded = Str::of('James')->padBoth(10, '_');

// '__James___'

$padded = Str::of('James')->padBoth(10);

// '  James   '
```

<a id="method-fluent-str-padleft"></a>
#### `padLeft` {.collection-method}

O método `padLeft` encapsula a função `str_pad` do PHP, preenchendo o lado esquerdo de uma string com outra string até que a string final atinja o comprimento desejado:

```php
use Illuminate\Support\Str;

$padded = Str::of('James')->padLeft(10, '-=');

// '-=-=-James'

$padded = Str::of('James')->padLeft(10);

// '     James'
```

<a id="method-fluent-str-padright"></a>
#### `padRight` {.collection-method}

O método `padRight` encapsula a função `str_pad` do PHP, preenchendo o lado direito de uma string com outra string até que a string final atinja o comprimento desejado:

```php
use Illuminate\Support\Str;

$padded = Str::of('James')->padRight(10, '-');

// 'James-----'

$padded = Str::of('James')->padRight(10);

// 'James     '
```

<a id="method-fluent-str-pipe"></a>
#### `pipe` {.collection-method}

O método `pipe` permite que você transforme a string passando seu valor atual para o callable fornecido:

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

O método `counted` converte uma string de palavra no singular para sua forma singular ou plural com base na contagem fornecida e prefixa o resultado com a contagem formatada:

```php
use Illuminate\Support\Str;

$label = Str::of('order')->counted(1);

// 1 order

$label = Str::of('order')->counted(1000);

// 1,000 orders
```

<a id="method-fluent-str-plural"></a>
#### `plural` {.collection-method}

O método `plural` converte uma string de palavra no singular para sua forma plural. Esta função suporta [qualquer um dos idiomas suportados pelo pluralizador do Laravel](/pt-br/localization/#pluralization-language):

```php
use Illuminate\Support\Str;

$plural = Str::of('car')->plural();

// cars

$plural = Str::of('child')->plural();

// children
```

Você pode fornecer um argumento inteiro à função para recuperar a forma singular ou plural da string:

```php
use Illuminate\Support\Str;

$plural = Str::of('child')->plural(2);

// children

$plural = Str::of('child')->plural(1);

// child
```

Você pode fornecer o argumento `prependCount` para prefixar a string pluralizada com a `$count` formatada:

```php
use Illuminate\Support\Str;

$label = Str::of('car')->plural(1000, prependCount: true);

// 1,000 cars
```

<a id="method-fluent-str-position"></a>
#### `position` {.collection-method}

O método `position` retorna a posição da primeira ocorrência de uma substring em uma string. Se a substring não existir dentro da string, `false` é retornado:

```php
use Illuminate\Support\Str;

$position = Str::of('Hello, World!')->position('Hello');

// 0

$position = Str::of('Hello, World!')->position('W');

// 7
```

<a id="method-fluent-str-prepend"></a>
#### `prepend` {.collection-method}

O método `prepend` antepõe os valores fornecidos à string:

```php
use Illuminate\Support\Str;

$string = Str::of('Framework')->prepend('Laravel ');

// Laravel Framework
```

<a id="method-fluent-str-remove"></a>
#### `remove` {.collection-method}

O método `remove` remove o valor fornecido ou array de valores da string:

```php
use Illuminate\Support\Str;

$string = Str::of('Arkansas is quite beautiful!')->remove('quite ');

// Arkansas is beautiful!
```

Você também pode passar `false` como segundo parâmetro para ignorar maiúsculas e minúsculas ao remover strings.

<a id="method-fluent-str-repeat"></a>
#### `repeat` {.collection-method}

O método `repeat` repete a string fornecida:

```php
use Illuminate\Support\Str;

$repeated = Str::of('a')->repeat(5);

// aaaaa
```

<a id="method-fluent-str-replace"></a>
#### `replace` {.collection-method}

O método `replace` substitui uma string fornecida dentro da string:

```php
use Illuminate\Support\Str;

$replaced = Str::of('Laravel 6.x')->replace('6.x', '7.x');

// Laravel 7.x
```

O método `replace` também aceita um argumento `caseSensitive`. Por padrão, o método `replace` diferencia maiúsculas de minúsculas:

```php
$replaced = Str::of('macOS 13.x')->replace(
    'macOS', 'iOS', caseSensitive: false
);
```

<a id="method-fluent-str-replace-array"></a>
#### `replaceArray` {.collection-method}

O método `replaceArray` substitui um valor fornecido na string sequencialmente usando um array:

```php
use Illuminate\Support\Str;

$string = 'The event will take place between ? and ?';

$replaced = Str::of($string)->replaceArray('?', ['8:30', '9:00']);

// The event will take place between 8:30 and 9:00
```

<a id="method-fluent-str-replace-first"></a>
#### `replaceFirst` {.collection-method}

O método `replaceFirst` substitui a primeira ocorrência de um valor fornecido em uma string:

```php
use Illuminate\Support\Str;

$replaced = Str::of('the quick brown fox jumps over the lazy dog')->replaceFirst('the', 'a');

// a quick brown fox jumps over the lazy dog
```

<a id="method-fluent-str-replace-last"></a>
#### `replaceLast` {.collection-method}

O método `replaceLast` substitui a última ocorrência de um valor fornecido em uma string:

```php
use Illuminate\Support\Str;

$replaced = Str::of('the quick brown fox jumps over the lazy dog')->replaceLast('the', 'a');

// the quick brown fox jumps over a lazy dog
```

<a id="method-fluent-str-replace-matches"></a>
#### `replaceMatches` {.collection-method}

O método `replaceMatches` substitui todas as porções de uma string que correspondem a um padrão pela string de substituição fornecida:

```php
use Illuminate\Support\Str;

$replaced = Str::of('(+1) 501-555-1000')->replaceMatches('/[^A-Za-z0-9]++/', '');

// '15015551000'
```

O método `replaceMatches` também aceita uma closure que será invocada com cada porção da string que corresponde ao padrão fornecido, permitindo que você execute a lógica de substituição dentro da closure e retorne o valor substituído:

```php
use Illuminate\Support\Str;

$replaced = Str::of('123')->replaceMatches('/\d/', function (array $matches) {
    return '['.$matches[0].']';
});

// '[1][2][3]'
```

<a id="method-fluent-str-replace-start"></a>
#### `replaceStart` {.collection-method}

O método `replaceStart` substitui a primeira ocorrência do valor fornecido apenas se o valor aparecer no início da string:

```php
use Illuminate\Support\Str;

$replaced = Str::of('Hello World')->replaceStart('Hello', 'Laravel');

// Laravel World

$replaced = Str::of('Hello World')->replaceStart('World', 'Laravel');

// Hello World
```

<a id="method-fluent-str-replace-end"></a>
#### `replaceEnd` {.collection-method}

O método `replaceEnd` substitui a última ocorrência do valor fornecido apenas se o valor aparecer no final da string:

```php
use Illuminate\Support\Str;

$replaced = Str::of('Hello World')->replaceEnd('World', 'Laravel');

// Hello Laravel

$replaced = Str::of('Hello World')->replaceEnd('Hello', 'Laravel');

// Hello World
```

<a id="method-fluent-str-scan"></a>
#### `scan` {.collection-method}

O método `scan` faz o parse da entrada de uma string em uma collection de acordo com um formato suportado pela [função `sscanf` do PHP](https://www.php.net/manual/en/function.sscanf.php):

```php
use Illuminate\Support\Str;

$collection = Str::of('filename.jpg')->scan('%[^.].%s');

// collect(['filename', 'jpg'])
```

<a id="method-fluent-str-singular"></a>
#### `singular` {.collection-method}

O método `singular` converte uma string para sua forma singular. Esta função suporta [qualquer um dos idiomas suportados pelo pluralizador do Laravel](/pt-br/localization/#pluralization-language):

```php
use Illuminate\Support\Str;

$singular = Str::of('cars')->singular();

// car

$singular = Str::of('children')->singular();

// child
```

<a id="method-fluent-str-slug"></a>
#### `slug` {.collection-method}

O método `slug` gera um "slug" amigável para URL a partir da string fornecida:

```php
use Illuminate\Support\Str;

$slug = Str::of('Laravel Framework')->slug('-');

// laravel-framework
```

<a id="method-fluent-str-snake"></a>
#### `snake` {.collection-method}

O método `snake` converte a string fornecida para `snake_case`:

```php
use Illuminate\Support\Str;

$converted = Str::of('fooBar')->snake();

// foo_bar
```

<a id="method-fluent-str-split"></a>
#### `split` {.collection-method}

O método `split` divide uma string em uma collection usando uma expressão regular:

```php
use Illuminate\Support\Str;

$segments = Str::of('one, two, three')->split('/[\s,]+/');

// collect(["one", "two", "three"])
```

<a id="method-fluent-str-squish"></a>
#### `squish` {.collection-method}

O método `squish` remove todos os espaços em branco supérfluos de uma string, incluindo espaços em branco supérfluos entre palavras:

```php
use Illuminate\Support\Str;

$string = Str::of('    laravel    framework    ')->squish();

// laravel framework
```

<a id="method-fluent-str-start"></a>
#### `start` {.collection-method}

O método `start` adiciona uma única instância do valor fornecido a uma string se ela ainda não começar com esse valor:

```php
use Illuminate\Support\Str;

$adjusted = Str::of('this/string')->start('/');

// /this/string

$adjusted = Str::of('/this/string')->start('/');

// /this/string
```

<a id="method-fluent-str-starts-with"></a>
#### `startsWith` {.collection-method}

O método `startsWith` determina se a string fornecida começa com o valor fornecido:

```php
use Illuminate\Support\Str;

$result = Str::of('This is my name')->startsWith('This');

// true
```

Você também pode passar um array de valores para determinar se a string fornecida começa com algum dos valores do array:

```php
use Illuminate\Support\Str;

$result = Str::of('This is my name')->startsWith(['This', 'That']);

// true
```

<a id="method-fluent-str-strip-tags"></a>
#### `stripTags` {.collection-method}

O método `stripTags` remove todas as tags HTML e PHP de uma string:

```php
use Illuminate\Support\Str;

$result = Str::of('<a href="https://laravel.com">Taylor <b>Otwell</b></a>')->stripTags();

// Taylor Otwell

$result = Str::of('<a href="https://laravel.com">Taylor <b>Otwell</b></a>')->stripTags('<b>');

// Taylor <b>Otwell</b>
```

<a id="method-fluent-str-studly"></a>
#### `studly` {.collection-method}

O método `studly` converte a string fornecida para `StudlyCase`:

```php
use Illuminate\Support\Str;

$converted = Str::of('foo_bar')->studly();

// FooBar
```

<a id="method-fluent-str-substr"></a>
#### `substr` {.collection-method}

O método `substr` retorna a porção da string especificada pelos parâmetros de início e comprimento fornecidos:

```php
use Illuminate\Support\Str;

$string = Str::of('Laravel Framework')->substr(8);

// Framework

$string = Str::of('Laravel Framework')->substr(8, 5);

// Frame
```

<a id="method-fluent-str-substrreplace"></a>
#### `substrReplace` {.collection-method}

O método `substrReplace` substitui texto dentro de uma porção de uma string, começando na posição especificada pelo segundo argumento e substituindo o número de caracteres especificado pelo terceiro argumento. Passar `0` para o terceiro argumento do método inserirá a string na posição especificada sem substituir nenhum dos caracteres existentes na string:

```php
use Illuminate\Support\Str;

$string = Str::of('1300')->substrReplace(':', 2);

// 13:

$string = Str::of('The Framework')->substrReplace(' Laravel', 3, 0);

// The Laravel Framework
```

<a id="method-fluent-str-swap"></a>
#### `swap` {.collection-method}

O método `swap` substitui vários valores na string usando a função `strtr` do PHP:

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

O método `take` retorna um número especificado de caracteres a partir do início da string:

```php
use Illuminate\Support\Str;

$taken = Str::of('Build something amazing!')->take(5);

// Build
```

<a id="method-fluent-str-tap"></a>
#### `tap` {.collection-method}

O método `tap` passa a string para a closure fornecida, permitindo que você examine e interaja com a string sem afetar a própria string. A string original é retornada pelo método `tap` independentemente do que for retornado pela closure:

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

O método `test` determina se uma string corresponde ao padrão de expressão regular fornecido:

```php
use Illuminate\Support\Str;

$result = Str::of('Laravel Framework')->test('/Laravel/');

// true
```

<a id="method-fluent-str-title"></a>
#### `title` {.collection-method}

O método `title` converte a string fornecida para `Title Case`:

```php
use Illuminate\Support\Str;

$converted = Str::of('a nice title uses the correct case')->title();

// A Nice Title Uses The Correct Case
```

<a id="method-fluent-str-to-base64"></a>
#### `toBase64` {.collection-method}

O método `toBase64` converte a string fornecida para Base64:

```php
use Illuminate\Support\Str;

$base64 = Str::of('Laravel')->toBase64();

// TGFyYXZlbA==
```

<a id="method-fluent-str-to-html-string"></a>
#### `toHtmlString` {.collection-method}

O método `toHtmlString` converte a string fornecida em uma instância de `Illuminate\Support\HtmlString`, que não será escapada quando renderizada em templates Blade:

```php
use Illuminate\Support\Str;

$htmlString = Str::of('Nuno Maduro')->toHtmlString();
```

<a id="method-fluent-str-to-uri"></a>
#### `toUri` {.collection-method}

O método `toUri` converte a string fornecida em uma instância de [Illuminate\Support\Uri](/pt-br/helpers/#uri):

```php
use Illuminate\Support\Str;

$uri = Str::of('https://example.com')->toUri();
```

<a id="method-fluent-str-transliterate"></a>
#### `transliterate` {.collection-method}

O método `transliterate` tentará converter uma string fornecida em sua representação ASCII mais próxima:

```php
use Illuminate\Support\Str;

$email = Str::of('ⓣⓔⓢⓣ@ⓛⓐⓡⓐⓥⓔⓛ.ⓒⓞⓜ')->transliterate();

// 'test@laravel.com'
```

<a id="method-fluent-str-trim"></a>
#### `trim` {.collection-method}

O método `trim` remove espaços da string fornecida. Diferentemente da função nativa `trim` do PHP, o método `trim` do Laravel também remove caracteres de espaço em branco unicode:

```php
use Illuminate\Support\Str;

$string = Str::of('  Laravel  ')->trim();

// 'Laravel'

$string = Str::of('/Laravel/')->trim('/');

// 'Laravel'
```

<a id="method-fluent-str-ltrim"></a>
#### `ltrim` {.collection-method}

O método `ltrim` remove espaços do lado esquerdo da string. Diferentemente da função nativa `ltrim` do PHP, o método `ltrim` do Laravel também remove caracteres de espaço em branco unicode:

```php
use Illuminate\Support\Str;

$string = Str::of('  Laravel  ')->ltrim();

// 'Laravel  '

$string = Str::of('/Laravel/')->ltrim('/');

// 'Laravel/'
```

<a id="method-fluent-str-rtrim"></a>
#### `rtrim` {.collection-method}

O método `rtrim` remove espaços do lado direito da string fornecida. Diferentemente da função nativa `rtrim` do PHP, o método `rtrim` do Laravel também remove caracteres de espaço em branco unicode:

```php
use Illuminate\Support\Str;

$string = Str::of('  Laravel  ')->rtrim();

// '  Laravel'

$string = Str::of('/Laravel/')->rtrim('/');

// '/Laravel'
```

<a id="method-fluent-str-ucfirst"></a>
#### `ucfirst` {.collection-method}

O método `ucfirst` retorna a string fornecida com o primeiro caractere em maiúscula:

```php
use Illuminate\Support\Str;

$string = Str::of('foo bar')->ucfirst();

// Foo bar
```

<a id="method-fluent-str-ucsplit"></a>
#### `ucsplit` {.collection-method}

O método `ucsplit` divide a string fornecida em uma collection por caracteres maiúsculos:

```php
use Illuminate\Support\Str;

$string = Str::of('Foo Bar')->ucsplit();

// collect(['Foo ', 'Bar'])
```

<a id="method-fluent-str-ucwords"></a>
#### `ucwords` {.collection-method}

O método `ucwords` converte o primeiro caractere de cada palavra na string fornecida para maiúscula:

```php
use Illuminate\Support\Str;

$string = Str::of('laravel framework')->ucwords();

// Laravel Framework
```

<a id="method-fluent-str-unwrap"></a>
#### `unwrap` {.collection-method}

O método `unwrap` remove as strings especificadas do início e do final de uma string fornecida:

```php
use Illuminate\Support\Str;

Str::of('-Laravel-')->unwrap('-');

// Laravel

Str::of('{framework: "Laravel"}')->unwrap('{', '}');

// framework: "Laravel"
```

<a id="method-fluent-str-upper"></a>
#### `upper` {.collection-method}

O método `upper` converte a string fornecida para maiúsculas:

```php
use Illuminate\Support\Str;

$adjusted = Str::of('laravel')->upper();

// LARAVEL
```

<a id="method-fluent-str-when"></a>
#### `when` {.collection-method}

O método `when` invoca a closure fornecida se uma condição fornecida for `true`. A closure receberá a instância de fluent string:

```php
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('Taylor')
    ->when(true, function (Stringable $string) {
        return $string->append(' Otwell');
    });

// 'Taylor Otwell'
```

Se necessário, você pode passar outra closure como terceiro parâmetro ao método `when`. Esta closure será executada se o parâmetro de condição for avaliado como `false`.

<a id="method-fluent-str-when-contains"></a>
#### `whenContains` {.collection-method}

O método `whenContains` invoca a closure fornecida se a string contiver o valor fornecido. A closure receberá a instância de fluent string:

```php
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('tony stark')
    ->whenContains('tony', function (Stringable $string) {
        return $string->title();
    });

// 'Tony Stark'
```

Se necessário, você pode passar outra closure como terceiro parâmetro. A closure será invocada se a string não contiver o valor fornecido.

Você também pode passar um array de valores para determinar se a string fornecida contém algum dos valores do array:

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

O método `whenContainsAll` invoca a closure fornecida se a string contiver todas as substrings fornecidas. A closure receberá a instância de fluent string:

```php
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('tony stark')
    ->whenContainsAll(['tony', 'stark'], function (Stringable $string) {
        return $string->title();
    });

// 'Tony Stark'
```

Se necessário, você pode passar outra closure como terceiro parâmetro. A closure será invocada se o parâmetro de condição for avaliado como `false`.

<a id="method-fluent-str-when-doesnt-end-with"></a>
#### `whenDoesntEndWith` {.collection-method}

O método `whenDoesntEndWith` invoca a closure fornecida se a string não terminar com a substring fornecida. A closure receberá a instância de fluent string:

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

O método `whenDoesntStartWith` invoca a closure fornecida se a string não começar com a substring fornecida. A closure receberá a instância de fluent string:

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

O método `whenEmpty` invoca a closure fornecida se a string estiver vazia. Se a closure retornar um valor, esse valor também será retornado pelo método `whenEmpty`. Se a closure não retornar um valor, a instância de fluent string será retornada:

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

O método `whenNotEmpty` invoca a closure fornecida se a string não estiver vazia. Se a closure retornar um valor, esse valor também será retornado pelo método `whenNotEmpty`. Se a closure não retornar um valor, a instância de fluent string será retornada:

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

O método `whenStartsWith` invoca a closure fornecida se a string começar com a substring fornecida. A closure receberá a instância de fluent string:

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

O método `whenEndsWith` invoca a closure fornecida se a string terminar com a substring fornecida. A closure receberá a instância de fluent string:

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

O método `whenExactly` invoca a closure fornecida se a string corresponder exatamente à string fornecida. A closure receberá a instância de fluent string:

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

O método `whenNotExactly` invoca a closure fornecida se a string não corresponder exatamente à string fornecida. A closure receberá a instância de fluent string:

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

O método `whenIs` invoca a closure fornecida se a string corresponder a um padrão fornecido. Asteriscos podem ser usados como valores curinga. A closure receberá a instância de fluent string:

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

O método `whenIsAscii` invoca a closure fornecida se a string for ASCII de 7 bits. A closure receberá a instância de fluent string:

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

O método `whenIsUlid` invoca a closure fornecida se a string for um ULID válido. A closure receberá a instância de fluent string:

```php
use Illuminate\Support\Str;

$string = Str::of('01gd6r360bp37zj17nxb55yv40')->whenIsUlid(function (Stringable $string) {
    return $string->substr(0, 8);
});

// '01gd6r36'
```

<a id="method-fluent-str-when-is-uuid"></a>
#### `whenIsUuid` {.collection-method}

O método `whenIsUuid` invoca a closure fornecida se a string for um UUID válido. A closure receberá a instância de fluent string:

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

O método `whenTest` invoca a closure fornecida se a string corresponder à expressão regular fornecida. A closure receberá a instância de fluent string:

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

O método `wordCount` retorna o número de palavras que uma string contém:

```php
use Illuminate\Support\Str;

Str::of('Hello, world!')->wordCount(); // 2
```

<a id="method-fluent-str-words"></a>
#### `words` {.collection-method}

O método `words` limita o número de palavras em uma string. Se necessário, você pode especificar uma string adicional que será acrescentada à string truncada:

```php
use Illuminate\Support\Str;

$string = Str::of('Perfectly balanced, as all things should be.')->words(3, ' >>>');

// Perfectly balanced, as >>>
```

<a id="method-fluent-str-wrap"></a>
#### `wrap` {.collection-method}

O método `wrap` envolve a string fornecida com uma string adicional ou par de strings:

```php
use Illuminate\Support\Str;

Str::of('Laravel')->wrap('"');

// "Laravel"

Str::of('is')->wrap(before: 'This ', after: ' Laravel!');

// This is Laravel!
```
