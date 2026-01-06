import { beforeEach, describe, expect, test } from 'vitest'

import { Inject } from '@decorators/inject.decorator'
import { Injectable } from '@decorators/injectable.decorator'
import { Scope } from '@enums/scope'
import { ClassConstructorInvalidInjectionException } from '@exceptions/class-constructor-invalid.exception'
import { InjectionErrorCode } from '@exceptions/code-errors'
import { TokenNotRegisteredInjectionException } from '@exceptions/token-not-registered'
import { DependencyContainer } from '@services/dependency.container'

describe('Resolve dependency', () => {
  let container: DependencyContainer

  beforeEach(() => {
    container = new DependencyContainer()
  })

  test('It is expected that a token-free instance will be created from the class', () => {
    class TestWithoutToken { }

    const instance = container.resolve(TestWithoutToken)

    expect(instance).toBeInstanceOf(TestWithoutToken)
  })

  test('An instance is expected to be created from a String Token', () => {
    class TestWithoutToken { }

    container.register([
      {
        token: 'TOKEN',
        useClass: TestWithoutToken
      }
    ])

    const instance = container.resolve('TOKEN')

    expect(instance).toBeInstanceOf(TestWithoutToken)
  })

  test('An instance is expected to be created by injecting a dependency via a constructor parameter using a value and a non-token pattern', () => {
    class Service { }

    @Inject(1, Service)
    class TestUseFactoryWithStringTokenParam {
      constructor(
        public param: any,
        public service: Service,
      ) { }
    }

    try {
      container.resolve(TestUseFactoryWithStringTokenParam)
    } catch (error: any) {
      expect(error).toBeInstanceOf(TokenNotRegisteredInjectionException)
      expect(error.code).toBe(InjectionErrorCode.TOKEN_NOT_REGISTERED)
    }
  })

  test('An exception is expected to be thrown if the token mapped in the class is not registered in the container', () => {
    @Inject(0, 'TOKEN_NOT_REGISTERED')
    class TestWithoutToken {
      constructor(
        public param: number
      ) { }
    }

    try {
      container.resolve(TestWithoutToken)
    } catch (error: any) {
      expect(error).toBeInstanceOf(TokenNotRegisteredInjectionException)
      expect(error.code).toBe(InjectionErrorCode.TOKEN_NOT_REGISTERED)
    }
  })

  test('An exception is expected to be thrown when attempting to resolve a token that is neither mapped nor a class', () => {
    try {
      container.resolve('TOKEN_NOT_REGISTERED')
    } catch (error: any) {
      expect(error).toBeInstanceOf(ClassConstructorInvalidInjectionException)
      expect(error.code).toBe(InjectionErrorCode.CLASS_CONSTRUCTOR_INVALID)
    }
  })

  describe('Tests to resolve instances with dependency registration using useValue', () => {
    test('An instance is expected to be created by injecting a dependency via a constructor parameter using a value', () => {
      @Inject(0, 'TOKEN_PARAM')
      class TestUseValueWithStringTokenParam {
        constructor(
          public param: number
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
      @Inject(0, 'TOKEN_PARAM_A')
      @Inject(1, 'TOKEN_PARAM_B')
      class TestUseValueWithStringTokenProp {
        @Inject('TOKEN_PROP_A') propA: number
        @Inject('TOKEN_PROP_B') propB: 'string'

        constructor(
          public paramA: number,
          public paramB: string
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
      @Inject(0, 'TOKEN_PARAM')
      class TestUseFactoryWithStringTokenParam {
        constructor(
          public param: number
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
      @Inject(0, 'TOKEN_PARAM_A')
      @Inject(1, 'TOKEN_PARAM_B')
      class TestUseFactoryWithStringTokenProp {
        @Inject('TOKEN_PROP_A') propA: number
        @Inject('TOKEN_PROP_B') propB: 'string'

        constructor(
          public paramA: number,
          public paramB: string
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

      @Inject(0, 'TOKEN_PARAM')
      class TestUseFactoryWithStringTokenParam {
        constructor(
          public param: Service
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

      @Inject(1, 'TOKEN_PARAM')
      class TestUseFactoryWithStringTokenParam {
        constructor(
          public param: any,
          public service: Service,
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

      @Inject(0, 'TOKEN_PARAM_A')
      @Inject(1, 'TOKEN_PARAM_B')
      class TestUseFactoryWithStringTokenProp {
        @Inject('TOKEN_PROP_A') propA: ServiceA
        @Inject('TOKEN_PROP_B') propB: ServiceB

        constructor(
          public paramA: ServiceA,
          public paramB: ServiceB
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

      @Inject(0, ServiceA)
      class ServiceB {
        constructor(
          public serviceA: ServiceA
        ) { }
      }

      @Inject(0, ServiceB)
      class TestUseFactoryWithStringTokenProp {
        constructor(
          public service: ServiceB
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

  describe('Injectable', () => {
    test('The dependency is expected to be resolved by specifying a class decorated with Injectable', () => {
      @Injectable()
      class Test { }

      container.register([Test])

      const instance = container.resolve(Test)

      expect(instance).toBeInstanceOf(Test)
    })

    test('It is expected that a dependency will be resolved by specifying a class decorated with Injectable, specifying the SINGLETON scope', () => {
      @Injectable({ scope: Scope.SINGLETON })
      class Test { }

      container.register([Test])

      const instance = container.resolve(Test)

      expect(instance).toBeInstanceOf(Test)
    })

    test('The dependency is expected to be resolved by specifying a class decorated with Injectable and providing a custom token', () => {
      @Injectable({ token: 'TOKEN' })
      class Test { }

      container.register([Test])

      const instance = container.resolve(Test)

      expect(instance).toBeInstanceOf(Test)
    })

    test('Complete resolution with another token and scope', () => {
      @Injectable({ token: 'TOKEN', scope: Scope.SINGLETON })
      class Test { }

      container.register([Test])

      const instance = container.resolve(Test)

      expect(instance).toBeInstanceOf(Test)
    })

    test('The dependency is expected to be resolved by specifying a class decorated with Injectable, providing a custom Token, and a SINGLETON scope', () => {
      @Injectable({ token: 'TOKEN', scope: Scope.SINGLETON })
      class Test { }

      container.register([{ token: 'ANOTHER_TOKEN', useClass: Test, scope: Scope.REQUEST }])

      const instance = container.resolve(Test)

      expect(instance).toBeInstanceOf(Test)
    })

    test('The dependency is expected to be resolved by specifying a class decorated with Injectable, providing a custom Token, and a SINGLETON scope', () => {
      @Injectable()
      class Service { }

      container.register([Service])

      @Inject(0, Service)
      class ABC {
        @Inject(Service) prop: Service

        constructor(
          public param: Service
        ) { }
      }

      const instance = container.resolve(ABC) as ABC

      expect(instance).toBeInstanceOf(ABC)
      expect(instance.prop).toBeInstanceOf(Service)
      expect(instance.param).toBeInstanceOf(Service)
    })
  })
})
