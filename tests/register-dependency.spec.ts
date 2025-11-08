import { Scope } from '@enums/scope'
import { DependencyRepository } from '@repositories/dependency.repository'
import { DependencyContainer } from '@services/dependency.container'
import { beforeEach, describe, expect, test } from 'vitest'

describe('Tests for registering Dependency', () => {
  let container: DependencyContainer
  let repository: DependencyRepository

  beforeEach(() => {
    repository = new DependencyRepository()
    container = new DependencyContainer(repository)
  })

  test('Simple functional record of a dependency', () => {
    const dependency = {
      token: 'TOKEN',
      scope: Scope.REQUEST,
      useValue: 10
    }

    container.register(dependency)

    expect(repository.get(dependency.token)).toEqual(dependency)
  })
})
