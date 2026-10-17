---
title: "Kits de inicio"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Creación de una aplicación utilizando un kit de inicio](#creating-an-application)
- [Kits de inicio disponibles](#available-starter-kits)
    - [React](#react)
    - [Svelte](#svelte)
    - [Vue](#vue)
    - [Livewire](#livewire)
- [Personalización del kit de inicio](#starter-kit-customization)
    - [React](#react-customization)
    - [Svelte](#svelte-customization)
    - [Vue](#vue-customization)
    - [Livewire](#livewire-customization)
- [Autenticación](#authentication)
    - [Activación y desactivación de funciones](#enabling-and-disabling-features)
    - [Personalizar la creación de usuarios y el restablecimiento de contraseña](#customizing-actions)
    - [Autenticación de dos factores](#two-factor-authentication)
    - [Limitación de velocidad](#rate-limiting)
- [Equipos](#teams)
- [Autenticación de WorkOS AuthKit](#workos)
    - [Configuración de su kit de inicio de WorkOS](#configuring-your-workos-starter-kit)
- [Inertia SSR](#inertia-ssr)
- [Kits de inicio mantenidos por la comunidad](#community-maintained-starter-kits)
- [Preguntas frecuentes](#faqs)

<a id="introduction"></a>
## Introducción

Para darle una ventaja en la creación de su nueva aplicación Laravel, nos complace ofrecerle [kits de inicio de aplicaciones](https://laravel.com/starter-kits). Estos kits de inicio le brindan una ventaja en la creación de su próxima aplicación Laravel e incluyen las rutas, controladores y vistas que necesita para registrar y autenticar a los usuarios de su aplicación. Los kits de inicio utilizan [Laravel Fortify](../fortify/) para proporcionar autenticación.

Si bien puede utilizar estos kits de inicio, no son obligatorios. Eres libre de crear tu propia aplicación desde cero simplemente instalando una copia nueva de Laravel. De cualquier manera, ¡sabemos que construirás algo grandioso!

<a id="creating-an-application"></a>
## Creación de una aplicación utilizando un kit de inicio

Para crear una nueva aplicación Laravel usando uno de nuestros kits de inicio, primero debe [instalar PHP y la herramienta CLI de Laravel](../installation/#installing-php). Si ya tiene PHP y Composer instalados, puede instalar la herramienta CLI del instalador de Laravel a través de Composer:

```shell
composer global require laravel/installer
```

Luego, cree una nueva aplicación Laravel utilizando la CLI del instalador de Laravel. El instalador de Laravel le pedirá que seleccione su kit de inicio preferido:

```shell
laravel new my-app
```

Después de crear su aplicación Laravel, solo necesita instalar sus dependencias frontend a través de NPM e iniciar el servidor de desarrollo Laravel:

```shell
cd my-app
npm install && npm run build
composer run dev
```

Una vez que haya iniciado el servidor de desarrollo Laravel, podrá acceder a su aplicación en su navegador web en [http://localhost:8000](http://localhost:8000).

<a id="available-starter-kits"></a>
## Kits de inicio disponibles

<a id="react"></a>
### React

Nuestro kit de inicio React proporciona un punto de partida robusto y moderno para crear aplicaciones Laravel con una interfaz React usando [Inertia](https://inertiajs.com).

Inertia le permite crear aplicaciones React modernas de una sola página utilizando controladores y enrutamiento clásicos del lado del servidor. Esto le permite disfrutar del poder del frontend de React combinado con la increíble productividad del backend de Laravel y la compilación ultrarrápida de Vite.

El kit de inicio de React utiliza React 19, TypeScript, Tailwind y la biblioteca de componentes [shadcn/ui](https://ui.shadcn.com).

<a id="svelte"></a>
### Svelte

Nuestro kit de inicio Svelte proporciona un punto de partida robusto y moderno para crear aplicaciones Laravel con una interfaz Svelte usando [Inertia](https://inertiajs.com).

Inertia le permite crear aplicaciones Svelte modernas de una sola página utilizando controladores y enrutamiento clásicos del lado del servidor. Esto le permite disfrutar del poder frontend de Svelte combinado con la increíble productividad backend de Laravel y la compilación ultrarrápida de Vite.

El kit de inicio de Svelte utiliza Svelte 5, TypeScript, Tailwind y la biblioteca de componentes [shadcn-svelte](https://www.shadcn-svelte.com/).

<a id="vue"></a>
### Vue

Nuestro kit de inicio de Vue proporciona un excelente punto de partida para crear aplicaciones Laravel con una interfaz Vue usando [Inertia](https://inertiajs.com).

Inertia le permite crear aplicaciones Vue modernas de una sola página utilizando controladores y enrutamiento clásicos del lado del servidor. Esto le permite disfrutar del poder del frontend de Vue combinado con la increíble productividad del backend de Laravel y la compilación ultrarrápida de Vite.

El kit de inicio de Vue utiliza la API de composición de Vue, TypeScript, Tailwind y la biblioteca de componentes [shadcn-vue](https://www.shadcn-vue.com/).

<a id="livewire"></a>
### Livewire

Nuestro kit de inicio Livewire proporciona el punto de partida perfecto para crear aplicaciones Laravel con una interfaz [Laravel Livewire](https://livewire.laravel.com).

Livewire es una forma poderosa de crear interfaces de usuario dinámicas y reactivas usando solo PHP. Es ideal para equipos que utilizan principalmente plantillas Blade y buscan una alternativa más simple a los marcos SPA basados ​​en JavaScript como React, Svelte y Vue.

El kit de inicio Livewire utiliza Livewire, Tailwind y la biblioteca de componentes [Flux UI](https://fluxui.dev).

<a id="starter-kit-customization"></a>
## Personalización del kit de inicio

<a id="react-customization"></a>
### React

Nuestro kit inicial de React está construido con Inertia 3, React 19, Tailwind 4 y [shadcn/ui](https://ui.shadcn.com). Al igual que con todos nuestros kits de inicio, todo el código de backend y frontend existe dentro de su aplicación para permitir una personalización completa.

La mayor parte del código de interfaz se encuentra en el directorio `resources/js`. Eres libre de modificar cualquier código para personalizar la apariencia y el comportamiento de tu aplicación:

```text
resources/js/
├── components/    # Reusable React components
├── hooks/         # React hooks
├── layouts/       # Application layouts
├── lib/           # Utility functions and configuration
├── pages/         # Page components
└── types/         # TypeScript definitions
```

Para publicar componentes shadcn adicionales, primero [busque el componente que desea publicar](https://ui.shadcn.com). Luego, publique el componente usando `npx`:

```shell
npx shadcn@latest add switch
```

En este ejemplo, el comando publicará el componente Switch en `resources/js/components/ui/switch.tsx`. Una vez publicado el componente, podrás utilizarlo en cualquiera de tus páginas:

```jsx
import { Switch } from "@/components/ui/switch"

const MyPage = () => {
  return (
    <div>
      <Switch />
    </div>
  );
};

export default MyPage;
```

<a id="react-available-layouts"></a>
#### Diseños disponibles

El kit de inicio de React incluye dos diseños principales diferentes entre los que puede elegir: un diseño de "barra lateral" y un diseño de "encabezado". El diseño de la barra lateral es el predeterminado, pero puede cambiar al diseño del encabezado modificando el diseño que se importa en la parte superior del archivo `resources/js/layouts/app-layout.tsx` de su aplicación:

```js
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout'; // [tl! remove]
import AppLayoutTemplate from '@/layouts/app/app-header-layout'; // [tl! add]
```

<a id="react-sidebar-variants"></a>
#### Variantes de la barra lateral

El diseño de la barra lateral incluye tres variantes diferentes: la variante de barra lateral predeterminada, la variante "insertada" y la variante "flotante". Puedes elegir la variante que más te guste modificando el componente `resources/js/components/app-sidebar.tsx`:

```text
<Sidebar collapsible="icon" variant="sidebar"> [tl! remove]
<Sidebar collapsible="icon" variant="inset"> [tl! add]
```

<a id="react-authentication-page-layout-variants"></a>
#### Variantes de diseño de página de autenticación

Las páginas de autenticación incluidas con el kit de inicio de React, como la página de inicio de sesión y la página de registro, también ofrecen tres variantes de diseño diferentes: "simple", "tarjeta" y "dividida".

Para cambiar su diseño de autenticación, modifique el diseño que se importa en la parte superior del archivo `resources/js/layouts/auth-layout.tsx` de su aplicación:

```js
import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout'; // [tl! remove]
import AuthLayoutTemplate from '@/layouts/auth/auth-split-layout'; // [tl! add]
```

<a id="svelte-customization"></a>
### Svelte

Nuestro kit de inicio Svelte está construido con Inertia 3, Svelte 5, Tailwind y [shadcn-svelte](https://www.shadcn-svelte.com/). Al igual que con todos nuestros kits de inicio, todo el código de backend y frontend existe dentro de su aplicación para permitir una personalización completa.

La mayor parte del código de interfaz se encuentra en el directorio `resources/js`. Eres libre de modificar cualquier código para personalizar la apariencia y el comportamiento de tu aplicación:

```text
resources/js/
├── components/    # Reusable Svelte components
├── layouts/       # Application layouts
├── lib/           # Utility functions and configuration and Svelte rune modules
├── pages/         # Page components
└── types/         # TypeScript definitions
```

Para publicar componentes shadcn-svelte adicionales, primero [busque el componente que desea publicar](https://www.shadcn-svelte.com). Luego, publique el componente usando `npx`:

```shell
npx shadcn-svelte@latest add switch
```

En este ejemplo, el comando publicará el componente Switch en `resources/js/components/ui/switch/switch.svelte`. Una vez publicado el componente, podrás utilizarlo en cualquiera de tus páginas:

```svelte
<script lang="ts">
    import { Switch } from '@/components/ui/switch'
</script>

<div>
    <Switch />
</div>
```

<a id="svelte-available-layouts"></a>
#### Diseños disponibles

El kit inicial de Svelte incluye dos diseños principales diferentes entre los que puede elegir: un diseño de "barra lateral" y un diseño de "encabezado". El diseño de la barra lateral es el predeterminado, pero puede cambiar al diseño del encabezado modificando el diseño que se importa en la parte superior del archivo `resources/js/layouts/AppLayout.svelte` de su aplicación:

```js
import AppLayout from '@/layouts/app/AppSidebarLayout.svelte'; // [tl! remove]
import AppLayout from '@/layouts/app/AppHeaderLayout.svelte'; // [tl! add]
```

<a id="svelte-sidebar-variants"></a>
#### Variantes de la barra lateral

El diseño de la barra lateral incluye tres variantes diferentes: la variante de barra lateral predeterminada, la variante "insertada" y la variante "flotante". Puedes elegir la variante que más te guste modificando el componente `resources/js/components/AppSidebar.svelte`:

```text
<Sidebar collapsible="icon" variant="sidebar"> [tl! remove]
<Sidebar collapsible="icon" variant="inset"> [tl! add]
```

<a id="svelte-authentication-page-layout-variants"></a>
#### Variantes de diseño de página de autenticación

Las páginas de autenticación incluidas con el kit de inicio de Svelte, como la página de inicio de sesión y la página de registro, también ofrecen tres variantes de diseño diferentes: "simple", "tarjeta" y "dividida".

Para cambiar su diseño de autenticación, modifique el diseño que se importa en la parte superior del archivo `resources/js/layouts/AuthLayout.svelte` de su aplicación:

```js
import AuthLayout from '@/layouts/auth/AuthSimpleLayout.svelte'; // [tl! remove]
import AuthLayout from '@/layouts/auth/AuthSplitLayout.svelte'; // [tl! add]
```

<a id="vue-customization"></a>
### Vue

Nuestro kit de inicio de Vue está construido con Inertia 3, Vue 3 Composition API, Tailwind y [shadcn-vue](https://www.shadcn-vue.com/). Al igual que con todos nuestros kits de inicio, todo el código de backend y frontend existe dentro de su aplicación para permitir una personalización completa.

La mayor parte del código de interfaz se encuentra en el directorio `resources/js`. Eres libre de modificar cualquier código para personalizar la apariencia y el comportamiento de tu aplicación:

```text
resources/js/
├── components/    # Reusable Vue components
├── composables/   # Vue composables / hooks
├── layouts/       # Application layouts
├── lib/           # Utility functions and configuration
├── pages/         # Page components
└── types/         # TypeScript definitions
```

Para publicar componentes shadcn-vue adicionales, primero [busque el componente que desea publicar](https://www.shadcn-vue.com). Luego, publique el componente usando `npx`:

```shell
npx shadcn-vue@latest add switch
```

En este ejemplo, el comando publicará el componente Switch en `resources/js/components/ui/Switch.vue`. Una vez publicado el componente, podrás utilizarlo en cualquiera de tus páginas:

```vue
<script setup lang="ts">
import { Switch } from '@/components/ui/switch'
</script>

<template>
    <div>
        <Switch />
    </div>
</template>
```

<a id="vue-available-layouts"></a>
#### Diseños disponibles

El kit de inicio de Vue incluye dos diseños principales diferentes entre los que puede elegir: un diseño de "barra lateral" y un diseño de "encabezado". El diseño de la barra lateral es el predeterminado, pero puede cambiar al diseño del encabezado modificando el diseño que se importa en la parte superior del archivo `resources/js/layouts/AppLayout.vue` de su aplicación:

```js
import AppLayout from '@/layouts/app/AppSidebarLayout.vue'; // [tl! remove]
import AppLayout from '@/layouts/app/AppHeaderLayout.vue'; // [tl! add]
```

<a id="vue-sidebar-variants"></a>
#### Variantes de la barra lateral

El diseño de la barra lateral incluye tres variantes diferentes: la variante de barra lateral predeterminada, la variante "insertada" y la variante "flotante". Puedes elegir la variante que más te guste modificando el componente `resources/js/components/AppSidebar.vue`:

```text
<Sidebar collapsible="icon" variant="sidebar"> [tl! remove]
<Sidebar collapsible="icon" variant="inset"> [tl! add]
```

<a id="vue-authentication-page-layout-variants"></a>
#### Variantes de diseño de página de autenticación

Las páginas de autenticación incluidas con el kit de inicio de Vue, como la página de inicio de sesión y la página de registro, también ofrecen tres variantes de diseño diferentes: "simple", "tarjeta" y "dividida".

Para cambiar su diseño de autenticación, modifique el diseño que se importa en la parte superior del archivo `resources/js/layouts/AuthLayout.vue` de su aplicación:

```js
import AuthLayout from '@/layouts/auth/AuthSimpleLayout.vue'; // [tl! remove]
import AuthLayout from '@/layouts/auth/AuthSplitLayout.vue'; // [tl! add]
```

<a id="livewire-customization"></a>
### Livewire

Nuestro kit de inicio Livewire está construido con Livewire 4, Tailwind y [Flux UI](https://fluxui.dev/). Al igual que con todos nuestros kits de inicio, todo el código de backend y frontend existe dentro de su aplicación para permitir una personalización completa.

La mayor parte del código de interfaz se encuentra en el directorio `resources/views`. Eres libre de modificar cualquier código para personalizar la apariencia y el comportamiento de tu aplicación:

```text
resources/views
├── components            # Reusable components
├── flux                  # Customized Flux components
├── layouts               # Application layouts
├── pages                 # Livewire pages
├── partials              # Reusable Blade partials
├── dashboard.blade.php   # Authenticated user dashboard
├── welcome.blade.php     # Guest user welcome page
```

<a id="livewire-available-layouts"></a>
#### Diseños disponibles

El kit inicial de Livewire incluye dos diseños principales diferentes entre los que puede elegir: un diseño de "barra lateral" y un diseño de "encabezado". El diseño de la barra lateral es el predeterminado, pero puede cambiar al diseño del encabezado modificando el diseño que utiliza el archivo `resources/views/layouts/app.blade.php` de su aplicación. Además, debes agregar el atributo `container` al componente principal de Flux:

```blade
<x-layouts::app.header>
    <flux:main container>
        {{ $slot }}
    </flux:main>
</x-layouts::app.header>
```

<a id="livewire-authentication-page-layout-variants"></a>
#### Variantes de diseño de página de autenticación

Las páginas de autenticación incluidas con el kit de inicio de Livewire, como la página de inicio de sesión y la página de registro, también ofrecen tres variantes de diseño diferentes: "simple", "tarjeta" y "dividida".

Para cambiar su diseño de autenticación, modifique el diseño que utiliza el archivo `resources/views/layouts/auth.blade.php` de su aplicación:

```blade
<x-layouts::auth.split>
    {{ $slot }}
</x-layouts::auth.split>
```

<a id="authentication"></a>
## Autenticación

Todos los kits de inicio utilizan [Laravel Fortify](../fortify/) para manejar la autenticación. Fortify proporciona rutas, controladores y lógica para iniciar sesión, registrarse, restablecer contraseñas, verificar correos electrónicos y más.

Fortify registra automáticamente las siguientes rutas de autenticación según las funciones habilitadas en el archivo de configuración `config/fortify.php` de su aplicación:

<div class="overflow-auto">

| Ruta | Método | Descripción |
| ---------------------------------- | ------ | ----------------------------------- |
| `/login` | `GET` | Mostrar formulario de inicio de sesión |
| `/login` | `POST` | Autenticar usuario |
| `/logout` | `POST` | Cerrar sesión de usuario |
| `/register` | `GET` | Mostrar formulario de registro |
| `/register` | `POST` | Crear nuevo usuario |
| `/forgot-password` | `GET` | Mostrar formulario de solicitud de restablecimiento de contraseña |
| `/forgot-password` | `POST` | Enviar enlace para restablecer contraseña |
| `/reset-password/{token}` | `GET` | Mostrar formulario de restablecimiento de contraseña |
| `/reset-password` | `POST` | Actualizar contraseña |
| `/email/verify` | `GET` | Mostrar aviso de verificación de correo electrónico |
| `/email/verify/{id}/{hash}` | `GET` | Verificar dirección de correo electrónico |
| `/email/verification-notification` | `POST` | Reenviar correo electrónico de verificación |
| `/user/confirm-password` | `GET` | Mostrar formulario de confirmación de contraseña |
| `/user/confirm-password` | `POST` | Confirmar contraseña |
| `/two-factor-challenge` | `GET` | Mostrar formulario de desafío 2FA |
| `/two-factor-challenge` | `POST` | Verificar código 2FA |

</div>

El comando `php artisan route:list` Artisan se puede utilizar para mostrar todas las rutas en su aplicación.

<a id="enabling-and-disabling-features"></a>
### Activación y desactivación de funciones

Puede controlar qué funciones de Fortify están habilitadas en el archivo de configuración `config/fortify.php` de su aplicación:

```php
use Laravel\Fortify\Features;

'features' => [
    Features::registration(),
    Features::resetPasswords(),
    Features::emailVerification(),
    Features::twoFactorAuthentication([
        'confirm' => true,
        'confirmPassword' => true,
    ]),
],
```

Para deshabilitar una función, comente o elimine esa entrada de función de la matriz `features`. Por ejemplo, elimine `Features::registration()` para desactivar el registro público.

Cuando utilice los kits de inicio [React](#react), [Svelte](#svelte) o [Vue](#vue)], también deberá eliminar cualquier referencia a las rutas de la función deshabilitada en su código de interfaz. Por ejemplo, si desactiva la verificación por correo electrónico, debe eliminar las importaciones y referencias a las rutas `verification` en sus componentes React, Svelte o Vue. Esto es necesario porque estos kits de inicio utilizan Wayfinder para enrutamiento con seguridad de tipos, que genera definiciones de ruta en el momento de la compilación. Si hace referencia a rutas que ya no existen, su aplicación no podrá compilarse.

<a id="customizing-actions"></a>
### Personalización de la creación de usuarios y el restablecimiento de contraseñas

Cuando un usuario registra o restablece su contraseña, Fortify invoca clases de acción ubicadas en el directorio `app/Actions/Fortify` de su aplicación:

<div class="overflow-auto">

| Archivo | Descripción |
| ----------------------- | ------------------------------- |
| `CreateNewUser.php` | Valida y crea nuevos usuarios |
| `ResetUserPassword.php` | Valida y actualiza las contraseñas de los usuarios |
| `PasswordValidationRules.php` | Define reglas de validación de contraseñas |

</div>

Por ejemplo, para personalizar la lógica de registro de su aplicación, debe editar la acción `CreateNewUser`:

```php
public function create(array $input): User
{
    Validator::make($input, [
        'name' => ['required', 'string', 'max:255'],
        'email' => ['required', 'email', 'max:255', 'unique:users'],
        'phone' => ['required', 'string', 'max:20'], // [tl! add]
        'password' => $this->passwordRules(),
    ])->validate();

    return User::create([
        'name' => $input['name'],
        'email' => $input['email'],
        'phone' => $input['phone'], // [tl! add]
        'password' => Hash::make($input['password']),
    ]);
}
```

<a id="two-factor-authentication"></a>
### Autenticación de dos factores

Los kits de inicio incluyen autenticación de dos factores (2FA) integrada, lo que permite a los usuarios proteger sus cuentas utilizando cualquier aplicación de autenticación compatible con TOTP. 2FA está habilitado de forma predeterminada a través de `Features::twoFactorAuthentication()` en el archivo de configuración `config/fortify.php` de su aplicación.

La opción `confirm` requiere que los usuarios verifiquen un código antes de que 2FA esté completamente habilitado, mientras que `confirmPassword` requiere confirmación de contraseña antes de habilitar o deshabilitar 2FA. Para obtener más detalles, consulte la [documentación de autenticación de dos factores de Fortify](../fortify/#two-factor-authentication).

<a id="rate-limiting"></a>
### Limitación de velocidad

La limitación de velocidad evita que la fuerza bruta y los repetidos intentos de inicio de sesión abrumen sus puntos finales de autenticación. Puede personalizar el comportamiento de limitación de velocidad de Fortify en el `FortifyServiceProvider` de su aplicación:

```php
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Cache\RateLimiting\Limit;

RateLimiter::for('login', function ($request) {
    return Limit::perMinute(5)->by($request->email.$request->ip());
});
```

<a id="teams"></a>
## Equipos

Los kits de inicio React, Svelte, Vue y Livewire también se pueden generar con el apoyo del equipo. Cuando la función de equipos está habilitada, cada usuario pertenece a uno o más equipos y tiene un equipo actual. Durante el registro, los nuevos usuarios reciben automáticamente un equipo personal. Los kits de inicio también incluyen pantallas de administración de equipos para crear equipos, cambiar entre equipos, invitar miembros y actualizar los detalles del equipo.

Cuando una ruta tiene como alcance el equipo actual, el slug del equipo actual se incluye en la URL. Por ejemplo, la ruta del panel se convierte en `/{current_team}/dashboard`, mientras que las páginas de administración del equipo utilizan rutas como `settings/teams/{team}`. Cuando se utilizan los parámetros de ruta `{current_team}` y `{team}`, los kits de inicio garantizan automáticamente que el usuario autenticado pertenezca al equipo solicitado antes de permitir el acceso a la ruta.

Para que la generación de URL compatibles con el equipo sea más conveniente, los kits de inicio registran las URL predeterminadas para el equipo actual del usuario autenticado. Esto permite que las llamadas a ayudantes como `route('dashboard')` incluyan automáticamente el slug del equipo actual. Cuando un usuario inicia sesión, se registra o cambia de equipo, los kits de inicio actualizan el equipo actual y actualizan estos valores predeterminados de URL para que los enlaces generados sigan usando el contexto de equipo correcto.

Al crear o cambiar el nombre de un equipo, los kits de inicio también evitan que los usuarios elijan nombres reservados que podrían producir segmentos de ruta inseguros o conflictivos. Por ejemplo, no se pueden utilizar nombres que colisionen con prefijos de ruta como `settings`, `login` o `dashboard`.

<a id="workos"></a>
## Autenticación de WorkOS AuthKit

De forma predeterminada, los kits de inicio React, Svelte, Vue y Livewire utilizan el sistema de autenticación integrado de Laravel para ofrecer inicio de sesión, registro, restablecimiento de contraseña, verificación de correo electrónico y más. Además, también ofrecemos una variante potenciada [WorkOS AuthKit](https://authkit.com) de cada kit de inicio que ofrece:

<div class="content-list" markdown="1">

- Autenticación social (Google, Microsoft, GitHub y Apple)
- Autenticación de clave de acceso
- "Magic Auth" basada en correo electrónico
- SSO

</div>

Usar WorkOS como proveedor de autenticación [requiere una cuenta de WorkOS](https://workos.com). WorkOS ofrece autenticación gratuita para aplicaciones de hasta 1 millón de usuarios activos mensuales.

Para utilizar WorkOS AuthKit como proveedor de autenticación de su aplicación, seleccione la opción WorkOS al crear su nueva aplicación con el kit de inicio a través de `laravel new`.

<a id="configuring-your-workos-starter-kit"></a>
### Configuración de su kit de inicio de WorkOS

Después de crear una nueva aplicación utilizando un kit de inicio con tecnología WorkOS, debe configurar las variables de entorno `WORKOS_CLIENT_ID`, `WORKOS_API_KEY` y `WORKOS_REDIRECT_URL` en el archivo `.env` de su aplicación. Estas variables deben coincidir con los valores proporcionados en el panel de WorkOS para su aplicación:

```ini
WORKOS_CLIENT_ID=your-client-id
WORKOS_API_KEY=your-api-key
WORKOS_REDIRECT_URL="${APP_URL}/authenticate"
```

Además, debe configurar la URL de la página de inicio de la aplicación en su panel de WorkOS. Esta URL es donde los usuarios serán redirigidos después de cerrar sesión en su aplicación.

<a id="configuring-authkit-authentication-methods"></a>
#### Configuración de métodos de autenticación AuthKit

Cuando utilice un kit de inicio con tecnología WorkOS, le recomendamos que deshabilite la autenticación "Correo electrónico + Contraseña" dentro de los ajustes de configuración de WorkOS AuthKit de su aplicación, lo que permite a los usuarios autenticarse solo a través de proveedores de autenticación social, claves de acceso, "Magic Auth" y SSO. Esto permite que su aplicación evite por completo el manejo de contraseñas de usuario.

<a id="configuring-authkit-session-timeouts"></a>
#### Configuración de tiempos de espera de sesión de AuthKit

Además, le recomendamos que configure el tiempo de espera de inactividad de su sesión de WorkOS AuthKit para que coincida con el umbral de tiempo de espera de sesión configurado de su aplicación Laravel, que normalmente es de dos horas.

<a id="inertia-ssr"></a>
### Inertia SSR

Los kits de inicio React, Svelte y Vue son compatibles con las capacidades de renderizado del lado del servidor ](https://inertiajs.com/server-side-rendering) de Inertia. Para crear un paquete compatible con Inertia SSR para su aplicación, ejecute el comando `build:ssr`:

```shell
npm run build:ssr
```

Para mayor comodidad, también está disponible un comando `composer dev:ssr`. Este comando iniciará el servidor de desarrollo Laravel y el servidor Inertia SSR después de crear un paquete compatible con SSR para su aplicación, lo que le permitirá probar su aplicación localmente usando el motor de renderizado del lado del servidor de Inertia:

```shell
composer dev:ssr
```

<a id="community-maintained-starter-kits"></a>
### Kits de inicio mantenidos por la comunidad

Al crear una nueva aplicación Laravel usando el instalador de Laravel, puede proporcionar cualquier kit de inicio mantenido por la comunidad disponible en Packagist en el indicador `--using`:

```shell
laravel new my-app --using=example/starter-kit
```

<a id="creating-starter-kits"></a>
#### Creación de kits de inicio

Para garantizar que su kit de inicio esté disponible para otros, deberá publicarlo en [Packagist](https://packagist.org). Su kit de inicio debe definir las variables de entorno requeridas en su archivo `.env.example`, y todos los comandos posteriores a la instalación necesarios deben aparecer en la matriz `post-create-project-cmd` del archivo `composer.json` del kit de inicio.

<a id="faqs"></a>
### Preguntas frecuentes

<a id="faq-upgrade"></a>
#### ¿Cómo actualizo?

Cada kit de inicio le brinda un punto de partida sólido para su próxima aplicación. Con la propiedad total del código, puede modificar, personalizar y crear su aplicación exactamente como la imagina. Sin embargo, no es necesario actualizar el kit de inicio.

<a id="faq-enable-email-verification"></a>
#### ¿Cómo habilito la verificación por correo electrónico?

Se puede agregar verificación por correo electrónico descomentando la importación `MustVerifyEmail` en su modelo `App/Models/User.php` y asegurándose de que el modelo implemente la interfaz `MustVerifyEmail`:

```php
<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
// ...

class User extends Authenticatable implements MustVerifyEmail
{
    // ...
}
```

Después del registro, los usuarios recibirán un correo electrónico de verificación. Para restringir el acceso a ciertas rutas hasta que se verifique la dirección de correo electrónico del usuario, agregue el middleware `verified` a las rutas:

```php
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});
```

> **Nota:**
> No se requiere verificación por correo electrónico cuando se utiliza la [variante WorkOS](#workos) de los kits de inicio.

<a id="faq-modify-email-template"></a>
#### ¿Cómo modifico la plantilla de correo electrónico predeterminada?

Es posible que desee personalizar la plantilla de correo electrónico predeterminada para alinearla mejor con la marca de su aplicación. Para modificar esta plantilla, debe publicar las vistas de correo electrónico en su aplicación con el siguiente comando:

```shell
php artisan vendor:publish --tag=laravel-mail
```

Esto generará varios archivos en `resources/views/vendor/mail`. Puede modificar cualquiera de estos archivos, así como el archivo `resources/views/vendor/mail/themes/default.css` para cambiar la apariencia de la plantilla de correo electrónico predeterminada.
