---
title: "Indicaciones"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Instalación](#installation)
- [Mensajes disponibles](#available-prompts)
    - [Texto](#text)
    - [Textarea](#textarea)
    - [Número](#number)
    - [Contraseña](#password)
    - [Confirmar](#confirm)
    - [Seleccione](#select)
    - [Selección múltiple](#multiselect)
    - [Sugerir](#suggest)
    - [Buscar](#search)
    - [Búsqueda múltiple](#multisearch)
    - [Pausa](#pause)
    - [Autocompletar](#autocomplete)
- [Transformación de entrada antes de la validación](#transforming-input-before-validation)
- [Formularios](#forms)
- [Mensajes informativos](#informational-messages)
- [Destacados](#callouts)
- [Tablas](#tables)
- [Spin](#spin)
- [Barra de progreso](#progress)
- [Tarea](#task)
- [Transmisión](#stream)
- [Título del terminal](#terminal-title)
- [Borrar el Terminal](#clear)
- [Consideraciones sobre terminales](#terminal-considerations)
- [Entornos no compatibles y alternativas](#fallbacks)
- [Prueba](#testing)

<a id="introduction"></a>
## Introducción

[Laravel Prompts](https://github.com/laravel/prompts) es un paquete PHP para agregar formularios hermosos y fáciles de usar a sus aplicaciones de línea de comandos, con características similares a las de un navegador que incluyen texto de marcador de posición y validación.

<img src="https://laravel.com/img/docs/prompts-example.png">

Laravel Prompts es perfecto para aceptar entradas del usuario en los [comandos de la consola Artisan](../artisan/#writing-commands), pero también se puede utilizar en cualquier proyecto PHP de línea de comandos.

> **Nota:**
> Laravel Prompts es compatible con macOS, Linux y Windows con WSL. Para obtener más información, consulte nuestra documentación sobre [entornos no compatibles y alternativas](#fallbacks).

<a id="installation"></a>
## Instalación

Laravel Prompts ya está incluido en la última versión de Laravel.

Laravel Prompts también se puede instalar en sus otros proyectos PHP utilizando el administrador de paquetes Composer:

```shell
composer require laravel/prompts
```

<a id="available-prompts"></a>
## Mensajes disponibles

<a id="text"></a>
### Texto

La función `text` le preguntará al usuario la pregunta dada, aceptará su entrada y luego la devolverá:

```php
use function Laravel\Prompts\text;

$name = text('What is your name?');
```

También puede incluir texto de marcador de posición, un valor predeterminado y una sugerencia informativa:

```php
$name = text(
    label: 'What is your name?',
    placeholder: 'E.g. Taylor Otwell',
    default: $user?->name,
    hint: 'This will be displayed on your profile.'
);
```

<a id="text-required"></a>
#### Valores requeridos

Si necesita ingresar un valor, puede pasar el argumento `required`:

```php
$name = text(
    label: 'What is your name?',
    required: true
);
```

Si desea personalizar el mensaje de validación, también puede pasar una cadena:

```php
$name = text(
    label: 'What is your name?',
    required: 'Your name is required.'
);
```

<a id="text-validation"></a>
#### Validación adicional

Finalmente, si desea realizar una lógica de validación adicional, puede pasar un cierre al argumento `validate`:

```php
$name = text(
    label: 'What is your name?',
    validate: fn (string $value) => match (true) {
        strlen($value) < 3 => 'The name must be at least 3 characters.',
        strlen($value) > 255 => 'The name must not exceed 255 characters.',
        default => null
    }
);
```

El cierre recibirá el valor que se ha ingresado y puede devolver un mensaje de error, o `null` si se pasa la validación.

Alternativamente, puede aprovechar el poder de [validator](../validation/). Para hacerlo, proporcione una matriz que contenga el nombre del atributo y las reglas de validación deseadas para el argumento `validate`:

```php
$name = text(
    label: 'What is your name?',
    validate: ['name' => 'required|max:255|unique:users']
);
```

<a id="textarea"></a>
### Área de texto

La función `textarea` le preguntará al usuario la pregunta dada, aceptará su entrada a través de un área de texto de varias líneas y luego la devolverá:

```php
use function Laravel\Prompts\textarea;

$story = textarea('Tell me a story.');
```

También puede incluir texto de marcador de posición, un valor predeterminado y una sugerencia informativa:

```php
$story = textarea(
    label: 'Tell me a story.',
    placeholder: 'This is a story about...',
    hint: 'This will be displayed on your profile.'
);
```

<a id="textarea-required"></a>
#### Valores requeridos

Si necesita ingresar un valor, puede pasar el argumento `required`:

```php
$story = textarea(
    label: 'Tell me a story.',
    required: true
);
```

Si desea personalizar el mensaje de validación, también puede pasar una cadena:

```php
$story = textarea(
    label: 'Tell me a story.',
    required: 'A story is required.'
);
```

<a id="textarea-validation"></a>
#### Validación adicional

Finalmente, si desea realizar una lógica de validación adicional, puede pasar un cierre al argumento `validate`:

```php
$story = textarea(
    label: 'Tell me a story.',
    validate: fn (string $value) => match (true) {
        strlen($value) < 250 => 'The story must be at least 250 characters.',
        strlen($value) > 10000 => 'The story must not exceed 10,000 characters.',
        default => null
    }
);
```

El cierre recibirá el valor que se ha ingresado y puede devolver un mensaje de error, o `null` si se pasa la validación.

Alternativamente, puede aprovechar el poder de [validator](../validation/). Para hacerlo, proporcione una matriz que contenga el nombre del atributo y las reglas de validación deseadas para el argumento `validate`:

```php
$story = textarea(
    label: 'Tell me a story.',
    validate: ['story' => 'required|max:10000']
);
```

<a id="number"></a>
### Número

La función `number` le preguntará al usuario la pregunta dada, aceptará su entrada numérica y luego la devolverá. La función `number` permite al usuario utilizar las teclas de flecha hacia arriba y hacia abajo para manipular el número:

```php
use function Laravel\Prompts\number;

$number = number('How many copies would you like?');
```

También puede incluir texto de marcador de posición, un valor predeterminado y una sugerencia informativa:

```php
$name = number(
    label: 'How many copies would you like?',
    placeholder: '5',
    default: 1,
    hint: 'This will be determine how many copies to create.'
);
```

<a id="number-required"></a>
#### Valores requeridos

Si necesita ingresar un valor, puede pasar el argumento `required`:

```php
$copies = number(
    label: 'How many copies would you like?',
    required: true
);
```

Si desea personalizar el mensaje de validación, también puede pasar una cadena:

```php
$copies = number(
    label: 'How many copies would you like?',
    required: 'A number of copies is required.'
);
```

<a id="number-validation"></a>
#### Validación adicional

Finalmente, si desea realizar una lógica de validación adicional, puede pasar un cierre al argumento `validate`:

```php
$copies = number(
    label: 'How many copies would you like?',
    validate: fn (?int $value) => match (true) {
        $value < 1 => 'At least one copy is required.',
        $value > 100 => 'You may not create more than 100 copies.',
        default => null
    }
);
```

El cierre recibirá el valor que se ha ingresado y puede devolver un mensaje de error, o `null` si se pasa la validación.

Alternativamente, puede aprovechar el poder de [validator](../validation/). Para hacerlo, proporcione una matriz que contenga el nombre del atributo y las reglas de validación deseadas para el argumento `validate`:

```php
$copies = number(
    label: 'How many copies would you like?',
    validate: ['copies' => 'required|integer|min:1|max:100']
);
```

<a id="password"></a>
### Contraseña

La función `password` es similar a la función `text`, pero la entrada del usuario estará enmascarada a medida que escribe en la consola. Esto es útil cuando se solicita información confidencial como contraseñas:

```php
use function Laravel\Prompts\password;

$password = password('What is your password?');
```

También puedes incluir texto de marcador de posición y una pista informativa:

```php
$password = password(
    label: 'What is your password?',
    placeholder: 'password',
    hint: 'Minimum 8 characters.'
);
```

<a id="password-required"></a>
#### Valores requeridos

Si necesita ingresar un valor, puede pasar el argumento `required`:

```php
$password = password(
    label: 'What is your password?',
    required: true
);
```

Si desea personalizar el mensaje de validación, también puede pasar una cadena:

```php
$password = password(
    label: 'What is your password?',
    required: 'The password is required.'
);
```

<a id="password-validation"></a>
#### Validación adicional

Finalmente, si desea realizar una lógica de validación adicional, puede pasar un cierre al argumento `validate`:

```php
$password = password(
    label: 'What is your password?',
    validate: fn (string $value) => match (true) {
        strlen($value) < 8 => 'The password must be at least 8 characters.',
        default => null
    }
);
```

El cierre recibirá el valor que se ha ingresado y puede devolver un mensaje de error, o `null` si se pasa la validación.

Alternativamente, puede aprovechar el poder de [validator](../validation/). Para hacerlo, proporcione una matriz que contenga el nombre del atributo y las reglas de validación deseadas para el argumento `validate`:

```php
$password = password(
    label: 'What is your password?',
    validate: ['password' => 'min:8']
);
```

<a id="confirm"></a>
### Confirmar

Si necesita pedirle al usuario una confirmación de "sí o no", puede utilizar la función `confirm`. Los usuarios pueden usar las teclas de flecha o presionar `y` o `n` para seleccionar su respuesta. Esta función devolverá `true` o `false`.

```php
use function Laravel\Prompts\confirm;

$confirmed = confirm('Do you accept the terms?');
```

También puede incluir un valor predeterminado, un texto personalizado para las etiquetas "Sí" y "No" y una sugerencia informativa:

```php
$confirmed = confirm(
    label: 'Do you accept the terms?',
    default: false,
    yes: 'I accept',
    no: 'I decline',
    hint: 'The terms must be accepted to continue.'
);
```

<a id="confirm-required"></a>
#### Requerir "Sí"

Si es necesario, puede solicitar a sus usuarios que seleccionen "Sí" pasando el argumento `required`:

```php
$confirmed = confirm(
    label: 'Do you accept the terms?',
    required: true
);
```

Si desea personalizar el mensaje de validación, también puede pasar una cadena:

```php
$confirmed = confirm(
    label: 'Do you accept the terms?',
    required: 'You must accept the terms to continue.'
);
```

<a id="select"></a>
### Seleccionar

Si necesita que el usuario seleccione entre un conjunto predefinido de opciones, puede usar la función `select`:

```php
use function Laravel\Prompts\select;

$role = select(
    label: 'What role should the user have?',
    options: ['Member', 'Contributor', 'Owner']
);
```

También puede especificar la opción predeterminada y una sugerencia informativa:

```php
$role = select(
    label: 'What role should the user have?',
    options: ['Member', 'Contributor', 'Owner'],
    default: 'Owner',
    hint: 'The role may be changed at any time.'
);
```

También puede pasar una matriz asociativa al argumento `options` para que se devuelva la clave seleccionada en lugar de su valor:

```php
$role = select(
    label: 'What role should the user have?',
    options: [
        'member' => 'Member',
        'contributor' => 'Contributor',
        'owner' => 'Owner',
    ],
    default: 'owner'
);
```

Se mostrarán hasta cinco opciones antes de que la lista comience a desplazarse. Puedes personalizar esto pasando el argumento `scroll`:

```php
$role = select(
    label: 'Which category would you like to assign?',
    options: Category::pluck('name', 'id'),
    scroll: 10
);
```

<a id="select-info"></a>
#### Información secundaria

El argumento `info` se puede utilizar para mostrar información adicional sobre la opción actualmente resaltada. Cuando se proporciona un cierre, recibirá el valor de la opción resaltada actualmente y debería devolver una cadena o `null`:

```php
$role = select(
    label: 'What role should the user have?',
    options: [
        'member' => 'Member',
        'contributor' => 'Contributor',
        'owner' => 'Owner',
    ],
    info: fn (string $value) => match ($value) {
        'member' => 'Can view and comment.',
        'contributor' => 'Can view, comment, and edit.',
        'owner' => 'Full access to all resources.',
        default => null,
    }
);
```

También puedes pasar una cadena estática al argumento `info` si la información no depende de la opción resaltada:

```php
$role = select(
    label: 'What role should the user have?',
    options: ['Member', 'Contributor', 'Owner'],
    info: 'The role may be changed at any time.'
);
```

<a id="select-validation"></a>
#### Validación adicional

A diferencia de otras funciones de solicitud, la función `select` no acepta el argumento `required` porque no es posible seleccionar nada. Sin embargo, puede pasar un cierre al argumento `validate` si necesita presentar una opción pero evitar que se seleccione:

```php
$role = select(
    label: 'What role should the user have?',
    options: [
        'member' => 'Member',
        'contributor' => 'Contributor',
        'owner' => 'Owner',
    ],
    validate: fn (string $value) =>
        $value === 'owner' && User::where('role', 'owner')->exists()
            ? 'An owner already exists.'
            : null
);
```

Si el argumento `options` es una matriz asociativa, entonces el cierre recibirá la clave seleccionada; de lo contrario, recibirá el valor seleccionado. El cierre puede devolver un mensaje de error, o `null` si se pasa la validación.

<a id="multiselect"></a>
### Selección múltiple

Si necesita que el usuario pueda seleccionar múltiples opciones, puede usar la función `multiselect`:

```php
use function Laravel\Prompts\multiselect;

$permissions = multiselect(
    label: 'What permissions should be assigned?',
    options: ['Read', 'Create', 'Update', 'Delete']
);
```

También puede especificar opciones predeterminadas y una sugerencia informativa:

```php
use function Laravel\Prompts\multiselect;

$permissions = multiselect(
    label: 'What permissions should be assigned?',
    options: ['Read', 'Create', 'Update', 'Delete'],
    default: ['Read', 'Create'],
    hint: 'Permissions may be updated at any time.'
);
```

También puede pasar una matriz asociativa al argumento `options` para devolver las claves de las opciones seleccionadas en lugar de sus valores:

```php
$permissions = multiselect(
    label: 'What permissions should be assigned?',
    options: [
        'read' => 'Read',
        'create' => 'Create',
        'update' => 'Update',
        'delete' => 'Delete',
    ],
    default: ['read', 'create']
);
```

Se mostrarán hasta cinco opciones antes de que la lista comience a desplazarse. Puedes personalizar esto pasando el argumento `scroll`:

```php
$categories = multiselect(
    label: 'What categories should be assigned?',
    options: Category::pluck('name', 'id'),
    scroll: 10
);
```

<a id="multiselect-info"></a>
#### Información secundaria

El argumento `info` se puede utilizar para mostrar información adicional sobre la opción actualmente resaltada. Cuando se proporciona un cierre, recibirá el valor de la opción resaltada actualmente y debería devolver una cadena o `null`:

```php
$permissions = multiselect(
    label: 'What permissions should be assigned?',
    options: [
        'read' => 'Read',
        'create' => 'Create',
        'update' => 'Update',
        'delete' => 'Delete',
    ],
    info: fn (string $value) => match ($value) {
        'read' => 'View resources and their properties.',
        'create' => 'Create new resources.',
        'update' => 'Modify existing resources.',
        'delete' => 'Permanently remove resources.',
        default => null,
    }
);
```

<a id="multiselect-required"></a>
#### Requerir un valor

De forma predeterminada, el usuario puede seleccionar cero o más opciones. Puede pasar el argumento `required` para aplicar una o más opciones:

```php
$categories = multiselect(
    label: 'What categories should be assigned?',
    options: Category::pluck('name', 'id'),
    required: true
);
```

Si desea personalizar el mensaje de validación, puede proporcionar una cadena al argumento `required`:

```php
$categories = multiselect(
    label: 'What categories should be assigned?',
    options: Category::pluck('name', 'id'),
    required: 'You must select at least one category'
);
```

<a id="multiselect-validation"></a>
#### Validación adicional

Puede pasar un cierre al argumento `validate` si necesita presentar una opción pero evitar que se seleccione:

```php
$permissions = multiselect(
    label: 'What permissions should the user have?',
    options: [
        'read' => 'Read',
        'create' => 'Create',
        'update' => 'Update',
        'delete' => 'Delete',
    ],
    validate: fn (array $values) => ! in_array('read', $values)
        ? 'All users require the read permission.'
        : null
);
```

Si el argumento `options` es una matriz asociativa, entonces el cierre recibirá las claves seleccionadas; de lo contrario, recibirá los valores seleccionados. El cierre puede devolver un mensaje de error, o `null` si se pasa la validación.

<a id="suggest"></a>
### Sugerir

La función `suggest` se puede utilizar para proporcionar autocompletado de posibles opciones. El usuario aún puede proporcionar cualquier respuesta, independientemente de las sugerencias de autocompletar:

```php
use function Laravel\Prompts\suggest;

$name = suggest('What is your name?', ['Taylor', 'Dayle']);
```

Alternativamente, puede pasar un cierre como segundo argumento a la función `suggest`. El cierre se llamará cada vez que el usuario escriba un carácter de entrada. El cierre debe aceptar un parámetro de cadena que contenga la entrada del usuario hasta el momento y devolver una serie de opciones para autocompletar:

```php
$name = suggest(
    label: 'What is your name?',
    options: fn ($value) => collect(['Taylor', 'Dayle'])
        ->filter(fn ($name) => Str::contains($name, $value, ignoreCase: true))
);
```

También puede incluir texto de marcador de posición, un valor predeterminado y una sugerencia informativa:

```php
$name = suggest(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle'],
    placeholder: 'E.g. Taylor',
    default: $user?->name,
    hint: 'This will be displayed on your profile.'
);
```

<a id="suggest-info"></a>
#### Información secundaria

El argumento `info` se puede utilizar para mostrar información adicional sobre la opción actualmente resaltada. Cuando se proporciona un cierre, recibirá el valor de la opción resaltada actualmente y debería devolver una cadena o `null`:

```php
$name = suggest(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle'],
    info: fn (string $value) => match ($value) {
        'Taylor' => 'Administrator',
        'Dayle' => 'Contributor',
        default => null,
    }
);
```

<a id="suggest-required"></a>
#### Valores requeridos

Si necesita ingresar un valor, puede pasar el argumento `required`:

```php
$name = suggest(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle'],
    required: true
);
```

Si desea personalizar el mensaje de validación, también puede pasar una cadena:

```php
$name = suggest(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle'],
    required: 'Your name is required.'
);
```

<a id="suggest-validation"></a>
#### Validación adicional

Finalmente, si desea realizar una lógica de validación adicional, puede pasar un cierre al argumento `validate`:

```php
$name = suggest(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle'],
    validate: fn (string $value) => match (true) {
        strlen($value) < 3 => 'The name must be at least 3 characters.',
        strlen($value) > 255 => 'The name must not exceed 255 characters.',
        default => null
    }
);
```

El cierre recibirá el valor que se ha ingresado y puede devolver un mensaje de error, o `null` si se pasa la validación.

Alternativamente, puede aprovechar el poder de [validator](../validation/). Para hacerlo, proporcione una matriz que contenga el nombre del atributo y las reglas de validación deseadas para el argumento `validate`:

```php
$name = suggest(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle'],
    validate: ['name' => 'required|min:3|max:255']
);
```

<a id="search"></a>
### Buscar

Si tiene muchas opciones para que el usuario seleccione, la función `search` le permite escribir una consulta de búsqueda para filtrar los resultados antes de usar las teclas de flecha para seleccionar una opción:

```php
use function Laravel\Prompts\search;

$id = search(
    label: 'Search for the user that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : []
);
```

El cierre recibirá el texto que ha escrito el usuario hasta el momento y debe devolver una serie de opciones. Si devuelve una matriz asociativa, se devolverá la clave de la opción seleccionada; de lo contrario, se devolverá su valor.

Al filtrar una matriz donde desea devolver el valor, debe usar la función `array_values` o el método Colección `values` para asegurarse de que la matriz no se vuelva asociativa:

```php
$names = collect(['Taylor', 'Abigail']);

$selected = search(
    label: 'Search for the user that should receive the mail',
    options: fn (string $value) => $names
        ->filter(fn ($name) => Str::contains($name, $value, ignoreCase: true))
        ->values()
        ->all(),
);
```

También puedes incluir texto de marcador de posición y una pista informativa:

```php
$id = search(
    label: 'Search for the user that should receive the mail',
    placeholder: 'E.g. Taylor Otwell',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    hint: 'The user will receive an email immediately.'
);
```

Se mostrarán hasta cinco opciones antes de que la lista comience a desplazarse. Puedes personalizar esto pasando el argumento `scroll`:

```php
$id = search(
    label: 'Search for the user that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    scroll: 10
);
```

<a id="search-info"></a>
#### Información secundaria

El argumento `info` se puede utilizar para mostrar información adicional sobre la opción actualmente resaltada. Cuando se proporciona un cierre, recibirá el valor de la opción resaltada actualmente y debería devolver una cadena o `null`:

```php
$id = search(
    label: 'Search for the user that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    info: fn (int $userId) => User::find($userId)?->email
);
```

<a id="search-validation"></a>
#### Validación adicional

Si desea realizar una lógica de validación adicional, puede pasar un cierre al argumento `validate`:

```php
$id = search(
    label: 'Search for the user that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    validate: function (int|string $value) {
        $user = User::findOrFail($value);

        if ($user->opted_out) {
            return 'This user has opted-out of receiving mail.';
        }
    }
);
```

Si el cierre `options` devuelve una matriz asociativa, entonces el cierre recibirá la clave seleccionada; de lo contrario, recibirá el valor seleccionado. El cierre puede devolver un mensaje de error, o `null` si se pasa la validación.

<a id="multisearch"></a>
### Búsqueda múltiple

Si tiene muchas opciones de búsqueda y necesita que el usuario pueda seleccionar varios elementos, la función `multisearch` le permite al usuario escribir una consulta de búsqueda para filtrar los resultados antes de usar las teclas de flecha y la barra espaciadora para seleccionar opciones:

```php
use function Laravel\Prompts\multisearch;

$ids = multisearch(
    'Search for users who should receive the mail',
    fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : []
);
```

El cierre recibirá el texto que ha escrito el usuario hasta el momento y debe devolver una serie de opciones. Si devuelve una matriz asociativa, se devolverán las claves de las opciones seleccionadas; de lo contrario, se devolverán sus valores.

Al filtrar una matriz donde desea devolver el valor, debe usar la función `array_values` o el método Colección `values` para asegurarse de que la matriz no se vuelva asociativa:

```php
$names = collect(['Taylor', 'Abigail']);

$selected = multisearch(
    label: 'Search for users who should receive the mail',
    options: fn (string $value) => $names
        ->filter(fn ($name) => Str::contains($name, $value, ignoreCase: true))
        ->values()
        ->all(),
);
```

También puedes incluir texto de marcador de posición y una pista informativa:

```php
$ids = multisearch(
    label: 'Search for users who should receive the mail',
    placeholder: 'E.g. Taylor Otwell',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    hint: 'The user will receive an email immediately.'
);
```

Se mostrarán hasta cinco opciones antes de que la lista comience a desplazarse. Puede personalizar esto proporcionando el argumento `scroll`:

```php
$ids = multisearch(
    label: 'Search for the users that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    scroll: 10
);
```

<a id="multisearch-info"></a>
#### Información secundaria

El argumento `info` se puede utilizar para mostrar información adicional sobre la opción actualmente resaltada. Cuando se proporciona un cierre, recibirá el valor de la opción resaltada actualmente y debería devolver una cadena o `null`:

```php
$ids = multisearch(
    label: 'Search for the users that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    info: fn (int $userId) => User::find($userId)?->email
);
```

<a id="multisearch-required"></a>
#### Requerir un valor

De forma predeterminada, el usuario puede seleccionar cero o más opciones. Puede pasar el argumento `required` para aplicar una o más opciones:

```php
$ids = multisearch(
    label: 'Search for the users that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    required: true
);
```

Si desea personalizar el mensaje de validación, también puede proporcionar una cadena al argumento `required`:

```php
$ids = multisearch(
    label: 'Search for the users that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    required: 'You must select at least one user.'
);
```

<a id="multisearch-validation"></a>
#### Validación adicional

Si desea realizar una lógica de validación adicional, puede pasar un cierre al argumento `validate`:

```php
$ids = multisearch(
    label: 'Search for the users that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    validate: function (array $values) {
        $optedOut = User::whereLike('name', '%a%')->findMany($values);

        if ($optedOut->isNotEmpty()) {
            return $optedOut->pluck('name')->join(', ', ', and ').' have opted out.';
        }
    }
);
```

Si el cierre `options` devuelve una matriz asociativa, entonces el cierre recibirá las claves seleccionadas; de lo contrario, recibirá los valores seleccionados. El cierre puede devolver un mensaje de error, o `null` si se pasa la validación.

<a id="pause"></a>
### Pausa

La función `pause` se puede utilizar para mostrar texto informativo al usuario y esperar a que confirme su deseo de continuar presionando la tecla Enter / Return:

```php
use function Laravel\Prompts\pause;

pause('Press ENTER to continue.');
```

<a id="autocomplete"></a>
### Autocompletar

La función `autocomplete` se puede utilizar para proporcionar autocompletado en línea para posibles opciones. A medida que el usuario escribe, las sugerencias que coincidan con su entrada aparecerán como texto fantasma que se puede aceptar presionando `Tab` o la tecla de flecha derecha:

```php
use function Laravel\Prompts\autocomplete;

$name = autocomplete(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle', 'Jess', 'Nuno', 'Tim']
);
```

También puede incluir texto de marcador de posición, un valor predeterminado y una sugerencia informativa:

```php
$name = autocomplete(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle', 'Jess', 'Nuno', 'Tim'],
    placeholder: 'E.g. Taylor',
    default: $user?->name,
    hint: 'Use tab to accept, up/down to cycle.'
);
```

<a id="autocomplete-closure"></a>
#### Opciones dinámicas

También puede pasar un cierre para generar opciones dinámicamente según la entrada del usuario. El cierre se llamará cada vez que el usuario escriba un carácter y debería devolver una serie de opciones para autocompletar:

```php
$file = autocomplete(
    label: 'Which file?',
    options: fn (string $value) => collect($files)
        ->filter(fn ($file) => str_starts_with(strtolower($file), strtolower($value)))
        ->values()
        ->all(),
);
```

<a id="autocomplete-required"></a>
#### Valores requeridos

Si necesita ingresar un valor, puede pasar el argumento `required`:

```php
$name = autocomplete(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle', 'Jess', 'Nuno', 'Tim'],
    required: true
);
```

Si desea personalizar el mensaje de validación, también puede pasar una cadena:

```php
$name = autocomplete(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle', 'Jess', 'Nuno', 'Tim'],
    required: 'Your name is required.'
);
```

<a id="autocomplete-validation"></a>
#### Validación adicional

Finalmente, si desea realizar una lógica de validación adicional, puede pasar un cierre al argumento `validate`:

```php
$name = autocomplete(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle', 'Jess', 'Nuno', 'Tim'],
    validate: fn (string $value) => match (true) {
        strlen($value) < 3 => 'The name must be at least 3 characters.',
        strlen($value) > 255 => 'The name must not exceed 255 characters.',
        default => null
    }
);
```

El cierre recibirá el valor que se ha ingresado y puede devolver un mensaje de error, o `null` si se pasa la validación.

<a id="transforming-input-before-validation"></a>
## Transformar la entrada antes de la validación

A veces es posible que desee transformar la entrada del mensaje antes de que se realice la validación. Por ejemplo, es posible que desee eliminar espacios en blanco de cualquier cadena proporcionada. Para lograr esto, muchas de las funciones de solicitud proporcionan un argumento `transform`, que acepta un cierre:

```php
$name = text(
    label: 'What is your name?',
    transform: fn (string $value) => trim($value),
    validate: fn (string $value) => match (true) {
        strlen($value) < 3 => 'The name must be at least 3 characters.',
        strlen($value) > 255 => 'The name must not exceed 255 characters.',
        default => null
    }
);
```

<a id="forms"></a>
## Formularios

A menudo, aparecerán varios mensajes en secuencia para recopilar información antes de realizar acciones adicionales. Puede utilizar la función `form` para crear un conjunto agrupado de mensajes para que el usuario los complete:

```php
use function Laravel\Prompts\form;

$responses = form()
    ->text('What is your name?', required: true)
    ->password('What is your password?', validate: ['password' => 'min:8'])
    ->confirm('Do you accept the terms?')
    ->submit();
```

El método `submit` devolverá una matriz indexada numéricamente que contiene todas las respuestas de las solicitudes del formulario. Sin embargo, puede proporcionar un nombre para cada mensaje mediante el argumento `name`. Cuando se proporciona un nombre, se puede acceder a la respuesta del mensaje nombrado a través de ese nombre:

```php
use App\Models\User;
use function Laravel\Prompts\form;

$responses = form()
    ->text('What is your name?', required: true, name: 'name')
    ->password(
        label: 'What is your password?',
        validate: ['password' => 'min:8'],
        name: 'password'
    )
    ->confirm('Do you accept the terms?')
    ->submit();

User::create([
    'name' => $responses['name'],
    'password' => $responses['password'],
]);
```

El principal beneficio de usar la función `form` es la capacidad del usuario de regresar a mensajes anteriores en el formulario usando `CTRL + U`. Esto permite al usuario corregir errores o modificar selecciones sin necesidad de cancelar y reiniciar todo el formulario.

Si necesita un control más granular sobre un mensaje en un formulario, puede invocar el método `add` en lugar de llamar directamente a una de las funciones del mensaje. Al método `add` se le pasan todas las respuestas anteriores proporcionadas por el usuario:

```php
use function Laravel\Prompts\form;
use function Laravel\Prompts\outro;
use function Laravel\Prompts\text;

$responses = form()
    ->text('What is your name?', required: true, name: 'name')
    ->add(function ($responses) {
        return text("How old are you, {$responses['name']}?");
    }, name: 'age')
    ->submit();

outro("Your name is {$responses['name']} and you are {$responses['age']} years old.");
```

<a id="informational-messages"></a>
## Mensajes informativos

Las funciones `note`, `info`, `warning`, `error` y `alert` se pueden utilizar para mostrar mensajes informativos:

```php
use function Laravel\Prompts\info;

info('Package installed successfully.');
```

<a id="callouts"></a>
## Llamadas

La función `callout` muestra un mensaje en cuadro con una etiqueta y contenido. Las notas son útiles para mostrar información importante que debe destacarse, como resúmenes de implementación, detalles de errores o actualizaciones de estado:

```php
use function Laravel\Prompts\callout;

callout(
    label: 'Environment Configured',
    content: 'Your application is running in production mode with 4 workers.',
);
```

Puede pasar `warning` o `error` como argumento `type` para cambiar el estilo visual de la llamada:

```php
callout(
    label: 'Deprecation Notice',
    content: 'The `--prefer-stable` flag will be removed in v4.0. Use `--stability=stable` instead.',
    type: 'warning',
);

callout(
    label: 'Database Connection Failed',
    content: 'Could not connect to MySQL on 127.0.0.1:3306.',
    type: 'error',
);
```

El argumento `info` agrega una línea de pie de página a la leyenda, lo cual es útil para mostrar metadatos como ID o marcas de tiempo:

```php
callout(
    label: 'Deployment Summary',
    content: 'Your application was deployed to production.',
    info: 'deploy-id: d4f8a2c',
);
```

<a id="callout-rich-content"></a>
#### Contenido enriquecido

En lugar de pasar una cadena, puede pasar una serie de cadenas y elementos para crear llamadas ricas y estructuradas. La clase `Element` proporciona métodos de fábrica para crear encabezados, listas con viñetas, listas numeradas, listas de valores-clave y enlaces:

```php
use Laravel\Prompts\Elements\Element;

use function Laravel\Prompts\callout;

callout('Deployment Summary', [
    'Your application was deployed to production at 2024-03-15 14:32 UTC.',
    Element::heading('What Changed'),
    Element::bulletedList([
        'Migrated 3 pending database migrations',
        'Cleared and rebuilt route cache',
        'Restarted 4 queue workers',
    ]),
    Element::heading('Next Steps'),
    Element::numberedList([
        'Verify the health check endpoint at /up',
        'Monitor error rates for the next 15 minutes',
        'Confirm background jobs are processing',
    ]),
]);
```

También puede utilizar `Element::keyValueList` para mostrar datos etiquetados:

```php
callout('Database Connection Failed', [
    'Could not connect to the database server.',
    Element::keyValueList([
        'Host' => '127.0.0.1',
        'Port' => '3306',
        'Database' => 'forge',
        'Status' => 'Connection refused',
    ]),
], type: 'error');
```

El método `Element::link` crea un hipervínculo en el que se puede hacer clic en terminales que admiten [OSC 8](https://gist.github.com/egmontkob/eb114294efbcd5adb1944c9f3cb5feda). Puedes proporcionar una URL sola o una URL con una etiqueta personalizada:

```php
callout('Server Health Check', [
    'Multiple services are reporting degraded performance.',
    Element::heading('Affected Services'),
    'Look here: '.Element::link('https://example.com/health', 'Health Dashboard'),
    Element::link('https://example.com/health'),
]);
```

Si no se proporciona ninguna etiqueta, la propia URL se mostrará como texto del enlace.

<a id="tables"></a>
## Tablas

La función `table` facilita la visualización de varias filas y columnas de datos. Todo lo que necesitas hacer es proporcionar los nombres de las columnas y los datos de la tabla:

```php
use function Laravel\Prompts\table;

table(
    headers: ['Name', 'Email'],
    rows: User::all(['name', 'email'])->toArray()
);
```

<a id="spin"></a>
## Girar

La función `spin` muestra una rueda giratoria junto con un mensaje opcional mientras ejecuta una devolución de llamada específica. Sirve para indicar procesos en curso y devuelve los resultados de la devolución de llamada al finalizar:

```php
use function Laravel\Prompts\spin;

$response = spin(
    callback: fn () => Http::get('http://example.com'),
    message: 'Fetching response...'
);
```

> **Advertencia:**
> La función `spin` requiere la extensión PHP [PCNTL](https://www.php.net/manual/en/book.pcntl.php) para animar la ruleta. Cuando esta extensión no esté disponible, aparecerá una versión estática del control giratorio.

<a id="progress"></a>
## Barras de progreso

Para tareas de larga duración, puede resultar útil mostrar una barra de progreso que informe a los usuarios qué tan completa está la tarea. Usando la función `progress`, Laravel mostrará una barra de progreso y avanzará su progreso para cada iteración sobre un valor iterable dado:

```php
use function Laravel\Prompts\progress;

$users = progress(
    label: 'Updating users',
    steps: User::all(),
    callback: fn ($user) => $this->performTask($user)
);
```

La función `progress` actúa como una función de mapa y devolverá una matriz que contiene el valor de retorno de cada iteración de su devolución de llamada.

La devolución de llamada también puede aceptar la instancia `Laravel\Prompts\Progress`, lo que le permite modificar la etiqueta y la sugerencia en cada iteración:

```php
$users = progress(
    label: 'Updating users',
    steps: User::all(),
    callback: function ($user, $progress) {
        $progress
            ->label("Updating {$user->name}")
            ->hint("Created on {$user->created_at}");

        return $this->performTask($user);
    },
    hint: 'This may take some time.'
);
```

A veces, es posible que necesites más control manual sobre cómo avanza una barra de progreso. Primero, defina el número total de pasos que recorrerá el proceso. Luego, avance la barra de progreso mediante el método `advance` después de procesar cada elemento:

```php
$progress = progress(label: 'Updating users', steps: 10);

$users = User::all();

$progress->start();

foreach ($users as $user) {
    $this->performTask($user);

    $progress->advance();
}

$progress->finish();
```

<a id="task"></a>
## Tarea

La función `task` muestra una tarea etiquetada con una rueda giratoria y un área de salida en vivo que se desplaza mientras se ejecuta una devolución de llamada determinada. Es ideal para envolver procesos de larga duración, como la instalación de dependencias o scripts de implementación, proporcionando visibilidad en tiempo real de lo que está sucediendo:

```php
use function Laravel\Prompts\task;

task(
    label: 'Installing dependencies',
    callback: function ($logger) {
        // Long-running process...
    }
);
```

La devolución de llamada recibe una instancia `Logger` que puede usar para mostrar líneas de registro, mensajes de estado y texto transmitido en el área de salida de la tarea.

> **Advertencia:**
> La función `task` requiere la extensión PHP [PCNTL](https://www.php.net/manual/en/book.pcntl.php) para animar la ruleta. Cuando esta extensión no esté disponible, aparecerá una versión estática de la tarea.

<a id="task-logging"></a>
#### Líneas de registro

El método `line` escribe una única línea de registro en el área de salida de desplazamiento de la tarea:

```php
task(
    label: 'Installing dependencies',
    callback: function ($logger) {
        $logger->line('Resolving packages...');
        // ...
        $logger->line('Downloading laravel/framework');
        // ...
    }
);
```

<a id="task-status-messages"></a>
#### Mensajes de estado

Puede utilizar los métodos `success`, `warning` y `error` para mostrar mensajes de estado. Estos aparecen como mensajes estables y resaltados encima del área de registro de desplazamiento:

```php
task(
    label: 'Deploying application',
    callback: function ($logger) {
        $logger->line('Pulling latest changes...');
        // ...
        $logger->success('Changes pulled!');

        $logger->line('Running migrations...');
        // ...
        $logger->warning('No new migrations to run.');

        $logger->line('Clearing cache...');
        // ...
        $logger->success('Cache cleared!');
    }
);
```

<a id="task-label"></a>
#### Actualizando la etiqueta

El método `label` le permite actualizar la etiqueta de la tarea mientras se ejecuta:

```php
task(
    label: 'Starting deployment...',
    callback: function ($logger) {
        $logger->label('Pulling latest changes...');
        // ...
        $logger->label('Running migrations...');
        // ...
        $logger->label('Clearing cache...');
        // ...
    }
);
```

<a id="task-sub-label"></a>
#### Mostrar una subetiqueta

El método `subLabel` muestra una línea tenue debajo de la etiqueta principal de la tarea, lo que es útil para comunicar estados efímeros, como el paso actualmente en progreso. Pase una cadena vacía para borrar la subetiqueta:

```php
task(
    label: 'Deploying',
    callback: function ($logger) {
        $logger->subLabel('Building assets...');
        // ...
        $logger->subLabel('Running migrations...');
        // ...
        $logger->subLabel('');
    }
);
```

También puede proporcionar una subetiqueta inicial mediante el argumento `subLabel`:

```php
task(
    label: 'Deploying',
    callback: function ($logger) {
        // ...
    },
    subLabel: 'Preparing...'
);
```

<a id="task-streaming"></a>
#### Transmisión de texto

Para los procesos que producen resultados de forma incremental, como las respuestas generadas por IA, el método `partial` le permite transmitir texto palabra por palabra o fragmento por fragmento. Una vez que se complete la transmisión, llame a `commitPartial` para finalizar la salida:

```php
task(
    label: 'Generating response...',
    callback: function ($logger) {
        foreach ($words as $word) {
            $logger->partial($word . ' ');
        }

        $logger->commitPartial();
    }
);
```

<a id="task-limit"></a>
#### Personalización del límite de salida

De forma predeterminada, la tarea muestra hasta 10 líneas de salida de desplazamiento. Puede personalizar esto mediante el argumento `limit`:

```php
task(
    label: 'Installing dependencies',
    callback: function ($logger) {
        // ...
    },
    limit: 20
);
```

<a id="task-keep-summary"></a>
#### Mantener el resumen

De forma predeterminada, el resultado de la tarea se borra una vez que finaliza la devolución de llamada. Si desea mantener los mensajes de estado en pantalla una vez completada la tarea, puede pasar el argumento `keepSummary`:

```php
task(
    label: 'Deploying',
    callback: function ($logger) {
        $logger->success('Assets built');
        // ...
        $logger->success('Migrations complete');
    },
    keepSummary: true,
);
```

<a id="stream"></a>
## Corriente

La función `stream` muestra texto que fluye hacia el terminal, ideal para mostrar contenido generado por IA o cualquier texto que llegue de forma incremental:

```php
use function Laravel\Prompts\stream;

$stream = stream();

foreach ($words as $word) {
    $stream->append($word . ' ');
    usleep(25_000); // Simulate delay between chunks...
}

$stream->close();
```

El método `append` agrega texto a la secuencia y la representa con un efecto de aparición gradual. Cuando se haya transmitido todo el contenido, llame al método `close` para finalizar la salida y restaurar el cursor.

<a id="terminal-title"></a>
## Título del terminal

La función `title` actualiza el título de la ventana o pestaña del terminal del usuario:

```php
use function Laravel\Prompts\title;

title('Installing Dependencies');
```

Para restablecer el título del terminal a su valor predeterminado, pase una cadena vacía:

```php
title('');
```

<a id="clear"></a>
## Limpiar la terminal

La función `clear` se puede utilizar para borrar el terminal del usuario:

```php
use function Laravel\Prompts\clear;

clear();
```

<a id="terminal-considerations"></a>
## Consideraciones de terminales

<a id="terminal-width"></a>
#### Ancho de terminal

Si la longitud de cualquier etiqueta, opción o mensaje de validación excede el número de "columnas" en la terminal del usuario, se truncará automáticamente para ajustarse. Considere minimizar la longitud de estas cadenas si sus usuarios pueden utilizar terminales más angostos. Una longitud máxima normalmente segura es de 74 caracteres para admitir un terminal de 80 caracteres.

<a id="terminal-height"></a>
#### Altura del terminal

Para cualquier mensaje que acepte el argumento `scroll`, el valor configurado se reducirá automáticamente para ajustarse a la altura del terminal del usuario, incluido el espacio para un mensaje de validación.

<a id="fallbacks"></a>
## Entornos no compatibles y alternativas

Laravel Prompts es compatible con macOS, Linux y Windows con WSL. Debido a limitaciones en la versión de PHP para Windows, actualmente no es posible utilizar Laravel Prompts en Windows fuera de WSL.

Por esta razón, Laravel Prompts admite recurrir a una implementación alternativa como [Symfony Console Question Helper](https://symfony.com/doc/current/components/console/helpers/questionhelper.html).

> **Nota:**
> Al utilizar los mensajes de Laravel con el marco de trabajo de Laravel, se han configurado respaldos para cada mensaje y se habilitarán automáticamente en entornos no compatibles.

<a id="fallback-conditions"></a>
#### Condiciones de reserva

Si no está utilizando Laravel o necesita personalizar cuándo se utiliza el comportamiento alternativo, puede pasar un valor booleano al método estático `fallbackWhen` en la clase `Prompt`:

```php
use Laravel\Prompts\Prompt;

Prompt::fallbackWhen(
    ! $input->isInteractive() || windows_os() || app()->runningUnitTests()
);
```

<a id="fallback-behavior"></a>
#### Comportamiento alternativo

Si no está utilizando Laravel o necesita personalizar el comportamiento alternativo, puede pasar un cierre al método estático `fallbackUsing` en cada clase de solicitud:

```php
use Laravel\Prompts\TextPrompt;
use Symfony\Component\Console\Question\Question;
use Symfony\Component\Console\Style\SymfonyStyle;

TextPrompt::fallbackUsing(function (TextPrompt $prompt) use ($input, $output) {
    $question = (new Question($prompt->label, $prompt->default ?: null))
        ->setValidator(function ($answer) use ($prompt) {
            if ($prompt->required && $answer === null) {
                throw new \RuntimeException(
                    is_string($prompt->required) ? $prompt->required : 'Required.'
                );
            }

            if ($prompt->validate) {
                $error = ($prompt->validate)($answer ?? '');

                if ($error) {
                    throw new \RuntimeException($error);
                }
            }

            return $answer;
        });

    return (new SymfonyStyle($input, $output))
        ->askQuestion($question);
});
```

Los respaldos deben configurarse individualmente para cada clase de solicitud. El cierre recibirá una instancia de la clase de mensaje y debe devolver un tipo apropiado para el mensaje.

<a id="testing"></a>
## Pruebas

Laravel proporciona una variedad de métodos para probar que su comando muestre los mensajes de aviso esperados:

```php tab=Pest
test('report generation', function () {
    $this->artisan('report:generate')
        ->expectsPromptsInfo('Welcome to the application!')
        ->expectsPromptsWarning('This action cannot be undone')
        ->expectsPromptsError('Something went wrong')
        ->expectsPromptsAlert('Important notice!')
        ->expectsPromptsIntro('Starting process...')
        ->expectsPromptsOutro('Process completed!')
        ->expectsPromptsTable(
            headers: ['Name', 'Email'],
            rows: [
                ['Taylor Otwell', 'taylor@example.com'],
                ['Jason Beggs', 'jason@example.com'],
            ]
        )
        ->assertExitCode(0);
});
```

```php tab=PHPUnit
public function test_report_generation(): void
{
    $this->artisan('report:generate')
        ->expectsPromptsInfo('Welcome to the application!')
        ->expectsPromptsWarning('This action cannot be undone')
        ->expectsPromptsError('Something went wrong')
        ->expectsPromptsAlert('Important notice!')
        ->expectsPromptsIntro('Starting process...')
        ->expectsPromptsOutro('Process completed!')
        ->expectsPromptsTable(
            headers: ['Name', 'Email'],
            rows: [
                ['Taylor Otwell', 'taylor@example.com'],
                ['Jason Beggs', 'jason@example.com'],
            ]
        )
        ->assertExitCode(0);
}
```
