import {Template} from '../models/types';
import {getItem, setItem} from './storage';

const TEMPLATES_KEY = 'templates';

export const TemplateRepository = {
  async getAll(): Promise<Template[]> {
    return (await getItem<Template[]>(TEMPLATES_KEY)) ?? [];
  },

  async saveAll(templates: Template[]): Promise<void> {
    await setItem(TEMPLATES_KEY, templates);
  },
};
