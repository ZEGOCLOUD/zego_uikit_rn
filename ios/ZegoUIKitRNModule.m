#import "ZegoUIKitRNModule.h"

@implementation ZegoUIKitRNModule

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(getBackgroundModes:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    NSArray *modes = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"UIBackgroundModes"];
    if (modes == nil || [modes count] == 0) {
      resolve(@"[ ]");
    } else {
      resolve([NSString stringWithFormat:@"[%@]", [modes componentsJoinedByString:@", "]]);
    }
}

@end
