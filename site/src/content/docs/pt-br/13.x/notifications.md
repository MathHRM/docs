---
title: "Notifications"
---

- [Introdução](#introduction)
- [Gerando Notificações](#generating-notifications)
- [Enviando Notificações](#sending-notifications)
    - [Usando o Trait Notifiable](#using-the-notifiable-trait)
    - [Usando a Facade Notification](#using-the-notification-facade)
    - [Especificando Canais de Entrega](#specifying-delivery-channels)
    - [Enfileirando Notificações](#queueing-notifications)
    - [Notificações Sob Demanda](#on-demand-notifications)
- [Notificações por E-mail](#mail-notifications)
    - [Formatando Mensagens de E-mail](#formatting-mail-messages)
    - [Personalizando o Remetente](#customizing-the-sender)
    - [Personalizando o Destinatário](#customizing-the-recipient)
    - [Personalizando o Assunto](#customizing-the-subject)
    - [Personalizando o Mailer](#customizing-the-mailer)
    - [Personalizando os Templates](#customizing-the-templates)
    - [Anexos](#mail-attachments)
    - [Adicionando Tags e Metadados](#adding-tags-metadata)
    - [Personalizando a Mensagem do Symfony](#customizing-the-symfony-message)
    - [Usando Mailables](#using-mailables)
    - [Visualizando Notificações por E-mail](#previewing-mail-notifications)
- [Notificações por E-mail em Markdown](#markdown-mail-notifications)
    - [Gerando a Mensagem](#generating-the-message)
    - [Escrevendo a Mensagem](#writing-the-message)
    - [Personalizando os Componentes](#customizing-the-components)
- [Notificações no Banco de Dados](#database-notifications)
    - [Pré-requisitos](#database-prerequisites)
    - [Formatando Notificações no Banco de Dados](#formatting-database-notifications)
    - [Acessando as Notificações](#accessing-the-notifications)
    - [Marcando Notificações como Lidas](#marking-notifications-as-read)
- [Notificações por Broadcast](#broadcast-notifications)
    - [Pré-requisitos](#broadcast-prerequisites)
    - [Formatando Notificações por Broadcast](#formatting-broadcast-notifications)
    - [Ouvindo Notificações](#listening-for-notifications)
- [Notificações por SMS](#sms-notifications)
    - [Pré-requisitos](#sms-prerequisites)
    - [Formatando Notificações por SMS](#formatting-sms-notifications)
    - [Personalizando o Número "From"](#customizing-the-from-number)
    - [Adicionando uma Referência de Cliente](#adding-a-client-reference)
    - [Roteando Notificações por SMS](#routing-sms-notifications)
- [Notificações no Slack](#slack-notifications)
    - [Pré-requisitos](#slack-prerequisites)
    - [Formatando Notificações no Slack](#formatting-slack-notifications)
    - [Interatividade do Slack](#slack-interactivity)
    - [Roteando Notificações no Slack](#routing-slack-notifications)
    - [Notificando Workspaces Externos do Slack](#notifying-external-slack-workspaces)
- [Localizando Notificações](#localizing-notifications)
- [Testes](#testing)
- [Eventos de Notificação](#notification-events)
- [Canais Personalizados](#custom-channels)

<a id="introduction"></a>
## Introdução

Além do suporte para [envio de e-mail](/en/mail/), o Laravel oferece suporte para o envio de notificações por meio de uma variedade de canais de entrega, incluindo e-mail, SMS (via [Vonage](https://www.vonage.com/communications-apis/), anteriormente conhecido como Nexmo) e [Slack](https://slack.com). Além disso, uma variedade de [canais de notificação criados pela comunidade](https://laravel-notification-channels.com/about/#suggesting-a-new-channel) foram criados para enviar notificações por meio de dezenas de canais diferentes! As notificações também podem ser armazenadas em um banco de dados para que possam ser exibidas na sua interface web.

Normalmente, as notificações devem ser mensagens curtas e informativas que notificam os usuários sobre algo que ocorreu na sua aplicação. Por exemplo, se você estiver escrevendo uma aplicação de cobrança, pode enviar uma notificação "Fatura Paga" aos seus usuários por meio dos canais de e-mail e SMS.

<a id="generating-notifications"></a>
## Gerando Notificações

No Laravel, cada notificação é representada por uma única classe que normalmente é armazenada no diretório `app/Notifications`. Não se preocupe se você não vir esse diretório na sua aplicação - ele será criado para você quando você executar o comando Artisan `make:notification`:

```shell
php artisan make:notification InvoicePaid
```

Este comando colocará uma nova classe de notificação no seu diretório `app/Notifications`. Cada classe de notificação contém um método `via` e um número variável de métodos de construção de mensagens, como `toMail` ou `toDatabase`, que convertem a notificação em uma mensagem adequada para aquele canal específico.

<a id="sending-notifications"></a>
## Enviando Notificações

<a id="using-the-notifiable-trait"></a>
### Usando o Trait Notifiable

As notificações podem ser enviadas de duas maneiras: usando o método `notify` do trait `Notifiable` ou usando a [facade](/en/facades/) `Notification`. O trait `Notifiable` está incluído no modelo `App\Models\User` da sua aplicação por padrão:

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;
}
```

O método `notify` fornecido por este trait espera receber uma instância de notificação:

```php
use App\Notifications\InvoicePaid;

$user->notify(new InvoicePaid($invoice));
```

> **Note:**
> Lembre-se de que você pode usar o trait `Notifiable` em qualquer um dos seus modelos. Você não está limitado a incluí-lo apenas no seu modelo `User`.

<a id="using-the-notification-facade"></a>
### Usando a Facade Notification

Como alternativa, você pode enviar notificações por meio da [facade](/en/facades/) `Notification`. Esta abordagem é útil quando você precisa enviar uma notificação para várias entidades notificáveis, como uma collection de usuários. Para enviar notificações usando a facade, passe todas as entidades notificáveis e a instância de notificação para o método `send`:

```php
use Illuminate\Support\Facades\Notification;

Notification::send($users, new InvoicePaid($invoice));
```

Você também pode enviar notificações imediatamente usando o método `sendNow`. Este método enviará a notificação imediatamente, mesmo que a notificação implemente a interface `ShouldQueue`:

```php
Notification::sendNow($developers, new DeploymentCompleted($deployment));
```

<a id="specifying-delivery-channels"></a>
### Especificando Canais de Entrega

Cada classe de notificação possui um método `via` que determina em quais canais a notificação será entregue. As notificações podem ser enviadas pelos canais `mail`, `database`, `broadcast`, `vonage` e `slack`.

> **Note:**
> Se você quiser usar outros canais de entrega, como Telegram ou Pusher, confira o [site Laravel Notification Channels](http://laravel-notification-channels.com), mantido pela comunidade.

O método `via` recebe uma instância `$notifiable`, que será uma instância da classe para a qual a notificação está sendo enviada. Você pode usar `$notifiable` para determinar em quais canais a notificação deve ser entregue:

```php
/**
 * Get the notification's delivery channels.
 *
 * @return array<int, string>
 */
public function via(object $notifiable): array
{
    return $notifiable->prefers_sms ? ['vonage'] : ['mail', 'database'];
}
```

<a id="queueing-notifications"></a>
### Enfileirando Notificações

> **Warning:**
> Antes de enfileirar notificações, você deve configurar sua fila e [iniciar um worker](/en/queues/#running-the-queue-worker).

Enviar notificações pode levar tempo, especialmente se o canal precisar fazer uma chamada de API externa para entregar a notificação. Para acelerar o tempo de resposta da sua aplicação, permita que sua notificação seja enfileirada adicionando a interface `ShouldQueue` e o trait `Queueable` à sua classe. A interface e o trait já são importados para todas as notificações geradas usando o comando `make:notification`, então você pode adicioná-los imediatamente à sua classe de notificação:

```php
<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class InvoicePaid extends Notification implements ShouldQueue
{
    use Queueable;

    // ...
}
```

Uma vez que a interface `ShouldQueue` tenha sido adicionada à sua notificação, você pode enviar a notificação normalmente. O Laravel detectará a interface `ShouldQueue` na classe e enfileirará automaticamente a entrega da notificação:

```php
$user->notify(new InvoicePaid($invoice));
```

Ao enfileirar notificações, um job enfileirado será criado para cada combinação de destinatário e canal. Por exemplo, seis jobs serão despachados para a fila se sua notificação tiver três destinatários e dois canais.

<a id="delaying-notifications"></a>
#### Atrasando Notificações

Se você quiser atrasar a entrega da notificação, pode encadear o método `delay` na instanciação da sua notificação:

```php
$delay = now()->plus(minutes: 10);

$user->notify((new InvoicePaid($invoice))->delay($delay));
```

Você pode passar um array para o método `delay` para especificar o tempo de atraso para canais específicos:

```php
$user->notify((new InvoicePaid($invoice))->delay([
    'mail' => now()->plus(minutes: 5),
    'sms' => now()->plus(minutes: 10),
]));
```

Como alternativa, você pode definir um método `withDelay` na própria classe de notificação. O método `withDelay` deve retornar um array de nomes de canais e valores de atraso:

```php
/**
 * Determine the notification's delivery delay.
 *
 * @return array<string, \Illuminate\Support\Carbon>
 */
public function withDelay(object $notifiable): array
{
    return [
        'mail' => now()->plus(minutes: 5),
        'sms' => now()->plus(minutes: 10),
    ];
}
```

<a id="customizing-the-notification-queue-connection"></a>
#### Personalizando a Conexão da Fila de Notificação

Por padrão, as notificações enfileiradas serão enfileiradas usando a conexão de fila padrão da sua aplicação. Se você quiser especificar uma conexão diferente que deve ser usada para uma notificação específica, pode chamar o método `onConnection` a partir do construtor da sua notificação:

```php
<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class InvoicePaid extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct()
    {
        $this->onConnection('redis');
    }
}
```

Ou, se você quiser especificar uma conexão de fila específica que deve ser usada para cada canal de notificação suportado pela notificação, pode definir um método `viaConnections` na sua notificação. Este método deve retornar um array de pares nome do canal / nome da conexão de fila:

```php
/**
 * Determine which connections should be used for each notification channel.
 *
 * @return array<string, string>
 */
public function viaConnections(): array
{
    return [
        'mail' => 'redis',
        'database' => 'sync',
    ];
}
```

<a id="customizing-notification-channel-queues"></a>
#### Personalizando as Filas dos Canais de Notificação

Se você quiser especificar uma fila específica que deve ser usada para cada canal de notificação suportado pela notificação, pode definir um método `viaQueues` na sua notificação. Este método deve retornar um array de pares nome do canal / nome da fila:

```php
/**
 * Determine which queues should be used for each notification channel.
 *
 * @return array<string, string>
 */
public function viaQueues(): array
{
    return [
        'mail' => 'mail-queue',
        'slack' => 'slack-queue',
    ];
}
```

<a id="customizing-queued-notification-job-properties"></a>
#### Personalizando os Atributos do Job da Notificação Enfileirada

Você pode personalizar o comportamento do job enfileirado subjacente definindo atributos de fila na sua classe de notificação. Esses atributos serão herdados pelo job enfileirado que envia a notificação:

```php
<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Queue\Attributes\FailOnTimeout;
use Illuminate\Queue\Attributes\MaxExceptions;
use Illuminate\Queue\Attributes\Timeout;
use Illuminate\Queue\Attributes\Tries;

#[Tries(5)]
#[Timeout(120)]
#[MaxExceptions(3)]
#[FailOnTimeout]
class InvoicePaid extends Notification implements ShouldQueue
{
    use Queueable;

    // ...
}
```

Se você quiser garantir a privacidade e a integridade dos dados de uma notificação enfileirada via [criptografia](/en/encryption/), adicione a interface `ShouldBeEncrypted` à sua classe de notificação:

```php
<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeEncrypted;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class InvoicePaid extends Notification implements ShouldQueue, ShouldBeEncrypted
{
    use Queueable;

    // ...
}
```

Além de definir esses atributos diretamente na sua classe de notificação, você também pode definir os métodos `backoff` e `retryUntil` para especificar a estratégia de backoff e o timeout de repetição para o job da notificação enfileirada:

```php
use DateTime;

/**
 * Calculate the number of seconds to wait before retrying the notification.
 */
public function backoff(): int
{
    return 3;
}

/**
 * Determine the time at which the notification should timeout.
 */
public function retryUntil(): DateTime
{
    return now()->plus(minutes: 5);
}
```

> **Note:**
> Para mais informações sobre esses atributos e métodos de job, revise a documentação sobre [jobs enfileirados](/en/queues/#max-job-attempts-and-timeout).

<a id="queued-notification-middleware"></a>
#### Middleware de Notificação Enfileirada

As notificações enfileiradas podem definir middleware [assim como os jobs enfileirados](/en/queues/#job-middleware). Para começar, defina um método `middleware` na sua classe de notificação. O método `middleware` receberá as variáveis `$notifiable` e `$channel`, que permitem personalizar o middleware retornado com base no destino da notificação:

```php
use Illuminate\Queue\Middleware\RateLimited;

/**
 * Get the middleware the notification job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(object $notifiable, string $channel)
{
    return match ($channel) {
        'mail' => [new RateLimited('postmark')],
        'slack' => [new RateLimited('slack')],
        default => [],
    };
}
```

<a id="queued-notifications-and-database-transactions"></a>
#### Notificações Enfileiradas e Transações de Banco de Dados

Quando as notificações enfileiradas são despachadas dentro de transações de banco de dados, elas podem ser processadas pela fila antes que a transação de banco de dados tenha sido commitada. Quando isso acontece, quaisquer atualizações que você tenha feito em modelos ou registros de banco de dados durante a transação de banco de dados podem ainda não estar refletidas no banco de dados. Além disso, quaisquer modelos ou registros de banco de dados criados dentro da transação podem não existir no banco de dados. Se sua notificação depender desses modelos, erros inesperados podem ocorrer quando o job que envia a notificação enfileirada for processado.

Se a opção de configuração `after_commit` da sua conexão de fila estiver definida como `false`, você ainda pode indicar que uma notificação enfileirada específica deve ser despachada depois que todas as transações de banco de dados abertas tiverem sido commitadas, chamando o método `afterCommit` ao enviar a notificação:

```php
use App\Notifications\InvoicePaid;

$user->notify((new InvoicePaid($invoice))->afterCommit());
```

Como alternativa, você pode chamar o método `afterCommit` a partir do construtor da sua notificação:

```php
<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class InvoicePaid extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct()
    {
        $this->afterCommit();
    }
}
```

> **Note:**
> Para saber mais sobre como contornar esses problemas, revise a documentação sobre [jobs enfileirados e transações de banco de dados](/en/queues/#jobs-and-database-transactions).

<a id="determining-if-the-queued-notification-should-be-sent"></a>
#### Determinando se uma Notificação Enfileirada Deve Ser Enviada

Depois que uma notificação enfileirada tiver sido despachada para a fila para processamento em segundo plano, ela normalmente será aceita por um worker de fila e enviada ao destinatário pretendido.

No entanto, se você quiser tomar a decisão final sobre se a notificação enfileirada deve ser enviada após ser processada por um worker de fila, pode definir um método `shouldSend` na classe de notificação. Se este método retornar `false`, a notificação não será enviada:

```php
/**
 * Determine if the notification should be sent.
 */
public function shouldSend(object $notifiable, string $channel): bool
{
    return $this->invoice->isPaid();
}
```

<a id="after-sending-notifications"></a>
#### Após o Envio de Notificações

Se você quiser executar código depois que uma notificação for enviada, pode definir um método `afterSending` na classe de notificação. Este método receberá a entidade notificável, o nome do canal e a resposta do canal:

```php
/**
 * Handle the notification after it has been sent.
 */
public function afterSending(object $notifiable, string $channel, mixed $response): void
{
    // ...
}
```

<a id="on-demand-notifications"></a>
### Notificações Sob Demanda

Às vezes, você pode precisar enviar uma notificação para alguém que não está armazenado como um "usuário" da sua aplicação. Usando o método `route` da facade `Notification`, você pode especificar informações de roteamento de notificação ad-hoc antes de enviar a notificação:

```php
use Illuminate\Broadcasting\Channel;
use Illuminate\Support\Facades\Notification;

Notification::route('mail', 'taylor@example.com')
    ->route('vonage', '5555555555')
    ->route('slack', '#slack-channel')
    ->route('broadcast', [new Channel('channel-name')])
    ->notify(new InvoicePaid($invoice));
```

Se você quiser fornecer o nome do destinatário ao enviar uma notificação sob demanda para a rota `mail`, pode fornecer um array que contém o endereço de e-mail como chave e o nome como valor do primeiro elemento do array:

```php
Notification::route('mail', [
    'barrett@example.com' => 'Barrett Blair',
])->notify(new InvoicePaid($invoice));
```

Usando o método `routes`, você pode fornecer informações de roteamento ad-hoc para vários canais de notificação de uma só vez:

```php
Notification::routes([
    'mail' => ['barrett@example.com' => 'Barrett Blair'],
    'vonage' => '5555555555',
])->notify(new InvoicePaid($invoice));
```

<a id="mail-notifications"></a>
## Notificações por E-mail

<a id="formatting-mail-messages"></a>
### Formatando Mensagens de E-mail

Se uma notificação oferecer suporte para ser enviada como um e-mail, você deve definir um método `toMail` na classe de notificação. Este método receberá uma entidade `$notifiable` e deve retornar uma instância de `Illuminate\Notifications\Messages\MailMessage`.

A classe `MailMessage` contém alguns métodos simples para ajudá-lo a construir mensagens de e-mail transacionais. As mensagens de e-mail podem conter linhas de texto, bem como uma "call to action". Vamos dar uma olhada em um exemplo de método `toMail`:

```php
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    $url = url('/invoice/'.$this->invoice->id);

    return (new MailMessage)
        ->greeting('Hello!')
        ->line('One of your invoices has been paid!')
        ->lineIf($this->amount > 0, "Amount paid: {$this->amount}")
        ->action('View Invoice', $url)
        ->line('Thank you for using our application!');
}
```

> **Note:**
> Observe que estamos usando `$this->invoice->id` no nosso método `toMail`. Você pode passar quaisquer dados que sua notificação precise para gerar sua mensagem para o construtor da notificação.

Neste exemplo, registramos uma saudação, uma linha de texto, uma call to action e, em seguida, outra linha de texto. Esses métodos fornecidos pelo objeto `MailMessage` tornam simples e rápido formatar pequenos e-mails transacionais. O canal de e-mail então traduzirá os componentes da mensagem em um belo e responsivo template de e-mail HTML, com uma versão em texto puro. Aqui está um exemplo de um e-mail gerado pelo canal `mail`:

<img src="https://laravel.com/img/docs/notification-example-2.png">

> **Note:**
> Ao enviar notificações por e-mail, certifique-se de definir a opção de configuração `name` no seu arquivo de configuração `config/app.php`. Este valor será usado no cabeçalho e no rodapé das suas mensagens de notificação por e-mail.

<a id="error-messages"></a>
#### Mensagens de Erro

Algumas notificações informam os usuários sobre erros, como uma falha no pagamento de uma fatura. Você pode indicar que uma mensagem de e-mail é referente a um erro chamando o método `error` ao construir sua mensagem. Ao usar o método `error` em uma mensagem de e-mail, o botão de call to action ficará vermelho em vez de preto:

```php
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->error()
        ->subject('Invoice Payment Failed')
        ->line('...');
}
```

<a id="other-mail-notification-formatting-options"></a>
#### Outras Opções de Formatação de Notificação por E-mail

Em vez de definir as "linhas" de texto na classe de notificação, você pode usar o método `view` para especificar um template personalizado que deve ser usado para renderizar o e-mail da notificação:

```php
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)->view(
        'mail.invoice.paid', ['invoice' => $this->invoice]
    );
}
```

Você pode especificar uma view em texto puro para a mensagem de e-mail passando o nome da view como o segundo elemento de um array que é fornecido ao método `view`:

```php
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)->view(
        ['mail.invoice.paid', 'mail.invoice.paid-text'],
        ['invoice' => $this->invoice]
    );
}
```

Ou, se sua mensagem tiver apenas uma view em texto puro, você pode utilizar o método `text`:

```php
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)->text(
        'mail.invoice.paid-text', ['invoice' => $this->invoice]
    );
}
```

<a id="customizing-the-sender"></a>
### Personalizando o Remetente

Por padrão, o remetente / endereço "from" do e-mail é definido no arquivo de configuração `config/mail.php`. No entanto, você pode especificar o endereço "from" para uma notificação específica usando o método `from`:

```php
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->from('barrett@example.com', 'Barrett Blair')
        ->line('...');
}
```

<a id="customizing-the-recipient"></a>
### Personalizando o Destinatário

Ao enviar notificações pelo canal `mail`, o sistema de notificação procurará automaticamente por uma propriedade `email` na sua entidade notificável. Você pode personalizar qual endereço de e-mail é usado para entregar a notificação definindo um método `routeNotificationForMail` na entidade notificável:

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Notifications\Notification;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * Route notifications for the mail channel.
     *
     * @return  array<string, string>|string
     */
    public function routeNotificationForMail(Notification $notification): array|string
    {
        // Return email address only...
        return $this->email_address;

        // Return email address and name...
        return [$this->email_address => $this->name];
    }
}
```

<a id="customizing-the-subject"></a>
### Personalizando o Assunto

Por padrão, o assunto do e-mail é o nome da classe da notificação formatado em "Title Case". Portanto, se a sua classe de notificação se chamar `InvoicePaid`, o assunto do e-mail será `Invoice Paid`. Se você quiser especificar um assunto diferente para a mensagem, pode chamar o método `subject` ao construir sua mensagem:

```php
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->subject('Notification Subject')
        ->line('...');
}
```

<a id="customizing-the-mailer"></a>
### Personalizando o Mailer

Por padrão, a notificação por e-mail será enviada usando o mailer padrão definido no arquivo de configuração `config/mail.php`. No entanto, você pode especificar um mailer diferente em tempo de execução chamando o método `mailer` ao construir sua mensagem:

```php
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->mailer('postmark')
        ->line('...');
}
```

<a id="customizing-the-templates"></a>
### Personalizando os Templates

Você pode modificar o template HTML e em texto puro usado pelas notificações por e-mail publicando os recursos do pacote de notificações. Após executar este comando, os templates de notificação por e-mail estarão localizados no diretório `resources/views/vendor/notifications`:

```shell
php artisan vendor:publish --tag=laravel-notifications
```

<a id="mail-attachments"></a>
### Anexos

Para adicionar anexos a uma notificação por e-mail, use o método `attach` ao construir sua mensagem. O método `attach` aceita o caminho absoluto para o arquivo como seu primeiro argumento:

```php
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->greeting('Hello!')
        ->attach('/path/to/file');
}
```

> **Note:**
> O método `attach` oferecido pelas mensagens de e-mail de notificação também aceita [objetos anexáveis](/en/mail/#attachable-objects). Consulte a [documentação abrangente sobre objetos anexáveis](/en/mail/#attachable-objects) para saber mais.

Ao anexar arquivos a uma mensagem, você também pode especificar o nome de exibição e/ou o tipo MIME passando um `array` como segundo argumento para o método `attach`:

```php
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->greeting('Hello!')
        ->attach('/path/to/file', [
            'as' => 'name.pdf',
            'mime' => 'application/pdf',
        ]);
}
```

Quando necessário, vários arquivos podem ser anexados a uma mensagem usando o método `attachMany`:

```php
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->greeting('Hello!')
        ->attachMany([
            '/path/to/forge.svg',
            '/path/to/vapor.svg' => [
                'as' => 'Logo.svg',
                'mime' => 'image/svg+xml',
            ],
        ]);
}
```

Você pode usar o método `attachFromStorageDisk` para anexar um arquivo que existe em um [disco de filesystem](/en/filesystem/) específico. Este método aceita o nome do disco e o caminho para o arquivo nesse disco:

```php
use App\Mail\InvoicePaid as InvoicePaidMailable;

/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): Mailable
{
    return (new InvoicePaidMailable($this->invoice))
        ->to($notifiable->email)
        ->attachFromStorageDisk('s3', '/path/to/file', 'invoice.pdf', [
            'mime' => 'application/pdf',
        ]);
}
```

<a id="raw-data-attachments"></a>
#### Anexos de Dados Brutos

O método `attachData` pode ser usado para anexar uma string bruta de bytes como um anexo. Ao chamar o método `attachData`, você deve fornecer o nome de arquivo que deve ser atribuído ao anexo:

```php
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->greeting('Hello!')
        ->attachData($this->pdf, 'name.pdf', [
            'mime' => 'application/pdf',
        ]);
}
```

<a id="adding-tags-metadata"></a>
### Adicionando Tags e Metadados

Alguns provedores de e-mail de terceiros, como Mailgun e Postmark, oferecem suporte a "tags" e "metadados" de mensagens, que podem ser usados para agrupar e rastrear e-mails enviados pela sua aplicação. Você pode adicionar tags e metadados a uma mensagem de e-mail por meio dos métodos `tag` e `metadata`:

```php
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->greeting('Comment Upvoted!')
        ->tag('upvote')
        ->metadata('comment_id', $this->comment->id);
}
```

Se sua aplicação estiver usando o driver Mailgun, você pode consultar a documentação do Mailgun para mais informações sobre [tags](https://documentation.mailgun.com/docs/mailgun/user-manual/tracking-messages/#tags) e [metadados](https://documentation.mailgun.com/docs/mailgun/user-manual/sending-messages/#attaching-metadata-to-messages). Da mesma forma, a documentação do Postmark também pode ser consultada para mais informações sobre o suporte deles a [tags](https://postmarkapp.com/blog/tags-support-for-smtp) e [metadados](https://postmarkapp.com/support/article/1125-custom-metadata-faq).

Se sua aplicação estiver usando o Amazon SES para enviar e-mails, você deve usar o método `metadata` para anexar [SES "tags"](https://docs.aws.amazon.com/ses/latest/APIReference/API_MessageTag.html) à mensagem.

<a id="customizing-the-symfony-message"></a>
### Personalizando a Mensagem do Symfony

O método `withSymfonyMessage` da classe `MailMessage` permite que você registre uma closure que será invocada com a instância do Symfony Message antes de enviar a mensagem. Isso lhe dá a oportunidade de personalizar profundamente a mensagem antes que ela seja entregue:

```php
use Symfony\Component\Mime\Email;

/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->withSymfonyMessage(function (Email $message) {
            $message->getHeaders()->addTextHeader(
                'Custom-Header', 'Header Value'
            );
        });
}
```

<a id="using-mailables"></a>
### Usando Mailables

Se necessário, você pode retornar um [objeto mailable](/en/mail/) completo a partir do método `toMail` da sua notificação. Ao retornar um `Mailable` em vez de um `MailMessage`, você precisará especificar o destinatário da mensagem usando o método `to` do objeto mailable:

```php
use App\Mail\InvoicePaid as InvoicePaidMailable;
use Illuminate\Mail\Mailable;

/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): Mailable
{
    return (new InvoicePaidMailable($this->invoice))
        ->to($notifiable->email);
}
```

<a id="mailables-and-on-demand-notifications"></a>
#### Mailables e Notificações Sob Demanda

Se você estiver enviando uma [notificação sob demanda](#on-demand-notifications), a instância `$notifiable` fornecida ao método `toMail` será uma instância de `Illuminate\Notifications\AnonymousNotifiable`, que oferece um método `routeNotificationFor` que pode ser usado para recuperar o endereço de e-mail para o qual a notificação sob demanda deve ser enviada:

```php
use App\Mail\InvoicePaid as InvoicePaidMailable;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Mail\Mailable;

/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): Mailable
{
    $address = $notifiable instanceof AnonymousNotifiable
        ? $notifiable->routeNotificationFor('mail')
        : $notifiable->email;

    return (new InvoicePaidMailable($this->invoice))
        ->to($address);
}
```

<a id="previewing-mail-notifications"></a>
### Visualizando Notificações por E-mail

Ao projetar um template de notificação por e-mail, é conveniente visualizar rapidamente a mensagem de e-mail renderizada no seu navegador, como um template Blade típico. Por esse motivo, o Laravel permite que você retorne qualquer mensagem de e-mail gerada por uma notificação por e-mail diretamente de uma closure de rota ou controller. Quando um `MailMessage` é retornado, ele será renderizado e exibido no navegador, permitindo que você visualize rapidamente seu design sem precisar enviá-lo para um endereço de e-mail real:

```php
use App\Models\Invoice;
use App\Notifications\InvoicePaid;

Route::get('/notification', function () {
    $invoice = Invoice::find(1);

    return (new InvoicePaid($invoice))
        ->toMail($invoice->user);
});
```

<a id="markdown-mail-notifications"></a>
## Notificações por E-mail em Markdown

As notificações por e-mail em Markdown permitem que você aproveite os templates pré-construídos das notificações por e-mail, ao mesmo tempo em que lhe dão mais liberdade para escrever mensagens mais longas e personalizadas. Como as mensagens são escritas em Markdown, o Laravel é capaz de renderizar belos e responsivos templates HTML para as mensagens, gerando também automaticamente uma versão em texto puro.

<a id="generating-the-message"></a>
### Gerando a Mensagem

Para gerar uma notificação com um template Markdown correspondente, você pode usar a opção `--markdown` do comando Artisan `make:notification`:

```shell
php artisan make:notification InvoicePaid --markdown=mail.invoice.paid
```

Como todas as outras notificações por e-mail, as notificações que usam templates Markdown devem definir um método `toMail` na sua classe de notificação. No entanto, em vez de usar os métodos `line` e `action` para construir a notificação, use o método `markdown` para especificar o nome do template Markdown que deve ser usado. Um array de dados que você deseja tornar disponível para o template pode ser passado como segundo argumento do método:

```php
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    $url = url('/invoice/'.$this->invoice->id);

    return (new MailMessage)
        ->subject('Invoice Paid')
        ->markdown('mail.invoice.paid', ['url' => $url]);
}
```

<a id="writing-the-message"></a>
### Escrevendo a Mensagem

As notificações por e-mail em Markdown usam uma combinação de componentes Blade e sintaxe Markdown que permitem que você construa notificações facilmente, aproveitando os componentes de notificação pré-elaborados do Laravel:

```blade
<x-mail::message>
# Invoice Paid

Your invoice has been paid!

<x-mail::button :url="$url">
View Invoice
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
```

> **Note:**
> Não use indentação excessiva ao escrever e-mails em Markdown. Conforme os padrões do Markdown, os parsers de Markdown renderizarão o conteúdo indentado como blocos de código.

<a id="button-component"></a>
#### Componente de Botão

O componente de botão renderiza um link de botão centralizado. O componente aceita dois argumentos, uma `url` e uma `color` opcional. As cores suportadas são `primary`, `green` e `red`. Você pode adicionar quantos componentes de botão desejar a uma notificação:

```blade
<x-mail::button :url="$url" color="green">
View Invoice
</x-mail::button>
```

<a id="panel-component"></a>
#### Componente de Painel

O componente de painel renderiza o bloco de texto fornecido em um painel que tem uma cor de fundo ligeiramente diferente do restante da notificação. Isso permite que você chame a atenção para um determinado bloco de texto:

```blade
<x-mail::panel>
This is the panel content.
</x-mail::panel>
```

<a id="table-component"></a>
#### Componente de Tabela

O componente de tabela permite que você transforme uma tabela Markdown em uma tabela HTML. O componente aceita a tabela Markdown como seu conteúdo. O alinhamento das colunas da tabela é suportado usando a sintaxe de alinhamento de tabela Markdown padrão:

```blade
<x-mail::table>
| Laravel       | Table         | Example       |
| ------------- | :-----------: | ------------: |
| Col 2 is      | Centered      | $10           |
| Col 3 is      | Right-Aligned | $20           |
</x-mail::table>
```

<a id="customizing-the-components"></a>
### Personalizando os Componentes

Você pode exportar todos os componentes de notificação Markdown para sua própria aplicação para personalização. Para exportar os componentes, use o comando Artisan `vendor:publish` para publicar a tag de asset `laravel-mail`:

```shell
php artisan vendor:publish --tag=laravel-mail
```

Este comando publicará os componentes de e-mail Markdown no diretório `resources/views/vendor/mail`. O diretório `mail` conterá um diretório `html` e um diretório `text`, cada um contendo suas respectivas representações de cada componente disponível. Você está livre para personalizar esses componentes como quiser.

<a id="customizing-the-css"></a>
#### Personalizando o CSS

Após exportar os componentes, o diretório `resources/views/vendor/mail/html/themes` conterá um arquivo `default.css`. Você pode personalizar o CSS neste arquivo e seus estilos serão automaticamente inseridos inline nas representações HTML das suas notificações Markdown.

Se você quiser criar um tema totalmente novo para os componentes Markdown do Laravel, pode colocar um arquivo CSS dentro do diretório `html/themes`. Após nomear e salvar seu arquivo CSS, atualize a opção `theme` do arquivo de configuração `mail` para corresponder ao nome do seu novo tema.

Para personalizar o tema de uma notificação individual, você pode chamar o método `theme` ao construir a mensagem de e-mail da notificação. O método `theme` aceita o nome do tema que deve ser usado ao enviar a notificação:

```php
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->theme('invoice')
        ->subject('Invoice Paid')
        ->markdown('mail.invoice.paid', ['url' => $url]);
}
```

<a id="database-notifications"></a>
## Notificações no Banco de Dados

<a id="database-prerequisites"></a>
### Pré-requisitos

O canal de notificação `database` armazena as informações da notificação em uma tabela do banco de dados. Esta tabela conterá informações como o tipo da notificação, bem como uma estrutura de dados JSON que descreve a notificação.

Você pode consultar a tabela para exibir as notificações na interface de usuário da sua aplicação. Mas, antes de poder fazer isso, você precisará criar uma tabela no banco de dados para armazenar suas notificações. Você pode usar o comando `make:notifications-table` para gerar uma [migration](/en/migrations/) com o schema de tabela apropriado:

```shell
php artisan make:notifications-table

php artisan migrate
```

> **Note:**
> Se seus modelos notificáveis estiverem usando [chaves primárias UUID ou ULID](/en/eloquent/#uuid-and-ulid-keys), você deve substituir o método `morphs` por [uuidMorphs](/en/migrations/#column-method-uuidMorphs) ou [ulidMorphs](/en/migrations/#column-method-ulidMorphs) na migration da tabela de notificações.

<a id="formatting-database-notifications"></a>
### Formatando Notificações no Banco de Dados

Se uma notificação oferecer suporte para ser armazenada em uma tabela do banco de dados, você deve definir um método `toDatabase` ou `toArray` na classe de notificação. Este método receberá uma entidade `$notifiable` e deve retornar um array PHP simples. O array retornado será codificado como JSON e armazenado na coluna `data` da sua tabela `notifications`. Vamos dar uma olhada em um exemplo de método `toArray`:

```php
/**
 * Get the array representation of the notification.
 *
 * @return array<string, mixed>
 */
public function toArray(object $notifiable): array
{
    return [
        'invoice_id' => $this->invoice->id,
        'amount' => $this->invoice->amount,
    ];
}
```

Quando uma notificação é armazenada no banco de dados da sua aplicação, a coluna `type` será definida como o nome da classe da notificação por padrão, e a coluna `read_at` será `null`. No entanto, você pode personalizar esse comportamento definindo os métodos `databaseType` e `initialDatabaseReadAtValue` na sua classe de notificação:

```php
use Illuminate\Support\Carbon;

/**
 * Get the notification's database type.
 */
public function databaseType(object $notifiable): string
{
    return 'invoice-paid';
}

/**
 * Get the initial value for the "read_at" column.
 */
public function initialDatabaseReadAtValue(): ?Carbon
{
    return null;
}
```

<a id="todatabase-vs-toarray"></a>
#### `toDatabase` vs. `toArray`

O método `toArray` também é usado pelo canal `broadcast` para determinar quais dados transmitir para o seu frontend baseado em JavaScript. Se você quiser ter duas representações de array diferentes para os canais `database` e `broadcast`, deve definir um método `toDatabase` em vez de um método `toArray`.

<a id="accessing-the-notifications"></a>
### Acessando as Notificações

Uma vez que as notificações estejam armazenadas no banco de dados, você precisa de uma maneira conveniente de acessá-las a partir das suas entidades notificáveis. O trait `Illuminate\Notifications\Notifiable`, que está incluído no modelo padrão `App\Models\User` do Laravel, inclui um [relacionamento Eloquent](/en/eloquent-relationships/) `notifications` que retorna as notificações da entidade. Para buscar notificações, você pode acessar este método como qualquer outro relacionamento Eloquent. Por padrão, as notificações serão ordenadas pelo timestamp `created_at`, com as notificações mais recentes no início da collection:

```php
$user = App\Models\User::find(1);

foreach ($user->notifications as $notification) {
    echo $notification->type;
}
```

Se você quiser recuperar apenas as notificações "não lidas", pode usar o relacionamento `unreadNotifications`. Novamente, essas notificações serão ordenadas pelo timestamp `created_at`, com as notificações mais recentes no início da collection:

```php
$user = App\Models\User::find(1);

foreach ($user->unreadNotifications as $notification) {
    echo $notification->type;
}
```

Se você quiser recuperar apenas as notificações "lidas", pode usar o relacionamento `readNotifications`:

```php
$user = App\Models\User::find(1);

foreach ($user->readNotifications as $notification) {
    echo $notification->type;
}
```

> **Note:**
> Para acessar suas notificações a partir do seu cliente JavaScript, você deve definir um controller de notificações para sua aplicação que retorne as notificações de uma entidade notificável, como o usuário atual. Você pode então fazer uma requisição HTTP para a URL desse controller a partir do seu cliente JavaScript.

<a id="marking-notifications-as-read"></a>
### Marcando Notificações como Lidas

Normalmente, você vai querer marcar uma notificação como "lida" quando um usuário a visualizar. O trait `Illuminate\Notifications\Notifiable` fornece um método `markAsRead`, que atualiza a coluna `read_at` no registro do banco de dados da notificação:

```php
$user = App\Models\User::find(1);

foreach ($user->unreadNotifications as $notification) {
    $notification->markAsRead();
}
```

No entanto, em vez de percorrer cada notificação, você pode usar o método `markAsRead` diretamente em uma collection de notificações:

```php
$user->unreadNotifications->markAsRead();
```

Você também pode usar uma query de atualização em massa para marcar todas as notificações como lidas sem recuperá-las do banco de dados:

```php
$user = App\Models\User::find(1);

$user->unreadNotifications()->update(['read_at' => now()]);
```

Você pode usar `delete` nas notificações para removê-las completamente da tabela:

```php
$user->notifications()->delete();
```

<a id="broadcast-notifications"></a>
## Notificações por Broadcast

<a id="broadcast-prerequisites"></a>
### Pré-requisitos

Antes de transmitir notificações, você deve configurar e estar familiarizado com os serviços de [broadcasting de eventos](/en/broadcasting/) do Laravel. O broadcasting de eventos fornece uma maneira de reagir a eventos do Laravel no lado do servidor a partir do seu frontend baseado em JavaScript.

<a id="formatting-broadcast-notifications"></a>
### Formatando Notificações por Broadcast

O canal `broadcast` transmite notificações usando os serviços de [broadcasting de eventos](/en/broadcasting/) do Laravel, permitindo que seu frontend baseado em JavaScript capture notificações em tempo real. Se uma notificação oferecer suporte a broadcasting, você pode definir um método `toBroadcast` na classe de notificação. Este método receberá uma entidade `$notifiable` e deve retornar uma instância de `BroadcastMessage`. Se o método `toBroadcast` não existir, o método `toArray` será usado para reunir os dados que devem ser transmitidos. Os dados retornados serão codificados como JSON e transmitidos para o seu frontend baseado em JavaScript. Vamos dar uma olhada em um exemplo de método `toBroadcast`:

```php
use Illuminate\Notifications\Messages\BroadcastMessage;

/**
 * Get the broadcastable representation of the notification.
 */
public function toBroadcast(object $notifiable): BroadcastMessage
{
    return new BroadcastMessage([
        'invoice_id' => $this->invoice->id,
        'amount' => $this->invoice->amount,
    ]);
}
```

<a id="broadcast-queue-configuration"></a>
#### Configuração da Fila de Broadcast

Todas as notificações por broadcast são enfileiradas para transmissão. Se você quiser configurar a conexão de fila ou o nome da fila usado para enfileirar a operação de broadcast, pode usar os métodos `onConnection` e `onQueue` do `BroadcastMessage`:

```php
return (new BroadcastMessage($data))
    ->onConnection('sqs')
    ->onQueue('broadcasts');
```

<a id="customizing-the-notification-type"></a>
#### Personalizando o Tipo de Notificação

Além dos dados que você especifica, todas as notificações por broadcast também têm um campo `type` contendo o nome completo da classe da notificação. Se você quiser personalizar o `type` da notificação, pode definir um método `broadcastType` na classe de notificação:

```php
/**
 * Get the type of the notification being broadcast.
 */
public function broadcastType(): string
{
    return 'broadcast.message';
}
```

<a id="listening-for-notifications"></a>
### Ouvindo Notificações

As notificações serão transmitidas em um canal privado formatado usando a convenção `{notifiable}.{id}`. Portanto, se você estiver enviando uma notificação para uma instância de `App\Models\User` com um ID de `1`, a notificação será transmitida no canal privado `App.Models.User.1`. Ao usar o [Laravel Echo](/en/broadcasting/#client-side-installation), você pode facilmente ouvir notificações em um canal usando o método `notification`:

```js
Echo.private('App.Models.User.' + userId)
    .notification((notification) => {
        console.log(notification.type);
    });
```

<a id="using-react-or-vue"></a>
#### Usando React, Vue ou Svelte

O Laravel Echo inclui hooks para React, Vue e Svelte que tornam indolor ouvir notificações. Para começar, invoque o hook `useEchoNotification`, que é usado para ouvir notificações. O hook `useEchoNotification` sairá automaticamente dos canais quando o componente consumidor for desmontado:

```js tab=React
import { useEchoNotification } from "@laravel/echo-react";

useEchoNotification(
    `App.Models.User.${userId}`,
    (notification) => {
        console.log(notification.type);
    },
);
```

```vue tab=Vue
<script setup lang="ts">
import { useEchoNotification } from "@laravel/echo-vue";

useEchoNotification(
    `App.Models.User.${userId}`,
    (notification) => {
        console.log(notification.type);
    },
);
</script>
```

```svelte tab=Svelte
<script>
import { useEchoNotification } from "@laravel/echo-svelte";

useEchoNotification(
    `App.Models.User.${userId}`,
    (notification) => {
        console.log(notification.type);
    },
);
</script>
```

Por padrão, o hook ouve todas as notificações. Para especificar os tipos de notificação que você gostaria de ouvir, você pode fornecer uma string ou um array de tipos para `useEchoNotification`:

```js tab=React
import { useEchoNotification } from "@laravel/echo-react";

useEchoNotification(
    `App.Models.User.${userId}`,
    (notification) => {
        console.log(notification.type);
    },
    'App.Notifications.InvoicePaid',
);
```

```vue tab=Vue
<script setup lang="ts">
import { useEchoNotification } from "@laravel/echo-vue";

useEchoNotification(
    `App.Models.User.${userId}`,
    (notification) => {
        console.log(notification.type);
    },
    'App.Notifications.InvoicePaid',
);
</script>
```

```svelte tab=Svelte
<script>
import { useEchoNotification } from "@laravel/echo-svelte";

useEchoNotification(
    `App.Models.User.${userId}`,
    (notification) => {
        console.log(notification.type);
    },
    'App.Notifications.InvoicePaid',
);
</script>
```

Você também pode especificar o formato dos dados do payload da notificação, fornecendo maior segurança de tipos e conveniência de edição:

```ts
type InvoicePaidNotification = {
    invoice_id: number;
    created_at: string;
};

useEchoNotification<InvoicePaidNotification>(
    `App.Models.User.${userId}`,
    (notification) => {
        console.log(notification.invoice_id);
        console.log(notification.created_at);
        console.log(notification.type);
    },
    'App.Notifications.InvoicePaid',
);
```

<a id="customizing-the-notification-channel"></a>
#### Personalizando o Canal de Notificação

Se você quiser personalizar em qual canal as notificações por broadcast de uma entidade são transmitidas, pode definir um método `receivesBroadcastNotificationsOn` na entidade notificável:

```php
<?php

namespace App\Models;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * The channels the user receives notification broadcasts on.
     */
    public function receivesBroadcastNotificationsOn(): string
    {
        return 'users.'.$this->id;
    }
}
```

<a id="sms-notifications"></a>
## Notificações por SMS

<a id="sms-prerequisites"></a>
### Pré-requisitos

O envio de notificações por SMS no Laravel é alimentado pelo [Vonage](https://www.vonage.com/) (anteriormente conhecido como Nexmo). Antes de poder enviar notificações via Vonage, você precisa instalar os pacotes `laravel/vonage-notification-channel` e `guzzlehttp/guzzle`:

```shell
composer require laravel/vonage-notification-channel guzzlehttp/guzzle
```

O pacote inclui um [arquivo de configuração](https://github.com/laravel/vonage-notification-channel/blob/3.x/config/vonage.php). No entanto, você não é obrigado a exportar este arquivo de configuração para sua própria aplicação. Você pode simplesmente usar as variáveis de ambiente `VONAGE_KEY` e `VONAGE_SECRET` para definir suas chaves pública e secreta do Vonage.

Depois de definir suas chaves, você deve definir uma variável de ambiente `VONAGE_SMS_FROM` que define o número de telefone a partir do qual suas mensagens SMS devem ser enviadas por padrão. Você pode gerar este número de telefone no painel de controle do Vonage:

```ini
VONAGE_SMS_FROM=15556666666
```

<a id="formatting-sms-notifications"></a>
### Formatando Notificações por SMS

Se uma notificação oferecer suporte para ser enviada como um SMS, você deve definir um método `toVonage` na classe de notificação. Este método receberá uma entidade `$notifiable` e deve retornar uma instância de `Illuminate\Notifications\Messages\VonageMessage`:

```php
use Illuminate\Notifications\Messages\VonageMessage;

/**
 * Get the Vonage / SMS representation of the notification.
 */
public function toVonage(object $notifiable): VonageMessage
{
    return (new VonageMessage)
        ->content('Your SMS message content');
}
```

<a id="unicode-content"></a>
#### Conteúdo Unicode

Se sua mensagem SMS contiver caracteres unicode, você deve chamar o método `unicode` ao construir a instância do `VonageMessage`:

```php
use Illuminate\Notifications\Messages\VonageMessage;

/**
 * Get the Vonage / SMS representation of the notification.
 */
public function toVonage(object $notifiable): VonageMessage
{
    return (new VonageMessage)
        ->content('Your unicode message')
        ->unicode();
}
```

<a id="customizing-the-from-number"></a>
### Personalizando o Número "From"

Se você quiser enviar algumas notificações a partir de um número de telefone diferente do número de telefone especificado pela sua variável de ambiente `VONAGE_SMS_FROM`, pode chamar o método `from` em uma instância de `VonageMessage`:

```php
use Illuminate\Notifications\Messages\VonageMessage;

/**
 * Get the Vonage / SMS representation of the notification.
 */
public function toVonage(object $notifiable): VonageMessage
{
    return (new VonageMessage)
        ->content('Your SMS message content')
        ->from('15554443333');
}
```

<a id="adding-a-client-reference"></a>
### Adicionando uma Referência de Cliente

Se você quiser acompanhar os custos por usuário, equipe ou cliente, pode adicionar uma "referência de cliente" à notificação. O Vonage permitirá que você gere relatórios usando esta referência de cliente para que você possa entender melhor o uso de SMS de um cliente específico. A referência de cliente pode ser qualquer string de até 40 caracteres:

```php
use Illuminate\Notifications\Messages\VonageMessage;

/**
 * Get the Vonage / SMS representation of the notification.
 */
public function toVonage(object $notifiable): VonageMessage
{
    return (new VonageMessage)
        ->clientReference((string) $notifiable->id)
        ->content('Your SMS message content');
}
```

<a id="routing-sms-notifications"></a>
### Roteando Notificações por SMS

Para rotear notificações do Vonage para o número de telefone correto, defina um método `routeNotificationForVonage` na sua entidade notificável:

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Notifications\Notification;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * Route notifications for the Vonage channel.
     */
    public function routeNotificationForVonage(Notification $notification): string
    {
        return $this->phone_number;
    }
}
```

<a id="slack-notifications"></a>
## Notificações no Slack

<a id="slack-prerequisites"></a>
### Pré-requisitos

Antes de enviar notificações no Slack, você deve instalar o canal de notificação do Slack via Composer:

```shell
composer require laravel/slack-notification-channel
```

Além disso, você deve criar um [Slack App](https://api.slack.com/apps?new_app=1) para o seu workspace do Slack.

Se você só precisa enviar notificações para o mesmo workspace do Slack em que o App foi criado, deve garantir que seu App tenha os scopes `chat:write`, `chat:write.public` e `chat:write.customize`. Esses scopes podem ser adicionados a partir da aba de gerenciamento de App "OAuth & Permissions" dentro do Slack.

Em seguida, copie o "Bot User OAuth Token" do App e coloque-o dentro de um array de configuração `slack` no arquivo de configuração `services.php` da sua aplicação. Este token pode ser encontrado na aba "OAuth & Permissions" dentro do Slack:

```php
'slack' => [
    'notifications' => [
        'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
        'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
    ],
],
```

<a id="slack-app-distribution"></a>
#### Distribuição do App

Se sua aplicação enviar notificações para workspaces externos do Slack que pertencem aos usuários da sua aplicação, você precisará "distribuir" seu App via Slack. A distribuição do App pode ser gerenciada a partir da aba "Manage Distribution" do seu App dentro do Slack. Depois que seu App tiver sido distribuído, você pode usar o [Socialite](/en/socialite/) para [obter tokens de Bot do Slack](/en/socialite/#slack-bot-scopes) em nome dos usuários da sua aplicação.

<a id="formatting-slack-notifications"></a>
### Formatando Notificações no Slack

Se uma notificação oferecer suporte para ser enviada como uma mensagem do Slack, você deve definir um método `toSlack` na classe de notificação. Este método receberá uma entidade `$notifiable` e deve retornar uma instância de `Illuminate\Notifications\Slack\SlackMessage`. Você pode construir notificações ricas usando a [API Block Kit do Slack](https://api.slack.com/block-kit). O exemplo a seguir pode ser visualizado no [Block Kit builder do Slack](https://app.slack.com/block-kit-builder/T01KWS6K23Z#%7B%22blocks%22:%5B%7B%22type%22:%22header%22,%22text%22:%7B%22type%22:%22plain_text%22,%22text%22:%22Invoice%20Paid%22%7D%7D,%7B%22type%22:%22context%22,%22elements%22:%5B%7B%22type%22:%22plain_text%22,%22text%22:%22Customer%20%231234%22%7D%5D%7D,%7B%22type%22:%22section%22,%22text%22:%7B%22type%22:%22plain_text%22,%22text%22:%22An%20invoice%20has%20been%20paid.%22%7D,%22fields%22:%5B%7B%22type%22:%22mrkdwn%22,%22text%22:%22*Invoice%20No:*%5Cn1000%22%7D,%7B%22type%22:%22mrkdwn%22,%22text%22:%22*Invoice%20Recipient:*%5Cntaylor@laravel.com%22%7D%5D%7D,%7B%22type%22:%22divider%22%7D,%7B%22type%22:%22section%22,%22text%22:%7B%22type%22:%22plain_text%22,%22text%22:%22Congratulations!%22%7D%7D%5D%7D):

```php
use Illuminate\Notifications\Slack\BlockKit\Blocks\ContextBlock;
use Illuminate\Notifications\Slack\BlockKit\Blocks\SectionBlock;
use Illuminate\Notifications\Slack\SlackMessage;

/**
 * Get the Slack representation of the notification.
 */
public function toSlack(object $notifiable): SlackMessage
{
    return (new SlackMessage)
        ->text('One of your invoices has been paid!')
        ->headerBlock('Invoice Paid')
        ->contextBlock(function (ContextBlock $block) {
            $block->text('Customer #1234');
        })
        ->sectionBlock(function (SectionBlock $block) {
            $block->text('An invoice has been paid.');
            $block->field("*Invoice No:*\n1000")->markdown();
            $block->field("*Invoice Recipient:*\ntaylor@laravel.com")->markdown();
        })
        ->dividerBlock()
        ->sectionBlock(function (SectionBlock $block) {
            $block->text('Congratulations!');
        });
}
```

<a id="using-slacks-block-kit-builder-template"></a>
#### Usando o Template do Block Kit Builder do Slack

Em vez de usar os métodos fluentes do construtor de mensagens para construir sua mensagem do Block Kit, você pode fornecer o payload JSON bruto gerado pelo Block Kit Builder do Slack para o método `usingBlockKitTemplate`:

```php
use Illuminate\Notifications\Slack\SlackMessage;
use Illuminate\Support\Str;

/**
 * Get the Slack representation of the notification.
 */
public function toSlack(object $notifiable): SlackMessage
{
    $template = <<<JSON
        {
          "blocks": [
            {
              "type": "header",
              "text": {
                "type": "plain_text",
                "text": "Team Announcement"
              }
            },
            {
              "type": "section",
              "text": {
                "type": "plain_text",
                "text": "We are hiring!"
              }
            }
          ]
        }
    JSON;

    return (new SlackMessage)
        ->usingBlockKitTemplate($template);
}
```

<a id="slack-interactivity"></a>
### Interatividade do Slack

O sistema de notificação Block Kit do Slack fornece recursos poderosos para [lidar com a interação do usuário](https://api.slack.com/interactivity/handling). Para utilizar esses recursos, seu Slack App deve ter a "Interactivity" habilitada e uma "Request URL" configurada que aponte para uma URL servida pela sua aplicação. Essas configurações podem ser gerenciadas a partir da aba de gerenciamento de App "Interactivity & Shortcuts" dentro do Slack.

No exemplo a seguir, que utiliza o método `actionsBlock`, o Slack enviará uma requisição `POST` para sua "Request URL" com um payload contendo o usuário do Slack que clicou no botão, o ID do botão clicado e muito mais. Sua aplicação pode então determinar a ação a ser tomada com base no payload. Você também deve [verificar se a requisição](https://api.slack.com/authentication/verifying-requests-from-slack) foi feita pelo Slack:

```php
use Illuminate\Notifications\Slack\BlockKit\Blocks\ActionsBlock;
use Illuminate\Notifications\Slack\BlockKit\Blocks\ContextBlock;
use Illuminate\Notifications\Slack\BlockKit\Blocks\SectionBlock;
use Illuminate\Notifications\Slack\SlackMessage;

/**
 * Get the Slack representation of the notification.
 */
public function toSlack(object $notifiable): SlackMessage
{
    return (new SlackMessage)
        ->text('One of your invoices has been paid!')
        ->headerBlock('Invoice Paid')
        ->contextBlock(function (ContextBlock $block) {
            $block->text('Customer #1234');
        })
        ->sectionBlock(function (SectionBlock $block) {
            $block->text('An invoice has been paid.');
        })
        ->actionsBlock(function (ActionsBlock $block) {
             // ID defaults to "button_acknowledge_invoice"...
            $block->button('Acknowledge Invoice')->primary();

            // Manually configure the ID...
            $block->button('Deny')->danger()->id('deny_invoice');
        });
}
```

<a id="slack-confirmation-modals"></a>
#### Modais de Confirmação

Se você quiser que os usuários sejam obrigados a confirmar uma ação antes que ela seja executada, pode invocar o método `confirm` ao definir seu botão. O método `confirm` aceita uma mensagem e uma closure que recebe uma instância de `ConfirmObject`:

```php
use Illuminate\Notifications\Slack\BlockKit\Blocks\ActionsBlock;
use Illuminate\Notifications\Slack\BlockKit\Blocks\ContextBlock;
use Illuminate\Notifications\Slack\BlockKit\Blocks\SectionBlock;
use Illuminate\Notifications\Slack\BlockKit\Composites\ConfirmObject;
use Illuminate\Notifications\Slack\SlackMessage;

/**
 * Get the Slack representation of the notification.
 */
public function toSlack(object $notifiable): SlackMessage
{
    return (new SlackMessage)
        ->text('One of your invoices has been paid!')
        ->headerBlock('Invoice Paid')
        ->contextBlock(function (ContextBlock $block) {
            $block->text('Customer #1234');
        })
        ->sectionBlock(function (SectionBlock $block) {
            $block->text('An invoice has been paid.');
        })
        ->actionsBlock(function (ActionsBlock $block) {
            $block->button('Acknowledge Invoice')
                ->primary()
                ->confirm(
                    'Acknowledge the payment and send a thank you email?',
                    function (ConfirmObject $dialog) {
                        $dialog->confirm('Yes');
                        $dialog->deny('No');
                    }
                );
        });
}
```

<a id="inspecting-slack-blocks"></a>
#### Inspecionando Blocks do Slack

Se você quiser inspecionar rapidamente os blocks que vem construindo, pode invocar o método `dd` na instância de `SlackMessage`. O método `dd` gerará e fará o dump de uma URL para o [Block Kit Builder](https://app.slack.com/block-kit-builder/) do Slack, que exibe uma visualização do payload e da notificação no seu navegador. Você pode passar `true` para o método `dd` para fazer o dump do payload bruto:

```php
return (new SlackMessage)
    ->text('One of your invoices has been paid!')
    ->headerBlock('Invoice Paid')
    ->dd();
```

<a id="routing-slack-notifications"></a>
### Roteando Notificações no Slack

Para direcionar notificações do Slack para o time e canal apropriados do Slack, defina um método `routeNotificationForSlack` no seu modelo notificável. Este método pode retornar um de três valores:

- `null` - o que adia o roteamento para o canal configurado na própria notificação. Você pode usar o método `to` ao construir sua `SlackMessage` para configurar o canal dentro da notificação.
- Uma string especificando o canal do Slack para o qual enviar a notificação, por exemplo, `#support-channel`.
- Uma instância de `SlackRoute`, que permite que você especifique um token OAuth e um nome de canal, por exemplo, `SlackRoute::make($this->slack_channel, $this->slack_token)`. Este método deve ser usado para enviar notificações a workspaces externos.

Por exemplo, retornar `#support-channel` do método `routeNotificationForSlack` enviará a notificação para o canal `#support-channel` no workspace associado ao Bot User OAuth token localizado no arquivo de configuração `services.php` da sua aplicação:

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Notifications\Notification;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * Route notifications for the Slack channel.
     */
    public function routeNotificationForSlack(Notification $notification): mixed
    {
        return '#support-channel';
    }
}
```

<a id="notifying-external-slack-workspaces"></a>
### Notificando Workspaces Externos do Slack

> **Note:**
> Antes de enviar notificações para workspaces externos do Slack, seu Slack App deve ser [distribuído](#slack-app-distribution).

É claro que você muitas vezes vai querer enviar notificações para os workspaces do Slack que pertencem aos usuários da sua aplicação. Para fazer isso, você primeiro precisará obter um token OAuth do Slack para o usuário. Felizmente, o [Laravel Socialite](/en/socialite/) inclui um driver do Slack que permitirá que você autentique facilmente os usuários da sua aplicação com o Slack e [obtenha um token de bot](/en/socialite/#slack-bot-scopes).

Depois de obter o token de bot e armazená-lo no banco de dados da sua aplicação, você pode utilizar o método `SlackRoute::make` para rotear uma notificação para o workspace do usuário. Além disso, sua aplicação provavelmente precisará oferecer ao usuário a oportunidade de especificar para qual canal as notificações devem ser enviadas:

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Slack\SlackRoute;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * Route notifications for the Slack channel.
     */
    public function routeNotificationForSlack(Notification $notification): mixed
    {
        return SlackRoute::make($this->slack_channel, $this->slack_token);
    }
}
```

<a id="localizing-notifications"></a>
## Localizando Notificações

O Laravel permite que você envie notificações em um locale diferente do locale atual da requisição HTTP e até se lembrará desse locale se a notificação for enfileirada.

Para fazer isso, a classe `Illuminate\Notifications\Notification` oferece um método `locale` para definir o idioma desejado. A aplicação mudará para este locale enquanto a notificação estiver sendo avaliada e, em seguida, voltará para o locale anterior quando a avaliação for concluída:

```php
$user->notify((new InvoicePaid($invoice))->locale('es'));
```

A localização de múltiplas entradas notificáveis também pode ser alcançada por meio da facade `Notification`:

```php
Notification::locale('es')->send(
    $users, new InvoicePaid($invoice)
);
```

<a id="user-preferred-locales"></a>
#### Locales Preferidos do Usuário

Às vezes, as aplicações armazenam o locale preferido de cada usuário. Ao implementar o contract `HasLocalePreference` no seu modelo notificável, você pode instruir o Laravel a usar este locale armazenado ao enviar uma notificação:

```php
use Illuminate\Contracts\Translation\HasLocalePreference;

class User extends Model implements HasLocalePreference
{
    /**
     * Get the user's preferred locale.
     */
    public function preferredLocale(): string
    {
        return $this->locale;
    }
}
```

Depois de implementar a interface, o Laravel usará automaticamente o locale preferido ao enviar notificações e mailables para o modelo. Portanto, não há necessidade de chamar o método `locale` ao usar esta interface:

```php
$user->notify(new InvoicePaid($invoice));
```

<a id="testing"></a>
## Testes

Você pode usar o método `fake` da facade `Notification` para impedir que as notificações sejam enviadas. Normalmente, o envio de notificações não tem relação com o código que você está realmente testando. Muito provavelmente, é suficiente apenas afirmar que o Laravel foi instruído a enviar uma determinada notificação.

Depois de chamar o método `fake` da facade `Notification`, você pode então afirmar que as notificações foram instruídas a serem enviadas aos usuários e até inspecionar os dados que as notificações receberam:

```php tab=Pest
<?php

use App\Notifications\OrderShipped;
use Illuminate\Support\Facades\Notification;

test('orders can be shipped', function () {
    Notification::fake();

    // Perform order shipping...

    // Assert that no notifications were sent...
    Notification::assertNothingSent();

    // Assert a notification was sent to the given users...
    Notification::assertSentTo(
        [$user], OrderShipped::class
    );

    // Assert a notification was not sent...
    Notification::assertNotSentTo(
        [$user], AnotherNotification::class
    );

    // Assert a notification was sent twice...
    Notification::assertSentTimes(WeeklyReminder::class, 2);

    // Assert that a notification was sent to a user exactly once...
    Notification::assertSentToOnce($user, OrderShipped::class);

    // Assert that a given number of notifications were sent...
    Notification::assertCount(3);
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use App\Notifications\OrderShipped;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_orders_can_be_shipped(): void
    {
        Notification::fake();

        // Perform order shipping...

        // Assert that no notifications were sent...
        Notification::assertNothingSent();

        // Assert a notification was sent to the given users...
        Notification::assertSentTo(
            [$user], OrderShipped::class
        );

        // Assert a notification was not sent...
        Notification::assertNotSentTo(
            [$user], AnotherNotification::class
        );

        // Assert a notification was sent twice...
        Notification::assertSentTimes(WeeklyReminder::class, 2);

        // Assert that a notification was sent to a user exactly once...
        Notification::assertSentToOnce($user, OrderShipped::class);

        // Assert that a given number of notifications were sent...
        Notification::assertCount(3);
    }
}
```

Você pode passar uma closure para os métodos `assertSentTo` ou `assertNotSentTo` para afirmar que uma notificação foi enviada e que passa em um determinado "teste de verdade". Se pelo menos uma notificação que passa no teste de verdade fornecido foi enviada, então a assertion será bem-sucedida:

```php
Notification::assertSentTo(
    $user,
    function (OrderShipped $notification, array $channels) use ($order) {
        return $notification->order->id === $order->id;
    }
);
```

Como alternativa, você pode passar um array de valores de propriedade esperados como terceiro argumento para `assertSentTo` ou `assertNotSentTo`:

```php
Notification::assertSentTo($user, OrderShipped::class, ['order' => $order]);
```

Todas as propriedades especificadas devem corresponder. Os valores são comparados usando igualdade estrita, enquanto os modelos Eloquent são comparados usando seu método `is`. Você também pode passar um array de valores de propriedade esperados como segundo argumento para `assertSentOnDemand`.

<a id="testing-on-demand-notifications"></a>
#### Notificações Sob Demanda

Se o código que você está testando enviar [notificações sob demanda](#on-demand-notifications), você pode testar se a notificação sob demanda foi enviada por meio do método `assertSentOnDemand`:

```php
Notification::assertSentOnDemand(OrderShipped::class);
Notification::assertSentOnDemandOnce(OrderShipped::class);
```

Ao passar uma closure como segundo argumento para o método `assertSentOnDemand`, você pode determinar se uma notificação sob demanda foi enviada para o endereço de "rota" correto:

```php
Notification::assertSentOnDemand(
    OrderShipped::class,
    function (OrderShipped $notification, array $channels, object $notifiable) use ($user) {
        return $notifiable->routes['mail'] === $user->email;
    }
);
```

<a id="notification-events"></a>
## Eventos de Notificação

<a id="notification-sending-event"></a>
#### Evento de Envio de Notificação

Quando uma notificação está sendo enviada, o evento `Illuminate\Notifications\Events\NotificationSending` é despachado pelo sistema de notificação. Isso contém a entidade "notifiable" e a própria instância da notificação. Você pode criar [listeners de eventos](/en/events/) para este evento na sua aplicação:

```php
use Illuminate\Notifications\Events\NotificationSending;

class CheckNotificationStatus
{
    /**
     * Handle the event.
     */
    public function handle(NotificationSending $event): void
    {
        // ...
    }
}
```

A notificação não será enviada se um listener de evento para o evento `NotificationSending` retornar `false` do seu método `handle`:

```php
/**
 * Handle the event.
 */
public function handle(NotificationSending $event): bool
{
    return false;
}
```

Dentro de um listener de evento, você pode acessar as propriedades `notifiable`, `notification` e `channel` do evento para saber mais sobre o destinatário da notificação ou a própria notificação:

```php
/**
 * Handle the event.
 */
public function handle(NotificationSending $event): void
{
    // $event->channel
    // $event->notifiable
    // $event->notification
}
```

<a id="notification-sent-event"></a>
#### Evento de Notificação Enviada

Quando uma notificação é enviada, o [evento](/en/events/) `Illuminate\Notifications\Events\NotificationSent` é despachado pelo sistema de notificação. Isso contém a entidade "notifiable" e a própria instância da notificação. Você pode criar [listeners de eventos](/en/events/) para este evento na sua aplicação:

```php
use Illuminate\Notifications\Events\NotificationSent;

class LogNotification
{
    /**
     * Handle the event.
     */
    public function handle(NotificationSent $event): void
    {
        // ...
    }
}
```

Dentro de um listener de evento, você pode acessar as propriedades `notifiable`, `notification`, `channel` e `response` do evento para saber mais sobre o destinatário da notificação ou a própria notificação:

```php
/**
 * Handle the event.
 */
public function handle(NotificationSent $event): void
{
    // $event->channel
    // $event->notifiable
    // $event->notification
    // $event->response
}
```

<a id="custom-channels"></a>
## Canais Personalizados

O Laravel vem com um punhado de canais de notificação, mas você pode querer escrever seus próprios drivers para entregar notificações por meio de outros canais. O Laravel torna isso simples. Para começar, defina uma classe que contenha um método `send`. O método deve receber dois argumentos: um `$notifiable` e um `$notification`.

Dentro do método `send`, você pode chamar métodos na notificação para recuperar um objeto de mensagem compreendido pelo seu canal e, em seguida, enviar a notificação para a instância `$notifiable` da maneira que desejar:

```php
<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

class VoiceChannel
{
    /**
     * Send the given notification.
     */
    public function send(object $notifiable, Notification $notification): void
    {
        $message = $notification->toVoice($notifiable);

        // Send notification to the $notifiable instance...
    }
}
```

Uma vez que sua classe de canal de notificação tenha sido definida, você pode retornar o nome da classe a partir do método `via` de qualquer uma das suas notificações. Neste exemplo, o método `toVoice` da sua notificação pode retornar qualquer objeto que você escolher para representar mensagens de voz. Por exemplo, você pode definir sua própria classe `VoiceMessage` para representar essas mensagens:

```php
<?php

namespace App\Notifications;

use App\Notifications\Messages\VoiceMessage;
use App\Notifications\VoiceChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class InvoicePaid extends Notification
{
    use Queueable;

    /**
     * Get the notification channels.
     */
    public function via(object $notifiable): string
    {
        return VoiceChannel::class;
    }

    /**
     * Get the voice representation of the notification.
     */
    public function toVoice(object $notifiable): VoiceMessage
    {
        // ...
    }
}
```
