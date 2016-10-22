:syntax on
hi Comment ctermfg=Cyan
"ocaml
set rtp^="/Users/Shuya/.opam/system/share/ocp-indent/vim"
let g:opamshare = substitute(system('opam config var share'),'\n$','','''')
execute 'set rtp+=' . g:opamshare . '/merlin/vim'

