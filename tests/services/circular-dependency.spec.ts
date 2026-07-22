import { beforeEach, describe, expect, test } from 'vitest'

import { forwardRef, resolveForwardRef } from '@common/forward-ref'
import { Inject } from '@decorators/inject.decorator'
import { Injectable } from '@decorators/injectable.decorator'
import { Scope } from '@enums/scope'
import { CircularDependencyInjectionException } from '@exceptions/circular-dependency.exception'
import { InjectionErrorCode } from '@exceptions/code-errors'
import { injectField, injectParamConstructor } from '@metadata/inject.metadata'
import { DependencyContainer } from '@services/dependency.container'

import { ServiceA } from '../fixtures/circular/a.service'
import { ServiceB } from '../fixtures/circular/b.service'
import { ServiceC } from '../fixtures/circular/c.service'
import { ServiceD } from '../fixtures/circular/d.service'

class InspectableDependencyContainer extends DependencyContainer {
  get stack() {
    return this.resolutionStack
  }

  get pending() {
    return this.pendingInstances
  }
}

describe('Circular dependency', () => {
  let container: InspectableDependencyContainer

  beforeEach(() => {
    container = new InspectableDependencyContainer()
  })

  test('A cycle between two properties is expected to be resolved by exposing the partial instance', () => {
    class CycleB {
      @Inject(forwardRef(() => CycleA)) a: any
    }

    class CycleA {
      @Inject(CycleB) b: CycleB
    }

    container.register([CycleA, CycleB])

    const instance = container.resolve<CycleA>(CycleA)

    expect(instance.b).toBeInstanceOf(CycleB)
    expect(instance.b.a).toBe(instance)
  })

  test('A cycle between a constructor and a property is expected to be resolved starting from the property side', () => {
    class CycleB {
      @Inject(forwardRef(() => CycleA)) a: any
    }

    @Inject(0, CycleB)
    class CycleA {

      constructor(
        public b: CycleB
      ) { }
    }

    container.register([CycleA, CycleB])

    const instance = container.resolve<CycleB>(CycleB)

    expect(instance.a).toBeInstanceOf(CycleA)
    expect(instance.a.b).toBe(instance)
  })

  test('A cycle between a constructor and a property is expected to be rejected starting from the constructor side', () => {
    class CycleB {
      @Inject(forwardRef(() => CycleA)) a: any
    }

    @Inject(0, CycleB)
    class CycleA {

      constructor(
        public b: CycleB
      ) { }
    }

    container.register([CycleA, CycleB])

    try {
      container.resolve(CycleA)

      expect.unreachable()
    } catch (error: any) {
      expect(error).toBeInstanceOf(CircularDependencyInjectionException)
      expect(error.code).toBe(InjectionErrorCode.CIRCULAR_DEPENDENCY)
      expect(error.message).toContain('CycleA -> CycleB -> CycleA')
    }
  })

  test('An exception with the path of the cycle is expected when both sides inject via constructor', () => {
    @Inject(0, forwardRef(() => CycleB))
    class CycleA {

      constructor(
        public b: any
      ) { }
    }

    @Inject(0, CycleA)
    class CycleB {

      constructor(
        public a: CycleA
      ) { }
    }

    container.register([CycleA, CycleB])

    try {
      container.resolve(CycleA)

      expect.unreachable()
    } catch (error: any) {
      expect(error).toBeInstanceOf(CircularDependencyInjectionException)
      expect(error.code).toBe(InjectionErrorCode.CIRCULAR_DEPENDENCY)
      expect(error.message).toContain('CycleA -> CycleB -> CycleA')
    }
  })

  test('A diamond without a cycle is expected to keep creating distinct instances in the REQUEST scope', () => {
    class ServiceShared { }

    @Inject(0, ServiceShared)
    class ServiceLeft {

      constructor(
        public shared: ServiceShared
      ) { }
    }

    @Inject(0, ServiceShared)
    class ServiceRight {

      constructor(
        public shared: ServiceShared
      ) { }
    }

    @Inject(0, ServiceLeft)
    @Inject(1, ServiceRight)
    class ServiceRoot {

      constructor(
        public left: ServiceLeft,
        public right: ServiceRight
      ) { }
    }

    container.register([ServiceShared, ServiceLeft, ServiceRight, ServiceRoot])

    const instance = container.resolve<ServiceRoot>(ServiceRoot)

    expect(instance.left.shared).toBeInstanceOf(ServiceShared)
    expect(instance.right.shared).toBeInstanceOf(ServiceShared)
    expect(instance.left.shared).not.toBe(instance.right.shared)
  })

  test('A cycle in the SINGLETON scope is expected to keep a single instance identity', () => {
    class CycleB {
      @Inject(forwardRef(() => CycleA)) a: any
    }

    class CycleA {
      @Inject(CycleB) b: CycleB
    }

    container.register([
      { token: CycleA, useClass: CycleA, scope: Scope.SINGLETON },
      { token: CycleB, useClass: CycleB, scope: Scope.SINGLETON }
    ])

    const instance = container.resolve<CycleA>(CycleA)

    expect(instance.b.a).toBe(instance)
    expect(container.resolve(CycleA)).toBe(instance)
    expect(container.resolve(CycleB)).toBe(instance.b)
  })

  test('The resolution state is expected to be empty after a cycle exception', () => {
    @Inject(0, forwardRef(() => CycleB))
    class CycleA {

      constructor(
        public b: any
      ) { }
    }

    @Inject(0, CycleA)
    class CycleB {

      constructor(
        public a: CycleA
      ) { }
    }

    container.register([CycleA, CycleB])

    expect(() => container.resolve(CycleA)).toThrow(CircularDependencyInjectionException)

    expect(container.stack).toHaveLength(0)
    expect(container.pending.size).toBe(0)
  })

  test('The container is expected to remain usable after a cycle exception', () => {
    class Service { }

    @Inject(0, forwardRef(() => CycleB))
    class CycleA {

      constructor(
        public b: any
      ) { }
    }

    @Inject(0, CycleA)
    class CycleB {

      constructor(
        public a: CycleA
      ) { }
    }

    container.register([Service, CycleA, CycleB])

    expect(() => container.resolve(CycleA)).toThrow(CircularDependencyInjectionException)

    expect(container.resolve(Service)).toBeInstanceOf(Service)
  })

  test('An exception is expected when the token of a constructor parameter is undefined', () => {
    class TestTokenUndefinedParam {

      constructor(
        public param: any
      ) { }
    }

    injectParamConstructor(0, undefined as any, TestTokenUndefinedParam)

    try {
      container.resolve(TestTokenUndefinedParam)

      expect.unreachable()
    } catch (error: any) {
      expect(error).toBeInstanceOf(CircularDependencyInjectionException)
      expect(error.code).toBe(InjectionErrorCode.CIRCULAR_DEPENDENCY)
      expect(error.message).toContain('parameter 0 of "TestTokenUndefinedParam"')
    }
  })

  test('An exception is expected when the token of a property is undefined', () => {
    class TestTokenUndefinedProp {
      prop: any
    }

    injectField(undefined as any, TestTokenUndefinedProp, 'prop')

    try {
      container.resolve(TestTokenUndefinedProp)

      expect.unreachable()
    } catch (error: any) {
      expect(error).toBeInstanceOf(CircularDependencyInjectionException)
      expect(error.code).toBe(InjectionErrorCode.CIRCULAR_DEPENDENCY)
      expect(error.message).toContain('property "prop" of "TestTokenUndefinedProp"')
    }
  })

  test('A parameter that was never decorated is expected to keep receiving null', () => {
    class Service { }

    @Inject(1, Service)
    class TestParamNotDecorated {

      constructor(
        public param: any,
        public service: Service
      ) { }
    }

    container.register([Service])

    const instance = container.resolve<TestParamNotDecorated>(TestParamNotDecorated)

    expect(instance.param).toBeNull()
    expect(instance.service).toBeInstanceOf(Service)
  })

  test('forwardRef is expected to work in constructor parameters, properties and method parameters', () => {
    @Inject(0, forwardRef(() => Service))
    class TestForwardRef {

      @Inject(forwardRef(() => Service)) prop: any

      constructor(
        public param: any
      ) { }

      @Inject(0, forwardRef(() => Service))
      method(service: any) {
        return service
      }
    }

    class Service { }

    container.register([Service])

    const instance = container.resolve<TestForwardRef>(TestForwardRef)

    expect(instance.param).toBeInstanceOf(Service)
    expect(instance.prop).toBeInstanceOf(Service)
    expect(container.invoke(instance, instance.method)).toBeInstanceOf(Service)
  })

  test('forwardRef is expected to be accepted as token and as useClass in the register', () => {
    class Service { }

    container.register([
      {
        token: forwardRef(() => 'TOKEN'),
        useClass: forwardRef(() => Service)
      }
    ])

    expect(container.hasDependency('TOKEN')).toBe(true)
    expect(container.resolve('TOKEN')).toBeInstanceOf(Service)
  })

  test('The scope of the Injectable is expected to be read even when useClass is wrapped in forwardRef', () => {
    @Injectable({ scope: Scope.SINGLETON })
    class Service { }

    container.register([
      {
        token: 'TOKEN',
        useClass: forwardRef(() => Service)
      }
    ])

    expect(container.getDependency('TOKEN')?.scope).toBe(Scope.SINGLETON)
    expect(container.resolve('TOKEN')).toBe(container.resolve('TOKEN'))
  })

  test('resolveForwardRef is expected to resolve nested references and to keep raw tokens intact', () => {
    class Service { }

    expect(resolveForwardRef(forwardRef(() => forwardRef(() => Service)))).toBe(Service)
    expect(resolveForwardRef(forwardRef(() => 'TOKEN'))).toBe('TOKEN')
    expect(resolveForwardRef(Service)).toBe(Service)
    expect(resolveForwardRef('TOKEN')).toBe('TOKEN')
  })

  describe('Cycles between real modules', () => {
    test('A cycle between modules is expected to be resolved when one of the sides uses forwardRef', () => {
      container.register([ServiceA, ServiceB])

      const instance = container.resolve<ServiceB>(ServiceB)

      expect(instance.a).toBeInstanceOf(ServiceA)
      expect(instance.a.b).toBe(instance)
    })

    test('An exception is expected for a cycle between modules without forwardRef', () => {
      container.register([ServiceC, ServiceD])

      try {
        container.resolve(ServiceC)

        expect.unreachable()
      } catch (error: any) {
        expect(error).toBeInstanceOf(CircularDependencyInjectionException)
        expect(error.code).toBe(InjectionErrorCode.CIRCULAR_DEPENDENCY)
        expect(error.message).toContain('property "c" of "ServiceD"')
      }
    })
  })
})
