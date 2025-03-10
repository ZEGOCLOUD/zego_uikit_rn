require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "zego-uikit-rn"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => "13.0" }
  s.source       = { :path => '.' }

  s.source_files = "ios/**/*.{h,c,m,mm,swift}"
  s.requires_arc = true

  s.dependency "React-Core"
  s.dependency 'ZegoUIKitReport', '0.2.10'
  
end
