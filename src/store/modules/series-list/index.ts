import {
  Store as VuexStore,
  CommitOptions,
  Module,
} from 'vuex';

import { RootState } from '@/store';

import { state } from './state';

import { getters, Getters } from './getters';
import { mutations, Mutations } from './mutations';

import type { State } from './state';

export { State };

export type SeriesListStore<S = State> = Omit<VuexStore<S>, 'getters' | 'commit' | 'dispatch'>
& {
  commit<K extends keyof Mutations, P extends Parameters<Mutations[K]>[1]>(
    key: K,
    payload: P,
    options?: CommitOptions
  ): ReturnType<Mutations[K]>;
} & {
  getters: {
    [K in keyof Getters]: ReturnType<Getters[K]>
  };
};

export const store: Module<State, RootState> = {
  state,
  getters,
  mutations,
};