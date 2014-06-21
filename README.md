## githooks


githooks is a tool help you build custom hooks of git easier.


##### Note

It was wrote by Node.js, so you should install [nodejs](http://nodejs.org/download/) at first.

***

### Table of contents

#### Quick start

* [Installation](#installation)
* [Usage]() 
* [Examples]()

#### More

* [License]()


### Quick start

#### Installation

```
npm install githooks -g
```

The command is "git-hooks", so you can call "git hooks" to run.

#### Usage

```
  Usage: git-hooks <cmd> [hook]

  Commands:

    configure [options]    configure your workspace
    install <hook>         install a hook
    autoinstall            auto install hooks based on your ".githooks" config
    remove <hook>          remove a hook
    clean                  clean all hooks
    list                   list all hooks
    *                     

  Options:

    -h, --help              output usage information
    -V, --version           output the version number
    -w, --workspace <path>  set the boot directory of the workspace. defaults to the current
    -c, --config <path>     specify a .githooks
    -f, --force             force to do

  Usage Examples:

    Install a "pre-commit" hook:
    $ git-hooks install pre-commit

    Remove a "pre-commit" hook:
    $ git-hooks remove pre-commit

    Remove all hooks:
    $ git-hooks clean

    List all hooks:
    $ git-hooks list

  Note:

    set a ".githooks" into your workspace, or use -c to specify one before installing githooks!
```


#### Example

get into your workspace

```
cd /your/workspace/
```

init a new empty .githooks file

```
git hooks configure –i
```
modify .githooks file 

```
vi .githooks
```

```
module.exports = function(githooks) {
	githooks
		.hook('pre-commit')
		.rule({
			'index': 'index.html'
		})
		.on('match:index', function(files) {
			console.log(files); // output ['index.html'] while "index.html" is committing
		});
};
```

test your .githooks file

```
git hooks configure –t
```

install your hooks into git

```
git hooks autoinstall
```



### More

#### License
MIT



