# express-incubator

Express API с модульной архитектурой: **app** / **modules** / **core**.

## Структура проекта

```
src/
├── index.ts                 # Точка входа (запуск сервера)
├── app/                     # Инициализация приложения
│   ├── app.ts               # Express-приложение
│   ├── setup-app.ts         # Middleware, роутеры, Swagger
│   ├── composition-root.ts  # DI-экспорты из контейнера (только для app)
│   ├── ioc/
│   │   ├── container.ts     # Создание Inversify-контейнера
│   │   └── register-modules.ts  # Оркестрация bindXModule()
│   ├── swagger.setup.ts     # Настройка Swagger UI
│   ├── swagger.swagger.yml
│   └── settings/
│       └── env.ts           # isProduction() для условной регистрации testing
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
    ├── settings/            # MONGO_URI, JWT-секреты, admin credentials
    ├── store/db.ts
    ├── validations/common.ts
    └── models/GetErrorOutputModel.ts
```

### app/

Сборка и запуск приложения: Express, DI-контейнер (Inversify), `composition-root`, Swagger, конфигурация. Не содержит бизнес-логики доменов — только «проводку» приложения.

### modules/{feature}/

Каждый модуль инкапсулирует всё, что относится к одной сущности:

| Папка / файл            | Назначение                                                    |
| ----------------------- | ------------------------------------------------------------- |
| `routes/*.router.ts`    | `createXRouter(deps)` — factory, без импорта composition-root |
| `controllers/`          | HTTP-контроллеры                                              |
| `services/`             | Application orchestrators (координация domain + repos)        |
| `domain/`               | Domain entities, mappers, бизнес-правила (без Mongoose)       |
| `repositories/CUD/`     | Операции записи                                               |
| `repositories/Queries/` | Операции чтения                                               |
| `models/`               | Mongoose-модели и DTO                                         |
| `constants/*.paths.ts`  | Базовые URL-пути API                                          |
| `*.swagger.yml`         | OpenAPI-описание эндпоинтов                                   |
| `validations/`          | express-validator правила модуля                              |

Модули могут импортировать друг друга (например, `auth` → `users`, `posts` → `comments`), а также `core/`.

### core/

Переиспользуемая инфраструктура: middleware, JWT, email-адаптер, подключение к БД, общие типы и хелперы. `JwtService` регистрируется в `core.module.ts`. Middleware — factory-функции `createXMiddleware(deps)` без импорта `app/`.

### Импорты и алиас `@/`

- Cross-layer импорты между `modules` и `app`, а также из `app`/`modules` в `core` — через алиас `@/` (настроен в `tsconfig.json` и `jest.config.js`).
- **`core` не импортирует `modules`** — общая логика не должна зависеть от доменных модулей; при необходимости переносите код в модуль или `app`.
- Внутри одного модуля — relative (`../services/`, `./types`).
- ESLint (`eslint-plugin-boundaries` и правило `import-conventions`) контролирует границы слоёв (см. `eslint.config.mjs`).

## Dependency Injection (Inversify)

Проект использует [InversifyJS](https://inversify.io/) для **внедрения зависимостей (DI)**. Идея простая: классы не создают свои зависимости сами (`new UsersRepository()`), а получают их через конструктор. Кто и в каком порядке собирает объекты — решает контейнер.

### Зачем DI в этом проекте

- **Слабая связанность** — контроллер знает про `AuthService`, но не знает, как тот устроен внутри.
- **Один экземпляр на приложение** — репозитории и сервисы живут как Singleton, не пересоздаются на каждый запрос.
- **Единая точка сборки** — bindings распределены по `*.module.ts`, оркестратор `register-modules.ts`.
- **Удобство тестов** — зависимости можно подменить (в e2e-тестах, например, мокается email-адаптер).

### Где что лежит

| Файл                              | Роль                                                                   |
| --------------------------------- | ---------------------------------------------------------------------- |
| `src/app/ioc/container.ts`        | Создаёт контейнер и вызывает `registerModules()`                       |
| `src/app/ioc/register-modules.ts` | Вызывает `bindXModule()` для core и каждого домена                     |
| `src/modules/*/*.module.ts`       | Bindings конкретного модуля (`bind().toSelf()`)                        |
| `src/app/composition-root.ts`     | `container.get()` — только для wiring в `setup-app.ts`                 |
| `src/app/setup-app.ts`            | Единственное место сборки HTTP-слоя (middleware, validations, routers) |

Слой **app** отвечает за «проводку». Слой **modules** — `@injectable()`-классы. Слой **core** — инфраструктура и factory-middleware.

### Модульные bind-функции

Каждый домен регистрирует свои классы через `bindXModule(container)`:

| Файл                                    | Bindings                                                        |
| --------------------------------------- | --------------------------------------------------------------- |
| `src/core/core.module.ts`               | `JwtService`, `BcryptService`, `IEmailAdapter` → `EmailAdapter` |
| `src/modules/users/users.module.ts`     | repos via tokens, `UsersService`, `UserControllers`             |
| `src/modules/auth/auth.module.ts`       | services, `EmailManager`, `AuthControllers`                     |
| `src/modules/blogs/blogs.module.ts`     | repos via tokens, service, controller                           |
| …                                       | аналогично для posts, comments, videos, security-devices        |
| `src/modules/testing/testing.module.ts` | `TestingControllers` (только вне production)                    |

```ts
// register-modules.ts
export function registerModules(container: Container): void {
  bindCoreModule(container);
  bindUsersModule(container);
  // ...
  if (!isProduction()) {
    bindTestingModule(container);
  }
}
```

### Условный testing-модуль

`TestingControllers` и роут `/api/testing` доступны только когда `NODE_ENV !== 'production'` (в test/dev). Три точки синхронизации: `register-modules.ts`, `composition-root.ts`, `setup-app.ts`.

### Factory-паттерн для HTTP-слоя

Роутеры, middleware и валидации с DI-зависимостями — factory-функции. Wiring только в `setup-app.ts`:

```ts
const authMiddleware = createAuthMiddleware({
  jwtService,
  usersQueryRepository,
});
const authValidations = createAuthValidations(usersQueryRepository);

app.use(
  AUTH_PATH,
  createAuthRouter({
    authControllers,
    authMiddleware,
    cookieRefreshTokenMiddleware,
    validations: authValidations,
  }),
);
```

**Правило:** `composition-root` импортируется **только** из `app/` (в основном `setup-app.ts`). Роутеры и middleware из `core/`/`modules/` не импортируют `composition-root`.

### reflect-metadata и декораторы TypeScript

Inversify опирается на метаданные типов конструктора. Для этого нужны две настройки:

1. **`reflect-metadata`** импортируется до любого кода с DI (в `index.ts`, `container.ts`, `composition-root.ts`).
2. В `tsconfig.json` включены флаги:
   - `experimentalDecorators: true`
   - `emitDecoratorMetadata: true`

Без них Inversify не сможет понять, какие классы передавать в конструктор.

### Регистрация bindings

```ts
// container.ts
export const container = new Container({ defaultScope: 'Singleton' });
registerModules(container);
```

Каждый `bindXModule` регистрирует сервисы и контроллеры через `container.bind(Class).toSelf()`. Репозитории и адаптеры — через Symbol-токены и интерфейсы:

```ts
// users.module.ts
container.bind(USERS_TYPES.IUsersRepository).to(UsersRepository);
container.bind(USERS_TYPES.IUsersQueryRepository).to(UsersQueryRepository);
container.bind(UsersService).toSelf();

// core.module.ts
container.bind(CORE_TYPES.IEmailAdapter).to(EmailAdapter);
```

Токены объявлены в `{module}.tokens.ts` через `Symbol.for(...)`.

### @injectable() и @inject()

Каждый класс, который создаёт контейнер, помечается декоратором `@injectable()`. Сервисы и контроллеры зависят от **интерфейсов репозиториев**, а не от конкретных классов — для этого используется `@inject(TOKEN)`:

```ts
import { inject, injectable } from 'inversify';

import type { IUsersQueryRepository } from '@/modules/users/repositories/contracts/IUsersQueryRepository';
import type { IUsersRepository } from '@/modules/users/repositories/contracts/IUsersRepository';
import { USERS_TYPES } from '@/modules/users/users.tokens';

@injectable()
export class AuthService {
  constructor(
    @inject(USERS_TYPES.IUsersRepository)
    protected usersRepository: IUsersRepository,
    @inject(USERS_TYPES.IUsersQueryRepository)
    protected usersQueryRepository: IUsersQueryRepository,
    protected emailManager: EmailManager,
  ) {}
}
```

Конкретные классы (`UsersRepository`, `EmailAdapter`) реализуют интерфейсы (`IUsersRepository`, `IEmailAdapter`) и регистрируются в `*.module.ts` через токены. Сервисы и контроллеры остаются на `bind(Class).toSelf()` — Inversify резолвит их зависимости автоматически.

Интерфейсы репозиториев лежат в `repositories/contracts/` и экспортируются из `index.ts` модуля.

### container.get() vs composition-root

| Способ                             | Где используется               | Когда применять                              |
| ---------------------------------- | ------------------------------ | -------------------------------------------- |
| `container.get(SomeClass)`         | Только в `composition-root.ts` | Внутренняя сборка графа зависимостей         |
| Factory + deps из composition-root | Только в `setup-app.ts`        | HTTP-слой (routers, middleware, validations) |

`composition-root` — фасад DI для `setup-app.ts`. Роутеры получают контроллеры через параметры `createXRouter(deps)`, а не через прямой импорт.

### Поток зависимостей: router → controller → service → repository

```
HTTP-запрос
    │
    ▼
routes/*.router.ts          ← createXRouter(deps) — deps из setup-app
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

1. **Пометьте класс** декоратором `@injectable()`.
2. **Добавьте binding** в `{module}.module.ts` соответствующего домена.
3. **Если экземпляр нужен в setup-app** — экспортируйте из `composition-root.ts`.
4. **Передайте в factory** через `setup-app.ts` (роутер, middleware или validation).

### Связь с архитектурой app / modules / core

```
app/          — container, register-modules, composition-root, setup-app
  │
  ├── ioc/container.ts          создание контейнера
  ├── ioc/register-modules.ts   оркестрация bindXModule
  ├── composition-root.ts       container.get() для setup-app
  └── setup-app.ts              wiring HTTP-слоя (единственный потребитель composition-root)

modules/      — *.module.ts, *.tokens.ts, @injectable controllers, services, repositories

core/         — core.module.ts (JwtService, BcryptService, EmailAdapter) + createXMiddleware factories
```

Middleware из `core/` — factory `createXMiddleware(deps)`, собираются в `setup-app.ts`.

## Как добавить новый модуль

1. Создайте `src/modules/{name}/` со структурой из таблицы выше.
2. Добавьте `constants/{name}.paths.ts` и `create{Name}Router(deps)` в `routes/`.
3. Создайте `{name}.module.ts` с bindings и подключите в `register-modules.ts`.
4. Соберите роутер в `src/app/setup-app.ts` (передайте deps из `composition-root` и factories).
5. Экспортируйте нужные экземпляры из `composition-root.ts` (если нужны в setup-app).
6. Добавьте `{name}.swagger.yml` — подхватится автоматически.

## Архитектура слоёв

Для read- и write-операций используется единая цепочка CQRS:

```
HTTP → Controller → CommandBus / QueryBus → UseCase / QueryHandler → Repository (CUD / Queries) → Mongoose → MongoDB
```

- **Controller** — HTTP, валидация через middleware, маппинг в JSON API. Вызывает только `commandBus.execute()` и `queryBus.execute()`.
- **UseCase** — application orchestrator для команд: один публичный метод `execute()`, `@injectable`, возвращает `Result<T>`.
- **QueryHandler** — обработчик read-запроса: один публичный метод `execute()`, делегирует в Query-репозиторий.
- **CommandBus / QueryBus / EventBus** — Express-адаптация CQRS без `@nestjs/cqrs` (`src/core/cqrs/`).
- **Domain entity** — чистая бизнес-логика (`UserEntity.confirmEmail`, `PostEntity.applyLikeCounts` и т.д.); без методов Mongoose.
- **Repository** — persistence: `toDomain`/`toPersistence` через mappers, работа с MongoDB.

### CQRS (Command Query Responsibility Segregation)

| Тип         | Класс                                    | Правило                                                               |
| ----------- | ---------------------------------------- | --------------------------------------------------------------------- |
| **Command** | `CreateUserCommand`, `UpdatePostCommand` | 1 command = 1 UseCase handler                                         |
| **Query**   | `GetUsersQuery`, `GetPostByIdQuery`      | 1 query = 1 QueryHandler                                              |
| **Event**   | `UserRegisteredEvent`                    | 1 event = N event handlers (fire-and-forget через `EventBus.publish`) |

Регистрация handlers — централизованно в `src/app/ioc/register-cqrs-handlers.ts` после binding всех модулей.

Структура application-слоя модуля:

```
modules/users/application/
├── commands/create-user.command.ts
├── queries/get-users.query.ts
├── queries/get-users.query-handler.ts
└── usecases/create-user.usecase.ts
```

### Domain layer (DDD)

Каждый модуль с command-логикой содержит `domain/`:

```
modules/users/domain/
├── entities/user.entity.ts       # UserEntity.create / reconstitute / confirmEmail
└── mappers/user.persistence-mapper.ts  # toDomain / toPersistence
```

Паттерн entity:

```ts
static create(dto): Entity
static reconstitute(raw: TDb): Entity
// методы бросают DomainError

// UseCase = orchestrator
const user = UserEntity.reconstitute(foundUser);
user.confirmEmail(code);
await usersRepository.save(user);
```

`mapDomainError` (`core/domain/map-domain-error.ts`) переводит `DomainError` → `Result` с нужным HTTP-статусом.

Query-репозитории остаются на DTO/ViewModel (CQRS read side без изменений).

### CQS (Command Query Separation)

Проект разделяет операции записи и чтения по слоям репозиториев и типам моделей.

### EntityModel vs ViewModel

| Тип             | Именование              | Где используется                                                   |
| --------------- | ----------------------- | ------------------------------------------------------------------ |
| **EntityModel** | `T*Db`                  | CUD-репозитории, UseCase, проверки существования на стороне команд |
| **ViewModel**   | `GetMapped*OutputModel` | Query-репозитории, ответы GET-запросов                             |

Маппинг:

- `getMapped*ViewModel(entity)` — EntityModel → ViewModel (в query-репозиториях или хелперах).
- `mapTo*Output(viewModel)` — ViewModel → JSON:API (в контроллерах).

### Commands (запись)

- CUD-репозитории: `create` возвращает `ObjectId | null`, `update`/`delete` — `boolean`.
- CUD-репозитории содержат `getById` для проверки существования; **не зависят** от Query-репозиториев.
- UseCase (`create`/`update`/`delete`) возвращает `Result<string>` (id), `Result<null>` или специальный тип — **не полные сущности**.
- После `create` контроллер: `commandBus.execute(CreateCommand)` → `queryBus.execute(GetByIdQuery)` → `mapTo*Output(viewModel)`.
- `RegisterUserUseCase` вызывает `CreateUserUseCase` через `commandBus` (без дублирования логики).

### Queries (чтение)

- Query-репозитории возвращают ViewModel (или `{ items, totalCount }` с ViewModel).
- QueryHandler делегирует в Query-репозиторий; контроллер **не инжектит** query repo напрямую.
- Для лайков posts/comments query-методы принимают `currentUserId?`; `likesCount`/`dislikesCount` берутся из denormalized полей документа, `myStatus` и `newestLikes` — из `ILikeStatusRepository`.

### Лайки

- Отдельная коллекция `LikeStatus` (`parentId`, `parentType`, `userId`, `likeStatus`, `createdAt`).
- В `Comment`/`Post` хранятся denormalized `likesCount`/`dislikesCount`.
- **PUT like-status**: UseCase → `likeRepo.upsertLike` → `likeRepo.countByParent` → `comments/postsRepo.updateLikeCounts`.
- **GET**: counts из документа, `myStatus`/`newestLikes` из like repo на query-слое.

### Исключения

- **security-devices**: `CreateSecurityDeviceUseCase` по-прежнему возвращает JWT refresh token (не id).
- **auth**: `CheckCredentialsUseCase` возвращает EntityModel (нужен для JWT и cookie-flow).
- **bcrypt / jwt**: `BcryptService` и `JwtService` остаются infra-хелперами в `core/application/`.
- **email**: `EmailNotificationService` отправляет письма без persistence; сохранение — в UseCase.

### Аутентификация и refresh token

- **Login** (`POST /api/auth/login`): при успешной проверке credentials создаётся security-device (сессия устройства), выдаётся **access token** в теле ответа и **refresh token** в httpOnly cookie `refreshToken`.
- **Refresh** (`POST /api/auth/refresh-token`): middleware читает cookie, декодирует refresh JWT (`userId`, `deviceId`, `jti`), загружает пользователя и security-device, проверяет что пользователь существует, `device.userId` совпадает с `userId` из токена, и `jti` совпадает с `currentRefreshTokenJti`. При успехе выдаётся новый access token и новый refresh token (rotation); обновление `currentRefreshTokenJti` выполняется **атомарно** (`updateOne` с фильтром по `_id`, `userId` и старому `currentRefreshTokenJti`) — при гонке или повторном использовании ротированного токена `matchedCount !== 1` → `401`.
- **Per-device sessions**: каждый login создаёт запись в коллекции `security-devices` с `deviceId`, IP, title, `lastActiveDate`, `expiredAt` и `currentRefreshTokenJti`.
- **Invalidation**: повторное использование уже ротированного refresh token → `401`. Удаление устройства (`DELETE /api/security/devices/:id`) или logout (`POST /api/auth/logout`) завершает сессию.
- **Cookie refresh middleware** используется на: `POST /api/auth/refresh-token`, `POST /api/auth/logout`, `GET /api/security/devices`, `DELETE /api/security/devices`, `DELETE /api/security/devices/:id`.
- **jti vs iat**: `lastActiveDate` устройства обновляется по `iat` нового refresh token; для инвалидации сессии используется только `jti` (`currentRefreshTokenJti`), а не `iat`.
- **Access token**: не привязан к security-device; отзыв сессии через logout/удаление устройства не инвалидирует уже выданный access token до истечения срока его действия.

### Пример (blogs)

```
POST /api/blogs
  BlogControllers.createBlog
    → commandBus.execute(CreateBlogCommand)
    → queryBus.execute(GetBlogByIdQuery)
    → mapToBlogOutput(viewModel)        // JSON:API 201
```

## JSON API контракт

| Сценарий                     | Формат ответа                                                           |
| ---------------------------- | ----------------------------------------------------------------------- |
| GET список (paginated)       | `{ meta: { page, pageSize, pageCount, totalCount }, data: Resource[] }` |
| GET один / POST create (201) | `{ data: Resource }`                                                    |
| PUT/PATCH/DELETE успех       | `204 No Content`                                                        |
| Ошибки валидации             | `{ errorsMessages: [...] }`                                             |

Структура ресурса:

```json
{
  "type": "posts",
  "id": "507f1f77bcf86cd799439011",
  "attributes": { "title": "...", "createdAt": "..." }
}
```

`type` задаётся enum `ResourceType` (`posts`, `blogs`, `users`, `comments`). Поле `id` — MongoDB ObjectId строкой; бизнес-поля — в `attributes` без top-level `id`.

### Примеры

**GET /api/posts?pageNumber=1&pageSize=10**

```json
{
  "meta": { "page": 1, "pageSize": 10, "pageCount": 1, "totalCount": 2 },
  "data": [
    {
      "type": "posts",
      "id": "...",
      "attributes": { "title": "...", "blogId": "..." }
    }
  ]
}
```

**GET /api/posts/:id** и **POST /api/posts**

```json
{
  "data": {
    "type": "posts",
    "id": "...",
    "attributes": { "title": "...", "content": "..." }
  }
}
```

## Валидация query и path-параметров

- **ObjectId в path** — `mongoIdParamValidation('id')` + `inputValidationsMiddleware` (express-validator `isMongoId()`).
- **Пагинация и сортировка** — `paginationAndSortingValidation(sortFieldsEnum)` для `pageNumber`, `pageSize`, `sortBy`, `sortDirection`.
- **Поиск** — `blogsSearchValidation()` (`searchNameTerm`), `usersSearchValidation()` (`searchLoginTerm`, `searchEmailTerm`).

Sortable-поля задаются явными enum (не `keyof ViewModel`):

| Модуль   | sortBy                                                |
| -------- | ----------------------------------------------------- |
| posts    | title, shortDescription, content, blogName, createdAt |
| blogs    | name, description, websiteUrl, createdAt              |
| users    | login, email, createdAt                               |
| comments | content, createdAt                                    |

Defaults: `pageNumber=1`, `pageSize=10`, `sortDirection=desc`, первое поле enum — default `sortBy`.

## Скрипты

- **watch** — компилирует TypeScript из `src` в `dist` в режиме наблюдения (`-w`).
- **dev** — запускает приложение через nodemon, следя за `dist`.
- **jest** — запускает тесты (Jest).
- **lint** — ESLint с автоисправлением.
- **format** — Prettier.
- **build** — однократная компиляция TypeScript в `dist`.
- **start** — запуск скомпилированного приложения (`node dist/index.js`).
