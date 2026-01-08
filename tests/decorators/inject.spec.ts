import { describe, expect, test } from 'vitest'

import { Inject } from '@decorators/inject.decorator'
import { getInjectTokensParams, getInjectTokensProperties } from '@metadata/inject.metadata'

describe('Decorator Inject', () => {
  test('It is expected that tokens will be stored as strings in the parameters and properties', () => {
    @Inject(0, 'PARAM_TOKEN_A')
    @Inject(1, 'PARAM_TOKEN_B')
    class TestWithStringToken {

      @Inject('PROP_TOKEN_A')
      private propTokenA: any

      private propValueB: any

      constructor(
        paramTokenA: any,
        paramTokenB: any
      ) { }
    }

    new TestWithStringToken(1, 2)

    const constructorParams = getInjectTokensParams(TestWithStringToken)
    const properties = getInjectTokensProperties(TestWithStringToken)

    expect(properties).toEqual({ propTokenA: 'PROP_TOKEN_A' })
    expect(constructorParams).toEqual(['PARAM_TOKEN_A', 'PARAM_TOKEN_B'])
  })

  test('It is expected that tokens will be registered in classes within the parameters and properties', () => {
    class TestServiceA { }
    class TestServiceB { }
    class TestServiceC { }

    @Inject(0, TestServiceB)
    @Inject(1, TestServiceC)
    class TestWithClassToken {

      @Inject(TestServiceA)
      private propTokenA: any

      constructor(
        paramTokenB: any,
        paramTokenC: any
      ) { }
    }

    new TestWithClassToken(1, 2)

    const constructorParams = getInjectTokensParams(TestWithClassToken)
    const properties = getInjectTokensProperties(TestWithClassToken)

    expect(properties).toEqual({ propTokenA: TestServiceA })
    expect(constructorParams).toEqual([TestServiceB, TestServiceC])
  })

  test('Expected to return an undefined element in the parameter array when no token is specified', () => {
    @Inject(0, 'PARAM_TOKEN_A')
    @Inject(2, 'PARAM_TOKEN_C')
    class TestTokenUndefined {

      constructor(
        paramTokenA: any, paramB: any,
        paramTokenC: any, paramD: any
      ) { }
    }

    const constructorParams = getInjectTokensParams(TestTokenUndefined)

    expect(constructorParams).toEqual(['PARAM_TOKEN_A', undefined, 'PARAM_TOKEN_C'])
  })

  test('Expected to return an empty token array when no tokens are defined in the constructor\'s properties and parameters', () => {
    class TestWithoutToken {

      constructor(paramA: any, paramB: any, paramC: any) { }
    }

    const constructorParams = getInjectTokensParams(TestWithoutToken)
    const properties = getInjectTokensProperties(TestWithoutToken)

    expect(properties).toEqual({})
    expect(constructorParams).toEqual([])
  })

  test('Method parameter tokens and property tokens are written only after instance initialization', () => {
    class TestDelayedInit {

      @Inject('PROP_LATE')
      propLate: any

      @Inject(0, 'PARAM_LATE')
      method(p: any) { }
    }

    expect(getInjectTokensProperties(TestDelayedInit)).toEqual({})
    expect(getInjectTokensParams(TestDelayedInit, 'method')).toEqual([])

    new TestDelayedInit()

    expect(getInjectTokensProperties(TestDelayedInit)).toEqual({ propLate: 'PROP_LATE' })
    expect(getInjectTokensParams(TestDelayedInit, 'method')).toEqual(['PARAM_LATE'])
  })

  test('Method parameters support sparse indices (undefined slots preserved)', () => {
    class TestSparse {

      @Inject(2, 'TWO')
      method(a: any, b: any, c: any) { }
    }

    new TestSparse()

    expect(getInjectTokensParams(TestSparse, 'method')).toEqual([undefined, undefined, 'TWO'])
  })

  test('Supports symbol property tokens', () => {
    const SYM = Symbol('sym')

    class TestSymbolProp {

      @Inject('SYM_TOKEN')
      [SYM]: any
    }

    new TestSymbolProp()

    const props = getInjectTokensProperties(TestSymbolProp)

    expect(props[SYM]).toBe('SYM_TOKEN')
  })

  test('Different methods maintain separate token arrays', () => {
    class TestMultiMethods {

      @Inject(0, 'A0')
      @Inject(2, 'A2')
      methodA(a: any, b: any) { }

      @Inject(1, 'B1')
      methodB(x: any, y: any) { }
    }

    new TestMultiMethods()

    expect(getInjectTokensParams(TestMultiMethods, 'methodA')).toEqual(['A0', undefined, 'A2'])
    expect(getInjectTokensParams(TestMultiMethods, 'methodB')).toEqual([undefined, 'B1'])
  })
})
