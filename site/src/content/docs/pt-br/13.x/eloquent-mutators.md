---
title: "Eloquent: Mutators & Casting"
---

- [Introdução](#introduction)
- [Accessors e Mutators](#accessors-and-mutators)
    - [Definindo um Accessor](#defining-an-accessor)
    - [Definindo um Mutator](#defining-a-mutator)
- [Casting de Atributos](#attribute-casting)
    - [Casting de Array e JSON](#array-and-json-casting)
    - [Casting de Vetor](#vector-casting)
    - [Casting Binário](#binary-casting)
    - [Casting de Data](#date-casting)
    - [Casting de Enum](#enum-casting)
    - [Casting Criptografado](#encrypted-casting)
    - [Casting em Tempo de Consulta](#query-time-casting)
- [Casts Personalizados](#custom-casts)
    - [Casting de Objetos de Valor](#value-object-casting)
    - [Serialização para Array / JSON](#array-json-serialization)
    - [Casting de Entrada (Inbound)](#inbound-casting)
    - [Parâmetros de Cast](#cast-parameters)
    - [Comparando Valores de Cast](#comparing-cast-values)
    - [Castables](#castables)

<a id="introduction"></a>
## Introdução

Accessors, mutators e casting de atributos permitem transformar os valores de atributos do Eloquent quando você os recupera ou define em instâncias de modelo. Por exemplo, você pode querer usar o [encrypter do Laravel](/pt-br/encryption/) para criptografar um valor enquanto ele está armazenado no banco de dados e, então, descriptografar automaticamente o atributo ao acessá-lo em um modelo Eloquent. Ou, você pode querer converter uma string JSON armazenada em seu banco de dados em um array quando ela for acessada através do seu modelo Eloquent.

<a id="accessors-and-mutators"></a>
## Accessors e Mutators

<a id="defining-an-accessor"></a>
### Definindo um Accessor

Um accessor transforma o valor de um atributo do Eloquent quando ele é acessado. Para definir um accessor, crie um método protected em seu modelo para representar o atributo acessível. Esse nome de método deve corresponder à representação em "camel case" do verdadeiro atributo subjacente do modelo / coluna do banco de dados, quando aplicável.

Neste exemplo, definiremos um accessor para o atributo `first_name`. O accessor será chamado automaticamente pelo Eloquent ao tentar recuperar o valor do atributo `first_name`. Todos os métodos de accessor / mutator de atributos devem declarar um type-hint de retorno `Illuminate\Database\Eloquent\Casts\Attribute`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * Get the user's first name.
     */
    protected function firstName(): Attribute
    {
        return Attribute::make(
            get: fn (string $value) => ucfirst($value),
        );
    }
}
```

Todos os métodos de accessor retornam uma instância de `Attribute` que define como o atributo será acessado e, opcionalmente, mutado. Neste exemplo, estamos apenas definindo como o atributo será acessado. Para isso, fornecemos o argumento `get` ao construtor da classe `Attribute`.

Como você pode ver, o valor original da coluna é passado ao accessor, permitindo que você manipule e retorne o valor. Para acessar o valor do accessor, basta acessar o atributo `first_name` em uma instância de modelo:

```php
use App\Models\User;

$user = User::find(1);

$firstName = $user->first_name;
```

> **Note:**
> Se você quiser que esses valores computados sejam adicionados às representações em array / JSON do seu modelo, [será necessário anexá-los](/pt-br/eloquent-serialization/#appending-values-to-json).

<a id="building-value-objects-from-multiple-attributes"></a>
#### Construindo Objetos de Valor a Partir de Múltiplos Atributos

Às vezes, seu accessor pode precisar transformar múltiplos atributos do modelo em um único "objeto de valor". Para isso, seu closure `get` pode aceitar um segundo argumento `$attributes`, que será fornecido automaticamente ao closure e conterá um array com todos os atributos atuais do modelo:

```php
use App\Support\Address;
use Illuminate\Database\Eloquent\Casts\Attribute;

/**
 * Interact with the user's address.
 */
protected function address(): Attribute
{
    return Attribute::make(
        get: fn (mixed $value, array $attributes) => new Address(
            $attributes['address_line_one'],
            $attributes['address_line_two'],
        ),
    );
}
```

<a id="accessor-caching"></a>
#### Cache de Accessor

Ao retornar objetos de valor a partir de accessors, quaisquer alterações feitas no objeto de valor serão automaticamente sincronizadas de volta ao modelo antes que ele seja salvo. Isso é possível porque o Eloquent retém as instâncias retornadas pelos accessors, de modo que possa retornar a mesma instância cada vez que o accessor for invocado:

```php
use App\Models\User;

$user = User::find(1);

$user->address->lineOne = 'Updated Address Line 1 Value';
$user->address->lineTwo = 'Updated Address Line 2 Value';

$user->save();
```

No entanto, às vezes você pode querer habilitar o cache para valores primitivos como strings e booleanos, particularmente se forem computacionalmente intensivos. Para isso, você pode invocar o método `shouldCache` ao definir seu accessor:

```php
protected function hash(): Attribute
{
    return Attribute::make(
        get: fn (string $value) => bcrypt(gzuncompress($value)),
    )->shouldCache();
}
```

Se você quiser desabilitar o comportamento de cache de objetos dos atributos, pode invocar o método `withoutObjectCaching` ao definir o atributo:

```php
/**
 * Interact with the user's address.
 */
protected function address(): Attribute
{
    return Attribute::make(
        get: fn (mixed $value, array $attributes) => new Address(
            $attributes['address_line_one'],
            $attributes['address_line_two'],
        ),
    )->withoutObjectCaching();
}
```

<a id="defining-a-mutator"></a>
### Definindo um Mutator

Um mutator transforma o valor de um atributo do Eloquent quando ele é definido. Para definir um mutator, você pode fornecer o argumento `set` ao definir seu atributo. Vamos definir um mutator para o atributo `first_name`. Esse mutator será chamado automaticamente quando tentarmos definir o valor do atributo `first_name` no modelo:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * Interact with the user's first name.
     */
    protected function firstName(): Attribute
    {
        return Attribute::make(
            get: fn (string $value) => ucfirst($value),
            set: fn (string $value) => strtolower($value),
        );
    }
}
```

O closure do mutator receberá o valor que está sendo definido no atributo, permitindo que você manipule o valor e retorne o valor manipulado. Para usar nosso mutator, basta definir o atributo `first_name` em um modelo Eloquent:

```php
use App\Models\User;

$user = User::find(1);

$user->first_name = 'Sally';
```

Neste exemplo, o callback `set` será chamado com o valor `Sally`. O mutator então aplicará a função `strtolower` ao nome e definirá o valor resultante no array interno `$attributes` do modelo.

<a id="mutating-multiple-attributes"></a>
#### Mutando Múltiplos Atributos

Às vezes, seu mutator pode precisar definir múltiplos atributos no modelo subjacente. Para isso, você pode retornar um array do closure `set`. Cada chave no array deve corresponder a um atributo subjacente / coluna do banco de dados associado ao modelo:

```php
use App\Support\Address;
use Illuminate\Database\Eloquent\Casts\Attribute;

/**
 * Interact with the user's address.
 */
protected function address(): Attribute
{
    return Attribute::make(
        get: fn (mixed $value, array $attributes) => new Address(
            $attributes['address_line_one'],
            $attributes['address_line_two'],
        ),
        set: fn (Address $value) => [
            'address_line_one' => $value->lineOne,
            'address_line_two' => $value->lineTwo,
        ],
    );
}
```

<a id="attribute-casting"></a>
## Casting de Atributos

O casting de atributos fornece funcionalidade semelhante aos accessors e mutators sem exigir que você defina quaisquer métodos adicionais em seu modelo. Em vez disso, o método `casts` do seu modelo fornece uma maneira conveniente de converter atributos em tipos de dados comuns.

O método `casts` deve retornar um array onde a chave é o nome do atributo que está sendo convertido e o valor é o tipo para o qual você deseja converter a coluna. Os tipos de cast suportados são:

<div class="content-list" markdown="1">

- `array`
- `AsFluent::class`
- `AsStringable::class`
- `AsUri::class`
- `AsVector::class`
- `boolean`
- `collection`
- `date`
- `datetime`
- `immutable_date`
- `immutable_datetime`
- <code>decimal:&lt;precision&gt;</code>
- `double`
- `encrypted`
- `encrypted:array`
- `encrypted:collection`
- `encrypted:object`
- `float`
- `hashed`
- `integer`
- `object`
- `real`
- `string`
- `timestamp`

</div>

Para demonstrar o casting de atributos, vamos converter o atributo `is_admin`, que é armazenado em nosso banco de dados como um inteiro (`0` ou `1`), para um valor booleano:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_admin' => 'boolean',
        ];
    }
}
```

Depois de definir o cast, o atributo `is_admin` sempre será convertido para booleano quando você o acessar, mesmo que o valor subjacente esteja armazenado no banco de dados como um inteiro:

```php
$user = App\Models\User::find(1);

if ($user->is_admin) {
    // ...
}
```

Se você precisar adicionar um novo cast temporário em tempo de execução, pode usar o método `mergeCasts`. Essas definições de cast serão adicionadas a quaisquer casts já definidos no modelo:

```php
$user->mergeCasts([
    'is_admin' => 'integer',
    'options' => 'object',
]);
```

> **Warning:**
> Atributos que são `null` não serão convertidos. Além disso, você nunca deve definir um cast (ou um atributo) que tenha o mesmo nome de um relacionamento, nem atribuir um cast à chave primária do modelo.

<a id="stringable-casting"></a>
#### Casting Stringable

Você pode usar a classe de cast `Illuminate\Database\Eloquent\Casts\AsStringable` para converter um atributo do modelo em um [objeto fluente Illuminate\Support\Stringable](/pt-br/strings/#fluent-strings-method-list):

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\AsStringable;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'directory' => AsStringable::class,
        ];
    }
}
```

<a id="array-and-json-casting"></a>
### Casting de Array e JSON

O cast `array` é particularmente útil ao trabalhar com colunas que são armazenadas como JSON serializado. Por exemplo, se seu banco de dados possui um campo do tipo `JSON` ou `TEXT` que contém JSON serializado, adicionar o cast `array` a esse atributo irá automaticamente desserializar o atributo em um array PHP quando você acessá-lo em seu modelo Eloquent:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'options' => 'array',
        ];
    }
}
```

Uma vez definido o cast, você pode acessar o atributo `options` e ele será automaticamente desserializado de JSON para um array PHP. Quando você definir o valor do atributo `options`, o array fornecido será automaticamente serializado de volta para JSON para armazenamento:

```php
use App\Models\User;

$user = User::find(1);

$options = $user->options;

$options['key'] = 'value';

$user->options = $options;

$user->save();
```

Para atualizar um único campo de um atributo JSON com uma sintaxe mais concisa, você pode [tornar o atributo mass assignable](/pt-br/eloquent/#mass-assignment-json-columns) e usar o operador `->` ao chamar o método `update`:

```php
$user = User::find(1);

$user->update(['options->key' => 'value']);
```

<a id="json-and-unicode"></a>
#### JSON e Unicode

Se você quiser armazenar um atributo array como JSON com caracteres Unicode sem escape, pode usar o cast `json:unicode`:

```php
/**
 * Get the attributes that should be cast.
 *
 * @return array<string, string>
 */
protected function casts(): array
{
    return [
        'options' => 'json:unicode',
    ];
}
```

<a id="array-object-and-collection-casting"></a>
#### Casting de Array Object e Collection

Embora o cast `array` padrão seja suficiente para muitas aplicações, ele possui algumas desvantagens. Como o cast `array` retorna um tipo primitivo, não é possível mutar um offset do array diretamente. Por exemplo, o código a seguir irá disparar um erro PHP:

```php
$user = User::find(1);

$user->options['key'] = $value;
```

Para resolver isso, o Laravel oferece um cast `AsArrayObject` que converte seu atributo JSON em uma classe [ArrayObject](https://www.php.net/manual/en/class.arrayobject.php). Esse recurso é implementado usando a implementação de [cast personalizado](#custom-casts) do Laravel, que permite ao Laravel armazenar em cache e transformar de forma inteligente o objeto mutado, de modo que offsets individuais possam ser modificados sem disparar um erro PHP. Para usar o cast `AsArrayObject`, basta atribuí-lo a um atributo:

```php
use Illuminate\Database\Eloquent\Casts\AsArrayObject;

/**
 * Get the attributes that should be cast.
 *
 * @return array<string, string>
 */
protected function casts(): array
{
    return [
        'options' => AsArrayObject::class,
    ];
}
```

Da mesma forma, o Laravel oferece um cast `AsCollection` que converte seu atributo JSON em uma instância de [Collection](/pt-br/collections/) do Laravel:

```php
use Illuminate\Database\Eloquent\Casts\AsCollection;

/**
 * Get the attributes that should be cast.
 *
 * @return array<string, string>
 */
protected function casts(): array
{
    return [
        'options' => AsCollection::class,
    ];
}
```

Por padrão, atribuir `null` a um atributo convertido com `AsArrayObject` ou `AsCollection` irá armazenar o valor JSON `null` no banco de dados. Se você quiser que valores `null` sejam armazenados como valores SQL `NULL` nativos, pode invocar o método `nullable` ao definir o cast:

```php
use Illuminate\Database\Eloquent\Casts\AsCollection;

/**
 * Get the attributes that should be cast.
 *
 * @return array<string, string>
 */
protected function casts(): array
{
    return [
        'options' => AsCollection::nullable(),
    ];
}
```

O método `nullable` também pode ser combinado com uma classe de collection personalizada:

```php
'options' => AsCollection::nullable(OptionCollection::class),
```

O cast `AsArrayObject` também fornece um método `nullable` com o mesmo comportamento.

Se você quiser que o cast `AsCollection` instancie uma classe de collection personalizada em vez da classe de collection base do Laravel, pode fornecer o nome da classe de collection como um argumento do cast:

```php
use App\Collections\OptionCollection;
use Illuminate\Database\Eloquent\Casts\AsCollection;

/**
 * Get the attributes that should be cast.
 *
 * @return array<string, string>
 */
protected function casts(): array
{
    return [
        'options' => AsCollection::using(OptionCollection::class),
    ];
}
```

O método `of` pode ser usado para indicar que os itens da collection devem ser mapeados em uma determinada classe através do [método mapInto](/pt-br/collections/#method-mapinto) da collection:

```php
use App\ValueObjects\Option;
use Illuminate\Database\Eloquent\Casts\AsCollection;

/**
 * Get the attributes that should be cast.
 *
 * @return array<string, string>
 */
protected function casts(): array
{
    return [
        'options' => AsCollection::of(Option::class)
    ];
}
```

Ao mapear collections para objetos, o objeto deve implementar as interfaces `Illuminate\Contracts\Support\Arrayable` e `JsonSerializable` para definir como suas instâncias devem ser serializadas no banco de dados como JSON:

```php
<?php

namespace App\ValueObjects;

use Illuminate\Contracts\Support\Arrayable;
use JsonSerializable;

class Option implements Arrayable, JsonSerializable
{
    public string $name;
    public mixed $value;
    public bool $isLocked;

    /**
     * Create a new Option instance.
     */
    public function __construct(array $data)
    {
        $this->name = $data['name'];
        $this->value = $data['value'];
        $this->isLocked = $data['is_locked'];
    }

    /**
     * Get the instance as an array.
     *
     * @return array{name: string, data: string, is_locked: bool}
     */
    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'value' => $this->value,
            'is_locked' => $this->isLocked,
        ];
    }

    /**
     * Specify the data which should be serialized to JSON.
     *
     * @return array{name: string, data: string, is_locked: bool}
     */
    public function jsonSerialize(): array
    {
        return $this->toArray();
    }
}
```

<a id="vector-casting"></a>
### Casting de Vetor

Você pode usar a classe de cast `Illuminate\Database\Eloquent\Casts\AsVector` para converter uma coluna de vetor do banco de dados de e para um array PHP:

```php
use Illuminate\Database\Eloquent\Casts\AsVector;

/**
 * Get the attributes that should be cast.
 *
 * @return array<string, string>
 */
protected function casts(): array
{
    return [
        'embedding' => AsVector::class,
    ];
}
```

Ao definir o atributo, o cast aceita um array PHP ou uma instância `Arrayable`, como uma collection do Laravel. Ao recuperar o atributo, o cast retorna um array de floats.

<a id="binary-casting"></a>
### Casting Binário

Se seu modelo Eloquent possui uma coluna `uuid` ou `ulid` do [tipo binário](/pt-br/migrations/#column-method-binary) além da coluna de ID auto-incremental do modelo, você pode usar o cast `AsBinary` para converter automaticamente o valor de e para sua representação binária:

```php
use Illuminate\Database\Eloquent\Casts\AsBinary;

/**
 * Get the attributes that should be cast.
 *
 * @return array<string, string>
 */
protected function casts(): array
{
    return [
        'uuid' => AsBinary::uuid(),
        'ulid' => AsBinary::ulid(),
    ];
}
```

Uma vez que o cast tenha sido definido no modelo, você pode definir o valor do atributo UUID / ULID como uma instância de objeto ou uma string. O Eloquent irá automaticamente converter o valor para sua representação binária. Ao recuperar o valor do atributo, você sempre receberá um valor de string em texto simples:

```php
use Illuminate\Support\Str;

$user->uuid = Str::uuid();

return $user->uuid;

// "6e8cdeed-2f32-40bd-b109-1e4405be2140"
```

<a id="date-casting"></a>
### Casting de Data

Por padrão, o Eloquent irá converter as colunas `created_at` e `updated_at` em instâncias de [Carbon](https://github.com/briannesbitt/Carbon), que estende a classe `DateTime` do PHP e fornece uma variedade de métodos úteis. Você pode converter atributos de data adicionais definindo casts de data adicionais no método `casts` do seu modelo. Normalmente, as datas devem ser convertidas usando os tipos de cast `datetime` ou `immutable_datetime`.

Ao definir um cast `date` ou `datetime`, você também pode especificar o formato da data. Esse formato será usado quando o [modelo for serializado para um array ou JSON](/pt-br/eloquent-serialization/):

```php
/**
 * Get the attributes that should be cast.
 *
 * @return array<string, string>
 */
protected function casts(): array
{
    return [
        'created_at' => 'datetime:Y-m-d',
    ];
}
```

Quando uma coluna é convertida como data, você pode definir o valor do atributo do modelo correspondente como um timestamp UNIX, string de data (`Y-m-d`), string de data-hora ou uma instância `DateTime` / `Carbon`. O valor da data será corretamente convertido e armazenado em seu banco de dados.

Você pode personalizar o formato de serialização padrão para todas as datas do seu modelo definindo um método `serializeDate` em seu modelo. Esse método não afeta como suas datas são formatadas para armazenamento no banco de dados:

```php
/**
 * Prepare a date for array / JSON serialization.
 */
protected function serializeDate(DateTimeInterface $date): string
{
    return $date->format('Y-m-d');
}
```

Para especificar o formato que deve ser usado ao armazenar as datas de um modelo em seu banco de dados, você deve usar o argumento `dateFormat` no atributo `Table` do seu modelo:

```php
use Illuminate\Database\Eloquent\Attributes\Table;

#[Table(dateFormat: 'U')]
class Flight extends Model
{
    // ...
}
```

<a id="date-casting-and-timezones"></a>
#### Casting de Data, Serialização e Fusos Horários

Por padrão, os casts `date` e `datetime` irão serializar as datas para uma string de data UTC ISO-8601 (`YYYY-MM-DDTHH:MM:SS.uuuuuuZ`), independentemente do fuso horário especificado na opção de configuração `timezone` da sua aplicação. Você é fortemente encorajado a sempre usar esse formato de serialização, bem como a armazenar as datas da sua aplicação no fuso horário UTC, não alterando a opção de configuração `timezone` da sua aplicação do seu valor padrão `UTC`. Usar consistentemente o fuso horário UTC em toda a sua aplicação fornecerá o nível máximo de interoperabilidade com outras bibliotecas de manipulação de datas escritas em PHP e JavaScript.

Se um formato personalizado for aplicado ao cast `date` ou `datetime`, como `datetime:Y-m-d H:i:s`, o fuso horário interno da instância Carbon será usado durante a serialização da data. Normalmente, esse será o fuso horário especificado na opção de configuração `timezone` da sua aplicação. No entanto, é importante notar que colunas `timestamp` como `created_at` e `updated_at` estão isentas desse comportamento e são sempre formatadas em UTC, independentemente da configuração de fuso horário da aplicação.

<a id="enum-casting"></a>
### Casting de Enum

O Eloquent também permite que você converta seus valores de atributos em [Enums](https://www.php.net/manual/en/language.enumerations.backed.php) do PHP. Para isso, você pode especificar o atributo e o enum que deseja converter no método `casts` do seu modelo:

```php
use App\Enums\ServerStatus;

/**
 * Get the attributes that should be cast.
 *
 * @return array<string, string>
 */
protected function casts(): array
{
    return [
        'status' => ServerStatus::class,
    ];
}
```

Uma vez que você tenha definido o cast em seu modelo, o atributo especificado será automaticamente convertido de e para um enum quando você interagir com o atributo:

```php
if ($server->status == ServerStatus::Provisioned) {
    $server->status = ServerStatus::Ready;

    $server->save();
}
```

<a id="casting-arrays-of-enums"></a>
#### Convertendo Arrays de Enums

Às vezes, você pode precisar que seu modelo armazene um array de valores de enum em uma única coluna. Para isso, você pode utilizar os casts `AsEnumArrayObject` ou `AsEnumCollection` fornecidos pelo Laravel:

```php
use App\Enums\ServerStatus;
use Illuminate\Database\Eloquent\Casts\AsEnumCollection;

/**
 * Get the attributes that should be cast.
 *
 * @return array<string, string>
 */
protected function casts(): array
{
    return [
        'statuses' => AsEnumCollection::of(ServerStatus::class),
    ];
}
```

<a id="encrypted-casting"></a>
### Casting Criptografado

O cast `encrypted` irá criptografar o valor do atributo de um modelo usando os recursos de [criptografia](/pt-br/encryption/) integrados do Laravel. Além disso, os casts `encrypted:array`, `encrypted:collection`, `encrypted:object`, `AsEncryptedArrayObject` e `AsEncryptedCollection` funcionam como seus equivalentes não criptografados; no entanto, como você pode esperar, o valor subjacente é criptografado quando armazenado em seu banco de dados.

Como o comprimento final do texto criptografado não é previsível e é maior que seu equivalente em texto simples, certifique-se de que a coluna de banco de dados associada seja do tipo `TEXT` ou maior. Além disso, como os valores são criptografados no banco de dados, você não poderá consultar ou pesquisar valores de atributos criptografados.

<a id="key-rotation"></a>
#### Rotação de Chave

Como você deve saber, o Laravel criptografa strings usando o valor de configuração `key` especificado no arquivo de configuração `app` da sua aplicação. Normalmente, esse valor corresponde ao valor da variável de ambiente `APP_KEY`. Se você precisar rotacionar a chave de criptografia da sua aplicação, pode [fazê-lo de forma graciosa](/pt-br/encryption/#gracefully-rotating-encryption-keys).

<a id="query-time-casting"></a>
### Casting em Tempo de Consulta

Às vezes, você pode precisar aplicar casts ao executar uma consulta, como ao selecionar um valor bruto de uma tabela. Por exemplo, considere a seguinte consulta:

```php
use App\Models\Post;
use App\Models\User;

$users = User::select([
    'users.*',
    'last_posted_at' => Post::selectRaw('MAX(created_at)')
        ->whereColumn('user_id', 'users.id')
])->get();
```

O atributo `last_posted_at` nos resultados dessa consulta será uma string simples. Seria maravilhoso se pudéssemos aplicar um cast `datetime` a esse atributo ao executar a consulta. Felizmente, podemos fazer isso usando o método `withCasts`:

```php
$users = User::select([
    'users.*',
    'last_posted_at' => Post::selectRaw('MAX(created_at)')
        ->whereColumn('user_id', 'users.id')
])->withCasts([
    'last_posted_at' => 'datetime'
])->get();
```

<a id="custom-casts"></a>
## Casts Personalizados

O Laravel possui uma variedade de tipos de cast integrados e úteis; no entanto, você pode ocasionalmente precisar definir seus próprios tipos de cast. Para criar um cast, execute o comando Artisan `make:cast`. A nova classe de cast será colocada em seu diretório `app/Casts`:

```shell
php artisan make:cast AsJson
```

Todas as classes de cast personalizadas implementam a interface `CastsAttributes`. Classes que implementam essa interface devem definir um método `get` e um `set`. O método `get` é responsável por transformar um valor bruto do banco de dados em um valor convertido, enquanto o método `set` deve transformar um valor convertido em um valor bruto que pode ser armazenado no banco de dados. Como exemplo, iremos reimplementar o tipo de cast `json` integrado como um tipo de cast personalizado:

```php
<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;

class AsJson implements CastsAttributes
{
    /**
     * Cast the given value.
     *
     * @param  array<string, mixed>  $attributes
     * @return array<string, mixed>
     */
    public function get(
        Model $model,
        string $key,
        mixed $value,
        array $attributes,
    ): array {
        return json_decode($value, true);
    }

    /**
     * Prepare the given value for storage.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function set(
        Model $model,
        string $key,
        mixed $value,
        array $attributes,
    ): string {
        return json_encode($value);
    }
}
```

Uma vez que você tenha definido um tipo de cast personalizado, pode anexá-lo a um atributo do modelo usando seu nome de classe:

```php
<?php

namespace App\Models;

use App\Casts\AsJson;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'options' => AsJson::class,
        ];
    }
}
```

<a id="value-object-casting"></a>
### Casting de Objetos de Valor

Você não está limitado a converter valores em tipos primitivos. Você também pode converter valores em objetos. Definir casts personalizados que convertem valores em objetos é muito semelhante a converter em tipos primitivos; no entanto, se seu objeto de valor abrange mais de uma coluna do banco de dados, o método `set` deve retornar um array de pares chave / valor que serão usados para definir valores brutos e armazenáveis no modelo. Se seu objeto de valor afeta apenas uma coluna, você deve simplesmente retornar o valor armazenável.

Como exemplo, definiremos uma classe de cast personalizada que converte múltiplos valores do modelo em um único objeto de valor `Address`. Assumiremos que o objeto de valor `Address` possui duas propriedades públicas: `lineOne` e `lineTwo`:

```php
<?php

namespace App\Casts;

use App\ValueObjects\Address;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;
use InvalidArgumentException;

class AsAddress implements CastsAttributes
{
    /**
     * Cast the given value.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function get(
        Model $model,
        string $key,
        mixed $value,
        array $attributes,
    ): Address {
        return new Address(
            $attributes['address_line_one'],
            $attributes['address_line_two']
        );
    }

    /**
     * Prepare the given value for storage.
     *
     * @param  array<string, mixed>  $attributes
     * @return array<string, string>
     */
    public function set(
        Model $model,
        string $key,
        mixed $value,
        array $attributes,
    ): array {
        if (! $value instanceof Address) {
            throw new InvalidArgumentException('The given value is not an Address instance.');
        }

        return [
            'address_line_one' => $value->lineOne,
            'address_line_two' => $value->lineTwo,
        ];
    }
}
```

Ao converter para objetos de valor, quaisquer alterações feitas no objeto de valor serão automaticamente sincronizadas de volta ao modelo antes que ele seja salvo:

```php
use App\Models\User;

$user = User::find(1);

$user->address->lineOne = 'Updated Address Value';

$user->save();
```

> **Note:**
> Se você planeja serializar seus modelos Eloquent que contêm objetos de valor para JSON ou arrays, deve implementar as interfaces `Illuminate\Contracts\Support\Arrayable` e `JsonSerializable` no objeto de valor.

<a id="value-object-caching"></a>
#### Cache de Objetos de Valor

Quando atributos que são convertidos em objetos de valor são resolvidos, eles são armazenados em cache pelo Eloquent. Portanto, a mesma instância de objeto será retornada se o atributo for acessado novamente.

Se você quiser desabilitar o comportamento de cache de objetos das classes de cast personalizadas, pode declarar uma propriedade pública `withoutObjectCaching` em sua classe de cast personalizada:

```php
class AsAddress implements CastsAttributes
{
    public bool $withoutObjectCaching = true;

    // ...
}
```

<a id="array-json-serialization"></a>
### Serialização para Array / JSON

Quando um modelo Eloquent é convertido em um array ou JSON usando os métodos `toArray` e `toJson`, seus objetos de valor de cast personalizados normalmente também serão serializados, desde que implementem as interfaces `Illuminate\Contracts\Support\Arrayable` e `JsonSerializable`. No entanto, ao usar objetos de valor fornecidos por bibliotecas de terceiros, você pode não ter a capacidade de adicionar essas interfaces ao objeto.

Portanto, você pode especificar que sua classe de cast personalizada será responsável por serializar o objeto de valor. Para isso, sua classe de cast personalizada deve implementar a interface `Illuminate\Contracts\Database\Eloquent\SerializesCastableAttributes`. Essa interface estabelece que sua classe deve conter um método `serialize` que deve retornar a forma serializada do seu objeto de valor:

```php
/**
 * Get the serialized representation of the value.
 *
 * @param  array<string, mixed>  $attributes
 */
public function serialize(
    Model $model,
    string $key,
    mixed $value,
    array $attributes,
): string {
    return (string) $value;
}
```

<a id="inbound-casting"></a>
### Casting de Entrada (Inbound)

Ocasionalmente, você pode precisar escrever uma classe de cast personalizada que transforme apenas valores que estão sendo definidos no modelo e não realize nenhuma operação quando os atributos estão sendo recuperados do modelo.

Casts personalizados somente de entrada devem implementar a interface `CastsInboundAttributes`, que exige apenas que um método `set` seja definido. O comando Artisan `make:cast` pode ser invocado com a opção `--inbound` para gerar uma classe de cast somente de entrada:

```shell
php artisan make:cast AsHash --inbound
```

Um exemplo clássico de um cast somente de entrada é um cast de "hashing". Por exemplo, podemos definir um cast que faz hash de valores de entrada através de um determinado algoritmo:

```php
<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsInboundAttributes;
use Illuminate\Database\Eloquent\Model;

class AsHash implements CastsInboundAttributes
{
    /**
     * Create a new cast class instance.
     */
    public function __construct(
        protected string|null $algorithm = null,
    ) {}

    /**
     * Prepare the given value for storage.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function set(
        Model $model,
        string $key,
        mixed $value,
        array $attributes,
    ): string {
        return is_null($this->algorithm)
            ? bcrypt($value)
            : hash($this->algorithm, $value);
    }
}
```

<a id="cast-parameters"></a>
### Parâmetros de Cast

Ao anexar um cast personalizado a um modelo, os parâmetros do cast podem ser especificados separando-os do nome da classe usando um caractere `:` e delimitando múltiplos parâmetros por vírgula. Os parâmetros serão passados ao construtor da classe de cast:

```php
/**
 * Get the attributes that should be cast.
 *
 * @return array<string, string>
 */
protected function casts(): array
{
    return [
        'secret' => AsHash::class.':sha256',
    ];
}
```

<a id="comparing-cast-values"></a>
### Comparando Valores de Cast

Se você quiser definir como dois valores de cast fornecidos devem ser comparados para determinar se foram alterados, sua classe de cast personalizada pode implementar a interface `Illuminate\Contracts\Database\Eloquent\ComparesCastableAttributes`. Isso permite que você tenha controle refinado sobre quais valores o Eloquent considera alterados e, portanto, salva no banco de dados quando um modelo é atualizado.

Essa interface estabelece que sua classe deve conter um método `compare` que deve retornar `true` se os valores fornecidos forem considerados iguais:

```php
/**
 * Determine if the given values are equal.
 *
 * @param  \Illuminate\Database\Eloquent\Model  $model
 * @param  string  $key
 * @param  mixed  $firstValue
 * @param  mixed  $secondValue
 * @return bool
 */
public function compare(
    Model $model,
    string $key,
    mixed $firstValue,
    mixed $secondValue
): bool {
    return $firstValue === $secondValue;
}
```

<a id="castables"></a>
### Castables

Você pode querer permitir que os objetos de valor da sua aplicação definam suas próprias classes de cast personalizadas. Em vez de anexar a classe de cast personalizada ao seu modelo, você pode alternativamente anexar uma classe de objeto de valor que implementa a interface `Illuminate\Contracts\Database\Eloquent\Castable`:

```php
use App\ValueObjects\Address;

protected function casts(): array
{
    return [
        'address' => Address::class,
    ];
}
```

Objetos que implementam a interface `Castable` devem definir um método `castUsing` que retorna o nome da classe do caster personalizado responsável por converter de e para a classe `Castable`:

```php
<?php

namespace App\ValueObjects;

use Illuminate\Contracts\Database\Eloquent\Castable;
use App\Casts\AsAddress;

class Address implements Castable
{
    /**
     * Get the name of the caster class to use when casting from / to this cast target.
     *
     * @param  array<string, mixed>  $arguments
     */
    public static function castUsing(array $arguments): string
    {
        return AsAddress::class;
    }
}
```

Ao usar classes `Castable`, você ainda pode fornecer argumentos na definição do método `casts`. Os argumentos serão passados ao método `castUsing`:

```php
use App\ValueObjects\Address;

protected function casts(): array
{
    return [
        'address' => Address::class.':argument',
    ];
}
```

<a id="anonymous-cast-classes"></a>
#### Castables e Classes de Cast Anônimas

Combinando "castables" com as [classes anônimas](https://www.php.net/manual/en/language.oop5.anonymous.php) do PHP, você pode definir um objeto de valor e sua lógica de casting como um único objeto castable. Para isso, retorne uma classe anônima do método `castUsing` do seu objeto de valor. A classe anônima deve implementar a interface `CastsAttributes`:

```php
<?php

namespace App\ValueObjects;

use Illuminate\Contracts\Database\Eloquent\Castable;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;

class Address implements Castable
{
    // ...

    /**
     * Get the caster class to use when casting from / to this cast target.
     *
     * @param  array<string, mixed>  $arguments
     */
    public static function castUsing(array $arguments): CastsAttributes
    {
        return new class implements CastsAttributes
        {
            public function get(
                Model $model,
                string $key,
                mixed $value,
                array $attributes,
            ): Address {
                return new Address(
                    $attributes['address_line_one'],
                    $attributes['address_line_two']
                );
            }

            public function set(
                Model $model,
                string $key,
                mixed $value,
                array $attributes,
            ): array {
                return [
                    'address_line_one' => $value->lineOne,
                    'address_line_two' => $value->lineTwo,
                ];
            }
        };
    }
}
```
