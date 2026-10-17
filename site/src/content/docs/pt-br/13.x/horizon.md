---
title: "Laravel Horizon"
---

- [Introdução](#introduction)
- [Instalação](#installation)
    - [Configuração](#configuration)
    - [Autorização do Dashboard](#dashboard-authorization)
    - [Máximo de Tentativas do Job](#max-job-attempts)
    - [Timeout do Job](#job-timeout)
    - [Backoff do Job](#job-backoff)
    - [Outras Opções do Worker](#other-worker-options)
    - [Jobs Silenciados](#silenced-jobs)
- [Estratégias de Balanceamento](#balancing-strategies)
    - [Balanceamento Automático](#auto-balancing)
    - [Balanceamento Simples](#simple-balancing)
    - [Sem Balanceamento](#no-balancing)
- [Atualizando o Horizon](#upgrading-horizon)
- [Executando o Horizon](#running-horizon)
    - [Fazendo Deploy do Horizon](#deploying-horizon)
- [Tags](#tags)
- [Notificações](#notifications)
- [Métricas](#metrics)
- [Excluindo Jobs com Falha](#deleting-failed-jobs)
- [Limpando Jobs das Filas](#clearing-jobs-from-queues)

<a id="introduction"></a>
## Introdução

> **Note:**
> Antes de se aprofundar no Laravel Horizon, você deve se familiarizar com os [serviços de fila](/pt-br/queues/) básicos do Laravel. O Horizon amplia a fila do Laravel com recursos adicionais que podem ser confusos se você ainda não estiver familiarizado com os recursos básicos de fila oferecidos pelo Laravel.

O [Laravel Horizon](https://github.com/laravel/horizon) fornece um belo dashboard e configuração orientada a código para suas [filas Redis](/pt-br/queues/) com Laravel. O Horizon permite que você monitore facilmente métricas-chave do seu sistema de filas, como throughput de jobs, tempo de execução e falhas de jobs.

Ao usar o Horizon, toda a configuração dos seus workers de fila é armazenada em um único arquivo de configuração simples. Ao definir a configuração dos workers da sua aplicação em um arquivo versionado, você pode facilmente escalar ou modificar os workers de fila da sua aplicação ao fazer deploy dela.

<img src="https://laravel.com/img/docs/horizon-example.png">

<a id="installation"></a>
## Instalação

> **Warning:**
> O Laravel Horizon exige que você use o [Redis](https://redis.io) para alimentar sua fila. Portanto, você deve garantir que a conexão da sua fila esteja definida como `redis` no arquivo de configuração `config/queue.php` da sua aplicação. O Horizon não é compatível com o Redis Cluster no momento.

Você pode instalar o Horizon em seu projeto usando o gerenciador de pacotes Composer:

```shell
composer require laravel/horizon
```

Após instalar o Horizon, publique seus assets usando o comando Artisan `horizon:install`:

```shell
php artisan horizon:install
```

<a id="configuration"></a>
### Configuração

Após publicar os assets do Horizon, seu arquivo de configuração principal estará localizado em `config/horizon.php`. Este arquivo de configuração permite que você configure as opções de worker de fila da sua aplicação. Cada opção de configuração inclui uma descrição de seu propósito, então certifique-se de explorar completamente este arquivo.

> **Warning:**
> O Horizon usa uma conexão Redis chamada `horizon` internamente. Este nome de conexão Redis é reservado e não deve ser atribuído a outra conexão Redis no arquivo de configuração `database.php` ou como valor da opção `use` no arquivo de configuração `horizon.php`.

<a id="content-security-policy-csp-nonce"></a>
#### Nonce de Content Security Policy (CSP)

Se você quiser usar um [atributo nonce](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/nonce) nas tags de script e style usadas nas views do Horizon como parte da sua [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP), você pode usar o método `Horizon::cspNonce` para especificar o nonce a ser usado. Este método normalmente deve ser invocado dentro de um middleware para que um novo nonce seja atribuído a cada requisição:

```php
use Closure;
use Illuminate\Http\Request;
use Laravel\Horizon\Horizon;
use Symfony\Component\HttpFoundation\Response;

public function handle(Request $request, Closure $next): Response
{
    Horizon::cspNonce('csp-nonce');

    return $next($request);
}
```

Você pode adicionar este middleware à opção `middleware` no arquivo de configuração `config/horizon.php` da sua aplicação:

```php
'middleware' => [
    'web',
    App\Http\Middleware\AddHorizonCspNonce::class,
],
```

<a id="environments"></a>
#### Ambientes

Após a instalação, a principal opção de configuração do Horizon com a qual você deve se familiarizar é a opção de configuração `environments`. Esta opção de configuração é um array de ambientes nos quais sua aplicação é executada e define as opções de processo do worker para cada ambiente. Por padrão, esta entrada contém um ambiente `production` e um `local`. No entanto, você é livre para adicionar mais ambientes conforme necessário:

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            'maxProcesses' => 10,
            'balanceMaxShift' => 1,
            'balanceCooldown' => 3,
        ],
    ],

    'local' => [
        'supervisor-1' => [
            'maxProcesses' => 3,
        ],
    ],
],
```

Você também pode definir um ambiente curinga (`*`) que será usado quando nenhum outro ambiente correspondente for encontrado:

```php
'environments' => [
    // ...

    '*' => [
        'supervisor-1' => [
            'maxProcesses' => 3,
        ],
    ],
],
```

Quando você inicia o Horizon, ele usará as opções de configuração de processo do worker para o ambiente em que sua aplicação está sendo executada. Normalmente, o ambiente é determinado pelo valor da [variável de ambiente](/pt-br/configuration/#determining-the-current-environment) `APP_ENV`. Por exemplo, o ambiente `local` padrão do Horizon é configurado para iniciar três processos de worker e balancear automaticamente o número de processos de worker atribuídos a cada fila. O ambiente `production` padrão é configurado para iniciar no máximo 10 processos de worker e balancear automaticamente o número de processos de worker atribuídos a cada fila.

> **Warning:**
> Você deve garantir que a parte `environments` do seu arquivo de configuração `horizon` contenha uma entrada para cada [ambiente](/pt-br/configuration/#environment-configuration) no qual você planeja executar o Horizon.

<a id="supervisors"></a>
#### Supervisors

Como você pode ver no arquivo de configuração padrão do Horizon, cada ambiente pode conter um ou mais "supervisors". Por padrão, o arquivo de configuração define esse supervisor como `supervisor-1`; no entanto, você é livre para nomear seus supervisors como quiser. Cada supervisor é essencialmente responsável por "supervisionar" um grupo de processos de worker e cuida de balancear os processos de worker entre as filas.

Você pode adicionar supervisors adicionais a um determinado ambiente se quiser definir um novo grupo de processos de worker que deve ser executado nesse ambiente. Você pode optar por fazer isso se quiser definir uma estratégia de balanceamento ou uma contagem de processos de worker diferente para uma determinada fila usada pela sua aplicação.

<a id="maintenance-mode"></a>
#### Modo de Manutenção

Enquanto sua aplicação está em [modo de manutenção](/pt-br/configuration/#maintenance-mode), os jobs enfileirados não serão processados pelo Horizon, a menos que a opção `force` do supervisor seja definida como `true` no arquivo de configuração do Horizon:

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            // ...
            'force' => true,
        ],
    ],
],
```

<a id="default-values"></a>
#### Valores Padrão

Dentro do arquivo de configuração padrão do Horizon, você notará uma opção de configuração `defaults`. Esta opção de configuração especifica os valores padrão para os [supervisors](#supervisors) da sua aplicação. Os valores de configuração padrão do supervisor serão mesclados na configuração do supervisor para cada ambiente, permitindo que você evite repetições desnecessárias ao definir seus supervisors.

<a id="dashboard-authorization"></a>
### Autorização do Dashboard

O dashboard do Horizon pode ser acessado através da rota `/horizon`. Por padrão, você só poderá acessar este dashboard no ambiente `local`. No entanto, dentro do seu arquivo `app/Providers/HorizonServiceProvider.php`, há uma definição de [gate de autorização](/pt-br/authorization/#gates). Este gate de autorização controla o acesso ao Horizon em ambientes **não locais**. Você é livre para modificar este gate conforme necessário para restringir o acesso à sua instalação do Horizon:

```php
/**
 * Register the Horizon gate.
 *
 * This gate determines who can access Horizon in non-local environments.
 */
protected function gate(): void
{
    Gate::define('viewHorizon', function (User $user) {
        return in_array($user->email, [
            'taylor@laravel.com',
        ]);
    });
}
```

<a id="alternative-authentication-strategies"></a>
#### Estratégias de Autenticação Alternativas

Lembre-se de que o Laravel injeta automaticamente o usuário autenticado na closure do gate. Se sua aplicação estiver fornecendo a segurança do Horizon por outro método, como restrições de IP, então seus usuários do Horizon podem não precisar "fazer login". Portanto, você precisará alterar a assinatura da closure `function (User $user)` acima para `function (User $user = null)` a fim de forçar o Laravel a não exigir autenticação.

<a id="max-job-attempts"></a>
### Máximo de Tentativas do Job

> **Note:**
> Antes de refinar essas opções, certifique-se de estar familiarizado com os [serviços de fila](/pt-br/queues/#max-job-attempts-and-timeout) padrão do Laravel e com o conceito de 'tentativas' (attempts).

Você pode definir o número máximo de tentativas que um job pode consumir dentro da configuração de um supervisor:

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            // ...
            'tries' => 10,
        ],
    ],
],
```

> **Note:**
> Esta opção é semelhante à opção `--tries` ao usar o comando Artisan para processar filas.

Ajustar a opção `tries` é essencial ao usar middlewares como `WithoutOverlapping` ou `RateLimited`, porque eles consomem tentativas. Para lidar com isso, ajuste o valor de configuração `tries` no nível do supervisor ou definindo a propriedade `$tries` na classe do job.

Se você não definir a opção `tries`, o Horizon assume o padrão de uma única tentativa, a menos que a classe do job defina `$tries`, que tem precedência sobre a configuração do Horizon.

Definir `tries` ou `$tries` como 0 permite tentativas ilimitadas, o que é ideal quando o número de tentativas é incerto. Para evitar falhas infinitas, você pode limitar o número de exceções permitidas definindo a propriedade `$maxExceptions` na classe do job.

<a id="job-timeout"></a>
### Timeout do Job

Da mesma forma, você pode definir um valor `timeout` no nível do supervisor, que especifica quantos segundos um processo de worker pode executar um job antes de ser encerrado à força. Uma vez encerrado, o job será reprocessado ou marcado como com falha, dependendo da configuração da sua fila:

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            // ...
            'timeout' => 60,
        ],
    ],
],
```

> **Warning:**
> Ao usar a estratégia de balanceamento `auto`, o Horizon considerará os workers em andamento como "travados" (hanging) e os matará à força após o timeout do Horizon durante a redução de escala (scale down). Sempre garanta que o timeout do Horizon seja maior que qualquer timeout no nível do job, caso contrário os jobs podem ser encerrados no meio da execução. Além disso, o valor `timeout` deve sempre ser pelo menos alguns segundos menor que o valor `retry_after` definido no seu arquivo de configuração `config/queue.php`. Caso contrário, seus jobs podem ser processados duas vezes.

<a id="job-backoff"></a>
### Backoff do Job

Você pode definir o valor `backoff` no nível do supervisor para especificar quanto tempo o Horizon deve esperar antes de reprocessar um job que encontra uma exceção não tratada:

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            // ...
            'backoff' => 10,
        ],
    ],
],
```

Você também pode configurar backoffs "exponenciais" usando um array para o valor `backoff`. Neste exemplo, o atraso de reprocessamento será de 1 segundo para a primeira tentativa, 5 segundos para a segunda tentativa, 10 segundos para a terceira tentativa e 10 segundos para cada tentativa subsequente se houver mais tentativas restantes:

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            // ...
            'backoff' => [1, 5, 10],
        ],
    ],
],
```

<a id="other-worker-options"></a>
### Outras Opções do Worker

Além de `tries`, `timeout` e `backoff`, cada supervisor aceita várias outras opções que controlam como seus processos de worker se comportam e quando são reiniciados automaticamente. Reiniciar periodicamente os workers é uma boa prática para processos de longa duração, pois ajuda a proteger contra vazamentos de memória:

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            // ...
            'memory' => 128,
            'maxJobs' => 1000,
            'maxTime' => 3600,
            'sleep' => 3,
            'rest' => 0,
            'nice' => 0,
        ],
    ],
],
```

<div class="content-list" markdown="1">

- `memory` define a quantidade máxima de memória, em megabytes, que um único processo de worker pode consumir antes de ser reiniciado. Por padrão, este valor é `128`.
- `maxJobs` define o número de jobs que um worker deve processar antes de reiniciar. Um valor de `0` indica que os workers não devem ser reiniciados com base no número de jobs processados. Por padrão, este valor é `0`.
- `maxTime` define o número de segundos que um worker deve ser executado antes de reiniciar. Um valor de `0` indica que os workers não devem ser reiniciados com base no tempo. Por padrão, este valor é `0`.
- `sleep` define o número de segundos que um worker deve esperar quando nenhum job está disponível antes de consultar a fila novamente por novos jobs. Por padrão, este valor é `3`.
- `rest` define o número de segundos para pausar entre o processamento de cada job. Por padrão, este valor é `0`.
- `nice` define a "niceness" (prioridade de agendamento) dos processos de worker. Um valor maior dá ao processo uma prioridade menor. Por padrão, este valor é `0`.

</div>

<a id="silenced-jobs"></a>
### Jobs Silenciados

Às vezes, você pode não estar interessado em visualizar certos jobs despachados pela sua aplicação ou por pacotes de terceiros. Em vez de esses jobs ocuparem espaço na sua lista de "Jobs Concluídos", você pode silenciá-los. Para começar, adicione o nome da classe do job à opção de configuração `silenced` no arquivo de configuração `horizon` da sua aplicação:

```php
'silenced' => [
    App\Jobs\ProcessPodcast::class,
],
```

Além de silenciar classes de jobs individuais, o Horizon também suporta silenciar jobs com base em [tags](#tags). Isso pode ser útil se você quiser ocultar vários jobs que compartilham uma tag comum:

```php
'silenced_tags' => [
    'notifications'
],
```

Alternativamente, o job que você deseja silenciar pode implementar a interface `Laravel\Horizon\Contracts\Silenced`. Se um job implementar essa interface, ele será automaticamente silenciado, mesmo que não esteja presente no array de configuração `silenced`:

```php
use Laravel\Horizon\Contracts\Silenced;

class ProcessPodcast implements ShouldQueue, Silenced
{
    use Queueable;

    // ...
}
```

<a id="balancing-strategies"></a>
## Estratégias de Balanceamento

Cada supervisor pode processar uma ou mais filas, mas, diferentemente do sistema de filas padrão do Laravel, o Horizon permite que você escolha entre três estratégias de balanceamento de workers: `auto`, `simple` e `false`.

<a id="auto-balancing"></a>
### Balanceamento Automático

A estratégia `auto`, que é a estratégia padrão, ajusta o número de processos de worker por fila com base na carga de trabalho atual da fila. Por exemplo, se sua fila `notifications` tem 1.000 jobs pendentes enquanto sua fila `default` está vazia, o Horizon alocará mais workers à sua fila `notifications` até que a fila esteja vazia.

Ao usar a estratégia `auto`, você também pode configurar as opções de configuração `minProcesses` e `maxProcesses`:

<div class="content-list" markdown="1">

- `minProcesses` define o número mínimo de processos de worker por fila. Este valor deve ser maior ou igual a 1.
- `maxProcesses` define o número máximo total de processos de worker aos quais o Horizon pode escalar em todas as filas. Este valor normalmente deve ser maior que o número de filas multiplicado pelo valor de `minProcesses`. Para impedir que o supervisor gere qualquer processo, você pode definir este valor como 0.

</div>

Por exemplo, você pode configurar o Horizon para manter pelo menos um processo por fila e escalar até um total de 10 processos de worker:

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            'connection' => 'redis',
            'queue' => ['default', 'notifications'],
            'balance' => 'auto',
            'autoScalingStrategy' => 'time',
            'minProcesses' => 1,
            'maxProcesses' => 10,
            'balanceMaxShift' => 1,
            'balanceCooldown' => 3,
        ],
    ],
],
```

A opção de configuração `autoScalingStrategy` determina como o Horizon atribuirá mais processos de worker às filas. Você pode escolher entre três estratégias:

<div class="content-list" markdown="1">

- A estratégia `time` atribuirá workers com base na quantidade total estimada de tempo que levará para esvaziar a fila.
- A estratégia `size` atribuirá workers com base no número total de jobs na fila.
- A estratégia `log` atribuirá workers com base no logaritmo do número de jobs na fila. Isso evita que uma fila significativamente maior receba uma parcela desproporcionalmente grande de workers.

</div>

Os valores de configuração `balanceMaxShift` e `balanceCooldown` determinam a rapidez com que o Horizon escalará para atender à demanda de workers. No exemplo acima, no máximo um novo processo será criado ou destruído a cada três segundos. Você é livre para ajustar esses valores conforme necessário com base nas necessidades da sua aplicação.

<a id="auto-queue-priorities"></a>
#### Prioridades de Fila e Balanceamento Automático

Ao usar a estratégia de balanceamento `auto`, o Horizon não impõe uma prioridade estrita entre as filas. A ordem das filas na configuração de um supervisor não afeta como os processos de worker são atribuídos. Em vez disso, o Horizon depende da `autoScalingStrategy` selecionada para alocar dinamicamente os processos de worker com base na carga da fila.

Por exemplo, na configuração a seguir, a fila high não é priorizada sobre a fila default, apesar de aparecer primeiro na lista:

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            // ...
            'queue' => ['high', 'default'],
            'minProcesses' => 1,
            'maxProcesses' => 10,
        ],
    ],
],
```

Se você precisar impor uma prioridade relativa entre filas, pode definir vários supervisors e alocar explicitamente os recursos de processamento:

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            // ...
            'queue' => ['default'],
            'minProcesses' => 1,
            'maxProcesses' => 10,
        ],
        'supervisor-2' => [
            // ...
            'queue' => ['images'],
            'minProcesses' => 1,
            'maxProcesses' => 1,
        ],
    ],
],
```

Neste exemplo, a fila `default` pode escalar até 10 processos, enquanto a fila `images` é limitada a um processo. Esta configuração garante que suas filas possam escalar de forma independente.

> **Note:**
> Ao despachar jobs que consomem muitos recursos, às vezes é melhor atribuí-los a uma fila dedicada com um valor `maxProcesses` limitado. Caso contrário, esses jobs podem consumir recursos excessivos de CPU e sobrecarregar seu sistema.

<a id="simple-balancing"></a>
### Balanceamento Simples

A estratégia `simple` distribui os processos de worker uniformemente entre as filas especificadas. Com esta estratégia, o Horizon não escala automaticamente o número de processos de worker. Em vez disso, ele usa um número fixo de processos:

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            // ...
            'queue' => ['default', 'notifications'],
            'balance' => 'simple',
            'processes' => 10,
        ],
    ],
],
```

No exemplo acima, o Horizon atribuirá 5 processos a cada fila, dividindo o total de 10 uniformemente.

Se você quiser controlar o número de processos de worker atribuídos a cada fila individualmente, pode definir vários supervisors:

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            // ...
            'queue' => ['default'],
            'balance' => 'simple',
            'processes' => 10,
        ],
        'supervisor-notifications' => [
            // ...
            'queue' => ['notifications'],
            'balance' => 'simple',
            'processes' => 2,
        ],
    ],
],
```

Com esta configuração, o Horizon atribuirá 10 processos à fila `default` e 2 processos à fila `notifications`.

<a id="no-balancing"></a>
### Sem Balanceamento

Quando a opção `balance` é definida como `false`, o Horizon processa as filas estritamente na ordem em que estão listadas, de forma semelhante ao sistema de filas padrão do Laravel. No entanto, ele ainda escalará o número de processos de worker se os jobs começarem a se acumular:

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            // ...
            'queue' => ['default', 'notifications'],
            'balance' => false,
            'minProcesses' => 1,
            'maxProcesses' => 10,
        ],
    ],
],
```

No exemplo acima, os jobs na fila `default` são sempre priorizados sobre os jobs na fila `notifications`. Por exemplo, se houver 1.000 jobs em `default` e apenas 10 em `notifications`, o Horizon processará totalmente todos os jobs de `default` antes de tratar qualquer um de `notifications`.

Você pode controlar a capacidade do Horizon de escalar processos de worker usando as opções `minProcesses` e `maxProcesses`:

<div class="content-list" markdown="1">

- `minProcesses` define o número mínimo de processos de worker no total. Este valor deve ser maior ou igual a 1.
- `maxProcesses` define o número máximo total de processos de worker aos quais o Horizon pode escalar.

</div>

<a id="upgrading-horizon"></a>
## Atualizando o Horizon

Ao atualizar para uma nova versão principal do Horizon, é importante que você revise cuidadosamente [o guia de atualização](https://github.com/laravel/horizon/blob/master/UPGRADE.md).

<a id="running-horizon"></a>
## Executando o Horizon

Depois de configurar seus supervisors e workers no arquivo de configuração `config/horizon.php` da sua aplicação, você pode iniciar o Horizon usando o comando Artisan `horizon`. Este único comando iniciará todos os processos de worker configurados para o ambiente atual:

```shell
php artisan horizon
```

Você pode pausar o processo do Horizon e instruí-lo a continuar processando jobs usando os comandos Artisan `horizon:pause` e `horizon:continue`:

```shell
php artisan horizon:pause

php artisan horizon:continue
```

Você também pode pausar e continuar [supervisors](#supervisors) específicos do Horizon usando os comandos Artisan `horizon:pause-supervisor` e `horizon:continue-supervisor`:

```shell
php artisan horizon:pause-supervisor supervisor-1

php artisan horizon:continue-supervisor supervisor-1
```

Você pode verificar o status atual do processo do Horizon usando o comando Artisan `horizon:status`:

```shell
php artisan horizon:status
```

Você pode verificar o status atual de um [supervisor](#supervisors) específico do Horizon usando o comando Artisan `horizon:supervisor-status`:

```shell
php artisan horizon:supervisor-status supervisor-1
```

Você pode encerrar o processo do Horizon de forma graciosa usando o comando Artisan `horizon:terminate`. Quaisquer jobs que estejam sendo processados no momento serão concluídos e então o Horizon parará de executar:

```shell
php artisan horizon:terminate
```

<a id="automatically-restarting-horizon"></a>
#### Reiniciando o Horizon Automaticamente

Durante o desenvolvimento local, você pode executar o comando `horizon:listen`. Ao usar o comando `horizon:listen`, você não precisa reiniciar manualmente o Horizon quando quiser recarregar seu código atualizado. Antes de usar este recurso, você deve garantir que o [Node](https://nodejs.org) esteja instalado em seu ambiente de desenvolvimento local. Além disso, você deve instalar a biblioteca de observação de arquivos [Chokidar](https://github.com/paulmillr/chokidar) em seu projeto:

```shell
npm install --save-dev chokidar
```

Depois que o Chokidar estiver instalado, você pode iniciar o Horizon usando o comando `horizon:listen`:

```shell
php artisan horizon:listen
```

Ao executar dentro do Docker ou Vagrant, você deve usar a opção `--poll`:

```shell
php artisan horizon:listen --poll
```

Você pode configurar os diretórios e arquivos que devem ser observados usando a opção de configuração `watch` no arquivo de configuração `config/horizon.php` da sua aplicação:

```php
'watch' => [
    'app',
    'bootstrap',
    'config',
    'database',
    'public/**/*.php',
    'resources/**/*.php',
    'routes',
    'composer.lock',
    '.env',
],
```

<a id="deploying-horizon"></a>
### Fazendo Deploy do Horizon

Quando estiver pronto para fazer deploy do Horizon no servidor real da sua aplicação, você deve configurar um monitor de processos para monitorar o comando `php artisan horizon` e reiniciá-lo caso ele saia inesperadamente. Não se preocupe, discutiremos como instalar um monitor de processos abaixo.

Durante o processo de deploy da sua aplicação, você deve instruir o processo do Horizon a ser encerrado para que seja reiniciado pelo seu monitor de processos e receba suas alterações de código:

```shell
php artisan horizon:terminate
```

<a id="installing-supervisor"></a>
#### Instalando o Supervisor

O Supervisor é um monitor de processos para o sistema operacional Linux e reiniciará automaticamente seu processo `horizon` se ele parar de executar. Para instalar o Supervisor no Ubuntu, você pode usar o comando a seguir. Se você não estiver usando o Ubuntu, provavelmente poderá instalar o Supervisor usando o gerenciador de pacotes do seu sistema operacional:

```shell
sudo apt-get install supervisor
```

> **Note:**
> Se configurar o Supervisor por conta própria parecer complicado, considere usar o [Laravel Cloud](https://cloud.laravel.com), que pode gerenciar processos em segundo plano para suas aplicações Laravel.

<a id="supervisor-configuration"></a>
#### Configuração do Supervisor

Os arquivos de configuração do Supervisor são normalmente armazenados no diretório `/etc/supervisor/conf.d` do seu servidor. Dentro deste diretório, você pode criar qualquer número de arquivos de configuração que instruam o supervisor sobre como seus processos devem ser monitorados. Por exemplo, vamos criar um arquivo `horizon.conf` que inicia e monitora um processo `horizon`:

```ini
[program:horizon]
process_name=%(program_name)s
command=php /home/forge/example.com/artisan horizon
autostart=true
autorestart=true
user=forge
redirect_stderr=true
stdout_logfile=/home/forge/example.com/horizon.log
stopwaitsecs=3600
```

Ao definir sua configuração do Supervisor, você deve garantir que o valor de `stopwaitsecs` seja maior que o número de segundos consumidos pelo seu job de execução mais longa. Caso contrário, o Supervisor pode matar o job antes que ele termine de ser processado.

> **Warning:**
> Embora os exemplos acima sejam válidos para servidores baseados em Ubuntu, a localização e a extensão de arquivo esperadas dos arquivos de configuração do Supervisor podem variar entre outros sistemas operacionais de servidor. Consulte a documentação do seu servidor para mais informações.

<a id="starting-supervisor"></a>
#### Iniciando o Supervisor

Depois que o arquivo de configuração for criado, você pode atualizar a configuração do Supervisor e iniciar os processos monitorados usando os comandos a seguir:

```shell
sudo supervisorctl reread

sudo supervisorctl update

sudo supervisorctl start horizon
```

> **Note:**
> Para mais informações sobre a execução do Supervisor, consulte a [documentação do Supervisor](http://supervisord.org/index.html).

<a id="tags"></a>
## Tags

O Horizon permite que você atribua "tags" a jobs, incluindo mailables, eventos de broadcast, notificações e listeners de eventos enfileirados. Na verdade, o Horizon marcará (tag) a maioria dos jobs de forma inteligente e automática, dependendo dos models Eloquent que estão anexados ao job. Por exemplo, veja o seguinte job:

```php
<?php

namespace App\Jobs;

use App\Models\Video;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class RenderVideo implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Video $video,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // ...
    }
}
```

Se este job for enfileirado com uma instância de `App\Models\Video` que tem um atributo `id` de `1`, ele receberá automaticamente a tag `App\Models\Video:1`. Isso ocorre porque o Horizon pesquisará as propriedades do job em busca de quaisquer models Eloquent. Se models Eloquent forem encontrados, o Horizon marcará o job de forma inteligente usando o nome da classe do model e a chave primária:

```php
use App\Jobs\RenderVideo;
use App\Models\Video;

$video = Video::find(1);

RenderVideo::dispatch($video);
```

<a id="manually-tagging-jobs"></a>
#### Marcando Jobs Manualmente

Se você quiser definir manualmente as tags para um dos seus objetos enfileiráveis, pode definir um método `tags` na classe:

```php
class RenderVideo implements ShouldQueue
{
    /**
     * Get the tags that should be assigned to the job.
     *
     * @return array<int, string>
     */
    public function tags(): array
    {
        return ['render', 'video:'.$this->video->id];
    }
}
```

<a id="manually-tagging-event-listeners"></a>
#### Marcando Listeners de Eventos Manualmente

Ao recuperar as tags para um listener de evento enfileirado, o Horizon passará automaticamente a instância do evento para o método `tags`, permitindo que você adicione dados do evento às tags:

```php
class SendRenderNotifications implements ShouldQueue
{
    /**
     * Get the tags that should be assigned to the listener.
     *
     * @return array<int, string>
     */
    public function tags(VideoRendered $event): array
    {
        return ['video:'.$event->video->id];
    }
}
```

<a id="notifications"></a>
## Notificações

> **Warning:**
> Ao configurar o Horizon para enviar notificações via Slack ou SMS, você deve revisar os [pré-requisitos para o canal de notificação relevante](/pt-br/notifications/).

Se você quiser ser notificado quando uma das suas filas tiver um longo tempo de espera, pode usar os métodos `Horizon::routeMailNotificationsTo`, `Horizon::routeSlackNotificationsTo` e `Horizon::routeSmsNotificationsTo`. Você pode chamar esses métodos a partir do método `boot` do `App\Providers\HorizonServiceProvider` da sua aplicação:

```php
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    parent::boot();

    Horizon::routeSmsNotificationsTo('15556667777');
    Horizon::routeMailNotificationsTo('example@example.com');
    Horizon::routeSlackNotificationsTo('slack-webhook-url', '#channel');
}
```

<a id="configuring-notification-wait-time-thresholds"></a>
#### Configurando Limites de Tempo de Espera para Notificações

Você pode configurar quantos segundos são considerados uma "longa espera" no arquivo de configuração `config/horizon.php` da sua aplicação. A opção de configuração `waits` dentro deste arquivo permite que você controle o limite de longa espera para cada combinação de conexão / fila. Qualquer combinação de conexão / fila não definida terá o padrão de um limite de longa espera de 60 segundos:

```php
'waits' => [
    'redis:critical' => 30,
    'redis:default' => 60,
    'redis:batch' => 120,
],
```

Definir o limite de uma fila como `0` desabilitará as notificações de longa espera para essa fila.

<a id="metrics"></a>
## Métricas

O Horizon inclui um dashboard de métricas que fornece informações sobre os tempos de espera e o throughput dos seus jobs e filas. Para preencher este dashboard, você deve configurar o comando Artisan `snapshot` do Horizon para ser executado a cada cinco minutos no arquivo `routes/console.php` da sua aplicação:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('horizon:snapshot')->everyFiveMinutes();
```

Você pode configurar quantos snapshots o Horizon retém para seus gráficos de métricas usando a opção `metrics.trim_snapshots` no arquivo de configuração `config/horizon.php` da sua aplicação. Como esta opção limita o número de snapshots em vez de sua idade, o período de retenção depende da frequência com que o comando `horizon:snapshot` é executado:

```php
'metrics' => [
    'trim_snapshots' => [
        'job' => 24,
        'queue' => 24,
    ],
],
```

Se você quiser excluir todos os dados de métricas, pode invocar o comando Artisan `horizon:clear-metrics`:

```shell
php artisan horizon:clear-metrics
```

<a id="deleting-failed-jobs"></a>
## Excluindo Jobs com Falha

Se você quiser excluir um job com falha, pode usar o comando `horizon:forget`. O comando `horizon:forget` aceita o ID ou UUID do job com falha como seu único argumento:

```shell
php artisan horizon:forget 5
```

Se você quiser excluir todos os jobs com falha, pode fornecer a opção `--all` ao comando `horizon:forget`:

```shell
php artisan horizon:forget --all
```

<a id="clearing-jobs-from-queues"></a>
## Limpando Jobs das Filas

Se você quiser excluir todos os jobs da fila padrão da sua aplicação, pode fazê-lo usando o comando Artisan `horizon:clear`:

```shell
php artisan horizon:clear
```

Você pode fornecer a opção `queue` para excluir jobs de uma fila específica:

```shell
php artisan horizon:clear --queue=emails
```
