import { Platform } from 'react-native';
import { zloginfo, zlogerror } from '../../utils/logger';
import { ZegoUIKitPluginType } from './defines';

const _plugins = new Map(); // type -> plugin
const ZegoUIKitCorePlugin = {
  installPlugins: (plugins: any[]) => {
    zloginfo(`[ZegoUIKitCorePlugin] installPlugins, plugins: ${plugins}`)

    if (!plugins || !(plugins instanceof Array)) {
      zlogerror('[ZegoUIKitCorePlugin][installPlugins]The parameter passed in was incorrect');
      return;
    }
    plugins.forEach((plugin, index) => {
      if (plugin.ZIMConnectionState) {
        if (_plugins.get('ZIM')) {
          zloginfo(
            '[ZegoUIKitCorePlugin][installPlugins]Plugin already exists, this install does not take effect, plugin: ZIM'
          );
        } else {
          _plugins.set('ZIM', plugin);
          zloginfo(`[ZegoUIKitCorePlugin][installPlugins]Plugin install success, plugin: ZIM, index: ${index}`);
        }
      } else if (plugin.ZPNsPushSourceType) {
        if (_plugins.get('ZPNs')) {
          zloginfo(
            '[ZegoUIKitCorePlugin][installPlugins]Plugin already exists, this install does not take effect, plugin: ZPNs'
          );
        } else {
          _plugins.set('ZPNs', plugin);
          zloginfo(`[ZegoUIKitCorePlugin][installPlugins]Plugin install success, plugin: ZPNs, index: ${index}`);

          if (!(_plugins.get('CallKit')) && Platform.OS === 'ios') {
            try {
              let callKitPlugin = require('zego-callkit-react-native');
              _plugins.set('CallKit', callKitPlugin);
              zloginfo(`[ZegoUIKitCorePlugin][installPlugins] Plugin install success, plugin: CallKit, index: ${index}`);
            } catch(error) {
              zloginfo(`[ZegoUIKitCorePlugin][installPlugins] Cannot resolve module zego-callkit-react-native`);
            }
          }
        }
      } else if (typeof plugin.getInstance === 'function') {
        // Compatible with the original usage
        const type = plugin.getInstance().getPluginType
          ? plugin.getInstance().getPluginType()
          : null;
        if (Object.values(ZegoUIKitPluginType).includes(type)) {
          if (_plugins.get(type)) {
            zloginfo(
              '[ZegoUIKitCorePlugin][installPlugins]Plugin already exists, this install does not take effect, plugins: ', type
            );
          } else {
            _plugins.set(type, plugin);
            zloginfo('[ZegoUIKitCorePlugin][installPlugins]Plugin install success, plugin: ', type);
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
  getCallKitPlugin: () => {
    return _plugins.get('CallKit');
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
