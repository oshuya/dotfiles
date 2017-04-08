#!/usr/local/bin/zsh

DOT_FILES=(.zshrc .Rprofile .gitconfig .ocamlinit .vimrc .viminfo .zsh_history .gitignore_global)

for file in ${DOT_FILES[@]} 
do
    ln -s $HOME/dotfiles/$file $HOME/$file
done
