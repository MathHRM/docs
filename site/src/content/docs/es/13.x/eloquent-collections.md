---
title: "Eloquent: Colecciones"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Métodos disponibles](#available-methods)
- [Colecciones personalizadas](#custom-collections)

<a id="introduction"></a>
## Introducción

Todos los métodos de Eloquent que devuelven más de un resultado de modelo devolverán instancias de la clase `Illuminate\Database\Eloquent\Collection`, incluidos los resultados recuperados mediante el método `get` o a los que se accede mediante una relación. El objeto de colección Eloquent extiende la [colección base](../collections/) de Laravel, por lo que naturalmente hereda docenas de métodos utilizados para trabajar con fluidez con la matriz subyacente de modelos Eloquent. ¡Asegúrese de revisar la documentación de la colección Laravel para aprender todo sobre estos útiles métodos!

Todas las colecciones también sirven como iteradores, lo que le permite recorrerlas como si fueran simples matrices PHP:

```php
use App\Models\User;

$users = User::where('active', 1)->get();

foreach ($users as $user) {
    echo $user->name;
}
```

Sin embargo, como se mencionó anteriormente, las colecciones son mucho más poderosas que las matrices y exponen una variedad de operaciones de mapa/reducción que pueden encadenarse mediante una interfaz intuitiva. Por ejemplo, podemos eliminar todos los modelos inactivos y luego recopilar el nombre de cada usuario restante:

```php
$names = User::all()->reject(function (User $user) {
    return $user->active === false;
})->map(function (User $user) {
    return $user->name;
});
```

<a id="eloquent-collection-conversion"></a>
#### Conversión de colección Eloquent

Si bien la mayoría de los métodos de colección de Eloquent devuelven una nueva instancia de una colección de Eloquent, los métodos `collapse`, `flatten`, `flip`, `keys`, `pluck` y `zip` devuelven una [instancia de colección base](../collections/). Del mismo modo, si una operación `map` devuelve una colección que no contiene ningún modelo de Eloquent, se convertirá en una instancia de colección base.

<a id="available-methods"></a>
## Métodos disponibles

Todas las colecciones de Eloquent amplían la base [objeto Laravel collection](../collections/#available-methods); por lo tanto, heredan todos los métodos potentes proporcionados por la clase de colección base.

Además, la clase `Illuminate\Database\Eloquent\Collection` proporciona un superconjunto de métodos para ayudarle a administrar sus colecciones de modelos. La mayoría de los métodos devuelven instancias `Illuminate\Database\Eloquent\Collection`; sin embargo, algunos métodos, como `pluck`, devuelven una instancia de `Illuminate\Support\Collection`.

<style>
    .collection-method-list > p {
        columns: 14.4em 1; -moz-columns: 14.4em 1; -webkit-columns: 14.4em 1;
    }

    .collection-method-list a {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .collection-method code {
        font-size: 14px;
    }

    .collection-method:not(.first-collection-method) {
        margin-top: 50px;
    }
</style>

<div class="collection-method-list" markdown="1">

[añadir](#method-append)
[contiene](#method-contains)
[diff](#method-diff)
[excepto](#method-except)
[encontrar](#method-find)
[findOrFail](#method-find-or-fail)
[fresco](#method-fresh)
[intersección](#method-intersect)
[carga](#method-load)
[loadMissing](#method-loadMissing)
[modeloKeys](#method-modelKeys)
[makeVisible](#method-makeVisible)
[makeHidden](#method-makeHidden)
[mergeVisible](#method-mergeVisible)
[mergeHidden](#method-mergeHidden)
[solo](#method-only)
[partición](#method-partition)
[setAppends](#method-setAppends)
[setVisible](#method-setVisible)
[setHidden](#method-setHidden)
[aQuery](#method-toquery)
[único](#method-unique)
[sinAnexos](#method-withoutAppends)

</div>

<a id="method-append"></a>
#### `append($attributes)` {.método-colección .método-primera-colección}

El método `append` se puede utilizar para indicar que se debe [añadir un atributo](../eloquent-serialization/#appending-values-to-json) para cada modelo de la colección. Este método acepta una serie de atributos o un solo atributo:

```php
$users->append('team');

$users->append(['team', 'is_admin']);
```

<a id="method-contains"></a>
#### `contains($key, $operator = null, $value = null)` {.método-colección}

El método `contains` se puede utilizar para determinar si la colección contiene una instancia de modelo determinada. Este método acepta una clave principal o una instancia de modelo:

```php
$users->contains(1);

$users->contains(User::find(1));
```

<a id="method-diff"></a>
#### `diff($items)` {.método-colección}

El método `diff` devuelve todos los modelos que no están presentes en la colección dada:

```php
use App\Models\User;

$users = $users->diff(User::whereIn('id', [1, 2, 3])->get());
```

<a id="method-except"></a>
#### `except($keys)` {.método-colección}

El método `except` devuelve todos los modelos que no tienen las claves principales proporcionadas:

```php
$users = $users->except([1, 2, 3]);
```

<a id="method-find"></a>
#### `find($key)` {.método-colección}

El método `find` devuelve el modelo que tiene una clave principal que coincide con la clave proporcionada. Si `$key` es una instancia de modelo, `find` intentará devolver un modelo que coincida con la clave principal. Si `$key` es una matriz de claves, `find` devolverá todos los modelos que tengan una clave principal en la matriz dada:

```php
$users = User::all();

$user = $users->find(1);
```

<a id="method-find-or-fail"></a>
#### `findOrFail($key)` {.método-colección}

El método `findOrFail` devuelve el modelo que tiene una clave principal que coincide con la clave dada o genera una excepción `Illuminate\Database\Eloquent\ModelNotFoundException` si no se puede encontrar ningún modelo coincidente en la colección:

```php
$users = User::all();

$user = $users->findOrFail(1);
```

<a id="method-fresh"></a>
#### `fresh($with = [])` {.método-colección}

El método `fresh` recupera una instancia nueva de cada modelo de la colección de la base de datos. Además, cualquier relación especificada se cargará rápidamente:

```php
$users = $users->fresh();

$users = $users->fresh('comments');
```

<a id="method-intersect"></a>
#### `intersect($items)` {.método-colección}

El método `intersect` devuelve todos los modelos que también están presentes en la colección dada:

```php
use App\Models\User;

$users = $users->intersect(User::whereIn('id', [1, 2, 3])->get());
```

<a id="method-load"></a>
#### `load($relations)` {.método-colección}

El método `load` carga ansiosamente las relaciones dadas para todos los modelos de la colección:

```php
$users->load(['comments', 'posts']);

$users->load('comments.author');

$users->load(['comments', 'posts' => fn ($query) => $query->where('active', 1)]);
```

<a id="method-loadMissing"></a>
#### `loadMissing($relations)` {.método-colección}

El método `loadMissing` carga ansiosamente las relaciones dadas para todos los modelos de la colección si las relaciones aún no están cargadas:

```php
$users->loadMissing(['comments', 'posts']);

$users->loadMissing('comments.author');

$users->loadMissing(['comments', 'posts' => fn ($query) => $query->where('active', 1)]);
```

<a id="method-modelKeys"></a>
#### `modelKeys()` {.método-colección}

El método `modelKeys` devuelve las claves principales de todos los modelos de la colección:

```php
$users->modelKeys();

// [1, 2, 3, 4, 5]
```

<a id="method-makeVisible"></a>
#### `makeVisible($attributes)` {.método-colección}

El método `makeVisible` [hace visibles los atributos ](../eloquent-serialization/#hiding-attributes-from-json) que normalmente están "ocultos" en cada modelo de la colección:

```php
$users = $users->makeVisible(['address', 'phone_number']);
```

<a id="method-makeHidden"></a>
#### `makeHidden($attributes)` {.método-colección}

El método `makeHidden` [oculta los atributos](../eloquent-serialization/#hiding-attributes-from-json) que normalmente son "visibles" en cada modelo de la colección:

```php
$users = $users->makeHidden(['address', 'phone_number']);
```

<a id="method-mergeVisible"></a>
#### `mergeVisible($attributes)` {.método-colección}

El método `mergeVisible` [hace visibles atributos adicionales](../eloquent-serialization/#hiding-attributes-from-json) manteniendo los atributos visibles existentes:

```php
$users = $users->mergeVisible(['middle_name']);
```

<a id="method-mergeHidden"></a>
#### `mergeHidden($attributes)` {.método-colección}

El método `mergeHidden` [oculta atributos adicionales](../eloquent-serialization/#hiding-attributes-from-json) mientras conserva los atributos ocultos existentes:

```php
$users = $users->mergeHidden(['last_login_at']);
```

<a id="method-only"></a>
#### `only($keys)` {.método-colección}

El método `only` devuelve todos los modelos que tienen las claves principales proporcionadas:

```php
$users = $users->only([1, 2, 3]);
```

<a id="method-partition"></a>
#### `partition` {.método-colección}

El método `partition` devuelve una instancia de `Illuminate\Support\Collection` que contiene instancias de la colección `Illuminate\Database\Eloquent\Collection`:

```php
$partition = $users->partition(fn ($user) => $user->age > 18);

dump($partition::class);    // Illuminate\Support\Collection
dump($partition[0]::class); // Illuminate\Database\Eloquent\Collection
dump($partition[1]::class); // Illuminate\Database\Eloquent\Collection
```

<a id="method-setAppends"></a>
#### `setAppends($attributes)` {.método-colección}

El método `setAppends` anula temporalmente todos los [atributos adjuntos](../eloquent-serialization/#appending-values-to-json) en cada modelo de la colección:

```php
$users = $users->setAppends(['is_admin']);
```

<a id="method-setVisible"></a>
#### `setVisible($attributes)` {.método-colección}

El método `setVisible` [anula temporalmente ](../eloquent-serialization/#temporarily-modifying-attribute-visibility) todos los atributos visibles en cada modelo de la colección:

```php
$users = $users->setVisible(['id', 'name']);
```

<a id="method-setHidden"></a>
#### `setHidden($attributes)` {.método-colección}

El método `setHidden` [anula temporalmente ](../eloquent-serialization/#temporarily-modifying-attribute-visibility) todos los atributos ocultos en cada modelo de la colección:

```php
$users = $users->setHidden(['email', 'password', 'remember_token']);
```

<a id="method-toquery"></a>
#### `toQuery()` {.método-colección}

El método `toQuery` devuelve una instancia del generador de consultas Eloquent que contiene una restricción `whereIn` en las claves principales del modelo de colección:

```php
use App\Models\User;

$users = User::where('status', 'VIP')->get();

$users->toQuery()->update([
    'status' => 'Administrator',
]);
```

<a id="method-unique"></a>
#### `unique($key = null, $strict = false)` {.método-colección}

El método `unique` devuelve todos los modelos únicos de la colección. Se eliminan todos los modelos con la misma clave principal que otro modelo de la colección:

```php
$users = $users->unique();
```

<a id="method-withoutAppends"></a>
#### `withoutAppends()` {.método-colección}

El método `withoutAppends` elimina temporalmente todos los [atributos adjuntos](../eloquent-serialization/#appending-values-to-json) en cada modelo de la colección:

```php
$users = $users->withoutAppends();
```

<a id="custom-collections"></a>
## Colecciones personalizadas

Si desea utilizar un objeto `Collection` personalizado al interactuar con un modelo determinado, puede agregar el atributo `CollectedBy` a su modelo:

```php
<?php

namespace App\Models;

use App\Support\UserCollection;
use Illuminate\Database\Eloquent\Attributes\CollectedBy;
use Illuminate\Database\Eloquent\Model;

#[CollectedBy(UserCollection::class)]
class User extends Model
{
    // ...
}
```

Alternativamente, puede definir un método `newCollection` en su modelo:

```php
<?php

namespace App\Models;

use App\Support\UserCollection;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * Create a new Eloquent Collection instance.
     *
     * @param  array<int, \Illuminate\Database\Eloquent\Model>  $models
     * @return \Illuminate\Database\Eloquent\Collection<int, \Illuminate\Database\Eloquent\Model>
     */
    public function newCollection(array $models = []): Collection
    {
        $collection = new UserCollection($models);

        if (Model::isAutomaticallyEagerLoadingRelationships()) {
            $collection->withRelationshipAutoloading();
        }

        return $collection;
    }
}
```

Una vez que haya definido un método `newCollection` o haya agregado el atributo `CollectedBy` a su modelo, recibirá una instancia de su colección personalizada en cualquier momento que Eloquent normalmente devolvería una instancia `Illuminate\Database\Eloquent\Collection`.

Si desea utilizar una colección personalizada para cada modelo de su aplicación, debe definir el método `newCollection` en una clase de modelo base que se extienda a todos los modelos de su aplicación.
