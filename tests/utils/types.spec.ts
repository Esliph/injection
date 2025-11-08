import { isClass } from '@utils/types'
import { describe, expect, test } from 'vitest'

describe('Tests to validate useful functions', () => {
  test('isClass is expected to return false for any data type that is not a class', () => {
    enum Test { Value }
    const func = function () { }

    Object.defineProperty(func, 'prototype', {
      writable: true
    })

    const dataset: any[] = [
      10,
      'abc',
      true,
      Test.Value,
      new Date(),
      {},
      [],
      function () { },
      () => { },
      func,
    ]

    dataset.forEach(value => expect(isClass(value)).toBe(false))
  })

  test('I expect the Class to return true when a class is specified', () => {
    class Test { }

    expect(isClass(Test)).toBe(true)
  })
})
