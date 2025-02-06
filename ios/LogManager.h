#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface LogManager : NSObject

+ (instancetype)sharedInstance;

- (void)writeToLog:(NSString *)content appendTime:(BOOL)appendTime flush:(BOOL)flushImmediately;

- (void)flush;

@end

NS_ASSUME_NONNULL_END
