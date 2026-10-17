---
title: "Cifrado"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Configuración](#configuration)
    - [Rotación de claves de cifrado sin interrupciones](#gracefully-rotating-encryption-keys)
- [Uso del cifrador](#using-the-encrypter)

<a id="introduction"></a>
## Introducción

Los servicios de cifrado de Laravel ofrecen una interfaz sencilla y práctica para cifrar y descifrar texto mediante OpenSSL con cifrado AES-256 y AES-128. Todos los valores cifrados de Laravel se firman con un código de autenticación de mensajes (MAC) para que su valor subyacente no pueda modificarse ni manipularse una vez cifrado.

<a id="configuration"></a>
## Configuración

Antes de usar el cifrador de Laravel, debes establecer la opción de configuración `key` en tu archivo de configuración `config/app.php`. Este valor de configuración se obtiene de la variable de entorno `APP_KEY`. Debes usar el comando `php artisan key:generate` para generar el valor de esta variable, ya que el comando `key:generate` usa el generador seguro de bytes aleatorios de PHP para crear una clave criptográficamente segura para tu aplicación. Normalmente, el valor de la variable de entorno `APP_KEY` se genera durante la [instalación de Laravel](../installation/).

<a id="gracefully-rotating-encryption-keys"></a>
### Rotación de claves de cifrado sin interrupciones

Si cambias la clave de cifrado de tu aplicación, se cerrarán todas las sesiones de los usuarios autenticados. Esto se debe a que Laravel cifra todas las cookies, incluidas las de sesión. Además, ya no será posible descifrar los datos que se hayan cifrado con tu clave anterior.

Para mitigar este problema, Laravel te permite enumerar tus claves de cifrado anteriores en la variable de entorno `APP_PREVIOUS_KEYS` de tu aplicación. Esta variable puede contener una lista de todas tus claves de cifrado anteriores separadas por comas:

```ini
APP_KEY="base64:J63qRTDLub5NuZvP+kb8YIorGS6qFYHKVo6u7179stY="
APP_PREVIOUS_KEYS="base64:2nLsGFGzyoae2ax3EF2Lyq/hH6QghBGLIq5uL+Gp8/w="
```

Cuando establezcas esta variable de entorno, Laravel siempre usará la clave de cifrado «actual» al cifrar valores. Sin embargo, al descifrarlos, Laravel probará primero la clave actual y, si el descifrado falla, probará todas las claves anteriores hasta encontrar una que pueda descifrar el valor.

Este enfoque de descifrado sin interrupciones permite a los usuarios seguir usando tu aplicación sin interrupciones, incluso si se rota la clave de cifrado.

<a id="using-the-encrypter"></a>
## Uso del cifrador

<a id="encrypting-a-value"></a>
#### Cifrar un valor

Puedes cifrar un valor usando el método `encryptString` que ofrece la fachada `Crypt`. Todos los valores se cifran mediante OpenSSL y el cifrado AES-256-CBC. Además, todos los valores cifrados se firman con un código de autenticación de mensajes (MAC). El código de autenticación de mensajes integrado impedirá el descifrado de cualquier valor que haya sido manipulado por usuarios malintencionados:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;

class DigitalOceanTokenController extends Controller
{
    /**
     * Store a DigitalOcean API token for the user.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->user()->fill([
            'token' => Crypt::encryptString($request->token),
        ])->save();

        return redirect('/secrets');
    }
}
```

<a id="decrypting-a-value"></a>
#### Descifrar un valor

Puedes descifrar valores usando el método `decryptString` que ofrece la fachada `Crypt`. Si el valor no puede descifrarse correctamente, por ejemplo, cuando el código de autenticación de mensajes no es válido, se lanzará una excepción `Illuminate\Contracts\Encryption\DecryptException`:

```php
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Facades\Crypt;

try {
    $decrypted = Crypt::decryptString($encryptedValue);
} catch (DecryptException $e) {
    // ...
}
```
