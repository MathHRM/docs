---
title: "Ciclo de vida de una solicitud"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Descripción general del ciclo de vida](#lifecycle-overview)
    - [Primeros pasos](#first-steps)
    - [Kernels HTTP y de consola](#http-console-kernels)
    - [Proveedores de servicios](#service-providers)
    - [Enrutamiento](#routing)
    - [Finalización](#finishing-up)
- [El papel de los proveedores de servicios](#focus-on-service-providers)

<a id="introduction"></a>
## Introducción

Al utilizar cualquier herramienta en el «mundo real», te sientes más seguro si comprendes cómo funciona. Lo mismo ocurre con el desarrollo de aplicaciones. Cuando comprendes cómo funcionan tus herramientas de desarrollo, te sientes más cómodo y seguro al utilizarlas.

El objetivo de este documento es ofrecerte una visión general de cómo funciona el framework de Laravel. Al conocer mejor el framework en su conjunto, todo parecerá menos «mágico» y tendrás más confianza al crear tus aplicaciones. Si no comprendes todos los términos de inmediato, ¡no te desanimes! Intenta entender lo básico de lo que sucede y tus conocimientos aumentarán a medida que explores otras secciones de la documentación.

<a id="lifecycle-overview"></a>
## Descripción general del ciclo de vida

<a id="first-steps"></a>
### Primeros pasos

El punto de entrada para todas las solicitudes a una aplicación Laravel es el archivo `public/index.php`. Todas las solicitudes se dirigen a este archivo mediante la configuración de tu servidor web (Apache/Nginx). El archivo `index.php` no contiene mucho código. Más bien, es un punto de partida para cargar el resto del framework.

El archivo `index.php` carga la definición del cargador automático generada por Composer y luego recupera una instancia de la aplicación Laravel de `bootstrap/app.php`. La primera acción realizada por el propio Laravel es crear una instancia de la aplicación / [contenedor de servicios](../container/).

<a id="http-console-kernels"></a>
### Kernels HTTP y de consola

A continuación, la solicitud entrante se envía al kernel HTTP o al kernel de la consola, utilizando los métodos `handleRequest` o `handleCommand` de la instancia de la aplicación, según el tipo de solicitud que ingresa a la aplicación. Estos dos kernels sirven como ubicación central a través de la cual fluyen todas las solicitudes. Por ahora, centrémonos únicamente en el kernel HTTP, que es una instancia de `Illuminate\Foundation\Http\Kernel`.

El kernel HTTP define un array de `bootstrappers` que se ejecutarán antes de que se ejecute la solicitud. Estos inicializadores configuran el manejo de errores, configuran el registro, [detectan el entorno de la aplicación](../configuration/#environment-configuration) y realizan otras tareas que deben realizarse antes de que la solicitud se maneje realmente. Normalmente, estas clases manejan la configuración interna de Laravel de la que no necesitas preocuparte.

El kernel HTTP también es responsable de pasar la solicitud a través de la pila de middleware de la aplicación. Este middleware maneja la lectura y escritura de la [sesión HTTP](../session/), determinando si la aplicación está en modo de mantenimiento, [verificando el token CSRF](../csrf/) y más. Hablaremos más sobre estos pronto.

La firma del método `handle` del kernel HTTP es bastante simple: recibe un `Request` y devuelve un `Response`. Piensa en el kernel como una gran caja negra que representa toda tu aplicación. Envíale solicitudes HTTP y devolverá respuestas HTTP.

<a id="service-providers"></a>
### Proveedores de servicios

Una de las acciones de arranque del kernel más importantes es cargar los [proveedores de servicios](../providers/) de tu aplicación. Los proveedores de servicios son responsables de iniciar todos los diversos componentes del framework, como los componentes de base de datos, cola, validación y enrutamiento.

Laravel recorrerá esta lista de proveedores y creará una instancia de cada uno de ellos. Después de crear una instancia de los proveedores, se llamará al método `register` en todos los proveedores. Luego, una vez que todos los proveedores hayan sido registrados, se llamará al método `boot` en cada proveedor. Esto es para que los proveedores de servicios puedan depender de que cada vinculación del contenedor esté registrada y disponible en el momento en que se ejecute su método `boot`.

Básicamente, todas las funcionalidades principales que ofrece Laravel son iniciadas y configuradas por un proveedor de servicios. Dado que inician y configuran tantas funcionalidades ofrecidas por el framework, los proveedores de servicios son el aspecto más importante de todo el proceso de inicio de Laravel.

Si bien el framework utiliza internamente docenas de proveedores de servicios, también tienes la opción de crear los tuyos. Puedes encontrar una lista de los proveedores de servicios de terceros o definidos por el usuario que utiliza tu aplicación en el archivo `bootstrap/providers.php`.

<a id="routing"></a>
### Enrutamiento

Una vez que se haya iniciado la aplicación y se hayan registrado todos los proveedores de servicios, el `Request` se entregará al enrutador para despacharla. El enrutador despachará la solicitud a una ruta o controlador, así como también ejecutará cualquier middleware específico de ruta.

El middleware proporciona un mecanismo conveniente para filtrar o examinar las solicitudes HTTP que ingresan a tu aplicación. Por ejemplo, Laravel incluye un middleware que verifica si el usuario de tu aplicación está autenticado. Si el usuario no está autenticado, el middleware lo redireccionará a la pantalla de inicio de sesión. Sin embargo, si el usuario está autenticado, el middleware permitirá que la solicitud avance en la aplicación. Algunos middleware se asignan a todas las rutas dentro de la aplicación, como `PreventRequestsDuringMaintenance`, mientras que otros solo se asignan a rutas o grupos de rutas específicos. Puedes obtener más información sobre el middleware leyendo la [documentación de middleware](../middleware/).

Si la solicitud pasa por todo el middleware asignado a la ruta coincidente, se ejecutará la ruta o el método del controlador y la respuesta devuelta por la ruta o el método del controlador se enviará de regreso a través de la cadena de middleware de la ruta.

<a id="finishing-up"></a>
### Finalización

Una vez que la ruta o el método del controlador devuelve una respuesta, la respuesta viajará hacia afuera a través del middleware de la ruta, dando a la aplicación la oportunidad de modificar o examinar la respuesta saliente.

Finalmente, una vez que la respuesta regresa a través del middleware, el método `handle` del kernel HTTP devuelve el objeto de respuesta al `handleRequest` de la instancia de la aplicación, y este método llama al método `send` en la respuesta devuelta. El método `send` envía el contenido de la respuesta al navegador web del usuario. ¡Ahora hemos completado nuestro viaje a través de todo el ciclo de vida de las solicitudes de Laravel!

<a id="focus-on-service-providers"></a>
## El papel de los proveedores de servicios

Los proveedores de servicios son verdaderamente la clave para iniciar una aplicación Laravel. Se crea la instancia de la aplicación, se registran los proveedores de servicios y la solicitud se entrega a la aplicación iniciada. ¡Es realmente así de simple!

Es muy valioso tener una idea clara de cómo se construye y arranca una aplicación Laravel a través de proveedores de servicios. Los proveedores de servicios definidos por el usuario de tu aplicación se almacenan en el directorio `app/Providers`.

De forma predeterminada, el `AppServiceProvider` está bastante vacío. Este proveedor es un excelente lugar para agregar los propios enlaces de contenedor de servicios y arranque de tu aplicación. Para aplicaciones grandes, puedes crear varios proveedores de servicios, cada uno con un arranque más granular para servicios específicos utilizados por tu aplicación.
