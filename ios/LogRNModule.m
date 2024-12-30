#import "LogRNModule.h"

@implementation LogRNModule

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(logInfo:(NSString *)log) {
  // NSLog(@"%@", log);
}

RCT_EXPORT_METHOD(logWarning:(NSString *)log) {
  // NSLog(@"%@", log);
}

RCT_EXPORT_METHOD(logError:(NSString *)log) {
  // NSLog(@"%@", log);
}

@end
