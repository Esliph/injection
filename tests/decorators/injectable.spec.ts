import { Injectable, getInjectableDependency } from '@decorators/injectable.decorator'
import { describe, expect, test } from 'vitest'
import { Scope } from '@enums/scope'

describe('Decorator Injectable', () => {
  test('Simple test', () => {
    @Injectable()
    class SimpleTestInjectable { }

    const metadata = getInjectableDependency(SimpleTestInjectable)

    expect(metadata.token).toEqual(SimpleTestInjectable)
    expect(metadata.useClass).toEqual(SimpleTestInjectable)
    expect(metadata.scope).toBeUndefined()
  })

  test('Simple test', () => {
    @Injectable({ scope: Scope.SINGLETON })
    class TestWithScope { }

    const metadata = getInjectableDependency(TestWithScope)

    expect(metadata.token).toEqual(TestWithScope)
    expect(metadata.useClass).toEqual(TestWithScope)
    expect(metadata.scope).toBe(Scope.SINGLETON)
  })

  test('Simple test 2', () => {
    @Injectable({ token: 'TOKEN' })
    class TestWithStringToken { }

    const metadata = getInjectableDependency(TestWithStringToken)

    expect(metadata.token).toEqual('TOKEN')
    expect(metadata.useClass).toEqual(TestWithStringToken)
    expect(metadata.scope).toBeUndefined()
  })

  test('Complete test 2', () => {
    @Injectable({ token: 'TOKEN', scope: Scope.SINGLETON })
    class CompleteTestWithStringTokenAndScope { }

    const metadata = getInjectableDependency(CompleteTestWithStringTokenAndScope)

    expect(metadata.token).toEqual('TOKEN')
    expect(metadata.useClass).toEqual(CompleteTestWithStringTokenAndScope)
    expect(metadata.scope).toBe(Scope.SINGLETON)
  })
})
