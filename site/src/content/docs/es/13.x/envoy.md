---
title: "Enviado de Laravel"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Instalación](#installation)
- [Tareas de escritura](#writing-tasks)
    - [Definición de tareas](#defining-tasks)
    - [Múltiples servidores](#multiple-servers)
    - [Configuración](#setup)
    - [Variables](#variables)
    - [Historias](#stories)
    - [Ganchos](#completion-hooks)
- [Ejecutando tareas](#running-tasks)
    - [Confirmando la ejecución de la tarea](#confirming-task-execution)
- [Notificaciones](#notifications)
    - [Slack](#slack)
    - [Discordia](#discord)
    - [Telegrama](#telegram)
    - [Equipos de Microsoft](#microsoft-teams)

<a id="introduction"></a>
## Introducción

[Laravel Envoy](https://github.com/laravel/envoy) es una herramienta para ejecutar tareas comunes que ejecuta en sus servidores remotos. Con la sintaxis de estilo [Blade](../blade/)], puede configurar fácilmente tareas para implementación, comandos Artisan y más. Actualmente, Envoy sólo es compatible con los sistemas operativos Mac y Linux. Sin embargo, la compatibilidad con Windows se puede lograr utilizando [WSL2](https://docs.microsoft.com/en-us/windows/wsl/install-win10).

<a id="installation"></a>
## Instalación

Primero, instale Envoy en su proyecto usando el administrador de paquetes de Composer:

```shell
composer require laravel/envoy --dev
```

Una vez que se haya instalado Envoy, el binario de Envoy estará disponible en el directorio `vendor/bin` de su aplicación:

```shell
php vendor/bin/envoy
```

<a id="writing-tasks"></a>
## Tareas de escritura

<a id="defining-tasks"></a>
### Definición de tareas

Las tareas son el componente básico de Envoy. Las tareas definen los comandos de shell que deben ejecutarse en sus servidores remotos cuando se invoca la tarea. Por ejemplo, puede definir una tarea que ejecute el comando `php artisan queue:restart` en todos los servidores de trabajo en cola de su aplicación.

Todas sus tareas de Envoy deben definirse en un archivo `Envoy.blade.php` en la raíz de su aplicación. A continuación se muestra un ejemplo para empezar:

```blade
@servers(['web' => ['user@192.168.1.1'], 'workers' => ['user@192.168.1.2']])

@task('restart-queues', ['on' => 'workers'])
    cd /home/user/example.com
    php artisan queue:restart
@endtask
```

Como puede ver, se define una matriz de `@servers` en la parte superior del archivo, lo que le permite hacer referencia a estos servidores a través de la opción `on` de sus declaraciones de tareas. La declaración `@servers` siempre debe colocarse en una sola línea. Dentro de sus declaraciones `@task`, debe colocar los comandos de shell que deben ejecutarse en sus servidores cuando se invoca la tarea.

<a id="local-tasks"></a>
#### Tareas locales

Puedes forzar la ejecución de un script en tu equipo local especificando la dirección IP del servidor como `127.0.0.1`:

```blade
@servers(['localhost' => '127.0.0.1'])
```

<a id="importing-envoy-tasks"></a>
#### Importación de tareas de Envoy

Usando la directiva `@import`, puede importar otros archivos de Envoy para que sus historias y tareas se agreguen a las suyas. Una vez importados los archivos, puede ejecutar las tareas que contienen como si estuvieran definidas en su propio archivo Envoy:

```blade
@import('vendor/package/Envoy.blade.php')
```

<a id="multiple-servers"></a>
### Múltiples servidores

Envoy le permite ejecutar fácilmente una tarea en varios servidores. Primero, agregue servidores adicionales a su declaración `@servers`. A cada servidor se le debe asignar un nombre único. Una vez que haya definido sus servidores adicionales, puede enumerar cada uno de los servidores en la matriz `on` de la tarea:

```blade
@servers(['web-1' => '192.168.1.1', 'web-2' => '192.168.1.2'])

@task('deploy', ['on' => ['web-1', 'web-2']])
    cd /home/user/example.com
    git pull origin {{ $branch }}
    php artisan migrate --force
@endtask
```

<a id="parallel-execution"></a>
#### Ejecución paralela

De forma predeterminada, las tareas se ejecutarán en cada servidor en serie. En otras palabras, una tarea terminará de ejecutarse en el primer servidor antes de proceder a ejecutarse en el segundo servidor. Si desea ejecutar una tarea en varios servidores en paralelo, agregue la opción `parallel` a su declaración de tarea:

```blade
@servers(['web-1' => '192.168.1.1', 'web-2' => '192.168.1.2'])

@task('deploy', ['on' => ['web-1', 'web-2'], 'parallel' => true])
    cd /home/user/example.com
    git pull origin {{ $branch }}
    php artisan migrate --force
@endtask
```

<a id="setup"></a>
### Configuración

A veces, es posible que necesites ejecutar código PHP arbitrario antes de ejecutar las tareas de Envoy. Puede utilizar la directiva `@setup` para definir un bloque de código PHP que debe ejecutarse antes de sus tareas:

```blade
@setup
    $now = new DateTime;
@endsetup
```

Si necesita requerir otros archivos PHP antes de ejecutar su tarea, puede usar la directiva `@include` en la parte superior de su archivo `Envoy.blade.php`:

```blade
@include('vendor/autoload.php')

@task('restart-queues')
    # ...
@endtask
```

<a id="variables"></a>
### Variables

Si es necesario, puede pasar argumentos a las tareas de Envoy especificándolos en la línea de comando al invocar Envoy:

```shell
php vendor/bin/envoy run deploy --branch=master
```

Puede acceder a las opciones dentro de sus tareas utilizando la sintaxis "eco" de Blade. También puede definir sentencias y bucles Blade `if` dentro de sus tareas. Por ejemplo, verifiquemos la presencia de la variable `$branch` antes de ejecutar el comando `git pull`:

```blade
@servers(['web' => ['user@192.168.1.1']])

@task('deploy', ['on' => 'web'])
    cd /home/user/example.com

    @if ($branch)
        git pull origin {{ $branch }}
    @endif

    php artisan migrate --force
@endtask
```

<a id="stories"></a>
### Historias

Las historias agrupan un conjunto de tareas bajo un nombre único y conveniente. Por ejemplo, una historia `deploy` puede ejecutar las tareas `update-code` y `install-dependencies` enumerando los nombres de las tareas dentro de su definición:

```blade
@servers(['web' => ['user@192.168.1.1']])

@story('deploy')
    update-code
    install-dependencies
@endstory

@task('update-code')
    cd /home/user/example.com
    git pull origin master
@endtask

@task('install-dependencies')
    cd /home/user/example.com
    composer install
@endtask
```

Una vez escrita la historia, puedes invocarla de la misma manera que invocarías una tarea:

```shell
php vendor/bin/envoy run deploy
```

<a id="completion-hooks"></a>
### Ganchos

Cuando se ejecutan tareas e historias, se ejecutan varios ganchos. Los tipos de gancho admitidos por Envoy son `@before`, `@after`, `@error`, `@success` y `@finished`. Todo el código de estos enlaces se interpreta como PHP y se ejecuta localmente, no en los servidores remotos con los que interactúan sus tareas.

Puede definir tantos de cada uno de estos ganchos como desee. Se ejecutarán en el orden en que aparecen en su secuencia de comandos de Envoy.

<a id="hook-before"></a>
#### `@before`

Antes de la ejecución de cada tarea, se ejecutarán todos los ganchos `@before` registrados en su script Envoy. Los ganchos `@before` reciben el nombre de la tarea que se ejecutará:

```blade
@before
    if ($task === 'deploy') {
        // ...
    }
@endbefore
```

<a id="completion-after"></a>
#### `@after`

Después de la ejecución de cada tarea, se ejecutarán todos los ganchos `@after` registrados en su script Envoy. Los ganchos `@after` reciben el nombre de la tarea que se ejecutó:

```blade
@after
    if ($task === 'deploy') {
        // ...
    }
@endafter
```

<a id="completion-error"></a>
#### `@error`

Después de cada falla en la tarea (sale con un código de estado mayor que `0`), se ejecutarán todos los enlaces `@error` registrados en su script Envoy. Los ganchos `@error` reciben el nombre de la tarea que se ejecutó:

```blade
@error
    if ($task === 'deploy') {
        // ...
    }
@enderror
```

<a id="completion-success"></a>
#### `@success`

Si todas las tareas se han ejecutado sin errores, se ejecutarán todos los ganchos `@success` registrados en su script Envoy:

```blade
@success
    // ...
@endsuccess
```

<a id="completion-finished"></a>
#### `@finished`

Una vez ejecutadas todas las tareas (independientemente del estado de salida), se ejecutarán todos los enlaces `@finished`. Los ganchos `@finished` reciben el código de estado de la tarea completada, que puede ser `null` o un `integer` mayor o igual a `0`:

```blade
@finished
    if ($exitCode > 0) {
        // There were errors in one of the tasks...
    }
@endfinished
```

<a id="running-tasks"></a>
## Tareas en ejecución

Para ejecutar una tarea o historia definida en el archivo `Envoy.blade.php` de su aplicación, ejecute el comando `run` de Envoy, pasando el nombre de la tarea o historia que desea ejecutar. Envoy ejecutará la tarea y mostrará el resultado de sus servidores remotos mientras se ejecuta la tarea:

```shell
php vendor/bin/envoy run deploy
```

<a id="confirming-task-execution"></a>
### Confirmando la ejecución de la tarea

Si desea que se le solicite confirmación antes de ejecutar una tarea determinada en sus servidores, debe agregar la directiva `confirm` a su declaración de tarea. Esta opción es particularmente útil para operaciones destructivas:

```blade
@task('deploy', ['on' => 'web', 'confirm' => true])
    cd /home/user/example.com
    git pull origin {{ $branch }}
    php artisan migrate
@endtask
```

<a id="notifications"></a>
## Notificaciones

<a id="slack"></a>
### flojo

Envoy admite el envío de notificaciones a [Slack](https://slack.com) después de ejecutar cada tarea. La directiva `@slack` acepta una URL de enlace de Slack y un nombre de canal/usuario. Puede recuperar la URL de su webhook creando una integración de "WebHooks entrantes" en su panel de control de Slack.

Debe pasar la URL completa del webhook como primer argumento dado a la directiva `@slack`. El segundo argumento dado a la directiva `@slack` debe ser un nombre de canal (`#channel`) o un nombre de usuario (`@user`):

```blade
@finished
    @slack('webhook-url', '#bots')
@endfinished
```

De forma predeterminada, las notificaciones de Envoy enviarán un mensaje al canal de notificación que describe la tarea que se ejecutó. Sin embargo, puede sobrescribir este mensaje con su propio mensaje personalizado pasando un tercer argumento a la directiva `@slack`:

```blade
@finished
    @slack('webhook-url', '#bots', 'Hello, Slack.')
@endfinished
```

<a id="discord"></a>
### Discordia

Envoy también admite el envío de notificaciones a [Discord](https://discord.com) después de ejecutar cada tarea. La directiva `@discord` acepta una URL de enlace de Discord y un mensaje. Puede recuperar la URL de su webhook creando un "Webhook" en la configuración de su servidor y eligiendo en qué canal debe publicar el webhook. Debe pasar la URL completa del Webhook a la directiva `@discord`:

```blade
@finished
    @discord('discord-webhook-url')
@endfinished
```

<a id="telegram"></a>
### Telegrama

Envoy también admite el envío de notificaciones a [Telegram](https://telegram.org) después de ejecutar cada tarea. La directiva `@telegram` acepta un ID de Bot de Telegram y un ID de Chat. Puede recuperar su ID de bot creando un nuevo bot usando [BotFather](https://t.me/botfather). Puede recuperar una ID de chat válida usando [@username_to_id_bot](https://t.me/username_to_id_bot). Debe pasar todo el ID del bot y el ID del chat a la directiva `@telegram`:

```blade
@finished
    @telegram('bot-id','chat-id')
@endfinished
```

<a id="microsoft-teams"></a>
### Equipos de Microsoft

Envoy también admite el envío de notificaciones a [Microsoft Teams](https://www.microsoft.com/en-us/microsoft-teams) después de ejecutar cada tarea. La directiva `@microsoftTeams` acepta un webhook de Teams (obligatorio), un mensaje, un color de tema (éxito, información, advertencia, error) y una variedad de opciones. Puede recuperar su webhook de Teams creando un nuevo [webhook entrante](https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook). La API de Teams tiene muchos otros atributos para personalizar su cuadro de mensaje, como título, resumen y secciones. Puede encontrar más información en la [documentación de Microsoft Teams](https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/connectors-using?tabs=cURL#example-of-connector-message). Debe pasar la URL completa del Webhook a la directiva `@microsoftTeams`:

```blade
@finished
    @microsoftTeams('webhook-url')
@endfinished
```
