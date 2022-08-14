PROJECT_ROOT=zego-uikit-rn

rm -rf $PROJECT_ROOT
rm -rf $PROJECT_ROOT.zip

mkdir $PROJECT_ROOT
cp -r android $PROJECT_ROOT
rm -rf $PROJECT_ROOT/android/build
rm -f $PROJECT_ROOT/android/local.properties
cp -r ios $PROJECT_ROOT
rm -rf $PROJECT_ROOT/ios/build
cp -r lib $PROJECT_ROOT
cp LICENSE $PROJECT_ROOT
cp -r package.json $PROJECT_ROOT
cp zego-uikit-rn.podspec
cp *.md $PROJECT_ROOT
cp -r src $PROJECT_ROOT

zip -r $PROJECT_ROOT.zip $PROJECT_ROOT
rm -rf $PROJECT_ROOT