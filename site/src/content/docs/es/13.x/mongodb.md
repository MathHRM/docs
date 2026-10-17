---
title: "MongoDB"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Instalación](#installation)
    - [Controlador MongoDB](#mongodb-driver)
    - [Iniciar un servidor MongoDB](#starting-a-mongodb-server)
    - [Instalar el paquete Laravel MongoDB](#install-the-laravel-mongodb-package)
- [Configuración](#configuration)
- [Características](#features)

<a id="introduction"></a>
## Introducción

[MongoDB](https://www.mongodb.com/resources/products/fundamentals/why-use-mongodb) es una de las bases de datos orientadas a documentos NoSQL más populares, utilizada por su capacidad para manejar altas cargas de escritura (útil para análisis o IoT) y alta disponibilidad (conjuntos de réplicas fáciles de configurar con conmutación por error automática). También puede fragmentar la base de datos fácilmente para lograr escalabilidad horizontal y tiene un potente lenguaje de consulta para realizar agregaciones, búsquedas de texto o consultas geoespaciales.

En lugar de almacenar datos en tablas de filas o columnas como las bases de datos SQL, cada registro en una base de datos MongoDB es un documento descrito en BSON, una representación binaria de los datos. Luego, las aplicaciones pueden recuperar esta información en formato JSON. Admite una amplia variedad de tipos de datos, incluidos documentos, arrays, documentos embebidos y datos binarios.

Antes de usar MongoDB con Laravel, recomendamos instalar y usar el paquete `mongodb/laravel-mongodb` a través de Composer. MongoDB mantiene oficialmente el paquete `laravel-mongodb`, y aunque MongoDB es compatible de forma nativa con PHP a través del controlador MongoDB, el paquete [Laravel MongoDB](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/) proporciona una integración más rica con Eloquent y otras características de Laravel:

```shell
composer require mongodb/laravel-mongodb
```

<a id="installation"></a>
## Instalación

<a id="mongodb-driver"></a>
### Controlador MongoDB

Para conectarte a una base de datos MongoDB, se requiere la extensión PHP `mongodb`. Si desarrollas localmente con [Laravel Herd](https://herd.laravel.com) o instalaste PHP mediante `php.new`, ya tienes esta extensión instalada en tu sistema. Sin embargo, si necesitas instalar la extensión manualmente, puedes hacerlo a través de PECL:

```shell
pecl install mongodb
```

Alternativamente, puedes instalar la extensión usando [PIE](https://github.com/php/pie), el instalador oficial de extensiones de PHP:

```shell
pie install mongodb/mongodb-extension
```

Para obtener más información sobre la instalación de la extensión PHP de MongoDB, consulta las [instrucciones de instalación de la extensión PHP de MongoDB](https://www.php.net/manual/en/mongodb.installation.php).

<a id="starting-a-mongodb-server"></a>
### Iniciar un servidor MongoDB

MongoDB Community Server se puedes usar para ejecutar MongoDB localmente y está disponible para su instalación en Windows, macOS, Linux o como contenedor Docker. Para aprender cómo instalar MongoDB, consulta la [guía oficial de instalación de MongoDB Community](https://docs.mongodb.com/manual/administration/install-community/).

La cadena de conexión para el servidor MongoDB se puede configurar en tu archivo `.env`:

```ini
MONGODB_URI="mongodb://localhost:27017"
MONGODB_DATABASE="laravel_app"
```

Para alojar MongoDB en la nube, considera usar [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
Para acceder a un clúster de MongoDB Atlas localmente desde tu aplicación, deberás [agregar tu propia dirección IP en la configuración de red del clúster](https://www.mongodb.com/docs/atlas/security/add-ip-address-to-list/) a la lista de acceso de IP del proyecto.

La cadena de conexión para MongoDB Atlas también se puede configurar en tu archivo `.env`:

```ini
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority"
MONGODB_DATABASE="laravel_app"
```

<a id="install-the-laravel-mongodb-package"></a>
### Instalar el paquete Laravel MongoDB

Por último, usa Composer para instalar el paquete Laravel MongoDB:

```shell
composer require mongodb/laravel-mongodb
```

> **Nota:**
> Esta instalación del paquete fallará si la extensión PHP `mongodb` no está instalada. La configuración de PHP puede diferir entre la CLI y el servidor web, así que asegúrate de que la extensión esté habilitada en ambas configuraciones.

<a id="configuration"></a>
## Configuración

Puedes configurar tu conexión con MongoDB a través del archivo de configuración `config/database.php` de tu aplicación. Dentro de este archivo, agrega una conexión `mongodb` que utilice el controlador `mongodb`:

```php
'connections' => [
    'mongodb' => [
        'driver' => 'mongodb',
        'dsn' => env('MONGODB_URI', 'mongodb://localhost:27017'),
        'database' => env('MONGODB_DATABASE', 'laravel_app'),
    ],
],
```

<a id="features"></a>
## Características

Una vez completada la configuración, puedes usar el paquete `mongodb` y la conexión de base de datos en tu aplicación para aprovechar una variedad de potentes funciones:

- [Uso de Eloquent](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/eloquent-models/), los modelos se pueden almacenar en colecciones de MongoDB. Además de las funciones estándar de Eloquent, el paquete Laravel MongoDB proporciona funciones adicionales como relaciones embebidas. El paquete también proporciona acceso directo al controlador MongoDB, que se puedes usar para ejecutar operaciones como consultas directas y canalizaciones de agregación.
- [Escribir consultas complejas](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/query-builder/) usando el constructor de consultas.
- [Búsqueda de similitud/vectorial](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/fundamentals/vector-search/) usando embeddings vectoriales y el método Eloquent `vectorSearch`.
- El [controlador de caché](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/cache/) `mongodb` está optimizado para utilizar funciones de MongoDB como índices TTL para borrar automáticamente las entradas de caché caducadas.
- [Despachar y procesar trabajos en cola](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/queues/) con el controlador de cola `mongodb`.
- [Almacenamiento de archivos en GridFS](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/filesystems/), a través del [Adaptador GridFS para Flysystem](https://flysystem.thephpleague.com/docs/adapter/gridfs/).
- [Búsqueda de texto completo](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/scout/) utilizando el motor Scout `mongodb`.
- La mayoría de los paquetes de terceros que utilizan una conexión de base de datos o Eloquent se pueden utilizar con MongoDB.

Para continuar aprendiendo cómo usar MongoDB y Laravel, consulta la [Guía de inicio rápido](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/quick-start/).
