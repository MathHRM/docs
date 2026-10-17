---
title: "Pinta Laravel"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Instalación](#installation)
- [Ejecutando Pint](#running-pint)
- [Configurando Pint](#configuring-pint)
    - [Preajustes](#presets)
    - [Reglas](#rules)
    - [Excluyendo archivos/carpetas](#excluding-files-or-folders)
- [Integración continua](#continuous-integration)
    - [Acciones de GitHub](#running-tests-on-github-actions)

<a id="introduction"></a>
## Introducción

[Laravel Pint](https://github.com/laravel/pint) es un solucionador de estilo de código PHP obstinado para minimalistas. Pint está construido sobre [PHP CS Fixer](https://github.com/FriendsOfPHP/PHP-CS-Fixer) y simplifica la tarea de garantizar que el estilo de su código se mantenga limpio y consistente.

Pint se instala automáticamente con todas las aplicaciones nuevas de Laravel, por lo que puede comenzar a usarlo inmediatamente. De forma predeterminada, Pint no requiere ninguna configuración y solucionará los problemas de estilo del código siguiendo el estilo de codificación obstinado de Laravel.

<a id="installation"></a>
## Instalación

Pint se incluye en versiones recientes del marco Laravel, por lo que la instalación normalmente no es necesaria. Sin embargo, para aplicaciones más antiguas, puedes instalar Laravel Pint a través de Composer:

```shell
composer require laravel/pint --dev
```

<a id="running-pint"></a>
## Pinta corriente

Puede indicarle a Pint que solucione problemas de estilo de código invocando el binario `pint` que está disponible en el directorio `vendor/bin` de su proyecto:

```shell
./vendor/bin/pint
```

Si desea que Pint se ejecute en modo paralelo (experimental) para mejorar el rendimiento, puede usar la opción `--parallel`:

```shell
./vendor/bin/pint --parallel
```

El modo paralelo también le permite especificar la cantidad máxima de procesos a ejecutar mediante la opción `--max-processes`. Si no se proporciona esta opción, Pint utilizará todos los núcleos disponibles en su máquina:

```shell
./vendor/bin/pint --parallel --max-processes=4
```

También puede ejecutar Pint en archivos o directorios específicos:

```shell
./vendor/bin/pint app/Models

./vendor/bin/pint app/Models/User.php
```

De forma predeterminada, Pint no formatea las plantillas de Blade. Si también desea formatear sus archivos `.blade.php`, puede usar la opción `--blade`, que habilita la regla [`Pint/laravel_blade`](#laravel-blade) para la ejecución actual sin modificar su archivo `pint.json`:

```shell
./vendor/bin/pint --blade
```

Pint mostrará una lista completa de todos los archivos que actualiza. Puede ver aún más detalles sobre los cambios de Pint proporcionando la opción `-v` al invocar Pint:

```shell
./vendor/bin/pint -v
```

Si desea que Pint simplemente inspeccione su código en busca de errores de estilo sin cambiar los archivos, puede usar la opción `--test`. Pint devolverá un código de salida distinto de cero si se encuentra algún error de estilo de código:

```shell
./vendor/bin/pint --test
```

Si desea que Pint solo modifique los archivos que difieren de la rama proporcionada según Git, puede usar la opción `--diff=[branch]`. Esto se puede utilizar de forma eficaz en su entorno de CI (como las acciones de GitHub) para ahorrar tiempo inspeccionando únicamente archivos nuevos o modificados:

```shell
./vendor/bin/pint --diff=main
```

Si desea que Pint solo modifique los archivos que tienen cambios no confirmados según Git, puede usar la opción `--dirty`:

```shell
./vendor/bin/pint --dirty
```

Si desea que Pint corrija cualquier archivo con errores de estilo de código pero también salga con un código de salida distinto de cero si se corrigió algún error, puede usar la opción `--repair`:

```shell
./vendor/bin/pint --repair
```

<a id="configuring-pint"></a>
## Configurando pinta

Como se mencionó anteriormente, Pint no requiere ninguna configuración. Sin embargo, si desea personalizar los ajustes preestablecidos, las reglas o las carpetas inspeccionadas, puede hacerlo creando un archivo `pint.json` en el directorio raíz de su proyecto:

```json
{
    "preset": "laravel"
}
```

Además, si desea utilizar un `pint.json` de un directorio específico, puede proporcionar la opción `--config` al invocar Pint:

```shell
./vendor/bin/pint --config vendor/my-company/coding-style/pint.json
```

<a id="presets"></a>
### Preajustes

Los ajustes preestablecidos definen un conjunto de reglas que se pueden usar para solucionar problemas de estilo de código en su código. De forma predeterminada, Pint utiliza el ajuste preestablecido `laravel`, que soluciona problemas siguiendo el estilo de codificación obstinado de Laravel. Sin embargo, puede especificar un ajuste preestablecido diferente proporcionando la opción `--preset` para Pintar:

```shell
./vendor/bin/pint --preset psr12
```

Si lo desea, también puede configurar el ajuste preestablecido en el archivo `pint.json` de su proyecto:

```json
{
    "preset": "psr12"
}
```

Los ajustes preestablecidos actualmente admitidos por Pint son: `laravel`, `per`, `psr12`, `symfony` y `empty`.

<a id="rules"></a>
### Reglas

Las reglas son pautas de estilo que Pint utilizará para solucionar problemas de estilo de código en su código. Como se mencionó anteriormente, los ajustes preestablecidos son grupos predefinidos de reglas que deberían ser perfectos para la mayoría de los proyectos PHP, por lo que normalmente no tendrá que preocuparse por las reglas individuales que contienen.

Sin embargo, si lo desea, puede habilitar o deshabilitar reglas específicas en su archivo `pint.json` o usar el ajuste preestablecido `empty` y definir las reglas desde cero:

```json
{
    "preset": "laravel",
    "rules": {
        "simplified_null_return": true,
        "array_indentation": false,
        "new_with_parentheses": {
            "anonymous_class": true,
            "named_class": true
        }
    }
}
```

Pint está construido sobre [PHP CS Fixer](https://github.com/FriendsOfPHP/PHP-CS-Fixer). Por lo tanto, puede utilizar cualquiera de sus reglas para solucionar problemas de estilo de código en su proyecto: [PHP CS Fixer Configurator](https://mlocati.github.io/php-cs-fixer-configurator).

<a id="custom-rules"></a>
#### Reglas personalizadas

Además de las reglas de PHP CS Fixer, Pint proporciona reglas personalizadas con el prefijo `Pint/`. Estas reglas no están habilitadas de forma predeterminada, pero puede habilitarlas en su archivo `pint.json`.

<a id="laravel-blade"></a>
##### `Pint/laravel_blade`

Esta regla formatea sus plantillas Blade, aplicando sangría, espaciado y formato de atributos consistentes a sus archivos `.blade.php`. De forma predeterminada, Pint no formatea archivos Blade, por lo que debe habilitar esta regla en su archivo `pint.json` para participar:

```json
{
    "preset": "laravel",
    "rules": {
        "Pint/laravel_blade": true
    }
}
```

Una vez habilitado, Pint formateará sus plantillas Blade además de sus archivos PHP cada vez que se ejecute:

```shell
./vendor/bin/pint
```

Alternativamente, si desea habilitar esta regla para una sola ejecución sin modificar su archivo `pint.json`, puede usar la opción `--blade`:

```shell
./vendor/bin/pint --blade
```

En esencia, esta regla utiliza [Prettier](https://prettier.io) junto con los complementos `prettier-plugin-blade` y `prettier-plugin-tailwindcss`, por lo que [Node.js](https://nodejs.org) debe estar instalado en su máquina. La primera vez que ejecute Pint con esta regla habilitada, Pint detectará cualquier dependencia de Prettier que falte y le pedirá que la instale.

> **Nota:**
> Esta regla omite automáticamente los archivos que normalmente dependen de su propio formato, como las [directrices de Laravel Boost](https://github.com/laravel/boost) y vistas de correo electrónico ubicadas en los directorios `resources/views/emails` y `resources/views/mail`.

<a id="phpdoc-type-annotations-only"></a>
##### `Pint/phpdoc_type_annotations_only`

Esta regla elimina todos los comentarios y la prosa del bloque de documentos de su código, manteniendo solo las líneas que contienen anotaciones `@` como `@param`, `@return`, `@var`, `@phpstan-type`, etc.:

```php
/**
 * Get the posts for the user. [tl! remove]
 * [tl! remove]
 * @return HasMany<Post, $this>
 */
public function posts(): HasMany
```

Los comentarios de una sola línea y los comentarios de bloque sin anotaciones `@` se eliminan por completo. Si desea conservar un comentario específico, puede agregarle el prefijo `@note`, `@warning` o `@todo`:

```php
// @note This comment will be preserved.
```

Para habilitar esta regla, agréguela a su archivo `pint.json`:

```json
{
    "preset": "laravel",
    "rules": {
        "Pint/phpdoc_type_annotations_only": true
    }
}
```

> **Nota:**
> Esta regla omite automáticamente los archivos en el directorio `config`, ya que los archivos de configuración generalmente dependen de comentarios para la documentación.

<a id="excluding-files-or-folders"></a>
### Excluyendo archivos/carpetas

De forma predeterminada, Pint inspeccionará todos los archivos `.php` en su proyecto, excepto aquellos en el directorio `vendor`. Si desea excluir más carpetas, puede hacerlo utilizando la opción de configuración `exclude`:

```json
{
    "exclude": [
        "my-specific/folder"
    ]
}
```

Si desea excluir todos los archivos que contienen un patrón de nombre determinado, puede hacerlo utilizando la opción de configuración `notName`:

```json
{
    "notName": [
        "*-my-file.php"
    ]
}
```

Si desea excluir un archivo proporcionando una ruta exacta al archivo, puede hacerlo utilizando la opción de configuración `notPath`:

```json
{
    "notPath": [
        "path/to/excluded-file.php"
    ]
}
```

<a id="continuous-integration"></a>
## Integración continua

<a id="running-tests-on-github-actions"></a>
### Acciones de GitHub

Para automatizar la integración de su proyecto con Laravel Pint, puede configurar [GitHub Actions](https://github.com/features/actions) para ejecutar Pint cada vez que se envíe código nuevo a GitHub. Primero, asegúrese de otorgar "permisos de lectura y escritura" a los flujos de trabajo dentro de GitHub en **Configuración > Acciones > General > Permisos de flujo de trabajo**. Luego, cree un archivo `.github/workflows/lint.yml` con el siguiente contenido:

```yaml
name: Fix Code Style

on: [push]

jobs:
  lint:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: true
      matrix:
        php: [8.4]

    steps:
      - name: Checkout code
        uses: actions/checkout@v5

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: ${{ matrix.php }}
          tools: pint

      - name: Run Pint
        run: pint

      - name: Commit linted files
        uses: stefanzweifel/git-auto-commit-action@v6
```
