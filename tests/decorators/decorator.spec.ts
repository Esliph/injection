import { getInjectTokens, Inject } from '@decorators/inject.decorator'
import { describe, expect, test } from 'vitest'

describe('Decorators Test', () => {
  test('It is expected that tokens will be stored as strings in the parameters and properties', () => {
    class TestWithStringToken {

      @Inject('PROP_TOKEN_A')
      private propTokenA: any

      private propValueB: any

      constructor(@Inject('PARAM_TOKEN_A') paramTokenA: any, @Inject('PARAM_TOKEN_B') paramTokenB: any) { }
    }

    const { properties, constructorParams } = getInjectTokens(TestWithStringToken)

    expect(properties).toEqual({ propTokenA: 'PROP_TOKEN_A' })
    expect(constructorParams).toEqual(['PARAM_TOKEN_A', 'PARAM_TOKEN_B'])
  })

  test('It is expected that tokens will be registered in classes within the parameters and properties', () => {
    class TestServiceA { }
    class TestServiceB { }
    class TestServiceC { }

    class TestWithClassToken {

      @Inject(TestServiceA)
      private propTokenA: any

      constructor(@Inject(TestServiceB) paramTokenB: any, @Inject(TestServiceC) paramTokenC: any) { }
    }

    const { properties, constructorParams } = getInjectTokens(TestWithClassToken)

    expect(properties).toEqual({ propTokenA: TestServiceA })
    expect(constructorParams).toEqual([TestServiceB, TestServiceC])
  })

  test('Expected to return an undefined element in the parameter array when no token is specified', () => {
    class TestTokenUndefined {

      constructor(@Inject('PARAM_TOKEN_A') paramTokenA: any, paramB: any, @Inject('PARAM_TOKEN_C') paramTokenC: any, paramD: any) { }
    }

    const { constructorParams } = getInjectTokens(TestTokenUndefined)

    expect(constructorParams).toEqual(['PARAM_TOKEN_A', undefined, 'PARAM_TOKEN_C'])
  })
})
