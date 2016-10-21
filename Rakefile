# coding: utf-8
require 'yaml'
require 'open3'

CONFIG = YAML.load_file("_config.yml")

dest_dir = CONFIG['destination'] || "/tmp/jekyll_#{File.basename(__dir__)}"
message = 'committing new build'
git_branch = CONFIG['git']['branch']
git_repo = CONFIG['git']['repo']

task :clean do
  if Dir.exists? dest_dir
    Dir.chdir dest_dir do
      system "git rm -r -f -q ."
    end
  else
    Rake::Task[:initialize_dest].invoke
  end
end

task :initialize_dest do
  system "git clone --verbose --branch #{git_branch} --single-branch #{git_repo} #{dest_dir}"
end

task :build => :clean do
  system "jekyll build --destination #{dest_dir}"
end

task :serve do
  Rake::Task[:build].invoke unless File.exists?("#{dest_dir}/index.html")

  system "jekyll serve --destination #{dest_dir}"
end

task :deploy do
  Rake::Task[:build].invoke unless File.exists?("#{dest_dir}/index.html")

  message = commit_message dest_dir

  Dir.chdir dest_dir do
    system "git add --all ."
    system "git commit -m \"#{message}\""
    system "git push -u origin #{git_branch}"
  end
end

task :diff do
  Rake::Task[:build].invoke unless File.exists?("#{dest_dir}/index.html")

  Dir.chdir dest_dir do
    system "git reset HEAD ."
    system "git diff"
  end
end

task :commit_message do
  puts commit_message dest_dir
end

def commit_message dest_dir
  date = ""
  hash = ""
  Dir.chdir dest_dir do
    date = syscall "git show --format=format:%ci -s"
    hash = syscall "git show --format=format:%H -s"
  end
  message = syscall "git log --since='#{date}'"
  message = "new build including following commits since #{date} (#{hash}):\n\n#{message}"
  message
end

def syscall(*cmd)
  #begin
    stdout, stderr, status = Open3.capture3(*cmd)
    status.success? && stdout.slice!(0..-(1 + $/.size)) # strip trailing eol
  #rescue
  #end
end
