import { Scope } from '@enums/scope'
import { InjectionRegisterException } from '@exceptions/register.exception'
import { DependencyRepository } from '@repositories/dependency.repository'
import { DependencyContainer, DependencyRegister } from '@services/dependency.container'
import { beforeEach, describe, expect, test } from 'vitest'

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

    container.register(dependency)

    expect(repository.get(dependency.token)).toEqual(dependency)
  })

  test('Expected to register the dependency with the applied default values', () => {
    const dependency: DependencyRegister = {
      token: 'TOKEN',
      useValue: 10
    }

    container.register(dependency)

    expect(repository.get(dependency.token)?.scope).toEqual(Scope.REQUEST)
  })

  test('It is expected that an exception will be thrown when the Token is not provided', () => {
    const dependency: DependencyRegister = {
      useValue: 10
    } as any

    expect(() => container.register(dependency as any)).toThrowError(InjectionRegisterException)
  })

  test('It is expected that an exception will be thrown when the creation method is not specified', () => {
    const dependency: DependencyRegister = {
      token: 'TOKEN'
    }

    expect(() => container.register(dependency as any)).toThrowError(InjectionRegisterException)
  })

  test('An exception is expected to be thrown if both useClass and useValue are specified simultaneously', () => {
    class TestClass { }

    const dependency: DependencyRegister = {
      token: 'TOKEN',
      useClass: TestClass,
      useValue: 10,
    }

    expect(() => container.register(dependency as any)).toThrowError(InjectionRegisterException)
  })

  test('An exception is expected to be thrown if both useClass and useFactory are specified simultaneously', () => {
    class TestClass { }

    const dependency: DependencyRegister = {
      token: 'TOKEN',
      useClass: TestClass,
      useFactory: () => { },
    }

    expect(() => container.register(dependency as any)).toThrowError(InjectionRegisterException)
  })

  test('An exception is expected to be thrown if both useClass and useFactory are specified simultaneously', () => {
    const dependency: DependencyRegister = {
      token: 'TOKEN',
      useFactory: () => { },
      useValue: 10,
    }

    expect(() => container.register(dependency as any)).toThrowError(InjectionRegisterException)
  })

  test('An exception is expected to be thrown when useClass does not receive a class', () => {
    const dependency: DependencyRegister = {
      token: 'TOKEN',
      useClass: 10 as any,
    }

    expect(() => container.register(dependency as any)).toThrowError(InjectionRegisterException)
  })
})
