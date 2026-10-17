---
title: "Laravel Homestead"
---

- [Introdução](#introduction)
- [Instalação e Configuração](#installation-and-setup)
    - [Primeiros Passos](#first-steps)
    - [Configurando o Homestead](#configuring-homestead)
    - [Configurando Sites Nginx](#configuring-nginx-sites)
    - [Configurando Serviços](#configuring-services)
    - [Iniciando a Vagrant Box](#launching-the-vagrant-box)
    - [Instalação Por Projeto](#per-project-installation)
    - [Instalando Recursos Opcionais](#installing-optional-features)
    - [Aliases](#aliases)
- [Atualizando o Homestead](#updating-homestead)
- [Uso Diário](#daily-usage)
    - [Conectando via SSH](#connecting-via-ssh)
    - [Adicionando Sites Adicionais](#adding-additional-sites)
    - [Variáveis de Ambiente](#environment-variables)
    - [Portas](#ports)
    - [Versões do PHP](#php-versions)
    - [Conectando a Bancos de Dados](#connecting-to-databases)
    - [Backups de Banco de Dados](#database-backups)
    - [Configurando Agendamentos Cron](#configuring-cron-schedules)
    - [Configurando o Mailpit](#configuring-mailpit)
    - [Configurando o Minio](#configuring-minio)
    - [Laravel Dusk](#laravel-dusk)
    - [Compartilhando Seu Ambiente](#sharing-your-environment)
- [Depuração e Profiling](#debugging-and-profiling)
    - [Depurando Requisições Web Com Xdebug](#debugging-web-requests)
    - [Depurando Aplicações CLI](#debugging-cli-applications)
    - [Profiling de Aplicações Com Blackfire](#profiling-applications-with-blackfire)
- [Interfaces de Rede](#network-interfaces)
- [Estendendo o Homestead](#extending-homestead)
- [Configurações Específicas do Provider](#provider-specific-settings)
    - [VirtualBox](#provider-specific-virtualbox)

<a id="introduction"></a>
## Introdução

> **Warning:**
> O Laravel Homestead é um pacote legado que não é mais mantido ativamente. O [Laravel Sail](/pt-br/sail/) pode ser usado como uma alternativa moderna.

O Laravel se esforça para tornar toda a experiência de desenvolvimento PHP agradável, incluindo seu ambiente de desenvolvimento local. O [Laravel Homestead](https://github.com/laravel/homestead) é uma Vagrant box oficial e pré-empacotada que fornece um ambiente de desenvolvimento maravilhoso sem exigir que você instale PHP, um servidor web ou qualquer outro software de servidor em sua máquina local.

O [Vagrant](https://www.vagrantup.com) fornece uma maneira simples e elegante de gerenciar e provisionar Máquinas Virtuais. As Vagrant boxes são completamente descartáveis. Se algo der errado, você pode destruir e recriar a box em minutos!

O Homestead roda em qualquer sistema Windows, macOS ou Linux e inclui Nginx, PHP, MySQL, PostgreSQL, Redis, Memcached, Node e todo o outro software que você precisa para desenvolver aplicações Laravel incríveis.

> **Warning:**
> Se você estiver usando Windows, pode precisar habilitar a virtualização de hardware (VT-x). Ela geralmente pode ser habilitada através da sua BIOS. Se você estiver usando Hyper-V em um sistema UEFI, pode precisar adicionalmente desabilitar o Hyper-V para acessar o VT-x.

<a id="included-software"></a>
### Software Incluído

<style>
    #software-list > ul {
        column-count: 2; -moz-column-count: 2; -webkit-column-count: 2;
        column-gap: 5em; -moz-column-gap: 5em; -webkit-column-gap: 5em;
        line-height: 1.9;
    }
</style>

<div id="software-list" markdown="1">

- Ubuntu 22.04
- Git
- PHP 8.3
- PHP 8.2
- PHP 8.1
- PHP 8.0
- PHP 7.4
- PHP 7.3
- PHP 7.2
- PHP 7.1
- PHP 7.0
- PHP 5.6
- Nginx
- MySQL 8.0
- lmm
- Sqlite3
- PostgreSQL 15
- Composer
- Docker
- Node (With Yarn, Bower, Grunt, and Gulp)
- Redis
- Memcached
- Beanstalkd
- Mailpit
- avahi
- ngrok
- Xdebug
- XHProf / Tideways / XHGui
- wp-cli

</div>

<a id="optional-software"></a>
### Software Opcional

<style>
    #software-list > ul {
        column-count: 2; -moz-column-count: 2; -webkit-column-count: 2;
        column-gap: 5em; -moz-column-gap: 5em; -webkit-column-gap: 5em;
        line-height: 1.9;
    }
</style>

<div id="software-list" markdown="1">

- Apache
- Blackfire
- Cassandra
- Chronograf
- CouchDB
- Crystal & Lucky Framework
- Elasticsearch
- EventStoreDB
- Flyway
- Gearman
- Go
- Grafana
- InfluxDB
- Logstash
- MariaDB
- Meilisearch
- MinIO
- MongoDB
- Neo4j
- Oh My Zsh
- Open Resty
- PM2
- Python
- R
- RabbitMQ
- Rust
- RVM (Ruby Version Manager)
- Solr
- TimescaleDB
- Trader <small>(PHP extension)</small>
- Webdriver & Laravel Dusk Utilities

</div>

<a id="installation-and-setup"></a>
## Instalação e Configuração

<a id="first-steps"></a>
### Primeiros Passos

Antes de iniciar seu ambiente Homestead, você deve instalar o [Vagrant](https://developer.hashicorp.com/vagrant/downloads) bem como um dos seguintes providers suportados:

- [VirtualBox 6.1.x](https://www.virtualbox.org/wiki/Download_Old_Builds_6_1)
- [Parallels](https://www.parallels.com/products/desktop/)

Todos esses pacotes de software fornecem instaladores visuais fáceis de usar para todos os sistemas operacionais populares.

Para usar o provider Parallels, você precisará instalar o [plug-in Parallels Vagrant](https://github.com/Parallels/vagrant-parallels). Ele é gratuito.

<a id="installing-homestead"></a>
#### Instalando o Homestead

Você pode instalar o Homestead clonando o repositório do Homestead em sua máquina host. Considere clonar o repositório em uma pasta `Homestead` dentro do seu diretório "home", pois a máquina virtual Homestead servirá como host para todas as suas aplicações Laravel. Ao longo desta documentação, nos referiremos a este diretório como seu "diretório Homestead":

```shell
git clone https://github.com/laravel/homestead.git ~/Homestead
```

Após clonar o repositório do Laravel Homestead, você deve fazer checkout da branch `release`. Essa branch sempre contém a última versão estável do Homestead:

```shell
cd ~/Homestead

git checkout release
```

Em seguida, execute o comando `bash init.sh` a partir do diretório Homestead para criar o arquivo de configuração `Homestead.yaml`. O arquivo `Homestead.yaml` é onde você configurará todas as configurações da sua instalação do Homestead. Este arquivo será colocado no diretório Homestead:

```shell
# macOS / Linux...
bash init.sh

# Windows...
init.bat
```

<a id="configuring-homestead"></a>
### Configurando o Homestead

<a id="setting-your-provider"></a>
#### Definindo Seu Provider

A chave `provider` em seu arquivo `Homestead.yaml` indica qual provider do Vagrant deve ser usado: `virtualbox` ou `parallels`:

    provider: virtualbox

> **Warning:**
> Se você estiver usando Apple Silicon, o provider Parallels é obrigatório.

<a id="configuring-shared-folders"></a>
#### Configurando Pastas Compartilhadas

A propriedade `folders` do arquivo `Homestead.yaml` lista todas as pastas que você deseja compartilhar com seu ambiente Homestead. À medida que os arquivos dentro dessas pastas são alterados, eles serão mantidos sincronizados entre sua máquina local e o ambiente virtual Homestead. Você pode configurar quantas pastas compartilhadas forem necessárias:

```yaml
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
```

> **Warning:**
> Usuários do Windows não devem usar a sintaxe de caminho `~/` e, em vez disso, devem usar o caminho completo para seu projeto, como `C:\Users\user\Code\project1`.

Você deve sempre mapear aplicações individuais para seu próprio mapeamento de pasta em vez de mapear um único diretório grande que contém todas as suas aplicações. Quando você mapeia uma pasta, a máquina virtual deve acompanhar todo o IO de disco para *cada* arquivo na pasta. Você pode experimentar desempenho reduzido se tiver um grande número de arquivos em uma pasta:

```yaml
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
    - map: ~/code/project2
      to: /home/vagrant/project2
```

> **Warning:**
> Você nunca deve montar `.` (o diretório atual) ao usar o Homestead. Isso faz com que o Vagrant não mapeie a pasta atual para `/vagrant` e irá quebrar recursos opcionais e causar resultados inesperados durante o provisionamento.

Para habilitar o [NFS](https://developer.hashicorp.com/vagrant/docs/synced-folders/nfs), você pode adicionar uma opção `type` ao seu mapeamento de pasta:

```yaml
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
      type: "nfs"
```

> **Warning:**
> Ao usar NFS no Windows, você deve considerar a instalação do plug-in [vagrant-winnfsd](https://github.com/winnfsd/vagrant-winnfsd). Este plug-in manterá as permissões corretas de usuário / grupo para arquivos e diretórios dentro da máquina virtual Homestead.

Você também pode passar quaisquer opções suportadas pelas [Synced Folders](https://developer.hashicorp.com/vagrant/docs/synced-folders/basic_usage) do Vagrant listando-as sob a chave `options`:

```yaml
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
      type: "rsync"
      options:
          rsync__args: ["--verbose", "--archive", "--delete", "-zz"]
          rsync__exclude: ["node_modules"]
```

<a id="configuring-nginx-sites"></a>
### Configurando Sites Nginx

Não está familiarizado com Nginx? Sem problema. A propriedade `sites` do seu arquivo `Homestead.yaml` permite mapear facilmente um "domínio" para uma pasta em seu ambiente Homestead. Uma configuração de site de exemplo está incluída no arquivo `Homestead.yaml`. Novamente, você pode adicionar quantos sites forem necessários ao seu ambiente Homestead. O Homestead pode servir como um ambiente virtualizado e conveniente para cada aplicação Laravel em que você está trabalhando:

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
```

Se você alterar a propriedade `sites` após provisionar a máquina virtual Homestead, deve executar o comando `vagrant reload --provision` em seu terminal para atualizar a configuração do Nginx na máquina virtual.

> **Warning:**
> Os scripts do Homestead são construídos para serem o mais idempotentes possível. No entanto, se você estiver enfrentando problemas durante o provisionamento, deve destruir e reconstruir a máquina executando o comando `vagrant destroy && vagrant up`.

<a id="hostname-resolution"></a>
#### Resolução de Nome de Host

O Homestead publica nomes de host usando `mDNS` para resolução automática de host. Se você definir `hostname: homestead` em seu arquivo `Homestead.yaml`, o host estará disponível em `homestead.local`. As distribuições desktop macOS, iOS e Linux incluem suporte a `mDNS` por padrão. Se você estiver usando Windows, deve instalar o [Bonjour Print Services for Windows](https://support.apple.com/kb/DL999?viewlocale=en_US&locale=en_US).

Usar nomes de host automáticos funciona melhor para [instalações por projeto](#per-project-installation) do Homestead. Se você hospedar múltiplos sites em uma única instância do Homestead, pode adicionar os "domínios" dos seus sites ao arquivo `hosts` em sua máquina. O arquivo `hosts` redirecionará as requisições para seus sites Homestead para a máquina virtual Homestead. No macOS e Linux, este arquivo está localizado em `/etc/hosts`. No Windows, ele está localizado em `C:\Windows\System32\drivers\etc\hosts`. As linhas que você adicionar a este arquivo terão a seguinte aparência:

```text
192.168.56.56  homestead.test
```

Certifique-se de que o endereço IP listado seja o definido em seu arquivo `Homestead.yaml`. Depois de adicionar o domínio ao seu arquivo `hosts` e iniciar a Vagrant box, você poderá acessar o site através do seu navegador web:

```shell
http://homestead.test
```

<a id="configuring-services"></a>
### Configurando Serviços

O Homestead inicia vários serviços por padrão; no entanto, você pode personalizar quais serviços são habilitados ou desabilitados durante o provisionamento. Por exemplo, você pode habilitar o PostgreSQL e desabilitar o MySQL modificando a opção `services` em seu arquivo `Homestead.yaml`:

```yaml
services:
    - enabled:
        - "postgresql"
    - disabled:
        - "mysql"
```

Os serviços especificados serão iniciados ou parados com base em sua ordem nas diretivas `enabled` e `disabled`.

<a id="launching-the-vagrant-box"></a>
### Iniciando a Vagrant Box

Depois de editar o `Homestead.yaml` de acordo com suas preferências, execute o comando `vagrant up` a partir do seu diretório Homestead. O Vagrant inicializará a máquina virtual e configurará automaticamente suas pastas compartilhadas e sites Nginx.

Para destruir a máquina, você pode usar o comando `vagrant destroy`.

<a id="per-project-installation"></a>
### Instalação Por Projeto

Em vez de instalar o Homestead globalmente e compartilhar a mesma máquina virtual Homestead entre todos os seus projetos, você pode, em vez disso, configurar uma instância do Homestead para cada projeto que você gerencia. Instalar o Homestead por projeto pode ser benéfico se você quiser enviar um `Vagrantfile` com seu projeto, permitindo que outras pessoas trabalhando no projeto executem `vagrant up` imediatamente após clonar o repositório do projeto.

Você pode instalar o Homestead em seu projeto usando o gerenciador de pacotes Composer:

```shell
composer require laravel/homestead --dev
```

Depois que o Homestead for instalado, invoque o comando `make` do Homestead para gerar o `Vagrantfile` e o arquivo `Homestead.yaml` para seu projeto. Esses arquivos serão colocados na raiz do seu projeto. O comando `make` configurará automaticamente as diretivas `sites` e `folders` no arquivo `Homestead.yaml`:

```shell
# macOS / Linux...
php vendor/bin/homestead make

# Windows...
vendor\\bin\\homestead make
```

Em seguida, execute o comando `vagrant up` em seu terminal e acesse seu projeto em `http://homestead.test` no seu navegador. Lembre-se, você ainda precisará adicionar uma entrada no arquivo `/etc/hosts` para `homestead.test` ou o domínio de sua escolha se não estiver usando a [resolução automática de nome de host](#hostname-resolution).

<a id="installing-optional-features"></a>
### Instalando Recursos Opcionais

O software opcional é instalado usando a opção `features` em seu arquivo `Homestead.yaml`. A maioria dos recursos pode ser habilitada ou desabilitada com um valor booleano, enquanto alguns recursos permitem múltiplas opções de configuração:

```yaml
features:
    - blackfire:
        server_id: "server_id"
        server_token: "server_value"
        client_id: "client_id"
        client_token: "client_value"
    - cassandra: true
    - chronograf: true
    - couchdb: true
    - crystal: true
    - dragonflydb: true
    - elasticsearch:
        version: 7.9.0
    - eventstore: true
        version: 21.2.0
    - flyway: true
    - gearman: true
    - golang: true
    - grafana: true
    - influxdb: true
    - logstash: true
    - mariadb: true
    - meilisearch: true
    - minio: true
    - mongodb: true
    - neo4j: true
    - ohmyzsh: true
    - openresty: true
    - pm2: true
    - python: true
    - r-base: true
    - rabbitmq: true
    - rustc: true
    - rvm: true
    - solr: true
    - timescaledb: true
    - trader: true
    - webdriver: true
```

<a id="elasticsearch"></a>
#### Elasticsearch

Você pode especificar uma versão suportada do Elasticsearch, que deve ser um número de versão exato (major.minor.patch). A instalação padrão criará um cluster chamado 'homestead'. Você nunca deve dar ao Elasticsearch mais da metade da memória do sistema operacional, então certifique-se de que sua máquina virtual Homestead tenha pelo menos o dobro da alocação do Elasticsearch.

> **Note:**
> Confira a [documentação do Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current) para aprender como personalizar sua configuração.

<a id="mariadb"></a>
#### MariaDB

Habilitar o MariaDB removerá o MySQL e instalará o MariaDB. Sua aplicação deve usar o driver de banco de dados `mariadb` em vez de `mysql`: ambos irão conectar, mas apenas o driver `mariadb` emite SQL específico do MariaDB, como consultas de distância vetorial.

<a id="mongodb"></a>
#### MongoDB

A instalação padrão do MongoDB definirá o nome de usuário do banco de dados como `homestead` e a senha correspondente como `secret`.

<a id="neo4j"></a>
#### Neo4j

A instalação padrão do Neo4j definirá o nome de usuário do banco de dados como `homestead` e a senha correspondente como `secret`. Para acessar o navegador do Neo4j, visite `http://homestead.test:7474` através do seu navegador web. As portas `7687` (Bolt), `7474` (HTTP) e `7473` (HTTPS) estão prontas para atender requisições do cliente Neo4j.

<a id="aliases"></a>
### Aliases

Você pode adicionar aliases Bash à sua máquina virtual Homestead modificando o arquivo `aliases` dentro do seu diretório Homestead:

```shell
alias c='clear'
alias ..='cd ..'
```

Depois de atualizar o arquivo `aliases`, você deve reprovisionar a máquina virtual Homestead usando o comando `vagrant reload --provision`. Isso garantirá que seus novos aliases estejam disponíveis na máquina.

<a id="updating-homestead"></a>
## Atualizando o Homestead

Antes de começar a atualizar o Homestead, você deve garantir que removeu sua máquina virtual atual executando o seguinte comando em seu diretório Homestead:

```shell
vagrant destroy
```

Em seguida, você precisa atualizar o código-fonte do Homestead. Se você clonou o repositório, pode executar os seguintes comandos no local onde originalmente clonou o repositório:

```shell
git fetch

git pull origin release
```

Esses comandos puxam o código mais recente do Homestead do repositório GitHub, buscam as tags mais recentes e, então, fazem checkout da última versão com tag. Você pode encontrar a última versão estável na [página de releases do GitHub](https://github.com/laravel/homestead/releases) do Homestead.

Se você instalou o Homestead através do arquivo `composer.json` do seu projeto, deve garantir que seu arquivo `composer.json` contenha `"laravel/homestead": "^12"` e atualizar suas dependências:

```shell
composer update
```

Em seguida, você deve atualizar a Vagrant box usando o comando `vagrant box update`:

```shell
vagrant box update
```

Depois de atualizar a Vagrant box, você deve executar o comando `bash init.sh` a partir do diretório Homestead para atualizar os arquivos de configuração adicionais do Homestead. Será perguntado se você deseja sobrescrever seus arquivos `Homestead.yaml`, `after.sh` e `aliases` existentes:

```shell
# macOS / Linux...
bash init.sh

# Windows...
init.bat
```

Finalmente, você precisará regenerar sua máquina virtual Homestead para utilizar a instalação mais recente do Vagrant:

```shell
vagrant up
```

<a id="daily-usage"></a>
## Uso Diário

<a id="connecting-via-ssh"></a>
### Conectando via SSH

Você pode se conectar via SSH à sua máquina virtual executando o comando de terminal `vagrant ssh` a partir do seu diretório Homestead.

<a id="adding-additional-sites"></a>
### Adicionando Sites Adicionais

Depois que seu ambiente Homestead estiver provisionado e em execução, você pode querer adicionar sites Nginx adicionais para seus outros projetos Laravel. Você pode executar quantos projetos Laravel desejar em um único ambiente Homestead. Para adicionar um site adicional, adicione o site ao seu arquivo `Homestead.yaml`.

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
    - map: another.test
      to: /home/vagrant/project2/public
```

> **Warning:**
> Você deve garantir que configurou um [mapeamento de pasta](#configuring-shared-folders) para o diretório do projeto antes de adicionar o site.

Se o Vagrant não estiver gerenciando automaticamente seu arquivo "hosts", você pode precisar adicionar o novo site a esse arquivo também. No macOS e Linux, este arquivo está localizado em `/etc/hosts`. No Windows, ele está localizado em `C:\Windows\System32\drivers\etc\hosts`:

```text
192.168.56.56  homestead.test
192.168.56.56  another.test
```

Depois que o site for adicionado, execute o comando de terminal `vagrant reload --provision` a partir do seu diretório Homestead.

<a id="site-types"></a>
#### Tipos de Site

O Homestead suporta vários "tipos" de sites que permitem executar facilmente projetos que não são baseados em Laravel. Por exemplo, podemos facilmente adicionar uma aplicação Statamic ao Homestead usando o tipo de site `statamic`:

```yaml
sites:
    - map: statamic.test
      to: /home/vagrant/my-symfony-project/web
      type: "statamic"
```

Os tipos de site disponíveis são: `apache`, `apache-proxy`, `apigility`, `expressive`, `laravel` (o padrão), `proxy` (para nginx), `silverstripe`, `statamic`, `symfony2`, `symfony4` e `zf`.

<a id="site-parameters"></a>
#### Parâmetros de Site

Você pode adicionar valores `fastcgi_param` adicionais do Nginx ao seu site através da diretiva de site `params`:

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
      params:
          - key: FOO
            value: BAR
```

<a id="environment-variables"></a>
### Variáveis de Ambiente

Você pode definir variáveis de ambiente globais adicionando-as ao seu arquivo `Homestead.yaml`:

```yaml
variables:
    - key: APP_ENV
      value: local
    - key: FOO
      value: bar
```

Depois de atualizar o arquivo `Homestead.yaml`, certifique-se de reprovisionar a máquina executando o comando `vagrant reload --provision`. Isso atualizará a configuração do PHP-FPM para todas as versões do PHP instaladas e também atualizará o ambiente para o usuário `vagrant`.

<a id="ports"></a>
### Portas

Por padrão, as seguintes portas são encaminhadas para seu ambiente Homestead:

<div class="content-list" markdown="1">

- **HTTP:** 8000 &rarr; Encaminha Para 80
- **HTTPS:** 44300 &rarr; Encaminha Para 443

</div>

<a id="forwarding-additional-ports"></a>
#### Encaminhando Portas Adicionais

Se desejar, você pode encaminhar portas adicionais para a Vagrant box definindo uma entrada de configuração `ports` em seu arquivo `Homestead.yaml`. Depois de atualizar o arquivo `Homestead.yaml`, certifique-se de reprovisionar a máquina executando o comando `vagrant reload --provision`:

```yaml
ports:
    - send: 50000
      to: 5000
    - send: 7777
      to: 777
      protocol: udp
```

Abaixo está uma lista de portas de serviço adicionais do Homestead que você pode querer mapear da sua máquina host para sua Vagrant box:

<div class="content-list" markdown="1">

- **SSH:** 2222 &rarr; Para 22
- **ngrok UI:** 4040 &rarr; Para 4040
- **MySQL:** 33060 &rarr; Para 3306
- **PostgreSQL:** 54320 &rarr; Para 5432
- **MongoDB:** 27017 &rarr; Para 27017
- **Mailpit:** 8025 &rarr; Para 8025
- **Minio:** 9600 &rarr; Para 9600

</div>

<a id="php-versions"></a>
### Versões do PHP

O Homestead suporta a execução de múltiplas versões do PHP na mesma máquina virtual. Você pode especificar qual versão do PHP usar para um determinado site em seu arquivo `Homestead.yaml`. As versões do PHP disponíveis são: "5.6", "7.0", "7.1", "7.2", "7.3", "7.4", "8.0", "8.1", "8.2" e "8.3" (a padrão):

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
      php: "7.1"
```

[Dentro da sua máquina virtual Homestead](#connecting-via-ssh), você pode usar qualquer uma das versões suportadas do PHP via CLI:

```shell
php5.6 artisan list
php7.0 artisan list
php7.1 artisan list
php7.2 artisan list
php7.3 artisan list
php7.4 artisan list
php8.0 artisan list
php8.1 artisan list
php8.2 artisan list
php8.3 artisan list
```

Você pode alterar a versão padrão do PHP usada pela CLI emitindo os seguintes comandos de dentro da sua máquina virtual Homestead:

```shell
php56
php70
php71
php72
php73
php74
php80
php81
php82
php83
```

<a id="connecting-to-databases"></a>
### Conectando a Bancos de Dados

Um banco de dados `homestead` é configurado tanto para MySQL quanto para PostgreSQL por padrão. Para conectar ao seu banco de dados MySQL ou PostgreSQL a partir do cliente de banco de dados da sua máquina host, você deve conectar a `127.0.0.1` na porta `33060` (MySQL) ou `54320` (PostgreSQL). O nome de usuário e a senha para ambos os bancos de dados são `homestead` / `secret`.

> **Warning:**
> Você deve usar essas portas não padrão apenas ao conectar aos bancos de dados a partir da sua máquina host. Você usará as portas padrão 3306 e 5432 no arquivo de configuração `database` da sua aplicação Laravel, já que o Laravel está rodando _dentro_ da máquina virtual.

<a id="database-backups"></a>
### Backups de Banco de Dados

O Homestead pode fazer backup automaticamente do seu banco de dados quando sua máquina virtual Homestead é destruída. Para utilizar este recurso, você deve estar usando o Vagrant 2.1.0 ou superior. Ou, se estiver usando uma versão mais antiga do Vagrant, deve instalar o plug-in `vagrant-triggers`. Para habilitar backups automáticos de banco de dados, adicione a seguinte linha ao seu arquivo `Homestead.yaml`:

```yaml
backup: true
```

Uma vez configurado, o Homestead exportará seus bancos de dados para os diretórios `.backup/mysql_backup` e `.backup/postgres_backup` quando o comando `vagrant destroy` for executado. Esses diretórios podem ser encontrados na pasta onde você instalou o Homestead ou na raiz do seu projeto se estiver usando o método de [instalação por projeto](#per-project-installation).

<a id="configuring-cron-schedules"></a>
### Configurando Agendamentos Cron

O Laravel fornece uma maneira conveniente de [agendar jobs cron](/pt-br/scheduling/) agendando um único comando Artisan `schedule:run` para rodar a cada minuto. O comando `schedule:run` examinará o agendamento de jobs definido em seu arquivo `routes/console.php` para determinar quais tarefas agendadas executar.

Se você quiser que o comando `schedule:run` seja executado para um site do Homestead, pode definir a opção `schedule` como `true` ao definir o site:

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
      schedule: true
```

O job cron para o site será definido no diretório `/etc/cron.d` da máquina virtual Homestead.

<a id="configuring-mailpit"></a>
### Configurando o Mailpit

O [Mailpit](https://github.com/axllent/mailpit) permite que você intercepte seu e-mail de saída e o examine sem realmente enviar o e-mail aos seus destinatários. Para começar, atualize o arquivo `.env` da sua aplicação para usar as seguintes configurações de e-mail:

```ini
MAIL_MAILER=smtp
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
```

Depois que o Mailpit for configurado, você pode acessar o dashboard do Mailpit em `http://localhost:8025`.

<a id="configuring-minio"></a>
### Configurando o Minio

O [Minio](https://github.com/minio/minio) é um servidor de armazenamento de objetos open source com uma API compatível com o Amazon S3. Para instalar o Minio, atualize seu arquivo `Homestead.yaml` com a seguinte opção de configuração na seção [features](#installing-optional-features):

    minio: true

Por padrão, o Minio está disponível na porta 9600. Você pode acessar o painel de controle do Minio visitando `http://localhost:9600`. A access key padrão é `homestead`, enquanto a secret key padrão é `secretkey`. Ao acessar o Minio, você deve sempre usar a região `us-east-1`.

Para usar o Minio, certifique-se de que seu arquivo `.env` tenha as seguintes opções:

```ini
AWS_USE_PATH_STYLE_ENDPOINT=true
AWS_ENDPOINT=http://localhost:9600
AWS_ACCESS_KEY_ID=homestead
AWS_SECRET_ACCESS_KEY=secretkey
AWS_DEFAULT_REGION=us-east-1
```

Para provisionar buckets "S3" powered pelo Minio, adicione uma diretiva `buckets` ao seu arquivo `Homestead.yaml`. Depois de definir seus buckets, você deve executar o comando `vagrant reload --provision` em seu terminal:

```yaml
buckets:
    - name: your-bucket
      policy: public
    - name: your-private-bucket
      policy: none
```

Os valores de `policy` suportados incluem: `none`, `download`, `upload` e `public`.

<a id="laravel-dusk"></a>
### Laravel Dusk

Para executar testes do [Laravel Dusk](/pt-br/dusk/) dentro do Homestead, você deve habilitar o [recurso webdriver](#installing-optional-features) em sua configuração do Homestead:

```yaml
features:
    - webdriver: true
```

Depois de habilitar o recurso `webdriver`, você deve executar o comando `vagrant reload --provision` em seu terminal.

<a id="sharing-your-environment"></a>
### Compartilhando Seu Ambiente

Às vezes você pode querer compartilhar o que está trabalhando atualmente com colegas de trabalho ou um cliente. O Vagrant tem suporte integrado para isso através do comando `vagrant share`; no entanto, isso não funcionará se você tiver múltiplos sites configurados em seu arquivo `Homestead.yaml`.

Para resolver esse problema, o Homestead inclui seu próprio comando `share`. Para começar, [conecte-se via SSH à sua máquina virtual Homestead](#connecting-via-ssh) através de `vagrant ssh` e execute o comando `share homestead.test`. Esse comando compartilhará o site `homestead.test` do seu arquivo de configuração `Homestead.yaml`. Você pode substituir `homestead.test` por qualquer um dos seus outros sites configurados:

```shell
share homestead.test
```

Depois de executar o comando, você verá aparecer uma tela do Ngrok que contém o log de atividades e as URLs publicamente acessíveis para o site compartilhado. Se você quiser especificar uma região personalizada, subdomínio ou outra opção de runtime do Ngrok, pode adicioná-las ao seu comando `share`:

```shell
share homestead.test -region=eu -subdomain=laravel
```

Se você precisar compartilhar conteúdo via HTTPS em vez de HTTP, usar o comando `sshare` em vez de `share` permitirá que você faça isso.

> **Warning:**
> Lembre-se, o Vagrant é inerentemente inseguro e você está expondo sua máquina virtual à Internet ao executar o comando `share`.

<a id="debugging-and-profiling"></a>
## Depuração e Profiling

<a id="debugging-web-requests"></a>
### Depurando Requisições Web Com Xdebug

O Homestead inclui suporte para depuração passo a passo usando o [Xdebug](https://xdebug.org). Por exemplo, você pode acessar uma página em seu navegador e o PHP se conectará à sua IDE para permitir a inspeção e modificação do código em execução.

Por padrão, o Xdebug já está em execução e pronto para aceitar conexões. Se você precisar habilitar o Xdebug na CLI, execute o comando `sudo phpenmod xdebug` dentro da sua máquina virtual Homestead. Em seguida, siga as instruções da sua IDE para habilitar a depuração. Finalmente, configure seu navegador para acionar o Xdebug com uma extensão ou [bookmarklet](https://www.jetbrains.com/phpstorm/marklets/).

> **Warning:**
> O Xdebug faz o PHP rodar significativamente mais lento. Para desabilitar o Xdebug, execute `sudo phpdismod xdebug` dentro da sua máquina virtual Homestead e reinicie o serviço FPM.

<a id="autostarting-xdebug"></a>
#### Iniciando o Xdebug Automaticamente

Ao depurar testes funcionais que fazem requisições ao servidor web, é mais fácil iniciar a depuração automaticamente em vez de modificar os testes para passar um header ou cookie personalizado para acionar a depuração. Para forçar o Xdebug a iniciar automaticamente, modifique o arquivo `/etc/php/7.x/fpm/conf.d/20-xdebug.ini` dentro da sua máquina virtual Homestead e adicione a seguinte configuração:

```ini
; If Homestead.yaml contains a different subnet for the IP address, this address may be different...
xdebug.client_host = 192.168.10.1
xdebug.mode = debug
xdebug.start_with_request = yes
```

<a id="debugging-cli-applications"></a>
### Depurando Aplicações CLI

Para depurar uma aplicação PHP CLI, use o alias de shell `xphp` dentro da sua máquina virtual Homestead:

```shell
xphp /path/to/script
```

<a id="profiling-applications-with-blackfire"></a>
### Profiling de Aplicações Com Blackfire

O [Blackfire](https://blackfire.io/docs/introduction) é um serviço para profiling de requisições web e aplicações CLI. Ele oferece uma interface de usuário interativa que exibe dados de profile em call-graphs e timelines. Foi construído para uso em desenvolvimento, staging e produção, sem overhead para os usuários finais. Além disso, o Blackfire fornece verificações de desempenho, qualidade e segurança no código e nas configurações do `php.ini`.

O [Blackfire Player](https://blackfire.io/docs/player/index) é uma aplicação open-source de Web Crawling, Web Testing e Web Scraping que pode trabalhar em conjunto com o Blackfire para criar scripts de cenários de profiling.

Para habilitar o Blackfire, use a configuração "features" em seu arquivo de configuração do Homestead:

```yaml
features:
    - blackfire:
        server_id: "server_id"
        server_token: "server_value"
        client_id: "client_id"
        client_token: "client_value"
```

As credenciais de servidor e cliente do Blackfire [requerem uma conta Blackfire](https://blackfire.io/signup). O Blackfire oferece várias opções para fazer profiling de uma aplicação, incluindo uma ferramenta CLI e uma extensão de navegador. Por favor, [revise a documentação do Blackfire para mais detalhes](https://blackfire.io/docs/php/integrations/laravel/index).

<a id="network-interfaces"></a>
## Interfaces de Rede

A propriedade `networks` do arquivo `Homestead.yaml` configura interfaces de rede para sua máquina virtual Homestead. Você pode configurar quantas interfaces forem necessárias:

```yaml
networks:
    - type: "private_network"
      ip: "192.168.10.20"
```

Para habilitar uma interface [bridged](https://developer.hashicorp.com/vagrant/docs/networking/public_network), configure uma definição `bridge` para a rede e altere o tipo de rede para `public_network`:

```yaml
networks:
    - type: "public_network"
      ip: "192.168.10.20"
      bridge: "en1: Wi-Fi (AirPort)"
```

Para habilitar o [DHCP](https://developer.hashicorp.com/vagrant/docs/networking/public_network#dhcp), basta remover a opção `ip` da sua configuração:

```yaml
networks:
    - type: "public_network"
      bridge: "en1: Wi-Fi (AirPort)"
```

Para atualizar qual dispositivo a rede está usando, você pode adicionar uma opção `dev` à configuração da rede. O valor padrão de `dev` é `eth0`:

```yaml
networks:
    - type: "public_network"
      ip: "192.168.10.20"
      bridge: "en1: Wi-Fi (AirPort)"
      dev: "enp2s0"
```

<a id="extending-homestead"></a>
## Estendendo o Homestead

Você pode estender o Homestead usando o script `after.sh` na raiz do seu diretório Homestead. Dentro deste arquivo, você pode adicionar quaisquer comandos de shell que sejam necessários para configurar e personalizar adequadamente sua máquina virtual.

Ao personalizar o Homestead, o Ubuntu pode perguntar se você gostaria de manter a configuração original de um pacote ou sobrescrevê-la com um novo arquivo de configuração. Para evitar isso, você deve usar o seguinte comando ao instalar pacotes para evitar sobrescrever qualquer configuração previamente escrita pelo Homestead:

```shell
sudo apt-get -y \
    -o Dpkg::Options::="--force-confdef" \
    -o Dpkg::Options::="--force-confold" \
    install package-name
```

<a id="user-customizations"></a>
### Personalizações do Usuário

Ao usar o Homestead com sua equipe, você pode querer ajustar o Homestead para melhor se adequar ao seu estilo pessoal de desenvolvimento. Para isso, você pode criar um arquivo `user-customizations.sh` na raiz do seu diretório Homestead (o mesmo diretório que contém seu arquivo `Homestead.yaml`). Dentro deste arquivo, você pode fazer qualquer personalização que desejar; no entanto, o `user-customizations.sh` não deve ser versionado.

<a id="provider-specific-settings"></a>
## Configurações Específicas do Provider

<a id="provider-specific-virtualbox"></a>
### VirtualBox

<a id="natdnshostresolver"></a>
#### `natdnshostresolver`

Por padrão, o Homestead configura a definição `natdnshostresolver` como `on`. Isso permite que o Homestead use as configurações de DNS do seu sistema operacional host. Se você quiser sobrescrever esse comportamento, adicione as seguintes opções de configuração ao seu arquivo `Homestead.yaml`:

```yaml
provider: virtualbox
natdnshostresolver: 'off'
```
