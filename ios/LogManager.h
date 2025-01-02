#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface LogManager : NSObject

+ (instancetype)sharedInstance;

- (void)writeToLog:(NSString *)content;

@end

NS_ASSUME_NONNULL_END
