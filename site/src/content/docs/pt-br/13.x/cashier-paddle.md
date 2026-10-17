---
title: "Laravel Cashier (Paddle)"
---

- [Introdução](#introduction)
- [Atualizando o Cashier](#upgrading-cashier)
- [Instalação](#installation)
    - [Paddle Sandbox](#paddle-sandbox)
- [Configuração](#configuration)
    - [Model Faturável (Billable)](#billable-model)
    - [Chaves de API](#api-keys)
    - [Paddle JS](#paddle-js)
    - [Configuração de Moeda](#currency-configuration)
    - [Sobrescrevendo Models Padrão](#overriding-default-models)
- [Início Rápido](#quickstart)
    - [Vendendo Produtos](#quickstart-selling-products)
    - [Vendendo Assinaturas](#quickstart-selling-subscriptions)
- [Sessões de Checkout](#checkout-sessions)
    - [Overlay Checkout](#overlay-checkout)
    - [Inline Checkout](#inline-checkout)
    - [Checkouts de Convidado](#guest-checkouts)
- [Prévias de Preço](#price-previews)
    - [Prévias de Preço do Cliente](#customer-price-previews)
    - [Descontos](#price-discounts)
- [Clientes](#customers)
    - [Padrões do Cliente](#customer-defaults)
    - [Recuperando Clientes](#retrieving-customers)
    - [Criando Clientes](#creating-customers)
- [Assinaturas](#subscriptions)
    - [Criando Assinaturas](#creating-subscriptions)
    - [Verificando o Status da Assinatura](#checking-subscription-status)
    - [Cobranças Únicas na Assinatura](#subscription-single-charges)
    - [Atualizando Informações de Pagamento](#updating-payment-information)
    - [Alterando Planos](#changing-plans)
    - [Quantidade da Assinatura](#subscription-quantity)
    - [Assinaturas com Múltiplos Produtos](#subscriptions-with-multiple-products)
    - [Múltiplas Assinaturas](#multiple-subscriptions)
    - [Pausando Assinaturas](#pausing-subscriptions)
    - [Cancelando Assinaturas](#canceling-subscriptions)
- [Períodos de Teste de Assinatura](#subscription-trials)
    - [Com Método de Pagamento Antecipado](#with-payment-method-up-front)
    - [Sem Método de Pagamento Antecipado](#without-payment-method-up-front)
    - [Estender ou Ativar um Período de Teste](#extend-or-activate-a-trial)
- [Tratando Webhooks do Paddle](#handling-paddle-webhooks)
    - [Definindo Handlers de Eventos de Webhook](#defining-webhook-event-handlers)
    - [Verificando Assinaturas de Webhook](#verifying-webhook-signatures)
- [Cobranças Únicas](#single-charges)
    - [Cobrando por Produtos](#charging-for-products)
    - [Reembolsando Transações](#refunding-transactions)
    - [Creditando Transações](#crediting-transactions)
- [Transações](#transactions)
    - [Pagamentos Passados e Futuros](#past-and-upcoming-payments)
- [Testes](#testing)

<a id="introduction"></a>
## Introdução

> **Aviso:**
> Esta documentação é para a integração do Cashier Paddle 2.x com o Paddle Billing. Se você ainda está usando o Paddle Classic, você deve usar o [Cashier Paddle 1.x](https://github.com/laravel/cashier-paddle/tree/1.x).

O [Laravel Cashier Paddle](https://github.com/laravel/cashier-paddle) fornece uma interface expressiva e fluente para os serviços de cobrança de assinatura do [Paddle](https://paddle.com). Ele lida com quase todo o código boilerplate de cobrança de assinatura que você teme. Além do gerenciamento básico de assinaturas, o Cashier pode lidar com: troca de assinaturas, "quantidades" de assinatura, pausa de assinatura, períodos de carência de cancelamento e mais.

Antes de se aprofundar no Cashier Paddle, recomendamos que você também revise os [guias de conceitos](https://developer.paddle.com/concepts/overview) e a [documentação da API](https://developer.paddle.com/api-reference/overview) do Paddle.

<a id="upgrading-cashier"></a>
## Atualizando o Cashier

Ao atualizar para uma nova versão do Cashier, é importante que você revise cuidadosamente [o guia de atualização](https://github.com/laravel/cashier-paddle/blob/master/UPGRADE.md).

<a id="installation"></a>
## Instalação

Primeiro, instale o pacote Cashier para Paddle usando o gerenciador de pacotes Composer:

```shell
composer require laravel/cashier-paddle
```

Em seguida, você deve publicar os arquivos de migration do Cashier usando o comando Artisan `vendor:publish`:

```shell
php artisan vendor:publish --tag="cashier-migrations"
```

Então, você deve executar as migrations de banco de dados da sua aplicação. As migrations do Cashier criarão uma nova tabela `customers`. Além disso, novas tabelas `subscriptions` e `subscription_items` serão criadas para armazenar todas as assinaturas dos seus clientes. Por fim, uma nova tabela `transactions` será criada para armazenar todas as transações do Paddle associadas aos seus clientes:

```shell
php artisan migrate
```

> **Aviso:**
> Para garantir que o Cashier trate adequadamente todos os eventos do Paddle, lembre-se de [configurar o tratamento de webhooks do Cashier](#handling-paddle-webhooks).

<a id="paddle-sandbox"></a>
### Paddle Sandbox

Durante o desenvolvimento local e de staging, você deve [registrar uma conta Paddle Sandbox](https://sandbox-login.paddle.com/signup). Essa conta lhe dará um ambiente sandbox para testar e desenvolver suas aplicações sem fazer pagamentos reais. Você pode usar os [números de cartão de teste](https://developer.paddle.com/concepts/payment-methods/credit-debit-card#test-payment-method) do Paddle para simular vários cenários de pagamento.

Ao usar o ambiente Paddle Sandbox, você deve definir a variável de ambiente `PADDLE_SANDBOX` como `true` no arquivo `.env` da sua aplicação:

```ini
PADDLE_SANDBOX=true
```

Depois de terminar de desenvolver sua aplicação, você pode [solicitar uma conta de vendedor Paddle](https://paddle.com). Antes de sua aplicação ser colocada em produção, o Paddle precisará aprovar o domínio da sua aplicação.

<a id="configuration"></a>
## Configuração

<a id="billable-model"></a>
### Model Faturável (Billable)

Antes de usar o Cashier, você deve adicionar a trait `Billable` à definição do seu model de usuário. Essa trait fornece vários métodos para permitir que você execute tarefas comuns de cobrança, como criar assinaturas e atualizar informações de método de pagamento:

```php
use Laravel\Paddle\Billable;

class User extends Authenticatable
{
    use Billable;
}
```

Se você tem entidades faturáveis que não são usuários, você também pode adicionar a trait a essas classes:

```php
use Illuminate\Database\Eloquent\Model;
use Laravel\Paddle\Billable;

class Team extends Model
{
    use Billable;
}
```

<a id="api-keys"></a>
### Chaves de API

Em seguida, você deve configurar suas chaves do Paddle no arquivo `.env` da sua aplicação. Você pode recuperar suas chaves de API do Paddle a partir do painel de controle do Paddle:

```ini
PADDLE_CLIENT_SIDE_TOKEN=your-paddle-client-side-token
PADDLE_API_KEY=your-paddle-api-key
PADDLE_RETAIN_KEY=your-paddle-retain-key
PADDLE_WEBHOOK_SECRET="your-paddle-webhook-secret"
PADDLE_SANDBOX=true
```

A variável de ambiente `PADDLE_SANDBOX` deve ser definida como `true` quando você está usando o [ambiente Sandbox do Paddle](#paddle-sandbox). A variável `PADDLE_SANDBOX` deve ser definida como `false` se você está implantando sua aplicação em produção e está usando o ambiente de vendedor ao vivo do Paddle.

A `PADDLE_RETAIN_KEY` é opcional e só deve ser definida se você estiver usando o Paddle com o [Retain](https://developer.paddle.com/concepts/retain/overview).

<a id="paddle-js"></a>
### Paddle JS

O Paddle depende de sua própria biblioteca JavaScript para iniciar o widget de checkout do Paddle. Você pode carregar a biblioteca JavaScript colocando a diretiva Blade `@paddleJS` logo antes da tag `</head>` de fechamento do layout da sua aplicação:

```blade
<head>
    ...

    @paddleJS
</head>
```

<a id="currency-configuration"></a>
### Configuração de Moeda

Você pode especificar um locale a ser usado ao formatar valores monetários para exibição em faturas. Internamente, o Cashier utiliza a [classe `NumberFormatter` do PHP](https://www.php.net/manual/en/class.numberformatter.php) para definir o locale da moeda:

```ini
CASHIER_CURRENCY_LOCALE=nl_BE
```

> **Aviso:**
> Para usar locales diferentes de `en`, certifique-se de que a extensão PHP `ext-intl` esteja instalada e configurada no seu servidor.

<a id="overriding-default-models"></a>
### Sobrescrevendo Models Padrão

Você é livre para estender os models usados internamente pelo Cashier definindo seu próprio model e estendendo o model correspondente do Cashier:

```php
use Laravel\Paddle\Subscription as CashierSubscription;

class Subscription extends CashierSubscription
{
    // ...
}
```

Depois de definir seu model, você pode instruir o Cashier a usar seu model personalizado via a classe `Laravel\Paddle\Cashier`. Normalmente, você deve informar o Cashier sobre seus models personalizados no método `boot` da classe `App\Providers\AppServiceProvider` da sua aplicação:

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
## Início Rápido

<a id="quickstart-selling-products"></a>
### Vendendo Produtos

> **Nota:**
> Antes de utilizar o Paddle Checkout, você deve definir Produtos com preços fixos no seu dashboard do Paddle. Além disso, você deve [configurar o tratamento de webhooks do Paddle](#handling-paddle-webhooks).

Oferecer cobrança de produtos e assinaturas via sua aplicação pode ser intimidante. No entanto, graças ao Cashier e ao [Checkout Overlay do Paddle](https://developer.paddle.com/concepts/sell/overlay-checkout), você pode facilmente construir integrações de pagamento modernas e robustas.

Para cobrar clientes por produtos não recorrentes, de cobrança única, utilizaremos o Cashier para cobrar clientes com o Checkout Overlay do Paddle, onde eles fornecerão seus detalhes de pagamento e confirmarão sua compra. Uma vez que o pagamento tenha sido feito via o Checkout Overlay, o cliente será redirecionado para uma URL de sucesso de sua escolha dentro da sua aplicação:

```php
use Illuminate\Http\Request;

Route::get('/buy', function (Request $request) {
    $checkout = $request->user()->checkout('pri_deluxe_album')
        ->returnTo(route('dashboard'));

    return view('buy', ['checkout' => $checkout]);
})->name('checkout');
```

Como você pode ver no exemplo acima, utilizaremos o método `checkout` fornecido pelo Cashier para criar um objeto de checkout a fim de apresentar ao cliente o Checkout Overlay do Paddle para um determinado "identificador de preço". Ao usar o Paddle, "preços" referem-se a [preços definidos para produtos específicos](https://developer.paddle.com/build/products/create-products-prices).

Se necessário, o método `checkout` criará automaticamente um cliente no Paddle e conectará esse registro de cliente do Paddle ao usuário correspondente no banco de dados da sua aplicação. Após completar a sessão de checkout, o cliente será redirecionado para uma página de sucesso dedicada onde você pode exibir uma mensagem informativa ao cliente.

Na view `buy`, incluiremos um botão para exibir o Checkout Overlay. O componente Blade `paddle-button` está incluído no Cashier Paddle; no entanto, você também pode [renderizar manualmente um overlay checkout](#manually-rendering-an-overlay-checkout):

```html
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Buy Product
</x-paddle-button>
```

<a id="providing-meta-data-to-paddle-checkout"></a>
#### Fornecendo Meta Dados ao Paddle Checkout

Ao vender produtos, é comum manter o registro de pedidos concluídos e produtos comprados via models `Cart` e `Order` definidos pela sua própria aplicação. Ao redirecionar clientes para o Checkout Overlay do Paddle para completar uma compra, você pode precisar fornecer um identificador de pedido existente para que você possa associar a compra concluída ao pedido correspondente quando o cliente for redirecionado de volta à sua aplicação.

Para realizar isso, você pode fornecer um array de dados personalizados ao método `checkout`. Vamos imaginar que um `Order` pendente é criado dentro da nossa aplicação quando um usuário inicia o processo de checkout. Lembre-se, os models `Cart` e `Order` neste exemplo são ilustrativos e não são fornecidos pelo Cashier. Você é livre para implementar esses conceitos com base nas necessidades da sua própria aplicação:

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

Como você pode ver no exemplo acima, quando um usuário inicia o processo de checkout, forneceremos todos os identificadores de preço do Paddle associados ao carrinho / pedido ao método `checkout`. É claro, sua aplicação é responsável por associar esses itens ao "carrinho de compras" ou pedido à medida que o cliente os adiciona. Também fornecemos o ID do pedido ao Checkout Overlay do Paddle via o método `customData`.

É claro, você provavelmente vai querer marcar o pedido como "concluído" assim que o cliente tenha terminado o processo de checkout. Para realizar isso, você pode escutar os webhooks despachados pelo Paddle e disparados via eventos pelo Cashier para armazenar informações do pedido no seu banco de dados.

Para começar, escute o evento `TransactionCompleted` despachado pelo Cashier. Normalmente, você deve registrar o listener de evento no método `boot` do `AppServiceProvider` da sua aplicação:

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

Neste exemplo, o listener `CompleteOrder` pode parecer com o seguinte:

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

Por favor, consulte a documentação do Paddle para mais informações sobre os [dados contidos pelo evento `transaction.completed`](https://developer.paddle.com/webhooks/transactions/transaction-completed).

<a id="quickstart-selling-subscriptions"></a>
### Vendendo Assinaturas

> **Nota:**
> Antes de utilizar o Paddle Checkout, você deve definir Produtos com preços fixos no seu dashboard do Paddle. Além disso, você deve [configurar o tratamento de webhooks do Paddle](#handling-paddle-webhooks).

Oferecer cobrança de produtos e assinaturas via sua aplicação pode ser intimidante. No entanto, graças ao Cashier e ao [Checkout Overlay do Paddle](https://developer.paddle.com/concepts/sell/overlay-checkout), você pode facilmente construir integrações de pagamento modernas e robustas.

Para aprender como vender assinaturas usando o Cashier e o Checkout Overlay do Paddle, vamos considerar o cenário simples de um serviço de assinatura com um plano básico mensal (`price_basic_monthly`) e anual (`price_basic_yearly`). Esses dois preços poderiam ser agrupados sob um produto "Basic" (`pro_basic`) no nosso dashboard do Paddle. Além disso, nosso serviço de assinatura pode oferecer um plano "Expert" como `pro_expert`.

Primeiro, vamos descobrir como um cliente pode se inscrever em nossos serviços. É claro, você pode imaginar que o cliente pode clicar em um botão "subscribe" para o plano Basic na página de preços da nossa aplicação. Este botão invocará um Checkout Overlay do Paddle para o plano escolhido. Para começar, vamos iniciar uma sessão de checkout via o método `checkout`:

```php
use Illuminate\Http\Request;

Route::get('/subscribe', function (Request $request) {
    $checkout = $request->user()->checkout('price_basic_monthly')
        ->returnTo(route('dashboard'));

    return view('subscribe', ['checkout' => $checkout]);
})->name('subscribe');
```

Na view `subscribe`, incluiremos um botão para exibir o Checkout Overlay. O componente Blade `paddle-button` está incluído no Cashier Paddle; no entanto, você também pode [renderizar manualmente um overlay checkout](#manually-rendering-an-overlay-checkout):

```html
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Subscribe
</x-paddle-button>
```

Agora, quando o botão Subscribe for clicado, o cliente será capaz de inserir seus detalhes de pagamento e iniciar sua assinatura. Para saber quando a assinatura realmente começou (já que alguns métodos de pagamento requerem alguns segundos para processar), você também deve [configurar o tratamento de webhooks do Cashier](#handling-paddle-webhooks).

Agora que os clientes podem iniciar assinaturas, precisamos restringir certas partes da nossa aplicação de modo que apenas usuários assinantes possam acessá-las. É claro, podemos sempre determinar o status atual da assinatura de um usuário via o método `subscribed` fornecido pela trait `Billable` do Cashier:

```blade
@if ($user->subscribed())
    <p>You are subscribed.</p>
@endif
```

Podemos até facilmente determinar se um usuário está inscrito em um produto ou preço específico:

```blade
@if ($user->subscribedToProduct('pro_basic'))
    <p>You are subscribed to our Basic product.</p>
@endif

@if ($user->subscribedToPrice('price_basic_monthly'))
    <p>You are subscribed to our monthly Basic plan.</p>
@endif
```

<a id="quickstart-building-a-subscribed-middleware"></a>
#### Construindo um Middleware de Assinatura

Por conveniência, você pode desejar criar um [middleware](/pt-br/middleware/) que determina se a requisição recebida é de um usuário assinante. Uma vez que este middleware tenha sido definido, você pode facilmente atribuí-lo a uma rota para impedir que usuários que não são assinantes acessem a rota:

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

Uma vez que o middleware tenha sido definido, você pode atribuí-lo a uma rota:

```php
use App\Http\Middleware\Subscribed;

Route::get('/dashboard', function () {
    // ...
})->middleware([Subscribed::class]);
```

<a id="quickstart-allowing-customers-to-manage-their-billing-plan"></a>
#### Permitindo que Clientes Gerenciem Seu Plano de Cobrança

É claro, os clientes podem querer mudar seu plano de assinatura para outro produto ou "tier". No nosso exemplo acima, gostaríamos de permitir que o cliente mudasse seu plano de uma assinatura mensal para uma assinatura anual. Para isso, você precisará implementar algo como um botão que leva à rota abaixo:

```php
use Illuminate\Http\Request;

Route::put('/subscription/{price}/swap', function (Request $request, $price) {
    $user->subscription()->swap($price); // With "$price" being "price_basic_yearly" for this example.

    return redirect()->route('dashboard');
})->name('subscription.swap');
```

Além de trocar planos, você também precisará permitir que seus clientes cancelem sua assinatura. Assim como ao trocar planos, forneça um botão que leva à seguinte rota:

```php
use Illuminate\Http\Request;

Route::put('/subscription/cancel', function (Request $request, $price) {
    $user->subscription()->cancel();

    return redirect()->route('dashboard');
})->name('subscription.cancel');
```

E agora sua assinatura será cancelada ao final do seu período de cobrança.

> **Nota:**
> Desde que você tenha configurado o tratamento de webhooks do Cashier, o Cashier manterá automaticamente as tabelas de banco de dados relacionadas ao Cashier da sua aplicação em sincronia, inspecionando os webhooks recebidos do Paddle. Então, por exemplo, quando você cancela a assinatura de um cliente via o dashboard do Paddle, o Cashier receberá o webhook correspondente e marcará a assinatura como "canceled" no banco de dados da sua aplicação.

<a id="checkout-sessions"></a>
## Sessões de Checkout

A maioria das operações para cobrar clientes é realizada usando "checkouts" via o [widget Checkout Overlay do Paddle](https://developer.paddle.com/build/checkout/build-overlay-checkout) ou utilizando o [inline checkout](https://developer.paddle.com/build/checkout/build-branded-inline-checkout).

Antes de processar pagamentos de checkout usando o Paddle, você deve definir o [link de pagamento padrão](https://developer.paddle.com/build/transactions/default-payment-link#set-default-link) da sua aplicação no dashboard de configurações de checkout do Paddle.

<a id="overlay-checkout"></a>
### Overlay Checkout

Antes de exibir o widget Checkout Overlay, você deve gerar uma sessão de checkout usando o Cashier. Uma sessão de checkout informará o widget de checkout sobre a operação de cobrança que deve ser realizada:

```php
use Illuminate\Http\Request;

Route::get('/buy', function (Request $request) {
    $checkout = $user->checkout('pri_34567')
        ->returnTo(route('dashboard'));

    return view('billing', ['checkout' => $checkout]);
});
```

O Cashier inclui um [componente Blade](/pt-br/blade/#components) `paddle-button`. Você pode passar a sessão de checkout a este componente como uma "prop". Então, quando este botão for clicado, o widget de checkout do Paddle será exibido:

```html
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Subscribe
</x-paddle-button>
```

Por padrão, isso exibirá o widget usando o estilo padrão do Paddle. Você pode personalizar o widget adicionando [atributos suportados pelo Paddle](https://developer.paddle.com/paddlejs/html-data-attributes) como o atributo `data-theme='light'` ao componente:

```html
<x-paddle-button :checkout="$checkout" class="px-8 py-4" data-theme="light">
    Subscribe
</x-paddle-button>
```

O widget de checkout do Paddle é assíncrono. Uma vez que o usuário cria uma assinatura dentro do widget, o Paddle enviará à sua aplicação um webhook para que você possa atualizar adequadamente o estado da assinatura no banco de dados da sua aplicação. Portanto, é importante que você [configure corretamente os webhooks](#handling-paddle-webhooks) para acomodar as mudanças de estado do Paddle.

> **Aviso:**
> Após uma mudança de estado da assinatura, o atraso para receber o webhook correspondente é tipicamente mínimo, mas você deve considerar isso na sua aplicação levando em conta que a assinatura do seu usuário pode não estar imediatamente disponível após completar o checkout.

<a id="manually-rendering-an-overlay-checkout"></a>
#### Renderizando Manualmente um Overlay Checkout

Você também pode renderizar manualmente um overlay checkout sem usar os componentes Blade integrados do Laravel. Para começar, gere a sessão de checkout [como demonstrado em exemplos anteriores](#overlay-checkout):

```php
use Illuminate\Http\Request;

Route::get('/buy', function (Request $request) {
    $checkout = $user->checkout('pri_34567')
        ->returnTo(route('dashboard'));

    return view('billing', ['checkout' => $checkout]);
});
```

Em seguida, você pode usar o Paddle.js para inicializar o checkout. Neste exemplo, criaremos um link que recebe a classe `paddle_button`. O Paddle.js detectará esta classe e exibirá o overlay checkout quando o link for clicado:

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
### Inline Checkout

Se você não quer fazer uso do widget de checkout estilo "overlay" do Paddle, o Paddle também fornece a opção de exibir o widget inline. Embora essa abordagem não permita que você ajuste quaisquer campos HTML do checkout, ela permite que você incorpore o widget dentro da sua aplicação.

Para facilitar que você comece com o inline checkout, o Cashier inclui um componente Blade `paddle-checkout`. Para começar, você deve [gerar uma sessão de checkout](#overlay-checkout):

```php
use Illuminate\Http\Request;

Route::get('/buy', function (Request $request) {
    $checkout = $user->checkout('pri_34567')
        ->returnTo(route('dashboard'));

    return view('billing', ['checkout' => $checkout]);
});
```

Então, você pode passar a sessão de checkout ao atributo `checkout` do componente:

```blade
<x-paddle-checkout :checkout="$checkout" class="w-full" />
```

Para ajustar a altura do componente de inline checkout, você pode passar o atributo `height` ao componente Blade:

```blade
<x-paddle-checkout :checkout="$checkout" class="w-full" height="500" />
```

Por favor, consulte o [guia sobre Inline Checkout](https://developer.paddle.com/build/checkout/build-branded-inline-checkout) do Paddle e as [configurações de checkout disponíveis](https://developer.paddle.com/build/checkout/set-up-checkout-default-settings) para mais detalhes sobre as opções de personalização do inline checkout.

<a id="manually-rendering-an-inline-checkout"></a>
#### Renderizando Manualmente um Inline Checkout

Você também pode renderizar manualmente um inline checkout sem usar os componentes Blade integrados do Laravel. Para começar, gere a sessão de checkout [como demonstrado em exemplos anteriores](#inline-checkout):

```php
use Illuminate\Http\Request;

Route::get('/buy', function (Request $request) {
    $checkout = $user->checkout('pri_34567')
        ->returnTo(route('dashboard'));

    return view('billing', ['checkout' => $checkout]);
});
```

Em seguida, você pode usar o Paddle.js para inicializar o checkout. Neste exemplo, demonstraremos isso usando o [Alpine.js](https://github.com/alpinejs/alpine); no entanto, você é livre para modificar este exemplo para sua própria stack de frontend:

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
### Checkouts de Convidado

Às vezes, você pode precisar criar uma sessão de checkout para usuários que não precisam de uma conta na sua aplicação. Para fazer isso, você pode usar o método `guest`:

```php
use Illuminate\Http\Request;
use Laravel\Paddle\Checkout;

Route::get('/buy', function (Request $request) {
    $checkout = Checkout::guest(['pri_34567'])
        ->returnTo(route('home'));

    return view('billing', ['checkout' => $checkout]);
});
```

Então, você pode fornecer a sessão de checkout aos componentes Blade do [Paddle button](#overlay-checkout) ou do [inline checkout](#inline-checkout).

<a id="price-previews"></a>
## Prévias de Preço

O Paddle permite que você personalize preços por moeda, essencialmente permitindo que você configure preços diferentes para países diferentes. O Cashier Paddle permite que você recupere todos esses preços usando o método `previewPrices`. Este método aceita os IDs de preço para os quais você deseja recuperar preços:

```php
use Laravel\Paddle\Cashier;

$prices = Cashier::previewPrices(['pri_123', 'pri_456']);
```

A moeda será determinada com base no endereço IP da requisição; no entanto, você pode opcionalmente fornecer um país específico para recuperar preços:

```php
use Laravel\Paddle\Cashier;

$prices = Cashier::previewPrices(['pri_123', 'pri_456'], ['address' => [
    'country_code' => 'BE',
    'postal_code' => '1234',
]]);
```

Após recuperar os preços, você pode exibi-los como desejar:

```blade
<ul>
    @foreach ($prices as $price)
        <li>{{ $price->product['name'] }} - {{ $price->total() }}</li>
    @endforeach
</ul>
```

Você também pode exibir o preço subtotal e o valor do imposto separadamente:

```blade
<ul>
    @foreach ($prices as $price)
        <li>{{ $price->product['name'] }} - {{ $price->subtotal() }} (+ {{ $price->tax() }} tax)</li>
    @endforeach
</ul>
```

Para mais informações, [confira a documentação da API do Paddle sobre prévias de preço](https://developer.paddle.com/api-reference/pricing-preview/preview-prices).

<a id="customer-price-previews"></a>
### Prévias de Preço do Cliente

Se um usuário já é um cliente e você gostaria de exibir os preços que se aplicam a esse cliente, você pode fazê-lo recuperando os preços diretamente da instância do cliente:

```php
use App\Models\User;

$prices = User::find(1)->previewPrices(['pri_123', 'pri_456']);
```

Internamente, o Cashier usará o ID de cliente do usuário para recuperar os preços na moeda dele. Então, por exemplo, um usuário que vive nos Estados Unidos verá preços em dólares americanos, enquanto um usuário na Bélgica verá preços em Euros. Se nenhuma moeda correspondente puder ser encontrada, a moeda padrão do produto será usada. Você pode personalizar todos os preços de um produto ou plano de assinatura no painel de controle do Paddle.

<a id="price-discounts"></a>
### Descontos

Você também pode escolher exibir preços após um desconto. Ao chamar o método `previewPrices`, você fornece o ID do desconto via a opção `discount_id`:

```php
use Laravel\Paddle\Cashier;

$prices = Cashier::previewPrices(['pri_123', 'pri_456'], [
    'discount_id' => 'dsc_123'
]);
```

Então, exiba os preços calculados:

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
### Padrões do Cliente

O Cashier permite que você defina alguns padrões úteis para seus clientes ao criar sessões de checkout. Definir esses padrões permite que você pré-preencha o endereço de e-mail e o nome de um cliente para que ele possa seguir imediatamente para a parte de pagamento do widget de checkout. Você pode definir esses padrões sobrescrevendo os seguintes métodos no seu model faturável:

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

Esses padrões serão usados para cada ação no Cashier que gera uma [sessão de checkout](#checkout-sessions).

<a id="retrieving-customers"></a>
### Recuperando Clientes

Você pode recuperar um cliente pelo seu ID de Cliente do Paddle usando o método `Cashier::findBillable`. Este método retornará uma instância do model faturável:

```php
use Laravel\Paddle\Cashier;

$user = Cashier::findBillable($customerId);
```

<a id="creating-customers"></a>
### Criando Clientes

Ocasionalmente, você pode desejar criar um cliente do Paddle sem iniciar uma assinatura. Você pode realizar isso usando o método `createAsCustomer`:

```php
$customer = $user->createAsCustomer();
```

Uma instância de `Laravel\Paddle\Customer` é retornada. Uma vez que o cliente tenha sido criado no Paddle, você pode iniciar uma assinatura em uma data posterior. Você pode fornecer um array `$options` opcional para passar quaisquer [parâmetros adicionais de criação de cliente que são suportados pela API do Paddle](https://developer.paddle.com/api-reference/customers/create-customer):

```php
$customer = $user->createAsCustomer($options);
```

<a id="subscriptions"></a>
## Assinaturas

<a id="creating-subscriptions"></a>
### Criando Assinaturas

Para criar uma assinatura, primeiro recupere uma instância do seu model faturável do seu banco de dados, que normalmente será uma instância de `App\Models\User`. Uma vez que você tenha recuperado a instância do model, você pode usar o método `subscribe` para criar a sessão de checkout do model:

```php
use Illuminate\Http\Request;

Route::get('/user/subscribe', function (Request $request) {
    $checkout = $request->user()->subscribe($premium = 'pri_123', 'default')
        ->returnTo(route('home'));

    return view('billing', ['checkout' => $checkout]);
});
```

O primeiro argumento dado ao método `subscribe` é o preço específico ao qual o usuário está se inscrevendo. Esse valor deve corresponder ao identificador do preço no Paddle. O método `returnTo` aceita uma URL para a qual seu usuário será redirecionado após completar o checkout com sucesso. O segundo argumento passado ao método `subscribe` deve ser o "tipo" interno da assinatura. Se sua aplicação oferece apenas uma única assinatura, você pode chamá-lo de `default` ou `primary`. Esse tipo de assinatura é apenas para uso interno da aplicação e não deve ser exibido aos usuários. Além disso, ele não deve conter espaços e nunca deve ser alterado após criar a assinatura.

Você também pode fornecer um array de metadados personalizados sobre a assinatura usando o método `customData`:

```php
$checkout = $request->user()->subscribe($premium = 'pri_123', 'default')
    ->customData(['key' => 'value'])
    ->returnTo(route('home'));
```

Uma vez que uma sessão de checkout de assinatura tenha sido criada, a sessão de checkout pode ser fornecida ao [componente Blade](#overlay-checkout) `paddle-button` que está incluído no Cashier Paddle:

```blade
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Subscribe
</x-paddle-button>
```

Depois que o usuário tiver terminado seu checkout, um webhook `subscription_created` será despachado pelo Paddle. O Cashier receberá este webhook e configurará a assinatura para seu cliente. Para garantir que todos os webhooks sejam recebidos e tratados adequadamente pela sua aplicação, certifique-se de ter [configurado corretamente o tratamento de webhooks](#handling-paddle-webhooks).

<a id="checking-subscription-status"></a>
### Verificando o Status da Assinatura

Uma vez que um usuário esteja inscrito na sua aplicação, você pode verificar o status da assinatura dele usando uma variedade de métodos convenientes. Primeiro, o método `subscribed` retorna `true` se o usuário tem uma assinatura válida, mesmo que a assinatura esteja atualmente dentro do seu período de teste:

```php
if ($user->subscribed()) {
    // ...
}
```

Se sua aplicação oferece múltiplas assinaturas, você pode especificar a assinatura ao invocar o método `subscribed`:

```php
if ($user->subscribed('default')) {
    // ...
}
```

O método `subscribed` também é um ótimo candidato para um [middleware de rota](/pt-br/middleware/), permitindo que você filtre o acesso a rotas e controllers com base no status da assinatura do usuário:

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

Se você gostaria de determinar se um usuário ainda está dentro do seu período de teste, você pode usar o método `onTrial`. Este método pode ser útil para determinar se você deve exibir um aviso ao usuário de que ele ainda está no período de teste:

```php
if ($user->subscription()->onTrial()) {
    // ...
}
```

O método `subscribedToPrice` pode ser usado para determinar se o usuário está inscrito em um determinado plano com base em um determinado ID de preço do Paddle. Neste exemplo, determinaremos se a assinatura `default` do usuário está ativamente inscrita no preço mensal:

```php
if ($user->subscribedToPrice($monthly = 'pri_123', 'default')) {
    // ...
}
```

O método `recurring` pode ser usado para determinar se o usuário está atualmente em uma assinatura ativa e não está mais dentro do seu período de teste ou em um período de carência:

```php
if ($user->subscription()->recurring()) {
    // ...
}
```

<a id="canceled-subscription-status"></a>
#### Status de Assinatura Cancelada

Para determinar se o usuário foi um assinante ativo mas cancelou sua assinatura, você pode usar o método `canceled`:

```php
if ($user->subscription()->canceled()) {
    // ...
}
```

Você também pode determinar se um usuário cancelou sua assinatura, mas ainda está no seu "período de carência" até a assinatura expirar completamente. Por exemplo, se um usuário cancela uma assinatura no dia 5 de março que estava originalmente agendada para expirar no dia 10 de março, o usuário está no seu "período de carência" até o dia 10 de março. Além disso, o método `subscribed` ainda retornará `true` durante esse período:

```php
if ($user->subscription()->onGracePeriod()) {
    // ...
}
```

<a id="past-due-status"></a>
#### Status Past Due (Vencido)

Se um pagamento falhar para uma assinatura, ela será marcada como `past_due`. Quando sua assinatura está nesse estado, ela não estará ativa até que o cliente tenha atualizado suas informações de pagamento. Você pode determinar se uma assinatura está vencida usando o método `pastDue` na instância da assinatura:

```php
if ($user->subscription()->pastDue()) {
    // ...
}
```

Quando uma assinatura está vencida, você deve instruir o usuário a [atualizar suas informações de pagamento](#updating-payment-information).

Se você gostaria que as assinaturas ainda fossem consideradas válidas quando estiverem `past_due`, você pode usar o método `keepPastDueSubscriptionsActive` fornecido pelo Cashier. Normalmente, este método deve ser chamado no método `register` do seu `AppServiceProvider`:

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

> **Aviso:**
> Quando uma assinatura está em um estado `past_due`, ela não pode ser alterada até que as informações de pagamento tenham sido atualizadas. Portanto, os métodos `swap` e `updateQuantity` lançarão uma exceção quando a assinatura estiver em um estado `past_due`.

<a id="subscription-scopes"></a>
#### Scopes de Assinatura

A maioria dos estados de assinatura também está disponível como query scopes para que você possa facilmente consultar seu banco de dados por assinaturas que estão em um determinado estado:

```php
// Get all valid subscriptions...
$subscriptions = Subscription::query()->valid()->get();

// Get all of the canceled subscriptions for a user...
$subscriptions = $user->subscriptions()->canceled()->get();
```

Uma lista completa dos scopes disponíveis está disponível abaixo:

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
### Cobranças Únicas na Assinatura

Cobranças únicas na assinatura permitem que você cobre assinantes com uma cobrança única em cima de suas assinaturas. Você deve fornecer um ou múltiplos IDs de preço ao invocar o método `charge`:

```php
// Charge a single price...
$response = $user->subscription()->charge('pri_123');

// Charge multiple prices at once...
$response = $user->subscription()->charge(['pri_123', 'pri_456']);
```

O método `charge` não cobrará de fato o cliente até o próximo intervalo de cobrança da assinatura dele. Se você gostaria de cobrar o cliente imediatamente, você pode usar o método `chargeAndInvoice` em vez disso:

```php
$response = $user->subscription()->chargeAndInvoice('pri_123');
```

<a id="updating-payment-information"></a>
### Atualizando Informações de Pagamento

O Paddle sempre salva um método de pagamento por assinatura. Se você quiser atualizar o método de pagamento padrão para uma assinatura, você deve redirecionar seu cliente para a página de atualização de método de pagamento hospedada pelo Paddle usando o método `redirectToUpdatePaymentMethod` no model da assinatura:

```php
use Illuminate\Http\Request;

Route::get('/update-payment-method', function (Request $request) {
    $user = $request->user();

    return $user->subscription()->redirectToUpdatePaymentMethod();
});
```

Quando um usuário tiver terminado de atualizar suas informações, um webhook `subscription_updated` será despachado pelo Paddle e os detalhes da assinatura serão atualizados no banco de dados da sua aplicação.

<a id="changing-plans"></a>
### Alterando Planos

Depois que um usuário tiver se inscrito na sua aplicação, ele pode ocasionalmente querer mudar para um novo plano de assinatura. Para atualizar o plano de assinatura de um usuário, você deve passar o identificador do preço do Paddle ao método `swap` da assinatura:

```php
use App\Models\User;

$user = User::find(1);

$user->subscription()->swap($premium = 'pri_456');
```

Se você gostaria de trocar planos e faturar imediatamente o usuário em vez de esperar pelo próximo ciclo de cobrança, você pode usar o método `swapAndInvoice`:

```php
$user = User::find(1);

$user->subscription()->swapAndInvoice($premium = 'pri_456');
```

<a id="prorations"></a>
#### Rateios (Prorations)

Por padrão, o Paddle rateia as cobranças ao trocar entre planos. O método `noProrate` pode ser usado para atualizar as assinaturas sem ratear as cobranças:

```php
$user->subscription('default')->noProrate()->swap($premium = 'pri_456');
```

Se você gostaria de desabilitar o rateio e faturar os clientes imediatamente, você pode usar o método `swapAndInvoice` em combinação com `noProrate`:

```php
$user->subscription('default')->noProrate()->swapAndInvoice($premium = 'pri_456');
```

Ou, para não faturar seu cliente por uma mudança de assinatura, você pode utilizar o método `doNotBill`:

```php
$user->subscription('default')->doNotBill()->swap($premium = 'pri_456');
```

Para mais informações sobre as políticas de rateio do Paddle, por favor consulte a [documentação de rateio](https://developer.paddle.com/concepts/subscriptions/proration) do Paddle.

<a id="subscription-quantity"></a>
### Quantidade da Assinatura

Às vezes as assinaturas são afetadas por "quantidade". Por exemplo, uma aplicação de gerenciamento de projetos pode cobrar $10 por mês por projeto. Para incrementar ou decrementar facilmente a quantidade da sua assinatura, use os métodos `incrementQuantity` e `decrementQuantity`:

```php
$user = User::find(1);

$user->subscription()->incrementQuantity();

// Add five to the subscription's current quantity...
$user->subscription()->incrementQuantity(5);

$user->subscription()->decrementQuantity();

// Subtract five from the subscription's current quantity...
$user->subscription()->decrementQuantity(5);
```

Alternativamente, você pode definir uma quantidade específica usando o método `updateQuantity`:

```php
$user->subscription()->updateQuantity(10);
```

O método `noProrate` pode ser usado para atualizar a quantidade da assinatura sem ratear as cobranças:

```php
$user->subscription()->noProrate()->updateQuantity(10);
```

<a id="quantities-for-subscription-with-multiple-products"></a>
#### Quantidades para Assinaturas com Múltiplos Produtos

Se sua assinatura é uma [assinatura com múltiplos produtos](#subscriptions-with-multiple-products), você deve passar o ID do preço cuja quantidade você deseja incrementar ou decrementar como o segundo argumento aos métodos increment / decrement:

```php
$user->subscription()->incrementQuantity(1, 'price_chat');
```

<a id="subscriptions-with-multiple-products"></a>
### Assinaturas com Múltiplos Produtos

[Assinatura com múltiplos produtos](https://developer.paddle.com/build/subscriptions/add-remove-products-prices-addons) permite que você atribua múltiplos produtos de cobrança a uma única assinatura. Por exemplo, imagine que você está construindo uma aplicação de "helpdesk" de atendimento ao cliente que tem um preço de assinatura base de $10 por mês, mas oferece um produto adicional de chat ao vivo por mais $15 por mês.

Ao criar sessões de checkout de assinatura, você pode especificar múltiplos produtos para uma determinada assinatura passando um array de preços como o primeiro argumento ao método `subscribe`:

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

No exemplo acima, o cliente terá dois preços anexados à sua assinatura `default`. Ambos os preços serão cobrados em seus respectivos intervalos de cobrança. Se necessário, você pode passar um array associativo de pares chave / valor para indicar uma quantidade específica para cada preço:

```php
$user = User::find(1);

$checkout = $user->subscribe(['price_monthly', 'price_chat' => 5]);
```

Se você gostaria de adicionar outro preço a uma assinatura existente, você deve usar o método `swap` da assinatura. Ao invocar o método `swap`, você também deve incluir os preços e quantidades atuais da assinatura:

```php
$user = User::find(1);

$user->subscription()->swap(['price_chat', 'price_original' => 2]);
```

O exemplo acima adicionará o novo preço, mas o cliente não será faturado por ele até o próximo ciclo de cobrança. Se você gostaria de faturar o cliente imediatamente, você pode usar o método `swapAndInvoice`:

```php
$user->subscription()->swapAndInvoice(['price_chat', 'price_original' => 2]);
```

Você pode remover preços de assinaturas usando o método `swap` e omitindo o preço que você quer remover:

```php
$user->subscription()->swap(['price_original' => 2]);
```

> **Aviso:**
> Você não pode remover o último preço de uma assinatura. Em vez disso, você deve simplesmente cancelar a assinatura.

<a id="multiple-subscriptions"></a>
### Múltiplas Assinaturas

O Paddle permite que seus clientes tenham múltiplas assinaturas simultaneamente. Por exemplo, você pode administrar uma academia que oferece uma assinatura de natação e uma assinatura de musculação, e cada assinatura pode ter preços diferentes. É claro, os clientes devem ser capazes de se inscrever em qualquer um ou em ambos os planos.

Quando sua aplicação cria assinaturas, você pode fornecer o tipo da assinatura ao método `subscribe` como o segundo argumento. O tipo pode ser qualquer string que represente o tipo de assinatura que o usuário está iniciando:

```php
use Illuminate\Http\Request;

Route::post('/swimming/subscribe', function (Request $request) {
    $checkout = $request->user()->subscribe($swimmingMonthly = 'pri_123', 'swimming');

    return view('billing', ['checkout' => $checkout]);
});
```

Neste exemplo, iniciamos uma assinatura mensal de natação para o cliente. No entanto, ele pode querer trocar para uma assinatura anual em um momento posterior. Ao ajustar a assinatura do cliente, podemos simplesmente trocar o preço na assinatura `swimming`:

```php
$user->subscription('swimming')->swap($swimmingYearly = 'pri_456');
```

É claro, você também pode cancelar a assinatura inteiramente:

```php
$user->subscription('swimming')->cancel();
```

<a id="pausing-subscriptions"></a>
### Pausando Assinaturas

Para pausar uma assinatura, chame o método `pause` na assinatura do usuário:

```php
$user->subscription()->pause();
```

Quando uma assinatura é pausada, o Cashier definirá automaticamente a coluna `paused_at` no seu banco de dados. Essa coluna é usada para determinar quando o método `paused` deve começar a retornar `true`. Por exemplo, se um cliente pausa uma assinatura no dia 1 de março, mas a assinatura não estava agendada para recorrer até o dia 5 de março, o método `paused` continuará a retornar `false` até o dia 5 de março. Isso ocorre porque a um usuário normalmente é permitido continuar usando uma aplicação até o final do seu ciclo de cobrança.

Por padrão, a pausa acontece no próximo intervalo de cobrança para que o cliente possa usar o restante do período pelo qual pagou. Se você quer pausar uma assinatura imediatamente, você pode usar o método `pauseNow`:

```php
$user->subscription()->pauseNow();
```

Usando o método `pauseUntil`, você pode pausar a assinatura até um momento específico no tempo:

```php
$user->subscription()->pauseUntil(now()->plus(months: 1));
```

Ou, você pode usar o método `pauseNowUntil` para pausar imediatamente a assinatura até um determinado ponto no tempo:

```php
$user->subscription()->pauseNowUntil(now()->plus(months: 1));
```

Você pode determinar se um usuário pausou sua assinatura, mas ainda está no seu "período de carência" usando o método `onPausedGracePeriod`:

```php
if ($user->subscription()->onPausedGracePeriod()) {
    // ...
}
```

Para retomar uma assinatura pausada, você pode invocar o método `resume` na assinatura:

```php
$user->subscription()->resume();
```

> **Aviso:**
> Uma assinatura não pode ser modificada enquanto está pausada. Se você quer trocar para um plano diferente ou atualizar quantidades, você deve retomar a assinatura primeiro.

<a id="canceling-subscriptions"></a>
### Cancelando Assinaturas

Para cancelar uma assinatura, chame o método `cancel` na assinatura do usuário:

```php
$user->subscription()->cancel();
```

Quando uma assinatura é cancelada, o Cashier definirá automaticamente a coluna `ends_at` no seu banco de dados. Essa coluna é usada para determinar quando o método `subscribed` deve começar a retornar `false`. Por exemplo, se um cliente cancela uma assinatura no dia 1 de março, mas a assinatura não estava agendada para terminar até o dia 5 de março, o método `subscribed` continuará a retornar `true` até o dia 5 de março. Isso é feito porque a um usuário normalmente é permitido continuar usando uma aplicação até o final do seu ciclo de cobrança.

Você pode determinar se um usuário cancelou sua assinatura, mas ainda está no seu "período de carência" usando o método `onGracePeriod`:

```php
if ($user->subscription()->onGracePeriod()) {
    // ...
}
```

Se você deseja cancelar uma assinatura imediatamente, você pode chamar o método `cancelNow` na assinatura:

```php
$user->subscription()->cancelNow();
```

Para impedir que uma assinatura em seu período de carência seja cancelada, você pode invocar o método `stopCancelation`:

```php
$user->subscription()->stopCancelation();
```

> **Aviso:**
> As assinaturas do Paddle não podem ser retomadas após o cancelamento. Se seu cliente desejar retomar sua assinatura, ele terá que criar uma nova assinatura.

<a id="subscription-trials"></a>
## Períodos de Teste de Assinatura

<a id="with-payment-method-up-front"></a>
### Com Método de Pagamento Antecipado

Se você gostaria de oferecer períodos de teste aos seus clientes enquanto ainda coleta as informações do método de pagamento antecipadamente, você deve definir um tempo de teste no dashboard do Paddle no preço ao qual seu cliente está se inscrevendo. Então, inicie a sessão de checkout normalmente:

```php
use Illuminate\Http\Request;

Route::get('/user/subscribe', function (Request $request) {
    $checkout = $request->user()
        ->subscribe('pri_monthly')
        ->returnTo(route('home'));

    return view('billing', ['checkout' => $checkout]);
});
```

Quando sua aplicação recebe o evento `subscription_created`, o Cashier definirá a data de término do período de teste no registro da assinatura dentro do banco de dados da sua aplicação, bem como instruirá o Paddle a não começar a cobrar o cliente até depois dessa data.

> **Aviso:**
> Se a assinatura do cliente não for cancelada antes da data de término do período de teste, ele será cobrado assim que o período de teste expirar, então você deve ter certeza de notificar seus usuários sobre a data de término do período de teste.

Você pode determinar se o usuário está dentro do seu período de teste usando o método `onTrial` da instância do usuário:

```php
if ($user->onTrial()) {
    // ...
}
```

Para determinar se um período de teste existente expirou, você pode usar os métodos `hasExpiredTrial`:

```php
if ($user->hasExpiredTrial()) {
    // ...
}
```

Para determinar se um usuário está em período de teste para um tipo de assinatura específico, você pode fornecer o tipo aos métodos `onTrial` ou `hasExpiredTrial`:

```php
if ($user->onTrial('default')) {
    // ...
}

if ($user->hasExpiredTrial('default')) {
    // ...
}
```

<a id="without-payment-method-up-front"></a>
### Sem Método de Pagamento Antecipado

Se você gostaria de oferecer períodos de teste sem coletar as informações do método de pagamento do usuário antecipadamente, você pode definir a coluna `trial_ends_at` no registro do cliente anexado ao seu usuário com a data de término do período de teste desejada. Isso é normalmente feito durante o registro do usuário:

```php
use App\Models\User;

$user = User::create([
    // ...
]);

$user->createAsCustomer([
    'trial_ends_at' => now()->plus(days: 10)
]);
```

O Cashier se refere a esse tipo de período de teste como um "período de teste genérico", já que ele não está anexado a nenhuma assinatura existente. O método `onTrial` na instância `User` retornará `true` se a data atual não ultrapassou o valor de `trial_ends_at`:

```php
if ($user->onTrial()) {
    // User is within their trial period...
}
```

Uma vez que você esteja pronto para criar uma assinatura real para o usuário, você pode usar o método `subscribe` normalmente:

```php
use Illuminate\Http\Request;

Route::get('/user/subscribe', function (Request $request) {
    $checkout = $request->user()
        ->subscribe('pri_monthly')
        ->returnTo(route('home'));

    return view('billing', ['checkout' => $checkout]);
});
```

Para recuperar a data de término do período de teste do usuário, você pode usar o método `trialEndsAt`. Este método retornará uma instância de data Carbon se um usuário estiver em um período de teste ou `null` se ele não estiver. Você também pode passar um parâmetro opcional de tipo de assinatura se você gostaria de obter a data de término do período de teste para uma assinatura específica diferente da padrão:

```php
if ($user->onTrial('default')) {
    $trialEndsAt = $user->trialEndsAt();
}
```

Você pode usar o método `onGenericTrial` se você deseja saber especificamente que o usuário está dentro do seu período de teste "genérico" e ainda não criou uma assinatura real:

```php
if ($user->onGenericTrial()) {
    // User is within their "generic" trial period...
}
```

<a id="extend-or-activate-a-trial"></a>
### Estender ou Ativar um Período de Teste

Você pode estender um período de teste existente em uma assinatura invocando o método `extendTrial` e especificando o momento no tempo em que o período de teste deve terminar:

```php
$user->subscription()->extendTrial(now()->plus(days: 5));
```

Ou, você pode ativar imediatamente uma assinatura encerrando seu período de teste chamando o método `activate` na assinatura:

```php
$user->subscription()->activate();
```

<a id="handling-paddle-webhooks"></a>
## Tratando Webhooks do Paddle

O Paddle pode notificar sua aplicação sobre uma variedade de eventos via webhooks. Por padrão, uma rota que aponta para o controller de webhook do Cashier é registrada pelo service provider do Cashier. Este controller tratará todas as requisições de webhook recebidas.

Por padrão, este controller tratará automaticamente o cancelamento de assinaturas que têm muitas cobranças falhas, atualizações de assinatura e mudanças de método de pagamento; no entanto, como logo descobriremos, você pode estender este controller para tratar qualquer evento de webhook do Paddle que você queira.

Para garantir que sua aplicação possa tratar webhooks do Paddle, certifique-se de [configurar a URL de webhook no painel de controle do Paddle](https://vendors.paddle.com/notifications-v2). Por padrão, o controller de webhook do Cashier responde ao caminho de URL `/paddle/webhook`. A lista completa de todos os webhooks que você deve habilitar no painel de controle do Paddle é:

- Customer Updated
- Transaction Completed
- Transaction Updated
- Subscription Created
- Subscription Updated
- Subscription Paused
- Subscription Canceled

> **Aviso:**
> Certifique-se de proteger as requisições recebidas com o middleware de [verificação de assinatura de webhook](/pt-br/cashier-paddle/#verifying-webhook-signatures) incluído no Cashier.

<a id="webhooks-csrf-protection"></a>
#### Webhooks e Proteção CSRF

Como os webhooks do Paddle precisam contornar a [proteção CSRF](/pt-br/csrf/) do Laravel, você deve garantir que o Laravel não tente verificar o token CSRF para webhooks recebidos do Paddle. Para realizar isso, você deve excluir `paddle/*` da proteção CSRF no arquivo `bootstrap/app.php` da sua aplicação:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->preventRequestForgery(except: [
        'paddle/*',
    ]);
})
```

<a id="webhooks-local-development"></a>
#### Webhooks e Desenvolvimento Local

Para que o Paddle seja capaz de enviar webhooks à sua aplicação durante o desenvolvimento local, você precisará expor sua aplicação via um serviço de compartilhamento de site como o [Ngrok](https://ngrok.com/) ou o [Expose](https://expose.dev/docs/introduction). Se você está desenvolvendo sua aplicação localmente usando o [Laravel Sail](/pt-br/sail/), você pode usar o [comando de compartilhamento de site](/pt-br/sail/#sharing-your-site) do Sail.

<a id="defining-webhook-event-handlers"></a>
### Definindo Handlers de Eventos de Webhook

O Cashier trata automaticamente o cancelamento de assinatura em cobranças falhas e outros webhooks comuns do Paddle. No entanto, se você tiver eventos de webhook adicionais que gostaria de tratar, você pode fazê-lo escutando os seguintes eventos que são despachados pelo Cashier:

- `Laravel\Paddle\Events\WebhookReceived`
- `Laravel\Paddle\Events\WebhookHandled`

Ambos os eventos contêm o payload completo do webhook do Paddle. Por exemplo, se você deseja tratar o webhook `transaction.billed`, você pode registrar um [listener](/pt-br/events/#defining-listeners) que tratará o evento:

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

O Cashier também emite eventos dedicados ao tipo do webhook recebido. Além do payload completo do Paddle, eles também contêm os models relevantes que foram usados para processar o webhook, como o model faturável, a assinatura ou o recibo:

<div class="content-list" markdown="1">

- `Laravel\Paddle\Events\CustomerUpdated`
- `Laravel\Paddle\Events\TransactionCompleted`
- `Laravel\Paddle\Events\TransactionUpdated`
- `Laravel\Paddle\Events\SubscriptionCreated`
- `Laravel\Paddle\Events\SubscriptionUpdated`
- `Laravel\Paddle\Events\SubscriptionPaused`
- `Laravel\Paddle\Events\SubscriptionCanceled`

</div>

Você também pode sobrescrever a rota de webhook integrada padrão definindo a variável de ambiente `CASHIER_WEBHOOK` no arquivo `.env` da sua aplicação. Esse valor deve ser a URL completa para sua rota de webhook e precisa corresponder à URL definida no seu painel de controle do Paddle:

```ini
CASHIER_WEBHOOK=https://example.com/my-paddle-webhook-url
```

<a id="verifying-webhook-signatures"></a>
### Verificando Assinaturas de Webhook

Para proteger seus webhooks, você pode usar as [assinaturas de webhook do Paddle](https://developer.paddle.com/webhooks/signature-verification). Por conveniência, o Cashier inclui automaticamente um middleware que valida que a requisição de webhook do Paddle recebida é válida.

Para habilitar a verificação de webhook, certifique-se de que a variável de ambiente `PADDLE_WEBHOOK_SECRET` esteja definida no arquivo `.env` da sua aplicação. O segredo do webhook pode ser recuperado do dashboard da sua conta Paddle.

<a id="single-charges"></a>
## Cobranças Únicas

<a id="charging-for-products"></a>
### Cobrando por Produtos

Se você gostaria de iniciar uma compra de produto para um cliente, você pode usar o método `checkout` em uma instância de model faturável para gerar uma sessão de checkout para a compra. O método `checkout` aceita um ou múltiplos IDs de preço. Se necessário, um array associativo pode ser usado para fornecer a quantidade do produto que está sendo comprado:

```php
use Illuminate\Http\Request;

Route::get('/buy', function (Request $request) {
    $checkout = $request->user()->checkout(['pri_tshirt', 'pri_socks' => 5]);

    return view('buy', ['checkout' => $checkout]);
});
```

Após gerar a sessão de checkout, você pode usar o [componente Blade](#overlay-checkout) `paddle-button` fornecido pelo Cashier para permitir que o usuário visualize o widget de checkout do Paddle e complete a compra:

```blade
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Buy
</x-paddle-button>
```

Uma sessão de checkout tem um método `customData`, permitindo que você passe quaisquer dados personalizados que você deseje à criação da transação subjacente. Por favor, consulte [a documentação do Paddle](https://developer.paddle.com/build/transactions/custom-data) para aprender mais sobre as opções disponíveis para você ao passar dados personalizados:

```php
$checkout = $user->checkout('pri_tshirt')
    ->customData([
        'custom_option' => $value,
    ]);
```

<a id="refunding-transactions"></a>
### Reembolsando Transações

Reembolsar transações retornará o valor reembolsado ao método de pagamento do seu cliente que foi usado no momento da compra. Se você precisar reembolsar uma compra do Paddle, você pode usar o método `refund` em um model `Cashier\Paddle\Transaction`. Este método aceita um motivo como o primeiro argumento, um ou mais IDs de preço para reembolsar com valores opcionais como um array associativo. Você pode recuperar as transações de um determinado model faturável usando o método `transactions`.

Por exemplo, imagine que queremos reembolsar uma transação específica para os preços `pri_123` e `pri_456`. Queremos reembolsar totalmente `pri_123`, mas reembolsar apenas dois dólares de `pri_456`:

```php
use App\Models\User;

$user = User::find(1);

$transaction = $user->transactions()->first();

$response = $transaction->refund('Accidental charge', [
    'pri_123', // Fully refund this price...
    'pri_456' => 200, // Only partially refund this price...
]);
```

O exemplo acima reembolsa itens de linha específicos em uma transação. Se você quer reembolsar a transação inteira, simplesmente forneça um motivo:

```php
$response = $transaction->refund('Accidental charge');
```

Para mais informações sobre reembolsos, por favor consulte a [documentação de reembolsos do Paddle](https://developer.paddle.com/build/transactions/create-transaction-adjustments).

> **Aviso:**
> Reembolsos devem sempre ser aprovados pelo Paddle antes de serem totalmente processados.

<a id="crediting-transactions"></a>
### Creditando Transações

Assim como ao reembolsar, você também pode creditar transações. Creditar transações adicionará os fundos ao saldo do cliente para que possa ser usado em compras futuras. Creditar transações só pode ser feito para transações coletadas manualmente e não para transações coletadas automaticamente (como assinaturas), já que o Paddle trata os créditos de assinatura automaticamente:

```php
$transaction = $user->transactions()->first();

// Credit a specific line item fully...
$response = $transaction->credit('Compensation', 'pri_123');
```

Para mais informações, [veja a documentação do Paddle sobre creditar](https://developer.paddle.com/build/transactions/create-transaction-adjustments).

> **Aviso:**
> Créditos só podem ser aplicados para transações coletadas manualmente. Transações coletadas automaticamente são creditadas pelo próprio Paddle.

<a id="transactions"></a>
## Transações

Você pode facilmente recuperar um array das transações de um model faturável via a propriedade `transactions`:

```php
use App\Models\User;

$user = User::find(1);

$transactions = $user->transactions;
```

As transações representam pagamentos pelos seus produtos e compras e são acompanhadas por faturas. Apenas transações concluídas são armazenadas no banco de dados da sua aplicação.

Ao listar as transações de um cliente, você pode usar os métodos da instância de transação para exibir as informações de pagamento relevantes. Por exemplo, você pode desejar listar cada transação em uma tabela, permitindo que o usuário baixe facilmente qualquer uma das faturas:

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

A rota `download-invoice` pode parecer com o seguinte:

```php
use Illuminate\Http\Request;
use Laravel\Paddle\Transaction;

Route::get('/download-invoice/{transaction}', function (Request $request, Transaction $transaction) {
    return $transaction->redirectToInvoicePdf();
})->name('download-invoice');
```

<a id="past-and-upcoming-payments"></a>
### Pagamentos Passados e Futuros

Você pode usar os métodos `lastPayment` e `nextPayment` para recuperar e exibir os pagamentos passados ou futuros de um cliente para assinaturas recorrentes:

```php
use App\Models\User;

$user = User::find(1);

$subscription = $user->subscription();

$lastPayment = $subscription->lastPayment();
$nextPayment = $subscription->nextPayment();
```

Ambos os métodos retornarão uma instância de `Laravel\Paddle\Payment`; no entanto, `lastPayment` retornará `null` quando as transações ainda não tiverem sido sincronizadas pelos webhooks, enquanto `nextPayment` retornará `null` quando o ciclo de cobrança tiver terminado (como quando uma assinatura tiver sido cancelada):

```blade
Next payment: {{ $nextPayment->amount() }} due on {{ $nextPayment->date()->format('d/m/Y') }}
```

<a id="testing"></a>
## Testes

Durante os testes, você deve testar manualmente seu fluxo de cobrança para garantir que sua integração funciona como esperado.

Para testes automatizados, incluindo aqueles executados dentro de um ambiente de CI, você pode usar o [Cliente HTTP do Laravel](/pt-br/http-client/#testing) para fingir chamadas HTTP feitas ao Paddle. Embora isso não teste as respostas reais do Paddle, ele fornece uma maneira de testar sua aplicação sem realmente chamar a API do Paddle.
