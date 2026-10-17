---
title: "Eloquent: recursos API"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Generando Recursos](#generating-resources)
- [Descripción general del concepto](#concept-overview)
    - [Colecciones de recursos](#resource-collections)
- [Recursos de escritura](#writing-resources)
    - [Ajuste de datos](#data-wrapping)
    - [Paginación](#pagination)
    - [Atributos condicionales](#conditional-attributes)
    - [Relaciones condicionales](#conditional-relationships)
    - [Agregar metadatos](#adding-meta-data)
- [JSON:Recursos API](#jsonapi-resources)
    - [Generando JSON:Recursos API](#generating-jsonapi-resources)
    - [Definición de atributos](#defining-jsonapi-attributes)
    - [Definición de relaciones](#defining-jsonapi-relationships)
    - [Tipo de recurso e ID](#jsonapi-resource-type-and-id)
    - [Conjuntos de campos dispersos e incluye](#jsonapi-sparse-fieldsets-and-includes)
    - [Enlaces y Meta](#jsonapi-links-and-meta)
- [Respuestas de recursos](#resource-responses)

<a id="introduction"></a>
## Introducción

Al crear una API, es posible que necesite una capa de transformación que se encuentre entre sus modelos de Eloquent y las respuestas JSON que realmente se devuelven a los usuarios de su aplicación. Por ejemplo, es posible que desee mostrar ciertos atributos para un subconjunto de usuarios y no para otros, o puede que desee incluir siempre ciertas relaciones en la representación JSON de sus modelos. Las clases de recursos de Eloquent te permiten transformar de forma expresiva y sencilla tus modelos y colecciones de modelos a JSON.

Por supuesto, siempre puedes convertir modelos o colecciones de Eloquent a JSON usando sus métodos `toJson`; sin embargo, los recursos de Eloquent brindan un control más granular y sólido sobre la serialización JSON de sus modelos y sus relaciones.

<a id="generating-resources"></a>
## Generando recursos

Para generar una clase de recurso, puede utilizar el comando `make:resource` Artisan. De forma predeterminada, los recursos se ubicarán en el directorio `app/Http/Resources` de su aplicación. Los recursos amplían la clase `Illuminate\Http\Resources\Json\JsonResource`:

```shell
php artisan make:resource UserResource
```

<a id="generating-resource-collections"></a>
#### Colecciones de recursos

Además de generar recursos que transforman modelos individuales, puede generar recursos que sean responsables de transformar colecciones de modelos. Esto permite que sus respuestas JSON incluyan enlaces y otra metainformación que sea relevante para una colección completa de un recurso determinado.

Para crear una colección de recursos, debe utilizar el indicador `--collection` al crear el recurso. O bien, incluir la palabra `Collection` en el nombre del recurso le indicará a Laravel que debe crear un recurso de colección. Los recursos de colección amplían la clase `Illuminate\Http\Resources\Json\ResourceCollection`:

```shell
php artisan make:resource User --collection

php artisan make:resource UserCollection
```

<a id="concept-overview"></a>
## Descripción general del concepto

> **Nota:**
> Esta es una descripción general de alto nivel de los recursos y las colecciones de recursos. Le recomendamos encarecidamente que lea las otras secciones de esta documentación para obtener una comprensión más profunda de la personalización y el poder que le ofrecen los recursos.

Antes de profundizar en todas las opciones disponibles al escribir recursos, primero echemos un vistazo de alto nivel a cómo se utilizan los recursos dentro de Laravel. Una clase de recurso representa un modelo único que debe transformarse en una estructura JSON. Por ejemplo, aquí hay una clase de recurso `UserResource` simple:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
```

Cada clase de recurso define un método `toArray` que devuelve la matriz de atributos que deben convertirse a JSON cuando el recurso se devuelve como respuesta de una ruta o método de controlador.

Tenga en cuenta que podemos acceder a las propiedades del modelo directamente desde la variable `$this`. Esto se debe a que una clase de recurso representará automáticamente el acceso a propiedades y métodos al modelo subyacente para un acceso conveniente. Una vez definido el recurso, puede ser devuelto desde una ruta o controlador. El recurso acepta la instancia del modelo subyacente a través de su constructor:

```php
use App\Http\Resources\UserResource;
use App\Models\User;

Route::get('/user/{id}', function (string $id) {
    return new UserResource(User::findOrFail($id));
});
```

Para mayor comodidad, puede utilizar el método `toResource` del modelo, que utilizará convenciones marco para descubrir automáticamente el recurso subyacente del modelo:

```php
return User::findOrFail($id)->toResource();
```

Al invocar el método `toResource`, Laravel intentará localizar un recurso que coincida con el nombre del modelo y que, opcionalmente, tenga el sufijo `Resource` dentro del espacio de nombres `Http\Resources` más cercano al espacio de nombres del modelo.

Si su clase de recurso no sigue esta convención de nomenclatura o está ubicada en un espacio de nombres diferente, puede especificar el recurso predeterminado para el modelo utilizando el atributo `UseResource`:

```php
<?php

namespace App\Models;

use App\Http\Resources\CustomUserResource;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\UseResource;

#[UseResource(CustomUserResource::class)]
class User extends Model
{
    // ...
}
```

Alternativamente, puede especificar la clase de recurso pasándola al método `toResource`:

```php
return User::findOrFail($id)->toResource(CustomUserResource::class);
```

<a id="resource-collections"></a>
### Colecciones de recursos

Si devuelve una colección de recursos o una respuesta paginada, debe usar el método `collection` proporcionado por su clase de recurso al crear la instancia de recurso en su ruta o controlador:

```php
use App\Http\Resources\UserResource;
use App\Models\User;

Route::get('/users', function () {
    return UserResource::collection(User::all());
});
```

O, para mayor comodidad, puede utilizar el método `toResourceCollection` de la colección Eloquent, que utilizará convenciones marco para descubrir automáticamente la colección de recursos subyacente del modelo:

```php
return User::all()->toResourceCollection();
```

Al invocar el método `toResourceCollection`, Laravel intentará localizar una colección de recursos que coincida con el nombre del modelo y que tenga el sufijo `Collection` dentro del espacio de nombres `Http\Resources` más cercano al espacio de nombres del modelo.

Si su clase de colección de recursos no sigue esta convención de nomenclatura o está ubicada en un espacio de nombres diferente, puede especificar la colección de recursos predeterminada para el modelo utilizando el atributo `UseResourceCollection`:

```php
<?php

namespace App\Models;

use App\Http\Resources\CustomUserCollection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\UseResourceCollection;

#[UseResourceCollection(CustomUserCollection::class)]
class User extends Model
{
    // ...
}
```

Alternativamente, puede especificar la clase de colección de recursos pasándola al método `toResourceCollection`:

```php
return User::all()->toResourceCollection(CustomUserCollection::class);
```

<a id="custom-resource-collections"></a>
#### Colecciones de recursos personalizados

De forma predeterminada, las colecciones de recursos no permiten agregar metadatos personalizados que deban devolverse con su colección. Si desea personalizar la respuesta de la colección de recursos, puede crear un recurso dedicado para representar la colección:

```shell
php artisan make:resource UserCollection
```

Una vez que se haya generado la clase de colección de recursos, puede definir fácilmente cualquier metadato que deba incluirse con la respuesta:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class UserCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection,
            'links' => [
                'self' => 'link-value',
            ],
        ];
    }
}
```

Después de definir su colección de recursos, puede ser devuelta desde una ruta o controlador:

```php
use App\Http\Resources\UserCollection;
use App\Models\User;

Route::get('/users', function () {
    return new UserCollection(User::all());
});
```

O, para mayor comodidad, puede utilizar el método `toResourceCollection` de la colección Eloquent, que utilizará convenciones marco para descubrir automáticamente la colección de recursos subyacente del modelo:

```php
return User::all()->toResourceCollection();
```

Al invocar el método `toResourceCollection`, Laravel intentará localizar una colección de recursos que coincida con el nombre del modelo y que tenga el sufijo `Collection` dentro del espacio de nombres `Http\Resources` más cercano al espacio de nombres del modelo.

<a id="preserving-collection-keys"></a>
#### Preservación de claves de colección

Al devolver una colección de recursos de una ruta, Laravel restablece las claves de la colección para que estén en orden numérico. Sin embargo, puede utilizar el atributo `PreserveKeys` en su clase de recurso para indicar si se deben conservar las claves originales de una colección:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Attributes\PreserveKeys;
use Illuminate\Http\Resources\Json\JsonResource;

#[PreserveKeys]
class UserResource extends JsonResource
{
    // ...
}
```

Cuando la propiedad `preserveKeys` se establece en `true`, las claves de colección se conservarán cuando la colección se devuelva desde una ruta o controlador:

```php
use App\Http\Resources\UserResource;
use App\Models\User;

Route::get('/users', function () {
    return UserResource::collection(User::all()->keyBy->id);
});
```

<a id="customizing-the-underlying-resource-class"></a>
#### Personalización de la clase de recurso subyacente

Normalmente, la propiedad `$this->collection` de una colección de recursos se completa automáticamente con el resultado de asignar cada elemento de la colección a su clase de recurso singular. Se supone que la clase de recurso singular es el nombre de clase de la colección sin la parte final `Collection` del nombre de clase. Además, según sus preferencias personales, la clase de recurso singular puede tener o no el sufijo `Resource`.

Por ejemplo, `UserCollection` intentará asignar las instancias de usuario dadas al recurso `UserResource`. Para personalizar este comportamiento, puede utilizar el atributo `Collects` en su colección de recursos:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Attributes\Collects;
use Illuminate\Http\Resources\Json\ResourceCollection;

#[Collects(Member::class)]
class UserCollection extends ResourceCollection
{
    // ...
}
```

<a id="writing-resources"></a>
## Recursos de escritura

> **Nota:**
> Si no ha leído la [descripción general del concepto](#concept-overview), le recomendamos encarecidamente que lo haga antes de continuar con esta documentación.

Los recursos solo necesitan transformar un modelo determinado en una matriz. Entonces, cada recurso contiene un método `toArray` que traduce los atributos de su modelo en una matriz compatible con API que puede ser devuelta desde las rutas o controladores de su aplicación:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
```

Una vez que se ha definido un recurso, se puede devolver directamente desde una ruta o controlador:

```php
use App\Models\User;

Route::get('/user/{id}', function (string $id) {
    return User::findOrFail($id)->toResource();
});
```

<a id="relationships"></a>
#### Relaciones

Si desea incluir recursos relacionados en su respuesta, puede agregarlos a la matriz devuelta por el método `toArray` de su recurso. En este ejemplo, usaremos el método `collection` del recurso `PostResource` para agregar las publicaciones del blog del usuario a la respuesta del recurso:

```php
use App\Http\Resources\PostResource;
use Illuminate\Http\Request;

/**
 * Transform the resource into an array.
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        'posts' => PostResource::collection($this->posts),
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
}
```

> **Nota:**
> Si desea incluir relaciones solo cuando ya se han cargado, consulte la documentación sobre [relaciones condicionales](#conditional-relationships).

<a id="writing-resource-collections"></a>
#### Colecciones de recursos

Mientras que los recursos transforman un modelo único en una matriz, las colecciones de recursos transforman una colección de modelos en una matriz. Sin embargo, no es absolutamente necesario definir una clase de colección de recursos para cada uno de sus modelos, ya que todas las colecciones de modelos de Eloquent proporcionan un método `toResourceCollection` para generar una colección de recursos "ad-hoc" sobre la marcha:

```php
use App\Models\User;

Route::get('/users', function () {
    return User::all()->toResourceCollection();
});
```

Sin embargo, si necesita personalizar los metadatos devueltos con la colección, es necesario definir su propia colección de recursos:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class UserCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection,
            'links' => [
                'self' => 'link-value',
            ],
        ];
    }
}
```

Al igual que los recursos singulares, las colecciones de recursos pueden devolverse directamente desde rutas o controladores:

```php
use App\Http\Resources\UserCollection;
use App\Models\User;

Route::get('/users', function () {
    return new UserCollection(User::all());
});
```

O, para mayor comodidad, puede utilizar el método `toResourceCollection` de la colección Eloquent, que utilizará convenciones marco para descubrir automáticamente la colección de recursos subyacente del modelo:

```php
return User::all()->toResourceCollection();
```

Al invocar el método `toResourceCollection`, Laravel intentará localizar una colección de recursos que coincida con el nombre del modelo y que tenga el sufijo `Collection` dentro del espacio de nombres `Http\Resources` más cercano al espacio de nombres del modelo.

<a id="data-wrapping"></a>
### Ajuste de datos

De forma predeterminada, su recurso más externo está incluido en una clave `data` cuando la respuesta del recurso se convierte a JSON. Así, por ejemplo, una respuesta típica de recopilación de recursos se parece a la siguiente:

```json
{
    "data": [
        {
            "id": 1,
            "name": "Eladio Schroeder Sr.",
            "email": "therese28@example.com"
        },
        {
            "id": 2,
            "name": "Liliana Mayert",
            "email": "evandervort@example.com"
        }
    ]
}
```

Si desea deshabilitar el ajuste del recurso más externo, debe invocar el método `withoutWrapping` en la clase base `Illuminate\Http\Resources\Json\JsonResource`. Normalmente, debe llamar a este método desde su `AppServiceProvider` u otro [proveedor de servicios](../providers/) que se carga en cada solicitud a su aplicación:

```php
<?php

namespace App\Providers;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // ...
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        JsonResource::withoutWrapping();
    }
}
```

> **Advertencia:**
> El método `withoutWrapping` solo afecta la respuesta más externa y no eliminará las claves `data` que agregue manualmente a sus propias colecciones de recursos.

<a id="wrapping-nested-resources"></a>
#### Envolviendo recursos anidados

Tiene total libertad para determinar cómo se envuelven las relaciones de sus recursos. Si desea que todas las colecciones de recursos estén empaquetadas en una clave `data`, independientemente de su anidamiento, debe definir una clase de colección de recursos para cada recurso y devolver la colección dentro de una clave `data`.

Quizás se pregunte si esto hará que su recurso más externo esté incluido en dos claves `data`. No te preocupes, Laravel nunca permitirá que tus recursos se doblen accidentalmente, por lo que no tienes que preocuparte por el nivel de anidamiento de la colección de recursos que estás transformando:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class CommentsCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return ['data' => $this->collection];
    }
}
```

<a id="data-wrapping-and-pagination"></a>
#### Ajuste y paginación de datos

Al devolver colecciones paginadas a través de una respuesta de recurso, Laravel envolverá los datos de su recurso en una clave `data` incluso si se ha llamado al método `withoutWrapping`. Esto se debe a que las respuestas paginadas siempre contienen claves `meta` y `links` con información sobre el estado del paginador:

```json
{
    "data": [
        {
            "id": 1,
            "name": "Eladio Schroeder Sr.",
            "email": "therese28@example.com"
        },
        {
            "id": 2,
            "name": "Liliana Mayert",
            "email": "evandervort@example.com"
        }
    ],
    "links":{
        "first": "http://example.com/users?page=1",
        "last": "http://example.com/users?page=1",
        "prev": null,
        "next": null
    },
    "meta":{
        "current_page": 1,
        "from": 1,
        "last_page": 1,
        "path": "http://example.com/users",
        "per_page": 15,
        "to": 10,
        "total": 10
    }
}
```

<a id="pagination"></a>
### Paginación

Puede pasar una instancia del paginador Laravel al método `collection` de un recurso o a una colección de recursos personalizada:

```php
use App\Http\Resources\UserCollection;
use App\Models\User;

Route::get('/users', function () {
    return new UserCollection(User::paginate());
});
```

O, para mayor comodidad, puede utilizar el método `toResourceCollection` del paginador, que utilizará convenciones marco para descubrir automáticamente la colección de recursos subyacente del modelo paginado:

```php
return User::paginate()->toResourceCollection();
```

Las respuestas paginadas siempre contienen claves `meta` y `links` con información sobre el estado del paginador:

```json
{
    "data": [
        {
            "id": 1,
            "name": "Eladio Schroeder Sr.",
            "email": "therese28@example.com"
        },
        {
            "id": 2,
            "name": "Liliana Mayert",
            "email": "evandervort@example.com"
        }
    ],
    "links":{
        "first": "http://example.com/users?page=1",
        "last": "http://example.com/users?page=1",
        "prev": null,
        "next": null
    },
    "meta":{
        "current_page": 1,
        "from": 1,
        "last_page": 1,
        "path": "http://example.com/users",
        "per_page": 15,
        "to": 10,
        "total": 10
    }
}
```

<a id="customizing-the-pagination-information"></a>
#### Personalización de la información de paginación

Si desea personalizar la información incluida en las claves `links` o `meta` de la respuesta de paginación, puede definir un método `paginationInformation` en el recurso. Este método recibirá los datos `$paginated` y el array de información `$default`, que es un array que contiene las claves `links` y `meta`:

```php
/**
 * Customize the pagination information for the resource.
 *
 * @param  \Illuminate\Http\Request  $request
 * @param  array  $paginated
 * @param  array  $default
 * @return array
 */
public function paginationInformation($request, $paginated, $default)
{
    $default['links']['custom'] = 'https://example.com';

    return $default;
}
```

<a id="conditional-attributes"></a>
### Atributos condicionales

A veces es posible que desee incluir solo un atributo en una respuesta de recurso si se cumple una condición determinada. Por ejemplo, es posible que desee incluir un valor únicamente si el usuario actual es un "administrador". Laravel proporciona una variedad de métodos de ayuda para ayudarle en esta situación. El método `when` se puede utilizar para agregar condicionalmente un atributo a una respuesta de recurso:

```php
/**
 * Transform the resource into an array.
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        'secret' => $this->when($request->user()->isAdmin(), 'secret-value'),
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
}
```

En este ejemplo, la clave `secret` solo se devolverá en la respuesta final del recurso si el método `isAdmin` del usuario autenticado devuelve `true`. Si el método devuelve `false`, la clave `secret` se eliminará de la respuesta del recurso antes de enviarla al cliente. El método `when` le permite definir expresivamente sus recursos sin recurrir a declaraciones condicionales al crear la matriz.

El método `when` también acepta una función anónima como segundo argumento, lo que le permite calcular el valor resultante solo si la condición dada es `true`:

```php
'secret' => $this->when($request->user()->isAdmin(), function () {
    return 'secret-value';
}),
```

El método `whenHas` se puede utilizar para incluir un atributo si realmente está presente en el modelo subyacente:

```php
'name' => $this->whenHas('name'),
```

Además, se puede utilizar el método `whenNotNull` para incluir un atributo en la respuesta del recurso si el atributo no es nulo:

```php
'name' => $this->whenNotNull($this->name),
```

<a id="merging-conditional-attributes"></a>
#### Fusionar atributos condicionales

A veces es posible que tenga varios atributos que solo deberían incluirse en la respuesta del recurso en función de la misma condición. En este caso, puede utilizar el método `mergeWhen` para incluir los atributos en la respuesta sólo cuando la condición dada es `true`:

```php
/**
 * Transform the resource into an array.
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        $this->mergeWhen($request->user()->isAdmin(), [
            'first-secret' => 'value',
            'second-secret' => 'value',
        ]),
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
}
```

Nuevamente, si la condición dada es `false`, estos atributos se eliminarán de la respuesta del recurso antes de enviarla al cliente.

> **Advertencia:**
> El método `mergeWhen` no debe usarse dentro de matrices que combinen claves numéricas y de cadena. Además, no debe usarse dentro de matrices con claves numéricas que no estén ordenadas secuencialmente.

<a id="conditional-relationships"></a>
### Relaciones condicionales

Además de cargar atributos condicionalmente, puede incluir relaciones condicionalmente en las respuestas de sus recursos en función de si la relación ya se ha cargado en el modelo. Esto permite que su controlador decida qué relaciones deben cargarse en el modelo y su recurso puede incluirlas fácilmente solo cuando realmente se hayan cargado. En última instancia, esto hace que sea más fácil evitar problemas de consultas "N+1" dentro de sus recursos.

El método `whenLoaded` se puede utilizar para cargar una relación de forma condicional. Para evitar cargar relaciones innecesariamente, este método acepta el nombre de la relación en lugar de la relación en sí:

```php
use App\Http\Resources\PostResource;

/**
 * Transform the resource into an array.
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        'posts' => PostResource::collection($this->whenLoaded('posts')),
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
}
```

En este ejemplo, si la relación no se ha cargado, la clave `posts` se eliminará de la respuesta del recurso antes de enviarla al cliente.

<a id="conditional-relationship-counts"></a>
#### La relación condicional cuenta

Además de incluir relaciones condicionalmente, puede incluir condicionalmente "recuentos" de relaciones en sus respuestas de recursos en función de si el recuento de relaciones se ha cargado en el modelo:

```php
new UserResource($user->loadCount('posts'));
```

El método `whenCounted` se puede utilizar para incluir condicionalmente el recuento de una relación en su respuesta de recurso. Este método evita incluir innecesariamente el atributo si el recuento de relaciones no está presente:

```php
/**
 * Transform the resource into an array.
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        'posts_count' => $this->whenCounted('posts'),
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
}
```

En este ejemplo, si no se ha cargado el recuento de la relación `posts`, la clave `posts_count` se eliminará de la respuesta del recurso antes de enviarla al cliente.

Otros tipos de agregados, como `avg`, `sum`, `min` y `max` también se pueden cargar condicionalmente utilizando el método `whenAggregated`:

```php
'words_avg' => $this->whenAggregated('posts', 'words', 'avg'),
'words_sum' => $this->whenAggregated('posts', 'words', 'sum'),
'words_min' => $this->whenAggregated('posts', 'words', 'min'),
'words_max' => $this->whenAggregated('posts', 'words', 'max'),
```

<a id="conditional-pivot-information"></a>
#### Información de pivote condicional

Además de incluir condicionalmente información de relaciones en sus respuestas de recursos, puede incluir condicionalmente datos de las tablas intermedias de relaciones de muchos a muchos utilizando el método `whenPivotLoaded`. El método `whenPivotLoaded` acepta el nombre de la tabla dinámica como primer argumento. El segundo argumento debe ser una función anónima que devuelva el valor que se devolverá si la información dinámica está disponible en el modelo:

```php
/**
 * Transform the resource into an array.
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'expires_at' => $this->whenPivotLoaded('role_user', function () {
            return $this->pivot->expires_at;
        }),
    ];
}
```

Si su relación utiliza un [modelo de tabla intermedia personalizada](../eloquent-relationships/#defining-custom-intermediate-table-models), puede pasar una instancia del modelo de tabla intermedia como primer argumento del método `whenPivotLoaded`:

```php
'expires_at' => $this->whenPivotLoaded(new Membership, function () {
    return $this->pivot->expires_at;
}),
```

Si su tabla intermedia utiliza un descriptor de acceso distinto de `pivot`, puede utilizar el método `whenPivotLoadedAs`:

```php
/**
 * Transform the resource into an array.
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'expires_at' => $this->whenPivotLoadedAs('subscription', 'role_user', function () {
            return $this->subscription->expires_at;
        }),
    ];
}
```

<a id="adding-meta-data"></a>
### Agregar metadatos

Algunos estándares de API JSON requieren la adición de metadatos a sus respuestas de recursos y colecciones de recursos. Esto a menudo incluye cosas como `links` para el recurso o recursos relacionados, o metadatos sobre el recurso en sí. Si necesita devolver metadatos adicionales sobre un recurso, inclúyalos en su método `toArray`. Por ejemplo, podría incluir información `links` al transformar una colección de recursos:

```php
/**
 * Transform the resource into an array.
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
{
    return [
        'data' => $this->collection,
        'links' => [
            'self' => 'link-value',
        ],
    ];
}
```

Al devolver metadatos adicionales de sus recursos, nunca tendrá que preocuparse por anular accidentalmente las claves `links` o `meta` que Laravel agrega automáticamente al devolver respuestas paginadas. Cualquier `links` adicional que defina se fusionará con los enlaces proporcionados por el paginador.

<a id="top-level-meta-data"></a>
#### Metadatos de nivel superior

A veces es posible que desee incluir solo ciertos metadatos con una respuesta de recurso si el recurso es el recurso más externo que se devuelve. Normalmente, esto incluye metainformación sobre la respuesta en su conjunto. Para definir estos metadatos, agregue un método `with` a su clase de recurso. Este método debe devolver una matriz de metadatos que se incluirán con la respuesta del recurso solo cuando el recurso sea el recurso más externo que se está transformando:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class UserCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return parent::toArray($request);
    }

    /**
     * Get additional data that should be returned with the resource array.
     *
     * @return array<string, mixed>
     */
    public function with(Request $request): array
    {
        return [
            'meta' => [
                'key' => 'value',
            ],
        ];
    }
}
```

<a id="adding-meta-data-when-constructing-resources"></a>
#### Agregar metadatos al construir recursos

También puede agregar datos de nivel superior al construir instancias de recursos en su ruta o controlador. El método `additional`, que está disponible en todos los recursos, acepta una serie de datos que deben agregarse a la respuesta del recurso:

```php
return User::all()
    ->load('roles')
    ->toResourceCollection()
    ->additional(['meta' => [
        'key' => 'value',
    ]]);
```

<a id="jsonapi-resources"></a>
## JSON: Recursos API

Laravel se entrega con `JsonApiResource`, una clase de recurso que produce respuestas que cumplen con la especificación [JSON:API](https://jsonapi.org/). Extiende la clase estándar `JsonResource` y maneja automáticamente la estructura de objetos de recursos, las relaciones, los conjuntos de campos dispersos, las inclusiones, la evaluación diferida de atributos y establece el encabezado `Content-Type` en `application/vnd.api+json`.

> **Nota:**
> Los recursos JSON:API de Laravel manejan la serialización de sus respuestas. Si también necesita analizar los parámetros de consulta JSON:API entrantes, como filtros y clasificaciones, [Laravel Query Builder](https://spatie.be/docs/laravel-query-builder) de Spapatie es un excelente paquete complementario.

<a id="generating-jsonapi-resources"></a>
### Generando JSON: Recursos API

Para generar un recurso JSON:API, utilice el comando `make:resource` Artisan con el indicador `--json-api`:

```shell
php artisan make:resource PostResource --json-api
```

La clase generada ampliará `Illuminate\Http\Resources\JsonApi\JsonApiResource` e incluirá las propiedades `$attributes` y `$relationships` para que usted las defina:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\JsonApi\JsonApiResource;

class PostResource extends JsonApiResource
{
    /**
     * The resource's attributes.
     */
    public $attributes = [
        // ...
    ];

    /**
     * The resource's relationships.
     */
    public $relationships = [
        // ...
    ];
}
```

JSON: los recursos API pueden ser devueltos desde rutas y controladores al igual que los recursos estándar:

```php
use App\Http\Resources\PostResource;
use App\Models\Post;

Route::get('/api/posts/{post}', function (Post $post) {
    return new PostResource($post);
});
```

O, para mayor comodidad, puede utilizar el método `toResource` del modelo:

```php
Route::get('/api/posts/{post}', function (Post $post) {
    return $post->toResource();
});
```

Esto producirá una respuesta compatible con JSON:API:

```json
{
    "data": {
        "id": "1",
        "type": "posts",
        "attributes": {
            "title": "Hello World",
            "body": "This is my first post."
        }
    }
}
```

Para devolver una colección de recursos JSON:API, utilice el método `collection` o el método práctico `toResourceCollection`:

```php
return PostResource::collection(Post::all());

return Post::all()->toResourceCollection();
```

<a id="defining-jsonapi-attributes"></a>
### Definición de atributos

Hay dos formas de definir qué atributos se incluyen en su recurso JSON:API.

El método más sencillo es definir una propiedad `$attributes` en su recurso. Puede enumerar nombres de atributos como valores, que se leerán directamente desde el modelo subyacente:

```php
public $attributes = [
    'title',
    'body',
    'created_at',
];
```

Si un atributo es costoso de calcular, puede devolverlo desde `toAttributes` como función anónima, de modo que solo se evalúe cuando el atributo sea realmente necesario en la respuesta.

O, para tener control total sobre los atributos del recurso, puede anular el método `toAttributes` en el recurso:

```php
/**
 * Get the resource's attributes.
 *
 * @return array<string, mixed>
 */
public function toAttributes(Request $request): array
{
    return [
        'title' => $this->title,
        'body' => $this->body,
        'is_published' => fn () => $this->published_at !== null,
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
}
```

<a id="defining-jsonapi-relationships"></a>
### Definición de relaciones

Los recursos JSON:API admiten la definición de relaciones que siguen la especificación JSON:API. Las relaciones solo se serializan cuando el cliente lo solicita a través del parámetro de consulta `include`.

#### La propiedad `$relationships`

Puede definir las relaciones incluibles de su recurso a través de la propiedad `$relationships` en su recurso:

```php
public $relationships = [
    'author',
    'comments',
];
```

Al incluir el nombre de una relación como valor, Laravel resolverá la relación Eloquent correspondiente y descubrirá automáticamente la clase de recurso adecuada. Si necesita especificar la clase de recurso explícitamente, puede definir la relación como un par clave/clase:

```php
use App\Http\Resources\UserResource;

public $relationships = [
    'author' => UserResource::class,
    'comments',
];
```

Alternativamente, puede anular el método `toRelationships` en el recurso:

```php
/**
 * Get the resource's relationships.
 */
public function toRelationships(Request $request): array
{
    return [
        'author' => UserResource::class,
        'comments' => fn () => CommentResource::collection(
            $request->user()->is($this->resource)
                ? $this->comments
                : $this->comments->where('is_public', true),
        ),
    ];
}
```

El uso de funciones anónimas le brinda más control sobre la carga útil de la relación y, al mismo tiempo, solo resuelve la relación cuando el cliente lo solicita.

#### Incluyendo relaciones

Los clientes pueden solicitar recursos relacionados utilizando el parámetro de consulta `include`:

```
GET /api/posts/1?include=author,comments
```

Esto produce una respuesta con objetos de identificador de recursos en la clave `relationships` y objetos de recursos completos en la matriz `included` de nivel superior:

```json
{
    "data": {
        "id": "1",
        "type": "posts",
        "attributes": {
            "title": "Hello World"
        },
        "relationships": {
            "author": {
                "data": {
                    "id": "1",
                    "type": "users"
                }
            },
            "comments": {
                "data": [
                    {
                        "id": "1",
                        "type": "comments"
                    }
                ]
            }
        }
    },
    "included": [
        {
            "id": "1",
            "type": "users",
            "attributes": {
                "name": "Taylor Otwell"
            }
        },
        {
            "id": "1",
            "type": "comments",
            "attributes": {
                "body": "Great post!"
            }
        }
    ]
}
```

Las relaciones anidadas se pueden incluir utilizando notación de puntos:

```
GET /api/posts/1?include=comments.author
```

<a id="jsonapi-relationship-depth"></a>
#### Profundidad de la relación

De forma predeterminada, las inclusiones de relaciones anidadas están limitadas a una profundidad máxima. Puede personalizar este límite utilizando el método `maxRelationshipDepth`, normalmente en uno de los proveedores de servicios de su aplicación:

```php
use Illuminate\Http\Resources\JsonApi\JsonApiResource;

JsonApiResource::maxRelationshipDepth(3);
```

<a id="jsonapi-resource-type-and-id"></a>
### Tipo de recurso e ID

De forma predeterminada, el `type` del recurso se deriva del nombre de la clase de recurso. Por ejemplo, `PostResource` produce el tipo `posts` y `BlogPostResource` produce `blog_posts`. El `id` del recurso se resuelve a partir de la clave principal del modelo.

Si necesita personalizar estos valores, puede anular los métodos `toType` y `toId` en su recurso:

```php
/**
 * Get the resource's type.
 */
public function toType(Request $request): string
{
    return 'articles';
}

/**
 * Get the resource's ID.
 */
public function toId(Request $request): string
{
    return (string) $this->uuid;
}
```

Esto es particularmente útil cuando el tipo de un recurso debe diferir de su nombre de clase, como cuando un `AuthorResource` envuelve un modelo `User` y debe generar el tipo `authors`.

<a id="jsonapi-sparse-fieldsets-and-includes"></a>
### Conjuntos de campos dispersos e inclusiones

JSON: los recursos de API admiten [conjuntos de campos dispersos](https://jsonapi.org/format/#fetching-sparse-fieldsets), lo que permite a los clientes solicitar solo atributos específicos para cada tipo de recurso mediante el parámetro de consulta `fields`:

```
GET /api/posts?fields[posts]=title,created_at&fields[users]=name
```

Esto solo incluirá los atributos `title` y `created_at` para los recursos `posts` y el atributo `name` para los recursos `users`.

<a id="jsonapi-ignoring-query-string"></a>
#### Ignorando la cadena de consulta

Si desea deshabilitar el filtrado de conjuntos de campos dispersos para una respuesta de recurso determinada, puede llamar al método `ignoreFieldsAndIncludesInQueryString`:

```php
return $post->toResource()
    ->ignoreFieldsAndIncludesInQueryString();
```

<a id="jsonapi-including-previously-loaded-relationships"></a>
#### Incluyendo relaciones previamente cargadas

De forma predeterminada, las relaciones solo se incluyen en la respuesta cuando se solicita mediante el parámetro de consulta `include`. Si desea incluir todas las relaciones cargadas anteriormente independientemente de la cadena de consulta, puede llamar al método `includePreviouslyLoadedRelationships`:

```php
return $post->load('author', 'comments')
    ->toResource()
    ->includePreviouslyLoadedRelationships();
```

<a id="jsonapi-links-and-meta"></a>
### Enlaces y meta

Puede agregar enlaces y metainformación a sus objetos de recursos JSON:API anulando los métodos `toLinks` y `toMeta` en el recurso:

```php
/**
 * Get the resource's links.
 */
public function toLinks(Request $request): array
{
    return [
        'self' => route('api.posts.show', $this->resource),
    ];
}

/**
 * Get the resource's meta information.
 */
public function toMeta(Request $request): array
{
    return [
        'readable_created_at' => $this->created_at->diffForHumans(),
    ];
}
```

Esto agregará las claves `links` y `meta` al objeto de recurso en la respuesta:

```json
{
    "data": {
        "id": "1",
        "type": "posts",
        "attributes": {
            "title": "Hello World"
        },
        "links": {
            "self": "https://example.com/api/posts/1"
        },
        "meta": {
            "readable_created_at": "2 hours ago"
        }
    }
}
```

<a id="resource-responses"></a>
## Respuestas de recursos

Como ya has leído, los recursos pueden ser devueltos directamente desde rutas y controladores:

```php
use App\Models\User;

Route::get('/user/{id}', function (string $id) {
    return User::findOrFail($id)->toResource();
});
```

Sin embargo, a veces es posible que necesite personalizar la respuesta HTTP saliente antes de enviarla al cliente. Hay dos maneras de lograr esto. Primero, puede encadenar el método `response` al recurso. Este método devolverá una instancia `Illuminate\Http\JsonResponse`, lo que le brindará control total sobre los encabezados de la respuesta:

```php
use App\Http\Resources\UserResource;
use App\Models\User;

Route::get('/user', function () {
    return User::find(1)
        ->toResource()
        ->response()
        ->header('X-Value', 'True');
});
```

Alternativamente, puede definir un método `withResponse` dentro del propio recurso. Se llamará a este método cuando el recurso se devuelva como el recurso más externo en una respuesta:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
        ];
    }

    /**
     * Customize the outgoing response for the resource.
     */
    public function withResponse(Request $request, JsonResponse $response): void
    {
        $response->header('X-Value', 'True');
    }
}
```
