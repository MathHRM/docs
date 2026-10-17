---
title: "Precognition"
---

- [Introdução](#introduction)
- [Validação ao Vivo](#live-validation)
    - [Usando Vue](#using-vue)
    - [Usando React](#using-react)
    - [Usando Alpine e Blade](#using-alpine)
    - [Configurando o Axios](#configuring-axios)
- [Validando Arrays](#validating-arrays)
- [Personalizando as Regras de Validação](#customizing-validation-rules)
- [Lidando com Uploads de Arquivos](#handling-file-uploads)
- [Gerenciando Efeitos Colaterais](#managing-side-effects)
- [Testes](#testing)

<a id="introduction"></a>
## Introdução

O Laravel Precognition permite que você antecipe o resultado de uma requisição HTTP futura. Um dos principais casos de uso do Precognition é a capacidade de fornecer validação "ao vivo" para sua aplicação JavaScript de frontend sem precisar duplicar as regras de validação do backend da sua aplicação.

Quando o Laravel recebe uma "requisição precognitiva", ele executa todos os middlewares da rota e resolve as dependências do controller da rota, incluindo a validação de [form requests](/pt-br/validation/#form-request-validation) - mas ele não executa de fato o método do controller da rota.

> **Note:**
> A partir do Inertia 2.3, o suporte ao Precognition é integrado. Consulte a [documentação de Formulários do Inertia](https://inertiajs.com/forms) para mais informações. Versões anteriores do Inertia exigem o Precognition 0.x.

<a id="live-validation"></a>
## Validação ao Vivo

<a id="using-vue"></a>
### Usando Vue

Usando o Laravel Precognition, você pode oferecer experiências de validação ao vivo aos seus usuários sem precisar duplicar suas regras de validação na sua aplicação Vue de frontend. Para ilustrar como isso funciona, vamos construir um formulário para criar novos usuários dentro da nossa aplicação.

Primeiro, para habilitar o Precognition em uma rota, o middleware `HandlePrecognitiveRequests` deve ser adicionado à definição da rota. Você também deve criar um [form request](/pt-br/validation/#form-request-validation) para hospedar as regras de validação da rota:

```php
use App\Http\Requests\StoreUserRequest;
use Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests;

Route::post('/users', function (StoreUserRequest $request) {
    // ...
})->middleware([HandlePrecognitiveRequests::class]);
```

Em seguida, você deve instalar os helpers de frontend do Laravel Precognition para Vue via NPM:

```shell
npm install laravel-precognition-vue
```

Com o pacote Laravel Precognition instalado, agora você pode criar um objeto de formulário usando a função `useForm` do Precognition, fornecendo o método HTTP (`post`), a URL de destino (`/users`) e os dados iniciais do formulário.

Então, para habilitar a validação ao vivo, invoque o método `validate` do formulário no evento `change` de cada input, fornecendo o nome do input:

```vue
<script setup>
import { useForm } from 'laravel-precognition-vue';

const form = useForm('post', '/users', {
    name: '',
    email: '',
});

const submit = () => form.submit();
</script>

<template>
    <form @submit.prevent="submit">
        <label for="name">Name</label>
        <input
            id="name"
            v-model="form.name"
            @change="form.validate('name')"
        />
        <div v-if="form.invalid('name')">
            {{ form.errors.name }}
        </div>

        <label for="email">Email</label>
        <input
            id="email"
            type="email"
            v-model="form.email"
            @change="form.validate('email')"
        />
        <div v-if="form.invalid('email')">
            {{ form.errors.email }}
        </div>

        <button :disabled="form.processing">
            Create User
        </button>
    </form>
</template>
```

Agora, à medida que o formulário é preenchido pelo usuário, o Precognition fornecerá uma saída de validação ao vivo alimentada pelas regras de validação do form request da rota. Quando os inputs do formulário são alterados, uma requisição de validação "precognitiva" com debounce será enviada à sua aplicação Laravel. Você pode configurar o tempo de debounce chamando a função `setValidationTimeout` do formulário:

```js
form.setValidationTimeout(3000);
```

Quando uma requisição de validação está em andamento, a propriedade `validating` do formulário será `true`:

```html
<div v-if="form.validating">
    Validating...
</div>
```

Quaisquer erros de validação retornados durante uma requisição de validação ou um envio de formulário preencherão automaticamente o objeto `errors` do formulário:

```html
<div v-if="form.invalid('email')">
    {{ form.errors.email }}
</div>
```

Você pode determinar se o formulário possui algum erro usando a propriedade `hasErrors` do formulário:

```html
<div v-if="form.hasErrors">
    <!-- ... -->
</div>
```

Você também pode determinar se um input passou ou falhou na validação passando o nome do input para as funções `valid` e `invalid` do formulário, respectivamente:

```html
<span v-if="form.valid('email')">
    ✅
</span>

<span v-else-if="form.invalid('email')">
    ❌
</span>
```

> **Warning:**
> Um input de formulário só aparecerá como válido ou inválido depois que for alterado e uma resposta de validação for recebida.

Se você estiver validando um subconjunto dos inputs de um formulário com o Precognition, pode ser útil limpar os erros manualmente. Você pode usar a função `forgetError` do formulário para isso:

```html
<input
    id="avatar"
    type="file"
    @change="(e) => {
        form.avatar = e.target.files[0]

        form.forgetError('avatar')
    }"
>
```

Como vimos, você pode se conectar ao evento `change` de um input e validar inputs individuais conforme o usuário interage com eles; no entanto, você pode precisar validar inputs com os quais o usuário ainda não interagiu. Isso é comum ao construir um "assistente" (wizard), onde você deseja validar todos os inputs visíveis, independentemente de o usuário ter interagido com eles ou não, antes de passar para a próxima etapa.

Para fazer isso com o Precognition, você deve chamar o método `validate` passando os nomes dos campos que deseja validar para a chave de configuração `only`. Você pode tratar o resultado da validação com os callbacks `onSuccess` ou `onValidationError`:

```html
<button
    type="button"
    @click="form.validate({
        only: ['name', 'email', 'phone'],
        onSuccess: (response) => nextStep(),
        onValidationError: (response) => /* ... */,
    })"
>Next Step</button>
```

Claro, você também pode executar código em reação à resposta do envio do formulário. A função `submit` do formulário retorna uma promise de requisição do Axios. Isso fornece uma maneira conveniente de acessar o payload da resposta, redefinir os inputs do formulário em um envio bem-sucedido ou tratar uma requisição que falhou:

```js
const submit = () => form.submit()
    .then(response => {
        form.reset();

        alert('User created.');
    })
    .catch(error => {
        alert('An error occurred.');
    });
```

Você pode determinar se uma requisição de envio de formulário está em andamento inspecionando a propriedade `processing` do formulário:

```html
<button :disabled="form.processing">
    Submit
</button>
```

<a id="using-react"></a>
### Usando React

Usando o Laravel Precognition, você pode oferecer experiências de validação ao vivo aos seus usuários sem precisar duplicar suas regras de validação na sua aplicação React de frontend. Para ilustrar como isso funciona, vamos construir um formulário para criar novos usuários dentro da nossa aplicação.

Primeiro, para habilitar o Precognition em uma rota, o middleware `HandlePrecognitiveRequests` deve ser adicionado à definição da rota. Você também deve criar um [form request](/pt-br/validation/#form-request-validation) para hospedar as regras de validação da rota:

```php
use App\Http\Requests\StoreUserRequest;
use Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests;

Route::post('/users', function (StoreUserRequest $request) {
    // ...
})->middleware([HandlePrecognitiveRequests::class]);
```

Em seguida, você deve instalar os helpers de frontend do Laravel Precognition para React via NPM:

```shell
npm install laravel-precognition-react
```

Com o pacote Laravel Precognition instalado, agora você pode criar um objeto de formulário usando a função `useForm` do Precognition, fornecendo o método HTTP (`post`), a URL de destino (`/users`) e os dados iniciais do formulário.

Para habilitar a validação ao vivo, você deve escutar os eventos `change` e `blur` de cada input. No manipulador do evento `change`, você deve definir os dados do formulário com a função `setData`, passando o nome do input e o novo valor. Então, no manipulador do evento `blur`, invoque o método `validate` do formulário, fornecendo o nome do input:

```jsx
import { useForm } from 'laravel-precognition-react';

export default function Form() {
    const form = useForm('post', '/users', {
        name: '',
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        form.submit();
    };

    return (
        <form onSubmit={submit}>
            <label htmlFor="name">Name</label>
            <input
                id="name"
                value={form.data.name}
                onChange={(e) => form.setData('name', e.target.value)}
                onBlur={() => form.validate('name')}
            />
            {form.invalid('name') && <div>{form.errors.name}</div>}

            <label htmlFor="email">Email</label>
            <input
                id="email"
                value={form.data.email}
                onChange={(e) => form.setData('email', e.target.value)}
                onBlur={() => form.validate('email')}
            />
            {form.invalid('email') && <div>{form.errors.email}</div>}

            <button disabled={form.processing}>
                Create User
            </button>
        </form>
    );
};
```

Agora, à medida que o formulário é preenchido pelo usuário, o Precognition fornecerá uma saída de validação ao vivo alimentada pelas regras de validação do form request da rota. Quando os inputs do formulário são alterados, uma requisição de validação "precognitiva" com debounce será enviada à sua aplicação Laravel. Você pode configurar o tempo de debounce chamando a função `setValidationTimeout` do formulário:

```js
form.setValidationTimeout(3000);
```

Quando uma requisição de validação está em andamento, a propriedade `validating` do formulário será `true`:

```jsx
{form.validating && <div>Validating...</div>}
```

Quaisquer erros de validação retornados durante uma requisição de validação ou um envio de formulário preencherão automaticamente o objeto `errors` do formulário:

```jsx
{form.invalid('email') && <div>{form.errors.email}</div>}
```

Você pode determinar se o formulário possui algum erro usando a propriedade `hasErrors` do formulário:

```jsx
{form.hasErrors && <div><!-- ... --></div>}
```

Você também pode determinar se um input passou ou falhou na validação passando o nome do input para as funções `valid` e `invalid` do formulário, respectivamente:

```jsx
{form.valid('email') && <span>✅</span>}

{form.invalid('email') && <span>❌</span>}
```

> **Warning:**
> Um input de formulário só aparecerá como válido ou inválido depois que for alterado e uma resposta de validação for recebida.

Se você estiver validando um subconjunto dos inputs de um formulário com o Precognition, pode ser útil limpar os erros manualmente. Você pode usar a função `forgetError` do formulário para isso:

```jsx
<input
    id="avatar"
    type="file"
    onChange={(e) => {
        form.setData('avatar', e.target.files[0]);

        form.forgetError('avatar');
    }}
>
```

Como vimos, você pode se conectar ao evento `blur` de um input e validar inputs individuais conforme o usuário interage com eles; no entanto, você pode precisar validar inputs com os quais o usuário ainda não interagiu. Isso é comum ao construir um "assistente" (wizard), onde você deseja validar todos os inputs visíveis, independentemente de o usuário ter interagido com eles ou não, antes de passar para a próxima etapa.

Para fazer isso com o Precognition, você deve chamar o método `validate` passando os nomes dos campos que deseja validar para a chave de configuração `only`. Você pode tratar o resultado da validação com os callbacks `onSuccess` ou `onValidationError`:

```jsx
<button
    type="button"
    onClick={() => form.validate({
        only: ['name', 'email', 'phone'],
        onSuccess: (response) => nextStep(),
        onValidationError: (response) => /* ... */,
    })}
>Next Step</button>
```

Claro, você também pode executar código em reação à resposta do envio do formulário. A função `submit` do formulário retorna uma promise de requisição do Axios. Isso fornece uma maneira conveniente de acessar o payload da resposta, redefinir os inputs do formulário em um envio bem-sucedido ou tratar uma requisição que falhou:

```js
const submit = (e) => {
    e.preventDefault();

    form.submit()
        .then(response => {
            form.reset();

            alert('User created.');
        })
        .catch(error => {
            alert('An error occurred.');
        });
};
```

Você pode determinar se uma requisição de envio de formulário está em andamento inspecionando a propriedade `processing` do formulário:

```html
<button disabled={form.processing}>
    Submit
</button>
```

<a id="using-alpine"></a>
### Usando Alpine e Blade

Usando o Laravel Precognition, você pode oferecer experiências de validação ao vivo aos seus usuários sem precisar duplicar suas regras de validação na sua aplicação Alpine de frontend. Para ilustrar como isso funciona, vamos construir um formulário para criar novos usuários dentro da nossa aplicação.

Primeiro, para habilitar o Precognition em uma rota, o middleware `HandlePrecognitiveRequests` deve ser adicionado à definição da rota. Você também deve criar um [form request](/pt-br/validation/#form-request-validation) para hospedar as regras de validação da rota:

```php
use App\Http\Requests\CreateUserRequest;
use Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests;

Route::post('/users', function (CreateUserRequest $request) {
    // ...
})->middleware([HandlePrecognitiveRequests::class]);
```

Em seguida, você deve instalar os helpers de frontend do Laravel Precognition para Alpine via NPM:

```shell
npm install laravel-precognition-alpine
```

Então, registre o plugin do Precognition com o Alpine no seu arquivo `resources/js/app.js`:

```js
import Alpine from 'alpinejs';
import Precognition from 'laravel-precognition-alpine';

window.Alpine = Alpine;

Alpine.plugin(Precognition);
Alpine.start();
```

Com o pacote Laravel Precognition instalado e registrado, agora você pode criar um objeto de formulário usando a "mágica" `$form` do Precognition, fornecendo o método HTTP (`post`), a URL de destino (`/users`) e os dados iniciais do formulário.

Para habilitar a validação ao vivo, você deve vincular os dados do formulário ao seu input relevante e então escutar o evento `change` de cada input. No manipulador do evento `change`, você deve invocar o método `validate` do formulário, fornecendo o nome do input:

```html
<form x-data="{
    form: $form('post', '/register', {
        name: '',
        email: '',
    }),
}">
    @csrf
    <label for="name">Name</label>
    <input
        id="name"
        name="name"
        x-model="form.name"
        @change="form.validate('name')"
    />
    <template x-if="form.invalid('name')">
        <div x-text="form.errors.name"></div>
    </template>

    <label for="email">Email</label>
    <input
        id="email"
        name="email"
        x-model="form.email"
        @change="form.validate('email')"
    />
    <template x-if="form.invalid('email')">
        <div x-text="form.errors.email"></div>
    </template>

    <button :disabled="form.processing">
        Create User
    </button>
</form>
```

Agora, à medida que o formulário é preenchido pelo usuário, o Precognition fornecerá uma saída de validação ao vivo alimentada pelas regras de validação do form request da rota. Quando os inputs do formulário são alterados, uma requisição de validação "precognitiva" com debounce será enviada à sua aplicação Laravel. Você pode configurar o tempo de debounce chamando a função `setValidationTimeout` do formulário:

```js
form.setValidationTimeout(3000);
```

Quando uma requisição de validação está em andamento, a propriedade `validating` do formulário será `true`:

```html
<template x-if="form.validating">
    <div>Validating...</div>
</template>
```

Quaisquer erros de validação retornados durante uma requisição de validação ou um envio de formulário preencherão automaticamente o objeto `errors` do formulário:

```html
<template x-if="form.invalid('email')">
    <div x-text="form.errors.email"></div>
</template>
```

Você pode determinar se o formulário possui algum erro usando a propriedade `hasErrors` do formulário:

```html
<template x-if="form.hasErrors">
    <div><!-- ... --></div>
</template>
```

Você também pode determinar se um input passou ou falhou na validação passando o nome do input para as funções `valid` e `invalid` do formulário, respectivamente:

```html
<template x-if="form.valid('email')">
    <span>✅</span>
</template>

<template x-if="form.invalid('email')">
    <span>❌</span>
</template>
```

> **Warning:**
> Um input de formulário só aparecerá como válido ou inválido depois que for alterado e uma resposta de validação for recebida.

Como vimos, você pode se conectar ao evento `change` de um input e validar inputs individuais conforme o usuário interage com eles; no entanto, você pode precisar validar inputs com os quais o usuário ainda não interagiu. Isso é comum ao construir um "assistente" (wizard), onde você deseja validar todos os inputs visíveis, independentemente de o usuário ter interagido com eles ou não, antes de passar para a próxima etapa.

Para fazer isso com o Precognition, você deve chamar o método `validate` passando os nomes dos campos que deseja validar para a chave de configuração `only`. Você pode tratar o resultado da validação com os callbacks `onSuccess` ou `onValidationError`:

```html
<button
    type="button"
    @click="form.validate({
        only: ['name', 'email', 'phone'],
        onSuccess: (response) => nextStep(),
        onValidationError: (response) => /* ... */,
    })"
>Next Step</button>
```

Você pode determinar se uma requisição de envio de formulário está em andamento inspecionando a propriedade `processing` do formulário:

```html
<button :disabled="form.processing">
    Submit
</button>
```

<a id="repopulating-old-form-data"></a>
#### Repopulando Dados Antigos do Formulário

No exemplo de criação de usuário discutido acima, estamos usando o Precognition para realizar a validação ao vivo; no entanto, estamos realizando um envio de formulário tradicional do lado do servidor para enviar o formulário. Portanto, o formulário deve ser preenchido com quaisquer inputs "antigos" e erros de validação retornados do envio de formulário do lado do servidor:

```html
<form x-data="{
    form: $form('post', '/register', {
        name: '{{ old('name') }}',
        email: '{{ old('email') }}',
    }).setErrors({{ Js::from($errors->messages()) }}),
}">
```

Alternativamente, se você quiser enviar o formulário via XHR, pode usar a função `submit` do formulário, que retorna uma promise de requisição do Axios:

```html
<form
    x-data="{
        form: $form('post', '/register', {
            name: '',
            email: '',
        }),
        submit() {
            this.form.submit()
                .then(response => {
                    this.form.reset();

                    alert('User created.')
                })
                .catch(error => {
                    alert('An error occurred.');
                });
        },
    }"
    @submit.prevent="submit"
>
```

<a id="configuring-axios"></a>
### Configurando o Axios

As bibliotecas de validação do Precognition usam o cliente HTTP [Axios](https://github.com/axios/axios) para enviar requisições ao backend da sua aplicação. Por conveniência, a instância do Axios pode ser personalizada se necessário pela sua aplicação. Por exemplo, ao usar a biblioteca `laravel-precognition-vue`, você pode adicionar cabeçalhos de requisição adicionais a cada requisição de saída no arquivo `resources/js/app.js` da sua aplicação:

```js
import { client } from 'laravel-precognition-vue';

client.axios().defaults.headers.common['Authorization'] = authToken;
```

Ou, se você já tiver uma instância do Axios configurada para sua aplicação, pode instruir o Precognition a usar essa instância:

```js
import Axios from 'axios';
import { client } from 'laravel-precognition-vue';

window.axios = Axios.create()
window.axios.defaults.headers.common['Authorization'] = authToken;

client.use(window.axios)
```

<a id="validating-arrays"></a>
## Validando Arrays

Você pode usar curingas (wildcards) para validar campos dentro de arrays ou objetos aninhados. Cada `*` corresponde a um único segmento de caminho:

```js
// Validar o email para todos os usuários em um array...
form.validate('users.*.email');

// Validar todos os campos em um objeto de perfil...
form.validate('profile.*');

// Validar todos os campos para todos os usuários...
form.validate('users.*.*');
```

<a id="customizing-validation-rules"></a>
## Personalizando as Regras de Validação

É possível personalizar as regras de validação executadas durante uma requisição precognitiva usando o método `isPrecognitive` da requisição.

Por exemplo, em um formulário de criação de usuário, podemos querer validar que uma senha não foi "comprometida" (uncompromised) apenas no envio final do formulário. Para requisições de validação precognitivas, simplesmente validaremos que a senha é obrigatória e tem no mínimo 8 caracteres. Usando o método `isPrecognitive`, podemos personalizar as regras definidas pelo nosso form request:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'password' => [
                'required',
                $this->isPrecognitive()
                    ? Password::min(8)
                    : Password::min(8)->uncompromised(),
            ],
            // ...
        ];
    }
}
```

<a id="handling-file-uploads"></a>
## Lidando com Uploads de Arquivos

Por padrão, o Laravel Precognition não faz upload nem valida arquivos durante uma requisição de validação precognitiva. Isso garante que arquivos grandes não sejam enviados desnecessariamente várias vezes.

Por causa desse comportamento, você deve garantir que sua aplicação [personalize as regras de validação do form request correspondente](#customizing-validation-rules) para especificar que o campo só é obrigatório para envios completos de formulário:

```php
/**
 * Get the validation rules that apply to the request.
 *
 * @return array
 */
public function rules()
{
    return [
        'avatar' => [
            ...$this->isPrecognitive() ? [] : ['required'],
            'image',
            'mimes:jpg,png',
            'dimensions:ratio=3/2',
        ],
        // ...
    ];
}
```

Se você quiser incluir arquivos em cada requisição de validação, pode invocar a função `validateFiles` na instância do formulário do lado do cliente:

```js
form.validateFiles();
```

<a id="managing-side-effects"></a>
## Gerenciando Efeitos Colaterais

Ao adicionar o middleware `HandlePrecognitiveRequests` a uma rota, você deve considerar se há algum efeito colateral em _outros_ middlewares que deva ser ignorado durante uma requisição precognitiva.

Por exemplo, você pode ter um middleware que incrementa o número total de "interações" que cada usuário tem com sua aplicação, mas pode não querer que as requisições precognitivas sejam contadas como uma interação. Para isso, podemos verificar o método `isPrecognitive` da requisição antes de incrementar a contagem de interações:

```php
<?php

namespace App\Http\Middleware;

use App\Facades\Interaction;
use Closure;
use Illuminate\Http\Request;

class InteractionMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): mixed
    {
        if (! $request->isPrecognitive()) {
            Interaction::incrementFor($request->user());
        }

        return $next($request);
    }
}
```

<a id="testing"></a>
## Testes

Se você quiser fazer requisições precognitivas em seus testes, o `TestCase` do Laravel inclui um helper `withPrecognition` que adicionará o cabeçalho de requisição `Precognition`.

Além disso, se você quiser verificar que uma requisição precognitiva foi bem-sucedida, por exemplo, não retornou nenhum erro de validação, você pode usar o método `assertSuccessfulPrecognition` na resposta:

```php tab=Pest
it('validates registration form with precognition', function () {
    $response = $this->withPrecognition()
        ->post('/register', [
            'name' => 'Taylor Otwell',
        ]);

    $response->assertSuccessfulPrecognition();

    expect(User::count())->toBe(0);
});
```

```php tab=PHPUnit
public function test_it_validates_registration_form_with_precognition()
{
    $response = $this->withPrecognition()
        ->post('/register', [
            'name' => 'Taylor Otwell',
        ]);

    $response->assertSuccessfulPrecognition();
    $this->assertSame(0, User::count());
}
```
