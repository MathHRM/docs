---
title: "Impulso de Laravel"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
- [Instalación](#installation)
    - [Configura tus agentes](#set-up-your-agents)
    - [Manteniendo los recursos de Boost actualizados](#keeping-boost-resources-updated)
- [Servidor MCP](#mcp-server)
    - [Herramientas MCP disponibles](#available-mcp-tools)
    - [Registro manual del servidor MCP](#manually-registering-the-mcp-server)
- [Pautas de IA](#ai-guidelines)
    - [Pautas de IA disponibles](#available-ai-guidelines)
    - [Agregar pautas de IA personalizadas](#adding-custom-ai-guidelines)
    - [Anulación de las pautas de IA de Boost](#overriding-boost-ai-guidelines)
    - [Pautas de IA para paquetes de terceros](#third-party-package-ai-guidelines)
- [Habilidades del agente](#agent-skills)
    - [Habilidades disponibles](#available-skills)
    - [Habilidades personalizadas](#custom-skills)
    - [Habilidades primordiales](#overriding-skills)
    - [Habilidades de paquetes de terceros](#third-party-package-skills)
- [Pautas vs. Habilidades](#guidelines-vs-skills)
- [Reglas del proyecto](#project-rules)
    - [Reglas de grabación](#recording-rules)
    - [Infiriendo las convenciones de su aplicación](#inferring-your-applications-conventions)
    - [Deshabilitar reglas del proyecto](#disabling-project-rules)
- [Documentación API](#documentation-api)
- [Ampliación de Boost](#extending-boost)
    - [Agregar soporte para otros IDE/agentes de IA](#adding-support-for-other-ides-ai-agents)

<a id="introduction"></a>
## Introducción

Laravel Boost acelera el desarrollo asistido por IA al proporcionar las pautas esenciales y las habilidades de los agentes que ayudan a los agentes de IA a escribir aplicaciones Laravel de alta calidad que se adhieran a las mejores prácticas de Laravel.

Boost también proporciona una poderosa API de documentación del ecosistema Laravel que combina una herramienta MCP incorporada con una extensa base de conocimientos que contiene más de 17,000 piezas de información específica de Laravel, todo mejorado con capacidades de búsqueda semántica que utilizan incrustaciones para obtener resultados precisos y contextuales. Boost indica a los agentes de IA como Claude Code y Cursor que utilicen esta API para conocer las últimas funciones y mejores prácticas de Laravel.

<a id="installation"></a>
## Instalación

Laravel Boost se puede instalar a través de Composer:

```shell
composer require laravel/boost --dev
```

A continuación, instale el servidor MCP y las pautas de codificación:

```shell
php artisan boost:install
```

El comando `boost:install` generará las pautas del agente y los archivos de habilidades relevantes para los agentes de codificación que seleccionó durante el proceso de instalación. Si ya existe un archivo de guía como `CLAUDE.md` o `AGENTS.md`, Boost solo reemplaza el contenido dentro de su bloque `<laravel-boost-guidelines>`, por lo que todo lo que haya escrito fuera de ese bloque se conserva.

Una vez que se haya instalado Laravel Boost, estará listo para comenzar a codificar con Cursor, Claude Code o el agente de IA de su elección.

> **Nota:**
> No dude en agregar el archivo de configuración MCP generado (`.mcp.json`), los archivos de guía (`CLAUDE.md`, `AGENTS.md`, `junie/`, etc.) y el archivo de configuración `boost.json` al `.gitignore` de su aplicación, ya que estos archivos se regeneran automáticamente al ejecutar `boost:install` y `boost:update`.

<a id="set-up-your-agents"></a>
### Configure sus agentes

```text tab=Cursor
1. Open the command palette (`Cmd+Shift+P` or `Ctrl+Shift+P`)
2. Press `enter` on "/open MCP Settings"
3. Turn the toggle on for `laravel-boost`
```

```text tab=Claude Code
Claude Code support is typically enabled automatically. If you find it isn't, open a shell in the project's directory and run the following command:

claude mcp add -s local -t stdio laravel-boost php artisan boost:mcp
```

```text tab=Codex
Codex support is typically enabled automatically. If you find it isn't, open a shell in the project's directory and run the following command:

codex mcp add laravel-boost -- php "artisan" "boost:mcp"
```

```text tab=GitHub Copilot (VS Code)
1. Open the command palette (`Cmd+Shift+P` or `Ctrl+Shift+P`)
2. Press `enter` on "MCP: List Servers"
3. Arrow to `laravel-boost` and press `enter`
4. Choose "Start server"
```

```text tab=Junie
1. Press `shift` twice to open the command palette
2. Search "MCP Settings" and press `enter`
3. Check the box next to `laravel-boost`
4. Click "Apply" at the bottom right
```

<a id="keeping-boost-resources-updated"></a>
### Mantener actualizados los recursos de Boost

Es posible que desee actualizar periódicamente sus recursos locales de Boost (directrices y habilidades de IA) para asegurarse de que reflejen las últimas versiones de los paquetes del ecosistema Laravel que ha instalado. Para hacerlo, puede utilizar el comando `boost:update` Artisan.

```shell
php artisan boost:update
```

También puede automatizar este proceso agregándolo a sus scripts "post-update-cmd" de Composer:

```json
{
  "scripts": {
    "post-update-cmd": [
      "@php artisan boost:update --ansi"
    ]
  }
}
```

De forma predeterminada, el comando `boost:update` también escaneará su aplicación en busca de paquetes recién instalados y ofrecerá publicar sus pautas y habilidades correspondientes. Este mensaje se omite cuando el comando se ejecuta de forma no interactiva, como por ejemplo desde un script de Composer. Si desea que Boost actualice solo los recursos de Boost existentes que ya están publicados en su aplicación, puede usar la opción `--no-discover`:

```shell
php artisan boost:update --no-discover
```

<a id="mcp-server"></a>
## Servidor MCP

Laravel Boost proporciona un servidor MCP (Protocolo de contexto modelo) que expone herramientas para que los agentes de IA interactúen con su aplicación Laravel. Estas herramientas brindan a los agentes la capacidad de inspeccionar la estructura de su aplicación, consultar la base de datos, ejecutar código y más.

<a id="available-mcp-tools"></a>
### Herramientas MCP disponibles

<div class="overflow-auto">

| Nombre | Notas |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| Información de la aplicación | Lea versiones de PHP y Laravel, motor de base de datos, lista de paquetes de ecosistemas con versiones y modelos de Eloquent |
| Registros del navegador | Leer registros y errores desde el navegador |
| Conexiones de bases de datos | Inspeccionar las conexiones de bases de datos disponibles, incluida la conexión predeterminada |
| Consulta de base de datos | Ejecutar una consulta contra la base de datos |
| Esquema de base de datos | Leer el esquema de la base de datos |
| Obtener URL absoluta | Convertir URI de ruta relativa a absoluta para que los agentes generen URL válidas |
| Último error | Leer el último error de los archivos de registro de la aplicación |
| Leer entradas de registro | Leer las últimas N entradas del registro |
| Regla de registro | Registre una regla de proyecto duradera [](#project-rules) en `.ai/rules` para que los futuros agentes la hereden |
| Buscar documentos | Consulta el servicio API de documentación alojada en Laravel para recuperar documentación basada en los paquetes instalados |

</div>

<a id="manually-registering-the-mcp-server"></a>
### Registro manual del servidor MCP

A veces es posible que necesites registrar manualmente el servidor Laravel Boost MCP con el editor que elijas. Debe registrar el servidor MCP utilizando los siguientes detalles:

<table>
<tr><td><strong>Comando</strong></td><td><code>php</code></td></tr>
<tr><td><strong>Args</strong></td><td><code>impulso artesanal:mcp</code></td></tr>
</table>

Ejemplo JSON:

```json
{
    "mcpServers": {
        "laravel-boost": {
            "command": "php",
            "args": ["artisan", "boost:mcp"]
        }
    }
}
```

<a id="ai-guidelines"></a>
## Directrices de IA

Las pautas de IA son archivos de instrucciones componibles que se cargan por adelantado para brindar a los agentes de IA un contexto esencial sobre los paquetes del ecosistema Laravel. Estas pautas contienen convenciones básicas, mejores prácticas y patrones específicos del marco que ayudan a los agentes a generar código consistente y de alta calidad.

<a id="available-ai-guidelines"></a>
### Directrices de IA disponibles

Laravel Boost incluye pautas de IA para los siguientes paquetes y marcos. Las pautas `core` brindan consejos genéricos y generalizados a la IA para el paquete determinado que es aplicable en todas las versiones.

<div class="overflow-auto">

| Paquete | Versiones compatibles |
| ----------------- | ---------------------- |
| Núcleo y impulso | núcleo |
| Marco Laravel | núcleo, 10.x, 11.x, 12.x, 13.x |
| Cable vivo | núcleo, 2.x, 3.x, 4.x |
| Interfaz de usuario de flujo | núcleo, gratis, pro |
| Folio | núcleo |
| manada | núcleo |
| Inercia Laravel | núcleo, 1.x, 2.x, 3.x |
| La inercia reacciona | núcleo, 1.x, 2.x, 3.x |
| Vista de inercia | núcleo, 1.x, 2.x, 3.x |
| Inercia Esbelta | núcleo, 1.x, 2.x, 3.x |
| PCM | núcleo |
| Banderín | núcleo |
| Plagas | núcleo, 3.x, 4.x |
| Unidad PHP | núcleo |
| Pinta | núcleo |
| Vela | núcleo |
| CSS de viento de cola | núcleo, 3.x, 4.x |
| Voltio Livewire | núcleo |
| Buscador de caminos | núcleo |
| Hacer cumplir las pruebas | condicional |

</div>

> **Nota:** Para mantener actualizadas sus pautas de IA, consulte la sección [Mantener actualizados los recursos de Boost](#keeping-boost-resources-updated).

<a id="adding-custom-ai-guidelines"></a>
### Agregar pautas de IA personalizadas

Para aumentar Laravel Boost con sus propias pautas de IA personalizadas, agregue archivos `.blade.php` o `.md` al directorio `.ai/guidelines/*` de su aplicación. Estos archivos se incluirán automáticamente en las pautas de Laravel Boost cuando ejecute `boost:install`.

<a id="overriding-boost-ai-guidelines"></a>
### Anulación de las directrices de Boost AI

Puede anular las pautas de IA integradas de Boost creando sus propias pautas personalizadas con rutas de archivos coincidentes. Cuando crea una guía personalizada que coincide con una ruta de guía de Boost existente, Boost utilizará su versión personalizada en lugar de la integrada.

Por ejemplo, para anular las pautas de "Inertia React v2 Form Guidance" de Boost, cree un archivo en `.ai/guidelines/inertia-react/2/forms.blade.php`. Cuando ejecute `boost:install`, Boost incluirá su guía personalizada en lugar de la predeterminada.

<a id="third-party-package-ai-guidelines"></a>
### Directrices de IA para paquetes de terceros

Si mantiene un paquete de terceros y desea que Boost incluya pautas de IA para él, puede hacerlo agregando un archivo `resources/boost/guidelines/core.blade.php` a su paquete. Cuando los usuarios de su paquete ejecuten `php artisan boost:install`, Boost cargará automáticamente sus pautas.

Las pautas de IA deben proporcionar una breve descripción general de lo que hace su paquete, describir cualquier estructura o convención de archivos requerida y explicar cómo crear o usar sus características principales (con comandos de ejemplo o fragmentos de código). Manténgalos concisos, prácticos y centrados en las mejores prácticas para que la IA pueda generar código correcto para sus usuarios. Aquí hay un ejemplo:

```markdown
## Package Name

This package provides [brief description of functionality].

### Features

- Feature 1: [clear & short description].
- Feature 2: [clear & short description]. Example usage:

@verbatim
<code-snippet name="How to use Feature 2" lang="php">
$result = PackageName::featureTwo($param1, $param2);
</code-snippet>
@endverbatim
```

<a id="agent-skills"></a>
## Habilidades del agente

[Agent Skills](https://agentskills.io/home) son módulos de conocimiento livianos y específicos que los agentes pueden activar bajo demanda cuando trabajan en dominios específicos. A diferencia de las pautas, que se cargan por adelantado, las habilidades permiten cargar patrones detallados y mejores prácticas solo cuando sean relevantes, lo que reduce la sobrecarga del contexto y mejora la relevancia del código generado por IA.

Cuando ejecuta `boost:install` y selecciona habilidades como característica, las habilidades se instalan automáticamente en función de los paquetes detectados en su `composer.json`. Por ejemplo, si su proyecto incluye `livewire/livewire`, la habilidad `livewire-development` se instalará automáticamente. Las habilidades incluidas con Boost, como `infer-conventions`, se instalan independientemente de los paquetes que tenga.

<a id="available-skills"></a>
### Habilidades disponibles

<div class="overflow-auto">

| Habilidad | Paquete |
| -------------------------- | -------------- |
| flujo-desarrollo | Interfaz de usuario de flujo |
| enrutamiento de folios | Folio |
| inferir convenciones | Impulso |
| inercia-reaccionar-desarrollo | La inercia reacciona |
| inercia-esbelto-desarrollo | Inercia Esbelta |
| inercia-vue-desarrollo | Vista de inercia |
| desarrollo-livewire | Cable vivo |
| desarrollo-mcp | PCM |
| banderín-desarrollo | Banderín |
| pruebas de plagas | Plagas |
| desarrollo-tailwindcss | CSS de viento de cola |
| desarrollo de voltios | voltio |
| desarrollo-wayfinder | Buscador de caminos |

</div>

> **Nota:** Para mantener sus habilidades actualizadas, consulte la sección [Mantener los recursos de Boost actualizados](#keeping-boost-resources-updated).

<a id="custom-skills"></a>
### Habilidades personalizadas

Para crear sus propias habilidades personalizadas, agregue un archivo `SKILL.md` al directorio `.ai/skills/{skill-name}/` de su aplicación. Cuando ejecute `boost:update`, sus habilidades personalizadas se instalarán junto con las habilidades integradas de Boost.

Por ejemplo, para crear una habilidad personalizada para la lógica de dominio de su aplicación:

```
.ai/skills/creating-invoices/SKILL.md
```

<a id="overriding-skills"></a>
### Habilidades primordiales

Puede anular las habilidades integradas de Boost creando sus propias habilidades personalizadas con nombres coincidentes. Cuando crea una habilidad personalizada que coincide con el nombre de una habilidad de Boost existente, Boost usará su versión personalizada en lugar de la integrada.

Por ejemplo, para anular la habilidad `livewire-development` de Boost, cree un archivo en `.ai/skills/livewire-development/SKILL.md`. Cuando ejecutes `boost:update`, Boost incluirá tu habilidad personalizada en lugar de la predeterminada.

<a id="third-party-package-skills"></a>
### Habilidades de paquetes de terceros

Si mantiene un paquete de terceros y desea que Boost incluya habilidades para él, puede hacerlo agregando un archivo `resources/boost/skills/{skill-name}/SKILL.md` a su paquete. Cuando los usuarios de su paquete ejecuten `php artisan boost:install`, Boost instalará automáticamente sus habilidades según las preferencias del usuario.

Boost Skills admite el [formato de Skills del agente ](https://agentskills.io/what-are-skills) y debe estructurarse como una carpeta que contiene un archivo `SKILL.md` con contenido frontal YAML e instrucciones de Markdown. El archivo `SKILL.md` debe incluir el material preliminar requerido (`name` y `description`) y, opcionalmente, puede incluir guiones, plantillas y materiales de referencia.

Las habilidades deben describir cualquier estructura o convención de archivos requerida y explicar cómo crear o usar sus características principales (con comandos de ejemplo o fragmentos de código). Manténgalos concisos, prácticos y centrados en las mejores prácticas para que la IA pueda generar código correcto para sus usuarios:

```markdown
---
name: package-name-development
description: Build and work with PackageName features, including components and workflows.
---

# Package Name Development

## When to use this skill
Use this skill when working with PackageName features...

## Features

- Feature 1: [clear & short description].
- Feature 2: [clear & short description]. Example usage:

$result = PackageName::featureTwo($param1, $param2);
```

<a id="guidelines-vs-skills"></a>
## Directrices frente a habilidades

Laravel Boost proporciona dos formas distintas de brindar a los agentes de IA contexto sobre su aplicación: **pautas** y **habilidades**.

Las **Pautas** se cargan por adelantado cuando se inicia el agente de IA, lo que proporciona un contexto esencial sobre las convenciones y mejores prácticas de Laravel que se aplican ampliamente en todo su código base.

**Las habilidades** se activan según demanda cuando se trabaja en tareas específicas y contienen patrones detallados para dominios particulares (como componentes Livewire o pruebas de Pest). Cargar habilidades solo cuando sean relevantes reduce la sobrecarga de contexto y mejora la calidad del código.

<div class="overflow-auto">

| Aspecto | Directrices | Habilidades |
| ----------- | --------------------------------- | -------------------------------- |
| **Cargado** | Directo, siempre presente | Bajo demanda, cuando sea pertinente |
| **Alcance** | Amplio, fundamental | Centrado, tarea específica |
| **Propósito** | Convenciones fundamentales y mejores prácticas | Patrones de implementación detallados |

</div>

Tanto las pautas como las habilidades describen el ecosistema de Laravel. Para capturar las convenciones de su propia aplicación, debe usar [reglas del proyecto](#project-rules).

<a id="project-rules"></a>
## Reglas del proyecto

Mientras que las pautas y habilidades enseñan a los agentes cómo escribir Laravel, las reglas del proyecto les enseñan cómo escribir su aplicación. Una regla es cualquier cosa que, de otro modo, tendrías que explicar nuevamente en cada nueva sesión:

<div class="content-list" markdown="1">

- Decisiones tomadas a lo largo del camino por usted, sus agentes o sus compañeros de equipo.
- Pautas de estilo y preferencias que son difíciles de lograr para un agente.
- Trampas y restricciones que no se pueden inferir del código circundante.

</div>

Las reglas se almacenan como archivos Markdown dentro del directorio `.ai/rules` de su aplicación y deben enviarse al control de código fuente. A diferencia de la propia memoria de un agente, que es personal y tiene un alcance de sesión, sus reglas se comparten con su equipo y con cada agente que trabaja en su aplicación.

Cada archivo de reglas declara los archivos globales a los que se aplica dentro de su contenido frontal:

```markdown
---
paths:
  - app/Http/Controllers/**
---

# Http Controllers

## Extend BaseController for tenant scoping

All controllers must extend `App\Http\Controllers\BaseController`, which applies the
current tenant's query scope. Extending Laravel's base controller directly will leak
data across tenants.
```

Además, Boost mantiene un archivo `.ai/rules/index.md` que asigna globos a sus archivos de reglas. Se indica a los agentes que consulten este índice antes de planificar o editar cualquier archivo, por lo que solo se carga una regla cuando es relevante:

```markdown
# Project Rules Index

Before planning or editing, find the row whose globs match the file's path and read that rule file.

| Applies to | Rule file |
| --- | --- |
| app/Http/Controllers/** | .ai/rules/controllers.md |
| app/Models/** | .ai/rules/models.md |
```

> **Nota:**
> A diferencia del `.mcp.json` y los archivos de pautas generados, el directorio `.ai/rules` debe estar comprometido con el control de código fuente para que sus reglas se compartan con su equipo.

<a id="recording-rules"></a>
### Reglas de grabación

Para registrar una regla, simplemente puede pedirle a su agente que la recuerde:

```text
Remember that all money values are stored as integer cents, never as floats.
```

El agente invocará la herramienta MCP `record-rule` de Boost con un `glob`, un `title` corto y un `note`. Luego, Boost archivará la regla en el área coincidente, creará el archivo de regla si es necesario y actualizará el índice.

Siempre debe registrar reglas utilizando la herramienta `record-rule` en lugar de crear archivos de reglas a mano. Boost regenera `.ai/rules/index.md` como parte del registro de una regla y los agentes dependen de ese índice para descubrir qué reglas se aplican al archivo en el que están trabajando. Un archivo de reglas que se agrega manualmente no se descubrirá hasta que se vuelva a generar el índice.

<a id="inferring-your-applications-conventions"></a>
### Inferir las convenciones de su aplicación

Grabar las reglas una a la vez funciona bien en el futuro; sin embargo, una aplicación existente ya contiene años de convenciones. La habilidad `infer-conventions` arrancará tus reglas a partir del código que ya has escrito. Para comenzar, pídale a su agente que use la habilidad:

```text
Use the infer-conventions skill
```

La habilidad recorrerá su aplicación a través de una lista de verificación de dimensiones de la convención de Laravel, que incluyen validación, controladores, autorización, modelos, arquitectura, pruebas, interfaz, base de datos y consola, seguido de un pase abierto para patrones como clases base, rasgos compartidos y diseños de módulos.

La habilidad documenta lo que realmente hace su código en lugar de lo que debería hacer. Registra solo convenciones no predeterminadas y bien respaldadas, omite los valores predeterminados del marco y cualquier cosa que Pint o Rector ya apliquen, e informa patrones genuinamente mixtos en lugar de registrarlos. Antes de escribir cualquier regla, la habilidad presentará cada convención que descubrió, junto con la evidencia que la respalda, para su aprobación. Si desea que la habilidad registre todas las convenciones descubiertas sin confirmación, puede decirle "yolo".

<a id="disabling-project-rules"></a>
### Deshabilitar las reglas del proyecto

Las reglas del proyecto están habilitadas de forma predeterminada. Para deshabilitarlos por completo, defina la siguiente variable de entorno. Esto elimina la herramienta MCP `record-rule` y evita que Boost administre el directorio `.ai/rules`:

```ini
BOOST_RULES_ENABLED=false
```

<a id="documentation-api"></a>
## API de documentación

Laravel Boost incluye una API de documentación que proporciona a los agentes de IA acceso a una extensa base de conocimientos que contiene más de 17.000 piezas de información específica de Laravel. La API utiliza búsqueda semántica con incrustaciones para ofrecer resultados precisos y contextuales.

La herramienta MCP `Search Docs` permite a los agentes consultar el servicio API de documentación alojada en Laravel para recuperar documentación basada en sus paquetes instalados. Las pautas y habilidades de IA de Boost le indicarán automáticamente a su agente de codificación que utilice esta API.

<div class="overflow-auto">

| Paquete | Versiones compatibles |
| ----------------- | ------------------ |
| Marco Laravel | 10.x, 11.x, 12.x, 13.x |
| Filamento | 2.x, 3.x, 4.x, 5.x |
| Interfaz de usuario de flujo | 2.x Gratis, 2.x Pro |
| Inercia | 1.x, 2.x |
| Cable vivo | 1.x, 2.x, 3.x, 4.x |
| nueva | 4.x, 5.x |
| Plagas | 3.x, 4.x |
| CSS de viento de cola | 3.x, 4.x |

</div>

<a id="extending-boost"></a>
## Impulso extendido

Boost funciona con muchos IDE y agentes de IA populares listos para usar. Si su herramienta de codificación aún no es compatible, puede crear su propio agente e integrarlo con Boost.

<a id="adding-support-for-other-ides-ai-agents"></a>
### Agregar soporte para otros IDE/agentes de IA

Para agregar soporte para un nuevo IDE o agente AI, cree una clase que extienda `Laravel\Boost\Install\Agents\Agent` e implemente uno o más de los siguientes contratos según lo que necesite:

- `Laravel\Boost\Contracts\SupportsGuidelines`: agrega soporte para pautas de IA.
- `Laravel\Boost\Contracts\SupportsMcp` - Agrega soporte para MCP.
- `Laravel\Boost\Contracts\SupportsSkills`: agrega compatibilidad con las habilidades del agente.

<a id="writing-the-agent"></a>
#### Escribir al agente

```php
<?php

declare(strict_types=1);

namespace App;

use Laravel\Boost\Contracts\SupportsGuidelines;
use Laravel\Boost\Contracts\SupportsMcp;
use Laravel\Boost\Contracts\SupportsSkills;
use Laravel\Boost\Install\Agents\Agent;

class CustomAgent extends Agent implements SupportsGuidelines, SupportsMcp, SupportsSkills
{
    // Your implementation...
}
```

Para ver un ejemplo de implementación, consulte [ClaudeCode.php](https://github.com/laravel/boost/blob/main/src/Install/Agents/ClaudeCode.php).

<a id="registering-the-agent"></a>
#### Registro del agente

Registre su agente personalizado en el método `boot` del `App\Providers\AppServiceProvider` de su aplicación:

```php
use Laravel\Boost\Boost;

public function boot(): void
{
    Boost::registerAgent('customagent', CustomAgent::class);
}
```

Una vez registrado, su agente estará disponible para su selección cuando ejecute `php artisan boost:install`.
