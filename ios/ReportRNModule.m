#import "ReportRNModule.h"
#import <ZegoUIKitReport/ZegoUIKitReport.h>

@implementation ReportRNModule

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(getVersion:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  resolve([ReportUtil getVersion]);
}

unsigned long long stringToUInt(NSString *string) {
    unsigned long long value;
    NSScanner *scanner = [NSScanner scannerWithString:string];
    if ([scanner scanUnsignedLongLong:&value]) {
        return value;
    } else {
        // 处理错误或返回一个默认值
        return 0;
    }
}

RCT_EXPORT_METHOD(create:(NSString *)appIDStr signOrToken:(NSString *)signOrToken commonParams:(NSDictionary *)commonParams) {
  unsigned int appID = (unsigned int)stringToUInt(appIDStr);
  [[ReportUtil sharedInstance] createWithAppID:appID signOrToken:signOrToken commonParams:commonParams];
}

RCT_EXPORT_METHOD(updateCommonParams:(NSDictionary *)params) {
  [[ReportUtil sharedInstance] updateCommonParams:params];
}

RCT_EXPORT_METHOD(reportEvent:(NSString *)event params:(NSDictionary *)params) {
  [[ReportUtil sharedInstance] reportEvent:event paramsDict:params];
}

@end
