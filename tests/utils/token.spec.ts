import { InjectionErrorCode } from '@exceptions/code-errors'
import { InvalidTokenInjectionException } from '@exceptions/token.exception'
import { assertValidToken, isValidToken } from '@utils/token'
import { describe, expect, test } from 'vitest'

describe('Tests to validate useful Token functions', () => {
  test('isValidToken is expected to return false for any data type that is not a class or string', () => {
    enum TestEnum { Value }
    const func = function () { }

    Object.defineProperty(func, 'prototype', {
      writable: true
    })

    const dataset: any[] = [
      10,
      true,
      TestEnum.Value,
      new Date(),
      {},
      [],
      function () { },
      () => { },
      func,
    ]

    dataset.forEach(value => expect(isValidToken(value)).toBe(false))
  })

  test('isValidToken is expected to return false for any data type that is not a class or string', () => {
    enum TestEnum { Value }
    const func = function () { }

    Object.defineProperty(func, 'prototype', {
      writable: true
    })

    const dataset: any[] = [
      10,
      true,
      TestEnum.Value,
      new Date(),
      {},
      [],
      function () { },
      () => { },
      func,
    ]

    dataset.forEach(value => {
      try {
        assertValidToken(value)
      } catch (error: any) {
        expect(error).toBeInstanceOf(InvalidTokenInjectionException)
        expect(error.code).toBe(InjectionErrorCode.TOKEN_INVALID)
      }
    })
  })

  test('It is expected that isValidToken returns true for values that are classes', () => {
    class Test { }

    expect(isValidToken(Test)).toBe(true)
    expect(() => assertValidToken(Test)).not.toThrow()
  })

  test('isValidToken is expected to return true for values that are strings', () => {
    expect(isValidToken('STRING_TOKEN')).toBe(true)
    expect(() => assertValidToken('STRING_TOKEN')).not.toThrow()
  })
})
