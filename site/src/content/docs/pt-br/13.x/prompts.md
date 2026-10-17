---
title: "Prompts"
---

- [Introdução](#introduction)
- [Instalação](#installation)
- [Prompts Disponíveis](#available-prompts)
    - [Text](#text)
    - [Textarea](#textarea)
    - [Number](#number)
    - [Password](#password)
    - [Confirm](#confirm)
    - [Select](#select)
    - [Multi-select](#multiselect)
    - [Suggest](#suggest)
    - [Search](#search)
    - [Multi-search](#multisearch)
    - [Pause](#pause)
    - [Autocomplete](#autocomplete)
- [Transformando a Entrada Antes da Validação](#transforming-input-before-validation)
- [Formulários](#forms)
- [Mensagens Informativas](#informational-messages)
- [Callouts](#callouts)
- [Tabelas](#tables)
- [Spin](#spin)
- [Barra de Progresso](#progress)
- [Task](#task)
- [Stream](#stream)
- [Título do Terminal](#terminal-title)
- [Limpando o Terminal](#clear)
- [Considerações sobre o Terminal](#terminal-considerations)
- [Ambientes Não Suportados e Fallbacks](#fallbacks)
- [Testes](#testing)

<a id="introduction"></a>
## Introdução

[Laravel Prompts](https://github.com/laravel/prompts) é um pacote PHP para adicionar formulários bonitos e amigáveis às suas aplicações de linha de comando, com recursos semelhantes aos de um navegador, incluindo texto placeholder e validação.

<img src="https://laravel.com/img/docs/prompts-example.png">

O Laravel Prompts é perfeito para aceitar a entrada do usuário em seus [comandos de console do Artisan](/en/artisan/#writing-commands), mas também pode ser usado em qualquer projeto PHP de linha de comando.

> **Note:**
> O Laravel Prompts oferece suporte a macOS, Linux e Windows com WSL. Para mais informações, consulte nossa documentação sobre [ambientes não suportados e fallbacks](#fallbacks).

<a id="installation"></a>
## Instalação

O Laravel Prompts já está incluído na versão mais recente do Laravel.

O Laravel Prompts também pode ser instalado em seus outros projetos PHP usando o gerenciador de pacotes Composer:

```shell
composer require laravel/prompts
```

<a id="available-prompts"></a>
## Prompts Disponíveis

<a id="text"></a>
### Text

A função `text` solicitará ao usuário a pergunta fornecida, aceitará a sua entrada e, em seguida, a retornará:

```php
use function Laravel\Prompts\text;

$name = text('What is your name?');
```

Você também pode incluir texto placeholder, um valor padrão e uma dica informativa:

```php
$name = text(
    label: 'What is your name?',
    placeholder: 'E.g. Taylor Otwell',
    default: $user?->name,
    hint: 'This will be displayed on your profile.'
);
```

<a id="text-required"></a>
#### Valores Obrigatórios

Se você exigir que um valor seja informado, pode passar o argumento `required`:

```php
$name = text(
    label: 'What is your name?',
    required: true
);
```

Se você quiser personalizar a mensagem de validação, também pode passar uma string:

```php
$name = text(
    label: 'What is your name?',
    required: 'Your name is required.'
);
```

<a id="text-validation"></a>
#### Validação Adicional

Por fim, se você quiser executar uma lógica de validação adicional, pode passar uma closure para o argumento `validate`:

```php
$name = text(
    label: 'What is your name?',
    validate: fn (string $value) => match (true) {
        strlen($value) < 3 => 'The name must be at least 3 characters.',
        strlen($value) > 255 => 'The name must not exceed 255 characters.',
        default => null
    }
);
```

A closure receberá o valor que foi informado e pode retornar uma mensagem de erro ou `null` se a validação passar.

Como alternativa, você pode aproveitar o poder do [validator](/en/validation/) do Laravel. Para fazer isso, forneça um array contendo o nome do atributo e as regras de validação desejadas ao argumento `validate`:

```php
$name = text(
    label: 'What is your name?',
    validate: ['name' => 'required|max:255|unique:users']
);
```

<a id="textarea"></a>
### Textarea

A função `textarea` solicitará ao usuário a pergunta fornecida, aceitará a sua entrada por meio de uma área de texto de múltiplas linhas e, em seguida, a retornará:

```php
use function Laravel\Prompts\textarea;

$story = textarea('Tell me a story.');
```

Você também pode incluir texto placeholder, um valor padrão e uma dica informativa:

```php
$story = textarea(
    label: 'Tell me a story.',
    placeholder: 'This is a story about...',
    hint: 'This will be displayed on your profile.'
);
```

<a id="textarea-required"></a>
#### Valores Obrigatórios

Se você exigir que um valor seja informado, pode passar o argumento `required`:

```php
$story = textarea(
    label: 'Tell me a story.',
    required: true
);
```

Se você quiser personalizar a mensagem de validação, também pode passar uma string:

```php
$story = textarea(
    label: 'Tell me a story.',
    required: 'A story is required.'
);
```

<a id="textarea-validation"></a>
#### Validação Adicional

Por fim, se você quiser executar uma lógica de validação adicional, pode passar uma closure para o argumento `validate`:

```php
$story = textarea(
    label: 'Tell me a story.',
    validate: fn (string $value) => match (true) {
        strlen($value) < 250 => 'The story must be at least 250 characters.',
        strlen($value) > 10000 => 'The story must not exceed 10,000 characters.',
        default => null
    }
);
```

A closure receberá o valor que foi informado e pode retornar uma mensagem de erro ou `null` se a validação passar.

Como alternativa, você pode aproveitar o poder do [validator](/en/validation/) do Laravel. Para fazer isso, forneça um array contendo o nome do atributo e as regras de validação desejadas ao argumento `validate`:

```php
$story = textarea(
    label: 'Tell me a story.',
    validate: ['story' => 'required|max:10000']
);
```

<a id="number"></a>
### Number

A função `number` solicitará ao usuário a pergunta fornecida, aceitará a sua entrada numérica e, em seguida, a retornará. A função `number` permite que o usuário use as teclas de seta para cima e para baixo para manipular o número:

```php
use function Laravel\Prompts\number;

$number = number('How many copies would you like?');
```

Você também pode incluir texto placeholder, um valor padrão e uma dica informativa:

```php
$name = number(
    label: 'How many copies would you like?',
    placeholder: '5',
    default: 1,
    hint: 'This will be determine how many copies to create.'
);
```

<a id="number-required"></a>
#### Valores Obrigatórios

Se você exigir que um valor seja informado, pode passar o argumento `required`:

```php
$copies = number(
    label: 'How many copies would you like?',
    required: true
);
```

Se você quiser personalizar a mensagem de validação, também pode passar uma string:

```php
$copies = number(
    label: 'How many copies would you like?',
    required: 'A number of copies is required.'
);
```

<a id="number-validation"></a>
#### Validação Adicional

Por fim, se você quiser executar uma lógica de validação adicional, pode passar uma closure para o argumento `validate`:

```php
$copies = number(
    label: 'How many copies would you like?',
    validate: fn (?int $value) => match (true) {
        $value < 1 => 'At least one copy is required.',
        $value > 100 => 'You may not create more than 100 copies.',
        default => null
    }
);
```

A closure receberá o valor que foi informado e pode retornar uma mensagem de erro ou `null` se a validação passar.

Como alternativa, você pode aproveitar o poder do [validator](/en/validation/) do Laravel. Para fazer isso, forneça um array contendo o nome do atributo e as regras de validação desejadas ao argumento `validate`:

```php
$copies = number(
    label: 'How many copies would you like?',
    validate: ['copies' => 'required|integer|min:1|max:100']
);
```

<a id="password"></a>
### Password

A função `password` é semelhante à função `text`, mas a entrada do usuário será mascarada à medida que ele digita no console. Isso é útil ao solicitar informações sensíveis, como senhas:

```php
use function Laravel\Prompts\password;

$password = password('What is your password?');
```

Você também pode incluir texto placeholder e uma dica informativa:

```php
$password = password(
    label: 'What is your password?',
    placeholder: 'password',
    hint: 'Minimum 8 characters.'
);
```

<a id="password-required"></a>
#### Valores Obrigatórios

Se você exigir que um valor seja informado, pode passar o argumento `required`:

```php
$password = password(
    label: 'What is your password?',
    required: true
);
```

Se você quiser personalizar a mensagem de validação, também pode passar uma string:

```php
$password = password(
    label: 'What is your password?',
    required: 'The password is required.'
);
```

<a id="password-validation"></a>
#### Validação Adicional

Por fim, se você quiser executar uma lógica de validação adicional, pode passar uma closure para o argumento `validate`:

```php
$password = password(
    label: 'What is your password?',
    validate: fn (string $value) => match (true) {
        strlen($value) < 8 => 'The password must be at least 8 characters.',
        default => null
    }
);
```

A closure receberá o valor que foi informado e pode retornar uma mensagem de erro ou `null` se a validação passar.

Como alternativa, você pode aproveitar o poder do [validator](/en/validation/) do Laravel. Para fazer isso, forneça um array contendo o nome do atributo e as regras de validação desejadas ao argumento `validate`:

```php
$password = password(
    label: 'What is your password?',
    validate: ['password' => 'min:8']
);
```

<a id="confirm"></a>
### Confirm

Se você precisar perguntar ao usuário uma confirmação do tipo "sim ou não", pode usar a função `confirm`. Os usuários podem usar as teclas de seta ou pressionar `y` ou `n` para selecionar sua resposta. Esta função retornará `true` ou `false`.

```php
use function Laravel\Prompts\confirm;

$confirmed = confirm('Do you accept the terms?');
```

Você também pode incluir um valor padrão, um texto personalizado para os rótulos "Yes" e "No" e uma dica informativa:

```php
$confirmed = confirm(
    label: 'Do you accept the terms?',
    default: false,
    yes: 'I accept',
    no: 'I decline',
    hint: 'The terms must be accepted to continue.'
);
```

<a id="confirm-required"></a>
#### Exigindo "Yes"

Se necessário, você pode exigir que os usuários selecionem "Yes" passando o argumento `required`:

```php
$confirmed = confirm(
    label: 'Do you accept the terms?',
    required: true
);
```

Se você quiser personalizar a mensagem de validação, também pode passar uma string:

```php
$confirmed = confirm(
    label: 'Do you accept the terms?',
    required: 'You must accept the terms to continue.'
);
```

<a id="select"></a>
### Select

Se você precisar que o usuário selecione a partir de um conjunto predefinido de opções, pode usar a função `select`:

```php
use function Laravel\Prompts\select;

$role = select(
    label: 'What role should the user have?',
    options: ['Member', 'Contributor', 'Owner']
);
```

Você também pode especificar a opção padrão e uma dica informativa:

```php
$role = select(
    label: 'What role should the user have?',
    options: ['Member', 'Contributor', 'Owner'],
    default: 'Owner',
    hint: 'The role may be changed at any time.'
);
```

Você também pode passar um array associativo para o argumento `options` para que a chave selecionada seja retornada em vez de seu valor:

```php
$role = select(
    label: 'What role should the user have?',
    options: [
        'member' => 'Member',
        'contributor' => 'Contributor',
        'owner' => 'Owner',
    ],
    default: 'owner'
);
```

Até cinco opções serão exibidas antes que a lista comece a rolar. Você pode personalizar isso passando o argumento `scroll`:

```php
$role = select(
    label: 'Which category would you like to assign?',
    options: Category::pluck('name', 'id'),
    scroll: 10
);
```

<a id="select-info"></a>
#### Informações Secundárias

O argumento `info` pode ser usado para exibir informações adicionais sobre a opção atualmente destacada. Quando uma closure é fornecida, ela receberá o valor da opção atualmente destacada e deve retornar uma string ou `null`:

```php
$role = select(
    label: 'What role should the user have?',
    options: [
        'member' => 'Member',
        'contributor' => 'Contributor',
        'owner' => 'Owner',
    ],
    info: fn (string $value) => match ($value) {
        'member' => 'Can view and comment.',
        'contributor' => 'Can view, comment, and edit.',
        'owner' => 'Full access to all resources.',
        default => null,
    }
);
```

Você também pode passar uma string estática para o argumento `info` se a informação não depender da opção destacada:

```php
$role = select(
    label: 'What role should the user have?',
    options: ['Member', 'Contributor', 'Owner'],
    info: 'The role may be changed at any time.'
);
```

<a id="select-validation"></a>
#### Validação Adicional

Diferentemente de outras funções de prompt, a função `select` não aceita o argumento `required` porque não é possível não selecionar nada. No entanto, você pode passar uma closure para o argumento `validate` se precisar apresentar uma opção, mas impedir que ela seja selecionada:

```php
$role = select(
    label: 'What role should the user have?',
    options: [
        'member' => 'Member',
        'contributor' => 'Contributor',
        'owner' => 'Owner',
    ],
    validate: fn (string $value) =>
        $value === 'owner' && User::where('role', 'owner')->exists()
            ? 'An owner already exists.'
            : null
);
```

Se o argumento `options` for um array associativo, então a closure receberá a chave selecionada; caso contrário, receberá o valor selecionado. A closure pode retornar uma mensagem de erro ou `null` se a validação passar.

<a id="multiselect"></a>
### Multi-select

Se você precisar que o usuário possa selecionar várias opções, pode usar a função `multiselect`:

```php
use function Laravel\Prompts\multiselect;

$permissions = multiselect(
    label: 'What permissions should be assigned?',
    options: ['Read', 'Create', 'Update', 'Delete']
);
```

Você também pode especificar opções padrão e uma dica informativa:

```php
use function Laravel\Prompts\multiselect;

$permissions = multiselect(
    label: 'What permissions should be assigned?',
    options: ['Read', 'Create', 'Update', 'Delete'],
    default: ['Read', 'Create'],
    hint: 'Permissions may be updated at any time.'
);
```

Você também pode passar um array associativo para o argumento `options` para retornar as chaves das opções selecionadas em vez de seus valores:

```php
$permissions = multiselect(
    label: 'What permissions should be assigned?',
    options: [
        'read' => 'Read',
        'create' => 'Create',
        'update' => 'Update',
        'delete' => 'Delete',
    ],
    default: ['read', 'create']
);
```

Até cinco opções serão exibidas antes que a lista comece a rolar. Você pode personalizar isso passando o argumento `scroll`:

```php
$categories = multiselect(
    label: 'What categories should be assigned?',
    options: Category::pluck('name', 'id'),
    scroll: 10
);
```

<a id="multiselect-info"></a>
#### Informações Secundárias

O argumento `info` pode ser usado para exibir informações adicionais sobre a opção atualmente destacada. Quando uma closure é fornecida, ela receberá o valor da opção atualmente destacada e deve retornar uma string ou `null`:

```php
$permissions = multiselect(
    label: 'What permissions should be assigned?',
    options: [
        'read' => 'Read',
        'create' => 'Create',
        'update' => 'Update',
        'delete' => 'Delete',
    ],
    info: fn (string $value) => match ($value) {
        'read' => 'View resources and their properties.',
        'create' => 'Create new resources.',
        'update' => 'Modify existing resources.',
        'delete' => 'Permanently remove resources.',
        default => null,
    }
);
```

<a id="multiselect-required"></a>
#### Exigindo um Valor

Por padrão, o usuário pode selecionar zero ou mais opções. Você pode passar o argumento `required` para forçar a seleção de uma ou mais opções:

```php
$categories = multiselect(
    label: 'What categories should be assigned?',
    options: Category::pluck('name', 'id'),
    required: true
);
```

Se você quiser personalizar a mensagem de validação, pode fornecer uma string ao argumento `required`:

```php
$categories = multiselect(
    label: 'What categories should be assigned?',
    options: Category::pluck('name', 'id'),
    required: 'You must select at least one category'
);
```

<a id="multiselect-validation"></a>
#### Validação Adicional

Você pode passar uma closure para o argumento `validate` se precisar apresentar uma opção, mas impedir que ela seja selecionada:

```php
$permissions = multiselect(
    label: 'What permissions should the user have?',
    options: [
        'read' => 'Read',
        'create' => 'Create',
        'update' => 'Update',
        'delete' => 'Delete',
    ],
    validate: fn (array $values) => ! in_array('read', $values)
        ? 'All users require the read permission.'
        : null
);
```

Se o argumento `options` for um array associativo, então a closure receberá as chaves selecionadas; caso contrário, receberá os valores selecionados. A closure pode retornar uma mensagem de erro ou `null` se a validação passar.

<a id="suggest"></a>
### Suggest

A função `suggest` pode ser usada para fornecer preenchimento automático para possíveis opções. O usuário ainda pode fornecer qualquer resposta, independentemente das dicas de preenchimento automático:

```php
use function Laravel\Prompts\suggest;

$name = suggest('What is your name?', ['Taylor', 'Dayle']);
```

Como alternativa, você pode passar uma closure como segundo argumento para a função `suggest`. A closure será chamada cada vez que o usuário digitar um caractere de entrada. A closure deve aceitar um parâmetro string contendo a entrada do usuário até o momento e retornar um array de opções para preenchimento automático:

```php
$name = suggest(
    label: 'What is your name?',
    options: fn ($value) => collect(['Taylor', 'Dayle'])
        ->filter(fn ($name) => Str::contains($name, $value, ignoreCase: true))
);
```

Você também pode incluir texto placeholder, um valor padrão e uma dica informativa:

```php
$name = suggest(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle'],
    placeholder: 'E.g. Taylor',
    default: $user?->name,
    hint: 'This will be displayed on your profile.'
);
```

<a id="suggest-info"></a>
#### Informações Secundárias

O argumento `info` pode ser usado para exibir informações adicionais sobre a opção atualmente destacada. Quando uma closure é fornecida, ela receberá o valor da opção atualmente destacada e deve retornar uma string ou `null`:

```php
$name = suggest(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle'],
    info: fn (string $value) => match ($value) {
        'Taylor' => 'Administrator',
        'Dayle' => 'Contributor',
        default => null,
    }
);
```

<a id="suggest-required"></a>
#### Valores Obrigatórios

Se você exigir que um valor seja informado, pode passar o argumento `required`:

```php
$name = suggest(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle'],
    required: true
);
```

Se você quiser personalizar a mensagem de validação, também pode passar uma string:

```php
$name = suggest(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle'],
    required: 'Your name is required.'
);
```

<a id="suggest-validation"></a>
#### Validação Adicional

Por fim, se você quiser executar uma lógica de validação adicional, pode passar uma closure para o argumento `validate`:

```php
$name = suggest(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle'],
    validate: fn (string $value) => match (true) {
        strlen($value) < 3 => 'The name must be at least 3 characters.',
        strlen($value) > 255 => 'The name must not exceed 255 characters.',
        default => null
    }
);
```

A closure receberá o valor que foi informado e pode retornar uma mensagem de erro ou `null` se a validação passar.

Como alternativa, você pode aproveitar o poder do [validator](/en/validation/) do Laravel. Para fazer isso, forneça um array contendo o nome do atributo e as regras de validação desejadas ao argumento `validate`:

```php
$name = suggest(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle'],
    validate: ['name' => 'required|min:3|max:255']
);
```

<a id="search"></a>
### Search

Se você tiver muitas opções para o usuário selecionar, a função `search` permite que o usuário digite uma consulta de busca para filtrar os resultados antes de usar as teclas de seta para selecionar uma opção:

```php
use function Laravel\Prompts\search;

$id = search(
    label: 'Search for the user that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : []
);
```

A closure receberá o texto que foi digitado pelo usuário até o momento e deve retornar um array de opções. Se você retornar um array associativo, a chave da opção selecionada será retornada; caso contrário, seu valor será retornado.

Ao filtrar um array no qual você pretende retornar o valor, você deve usar a função `array_values` ou o método `values` da Collection para garantir que o array não se torne associativo:

```php
$names = collect(['Taylor', 'Abigail']);

$selected = search(
    label: 'Search for the user that should receive the mail',
    options: fn (string $value) => $names
        ->filter(fn ($name) => Str::contains($name, $value, ignoreCase: true))
        ->values()
        ->all(),
);
```

Você também pode incluir texto placeholder e uma dica informativa:

```php
$id = search(
    label: 'Search for the user that should receive the mail',
    placeholder: 'E.g. Taylor Otwell',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    hint: 'The user will receive an email immediately.'
);
```

Até cinco opções serão exibidas antes que a lista comece a rolar. Você pode personalizar isso passando o argumento `scroll`:

```php
$id = search(
    label: 'Search for the user that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    scroll: 10
);
```

<a id="search-info"></a>
#### Informações Secundárias

O argumento `info` pode ser usado para exibir informações adicionais sobre a opção atualmente destacada. Quando uma closure é fornecida, ela receberá o valor da opção atualmente destacada e deve retornar uma string ou `null`:

```php
$id = search(
    label: 'Search for the user that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    info: fn (int $userId) => User::find($userId)?->email
);
```

<a id="search-validation"></a>
#### Validação Adicional

Se você quiser executar uma lógica de validação adicional, pode passar uma closure para o argumento `validate`:

```php
$id = search(
    label: 'Search for the user that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    validate: function (int|string $value) {
        $user = User::findOrFail($value);

        if ($user->opted_out) {
            return 'This user has opted-out of receiving mail.';
        }
    }
);
```

Se a closure `options` retornar um array associativo, então a closure receberá a chave selecionada; caso contrário, receberá o valor selecionado. A closure pode retornar uma mensagem de erro ou `null` se a validação passar.

<a id="multisearch"></a>
### Multi-search

Se você tiver muitas opções pesquisáveis e precisar que o usuário possa selecionar vários itens, a função `multisearch` permite que o usuário digite uma consulta de busca para filtrar os resultados antes de usar as teclas de seta e a barra de espaço para selecionar as opções:

```php
use function Laravel\Prompts\multisearch;

$ids = multisearch(
    'Search for users who should receive the mail',
    fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : []
);
```

A closure receberá o texto que foi digitado pelo usuário até o momento e deve retornar um array de opções. Se você retornar um array associativo, as chaves das opções selecionadas serão retornadas; caso contrário, seus valores serão retornados.

Ao filtrar um array no qual você pretende retornar o valor, você deve usar a função `array_values` ou o método `values` da Collection para garantir que o array não se torne associativo:

```php
$names = collect(['Taylor', 'Abigail']);

$selected = multisearch(
    label: 'Search for users who should receive the mail',
    options: fn (string $value) => $names
        ->filter(fn ($name) => Str::contains($name, $value, ignoreCase: true))
        ->values()
        ->all(),
);
```

Você também pode incluir texto placeholder e uma dica informativa:

```php
$ids = multisearch(
    label: 'Search for users who should receive the mail',
    placeholder: 'E.g. Taylor Otwell',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    hint: 'The user will receive an email immediately.'
);
```

Até cinco opções serão exibidas antes que a lista comece a rolar. Você pode personalizar isso fornecendo o argumento `scroll`:

```php
$ids = multisearch(
    label: 'Search for the users that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    scroll: 10
);
```

<a id="multisearch-info"></a>
#### Informações Secundárias

O argumento `info` pode ser usado para exibir informações adicionais sobre a opção atualmente destacada. Quando uma closure é fornecida, ela receberá o valor da opção atualmente destacada e deve retornar uma string ou `null`:

```php
$ids = multisearch(
    label: 'Search for the users that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    info: fn (int $userId) => User::find($userId)?->email
);
```

<a id="multisearch-required"></a>
#### Exigindo um Valor

Por padrão, o usuário pode selecionar zero ou mais opções. Você pode passar o argumento `required` para forçar a seleção de uma ou mais opções:

```php
$ids = multisearch(
    label: 'Search for the users that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    required: true
);
```

Se você quiser personalizar a mensagem de validação, também pode fornecer uma string ao argumento `required`:

```php
$ids = multisearch(
    label: 'Search for the users that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    required: 'You must select at least one user.'
);
```

<a id="multisearch-validation"></a>
#### Validação Adicional

Se você quiser executar uma lógica de validação adicional, pode passar uma closure para o argumento `validate`:

```php
$ids = multisearch(
    label: 'Search for the users that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    validate: function (array $values) {
        $optedOut = User::whereLike('name', '%a%')->findMany($values);

        if ($optedOut->isNotEmpty()) {
            return $optedOut->pluck('name')->join(', ', ', and ').' have opted out.';
        }
    }
);
```

Se a closure `options` retornar um array associativo, então a closure receberá as chaves selecionadas; caso contrário, receberá os valores selecionados. A closure pode retornar uma mensagem de erro ou `null` se a validação passar.

<a id="pause"></a>
### Pause

A função `pause` pode ser usada para exibir texto informativo ao usuário e aguardar que ele confirme seu desejo de prosseguir pressionando a tecla Enter / Return:

```php
use function Laravel\Prompts\pause;

pause('Press ENTER to continue.');
```

<a id="autocomplete"></a>
### Autocomplete

A função `autocomplete` pode ser usada para fornecer preenchimento automático inline para possíveis opções. À medida que o usuário digita, as sugestões que correspondem à sua entrada aparecerão como texto fantasma que pode ser aceito pressionando `Tab` ou a tecla de seta para a direita:

```php
use function Laravel\Prompts\autocomplete;

$name = autocomplete(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle', 'Jess', 'Nuno', 'Tim']
);
```

Você também pode incluir texto placeholder, um valor padrão e uma dica informativa:

```php
$name = autocomplete(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle', 'Jess', 'Nuno', 'Tim'],
    placeholder: 'E.g. Taylor',
    default: $user?->name,
    hint: 'Use tab to accept, up/down to cycle.'
);
```

<a id="autocomplete-closure"></a>
#### Opções Dinâmicas

Você também pode passar uma closure para gerar opções dinamicamente com base na entrada do usuário. A closure será chamada cada vez que o usuário digitar um caractere e deve retornar um array de opções para preenchimento automático:

```php
$file = autocomplete(
    label: 'Which file?',
    options: fn (string $value) => collect($files)
        ->filter(fn ($file) => str_starts_with(strtolower($file), strtolower($value)))
        ->values()
        ->all(),
);
```

<a id="autocomplete-required"></a>
#### Valores Obrigatórios

Se você exigir que um valor seja informado, pode passar o argumento `required`:

```php
$name = autocomplete(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle', 'Jess', 'Nuno', 'Tim'],
    required: true
);
```

Se você quiser personalizar a mensagem de validação, também pode passar uma string:

```php
$name = autocomplete(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle', 'Jess', 'Nuno', 'Tim'],
    required: 'Your name is required.'
);
```

<a id="autocomplete-validation"></a>
#### Validação Adicional

Por fim, se você quiser executar uma lógica de validação adicional, pode passar uma closure para o argumento `validate`:

```php
$name = autocomplete(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle', 'Jess', 'Nuno', 'Tim'],
    validate: fn (string $value) => match (true) {
        strlen($value) < 3 => 'The name must be at least 3 characters.',
        strlen($value) > 255 => 'The name must not exceed 255 characters.',
        default => null
    }
);
```

A closure receberá o valor que foi informado e pode retornar uma mensagem de erro ou `null` se a validação passar.

<a id="transforming-input-before-validation"></a>
## Transformando a Entrada Antes da Validação

Às vezes, você pode querer transformar a entrada do prompt antes que a validação ocorra. Por exemplo, você pode querer remover espaços em branco de quaisquer strings fornecidas. Para fazer isso, muitas das funções de prompt fornecem um argumento `transform`, que aceita uma closure:

```php
$name = text(
    label: 'What is your name?',
    transform: fn (string $value) => trim($value),
    validate: fn (string $value) => match (true) {
        strlen($value) < 3 => 'The name must be at least 3 characters.',
        strlen($value) > 255 => 'The name must not exceed 255 characters.',
        default => null
    }
);
```

<a id="forms"></a>
## Formulários

Muitas vezes, você terá vários prompts que serão exibidos em sequência para coletar informações antes de executar ações adicionais. Você pode usar a função `form` para criar um conjunto agrupado de prompts para o usuário preencher:

```php
use function Laravel\Prompts\form;

$responses = form()
    ->text('What is your name?', required: true)
    ->password('What is your password?', validate: ['password' => 'min:8'])
    ->confirm('Do you accept the terms?')
    ->submit();
```

O método `submit` retornará um array indexado numericamente contendo todas as respostas dos prompts do formulário. No entanto, você pode fornecer um nome para cada prompt por meio do argumento `name`. Quando um nome é fornecido, a resposta do prompt nomeado pode ser acessada por meio desse nome:

```php
use App\Models\User;
use function Laravel\Prompts\form;

$responses = form()
    ->text('What is your name?', required: true, name: 'name')
    ->password(
        label: 'What is your password?',
        validate: ['password' => 'min:8'],
        name: 'password'
    )
    ->confirm('Do you accept the terms?')
    ->submit();

User::create([
    'name' => $responses['name'],
    'password' => $responses['password'],
]);
```

O principal benefício de usar a função `form` é a capacidade de o usuário voltar aos prompts anteriores do formulário usando `CTRL + U`. Isso permite que o usuário corrija erros ou altere seleções sem precisar cancelar e reiniciar todo o formulário.

Se você precisar de um controle mais granular sobre um prompt em um formulário, pode invocar o método `add` em vez de chamar uma das funções de prompt diretamente. O método `add` recebe todas as respostas anteriores fornecidas pelo usuário:

```php
use function Laravel\Prompts\form;
use function Laravel\Prompts\outro;
use function Laravel\Prompts\text;

$responses = form()
    ->text('What is your name?', required: true, name: 'name')
    ->add(function ($responses) {
        return text("How old are you, {$responses['name']}?");
    }, name: 'age')
    ->submit();

outro("Your name is {$responses['name']} and you are {$responses['age']} years old.");
```

<a id="informational-messages"></a>
## Mensagens Informativas

As funções `note`, `info`, `warning`, `error` e `alert` podem ser usadas para exibir mensagens informativas:

```php
use function Laravel\Prompts\info;

info('Package installed successfully.');
```

<a id="callouts"></a>
## Callouts

A função `callout` exibe uma mensagem em uma caixa com um rótulo e conteúdo. Os callouts são úteis para exibir informações importantes que devem se destacar, como resumos de deploy, detalhes de erro ou atualizações de status:

```php
use function Laravel\Prompts\callout;

callout(
    label: 'Environment Configured',
    content: 'Your application is running in production mode with 4 workers.',
);
```

Você pode passar `warning` ou `error` como o argumento `type` para alterar o estilo visual do callout:

```php
callout(
    label: 'Deprecation Notice',
    content: 'The `--prefer-stable` flag will be removed in v4.0. Use `--stability=stable` instead.',
    type: 'warning',
);

callout(
    label: 'Database Connection Failed',
    content: 'Could not connect to MySQL on 127.0.0.1:3306.',
    type: 'error',
);
```

O argumento `info` adiciona uma linha de rodapé ao callout, que é útil para exibir metadados como IDs ou timestamps:

```php
callout(
    label: 'Deployment Summary',
    content: 'Your application was deployed to production.',
    info: 'deploy-id: d4f8a2c',
);
```

<a id="callout-rich-content"></a>
#### Conteúdo Rico

Em vez de passar uma string, você pode passar um array de strings e elementos para construir callouts ricos e estruturados. A classe `Element` fornece métodos de fábrica para criar títulos, listas com marcadores, listas numeradas, listas de chave-valor e links:

```php
use Laravel\Prompts\Elements\Element;

use function Laravel\Prompts\callout;

callout('Deployment Summary', [
    'Your application was deployed to production at 2024-03-15 14:32 UTC.',
    Element::heading('What Changed'),
    Element::bulletedList([
        'Migrated 3 pending database migrations',
        'Cleared and rebuilt route cache',
        'Restarted 4 queue workers',
    ]),
    Element::heading('Next Steps'),
    Element::numberedList([
        'Verify the health check endpoint at /up',
        'Monitor error rates for the next 15 minutes',
        'Confirm background jobs are processing',
    ]),
]);
```

Você também pode usar `Element::keyValueList` para exibir dados rotulados:

```php
callout('Database Connection Failed', [
    'Could not connect to the database server.',
    Element::keyValueList([
        'Host' => '127.0.0.1',
        'Port' => '3306',
        'Database' => 'forge',
        'Status' => 'Connection refused',
    ]),
], type: 'error');
```

O método `Element::link` cria um hiperlink clicável em terminais que oferecem suporte ao [OSC 8](https://gist.github.com/egmontkob/eb114294efbcd5adb1944c9f3cb5feda). Você pode fornecer apenas uma URL ou uma URL com um rótulo personalizado:

```php
callout('Server Health Check', [
    'Multiple services are reporting degraded performance.',
    Element::heading('Affected Services'),
    'Look here: '.Element::link('https://example.com/health', 'Health Dashboard'),
    Element::link('https://example.com/health'),
]);
```

Se nenhum rótulo for fornecido, a própria URL será exibida como o texto do link.

<a id="tables"></a>
## Tabelas

A função `table` facilita a exibição de várias linhas e colunas de dados. Tudo o que você precisa fazer é fornecer os nomes das colunas e os dados da tabela:

```php
use function Laravel\Prompts\table;

table(
    headers: ['Name', 'Email'],
    rows: User::all(['name', 'email'])->toArray()
);
```

<a id="spin"></a>
## Spin

A função `spin` exibe um spinner junto com uma mensagem opcional enquanto executa um callback especificado. Ela serve para indicar processos em andamento e retorna os resultados do callback após a conclusão:

```php
use function Laravel\Prompts\spin;

$response = spin(
    callback: fn () => Http::get('http://example.com'),
    message: 'Fetching response...'
);
```

> **Warning:**
> A função `spin` requer a extensão PHP [PCNTL](https://www.php.net/manual/en/book.pcntl.php) para animar o spinner. Quando essa extensão não está disponível, uma versão estática do spinner aparecerá em seu lugar.

<a id="progress"></a>
## Barras de Progresso

Para tarefas de longa duração, pode ser útil mostrar uma barra de progresso que informa aos usuários o quão completa a tarefa está. Usando a função `progress`, o Laravel exibirá uma barra de progresso e avançará seu progresso a cada iteração sobre um determinado valor iterável:

```php
use function Laravel\Prompts\progress;

$users = progress(
    label: 'Updating users',
    steps: User::all(),
    callback: fn ($user) => $this->performTask($user)
);
```

A função `progress` age como uma função de map e retornará um array contendo o valor de retorno de cada iteração do seu callback.

O callback também pode aceitar a instância `Laravel\Prompts\Progress`, permitindo que você modifique o rótulo e a dica em cada iteração:

```php
$users = progress(
    label: 'Updating users',
    steps: User::all(),
    callback: function ($user, $progress) {
        $progress
            ->label("Updating {$user->name}")
            ->hint("Created on {$user->created_at}");

        return $this->performTask($user);
    },
    hint: 'This may take some time.'
);
```

Às vezes, você pode precisar de um controle mais manual sobre como uma barra de progresso é avançada. Primeiro, defina o número total de etapas pelas quais o processo irá iterar. Em seguida, avance a barra de progresso por meio do método `advance` após processar cada item:

```php
$progress = progress(label: 'Updating users', steps: 10);

$users = User::all();

$progress->start();

foreach ($users as $user) {
    $this->performTask($user);

    $progress->advance();
}

$progress->finish();
```

<a id="task"></a>
## Task

A função `task` exibe uma tarefa rotulada com um spinner e uma área de saída ao vivo com rolagem enquanto um determinado callback é executado. Ela é ideal para envolver processos de longa duração, como instalação de dependências ou scripts de deploy, fornecendo visibilidade em tempo real do que está acontecendo:

```php
use function Laravel\Prompts\task;

task(
    label: 'Installing dependencies',
    callback: function ($logger) {
        // Long-running process...
    }
);
```

O callback recebe uma instância de `Logger` que você pode usar para exibir linhas de log, mensagens de status e texto transmitido na área de saída da tarefa.

> **Warning:**
> A função `task` requer a extensão PHP [PCNTL](https://www.php.net/manual/en/book.pcntl.php) para animar o spinner. Quando essa extensão não está disponível, uma versão estática da tarefa aparecerá em seu lugar.

<a id="task-logging"></a>
#### Registrando Linhas

O método `line` escreve uma única linha de log na área de saída com rolagem da tarefa:

```php
task(
    label: 'Installing dependencies',
    callback: function ($logger) {
        $logger->line('Resolving packages...');
        // ...
        $logger->line('Downloading laravel/framework');
        // ...
    }
);
```

<a id="task-status-messages"></a>
#### Mensagens de Status

Você pode usar os métodos `success`, `warning` e `error` para exibir mensagens de status. Elas aparecem como mensagens estáveis e destacadas acima da área de log com rolagem:

```php
task(
    label: 'Deploying application',
    callback: function ($logger) {
        $logger->line('Pulling latest changes...');
        // ...
        $logger->success('Changes pulled!');

        $logger->line('Running migrations...');
        // ...
        $logger->warning('No new migrations to run.');

        $logger->line('Clearing cache...');
        // ...
        $logger->success('Cache cleared!');
    }
);
```

<a id="task-label"></a>
#### Atualizando o Rótulo

O método `label` permite que você atualize o rótulo da tarefa enquanto ela está em execução:

```php
task(
    label: 'Starting deployment...',
    callback: function ($logger) {
        $logger->label('Pulling latest changes...');
        // ...
        $logger->label('Running migrations...');
        // ...
        $logger->label('Clearing cache...');
        // ...
    }
);
```

<a id="task-sub-label"></a>
#### Exibindo um Sub-Rótulo

O método `subLabel` exibe uma linha esmaecida abaixo do rótulo principal da tarefa, o que é útil para comunicar um status efêmero, como a etapa atualmente em andamento. Passe uma string vazia para limpar o sub-rótulo:

```php
task(
    label: 'Deploying',
    callback: function ($logger) {
        $logger->subLabel('Building assets...');
        // ...
        $logger->subLabel('Running migrations...');
        // ...
        $logger->subLabel('');
    }
);
```

Você também pode fornecer um sub-rótulo inicial por meio do argumento `subLabel`:

```php
task(
    label: 'Deploying',
    callback: function ($logger) {
        // ...
    },
    subLabel: 'Preparing...'
);
```

<a id="task-streaming"></a>
#### Transmitindo Texto

Para processos que produzem saída de forma incremental, como respostas geradas por IA, o método `partial` permite que você transmita texto palavra por palavra ou pedaço por pedaço. Quando o stream estiver completo, chame `commitPartial` para finalizar a saída:

```php
task(
    label: 'Generating response...',
    callback: function ($logger) {
        foreach ($words as $word) {
            $logger->partial($word . ' ');
        }

        $logger->commitPartial();
    }
);
```

<a id="task-limit"></a>
#### Personalizando o Limite de Saída

Por padrão, a tarefa exibe até 10 linhas de saída com rolagem. Você pode personalizar isso por meio do argumento `limit`:

```php
task(
    label: 'Installing dependencies',
    callback: function ($logger) {
        // ...
    },
    limit: 20
);
```

<a id="task-keep-summary"></a>
#### Mantendo o Resumo

Por padrão, a saída da tarefa é apagada assim que o callback termina. Se você quiser manter as mensagens de status na tela após a conclusão da tarefa, pode passar o argumento `keepSummary`:

```php
task(
    label: 'Deploying',
    callback: function ($logger) {
        $logger->success('Assets built');
        // ...
        $logger->success('Migrations complete');
    },
    keepSummary: true,
);
```

<a id="stream"></a>
## Stream

A função `stream` exibe texto que é transmitido para o terminal, ideal para exibir conteúdo gerado por IA ou qualquer texto que chega de forma incremental:

```php
use function Laravel\Prompts\stream;

$stream = stream();

foreach ($words as $word) {
    $stream->append($word . ' ');
    usleep(25_000); // Simulate delay between chunks...
}

$stream->close();
```

O método `append` adiciona texto ao stream, renderizando-o com um efeito gradual de fade-in. Quando todo o conteúdo tiver sido transmitido, chame o método `close` para finalizar a saída e restaurar o cursor.

<a id="terminal-title"></a>
## Título do Terminal

A função `title` atualiza o título da janela ou aba do terminal do usuário:

```php
use function Laravel\Prompts\title;

title('Installing Dependencies');
```

Para redefinir o título do terminal de volta ao seu padrão, passe uma string vazia:

```php
title('');
```

<a id="clear"></a>
## Limpando o Terminal

A função `clear` pode ser usada para limpar o terminal do usuário:

```php
use function Laravel\Prompts\clear;

clear();
```

<a id="terminal-considerations"></a>
## Considerações sobre o Terminal

<a id="terminal-width"></a>
#### Largura do Terminal

Se o comprimento de qualquer rótulo, opção ou mensagem de validação exceder o número de "colunas" no terminal do usuário, ele será automaticamente truncado para caber. Considere minimizar o comprimento dessas strings se seus usuários puderem estar usando terminais mais estreitos. Um comprimento máximo tipicamente seguro é de 74 caracteres para oferecer suporte a um terminal de 80 caracteres.

<a id="terminal-height"></a>
#### Altura do Terminal

Para quaisquer prompts que aceitem o argumento `scroll`, o valor configurado será automaticamente reduzido para caber na altura do terminal do usuário, incluindo espaço para uma mensagem de validação.

<a id="fallbacks"></a>
## Ambientes Não Suportados e Fallbacks

O Laravel Prompts oferece suporte a macOS, Linux e Windows com WSL. Devido a limitações na versão do PHP para Windows, atualmente não é possível usar o Laravel Prompts no Windows fora do WSL.

Por esse motivo, o Laravel Prompts oferece suporte a um fallback para uma implementação alternativa, como o [Symfony Console Question Helper](https://symfony.com/doc/current/components/console/helpers/questionhelper.html).

> **Note:**
> Ao usar o Laravel Prompts com o framework Laravel, os fallbacks para cada prompt já foram configurados para você e serão automaticamente habilitados em ambientes não suportados.

<a id="fallback-conditions"></a>
#### Condições de Fallback

Se você não estiver usando o Laravel ou precisar personalizar quando o comportamento de fallback é usado, pode passar um booleano para o método estático `fallbackWhen` na classe `Prompt`:

```php
use Laravel\Prompts\Prompt;

Prompt::fallbackWhen(
    ! $input->isInteractive() || windows_os() || app()->runningUnitTests()
);
```

<a id="fallback-behavior"></a>
#### Comportamento de Fallback

Se você não estiver usando o Laravel ou precisar personalizar o comportamento de fallback, pode passar uma closure para o método estático `fallbackUsing` em cada classe de prompt:

```php
use Laravel\Prompts\TextPrompt;
use Symfony\Component\Console\Question\Question;
use Symfony\Component\Console\Style\SymfonyStyle;

TextPrompt::fallbackUsing(function (TextPrompt $prompt) use ($input, $output) {
    $question = (new Question($prompt->label, $prompt->default ?: null))
        ->setValidator(function ($answer) use ($prompt) {
            if ($prompt->required && $answer === null) {
                throw new \RuntimeException(
                    is_string($prompt->required) ? $prompt->required : 'Required.'
                );
            }

            if ($prompt->validate) {
                $error = ($prompt->validate)($answer ?? '');

                if ($error) {
                    throw new \RuntimeException($error);
                }
            }

            return $answer;
        });

    return (new SymfonyStyle($input, $output))
        ->askQuestion($question);
});
```

Os fallbacks devem ser configurados individualmente para cada classe de prompt. A closure receberá uma instância da classe de prompt e deve retornar um tipo apropriado para o prompt.

<a id="testing"></a>
## Testes

O Laravel fornece uma variedade de métodos para testar se o seu comando exibe as mensagens de Prompt esperadas:

```php tab=Pest
test('report generation', function () {
    $this->artisan('report:generate')
        ->expectsPromptsInfo('Welcome to the application!')
        ->expectsPromptsWarning('This action cannot be undone')
        ->expectsPromptsError('Something went wrong')
        ->expectsPromptsAlert('Important notice!')
        ->expectsPromptsIntro('Starting process...')
        ->expectsPromptsOutro('Process completed!')
        ->expectsPromptsTable(
            headers: ['Name', 'Email'],
            rows: [
                ['Taylor Otwell', 'taylor@example.com'],
                ['Jason Beggs', 'jason@example.com'],
            ]
        )
        ->assertExitCode(0);
});
```

```php tab=PHPUnit
public function test_report_generation(): void
{
    $this->artisan('report:generate')
        ->expectsPromptsInfo('Welcome to the application!')
        ->expectsPromptsWarning('This action cannot be undone')
        ->expectsPromptsError('Something went wrong')
        ->expectsPromptsAlert('Important notice!')
        ->expectsPromptsIntro('Starting process...')
        ->expectsPromptsOutro('Process completed!')
        ->expectsPromptsTable(
            headers: ['Name', 'Email'],
            rows: [
                ['Taylor Otwell', 'taylor@example.com'],
                ['Jason Beggs', 'jason@example.com'],
            ]
        )
        ->assertExitCode(0);
}
```
