# design-software-academic-management-mfe (React 18 + TypeScript + Vite)

Micro-frontend **remote** del dominio `academic-management`. Construido con Vite y Module Federation 2.0
(`@module-federation/vite`), conforme a ADR-009. Consume solo SU contrato, se despliega de forma
independiente y es responsive.

## Identidad del remote

| Dato | Valor |
| --- | --- |
| Nombre de federacion | `academicManagementMfe` |
| Modulos expuestos | `./App`, `./FichasPage`, `./ActiveFichasWidget` |
| Entrada federada | `remoteEntry.js` |
| Puerto de desarrollo | `5103` |
| Ruta que monta el shell | `/academic-management/*` |
| Ancla de estilos | `data-mfe="academic-management"` |
| Forma expuesta | `AcademicManagementMfeProps` |

## Contrato OpenAPI que consumira

| Fuente | Ruta |
| --- | --- |
| Contrato canonico | `design-software-shared-contracts/openapi/academic-management.yaml` |
| Copia actual en docs | `design-software-docs/07-api/contracts/openapi/academic-management.yaml` |
| Tipos generados | `src/contracts/generated/academic-management.ts` |

Los tipos se generan con `openapi-typescript` desde el OpenAPI; no se escriben a mano.

## Funcionalidad actual

Incluye la consulta paginada de fichas, filtros operativos, detalle y el widget reutilizable de
fichas activas. La URL base del API se configura con `apiBaseUrl` y usa `/api/v1` por defecto.

## Estructura

```text
src/
  domain/                modelos, value objects y reglas de UI puras (sin React, sin fetch)
  application/           hooks de caso de uso (uno por HU) y puertos de servicios
  adapter/in/pages/      containers; consumen hooks de application/
  adapter/in/components/ componentes presentacionales (reciben props, sin logica de datos)
  adapter/out/           implementaciones de los puertos (HTTP y mapeo DTO<->dominio)
  contracts/             tipos generados desde el OpenAPI + forma expuesta del remote
  App.tsx                remote component expuesto como './App' (sin createRoot)
  App.module.css         estilos aislados con CSS Modules
  main.tsx               bootstrap standalone SOLO para desarrollo local
  vite-env.d.ts          tipos de Vite (imports de CSS Modules)
tests/
  unit/                  tests de dominio y de hooks de application/
  integration/           tests de adapter/in con Testing Library
```

Regla de dependencia (ADR-009 seccion 3): `adapter/in` -> `application` -> `domain`.
`domain` no importa React ni ningun cliente HTTP. La pagina recibe el puerto `FichasApi`; el remote
incluye un adaptador HTTP standalone y el shell puede inyectar una implementacion de su fachada.

## Comandos

| Comando | Que hace |
| --- | --- |
| `npm run dev` | Levanta Vite en el puerto `5103` con federation activa |
| `npm run build` | `tsc --noEmit` y despues build de produccion (emite `remoteEntry.js`) |
| `npm run generate:types` | Regenera tipos desde el contrato hermano `design-software-shared-contracts` |
| `npm run preview` | Sirve el build de produccion |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | `vitest run` (jsdom) |
| `npm run lint` | `eslint .` |

## ADRs aplicables

- **ADR-009** — Framework y estrategia de build de los micro-frontends: React 18 + TypeScript,
  Vite + `@module-federation/vite`, capas internas, CSS Modules, `data-mfe`, tipos desde el
  contrato y gate de compatibilidad host<->remote.
- **ADR-005** — Topologia de microservicios: un remote por dominio, despliegue independiente,
  1:1 con el `<dominio>-service`.
- **ADR-006** — Principio DDD + Hexagonal + TDD + SDD: reglas de dependencia, prohibiciones de
  codigo y convenciones de nombre.

## Notas

- `react`, `react-dom` y `react-router-dom` estan en `shared` como `singleton`: sin esto el shell
  y el remote cargan instancias distintas y falla `useContext`/`useNavigate`.
- `src/main.tsx` es el bootstrap standalone para `npm run dev`. **No** es el entry federado: el
  shell carga `remoteEntry.js` y monta `academicManagementMfe/App`.
- Aislamiento de estilos con CSS Modules; ningun selector global fuera de
  `design-software-design-system`.
- El shell resuelve la URL de `remoteEntry.js` por ambiente (`remotes.<env>.json`), nunca se
  hardcodea en este repo.
- El remote declara sus propias rutas internas bajo `/academic-management` y no crea su propio
  `BrowserRouter`: el historial es unico y lo crea el shell.
