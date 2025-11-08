import { Dependency, DependencyToken } from '@common/types/types'

export class DependencyRepository {

  protected dependencies = new Map<DependencyToken, Dependency>()

  register(dependency: Dependency) {
    this.dependencies.set(dependency.token, dependency)
  }

  get(token: DependencyToken) {
    return this.dependencies.get(token) || null
  }
}
