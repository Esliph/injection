import { injectable, InjectableProps } from '@metadata/injectable'

export function Injectable(props?: InjectableProps) {
  return (value: any, _: ClassDecoratorContext) => {
    injectable(props, value)
  }
}
