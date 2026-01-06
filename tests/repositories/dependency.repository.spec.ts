import { beforeEach, describe, expect, test } from 'vitest'

import { Dependency } from '@common/types/dependency'
import { Scope } from '@enums/scope'
import { DependencyRepository } from '@repositories/dependency.repository'

describe('Dependency Repository Tests', () => {
  let repository: DependencyRepository

  beforeEach(() => {
    repository = new DependencyRepository()
  })

  test('Expected to register a Dependency', () => {
    const dependency: Dependency = {
      token: 'TOKEN',
      scope: Scope.REQUEST,
      useValue: 10
    }

    repository.register(dependency)

    expect(repository.has(dependency.token)).toBe(true)
    expect(repository.get(dependency.token)).toEqual(dependency)
  })

  test('Null is expected to be returned when an unregistered token is provided', () => {
    expect(repository.get('TOKEN')).toBeNull()
  })
})
