import { DependencyToken } from '@common/types/dependency'

export function getTokenName(token: DependencyToken) {
  return typeof token == 'string' ? token : token.name
}
