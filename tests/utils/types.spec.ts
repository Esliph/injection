import { describe, expect, test } from 'vitest'

import { isClass } from '@utils/types'

describe('Tests to validate useful typing functions', () => {
  test('isClass is expected to return false for any data type that is not a class', () => {
    enum TestEnum { Value }
    const func = function () { }

    Object.defineProperty(func, 'prototype', {
      writable: true
    })

    const dataset: any[] = [
      10,
      'abc',
      true,
      TestEnum.Value,
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
