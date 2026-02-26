import Entity from '../../domain/Entity'

export default abstract class Event<T extends Entity = Entity> {
  constructor(protected subject: T) {}
  protected abstract getSubject(): T
  public abstract dispatch(): void
}
