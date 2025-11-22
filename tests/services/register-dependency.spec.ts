import { Injectable } from '@decorators/injectable.decorator'
import { Scope } from '@enums/scope'
import { InjectionErrorCode } from '@exceptions/code-errors'
import { CreationMethodMissingInjectionException } from '@exceptions/creation-method-missing.exception'
import { CreationMethodUseClassInjectionException } from '@exceptions/creation-method-use-class-invalid.exception'
import { CreationMethodUseFactoryInjectionException } from '@exceptions/creation-method-use-factory-invalid.exception'
import { CreationMultipleMethodInjectionException } from '@exceptions/creation-multiple-method.exception'
import { InvalidTokenInjectionException } from '@exceptions/invalid-token.exception'
import { TokenAlreadyRegisteredInjectionException } from '@exceptions/token-already-registered'
import { DependencyRepository } from '@repositories/dependency.repository'
import { DependencyContainer, DependencyRegister } from '@services/dependency.container'
import { beforeEach, describe, expect, test, vi } from 'vitest'

describe('Tests for registering Dependency', () => {
  let container: DependencyContainer
  let repository: DependencyRepository

  beforeEach(() => {
    repository = new DependencyRepository()
    container = new DependencyContainer(repository)
  })

  test('Expected to register a simple dependency', () => {
    const dependency: DependencyRegister = {
      token: 'TOKEN',
      scope: Scope.REQUEST,
      useValue: 10
    }

    container.register([dependency])

    expect(container.hasDependency(dependency.token)).toEqual(true)
    expect(container.getDependency(dependency.token)).toEqual(dependency)
  })

  test('Expected to register the dependency with the applied default values', () => {
    const dependency: DependencyRegister = {
      token: 'TOKEN',
      useValue: 10
    }

    container.register([dependency])

    expect(container.getDependency(dependency.token)?.scope).toEqual(Scope.REQUEST)
  })

  test('It is expected that a dependency will be registered simply by specifying the class', () => {
    class Test { }

    container.register([Test])

    expect(container.getDependency(Test)?.scope).toEqual(Scope.REQUEST)
  })

  describe('Token check', () => {
    test('It is expected that an exception will be thrown when the Token is not provided', () => {
      const dependency: DependencyRegister = {
        useValue: 10
      } as any

      try {
        container.register([dependency] as any)
      } catch (error: any) {
        expect(error).toBeInstanceOf(InvalidTokenInjectionException)
        expect(error.code).toBe(InjectionErrorCode.TOKEN_INVALID)
      }
    })

    test('An exception is expected to be thrown if you attempt to register a dependency with a string token that has already been registered', () => {
      vi.spyOn(repository, 'get').mockImplementation(token => {
        return {
          token,
          scope: Scope.REQUEST,
          useValue: 10
        }
      })

      const dependency: DependencyRegister = {
        token: 'TOKEN',
        useValue: 10
      }

      try {
        container.register([dependency] as any)
      } catch (error: any) {
        expect(error).toBeInstanceOf(TokenAlreadyRegisteredInjectionException)
        expect(error.code).toBe(InjectionErrorCode.TOKEN_ALREADY_REGISTERED)
      }
    })

    test('An exception is expected to be thrown if you try to register a dependency with a token in a class that has already been registered', () => {
      class Test { }

      vi.spyOn(repository, 'get').mockImplementation(token => {
        return {
          token,
          scope: Scope.REQUEST,
          useValue: 10
        }
      })

      const dependency: DependencyRegister = {
        token: Test,
        useValue: 10
      }

      try {
        container.register([dependency] as any)
      } catch (error: any) {
        expect(error).toBeInstanceOf(TokenAlreadyRegisteredInjectionException)
        expect(error.code).toBe(InjectionErrorCode.TOKEN_ALREADY_REGISTERED)
      }
    })
  })

  describe('Checking dependency creation properties', () => {
    test('It is expected that an exception will be thrown when the creation method is not specified', () => {
      const dependency: DependencyRegister = {
        token: 'TOKEN'
      }

      try {
        container.register([dependency] as any)
      } catch (error: any) {
        expect(error).toBeInstanceOf(CreationMethodMissingInjectionException)
        expect(error.code).toBe(InjectionErrorCode.CREATION_METHOD_MISSING)
      }
    })

    test('An exception is expected to be thrown if both useClass and useValue are specified simultaneously', () => {
      class TestClass { }

      const dependency: DependencyRegister = {
        token: 'TOKEN',
        useClass: TestClass,
        useValue: 10,
      }

      try {
        container.register([dependency] as any)
      } catch (error: any) {
        expect(error).toBeInstanceOf(CreationMultipleMethodInjectionException)
        expect(error.code).toBe(InjectionErrorCode.CREATION_MULTIPLE_METHOD)
      }
    })

    test('An exception is expected to be thrown if both useClass and useFactory are specified simultaneously', () => {
      class TestClass { }

      const dependency: DependencyRegister = {
        token: 'TOKEN',
        useClass: TestClass,
        useFactory: () => { },
      }

      try {
        container.register([dependency] as any)
      } catch (error: any) {
        expect(error).toBeInstanceOf(CreationMultipleMethodInjectionException)
        expect(error.code).toBe(InjectionErrorCode.CREATION_MULTIPLE_METHOD)
      }
    })

    test('An exception is expected to be thrown if both useClass and useFactory are specified simultaneously', () => {
      const dependency: DependencyRegister = {
        token: 'TOKEN',
        useFactory: () => { },
        useValue: 10,
      }

      try {
        container.register([dependency] as any)
      } catch (error: any) {
        expect(error).toBeInstanceOf(CreationMultipleMethodInjectionException)
        expect(error.code).toBe(InjectionErrorCode.CREATION_MULTIPLE_METHOD)
      }
    })

    test('An exception is expected to be thrown when useClass does not receive a class', () => {
      const dependency: DependencyRegister = {
        token: 'TOKEN',
        useClass: 10 as any,
      }

      try {
        container.register([dependency] as any)
      } catch (error: any) {
        expect(error).toBeInstanceOf(CreationMethodUseClassInjectionException)
        expect(error.code).toBe(InjectionErrorCode.CREATION_METHOD_USE_CLASS_INVALID)
      }
    })

    test('An exception is expected to be thrown when useFactory does not receive a function', () => {
      const dependency: DependencyRegister = {
        token: 'TOKEN',
        useFactory: true as any,
      }

      try {
        container.register([dependency] as any)
      } catch (error: any) {
        expect(error).toBeInstanceOf(CreationMethodUseFactoryInjectionException)
        expect(error.code).toBe(InjectionErrorCode.CREATION_METHOD_USE_FACTORY_INVALID)
      }
    })
  })

  describe('Injectable Tests', () => {
    test('Expected to register a dependency by specifying a class decorated with Injectable', () => {
      @Injectable()
      class Test { }

      container.register([Test])

      const dependency = container.getDependency(Test)

      expect(dependency).toBeDefined()
      expect(dependency?.token).toBe(Test)
      expect(dependency?.scope).toBe(Scope.REQUEST)
      expect(dependency?.useClass).toBe(Test)
    })

    test('Expected to register a dependency by specifying a class decorated with Injectable, specifying the SINGLETON scope', () => {
      @Injectable({ scope: Scope.SINGLETON })
      class Test { }

      container.register([Test])

      const dependency = container.getDependency(Test)

      expect(dependency).toBeDefined()
      expect(dependency?.token).toBe(Test)
      expect(dependency?.scope).toBe(Scope.SINGLETON)
      expect(dependency?.useClass).toBe(Test)
    })

    test('Expected to register a dependency by specifying a class decorated with Injectable and providing a custom Token', () => {
      @Injectable({ token: 'TOKEN' })
      class Test { }

      container.register([Test])

      expect(container.getDependency(Test)).toBeNull()

      const dependency = container.getDependency('TOKEN')

      expect(dependency).toBeDefined()
      expect(dependency?.token).toBe('TOKEN')
      expect(dependency?.scope).toBe(Scope.REQUEST)
      expect(dependency?.useClass).toBe(Test)
    })

    test('Complete register with another Token and scope', () => {
      @Injectable({ token: 'TOKEN', scope: Scope.SINGLETON })
      class Test { }

      container.register([Test])

      expect(container.getDependency(Test)).toBeNull()

      const dependency = container.getDependency('TOKEN')

      expect(dependency).toBeDefined()
      expect(dependency?.token).toBe('TOKEN')
      expect(dependency?.scope).toBe(Scope.SINGLETON)
      expect(dependency?.useClass).toBe(Test)
    })

    test('Expected to register a dependency by specifying a class decorated with Injectable, providing a custom Token and a SINGLETON Scope', () => {
      @Injectable({ token: 'TOKEN', scope: Scope.SINGLETON })
      class Test { }

      container.register([{ token: 'ANOTHER_TOKEN', useClass: Test, scope: Scope.REQUEST }])

      expect(container.getDependency(Test)).toBeNull()
      expect(container.getDependency('TOKEN')).toBeNull()

      const dependency = container.getDependency('ANOTHER_TOKEN')

      expect(dependency).toBeDefined()
      expect(dependency?.token).toBe('ANOTHER_TOKEN')
      expect(dependency?.scope).toBe(Scope.REQUEST)
      expect(dependency?.useClass).toBe(Test)
    })
  })
})
