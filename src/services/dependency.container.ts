import { DependencyCreation, DependencyToken } from '@common/types/types'
import { Scope } from '@enums/scope'
import { InjectionRegisterException } from '@exceptions/register.exception'
import { DependencyRepository } from '@repositories/dependency.repository'
import { isClass } from '@utils/types'

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
    if ([dependency.useClass, dependency.useFactory, dependency.useValue].filter(useCreation => useCreation !== undefined && useCreation !== null).length > 1) {
      throw new InjectionRegisterException('Please specify only one of the dependency creation options: "useClass", "useFactory", or "useValue"')
    }

    if (dependency.useClass && !isClass(dependency.useClass)) {
      throw new InjectionRegisterException(`It was expected that useClass would be a class, but a "${typeof dependency.useClass}" was received`)
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
