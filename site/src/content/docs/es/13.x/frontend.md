---
title: "Interfaz"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Usando PHP](#using-php)
    - [PHP y Blade](#php-and-blade)
    - [Livewire](#livewire)
    - [Kits de inicio](#php-starter-kits)
- [Usando React, Svelte o Vue](#using-react-svelte-or-vue)
    - [Inertia](#inertia)
    - [Kits de inicio](#inertia-starter-kits)
- [Agrupación de activos](#bundling-assets)

<a id="introduction"></a>
## Introducción

Laravel es un marco de backend que proporciona todas las funciones que necesita para crear aplicaciones web modernas, como [routing](../routing/), [validation](../validation/), [caching](../cache/), [queues](../queues/), [file Storage](../filesystem/) y más. Sin embargo, creemos que es importante ofrecer a los desarrolladores una hermosa experiencia completa, que incluya enfoques potentes para crear la interfaz de su aplicación.

Hay dos formas principales de abordar el desarrollo frontend al crear una aplicación con Laravel, y el enfoque que elija está determinado por si desea construir su interfaz aprovechando PHP o utilizando marcos de JavaScript como React, Svelte y Vue. Analizaremos ambas opciones a continuación para que pueda tomar una decisión informada sobre el mejor enfoque para el desarrollo frontend de su aplicación.

<a id="using-php"></a>
## Usando PHP

<a id="php-and-blade"></a>
### PHP y Blade

En el pasado, la mayoría de las aplicaciones PHP representaban HTML en el navegador utilizando plantillas HTML simples intercaladas con declaraciones PHP `echo` que representan datos que se recuperaron de una base de datos durante la solicitud:

```blade
<div>
    <?php foreach ($users as $user): ?>
        Hello, <?php echo $user->name; ?> <br />
    <?php endforeach; ?>
</div>
```

En Laravel, este enfoque para representar HTML aún se puede lograr usando [views](../views/) y [Blade](../blade/). Blade es un lenguaje de plantillas extremadamente liviano que proporciona una sintaxis corta y conveniente para mostrar datos, iterar sobre datos y más:

```blade
<div>
    @foreach ($users as $user)
        Hello, {{ $user->name }} <br />
    @endforeach
</div>
```

Al crear aplicaciones de esta manera, los envíos de formularios y otras interacciones con la página generalmente reciben un documento HTML completamente nuevo del servidor y el navegador vuelve a representar la página completa. Incluso hoy en día, muchas aplicaciones pueden ser perfectamente adecuadas para que sus interfaces se construyan de esta manera utilizando plantillas Blade simples.

<a id="growing-expectations"></a>
#### Expectativas crecientes

Sin embargo, a medida que las expectativas de los usuarios con respecto a las aplicaciones web han madurado, muchos desarrolladores han encontrado la necesidad de crear interfaces más dinámicas con interacciones que se sientan más pulidas. En vista de esto, algunos desarrolladores optan por comenzar a construir la interfaz de su aplicación utilizando marcos de JavaScript como React, Svelte y Vue.

Otros, que prefieren seguir con el lenguaje de backend con el que se sienten cómodos, han desarrollado soluciones que permiten la construcción de interfaces de usuario de aplicaciones web modernas sin dejar de utilizar principalmente el lenguaje de backend de su elección. Por ejemplo, en el ecosistema [Rails](https://rubyonrails.org/), esto ha estimulado la creación de bibliotecas como [Turbo](https://turbo.hotwired.dev/) [Hotwire](https://hotwired.dev/) y [Stimulus](https://stimulus.hotwired.dev/).

Dentro del ecosistema Laravel, la necesidad de crear interfaces modernas y dinámicas utilizando principalmente PHP ha llevado a la creación de [Laravel Livewire](https://livewire.laravel.com) y [Alpine.js](https://alpinejs.dev/).

<a id="livewire"></a>
### Livewire

[Laravel Livewire](https://livewire.laravel.com) es un marco para crear interfaces con tecnología Laravel que se sienten dinámicas, modernas y vivas al igual que las interfaces creadas con marcos de JavaScript modernos como React, Svelte y Vue.

Al utilizar Livewire, creará "componentes" de Livewire que representan una parte discreta de su interfaz de usuario y exponen métodos y datos que pueden invocarse e interactuar desde la interfaz de su aplicación. Por ejemplo, un componente "Contador" simple podría verse como el siguiente:

```php
<?php

use Livewire\Component;

new class extends Component
{
    public $count = 0;

    public function increment()
    {
        $this->count++;
    }
};
?>

<div>
    <button wire:click="increment">+</button>
    <h1>{{ $count }}</h1>
</div>

```

Como puede ver, Livewire le permite escribir nuevos atributos HTML como `wire:click` que conectan el frontend y el backend de su aplicación Laravel. Además, puede representar el estado actual de su componente utilizando expresiones Blade simples.

Para muchos, Livewire ha revolucionado el desarrollo frontend con Laravel, permitiéndoles permanecer dentro de la comodidad de Laravel mientras construyen aplicaciones web modernas y dinámicas. Normalmente, los desarrolladores que utilizan Livewire también utilizarán [Alpine.js](https://alpinejs.dev/) para "añadir" JavaScript en su interfaz sólo donde sea necesario, como para representar una ventana de diálogo.

Si eres nuevo en Laravel, te recomendamos que te familiarices con el uso básico de [views](../views/) y [Blade](../blade/). Luego, consulte la [documentación oficial de Laravel Livewire](https://livewire.laravel.com/docs) para aprender cómo llevar su aplicación al siguiente nivel con componentes interactivos de Livewire.

<a id="php-starter-kits"></a>
### Kits de inicio

Si desea crear su interfaz utilizando PHP y Livewire, puede aprovechar nuestro [kit de inicio Livewire](../starter-kits/) para impulsar el desarrollo de su aplicación.

<a id="using-react-svelte-or-vue"></a>
## Usando React, Svelte o Vue

Aunque es posible crear interfaces modernas utilizando Laravel y Livewire, muchos desarrolladores todavía prefieren aprovechar el poder de un marco de JavaScript como React, Svelte o Vue. Esto permite a los desarrolladores aprovechar el rico ecosistema de paquetes y herramientas de JavaScript disponibles a través de NPM.

Sin embargo, sin herramientas adicionales, combinar Laravel con React, Svelte o Vue nos dejaría con la necesidad de resolver una variedad de problemas complicados, como el enrutamiento del lado del cliente, la hidratación de datos y la autenticación. El enrutamiento del lado del cliente a menudo se simplifica mediante el uso de marcos obstinados de React/Svelte/Vue como [Next](https://nextjs.org/) y [Nuxt](https://nuxt.com/); sin embargo, la hidratación y la autenticación de datos siguen siendo problemas complicados y engorrosos de resolver al combinar un marco de backend como Laravel con estos marcos de frontend.

Además, los desarrolladores deben mantener dos repositorios de código separados y, a menudo, necesitan coordinar el mantenimiento, los lanzamientos y las implementaciones en ambos repositorios. Si bien estos problemas no son insuperables, no creemos que sea una forma productiva o agradable de desarrollar aplicaciones.

<a id="inertia"></a>
### Inertia

Afortunadamente, Laravel ofrece lo mejor de ambos mundos. [Inertia](https://inertiajs.com) cierra la brecha entre su aplicación Laravel y su interfaz moderna de React, Svelte o Vue, permitiéndole crear interfaces modernas y completas utilizando React, Svelte o Vue mientras aprovecha las rutas y controladores de Laravel para enrutamiento, hidratación de datos y autenticación, todo dentro de un único repositorio de código. Con este enfoque, puede disfrutar de todo el poder de Laravel y React/Svelte/Vue sin perjudicar las capacidades de ninguna de las herramientas.

Después de instalar Inertia en su aplicación Laravel, escribirá rutas y controladores como de costumbre. Sin embargo, en lugar de devolver una plantilla Blade de su controlador, devolverá una página de Inertia:

```php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Show the profile for a given user.
     */
    public function show(string $id): Response
    {
        return Inertia::render('users/show', [
            'user' => User::findOrFail($id)
        ]);
    }
}
```

Una página de Inertia corresponde a un componente React, Svelte o Vue, generalmente almacenado en el directorio `resources/js/pages` de su aplicación. Los datos proporcionados a la página mediante el método `Inertia::render` se utilizarán para hidratar los "accesorios" del componente de la página:

```jsx
import Layout from '@/layouts/authenticated';
import { Head } from '@inertiajs/react';

export default function Show({ user }) {
    return (
        <Layout>
            <Head title="Welcome" />
            <h1>Welcome</h1>
            <p>Hello {user.name}, welcome to Inertia.</p>
        </Layout>
    )
}
```

Como puede ver, Inertia le permite aprovechar todo el poder de React, Svelte o Vue al construir su interfaz, al tiempo que proporciona un puente liviano entre su backend con tecnología Laravel y su interfaz con JavaScript.

#### Representación del lado del servidor

Si le preocupa sumergirse en Inertia porque su aplicación requiere renderizado del lado del servidor, no se preocupe. Inertia ofrece [soporte de renderizado del lado del servidor](https://inertiajs.com/server-side-rendering). Y, al implementar su aplicación a través de [Laravel Cloud](https://cloud.laravel.com) o [Laravel Forge](https://forge.laravel.com), es muy sencillo garantizar que el proceso de renderizado del lado del servidor de Inertia esté siempre en ejecución.

<a id="inertia-starter-kits"></a>
### Kits de inicio

Si desea crear su interfaz utilizando Inertia y React/Svelte/Vue, puede aprovechar nuestros [kits de inicio de aplicaciones React, Svelte o Vue](../starter-kits/) para impulsar el desarrollo de su aplicación. Todos estos kits de inicio estructuran el flujo de autenticación de backend y frontend de su aplicación utilizando Inertia, React / Svelte / Vue, [Tailwind](https://tailwindcss.com) y [Vite](https://vitejs.dev) para que pueda comenzar a construir su próxima gran idea.

<a id="bundling-assets"></a>
## Agrupación de activos

Independientemente de si elige desarrollar su interfaz utilizando Blade y Livewire o React/Svelte/Vue e Inertia, probablemente necesitará agrupar el CSS de su aplicación en activos listos para producción. Por supuesto, si elige crear la interfaz de su aplicación con React, Svelte o Vue, también deberá agrupar sus componentes en activos JavaScript listos para el navegador.

De forma predeterminada, Laravel utiliza [Vite](https://vitejs.dev) para agrupar sus activos. Vite proporciona tiempos de construcción ultrarrápidos y reemplazo de módulo en caliente (HMR) casi instantáneo durante el desarrollo local. En todas las aplicaciones nuevas de Laravel, incluidas aquellas que utilizan nuestros [kits de inicio](../starter-kits/), encontrará un archivo `vite.config.js` que carga nuestro complemento liviano Laravel Vite que hace que sea un placer usar Vite con aplicaciones Laravel.

La forma más rápida de comenzar con Laravel y Vite es comenzar el desarrollo de su aplicación utilizando [nuestros kits de inicio de aplicaciones](../starter-kits/), que ponen en marcha su aplicación al proporcionar un andamiaje de autenticación de frontend y backend.

> **Nota:**
> Para obtener documentación más detallada sobre el uso de Vite con Laravel, consulte nuestra [documentación dedicada sobre cómo agrupar y compilar sus activos](../vite/).
