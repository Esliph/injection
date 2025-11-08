import { DependencyCreation, DependencyToken } from '@common/types/types'
import { Scope } from '@enums/scope'
import { InjectionRegisterException } from '@exceptions/register.exception'
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
    if (!dependency.token) {
      throw new InjectionRegisterException('A Token must be provided for the dependency')
    }
    if (!dependency.useClass && !dependency.useFactory && !dependency.useValue) {
      throw new InjectionRegisterException('You must provide a method option for creating the dependency: "useClass", "useFactory" or "useValue"')
    }

    this.repository.register({
      token: dependency.token,
      scope: dependency.scope || Scope.REQUEST,
      useClass: dependency.useClass,
      useFactory: dependency.useFactory,
      useValue: dependency.useValue,
    })
  }
}
