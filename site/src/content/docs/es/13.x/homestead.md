---
title: "Granja Laravel"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Instalación y configuración](#installation-and-setup)
    - [Primeros pasos](#first-steps)
    - [Configurando Homestead](#configuring-homestead)
    - [Configuración de sitios Nginx](#configuring-nginx-sites)
    - [Configuración de servicios](#configuring-services)
    - [Lanzamiento de Vagrant Box](#launching-the-vagrant-box)
    - [Instalación por proyecto](#per-project-installation)
    - [Instalación de funciones opcionales](#installing-optional-features)
    - [Alias](#aliases)
- [Actualizando Homestead](#updating-homestead)
- [Uso diario](#daily-usage)
    - [Conectando a través de SSH](#connecting-via-ssh)
    - [Agregar sitios adicionales](#adding-additional-sites)
    - [Variables de entorno](#environment-variables)
    - [Puertos](#ports)
    - [Versiones de PHP](#php-versions)
    - [Conexión a bases de datos](#connecting-to-databases)
    - [Copias de seguridad de bases de datos](#database-backups)
    - [Configuración de programaciones cron](#configuring-cron-schedules)
    - [Configurando Mailpit](#configuring-mailpit)
    - [Configurando Minio](#configuring-minio)
    - [Laravel Anochecer](#laravel-dusk)
    - [Compartir su entorno](#sharing-your-environment)
- [Depuración y creación de perfiles](#debugging-and-profiling)
    - [Depuración de solicitudes web con Xdebug](#debugging-web-requests)
    - [Depuración de aplicaciones CLI](#debugging-cli-applications)
    - [Aplicaciones de creación de perfiles con Blackfire](#profiling-applications-with-blackfire)
- [Interfaces de red](#network-interfaces)
- [Ampliación de Homestead](#extending-homestead)
- [Configuración específica del proveedor](#provider-specific-settings)
    - [VirtualBox](#provider-specific-virtualbox)

<a id="introduction"></a>
## Introducción

> **Advertencia:**
> Laravel Homestead es un paquete heredado que ya no se mantiene activamente. [Laravel Sail](../sail/) puede usarse como una alternativa moderna.

Laravel se esfuerza por hacer que toda la experiencia de desarrollo PHP sea placentera, incluido su entorno de desarrollo local. [Laravel Homestead](https://github.com/laravel/homestead) es una caja Vagrant oficial preempaquetada que le proporciona un maravilloso entorno de desarrollo sin necesidad de instalar PHP, un servidor web o cualquier otro software de servidor en su máquina local.

[Vagrant](https://www.vagrantup.com) proporciona una forma sencilla y elegante de gestionar y aprovisionar máquinas virtuales. Las cajas vagabundas son completamente desechables. ¡Si algo sale mal, puedes destruir y recrear la caja en minutos!

Homestead se ejecuta en cualquier sistema Windows, macOS o Linux e incluye Nginx, PHP, MySQL, PostgreSQL, Redis, Memcached, Node y todo el demás software que necesita para desarrollar increíbles aplicaciones Laravel.

> **Advertencia:**
> Si está utilizando Windows, es posible que necesite habilitar la virtualización de hardware (VT-x). Por lo general, se puede habilitar a través de su BIOS. Si está utilizando Hyper-V en un sistema UEFI, es posible que también necesite desactivar Hyper-V para poder acceder a VT-x.

<a id="included-software"></a>
### Software incluido

<style>
    #software-list > ul {
        column-count: 2; -moz-column-count: 2; -webkit-column-count: 2;
        column-gap: 5em; -moz-column-gap: 5em; -webkit-column-gap: 5em;
        line-height: 1.9;
    }
</style>

<div id="software-list" markdown="1">

-Ubuntu 22.04
-Git
-PHP 8.3
-PHP 8.2
-PHP 8.1
-PHP 8.0
-PHP 7.4
-PHP 7.3
-PHP 7.2
-PHP 7.1
-PHP 7.0
-PHP 5.6
-Nginx
- MySQL 8.0
- mmm
- Sqlite3
-PostgreSQL 15
- Compositor
- acoplador
- Nodo (con hilo, glorieta, gruñido y trago)
-Redis
- Memcached
- tallo de habichuelas
- Buzón de correo
- avahi
- ngrok
- Xdebug
- XHProf / Tideways / XHGui
- wp-cli

</div>

<a id="optional-software"></a>
### Software opcional

<style>
    #software-list > ul {
        column-count: 2; -moz-column-count: 2; -webkit-column-count: 2;
        column-gap: 5em; -moz-column-gap: 5em; -webkit-column-gap: 5em;
        line-height: 1.9;
    }
</style>

<div id="software-list" markdown="1">

-Apache
- Fuego negro
- Casandra
- Cronógrafo
- SofáDB
- Marco de cristal y suerte
- Búsqueda elástica
- EventStoreDB
- Ruta migratoria
- Gearman
- Ir
-Grafana
- InfluenciaDB
- Logstash
-MariaDB
- Meilibúsqueda
-MinIO
-MongoDB
-Neo4j
- Oh Dios mío
- Abierto Resty
- PM2
- Pitón
-R
- ConejoMQ
- Óxido
- RVM (Administrador de versiones de Ruby)
- Sol
- Escala de tiempoDB
- Comerciante <small> (extensión PHP) </small>
- Utilidades Webdriver y Laravel Dusk

</div>

<a id="installation-and-setup"></a>
## Instalación y configuración

<a id="first-steps"></a>
### Primeros pasos

Antes de iniciar su entorno Homestead, debe instalar [Vagrant](https://developer.hashicorp.com/vagrant/downloads) así como uno de los siguientes proveedores compatibles:

- [VirtualBox 6.1.x](https://www.virtualbox.org/wiki/Download_Old_Builds_6_1)
- [Paralelos](https://www.parallels.com/products/desktop/)

Todos estos paquetes de software proporcionan instaladores visuales fáciles de usar para todos los sistemas operativos populares.

Para utilizar el proveedor de Parallels, deberá instalar el [complemento Parallels Vagrant](https://github.com/Parallels/vagrant-parallels). Es gratis.

<a id="installing-homestead"></a>
#### Instalación de Homestead

Puede instalar Homestead clonando el repositorio de Homestead en su máquina host. Considere clonar el repositorio en una carpeta `Homestead` dentro de su directorio "inicio", ya que la máquina virtual de Homestead servirá como host para todas sus aplicaciones Laravel. A lo largo de esta documentación, nos referiremos a este directorio como su "directorio de Homestead":

```shell
git clone https://github.com/laravel/homestead.git ~/Homestead
```

Después de clonar el repositorio de Laravel Homestead, debes verificar la rama `release`. Esta rama siempre contiene la última versión estable de Homestead:

```shell
cd ~/Homestead

git checkout release
```

A continuación, ejecute el comando `bash init.sh` desde el directorio de Homestead para crear el archivo de configuración `Homestead.yaml`. El archivo `Homestead.yaml` es donde configurará todos los ajustes para su instalación de Homestead. Este archivo se colocará en el directorio de Homestead:

```shell
# macOS / Linux...
bash init.sh

# Windows...
init.bat
```

<a id="configuring-homestead"></a>
### Configuración de Homestead

<a id="setting-your-provider"></a>
#### Configuración de su proveedor

La clave `provider` en su archivo `Homestead.yaml` indica qué proveedor de Vagrant debe usarse: `virtualbox` o `parallels`:

    proveedor: virtualbox

> **Advertencia:**
> Si está utilizando Apple Silicon, se requiere el proveedor de Parallels.

<a id="configuring-shared-folders"></a>
#### Configurar carpetas compartidas

La propiedad `folders` del archivo `Homestead.yaml` enumera todas las carpetas que desea compartir con su entorno Homestead. A medida que se cambien los archivos dentro de estas carpetas, se mantendrán sincronizados entre su máquina local y el entorno virtual de Homestead. Podrás configurar tantas carpetas compartidas como sea necesario:

```yaml
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
```

> **Advertencia:**
> Los usuarios de Windows no deben usar la sintaxis de ruta `~/` y en su lugar deben usar la ruta completa a su proyecto, como `C:\Users\user\Code\project1`.

Siempre debe asignar aplicaciones individuales a su propia asignación de carpetas en lugar de asignar un único directorio grande que contenga todas sus aplicaciones. Cuando asigna una carpeta, la máquina virtual debe realizar un seguimiento de todas las E/S del disco para *cada* archivo de la carpeta. Es posible que experimente un rendimiento reducido si tiene una gran cantidad de archivos en una carpeta:

```yaml
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
    - map: ~/code/project2
      to: /home/vagrant/project2
```

> **Advertencia:**
> Nunca debes montar `.` (el directorio actual) cuando uses Homestead. Esto hace que Vagrant no asigne la carpeta actual a `/vagrant` y romperá las funciones opcionales y provocará resultados inesperados durante el aprovisionamiento.

Para habilitar [NFS](https://developer.hashicorp.com/vagrant/docs/synced-folders/nfs), puede agregar una opción `type` a su asignación de carpetas:

```yaml
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
      type: "nfs"
```

> **Advertencia:**
> Cuando utilice NFS en Windows, debería considerar instalar el complemento [vagrant-winnfsd](https://github.com/winnfsd/vagrant-winnfsd). Este complemento mantendrá los permisos correctos de usuario/grupo para archivos y directorios dentro de la máquina virtual de Homestead.

También puede pasar cualquier opción admitida por [Carpetas sincronizadas](https://developer.hashicorp.com/vagrant/docs/synced-folders/basic_usage) de Vagrant enumerándolas bajo la clave `options`:

```yaml
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
      type: "rsync"
      options:
          rsync__args: ["--verbose", "--archive", "--delete", "-zz"]
          rsync__exclude: ["node_modules"]
```

<a id="configuring-nginx-sites"></a>
### Configuración de sitios Nginx

¿No estás familiarizado con Nginx? Ningún problema. La propiedad `sites` de su archivo `Homestead.yaml` le permite asignar fácilmente un "dominio" a una carpeta en su entorno Homestead. Se incluye una configuración del sitio de muestra en el archivo `Homestead.yaml`. Nuevamente, puede agregar tantos sitios a su entorno Homestead como sea necesario. Homestead puede servir como un entorno virtualizado conveniente para cada aplicación de Laravel en la que esté trabajando:

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
```

Si cambia la propiedad `sites` después de aprovisionar la máquina virtual Homestead, debe ejecutar el comando `vagrant reload --provision` en su terminal para actualizar la configuración de Nginx en la máquina virtual.

> **Advertencia:**
> Los scripts de Homestead están diseñados para ser lo más idempotentes posible. Sin embargo, si tiene problemas durante el aprovisionamiento, debe destruir y reconstruir la máquina ejecutando el comando `vagrant destroy && vagrant up`.

<a id="hostname-resolution"></a>
#### Resolución de nombre de host

Homestead publica nombres de host utilizando `mDNS` para la resolución automática de host. Si configura `hostname: homestead` en su archivo `Homestead.yaml`, el host estará disponible en `homestead.local`. Las distribuciones de escritorio de macOS, iOS y Linux incluyen compatibilidad con `mDNS` de forma predeterminada. Si está utilizando Windows, debe instalar [Bonjour Print Services para Windows](https://support.apple.com/kb/DL999?viewlocale=en_US&locale=en_US).

El uso de nombres de host automáticos funciona mejor para [instalaciones por proyecto](#per-project-installation) de Homestead. Si aloja varios sitios en una sola instancia de Homestead, puede agregar los "dominios" de sus sitios web al archivo `hosts` de su máquina. El archivo `hosts` redirigirá las solicitudes de sus sitios de Homestead a su máquina virtual de Homestead. En macOS y Linux, este archivo se encuentra en `/etc/hosts`. En Windows, se encuentra en `C:\Windows\System32\drivers\etc\hosts`. Las líneas que agregue a este archivo se verán como las siguientes:

```text
192.168.56.56  homestead.test
```

Asegúrese de que la dirección IP que aparece sea la configurada en su archivo `Homestead.yaml`. Una vez que haya agregado el dominio a su archivo `hosts` y haya iniciado Vagrant Box, podrá acceder al sitio a través de su navegador web:

```shell
http://homestead.test
```

<a id="configuring-services"></a>
### Configuración de servicios

Homestead inicia varios servicios de forma predeterminada; sin embargo, puede personalizar qué servicios se habilitan o deshabilitan durante el aprovisionamiento. Por ejemplo, puede habilitar PostgreSQL y deshabilitar MySQL modificando la opción `services` dentro de su archivo `Homestead.yaml`:

```yaml
services:
    - enabled:
        - "postgresql"
    - disabled:
        - "mysql"
```

Los servicios especificados se iniciarán o detendrán según su orden en las directivas `enabled` y `disabled`.

<a id="launching-the-vagrant-box"></a>
### Lanzamiento de Vagrant Box

Una vez que haya editado el `Homestead.yaml` a su gusto, ejecute el comando `vagrant up` desde su directorio de Homestead. Vagrant iniciará la máquina virtual y configurará automáticamente sus carpetas compartidas y sitios Nginx.

Para destruir la máquina, puede utilizar el comando `vagrant destroy`.

<a id="per-project-installation"></a>
### Instalación por proyecto

En lugar de instalar Homestead globalmente y compartir la misma máquina virtual de Homestead en todos sus proyectos, puede configurar una instancia de Homestead para cada proyecto que administre. Instalar Homestead por proyecto puede ser beneficioso si desea enviar un `Vagrantfile` con su proyecto, permitiendo que otras personas que trabajan en el proyecto accedan al `vagrant up` inmediatamente después de clonar el repositorio del proyecto.

Puedes instalar Homestead en tu proyecto usando el administrador de paquetes de Composer:

```shell
composer require laravel/homestead --dev
```

Una vez que se haya instalado Homestead, invoque el comando `make` de Homestead para generar el archivo `Vagrantfile` y `Homestead.yaml` para su proyecto. Estos archivos se colocarán en la raíz de su proyecto. El comando `make` configurará automáticamente las directivas `sites` y `folders` en el archivo `Homestead.yaml`:

```shell
# macOS / Linux...
php vendor/bin/homestead make

# Windows...
vendor\\bin\\homestead make
```

A continuación, ejecute el comando `vagrant up` en su terminal y acceda a su proyecto en `http://homestead.test` en su navegador. Recuerde, aún necesitará agregar una entrada de archivo `/etc/hosts` para `homestead.test` o el dominio de su elección si no está utilizando la [resolución automática de nombre de host](#hostname-resolution).

<a id="installing-optional-features"></a>
### Instalación de funciones opcionales

El software opcional se instala usando la opción `features` dentro de su archivo `Homestead.yaml`. La mayoría de las funciones se pueden habilitar o deshabilitar con un valor booleano, mientras que algunas funciones permiten múltiples opciones de configuración:

```yaml
features:
    - blackfire:
        server_id: "server_id"
        server_token: "server_value"
        client_id: "client_id"
        client_token: "client_value"
    - cassandra: true
    - chronograf: true
    - couchdb: true
    - crystal: true
    - dragonflydb: true
    - elasticsearch:
        version: 7.9.0
    - eventstore: true
        version: 21.2.0
    - flyway: true
    - gearman: true
    - golang: true
    - grafana: true
    - influxdb: true
    - logstash: true
    - mariadb: true
    - meilisearch: true
    - minio: true
    - mongodb: true
    - neo4j: true
    - ohmyzsh: true
    - openresty: true
    - pm2: true
    - python: true
    - r-base: true
    - rabbitmq: true
    - rustc: true
    - rvm: true
    - solr: true
    - timescaledb: true
    - trader: true
    - webdriver: true
```

<a id="elasticsearch"></a>
#### Búsqueda elástica

Puede especificar una versión compatible de Elasticsearch, que debe ser un número de versión exacto (major.minor.patch). La instalación predeterminada creará un clúster llamado 'homestead'. Nunca debes darle a Elasticsearch más de la mitad de la memoria del sistema operativo, así que asegúrate de que tu máquina virtual Homestead tenga al menos el doble de la asignación de Elasticsearch.

> **Nota:**
> Consulte la [documentación de Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current) para aprender cómo personalizar su configuración.

<a id="mariadb"></a>
#### MaríaDB

Habilitar MariaDB eliminará MySQL e instalará MariaDB. Su aplicación debe usar el controlador de base de datos `mariadb` en lugar de `mysql`: ambos se conectarán, pero solo el controlador `mariadb` emite SQL específico de MariaDB, como consultas de distancia vectorial.

<a id="mongodb"></a>
#### MongoDB

La instalación predeterminada de MongoDB establecerá el nombre de usuario de la base de datos en `homestead` y la contraseña correspondiente en `secret`.

<a id="neo4j"></a>
#### Neo4j

La instalación predeterminada de Neo4j establecerá el nombre de usuario de la base de datos en `homestead` y la contraseña correspondiente en `secret`. Para acceder al navegador Neo4j, visite `http://homestead.test:7474` a través de su navegador web. Los puertos `7687` (Bolt), `7474` (HTTP) y `7473` (HTTPS) están listos para atender solicitudes del cliente Neo4j.

<a id="aliases"></a>
### Alias

Puede agregar alias de Bash a su máquina virtual de Homestead modificando el archivo `aliases` dentro de su directorio de Homestead:

```shell
alias c='clear'
alias ..='cd ..'
```

Después de haber actualizado el archivo `aliases`, debe volver a aprovisionar la máquina virtual de Homestead utilizando el comando `vagrant reload --provision`. Esto asegurará que sus nuevos alias estén disponibles en la máquina.

<a id="updating-homestead"></a>
## Actualización de Homestead

Antes de comenzar a actualizar Homestead, debe asegurarse de haber eliminado su máquina virtual actual ejecutando el siguiente comando en su directorio de Homestead:

```shell
vagrant destroy
```

A continuación, debe actualizar el código fuente de Homestead. Si clonó el repositorio, puede ejecutar los siguientes comandos en la ubicación donde clonó originalmente el repositorio:

```shell
git fetch

git pull origin release
```

Estos comandos extraen el código de Homestead más reciente del repositorio de GitHub, obtienen las etiquetas más recientes y luego revisan la última versión etiquetada. Puede encontrar la última versión estable en la [página de lanzamientos de GitHub] de Homestead](https://github.com/laravel/homestead/releases).

Si instaló Homestead a través del archivo `composer.json` de su proyecto, debe asegurarse de que su archivo `composer.json` contenga `"laravel/homestead": "^12"` y actualizar sus dependencias:

```shell
composer update
```

A continuación, debe actualizar el cuadro Vagrant usando el comando `vagrant box update`:

```shell
vagrant box update
```

Después de actualizar el cuadro Vagrant, debe ejecutar el comando `bash init.sh` desde el directorio de Homestead para actualizar los archivos de configuración adicionales de Homestead. Se le preguntará si desea sobrescribir sus archivos `Homestead.yaml`, `after.sh` y `aliases` existentes:

```shell
# macOS / Linux...
bash init.sh

# Windows...
init.bat
```

Finalmente, necesitará regenerar su máquina virtual Homestead para utilizar la última instalación de Vagrant:

```shell
vagrant up
```

<a id="daily-usage"></a>
## Uso diario

<a id="connecting-via-ssh"></a>
### Conexión a través de SSH

Puede acceder mediante SSH a su máquina virtual ejecutando el comando de terminal `vagrant ssh` desde su directorio de Homestead.

<a id="adding-additional-sites"></a>
### Agregar sitios adicionales

Una vez que su entorno Homestead esté aprovisionado y en ejecución, es posible que desee agregar sitios Nginx adicionales para sus otros proyectos de Laravel. Puede ejecutar tantos proyectos de Laravel como desee en un único entorno de Homestead. Para agregar un sitio adicional, agregue el sitio a su archivo `Homestead.yaml`.

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
    - map: another.test
      to: /home/vagrant/project2/public
```

> **Advertencia:**
> Debe asegurarse de haber configurado un [mapeo de carpetas](#configuring-shared-folders) para el directorio del proyecto antes de agregar el sitio.

Si Vagrant no administra automáticamente su archivo "hosts", es posible que también deba agregar el nuevo sitio a ese archivo. En macOS y Linux, este archivo se encuentra en `/etc/hosts`. En Windows, se encuentra en `C:\Windows\System32\drivers\etc\hosts`:

```text
192.168.56.56  homestead.test
192.168.56.56  another.test
```

Una vez que se haya agregado el sitio, ejecute el comando de terminal `vagrant reload --provision` desde su directorio de Homestead.

<a id="site-types"></a>
#### Tipos de sitios

Homestead admite varios "tipos" de sitios que le permiten ejecutar fácilmente proyectos que no están basados ​​en Laravel. Por ejemplo, podemos agregar fácilmente una aplicación Statamic a Homestead usando el tipo de sitio `statamic`:

```yaml
sites:
    - map: statamic.test
      to: /home/vagrant/my-symfony-project/web
      type: "statamic"
```

Los tipos de sitios disponibles son: `apache`, `apache-proxy`, `apigility`, `expressive`, `laravel` (el predeterminado), `proxy` (para nginx), `silverstripe`, `statamic`, `symfony2`, `symfony4` y `zf`.

<a id="site-parameters"></a>
#### Parámetros del sitio

Puede agregar valores Nginx `fastcgi_param` adicionales a su sitio a través de la directiva del sitio `params`:

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
      params:
          - key: FOO
            value: BAR
```

<a id="environment-variables"></a>
### Variables de entorno

Puede definir variables de entorno globales agregándolas a su archivo `Homestead.yaml`:

```yaml
variables:
    - key: APP_ENV
      value: local
    - key: FOO
      value: bar
```

Después de actualizar el archivo `Homestead.yaml`, asegúrese de volver a aprovisionar la máquina ejecutando el comando `vagrant reload --provision`. Esto actualizará la configuración de PHP-FPM para todas las versiones de PHP instaladas y también actualizará el entorno para el usuario `vagrant`.

<a id="ports"></a>
### Puertos

De forma predeterminada, los siguientes puertos se reenvían a su entorno Homestead:

<div class="content-list" markdown="1">

- **HTTP:** 8000 → Reenvía a 80
- **HTTPS:** 44300 → Reenvía al 443

</div>

<a id="forwarding-additional-ports"></a>
#### Reenvío de puertos adicionales

Si lo desea, puede reenviar puertos adicionales al Vagrant Box definiendo una entrada de configuración `ports` dentro de su archivo `Homestead.yaml`. Después de actualizar el archivo `Homestead.yaml`, asegúrese de reaprovisionar la máquina ejecutando el comando `vagrant reload --provision`:

```yaml
ports:
    - send: 50000
      to: 5000
    - send: 7777
      to: 777
      protocol: udp
```

A continuación se muestra una lista de puertos de servicio Homestead adicionales que quizás desee asignar desde su máquina host a su Vagrant Box:

<div class="content-list" markdown="1">

- **SSH:** 2222 → A 22
- **interfaz de usuario ngrok:** 4040 → A 4040
- **MySQL:** 33060 → Hasta 3306
- **PostgreSQL:** 54320 → A 5432
- **MongoDB:** 27017 → Hasta 27017
- **Buzón de correo:** 8025 → Al 8025
- **Minio:** 9600 → Hasta 9600

</div>

<a id="php-versions"></a>
### Versiones de PHP

Homestead admite la ejecución de múltiples versiones de PHP en la misma máquina virtual. Puede especificar qué versión de PHP usar para un sitio determinado dentro de su archivo `Homestead.yaml`. Las versiones de PHP disponibles son: "5.6", "7.0", "7.1", "7.2", "7.3", "7.4", "8.0", "8.1", "8.2" y "8.3" (la predeterminada):

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
      php: "7.1"
```

[Dentro de su máquina virtual Homestead](#connecting-via-ssh), puede usar cualquiera de las versiones de PHP compatibles a través de la CLI:

```shell
php5.6 artisan list
php7.0 artisan list
php7.1 artisan list
php7.2 artisan list
php7.3 artisan list
php7.4 artisan list
php8.0 artisan list
php8.1 artisan list
php8.2 artisan list
php8.3 artisan list
```

Puede cambiar la versión predeterminada de PHP utilizada por la CLI emitiendo los siguientes comandos desde su máquina virtual de Homestead:

```shell
php56
php70
php71
php72
php73
php74
php80
php81
php82
php83
```

<a id="connecting-to-databases"></a>
### Conexión a bases de datos

Una base de datos `homestead` está configurada para MySQL y PostgreSQL lista para usar. Para conectarse a su base de datos MySQL o PostgreSQL desde el cliente de base de datos de su máquina host, debe conectarse a `127.0.0.1` en el puerto `33060` (MySQL) o `54320` (PostgreSQL). El nombre de usuario y contraseña de ambas bases de datos es `homestead` / `secret`.

> **Advertencia:**
> Sólo debe utilizar estos puertos no estándar cuando se conecte a las bases de datos desde su máquina host. Utilizará los puertos predeterminados 3306 y 5432 en el archivo de configuración `database` de su aplicación Laravel, ya que Laravel se ejecuta _dentro_ de la máquina virtual.

<a id="database-backups"></a>
### Copias de seguridad de bases de datos

Homestead puede hacer una copia de seguridad automática de su base de datos cuando se destruye su máquina virtual de Homestead. Para utilizar esta función, debe utilizar Vagrant 2.1.0 o superior. O, si está utilizando una versión anterior de Vagrant, debe instalar el complemento `vagrant-triggers`. Para habilitar las copias de seguridad automáticas de la base de datos, agregue la siguiente línea a su archivo `Homestead.yaml`:

```yaml
backup: true
```

Una vez configurado, Homestead exportará sus bases de datos a los directorios `.backup/mysql_backup` y `.backup/postgres_backup` cuando se ejecute el comando `vagrant destroy`. Estos directorios se pueden encontrar en la carpeta donde instaló Homestead o en la raíz de su proyecto si está utilizando el método [instalación por proyecto](#per-project-installation).

<a id="configuring-cron-schedules"></a>
### Configuración de programaciones cron

Laravel proporciona una manera conveniente de [programar trabajos cron ](../scheduling/) programando un único comando `schedule:run` Artisan para que se ejecute cada minuto. El comando `schedule:run` examinará la programación de trabajos definida en su archivo `routes/console.php` para determinar qué tareas programadas ejecutar.

Si desea que se ejecute el comando `schedule:run` para un sitio de Homestead, puede configurar la opción `schedule` en `true` al definir el sitio:

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
      schedule: true
```

El trabajo cron para el sitio se definirá en el directorio `/etc/cron.d` de la máquina virtual de Homestead.

<a id="configuring-mailpit"></a>
### Configurando Mailpit

[Mailpit](https://github.com/axllent/mailpit) le permite interceptar su correo electrónico saliente y examinarlo sin enviarlo a sus destinatarios. Para comenzar, actualice el archivo `.env` de su aplicación para usar la siguiente configuración de correo:

```ini
MAIL_MAILER=smtp
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
```

Una vez que se haya configurado Mailpit, podrá acceder al panel de Mailpit en `http://localhost:8025`.

<a id="configuring-minio"></a>
### Configurando Minio

[Minio](https://github.com/minio/minio) es un servidor de almacenamiento de objetos de código abierto con una API compatible con Amazon S3. Para instalar Minio, actualice su archivo `Homestead.yaml` con la siguiente opción de configuración en la sección [features](#installing-optional-features):

    minio: cierto

De forma predeterminada, Minio está disponible en el puerto 9600. Puede acceder al panel de control de Minio visitando `http://localhost:9600`. La clave de acceso predeterminada es `homestead`, mientras que la clave secreta predeterminada es `secretkey`. Al acceder a Minio, siempre debes utilizar la región `us-east-1`.

Para utilizar Minio, asegúrese de que su archivo `.env` tenga las siguientes opciones:

```ini
AWS_USE_PATH_STYLE_ENDPOINT=true
AWS_ENDPOINT=http://localhost:9600
AWS_ACCESS_KEY_ID=homestead
AWS_SECRET_ACCESS_KEY=secretkey
AWS_DEFAULT_REGION=us-east-1
```

Para aprovisionar depósitos "S3" con tecnología Minio, agregue una directiva `buckets` a su archivo `Homestead.yaml`. Después de definir sus depósitos, debe ejecutar el comando `vagrant reload --provision` en su terminal:

```yaml
buckets:
    - name: your-bucket
      policy: public
    - name: your-private-bucket
      policy: none
```

Los valores `policy` admitidos incluyen: `none`, `download`, `upload` y `public`.

<a id="laravel-dusk"></a>
### Anochecer de Laravel

Para ejecutar [pruebas de Laravel Dusk](../dusk/) dentro de Homestead, debe habilitar la [función del controlador web](#installing-optional-features) en la configuración de su Homestead:

```yaml
features:
    - webdriver: true
```

Después de habilitar la función `webdriver`, debe ejecutar el comando `vagrant reload --provision` en su terminal.

<a id="sharing-your-environment"></a>
### Compartiendo su entorno

A veces es posible que desees compartir en qué estás trabajando actualmente con tus compañeros de trabajo o un cliente. Vagrant tiene soporte integrado para esto a través del comando `vagrant share`; sin embargo, esto no funcionará si tiene varios sitios configurados en su archivo `Homestead.yaml`.

Para solucionar este problema, Homestead incluye su propio comando `share`. Para comenzar, [SSH en su máquina virtual Homestead](#connecting-via-ssh) a través de `vagrant ssh` y ejecute el comando `share homestead.test`. Este comando compartirá el sitio `homestead.test` desde su archivo de configuración `Homestead.yaml`. Puede sustituir cualquiera de sus otros sitios configurados por `homestead.test`:

```shell
share homestead.test
```

Después de ejecutar el comando, verá aparecer una pantalla de Ngrok que contiene el registro de actividad y las URL de acceso público para el sitio compartido. Si desea especificar una región personalizada, un subdominio u otra opción de tiempo de ejecución de Ngrok, puede agregarlos a su comando `share`:

```shell
share homestead.test -region=eu -subdomain=laravel
```

Si necesita compartir contenido a través de HTTPS en lugar de HTTP, utilizar el comando `sshare` en lugar de `share` le permitirá hacerlo.

> **Advertencia:**
> Recuerde, Vagrant es inherentemente inseguro y usted está exponiendo su máquina virtual a Internet cuando ejecuta el comando `share`.

<a id="debugging-and-profiling"></a>
## Depuración y creación de perfiles

<a id="debugging-web-requests"></a>
### Depuración de solicitudes web con Xdebug

Homestead incluye soporte para la depuración de pasos usando [Xdebug](https://xdebug.org). Por ejemplo, puede acceder a una página en su navegador y PHP se conectará a su IDE para permitir la inspección y modificación del código en ejecución.

De forma predeterminada, Xdebug ya está ejecutándose y listo para aceptar conexiones. Si necesita habilitar Xdebug en la CLI, ejecute el comando `sudo phpenmod xdebug` dentro de su máquina virtual Homestead. A continuación, siga las instrucciones de su IDE para habilitar la depuración. Finalmente, configure su navegador para activar Xdebug con una extensión o [bookmarklet](https://www.jetbrains.com/phpstorm/marklets/).

> **Advertencia:**
> Xdebug hace que PHP se ejecute significativamente más lento. Para deshabilitar Xdebug, ejecute `sudo phpdismod xdebug` dentro de su máquina virtual Homestead y reinicie el servicio FPM.

<a id="autostarting-xdebug"></a>
#### Inicio automático de Xdebug

Al depurar pruebas funcionales que realizan solicitudes al servidor web, es más fácil iniciar automáticamente la depuración en lugar de modificar las pruebas para que pasen a través de un encabezado personalizado o una cookie para activar la depuración. Para forzar que Xdebug se inicie automáticamente, modifique el archivo `/etc/php/7.x/fpm/conf.d/20-xdebug.ini` dentro de su máquina virtual Homestead y agregue la siguiente configuración:

```ini
; If Homestead.yaml contains a different subnet for the IP address, this address may be different...
xdebug.client_host = 192.168.10.1
xdebug.mode = debug
xdebug.start_with_request = yes
```

<a id="debugging-cli-applications"></a>
### Depuración de aplicaciones CLI

Para depurar una aplicación PHP CLI, use el alias de shell `xphp` dentro de su máquina virtual Homestead:

```shell
xphp /path/to/script
```

<a id="profiling-applications-with-blackfire"></a>
### Aplicaciones de creación de perfiles con Blackfire

[Blackfire](https://blackfire.io/docs/introduction) es un servicio para generar perfiles de solicitudes web y aplicaciones CLI. Ofrece una interfaz de usuario interactiva que muestra datos de perfil en gráficos de llamadas y líneas de tiempo. Está diseñado para su uso en desarrollo, puesta en escena y producción, sin gastos generales para los usuarios finales. Además, Blackfire proporciona controles de rendimiento, calidad y seguridad del código y de los ajustes de configuración `php.ini`.

[Blackfire Player](https://blackfire.io/docs/player/index) es una aplicación de rastreo web, pruebas web y raspado web de código abierto que puede funcionar en conjunto con Blackfire para crear escenarios de creación de perfiles.

Para habilitar Blackfire, use la configuración de "características" en su archivo de configuración de Homestead:

```yaml
features:
    - blackfire:
        server_id: "server_id"
        server_token: "server_value"
        client_id: "client_id"
        client_token: "client_value"
```

Credenciales del servidor Blackfire y credenciales del cliente [requieren una cuenta Blackfire](https://blackfire.io/signup). Blackfire ofrece varias opciones para crear perfiles de una aplicación, incluida una herramienta CLI y una extensión del navegador. Por favor [revise la documentación de Blackfire para obtener más detalles](https://blackfire.io/docs/php/integrations/laravel/index).

<a id="network-interfaces"></a>
## Interfaces de red

La propiedad `networks` del archivo `Homestead.yaml` configura las interfaces de red para su máquina virtual Homestead. Puede configurar tantas interfaces como sea necesario:

```yaml
networks:
    - type: "private_network"
      ip: "192.168.10.20"
```

Para habilitar una interfaz [bridged](https://developer.hashicorp.com/vagrant/docs/networking/public_network), configure una configuración `bridge` para la red y cambie el tipo de red a `public_network`:

```yaml
networks:
    - type: "public_network"
      ip: "192.168.10.20"
      bridge: "en1: Wi-Fi (AirPort)"
```

Para habilitar [DHCP](https://developer.hashicorp.com/vagrant/docs/networking/public_network#dhcp), simplemente elimine la opción `ip` de su configuración:

```yaml
networks:
    - type: "public_network"
      bridge: "en1: Wi-Fi (AirPort)"
```

Para actualizar qué dispositivo está utilizando la red, puede agregar una opción `dev` a la configuración de la red. El valor predeterminado de `dev` es `eth0`:

```yaml
networks:
    - type: "public_network"
      ip: "192.168.10.20"
      bridge: "en1: Wi-Fi (AirPort)"
      dev: "enp2s0"
```

<a id="extending-homestead"></a>
## Ampliación de la propiedad

Puede ampliar Homestead utilizando el script `after.sh` en la raíz de su directorio de Homestead. Dentro de este archivo, puede agregar cualquier comando de shell que sea necesario para configurar y personalizar adecuadamente su máquina virtual.

Al personalizar Homestead, Ubuntu puede preguntarle si desea conservar la configuración original de un paquete o sobrescribirlo con un nuevo archivo de configuración. Para evitar esto, debe utilizar el siguiente comando al instalar paquetes para evitar sobrescribir cualquier configuración escrita previamente por Homestead:

```shell
sudo apt-get -y \
    -o Dpkg::Options::="--force-confdef" \
    -o Dpkg::Options::="--force-confold" \
    install package-name
```

<a id="user-customizations"></a>
### Personalizaciones de usuario

Cuando utilice Homestead con su equipo, es posible que desee modificar Homestead para que se ajuste mejor a su estilo de desarrollo personal. Para lograr esto, puede crear un archivo `user-customizations.sh` en la raíz de su directorio Homestead (el mismo directorio que contiene su archivo `Homestead.yaml`). Dentro de este archivo, puede realizar cualquier personalización que desee; sin embargo, la versión del `user-customizations.sh` no debe tener control.

<a id="provider-specific-settings"></a>
## Configuración específica del proveedor

<a id="provider-specific-virtualbox"></a>
### Caja virtual

<a id="natdnshostresolver"></a>
#### `natdnshostresolver`

De forma predeterminada, Homestead configura la configuración `natdnshostresolver` en `on`. Esto le permite a Homestead usar la configuración DNS de su sistema operativo host. Si desea anular este comportamiento, agregue las siguientes opciones de configuración a su archivo `Homestead.yaml`:

```yaml
provider: virtualbox
natdnshostresolver: 'off'
```
