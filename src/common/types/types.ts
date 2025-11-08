import { Scope } from '@enums/scope'

export type ClassConstructor<T = any> = new (...args: any[]) => T

export type DependencyToken = string | ClassConstructor

export type DependencyCreation = {
  useClass?: ClassConstructor
  useValue?: any
  useFactory?: () => any
}

export type Dependency = DependencyCreation & {
  token: DependencyToken
  scope: Scope
}
