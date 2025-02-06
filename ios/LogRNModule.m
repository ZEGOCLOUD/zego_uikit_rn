#import "LogRNModule.h"
#import "LogManager.h"

@implementation LogRNModule

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(logInfo:(NSString *)log) {
  [[LogManager sharedInstance] writeToLog:log appendTime:NO flush:NO];
}

RCT_EXPORT_METHOD(logWarning:(NSString *)log) {
  [[LogManager sharedInstance] writeToLog:log appendTime:NO flush:NO];
}

RCT_EXPORT_METHOD(logError:(NSString *)log) {
  [[LogManager sharedInstance] writeToLog:log appendTime:NO flush:NO];
}

RCT_EXPORT_METHOD(flush) {
  [[LogManager sharedInstance] flush];
}

@end
