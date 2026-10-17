---
title: "Laravel Cashier (Stripe)"
---

- [Introdução](#introduction)
- [Atualizando o Cashier](#upgrading-cashier)
- [Instalação](#installation)
- [Configuração](#configuration)
    - [Modelo Faturável (Billable)](#billable-model)
    - [Chaves de API](#api-keys)
    - [Configuração de Moeda](#currency-configuration)
    - [Configuração de Impostos](#tax-configuration)
    - [Logging](#logging)
    - [Usando Modelos Personalizados](#using-custom-models)
- [Início Rápido](#quickstart)
    - [Vendendo Produtos](#quickstart-selling-products)
    - [Vendendo Assinaturas](#quickstart-selling-subscriptions)
- [Clientes](#customers)
    - [Recuperando Clientes](#retrieving-customers)
    - [Criando Clientes](#creating-customers)
    - [Atualizando Clientes](#updating-customers)
    - [Saldos](#balances)
    - [IDs de Imposto (Tax IDs)](#tax-ids)
    - [Sincronizando Dados de Cliente com o Stripe](#syncing-customer-data-with-stripe)
    - [Portal de Billing](#billing-portal)
- [Métodos de Pagamento](#payment-methods)
    - [Armazenando Métodos de Pagamento](#storing-payment-methods)
    - [Recuperando Métodos de Pagamento](#retrieving-payment-methods)
    - [Presença de Método de Pagamento](#payment-method-presence)
    - [Atualizando o Método de Pagamento Padrão](#updating-the-default-payment-method)
    - [Adicionando Métodos de Pagamento](#adding-payment-methods)
    - [Excluindo Métodos de Pagamento](#deleting-payment-methods)
- [Assinaturas](#subscriptions)
    - [Criando Assinaturas](#creating-subscriptions)
    - [Verificando o Status da Assinatura](#checking-subscription-status)
    - [Alterando Preços](#changing-prices)
    - [Quantidade da Assinatura](#subscription-quantity)
    - [Assinaturas com Múltiplos Produtos](#subscriptions-with-multiple-products)
    - [Múltiplas Assinaturas](#multiple-subscriptions)
    - [Billing Baseado em Uso](#usage-based-billing)
    - [Impostos de Assinatura](#subscription-taxes)
    - [Data Âncora da Assinatura](#subscription-anchor-date)
    - [Cancelando Assinaturas](#cancelling-subscriptions)
    - [Retomando Assinaturas](#resuming-subscriptions)
- [Períodos de Teste de Assinatura](#subscription-trials)
    - [Com Método de Pagamento Adiantado](#with-payment-method-up-front)
    - [Sem Método de Pagamento Adiantado](#without-payment-method-up-front)
    - [Estendendo Períodos de Teste](#extending-trials)
- [Lidando com Webhooks do Stripe](#handling-stripe-webhooks)
    - [Definindo Handlers de Eventos de Webhook](#defining-webhook-event-handlers)
    - [Verificando Assinaturas de Webhook](#verifying-webhook-signatures)
- [Cobranças Únicas](#single-charges)
    - [Cobrança Simples](#simple-charge)
    - [Cobrança com Fatura](#charge-with-invoice)
    - [Criando Payment Intents](#creating-payment-intents)
    - [Reembolsando Cobranças](#refunding-charges)
- [Faturas](#invoices)
    - [Recuperando Faturas](#retrieving-invoices)
    - [Faturas Futuras](#upcoming-invoices)
    - [Pré-visualizando Faturas de Assinatura](#previewing-subscription-invoices)
    - [Gerando PDFs de Fatura](#generating-invoice-pdfs)
- [Checkout](#checkout)
    - [Checkouts de Produto](#product-checkouts)
    - [Checkouts de Cobrança Única](#single-charge-checkouts)
    - [Checkouts de Assinatura](#subscription-checkouts)
    - [Coletando IDs de Imposto](#collecting-tax-ids)
    - [Checkouts de Convidado](#guest-checkouts)
- [Lidando com Pagamentos Falhos](#handling-failed-payments)
    - [Confirmando Pagamentos](#confirming-payments)
- [Strong Customer Authentication (SCA)](#strong-customer-authentication)
    - [Pagamentos que Requerem Confirmação Adicional](#payments-requiring-additional-confirmation)
    - [Notificações de Pagamento Off-session](#off-session-payment-notifications)
- [SDK do Stripe](#stripe-sdk)
- [Testes](#testing)

<a id="introduction"></a>
## Introdução

O [Laravel Cashier Stripe](https://github.com/laravel/cashier-stripe) fornece uma interface expressiva e fluente para os serviços de billing de assinatura do [Stripe](https://stripe.com). Ele lida com quase todo o código boilerplate de billing de assinatura que você teme escrever. Além do gerenciamento básico de assinaturas, o Cashier pode lidar com cupons, troca de assinaturas, "quantidades" de assinatura, períodos de carência de cancelamento e até gerar PDFs de fatura.

<a id="upgrading-cashier"></a>
## Atualizando o Cashier

Ao atualizar para uma nova versão do Cashier, é importante que você revise cuidadosamente [o guia de atualização](https://github.com/laravel/cashier-stripe/blob/16.x/UPGRADE.md).

> **Aviso:**
> O Cashier usa a versão da API do Stripe fixada pela sua versão instalada do SDK `stripe/stripe-php`. Por exemplo, o `stripe/stripe-php` 21.x usa a versão da API do Stripe `2026-08-26.dahlia`. Como uma nova versão major do SDK do Stripe tipicamente visa uma nova versão da API do Stripe, você deve revisar o [changelog da API do Stripe](https://docs.stripe.com/changelog) antes de atualizar o `stripe/stripe-php` para uma nova versão major.

<a id="installation"></a>
## Instalação

Primeiro, instale o pacote Cashier para Stripe usando o gerenciador de pacotes Composer:

```shell
composer require laravel/cashier
```

Após instalar o pacote, publique as migrations do Cashier usando o comando Artisan `vendor:publish`:

```shell
php artisan vendor:publish --tag="cashier-migrations"
```

Então, faça a migração do seu banco de dados:

```shell
php artisan migrate
```

As migrations do Cashier adicionarão várias colunas à sua tabela `users`. Elas também criarão uma nova tabela `subscriptions` para guardar todas as assinaturas dos seus clientes e uma tabela `subscription_items` para assinaturas com múltiplos preços.

Se desejar, você também pode publicar o arquivo de configuração do Cashier usando o comando Artisan `vendor:publish`:

```shell
php artisan vendor:publish --tag="cashier-config"
```

Por fim, para garantir que o Cashier lide adequadamente com todos os eventos do Stripe, lembre-se de [configurar o tratamento de webhooks do Cashier](#handling-stripe-webhooks).

> **Aviso:**
> O Stripe recomenda que qualquer coluna usada para armazenar identificadores do Stripe seja sensível a maiúsculas e minúsculas (case-sensitive). Portanto, você deve garantir que a collation da coluna `stripe_id` esteja definida como `utf8_bin` ao usar MySQL. Mais informações sobre isso podem ser encontradas na [documentação do Stripe](https://stripe.com/docs/upgrades#what-changes-does-stripe-consider-to-be-backwards-compatible).

<a id="configuration"></a>
## Configuração

<a id="billable-model"></a>
### Modelo Faturável (Billable)

Antes de usar o Cashier, adicione a trait `Billable` à definição do seu modelo faturável. Tipicamente, este será o modelo `App\Models\User`. Essa trait fornece vários métodos que permitem que você realize tarefas comuns de billing, como criar assinaturas, aplicar cupons e atualizar informações de método de pagamento:

```php
use Laravel\Cashier\Billable;

class User extends Authenticatable
{
    use Billable;
}
```

O Cashier assume que o seu modelo faturável será a classe `App\Models\User` que vem com o Laravel. Se você quiser mudar isso, você pode especificar um modelo diferente por meio do método `useCustomerModel`. Esse método tipicamente deve ser chamado no método `boot` da sua classe `AppServiceProvider`:

```php
use App\Models\Cashier\User;
use Laravel\Cashier\Cashier;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Cashier::useCustomerModel(User::class);
}
```

> **Aviso:**
> Se você estiver usando um modelo diferente do modelo `App\Models\User` fornecido pelo Laravel, você precisará publicar e alterar as [migrations do Cashier](#installation) fornecidas para corresponder ao nome da tabela do seu modelo alternativo.

<a id="api-keys"></a>
### Chaves de API

Em seguida, você deve configurar suas chaves de API do Stripe no arquivo `.env` da sua aplicação. Você pode recuperar suas chaves de API do Stripe no painel de controle do Stripe:

```ini
STRIPE_KEY=your-stripe-key
STRIPE_SECRET=your-stripe-secret
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```

> **Aviso:**
> Você deve garantir que a variável de ambiente `STRIPE_WEBHOOK_SECRET` esteja definida no arquivo `.env` da sua aplicação, pois essa variável é usada para garantir que os webhooks recebidos são realmente do Stripe.

<a id="currency-configuration"></a>
### Configuração de Moeda

A moeda padrão do Cashier é o Dólar dos Estados Unidos (USD). Você pode alterar a moeda padrão definindo a variável de ambiente `CASHIER_CURRENCY` no arquivo `.env` da sua aplicação:

```ini
CASHIER_CURRENCY=eur
```

Além de configurar a moeda do Cashier, você também pode especificar um locale a ser usado ao formatar valores monetários para exibição em faturas. Internamente, o Cashier utiliza a [classe `NumberFormatter` do PHP](https://www.php.net/manual/en/class.numberformatter.php) para definir o locale da moeda:

```ini
CASHIER_CURRENCY_LOCALE=nl_BE
```

> **Aviso:**
> Para usar locales diferentes de `en`, garanta que a extensão PHP `ext-intl` esteja instalada e configurada no seu servidor.

<a id="tax-configuration"></a>
### Configuração de Impostos

Graças ao [Stripe Tax](https://stripe.com/tax), é possível calcular automaticamente impostos para todas as faturas geradas pelo Stripe. Você pode habilitar o cálculo automático de impostos invocando o método `calculateTaxes` no método `boot` da classe `App\Providers\AppServiceProvider` da sua aplicação:

```php
use Laravel\Cashier\Cashier;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Cashier::calculateTaxes();
}
```

Uma vez que o cálculo de impostos tenha sido habilitado, quaisquer novas assinaturas e quaisquer faturas avulsas que forem geradas receberão cálculo automático de impostos.

Para que esse recurso funcione adequadamente, os detalhes de billing do seu cliente, como o nome, endereço e ID de imposto do cliente, precisam ser sincronizados com o Stripe. Você pode usar os métodos de [sincronização de dados do cliente](#syncing-customer-data-with-stripe) e de [ID de Imposto](#tax-ids) oferecidos pelo Cashier para fazer isso.

<a id="logging"></a>
### Logging

O Cashier permite que você especifique o canal de log a ser usado ao registrar erros fatais do Stripe. Você pode especificar o canal de log definindo a variável de ambiente `CASHIER_LOGGER` no arquivo `.env` da sua aplicação:

```ini
CASHIER_LOGGER=stack
```

Exceções que são geradas por chamadas de API ao Stripe serão registradas por meio do canal de log padrão da sua aplicação.

<a id="using-custom-models"></a>
### Usando Modelos Personalizados

Você é livre para estender os modelos usados internamente pelo Cashier definindo seu próprio modelo e estendendo o modelo correspondente do Cashier:

```php
use Laravel\Cashier\Subscription as CashierSubscription;

class Subscription extends CashierSubscription
{
    // ...
}
```

Após definir seu modelo, você pode instruir o Cashier a usar seu modelo personalizado por meio da classe `Laravel\Cashier\Cashier`. Tipicamente, você deve informar o Cashier sobre seus modelos personalizados no método `boot` da classe `App\Providers\AppServiceProvider` da sua aplicação:

```php
use App\Models\Cashier\Subscription;
use App\Models\Cashier\SubscriptionItem;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Cashier::useSubscriptionModel(Subscription::class);
    Cashier::useSubscriptionItemModel(SubscriptionItem::class);
}
```

<a id="quickstart"></a>
## Início Rápido

<a id="quickstart-selling-products"></a>
### Vendendo Produtos

> **Nota:**
> Antes de utilizar o Stripe Checkout, você deve definir Produtos com preços fixos no seu dashboard do Stripe. Além disso, você deve [configurar o tratamento de webhooks do Cashier](#handling-stripe-webhooks).

Oferecer billing de produtos e assinaturas por meio da sua aplicação pode ser intimidante. No entanto, graças ao Cashier e ao [Stripe Checkout](https://stripe.com/payments/checkout), você pode construir facilmente integrações de pagamento modernas e robustas.

Para cobrar clientes por produtos não recorrentes de cobrança única, utilizaremos o Cashier para direcionar os clientes ao Stripe Checkout, onde eles fornecerão seus detalhes de pagamento e confirmarão sua compra. Uma vez que o pagamento tenha sido feito via Checkout, o cliente será redirecionado a uma URL de sucesso de sua escolha dentro da sua aplicação:

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

Como você pode ver no exemplo acima, utilizaremos o método `checkout` fornecido pelo Cashier para redirecionar o cliente ao Stripe Checkout para um dado "identificador de preço". Ao usar o Stripe, "preços" referem-se a [preços definidos para produtos específicos](https://stripe.com/docs/products-prices/how-products-and-prices-work).

Se necessário, o método `checkout` automaticamente criará um cliente no Stripe e conectará aquele registro de cliente do Stripe ao usuário correspondente no banco de dados da sua aplicação. Após completar a sessão de checkout, o cliente será redirecionado a uma página dedicada de sucesso ou cancelamento onde você pode exibir uma mensagem informativa ao cliente.

<a id="providing-meta-data-to-stripe-checkout"></a>
#### Fornecendo Metadados ao Stripe Checkout

Ao vender produtos, é comum manter o controle de pedidos concluídos e produtos comprados por meio de modelos `Cart` e `Order` definidos pela sua própria aplicação. Ao redirecionar os clientes ao Stripe Checkout para completar uma compra, você pode precisar fornecer um identificador de pedido existente para que você possa associar a compra concluída ao pedido correspondente quando o cliente for redirecionado de volta à sua aplicação.

Para fazer isso, você pode fornecer um array de `metadata` ao método `checkout`. Vamos imaginar que um `Order` pendente é criado dentro da nossa aplicação quando um usuário inicia o processo de checkout. Lembre-se, os modelos `Cart` e `Order` neste exemplo são ilustrativos e não são fornecidos pelo Cashier. Você é livre para implementar esses conceitos com base nas necessidades da sua própria aplicação:

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

Como você pode ver no exemplo acima, quando um usuário inicia o processo de checkout, forneceremos todos os identificadores de preço do Stripe associados ao cart / order ao método `checkout`. É claro que a sua aplicação é responsável por associar esses itens ao "carrinho de compras" ou pedido conforme o cliente os adiciona. Também fornecemos o ID do pedido à sessão do Stripe Checkout por meio do array `metadata`. Por fim, adicionamos a variável de template `CHECKOUT_SESSION_ID` à rota de sucesso do Checkout. Quando o Stripe redireciona os clientes de volta à sua aplicação, essa variável de template será automaticamente preenchida com o ID da sessão de Checkout.

Em seguida, vamos construir a rota de sucesso do Checkout. Esta é a rota à qual os usuários serão redirecionados após sua compra ter sido concluída via Stripe Checkout. Dentro dessa rota, podemos recuperar o ID da sessão do Stripe Checkout e a instância do Stripe Checkout associada para acessar nossos metadados fornecidos e atualizar o pedido do nosso cliente adequadamente:

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

Consulte a documentação do Stripe para mais informações sobre os [dados contidos pelo objeto de sessão do Checkout](https://stripe.com/docs/api/checkout/sessions/object).

<a id="quickstart-selling-subscriptions"></a>
### Vendendo Assinaturas

> **Nota:**
> Antes de utilizar o Stripe Checkout, você deve definir Produtos com preços fixos no seu dashboard do Stripe. Além disso, você deve [configurar o tratamento de webhooks do Cashier](#handling-stripe-webhooks).

Oferecer billing de produtos e assinaturas por meio da sua aplicação pode ser intimidante. No entanto, graças ao Cashier e ao [Stripe Checkout](https://stripe.com/payments/checkout), você pode construir facilmente integrações de pagamento modernas e robustas.

Para aprender como vender assinaturas usando Cashier e Stripe Checkout, vamos considerar o cenário simples de um serviço de assinatura com um plano mensal básico (`price_basic_monthly`) e anual (`price_basic_yearly`). Esses dois preços poderiam ser agrupados sob um produto "Basic" (`pro_basic`) no nosso dashboard do Stripe. Além disso, nosso serviço de assinatura pode oferecer um plano Expert como `pro_expert`.

Primeiro, vamos descobrir como um cliente pode assinar nossos serviços. É claro que você pode imaginar que o cliente clicaria em um botão "subscribe" para o plano Basic na página de preços da nossa aplicação. Esse botão ou link deve direcionar o usuário a uma rota do Laravel que cria a sessão do Stripe Checkout para o plano escolhido:

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

Como você pode ver no exemplo acima, redirecionaremos o cliente a uma sessão do Stripe Checkout que permitirá que ele assine nosso plano Basic. Após um checkout ou cancelamento bem-sucedido, o cliente será redirecionado de volta à URL que fornecemos ao método `checkout`. Para saber quando sua assinatura realmente começou (já que alguns métodos de pagamento requerem alguns segundos para processar), também precisaremos [configurar o tratamento de webhooks do Cashier](#handling-stripe-webhooks).

Agora que os clientes podem iniciar assinaturas, precisamos restringir certas partes da nossa aplicação de forma que apenas usuários assinantes possam acessá-las. É claro que podemos sempre determinar o status de assinatura atual de um usuário por meio do método `subscribed` fornecido pela trait `Billable` do Cashier:

```blade
@if ($user->subscribed())
    <p>You are subscribed.</p>
@endif
```

Podemos até determinar facilmente se um usuário é assinante de um produto ou preço específico:

```blade
@if ($user->subscribedToProduct('pro_basic'))
    <p>You are subscribed to our Basic product.</p>
@endif

@if ($user->subscribedToPrice('price_basic_monthly'))
    <p>You are subscribed to our monthly Basic plan.</p>
@endif
```

<a id="quickstart-building-a-subscribed-middleware"></a>
#### Construindo um Middleware de Assinante

Por conveniência, você pode querer criar um [middleware](/en/middleware/) que determina se a requisição recebida é de um usuário assinante. Uma vez que esse middleware tenha sido definido, você pode facilmente atribuí-lo a uma rota para impedir que usuários que não são assinantes acessem a rota:

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
            return redirect('/billing');
        }

        return $next($request);
    }
}
```

Uma vez que o middleware tenha sido definido, você pode atribuí-lo a uma rota:

```php
use App\Http\Middleware\Subscribed;

Route::get('/dashboard', function () {
    // ...
})->middleware([Subscribed::class]);
```

<a id="quickstart-allowing-customers-to-manage-their-billing-plan"></a>
#### Permitindo que Clientes Gerenciem seu Plano de Billing

É claro que os clientes podem querer mudar seu plano de assinatura para outro produto ou "tier". A maneira mais fácil de permitir isso é direcionando os clientes ao [Customer Billing Portal](https://stripe.com/docs/no-code/customer-portal) do Stripe, que fornece uma interface de usuário hospedada que permite que os clientes baixem faturas, atualizem seu método de pagamento e mudem de planos de assinatura.

Primeiro, defina um link ou botão dentro da sua aplicação que direcione os usuários a uma rota do Laravel que utilizaremos para iniciar uma sessão do Billing Portal:

```blade
<a href="{{ route('billing') }}">
    Billing
</a>
```

Em seguida, vamos definir a rota que inicia uma sessão do Stripe Customer Billing Portal e redireciona o usuário ao Portal. O método `redirectToBillingPortal` aceita a URL à qual os usuários devem ser retornados ao sair do Portal:

```php
use Illuminate\Http\Request;

Route::get('/billing', function (Request $request) {
    return $request->user()->redirectToBillingPortal(route('dashboard'));
})->middleware(['auth'])->name('billing');
```

> **Nota:**
> Desde que você tenha configurado o tratamento de webhooks do Cashier, o Cashier automaticamente manterá as tabelas de banco de dados da sua aplicação relacionadas ao Cashier em sincronia inspecionando os webhooks recebidos do Stripe. Assim, por exemplo, quando um usuário cancela sua assinatura via Stripe Customer Billing Portal, o Cashier receberá o webhook correspondente e marcará a assinatura como "canceled" no banco de dados da sua aplicação.

<a id="customers"></a>
## Clientes

<a id="retrieving-customers"></a>
### Recuperando Clientes

Você pode recuperar um cliente por seu Stripe ID usando o método `Cashier::findBillable`. Esse método retornará uma instância do modelo faturável:

```php
use Laravel\Cashier\Cashier;

$user = Cashier::findBillable($stripeId);
```

<a id="creating-customers"></a>
### Criando Clientes

Ocasionalmente, você pode querer criar um cliente do Stripe sem iniciar uma assinatura. Você pode fazer isso usando o método `createAsStripeCustomer`:

```php
$stripeCustomer = $user->createAsStripeCustomer();
```

Uma vez que o cliente tenha sido criado no Stripe, você pode iniciar uma assinatura em uma data posterior. Você pode fornecer um array `$options` opcional para passar quaisquer [parâmetros adicionais de criação de cliente que sejam suportados pela API do Stripe](https://stripe.com/docs/api/customers/create):

```php
$stripeCustomer = $user->createAsStripeCustomer($options);
```

Você pode usar o método `asStripeCustomer` se quiser retornar o objeto de cliente do Stripe para um modelo faturável:

```php
$stripeCustomer = $user->asStripeCustomer();
```

O método `createOrGetStripeCustomer` pode ser usado se você quiser recuperar o objeto de cliente do Stripe para um dado modelo faturável mas não tiver certeza se o modelo faturável já é um cliente no Stripe. Esse método criará um novo cliente no Stripe se um ainda não existir:

```php
$stripeCustomer = $user->createOrGetStripeCustomer();
```

<a id="updating-customers"></a>
### Atualizando Clientes

Ocasionalmente, você pode querer atualizar o cliente do Stripe diretamente com informações adicionais. Você pode fazer isso usando o método `updateStripeCustomer`. Esse método aceita um array de [opções de atualização de cliente suportadas pela API do Stripe](https://stripe.com/docs/api/customers/update):

```php
$stripeCustomer = $user->updateStripeCustomer($options);
```

<a id="balances"></a>
### Saldos

O Stripe permite que você credite ou debite o "saldo" (balance) de um cliente. Posteriormente, esse saldo será creditado ou debitado em novas faturas. Para verificar o saldo total do cliente, você pode usar o método `balance` que está disponível no seu modelo faturável. O método `balance` retornará uma representação em string formatada do saldo na moeda do cliente:

```php
$balance = $user->balance();
```

Para creditar o saldo de um cliente, você pode fornecer um valor ao método `creditBalance`. Se desejar, você também pode fornecer uma descrição:

```php
$user->creditBalance(500, 'Premium customer top-up.');
```

Fornecer um valor ao método `debitBalance` debitará o saldo do cliente:

```php
$user->debitBalance(300, 'Bad usage penalty.');
```

O método `applyBalance` criará novas transações de saldo de cliente para o cliente. Você pode recuperar esses registros de transação usando o método `balanceTransactions`, o que pode ser útil para fornecer um log de créditos e débitos para o cliente revisar:

```php
// Retrieve all transactions...
$transactions = $user->balanceTransactions();

foreach ($transactions as $transaction) {
    // Transaction amount...
    $amount = $transaction->amount(); // $2.31

    // Retrieve the related invoice when available...
    $invoice = $transaction->invoice();
}
```

<a id="tax-ids"></a>
### IDs de Imposto (Tax IDs)

O Cashier oferece uma maneira fácil de gerenciar os tax IDs de um cliente. Por exemplo, o método `taxIds` pode ser usado para recuperar todos os [tax IDs](https://stripe.com/docs/api/customer_tax_ids/object) que estão atribuídos a um cliente como uma collection:

```php
$taxIds = $user->taxIds();
```

Você também pode recuperar um tax ID específico de um cliente por seu identificador:

```php
$taxId = $user->findTaxId('txi_belgium');
```

Você pode criar um novo Tax ID fornecendo um [tipo](https://stripe.com/docs/api/customer_tax_ids/object#tax_id_object-type) válido e um valor ao método `createTaxId`:

```php
$taxId = $user->createTaxId('eu_vat', 'BE0123456789');
```

O método `createTaxId` adicionará imediatamente o VAT ID à conta do cliente. [A verificação de VAT IDs também é feita pelo Stripe](https://stripe.com/docs/invoicing/customer/tax-ids#validation); no entanto, esse é um processo assíncrono. Você pode ser notificado sobre atualizações de verificação assinando o evento de webhook `customer.tax_id.updated` e inspecionando [o parâmetro `verification` dos VAT IDs](https://stripe.com/docs/api/customer_tax_ids/object#tax_id_object-verification). Para mais informações sobre lidar com webhooks, consulte a [documentação sobre definição de handlers de webhook](#handling-stripe-webhooks).

Você pode excluir um tax ID usando o método `deleteTaxId`:

```php
$user->deleteTaxId('txi_belgium');
```

<a id="syncing-customer-data-with-stripe"></a>
### Sincronizando Dados de Cliente com o Stripe

Tipicamente, quando os usuários da sua aplicação atualizam seu nome, endereço de e-mail ou outras informações que também são armazenadas pelo Stripe, você deve informar o Stripe sobre as atualizações. Ao fazer isso, a cópia das informações do Stripe estará em sincronia com a da sua aplicação.

Para automatizar isso, você pode definir um listener de evento no seu modelo faturável que reaja ao evento `updated` do modelo. Então, dentro do seu listener de evento, você pode invocar o método `syncStripeCustomerDetails` no modelo:

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

Agora, toda vez que o seu modelo de cliente for atualizado, suas informações serão sincronizadas com o Stripe. Por conveniência, o Cashier sincronizará automaticamente as informações do seu cliente com o Stripe na criação inicial do cliente.

Você pode personalizar as colunas usadas para sincronizar informações de cliente com o Stripe sobrescrevendo uma variedade de métodos fornecidos pelo Cashier. Por exemplo, você pode sobrescrever o método `stripeName` para personalizar o atributo que deve ser considerado o "nome" do cliente quando o Cashier sincroniza informações de cliente com o Stripe:

```php
/**
 * Get the customer name that should be synced to Stripe.
 */
public function stripeName(): string|null
{
    return $this->company_name;
}
```

Da mesma forma, você pode sobrescrever os métodos `stripeEmail`, `stripePhone` (máximo de 20 caracteres), `stripeAddress` e `stripePreferredLocales`. Esses métodos sincronizarão informações com seus parâmetros de cliente correspondentes ao [atualizar o objeto de cliente do Stripe](https://stripe.com/docs/api/customers/update). Se você quiser ter controle total sobre o processo de sincronização de informações do cliente, você pode sobrescrever o método `syncStripeCustomerDetails`.

<a id="billing-portal"></a>
### Portal de Billing

O Stripe oferece [uma maneira fácil de configurar um portal de billing](https://stripe.com/docs/billing/subscriptions/customer-portal) para que o seu cliente possa gerenciar sua assinatura, métodos de pagamento e visualizar seu histórico de billing. Você pode redirecionar seus usuários ao portal de billing invocando o método `redirectToBillingPortal` no modelo faturável a partir de um controller ou rota:

```php
use Illuminate\Http\Request;

Route::get('/billing-portal', function (Request $request) {
    return $request->user()->redirectToBillingPortal();
});
```

Por padrão, quando o usuário termina de gerenciar sua assinatura, ele poderá retornar à rota `home` da sua aplicação por meio de um link dentro do portal de billing do Stripe. Você pode fornecer uma URL personalizada à qual o usuário deve retornar passando a URL como um argumento ao método `redirectToBillingPortal`:

```php
use Illuminate\Http\Request;

Route::get('/billing-portal', function (Request $request) {
    return $request->user()->redirectToBillingPortal(route('billing'));
});
```

Se você quiser gerar a URL para o portal de billing sem gerar uma resposta de redirecionamento HTTP, você pode invocar o método `billingPortalUrl`:

```php
$url = $request->user()->billingPortalUrl(route('billing'));
```

<a id="payment-methods"></a>
## Métodos de Pagamento

<a id="storing-payment-methods"></a>
### Armazenando Métodos de Pagamento

Para criar assinaturas ou realizar cobranças "avulsas" com o Stripe, sua aplicação precisará coletar com segurança os detalhes de pagamento do cliente. A abordagem usada para fazer isso difere com base em se você planeja armazenar o método de pagamento para futuras assinaturas ou processar imediatamente uma única cobrança, portanto examinaremos ambas abaixo.

O [Payment Element](https://stripe.com/docs/payments/payment-element) do Stripe pode ser usado para suportar múltiplos métodos de pagamento, como cartões, Apple Pay, Google Pay e iDEAL.

<a id="payment-element-for-subscriptions"></a>
#### Payment Element para Assinaturas

Primeiro, crie um Setup Intent e passe-o para sua view:

```php
return view('subscribe', [
    'intent' => $user->createSetupIntent()
]);
```

Monte o Payment Element usando o `client_secret` do Setup Intent:

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
            // Display "error.message" to the user...
        }
    });
</script>
```

Após o Stripe redirecionar para o seu `return_url`, o ID do `setup_intent` estará disponível como um parâmetro de query string. Você pode usar esse valor para recuperar o método de pagamento e criar a assinatura:

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

Se você estiver usando o Payment Element para atualizar o método de pagamento padrão de um cliente em vez de criar uma assinatura, você pode passar o identificador do método de pagamento ao método [`updateDefaultPaymentMethod`](#updating-the-default-payment-method).

<a id="payment-element-for-single-charges"></a>
#### Payment Element para Cobranças Únicas

Para pagamentos avulsos, crie um Payment Intent usando o método `pay` do Cashier. Tipicamente, você deve armazenar o ID do Payment Intent no pedido correspondente da sua aplicação de forma que o pedido possa ser recuperado após o Stripe redirecionar o cliente de volta à sua aplicação. O exemplo a seguir assume que a sua aplicação tem um modelo `Order` com colunas `user_id`, `amount`, `status` e `stripe_payment_intent_id`:

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

Então, monte o Payment Element e confirme o pagamento:

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
            // Display "error.message" to the user...
        }
    });
</script>
```

Após o redirecionamento, você pode usar o parâmetro de query string `payment_intent` para recuperar o pedido correspondente e o Payment Intent. Antes de atender ao pedido, você deve verificar que o pedido pertence ao cliente autenticado e que o Payment Intent pertence ao cliente autenticado e foi bem-sucedido:

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

        // Fulfill the order...
    }

    return redirect('/dashboard');
})->name('payment.complete');
```

<a id="retrieving-payment-methods"></a>
### Recuperando Métodos de Pagamento

O método `paymentMethods` na instância do modelo faturável retorna uma collection de instâncias de `Laravel\Cashier\PaymentMethod`:

```php
$paymentMethods = $user->paymentMethods();
```

Por padrão, esse método retornará métodos de pagamento de todos os tipos. Para recuperar métodos de pagamento de um tipo específico, você pode passar o `type` como um argumento ao método:

```php
$paymentMethods = $user->paymentMethods('sepa_debit');
```

Para recuperar o método de pagamento padrão do cliente, o método `defaultPaymentMethod` pode ser usado:

```php
$paymentMethod = $user->defaultPaymentMethod();
```

Você pode recuperar um método de pagamento específico que está anexado ao modelo faturável usando o método `findPaymentMethod`:

```php
$paymentMethod = $user->findPaymentMethod($paymentMethodId);
```

<a id="payment-method-presence"></a>
### Presença de Método de Pagamento

Para determinar se um modelo faturável tem um método de pagamento padrão anexado à sua conta, invoque o método `hasDefaultPaymentMethod`:

```php
if ($user->hasDefaultPaymentMethod()) {
    // ...
}
```

Você pode usar o método `hasPaymentMethod` para determinar se um modelo faturável tem pelo menos um método de pagamento anexado à sua conta:

```php
if ($user->hasPaymentMethod()) {
    // ...
}
```

Esse método determinará se o modelo faturável tem algum método de pagamento. Para determinar se um método de pagamento de um tipo específico existe para o modelo, você pode passar o `type` como um argumento ao método:

```php
if ($user->hasPaymentMethod('sepa_debit')) {
    // ...
}
```

<a id="updating-the-default-payment-method"></a>
### Atualizando o Método de Pagamento Padrão

O método `updateDefaultPaymentMethod` pode ser usado para atualizar as informações do método de pagamento padrão de um cliente. Esse método aceita um identificador de método de pagamento do Stripe e atribuirá o novo método de pagamento como o método de pagamento de billing padrão:

```php
$user->updateDefaultPaymentMethod($paymentMethod);
```

Para sincronizar as informações do seu método de pagamento padrão com as informações do método de pagamento padrão do cliente no Stripe, você pode usar o método `updateDefaultPaymentMethodFromStripe`:

```php
$user->updateDefaultPaymentMethodFromStripe();
```

> **Aviso:**
> O método de pagamento padrão em um cliente só pode ser usado para faturamento e para criar novas assinaturas. Devido a limitações impostas pelo Stripe, ele não pode ser usado para cobranças únicas.

<a id="adding-payment-methods"></a>
### Adicionando Métodos de Pagamento

Para adicionar um novo método de pagamento, você pode chamar o método `addPaymentMethod` no modelo faturável, passando o identificador do método de pagamento:

```php
$user->addPaymentMethod($paymentMethod);
```

> **Nota:**
> Para aprender como recuperar identificadores de método de pagamento, revise a [documentação de armazenamento de métodos de pagamento](#storing-payment-methods).

<a id="deleting-payment-methods"></a>
### Excluindo Métodos de Pagamento

Para excluir um método de pagamento, você pode chamar o método `delete` na instância de `Laravel\Cashier\PaymentMethod` que deseja excluir:

```php
$paymentMethod->delete();
```

O método `deletePaymentMethod` excluirá um método de pagamento específico do modelo faturável:

```php
$user->deletePaymentMethod('pm_visa');
```

O método `deletePaymentMethods` excluirá todas as informações de método de pagamento do modelo faturável:

```php
$user->deletePaymentMethods();
```

Por padrão, esse método excluirá métodos de pagamento de todos os tipos. Para excluir métodos de pagamento de um tipo específico, você pode passar o `type` como um argumento ao método:

```php
$user->deletePaymentMethods('sepa_debit');
```

> **Aviso:**
> Se um usuário tem uma assinatura ativa, sua aplicação não deve permitir que ele exclua seu método de pagamento padrão.

<a id="subscriptions"></a>
## Assinaturas

Assinaturas fornecem uma maneira de configurar pagamentos recorrentes para os seus clientes. As assinaturas do Stripe gerenciadas pelo Cashier fornecem suporte para múltiplos preços de assinatura, quantidades de assinatura, períodos de teste e mais.

<a id="creating-subscriptions"></a>
### Criando Assinaturas

Para criar uma assinatura, primeiro recupere uma instância do seu modelo faturável, que tipicamente será uma instância de `App\Models\User`. Uma vez que você recuperou a instância do modelo, você pode usar o método `newSubscription` para criar a assinatura do modelo:

```php
use Illuminate\Http\Request;

Route::post('/user/subscribe', function (Request $request) {
    $request->user()->newSubscription(
        'default', 'price_monthly'
    )->create($request->paymentMethodId);

    // ...
});
```

O primeiro argumento passado ao método `newSubscription` deve ser o tipo interno da assinatura. Se a sua aplicação só oferece uma única assinatura, você pode chamá-la de `default` ou `primary`. Esse tipo de assinatura é apenas para uso interno da aplicação e não se destina a ser exibido aos usuários. Além disso, ele não deve conter espaços e nunca deve ser alterado após criar a assinatura. O segundo argumento é o preço específico que o usuário está assinando. Esse valor deve corresponder ao identificador do preço no Stripe.

O método `create`, que aceita [um identificador de método de pagamento do Stripe](#storing-payment-methods) ou um objeto `PaymentMethod` do Stripe, iniciará a assinatura bem como atualizará seu banco de dados com o ID de cliente do Stripe do modelo faturável e outras informações relevantes de billing.

> **Aviso:**
> Passar um identificador de método de pagamento diretamente ao método de assinatura `create` também o adicionará automaticamente aos métodos de pagamento armazenados do usuário.

<a id="collecting-recurring-payments-via-invoice-emails"></a>
#### Coletando Pagamentos Recorrentes via E-mails de Fatura

Em vez de coletar os pagamentos recorrentes de um cliente automaticamente, você pode instruir o Stripe a enviar por e-mail uma fatura ao cliente cada vez que seu pagamento recorrente vencer. Então, o cliente pode pagar manualmente a fatura assim que a receber. O cliente não precisa fornecer um método de pagamento adiantado ao coletar pagamentos recorrentes via faturas:

```php
$user->newSubscription('default', 'price_monthly')->createAndSendInvoice();
```

A quantidade de tempo que um cliente tem para pagar sua fatura antes que sua assinatura seja cancelada é determinada pela opção `days_until_due`. Por padrão, isso é 30 dias; no entanto, você pode fornecer um valor específico para essa opção se desejar:

```php
$user->newSubscription('default', 'price_monthly')->createAndSendInvoice([], [
    'days_until_due' => 30
]);
```

<a id="subscription-quantities"></a>
#### Quantidades

Se você quiser definir uma [quantidade](https://stripe.com/docs/billing/subscriptions/quantities) específica para o preço ao criar a assinatura, você deve invocar o método `quantity` no builder de assinatura antes de criar a assinatura:

```php
$user->newSubscription('default', 'price_monthly')
    ->quantity(5)
    ->create($paymentMethod);
```

<a id="additional-details"></a>
#### Detalhes Adicionais

Se você quiser especificar opções adicionais de [cliente](https://stripe.com/docs/api/customers/create) ou [assinatura](https://stripe.com/docs/api/subscriptions/create) suportadas pelo Stripe, você pode fazer isso passando-as como o segundo e terceiro argumentos ao método `create`:

```php
$user->newSubscription('default', 'price_monthly')->create($paymentMethod, [
    'email' => $email,
], [
    'metadata' => ['note' => 'Some extra information.'],
]);
```

<a id="coupons"></a>
#### Cupons

Se você quiser aplicar um cupom ao criar a assinatura, você pode usar o método `withCoupon`:

```php
$user->newSubscription('default', 'price_monthly')
    ->withCoupon('code')
    ->create($paymentMethod);
```

Ou, se você quiser aplicar um [código promocional do Stripe](https://stripe.com/docs/billing/subscriptions/discounts/codes), você pode usar o método `withPromotionCode`:

```php
$user->newSubscription('default', 'price_monthly')
    ->withPromotionCode('promo_code_id')
    ->create($paymentMethod);
```

O ID do código promocional fornecido deve ser o ID da API do Stripe atribuído ao código promocional e não o código promocional voltado para o cliente. Se você precisar encontrar um ID de código promocional com base em um dado código promocional voltado para o cliente, você pode usar o método `findPromotionCode`:

```php
// Find a promotion code ID by its customer facing code...
$promotionCode = $user->findPromotionCode('SUMMERSALE');

// Find an active promotion code ID by its customer facing code...
$promotionCode = $user->findActivePromotionCode('SUMMERSALE');
```

No exemplo acima, o objeto `$promotionCode` retornado é uma instância de `Laravel\Cashier\PromotionCode`. Essa classe decora um objeto `Stripe\PromotionCode` subjacente. Você pode recuperar o cupom relacionado ao código promocional invocando o método `coupon`:

```php
$coupon = $user->findPromotionCode('SUMMERSALE')->coupon();
```

A instância do cupom permite que você determine o valor do desconto e se o cupom representa um desconto fixo ou um desconto baseado em percentual:

```php
if ($coupon->isPercentage()) {
    return $coupon->percentOff().'%'; // 21.5%
} else {
    return $coupon->amountOff(); // $5.99
}
```

Você também pode recuperar os descontos que estão atualmente aplicados a um cliente ou assinatura:

```php
$discount = $billable->discount();

$discount = $subscription->discount();
```

As instâncias de `Laravel\Cashier\Discount` retornadas decoram uma instância de objeto `Stripe\Discount` subjacente. Você pode recuperar o cupom relacionado a esse desconto invocando o método `coupon`:

```php
$coupon = $subscription->discount()->coupon();
```

Se você quiser aplicar um novo cupom ou código promocional a um cliente ou assinatura, você pode fazer isso por meio dos métodos `applyCoupon` ou `applyPromotionCode`:

```php
$billable->applyCoupon('coupon_id');
$billable->applyPromotionCode('promotion_code_id');

$subscription->applyCoupon('coupon_id');
$subscription->applyPromotionCode('promotion_code_id');
```

Lembre-se, você deve usar o ID da API do Stripe atribuído ao código promocional e não o código promocional voltado para o cliente. Apenas um cupom ou código promocional pode ser aplicado a um cliente ou assinatura em um dado momento.

Para mais informações sobre esse assunto, consulte a documentação do Stripe sobre [cupons](https://stripe.com/docs/billing/subscriptions/coupons) e [códigos promocionais](https://stripe.com/docs/billing/subscriptions/coupons/codes).

<a id="adding-subscriptions"></a>
#### Adicionando Assinaturas

Se você quiser adicionar uma assinatura a um cliente que já tem um método de pagamento padrão, você pode invocar o método `add` no builder de assinatura:

```php
use App\Models\User;

$user = User::find(1);

$user->newSubscription('default', 'price_monthly')->add();
```

<a id="creating-subscriptions-from-the-stripe-dashboard"></a>
#### Criando Assinaturas a Partir do Dashboard do Stripe

Você também pode criar assinaturas a partir do próprio dashboard do Stripe. Ao fazer isso, o Cashier sincronizará as assinaturas recém-adicionadas e lhes atribuirá um tipo de `default`. Para personalizar o tipo de assinatura que é atribuído às assinaturas criadas no dashboard, [defina handlers de eventos de webhook](#defining-webhook-event-handlers).

Além disso, você só pode criar um tipo de assinatura via dashboard do Stripe. Se a sua aplicação oferece múltiplas assinaturas que usam tipos diferentes, apenas um tipo de assinatura pode ser adicionado por meio do dashboard do Stripe.

Por fim, você deve sempre se certificar de adicionar apenas uma assinatura ativa por tipo de assinatura oferecida pela sua aplicação. Se um cliente tem duas assinaturas `default`, apenas a assinatura adicionada mais recentemente será usada pelo Cashier mesmo que ambas sejam sincronizadas com o banco de dados da sua aplicação.

<a id="checking-subscription-status"></a>
### Verificando o Status da Assinatura

Uma vez que um cliente está assinante da sua aplicação, você pode verificar facilmente seu status de assinatura usando uma variedade de métodos convenientes. Primeiro, o método `subscribed` retorna `true` se o cliente tem uma assinatura ativa, mesmo que a assinatura esteja atualmente dentro de seu período de teste. O método `subscribed` aceita o tipo da assinatura como seu primeiro argumento:

```php
if ($user->subscribed('default')) {
    // ...
}
```

O método `subscribed` também é um ótimo candidato para um [middleware de rota](/en/middleware/), permitindo que você filtre o acesso a rotas e controllers com base no status de assinatura do usuário:

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
        if ($request->user() && ! $request->user()->subscribed('default')) {
            // This user is not a paying customer...
            return redirect('/billing');
        }

        return $next($request);
    }
}
```

Se você quiser determinar se um usuário ainda está dentro de seu período de teste, você pode usar o método `onTrial`. Esse método pode ser útil para determinar se você deve exibir um aviso ao usuário de que ele ainda está em seu período de teste:

```php
if ($user->subscription('default')->onTrial()) {
    // ...
}
```

O método `subscribedToProduct` pode ser usado para determinar se o usuário é assinante de um dado produto com base em um dado identificador de produto do Stripe. No Stripe, produtos são coleções de preços. Neste exemplo, determinaremos se a assinatura `default` do usuário é ativamente assinante do produto "premium" da aplicação. O identificador de produto do Stripe fornecido deve corresponder a um dos identificadores dos seus produtos no dashboard do Stripe:

```php
if ($user->subscribedToProduct('prod_premium', 'default')) {
    // ...
}
```

Ao passar um array ao método `subscribedToProduct`, você pode determinar se a assinatura `default` do usuário é ativamente assinante do produto "basic" ou "premium" da aplicação:

```php
if ($user->subscribedToProduct(['prod_basic', 'prod_premium'], 'default')) {
    // ...
}
```

O método `subscribedToPrice` pode ser usado para determinar se a assinatura de um cliente corresponde a um dado ID de preço:

```php
if ($user->subscribedToPrice('price_basic_monthly', 'default')) {
    // ...
}
```

O método `recurring` pode ser usado para determinar se o usuário está atualmente assinante e não está mais dentro de seu período de teste:

```php
if ($user->subscription('default')->recurring()) {
    // ...
}
```

> **Aviso:**
> Se um usuário tem duas assinaturas com o mesmo tipo, a assinatura mais recente sempre será retornada pelo método `subscription`. Por exemplo, um usuário pode ter dois registros de assinatura com o tipo `default`; no entanto, uma das assinaturas pode ser uma assinatura antiga e expirada, enquanto a outra é a assinatura atual e ativa. A assinatura mais recente sempre será retornada enquanto as assinaturas mais antigas são mantidas no banco de dados para revisão histórica.

<a id="cancelled-subscription-status"></a>
#### Status de Assinatura Cancelada

Para determinar se o usuário já foi um assinante ativo mas cancelou sua assinatura, você pode usar o método `canceled`:

```php
if ($user->subscription('default')->canceled()) {
    // ...
}
```

Você também pode determinar se um usuário cancelou sua assinatura mas ainda está em seu "período de carência" (grace period) até que a assinatura expire completamente. Por exemplo, se um usuário cancela uma assinatura em 5 de março que estava originalmente agendada para expirar em 10 de março, o usuário está em seu "período de carência" até 10 de março. Note que o método `subscribed` ainda retorna `true` durante esse tempo:

```php
if ($user->subscription('default')->onGracePeriod()) {
    // ...
}
```

Para determinar se o usuário cancelou sua assinatura e não está mais dentro de seu "período de carência", você pode usar o método `ended`:

```php
if ($user->subscription('default')->ended()) {
    // ...
}
```

<a id="incomplete-and-past-due-status"></a>
#### Status Incompleto e Vencido (Past Due)

Se uma assinatura requer uma ação de pagamento secundária após a criação, a assinatura será marcada como `incomplete`. Os status de assinatura são armazenados na coluna `stripe_status` da tabela de banco de dados `subscriptions` do Cashier.

Da mesma forma, se uma ação de pagamento secundária for necessária ao trocar preços, a assinatura será marcada como `past_due`. Quando sua assinatura está em qualquer um desses estados, ela não estará ativa até que o cliente tenha confirmado seu pagamento. Determinar se uma assinatura tem um pagamento incompleto pode ser feito usando o método `hasIncompletePayment` no modelo faturável ou em uma instância de assinatura:

```php
if ($user->hasIncompletePayment('default')) {
    // ...
}

if ($user->subscription('default')->hasIncompletePayment()) {
    // ...
}
```

Quando uma assinatura tem um pagamento incompleto, você deve direcionar o usuário à página de confirmação de pagamento do Cashier, passando o identificador `latestPayment`. Você pode usar o método `latestPayment` disponível na instância de assinatura para recuperar esse identificador:

```html
<a href="{{ route('cashier.payment', $subscription->latestPayment()->id) }}">
    Please confirm your payment.
</a>
```

Se você quiser que a assinatura ainda seja considerada ativa quando estiver em um estado `past_due` ou `incomplete`, você pode usar os métodos `keepPastDueSubscriptionsActive` e `keepIncompleteSubscriptionsActive` fornecidos pelo Cashier. Tipicamente, esses métodos devem ser chamados no método `register` do seu `App\Providers\AppServiceProvider`:

```php
use Laravel\Cashier\Cashier;

/**
 * Register any application services.
 */
public function register(): void
{
    Cashier::keepPastDueSubscriptionsActive();
    Cashier::keepIncompleteSubscriptionsActive();
}
```

> **Aviso:**
> Quando uma assinatura está em um estado `incomplete`, ela não pode ser alterada até que o pagamento seja confirmado. Portanto, os métodos `swap` e `updateQuantity` lançarão uma exceção quando a assinatura estiver em um estado `incomplete`.

<a id="subscription-scopes"></a>
#### Escopos de Assinatura

A maioria dos estados de assinatura também está disponível como query scopes para que você possa consultar facilmente seu banco de dados por assinaturas que estão em um dado estado:

```php
// Get all active subscriptions...
$subscriptions = Subscription::query()->active()->get();

// Get all of the canceled subscriptions for a user...
$subscriptions = $user->subscriptions()->canceled()->get();
```

Uma lista completa de escopos disponíveis está disponível abaixo:

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
### Alterando Preços

Após um cliente estar assinante da sua aplicação, ele pode ocasionalmente querer mudar para um novo preço de assinatura. Para trocar um cliente para um novo preço, passe o identificador do preço do Stripe ao método `swap`. Ao trocar preços, assume-se que o usuário gostaria de reativar sua assinatura se ela foi previamente cancelada. O identificador de preço fornecido deve corresponder a um identificador de preço do Stripe disponível no dashboard do Stripe:

```php
use App\Models\User;

$user = App\Models\User::find(1);

$user->subscription('default')->swap('price_yearly');
```

Se o cliente está em período de teste, o período de teste será mantido. Além disso, se uma "quantidade" existe para a assinatura, essa quantidade também será mantida.

Se você quiser trocar preços e cancelar qualquer período de teste em que o cliente esteja atualmente, você pode invocar o método `skipTrial`:

```php
$user->subscription('default')
    ->skipTrial()
    ->swap('price_yearly');
```

Se você quiser trocar preços e faturar imediatamente o cliente em vez de esperar pelo próximo ciclo de billing, você pode usar o método `swapAndInvoice`:

```php
$user = User::find(1);

$user->subscription('default')->swapAndInvoice('price_yearly');
```

<a id="prorations"></a>
#### Rateios (Prorations)

Por padrão, o Stripe faz o rateio (prorate) das cobranças ao trocar entre preços. O método `noProrate` pode ser usado para atualizar o preço da assinatura sem ratear as cobranças:

```php
$user->subscription('default')->noProrate()->swap('price_yearly');
```

Para mais informações sobre rateio de assinatura, consulte a [documentação do Stripe](https://stripe.com/docs/billing/subscriptions/prorations).

> **Aviso:**
> Executar o método `noProrate` antes do método `swapAndInvoice` não terá efeito sobre o rateio. Uma fatura sempre será emitida.

<a id="subscription-quantity"></a>
### Quantidade da Assinatura

Às vezes as assinaturas são afetadas por "quantidade". Por exemplo, uma aplicação de gerenciamento de projetos pode cobrar $10 por mês por projeto. Você pode usar os métodos `incrementQuantity` e `decrementQuantity` para incrementar ou decrementar facilmente a quantidade da sua assinatura:

```php
use App\Models\User;

$user = User::find(1);

$user->subscription('default')->incrementQuantity();

// Add five to the subscription's current quantity...
$user->subscription('default')->incrementQuantity(5);

$user->subscription('default')->decrementQuantity();

// Subtract five from the subscription's current quantity...
$user->subscription('default')->decrementQuantity(5);
```

Alternativamente, você pode definir uma quantidade específica usando o método `updateQuantity`:

```php
$user->subscription('default')->updateQuantity(10);
```

O método `noProrate` pode ser usado para atualizar a quantidade da assinatura sem ratear as cobranças:

```php
$user->subscription('default')->noProrate()->updateQuantity(10);
```

Para mais informações sobre quantidades de assinatura, consulte a [documentação do Stripe](https://stripe.com/docs/subscriptions/quantities).

<a id="quantities-for-subscription-with-multiple-products"></a>
#### Quantidades para Assinaturas com Múltiplos Produtos

Se a sua assinatura é uma [assinatura com múltiplos produtos](#subscriptions-with-multiple-products), você deve passar o ID do preço cuja quantidade você deseja incrementar ou decrementar como o segundo argumento aos métodos increment / decrement:

```php
$user->subscription('default')->incrementQuantity(1, 'price_chat');
```

<a id="subscriptions-with-multiple-products"></a>
### Assinaturas com Múltiplos Produtos

[Assinaturas com múltiplos produtos](https://stripe.com/docs/billing/subscriptions/multiple-products) permitem que você atribua múltiplos produtos de billing a uma única assinatura. Por exemplo, imagine que você está construindo uma aplicação de "helpdesk" de atendimento ao cliente que tem um preço de assinatura base de $10 por mês mas oferece um produto adicional de chat ao vivo por mais $15 por mês. As informações para assinaturas com múltiplos produtos são armazenadas na tabela de banco de dados `subscription_items` do Cashier.

Você pode especificar múltiplos produtos para uma dada assinatura passando um array de preços como o segundo argumento ao método `newSubscription`:

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

No exemplo acima, o cliente terá dois preços anexados à sua assinatura `default`. Ambos os preços serão cobrados em seus respectivos intervalos de billing. Se necessário, você pode usar o método `quantity` para indicar uma quantidade específica para cada preço:

```php
$user = User::find(1);

$user->newSubscription('default', ['price_monthly', 'price_chat'])
    ->quantity(5, 'price_chat')
    ->create($paymentMethod);
```

Se você quiser adicionar outro preço a uma assinatura existente, você pode invocar o método `addPrice` da assinatura:

```php
$user = User::find(1);

$user->subscription('default')->addPrice('price_chat');
```

O exemplo acima adicionará o novo preço e o cliente será cobrado por ele em seu próximo ciclo de billing. Se você quiser cobrar o cliente imediatamente, você pode usar o método `addPriceAndInvoice`:

```php
$user->subscription('default')->addPriceAndInvoice('price_chat');
```

Se você quiser adicionar um preço com uma quantidade específica, você pode passar a quantidade como o segundo argumento dos métodos `addPrice` ou `addPriceAndInvoice`:

```php
$user = User::find(1);

$user->subscription('default')->addPrice('price_chat', 5);
```

Você pode remover preços de assinaturas usando o método `removePrice`:

```php
$user->subscription('default')->removePrice('price_chat');
```

> **Aviso:**
> Você não pode remover o último preço de uma assinatura. Em vez disso, você deve simplesmente cancelar a assinatura.

<a id="swapping-prices"></a>
#### Trocando Preços

Você também pode alterar os preços anexados a uma assinatura com múltiplos produtos. Por exemplo, imagine que um cliente tem uma assinatura `price_basic` com um produto adicional `price_chat` e você quer fazer upgrade do cliente do preço `price_basic` para o preço `price_pro`:

```php
use App\Models\User;

$user = User::find(1);

$user->subscription('default')->swap(['price_pro', 'price_chat']);
```

Ao executar o exemplo acima, o item de assinatura subjacente com o `price_basic` é excluído e o com o `price_chat` é preservado. Além disso, um novo item de assinatura para o `price_pro` é criado.

Você também pode especificar opções de item de assinatura passando um array de pares chave / valor ao método `swap`. Por exemplo, você pode precisar especificar as quantidades de preço da assinatura:

```php
$user = User::find(1);

$user->subscription('default')->swap([
    'price_pro' => ['quantity' => 5],
    'price_chat'
]);
```

Se você quiser trocar um único preço em uma assinatura, você pode fazer isso usando o método `swap` no próprio item de assinatura. Essa abordagem é particularmente útil se você quiser preservar todos os metadados existentes nos outros preços da assinatura:

```php
$user = User::find(1);

$user->subscription('default')
    ->findItemOrFail('price_basic')
    ->swap('price_pro');
```

<a id="proration"></a>
#### Rateio (Proration)

Por padrão, o Stripe fará o rateio das cobranças ao adicionar ou remover preços de uma assinatura com múltiplos produtos. Se você quiser fazer um ajuste de preço sem rateio, você deve encadear o método `noProrate` na sua operação de preço:

```php
$user->subscription('default')->noProrate()->removePrice('price_chat');
```

<a id="swapping-quantities"></a>
#### Quantidades

Se você quiser atualizar quantidades em preços de assinatura individuais, você pode fazer isso usando os [métodos de quantidade existentes](#subscription-quantity) passando o ID do preço como um argumento adicional ao método:

```php
$user = User::find(1);

$user->subscription('default')->incrementQuantity(5, 'price_chat');

$user->subscription('default')->decrementQuantity(3, 'price_chat');

$user->subscription('default')->updateQuantity(10, 'price_chat');
```

> **Aviso:**
> Quando uma assinatura tem múltiplos preços, os atributos `stripe_price` e `quantity` no modelo `Subscription` serão `null`. Para acessar os atributos de preço individuais, você deve usar a relação `items` disponível no modelo `Subscription`.

<a id="subscription-items"></a>
#### Itens de Assinatura

Quando uma assinatura tem múltiplos preços, ela terá múltiplos "itens" de assinatura armazenados na tabela `subscription_items` do seu banco de dados. Você pode acessá-los por meio da relação `items` na assinatura:

```php
use App\Models\User;

$user = User::find(1);

$subscriptionItem = $user->subscription('default')->items->first();

// Retrieve the Stripe price and quantity for a specific item...
$stripePrice = $subscriptionItem->stripe_price;
$quantity = $subscriptionItem->quantity;
```

Você também pode recuperar um preço específico usando o método `findItemOrFail`:

```php
$user = User::find(1);

$subscriptionItem = $user->subscription('default')->findItemOrFail('price_chat');
```

<a id="multiple-subscriptions"></a>
### Múltiplas Assinaturas

O Stripe permite que seus clientes tenham múltiplas assinaturas simultaneamente. Por exemplo, você pode administrar uma academia que oferece uma assinatura de natação e uma assinatura de musculação, e cada assinatura pode ter preços diferentes. É claro que os clientes devem ser capazes de assinar qualquer um ou ambos os planos.

Quando sua aplicação cria assinaturas, você pode fornecer o tipo da assinatura ao método `newSubscription`. O tipo pode ser qualquer string que represente o tipo de assinatura que o usuário está iniciando:

```php
use Illuminate\Http\Request;

Route::post('/swimming/subscribe', function (Request $request) {
    $request->user()->newSubscription('swimming')
        ->price('price_swimming_monthly')
        ->create($request->paymentMethodId);

    // ...
});
```

Neste exemplo, iniciamos uma assinatura mensal de natação para o cliente. No entanto, ele pode querer trocar para uma assinatura anual em um momento posterior. Ao ajustar a assinatura do cliente, podemos simplesmente trocar o preço na assinatura `swimming`:

```php
$user->subscription('swimming')->swap('price_swimming_yearly');
```

É claro que você também pode cancelar a assinatura inteiramente:

```php
$user->subscription('swimming')->cancel();
```

<a id="usage-based-billing"></a>
### Billing Baseado em Uso

O [billing baseado em uso](https://stripe.com/docs/billing/subscriptions/metered-billing) permite que você cobre os clientes com base em seu uso do produto durante um ciclo de billing. Por exemplo, você pode cobrar os clientes com base no número de mensagens de texto ou e-mails que eles enviam por mês.

Para começar a usar o billing por uso, você primeiro precisará criar um novo produto no seu dashboard do Stripe com um [modelo de billing baseado em uso](https://docs.stripe.com/billing/subscriptions/usage-based/implementation-guide) e um [meter](https://docs.stripe.com/billing/subscriptions/usage-based/recording-usage#configure-meter). Após criar o meter, armazene o nome do evento associado e o ID do meter, que você precisará para reportar e recuperar o uso. Então, use o método `meteredPrice` para adicionar o ID do preço medido a uma assinatura de cliente:

```php
use Illuminate\Http\Request;

Route::post('/user/subscribe', function (Request $request) {
    $request->user()->newSubscription('default')
        ->meteredPrice('price_metered')
        ->create($request->paymentMethodId);

    // ...
});
```

Você também pode iniciar uma assinatura medida via [Stripe Checkout](#checkout):

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
#### Reportando Uso

Conforme o seu cliente usa a sua aplicação, você reportará seu uso ao Stripe para que ele possa ser cobrado com precisão. Para reportar o uso de um evento medido, você pode usar o método `reportMeterEvent` no seu modelo `Billable`:

```php
$user = User::find(1);

$user->reportMeterEvent('emails-sent');
```

Por padrão, uma "quantidade de uso" de 1 é adicionada ao período de billing. Alternativamente, você pode passar uma quantidade específica de "uso" para adicionar ao uso do cliente no período de billing:

```php
$user = User::find(1);

$user->reportMeterEvent('emails-sent', quantity: 15);
```

Para recuperar o resumo de eventos de um cliente para um meter, você pode usar o método `meterEventSummaries` de uma instância `Billable`:

```php
$user = User::find(1);

$meterUsage = $user->meterEventSummaries($meterId);

$meterUsage->first()->aggregated_value; // 10
```

Consulte a [documentação do objeto Meter Event Summary](https://docs.stripe.com/api/billing/meter-event_summary/object) do Stripe para mais informações sobre resumos de eventos de meter.

Para [listar todos os meters](https://docs.stripe.com/api/billing/meter/list), você pode usar o método `meters` de uma instância `Billable`:

```php
$user = User::find(1);

$user->meters();
```

<a id="subscription-taxes"></a>
### Impostos de Assinatura

> **Aviso:**
> Em vez de calcular as Tax Rates manualmente, você pode [calcular impostos automaticamente usando o Stripe Tax](#tax-configuration)

Para especificar as tax rates que um usuário paga em uma assinatura, você deve implementar o método `taxRates` no seu modelo faturável e retornar um array contendo os IDs de tax rate do Stripe. Você pode definir essas tax rates no [seu dashboard do Stripe](https://dashboard.stripe.com/test/tax-rates):

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

O método `taxRates` permite que você aplique uma tax rate cliente por cliente, o que pode ser útil para uma base de usuários que abrange múltiplos países e tax rates.

Se você está oferecendo assinaturas com múltiplos produtos, você pode definir tax rates diferentes para cada preço implementando um método `priceTaxRates` no seu modelo faturável:

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

> **Aviso:**
> O método `taxRates` só se aplica a cobranças de assinatura. Se você usar o Cashier para fazer cobranças "avulsas", você precisará especificar manualmente a tax rate naquele momento.

<a id="syncing-tax-rates"></a>
#### Sincronizando Tax Rates

Ao alterar os IDs de tax rate codificados retornados pelo método `taxRates`, as configurações de imposto em quaisquer assinaturas existentes do usuário permanecerão as mesmas. Se você quiser atualizar o valor de imposto para assinaturas existentes com os novos valores de `taxRates`, você deve chamar o método `syncTaxRates` na instância de assinatura do usuário:

```php
$user->subscription('default')->syncTaxRates();
```

Isso também sincronizará quaisquer tax rates de item para uma assinatura com múltiplos produtos. Se a sua aplicação está oferecendo assinaturas com múltiplos produtos, você deve garantir que o seu modelo faturável implemente o método `priceTaxRates` [discutido acima](#subscription-taxes).

<a id="tax-exemption"></a>
#### Isenção de Impostos

O Cashier também oferece os métodos `isNotTaxExempt`, `isTaxExempt` e `reverseChargeApplies` para determinar se o cliente é isento de impostos. Esses métodos chamarão a API do Stripe para determinar o status de isenção de impostos de um cliente:

```php
use App\Models\User;

$user = User::find(1);

$user->isTaxExempt();
$user->isNotTaxExempt();
$user->reverseChargeApplies();
```

> **Aviso:**
> Esses métodos também estão disponíveis em qualquer objeto `Laravel\Cashier\Invoice`. No entanto, quando invocados em um objeto `Invoice`, os métodos determinarão o status de isenção no momento em que a fatura foi criada.

<a id="subscription-anchor-date"></a>
### Data Âncora da Assinatura

Por padrão, a âncora do ciclo de billing é a data em que a assinatura foi criada ou, se um período de teste é usado, a data em que o teste termina. Se você quiser modificar a data âncora de billing, você pode usar o método `anchorBillingCycleOn`:

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

Para mais informações sobre gerenciamento de ciclos de billing de assinatura, consulte a [documentação de ciclo de billing do Stripe](https://stripe.com/docs/billing/subscriptions/billing-cycle)

<a id="cancelling-subscriptions"></a>
### Cancelando Assinaturas

Para cancelar uma assinatura, chame o método `cancel` na assinatura do usuário:

```php
$user->subscription('default')->cancel();
```

Quando uma assinatura é cancelada, o Cashier automaticamente definirá a coluna `ends_at` na sua tabela de banco de dados `subscriptions`. Essa coluna é usada para saber quando o método `subscribed` deve começar a retornar `false`.

Por exemplo, se um cliente cancela uma assinatura em 1º de março, mas a assinatura não estava agendada para terminar até 5 de março, o método `subscribed` continuará a retornar `true` até 5 de março. Isso é feito porque um usuário tipicamente tem permissão para continuar usando uma aplicação até o final de seu ciclo de billing.

Você pode determinar se um usuário cancelou sua assinatura mas ainda está em seu "período de carência" usando o método `onGracePeriod`:

```php
if ($user->subscription('default')->onGracePeriod()) {
    // ...
}
```

Se você quiser cancelar uma assinatura imediatamente, chame o método `cancelNow` na assinatura do usuário:

```php
$user->subscription('default')->cancelNow();
```

Se você quiser cancelar uma assinatura imediatamente e faturar qualquer uso medido ainda não faturado ou itens de fatura de rateio novos / pendentes, chame o método `cancelNowAndInvoice` na assinatura do usuário:

```php
$user->subscription('default')->cancelNowAndInvoice();
```

Você também pode optar por cancelar a assinatura em um momento específico no tempo:

```php
$user->subscription('default')->cancelAt(
    now()->plus(days: 10)
);
```

Por fim, você deve sempre cancelar as assinaturas do usuário antes de excluir o modelo de usuário associado:

```php
$user->subscription('default')->cancelNow();

$user->delete();
```

<a id="resuming-subscriptions"></a>
### Retomando Assinaturas

Se um cliente cancelou sua assinatura e você quiser retomá-la, você pode invocar o método `resume` na assinatura. O cliente ainda deve estar dentro de seu "período de carência" para retomar uma assinatura:

```php
$user->subscription('default')->resume();
```

Se o cliente cancela uma assinatura e então retoma essa assinatura antes que a assinatura tenha expirado completamente, o cliente não será cobrado imediatamente. Em vez disso, sua assinatura será reativada e ele será cobrado no ciclo de billing original.

<a id="subscription-trials"></a>
## Períodos de Teste de Assinatura

<a id="with-payment-method-up-front"></a>
### Com Método de Pagamento Adiantado

Se você quiser oferecer períodos de teste aos seus clientes enquanto ainda coleta informações de método de pagamento adiantado, você deve usar o método `trialDays` ao criar suas assinaturas:

```php
use Illuminate\Http\Request;

Route::post('/user/subscribe', function (Request $request) {
    $request->user()->newSubscription('default', 'price_monthly')
        ->trialDays(10)
        ->create($request->paymentMethodId);

    // ...
});
```

Esse método definirá a data de término do período de teste no registro de assinatura dentro do banco de dados e instruirá o Stripe a não começar a cobrar o cliente até depois dessa data. Ao usar o método `trialDays`, o Cashier sobrescreverá qualquer período de teste padrão configurado para o preço no Stripe.

> **Aviso:**
> Se a assinatura do cliente não for cancelada antes da data de término do teste, ele será cobrado assim que o teste expirar, portanto você deve se certificar de notificar seus usuários sobre a data de término de seu teste.

O método `trialUntil` permite que você forneça uma instância de `DateTime` que especifica quando o período de teste deve terminar:

```php
use Illuminate\Support\Carbon;

$user->newSubscription('default', 'price_monthly')
    ->trialUntil(Carbon::now()->plus(days: 10))
    ->create($paymentMethod);
```

Você pode determinar se um usuário está dentro de seu período de teste usando tanto o método `onTrial` da instância do usuário quanto o método `onTrial` da instância de assinatura. Os dois exemplos abaixo são equivalentes:

```php
if ($user->onTrial('default')) {
    // ...
}

if ($user->subscription('default')->onTrial()) {
    // ...
}
```

Você pode usar o método `endTrial` para encerrar imediatamente um período de teste de assinatura:

```php
$user->subscription('default')->endTrial();
```

Para determinar se um período de teste existente expirou, você pode usar os métodos `hasExpiredTrial`:

```php
if ($user->hasExpiredTrial('default')) {
    // ...
}

if ($user->subscription('default')->hasExpiredTrial()) {
    // ...
}
```

<a id="defining-trial-days-in-stripe-cashier"></a>
#### Definindo Dias de Teste no Stripe / Cashier

Você pode optar por definir quantos dias de teste seus preços recebem no dashboard do Stripe ou sempre passá-los explicitamente usando o Cashier. Se você optar por definir os dias de teste dos seus preços no Stripe, você deve estar ciente de que novas assinaturas, incluindo novas assinaturas para um cliente que teve uma assinatura no passado, sempre receberão um período de teste a menos que você chame explicitamente o método `skipTrial()`.

<a id="without-payment-method-up-front"></a>
### Sem Método de Pagamento Adiantado

Se você quiser oferecer períodos de teste sem coletar as informações de método de pagamento do usuário adiantado, você pode definir a coluna `trial_ends_at` no registro do usuário para a data de término de teste desejada. Isso tipicamente é feito durante o registro do usuário:

```php
use App\Models\User;

$user = User::create([
    // ...
    'trial_ends_at' => now()->plus(days: 10),
]);
```

> **Aviso:**
> Certifique-se de adicionar um [date cast](/en/eloquent-mutators/#date-casting) para o atributo `trial_ends_at` dentro da definição de classe do seu modelo faturável.

O Cashier refere-se a esse tipo de teste como um "teste genérico" (generic trial), já que ele não está anexado a nenhuma assinatura existente. O método `onTrial` na instância do modelo faturável retornará `true` se a data atual não ultrapassou o valor de `trial_ends_at`:

```php
if ($user->onTrial()) {
    // User is within their trial period...
}
```

Uma vez que você esteja pronto para criar uma assinatura real para o usuário, você pode usar o método `newSubscription` como de costume:

```php
$user = User::find(1);

$user->newSubscription('default', 'price_monthly')->create($paymentMethod);
```

Para recuperar a data de término de teste do usuário, você pode usar o método `trialEndsAt`. Esse método retornará uma instância de data Carbon se um usuário está em um teste ou `null` se não estiver. Você também pode passar um parâmetro opcional de tipo de assinatura se quiser obter a data de término de teste para uma assinatura específica diferente da padrão:

```php
if ($user->onTrial()) {
    $trialEndsAt = $user->trialEndsAt('main');
}
```

Você também pode usar o método `onGenericTrial` se quiser saber especificamente que o usuário está dentro de seu período de teste "genérico" e ainda não criou uma assinatura real:

```php
if ($user->onGenericTrial()) {
    // User is within their "generic" trial period...
}
```

<a id="extending-trials"></a>
### Estendendo Períodos de Teste

O método `extendTrial` permite que você estenda o período de teste de uma assinatura após a assinatura ter sido criada. Se o teste já expirou e o cliente já está sendo cobrado pela assinatura, você ainda pode oferecer a ele um teste estendido. O tempo gasto dentro do período de teste será deduzido da próxima fatura do cliente:

```php
use App\Models\User;

$subscription = User::find(1)->subscription('default');

// End the trial 7 days from now...
$subscription->extendTrial(
    now()->plus(days: 7)
);

// Add an additional 5 days to the trial...
$subscription->extendTrial(
    $subscription->trial_ends_at->plus(days: 5)
);
```

<a id="handling-stripe-webhooks"></a>
## Lidando com Webhooks do Stripe

> **Nota:**
> Você pode usar [a Stripe CLI](https://stripe.com/docs/stripe-cli) para ajudar a testar webhooks durante o desenvolvimento local.

O Stripe pode notificar sua aplicação de uma variedade de eventos via webhooks. Por padrão, uma rota que aponta para o controller de webhook do Cashier é automaticamente registrada pelo service provider do Cashier. Esse controller lidará com todas as requisições de webhook recebidas.

Por padrão, o controller de webhook do Cashier automaticamente lidará com o cancelamento de assinaturas que têm muitas cobranças falhas (conforme definido pelas suas configurações do Stripe), atualizações de cliente, exclusões de cliente, atualizações de assinatura e mudanças de método de pagamento; no entanto, como descobriremos em breve, você pode estender esse controller para lidar com qualquer evento de webhook do Stripe que você quiser.

Para garantir que a sua aplicação possa lidar com webhooks do Stripe, certifique-se de configurar a URL do webhook no painel de controle do Stripe. Por padrão, o controller de webhook do Cashier responde ao caminho de URL `/stripe/webhook`. A lista completa de todos os webhooks que você deve habilitar no painel de controle do Stripe é:

- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `customer.updated`
- `customer.deleted`
- `payment_method.automatically_updated`
- `invoice.payment_action_required`
- `invoice.payment_succeeded`

Por conveniência, o Cashier inclui um comando Artisan `cashier:webhook`. Esse comando criará um webhook no Stripe que escuta todos os eventos exigidos pelo Cashier:

```shell
php artisan cashier:webhook
```

Por padrão, o webhook criado apontará para a URL definida pela variável de ambiente `APP_URL` e a rota `cashier.webhook` que é incluída com o Cashier. Você pode fornecer a opção `--url` ao invocar o comando se quiser usar uma URL diferente:

```shell
php artisan cashier:webhook --url "https://example.com/stripe/webhook"
```

O webhook que é criado usará a mesma versão da API do Stripe que o Cashier, que é determinada pela sua versão instalada do `stripe/stripe-php`. Se você quiser usar uma versão diferente do Stripe, você pode fornecer a opção `--api-version`:

```shell
php artisan cashier:webhook --api-version="2019-12-03"
```

Após a criação, o webhook estará imediatamente ativo. Se você quiser criar o webhook mas tê-lo desabilitado até que esteja pronto, você pode fornecer a opção `--disabled` ao invocar o comando:

```shell
php artisan cashier:webhook --disabled
```

> **Aviso:**
> Certifique-se de proteger as requisições de webhook do Stripe recebidas com o middleware de [verificação de assinatura de webhook](#verifying-webhook-signatures) incluído no Cashier.

<a id="webhooks-csrf-protection"></a>
#### Webhooks e Proteção CSRF

Como os webhooks do Stripe precisam contornar a [proteção CSRF](/en/csrf/) do Laravel, você deve garantir que o Laravel não tente validar o token CSRF para webhooks do Stripe recebidos. Para fazer isso, você deve excluir `stripe/*` da proteção CSRF no arquivo `bootstrap/app.php` da sua aplicação:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->preventRequestForgery(except: [
        'stripe/*',
    ]);
})
```

<a id="defining-webhook-event-handlers"></a>
### Definindo Handlers de Eventos de Webhook

O Cashier lida automaticamente com cancelamentos de assinatura para cobranças falhas e outros eventos comuns de webhook do Stripe. No entanto, se você tiver eventos de webhook adicionais que gostaria de tratar, você pode fazer isso escutando os seguintes eventos que são despachados pelo Cashier:

- `Laravel\Cashier\Events\WebhookReceived`
- `Laravel\Cashier\Events\WebhookHandled`

Ambos os eventos contêm o payload completo do webhook do Stripe. Por exemplo, se você quiser tratar o webhook `invoice.payment_succeeded`, você pode registrar um [listener](/en/events/#defining-listeners) que tratará o evento:

```php
<?php

namespace App\Listeners;

use Laravel\Cashier\Events\WebhookReceived;

class StripeEventListener
{
    /**
     * Handle received Stripe webhooks.
     */
    public function handle(WebhookReceived $event): void
    {
        if ($event->payload['type'] === 'invoice.payment_succeeded') {
            // Handle the incoming event...
        }
    }
}
```

<a id="verifying-webhook-signatures"></a>
### Verificando Assinaturas de Webhook

Para proteger seus webhooks, você pode usar [as assinaturas de webhook do Stripe](https://stripe.com/docs/webhooks/signatures). Por conveniência, o Cashier automaticamente inclui um middleware que valida que a requisição de webhook do Stripe recebida é válida.

Para habilitar a verificação de webhook, garanta que a variável de ambiente `STRIPE_WEBHOOK_SECRET` esteja definida no arquivo `.env` da sua aplicação. O `secret` do webhook pode ser recuperado do dashboard da sua conta do Stripe.

<a id="single-charges"></a>
## Cobranças Únicas

<a id="simple-charge"></a>
### Cobrança Simples

Se você quiser fazer uma cobrança única contra um cliente usando um identificador de método de pagamento, você pode usar o método `charge` em uma instância de modelo faturável. Se você precisar coletar detalhes de pagamento de um cliente antes de processar uma cobrança única, veja a documentação do [Payment Element para Cobranças Únicas](#payment-element-for-single-charges):

```php
use Illuminate\Http\Request;

Route::post('/purchase', function (Request $request) {
    $payment = $request->user()->charge(
        100, $request->paymentMethodId
    );

    // ...
});
```

O método `charge` aceita um array como seu terceiro argumento, permitindo que você passe quaisquer opções que desejar à criação do Payment Intent subjacente do Stripe. Mais informações sobre as opções disponíveis para você ao criar Payment Intents podem ser encontradas na [documentação do Stripe](https://stripe.com/docs/api/payment_intents/create):

```php
$user->charge(100, $paymentMethod, [
    'custom_option' => $value,
]);
```

Você também pode usar o método `charge` sem um cliente ou usuário subjacente. Para fazer isso, invoque o método `charge` em uma nova instância do modelo faturável da sua aplicação:

```php
use App\Models\User;

$payment = (new User)->charge(100, $paymentMethod);
```

O método `charge` lançará uma exceção se a cobrança falhar. Se a cobrança for bem-sucedida, uma instância de `Laravel\Cashier\Payment` será retornada do método:

```php
try {
    $payment = $user->charge(100, $paymentMethod);
} catch (Exception $e) {
    // ...
}
```

> **Aviso:**
> O método `charge` aceita o valor do pagamento no menor denominador da moeda usada pela sua aplicação. Por exemplo, se os clientes estão pagando em Dólares dos Estados Unidos, os valores devem ser especificados em centavos.

<a id="charge-with-invoice"></a>
### Cobrança com Fatura

Às vezes você pode precisar fazer uma cobrança única e oferecer uma fatura em PDF ao seu cliente. O método `invoicePrice` permite que você faça exatamente isso. Por exemplo, vamos faturar um cliente por cinco novas camisetas:

```php
$user->invoicePrice('price_tshirt', 5);
```

A fatura será imediatamente cobrada contra o método de pagamento padrão do usuário. O método `invoicePrice` também aceita um array como seu terceiro argumento. Esse array contém as opções de billing para o item de fatura. O quarto argumento aceito pelo método também é um array que deve conter as opções de billing para a fatura em si:

```php
$user->invoicePrice('price_tshirt', 5, [
    'discounts' => [
        ['coupon' => 'SUMMER21SALE']
    ],
], [
    'default_tax_rates' => ['txr_id'],
]);
```

De forma semelhante ao `invoicePrice`, você pode usar o método `tabPrice` para criar uma cobrança única para múltiplos itens (até 250 itens por fatura) adicionando-os à "tab" do cliente e então faturando o cliente. Por exemplo, podemos faturar um cliente por cinco camisetas e duas canecas:

```php
$user->tabPrice('price_tshirt', 5);
$user->tabPrice('price_mug', 2);
$user->invoice();
```

Alternativamente, você pode usar o método `invoiceFor` para fazer uma cobrança "avulsa" contra o método de pagamento padrão do cliente:

```php
$user->invoiceFor('One Time Fee', 500);
```

Embora o método `invoiceFor` esteja disponível para você usar, é recomendado que você use os métodos `invoicePrice` e `tabPrice` com preços pré-definidos. Ao fazer isso, você terá acesso a melhores analytics e dados dentro do seu dashboard do Stripe sobre suas vendas por produto.

> **Aviso:**
> Os métodos `invoice`, `invoicePrice` e `invoiceFor` criarão uma fatura do Stripe que repetirá tentativas de billing falhas. Se você não quiser que as faturas repitam cobranças falhas, você precisará fechá-las usando a API do Stripe após a primeira cobrança falha.

<a id="creating-payment-intents"></a>
### Criando Payment Intents

Você pode criar um novo payment intent do Stripe invocando o método `pay` em uma instância de modelo faturável. Chamar esse método criará um payment intent que é encapsulado em uma instância de `Laravel\Cashier\Payment`:

```php
use Illuminate\Http\Request;

Route::post('/pay', function (Request $request) {
    $payment = $request->user()->pay(
        $request->get('amount')
    );

    return $payment->client_secret;
});
```

Após criar o payment intent, você pode retornar o client secret ao frontend da sua aplicação de forma que o usuário possa completar o pagamento em seu navegador. Para ler mais sobre a construção de fluxos de pagamento completos usando payment intents do Stripe, consulte a [documentação do Stripe](https://stripe.com/docs/payments/accept-a-payment?platform=web).

Ao usar o método `pay`, os métodos de pagamento padrão que estão habilitados no seu dashboard do Stripe estarão disponíveis ao cliente. Alternativamente, se você quiser permitir apenas alguns métodos de pagamento específicos, você pode usar o método `payWith`:

```php
use Illuminate\Http\Request;

Route::post('/pay', function (Request $request) {
    $payment = $request->user()->payWith(
        $request->get('amount'), ['card', 'bancontact']
    );

    return $payment->client_secret;
});
```

> **Aviso:**
> Os métodos `pay` e `payWith` aceitam o valor do pagamento no menor denominador da moeda usada pela sua aplicação. Por exemplo, se os clientes estão pagando em Dólares dos Estados Unidos, os valores devem ser especificados em centavos.

<a id="refunding-charges"></a>
### Reembolsando Cobranças

Se você precisar reembolsar um pagamento do Stripe, você pode usar o método `refund`. Esse método aceita o ID do Payment Intent do Stripe como seu primeiro argumento:

```php
$payment = $user->charge(100, $paymentMethodId);

$user->refund($payment->id);
```

<a id="invoices"></a>
## Faturas

<a id="retrieving-invoices"></a>
### Recuperando Faturas

Você pode recuperar facilmente um array das faturas de um modelo faturável usando o método `invoices`. O método `invoices` retorna uma collection de instâncias de `Laravel\Cashier\Invoice`:

```php
$invoices = $user->invoices();
```

Se você quiser incluir faturas pendentes nos resultados, você pode usar o método `invoicesIncludingPending`:

```php
$invoices = $user->invoicesIncludingPending();
```

Você pode usar o método `findInvoice` para recuperar uma fatura específica por seu ID:

```php
$invoice = $user->findInvoice($invoiceId);
```

<a id="displaying-invoice-information"></a>
#### Exibindo Informações de Fatura

Ao listar as faturas do cliente, você pode usar os métodos da fatura para exibir as informações de fatura relevantes. Por exemplo, você pode querer listar todas as faturas em uma tabela, permitindo que o usuário baixe facilmente qualquer uma delas:

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
### Faturas Futuras

Para recuperar a fatura futura de um cliente, você pode usar o método `upcomingInvoice`:

```php
$invoice = $user->upcomingInvoice();
```

Da mesma forma, se o cliente tem múltiplas assinaturas, você também pode recuperar a fatura futura para uma assinatura específica:

```php
$invoice = $user->subscription('default')->upcomingInvoice();
```

<a id="previewing-subscription-invoices"></a>
### Pré-visualizando Faturas de Assinatura

Usando o método `previewInvoice`, você pode pré-visualizar uma fatura antes de fazer mudanças de preço. Isso permitirá que você determine como será a fatura do seu cliente quando uma dada mudança de preço for feita:

```php
$invoice = $user->subscription('default')->previewInvoice('price_yearly');
```

Você pode passar um array de preços ao método `previewInvoice` para pré-visualizar faturas com múltiplos novos preços:

```php
$invoice = $user->subscription('default')->previewInvoice(['price_yearly', 'price_metered']);
```

<a id="generating-invoice-pdfs"></a>
### Gerando PDFs de Fatura

Antes de gerar PDFs de fatura, você deve usar o Composer para instalar a biblioteca Dompdf, que é o renderizador de fatura padrão do Cashier:

```shell
composer require dompdf/dompdf
```

De dentro de uma rota ou controller, você pode usar o método `downloadInvoice` para gerar um download em PDF de uma dada fatura. Esse método automaticamente gerará a resposta HTTP adequada necessária para baixar a fatura:

```php
use Illuminate\Http\Request;

Route::get('/user/invoice/{invoice}', function (Request $request, string $invoiceId) {
    return $request->user()->downloadInvoice($invoiceId);
});
```

Por padrão, todos os dados na fatura são derivados dos dados de cliente e fatura armazenados no Stripe. O nome do arquivo é baseado no seu valor de config `app.name`. No entanto, você pode personalizar alguns desses dados fornecendo um array como o segundo argumento ao método `downloadInvoice`. Esse array permite que você personalize informações como os detalhes da sua empresa e produto:

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

O método `downloadInvoice` também permite um nome de arquivo personalizado por meio de seu terceiro argumento. Esse nome de arquivo será automaticamente sufixado com `.pdf`:

```php
return $request->user()->downloadInvoice($invoiceId, [], 'my-invoice');
```

<a id="custom-invoice-render"></a>
#### Renderizador de Fatura Personalizado

O Cashier também torna possível usar um renderizador de fatura personalizado. Por padrão, o Cashier usa a implementação `DompdfInvoiceRenderer`, que utiliza a biblioteca PHP [dompdf](https://github.com/dompdf/dompdf) para gerar as faturas do Cashier. No entanto, você pode usar qualquer renderizador que desejar implementando a interface `Laravel\Cashier\Contracts\InvoiceRenderer`. Por exemplo, você pode querer renderizar um PDF de fatura usando uma chamada de API a um serviço de renderização de PDF de terceiros:

```php
use Illuminate\Support\Facades\Http;
use Laravel\Cashier\Contracts\InvoiceRenderer;
use Laravel\Cashier\Invoice;

class ApiInvoiceRenderer implements InvoiceRenderer
{
    /**
     * Render the given invoice and return the raw PDF bytes.
     */
    public function render(Invoice $invoice, array $data = [], array $options = []): string
    {
        $html = $invoice->view($data)->render();

        return Http::get('https://example.com/html-to-pdf', ['html' => $html])->get()->body();
    }
}
```

Uma vez que você tenha implementado o contrato de renderizador de fatura, você deve atualizar o valor de configuração `cashier.invoices.renderer` no arquivo de configuração `config/cashier.php` da sua aplicação. Esse valor de configuração deve ser definido como o nome da classe da sua implementação de renderizador personalizada.

<a id="checkout"></a>
## Checkout

O Cashier Stripe também fornece suporte para o [Stripe Checkout](https://stripe.com/payments/checkout). O Stripe Checkout elimina a dor de implementar páginas personalizadas para aceitar pagamentos fornecendo uma página de pagamento pré-construída e hospedada.

A documentação a seguir contém informações sobre como começar a usar o Stripe Checkout com o Cashier. Para aprender mais sobre o Stripe Checkout, você também deve considerar revisar [a própria documentação do Stripe sobre o Checkout](https://stripe.com/docs/payments/checkout).

<a id="product-checkouts"></a>
### Checkouts de Produto

Você pode realizar um checkout para um produto existente que foi criado dentro do seu dashboard do Stripe usando o método `checkout` em um modelo faturável. O método `checkout` iniciará uma nova sessão do Stripe Checkout. Por padrão, você é obrigado a passar um Stripe Price ID:

```php
use Illuminate\Http\Request;

Route::get('/product-checkout', function (Request $request) {
    return $request->user()->checkout('price_tshirt');
});
```

Se necessário, você também pode especificar uma quantidade de produto:

```php
use Illuminate\Http\Request;

Route::get('/product-checkout', function (Request $request) {
    return $request->user()->checkout(['price_tshirt' => 15]);
});
```

Quando um cliente visita essa rota, ele será redirecionado à página de Checkout do Stripe. Por padrão, quando um usuário completa com sucesso ou cancela uma compra, ele será redirecionado à localização da rota `home` da sua aplicação, mas você pode especificar URLs de callback personalizadas usando as opções `success_url` e `cancel_url`:

```php
use Illuminate\Http\Request;

Route::get('/product-checkout', function (Request $request) {
    return $request->user()->checkout(['price_tshirt' => 1], [
        'success_url' => route('your-success-route'),
        'cancel_url' => route('your-cancel-route'),
    ]);
});
```

Ao definir sua opção de checkout `success_url`, você pode instruir o Stripe a adicionar o ID da sessão de checkout como um parâmetro de query string ao invocar sua URL. Para fazer isso, adicione a string literal `{CHECKOUT_SESSION_ID}` à sua query string de `success_url`. O Stripe substituirá esse placeholder pelo ID real da sessão de checkout:

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
#### Códigos Promocionais

Por padrão, o Stripe Checkout não permite [códigos promocionais resgatáveis pelo usuário](https://stripe.com/docs/billing/subscriptions/discounts/codes). Felizmente, há uma maneira fácil de habilitá-los para a sua página de Checkout. Para fazer isso, você pode invocar o método `allowPromotionCodes`:

```php
use Illuminate\Http\Request;

Route::get('/product-checkout', function (Request $request) {
    return $request->user()
        ->allowPromotionCodes()
        ->checkout('price_tshirt');
});
```

<a id="single-charge-checkouts"></a>
### Checkouts de Cobrança Única

Você também pode realizar uma cobrança simples para um produto ad-hoc que não foi criado no seu dashboard do Stripe. Para fazer isso, você pode usar o método `checkoutCharge` em um modelo faturável e passar a ele um valor cobrável, um nome de produto e uma quantidade opcional. Quando um cliente visita essa rota, ele será redirecionado à página de Checkout do Stripe:

```php
use Illuminate\Http\Request;

Route::get('/charge-checkout', function (Request $request) {
    return $request->user()->checkoutCharge(1200, 'T-Shirt', 5);
});
```

> **Aviso:**
> Ao usar o método `checkoutCharge`, o Stripe sempre criará um novo produto e preço no seu dashboard do Stripe. Portanto, recomendamos que você crie os produtos antecipadamente no seu dashboard do Stripe e use o método `checkout` em vez disso.

<a id="subscription-checkouts"></a>
### Checkouts de Assinatura

> **Aviso:**
> Usar o Stripe Checkout para assinaturas requer que você habilite o webhook `customer.subscription.created` no seu dashboard do Stripe. Esse webhook criará o registro de assinatura no seu banco de dados e armazenará todos os itens de assinatura relevantes.

Você também pode usar o Stripe Checkout para iniciar assinaturas. Após definir sua assinatura com os métodos do builder de assinatura do Cashier, você pode chamar o método `checkout`. Quando um cliente visita essa rota, ele será redirecionado à página de Checkout do Stripe:

```php
use Illuminate\Http\Request;

Route::get('/subscription-checkout', function (Request $request) {
    return $request->user()
        ->newSubscription('default', 'price_monthly')
        ->checkout();
});
```

Assim como com checkouts de produto, você pode personalizar as URLs de sucesso e cancelamento:

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

É claro que você também pode habilitar códigos promocionais para checkouts de assinatura:

```php
use Illuminate\Http\Request;

Route::get('/subscription-checkout', function (Request $request) {
    return $request->user()
        ->newSubscription('default', 'price_monthly')
        ->allowPromotionCodes()
        ->checkout();
});
```

> **Aviso:**
> Infelizmente o Stripe Checkout não suporta todas as opções de billing de assinatura ao iniciar assinaturas. Usar o método `anchorBillingCycleOn` no builder de assinatura, definir o comportamento de rateio ou definir o comportamento de pagamento não terá nenhum efeito durante sessões do Stripe Checkout. Consulte [a documentação da API Checkout Session do Stripe](https://stripe.com/docs/api/checkout/sessions/create) para revisar quais parâmetros estão disponíveis.

<a id="stripe-checkout-trial-periods"></a>
#### Stripe Checkout e Períodos de Teste

É claro que você pode definir um período de teste ao construir uma assinatura que será concluída usando o Stripe Checkout:

```php
$checkout = Auth::user()->newSubscription('default', 'price_monthly')
    ->trialDays(3)
    ->checkout();
```

No entanto, o período de teste deve ser de pelo menos 48 horas, que é a quantidade mínima de tempo de teste suportada pelo Stripe Checkout.

<a id="stripe-checkout-subscriptions-and-webhooks"></a>
#### Assinaturas e Webhooks

Lembre-se, o Stripe e o Cashier atualizam os status de assinatura via webhooks, portanto há uma possibilidade de uma assinatura ainda não estar ativa quando o cliente retornar à aplicação após inserir suas informações de pagamento. Para lidar com esse cenário, você pode querer exibir uma mensagem informando ao usuário que seu pagamento ou assinatura está pendente.

<a id="collecting-tax-ids"></a>
### Coletando IDs de Imposto

O Checkout também suporta a coleta do Tax ID de um cliente. Para habilitar isso em uma sessão de checkout, invoque o método `collectTaxIds` ao criar a sessão:

```php
$checkout = $user->collectTaxIds()->checkout('price_tshirt');
```

Quando esse método é invocado, uma nova checkbox estará disponível ao cliente que permite que ele indique se está comprando como uma empresa. Se for o caso, ele terá a oportunidade de fornecer seu número de Tax ID.

> **Aviso:**
> Se você já configurou a [coleta automática de impostos](#tax-configuration) no service provider da sua aplicação, então esse recurso será habilitado automaticamente e não há necessidade de invocar o método `collectTaxIds`.

<a id="guest-checkouts"></a>
### Checkouts de Convidado

Usando o método `Checkout::guest`, você pode iniciar sessões de checkout para convidados da sua aplicação que não têm uma "conta":

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

De forma semelhante a quando criamos sessões de checkout para usuários existentes, você pode utilizar métodos adicionais disponíveis na instância de `Laravel\Cashier\CheckoutBuilder` para personalizar a sessão de checkout de convidado:

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

Após um checkout de convidado ter sido concluído, o Stripe pode despachar um evento de webhook `checkout.session.completed`, portanto certifique-se de [configurar seu webhook do Stripe](https://dashboard.stripe.com/webhooks) para realmente enviar esse evento à sua aplicação. Uma vez que o webhook tenha sido habilitado no dashboard do Stripe, você pode [tratar o webhook com o Cashier](#handling-stripe-webhooks). O objeto contido no payload do webhook será um [objeto de checkout](https://stripe.com/docs/api/checkout/sessions/object) que você pode inspecionar para atender ao pedido do seu cliente.

<a id="handling-failed-payments"></a>
## Lidando com Pagamentos Falhos

Às vezes, pagamentos para assinaturas ou cobranças únicas podem falhar. Quando isso acontece, o Cashier lançará uma exceção `Laravel\Cashier\Exceptions\IncompletePayment` que informa que isso aconteceu. Após capturar essa exceção, você tem duas opções sobre como proceder.

Primeiro, você poderia redirecionar seu cliente à página dedicada de confirmação de pagamento que é incluída com o Cashier. Essa página já tem uma rota nomeada associada que é registrada por meio do service provider do Cashier. Assim, você pode capturar a exceção `IncompletePayment` e redirecionar o usuário à página de confirmação de pagamento:

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

Na página de confirmação de pagamento, o cliente será solicitado a inserir suas informações de cartão de crédito novamente e realizar quaisquer ações adicionais exigidas pelo Stripe, como a confirmação "3D Secure". Após confirmar seu pagamento, o usuário será redirecionado à URL fornecida pelo parâmetro `redirect` especificado acima. Após o redirecionamento, as variáveis de query string `message` (string) e `success` (integer) serão adicionadas à URL. A página de pagamento atualmente suporta os seguintes tipos de método de pagamento:

<div class="content-list" markdown="1">

- Credit Cards
- Alipay
- Bancontact
- BECS Direct Debit
- EPS
- Giropay
- iDEAL
- SEPA Direct Debit

</div>

Alternativamente, você poderia permitir que o Stripe lidasse com a confirmação de pagamento para você. Nesse caso, em vez de redirecionar à página de confirmação de pagamento, você pode [configurar os e-mails de billing automáticos do Stripe](https://dashboard.stripe.com/account/billing/automatic) no seu dashboard do Stripe. No entanto, se uma exceção `IncompletePayment` for capturada, você ainda deve informar ao usuário que ele receberá um e-mail com instruções adicionais de confirmação de pagamento.

Exceções de pagamento podem ser lançadas para os seguintes métodos: `charge`, `invoiceFor` e `invoice` em modelos que usam a trait `Billable`. Ao interagir com assinaturas, o método `create` no `SubscriptionBuilder`, e os métodos `incrementAndInvoice` e `swapAndInvoice` nos modelos `Subscription` e `SubscriptionItem` podem lançar exceções de pagamento incompleto.

Determinar se uma assinatura existente tem um pagamento incompleto pode ser feito usando o método `hasIncompletePayment` no modelo faturável ou em uma instância de assinatura:

```php
if ($user->hasIncompletePayment('default')) {
    // ...
}

if ($user->subscription('default')->hasIncompletePayment()) {
    // ...
}
```

Você pode derivar o status específico de um pagamento incompleto inspecionando a propriedade `payment` na instância da exceção:

```php
use Laravel\Cashier\Exceptions\IncompletePayment;

try {
    $user->charge(1000, 'pm_card_threeDSecure2Required');
} catch (IncompletePayment $exception) {
    // Get the payment intent status...
    $exception->payment->status;

    // Check specific conditions...
    if ($exception->payment->requiresPaymentMethod()) {
        // ...
    } elseif ($exception->payment->requiresConfirmation()) {
        // ...
    }
}
```

<a id="confirming-payments"></a>
### Confirmando Pagamentos

Alguns métodos de pagamento requerem dados adicionais para confirmar pagamentos. Por exemplo, métodos de pagamento SEPA requerem dados adicionais de "mandate" durante o processo de pagamento. Você pode fornecer esses dados ao Cashier usando o método `withPaymentConfirmationOptions`:

```php
$subscription->withPaymentConfirmationOptions([
    'mandate_data' => '...',
])->swap('price_xxx');
```

Você pode consultar a [documentação da API do Stripe](https://stripe.com/docs/api/payment_intents/confirm) para revisar todas as opções aceitas ao confirmar pagamentos.

<a id="strong-customer-authentication"></a>
## Strong Customer Authentication

Se o seu negócio ou um dos seus clientes está baseado na Europa, você precisará obedecer às regulamentações de Strong Customer Authentication (SCA) da UE. Essas regulamentações foram impostas em setembro de 2019 pela União Europeia para prevenir fraude de pagamento. Felizmente, o Stripe e o Cashier estão preparados para construir aplicações compatíveis com SCA.

> **Aviso:**
> Antes de começar, revise [o guia do Stripe sobre PSD2 e SCA](https://stripe.com/guides/strong-customer-authentication) bem como sua [documentação sobre as novas APIs de SCA](https://stripe.com/docs/strong-customer-authentication).

<a id="payments-requiring-additional-confirmation"></a>
### Pagamentos que Requerem Confirmação Adicional

As regulamentações de SCA frequentemente requerem verificação extra para confirmar e processar um pagamento. Quando isso acontece, o Cashier lançará uma exceção `Laravel\Cashier\Exceptions\IncompletePayment` que informa que verificação extra é necessária. Mais informações sobre como tratar essas exceções podem ser encontradas na documentação sobre [lidar com pagamentos falhos](#handling-failed-payments).

Telas de confirmação de pagamento apresentadas pelo Stripe ou Cashier podem ser adaptadas ao fluxo de pagamento de um banco ou emissor de cartão específico e podem incluir confirmação adicional de cartão, uma pequena cobrança temporária, autenticação separada de dispositivo ou outras formas de verificação.

<a id="incomplete-and-past-due-state"></a>
#### Estado Incompleto e Vencido (Past Due)

Quando um pagamento precisa de confirmação adicional, a assinatura permanecerá em um estado `incomplete` ou `past_due` conforme indicado por sua coluna de banco de dados `stripe_status`. O Cashier automaticamente ativará a assinatura do cliente assim que a confirmação de pagamento estiver completa e sua aplicação for notificada pelo Stripe via webhook de sua conclusão.

Para mais informações sobre os estados `incomplete` e `past_due`, consulte [nossa documentação adicional sobre esses estados](#incomplete-and-past-due-status).

<a id="off-session-payment-notifications"></a>
### Notificações de Pagamento Off-session

Como as regulamentações de SCA requerem que os clientes ocasionalmente verifiquem seus detalhes de pagamento mesmo enquanto sua assinatura está ativa, o Cashier pode enviar uma notificação ao cliente quando a confirmação de pagamento off-session é necessária. Por exemplo, isso pode ocorrer quando uma assinatura está sendo renovada. A notificação de pagamento do Cashier pode ser habilitada definindo a variável de ambiente `CASHIER_PAYMENT_NOTIFICATION` para uma classe de notificação. Por padrão, essa notificação está desabilitada. É claro que o Cashier inclui uma classe de notificação que você pode usar para esse propósito, mas você é livre para fornecer sua própria classe de notificação se desejar:

```ini
CASHIER_PAYMENT_NOTIFICATION=Laravel\Cashier\Notifications\ConfirmPayment
```

Para garantir que as notificações de confirmação de pagamento off-session sejam entregues, verifique se [os webhooks do Stripe estão configurados](#handling-stripe-webhooks) para a sua aplicação e se o webhook `invoice.payment_action_required` está habilitado no seu dashboard do Stripe. Além disso, seu modelo `Billable` também deve usar a trait `Illuminate\Notifications\Notifiable` do Laravel.

> **Aviso:**
> As notificações serão enviadas mesmo quando os clientes estiverem fazendo manualmente um pagamento que requer confirmação adicional. Infelizmente, não há maneira de o Stripe saber se o pagamento foi feito manualmente ou "off-session". Mas, um cliente simplesmente verá uma mensagem "Payment Successful" se visitar a página de pagamento após já ter confirmado seu pagamento. O cliente não terá permissão para confirmar acidentalmente o mesmo pagamento duas vezes e incorrer em uma segunda cobrança acidental.

<a id="stripe-sdk"></a>
## SDK do Stripe

Muitos dos objetos do Cashier são wrappers em torno de objetos do SDK do Stripe. Se você quiser interagir com os objetos do Stripe diretamente, você pode recuperá-los convenientemente usando o método `asStripe`:

```php
$stripeSubscription = $subscription->asStripeSubscription();

$stripeSubscription->application_fee_percent = 5;

$stripeSubscription->save();
```

Você também pode usar o método `updateStripeSubscription` para atualizar uma assinatura do Stripe diretamente:

```php
$subscription->updateStripeSubscription(['application_fee_percent' => 5]);
```

Você pode invocar o método `stripe` na classe `Cashier` se quiser usar o cliente `Stripe\StripeClient` diretamente. Por exemplo, você poderia usar esse método para acessar a instância de `StripeClient` e recuperar uma lista de preços da sua conta do Stripe:

```php
use Laravel\Cashier\Cashier;

$prices = Cashier::stripe()->prices->all();
```

<a id="testing"></a>
## Testes

Ao testar uma aplicação que usa o Cashier, você pode mockar as requisições HTTP reais à API do Stripe; no entanto, isso requer que você reimplemente parcialmente o comportamento do próprio Cashier. Portanto, recomendamos permitir que seus testes atinjam a API real do Stripe. Embora isso seja mais lento, fornece mais confiança de que sua aplicação está funcionando como esperado e quaisquer testes lentos podem ser colocados dentro de seu próprio grupo de teste Pest / PHPUnit.

Ao testar, lembre-se de que o próprio Cashier já tem um ótimo conjunto de testes, portanto você deve focar apenas em testar o fluxo de assinatura e pagamento da sua própria aplicação e não todo comportamento subjacente do Cashier.

Para começar, adicione a versão de **testing** do seu Stripe secret ao seu arquivo `phpunit.xml`:

```xml
<env name="STRIPE_SECRET" value="sk_test_<your-key>"/>
```

Agora, sempre que você interagir com o Cashier durante os testes, ele enviará requisições de API reais ao seu ambiente de testing do Stripe. Por conveniência, você deve pré-preencher sua conta de testing do Stripe com assinaturas / preços que você pode usar durante os testes.

> **Nota:**
> Para testar uma variedade de cenários de billing, como recusas e falhas de cartão de crédito, você pode usar a vasta gama de [números de cartão e tokens de teste](https://stripe.com/docs/testing) fornecidos pelo Stripe.
