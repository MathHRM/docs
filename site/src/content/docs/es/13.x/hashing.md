---
title: "Hashing"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Configuración](#configuration)
- [Uso básico](#basic-usage)
    - [Hashing de contraseñas](#hashing-passwords)
    - [Verificar que una contraseña coincida con un hash](#verifying-that-a-password-matches-a-hash)
    - [Determinar si es necesario volver a generar el hash de una contraseña](#determining-if-a-password-needs-to-be-rehashed)
- [Verificación del algoritmo hash](#hash-algorithm-verification)

<a id="introduction"></a>
## Introducción

La [fachada](../facades/) `Hash` de Laravel ofrece hashing seguro con Bcrypt y Argon2 para almacenar las contraseñas de los usuarios. Si usas uno de los [kits de inicio de aplicaciones Laravel](../starter-kits/), se usará Bcrypt para el registro y la autenticación de forma predeterminada.

Bcrypt es una excelente opción para generar hashes de contraseñas porque su "factor de trabajo" es ajustable, lo que significa que el tiempo que lleva generar un hash puede aumentar a medida que aumenta la potencia del hardware. Al generar hashes de contraseñas, la lentitud es buena. Cuanto más tiempo tarda un algoritmo en generar el hash de una contraseña, más tiempo tardan los usuarios malintencionados en generar "tablas de arcoíris" de todos los posibles valores de hash de cadenas que pueden usarse en ataques de fuerza bruta contra aplicaciones.

<a id="configuration"></a>
## Configuración

De forma predeterminada, Laravel utiliza el controlador de hash `bcrypt` al generar hashes de datos. Sin embargo, se admiten varios otros controladores de hash, incluidos [argon](https://en.wikipedia.org/wiki/Argon2) y [argon2id](https://en.wikipedia.org/wiki/Argon2).

Puedes especificar el controlador de hashing de tu aplicación mediante la variable de entorno `HASH_DRIVER`. Pero, si quieres personalizar todas las opciones del controlador hash de Laravel, debes publicar el archivo de configuración `hashing` completo mediante el comando de Artisan `config:publish`:

```shell
php artisan config:publish hashing
```

<a id="basic-usage"></a>
## Uso básico

<a id="hashing-passwords"></a>
### Hashing de contraseñas

Puedes generar el hash de una contraseña llamando al método `make` de la fachada `Hash`:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class PasswordController extends Controller
{
    /**
     * Update the password for the user.
     */
    public function update(Request $request): RedirectResponse
    {
        // Validate the new password length...

        $request->user()->fill([
            'password' => Hash::make($request->newPassword)
        ])->save();

        return redirect('/profile');
    }
}
```

<a id="adjusting-the-bcrypt-work-factor"></a>
#### Ajuste del factor de trabajo de Bcrypt

Si usas el algoritmo Bcrypt, el método `make` te permite administrar el factor de trabajo del algoritmo usando la opción `rounds`; sin embargo, el factor de trabajo predeterminado administrado por Laravel es aceptable para la mayoría de las aplicaciones:

```php
$hashed = Hash::make('password', [
    'rounds' => 12,
]);
```

<a id="adjusting-the-argon2-work-factor"></a>
#### Ajuste del factor de trabajo de Argon2

Si usas el algoritmo Argon2, el método `make` te permite administrar el factor de trabajo del algoritmo utilizando las opciones `memory`, `time` y `threads`; sin embargo, los valores predeterminados administrados por Laravel son aceptables para la mayoría de las aplicaciones:

```php
$hashed = Hash::make('password', [
    'memory' => 1024,
    'time' => 2,
    'threads' => 2,
]);
```

> **Nota:**
> Para obtener más información sobre estas opciones, consulta la [documentación oficial de PHP sobre el hashing con Argon](https://secure.php.net/manual/en/function.password-hash.php).

<a id="verifying-that-a-password-matches-a-hash"></a>
### Verificar que una contraseña coincida con un hash

El método `check` proporcionado por la fachada `Hash` te permite verificar que una cadena de texto sin formato determinada corresponde a un hash determinado:

```php
if (Hash::check('plain-text', $hashedPassword)) {
    // The passwords match...
}
```

<a id="determining-if-a-password-needs-to-be-rehashed"></a>
### Determinar si es necesario volver a generar el hash de una contraseña

El método `needsRehash` proporcionado por la fachada `Hash` te permite determinar si el factor de trabajo utilizado por el hasher ha cambiado desde que se generó el hash de la contraseña. Algunas aplicaciones optan por realizar esta verificación durante el proceso de autenticación de la aplicación:

```php
if (Hash::needsRehash($hashed)) {
    $hashed = Hash::make('plain-text');
}
```

<a id="hash-algorithm-verification"></a>
## Verificación del algoritmo hash

Para evitar la manipulación del algoritmo hash, el método `Hash::check` de Laravel primero verificará que el hash dado se haya generado utilizando el algoritmo hash seleccionado de la aplicación. Si los algoritmos son diferentes, se lanzará una excepción `RuntimeException`.

Este es el comportamiento esperado para la mayoría de las aplicaciones, donde no se espera que el algoritmo hash cambie y diferentes algoritmos pueden ser una indicación de un ataque malicioso. Sin embargo, si necesitas admitir varios algoritmos de hashing en tu aplicación, como al migrar de un algoritmo a otro, puedes deshabilitar la verificación del algoritmo hash configurando la variable de entorno `HASH_VERIFY` en `false`:

```ini
HASH_VERIFY=false
```
