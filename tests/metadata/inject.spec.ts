import { describe, expect, test } from 'vitest'

import {
  getInjectTokensParams,
  getInjectTokensProperties,
  injectField,
  injectParamConstructor,
  injectParamMethod
} from '@metadata/inject.metadata'

describe('Metadata helpers (without decorators)', () => {
  test('tokens stored as strings in constructor params and properties', () => {
    class TestManualString {
      private propTokenA: any

      constructor(paramTokenA: any, paramTokenB: any) { }
    }

    injectParamConstructor(0, 'PARAM_TOKEN_A', TestManualString)
    injectParamConstructor(1, 'PARAM_TOKEN_B', TestManualString)
    injectField('PROP_TOKEN_A', TestManualString, 'propTokenA')

    const constructorParams = getInjectTokensParams(TestManualString)
    const properties = getInjectTokensProperties(TestManualString)

    expect(properties).toEqual({ propTokenA: 'PROP_TOKEN_A' })
    expect(constructorParams).toEqual(['PARAM_TOKEN_A', 'PARAM_TOKEN_B'])
  })

  test('tokens registered as classes in constructor params and properties', () => {
    class TestServiceA { }
    class TestServiceB { }
    class TestServiceC { }

    class TestWithClassToken {
      private propTokenA: any

      constructor(paramTokenB: any, paramTokenC: any) { }
    }

    injectParamConstructor(0, TestServiceB, TestWithClassToken)
    injectParamConstructor(1, TestServiceC, TestWithClassToken)
    injectField(TestServiceA, TestWithClassToken, 'propTokenA')

    const constructorParams = getInjectTokensParams(TestWithClassToken)
    const properties = getInjectTokensProperties(TestWithClassToken)

    expect(properties).toEqual({ propTokenA: TestServiceA })
    expect(constructorParams).toEqual([TestServiceB, TestServiceC])
  })

  test('sparse constructor parameter indices preserve undefined slots', () => {
    class TestTokenUndefined {
      constructor(paramTokenA: any, paramB: any, paramTokenC: any, paramD: any) { }
    }

    injectParamConstructor(0, 'PARAM_TOKEN_A', TestTokenUndefined)
    injectParamConstructor(2, 'PARAM_TOKEN_C', TestTokenUndefined)

    const constructorParams = getInjectTokensParams(TestTokenUndefined)

    expect(constructorParams).toEqual(['PARAM_TOKEN_A', undefined, 'PARAM_TOKEN_C'])
  })

  test('empty token array when no tokens defined', () => {
    class TestWithoutToken {
      constructor(paramA: any, paramB: any, paramC: any) { }
    }

    const constructorParams = getInjectTokensParams(TestWithoutToken)
    const properties = getInjectTokensProperties(TestWithoutToken)

    expect(properties).toEqual({})
    expect(constructorParams).toEqual([])
  })

  test('method parameter tokens and property tokens written immediately when helpers called', () => {
    class TestImmediate {
      propLate: any

      method(p: any) { }
    }

    injectField('PROP_LATE', TestImmediate, 'propLate')
    injectParamMethod(0, 'PARAM_LATE', TestImmediate, 'method')

    expect(getInjectTokensProperties(TestImmediate)).toEqual({ propLate: 'PROP_LATE' })
    expect(getInjectTokensParams(TestImmediate, 'method')).toEqual(['PARAM_LATE'])
  })

  test('method parameters support sparse indices', () => {
    class TestSparse {
      method(a: any, b: any, c: any) { }
    }

    injectParamMethod(2, 'TWO', TestSparse, 'method')

    expect(getInjectTokensParams(TestSparse, 'method')).toEqual([undefined, undefined, 'TWO'])
  })

  test('supports symbol property tokens', () => {
    const SYM = Symbol('sym')

    class TestSymbolProp {
      [SYM]: any
    }

    injectField('SYM_TOKEN', TestSymbolProp, SYM)

    const props = getInjectTokensProperties(TestSymbolProp)

    expect(props[SYM]).toBe('SYM_TOKEN')
  })

  test('different methods maintain separate token arrays', () => {
    class TestMultiMethods {
      methodA(a: any, b: any, c: any) { }
      methodB(x: any, y: any) { }
    }

    injectParamMethod(0, 'A0', TestMultiMethods, 'methodA')
    injectParamMethod(2, 'A2', TestMultiMethods, 'methodA')
    injectParamMethod(1, 'B1', TestMultiMethods, 'methodB')

    expect(getInjectTokensParams(TestMultiMethods, 'methodA')).toEqual(['A0', undefined, 'A2'])
    expect(getInjectTokensParams(TestMultiMethods, 'methodB')).toEqual([undefined, 'B1'])
  })
})
