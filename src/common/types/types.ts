import { Scope } from '@enums/scope'
import { ClassConstructor } from '@utils/types'

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
