import { DependencyCreation, DependencyToken } from '@common/types/dependency'
import { getInjectTokens } from '@decorators/inject.decorator'
import { Scope } from '@enums/scope'
import { InjectionRegisterException } from '@exceptions/register.exception'
import { ResolveException } from '@exceptions/resolve.exception'
import { DependencyRepository } from '@repositories/dependency.repository'
import { getTokenName } from '@utils/token'
import { ClassConstructor, isClass } from '@utils/types'

export type DependencyRegister = (DependencyCreation & {
  token: DependencyToken
  scope?: Scope
}) | ClassConstructor

export class DependencyContainer {

  constructor(
    protected repository = new DependencyRepository()
  ) { }

  register(dependencies: DependencyRegister[]) {
    for (const dependency of dependencies) {
      const { token, scope, useClass, useFactory, useValue } = typeof dependency == 'object' ? dependency : { token: dependency, useClass: dependency }

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
  }

  resolve<TConstructor extends ClassConstructor>(context: TConstructor): InstanceType<TConstructor> {
    const { constructorParams, properties } = getInjectTokens(context)

    const params = []

    for (let i = 0; i < constructorParams.length; i++) {
      params[i] = this.resolveToken(constructorParams[i])
    }

    const instance = new context(...params)

    for (const prop in properties) {
      instance[prop] = this.resolveToken(properties[prop])
    }

    return instance
  }

  protected resolveToken(token: DependencyToken) {
    if (token === undefined) {
      return null
    }

    const dependency = this.repository.get(token)

    if (!dependency) {
      throw new ResolveException(`Dependency "${getTokenName(token)}" not registered in the container`)
    }

    if (dependency.useValue) {
      return dependency.useValue
    }

    if (dependency.useFactory) {
      return dependency.useFactory()
    }

    return this.resolve(dependency.useClass!)
  }

  protected validateTokenToRegister(token: DependencyToken) {
    if (!token) {
      throw new InjectionRegisterException('A Token must be provided for the dependency')
    }

    if (this.repository.get(token) !== null) {
      throw new InjectionRegisterException(`Dependency "${getTokenName(token)}" already registered`)
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

  getDependency(token: DependencyToken) {
    return this.repository.get(token)
  }
}
