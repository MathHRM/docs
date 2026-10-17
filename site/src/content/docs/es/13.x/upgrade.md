---
title: "Guía de actualización"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Actualización a 13.0 desde 12.x](#upgrade-13.0)
    - [Actualización usando AI](#upgrading-using-ai)

<a id="high-impact-changes"></a>
## Cambios de alto impacto

<div class="content-list" markdown="1">

- [Actualización de dependencias](#updating-dependencies)
- [Actualizando el instalador de Laravel](#updating-the-laravel-installer)
- [Solicitar protección contra falsificación](#request-forgery-protection)

</div>

<a id="medium-impact-changes"></a>
## Cambios de impacto medio

<div class="content-list" markdown="1">

- [Configuración de caché `serializable_classes`](#cache-serializable_classes-configuration)
- [Base de datos `upsert` con MySQL o MariaDB](#database-upsert-mariadb-mysql)

</div>

<a id="low-impact-changes"></a>
## Cambios de bajo impacto

<div class="content-list" markdown="1">

- [Prefijos de caché y nombres de cookies de sesión](#cache-prefixes-and-session-cookie-names)
- [La serialización del modelo de colección restaura relaciones cargadas de forma anticipada](#collection-model-serialization-restores-eager-loaded-relations)
- [`Container::call` y valores predeterminados de clase anulables](#containercall-and-nullable-class-defaults)
- [Precedencia de registro de ruta de dominio](#domain-route-registration-precedence)
- [`JobAttempted` Carga útil de excepción de evento](#jobattempted-event-exception-payload)
- [Administrador `extend` Enlace de devolución de llamada](#manager-extend-callback-binding)
- [Consultas MySQL `DELETE` con `JOIN`, `ORDER BY` y `LIMIT`](#mysql-delete-queries-with-join-order-by-and-limit)
- [Paginación Bootstrap Ver Nombres](#pagination-bootstrap-view-names)
- [Nombre de tabla dinámica polimórfica Generation](#polymorphic-pivot-table-name-generation)
- [`QueueBusy` Cambio de nombre de propiedad de evento](#queuebusy-event-property-rename)
- [Sesión `serialization` Configuración](#session-serialization-configuration)
- [Restablecimiento de fábricas `Str` entre pruebas](#str-factories-reset-between-tests)

</div>

<a id="upgrade-13.0"></a>
## Actualización a 13.0 desde 12.x

#### Tiempo estimado de actualización: 10 minutos

> **Nota:**
> Intentamos documentar todos los cambios importantes posibles. Dado que algunos de estos cambios importantes se encuentran en partes oscuras del marco, solo una parte de estos cambios pueden afectar su aplicación. Para ahorrar tiempo, puede utilizar [Shift](https://laravelshift.com). Shift es un servicio mantenido por la comunidad que automatiza las actualizaciones de Laravel.

<a id="upgrading-using-ai"></a>
### Actualización mediante IA

Puede automatizar su actualización usando [Laravel Boost](https://github.com/laravel/boost). Boost es un servidor MCP propio que proporciona a su asistente de IA indicaciones de actualización guiadas: una vez instalado en cualquier aplicación Laravel 12, use el comando de barra diagonal `/upgrade-laravel-v13` en Claude Code, Cursor, OpenCode, Gemini o VS Code para comenzar la actualización a Laravel 13. Este comando requiere Laravel Boost `^2.0`.

<a id="updating-dependencies"></a>
### Actualizando dependencias

**Probabilidad de impacto: alta**

Debe actualizar las siguientes dependencias en el archivo `composer.json` de su aplicación:

<div class="content-list" markdown="1">

- `laravel/framework` a `^13.0`
- `laravel/boost` a `^2.0`
- `laravel/tinker` a `^3.0`
- `phpunit/phpunit` a `^12.0`
- `pestphp/pest` a `^4.0`

</div>

<a id="updating-the-laravel-installer"></a>
### Actualizando el instalador de Laravel

Si está utilizando la herramienta CLI del instalador de Laravel para crear nuevas aplicaciones Laravel, debe actualizar la instalación del instalador para que sea compatible con Laravel 13.x.

Si instaló el instalador de Laravel a través de `composer global require`, puede actualizar el instalador usando `composer global update`:

```shell
composer global update laravel/installer
```

O, si está utilizando la copia incluida [Laravel Herd's](https://herd.laravel.com) del instalador de Laravel, debe actualizar su instalación de Herd a la última versión.

<a id="cache"></a>
### Caché

<a id="cache-prefixes-and-session-cookie-names"></a>
#### Prefijos de caché y nombres de cookies de sesión

**Probabilidad de impacto: baja**

El caché predeterminado de Laravel y los prefijos de clave de Redis ahora usan sufijos con guiones.

En la mayoría de las aplicaciones, este cambio no se aplicará porque los archivos de configuración a nivel de aplicación ya definen estos valores. Esto afecta principalmente a las aplicaciones que dependen de la configuración alternativa a nivel de marco cuando los valores de configuración de la aplicación correspondientes no están presentes.

Si su aplicación se basa en estos valores predeterminados generados, las claves de caché y los nombres de las cookies de sesión pueden cambiar después de la actualización:

```php
// Laravel <= 12.x
Str::slug((string) env('APP_NAME', 'laravel'), '_').'_cache_';
Str::slug((string) env('APP_NAME', 'laravel'), '_').'_database_';
Str::slug((string) env('APP_NAME', 'laravel'), '_').'_session';

// Laravel >= 13.x
Str::slug((string) env('APP_NAME', 'laravel')).'-cache-';
Str::slug((string) env('APP_NAME', 'laravel')).'-database-';
Str::slug((string) env('APP_NAME', 'laravel')).'-session';
```

Para conservar el comportamiento anterior, configure explícitamente `CACHE_PREFIX`, `REDIS_PREFIX` y `SESSION_COOKIE` en su entorno.

<a id="store-and-repository-contracts-touch"></a>
#### Contratos `Store` y `Repository`: `touch`

**Probabilidad de impacto: muy baja**

Los contratos de caché ahora incluyen un método `touch` para extender los TTL de artículos. Si mantiene implementaciones de almacén de caché personalizadas, debe agregar este método:

```php
// Illuminate\Contracts\Cache\Store
public function touch($key, $seconds);
```

<a id="cache-serializable_classes-configuration"></a>
#### Configuración de caché `serializable_classes`

**Probabilidad de impacto: media**

La configuración predeterminada de la aplicación `cache` ahora incluye una opción `serializable_classes` establecida en `false`. Esto refuerza el comportamiento de deserialización de la caché para ayudar a prevenir ataques en cadena de dispositivos de deserialización de PHP si se filtra el `APP_KEY` de su aplicación. Si su aplicación almacena intencionalmente objetos PHP en caché, debe enumerar explícitamente las clases que pueden no estar serializadas:

```php
'serializable_classes' => [
    App\Data\CachedDashboardStats::class,
    App\Support\CachedPricingSnapshot::class,
],
```

Si su aplicación anteriormente dependía de la deseriatización de objetos almacenados en caché arbitrarios, deberá migrar ese uso a listas de clases permitidas explícitas o a cargas útiles de caché que no sean objetos (como matrices).

<a id="container"></a>
### Contenedor

<a id="containercall-and-nullable-class-defaults"></a>
#### `Container::call` y valores predeterminados de clases anulables

**Probabilidad de impacto: baja**

`Container::call` ahora respeta los valores predeterminados de los parámetros de clase anulables cuando no existe ningún enlace, coincidiendo con el comportamiento de inyección del constructor introducido en Laravel 12:

```php
$container->call(function (?Carbon $date = null) {
    return $date;
});

// Laravel <= 12.x: Carbon instance
// Laravel >= 13.x: null
```

Si la lógica de inyección de llamada a su método dependía del comportamiento anterior, es posible que deba actualizarla.

<a id="contracts"></a>
### Contratos

<a id="dispatcher-contract-dispatchafterresponse"></a>
#### `Dispatcher` Contrato: `dispatchAfterResponse`

**Probabilidad de impacto: muy baja**

El contrato `Illuminate\Contracts\Bus\Dispatcher` ahora incluye el método `dispatchAfterResponse($command, $handler = null)`.

Si mantiene una implementación de despachador personalizado, agregue este método a su clase.

<a id="responsefactory-contract-eventstream"></a>
#### `ResponseFactory` Contrato: `eventStream`

**Probabilidad de impacto: muy baja**

El contrato `Illuminate\Contracts\Routing\ResponseFactory` ahora incluye una firma `eventStream`.

Si mantiene una implementación personalizada de este contrato, debe agregar este método.

<a id="mustverifyemail-contract-markemailasunverified"></a>
#### `MustVerifyEmail` Contrato: `markEmailAsUnverified`

**Probabilidad de impacto: muy baja**

El contrato `Illuminate\Contracts\Auth\MustVerifyEmail` ahora incluye `markEmailAsUnverified()`.

Si proporciona una implementación personalizada de este contrato, agregue este método para seguir siendo compatible.

<a id="database"></a>
### Base de datos

<a id="database-upsert-mariadb-mysql"></a>
#### Base de datos `upsert` con MySQL o MariaDB

**Probabilidad de impacto: media**

Laravel ahora valida que la persona que llama proporciona un valor no vacío para `uniqueBy` y arrojará un `InvalidArgumentException` en lugar de generar un SQL no válido.

Aunque los controladores de bases de datos MariaDB y MySQL ignoran el valor `uniqueBy` y siempre usan los índices principal y único de la tabla para detectar registros existentes, la validación aún se aplica. Se generará un `InvalidArgumentException` si `uniqueBy` está vacío.

<a id="mysql-delete-queries-with-join-order-by-and-limit"></a>
#### Consultas MySQL `DELETE` con `JOIN`, `ORDER BY` y `LIMIT`

**Probabilidad de impacto: baja**

Laravel ahora compila consultas `DELETE ... JOIN` completas, incluidas `ORDER BY` y `LIMIT` para gramática MySQL.

En versiones anteriores, las cláusulas `ORDER BY`/`LIMIT` se podían ignorar silenciosamente en eliminaciones unidas. En Laravel 13, estas cláusulas se incluyen en el SQL generado. Como resultado, los motores de bases de datos que no admiten esta sintaxis (MySQL y MariaDB anteriores a 11.8.1) ahora pueden generar un `QueryException` en lugar de ejecutar una eliminación ilimitada.

<a id="eloquent"></a>
### Eloquent

<a id="model-booting-and-nested-instantiation"></a>
#### Arranque del modelo y creación de instancias anidadas

**Probabilidad de impacto: muy baja**

Ahora no se permite crear una nueva instancia de modelo mientras ese modelo aún se está iniciando y genera un `LogicException`.

Esto afecta al código que crea instancias de modelos desde dentro de los métodos del modelo `boot` o de los métodos de rasgo `boot*`:

```php
protected static function boot()
{
    parent::boot();

    // No longer allowed during booting...
    (new static())->getTable();
}
```

Mueva esta lógica fuera del ciclo de inicio para evitar el inicio anidado.

<a id="polymorphic-pivot-table-name-generation"></a>
#### Generación de nombres de tablas dinámicas polimórficas

**Probabilidad de impacto: baja**

Cuando se infieren nombres de tablas para modelos pivote polimórficos utilizando clases de modelo pivote personalizadas, Laravel ahora genera nombres pluralizados.

Si su aplicación dependía de los nombres singulares inferidos anteriores para las tablas dinámicas de transformación y usaba clases dinámicas personalizadas, debe definir explícitamente el nombre de la tabla en su modelo dinámico.

<a id="collection-model-serialization-restores-eager-loaded-relations"></a>
#### La serialización del modelo de colección restaura relaciones cargadas de forma anticipada

**Probabilidad de impacto: baja**

Cuando las colecciones de modelos de Eloquent se serializan y restauran (como en trabajos en cola), ahora se restauran las relaciones cargadas de forma anticipada para los modelos de la colección.

Si su código dependía de que las relaciones no estuvieran presentes después de la deserialización, es posible que deba ajustar esa lógica.

<a id="http-client"></a>
### Cliente HTTP

<a id="http-client-response-throw-and-throwif-signatures"></a>
#### Firmas de cliente HTTP `Response::throw` y `throwIf`

**Probabilidad de impacto: muy baja**

Los métodos de respuesta del cliente HTTP ahora declaran sus parámetros de devolución de llamada en las firmas de los métodos:

```php
public function throw($callback = null);
public function throwIf($condition, $callback = null);
```

Si anula estos métodos en clases de respuesta personalizadas, asegúrese de que las firmas de sus métodos sean compatibles.

<a id="notifications"></a>
### Notificaciones

<a id="default-password-reset-subject"></a>
#### Asunto de restablecimiento de contraseña predeterminado

**Probabilidad de impacto: muy baja**

El asunto del correo de restablecimiento de contraseña predeterminado de Laravel ha cambiado:

```text
// Laravel <= 12.x
Reset Password Notification

// Laravel >= 13.x
Reset your password
```

Si sus pruebas, aserciones o anulaciones de traducción dependen de la cadena predeterminada anterior, actualícelas en consecuencia.

<a id="queued-notifications-and-missing-models"></a>
#### Notificaciones en cola y modelos faltantes

**Probabilidad de impacto: muy baja**

Las notificaciones en cola ahora respetan el atributo `#[DeleteWhenMissingModels]` y la propiedad `$deleteWhenMissingModels` definida en la clase de notificación.

En versiones anteriores, los modelos faltantes aún podían provocar que fallaran los trabajos de notificación en cola en los casos en los que esperaba que se eliminaran.

<a id="queue"></a>
### Cola

<a id="jobattempted-event-exception-payload"></a>
#### `JobAttempted` Carga útil de excepción de evento

**Probabilidad de impacto: baja**

El evento `Illuminate\Queue\Events\JobAttempted` ahora expone el objeto de excepción (o `null`) a través de `$exception`, reemplazando la propiedad booleana `$exceptionOccurred` anterior:

```php
// Laravel <= 12.x
$event->exceptionOccurred;

// Laravel >= 13.x
$event->exception;
```

Si escucha este evento, actualice su código de escucha en consecuencia.

<a id="queuebusy-event-property-rename"></a>
#### `QueueBusy` Cambio de nombre de propiedad de evento

**Probabilidad de impacto: baja**

La propiedad del evento `Illuminate\Queue\Events\QueueBusy`, `$connection`, pasó a llamarse `$connectionName` para mantener la coherencia con otros eventos de la cola.

Si sus oyentes hacen referencia a `$connection`, actualícelos a `$connectionName`.

<a id="queue-contract-method-additions"></a>
#### `Queue` Adiciones al método de contrato

**Probabilidad de impacto: muy baja**

El contrato `Illuminate\Contracts\Queue\Queue` ahora incluye métodos de inspección del tamaño de la cola que anteriormente solo se declaraban en bloques de documentos.

Si mantiene implementaciones de controladores de cola personalizados de este contrato, agregue implementaciones para:

<div class="content-list" markdown="1">

- `pendingSize`
- `delayedSize`
- `reservedSize`
- `creationTimeOfOldestPendingJob`

</div>

<a id="routing"></a>
### Enrutamiento

<a id="domain-route-registration-precedence"></a>
#### Prioridad de registro de ruta de dominio

**Probabilidad de impacto: baja**

Las rutas con un dominio explícito ahora tienen prioridad antes que las rutas que no son de dominio en la coincidencia de rutas.

Esto permite que las rutas de subdominio generales se comporten de manera consistente incluso cuando las rutas que no son de dominio se registran anteriormente. Si su aplicación dependía de la precedencia de registro anterior entre rutas de dominio y no dominio, revise el comportamiento de coincidencia de rutas.

<a id="session"></a>
### Sesión

<a id="session-serialization-configuration"></a>
#### Configuración de sesión `serialization`

**Probabilidad de impacto: baja**

Para ayudar a prevenir ataques de cadena de gadgets de deserialización de PHP, el esqueleto de la aplicación predeterminada ahora establece la opción de sesión `serialization` en `json` en el archivo `config/session.php`.

Si está actualizando una aplicación existente y sincronizando sus archivos de configuración con el esqueleto de Laravel 13, actualizar este valor de `php` a `json` invalidará todas las sesiones de usuario activas.

Si desea mantener sesiones activas sin problemas durante la actualización, debe asegurarse de que este valor permanezca establecido en `php`. Sin embargo, si su aplicación no almacena objetos PHP en la sesión y se siente cómodo solicitando a sus usuarios que se vuelvan a autenticar, le recomendamos actualizar este valor a `json` para mejorar la seguridad.

<a id="scheduling"></a>
### Programación

<a id="withscheduling-registration-timing"></a>
#### `withScheduling` Momento de registro

**Probabilidad de impacto: muy baja**

Los horarios registrados a través de `ApplicationBuilder::withScheduling()` ahora se difieren hasta que se resuelva `Schedule`.

Si su aplicación dependía del tiempo de registro de programación inmediata durante el arranque, es posible que deba ajustar esa lógica.

<a id="security"></a>
### Seguridad

<a id="request-forgery-protection"></a>
#### Solicitar protección contra falsificación

**Probabilidad de impacto: alta**

El middleware CSRF de Laravel pasó a llamarse `VerifyCsrfToken` a `PreventRequestForgery` y ahora incluye verificación del origen de la solicitud mediante el encabezado `Sec-Fetch-Site`.

`VerifyCsrfToken` y `ValidateCsrfToken` siguen siendo alias obsoletos, pero las referencias directas deben actualizarse a `PreventRequestForgery`, especialmente cuando se excluye middleware en pruebas o definiciones de ruta:

```php
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;

// Laravel <= 12.x
->withoutMiddleware([VerifyCsrfToken::class]);

// Laravel >= 13.x
->withoutMiddleware([PreventRequestForgery::class]);
```

La API de configuración de middleware ahora también proporciona `preventRequestForgery(...)`.

<a id="support"></a>
### Soporte

<a id="manager-extend-callback-binding"></a>
#### Administrador `extend` Enlace de devolución de llamada

**Probabilidad de impacto: baja**

Las funciones anónimas de controladores personalizados registradas mediante los métodos del administrador `extend` ahora están vinculadas a la instancia del administrador.

Si anteriormente confiaba en otro objeto vinculado (como una instancia de proveedor de servicios) como `$this` dentro de estas devoluciones de llamada, debe mover esos valores a capturas de función anónima usando `use (...)`.

<a id="str-factories-reset-between-tests"></a>
#### `Str` Restablecimiento de fábricas entre pruebas

**Probabilidad de impacto: baja**

Laravel ahora restablece las fábricas personalizadas de `Str` durante el desmontaje de la prueba.

Si sus pruebas dependían de UUID/ULID/fábricas de cadenas aleatorias personalizadas que persisten entre los métodos de prueba, debe configurarlas en cada prueba o enlace de configuración relevante.

<a id="jsfrom-uses-unescaped-unicode-by-default"></a>
#### `Js::from` utiliza Unicode sin escape de forma predeterminada

**Probabilidad de impacto: muy baja**

`Illuminate\Support\Js::from` ahora usa `JSON_UNESCAPED_UNICODE` de forma predeterminada.

Si sus pruebas o comparaciones de resultados de frontend dependían de secuencias Unicode escapadas (por ejemplo, `\u00e8`), actualice sus expectativas.

<a id="utilities"></a>
### Utilidades

<a id="symfony-polyfill"></a>
#### Symfony PHP 8.5 Polyfill y conflictos de funciones globales

**Probabilidad de impacto: baja**

Laravel 13 introduce una dependencia de `symfony/polyfill-php85`. En versiones de PHP inferiores a 8.5, este polyfill define funciones globales como `array_first()` y `array_last()` a menos que ya se hayan definido anteriormente durante el arranque.

Estas funciones pueden entrar en conflicto con paquetes de ayuda heredados como `laravel/helpers` o ayudas globales personalizadas que usan los mismos nombres. Por ejemplo, el ayudante histórico `array_first()` aceptó una devolución de llamada para devolver el primer elemento coincidente, mientras que la versión polillenada solo devuelve el primer elemento de la matriz.

Para evitar conflictos y garantizar un comportamiento coherente en todas las versiones de PHP, debería preferir los métodos `Illuminate\Support\Arr`:

```php
use Illuminate\Support\Arr;

Arr::first($array, function ($value) {
  return /* condition */;
});
```

<a id="views"></a>
### Vistas

<a id="pagination-bootstrap-view-names"></a>
#### Nombres de vistas de Bootstrap de paginación

**Probabilidad de impacto: baja**

Los nombres de las vistas de paginación interna para los valores predeterminados de Bootstrap 3 ahora son explícitos:

```text
// Laravel <= 12.x
pagination::default
pagination::simple-default

// Laravel >= 13.x
pagination::bootstrap-3
pagination::simple-bootstrap-3
```

Si su aplicación hace referencia directamente a los nombres de vistas de paginación anteriores, actualice esas referencias.

<a id="miscellaneous"></a>
### Varios

También le recomendamos que vea los cambios en `laravel/laravel` [repositorio de GitHub](https://github.com/laravel/laravel). Si bien muchos de estos cambios no son necesarios, es posible que desee mantener estos archivos sincronizados con su aplicación. Algunos de estos cambios se cubrirán en esta guía de actualización, pero otros, como los cambios en los archivos de configuración o los comentarios, no. Puede ver fácilmente los cambios con la [herramienta de comparación de GitHub](https://github.com/laravel/laravel/compare/12.x...13.x) y elegir qué actualizaciones son importantes para usted.
