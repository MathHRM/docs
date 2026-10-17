---
title: "Valet Laravel"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Instalación](#installation)
    - [Actualización de Valet](#upgrading-valet)
- [Sitios de servicio](#serving-sites)
    - [El comando "Estacionar"](#the-park-command)
    - [El comando "Enlace"](#the-link-command)
    - [Protección de sitios con TLS](#securing-sites)
    - [Servicio de un sitio predeterminado](#serving-a-default-site)
    - [Versiones de PHP por sitio](#per-site-php-versions)
- [Sitios compartidos](#sharing-sites)
    - [Compartir sitios en su red local](#sharing-sites-on-your-local-network)
- [Variables de entorno específicas del sitio](#site-specific-environment-variables)
- [Servicios de proxy](#proxying-services)
- [Conductores de valet personalizados](#custom-valet-drivers)
    - [Controladores locales](#local-drivers)
- [Otros comandos de valet](#other-valet-commands)
- [Directorios y archivos Valet](#valet-directories-and-files)
    - [Acceso al disco](#disk-access)

<a id="introduction"></a>
## Introducción

> **Nota:**
> ¿Busca una forma aún más sencilla de desarrollar aplicaciones Laravel en macOS o Windows? Echa un vistazo a [Laravel Herd](https://herd.laravel.com). Herd incluye todo lo que necesitas para comenzar con el desarrollo de Laravel, incluidos Valet, PHP y Composer.

[Laravel Valet](https://github.com/laravel/valet) es un entorno de desarrollo para minimalistas de macOS. Laravel Valet configura su Mac para que siempre ejecute [Nginx](https://www.nginx.com/) en segundo plano cuando se inicia su máquina. Luego, utilizando [DnsMasq](https://en.wikipedia.org/wiki/Dnsmasq), Valet envía todas las solicitudes en el dominio `*.test` para que apunten a sitios instalados en su máquina local.

En otras palabras, Valet es un entorno de desarrollo Laravel increíblemente rápido que utiliza aproximadamente 7 MB de RAM. Valet no es un reemplazo completo de [Sail](../sail/) o [Homestead](../homestead/), pero ofrece una excelente alternativa si desea conceptos básicos flexibles, prefiere una velocidad extrema o está trabajando en una máquina con una cantidad limitada de RAM.

El soporte Valet incluye, entre otros, lo siguiente:

<style>
    #valet-support > ul {
        column-count: 3; -moz-column-count: 3; -webkit-column-count: 3;
        line-height: 1.9;
    }
</style>

<div id="valet-support" markdown="1">

- [Laravel](https://laravel.com)
- [Bedrock](https://roots.io/bedrock/)
- [pastelPHP 3](https://cakephp.org)
- [ConcretoCMS](https://www.concretecms.com/)
- [Contao](https://contao.org/en/)
- [Craft](https://craftcms.com)
- [Drupal](https://www.drupal.org/)
- [ExpresiónEngine](https://www.expressionengine.com/)
- [Rompecabezas](https://jigsaw.tighten.co)
- [Joomla](https://www.joomla.org/)
- [Katana](https://github.com/themsaid/katana)
- [Kirby](https://getkirby.com/)
- [Magento](https://magento.com/)
- [octubreCMS](https://octobercms.com/)
- [Escultura](https://sculpin.io/)
- [Slim](https://www.slimframework.com)
- [Statamic](https://statamic.com)
- HTML estático
- [Symfony](https://symfony.com)
- [WordPress](https://wordpress.org)
- [Zend](https://framework.zend.com)

</div>

Sin embargo, puede ampliar Valet con sus propios [controladores personalizados](#custom-valet-drivers).

<a id="installation"></a>
## Instalación

> **Advertencia:**
> Valet requiere macOS y [Homebrew](https://brew.sh/). Antes de la instalación, debe asegurarse de que ningún otro programa como Apache o Nginx esté vinculado al puerto 80 de su máquina local.

Para comenzar, primero debe asegurarse de que Homebrew esté actualizado usando el comando `update`:

```shell
brew update
```

A continuación, debes usar Homebrew para instalar PHP:

```shell
brew install php
```

Después de instalar PHP, estará listo para instalar el [administrador de paquetes Composer](https://getcomposer.org). Además, debe asegurarse de que el directorio `$HOME/.composer/vendor/bin` esté en la "RUTA" de su sistema. Una vez instalado Composer, puede instalar Laravel Valet como un paquete global de Composer:

```shell
composer global require laravel/valet
```

Finalmente, puede ejecutar el comando `install` de Valet. Esto configurará e instalará Valet y DnsMasq. Además, los demonios de los que depende Valet se configurarán para iniciarse cuando se inicie el sistema:

```shell
valet install
```

Una vez que Valet esté instalado, intente hacer ping a cualquier dominio `*.test` en su terminal usando un comando como `ping foobar.test`. Si Valet está instalado correctamente, debería ver este dominio respondiendo en `127.0.0.1`.

Valet iniciará automáticamente los servicios requeridos cada vez que se inicie su máquina.

<a id="php-versions"></a>
#### Versiones de PHP

> **Nota:**
> En lugar de modificar su versión global de PHP, puede indicarle a Valet que use versiones de PHP por sitio a través del comando `isolate` [command](#per-site-php-versions).

Valet le permite cambiar las versiones de PHP usando el comando `valet use php@version`. Valet instalará la versión de PHP especificada a través de Homebrew si aún no está instalada:

```shell
valet use php@8.2

valet use php
```

También puede crear un archivo `.valetrc` en la raíz de su proyecto. El archivo `.valetrc` debe contener la versión PHP que debe usar el sitio:

```shell
php=php@8.2
```

Una vez que se haya creado este archivo, simplemente puede ejecutar el comando `valet use` y el comando determinará la versión PHP preferida del sitio leyendo el archivo.

> **Advertencia:**
> Valet solo ofrece una versión de PHP a la vez, incluso si tiene varias versiones de PHP instaladas.

<a id="database"></a>
#### Base de datos

Si su aplicación necesita una base de datos, consulte [DBngin](https://dbngin.com), que proporciona una herramienta de administración de bases de datos todo en uno gratuita que incluye MySQL, PostgreSQL y Redis. Una vez instalado DBngin, puede conectarse a su base de datos en `127.0.0.1` utilizando el nombre de usuario `root` y una cadena vacía para la contraseña.

<a id="resetting-your-installation"></a>
#### Restableciendo su instalación

Si tiene problemas para que su instalación de Valet se ejecute correctamente, ejecutar el comando `composer global require laravel/valet` seguido de `valet install` restablecerá su instalación y puede resolver una variedad de problemas. En casos excepcionales, puede ser necesario realizar un "reinicio completo" de Valet ejecutando `valet uninstall --force` seguido de `valet install`.

<a id="upgrading-valet"></a>
### Actualización de valet

Puede actualizar su instalación de Valet ejecutando el comando `composer global require laravel/valet` en su terminal. Después de la actualización, es una buena práctica ejecutar el comando `valet install` para que Valet pueda realizar actualizaciones adicionales a sus archivos de configuración si es necesario.

<a id="upgrading-to-valet-4"></a>
#### Actualización a Valet 4

Si está actualizando de Valet 3 a Valet 4, siga los siguientes pasos para actualizar correctamente su instalación de Valet:

<div class="content-list" markdown="1">

- Si ha agregado archivos `.valetphprc` para personalizar la versión PHP de su sitio, cambie el nombre de cada archivo `.valetphprc` a `.valetrc`. Luego, anteponga `php=` al contenido existente del archivo `.valetrc`.
- Actualice los controladores personalizados para que coincidan con el espacio de nombres, la extensión, las sugerencias de tipo y las sugerencias de tipo de retorno del nuevo sistema de controladores. Puede consultar [SampleValetDriver](https://github.com/laravel/valet/blob/d7787c025e60abc24a5195dc7d4c5c6f2d984339/cli/stubs/SampleValetDriver.php) de Valet como ejemplo.
- Si usa PHP 7.1 - 7.4 para servir sus sitios, asegúrese de seguir usando Homebrew para instalar una versión de PHP que sea 8.0 o superior, ya que Valet usará esta versión, incluso si no es su versión principal vinculada, para ejecutar algunos de sus scripts.

</div>

<a id="serving-sites"></a>
## Sitios de servicio

Una vez que Valet esté instalado, estará listo para comenzar a servir sus aplicaciones Laravel. Valet proporciona dos comandos para ayudarle a atender sus aplicaciones: `park` y `link`.

<a id="the-park-command"></a>
### El comando `park`

El comando `park` registra un directorio en su máquina que contiene sus aplicaciones. Una vez que el directorio haya sido "estacionado" con Valet, se podrá acceder a todos los directorios dentro de ese directorio en su navegador web en `http://<directory-name>.test`:

```shell
cd ~/Sites

valet park
```

Eso es todo lo que hay que hacer. Ahora, cualquier aplicación que cree dentro de su directorio "estacionado" se entregará automáticamente utilizando la convención `http://<directory-name>.test`. Entonces, si su directorio estacionado contiene un directorio llamado "laravel", se podrá acceder a la aplicación dentro de ese directorio en `http://laravel.test`. Además, Valet le permite acceder automáticamente al sitio utilizando subdominios comodín (`http://foo.laravel.test`).

<a id="the-link-command"></a>
### El comando `link`

El comando `link` también se puede utilizar para servir sus aplicaciones Laravel. Este comando es útil si desea servir un único sitio en un directorio y no el directorio completo:

```shell
cd ~/Sites/laravel

valet link
```

Una vez que una aplicación se ha vinculado a Valet mediante el comando `link`, puede acceder a la aplicación utilizando su nombre de directorio. Por lo tanto, se puede acceder al sitio vinculado en el ejemplo anterior en `http://laravel.test`. Además, Valet le permite acceder automáticamente al sitio utilizando subdominios comodín (`http://foo.laravel.test`).

Si desea entregar la aplicación en un nombre de host diferente, puede pasar el nombre de host al comando `link`. Por ejemplo, puede ejecutar el siguiente comando para que una aplicación esté disponible en `http://application.test`:

```shell
cd ~/Sites/laravel

valet link application
```

Por supuesto, también puede servir aplicaciones en subdominios usando el comando `link`:

```shell
valet link api.application
```

Puede ejecutar el comando `links` para mostrar una lista de todos sus directorios vinculados:

```shell
valet links
```

El comando `unlink` se puede utilizar para destruir el enlace simbólico de un sitio:

```shell
cd ~/Sites/laravel

valet unlink
```

<a id="securing-sites"></a>
### Proteger sitios con TLS

De forma predeterminada, Valet ofrece sitios a través de HTTP. Sin embargo, si desea servir un sitio a través de TLS cifrado usando HTTP/2, puede usar el comando `secure`. Por ejemplo, si Valet presta servicio a su sitio en el dominio `laravel.test`, debe ejecutar el siguiente comando para protegerlo:

```shell
valet secure laravel
```

Para "desproteger" un sitio y volver a servir su tráfico a través de HTTP simple, utilice el comando `unsecure`. Al igual que el comando `secure`, este comando acepta el nombre de host que desea desproteger:

```shell
valet unsecure laravel
```

<a id="serving-a-default-site"></a>
### Sirviendo un sitio predeterminado

A veces, es posible que desee configurar Valet para que proporcione un sitio "predeterminado" en lugar de un `404` cuando visite un dominio `test` desconocido. Para lograr esto, puede agregar una opción `default` a su archivo de configuración `~/.config/valet/config.json` que contenga la ruta al sitio que debería servir como su sitio predeterminado:

    "default": "/Usuarios/Sally/Sitios/sitio-ejemplo",

<a id="per-site-php-versions"></a>
### Versiones de PHP por sitio

De forma predeterminada, Valet utiliza su instalación PHP global para servir sus sitios. Sin embargo, si necesita admitir múltiples versiones de PHP en varios sitios, puede usar el comando `isolate` para especificar qué versión de PHP debe usar un sitio en particular. El comando `isolate` configura Valet para usar la versión PHP especificada para el sitio ubicado en su directorio de trabajo actual:

```shell
cd ~/Sites/example-site

valet isolate php@8.0
```

Si el nombre de su sitio no coincide con el nombre del directorio que lo contiene, puede especificar el nombre del sitio usando la opción `--site`:

```shell
valet isolate php@8.0 --site="site-name"
```

Para mayor comodidad, puede utilizar los comandos `valet php`, `composer` y `which-php` para enviar llamadas a la CLI o herramienta de PHP adecuada según la versión de PHP configurada del sitio:

```shell
valet php
valet composer
valet which-php
```

Puede ejecutar el comando `isolated` para mostrar una lista de todos sus sitios aislados y sus versiones de PHP:

```shell
valet isolated
```

Para revertir un sitio a la versión PHP instalada globalmente de Valet, puede invocar el comando `unisolate` desde el directorio raíz del sitio:

```shell
valet unisolate
```

<a id="sharing-sites"></a>
## Sitios para compartir

Valet incluye un comando para compartir sus sitios locales con el mundo, lo que proporciona una forma sencilla de probar su sitio en dispositivos móviles o compartirlo con miembros del equipo y clientes.

Desde el primer momento, Valet permite compartir sus sitios a través de ngrok o Expose. Antes de compartir un sitio, debe actualizar su configuración de Valet usando el comando `share-tool`, especificando `ngrok`, `expose` o `cloudflared`:

```shell
valet share-tool ngrok
```

Si elige una herramienta y no la tiene instalada a través de Homebrew (para ngrok y cloudflared) o Composer (para Expose), Valet le pedirá automáticamente que la instale. Por supuesto, ambas herramientas requieren que autentique su cuenta ngrok o Expose antes de poder comenzar a compartir sitios.

Para compartir un sitio, navegue hasta el directorio del sitio en su terminal y ejecute el comando `share` de Valet. Se colocará una URL de acceso público en su portapapeles y estará lista para pegarla directamente en su navegador o compartirla con su equipo:

```shell
cd ~/Sites/laravel

valet share
```

Para dejar de compartir su sitio, puede presionar `Control + C`.

> **Advertencia:**
> Si está utilizando un servidor DNS personalizado (como `1.1.1.1`), es posible que el uso compartido de ngrok no funcione correctamente. Si este es el caso en su máquina, abra la configuración del sistema de su Mac, vaya a la configuración de Red, abra la configuración Avanzada, luego vaya a la pestaña DNS y agregue `127.0.0.1` como su primer servidor DNS.

<a id="sharing-sites-via-ngrok"></a>
#### Compartir sitios a través de Ngrok

Compartir su sitio usando ngrok requiere que [cree una cuenta ngrok](https://dashboard.ngrok.com/signup) y [configure un token de autenticación](https://dashboard.ngrok.com/get-started/your-authtoken). Una vez que tenga un token de autenticación, puede actualizar su configuración de Valet con ese token:

```shell
valet set-ngrok-token YOUR_TOKEN_HERE
```

> **Nota:**
> Puede pasar parámetros ngrok adicionales al comando compartir, como `valet share --region=eu`. Para obtener más información, consulte la [documentación de ngrok](https://ngrok.com/docs).

<a id="sharing-sites-via-expose"></a>
#### Compartir sitios a través de Expose

Compartir su sitio usando Expose requiere que [cree una cuenta Expose](https://expose.dev/register) y [autenticarse con Expose a través de su token de autenticación](https://expose.dev/docs/getting-started/getting-your-token).

Puede consultar la [Documentación de Expose](https://expose.dev/docs) para obtener información sobre los parámetros de línea de comandos adicionales que admite.

<a id="sharing-sites-on-your-local-network"></a>
### Compartir sitios en su red local

Valet restringe el tráfico entrante a la interfaz interna `127.0.0.1` de forma predeterminada para que su máquina de desarrollo no esté expuesta a riesgos de seguridad de Internet.

Si desea permitir que otros dispositivos en su red local accedan a los sitios Valet en su máquina a través de la dirección IP de su máquina (por ejemplo: `192.168.1.10/application.test`), deberá editar manualmente el archivo de configuración Nginx apropiado para ese sitio para eliminar la restricción en la directiva `listen`. Debe eliminar el prefijo `127.0.0.1:` en la directiva `listen` para los puertos 80 y 443.

Si no ha ejecutado `valet secure` en el proyecto, puede abrir el acceso a la red para todos los sitios que no sean HTTPS editando el archivo `/usr/local/etc/nginx/valet/valet.conf`. Sin embargo, si está entregando el sitio del proyecto a través de HTTPS (ha ejecutado `valet secure` para el sitio), entonces debe editar el archivo `~/.config/valet/Nginx/app-name.test`.

Una vez que haya actualizado su configuración de Nginx, ejecute el comando `valet restart` para aplicar los cambios de configuración.

<a id="site-specific-environment-variables"></a>
## Variables de entorno específicas del sitio

Algunas aplicaciones que utilizan otros marcos pueden depender de las variables de entorno del servidor, pero no proporcionan una manera de configurar esas variables dentro de su proyecto. Valet le permite configurar variables de entorno específicas del sitio agregando un archivo `.valet-env.php` dentro de la raíz de su proyecto. Este archivo debe devolver una matriz de pares de variables de sitio/entorno que se agregarán a la matriz global `$_SERVER` para cada sitio especificado en la matriz:

```php
<?php

return [
    // Set $_SERVER['key'] to "value" for the laravel.test site...
    'laravel' => [
        'key' => 'value',
    ],

    // Set $_SERVER['key'] to "value" for all sites...
    '*' => [
        'key' => 'value',
    ],
];
```

<a id="proxying-services"></a>
## Servicios de proxy

A veces es posible que desees enviar un dominio Valet a otro servicio en tu máquina local. Por ejemplo, es posible que ocasionalmente necesites ejecutar Valet y al mismo tiempo ejecutar un sitio independiente en Docker; sin embargo, Valet y Docker no pueden conectarse al puerto 80 al mismo tiempo.

Para solucionar esto, puede utilizar el comando `proxy` para generar un proxy. Por ejemplo, puede enviar todo el tráfico desde `http://elasticsearch.test` a `http://127.0.0.1:9200`:

```shell
# Proxy over HTTP...
valet proxy elasticsearch http://127.0.0.1:9200

# Proxy over TLS + HTTP/2...
valet proxy elasticsearch http://127.0.0.1:9200 --secure
```

Puede eliminar un proxy usando el comando `unproxy`:

```shell
valet unproxy elasticsearch
```

Puede utilizar el comando `proxies` para enumerar todas las configuraciones del sitio que tienen proxy:

```shell
valet proxies
```

<a id="custom-valet-drivers"></a>
## Conductores de valet personalizados

Puede escribir su propio "controlador" de Valet para servir aplicaciones PHP que se ejecutan en un marco o CMS que no es compatible de forma nativa con Valet. Cuando instala Valet, se crea un directorio `~/.config/valet/Drivers` que contiene un archivo `SampleValetDriver.php`. Este archivo contiene una implementación de controlador de muestra para demostrar cómo escribir un controlador personalizado. Escribir un controlador solo requiere que implemente tres métodos: `serves`, `isStaticFile` y `frontControllerPath`.

Los tres métodos reciben los valores `$sitePath`, `$siteName` y `$uri` como argumentos. `$sitePath` es la ruta completa al sitio que se ofrece en su máquina, como `/Users/Lisa/Sites/my-project`. `$siteName` es la parte "host"/"nombre de sitio" del dominio (`my-project`). `$uri` es el URI de solicitud entrante (`/foo/bar`).

Una vez que haya completado su controlador Valet personalizado, colóquelo en el directorio `~/.config/valet/Drivers` usando la convención de nomenclatura `FrameworkValetDriver.php`. Por ejemplo, si está escribiendo un controlador valet personalizado para WordPress, su nombre de archivo debe ser `WordPressValetDriver.php`.

Echemos un vistazo a una implementación de muestra de cada método que debe implementar su controlador Valet personalizado.

<a id="the-serves-method"></a>
#### El método `serves`

El método `serves` debería devolver `true` si su controlador debe manejar la solicitud entrante. De lo contrario, el método debería devolver `false`. Entonces, dentro de este método, debe intentar determinar si el `$sitePath` dado contiene un proyecto del tipo que está intentando entregar.

Por ejemplo, imaginemos que estamos escribiendo un `WordPressValetDriver`. Nuestro método `serves` podría verse así:

```php
/**
 * Determine if the driver serves the request.
 */
public function serves(string $sitePath, string $siteName, string $uri): bool
{
    return is_dir($sitePath.'/wp-admin');
}
```

<a id="the-isstaticfile-method"></a>
#### El método `isStaticFile`

El `isStaticFile` debe determinar si la solicitud entrante es para un archivo "estático", como una imagen o una hoja de estilo. Si el archivo es estático, el método debe devolver la ruta completa al archivo estático en el disco. Si la solicitud entrante no es para un archivo estático, el método debería devolver `false`:

```php
/**
 * Determine if the incoming request is for a static file.
 *
 * @return string|false
 */
public function isStaticFile(string $sitePath, string $siteName, string $uri)
{
    if (file_exists($staticFilePath = $sitePath.'/public/'.$uri)) {
        return $staticFilePath;
    }

    return false;
}
```

> **Advertencia:**
> Solo se llamará al método `isStaticFile` si el método `serves` devuelve `true` para la solicitud entrante y el URI de la solicitud no es `/`.

<a id="the-frontcontrollerpath-method"></a>
#### El método `frontControllerPath`

El método `frontControllerPath` debería devolver la ruta completa al "controlador frontal" de su aplicación, que normalmente es un archivo "index.php" o equivalente:

```php
/**
 * Get the fully resolved path to the application's front controller.
 */
public function frontControllerPath(string $sitePath, string $siteName, string $uri): string
{
    return $sitePath.'/public/index.php';
}
```

<a id="local-drivers"></a>
### Conductores locales

Si desea definir un controlador Valet personalizado para una sola aplicación, cree un archivo `LocalValetDriver.php` en el directorio raíz de la aplicación. Su controlador personalizado puede ampliar la clase base `ValetDriver` o ampliar un controlador específico de aplicación existente, como `LaravelValetDriver`:

```php
use Valet\Drivers\LaravelValetDriver;

class LocalValetDriver extends LaravelValetDriver
{
    /**
     * Determine if the driver serves the request.
     */
    public function serves(string $sitePath, string $siteName, string $uri): bool
    {
        return true;
    }

    /**
     * Get the fully resolved path to the application's front controller.
     */
    public function frontControllerPath(string $sitePath, string $siteName, string $uri): string
    {
        return $sitePath.'/public_html/index.php';
    }
}
```

<a id="other-valet-commands"></a>
## Otros comandos de valet

<div class="overflow-auto">

| Comando | Descripción |
| --- | --- |
| `valet list` | Muestra una lista de todos los comandos de Valet. |
| `valet diagnose` | Diagnóstico de salida para ayudar en la depuración de Valet. |
| `valet directory-listing` | Determinar el comportamiento del listado de directorios. El valor predeterminado es "desactivado", lo que genera una página 404 para directorios. |
| `valet forget` | Ejecute este comando desde un directorio "estacionado" para eliminarlo de la lista de directorios estacionados. |
| `valet log` | Vea una lista de registros escritos por los servicios de Valet. |
| `valet paths` | Vea todos sus caminos "estacionados". |
| `valet restart` | Reinicie los demonios Valet. |
| `valet start` | Inicie los demonios Valet. |
| `valet stop` | Detén a los demonios de Valet. |
| `valet trust` | Agregue archivos sudoers para Brew y Valet para permitir que los comandos de Valet se ejecuten sin solicitar su contraseña. |
| `valet uninstall` | Desinstalar Valet: muestra instrucciones para la desinstalación manual. Pase la opción `--force` para eliminar agresivamente todos los recursos de Valet. |

</div>

<a id="valet-directories-and-files"></a>
## Directorios y archivos de Valet

Puede que la siguiente información sobre directorios y archivos le resulte útil a la hora de solucionar problemas con su entorno Valet:

#### `~/.config/valet`

Contiene toda la configuración de Valet. Es posible que desee mantener una copia de seguridad de este directorio.

#### `~/.config/valet/dnsmasq.d/`

Este directorio contiene la configuración de DNSMasq.

#### `~/.config/valet/Drivers/`

Este directorio contiene los controladores de Valet. Los controladores determinan cómo se sirve un marco/CMS en particular.

#### `~/.config/valet/Nginx/`

Este directorio contiene todas las configuraciones del sitio Nginx de Valet. Estos archivos se reconstruyen cuando se ejecutan los comandos `install` y `secure`.

#### `~/.config/valet/Sites/`

Este directorio contiene todos los enlaces simbólicos para sus [proyectos vinculados](#the-link-command).

#### `~/.config/valet/config.json`

Este archivo es el archivo de configuración maestro de Valet.

#### `~/.config/valet/valet.sock`

Este archivo es el socket PHP-FPM utilizado por la instalación de Nginx de Valet. Esto sólo existirá si PHP se ejecuta correctamente.

#### `~/.config/valet/Log/fpm-php.www.log`

Este archivo es el registro de usuario para errores de PHP.

#### `~/.config/valet/Log/nginx-error.log`

Este archivo es el registro de usuario para errores de Nginx.

#### `/usr/local/var/log/php-fpm.log`

Este archivo es el registro del sistema para errores de PHP-FPM.

#### `/usr/local/var/log/nginx`

Este directorio contiene los registros de errores y acceso de Nginx.

#### `/usr/local/etc/php/X.X/conf.d`

Este directorio contiene los archivos `*.ini` para varias configuraciones de PHP.

#### `/usr/local/etc/php/X.X/php-fpm.d/valet-fpm.conf`

Este archivo es el archivo de configuración del grupo PHP-FPM.

#### `~/.composer/vendor/laravel/valet/cli/stubs/secure.valet.conf`

Este archivo es la configuración predeterminada de Nginx utilizada para crear certificados SSL para sus sitios.

<a id="disk-access"></a>
### Acceso al disco

Desde macOS 10.14, [el acceso a algunos archivos y directorios está restringido de forma predeterminada](https://manuals.info.apple.com/MANUALS/1000/MA1902/en_US/apple-platform-security-guide.pdf). Estas restricciones incluyen los directorios Escritorio, Documentos y Descargas. Además, el acceso al volumen de red y al volumen extraíble está restringido. Por lo tanto, Valet recomienda que las carpetas de su sitio estén ubicadas fuera de estas ubicaciones protegidas.

Sin embargo, si desea servir sitios desde una de esas ubicaciones, deberá otorgar a Nginx "Acceso total al disco". De lo contrario, puede encontrar errores en el servidor u otros comportamientos impredecibles de Nginx, especialmente cuando ofrece activos estáticos. Normalmente, macOS le solicitará automáticamente que otorgue a Nginx acceso completo a estas ubicaciones. O puede hacerlo manualmente a través de `System Preferences` > `Security & Privacy` > `Privacy` y seleccionando `Full Disk Access`. A continuación, habilite cualquier entrada `nginx` en el panel de la ventana principal.
