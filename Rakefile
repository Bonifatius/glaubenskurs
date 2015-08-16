# coding: utf-8
require 'yaml'

dest_dir = "/tmp/jekyll_#{File.basename(__dir__)}"

CONFIG = YAML.load_file("_config.yml")

git_repo = 'git@github.com:Bonifatius/glaubenskurs.git'
git_branch = 'gh-pages'
message = 'committing new build'

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

  system "jekyll serve --destination #{dest_dir} &"
end

task :deploy do
  Rake::Task[:build].invoke unless File.exists?("#{dest_dir}/index.html")

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
