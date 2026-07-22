import type { ForwardReference } from '@common/forward-ref'
import { Scope } from '@enums/scope'
import { ClassConstructor } from '@utils/types'

export type DependencyToken = string | ClassConstructor

export type DependencyTokenInput = DependencyToken | ForwardReference

export type DependencyCreation = {
  useClass?: ClassConstructor
  useValue?: any
  useFactory?: () => any
}

export type DependencyCreationInput = Omit<DependencyCreation, 'useClass'> & {
  useClass?: ClassConstructor | ForwardReference
}

export type Dependency = DependencyCreation & {
  token: DependencyToken
  scope: Scope
}
