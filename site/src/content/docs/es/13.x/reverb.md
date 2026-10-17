---
title: "Reverberación Laravel"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Instalación](#installation)
- [Configuración](#configuration)
    - [Credenciales de solicitud](#application-credentials)
    - [Orígenes permitidos](#allowed-origins)
    - [Aplicaciones adicionales](#additional-applications)
    - [SSL](#ssl)
- [Ejecutando el servidor](#running-server)
    - [Depuración](#debugging)
    - [Reiniciando](#restarting)
- [Monitoreo](#monitoring)
- [Ejecutando reverberación en producción](#production)
    - [Abrir archivos](#open-files)
    - [Bucle de eventos](#event-loop)
    - [Servidor web](#web-server)
    - [Puertos](#ports)
    - [Gestión de Procesos](#process-management)
    - [Escalado](#scaling)
- [Eventos](#events)

<a id="introduction"></a>
## Introducción

[Laravel Reverb](https://github.com/laravel/reverb) proporciona comunicación WebSocket en tiempo real, rápida y escalable, directamente en tu aplicación Laravel, además de una integración fluida con el conjunto de [herramientas de difusión de eventos](../broadcasting/) de Laravel.

<a id="installation"></a>
## Instalación

Puedes instalar Reverb usando el comando `install:broadcasting` Artisan:

```shell
php artisan install:broadcasting
```

<a id="configuration"></a>
## Configuración

Detrás de escena, el comando `install:broadcasting` Artisan ejecutará el comando `reverb:install`, que instalará Reverb con un conjunto sensato de opciones de configuración predeterminadas. Si desea realizar algún cambio en la configuración, puede hacerlo actualizando las variables de entorno de Reverb o actualizando el archivo de configuración `config/reverb.php`.

<a id="application-credentials"></a>
### Credenciales de aplicación

Para establecer una conexión con Reverb, se debe intercambiar un conjunto de credenciales de "aplicación" de Reverb entre el cliente y el servidor. Estas credenciales se configuran en el servidor y se utilizan para verificar la solicitud del cliente. Puede definir estas credenciales utilizando las siguientes variables de entorno:

```ini
REVERB_APP_ID=my-app-id
REVERB_APP_KEY=my-app-key
REVERB_APP_SECRET=my-app-secret
```

<a id="allowed-origins"></a>
### Orígenes permitidos

También puede definir los orígenes desde los cuales se pueden originar las solicitudes de los clientes actualizando el valor de configuración `allowed_origins` dentro de la sección `apps` del archivo de configuración `config/reverb.php`. Se rechazará cualquier solicitud de un origen que no esté incluido en sus orígenes permitidos. Puede permitir todos los orígenes utilizando `*`:

```php
'apps' => [
    [
        'app_id' => 'my-app-id',
        'allowed_origins' => ['laravel.com'],
        // ...
    ]
]
```

<a id="additional-applications"></a>
### Aplicaciones adicionales

Normalmente, Reverb proporciona un servidor WebSocket para la aplicación en la que está instalado. Sin embargo, es posible servir a más de una aplicación utilizando una única instalación de Reverb.

Por ejemplo, es posible que desee mantener una única aplicación Laravel que, a través de Reverb, proporcione conectividad WebSocket para múltiples aplicaciones. Esto se puede lograr definiendo múltiples `apps` en el archivo de configuración `config/reverb.php` de su aplicación:

```php
'apps' => [
    [
        'app_id' => 'my-app-one',
        // ...
    ],
    [
        'app_id' => 'my-app-two',
        // ...
    ],
],
```

<a id="ssl"></a>
### SSL

En la mayoría de los casos, las conexiones WebSocket seguras son manejadas por el servidor web ascendente (Nginx, etc.) antes de que la solicitud se envíe a su servidor Reverb.

Sin embargo, a veces puede resultar útil, como durante el desarrollo local, que el servidor Reverb maneje conexiones seguras directamente. Si está utilizando la función de sitio seguro [Laravel Herd's](https://herd.laravel.com) o está utilizando [Laravel Valet](../valet/) y ha ejecutado el [comando seguro](../valet/#securing-sites) en su aplicación, puede usar el certificado Herd / Valet generado para su sitio para proteger sus conexiones de Reverb. Para hacerlo, configure la variable de entorno `REVERB_HOST` en el nombre de host de su sitio o pase explícitamente la opción de nombre de host al iniciar el servidor Reverb:

```shell
php artisan reverb:start --host="0.0.0.0" --port=8080 --hostname="laravel.test"
```

Dado que los dominios Herd y Valet se resuelven en `localhost`, ejecutar el comando anterior hará que se pueda acceder a su servidor Reverb a través del protocolo seguro WebSocket (`wss`) en `wss://laravel.test:8080`.

También puede elegir manualmente un certificado definiendo las opciones de `tls` en el archivo de configuración `config/reverb.php` de su aplicación. Dentro del conjunto de opciones de `tls`, puede proporcionar cualquiera de las opciones admitidas por [opciones de contexto SSL de PHP](https://www.php.net/manual/en/context.ssl.php):

```php
'options' => [
    'tls' => [
        'local_cert' => '/path/to/cert.pem'
    ],
],
```

<a id="running-server"></a>
## Ejecutando el servidor

El servidor Reverb se puede iniciar usando el comando `reverb:start` Artisan:

```shell
php artisan reverb:start
```

De forma predeterminada, el servidor Reverb se iniciará en `0.0.0.0:8080`, lo que lo hará accesible desde todas las interfaces de red.

Si necesita especificar un host o puerto personalizado, puede hacerlo a través de las opciones `--host` y `--port` al iniciar el servidor:

```shell
php artisan reverb:start --host=127.0.0.1 --port=9000
```

Alternativamente, puede definir las variables de entorno `REVERB_SERVER_HOST` y `REVERB_SERVER_PORT` en el archivo de configuración `.env` de su aplicación.

Las variables de entorno `REVERB_SERVER_HOST` y `REVERB_SERVER_PORT` no deben confundirse con `REVERB_HOST` y `REVERB_PORT`. El primero especifica el host y el puerto en el que ejecutar el servidor Reverb, mientras que el último par indica a Laravel dónde enviar mensajes de difusión. Por ejemplo, en un entorno de producción, puede enrutar solicitudes desde su nombre de host público de Reverb en el puerto `443` a un servidor de Reverb que opera en `0.0.0.0:8080`. En este escenario, sus variables de entorno se definirían de la siguiente manera:

```ini
REVERB_SERVER_HOST=0.0.0.0
REVERB_SERVER_PORT=8080

REVERB_HOST=ws.laravel.com
REVERB_PORT=443
```

<a id="debugging"></a>
### Depuración

Para mejorar el rendimiento, Reverb no genera ninguna información de depuración de forma predeterminada. Si desea ver el flujo de datos que pasa a través de su servidor Reverb, puede proporcionar la opción `--debug` al comando `reverb:start`:

```shell
php artisan reverb:start --debug
```

<a id="restarting"></a>
### Reiniciando

Dado que Reverb es un proceso de larga duración, los cambios en su código no se reflejarán sin reiniciar el servidor mediante el comando `reverb:restart` Artisan.

El comando `reverb:restart` garantiza que todas las conexiones finalicen correctamente antes de detener el servidor. Si estás ejecutando Reverb con un administrador de procesos como Supervisor, el administrador de procesos reiniciará automáticamente el servidor después de que se hayan finalizado todas las conexiones:

```shell
php artisan reverb:restart
```

<a id="monitoring"></a>
## Monitoreo

La reverberación se puede monitorear mediante una integración con [Laravel Pulse](../pulse/). Al habilitar la integración Pulse de Reverb, puede realizar un seguimiento del número de conexiones y mensajes que maneja su servidor.

Para habilitar la integración, primero debe asegurarse de tener [instalado Pulse](../pulse/#installation). Luego, agrega cualquiera de las grabadoras de Reverb al archivo de configuración `config/pulse.php` de tu aplicación:

```php
use Laravel\Reverb\Pulse\Recorders\ReverbConnections;
use Laravel\Reverb\Pulse\Recorders\ReverbMessages;

'recorders' => [
    ReverbConnections::class => [
        'sample_rate' => 1,
    ],

    ReverbMessages::class => [
        'sample_rate' => 1,
    ],

    // ...
],
```

A continuación, agregue las tarjetas Pulse para cada grabadora a su [panel de Pulse](../pulse/#dashboard-customization):

```blade
<x-pulse>
    <livewire:reverb.connections cols="full" />
    <livewire:reverb.messages cols="full" />
    ...
</x-pulse>
```

La actividad de conexión se registra mediante sondeos de nuevas actualizaciones de forma periódica. Para garantizar que esta información se represente correctamente en el panel de Pulse, debe ejecutar el demonio `pulse:check` en su servidor Reverb. Si está ejecutando Reverb en una configuración [escalada horizontalmente](#scaling), solo debe ejecutar este demonio en uno de sus servidores.

<a id="production"></a>
## Ejecución de reverberación en producción

Debido a la naturaleza de larga duración de los servidores WebSocket, es posible que deba realizar algunas optimizaciones en su servidor y entorno de alojamiento para garantizar que su servidor Reverb pueda manejar de manera efectiva la cantidad óptima de conexiones para los recursos disponibles en su servidor.

> **Nota:**
> [Laravel Cloud](https://cloud.laravel.com) ofrece una infraestructura WebSocket totalmente administrada impulsada por clústeres de Laravel Reverb, lo que le permite escalar y enviar aplicaciones habilitadas para Reverb sin administrar la infraestructura.

<a id="open-files"></a>
### Abrir archivos

Cada conexión WebSocket se mantiene en la memoria hasta que el cliente o el servidor se desconecta. En entornos Unix y similares, cada conexión está representada por un archivo. Sin embargo, a menudo existen límites en la cantidad de archivos abiertos permitidos tanto a nivel del sistema operativo como de la aplicación.

<a id="operating-system"></a>
#### Sistema operativo

En un sistema operativo basado en Unix, puede determinar la cantidad permitida de archivos abiertos usando el comando `ulimit`:

```shell
ulimit -n
```

Este comando mostrará los límites de archivos abiertos permitidos para diferentes usuarios. Puede actualizar estos valores editando el archivo `/etc/security/limits.conf`. Por ejemplo, actualizar el número máximo de archivos abiertos a 10 000 para el usuario `forge` sería similar a lo siguiente:

```ini
# /etc/security/limits.conf
forge        soft  nofile  10000
forge        hard  nofile  10000
```

<a id="event-loop"></a>
### Bucle de eventos

Debajo del capó, Reverb usa un bucle de eventos ReactPHP para administrar las conexiones WebSocket en el servidor. De forma predeterminada, este bucle de eventos funciona con `stream_select`, que no requiere extensiones adicionales. Sin embargo, `stream_select` normalmente está limitado a 1024 archivos abiertos. Como tal, si planea manejar más de 1000 conexiones simultáneas, necesitará utilizar un bucle de eventos alternativo que no esté sujeto a las mismas restricciones.

Reverb cambiará automáticamente a un bucle autoamplificado `ext-uv` cuando esté disponible. Esta extensión PHP está disponible para instalar a través de PECL:

```shell
pecl install uv
```

<a id="web-server"></a>
### Servidor web

En la mayoría de los casos, Reverb se ejecuta en un puerto de su servidor que no tiene acceso a Internet. Entonces, para enrutar el tráfico a Reverb, debes configurar un proxy inverso. Suponiendo que Reverb se ejecuta en el host `0.0.0.0` y el puerto `8080` y que su servidor utiliza el servidor web Nginx, se puede definir un proxy inverso para su servidor Reverb utilizando la siguiente configuración del sitio Nginx:

```nginx
server {
    ...

    location / {
        proxy_http_version 1.1;
        proxy_set_header Host $http_host;
        proxy_set_header Scheme $scheme;
        proxy_set_header SERVER_PORT $server_port;
        proxy_set_header REMOTE_ADDR $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";

        proxy_pass http://0.0.0.0:8080;
    }

    ...
}
```

> **Advertencia:**
> Reverb escucha las conexiones WebSocket en `/app` y maneja las solicitudes de API en `/apps`. Debes asegurarte de que el servidor web que maneja las solicitudes de Reverb pueda atender ambos URI. Si está utilizando [Laravel Forge](https://forge.laravel.com) para administrar sus servidores, su servidor Reverb estará configurado correctamente de forma predeterminada.

Normalmente, los servidores web están configurados para limitar la cantidad de conexiones permitidas para evitar la sobrecarga del servidor. Para aumentar la cantidad de conexiones permitidas en un servidor web Nginx a 10,000, se deben actualizar los valores `worker_rlimit_nofile` y `worker_connections` del archivo `nginx.conf`:

```nginx
user forge;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;
worker_rlimit_nofile 10000;

events {
  worker_connections 10000;
  multi_accept on;
}
```

La configuración anterior permitirá generar hasta 10.000 trabajadores Nginx por proceso. Además, esta configuración establece el límite de archivos abiertos de Nginx en 10.000.

<a id="ports"></a>
### Puertos

Los sistemas operativos basados ​​en Unix normalmente limitan la cantidad de puertos que se pueden abrir en el servidor. Puede ver el rango permitido actual mediante el siguiente comando:

```shell
cat /proc/sys/net/ipv4/ip_local_port_range
# 32768	60999
```

El resultado anterior muestra que el servidor puede manejar un máximo de 28,231 (60,999 - 32,768) conexiones ya que cada conexión requiere un puerto libre. Aunque recomendamos [escalado horizontal](#scaling) para aumentar la cantidad de conexiones permitidas, puede aumentar la cantidad de puertos abiertos disponibles actualizando el rango de puertos permitidos en el archivo de configuración `/etc/sysctl.conf` de su servidor.

<a id="process-management"></a>
### Gestión de procesos

En la mayoría de los casos, debes utilizar un administrador de procesos como Supervisor para garantizar que el servidor Reverb esté funcionando continuamente. Si está utilizando Supervisor para ejecutar Reverb, debe actualizar la configuración `minfds` del archivo `supervisor.conf` de su servidor para garantizar que Supervisor pueda abrir los archivos necesarios para manejar las conexiones a su servidor Reverb:

```ini
[supervisord]
...
minfds=10000
```

<a id="scaling"></a>
### Escalado

Si necesita manejar más conexiones de las que permite un solo servidor, puede escalar su servidor Reverb horizontalmente. Utilizando las capacidades de publicación/suscripción de Redis, Reverb puede administrar conexiones entre múltiples servidores. Cuando uno de los servidores Reverb de su aplicación recibe un mensaje, el servidor utilizará Redis para publicar el mensaje entrante en todos los demás servidores.

Para habilitar el escalado horizontal, debe configurar la variable de entorno `REVERB_SCALING_ENABLED` en `true` en el archivo de configuración `.env` de su aplicación:

```env
REVERB_SCALING_ENABLED=true
```

A continuación, debe tener un servidor Redis central dedicado con el que se comunicarán todos los servidores de Reverb. Reverb utilizará la [conexión Redis predeterminada configurada para su aplicación](../redis/#configuration) para publicar mensajes en todos sus servidores de Reverb.

Una vez que haya habilitado la opción de escalado de Reverb y haya configurado un servidor Redis, simplemente puede invocar el comando `reverb:start` en varios servidores que puedan comunicarse con su servidor Redis. Estos servidores de Reverb deben colocarse detrás de un equilibrador de carga que distribuya las solicitudes entrantes de manera uniforme entre los servidores.

<a id="events"></a>
## Eventos

Reverb envía eventos internos durante el ciclo de vida de una conexión y el manejo de mensajes. Puede [escuchar estos eventos](../events/) para realizar acciones cuando se administran conexiones o se intercambian mensajes.

Reverb envía los siguientes eventos:

#### `Laravel\Reverb\Events\ChannelCreated`

Se distribuye cuando se crea un canal. Esto suele ocurrir cuando la primera conexión se suscribe a un canal específico. El evento recibe la instancia `Laravel\Reverb\Protocols\Pusher\Channel`.

#### `Laravel\Reverb\Events\ChannelRemoved`

Se envía cuando se elimina un canal. Esto suele ocurrir cuando la última conexión se da de baja de un canal. El evento recibe la instancia `Laravel\Reverb\Protocols\Pusher\Channel`.

#### `Laravel\Reverb\Events\ConnectionPruned`

Se distribuye cuando el servidor elimina una conexión obsoleta. El evento recibe la instancia `Laravel\Reverb\Contracts\Connection`.

#### `Laravel\Reverb\Events\MessageReceived`

Se distribuye cuando se recibe un mensaje desde una conexión de cliente. El evento recibe la instancia `Laravel\Reverb\Contracts\Connection` y la cadena sin formato `$message`.

#### `Laravel\Reverb\Events\MessageSent`

Se distribuye cuando se envía un mensaje a una conexión de cliente. El evento recibe la instancia `Laravel\Reverb\Contracts\Connection` y la cadena sin formato `$message`.
