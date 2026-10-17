---
title: "Difusión de eventos"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Inicio rápido](#quickstart)
- [Instalación del lado del servidor](#server-side-installation)
    - [Reverb](#reverb)
    - [Pusher Channels](#pusher-channels)
    - [Ably](#ably)
    - [Mercure](#mercure)
- [Instalación del lado del cliente](#client-side-installation)
    - [Reverb](#client-reverb)
    - [Pusher Channels](#client-pusher-channels)
    - [Ably](#client-ably)
    - [Mercure](#client-mercure)
- [Descripción general del concepto](#concept-overview)
    - [Uso de una aplicación de ejemplo](#using-example-application)
- [Definición de eventos de difusión](#defining-broadcast-events)
    - [Nombre de difusión](#broadcast-name)
    - [Datos de difusión](#broadcast-data)
    - [Cola de difusión](#broadcast-queue)
    - [Condiciones de difusión](#broadcast-conditions)
    - [Difusión de eventos y transacciones de bases de datos](#broadcasting-and-database-transactions)
- [Autorización de canales](#authorizing-channels)
    - [Definición de callbacks de autorización](#defining-authorization-callbacks)
    - [Definición de clases de canales](#defining-channel-classes)
- [Difusión de eventos](#broadcasting-events)
    - [Solo para otros](#only-to-others)
    - [Personalización de la conexión](#customizing-the-connection)
    - [Eventos anónimos](#anonymous-events)
    - [Rescate de difusiones](#rescuing-broadcasts)
- [Recepción de difusiones](#receiving-broadcasts)
    - [Escucha de eventos](#listening-for-events)
    - [Salir de un canal](#leaving-a-channel)
    - [Espacios de nombres](#namespaces)
    - [Uso de React, Vue o Svelte](#using-react-or-vue)
- [Canales de presencia](#presence-channels)
    - [Autorización de canales de presencia](#authorizing-presence-channels)
    - [Unirse a canales de presencia](#joining-presence-channels)
    - [Difusión a canales de presencia](#broadcasting-to-presence-channels)
- [Canales privados cifrados](#encrypted-private-channels)
- [Difusión de eventos de modelos](#model-broadcasting)
    - [Convenciones de difusión de eventos de modelos](#model-broadcasting-conventions)
    - [Escucha de difusiones de modelos](#listening-for-model-broadcasts)
- [Eventos del cliente](#client-events)
- [Notificaciones](#notifications)

<a id="introduction"></a>
## Introducción

En muchas aplicaciones web modernas, los WebSockets se utilizan para implementar interfaces de usuario que se actualizan en tiempo real. Cuando se actualizan algunos datos en el servidor, normalmente se envía un mensaje a través de una conexión WebSocket para que lo maneje el cliente. Los WebSockets proporcionan una alternativa más eficiente al sondeo continuo del servidor de tu aplicación en busca de cambios de datos que deberían reflejarse en tu interfaz de usuario.

Por ejemplo, imagina que tu aplicación puede exportar los datos de un usuario a un archivo CSV y enviárselos por correo electrónico. Sin embargo, la creación de este archivo CSV lleva varios minutos, por lo que eliges crear y enviar el CSV por correo dentro de un [trabajo en cola](../queues/). Cuando el CSV se haya creado y enviado por correo al usuario, podemos utilizar la difusión de eventos para despachar un evento `App\Events\UserDataExported` que recibe el JavaScript de nuestra aplicación. Una vez recibido el evento, podemos mostrar un mensaje al usuario informándole que su CSV se le ha enviado por correo electrónico sin que tenga que actualizar la página.

Para ayudarte a crear este tipo de funciones, Laravel facilita la "difusión" de tus [eventos](../events/) de Laravel del lado del servidor a través de una conexión WebSocket. Difundir tus eventos de Laravel te permite compartir los mismos nombres de eventos y datos entre tu aplicación Laravel del lado del servidor y tu aplicación JavaScript del lado del cliente.

Los conceptos centrales detrás de la difusión son simples: los clientes se conectan a canales con nombre en el frontend, mientras que tu aplicación Laravel difunde eventos a estos canales en el backend. Estos eventos pueden contener cualquier dato adicional que desees poner a disposición del frontend.

<a id="supported-drivers"></a>
#### Controladores compatibles

De forma predeterminada, Laravel incluye cuatro controladores de difusión del lado del servidor para que elijas: [Laravel Reverb](https://reverb.laravel.com), [Pusher Channels](https://pusher.com/channels), [Ably](https://ably.com) y [Mercure](https://mercure.rocks).

> **Nota:**
> Antes de profundizar en la difusión de eventos, asegúrate de haber leído la documentación de Laravel sobre [eventos y listeners](../events/).

<a id="quickstart"></a>
## Inicio rápido

De forma predeterminada, la difusión no está habilitada en las nuevas aplicaciones de Laravel. Puedes habilitar la difusión usando el comando Artisan `install:broadcasting`:

```shell
php artisan install:broadcasting
```

El comando `install:broadcasting` te preguntará qué servicio de difusión de eventos te gustaría utilizar. Además, creará el archivo de configuración `config/broadcasting.php` y el archivo `routes/channels.php` donde podrás registrar las rutas de autorización de difusión y los callbacks de tu aplicación.

Laravel admite varios controladores de difusión listos para usar: [Laravel Reverb](../reverb/), [Pusher Channels](https://pusher.com/channels), [Ably](https://ably.com), [Mercure](https://mercure.rocks) y un controlador `log` para desarrollo local y depuración. Además, se incluye un controlador `null` que te permite desactivar la difusión durante las pruebas. Se incluye un ejemplo de configuración para cada uno de estos controladores en el archivo de configuración `config/broadcasting.php`.

Toda la configuración de difusión de eventos de tu aplicación se almacena en el archivo de configuración `config/broadcasting.php`. No te preocupes si este archivo no existe en tu aplicación; se creará cuando ejecutes el comando Artisan `install:broadcasting`.

<a id="quickstart-next-steps"></a>
#### Próximos pasos

Una vez que hayas habilitado la difusión de eventos, estarás listo para obtener más información sobre [definir eventos de difusión](#defining-broadcast-events) y [escuchar eventos](#listening-for-events). Si utilizas los [kits de inicio](../starter-kits/) de React, Vue o Svelte de Laravel, puedes escuchar eventos mediante el [hook useEcho](#using-react-or-vue) de Echo.

> **Nota:**
> Antes de difundir cualquier evento, primero debes configurar y ejecutar un [proceso de trabajo de cola](../queues/). Toda la difusión de eventos se realiza a través de trabajos en cola para que el tiempo de respuesta de tu aplicación no se vea seriamente afectado por los eventos que se difunden. El controlador Mercure es una excepción, ya que [difunde eventos sincrónicamente](#mercure-synchronous-broadcasting) de forma predeterminada.

<a id="server-side-installation"></a>
## Instalación del lado del servidor

Para comenzar a utilizar la difusión de eventos de Laravel, debemos realizar algunas configuraciones dentro de la aplicación Laravel, así como instalar algunos paquetes.

La difusión de eventos se logra mediante un controlador de difusión del lado del servidor que difunde tus eventos de Laravel para que Laravel Echo (una biblioteca de JavaScript) pueda recibirlos dentro del cliente del navegador. No te preocupes: analizaremos cada parte del proceso de instalación paso a paso.

<a id="reverb"></a>
### Reverb

Para habilitar rápidamente la compatibilidad con las funciones de difusión de Laravel mientras usas Reverb como tu difusor de eventos, invoca el comando Artisan `install:broadcasting` con la opción `--reverb`. Este comando Artisan instalará los paquetes Composer y NPM necesarios de Reverb y actualizará el archivo `.env` de tu aplicación con las variables apropiadas:

```shell
php artisan install:broadcasting --reverb
```

<a id="reverb-manual-installation"></a>
#### Instalación manual

Al ejecutar el comando `install:broadcasting`, se te pedirá que instales [Laravel Reverb](../reverb/). Por supuesto, también puedes instalar Reverb manualmente usando el gestor de paquetes Composer:

```shell
composer require laravel/reverb
```

Una vez instalado el paquete, puedes ejecutar el comando de instalación de Reverb para publicar la configuración, agregar las variables de entorno requeridas por Reverb y habilitar la difusión de eventos en tu aplicación:

```shell
php artisan reverb:install
```

Puedes encontrar instrucciones detalladas de instalación y uso de Reverb en la [documentación de Reverb](../reverb/).

<a id="pusher-channels"></a>
### Pusher Channels

Para habilitar rápidamente la compatibilidad con las funciones de difusión de Laravel mientras usas Pusher como tu difusor de eventos, invoca el comando Artisan `install:broadcasting` con la opción `--pusher`. Este comando de Artisan te solicitará tus credenciales de Pusher, instalará los SDK de PHP y JavaScript de Pusher y actualizará el archivo `.env` de tu aplicación con las variables apropiadas:

```shell
php artisan install:broadcasting --pusher
```

<a id="pusher-manual-installation"></a>
#### Instalación manual

Para instalar el soporte de Pusher manualmente, debes instalar el SDK PHP de Pusher Channels usando el gestor de paquetes Composer:

```shell
composer require pusher/pusher-php-server
```

A continuación, debes configurar tus credenciales de Pusher Channels en el archivo de configuración `config/broadcasting.php`. En este archivo ya se incluye un ejemplo de configuración de Pusher Channels, lo que te permite especificar rápidamente tu clave, secreto e ID de aplicación. Normalmente, debes configurar tus credenciales de Pusher Channels en el archivo `.env` de tu aplicación:

```ini
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_APP_KEY="your-pusher-key"
PUSHER_APP_SECRET="your-pusher-secret"
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME="https"
PUSHER_APP_CLUSTER="mt1"
```

La configuración `pusher` del archivo `config/broadcasting.php` también te permite especificar `options` adicionales que son compatibles con Channels, como el clúster.

Luego, configura la variable de entorno `BROADCAST_CONNECTION` en `pusher` en el archivo `.env` de tu aplicación:

```ini
BROADCAST_CONNECTION=pusher
```

Finalmente, estás listo para instalar y configurar [Laravel Echo](#client-side-installation), que recibirá los eventos de difusión en el lado del cliente.

<a id="pusher-manual-installation-encrypted-private-channels"></a>
#### Canales privados cifrados

Si planeas utilizar [canales privados cifrados de extremo a extremo](#encrypted-private-channels), debes agregar una opción `encryption_master_key_base64` que contenga una clave de 32 bytes codificada en base64 al array `options` de la conexión `pusher`:

```php
'options' => [
    // ...
    'encryption_master_key_base64' => env('PUSHER_ENCRYPTION_MASTER_KEY'),
],
```

Puedes generar una clave adecuada usando el comando `openssl`:

```shell
openssl rand -base64 32
```

<a id="ably"></a>
### Ably

> **Nota:**
> La siguiente documentación explica cómo utilizar Ably en el modo "Compatibilidad con Pusher". Sin embargo, el equipo de Ably recomienda y mantiene un difusor y un cliente Echo que permite aprovechar las capacidades únicas que ofrece Ably. Para obtener más información sobre el uso de los controladores mantenidos por Ably, [consulta la documentación del difusor de Laravel de Ably](https://github.com/ably/laravel-broadcaster).

Para habilitar rápidamente la compatibilidad con las funciones de difusión de Laravel mientras usas [Ably](https://ably.com) como tu difusor de eventos, invoca el comando Artisan `install:broadcasting` con la opción `--ably`. Este comando de Artisan te solicitará tus credenciales de Ably, instalará los SDK de PHP y JavaScript de Ably y actualizará el archivo `.env` de tu aplicación con las variables apropiadas:

```shell
php artisan install:broadcasting --ably
```

**Antes de continuar, debes habilitar la compatibilidad con el protocolo Pusher en la configuración de tu aplicación Ably. Puedes habilitar esta función en la parte "Configuración del adaptador de protocolo" del panel de configuración de tu aplicación Ably.**

<a id="ably-manual-installation"></a>
#### Instalación manual

Para instalar el soporte de Ably manualmente, debes instalar el SDK PHP de Ably usando el gestor de paquetes Composer:

```shell
composer require ably/ably-php
```

A continuación, debes configurar tus credenciales de Ably en el archivo de configuración `config/broadcasting.php`. En este archivo ya se incluye un ejemplo de configuración de Ably, lo que te permite especificar rápidamente tu clave. Normalmente, este valor debe establecerse mediante la [variable de entorno](../configuration/#environment-configuration) `ABLY_KEY`:

```ini
ABLY_KEY=your-ably-key
```

Luego, configura la variable de entorno `BROADCAST_CONNECTION` en `ably` en el archivo `.env` de tu aplicación:

```ini
BROADCAST_CONNECTION=ably
```

Finalmente, estás listo para instalar y configurar [Laravel Echo](#client-side-installation), que recibirá los eventos de difusión en el lado del cliente.

<a id="mercure"></a>
### Mercure

Para habilitar rápidamente la compatibilidad con las funciones de difusión de Laravel mientras usas Mercure como tu difusor de eventos, invoca el comando Artisan `install:broadcasting` con la opción `--mercure`. Este comando de Artisan te solicitará tus credenciales de Mercure, instalará los SDK de PHP y JavaScript de Mercure y actualizará el archivo `.env` de tu aplicación con las variables apropiadas:

```shell
php artisan install:broadcasting --mercure
```

<a id="mercure-manual-installation"></a>
#### Instalación manual

Para instalar el soporte de Mercure manualmente, debes instalar el componente Symfony Mercure y la biblioteca JWT:

```shell
composer require symfony/mercure:^0.8 web-token/jwt-library:^4.1
```

A continuación, debes configurar la conexión Mercure en el archivo `.env` de tu aplicación:

```ini
BROADCAST_CONNECTION=mercure

MERCURE_URL=https://mercure.example.com/.well-known/mercure
MERCURE_PUBLIC_URL=https://mercure.example.com/.well-known/mercure
MERCURE_JWT_SECRET=<your-mercure-jwt-secret>
```

El valor `MERCURE_URL` es la URL que Laravel usa para publicar actualizaciones, mientras que `MERCURE_PUBLIC_URL` es la URL que los clientes del navegador usan para suscribirse. Tu hub Mercure debe estar configurado con el mismo secreto JWT.

Para utilizar [canales privados cifrados de extremo a extremo](#encrypted-private-channels), configura una variable de entorno `MERCURE_ENCRYPTION_KEY` de 32 bytes:

```ini
MERCURE_ENCRYPTION_KEY=<your-32-byte-encryption-key>
```

Finalmente, estás listo para instalar y configurar [Laravel Echo](#client-side-installation), que recibirá los eventos de difusión en el lado del cliente.

<a id="mercure-frankenphp"></a>
#### Hub integrado de FrankenPHP

[FrankenPHP](https://frankenphp.dev) incluye un hub Mercure incorporado. Cuando tu aplicación se sirve mediante FrankenPHP, puedes dejar vacías las variables de entorno `MERCURE_URL` y `MERCURE_PUBLIC_URL`. Luego, Laravel publica actualizaciones directamente en el hub, sin ninguna solicitud HTTP, y los navegadores se suscriben a `/.well-known/mercure` en el dominio de tu aplicación. Cuando se utiliza [Laravel Octane](../octane/), el hub integrado se configura automáticamente.

La publicación directa en el hub integrado solo es posible a partir de solicitudes atendidas por FrankenPHP. Para difundir eventos de otros procesos, como comandos de Artisan o procesos de trabajo de cola, configura la URL del hub:

```ini
MERCURE_URL="${APP_URL}/.well-known/mercure"
```

<a id="mercure-synchronous-broadcasting"></a>
#### Difusión sincrónica

A diferencia de otros controladores, el controlador Mercure difunde eventos inmediatamente en lugar de ponerlos en cola, por lo que no requiere un proceso de trabajo de cola. La publicación de una actualización es rápida, ya que el hub la envía a los suscriptores de forma asincrónica. Para difundir eventos usando tu [cola](#broadcast-queue) en su lugar, configura la variable de entorno `MERCURE_ASYNC` en `true`:

```ini
MERCURE_ASYNC=true
```

Dado que los procesos de trabajo de la cola publican actualizaciones a través de HTTP, `MERCURE_ASYNC` requiere la variable de entorno `MERCURE_URL`. Cuando utilices el hub integrado de FrankenPHP, establece su valor en la URL del hub, [como se describe anteriormente](#mercure-frankenphp).

<a id="client-side-installation"></a>
## Instalación del lado del cliente

<a id="client-reverb"></a>
### Reverb

[Laravel Echo](https://github.com/laravel/echo) es una biblioteca de JavaScript que hace que sea sencillo suscribirse a canales y escuchar eventos difundidos por tu controlador de difusión del lado del servidor.

Al instalar Laravel Reverb mediante el comando Artisan `install:broadcasting`, la estructura inicial y la configuración de Reverb y Echo se inyectarán en tu aplicación automáticamente. Sin embargo, si deseas configurar Laravel Echo manualmente, puedes hacerlo siguiendo las instrucciones a continuación.

<a id="reverb-client-manual-installation"></a>
#### Instalación manual

Para configurar manualmente Laravel Echo para el frontend de tu aplicación, primero instala el paquete `pusher-js` ya que Reverb utiliza el protocolo Pusher para suscripciones, canales y mensajes de WebSocket:

```shell
npm install --save-dev laravel-echo pusher-js
```

Una vez que Echo esté instalado, estarás listo para crear una nueva instancia de Echo en el JavaScript de tu aplicación. Un excelente lugar para hacer esto es en la parte inferior del archivo `resources/js/app.js` que se incluye con el framework Laravel:

```js tab=JavaScript
import Echo from 'laravel-echo';

import Pusher from 'pusher-js';
window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
});
```

```js tab=React
import { configureEcho } from "@laravel/echo-react";

configureEcho({
    broadcaster: "reverb",
    // key: import.meta.env.VITE_REVERB_APP_KEY,
    // wsHost: import.meta.env.VITE_REVERB_HOST,
    // wsPort: import.meta.env.VITE_REVERB_PORT,
    // wssPort: import.meta.env.VITE_REVERB_PORT,
    // forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    // enabledTransports: ['ws', 'wss'],
});
```

```js tab=Vue
import { configureEcho } from "@laravel/echo-vue";

configureEcho({
    broadcaster: "reverb",
    // key: import.meta.env.VITE_REVERB_APP_KEY,
    // wsHost: import.meta.env.VITE_REVERB_HOST,
    // wsPort: import.meta.env.VITE_REVERB_PORT,
    // wssPort: import.meta.env.VITE_REVERB_PORT,
    // forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    // enabledTransports: ['ws', 'wss'],
});
```

```js tab=Svelte
import { configureEcho } from "@laravel/echo-svelte";

configureEcho({
    broadcaster: "reverb",
    // key: import.meta.env.VITE_REVERB_APP_KEY,
    // wsHost: import.meta.env.VITE_REVERB_HOST,
    // wsPort: import.meta.env.VITE_REVERB_PORT,
    // wssPort: import.meta.env.VITE_REVERB_PORT,
    // forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    // enabledTransports: ['ws', 'wss'],
});
```

A continuación, debes compilar los recursos de tu aplicación:

```shell
npm run build
```

> **Advertencia:**
> El difusor `reverb` de Laravel Echo requiere laravel-echo v1.16.0+.

<a id="client-pusher-channels"></a>
### Pusher Channels

[Laravel Echo](https://github.com/laravel/echo) es una biblioteca de JavaScript que hace que sea sencillo suscribirse a canales y escuchar eventos difundidos por tu controlador de difusión del lado del servidor.

Al instalar soporte de difusión a través del comando Artisan `install:broadcasting --pusher`, la estructura inicial y la configuración de Pusher y Echo se inyectarán en tu aplicación automáticamente. Sin embargo, si deseas configurar Laravel Echo manualmente, puedes hacerlo siguiendo las instrucciones a continuación.

<a id="pusher-client-manual-installation"></a>
#### Instalación manual

Para configurar manualmente Laravel Echo para el frontend de tu aplicación, primero instala los paquetes `laravel-echo` y `pusher-js` que utilizan el protocolo Pusher para suscripciones, canales y mensajes de WebSocket:

```shell
npm install --save-dev laravel-echo pusher-js
```

Una vez que Echo esté instalado, estarás listo para crear una nueva instancia de Echo en el archivo `resources/js/app.js` de tu aplicación:

```js tab=JavaScript
import Echo from 'laravel-echo';

import Pusher from 'pusher-js';
window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true
});
```

```js tab=React
import { configureEcho } from "@laravel/echo-react";

configureEcho({
    broadcaster: "pusher",
    // key: import.meta.env.VITE_PUSHER_APP_KEY,
    // cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    // forceTLS: true,
    // wsHost: import.meta.env.VITE_PUSHER_HOST,
    // wsPort: import.meta.env.VITE_PUSHER_PORT,
    // wssPort: import.meta.env.VITE_PUSHER_PORT,
    // enabledTransports: ["ws", "wss"],
});
```

```js tab=Vue
import { configureEcho } from "@laravel/echo-vue";

configureEcho({
    broadcaster: "pusher",
    // key: import.meta.env.VITE_PUSHER_APP_KEY,
    // cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    // forceTLS: true,
    // wsHost: import.meta.env.VITE_PUSHER_HOST,
    // wsPort: import.meta.env.VITE_PUSHER_PORT,
    // wssPort: import.meta.env.VITE_PUSHER_PORT,
    // enabledTransports: ["ws", "wss"],
});
```

```js tab=Svelte
import { configureEcho } from "@laravel/echo-svelte";

configureEcho({
    broadcaster: "pusher",
    // key: import.meta.env.VITE_PUSHER_APP_KEY,
    // cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    // forceTLS: true,
    // wsHost: import.meta.env.VITE_PUSHER_HOST,
    // wsPort: import.meta.env.VITE_PUSHER_PORT,
    // wssPort: import.meta.env.VITE_PUSHER_PORT,
    // enabledTransports: ["ws", "wss"],
});
```

A continuación, debes definir los valores apropiados para las variables de entorno de Pusher en el archivo `.env` de tu aplicación. Si estas variables aún no existen en tu archivo `.env`, debes agregarlas:

```ini
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_APP_KEY="your-pusher-key"
PUSHER_APP_SECRET="your-pusher-secret"
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME="https"
PUSHER_APP_CLUSTER="mt1"

VITE_APP_NAME="${APP_NAME}"
VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
VITE_PUSHER_HOST="${PUSHER_HOST}"
VITE_PUSHER_PORT="${PUSHER_PORT}"
VITE_PUSHER_SCHEME="${PUSHER_SCHEME}"
VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
```

Una vez que hayas ajustado la configuración de Echo según las necesidades de tu aplicación, puedes compilar los recursos de tu aplicación:

```shell
npm run build
```

> **Nota:**
> Para obtener más información sobre cómo compilar los recursos JavaScript de tu aplicación, consulta la documentación en [Vite](../vite/).

<a id="using-an-existing-client-instance"></a>
#### Uso de una instancia de cliente existente

Si ya tienes una instancia de cliente de Pusher Channels preconfigurada que deseas que Echo utilice, puedes pasarla a Echo a través de la opción de configuración `client`:

```js
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

const options = {
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY
}

window.Echo = new Echo({
    ...options,
    client: new Pusher(options.key, options)
});
```

<a id="client-ably"></a>
### Ably

> **Nota:**
> La siguiente documentación explica cómo utilizar Ably en el modo "Compatibilidad con Pusher". Sin embargo, el equipo de Ably recomienda y mantiene un difusor y un cliente Echo que permite aprovechar las capacidades únicas que ofrece Ably. Para obtener más información sobre el uso de los controladores mantenidos por Ably, [consulta la documentación del difusor de Laravel de Ably](https://github.com/ably/laravel-broadcaster).

[Laravel Echo](https://github.com/laravel/echo) es una biblioteca de JavaScript que hace que sea sencillo suscribirse a canales y escuchar eventos difundidos por tu controlador de difusión del lado del servidor.

Al instalar el soporte de difusión a través del comando Artisan `install:broadcasting --ably`, la estructura inicial y la configuración de Ably y Echo se inyectarán en tu aplicación automáticamente. Sin embargo, si deseas configurar Laravel Echo manualmente, puedes hacerlo siguiendo las instrucciones a continuación.

<a id="ably-client-manual-installation"></a>
#### Instalación manual

Para configurar manualmente Laravel Echo para el frontend de tu aplicación, primero instala los paquetes `laravel-echo` y `pusher-js` que utilizan el protocolo Pusher para suscripciones, canales y mensajes de WebSocket:

```shell
npm install --save-dev laravel-echo pusher-js
```

**Antes de continuar, debes habilitar la compatibilidad con el protocolo Pusher en la configuración de tu aplicación Ably. Puedes habilitar esta función en la parte "Configuración del adaptador de protocolo" del panel de configuración de tu aplicación Ably.**

Una vez que Echo esté instalado, estarás listo para crear una nueva instancia de Echo en el archivo `resources/js/app.js` de tu aplicación:

```js tab=JavaScript
import Echo from 'laravel-echo';

import Pusher from 'pusher-js';
window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_ABLY_PUBLIC_KEY,
    wsHost: 'realtime-pusher.ably.io',
    wsPort: 443,
    disableStats: true,
    encrypted: true,
});
```

```js tab=React
import { configureEcho } from "@laravel/echo-react";

configureEcho({
    broadcaster: "ably",
    // key: import.meta.env.VITE_ABLY_PUBLIC_KEY,
    // wsHost: "realtime-pusher.ably.io",
    // wsPort: 443,
    // disableStats: true,
    // encrypted: true,
});
```

```js tab=Vue
import { configureEcho } from "@laravel/echo-vue";

configureEcho({
    broadcaster: "ably",
    // key: import.meta.env.VITE_ABLY_PUBLIC_KEY,
    // wsHost: "realtime-pusher.ably.io",
    // wsPort: 443,
    // disableStats: true,
    // encrypted: true,
});
```

```js tab=Svelte
import { configureEcho } from "@laravel/echo-svelte";

configureEcho({
    broadcaster: "ably",
    // key: import.meta.env.VITE_ABLY_PUBLIC_KEY,
    // wsHost: "realtime-pusher.ably.io",
    // wsPort: 443,
    // disableStats: true,
    // encrypted: true,
});
```

Es posible que hayas notado que nuestra configuración de Ably Echo hace referencia a una variable de entorno `VITE_ABLY_PUBLIC_KEY`. El valor de esta variable debe ser tu clave pública de Ably. Tu clave pública es la parte de tu clave Ably que aparece antes del carácter `:`.

Una vez que hayas ajustado la configuración de Echo según tus necesidades, puedes compilar los recursos de tu aplicación:

```shell
npm run dev
```

> **Nota:**
> Para obtener más información sobre cómo compilar los recursos JavaScript de tu aplicación, consulta la documentación en [Vite](../vite/).

<a id="client-mercure"></a>
### Mercure

Para usar Mercure con Laravel Echo, instala el paquete `laravel-echo`:

```shell
npm install --save-dev laravel-echo
```

A continuación, crea una instancia de Echo con el difusor `mercure`. La opción `host` tiene por defecto `/.well-known/mercure` en el origen actual:

```js tab=JavaScript
import Echo from 'laravel-echo';

window.Echo = new Echo({
    broadcaster: 'mercure',
    host: import.meta.env.VITE_MERCURE_HUB_URL,
});
```

```js tab=React
import { configureEcho } from "@laravel/echo-react";

configureEcho({
    broadcaster: "mercure",
});
```

```js tab=Vue
import { configureEcho } from "@laravel/echo-vue";

configureEcho({
    broadcaster: "mercure",
});
```

```js tab=Svelte
import { configureEcho } from "@laravel/echo-svelte";

configureEcho({
    broadcaster: "mercure",
});
```

Define la URL del hub en tu archivo `.env`:

```ini
VITE_MERCURE_HUB_URL="${MERCURE_PUBLIC_URL}"
```

<a id="concept-overview"></a>
## Descripción general del concepto

La difusión de eventos de Laravel te permite difundir tus eventos Laravel del lado del servidor a tu aplicación JavaScript del lado del cliente utilizando un enfoque basado en controladores. Actualmente, Laravel se entrega con los controladores [Laravel Reverb](https://reverb.laravel.com), [Pusher Channels](https://pusher.com/channels), [Ably](https://ably.com) y [Mercure](https://mercure.rocks). Los eventos se pueden consumir fácilmente en el lado del cliente utilizando el paquete JavaScript [Laravel Echo](#client-side-installation).

Los eventos se difunden a través de "canales", que pueden especificarse como públicos o privados. Cualquier visitante de tu aplicación puede suscribirse a un canal público sin ninguna autenticación o autorización; sin embargo, para suscribirse a un canal privado, el usuario debe estar autenticado y autorizado para escuchar en ese canal.

<a id="using-example-application"></a>
### Uso de una aplicación de ejemplo

Antes de profundizar en cada componente de la difusión de eventos, veamos una descripción general utilizando una tienda de comercio electrónico como ejemplo.

En nuestra aplicación, supongamos que tenemos una página que permite a los usuarios ver el estado de envío de sus pedidos. Supongamos también que se activa un evento `OrderShipmentStatusUpdated` cuando la aplicación procesa una actualización del estado de envío:

```php
use App\Events\OrderShipmentStatusUpdated;

OrderShipmentStatusUpdated::dispatch($order);
```

<a id="the-shouldbroadcast-interface"></a>
#### La interfaz `ShouldBroadcast`

Cuando un usuario ve uno de sus pedidos, no queremos que tenga que actualizar la página para ver las actualizaciones de estado. En cambio, queremos difundir las actualizaciones de la aplicación a medida que se crean. Entonces, necesitamos marcar el evento `OrderShipmentStatusUpdated` con la interfaz `ShouldBroadcast`. Esto le indicará a Laravel que difunda el evento cuando se active:

```php
<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class OrderShipmentStatusUpdated implements ShouldBroadcast
{
    /**
     * The order instance.
     *
     * @var \App\Models\Order
     */
    public $order;
}
```

La interfaz `ShouldBroadcast` requiere que nuestro evento defina un método `broadcastOn`. Este método se encarga de devolver los canales en los que se debe difundir el evento. Una plantilla vacía de este método ya está definida en las clases de eventos generadas, por lo que solo necesitamos completar sus detalles. Solo queremos que el creador del pedido pueda ver las actualizaciones de estado, por lo que difundiremos el evento en un canal privado vinculado al pedido:

```php
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;

/**
 * Get the channel the event should broadcast on.
 */
public function broadcastOn(): Channel
{
    return new PrivateChannel('orders.'.$this->order->id);
}
```

Si deseas que el evento se difunda en varios canales, puedes devolver un `array` en su lugar:

```php
use Illuminate\Broadcasting\PrivateChannel;

/**
 * Get the channels the event should broadcast on.
 *
 * @return array<int, \Illuminate\Broadcasting\Channel>
 */
public function broadcastOn(): array
{
    return [
        new PrivateChannel('orders.'.$this->order->id),
        // ...
    ];
}
```

<a id="example-application-authorizing-channels"></a>
#### Autorización de canales

Recuerda, los usuarios deben estar autorizados para escuchar en canales privados. Podemos definir nuestras reglas de autorización de canal en el archivo `routes/channels.php` de nuestra aplicación. En este ejemplo, debemos verificar que cualquier usuario que intente escuchar en el canal privado `orders.1` sea en realidad el creador del pedido:

```php
use App\Models\Order;
use App\Models\User;

Broadcast::channel('orders.{orderId}', function (User $user, int $orderId) {
    return $user->id === Order::findOrNew($orderId)->user_id;
});
```

El método `channel` acepta dos argumentos: el nombre del canal y un callback que devuelve `true` o `false` indicando si el usuario está autorizado a escuchar en el canal.

Todos los callbacks de autorización reciben el usuario actualmente autenticado como primer argumento y cualquier parámetro comodín adicional como argumento posterior. En este ejemplo, utilizamos el marcador de posición `{orderId}` para indicar que la parte "ID" del nombre del canal es un comodín.

<a id="listening-for-event-broadcasts"></a>
#### Escucha de difusiones de eventos

A continuación solo queda escuchar el evento en nuestra aplicación JavaScript. Podemos hacer esto usando [Laravel Echo](#client-side-installation). Los hooks React, Vue y Svelte integrados de Laravel Echo facilitan el inicio y, de forma predeterminada, todas las propiedades públicas del evento se incluirán en el evento de difusión:

```js tab=React
import { useEcho } from "@laravel/echo-react";

useEcho(
    `orders.${orderId}`,
    "OrderShipmentStatusUpdated",
    (e) => {
        console.log(e.order);
    },
);
```

```vue tab=Vue
<script setup lang="ts">
import { useEcho } from "@laravel/echo-vue";

useEcho(
    `orders.${orderId}`,
    "OrderShipmentStatusUpdated",
    (e) => {
        console.log(e.order);
    },
);
</script>
```

```svelte tab=Svelte
<script>
import { useEcho } from "@laravel/echo-svelte";

useEcho(
    `orders.${orderId}`,
    "OrderShipmentStatusUpdated",
    (e) => {
        console.log(e.order);
    },
);
</script>
```

<a id="defining-broadcast-events"></a>
## Definición de eventos de difusión

Para informar a Laravel que se debe difundir un evento determinado, debes implementar la interfaz `Illuminate\Contracts\Broadcasting\ShouldBroadcast` en la clase de evento. Esta interfaz ya está importada en todas las clases de eventos generadas por el framework, por lo que puedes agregarla fácilmente a cualquiera de tus eventos.

La interfaz `ShouldBroadcast` requiere que implementes un único método: `broadcastOn`. El método `broadcastOn` debe devolver un canal o un array de canales en los que debería difundirse el evento. Los canales deben ser instancias de `Channel`, `PrivateChannel` o `PresenceChannel`. Las instancias de `Channel` representan canales públicos a los que cualquier usuario puede suscribirse, mientras que `PrivateChannels` y `PresenceChannels` representan canales privados que requieren [autorización de canal](#authorizing-channels):

```php
<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class ServerCreated implements ShouldBroadcast
{
    use SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public User $user,
    ) {}

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.'.$this->user->id),
        ];
    }
}
```

Después de implementar la interfaz `ShouldBroadcast`, solo necesitas [activar el evento](../events/) como lo harías normalmente. Una vez que se haya activado el evento, un [trabajo en cola](../queues/) difundirá automáticamente el evento utilizando el controlador de difusión especificado.

<a id="broadcast-name"></a>
### Nombre de difusión

De forma predeterminada, Laravel difundirá el evento utilizando el nombre de clase del evento. Sin embargo, puedes personalizar el nombre de la difusión definiendo un método `broadcastAs` en el evento:

```php
/**
 * The event's broadcast name.
 */
public function broadcastAs(): string
{
    return 'server.created';
}
```

Si personalizas el nombre de la difusión utilizando el método `broadcastAs`, debes asegurarte de registrar a tu listener con un carácter inicial `.`. Esto le indicará a Echo que no anteponga el espacio de nombres de la aplicación al evento:

```js
.listen('.server.created', function (e) {
    // ...
});
```

<a id="broadcast-data"></a>
### Datos de difusión

Cuando se difunde un evento, todas sus propiedades `public` se serializan y difunden automáticamente como la carga útil del evento, lo que te permite acceder a cualquiera de sus datos públicos desde tu aplicación JavaScript. Entonces, por ejemplo, si tu evento tiene una única propiedad pública `$user` que contiene un modelo Eloquent, la carga útil de difusión del evento sería:

```json
{
    "user": {
        "id": 1,
        "name": "Patrick Stewart"
        ...
    }
}
```

Sin embargo, si deseas tener un control más detallado sobre la carga útil de tu difusión, puedes agregar un método `broadcastWith` a tu evento. Este método debe devolver el array de datos que deseas difundir como carga útil del evento:

```php
/**
 * Get the data to broadcast.
 *
 * @return array<string, mixed>
 */
public function broadcastWith(): array
{
    return ['id' => $this->user->id];
}
```

<a id="broadcast-queue"></a>
### Cola de difusión

De forma predeterminada, cada evento de difusión se coloca en la cola predeterminada para la conexión de cola predeterminada especificada en tu archivo de configuración `queue.php`. Puedes personalizar la conexión de la cola y el nombre utilizado por el difusor utilizando los atributos `Connection` y `Queue` en tu clase de evento:

```php
use Illuminate\Queue\Attributes\Connection;
use Illuminate\Queue\Attributes\Queue;

#[Connection('redis')]
#[Queue('default')]
class ServerCreated implements ShouldBroadcast
{
    // ...
}
```

Alternativamente, puedes personalizar el nombre de la cola definiendo un método `broadcastQueue` en tu evento:

```php
/**
 * The name of the queue on which to place the broadcasting job.
 */
public function broadcastQueue(): string
{
    return 'default';
}
```

Si deseas que todos tus eventos de difusión utilicen la misma cola sin personalizar cada clase de evento, puedes [enrutar el contrato `ShouldBroadcast` a una cola](../queues/#queue-routing) en su lugar.

Si deseas difundir tu evento utilizando la cola `sync` en lugar del controlador de cola predeterminado, puedes implementar la interfaz `ShouldBroadcastNow` en lugar de `ShouldBroadcast`:

```php
<?php

namespace App\Events;

use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class OrderShipmentStatusUpdated implements ShouldBroadcastNow
{
    // ...
}
```

<a id="broadcast-conditions"></a>
### Condiciones de difusión

A veces deseas difundir tu evento solo si una condición determinada es verdadera. Puedes definir estas condiciones agregando un método `broadcastWhen` a tu clase de evento:

```php
/**
 * Determine if this event should broadcast.
 */
public function broadcastWhen(): bool
{
    return $this->order->value > 100;
}
```

<a id="broadcasting-and-database-transactions"></a>
#### Difusión de eventos y transacciones de bases de datos

Cuando los eventos de difusión se despachan dentro de transacciones de la base de datos, la cola puede procesarlos antes de que se haya confirmado la transacción de la base de datos. Cuando esto sucede, es posible que las actualizaciones que hayas realizado en los modelos o registros de la base de datos durante la transacción de la base de datos aún no se reflejen en la base de datos. Además, es posible que cualquier modelo o registro de base de datos creado dentro de la transacción no exista en la base de datos. Si tu evento depende de estos modelos, pueden ocurrir errores inesperados cuando se procesa el trabajo que difunde el evento.

Si la opción de configuración `after_commit` de tu conexión de cola está configurada en `false`, aún puedes indicar que se debe despachar un evento de difusión en particular después de que se hayan confirmado todas las transacciones abiertas de la base de datos implementando la interfaz `ShouldDispatchAfterCommit` en la clase de evento:

```php
<?php

namespace App\Events;

use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Queue\SerializesModels;

class ServerCreated implements ShouldBroadcast, ShouldDispatchAfterCommit
{
    use SerializesModels;
}
```

> **Nota:**
> Para obtener más información sobre cómo solucionar estos problemas, revisa la documentación sobre [trabajos en cola y transacciones de bases de datos](../queues/#jobs-and-database-transactions).

<a id="authorizing-channels"></a>
## Autorización de canales

Los canales privados requieren que autorices que el usuario actualmente autenticado pueda escuchar el canal. Esto se logra realizando una solicitud HTTP a tu aplicación Laravel con el nombre del canal y permitiendo que tu aplicación determine si el usuario puede escuchar en ese canal. Al utilizar [Laravel Echo](#client-side-installation), la solicitud HTTP para autorizar suscripciones a canales privados se realizará automáticamente.

Cuando se instala la difusión, Laravel intenta registrar automáticamente la ruta `/broadcasting/auth` para manejar las solicitudes de autorización. Si Laravel no puede registrar automáticamente estas rutas, puedes registrarlas manualmente en el archivo `/bootstrap/app.php` de tu aplicación:

```php
->withRouting(
    web: __DIR__.'/../routes/web.php',
    channels: __DIR__.'/../routes/channels.php',
    health: '/up',
)
```

<a id="defining-authorization-callbacks"></a>
### Definición de callbacks de autorización

A continuación, debemos definir la lógica que realmente determinará si el usuario actualmente autenticado puede escuchar un canal determinado. Esto se hace en el archivo `routes/channels.php` que fue creado por el comando Artisan `install:broadcasting`. En este archivo, puedes utilizar el método `Broadcast::channel` para registrar callbacks de autorización de canal:

```php
use App\Models\User;

Broadcast::channel('orders.{orderId}', function (User $user, int $orderId) {
    return $user->id === Order::findOrNew($orderId)->user_id;
});
```

El método `channel` acepta dos argumentos: el nombre del canal y un callback que devuelve `true` o `false` indicando si el usuario está autorizado a escuchar en el canal.

Todos los callbacks de autorización reciben el usuario actualmente autenticado como primer argumento y cualquier parámetro comodín adicional como argumento posterior. En este ejemplo, utilizamos el marcador de posición `{orderId}` para indicar que la parte "ID" del nombre del canal es un comodín.

Puedes ver una lista de los callbacks de autorización de difusión de tu aplicación usando el comando Artisan `channel:list`:

```shell
php artisan channel:list
```

<a id="authorization-callback-model-binding"></a>
#### Vinculación de modelos en callbacks de autorización

Al igual que las rutas HTTP, las rutas de canal también pueden aprovechar la [vinculación de modelos de ruta](../routing/#route-model-binding) implícita y explícita. Por ejemplo, en lugar de recibir una cadena o un ID de pedido numérico, puedes solicitar una instancia de modelo `Order` real:

```php
use App\Models\Order;
use App\Models\User;

Broadcast::channel('orders.{order}', function (User $user, Order $order) {
    return $user->id === $order->user_id;
});
```

> **Advertencia:**
> A diferencia de la vinculación de modelos de rutas HTTP, la vinculación de modelos de canales no admite la [limitación automática del alcance de las vinculaciones implícitas de modelos](../routing/#implicit-model-binding-scoping). Sin embargo, esto rara vez es un problema porque la mayoría de los canales pueden tener un alcance basado en la clave primaria única de un único modelo.

<a id="authorization-callback-authentication"></a>
#### Autenticación de callbacks de autorización

Los canales de difusión privados y de presencia autentican al usuario actual a través del guard de autenticación predeterminado de tu aplicación. Si el usuario no está autenticado, la autorización del canal se deniega automáticamente y el callback de autorización nunca se ejecuta. Sin embargo, puedes asignar varios guards personalizados que deben autenticar la solicitud entrante si es necesario:

```php
Broadcast::channel('channel', function () {
    // ...
}, ['guards' => ['web', 'admin']]);
```

<a id="defining-channel-classes"></a>
### Definición de clases de canales

Si tu aplicación consume muchos canales diferentes, tu archivo `routes/channels.php` podría volverse voluminoso. Entonces, en lugar de usar funciones anónimas para autorizar canales, puedes usar clases de canal. Para generar una clase de canal, utiliza el comando Artisan `make:channel`. Este comando colocará una nueva clase de canal en el directorio `App/Broadcasting`.

```shell
php artisan make:channel OrderChannel
```

A continuación, registra tu canal en tu archivo `routes/channels.php`:

```php
use App\Broadcasting\OrderChannel;

Broadcast::channel('orders.{order}', OrderChannel::class);
```

Finalmente, puedes colocar la lógica de autorización para tu canal en el método `join` de la clase de canal. Este método `join` albergará la misma lógica que normalmente habrías colocado en la función anónima de autorización de tu canal. También puedes aprovechar la vinculación de modelos de canal:

```php
<?php

namespace App\Broadcasting;

use App\Models\Order;
use App\Models\User;

class OrderChannel
{
    /**
     * Create a new channel instance.
     */
    public function __construct() {}

    /**
     * Authenticate the user's access to the channel.
     */
    public function join(User $user, Order $order): array|bool
    {
        return $user->id === $order->user_id;
    }
}
```

> **Nota:**
> Como muchas otras clases en Laravel, las clases de canal serán resueltas automáticamente por el [contenedor de servicios](../container/). Por lo tanto, puedes declarar los tipos de las dependencias que requiera tu canal en su constructor.

<a id="broadcasting-events"></a>
## Difusión de eventos

Una vez que hayas definido un evento y lo hayas marcado con la interfaz `ShouldBroadcast`, solo necesitas activar el evento utilizando el método de despacho del evento. El despachador de eventos notará que el evento está marcado con la interfaz `ShouldBroadcast` y pondrá el evento en cola para su difusión:

```php
use App\Events\OrderShipmentStatusUpdated;

OrderShipmentStatusUpdated::dispatch($order);
```

<a id="only-to-others"></a>
### Solo para otros

Al crear una aplicación que utiliza difusión de eventos, es posible que ocasionalmente necesites difundir un evento a todos los suscriptores de un canal determinado, excepto al usuario actual. Puedes lograr esto utilizando la función auxiliar `broadcast` y el método `toOthers`:

```php
use App\Events\OrderShipmentStatusUpdated;

broadcast(new OrderShipmentStatusUpdated($update))->toOthers();
```

Para comprender mejor cuándo es posible que desees utilizar el método `toOthers`, imaginemos una aplicación de lista de tareas donde un usuario puede crear una nueva tarea ingresando un nombre de tarea. Para crear una tarea, tu aplicación puede realizar una solicitud a una URL `/task` que difunde la creación de la tarea y devuelve una representación JSON de la nueva tarea. Cuando tu aplicación JavaScript recibe la respuesta del endpoint, podría insertar directamente la nueva tarea en tu lista de tareas de la siguiente manera:

```js
axios.post('/task', task)
    .then((response) => {
        this.tasks.push(response.data);
    });
```

Sin embargo, recuerda que también difundimos la creación de la tarea. Si tu aplicación JavaScript también está escuchando este evento para agregar tareas a la lista de tareas, tendrás tareas duplicadas en tu lista: una del endpoint y otra de la difusión. Puedes resolver esto utilizando el método `toOthers` para indicarle al emisor que no difunda el evento al usuario actual.

> **Advertencia:**
> Tu evento debe utilizar el trait `Illuminate\Broadcasting\InteractsWithSockets` para poder llamar al método `toOthers`.

<a id="only-to-others-configuration"></a>
#### Configuración

Cuando inicializas una instancia de Laravel Echo, se asigna un ID de socket a la conexión. Si estás utilizando una instancia global [Axios](https://github.com/axios/axios) para realizar solicitudes HTTP desde tu aplicación JavaScript, el ID del socket se adjuntará automáticamente a cada solicitud saliente como un encabezado `X-Socket-ID`. Luego, cuando llamas al método `toOthers`, Laravel extraerá el ID del socket del encabezado e indicará al difusor que no difunda a ninguna conexión con ese ID de socket.

Si no estás utilizando una instancia global de Axios, deberás configurar manualmente tu aplicación JavaScript para enviar el encabezado `X-Socket-ID` con todas las solicitudes salientes. Puedes recuperar el ID del socket utilizando el método `Echo.socketId`:

```js
var socketId = Echo.socketId();
```

<a id="customizing-the-connection"></a>
### Personalización de la conexión

Si tu aplicación interactúa con múltiples conexiones de difusión y deseas difundir un evento usando un difusor distinto al predeterminado, puedes especificar a qué conexión enviar un evento usando el método `via`:

```php
use App\Events\OrderShipmentStatusUpdated;

broadcast(new OrderShipmentStatusUpdated($update))->via('pusher');
```

Alternativamente, puedes especificar la conexión de difusión del evento llamando al método `broadcastVia` dentro del constructor del evento. Sin embargo, antes de hacerlo, debes asegurarte de que la clase de evento utilice el trait `InteractsWithBroadcasting`:

```php
<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithBroadcasting;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class OrderShipmentStatusUpdated implements ShouldBroadcast
{
    use InteractsWithBroadcasting;

    /**
     * Create a new event instance.
     */
    public function __construct()
    {
        $this->broadcastVia('pusher');
    }
}
```

<a id="anonymous-events"></a>
### Eventos anónimos

A veces, es posible que desees difundir un evento simple al frontend de tu aplicación sin crear una clase de evento dedicada. Para adaptarse a esto, la fachada `Broadcast` te permite difundir "eventos anónimos":

```php
Broadcast::on('orders.'.$order->id)->send();
```

El ejemplo anterior difundirá el siguiente evento:

```json
{
    "event": "AnonymousEvent",
    "data": "[]",
    "channel": "orders.1"
}
```

Utilizando los métodos `as` y `with` podrás personalizar el nombre y los datos del evento:

```php
Broadcast::on('orders.'.$order->id)
    ->as('OrderPlaced')
    ->with($order)
    ->send();
```

El ejemplo anterior difundirá un evento como el siguiente:

```json
{
    "event": "OrderPlaced",
    "data": "{ id: 1, total: 100 }",
    "channel": "orders.1"
}
```

Si deseas difundir el evento anónimo en un canal privado o de presencia, puedes utilizar los métodos `private` y `presence`:

```php
Broadcast::private('orders.'.$order->id)->send();
Broadcast::presence('channels.'.$channel->id)->send();
```

La difusión de un evento anónimo utilizando el método `send` despacha el evento a la [cola](../queues/) de tu aplicación para su procesamiento. Sin embargo, si deseas difundir el evento inmediatamente, puedes utilizar el método `sendNow`:

```php
Broadcast::on('orders.'.$order->id)->sendNow();
```

Para difundir el evento a todos los suscriptores del canal excepto al usuario actualmente autenticado, puedes invocar el método `toOthers`:

```php
Broadcast::on('orders.'.$order->id)
    ->toOthers()
    ->send();
```

<a id="rescuing-broadcasts"></a>
### Rescate de difusiones

Cuando el servidor de cola de tu aplicación no está disponible o Laravel encuentra un error al difundir un evento, se genera una excepción que generalmente hace que el usuario final vea un error de la aplicación. Dado que la difusión de eventos suele ser complementaria a la funcionalidad principal de tu aplicación, puedes evitar que estas excepciones interrumpan la experiencia del usuario implementando la interfaz `ShouldRescue` en tus eventos.

Los eventos que implementan la interfaz `ShouldRescue` utilizan automáticamente la [función auxiliar rescue](../helpers/#method-rescue) de Laravel durante los intentos de difusión. Esta función auxiliar detecta cualquier excepción, la informa al controlador de excepciones de tu aplicación para que la registre y permite que la aplicación continúe ejecutándose normalmente sin interrumpir el flujo de trabajo del usuario:

```php
<?php

namespace App\Events;

use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldRescue;

class ServerCreated implements ShouldBroadcast, ShouldRescue
{
    // ...
}
```

<a id="receiving-broadcasts"></a>
## Recepción de difusiones

<a id="listening-for-events"></a>
### Escucha de eventos

Una vez que hayas [instalado y creado una instancia de Laravel Echo](#client-side-installation), estarás listo para comenzar a escuchar los eventos que se difunden desde tu aplicación Laravel. Primero, usa el método `channel` para recuperar una instancia de un canal, luego llama al método `listen` para escuchar un evento específico:

```js
Echo.channel(`orders.${this.order.id}`)
    .listen('OrderShipmentStatusUpdated', (e) => {
        console.log(e.order.name);
    });
```

Si deseas escuchar eventos en un canal privado, utiliza el método `private`. Puedes continuar encadenando llamadas al método `listen` para escuchar múltiples eventos en un solo canal:

```js
Echo.private(`orders.${this.order.id}`)
    .listen(/* ... */)
    .listen(/* ... */)
    .listen(/* ... */);
```

<a id="stop-listening-for-events"></a>
#### Dejar de escuchar eventos

Si deseas dejar de escuchar un evento determinado sin [dejar el canal](#leaving-a-channel), puedes utilizar el método `stopListening`:

```js
Echo.private(`orders.${this.order.id}`)
    .stopListening('OrderShipmentStatusUpdated');
```

<a id="leaving-a-channel"></a>
### Salir de un canal

Para abandonar un canal, puedes llamar al método `leaveChannel` en tu instancia de Echo:

```js
Echo.leaveChannel(`orders.${this.order.id}`);
```

Si deseas abandonar un canal y también sus canales privados y de presencia asociados, puedes llamar al método `leave`:

```js
Echo.leave(`orders.${this.order.id}`);
```
<a id="namespaces"></a>
### Espacios de nombres

Es posible que hayas notado en los ejemplos anteriores que no especificamos el espacio de nombres `App\Events` completo para las clases de eventos. Esto se debe a que Echo asumirá automáticamente que los eventos están ubicados en el espacio de nombres `App\Events`. Sin embargo, puedes configurar el espacio de nombres raíz cuando creas una instancia de Echo pasando una opción de configuración `namespace`:

```js
window.Echo = new Echo({
    broadcaster: 'pusher',
    // ...
    namespace: 'App.Other.Namespace'
});
```

Alternativamente, puedes prefijar las clases de eventos con `.` al suscribirte a ellas mediante Echo. Esto te permitirá especificar siempre el nombre de clase completo:

```js
Echo.channel('orders')
    .listen('.Namespace\\Event\\Class', (e) => {
        // ...
    });
```

<a id="using-react-or-vue"></a>
### Uso de React, Vue o Svelte

Laravel Echo incluye hooks React, Vue y Svelte que hacen que sea sencillo escuchar eventos. Para comenzar, invoca el hook `useEcho`, que se utiliza para escuchar eventos privados. El hook `useEcho` abandonará automáticamente los canales cuando se desmonte el componente consumidor:

```js tab=React
import { useEcho } from "@laravel/echo-react";

useEcho(
    `orders.${orderId}`,
    "OrderShipmentStatusUpdated",
    (e) => {
        console.log(e.order);
    },
);
```

```vue tab=Vue
<script setup lang="ts">
import { useEcho } from "@laravel/echo-vue";

useEcho(
    `orders.${orderId}`,
    "OrderShipmentStatusUpdated",
    (e) => {
        console.log(e.order);
    },
);
</script>
```

```svelte tab=Svelte
<script>
import { useEcho } from "@laravel/echo-svelte";

useEcho(
    `orders.${orderId}`,
    "OrderShipmentStatusUpdated",
    (e) => {
        console.log(e.order);
    },
);
</script>
```

Puedes escuchar múltiples eventos proporcionando un array de eventos a `useEcho`:

```js
useEcho(
    `orders.${orderId}`,
    ["OrderShipmentStatusUpdated", "OrderShipped"],
    (e) => {
        console.log(e.order);
    },
);
```

También puedes especificar la forma de los datos de carga útil del evento de difusión, lo que proporciona mayor seguridad de tipos y comodidad de edición:

```ts
type OrderData = {
    order: {
        id: number;
        user: {
            id: number;
            name: string;
        };
        created_at: string;
    };
};

useEcho<OrderData>(`orders.${orderId}`, "OrderShipmentStatusUpdated", (e) => {
    console.log(e.order.id);
    console.log(e.order.user.id);
});
```

El hook `useEcho` abandonará automáticamente los canales cuando se desmonte el componente consumidor; sin embargo, puedes utilizar las funciones devueltas para detener o comenzar a escuchar canales manualmente mediante programación cuando sea necesario:

```js tab=React
import { useEcho } from "@laravel/echo-react";

const { leaveChannel, leave, stopListening, listen } = useEcho(
    `orders.${orderId}`,
    "OrderShipmentStatusUpdated",
    (e) => {
        console.log(e.order);
    },
);

// Stop listening without leaving channel...
stopListening();

// Start listening again...
listen();

// Leave channel...
leaveChannel();

// Leave a channel and also its associated private and presence channels...
leave();
```

```vue tab=Vue
<script setup lang="ts">
import { useEcho } from "@laravel/echo-vue";

const { leaveChannel, leave, stopListening, listen } = useEcho(
    `orders.${orderId}`,
    "OrderShipmentStatusUpdated",
    (e) => {
        console.log(e.order);
    },
);

// Stop listening without leaving channel...
stopListening();

// Start listening again...
listen();

// Leave channel...
leaveChannel();

// Leave a channel and also its associated private and presence channels...
leave();
</script>
```

```svelte tab=Svelte
<script>
import { useEcho } from "@laravel/echo-svelte";

const { leaveChannel, leave, stopListening, listen } = useEcho(
    `orders.${orderId}`,
    "OrderShipmentStatusUpdated",
    (e) => {
        console.log(e.order);
    },
);

// Stop listening without leaving channel...
stopListening();

// Start listening again...
listen();

// Leave channel...
leaveChannel();

// Leave a channel and also its associated private and presence channels...
leave();
</script>
```

<a id="react-vue-connecting-to-public-channels"></a>
#### Conexión a canales públicos

Para conectarte a un canal público, puedes utilizar el hook `useEchoPublic`:

```js tab=React
import { useEchoPublic } from "@laravel/echo-react";

useEchoPublic("posts", "PostPublished", (e) => {
    console.log(e.post);
});
```

```vue tab=Vue
<script setup lang="ts">
import { useEchoPublic } from "@laravel/echo-vue";

useEchoPublic("posts", "PostPublished", (e) => {
    console.log(e.post);
});
</script>
```

```svelte tab=Svelte
<script>
import { useEchoPublic } from "@laravel/echo-svelte";

useEchoPublic("posts", "PostPublished", (e) => {
    console.log(e.post);
});
</script>
```

<a id="react-vue-connecting-to-presence-channels"></a>
#### Conexión a canales de presencia

Para conectarte a un canal de presencia, puedes utilizar el hook `useEchoPresence`:

```js tab=React
import { useEchoPresence } from "@laravel/echo-react";

useEchoPresence("posts", "PostPublished", (e) => {
    console.log(e.post);
});
```

```vue tab=Vue
<script setup lang="ts">
import { useEchoPresence } from "@laravel/echo-vue";

useEchoPresence("posts", "PostPublished", (e) => {
    console.log(e.post);
});
</script>
```

```svelte tab=Svelte
<script>
import { useEchoPresence } from "@laravel/echo-svelte";

useEchoPresence("posts", "PostPublished", (e) => {
    console.log(e.post);
});
</script>
```

<a id="react-vue-connection-status"></a>
#### Estado de conexión

Puedes recuperar el estado actual de la conexión WebSocket utilizando el hook `useConnectionStatus`, que proporciona un estado reactivo que se actualiza automáticamente cuando cambia el estado de la conexión:

```js tab=React
import { useConnectionStatus } from "@laravel/echo-react";

function ConnectionIndicator() {
    const status = useConnectionStatus();

    return <div>Connection: {status}</div>;
}
```

```vue tab=Vue
<script setup lang="ts">
import { useConnectionStatus } from "@laravel/echo-vue";

const status = useConnectionStatus();
</script>

<template>
    <div>Connection: {{ status }}</div>
</template>
```

```svelte tab=Svelte
<script>
import { useConnectionStatus } from "@laravel/echo-svelte";

const status = useConnectionStatus();
</script>

<div>Connection: {status()}</div>
```

Los posibles valores de estado son:

<div class="content-list" markdown="1">

- `connected` - Conexión exitosa al servidor WebSocket.
- `connecting` - Intento de conexión inicial en curso.
- `reconnecting` - Intentando volver a conectarse después de una desconexión.
- `disconnected` - No está conectado y no intenta volver a conectarse.
- `failed` - La conexión falló y no se vuelve a intentar.

</div>

<a id="react-vue-socket-id"></a>
#### ID del socket

Puedes recuperar el ID del socket WebSocket actual utilizando el hook `useSocketId`, que proporciona un valor reactivo que se actualiza automáticamente cuando la conexión se vuelve a conectar con un nuevo ID del socket:

```js tab=React
import { useSocketId } from "@laravel/echo-react";

function SocketIndicator() {
    const socketId = useSocketId();

    return <div>Socket ID: {socketId}</div>;
}
```

```vue tab=Vue
<script setup lang="ts">
import { useSocketId } from "@laravel/echo-vue";

const socketId = useSocketId();
</script>

<template>
    <div>Socket ID: {{ socketId }}</div>
</template>
```

```svelte tab=Svelte
<script>
import { useSocketId } from "@laravel/echo-svelte";

const socketId = useSocketId();
</script>

<div>Socket ID: {socketId()}</div>
```

<a id="presence-channels"></a>
## Canales de presencia

Los canales de presencia se basan en la seguridad de los canales privados y al mismo tiempo exponen la característica adicional de saber quién está suscrito al canal. Esto facilita la creación de funciones potentes y colaborativas de aplicaciones, como notificar a los usuarios cuando otro usuario está viendo la misma página o enumerar los habitantes de una sala de chat.

<a id="authorizing-presence-channels"></a>
### Autorización de canales de presencia

Todos los canales de presencia son también canales privados; por lo tanto, los usuarios deben estar [autorizados para acceder a ellos](#authorizing-channels). Sin embargo, al definir callbacks de autorización para canales de presencia, no devolverás `true` si el usuario está autorizado a unirse al canal. En su lugar, deberías devolver un array de datos sobre el usuario.

Los datos devueltos por el callback de autorización estarán disponibles para los listeners de eventos del canal de presencia en tu aplicación JavaScript. Si el usuario no está autorizado a unirse al canal de presencia, deberás devolver `false` o `null`:

```php
use App\Models\User;

Broadcast::channel('chat.{roomId}', function (User $user, int $roomId) {
    if ($user->canJoinRoom($roomId)) {
        return ['id' => $user->id, 'name' => $user->name];
    }
});
```

<a id="joining-presence-channels"></a>
### Unirse a canales de presencia

Para unirte a un canal de presencia, puedes utilizar el método `join` de Echo. El método `join` devolverá una implementación `PresenceChannel` que, además de exponer el método `listen`, te permite suscribirte a los eventos `here`, `joining` y `leaving`.

```js
Echo.join(`chat.${roomId}`)
    .here((users) => {
        // ...
    })
    .joining((user) => {
        console.log(user.name);
    })
    .leaving((user) => {
        console.log(user.name);
    })
    .error((error) => {
        console.error(error);
    });
```

El callback `here` se ejecutará inmediatamente una vez que te hayas unido correctamente al canal y recibirá un array que contiene la información de usuario de todos los demás usuarios actualmente suscritos al canal. El método `joining` se ejecutará cuando un nuevo usuario se una a un canal, mientras que el método `leaving` se ejecutará cuando un usuario abandone el canal. El método `error` se ejecutará cuando el endpoint de autenticación devuelva un código de estado HTTP distinto de 200 o si hay un problema al analizar el JSON devuelto.

<a id="broadcasting-to-presence-channels"></a>
### Difusión a canales de presencia

Los canales de presencia pueden recibir eventos al igual que los canales públicos o privados. Usando el ejemplo de una sala de chat, es posible que deseemos difundir eventos `NewMessage` al canal de presencia de la sala. Para hacerlo, devolveremos una instancia de `PresenceChannel` del método `broadcastOn` del evento:

```php
/**
 * Get the channels the event should broadcast on.
 *
 * @return array<int, \Illuminate\Broadcasting\Channel>
 */
public function broadcastOn(): array
{
    return [
        new PresenceChannel('chat.'.$this->message->room_id),
    ];
}
```

Al igual que con otros eventos, puedes utilizar la función auxiliar `broadcast` y el método `toOthers` para excluir al usuario actual de recibir la difusión:

```php
broadcast(new NewMessage($message));

broadcast(new NewMessage($message))->toOthers();
```

Como es habitual en otros tipos de eventos, puedes escuchar los eventos enviados a canales de presencia utilizando el método `listen` de Echo:

```js
Echo.join(`chat.${roomId}`)
    .here(/* ... */)
    .joining(/* ... */)
    .leaving(/* ... */)
    .listen('NewMessage', (e) => {
        // ...
    });
```

<a id="encrypted-private-channels"></a>
## Canales privados cifrados

Los canales privados garantizan que solo los usuarios autorizados puedan escuchar en un canal. Sin embargo, los datos del evento aún pasan a través de tu servicio de difusión en texto sin formato. Al utilizar Pusher Channels o Mercure, puedes utilizar canales privados cifrados de extremo a extremo para que solo tu aplicación y tus clientes autorizados puedan leer los datos del evento.

Para comenzar, configura una clave de cifrado para [Pusher Channels](#pusher-manual-installation) o [Mercure](#mercure-manual-installation). Luego, devuelve una instancia de `EncryptedPrivateChannel` del método `broadcastOn` de tu evento:

```php
use Illuminate\Broadcasting\EncryptedPrivateChannel;

/**
 * Get the channels the event should broadcast on.
 *
 * @return array<int, \Illuminate\Broadcasting\Channel>
 */
public function broadcastOn(): array
{
    return [
        new EncryptedPrivateChannel('orders.'.$this->order->id),
    ];
}
```

Los canales privados cifrados están autorizados exactamente igual que los canales privados, por lo que un callback de autorización `orders.{orderId}` en el archivo `routes/channels.php` de tu aplicación también autorizará el canal `orders.1` cifrado.

En tu aplicación JavaScript, puedes suscribirte al canal utilizando el método `encryptedPrivate` de Echo:

```js
Echo.encryptedPrivate(`orders.${orderId}`)
    .listen('OrderShipmentStatusUpdated', (e) => {
        console.log(e.order);
    });
```

Cuando se utilizan Pusher Channels, la compilación predeterminada `pusher-js` no incluye el código necesario para descifrar mensajes. En su lugar, debes importar la compilación `with-encryption` al [configurar Echo](#pusher-client-manual-installation):

```js
import Pusher from 'pusher-js/with-encryption';
window.Pusher = Pusher;
```

<a id="model-broadcasting"></a>
## Difusión de eventos de modelos

> **Advertencia:**
> Antes de leer la siguiente documentación sobre difusión de modelos, te recomendamos familiarizarte con los conceptos generales de los servicios de difusión de modelos de Laravel, así como también cómo crear y escuchar eventos de difusión manualmente.

Es común difundir eventos cuando los [modelos Eloquent](../eloquent/) de tu aplicación se crean, actualizan o eliminan. Por supuesto, esto se puede lograr fácilmente [definiendo manualmente eventos personalizados para los cambios de estado del modelo Eloquent](../eloquent/#events) y marcando esos eventos con la interfaz `ShouldBroadcast`.

Sin embargo, si no utilizas estos eventos para ningún otro propósito en tu aplicación, puede resultar engorroso crear clases de eventos con el único fin de difundirlos. Para remediar esto, Laravel te permite indicar que un modelo Eloquent debería difundir automáticamente sus cambios de estado.

Para comenzar, tu modelo Eloquent debe usar el trait `Illuminate\Database\Eloquent\BroadcastsEvents`. Además, el modelo debe definir un método `broadcastOn`, que devolverá un array de canales en los que deben difundirse los eventos del modelo:

```php
<?php

namespace App\Models;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Database\Eloquent\BroadcastsEvents;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Post extends Model
{
    use BroadcastsEvents, HasFactory;

    /**
     * Get the user that the post belongs to.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the channels that model events should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel|\Illuminate\Database\Eloquent\Model>
     */
    public function broadcastOn(string $event): array
    {
        return [$this, $this->user];
    }
}
```

Una vez que tu modelo incluya este trait y defina sus canales de difusión, comenzará a difundir eventos automáticamente cuando se cree, actualice, elimine, elimine mediante borrado lógico o restaure una instancia del modelo.

Además, habrás notado que el método `broadcastOn` recibe un argumento de cadena `$event`. Este argumento contiene el tipo de evento que ocurrió en el modelo y tendrá un valor de `created`, `updated`, `deleted`, `trashed` o `restored`. Al inspeccionar el valor de esta variable, puedes determinar a qué canales (si corresponde) debe difundir el modelo para un evento en particular:

```php
/**
 * Get the channels that model events should broadcast on.
 *
 * @return array<string, array<int, \Illuminate\Broadcasting\Channel|\Illuminate\Database\Eloquent\Model>>
 */
public function broadcastOn(string $event): array
{
    return match ($event) {
        'deleted' => [],
        default => [$this, $this->user],
    };
}
```

<a id="customizing-model-broadcasting-event-creation"></a>
#### Personalización de la creación de eventos de difusión del modelo

Ocasionalmente, es posible que desees personalizar cómo Laravel crea el evento de difusión del modelo subyacente. Puedes lograr esto definiendo un método `newBroadcastableEvent` en tu modelo Eloquent. Este método debe devolver una instancia `Illuminate\Database\Eloquent\BroadcastableModelEventOccurred`:

```php
use Illuminate\Database\Eloquent\BroadcastableModelEventOccurred;

/**
 * Create a new broadcastable model event for the model.
 */
protected function newBroadcastableEvent(string $event): BroadcastableModelEventOccurred
{
    return (new BroadcastableModelEventOccurred(
        $this, $event
    ))->dontBroadcastToCurrentUser();
}
```

<a id="model-broadcasting-conventions"></a>
### Convenciones de difusión de eventos de modelos

<a id="model-broadcasting-channel-conventions"></a>
#### Convenciones de canal

Como habrás notado, el método `broadcastOn` en el ejemplo de modelo anterior no devolvió instancias de `Channel`. En cambio, los modelos Eloquent fueron devueltos directamente. Si el método `broadcastOn` de tu modelo devuelve una instancia de modelo Eloquent (o está contenida en un array devuelto por el método), Laravel creará automáticamente una instancia de canal privado para el modelo utilizando el nombre de clase del modelo y el identificador de clave primaria como nombre del canal.

Entonces, un modelo `App\Models\User` con un `id` de `1` se convertiría en una instancia de `Illuminate\Broadcasting\PrivateChannel` con un nombre de `App.Models.User.1`. Por supuesto, además de devolver instancias del modelo Eloquent desde el método `broadcastOn` de tu modelo, puedes devolver instancias `Channel` completas para tener control total sobre los nombres de los canales del modelo:

```php
use Illuminate\Broadcasting\PrivateChannel;

/**
 * Get the channels that model events should broadcast on.
 *
 * @return array<int, \Illuminate\Broadcasting\Channel>
 */
public function broadcastOn(string $event): array
{
    return [
        new PrivateChannel('user.'.$this->id)
    ];
}
```

Si planeas devolver explícitamente una instancia de canal desde el método `broadcastOn` de tu modelo, puedes pasar una instancia de modelo Eloquent al constructor del canal. Al hacerlo, Laravel utilizará las convenciones del canal del modelo descritas anteriormente para convertir el modelo Eloquent en una cadena de nombre de canal:

```php
return [new Channel($this->user)];
```

Si necesitas determinar el nombre del canal de un modelo, puedes llamar al método `broadcastChannel` en cualquier instancia de modelo. Por ejemplo, este método devuelve la cadena `App.Models.User.1` para un modelo `App\Models\User` con un `id` de `1`:

```php
$user->broadcastChannel();
```

<a id="model-broadcasting-event-conventions"></a>
#### Convenciones de eventos

Dado que los eventos de difusión del modelo no están asociados con un evento "real" dentro del directorio `App\Events` de tu aplicación, se les asigna un nombre y una carga útil según convenciones. La convención de Laravel es difundir el evento utilizando el nombre de clase del modelo (sin incluir el espacio de nombres) y el nombre del evento del modelo que desencadenó la difusión.

Entonces, por ejemplo, una actualización del modelo `App\Models\Post` difundiría un evento a tu aplicación del lado del cliente como `PostUpdated` con la siguiente carga útil:

```json
{
    "model": {
        "id": 1,
        "title": "My first post"
        ...
    },
    ...
    "socket": "someSocketId"
}
```

La eliminación del modelo `App\Models\User` difundiría un evento denominado `UserDeleted`.

Si lo deseas, puedes definir un nombre de difusión personalizado y una carga útil agregando un método `broadcastAs` y `broadcastWith` a tu modelo. Estos métodos reciben el nombre del evento/operación del modelo que está ocurriendo, lo que te permite personalizar el nombre del evento y la carga útil para cada operación del modelo. Si se devuelve `null` del método `broadcastAs`, Laravel utilizará las convenciones de nombres de eventos de difusión del modelo descritas anteriormente al difundir el evento:

```php
/**
 * The model event's broadcast name.
 */
public function broadcastAs(string $event): string|null
{
    return match ($event) {
        'created' => 'post.created',
        default => null,
    };
}

/**
 * Get the data to broadcast for the model.
 *
 * @return array<string, mixed>
 */
public function broadcastWith(string $event): array
{
    return match ($event) {
        'created' => ['title' => $this->title],
        default => ['model' => $this],
    };
}
```

<a id="listening-for-model-broadcasts"></a>
### Escucha de difusiones de modelos

Una vez que hayas agregado el trait `BroadcastsEvents` a tu modelo y hayas definido el método `broadcastOn` de tu modelo, estarás listo para comenzar a escuchar los eventos del modelo difundidos dentro de tu aplicación del lado del cliente. Antes de comenzar, es posible que desees consultar la documentación completa sobre [escucha de eventos](#listening-for-events).

Primero, usa el método `private` para recuperar una instancia de un canal, luego llama al método `listen` para escuchar un evento específico. Normalmente, el nombre del canal dado al método `private` debe corresponder a las [convenciones de difusión del modelo](#model-broadcasting-conventions) de Laravel.

Una vez que hayas obtenido una instancia de canal, puedes utilizar el método `listen` para escuchar un evento en particular. Dado que los eventos de difusión del modelo no están asociados con un evento "real" dentro del directorio `App\Events` de tu aplicación, el [nombre del evento](#model-broadcasting-event-conventions) debe tener el prefijo `.` para indicar que no pertenece a un espacio de nombres en particular. Cada evento de difusión del modelo tiene una propiedad `model` que contiene todas las propiedades que se pueden difundir del modelo:

```js
Echo.private(`App.Models.User.${this.user.id}`)
    .listen('.UserUpdated', (e) => {
        console.log(e.model);
    });
```

<a id="model-broadcasts-with-react-or-vue"></a>
#### Uso de React, Vue o Svelte

Si estás utilizando React, Vue o Svelte, puedes usar el hook `useEchoModel` incluido de Laravel Echo para escuchar fácilmente las difusiones de modelos:

```js tab=React
import { useEchoModel } from "@laravel/echo-react";

useEchoModel("App.Models.User", userId, ["UserUpdated"], (e) => {
    console.log(e.model);
});
```

```vue tab=Vue
<script setup lang="ts">
import { useEchoModel } from "@laravel/echo-vue";

useEchoModel("App.Models.User", userId, ["UserUpdated"], (e) => {
    console.log(e.model);
});
</script>
```

```svelte tab=Svelte
<script>
import { useEchoModel } from "@laravel/echo-svelte";

useEchoModel("App.Models.User", userId, ["UserUpdated"], (e) => {
    console.log(e.model);
});
</script>
```

También puedes especificar la forma de los datos de carga útil del evento del modelo, lo que proporciona mayor seguridad de tipos y comodidad de edición:

```ts
type User = {
    id: number;
    name: string;
    email: string;
};

useEchoModel<User, "App.Models.User">("App.Models.User", userId, ["UserUpdated"], (e) => {
    console.log(e.model.id);
    console.log(e.model.name);
});
```

<a id="client-events"></a>
## Eventos del cliente

> **Nota:**
> Al utilizar [Pusher Channels](https://pusher.com/channels), debes habilitar la opción "Eventos de cliente" en la sección "Configuración de la aplicación" de tu [panel de aplicación](https://dashboard.pusher.com/) para poder enviar eventos de cliente.

A veces es posible que desees difundir un evento a otros clientes conectados sin realizar ninguna solicitud a tu aplicación Laravel. Esto puede ser particularmente útil para cosas como notificaciones de "está escribiendo", donde deseas alertar a los usuarios de tu aplicación que otro usuario está escribiendo un mensaje en una pantalla determinada.

Para difundir eventos de clientes, puedes utilizar el método `whisper` de Echo:

```js tab=JavaScript
Echo.private(`chat.${roomId}`)
    .whisper('typing', {
        name: this.user.name
    });
```

```js tab=React
import { useEcho } from "@laravel/echo-react";

const { channel } = useEcho(`chat.${roomId}`, ['update'], (e) => {
    console.log('Chat event received:', e);
});

channel().whisper('typing', { name: user.name });
```

```vue tab=Vue
<script setup lang="ts">
import { useEcho } from "@laravel/echo-vue";

const { channel } = useEcho(`chat.${roomId}`, ['update'], (e) => {
    console.log('Chat event received:', e);
});

channel().whisper('typing', { name: user.name });
</script>
```

```svelte tab=Svelte
<script>
import { useEcho } from "@laravel/echo-svelte";

const { channel } = useEcho(`chat.${roomId}`, ['update'], (e) => {
    console.log('Chat event received:', e);
});

channel().whisper('typing', { name: user.name });
</script>
```

Para escuchar eventos de clientes, puedes utilizar el método `listenForWhisper`:

```js tab=JavaScript
Echo.private(`chat.${roomId}`)
    .listenForWhisper('typing', (e) => {
        console.log(e.name);
    });
```

```js tab=React
import { useEcho } from "@laravel/echo-react";

const { channel } = useEcho(`chat.${roomId}`, ['update'], (e) => {
    console.log('Chat event received:', e);
});

channel().listenForWhisper('typing', (e) => {
    console.log(e.name);
});
```

```vue tab=Vue
<script setup lang="ts">
import { useEcho } from "@laravel/echo-vue";

const { channel } = useEcho(`chat.${roomId}`, ['update'], (e) => {
    console.log('Chat event received:', e);
});

channel().listenForWhisper('typing', (e) => {
    console.log(e.name);
});
</script>
```

```svelte tab=Svelte
<script>
import { useEcho } from "@laravel/echo-svelte";

const { channel } = useEcho(`chat.${roomId}`, ['update'], (e) => {
    console.log('Chat event received:', e);
});

channel().listenForWhisper('typing', (e) => {
    console.log(e.name);
});
</script>
```

<a id="notifications"></a>
## Notificaciones

Al vincular la difusión de eventos con [notificaciones](../notifications/), tu aplicación JavaScript puede recibir nuevas notificaciones a medida que ocurren sin necesidad de actualizar la página. Antes de comenzar, asegúrate de leer la documentación sobre el uso del [canal de notificación de difusión](../notifications/#broadcast-notifications).

Una vez que hayas configurado una notificación para usar el canal de difusión, podrás escuchar los eventos de difusión utilizando el método `notification` de Echo. Recuerda, el nombre del canal debe coincidir con el nombre de clase de la entidad que recibe las notificaciones:

```js tab=JavaScript
Echo.private(`App.Models.User.${userId}`)
    .notification((notification) => {
        console.log(notification.type);
    });
```

```js tab=React
import { useEchoModel } from "@laravel/echo-react";

const { channel } = useEchoModel('App.Models.User', userId);

channel().notification((notification) => {
    console.log(notification.type);
});
```

```vue tab=Vue
<script setup lang="ts">
import { useEchoModel } from "@laravel/echo-vue";

const { channel } = useEchoModel('App.Models.User', userId);

channel().notification((notification) => {
    console.log(notification.type);
});
</script>
```

```svelte tab=Svelte
<script>
import { useEchoModel } from "@laravel/echo-svelte";

const { channel } = useEchoModel('App.Models.User', userId);

channel().notification((notification) => {
    console.log(notification.type);
});
</script>
```

En este ejemplo, todas las notificaciones enviadas a instancias `App\Models\User` a través del canal `broadcast` serían recibidas por el callback. Se incluye un callback de autorización de canal para el canal `App.Models.User.{id}` en el archivo `routes/channels.php` de tu aplicación.

<a id="stop-listening-for-notifications"></a>
#### Dejar de escuchar notificaciones

Si deseas dejar de escuchar las notificaciones sin [salir del canal](#leaving-a-channel), puedes utilizar el método `stopListeningForNotification`:

```js
const callback = (notification) => {
    console.log(notification.type);
}

// Start listening...
Echo.private(`App.Models.User.${userId}`)
    .notification(callback);

// Stop listening (callback must be the same)...
Echo.private(`App.Models.User.${userId}`)
    .stopListeningForNotification(callback);
```
