---
title: "Testes HTTP"
---

- [Introdução](#introduction)
- [Fazendo Requisições](#making-requests)
    - [Personalizando os Cabeçalhos da Requisição](#customizing-request-headers)
    - [Cookies](#cookies)
    - [Sessão / Autenticação](#session-and-authentication)
    - [Depurando Respostas](#debugging-responses)
    - [Tratamento de Exceções](#exception-handling)
- [Testando APIs JSON](#testing-json-apis)
    - [Testes Fluentes de JSON](#fluent-json-testing)
- [Testando Uploads de Arquivos](#testing-file-uploads)
- [Testando Views](#testing-views)
    - [Renderizando Blade e Componentes](#rendering-blade-and-components)
- [Fazendo Cache de Rotas](#caching-routes)
- [Asserções Disponíveis](#available-assertions)
    - [Asserções de Resposta](#response-assertions)
    - [Asserções de Autenticação](#authentication-assertions)
    - [Asserções de Validação](#validation-assertions)

<a id="introduction"></a>
## Introdução

O Laravel fornece uma API muito fluente para fazer requisições HTTP à sua aplicação e examinar as respostas. Por exemplo, dê uma olhada no teste de funcionalidade definido abaixo:

```php tab=Pest
<?php

test('the application returns a successful response', function () {
    $response = $this->get('/');

    $response->assertStatus(200);
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }
}
```

O método `get` faz uma requisição `GET` para a aplicação, enquanto o método `assertStatus` afirma que a resposta retornada deve ter o código de status HTTP informado. Além dessa asserção simples, o Laravel também contém uma variedade de asserções para inspecionar os cabeçalhos da resposta, o conteúdo, a estrutura JSON e muito mais.

<a id="making-requests"></a>
## Fazendo Requisições

Para fazer uma requisição à sua aplicação, você pode invocar os métodos `get`, `post`, `put`, `patch` ou `delete` dentro do seu teste. Esses métodos não disparam de fato uma requisição HTTP "real" para a sua aplicação. Em vez disso, toda a requisição de rede é simulada internamente.

Em vez de retornar uma instância de `Illuminate\Http\Response`, os métodos de requisição de teste retornam uma instância de `Illuminate\Testing\TestResponse`, que fornece uma [variedade de asserções úteis](#available-assertions) que permitem inspecionar as respostas da sua aplicação:

```php tab=Pest
<?php

test('basic request', function () {
    $response = $this->get('/');

    $response->assertStatus(200);
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_a_basic_request(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }
}
```

Em geral, cada um dos seus testes deve fazer apenas uma requisição à sua aplicação. Comportamentos inesperados podem ocorrer se várias requisições forem executadas dentro de um único método de teste.

> **Nota:**
> Por conveniência, o middleware CSRF é automaticamente desabilitado ao executar os testes.

<a id="customizing-request-headers"></a>
### Personalizando os Cabeçalhos da Requisição

Você pode usar o método `withHeaders` para personalizar os cabeçalhos da requisição antes que ela seja enviada à aplicação. Esse método permite adicionar quaisquer cabeçalhos personalizados que você queira à requisição:

```php tab=Pest
<?php

test('interacting with headers', function () {
    $response = $this->withHeaders([
        'X-Header' => 'Value',
    ])->post('/user', ['name' => 'Sally']);

    $response->assertStatus(201);
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic functional test example.
     */
    public function test_interacting_with_headers(): void
    {
        $response = $this->withHeaders([
            'X-Header' => 'Value',
        ])->post('/user', ['name' => 'Sally']);

        $response->assertStatus(201);
    }
}
```

<a id="cookies"></a>
### Cookies

Você pode usar os métodos `withCookie` ou `withCookies` para definir valores de cookies antes de fazer uma requisição. O método `withCookie` aceita um nome e um valor de cookie como seus dois argumentos, enquanto o método `withCookies` aceita um array de pares nome / valor:

```php tab=Pest
<?php

test('interacting with cookies', function () {
    $response = $this->withCookie('color', 'blue')->get('/');

    $response = $this->withCookies([
        'color' => 'blue',
        'name' => 'Taylor',
    ])->get('/');

    //
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_interacting_with_cookies(): void
    {
        $response = $this->withCookie('color', 'blue')->get('/');

        $response = $this->withCookies([
            'color' => 'blue',
            'name' => 'Taylor',
        ])->get('/');

        //
    }
}
```

<a id="session-and-authentication"></a>
### Sessão / Autenticação

O Laravel fornece vários helpers para interagir com a sessão durante os testes HTTP. Primeiro, você pode definir os dados da sessão a partir de um array usando o método `withSession`. Isso é útil para carregar a sessão com dados antes de disparar uma requisição para a sua aplicação:

```php tab=Pest
<?php

test('interacting with the session', function () {
    $response = $this->withSession(['banned' => false])->get('/');

    //
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_interacting_with_the_session(): void
    {
        $response = $this->withSession(['banned' => false])->get('/');

        //
    }
}
```

A sessão do Laravel é tipicamente usada para manter o estado do usuário atualmente autenticado. Portanto, o método helper `actingAs` fornece uma forma simples de autenticar um usuário informado como o usuário atual. Por exemplo, podemos usar uma [factory de model](/pt-br/eloquent-factories/) para gerar e autenticar um usuário:

```php tab=Pest
<?php

use App\Models\User;

test('an action that requires authentication', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->withSession(['banned' => false])
        ->get('/');

    //
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_an_action_that_requires_authentication(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->withSession(['banned' => false])
            ->get('/');

        //
    }
}
```

Você também pode especificar qual guard deve ser usado para autenticar o usuário informado, passando o nome do guard como segundo argumento para o método `actingAs`. O guard fornecido ao método `actingAs` também se tornará o guard padrão durante a duração do teste:

```php
$this->actingAs($user, 'web');
```

Se você quiser garantir que a requisição não seja autenticada, você pode usar o método `actingAsGuest`:

```php
$this->actingAsGuest();
```

<a id="debugging-responses"></a>
### Depurando Respostas

Após fazer uma requisição de teste à sua aplicação, os métodos `dump`, `dumpHeaders` e `dumpSession` podem ser usados para examinar e depurar o conteúdo da resposta:

```php tab=Pest
<?php

test('basic test', function () {
    $response = $this->get('/');

    $response->dump();
    $response->dumpHeaders();
    $response->dumpSession();
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_basic_test(): void
    {
        $response = $this->get('/');

        $response->dump();
        $response->dumpHeaders();
        $response->dumpSession();
    }
}
```

Como alternativa, você pode usar os métodos `dd`, `ddHeaders`, `ddBody`, `ddJson` e `ddSession` para despejar informações sobre a resposta e então interromper a execução:

```php tab=Pest
<?php

test('basic test', function () {
    $response = $this->get('/');

    $response->dd();
    $response->ddHeaders();
    $response->ddBody();
    $response->ddJson();
    $response->ddSession();
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_basic_test(): void
    {
        $response = $this->get('/');

        $response->dd();
        $response->ddHeaders();
        $response->ddBody();
        $response->ddJson();
        $response->ddSession();
    }
}
```

<a id="exception-handling"></a>
### Tratamento de Exceções

Às vezes você pode precisar testar se sua aplicação está lançando uma exceção específica. Para isso, você pode "fakear" o handler de exceções através da facade `Exceptions`. Uma vez que o handler de exceções tenha sido fakeado, você pode utilizar os métodos `assertReported` e `assertNotReported` para fazer asserções contra exceções que foram lançadas durante a requisição:

```php tab=Pest
<?php

use App\Exceptions\InvalidOrderException;
use Illuminate\Support\Facades\Exceptions;

test('exception is thrown', function () {
    Exceptions::fake();

    $response = $this->get('/order/1');

    // Afirma que uma exceção foi lançada...
    Exceptions::assertReported(InvalidOrderException::class);

    // Afirma contra a exceção...
    Exceptions::assertReported(function (InvalidOrderException $e) {
        return $e->getMessage() === 'The order was invalid.';
    });
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use App\Exceptions\InvalidOrderException;
use Illuminate\Support\Facades\Exceptions;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_exception_is_thrown(): void
    {
        Exceptions::fake();

        $response = $this->get('/');

        // Afirma que uma exceção foi lançada...
        Exceptions::assertReported(InvalidOrderException::class);

        // Afirma contra a exceção...
        Exceptions::assertReported(function (InvalidOrderException $e) {
            return $e->getMessage() === 'The order was invalid.';
        });
    }
}
```

Os métodos `assertNotReported` e `assertNothingReported` podem ser usados para afirmar que uma determinada exceção não foi lançada durante a requisição ou que nenhuma exceção foi lançada:

```php
Exceptions::assertNotReported(InvalidOrderException::class);

Exceptions::assertNothingReported();
```

Você pode desabilitar completamente o tratamento de exceções para uma determinada requisição invocando o método `withoutExceptionHandling` antes de fazer sua requisição:

```php
$response = $this->withoutExceptionHandling()->get('/');
```

Além disso, se você quiser garantir que sua aplicação não esteja utilizando funcionalidades que foram descontinuadas pela linguagem PHP ou pelas bibliotecas que sua aplicação usa, você pode invocar o método `withoutDeprecationHandling` antes de fazer sua requisição. Quando o tratamento de descontinuações está desabilitado, os avisos de descontinuação serão convertidos em exceções, fazendo assim com que seu teste falhe:

```php
$response = $this->withoutDeprecationHandling()->get('/');
```

O método `assertThrows` pode ser usado para afirmar que o código dentro de uma determinada closure lança uma exceção do tipo especificado:

```php
$this->assertThrows(
    fn () => (new ProcessOrder)->execute(),
    OrderInvalid::class
);
```

Se você quiser inspecionar e fazer asserções contra a exceção que é lançada, você pode fornecer uma closure como segundo argumento para o método `assertThrows`:

```php
$this->assertThrows(
    fn () => (new ProcessOrder)->execute(),
    fn (OrderInvalid $e) => $e->orderId() === 123
);
```

O método `assertDoesntThrow` pode ser usado para afirmar que o código dentro de uma determinada closure não lança nenhuma exceção:

```php
$this->assertDoesntThrow(fn () => (new ProcessOrder)->execute());
```

<a id="testing-json-apis"></a>
## Testando APIs JSON

O Laravel também fornece vários helpers para testar APIs JSON e suas respostas. Por exemplo, os métodos `json`, `getJson`, `postJson`, `putJson`, `patchJson`, `deleteJson` e `optionsJson` podem ser usados para disparar requisições JSON com vários verbos HTTP. Você também pode facilmente passar dados e cabeçalhos para esses métodos. Para começar, vamos escrever um teste para fazer uma requisição `POST` para `/api/user` e afirmar que os dados JSON esperados foram retornados:

```php tab=Pest
<?php

test('making an api request', function () {
    $response = $this->postJson('/api/user', ['name' => 'Sally']);

    $response
        ->assertStatus(201)
        ->assertJson([
            'created' => true,
        ]);
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic functional test example.
     */
    public function test_making_an_api_request(): void
    {
        $response = $this->postJson('/api/user', ['name' => 'Sally']);

        $response
            ->assertStatus(201)
            ->assertJson([
                'created' => true,
            ]);
    }
}
```

Além disso, os dados da resposta JSON podem ser acessados como variáveis de array na resposta, tornando conveniente a inspeção dos valores individuais retornados dentro de uma resposta JSON:

```php tab=Pest
expect($response['created'])->toBeTrue();
```

```php tab=PHPUnit
$this->assertTrue($response['created']);
```

> **Nota:**
> O método `assertJson` converte a resposta em um array para verificar que o array informado existe dentro da resposta JSON retornada pela aplicação. Portanto, se houver outras propriedades na resposta JSON, este teste ainda passará desde que o fragmento informado esteja presente.

<a id="verifying-exact-match"></a>
#### Afirmando Correspondências Exatas de JSON

Como mencionado anteriormente, o método `assertJson` pode ser usado para afirmar que um fragmento de JSON existe dentro da resposta JSON. Se você quiser verificar que um determinado array **corresponde exatamente** ao JSON retornado pela sua aplicação, você deve usar o método `assertExactJson`:

```php tab=Pest
<?php

test('asserting an exact json match', function () {
    $response = $this->postJson('/user', ['name' => 'Sally']);

    $response
        ->assertStatus(201)
        ->assertExactJson([
            'created' => true,
        ]);
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic functional test example.
     */
    public function test_asserting_an_exact_json_match(): void
    {
        $response = $this->postJson('/user', ['name' => 'Sally']);

        $response
            ->assertStatus(201)
            ->assertExactJson([
                'created' => true,
            ]);
    }
}
```

<a id="verifying-json-paths"></a>
#### Afirmando em Caminhos JSON

Se você quiser verificar que a resposta JSON contém os dados informados em um caminho especificado, você deve usar o método `assertJsonPath`:

```php tab=Pest
<?php

test('asserting a json path value', function () {
    $response = $this->postJson('/user', ['name' => 'Sally']);

    $response
        ->assertStatus(201)
        ->assertJsonPath('team.owner.name', 'Darian');
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic functional test example.
     */
    public function test_asserting_a_json_paths_value(): void
    {
        $response = $this->postJson('/user', ['name' => 'Sally']);

        $response
            ->assertStatus(201)
            ->assertJsonPath('team.owner.name', 'Darian');
    }
}
```

O método `assertJsonPath` também aceita uma closure, que pode ser usada para determinar dinamicamente se a asserção deve passar:

```php
$response->assertJsonPath('team.owner.name', fn (string $name) => strlen($name) >= 3);
```

Se você precisar afirmar múltiplos caminhos JSON de uma vez, você pode usar o método `assertJsonPaths`. O valor esperado para cada caminho também pode ser uma closure:

```php
$response->assertJsonPaths([
    'team.owner.name' => 'Darian',
    'team.owner.email' => fn (string $email) => str($email)->is('*@laravel.com'),
    'team.members.0.name' => 'Sally',
]);
```

Você pode usar o método `assertJsonMissingPaths` para afirmar que múltiplos caminhos JSON estão ausentes da resposta:

```php
$response->assertJsonMissingPaths([
    'team.owner.password',
    'team.members.0.api_token',
]);
```

<a id="fluent-json-testing"></a>
### Testes Fluentes de JSON

O Laravel também oferece uma bela forma de testar fluentemente as respostas JSON da sua aplicação. Para começar, passe uma closure para o método `assertJson`. Essa closure será invocada com uma instância de `Illuminate\Testing\Fluent\AssertableJson`, que pode ser usada para fazer asserções contra o JSON retornado pela sua aplicação. O método `where` pode ser usado para fazer asserções contra um atributo específico do JSON, enquanto o método `missing` pode ser usado para afirmar que um atributo específico está ausente do JSON:

```php tab=Pest
use Illuminate\Testing\Fluent\AssertableJson;

test('fluent json', function () {
    $response = $this->getJson('/users/1');

    $response
        ->assertJson(fn (AssertableJson $json) =>
            $json->where('id', 1)
                ->where('name', 'Victoria Faith')
                ->where('email', fn (string $email) => str($email)->is('victoria@gmail.com'))
                ->whereNot('status', 'pending')
                ->missing('password')
                ->etc()
        );
});
```

```php tab=PHPUnit
use Illuminate\Testing\Fluent\AssertableJson;

/**
 * A basic functional test example.
 */
public function test_fluent_json(): void
{
    $response = $this->getJson('/users/1');

    $response
        ->assertJson(fn (AssertableJson $json) =>
            $json->where('id', 1)
                ->where('name', 'Victoria Faith')
                ->where('email', fn (string $email) => str($email)->is('victoria@gmail.com'))
                ->whereNot('status', 'pending')
                ->missing('password')
                ->etc()
        );
}
```

#### Entendendo o Método `etc`

No exemplo acima, você pode ter notado que invocamos o método `etc` ao final da nossa cadeia de asserções. Esse método informa ao Laravel que pode haver outros atributos presentes no objeto JSON. Se o método `etc` não for usado, o teste falhará se existirem outros atributos no objeto JSON contra os quais você não fez asserções.

A intenção por trás desse comportamento é protegê-lo de expor involuntariamente informações sensíveis nas suas respostas JSON, forçando você a explicitamente fazer uma asserção contra o atributo ou explicitamente permitir atributos adicionais através do método `etc`.

No entanto, você deve estar ciente de que não incluir o método `etc` na sua cadeia de asserções não garante que atributos adicionais não estejam sendo adicionados a arrays aninhados dentro do seu objeto JSON. O método `etc` apenas garante que não existam atributos adicionais no nível de aninhamento no qual o método `etc` é invocado.

<a id="asserting-json-attribute-presence-and-absence"></a>
#### Afirmando a Presença / Ausência de Atributos

Para afirmar que um atributo está presente ou ausente, você pode usar os métodos `has` e `missing`:

```php
$response->assertJson(fn (AssertableJson $json) =>
    $json->has('data')
        ->missing('message')
);
```

Além disso, os métodos `hasAll` e `missingAll` permitem afirmar a presença ou ausência de múltiplos atributos simultaneamente:

```php
$response->assertJson(fn (AssertableJson $json) =>
    $json->hasAll(['status', 'data'])
        ->missingAll(['message', 'code'])
);
```

Você pode usar o método `hasAny` para determinar se pelo menos um de uma lista de atributos informada está presente:

```php
$response->assertJson(fn (AssertableJson $json) =>
    $json->has('status')
        ->hasAny('data', 'message', 'code')
);
```

<a id="asserting-against-json-collections"></a>
#### Afirmando Contra Collections JSON

Frequentemente, sua rota retornará uma resposta JSON que contém múltiplos itens, como múltiplos usuários:

```php
Route::get('/users', function () {
    return User::all();
});
```

Nessas situações, podemos usar o método `has` do objeto JSON fluente para fazer asserções contra os usuários incluídos na resposta. Por exemplo, vamos afirmar que a resposta JSON contém três usuários. Em seguida, faremos algumas asserções sobre o primeiro usuário da collection usando o método `first`. O método `first` aceita uma closure que recebe outra string JSON asserível, que podemos usar para fazer asserções sobre o primeiro objeto da collection JSON:

```php
$response
    ->assertJson(fn (AssertableJson $json) =>
        $json->has(3)
            ->first(fn (AssertableJson $json) =>
                $json->where('id', 1)
                    ->where('name', 'Victoria Faith')
                    ->where('email', fn (string $email) => str($email)->is('victoria@gmail.com'))
                    ->missing('password')
                    ->etc()
            )
    );
```

Se você quiser fazer as mesmas asserções contra cada item de uma collection JSON, você pode usar o método `each`:

```php
$response
  ->assertJson(fn (AssertableJson $json) =>
      $json->has(3)
          ->each(fn (AssertableJson $json) =>
              $json->whereType('id', 'integer')
                  ->whereType('name', 'string')
                  ->whereType('email', 'string')
                  ->missing('password')
                  ->etc()
          )
  );
```

<a id="scoping-json-collection-assertions"></a>
#### Escopando Asserções de Collection JSON

Às vezes, as rotas da sua aplicação retornarão collections JSON que são atribuídas a chaves nomeadas:

```php
Route::get('/users', function () {
    return [
        'meta' => [...],
        'users' => User::all(),
    ];
});
```

Ao testar essas rotas, você pode usar o método `has` para afirmar contra o número de itens na collection. Além disso, você pode usar o método `has` para escopar uma cadeia de asserções:

```php
$response
    ->assertJson(fn (AssertableJson $json) =>
        $json->has('meta')
            ->has('users', 3)
            ->has('users.0', fn (AssertableJson $json) =>
                $json->where('id', 1)
                    ->where('name', 'Victoria Faith')
                    ->where('email', fn (string $email) => str($email)->is('victoria@gmail.com'))
                    ->missing('password')
                    ->etc()
            )
    );
```

No entanto, em vez de fazer duas chamadas separadas ao método `has` para afirmar contra a collection `users`, você pode fazer uma única chamada que fornece uma closure como seu terceiro parâmetro. Ao fazer isso, a closure será automaticamente invocada e escopada para o primeiro item da collection:

```php
$response
    ->assertJson(fn (AssertableJson $json) =>
        $json->has('meta')
            ->has('users', 3, fn (AssertableJson $json) =>
                $json->where('id', 1)
                    ->where('name', 'Victoria Faith')
                    ->where('email', fn (string $email) => str($email)->is('victoria@gmail.com'))
                    ->missing('password')
                    ->etc()
            )
    );
```

<a id="asserting-json-types"></a>
#### Afirmando Tipos JSON

Você pode querer apenas afirmar que as propriedades na resposta JSON são de um determinado tipo. A classe `Illuminate\Testing\Fluent\AssertableJson` fornece os métodos `whereType` e `whereAllType` para fazer exatamente isso:

```php
$response->assertJson(fn (AssertableJson $json) =>
    $json->whereType('id', 'integer')
        ->whereAllType([
            'users.0.name' => 'string',
            'meta' => 'array'
        ])
);
```

Você pode especificar múltiplos tipos usando o caractere `|`, ou passando um array de tipos como segundo parâmetro para o método `whereType`. A asserção terá sucesso se o valor da resposta for qualquer um dos tipos listados:

```php
$response->assertJson(fn (AssertableJson $json) =>
    $json->whereType('name', 'string|null')
        ->whereType('id', ['string', 'integer'])
);
```

Os métodos `whereType` e `whereAllType` reconhecem os seguintes tipos: `string`, `integer`, `double`, `boolean`, `array` e `null`.

<a id="testing-file-uploads"></a>
## Testando Uploads de Arquivos

A classe `Illuminate\Http\UploadedFile` fornece um método `fake` que pode ser usado para gerar arquivos ou imagens fictícios para testes. Isso, combinado com o método `fake` da facade `Storage`, simplifica enormemente o teste de uploads de arquivos. Por exemplo, você pode combinar essas duas funcionalidades para testar facilmente um formulário de upload de avatar:

```php tab=Pest
<?php

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('avatars can be uploaded', function () {
    Storage::fake('avatars');

    $file = UploadedFile::fake()->image('avatar.jpg');

    $response = $this->post('/avatar', [
        'avatar' => $file,
    ]);

    Storage::disk('avatars')->assertExists($file->hashName());
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_avatars_can_be_uploaded(): void
    {
        Storage::fake('avatars');

        $file = UploadedFile::fake()->image('avatar.jpg');

        $response = $this->post('/avatar', [
            'avatar' => $file,
        ]);

        Storage::disk('avatars')->assertExists($file->hashName());
    }
}
```

Se você quiser afirmar que um determinado arquivo não existe, você pode usar o método `assertMissing` fornecido pela facade `Storage`:

```php
Storage::fake('avatars');

// ...

Storage::disk('avatars')->assertMissing('missing.jpg');
```

<a id="fake-file-customization"></a>
#### Personalização de Arquivos Fictícios

Ao criar arquivos usando o método `fake` fornecido pela classe `UploadedFile`, você pode especificar a largura, a altura e o tamanho da imagem (em kilobytes) para testar melhor as regras de validação da sua aplicação:

```php
UploadedFile::fake()->image('avatar.jpg', $width, $height)->size(100);
```

Além de criar imagens, você pode criar arquivos de qualquer outro tipo usando o método `create`:

```php
UploadedFile::fake()->create('document.pdf', $sizeInKilobytes);
```

Se necessário, você pode passar um argumento `$mimeType` ao método para definir explicitamente o tipo MIME que deve ser retornado pelo arquivo:

```php
UploadedFile::fake()->create(
    'document.pdf', $sizeInKilobytes, 'application/pdf'
);
```

<a id="testing-views"></a>
## Testando Views

O Laravel também permite renderizar uma view sem fazer uma requisição HTTP simulada à aplicação. Para isso, você pode chamar o método `view` dentro do seu teste. O método `view` aceita o nome da view e um array opcional de dados. O método retorna uma instância de `Illuminate\Testing\TestView`, que oferece vários métodos para fazer asserções convenientes sobre o conteúdo da view:

```php tab=Pest
<?php

test('a welcome view can be rendered', function () {
    $view = $this->view('welcome', ['name' => 'Taylor']);

    $view->assertSee('Taylor');
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_a_welcome_view_can_be_rendered(): void
    {
        $view = $this->view('welcome', ['name' => 'Taylor']);

        $view->assertSee('Taylor');
    }
}
```

A classe `TestView` fornece os seguintes métodos de asserção: `assertSee`, `assertSeeInOrder`, `assertSeeText`, `assertSeeTextInOrder`, `assertDontSee` e `assertDontSeeText`.

Se necessário, você pode obter o conteúdo bruto e renderizado da view convertendo a instância de `TestView` em uma string:

```php
$contents = (string) $this->view('welcome');
```

<a id="sharing-errors"></a>
#### Compartilhando Erros

Algumas views podem depender de erros compartilhados no [error bag global fornecido pelo Laravel](/pt-br/validation/#quick-displaying-the-validation-errors). Para hidratar o error bag com mensagens de erro, você pode usar o método `withViewErrors`:

```php
$view = $this->withViewErrors([
    'name' => ['Please provide a valid name.']
])->view('form');

$view->assertSee('Please provide a valid name.');
```

<a id="rendering-blade-and-components"></a>
### Renderizando Blade e Componentes

Se necessário, você pode usar o método `blade` para avaliar e renderizar uma string [Blade](/pt-br/blade/) bruta. Assim como o método `view`, o método `blade` retorna uma instância de `Illuminate\Testing\TestView`:

```php
$view = $this->blade(
    '<x-component :name="$name" />',
    ['name' => 'Taylor']
);

$view->assertSee('Taylor');
```

Você pode usar o método `component` para avaliar e renderizar um [componente Blade](/pt-br/blade/#components). O método `component` retorna uma instância de `Illuminate\Testing\TestComponent`:

```php
$view = $this->component(Profile::class, ['name' => 'Taylor']);

$view->assertSee('Taylor');
```

<a id="caching-routes"></a>
## Fazendo Cache de Rotas

Antes de um teste rodar, o Laravel inicializa uma instância nova da aplicação, incluindo a coleta de todas as rotas definidas. Se suas aplicações têm muitos arquivos de rotas, você pode querer adicionar a trait `Illuminate\Foundation\Testing\WithCachedRoutes` aos seus test cases. Nos testes que usam essa trait, as rotas são construídas uma vez e armazenadas em memória, o que significa que o processo de coleta de rotas é executado apenas uma vez para todos os testes da sua suíte:

```php tab=Pest
<?php

use App\Http\Controllers\UserController;
use Illuminate\Foundation\Testing\WithCachedRoutes;

pest()->use(WithCachedRoutes::class);

test('basic example', function () {
    $this->get(action([UserController::class, 'index']));

    // ...
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use App\Http\Controllers\UserController;
use Illuminate\Foundation\Testing\WithCachedRoutes;
use Tests\TestCase;

class BasicTest extends TestCase
{
    use WithCachedRoutes;

    /**
     * A basic functional test example.
     */
    public function test_basic_example(): void
    {
        $response = $this->get(action([UserController::class, 'index']));

        // ...
    }
}
```

<a id="available-assertions"></a>
## Asserções Disponíveis

<a id="response-assertions"></a>
### Asserções de Resposta

A classe `Illuminate\Testing\TestResponse` do Laravel fornece uma variedade de métodos de asserção personalizados que você pode utilizar ao testar sua aplicação. Essas asserções podem ser acessadas na resposta que é retornada pelos métodos de teste `json`, `get`, `post`, `put` e `delete`:

<style>
    .collection-method-list > p {
        columns: 14.4em 2; -moz-columns: 14.4em 2; -webkit-columns: 14.4em 2;
    }

    .collection-method-list a {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>

<div class="collection-method-list" markdown="1">

[assertAccepted](#assert-accepted)
[assertBadRequest](#assert-bad-request)
[assertClientError](#assert-client-error)
[assertConflict](#assert-conflict)
[assertCookie](#assert-cookie)
[assertCookieExpired](#assert-cookie-expired)
[assertCookieNotExpired](#assert-cookie-not-expired)
[assertCookieMissing](#assert-cookie-missing)
[assertCreated](#assert-created)
[assertDontSee](#assert-dont-see)
[assertDontSeeText](#assert-dont-see-text)
[assertDownload](#assert-download)
[assertExactJson](#assert-exact-json)
[assertExactJsonStructure](#assert-exact-json-structure)
[assertFailedDependency](#assert-failed-dependency)
[assertForbidden](#assert-forbidden)
[assertFound](#assert-found)
[assertGone](#assert-gone)
[assertHeader](#assert-header)
[assertHeaderContains](#assert-header-contains)
[assertHeaderMissing](#assert-header-missing)
[assertInternalServerError](#assert-internal-server-error)
[assertJson](#assert-json)
[assertJsonCount](#assert-json-count)
[assertJsonFragment](#assert-json-fragment)
[assertJsonIsArray](#assert-json-is-array)
[assertJsonIsObject](#assert-json-is-object)
[assertJsonMissing](#assert-json-missing)
[assertJsonMissingExact](#assert-json-missing-exact)
[assertJsonMissingValidationErrors](#assert-json-missing-validation-errors)
[assertJsonPath](#assert-json-path)
[assertJsonPaths](#assert-json-paths)
[assertJsonMissingPath](#assert-json-missing-path)
[assertJsonMissingPaths](#assert-json-missing-paths)
[assertJsonStructure](#assert-json-structure)
[assertJsonValidationErrors](#assert-json-validation-errors)
[assertJsonValidationErrorFor](#assert-json-validation-error-for)
[assertLocation](#assert-location)
[assertMethodNotAllowed](#assert-method-not-allowed)
[assertMovedPermanently](#assert-moved-permanently)
[assertContent](#assert-content)
[assertNoContent](#assert-no-content)
[assertStreamed](#assert-streamed)
[assertStreamedContent](#assert-streamed-content)
[assertNotFound](#assert-not-found)
[assertOk](#assert-ok)
[assertPaymentRequired](#assert-payment-required)
[assertPlainCookie](#assert-plain-cookie)
[assertRedirect](#assert-redirect)
[assertRedirectBack](#assert-redirect-back)
[assertRedirectBackWithErrors](#assert-redirect-back-with-errors)
[assertRedirectBackWithoutErrors](#assert-redirect-back-without-errors)
[assertRedirectContains](#assert-redirect-contains)
[assertRedirectToRoute](#assert-redirect-to-route)
[assertRedirectToSignedRoute](#assert-redirect-to-signed-route)
[assertRequestTimeout](#assert-request-timeout)
[assertSee](#assert-see)
[assertSeeInOrder](#assert-see-in-order)
[assertSeeText](#assert-see-text)
[assertSeeTextInOrder](#assert-see-text-in-order)
[assertServerError](#assert-server-error)
[assertServiceUnavailable](#assert-service-unavailable)
[assertSessionHas](#assert-session-has)
[assertSessionHasInput](#assert-session-has-input)
[assertSessionHasAll](#assert-session-has-all)
[assertSessionHasErrors](#assert-session-has-errors)
[assertSessionHasErrorsIn](#assert-session-has-errors-in)
[assertSessionHasNoErrors](#assert-session-has-no-errors)
[assertSessionDoesntHaveErrors](#assert-session-doesnt-have-errors)
[assertSessionMissing](#assert-session-missing)
[assertSessionMissingInput](#assert-session-missing-input)
[assertStatus](#assert-status)
[assertSuccessful](#assert-successful)
[assertTooManyRequests](#assert-too-many-requests)
[assertUnauthorized](#assert-unauthorized)
[assertUnprocessable](#assert-unprocessable)
[assertUnsupportedMediaType](#assert-unsupported-media-type)
[assertValid](#assert-valid)
[assertInvalid](#assert-invalid)
[assertViewHas](#assert-view-has)
[assertViewHasAll](#assert-view-has-all)
[assertViewIs](#assert-view-is)
[assertViewMissing](#assert-view-missing)

</div>

<a id="assert-accepted"></a>
#### assertAccepted

Afirma que a resposta tem um código de status HTTP accepted (202):

```php
$response->assertAccepted();
```

<a id="assert-bad-request"></a>
#### assertBadRequest

Afirma que a resposta tem um código de status HTTP bad request (400):

```php
$response->assertBadRequest();
```

<a id="assert-client-error"></a>
#### assertClientError

Afirma que a resposta tem um código de status HTTP de erro de cliente (>= 400, < 500):

```php
$response->assertClientError();
```

<a id="assert-conflict"></a>
#### assertConflict

Afirma que a resposta tem um código de status HTTP conflict (409):

```php
$response->assertConflict();
```

<a id="assert-cookie"></a>
#### assertCookie

Afirma que a resposta contém o cookie informado:

```php
$response->assertCookie($cookieName, $value = null);
```

<a id="assert-cookie-expired"></a>
#### assertCookieExpired

Afirma que a resposta contém o cookie informado e que ele está expirado:

```php
$response->assertCookieExpired($cookieName);
```

<a id="assert-cookie-not-expired"></a>
#### assertCookieNotExpired

Afirma que a resposta contém o cookie informado e que ele não está expirado:

```php
$response->assertCookieNotExpired($cookieName);
```

<a id="assert-cookie-missing"></a>
#### assertCookieMissing

Afirma que a resposta não contém o cookie informado:

```php
$response->assertCookieMissing($cookieName);
```

<a id="assert-created"></a>
#### assertCreated

Afirma que a resposta tem um código de status HTTP 201:

```php
$response->assertCreated();
```

<a id="assert-dont-see"></a>
#### assertDontSee

Afirma que a string informada não está contida na resposta retornada pela aplicação. Esta asserção escapará automaticamente a string informada a menos que você passe um segundo argumento `false`:

```php
$response->assertDontSee($value, $escape = true);
```

<a id="assert-dont-see-text"></a>
#### assertDontSeeText

Afirma que a string informada não está contida no texto da resposta. Esta asserção escapará automaticamente a string informada a menos que você passe um segundo argumento `false`. Este método passará o conteúdo da resposta para a função PHP `strip_tags` antes de fazer a asserção:

```php
$response->assertDontSeeText($value, $escape = true);
```

<a id="assert-download"></a>
#### assertDownload

Afirma que a resposta é um "download". Tipicamente, isso significa que a rota invocada que retornou a resposta retornou uma resposta `Response::download`, `BinaryFileResponse` ou `Storage::download`:

```php
$response->assertDownload();
```

Se desejar, você pode afirmar que o arquivo baixável recebeu um determinado nome de arquivo:

```php
$response->assertDownload('image.jpg');
```

<a id="assert-exact-json"></a>
#### assertExactJson

Afirma que a resposta contém uma correspondência exata dos dados JSON informados:

```php
$response->assertExactJson(array $data);
```

<a id="assert-exact-json-structure"></a>
#### assertExactJsonStructure

Afirma que a resposta contém uma correspondência exata da estrutura JSON informada:

```php
$response->assertExactJsonStructure(array $data);
```

Este método é uma variante mais estrita de [assertJsonStructure](#assert-json-structure). Em contraste com `assertJsonStructure`, este método falhará se a resposta contiver quaisquer chaves que não estejam explicitamente incluídas na estrutura JSON esperada.

<a id="assert-failed-dependency"></a>
#### assertFailedDependency

Afirma que a resposta tem um código de status HTTP failed dependency (424):

```php
$response->assertFailedDependency();
```

<a id="assert-forbidden"></a>
#### assertForbidden

Afirma que a resposta tem um código de status HTTP forbidden (403):

```php
$response->assertForbidden();
```

<a id="assert-found"></a>
#### assertFound

Afirma que a resposta tem um código de status HTTP found (302):

```php
$response->assertFound();
```

<a id="assert-gone"></a>
#### assertGone

Afirma que a resposta tem um código de status HTTP gone (410):

```php
$response->assertGone();
```

<a id="assert-header"></a>
#### assertHeader

Afirma que o cabeçalho e o valor informados estão presentes na resposta:

```php
$response->assertHeader($headerName, $value = null);
```

<a id="assert-header-contains"></a>
#### assertHeaderContains

Afirma que o cabeçalho informado contém um determinado valor como substring:

```php
$response->assertHeaderContains($headerName, $value);
```

<a id="assert-header-missing"></a>
#### assertHeaderMissing

Afirma que o cabeçalho informado não está presente na resposta:

```php
$response->assertHeaderMissing($headerName);
```

<a id="assert-internal-server-error"></a>
#### assertInternalServerError

Afirma que a resposta tem um código de status HTTP "Internal Server Error" (500):

```php
$response->assertInternalServerError();
```

<a id="assert-json"></a>
#### assertJson

Afirma que a resposta contém os dados JSON informados:

```php
$response->assertJson(array $data, $strict = false);
```

O método `assertJson` converte a resposta em um array para verificar que o array informado existe dentro da resposta JSON retornada pela aplicação. Portanto, se houver outras propriedades na resposta JSON, este teste ainda passará desde que o fragmento informado esteja presente.

<a id="assert-json-count"></a>
#### assertJsonCount

Afirma que o JSON da resposta tem um array com o número esperado de itens na chave informada:

```php
$response->assertJsonCount($count, $key = null);
```

<a id="assert-json-fragment"></a>
#### assertJsonFragment

Afirma que a resposta contém os dados JSON informados em qualquer lugar da resposta:

```php
Route::get('/users', function () {
    return [
        'users' => [
            [
                'name' => 'Taylor Otwell',
            ],
        ],
    ];
});

$response->assertJsonFragment(['name' => 'Taylor Otwell']);
```

<a id="assert-json-is-array"></a>
#### assertJsonIsArray

Afirma que o JSON da resposta é um array:

```php
$response->assertJsonIsArray();
```

<a id="assert-json-is-object"></a>
#### assertJsonIsObject

Afirma que o JSON da resposta é um objeto:

```php
$response->assertJsonIsObject();
```

<a id="assert-json-missing"></a>
#### assertJsonMissing

Afirma que a resposta não contém os dados JSON informados:

```php
$response->assertJsonMissing(array $data);
```

<a id="assert-json-missing-exact"></a>
#### assertJsonMissingExact

Afirma que a resposta não contém os dados JSON exatos:

```php
$response->assertJsonMissingExact(array $data);
```

<a id="assert-json-missing-validation-errors"></a>
#### assertJsonMissingValidationErrors

Afirma que a resposta não tem erros de validação JSON para as chaves informadas:

```php
$response->assertJsonMissingValidationErrors($keys);
```

> **Nota:**
> O método mais genérico [assertValid](#assert-valid) pode ser usado para afirmar que uma resposta não tem erros de validação retornados como JSON **e** que nenhum erro foi gravado no armazenamento de sessão.

<a id="assert-json-path"></a>
#### assertJsonPath

Afirma que a resposta contém os dados informados no caminho especificado:

```php
$response->assertJsonPath($path, $expectedValue);
```

Por exemplo, se a seguinte resposta JSON for retornada pela sua aplicação:

```json
{
    "user": {
        "name": "Steve Schoger"
    }
}
```

Você pode afirmar que a propriedade `name` do objeto `user` corresponde a um determinado valor assim:

```php
$response->assertJsonPath('user.name', 'Steve Schoger');
```

<a id="assert-json-paths"></a>
#### assertJsonPaths

Afirma que a resposta contém os dados informados nos caminhos especificados:

```php
$response->assertJsonPaths(array $paths);
```

Por exemplo, você pode afirmar múltiplos valores dentro da resposta de uma vez:

```php
$response->assertJsonPaths([
    'user.name' => 'Steve Schoger',
    'user.email' => fn (string $email) => str($email)->endsWith('@laravel.com'),
]);
```

<a id="assert-json-missing-path"></a>
#### assertJsonMissingPath

Afirma que a resposta não contém o caminho informado:

```php
$response->assertJsonMissingPath($path);
```

Por exemplo, se a seguinte resposta JSON for retornada pela sua aplicação:

```json
{
    "user": {
        "name": "Steve Schoger"
    }
}
```

Você pode afirmar que ela não contém a propriedade `email` do objeto `user`:

```php
$response->assertJsonMissingPath('user.email');
```

<a id="assert-json-missing-paths"></a>
#### assertJsonMissingPaths

Afirma que a resposta não contém os caminhos informados:

```php
$response->assertJsonMissingPaths($paths);
```

Por exemplo, você pode afirmar que múltiplos caminhos estão ausentes da resposta:

```php
$response->assertJsonMissingPaths([
    'user.email',
    'user.password',
]);
```

<a id="assert-json-structure"></a>
#### assertJsonStructure

Afirma que a resposta tem uma determinada estrutura JSON:

```php
$response->assertJsonStructure(array $structure);
```

Por exemplo, se a resposta JSON retornada pela sua aplicação contiver os seguintes dados:

```json
{
    "user": {
        "name": "Steve Schoger"
    }
}
```

Você pode afirmar que a estrutura JSON corresponde às suas expectativas assim:

```php
$response->assertJsonStructure([
    'user' => [
        'name',
    ]
]);
```

Às vezes, as respostas JSON retornadas pela sua aplicação podem conter arrays de objetos:

```json
{
    "user": [
        {
            "name": "Steve Schoger",
            "age": 55,
            "location": "Earth"
        },
        {
            "name": "Mary Schoger",
            "age": 60,
            "location": "Earth"
        }
    ]
}
```

Nesta situação, você pode usar o caractere `*` para afirmar contra a estrutura de todos os objetos do array:

```php
$response->assertJsonStructure([
    'user' => [
        '*' => [
             'name',
             'age',
             'location'
        ]
    ]
]);
```

<a id="assert-json-validation-errors"></a>
#### assertJsonValidationErrors

Afirma que a resposta tem os erros de validação JSON informados para as chaves informadas. Este método deve ser usado ao fazer asserções contra respostas onde os erros de validação são retornados como uma estrutura JSON em vez de serem gravados na sessão:

```php
$response->assertJsonValidationErrors(array $data, $responseKey = 'errors');
```

> **Nota:**
> O método mais genérico [assertInvalid](#assert-invalid) pode ser usado para afirmar que uma resposta tem erros de validação retornados como JSON **ou** que os erros foram gravados no armazenamento de sessão.

<a id="assert-json-validation-error-for"></a>
#### assertJsonValidationErrorFor

Afirma que a resposta tem qualquer erro de validação JSON para a chave informada:

```php
$response->assertJsonValidationErrorFor(string $key, $responseKey = 'errors');
```

<a id="assert-method-not-allowed"></a>
#### assertMethodNotAllowed

Afirma que a resposta tem um código de status HTTP method not allowed (405):

```php
$response->assertMethodNotAllowed();
```

<a id="assert-moved-permanently"></a>
#### assertMovedPermanently

Afirma que a resposta tem um código de status HTTP moved permanently (301):

```php
$response->assertMovedPermanently();
```

<a id="assert-location"></a>
#### assertLocation

Afirma que a resposta tem o valor de URI informado no cabeçalho `Location`:

```php
$response->assertLocation($uri);
```

<a id="assert-content"></a>
#### assertContent

Afirma que a string informada corresponde ao conteúdo da resposta:

```php
$response->assertContent($value);
```

<a id="assert-no-content"></a>
#### assertNoContent

Afirma que a resposta tem o código de status HTTP informado e nenhum conteúdo:

```php
$response->assertNoContent($status = 204);
```

<a id="assert-streamed"></a>
#### assertStreamed

Afirma que a resposta foi uma resposta transmitida (streamed):

    $response->assertStreamed();

<a id="assert-streamed-content"></a>
#### assertStreamedContent

Afirma que a string informada corresponde ao conteúdo da resposta transmitida (streamed):

```php
$response->assertStreamedContent($value);
```

<a id="assert-not-found"></a>
#### assertNotFound

Afirma que a resposta tem um código de status HTTP not found (404):

```php
$response->assertNotFound();
```

<a id="assert-ok"></a>
#### assertOk

Afirma que a resposta tem um código de status HTTP 200:

```php
$response->assertOk();
```

<a id="assert-payment-required"></a>
#### assertPaymentRequired

Afirma que a resposta tem um código de status HTTP payment required (402):

```php
$response->assertPaymentRequired();
```

<a id="assert-plain-cookie"></a>
#### assertPlainCookie

Afirma que a resposta contém o cookie não criptografado informado:

```php
$response->assertPlainCookie($cookieName, $value = null);
```

<a id="assert-redirect"></a>
#### assertRedirect

Afirma que a resposta é um redirecionamento para a URI informada:

```php
$response->assertRedirect($uri = null);
```

<a id="assert-redirect-back"></a>
#### assertRedirectBack

Afirma se a resposta está redirecionando de volta para a página anterior:

```php
$response->assertRedirectBack();
```

<a id="assert-redirect-back-with-errors"></a>
#### assertRedirectBackWithErrors

Afirma se a resposta está redirecionando de volta para a página anterior e a [sessão tem os erros informados](#assert-session-has-errors):

```php
$response->assertRedirectBackWithErrors(
    array $keys = [], $format = null, $errorBag = 'default'
);
```

<a id="assert-redirect-back-without-errors"></a>
#### assertRedirectBackWithoutErrors

Afirma se a resposta está redirecionando de volta para a página anterior e a sessão não contém nenhuma mensagem de erro:

```php
$response->assertRedirectBackWithoutErrors();
```

<a id="assert-redirect-contains"></a>
#### assertRedirectContains

Afirma se a resposta está redirecionando para uma URI que contém a string informada:

```php
$response->assertRedirectContains($string);
```

<a id="assert-redirect-to-route"></a>
#### assertRedirectToRoute

Afirma que a resposta é um redirecionamento para a [rota nomeada](/pt-br/routing/#named-routes) informada:

```php
$response->assertRedirectToRoute($name, $parameters = []);
```

<a id="assert-redirect-to-signed-route"></a>
#### assertRedirectToSignedRoute

Afirma que a resposta é um redirecionamento para a [rota assinada](/pt-br/urls/#signed-urls) informada:

```php
$response->assertRedirectToSignedRoute($name = null, $parameters = []);
```

<a id="assert-request-timeout"></a>
#### assertRequestTimeout

Afirma que a resposta tem um código de status HTTP request timeout (408):

```php
$response->assertRequestTimeout();
```

<a id="assert-see"></a>
#### assertSee

Afirma que a string informada está contida na resposta. Esta asserção escapará automaticamente a string informada a menos que você passe um segundo argumento `false`:

```php
$response->assertSee($value, $escape = true);
```

<a id="assert-see-in-order"></a>
#### assertSeeInOrder

Afirma que as strings informadas estão contidas em ordem na resposta. Esta asserção escapará automaticamente as strings informadas a menos que você passe um segundo argumento `false`:

```php
$response->assertSeeInOrder(array $values, $escape = true);
```

<a id="assert-see-text"></a>
#### assertSeeText

Afirma que a string informada está contida no texto da resposta. Esta asserção escapará automaticamente a string informada a menos que você passe um segundo argumento `false`. O conteúdo da resposta será passado para a função PHP `strip_tags` antes de a asserção ser feita:

```php
$response->assertSeeText($value, $escape = true);
```

<a id="assert-see-text-in-order"></a>
#### assertSeeTextInOrder

Afirma que as strings informadas estão contidas em ordem no texto da resposta. Esta asserção escapará automaticamente as strings informadas a menos que você passe um segundo argumento `false`. O conteúdo da resposta será passado para a função PHP `strip_tags` antes de a asserção ser feita:

```php
$response->assertSeeTextInOrder(array $values, $escape = true);
```

<a id="assert-server-error"></a>
#### assertServerError

Afirma que a resposta tem um código de status HTTP de erro de servidor (>= 500 , < 600):

```php
$response->assertServerError();
```

<a id="assert-service-unavailable"></a>
#### assertServiceUnavailable

Afirma que a resposta tem um código de status HTTP "Service Unavailable" (503):

```php
$response->assertServiceUnavailable();
```

<a id="assert-session-has"></a>
#### assertSessionHas

Afirma que a sessão contém o dado informado:

```php
$response->assertSessionHas($key, $value = null);
```

Se necessário, uma closure pode ser fornecida como segundo argumento para o método `assertSessionHas`. A asserção passará se a closure retornar `true`:

```php
$response->assertSessionHas($key, function (User $value) {
    return $value->name === 'Taylor Otwell';
});
```

<a id="assert-session-has-input"></a>
#### assertSessionHasInput

Afirma que a sessão tem um determinado valor no [array de input gravado](/pt-br/responses/#redirecting-with-flashed-session-data):

```php
$response->assertSessionHasInput($key, $value = null);
```

Se necessário, uma closure pode ser fornecida como segundo argumento para o método `assertSessionHasInput`. A asserção passará se a closure retornar `true`:

```php
use Illuminate\Support\Facades\Crypt;

$response->assertSessionHasInput($key, function (string $value) {
    return Crypt::decryptString($value) === 'secret';
});
```

<a id="assert-session-has-all"></a>
#### assertSessionHasAll

Afirma que a sessão contém um determinado array de pares chave / valor:

```php
$response->assertSessionHasAll(array $data);
```

Por exemplo, se a sessão da sua aplicação contém as chaves `name` e `status`, você pode afirmar que ambas existem e têm os valores especificados assim:

```php
$response->assertSessionHasAll([
    'name' => 'Taylor Otwell',
    'status' => 'active',
]);
```

<a id="assert-session-has-errors"></a>
#### assertSessionHasErrors

Afirma que a sessão contém um erro para as `$keys` informadas. Se `$keys` for um array associativo, afirma que a sessão contém uma mensagem de erro específica (valor) para cada campo (chave). Este método deve ser usado ao testar rotas que gravam erros de validação na sessão em vez de retorná-los como uma estrutura JSON:

```php
$response->assertSessionHasErrors(
    array $keys = [], $format = null, $errorBag = 'default'
);
```

Por exemplo, para afirmar que os campos `name` e `email` têm mensagens de erro de validação que foram gravadas na sessão, você pode invocar o método `assertSessionHasErrors` assim:

```php
$response->assertSessionHasErrors(['name', 'email']);
```

Ou, você pode afirmar que um determinado campo tem uma mensagem de erro de validação específica:

```php
$response->assertSessionHasErrors([
    'name' => 'The given name was invalid.'
]);
```

> **Nota:**
> O método mais genérico [assertInvalid](#assert-invalid) pode ser usado para afirmar que uma resposta tem erros de validação retornados como JSON **ou** que os erros foram gravados no armazenamento de sessão.

<a id="assert-session-has-errors-in"></a>
#### assertSessionHasErrorsIn

Afirma que a sessão contém um erro para as `$keys` informadas dentro de um [error bag](/pt-br/validation/#named-error-bags) específico. Se `$keys` for um array associativo, afirma que a sessão contém uma mensagem de erro específica (valor) para cada campo (chave), dentro do error bag:

```php
$response->assertSessionHasErrorsIn($errorBag, $keys = [], $format = null);
```

<a id="assert-session-has-no-errors"></a>
#### assertSessionHasNoErrors

Afirma que a sessão não tem erros de validação:

```php
$response->assertSessionHasNoErrors();
```

<a id="assert-session-doesnt-have-errors"></a>
#### assertSessionDoesntHaveErrors

Afirma que a sessão não tem erros de validação para as chaves informadas:

```php
$response->assertSessionDoesntHaveErrors($keys = [], $format = null, $errorBag = 'default');
```

> **Nota:**
> O método mais genérico [assertValid](#assert-valid) pode ser usado para afirmar que uma resposta não tem erros de validação retornados como JSON **e** que nenhum erro foi gravado no armazenamento de sessão.

<a id="assert-session-missing"></a>
#### assertSessionMissing

Afirma que a sessão não contém a chave informada:

```php
$response->assertSessionMissing($key);
```

<a id="assert-session-missing-input"></a>
#### assertSessionMissingInput

Afirma que a sessão não tem a chave de input informada no array de input gravado:

```php
$response->assertSessionMissingInput($key);
```

<a id="assert-status"></a>
#### assertStatus

Afirma que a resposta tem um determinado código de status HTTP:

```php
$response->assertStatus($code);
```

<a id="assert-successful"></a>
#### assertSuccessful

Afirma que a resposta tem um código de status HTTP de sucesso (>= 200 e < 300):

```php
$response->assertSuccessful();
```

<a id="assert-too-many-requests"></a>
#### assertTooManyRequests

Afirma que a resposta tem um código de status HTTP too many requests (429):

```php
$response->assertTooManyRequests();
```

<a id="assert-unauthorized"></a>
#### assertUnauthorized

Afirma que a resposta tem um código de status HTTP unauthorized (401):

```php
$response->assertUnauthorized();
```

<a id="assert-unprocessable"></a>
#### assertUnprocessable

Afirma que a resposta tem um código de status HTTP unprocessable entity (422):

```php
$response->assertUnprocessable();
```

<a id="assert-unsupported-media-type"></a>
#### assertUnsupportedMediaType

Afirma que a resposta tem um código de status HTTP unsupported media type (415):

```php
$response->assertUnsupportedMediaType();
```

<a id="assert-valid"></a>
#### assertValid

Afirma que a resposta não tem erros de validação para as chaves informadas. Este método pode ser usado para fazer asserções contra respostas onde os erros de validação são retornados como uma estrutura JSON ou onde os erros de validação foram gravados na sessão:

```php
// Afirma que nenhum erro de validação está presente...
$response->assertValid();

// Afirma que as chaves informadas não têm erros de validação...
$response->assertValid(['name', 'email']);
```

<a id="assert-invalid"></a>
#### assertInvalid

Afirma que a resposta tem erros de validação para as chaves informadas. Este método pode ser usado para fazer asserções contra respostas onde os erros de validação são retornados como uma estrutura JSON ou onde os erros de validação foram gravados na sessão:

```php
$response->assertInvalid(['name', 'email']);
```

Você também pode afirmar que uma determinada chave tem uma mensagem de erro de validação específica. Ao fazer isso, você pode fornecer a mensagem inteira ou apenas uma pequena porção da mensagem:

```php
$response->assertInvalid([
    'name' => 'The name field is required.',
    'email' => 'valid email address',
]);
```

Se você quiser afirmar que os campos informados são os únicos campos com erros de validação, você pode usar o método `assertOnlyInvalid`:

```php
$response->assertOnlyInvalid(['name', 'email']);
```

<a id="assert-view-has"></a>
#### assertViewHas

Afirma que a view da resposta contém um determinado dado:

```php
$response->assertViewHas($key, $value = null);
```

Passar uma closure como segundo argumento para o método `assertViewHas` permitirá que você inspecione e faça asserções contra um dado específico da view:

```php
$response->assertViewHas('user', function (User $user) {
    return $user->name === 'Taylor';
});
```

Além disso, os dados da view podem ser acessados como variáveis de array na resposta, permitindo que você os inspecione convenientemente:

```php tab=Pest
expect($response['name'])->toBe('Taylor');
```

```php tab=PHPUnit
$this->assertEquals('Taylor', $response['name']);
```

<a id="assert-view-has-all"></a>
#### assertViewHasAll

Afirma que a view da resposta tem uma determinada lista de dados:

```php
$response->assertViewHasAll(array $data);
```

Este método pode ser usado para afirmar que a view simplesmente contém dados correspondentes às chaves informadas:

```php
$response->assertViewHasAll([
    'name',
    'email',
]);
```

Ou, você pode afirmar que os dados da view estão presentes e têm valores específicos:

```php
$response->assertViewHasAll([
    'name' => 'Taylor Otwell',
    'email' => 'taylor@example.com,',
]);
```

<a id="assert-view-is"></a>
#### assertViewIs

Afirma que a view informada foi retornada pela rota:

```php
$response->assertViewIs($value);
```

<a id="assert-view-missing"></a>
#### assertViewMissing

Afirma que a chave de dados informada não foi disponibilizada para a view retornada na resposta da aplicação:

```php
$response->assertViewMissing($key);
```

<a id="authentication-assertions"></a>
### Asserções de Autenticação

O Laravel também fornece uma variedade de asserções relacionadas à autenticação que você pode utilizar dentro dos testes de funcionalidade da sua aplicação. Observe que esses métodos são invocados na própria classe de teste e não na instância de `Illuminate\Testing\TestResponse` retornada por métodos como `get` e `post`.

<a id="assert-authenticated"></a>
#### assertAuthenticated

Afirma que um usuário está autenticado:

```php
$this->assertAuthenticated($guard = null);
```

<a id="assert-guest"></a>
#### assertGuest

Afirma que um usuário não está autenticado:

```php
$this->assertGuest($guard = null);
```

<a id="assert-authenticated-as"></a>
#### assertAuthenticatedAs

Afirma que um usuário específico está autenticado:

```php
$this->assertAuthenticatedAs($user, $guard = null);
```

<a id="validation-assertions"></a>
## Asserções de Validação

O Laravel fornece duas asserções primárias relacionadas à validação que você pode usar para garantir que os dados fornecidos na sua requisição eram válidos ou inválidos.

<a id="validation-assert-valid"></a>
#### assertValid

Afirma que a resposta não tem erros de validação para as chaves informadas. Este método pode ser usado para fazer asserções contra respostas onde os erros de validação são retornados como uma estrutura JSON ou onde os erros de validação foram gravados na sessão:

```php
// Afirma que nenhum erro de validação está presente...
$response->assertValid();

// Afirma que as chaves informadas não têm erros de validação...
$response->assertValid(['name', 'email']);
```

<a id="validation-assert-invalid"></a>
#### assertInvalid

Afirma que a resposta tem erros de validação para as chaves informadas. Este método pode ser usado para fazer asserções contra respostas onde os erros de validação são retornados como uma estrutura JSON ou onde os erros de validação foram gravados na sessão:

```php
$response->assertInvalid(['name', 'email']);
```

Você também pode afirmar que uma determinada chave tem uma mensagem de erro de validação específica. Ao fazer isso, você pode fornecer a mensagem inteira ou apenas uma pequena porção da mensagem:

```php
$response->assertInvalid([
    'name' => 'The name field is required.',
    'email' => 'valid email address',
]);
```
