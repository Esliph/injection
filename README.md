# Injection

- [Injection](#injection)
  - [Sobre a biblioteca Injection](#sobre-a-biblioteca-injection)
  - [Quick Start](#quick-start)
  - [Conceitos básicos](#conceitos-básicos)
  - [Container de Injeção de Dependências](#container-de-injeção-de-dependências)
    - [Definição das Dependências](#definição-das-dependências)
    - [Injetando dependências em instâncias](#injetando-dependências-em-instâncias)
  - [Decorators](#decorators)
    - [`@Inject(token)`](#injecttoken)
    - [`@Injectable(token)`](#injectabletoken)
  - [Validações e Exceções](#validações-e-exceções)
  - [Exemplos práticos](#exemplos-práticos)

## Sobre a biblioteca Injection

Biblioteca leve de Injeção de Dependências em TypeScript com suporte à decorators da nova proposta TC39 stage 3.

## Quick Start

Segue um exemplo simples de uso do container de injeção de dependências:

```ts
import { DependencyContainer, Inject } from '@esliph/injection'

const container = new DependencyContainer()

@Inject(0, 'RANDOM_NUMBER')
class Operator {
  constructor(private rand: () => number) {}

  random() {
    return this.rand()
  }
}

container.register([
  {
    token: 'RANDOM_NUMBER',
    useFactory: () => Math.random(),
  },
])

const operator = container.resolve(Operator)

console.log(operator.random())
```

## Conceitos básicos

- **Token**: identificador usado para mapear dependências. Pode ser uma `string`, `symbol` ou uma `classe`.
- **Formas de criação**: `useValue` (valor), `useFactory` (função que retorna valor) e `useClass` (outra classe a ser instanciada pelo container).
- **Scope**: Determina o ciclo de vida da instância criada pelo container:
  - `Scope.REQUEST` (padrão): cria o valor/instância a cada `resolve`.
  - `Scope.SINGLETON`: armazena o resultado da primeira resolução e retorna a mesma instância nas próximas.

## Container de Injeção de Dependências

O container é responsável por armazenas as dependências registradas e resolver as injeções.

### Definição das Dependências

Para definir uma dependência no container usa-se o método `register([token, ...])`. Existe várias formas de registrar uma dependência:

- **Registro por objeto (explícito)**: informe o `token` e uma das opções de criação: `useValue`, `useFactory` ou `useClass`. Você pode também informar o `scope`.

```ts
container.register([
  {
    token: 'TOKEN_WITH_VALUE',
    useValue: 10,
  },
  // ou
  {
    token: 'TOKEN_WITH_FACTORY',
    useFactory: () => 42,
  },
  // ou
  {
    token: 'TOKEN_WITH_CLASS',
    useClass: SomeService,
    scope: Scope.SINGLETON,
  },
])
```

- **Registro por classe (shorthand)**: ao passar uma classe diretamente, o container pega os metadados do decorator `@Injectable` (se existir) ou registra a própria classe como `useClass` com token igual à classe.

```ts
class ServiceA {}

container.register([ServiceA])
// equivale a: { token: ServiceA, useClass: ServiceA }
```

- **Registro usando `@Injectable()`**: decore a classe com `@Injectable()` para definir `token` e/ou `scope` no próprio tipo. Exemplo:

```ts
@Injectable({ token: 'TOKEN', scope: Scope.SINGLETON })
class MyService {}

// registrar apenas a classe aplica o metadata do decorator
container.register([MyService])

// também é possível mapear a classe para outro token e scope explicitamente
container.register([{ token: 'ANOTHER_TOKEN', useClass: MyService, scope: Scope.REQUEST }])
```

### Injetando dependências em instâncias

O método `resolve` instancia classes e injeta dependências registradas no container. Segue os exemplos de uso

- **Resolver uma classe direta**: ao chamar `container.resolve(MyClass)` o container instancia `MyClass` sem necessidade de registro prévio quando o token é a própria classe.

```ts
class Simple {}

const instance = container.resolve(Simple)
// instance instanceof Simple
```

- **Resolver por token (string/symbol/class)**: se você registrar uma dependência por token (ex.: `token: 'TOKEN'`), pode chamar `container.resolve('TOKEN')` para obter o valor/instância registrada.

```ts
container.register([{ token: 'TOKEN', useClass: SomeService }])

const service = container.resolve('TOKEN')
// service instanceof SomeService
```

- **Injeção em construtor (parâmetros)**: use o decorator `@Inject(index, token)` para declarar que o parâmetro de índice `index` do construtor deve ser preenchido pelo token informado. O container resolve cada token e passa como argumento na criação da instância.

```ts
@Inject(0, 'CONFIG_PORT')
class App {
  constructor(public port: number) {}
}

container.register([{ token: 'CONFIG_PORT', useValue: 3000 }])

const app = container.resolve(App)
// app.port === 3000
```

- **Parâmetros não decorados**: quando um parâmetro de construtor não possui `@Inject` e não há argumento fornecido pelo container, o valor recebido será `null`. Isso permite decorar apenas alguns índices do construtor (ex.: decorar índice 1 e deixar índice 0 sem token -> o índice 0 vira `null`).

```ts
@Inject(1, 'SERVICE')
class Example {
  constructor(
    public a: any,
    public service: Service,
  ) {}
}

container.register([{ token: 'SERVICE', useClass: Service }])

const ex = container.resolve(Example)
// ex.a === null
// ex.service instanceof Service
```

- **Injeção em propriedades**: você pode decorar propriedades com `@Inject(token)`; ao resolver a classe o container atribui o valor/instância correspondente à propriedade.

```ts
class Service {
  @Inject('REPO') repo: Repo
}

container.register([{ token: 'REPO', useValue: repoInstance }])

const service = container.resolve(Service)
// service.repo === repoInstance
```

- **Múltiplas injeções (params + props)**: é comum combinar injeções por parâmetro e por propriedade — o container resolve todos os tokens registrados tanto para construtor quanto para propriedades.

- **Alinhamento por classes**: ao resolver uma classe que requer outra classe como dependência, a criação delas é feita de forma recursiva.

```ts
class ServiceA {}

@Inject(0, ServiceA)
class App {
  constructor(public service: ServiceA) {}
}

container.register([ServiceA])

const app = container.resolve(App)
// app.service instanceof ServiceA
```

- **Scope SINGLETON**: ao registrar com `scope: Scope.SINGLETON` o container cria a instância na primeira resolução e reusa nas próximas.

```ts
container.register([{ token: DB, useClass: DB, scope: Scope.SINGLETON }])

container.resolve(DB)
container.resolve(DB)
// construtor de DB executado apenas uma vez
```

- **Erros/validações relevantes durante `resolve`**:
  - `TokenNotRegisteredInjectionException` (`TOKEN_NOT_REGISTERED`): quando algum token usado em `@Inject` não foi registrado no container.
  - `ClassConstructorInvalidInjectionException` (`CLASS_CONSTRUCTOR_INVALID`): quando `resolve` é chamado com um token que não foi registrado e que não é uma classe válida (ex.: uma string não registrada).

## Decorators

### `@Inject(token)`

Serve para mapear dependências que o container deve injetar. Pode-se usa-las em:

- Propriedades:

```ts
class UserService {
  @Inject('USER_REPO')
  private repository: IUserRepository
}
```

- Parâmetros:

```ts
@Inject(0, 'USER_SERVICE') // Para o parâmetro de índice 0 do construtor
class UserController {
  constructor(private service: UserService) {}

  @Inject(0, 'REQUEST')
  getById(req: Request) {
    return this.service.getById(req.query.id)
  }
}
```

A biblioteca também expõe `getInjectTokensParams(target, methodName)` e `getInjectTokensProperties(target)` que retorna os tokens registrados nos parâmetros e propriedades:

```ts
const constructorParams = getInjectTokensParams(MyClass) // [Token, ....]
const methodParams = getInjectTokensParams(MyClass, 'methodName') // [Token, ....]
const properties = getInjectTokensProperties(MyClass) // { propName: [Token, ...], ... }
```

### `@Injectable(token)`

O decorator `@Injectable()` marca uma classe com metadados que o container usa ao registrar a classe diretamente (shorthand). Ele aceita um objeto com as opções:

- **Sem argumentos**: `@Injectable()` sem parâmetros faz com que o metadata tenha `token` igual à própria classe e `useClass` apontando para ela; `scope` permanece indefinido (REQUEST por padrão quando registrado).

```ts
@Injectable()
class SimpleTestInjectable {}

container.register([SimpleTestInjectable])
// equivalente à { token: SimpleTestInjectable, useClass: SimpleTestInjectable }
```

- **Definindo `scope`**: passe `{ scope: Scope.SINGLETON }` para indicar o ciclo de vida da instância; o metadata reflete essa opção.

```ts
@Injectable({ scope: Scope.SINGLETON })
class TestWithScope {}

container.register([TestWithScope])
// equivalente à { token: TestWithScope, useClass: TestWithScope, scope: Scope.SINGLETON }
```

- **Definindo um token customizado**: ao informar `token` no decorator, o container passará a registrar a dependência usando esse token em vez da própria classe quando você usar o shorthand `container.register([MyClass])`.

```ts
@Injectable({ token: 'TOKEN' })
class TestWithStringToken {}

container.register([TestWithStringToken])
// equivalente à { token: 'TOKEN', useClass: TestWithStringToken }
```

- **Combinação (token + scope)**: é possível fornecer ambos `token` e `scope` no decorator.

```ts
@Injectable({ token: 'TOKEN', scope: Scope.SINGLETON })
class CompleteTestWithStringTokenAndScope {}

container.register([CompleteTestWithStringTokenAndScope])
// equivalente à { token: 'TOKEN', useClass: CompleteTestWithStringTokenAndScope, scope: Scope.SINGLETON }
```

**Como o container usa isso**: ao chamar `container.register([MyDecoratedClass])`, o container chama busca os metadados registrados pelo `@Injectable` e registra o retorno (token/useClass/scope). Se preferir, você também pode registrar explicitamente com outro token apontando para a mesma classe conforme já mostrado anteriormente:

```ts
@Injectable({ token: 'TOKEN', scope: Scope.SINGLETON })
class MyService {}

container.register([{ token: 'ANOTHER_TOKEN', useClass: MyService, scope: Scope.REQUEST }])
```

## Validações e Exceções

Todas as exceções estendem `InjectionException` e têm o campo `code` com um valor de `InjectionErrorCode`.

Principais exceções e quando são lançadas:

| Exceção                                      | Código                                | Causa                                                                            |
| -------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------- |
| `InvalidTokenInjectionException`             | `TOKEN_INVALID`                       | quando se tenta usar como token algo que não é `string` nem `class`              |
| `TokenAlreadyRegisteredInjectionException`   | `TOKEN_ALREADY_REGISTERED`            | ao registrar um token já existente                                               |
| `CreationMethodMissingInjectionException`    | `CREATION_METHOD_MISSING`             | ao registrar sem `useClass`, `useFactory` ou `useValue`                          |
| `CreationMultipleMethodInjectionException`   | `CREATION_MULTIPLE_METHOD`            | ao informar mais de um método de criação simultaneamente                         |
| `CreationMethodUseClassInjectionException`   | `CREATION_METHOD_USE_CLASS_INVALID`   | `useClass` não é uma classe válida                                               |
| `CreationMethodUseFactoryInjectionException` | `CREATION_METHOD_USE_FACTORY_INVALID` | `useFactory` não é função                                                        |
| `TokenNotRegisteredInjectionException`       | `TOKEN_NOT_REGISTERED`                | ao tentar resolver um token que não foi registrado                               |
| `ClassConstructorInvalidInjectionException`  | `CLASS_CONSTRUCTOR_INVALID`           | ao chamar `resolve` passando algo que não é uma classe e que não está registrado |

Os códigos enumerados estão em `InjectionErrorCode` e ajudam a tratar erros sem depender da string da mensagem.

## Exemplos práticos

- Registrar um valor simples:

```ts
container.register([{ token: 'CONFIG_PORT', useValue: 3000 }])

@Inject(0, 'CONFIG_PORT')
class App {
  constructor(public port: number) {}
}

const app = container.resolve(App)
// app.port === 3000
```

- Registrar com `useFactory`:

```ts
container.register([{ token: 'RAND', useFactory: () => Math.random() }])

@Inject(0, 'RAND')
class R {
  constructor(public r: number) {}
}

const a = container.resolve(R)
const b = container.resolve(R)
// a.r e b.r serão diferentes (REQUEST scope)
```

- Registrar com `useClass` / alinhamento via classes:

```ts
class ServiceA {}

@Inject(0, ServiceA)
class ServiceB {
  constructor(public a: ServiceA) {}
}

// shorthand: registra ServiceA e ServiceB como useClass dos próprios tokens
container.register([ServiceA, ServiceB])

@Inject(0, ServiceB)
class App {
  constructor(public b: ServiceB) {}
}

const app = container.resolve(App)
// app.b instanceof ServiceB
// app.b.a instanceof ServiceA
```

- Singleton:

```ts
class DB {
  static created = 0

  constructor() {
    DB.created++
  }
}

container.register([{ token: DB, useClass: DB, scope: Scope.SINGLETON }])

container.resolve(DB)
container.resolve(DB)
// DB.created === 1
```

**Erros comuns e como reproduzi-los (para tratamento)**

| Exceção                                      | Quando                                                                      |
| -------------------------------------------- | --------------------------------------------------------------------------- |
| `InvalidTokenInjectionException`             | usar `10`, `{}`, `[]`, `() => {}` como token                                |
| `TokenAlreadyRegisteredInjectionException`   | registrar duas vezes a dependência com o mesmo token                        |
| `CreationMethodMissingInjectionException`    | registrar `{ token: 'X' }` sem `use*`                                       |
| `CreationMultipleMethodInjectionException`   | registrar `{ token: 'X', useClass: ClassA, useValue: 1 }`                   |
| `CreationMethodUseClassInjectionException`   | informar um valor que não seja uma classe `useClass: 10`                    |
| `CreationMethodUseFactoryInjectionException` | informar um valor que não seja uma função `useFactory: true`                |
| `TokenNotRegisteredInjectionException`       | classe com `@Inject('MISSING')` quando `'MISSING'` não foi registrado       |
| `ClassConstructorInvalidInjectionException`  | `container.resolve('MISSING')` quando `'MISSING'` não é um token registrado |
