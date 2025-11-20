import { Inject } from '@decorators/inject.decorator'
import { Scope } from '@enums/scope'
import { InjectionErrorCode } from '@exceptions/code-errors'
import { ResolveException } from '@exceptions/resolve.exception'
import { DependencyContainer } from '@services/dependency.container'
import { beforeEach, describe, expect, test } from 'vitest'

describe('Resolve dependency', () => {
  let container: DependencyContainer

  beforeEach(() => {
    container = new DependencyContainer()
  })

  test('Expected to create an instance that has no tokens', () => {
    class TestWithoutToken { }

    const instance = container.resolve(TestWithoutToken)

    expect(instance).toBeInstanceOf(TestWithoutToken)
  })

  test('An exception is expected to be thrown if the token mapped in the class is not registered in the container', () => {
    class TestWithoutToken {
      constructor(
        @Inject('TOKEN_NOT_REGISTERED') public param: number
      ) { }
    }

    try {
      container.resolve(TestWithoutToken)
    } catch (error: any) {
      expect(error).toBeInstanceOf(ResolveException)
      expect(error.code).toBe(InjectionErrorCode.RESOLVE_NOT_REGISTERED)
    }
  })

  test('An exception is expected to be thrown when attempting to resolve a token that is neither mapped nor a class', () => {
    try {
      container.resolve('TOKEN_NOT_REGISTERED')
    } catch (error: any) {
      expect(error).toBeInstanceOf(ResolveException)
      expect(error.code).toBe(InjectionErrorCode.RESOLVE_EXPECTED_CLASS)
    }
  })

  describe('Tests to resolve instances with dependency registration using useValue', () => {
    test('An instance is expected to be created by injecting a dependency via a constructor parameter using a value', () => {
      class TestUseValueWithStringTokenParam {
        constructor(
          @Inject('TOKEN_PARAM') public param: number
        ) { }
      }

      container.register([
        {
          token: 'TOKEN_PARAM',
          useValue: 10
        }
      ])

      const instance = container.resolve(TestUseValueWithStringTokenParam)

      expect(instance).toBeInstanceOf(TestUseValueWithStringTokenParam)
      expect(instance.param).toBe(10)
    })

    test('An instance is expected to be created by injecting a dependency via a property using a value', () => {
      class TestUseValueWithStringTokenProp {
        @Inject('TOKEN_PROP') prop: number
      }

      container.register([
        {
          token: 'TOKEN_PROP',
          useValue: 10
        }
      ])

      const instance = container.resolve(TestUseValueWithStringTokenProp)

      expect(instance).toBeInstanceOf(TestUseValueWithStringTokenProp)
      expect(instance.prop).toBe(10)
    })

    test('It is expected that an instance will be created by injecting multiple dependencies into parameters and properties', () => {
      class TestUseValueWithStringTokenProp {
        @Inject('TOKEN_PROP_A') propA: number
        @Inject('TOKEN_PROP_B') propB: 'string'

        constructor(
          @Inject('TOKEN_PARAM_A') public paramA: number,
          @Inject('TOKEN_PARAM_B') public paramB: string
        ) { }
      }

      container.register([
        {
          token: 'TOKEN_PROP_A',
          useValue: 10
        },
        {
          token: 'TOKEN_PROP_B',
          useValue: 'value for prop B'
        },
        {
          token: 'TOKEN_PARAM_A',
          useValue: 11
        },
        {
          token: 'TOKEN_PARAM_B',
          useValue: 'value for param B'
        }
      ])

      const instance = container.resolve(TestUseValueWithStringTokenProp)

      expect(instance).toBeInstanceOf(TestUseValueWithStringTokenProp)
      expect(instance.propA).toBe(10)
      expect(instance.propB).toBe('value for prop B')
      expect(instance.paramA).toBe(11)
      expect(instance.paramB).toBe('value for param B')
    })
  })

  describe('Tests to resolve instances with dependency registration using useFactory', () => {
    test('An instance is expected to be created by injecting a dependency via a constructor parameter using a value', () => {
      class TestUseFactoryWithStringTokenParam {
        constructor(
          @Inject('TOKEN_PARAM') public param: number
        ) { }
      }

      container.register([
        {
          token: 'TOKEN_PARAM',
          useFactory: () => 10
        }
      ])

      const instance = container.resolve(TestUseFactoryWithStringTokenParam)

      expect(instance).toBeInstanceOf(TestUseFactoryWithStringTokenParam)
      expect(instance.param).toBe(10)
    })

    test('An instance is expected to be created by injecting a dependency via a property using a value', () => {
      class TestUseFactoryWithStringTokenProp {
        @Inject('TOKEN_PROP') prop: number
      }

      container.register([
        {
          token: 'TOKEN_PROP',
          useFactory: () => 10
        }
      ])

      const instance = container.resolve(TestUseFactoryWithStringTokenProp)

      expect(instance).toBeInstanceOf(TestUseFactoryWithStringTokenProp)
      expect(instance.prop).toBe(10)
    })

    test('It is expected that an instance will be created by injecting multiple dependencies into parameters and properties', () => {
      class TestUseFactoryWithStringTokenProp {
        @Inject('TOKEN_PROP_A') propA: number
        @Inject('TOKEN_PROP_B') propB: 'string'

        constructor(
          @Inject('TOKEN_PARAM_A') public paramA: number,
          @Inject('TOKEN_PARAM_B') public paramB: string
        ) { }
      }

      container.register([
        {
          token: 'TOKEN_PROP_A',
          useFactory: () => 10
        },
        {
          token: 'TOKEN_PROP_B',
          useFactory: () => 'value for prop B'
        },
        {
          token: 'TOKEN_PARAM_A',
          useFactory: () => 11
        },
        {
          token: 'TOKEN_PARAM_B',
          useFactory: () => 'value for param B'
        }
      ])

      const instance = container.resolve(TestUseFactoryWithStringTokenProp)

      expect(instance).toBeInstanceOf(TestUseFactoryWithStringTokenProp)
      expect(instance.propA).toBe(10)
      expect(instance.propB).toBe('value for prop B')
      expect(instance.paramA).toBe(11)
      expect(instance.paramB).toBe('value for param B')
    })
  })

  describe('Tests to resolve instances with dependency registration using useClass', () => {
    test('An instance is expected to be created by injecting a dependency via a constructor parameter using a value', () => {
      class Service { }

      class TestUseFactoryWithStringTokenParam {
        constructor(
          @Inject('TOKEN_PARAM') public param: Service
        ) { }
      }

      container.register([
        {
          token: 'TOKEN_PARAM',
          useClass: Service
        }
      ])

      const instance = container.resolve(TestUseFactoryWithStringTokenParam)

      expect(instance).toBeInstanceOf(TestUseFactoryWithStringTokenParam)
      expect(instance.param).toBeInstanceOf(Service)
    })

    test('An instance is expected to be created by injecting a dependency via a constructor parameter using a value and a non-token pattern', () => {
      class Service { }

      class TestUseFactoryWithStringTokenParam {
        constructor(
          public param: any,
          @Inject('TOKEN_PARAM') public service: Service,
        ) { }
      }

      container.register([
        {
          token: 'TOKEN_PARAM',
          useClass: Service
        }
      ])

      const instance = container.resolve(TestUseFactoryWithStringTokenParam)

      expect(instance).toBeInstanceOf(TestUseFactoryWithStringTokenParam)
      expect(instance.service).toBeInstanceOf(Service)
      expect(instance.param).toBeNull()
    })

    test('An instance is expected to be created by injecting a dependency via a property using a value', () => {
      class Service { }

      class TestUseFactoryWithStringTokenProp {
        @Inject('TOKEN_PROP') prop: Service
      }

      container.register([
        {
          token: 'TOKEN_PROP',
          useClass: Service
        }
      ])

      const instance = container.resolve(TestUseFactoryWithStringTokenProp)

      expect(instance).toBeInstanceOf(TestUseFactoryWithStringTokenProp)
      expect(instance.prop).toBeInstanceOf(Service)
    })

    test('It is expected that an instance will be created by injecting multiple dependencies into parameters and properties', () => {
      class ServiceA { }
      class ServiceB { }

      class TestUseFactoryWithStringTokenProp {
        @Inject('TOKEN_PROP_A') propA: ServiceA
        @Inject('TOKEN_PROP_B') propB: ServiceB

        constructor(
          @Inject('TOKEN_PARAM_A') public paramA: ServiceA,
          @Inject('TOKEN_PARAM_B') public paramB: ServiceB
        ) { }
      }

      container.register([
        {
          token: 'TOKEN_PROP_A',
          useClass: ServiceA
        },
        {
          token: 'TOKEN_PROP_B',
          useClass: ServiceB
        },
        {
          token: 'TOKEN_PARAM_A',
          useClass: ServiceA
        },
        {
          token: 'TOKEN_PARAM_B',
          useClass: ServiceB
        }
      ])

      const instance = container.resolve(TestUseFactoryWithStringTokenProp)

      expect(instance).toBeInstanceOf(TestUseFactoryWithStringTokenProp)
      expect(instance.propA).toBeInstanceOf(ServiceA)
      expect(instance.propB).toBeInstanceOf(ServiceB)
      expect(instance.paramA).toBeInstanceOf(ServiceA)
      expect(instance.paramB).toBeInstanceOf(ServiceB)
    })

    test('Expect to create an instance using dependency alignment', () => {
      class ServiceA { }

      class ServiceB {
        constructor(@Inject(ServiceA) public serviceA: ServiceA) { }
      }

      class TestUseFactoryWithStringTokenProp {
        constructor(
          @Inject(ServiceB) public service: ServiceB
        ) { }
      }

      container.register([
        ServiceA,
        ServiceB,
      ])

      const instance = container.resolve(TestUseFactoryWithStringTokenProp)

      expect(instance).toBeInstanceOf(TestUseFactoryWithStringTokenProp)
      expect(instance.service).toBeInstanceOf(ServiceB)
      expect(instance.service.serviceA).toBeInstanceOf(ServiceA)
    })
  })

  describe('Tests to resolve global scope dependencies', () => {
    test('An exception is expected to be thrown if the token mapped in the class is not registered in the container', () => {
      class Service {
        static countInstance = 0

        constructor() {
          Service.countInstance++
        }
      }

      container.register([
        {
          token: Service,
          useClass: Service,
          scope: Scope.SINGLETON
        }
      ])

      container.resolve(Service)
      container.resolve(Service)

      expect(Service.countInstance).toBe(1)
    })
  })
})
