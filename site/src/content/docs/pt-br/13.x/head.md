---
title: "Laravel Head"
---

- [Introdução](#introduction)
- [Instalação](#installation)
- [Início Rápido](#quickstart)
- [Precedência de Resolução](#resolution-precedence)
- [Definindo Metadados](#defining-metadata)
    - [Padrões](#defaults)
    - [Metadados de Rota](#route-metadata)
    - [Metadados em Tempo de Execução](#runtime-metadata)
    - [Páginas de Erro](#error-pages)
- [Open Graph](#open-graph)
    - [Cards do X / Twitter](#twitter-cards)
- [Cores de Tema](#theme-colors)
- [Metadados e Ícones da Aplicação](#app-metadata-and-icons)
- [Progressive Web Apps](#progressive-web-apps)
- [Desempenho e Descoberta](#performance-and-discovery)
- [Tags Personalizadas](#custom-tags)
- [Schemas](#schemas)
    - [Breadcrumbs](#breadcrumbs)
    - [FAQs](#faqs)
    - [Schemas Personalizados](#custom-schemas)
- [Renderização](#rendering)
    - [Blade](#blade)
    - [Livewire](#livewire)
    - [Inertia](#inertia)

<a id="introduction"></a>
## Introdução

O [Laravel Head](https://github.com/laravel/head) fornece uma API fluente para gerenciar o elemento `<head>` do documento da sua aplicação, incluindo título e meta tags, metadados Open Graph, URLs canônicas, diretivas de robots, dicas de desempenho e dados estruturados. Ele funciona com Blade, Livewire e Inertia.

<a id="installation"></a>
## Instalação

Você pode instalar o Laravel Head usando o gerenciador de pacotes Composer:

```shell
composer require laravel/head
```

<a id="quickstart"></a>
## Início Rápido

Registre padrões para todo o site em um service provider:

```php
use Laravel\Head\Facades\Head;
use Laravel\Head\HeadBuilder;

Head::defaults(fn (HeadBuilder $head) => $head
    ->title('Laravel', suffix: ' - Laravel')
    ->description('Build something great.'));
```

Defina metadados específicos da página em tempo de execução:

```php
Head::title($post->title)
    ->description($post->description);
```

Renderize as tags resolvidas no seu layout:

```blade
<head>
    @head
</head>
```

<a id="resolution-precedence"></a>
## Precedência de Resolução

Os metadados da página são resolvidos a partir de cinco camadas, listadas da menor para a maior prioridade:

1. Padrões da página
2. Metadados de grupo de rota
3. Metadados de rota
4. Metadados em tempo de execução
5. Metadados de erro

Camadas superiores substituem as inferiores campo por campo. Por exemplo, um título em tempo de execução substitui o título da rota sem substituir a descrição da rota. As seções a seguir descrevem como definir metadados em cada camada. Para informações sobre como renderizar os metadados resolvidos em Blade, Livewire e Inertia, consulte [Renderização](#rendering).

<a id="defining-metadata"></a>
## Definindo Metadados

O Laravel Head permite que você defina metadados usando padrões para todo o site, metadados de rota, chamadas em tempo de execução e definições de páginas de erro.

<a id="defaults"></a>
### Padrões

Registre os padrões da página em um service provider:

```php
use Laravel\Head\Enums\OgType;
use Laravel\Head\Facades\Head;
use Laravel\Head\HeadBuilder;

Head::defaults(function (HeadBuilder $head) {
    $head
        ->title('Laravel', suffix: ' - Laravel')
        ->description('Build something great.')
        ->canonical()
        ->og(siteName: 'Laravel', type: OgType::Website)
        ->searchableByRobots()
        ->preconnect('https://fonts.example.com');
});
```

Os padrões são a camada de metadados de página de menor prioridade. Se nenhum metadado de rota, tempo de execução ou erro definir um título, `Laravel` é renderizado como está. Quando uma camada superior define um título de página, o sufixo herdado é aplicado, então `Head::title('About')` renderiza `About - Laravel`. Passe `exact: true` para títulos que devam ignorar um prefixo ou sufixo herdado.

Chamar `Head::canonical()` renderiza uma URL canônica usando a URL da requisição atual. Para definir uma URL explícita, passe uma string como `Head::canonical('/about')`. As URLs canônicas são normalizadas para `https` por padrão; passe `forceHttps: false` para preservar o esquema da requisição.

As diretivas de robots podem ser passadas como uma string bruta, como casos do enum `RobotsRule` ou como uma lista mesclando ambas as formas. As listas são renderizadas como diretivas separadas por vírgula, então `Head::robots([RobotsRule::NoIndex, RobotsRule::NoFollow])` renderiza `noindex, nofollow`.

Por conveniência, o método `searchableByRobots` renderiza `all`, enquanto o método `hiddenFromRobots` renderiza `none`.

<a id="route-metadata"></a>
### Metadados de Rota

Você pode definir metadados diretamente nas rotas, o que é especialmente útil para páginas semi-estáticas cujos metadados são conhecidos com antecedência.

<a id="routes-and-groups"></a>
#### Rotas e Grupos

```php
Route::view('/contact', 'contact')
    ->name('contact')
    ->withHead(
        title: 'Contact Us',
        description: 'Get in touch.',
    );
```

Metadados de rota compartilhados podem ser aplicados a um grupo em qualquer posição da cadeia:

```php
Route::withHead(robots: 'noindex, nofollow')
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/dashboard', DashboardController::class)
            ->name('dashboard')
            ->withHead(title: 'Dashboard');
    });
```

Você também pode definir metadados para rotas de resource e singleton:

```php
Route::resource('posts', PostController::class)->withHead(
    robots: 'index, follow',
);

Route::singleton('profile', ProfileController::class)->withHead(
    title: 'Your Profile',
);
```

O método `withHead` armazena arrays simples por meio da API nativa de metadados de rota do Laravel. É equivalente a chamar o método `metadata` com os atributos aninhados sob uma chave `head`, de modo que os metadados permaneçam compatíveis com rotas em cache.

Os argumentos nomeados são intencionalmente limitados às propriedades de rota embutidas do Laravel Head para que editores e análise estática possam detectar nomes escritos incorretamente. Atributos de rota registrados por construtores de tags personalizados podem ser passados através de `extensions`:

```php
Route::get('/article', ArticleController::class)->withHead(
    title: 'Article',
    extensions: ['readingTime' => 4],
);
```

<a id="supported-properties"></a>
#### Propriedades Suportadas

As propriedades de rota suportadas mapeiam para os mesmos nomes dos métodos do construtor fluente:

| Categoria | Propriedades |
| --- | --- |
| Documento | `title`, `description`, `canonical`, `robots` |
| Metadados da aplicação | `themeColor`, `applicationName`, `colorScheme`, `referrer`, `viewport`, `appleWebAppTitle`, `webAppCapable`, `appleWebAppStatusBarStyle` |
| Social | `og`, `ogImage`, `ogVideo`, `ogAudio`, `twitter`, `twitterImage` |
| Desempenho | `preload`, `prefetch`, `preconnect`, `dnsPrefetch` |
| Descoberta | `alternates`, `feed`, `icon`, `favicon`, `appleTouchIcon`, `appleTouchStartupImage`, `maskIcon`, `manifest` |
| Dados estruturados | `schema` |
| Tags personalizadas | `meta`, `link` |

Os nomes de opções aninhadas usam a mesma nomenclatura `camelCase` da API fluente, como `forceHttps`, `siteName` e `secureUrl`.

Propriedades repetíveis, como `ogImage`, `preload`, `feed`, `schema`, `icon` e `appleTouchStartupImage`, aceitam um único valor ou uma lista.

<a id="runtime-metadata"></a>
### Metadados em Tempo de Execução

Quando um valor não é conhecido até que uma requisição chegue, como o título de um post que está sendo visualizado, você pode defini-lo em tempo de execução:

```php
use Laravel\Head\Facades\Head;

public function __invoke(Post $post): Response
{
    Head::title($post->title);

    // ...
}
```

Chamadas em tempo de execução feitas através da facade `Head` sobrescrevem os metadados de rota para dados dependentes da requisição. Controllers e actions são os lugares mais comuns para fazer essas chamadas:

```php
use App\Models\Post;
use Laravel\Head\Facades\Head;

public function show(Post $post)
{
    Head::title($post->title)
        ->description($post->description);

    return view('posts.show', ['post' => $post]);
}
```

Múltiplas chamadas em tempo de execução são mescladas na ordem em que são executadas. Para campos de valor único, como título, descrição, URL canônica e diretivas de robots, a chamada posterior tem precedência. Campos repetíveis retêm múltiplas entradas, mas adicionar a mesma chave novamente atualiza a entrada anterior. Para o método `ogImage`, a URL é a chave:

```php
Head::ogImage('/images/cover.jpg', alt: 'Draft cover')
    ->ogImage('/images/gallery.jpg', alt: 'Gallery image')
    ->ogImage('/images/cover.jpg', alt: 'Final cover', width: 1200, height: 630);
```

```html
<meta property="og:image" content="/images/cover.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Final cover">
<meta property="og:image" content="/images/gallery.jpg">
<meta property="og:image:alt" content="Gallery image">
```

A mídia Open Graph herdada dos seus padrões atua como um fallback. Quando os metadados de rota, tempo de execução ou erro definem sua própria mídia do mesmo tipo, a mídia padrão é substituída em vez de mesclada, de modo que o `og:image` de uma página tenha precedência sobre uma imagem padrão de todo o site.

Você pode definir metadados condicionais de forma fluente usando os métodos `when` e `unless`:

```php
Head::title($post->title)
    ->when($post->isDraft(), fn ($head) => $head->hiddenFromRobots());
```

<a id="error-pages"></a>
### Páginas de Erro

Normalmente, você deve registrar os metadados de erro dentro do método `boot` da classe `AppServiceProvider` da sua aplicação:

```php
use Laravel\Head\ErrorPages;
use Laravel\Head\Facades\Head;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Head::errors(function (ErrorPages $errors) {
        $errors->defaults(robots: 'noindex, follow');

        $errors->status(
            404,
            title: 'Page Not Found',
            description: 'The page you are looking for could not be found.',
        );
    });
}
```

Os métodos `defaults` e `status` também aceitam o mesmo callback de construtor fluente usado por `Head::defaults()`:

```php
use Laravel\Head\ErrorPages;
use Laravel\Head\Facades\Head;
use Laravel\Head\HeadBuilder;

Head::errors(function (ErrorPages $errors) {
    $errors->status(404, fn (HeadBuilder $head) => $head
        ->title('Page Not Found')
        ->description('The page you are looking for could not be found.'));
});
```

Quando uma resposta é renderizada para um status de erro registrado, esses metadados têm precedência sobre todas as outras camadas.

O Laravel detecta automaticamente o status da resposta ao renderizar uma view de erro ou ao executar um hook da fase de resposta, como o método `handleExceptionsUsing()` do Inertia. Se você renderizar uma resposta de erro dentro de um callback `$exceptions->render()`, chame `Head::status(404)` antes de renderizar para que os metadados de erro sejam aplicados.

<a id="open-graph"></a>
## Open Graph

Você pode definir propriedades Open Graph usando o método `og`. Mídias repetíveis podem ser adicionadas usando os métodos de nível superior, que aceitam argumentos nomeados diretamente:

```php
use Laravel\Head\Enums\ImageType;
use Laravel\Head\Enums\OgType;

Head::og(type: OgType::Article, title: $post->title)
    ->ogImage($post->hero_image_url)
    ->ogImage(
        $post->gallery_image_url,
        alt: $post->gallery_image_alt,
        width: 1200,
        height: 630,
        type: ImageType::Jpeg,
    );
```

Os métodos `ogImage`, `ogVideo` e `ogAudio` aceitam uma URL como seu primeiro argumento, junto com argumentos nomeados opcionais, como `alt`, `width`, `height`, `type` e `secureUrl` onde suportado pela especificação Open Graph.

Você pode passar tipos MIME de imagem como casos do enum `ImageType` em qualquer lugar onde a API aceita um `type` de imagem, como `ImageType::Svg`, `ImageType::Png`, `ImageType::Jpeg` e `ImageType::Webp`.

> **Nota:**
> O `title` e a `description` do documento preenchem automaticamente os valores ausentes de `og:title` e `og:description`.

Para uma única imagem Open Graph sem outros atributos, você pode passar o argumento nomeado `image` ao método `og`:

```php
Head::og(
    type: OgType::Website,
    title: $page->title,
    description: $page->description,
    image: $page->og_image_url,
);
```

As chamadas `og(image: ...)` e `ogImage(...)` escrevem na mesma lista de imagens subjacente, então você pode usar a que for mais expressiva no local da chamada. Você pode usar o método [`meta`](#custom-tags) para extensões personalizadas do Open Graph, como propriedades de produto ou artigo.

<a id="twitter-cards"></a>
### Cards do X / Twitter

Para renderizar cards do X / Twitter a partir do mesmo título, descrição e imagem usados pelo Open Graph, registre `twitter()` nos seus padrões:

```php
use Laravel\Head\Enums\TwitterCard;
use Laravel\Head\Facades\Head;
use Laravel\Head\HeadBuilder;

Head::defaults(fn (HeadBuilder $head) => $head->twitter(
    card: TwitterCard::SummaryWithLargeImage,
));
```

Em seguida, defina os metadados em nível de página:

```php
Head::title('Introducing Laravel Head')
    ->description('A fluent API for Laravel document head metadata.')
    ->ogImage('https://example.com/social.jpg', alt: 'Introducing Laravel Head');
```

Isso renderiza as tags correspondentes do Twitter:

```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Introducing Laravel Head">
<meta name="twitter:description" content="A fluent API for Laravel document head metadata.">
<meta name="twitter:image" content="https://example.com/social.jpg">
<meta name="twitter:image:alt" content="Introducing Laravel Head">
```

Você pode personalizar páginas individuais com valores explícitos do Twitter:

```php
Head::twitter(title: $post->social_title)
    ->twitterImage($post->social_image_url, alt: $post->title);
```

Os metadados de rota aceitam `twitter` e `twitterImage`.

<a id="theme-colors"></a>
## Cores de Tema

Você pode definir cores de tema globalmente, por rota ou em tempo de execução:

```php
Head::themeColor('#0f172a');
```

Isso renderiza uma tag `<meta name="theme-color">`. Para cores de tema específicas de mídia, você pode usar o enum `Media`:

```php
use Laravel\Head\Enums\Media;

Head::themeColor('#ffffff', media: Media::Light)
    ->themeColor('#111827', media: Media::Dark);
```

O enum `Media` também inclui `Portrait` e `Landscape`. O argumento `media` também aceita uma string de media query personalizada.

Os metadados de rota suportam uma única cor de tema através da mesma chave `camelCase`:

```php
Route::view('/dashboard', 'dashboard')->withHead(
    themeColor: '#0f172a',
);
```

<a id="app-metadata-and-icons"></a>
## Metadados e Ícones da Aplicação

O Laravel Head inclui métodos para metadados comuns de navegador e aplicação:

```php
use Laravel\Head\Enums\ImageType;
use Laravel\Head\Enums\Media;

Head::applicationName('Laravel')
    ->colorScheme('light dark')
    ->referrer('strict-origin-when-cross-origin')
    ->viewport('width=device-width, initial-scale=1')
    ->appleWebAppTitle('Laravel')
    ->webAppCapable()
    ->appleWebAppStatusBarStyle('black')
    ->favicon('/favicon.svg', type: ImageType::Svg)
    ->icon('/favicon-32x32.png', type: ImageType::Png, sizes: '32x32')
    ->appleTouchIcon('/apple-touch-icon.png', sizes: '180x180')
    ->appleTouchStartupImage('/launch.png', media: Media::Portrait)
    ->maskIcon('/safari-pinned-tab.svg', color: '#111827')
    ->manifest('/site.webmanifest');
```

O método `favicon` é um alias para o método `icon` e aceita os mesmos argumentos `type`, `sizes` e `media`.

Os metadados de rota usam os mesmos nomes:

```php
use Laravel\Head\Enums\ImageType;
use Laravel\Head\Enums\Media;

Route::view('/dashboard', 'dashboard')->withHead(
    applicationName: 'Laravel',
    colorScheme: 'light dark',
    appleWebAppTitle: 'Laravel',
    webAppCapable: true,
    appleWebAppStatusBarStyle: 'black',
    favicon: [
        ['href' => '/favicon.svg', 'type' => ImageType::Svg],
        ['href' => '/favicon-32x32.png', 'type' => ImageType::Png, 'sizes' => '32x32'],
    ],
    appleTouchIcon: ['href' => '/apple-touch-icon.png', 'sizes' => '180x180'],
    appleTouchStartupImage: ['href' => '/launch.png', 'media' => Media::Portrait],
    manifest: '/site.webmanifest',
);
```

<a id="progressive-web-apps"></a>
## Progressive Web Apps

O método `pwa` configura as tags comuns do `<head>` do documento necessárias para um web app instalável:

```php
Head::pwa(
    name: 'Laravel',
    manifest: '/site.webmanifest',
    themeColor: '#0f172a',
    appleTouchIcon: '/apple-touch-icon.png',
    appleWebAppStatusBarStyle: 'black',
);
```

Isso renderiza o nome da aplicação, o link do manifest da aplicação web e os metadados standalone do iOS. Se fornecidos, a cor de tema, o estilo da barra de status da Apple e o ícone touch da Apple também são renderizados. Criar o manifest da aplicação web e registrar um service worker continuam sendo responsabilidade da sua aplicação.

Você pode usar o método `pwa` em padrões ou metadados em tempo de execução. Os metadados de rota suportam as propriedades individuais mostradas acima.

<a id="performance-and-discovery"></a>
## Desempenho e Descoberta

O Laravel Head renderiza dicas de desempenho, links de paginação, alternativas de locale e descoberta de feeds:

```php
Head::preload(asset('fonts/inter.woff2'), as: 'font', crossorigin: true)
    ->prefetch(asset('images/next.webp'))
    ->preconnect('https://cdn.example.com')
    ->dnsPrefetch('https://analytics.example.com')
    ->paginate($posts)
    ->alternates([
        'en' => 'https://example.com/en/about',
        'fr' => 'https://example.com/fr/about',
        'x-default' => 'https://example.com/about',
    ])
    ->feed('/feed', title: 'Laravel RSS')
    ->feed('/feed.atom', type: 'atom', title: 'Laravel Atom');
```

Para assets locais, `preloadAsset()` e `prefetchAsset()` resolvem a URL através do helper `asset()` e detectam o atributo `as` a partir da extensão do arquivo. Os preloads de fontes incluem automaticamente `crossorigin`, que a especificação de preload exige mesmo para fontes de mesma origem:

```php
Head::preloadAsset('fonts/inter.woff2')
    ->prefetchAsset('images/next.webp');
```

```html
<link rel="preload" href="https://example.com/fonts/inter.woff2" as="font" crossorigin>
<link rel="prefetch" href="https://example.com/images/next.webp" as="image">
```

Você pode passar `as` explicitamente para sobrepor a detecção. O método `preloadAsset` lançará uma exceção quando o atributo `as` não puder ser detectado a partir da extensão, pois os navegadores ignoram preloads sem este atributo; o método `prefetchAsset` simplesmente o omitirá.

<a id="custom-tags"></a>
## Tags Personalizadas

Para tags sem um método dedicado, use `meta()` e `link()`:

```php
Head::meta('format-detection', 'telephone=no')
    ->meta('article:author', $post->author->name)
    ->link('search', '/opensearch.xml', [
        'type' => 'application/opensearchdescription+xml',
        'title' => 'Laravel Search',
    ])
    ->link('me', 'https://social.example.com/@laravel');
```

Você pode incluir uma media query em uma meta tag quando o navegador deve aplicar a tag apenas sob condições correspondentes:

```php
use Laravel\Head\Enums\Media;

Head::meta('theme-color', '#ffffff', media: Media::Light)
    ->meta('theme-color', '#111827', media: Media::Dark);
```

O método `meta` usa o atributo `name` para meta tags regulares. Para chaves que normalmente usam o atributo `property`, como Open Graph (`og:`) ou metadados de artigo (`article:`), o método alterna automaticamente:

```php
Head::meta('description', 'About Laravel')
    ->meta('og:title', 'About Laravel');
```

```html
<meta name="description" content="About Laravel">
<meta property="og:title" content="About Laravel">
```

Você pode passar `property: true` ou `property: false` para selecionar explicitamente um dos atributos.

<a id="schemas"></a>
## Schemas

Os construtores de schema embutidos cobrem os tipos comuns de JSON-LD:

```php
use Laravel\Head\Enums\OfferAvailability;
use Laravel\Head\Facades\Schema;

Head::schema(
    Schema::product()
        ->name($product->name)
        ->offers(
            Schema::offer()
                ->price($product->price)
                ->currency('USD')
                ->availability(OfferAvailability::InStock)
        )
);
```

Os métodos de factory embutidos são `article`, `blogPosting`, `product`, `offer`, `brand`, `breadcrumbs`, `faq`, `organization`, `person`, `webPage` e `webSite`. Métodos de factory desconhecidos criam um objeto de schema genérico, de modo que você ainda possa expressar tipos personalizados do schema.org.

Quando os dados de schema JSON-LD são inválidos, o Laravel Head lança uma exceção em ambientes não produtivos e registra um aviso em produção.

<a id="breadcrumbs"></a>
### Breadcrumbs

Os itens de breadcrumb podem ser adicionados um de cada vez ou em massa. As posições são atribuídas automaticamente na ordem em que os itens são adicionados:

```php
Head::schema(
    Schema::breadcrumbs()->items([
        'Home' => route('home'),
        'Shop' => route('shop.index'),
        'Shoes' => route('shop.category', 'shoes'),
    ])
);
```

Você pode usar o método `item` para adicionar um único item de breadcrumb:

```php
Schema::breadcrumbs()
    ->item('Home', route('home'))
    ->item('Shop', route('shop.index'));
```

<a id="faqs"></a>
### FAQs

As entradas de FAQ seguem o mesmo padrão. Você pode adicioná-las uma de cada vez usando o método `question` ou em massa usando o método `questions`:

```php
Head::schema(
    Schema::faq()->questions([
        'What is Laravel Head?' => 'A fluent API for managing the document head.',
        'Is it free?' => 'Yes, it is open source.',
    ])
);
```

<a id="custom-schemas"></a>
### Schemas Personalizados

Você pode registrar explicitamente tipos de schema personalizados:

```php
use DateTimeInterface;
use Laravel\Head\Facades\Schema;
use Laravel\Head\Schema\SchemaObject;
use Laravel\Head\SchemaType;

#[SchemaType('JobPosting')]
class JobPosting extends SchemaObject
{
    public function title(string $title): static
    {
        return $this->set('title', $title);
    }

    public function datePosted(DateTimeInterface|string $date): static
    {
        return $this->date('datePosted', $date);
    }
}

Schema::register(JobPosting::class);

Head::schema(
    Schema::jobPosting()
        ->title('Senior Laravel Developer')
        ->datePosted(now())
);
```

<a id="rendering"></a>
## Renderização

O Laravel Head resolve os metadados da página em tags para a resposta atual. Como essas tags são renderizadas depende da sua stack de aplicação.

O renderizador HTML alimenta a diretiva `@head` e os elementos renderizados que o Laravel Head compartilha com o Inertia via a prop `head`. O renderizador de array alimenta `Head::toArray()` para aplicações que precisam dos metadados resolvidos como dados estruturados.

<a id="blade"></a>
### Blade

Renderize as tags acumuladas no `<head>` do seu layout com a diretiva `@head`:

```blade
<head>
    <meta charset="utf-8">
    @head
</head>
```

A diretiva `@head` renderiza de forma síncrona, então você deve definir os metadados da página antes que o layout seja renderizado.

<a id="livewire"></a>
### Livewire

As aplicações Livewire usam a mesma diretiva `@head` em seu layout de documento:

```blade
<head>
    @head
</head>

<body>
    {{ $slot }}

    @livewireScripts
</body>
```

Nenhuma configuração específica do Livewire é necessária. Os metadados do Laravel Head são resolvidos por requisição, e o resolver é escopado por requisição. Portanto, cada visita `wire:navigate` busca um documento novo cuja saída `@head` reflete os metadados da rota de destino. Páginas visitadas usando `wire:navigate` recebem os metadados apropriados de rota, tempo de execução e erro sem exigir código de head em nível de componente.

<a id="inertia"></a>
### Inertia

Use a mesma diretiva `@head` no seu template raiz do Inertia, junto aos próprios componentes do Inertia:

```blade
<html>
<head>
    <meta charset="utf-8">
    @head

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    <x-inertia::head />
</head>
<body>
    <x-inertia::app />
</body>
</html>
```

Quando o Inertia está instalado, o Laravel Head compartilha automaticamente o head gerenciado pela página como um array de strings de elementos renderizados sob uma prop `head` em cada objeto de página:

```json
{
    "props": {
        "head": [
            "<title data-inertia=\"title\">Dashboard - Laravel</title>",
            "<meta data-inertia=\"description\" name=\"description\" content=\"Your application overview.\">"
        ]
    }
}
```

Habilite a opção `serverHead` do Inertia onde quer que sua aplicação chame `createInertiaApp()`. A opção está disponível no Inertia 3.5 e posterior:

```js
createInertiaApp({
    // ...
    serverHead: true,
});
```

Cada elemento gerenciado pela página tem uma chave `data-inertia` estável. A diretiva `@head` renderiza o documento inicial, após o qual o Inertia adota esses elementos e os mantém sincronizados durante visitas padrão, [visitas instantâneas](https://inertiajs.com/docs/v3/the-basics/instant-visits) e navegação para frente e para trás. Os elementos estão presentes na resposta HTML inicial, de modo que crawlers e bots de pré-visualização de links possam lê-los sem executar JavaScript. Nenhum componente `<Head>` do lado do cliente é necessário.

Isso funciona com ou sem [renderização do lado do servidor (SSR)](https://inertiajs.com/docs/v3/advanced/server-side-rendering). Se sua aplicação tiver um ponto de entrada SSR separado, habilite `serverHead` lá também. O Laravel Head remove automaticamente duplicatas de elementos gerenciados pela página entre `@head` e `<x-inertia::head />`, independentemente da sua ordem, enquanto preserva outros elementos de head produzidos pelo SSR de JavaScript.

> **Nota:**
> Ao adicionar o Laravel Head a uma aplicação Inertia existente, remova quaisquer callbacks de título de `resources/js/app.tsx` e `resources/js/ssr.tsx` para que o Laravel Head possa gerenciar o título final do documento, e mova as tags gerenciadas pelo [componente `<Head>`](https://inertiajs.com/docs/v3/the-basics/title-and-meta) do Inertia para o Laravel Head, de modo que os dois nunca definam o mesmo elemento.

A prop `head` é omitida das respostas de recarga parcial, então o Inertia retém o head da última página completa. As visitas instantâneas igualmente retêm o head atual até que a resposta em segundo plano chegue. Se sua aplicação já usa a prop `head`, altere seu nome em um service provider:

```php
use Laravel\Head\Facades\Head;

public function boot(): void
{
    Head::inertia(prop: '_head');
}
```

Em seguida, aponte o Inertia para a mesma prop com `serverHead: '_head'`.

<a id="static-inertia-tags"></a>
#### Tags Estáticas do Inertia

A maioria das tags deve ficar em padrões, metadados de rota ou metadados em tempo de execução para que o Laravel Head possa resolver o valor correto para cada página. Use globais do Inertia apenas para tags de documento renderizadas na primeira resposta HTML e deixadas inalteradas pelo Inertia pelo resto da sessão.

Registre-as em um service provider com `Head::inertiaGlobals()`:

```php
use Laravel\Head\Facades\Head;
use Laravel\Head\HeadBuilder;

Head::inertiaGlobals(function (HeadBuilder $head) {
    $head
        ->viewport('width=device-width, initial-scale=1')
        ->colorScheme('light dark')
        ->icon('/favicon.svg', type: 'image/svg+xml')
        ->appleTouchIcon('/apple-touch-icon.png', sizes: '180x180')
        ->manifest('/site.webmanifest');
});
```

Os globais do Inertia são excluídos da prop `head`, renderizados sem atributos de propriedade `data-inertia` e nunca atualizados após a primeira resposta. Esses globais são adequados para dicas de navegador estáveis, como viewport, esquema de cores, favicons, ícones touch e manifests. Se uma tag for específica da página, relevante para SEO ou puder ser sobrescrita posteriormente, coloque-a em `defaults`, metadados de rota ou metadados em tempo de execução.

Aplicações que precisam dos metadados resolvidos como dados estruturados em vez de tags renderizadas podem chamar `Head::toArray()`. Os dados retornados incluem títulos, valores Open Graph, schemas JSON-LD e outros metadados resolvidos.
