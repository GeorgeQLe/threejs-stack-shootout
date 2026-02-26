export type EntityId = number;

export interface EcsWorld {
  nextEntityId: number;
  alive: Set<EntityId>;
  components: Map<string, Map<EntityId, unknown>>;
}

export function createWorld(): EcsWorld {
  return {
    nextEntityId: 1,
    alive: new Set<EntityId>(),
    components: new Map<string, Map<EntityId, unknown>>()
  };
}

export function createEntity(world: EcsWorld): EntityId {
  const id = world.nextEntityId;
  world.nextEntityId += 1;
  world.alive.add(id);
  return id;
}

function requireEntity(world: EcsWorld, entity: EntityId): void {
  if (!world.alive.has(entity)) {
    throw new Error(`Unknown entity ${entity}`);
  }
}

function getStore(world: EcsWorld, key: string): Map<EntityId, unknown> {
  let store = world.components.get(key);
  if (!store) {
    store = new Map<EntityId, unknown>();
    world.components.set(key, store);
  }
  return store;
}

export function addComponent<T>(world: EcsWorld, entity: EntityId, key: string, value: T): T {
  requireEntity(world, entity);
  getStore(world, key).set(entity, value as unknown);
  return value;
}

export function getComponent<T>(world: EcsWorld, entity: EntityId, key: string): T | undefined {
  if (!world.alive.has(entity)) {
    return undefined;
  }
  return world.components.get(key)?.get(entity) as T | undefined;
}

export function removeComponent(world: EcsWorld, entity: EntityId, key: string): void {
  world.components.get(key)?.delete(entity);
}

export function removeEntity(world: EcsWorld, entity: EntityId): void {
  if (!world.alive.delete(entity)) {
    return;
  }

  for (const store of world.components.values()) {
    store.delete(entity);
  }
}

export function queryEntities(world: EcsWorld, componentKeys: string[]): EntityId[] {
  if (componentKeys.length === 0) {
    return [...world.alive];
  }

  const [firstKey, ...rest] = componentKeys;
  const firstStore = world.components.get(firstKey);
  if (!firstStore) {
    return [];
  }

  const result: EntityId[] = [];
  for (const entity of firstStore.keys()) {
    if (!world.alive.has(entity)) {
      continue;
    }

    const matchesAll = rest.every((key) => world.components.get(key)?.has(entity));
    if (matchesAll) {
      result.push(entity);
    }
  }

  return result;
}
