type PluginState = {
  [key: string]: unknown;
};

export type OpenscdPluginState = {
  pluginState: PluginState | null;
  setState: (state: PluginState | null) => void;
  getState: () => PluginState | null;
  updateState: (partialState: Partial<PluginState>) => void;
};

export type OpenscdApi = {
  pluginState: OpenscdPluginState;
};
