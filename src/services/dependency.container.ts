import { DependencyCreation, DependencyToken } from '@common/types/types'
import { Scope } from '@enums/scope'
import { DependencyRepository } from '@repositories/dependency.repository'

export type DependencyRegister = DependencyCreation & {
  token: DependencyToken
  scope?: Scope
}

export class DependencyContainer {

  constructor(
    protected repository = new DependencyRepository()
  ) { }

  register(dependency: DependencyRegister) {
    this.repository.register({
      token: dependency.token,
      scope: dependency.scope || Scope.REQUEST,
      useClass: dependency.useClass,
      useFactory: dependency.useFactory,
      useValue: dependency.useValue,
    })
  }
}
