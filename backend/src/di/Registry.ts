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
