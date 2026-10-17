---
title: "Broadcasting"
---

- [Introdução](#introduction)
- [Início Rápido](#quickstart)
- [Instalação no Servidor](#server-side-installation)
    - [Reverb](#reverb)
    - [Pusher Channels](#pusher-channels)
    - [Ably](#ably)
    - [Mercure](#mercure)
- [Instalação no Cliente](#client-side-installation)
    - [Reverb](#client-reverb)
    - [Pusher Channels](#client-pusher-channels)
    - [Ably](#client-ably)
    - [Mercure](#client-mercure)
- [Visão Geral dos Conceitos](#concept-overview)
    - [Usando uma Aplicação de Exemplo](#using-example-application)
- [Definindo Eventos de Broadcast](#defining-broadcast-events)
    - [Nome do Broadcast](#broadcast-name)
    - [Dados do Broadcast](#broadcast-data)
    - [Fila do Broadcast](#broadcast-queue)
    - [Condições do Broadcast](#broadcast-conditions)
    - [Broadcasting e Transações de Banco de Dados](#broadcasting-and-database-transactions)
- [Autorizando Canais](#authorizing-channels)
    - [Definindo Callbacks de Autorização](#defining-authorization-callbacks)
    - [Definindo Classes de Canal](#defining-channel-classes)
- [Transmitindo Eventos](#broadcasting-events)
    - [Apenas para Outros](#only-to-others)
    - [Personalizando a Conexão](#customizing-the-connection)
    - [Eventos Anônimos](#anonymous-events)
    - [Resgatando Broadcasts](#rescuing-broadcasts)
- [Recebendo Broadcasts](#receiving-broadcasts)
    - [Escutando Eventos](#listening-for-events)
    - [Saindo de um Canal](#leaving-a-channel)
    - [Namespaces](#namespaces)
    - [Usando React, Vue ou Svelte](#using-react-or-vue)
- [Canais de Presença](#presence-channels)
    - [Autorizando Canais de Presença](#authorizing-presence-channels)
    - [Entrando em Canais de Presença](#joining-presence-channels)
    - [Transmitindo para Canais de Presença](#broadcasting-to-presence-channels)
- [Canais Privados Criptografados](#encrypted-private-channels)
- [Broadcasting de Models](#model-broadcasting)
    - [Convenções de Broadcasting de Models](#model-broadcasting-conventions)
    - [Escutando Broadcasts de Models](#listening-for-model-broadcasts)
- [Eventos de Cliente](#client-events)
- [Notificações](#notifications)

<a id="introduction"></a>
## Introdução

Em muitas aplicações web modernas, WebSockets são usados para implementar interfaces de usuário em tempo real, com atualização ao vivo. Quando algum dado é atualizado no servidor, normalmente uma mensagem é enviada por uma conexão WebSocket para ser tratada pelo cliente. WebSockets fornecem uma alternativa mais eficiente a ficar continuamente consultando o servidor da sua aplicação em busca de mudanças de dados que devem ser refletidas na sua UI.

Por exemplo, imagine que sua aplicação é capaz de exportar os dados de um usuário para um arquivo CSV e enviá-los por e-mail. No entanto, criar esse arquivo CSV leva vários minutos, então você decide criar e enviar o CSV dentro de um [job em fila](/pt-br/queues/). Quando o CSV tiver sido criado e enviado ao usuário, podemos usar o broadcasting de eventos para despachar um evento `App\Events\UserDataExported` que é recebido pelo JavaScript da nossa aplicação. Uma vez que o evento é recebido, podemos exibir uma mensagem ao usuário informando que seu CSV foi enviado por e-mail, sem que ele nunca precise atualizar a página.

Para ajudar você a construir esses tipos de funcionalidades, o Laravel torna fácil "transmitir" (broadcast) seus [eventos](/pt-br/events/) Laravel do lado do servidor por uma conexão WebSocket. Transmitir seus eventos Laravel permite que você compartilhe os mesmos nomes e dados de evento entre sua aplicação Laravel do lado do servidor e sua aplicação JavaScript do lado do cliente.

Os conceitos centrais por trás do broadcasting são simples: clientes se conectam a canais nomeados no frontend, enquanto sua aplicação Laravel transmite eventos para esses canais no backend. Esses eventos podem conter quaisquer dados adicionais que você deseje disponibilizar para o frontend.

<a id="supported-drivers"></a>
#### Drivers Suportados

Por padrão, o Laravel inclui quatro drivers de broadcasting do lado do servidor para você escolher: [Laravel Reverb](https://reverb.laravel.com), [Pusher Channels](https://pusher.com/channels), [Ably](https://ably.com) e [Mercure](https://mercure.rocks).

> **Nota:**
> Antes de mergulhar no broadcasting de eventos, certifique-se de ter lido a documentação do Laravel sobre [eventos e listeners](/pt-br/events/).

<a id="quickstart"></a>
## Início Rápido

Por padrão, o broadcasting não está habilitado em novas aplicações Laravel. Você pode habilitar o broadcasting usando o comando Artisan `install:broadcasting`:

```shell
php artisan install:broadcasting
```

O comando `install:broadcasting` perguntará qual serviço de broadcasting de eventos você gostaria de usar. Além disso, ele criará o arquivo de configuração `config/broadcasting.php` e o arquivo `routes/channels.php`, onde você pode registrar as rotas e os callbacks de autorização de broadcast da sua aplicação.

O Laravel suporta vários drivers de broadcast prontos para uso: [Laravel Reverb](/pt-br/reverb/), [Pusher Channels](https://pusher.com/channels), [Ably](https://ably.com), [Mercure](https://mercure.rocks) e um driver `log` para desenvolvimento e depuração local. Adicionalmente, um driver `null` está incluído, o que permite desabilitar o broadcasting durante testes. Um exemplo de configuração está incluído para cada um desses drivers no arquivo de configuração `config/broadcasting.php`.

Toda a configuração de broadcasting de eventos da sua aplicação é armazenada no arquivo de configuração `config/broadcasting.php`. Não se preocupe se este arquivo não existir na sua aplicação; ele será criado quando você executar o comando Artisan `install:broadcasting`.

<a id="quickstart-next-steps"></a>
#### Próximos Passos

Uma vez que você tenha habilitado o broadcasting de eventos, você está pronto para aprender mais sobre [definir eventos de broadcast](#defining-broadcast-events) e [escutar eventos](#listening-for-events). Se você estiver usando os [starter kits](/pt-br/starter-kits/) React, Vue ou Svelte do Laravel, você pode escutar eventos usando o [hook useEcho](#using-react-or-vue) do Echo.

> **Nota:**
> Antes de transmitir quaisquer eventos, você deve primeiro configurar e executar um [queue worker](/pt-br/queues/). Todo o broadcasting de eventos é feito via jobs em fila, de modo que o tempo de resposta da sua aplicação não seja seriamente afetado pelos eventos sendo transmitidos. O driver Mercure é uma exceção, pois por padrão ele [transmite eventos de forma síncrona](#mercure-synchronous-broadcasting).

<a id="server-side-installation"></a>
## Instalação no Servidor

Para começar a usar o broadcasting de eventos do Laravel, precisamos fazer algumas configurações dentro da aplicação Laravel, bem como instalar alguns pacotes.

O broadcasting de eventos é realizado por um driver de broadcasting do lado do servidor que transmite seus eventos Laravel para que o Laravel Echo (uma biblioteca JavaScript) possa recebê-los dentro do cliente no navegador. Não se preocupe - vamos percorrer cada parte do processo de instalação passo a passo.

<a id="reverb"></a>
### Reverb

Para habilitar rapidamente o suporte às funcionalidades de broadcasting do Laravel usando o Reverb como seu broadcaster de eventos, invoque o comando Artisan `install:broadcasting` com a opção `--reverb`. Este comando Artisan instalará os pacotes Composer e NPM necessários do Reverb e atualizará o arquivo `.env` da sua aplicação com as variáveis apropriadas:

```shell
php artisan install:broadcasting --reverb
```

<a id="reverb-manual-installation"></a>
#### Instalação Manual

Ao executar o comando `install:broadcasting`, será perguntado se você deseja instalar o [Laravel Reverb](/pt-br/reverb/). É claro, você também pode instalar o Reverb manualmente usando o gerenciador de pacotes Composer:

```shell
composer require laravel/reverb
```

Uma vez que o pacote estiver instalado, você pode executar o comando de instalação do Reverb para publicar a configuração, adicionar as variáveis de ambiente necessárias do Reverb e habilitar o broadcasting de eventos na sua aplicação:

```shell
php artisan reverb:install
```

Você pode encontrar instruções detalhadas de instalação e uso do Reverb na [documentação do Reverb](/pt-br/reverb/).

<a id="pusher-channels"></a>
### Pusher Channels

Para habilitar rapidamente o suporte às funcionalidades de broadcasting do Laravel usando o Pusher como seu broadcaster de eventos, invoque o comando Artisan `install:broadcasting` com a opção `--pusher`. Este comando Artisan perguntará suas credenciais do Pusher, instalará os SDKs PHP e JavaScript do Pusher e atualizará o arquivo `.env` da sua aplicação com as variáveis apropriadas:

```shell
php artisan install:broadcasting --pusher
```

<a id="pusher-manual-installation"></a>
#### Instalação Manual

Para instalar o suporte ao Pusher manualmente, você deve instalar o SDK PHP do Pusher Channels usando o gerenciador de pacotes Composer:

```shell
composer require pusher/pusher-php-server
```

Em seguida, você deve configurar suas credenciais do Pusher Channels no arquivo de configuração `config/broadcasting.php`. Um exemplo de configuração do Pusher Channels já está incluído neste arquivo, permitindo que você especifique rapidamente sua key, secret e ID da aplicação. Normalmente, você deve configurar suas credenciais do Pusher Channels no arquivo `.env` da sua aplicação:

```ini
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_APP_KEY="your-pusher-key"
PUSHER_APP_SECRET="your-pusher-secret"
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME="https"
PUSHER_APP_CLUSTER="mt1"
```

A configuração `pusher` do arquivo `config/broadcasting.php` também permite que você especifique `options` adicionais que são suportadas pelo Channels, como o cluster.

Então, defina a variável de ambiente `BROADCAST_CONNECTION` como `pusher` no arquivo `.env` da sua aplicação:

```ini
BROADCAST_CONNECTION=pusher
```

Finalmente, você está pronto para instalar e configurar o [Laravel Echo](#client-side-installation), que receberá os eventos de broadcast no lado do cliente.

<a id="pusher-manual-installation-encrypted-private-channels"></a>
#### Canais Privados Criptografados

Se você planeja usar [canais privados criptografados de ponta a ponta](#encrypted-private-channels), você deve adicionar uma opção `encryption_master_key_base64` contendo uma chave de 32 bytes codificada em base64 ao array `options` da conexão `pusher`:

```php
'options' => [
    // ...
    'encryption_master_key_base64' => env('PUSHER_ENCRYPTION_MASTER_KEY'),
],
```

Você pode gerar uma chave adequada usando o comando `openssl`:

```shell
openssl rand -base64 32
```

<a id="ably"></a>
### Ably

> **Nota:**
> A documentação abaixo discute como usar o Ably no modo de "compatibilidade com Pusher". No entanto, a equipe do Ably recomenda e mantém um broadcaster e um cliente Echo que são capazes de tirar proveito das capacidades únicas oferecidas pelo Ably. Para mais informações sobre o uso dos drivers mantidos pelo Ably, por favor [consulte a documentação do broadcaster Laravel do Ably](https://github.com/ably/laravel-broadcaster).

Para habilitar rapidamente o suporte às funcionalidades de broadcasting do Laravel usando o [Ably](https://ably.com) como seu broadcaster de eventos, invoque o comando Artisan `install:broadcasting` com a opção `--ably`. Este comando Artisan perguntará suas credenciais do Ably, instalará os SDKs PHP e JavaScript do Ably e atualizará o arquivo `.env` da sua aplicação com as variáveis apropriadas:

```shell
php artisan install:broadcasting --ably
```

**Antes de continuar, você deve habilitar o suporte ao protocolo Pusher nas configurações da sua aplicação Ably. Você pode habilitar este recurso na seção "Protocol Adapter Settings" do dashboard de configurações da sua aplicação Ably.**

<a id="ably-manual-installation"></a>
#### Instalação Manual

Para instalar o suporte ao Ably manualmente, você deve instalar o SDK PHP do Ably usando o gerenciador de pacotes Composer:

```shell
composer require ably/ably-php
```

Em seguida, você deve configurar suas credenciais do Ably no arquivo de configuração `config/broadcasting.php`. Um exemplo de configuração do Ably já está incluído neste arquivo, permitindo que você especifique rapidamente sua key. Normalmente, esse valor deve ser definido via a variável de ambiente `ABLY_KEY` [variável de ambiente](/pt-br/configuration/#environment-configuration):

```ini
ABLY_KEY=your-ably-key
```

Então, defina a variável de ambiente `BROADCAST_CONNECTION` como `ably` no arquivo `.env` da sua aplicação:

```ini
BROADCAST_CONNECTION=ably
```

Finalmente, você está pronto para instalar e configurar o [Laravel Echo](#client-side-installation), que receberá os eventos de broadcast no lado do cliente.

<a id="mercure"></a>
### Mercure

Para habilitar rapidamente o suporte às funcionalidades de broadcasting do Laravel usando o Mercure como seu broadcaster de eventos, invoque o comando Artisan `install:broadcasting` com a opção `--mercure`. Este comando Artisan perguntará suas credenciais do Mercure, instalará os SDKs PHP e JavaScript do Mercure e atualizará o arquivo `.env` da sua aplicação com as variáveis apropriadas:

```shell
php artisan install:broadcasting --mercure
```

<a id="mercure-manual-installation"></a>
#### Instalação Manual

Para instalar o suporte ao Mercure manualmente, você deve instalar o componente Symfony Mercure e a biblioteca JWT:

```shell
composer require symfony/mercure:^0.8 web-token/jwt-library:^4.1
```

Em seguida, você deve configurar a conexão Mercure no arquivo `.env` da sua aplicação:

```ini
BROADCAST_CONNECTION=mercure

MERCURE_URL=https://mercure.example.com/.well-known/mercure
MERCURE_PUBLIC_URL=https://mercure.example.com/.well-known/mercure
MERCURE_JWT_SECRET=<your-mercure-jwt-secret>
```

O valor `MERCURE_URL` é a URL que o Laravel usa para publicar atualizações, enquanto `MERCURE_PUBLIC_URL` é a URL que os clientes no navegador usam para se inscrever. Seu hub Mercure deve ser configurado com o mesmo segredo JWT.

Para usar [canais privados criptografados de ponta a ponta](#encrypted-private-channels), configure uma variável de ambiente `MERCURE_ENCRYPTION_KEY` de 32 bytes:

```ini
MERCURE_ENCRYPTION_KEY=<your-32-byte-encryption-key>
```

Finalmente, você está pronto para instalar e configurar o [Laravel Echo](#client-side-installation), que receberá os eventos de broadcast no lado do cliente.

<a id="mercure-frankenphp"></a>
#### Hub Embutido do FrankenPHP

O [FrankenPHP](https://frankenphp.dev) inclui um hub Mercure embutido. Quando sua aplicação é servida pelo FrankenPHP, você pode deixar as variáveis de ambiente `MERCURE_URL` e `MERCURE_PUBLIC_URL` vazias. O Laravel então publica atualizações diretamente no hub, sem nenhuma requisição HTTP, e os navegadores se inscrevem em `/.well-known/mercure` no domínio da sua aplicação. Ao usar o [Laravel Octane](/pt-br/octane/), o hub embutido é configurado automaticamente.

Publicar diretamente no hub embutido só é possível a partir de requisições servidas pelo FrankenPHP. Para transmitir eventos a partir de outros processos, como comandos Artisan ou queue workers, configure a URL do hub:

```ini
MERCURE_URL="${APP_URL}/.well-known/mercure"
```

<a id="mercure-synchronous-broadcasting"></a>
#### Broadcasting Síncrono

Diferentemente de outros drivers, o driver Mercure transmite eventos imediatamente em vez de enfileirá-los, portanto ele não requer um queue worker. Publicar uma atualização é rápido, já que o hub a despacha para os assinantes de forma assíncrona. Para transmitir eventos usando sua [fila](#broadcast-queue), defina a variável de ambiente `MERCURE_ASYNC` como `true`:

```ini
MERCURE_ASYNC=true
```

Como os queue workers publicam atualizações via HTTP, `MERCURE_ASYNC` requer a variável de ambiente `MERCURE_URL`. Ao usar o hub embutido do FrankenPHP, defina-a como a URL do hub, [conforme descrito acima](#mercure-frankenphp).

<a id="client-side-installation"></a>
## Instalação no Cliente

<a id="client-reverb"></a>
### Reverb

O [Laravel Echo](https://github.com/laravel/echo) é uma biblioteca JavaScript que torna indolor se inscrever em canais e escutar eventos transmitidos pelo seu driver de broadcasting do lado do servidor.

Ao instalar o Laravel Reverb via o comando Artisan `install:broadcasting`, a estrutura e a configuração do Reverb e do Echo serão injetadas automaticamente na sua aplicação. No entanto, se você desejar configurar o Laravel Echo manualmente, você pode fazê-lo seguindo as instruções abaixo.

<a id="reverb-client-manual-installation"></a>
#### Instalação Manual

Para configurar manualmente o Laravel Echo para o frontend da sua aplicação, primeiro instale o pacote `pusher-js`, já que o Reverb utiliza o protocolo Pusher para inscrições, canais e mensagens WebSocket:

```shell
npm install --save-dev laravel-echo pusher-js
```

Uma vez que o Echo estiver instalado, você está pronto para criar uma nova instância do Echo no JavaScript da sua aplicação. Um ótimo lugar para fazer isso é no final do arquivo `resources/js/app.js` que vem incluído com o framework Laravel:

```js tab=JavaScript
import Echo from 'laravel-echo';

import Pusher from 'pusher-js';
window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
});
```

```js tab=React
import { configureEcho } from "@laravel/echo-react";

configureEcho({
    broadcaster: "reverb",
    // key: import.meta.env.VITE_REVERB_APP_KEY,
    // wsHost: import.meta.env.VITE_REVERB_HOST,
    // wsPort: import.meta.env.VITE_REVERB_PORT,
    // wssPort: import.meta.env.VITE_REVERB_PORT,
    // forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    // enabledTransports: ['ws', 'wss'],
});
```

```js tab=Vue
import { configureEcho } from "@laravel/echo-vue";

configureEcho({
    broadcaster: "reverb",
    // key: import.meta.env.VITE_REVERB_APP_KEY,
    // wsHost: import.meta.env.VITE_REVERB_HOST,
    // wsPort: import.meta.env.VITE_REVERB_PORT,
    // wssPort: import.meta.env.VITE_REVERB_PORT,
    // forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    // enabledTransports: ['ws', 'wss'],
});
```

```js tab=Svelte
import { configureEcho } from "@laravel/echo-svelte";

configureEcho({
    broadcaster: "reverb",
    // key: import.meta.env.VITE_REVERB_APP_KEY,
    // wsHost: import.meta.env.VITE_REVERB_HOST,
    // wsPort: import.meta.env.VITE_REVERB_PORT,
    // wssPort: import.meta.env.VITE_REVERB_PORT,
    // forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    // enabledTransports: ['ws', 'wss'],
});
```

Em seguida, você deve compilar os assets da sua aplicação:

```shell
npm run build
```

> **Aviso:**
> O broadcaster `reverb` do Laravel Echo requer laravel-echo v1.16.0+.

<a id="client-pusher-channels"></a>
### Pusher Channels

O [Laravel Echo](https://github.com/laravel/echo) é uma biblioteca JavaScript que torna indolor se inscrever em canais e escutar eventos transmitidos pelo seu driver de broadcasting do lado do servidor.

Ao instalar o suporte a broadcasting via o comando Artisan `install:broadcasting --pusher`, a estrutura e a configuração do Pusher e do Echo serão injetadas automaticamente na sua aplicação. No entanto, se você desejar configurar o Laravel Echo manualmente, você pode fazê-lo seguindo as instruções abaixo.

<a id="pusher-client-manual-installation"></a>
#### Instalação Manual

Para configurar manualmente o Laravel Echo para o frontend da sua aplicação, primeiro instale os pacotes `laravel-echo` e `pusher-js`, que utilizam o protocolo Pusher para inscrições, canais e mensagens WebSocket:

```shell
npm install --save-dev laravel-echo pusher-js
```

Uma vez que o Echo estiver instalado, você está pronto para criar uma nova instância do Echo no arquivo `resources/js/app.js` da sua aplicação:

```js tab=JavaScript
import Echo from 'laravel-echo';

import Pusher from 'pusher-js';
window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true
});
```

```js tab=React
import { configureEcho } from "@laravel/echo-react";

configureEcho({
    broadcaster: "pusher",
    // key: import.meta.env.VITE_PUSHER_APP_KEY,
    // cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    // forceTLS: true,
    // wsHost: import.meta.env.VITE_PUSHER_HOST,
    // wsPort: import.meta.env.VITE_PUSHER_PORT,
    // wssPort: import.meta.env.VITE_PUSHER_PORT,
    // enabledTransports: ["ws", "wss"],
});
```

```js tab=Vue
import { configureEcho } from "@laravel/echo-vue";

configureEcho({
    broadcaster: "pusher",
    // key: import.meta.env.VITE_PUSHER_APP_KEY,
    // cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    // forceTLS: true,
    // wsHost: import.meta.env.VITE_PUSHER_HOST,
    // wsPort: import.meta.env.VITE_PUSHER_PORT,
    // wssPort: import.meta.env.VITE_PUSHER_PORT,
    // enabledTransports: ["ws", "wss"],
});
```

```js tab=Svelte
import { configureEcho } from "@laravel/echo-svelte";

configureEcho({
    broadcaster: "pusher",
    // key: import.meta.env.VITE_PUSHER_APP_KEY,
    // cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    // forceTLS: true,
    // wsHost: import.meta.env.VITE_PUSHER_HOST,
    // wsPort: import.meta.env.VITE_PUSHER_PORT,
    // wssPort: import.meta.env.VITE_PUSHER_PORT,
    // enabledTransports: ["ws", "wss"],
});
```

Em seguida, você deve definir os valores apropriados para as variáveis de ambiente do Pusher no arquivo `.env` da sua aplicação. Se essas variáveis ainda não existirem no seu arquivo `.env`, você deve adicioná-las:

```ini
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_APP_KEY="your-pusher-key"
PUSHER_APP_SECRET="your-pusher-secret"
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME="https"
PUSHER_APP_CLUSTER="mt1"

VITE_APP_NAME="${APP_NAME}"
VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
VITE_PUSHER_HOST="${PUSHER_HOST}"
VITE_PUSHER_PORT="${PUSHER_PORT}"
VITE_PUSHER_SCHEME="${PUSHER_SCHEME}"
VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
```

Uma vez que você tenha ajustado a configuração do Echo de acordo com as necessidades da sua aplicação, você pode compilar os assets da sua aplicação:

```shell
npm run build
```

> **Nota:**
> Para aprender mais sobre a compilação dos assets JavaScript da sua aplicação, por favor consulte a documentação sobre o [Vite](/pt-br/vite/).

<a id="using-an-existing-client-instance"></a>
#### Usando uma Instância de Cliente Existente

Se você já tem uma instância de cliente do Pusher Channels pré-configurada que gostaria que o Echo utilizasse, você pode passá-la ao Echo via a opção de configuração `client`:

```js
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

const options = {
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY
}

window.Echo = new Echo({
    ...options,
    client: new Pusher(options.key, options)
});
```

<a id="client-ably"></a>
### Ably

> **Nota:**
> A documentação abaixo discute como usar o Ably no modo de "compatibilidade com Pusher". No entanto, a equipe do Ably recomenda e mantém um broadcaster e um cliente Echo que são capazes de tirar proveito das capacidades únicas oferecidas pelo Ably. Para mais informações sobre o uso dos drivers mantidos pelo Ably, por favor [consulte a documentação do broadcaster Laravel do Ably](https://github.com/ably/laravel-broadcaster).

O [Laravel Echo](https://github.com/laravel/echo) é uma biblioteca JavaScript que torna indolor se inscrever em canais e escutar eventos transmitidos pelo seu driver de broadcasting do lado do servidor.

Ao instalar o suporte a broadcasting via o comando Artisan `install:broadcasting --ably`, a estrutura e a configuração do Ably e do Echo serão injetadas automaticamente na sua aplicação. No entanto, se você desejar configurar o Laravel Echo manualmente, você pode fazê-lo seguindo as instruções abaixo.

<a id="ably-client-manual-installation"></a>
#### Instalação Manual

Para configurar manualmente o Laravel Echo para o frontend da sua aplicação, primeiro instale os pacotes `laravel-echo` e `pusher-js`, que utilizam o protocolo Pusher para inscrições, canais e mensagens WebSocket:

```shell
npm install --save-dev laravel-echo pusher-js
```

**Antes de continuar, você deve habilitar o suporte ao protocolo Pusher nas configurações da sua aplicação Ably. Você pode habilitar este recurso na seção "Protocol Adapter Settings" do dashboard de configurações da sua aplicação Ably.**

Uma vez que o Echo estiver instalado, você está pronto para criar uma nova instância do Echo no arquivo `resources/js/app.js` da sua aplicação:

```js tab=JavaScript
import Echo from 'laravel-echo';

import Pusher from 'pusher-js';
window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_ABLY_PUBLIC_KEY,
    wsHost: 'realtime-pusher.ably.io',
    wsPort: 443,
    disableStats: true,
    encrypted: true,
});
```

```js tab=React
import { configureEcho } from "@laravel/echo-react";

configureEcho({
    broadcaster: "ably",
    // key: import.meta.env.VITE_ABLY_PUBLIC_KEY,
    // wsHost: "realtime-pusher.ably.io",
    // wsPort: 443,
    // disableStats: true,
    // encrypted: true,
});
```

```js tab=Vue
import { configureEcho } from "@laravel/echo-vue";

configureEcho({
    broadcaster: "ably",
    // key: import.meta.env.VITE_ABLY_PUBLIC_KEY,
    // wsHost: "realtime-pusher.ably.io",
    // wsPort: 443,
    // disableStats: true,
    // encrypted: true,
});
```

```js tab=Svelte
import { configureEcho } from "@laravel/echo-svelte";

configureEcho({
    broadcaster: "ably",
    // key: import.meta.env.VITE_ABLY_PUBLIC_KEY,
    // wsHost: "realtime-pusher.ably.io",
    // wsPort: 443,
    // disableStats: true,
    // encrypted: true,
});
```

Você pode ter notado que nossa configuração do Echo para o Ably referencia uma variável de ambiente `VITE_ABLY_PUBLIC_KEY`. O valor dessa variável deve ser sua chave pública do Ably. Sua chave pública é a parte da sua chave do Ably que ocorre antes do caractere `:`.

Uma vez que você tenha ajustado a configuração do Echo de acordo com suas necessidades, você pode compilar os assets da sua aplicação:

```shell
npm run dev
```

> **Nota:**
> Para aprender mais sobre a compilação dos assets JavaScript da sua aplicação, por favor consulte a documentação sobre o [Vite](/pt-br/vite/).

<a id="client-mercure"></a>
### Mercure

Para usar o Mercure com o Laravel Echo, instale o pacote `laravel-echo`:

```shell
npm install --save-dev laravel-echo
```

Em seguida, crie uma instância do Echo com o broadcaster `mercure`. A opção `host` tem como padrão `/.well-known/mercure` na origem atual:

```js tab=JavaScript
import Echo from 'laravel-echo';

window.Echo = new Echo({
    broadcaster: 'mercure',
    host: import.meta.env.VITE_MERCURE_HUB_URL,
});
```

```js tab=React
import { configureEcho } from "@laravel/echo-react";

configureEcho({
    broadcaster: "mercure",
});
```

```js tab=Vue
import { configureEcho } from "@laravel/echo-vue";

configureEcho({
    broadcaster: "mercure",
});
```

```js tab=Svelte
import { configureEcho } from "@laravel/echo-svelte";

configureEcho({
    broadcaster: "mercure",
});
```

Defina a URL do hub no seu arquivo `.env`:

```ini
VITE_MERCURE_HUB_URL="${MERCURE_PUBLIC_URL}"
```

<a id="concept-overview"></a>
## Visão Geral dos Conceitos

O broadcasting de eventos do Laravel permite que você transmita seus eventos Laravel do lado do servidor para sua aplicação JavaScript do lado do cliente usando uma abordagem baseada em drivers. Atualmente, o Laravel vem com os drivers [Laravel Reverb](https://reverb.laravel.com), [Pusher Channels](https://pusher.com/channels), [Ably](https://ably.com) e [Mercure](https://mercure.rocks). Os eventos podem ser facilmente consumidos no lado do cliente usando o pacote JavaScript [Laravel Echo](#client-side-installation).

Os eventos são transmitidos por "canais", que podem ser especificados como públicos ou privados. Qualquer visitante da sua aplicação pode se inscrever em um canal público sem qualquer autenticação ou autorização; no entanto, para se inscrever em um canal privado, um usuário deve estar autenticado e autorizado a escutar naquele canal.

<a id="using-example-application"></a>
### Usando uma Aplicação de Exemplo

Antes de mergulhar em cada componente do broadcasting de eventos, vamos dar uma visão geral de alto nível usando uma loja de e-commerce como exemplo.

Em nossa aplicação, vamos assumir que temos uma página que permite aos usuários visualizar o status de envio de seus pedidos. Vamos também assumir que um evento `OrderShipmentStatusUpdated` é disparado quando uma atualização de status de envio é processada pela aplicação:

```php
use App\Events\OrderShipmentStatusUpdated;

OrderShipmentStatusUpdated::dispatch($order);
```

<a id="the-shouldbroadcast-interface"></a>
#### A Interface `ShouldBroadcast`

Quando um usuário está visualizando um de seus pedidos, não queremos que ele tenha que atualizar a página para ver as atualizações de status. Em vez disso, queremos transmitir as atualizações para a aplicação à medida que elas são criadas. Então, precisamos marcar o evento `OrderShipmentStatusUpdated` com a interface `ShouldBroadcast`. Isso instruirá o Laravel a transmitir o evento quando ele for disparado:

```php
<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class OrderShipmentStatusUpdated implements ShouldBroadcast
{
    /**
     * The order instance.
     *
     * @var \App\Models\Order
     */
    public $order;
}
```

A interface `ShouldBroadcast` requer que nosso evento defina um método `broadcastOn`. Este método é responsável por retornar os canais nos quais o evento deve ser transmitido. Um stub vazio deste método já está definido nas classes de evento geradas, então só precisamos preencher seus detalhes. Queremos que apenas o criador do pedido seja capaz de ver as atualizações de status, então transmitiremos o evento em um canal privado que está vinculado ao pedido:

```php
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;

/**
 * Get the channel the event should broadcast on.
 */
public function broadcastOn(): Channel
{
    return new PrivateChannel('orders.'.$this->order->id);
}
```

Se você deseja que o evento seja transmitido em múltiplos canais, você pode retornar um `array`:

```php
use Illuminate\Broadcasting\PrivateChannel;

/**
 * Get the channels the event should broadcast on.
 *
 * @return array<int, \Illuminate\Broadcasting\Channel>
 */
public function broadcastOn(): array
{
    return [
        new PrivateChannel('orders.'.$this->order->id),
        // ...
    ];
}
```

<a id="example-application-authorizing-channels"></a>
#### Autorizando Canais

Lembre-se, os usuários devem estar autorizados a escutar em canais privados. Podemos definir nossas regras de autorização de canal no arquivo `routes/channels.php` da nossa aplicação. Neste exemplo, precisamos verificar que qualquer usuário tentando escutar no canal privado `orders.1` é de fato o criador do pedido:

```php
use App\Models\Order;
use App\Models\User;

Broadcast::channel('orders.{orderId}', function (User $user, int $orderId) {
    return $user->id === Order::findOrNew($orderId)->user_id;
});
```

O método `channel` aceita dois argumentos: o nome do canal e um callback que retorna `true` ou `false` indicando se o usuário está autorizado a escutar no canal.

Todos os callbacks de autorização recebem o usuário atualmente autenticado como seu primeiro argumento e quaisquer parâmetros curinga adicionais como seus argumentos subsequentes. Neste exemplo, estamos usando o placeholder `{orderId}` para indicar que a porção "ID" do nome do canal é um curinga.

<a id="listening-for-event-broadcasts"></a>
#### Escutando Broadcasts de Eventos

Em seguida, tudo o que resta é escutar o evento em nossa aplicação JavaScript. Podemos fazer isso usando o [Laravel Echo](#client-side-installation). Os hooks integrados de React, Vue e Svelte do Laravel Echo tornam simples começar, e, por padrão, todas as propriedades públicas do evento serão incluídas no evento de broadcast:

```js tab=React
import { useEcho } from "@laravel/echo-react";

useEcho(
    `orders.${orderId}`,
    "OrderShipmentStatusUpdated",
    (e) => {
        console.log(e.order);
    },
);
```

```vue tab=Vue
<script setup lang="ts">
import { useEcho } from "@laravel/echo-vue";

useEcho(
    `orders.${orderId}`,
    "OrderShipmentStatusUpdated",
    (e) => {
        console.log(e.order);
    },
);
</script>
```

```svelte tab=Svelte
<script>
import { useEcho } from "@laravel/echo-svelte";

useEcho(
    `orders.${orderId}`,
    "OrderShipmentStatusUpdated",
    (e) => {
        console.log(e.order);
    },
);
</script>
```

<a id="defining-broadcast-events"></a>
## Definindo Eventos de Broadcast

Para informar ao Laravel que um determinado evento deve ser transmitido, você deve implementar a interface `Illuminate\Contracts\Broadcasting\ShouldBroadcast` na classe do evento. Essa interface já está importada em todas as classes de evento geradas pelo framework, então você pode facilmente adicioná-la a qualquer um dos seus eventos.

A interface `ShouldBroadcast` requer que você implemente um único método: `broadcastOn`. O método `broadcastOn` deve retornar um canal ou um array de canais nos quais o evento deve ser transmitido. Os canais devem ser instâncias de `Channel`, `PrivateChannel` ou `PresenceChannel`. Instâncias de `Channel` representam canais públicos nos quais qualquer usuário pode se inscrever, enquanto `PrivateChannels` e `PresenceChannels` representam canais privados que requerem [autorização de canal](#authorizing-channels):

```php
<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class ServerCreated implements ShouldBroadcast
{
    use SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public User $user,
    ) {}

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.'.$this->user->id),
        ];
    }
}
```

Após implementar a interface `ShouldBroadcast`, você só precisa [disparar o evento](/pt-br/events/) como normalmente faria. Uma vez que o evento tenha sido disparado, um [job em fila](/pt-br/queues/) transmitirá automaticamente o evento usando o driver de broadcast especificado.

<a id="broadcast-name"></a>
### Nome do Broadcast

Por padrão, o Laravel transmitirá o evento usando o nome da classe do evento. No entanto, você pode personalizar o nome do broadcast definindo um método `broadcastAs` no evento:

```php
/**
 * The event's broadcast name.
 */
public function broadcastAs(): string
{
    return 'server.created';
}
```

Se você personalizar o nome do broadcast usando o método `broadcastAs`, você deve se certificar de registrar seu listener com um caractere `.` inicial. Isso instruirá o Echo a não prefixar o namespace da aplicação ao evento:

```js
.listen('.server.created', function (e) {
    // ...
});
```

<a id="broadcast-data"></a>
### Dados do Broadcast

Quando um evento é transmitido, todas as suas propriedades `public` são automaticamente serializadas e transmitidas como o payload do evento, permitindo que você acesse qualquer um de seus dados públicos a partir da sua aplicação JavaScript. Então, por exemplo, se seu evento tiver uma única propriedade pública `$user` que contém um model Eloquent, o payload de broadcast do evento seria:

```json
{
    "user": {
        "id": 1,
        "name": "Patrick Stewart"
        ...
    }
}
```

No entanto, se você desejar ter um controle mais refinado sobre o payload do seu broadcast, você pode adicionar um método `broadcastWith` ao seu evento. Este método deve retornar o array de dados que você deseja transmitir como o payload do evento:

```php
/**
 * Get the data to broadcast.
 *
 * @return array<string, mixed>
 */
public function broadcastWith(): array
{
    return ['id' => $this->user->id];
}
```

<a id="broadcast-queue"></a>
### Fila do Broadcast

Por padrão, cada evento de broadcast é colocado na fila padrão para a conexão de fila padrão especificada no seu arquivo de configuração `queue.php`. Você pode personalizar a conexão e o nome da fila usados pelo broadcaster usando os atributos `Connection` e `Queue` na sua classe de evento:

```php
use Illuminate\Queue\Attributes\Connection;
use Illuminate\Queue\Attributes\Queue;

#[Connection('redis')]
#[Queue('default')]
class ServerCreated implements ShouldBroadcast
{
    // ...
}
```

Alternativamente, você pode personalizar o nome da fila definindo um método `broadcastQueue` no seu evento:

```php
/**
 * The name of the queue on which to place the broadcasting job.
 */
public function broadcastQueue(): string
{
    return 'default';
}
```

Se você gostaria que todos os seus eventos de broadcast usassem a mesma fila sem personalizar cada classe de evento, você pode em vez disso [rotear o contract `ShouldBroadcast` para uma fila](/pt-br/queues/#queue-routing).

Se você gostaria de transmitir seu evento usando a fila `sync` em vez do driver de fila padrão, você pode implementar a interface `ShouldBroadcastNow` em vez de `ShouldBroadcast`:

```php
<?php

namespace App\Events;

use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class OrderShipmentStatusUpdated implements ShouldBroadcastNow
{
    // ...
}
```

<a id="broadcast-conditions"></a>
### Condições do Broadcast

Às vezes você quer transmitir seu evento apenas se uma determinada condição for verdadeira. Você pode definir essas condições adicionando um método `broadcastWhen` à sua classe de evento:

```php
/**
 * Determine if this event should broadcast.
 */
public function broadcastWhen(): bool
{
    return $this->order->value > 100;
}
```

<a id="broadcasting-and-database-transactions"></a>
#### Broadcasting e Transações de Banco de Dados

Quando eventos de broadcast são despachados dentro de transações de banco de dados, eles podem ser processados pela fila antes que a transação de banco de dados tenha sido commitada. Quando isso acontece, quaisquer atualizações que você tenha feito em models ou registros de banco de dados durante a transação podem ainda não estar refletidas no banco de dados. Além disso, quaisquer models ou registros de banco de dados criados dentro da transação podem não existir no banco de dados. Se o seu evento depender desses models, erros inesperados podem ocorrer quando o job que transmite o evento for processado.

Se a opção de configuração `after_commit` da conexão da sua fila estiver definida como `false`, você ainda pode indicar que um evento de broadcast específico deve ser despachado após todas as transações de banco de dados abertas terem sido commitadas, implementando a interface `ShouldDispatchAfterCommit` na classe do evento:

```php
<?php

namespace App\Events;

use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Queue\SerializesModels;

class ServerCreated implements ShouldBroadcast, ShouldDispatchAfterCommit
{
    use SerializesModels;
}
```

> **Nota:**
> Para aprender mais sobre como contornar esses problemas, por favor revise a documentação sobre [jobs em fila e transações de banco de dados](/pt-br/queues/#jobs-and-database-transactions).

<a id="authorizing-channels"></a>
## Autorizando Canais

Canais privados requerem que você autorize que o usuário atualmente autenticado pode de fato escutar no canal. Isso é realizado fazendo uma requisição HTTP à sua aplicação Laravel com o nome do canal e permitindo que sua aplicação determine se o usuário pode escutar naquele canal. Ao usar o [Laravel Echo](#client-side-installation), a requisição HTTP para autorizar inscrições em canais privados será feita automaticamente.

Quando o broadcasting é instalado, o Laravel tenta registrar automaticamente a rota `/broadcasting/auth` para tratar as requisições de autorização. Se o Laravel falhar ao registrar essas rotas automaticamente, você pode registrá-las manualmente no arquivo `/bootstrap/app.php` da sua aplicação:

```php
->withRouting(
    web: __DIR__.'/../routes/web.php',
    channels: __DIR__.'/../routes/channels.php',
    health: '/up',
)
```

<a id="defining-authorization-callbacks"></a>
### Definindo Callbacks de Autorização

Em seguida, precisamos definir a lógica que realmente determinará se o usuário atualmente autenticado pode escutar um determinado canal. Isso é feito no arquivo `routes/channels.php` que foi criado pelo comando Artisan `install:broadcasting`. Neste arquivo, você pode usar o método `Broadcast::channel` para registrar callbacks de autorização de canal:

```php
use App\Models\User;

Broadcast::channel('orders.{orderId}', function (User $user, int $orderId) {
    return $user->id === Order::findOrNew($orderId)->user_id;
});
```

O método `channel` aceita dois argumentos: o nome do canal e um callback que retorna `true` ou `false` indicando se o usuário está autorizado a escutar no canal.

Todos os callbacks de autorização recebem o usuário atualmente autenticado como seu primeiro argumento e quaisquer parâmetros curinga adicionais como seus argumentos subsequentes. Neste exemplo, estamos usando o placeholder `{orderId}` para indicar que a porção "ID" do nome do canal é um curinga.

Você pode visualizar uma lista dos callbacks de autorização de broadcast da sua aplicação usando o comando Artisan `channel:list`:

```shell
php artisan channel:list
```

<a id="authorization-callback-model-binding"></a>
#### Model Binding em Callback de Autorização

Assim como as rotas HTTP, as rotas de canal também podem tirar proveito do [route model binding](/pt-br/routing/#route-model-binding) implícito e explícito. Por exemplo, em vez de receber um ID de pedido como string ou numérico, você pode solicitar uma instância real de model `Order`:

```php
use App\Models\Order;
use App\Models\User;

Broadcast::channel('orders.{order}', function (User $user, Order $order) {
    return $user->id === $order->user_id;
});
```

> **Aviso:**
> Diferentemente do model binding de rotas HTTP, o model binding de canal não suporta o [scoping de model binding implícito](/pt-br/routing/#implicit-model-binding-scoping) automático. No entanto, isso raramente é um problema porque a maioria dos canais pode ser escopada com base na chave primária única de um único model.

<a id="authorization-callback-authentication"></a>
#### Autenticação em Callback de Autorização

Canais de broadcast privados e de presença autenticam o usuário atual via o guard de autenticação padrão da sua aplicação. Se o usuário não estiver autenticado, a autorização de canal é automaticamente negada e o callback de autorização nunca é executado. No entanto, você pode atribuir múltiplos guards personalizados que devem autenticar a requisição recebida, se necessário:

```php
Broadcast::channel('channel', function () {
    // ...
}, ['guards' => ['web', 'admin']]);
```

<a id="defining-channel-classes"></a>
### Definindo Classes de Canal

Se sua aplicação está consumindo muitos canais diferentes, seu arquivo `routes/channels.php` pode ficar volumoso. Então, em vez de usar closures para autorizar canais, você pode usar classes de canal. Para gerar uma classe de canal, use o comando Artisan `make:channel`. Este comando colocará uma nova classe de canal no diretório `App/Broadcasting`.

```shell
php artisan make:channel OrderChannel
```

Em seguida, registre seu canal no arquivo `routes/channels.php`:

```php
use App\Broadcasting\OrderChannel;

Broadcast::channel('orders.{order}', OrderChannel::class);
```

Finalmente, você pode colocar a lógica de autorização do seu canal no método `join` da classe de canal. Este método `join` abrigará a mesma lógica que você normalmente teria colocado na closure de autorização de canal. Você também pode tirar proveito do model binding de canal:

```php
<?php

namespace App\Broadcasting;

use App\Models\Order;
use App\Models\User;

class OrderChannel
{
    /**
     * Create a new channel instance.
     */
    public function __construct() {}

    /**
     * Authenticate the user's access to the channel.
     */
    public function join(User $user, Order $order): array|bool
    {
        return $user->id === $order->user_id;
    }
}
```

> **Nota:**
> Como muitas outras classes no Laravel, as classes de canal serão automaticamente resolvidas pelo [service container](/pt-br/container/). Então, você pode fazer type-hint de quaisquer dependências requeridas pelo seu canal em seu construtor.

<a id="broadcasting-events"></a>
## Transmitindo Eventos

Uma vez que você tenha definido um evento e o marcado com a interface `ShouldBroadcast`, você só precisa disparar o evento usando o método dispatch do evento. O dispatcher de eventos notará que o evento está marcado com a interface `ShouldBroadcast` e colocará o evento na fila para broadcasting:

```php
use App\Events\OrderShipmentStatusUpdated;

OrderShipmentStatusUpdated::dispatch($order);
```

<a id="only-to-others"></a>
### Apenas para Outros

Ao construir uma aplicação que utiliza broadcasting de eventos, você pode ocasionalmente precisar transmitir um evento para todos os assinantes de um determinado canal, exceto o usuário atual. Você pode realizar isso usando o helper `broadcast` e o método `toOthers`:

```php
use App\Events\OrderShipmentStatusUpdated;

broadcast(new OrderShipmentStatusUpdated($update))->toOthers();
```

Para entender melhor quando você pode querer usar o método `toOthers`, vamos imaginar uma aplicação de lista de tarefas onde um usuário pode criar uma nova tarefa inserindo um nome de tarefa. Para criar uma tarefa, sua aplicação pode fazer uma requisição a uma URL `/task` que transmite a criação da tarefa e retorna uma representação JSON da nova tarefa. Quando sua aplicação JavaScript recebe a resposta do endpoint, ela pode inserir diretamente a nova tarefa em sua lista de tarefas, assim:

```js
axios.post('/task', task)
    .then((response) => {
        this.tasks.push(response.data);
    });
```

No entanto, lembre-se de que também transmitimos a criação da tarefa. Se sua aplicação JavaScript também estiver escutando esse evento para adicionar tarefas à lista de tarefas, você terá tarefas duplicadas em sua lista: uma do endpoint e uma do broadcast. Você pode resolver isso usando o método `toOthers` para instruir o broadcaster a não transmitir o evento para o usuário atual.

> **Aviso:**
> Seu evento deve usar a trait `Illuminate\Broadcasting\InteractsWithSockets` para poder chamar o método `toOthers`.

<a id="only-to-others-configuration"></a>
#### Configuração

Quando você inicializa uma instância do Laravel Echo, um socket ID é atribuído à conexão. Se você estiver usando uma instância global do [Axios](https://github.com/axios/axios) para fazer requisições HTTP a partir da sua aplicação JavaScript, o socket ID será automaticamente anexado a cada requisição de saída como um header `X-Socket-ID`. Então, quando você chama o método `toOthers`, o Laravel extrairá o socket ID do header e instruirá o broadcaster a não transmitir para quaisquer conexões com aquele socket ID.

Se você não estiver usando uma instância global do Axios, você precisará configurar manualmente sua aplicação JavaScript para enviar o header `X-Socket-ID` com todas as requisições de saída. Você pode recuperar o socket ID usando o método `Echo.socketId`:

```js
var socketId = Echo.socketId();
```

<a id="customizing-the-connection"></a>
### Personalizando a Conexão

Se sua aplicação interage com múltiplas conexões de broadcast e você quer transmitir um evento usando um broadcaster diferente do padrão, você pode especificar para qual conexão enviar um evento usando o método `via`:

```php
use App\Events\OrderShipmentStatusUpdated;

broadcast(new OrderShipmentStatusUpdated($update))->via('pusher');
```

Alternativamente, você pode especificar a conexão de broadcast do evento chamando o método `broadcastVia` dentro do construtor do evento. No entanto, antes de fazer isso, você deve garantir que a classe de evento usa a trait `InteractsWithBroadcasting`:

```php
<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithBroadcasting;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class OrderShipmentStatusUpdated implements ShouldBroadcast
{
    use InteractsWithBroadcasting;

    /**
     * Create a new event instance.
     */
    public function __construct()
    {
        $this->broadcastVia('pusher');
    }
}
```

<a id="anonymous-events"></a>
### Eventos Anônimos

Às vezes, você pode querer transmitir um evento simples para o frontend da sua aplicação sem criar uma classe de evento dedicada. Para acomodar isso, a facade `Broadcast` permite que você transmita "eventos anônimos":

```php
Broadcast::on('orders.'.$order->id)->send();
```

O exemplo acima transmitirá o seguinte evento:

```json
{
    "event": "AnonymousEvent",
    "data": "[]",
    "channel": "orders.1"
}
```

Usando os métodos `as` e `with`, você pode personalizar o nome e os dados do evento:

```php
Broadcast::on('orders.'.$order->id)
    ->as('OrderPlaced')
    ->with($order)
    ->send();
```

O exemplo acima transmitirá um evento como o seguinte:

```json
{
    "event": "OrderPlaced",
    "data": "{ id: 1, total: 100 }",
    "channel": "orders.1"
}
```

Se você gostaria de transmitir o evento anônimo em um canal privado ou de presença, você pode utilizar os métodos `private` e `presence`:

```php
Broadcast::private('orders.'.$order->id)->send();
Broadcast::presence('channels.'.$channel->id)->send();
```

Transmitir um evento anônimo usando o método `send` despacha o evento para a [fila](/pt-br/queues/) da sua aplicação para processamento. No entanto, se você gostaria de transmitir o evento imediatamente, você pode usar o método `sendNow`:

```php
Broadcast::on('orders.'.$order->id)->sendNow();
```

Para transmitir o evento para todos os assinantes do canal, exceto o usuário atualmente autenticado, você pode invocar o método `toOthers`:

```php
Broadcast::on('orders.'.$order->id)
    ->toOthers()
    ->send();
```

<a id="rescuing-broadcasts"></a>
### Resgatando Broadcasts

Quando o servidor de fila da sua aplicação está indisponível ou o Laravel encontra um erro ao transmitir um evento, uma exceção é lançada que normalmente faz com que o usuário final veja um erro de aplicação. Como o broadcasting de eventos é frequentemente complementar à funcionalidade central da sua aplicação, você pode evitar que essas exceções interrompam a experiência do usuário implementando a interface `ShouldRescue` em seus eventos.

Eventos que implementam a interface `ShouldRescue` utilizam automaticamente a [função helper rescue](/pt-br/helpers/#method-rescue) do Laravel durante as tentativas de broadcast. Este helper captura quaisquer exceções, as reporta ao handler de exceções da sua aplicação para logging e permite que a aplicação continue executando normalmente sem interromper o fluxo de trabalho do usuário:

```php
<?php

namespace App\Events;

use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldRescue;

class ServerCreated implements ShouldBroadcast, ShouldRescue
{
    // ...
}
```

<a id="receiving-broadcasts"></a>
## Recebendo Broadcasts

<a id="listening-for-events"></a>
### Escutando Eventos

Uma vez que você tenha [instalado e instanciado o Laravel Echo](#client-side-installation), você está pronto para começar a escutar eventos que são transmitidos da sua aplicação Laravel. Primeiro, use o método `channel` para recuperar uma instância de um canal, então chame o método `listen` para escutar um evento especificado:

```js
Echo.channel(`orders.${this.order.id}`)
    .listen('OrderShipmentStatusUpdated', (e) => {
        console.log(e.order.name);
    });
```

Se você gostaria de escutar eventos em um canal privado, use o método `private` em vez disso. Você pode continuar encadeando chamadas ao método `listen` para escutar múltiplos eventos em um único canal:

```js
Echo.private(`orders.${this.order.id}`)
    .listen(/* ... */)
    .listen(/* ... */)
    .listen(/* ... */);
```

<a id="stop-listening-for-events"></a>
#### Parar de Escutar Eventos

Se você gostaria de parar de escutar um determinado evento sem [sair do canal](#leaving-a-channel), você pode usar o método `stopListening`:

```js
Echo.private(`orders.${this.order.id}`)
    .stopListening('OrderShipmentStatusUpdated');
```

<a id="leaving-a-channel"></a>
### Saindo de um Canal

Para sair de um canal, você pode chamar o método `leaveChannel` na sua instância do Echo:

```js
Echo.leaveChannel(`orders.${this.order.id}`);
```

Se você gostaria de sair de um canal e também de seus canais privados e de presença associados, você pode chamar o método `leave`:

```js
Echo.leave(`orders.${this.order.id}`);
```
<a id="namespaces"></a>
### Namespaces

Você pode ter notado nos exemplos acima que não especificamos o namespace completo `App\Events` para as classes de evento. Isso ocorre porque o Echo assumirá automaticamente que os eventos estão localizados no namespace `App\Events`. No entanto, você pode configurar o namespace raiz quando instancia o Echo passando uma opção de configuração `namespace`:

```js
window.Echo = new Echo({
    broadcaster: 'pusher',
    // ...
    namespace: 'App.Other.Namespace'
});
```

Alternativamente, você pode prefixar as classes de evento com um `.` ao se inscrever nelas usando o Echo. Isso permitirá que você sempre especifique o nome de classe totalmente qualificado:

```js
Echo.channel('orders')
    .listen('.Namespace\\Event\\Class', (e) => {
        // ...
    });
```

<a id="using-react-or-vue"></a>
### Usando React, Vue ou Svelte

O Laravel Echo inclui hooks de React, Vue e Svelte que tornam indolor escutar eventos. Para começar, invoque o hook `useEcho`, que é usado para escutar eventos privados. O hook `useEcho` sairá automaticamente dos canais quando o componente consumidor for desmontado:

```js tab=React
import { useEcho } from "@laravel/echo-react";

useEcho(
    `orders.${orderId}`,
    "OrderShipmentStatusUpdated",
    (e) => {
        console.log(e.order);
    },
);
```

```vue tab=Vue
<script setup lang="ts">
import { useEcho } from "@laravel/echo-vue";

useEcho(
    `orders.${orderId}`,
    "OrderShipmentStatusUpdated",
    (e) => {
        console.log(e.order);
    },
);
</script>
```

```svelte tab=Svelte
<script>
import { useEcho } from "@laravel/echo-svelte";

useEcho(
    `orders.${orderId}`,
    "OrderShipmentStatusUpdated",
    (e) => {
        console.log(e.order);
    },
);
</script>
```

Você pode escutar múltiplos eventos fornecendo um array de eventos ao `useEcho`:

```js
useEcho(
    `orders.${orderId}`,
    ["OrderShipmentStatusUpdated", "OrderShipped"],
    (e) => {
        console.log(e.order);
    },
);
```

Você também pode especificar o formato dos dados do payload do evento de broadcast, fornecendo maior segurança de tipos e conveniência de edição:

```ts
type OrderData = {
    order: {
        id: number;
        user: {
            id: number;
            name: string;
        };
        created_at: string;
    };
};

useEcho<OrderData>(`orders.${orderId}`, "OrderShipmentStatusUpdated", (e) => {
    console.log(e.order.id);
    console.log(e.order.user.id);
});
```

O hook `useEcho` sairá automaticamente dos canais quando o componente consumidor for desmontado; no entanto, você pode utilizar as funções retornadas para parar / iniciar manualmente a escuta dos canais de forma programática quando necessário:

```js tab=React
import { useEcho } from "@laravel/echo-react";

const { leaveChannel, leave, stopListening, listen } = useEcho(
    `orders.${orderId}`,
    "OrderShipmentStatusUpdated",
    (e) => {
        console.log(e.order);
    },
);

// Parar de escutar sem sair do canal...
stopListening();

// Começar a escutar novamente...
listen();

// Sair do canal...
leaveChannel();

// Sair de um canal e também de seus canais privados e de presença associados...
leave();
```

```vue tab=Vue
<script setup lang="ts">
import { useEcho } from "@laravel/echo-vue";

const { leaveChannel, leave, stopListening, listen } = useEcho(
    `orders.${orderId}`,
    "OrderShipmentStatusUpdated",
    (e) => {
        console.log(e.order);
    },
);

// Parar de escutar sem sair do canal...
stopListening();

// Começar a escutar novamente...
listen();

// Sair do canal...
leaveChannel();

// Sair de um canal e também de seus canais privados e de presença associados...
leave();
</script>
```

```svelte tab=Svelte
<script>
import { useEcho } from "@laravel/echo-svelte";

const { leaveChannel, leave, stopListening, listen } = useEcho(
    `orders.${orderId}`,
    "OrderShipmentStatusUpdated",
    (e) => {
        console.log(e.order);
    },
);

// Parar de escutar sem sair do canal...
stopListening();

// Começar a escutar novamente...
listen();

// Sair do canal...
leaveChannel();

// Sair de um canal e também de seus canais privados e de presença associados...
leave();
</script>
```

<a id="react-vue-connecting-to-public-channels"></a>
#### Conectando a Canais Públicos

Para conectar a um canal público, você pode usar o hook `useEchoPublic`:

```js tab=React
import { useEchoPublic } from "@laravel/echo-react";

useEchoPublic("posts", "PostPublished", (e) => {
    console.log(e.post);
});
```

```vue tab=Vue
<script setup lang="ts">
import { useEchoPublic } from "@laravel/echo-vue";

useEchoPublic("posts", "PostPublished", (e) => {
    console.log(e.post);
});
</script>
```

```svelte tab=Svelte
<script>
import { useEchoPublic } from "@laravel/echo-svelte";

useEchoPublic("posts", "PostPublished", (e) => {
    console.log(e.post);
});
</script>
```

<a id="react-vue-connecting-to-presence-channels"></a>
#### Conectando a Canais de Presença

Para conectar a um canal de presença, você pode usar o hook `useEchoPresence`:

```js tab=React
import { useEchoPresence } from "@laravel/echo-react";

useEchoPresence("posts", "PostPublished", (e) => {
    console.log(e.post);
});
```

```vue tab=Vue
<script setup lang="ts">
import { useEchoPresence } from "@laravel/echo-vue";

useEchoPresence("posts", "PostPublished", (e) => {
    console.log(e.post);
});
</script>
```

```svelte tab=Svelte
<script>
import { useEchoPresence } from "@laravel/echo-svelte";

useEchoPresence("posts", "PostPublished", (e) => {
    console.log(e.post);
});
</script>
```

<a id="react-vue-connection-status"></a>
#### Status da Conexão

Você pode recuperar o status atual da conexão WebSocket usando o hook `useConnectionStatus`, que fornece um status reativo que se atualiza automaticamente quando o estado da conexão muda:

```js tab=React
import { useConnectionStatus } from "@laravel/echo-react";

function ConnectionIndicator() {
    const status = useConnectionStatus();

    return <div>Connection: {status}</div>;
}
```

```vue tab=Vue
<script setup lang="ts">
import { useConnectionStatus } from "@laravel/echo-vue";

const status = useConnectionStatus();
</script>

<template>
    <div>Connection: {{ status }}</div>
</template>
```

```svelte tab=Svelte
<script>
import { useConnectionStatus } from "@laravel/echo-svelte";

const status = useConnectionStatus();
</script>

<div>Connection: {status()}</div>
```

Os valores de status possíveis são:

<div class="content-list" markdown="1">

- `connected` - Conectado com sucesso ao servidor WebSocket.
- `connecting` - Tentativa de conexão inicial em andamento.
- `reconnecting` - Tentando reconectar após uma desconexão.
- `disconnected` - Não conectado e não tentando reconectar.
- `failed` - A conexão falhou e não tentará novamente.

</div>

<a id="react-vue-socket-id"></a>
#### Socket ID

Você pode recuperar o socket ID atual do WebSocket usando o hook `useSocketId`, que fornece um valor reativo que se atualiza automaticamente quando a conexão reconecta com um novo socket ID:

```js tab=React
import { useSocketId } from "@laravel/echo-react";

function SocketIndicator() {
    const socketId = useSocketId();

    return <div>Socket ID: {socketId}</div>;
}
```

```vue tab=Vue
<script setup lang="ts">
import { useSocketId } from "@laravel/echo-vue";

const socketId = useSocketId();
</script>

<template>
    <div>Socket ID: {{ socketId }}</div>
</template>
```

```svelte tab=Svelte
<script>
import { useSocketId } from "@laravel/echo-svelte";

const socketId = useSocketId();
</script>

<div>Socket ID: {socketId()}</div>
```

<a id="presence-channels"></a>
## Canais de Presença

Canais de presença se baseiam na segurança dos canais privados enquanto expõem a funcionalidade adicional de ciência de quem está inscrito no canal. Isso torna fácil construir funcionalidades de aplicação poderosas e colaborativas, como notificar usuários quando outro usuário está visualizando a mesma página ou listar os ocupantes de uma sala de chat.

<a id="authorizing-presence-channels"></a>
### Autorizando Canais de Presença

Todos os canais de presença também são canais privados; portanto, os usuários devem estar [autorizados a acessá-los](#authorizing-channels). No entanto, ao definir callbacks de autorização para canais de presença, você não retornará `true` se o usuário estiver autorizado a entrar no canal. Em vez disso, você deve retornar um array de dados sobre o usuário.

Os dados retornados pelo callback de autorização serão disponibilizados aos listeners de evento do canal de presença na sua aplicação JavaScript. Se o usuário não estiver autorizado a entrar no canal de presença, você deve retornar `false` ou `null`:

```php
use App\Models\User;

Broadcast::channel('chat.{roomId}', function (User $user, int $roomId) {
    if ($user->canJoinRoom($roomId)) {
        return ['id' => $user->id, 'name' => $user->name];
    }
});
```

<a id="joining-presence-channels"></a>
### Entrando em Canais de Presença

Para entrar em um canal de presença, você pode usar o método `join` do Echo. O método `join` retornará uma implementação de `PresenceChannel` que, além de expor o método `listen`, permite que você se inscreva nos eventos `here`, `joining` e `leaving`.

```js
Echo.join(`chat.${roomId}`)
    .here((users) => {
        // ...
    })
    .joining((user) => {
        console.log(user.name);
    })
    .leaving((user) => {
        console.log(user.name);
    })
    .error((error) => {
        console.error(error);
    });
```

O callback `here` será executado imediatamente quando o canal for entrado com sucesso, e receberá um array contendo as informações de usuário de todos os outros usuários atualmente inscritos no canal. O método `joining` será executado quando um novo usuário entrar em um canal, enquanto o método `leaving` será executado quando um usuário sair do canal. O método `error` será executado quando o endpoint de autenticação retornar um código de status HTTP diferente de 200 ou se houver um problema ao fazer o parsing do JSON retornado.

<a id="broadcasting-to-presence-channels"></a>
### Transmitindo para Canais de Presença

Canais de presença podem receber eventos assim como canais públicos ou privados. Usando o exemplo de uma sala de chat, podemos querer transmitir eventos `NewMessage` para o canal de presença da sala. Para fazer isso, retornaremos uma instância de `PresenceChannel` do método `broadcastOn` do evento:

```php
/**
 * Get the channels the event should broadcast on.
 *
 * @return array<int, \Illuminate\Broadcasting\Channel>
 */
public function broadcastOn(): array
{
    return [
        new PresenceChannel('chat.'.$this->message->room_id),
    ];
}
```

Como com outros eventos, você pode usar o helper `broadcast` e o método `toOthers` para excluir o usuário atual de receber o broadcast:

```php
broadcast(new NewMessage($message));

broadcast(new NewMessage($message))->toOthers();
```

Como é típico de outros tipos de eventos, você pode escutar eventos enviados para canais de presença usando o método `listen` do Echo:

```js
Echo.join(`chat.${roomId}`)
    .here(/* ... */)
    .joining(/* ... */)
    .leaving(/* ... */)
    .listen('NewMessage', (e) => {
        // ...
    });
```

<a id="encrypted-private-channels"></a>
## Canais Privados Criptografados

Canais privados garantem que apenas usuários autorizados possam escutar em um canal. No entanto, os dados do evento em si ainda passam pelo seu serviço de broadcasting em texto plano. Ao usar o Pusher Channels ou o Mercure, você pode usar canais privados criptografados de ponta a ponta para que apenas sua aplicação e seus clientes autorizados sejam capazes de ler os dados do evento.

Para começar, configure uma chave de criptografia para o [Pusher Channels](#pusher-manual-installation) ou o [Mercure](#mercure-manual-installation). Então, retorne uma instância de `EncryptedPrivateChannel` do método `broadcastOn` do seu evento:

```php
use Illuminate\Broadcasting\EncryptedPrivateChannel;

/**
 * Get the channels the event should broadcast on.
 *
 * @return array<int, \Illuminate\Broadcasting\Channel>
 */
public function broadcastOn(): array
{
    return [
        new EncryptedPrivateChannel('orders.'.$this->order->id),
    ];
}
```

Canais privados criptografados são autorizados exatamente como canais privados, então um callback de autorização `orders.{orderId}` no arquivo `routes/channels.php` da sua aplicação também autorizará o canal criptografado `orders.1`.

Na sua aplicação JavaScript, você pode se inscrever no canal usando o método `encryptedPrivate` do Echo:

```js
Echo.encryptedPrivate(`orders.${orderId}`)
    .listen('OrderShipmentStatusUpdated', (e) => {
        console.log(e.order);
    });
```

Ao usar o Pusher Channels, a build padrão do `pusher-js` não inclui o código necessário para descriptografar mensagens. Em vez disso, você deve importar a build `with-encryption` ao [configurar o Echo](#pusher-client-manual-installation):

```js
import Pusher from 'pusher-js/with-encryption';
window.Pusher = Pusher;
```

<a id="model-broadcasting"></a>
## Broadcasting de Models

> **Aviso:**
> Antes de ler a documentação a seguir sobre broadcasting de models, recomendamos que você se familiarize com os conceitos gerais dos serviços de broadcasting de models do Laravel, bem como com a forma de criar e escutar manualmente eventos de broadcast.

É comum transmitir eventos quando os [models Eloquent](/pt-br/eloquent/) da sua aplicação são criados, atualizados ou excluídos. É claro, isso pode ser facilmente realizado [definindo manualmente eventos personalizados para mudanças de estado de models Eloquent](/pt-br/eloquent/#events) e marcando esses eventos com a interface `ShouldBroadcast`.

No entanto, se você não estiver usando esses eventos para quaisquer outros propósitos em sua aplicação, pode ser trabalhoso criar classes de evento com o único propósito de transmiti-las. Para remediar isso, o Laravel permite que você indique que um model Eloquent deve transmitir automaticamente suas mudanças de estado.

Para começar, seu model Eloquent deve usar a trait `Illuminate\Database\Eloquent\BroadcastsEvents`. Além disso, o model deve definir um método `broadcastOn`, que retornará um array de canais nos quais os eventos do model devem ser transmitidos:

```php
<?php

namespace App\Models;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Database\Eloquent\BroadcastsEvents;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Post extends Model
{
    use BroadcastsEvents, HasFactory;

    /**
     * Get the user that the post belongs to.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the channels that model events should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel|\Illuminate\Database\Eloquent\Model>
     */
    public function broadcastOn(string $event): array
    {
        return [$this, $this->user];
    }
}
```

Uma vez que seu model inclua esta trait e defina seus canais de broadcast, ele começará a transmitir eventos automaticamente quando uma instância de model for criada, atualizada, excluída, movida para a lixeira (trashed) ou restaurada (restored).

Além disso, você pode ter notado que o método `broadcastOn` recebe um argumento string `$event`. Este argumento contém o tipo de evento que ocorreu no model e terá um valor de `created`, `updated`, `deleted`, `trashed` ou `restored`. Inspecionando o valor dessa variável, você pode determinar em quais canais (se houver algum) o model deve transmitir para um evento específico:

```php
/**
 * Get the channels that model events should broadcast on.
 *
 * @return array<string, array<int, \Illuminate\Broadcasting\Channel|\Illuminate\Database\Eloquent\Model>>
 */
public function broadcastOn(string $event): array
{
    return match ($event) {
        'deleted' => [],
        default => [$this, $this->user],
    };
}
```

<a id="customizing-model-broadcasting-event-creation"></a>
#### Personalizando a Criação de Eventos de Broadcasting de Model

Ocasionalmente, você pode desejar personalizar como o Laravel cria o evento de broadcasting de model subjacente. Você pode realizar isso definindo um método `newBroadcastableEvent` no seu model Eloquent. Este método deve retornar uma instância de `Illuminate\Database\Eloquent\BroadcastableModelEventOccurred`:

```php
use Illuminate\Database\Eloquent\BroadcastableModelEventOccurred;

/**
 * Create a new broadcastable model event for the model.
 */
protected function newBroadcastableEvent(string $event): BroadcastableModelEventOccurred
{
    return (new BroadcastableModelEventOccurred(
        $this, $event
    ))->dontBroadcastToCurrentUser();
}
```

<a id="model-broadcasting-conventions"></a>
### Convenções de Broadcasting de Models

<a id="model-broadcasting-channel-conventions"></a>
#### Convenções de Canal

Como você pode ter notado, o método `broadcastOn` no exemplo de model acima não retornou instâncias de `Channel`. Em vez disso, models Eloquent foram retornados diretamente. Se uma instância de model Eloquent for retornada pelo método `broadcastOn` do seu model (ou estiver contida em um array retornado pelo método), o Laravel instanciará automaticamente uma instância de canal privado para o model usando o nome de classe do model e o identificador de chave primária como o nome do canal.

Então, um model `App\Models\User` com um `id` de `1` seria convertido em uma instância de `Illuminate\Broadcasting\PrivateChannel` com um nome de `App.Models.User.1`. É claro, além de retornar instâncias de model Eloquent do método `broadcastOn` do seu model, você pode retornar instâncias completas de `Channel` para ter controle total sobre os nomes de canal do model:

```php
use Illuminate\Broadcasting\PrivateChannel;

/**
 * Get the channels that model events should broadcast on.
 *
 * @return array<int, \Illuminate\Broadcasting\Channel>
 */
public function broadcastOn(string $event): array
{
    return [
        new PrivateChannel('user.'.$this->id)
    ];
}
```

Se você planeja retornar explicitamente uma instância de canal do método `broadcastOn` do seu model, você pode passar uma instância de model Eloquent ao construtor do canal. Ao fazer isso, o Laravel usará as convenções de canal de model discutidas acima para converter o model Eloquent em uma string de nome de canal:

```php
return [new Channel($this->user)];
```

Se você precisar determinar o nome do canal de um model, você pode chamar o método `broadcastChannel` em qualquer instância de model. Por exemplo, este método retorna a string `App.Models.User.1` para um model `App\Models\User` com um `id` de `1`:

```php
$user->broadcastChannel();
```

<a id="model-broadcasting-event-conventions"></a>
#### Convenções de Evento

Como os eventos de broadcast de model não estão associados a um evento "real" dentro do diretório `App\Events` da sua aplicação, eles recebem um nome e um payload baseados em convenções. A convenção do Laravel é transmitir o evento usando o nome de classe do model (sem incluir o namespace) e o nome do evento de model que acionou o broadcast.

Então, por exemplo, uma atualização no model `App\Models\Post` transmitiria um evento para sua aplicação do lado do cliente como `PostUpdated` com o seguinte payload:

```json
{
    "model": {
        "id": 1,
        "title": "My first post"
        ...
    },
    ...
    "socket": "someSocketId"
}
```

A exclusão do model `App\Models\User` transmitiria um evento nomeado `UserDeleted`.

Se você gostaria, você pode definir um nome e payload de broadcast personalizados adicionando um método `broadcastAs` e `broadcastWith` ao seu model. Esses métodos recebem o nome do evento / operação de model que está ocorrendo, permitindo que você personalize o nome e o payload do evento para cada operação de model. Se `null` for retornado do método `broadcastAs`, o Laravel usará as convenções de nome de evento de broadcasting de model discutidas acima ao transmitir o evento:

```php
/**
 * The model event's broadcast name.
 */
public function broadcastAs(string $event): string|null
{
    return match ($event) {
        'created' => 'post.created',
        default => null,
    };
}

/**
 * Get the data to broadcast for the model.
 *
 * @return array<string, mixed>
 */
public function broadcastWith(string $event): array
{
    return match ($event) {
        'created' => ['title' => $this->title],
        default => ['model' => $this],
    };
}
```

<a id="listening-for-model-broadcasts"></a>
### Escutando Broadcasts de Models

Uma vez que você tenha adicionado a trait `BroadcastsEvents` ao seu model e definido o método `broadcastOn` do seu model, você está pronto para começar a escutar eventos de model transmitidos dentro da sua aplicação do lado do cliente. Antes de começar, você pode desejar consultar a documentação completa sobre [escutar eventos](#listening-for-events).

Primeiro, use o método `private` para recuperar uma instância de um canal, então chame o método `listen` para escutar um evento especificado. Normalmente, o nome do canal passado ao método `private` deve corresponder às [convenções de broadcasting de models](#model-broadcasting-conventions) do Laravel.

Uma vez que você tenha obtido uma instância de canal, você pode usar o método `listen` para escutar um evento específico. Como os eventos de broadcast de model não estão associados a um evento "real" dentro do diretório `App\Events` da sua aplicação, o [nome do evento](#model-broadcasting-event-conventions) deve ser prefixado com um `.` para indicar que ele não pertence a um namespace específico. Cada evento de broadcast de model tem uma propriedade `model` que contém todas as propriedades broadcastáveis do model:

```js
Echo.private(`App.Models.User.${this.user.id}`)
    .listen('.UserUpdated', (e) => {
        console.log(e.model);
    });
```

<a id="model-broadcasts-with-react-or-vue"></a>
#### Usando React, Vue ou Svelte

Se você estiver usando React, Vue ou Svelte, você pode usar o hook `useEchoModel` incluído no Laravel Echo para escutar facilmente broadcasts de models:

```js tab=React
import { useEchoModel } from "@laravel/echo-react";

useEchoModel("App.Models.User", userId, ["UserUpdated"], (e) => {
    console.log(e.model);
});
```

```vue tab=Vue
<script setup lang="ts">
import { useEchoModel } from "@laravel/echo-vue";

useEchoModel("App.Models.User", userId, ["UserUpdated"], (e) => {
    console.log(e.model);
});
</script>
```

```svelte tab=Svelte
<script>
import { useEchoModel } from "@laravel/echo-svelte";

useEchoModel("App.Models.User", userId, ["UserUpdated"], (e) => {
    console.log(e.model);
});
</script>
```

Você também pode especificar o formato dos dados do payload do evento de model, fornecendo maior segurança de tipos e conveniência de edição:

```ts
type User = {
    id: number;
    name: string;
    email: string;
};

useEchoModel<User, "App.Models.User">("App.Models.User", userId, ["UserUpdated"], (e) => {
    console.log(e.model.id);
    console.log(e.model.name);
});
```

<a id="client-events"></a>
## Eventos de Cliente

> **Nota:**
> Ao usar o [Pusher Channels](https://pusher.com/channels), você deve habilitar a opção "Client Events" na seção "App Settings" do seu [dashboard da aplicação](https://dashboard.pusher.com/) para enviar eventos de cliente.

Às vezes você pode desejar transmitir um evento para outros clientes conectados sem atingir sua aplicação Laravel de forma alguma. Isso pode ser particularmente útil para coisas como notificações de "digitando", onde você quer alertar os usuários da sua aplicação de que outro usuário está digitando uma mensagem em uma determinada tela.

Para transmitir eventos de cliente, você pode usar o método `whisper` do Echo:

```js tab=JavaScript
Echo.private(`chat.${roomId}`)
    .whisper('typing', {
        name: this.user.name
    });
```

```js tab=React
import { useEcho } from "@laravel/echo-react";

const { channel } = useEcho(`chat.${roomId}`, ['update'], (e) => {
    console.log('Chat event received:', e);
});

channel().whisper('typing', { name: user.name });
```

```vue tab=Vue
<script setup lang="ts">
import { useEcho } from "@laravel/echo-vue";

const { channel } = useEcho(`chat.${roomId}`, ['update'], (e) => {
    console.log('Chat event received:', e);
});

channel().whisper('typing', { name: user.name });
</script>
```

```svelte tab=Svelte
<script>
import { useEcho } from "@laravel/echo-svelte";

const { channel } = useEcho(`chat.${roomId}`, ['update'], (e) => {
    console.log('Chat event received:', e);
});

channel().whisper('typing', { name: user.name });
</script>
```

Para escutar eventos de cliente, você pode usar o método `listenForWhisper`:

```js tab=JavaScript
Echo.private(`chat.${roomId}`)
    .listenForWhisper('typing', (e) => {
        console.log(e.name);
    });
```

```js tab=React
import { useEcho } from "@laravel/echo-react";

const { channel } = useEcho(`chat.${roomId}`, ['update'], (e) => {
    console.log('Chat event received:', e);
});

channel().listenForWhisper('typing', (e) => {
    console.log(e.name);
});
```

```vue tab=Vue
<script setup lang="ts">
import { useEcho } from "@laravel/echo-vue";

const { channel } = useEcho(`chat.${roomId}`, ['update'], (e) => {
    console.log('Chat event received:', e);
});

channel().listenForWhisper('typing', (e) => {
    console.log(e.name);
});
</script>
```

```svelte tab=Svelte
<script>
import { useEcho } from "@laravel/echo-svelte";

const { channel } = useEcho(`chat.${roomId}`, ['update'], (e) => {
    console.log('Chat event received:', e);
});

channel().listenForWhisper('typing', (e) => {
    console.log(e.name);
});
</script>
```

<a id="notifications"></a>
## Notificações

Ao parear o broadcasting de eventos com [notificações](/pt-br/notifications/), sua aplicação JavaScript pode receber novas notificações à medida que elas ocorrem sem precisar atualizar a página. Antes de começar, certifique-se de ler a documentação sobre o uso do [canal de notificação broadcast](/pt-br/notifications/#broadcast-notifications).

Uma vez que você tenha configurado uma notificação para usar o canal broadcast, você pode escutar os eventos de broadcast usando o método `notification` do Echo. Lembre-se, o nome do canal deve corresponder ao nome de classe da entidade que recebe as notificações:

```js tab=JavaScript
Echo.private(`App.Models.User.${userId}`)
    .notification((notification) => {
        console.log(notification.type);
    });
```

```js tab=React
import { useEchoModel } from "@laravel/echo-react";

const { channel } = useEchoModel('App.Models.User', userId);

channel().notification((notification) => {
    console.log(notification.type);
});
```

```vue tab=Vue
<script setup lang="ts">
import { useEchoModel } from "@laravel/echo-vue";

const { channel } = useEchoModel('App.Models.User', userId);

channel().notification((notification) => {
    console.log(notification.type);
});
</script>
```

```svelte tab=Svelte
<script>
import { useEchoModel } from "@laravel/echo-svelte";

const { channel } = useEchoModel('App.Models.User', userId);

channel().notification((notification) => {
    console.log(notification.type);
});
</script>
```

Neste exemplo, todas as notificações enviadas a instâncias de `App\Models\User` via o canal `broadcast` seriam recebidas pelo callback. Um callback de autorização de canal para o canal `App.Models.User.{id}` está incluído no arquivo `routes/channels.php` da sua aplicação.

<a id="stop-listening-for-notifications"></a>
#### Parar de Escutar Notificações

Se você gostaria de parar de escutar notificações sem [sair do canal](#leaving-a-channel), você pode usar o método `stopListeningForNotification`:

```js
const callback = (notification) => {
    console.log(notification.type);
}

// Começar a escutar...
Echo.private(`App.Models.User.${userId}`)
    .notification(callback);

// Parar de escutar (o callback deve ser o mesmo)...
Echo.private(`App.Models.User.${userId}`)
    .stopListeningForNotification(callback);
```
