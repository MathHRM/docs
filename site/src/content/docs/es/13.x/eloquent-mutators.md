---
title: "Elocuente: mutadores y casting"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Accesorios y Mutadores](#accessors-and-mutators)
    - [Definición de un accesor](#defining-an-accessor)
    - [Definiendo un mutador](#defining-a-mutator)
- [Conversión de tipos de atributos](#attribute-casting)
    - [Conversión de tipos de array y JSON](#array-and-json-casting)
    - [Conversión de tipos vectoriales](#vector-casting)
    - [Conversión binaria](#binary-casting)
    - [Conversión de fechas](#date-casting)
    - [Conversión de enumeración](#enum-casting)
    - [Conversión cifrada](#encrypted-casting)
    - [Conversión en tiempo de consulta](#query-time-casting)
- [Conversiones personalizadas](#custom-casts)
    - [Conversión de objetos de valor](#value-object-casting)
    - [Matriz / Serialización JSON](#array-json-serialization)
    - [Conversión entrante](#inbound-casting)
    - [Parámetros de conversión](#cast-parameters)
    - [Comparación de valores convertidos](#comparing-cast-values)
    - [Castables](#castables)

<a id="introduction"></a>
## Introducción

Los descriptores de acceso, los mutadores y la conversión de atributos le permiten transformar los valores de los atributos de Eloquent cuando los recupera o configura en instancias del modelo. Por ejemplo, es posible que desee utilizar [Laravel encrypter](../encryption/) para cifrar un valor mientras está almacenado en la base de datos y luego descifrar automáticamente el atributo cuando acceda a él en un modelo Eloquent. O bien, es posible que desee convertir una cadena JSON que está almacenada en su base de datos en una matriz cuando se accede a ella a través de su modelo Eloquent.

<a id="accessors-and-mutators"></a>
## Accesores y mutadores

<a id="defining-an-accessor"></a>
### Definición de un descriptor de acceso

Un descriptor de acceso transforma un valor de atributo Eloquent cuando se accede a él. Para definir un descriptor de acceso, cree un método protegido en su modelo para representar el atributo accesible. El nombre de este método debe corresponder a la representación de "caso de camello" del verdadero atributo del modelo subyacente/columna de base de datos cuando corresponda.

En este ejemplo, definiremos un descriptor de acceso para el atributo `first_name`. Eloquent llamará automáticamente al descriptor de acceso cuando intente recuperar el valor del atributo `first_name`. Todos los métodos de acceso/mutador de atributos deben declarar una sugerencia de tipo de retorno de `Illuminate\Database\Eloquent\Casts\Attribute`:

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

Todos los métodos de acceso devuelven una instancia `Attribute` que define cómo se accederá al atributo y, opcionalmente, se mutará. En este ejemplo, solo definimos cómo se accederá al atributo. Para ello, proporcionamos el argumento `get` al constructor de la clase `Attribute`.

Como puede ver, el valor original de la columna se pasa al descriptor de acceso, lo que le permite manipular y devolver el valor. Para acceder al valor del descriptor de acceso, simplemente puede acceder al atributo `first_name` en una instancia de modelo:

```php
use App\Models\User;

$user = User::find(1);

$firstName = $user->first_name;
```

> **Nota:**
> Si desea que estos valores calculados se agreguen a las representaciones de matriz/JSON de su modelo, [deberá agregarlos](../eloquent-serialization/#appending-values-to-json).

<a id="building-value-objects-from-multiple-attributes"></a>
#### Creación de objetos de valor a partir de múltiples atributos

A veces, es posible que su descriptor de acceso necesite transformar varios atributos del modelo en un único "objeto de valor". Para hacerlo, su cierre `get` puede aceptar un segundo argumento de `$attributes`, que se proporcionará automáticamente al cierre y contendrá una matriz de todos los atributos actuales del modelo:

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
#### Almacenamiento en caché de accesores

Al devolver objetos de valor de los descriptores de acceso, cualquier cambio realizado en el objeto de valor se sincronizará automáticamente con el modelo antes de guardarlo. Esto es posible porque Eloquent retiene las instancias devueltas por los descriptores de acceso para poder devolver la misma instancia cada vez que se invoca el descriptor de acceso:

```php
use App\Models\User;

$user = User::find(1);

$user->address->lineOne = 'Updated Address Line 1 Value';
$user->address->lineTwo = 'Updated Address Line 2 Value';

$user->save();
```

Sin embargo, es posible que en ocasiones desee habilitar el almacenamiento en caché para valores primitivos como cadenas y valores booleanos, especialmente si requieren un uso intensivo de computación. Para lograr esto, puede invocar el método `shouldCache` al definir su acceso:

```php
protected function hash(): Attribute
{
    return Attribute::make(
        get: fn (string $value) => bcrypt(gzuncompress($value)),
    )->shouldCache();
}
```

Si desea deshabilitar el comportamiento de almacenamiento en caché de objetos de los atributos, puede invocar el método `withoutObjectCaching` al definir el atributo:

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
### Definiendo un mutador

Un mutador transforma un valor de atributo Eloquent cuando se establece. Para definir un mutador, puede proporcionar el argumento `set` al definir su atributo. Definamos un mutador para el atributo `first_name`. Este mutador se llamará automáticamente cuando intentemos establecer el valor del atributo `first_name` en el modelo:

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

El cierre del mutador recibirá el valor que se establece en el atributo, lo que le permitirá manipular el valor y devolver el valor manipulado. Para usar nuestro mutador, solo necesitamos configurar el atributo `first_name` en un modelo Eloquent:

```php
use App\Models\User;

$user = User::find(1);

$user->first_name = 'Sally';
```

En este ejemplo, se llamará a la devolución de llamada `set` con el valor `Sally`. Luego, el mutador aplicará la función `strtolower` al nombre y establecerá su valor resultante en la matriz interna `$attributes` del modelo.

<a id="mutating-multiple-attributes"></a>
#### Mutando múltiples atributos

A veces, es posible que su mutador necesite establecer múltiples atributos en el modelo subyacente. Para hacerlo, puede devolver una matriz del cierre `set`. Cada clave en la matriz debe corresponder con un atributo subyacente/columna de base de datos asociada con el modelo:

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
## Conversión de tipos de atributos

La conversión de atributos proporciona una funcionalidad similar a los accesores y mutadores sin necesidad de definir ningún método adicional en su modelo. En cambio, el método `casts` de su modelo proporciona una manera conveniente de convertir atributos a tipos de datos comunes.

El método `casts` debe devolver una matriz donde la clave es el nombre del atributo que se está convirtiendo y el valor es el tipo al que desea convertir la columna. Los tipos de conversión admitidos son:

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
- <code>decimal:<precisión></code>
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

Para demostrar la conversión de atributos, transformemos el atributo `is_admin`, que está almacenado en nuestra base de datos como un número entero (`0` o `1`) a un valor booleano:

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

Después de definir la conversión, el atributo `is_admin` siempre se convertirá en un valor booleano cuando acceda a él, incluso si el valor subyacente se almacena en la base de datos como un número entero:

```php
$user = App\Models\User::find(1);

if ($user->is_admin) {
    // ...
}
```

Si necesita agregar una nueva conversión temporal en tiempo de ejecución, puede usar el método `mergeCasts`. Estas definiciones de conversión se agregarán a cualquiera de las conversiones ya definidas en el modelo:

```php
$user->mergeCasts([
    'is_admin' => 'integer',
    'options' => 'object',
]);
```

> **Advertencia:**
> Los atributos que sean `null` no se convertirán. Además, nunca debe definir una conversión (o un atributo) que tenga el mismo nombre que una relación ni asignar una conversión a la clave principal del modelo.

<a id="stringable-casting"></a>
#### Conversión a Stringable

Puede utilizar la clase de conversión `Illuminate\Database\Eloquent\Casts\AsStringable` para convertir un atributo de modelo a un [objeto Illuminate\Support\Stringable fluido](../strings/#fluent-strings-method-list):

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
### Conversión de tipos de array y JSON

La conversión `array` es particularmente útil cuando se trabaja con columnas almacenadas como JSON serializado. Por ejemplo, si su base de datos tiene un tipo de campo `JSON` o `TEXT` que contiene JSON serializado, agregar la conversión `array` a ese atributo deserializará automáticamente el atributo a una matriz PHP cuando acceda a él en su modelo Eloquent:

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

Una vez definida la conversión, puede acceder al atributo `options` y se deserializará automáticamente desde JSON a una matriz PHP. Cuando establece el valor del atributo `options`, la matriz dada se serializará automáticamente nuevamente en JSON para su almacenamiento:

```php
use App\Models\User;

$user = User::find(1);

$options = $user->options;

$options['key'] = 'value';

$user->options = $options;

$user->save();
```

Para actualizar un solo campo de un atributo JSON con una sintaxis más concisa, puede [hacer que el atributo sea asignable en masa](../eloquent/#mass-assignment-json-columns) y usar el operador `->` al llamar al método `update`:

```php
$user = User::find(1);

$user->update(['options->key' => 'value']);
```

<a id="json-and-unicode"></a>
#### JSON y Unicode

Si desea almacenar un atributo de matriz como JSON con caracteres Unicode sin escape, puede utilizar la conversión `json:unicode`:

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
#### Conversión a ArrayObject y Collection

Aunque la conversión estándar `array` es suficiente para muchas aplicaciones, tiene algunas desventajas. Dado que la conversión `array` devuelve un tipo primitivo, no es posible mutar un desplazamiento de la matriz directamente. Por ejemplo, el siguiente código provocará un error de PHP:

```php
$user = User::find(1);

$user->options['key'] = $value;
```

Para resolver esto, Laravel ofrece una conversión `AsArrayObject` que convierte su atributo JSON en una clase [ArrayObject](https://www.php.net/manual/en/class.arrayobject.php). Esta característica se implementa utilizando la implementación [conversión personalizada](#custom-casts) de Laravel, que permite a Laravel almacenar en caché y transformar de manera inteligente el objeto mutado de modo que las compensaciones individuales puedan modificarse sin provocar un error de PHP. Para utilizar la conversión `AsArrayObject`, simplemente asígnela a un atributo:

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

De manera similar, Laravel ofrece una conversión `AsCollection` que convierte su atributo JSON a una instancia de Laravel [Collection](../collections/):

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

De forma predeterminada, asignar `null` a una conversión de atributo con `AsArrayObject` o `AsCollection` almacenará el valor JSON `null` en la base de datos. Si desea que los valores `null` se almacenen como valores SQL nativos `NULL`, puede invocar el método `nullable` al definir la conversión:

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

El método `nullable` también se puede combinar con una clase de colección personalizada:

```php
'options' => AsCollection::nullable(OptionCollection::class),
```

La conversión `AsArrayObject` también proporciona un método `nullable` con el mismo comportamiento.

Si desea que la conversión `AsCollection` cree una instancia de una clase de colección personalizada en lugar de la clase de colección base de Laravel, puede proporcionar el nombre de la clase de colección como argumento de conversión:

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

El método `of` se puede utilizar para indicar que los elementos de la colección deben asignarse a una clase determinada mediante el método [mapInto](../collections/#method-mapinto) de la colección:

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

Al asignar colecciones a objetos, el objeto debe implementar las interfaces `Illuminate\Contracts\Support\Arrayable` y `JsonSerializable` para definir cómo se deben serializar sus instancias en la base de datos como JSON:

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
### Conversión de tipos vectoriales

Puede utilizar la clase de conversión `Illuminate\Database\Eloquent\Casts\AsVector` para convertir una columna de vector de base de datos hacia y desde una matriz PHP:

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

Al configurar el atributo, la conversión acepta una matriz PHP o una instancia `Arrayable`, como una colección Laravel. Al recuperar el atributo, la conversión devuelve una matriz de flotadores.

<a id="binary-casting"></a>
### Conversión binaria

Si su modelo Eloquent tiene una columna [tipo binario](../migrations/#column-method-binary) `uuid` o `ulid` además de la columna ID de incremento automático de su modelo, puede usar la conversión `AsBinary` para convertir automáticamente el valor hacia y desde su representación binaria:

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

Una vez que se ha definido la conversión en el modelo, puede establecer el valor del atributo UUID/ULID en una instancia de objeto o una cadena. Eloquent convertirá automáticamente el valor a su representación binaria. Al recuperar el valor del atributo, siempre recibirá un valor de cadena de texto sin formato:

```php
use Illuminate\Support\Str;

$user->uuid = Str::uuid();

return $user->uuid;

// "6e8cdeed-2f32-40bd-b109-1e4405be2140"
```

<a id="date-casting"></a>
### Conversión de fechas

De forma predeterminada, Eloquent convertirá las columnas `created_at` y `updated_at` en instancias de [Carbon](https://github.com/briannesbitt/Carbon), que extiende la clase PHP `DateTime` y proporciona una variedad de métodos útiles. Puede emitir atributos de fecha adicionales definiendo conversiones de fecha adicionales dentro del método `casts` de su modelo. Normalmente, las fechas se deben convertir utilizando los tipos de conversión `datetime` o `immutable_datetime`.

Al definir una conversión `date` o `datetime`, también puede especificar el formato de la fecha. Este formato se utilizará cuando el [modelo se serialice en una matriz o JSON](../eloquent-serialization/):

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

Cuando una columna se convierte como una fecha, puede establecer el valor del atributo del modelo correspondiente en una marca de tiempo UNIX, una cadena de fecha (`Y-m-d`), una cadena de fecha y hora o una instancia `DateTime`/`Carbon`. El valor de la fecha se convertirá y almacenará correctamente en su base de datos.

Puede personalizar el formato de serialización predeterminado para todas las fechas de su modelo definiendo un método `serializeDate` en su modelo. Este método no afecta el formato de las fechas para su almacenamiento en la base de datos:

```php
/**
 * Prepare a date for array / JSON serialization.
 */
protected function serializeDate(DateTimeInterface $date): string
{
    return $date->format('Y-m-d');
}
```

Para especificar el formato que se debe usar al almacenar las fechas de un modelo dentro de su base de datos, debe usar el argumento `dateFormat` en el atributo `Table` de su modelo:

```php
use Illuminate\Database\Eloquent\Attributes\Table;

#[Table(dateFormat: 'U')]
class Flight extends Model
{
    // ...
}
```

<a id="date-casting-and-timezones"></a>
#### Conversión de fechas, serialización y zonas horarias

De forma predeterminada, las conversiones `date` y `datetime` serializarán las fechas en una cadena de fecha UTC ISO-8601 (`YYYY-MM-DDTHH:MM:SS.uuuuuuZ`), independientemente de la zona horaria especificada en la opción de configuración `timezone` de su aplicación. Le recomendamos encarecidamente que utilice siempre este formato de serialización, así como que almacene las fechas de su aplicación en la zona horaria UTC sin cambiar la opción de configuración `timezone` de su aplicación de su valor predeterminado `UTC`. El uso constante de la zona horaria UTC en toda su aplicación proporcionará el máximo nivel de interoperabilidad con otras bibliotecas de manipulación de fechas escritas en PHP y JavaScript.

Si se aplica un formato personalizado a la conversión `date` o `datetime`, como `datetime:Y-m-d H:i:s`, la zona horaria interna de la instancia de Carbon se usará durante la serialización de la fecha. Normalmente, esta será la zona horaria especificada en la opción de configuración `timezone` de su aplicación. Sin embargo, es importante tener en cuenta que las columnas `timestamp`, como `created_at` y `updated_at`, están exentas de este comportamiento y siempre están formateadas en UTC, independientemente de la configuración de zona horaria de la aplicación.

<a id="enum-casting"></a>
### Conversión de enumeración

Eloquent también te permite convertir los valores de tus atributos a PHP [Enums](https://www.php.net/manual/en/language.enumerations.backed.php). Para lograr esto, puede especificar el atributo y la enumeración que desea convertir en el método `casts` de su modelo:

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

Una vez que haya definido la conversión en su modelo, el atributo especificado se convertirá automáticamente hacia y desde una enumeración cuando interactúe con el atributo:

```php
if ($server->status == ServerStatus::Provisioned) {
    $server->status = ServerStatus::Ready;

    $server->save();
}
```

<a id="casting-arrays-of-enums"></a>
#### Conversión de matrices de enumeraciones

A veces es posible que necesite que su modelo almacene una serie de valores de enumeración dentro de una sola columna. Para lograr esto, puede utilizar las conversiones `AsEnumArrayObject` o `AsEnumCollection` proporcionadas por Laravel:

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
### Conversión cifrada

La conversión `encrypted` cifrará el valor del atributo de un modelo utilizando las funciones [encryption](../encryption/)] integradas de Laravel. Además, las versiones `encrypted:array`, `encrypted:collection`, `encrypted:object`, `AsEncryptedArrayObject` y `AsEncryptedCollection` funcionan como sus contrapartes no cifradas; sin embargo, como es de esperar, el valor subyacente se cifra cuando se almacena en su base de datos.

Como la longitud final del texto cifrado no es predecible y es más larga que su contraparte de texto sin formato, asegúrese de que la columna de la base de datos asociada sea del tipo `TEXT` o mayor. Además, dado que los valores están cifrados en la base de datos, no podrá consultar ni buscar valores de atributos cifrados.

<a id="key-rotation"></a>
#### Rotación de claves

Como sabrá, Laravel cifra cadenas utilizando el valor de configuración `key` especificado en el archivo de configuración `app` de su aplicación. Normalmente, este valor corresponde al valor de la variable de entorno `APP_KEY`. Si necesita rotar la clave de cifrado de su aplicación, puede [hacerlo elegantemente](../encryption/#gracefully-rotating-encryption-keys).

<a id="query-time-casting"></a>
### Conversión en tiempo de consulta

A veces es posible que necesite aplicar conversiones mientras ejecuta una consulta, como al seleccionar un valor sin procesar de una tabla. Por ejemplo, considere la siguiente consulta:

```php
use App\Models\Post;
use App\Models\User;

$users = User::select([
    'users.*',
    'last_posted_at' => Post::selectRaw('MAX(created_at)')
        ->whereColumn('user_id', 'users.id')
])->get();
```

El atributo `last_posted_at` en los resultados de esta consulta será una cadena simple. Sería maravilloso si pudiéramos aplicar una conversión `datetime` a este atributo al ejecutar la consulta. Afortunadamente, podemos lograr esto usando el método `withCasts`:

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
## Conversiones personalizadas

Laravel tiene una variedad de tipos de conversión útiles e integrados; sin embargo, es posible que en ocasiones necesites definir tus propios tipos de conversión. Para crear una conversión, ejecute el comando `make:cast` Artisan. La nueva clase de conversión se colocará en su directorio `app/Casts`:

```shell
php artisan make:cast AsJson
```

Todas las clases de conversión personalizadas implementan la interfaz `CastsAttributes`. Las clases que implementan esta interfaz deben definir un método `get` y `set`. El método `get` es responsable de transformar un valor sin procesar de la base de datos en un valor de conversión, mientras que el método `set` debe transformar un valor de conversión en un valor sin procesar que pueda almacenarse en la base de datos. Como ejemplo, volveremos a implementar el tipo de conversión integrado `json` como un tipo de conversión personalizado:

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

Una vez que haya definido un tipo de conversión personalizado, puede adjuntarlo a un atributo de modelo usando su nombre de clase:

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
### Conversión de objetos de valor

No está limitado a convertir valores a tipos primitivos. También puede convertir valores a objetos. Definir conversiones personalizadas que convierten valores a objetos es muy similar a convertir a tipos primitivos; sin embargo, si su objeto de valor abarca más de una columna de base de datos, el método `set` debe devolver una matriz de pares clave/valor que se utilizarán para establecer valores sin procesar y almacenables en el modelo. Si su objeto de valor solo afecta a una sola columna, simplemente debe devolver el valor almacenable.

Como ejemplo, definiremos una clase de conversión personalizada que convierte múltiples valores de modelo en un único objeto de valor `Address`. Supondremos que el objeto de valor `Address` tiene dos propiedades públicas: `lineOne` y `lineTwo`:

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

Al convertir objetos de valor, cualquier cambio realizado en el objeto de valor se sincronizará automáticamente con el modelo antes de guardarlo:

```php
use App\Models\User;

$user = User::find(1);

$user->address->lineOne = 'Updated Address Value';

$user->save();
```

> **Nota:**
> Si planea serializar sus modelos Eloquent que contienen objetos de valor en JSON o matrices, debe implementar las interfaces `Illuminate\Contracts\Support\Arrayable` y `JsonSerializable` en el objeto de valor.

<a id="value-object-caching"></a>
#### Almacenamiento en caché de objetos de valor

Cuando se resuelven los atributos que se convierten en objetos de valor, Eloquent los almacena en caché. Por lo tanto, se devolverá la misma instancia de objeto si se accede nuevamente al atributo.

Si desea deshabilitar el comportamiento de almacenamiento en caché de objetos de las clases de conversión personalizadas, puede declarar una propiedad pública `withoutObjectCaching` en su clase de conversión personalizada:

```php
class AsAddress implements CastsAttributes
{
    public bool $withoutObjectCaching = true;

    // ...
}
```

<a id="array-json-serialization"></a>
### Serialización de matriz/JSON

Cuando un modelo de Eloquent se convierte en una matriz o JSON usando los métodos `toArray` y `toJson`, sus objetos de valor de conversión personalizados generalmente se serializarán y siempre que implementen las interfaces `Illuminate\Contracts\Support\Arrayable` y `JsonSerializable`. Sin embargo, cuando utilice objetos de valor proporcionados por bibliotecas de terceros, es posible que no pueda agregar estas interfaces al objeto.

Por lo tanto, puede especificar que su clase de conversión personalizada será responsable de serializar el objeto de valor. Para hacerlo, su clase de conversión personalizada debe implementar la interfaz `Illuminate\Contracts\Database\Eloquent\SerializesCastableAttributes`. Esta interfaz indica que su clase debe contener un método `serialize` que debe devolver la forma serializada de su objeto de valor:

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
### Conversión entrante

En ocasiones, es posible que necesite escribir una clase de conversión personalizada que solo transforme los valores que se establecen en el modelo y no realice ninguna operación cuando se recuperan los atributos del modelo.

Las conversiones personalizadas solo entrantes deben implementar la interfaz `CastsInboundAttributes`, que solo requiere que se defina un método `set`. El comando `make:cast` Artisan se puede invocar con la opción `--inbound` para generar una clase de conversión solo entrante:

```shell
php artisan make:cast AsHash --inbound
```

Un ejemplo clásico de conversión únicamente entrante es una conversión "hash". Por ejemplo, podemos definir una conversión que codifica los valores entrantes mediante un algoritmo determinado:

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
### Parámetros de conversión

Al adjuntar una conversión personalizada a un modelo, los parámetros de conversión se pueden especificar separándolos del nombre de la clase mediante un carácter `:` y delimitando por comas varios parámetros. Los parámetros se pasarán al constructor de la clase de conversión:

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
### Comparación de valores convertidos

Si desea definir cómo se deben comparar dos valores de conversión determinados para determinar si se han modificado, su clase de conversión personalizada puede implementar la interfaz `Illuminate\Contracts\Database\Eloquent\ComparesCastableAttributes`. Esto le permite tener un control detallado sobre qué valores Eloquent considera modificados y, por lo tanto, los guarda en la base de datos cuando se actualiza un modelo.

Esta interfaz indica que su clase debe contener un método `compare` que debería devolver `true` si los valores dados se consideran iguales:

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

Es posible que desee permitir que los objetos de valor de su aplicación definan sus propias clases de conversión personalizadas. En lugar de adjuntar la clase de conversión personalizada a su modelo, también puede adjuntar una clase de objeto de valor que implemente la interfaz `Illuminate\Contracts\Database\Eloquent\Castable`:

```php
use App\ValueObjects\Address;

protected function casts(): array
{
    return [
        'address' => Address::class,
    ];
}
```

Los objetos que implementan la interfaz `Castable` deben definir un método `castUsing` que devuelva el nombre de la clase de conversión personalizada que es responsable de la conversión hacia y desde la clase `Castable`:

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

Cuando utilice clases `Castable`, aún puede proporcionar argumentos en la definición del método `casts`. Los argumentos se pasarán al método `castUsing`:

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
#### Castables y clases de conversión anónimas

Al combinar "castables" con [clases anónimas ](https://www.php.net/manual/en/language.oop5.anonymous.php) de PHP, puede definir un objeto de valor y su lógica de conversión como un único objeto que admite conversión. Para lograr esto, devuelva una clase anónima del método `castUsing` de su objeto de valor. La clase anónima debería implementar la interfaz `CastsAttributes`:

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
