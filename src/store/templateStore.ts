import {create} from 'zustand';
import {HabitDefinition, Template} from '../models/types';
import {TemplateRepository} from '../data/templateRepository';

export const makeId = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

interface TemplateState {
  templates: Template[];
  loaded: boolean;
  load: () => Promise<void>;
  saveTemplate: (
    id: string | undefined,
    name: string,
    habits: HabitDefinition[],
  ) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
}

export const useTemplateStore = create<TemplateState>((set, get) => {
  const persist = async (templates: Template[]) => {
    set({templates});
    await TemplateRepository.saveAll(templates);
  };

  return {
    templates: [],
    loaded: false,

    load: async () => {
      const templates = await TemplateRepository.getAll();
      set({templates, loaded: true});
    },

    saveTemplate: async (id, name, habits) => {
      const ordered = habits.map((h, i) => ({...h, order: i}));
      const existing = get().templates;
      const next = id
        ? existing.map(t =>
            t.id === id ? {...t, name, habits: ordered} : t,
          )
        : [
            ...existing,
            {
              id: makeId(),
              name,
              habits: ordered,
              createdAt: new Date().toISOString(),
            },
          ];
      await persist(next);
    },

    deleteTemplate: async id => {
      await persist(get().templates.filter(t => t.id !== id));
    },
  };
});
