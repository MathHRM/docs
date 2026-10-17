---
title: "Eloquent: serialización"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Serialización de modelos y colecciones](#serializing-models-and-collections)
    - [Serialización a arrays](#serializing-to-arrays)
    - [Serialización a JSON](#serializing-to-json)
- [Ocultar atributos de JSON](#hiding-attributes-from-json)
- [Agregar valores a JSON](#appending-values-to-json)
- [Serialización de fechas](#date-serialization)

<a id="introduction"></a>
## Introducción

Al crear API con Laravel, a menudo necesitarás convertir tus modelos y relaciones a arrays o JSON. Eloquent incluye métodos convenientes para realizar estas conversiones, además de controlar qué atributos se incluyen en la representación serializada de tus modelos.

> **Nota:**
> Para obtener una forma aún más sólida de manejar la serialización JSON de colecciones y modelos de Eloquent, consulta la documentación sobre [Recursos de API de Eloquent](../eloquent-resources/).

<a id="serializing-models-and-collections"></a>
## Serialización de modelos y colecciones

<a id="serializing-to-arrays"></a>
### Serialización a arrays

Para convertir un modelo y sus [relaciones](../eloquent-relationships/) cargadas en un array, debes utilizar el método `toArray`. Este método es recursivo, por lo que todos los atributos y todas las relaciones (incluidas las relaciones de relaciones) se convertirán en arrays:

```php
use App\Models\User;

$user = User::with('roles')->first();

return $user->toArray();
```

El método `attributesToArray` se puedes utilizar para convertir los atributos de un modelo en un array, pero no sus relaciones:

```php
$user = User::first();

return $user->attributesToArray();
```

También puedes convertir [colecciones](../eloquent-collections/) completas de modelos en arrays llamando al método `toArray` en la instancia de la colección:

```php
$users = User::all();

return $users->toArray();
```

<a id="serializing-to-json"></a>
### Serialización a JSON

Para convertir un modelo a JSON, debes utilizar el método `toJson`. Al igual que `toArray`, el método `toJson` es recursivo, por lo que todos los atributos y relaciones se convertirán a JSON. También puedes especificar cualquier opción de codificación JSON que sea [compatible con PHP](https://secure.php.net/manual/en/function.json-encode.php):

```php
use App\Models\User;

$user = User::find(1);

return $user->toJson();

return $user->toJson(JSON_PRETTY_PRINT);
```

Como alternativa, puedes convertir un modelo o colección a una cadena, lo que llamará automáticamente al método `toJson` en el modelo o colección:

```php
return (string) User::find(1);
```

Dado que los modelos y colecciones se convierten a JSON cuando se convierten en una cadena, puedes devolver objetos Eloquent directamente desde las rutas o controladores de tu aplicación. Laravel serializará automáticamente tus modelos y colecciones de Eloquent a JSON cuando sean devueltos por rutas o controladores:

```php
Route::get('/users', function () {
    return User::all();
});
```

<a id="relationships"></a>
#### Relaciones

Cuando un modelo de Eloquent se convierte a JSON, sus relaciones cargadas se incluirán automáticamente como atributos en el objeto JSON. Además, aunque los métodos de relación de Eloquent se definen utilizando nombres de métodos de "camel case", el atributo JSON de una relación será "snake case".

<a id="hiding-attributes-from-json"></a>
## Ocultar atributos de JSON

A veces puede que quieras limitar los atributos, como las contraseñas, que se incluyen en el array de tu modelo o en la representación JSON. Para hacerlo, puedes utilizar el atributo `Hidden` en tu modelo. Los atributos que aparecen en el atributo `Hidden` no se incluirán en la representación serializada de tu modelo:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;

#[Hidden(['password'])]
class User extends Model
{
    // ...
}
```


> **Nota:**
> Para ocultar relaciones, agrega el nombre del método de la relación al atributo `Hidden` de tu modelo Eloquent.

Como alternativa, puedes usar el atributo `Visible` para definir una "lista de permitidos" de atributos que deben incluirse en el array de tu modelo y la representación JSON. Todos los atributos que no están presentes en el atributo `Visible` se ocultarán cuando el modelo se convierta en un array o JSON:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Visible;
use Illuminate\Database\Eloquent\Model;

#[Visible(['first_name', 'last_name'])]
class User extends Model
{
    // ...
}
```

<a id="temporarily-modifying-attribute-visibility"></a>
#### Modificación temporal de la visibilidad de los atributos

Si quieres hacer visibles algunos atributos normalmente ocultos en una instancia de modelo determinada, puedes utilizar los métodos `makeVisible` o `mergeVisible`. El método `makeVisible` devuelve la instancia del modelo:

```php
return $user->makeVisible('attribute')->toArray();

return $user->mergeVisible(['name', 'email'])->toArray();
```

Asimismo, si desea ocultar algunos atributos que normalmente son visibles, puedes utilizar los métodos `makeHidden` o `mergeHidden`:

```php
return $user->makeHidden('attribute')->toArray();

return $user->mergeHidden(['name', 'email'])->toArray();
```

Si quieres anular temporalmente todos los atributos visibles u ocultos, puedes utilizar los métodos `setVisible` y `setHidden` respectivamente:

```php
return $user->setVisible(['id', 'name'])->toArray();

return $user->setHidden(['email', 'password', 'remember_token'])->toArray();
```

<a id="appending-values-to-json"></a>
## Agregar valores a JSON

Ocasionalmente, al convertir modelos a arrays o JSON, puede que quieras agregar atributos que no tienen una columna correspondiente en tu base de datos. Para hacerlo, primero define un [accesor](../eloquent-mutators/) para el valor:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * Determine if the user is an administrator.
     */
    protected function isAdmin(): Attribute
    {
        return new Attribute(
            get: fn () => 'yes',
        );
    }
}
```

Si quieres que el accesor siempre se agregue a el array de tu modelo y a las representaciones JSON, puedes usar el atributo `Appends` en tu modelo. Ten en cuenta que normalmente se hace referencia a los nombres de los atributos utilizando su representación serializada "snake case", aunque el método PHP del accesor se define utilizando "camel case":

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Model;

#[Appends(['is_admin'])]
class User extends Model
{
    // ...
}
```

Una vez que el atributo se haya agregado a la lista `appends`, se incluirá tanto en el array del modelo como en las representaciones JSON. Los atributos de el array `appends` también respetarán las configuraciones `visible` y `hidden` configuradas en el modelo.

<a id="appending-at-run-time"></a>
#### Agregar en tiempo de ejecución

En tiempo de ejecución, puedes indicarle a una instancia de modelo que agregue atributos adicionales utilizando los métodos `append` o `mergeAppends`. O puedes usar el método `setAppends` para anular todo el array de propiedades agregadas para una instancia de modelo determinada:

```php
return $user->append('is_admin')->toArray();

return $user->mergeAppends(['is_admin', 'status'])->toArray();

return $user->setAppends(['is_admin'])->toArray();
```

Del mismo modo, si desea eliminar todas las propiedades agregadas de un modelo, puedes utilizar el método `withoutAppends`:

```php
return $user->withoutAppends()->toArray();
```

<a id="date-serialization"></a>
## Serialización de fechas

<a id="customizing-the-default-date-format"></a>
#### Personalización del formato de fecha predeterminado

Puedes personalizar el formato de serialización predeterminado sobrescribiendo el método `serializeDate`. Este método no afecta el formato de las fechas para almacenarlas en la base de datos:

```php
/**
 * Prepare a date for array / JSON serialization.
 */
protected function serializeDate(DateTimeInterface $date): string
{
    return $date->format('Y-m-d');
}
```

<a id="customizing-the-date-format-per-attribute"></a>
#### Personalización del formato de fecha por atributo

Puedes personalizar el formato de serialización de los atributos de fecha individuales de Eloquent especificando el formato de fecha en las [declaraciones de conversión de tipos](../eloquent-mutators/#attribute-casting) del modelo:

```php
protected function casts(): array
{
    return [
        'birthday' => 'date:Y-m-d',
        'joined_at' => 'datetime:Y-m-d H:00',
    ];
}
```
