---
title: "Eloquent: fábricas"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Definición de fábricas de modelos](#defining-model-factories)
    - [Fábricas Generadoras](#generating-factories)
    - [Estados de fábrica](#factory-states)
    - [Devoluciones de llamada de fábrica](#factory-callbacks)
- [Creación de modelos utilizando Factories](#creating-models-using-factories)
    - [Creación de instancias de modelos](#instantiating-models)
    - [Modelos persistentes](#persisting-models)
    - [Secuencias](#sequences)
- [Relaciones de fábrica](#factory-relationships)
    - [Tiene muchas relaciones](#has-many-relationships)
    - [Pertenece a Relaciones](#belongs-to-relationships)
    - [Relaciones de muchos a muchos](#many-to-many-relationships)
    - [Relaciones polimórficas](#polymorphic-relationships)
    - [Definición de relaciones dentro de las fábricas](#defining-relationships-within-factories)
    - [Reciclando un modelo existente para las relaciones](#recycling-an-existing-model-for-relationships)

<a id="introduction"></a>
## Introducción

Al probar su aplicación o inicializar su base de datos, es posible que necesite insertar algunos registros en su base de datos. En lugar de especificar manualmente el valor de cada columna, Laravel le permite definir un conjunto de atributos predeterminados para cada uno de sus [modelos Eloquent](../eloquent/) utilizando fábricas de modelos.

Para ver un ejemplo de cómo escribir una fábrica, eche un vistazo al archivo `database/factories/UserFactory.php` en su aplicación. Esta fábrica se incluye con todas las aplicaciones nuevas de Laravel y contiene la siguiente definición de fábrica:

```php
namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
```

Como puede ver, en su forma más básica, las fábricas son clases que amplían la clase de fábrica base de Laravel y definen un método `definition`. El método `definition` devuelve el conjunto predeterminado de valores de atributos que se deben aplicar al crear un modelo utilizando la fábrica.

A través del asistente `fake`, las fábricas tienen acceso a la biblioteca PHP [Faker](https://github.com/FakerPHP/Faker), que le permite generar cómodamente varios tipos de datos aleatorios para pruebas y siembra.

> **Nota:**
> Puede cambiar la configuración regional de Faker de su aplicación actualizando la opción `faker_locale` en su archivo de configuración `config/app.php`.

<a id="defining-model-factories"></a>
## Definición de fábricas modelo

<a id="generating-factories"></a>
### Fábricas Generadoras

Para crear una fábrica, ejecute el `make:factory` [Comando artesanal](../artisan/):

```shell
php artisan make:factory PostFactory
```

La nueva clase de fábrica se colocará en su directorio `database/factories`.

<a id="factory-and-model-discovery-conventions"></a>
#### Convenciones de descubrimiento de modelos y fábricas

Una vez que haya definido sus fábricas, puede utilizar el método estático `factory` proporcionado a sus modelos por el rasgo `Illuminate\Database\Eloquent\Factories\HasFactory` para crear una instancia de fábrica para ese modelo.

El método `factory` del rasgo `HasFactory` utilizará convenciones para determinar la fábrica adecuada para el modelo al que está asignado el rasgo. Específicamente, el método buscará una fábrica en el espacio de nombres `Database\Factories` que tenga un nombre de clase que coincida con el nombre del modelo y tenga el sufijo `Factory`. Si estas convenciones no se aplican a su aplicación o fábrica particular, puede agregar el atributo `UseFactory` al modelo para especificar manualmente la fábrica del modelo:

```php
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Database\Factories\Administration\FlightFactory;

#[UseFactory(FlightFactory::class)]
class Flight extends Model
{
    // ...
}
```

Alternativamente, puede sobrescribir el método `newFactory` en su modelo para devolver una instancia de la fábrica correspondiente al modelo directamente:

```php
use Database\Factories\Administration\FlightFactory;

/**
 * Create a new factory instance for the model.
 */
protected static function newFactory()
{
    return FlightFactory::new();
}
```

Luego, use el atributo `UseModel` en la fábrica correspondiente para especificar el modelo:

```php
use App\Administration\Flight;
use Illuminate\Database\Eloquent\Factories\Attributes\UseModel;
use Illuminate\Database\Eloquent\Factories\Factory;

#[UseModel(Flight::class)]
class FlightFactory extends Factory
{
    // ...
}
```

<a id="factory-states"></a>
### Estados de fábrica

Los métodos de manipulación de estados le permiten definir modificaciones discretas que se pueden aplicar a sus fábricas modelo en cualquier combinación. Por ejemplo, su fábrica `Database\Factories\UserFactory` podría contener un método de estado `suspended` que modifica uno de sus valores de atributo predeterminados.

Los métodos de transformación de estado normalmente llaman al método `state` proporcionado por la clase de fábrica base de Laravel. El método `state` acepta una función anónima que recibirá la matriz de atributos sin procesar definidos para la fábrica y debería devolver una matriz de atributos para modificar:

```php
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Indicate that the user is suspended.
 */
public function suspended(): Factory
{
    return $this->state(function (array $attributes) {
        return [
            'account_status' => 'suspended',
        ];
    });
}
```

<a id="trashed-state"></a>
#### Estado "tirado a la papelera"

Si su modelo Eloquent puede ser [eliminado temporalmente](../eloquent/#soft-deleting), puede invocar el método de estado integrado `trashed` para indicar que el modelo creado ya debería estar "eliminado temporalmente". No es necesario definir manualmente el estado `trashed` ya que está disponible automáticamente para todas las fábricas:

```php
use App\Models\User;

$user = User::factory()->trashed()->create();
```

<a id="factory-callbacks"></a>
### Devoluciones de llamada de fábrica

Las devoluciones de llamada de fábrica se registran utilizando los métodos `afterMaking` y `afterCreating` y le permiten realizar tareas adicionales después de realizar o crear un modelo. Debe registrar estas devoluciones de llamada definiendo un método `configure` en su clase de fábrica. Laravel llamará automáticamente a este método cuando se cree una instancia de la fábrica:

```php
namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class UserFactory extends Factory
{
    /**
     * Configure the model factory.
     */
    public function configure(): static
    {
        return $this->afterMaking(function (User $user) {
            // ...
        })->afterCreating(function (User $user) {
            // ...
        });
    }

    // ...
}
```

También puede registrar devoluciones de llamada de fábrica dentro de métodos de estado para realizar tareas adicionales que son específicas de un estado determinado:

```php
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Indicate that the user is suspended.
 */
public function suspended(): Factory
{
    return $this->state(function (array $attributes) {
        return [
            'account_status' => 'suspended',
        ];
    })->afterMaking(function (User $user) {
        // ...
    })->afterCreating(function (User $user) {
        // ...
    });
}
```

<a id="creating-models-using-factories"></a>
## Creando modelos usando fábricas

<a id="instantiating-models"></a>
### Creación de instancias de modelos

Una vez que haya definido sus fábricas, puede utilizar el método estático `factory` proporcionado a sus modelos por el rasgo `Illuminate\Database\Eloquent\Factories\HasFactory` para crear una instancia de fábrica para ese modelo. Echemos un vistazo a algunos ejemplos de creación de modelos. Primero, usaremos el método `make` para crear modelos sin conservarlos en la base de datos:

```php
use App\Models\User;

$user = User::factory()->make();
```

Puede crear una colección de muchos modelos utilizando el método `count`:

```php
$users = User::factory()->count(3)->make();
```

<a id="applying-states"></a>
#### Estados solicitantes

También puede aplicar cualquiera de sus [states](#factory-states) a los modelos. Si desea aplicar múltiples transformaciones de estado a los modelos, simplemente puede llamar directamente a los métodos de transformación de estado:

```php
$users = User::factory()->count(5)->suspended()->make();
```

<a id="overriding-attributes"></a>
#### Atributos primordiales

Si desea anular algunos de los valores predeterminados de sus modelos, puede pasar una matriz de valores al método `make`. Solo se reemplazarán los atributos especificados, mientras que el resto de los atributos permanecerán establecidos en sus valores predeterminados según lo especificado por la fábrica:

```php
$user = User::factory()->make([
    'name' => 'Abigail Otwell',
]);
```

Alternativamente, se puede llamar al método `state` directamente en la instancia de fábrica para realizar una transformación de estado en línea:

```php
$user = User::factory()->state([
    'name' => 'Abigail Otwell',
])->make();
```

> **Nota:**
> [La protección de asignación masiva](../eloquent/#mass-assignment) se desactiva automáticamente al crear modelos utilizando fábricas.

<a id="persisting-models"></a>
### Modelos persistentes

El método `create` crea instancias de modelos y las conserva en la base de datos utilizando el método `save` de Eloquent:

```php
use App\Models\User;

// Create a single App\Models\User instance...
$user = User::factory()->create();

// Create three App\Models\User instances...
$users = User::factory()->count(3)->create();
```

Puede anular los atributos del modelo predeterminados de fábrica pasando una serie de atributos al método `create`:

```php
$user = User::factory()->create([
    'name' => 'Abigail',
]);
```

<a id="sequences"></a>
### Secuencias

A veces es posible que desee alternar el valor de un atributo de modelo determinado para cada modelo creado. Puede lograr esto definiendo una transformación de estado como una secuencia. Por ejemplo, es posible que desee alternar el valor de una columna `admin` entre `Y` y `N` para cada usuario creado:

```php
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Sequence;

$users = User::factory()
    ->count(10)
    ->state(new Sequence(
        ['admin' => 'Y'],
        ['admin' => 'N'],
    ))
    ->create();
```

En este ejemplo, se crearán cinco usuarios con un valor `admin` de `Y` y se crearán cinco usuarios con un valor `admin` de `N`.

Si es necesario, puede incluir una función anónima como valor de secuencia. La función anónima se invocará cada vez que la secuencia necesite un nuevo valor:

```php
use Illuminate\Database\Eloquent\Factories\Sequence;

$users = User::factory()
    ->count(10)
    ->state(new Sequence(
        fn (Sequence $sequence) => ['role' => UserRoles::all()->random()],
    ))
    ->create();
```

Dentro de una función anónima de secuencia, puede acceder a la propiedad `$index` en la instancia de secuencia que se inyecta en la función anónima. La propiedad `$index` contiene el número de iteraciones de la secuencia que se han producido hasta el momento:

```php
$users = User::factory()
    ->count(10)
    ->state(new Sequence(
        fn (Sequence $sequence) => ['name' => 'Name '.$sequence->index],
    ))
    ->create();
```

Por conveniencia, las secuencias también se pueden aplicar usando el método `sequence`, que simplemente invoca el método `state` internamente. El método `sequence` acepta una función anónima o matrices de atributos secuenciados:

```php
$users = User::factory()
    ->count(2)
    ->sequence(
        ['name' => 'First User'],
        ['name' => 'Second User'],
    )
    ->create();
```

<a id="factory-relationships"></a>
## Relaciones de fábrica

<a id="has-many-relationships"></a>
### Tiene muchas relaciones

A continuación, exploremos la construcción de relaciones de modelos Eloquent utilizando los métodos fluidos de fábrica de Laravel. Primero, supongamos que nuestra aplicación tiene un modelo `App\Models\User` y un modelo `App\Models\Post`. Además, supongamos que el modelo `User` define una relación `hasMany` con `Post`. Podemos crear un usuario que tenga tres posts usando el método `has` proporcionado por las fábricas de Laravel. El método `has` acepta una instancia de fábrica:

```php
use App\Models\Post;
use App\Models\User;

$user = User::factory()
    ->has(Post::factory()->count(3))
    ->create();
```

Por convención, al pasar un modelo `Post` al método `has`, Laravel asumirá que el modelo `User` debe tener un método `posts` que defina la relación. Si es necesario, puede especificar explícitamente el nombre de la relación que desea manipular:

```php
$user = User::factory()
    ->has(Post::factory()->count(3), 'posts')
    ->create();
```

Por supuesto, puedes realizar manipulaciones de estado en los modelos relacionados. Además, puede pasar una transformación de estado basada en función anónima si su cambio de estado requiere acceso al modelo principal:

```php
$user = User::factory()
    ->has(
        Post::factory()
            ->count(3)
            ->state(function (array $attributes, User $user) {
                return ['user_type' => $user->type];
            })
    )
    ->create();
```

<a id="has-many-relationships-using-magic-methods"></a>
#### Usando métodos mágicos

Para mayor comodidad, puede utilizar los métodos de relación de la fábrica mágica de Laravel para construir relaciones. Por ejemplo, el siguiente ejemplo utilizará la convención para determinar que los modelos relacionados deben crearse mediante un método de relación `posts` en el modelo `User`:

```php
$user = User::factory()
    ->hasPosts(3)
    ->create();
```

Cuando utilice métodos mágicos para crear relaciones de fábrica, puede pasar una serie de atributos para anular los modelos relacionados:

```php
$user = User::factory()
    ->hasPosts(3, [
        'published' => false,
    ])
    ->create();
```

También puede pasar varias matrices de atributos para crear modelos relacionados con estado por modelo. Laravel aplicará cada matriz en secuencia:

```php
$user = User::factory()
    ->hasPosts(
        ['title' => 'First Post'],
        ['title' => 'Second Post'],
        ['title' => 'Third Post'],
    )
    ->create();
```

Puede proporcionar una transformación de estado basada en función anónima si su cambio de estado requiere acceso al modelo principal:

```php
$user = User::factory()
    ->hasPosts(3, function (array $attributes, User $user) {
        return ['user_type' => $user->type];
    })
    ->create();
```

<a id="belongs-to-relationships"></a>
### Pertenece a las relaciones

Ahora que hemos explorado cómo construir relaciones "tiene muchos" utilizando fábricas, exploremos lo inverso de la relación. El método `for` se puede utilizar para definir el modelo principal al que pertenecen los modelos creados en fábrica. Por ejemplo, podemos crear tres instancias del modelo `App\Models\Post` que pertenecen a un único usuario:

```php
use App\Models\Post;
use App\Models\User;

$posts = Post::factory()
    ->count(3)
    ->for(User::factory()->state([
        'name' => 'Jessica Archer',
    ]))
    ->create();
```

Si ya tiene una instancia de modelo principal que debería asociarse con los modelos que está creando, puede pasar la instancia de modelo al método `for`:

```php
$user = User::factory()->create();

$posts = Post::factory()
    ->count(3)
    ->for($user)
    ->create();
```

<a id="belongs-to-relationships-using-magic-methods"></a>
#### Usando métodos mágicos

Para mayor comodidad, puede utilizar los métodos de relación de la fábrica mágica de Laravel para definir relaciones de "pertenece a". Por ejemplo, el siguiente ejemplo utilizará la convención para determinar que las tres publicaciones deben pertenecer a la relación `user` en el modelo `Post`:

```php
$posts = Post::factory()
    ->count(3)
    ->forUser([
        'name' => 'Jessica Archer',
    ])
    ->create();
```

<a id="many-to-many-relationships"></a>
### Relaciones de muchos a muchos

Al igual que [tiene muchas relaciones](#has-many-relationships), se pueden crear relaciones de "muchos a muchos" utilizando el método `has`:

```php
use App\Models\Role;
use App\Models\User;

$user = User::factory()
    ->has(Role::factory()->count(3))
    ->create();
```

<a id="pivot-table-attributes"></a>
#### Atributos de la tabla dinámica

Si necesita definir atributos que deben establecerse en la tabla dinámica/intermedia que vincula los modelos, puede utilizar el método `hasAttached`. Este método acepta una matriz de nombres y valores de atributos de tabla dinámica como segundo argumento:

```php
use App\Models\Role;
use App\Models\User;

$user = User::factory()
    ->hasAttached(
        Role::factory()->count(3),
        ['active' => true]
    )
    ->create();
```

Puede proporcionar una transformación de estado basada en función anónima si su cambio de estado requiere acceso al modelo relacionado:

```php
$user = User::factory()
    ->hasAttached(
        Role::factory()
            ->count(3)
            ->state(function (array $attributes, User $user) {
                return ['name' => $user->name.' Role'];
            }),
        ['active' => true]
    )
    ->create();
```

También puede pasar una serie de matrices dinámicas para proporcionar datos dinámicos únicos para cada modelo relacionado:

```php
$user = User::factory()
    ->hasAttached(
        Role::factory(),
        [
            ['active' => true],
            ['active' => false],
        ]
    )
    ->create();
```

Si ya tiene instancias de modelo que le gustaría adjuntar a los modelos que está creando, puede pasar las instancias de modelo al método `hasAttached`. En este ejemplo, se asignarán los mismos tres roles a los tres usuarios:

```php
$roles = Role::factory()->count(3)->create();

$users = User::factory()
    ->count(3)
    ->hasAttached($roles, ['active' => true])
    ->create();
```

<a id="many-to-many-relationships-using-magic-methods"></a>
#### Usando métodos mágicos

Para mayor comodidad, puede utilizar los métodos de relación de la fábrica mágica de Laravel para definir relaciones de muchos a muchos. Por ejemplo, el siguiente ejemplo utilizará la convención para determinar que los modelos relacionados deben crearse mediante un método de relación `roles` en el modelo `User`:

```php
$user = User::factory()
    ->hasRoles(1, [
        'name' => 'Editor'
    ])
    ->create();
```

<a id="polymorphic-relationships"></a>
### Relaciones polimórficas

[Las relaciones polimórficas ](../eloquent-relationships/#polymorphic-relationships) también se pueden crear utilizando fábricas. Las relaciones polimórficas "morph many" se crean de la misma manera que las relaciones típicas "tiene muchos". Por ejemplo, si un modelo `App\Models\Post` tiene una relación `morphMany` con un modelo `App\Models\Comment`:

```php
use App\Models\Post;

$post = Post::factory()->hasComments(3)->create();
```

<a id="morph-to-relationships"></a>
#### Transformarse en relaciones

No se pueden utilizar métodos mágicos para crear relaciones `morphTo`. En su lugar, se debe utilizar directamente el método `for` y se debe proporcionar explícitamente el nombre de la relación. Por ejemplo, imagine que el modelo `Comment` tiene un método `commentable` que define una relación `morphTo`. En esta situación, podemos crear tres comentarios que pertenecen a una sola publicación usando directamente el método `for`:

```php
$comments = Comment::factory()->count(3)->for(
    Post::factory(), 'commentable'
)->create();
```

<a id="polymorphic-many-to-many-relationships"></a>
#### Relaciones polimórficas de muchos a muchos

Las relaciones polimórficas "muchos a muchos" (`morphToMany` / `morphedByMany`) se pueden crear al igual que las relaciones no polimórficas "muchos a muchos":

```php
use App\Models\Tag;
use App\Models\Video;

$video = Video::factory()
    ->hasAttached(
        Tag::factory()->count(3),
        ['public' => true]
    )
    ->create();
```

Por supuesto, el método mágico `has` también se puede utilizar para crear relaciones polimórficas de "muchos a muchos":

```php
$video = Video::factory()
    ->hasTags(3, ['public' => true])
    ->create();
```

<a id="defining-relationships-within-factories"></a>
### Definición de relaciones dentro de las fábricas

Para definir una relación dentro de su fábrica de modelos, normalmente asignará una nueva instancia de fábrica a la clave externa de la relación. Esto normalmente se hace para las relaciones "inversas", como las relaciones `belongsTo` y `morphTo`. Por ejemplo, si desea crear un nuevo usuario al crear una publicación, puede hacer lo siguiente:

```php
use App\Models\User;

/**
 * Define the model's default state.
 *
 * @return array<string, mixed>
 */
public function definition(): array
{
    return [
        'user_id' => User::factory(),
        'title' => fake()->title(),
        'content' => fake()->paragraph(),
    ];
}
```

Si las columnas de la relación dependen de la fábrica que la define puedes asignar una función anónima a un atributo. La función anónima recibirá la matriz de atributos evaluados de la fábrica:

```php
/**
 * Define the model's default state.
 *
 * @return array<string, mixed>
 */
public function definition(): array
{
    return [
        'user_id' => User::factory(),
        'user_type' => function (array $attributes) {
            return User::find($attributes['user_id'])->type;
        },
        'title' => fake()->title(),
        'content' => fake()->paragraph(),
    ];
}
```

<a id="recycling-an-existing-model-for-relationships"></a>
### Reciclando un modelo existente de relaciones

Si tiene modelos que comparten una relación común con otro modelo, puede usar el método `recycle` para garantizar que se recicle una única instancia del modelo relacionado para todas las relaciones creadas por la fábrica.

Por ejemplo, imagina que tienes los modelos `Airline`, `Flight` y `Ticket`, donde el boleto pertenece a una aerolínea y a un vuelo, y el vuelo también pertenece a una aerolínea. Al crear boletos, probablemente querrás la misma aerolínea tanto para el boleto como para el vuelo, por lo que puedes pasar una instancia de aerolínea al método `recycle`:

```php
Ticket::factory()
    ->recycle(Airline::factory()->create())
    ->create();
```

Puede que el método `recycle` le resulte especialmente útil si tiene modelos que pertenecen a un usuario o equipo común.

El método `recycle` también acepta una colección de modelos existentes. Cuando se proporciona una colección al método `recycle`, se elegirá un modelo aleatorio de la colección cuando la fábrica necesite un modelo de ese tipo:

```php
Ticket::factory()
    ->recycle($airlines)
    ->create();
```
