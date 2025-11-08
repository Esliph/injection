import { DependencyRepository } from '@repositories/dependency.repository'
import { beforeEach, describe, expect, test } from 'vitest'
import { Dependency } from '../../src/common/types/types'
import { Scope } from '../../src/enums/scope'

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

    expect(repository.get(dependency.token)).toEqual(dependency)
  })

  test('Null is expected to be returned when an unregistered token is provided', () => {
    expect(repository.get('TOKEN')).toBeNull()
  })
})
