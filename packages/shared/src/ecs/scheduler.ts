import type { EcsWorld } from "./world.js";

export type SystemFn<TWorld = EcsWorld> = (world: TWorld, dtMs: number) => void;

interface ScheduledSystem<TWorld> {
  priority: number;
  order: number;
  run: SystemFn<TWorld>;
}

export interface Scheduler<TWorld = EcsWorld> {
  addSystem(run: SystemFn<TWorld>, priority?: number): () => void;
  run(world: TWorld, dtMs: number): void;
  clear(): void;
  size(): number;
}

export function createScheduler<TWorld = EcsWorld>(): Scheduler<TWorld> {
  const systems: ScheduledSystem<TWorld>[] = [];
  let orderCounter = 0;

  return {
    addSystem(run, priority = 0) {
      const entry: ScheduledSystem<TWorld> = {
        priority,
        order: orderCounter,
        run
      };

      orderCounter += 1;
      systems.push(entry);
      systems.sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        return a.order - b.order;
      });

      return () => {
        const idx = systems.indexOf(entry);
        if (idx >= 0) {
          systems.splice(idx, 1);
        }
      };
    },

    run(world, dtMs) {
      for (const system of systems) {
        system.run(world, dtMs);
      }
    },

    clear() {
      systems.length = 0;
    },

    size() {
      return systems.length;
    }
  };
}
