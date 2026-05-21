ENV["BUNDLE_GEMFILE"] ||= File.expand_path("../Gemfile", __dir__)

def load_local_env_file(path)
  return unless File.file?(path)

  File.foreach(path, chomp: true) do |line|
    next if line.empty? || line.lstrip.start_with?("#")

    key, value = line.split("=", 2)
    next if key.to_s.empty? || value.nil? || ENV.key?(key)

    ENV[key] = value.gsub(/\A['"]|['"]\z/, "")
  end
end

app_root = File.expand_path("..", __dir__)
load_local_env_file(File.join(app_root, ".env"))
load_local_env_file(File.join(app_root, ".env.local"))

require "bundler/setup"
