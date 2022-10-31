import { zloginfo, zlogwarning, zlogerror } from '../../utils/logger';

const _plugins = new Map(); // type -> plugin
const ZegoUIKitCorePlugin = {
  installPlugins: (plugins) => {
    if (!plugins || !plugins instanceof Array) {
      zlogerror('[installPlugins]The parameter passed in was incorrect');
      return;
    }
    plugins.forEach((plugin) => {
      const type = plugin.getPluginType ? plugin.getPluginType() : null;
      if (type) {
        if (_plugins.get(type)) {
          zlogwarning(
            '[installPlugins]Plugin already exists, will update plugin instance'
          );
        } else {
          _plugins.set(type, plugin);
          zloginfo('[installPlugins]Plugin install success');
        }
      }
    });
  },
  getPlugin: (type) => {
    return _plugins.get(type);
  },
};
export default ZegoUIKitCorePlugin;
