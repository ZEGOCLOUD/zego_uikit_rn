import json
import os
import webbrowser

def list_options():
    print("Development Options:")
    print("1. Update sub modules")
    print("2. Reset dev environment")
    print("3. Publish package")
    
    choice = input("Enter your choice (1-3): ")
    if choice == "1":
        pull_git_submodule()
    elif choice == "2":
        reset_dev_env()
    elif choice == "3":
        publisher = Publisher()
        publisher.start()
    else:
        print("Invalid choice")

def pull_git_submodule():
   # Execute the Git submodule update command
   os.system("git submodule update --init")
   print("[pull_git_submodule] Check prebuilts/call to master branch...\n")
   os.system("cd prebuilts/call; git checkout master; git pull; cd ../../")
   print("[pull_git_submodule] Check prebuilts/live_audio_room to master branch...\n")
   os.system("cd prebuilts/live_audio_room; git checkout master; git pull; cd ../../")
   print("[pull_git_submodule] Check prebuilts/live_streaming to master branch...\n")
   os.system("cd prebuilts/live_streaming; git checkout master; git pull; cd ../../")
   print("[pull_git_submodule] Check prebuilts/video_conference to master branch...\n")
   os.system("cd prebuilts/video_conference; git checkout master; git pull; cd ../../")

def reset_dev_env():
    print("Executing reset_dev_env...")
    print("Clean cache files...\n")
    os.system("rm -rf node_modules yarn.lock")
    remove_prebuilt_cache_files("prebuilts/call")
    remove_prebuilt_cache_files("prebuilts/live_audio_room")
    remove_prebuilt_cache_files("prebuilts/live_streaming")
    remove_prebuilt_cache_files("prebuilts/video_conference")

    print("\nExecuting install_dependencies...")
    os.system("yarn install")
    os.system("yarn link")
    print("\nExecuting install_prebuilt_dependencies...")
    print("Which prebuilt do you want to install dependencies for:")
    print("1. All prebuilts")
    print("2. prebuilts/call")
    print("3. prebuilts/live_audio_room")
    print("4. prebuilts/live_streaming")
    print("5. prebuilts/video_conference")
    
    choice = input("Enter your choice (1-5): ")
    if choice == "1":
        install_prebuilt_dependencies("prebuilts/call")
        install_prebuilt_dependencies("prebuilts/live_audio_room")
        install_prebuilt_dependencies("prebuilts/live_streaming")
        install_prebuilt_dependencies("prebuilts/video_conference")
    elif choice == "2":
        install_prebuilt_dependencies("prebuilts/call")
    elif choice == "3":
        install_prebuilt_dependencies("prebuilts/live_audio_room")
    elif choice == "4":
        install_prebuilt_dependencies("prebuilts/live_streaming")
    elif choice == "5":
        install_prebuilt_dependencies("prebuilts/video_conference")
    else:
        print("Invalid choice")


def remove_prebuilt_cache_files(prebuilt):
    print("\nExecuting remove_prebuilt_cache_files: " + prebuilt)
    os.system("cd " + prebuilt + " ;rm -rf node_modules yarn.lock example/node_modules example/yarn.lock example/android/build example/android/app/build example/ios/Podfile.lock example/ios/Pods example/ios/*.xcworkspace example/ios/build")
    try:    
        os.system("cd " + prebuilt + "/example/android/; pwd; ./gradlew clean")
    except:
        pass

def install_prebuilt_dependencies(prebuilt):
    print("Executing install_prebuilt_dependencies: " + prebuilt)
    os.system("cd " + prebuilt + ";yarn link @zegocloud/zego-uikit-rn;yarn install")
    os.system("cd " + prebuilt + "/example && yarn install && cd ios && pod install && cd ../..")
    os.system("cd ../..")

class Publisher:
    def __init__(self):
        pass

    def start(self):
        print("Executing publish_package...")
        print("\nWhich package do you want to publish:")
        print("1. @zegocloud/zego-uikit-rn")
        print("2. @zegocloud/zego-uikit-prebuilt-call-rn")
        print("3. @zegocloud/zego-uikit-prebuilt-live-audio-room-rn")
        print("4. @zegocloud/zego-uikit-prebuilt-live-streaming-rn")
        print("5. @zegocloud/zego-uikit-prebuilt-video-conference-rn")

        choice = input("Enter your choice (1-5): ")
        if choice == "1":
            self.publish_package(".", "@zegocloud/zego-uikit-rn")
        elif choice == "2":
            self.publish_package("prebuilts/call", "@zegocloud/zego-uikit-prebuilt-call-rn")
        elif choice == "3":
            self.publish_package("prebuilts/live_audio_room", "@zegocloud/zego-uikit-prebuilt-live-audio-room-rn")
        elif choice == "4":
            self.publish_package("prebuilts/live_streaming", "@zegocloud/zego-uikit-prebuilt-live-streaming-rn")
        elif choice == "5":
            self.publish_package("prebuilts/video_conference", "@zegocloud/zego-uikit-prebuilt-video-conference-rn")
        else:
            print("Invalid choice")

    def publish_package(self, package_path, package_name):
        # 组合当前脚本路径及 package_path
        packagejson_file_path = os.path.join(os.getcwd(), package_path, "package.json")
        # 将 package.json 文件拷贝一份为 package.json.back
        os.system("cp " + packagejson_file_path + " " + packagejson_file_path + ".back")
        # 读取 package.json 文件并删除其中的 react-native,source,files.src节点
        packagejson_obj = {}
        with open(packagejson_file_path, "r") as f:
            packagejson_content = f.read()
            packagejson_obj = json.loads(packagejson_content)
            del packagejson_obj["react-native"]
            del packagejson_obj["source"]
            print(packagejson_obj["files"])
            packagejson_obj["files"].remove("src")
        print("\nPreparing package.json for publishing...\n")
        is_beta = input("Is this a beta release? (y/n)[y by default]: ").lower() != 'n'
        current_version = packagejson_obj["version"]
        print("Current version: " + current_version)
        new_version = input("Enter new version:")
        # 如果 is_beta 为 True，且new_version不包含beta字符串，则在new_version结尾添加 -beta
        if is_beta and not "beta" in new_version:
            new_version = new_version + "-beta"
        print("New version: " + new_version)
        packagejson_obj["version"] = new_version
        # 将 packagejson_obj 写入 package.json 文件
        with open(packagejson_file_path, "w") as f:
            f.write(json.dumps(packagejson_obj, indent=4))
            f.close()
        
        # 将版本号写入 package_version.js，代码执行的时候读取
        package_version_js_path = os.path.join(os.getcwd(), package_path, "src/utils/package_version.js")
        with open(package_version_js_path, "w") as f:
            f.write('export const getPackageVersion = () => {return "%s";}; // Avoid manual modification.' % new_version)
            f.close()

        print("\nPublishing package.json...\n")
        if is_beta:
            os.system("cd " + package_path + "; npm publish --tag beta --access public")
        else:
            os.system("cd " + package_path + "; npm publish --access public")
        os.system("mv " + packagejson_file_path + ".back " + packagejson_file_path)
        webbrowser.open("https://www.npmjs.com/package/" + package_name + "?activeTab=versions")

        # package_version.js 还原
        with open(package_version_js_path, "w") as f:
            f.write('export const getPackageVersion = () => {return "undefine";}; // Avoid manual modification.')
            f.close()

        print("Done")

# 定义 __main__ 方法
if __name__ == "__main__":
    list_options()
    print("Done")