syntax on
hi Comment ctermfg=Cyan

set number
set title
set ruler
set tabstop=2
set paste
set list
<<<<<<< HEAD
set listchars=tab:»-,trail:-,eol:↲,extends:»,precedes:«,nbsp:%
=======
>>>>>>> 1206f8a637f251f706e4ffaaa1c9802d0f061e42
set smartindent
set incsearch
set hlsearch
set showmatch
set ignorecase
set smartcase
set hidden
<<<<<<< HEAD
set whichwrap+=h,l,<,>,[,],b,s
=======
set whichwrap=b,s,[,],<,>
>>>>>>> 1206f8a637f251f706e4ffaaa1c9802d0f061e42

"ocaml
set rtp^="/Users/Shuya/.opam/system/share/ocp-indent/vim"
let g:opamshare = substitute(system('opam config var share'),'\n$','','''')
execute 'set rtp+=' . g:opamshare . '/merlin/vim'

