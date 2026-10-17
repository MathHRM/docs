---
title: "Programación de tareas"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Definición de horarios](#defining-schedules)
    - [Programación de comandos artesanales](#scheduling-artisan-commands)
    - [Programación de trabajos en cola](#scheduling-queued-jobs)
    - [Programación de comandos de Shell](#scheduling-shell-commands)
    - [Opciones de frecuencia de programación](#schedule-frequency-options)
    - [Zonas horarias](#timezones)
    - [Prevención de superposiciones de tareas](#preventing-task-overlaps)
    - [Ejecución de tareas en un servidor](#running-tasks-on-one-server)
    - [Tareas en segundo plano](#background-tasks)
    - [Modo de mantenimiento](#maintenance-mode)
    - [Pausar tareas programadas](#pausing-scheduled-tasks)
    - [Programar grupos](#schedule-groups)
- [Ejecutando el Programador](#running-the-scheduler)
    - [Tareas programadas de menos de un minuto](#sub-minute-scheduled-tasks)
    - [Ejecución del programador localmente](#running-the-scheduler-locally)
- [Salida de tarea](#task-output)
- [Ganchos de tarea](#task-hooks)
- [Eventos](#events)

<a id="introduction"></a>
## Introducción

En el pasado, es posible que haya escrito una entrada de configuración cron para cada tarea que necesitaba programar en su servidor. Sin embargo, esto puede convertirse rápidamente en una molestia porque su programación de tareas ya no está bajo control de fuente y debe conectarse mediante SSH a su servidor para ver sus entradas cron existentes o agregar entradas adicionales.

El programador de comandos de Laravel ofrece un nuevo enfoque para administrar tareas programadas en su servidor. El programador le permite definir de manera fluida y expresiva su programación de comandos dentro de su propia aplicación Laravel. Cuando se utiliza el programador, solo se necesita una entrada cron en su servidor. Su programación de tareas generalmente se define en el archivo `routes/console.php` de su aplicación.

<a id="defining-schedules"></a>
## Definición de horarios

Puede definir todas sus tareas programadas en el archivo `routes/console.php` de su aplicación. Para empezar, echemos un vistazo a un ejemplo. En este ejemplo, programaremos un cierre que se realizará todos los días a medianoche. Dentro del cierre ejecutaremos una consulta a la base de datos para borrar una tabla:

```php
<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schedule;

Schedule::call(function () {
    DB::table('recent_users')->delete();
})->daily();
```

Además de programar mediante cierres, también puede programar [objetos invocables](https://secure.php.net/manual/en/language.oop5.magic.php#object.invoke). Los objetos invocables son clases PHP simples que contienen un método `__invoke`:

```php
Schedule::call(new DeleteRecentUsers)->daily();
```

Si prefiere reservar su archivo `routes/console.php` solo para definiciones de comandos, puede usar el método `withSchedule` en el archivo `bootstrap/app.php` de su aplicación para definir sus tareas programadas. Este método acepta un cierre que recibe una instancia del planificador:

```php
use Illuminate\Console\Scheduling\Schedule;

->withSchedule(function (Schedule $schedule) {
    $schedule->call(new DeleteRecentUsers)->daily();
})
```

Si desea ver una descripción general de sus tareas programadas y la próxima vez que están programadas para ejecutarse, puede usar el comando `schedule:list` Artisan:

```shell
php artisan schedule:list
```

<a id="scheduling-artisan-commands"></a>
### Programación de comandos artesanales

Además de programar cierres, también puede programar [comandos artesanales](../artisan/) y comandos del sistema. Por ejemplo, puede utilizar el método `command` para programar un comando Artisan utilizando el nombre o la clase del comando.

Al programar comandos de Artisan utilizando el nombre de clase del comando, puede pasar una serie de argumentos de línea de comandos adicionales que se deben proporcionar al comando cuando se invoca:

```php
use App\Console\Commands\SendEmailsCommand;
use Illuminate\Support\Facades\Schedule;

Schedule::command('emails:send Taylor --force')->daily();

Schedule::command(SendEmailsCommand::class, ['Taylor', '--force'])->daily();
```

<a id="scheduling-artisan-closure-commands"></a>
#### Programación de comandos de cierre artesanal

Si desea programar un comando Artisan definido por un cierre, puede encadenar los métodos relacionados con la programación después de la definición del comando:

```php
Artisan::command('delete:recent-users', function () {
    DB::table('recent_users')->delete();
})->purpose('Delete recent users')->daily();
```

Si necesita pasar argumentos al comando de cierre, puede proporcionárselos al método `schedule`:

```php
Artisan::command('emails:send {user} {--force}', function ($user) {
    // ...
})->purpose('Send emails to the specified user')->schedule(['Taylor', '--force'])->daily();
```

<a id="scheduling-queued-jobs"></a>
### Programación de trabajos en cola

El método `job` se puede utilizar para programar un [trabajo en cola](../queues/). Este método proporciona una forma cómoda de programar trabajos en cola sin utilizar el método `call` para definir cierres para poner en cola el trabajo:

```php
use App\Jobs\Heartbeat;
use Illuminate\Support\Facades\Schedule;

Schedule::job(new Heartbeat)->everyFiveMinutes();
```

Se pueden proporcionar un segundo y tercer argumento opcionales al método `job` que especifica el nombre de la cola y la conexión de la cola que se debe utilizar para poner en cola el trabajo:

```php
use App\Jobs\Heartbeat;
use Illuminate\Support\Facades\Schedule;

// Dispatch the job to the "heartbeats" queue on the "sqs" connection...
Schedule::job(new Heartbeat, 'heartbeats', 'sqs')->everyFiveMinutes();
```

<a id="scheduling-shell-commands"></a>
### Programación de comandos de Shell

El método `exec` se puede utilizar para enviar un comando al sistema operativo:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::exec('node /home/forge/script.js')->daily();
```

<a id="schedule-frequency-options"></a>
### Opciones de frecuencia de programación

Ya hemos visto algunos ejemplos de cómo puede configurar una tarea para que se ejecute en intervalos específicos. Sin embargo, hay muchas más frecuencias de programación de tareas que puedes asignar a una tarea:

<div class="overflow-auto">

| Método | Descripción |
| ---------------------------------- | -------------------------------------------------------- |
| `->cron('* * * * *');` | Ejecute la tarea en una programación cron personalizada.                  |
| `->everySecond();` | Ejecute la tarea cada segundo.                               |
| `->everyTwoSeconds();` | Ejecute la tarea cada dos segundos.                          |
| `->everyFiveSeconds();` | Ejecute la tarea cada cinco segundos.                         |
| `->everyTenSeconds();` | Ejecute la tarea cada diez segundos.                          |
| `->everyFifteenSeconds();` | Ejecute la tarea cada quince segundos.                      |
| `->everyTwentySeconds();` | Ejecute la tarea cada veinte segundos.                       |
| `->everyThirtySeconds();` | Ejecute la tarea cada treinta segundos.                       |
| `->everyMinute();` | Ejecute la tarea cada minuto.                               |
| `->everyTwoMinutes();` | Ejecute la tarea cada dos minutos.                          |
| `->everyThreeMinutes();` | Ejecute la tarea cada tres minutos.                        |
| `->everyFourMinutes();` | Ejecute la tarea cada cuatro minutos.                         |
| `->everyFiveMinutes();` | Ejecute la tarea cada cinco minutos.                         |
| `->everyTenMinutes();` | Ejecute la tarea cada diez minutos.                          |
| `->everyFifteenMinutes();` | Ejecute la tarea cada quince minutos.                      |
| `->everyThirtyMinutes();` | Ejecute la tarea cada treinta minutos.                       |
| `->hourly();` | Ejecute la tarea cada hora.                                 |
| `->hourlyAt(17);` | Ejecute la tarea cada hora a los 17 minutos de la hora.     |
| `->everyOddHour($minutes = 0);` | Ejecute la tarea cada hora impar.                             |
| `->everyTwoHours($minutes = 0);` | Ejecute la tarea cada dos horas.                            |
| `->everyThreeHours($minutes = 0);` | Ejecute la tarea cada tres horas.                          |
| `->everyFourHours($minutes = 0);` | Ejecute la tarea cada cuatro horas.                           |
| `->everySixHours($minutes = 0);` | Ejecute la tarea cada seis horas.                            |
| `->daily();` | Ejecute la tarea todos los días a medianoche.                      |
| `->dailyAt('13:00');` | Ejecute la tarea todos los días a las 13:00.                         |
| `->twiceDaily(1, 13);` | Ejecute la tarea diariamente a las 1:00 y 13:00.                      |
| `->twiceDailyAt(1, 13, 15);` | Ejecute la tarea diariamente a las 1:15 y 13:15.                      |
| `->daysOfMonth([1, 10, 20]);` | Ejecute la tarea en días específicos del mes.              |
| `->weekly();` | Ejecute la tarea todos los domingos a las 00:00.                      |
| `->weeklyOn(1, '8:00');` | Ejecute la tarea todas las semanas los lunes a las 8:00.               |
| `->monthly();` | Ejecute la tarea el primer día de cada mes a las 00:00.   |
| `->monthlyOn(4, '15:00');` | Ejecute la tarea todos los meses el día 4 a las 15:00.            |
| `->twiceMonthly(1, 16, '13:00');` | Ejecute la tarea mensualmente los días 1 y 16 a las 13:00.       |
| `->lastDayOfMonth('15:00');` | Ejecute la tarea el último día del mes a las 15:00.      |
| `->quarterly();` | Ejecute la tarea el primer día de cada trimestre a las 00:00. |
| `->quarterlyOn(4, '14:00');` | Ejecute la tarea cada trimestre el día 4 a las 14:00.          |
| `->yearly();` | Ejecute la tarea el primer día de cada año a las 00:00.    |
| `->yearlyOn(6, 1, '17:00');` | Ejecute la tarea todos los años el 1 de junio a las 17:00 horas.            |
| `->timezone('America/New_York');` | Establezca la zona horaria para la tarea.                           |

</div>

Estos métodos se pueden combinar con restricciones adicionales para crear programaciones aún más ajustadas que solo se ejecutan en ciertos días de la semana. Por ejemplo, puede programar un comando para que se ejecute semanalmente los lunes:

```php
use Illuminate\Support\Facades\Schedule;

// Run once per week on Monday at 1 PM...
Schedule::call(function () {
    // ...
})->weekly()->mondays()->at('13:00');

// Run hourly from 8 AM to 5 PM on weekdays...
Schedule::command('foo')
    ->weekdays()
    ->hourly()
    ->timezone('America/Chicago')
    ->between('8:00', '17:00');
```

A continuación se puede encontrar una lista de restricciones de cronograma adicionales:

<div class="overflow-auto">

| Método | Descripción |
| ---------------------------------------- | ------------------------------------------------------ |
| `->weekdays();` | Limite la tarea a los días laborables.                            |
| `->weekends();` | Limite la tarea a los fines de semana.                            |
| `->sundays();` | Limite la tarea al domingo.                              |
| `->mondays();` | Limite la tarea al lunes.                              |
| `->tuesdays();` | Limite la tarea al martes.                             |
| `->wednesdays();` | Limite la tarea al miércoles.                           |
| `->thursdays();` | Limite la tarea al jueves.                            |
| `->fridays();` | Limite la tarea al viernes.                              |
| `->saturdays();` | Limite la tarea al sábado.                            |
| `->days(array\|mixed);` | Limite la tarea a días específicos.                       |
| `->between($startTime, $endTime);` | Limite la tarea para que se ejecute entre las horas de inicio y finalización.     |
| `->unlessBetween($startTime, $endTime);` | Limite la tarea para que no se ejecute entre las horas de inicio y finalización. |
| `->when(Closure);` | Limite la tarea basándose en una prueba de verdad.                  |
| `->environments($env);` | Limite la tarea a entornos específicos.               |

</div>

<a id="day-constraints"></a>
#### Restricciones de día

El método `days` se puede utilizar para limitar la ejecución de una tarea a días específicos de la semana. Por ejemplo, puede programar un comando para que se ejecute cada hora los domingos y miércoles:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('emails:send')
    ->hourly()
    ->days([0, 3]);
```

Alternativamente, puede utilizar las constantes disponibles en la clase `Illuminate\Console\Scheduling\Schedule` al definir los días en los que se debe ejecutar una tarea:

```php
use Illuminate\Support\Facades;
use Illuminate\Console\Scheduling\Schedule;

Facades\Schedule::command('emails:send')
    ->hourly()
    ->days([Schedule::SUNDAY, Schedule::WEDNESDAY]);
```

<a id="between-time-constraints"></a>
#### Entre limitaciones de tiempo

El método `between` se puede utilizar para limitar la ejecución de una tarea según la hora del día:

```php
Schedule::command('emails:send')
    ->hourly()
    ->between('7:00', '22:00');
```

De manera similar, el método `unlessBetween` se puede utilizar para excluir la ejecución de una tarea durante un período de tiempo:

```php
Schedule::command('emails:send')
    ->hourly()
    ->unlessBetween('23:00', '4:00');
```

<a id="truth-test-constraints"></a>
#### Restricciones de la prueba de verdad

El método `when` se puede utilizar para limitar la ejecución de una tarea en función del resultado de una prueba de verdad determinada. En otras palabras, si el cierre dado devuelve `true`, la tarea se ejecutará siempre que ninguna otra condición restrictiva impida que se ejecute:

```php
Schedule::command('emails:send')->daily()->when(function () {
    return true;
});
```

El método `skip` puede verse como el inverso de `when`. Si el método `skip` devuelve `true`, la tarea programada no se ejecutará:

```php
Schedule::command('emails:send')->daily()->skip(function () {
    return true;
});
```

Cuando se utilizan métodos `when` encadenados, el comando programado solo se ejecutará si todas las condiciones `when` devuelven `true`.

<a id="environment-constraints"></a>
#### Restricciones ambientales

El método `environments` se puede utilizar para ejecutar tareas solo en los entornos dados (según lo definido por `APP_ENV` [variable de entorno](../configuration/#environment-configuration)):

```php
Schedule::command('emails:send')
    ->daily()
    ->environments(['staging', 'production']);
```

<a id="timezones"></a>
### Zonas horarias

Con el método `timezone`, puede especificar que la hora de una tarea programada debe interpretarse dentro de una zona horaria determinada:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('report:generate')
    ->timezone('America/New_York')
    ->at('2:00');
```

Si asigna repetidamente la misma zona horaria a todas sus tareas programadas, puede especificar qué zona horaria debe asignarse a todas las programaciones definiendo una opción `schedule_timezone` dentro del archivo de configuración `app` de su aplicación:

```php
'timezone' => 'UTC',

'schedule_timezone' => 'America/Chicago',
```

> **Advertencia:**
> Recuerde que algunas zonas horarias utilizan el horario de verano. Cuando se producen cambios de horario de verano, su tarea programada puede ejecutarse dos veces o incluso no ejecutarse en absoluto. Por este motivo, recomendamos evitar la programación de zonas horarias cuando sea posible.

<a id="preventing-task-overlaps"></a>
### Prevención de superposiciones de tareas

De forma predeterminada, las tareas programadas se ejecutarán incluso si la instancia anterior de la tarea todavía se está ejecutando. Para evitar esto, puede utilizar el método `withoutOverlapping`:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('emails:send')->withoutOverlapping();
```

En este ejemplo, el comando `emails:send` [Artisan command](../artisan/) se ejecutará cada minuto si aún no se está ejecutando. El método `withoutOverlapping` es especialmente útil si tiene tareas que varían drásticamente en su tiempo de ejecución, lo que le impide predecir exactamente cuánto tiempo llevará una tarea determinada.

Si es necesario, puede especificar cuántos minutos deben pasar antes de que expire el bloqueo "sin superposición". De forma predeterminada, el bloqueo caducará después de 24 horas:

```php
Schedule::command('emails:send')->withoutOverlapping(10);
```

Detrás de escena, el método `withoutOverlapping` utiliza el [cache](../cache/) de su aplicación para obtener bloqueos. Si es necesario, puede borrar estos bloqueos de caché utilizando el comando `schedule:clear-cache` Artisan. Por lo general, esto solo es necesario si una tarea se bloquea debido a un problema inesperado en el servidor.

<a id="running-tasks-on-one-server"></a>
### Ejecución de tareas en un servidor

> **Advertencia:**
> Para utilizar esta función, su aplicación debe utilizar el controlador de caché `database`, `memcached`, `dynamodb` o `redis` como controlador de caché predeterminado de su aplicación. Además, todos los servidores deben comunicarse con el mismo servidor de caché central.

Si el programador de su aplicación se ejecuta en varios servidores, puede limitar un trabajo programado para que se ejecute solo en un único servidor. Por ejemplo, supongamos que tiene una tarea programada que genera un nuevo informe todos los viernes por la noche. Si el programador de tareas se ejecuta en tres servidores de trabajo, la tarea programada se ejecutará en los tres servidores y generará el informe tres veces. ¡No es bueno!

Para indicar que la tarea debe ejecutarse en un solo servidor, utilice el método `onOneServer` al definir la tarea programada. El primer servidor que obtenga la tarea asegurará un bloqueo atómico en el trabajo para evitar que otros servidores ejecuten la misma tarea al mismo tiempo:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('report:generate')
    ->fridays()
    ->at('17:00')
    ->onOneServer();
```

Para aplicar `onOneServer` a todas las tareas programadas, puede llamar al método `alwaysOnOneServer` en el método `boot` del `AppServiceProvider` de su aplicación:

```php
use Illuminate\Support\Facades\Schedule;

public function boot(): void
{
    Schedule::alwaysOnOneServer();
}
```

Los cierres programados sin [name](#naming-unique-jobs) están excluidos y continuarán ejecutándose en todos los servidores.

Puede utilizar el método `useCache` para personalizar el almacén de caché utilizado por el programador para obtener los bloqueos atómicos necesarios para las tareas de un solo servidor:

```php
Schedule::useCache('database');
```

<a id="naming-unique-jobs"></a>
#### Nombrar trabajos de servidor único

A veces, es posible que necesite programar el mismo trabajo para que se envíe con diferentes parámetros, mientras le indica a Laravel que ejecute cada permutación del trabajo en un solo servidor. Para lograr esto, puede asignar a cada definición de programación un nombre único mediante el método `name`:

```php
Schedule::job(new CheckUptime('https://laravel.com'))
    ->name('check_uptime:laravel.com')
    ->everyFiveMinutes()
    ->onOneServer();

Schedule::job(new CheckUptime('https://vapor.laravel.com'))
    ->name('check_uptime:vapor.laravel.com')
    ->everyFiveMinutes()
    ->onOneServer();
```

De manera similar, a los cierres programados se les debe asignar un nombre si se pretende ejecutarlos en un servidor:

```php
Schedule::call(fn () => User::resetApiRequestCount())
    ->name('reset-api-request-count')
    ->daily()
    ->onOneServer();
```

<a id="background-tasks"></a>
### Tareas en segundo plano

De forma predeterminada, varias tareas programadas al mismo tiempo se ejecutarán secuencialmente según el orden definido en su método `schedule`. Si tiene tareas de larga duración, esto puede provocar que las tareas posteriores comiencen mucho más tarde de lo previsto. Si desea ejecutar tareas en segundo plano para que todas se ejecuten simultáneamente, puede utilizar el método `runInBackground`:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('analytics:report')
    ->daily()
    ->runInBackground();
```

> **Advertencia:**
> El método `runInBackground` solo se puede utilizar al programar tareas mediante los métodos `command` y `exec`.

<a id="maintenance-mode"></a>
### Modo de mantenimiento

Las tareas programadas de su aplicación no se ejecutarán cuando la aplicación esté en [modo de mantenimiento](../configuration/#maintenance-mode), ya que no queremos que sus tareas interfieran con ningún mantenimiento inacabado que pueda estar realizando en su servidor. Sin embargo, si desea forzar la ejecución de una tarea incluso en modo de mantenimiento, puede llamar al método `evenInMaintenanceMode` al definir la tarea:

```php
Schedule::command('emails:send')->evenInMaintenanceMode();
```

<a id="pausing-scheduled-tasks"></a>
### Pausar tareas programadas

Puede pausar temporalmente el procesamiento de tareas programadas sin cambiar el código implementado utilizando el comando `schedule:pause` Artisan:

```shell
php artisan schedule:pause
```

Mientras el programador esté en pausa, no se ejecutará ninguna tarea programada. Puede reanudar el procesamiento de tareas programadas utilizando el comando `schedule:continue`:

```shell
php artisan schedule:continue
```

Si una tarea aún debe ejecutarse mientras el programador está en pausa, puede marcarla con el método `evenWhenPaused`:

```php
Schedule::command('emails:send')->evenWhenPaused();
```

<a id="schedule-groups"></a>
### Programar grupos

Al definir múltiples tareas programadas con configuraciones similares, puede usar la función de agrupación de tareas de Laravel para evitar repetir la misma configuración para cada tarea. Agrupar tareas simplifica su código y garantiza la coherencia entre las tareas relacionadas.

Para crear un grupo de tareas programadas, invoque los métodos de configuración de tareas deseados, seguidos del método `group`. El método `group` acepta un cierre que se encarga de definir las tareas que comparten la configuración especificada:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::daily()
    ->onOneServer()
    ->timezone('America/New_York')
    ->group(function () {
        Schedule::command('emails:send --force');
        Schedule::command('emails:prune');
    });
```

<a id="running-the-scheduler"></a>
## Ejecutando el programador

Ahora que hemos aprendido cómo definir tareas programadas, analicemos cómo ejecutarlas realmente en nuestro servidor. El comando `schedule:run` Artisan evaluará todas sus tareas programadas y determinará si deben ejecutarse en función de la hora actual del servidor.

Entonces, cuando usamos el programador de Laravel, solo necesitamos agregar una única entrada de configuración cron a nuestro servidor que ejecuta el comando `schedule:run` cada minuto. Si no sabe cómo agregar entradas cron a su servidor, considere usar una plataforma administrada como [Laravel Cloud](https://cloud.laravel.com) que puede administrar la ejecución de la tarea programada por usted:

```shell
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

<a id="sub-minute-scheduled-tasks"></a>
### Tareas programadas en menos de un minuto

En la mayoría de los sistemas operativos, las tareas cron están limitadas a ejecutarse un máximo de una vez por minuto. Sin embargo, el programador de Laravel le permite programar tareas para que se ejecuten en intervalos más frecuentes, incluso una vez por segundo:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::call(function () {
    DB::table('recent_users')->delete();
})->everySecond();
```

Cuando se definen tareas de menos de un minuto dentro de su aplicación, el comando `schedule:run` continuará ejecutándose hasta el final del minuto actual en lugar de salir inmediatamente. Esto permite que el comando invoque todas las tareas de menos de un minuto requeridas a lo largo del minuto.

Dado que las tareas de menos de un minuto que tardan más de lo esperado en ejecutarse podrían retrasar la ejecución de tareas de menos de un minuto posteriores, se recomienda que todas las tareas de menos de un minuto envíen trabajos en cola o comandos en segundo plano para manejar el procesamiento real de la tarea:

```php
use App\Jobs\DeleteRecentUsers;

Schedule::job(new DeleteRecentUsers)->everyTenSeconds();

Schedule::command('users:delete')->everyTenSeconds()->runInBackground();
```

<a id="interrupting-sub-minute-tasks"></a>
#### Interrupción de tareas de menos de un minuto

Como el comando `schedule:run` se ejecuta durante todo el minuto de invocación cuando se definen tareas de menos de un minuto, es posible que en ocasiones necesite interrumpir el comando al implementar su aplicación. De lo contrario, una instancia del comando `schedule:run` que ya se esté ejecutando continuaría usando el código previamente implementado de su aplicación hasta que finalice el minuto actual.

Para interrumpir las invocaciones de `schedule:run` en curso, puede agregar el comando `schedule:interrupt` al script de implementación de su aplicación. Este comando debe invocarse después de que su aplicación haya terminado de implementarse:

```shell
php artisan schedule:interrupt
```

<a id="running-the-scheduler-locally"></a>
### Ejecutando el programador localmente

Normalmente, no agregaría una entrada cron del programador a su máquina de desarrollo local. En su lugar, puede utilizar el comando `schedule:work` Artisan. Este comando se ejecutará en primer plano e invocará al programador cada minuto hasta que finalice el comando. Cuando se definen tareas de menos de un minuto, el programador continuará ejecutándose cada minuto para procesar esas tareas:

```shell
php artisan schedule:work
```

<a id="task-output"></a>
## Salida de la tarea

El programador de Laravel proporciona varios métodos convenientes para trabajar con la salida generada por las tareas programadas. Primero, utilizando el método `sendOutputTo`, puede enviar el resultado a un archivo para su posterior inspección:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('emails:send')
    ->daily()
    ->sendOutputTo($filePath);
```

Si desea agregar el resultado a un archivo determinado, puede utilizar el método `appendOutputTo`:

```php
Schedule::command('emails:send')
    ->daily()
    ->appendOutputTo($filePath);
```

Utilizando el método `emailOutputTo`, puede enviar el resultado por correo electrónico a una dirección de correo electrónico de su elección. Antes de enviar por correo electrónico el resultado de una tarea, debe configurar los [servicios de correo electrónico](../mail/):

```php
Schedule::command('report:generate')
    ->daily()
    ->sendOutputTo($filePath)
    ->emailOutputTo('taylor@example.com');
```

Si solo desea enviar por correo electrónico el resultado si el comando programado de Artisan o del sistema termina con un código de salida distinto de cero, utilice el método `emailOutputOnFailure`:

```php
Schedule::command('report:generate')
    ->daily()
    ->emailOutputOnFailure('taylor@example.com');
```

> **Advertencia:**
> Los métodos `emailOutputTo`, `emailOutputOnFailure`, `sendOutputTo` y `appendOutputTo` son exclusivos de los métodos `command` y `exec`.

<a id="task-hooks"></a>
## Ganchos de tareas

Usando los métodos `before` y `after`, puede especificar el código que se ejecutará antes y después de ejecutar la tarea programada:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('emails:send')
    ->daily()
    ->before(function () {
        // The task is about to execute...
    })
    ->after(function () {
        // The task has executed...
    });
```

Los métodos `onSuccess` y `onFailure` le permiten especificar el código que se ejecutará si la tarea programada tiene éxito o falla. Una falla indica que el comando programado de Artisan o del sistema terminó con un código de salida distinto de cero:

```php
Schedule::command('emails:send')
    ->daily()
    ->onSuccess(function () {
        // The task succeeded...
    })
    ->onFailure(function () {
        // The task failed...
    });
```

Si el resultado está disponible desde su comando, puede acceder a él en sus ganchos `after`, `onSuccess` o `onFailure` escribiendo una sugerencia de una instancia de `Illuminate\Support\Stringable` como el argumento `$output` de la definición de cierre de su gancho:

```php
use Illuminate\Support\Stringable;

Schedule::command('emails:send')
    ->daily()
    ->onSuccess(function (Stringable $output) {
        // The task succeeded...
    })
    ->onFailure(function (Stringable $output) {
        // The task failed...
    });
```

<a id="pinging-urls"></a>
#### Hacer ping a las URL

Utilizando los métodos `pingBefore` y `thenPing`, el programador puede hacer ping automáticamente a una URL determinada antes o después de que se ejecute una tarea. Este método es útil para notificar a un servicio externo, como [Envoyer](https://envoyer.io), que su tarea programada está comenzando o ha finalizado su ejecución:

```php
Schedule::command('emails:send')
    ->daily()
    ->pingBefore($url)
    ->thenPing($url);
```

Los métodos `pingOnSuccess` y `pingOnFailure` se pueden utilizar para hacer ping a una URL determinada sólo si la tarea se realiza correctamente o falla. Una falla indica que el comando programado de Artisan o del sistema terminó con un código de salida distinto de cero:

```php
Schedule::command('emails:send')
    ->daily()
    ->pingOnSuccess($successUrl)
    ->pingOnFailure($failureUrl);
```

Los métodos `pingBeforeIf`, `thenPingIf`, `pingOnSuccessIf` y `pingOnFailureIf` se pueden usar para hacer ping a una URL determinada solo si una condición determinada es `true`:

```php
Schedule::command('emails:send')
    ->daily()
    ->pingBeforeIf($condition, $url)
    ->thenPingIf($condition, $url);

Schedule::command('emails:send')
    ->daily()
    ->pingOnSuccessIf($condition, $successUrl)
    ->pingOnFailureIf($condition, $failureUrl);
```

<a id="events"></a>
## Eventos

Laravel envía una variedad de [events](../events/) durante el proceso de programación. Puede [definir oyentes](../events/) para cualquiera de los siguientes eventos:

<div class="overflow-auto">

| Nombre del evento |
| ----------------------------------------------------- |
| `Illuminate\Console\Events\ScheduledTaskStarting` |
| `Illuminate\Console\Events\ScheduledTaskFinished` |
| `Illuminate\Console\Events\ScheduledBackgroundTaskFinished` |
| `Illuminate\Console\Events\ScheduledTaskSkipped` |
| `Illuminate\Console\Events\ScheduledTaskFailed` |

</div>
