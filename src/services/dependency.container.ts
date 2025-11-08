import { DependencyCreation, DependencyToken } from '@common/types/dependency'
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

  register({ token, scope, useClass, useFactory, useValue }: DependencyRegister) {
    this.validateTokenToRegister(token)
    this.validateUseCreationsToRegister({ useClass, useFactory, useValue })

    this.repository.register({
      token,
      scope: scope || Scope.REQUEST,
      useClass,
      useFactory,
      useValue,
    })
  }

  protected validateTokenToRegister(token: DependencyToken) {
    if (!token) {
      throw new InjectionRegisterException('A Token must be provided for the dependency')
    }

    if (this.repository.get(token) !== null) {
      throw new InjectionRegisterException(`Dependency "${token}" already registered`)
    }
  }

  protected validateUseCreationsToRegister({ useClass, useFactory, useValue }: DependencyCreation) {
    const propsCreational = [useClass, useFactory, useValue].filter(useCreation => useCreation !== undefined && useCreation !== null)

    if (!propsCreational.length) {
      throw new InjectionRegisterException('You must provide a method option for creating the dependency: "useClass", "useFactory" or "useValue"')
    }
    if (propsCreational.length > 1) {
      throw new InjectionRegisterException('Please specify only one of the dependency creation options: "useClass", "useFactory", or "useValue"')
    }

    if (useClass && !isClass(useClass)) {
      throw new InjectionRegisterException(`It was expected that useClass would be a "class", but a "${typeof useClass}" was received`)
    } else if (useFactory && typeof useFactory !== 'function') {
      throw new InjectionRegisterException(`It was expected that useFactory would be a "function", but a "${typeof useClass}" was received`)
    }
  }
}
