import { MetadataTarget, Reflect } from '@esliph/metadata'

import { DependencyToken } from '@common/types/dependency'
import { Scope } from '@enums/scope'
import { ClassConstructor } from '@utils/types'

const INJECTABLE_DEPENDENCY_KEY = 'injectable:dependency'

export type InjectableMetadata = {
  token: DependencyToken
  scope?: Scope
  useClass: ClassConstructor
}

export type InjectableProps = {
  token?: DependencyToken
  scope?: Scope
}

export function injectable({ token, scope }: InjectableProps = {}, target: MetadataTarget) {
  Reflect.defineMetadata(INJECTABLE_DEPENDENCY_KEY, { token: token ?? target, scope, useClass: target }, target)
}

export function getInjectableDependency(target: ClassConstructor) {
  return Reflect.getMetadata(INJECTABLE_DEPENDENCY_KEY, target) as InjectableMetadata || null
}
