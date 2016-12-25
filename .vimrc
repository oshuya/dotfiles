syntax on
hi Comment ctermfg=Cyan

set number
set title
set ruler
set tabstop=2
set paste
set list
set listchars=tab:»-,trail:-,eol:↲,extends:»,precedes:«,nbsp:%
set smartindent
set incsearch
set hlsearch
set showmatch
set ignorecase
set smartcase
set hidden
set whichwrap+=h,l,<,>,[,],b,s
set mouse=a
set ttymouse=xterm2
set backspace=indent,eol,start

"ocaml
set rtp^="/Users/Shuya/.opam/system/share/ocp-indent/vim"
let g:opamshare = substitute(system('opam config var share'),'\n$','','''')
execute 'set rtp+=' . g:opamshare . '/merlin/vim'

