#import "LogManager.h"

static dispatch_once_t onceToken;
static id _instance;

@interface LogManager ()

@property (nonatomic, strong) NSDateFormatter *dateFormatter;
@property (nonatomic, strong) NSFileHandle *logFileHandle;
@property (nonatomic, strong) dispatch_queue_t logWriteQueue;
@property (nonatomic, assign) int logTimes;

@end

@implementation LogManager

+ (instancetype)sharedInstance {
  dispatch_once(&onceToken, ^{
    _instance = [self new];
  });
  return _instance;
}

- (instancetype)init {
  self = [super init];
  if (self) {
    [self createLogFile];
    _logTimes = 0;
  }
  return self;
}

- (void)createLogFile {
  self.dateFormatter = [NSDateFormatter new];
  [self.dateFormatter setDateFormat:@"yyyy-MM-dd"];

  NSArray *paths = NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES);
  NSString *cacheDirectory = [paths objectAtIndex:0];
  
  NSString *folderPath = [cacheDirectory stringByAppendingPathComponent:@"zego_prebuilt"];
  NSFileManager *fileManager = [NSFileManager defaultManager];
  if (NO == [fileManager fileExistsAtPath:folderPath]) {
    NSError *error = nil;
    BOOL success = [fileManager createDirectoryAtPath:folderPath withIntermediateDirectories:YES attributes:nil error:&error];
    if (!success) {
      NSLog(@"Failed to create directory: %@", error);
      return;
    }
  }

  NSDate *currentDate = [NSDate date];
  NSString *todayLogFileName = [NSString stringWithFormat:@"%@.log", [self.dateFormatter stringFromDate:currentDate]];
  NSString *filePath = [folderPath stringByAppendingPathComponent:todayLogFileName];
  self.logFileHandle = [NSFileHandle fileHandleForWritingAtPath:filePath];

  [self.dateFormatter setDateFormat:@"MMdd HH:mm:ss.SSS"];
  NSString *firstLog = [NSString stringWithFormat:@"\n%@ ==========PROCESS_START==========\n", [self.dateFormatter stringFromDate:currentDate]];
  NSData *dataToWrite = [firstLog dataUsingEncoding:NSUTF8StringEncoding];

  if (NULL == self.logFileHandle) {
    BOOL isWriteSucc = [dataToWrite writeToFile:filePath atomically:YES];
    self.logFileHandle = [NSFileHandle fileHandleForWritingAtPath:filePath];
    [self.logFileHandle seekToEndOfFile];
  } else {
    [self.logFileHandle seekToEndOfFile];
    [self.logFileHandle writeData:dataToWrite];
  }
  
  NSString *threadName = [NSString stringWithFormat:@"%@.zego_prebuilt.logfilewriting", [NSBundle mainBundle].bundleIdentifier];
  self.logWriteQueue = dispatch_queue_create(threadName.UTF8String, DISPATCH_QUEUE_SERIAL);
}

- (void)writeToLog:(NSString *)content {
  if (NULL == self.logFileHandle) {
    return;
  }
  
  NSDate *currentDate = [NSDate date];
  NSData *dataToWrite = [[NSString stringWithFormat:@"%@ %@\n", [self.dateFormatter stringFromDate:currentDate], content] dataUsingEncoding:NSUTF8StringEncoding];

  dispatch_async(self.logWriteQueue, ^{
    [self.logFileHandle writeData:dataToWrite];

    self->_logTimes++;
    if (self->_logTimes >= 5) {
      [self flush];
    }
  });
}

- (void)flush {
  NSError *error = nil;
  BOOL syncSuccess = [self.logFileHandle synchronizeAndReturnError:&error];
  if (!syncSuccess) {
    [self.logFileHandle closeFile];
    [self createLogFile];
  } else {
    _logTimes = 0;
  }
}

@end
