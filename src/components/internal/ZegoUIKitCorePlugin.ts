import { zloginfo, zlogerror } from '../../utils/logger';
import { ZegoUIKitPluginType } from './defines';

const _plugins = new Map(); // type -> plugin
const ZegoUIKitCorePlugin = {
  installPlugins: (plugins: any[]) => {
    if (!plugins || !(plugins instanceof Array)) {
      zlogerror('[ZegoUIKitCorePlugin][installPlugins]The parameter passed in was incorrect');
      return;
    }
    plugins.forEach((plugin) => {
      zloginfo('[ZegoUIKitCorePlugin][installPlugins]Plugin install', plugin.default);
      if (plugin.ZIMConnectionState) {
        _plugins.set('ZIM', plugin);
        zloginfo('[ZegoUIKitCorePlugin][installPlugins]Plugin install success, plugins: ', 'ZIM');
      } else if (plugin.ZPNsPushSourceType) {
        _plugins.set('ZPNs', plugin);
        zloginfo('[ZegoUIKitCorePlugin][installPlugins]Plugin install success, plugins: ', 'ZPNs');
      } else if (typeof plugin.getInstance === 'function') {
        // Compatible with the original usage
        const type = plugin.getInstance().getPluginType
          ? plugin.getInstance().getPluginType()
          : null;
        if (Object.values(ZegoUIKitPluginType).includes(type)) {
          if (_plugins.get(type)) {
            zloginfo(
              '[ZegoUIKitCorePlugin][installPlugins]Plugin already exists, will update plugin instance'
            );
          } else {
            _plugins.set(type, plugin);
            zloginfo('[ZegoUIKitCorePlugin][installPlugins]Plugin install success, plugins: ', type);
          }
        }
      }
    });
  },
  getZIMPlugin: () => {
    return _plugins.get('ZIM');
  },
  getZPNsPlugin: () => {
    return _plugins.get('ZPNs');
  },
  getPlugin: (type: number) => {
    if (type === ZegoUIKitPluginType.signaling) {
      zloginfo('[ZegoUIKitCorePlugin][getPlugin] type: ', type);
      return _plugins.get(type) || ZegoUIKitCorePlugin.getZIMPlugin();
    }
    return _plugins.get(type);
  },
};
export default ZegoUIKitCorePlugin;
export { ZegoUIKitPluginType };
