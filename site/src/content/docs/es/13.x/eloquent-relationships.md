---
title: "Eloquent: Relaciones"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Definición de relaciones](#defining-relationships)
    - [Uno a uno / Tiene uno](#one-to-one)
    - [Uno a muchos / Tiene muchos](#one-to-many)
    - [Uno a muchos (inversa) / Pertenece a](#one-to-many-inverse)
    - [Tiene uno de muchos](#has-one-of-many)
    - [Tiene uno a través de otro modelo](#has-one-through)
    - [Tiene muchos a través de otro modelo](#has-many-through)
- [Relaciones con alcance](#scoped-relationships)
- [Relaciones de muchos a muchos](#many-to-many)
    - [Recuperación de columnas de la tabla intermedia](#retrieving-intermediate-table-columns)
    - [Filtrado de consultas mediante columnas de la tabla intermedia](#filtering-queries-via-intermediate-table-columns)
    - [Ordenación de consultas mediante columnas de la tabla intermedia](#ordering-queries-via-intermediate-table-columns)
    - [Definición de modelos personalizados de tabla intermedia](#defining-custom-intermediate-table-models)
        - [Hidratación automática de las relaciones del pivote](#automatically-hydrating-pivot-relationships)
- [Relaciones polimórficas](#polymorphic-relationships)
    - [Uno a uno (polimórfica)](#one-to-one-polymorphic-relations)
    - [Uno a muchos (polimórfica)](#one-to-many-polymorphic-relations)
    - [Uno de muchos](#one-of-many-polymorphic-relations)
    - [Muchos a muchos (polimórfica)](#many-to-many-polymorphic-relations)
    - [Tipos polimórficos personalizados](#custom-polymorphic-types)
- [Relaciones dinámicas](#dynamic-relationships)
- [Consulta de relaciones](#querying-relations)
    - [Métodos de relación frente a propiedades dinámicas](#relationship-methods-vs-dynamic-properties)
    - [Consulta de la existencia de relaciones](#querying-relationship-existence)
    - [Consulta de la ausencia de relaciones](#querying-relationship-absence)
    - [Consulta de relaciones de tipo morph to](#querying-morph-to-relationships)
- [Agregación de modelos relacionados](#aggregating-related-models)
    - [Recuento de modelos relacionados](#counting-related-models)
    - [Otras funciones de agregación](#other-aggregate-functions)
    - [Recuento de modelos relacionados en relaciones de tipo morph to](#counting-related-models-on-morph-to-relationships)
- [Carga anticipada](#eager-loading)
    - [Restricción de la carga anticipada](#constraining-eager-loads)
    - [Carga anticipada diferida](#lazy-eager-loading)
    - [Carga anticipada automática](#automatic-eager-loading)
    - [Prevención de la carga diferida](#preventing-lazy-loading)
- [Inserción y actualización de modelos relacionados](#inserting-and-updating-related-models)
    - [El método `save`](#the-save-method)
    - [El método `create`](#the-create-method)
    - [Relaciones de pertenencia](#updating-belongs-to-relationships)
    - [Relaciones de muchos a muchos](#updating-many-to-many-relationships)
- [Actualización de las marcas de tiempo de los modelos principales](#touching-parent-timestamps)

<a id="introduction"></a>
## Introducción

Las tablas de bases de datos suelen estar relacionadas entre sí. Por ejemplo, una entrada de blog puede tener muchos comentarios o un pedido puede estar relacionado con el usuario que lo realizó. Eloquent facilita la gestión y el trabajo con estas relaciones y admite una variedad de relaciones comunes:

<div class="content-list" markdown="1">

- [Uno a uno](#one-to-one)
- [Uno a muchos](#one-to-many)
- [Muchos a muchos](#many-to-many)
- [Tiene uno a través de otro modelo](#has-one-through)
- [Tiene muchos a través de otro modelo](#has-many-through)
- [Uno a uno (polimórfica)](#one-to-one-polymorphic-relations)
- [Uno a muchos (polimórfica)](#one-to-many-polymorphic-relations)
- [Muchos a muchos (polimórfica)](#many-to-many-polymorphic-relations)

</div>

<a id="defining-relationships"></a>
## Definición de relaciones

Las relaciones Eloquent se definen como métodos en tus clases de modelo Eloquent. Dado que las relaciones también sirven como potentes [constructores de consultas](../queries/), definir las relaciones como métodos proporciona poderosas capacidades de consulta y encadenamiento de métodos. Por ejemplo, podemos encadenar restricciones de consulta adicionales en esta relación `posts`:

```php
$user->posts()->where('active', 1)->get();
```

Pero, antes de profundizar demasiado en el uso de las relaciones, aprendamos cómo definir cada tipo de relación admitida por Eloquent.

<a id="one-to-one"></a>
### Uno a uno / Tiene uno

Una relación uno a uno es un tipo muy básico de relación de base de datos. Por ejemplo, un modelo `User` podría estar asociado con un modelo `Phone`. Para definir esta relación, colocaremos un método `phone` en el modelo `User`. El método `phone` debe llamar al método `hasOne` y devolver su resultado. El método `hasOne` está disponible para tu modelo a través de la clase base `Illuminate\Database\Eloquent\Model` del modelo:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class User extends Model
{
    /**
     * Obtener el teléfono asociado al usuario.
     */
    public function phone(): HasOne
    {
        return $this->hasOne(Phone::class);
    }
}
```

El primer argumento pasado al método `hasOne` es el nombre de la clase de modelo relacionada. Una vez definida la relación, podemos recuperar el registro relacionado utilizando las propiedades dinámicas de Eloquent. Las propiedades dinámicas te permiten acceder a métodos de relación como si fueran propiedades definidas en el modelo:

```php
$phone = User::find(1)->phone;
```

Eloquent determina la clave externa de la relación en función del nombre del modelo principal. En este caso, se supone automáticamente que el modelo `Phone` tiene una clave externa `user_id`. Si deseas anular esta convención, puedes pasar un segundo argumento al método `hasOne`:

```php
return $this->hasOne(Phone::class, 'foreign_key');
```

Además, Eloquent asume que la clave externa debe tener un valor que coincida con la columna de clave principal del modelo principal. En otras palabras, Eloquent buscará el valor de la columna `id` del usuario en la columna `user_id` del registro `Phone`. Si deseas que la relación utilice un valor de clave principal distinto de `id` o la clave principal de tu modelo, puedes pasar un tercer argumento al método `hasOne`:

```php
return $this->hasOne(Phone::class, 'foreign_key', 'local_key');
```

<a id="one-to-one-defining-the-inverse-of-the-relationship"></a>
#### Definición de la inversa de la relación

Así, podremos acceder al modelo `Phone` desde nuestro modelo `User`. A continuación, definamos una relación en el modelo `Phone` que nos permitirá acceder al usuario propietario del teléfono. Podemos definir la inversa de una relación `hasOne` usando el método `belongsTo`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Phone extends Model
{
    /**
     * Obtener el usuario propietario del teléfono.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
```

Al invocar el método `user`, Eloquent intentará encontrar un modelo `User` que tenga un `id` que coincida con la columna `user_id` en el modelo `Phone`.

Eloquent determina el nombre de la clave externa examinando el nombre del método de relación y añadiendo al nombre del método el sufijo `_id`. Entonces, en este caso, Eloquent supone que el modelo `Phone` tiene una columna `user_id`. Sin embargo, si la clave externa en el modelo `Phone` no es `user_id`, puedes pasar un nombre de clave personalizado como segundo argumento al método `belongsTo`:

```php
/**
 * Obtener el usuario propietario del teléfono.
 */
public function user(): BelongsTo
{
    return $this->belongsTo(User::class, 'foreign_key');
}
```

Si el modelo principal no usa `id` como clave principal, o deseas encontrar el modelo asociado usando una columna diferente, puedes pasar un tercer argumento al método `belongsTo` especificando la clave personalizada de la tabla principal:

```php
/**
 * Obtener el usuario propietario del teléfono.
 */
public function user(): BelongsTo
{
    return $this->belongsTo(User::class, 'foreign_key', 'owner_key');
}
```

<a id="one-to-many"></a>
### Uno a muchos / Tiene muchos

Una relación de uno a muchos se utiliza para definir relaciones en las que un único modelo es el padre de uno o más modelos secundarios. Por ejemplo, una publicación de blog puede tener una cantidad infinita de comentarios. Como todas las demás relaciones de Eloquent, las relaciones de uno a muchos se definen definiendo un método en tu modelo de Eloquent:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Post extends Model
{
    /**
     * Obtener los comentarios de la entrada de blog.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }
}
```

Recuerda, Eloquent determinará automáticamente la columna de clave externa adecuada para el modelo `Comment`. Por convención, Eloquent tomará el nombre de "snake case" del modelo principal y le agregará el sufijo `_id`. Entonces, en este ejemplo, Eloquent asumirá que la columna de clave externa en el modelo `Comment` es `post_id`.

Una vez definido el método de relación, podremos acceder a la [colección](../eloquent-collections/) de comentarios relacionados accediendo a la propiedad `comments`. Recuerda, dado que Eloquent proporciona "propiedades de relación dinámica", podemos acceder a los métodos de relación como si estuvieran definidos como propiedades en el modelo:

```php
use App\Models\Post;

$comments = Post::find(1)->comments;

foreach ($comments as $comment) {
    // ...
}
```

Dado que todas las relaciones también sirven como constructores de consultas, puedes agregar más restricciones a la consulta de relación llamando al método `comments` y continuando encadenando condiciones en la consulta:

```php
$comment = Post::find(1)->comments()
    ->where('title', 'foo')
    ->first();
```

Al igual que el método `hasOne`, también puedes anular las claves locales y externas pasando argumentos adicionales al método `hasMany`:

```php
return $this->hasMany(Comment::class, 'foreign_key');

return $this->hasMany(Comment::class, 'foreign_key', 'local_key');
```

<a id="automatically-hydrating-parent-models-on-children"></a>
#### Hidratación automática de modelos principales en los secundarios

Incluso cuando se utiliza la carga anticipada de Eloquent, pueden surgir problemas de consulta "N + 1" si intentas acceder al modelo principal desde un modelo secundario mientras recorres los modelos secundarios:

```php
$posts = Post::with('comments')->get();

foreach ($posts as $post) {
    foreach ($post->comments as $comment) {
        echo $comment->post->title;
    }
}
```

En el ejemplo anterior, se introdujo un problema de consulta "N + 1" porque, aunque los comentarios se cargaron de forma anticipada para cada modelo `Post`, Eloquent no hidrata automáticamente el `Post` principal en cada modelo secundario `Comment`.

Si deseas que Eloquent hidrate automáticamente los modelos principales en sus modelos secundarios, puedes invocar el método `chaperone` al definir una relación `hasMany`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Post extends Model
{
    /**
     * Obtener los comentarios de la entrada de blog.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class)->chaperone();
    }
}
```

O, si deseas optar por la hidratación automática del modelo principal en tiempo de ejecución, puedes invocar el modelo `chaperone` al cargar la relación de forma anticipada:

```php
use App\Models\Post;

$posts = Post::with([
    'comments' => fn ($comments) => $comments->chaperone(),
])->get();
```

<a id="one-to-many-inverse"></a>
### Uno a muchos (inversa) / Pertenece a

Ahora que podemos acceder a todos los comentarios de una publicación, definamos una relación para permitir que un comentario acceda a su publicación principal. Para definir la inversa de una relación `hasMany`, define un método de relación en el modelo secundario que llame al método `belongsTo`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Comment extends Model
{
    /**
     * Obtener la publicación a la que pertenece el comentario.
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }
}
```

Una vez definida la relación, podemos recuperar la publicación principal de un comentario accediendo a la "propiedad de relación dinámica" `post`:

```php
use App\Models\Comment;

$comment = Comment::find(1);

return $comment->post->title;
```

En el ejemplo anterior, Eloquent intentará encontrar un modelo `Post` que tenga un `id` que coincida con la columna `post_id` en el modelo `Comment`.

Eloquent determina el nombre de clave externa predeterminado examinando el nombre del método de relación y añadiendo al nombre del método el sufijo `_` seguido del nombre de la columna de clave principal del modelo principal. Entonces, en este ejemplo, Eloquent asumirá que la clave externa del modelo `Post` en la tabla `comments` es `post_id`.

Sin embargo, si la clave externa de tu relación no sigue estas convenciones, puedes pasar un nombre de clave externa personalizado como segundo argumento del método `belongsTo`:

```php
/**
 * Obtener la publicación a la que pertenece el comentario.
 */
public function post(): BelongsTo
{
    return $this->belongsTo(Post::class, 'foreign_key');
}
```

Si tu modelo principal no usa `id` como clave principal, o deseas encontrar el modelo asociado usando una columna diferente, puedes pasar un tercer argumento al método `belongsTo` especificando la clave personalizada de tu tabla principal:

```php
/**
 * Obtener la publicación a la que pertenece el comentario.
 */
public function post(): BelongsTo
{
    return $this->belongsTo(Post::class, 'foreign_key', 'owner_key');
}
```

<a id="default-models"></a>
#### Modelos predeterminados

Las relaciones `belongsTo`, `hasOne`, `hasOneThrough` y `morphOne` te permiten definir un modelo predeterminado que se devolverá si la relación dada es `null`. Este patrón a menudo se conoce como [patrón de objeto nulo](https://en.wikipedia.org/wiki/Null_Object_pattern) y puede ayudar a eliminar comprobaciones condicionales en tu código. En el siguiente ejemplo, la relación `user` devolverá un modelo `App\Models\User` vacío si no hay ningún usuario asociado al modelo `Post`:

```php
/**
 * Obtener el autor de la publicación.
 */
public function user(): BelongsTo
{
    return $this->belongsTo(User::class)->withDefault();
}
```

Para completar el modelo predeterminado con atributos, puedes pasar un array o una función anónima al método `withDefault`:

```php
/**
 * Obtener el autor de la publicación.
 */
public function user(): BelongsTo
{
    return $this->belongsTo(User::class)->withDefault([
        'name' => 'Guest Author',
    ]);
}

/**
 * Obtener el autor de la publicación.
 */
public function user(): BelongsTo
{
    return $this->belongsTo(User::class)->withDefault(function (User $user, Post $post) {
        $user->name = 'Guest Author';
    });
}
```

<a id="querying-belongs-to-relationships"></a>
#### Consulta de relaciones de pertenencia

Al consultar los hijos de una relación "pertenece a", puedes crear manualmente la cláusula `where` para recuperar los modelos Eloquent correspondientes:

```php
use App\Models\Post;

$posts = Post::where('user_id', $user->id)->get();
```

Sin embargo, puede que te resulte más conveniente utilizar el método `whereBelongsTo`, que determinará automáticamente la relación adecuada y la clave externa para el modelo determinado:

```php
$posts = Post::whereBelongsTo($user)->get();
```

También puedes proporcionar una instancia de [colección](../eloquent-collections/) al método `whereBelongsTo`. Al hacerlo, Laravel recuperará modelos que pertenecen a cualquiera de los modelos principales dentro de la colección:

```php
$users = User::where('vip', true)->get();

$posts = Post::whereBelongsTo($users)->get();
```

De forma predeterminada, Laravel determinará la relación asociada con el modelo dado en función del nombre de clase del modelo; sin embargo, puedes especificar el nombre de la relación manualmente proporcionándolo como segundo argumento del método `whereBelongsTo`:

```php
$posts = Post::whereBelongsTo($user, 'author')->get();
```

<a id="has-one-of-many"></a>
### Tiene uno de muchos

A veces, un modelo puede tener muchos modelos relacionados, pero deseas recuperar fácilmente el modelo relacionado "más reciente" o el "más antiguo" de la relación. Por ejemplo, un modelo `User` puede estar relacionado con muchos modelos `Order`, pero deseas definir una forma conveniente de interactuar con el pedido más reciente que realizó el usuario. Puedes lograr esto utilizando el tipo de relación `hasOne` combinado con los métodos `ofMany`:

```php
/**
 * Obtener el pedido más reciente del usuario.
 */
public function latestOrder(): HasOne
{
    return $this->hasOne(Order::class)->latestOfMany();
}
```

Del mismo modo, puedes definir un método para recuperar el modelo relacionado "más antiguo" o primero de una relación:

```php
/**
 * Obtener el pedido más antiguo del usuario.
 */
public function oldestOrder(): HasOne
{
    return $this->hasOne(Order::class)->oldestOfMany();
}
```

De forma predeterminada, los métodos `latestOfMany` y `oldestOfMany` recuperarán el modelo relacionado más reciente o más antiguo según la clave principal del modelo, que debe poder ordenarse. Sin embargo, a veces es posible que desees recuperar un único modelo de una relación más amplia utilizando criterios de clasificación diferentes.

Por ejemplo, utilizando el método `ofMany`, puedes recuperar el pedido más caro del usuario. El método `ofMany` acepta la columna ordenable como primer argumento y qué función agregada (`min` o `max`) se aplicará al consultar el modelo relacionado:

```php
/**
 * Obtener el pedido más grande del usuario.
 */
public function largestOrder(): HasOne
{
    return $this->hasOne(Order::class)->ofMany('price', 'max');
}
```

> **Advertencia:**
> Debido a que PostgreSQL no admite la ejecución de la función `MAX` en columnas UUID, actualmente no es posible utilizar relaciones de una de muchas en combinación con columnas UUID de PostgreSQL.

<a id="converting-many-relationships-to-has-one-relationships"></a>
#### Conversión de relaciones de muchos a relaciones de uno

A menudo, al recuperar un único modelo utilizando los métodos `latestOfMany`, `oldestOfMany` o `ofMany`, ya tienes una relación "tiene muchos" definida para el mismo modelo. Para mayor comodidad, Laravel te permite convertir fácilmente esta relación en una relación "tiene uno" invocando el método `one` en la relación:

```php
/**
 * Obtener los pedidos del usuario.
 */
public function orders(): HasMany
{
    return $this->hasMany(Order::class);
}

/**
 * Obtener el pedido más grande del usuario.
 */
public function largestOrder(): HasOne
{
    return $this->orders()->one()->ofMany('price', 'max');
}
```

También puedes utilizar el método `one` para convertir relaciones `HasManyThrough` en relaciones `HasOneThrough`:

```php
public function latestDeployment(): HasOneThrough
{
    return $this->deployments()->one()->latestOfMany();
}
```

<a id="advanced-has-one-of-many-relationships"></a>
#### Relaciones avanzadas de uno de muchos

Es posible construir relaciones más avanzadas "tiene uno de muchos". Por ejemplo, un modelo `Product` puede tener muchos modelos `Price` asociados que se conservan en el sistema incluso después de que se publiquen nuevos precios. Además, es posible que se puedan publicar nuevos datos de precios del producto con antelación para que entren en vigor en una fecha futura a través de una columna `published_at`.

Entonces, en resumen, necesitamos recuperar los últimos precios publicados cuando la fecha de publicación no sea futura. Además, si dos precios tienen la misma fecha de publicación, preferiremos el precio con mayor ID. Para lograr esto, debemos pasar un array al método `ofMany` que contenga las columnas ordenables que determinan el último precio. Además, se proporcionará una función anónima como segundo argumento del método `ofMany`. Esta función anónima será responsable de agregar restricciones de fecha de publicación adicionales a la consulta de relación:

```php
/**
 * Obtener el precio actual del producto.
 */
public function currentPricing(): HasOne
{
    return $this->hasOne(Price::class)->ofMany([
        'published_at' => 'max',
        'id' => 'max',
    ], function (Builder $query) {
        $query->where('published_at', '<', now());
    });
}
```

<a id="has-one-through"></a>
### Tiene uno a través de otro modelo

La relación "tiene uno a través de otro modelo" define una relación uno a uno con otro modelo. Sin embargo, esta relación indica que el modelo que define la relación puede relacionarse con una instancia de otro modelo _a través_ de un tercer modelo.

Por ejemplo, en una aplicación de taller de reparación de vehículos, cada modelo `Mechanic` puede estar asociado con un modelo `Car`, y cada modelo `Car` puede estar asociado con un modelo `Owner`. Si bien el mecánico y el propietario no tienen una relación directa dentro de la base de datos, el mecánico puede acceder al propietario _a través_ del modelo `Car`. Veamos las tablas necesarias para definir esta relación:

```text
mechanics
    id - integer
    name - string

cars
    id - integer
    model - string
    mechanic_id - integer

owners
    id - integer
    name - string
    car_id - integer
```

Ahora que hemos examinado la estructura de la tabla para la relación, definamos la relación en el modelo `Mechanic`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;

class Mechanic extends Model
{
    /**
     * Obtener el propietario del automóvil.
     */
    public function carOwner(): HasOneThrough
    {
        return $this->hasOneThrough(Owner::class, Car::class);
    }
}
```

El primer argumento pasado al método `hasOneThrough` es el nombre del modelo final al que deseamos acceder, mientras que el segundo argumento es el nombre del modelo intermedio.

O, si las relaciones relevantes ya se han definido en todos los modelos involucrados en la relación, puedes definir mediante una sintaxis fluida una relación "tiene uno a través de otro modelo" invocando el método `through` y proporcionando los nombres de esas relaciones. Por ejemplo, si el modelo `Mechanic` tiene una relación `cars` y el modelo `Car` tiene una relación `owner`, puedes definir una relación "tiene uno a través de otro modelo" que conecte al mecánico y al propietario de la siguiente manera:

```php
// String based syntax...
return $this->through('cars')->has('owner');

// Dynamic syntax...
return $this->throughCars()->hasOwner();
```

<a id="has-one-through-key-conventions"></a>
#### Convenciones de claves

Se utilizarán las convenciones de clave externa típicas de Eloquent al realizar las consultas de la relación. Si deseas personalizar las claves de la relación, puedes pasarlas como tercer y cuarto argumento al método `hasOneThrough`. El tercer argumento es el nombre de la clave externa en el modelo intermedio. El cuarto argumento es el nombre de la clave externa en el modelo final. El quinto argumento es la clave local, mientras que el sexto argumento es la clave local del modelo intermedio:

```php
class Mechanic extends Model
{
    /**
     * Obtener el propietario del automóvil.
     */
    public function carOwner(): HasOneThrough
    {
        return $this->hasOneThrough(
            Owner::class,
            Car::class,
            'mechanic_id', // Foreign key on the cars table...
            'car_id', // Foreign key on the owners table...
            'id', // Local key on the mechanics table...
            'id' // Local key on the cars table...
        );
    }
}
```

O, como se analizó anteriormente, si las relaciones relevantes ya se han definido en todos los modelos involucrados en la relación, puedes definir mediante una sintaxis fluida una relación "tiene uno a través de otro modelo" invocando el método `through` y proporcionando los nombres de esas relaciones. Este enfoque ofrece la ventaja de reutilizar las convenciones de claves ya definidas en las relaciones existentes:

```php
// String based syntax...
return $this->through('cars')->has('owner');

// Dynamic syntax...
return $this->throughCars()->hasOwner();
```

<a id="has-many-through"></a>
### Tiene muchos a través de otro modelo

La relación "tiene muchos a través de otro modelo" proporciona una manera conveniente de acceder a relaciones distantes a través de una relación intermedia. Por ejemplo, supongamos que estamos creando una plataforma de despliegue como [Laravel Cloud](https://cloud.laravel.com). Un modelo `Application` podría acceder a muchos modelos `Deployment` a través de un modelo `Environment` intermedio. Con este ejemplo, podrías recopilar fácilmente todos los despliegues para una aplicación determinada. Veamos las tablas necesarias para definir esta relación:

```text
applications
    id - integer
    name - string

environments
    id - integer
    application_id - integer
    name - string

deployments
    id - integer
    environment_id - integer
    commit_hash - string
```

Ahora que hemos examinado la estructura de la tabla para la relación, definamos la relación en el modelo `Application`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Application extends Model
{
    /**
     * Obtener todos los deployments de la aplicación.
     */
    public function deployments(): HasManyThrough
    {
        return $this->hasManyThrough(Deployment::class, Environment::class);
    }
}
```

El primer argumento pasado al método `hasManyThrough` es el nombre del modelo final al que deseamos acceder, mientras que el segundo argumento es el nombre del modelo intermedio.

O, si las relaciones relevantes ya se han definido en todos los modelos involucrados en la relación, puedes definir mediante una sintaxis fluida una relación "tiene muchos a través de otro modelo" invocando el método `through` y proporcionando los nombres de esas relaciones. Por ejemplo, si el modelo `Application` tiene una relación `environments` y el modelo `Environment` tiene una relación `deployments`, puedes definir una relación "tiene muchos a través de otro modelo" que conecta la aplicación y los despliegues de esta manera:

```php
// String based syntax...
return $this->through('environments')->has('deployments');

// Dynamic syntax...
return $this->throughEnvironments()->hasDeployments();
```

Aunque la tabla del modelo `Deployment` no contiene una columna `application_id`, la relación `hasManyThrough` proporciona acceso a los despliegues de una aplicación a través de `$application->deployments`. Para recuperar estos modelos, Eloquent inspecciona la columna `application_id` en la tabla del modelo intermedio `Environment`. Después de encontrar los ID de entorno relevantes, se utilizan para consultar la tabla del modelo `Deployment`.

<a id="has-many-through-key-conventions"></a>
#### Convenciones de claves

Se utilizarán las convenciones de clave externa típicas de Eloquent al realizar las consultas de la relación. Si deseas personalizar las claves de la relación, puedes pasarlas como tercer y cuarto argumento al método `hasManyThrough`. El tercer argumento es el nombre de la clave externa en el modelo intermedio. El cuarto argumento es el nombre de la clave externa en el modelo final. El quinto argumento es la clave local, mientras que el sexto argumento es la clave local del modelo intermedio:

```php
class Application extends Model
{
    public function deployments(): HasManyThrough
    {
        return $this->hasManyThrough(
            Deployment::class,
            Environment::class,
            'application_id', // Foreign key on the environments table...
            'environment_id', // Foreign key on the deployments table...
            'id', // Local key on the applications table...
            'id' // Local key on the environments table...
        );
    }
}
```

O, como se analizó anteriormente, si las relaciones relevantes ya se han definido en todos los modelos involucrados en la relación, puedes definir mediante una sintaxis fluida una relación "tiene muchos a través de otro modelo" invocando el método `through` y proporcionando los nombres de esas relaciones. Este enfoque ofrece la ventaja de reutilizar las convenciones de claves ya definidas en las relaciones existentes:

```php
// String based syntax...
return $this->through('environments')->has('deployments');

// Dynamic syntax...
return $this->throughEnvironments()->hasDeployments();
```

<a id="scoped-relationships"></a>
### Relaciones con alcance

Es común agregar métodos adicionales a los modelos que restringen las relaciones. Por ejemplo, podrías agregar un método `featuredPosts` a un modelo `User` que restrinja la relación más amplia `posts` con una restricción `where` adicional:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Model
{
    /**
     * Obtener las publicaciones del usuario.
     */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class)->latest();
    }

    /**
     * Obtener las publicaciones destacadas del usuario.
     */
    public function featuredPosts(): HasMany
    {
        return $this->posts()->where('featured', true);
    }
}
```

Sin embargo, si intentas crear un modelo mediante el método `featuredPosts`, su atributo `featured` no se establecerá en `true`. Si deseas crear modelos mediante métodos de relación y también especificar atributos que deben agregarse a todos los modelos creados mediante esa relación, puedes utilizar el método `withAttributes` al crear la consulta de relación:

```php
/**
 * Obtener las publicaciones destacadas del usuario.
 */
public function featuredPosts(): HasMany
{
    return $this->posts()->withAttributes(['featured' => true]);
}
```

El método `withAttributes` agregará condiciones `where` a la consulta usando los atributos dados, y también agregará los atributos dados a cualquier modelo creado mediante el método de relación:

```php
$post = $user->featuredPosts()->create(['title' => 'Featured Post']);

$post->featured; // true
```

Para indicarle al método `withAttributes` que no agregue condiciones `where` a la consulta, puedes establecer el argumento `asConditions` en `false`:

```php
return $this->posts()->withAttributes(['featured' => true], asConditions: false);
```

<a id="many-to-many"></a>
## Relaciones de muchos a muchos

Las relaciones de muchos a muchos son un poco más complicadas que las relaciones `hasOne` y `hasMany`. Un ejemplo de una relación de muchos a muchos es un usuario que tiene muchos roles y esos roles también los comparten otros usuarios de la aplicación. Por ejemplo, a un usuario se le puede asignar el rol de "Autor" y "Editor"; sin embargo, esos roles también pueden asignarse a otros usuarios. Entonces, un usuario tiene muchos roles y un rol tiene muchos usuarios.

<a id="many-to-many-table-structure"></a>
#### Estructura de las tablas

Para definir esta relación, se necesitan tres tablas de base de datos: `users`, `roles` y `role_user`. La tabla `role_user` se deriva del orden alfabético de los nombres de modelos relacionados y contiene las columnas `user_id` y `role_id`. Esta tabla se utiliza como tabla intermedia que vincula los usuarios y los roles.

Recuerda, dado que un rol puede pertenecer a muchos usuarios, no podemos simplemente colocar una columna `user_id` en la tabla `roles`. Esto significaría que un rol sólo podría pertenecer a un único usuario. Para brindar soporte para roles asignados a múltiples usuarios, se necesita la tabla `role_user`. Podemos resumir la estructura de la tabla de relaciones así:

```text
users
    id - integer
    name - string

roles
    id - integer
    name - string

role_user
    user_id - integer
    role_id - integer
```

<a id="many-to-many-model-structure"></a>
#### Estructura de los modelos

Las relaciones de muchos a muchos se definen escribiendo un método que devuelve el resultado del método `belongsToMany`. El método `belongsToMany` lo proporciona la clase base `Illuminate\Database\Eloquent\Model` que utilizan todos los modelos Eloquent de tu aplicación. Por ejemplo, definamos un método `roles` en nuestro modelo `User`. El primer argumento pasado a este método es el nombre de la clase de modelo relacionada:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Model
{
    /**
     * The roles that belong to the user.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class);
    }
}
```

Una vez definida la relación, podrás acceder a los roles del usuario utilizando la propiedad de relación dinámica `roles`:

```php
use App\Models\User;

$user = User::find(1);

foreach ($user->roles as $role) {
    // ...
}
```

Dado que todas las relaciones también sirven como constructores de consultas, puedes agregar más restricciones a la consulta de relación llamando al método `roles` y continuando encadenando condiciones en la consulta:

```php
$roles = User::find(1)->roles()->orderBy('name')->get();
```

Para determinar el nombre de la tabla intermedia de la relación, Eloquent unirá los dos nombres de modelos relacionados en orden alfabético. Sin embargo, puedes anular esta convención. Puedes hacerlo pasando un segundo argumento al método `belongsToMany`:

```php
return $this->belongsToMany(Role::class, 'role_user');
```

Además de personalizar el nombre de la tabla intermedia, también puedes personalizar los nombres de las columnas de las claves de la tabla pasando argumentos adicionales al método `belongsToMany`. El tercer argumento es el nombre de la clave externa del modelo en el que estás definiendo la relación, mientras que el cuarto argumento es el nombre de la clave externa del modelo al que te estás uniendo:

```php
return $this->belongsToMany(Role::class, 'role_user', 'user_id', 'role_id');
```

<a id="many-to-many-defining-the-inverse-of-the-relationship"></a>
#### Definición de la inversa de la relación

Para definir la "inversa" de una relación de muchos a muchos, debes definir un método en el modelo relacionado que también devuelva el resultado del método `belongsToMany`. Para completar nuestro ejemplo de usuario/rol, definamos el método `users` en el modelo `Role`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    /**
     * The users that belong to the role.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }
}
```

Como puedes ver, la relación se define exactamente igual que su contraparte del modelo `User`, con la excepción de hacer referencia al modelo `App\Models\User`. Dado que estamos reutilizando el método `belongsToMany`, todas las opciones habituales de personalización de tablas y claves están disponibles al definir la "inversa" de las relaciones de muchos a muchos.

<a id="retrieving-intermediate-table-columns"></a>
### Recuperación de columnas de la tabla intermedia

Como ya has aprendido, trabajar con relaciones de muchos a muchos requiere la presencia de una tabla intermedia. Eloquent proporciona algunas formas muy útiles de interactuar con esta tabla. Por ejemplo, supongamos que nuestro modelo `User` tiene muchos modelos `Role` con los que está relacionado. Luego de acceder a esta relación, podremos acceder a la tabla intermedia usando el atributo `pivot` en los modelos:

```php
use App\Models\User;

$user = User::find(1);

foreach ($user->roles as $role) {
    echo $role->pivot->created_at;
}
```

Observa que a cada modelo `Role` que recuperamos se le asigna automáticamente un atributo `pivot`. Este atributo contiene un modelo que representa la tabla intermedia.

De forma predeterminada, solo las claves del modelo estarán presentes en el modelo `pivot`. Si tu tabla intermedia contiene atributos extra, debes especificarlos al definir la relación:

```php
return $this->belongsToMany(Role::class)->withPivot('active', 'created_by');
```

Si deseas que tu tabla intermedia tenga marcas de tiempo `created_at` y `updated_at` que Eloquent mantiene automáticamente, llama al método `withTimestamps` al definir la relación:

```php
return $this->belongsToMany(Role::class)->withTimestamps();
```

> **Advertencia:**
> Las tablas intermedias que utilizan marcas de tiempo mantenidas automáticamente por Eloquent deben tener columnas de marca de tiempo `created_at` y `updated_at`.

<a id="customizing-the-pivot-attribute-name"></a>
#### Personalización del nombre del atributo `pivot`

Como se señaló anteriormente, se puede acceder a los atributos de la tabla intermedia en los modelos a través del atributo `pivot`. Sin embargo, puedes personalizar el nombre de este atributo para reflejar mejor su propósito dentro de tu aplicación.

Por ejemplo, si tu aplicación contiene usuarios que pueden suscribirse a podcasts, es probable que tenga una relación de muchos a muchos entre los usuarios y los podcasts. Si este es el caso, es posible que desees cambiar el nombre del atributo de la tabla intermedia a `subscription` en lugar de `pivot`. Esto se puede hacer usando el método `as` al definir la relación:

```php
return $this->belongsToMany(Podcast::class)
    ->as('subscription')
    ->withTimestamps();
```

Una vez que se haya especificado el atributo de la tabla intermedia personalizada, podrás acceder a los datos de la tabla intermedia utilizando el nombre personalizado:

```php
$users = User::with('podcasts')->get();

foreach ($users->flatMap->podcasts as $podcast) {
    echo $podcast->subscription->created_at;
}
```

<a id="filtering-queries-via-intermediate-table-columns"></a>
### Filtrado de consultas mediante columnas de la tabla intermedia

También puedes filtrar los resultados devueltos por las consultas de relación `belongsToMany` utilizando los métodos `wherePivot`, `wherePivotIn`, `wherePivotNotIn`, `wherePivotBetween`, `wherePivotNotBetween`, `wherePivotNull` y `wherePivotNotNull` al definir la relación:

```php
return $this->belongsToMany(Role::class)
    ->wherePivot('approved', 1);

return $this->belongsToMany(Role::class)
    ->wherePivotIn('priority', [1, 2]);

return $this->belongsToMany(Role::class)
    ->wherePivotNotIn('priority', [1, 2]);

return $this->belongsToMany(Podcast::class)
    ->as('subscriptions')
    ->wherePivotBetween('created_at', ['2020-01-01 00:00:00', '2020-12-31 00:00:00']);

return $this->belongsToMany(Podcast::class)
    ->as('subscriptions')
    ->wherePivotNotBetween('created_at', ['2020-01-01 00:00:00', '2020-12-31 00:00:00']);

return $this->belongsToMany(Podcast::class)
    ->as('subscriptions')
    ->wherePivotNull('expired_at');

return $this->belongsToMany(Podcast::class)
    ->as('subscriptions')
    ->wherePivotNotNull('expired_at');
```

`wherePivot` agrega una restricción de cláusula where a la consulta, pero no agrega el valor especificado al crear nuevos modelos a través de la relación definida. Si necesitas consultar y crear relaciones con un valor específico de la tabla intermedia, puedes utilizar el método `withPivotValue`:

```php
return $this->belongsToMany(Role::class)
    ->withPivotValue('approved', 1);
```

<a id="ordering-queries-via-intermediate-table-columns"></a>
### Ordenación de consultas mediante columnas de la tabla intermedia

Puedes ordenar los resultados devueltos por las consultas de relación `belongsToMany` utilizando los métodos `orderByPivot` y `orderByPivotDesc`. En el siguiente ejemplo, recuperaremos todas las insignias más recientes del usuario:

```php
return $this->belongsToMany(Badge::class)
    ->where('rank', 'gold')
    ->orderByPivotDesc('created_at');
```

<a id="defining-custom-intermediate-table-models"></a>
### Definición de modelos personalizados de tabla intermedia

Si deseas definir un modelo personalizado para representar la tabla intermedia de tu relación de muchos a muchos, puedes llamar al método `using` al definir la relación. Los modelos de pivote personalizados te brindan la oportunidad de definir comportamientos adicionales en el modelo de pivote, como métodos y conversiones.

Los modelos de pivote personalizados de muchos a muchos deben extender la clase `Illuminate\Database\Eloquent\Relations\Pivot`, mientras que los modelos de pivote polimórficos personalizados de muchos a muchos deben extender la clase `Illuminate\Database\Eloquent\Relations\MorphPivot`. Por ejemplo, podemos definir un modelo `Role` que utiliza un modelo de pivote `RoleUser` personalizado:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    /**
     * The users that belong to the role.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)->using(RoleUser::class);
    }
}
```

Al definir el modelo `RoleUser`, debes extender la clase `Illuminate\Database\Eloquent\Relations\Pivot`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class RoleUser extends Pivot
{
    // ...
}
```

> **Advertencia:**
> Los modelos de pivote no pueden utilizar el trait `SoftDeletes`. Si necesitas realizar eliminaciones lógicas de registros de pivote, considera convertir tu modelo de pivote a un modelo Eloquent real.

<a id="custom-pivot-models-and-incrementing-ids"></a>
#### Modelos de pivote personalizados e ID autoincrementales

Si has definido una relación de muchos a muchos que utiliza un modelo de pivote personalizado y ese modelo de pivote tiene una clave principal que se incrementa automáticamente, debes asegurarte de que tu clase de modelo de pivote personalizado utilice el atributo `Table` con `incrementing` establecido en `true`:

```php
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Relations\Pivot;

#[Table(incrementing: true)]
class RoleUser extends Pivot
{
    // ...
}
```

<a id="automatically-hydrating-pivot-relationships"></a>
#### Hidratación automática de las relaciones del pivote

Cuando un modelo de pivote personalizado define relaciones `belongsTo` para los modelos declarantes y relacionados, puedes invocar `chaperone` para hidratar automáticamente esas relaciones en cada modelo de pivote. Esto evita consultas adicionales al acceder a los modelos a través del pivote:

```php
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\Pivot;

class RoleUser extends Pivot
{
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

class Role extends Model
{
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->using(RoleUser::class)
            ->chaperone();
    }
}
```

Eloquent intentará inferir los nombres de las relaciones pivote. Si tu modelo de pivote utiliza nombres no estándar, pasa los nombres de las relaciones con el modelo que la define y el modelo relacionado a `chaperone`:

```php
return $this->belongsToMany(User::class)
    ->using(RoleUser::class)
    ->chaperone(declaring: 'role', related: 'user');
```

<a id="polymorphic-relationships"></a>
## Relaciones polimórficas

Una relación polimórfica permite que el modelo hijo pertenezca a más de un tipo de modelo mediante una única asociación. Por ejemplo, imagina que estás creando una aplicación que permite a los usuarios compartir publicaciones de blogs y vídeos. En dicha aplicación, un modelo `Comment` podría pertenecer tanto al modelo `Post` como al `Video`.

<a id="one-to-one-polymorphic-relations"></a>
### Uno a uno (polimórfica)

<a id="one-to-one-polymorphic-table-structure"></a>
#### Estructura de las tablas

Una relación polimórfica uno a uno es similar a una relación uno a uno típica; sin embargo, el modelo hijo puede pertenecer a más de un tipo de modelo utilizando una única asociación. Por ejemplo, una publicación de blog `Post` y un `User` pueden compartir una relación polimórfica con un modelo `Image`. El uso de una relación polimórfica uno a uno te permite tener una sola tabla de imágenes únicas que pueden asociarse con publicaciones y usuarios. Primero, examinemos la estructura de la tabla:

```text
posts
    id - integer
    name - string

users
    id - integer
    name - string

images
    id - integer
    url - string
    imageable_type - string
    imageable_id - integer
```

Ten en cuenta las columnas `imageable_id` y `imageable_type` en la tabla `images`. La columna `imageable_id` contendrá el valor de ID de la publicación o usuario, mientras que la columna `imageable_type` contendrá el nombre de clase del modelo principal. Eloquent utiliza la columna `imageable_type` para determinar qué "tipo" de modelo principal devolver al acceder a la relación `imageable`. En este caso, la columna contendría `App\Models\Post` o `App\Models\User`.

<a id="one-to-one-polymorphic-model-structure"></a>
#### Estructura de los modelos

A continuación, examinemos las definiciones de modelo necesarias para construir esta relación:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Image extends Model
{
    /**
     * Obtener el modelo imageable principal (usuario o publicación).
     */
    public function imageable(): MorphTo
    {
        return $this->morphTo();
    }
}

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class Post extends Model
{
    /**
     * Obtener la imagen de la publicación.
     */
    public function image(): MorphOne
    {
        return $this->morphOne(Image::class, 'imageable');
    }
}

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class User extends Model
{
    /**
     * Obtener la imagen del usuario.
     */
    public function image(): MorphOne
    {
        return $this->morphOne(Image::class, 'imageable');
    }
}
```

<a id="one-to-one-polymorphic-retrieving-the-relationship"></a>
#### Recuperación de la relación

Una vez que la tabla y los modelos de tu base de datos estén definidos, puedes acceder a las relaciones a través de tus modelos. Por ejemplo, para recuperar la imagen de una publicación, podemos acceder a la propiedad de relación dinámica `image`:

```php
use App\Models\Post;

$post = Post::find(1);

$image = $post->image;
```

Puedes recuperar el padre del modelo polimórfico accediendo al nombre del método que realiza la llamada a `morphTo`. En este caso, ese es el método `imageable` en el modelo `Image`. Entonces, accederemos a ese método como una propiedad de relación dinámica:

```php
use App\Models\Image;

$image = Image::find(1);

$imageable = $image->imageable;
```

La relación `imageable` en el modelo `Image` devolverá una instancia `Post` o `User`, según el tipo de modelo propietario de la imagen.

<a id="morph-one-to-one-key-conventions"></a>
#### Convenciones de claves

Si es necesario, puedes especificar el nombre de las columnas "id" y "type" utilizadas por tu modelo hijo polimórfico. Si lo haces, asegúrate de pasar siempre el nombre de la relación como primer argumento del método `morphTo`. Normalmente, este valor debe coincidir con el nombre del método, por lo que puedes usar la constante `__FUNCTION__` de PHP:

```php
/**
 * Obtener el modelo al que pertenece la imagen.
 */
public function imageable(): MorphTo
{
    return $this->morphTo(__FUNCTION__, 'imageable_type', 'imageable_id');
}
```

<a id="one-to-many-polymorphic-relations"></a>
### Uno a muchos (polimórfica)

<a id="one-to-many-polymorphic-table-structure"></a>
#### Estructura de las tablas

Una relación polimórfica de uno a muchos es similar a una relación típica de uno a muchos; sin embargo, el modelo hijo puede pertenecer a más de un tipo de modelo utilizando una única asociación. Por ejemplo, imagina que los usuarios de tu aplicación pueden "comentar" publicaciones y vídeos. Al utilizar relaciones polimórficas, puedes utilizar una única tabla `comments` para contener comentarios tanto para publicaciones como para vídeos. Primero, examinemos la estructura de la tabla necesaria para construir esta relación:

```text
posts
    id - integer
    title - string
    body - text

videos
    id - integer
    title - string
    url - string

comments
    id - integer
    body - text
    commentable_type - string
    commentable_id - integer
```

<a id="one-to-many-polymorphic-model-structure"></a>
#### Estructura de los modelos

A continuación, examinemos las definiciones de modelo necesarias para construir esta relación:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Comment extends Model
{
    /**
     * Obtener el modelo commentable principal (publicación o video).
     */
    public function commentable(): MorphTo
    {
        return $this->morphTo();
    }
}

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Post extends Model
{
    /**
     * Obtener todos los comentarios de la publicación.
     */
    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }
}

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Video extends Model
{
    /**
     * Obtener todos los comentarios del video.
     */
    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }
}
```

<a id="one-to-many-polymorphic-retrieving-the-relationship"></a>
#### Recuperación de la relación

Una vez que la tabla y los modelos de tu base de datos estén definidos, puedes acceder a las relaciones a través de las propiedades de relación dinámica de tu modelo. Por ejemplo, para acceder a todos los comentarios de una publicación, podemos usar la propiedad dinámica `comments`:

```php
use App\Models\Post;

$post = Post::find(1);

foreach ($post->comments as $comment) {
    // ...
}
```

También puedes recuperar el padre de un modelo secundario polimórfico accediendo al nombre del método que realiza la llamada a `morphTo`. En este caso, ese es el método `commentable` en el modelo `Comment`. Entonces, accederemos a ese método como una propiedad de relación dinámica para poder acceder al modelo principal del comentario:

```php
use App\Models\Comment;

$comment = Comment::find(1);

$commentable = $comment->commentable;
```

La relación `commentable` en el modelo `Comment` devolverá una instancia `Post` o `Video`, según el tipo de modelo que sea el padre del comentario.

<a id="polymorphic-automatically-hydrating-parent-models-on-children"></a>
#### Hidratación automática de modelos principales en los secundarios

Incluso cuando se utiliza la carga anticipada de Eloquent, pueden surgir problemas de consulta "N + 1" si intentas acceder al modelo principal desde un modelo secundario mientras recorres los modelos secundarios:

```php
$posts = Post::with('comments')->get();

foreach ($posts as $post) {
    foreach ($post->comments as $comment) {
        echo $comment->commentable->title;
    }
}
```

En el ejemplo anterior, se introdujo un problema de consulta "N + 1" porque, aunque los comentarios se cargaron de forma anticipada para cada modelo `Post`, Eloquent no hidrata automáticamente el `Post` principal en cada modelo secundario `Comment`.

Si deseas que Eloquent hidrate automáticamente los modelos principales en sus modelos secundarios, puedes invocar el método `chaperone` al definir una relación `morphMany`:

```php
class Post extends Model
{
    /**
     * Obtener todos los comentarios de la publicación.
     */
    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable')->chaperone();
    }
}
```

O, si deseas optar por la hidratación automática del modelo principal en tiempo de ejecución, puedes invocar el modelo `chaperone` al cargar la relación de forma anticipada:

```php
use App\Models\Post;

$posts = Post::with([
    'comments' => fn ($comments) => $comments->chaperone(),
])->get();
```

<a id="one-of-many-polymorphic-relations"></a>
### Uno de muchos (polimórfica)

A veces, un modelo puede tener muchos modelos relacionados, pero deseas recuperar fácilmente el modelo relacionado "más reciente" o el "más antiguo" de la relación. Por ejemplo, un modelo `User` puede estar relacionado con muchos modelos `Image`, pero deseas definir una forma conveniente de interactuar con la imagen más reciente que ha subido el usuario. Puedes lograr esto utilizando el tipo de relación `morphOne` combinado con los métodos `ofMany`:

```php
/**
 * Obtener la imagen más reciente del usuario.
 */
public function latestImage(): MorphOne
{
    return $this->morphOne(Image::class, 'imageable')->latestOfMany();
}
```

Del mismo modo, puedes definir un método para recuperar el modelo relacionado "más antiguo" o primero de una relación:

```php
/**
 * Obtener la imagen más antigua del usuario.
 */
public function oldestImage(): MorphOne
{
    return $this->morphOne(Image::class, 'imageable')->oldestOfMany();
}
```

De forma predeterminada, los métodos `latestOfMany` y `oldestOfMany` recuperarán el modelo relacionado más reciente o más antiguo según la clave principal del modelo, que debe poder ordenarse. Sin embargo, a veces es posible que desees recuperar un único modelo de una relación más amplia utilizando criterios de clasificación diferentes.

Por ejemplo, utilizando el método `ofMany`, puedes recuperar la imagen del usuario con más "me gusta". El método `ofMany` acepta la columna ordenable como primer argumento y qué función agregada (`min` o `max`) se aplicará al consultar el modelo relacionado:

```php
/**
 * Obtener la imagen más popular del usuario.
 */
public function bestImage(): MorphOne
{
    return $this->morphOne(Image::class, 'imageable')->ofMany('likes', 'max');
}
```

> **Nota:**
> Es posible construir relaciones más avanzadas "una de muchas". Para obtener más información, consulta la [documentación sobre relaciones de uno de muchos](#advanced-has-one-of-many-relationships).

<a id="many-to-many-polymorphic-relations"></a>
### Muchos a muchos (polimórfica)

<a id="many-to-many-polymorphic-table-structure"></a>
#### Estructura de las tablas

Las relaciones polimórficas de muchos a muchos son un poco más complicadas que las relaciones polimórficas de uno y de muchos. Por ejemplo, un modelo `Post` y un modelo `Video` podrían compartir una relación polimórfica con un modelo `Tag`. El uso de una relación polimórfica de muchos a muchos en esta situación permitiría que tu aplicación tenga una sola tabla de etiquetas únicas que pueden estar asociadas con publicaciones o videos. Primero, examinemos la estructura de la tabla necesaria para construir esta relación:

```text
posts
    id - integer
    name - string

videos
    id - integer
    name - string

tags
    id - integer
    name - string

taggables
    tag_id - integer
    taggable_type - string
    taggable_id - integer
```

> **Nota:**
> Antes de profundizar en las relaciones polimórficas de muchos a muchos, puede resultarte útil leer la documentación sobre las [relaciones típicas de muchos a muchos](#many-to-many).

<a id="many-to-many-polymorphic-model-structure"></a>
#### Estructura de los modelos

A continuación, estamos listos para definir las relaciones en los modelos. Los modelos `Post` y `Video` contendrán un método `tags` que llama al método `morphToMany` proporcionado por la clase de modelo base Eloquent.

El método `morphToMany` acepta el nombre del modelo relacionado así como el "nombre de relación". Según el nombre que le asignamos a nuestra tabla intermedia y las claves que contiene, nos referiremos a la relación como "taggable":

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class Post extends Model
{
    /**
     * Obtener todas las tags de la publicación.
     */
    public function tags(): MorphToMany
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }
}
```

<a id="many-to-many-polymorphic-defining-the-inverse-of-the-relationship"></a>
#### Definición de la inversa de la relación

A continuación, en el modelo `Tag`, debes definir un método para cada uno de sus posibles modelos principales. Entonces, en este ejemplo, definiremos un método `posts` y un método `videos`. Ambos métodos deberían devolver el resultado del método `morphedByMany`.

El método `morphedByMany` acepta el nombre del modelo relacionado así como el "nombre de relación". Según el nombre que le asignamos a nuestra tabla intermedia y las claves que contiene, nos referiremos a la relación como "taggable":

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class Tag extends Model
{
    /**
     * Obtener todas las publicaciones asignadas a esta tag.
     */
    public function posts(): MorphToMany
    {
        return $this->morphedByMany(Post::class, 'taggable');
    }

    /**
     * Obtener todos los videos asignados a esta tag.
     */
    public function videos(): MorphToMany
    {
        return $this->morphedByMany(Video::class, 'taggable');
    }
}
```

<a id="many-to-many-polymorphic-retrieving-the-relationship"></a>
#### Recuperación de la relación

Una vez que la tabla y los modelos de tu base de datos estén definidos, puedes acceder a las relaciones a través de tus modelos. Por ejemplo, para acceder a todas las etiquetas de una publicación, puedes utilizar la propiedad de relación dinámica `tags`:

```php
use App\Models\Post;

$post = Post::find(1);

foreach ($post->tags as $tag) {
    // ...
}
```

Puedes recuperar el padre de una relación polimórfica del modelo secundario polimórfico accediendo al nombre del método que realiza la llamada a `morphedByMany`. En este caso, se trata de los métodos `posts` o `videos` en el modelo `Tag`:

```php
use App\Models\Tag;

$tag = Tag::find(1);

foreach ($tag->posts as $post) {
    // ...
}

foreach ($tag->videos as $video) {
    // ...
}
```

<a id="custom-polymorphic-types"></a>
### Tipos polimórficos personalizados

De forma predeterminada, Laravel utilizará el nombre de clase completo para almacenar el "tipo" del modelo relacionado. Por ejemplo, dado el ejemplo de relación uno a muchos anterior donde un modelo `Comment` puede pertenecer a un modelo `Post` o `Video`, el `commentable_type` predeterminado sería `App\Models\Post` o `App\Models\Video`, respectivamente. Sin embargo, es posible que desees desacoplar estos valores de la estructura interna de tu aplicación.

Por ejemplo, en lugar de utilizar los nombres de los modelos como "tipo", podemos utilizar cadenas simples como `post` y `video`. Al hacerlo, los valores de las columnas de "tipo" polimórfico en nuestra base de datos seguirán siendo válidos incluso si se cambia el nombre de los modelos:

```php
use Illuminate\Database\Eloquent\Relations\Relation;

Relation::enforceMorphMap([
    'post' => 'App\Models\Post',
    'video' => 'App\Models\Video',
]);
```

Puedes llamar al método `enforceMorphMap` en el método `boot` de tu clase `App\Providers\AppServiceProvider` o crear un proveedor de servicios independiente si lo deseas.

Puedes determinar el alias de transformación de un modelo determinado en tiempo de ejecución utilizando el método `getMorphClass` del modelo. Por el contrario, puedes determinar el nombre de clase completo asociado con un alias de transformación utilizando el método `Relation::getMorphedModel`:

```php
use Illuminate\Database\Eloquent\Relations\Relation;

$alias = $post->getMorphClass();

$class = Relation::getMorphedModel($alias);
```

> **Advertencia:**
> Al agregar un "mapa de transformación" a tu aplicación existente, cada valor de columna `*_type` transformable en tu base de datos que aún contenga una clase completamente calificada deberá convertirse a su nombre de "mapa".

<a id="dynamic-relationships"></a>
### Relaciones dinámicas

Puedes utilizar el método `resolveRelationUsing` para definir relaciones entre modelos de Eloquent en tiempo de ejecución. Aunque normalmente no se recomienda para el desarrollo normal de aplicaciones, en ocasiones puede resultar útil al desarrollar paquetes de Laravel.

El método `resolveRelationUsing` acepta el nombre de la relación deseada como primer argumento. El segundo argumento pasado al método debe ser una función anónima que acepte la instancia del modelo y devuelva una definición de relación Eloquent válida. Normalmente, debes configurar relaciones dinámicas dentro del método de arranque de un [proveedor de servicios](../providers/):

```php
use App\Models\Order;
use App\Models\Customer;

Order::resolveRelationUsing('customer', function (Order $orderModel) {
    return $orderModel->belongsTo(Customer::class, 'customer_id');
});
```

> **Advertencia:**
> Al definir relaciones dinámicas, proporciona siempre argumentos de nombre de clave explícitos para los métodos de relación de Eloquent.

<a id="querying-relations"></a>
## Consulta de relaciones

Dado que todas las relaciones de Eloquent se definen mediante métodos, puedes llamar a esos métodos para obtener una instancia de la relación sin ejecutar realmente una consulta para cargar los modelos relacionados. Además, todos los tipos de relaciones Eloquent también sirven como [constructores de consultas](../queries/), lo que te permite continuar encadenando restricciones en la consulta de relación antes de ejecutar finalmente la consulta SQL en tu base de datos.

Por ejemplo, imagina una aplicación de blog en la que un modelo `User` tiene muchos modelos `Post` asociados:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Model
{
    /**
     * Obtener todas las publicaciones del usuario.
     */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }
}
```

Puedes consultar la relación `posts` y agregar restricciones adicionales a la relación de esta manera:

```php
use App\Models\User;

$user = User::find(1);

$user->posts()->where('active', 1)->get();
```

Puedes utilizar cualquiera de los métodos del [constructor de consultas](../queries/) de Laravel en la relación, así que asegúrate de explorar su documentación para conocer todos los métodos que tienes disponibles.

<a id="chaining-orwhere-clauses-after-relationships"></a>
#### Encadenamiento de cláusulas `orWhere` después de las relaciones

Como se demuestra en el ejemplo anterior, puedes agregar restricciones adicionales a las relaciones al consultarlas. Sin embargo, ten cuidado al encadenar cláusulas `orWhere` en una relación, ya que las cláusulas `orWhere` se agruparán lógicamente al mismo nivel que la restricción de relación:

```php
$user->posts()
    ->where('active', 1)
    ->orWhere('votes', '>=', 100)
    ->get();
```

El ejemplo anterior generará el siguiente SQL. Como puedes ver, la cláusula `or` indica a la consulta que devuelva _cualquier_ publicación con más de 100 votos. La consulta ya no está restringida a un usuario específico:

```sql
select *
from posts
where user_id = ? and active = 1 or votes >= 100
```

En la mayoría de las situaciones, debes usar [grupos lógicos](../queries/#logical-grouping) para agrupar las comprobaciones condicionales entre paréntesis:

```php
use Illuminate\Database\Eloquent\Builder;

$user->posts()
    ->where(function (Builder $query) {
        return $query->where('active', 1)
            ->orWhere('votes', '>=', 100);
    })
    ->get();
```

El ejemplo anterior producirá el siguiente SQL. Ten en cuenta que la agrupación lógica ha agrupado correctamente las restricciones y la consulta permanece restringida a un usuario específico:

```sql
select *
from posts
where user_id = ? and (active = 1 or votes >= 100)
```

<a id="relationship-methods-vs-dynamic-properties"></a>
### Métodos de relación frente a propiedades dinámicas

Si no necesitas agregar restricciones adicionales a una consulta de relación de Eloquent, puedes acceder a la relación como si fuera una propiedad. Por ejemplo, si continuamos usando nuestros modelos de ejemplo `User` y `Post`, podemos acceder a todas las publicaciones de un usuario de esta manera:

```php
use App\Models\User;

$user = User::find(1);

foreach ($user->posts as $post) {
    // ...
}
```

Las propiedades de relación dinámica realizan una "carga diferida", lo que significa que solo cargarán los datos de su relación cuando realmente accedas a ellas. Debido a esto, los desarrolladores suelen utilizar [carga anticipada](#eager-loading) para precargar relaciones a las que saben que se accederá después de cargar el modelo. La carga anticipada proporciona una reducción significativa en las consultas SQL que deben ejecutarse para cargar las relaciones de un modelo.

<a id="querying-relationship-existence"></a>
### Consulta de la existencia de relaciones

Al recuperar registros de modelo, es posible que desees limitar tus resultados en función de la existencia de una relación. Por ejemplo, imagina que quieres recuperar todas las publicaciones del blog que tienen al menos un comentario. Para hacerlo, puedes pasar el nombre de la relación a los métodos `has` y `orHas`:

```php
use App\Models\Post;

// Recuperar todas las publicaciones que tengan al menos un comentario...
$posts = Post::has('comments')->get();
```

También puedes especificar un operador y un valor de recuento para personalizar aún más la consulta:

```php
// Recuperar todas las publicaciones que tengan tres o más comentarios...
$posts = Post::has('comments', '>=', 3)->get();
```

Las declaraciones `has` anidadas se pueden construir utilizando notación de "puntos". Por ejemplo, puedes recuperar todas las publicaciones que tengan al menos un comentario que tenga al menos una imagen:

```php
// Recuperar las publicaciones que tengan al menos un comentario con imágenes...
$posts = Post::has('comments.images')->get();
```

Si necesitas aún más potencia, puedes utilizar los métodos `whereHas` y `orWhereHas` para definir restricciones de consulta adicionales en tus consultas `has`, como inspeccionar el contenido de un comentario:

```php
use Illuminate\Database\Eloquent\Builder;

// Recuperar publicaciones con al menos un comentario que contenga términos como code%...
$posts = Post::whereHas('comments', function (Builder $query) {
    $query->where('content', 'like', 'code%');
})->get();

// Recuperar publicaciones con al menos diez comentarios que contengan términos como code%...
$posts = Post::whereHas('comments', function (Builder $query) {
    $query->where('content', 'like', 'code%');
}, '>=', 10)->get();
```

> **Advertencia:**
> Actualmente, Eloquent no admite consultas sobre la existencia de relaciones entre bases de datos. Las relaciones deben existir dentro de la misma base de datos.

<a id="many-to-many-relationship-existence-queries"></a>
#### Consultas de la existencia de relaciones de muchos a muchos

El método `whereAttachedTo` se puede utilizar para consultar modelos que tienen una asociación de muchos a muchos con un modelo o una colección de modelos:

```php
$users = User::whereAttachedTo($role)->get();
```

También puedes proporcionar una instancia de [colección](../eloquent-collections/) al método `whereAttachedTo`. Al hacerlo, Laravel recuperará los modelos asociados a cualquiera de los modelos dentro de la colección:

```php
$tags = Tag::whereLike('name', '%laravel%')->get();

$posts = Post::whereAttachedTo($tags)->get();
```

<a id="inline-relationship-existence-queries"></a>
#### Consultas en línea de la existencia de relaciones

Si deseas consultar la existencia de una relación con una condición única y simple adjunta a la consulta de relación, puede que te resulte más conveniente utilizar los métodos `whereRelation`, `orWhereRelation`, `whereMorphRelation` y `orWhereMorphRelation`. Por ejemplo, podemos consultar todas las publicaciones que tengan comentarios no aprobados:

```php
use App\Models\Post;

$posts = Post::whereRelation('comments', 'is_approved', false)->get();
```

Por supuesto, al igual que las llamadas al método `where` del constructor de consultas, también puedes especificar un operador:

```php
$posts = Post::whereRelation(
    'comments', 'created_at', '>=', now()->minus(hours: 1)
)->get();
```

<a id="querying-relationship-absence"></a>
### Consulta de la ausencia de relaciones

Al recuperar registros de modelo, es posible que desees limitar tus resultados en función de la ausencia de una relación. Por ejemplo, imagina que quieres recuperar todas las publicaciones del blog que **no** tienen ningún comentario. Para hacerlo, puedes pasar el nombre de la relación a los métodos `doesntHave` y `orDoesntHave`:

```php
use App\Models\Post;

$posts = Post::doesntHave('comments')->get();
```

Si necesitas aún más potencia, puedes usar los métodos `whereDoesntHave` y `orWhereDoesntHave` para agregar restricciones de consulta adicionales a tus consultas `doesntHave`, como inspeccionar el contenido de un comentario:

```php
use Illuminate\Database\Eloquent\Builder;

$posts = Post::whereDoesntHave('comments', function (Builder $query) {
    $query->where('content', 'like', 'code%');
})->get();
```

Puedes utilizar la notación de "puntos" para ejecutar una consulta en una relación anidada. Por ejemplo, la siguiente consulta recuperará todas las publicaciones que no tienen comentarios, así como las publicaciones que tienen comentarios donde ninguno de los comentarios proviene de usuarios prohibidos:

```php
use Illuminate\Database\Eloquent\Builder;

$posts = Post::whereDoesntHave('comments.author', function (Builder $query) {
    $query->where('banned', 1);
})->get();
```

<a id="querying-morph-to-relationships"></a>
### Consulta de relaciones de tipo morph to

Para consultar la existencia de relaciones de tipo "morph to", puedes utilizar los métodos `whereHasMorph` y `whereDoesntHaveMorph`. Estos métodos aceptan el nombre de la relación como primer argumento. A continuación, los métodos aceptan los nombres de los modelos relacionados que deseas incluir en la consulta. Finalmente, puedes proporcionar una función anónima que personalice la consulta de relación:

```php
use App\Models\Comment;
use App\Models\Post;
use App\Models\Video;
use Illuminate\Database\Eloquent\Builder;

// Recuperar comentarios asociados a publicaciones o vídeos con un título como code%...
$comments = Comment::whereHasMorph(
    'commentable',
    [Post::class, Video::class],
    function (Builder $query) {
        $query->where('title', 'like', 'code%');
    }
)->get();

// Recuperar comentarios asociados a publicaciones con un título que no coincida con code%...
$comments = Comment::whereDoesntHaveMorph(
    'commentable',
    Post::class,
    function (Builder $query) {
        $query->where('title', 'like', 'code%');
    }
)->get();
```

Es posible que en ocasiones necesites agregar restricciones de consulta basadas en el "tipo" del modelo polimórfico relacionado. La función anónima pasada al método `whereHasMorph` puede recibir un valor `$type` como segundo argumento. Este argumento te permite inspeccionar el "tipo" de la consulta que se está creando:

```php
use Illuminate\Database\Eloquent\Builder;

$comments = Comment::whereHasMorph(
    'commentable',
    [Post::class, Video::class],
    function (Builder $query, string $type) {
        $column = $type === Post::class ? 'content' : 'title';

        $query->where($column, 'like', 'code%');
    }
)->get();
```

A veces es posible que desees consultar a los hijos de una relación de tipo "morph to" a partir del modelo principal. Puedes lograr esto utilizando los métodos `whereMorphedTo` y `whereNotMorphedTo`, que determinarán automáticamente el mapeo de tipo de transformación adecuado para el modelo dado. Estos métodos aceptan el nombre de la relación `morphTo` como primer argumento y el modelo principal relacionado como segundo argumento:

```php
$comments = Comment::whereMorphedTo('commentable', $post)
    ->orWhereMorphedTo('commentable', $video)
    ->get();
```

<a id="querying-all-morph-to-related-models"></a>
#### Consulta de todos los modelos relacionados

En lugar de pasar un array de posibles modelos polimórficos, puedes proporcionar `*` como valor comodín. Esto le indicará a Laravel que recupere todos los tipos polimórficos posibles de la base de datos. Laravel ejecutará una consulta adicional para realizar esta operación:

```php
use Illuminate\Database\Eloquent\Builder;

$comments = Comment::whereHasMorph('commentable', '*', function (Builder $query) {
    $query->where('title', 'like', 'foo%');
})->get();
```

<a id="aggregating-related-models"></a>
## Agregación de modelos relacionados

<a id="counting-related-models"></a>
### Recuento de modelos relacionados

A veces es posible que desees contar el número de modelos relacionados para una relación determinada sin tener que cargar los modelos. Para lograr esto, puedes utilizar el método `withCount`. El método `withCount` colocará un atributo `{relation}_count` en los modelos resultantes:

```php
use App\Models\Post;

$posts = Post::withCount('comments')->get();

foreach ($posts as $post) {
    echo $post->comments_count;
}
```

Al pasar un array al método `withCount`, puedes agregar los "recuentos" para múltiples relaciones, así como agregar restricciones adicionales a las consultas:

```php
use Illuminate\Database\Eloquent\Builder;

$posts = Post::withCount(['votes', 'comments' => function (Builder $query) {
    $query->where('content', 'like', 'code%');
}])->get();

echo $posts[0]->votes_count;
echo $posts[0]->comments_count;
```

También puedes asignar un alias al resultado del recuento de relaciones, permitiendo varios recuentos en la misma relación:

```php
use Illuminate\Database\Eloquent\Builder;

$posts = Post::withCount([
    'comments',
    'comments as pending_comments_count' => function (Builder $query) {
        $query->where('approved', false);
    },
])->get();

echo $posts[0]->comments_count;
echo $posts[0]->pending_comments_count;
```

<a id="deferred-count-loading"></a>
#### Carga diferida del recuento

Con el método `loadCount`, puedes cargar un recuento de relaciones después de que ya se haya recuperado el modelo principal:

```php
$book = Book::first();

$book->loadCount('genres');
```

Si necesitas establecer restricciones de consulta adicionales en la consulta de recuento, puedes pasar un array cuyas claves sean las relaciones que deseas contar. Los valores del array deben ser funciones anónimas que reciban la instancia del constructor de consultas:

```php
$book->loadCount(['reviews' => function (Builder $query) {
    $query->where('rating', 5);
}]);
```

<a id="relationship-counting-and-custom-select-statements"></a>
#### Recuento de relaciones e instrucciones select personalizadas

Si combinas `withCount` con una instrucción `select`, asegúrate de llamar a `withCount` después del método `select`:

```php
$posts = Post::select(['title', 'body'])
    ->withCount('comments')
    ->get();
```

<a id="other-aggregate-functions"></a>
### Otras funciones de agregación

Además del método `withCount`, Eloquent proporciona los métodos `withMin`, `withMax`, `withAvg`, `withSum` y `withExists`. Estos métodos colocarán un atributo `{relation}_{function}_{column}` en los modelos resultantes:

```php
use App\Models\Post;

$posts = Post::withSum('comments', 'votes')->get();

foreach ($posts as $post) {
    echo $post->comments_sum_votes;
}
```

Si deseas acceder al resultado de la función agregada usando otro nombre, puedes especificar tu propio alias:

```php
$posts = Post::withSum('comments as total_comments', 'votes')->get();

foreach ($posts as $post) {
    echo $post->total_comments;
}
```

Al igual que el método `loadCount`, también están disponibles versiones diferidas de estos métodos. Estas operaciones agregadas adicionales se pueden realizar en modelos de Eloquent que ya se han recuperado:

```php
$post = Post::first();

$post->loadSum('comments', 'votes');
```

Si combinas estos métodos agregados con una instrucción `select`, asegúrate de llamar a los métodos agregados después del método `select`:

```php
$posts = Post::select(['title', 'body'])
    ->withExists('comments')
    ->get();
```

<a id="counting-related-models-on-morph-to-relationships"></a>
### Recuento de modelos relacionados en relaciones de tipo morph to

Si deseas cargar de forma anticipada una relación de tipo "morph to", así como recuentos de modelos relacionados para las diversas entidades que pueden ser devueltas por esa relación, puedes utilizar el método `with` en combinación con el método `morphWithCount` de la relación `morphTo`.

En este ejemplo, supongamos que los modelos `Photo` y `Post` pueden crear modelos `ActivityFeed`. Supondremos que el modelo `ActivityFeed` define una relación de tipo "morph to" denominada `parentable` que nos permite recuperar el modelo principal `Photo` o `Post` para una instancia de `ActivityFeed` determinada. Además, supongamos que los modelos `Photo` "tienen muchos" modelos `Tag` y los modelos `Post` "tienen muchos" modelos `Comment`.

Ahora, imaginemos que queremos recuperar instancias de `ActivityFeed` y cargar de forma anticipada los modelos principales `parentable` para cada instancia de `ActivityFeed`. Además, queremos recuperar la cantidad de etiquetas asociadas con cada foto principal y la cantidad de comentarios asociados con cada publicación principal:

```php
use Illuminate\Database\Eloquent\Relations\MorphTo;

$activities = ActivityFeed::with([
    'parentable' => function (MorphTo $morphTo) {
        $morphTo->morphWithCount([
            Photo::class => ['tags'],
            Post::class => ['comments'],
        ]);
    }])->get();
```

<a id="morph-to-deferred-count-loading"></a>
#### Carga diferida del recuento

Supongamos que ya hemos recuperado un conjunto de modelos `ActivityFeed` y ahora nos gustaría cargar los recuentos de relaciones anidadas para los distintos modelos `parentable` asociados con las fuentes de actividad. Puedes utilizar el método `loadMorphCount` para lograr esto:

```php
$activities = ActivityFeed::with('parentable')->get();

$activities->loadMorphCount('parentable', [
    Photo::class => ['tags'],
    Post::class => ['comments'],
]);
```

<a id="eager-loading"></a>
## Carga anticipada

Al acceder a relaciones Eloquent como propiedades, los modelos relacionados se "cargan de forma diferida". Esto significa que los datos de la relación no se cargan realmente hasta que accedes por primera vez a la propiedad. Sin embargo, Eloquent puede "cargar de forma anticipada" relaciones en el momento de consultar el modelo principal. La carga anticipada alivia el problema de la consulta "N + 1". Para ilustrar el problema de consulta N + 1, considera un modelo `Book` que "pertenece a" un modelo `Author`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Book extends Model
{
    /**
     * Obtener el autor del libro.
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(Author::class);
    }
}
```

Ahora, recuperemos todos los libros y sus autores:

```php
use App\Models\Book;

$books = Book::all();

foreach ($books as $book) {
    echo $book->author->name;
}
```

Este bucle ejecutará una consulta para recuperar todos los libros dentro de la tabla de la base de datos, luego otra consulta para cada libro para recuperar el autor del libro. Entonces, si tenemos 25 libros, el código anterior ejecutaría 26 consultas: una para recuperar los libros inicialmente y 25 consultas adicionales para recuperar el autor de cada libro.

Afortunadamente, podemos utilizar la carga anticipada para reducir esta operación a solo dos consultas. Al crear una consulta, puedes especificar qué relaciones deben cargarse de forma anticipada utilizando el método `with`:

```php
$books = Book::with('author')->get();

foreach ($books as $book) {
    echo $book->author->name;
}
```

Para esta operación, solo se ejecutarán dos consultas: una consulta para recuperar todos los libros y una consulta para recuperar todos los autores de todos los libros:

```sql
select * from books

select * from authors where id in (1, 2, 3, 4, 5, ...)
```

<a id="eager-loading-multiple-relationships"></a>
#### Carga anticipada de varias relaciones

A veces es posible que necesites cargar varias relaciones diferentes de forma anticipada. Para hacerlo, simplemente pasa un array de relaciones al método `with`:

```php
$books = Book::with(['author', 'publisher'])->get();
```

<a id="nested-eager-loading"></a>
#### Carga anticipada anidada

Para cargar de forma anticipada las relaciones de una relación, puedes utilizar la sintaxis de "punto". Por ejemplo, carguemos de forma anticipada todos los autores del libro y todos los contactos personales del autor:

```php
$books = Book::with('author.contacts')->get();
```

Alternativamente, puedes especificar relaciones anidadas que se cargarán de forma anticipada proporcionando un array anidado al método `with`, lo que puede ser conveniente cuando se cargan múltiples relaciones anidadas:

```php
$books = Book::with([
    'author' => [
        'contacts',
        'publisher',
    ],
])->get();
```

<a id="nested-eager-loading-morphto-relationships"></a>
#### Carga anticipada anidada de relaciones `morphTo`

Si deseas cargar de forma anticipada una relación `morphTo`, así como relaciones anidadas en las diversas entidades que puede devolver esa relación, puedes usar el método `with` en combinación con el método `morphWith` de la relación `morphTo`. Para ayudar a ilustrar este método, consideremos el siguiente modelo:

```php
<?php

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ActivityFeed extends Model
{
    /**
     * Obtener el elemento principal del registro del feed de actividad.
     */
    public function parentable(): MorphTo
    {
        return $this->morphTo();
    }
}
```

En este ejemplo, supongamos que los modelos `Event`, `Photo` y `Post` pueden crear modelos `ActivityFeed`. Además, supongamos que los modelos `Event` pertenecen a un modelo `Calendar`, los modelos `Photo` están asociados a modelos `Tag` y los modelos `Post` pertenecen a un modelo `Author`.

Usando estas definiciones y relaciones de modelo, podemos recuperar instancias de modelo `ActivityFeed` y cargar de forma anticipada todos los modelos `parentable` y sus respectivas relaciones anidadas:

```php
use Illuminate\Database\Eloquent\Relations\MorphTo;

$activities = ActivityFeed::query()
    ->with(['parentable' => function (MorphTo $morphTo) {
        $morphTo->morphWith([
            Event::class => ['calendar'],
            Photo::class => ['tags'],
            Post::class => ['author'],
        ]);
    }])->get();
```

<a id="eager-loading-specific-columns"></a>
#### Carga anticipada de columnas específicas

Es posible que no siempre necesites todas las columnas de las relaciones que estás recuperando. Por este motivo, Eloquent te permite especificar qué columnas de la relación te gustaría recuperar:

```php
$books = Book::with('author:id,name,book_id')->get();
```

> **Advertencia:**
> Al utilizar esta función, siempre debes incluir la columna `id` y cualquier columna de clave externa relevante en la lista de columnas que deseas recuperar.

<a id="eager-loading-by-default"></a>
#### Carga anticipada predeterminada

A veces es posible que desees cargar siempre algunas relaciones de forma anticipada al recuperar un modelo. Para lograr esto, puedes definir una propiedad `$with` en el modelo:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Book extends Model
{
    /**
     * The relationships that should always be loaded.
     *
     * @var array
     */
    protected $with = ['author'];

    /**
     * Obtener el autor del libro.
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(Author::class);
    }

    /**
     * Obtener el género del libro.
     */
    public function genre(): BelongsTo
    {
        return $this->belongsTo(Genre::class);
    }
}
```

Si deseas eliminar un elemento de la propiedad `$with` para una sola consulta, puedes utilizar el método `without`:

```php
$books = Book::without('author')->get();
```

Si deseas anular todos los elementos dentro de la propiedad `$with` para una sola consulta, puedes utilizar el método `withOnly`:

```php
$books = Book::withOnly('genre')->get();
```

<a id="constraining-eager-loads"></a>
### Restricción de la carga anticipada

A veces es posible que desees cargar una relación de forma anticipada, pero también especificar condiciones de consulta adicionales para la consulta de carga anticipada. Puedes lograr esto pasando un array de relaciones al método `with` donde la clave del array es un nombre de relación y el valor del array es una función anónima que agrega restricciones adicionales a la consulta de carga anticipada:

```php
use App\Models\User;

$users = User::with(['posts' => function ($query) {
    $query->where('title', 'like', '%code%');
}])->get();
```

En este ejemplo, Eloquent solo cargará de forma anticipada las publicaciones cuya columna `title` contenga la palabra `code`. Puedes llamar a otros métodos del [constructor de consultas](../queries/) para personalizar aún más la operación de carga anticipada:

```php
$users = User::with(['posts' => function ($query) {
    $query->orderBy('created_at', 'desc');
}])->get();
```

<a id="constraining-eager-loading-of-morph-to-relationships"></a>
#### Restricción de la carga anticipada de relaciones `morphTo`

Si cargas de forma anticipada una relación `morphTo`, Eloquent ejecutará múltiples consultas para buscar cada tipo de modelo relacionado. Puedes agregar restricciones adicionales a cada una de estas consultas utilizando el método `constrain` de la relación `MorphTo`:

```php
use Illuminate\Database\Eloquent\Relations\MorphTo;

$comments = Comment::with(['commentable' => function (MorphTo $morphTo) {
    $morphTo->constrain([
        Post::class => function ($query) {
            $query->whereNull('hidden_at');
        },
        Video::class => function ($query) {
            $query->where('type', 'educational');
        },
    ]);
}])->get();
```

En este ejemplo, Eloquent solo cargará de forma anticipada publicaciones que no hayan sido ocultas y videos que tengan un valor `type` de "educational".

<a id="constraining-eager-loads-with-relationship-existence"></a>
#### Restricción de la carga anticipada con la existencia de relaciones

A veces es posible que necesites verificar la existencia de una relación y, al mismo tiempo, cargarla en función de las mismas condiciones. Por ejemplo, es posible que desees recuperar solo los modelos `User` que tengan modelos secundarios `Post` que coincidan con una condición de consulta determinada y, al mismo tiempo, cargar de forma anticipada las publicaciones coincidentes. Puedes lograr esto utilizando el método `withWhereHas`:

```php
use App\Models\User;

$users = User::withWhereHas('posts', function ($query) {
    $query->where('featured', true);
})->get();
```

<a id="lazy-eager-loading"></a>
### Carga anticipada diferida

A veces es posible que necesites cargar de forma anticipada una relación después de que ya se haya recuperado el modelo principal. Por ejemplo, esto puede resultar útil si necesitas decidir dinámicamente si deseas cargar modelos relacionados:

```php
use App\Models\Book;

$books = Book::all();

if ($condition) {
    $books->load('author', 'publisher');
}
```

Si necesitas establecer restricciones de consulta adicionales en la consulta de carga anticipada, puedes pasar un array cuyas claves sean las relaciones que deseas cargar. Los valores del array deben ser instancias de funciones anónimas que reciben la instancia de consulta:

```php
$author->load(['books' => function ($query) {
    $query->orderBy('published_date', 'asc');
}]);
```

Para cargar una relación sólo cuando aún no se ha cargado, utiliza el método `loadMissing`:

```php
$book->loadMissing('author');
```

<a id="nested-lazy-eager-loading-morphto"></a>
#### Carga anticipada diferida anidada y `morphTo`

Si deseas cargar de forma anticipada una relación `morphTo`, así como relaciones anidadas en las diversas entidades que esa relación puede devolver, puedes utilizar el método `loadMorph`.

Este método acepta el nombre de la relación `morphTo` como primer argumento y un array de pares de modelo/relación como segundo argumento. Para ayudar a ilustrar este método, consideremos el siguiente modelo:

```php
<?php

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ActivityFeed extends Model
{
    /**
     * Obtener el elemento principal del registro del feed de actividad.
     */
    public function parentable(): MorphTo
    {
        return $this->morphTo();
    }
}
```

En este ejemplo, supongamos que los modelos `Event`, `Photo` y `Post` pueden crear modelos `ActivityFeed`. Además, supongamos que los modelos `Event` pertenecen a un modelo `Calendar`, los modelos `Photo` están asociados a modelos `Tag` y los modelos `Post` pertenecen a un modelo `Author`.

Usando estas definiciones y relaciones de modelo, podemos recuperar instancias de modelo `ActivityFeed` y cargar de forma anticipada todos los modelos `parentable` y sus respectivas relaciones anidadas:

```php
$activities = ActivityFeed::with('parentable')
    ->get()
    ->loadMorph('parentable', [
        Event::class => ['calendar'],
        Photo::class => ['tags'],
        Post::class => ['author'],
    ]);
```

<a id="automatic-eager-loading"></a>
### Carga anticipada automática

En muchos casos, Laravel puede cargar automáticamente de forma anticipada las relaciones a las que accedes. Para habilitar la carga anticipada automática, debes invocar el método `Model::automaticallyEagerLoadRelationships` dentro del método `boot` del `AppServiceProvider` de tu aplicación:

```php
use Illuminate\Database\Eloquent\Model;

/**
 * Inicializar los servicios de la aplicación.
 */
public function boot(): void
{
    Model::automaticallyEagerLoadRelationships();
}
```

Cuando esta función está habilitada, Laravel intentará cargar automáticamente de forma anticipada cualquier relación a la que accedas que no haya sido cargada previamente. Por ejemplo, considera el siguiente escenario:

```php
use App\Models\User;

$users = User::all();

foreach ($users as $user) {
    foreach ($user->posts as $post) {
        foreach ($post->comments as $comment) {
            echo $comment->content;
        }
    }
}
```

Normalmente, el código anterior ejecutaría una consulta para cada usuario para recuperar sus publicaciones, así como una consulta para cada publicación para recuperar sus comentarios. Sin embargo, cuando se ha habilitado la función `automaticallyEagerLoadRelationships`, Laravel realizará automáticamente la [carga anticipada diferida](#lazy-eager-loading) de las publicaciones de todos los usuarios de la colección de usuarios cuando intentes acceder a las publicaciones de cualquiera de los usuarios recuperados. Del mismo modo, cuando intentes acceder a los comentarios de cualquier publicación recuperada, se realizará la carga anticipada diferida de todos los comentarios de todas las publicaciones que se recuperaron originalmente.

Si no deseas habilitar globalmente la carga anticipada automática, aún puedes habilitar esta función para una única instancia de colección Eloquent invocando el método `withRelationshipAutoloading` en la colección:

```php
$users = User::where('vip', true)->get();

return $users->withRelationshipAutoloading();
```

<a id="preventing-lazy-loading"></a>
### Prevención de la carga diferida

Como se analizó anteriormente, cargar las relaciones de forma anticipada a menudo puede proporcionar importantes beneficios de rendimiento para tu aplicación. Por lo tanto, si lo deseas, puedes indicarle a Laravel que siempre evite la carga diferida de relaciones. Para lograr esto, puedes invocar el método `preventLazyLoading` ofrecido por la clase de modelo base Eloquent. Normalmente, debes llamar a este método dentro del método `boot` de la clase `AppServiceProvider` de tu aplicación.

El método `preventLazyLoading` acepta un argumento booleano opcional que indica si se debe evitar la carga diferida. Por ejemplo, es posible que desees deshabilitar la carga diferida solo en entornos que no sean de producción para que tu entorno de producción continúe funcionando normalmente incluso si una relación de carga diferida está presente accidentalmente en el código de producción:

```php
use Illuminate\Database\Eloquent\Model;

/**
 * Inicializar los servicios de la aplicación.
 */
public function boot(): void
{
    Model::preventLazyLoading(! $this->app->isProduction());
}
```

Después de evitar la carga diferida, Eloquent generará una excepción `Illuminate\Database\LazyLoadingViolationException` cuando tu aplicación intente realizar una carga diferida de cualquier relación de Eloquent.

Puedes personalizar el comportamiento de las infracciones de carga diferida utilizando el método `handleLazyLoadingViolationUsing`. Por ejemplo, al utilizar este método, puedes indicar que las infracciones de carga diferida solo se registren en lugar de interrumpir la ejecución de la aplicación con excepciones:

```php
Model::handleLazyLoadingViolationUsing(function (Model $model, string $relation) {
    $class = $model::class;

    info("Attempted to lazy load [{$relation}] on model [{$class}].");
});
```

<a id="inserting-and-updating-related-models"></a>
## Inserción y actualización de modelos relacionados

<a id="the-save-method"></a>
### El método `save`

Eloquent proporciona métodos convenientes para agregar nuevos modelos a las relaciones. Por ejemplo, quizás necesites agregar un nuevo comentario a una publicación. En lugar de configurar manualmente el atributo `post_id` en el modelo `Comment`, puedes insertar el comentario utilizando el método `save` de la relación:

```php
use App\Models\Comment;
use App\Models\Post;

$comment = new Comment(['message' => 'A new comment.']);

$post = Post::find(1);

$post->comments()->save($comment);
```

Ten en cuenta que no accedemos a la relación `comments` como propiedad dinámica. En lugar de eso, llamamos al método `comments` para obtener una instancia de la relación. El método `save` agregará automáticamente el valor `post_id` apropiado al nuevo modelo `Comment`.

Si necesitas guardar varios modelos relacionados, puedes utilizar el método `saveMany`:

```php
$post = Post::find(1);

$post->comments()->saveMany([
    new Comment(['message' => 'A new comment.']),
    new Comment(['message' => 'Another new comment.']),
]);
```

Los métodos `save` y `saveMany` conservarán las instancias de modelo proporcionadas, pero no agregarán los nuevos modelos guardados a ninguna relación en memoria que ya esté cargada en el modelo principal. Si planeas acceder a la relación después de usar los métodos `save` o `saveMany`, es posible que desees utilizar el método `refresh` para recargar el modelo y sus relaciones:

```php
$post->comments()->save($comment);

$post->refresh();

// All comments, including the newly saved comment...
$post->comments;
```

<a id="the-push-method"></a>
#### Guardado recursivo de modelos y relaciones

Si deseas guardar mediante `save` tu modelo y todas sus relaciones asociadas, puedes utilizar el método `push`. En este ejemplo se guardará el modelo `Post`, sus comentarios y los autores de los comentarios:

```php
$post = Post::find(1);

$post->comments[0]->message = 'Message';
$post->comments[0]->author->name = 'Author Name';

$post->push();
```

El método `pushQuietly` se puede utilizar para guardar un modelo y sus relaciones asociadas sin despachar ningún evento:

```php
$post->pushQuietly();
```

<a id="the-create-method"></a>
### El método `create`

Además de los métodos `save` y `saveMany`, también puedes utilizar el método `create`, que acepta un array de atributos, crea un modelo y lo inserta en la base de datos. La diferencia entre `save` y `create` es que `save` acepta una instancia completa de un modelo Eloquent, mientras que `create` acepta un `array` de PHP simple. El modelo recién creado será devuelto por el método `create`:

```php
use App\Models\Post;

$post = Post::find(1);

$comment = $post->comments()->create([
    'message' => 'A new comment.',
]);
```

Puedes utilizar el método `createMany` para crear varios modelos relacionados:

```php
$post = Post::find(1);

$post->comments()->createMany([
    ['message' => 'A new comment.'],
    ['message' => 'Another new comment.'],
]);
```

Los métodos `createQuietly` y `createManyQuietly` se pueden utilizar para crear modelos sin despachar ningún evento:

```php
$user = User::find(1);

$user->posts()->createQuietly([
    'title' => 'Post title.',
]);

$user->posts()->createManyQuietly([
    ['title' => 'First post.'],
    ['title' => 'Second post.'],
]);
```

También puedes utilizar los métodos `findOrNew`, `firstOrNew`, `firstOrCreate` y `updateOrCreate` para [crear y actualizar modelos en relaciones](../eloquent/#upserts).

> **Nota:**
> Antes de utilizar el método `create`, asegúrate de revisar la [documentación de asignación masiva](../eloquent/#mass-assignment).

<a id="updating-belongs-to-relationships"></a>
### Relaciones de pertenencia

Si deseas asignar un modelo secundario a un nuevo modelo principal, puedes utilizar el método `associate`. En este ejemplo, el modelo `User` define una relación `belongsTo` con el modelo `Account`. Este método `associate` establecerá la clave externa en el modelo secundario:

```php
use App\Models\Account;

$account = Account::find(10);

$user->account()->associate($account);

$user->save();
```

Para desasociar un modelo principal de un modelo secundario, puedes utilizar el método `dissociate`. Este método establecerá la clave externa de la relación en `null`:

```php
$user->account()->dissociate();

$user->save();
```

<a id="updating-many-to-many-relationships"></a>
### Relaciones de muchos a muchos

<a id="attaching-detaching"></a>
#### Asociación / Desasociación

Eloquent también proporciona métodos para hacer que trabajar con relaciones de muchos a muchos sea más conveniente. Por ejemplo, imaginemos que un usuario puede tener muchos roles y un rol puede tener muchos usuarios. Puedes utilizar el método `attach` para asignar un rol a un usuario insertando un registro en la tabla intermedia de la relación:

```php
use App\Models\User;

$user = User::find(1);

$user->roles()->attach($roleId);
```

Al asociar una relación a un modelo, también puedes pasar un array de datos adicionales para insertarlos en la tabla intermedia:

```php
$user->roles()->attach($roleId, ['expires' => $expires]);
```

A veces puede ser necesario eliminar un rol de un usuario. Para eliminar un registro de relación de muchos a muchos, utiliza el método `detach`. El método `detach` eliminará el registro apropiado de la tabla intermedia; sin embargo, ambos modelos permanecerán en la base de datos:

```php
// Desvincular un solo rol del usuario...
$user->roles()->detach($roleId);

// Desvincular todos los roles del usuario...
$user->roles()->detach();
```

Para mayor comodidad, `attach` y `detach` también aceptan arrays de ID como entrada:

```php
$user = User::find(1);

$user->roles()->detach([1, 2, 3]);

$user->roles()->attach([
    1 => ['expires' => $expires],
    2 => ['expires' => $expires],
]);
```

<a id="syncing-associations"></a>
#### Sincronización de asociaciones

También puedes utilizar el método `sync` para construir asociaciones de muchos a muchos. El método `sync` acepta un array de ID para colocar en la tabla intermedia. Cualquier ID que no esté en el array dado se eliminará de la tabla intermedia. Entonces, una vez completada esta operación, solo existirán en la tabla intermedia los ID del array dado:

```php
$user->roles()->sync([1, 2, 3]);
```

También puedes pasar valores de tabla intermedia adicionales con los ID:

```php
$user->roles()->sync([1 => ['expires' => true], 2, 3]);
```

Si deseas insertar los mismos valores de la tabla intermedia con cada uno de los ID de modelo sincronizados, puedes utilizar el método `syncWithPivotValues`:

```php
$user->roles()->syncWithPivotValues([1, 2, 3], ['active' => true]);
```

Si no deseas desasociar los ID existentes que faltan en el array dado, puedes utilizar el método `syncWithoutDetaching`:

```php
$user->roles()->syncWithoutDetaching([1, 2, 3]);
```

<a id="toggling-associations"></a>
#### Alternancia de asociaciones

La relación de muchos a muchos también proporciona un método `toggle` que "alterna" el estado de asociación de los ID de modelo relacionados dados. Si el ID proporcionado está asociado actualmente, se desasociará. Asimismo, si está desasociado, se asociará:

```php
$user->roles()->toggle([1, 2, 3]);
```

También puedes pasar valores de tabla intermedia adicionales con los ID:

```php
$user->roles()->toggle([
    1 => ['expires' => true],
    2 => ['expires' => true],
]);
```

<a id="transactional-pivot-operations"></a>
#### Operaciones transaccionales del pivote

Cada una de las operaciones de pivote analizadas anteriormente también tiene una variante `OrFail` (`attachOrFail`, `detachOrFail`, `syncOrFail`, `syncWithoutDetachingOrFail` y `toggleOrFail`) que envuelve la operación dentro de una transacción de base de datos, de modo que todos los cambios se revierten automáticamente si se produce una excepción:

```php
$user->roles()->attachOrFail([1, 2, 3]);

$user->roles()->syncOrFail([1, 2, 3]);
```

<a id="updating-a-record-on-the-intermediate-table"></a>
#### Actualización de un registro de la tabla intermedia

Si necesitas actualizar una fila existente en la tabla intermedia de tu relación, puedes utilizar el método `updateExistingPivot`. Este método acepta la clave externa del registro intermedio y un array de atributos para actualizar:

```php
$user = User::find(1);

$user->roles()->updateExistingPivot($roleId, [
    'active' => false,
]);
```

<a id="touching-parent-timestamps"></a>
## Actualización de las marcas de tiempo de los modelos principales

Cuando un modelo define una relación `belongsTo` o `belongsToMany` con otro modelo, como un `Comment` que pertenece a un `Post`, a veces resulta útil actualizar la marca de tiempo del modelo principal cuando se actualiza el modelo secundario.

Por ejemplo, cuando se actualiza un modelo `Comment`, es posible que desees "tocar" automáticamente la marca de tiempo `updated_at` del modelo `Post` propietario para que se establezca en la fecha y hora actuales. Para lograr esto, puedes usar el atributo `Touches` en tu modelo secundario que contiene los nombres de las relaciones que deben tener sus marcas de tiempo `updated_at` actualizadas cuando se actualiza el modelo secundario:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Touches;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Touches(['post'])]
class Comment extends Model
{
    /**
     * Obtener la publicación a la que pertenece el comentario.
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }
}
```

> **Advertencia:**
> Las marcas de tiempo del modelo principal solo se actualizarán si el modelo secundario se actualiza utilizando el método `save` de Eloquent.
