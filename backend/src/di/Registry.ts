export default class Registry {
  private dependencies: Record<string, any> = {}
  static instance: Registry

  private constructor() {}

  register(name: string, dependency) {
    this.dependencies[name] = dependency
  }

  inject(name: string) {
    const dependency = this.dependencies[name]
    if (!dependency) {
      throw new Error(`Dependency ${name} not found`)
    }
    return dependency
  }

  static getInstance(): Registry {
    if (!this.instance) {
      this.instance = new Registry()
    }
    return this.instance
  }
}

export function inject(name: string) {
  return function (target: any, propertyKey: string) {
    target[propertyKey] = new Proxy(
      {},
      {
        get(target: any, propertyKey: string) {
          const dependency = Registry.getInstance().inject(name)
          return dependency[propertyKey]
        },
      },
    )
  }
}
