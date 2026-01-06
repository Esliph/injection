import { describe, expect, test } from 'vitest'

import { Injectable, getInjectableDependency } from '@decorators/injectable.decorator'
import { Scope } from '@enums/scope'

describe('Decorator Injectable', () => {
  test('It is expected that dependency definitions will be applied using only the class', () => {
    @Injectable()
    class SimpleTestInjectable { }

    const metadata = getInjectableDependency(SimpleTestInjectable)

    expect(metadata.token).toEqual(SimpleTestInjectable)
    expect(metadata.useClass).toEqual(SimpleTestInjectable)
    expect(metadata.scope).toBeUndefined()
  })

  test('Expected to apply the dependency definitions by defining a SINGLETON Scope', () => {
    @Injectable({ scope: Scope.SINGLETON })
    class TestWithScope { }

    const metadata = getInjectableDependency(TestWithScope)

    expect(metadata.token).toEqual(TestWithScope)
    expect(metadata.useClass).toEqual(TestWithScope)
    expect(metadata.scope).toBe(Scope.SINGLETON)
  })

  test('Expected to apply the dependency definitions by defining a custom token', () => {
    @Injectable({ token: 'TOKEN' })
    class TestWithStringToken { }

    const metadata = getInjectableDependency(TestWithStringToken)

    expect(metadata.token).toEqual('TOKEN')
    expect(metadata.useClass).toEqual(TestWithStringToken)
    expect(metadata.scope).toBeUndefined()
  })

  test('The expected outcome is to apply the dependency definitions by defining a custom Token and a SINGLETON Scope', () => {
    @Injectable({ token: 'TOKEN', scope: Scope.SINGLETON })
    class CompleteTestWithStringTokenAndScope { }

    const metadata = getInjectableDependency(CompleteTestWithStringTokenAndScope)

    expect(metadata.token).toEqual('TOKEN')
    expect(metadata.useClass).toEqual(CompleteTestWithStringTokenAndScope)
    expect(metadata.scope).toBe(Scope.SINGLETON)
  })
})
