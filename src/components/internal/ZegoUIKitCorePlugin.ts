import { zloginfo, zlogwarning, zlogerror } from '../../utils/logger';
import { ZegoUIKitPluginType } from './defines';

const _plugins = new Map(); // type -> plugin
const ZegoUIKitCorePlugin = {
  installPlugins: (plugins: any[]) => {
    if (!plugins || !(plugins instanceof Array)) {
      zlogerror('[installPlugins]The parameter passed in was incorrect');
      return;
    }
    plugins.forEach((plugin) => {
      if (plugin.getInstance) {
        const type = plugin.getInstance().getPluginType
          ? plugin.getInstance().getPluginType()
          : null;
        if (Object.values(ZegoUIKitPluginType).includes(type)) {
          if (_plugins.get(type)) {
            zloginfo(
              '[installPlugins]Plugin already exists, will update plugin instance'
            );
          } else {
            _plugins.set(type, plugin);
            zloginfo(
              '[installPlugins]Plugin install success, plugins: ',
              _plugins
            );
          }
        }
      }
    });
  },
  getPlugin: (type: number) => {
    return _plugins.get(type);
  },
};
export default ZegoUIKitCorePlugin;
export { ZegoUIKitPluginType };
