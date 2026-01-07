import { beforeEach, describe, expect, test } from 'vitest'

import { Inject } from '@decorators/inject.decorator'
import { InjectionErrorCode } from '@exceptions/code-errors'
import { TokenNotRegisteredInjectionException } from '@exceptions/token-not-registered'
import { DependencyContainer } from '@services/dependency.container'

describe('Invoke dependency', () => {
  let container: DependencyContainer

  beforeEach(() => {
    container = new DependencyContainer()
  })

  test('Injects method parameter using useValue and returns value', () => {
    class Test {

      @Inject(0, 'TOKEN')
      method(param: number) {
        return param
      }
    }

    container.register([
      {
        token: 'TOKEN',
        useValue: 42
      }
    ])

    const instance = new Test()

    const result = container.invoke(instance, instance.method)

    expect(result).toBe(42)
  })

  test('Injects method parameter using useFactory and returns value', () => {
    class Test {

      @Inject(0, 'TOKEN')
      method(param: number) {
        return param
      }
    }

    container.register([
      {
        token: 'TOKEN',
        useFactory: () => 7
      }
    ])

    const instance = new Test()

    const result = container.invoke(instance, instance.method)

    expect(result).toBe(7)
  })

  test('Injects method parameter using useClass and returns instance', () => {
    class Service { }

    class Test {

      @Inject(0, 'TOKEN')
      method(service: Service) {
        return service
      }
    }

    container.register([
      {
        token: 'TOKEN',
        useClass: Service
      }
    ])

    const instance = new Test()

    const result = container.invoke(instance, instance.method)

    expect(result).toBeInstanceOf(Service)
  })

  test('When earlier parameter has no token it becomes null and later decorated param resolved', () => {
    class Test {

      @Inject(1, 'TOKEN')
      method(a: number, b: number) {
        return { a, b }
      }
    }

    container.register([
      {
        token: 'TOKEN',
        useValue: 5
      }
    ])

    const instance = new Test()

    const result = container.invoke(instance, instance.method)

    expect(result.a).toBeNull()
    expect(result.b).toBe(5)
  })

  test('Throws TokenNotRegisteredInjectionException when token is not registered', () => {
    class Test {

      @Inject(0, 'TOKEN_NOT_REGISTERED')
      method(p: number) { }
    }

    const instance = new Test()

    try {
      container.invoke(instance, instance.method)
    } catch (error: any) {
      expect(error).toBeInstanceOf(TokenNotRegisteredInjectionException)
      expect(error.code).toBe(InjectionErrorCode.TOKEN_NOT_REGISTERED)
    }
  })

  test('Preserves provided args for non-decorated params', () => {
    class Test {

      @Inject(1, 'TOKEN')
      method(a: number, b: number) {
        return { a, b }
      }
    }

    container.register([
      {
        token: 'TOKEN',
        useValue: 5
      }
    ])

    const instance = new Test()

    const result = container.invoke(instance, instance.method, [10])

    expect(result.a).toBe(10)
    expect(result.b).toBe(5)
  })

  test('Explicit undefined in args is converted to null for non-decorated params', () => {
    class Test {

      @Inject(1, 'TOKEN')
      method(a: number, b: number) {
        return { a, b }
      }
    }

    container.register([
      {
        token: 'TOKEN',
        useValue: 5
      }
    ])

    const instance = new Test()

    const result = container.invoke(instance, instance.method, [undefined])

    expect(result.a).toBeNull()
    expect(result.b).toBe(5)
  })

  test('Decorated param overrides provided arg', () => {
    class Service { }

    class Test {

      @Inject(0, 'TOKEN')
      method(service: Service) {
        return service
      }
    }

    container.register([
      {
        token: 'TOKEN',
        useClass: Service
      }
    ])

    const instance = new Test()

    const result = container.invoke(instance, instance.method, [null])

    expect(result).toBeInstanceOf(Service)
  })

  test('Method without decorations returns undefined for params when no args passed', () => {
    class Test {
      method(a: number) {
        return a
      }
    }

    const instance = new Test()

    const result = container.invoke(instance, instance.method)

    expect(result).toBeUndefined()
  })
})
