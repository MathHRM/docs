---
title: "Desarrollo asistido por IA"
translationSourceCommit: b1924db03c74b31fad5fc2f0d951406ca224a335
---

- [Introducción](#introduction)
     - [¿Por qué Laravel para el desarrollo con IA?](#why-laravel-for-ai-development)
 - [Laravel Boost](#laravel-boost)
     - [Instalación](#installation)
     - [Herramientas disponibles](#available-tools)
     - [Directrices para IA](#ai-guidelines)
     - [Habilidades para agentes](#agent-skills)
     - [Búsqueda de documentación](#documentation-search)
     - [Integración de agentes](#agents-integration)

<a id="introduction"></a>
## Introducción

Laravel reúne condiciones únicas para ser el mejor framework para el desarrollo asistido por IA y basado en agentes. El auge de agentes de programación con IA como [Claude Code](https://docs.anthropic.com/en/docs/claude-code), [OpenCode](https://opencode.ai), [Cursor](https://cursor.com) y [GitHub Copilot](https://github.com/features/copilot) ha transformado la forma en que los desarrolladores escriben código. Estas herramientas pueden generar funcionalidades completas, depurar problemas complejos y refactorizar código a una velocidad sin precedentes, pero su efectividad depende en gran medida de qué tan bien comprendan tu base de código.

<a id="why-laravel-for-ai-development"></a>
### ¿Por qué Laravel para el desarrollo con IA?

Las convenciones definidas y la estructura bien definida de Laravel lo convierten en un framework ideal para el desarrollo asistido por IA. Cuando le pides a un agente de IA que agregue un controlador, sabe exactamente dónde colocarlo. Cuando necesitas una nueva migración, las convenciones de nomenclatura y las ubicaciones de los archivos son predecibles. Esta coherencia elimina las conjeturas que a menudo hacen tropezar las herramientas de IA en frameworks más flexibles.

Más allá de la organización de archivos, la sintaxis expresiva y la documentación completa de Laravel brindan a los agentes de IA el contexto que necesitan para generar código preciso que sigue las convenciones del framework. Funcionalidades como las relaciones de Eloquent, solicitudes de formularios y middleware siguen patrones que los agentes pueden comprender y replicar de manera confiable. El resultado es un código generado por IA que parece escrito por un desarrollador experimentado de Laravel, en lugar de ensamblado a partir de fragmentos genéricos de PHP.

<a id="laravel-boost"></a>
## Laravel Boost

[Laravel Boost](https://github.com/laravel/boost) cierra la brecha entre los agentes de programación con IA y tu aplicación Laravel. Boost es un servidor MCP (Model Context Protocol) equipado con más de 15 herramientas especializadas que brindan a los agentes de IA una visión profunda de la estructura, la base de datos, las rutas y más de tu aplicación. Cuando instalas Boost, tu agente de IA se transforma de un asistente de código de propósito general a un experto en Laravel que comprende tu aplicación específica.

Boost proporciona tres capacidades principales: un conjunto de herramientas MCP para inspeccionar e interactuar con tu aplicación; directrices para IA combinables, diseñadas específicamente para el ecosistema de Laravel; y una potente API de documentación con más de 17 000 entradas de conocimiento específico de Laravel.

<a id="installation"></a>
### Instalación

Boost se puede instalar en aplicaciones Laravel 10, 11, 12 y 13 que ejecutan PHP 8.1 o superior. Para comenzar, instala Boost como dependencia de desarrollo:

```shell
composer require laravel/boost --dev
```

Una vez instalado, ejecuta el instalador interactivo:

```shell
php artisan boost:install
```

El instalador detectará automáticamente tu IDE y tus agentes de IA, y te permitirá seleccionar las integraciones adecuadas para tu proyecto. Boost generará los archivos de configuración necesarios, como `.mcp.json` para editores compatibles con MCP y archivos de directrices para el contexto de IA.

> **Nota:**
> Los archivos de configuración generados como `.mcp.json`, `CLAUDE.md` y `boost.json` se pueden agregar de forma segura a tu `.gitignore` si prefieres que cada desarrollador configure su propio entorno.

<a id="available-tools"></a>
### Herramientas disponibles

Boost expone un conjunto completo de herramientas a los agentes de IA a través del Model Context Protocol. Estas herramientas permiten a los agentes comprender e interactuar profundamente con tu aplicación Laravel:

<div class="content-list" markdown="1">

- **Introspección de aplicaciones**: consulta tus versiones de PHP y Laravel, enumera los paquetes instalados e inspecciona la configuración y las variables de entorno de tu aplicación.
- **Herramientas de base de datos**: inspecciona el esquema de tu base de datos, ejecuta consultas de solo lectura y comprende la estructura de tus datos sin abandonar la conversación.
- **Inspección de rutas**: enumera todas las rutas registradas con su middleware, controladores y parámetros.
- **Comandos Artisan**: descubre los comandos Artisan disponibles y sus argumentos, lo que permite a los agentes sugerir y ejecutar los comandos correctos para tu tarea.
- **Análisis de registros**: lee y analiza los archivos de registro de tu aplicación para ayudar a depurar problemas.
- **Registros del navegador**: accede a los registros y errores de la consola del navegador al desarrollar con las herramientas de frontend de Laravel.
- **Integración de Tinker**: ejecuta código PHP en el contexto de tu aplicación a través de Laravel Tinker, lo que permite a los agentes probar hipótesis y verificar el comportamiento.
- **Búsqueda de documentación**: busca documentación del ecosistema Laravel con resultados adaptados a las versiones de tus paquetes instalados.

</div>

<a id="ai-guidelines"></a>
### Directrices para IA

Boost incluye un conjunto completo de directrices para IA diseñadas específicamente para el ecosistema de Laravel. Estas directrices enseñan a los agentes de IA a escribir código que siga los patrones de Laravel, respete las convenciones del framework y evite errores comunes. Se pueden combinar y tienen en cuenta las versiones, por lo que los agentes reciben instrucciones adecuadas para las versiones exactas de tus paquetes.

Hay directrices disponibles para Laravel y para más de 16 paquetes en el ecosistema de Laravel, que incluyen:

<div class="content-list" markdown="1">

- Livewire (2.x, 3.x y 4.x)
- Inertia.js (variantes React, Svelte y Vue)
- Tailwind CSS (3.x y 4.x)
- Filament (3.x y 4.x)
- PHPUnit
- Pest PHP
- Laravel Pint
- Y muchos más

</div>

Cuando ejecutas `boost:install`, Boost detecta automáticamente qué paquetes utiliza tu aplicación y reúne las directrices pertinentes en los archivos de contexto de IA de tu proyecto.

<a id="agent-skills"></a>
### Habilidades para agentes

[Agent Skills](https://agentskills.io/home) son módulos de conocimiento livianos y específicos que los agentes pueden activar bajo demanda cuando trabajan en dominios específicos. A diferencia de las directrices, que se cargan por adelantado, las habilidades permiten cargar patrones detallados y mejores prácticas solo cuando sean relevantes, lo que reduce la sobrecarga del contexto y mejora la relevancia del código generado por IA.

Las habilidades están disponibles para paquetes populares de Laravel como Livewire, Inertia, Tailwind CSS, Pest y más. Cuando ejecutas `boost:install` y seleccionas las habilidades como característica, las habilidades se instalan automáticamente en función de los paquetes detectados en tu `composer.json`.

<a id="documentation-search"></a>
### Búsqueda de documentación

Boost incluye una potente API de documentación que brinda a los agentes de IA acceso a más de 17 000 fragmentos de documentación del ecosistema Laravel. A diferencia de las búsquedas web genéricas, esta documentación está indexada, vectorizada y filtrada para que coincida con las versiones exactas de tus paquetes.

Cuando un agente necesita comprender cómo funciona una función, puede buscar en la API de documentación de Boost y recibir información precisa y específica de la versión. Esto elimina el problema común de que los agentes de IA sugieran métodos o sintaxis obsoletos de versiones anteriores del framework.

<a id="agents-integration"></a>
### Integración de agentes

Boost se integra con IDE y herramientas de inteligencia artificial populares que admiten el Model Context Protocol. Para obtener instrucciones de configuración detalladas para Cursor, Claude Code, Codex, Gemini CLI, GitHub Copilot y Junie, consulta la sección [Configura tus agentes](../boost/#set-up-your-agents) de la documentación de Boost.
