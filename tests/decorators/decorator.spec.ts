import { getInjectTokens, Inject } from '@decorators/inject.decorator'
import { describe, expect, test } from 'vitest'

describe('Decorators Test', () => {
  test('It is expected that tokens will be stored as strings in the parameters and properties', () => {
    class TestStringToken {

      @Inject('TOKEN_A')
      private valueTokenA: any

      constructor(@Inject('TOKEN_B') valueTokenB: any, @Inject('TOKEN_C') valueTokenC: any) { }
    }

    const { properties, constructorParams } = getInjectTokens(TestStringToken)

    expect(properties).toEqual({ valueTokenA: 'TOKEN_A' })
    expect(constructorParams).toEqual(['TOKEN_B', 'TOKEN_C'])
  })

  test('It is expected that tokens will be registered in classes within the parameters and properties', () => {
    class TestServiceA { }
    class TestServiceB { }
    class TestServiceC { }

    class TestClassToken {

      @Inject(TestServiceA)
      private valueTokenA: any

      constructor(@Inject(TestServiceB) valueTokenB: any, @Inject(TestServiceC) valueTokenC: any) { }
    }

    const { properties, constructorParams } = getInjectTokens(TestClassToken)

    expect(properties).toEqual({ valueTokenA: TestServiceA })
    expect(constructorParams).toEqual([TestServiceB, TestServiceC])
  })
})
