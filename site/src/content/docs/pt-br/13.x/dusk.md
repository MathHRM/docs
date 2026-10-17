---
title: "Laravel Dusk"
---

- [Introdução](#introduction)
- [Instalação](#installation)
    - [Gerenciando Instalações do ChromeDriver](#managing-chromedriver-installations)
    - [Usando Outros Navegadores](#using-other-browsers)
- [Primeiros Passos](#getting-started)
    - [Gerando Testes](#generating-tests)
    - [Resetando o Banco de Dados Após Cada Teste](#resetting-the-database-after-each-test)
    - [Executando Testes](#running-tests)
    - [Tratamento de Ambiente](#environment-handling)
- [Noções Básicas de Navegador](#browser-basics)
    - [Criando Navegadores](#creating-browsers)
    - [Navegação](#navigation)
    - [Redimensionando Janelas do Navegador](#resizing-browser-windows)
    - [Macros de Navegador](#browser-macros)
    - [Autenticação](#authentication)
    - [Cookies](#cookies)
    - [Executando JavaScript](#executing-javascript)
    - [Capturando uma Screenshot](#taking-a-screenshot)
    - [Armazenando a Saída do Console em Disco](#storing-console-output-to-disk)
    - [Armazenando o Código-Fonte da Página em Disco](#storing-page-source-to-disk)
- [Interagindo com Elementos](#interacting-with-elements)
    - [Seletores Dusk](#dusk-selectors)
    - [Texto, Valores e Atributos](#text-values-and-attributes)
    - [Interagindo com Formulários](#interacting-with-forms)
    - [Anexando Arquivos](#attaching-files)
    - [Pressionando Botões](#pressing-buttons)
    - [Clicando em Links](#clicking-links)
    - [Usando o Teclado](#using-the-keyboard)
    - [Usando o Mouse](#using-the-mouse)
    - [Diálogos JavaScript](#javascript-dialogs)
    - [Interagindo com Iframes Inline](#interacting-with-iframes)
    - [Escopo de Seletores](#scoping-selectors)
    - [Aguardando Elementos](#waiting-for-elements)
    - [Rolando um Elemento para a Visualização](#scrolling-an-element-into-view)
- [Asserções Disponíveis](#available-assertions)
- [Páginas](#pages)
    - [Gerando Páginas](#generating-pages)
    - [Configurando Páginas](#configuring-pages)
    - [Navegando para Páginas](#navigating-to-pages)
    - [Seletores Abreviados](#shorthand-selectors)
    - [Métodos de Página](#page-methods)
- [Componentes](#components)
    - [Gerando Componentes](#generating-components)
    - [Usando Componentes](#using-components)
- [Integração Contínua](#continuous-integration)
    - [Heroku CI](#running-tests-on-heroku-ci)
    - [Travis CI](#running-tests-on-travis-ci)
    - [GitHub Actions](#running-tests-on-github-actions)
    - [Chipper CI](#running-tests-on-chipper-ci)

<a id="introduction"></a>
## Introdução

> **Warning:**
> O [Pest 4](https://pestphp.com/) agora inclui testes automatizados de navegador, que oferecem melhorias significativas de desempenho e usabilidade em comparação com o Laravel Dusk. Para novos projetos, recomendamos usar o Pest para testes de navegador.

[Laravel Dusk](https://github.com/laravel/dusk) fornece uma API expressiva e fácil de usar para automação e testes de navegador. Por padrão, o Dusk não exige que você instale JDK ou Selenium no seu computador local. Em vez disso, o Dusk utiliza uma instalação independente do [ChromeDriver](https://sites.google.com/chromium.org/driver). No entanto, você é livre para utilizar qualquer outro driver compatível com Selenium que desejar.

<a id="installation"></a>
## Instalação

Para começar, você deve instalar o [Google Chrome](https://www.google.com/chrome) e adicionar a dependência do Composer `laravel/dusk` ao seu projeto:

```shell
composer require laravel/dusk --dev
```

> **Warning:**
> Se você estiver registrando manualmente o service provider do Dusk, **nunca** deve registrá-lo no seu ambiente de produção, pois isso pode permitir que usuários arbitrários se autentiquem na sua aplicação.

Após instalar o pacote Dusk, execute o comando Artisan `dusk:install`. O comando `dusk:install` criará um diretório `tests/Browser`, um teste de exemplo do Dusk e instalará o binário do Chrome Driver para o seu sistema operacional:

```shell
php artisan dusk:install
```

Em seguida, defina a variável de ambiente `APP_URL` no arquivo `.env` da sua aplicação. Este valor deve corresponder à URL que você utiliza para acessar a aplicação em um navegador.

> **Note:**
> Se você estiver usando o [Laravel Sail](../sail/) para gerenciar seu ambiente de desenvolvimento local, consulte também a documentação do Sail sobre [configuração e execução dos testes do Dusk](../sail/#laravel-dusk).

<a id="managing-chromedriver-installations"></a>
### Gerenciando Instalações do ChromeDriver

Se você quiser instalar uma versão do ChromeDriver diferente da que é instalada pelo Laravel Dusk através do comando `dusk:install`, pode usar o comando `dusk:chrome-driver`:

```shell
# Install the latest version of ChromeDriver for your OS...
php artisan dusk:chrome-driver

# Install a given version of ChromeDriver for your OS...
php artisan dusk:chrome-driver 86

# Install a given version of ChromeDriver for all supported OSs...
php artisan dusk:chrome-driver --all

# Install the version of ChromeDriver that matches the detected version of Chrome / Chromium for your OS...
php artisan dusk:chrome-driver --detect
```

> **Warning:**
> O Dusk exige que os binários `chromedriver` sejam executáveis. Se você estiver tendo problemas para executar o Dusk, deve garantir que os binários são executáveis usando o seguinte comando: `chmod -R 0755 vendor/laravel/dusk/bin/`.

<a id="using-other-browsers"></a>
### Usando Outros Navegadores

Por padrão, o Dusk utiliza o Google Chrome e uma instalação independente do [ChromeDriver](https://sites.google.com/chromium.org/driver) para executar seus testes de navegador. No entanto, você pode iniciar seu próprio servidor Selenium e executar seus testes contra qualquer navegador que desejar.

Para começar, abra o arquivo `tests/DuskTestCase.php`, que é a classe base de teste do Dusk para a sua aplicação. Dentro deste arquivo, você pode remover a chamada ao método `startChromeDriver`. Isso impedirá que o Dusk inicie automaticamente o ChromeDriver:

```php
/**
 * Prepare for Dusk test execution.
 *
 * @beforeClass
 */
public static function prepare(): void
{
    // static::startChromeDriver();
}
```

Em seguida, você pode modificar o método `driver` para se conectar à URL e à porta de sua escolha. Além disso, pode modificar as "capacidades desejadas" (desired capabilities) que devem ser passadas ao WebDriver:

```php
use Facebook\WebDriver\Remote\RemoteWebDriver;

/**
 * Create the RemoteWebDriver instance.
 */
protected function driver(): RemoteWebDriver
{
    return RemoteWebDriver::create(
        'http://localhost:4444/wd/hub', DesiredCapabilities::phantomjs()
    );
}
```

<a id="getting-started"></a>
## Primeiros Passos

<a id="generating-tests"></a>
### Gerando Testes

Para gerar um teste do Dusk, use o comando Artisan `dusk:make`. O teste gerado será colocado no diretório `tests/Browser`:

```shell
php artisan dusk:make LoginTest
```

<a id="resetting-the-database-after-each-test"></a>
### Resetando o Banco de Dados Após Cada Teste

A maioria dos testes que você escrever interagirá com páginas que recuperam dados do banco de dados da sua aplicação; no entanto, seus testes do Dusk nunca devem usar a trait `RefreshDatabase`. A trait `RefreshDatabase` utiliza transações de banco de dados, que não serão aplicáveis nem disponíveis entre requisições HTTP. Em vez disso, você tem duas opções: a trait `DatabaseMigrations` e a trait `DatabaseTruncation`.

<a id="reset-migrations"></a>
#### Usando Migrations do Banco de Dados

A trait `DatabaseMigrations` executará as migrations do seu banco de dados antes de cada teste. No entanto, derrubar e recriar as tabelas do banco de dados para cada teste costuma ser mais lento do que truncar as tabelas:

```php tab=Pest
<?php

use Illuminate\Foundation\Testing\DatabaseMigrations;

pest()->use(DatabaseMigrations::class);

//
```

```php tab=PHPUnit
<?php

namespace Tests\Browser;

use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class ExampleTest extends DuskTestCase
{
    use DatabaseMigrations;

    //
}
```

> **Warning:**
> Bancos de dados SQLite em memória podem não ser utilizados ao executar os testes do Dusk. Como o navegador é executado em seu próprio processo, ele não conseguirá acessar os bancos de dados em memória de outros processos.

<a id="reset-truncation"></a>
#### Usando Truncamento do Banco de Dados

A trait `DatabaseTruncation` executará a migração do seu banco de dados no primeiro teste para garantir que as tabelas foram criadas corretamente. No entanto, nos testes subsequentes, as tabelas do banco de dados serão simplesmente truncadas, proporcionando ganho de velocidade em relação a executar novamente todas as migrations do banco de dados:

```php tab=Pest
<?php

use Illuminate\Foundation\Testing\DatabaseTruncation;

pest()->use(DatabaseTruncation::class);

//
```

```php tab=PHPUnit
<?php

namespace Tests\Browser;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTruncation;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class ExampleTest extends DuskTestCase
{
    use DatabaseTruncation;

    //
}
```

Por padrão, esta trait trunca todas as tabelas, exceto a tabela `migrations`. Se você quiser personalizar as tabelas que devem ser truncadas, pode definir a propriedade `$tablesToTruncate` na sua classe de teste:

> **Note:**
> Se você estiver usando o Pest, deve definir propriedades ou métodos na classe base `DuskTestCase` ou em qualquer classe que o seu arquivo de teste estenda.

```php
/**
 * Indicates which tables should be truncated.
 *
 * @var array
 */
protected $tablesToTruncate = ['users'];
```

Alternativamente, você pode definir a propriedade `$exceptTables` na sua classe de teste para especificar quais tabelas devem ser excluídas do truncamento:

```php
/**
 * Indicates which tables should be excluded from truncation.
 *
 * @var array
 */
protected $exceptTables = ['users'];
```

Para especificar as conexões de banco de dados cujas tabelas devem ser truncadas, você pode definir a propriedade `$connectionsToTruncate` na sua classe de teste:

```php
/**
 * Indicates which connections should have their tables truncated.
 *
 * @var array
 */
protected $connectionsToTruncate = ['mysql'];
```

Se você quiser executar código antes ou depois do truncamento do banco de dados, pode definir os métodos `beforeTruncatingDatabase` ou `afterTruncatingDatabase` na sua classe de teste:

```php
/**
 * Perform any work that should take place before the database has started truncating.
 */
protected function beforeTruncatingDatabase(): void
{
    //
}

/**
 * Perform any work that should take place after the database has finished truncating.
 */
protected function afterTruncatingDatabase(): void
{
    //
}
```

<a id="running-tests"></a>
### Executando Testes

Para executar seus testes de navegador, execute o comando Artisan `dusk`:

```shell
php artisan dusk
```

Se você teve falhas nos testes na última vez que executou o comando `dusk`, pode economizar tempo reexecutando primeiro os testes que falharam, usando o comando `dusk:fails`:

```shell
php artisan dusk:fails
```

O comando `dusk` aceita qualquer argumento normalmente aceito pelo executor de testes Pest / PHPUnit, como permitir executar apenas os testes de um determinado [grupo](https://docs.phpunit.de/en/10.5/annotations.html#group):

```shell
php artisan dusk --group=foo
```

> **Note:**
> Se você estiver usando o [Laravel Sail](../sail/) para gerenciar seu ambiente de desenvolvimento local, consulte a documentação do Sail sobre [configuração e execução dos testes do Dusk](../sail/#laravel-dusk).

<a id="manually-starting-chromedriver"></a>
#### Iniciando o ChromeDriver Manualmente

Por padrão, o Dusk tentará iniciar automaticamente o ChromeDriver. Se isso não funcionar no seu sistema específico, você pode iniciar o ChromeDriver manualmente antes de executar o comando `dusk`. Se optar por iniciar o ChromeDriver manualmente, deve comentar a seguinte linha do arquivo `tests/DuskTestCase.php`:

```php
/**
 * Prepare for Dusk test execution.
 *
 * @beforeClass
 */
public static function prepare(): void
{
    // static::startChromeDriver();
}
```

Além disso, se você iniciar o ChromeDriver em uma porta diferente de 9515, deve modificar o método `driver` da mesma classe para refletir a porta correta:

```php
use Facebook\WebDriver\Remote\RemoteWebDriver;

/**
 * Create the RemoteWebDriver instance.
 */
protected function driver(): RemoteWebDriver
{
    return RemoteWebDriver::create(
        'http://localhost:9515', DesiredCapabilities::chrome()
    );
}
```

<a id="environment-handling"></a>
### Tratamento de Ambiente

Para forçar o Dusk a usar seu próprio arquivo de ambiente ao executar os testes, crie um arquivo `.env.dusk.{environment}` na raiz do seu projeto. Por exemplo, se você for iniciar o comando `dusk` a partir do seu ambiente `local`, deve criar um arquivo `.env.dusk.local`.

Ao executar os testes, o Dusk fará backup do seu arquivo `.env` e renomeará o ambiente do Dusk para `.env`. Quando os testes forem concluídos, seu arquivo `.env` será restaurado.

<a id="browser-basics"></a>
## Noções Básicas de Navegador

<a id="creating-browsers"></a>
### Criando Navegadores

Para começar, vamos escrever um teste que verifica se conseguimos fazer login na nossa aplicação. Após gerar um teste, podemos modificá-lo para navegar até a página de login, inserir algumas credenciais e clicar no botão "Login". Para criar uma instância de navegador, você pode chamar o método `browse` dentro do seu teste do Dusk:

```php tab=Pest
<?php

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;

pest()->use(DatabaseMigrations::class);

test('basic example', function () {
    $user = User::factory()->create([
        'email' => 'taylor@laravel.com',
    ]);

    $this->browse(function (Browser $browser) use ($user) {
        $browser->visit('/login')
            ->type('email', $user->email)
            ->type('password', 'password')
            ->press('Login')
            ->assertPathIs('/home');
    });
});
```

```php tab=PHPUnit
<?php

namespace Tests\Browser;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class ExampleTest extends DuskTestCase
{
    use DatabaseMigrations;

    /**
     * A basic browser test example.
     */
    public function test_basic_example(): void
    {
        $user = User::factory()->create([
            'email' => 'taylor@laravel.com',
        ]);

        $this->browse(function (Browser $browser) use ($user) {
            $browser->visit('/login')
                ->type('email', $user->email)
                ->type('password', 'password')
                ->press('Login')
                ->assertPathIs('/home');
        });
    }
}
```

Como você pode ver no exemplo acima, o método `browse` aceita uma closure. Uma instância de navegador será automaticamente passada para essa closure pelo Dusk e é o principal objeto usado para interagir com a sua aplicação e fazer asserções sobre ela.

<a id="creating-multiple-browsers"></a>
#### Criando Múltiplos Navegadores

Às vezes, você pode precisar de múltiplos navegadores para executar corretamente um teste. Por exemplo, múltiplos navegadores podem ser necessários para testar uma tela de chat que interage com websockets. Para criar múltiplos navegadores, basta adicionar mais argumentos de navegador à assinatura da closure passada ao método `browse`:

```php
$this->browse(function (Browser $first, Browser $second) {
    $first->loginAs(User::find(1))
        ->visit('/home')
        ->waitForText('Message');

    $second->loginAs(User::find(2))
        ->visit('/home')
        ->waitForText('Message')
        ->type('message', 'Hey Taylor')
        ->press('Send');

    $first->waitForText('Hey Taylor')
        ->assertSee('Jeffrey Way');
});
```

<a id="navigation"></a>
### Navegação

O método `visit` pode ser usado para navegar até uma determinada URI dentro da sua aplicação:

```php
$browser->visit('/login');
```

Você pode usar o método `visitRoute` para navegar até uma [rota nomeada](../routing/#named-routes):

```php
$browser->visitRoute($routeName, $parameters);
```

Você pode navegar "para trás" e "para frente" usando os métodos `back` e `forward`:

```php
$browser->back();

$browser->forward();
```

Você pode usar o método `refresh` para atualizar a página:

```php
$browser->refresh();
```

<a id="resizing-browser-windows"></a>
### Redimensionando Janelas do Navegador

Você pode usar o método `resize` para ajustar o tamanho da janela do navegador:

```php
$browser->resize(1920, 1080);
```

O método `maximize` pode ser usado para maximizar a janela do navegador:

```php
$browser->maximize();
```

O método `fitContent` redimensionará a janela do navegador para corresponder ao tamanho do seu conteúdo:

```php
$browser->fitContent();
```

Quando um teste falha, o Dusk redimensionará automaticamente o navegador para se ajustar ao conteúdo antes de tirar uma screenshot. Você pode desabilitar este recurso chamando o método `disableFitOnFailure` dentro do seu teste:

```php
$browser->disableFitOnFailure();
```

Você pode usar o método `move` para mover a janela do navegador para outra posição na sua tela:

```php
$browser->move($x = 100, $y = 100);
```

<a id="browser-macros"></a>
### Macros de Navegador

Se você quiser definir um método de navegador personalizado que possa ser reutilizado em vários dos seus testes, pode usar o método `macro` na classe `Browser`. Normalmente, você deve chamar este método a partir do método `boot` de um [service provider](../providers/):

```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Dusk\Browser;

class DuskServiceProvider extends ServiceProvider
{
    /**
     * Register Dusk's browser macros.
     */
    public function boot(): void
    {
        Browser::macro('scrollToElement', function (string $element = null) {
            $this->script("$('html, body').animate({ scrollTop: $('$element').offset().top }, 0);");

            return $this;
        });
    }
}
```

A função `macro` aceita um nome como primeiro argumento e uma closure como segundo. A closure da macro será executada ao chamar a macro como um método em uma instância de `Browser`:

```php
$this->browse(function (Browser $browser) use ($user) {
    $browser->visit('/pay')
        ->scrollToElement('#credit-card-details')
        ->assertSee('Enter Credit Card Details');
});
```

<a id="authentication"></a>
### Autenticação

Frequentemente, você testará páginas que exigem autenticação. Você pode usar o método `loginAs` do Dusk para evitar interagir com a tela de login da sua aplicação em cada teste. O método `loginAs` aceita a chave primária associada ao seu model autenticável ou uma instância de model autenticável:

```php
use App\Models\User;
use Laravel\Dusk\Browser;

$this->browse(function (Browser $browser) {
    $browser->loginAs(User::find(1))
        ->visit('/home');
});
```

> **Warning:**
> Após usar o método `loginAs`, a sessão do usuário será mantida para todos os testes do arquivo.

<a id="cookies"></a>
### Cookies

Você pode usar o método `cookie` para obter ou definir o valor de um cookie criptografado. Por padrão, todos os cookies criados pelo Laravel são criptografados:

```php
$browser->cookie('name');

$browser->cookie('name', 'Taylor');
```

Você pode usar o método `plainCookie` para obter ou definir o valor de um cookie não criptografado:

```php
$browser->plainCookie('name');

$browser->plainCookie('name', 'Taylor');
```

Você pode usar o método `deleteCookie` para excluir o cookie informado:

```php
$browser->deleteCookie('name');
```

<a id="executing-javascript"></a>
### Executando JavaScript

Você pode usar o método `script` para executar instruções JavaScript arbitrárias dentro do navegador:

```php
$browser->script('document.documentElement.scrollTop = 0');

$browser->script([
    'document.body.scrollTop = 0',
    'document.documentElement.scrollTop = 0',
]);

$output = $browser->script('return window.location.pathname');
```

<a id="taking-a-screenshot"></a>
### Capturando uma Screenshot

Você pode usar o método `screenshot` para capturar uma screenshot e armazená-la com o nome de arquivo informado. Todas as screenshots serão armazenadas no diretório `tests/Browser/screenshots`:

```php
$browser->screenshot('filename');
```

O método `responsiveScreenshots` pode ser usado para capturar uma série de screenshots em vários breakpoints:

```php
$browser->responsiveScreenshots('filename');
```

O método `screenshotElement` pode ser usado para capturar uma screenshot de um elemento específico da página:

```php
$browser->screenshotElement('#selector', 'filename');
```

<a id="storing-console-output-to-disk"></a>
### Armazenando a Saída do Console em Disco

Você pode usar o método `storeConsoleLog` para gravar a saída do console do navegador atual em disco com o nome de arquivo informado. A saída do console será armazenada no diretório `tests/Browser/console`:

```php
$browser->storeConsoleLog('filename');
```

<a id="storing-page-source-to-disk"></a>
### Armazenando o Código-Fonte da Página em Disco

Você pode usar o método `storeSource` para gravar o código-fonte da página atual em disco com o nome de arquivo informado. O código-fonte da página será armazenado no diretório `tests/Browser/source`:

```php
$browser->storeSource('filename');
```

<a id="interacting-with-elements"></a>
## Interagindo com Elementos

<a id="dusk-selectors"></a>
### Seletores Dusk

Escolher bons seletores CSS para interagir com elementos é uma das partes mais difíceis de escrever testes do Dusk. Com o tempo, mudanças no frontend podem fazer com que seletores CSS como os seguintes quebrem seus testes:

```html
// HTML...

<button>Login</button>
```

```php
// Test...

$browser->click('.login-page .container div > button');
```

Os seletores Dusk permitem que você se concentre em escrever testes eficazes em vez de lembrar seletores CSS. Para definir um seletor, adicione um atributo `dusk` ao seu elemento HTML. Então, ao interagir com um navegador Dusk, prefixe o seletor com `@` para manipular o elemento associado dentro do seu teste:

```html
// HTML...

<button dusk="login-button">Login</button>
```

```php
// Test...

$browser->click('@login-button');
```

Se desejar, você pode personalizar o atributo HTML que o seletor Dusk utiliza através do método `selectorHtmlAttribute`. Normalmente, este método deve ser chamado a partir do método `boot` do `AppServiceProvider` da sua aplicação:

```php
use Laravel\Dusk\Dusk;

Dusk::selectorHtmlAttribute('data-dusk');
```

<a id="text-values-and-attributes"></a>
### Texto, Valores e Atributos

<a id="retrieving-setting-values"></a>
#### Obtendo e Definindo Valores

O Dusk fornece vários métodos para interagir com o valor atual, o texto exibido e os atributos dos elementos da página. Por exemplo, para obter o "valor" de um elemento que corresponde a um seletor CSS ou Dusk informado, use o método `value`:

```php
// Retrieve the value...
$value = $browser->value('selector');

// Set the value...
$browser->value('selector', 'value');
```

Você pode usar o método `inputValue` para obter o "valor" de um elemento de input que possui um determinado nome de campo:

```php
$value = $browser->inputValue('field');
```


<a id="retrieving-text"></a>
#### Obtendo Texto

O método `text` pode ser usado para obter o texto exibido de um elemento que corresponde ao seletor informado:

```php
$text = $browser->text('selector');
```

<a id="retrieving-attributes"></a>
#### Obtendo Atributos

Por fim, o método `attribute` pode ser usado para obter o valor de um atributo de um elemento que corresponde ao seletor informado:

```php
$attribute = $browser->attribute('selector', 'value');
```

<a id="interacting-with-forms"></a>
### Interagindo com Formulários

<a id="typing-values"></a>
#### Digitando Valores

O Dusk fornece uma variedade de métodos para interagir com formulários e elementos de input. Primeiro, vamos dar uma olhada em um exemplo de digitação de texto em um campo de input:

```php
$browser->type('email', 'taylor@laravel.com');
```

Observe que, embora o método aceite um se necessário, não somos obrigados a passar um seletor CSS para o método `type`. Se um seletor CSS não for fornecido, o Dusk procurará um campo `input` ou `textarea` com o atributo `name` informado.

Para anexar texto a um campo sem limpar seu conteúdo, você pode usar o método `append`:

```php
$browser->type('tags', 'foo')
    ->append('tags', ', bar, baz');
```

Você pode limpar o valor de um input usando o método `clear`:

```php
$browser->clear('email');
```

Você pode instruir o Dusk a digitar lentamente usando o método `typeSlowly`. Por padrão, o Dusk fará uma pausa de 100 milissegundos entre os toques das teclas. Para personalizar o intervalo de tempo entre os toques das teclas, você pode passar o número apropriado de milissegundos como terceiro argumento do método:

```php
$browser->typeSlowly('mobile', '+1 (202) 555-5555');

$browser->typeSlowly('mobile', '+1 (202) 555-5555', 300);
```

Você pode usar o método `appendSlowly` para anexar texto lentamente:

```php
$browser->type('tags', 'foo')
    ->appendSlowly('tags', ', bar, baz');
```

<a id="dropdowns"></a>
#### Dropdowns

Para selecionar um valor disponível em um elemento `select`, você pode usar o método `select`. Assim como o método `type`, o método `select` não exige um seletor CSS completo. Ao passar um valor para o método `select`, você deve passar o valor subjacente da opção (option value) em vez do texto exibido:

```php
$browser->select('size', 'Large');
```

Você pode selecionar uma opção aleatória omitindo o segundo argumento:

```php
$browser->select('size');
```

Ao fornecer um array como segundo argumento do método `select`, você pode instruir o método a selecionar múltiplas opções:

```php
$browser->select('categories', ['Art', 'Music']);
```

<a id="checkboxes"></a>
#### Checkboxes

Para "marcar" um input de checkbox, você pode usar o método `check`. Como muitos outros métodos relacionados a input, um seletor CSS completo não é necessário. Se nenhuma correspondência de seletor CSS for encontrada, o Dusk procurará um checkbox com um atributo `name` correspondente:

```php
$browser->check('terms');
```

O método `uncheck` pode ser usado para "desmarcar" um input de checkbox:

```php
$browser->uncheck('terms');
```

<a id="radio-buttons"></a>
#### Radio Buttons

Para "selecionar" uma opção de input `radio`, você pode usar o método `radio`. Como muitos outros métodos relacionados a input, um seletor CSS completo não é necessário. Se nenhuma correspondência de seletor CSS for encontrada, o Dusk procurará um input `radio` com atributos `name` e `value` correspondentes:

```php
$browser->radio('size', 'large');
```

<a id="attaching-files"></a>
### Anexando Arquivos

O método `attach` pode ser usado para anexar um arquivo a um elemento de input `file`. Como muitos outros métodos relacionados a input, um seletor CSS completo não é necessário. Se nenhuma correspondência de seletor CSS for encontrada, o Dusk procurará um input `file` com um atributo `name` correspondente:

```php
$browser->attach('photo', __DIR__.'/photos/mountains.png');
```

> **Warning:**
> A função attach requer que a extensão PHP `Zip` esteja instalada e habilitada no seu servidor.

<a id="pressing-buttons"></a>
### Pressionando Botões

O método `press` pode ser usado para clicar em um elemento de botão na página. O argumento informado ao método `press` pode ser tanto o texto exibido do botão quanto um seletor CSS / Dusk:

```php
$browser->press('Login');
```

Ao enviar formulários, muitas aplicações desabilitam o botão de envio do formulário após ele ser pressionado e, em seguida, reabilitam o botão quando a requisição HTTP de envio do formulário é concluída. Para pressionar um botão e aguardar que ele seja reabilitado, você pode usar o método `pressAndWaitFor`:

```php
// Press the button and wait a maximum of 5 seconds for it to be enabled...
$browser->pressAndWaitFor('Save');

// Press the button and wait a maximum of 1 second for it to be enabled...
$browser->pressAndWaitFor('Save', 1);
```

<a id="clicking-links"></a>
### Clicando em Links

Para clicar em um link, você pode usar o método `clickLink` na instância do navegador. O método `clickLink` clicará no link que possui o texto exibido informado:

```php
$browser->clickLink($linkText);
```

Você pode usar o método `seeLink` para determinar se um link com o texto exibido informado está visível na página:

```php
if ($browser->seeLink($linkText)) {
    // ...
}
```

> **Warning:**
> Esses métodos interagem com o jQuery. Se o jQuery não estiver disponível na página, o Dusk o injetará automaticamente na página para que esteja disponível durante a duração do teste.

<a id="using-the-keyboard"></a>
### Usando o Teclado

O método `keys` permite que você forneça sequências de entrada mais complexas a um determinado elemento do que normalmente permitido pelo método `type`. Por exemplo, você pode instruir o Dusk a manter teclas modificadoras pressionadas enquanto insere valores. Neste exemplo, a tecla `shift` será mantida pressionada enquanto `taylor` é inserido no elemento que corresponde ao seletor informado. Depois que `taylor` for digitado, `swift` será digitado sem nenhuma tecla modificadora:

```php
$browser->keys('selector', ['{shift}', 'taylor'], 'swift');
```

Outro caso de uso valioso para o método `keys` é enviar uma combinação de "atalho de teclado" para o seletor CSS principal da sua aplicação:

```php
$browser->keys('.app', ['{command}', 'j']);
```

> **Note:**
> Todas as teclas modificadoras, como `{command}`, são envolvidas por caracteres `{}` e correspondem às constantes definidas na classe `Facebook\WebDriver\WebDriverKeys`, que pode ser [encontrada no GitHub](https://github.com/php-webdriver/php-webdriver/blob/master/lib/WebDriverKeys.php).

<a id="fluent-keyboard-interactions"></a>
#### Interações Fluentes com o Teclado

O Dusk também fornece um método `withKeyboard`, permitindo que você execute de forma fluente interações complexas de teclado através da classe `Laravel\Dusk\Keyboard`. A classe `Keyboard` fornece os métodos `press`, `release`, `type` e `pause`:

```php
use Laravel\Dusk\Keyboard;

$browser->withKeyboard(function (Keyboard $keyboard) {
    $keyboard->press('c')
        ->pause(1000)
        ->release('c')
        ->type(['c', 'e', 'o']);
});
```

<a id="keyboard-macros"></a>
#### Macros de Teclado

Se você quiser definir interações de teclado personalizadas que possa reutilizar facilmente em toda a sua suíte de testes, pode usar o método `macro` fornecido pela classe `Keyboard`. Normalmente, você deve chamar este método a partir do método `boot` de um [service provider](../providers/):

```php
<?php

namespace App\Providers;

use Facebook\WebDriver\WebDriverKeys;
use Illuminate\Support\ServiceProvider;
use Laravel\Dusk\Keyboard;
use Laravel\Dusk\OperatingSystem;

class DuskServiceProvider extends ServiceProvider
{
    /**
     * Register Dusk's browser macros.
     */
    public function boot(): void
    {
        Keyboard::macro('copy', function (string $element = null) {
            $this->type([
                OperatingSystem::onMac() ? WebDriverKeys::META : WebDriverKeys::CONTROL, 'c',
            ]);

            return $this;
        });

        Keyboard::macro('paste', function (string $element = null) {
            $this->type([
                OperatingSystem::onMac() ? WebDriverKeys::META : WebDriverKeys::CONTROL, 'v',
            ]);

            return $this;
        });
    }
}
```

A função `macro` aceita um nome como primeiro argumento e uma closure como segundo. A closure da macro será executada ao chamar a macro como um método em uma instância de `Keyboard`:

```php
$browser->click('@textarea')
    ->withKeyboard(fn (Keyboard $keyboard) => $keyboard->copy())
    ->click('@another-textarea')
    ->withKeyboard(fn (Keyboard $keyboard) => $keyboard->paste());
```

<a id="using-the-mouse"></a>
### Usando o Mouse

<a id="clicking-on-elements"></a>
#### Clicando em Elementos

O método `click` pode ser usado para clicar em um elemento que corresponde ao seletor CSS ou Dusk informado:

```php
$browser->click('.selector');
```

O método `clickAtXPath` pode ser usado para clicar em um elemento que corresponde à expressão XPath informada:

```php
$browser->clickAtXPath('//div[@class = "selector"]');
```

O método `clickAtPoint` pode ser usado para clicar no elemento mais ao topo em um determinado par de coordenadas relativas à área visível do navegador:

```php
$browser->clickAtPoint($x = 0, $y = 0);
```

O método `doubleClick` pode ser usado para simular o clique duplo do mouse:

```php
$browser->doubleClick();

$browser->doubleClick('.selector');
```

O método `rightClick` pode ser usado para simular o clique com o botão direito do mouse:

```php
$browser->rightClick();

$browser->rightClick('.selector');
```

O método `clickAndHold` pode ser usado para simular um botão do mouse sendo clicado e mantido pressionado. Uma chamada subsequente ao método `releaseMouse` desfará esse comportamento e liberará o botão do mouse:

```php
$browser->clickAndHold('.selector');

$browser->clickAndHold()
    ->pause(1000)
    ->releaseMouse();
```

O método `controlClick` pode ser usado para simular o evento `ctrl+click` dentro do navegador:

```php
$browser->controlClick();

$browser->controlClick('.selector');
```

Os métodos `clickWhenVisible` ou `clickWhenEnabled` podem ser usados para aguardar que um elemento esteja pronto antes de clicar nele exatamente uma vez:

```php
$browser->clickWhenVisible('@save-button');
$browser->clickWhenEnabled('@submit-button');
```

<a id="mouseover"></a>
#### Mouseover

O método `mouseover` pode ser usado quando você precisa mover o mouse sobre um elemento que corresponde ao seletor CSS ou Dusk informado:

```php
$browser->mouseover('.selector');
```

<a id="drag-drop"></a>
#### Arrastar e Soltar (Drag and Drop)

O método `drag` pode ser usado para arrastar um elemento que corresponde ao seletor informado para outro elemento:

```php
$browser->drag('.from-selector', '.to-selector');
```

Ou você pode arrastar um elemento em uma única direção:

```php
$browser->dragLeft('.selector', $pixels = 10);
$browser->dragRight('.selector', $pixels = 10);
$browser->dragUp('.selector', $pixels = 10);
$browser->dragDown('.selector', $pixels = 10);
```

Por fim, você pode arrastar um elemento por um deslocamento (offset) informado:

```php
$browser->dragOffset('.selector', $x = 10, $y = 10);
```

<a id="javascript-dialogs"></a>
### Diálogos JavaScript

O Dusk fornece vários métodos para interagir com Diálogos JavaScript. Por exemplo, você pode usar o método `waitForDialog` para aguardar que um diálogo JavaScript apareça. Este método aceita um argumento opcional que indica quantos segundos deve-se aguardar pela exibição do diálogo:

```php
$browser->waitForDialog($seconds = null);
```

O método `assertDialogOpened` pode ser usado para fazer a asserção de que um diálogo foi exibido e contém a mensagem informada:

```php
$browser->assertDialogOpened('Dialog message');
```

Se o diálogo JavaScript contiver um prompt, você pode usar o método `typeInDialog` para digitar um valor no prompt:

```php
$browser->typeInDialog('Hello World');
```

Para fechar um diálogo JavaScript aberto clicando no botão "OK", você pode invocar o método `acceptDialog`:

```php
$browser->acceptDialog();
```

Para fechar um diálogo JavaScript aberto clicando no botão "Cancel", você pode invocar o método `dismissDialog`:

```php
$browser->dismissDialog();
```

<a id="interacting-with-iframes"></a>
### Interagindo com Iframes Inline

Se você precisar interagir com elementos dentro de um iframe, pode usar o método `withinFrame`. Todas as interações com elementos que ocorrem dentro da closure fornecida ao método `withinFrame` serão escopadas ao contexto do iframe especificado:

```php
$browser->withinFrame('#credit-card-details', function ($browser) {
    $browser->type('input[name="cardnumber"]', '4242424242424242')
        ->type('input[name="exp-date"]', '1224')
        ->type('input[name="cvc"]', '123')
        ->press('Pay');
});
```

<a id="scoping-selectors"></a>
### Escopo de Seletores

Às vezes, você pode querer executar várias operações mantendo todas elas no escopo de um determinado seletor. Por exemplo, você pode querer fazer a asserção de que algum texto existe apenas dentro de uma tabela e, em seguida, clicar em um botão dentro dessa tabela. Você pode usar o método `with` para fazer isso. Todas as operações executadas dentro da closure informada ao método `with` serão escopadas ao seletor original:

```php
$browser->with('.table', function (Browser $table) {
    $table->assertSee('Hello World')
        ->clickLink('Delete');
});
```

Ocasionalmente, você pode precisar executar asserções fora do escopo atual. Você pode usar os métodos `elsewhere` e `elsewhereWhenAvailable` para fazer isso:

```php
$browser->with('.table', function (Browser $table) {
    // Current scope is `body .table`...

    $browser->elsewhere('.page-title', function (Browser $title) {
        // Current scope is `body .page-title`...
        $title->assertSee('Hello World');
    });

    $browser->elsewhereWhenAvailable('.page-title', function (Browser $title) {
        // Current scope is `body .page-title`...
        $title->assertSee('Hello World');
    });
});
```

<a id="waiting-for-elements"></a>
### Aguardando Elementos

Ao testar aplicações que usam JavaScript extensivamente, muitas vezes torna-se necessário "aguardar" que certos elementos ou dados estejam disponíveis antes de prosseguir com um teste. O Dusk facilita isso. Usando uma variedade de métodos, você pode aguardar que elementos se tornem visíveis na página ou até mesmo aguardar até que uma determinada expressão JavaScript seja avaliada como `true`.

<a id="waiting"></a>
#### Aguardando

Se você só precisa pausar o teste por um determinado número de milissegundos, use o método `pause`:

```php
$browser->pause(1000);
```

Se você precisa pausar o teste apenas se uma determinada condição for `true`, use o método `pauseIf`:

```php
$browser->pauseIf(App::environment('production'), 1000);
```

Da mesma forma, se você precisa pausar o teste a menos que uma determinada condição seja `true`, pode usar o método `pauseUnless`:

```php
$browser->pauseUnless(App::environment('testing'), 1000);
```

<a id="waiting-for-selectors"></a>
#### Aguardando Seletores

O método `waitFor` pode ser usado para pausar a execução do teste até que o elemento que corresponde ao seletor CSS ou Dusk informado seja exibido na página. Por padrão, isso pausará o teste por no máximo cinco segundos antes de lançar uma exceção. Se necessário, você pode passar um limite de timeout personalizado como segundo argumento do método:

```php
// Wait a maximum of five seconds for the selector...
$browser->waitFor('.selector');

// Wait a maximum of one second for the selector...
$browser->waitFor('.selector', 1);
```

Você também pode aguardar até que o elemento que corresponde ao seletor informado contenha o texto informado:

```php
// Wait a maximum of five seconds for the selector to contain the given text...
$browser->waitForTextIn('.selector', 'Hello World');

// Wait a maximum of one second for the selector to contain the given text...
$browser->waitForTextIn('.selector', 'Hello World', 1);
```

Você também pode aguardar até que o elemento que corresponde ao seletor informado esteja ausente da página:

```php
// Wait a maximum of five seconds until the selector is missing...
$browser->waitUntilMissing('.selector');

// Wait a maximum of one second until the selector is missing...
$browser->waitUntilMissing('.selector', 1);
```

Ou você pode aguardar até que o elemento que corresponde ao seletor informado esteja habilitado ou desabilitado:

```php
// Wait a maximum of five seconds until the selector is enabled...
$browser->waitUntilEnabled('.selector');

// Wait a maximum of one second until the selector is enabled...
$browser->waitUntilEnabled('.selector', 1);

// Wait a maximum of five seconds until the selector is disabled...
$browser->waitUntilDisabled('.selector');

// Wait a maximum of one second until the selector is disabled...
$browser->waitUntilDisabled('.selector', 1);
```

<a id="scoping-selectors-when-available"></a>
#### Escopo de Seletores Quando Disponíveis

Ocasionalmente, você pode querer aguardar que um elemento que corresponde a um determinado seletor apareça e, em seguida, interagir com o elemento. Por exemplo, você pode querer aguardar até que uma janela modal esteja disponível e, então, pressionar o botão "OK" dentro da modal. O método `whenAvailable` pode ser usado para fazer isso. Todas as operações com elementos executadas dentro da closure informada serão escopadas ao seletor original:

```php
$browser->whenAvailable('.modal', function (Browser $modal) {
    $modal->assertSee('Hello World')
        ->press('OK');
});
```

<a id="waiting-for-text"></a>
#### Aguardando por Texto

O método `waitForText` pode ser usado para aguardar até que o texto informado seja exibido na página:

```php
// Wait a maximum of five seconds for the text...
$browser->waitForText('Hello World');

// Wait a maximum of one second for the text...
$browser->waitForText('Hello World', 1);
```

Você pode usar o método `waitUntilMissingText` para aguardar até que o texto exibido tenha sido removido da página:

```php
// Wait a maximum of five seconds for the text to be removed...
$browser->waitUntilMissingText('Hello World');

// Wait a maximum of one second for the text to be removed...
$browser->waitUntilMissingText('Hello World', 1);
```

<a id="waiting-for-links"></a>
#### Aguardando por Links

O método `waitForLink` pode ser usado para aguardar até que o texto de link informado seja exibido na página:

```php
// Wait a maximum of five seconds for the link...
$browser->waitForLink('Create');

// Wait a maximum of one second for the link...
$browser->waitForLink('Create', 1);
```

<a id="waiting-for-inputs"></a>
#### Aguardando por Inputs

O método `waitForInput` pode ser usado para aguardar até que o campo de input informado esteja visível na página:

```php
// Wait a maximum of five seconds for the input...
$browser->waitForInput($field);

// Wait a maximum of one second for the input...
$browser->waitForInput($field, 1);
```

<a id="waiting-on-the-page-location"></a>
#### Aguardando pela Localização da Página

Ao fazer uma asserção de path como `$browser->assertPathIs('/home')`, a asserção pode falhar se `window.location.pathname` estiver sendo atualizado de forma assíncrona. Você pode usar o método `waitForLocation` para aguardar até que a localização tenha um determinado valor:

```php
$browser->waitForLocation('/secret');
```

O método `waitForLocation` também pode ser usado para aguardar até que a localização atual da janela seja uma URL totalmente qualificada:

```php
$browser->waitForLocation('https://example.com/path');
```

Você também pode aguardar pela localização de uma [rota nomeada](../routing/#named-routes):

```php
$browser->waitForRoute($routeName, $parameters);
```

<a id="waiting-for-page-reloads"></a>
#### Aguardando o Recarregamento da Página

Se você precisar aguardar que uma página recarregue após executar uma ação, use o método `waitForReload`:

```php
use Laravel\Dusk\Browser;

$browser->waitForReload(function (Browser $browser) {
    $browser->press('Submit');
})
->assertSee('Success!');
```

Como a necessidade de aguardar o recarregamento da página normalmente ocorre após clicar em um botão, você pode usar o método `clickAndWaitForReload` por conveniência:

```php
$browser->clickAndWaitForReload('.selector')
    ->assertSee('something');
```

<a id="waiting-on-javascript-expressions"></a>
#### Aguardando por Expressões JavaScript

Às vezes, você pode querer pausar a execução de um teste até que uma determinada expressão JavaScript seja avaliada como `true`. Você pode fazer isso facilmente usando o método `waitUntil`. Ao passar uma expressão para este método, você não precisa incluir a palavra-chave `return` nem um ponto e vírgula final:

```php
// Wait a maximum of five seconds for the expression to be true...
$browser->waitUntil('App.data.servers.length > 0');

// Wait a maximum of one second for the expression to be true...
$browser->waitUntil('App.data.servers.length > 0', 1);
```

<a id="waiting-on-vue-expressions"></a>
#### Aguardando por Expressões Vue

Os métodos `waitUntilVue` e `waitUntilVueIsNot` podem ser usados para aguardar até que um atributo de um [componente Vue](https://vuejs.org) tenha um determinado valor:

```php
// Wait until the component attribute contains the given value...
$browser->waitUntilVue('user.name', 'Taylor', '@user');

// Wait until the component attribute doesn't contain the given value...
$browser->waitUntilVueIsNot('user.name', null, '@user');
```

<a id="waiting-for-javascript-events"></a>
#### Aguardando por Eventos JavaScript

O método `waitForEvent` pode ser usado para pausar a execução de um teste até que um evento JavaScript ocorra:

```php
$browser->waitForEvent('load');
```

O listener de evento é anexado ao escopo atual, que é o elemento `body` por padrão. Ao usar um seletor escopado, o listener de evento será anexado ao elemento correspondente:

```php
$browser->with('iframe', function (Browser $iframe) {
    // Wait for the iframe's load event...
    $iframe->waitForEvent('load');
});
```

Você também pode fornecer um seletor como segundo argumento do método `waitForEvent` para anexar o listener de evento a um elemento específico:

```php
$browser->waitForEvent('load', '.selector');
```

Você também pode aguardar por eventos nos objetos `document` e `window`:

```php
// Wait until the document is scrolled...
$browser->waitForEvent('scroll', 'document');

// Wait a maximum of five seconds until the window is resized...
$browser->waitForEvent('resize', 'window', 5);
```

<a id="waiting-with-a-callback"></a>
#### Aguardando com um Callback

Muitos dos métodos de "espera" no Dusk dependem do método subjacente `waitUsing`. Você pode usar este método diretamente para aguardar que uma determinada closure retorne `true`. O método `waitUsing` aceita o número máximo de segundos a aguardar, o intervalo no qual a closure deve ser avaliada, a closure e uma mensagem de falha opcional:

```php
$browser->waitUsing(10, 1, function () use ($something) {
    return $something->isReady();
}, "Something wasn't ready in time.");
```

<a id="scrolling-an-element-into-view"></a>
### Rolando um Elemento para a Visualização

Às vezes, você pode não conseguir clicar em um elemento porque ele está fora da área visível do navegador. O método `scrollIntoView` rolará a janela do navegador até que o elemento no seletor informado esteja dentro da visualização:

```php
$browser->scrollIntoView('.selector')
    ->click('.selector');
```

<a id="available-assertions"></a>
## Asserções Disponíveis

O Dusk fornece uma variedade de asserções que você pode fazer na sua aplicação. Todas as asserções disponíveis estão documentadas na lista abaixo:

<style>
    .collection-method-list > p {
        columns: 10.8em 3; -moz-columns: 10.8em 3; -webkit-columns: 10.8em 3;
    }

    .collection-method-list a {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>

<div class="collection-method-list" markdown="1">

[assertTitle](#assert-title)
[assertTitleContains](#assert-title-contains)
[assertUrlIs](#assert-url-is)
[assertSchemeIs](#assert-scheme-is)
[assertSchemeIsNot](#assert-scheme-is-not)
[assertHostIs](#assert-host-is)
[assertHostIsNot](#assert-host-is-not)
[assertPortIs](#assert-port-is)
[assertPortIsNot](#assert-port-is-not)
[assertPathBeginsWith](#assert-path-begins-with)
[assertPathEndsWith](#assert-path-ends-with)
[assertPathContains](#assert-path-contains)
[assertPathIs](#assert-path-is)
[assertPathIsNot](#assert-path-is-not)
[assertRouteIs](#assert-route-is)
[assertQueryStringHas](#assert-query-string-has)
[assertQueryStringMissing](#assert-query-string-missing)
[assertFragmentIs](#assert-fragment-is)
[assertFragmentBeginsWith](#assert-fragment-begins-with)
[assertFragmentIsNot](#assert-fragment-is-not)
[assertHasCookie](#assert-has-cookie)
[assertHasPlainCookie](#assert-has-plain-cookie)
[assertCookieMissing](#assert-cookie-missing)
[assertPlainCookieMissing](#assert-plain-cookie-missing)
[assertCookieValue](#assert-cookie-value)
[assertPlainCookieValue](#assert-plain-cookie-value)
[assertSee](#assert-see)
[assertDontSee](#assert-dont-see)
[assertSeeIn](#assert-see-in)
[assertDontSeeIn](#assert-dont-see-in)
[assertSeeAnythingIn](#assert-see-anything-in)
[assertSeeNothingIn](#assert-see-nothing-in)
[assertCount](#assert-count)
[assertScript](#assert-script)
[assertSourceHas](#assert-source-has)
[assertSourceMissing](#assert-source-missing)
[assertSeeLink](#assert-see-link)
[assertDontSeeLink](#assert-dont-see-link)
[assertInputValue](#assert-input-value)
[assertInputValueIsNot](#assert-input-value-is-not)
[assertChecked](#assert-checked)
[assertNotChecked](#assert-not-checked)
[assertIndeterminate](#assert-indeterminate)
[assertRadioSelected](#assert-radio-selected)
[assertRadioNotSelected](#assert-radio-not-selected)
[assertSelected](#assert-selected)
[assertNotSelected](#assert-not-selected)
[assertSelectHasOptions](#assert-select-has-options)
[assertSelectMissingOptions](#assert-select-missing-options)
[assertSelectHasOption](#assert-select-has-option)
[assertSelectMissingOption](#assert-select-missing-option)
[assertValue](#assert-value)
[assertValueIsNot](#assert-value-is-not)
[assertAttribute](#assert-attribute)
[assertAttributeMissing](#assert-attribute-missing)
[assertAttributeContains](#assert-attribute-contains)
[assertAttributeDoesntContain](#assert-attribute-doesnt-contain)
[assertAriaAttribute](#assert-aria-attribute)
[assertDataAttribute](#assert-data-attribute)
[assertVisible](#assert-visible)
[assertPresent](#assert-present)
[assertNotPresent](#assert-not-present)
[assertMissing](#assert-missing)
[assertInputPresent](#assert-input-present)
[assertInputMissing](#assert-input-missing)
[assertDialogOpened](#assert-dialog-opened)
[assertEnabled](#assert-enabled)
[assertDisabled](#assert-disabled)
[assertButtonEnabled](#assert-button-enabled)
[assertButtonDisabled](#assert-button-disabled)
[assertFocused](#assert-focused)
[assertNotFocused](#assert-not-focused)
[assertAuthenticated](#assert-authenticated)
[assertGuest](#assert-guest)
[assertAuthenticatedAs](#assert-authenticated-as)
[assertVue](#assert-vue)
[assertVueIsNot](#assert-vue-is-not)
[assertVueContains](#assert-vue-contains)
[assertVueDoesntContain](#assert-vue-doesnt-contain)

</div>

<a id="assert-title"></a>
#### assertTitle

Faz a asserção de que o título da página corresponde ao texto informado:

```php
$browser->assertTitle($title);
```

<a id="assert-title-contains"></a>
#### assertTitleContains

Faz a asserção de que o título da página contém o texto informado:

```php
$browser->assertTitleContains($title);
```

<a id="assert-url-is"></a>
#### assertUrlIs

Faz a asserção de que a URL atual (sem a query string) corresponde à string informada:

```php
$browser->assertUrlIs($url);
```

<a id="assert-scheme-is"></a>
#### assertSchemeIs

Faz a asserção de que o scheme da URL atual corresponde ao scheme informado:

```php
$browser->assertSchemeIs($scheme);
```

<a id="assert-scheme-is-not"></a>
#### assertSchemeIsNot

Faz a asserção de que o scheme da URL atual não corresponde ao scheme informado:

```php
$browser->assertSchemeIsNot($scheme);
```

<a id="assert-host-is"></a>
#### assertHostIs

Faz a asserção de que o host da URL atual corresponde ao host informado:

```php
$browser->assertHostIs($host);
```

<a id="assert-host-is-not"></a>
#### assertHostIsNot

Faz a asserção de que o host da URL atual não corresponde ao host informado:

```php
$browser->assertHostIsNot($host);
```

<a id="assert-port-is"></a>
#### assertPortIs

Faz a asserção de que a porta da URL atual corresponde à porta informada:

```php
$browser->assertPortIs($port);
```

<a id="assert-port-is-not"></a>
#### assertPortIsNot

Faz a asserção de que a porta da URL atual não corresponde à porta informada:

```php
$browser->assertPortIsNot($port);
```

<a id="assert-path-begins-with"></a>
#### assertPathBeginsWith

Faz a asserção de que o path da URL atual começa com o path informado:

```php
$browser->assertPathBeginsWith('/home');
```

<a id="assert-path-ends-with"></a>
#### assertPathEndsWith

Faz a asserção de que o path da URL atual termina com o path informado:

```php
$browser->assertPathEndsWith('/home');
```

<a id="assert-path-contains"></a>
#### assertPathContains

Faz a asserção de que o path da URL atual contém o path informado:

```php
$browser->assertPathContains('/home');
```

<a id="assert-path-is"></a>
#### assertPathIs

Faz a asserção de que o path atual corresponde ao path informado:

```php
$browser->assertPathIs('/home');
```

<a id="assert-path-is-not"></a>
#### assertPathIsNot

Faz a asserção de que o path atual não corresponde ao path informado:

```php
$browser->assertPathIsNot('/home');
```

<a id="assert-route-is"></a>
#### assertRouteIs

Faz a asserção de que a URL atual corresponde à URL da [rota nomeada](../routing/#named-routes) informada:

```php
$browser->assertRouteIs($name, $parameters);
```

<a id="assert-query-string-has"></a>
#### assertQueryStringHas

Faz a asserção de que o parâmetro de query string informado está presente:

```php
$browser->assertQueryStringHas($name);
```

Faz a asserção de que o parâmetro de query string informado está presente e possui um determinado valor:

```php
$browser->assertQueryStringHas($name, $value);
```

<a id="assert-query-string-missing"></a>
#### assertQueryStringMissing

Faz a asserção de que o parâmetro de query string informado está ausente:

```php
$browser->assertQueryStringMissing($name);
```

<a id="assert-fragment-is"></a>
#### assertFragmentIs

Faz a asserção de que o fragmento de hash atual da URL corresponde ao fragmento informado:

```php
$browser->assertFragmentIs('anchor');
```

<a id="assert-fragment-begins-with"></a>
#### assertFragmentBeginsWith

Faz a asserção de que o fragmento de hash atual da URL começa com o fragmento informado:

```php
$browser->assertFragmentBeginsWith('anchor');
```

<a id="assert-fragment-is-not"></a>
#### assertFragmentIsNot

Faz a asserção de que o fragmento de hash atual da URL não corresponde ao fragmento informado:

```php
$browser->assertFragmentIsNot('anchor');
```

<a id="assert-has-cookie"></a>
#### assertHasCookie

Faz a asserção de que o cookie criptografado informado está presente:

```php
$browser->assertHasCookie($name);
```

<a id="assert-has-plain-cookie"></a>
#### assertHasPlainCookie

Faz a asserção de que o cookie não criptografado informado está presente:

```php
$browser->assertHasPlainCookie($name);
```

<a id="assert-cookie-missing"></a>
#### assertCookieMissing

Faz a asserção de que o cookie criptografado informado não está presente:

```php
$browser->assertCookieMissing($name);
```

<a id="assert-plain-cookie-missing"></a>
#### assertPlainCookieMissing

Faz a asserção de que o cookie não criptografado informado não está presente:

```php
$browser->assertPlainCookieMissing($name);
```

<a id="assert-cookie-value"></a>
#### assertCookieValue

Faz a asserção de que um cookie criptografado possui um determinado valor:

```php
$browser->assertCookieValue($name, $value);
```

<a id="assert-plain-cookie-value"></a>
#### assertPlainCookieValue

Faz a asserção de que um cookie não criptografado possui um determinado valor:

```php
$browser->assertPlainCookieValue($name, $value);
```

<a id="assert-see"></a>
#### assertSee

Faz a asserção de que o texto informado está presente na página:

```php
$browser->assertSee($text);
```

<a id="assert-dont-see"></a>
#### assertDontSee

Faz a asserção de que o texto informado não está presente na página:

```php
$browser->assertDontSee($text);
```

<a id="assert-see-in"></a>
#### assertSeeIn

Faz a asserção de que o texto informado está presente dentro do seletor:

```php
$browser->assertSeeIn($selector, $text);
```

<a id="assert-dont-see-in"></a>
#### assertDontSeeIn

Faz a asserção de que o texto informado não está presente dentro do seletor:

```php
$browser->assertDontSeeIn($selector, $text);
```

<a id="assert-see-anything-in"></a>
#### assertSeeAnythingIn

Faz a asserção de que qualquer texto está presente dentro do seletor:

```php
$browser->assertSeeAnythingIn($selector);
```

<a id="assert-see-nothing-in"></a>
#### assertSeeNothingIn

Faz a asserção de que nenhum texto está presente dentro do seletor:

```php
$browser->assertSeeNothingIn($selector);
```

<a id="assert-count"></a>
#### assertCount

Faz a asserção de que os elementos que correspondem ao seletor informado aparecem o número especificado de vezes:

```php
$browser->assertCount($selector, $count);
```

<a id="assert-script"></a>
#### assertScript

Faz a asserção de que a expressão JavaScript informada é avaliada como o valor informado:

```php
$browser->assertScript('window.isLoaded')
    ->assertScript('document.readyState', 'complete');
```

<a id="assert-source-has"></a>
#### assertSourceHas

Faz a asserção de que o código-fonte informado está presente na página:

```php
$browser->assertSourceHas($code);
```

<a id="assert-source-missing"></a>
#### assertSourceMissing

Faz a asserção de que o código-fonte informado não está presente na página:

```php
$browser->assertSourceMissing($code);
```

<a id="assert-see-link"></a>
#### assertSeeLink

Faz a asserção de que o link informado está presente na página:

```php
$browser->assertSeeLink($linkText);
```

<a id="assert-dont-see-link"></a>
#### assertDontSeeLink

Faz a asserção de que o link informado não está presente na página:

```php
$browser->assertDontSeeLink($linkText);
```

<a id="assert-input-value"></a>
#### assertInputValue

Faz a asserção de que o campo de input informado possui o valor informado:

```php
$browser->assertInputValue($field, $value);
```

<a id="assert-input-value-is-not"></a>
#### assertInputValueIsNot

Faz a asserção de que o campo de input informado não possui o valor informado:

```php
$browser->assertInputValueIsNot($field, $value);
```

<a id="assert-checked"></a>
#### assertChecked

Faz a asserção de que o checkbox informado está marcado:

```php
$browser->assertChecked($field);
```

<a id="assert-not-checked"></a>
#### assertNotChecked

Faz a asserção de que o checkbox informado não está marcado:

```php
$browser->assertNotChecked($field);
```

<a id="assert-indeterminate"></a>
#### assertIndeterminate

Faz a asserção de que o checkbox informado está em um estado indeterminado:

```php
$browser->assertIndeterminate($field);
```

<a id="assert-radio-selected"></a>
#### assertRadioSelected

Faz a asserção de que o campo radio informado está selecionado:

```php
$browser->assertRadioSelected($field, $value);
```

<a id="assert-radio-not-selected"></a>
#### assertRadioNotSelected

Faz a asserção de que o campo radio informado não está selecionado:

```php
$browser->assertRadioNotSelected($field, $value);
```

<a id="assert-selected"></a>
#### assertSelected

Faz a asserção de que o dropdown informado possui o valor informado selecionado:

```php
$browser->assertSelected($field, $value);
```

<a id="assert-not-selected"></a>
#### assertNotSelected

Faz a asserção de que o dropdown informado não possui o valor informado selecionado:

```php
$browser->assertNotSelected($field, $value);
```

<a id="assert-select-has-options"></a>
#### assertSelectHasOptions

Faz a asserção de que o array de valores informado está disponível para seleção:

```php
$browser->assertSelectHasOptions($field, $values);
```

<a id="assert-select-missing-options"></a>
#### assertSelectMissingOptions

Faz a asserção de que o array de valores informado não está disponível para seleção:

```php
$browser->assertSelectMissingOptions($field, $values);
```

<a id="assert-select-has-option"></a>
#### assertSelectHasOption

Faz a asserção de que o valor informado está disponível para seleção no campo informado:

```php
$browser->assertSelectHasOption($field, $value);
```

<a id="assert-select-missing-option"></a>
#### assertSelectMissingOption

Faz a asserção de que o valor informado não está disponível para seleção:

```php
$browser->assertSelectMissingOption($field, $value);
```

<a id="assert-value"></a>
#### assertValue

Faz a asserção de que o elemento que corresponde ao seletor informado possui o valor informado:

```php
$browser->assertValue($selector, $value);
```

<a id="assert-value-is-not"></a>
#### assertValueIsNot

Faz a asserção de que o elemento que corresponde ao seletor informado não possui o valor informado:

```php
$browser->assertValueIsNot($selector, $value);
```

<a id="assert-attribute"></a>
#### assertAttribute

Faz a asserção de que o elemento que corresponde ao seletor informado possui o valor informado no atributo fornecido:

```php
$browser->assertAttribute($selector, $attribute, $value);
```

<a id="assert-attribute-missing"></a>
#### assertAttributeMissing

Faz a asserção de que o elemento que corresponde ao seletor informado não possui o atributo fornecido:

```php
$browser->assertAttributeMissing($selector, $attribute);
```

<a id="assert-attribute-contains"></a>
#### assertAttributeContains

Faz a asserção de que o elemento que corresponde ao seletor informado contém o valor informado no atributo fornecido:

```php
$browser->assertAttributeContains($selector, $attribute, $value);
```

<a id="assert-attribute-doesnt-contain"></a>
#### assertAttributeDoesntContain

Faz a asserção de que o elemento que corresponde ao seletor informado não contém o valor informado no atributo fornecido:

```php
$browser->assertAttributeDoesntContain($selector, $attribute, $value);
```

<a id="assert-aria-attribute"></a>
#### assertAriaAttribute

Faz a asserção de que o elemento que corresponde ao seletor informado possui o valor informado no atributo aria fornecido:

```php
$browser->assertAriaAttribute($selector, $attribute, $value);
```

Por exemplo, dado o markup `<button aria-label="Add"></button>`, você pode fazer a asserção no atributo `aria-label` da seguinte forma:

```php
$browser->assertAriaAttribute('button', 'label', 'Add');
```

<a id="assert-data-attribute"></a>
#### assertDataAttribute

Faz a asserção de que o elemento que corresponde ao seletor informado possui o valor informado no atributo data fornecido:

```php
$browser->assertDataAttribute($selector, $attribute, $value);
```

Por exemplo, dado o markup `<tr id="row-1" data-content="attendees"></tr>`, você pode fazer a asserção no atributo `data-content` da seguinte forma:

```php
$browser->assertDataAttribute('#row-1', 'content', 'attendees');
```

<a id="assert-visible"></a>
#### assertVisible

Faz a asserção de que o elemento que corresponde ao seletor informado está visível:

```php
$browser->assertVisible($selector);
```

<a id="assert-present"></a>
#### assertPresent

Faz a asserção de que o elemento que corresponde ao seletor informado está presente no código-fonte:

```php
$browser->assertPresent($selector);
```

<a id="assert-not-present"></a>
#### assertNotPresent

Faz a asserção de que o elemento que corresponde ao seletor informado não está presente no código-fonte:

```php
$browser->assertNotPresent($selector);
```

<a id="assert-missing"></a>
#### assertMissing

Faz a asserção de que o elemento que corresponde ao seletor informado não está visível:

```php
$browser->assertMissing($selector);
```

<a id="assert-input-present"></a>
#### assertInputPresent

Faz a asserção de que um input com o nome informado está presente:

```php
$browser->assertInputPresent($name);
```

<a id="assert-input-missing"></a>
#### assertInputMissing

Faz a asserção de que um input com o nome informado não está presente no código-fonte:

```php
$browser->assertInputMissing($name);
```

<a id="assert-dialog-opened"></a>
#### assertDialogOpened

Faz a asserção de que um diálogo JavaScript com a mensagem informada foi aberto:

```php
$browser->assertDialogOpened($message);
```

<a id="assert-enabled"></a>
#### assertEnabled

Faz a asserção de que o campo informado está habilitado:

```php
$browser->assertEnabled($field);
```

<a id="assert-disabled"></a>
#### assertDisabled

Faz a asserção de que o campo informado está desabilitado:

```php
$browser->assertDisabled($field);
```

<a id="assert-button-enabled"></a>
#### assertButtonEnabled

Faz a asserção de que o botão informado está habilitado:

```php
$browser->assertButtonEnabled($button);
```

<a id="assert-button-disabled"></a>
#### assertButtonDisabled

Faz a asserção de que o botão informado está desabilitado:

```php
$browser->assertButtonDisabled($button);
```

<a id="assert-focused"></a>
#### assertFocused

Faz a asserção de que o campo informado está focado:

```php
$browser->assertFocused($field);
```

<a id="assert-not-focused"></a>
#### assertNotFocused

Faz a asserção de que o campo informado não está focado:

```php
$browser->assertNotFocused($field);
```

<a id="assert-authenticated"></a>
#### assertAuthenticated

Faz a asserção de que o usuário está autenticado:

```php
$browser->assertAuthenticated();
```

<a id="assert-guest"></a>
#### assertGuest

Faz a asserção de que o usuário não está autenticado:

```php
$browser->assertGuest();
```

<a id="assert-authenticated-as"></a>
#### assertAuthenticatedAs

Faz a asserção de que o usuário está autenticado como o usuário informado:

```php
$browser->assertAuthenticatedAs($user);
```

<a id="assert-vue"></a>
#### assertVue

O Dusk permite que você até mesmo faça asserções sobre o estado dos dados de um [componente Vue](https://vuejs.org). Por exemplo, imagine que sua aplicação contém o seguinte componente Vue:

    // HTML...

    <profile dusk="profile-component"></profile>

    // Component Definition...

    Vue.component('profile', {
        template: '<div>{{ user.name }}</div>',

        data: function () {
            return {
                user: {
                    name: 'Taylor'
                }
            };
        }
    });

Você pode fazer a asserção sobre o estado do componente Vue da seguinte forma:

```php tab=Pest
test('vue', function () {
    $this->browse(function (Browser $browser) {
        $browser->visit('/')
            ->assertVue('user.name', 'Taylor', '@profile-component');
    });
});
```

```php tab=PHPUnit
/**
 * A basic Vue test example.
 */
public function test_vue(): void
{
    $this->browse(function (Browser $browser) {
        $browser->visit('/')
            ->assertVue('user.name', 'Taylor', '@profile-component');
    });
}
```

<a id="assert-vue-is-not"></a>
#### assertVueIsNot

Faz a asserção de que uma determinada propriedade de dados de um componente Vue não corresponde ao valor informado:

```php
$browser->assertVueIsNot($property, $value, $componentSelector = null);
```

<a id="assert-vue-contains"></a>
#### assertVueContains

Faz a asserção de que uma determinada propriedade de dados de um componente Vue é um array e contém o valor informado:

```php
$browser->assertVueContains($property, $value, $componentSelector = null);
```

<a id="assert-vue-doesnt-contain"></a>
#### assertVueDoesntContain

Faz a asserção de que uma determinada propriedade de dados de um componente Vue é um array e não contém o valor informado:

```php
$browser->assertVueDoesntContain($property, $value, $componentSelector = null);
```

<a id="pages"></a>
## Páginas

Às vezes, os testes exigem que várias ações complicadas sejam executadas em sequência. Isso pode tornar seus testes mais difíceis de ler e entender. As Páginas (Pages) do Dusk permitem que você defina ações expressivas que podem então ser executadas em uma determinada página através de um único método. As Páginas também permitem que você defina atalhos para seletores comuns da sua aplicação ou de uma única página.

<a id="generating-pages"></a>
### Gerando Páginas

Para gerar um objeto de página, execute o comando Artisan `dusk:page`. Todos os objetos de página serão colocados no diretório `tests/Browser/Pages` da sua aplicação:

```shell
php artisan dusk:page Login
```

<a id="configuring-pages"></a>
### Configurando Páginas

Por padrão, as páginas têm três métodos: `url`, `assert` e `elements`. Vamos discutir os métodos `url` e `assert` agora. O método `elements` será [discutido em mais detalhes abaixo](#shorthand-selectors).

<a id="the-url-method"></a>
#### O Método `url`

O método `url` deve retornar o path da URL que representa a página. O Dusk usará esta URL ao navegar até a página no navegador:

```php
/**
 * Get the URL for the page.
 */
public function url(): string
{
    return '/login';
}
```

<a id="the-assert-method"></a>
#### O Método `assert`

O método `assert` pode fazer quaisquer asserções necessárias para verificar se o navegador está realmente na página informada. Não é realmente necessário colocar nada dentro deste método; no entanto, você está livre para fazer essas asserções se desejar. Essas asserções serão executadas automaticamente ao navegar até a página:

```php
/**
 * Assert that the browser is on the page.
 */
public function assert(Browser $browser): void
{
    $browser->assertPathIs($this->url());
}
```

<a id="navigating-to-pages"></a>
### Navegando para Páginas

Uma vez que uma página tenha sido definida, você pode navegar até ela usando o método `visit`:

```php
use Tests\Browser\Pages\Login;

$browser->visit(new Login);
```

Às vezes, você pode já estar em uma determinada página e precisar "carregar" os seletores e métodos da página no contexto de teste atual. Isso é comum ao pressionar um botão e ser redirecionado para uma determinada página sem navegar explicitamente até ela. Nessa situação, você pode usar o método `on` para carregar a página:

```php
use Tests\Browser\Pages\CreatePlaylist;

$browser->visit('/dashboard')
    ->clickLink('Create Playlist')
    ->on(new CreatePlaylist)
    ->assertSee('@create');
```

<a id="shorthand-selectors"></a>
### Seletores Abreviados

O método `elements` dentro das classes de página permite que você defina atalhos rápidos e fáceis de lembrar para qualquer seletor CSS da sua página. Por exemplo, vamos definir um atalho para o campo de input "email" da página de login da aplicação:

```php
/**
 * Get the element shortcuts for the page.
 *
 * @return array<string, string>
 */
public function elements(): array
{
    return [
        '@email' => 'input[name=email]',
    ];
}
```

Uma vez que o atalho tenha sido definido, você pode usar o seletor abreviado em qualquer lugar em que normalmente usaria um seletor CSS completo:

```php
$browser->type('@email', 'taylor@laravel.com');
```

<a id="global-shorthand-selectors"></a>
#### Seletores Abreviados Globais

Após instalar o Dusk, uma classe base `Page` será colocada no seu diretório `tests/Browser/Pages`. Esta classe contém um método `siteElements` que pode ser usado para definir seletores abreviados globais que devem estar disponíveis em todas as páginas da sua aplicação:

```php
/**
 * Get the global element shortcuts for the site.
 *
 * @return array<string, string>
 */
public static function siteElements(): array
{
    return [
        '@element' => '#selector',
    ];
}
```

<a id="page-methods"></a>
### Métodos de Página

Além dos métodos padrão definidos nas páginas, você pode definir métodos adicionais que podem ser usados em todos os seus testes. Por exemplo, vamos imaginar que estamos construindo uma aplicação de gerenciamento de música. Uma ação comum para uma página da aplicação pode ser criar uma playlist. Em vez de reescrever a lógica para criar uma playlist em cada teste, você pode definir um método `createPlaylist` em uma classe de página:

```php
<?php

namespace Tests\Browser\Pages;

use Laravel\Dusk\Browser;
use Laravel\Dusk\Page;

class Dashboard extends Page
{
    // Other page methods...

    /**
     * Create a new playlist.
     */
    public function createPlaylist(Browser $browser, string $name): void
    {
        $browser->type('name', $name)
            ->check('share')
            ->press('Create Playlist');
    }
}
```

Uma vez que o método tenha sido definido, você pode usá-lo em qualquer teste que utilize a página. A instância do navegador será passada automaticamente como primeiro argumento para os métodos de página personalizados:

```php
use Tests\Browser\Pages\Dashboard;

$browser->visit(new Dashboard)
    ->createPlaylist('My Playlist')
    ->assertSee('My Playlist');
```

<a id="components"></a>
## Componentes

Os componentes são semelhantes aos "objetos de página" (page objects) do Dusk, mas são destinados a partes da UI e funcionalidade que são reutilizadas em toda a sua aplicação, como uma barra de navegação ou uma janela de notificação. Como tal, os componentes não estão vinculados a URLs específicas.

<a id="generating-components"></a>
### Gerando Componentes

Para gerar um componente, execute o comando Artisan `dusk:component`. Novos componentes são colocados no diretório `tests/Browser/Components`:

```shell
php artisan dusk:component DatePicker
```

Conforme mostrado acima, um "date picker" é um exemplo de componente que pode existir em toda a sua aplicação em uma variedade de páginas. Pode se tornar trabalhoso escrever manualmente a lógica de automação de navegador para selecionar uma data em dezenas de testes ao longo da sua suíte de testes. Em vez disso, podemos definir um componente Dusk para representar o date picker, permitindo que encapsulemos essa lógica dentro do componente:

```php
<?php

namespace Tests\Browser\Components;

use Laravel\Dusk\Browser;
use Laravel\Dusk\Component as BaseComponent;

class DatePicker extends BaseComponent
{
    /**
     * Get the root selector for the component.
     */
    public function selector(): string
    {
        return '.date-picker';
    }

    /**
     * Assert that the browser page contains the component.
     */
    public function assert(Browser $browser): void
    {
        $browser->assertVisible($this->selector());
    }

    /**
     * Get the element shortcuts for the component.
     *
     * @return array<string, string>
     */
    public function elements(): array
    {
        return [
            '@date-field' => 'input.datepicker-input',
            '@year-list' => 'div > div.datepicker-years',
            '@month-list' => 'div > div.datepicker-months',
            '@day-list' => 'div > div.datepicker-days',
        ];
    }

    /**
     * Select the given date.
     */
    public function selectDate(Browser $browser, int $year, int $month, int $day): void
    {
        $browser->click('@date-field')
            ->within('@year-list', function (Browser $browser) use ($year) {
                $browser->click($year);
            })
            ->within('@month-list', function (Browser $browser) use ($month) {
                $browser->click($month);
            })
            ->within('@day-list', function (Browser $browser) use ($day) {
                $browser->click($day);
            });
    }
}
```

<a id="using-components"></a>
### Usando Componentes

Uma vez que o componente tenha sido definido, podemos facilmente selecionar uma data dentro do date picker a partir de qualquer teste. E, se a lógica necessária para selecionar uma data mudar, só precisamos atualizar o componente:

```php tab=Pest
<?php

use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\Browser\Components\DatePicker;

pest()->use(DatabaseMigrations::class);

test('basic example', function () {
    $this->browse(function (Browser $browser) {
        $browser->visit('/')
            ->within(new DatePicker, function (Browser $browser) {
                $browser->selectDate(2019, 1, 30);
            })
            ->assertSee('January');
    });
});
```

```php tab=PHPUnit
<?php

namespace Tests\Browser;

use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\Browser\Components\DatePicker;
use Tests\DuskTestCase;

class ExampleTest extends DuskTestCase
{
    /**
     * A basic component test example.
     */
    public function test_basic_example(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/')
                ->within(new DatePicker, function (Browser $browser) {
                    $browser->selectDate(2019, 1, 30);
                })
                ->assertSee('January');
        });
    }
}
```

O método `component` pode ser usado para obter uma instância de navegador escopada ao componente informado:

```php
$datePicker = $browser->component(new DatePickerComponent);

$datePicker->selectDate(2019, 1, 30);

$datePicker->assertSee('January');
```

<a id="continuous-integration"></a>
## Integração Contínua

> **Warning:**
> A maioria das configurações de integração contínua do Dusk espera que sua aplicação Laravel seja servida usando o servidor de desenvolvimento PHP embutido na porta 8000. Portanto, antes de continuar, você deve garantir que seu ambiente de integração contínua tenha um valor de variável de ambiente `APP_URL` igual a `http://127.0.0.1:8000`.

<a id="running-tests-on-heroku-ci"></a>
### Heroku CI

Para executar os testes do Dusk no [Heroku CI](https://www.heroku.com/continuous-integration), adicione o seguinte buildpack do Google Chrome e scripts ao seu arquivo `app.json` do Heroku:

```json
{
  "environments": {
    "test": {
      "buildpacks": [
        { "url": "heroku/php" },
        { "url": "https://github.com/heroku/heroku-buildpack-chrome-for-testing" }
      ],
      "scripts": {
        "test-setup": "cp .env.testing .env",
        "test": "nohup bash -c './vendor/laravel/dusk/bin/chromedriver-linux --port=9515 > /dev/null 2>&1 &' && nohup bash -c 'php artisan serve --no-reload > /dev/null 2>&1 &' && php artisan dusk"
      }
    }
  }
}
```

<a id="running-tests-on-travis-ci"></a>
### Travis CI

Para executar seus testes do Dusk no [Travis CI](https://travis-ci.org), use a seguinte configuração `.travis.yml`. Como o Travis CI não é um ambiente gráfico, precisaremos tomar alguns passos extras para iniciar um navegador Chrome. Além disso, usaremos `php artisan serve` para iniciar o servidor web embutido do PHP:

```yaml
language: php

php:
  - 8.2

addons:
  chrome: stable

install:
  - cp .env.testing .env
  - travis_retry composer install --no-interaction --prefer-dist
  - php artisan key:generate
  - php artisan dusk:chrome-driver

before_script:
  - google-chrome-stable --headless --disable-gpu --remote-debugging-port=9222 http://localhost &
  - php artisan serve --no-reload &

script:
  - php artisan dusk
```

<a id="running-tests-on-github-actions"></a>
### GitHub Actions

Se você estiver usando o [GitHub Actions](https://github.com/features/actions) para executar seus testes do Dusk, pode usar o seguinte arquivo de configuração como ponto de partida. Assim como no TravisCI, usaremos o comando `php artisan serve` para iniciar o servidor web embutido do PHP:

```yaml
name: CI
on: [push]
jobs:

  dusk-php:
    runs-on: ubuntu-latest
    env:
      APP_URL: "http://127.0.0.1:8000"
      DB_USERNAME: root
      DB_PASSWORD: root
      MAIL_MAILER: log
    steps:
      - uses: actions/checkout@v5
      - name: Prepare The Environment
        run: cp .env.example .env
      - name: Create Database
        run: |
          sudo systemctl start mysql
          mysql --user="root" --password="root" -e "CREATE DATABASE \`my-database\` character set UTF8mb4 collate utf8mb4_bin;"
      - name: Install Composer Dependencies
        run: composer install --no-progress --prefer-dist --optimize-autoloader
      - name: Generate Application Key
        run: php artisan key:generate
      - name: Upgrade Chrome Driver
        run: php artisan dusk:chrome-driver --detect
      - name: Start Chrome Driver
        run: ./vendor/laravel/dusk/bin/chromedriver-linux --port=9515 &
      - name: Run Laravel Server
        run: php artisan serve --no-reload &
      - name: Run Dusk Tests
        run: php artisan dusk
      - name: Upload Screenshots
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: screenshots
          path: tests/Browser/screenshots
      - name: Upload Console Logs
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: console
          path: tests/Browser/console
```

<a id="running-tests-on-chipper-ci"></a>
### Chipper CI

Se você estiver usando o [Chipper CI](https://chipperci.com) para executar seus testes do Dusk, pode usar o seguinte arquivo de configuração como ponto de partida. Usaremos o servidor embutido do PHP para executar o Laravel, de forma que possamos escutar requisições:

```yaml
# file .chipperci.yml
version: 1

environment:
  php: 8.2
  node: 16

# Include Chrome in the build environment
services:
  - dusk

# Build all commits
on:
   push:
      branches: .*

pipeline:
  - name: Setup
    cmd: |
      cp -v .env.example .env
      composer install --no-interaction --prefer-dist --optimize-autoloader
      php artisan key:generate

      # Create a dusk env file, ensuring APP_URL uses BUILD_HOST
      cp -v .env .env.dusk.ci
      sed -i "s@APP_URL=.*@APP_URL=http://$BUILD_HOST:8000@g" .env.dusk.ci

  - name: Compile Assets
    cmd: |
      npm ci --no-audit
      npm run build

  - name: Browser Tests
    cmd: |
      php -S [::0]:8000 -t public 2>server.log &
      sleep 2
      php artisan dusk:chrome-driver $CHROME_DRIVER
      php artisan dusk --env=ci
```

Para saber mais sobre a execução de testes do Dusk no Chipper CI, incluindo como usar bancos de dados, consulte a [documentação oficial do Chipper CI](https://chipperci.com/docs/testing/laravel-dusk-new/).
