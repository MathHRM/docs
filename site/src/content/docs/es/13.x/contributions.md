---
title: "Guía de contribución"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Informes de errores](#bug-reports)
- [Preguntas de soporte](#support-questions)
- [¿Qué rama?](#which-branch)
- [Recursos compilados](#compiled-assets)
- [Contribuciones generadas por IA](#ai-generated-contributions)
- [Vulnerabilidades de seguridad](#security-vulnerabilities)
- [Estilo de codificación](#coding-style)
    - [PHPDoc](#phpdoc)
    - [StyleCI](#styleci)
- [Código de conducta](#code-of-conduct)

<a id="bug-reports"></a>
## Informes de errores

Para fomentar la colaboración activa, Laravel recomienda encarecidamente enviar pull requests que resuelvan los problemas, en lugar de abrir incidencias en GitHub. Las incidencias de GitHub están deshabilitadas en la mayoría de nuestros paquetes propios.

Si descubres un problema, crea una pull request que solucione el problema. Tu pull request debe contener un título y una descripción clara del problema y su solución. También debes incluir tanta información relevante como sea posible y un código de muestra que demuestre el problema. El objetivo de una pull request es facilitar que tú y otras personas comprendan el problema y verificar la solución.

Si no sabes cómo solucionar el problema, descríbeselo a un agente de programación y úsalo para intentar preparar una pull request.

Las pull requests solo se revisarán cuando estén marcadas como "listas para revisión" (no en el estado "borrador") y todas las pruebas de nuevas características estén pasando. Las pull requests persistentes e inactivas que se dejen en estado "borrador" se cerrarán después de unos días.

El código fuente de Laravel se administra en GitHub y existen repositorios para cada uno de los proyectos de Laravel:

<div class="content-list" markdown="1">

- [Laravel AI SDK](https://github.com/laravel/ai)
- [Aplicación Laravel](https://github.com/laravel/laravel)
- [Laravel Art](https://github.com/laravel/art)
- [Laravel Boost](https://github.com/laravel/boost)
- [Documentación de Laravel](https://github.com/laravel/docs)
- [Laravel Dusk](https://github.com/laravel/dusk)
- [Laravel Cashier Stripe](https://github.com/laravel/cashier)
- [Laravel Cashier Paddle](https://github.com/laravel/cashier-paddle)
- [Laravel Echo](https://github.com/laravel/echo)
- [Laravel Envoy](https://github.com/laravel/envoy)
- [Laravel Folio](https://github.com/laravel/folio)
- [Framework de Laravel](https://github.com/laravel/framework)
- [Laravel Horizon](https://github.com/laravel/horizon)
- [Laravel Passport](https://github.com/laravel/passport)
- [Laravel Pennant](https://github.com/laravel/pennant)
- [Laravel Pint](https://github.com/laravel/pint)
- [Laravel Prompts](https://github.com/laravel/prompts)
- [Laravel Reverb](https://github.com/laravel/reverb)
- [Laravel Sail](https://github.com/laravel/sail)
- [Laravel Sanctum](https://github.com/laravel/sanctum)
- [Laravel Scout](https://github.com/laravel/scout)
- [Laravel Socialite](https://github.com/laravel/socialite)
- [Laravel Telescope](https://github.com/laravel/telescope)
- [Kits de inicio de Laravel (Maestro)](https://github.com/laravel/maestro)

</div>

<a id="support-questions"></a>
## Preguntas de soporte

Los registros de incidencias de Laravel en GitHub no están destinados a brindar ayuda o soporte a Laravel. En su lugar, utiliza uno de los siguientes canales:

<div class="content-list" markdown="1">

- [Discusiones de GitHub](https://github.com/laravel/framework/discussions)
- [Foros de Laracasts](https://laracasts.com/discuss)
- [Foros de Laravel.io](https://laravel.io/forum)
- [StackOverflow](https://stackoverflow.com/questions/tagged/laravel)
- [Discord](https://discord.gg/laravel)
- [Larachat](https://larachat.co)
- [IRC](https://web.libera.chat/?nick=artisan&channels=#laravel)

</div>

<a id="which-branch"></a>
## ¿Qué rama?

**Todas** las correcciones de errores deben enviarse a la última versión que admita correcciones de errores (actualmente `13.x`). Las correcciones de errores **nunca** deben enviarse a la rama `master` a menos que corrijan características que existen solo en la próxima versión.

Las características **menores** que son **totalmente compatibles con versiones anteriores** con la versión actual pueden enviarse a la última rama estable (actualmente `13.x`).

Las funcionalidades nuevas **importantes** o las funcionalidades con cambios incompatibles siempre deben enviarse a la rama `master`, que contiene la próxima versión.

<a id="compiled-assets"></a>
## Recursos compilados

Si envías un cambio que afectará a un archivo compilado, como la mayoría de los archivos en `resources/css` o `resources/js` del repositorio `laravel/laravel`, no incluyas los archivos compilados en el commit. Debido a su gran tamaño, no es viable que un mantenedor los revise. Esto podría aprovecharse como una forma de inyectar código malicioso en Laravel. Como medida preventiva, todos los archivos compilados serán generados e incluidos en commits por los mantenedores de Laravel.

<a id="ai-generated-contributions"></a>
## Contribuciones generadas por IA

Apreciamos cada pull request enviada a Laravel. Sin embargo, no son aceptables contribuciones sustanciales generadas principalmente por IA sin una cuidadosa revisión y consideración humana.

Si decides utilizar herramientas de inteligencia artificial para ayudar con contribuciones grandes o complejas al framework, **debes** revisar, probar y comprender minuciosamente el código resultante antes de enviarlo.

Las descripciones de las pull requests **deben** ser escritas en su totalidad por el colaborador. Se cerrarán las pull requests con descripciones generadas por IA.

**No se tolerará la apertura masiva de incidencias o pull requests generadas íntegramente por IA.** Dichas pull requests se cerrarán sin revisión y es posible que el usuario contribuyente sea bloqueado del repositorio.

Alentamos a los contribuyentes a que se familiaricen con el código base existente, interactúen con la comunidad y envíen pull requests que reflejen su propia comprensión y consideración cuidadosa del problema que están resolviendo.

<a id="security-vulnerabilities"></a>
## Vulnerabilidades de seguridad

Si descubres una vulnerabilidad de seguridad en Laravel, envía un correo electrónico a nuestro equipo de seguridad a <a href="mailto:security@laravel.com">security@laravel.com</a>. Todas las vulnerabilidades de seguridad se abordarán de inmediato.

<a id="coding-style"></a>
## Estilo de codificación

Laravel sigue el estándar de codificación [PSR-2](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-2-coding-style-guide.md) y el estándar de carga automática [PSR-4](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-4-autoloader.md).

<a id="phpdoc"></a>
### PHPDoc

A continuación se muestra un ejemplo de un bloque de documentación de Laravel válido. Ten en cuenta que el atributo `@param` va seguido de dos espacios, el tipo de argumento, dos espacios más y finalmente el nombre de la variable:

```php
/**
 * Registrar un binding en el container.
 *
 * @param  string|array  $abstract
 * @param  \Closure|string|null  $concrete
 * @param  bool  $shared
 * @return void
 *
 * @throws \Exception
 */
public function bind($abstract, $concrete = null, $shared = false)
{
    // ...
}
```

Cuando los atributos `@param` o `@return` son redundantes debido al uso de tipos nativos, se pueden eliminar:

```php
/**
 * Ejecutar el job.
 * [tl! remove]
 * @return void [tl! remove]
 */
public function handle(AudioProcessor $processor): void
{
    // ...
}
```

Sin embargo, cuando el tipo nativo es genérico, especifica el tipo genérico mediante el uso de los atributos `@param` o `@return`:

```php
/**
 * Obtener los archivos adjuntos del mensaje.
 * [tl! add]
 * @return array<int, \Illuminate\Mail\Mailables\Attachment> [tl! add]
 */
public function attachments(): array
{
    return [
        Attachment::fromStorage('/path/to/file'),
    ];
}
```

<a id="styleci"></a>
### StyleCI

¡No te preocupes si el estilo de tu código no es perfecto! [StyleCI](https://styleci.io/) fusionará automáticamente cualquier corrección de estilo en el repositorio de Laravel después de fusionar las pull requests. Esto nos permite centrarnos en el contenido de la contribución y no en el estilo del código.

<a id="code-of-conduct"></a>
## Código de conducta

El código de conducta de Laravel se deriva del código de conducta de Ruby. Cualquier violación del código de conducta puede informarse a Taylor Otwell (taylor@laravel.com):

<div class="content-list" markdown="1">

- Los participantes serán tolerantes con puntos de vista opuestos.
- Los participantes deben asegurarse de que su lenguaje y sus acciones estén libres de ataques personales y comentarios personales despectivos.
- Al interpretar las palabras y acciones de los demás, los participantes siempre deben asumir buenas intenciones.
- No se tolerarán conductas que puedan considerarse razonablemente acoso.

</div>
