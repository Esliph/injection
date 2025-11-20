# **Injection**

## **Sobre a biblioteca Injection**

Biblioteca leve de Injeção de Dependências em TypeScript — baseada em decorators e um container instanciável.

**Este README descreve a API pública, conceitos e comportamentos observados nos testes**.

- [**Injection**](#injection)
  - [**Sobre a biblioteca Injection**](#sobre-a-biblioteca-injection)
  - [**Conceitos básicos**](#conceitos-básicos)
    - [**Decorator `@Inject(token)`**](#decorator-injecttoken)
    - [**Resolução de classes com `@Inject`**](#resolução-de-classes-com-inject)
    - [**Escopos**](#escopos)
  - [**Validações e Exceções**](#validações-e-exceções)
  - [**Exemplos práticos**](#exemplos-práticos)

## **Conceitos básicos**

- **Token**: identificador usado para mapear dependências. Pode ser uma `string` ou uma `classe`.
- **Formas de criação**: `useValue` (valor), `useFactory` (função que retorna valor) e `useClass` (outra classe a ser instanciada pelo container).
- **Scope**: `Scope.REQUEST` (padrão) cria instância por resolução; `Scope.SINGLETON` cria uma vez e reutiliza.

### **Decorator `@Inject(token)`**

- Use em parâmetros do construtor ou em propriedades para declarar dependências que o container deve fornecer.
- Exemplos:

```ts
class A {}

class B {
  constructor(@Inject('TOKEN') public t: number) {}
}

class C {
  @Inject(A) service!: A
}
```

- A biblioteca também expõe `getInjectTokens(target)` que retorna os tokens registrados para parâmetros do construtor e propriedades:

```ts
const { constructorParams, properties } = getInjectTokens(MyClass)
// constructorParams: array com tokens ou `undefined` para posições não anotadas
// properties: objeto { propName: token }
```

**Tipos principais**

- `DependencyToken` = `string | ClassConstructor`
- `DependencyCreation` = `{ useClass?: ClassConstructor, useValue?: any, useFactory?: () => any }`
- `Dependency` = `DependencyCreation & { token: DependencyToken, scope: Scope }`
- `DependencyRegister` = `DependencyCreation & { token, scope? } | ClassConstructor` (aceita também diretamente uma classe como atalho)

Observações:

- Ao registrar uma `ClassConstructor` direto no array, o container a transforma em `{ token: ClassConstructor, useClass: ClassConstructor, scope: Scope.REQUEST }`.

**`DependencyRepository` (armazenamento)**

- Métodos públicos:
  - `register(dependency: Dependency)` — registra a dependência
  - `get(token: DependencyToken): Dependency | null` — obtém dependência ou `null` quando não registrada
  - `has(token: DependencyToken): boolean` — verifica existência

Use quando precisar de um repositório customizado (o container aceita um repositório via construtor).

**`DependencyContainer` (API principal)**

- `new DependencyContainer(repository?: DependencyRepository)`
- `register(dependencies: DependencyRegister[])` — registra múltiplas dependências
- `resolve<T = any>(token: DependencyToken): T` — resolve e retorna a instância/valor correspondente
- `hasDependency(token: DependencyToken): boolean` — delega para o repositório
- `getDependency(token: DependencyToken): Dependency | null` — delega para o repositório interno

Comportamento importante de `register` e `resolve`:

- `register` transforma cada entrada em um `Dependency` com `scope` default `Scope.REQUEST` quando omitido.
- Valida o token (apenas `string` ou `class` são válidos).
- Verifica se já existe dependência registrada com o mesmo token (lança `TokenAlreadyRegisteredInjectionException`).
- Valida que **exatamente uma** forma de criação foi definida: `useValue` | `useFactory` | `useClass`. Caso contrário, lança exceções específicas.
- `resolve` aceita um `token` string ou uma `class`:
  - Se o token está registrado, resolve pelo tipo registrado (`useValue` | `useFactory` | `useClass`).
  - Se o token não está registrado e for uma `class`, tenta instanciar a classe (resolvendo recursivamente tokens anotados).
  - Se o token não estiver registrado e **não** for uma `class`, lança `ClassConstructorInvalidInjectionException`.

### **Resolução de classes com `@Inject`**

- Para cada posição indexada do construtor, se o token estiver `undefined` (posição sem decorator) o container injeta `null` nessa posição.
- Para parâmetros e propriedades anotadas com token, o container chama `resolveToken(token)` para obter o valor.

Exemplo: posições sem token viram `null`:

```ts
class X {
  constructor(@Inject('A') a: any, b: any, @Inject('C') c: any) {}
}

// constructorParams -> ['A', undefined, 'C']
// Ao instanciar, b será passado como null
```

### **Escopos**

- `Scope.REQUEST` (padrão): cria o valor/instância a cada `resolve`.
- `Scope.SINGLETON`: armazena o resultado da primeira resolução e retorna a mesma instância nas próximas.

## **Validações e Exceções**

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

## **Exemplos práticos**

- Registrar um valor simples:

```ts
container.register([{ token: 'CONFIG_PORT', useValue: 3000 }])

class App {
  constructor(@Inject('CONFIG_PORT') public port: number) {}
}
const app = container.resolve(App)
// app.port === 3000
```

- Registrar com `useFactory`:

```ts
container.register([{ token: 'RAND', useFactory: () => Math.random() }])

class R {
  constructor(@Inject('RAND') public r: number) {}
}
const a = container.resolve(R)
const b = container.resolve(R)
// a.r e b.r serão diferentes (REQUEST scope)
```

- Registrar com `useClass` / alinhamento via classes:

```ts
class ServiceA {}

class ServiceB {
  constructor(@Inject(ServiceA) public a: ServiceA) {}
}

// shorthand: registra ServiceA e ServiceB como useClass dos próprios tokens
container.register([ServiceA, ServiceB])

class App {
  constructor(@Inject(ServiceB) public b: ServiceB) {}
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

| Exceção                                      | Simulação                                                                   |
| -------------------------------------------- | --------------------------------------------------------------------------- |
| `InvalidTokenInjectionException`             | usar `10`, `{}`, `[]`, `() => {}` como token                                |
| `TokenAlreadyRegisteredInjectionException`   | registrar duas vezes com `token: 'X'`                                       |
| `CreationMethodMissingInjectionException`    | registrar `{ token: 'X' }` sem `use*`                                       |
| `CreationMultipleMethodInjectionException`   | registrar `{ token: 'X', useClass: A, useValue: 1 }`                        |
| `CreationMethodUseClassInjectionException`   | `useClass: 10`                                                              |
| `CreationMethodUseFactoryInjectionException` | `useFactory: true`                                                          |
| `TokenNotRegisteredInjectionException`       | classe com `@Inject('MISSING')` quando `'MISSING'` não foi registrado       |
| `ClassConstructorInvalidInjectionException`  | `container.resolve('MISSING')` quando `'MISSING'` não é um token registrado |
