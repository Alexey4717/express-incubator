# express-incubator

Express API с модульной архитектурой: **app** / **modules** / **core**.

## Структура проекта

```
src/
├── index.ts                 # Точка входа (запуск сервера)
├── app/                     # Инициализация приложения
│   ├── app.ts               # Express-приложение
│   ├── setup-app.ts         # Middleware, роутеры, Swagger
│   ├── composition-root.ts  # DI-экспорты контроллеров и репозиториев
│   ├── ioc/container.ts     # Inversify-контейнер и bindings
│   ├── swagger.setup.ts     # Настройка Swagger UI
│   ├── swagger.swagger.yml
│   └── settings/
│       ├── index.ts         # MONGO_URI, JWT-секреты и т.д.
│       └── config.ts        # Admin basic auth credentials
├── modules/                 # Бизнес-модули (по одному на домен)
│   ├── auth/
│   ├── blogs/
│   ├── posts/
│   ├── comments/
│   ├── users/
│   ├── videos/
│   ├── security-devices/
│   └── testing/
└── core/                    # Общая переиспользуемая логика
    ├── middlewares/
    ├── types/
    ├── helpers.ts
    ├── adapters/
    ├── application/jwt-service.ts
    ├── managers/
    ├── store/db.ts
    ├── validations/common.ts
    └── models/GetErrorOutputModel.ts
```

### app/

Сборка и запуск приложения: Express, DI-контейнер (Inversify), `composition-root`, Swagger, конфигурация. Не содержит бизнес-логики доменов — только «проводку» приложения.

### modules/{feature}/

Каждый модуль инкапсулирует всё, что относится к одной сущности:

| Папка / файл            | Назначение                       |
| ----------------------- | -------------------------------- |
| `routes/*.router.ts`    | Express-роутер модуля            |
| `controllers/`          | HTTP-контроллеры                 |
| `services/`             | Доменные сервисы                 |
| `repositories/CUD/`     | Операции записи                  |
| `repositories/Queries/` | Операции чтения                  |
| `models/`               | Mongoose-модели и DTO            |
| `constants/*.paths.ts`  | Базовые URL-пути API             |
| `*.swagger.yml`         | OpenAPI-описание эндпоинтов      |
| `validations/`          | express-validator правила модуля |

Модули могут импортировать друг друга (например, `auth` → `users`, `posts` → `comments`), а также `core/`.

### core/

Переиспользуемая инфраструктура: middleware, JWT, email-адаптер, подключение к БД, общие типы и хелперы. Часть классов из `core/` (например, `JwtService`, `EmailManager`) тоже регистрируется в DI-контейнере.

## Dependency Injection (Inversify)

Проект использует [InversifyJS](https://inversify.io/) для **внедрения зависимостей (DI)**. Идея простая: классы не создают свои зависимости сами (`new UsersRepository()`), а получают их через конструктор. Кто и в каком порядке собирает объекты — решает контейнер.

### Зачем DI в этом проекте

- **Слабая связанность** — контроллер знает про `AuthService`, но не знает, как тот устроен внутри.
- **Один экземпляр на приложение** — репозитории и сервисы живут как Singleton, не пересоздаются на каждый запрос.
- **Единая точка сборки** — все связи между классами видны в `container.ts`, а не размазаны по `new` по всему коду.
- **Удобство тестов** — зависимости можно подменить (в e2e-тестах, например, мокается email-адаптер).

### Где что лежит

| Файл                          | Роль                                                                                            |
| ----------------------------- | ----------------------------------------------------------------------------------------------- |
| `src/app/ioc/container.ts`    | Создаёт контейнер Inversify и регистрирует все классы (bindings)                                |
| `src/app/composition-root.ts` | Достаёт готовые экземпляры из контейнера и экспортирует их для роутеров, middleware и валидаций |
| `src/index.ts`                | Первой строкой импортирует `reflect-metadata` — без этого декораторы Inversify не работают      |

Слой **app** отвечает за «проводку» зависимостей. Слой **modules** содержит `@injectable()`-классы. Слой **core** — общие сервисы и middleware, которые тоже участвуют в DI (сервисы — как провайдеры, middleware — как потребители через `composition-root`).

### reflect-metadata и декораторы TypeScript

Inversify опирается на метаданные типов конструктора. Для этого нужны две настройки:

1. **`reflect-metadata`** импортируется до любого кода с DI (в `index.ts`, `container.ts`, `composition-root.ts`).
2. В `tsconfig.json` включены флаги:
   - `experimentalDecorators: true`
   - `emitDecoratorMetadata: true`

Без них Inversify не сможет понять, какие классы передавать в конструктор.

### Регистрация bindings

Контейнер создаётся с областью по умолчанию **Singleton** — один экземпляр каждого класса на всё приложение:

```ts
export const container = new Container({ defaultScope: 'Singleton' });
```

Все классы добавляются в массив `bindings` и регистрируются через `bind().toSelf()` — контейнер сам создаст экземпляр класса и внедрит его зависимости:

```ts
bindings.forEach((binding) => {
  container.bind(binding).toSelf();
});
```

В bindings попадают репозитории, сервисы, контроллеры и инфраструктурные классы (`JwtService`, `EmailManager` и т.д.).

### @injectable() и @inject()

Каждый класс, который создаёт контейнер, помечается декоратором `@injectable()`:

```ts
import { injectable } from 'inversify';

@injectable()
export class AuthService {
  constructor(
    protected usersRepository: UsersRepository,
    protected emailManager: EmailManager,
  ) {}
}
```

Inversify читает типы параметров конструктора (благодаря `emitDecoratorMetadata`) и автоматически подставляет нужные зависимости. В этом проекте **`@inject()` не используется** — достаточно конкретных классов в конструкторе.

`@inject()` понадобится, если вы внедряете **интерфейс** или несколько реализаций одного контракта через Symbol-токен. Сейчас проект использует более простой вариант: `bind(Class).toSelf()`.

### container.get() vs composition-root

| Способ                                       | Где используется               | Когда применять                      |
| -------------------------------------------- | ------------------------------ | ------------------------------------ |
| `container.get(SomeClass)`                   | Только в `composition-root.ts` | Внутренняя сборка графа зависимостей |
| `import { ... } from 'app/composition-root'` | Роутеры, middleware, валидации | Везде, где нужен готовый экземпляр   |

**Правило:** роутеры и middleware **не импортируют** `container` напрямую. Они берут уже собранные синглтоны из `composition-root`:

```ts
// auth.router.ts
import { authControllers } from '../../../app/composition-root';

authRouter.post(AUTH_ROUTES.LOGIN, authControllers.login.bind(authControllers));
```

```ts
// auth-middleware.ts
import { jwtService, usersQueryRepository } from '../../app/composition-root';
```

`composition-root` — это публичный «фасад» DI: одно место, откуда приложение получает зависимости.

### Поток зависимостей: router → controller → service → repository

```
HTTP-запрос
    │
    ▼
routes/*.router.ts          ← импорт контроллера из composition-root
    │
    ▼
controllers/*-controllers   ← @injectable(), зависимости через constructor
    │
    ▼
services/*-service          ← @injectable(), бизнес-логика
    │
    ▼
repositories/CUD|Queries    ← @injectable(), работа с MongoDB
```

Пример для модуля `auth`:

1. `auth.router.ts` вызывает `authControllers.login(...)`.
2. `AuthControllers` получает в конструкторе `AuthService`, `JwtService`, `SecurityDevicesService`.
3. `AuthService` получает `UsersRepository` и `EmailManager`.
4. `UsersRepository` ходит в MongoDB.

Контейнер собирает всю цепочку автоматически — вам не нужно вручную передавать репозиторий из роутера в контроллер.

### Как добавить новый provider в контейнер

Допустим, вы создали `NotificationsService` в новом или существующем модуле.

1. **Пометьте класс** декоратором `@injectable()` и объявите зависимости в `constructor`.
2. **Добавьте класс** в массив `bindings` в `src/app/ioc/container.ts`.
3. **Если экземпляр нужен снаружи** (роутер, middleware, валидация) — экспортируйте его из `src/app/composition-root.ts`:
   ```ts
   export const notificationsService = container.get(NotificationsService);
   ```
4. **Используйте** импорт из `composition-root` в роутере или middleware. Внутри других `@injectable()`-классов достаточно указать тип в конструкторе — контейнер свяжет их сам.

Контроллеры экспортируются из `composition-root` всегда (роутеры работают с ними напрямую). Сервисы и репозитории экспортируются **только если** к ним обращаются middleware, валидации или код вне DI-графа.

### Связь с архитектурой app / modules / core

```
app/          — контейнер, composition-root, запуск Express
  │
  ├── ioc/container.ts       регистрация всех @injectable-классов
  └── composition-root.ts    готовые синглтоны для «краёв» приложения

modules/      — доменная логика (@injectable controllers, services, repositories)

core/         — общие сервисы (JwtService, EmailManager) + middleware-потребители
```

Middleware из `core/` не помечаются `@injectable()` — это обычные функции Express. Они получают зависимости через импорт из `composition-root`, потому что Express ожидает функцию `(req, res, next)`, а не класс.

## Как добавить новый модуль

1. Создайте `src/modules/{name}/` со структурой из таблицы выше.
2. Добавьте `constants/{name}.paths.ts` и `routes/{name}.router.ts`.
3. Зарегистрируйте роутер в `src/app/setup-app.ts`.
4. Пометьте контроллеры, сервисы и репозитории `@injectable()` и зарегистрируйте их в `src/app/ioc/container.ts` (подробнее — в разделе [Dependency Injection](#dependency-injection-inversify)).
5. Экспортируйте контроллер (и при необходимости другие зависимости) из `src/app/composition-root.ts`.
6. Добавьте `{name}.swagger.yml` — он подхватится автоматически (`src/**/*.swagger.yml`).

## Скрипты

- **watch** — компилирует TypeScript из `src` в `dist` в режиме наблюдения (`-w`).
- **dev** — запускает приложение через nodemon, следя за `dist`.
- **jest** — запускает тесты (Jest).
- **lint** — ESLint с автоисправлением.
- **format** — Prettier.
- **build** — однократная компиляция TypeScript в `dist`.
- **start** — запуск скомпилированного приложения (`node dist/index.js`).
