Rider 的一些设置

关闭跳转源码的反编译。

~~~tex
Tools > External Symbols > Decompile methods
~~~

PyCharm 会出现输入空格就插入代码提示内容，非常烦人

![image-20220905002046652](https://newbility523-1252413540.cos.ap-guangzhou.myqcloud.com/PicBedimage-20220905002046652.png)

.ideaVim

```vim
let mapleader=" "

" Don't use Ex mode, use Q for formatting.
map Q gq

""" Common settings -------------------------
set showmode
set scrolloff=5
set incsearch
set relativenumber 
set clipboard+=unnamed
"" didn't work, fixed this
set ideajoin

"Plug 'preservim/nerdtree`
set NERDTree
nnoremap gp :NERDTree <CR>

nnoremap <leader>ww :action HideAllWindows <CR>

nnoremap L $
nnoremap H ^
vnoremap L $
vnoremap H ^

""" Strict mode for development ---------------
set ideastrictmode
" highlighted yank
Plug 'machakann/vim-highlightedyank'

" Don't use Ex mode, use Q for formatting.
map Q gq

""" My Mappings -----------------------------
Plug 'easymotion/vim-easymotion'
"" navigation by searching in this file
map <leader><leader>f <Plug>(easymotion-f)
"" navigation by word, forward (w)
map <leader><leader>w <Plug>(easymotion-w)
"" navigation by word, before (b)
map <leader><leader>b <Plug>(easymotion-b)

""" Common settings -------------------------
set showmode
set scrolloff=5
set incsearch
set relativenumber 

nmap gb <Action>(Back)
nmap gD <Action>(GotoTypeDeclaration)
nmap gf <Action>(Forward)
nmap gl <Action>(QuickJavaDoc)
"nmap gL <Action>(QuickImplementations)
"nmap gy <Action>(ShowErrorDescription)

" Reformat the current line only
"" supported one/multi lines
map <leader>fl V<Action>(ReformatCode)
" Reformat this file
map <leader>ff <Action>(ReformatCode)

map <leader>b <Action>(ToggleLineBreakpoint)
map <leader>d <Action>(Debug)
map <leader>r <Action>(RenameElement)
map <leader>c <Action>(Stop)
map <leader>z <Action>(ToggleDistractionFreeMode) 

" split window
nnoremap <leader>sv :action SplitVertically <CR>
nnoremap <leader>sc :action UnsplitAll <CR>
nnoremap <leader>wh :action PrevSplitter <CR>
nnoremap <leader>wl :action NextSplitter <CR>
" close tab
nnoremap <leader>wq :action CloseEditor <CR>
" close all tabs
nnoremap <leader>waq :action CloseAllEditors <CR> 

" tabs
nmap <C-h> :action PreviousTab<CR>
nmap <C-l> :action NextTab<CR>
nmap <leader>q :action CloseEditor<CR>
" nnoremap <leader>c :action CloseContent <CR>

"map <leader>1 <Action>(SelectInProjectView)
nnoremap ,e :action SearchEverywhere <CR>
nnoremap gr :action RecentFiles <CR>
nnoremap <leader>ss :action SelectInProjectView<CR>


""" Strict mode for development ---------------
set ideastrictmode

" Find more examples here: https://jb.gg/share-ideavimrc

```

