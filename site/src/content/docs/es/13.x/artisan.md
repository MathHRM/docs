---
title: "Consola artesanal"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
    - [Tinker (REPL)](#tinker)
- [Escribir comandos](#writing-commands)
    - [Generando Comandos](#generating-commands)
    - [Estructura de comando](#command-structure)
    - [Comandos de cierre](#closure-commands)
    - [Comandos aislables](#isolatable-commands)
- [Definición de expectativas de entrada](#defining-input-expectations)
    - [Argumentos](#arguments)
    - [Opciones](#options)
    - [Matrices de entrada](#input-arrays)
    - [Descripciones de entrada](#input-descriptions)
    - [Solicitud de entrada faltante](#prompting-for-missing-input)
- [Comando I/O](#command-io)
    - [Recuperando entrada](#retrieving-input)
    - [Solicitando entrada](#prompting-for-input)
    - [Salida de escritura](#writing-output)
- [Registro de comandos](#registering-commands)
- [Ejecución de comandos mediante programación](#programmatically-executing-commands)
    - [Llamar comandos desde otros comandos](#calling-commands-from-other-commands)
- [Manejo de señal](#signal-handling)
- [El comando de desarrollo](#the-dev-command)
    - [Personalizar procesos de desarrollo](#customizing-dev-processes)
    - [Filtrado de procesos de desarrollo](#filtering-dev-processes)
- [Personalización de trozos](#stub-customization)
- [Eventos](#events)

<a id="introduction"></a>
## Introducción

Artisan es la interfaz de línea de comandos incluida con Laravel. Artisan existe en la raíz de su aplicación como el script `artisan` y proporciona una serie de comandos útiles que puede usar mientras crea su aplicación. Para ver una lista de todos los comandos Artisan disponibles, puede usar el comando `list`:

```shell
php artisan list
```

Cada comando también incluye una pantalla de "ayuda" que muestra y describe los argumentos y opciones disponibles del comando. Para ver una pantalla de ayuda, anteponga el nombre del comando a `help`:

```shell
php artisan help migrate
```

<a id="laravel-sail"></a>
#### Vela Laravel

Si está utilizando [Laravel Sail](../sail/) como entorno de desarrollo local, recuerde usar la línea de comando `sail` para invocar los comandos de Artisan. Sail ejecutará sus comandos Artisan dentro de los contenedores Docker de su aplicación:

```shell
./vendor/bin/sail artisan list
```

<a id="tinker"></a>
### Tinker (REPL)

[Laravel Tinker](https://github.com/laravel/tinker) es un poderoso REPL para el marco Laravel, impulsado por el paquete [PsySH](https://github.com/bobthecow/psysh).

<a id="installation"></a>
#### Instalación

Todas las aplicaciones de Laravel incluyen Tinker por defecto. Sin embargo, puedes instalar Tinker usando Composer si lo has eliminado previamente de tu aplicación:

```shell
composer require laravel/tinker
```

> **Nota:**
> ¿Busca recarga en caliente, edición de código multilínea y autocompletado al interactuar con su aplicación Laravel? ¡Echa un vistazo a [Tinkerwell](https://tinkerwell.app)!

<a id="usage"></a>
#### Uso

Tinker te permite interactuar con toda tu aplicación Laravel en la línea de comando, incluidos tus modelos, trabajos, eventos y más de Eloquent. Para ingresar al entorno Tinker, ejecute el comando `tinker` Artisan:

```shell
php artisan tinker
```

Puede publicar el archivo de configuración de Tinker usando el comando `vendor:publish`:

```shell
php artisan vendor:publish --provider="Laravel\Tinker\TinkerServiceProvider"
```

> **Advertencia:**
> La función auxiliar `dispatch` y el método `dispatch` en la clase `Dispatchable` dependen de la recolección de basura para colocar el trabajo en la cola. Por lo tanto, cuando utilice Tinker, debe utilizar `Bus::dispatch` o `Queue::push` para enviar trabajos.

<a id="command-allow-list"></a>
#### Lista de comandos permitidos

Tinker utiliza una lista de "permisos" para determinar qué comandos de Artisan pueden ejecutarse dentro de su shell. De forma predeterminada, puede ejecutar los comandos `clear-compiled`, `down`, `env`, `inspire`, `migrate`, `migrate:install`, `up` y `optimize`. Si desea permitir más comandos, puede agregarlos a la matriz `commands` en su archivo de configuración `tinker.php`:

```php
'commands' => [
    // App\Console\Commands\ExampleCommand::class,
],
```

<a id="classes-that-should-not-be-aliased"></a>
#### Clases que no deben tener alias

Normalmente, Tinker crea automáticamente alias de clases a medida que interactúas con ellas en Tinker. Sin embargo, es posible que nunca desees asignar un alias a algunas clases. Puede lograr esto enumerando las clases en la matriz `dont_alias` de su archivo de configuración `tinker.php`:

```php
'dont_alias' => [
    App\Models\User::class,
],
```

<a id="writing-commands"></a>
## Escribir comandos

Además de los comandos proporcionados con Artisan, puede crear sus propios comandos personalizados. Los comandos normalmente se almacenan en el directorio `app/Console/Commands`; sin embargo, eres libre de elegir tu propia ubicación de almacenamiento siempre que le indiques a Laravel que [escanee otros directorios en busca de comandos Artisan](#registering-commands).

<a id="generating-commands"></a>
### Generando comandos

Para crear un nuevo comando, puede utilizar el comando `make:command` Artisan. Este comando creará una nueva clase de comando en el directorio `app/Console/Commands`. No se preocupe si este directorio no existe en su aplicación; se creará la primera vez que ejecute el comando `make:command` Artisan:

```shell
php artisan make:command SendEmails
```

<a id="command-structure"></a>
### Estructura de mando

Después de generar su comando, debe definir la firma y la descripción del comando usando los atributos `Signature` y `Description`. El atributo `Signature` también le permite definir [las expectativas de entrada de su comando](#defining-input-expectations). Se llamará al método `handle` cuando se ejecute su comando. Puede colocar su lógica de comando en este método.

Echemos un vistazo a un comando de ejemplo. Tenga en cuenta que podemos solicitar cualquier dependencia que necesitemos mediante el método `handle` del comando. El [contenedor de servicios ](../container/) de Laravel inyectará automáticamente todas las dependencias que están escritas en la firma de este método:

```php
<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Support\DripEmailer;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('mail:send {user}')]
#[Description('Send a marketing email to a user')]
class SendEmails extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(DripEmailer $drip): void
    {
        $drip->send(User::find($this->argument('user')));
    }
}
```

> **Nota:**
> Para una mayor reutilización del código, es una buena práctica mantener los comandos de la consola livianos y dejar que los servicios de la aplicación realicen sus tareas. En el ejemplo anterior, tenga en cuenta que inyectamos una clase de servicio para hacer el "trabajo pesado" de enviar los correos electrónicos.

<a id="exit-codes"></a>
#### Códigos de salida

Si no se devuelve nada del método `handle` y el comando se ejecuta correctamente, el comando saldrá con un código de salida `0`, lo que indica el éxito. Sin embargo, el método `handle` puede, opcionalmente, devolver un número entero para especificar manualmente el código de salida del comando:

```php
$this->error('Something went wrong.');

return 1;
```

Si desea "fallar" el comando desde cualquier método dentro del comando, puede utilizar el método `fail`. El método `fail` finalizará inmediatamente la ejecución del comando y devolverá un código de salida de `1`:

```php
$this->fail('Something went wrong.');
```

<a id="closure-commands"></a>
### Comandos de cierre

Los comandos basados ​​en cierres proporcionan una alternativa a la definición de comandos de consola como clases. De la misma manera que los cierres de rutas son una alternativa a los controladores, piense en los cierres de comandos como una alternativa a las clases de comandos.

Aunque el archivo `routes/console.php` no define rutas HTTP, define puntos de entrada (rutas) basados ​​en consola en su aplicación. Dentro de este archivo, puede definir todos los comandos de su consola basada en cierres utilizando el método `Artisan::command`. El método `command` acepta dos argumentos: la [firma del comando](#defining-input-expectations) y un cierre que recibe los argumentos y opciones del comando:

```php
Artisan::command('mail:send {user}', function (string $user) {
    $this->info("Sending email to: {$user}!");
});
```

El cierre está vinculado a la instancia de comando subyacente, por lo que tiene acceso completo a todos los métodos auxiliares a los que normalmente podría acceder en una clase de comando completa.

<a id="type-hinting-dependencies"></a>
#### Dependencias de sugerencias de tipo

Además de recibir los argumentos y opciones de su comando, los cierres de comandos también pueden indicar dependencias adicionales que le gustaría resolver desde el [contenedor de servicios](../container/):

```php
use App\Models\User;
use App\Support\DripEmailer;
use Illuminate\Support\Facades\Artisan;

Artisan::command('mail:send {user}', function (DripEmailer $drip, string $user) {
    $drip->send(User::find($user));
});
```

<a id="closure-command-descriptions"></a>
#### Descripciones de comandos de cierre

Al definir un comando basado en cierre, puede usar el método `purpose` para agregar una descripción al comando. Esta descripción se mostrará cuando ejecute los comandos `php artisan list` o `php artisan help`:

```php
Artisan::command('mail:send {user}', function (string $user) {
    // ...
})->purpose('Send a marketing email to a user');
```

<a id="isolatable-commands"></a>
### Comandos aislables

> **Advertencia:**
> Para utilizar esta función, su aplicación debe utilizar el controlador de caché `memcached`, `redis`, `dynamodb`, `database`, `file` o `array` como controlador de caché predeterminado de su aplicación. Además, todos los servidores deben comunicarse con el mismo servidor de caché central.

A veces es posible que desee asegurarse de que solo se pueda ejecutar una instancia de un comando a la vez. Para lograr esto, puede implementar la interfaz `Illuminate\Contracts\Console\Isolatable` en su clase de comando:

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Contracts\Console\Isolatable;

class SendEmails extends Command implements Isolatable
{
    // ...
}
```

Cuando marca un comando como `Isolatable`, Laravel automáticamente hace que la opción `--isolated` esté disponible para el comando sin necesidad de definirla explícitamente en las opciones del comando. Cuando se invoca el comando con esa opción, Laravel se asegurará de que no se estén ejecutando otras instancias de ese comando. Laravel logra esto intentando adquirir un bloqueo atómico utilizando el controlador de caché predeterminado de su aplicación. Si se están ejecutando otras instancias del comando, el comando no se ejecutará; sin embargo, el comando seguirá saliendo con un código de estado de salida exitoso:

```shell
php artisan mail:send 1 --isolated
```

Si desea especificar el código de estado de salida que el comando debe devolver si no se puede ejecutar, puede proporcionar el código de estado deseado a través de la opción `isolated`:

```shell
php artisan mail:send 1 --isolated=12
```

<a id="lock-id"></a>
#### Bloquear ID

De forma predeterminada, Laravel usará el nombre del comando para generar la clave de cadena que se usa para adquirir el bloqueo atómico en el caché de su aplicación. Sin embargo, puede personalizar esta clave definiendo un método `isolatableId` en su clase de comando Artisan, lo que le permitirá integrar los argumentos u opciones del comando en la clave:

```php
/**
 * Get the isolatable ID for the command.
 */
public function isolatableId(): string
{
    return $this->argument('user');
}
```

<a id="lock-expiration-time"></a>
#### Tiempo de vencimiento del bloqueo

De forma predeterminada, los bloqueos de aislamiento caducan una vez finalizado el comando. O, si el comando se interrumpe y no se puede finalizar, el bloqueo expirará después de una hora. Sin embargo, puede ajustar el tiempo de vencimiento del bloqueo definiendo un método `isolationLockExpiresAt` en su comando:

```php
use DateTimeInterface;
use DateInterval;

/**
 * Determine when an isolation lock expires for the command.
 */
public function isolationLockExpiresAt(): DateTimeInterface|DateInterval
{
    return now()->plus(minutes: 5);
}
```

<a id="defining-input-expectations"></a>
## Definición de expectativas de entrada

Al escribir comandos de consola, es común recopilar información del usuario a través de argumentos u opciones. Laravel hace que sea muy conveniente definir la entrada que espera del usuario utilizando la propiedad `signature` en sus comandos. La propiedad `signature` le permite definir el nombre, los argumentos y las opciones del comando en una sintaxis única, expresiva y similar a una ruta.

<a id="arguments"></a>
### Argumentos

Todos los argumentos y opciones proporcionados por el usuario están entre llaves. En el siguiente ejemplo, el comando define un argumento obligatorio: `user`:

```php
/**
 * The name and signature of the console command.
 *
 * @var string
 */
protected $signature = 'mail:send {user}';
```

También puede hacer que los argumentos sean opcionales o definir valores predeterminados para los argumentos:

```php
// Optional argument...
'mail:send {user?}'

// Optional argument with default value...
'mail:send {user=foo}'
```

<a id="options"></a>
### Opciones

Las opciones, al igual que los argumentos, son otra forma de entrada del usuario. Las opciones tienen el prefijo dos guiones (`--`) cuando se proporcionan a través de la línea de comando. Hay dos tipos de opciones: las que reciben un valor y las que no. Las opciones que no reciben un valor sirven como un "interruptor" booleano. Veamos un ejemplo de este tipo de opción:

```php
/**
 * The name and signature of the console command.
 *
 * @var string
 */
protected $signature = 'mail:send {user} {--queue}';
```

En este ejemplo, se puede especificar el modificador `--queue` al llamar al comando Artisan. Si se pasa el interruptor `--queue`, el valor de la opción será `true`. En caso contrario, el valor será `false`:

```shell
php artisan mail:send 1 --queue
```

<a id="options-with-values"></a>
#### Opciones con valores

A continuación, echemos un vistazo a una opción que espera un valor. Si el usuario debe especificar un valor para una opción, debe añadir al nombre de la opción el sufijo `=`:

```php
/**
 * The name and signature of the console command.
 *
 * @var string
 */
protected $signature = 'mail:send {user} {--queue=}';
```

En este ejemplo, el usuario puede pasar un valor para la opción así. Si no se especifica la opción al invocar el comando, su valor será `null`:

```shell
php artisan mail:send 1 --queue=default
```

Puede asignar valores predeterminados a las opciones especificando el valor predeterminado después del nombre de la opción. Si el usuario no pasa ningún valor de opción, se utilizará el valor predeterminado:

```php
'mail:send {user} {--queue=default}'
```

<a id="option-shortcuts"></a>
#### Atajos de opciones

Para asignar un acceso directo al definir una opción, puede especificarlo antes del nombre de la opción y usar el carácter `|` como delimitador para separar el acceso directo del nombre completo de la opción:

```php
'mail:send {user} {--Q|queue=}'
```

Al invocar el comando en su terminal, los accesos directos a las opciones deben tener como prefijo un solo guión y no se debe incluir ningún carácter `=` al especificar un valor para la opción:

```shell
php artisan mail:send 1 -Qdefault
```

<a id="input-arrays"></a>
### Matrices de entrada

Si desea definir argumentos u opciones para esperar múltiples valores de entrada, puede usar el carácter `*`. Primero, echemos un vistazo a un ejemplo que especifica dicho argumento:

```php
'mail:send {user*}'
```

Al ejecutar este comando, los argumentos `user` se pueden pasar en orden a la línea de comando. Por ejemplo, el siguiente comando establecerá el valor de `user` en una matriz con `1` y `2` como valores:

```shell
php artisan mail:send 1 2
```

Este carácter `*` se puede combinar con una definición de argumento opcional para permitir cero o más instancias de un argumento:

```php
'mail:send {user?*}'
```

<a id="option-arrays"></a>
#### Matrices de opciones

Al definir una opción que espera múltiples valores de entrada, cada valor de opción pasado al comando debe tener el prefijo del nombre de la opción:

```php
'mail:send {--id=*}'
```

Un comando de este tipo se puede invocar pasando varios argumentos `--id`:

```shell
php artisan mail:send --id=1 --id=2
```

<a id="input-descriptions"></a>
### Descripciones de entrada

Puede asignar descripciones a los argumentos y opciones de entrada separando el nombre del argumento de la descripción mediante dos puntos. Si necesita un poco más de espacio para definir su comando, no dude en distribuir la definición en varias líneas:

```php
/**
 * The name and signature of the console command.
 *
 * @var string
 */
protected $signature = 'mail:send
                        {user : The ID of the user}
                        {--queue : Whether the job should be queued}';
```

<a id="prompting-for-missing-input"></a>
### Solicitar información faltante

Si su comando contiene argumentos obligatorios, el usuario recibirá un mensaje de error cuando no se proporcionen. Alternativamente, puede configurar su comando para avisar automáticamente al usuario cuando faltan los argumentos requeridos implementando la interfaz `PromptsForMissingInput`:

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Contracts\Console\PromptsForMissingInput;

class SendEmails extends Command implements PromptsForMissingInput
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mail:send {user}';

    // ...
}
```

Si Laravel necesita recopilar un argumento requerido del usuario, automáticamente le pedirá el argumento formulando inteligentemente la pregunta usando el nombre del argumento o la descripción. Si desea personalizar la pregunta utilizada para recopilar el argumento requerido, puede implementar el método `promptForMissingArgumentsUsing`, que devuelve una serie de preguntas codificadas por los nombres de los argumentos:

```php
/**
 * Prompt for missing input arguments using the returned questions.
 *
 * @return array<string, string>
 */
protected function promptForMissingArgumentsUsing(): array
{
    return [
        'user' => 'Which user ID should receive the mail?',
    ];
}
```

También puedes proporcionar texto de marcador de posición utilizando una tupla que contenga la pregunta y el marcador de posición:

```php
return [
    'user' => ['Which user ID should receive the mail?', 'E.g. 123'],
];
```

Si desea tener un control total sobre el mensaje, puede proporcionar un cierre que debería avisar al usuario y devolverle su respuesta:

```php
use App\Models\User;
use function Laravel\Prompts\search;

// ...

return [
    'user' => fn () => search(
        label: 'Search for a user:',
        placeholder: 'E.g. Taylor Otwell',
        options: fn ($value) => strlen($value) > 0
            ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
            : []
    ),
];
```

> **Nota:**
La documentación completa [Laravel Prompts](../prompts/) incluye información adicional sobre las indicaciones disponibles y su uso.

Si desea solicitar al usuario que seleccione o ingrese [opciones](#options), puede incluir indicaciones en el método `handle` de su comando. Sin embargo, si solo desea avisar al usuario cuando también se le han preguntado automáticamente los argumentos faltantes, puede implementar el método `afterPromptingForMissingArguments`:

```php
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use function Laravel\Prompts\confirm;

// ...

/**
 * Perform actions after the user was prompted for missing arguments.
 */
protected function afterPromptingForMissingArguments(InputInterface $input, OutputInterface $output): void
{
    $input->setOption('queue', confirm(
        label: 'Would you like to queue the mail?',
        default: $this->option('queue')
    ));
}
```

<a id="command-io"></a>
## E/S de comando

<a id="retrieving-input"></a>
### Recuperando entrada

Mientras se ejecuta su comando, es probable que necesite acceder a los valores de los argumentos y opciones aceptados por su comando. Para hacerlo, puede utilizar los métodos `argument` y `option`. Si un argumento u opción no existe, se devolverá `null`:

```php
/**
 * Execute the console command.
 */
public function handle(): void
{
    $userId = $this->argument('user');
}
```

Si necesita recuperar todos los argumentos como `array`, llame al método `arguments`:

```php
$arguments = $this->arguments();
```

Las opciones se pueden recuperar tan fácilmente como los argumentos utilizando el método `option`. Para recuperar todas las opciones como una matriz, llame al método `options`:

```php
// Retrieve a specific option...
$queueName = $this->option('queue');

// Retrieve all options as an array...
$options = $this->options();
```

Puede utilizar el método `input` para recuperar los argumentos y las opciones de un comando como una instancia `Illuminate\Console\CommandInput`, que proporciona los mismos descriptores de acceso escritos que están disponibles en solicitudes HTTP y otros contenedores de datos:

```php
use App\Enums\ReportType;

/**
 * Execute the console command.
 */
public function handle(): void
{
    $input = $this->input()->date('from');

    // ...
}
```

El método `input` también se puede utilizar para recuperar un único valor de entrada de los argumentos o de las opciones:

```php
$queue = $this->input('queue', 'default');
```

<a id="prompting-for-input"></a>
### Solicitar entrada

> **Nota:**
> [Laravel Prompts](../prompts/) es un paquete PHP para agregar formularios hermosos y fáciles de usar a sus aplicaciones de línea de comandos, con funciones similares a las de un navegador, que incluyen texto de marcador de posición y validación.

Además de mostrar el resultado, también puede pedirle al usuario que proporcione información durante la ejecución de su comando. El método `ask` le preguntará al usuario la pregunta dada, aceptará su entrada y luego devolverá la entrada del usuario a su comando:

```php
/**
 * Execute the console command.
 */
public function handle(): void
{
    $name = $this->ask('What is your name?');

    // ...
}
```

El método `ask` también acepta un segundo argumento opcional que especifica el valor predeterminado que debe devolverse si no se proporciona ninguna entrada del usuario:

```php
$name = $this->ask('What is your name?', 'Taylor');
```

El método `secret` es similar a `ask`, pero la entrada del usuario no será visible para él mientras escribe en la consola. Este método es útil cuando se solicita información confidencial como contraseñas:

```php
$password = $this->secret('What is the password?');
```

<a id="asking-for-confirmation"></a>
#### Pidiendo confirmación

Si necesita pedirle al usuario una simple confirmación de "sí o no", puede utilizar el método `confirm`. De forma predeterminada, este método devolverá `false`. Sin embargo, si el usuario ingresa `y` o `yes` en respuesta al mensaje, el método devolverá `true`.

```php
if ($this->confirm('Do you wish to continue?')) {
    // ...
}
```

Si es necesario, puede especificar que el mensaje de confirmación debe devolver `true` de forma predeterminada pasando `true` como segundo argumento del método `confirm`:

```php
if ($this->confirm('Do you wish to continue?', true)) {
    // ...
}
```

<a id="auto-completion"></a>
#### Autocompletar

El método `anticipate` se puede utilizar para proporcionar autocompletado de posibles opciones. El usuario aún puede proporcionar cualquier respuesta, independientemente de las sugerencias de autocompletar:

```php
$name = $this->anticipate('What is your name?', ['Taylor', 'Dayle']);
```

Alternativamente, puede pasar un cierre como segundo argumento del método `anticipate`. El cierre se llamará cada vez que el usuario escriba un carácter de entrada. El cierre debe aceptar un parámetro de cadena que contenga la entrada del usuario hasta el momento y devolver una serie de opciones para autocompletar:

```php
use App\Models\Address;

$name = $this->anticipate('What is your address?', function (string $input) {
    return Address::whereLike('name', "{$input}%")
        ->limit(5)
        ->pluck('name')
        ->all();
});
```

<a id="multiple-choice-questions"></a>
#### Preguntas de opción múltiple

Si necesita darle al usuario un conjunto predefinido de opciones al hacer una pregunta, puede usar el método `choice`. Puede establecer el índice de matriz del valor predeterminado que se devolverá si no se elige ninguna opción pasando el índice como tercer argumento del método:

```php
$name = $this->choice(
    'What is your name?',
    ['Taylor', 'Dayle'],
    $defaultIndex
);
```

Además, el método `choice` acepta argumentos cuarto y quinto opcionales para determinar el número máximo de intentos para seleccionar una respuesta válida y si se permiten selecciones múltiples:

```php
$name = $this->choice(
    'What is your name?',
    ['Taylor', 'Dayle'],
    $defaultIndex,
    $maxAttempts = null,
    $allowMultipleSelections = false
);
```

<a id="writing-output"></a>
### Escribir salida

Para enviar resultados a la consola, puede utilizar los métodos `line`, `newLine`, `info`, `comment`, `question`, `warn`, `alert` y `error`. Cada uno de estos métodos utilizará colores ANSI apropiados para su propósito. Por ejemplo, mostremos información general al usuario. Normalmente, el método `info` se mostrará en la consola como texto de color verde:

```php
/**
 * Execute the console command.
 */
public function handle(): void
{
    // ...

    $this->info('The command was successful!');
}
```

Para mostrar un mensaje de error, utilice el método `error`. El texto del mensaje de error normalmente se muestra en rojo:

```php
$this->error('Something went wrong!');
```

Puede utilizar el método `line` para mostrar texto sin formato y sin color:

```php
$this->line('Display this on the screen');
```

Puede utilizar el método `newLine` para mostrar una línea en blanco:

```php
// Write a single blank line...
$this->newLine();

// Write three blank lines...
$this->newLine(3);
```

<a id="tables"></a>
#### Tablas

El método `table` facilita el formato correcto de varias filas/columnas de datos. Todo lo que necesita hacer es proporcionar los nombres de las columnas y los datos de la tabla y Laravel calculará automáticamente el ancho y alto apropiados de la tabla para usted:

```php
use App\Models\User;

$this->table(
    ['Name', 'Email'],
    User::all(['name', 'email'])->toArray()
);
```

<a id="progress-bars"></a>
#### Barras de progreso

Para tareas de larga duración, puede resultar útil mostrar una barra de progreso que informe a los usuarios qué tan completa está la tarea. Usando el método `withProgressBar`, Laravel mostrará una barra de progreso y avanzará su progreso para cada iteración sobre un valor iterable dado:

```php
use App\Models\User;

$users = $this->withProgressBar(User::all(), function (User $user) {
    $this->performTask($user);
});
```

A veces, es posible que necesites más control manual sobre cómo avanza una barra de progreso. Primero, defina el número total de pasos que recorrerá el proceso. Luego, avance la barra de progreso después de procesar cada elemento:

```php
$users = App\Models\User::all();

$bar = $this->output->createProgressBar(count($users));

$bar->start();

foreach ($users as $user) {
    $this->performTask($user);

    $bar->advance();
}

$bar->finish();
```

> **Nota:**
> Para opciones más avanzadas, consulte la [documentación del componente de la barra de progreso de Symfony](https://symfony.com/doc/current/components/console/helpers/progressbar.html).

<a id="registering-commands"></a>
## Registrar comandos

De forma predeterminada, Laravel registra automáticamente todos los comandos dentro del directorio `app/Console/Commands`. Sin embargo, puede indicarle a Laravel que escanee otros directorios en busca de comandos Artisan usando el método `withCommands` en el archivo `bootstrap/app.php` de su aplicación:

```php
->withCommands([
    __DIR__.'/../app/Domain/Orders/Commands',
])
```

Si es necesario, también puede registrar comandos manualmente proporcionando el nombre de clase del comando al método `withCommands`:

```php
use App\Domain\Orders\Commands\SendEmails;

->withCommands([
    SendEmails::class,
])
```

Cuando Artisan arranca, todos los comandos de su aplicación serán resueltos por el [contenedor de servicio](../container/) y registrados con Artisan.

<a id="programmatically-executing-commands"></a>
## Ejecutar comandos mediante programación

A veces es posible que desee ejecutar un comando de Artisan fuera de la CLI. Por ejemplo, es posible que desee ejecutar un comando Artisan desde una ruta o controlador. Puede utilizar el método `call` en la fachada `Artisan` para lograr esto. El método `call` acepta el nombre de la firma del comando o el nombre de la clase como primer argumento y una matriz de parámetros del comando como segundo argumento. Se devolverá el código de salida:

```php
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

Route::post('/user/{user}/mail', function (string $user) {
    $exitCode = Artisan::call('mail:send', [
        'user' => $user, '--queue' => 'default'
    ]);

    // ...
});
```

Alternativamente, puedes pasar el comando Artisan completo al método `call` como una cadena:

```php
Artisan::call('mail:send 1 --queue=default');
```

<a id="passing-array-values"></a>
#### Pasar valores de matriz

Si su comando define una opción que acepta una matriz, puede pasar una matriz de valores a esa opción:

```php
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

Route::post('/mail', function () {
    $exitCode = Artisan::call('mail:send', [
        '--id' => [5, 13]
    ]);
});
```

<a id="passing-boolean-values"></a>
#### Pasar valores booleanos

Si necesita especificar el valor de una opción que no acepta valores de cadena, como el indicador `--force` en el comando `migrate:refresh`, debe pasar `true` o `false` como valor de la opción:

```php
$exitCode = Artisan::call('migrate:refresh', [
    '--force' => true,
]);
```

<a id="queueing-artisan-commands"></a>
#### Hacer cola con comandos artesanales

Usando el método `queue` en la fachada `Artisan`, incluso puede poner en cola los comandos de Artisan para que sus [trabajadores de la cola](../queues/) los procesen en segundo plano. Antes de usar este método, asegúrese de haber configurado su cola y de estar ejecutando un detector de cola:

```php
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

Route::post('/user/{user}/mail', function (string $user) {
    Artisan::queue('mail:send', [
        'user' => $user, '--queue' => 'default'
    ]);

    // ...
});
```

Usando los métodos `onConnection` y `onQueue`, puede especificar la conexión o cola a la que se debe enviar el comando Artisan:

```php
Artisan::queue('mail:send', [
    'user' => 1, '--queue' => 'default'
])->onConnection('redis')->onQueue('commands');
```

<a id="calling-commands-from-other-commands"></a>
### Llamar comandos desde otros comandos

A veces es posible que desees llamar a otros comandos desde un comando Artisan existente. Puede hacerlo utilizando el método `call`. Este método `call` acepta el nombre del comando y una serie de argumentos/opciones del comando:

```php
/**
 * Execute the console command.
 */
public function handle(): void
{
    $this->call('mail:send', [
        'user' => 1, '--queue' => 'default'
    ]);

    // ...
}
```

Si desea llamar a otro comando de la consola y suprimir toda su salida, puede utilizar el método `callSilently`. El método `callSilently` tiene la misma firma que el método `call`:

```php
$this->callSilently('mail:send', [
    'user' => 1, '--queue' => 'default'
]);
```

<a id="signal-handling"></a>
## Manejo de señales

Como sabrá, los sistemas operativos permiten enviar señales a procesos en ejecución. Por ejemplo, la señal `SIGTERM` es la forma en que los sistemas operativos solicitan a un programa que finalice correctamente. Si desea escuchar señales en los comandos de su consola Artisan y ejecutar código cuando ocurren, puede usar el método `trap`:

```php
/**
 * Execute the console command.
 */
public function handle(): void
{
    $this->trap(SIGTERM, fn () => $this->shouldKeepRunning = false);

    while ($this->shouldKeepRunning) {
        // ...
    }
}
```

Para escuchar varias señales a la vez, puede proporcionar una serie de señales al método `trap`:

```php
$this->trap([SIGTERM, SIGQUIT], function (int $signal) {
    $this->shouldKeepRunning = false;

    dump($signal); // SIGTERM / SIGQUIT
});
```

<a id="the-dev-command"></a>
## El comando de desarrollo

El comando `dev` Artisan inicia todos los procesos necesarios para el desarrollo local en una única ventana de terminal. De forma predeterminada, ejecuta simultáneamente el servidor de desarrollo PHP, un trabajador de cola, el seguimiento de registros a través de [Pail](../logging/#tailing-log-messages-using-pail) y la compilación de activos de Vite:

```shell
php artisan dev
```

Debajo del capó, el comando `dev` utiliza el paquete npm `@laravel/multiplex` para administrar los procesos, dando a cada proceso su propia pestaña con salida desplazable y con capacidad de búsqueda. Cada proceso está etiquetado y codificado por colores para que pueda distinguirlos fácilmente. Si un proceso falla, se reiniciará automáticamente y, cuando salga, toda la salida se escribirá nuevamente en su terminal para que no se pierda nada.

> **Nota:**
> El comando `dev` requiere el Nodo 22.13 o posterior. En Windows, recurre al paquete npm `concurrently` y la interfaz con pestañas no está disponible.

Los procesos predeterminados son:

| Nombre | Comando |
| --- | --- |
| `server` | `php artisan serve` |
| `queue` | `php artisan queue:listen --tries=1 --timeout=0` |
| `logs` | `php artisan pail --timeout=0` |
| `vite` | `npm run dev` |

> **Nota:**
> El proceso `vite` detecta automáticamente su administrador de paquetes de Node (npm, pnpm, Yarn o Bun) y utiliza el comando de ejecución apropiado.

<a id="customizing-dev-processes"></a>
### Personalización de procesos de desarrollo

Puede personalizar los procesos que ejecuta el comando `dev` utilizando la clase `DevCommands`, normalmente dentro del método `boot` del `AppServiceProvider` de su aplicación. El método `register` acepta una cadena de comando y un nombre opcional:

```php
use Illuminate\Foundation\DevCommands;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    DevCommands::register('some-command --flag', 'my-process');
}
```

Al registrar un comando Artisan, puede utilizar el método `artisan` que automáticamente antepone el comando con `php artisan`:

```php
DevCommands::artisan('horizon', 'horizon');
```

Del mismo modo, el método `node` antepone el comando con el comando de ejecución del administrador de paquetes detectado (por ejemplo, `npm run`), y el método `nodeExec` antepone el comando con el comando exec del administrador de paquetes (por ejemplo, `npx`):

```php
DevCommands::node('storybook', 'storybook');

DevCommands::nodeExec('tailwindcss -i resources/css/app.css -o public/css/app.css --watch', 'tailwind');
```

Si registra un proceso con el mismo nombre que un proceso predeterminado, su proceso reemplazará el predeterminado. Por ejemplo, puede personalizar el proceso del servidor para utilizar un puerto diferente:

```php
DevCommands::artisan('serve --host=localhost --port=9000', 'server');
```

También puedes personalizar el color de una etiqueta de proceso en tu terminal. Los métodos de color disponibles son `blue`, `purple`, `pink`, `orange`, `green` y `yellow`. También puedes pasar un color hexadecimal personalizado al método `color`:

```php
DevCommands::register('my-command', 'my-process')->green();

DevCommands::register('my-command', 'my-process')->color('#ff6347');
```

Para ver todos los procesos de desarrollo registrados sin iniciarlos, use el comando `dev:list`:

```shell
php artisan dev:list
```

<a id="restarting-failed-processes"></a>
#### Reiniciar procesos fallidos

Si un proceso falla, Laravel lo reiniciará después de un breve retraso, hasta cinco veces, antes de marcarlo como fallido. Un proceso que muere un segundo después del inicio no se reinicia, ya que probablemente nunca se inició exitosamente en primer lugar. Reiniciar un proceso manualmente con `r` reinicia el contador.

Puede desactivar este comportamiento para una sola ejecución utilizando la opción `--no-restart`:

```shell
php artisan dev --no-restart
```

O puede desactivarlo para toda su aplicación utilizando el método `disableAutoRestart`:

```php
DevCommands::disableAutoRestart();
```

<a id="filtering-dev-processes"></a>
### Filtrado de procesos de desarrollo

Puede indicarle al comando `dev` que solo ejecute procesos específicos cuando se invoque utilizando el método `only`. De manera similar, puede excluir procesos específicos utilizando el método `except`:

```php
// Only run the server and vite processes...
DevCommands::only('server', 'vite');

// Run all processes except the queue worker...
DevCommands::except('queue');
```

Puede excluir comandos registrados por paquetes o comandos predeterminados de Laravel usando los métodos `withoutVendorCommands` y `withoutDefaultCommands`:

```php
DevCommands::withoutVendorCommands();

DevCommands::withoutDefaultCommands();
```

<a id="stub-customization"></a>
## Personalización del código auxiliar

Los comandos `make` de la consola Artisan se utilizan para crear una variedad de clases, como controladores, trabajos, migraciones y pruebas. Estas clases se generan utilizando archivos "stub" que se completan con valores basados ​​en su entrada. Sin embargo, es posible que desee realizar pequeños cambios en los archivos generados por Artisan. Para lograr esto, puede usar el comando `stub:publish` para publicar los resguardos más comunes en su aplicación para poder personalizarlos:

```shell
php artisan stub:publish
```

Los resguardos publicados se ubicarán dentro del directorio `stubs` en la raíz de su aplicación. Cualquier cambio que realice en estos códigos auxiliares se reflejará cuando genere sus clases correspondientes utilizando los comandos `make` de Artisan.

<a id="events"></a>
## Eventos

Artisan envía tres eventos al ejecutar comandos: `Illuminate\Console\Events\ArtisanStarting`, `Illuminate\Console\Events\CommandStarting` y `Illuminate\Console\Events\CommandFinished`. El evento `ArtisanStarting` se envía inmediatamente cuando Artisan comienza a ejecutarse. A continuación, el evento `CommandStarting` se envía inmediatamente antes de que se ejecute un comando. Finalmente, el evento `CommandFinished` se envía una vez que termina de ejecutarse un comando.
