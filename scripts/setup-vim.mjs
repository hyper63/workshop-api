#!/usr/bin/env zx

await $`cp .vimrc ~/.vimrc`

await $`vim +'PlugInstall --sync' +qa`

await $`echo 'VIM is setup'`