---
title: "Horizonte de Laravel"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Instalación](#installation)
    - [Configuración](#configuration)
    - [Autorización del panel](#dashboard-authorization)
    - [Máximo de intentos de trabajo](#max-job-attempts)
    - [Tiempo de espera del trabajo](#job-timeout)
    - [Retroceso de trabajo](#job-backoff)
    - [Otras opciones de trabajador](#other-worker-options)
    - [Trabajos silenciados](#silenced-jobs)
- [Estrategias de equilibrio](#balancing-strategies)
    - [Equilibrio automático](#auto-balancing)
    - [Equilibrio simple](#simple-balancing)
    - [Sin equilibrio](#no-balancing)
- [Actualizando Horizon](#upgrading-horizon)
- [Ejecutando Horizon](#running-horizon)
    - [Implementación de Horizon](#deploying-horizon)
- [Etiquetas](#tags)
- [Notificaciones](#notifications)
- [Métricas](#metrics)
- [Eliminación de trabajos fallidos](#deleting-failed-jobs)
- [Borrar trabajos de colas](#clearing-jobs-from-queues)

<a id="introduction"></a>
## Introducción

> **Nota:**
> Antes de profundizar en Laravel Horizon, debe familiarizarse con los [servicios básicos de colas de Laravel](../queues/). Horizon aumenta la cola de Laravel con características adicionales que pueden resultar confusas si aún no está familiarizado con las características básicas de la cola que ofrece Laravel.

[Laravel Horizon](https://github.com/laravel/horizon) proporciona un hermoso panel y una configuración basada en código para sus [colas de Redis con tecnología Laravel](../queues/). Horizon le permite monitorear fácilmente métricas clave de su sistema de colas, como el rendimiento del trabajo, el tiempo de ejecución y las fallas del trabajo.

Cuando usa Horizon, toda la configuración de su trabajador de cola se almacena en un archivo de configuración único y simple. Al definir la configuración de los trabajadores de su aplicación en un archivo de versión controlada, puede escalar o modificar fácilmente los trabajadores de la cola de su aplicación al implementarla.

<img src="https://laravel.com/img/docs/horizon-example.png">

<a id="installation"></a>
## Instalación

> **Advertencia:**
> Laravel Horizon requiere que uses [Redis](https://redis.io) para alimentar tu cola. Por lo tanto, debe asegurarse de que su conexión de cola esté configurada en `redis` en el archivo de configuración `config/queue.php` de su aplicación. Horizon no es compatible con Redis Cluster en este momento.

Puede instalar Horizon en su proyecto utilizando el administrador de paquetes de Composer:

```shell
composer require laravel/horizon
```

Después de instalar Horizon, publique sus activos usando el comando `horizon:install` Artisan:

```shell
php artisan horizon:install
```

<a id="configuration"></a>
### Configuración

Después de publicar los activos de Horizon, su archivo de configuración principal se ubicará en `config/horizon.php`. Este archivo de configuración le permite configurar las opciones del trabajador de cola para su aplicación. Cada opción de configuración incluye una descripción de su propósito, así que asegúrese de explorar este archivo a fondo.

> **Advertencia:**
> Horizon utiliza internamente una conexión Redis denominada `horizon`. Este nombre de conexión de Redis está reservado y no debe asignarse a otra conexión de Redis en el archivo de configuración `database.php` o como el valor de la opción `use` en el archivo de configuración `horizon.php`.

<a id="content-security-policy-csp-nonce"></a>
#### Política de seguridad de contenido (CSP) Nonce

Si desea utilizar un atributo [nonce](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/nonce) en las etiquetas de secuencia de comandos y de estilo utilizadas en las vistas de Horizon como parte de su [Política de seguridad de contenido](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP), puede utilizar el método `Horizon::cspNonce` para especificar el nonce a utilizar. Normalmente, este método debe invocarse dentro del middleware para que se asigne un nuevo nonce a cada solicitud:

```php
use Closure;
use Illuminate\Http\Request;
use Laravel\Horizon\Horizon;
use Symfony\Component\HttpFoundation\Response;

public function handle(Request $request, Closure $next): Response
{
    Horizon::cspNonce('csp-nonce');

    return $next($request);
}
```

Puede agregar este middleware a la opción `middleware` en el archivo de configuración `config/horizon.php` de su aplicación:

```php
'middleware' => [
    'web',
    App\Http\Middleware\AddHorizonCspNonce::class,
],
```

<a id="environments"></a>
#### Entornos

Después de la instalación, la opción de configuración principal de Horizon con la que debe familiarizarse es la opción de configuración `environments`. Esta opción de configuración es una serie de entornos en los que se ejecuta su aplicación y define las opciones de proceso de trabajo para cada entorno. De forma predeterminada, esta entrada contiene un entorno `production` y `local`. Sin embargo, puede agregar más entornos según sea necesario:

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            'maxProcesses' => 10,
            'balanceMaxShift' => 1,
            'balanceCooldown' => 3,
        ],
    ],

    'local' => [
        'supervisor-1' => [
            'maxProcesses' => 3,
        ],
    ],
],
```

También puede definir un entorno comodín (`*`) que se utilizará cuando no se encuentre ningún otro entorno coincidente:

```php
'environments' => [
    // ...

    '*' => [
        'supervisor-1' => [
            'maxProcesses' => 3,
        ],
    ],
],
```

Cuando inicie Horizon, utilizará las opciones de configuración del proceso de trabajo para el entorno en el que se ejecuta su aplicación. Normalmente, el entorno está determinado por el valor de `APP_ENV` [variable de entorno](../configuration/#determining-the-current-environment). Por ejemplo, el entorno predeterminado de Horizon `local` está configurado para iniciar tres procesos de trabajo y equilibrar automáticamente la cantidad de procesos de trabajo asignados a cada cola. El entorno predeterminado `production` está configurado para iniciar un máximo de 10 procesos de trabajo y equilibrar automáticamente la cantidad de procesos de trabajo asignados a cada cola.

> **Advertencia:**
> Debe asegurarse de que la parte `environments` de su archivo de configuración `horizon` contenga una entrada para cada [entorno](../configuration/#environment-configuration) en el que planea ejecutar Horizon.

<a id="supervisors"></a>
#### Supervisores

Como puede ver en el archivo de configuración predeterminado de Horizon, cada entorno puede contener uno o más "supervisores". De forma predeterminada, el archivo de configuración define este supervisor como `supervisor-1`; sin embargo, usted es libre de nombrar a sus supervisores como quiera. Cada supervisor es esencialmente responsable de "supervisar" un grupo de procesos de trabajo y se encarga de equilibrar los procesos de trabajo en las colas.

Puede agregar supervisores adicionales a un entorno determinado si desea definir un nuevo grupo de procesos de trabajo que deben ejecutarse en ese entorno. Puede optar por hacer esto si desea definir una estrategia de equilibrio diferente o un recuento de procesos de trabajo para una cola determinada utilizada por su aplicación.

<a id="maintenance-mode"></a>
#### Modo de mantenimiento

Mientras su aplicación esté en [modo de mantenimiento](../configuration/#maintenance-mode), Horizon no procesará los trabajos en cola a menos que la opción `force` del supervisor esté definida como `true` dentro del archivo de configuración de Horizon:

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            // ...
            'force' => true,
        ],
    ],
],
```

<a id="default-values"></a>
#### Valores predeterminados

Dentro del archivo de configuración predeterminado de Horizon, verá una opción de configuración `defaults`. Esta opción de configuración especifica los valores predeterminados para los [supervisors](#supervisors). Los valores de configuración predeterminados del supervisor se fusionarán en la configuración del supervisor para cada entorno, lo que le permitirá evitar repeticiones innecesarias al definir sus supervisores.

<a id="dashboard-authorization"></a>
### Autorización del panel

Se puede acceder al panel de Horizon a través de la ruta `/horizon`. De forma predeterminada, solo podrá acceder a este panel en el entorno `local`. Sin embargo, dentro de su archivo `app/Providers/HorizonServiceProvider.php`, hay una [definición de puerta de autorización](../authorization/#gates). Esta puerta de autorización controla el acceso a Horizon en entornos **no locales**. Usted es libre de modificar esta puerta según sea necesario para restringir el acceso a su instalación de Horizon:

```php
/**
 * Register the Horizon gate.
 *
 * This gate determines who can access Horizon in non-local environments.
 */
protected function gate(): void
{
    Gate::define('viewHorizon', function (User $user) {
        return in_array($user->email, [
            'taylor@laravel.com',
        ]);
    });
}
```

<a id="alternative-authentication-strategies"></a>
#### Estrategias de autenticación alternativas

Recuerde que Laravel inyecta automáticamente al usuario autenticado en la función anónima de la puerta. Si su aplicación proporciona seguridad de Horizon a través de otro método, como restricciones de IP, es posible que sus usuarios de Horizon no necesiten "iniciar sesión". Por lo tanto, deberá cambiar la firma de función anónima `function (User $user)` anterior a `function (User $user = null)` para obligar a Laravel a no requerir autenticación.

<a id="max-job-attempts"></a>
### Máximo de intentos de trabajo

> **Nota:**
> Antes de refinar estas opciones, asegúrese de estar familiarizado con los [servicios de cola ](../queues/#max-job-attempts-and-timeout) predeterminados de Laravel y el concepto de 'intentos'.

Puede definir el número máximo de intentos que puede consumir un trabajo dentro de la configuración de un supervisor:

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            // ...
            'tries' => 10,
        ],
    ],
],
```

> **Nota:**
> Esta opción es similar a la opción `--tries` cuando se utiliza el comando Artisan para procesar colas.

Ajustar la opción `tries` es esencial cuando se utilizan middlewares como `WithoutOverlapping` o `RateLimited` porque consumen intentos. Para manejar esto, ajuste el valor de configuración `tries` ya sea en el nivel de supervisor o definiendo la propiedad `$tries` en la clase de trabajo.

Si no configura la opción `tries`, Horizon utiliza de forma predeterminada un solo intento, a menos que la clase de trabajo defina `$tries`, que tiene prioridad sobre la configuración de Horizon.

Configurar `tries` o `$tries` en 0 permite intentos ilimitados, lo cual es ideal cuando el número de intentos es incierto. Para evitar errores interminables, puede limitar la cantidad de excepciones permitidas configurando la propiedad `$maxExceptions` en la clase de trabajo.

<a id="job-timeout"></a>
### Tiempo de espera del trabajo

De manera similar, puede establecer un valor `timeout` en el nivel de supervisor, que especifica cuántos segundos un proceso de trabajo puede ejecutar un trabajo antes de que se termine por la fuerza. Una vez finalizado, el trabajo se reintentará o se marcará como fallido, según la configuración de su cola:

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            // ...
            'timeout' => 60,
        ],
    ],
],
```

> **Advertencia:**
> Al utilizar la estrategia de equilibrio `auto`, Horizon considerará a los trabajadores en progreso como "colgados" y los matará a la fuerza después del tiempo de espera de Horizon durante la reducción. Asegúrese siempre de que el tiempo de espera de Horizon sea mayor que cualquier tiempo de espera a nivel de trabajo; de lo contrario, los trabajos podrían finalizar a mitad de la ejecución. Además, el valor `timeout` siempre debe ser al menos unos segundos más corto que el valor `retry_after` definido en su archivo de configuración `config/queue.php`. De lo contrario, es posible que sus trabajos se procesen dos veces.

<a id="job-backoff"></a>
### Retraso del trabajo

Puede definir el valor `backoff` en el nivel de supervisor para especificar cuánto tiempo debe esperar Horizon antes de volver a intentar un trabajo que encuentre una excepción no controlada:

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            // ...
            'backoff' => 10,
        ],
    ],
],
```

También puede configurar retrocesos "exponenciales" utilizando una matriz para el valor `backoff`. En este ejemplo, el retraso del reintento será de 1 segundo para el primer reintento, 5 segundos para el segundo reintento, 10 segundos para el tercer reintento y 10 segundos para cada reintento posterior si quedan más intentos:

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            // ...
            'backoff' => [1, 5, 10],
        ],
    ],
],
```

<a id="other-worker-options"></a>
### Otras opciones para los trabajadores

Además de `tries`, `timeout` y `backoff`, cada supervisor acepta varias otras opciones que controlan cómo se comportan sus procesos de trabajo y cuándo se reinician automáticamente. Reiniciar periódicamente los trabajadores es una buena práctica para procesos de larga duración, ya que ayuda a proteger contra pérdidas de memoria:

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            // ...
            'memory' => 128,
            'maxJobs' => 1000,
            'maxTime' => 3600,
            'sleep' => 3,
            'rest' => 0,
            'nice' => 0,
        ],
    ],
],
```

<div class="content-list" markdown="1">

- `memory` define la cantidad máxima de memoria, en megabytes, que un único proceso de trabajo puede consumir antes de reiniciarse. De forma predeterminada, este valor es `128`.
- `maxJobs` define la cantidad de trabajos que un trabajador debe procesar antes de reiniciar. Un valor de `0` indica que los trabajadores no deben reiniciarse según la cantidad de trabajos procesados. De forma predeterminada, este valor es `0`.
- `maxTime` define la cantidad de segundos que un trabajador debe ejecutar antes de reiniciar. Un valor de `0` indica que los trabajadores no se deben reiniciar según el tiempo. De forma predeterminada, este valor es `0`.
- `sleep` define la cantidad de segundos que un trabajador debe esperar cuando no hay ningún trabajo disponible antes de volver a sondear la cola en busca de nuevos trabajos. De forma predeterminada, este valor es `3`.
- `rest` define el número de segundos de pausa entre el procesamiento de cada trabajo. De forma predeterminada, este valor es `0`.
- `nice` define la "amabilidad" (prioridad de programación) de los procesos de trabajo. Un valor más alto le da al proceso una prioridad más baja. De forma predeterminada, este valor es `0`.

</div>

<a id="silenced-jobs"></a>
### Trabajos silenciados

A veces, es posible que no esté interesado en ver ciertos trabajos enviados por su aplicación o paquetes de terceros. En lugar de que estos trabajos ocupen espacio en su lista de "Trabajos completados", puede silenciarlos. Para comenzar, agregue el nombre de clase del trabajo a la opción de configuración `silenced` en el archivo de configuración `horizon` de su aplicación:

```php
'silenced' => [
    App\Jobs\ProcessPodcast::class,
],
```

Además de silenciar clases de trabajos individuales, Horizon también admite el silenciamiento de trabajos basados ​​en [tags](#tags). Esto puede resultar útil si desea ocultar varios trabajos que comparten una etiqueta común:

```php
'silenced_tags' => [
    'notifications'
],
```

Alternativamente, el trabajo que desea silenciar puede implementar la interfaz `Laravel\Horizon\Contracts\Silenced`. Si un trabajo implementa esta interfaz, se silenciará automáticamente, incluso si no está presente en la matriz de configuración `silenced`:

```php
use Laravel\Horizon\Contracts\Silenced;

class ProcessPodcast implements ShouldQueue, Silenced
{
    use Queueable;

    // ...
}
```

<a id="balancing-strategies"></a>
## Estrategias de equilibrio

Cada supervisor puede procesar una o más colas, pero a diferencia del sistema de colas predeterminado de Laravel, Horizon le permite elegir entre tres estrategias de equilibrio de trabajadores: `auto`, `simple` y `false`.

<a id="auto-balancing"></a>
### Equilibrio automático

La estrategia `auto`, que es la estrategia predeterminada, ajusta la cantidad de procesos de trabajo por cola en función de la carga de trabajo actual de la cola. Por ejemplo, si su cola `notifications` tiene 1000 trabajos pendientes mientras su cola `default` está vacía, Horizon asignará más trabajadores a su cola `notifications` hasta que la cola esté vacía.

Al utilizar la estrategia `auto`, también puede configurar las opciones de configuración `minProcesses` y `maxProcesses`:

<div class="content-list" markdown="1">

- `minProcesses` define el número mínimo de procesos de trabajo por cola. Este valor debe ser mayor o igual a 1.
- `maxProcesses` define el número total máximo de procesos de trabajo al que Horizon puede escalar en todas las colas. Normalmente, este valor debe ser mayor que el número de colas multiplicado por el valor `minProcesses`. Para evitar que el supervisor genere procesos, puede establecer este valor en 0.

</div>

Por ejemplo, puede configurar Horizon para mantener al menos un proceso por cola y escalar hasta un total de 10 procesos de trabajo:

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            'connection' => 'redis',
            'queue' => ['default', 'notifications'],
            'balance' => 'auto',
            'autoScalingStrategy' => 'time',
            'minProcesses' => 1,
            'maxProcesses' => 10,
            'balanceMaxShift' => 1,
            'balanceCooldown' => 3,
        ],
    ],
],
```

La opción de configuración `autoScalingStrategy` determina cómo Horizon asignará más procesos de trabajo a las colas. Puedes elegir entre tres estrategias:

<div class="content-list" markdown="1">

- La estrategia `time` asignará trabajadores en función del tiempo total estimado que llevará eliminar la cola.
- La estrategia `size` asignará trabajadores en función del número total de trabajos en la cola.
- La estrategia `log` asignará trabajadores según el logaritmo del número de trabajos en la cola. Esto evita que una cola significativamente mayor reciba una proporción desproporcionadamente grande de trabajadores.

</div>

Los valores de configuración `balanceMaxShift` y `balanceCooldown` determinan la rapidez con la que Horizon escalará para satisfacer la demanda de los trabajadores. En el ejemplo anterior, se creará o destruirá un máximo de un proceso nuevo cada tres segundos. Usted es libre de modificar estos valores según sea necesario según las necesidades de su aplicación.

<a id="auto-queue-priorities"></a>
#### Prioridades de cola y equilibrio automático

Cuando se utiliza la estrategia de equilibrio `auto`, Horizon no aplica una prioridad estricta entre colas. El orden de las colas en la configuración de un supervisor no afecta la forma en que se asignan los procesos de trabajo. En cambio, Horizon se basa en el `autoScalingStrategy` seleccionado para asignar dinámicamente procesos de trabajo según la carga de la cola.

Por ejemplo, en la siguiente configuración, la cola alta no tiene prioridad sobre la cola predeterminada, a pesar de aparecer primero en la lista:

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            // ...
            'queue' => ['high', 'default'],
            'minProcesses' => 1,
            'maxProcesses' => 10,
        ],
    ],
],
```

Si necesita imponer una prioridad relativa entre colas, puede definir varios supervisores y asignar explícitamente recursos de procesamiento:

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            // ...
            'queue' => ['default'],
            'minProcesses' => 1,
            'maxProcesses' => 10,
        ],
        'supervisor-2' => [
            // ...
            'queue' => ['images'],
            'minProcesses' => 1,
            'maxProcesses' => 1,
        ],
    ],
],
```

En este ejemplo, el `queue` predeterminado puede escalar hasta 10 procesos, mientras que la cola `images` está limitada a un proceso. Esta configuración garantiza que sus colas puedan escalar de forma independiente.

> **Nota:**
> Al distribuir trabajos que consumen muchos recursos, a veces es mejor asignarlos a una cola dedicada con un valor `maxProcesses` limitado. De lo contrario, estos trabajos podrían consumir recursos excesivos de la CPU y sobrecargar su sistema.

<a id="simple-balancing"></a>
### Equilibrio simple

La estrategia `simple` distribuye los procesos de trabajo de manera uniforme entre las colas especificadas. Con esta estrategia, Horizon no escala automáticamente la cantidad de procesos de trabajo. Más bien, utiliza una cantidad fija de procesos:

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            // ...
            'queue' => ['default', 'notifications'],
            'balance' => 'simple',
            'processes' => 10,
        ],
    ],
],
```

En el ejemplo anterior, Horizon asignará 5 procesos a cada cola, dividiendo el total de 10 en partes iguales.

Si desea controlar la cantidad de procesos de trabajo asignados a cada cola individualmente, puede definir varios supervisores:

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            // ...
            'queue' => ['default'],
            'balance' => 'simple',
            'processes' => 10,
        ],
        'supervisor-notifications' => [
            // ...
            'queue' => ['notifications'],
            'balance' => 'simple',
            'processes' => 2,
        ],
    ],
],
```

Con esta configuración, Horizon asignará 10 procesos a la cola `default` y 2 procesos a la cola `notifications`.

<a id="no-balancing"></a>
### Sin equilibrio

Cuando la opción `balance` está configurada en `false`, Horizon procesa las colas estrictamente en el orden en que aparecen, similar al sistema de colas predeterminado de Laravel. Sin embargo, seguirá aumentando la cantidad de procesos de trabajo si los trabajos comienzan a acumularse:

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            // ...
            'queue' => ['default', 'notifications'],
            'balance' => false,
            'minProcesses' => 1,
            'maxProcesses' => 10,
        ],
    ],
],
```

En el ejemplo anterior, los trabajos de la cola `default` siempre tienen prioridad sobre los trabajos de la cola `notifications`. Por ejemplo, si hay 1000 trabajos en `default` y solo 10 en `notifications`, Horizon procesará completamente todos los trabajos de `default` antes de manejar cualquiera de `notifications`.

Puede controlar la capacidad de Horizon para escalar procesos de trabajo utilizando las opciones `minProcesses` y `maxProcesses`:

<div class="content-list" markdown="1">

- `minProcesses` define el número mínimo de procesos de trabajo en total. Este valor debe ser mayor o igual a 1.
- `maxProcesses` define el número total máximo de procesos de trabajo al que Horizon puede escalar.

</div>

<a id="upgrading-horizon"></a>
## Actualizando Horizonte

Al actualizar a una nueva versión principal de Horizon, es importante que revise detenidamente [la guía de actualización](https://github.com/laravel/horizon/blob/master/UPGRADE.md).

<a id="running-horizon"></a>
## Horizonte corriendo

Una vez que haya configurado a sus supervisores y trabajadores en el archivo de configuración `config/horizon.php` de su aplicación, puede iniciar Horizon usando el comando `horizon` Artisan. Este único comando iniciará todos los procesos de trabajo configurados para el entorno actual:

```shell
php artisan horizon
```

Puede pausar el proceso de Horizon e indicarle que continúe procesando trabajos usando los comandos `horizon:pause` y `horizon:continue` Artisan:

```shell
php artisan horizon:pause

php artisan horizon:continue
```

También puede pausar y continuar con Horizon [supervisores](#supervisors) específicos mediante los comandos `horizon:pause-supervisor` y `horizon:continue-supervisor` Artisan:

```shell
php artisan horizon:pause-supervisor supervisor-1

php artisan horizon:continue-supervisor supervisor-1
```

Puede verificar el estado actual del proceso Horizon usando el comando `horizon:status` Artisan:

```shell
php artisan horizon:status
```

Puede verificar el estado actual de un Horizon específico [supervisor](#supervisors) usando el comando `horizon:supervisor-status` Artisan:

```shell
php artisan horizon:supervisor-status supervisor-1
```

Puede finalizar elegantemente el proceso de Horizon utilizando el comando `horizon:terminate` Artisan. Todos los trabajos que se estén procesando actualmente se completarán y luego Horizon dejará de ejecutarse:

```shell
php artisan horizon:terminate
```

<a id="automatically-restarting-horizon"></a>
#### Reinicio automático de Horizon

Durante el desarrollo local, puede ejecutar el comando `horizon:listen`. Al utilizar el comando `horizon:listen`, no es necesario reiniciar Horizon manualmente cuando desee volver a cargar el código actualizado. Antes de utilizar esta función, debe asegurarse de que [Node](https://nodejs.org) esté instalado en su entorno de desarrollo local. Además, debes instalar la [biblioteca de observación de archivos Chokidar](https://github.com/paulmillr/chokidar) dentro de tu proyecto:

```shell
npm install --save-dev chokidar
```

Una vez que Chokidar esté instalado, puede iniciar Horizon usando el comando `horizon:listen`:

```shell
php artisan horizon:listen
```

Cuando se ejecuta dentro de Docker o Vagrant, debe usar la opción `--poll`:

```shell
php artisan horizon:listen --poll
```

Puede configurar los directorios y archivos que deben monitorearse usando la opción de configuración `watch` dentro del archivo de configuración `config/horizon.php` de su aplicación:

```php
'watch' => [
    'app',
    'bootstrap',
    'config',
    'database',
    'public/**/*.php',
    'resources/**/*.php',
    'routes',
    'composer.lock',
    '.env',
],
```

<a id="deploying-horizon"></a>
### Implementación de Horizon

Cuando esté listo para implementar Horizon en el servidor real de su aplicación, debe configurar un monitor de proceso para monitorear el comando `php artisan horizon` y reiniciarlo si se cierra inesperadamente. No se preocupe, analizaremos cómo instalar un monitor de procesos a continuación.

Durante el proceso de implementación de su aplicación, debe indicarle al proceso de Horizon que finalice para que su monitor de proceso lo reinicie y reciba los cambios de código:

```shell
php artisan horizon:terminate
```

<a id="installing-supervisor"></a>
#### Instalando Supervisor

Supervisor es un monitor de procesos para el sistema operativo Linux y reiniciará automáticamente su proceso `horizon` si deja de ejecutarse. Para instalar Supervisor en Ubuntu, puede utilizar el siguiente comando. Si no estás usando Ubuntu, probablemente puedas instalar Supervisor usando el administrador de paquetes de tu sistema operativo:

```shell
sudo apt-get install supervisor
```

> **Nota:**
> Si configurar Supervisor usted mismo le parece abrumador, considere usar [Laravel Cloud](https://cloud.laravel.com), que puede administrar procesos en segundo plano para sus aplicaciones Laravel.

<a id="supervisor-configuration"></a>
#### Configuración del supervisor

Los archivos de configuración del supervisor generalmente se almacenan en el directorio `/etc/supervisor/conf.d` de su servidor. Dentro de este directorio, puede crear cualquier número de archivos de configuración que indiquen al supervisor cómo se deben monitorear sus procesos. Por ejemplo, creemos un archivo `horizon.conf` que inicia y monitorea un proceso `horizon`:

```ini
[program:horizon]
process_name=%(program_name)s
command=php /home/forge/example.com/artisan horizon
autostart=true
autorestart=true
user=forge
redirect_stderr=true
stdout_logfile=/home/forge/example.com/horizon.log
stopwaitsecs=3600
```

Al definir su configuración de Supervisor, debe asegurarse de que el valor de `stopwaitsecs` sea mayor que la cantidad de segundos consumidos por su trabajo de ejecución más larga. De lo contrario, Supervisor puede finalizar el trabajo antes de que termine de procesarse.

> **Advertencia:**
> Si bien los ejemplos anteriores son válidos para servidores basados en Ubuntu, la ubicación y la extensión de archivo esperada de los archivos de configuración de Supervisor pueden variar entre otros sistemas operativos de servidor. Consulte la documentación de su servidor para obtener más información.

<a id="starting-supervisor"></a>
#### Supervisor inicial

Una vez creado el archivo de configuración, puede actualizar la configuración del Supervisor e iniciar los procesos monitoreados usando los siguientes comandos:

```shell
sudo supervisorctl reread

sudo supervisorctl update

sudo supervisorctl start horizon
```

> **Nota:**
> Para obtener más información sobre cómo ejecutar Supervisor, consulte la [documentación de Supervisor](http://supervisord.org/index.html).

<a id="tags"></a>
## Etiquetas

Horizon le permite asignar "etiquetas" a trabajos, incluidos mensajes por correo, eventos de transmisión, notificaciones y detectores de eventos en cola. De hecho, Horizon etiquetará de forma inteligente y automática la mayoría de los trabajos según los modelos de Eloquent adjuntos al trabajo. Por ejemplo, eche un vistazo al siguiente trabajo:

```php
<?php

namespace App\Jobs;

use App\Models\Video;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class RenderVideo implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Video $video,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // ...
    }
}
```

Si este trabajo está en cola con una instancia `App\Models\Video` que tiene un atributo `id` de `1`, recibirá automáticamente la etiqueta `App\Models\Video:1`. Esto se debe a que Horizon buscará en las propiedades del trabajo cualquier modelo de Eloquent. Si se encuentran modelos Eloquent, Horizon etiquetará inteligentemente el trabajo usando el nombre de clase y la clave principal del modelo:

```php
use App\Jobs\RenderVideo;
use App\Models\Video;

$video = Video::find(1);

RenderVideo::dispatch($video);
```

<a id="manually-tagging-jobs"></a>
#### Etiquetar trabajos manualmente

Si desea definir manualmente las etiquetas para uno de sus objetos en cola, puede definir un método `tags` en la clase:

```php
class RenderVideo implements ShouldQueue
{
    /**
     * Get the tags that should be assigned to the job.
     *
     * @return array<int, string>
     */
    public function tags(): array
    {
        return ['render', 'video:'.$this->video->id];
    }
}
```

<a id="manually-tagging-event-listeners"></a>
#### Etiquetado manual de oyentes de eventos

Al recuperar las etiquetas para un detector de eventos en cola, Horizon pasará automáticamente la instancia del evento al método `tags`, lo que le permitirá agregar datos del evento a las etiquetas:

```php
class SendRenderNotifications implements ShouldQueue
{
    /**
     * Get the tags that should be assigned to the listener.
     *
     * @return array<int, string>
     */
    public function tags(VideoRendered $event): array
    {
        return ['video:'.$event->video->id];
    }
}
```

<a id="notifications"></a>
## Notificaciones

> **Advertencia:**
> Al configurar Horizon para enviar notificaciones de Slack o SMS, debe revisar los [requisitos previos para el canal de notificación correspondiente](../notifications/).

Si desea recibir una notificación cuando una de sus colas tenga un tiempo de espera prolongado, puede utilizar los métodos `Horizon::routeMailNotificationsTo`, `Horizon::routeSlackNotificationsTo` y `Horizon::routeSmsNotificationsTo`. Puede llamar a estos métodos desde el método `boot` del `App\Providers\HorizonServiceProvider` de su aplicación:

```php
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    parent::boot();

    Horizon::routeSmsNotificationsTo('15556667777');
    Horizon::routeMailNotificationsTo('example@example.com');
    Horizon::routeSlackNotificationsTo('slack-webhook-url', '#channel');
}
```

<a id="configuring-notification-wait-time-thresholds"></a>
#### Configuración de umbrales de tiempo de espera de notificación

Puede configurar cuántos segundos se consideran una "espera larga" dentro del archivo de configuración `config/horizon.php` de su aplicación. La opción de configuración `waits` dentro de este archivo le permite controlar el umbral de espera larga para cada combinación de conexión/cola. Cualquier combinación de conexión/cola no definida tendrá de forma predeterminada un umbral de espera largo de 60 segundos:

```php
'waits' => [
    'redis:critical' => 30,
    'redis:default' => 60,
    'redis:batch' => 120,
],
```

Establecer el umbral de una cola en `0` deshabilitará las notificaciones de espera prolongada para esa cola.

<a id="metrics"></a>
## Métricas

Horizon incluye un panel de métricas que proporciona información sobre su trabajo y los tiempos de espera y el rendimiento de la cola. Para completar este panel, debe configurar el comando `snapshot` Artisan de Horizon para que se ejecute cada cinco minutos en el archivo `routes/console.php` de su aplicación:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('horizon:snapshot')->everyFiveMinutes();
```

Puede configurar cuántas instantáneas conserva Horizon para sus gráficos de métricas utilizando la opción `metrics.trim_snapshots` en el archivo de configuración `config/horizon.php` de su aplicación. Debido a que esta opción limita la cantidad de instantáneas en lugar de su antigüedad, el período de retención depende de la frecuencia con la que se ejecuta el comando `horizon:snapshot`:

```php
'metrics' => [
    'trim_snapshots' => [
        'job' => 24,
        'queue' => 24,
    ],
],
```

Si desea eliminar todos los datos métricos, puede invocar el comando `horizon:clear-metrics` Artisan:

```shell
php artisan horizon:clear-metrics
```

<a id="deleting-failed-jobs"></a>
## Eliminación de trabajos fallidos

Si desea eliminar un trabajo fallido, puede utilizar el comando `horizon:forget`. El comando `horizon:forget` acepta el ID o UUID del trabajo fallido como único argumento:

```shell
php artisan horizon:forget 5
```

Si desea eliminar todos los trabajos fallidos, puede proporcionar la opción `--all` al comando `horizon:forget`:

```shell
php artisan horizon:forget --all
```

<a id="clearing-jobs-from-queues"></a>
## Borrar trabajos de colas

Si desea eliminar todos los trabajos de la cola predeterminada de su aplicación, puede hacerlo usando el comando `horizon:clear` Artisan:

```shell
php artisan horizon:clear
```

Puede proporcionar la opción `queue` para eliminar trabajos de una cola específica:

```shell
php artisan horizon:clear --queue=emails
```
