---
title: "Cajero Laravel (Pala)"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Actualización de Cajero](#upgrading-cashier)
- [Instalación](#installation)
    - [Pala Sandbox](#paddle-sandbox)
- [Configuración](#configuration)
    - [Modelo facturable](#billable-model)
    - [Claves API](#api-keys)
    - [Remo JS](#paddle-js)
    - [Configuración de moneda](#currency-configuration)
    - [Anulación de modelos predeterminados](#overriding-default-models)
- [Inicio rápido](#quickstart)
    - [Venta de Productos](#quickstart-selling-products)
    - [Venta de suscripciones](#quickstart-selling-subscriptions)
- [Sesiones de pago](#checkout-sessions)
    - [Superposición de pago](#overlay-checkout)
    - [Pago en línea](#inline-checkout)
    - [Pagos de invitados](#guest-checkouts)
- [Vistas previas de precios](#price-previews)
    - [Vistas previas de precios para el cliente](#customer-price-previews)
    - [Descuentos](#price-discounts)
- [Clientes](#customers)
    - [Valores predeterminados del cliente](#customer-defaults)
    - [Recuperando Clientes](#retrieving-customers)
    - [Creando Clientes](#creating-customers)
- [Suscripciones](#subscriptions)
    - [Creando suscripciones](#creating-subscriptions)
    - [Comprobación del estado de la suscripción](#checking-subscription-status)
    - [Cargos únicos de suscripción](#subscription-single-charges)
    - [Actualización de información de pago](#updating-payment-information)
    - [Cambiando de planes](#changing-plans)
    - [Cantidad de suscripción](#subscription-quantity)
    - [Suscripciones con múltiples productos](#subscriptions-with-multiple-products)
    - [Suscripciones múltiples](#multiple-subscriptions)
    - [Pausar suscripciones](#pausing-subscriptions)
    - [Cancelación de suscripciones](#canceling-subscriptions)
- [Pruebas de suscripción](#subscription-trials)
    - [Con método de pago por adelantado](#with-payment-method-up-front)
    - [Sin método de pago por adelantado](#without-payment-method-up-front)
    - [Extender o activar una prueba](#extend-or-activate-a-trial)
- [Manejo de ganchos web de paleta](#handling-paddle-webhooks)
    - [Definición de controladores de eventos de webhook](#defining-webhook-event-handlers)
    - [Verificación de firmas de webhook](#verifying-webhook-signatures)
- [Cargos únicos](#single-charges)
    - [Cobro por Productos](#charging-for-products)
    - [Transacciones de reembolso](#refunding-transactions)
    - [Transacciones de crédito](#crediting-transactions)
- [Transacciones](#transactions)
    - [Pagos pasados y próximos](#past-and-upcoming-payments)
- [Prueba](#testing)

<a id="introduction"></a>
## Introducción

> **Advertencia:**
> Esta documentación es para la integración de Cashier Paddle 2.x con Paddle Billing. Si todavía estás usando Paddle Classic, debes usar [Cashier Paddle 1.x](https://github.com/laravel/cashier-paddle/tree/1.x).

[Laravel Cashier Paddle](https://github.com/laravel/cashier-paddle) proporciona una interfaz expresiva y fluida para los servicios de facturación de suscripción de [Paddle's](https://paddle.com). Maneja casi todos los códigos de facturación de suscripción estándar que temes. Además de la gestión básica de suscripciones, Cashier puede gestionar: intercambio de suscripciones, "cantidades" de suscripción, pausa de suscripción, períodos de gracia de cancelación y más.

Antes de profundizar en Cashier Paddle, le recomendamos que también revise las [guías conceptuales ](https://developer.paddle.com/concepts/overview) y la [documentación API](https://developer.paddle.com/api-reference/overview)] de Paddle.

<a id="upgrading-cashier"></a>
## Actualización de cajero

Al actualizar a una nueva versión de Cashier, es importante que revise cuidadosamente [la guía de actualización](https://github.com/laravel/cashier-paddle/blob/master/UPGRADE.md).

<a id="installation"></a>
## Instalación

Primero, instale el paquete Cashier para Paddle usando el administrador de paquetes Composer:

```shell
composer require laravel/cashier-paddle
```

A continuación, debe publicar los archivos de migración de Cashier utilizando el comando `vendor:publish` Artisan:

```shell
php artisan vendor:publish --tag="cashier-migrations"
```

Luego, debes ejecutar las migraciones de la base de datos de tu aplicación. Las migraciones de Cajero crearán una nueva tabla `customers`. Además, se crearán nuevas tablas `subscriptions` y `subscription_items` para almacenar todas las suscripciones de sus clientes. Por último, se creará una nueva tabla `transactions` para almacenar todas las transacciones de Paddle asociadas con sus clientes:

```shell
php artisan migrate
```

> **Advertencia:**
> Para garantizar que Cashier maneje correctamente todos los eventos de Paddle, recuerde [configurar el manejo del webhook de Cashier](#handling-paddle-webhooks).

<a id="paddle-sandbox"></a>
### Caja de arena de remo

Durante el desarrollo local y provisional, debe [registrar una cuenta Paddle Sandbox](https://sandbox-login.paddle.com/signup). Esta cuenta le brindará un entorno aislado para probar y desarrollar sus aplicaciones sin realizar pagos reales. Puede utilizar los [números de tarjeta de prueba ](https://developer.paddle.com/concepts/payment-methods/credit-debit-card#test-payment-method) de Paddle para simular varios escenarios de pago.

Cuando utilice el entorno Paddle Sandbox, debe configurar la variable de entorno `PADDLE_SANDBOX` en `true` dentro del archivo `.env` de su aplicación:

```ini
PADDLE_SANDBOX=true
```

Una vez que haya terminado de desarrollar su aplicación, puede [solicitar una cuenta de proveedor de Paddle](https://paddle.com). Antes de que su aplicación entre en producción, Paddle deberá aprobar el dominio de su aplicación.

<a id="configuration"></a>
## Configuración

<a id="billable-model"></a>
### Modelo facturable

Antes de usar Cashier, debe agregar el rasgo `Billable` a la definición de su modelo de usuario. Esta característica proporciona varios métodos que le permiten realizar tareas de facturación comunes, como crear suscripciones y actualizar la información del método de pago:

```php
use Laravel\Paddle\Billable;

class User extends Authenticatable
{
    use Billable;
}
```

Si tiene entidades facturables que no son usuarios, también puede agregar el rasgo a esas clases:

```php
use Illuminate\Database\Eloquent\Model;
use Laravel\Paddle\Billable;

class Team extends Model
{
    use Billable;
}
```

<a id="api-keys"></a>
### Claves API

A continuación, debe configurar sus claves Paddle en el archivo `.env` de su aplicación. Puede recuperar sus claves API de Paddle desde el panel de control de Paddle:

```ini
PADDLE_CLIENT_SIDE_TOKEN=your-paddle-client-side-token
PADDLE_API_KEY=your-paddle-api-key
PADDLE_RETAIN_KEY=your-paddle-retain-key
PADDLE_WEBHOOK_SECRET="your-paddle-webhook-secret"
PADDLE_SANDBOX=true
```

La variable de entorno `PADDLE_SANDBOX` debe establecerse en `true` cuando utiliza [el entorno Sandbox de Paddle](#paddle-sandbox). La variable `PADDLE_SANDBOX` debe establecerse en `false` si está implementando su aplicación en producción y está utilizando el entorno de proveedor en vivo de Paddle.

El `PADDLE_RETAIN_KEY` es opcional y solo debe configurarse si usa Paddle con [Retain](https://developer.paddle.com/concepts/retain/overview).

<a id="paddle-js"></a>
### Paleta JS

Paddle se basa en su propia biblioteca de JavaScript para iniciar el widget de pago de Paddle. Puede cargar la biblioteca JavaScript colocando la directiva Blade `@paddleJS` justo antes de la etiqueta `</head>` de cierre del diseño de su aplicación:

```blade
<head>
    ...

    @paddleJS
</head>
```

<a id="currency-configuration"></a>
### Configuración de moneda

Puede especificar una configuración regional que se utilizará al formatear los valores monetarios para mostrarlos en las facturas. Internamente, Cashier utiliza [la clase `NumberFormatter` de PHP](https://www.php.net/manual/en/class.numberformatter.php) para establecer la configuración local de la moneda:

```ini
CASHIER_CURRENCY_LOCALE=nl_BE
```

> **Advertencia:**
> Para utilizar configuraciones regionales distintas a `en`, asegúrese de que la extensión PHP `ext-intl` esté instalada y configurada en su servidor.

<a id="overriding-default-models"></a>
### Anulación de modelos predeterminados

Eres libre de ampliar los modelos utilizados internamente por Cashier definiendo tu propio modelo y ampliando el modelo de Cashier correspondiente:

```php
use Laravel\Paddle\Subscription as CashierSubscription;

class Subscription extends CashierSubscription
{
    // ...
}
```

Después de definir su modelo, puede indicarle a Cashier que use su modelo personalizado a través de la clase `Laravel\Paddle\Cashier`. Normalmente, debes informar al Cajero sobre tus modelos personalizados en el método `boot` de la clase `App\Providers\AppServiceProvider` de tu aplicación:

```php
use App\Models\Cashier\Subscription;
use App\Models\Cashier\Transaction;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Cashier::useSubscriptionModel(Subscription::class);
    Cashier::useTransactionModel(Transaction::class);
}
```

<a id="quickstart"></a>
## Inicio rápido

<a id="quickstart-selling-products"></a>
### Venta de productos

> **Nota:**
> Antes de utilizar Paddle Checkout, debe definir Productos con precios fijos en su panel de Paddle. Además, debes [configurar el manejo del webhook de Paddle](#handling-paddle-webhooks).

Ofrecer facturación de productos y suscripciones a través de su aplicación puede resultar intimidante. Sin embargo, gracias a Cashier y [Paddle's Checkout Overlay](https://developer.paddle.com/concepts/sell/overlay-checkout), puedes crear fácilmente integraciones de pagos modernas y sólidas.

Para cobrar a los clientes por productos no recurrentes de un solo cargo, utilizaremos el Cajero para cobrar a los clientes con la superposición de pago de Paddle, donde proporcionarán sus detalles de pago y confirmarán su compra. Una vez que se haya realizado el pago a través de la superposición de pago, el cliente será redirigido a una URL exitosa de su elección dentro de su aplicación:

```php
use Illuminate\Http\Request;

Route::get('/buy', function (Request $request) {
    $checkout = $request->user()->checkout('pri_deluxe_album')
        ->returnTo(route('dashboard'));

    return view('buy', ['checkout' => $checkout]);
})->name('checkout');
```

Como puede ver en el ejemplo anterior, utilizaremos el método `checkout` proporcionado por el cajero para crear un objeto de pago para presentar al cliente la superposición de pago de Paddle para un "identificador de precio" determinado. Cuando se utiliza Paddle, los "precios" se refieren a [precios definidos para productos específicos](https://developer.paddle.com/build/products/create-products-prices).

Si es necesario, el método `checkout` creará automáticamente un cliente en Paddle y conectará ese registro de cliente de Paddle con el usuario correspondiente en la base de datos de su aplicación. Después de completar la sesión de pago, el cliente será redirigido a una página de éxito dedicada donde podrá mostrarle un mensaje informativo.

En la vista `buy`, incluiremos un botón para mostrar la superposición de pago. El componente de hoja `paddle-button` se incluye con Cashier Paddle; sin embargo, también puede [presentar manualmente un pago superpuesto](#manually-rendering-an-overlay-checkout):

```html
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Buy Product
</x-paddle-button>
```

<a id="providing-meta-data-to-paddle-checkout"></a>
#### Proporcionar metadatos al pago de Paddle

Al vender productos, es común realizar un seguimiento de los pedidos completados y los productos comprados a través de los modelos `Cart` y `Order` definidos por su propia aplicación. Al redirigir a los clientes a la superposición de pago de Paddle para completar una compra, es posible que deba proporcionar un identificador de pedido existente para poder asociar la compra completada con el pedido correspondiente cuando el cliente sea redirigido nuevamente a su aplicación.

Para lograr esto, puede proporcionar una serie de datos personalizados al método `checkout`. Imaginemos que se crea un `Order` pendiente dentro de nuestra aplicación cuando un usuario comienza el proceso de pago. Recuerde, los modelos `Cart` y `Order` en este ejemplo son ilustrativos y no proporcionados por Cajero. Eres libre de implementar estos conceptos según las necesidades de tu propia aplicación:

```php
use App\Models\Cart;
use App\Models\Order;
use Illuminate\Http\Request;

Route::get('/cart/{cart}/checkout', function (Request $request, Cart $cart) {
    $order = Order::create([
        'cart_id' => $cart->id,
        'price_ids' => $cart->price_ids,
        'status' => 'incomplete',
    ]);

    $checkout = $request->user()->checkout($order->price_ids)
        ->customData(['order_id' => $order->id]);

    return view('billing', ['checkout' => $checkout]);
})->name('checkout');
```

Como puede ver en el ejemplo anterior, cuando un usuario comienza el proceso de pago, proporcionaremos todos los identificadores de precios de Paddle asociados al carrito/pedido al método `checkout`. Por supuesto, su aplicación se encarga de asociar estos artículos al “carrito de compras” o pedido a medida que un cliente los agrega. También proporcionamos el ID del pedido a Paddle Checkout Overlay mediante el método `customData`.

Por supuesto, probablemente querrás marcar el pedido como "completo" una vez que el cliente haya finalizado el proceso de pago. Para lograr esto, puede escuchar los webhooks enviados por Paddle y generados a través de eventos por Cashier para almacenar información de pedidos en su base de datos.

Para comenzar, escuche el evento `TransactionCompleted` enviado por Cashier. Normalmente, debe registrar el detector de eventos en el método `boot` del `AppServiceProvider` de su aplicación:

```php
use App\Listeners\CompleteOrder;
use Illuminate\Support\Facades\Event;
use Laravel\Paddle\Events\TransactionCompleted;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Event::listen(TransactionCompleted::class, CompleteOrder::class);
}
```

En este ejemplo, el oyente `CompleteOrder` podría tener el siguiente aspecto:

```php
namespace App\Listeners;

use App\Models\Order;
use Laravel\Paddle\Cashier;
use Laravel\Paddle\Events\TransactionCompleted;

class CompleteOrder
{
    /**
     * Handle the incoming Cashier webhook event.
     */
    public function handle(TransactionCompleted $event): void
    {
        $orderId = $event->payload['data']['custom_data']['order_id'] ?? null;

        $order = Order::findOrFail($orderId);

        $order->update(['status' => 'completed']);
    }
}
```

Consulte la documentación de Paddle para obtener más información sobre los [datos contenidos en el evento `transaction.completed`](https://developer.paddle.com/webhooks/transactions/transaction-completed).

<a id="quickstart-selling-subscriptions"></a>
### Venta de suscripciones

> **Nota:**
> Antes de utilizar Paddle Checkout, debe definir Productos con precios fijos en su panel de Paddle. Además, debes [configurar el manejo del webhook de Paddle](#handling-paddle-webhooks).

Ofrecer facturación de productos y suscripciones a través de su aplicación puede resultar intimidante. Sin embargo, gracias a Cashier y [Paddle's Checkout Overlay](https://developer.paddle.com/concepts/sell/overlay-checkout), puedes crear fácilmente integraciones de pagos modernas y sólidas.

Para aprender cómo vender suscripciones usando Cashier y Paddle's Checkout Overlay, consideremos el escenario simple de un servicio de suscripción con un plan básico mensual (`price_basic_monthly`) y anual (`price_basic_yearly`). Estos dos precios podrían agruparse bajo un producto "Básico" (`pro_basic`) en nuestro panel de Paddle. Además, nuestro servicio de suscripción podría ofrecer un plan "Experto" como `pro_expert`.

Primero, descubramos cómo un cliente puede suscribirse a nuestros servicios. Por supuesto, puede imaginar que el cliente podría hacer clic en el botón "suscribirse" para el plan Básico en la página de precios de nuestra aplicación. Este botón invocará una superposición de pago de Paddle para el plan elegido. Para comenzar, iniciemos una sesión de pago mediante el método `checkout`:

```php
use Illuminate\Http\Request;

Route::get('/subscribe', function (Request $request) {
    $checkout = $request->user()->checkout('price_basic_monthly')
        ->returnTo(route('dashboard'));

    return view('subscribe', ['checkout' => $checkout]);
})->name('subscribe');
```

En la vista `subscribe`, incluiremos un botón para mostrar la superposición de pago. El componente de hoja `paddle-button` se incluye con Cashier Paddle; sin embargo, también puede [presentar manualmente un pago superpuesto](#manually-rendering-an-overlay-checkout):

```html
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Subscribe
</x-paddle-button>
```

Ahora, cuando se hace clic en el botón Suscribirse, el cliente podrá ingresar sus datos de pago e iniciar su suscripción. Para saber cuándo comenzó realmente su suscripción (dado que algunos métodos de pago requieren unos segundos para procesarse), también debe [configurar el manejo del webhook del cajero](#handling-paddle-webhooks).

Ahora que los clientes pueden iniciar suscripciones, debemos restringir ciertas partes de nuestra aplicación para que solo los usuarios suscritos puedan acceder a ellas. Por supuesto, siempre podemos determinar el estado de suscripción actual de un usuario a través del método `subscribed` proporcionado por el rasgo `Billable` del Cajero:

```blade
@if ($user->subscribed())
    <p>You are subscribed.</p>
@endif
```

Incluso podemos determinar fácilmente si un usuario está suscrito a un producto o precio específico:

```blade
@if ($user->subscribedToProduct('pro_basic'))
    <p>You are subscribed to our Basic product.</p>
@endif

@if ($user->subscribedToPrice('price_basic_monthly'))
    <p>You are subscribed to our monthly Basic plan.</p>
@endif
```

<a id="quickstart-building-a-subscribed-middleware"></a>
#### Creación de un middleware suscrito

Para su comodidad, es posible que desee crear un [middleware](../middleware/) que determine si la solicitud entrante proviene de un usuario suscrito. Una vez que se ha definido este middleware, puede asignarlo fácilmente a una ruta para evitar que los usuarios que no están suscritos accedan a la ruta:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Subscribed
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->subscribed()) {
            // Redirect user to billing page and ask them to subscribe...
            return redirect('/subscribe');
        }

        return $next($request);
    }
}
```

Una vez definido el middleware, podrás asignarlo a una ruta:

```php
use App\Http\Middleware\Subscribed;

Route::get('/dashboard', function () {
    // ...
})->middleware([Subscribed::class]);
```

<a id="quickstart-allowing-customers-to-manage-their-billing-plan"></a>
#### Permitir a los clientes administrar su plan de facturación

Por supuesto, es posible que los clientes quieran cambiar su plan de suscripción a otro producto o "nivel". En nuestro ejemplo anterior, queremos permitir que el cliente cambie su plan de una suscripción mensual a una suscripción anual. Para esto necesitarás implementar algo como un botón que te lleve a la siguiente ruta:

```php
use Illuminate\Http\Request;

Route::put('/subscription/{price}/swap', function (Request $request, $price) {
    $user->subscription()->swap($price); // With "$price" being "price_basic_yearly" for this example.

    return redirect()->route('dashboard');
})->name('subscription.swap');
```

Además de cambiar de plan, también deberá permitir que sus clientes cancelen su suscripción. Al igual que con el intercambio de planes, proporcione un botón que conduzca a la siguiente ruta:

```php
use Illuminate\Http\Request;

Route::put('/subscription/cancel', function (Request $request, $price) {
    $user->subscription()->cancel();

    return redirect()->route('dashboard');
})->name('subscription.cancel');
```

Y ahora su suscripción se cancelará al final de su período de facturación.

> **Nota:**
> Siempre que haya configurado el manejo de webhooks de Cashier, Cashier automáticamente mantendrá sincronizadas las tablas de la base de datos relacionadas con Cashier de su aplicación inspeccionando los webhooks entrantes desde Paddle. Entonces, por ejemplo, cuando cancela la suscripción de un cliente a través del panel de Paddle, Cashier recibirá el webhook correspondiente y marcará la suscripción como "cancelada" en la base de datos de su aplicación.

<a id="checkout-sessions"></a>
## Sesiones de pago

La mayoría de las operaciones para facturar a los clientes se realizan mediante "pagos" a través del [widget de superposición de pago](https://developer.paddle.com/build/checkout/build-overlay-checkout) de Paddle o mediante el uso de [pago en línea](https://developer.paddle.com/build/checkout/build-branded-inline-checkout).

Antes de procesar pagos con Paddle, debe definir el [enlace de pago predeterminado](https://developer.paddle.com/build/transactions/default-payment-link#set-default-link)] de su aplicación en el panel de configuración de pago de Paddle.

<a id="overlay-checkout"></a>
### Pago superpuesto

Antes de mostrar el widget Superposición de pago, debe generar una sesión de pago usando Cajero. Una sesión de pago informará al widget de pago de la operación de facturación que se debe realizar:

```php
use Illuminate\Http\Request;

Route::get('/buy', function (Request $request) {
    $checkout = $user->checkout('pri_34567')
        ->returnTo(route('dashboard'));

    return view('billing', ['checkout' => $checkout]);
});
```

El cajero incluye un `paddle-button` [Componente de la hoja](../blade/#components). Puede pasar la sesión de pago a este componente como "prop". Luego, cuando se hace clic en este botón, se mostrará el widget de pago de Paddle:

```html
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Subscribe
</x-paddle-button>
```

De forma predeterminada, esto mostrará el widget usando el estilo predeterminado de Paddle. Puede personalizar el widget agregando [atributos compatibles con Paddle](https://developer.paddle.com/paddlejs/html-data-attributes) como el atributo `data-theme='light'` al componente:

```html
<x-paddle-button :checkout="$checkout" class="px-8 py-4" data-theme="light">
    Subscribe
</x-paddle-button>
```

El widget de pago de Paddle es asíncrono. Una vez que el usuario crea una suscripción dentro del widget, Paddle enviará un webhook a su aplicación para que pueda actualizar adecuadamente el estado de la suscripción en la base de datos de su aplicación. Por lo tanto, es importante que [configure correctamente los webhooks](#handling-paddle-webhooks) para adaptarse a los cambios de estado de Paddle.

> **Advertencia:**
> Después de un cambio de estado de suscripción, la demora para recibir el webhook correspondiente suele ser mínima, pero debe tenerlo en cuenta en su aplicación teniendo en cuenta que la suscripción de su usuario podría no estar disponible inmediatamente después de completar el pago.

<a id="manually-rendering-an-overlay-checkout"></a>
#### Representación manual de un pago superpuesto

También puede representar manualmente un pago superpuesto sin utilizar los componentes Blade integrados de Laravel. Para comenzar, genere la sesión de pago [como se demostró en ejemplos anteriores](#overlay-checkout):

```php
use Illuminate\Http\Request;

Route::get('/buy', function (Request $request) {
    $checkout = $user->checkout('pri_34567')
        ->returnTo(route('dashboard'));

    return view('billing', ['checkout' => $checkout]);
});
```

A continuación, puede utilizar Paddle.js para inicializar el pago. En este ejemplo, crearemos un enlace al que se le asigna la clase `paddle_button`. Paddle.js detectará esta clase y mostrará el pago superpuesto cuando se haga clic en el enlace:

```blade
<?php
$items = $checkout->getItems();
$customer = $checkout->getCustomer();
$custom = $checkout->getCustomData();
?>

<a
    href='#!'
    class='paddle_button'
    data-items='{!! json_encode($items) !!}'
    @if ($customer) data-customer-id='{{ $customer->paddle_id }}' @endif
    @if ($custom) data-custom-data='{{ json_encode($custom) }}' @endif
    @if ($returnUrl = $checkout->getReturnUrl()) data-success-url='{{ $returnUrl }}' @endif
>
    Buy Product
</a>
```

<a id="inline-checkout"></a>
### Pago en línea

Si no desea utilizar el widget de pago de estilo "superpuesto" de Paddle, Paddle también ofrece la opción de mostrar el widget en línea. Si bien este enfoque no le permite ajustar ninguno de los campos HTML del proceso de pago, le permite incrustar el widget dentro de su aplicación.

Para que le resulte más fácil comenzar con el pago en línea, Cashier incluye un componente Blade `paddle-checkout`. Para comenzar, debes [generar una sesión de pago](#overlay-checkout):

```php
use Illuminate\Http\Request;

Route::get('/buy', function (Request $request) {
    $checkout = $user->checkout('pri_34567')
        ->returnTo(route('dashboard'));

    return view('billing', ['checkout' => $checkout]);
});
```

Luego, puede pasar la sesión de pago al atributo `checkout` del componente:

```blade
<x-paddle-checkout :checkout="$checkout" class="w-full" />
```

Para ajustar la altura del componente de pago en línea, puede pasar el atributo `height` al componente Blade:

```blade
<x-paddle-checkout :checkout="$checkout" class="w-full" height="500" />
```

Consulte la [guía de Paddle sobre pago en línea](https://developer.paddle.com/build/checkout/build-branded-inline-checkout) y las [configuraciones de pago disponibles](https://developer.paddle.com/build/checkout/set-up-checkout-default-settings) para obtener más detalles sobre las opciones de personalización del pago en línea.

<a id="manually-rendering-an-inline-checkout"></a>
#### Representación manual de un pago en línea

También puede representar manualmente un pago en línea sin utilizar los componentes Blade integrados de Laravel. Para comenzar, genere la sesión de pago [como se demostró en ejemplos anteriores](#inline-checkout):

```php
use Illuminate\Http\Request;

Route::get('/buy', function (Request $request) {
    $checkout = $user->checkout('pri_34567')
        ->returnTo(route('dashboard'));

    return view('billing', ['checkout' => $checkout]);
});
```

A continuación, puede utilizar Paddle.js para inicializar el pago. En este ejemplo, lo demostraremos usando [Alpine.js](https://github.com/alpinejs/alpine); sin embargo, eres libre de modificar este ejemplo para tu propia pila de interfaz:

```blade
<?php
$options = $checkout->options();

$options['settings']['frameTarget'] = 'paddle-checkout';
$options['settings']['frameInitialHeight'] = 366;
?>

<div class="paddle-checkout" x-data="{}" x-init="
    Paddle.Checkout.open(@json($options));
">
</div>
```

<a id="guest-checkouts"></a>
### Pagos de invitados

A veces, es posible que necesites crear una sesión de pago para usuarios que no necesitan una cuenta en tu aplicación. Para hacerlo, puede utilizar el método `guest`:

```php
use Illuminate\Http\Request;
use Laravel\Paddle\Checkout;

Route::get('/buy', function (Request $request) {
    $checkout = Checkout::guest(['pri_34567'])
        ->returnTo(route('home'));

    return view('billing', ['checkout' => $checkout]);
});
```

Luego, puede proporcionar la sesión de pago a los componentes [Paddle button](#overlay-checkout) o [inline checkout](#inline-checkout) Blade.

<a id="price-previews"></a>
## Vistas previas de precios

Paddle te permite personalizar los precios por moneda, esencialmente permitiéndote configurar diferentes precios para diferentes países. Cashier Paddle le permite recuperar todos estos precios utilizando el método `previewPrices`. Este método acepta los ID de precios para los que desea recuperar precios:

```php
use Laravel\Paddle\Cashier;

$prices = Cashier::previewPrices(['pri_123', 'pri_456']);
```

La moneda se determinará en función de la dirección IP de la solicitud; sin embargo, opcionalmente puede proporcionar un país específico para recuperar los precios de:

```php
use Laravel\Paddle\Cashier;

$prices = Cashier::previewPrices(['pri_123', 'pri_456'], ['address' => [
    'country_code' => 'BE',
    'postal_code' => '1234',
]]);
```

Después de recuperar los precios podrás visualizarlos como desees:

```blade
<ul>
    @foreach ($prices as $price)
        <li>{{ $price->product['name'] }} - {{ $price->total() }}</li>
    @endforeach
</ul>
```

También puede mostrar el precio subtotal y el monto del impuesto por separado:

```blade
<ul>
    @foreach ($prices as $price)
        <li>{{ $price->product['name'] }} - {{ $price->subtotal() }} (+ {{ $price->tax() }} tax)</li>
    @endforeach
</ul>
```

Para obtener más información, [consulte la documentación API de Paddle sobre las vistas previas de precios](https://developer.paddle.com/api-reference/pricing-preview/preview-prices).

<a id="customer-price-previews"></a>
### Vistas previas de precios para clientes

Si un usuario ya es cliente y desea mostrar los precios que se aplican a ese cliente, puede hacerlo recuperando los precios directamente desde la instancia del cliente:

```php
use App\Models\User;

$prices = User::find(1)->previewPrices(['pri_123', 'pri_456']);
```

Internamente, Cashier utilizará el ID de cliente del usuario para recuperar los precios en su moneda. Así, por ejemplo, un usuario que vive en Estados Unidos verá los precios en dólares estadounidenses, mientras que un usuario en Bélgica verá los precios en euros. Si no se puede encontrar ninguna moneda coincidente, se utilizará la moneda predeterminada del producto. Puedes personalizar todos los precios de un producto o plan de suscripción en el panel de control de Paddle.

<a id="price-discounts"></a>
### Descuentos

También puede optar por mostrar los precios después de un descuento. Al llamar al método `previewPrices`, proporciona el ID de descuento a través de la opción `discount_id`:

```php
use Laravel\Paddle\Cashier;

$prices = Cashier::previewPrices(['pri_123', 'pri_456'], [
    'discount_id' => 'dsc_123'
]);
```

Luego, muestre los precios calculados:

```blade
<ul>
    @foreach ($prices as $price)
        <li>{{ $price->product['name'] }} - {{ $price->total() }}</li>
    @endforeach
</ul>
```

<a id="customers"></a>
## Clientes

<a id="customer-defaults"></a>
### Valores predeterminados del cliente

Cajero le permite definir algunos valores predeterminados útiles para sus clientes al crear sesiones de pago. Establecer estos valores predeterminados le permite completar previamente la dirección de correo electrónico y el nombre de un cliente para que pueda pasar inmediatamente a la parte de pago del widget de pago. Puede establecer estos valores predeterminados anulando los siguientes métodos en su modelo facturable:

```php
/**
 * Get the customer's name to associate with Paddle.
 */
public function paddleName(): string|null
{
    return $this->name;
}

/**
 * Get the customer's email address to associate with Paddle.
 */
public function paddleEmail(): string|null
{
    return $this->email;
}
```

Estos valores predeterminados se utilizarán para cada acción en Cajero que genere una [sesión de pago](#checkout-sessions).

<a id="retrieving-customers"></a>
### Recuperando clientes

Puede recuperar un cliente por su ID de cliente de Paddle utilizando el método `Cashier::findBillable`. Este método devolverá una instancia del modelo facturable:

```php
use Laravel\Paddle\Cashier;

$user = Cashier::findBillable($customerId);
```

<a id="creating-customers"></a>
### Creando clientes

En ocasiones, es posible que desees crear un cliente de Paddle sin iniciar una suscripción. Puede lograr esto utilizando el método `createAsCustomer`:

```php
$customer = $user->createAsCustomer();
```

Se devuelve una instancia de `Laravel\Paddle\Customer`. Una vez que el cliente haya sido creado en Paddle, podrás comenzar una suscripción en una fecha posterior. Puede proporcionar una matriz `$options` opcional para pasar cualquier [parámetro de creación de cliente adicional que sea compatible con Paddle API](https://developer.paddle.com/api-reference/customers/create-customer):

```php
$customer = $user->createAsCustomer($options);
```

<a id="subscriptions"></a>
## Suscripciones

<a id="creating-subscriptions"></a>
### Creando suscripciones

Para crear una suscripción, primero recupere una instancia de su modelo facturable de su base de datos, que normalmente será una instancia de `App\Models\User`. Una vez que haya recuperado la instancia del modelo, puede utilizar el método `subscribe` para crear la sesión de pago del modelo:

```php
use Illuminate\Http\Request;

Route::get('/user/subscribe', function (Request $request) {
    $checkout = $request->user()->subscribe($premium = 'pri_123', 'default')
        ->returnTo(route('home'));

    return view('billing', ['checkout' => $checkout]);
});
```

El primer argumento dado al método `subscribe` es el precio específico al que se suscribe el usuario. Este valor debe corresponder al identificador del precio en Paddle. El método `returnTo` acepta una URL a la que se redirigirá a su usuario después de que complete con éxito el pago. El segundo argumento pasado al método `subscribe` debe ser el "tipo" interno de la suscripción. Si su aplicación solo ofrece una única suscripción, puede llamarla `default` o `primary`. Este tipo de suscripción es solo para uso interno de la aplicación y no debe mostrarse a los usuarios. Además, no debe contener espacios y nunca debe modificarse después de crear la suscripción.

También puede proporcionar una serie de metadatos personalizados relacionados con la suscripción utilizando el método `customData`:

```php
$checkout = $request->user()->subscribe($premium = 'pri_123', 'default')
    ->customData(['key' => 'value'])
    ->returnTo(route('home'));
```

Una vez que se ha creado una sesión de pago de suscripción, la sesión de pago se puede proporcionar al `paddle-button` [componente Blade](#overlay-checkout) que se incluye con Cashier Paddle:

```blade
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Subscribe
</x-paddle-button>
```

Una vez que el usuario haya finalizado el pago, se enviará un webhook `subscription_created` desde Paddle. El cajero recibirá este webhook y configurará la suscripción para su cliente. Para asegurarse de que su aplicación reciba y maneje correctamente todos los webhooks, asegúrese de haber [configurado correctamente el manejo de webhooks](#handling-paddle-webhooks).

<a id="checking-subscription-status"></a>
### Comprobando el estado de la suscripción

Una vez que un usuario está suscrito a su aplicación, puede verificar el estado de su suscripción utilizando una variedad de métodos convenientes. Primero, el método `subscribed` devuelve `true` si el usuario tiene una suscripción válida, incluso si la suscripción se encuentra actualmente dentro de su período de prueba:

```php
if ($user->subscribed()) {
    // ...
}
```

Si su aplicación ofrece varias suscripciones, puede especificar la suscripción al invocar el método `subscribed`:

```php
if ($user->subscribed('default')) {
    // ...
}
```

El método `subscribed` también es un excelente candidato para un [middleware de rutas](../middleware/), que le permite filtrar el acceso a rutas y controladores según el estado de suscripción del usuario:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsSubscribed
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && ! $request->user()->subscribed()) {
            // This user is not a paying customer...
            return redirect('/billing');
        }

        return $next($request);
    }
}
```

Si desea determinar si un usuario todavía se encuentra dentro de su período de prueba, puede utilizar el método `onTrial`. Este método puede ser útil para determinar si debe mostrar una advertencia al usuario de que aún se encuentra en su período de prueba:

```php
if ($user->subscription()->onTrial()) {
    // ...
}
```

El método `subscribedToPrice` se puede utilizar para determinar si el usuario está suscrito a un plan determinado en función de un ID de precio de Paddle determinado. En este ejemplo, determinaremos si la suscripción `default` del usuario está suscrita activamente al precio mensual:

```php
if ($user->subscribedToPrice($monthly = 'pri_123', 'default')) {
    // ...
}
```

El método `recurring` se puede utilizar para determinar si el usuario se encuentra actualmente en una suscripción activa y ya no se encuentra dentro de su período de prueba o de gracia:

```php
if ($user->subscription()->recurring()) {
    // ...
}
```

<a id="canceled-subscription-status"></a>
#### Estado de suscripción cancelada

Para determinar si el usuario alguna vez fue un suscriptor activo pero canceló su suscripción, puede usar el método `canceled`:

```php
if ($user->subscription()->canceled()) {
    // ...
}
```

También puede determinar si un usuario canceló su suscripción, pero aún se encuentra en su "período de gracia" hasta que la suscripción caduque por completo. Por ejemplo, si un usuario cancela una suscripción el 5 de marzo que originalmente estaba programada para expirar el 10 de marzo, el usuario estará en su "período de gracia" hasta el 10 de marzo. Además, el método `subscribed` seguirá devolviendo `true` durante este tiempo:

```php
if ($user->subscription()->onGracePeriod()) {
    // ...
}
```

<a id="past-due-status"></a>
#### Estado vencido

Si falla el pago de una suscripción, se marcará como `past_due`. Cuando su suscripción esté en este estado, no estará activa hasta que el cliente haya actualizado su información de pago. Puede determinar si una suscripción está vencida utilizando el método `pastDue` en la instancia de suscripción:

```php
if ($user->subscription()->pastDue()) {
    // ...
}
```

Cuando una suscripción está vencida, debe indicarle al usuario que [actualice su información de pago](#updating-payment-information).

Si desea que las suscripciones aún se consideren válidas cuando sean `past_due`, puede utilizar el método `keepPastDueSubscriptionsActive` proporcionado por Cajero. Normalmente, este método debe llamarse en el método `register` de su `AppServiceProvider`:

```php
use Laravel\Paddle\Cashier;

/**
 * Register any application services.
 */
public function register(): void
{
    Cashier::keepPastDueSubscriptionsActive();
}
```

> **Advertencia:**
> Cuando una suscripción está en estado `past_due`, no se puede cambiar hasta que se haya actualizado la información de pago. Por lo tanto, los métodos `swap` y `updateQuantity` generarán una excepción cuando la suscripción esté en el estado `past_due`.

<a id="subscription-scopes"></a>
#### Alcances de suscripción

La mayoría de los estados de suscripción también están disponibles como alcances de consulta para que pueda consultar fácilmente en su base de datos las suscripciones que se encuentran en un estado determinado:

```php
// Get all valid subscriptions...
$subscriptions = Subscription::query()->valid()->get();

// Get all of the canceled subscriptions for a user...
$subscriptions = $user->subscriptions()->canceled()->get();
```

Una lista completa de los alcances disponibles está disponible a continuación:

```php
Subscription::query()->valid();
Subscription::query()->onTrial();
Subscription::query()->expiredTrial();
Subscription::query()->notOnTrial();
Subscription::query()->active();
Subscription::query()->recurring();
Subscription::query()->pastDue();
Subscription::query()->paused();
Subscription::query()->notPaused();
Subscription::query()->onPausedGracePeriod();
Subscription::query()->notOnPausedGracePeriod();
Subscription::query()->canceled();
Subscription::query()->notCanceled();
Subscription::query()->onGracePeriod();
Subscription::query()->notOnGracePeriod();
```

<a id="subscription-single-charges"></a>
### Cargos únicos de suscripción

Los cargos únicos de suscripción le permiten cobrar a los suscriptores un cargo único además de sus suscripciones. Debe proporcionar uno o varios ID de precio al invocar el método `charge`:

```php
// Charge a single price...
$response = $user->subscription()->charge('pri_123');

// Charge multiple prices at once...
$response = $user->subscription()->charge(['pri_123', 'pri_456']);
```

En realidad, el método `charge` no cobrará al cliente hasta el siguiente intervalo de facturación de su suscripción. Si desea facturar al cliente inmediatamente, puede utilizar el método `chargeAndInvoice`:

```php
$response = $user->subscription()->chargeAndInvoice('pri_123');
```

<a id="updating-payment-information"></a>
### Actualización de la información de pago

Paddle siempre guarda un método de pago por suscripción. Si desea actualizar el método de pago predeterminado para una suscripción, debe redirigir a su cliente a la página de actualización del método de pago alojado de Paddle utilizando el método `redirectToUpdatePaymentMethod` en el modelo de suscripción:

```php
use Illuminate\Http\Request;

Route::get('/update-payment-method', function (Request $request) {
    $user = $request->user();

    return $user->subscription()->redirectToUpdatePaymentMethod();
});
```

Cuando un usuario haya terminado de actualizar su información, Paddle enviará un webhook `subscription_updated` y los detalles de la suscripción se actualizarán en la base de datos de su aplicación.

<a id="changing-plans"></a>
### Cambiando de planes

Después de que un usuario se haya suscrito a su aplicación, es posible que ocasionalmente quiera cambiar a un nuevo plan de suscripción. Para actualizar el plan de suscripción de un usuario, debes pasar el identificador del precio de Paddle al método `swap` de la suscripción:

```php
use App\Models\User;

$user = User::find(1);

$user->subscription()->swap($premium = 'pri_456');
```

Si desea cambiar de plan y facturar inmediatamente al usuario en lugar de esperar su próximo ciclo de facturación, puede utilizar el método `swapAndInvoice`:

```php
$user = User::find(1);

$user->subscription()->swapAndInvoice($premium = 'pri_456');
```

<a id="prorations"></a>
#### Prorrateos

De forma predeterminada, Paddle prorratea los cargos al cambiar de plan. Se podrá utilizar el método `noProrate` para actualizar las suscripciones sin prorratear los cargos:

```php
$user->subscription('default')->noProrate()->swap($premium = 'pri_456');
```

Si desea desactivar el prorrateo y facturar a los clientes inmediatamente, puede utilizar el método `swapAndInvoice` en combinación con `noProrate`:

```php
$user->subscription('default')->noProrate()->swapAndInvoice($premium = 'pri_456');
```

O, para no facturar a su cliente por un cambio de suscripción, puede utilizar el método `doNotBill`:

```php
$user->subscription('default')->doNotBill()->swap($premium = 'pri_456');
```

Para obtener más información sobre las políticas de prorrateo de Paddle, consulte la [documentación de prorrateo](https://developer.paddle.com/concepts/subscriptions/proration).

<a id="subscription-quantity"></a>
### Cantidad de suscripción

A veces las suscripciones se ven afectadas por la "cantidad". Por ejemplo, una aplicación de gestión de proyectos podría cobrar 10 dólares al mes por proyecto. Para incrementar o disminuir fácilmente la cantidad de su suscripción, utilice los métodos `incrementQuantity` y `decrementQuantity`:

```php
$user = User::find(1);

$user->subscription()->incrementQuantity();

// Add five to the subscription's current quantity...
$user->subscription()->incrementQuantity(5);

$user->subscription()->decrementQuantity();

// Subtract five from the subscription's current quantity...
$user->subscription()->decrementQuantity(5);
```

Alternativamente, puede establecer una cantidad específica utilizando el método `updateQuantity`:

```php
$user->subscription()->updateQuantity(10);
```

Se podrá utilizar el método `noProrate` para actualizar la cantidad de la suscripción sin prorratear los cargos:

```php
$user->subscription()->noProrate()->updateQuantity(10);
```

<a id="quantities-for-subscription-with-multiple-products"></a>
#### Cantidades para suscripciones con múltiples productos

Si su suscripción es una [suscripción con múltiples productos](#subscriptions-with-multiple-products), debe pasar el ID del precio cuya cantidad desea incrementar o disminuir como segundo argumento de los métodos de incremento/decremento:

```php
$user->subscription()->incrementQuantity(1, 'price_chat');
```

<a id="subscriptions-with-multiple-products"></a>
### Suscripciones con múltiples productos

[Suscripción con múltiples productos](https://developer.paddle.com/build/subscriptions/add-remove-products-prices-addons) le permite asignar múltiples productos de facturación a una sola suscripción. Por ejemplo, imagine que está creando una aplicación de "servicio de asistencia técnica" de servicio al cliente que tiene un precio de suscripción base de $10 por mes pero ofrece un producto complementario de chat en vivo por $15 adicionales por mes.

Al crear sesiones de pago de suscripción, puede especificar varios productos para una suscripción determinada pasando una serie de precios como primer argumento del método `subscribe`:

```php
use Illuminate\Http\Request;

Route::post('/user/subscribe', function (Request $request) {
    $checkout = $request->user()->subscribe([
        'price_monthly',
        'price_chat',
    ]);

    return view('billing', ['checkout' => $checkout]);
});
```

En el ejemplo anterior, el cliente tendrá dos precios adjuntos a su suscripción `default`. Ambos precios se cobrarán en sus respectivos intervalos de facturación. Si es necesario, puede pasar una matriz asociativa de pares clave/valor para indicar una cantidad específica para cada precio:

```php
$user = User::find(1);

$checkout = $user->subscribe(['price_monthly', 'price_chat' => 5]);
```

Si desea agregar otro precio a una suscripción existente, debe utilizar el método `swap` de la suscripción. Al invocar el método `swap`, también debe incluir los precios y cantidades actuales de la suscripción:

```php
$user = User::find(1);

$user->subscription()->swap(['price_chat', 'price_original' => 2]);
```

El ejemplo anterior agregará el nuevo precio, pero no se le facturará al cliente hasta el próximo ciclo de facturación. Si desea facturar al cliente inmediatamente, puede utilizar el método `swapAndInvoice`:

```php
$user->subscription()->swapAndInvoice(['price_chat', 'price_original' => 2]);
```

Puedes eliminar precios de las suscripciones utilizando el método `swap` y omitiendo el precio que deseas eliminar:

```php
$user->subscription()->swap(['price_original' => 2]);
```

> **Advertencia:**
> No puedes eliminar el último precio de una suscripción. En su lugar, simplemente deberías cancelar la suscripción.

<a id="multiple-subscriptions"></a>
### Múltiples suscripciones

Paddle permite a tus clientes tener múltiples suscripciones simultáneamente. Por ejemplo, puede administrar un gimnasio que ofrece una suscripción de natación y una suscripción de levantamiento de pesas, y cada suscripción puede tener un precio diferente. Por supuesto, los clientes deberían poder suscribirse a uno o ambos planes.

Cuando su aplicación crea suscripciones, puede proporcionar el tipo de suscripción al método `subscribe` como segundo argumento. El tipo puede ser cualquier cadena que represente el tipo de suscripción que inicia el usuario:

```php
use Illuminate\Http\Request;

Route::post('/swimming/subscribe', function (Request $request) {
    $checkout = $request->user()->subscribe($swimmingMonthly = 'pri_123', 'swimming');

    return view('billing', ['checkout' => $checkout]);
});
```

En este ejemplo, iniciamos una suscripción mensual de natación para el cliente. Sin embargo, es posible que quieran cambiar a una suscripción anual más adelante. Al ajustar la suscripción del cliente, simplemente podemos intercambiar el precio de la suscripción `swimming`:

```php
$user->subscription('swimming')->swap($swimmingYearly = 'pri_456');
```

Por supuesto, también puedes cancelar la suscripción por completo:

```php
$user->subscription('swimming')->cancel();
```

<a id="pausing-subscriptions"></a>
### Pausar suscripciones

Para pausar una suscripción, llame al método `pause` en la suscripción del usuario:

```php
$user->subscription()->pause();
```

Cuando se pausa una suscripción, Cashier establecerá automáticamente la columna `paused_at` en su base de datos. Esta columna se utiliza para determinar cuándo el método `paused` debe comenzar a devolver `true`. Por ejemplo, si un cliente pausa una suscripción el 1 de marzo, pero la suscripción no estaba programada para repetirse hasta el 5 de marzo, el método `paused` continuará devolviendo `false` hasta el 5 de marzo. Esto se debe a que, por lo general, a un usuario se le permite continuar usando una aplicación hasta el final de su ciclo de facturación.

De forma predeterminada, la pausa se produce en el siguiente intervalo de facturación para que el cliente pueda utilizar el resto del período que pagó. Si desea pausar una suscripción inmediatamente, puede utilizar el método `pauseNow`:

```php
$user->subscription()->pauseNow();
```

Usando el método `pauseUntil`, puedes pausar la suscripción hasta un momento específico:

```php
$user->subscription()->pauseUntil(now()->plus(months: 1));
```

O puede utilizar el método `pauseNowUntil` para pausar inmediatamente la suscripción hasta un momento determinado:

```php
$user->subscription()->pauseNowUntil(now()->plus(months: 1));
```

Puede determinar si un usuario ha pausado su suscripción pero aún se encuentra en su "período de gracia" utilizando el método `onPausedGracePeriod`:

```php
if ($user->subscription()->onPausedGracePeriod()) {
    // ...
}
```

Para reanudar una suscripción pausada, puede invocar el método `resume` en la suscripción:

```php
$user->subscription()->resume();
```

> **Advertencia:**
> Una suscripción no se puede modificar mientras está en pausa. Si desea cambiar a un plan diferente o actualizar cantidades, primero debe reanudar la suscripción.

<a id="canceling-subscriptions"></a>
### Cancelación de suscripciones

Para cancelar una suscripción, llame al método `cancel` en la suscripción del usuario:

```php
$user->subscription()->cancel();
```

Cuando se cancela una suscripción, Cashier establecerá automáticamente la columna `ends_at` en su base de datos. Esta columna se utiliza para determinar cuándo el método `subscribed` debe comenzar a devolver `false`. Por ejemplo, si un cliente cancela una suscripción el 1 de marzo, pero la suscripción no estaba programada para finalizar hasta el 5 de marzo, el método `subscribed` continuará devolviendo `true` hasta el 5 de marzo. Esto se hace porque normalmente a un usuario se le permite continuar usando una aplicación hasta el final de su ciclo de facturación.

Puede determinar si un usuario canceló su suscripción pero aún se encuentra en su "período de gracia" utilizando el método `onGracePeriod`:

```php
if ($user->subscription()->onGracePeriod()) {
    // ...
}
```

Si desea cancelar una suscripción inmediatamente, puede llamar al método `cancelNow` en la suscripción:

```php
$user->subscription()->cancelNow();
```

Para evitar que se cancele una suscripción en su período de gracia, puede invocar el método `stopCancelation`:

```php
$user->subscription()->stopCancelation();
```

> **Advertencia:**
> Las suscripciones de Pádel no se pueden retomar después de la cancelación. Si su cliente desea reanudar su suscripción, deberá crear una nueva suscripción.

<a id="subscription-trials"></a>
## Pruebas de suscripción

<a id="with-payment-method-up-front"></a>
### Con método de pago por adelantado

Si desea ofrecer períodos de prueba a sus clientes y al mismo tiempo recopilar información sobre el método de pago por adelantado, debe establecer un tiempo de prueba en el panel de Paddle en el precio al que se suscribe su cliente. Luego, inicie la sesión de pago normalmente:

```php
use Illuminate\Http\Request;

Route::get('/user/subscribe', function (Request $request) {
    $checkout = $request->user()
        ->subscribe('pri_monthly')
        ->returnTo(route('home'));

    return view('billing', ['checkout' => $checkout]);
});
```

Cuando su aplicación reciba el evento `subscription_created`, Cashier establecerá la fecha de finalización del período de prueba en el registro de suscripción dentro de la base de datos de su aplicación y le indicará a Paddle que no comience a facturar al cliente hasta después de esta fecha.

> **Advertencia:**
> Si la suscripción del cliente no se cancela antes de la fecha de finalización de la prueba, se le cobrará tan pronto como expire la prueba, por lo que debe asegurarse de notificar a sus usuarios la fecha de finalización de la prueba.

Puede determinar si el usuario se encuentra dentro de su período de prueba utilizando el método `onTrial` de la instancia de usuario:

```php
if ($user->onTrial()) {
    // ...
}
```

Para determinar si una prueba existente ha caducado, puede utilizar los métodos `hasExpiredTrial`:

```php
if ($user->hasExpiredTrial()) {
    // ...
}
```

Para determinar si un usuario está en prueba para un tipo de suscripción específico, puede proporcionar el tipo a los métodos `onTrial` o `hasExpiredTrial`:

```php
if ($user->onTrial('default')) {
    // ...
}

if ($user->hasExpiredTrial('default')) {
    // ...
}
```

<a id="without-payment-method-up-front"></a>
### Sin método de pago por adelantado

Si desea ofrecer períodos de prueba sin recopilar la información del método de pago del usuario por adelantado, puede configurar la columna `trial_ends_at` en el registro de cliente adjunto a su usuario en la fecha de finalización de prueba deseada. Normalmente, esto se hace durante el registro del usuario:

```php
use App\Models\User;

$user = User::create([
    // ...
]);

$user->createAsCustomer([
    'trial_ends_at' => now()->plus(days: 10)
]);
```

Cashier se refiere a este tipo de prueba como "prueba genérica", ya que no está adjunta a ninguna suscripción existente. El método `onTrial` en la instancia `User` devolverá `true` si la fecha actual no supera el valor de `trial_ends_at`:

```php
if ($user->onTrial()) {
    // User is within their trial period...
}
```

Una vez que esté listo para crear una suscripción real para el usuario, puede utilizar el método `subscribe` como de costumbre:

```php
use Illuminate\Http\Request;

Route::get('/user/subscribe', function (Request $request) {
    $checkout = $request->user()
        ->subscribe('pri_monthly')
        ->returnTo(route('home'));

    return view('billing', ['checkout' => $checkout]);
});
```

Para recuperar la fecha de finalización de la prueba del usuario, puede utilizar el método `trialEndsAt`. Este método devolverá una instancia de fecha de Carbon si un usuario está en una prueba o `null` si no lo está. También puede pasar un parámetro de tipo de suscripción opcional si desea obtener la fecha de finalización de la prueba para una suscripción específica distinta de la predeterminada:

```php
if ($user->onTrial('default')) {
    $trialEndsAt = $user->trialEndsAt();
}
```

Puede utilizar el método `onGenericTrial` si desea saber específicamente que el usuario se encuentra dentro de su período de prueba "genérico" y aún no ha creado una suscripción real:

```php
if ($user->onGenericTrial()) {
    // User is within their "generic" trial period...
}
```

<a id="extend-or-activate-a-trial"></a>
### Ampliar o activar una prueba

Puede extender un período de prueba existente en una suscripción invocando el método `extendTrial` y especificando el momento en el que debe finalizar la prueba:

```php
$user->subscription()->extendTrial(now()->plus(days: 5));
```

O puede activar inmediatamente una suscripción finalizando su prueba llamando al método `activate` en la suscripción:

```php
$user->subscription()->activate();
```

<a id="handling-paddle-webhooks"></a>
## Manejo de webhooks de paleta

Paddle puede notificar a su aplicación sobre una variedad de eventos a través de webhooks. De forma predeterminada, el proveedor de servicios del Cajero registra una ruta que apunta al controlador del webhook del Cajero. Este controlador manejará todas las solicitudes de webhook entrantes.

De forma predeterminada, este controlador manejará automáticamente la cancelación de suscripciones que tengan demasiados cargos fallidos, actualizaciones de suscripción y cambios en el método de pago; sin embargo, como pronto descubriremos, puede ampliar este controlador para manejar cualquier evento de webhook de Paddle que desee.

Para asegurarse de que su aplicación pueda manejar webhooks de Paddle, asegúrese de [configurar la URL del webhook en el panel de control de Paddle](https://vendors.paddle.com/notifications-v2). De forma predeterminada, el controlador del webhook del Cajero responde a la ruta URL `/paddle/webhook`. La lista completa de todos los webhooks que debes habilitar en el panel de control de Paddle son:

- Cliente actualizado
- Transacción completada
- Transacción actualizada
- Suscripción creada
- Suscripción actualizada
- Suscripción pausada
- Suscripción cancelada

> **Advertencia:**
> Asegúrese de proteger las solicitudes entrantes con el middleware de verificación de firma de webhook ](../cashier-paddle/#verifying-webhook-signatures) incluido en Cashier.

<a id="webhooks-csrf-protection"></a>
#### Webhooks y protección CSRF

Dado que los webhooks de Paddle deben evitar la protección CSRF](../csrf/) de Laravel, debe asegurarse de que Laravel no intente verificar el token CSRF para los webhooks de Paddle entrantes. Para lograr esto, debe excluir `paddle/*` de la protección CSRF en el archivo `bootstrap/app.php` de su aplicación:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->preventRequestForgery(except: [
        'paddle/*',
    ]);
})
```

<a id="webhooks-local-development"></a>
#### Webhooks y desarrollo local

Para que Paddle pueda enviar webhooks de su aplicación durante el desarrollo local, deberá exponer su aplicación a través de un servicio de sitio compartido como [Ngrok](https://ngrok.com/) o [Expose](https://expose.dev/docs/introduction). Si está desarrollando su aplicación localmente usando [Laravel Sail](../sail/), puede usar el comando para compartir sitio [](../sail/#sharing-your-site)] de Sail.

<a id="defining-webhook-event-handlers"></a>
### Definición de controladores de eventos de webhook

El cajero maneja automáticamente la cancelación de la suscripción en caso de cargos fallidos y otros webhooks comunes de Paddle. Sin embargo, si tiene eventos de webhook adicionales que le gustaría manejar, puede hacerlo escuchando los siguientes eventos que envía Cashier:

- `Laravel\Paddle\Events\WebhookReceived`
- `Laravel\Paddle\Events\WebhookHandled`

Ambos eventos contienen la carga útil completa del webhook Paddle. Por ejemplo, si desea gestionar el webhook `transaction.billed`, puede registrar un [listener](../events/#defining-listeners) que gestionará el evento:

```php
<?php

namespace App\Listeners;

use Laravel\Paddle\Events\WebhookReceived;

class PaddleEventListener
{
    /**
     * Handle received Paddle webhooks.
     */
    public function handle(WebhookReceived $event): void
    {
        if ($event->payload['event_type'] === 'transaction.billed') {
            // Handle the incoming event...
        }
    }
}
```

El cajero también emite eventos dedicados al tipo de webhook recibido. Además de la carga útil completa de Paddle, también contienen los modelos relevantes que se utilizaron para procesar el webhook, como el modelo facturable, la suscripción o el recibo:

<div class="content-list" markdown="1">

- `Laravel\Paddle\Events\CustomerUpdated`
- `Laravel\Paddle\Events\TransactionCompleted`
- `Laravel\Paddle\Events\TransactionUpdated`
- `Laravel\Paddle\Events\SubscriptionCreated`
- `Laravel\Paddle\Events\SubscriptionUpdated`
- `Laravel\Paddle\Events\SubscriptionPaused`
- `Laravel\Paddle\Events\SubscriptionCanceled`

</div>

También puede anular la ruta del webhook integrado predeterminado definiendo la variable de entorno `CASHIER_WEBHOOK` en el archivo `.env` de su aplicación. Este valor debe ser la URL completa de la ruta de su webhook y debe coincidir con la URL establecida en su panel de control de Paddle:

```ini
CASHIER_WEBHOOK=https://example.com/my-paddle-webhook-url
```

<a id="verifying-webhook-signatures"></a>
### Verificación de firmas de webhooks

Para proteger sus webhooks, puede utilizar [firmas de webhooks de Paddle](https://developer.paddle.com/webhooks/signature-verification). Para mayor comodidad, Cashier incluye automáticamente un middleware que valida que la solicitud entrante del webhook Paddle sea válida.

Para habilitar la verificación de webhook, asegúrese de que la variable de entorno `PADDLE_WEBHOOK_SECRET` esté definida en el archivo `.env` de su aplicación. El secreto del webhook se puede recuperar desde el panel de su cuenta de Paddle.

<a id="single-charges"></a>
## Cargos únicos

<a id="charging-for-products"></a>
### Cobro por productos

Si desea iniciar la compra de un producto para un cliente, puede utilizar el método `checkout` en una instancia de modelo facturable para generar una sesión de pago para la compra. El método `checkout` acepta uno o varios ID de precio. Si es necesario, se puede utilizar una matriz asociativa para proporcionar la cantidad del producto que se está comprando:

```php
use Illuminate\Http\Request;

Route::get('/buy', function (Request $request) {
    $checkout = $request->user()->checkout(['pri_tshirt', 'pri_socks' => 5]);

    return view('buy', ['checkout' => $checkout]);
});
```

Después de generar la sesión de pago, puede usar el `paddle-button` [componente Blade](#overlay-checkout)] proporcionado por el Cajero para permitir al usuario ver el widget de pago de Paddle y completar la compra:

```blade
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Buy
</x-paddle-button>
```

Una sesión de pago tiene un método `customData`, que le permite pasar cualquier dato personalizado que desee a la creación de la transacción subyacente. Consulte [la documentación de Paddle](https://developer.paddle.com/build/transactions/custom-data) para obtener más información sobre las opciones disponibles al pasar datos personalizados:

```php
$checkout = $user->checkout('pri_tshirt')
    ->customData([
        'custom_option' => $value,
    ]);
```

<a id="refunding-transactions"></a>
### Transacciones de reembolso

Las transacciones de reembolso devolverán el monto reembolsado al método de pago de su cliente que se utilizó en el momento de la compra. Si necesita reembolsar la compra de un Paddle, puede utilizar el método `refund` en un modelo `Cashier\Paddle\Transaction`. Este método acepta un motivo como primer argumento, uno o más ID de precio para reembolsar con montos opcionales como una matriz asociativa. Puede recuperar las transacciones para un modelo facturable determinado utilizando el método `transactions`.

Por ejemplo, imagina que queremos reembolsar una transacción específica por los precios `pri_123` y `pri_456`. Queremos reembolsar completamente `pri_123`, pero solo reembolsar dos dólares por `pri_456`:

```php
use App\Models\User;

$user = User::find(1);

$transaction = $user->transactions()->first();

$response = $transaction->refund('Accidental charge', [
    'pri_123', // Fully refund this price...
    'pri_456' => 200, // Only partially refund this price...
]);
```

El ejemplo anterior reembolsa partidas específicas en una transacción. Si desea reembolsar la transacción completa, simplemente proporcione un motivo:

```php
$response = $transaction->refund('Accidental charge');
```

Para obtener más información sobre reembolsos, consulte la [documentación de reembolsos de Paddle](https://developer.paddle.com/build/transactions/create-transaction-adjustments).

> **Advertencia:**
> Los reembolsos siempre deben ser aprobados por Paddle antes de procesarlos por completo.

<a id="crediting-transactions"></a>
### Transacciones de acreditación

Al igual que con el reembolso, también puedes acreditar transacciones. Las transacciones de crédito agregarán los fondos al saldo del cliente para que puedan usarse en compras futuras. Las transacciones de crédito solo se pueden realizar para transacciones recopiladas manualmente y no para transacciones recopiladas automáticamente (como suscripciones), ya que Paddle maneja los créditos de suscripción automáticamente:

```php
$transaction = $user->transactions()->first();

// Credit a specific line item fully...
$response = $transaction->credit('Compensation', 'pri_123');
```

Para obtener más información, [consulte la documentación de Paddle sobre cómo acreditar ](https://developer.paddle.com/build/transactions/create-transaction-adjustments).

> **Advertencia:**
> Los créditos solo se pueden aplicar a transacciones cobradas manualmente. Las transacciones recopiladas automáticamente son acreditadas por el propio Paddle.

<a id="transactions"></a>
## Transacciones

Puede recuperar fácilmente una serie de transacciones de un modelo facturable a través de la propiedad `transactions`:

```php
use App\Models\User;

$user = User::find(1);

$transactions = $user->transactions;
```

Las transacciones representan pagos por sus productos y compras y van acompañadas de facturas. Sólo las transacciones completadas se almacenan en la base de datos de su aplicación.

Al enumerar las transacciones de un cliente, puede utilizar los métodos de la instancia de transacción para mostrar la información de pago relevante. Por ejemplo, es posible que desee enumerar cada transacción en una tabla, lo que permitirá al usuario descargar fácilmente cualquiera de las facturas:

```html
<table>
    @foreach ($transactions as $transaction)
        <tr>
            <td>{{ $transaction->billed_at->toFormattedDateString() }}</td>
            <td>{{ $transaction->total() }}</td>
            <td>{{ $transaction->tax() }}</td>
            <td><a href="{{ route('download-invoice', $transaction->id) }}" target="_blank">Download</a></td>
        </tr>
    @endforeach
</table>
```

La ruta `download-invoice` puede verse similar a la siguiente:

```php
use Illuminate\Http\Request;
use Laravel\Paddle\Transaction;

Route::get('/download-invoice/{transaction}', function (Request $request, Transaction $transaction) {
    return $transaction->redirectToInvoicePdf();
})->name('download-invoice');
```

<a id="past-and-upcoming-payments"></a>
### Pagos pasados y futuros

Puede utilizar los métodos `lastPayment` y `nextPayment` para recuperar y mostrar los pagos pasados ​​o futuros de un cliente para suscripciones recurrentes:

```php
use App\Models\User;

$user = User::find(1);

$subscription = $user->subscription();

$lastPayment = $subscription->lastPayment();
$nextPayment = $subscription->nextPayment();
```

Ambos métodos devolverán una instancia de `Laravel\Paddle\Payment`; sin embargo, `lastPayment` devolverá `null` cuando las transacciones aún no se hayan sincronizado mediante webhooks, mientras que `nextPayment` devolverá `null` cuando finalice el ciclo de facturación (por ejemplo, cuando se cancele una suscripción):

```blade
Next payment: {{ $nextPayment->amount() }} due on {{ $nextPayment->date()->format('d/m/Y') }}
```

<a id="testing"></a>
## Pruebas

Mientras realiza la prueba, debe probar manualmente su flujo de facturación para asegurarse de que su integración funcione como se esperaba.

Para pruebas automatizadas, incluidas aquellas ejecutadas dentro de un entorno de CI, puede utilizar [Cliente HTTP de Laravel](../http-client/#testing) para falsificar llamadas HTTP realizadas a Paddle. Aunque esto no prueba las respuestas reales de Paddle, proporciona una manera de probar su aplicación sin tener que llamar a la API de Paddle.
