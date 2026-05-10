import {
  decodeLearnerState,
  encodeLearnerState,
  type LearnerState,
  type LearnerStateLoadResult
} from "./learnerState";

export type LearnerStateRepository = {
  loadLearnerState: (studybookId: string) => Promise<LearnerStateLoadResult>;
  saveLearnerState: (state: LearnerState) => Promise<void>;
};

export type KeyValueStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

export type TauriInvoke = <T>(
  command: string,
  args?: Record<string, unknown>
) => Promise<T>;

type TauriWindow = Window & {
  __TAURI__?: {
    core?: {
      invoke?: TauriInvoke;
    };
  };
};

const storageKeyPrefix = "project-math:learner-state:";

export function createDefaultLearnerStateRepository(): LearnerStateRepository {
  const invoke = getTauriInvoke();
  if (invoke) {
    return createTauriLearnerStateRepository(invoke);
  }

  return createLocalStorageLearnerStateRepository(window.localStorage);
}

export function createLocalStorageLearnerStateRepository(
  storage: KeyValueStorage,
  keyPrefix = storageKeyPrefix
): LearnerStateRepository {
  return {
    async loadLearnerState(studybookId) {
      return decodeLearnerState(studybookId, storage.getItem(stateKey(keyPrefix, studybookId)));
    },
    async saveLearnerState(state) {
      storage.setItem(stateKey(keyPrefix, state.studybookId), encodeLearnerState(state));
    }
  };
}

export function createTauriLearnerStateRepository(
  invoke: TauriInvoke
): LearnerStateRepository {
  return {
    async loadLearnerState(studybookId) {
      const rawState = await invoke<string | null>("load_learner_state", {
        studybookId
      });
      return decodeLearnerState(studybookId, rawState);
    },
    async saveLearnerState(state) {
      await invoke("save_learner_state", {
        studybookId: state.studybookId,
        json: encodeLearnerState(state)
      });
    }
  };
}

export function getTauriInvoke(win: Window = window): TauriInvoke | undefined {
  return (win as TauriWindow).__TAURI__?.core?.invoke;
}

function stateKey(prefix: string, studybookId: string) {
  return `${prefix}${studybookId}`;
}
