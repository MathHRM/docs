---
title: "LaravCashier (Stripe)"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Actualización de Cashier](#upgrading-cashier)
- [Instalación](#installation)
- [Configuración](#configuration)
    - [Modelo facturable](#billable-model)
    - [Claves API](#api-keys)
    - [Configuración de moneda](#currency-configuration)
    - [Configuración de impuestos](#tax-configuration)
    - [Registro](#logging)
    - [Uso de modelos personalizados](#using-custom-models)
- [Inicio rápido](#quickstart)
    - [Venta de productos](#quickstart-selling-products)
    - [Venta de suscripciones](#quickstart-selling-subscriptions)
- [Clientes](#customers)
    - [Recuperación de clientes](#retrieving-customers)
    - [Creación de clientes](#creating-customers)
    - [Actualización de clientes](#updating-customers)
    - [Saldos](#balances)
    - [Identificaciones fiscales](#tax-ids)
    - [Sincronización de datos del cliente con Stripe](#syncing-customer-data-with-stripe)
    - [Portal de facturación](#billing-portal)
- [Métodos de pago](#payment-methods)
    - [Almacenamiento de métodos de pago](#storing-payment-methods)
    - [Recuperación de métodos de pago](#retrieving-payment-methods)
    - [Presencia del método de pago](#payment-method-presence)
    - [Actualización del método de pago predeterminado](#updating-the-default-payment-method)
    - [Agregar métodos de pago](#adding-payment-methods)
    - [Eliminar métodos de pago](#deleting-payment-methods)
- [Suscripciones](#subscriptions)
    - [Creación de suscripciones](#creating-subscriptions)
    - [Comprobación del estado de la suscripción](#checking-subscription-status)
    - [Cambio de precios](#changing-prices)
    - [Cantidad de suscripción](#subscription-quantity)
    - [Suscripciones con múltiples productos](#subscriptions-with-multiple-products)
    - [Suscripciones múltiples](#multiple-subscriptions)
    - [Facturación basada en el uso](#usage-based-billing)
    - [Impuestos de suscripción](#subscription-taxes)
    - [Fecha de anclaje de suscripción](#subscription-anchor-date)
    - [Cancelación de suscripciones](#cancelling-subscriptions)
    - [Reanudar suscripciones](#resuming-subscriptions)
- [Períodos de prueba de suscripción](#subscription-trials)
    - [Con método de pago por adelantado](#with-payment-method-up-front)
    - [Sin método de pago por adelantado](#without-payment-method-up-front)
    - [Extensión de períodos de prueba](#extending-trials)
- [Manejo de webhooks de Stripe](#handling-stripe-webhooks)
    - [Definición de controladores de eventos de webhook](#defining-webhook-event-handlers)
    - [Verificación de firmas de webhook](#verifying-webhook-signatures)
- [Cargos únicos](#single-charges)
    - [Cargo simple](#simple-charge)
    - [Cargo con factura](#charge-with-invoice)
    - [Creación de intenciones de pago](#creating-payment-intents)
    - [Reembolso de cargos](#refunding-charges)
- [Facturas](#invoices)
    - [Recuperación de facturas](#retrieving-invoices)
    - [Próximas facturas](#upcoming-invoices)
    - [Vista previa de facturas de suscripción](#previewing-subscription-invoices)
    - [Generación de archivos PDF de factura](#generating-invoice-pdfs)
- [Proceso de pago](#checkout)
    - [Pagos de productos](#product-checkouts)
    - [Pagos con cargo único](#single-charge-checkouts)
    - [Pagos de suscripción](#subscription-checkouts)
    - [Recopilación de números de identificación fiscal](#collecting-tax-ids)
    - [Pagos de invitados](#guest-checkouts)
- [Manejo de pagos fallidos](#handling-failed-payments)
    - [Confirmación de pagos](#confirming-payments)
- [Autenticación reforzada de clientes (SCA)](#strong-customer-authentication)
    - [Pagos que requieren confirmación adicional](#payments-requiring-additional-confirmation)
    - [Notificaciones de pago fuera de sesión](#off-session-payment-notifications)
- [SDK de Stripe](#stripe-sdk)
- [Pruebas](#testing)

<a id="introduction"></a>
## Introducción

[LaravCashier Stripe](https://github.com/laravel/cashier-stripe) proporciona una interfaz expresiva y fluida para los servicios de facturación por suscripción de [Stripe](https://stripe.com). Maneja casi todos los código repetitivo de facturación de suscripciones que temes escribir. Además de la gestión básica de suscripciones, Cashier puede gestionar cupones, intercambiar suscripciones, "cantidades" de suscripción, períodos de gracia de cancelación e incluso generar archivos PDF de facturas.

<a id="upgrading-cashier"></a>
## Actualización de Cashier

Al actualizar a una nueva versión de Cashier, es importante que revisa cuidadosamente [la guía de actualización](https://github.com/laravel/cashier-stripe/blob/16.x/UPGRADE.md).

> **Advertencia:**
> Cashier utiliza la versión de Stripe API fijada por tu versión instalada del SDK `stripe/stripe-php`. Por ejemplo, `stripe/stripe-php` 21.x usa la versión `2026-08-26.dahlia` de Stripe API. Dado que una nueva versión principal del SDK de Stripe generalmente apunta a una nueva versión de la API de Stripe, debes revisar el [registro de cambios de la API de Stripe](https://docs.stripe.com/changelog) antes de actualizar `stripe/stripe-php` a una nueva versión principal.

<a id="installation"></a>
## Instalación

Primero, instala el paquete Cashier para Stripe usando el administrador de paquetes Composer:

```shell
composer require laravel/cashier
```

Después de instalar el paquete, publica las migraciones de Cashier usando el comando `vendor:publish` Artisan:

```shell
php artisan vendor:publish --tag="cashier-migrations"
```

Luego, migra tu base de datos:

```shell
php artisan migrate
```

Las migraciones de Cashier agregarán varias columnas a tu tabla `users`. También crearán una nueva tabla `subscriptions` para contener todas las suscripciones de tus clientes y una tabla `subscription_items` para suscripciones con múltiples precios.

Si lo deseas, también puedes publicar el archivo de configuración de Cashier usando el comando `vendor:publish` Artisan:

```shell
php artisan vendor:publish --tag="cashier-config"
```

Por último, para garantizar que Cashier maneje correctamente todos los eventos de Stripe, recuerda [configurar el manejo del webhook de Cashier](#handling-stripe-webhooks).

> **Advertencia:**
> Stripe recomienda que cualquier columna utilizada para almacenar identificadores de Stripe distinga entre mayúsculas y minúsculas. Por lo tanto, debes asegurarte de que la intercalación de columnas para la columna `stripe_id` esté configurada en `utf8_bin` cuando utilices MySQL. Puedes encontrar más información al respecto en la [documentación de Stripe](https://stripe.com/docs/upgrades#what-changes-does-stripe-consider-to-be-backwards-compatible).

<a id="configuration"></a>
## Configuración

<a id="billable-model"></a>
### Modelo facturable

Antes de usar Cashier, agrega el trait `Billable` a la definición de tu modelo facturable. Normalmente, este será el modelo `App\Models\User`. Este trait proporciona varios métodos que te permiten realizar tareas de facturación comunes, como crear suscripciones, aplicar cupones y actualizar la información del método de pago:

```php
use Laravel\Cashier\Billable;

class User extends Authenticatable
{
    use Billable;
}
```

Cashier asume que tu modelo facturable será la clase `App\Models\User` que se incluye con Laravel. Si deseas cambiar esto, puedes especificar un modelo diferente mediante el método `useCustomerModel`. Normalmente, este método debe llamarse en el método `boot` de tu clase `AppServiceProvider`:

```php
use App\Models\Cashier\User;
use Laravel\Cashier\Cashier;

/**
 * Inicializar los servicios de la aplicación.
 */
public function boot(): void
{
    Cashier::useCustomerModel(User::class);
}
```

> **Advertencia:**
> Si estás utilizando un modelo distinto al modelo `App\Models\User` suministrado por Laravel, deberás publicar y modificar las [Migraciones de Cashier](#installation) proporcionadas para que coincidan con el nombre de la tabla de tu modelo alternativo.

<a id="api-keys"></a>
### Claves API

A continuación, debes configurar tus claves API de Stripe en el archivo `.env` de tu aplicación. Puedes recuperar tus claves API de Stripe desde el panel de control de Stripe:

```ini
STRIPE_KEY=your-stripe-key
STRIPE_SECRET=your-stripe-secret
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```

> **Advertencia:**
> Debes asegurarte de que la variable de entorno `STRIPE_WEBHOOK_SECRET` esté definida en el archivo `.env` de tu aplicación, ya que esta variable se utiliza para garantizar que los webhooks entrantes sean realmente de Stripe.

<a id="currency-configuration"></a>
### Configuración de moneda

La moneda predeterminada de Cashier es el dólar estadounidense (USD). Puedes cambiar la moneda predeterminada configurando la variable de entorno `CASHIER_CURRENCY` dentro del archivo `.env` de tu aplicación:

```ini
CASHIER_CURRENCY=eur
```

Además de configurar la moneda de Cashier, también puedes especificar una configuración regional que se utilizará al formatear los valores monetarios para mostrarlos en las facturas. Internamente, Cashier utiliza [la clase `NumberFormatter` de PHP](https://www.php.net/manual/en/class.numberformatter.php) para establecer la configuración local de la moneda:

```ini
CASHIER_CURRENCY_LOCALE=nl_BE
```

> **Advertencia:**
> Para utilizar configuraciones regionales distintas a `en`, asegúrate de que la extensión PHP `ext-intl` esté instalada y configurada en tu servidor.

<a id="tax-configuration"></a>
### Configuración de impuestos

Gracias a [Stripe Tax](https://stripe.com/tax), es posible calcular automáticamente los impuestos de todas las facturas generadas por Stripe. Puedes habilitar el cálculo automático de impuestos invocando el método `calculateTaxes` en el método `boot` de la clase `App\Providers\AppServiceProvider` de tu aplicación:

```php
use Laravel\Cashier\Cashier;

/**
 * Inicializar los servicios de la aplicación.
 */
public function boot(): void
{
    Cashier::calculateTaxes();
}
```

Una vez que se haya habilitado el cálculo de impuestos, todas las suscripciones nuevas y las facturas únicas que se generen recibirán el cálculo de impuestos automático.

Para que esta función funcione correctamente, los detalles de facturación de tu cliente, como el nombre, la dirección y la identificación fiscal del cliente, deben sincronizarse con Stripe. Puedes utilizar los métodos [sincronización de datos del cliente](#syncing-customer-data-with-stripe) y [identificación fiscal](#tax-ids) que ofrece Cashier para lograr esto.

<a id="logging"></a>
### Registro

Cashier te permite especificar el canal de registro que se utilizará al registrar errores fatales de Stripe. Puedes especificar el canal de registro definiendo la variable de entorno `CASHIER_LOGGER` dentro del archivo `.env` de tu aplicación:

```ini
CASHIER_LOGGER=stack
```

Las excepciones generadas por llamadas API a Stripe se registrarán a través del canal de registro predeterminado de tu aplicación.

<a id="using-custom-models"></a>
### Uso de modelos personalizados

Eres libre de extender los modelos utilizados internamente por Cashier definiendo tu propio modelo y extendiendo el modelo de Cashier correspondiente:

```php
use Laravel\Cashier\Subscription as CashierSubscription;

class Subscription extends CashierSubscription
{
    // ...
}
```

Después de definir tu modelo, puedes indicarle a Cashier que use tu modelo personalizado a través de la clase `Laravel\Cashier\Cashier`. Normalmente, debes informar a Cashier sobre tus modelos personalizados en el método `boot` de la clase `App\Providers\AppServiceProvider` de tu aplicación:

```php
use App\Models\Cashier\Subscription;
use App\Models\Cashier\SubscriptionItem;

/**
 * Inicializar los servicios de la aplicación.
 */
public function boot(): void
{
    Cashier::useSubscriptionModel(Subscription::class);
    Cashier::useSubscriptionItemModel(SubscriptionItem::class);
}
```

<a id="quickstart"></a>
## Inicio rápido

<a id="quickstart-selling-products"></a>
### Venta de productos

> **Nota:**
> Antes de utilizar Stripe Checkout, debes definir productos con precios fijos en tu panel de Stripe. Además, debes [configurar el manejo del webhook de Cashier](#handling-stripe-webhooks).

Ofrecer facturación de productos y suscripciones a través de tu aplicación puede resultar intimidante. Sin embargo, gracias a Cashier y [Stripe Checkout](https://stripe.com/payments/checkout), puedes crear fácilmente integraciones de pagos modernas y sólidas.

Para cobrar a los clientes por productos no recurrentes de un solo cargo, utilizaremos Cashier para dirigir a los clientes a Stripe Checkout, donde proporcionarán sus detalles de pago y confirmarán su compra. Una vez que se haya realizado el pago a través de Checkout, el cliente será redirigido a una URL de éxito de tu elección dentro de tu aplicación:

```php
use Illuminate\Http\Request;

Route::get('/checkout', function (Request $request) {
    $stripePriceId = 'price_deluxe_album';

    $quantity = 1;

    return $request->user()->checkout([$stripePriceId => $quantity], [
        'success_url' => route('checkout-success'),
        'cancel_url' => route('checkout-cancel'),
    ]);
})->name('checkout');

Route::view('/checkout/success', 'checkout.success')->name('checkout-success');
Route::view('/checkout/cancel', 'checkout.cancel')->name('checkout-cancel');
```

Como puedes ver en el ejemplo anterior, utilizaremos el método `checkout` proporcionado por Cashier para redirigir al cliente a Stripe Checkout para un "identificador de precio" determinado. Cuando se utiliza Stripe, los "precios" se refieren a [precios definidos para productos específicos](https://stripe.com/docs/products-prices/how-products-and-prices-work).

Si es necesario, el método `checkout` creará automáticamente un cliente en Stripe y conectará ese registro de cliente de Stripe con el usuario correspondiente en la base de datos de tu aplicación. Después de completar la sesión de pago, el cliente será redirigido a una página dedicada de éxito o cancelación donde podrás mostrarle un mensaje informativo.

<a id="providing-meta-data-to-stripe-checkout"></a>
#### Proporcionar metadatos a Stripe Checkout

Al vender productos, es común realizar un seguimiento de los pedidos completados y los productos comprados a través de los modelos `Cart` y `Order` definidos por tu propia aplicación. Al redirigir a los clientes a Stripe Checkout para completar una compra, es posible que deba proporcionar un identificador de pedido existente para poder asociar la compra completada con el pedido correspondiente cuando el cliente sea redirigido nuevamente a tu aplicación.

Para lograr esto, puedes proporcionar un array de `metadata` al método `checkout`. Imaginemos que se crea un `Order` pendiente dentro de nuestra aplicación cuando un usuario comienza el proceso de pago. Recuerda, los modelos `Cart` y `Order` en este ejemplo son ilustrativos y no proporcionados por Cashier. Eres libre de implementar estos conceptos según las necesidades de tu propia aplicación:

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

    return $request->user()->checkout($order->price_ids, [
        'success_url' => route('checkout-success').'?session_id={CHECKOUT_SESSION_ID}',
        'cancel_url' => route('checkout-cancel'),
        'metadata' => ['order_id' => $order->id],
    ]);
})->name('checkout');
```

Como puedes ver en el ejemplo anterior, cuando un usuario comienza el proceso de pago, proporcionaremos todos los identificadores de precios de Stripe asociados al carrito/pedido al método `checkout`. Por supuesto, tu aplicación se encarga de asociar estos artículos al “carrito de compras” o pedido a medida que un cliente los agrega. También proporcionamos el ID del pedido a la sesión de Stripe Checkout a través de el array `metadata`. Finalmente, hemos agregado la variable de plantilla `CHECKOUT_SESSION_ID` a la ruta de pago exitoso. Cuando Stripe redirige a los clientes a tu aplicación, esta variable de plantilla se completará automáticamente con el ID de la sesión de Checkout.

A continuación, construyamos la ruta de éxito del pago. Esta es la ruta a la que se redirigirá a los usuarios una vez que se haya completado su compra a través de Stripe Checkout. Dentro de esta ruta, podemos recuperar el ID de sesión de Stripe Checkout y la instancia de Stripe Checkout asociada para acceder a los metadatos proporcionados y actualizar el pedido de nuestro cliente en consecuencia:

```php
use App\Models\Order;
use Illuminate\Http\Request;
use Laravel\Cashier\Cashier;

Route::get('/checkout/success', function (Request $request) {
    $sessionId = $request->get('session_id');

    if ($sessionId === null) {
        return;
    }

    $session = Cashier::stripe()->checkout->sessions->retrieve($sessionId);

    if ($session->payment_status !== 'paid') {
        return;
    }

    $orderId = $session['metadata']['order_id'] ?? null;

    $order = Order::findOrFail($orderId);

    $order->update(['status' => 'completed']);

    return view('checkout-success', ['order' => $order]);
})->name('checkout-success');
```

Consulta la documentación de Stripe para obtener más información sobre los [datos contenidos en el objeto de sesión de pago](https://stripe.com/docs/api/checkout/sessions/object).

<a id="quickstart-selling-subscriptions"></a>
### Venta de suscripciones

> **Nota:**
> Antes de utilizar Stripe Checkout, debes definir productos con precios fijos en tu panel de Stripe. Además, debes [configurar el manejo del webhook de Cashier](#handling-stripe-webhooks).

Ofrecer facturación de productos y suscripciones a través de tu aplicación puede resultar intimidante. Sin embargo, gracias a Cashier y [Stripe Checkout](https://stripe.com/payments/checkout), puedes crear fácilmente integraciones de pagos modernas y sólidas.

Para aprender a vender suscripciones usando Cashier y Stripe Checkout, consideremos el escenario simple de un servicio de suscripción con un plan básico mensual (`price_basic_monthly`) y anual (`price_basic_yearly`). Estos dos precios podrían agruparse en un producto "Básico" (`pro_basic`) en nuestro panel de Stripe. Además, nuestro servicio de suscripción podría ofrecer un plan Expert como `pro_expert`.

Primero, descubramos cómo un cliente puede suscribirse a nuestros servicios. Por supuesto, puedes imaginar que el cliente podría hacer clic en el botón "suscribirse" para el plan Básico en la página de precios de nuestra aplicación. Este botón o enlace debe dirigir al usuario a una ruta de Laravel que crea la sesión de Stripe Checkout para el plan elegido:

```php
use Illuminate\Http\Request;

Route::get('/subscription-checkout', function (Request $request) {
    return $request->user()
        ->newSubscription('default', 'price_basic_monthly')
        ->trialDays(5)
        ->allowPromotionCodes()
        ->checkout([
            'success_url' => route('your-success-route'),
            'cancel_url' => route('your-cancel-route'),
        ]);
});
```

Como puedes ver en el ejemplo anterior, redireccionaremos al cliente a una sesión de Stripe Checkout que le permitirá suscribirse a nuestro plan Básico. Después de un pago o cancelación exitosa, el cliente será redirigido nuevamente a la URL que le proporcionamos al método `checkout`. Para saber cuándo comenzó realmente su suscripción (dado que algunos métodos de pago requieren unos segundos para procesarse), también necesitaremos [configurar el manejo del webhook de Cashier](#handling-stripe-webhooks).

Ahora que los clientes pueden iniciar suscripciones, debemos restringir ciertas partes de nuestra aplicación para que solo los usuarios suscritos puedan acceder a ellas. Por supuesto, siempre podemos determinar el estado de suscripción actual de un usuario a través del método `subscribed` proporcionado por el trait `Billable` de Cashier:

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

Para tu comodidad, es posible que desees crear un [middleware](../middleware/) que determine si la solicitud entrante proviene de un usuario suscrito. Una vez que se ha definido este middleware, puedes asignarlo fácilmente a una ruta para evitar que los usuarios que no están suscritos accedan a la ruta:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Subscribed
{
    /**
     * Gestionar una solicitud entrante.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->subscribed()) {
            // Redirigir al usuario a la página de facturación y pedirle que se suscriba...
            return redirect('/billing');
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

Por supuesto, es posible que los clientes quieran cambiar su plan de suscripción a otro producto o "nivel". La forma más sencilla de permitir esto es dirigiendo a los clientes al [Portal de facturación al cliente ](https://stripe.com/docs/no-code/customer-portal) de Stripe, que proporciona una interfaz de usuario alojada que permite a los clientes descargar facturas, actualizar su método de pago y cambiar los planes de suscripción.

Primero, define un enlace o botón dentro de tu aplicación que dirija a los usuarios a una ruta de Laravel que utilizaremos para iniciar una sesión en el Portal de facturación:

```blade
<a href="{{ route('billing') }}">
    Billing
</a>
```

A continuación, definamos la ruta que inicia una sesión del Portal de facturación del cliente de Stripe y redirige al usuario al Portal. El método `redirectToBillingPortal` acepta la URL a la que se debe devolver a los usuarios al salir del Portal:

```php
use Illuminate\Http\Request;

Route::get('/billing', function (Request $request) {
    return $request->user()->redirectToBillingPortal(route('dashboard'));
})->middleware(['auth'])->name('billing');
```

> **Nota:**
> Siempre que hayas configurado el manejo de webhooks de Cashier, Cashier mantendrá sincronizadas automáticamente las tablas de la base de datos relacionadas con Cashier de tu aplicación inspeccionando los webhooks entrantes desde Stripe. Entonces, por ejemplo, cuando un usuario cancela su suscripción a través del Portal de facturación al cliente de Stripe, Cashier recibirá el webhook correspondiente y marcará la suscripción como "cancelada" en la base de datos de tu aplicación.

<a id="customers"></a>
## Clientes

<a id="retrieving-customers"></a>
### Recuperación de clientes

Puedes recuperar un cliente por su ID de Stripe utilizando el método `Cashier::findBillable`. Este método devolverá una instancia del modelo facturable:

```php
use Laravel\Cashier\Cashier;

$user = Cashier::findBillable($stripeId);
```

<a id="creating-customers"></a>
### Creación de clientes

En ocasiones, es posible que desees crear un cliente de Stripe sin iniciar una suscripción. Puedes lograr esto utilizando el método `createAsStripeCustomer`:

```php
$stripeCustomer = $user->createAsStripeCustomer();
```

Una vez que se haya creado el cliente en Stripe, podrás comenzar una suscripción en una fecha posterior. Puedes proporcionar un array `$options` opcional para pasar cualquier [parámetro de creación de cliente adicional que sea compatible con Stripe API](https://stripe.com/docs/api/customers/create):

```php
$stripeCustomer = $user->createAsStripeCustomer($options);
```

Puedes utilizar el método `asStripeCustomer` si deseas devolver el objeto de cliente de Stripe para un modelo facturable:

```php
$stripeCustomer = $user->asStripeCustomer();
```

Se puede utilizar el método `createOrGetStripeCustomer` si deseas recuperar el objeto de cliente de Stripe para un modelo facturable determinado, pero no estás seguro de si el modelo facturable ya es un cliente dentro de Stripe. Este método creará un nuevo cliente en Stripe si aún no existe ninguno:

```php
$stripeCustomer = $user->createOrGetStripeCustomer();
```

<a id="updating-customers"></a>
### Actualización de clientes

Ocasionalmente, es posible que desees actualizar al cliente de Stripe directamente con información adicional. Puedes lograr esto utilizando el método `updateStripeCustomer`. Este método acepta un array de [opciones de actualización del cliente admitidas por Stripe API](https://stripe.com/docs/api/customers/update):

```php
$stripeCustomer = $user->updateStripeCustomer($options);
```

<a id="balances"></a>
### Saldos

Stripe te permite acreditar o debitar el "saldo" de un cliente. Posteriormente, este saldo será abonado o debitado en nuevas facturas. Para verificar el saldo total del cliente, puedes utilizar el método `balance` que está disponible en tu modelo facturable. El método `balance` devolverá una representación de cadena formateada del saldo en la moneda del cliente:

```php
$balance = $user->balance();
```

Para acreditar el saldo de un cliente, puedes proporcionar un valor al método `creditBalance`. Si lo deseas, también puedes proporcionar una descripción:

```php
$user->creditBalance(500, 'Premium customer top-up.');
```

Proporcionar un valor al método `debitBalance` debitará el saldo del cliente:

```php
$user->debitBalance(300, 'Bad usage penalty.');
```

El método `applyBalance` creará nuevas transacciones de saldo de cliente para el cliente. Puedes recuperar estos registros de transacciones utilizando el método `balanceTransactions`, que puede resultar útil para proporcionar un registro de créditos y débitos para que el cliente lo revise:

```php
// Recuperar todas las transacciones...
$transactions = $user->balanceTransactions();

foreach ($transactions as $transaction) {
    // Transaction amount...
    $amount = $transaction->amount(); // $2.31

    // Recuperar la factura relacionada, si está disponible...
    $invoice = $transaction->invoice();
}
```

<a id="tax-ids"></a>
### Identificaciones fiscales

Cashier ofrece una manera fácil de administrar las identificaciones fiscales de un cliente. Por ejemplo, el método `taxIds` se puede utilizar para recuperar todos los [identificaciones fiscales](https://stripe.com/docs/api/customer_tax_ids/object) que están asignados a un cliente como una colección:

```php
$taxIds = $user->taxIds();
```

También puedes recuperar un número de identificación fiscal específico para un cliente por su identificador:

```php
$taxId = $user->findTaxId('txi_belgium');
```

Puedes crear una nueva identificación fiscal proporcionando un [tipo](https://stripe.com/docs/api/customer_tax_ids/object#tax_id_object-type) y un valor válidos para el método `createTaxId`:

```php
$taxId = $user->createTaxId('eu_vat', 'BE0123456789');
```

El método `createTaxId` agregará inmediatamente el identificador fiscal a la cuenta del cliente. [La verificación de los identificaciones fiscales también la realiza Stripe](https://stripe.com/docs/invoicing/customer/tax-ids#validation); sin embargo, este es un proceso asincrónico. Puedes recibir notificaciones sobre las actualizaciones de verificación suscribiéndose al evento de webhook `customer.tax_id.updated` e inspeccionando [el parámetro `verification` de identificador fiscal ](https://stripe.com/docs/api/customer_tax_ids/object#tax_id_object-verification). Para obtener más información sobre el manejo de webhooks, consulta la [documentación sobre la definición de controladores de webhooks](#handling-stripe-webhooks).

Puedes eliminar una identificación fiscal utilizando el método `deleteTaxId`:

```php
$user->deleteTaxId('txi_belgium');
```

<a id="syncing-customer-data-with-stripe"></a>
### Sincronización de datos de clientes con Stripe

Normalmente, cuando los usuarios de tu aplicación actualizan su nombre, dirección de correo electrónico u otra información que también almacena Stripe, debes informar a Stripe de las actualizaciones. Al hacerlo, la copia de la información de Stripe estará sincronizada con la de tu aplicación.

Para automatizar esto, puedes definir un listener de eventos en tu modelo facturable que reaccione al evento `updated` del modelo. Luego, dentro de tu listener de eventos, puedes invocar el método `syncStripeCustomerDetails` en el modelo:

```php
use App\Models\User;
use function Illuminate\Events\queueable;

/**
 * The "booted" method of the model.
 */
protected static function booted(): void
{
    static::updated(queueable(function (User $customer) {
        if ($customer->hasStripeId()) {
            $customer->syncStripeCustomerDetails();
        }
    }));
}
```

Ahora, cada vez que se actualice tu modelo de cliente, su información se sincronizará con Stripe. Para mayor comodidad, Cashier sincronizará automáticamente la información de tu cliente con Stripe en la creación inicial del cliente.

Puedes personalizar las columnas utilizadas para sincronizar la información del cliente con Stripe anulando una variedad de métodos proporcionados por Cashier. Por ejemplo, puedes anular el método `stripeName` para personalizar el atributo que debe considerarse el "nombre" del cliente cuando Cashier sincroniza la información del cliente con Stripe:

```php
/**
 * Obtener el nombre del cliente que debe sincronizarse con Stripe.
 */
public function stripeName(): string|null
{
    return $this->company_name;
}
```

De manera similar, puedes anular los métodos `stripeEmail`, `stripePhone` (máximo de 20 caracteres), `stripeAddress` y `stripePreferredLocales`. Estos métodos sincronizarán la información con sus parámetros de cliente correspondientes al [actualizar el objeto de cliente de Stripe](https://stripe.com/docs/api/customers/update). Si deseas tener control total sobre el proceso de sincronización de la información del cliente, puedes anular el método `syncStripeCustomerDetails`.

<a id="billing-portal"></a>
### Portal de facturación

Stripe ofrece [una manera fácil de configurar un portal de facturación](https://stripe.com/docs/billing/subscriptions/customer-portal) para que tu cliente pueda administrar su suscripción, métodos de pago y ver su historial de facturación. Puedes redirigir a tus usuarios al portal de facturación invocando el método `redirectToBillingPortal` en el modelo facturable desde un controlador o ruta:

```php
use Illuminate\Http\Request;

Route::get('/billing-portal', function (Request $request) {
    return $request->user()->redirectToBillingPortal();
});
```

De forma predeterminada, cuando el usuario termine de administrar su suscripción, podrá regresar a la ruta `home` de tu aplicación a través de un enlace dentro del portal de facturación de Stripe. Puedes proporcionar una URL personalizada a la que el usuario debería regresar pasando la URL como argumento al método `redirectToBillingPortal`:

```php
use Illuminate\Http\Request;

Route::get('/billing-portal', function (Request $request) {
    return $request->user()->redirectToBillingPortal(route('billing'));
});
```

Si deseas generar la URL al portal de facturación sin generar una respuesta de redireccionamiento HTTP, puedes invocar el método `billingPortalUrl`:

```php
$url = $request->user()->billingPortalUrl(route('billing'));
```

<a id="payment-methods"></a>
## Métodos de pago

<a id="storing-payment-methods"></a>
### Almacenamiento de métodos de pago

Para crear suscripciones o realizar cargos "únicos" con Stripe, tu aplicación deberás recopilar de forma segura los detalles de pago del cliente. El enfoque utilizado para lograr esto difiere según si planeas almacenar el método de pago para futuras suscripciones o procesar inmediatamente un solo cargo, por lo que examinaremos ambos a continuación.

El [Payment Element](https://stripe.com/docs/payments/payment-element) de Stripe se puede utilizar para admitir múltiples métodos de pago, como tarjetas, Apple Pay, Google Pay e iDEAL.

<a id="payment-element-for-subscriptions"></a>
#### Elemento de pago para suscripciones

Primero, crea una intención de configuración y pásala a tu vista:

```php
return view('subscribe', [
    'intent' => $user->createSetupIntent()
]);
```

Monta el elemento de pago utilizando `client_secret` de la intención de configuración:

```html
<div id="payment-element"></div>
<button id="submit">Subscribe</button>

<script src="https://js.stripe.com/v3/"></script>
<script>
    const stripe = Stripe('stripe-public-key');

    const elements = stripe.elements({
        clientSecret: '{{ $intent->client_secret }}'
    });

    const paymentElement = elements.create('payment');

    paymentElement.mount('#payment-element');

    document.getElementById('submit').addEventListener('click', async () => {
        const { error } = await stripe.confirmSetup({
            elements,
            confirmParams: {
                return_url: '{{ route("subscription.complete") }}',
            },
        });

        if (error) {
            // Mostrar "error.message" al usuario...
        }
    });
</script>
```

Después de que Stripe redirija a tu `return_url`, el ID de `setup_intent` estará disponible como parámetro de cadena de consulta. Puedes utilizar este valor para recuperar el método de pago y crear la suscripción:

```php
use Illuminate\Http\Request;

Route::get('/subscription/complete', function (Request $request) {
    $setupIntent = $request->user()->findSetupIntent(
        $request->setup_intent
    );

    $paymentMethod = $setupIntent->payment_method;

    $request->user()
        ->newSubscription('default', 'price_xxx')
        ->create($paymentMethod);

    return redirect('/dashboard');
})->name('subscription.complete');
```

Si estás utilizando el Elemento de pago para actualizar el método de pago predeterminado de un cliente en lugar de crear una suscripción, puedes pasar el identificador del método de pago al método [`updateDefaultPaymentMethod`](#updating-the-default-payment-method).

<a id="payment-element-for-single-charges"></a>
#### Elemento de pago para cargos únicos

Para pagos únicos, crea una intención de pago utilizando el método `pay` de Cashier. Por lo general, debes almacenar el ID de intención de pago en el pedido correspondiente de tu aplicación para que el pedido pueda recuperarse después de que Stripe redirija al cliente nuevamente a tu aplicación. El siguiente ejemplo supone que tu aplicación tiene un modelo `Order` con columnas `user_id`, `amount`, `status` y `stripe_payment_intent_id`:

```php
use App\Models\Order;
use Illuminate\Http\Request;

Route::post('/pay', function (Request $request) {
    $amount = 1000;

    $payment = $request->user()->pay($amount);

    $order = Order::create([
        'user_id' => $request->user()->id,
        'amount' => $amount,
        'status' => 'pending',
        'stripe_payment_intent_id' => $payment->id,
    ]);

    return view('checkout', [
        'clientSecret' => $payment->client_secret,
        'order' => $order,
    ]);
});
```

Luego, monta el Elemento de Pago y confirma el pago:

```html
<div id="payment-element"></div>
<button id="submit">Pay Now</button>

<script src="https://js.stripe.com/v3/"></script>
<script>
    const stripe = Stripe('stripe-public-key');

    const elements = stripe.elements({
        clientSecret: '{{ $clientSecret }}'
    });

    const paymentElement = elements.create('payment');

    paymentElement.mount('#payment-element');

    document.getElementById('submit').addEventListener('click', async () => {
        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: '{{ route("payment.complete") }}',
            },
        });

        if (error) {
            // Mostrar "error.message" al usuario...
        }
    });
</script>
```

Después de la redirección, puedes utilizar el parámetro de cadena de consulta `payment_intent` para recuperar el pedido correspondiente y la intención de pago. Antes de completar el pedido, debes verificar que el pedido pertenece al cliente autenticado y que la Intención de Pago pertenece al cliente autenticado y ha tenido éxito:

```php
use App\Models\Order;
use Illuminate\Http\Request;

Route::get('/payment/complete', function (Request $request) {
    $order = Order::where('user_id', $request->user()->id)
        ->where('stripe_payment_intent_id', $request->payment_intent)
        ->firstOrFail();

    $paymentIntent = $request->user()
        ->stripe()
        ->paymentIntents
        ->retrieve($request->payment_intent);

    if ($paymentIntent->customer === $request->user()->stripe_id &&
        $paymentIntent->status === 'succeeded') {
        $order->update(['status' => 'paid']);

        // Completar el pedido...
    }

    return redirect('/dashboard');
})->name('payment.complete');
```

<a id="retrieving-payment-methods"></a>
### Recuperar métodos de pago

El método `paymentMethods` en la instancia del modelo facturable devuelve una colección de instancias `Laravel\Cashier\PaymentMethod`:

```php
$paymentMethods = $user->paymentMethods();
```

De forma predeterminada, este método devolverá métodos de pago de todo tipo. Para recuperar métodos de pago de un tipo específico, puedes pasar `type` como argumento al método:

```php
$paymentMethods = $user->paymentMethods('sepa_debit');
```

Para recuperar el método de pago predeterminado del cliente, se puede utilizar el método `defaultPaymentMethod`:

```php
$paymentMethod = $user->defaultPaymentMethod();
```

Puedes recuperar un método de pago específico adjunto al modelo facturable utilizando el método `findPaymentMethod`:

```php
$paymentMethod = $user->findPaymentMethod($paymentMethodId);
```

<a id="payment-method-presence"></a>
### Presencia del método de pago

Para determinar si un modelo facturable tiene un método de pago predeterminado adjunto a tu cuenta, invoca el método `hasDefaultPaymentMethod`:

```php
if ($user->hasDefaultPaymentMethod()) {
    // ...
}
```

Puedes utilizar el método `hasPaymentMethod` para determinar si un modelo facturable tiene al menos un método de pago adjunto a tu cuenta:

```php
if ($user->hasPaymentMethod()) {
    // ...
}
```

Este método determinará si el modelo facturable tiene algún método de pago. Para determinar si existe un método de pago de un tipo específico para el modelo, puedes pasar `type` como argumento del método:

```php
if ($user->hasPaymentMethod('sepa_debit')) {
    // ...
}
```

<a id="updating-the-default-payment-method"></a>
### Actualización del método de pago predeterminado

El método `updateDefaultPaymentMethod` se puede utilizar para actualizar la información del método de pago predeterminado de un cliente. Este método acepta un identificador de método de pago de Stripe y asignará el nuevo método de pago como método de pago de facturación predeterminado:

```php
$user->updateDefaultPaymentMethod($paymentMethod);
```

Para sincronizar la información de tu método de pago predeterminado con la información del método de pago predeterminado del cliente en Stripe, puedes utilizar el método `updateDefaultPaymentMethodFromStripe`:

```php
$user->updateDefaultPaymentMethodFromStripe();
```

> **Advertencia:**
> El método de pago predeterminado de un cliente solo se puede utilizar para facturar y crear nuevas suscripciones. Debido a las limitaciones impuestas por Stripe, no se podrá utilizar para cargos únicos.

<a id="adding-payment-methods"></a>
### Agregar métodos de pago

Para agregar un nuevo método de pago, puedes llamar al método `addPaymentMethod` en el modelo facturable, pasando el identificador del método de pago:

```php
$user->addPaymentMethod($paymentMethod);
```

> **Nota:**
> Para saber cómo recuperar identificadores de métodos de pago, revisa la [documentación de almacenamiento de métodos de pago](#storing-payment-methods).

<a id="deleting-payment-methods"></a>
### Eliminación de métodos de pago

Para eliminar un método de pago, puedes llamar al método `delete` en la instancia `Laravel\Cashier\PaymentMethod` que deseas eliminar:

```php
$paymentMethod->delete();
```

El método `deletePaymentMethod` eliminará un método de pago específico del modelo facturable:

```php
$user->deletePaymentMethod('pm_visa');
```

El método `deletePaymentMethods` eliminará toda la información del método de pago para el modelo facturable:

```php
$user->deletePaymentMethods();
```

De forma predeterminada, este método eliminará los métodos de pago de todo tipo. Para eliminar métodos de pago de un tipo específico, puedes pasar `type` como argumento al método:

```php
$user->deletePaymentMethods('sepa_debit');
```

> **Advertencia:**
> Si un usuario tiene una suscripción activa, tu aplicación no debería permitirle eliminar su método de pago predeterminado.

<a id="subscriptions"></a>
## Suscripciones

Las suscripciones proporcionan una forma de configurar pagos recurrentes para tus clientes. Las suscripciones de Stripe administradas por Cashier brindan soporte para múltiples precios de suscripción, cantidades de suscripción, pruebas y más.

<a id="creating-subscriptions"></a>
### Creación de suscripciones

Para crear una suscripción, primero recupera una instancia de tu modelo facturable, que normalmente será una instancia de `App\Models\User`. Una vez que hayas recuperado la instancia del modelo, puedes utilizar el método `newSubscription` para crear la suscripción del modelo:

```php
use Illuminate\Http\Request;

Route::post('/user/subscribe', function (Request $request) {
    $request->user()->newSubscription(
        'default', 'price_monthly'
    )->create($request->paymentMethodId);

    // ...
});
```

El primer argumento pasado al método `newSubscription` debe ser el tipo interno de suscripción. Si tu aplicación solo ofrece una única suscripción, puedes llamarla `default` o `primary`. Este tipo de suscripción es solo para uso interno de la aplicación y no debe mostrarse a los usuarios. Además, no debe contener espacios y nunca debe modificarse después de crear la suscripción. El segundo argumento es el precio específico al que se suscribe el usuario. Este valor debe corresponder al identificador del precio en Stripe.

El método `create`, que acepta [un identificador de método de pago Stripe](#storing-payment-methods) o un objeto Stripe `PaymentMethod`, comenzará la suscripción y actualizará tu base de datos con el ID de cliente de Stripe del modelo facturable y otra información de facturación relevante.

> **Advertencia:**
> Pasar un identificador de método de pago directamente al método de suscripción `create` también lo agregará automáticamente a los métodos de pago almacenados del usuario.

<a id="collecting-recurring-payments-via-invoice-emails"></a>
#### Cobro de pagos recurrentes a través de correos electrónicos de facturas

En lugar de cobrar los pagos recurrentes de un cliente automáticamente, puedes indicarle a Stripe que envíe una factura por correo electrónico al cliente cada vez que venza su pago recurrente. Luego, el cliente podrá pagar manualmente la factura una vez que la reciba. El cliente no necesita proporcionar un método de pago por adelantado al cobrar pagos recurrentes mediante facturas:

```php
$user->newSubscription('default', 'price_monthly')->createAndSendInvoice();
```

La cantidad de tiempo que un cliente tiene para pagar su factura antes de cancelar su suscripción está determinada por la opción `days_until_due`. De forma predeterminada, esto es 30 días; sin embargo, puedes proporcionar un valor específico para esta opción si lo deseas:

```php
$user->newSubscription('default', 'price_monthly')->createAndSendInvoice([], [
    'days_until_due' => 30
]);
```

<a id="subscription-quantities"></a>
#### Cantidades

Si deseas establecer una [cantidad](https://stripe.com/docs/billing/subscriptions/quantities) específica para el precio al crear la suscripción, debes invocar el método `quantity` en el constructor de suscripciones antes de crear la suscripción:

```php
$user->newSubscription('default', 'price_monthly')
    ->quantity(5)
    ->create($paymentMethod);
```

<a id="additional-details"></a>
#### Detalles adicionales

Si deseas especificar opciones adicionales de [cliente](https://stripe.com/docs/api/customers/create) o de [suscripción](https://stripe.com/docs/api/subscriptions/create) admitidas por Stripe, puedes hacerlo pasándolas como segundo y tercer argumento al método `create`:

```php
$user->newSubscription('default', 'price_monthly')->create($paymentMethod, [
    'email' => $email,
], [
    'metadata' => ['note' => 'Some extra information.'],
]);
```

<a id="coupons"></a>
#### Cupones

Si deseas aplicar un cupón al crear la suscripción, puedes utilizar el método `withCoupon`:

```php
$user->newSubscription('default', 'price_monthly')
    ->withCoupon('code')
    ->create($paymentMethod);
```

O, si deseas aplicar un [código de promoción Stripe](https://stripe.com/docs/billing/subscriptions/discounts/codes), puedes utilizar el método `withPromotionCode`:

```php
$user->newSubscription('default', 'price_monthly')
    ->withPromotionCode('promo_code_id')
    ->create($paymentMethod);
```

El ID del código de promoción proporcionado debe ser el ID de la API de Stripe asignado al código de promoción y no el código de promoción de cara al cliente. Si necesitas encontrar un ID de código de promoción basado en un código de promoción determinado para el cliente, puedes utilizar el método `findPromotionCode`:

```php
// Buscar el ID del código promocional por el código visible para el cliente...
$promotionCode = $user->findPromotionCode('SUMMERSALE');

// Buscar el ID de un código promocional activo por el código visible para el cliente...
$promotionCode = $user->findActivePromotionCode('SUMMERSALE');
```

En el ejemplo anterior, el objeto `$promotionCode` devuelto es una instancia de `Laravel\Cashier\PromotionCode`. Esta clase decora un objeto `Stripe\PromotionCode` subyacente. Puedes recuperar el cupón relacionado con el código de promoción invocando el método `coupon`:

```php
$coupon = $user->findPromotionCode('SUMMERSALE')->coupon();
```

La instancia del cupón te permite determinar el monto del descuento y si el cupón representa un descuento fijo o un descuento basado en porcentaje:

```php
if ($coupon->isPercentage()) {
    return $coupon->percentOff().'%'; // 21.5%
} else {
    return $coupon->amountOff(); // $5.99
}
```

También puedes recuperar los descuentos que se aplican actualmente a un cliente o suscripción:

```php
$discount = $billable->discount();

$discount = $subscription->discount();
```

Las instancias `Laravel\Cashier\Discount` devueltas decoran una instancia de objeto `Stripe\Discount` subyacente. Podrás recuperar el cupón relacionado con este descuento invocando el método `coupon`:

```php
$coupon = $subscription->discount()->coupon();
```

Si deseas aplicar un nuevo cupón o código de promoción a un cliente o suscripción, puedes hacerlo a través de los métodos `applyCoupon` o `applyPromotionCode`:

```php
$billable->applyCoupon('coupon_id');
$billable->applyPromotionCode('promotion_code_id');

$subscription->applyCoupon('coupon_id');
$subscription->applyPromotionCode('promotion_code_id');
```

Recuerda, debes utilizar el ID de API de Stripe asignado al código de promoción y no el código de promoción de cara al cliente. Solo se puede aplicar un cupón o código de promoción a un cliente o suscripción en un momento determinado.

Para obtener más información sobre este tema, consulta la documentación de Stripe sobre [cupones](https://stripe.com/docs/billing/subscriptions/coupons) y [códigos de promoción](https://stripe.com/docs/billing/subscriptions/coupons/codes).

<a id="adding-subscriptions"></a>
#### Agregar suscripciones

Si deseas agregar una suscripción a un cliente que ya tiene un método de pago predeterminado, puedes invocar el método `add` en el constructor de suscripciones:

```php
use App\Models\User;

$user = User::find(1);

$user->newSubscription('default', 'price_monthly')->add();
```

<a id="creating-subscriptions-from-the-stripe-dashboard"></a>
#### Creación de suscripciones desde el panel de Stripe

También puedes crear suscripciones desde el panel de Stripe. Al hacerlo, Cashier sincronizará las suscripciones recién agregadas y les asignará un tipo de `default`. Para personalizar el tipo de suscripción que se asigna a las suscripciones creadas en el panel, [define los controladores de eventos de webhook](#defining-webhook-event-handlers).

Además, solo puedes crear un tipo de suscripción a través del panel de Stripe. Si tu aplicación ofrece varias suscripciones que utilizan diferentes tipos, solo se puede agregar un tipo de suscripción a través del panel de Stripe.

Finalmente, siempre debes asegurarte de agregar solo una suscripción activa por tipo de suscripción que ofrece tu aplicación. Si un cliente tiene dos suscripciones `default`, Cashier solo utilizará la suscripción agregada más recientemente, aunque ambas se sincronizarán con la base de datos de tu aplicación.

<a id="checking-subscription-status"></a>
### Comprobación del estado de la suscripción

Una vez que un cliente se suscribe a tu aplicación, puedes verificar fácilmente el estado de su suscripción utilizando diversos métodos prácticos. Primero, el método `subscribed` devuelve `true` si el cliente tiene una suscripción activa, incluso si la suscripción se encuentra actualmente dentro de su período de prueba. El método `subscribed` acepta el tipo de suscripción como primer argumento:

```php
if ($user->subscribed('default')) {
    // ...
}
```

El método `subscribed` también es un excelente candidato para un [middleware de rutas](../middleware/), que te permite filtrar el acceso a rutas y controladores según el estado de suscripción del usuario:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsSubscribed
{
    /**
     * Gestionar una solicitud entrante.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && ! $request->user()->subscribed('default')) {
            // This user is not a paying customer...
            return redirect('/billing');
        }

        return $next($request);
    }
}
```

Si deseas determinar si un usuario todavía se encuentra dentro de su período de prueba, puedes utilizar el método `onTrial`. Este método puede ser útil para determinar si debes mostrar una advertencia al usuario de que aún se encuentra en su período de prueba:

```php
if ($user->subscription('default')->onTrial()) {
    // ...
}
```

El método `subscribedToProduct` se puede utilizar para determinar si el usuario está suscrito a un producto determinado en función del identificador de un producto Stripe determinado. En Stripe, los productos son colecciones de precios. En este ejemplo, determinaremos si la suscripción `default` del usuario está suscrita activamente al producto "premium" de la aplicación. El identificador de producto de Stripe proporcionado debe corresponder a uno de los identificadores de tu producto en el panel de Stripe:

```php
if ($user->subscribedToProduct('prod_premium', 'default')) {
    // ...
}
```

Al pasar un array al método `subscribedToProduct`, puedes determinar si la suscripción `default` del usuario está suscrita activamente al producto "básico" o "premium" de la aplicación:

```php
if ($user->subscribedToProduct(['prod_basic', 'prod_premium'], 'default')) {
    // ...
}
```

Se puede utilizar el método `subscribedToPrice` para determinar si la suscripción de un cliente corresponde a un ID de precio determinado:

```php
if ($user->subscribedToPrice('price_basic_monthly', 'default')) {
    // ...
}
```

Se podrá utilizar el método `recurring` para determinar si el usuario está suscrito actualmente y ya no se encuentra dentro de su período de prueba:

```php
if ($user->subscription('default')->recurring()) {
    // ...
}
```

> **Advertencia:**
> Si un usuario tiene dos suscripciones del mismo tipo, la suscripción más reciente siempre será devuelta por el método `subscription`. Por ejemplo, un usuario podría tener dos registros de suscripción con el tipo `default`; sin embargo, una de las suscripciones puede ser una suscripción antigua vencida, mientras que la otra es la suscripción actual y activa. Siempre se devolverá la suscripción más reciente, mientras que las suscripciones más antiguas se mantienen en la base de datos para su revisión histórica.

<a id="cancelled-subscription-status"></a>
#### Estado de suscripción cancelada

Para determinar si el usuario alguna vez fue un suscriptor activo pero canceló su suscripción, puedes usar el método `canceled`:

```php
if ($user->subscription('default')->canceled()) {
    // ...
}
```

También puedes determinar si un usuario canceló su suscripción pero aún se encuentra en su "período de gracia" hasta que la suscripción caduque por completo. Por ejemplo, si un usuario cancela una suscripción el 5 de marzo que originalmente estaba programada para expirar el 10 de marzo, el usuario estará en su "período de gracia" hasta el 10 de marzo. Ten en cuenta que el método `subscribed` todavía devuelve `true` durante este tiempo:

```php
if ($user->subscription('default')->onGracePeriod()) {
    // ...
}
```

Para determinar si el usuario ha cancelado su suscripción y ya no se encuentra dentro de su "período de gracia", puedes utilizar el método `ended`:

```php
if ($user->subscription('default')->ended()) {
    // ...
}
```

<a id="incomplete-and-past-due-status"></a>
#### Estado incompleto y vencido

Si una suscripción requiere una acción de pago secundaria después de su creación, la suscripción se marcará como `incomplete`. Los estados de suscripción se almacenan en la columna `stripe_status` de la tabla de base de datos `subscriptions` de Cashier.

De manera similar, si se requiere una acción de pago secundaria al intercambiar precios, la suscripción se marcará como `past_due`. Cuando su suscripción se encuentre en cualquiera de estos estados, no estará activa hasta que el cliente haya confirmado su pago. Se puede determinar si una suscripción tiene un pago incompleto utilizando el método `hasIncompletePayment` en el modelo facturable o una instancia de suscripción:

```php
if ($user->hasIncompletePayment('default')) {
    // ...
}

if ($user->subscription('default')->hasIncompletePayment()) {
    // ...
}
```

Cuando una suscripción tiene un pago incompleto, deberás dirigir al usuario a la página de confirmación de pago de Cashier, pasando el identificador `latestPayment`. Puedes utilizar el método `latestPayment` disponible en la instancia de suscripción para recuperar este identificador:

```html
<a href="{{ route('cashier.payment', $subscription->latestPayment()->id) }}">
    Please confirm your payment.
</a>
```

Si deseas que la suscripción aún se considere activa cuando se encuentra en el estado `past_due` o `incomplete`, puedes utilizar los métodos `keepPastDueSubscriptionsActive` y `keepIncompleteSubscriptionsActive` proporcionados por Cashier. Normalmente, estos métodos deben llamarse en el método `register` de tu `App\Providers\AppServiceProvider`:

```php
use Laravel\Cashier\Cashier;

/**
 * Registrar los servicios de la aplicación.
 */
public function register(): void
{
    Cashier::keepPastDueSubscriptionsActive();
    Cashier::keepIncompleteSubscriptionsActive();
}
```

> **Advertencia:**
> Cuando una suscripción está en estado `incomplete`, no se puede cambiar hasta que se confirma el pago. Por lo tanto, los métodos `swap` y `updateQuantity` generarán una excepción cuando la suscripción esté en el estado `incomplete`.

<a id="subscription-scopes"></a>
#### Alcances de suscripción

La mayoría de los estados de suscripción también están disponibles como alcances de consulta para que pueda consultar fácilmente en tu base de datos las suscripciones que se encuentran en un estado determinado:

```php
// Obtener todas las suscripciones activas...
$subscriptions = Subscription::query()->active()->get();

// Obtener todas las suscripciones canceladas de un usuario...
$subscriptions = $user->subscriptions()->canceled()->get();
```

Una lista completa de los alcances disponibles está disponible a continuación:

```php
Subscription::query()->active();
Subscription::query()->canceled();
Subscription::query()->ended();
Subscription::query()->incomplete();
Subscription::query()->notCanceled();
Subscription::query()->notOnGracePeriod();
Subscription::query()->notOnTrial();
Subscription::query()->onGracePeriod();
Subscription::query()->onTrial();
Subscription::query()->pastDue();
Subscription::query()->recurring();
```

<a id="changing-prices"></a>
### Cambio de precios

Después de que un cliente se suscribe a tu aplicación, es posible que en ocasiones desees cambiar a un nuevo precio de suscripción. Para cambiar un cliente a un nuevo precio, pasa el identificador del precio de Stripe al método `swap`. Al intercambiar precios, se asume que el usuario desea reactivar su suscripción si anteriormente fue cancelada. El identificador de precio proporcionado debe corresponder a un identificador de precio de Stripe disponible en el panel de Stripe:

```php
use App\Models\User;

$user = App\Models\User::find(1);

$user->subscription('default')->swap('price_yearly');
```

Si el cliente está en prueba, se mantendrá el periodo de prueba. Además, si existe una "cantidad" para la suscripción, esa cantidad también se mantendrá.

Si deseas intercambiar precios y cancelar cualquier período de prueba en el que se encuentre actualmente el cliente, puedes invocar el método `skipTrial`:

```php
$user->subscription('default')
    ->skipTrial()
    ->swap('price_yearly');
```

Si deseas intercambiar precios y facturar inmediatamente al cliente en lugar de esperar su próximo ciclo de facturación, puedes utilizar el método `swapAndInvoice`:

```php
$user = User::find(1);

$user->subscription('default')->swapAndInvoice('price_yearly');
```

<a id="prorations"></a>
#### Prorrateos

De forma predeterminada, Stripe prorratea los cargos al intercambiar precios. Se podrá utilizar el método `noProrate` para actualizar el precio de la suscripción sin prorratear los cargos:

```php
$user->subscription('default')->noProrate()->swap('price_yearly');
```

Para obtener más información sobre el prorrateo de suscripciones, consulta la [documentación de Stripe](https://stripe.com/docs/billing/subscriptions/prorations).

> **Advertencia:**
> La ejecución del método `noProrate` antes del método `swapAndInvoice` no tendrá ningún efecto en el prorrateo. Siempre se emitirá una factura.

<a id="subscription-quantity"></a>
### Cantidad de suscripción

A veces las suscripciones se ven afectadas por la "cantidad". Por ejemplo, una aplicación de gestión de proyectos podría cobrar 10 dólares al mes por proyecto. Puedes utilizar los métodos `incrementQuantity` y `decrementQuantity` para incrementar o disminuir fácilmente la cantidad de tu suscripción:

```php
use App\Models\User;

$user = User::find(1);

$user->subscription('default')->incrementQuantity();

// Sumar cinco a la cantidad actual de la suscripción...
$user->subscription('default')->incrementQuantity(5);

$user->subscription('default')->decrementQuantity();

// Restar cinco a la cantidad actual de la suscripción...
$user->subscription('default')->decrementQuantity(5);
```

Alternativamente, puedes establecer una cantidad específica utilizando el método `updateQuantity`:

```php
$user->subscription('default')->updateQuantity(10);
```

Se podrá utilizar el método `noProrate` para actualizar la cantidad de la suscripción sin prorratear los cargos:

```php
$user->subscription('default')->noProrate()->updateQuantity(10);
```

Para obtener más información sobre las cantidades de suscripción, consulta la [documentación de Stripe](https://stripe.com/docs/subscriptions/quantities).

<a id="quantities-for-subscription-with-multiple-products"></a>
#### Cantidades para suscripciones con múltiples productos

Si tu suscripción es una [suscripción con múltiples productos](#subscriptions-with-multiple-products), debes pasar el ID del precio cuya cantidad deseas incrementar o disminuir como segundo argumento de los métodos de incremento/decremento:

```php
$user->subscription('default')->incrementQuantity(1, 'price_chat');
```

<a id="subscriptions-with-multiple-products"></a>
### Suscripciones con múltiples productos

[Suscripción con múltiples productos](https://stripe.com/docs/billing/subscriptions/multiple-products) te permite asignar múltiples productos de facturación a una sola suscripción. Por ejemplo, imagina que está creando una aplicación de "servicio de asistencia técnica" de servicio al cliente que tiene un precio de suscripción base de $10 por mes pero ofrece un producto complementario de chat en vivo por $15 adicionales por mes. La información para suscripciones con múltiples productos se almacena en la tabla de base de datos `subscription_items` de Cashier.

Puedes especificar varios productos para una suscripción determinada pasando un array de precios como segundo argumento del método `newSubscription`:

```php
use Illuminate\Http\Request;

Route::post('/user/subscribe', function (Request $request) {
    $request->user()->newSubscription('default', [
        'price_monthly',
        'price_chat',
    ])->create($request->paymentMethodId);

    // ...
});
```

En el ejemplo anterior, el cliente tendrá dos precios adjuntos a su suscripción `default`. Ambos precios se cobrarán en sus respectivos intervalos de facturación. Si es necesario, podrás utilizar el método `quantity` para indicar una cantidad específica para cada precio:

```php
$user = User::find(1);

$user->newSubscription('default', ['price_monthly', 'price_chat'])
    ->quantity(5, 'price_chat')
    ->create($paymentMethod);
```

Si deseas agregar otro precio a una suscripción existente, puedes invocar el método `addPrice` de la suscripción:

```php
$user = User::find(1);

$user->subscription('default')->addPrice('price_chat');
```

El ejemplo anterior agregará el nuevo precio y se le facturará al cliente en su próximo ciclo de facturación. Si deseas facturar al cliente inmediatamente, puedes utilizar el método `addPriceAndInvoice`:

```php
$user->subscription('default')->addPriceAndInvoice('price_chat');
```

Si deseas agregar un precio con una cantidad específica, puedes pasar la cantidad como segundo argumento de los métodos `addPrice` o `addPriceAndInvoice`:

```php
$user = User::find(1);

$user->subscription('default')->addPrice('price_chat', 5);
```

Puedes eliminar precios de las suscripciones utilizando el método `removePrice`:

```php
$user->subscription('default')->removePrice('price_chat');
```

> **Advertencia:**
> No puedes eliminar el último precio de una suscripción. En su lugar, simplemente deberías cancelar la suscripción.

<a id="swapping-prices"></a>
#### Cambio de precios

También puedes cambiar los precios adjuntos a una suscripción con múltiples productos. Por ejemplo, imagina que un cliente tiene una suscripción `price_basic` con un producto complementario `price_chat` y deseas actualizar el cliente del precio `price_basic` al precio `price_pro`:

```php
use App\Models\User;

$user = User::find(1);

$user->subscription('default')->swap(['price_pro', 'price_chat']);
```

Al ejecutar el ejemplo anterior, el elemento de suscripción subyacente con `price_basic` se elimina y el que tiene `price_chat` se conserva. Además, se crea un nuevo elemento de suscripción para `price_pro`.

También puedes especificar opciones de elementos de suscripción pasando un array de pares clave/valor al método `swap`. Por ejemplo, es posible que necesites especificar las cantidades del precio de suscripción:

```php
$user = User::find(1);

$user->subscription('default')->swap([
    'price_pro' => ['quantity' => 5],
    'price_chat'
]);
```

Si deseas intercambiar un precio único en una suscripción, puedes hacerlo utilizando el método `swap` en el propio elemento de suscripción. Este enfoque es particularmente útil si deseas conservar todos los metadatos existentes en los demás precios de la suscripción:

```php
$user = User::find(1);

$user->subscription('default')
    ->findItemOrFail('price_basic')
    ->swap('price_pro');
```

<a id="proration"></a>
#### Prorrateo

De forma predeterminada, Stripe prorrateará los cargos al agregar o eliminar precios de una suscripción con múltiples productos. Si deseas realizar un ajuste de precio sin prorrateo, debes encadenar el método `noProrate` a tu operación de precio:

```php
$user->subscription('default')->noProrate()->removePrice('price_chat');
```

<a id="swapping-quantities"></a>
#### Cantidades

Si deseas actualizar las cantidades de los precios de suscripción individuales, puedes hacerlo utilizando los [métodos de cantidad existentes](#subscription-quantity) pasando el ID del precio como argumento adicional al método:

```php
$user = User::find(1);

$user->subscription('default')->incrementQuantity(5, 'price_chat');

$user->subscription('default')->decrementQuantity(3, 'price_chat');

$user->subscription('default')->updateQuantity(10, 'price_chat');
```

> **Advertencia:**
> Cuando una suscripción tiene varios precios, los atributos `stripe_price` y `quantity` en el modelo `Subscription` serán `null`. Para acceder a los atributos de precio individuales, debes utilizar la relación `items` disponible en el modelo `Subscription`.

<a id="subscription-items"></a>
#### Elementos de suscripción

Cuando una suscripción tiene varios precios, tendrá varios "elementos" de suscripción almacenados en la tabla `subscription_items` de tu base de datos. Puedes acceder a ellos a través de la relación `items` en la suscripción:

```php
use App\Models\User;

$user = User::find(1);

$subscriptionItem = $user->subscription('default')->items->first();

// Recuperar el precio de Stripe y la cantidad de un artículo específico...
$stripePrice = $subscriptionItem->stripe_price;
$quantity = $subscriptionItem->quantity;
```

También puedes recuperar un precio específico usando el método `findItemOrFail`:

```php
$user = User::find(1);

$subscriptionItem = $user->subscription('default')->findItemOrFail('price_chat');
```

<a id="multiple-subscriptions"></a>
### Múltiples suscripciones

Stripe permite a tus clientes tener múltiples suscripciones simultáneamente. Por ejemplo, puedes administrar un gimnasio que ofrece una suscripción de natación y una suscripción de levantamiento de pesas, y cada suscripción puede tener un precio diferente. Por supuesto, los clientes deberían poder suscribirse a uno o ambos planes.

Cuando tu aplicación crea suscripciones, puedes proporcionar el tipo de suscripción al método `newSubscription`. El tipo puedes ser cualquier cadena que represente el tipo de suscripción que inicia el usuario:

```php
use Illuminate\Http\Request;

Route::post('/swimming/subscribe', function (Request $request) {
    $request->user()->newSubscription('swimming')
        ->price('price_swimming_monthly')
        ->create($request->paymentMethodId);

    // ...
});
```

En este ejemplo, iniciamos una suscripción mensual de natación para el cliente. Sin embargo, es posible que quieran cambiar a una suscripción anual más adelante. Al ajustar la suscripción del cliente, simplemente podemos intercambiar el precio de la suscripción `swimming`:

```php
$user->subscription('swimming')->swap('price_swimming_yearly');
```

Por supuesto, también puedes cancelar la suscripción por completo:

```php
$user->subscription('swimming')->cancel();
```

<a id="usage-based-billing"></a>
### Facturación basada en el uso

[Facturación basada en el uso](https://stripe.com/docs/billing/subscriptions/metered-billing) te permite cobrar a los clientes según el uso del producto durante un ciclo de facturación. Por ejemplo, puedes cobrar a los clientes según la cantidad de mensajes de texto o correos electrónicos que envían por mes.

Para comenzar a utilizar la facturación por uso, primero deberás crear un nuevo producto en tu panel de Stripe con un [modelo de facturación basado en el uso](https://docs.stripe.com/billing/subscriptions/usage-based/implementation-guide) y un [medidor](https://docs.stripe.com/billing/subscriptions/usage-based/recording-usage#configure-meter). Después de crear el medidor, almacena el nombre del evento asociado y el ID del medidor, que necesitará para informar y recuperar el uso. Luego, utiliza el método `meteredPrice` para agregar el ID del precio medido a la suscripción de un cliente:

```php
use Illuminate\Http\Request;

Route::post('/user/subscribe', function (Request $request) {
    $request->user()->newSubscription('default')
        ->meteredPrice('price_metered')
        ->create($request->paymentMethodId);

    // ...
});
```

También puedes iniciar una suscripción medida a través de [Stripe Checkout](#checkout):

```php
$checkout = Auth::user()
    ->newSubscription('default', [])
    ->meteredPrice('price_metered')
    ->checkout();

return view('your-checkout-view', [
    'checkout' => $checkout,
]);
```

<a id="reporting-usage"></a>
#### Registro del uso

A medida que tu cliente utiliza tu aplicación, informarás su uso a Stripe para que se le pueda facturar con precisión. Para informar el uso de un evento medido, puedes utilizar el método `reportMeterEvent` en tu modelo `Billable`:

```php
$user = User::find(1);

$user->reportMeterEvent('emails-sent');
```

De forma predeterminada, se agrega una "cantidad de uso" de 1 al período de facturación. Alternativamente, puedes transferir una cantidad específica de "uso" para agregarla al uso del cliente durante el período de facturación:

```php
$user = User::find(1);

$user->reportMeterEvent('emails-sent', quantity: 15);
```

Para recuperar el resumen de eventos de un cliente para un medidor, puedes utilizar el método `meterEventSummaries` de una instancia `Billable`:

```php
$user = User::find(1);

$meterUsage = $user->meterEventSummaries($meterId);

$meterUsage->first()->aggregated_value; // 10
```

Consulta la documentación del [objeto de resumen de eventos del medidor](https://docs.stripe.com/api/billing/meter-event_summary/object) de Stripe para obtener más información sobre los resúmenes de eventos del medidor.

Para [enumerar todos los medidores](https://docs.stripe.com/api/billing/meter/list), puedes utilizar el método `meters` de una instancia `Billable`:

```php
$user = User::find(1);

$user->meters();
```

<a id="subscription-taxes"></a>
### Impuestos de suscripción

> **Advertencia:**
> En lugar de calcular las tasas impositivas manualmente, puedes [calcular impuestos automáticamente usando Stripe Tax](#tax-configuration)

Para especificar las tasas impositivas que un usuario paga por una suscripción, debes implementar el método `taxRates` en tu modelo facturable y devolver un array que contenga los ID de las tasas impositivas de Stripe. Puedes definir estas tasas impositivas en [tu panel de Stripe](https://dashboard.stripe.com/test/tax-rates):

```php
/**
 * The tax rates that should apply to the customer's subscriptions.
 *
 * @return array<int, string>
 */
public function taxRates(): array
{
    return ['txr_id'];
}
```

El método `taxRates` te permite aplicar una tasa impositiva cliente por cliente, lo que puede resultar útil para una base de usuarios que abarca varios países y tasas impositivas.

Si ofreces suscripciones con varios productos, puedes definir diferentes tasas impositivas para cada precio implementando un método `priceTaxRates` en tu modelo facturable:

```php
/**
 * The tax rates that should apply to the customer's subscriptions.
 *
 * @return array<string, array<int, string>>
 */
public function priceTaxRates(): array
{
    return [
        'price_monthly' => ['txr_id'],
    ];
}
```

> **Advertencia:**
> El método `taxRates` solo aplica a cargos de suscripción. Si utilizas Cashier para realizar cargos "únicos", deberás especificar manualmente la tasa impositiva en ese momento.

<a id="syncing-tax-rates"></a>
#### Sincronización de tasas impositivas

Al cambiar los ID de tasa impositiva codificados devueltos por el método `taxRates`, la configuración de impuestos en cualquier suscripción existente para el usuario seguirá siendo la misma. Si deseas actualizar el valor impositivo de las suscripciones existentes con los nuevos valores `taxRates`, debes llamar al método `syncTaxRates` en la instancia de suscripción del usuario:

```php
$user->subscription('default')->syncTaxRates();
```

Esto también sincronizará las tasas de impuestos de los elementos para una suscripción con múltiples productos. Si tu aplicación ofrece suscripciones con varios productos, debes asegurarte de que tu modelo facturable implemente el método `priceTaxRates` [analizado anteriormente](#subscription-taxes).

<a id="tax-exemption"></a>
#### Exención de impuestos

Cashier también ofrece los métodos `isNotTaxExempt`, `isTaxExempt` y `reverseChargeApplies` para determinar si el cliente está exento de impuestos. Estos métodos llamarán a la API de Stripe para determinar el estado de exención de impuestos de un cliente:

```php
use App\Models\User;

$user = User::find(1);

$user->isTaxExempt();
$user->isNotTaxExempt();
$user->reverseChargeApplies();
```

> **Advertencia:**
> Estos métodos también están disponibles en cualquier objeto `Laravel\Cashier\Invoice`. Sin embargo, cuando se invocan en un objeto `Invoice`, los métodos determinarán el estado de exención en el momento en que se creó la factura.

<a id="subscription-anchor-date"></a>
### Fecha de anclaje de suscripción

De forma predeterminada, el ancla del ciclo de facturación es la fecha en que se creó la suscripción o, si se utiliza un período de prueba, la fecha en que finaliza la prueba. Si deseas modificar la fecha ancla de facturación, puedes utilizar el método `anchorBillingCycleOn`:

```php
use Illuminate\Http\Request;

Route::post('/user/subscribe', function (Request $request) {
    $anchor = Carbon::parse('first day of next month');

    $request->user()->newSubscription('default', 'price_monthly')
        ->anchorBillingCycleOn($anchor->startOfDay())
        ->create($request->paymentMethodId);

    // ...
});
```

Para obtener más información sobre cómo administrar los ciclos de facturación de suscripciones, consulta la [documentación del ciclo de facturación de Stripe](https://stripe.com/docs/billing/subscriptions/billing-cycle)

<a id="cancelling-subscriptions"></a>
### Cancelación de suscripciones

Para cancelar una suscripción, llama al método `cancel` en la suscripción del usuario:

```php
$user->subscription('default')->cancel();
```

Cuando se cancela una suscripción, Cashier configurará automáticamente la columna `ends_at` en tu tabla de base de datos `subscriptions`. Esta columna se utiliza para saber cuándo el método `subscribed` debe comenzar a devolver `false`.

Por ejemplo, si un cliente cancela una suscripción el 1 de marzo, pero la suscripción no estaba programada para finalizar hasta el 5 de marzo, el método `subscribed` continuará devolviendo `true` hasta el 5 de marzo. Esto se hace porque normalmente a un usuario se le permite continuar usando una aplicación hasta el final de su ciclo de facturación.

Puedes determinar si un usuario canceló su suscripción pero aún se encuentra en su "período de gracia" utilizando el método `onGracePeriod`:

```php
if ($user->subscription('default')->onGracePeriod()) {
    // ...
}
```

Si deseas cancelar una suscripción inmediatamente, llama al método `cancelNow` en la suscripción del usuario:

```php
$user->subscription('default')->cancelNow();
```

Si deseas cancelar una suscripción inmediatamente y facturar cualquier uso medido restante no facturado o elementos de factura de prorrateo nuevos/pendientes, llama al método `cancelNowAndInvoice` en la suscripción del usuario:

```php
$user->subscription('default')->cancelNowAndInvoice();
```

También puedes optar por cancelar la suscripción en un momento específico:

```php
$user->subscription('default')->cancelAt(
    now()->plus(days: 10)
);
```

Finalmente, siempre debes cancelar las suscripciones de los usuarios antes de eliminar el modelo de usuario asociado:

```php
$user->subscription('default')->cancelNow();

$user->delete();
```

<a id="resuming-subscriptions"></a>
### Reanudación de suscripciones

Si un cliente canceló su suscripción y deseas reanudarla, puedes invocar el método `resume` en la suscripción. El cliente aún debe estar dentro de su "período de gracia" para poder reanudar una suscripción:

```php
$user->subscription('default')->resume();
```

Si el cliente cancela una suscripción y luego la reanuda antes de que haya caducado por completo, no se le facturará al cliente inmediatamente. En cambio, su suscripción se reactivará y se le facturará en el ciclo de facturación original.

<a id="subscription-trials"></a>
## Períodos de prueba de suscripción

<a id="with-payment-method-up-front"></a>
### Con método de pago por adelantado

Si deseas ofrecer períodos de prueba a tus clientes y al mismo tiempo recopilar información sobre el método de pago por adelantado, debes utilizar el método `trialDays` al crear tus suscripciones:

```php
use Illuminate\Http\Request;

Route::post('/user/subscribe', function (Request $request) {
    $request->user()->newSubscription('default', 'price_monthly')
        ->trialDays(10)
        ->create($request->paymentMethodId);

    // ...
});
```

Este método establecerá la fecha de finalización del período de prueba en el registro de suscripción dentro de la base de datos e indicará a Stripe que no comience a facturar al cliente hasta después de esta fecha. Cuando se utiliza el método `trialDays`, Cashier sobrescribirá cualquier período de prueba predeterminado configurado para el precio en Stripe.

> **Advertencia:**
> Si la suscripción del cliente no se cancela antes de la fecha de finalización de la prueba, se le cobrará tan pronto como expire la prueba, por lo que debes asegurarte de notificar a tus usuarios la fecha de finalización de la prueba.

El método `trialUntil` te permite proporcionar una instancia `DateTime` que especifica cuándo debe finalizar el período de prueba:

```php
use Illuminate\Support\Carbon;

$user->newSubscription('default', 'price_monthly')
    ->trialUntil(Carbon::now()->plus(days: 10))
    ->create($paymentMethod);
```

Puedes determinar si un usuario está dentro de su período de prueba utilizando el método `onTrial` de la instancia de usuario o el método `onTrial` de la instancia de suscripción. Los dos ejemplos siguientes son equivalentes:

```php
if ($user->onTrial('default')) {
    // ...
}

if ($user->subscription('default')->onTrial()) {
    // ...
}
```

Puedes utilizar el método `endTrial` para finalizar inmediatamente una prueba de suscripción:

```php
$user->subscription('default')->endTrial();
```

Para determinar si una prueba existente ha caducado, puedes utilizar los métodos `hasExpiredTrial`:

```php
if ($user->hasExpiredTrial('default')) {
    // ...
}

if ($user->subscription('default')->hasExpiredTrial()) {
    // ...
}
```

<a id="defining-trial-days-in-stripe-cashier"></a>
#### Definición de días de prueba en Stripe / Cashier

Puedes optar por definir cuántos días de prueba recibirá tu precio en el panel de Stripe o pasarlos siempre explícitamente usando Cashier. Si eliges definir los días de prueba de tu precio en Stripe, debes tener en cuenta que las nuevas suscripciones, incluidas las nuevas suscripciones para un cliente que tuvo una suscripción en el pasado, siempre recibirán un período de prueba a menos que llames explícitamente al método `skipTrial()`.

<a id="without-payment-method-up-front"></a>
### Sin método de pago por adelantado

Si deseas ofrecer períodos de prueba sin recopilar la información del método de pago del usuario por adelantado, puedes configurar la columna `trial_ends_at` en el registro del usuario en la fecha de finalización de la prueba que desees. Normalmente, esto se hace durante el registro del usuario:

```php
use App\Models\User;

$user = User::create([
    // ...
    'trial_ends_at' => now()->plus(days: 10),
]);
```

> **Advertencia:**
> Asegúrate de agregar un [conversión de fecha](../eloquent-mutators/#date-casting) para el atributo `trial_ends_at` dentro de la definición de clase de tu modelo facturable.

Cashier se refiere a este tipo de prueba como "prueba genérica", ya que no está adjunta a ninguna suscripción existente. El método `onTrial` en la instancia del modelo facturable devolverá `true` si la fecha actual no supera el valor de `trial_ends_at`:

```php
if ($user->onTrial()) {
    // User is within their trial period...
}
```

Una vez que estés listo para crear una suscripción real para el usuario, puedes utilizar el método `newSubscription` como de costumbre:

```php
$user = User::find(1);

$user->newSubscription('default', 'price_monthly')->create($paymentMethod);
```

Para recuperar la fecha de finalización de la prueba del usuario, puedes utilizar el método `trialEndsAt`. Este método devolverá una instancia de fecha de Carbon si un usuario está en una prueba o `null` si no lo está. También puedes pasar un parámetro de tipo de suscripción opcional si deseas obtener la fecha de finalización de la prueba para una suscripción específica distinta de la predeterminada:

```php
if ($user->onTrial()) {
    $trialEndsAt = $user->trialEndsAt('main');
}
```

También puedes utilizar el método `onGenericTrial` si deseas saber específicamente que el usuario se encuentra dentro de su período de prueba "genérico" y aún no ha creado una suscripción real:

```php
if ($user->onGenericTrial()) {
    // User is within their "generic" trial period...
}
```

<a id="extending-trials"></a>
### Extensión de períodos de prueba

El método `extendTrial` te permite extender el período de prueba de una suscripción después de que se haya creado la suscripción. Si la prueba ya expiró y ya se le está facturando al cliente la suscripción, aún puedes ofrecerle una prueba extendida. El tiempo transcurrido dentro del periodo de prueba se descontará de la siguiente factura del cliente:

```php
use App\Models\User;

$subscription = User::find(1)->subscription('default');

// Finalizar el período de prueba dentro de 7 días...
$subscription->extendTrial(
    now()->plus(days: 7)
);

// Añadir 5 días más al período de prueba...
$subscription->extendTrial(
    $subscription->trial_ends_at->plus(days: 5)
);
```

<a id="handling-stripe-webhooks"></a>
## Manejo de webhooks de Stripe

> **Nota:**
> Puedes utilizar [Stripe CLI](https://stripe.com/docs/stripe-cli) para ayudar a probar los webhooks durante el desarrollo local.

Stripe puede notificar a tu aplicación sobre una variedad de eventos a través de webhooks. De forma predeterminada, el proveedor de servicios de Cashier registra automáticamente una ruta que apunta al controlador de webhook de Cashier. Este controlador manejará todas las solicitudes de webhook entrantes.

De forma predeterminada, el controlador del webhook de Cashier manejará automáticamente la cancelación de suscripciones que tengan demasiados cargos fallidos (según lo definido por la configuración de Stripe), actualizaciones de clientes, eliminaciones de clientes, actualizaciones de suscripciones y cambios en los métodos de pago; sin embargo, como descubriremos pronto, puedes ampliar este controlador para manejar cualquier evento de webhook de Stripe que desees.

Para asegurarte de que tu aplicación pueda manejar webhooks de Stripe, asegúrate de configurar la URL del webhook en el panel de control de Stripe. De forma predeterminada, el controlador del webhook de Cashier responde a la ruta URL `/stripe/webhook`. La lista completa de todos los webhooks que debes habilitar en el panel de control de Stripe es:

- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `customer.updated`
- `customer.deleted`
- `payment_method.automatically_updated`
- `invoice.payment_action_required`
- `invoice.payment_succeeded`

Para mayor comodidad, Cashier incluye un comando Artisan `cashier:webhook`. Este comando creará un webhook en Stripe que escucha todos los eventos requeridos por Cashier:

```shell
php artisan cashier:webhook
```

De forma predeterminada, el webhook creado apuntará a la URL definida por la variable de entorno `APP_URL` y la ruta `cashier.webhook` que se incluye con Cashier. Puedes proporcionar la opción `--url` al invocar el comando si deseas utilizar una URL diferente:

```shell
php artisan cashier:webhook --url "https://example.com/stripe/webhook"
```

El webhook que se crea utilizará la misma versión de Stripe API que Cashier, que está determinada por tu versión instalada de `stripe/stripe-php`. Si deseas utilizar una versión de Stripe diferente, puedes proporcionar la opción `--api-version`:

```shell
php artisan cashier:webhook --api-version="2019-12-03"
```

Después de la creación, el webhook estará activo inmediatamente. Si deseas crear el webhook pero mantenerlo deshabilitado hasta que estés listo, puedes proporcionar la opción `--disabled` al invocar el comando:

```shell
php artisan cashier:webhook --disabled
```

> **Advertencia:**
> Asegúrate de proteger las solicitudes entrantes de webhook de Stripe con el [middleware de verificación de firma de webhook](#verifying-webhook-signatures) incluido en Cashier.

<a id="webhooks-csrf-protection"></a>
#### Webhooks y protección CSRF

Dado que los webhooks de Stripe deben eludir la [protección CSRF](../csrf/) de Laravel, debes asegurarte de que Laravel no intente validar el token CSRF para los webhooks de Stripe entrantes. Para lograr esto, debes excluir `stripe/*` de la protección CSRF en el archivo `bootstrap/app.php` de tu aplicación:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->preventRequestForgery(except: [
        'stripe/*',
    ]);
})
```

<a id="defining-webhook-event-handlers"></a>
### Definición de controladores de eventos de webhook

Cashier maneja automáticamente las cancelaciones de suscripciones por cargos fallidos y otros eventos comunes de webhooks de Stripe. Sin embargo, si tienes eventos de webhook adicionales que te gustaría manejar, puedes hacerlo escuchando los siguientes eventos que envía Cashier:

- `Laravel\Cashier\Events\WebhookReceived`
- `Laravel\Cashier\Events\WebhookHandled`

Ambos eventos contienen la carga útil completa del webhook de Stripe. Por ejemplo, si deseas gestionar el webhook `invoice.payment_succeeded`, puedes registrar un [listener](../events/#defining-listeners) que gestionará el evento:

```php
<?php

namespace App\Listeners;

use Laravel\Cashier\Events\WebhookReceived;

class StripeEventListener
{
    /**
     * Gestionar los webhooks recibidos de Stripe.
     */
    public function handle(WebhookReceived $event): void
    {
        if ($event->payload['type'] === 'invoice.payment_succeeded') {
            // Gestionar el evento entrante...
        }
    }
}
```

<a id="verifying-webhook-signatures"></a>
### Verificación de firmas de webhooks

Para proteger tus webhooks, puedes utilizar [firmas de webhooks de Stripe](https://stripe.com/docs/webhooks/signatures). Para mayor comodidad, Cashier incluye automáticamente un middleware que valida que la solicitud entrante del webhook de Stripe sea válida.

Para habilitar la verificación de webhook, asegúrate de que la variable de entorno `STRIPE_WEBHOOK_SECRET` esté configurada en el archivo `.env` de tu aplicación. El webhook `secret` se puede recuperar desde el panel de tu cuenta de Stripe.

<a id="single-charges"></a>
## Cargos únicos

<a id="simple-charge"></a>
### Cargo simple

Si deseas realizar un cargo único a un cliente utilizando un identificador de método de pago, puedes utilizar el método `charge` en una instancia de modelo facturable. Si necesitas recopilar detalles de pago de un cliente antes de procesar un cargo único, consulta la documentación [Elemento de pago para cargos únicos ](#payment-element-for-single-charges):

```php
use Illuminate\Http\Request;

Route::post('/purchase', function (Request $request) {
    $payment = $request->user()->charge(
        100, $request->paymentMethodId
    );

    // ...
});
```

El método `charge` acepta un array como tercer argumento, lo que te permite pasar cualquier opción que desees a la creación de intención de pago de Stripe subyacente. Puedes encontrar más información sobre las opciones disponibles para ti al crear intenciones de pago en la [documentación de Stripe](https://stripe.com/docs/api/payment_intents/create):

```php
$user->charge(100, $paymentMethod, [
    'custom_option' => $value,
]);
```

También puedes utilizar el método `charge` sin un cliente o usuario subyacente. Para lograr esto, invoca el método `charge` en una nueva instancia del modelo facturable de tu aplicación:

```php
use App\Models\User;

$payment = (new User)->charge(100, $paymentMethod);
```

El método `charge` generará una excepción si falla el cargo. Si el cargo se realiza correctamente, el método devolverá una instancia de `Laravel\Cashier\Payment`:

```php
try {
    $payment = $user->charge(100, $paymentMethod);
} catch (Exception $e) {
    // ...
}
```

> **Advertencia:**
> El método `charge` acepta el monto del pago en el unidad mínima de la moneda utilizada por tu aplicación. Por ejemplo, si los clientes pagan en dólares estadounidenses, los montos deben especificarse en centavos.

<a id="charge-with-invoice"></a>
### Cargo con factura

A veces es posible que necesites realizar un cargo único y ofrecer una factura en PDF a tu cliente. El método `invoicePrice` te permite hacer precisamente eso. Por ejemplo, facturemos a un cliente por cinco camisetas nuevas:

```php
$user->invoicePrice('price_tshirt', 5);
```

La factura se cargará inmediatamente al método de pago predeterminado del usuario. El método `invoicePrice` también acepta un array como tercer argumento. Este array contiene las opciones de facturación para el artículo de factura. El cuarto argumento aceptado por el método es también un array que debe contener las opciones de facturación de la propia factura:

```php
$user->invoicePrice('price_tshirt', 5, [
    'discounts' => [
        ['coupon' => 'SUMMER21SALE']
    ],
], [
    'default_tax_rates' => ['txr_id'],
]);
```

De manera similar a `invoicePrice`, puedes utilizar el método `tabPrice` para crear un cargo único para varios artículos (hasta 250 artículos por factura) agregándolos a la "cuenta" del cliente y luego facturando al cliente. Por ejemplo, podemos facturar a un cliente por cinco camisetas y dos tazas:

```php
$user->tabPrice('price_tshirt', 5);
$user->tabPrice('price_mug', 2);
$user->invoice();
```

Alternativamente, puedes utilizar el método `invoiceFor` para realizar un cargo "único" contra el método de pago predeterminado del cliente:

```php
$user->invoiceFor('One Time Fee', 500);
```

Aunque el método `invoiceFor` está disponible para su uso, se recomienda utilizar los métodos `invoicePrice` y `tabPrice` con precios predefinidos. Al hacerlo, tendrás acceso a mejores análisis y datos dentro de tu panel de Stripe con respecto a tus ventas por producto.

> **Advertencia:**
> Los métodos `invoice`, `invoicePrice` y `invoiceFor` crearán una factura Stripe que volverá a intentar los intentos de facturación fallidos. Si no deseas que las facturas vuelvan a intentar cargos fallidos, deberás cerrarlas utilizando la API de Stripe después del primer cargo fallido.

<a id="creating-payment-intents"></a>
### Creación de intenciones de pago

Puedes crear una nueva intención de pago de Stripe invocando el método `pay` en una instancia de modelo facturable. Llamar a este método creará una intención de pago incluida en una instancia `Laravel\Cashier\Payment`:

```php
use Illuminate\Http\Request;

Route::post('/pay', function (Request $request) {
    $payment = $request->user()->pay(
        $request->get('amount')
    );

    return $payment->client_secret;
});
```

Después de crear la intención de pago, puedes devolver el secreto de cliente a la interfaz de tu aplicación para que el usuario pueda completar el pago en su navegador. Para leer más sobre cómo crear flujos de pago completos utilizando intenciones de pago de Stripe, consulta la [documentación de Stripe](https://stripe.com/docs/payments/accept-a-payment?platform=web).

Al utilizar el método `pay`, los métodos de pago predeterminados que están habilitados en tu panel de Stripe estarán disponibles para el cliente. Alternativamente, si solo deseas permitir el uso de algunos métodos de pago específicos, puedes utilizar el método `payWith`:

```php
use Illuminate\Http\Request;

Route::post('/pay', function (Request $request) {
    $payment = $request->user()->payWith(
        $request->get('amount'), ['card', 'bancontact']
    );

    return $payment->client_secret;
});
```

> **Advertencia:**
> Los métodos `pay` y `payWith` aceptan el monto del pago en el unidad mínima de la moneda utilizada por tu aplicación. Por ejemplo, si los clientes pagan en dólares estadounidenses, los montos deben especificarse en centavos.

<a id="refunding-charges"></a>
### Reembolso de cargos

Si necesitas reembolsar un pago de Stripe, puedes utilizar el método `refund`. Este método acepta el ID de intención de pago de Stripe como primer argumento:

```php
$payment = $user->charge(100, $paymentMethodId);

$user->refund($payment->id);
```

<a id="invoices"></a>
## Facturas

<a id="retrieving-invoices"></a>
### Recuperación de facturas

Puedes recuperar fácilmente una colección de facturas de un modelo facturable utilizando el método `invoices`. El método `invoices` devuelve una colección de instancias de `Laravel\Cashier\Invoice`:

```php
$invoices = $user->invoices();
```

Si deseas incluir facturas pendientes en los resultados, puedes utilizar el método `invoicesIncludingPending`:

```php
$invoices = $user->invoicesIncludingPending();
```

Puedes utilizar el método `findInvoice` para recuperar una factura específica por su ID:

```php
$invoice = $user->findInvoice($invoiceId);
```

<a id="displaying-invoice-information"></a>
#### Visualización de información de factura

Al enumerar las facturas del cliente, puedes utilizar los métodos de la factura para mostrar la información relevante de la factura. Por ejemplo, es posible que desees enumerar todas las facturas en una tabla, lo que permitirá al usuario descargar fácilmente cualquiera de ellas:

```blade
<table>
    @foreach ($invoices as $invoice)
        <tr>
            <td>{{ $invoice->date()->toFormattedDateString() }}</td>
            <td>{{ $invoice->total() }}</td>
            <td><a href="/user/invoice/{{ $invoice->id }}">Download</a></td>
        </tr>
    @endforeach
</table>
```

<a id="upcoming-invoices"></a>
### Próximas facturas

Para recuperar la próxima factura de un cliente, puedes utilizar el método `upcomingInvoice`:

```php
$invoice = $user->upcomingInvoice();
```

De manera similar, si el cliente tiene varias suscripciones, también puedes recuperar la próxima factura de una suscripción específica:

```php
$invoice = $user->subscription('default')->upcomingInvoice();
```

<a id="previewing-subscription-invoices"></a>
### Vista previa de facturas de suscripción

Con el método `previewInvoice`, puedes obtener una vista previa de una factura antes de realizar cambios de precio. Esto te permitirá determinar cómo se verá la factura de tu cliente cuando se realice un cambio de precio determinado:

```php
$invoice = $user->subscription('default')->previewInvoice('price_yearly');
```

Puedes pasar un array de precios al método `previewInvoice` para obtener una vista previa de las facturas con múltiples precios nuevos:

```php
$invoice = $user->subscription('default')->previewInvoice(['price_yearly', 'price_metered']);
```

<a id="generating-invoice-pdfs"></a>
### Generación de archivos PDF de facturas

Antes de generar archivos PDF de facturas, debes usar Composer para instalar la biblioteca Dompdf, que es el procesador de facturas predeterminado para Cashier:

```shell
composer require dompdf/dompdf
```

Desde dentro de una ruta o controlador, puedes utilizar el método `downloadInvoice` para generar una descarga en PDF de una factura determinada. Este método generará automáticamente la respuesta HTTP adecuada necesaria para descargar la factura:

```php
use Illuminate\Http\Request;

Route::get('/user/invoice/{invoice}', function (Request $request, string $invoiceId) {
    return $request->user()->downloadInvoice($invoiceId);
});
```

De forma predeterminada, todos los datos de la factura se derivan del cliente y de los datos de la factura almacenados en Stripe. El nombre del archivo se basa en tu valor de configuración `app.name`. Sin embargo, puedes personalizar algunos de estos datos proporcionando un array como segundo argumento del método `downloadInvoice`. Este array te permite personalizar información como tu empresa y los detalles del producto:

```php
return $request->user()->downloadInvoice($invoiceId, [
    'vendor' => 'Your Company',
    'product' => 'Your Product',
    'street' => 'Main Str. 1',
    'location' => '2000 Antwerp, Belgium',
    'phone' => '+32 499 00 00 00',
    'email' => 'info@example.com',
    'url' => 'https://example.com',
    'vendorVat' => 'BE123456789',
]);
```

El método `downloadInvoice` también permite un nombre de archivo personalizado a través de su tercer argumento. Este nombre de archivo tendrá automáticamente el sufijo `.pdf`:

```php
return $request->user()->downloadInvoice($invoiceId, [], 'my-invoice');
```

<a id="custom-invoice-render"></a>
#### Renderizador de facturas personalizado

Cashier también permite utilizar un renderizador de facturas personalizado. De forma predeterminada, Cashier usa la implementación `DompdfInvoiceRenderer`, que utiliza la biblioteca PHP [dompdf](https://github.com/dompdf/dompdf) para generar las facturas de Cashier. Sin embargo, puedes utilizar cualquier renderizador que desees implementando la interfaz `Laravel\Cashier\Contracts\InvoiceRenderer`. Por ejemplo, es posible que desees renderizar un PDF de factura mediante una llamada API a un servicio de renderizado de PDF de terceros:

```php
use Illuminate\Support\Facades\Http;
use Laravel\Cashier\Contracts\InvoiceRenderer;
use Laravel\Cashier\Invoice;

class ApiInvoiceRenderer implements InvoiceRenderer
{
    /**
     * Renderizar la factura indicada y devolver los bytes sin procesar del PDF.
     */
    public function render(Invoice $invoice, array $data = [], array $options = []): string
    {
        $html = $invoice->view($data)->render();

        return Http::get('https://example.com/html-to-pdf', ['html' => $html])->get()->body();
    }
}
```

Una vez que hayas implementado el contrato de renderizado de facturas, debes actualizar el valor de configuración `cashier.invoices.renderer` en el archivo de configuración `config/cashier.php` de tu aplicación. Este valor de configuración debe establecerse en el nombre de clase de tu implementación de renderizador personalizado.

<a id="checkout"></a>
## Proceso de pago

Cashier Stripe también brinda soporte para [Stripe Checkout](https://stripe.com/payments/checkout). Stripe Checkout elimina la molestia de implementar páginas personalizadas para aceptar pagos al proporcionar una página de pago alojada y prediseñada.

La siguiente documentación contiene información sobre cómo empezar a utilizar Stripe Checkout con Cashier. Para obtener más información sobre Stripe Checkout, también deberías considerar revisar [la documentación propia de Stripe en Checkout](https://stripe.com/docs/payments/checkout).

<a id="product-checkouts"></a>
### Pagos de productos

Puedes realizar un pago para un producto existente que se haya creado dentro de tu panel de Stripe utilizando el método `checkout` en un modelo facturable. El método `checkout` iniciará una nueva sesión de Stripe Checkout. De forma predeterminada, debes pasar un ID de precio de Stripe:

```php
use Illuminate\Http\Request;

Route::get('/product-checkout', function (Request $request) {
    return $request->user()->checkout('price_tshirt');
});
```

Si es necesario, también puedes especificar una cantidad de producto:

```php
use Illuminate\Http\Request;

Route::get('/product-checkout', function (Request $request) {
    return $request->user()->checkout(['price_tshirt' => 15]);
});
```

Cuando un cliente visite esta ruta, será redirigido a la página de pago de Stripe. De forma predeterminada, cuando un usuario completa o cancela con éxito una compra, será redirigido a su ubicación de ruta `home`, pero puedes especificar URL de devolución de llamada personalizadas utilizando las opciones `success_url` y `cancel_url`:

```php
use Illuminate\Http\Request;

Route::get('/product-checkout', function (Request $request) {
    return $request->user()->checkout(['price_tshirt' => 1], [
        'success_url' => route('your-success-route'),
        'cancel_url' => route('your-cancel-route'),
    ]);
});
```

Al definir tu opción de pago `success_url`, puedes indicarle a Stripe que agregue el ID de la sesión de pago como parámetro de cadena de consulta al invocar tu URL. Para hacerlo, agrega la cadena literal `{CHECKOUT_SESSION_ID}` a tu cadena de consulta `success_url`. Stripe reemplazará este marcador de posición con el ID de la sesión de pago real:

```php
use Illuminate\Http\Request;
use Stripe\Checkout\Session;
use Stripe\Customer;

Route::get('/product-checkout', function (Request $request) {
    return $request->user()->checkout(['price_tshirt' => 1], [
        'success_url' => route('checkout-success').'?session_id={CHECKOUT_SESSION_ID}',
        'cancel_url' => route('checkout-cancel'),
    ]);
});

Route::get('/checkout-success', function (Request $request) {
    $checkoutSession = $request->user()->stripe()->checkout->sessions->retrieve($request->get('session_id'));

    return view('checkout.success', ['checkoutSession' => $checkoutSession]);
})->name('checkout-success');
```

<a id="checkout-promotion-codes"></a>
#### Códigos de promoción

De forma predeterminada, Stripe Checkout no permite [códigos de promoción canjeables por el usuario](https://stripe.com/docs/billing/subscriptions/discounts/codes). Afortunadamente, existe una manera fácil de habilitarlos para tu página de pago. Para hacerlo, puedes invocar el método `allowPromotionCodes`:

```php
use Illuminate\Http\Request;

Route::get('/product-checkout', function (Request $request) {
    return $request->user()
        ->allowPromotionCodes()
        ->checkout('price_tshirt');
});
```

<a id="single-charge-checkouts"></a>
### Pagos con cargo único

También puedes realizar un cargo simple por un producto ad-hoc que no se haya creado en tu panel de Stripe. Para hacerlo, puedes utilizar el método `checkoutCharge` en un modelo facturable y pasarle un monto cobrable, un nombre de producto y una cantidad opcional. Cuando un cliente visite esta ruta, será redirigido a la página de pago de Stripe:

```php
use Illuminate\Http\Request;

Route::get('/charge-checkout', function (Request $request) {
    return $request->user()->checkoutCharge(1200, 'T-Shirt', 5);
});
```

> **Advertencia:**
> Al utilizar el método `checkoutCharge`, Stripe siempre creará un nuevo producto y precio en tu panel de Stripe. Por lo tanto, te recomendamos que crees los productos desde el principio en tu panel de Stripe y utilices el método `checkout` en su lugar.

<a id="subscription-checkouts"></a>
### Pagos de suscripción

> **Advertencia:**
> El uso de Stripe Checkout para suscripciones requiere que habilites el webhook `customer.subscription.created` en tu panel de Stripe. Este webhook creará el registro de suscripción en tu base de datos y almacenará todos los elementos de suscripción relevantes.

También puedes utilizar Stripe Checkout para iniciar suscripciones. Después de definir tu suscripción con los métodos de creación de suscripciones de Cashier, puedes llamar al método `checkout `. Cuando un cliente visite esta ruta, será redirigido a la página de pago de Stripe:

```php
use Illuminate\Http\Request;

Route::get('/subscription-checkout', function (Request $request) {
    return $request->user()
        ->newSubscription('default', 'price_monthly')
        ->checkout();
});
```

Al igual que con el pago de productos, puedes personalizar las URL de éxito y cancelación:

```php
use Illuminate\Http\Request;

Route::get('/subscription-checkout', function (Request $request) {
    return $request->user()
        ->newSubscription('default', 'price_monthly')
        ->checkout([
            'success_url' => route('your-success-route'),
            'cancel_url' => route('your-cancel-route'),
        ]);
});
```

Por supuesto, también puedes habilitar códigos de promoción para pagos de suscripción:

```php
use Illuminate\Http\Request;

Route::get('/subscription-checkout', function (Request $request) {
    return $request->user()
        ->newSubscription('default', 'price_monthly')
        ->allowPromotionCodes()
        ->checkout();
});
```

> **Advertencia:**
> Lamentablemente, Stripe Checkout no admite todas las opciones de facturación de suscripciones al iniciar suscripciones. El uso del método `anchorBillingCycleOn` en el constructor de suscripciones, la configuración del comportamiento de prorrateo o el comportamiento de pago no tendrán ningún efecto durante las sesiones de Stripe Checkout. Consulta [la documentación de la API de Stripe Checkout Session](https://stripe.com/docs/api/checkout/sessions/create) para revisar qué parámetros están disponibles.

<a id="stripe-checkout-trial-periods"></a>
#### Stripe Checkout y períodos de prueba

Por supuesto, puedes definir un período de prueba al crear una suscripción que se completará usando Stripe Checkout:

```php
$checkout = Auth::user()->newSubscription('default', 'price_monthly')
    ->trialDays(3)
    ->checkout();
```

Sin embargo, el período de prueba debe ser de al menos 48 horas, que es la cantidad mínima de tiempo de prueba admitida por Stripe Checkout.

<a id="stripe-checkout-subscriptions-and-webhooks"></a>
#### Suscripciones y webhooks

Recuerda, Stripe y Cashier actualizan los estados de suscripción a través de webhooks, por lo que existe la posibilidad de que una suscripción aún no esté activa cuando el cliente regrese a la aplicación después de ingresar su información de pago. Para manejar este escenario, es posible que desees mostrar un mensaje que informe al usuario que su pago o suscripción está pendiente.

<a id="collecting-tax-ids"></a>
### Recopilación de identificaciones fiscales

El proceso de pago también admite la recopilación de la identificación fiscal de un cliente. Para habilitar esto en una sesión de pago, invoca el método `collectTaxIds` al crear la sesión:

```php
$checkout = $user->collectTaxIds()->checkout('price_tshirt');
```

Cuando se invoca este método, una nueva casilla de verificación estará disponible para el cliente que le permitirá indicar si está comprando como empresa. De ser así, tendrá la oportunidad de proporcionar su número de identificación fiscal.

> **Advertencia:**
> Si ya configuraste [recaudación automática de impuestos](#tax-configuration) en el proveedor de servicios de tu aplicación, esta función se habilitará automáticamente y no es necesario invocar el método `collectTaxIds`.

<a id="guest-checkouts"></a>
### Pagos de invitados

Utilizando el método `Checkout::guest`, puedes iniciar sesiones de pago para invitados de tu aplicación que no tienen una "cuenta":

```php
use Illuminate\Http\Request;
use Laravel\Cashier\Checkout;

Route::get('/product-checkout', function (Request $request) {
    return Checkout::guest()->create('price_tshirt', [
        'success_url' => route('your-success-route'),
        'cancel_url' => route('your-cancel-route'),
    ]);
});
```

De manera similar a cuando creas sesiones de pago para usuarios existentes, puedes utilizar métodos adicionales disponibles en la instancia `Laravel\Cashier\CheckoutBuilder` para personalizar la sesión de pago de invitado:

```php
use Illuminate\Http\Request;
use Laravel\Cashier\Checkout;

Route::get('/product-checkout', function (Request $request) {
    return Checkout::guest()
        ->withPromotionCode('promo-code')
        ->create('price_tshirt', [
            'success_url' => route('your-success-route'),
            'cancel_url' => route('your-cancel-route'),
        ]);
});
```

Una vez completado el pago como invitado, Stripe puede enviar un evento de webhook `checkout.session.completed`, así que asegúrate de [configurar tu webhook](https://dashboard.stripe.com/webhooks) de Stripe para enviar este evento a tu aplicación. Una vez que el webhook se haya habilitado en el panel de Stripe, puedes [manejar el webhook con Cashier](#handling-stripe-webhooks). El objeto contenido en la carga útil del webhook será un [objeto de pago](https://stripe.com/docs/api/checkout/sessions/object) que podrás inspeccionar para cumplir con el pedido de tu cliente.

<a id="handling-failed-payments"></a>
## Manejo de pagos fallidos

En ocasiones, los pagos de suscripciones o cargos únicos pueden fallar. Cuando esto suceda, Cashier generará una excepción `Laravel\Cashier\Exceptions\IncompletePayment` que te informa que esto sucedió. Después de detectar esta excepción, tienes dos opciones sobre cómo proceder.

Primero, puedes redirigir a tu cliente a la página de confirmación de pago dedicada que se incluye con Cashier. Esta página ya tiene una ruta con nombre asociada que está registrada a través del proveedor de servicios de Cashier. Por lo tanto, puedes detectar la excepción `IncompletePayment` y redirigir al usuario a la página de confirmación de pago:

```php
use Laravel\Cashier\Exceptions\IncompletePayment;

try {
    $subscription = $user->newSubscription('default', 'price_monthly')
        ->create($paymentMethod);
} catch (IncompletePayment $exception) {
    return redirect()->route(
        'cashier.payment',
        [$exception->payment->id, 'redirect' => route('home')]
    );
}
```

En la página de confirmación de pago, se le pedirá al cliente que ingrese nuevamente la información de su tarjeta de crédito y realice cualquier acción adicional requerida por Stripe, como la confirmación "3D Secure". Después de confirmar su pago, el usuario será redirigido a la URL proporcionada por el parámetro `redirect` especificado anteriormente. Tras la redirección, las variables de cadena de consulta `message` (cadena) y `success` (entero) se agregarán a la URL. La página de pago actualmente admite los siguientes tipos de métodos de pago:

<div class="content-list" markdown="1">

- Tarjetas de crédito
- Alipay
- Bancontact
- Débito Directo BECS
- EPS
- Giropay
- iDEAL
- Débito Directo SEPA

</div>

Alternativamente, puedes permitir que Stripe maneje la confirmación del pago por ti. En este caso, en lugar de redirigir a la página de confirmación de pago, puedes [configurar los correos electrónicos de facturación automática de Stripe](https://dashboard.stripe.com/account/billing/automatic) en tu panel de Stripe. Sin embargo, si se detecta una excepción `IncompletePayment`, aún debes informar al usuario que recibirá un correo electrónico con más instrucciones de confirmación de pago.

Se pueden generar excepciones de pago para los siguientes métodos: `charge`, `invoiceFor` y `invoice` en modelos que utilizan el trait `Billable`. Al interactuar con suscripciones, el método `create` en los modelos `SubscriptionBuilder` y `incrementAndInvoice` y `swapAndInvoice` en los modelos `Subscription` y `SubscriptionItem` pueden generar excepciones de pago incompletos.

Se puede determinar si una suscripción existente tiene un pago incompleto utilizando el método `hasIncompletePayment` en el modelo facturable o una instancia de suscripción:

```php
if ($user->hasIncompletePayment('default')) {
    // ...
}

if ($user->subscription('default')->hasIncompletePayment()) {
    // ...
}
```

Puedes derivar el estado específico de un pago incompleto inspeccionando la propiedad `payment` en la instancia de excepción:

```php
use Laravel\Cashier\Exceptions\IncompletePayment;

try {
    $user->charge(1000, 'pm_card_threeDSecure2Required');
} catch (IncompletePayment $exception) {
    // Obtener el estado del payment intent...
    $exception->payment->status;

    // Comprobar condiciones específicas...
    if ($exception->payment->requiresPaymentMethod()) {
        // ...
    } elseif ($exception->payment->requiresConfirmation()) {
        // ...
    }
}
```

<a id="confirming-payments"></a>
### Confirmación de pagos

Algunos métodos de pago requieren datos adicionales para poder confirmar los pagos. Por ejemplo, los métodos de pago SEPA requieren datos de "mandato" adicionales durante el proceso de pago. Puedes proporcionar estos datos a Cashier utilizando el método `withPaymentConfirmationOptions`:

```php
$subscription->withPaymentConfirmationOptions([
    'mandate_data' => '...',
])->swap('price_xxx');
```

Puedes consultar la [documentación API de Stripe](https://stripe.com/docs/api/payment_intents/confirm) para revisar todas las opciones aceptadas al confirmar los pagos.

<a id="strong-customer-authentication"></a>
## Autenticación reforzada de clientes

Si tu empresa o uno de tus clientes tiene su sede en Europa, deberás cumplir con las regulaciones de autenticación reforzada de clientes (SCA) de la UE. Estas regulaciones fueron impuestas en septiembre de 2019 por la Unión Europea para prevenir el fraude en los pagos. Afortunadamente, Stripe y Cashier están preparados para crear aplicaciones compatibles con SCA.

> **Advertencia:**
> Antes de comenzar, revisa la [guía de Stripe sobre PSD2 y SCA](https://stripe.com/guides/strong-customer-authentication), así como su [documentación sobre las nuevas API de SCA](https://stripe.com/docs/strong-customer-authentication).

<a id="payments-requiring-additional-confirmation"></a>
### Pagos que requieren confirmación adicional

Las regulaciones de la SCA a menudo requieren una verificación adicional para confirmar y procesar un pago. Cuando esto sucede, Cashier generará una excepción `Laravel\Cashier\Exceptions\IncompletePayment` que te informa que se necesita verificación adicional. Puedes encontrar más información sobre cómo manejar estas excepciones en la documentación sobre [manejo de pagos fallidos](#handling-failed-payments).

Las pantallas de confirmación de pago presentadas por Stripe o Cashier pueden adaptarse al flujo de pago de un banco o emisor de tarjeta específico y pueden incluir confirmación de tarjeta adicional, un pequeño cargo temporal, autenticación de dispositivo separada u otras formas de verificación.

<a id="incomplete-and-past-due-state"></a>
#### Estado incompleto y vencido

Cuando un pago necesita confirmación adicional, la suscripción permanecerá en un estado `incomplete` o `past_due` como lo indica su columna de base de datos `stripe_status`. Cashier activará automáticamente la suscripción del cliente tan pronto como se complete la confirmación del pago y Stripe notifique a tu aplicación a través del webhook sobre su finalización.

Para obtener más información sobre los estados `incomplete` y `past_due`, consulta [nuestra documentación adicional sobre estos estados](#incomplete-and-past-due-status).

<a id="off-session-payment-notifications"></a>
### Notificaciones de pago fuera de sesión

Dado que las regulaciones de la SCA requieren que los clientes verifiquen ocasionalmente sus detalles de pago incluso mientras su suscripción está activa, Cashier puede enviar una notificación al cliente cuando se requiere confirmación de pago fuera de la sesión. Por ejemplo, esto puede ocurrir cuando se renueva una suscripción. La notificación de pago de Cashier se puede habilitar configurando la variable de entorno `CASHIER_PAYMENT_NOTIFICATION` en una clase de notificación. De forma predeterminada, esta notificación está deshabilitada. Por supuesto, Cashier incluye una clase de notificación que puedes utilizar para este propósito, pero puedes proporcionar tu propia clase de notificación si lo deseas:

```ini
CASHIER_PAYMENT_NOTIFICATION=Laravel\Cashier\Notifications\ConfirmPayment
```

Para garantizar que se entreguen las notificaciones de confirmación de pago fuera de la sesión, verifica que [los webhooks de Stripe estén configurados](#handling-stripe-webhooks) para tu aplicación y que el webhook `invoice.payment_action_required` esté habilitado en tu panel de Stripe. Además, tu modelo `Billable` también debería usar el trait `Illuminate\Notifications\Notifiable` de Laravel.

> **Advertencia:**
> Las notificaciones se enviarán incluso cuando los clientes realicen manualmente un pago que requiera confirmación adicional. Desafortunadamente, Stripe no tiene forma de saber si el pago se realizó manualmente o "fuera de sesión". Sin embargo, un cliente simplemente verá un mensaje de "Pago exitoso" si visita la página de pago después de confirmar su pago. No se permitirá al cliente confirmar accidentalmente el mismo pago dos veces e incurrir en un segundo cargo accidental.

<a id="stripe-sdk"></a>
## SDK de Stripe

Muchos de los objetos de Cashier son envoltorios de objetos del SDK de Stripe. Si deseas interactuar directamente con los objetos Stripe, puedes recuperarlos cómodamente utilizando el método `asStripe`:

```php
$stripeSubscription = $subscription->asStripeSubscription();

$stripeSubscription->application_fee_percent = 5;

$stripeSubscription->save();
```

También puedes utilizar el método `updateStripeSubscription` para actualizar una suscripción de Stripe directamente:

```php
$subscription->updateStripeSubscription(['application_fee_percent' => 5]);
```

Puedes invocar el método `stripe` en la clase `Cashier` si deseas utilizar el cliente `Stripe\StripeClient` directamente. Por ejemplo, podrías utilizar este método para acceder a la instancia `StripeClient` y recuperar una lista de precios de tu cuenta de Stripe:

```php
use Laravel\Cashier\Cashier;

$prices = Cashier::stripe()->prices->all();
```

<a id="testing"></a>
## Pruebas

Al probar una aplicación que utiliza Cashier, puedes simular las solicitudes HTTP reales a la API de Stripe; sin embargo, esto requiere que vuelvas a implementar parcialmente el comportamiento de Cashier. Por lo tanto, recomendamos permitir que tus pruebas lleguen a la API de Stripe real. Si bien esto es más lento, proporciona más confianza en que tu aplicación funciona como se espera y cualquier prueba lenta puede colocarse dentro de tu propio grupo de pruebas Pest/PHPUnit.

Al realizar la prueba, recuerda que Cashier ya tiene un excelente conjunto de pruebas, por lo que solo debes concentrarte en probar el flujo de suscripción y pago de tu propia aplicación y no todos los comportamientos subyacentes de Cashier.

Para comenzar, agrega la versión **de prueba** de tu secreto de Stripe a tu archivo `phpunit.xml`:

```xml
<env name="STRIPE_SECRET" value="sk_test_<your-key>"/>
```

Ahora, cada vez que interactúes con Cashier durante la prueba, enviará solicitudes de API reales a tu entorno de prueba de Stripe. Para tu comodidad, debes completar previamente tu cuenta de prueba de Stripe con suscripciones/precios que puedes usar durante la prueba.

> **Nota:**
> Para probar una variedad de escenarios de facturación, como rechazos y fallas de tarjetas de crédito, puedes utilizar la amplia gama de [pruebas de números de tarjetas y tokens](https://stripe.com/docs/testing) proporcionados por Stripe.
