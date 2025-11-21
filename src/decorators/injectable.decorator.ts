import { Decorator } from '@esliph/decorator'
import { Scope } from '@enums/scope'
import { Metadata } from '@metadata/global'
import { ClassConstructor } from '@utils/types'
import { DependencyToken } from '@common/types/dependency'

const INJECTABLE_DEPENDENCY_KEY = 'injectable:dependency'

export type InjectableMetadata = {
  token: DependencyToken
  scope?: Scope
  useClass: ClassConstructor
}

export type InjectableProps = {
  token?: DependencyToken,
  scope?: Scope
}

export const Injectable = ({ token, scope }: InjectableProps = {}) => Decorator.Class((target) => {
  Metadata.setClassMetadata(target, INJECTABLE_DEPENDENCY_KEY, { token: token ?? target, scope, useClass: target })
})

export function getInjectableDependency(target: ClassConstructor) {
  return Metadata.getClassMetadata(target, INJECTABLE_DEPENDENCY_KEY) as InjectableMetadata || null
}