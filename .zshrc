# 環境変数
export LANG=ja_JP.UTF-8

# 色を使用出来るようにする
autoload -Uz colors
colors

# 保管機能
autoload -U compinit
compinit
zstyle ':completion:*:default' menu select=2

# AutoCD
setopt auto_cd
setopt autopushd
setopt pushd_ignore_dups

# 補完関数の表示を強化する
zstyle ':completion:*' verbose yes
zstyle ':completion:*' completer _expand _complete _match _prefix _approximate _list _history
zstyle ':completion:*:messages' format '%F{YELLOW}%d'$DEFAULT
zstyle ':completion:*:warnings' format '%F{RED}No matches for:''%F{YELLOW} %d'$DEFAULT
zstyle ':completion:*:descriptions' format '%F{YELLOW}completing %B%d%b'$DEFAULT
zstyle ':completion:*:options' description 'yes'
zstyle ':completion:*:descriptions' format '%F{yellow}Completing %B%d%b%f'$DEFAULT

# マッチ種別を別々に表示
zstyle ':completion:*' group-name ''

# ヒストリの設定
HISTFILE=~/.zsh_history
HISTSIZE=1000000
SAVEHIST=1000000

# コマンドプロンプト
## PROMPT="%{${fg[green]}%}[%m@%d]%{${reset_color}%} 
## $ "
local p_cdir="%B%F{green}[%~]%f%b"$'\n'
local p_info="%{${fg[cyan]}%}%m@%{${reset_color}%}%{${fg[white]}%}%B%n%b%{${reset_color}%}"
PROMPT="$p_cdir$p_info %{${fg[cyan]}%}$ %{${reset_color}%}"

# git
autoload -Uz vcs_info
precmd_vcs_info() { vcs_info }
precmd_functions+=( precmd_vcs_info )
setopt prompt_subst
zstyle ':vcs_info:git:*' check-for-changes true
zstyle ':vcs_info:git:*' stagedstr "%F{yellow}!"
zstyle ':vcs_info:git:*' unstagedstr "%F{red}+"
zstyle ':vcs_info:*' formats "%F{green}%c%u[%b]%f"
zstyle ':vcs_info:*' actionformats '[%b|%a]'
precmd () { vcs_info }
RPROMPT=\$vcs_info_msg_0_

## color設定
export LSCOLORS=exfxcxdxbxegedabagacad
zstyle ':completion:*' list-colors di=34 ln=35 ex=31
zstyle ':completion:*:kill:*' list-colors \
   '=(#b) #([0-9]#)*( *[a-z])*=34=31=33'

   ## 一覧表示の形式設定
   zstyle ':completion:*' group-name ''
   zstyle ':completion:*:descriptions' format '%BCompleting%b %U%d%u'
alias ls="ls -GF"

## rbenv
export PATH="$HOME/.rbenv/bin:$PATH"
eval "$(rbenv init -)"

## go
export GOPATH=$HOME/.go
export PATH=$PATH:$GOPATH/bin

## alias
alias desk='cd ~/Desktop'
alias Extensions="/Users/Shuya/Library/Application\ Support/Google/Chrome/Default/Extensions"
alias pdf="LANG=C LC_ALL=C sed -i '' s'|/Registry (Adobe) /Ordering (Japan1) /Supplement [0-9]|/Registry(Adobe) /Ordering(Identity) /Supplement 0|g'"

## ssh
alias cns='ssh -4 s14217so@ccz01.sfc.keio.ac.jp'
alias wide='ssh shuya@cpu.sfc.wide.ad.jp'
alias sakura='ssh -i ~/.ssh/id_rsa  shuya@160.16.125.226 -p 6666'
alias webedit='cocot -t UTF-8 -p EUC-JP ssh -4 s14217so@webedit.sfc.keio.ac.jp'
alias eucaly='ssh consul@eucaly.sfc.keio.ac.jp'

## alias
alias g='git'
alias dev='cd ~/Desktop/dev'
alias goquic='GOMAXPROCS=8 ./server -n 8 -port 8080 -cert cert1.crt -key cert1.key -quic_only -addr \[::\] -root ./public/public/'
alias ocaml="rlwrap ocaml"

# OPAM configuration
. /Users/Shuya/.opam/opam-init/init.zsh > /dev/null 2> /dev/null || true
