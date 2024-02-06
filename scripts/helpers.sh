function select_option {
  ESC=$( printf "\033")
  cursor_blink_on()  { printf "$ESC[?25h"; }
  cursor_blink_off() { printf "$ESC[?25l"; }
  cursor_to()        { printf "$ESC[$1;${2:-1}H"; }
  print_option()     { printf "$1 "; }
  print_selected()   { printf "$ESC[7m$1 $ESC[27m"; }
  get_cursor_row()   { IFS=';' read -sdR -p $'\E[6n' ROW COL; echo ${ROW#*[}; }
  key_input()        { read -s -n3 key 2>/dev/null >&2
                       if [[ $key = $ESC[A ]]; then echo up;    fi
                       if [[ $key = $ESC[B ]]; then echo down;  fi
                       if [[ $key = ""     ]]; then echo enter; fi; }

  for opt; do printf "\n"; done

  local lastrow=`get_cursor_row`
  local startrow=$(($lastrow - $#))

  trap "cursor_blink_on; stty echo; printf '\n'; exit" 2
  cursor_blink_off

  local selected=0
  while true; do
    local idx=0
      for opt; do
        cursor_to $(($startrow + $idx))
        if [ $idx -eq $selected ]; then
          print_selected "$opt"
        else
          print_option "$opt"
        fi
        ((idx++))
      done

      case `key_input` in
        enter) break;;
        up)    ((selected--));
      if [ $selected -lt 0 ]; then selected=$(($# - 1)); fi;;
        down)  ((selected++));
      if [ $selected -ge $# ]; then selected=0; fi;;
    esac
  done

  cursor_to $lastrow
  printf "\n"
  cursor_blink_on

  return $selected
}

function select_option_multiple {
  ESC=$( printf "\033")
  cursor_blink_on()   { printf "$ESC[?25h"; }
  cursor_blink_off()  { printf "$ESC[?25l"; }
  cursor_to()         { printf "$ESC[$1;${2:-1}H"; }
  print_inactive()    { printf "$2  $1 "; }
  print_active()      { printf "$2 $ESC[7m $1 $ESC[27m"; }
  get_cursor_row()    { IFS=';' read -sdR -p $'\E[6n' ROW COL; echo ${ROW#*[}; }
  key_input()         {
    local key
    IFS= read -rsn1 key 2>/dev/null >&2
    if [[ $key = ""      ]]; then echo enter; fi;
    if [[ $key = $'\x20' ]]; then echo space; fi;
    if [[ $key = $'\x1b' ]]; then
      read -rsn2 key
      if [[ $key = [A ]]; then echo up;    fi;
      if [[ $key = [B ]]; then echo down;  fi;
    fi
  }
  toggle_option()    {
    local arr_name=$1
    eval "local arr=(\"\${${arr_name}[@]}\")"
    local option=$2
    if [[ ${arr[option]} == true ]]; then
      arr[option]=false
    else
      arr[option]=true
    fi
    eval $arr_name='("${arr[@]}")'
  }

  local retval=$1
  local options
  local defaults

  IFS=';' read -r -a options <<< "$2"
  if [[ -z $3 ]]; then
    defaults=()
  else
    IFS=';' read -r -a defaults <<< "$3"
  fi
  local selected=()

  for ((i=0; i<${#options[@]}; i++)); do
    selected+=("${defaults[i]}")
    printf "\n"
  done

  # determine current screen position for overwriting the options
  local lastrow=`get_cursor_row`
  local startrow=$(($lastrow - ${#options[@]}))

  # ensure cursor and input echoing back on upon a ctrl+c during read -s
  trap "cursor_blink_on; stty echo; printf '\n'; exit" 2
  cursor_blink_off

  local active=0
  while true; do
    local idx=0
    for option in "${options[@]}"; do
      local prefix="◻"
      if [[ ${selected[idx]} == true ]]; then
        prefix="◼"
      fi

      cursor_to $(($startrow + $idx))
      if [ $idx -eq $active ]; then
        print_active "$option" "$prefix"
      else
        print_inactive "$option" "$prefix"
      fi
        ((idx++))
      done

      case `key_input` in
        space)  toggle_option selected $active;;
        enter)  break;;
        up)     ((active--));
                if [ $active -lt 0 ]; then active=$((${#options[@]} - 1)); fi;;
        down)   ((active++));
                if [ $active -ge ${#options[@]} ]; then active=0; fi;;
    esac
  done

  cursor_to $lastrow
  printf "\n"
  cursor_blink_on

  eval $retval='("${selected[@]}")'
}

function echo_color {
  echo "$(tput setaf $2)$1$(tput sgr 0)"
}

function select_label {
  echo "$(tput setaf 12)"
  echo "$1"
  echo "$(tput sgr 0)"
}

function error_label {
  echo "$(tput setaf 3)"
  echo "$1$(tput sgr 0)"
}

function extract_variable {
  variable="$(echo $1 | sed 's=/=\\/=g')"
  string="{$2}"
  content="$(cat $3)"

  sed -i -- "s/$string/$variable/g" $3
}

function get_git_branch {
  echo $(git rev-parse --abbrev-ref HEAD)
}

function get_git_build {
  echo $(git rev-list HEAD --count)
}

function get_db_container {
  docker ps -aqf "name=$1"
}

function get_db_user {
  value=$(jq ".services | .backend | .environment | .DB_USER" $DIR_ROOT/projects/$1/config.json)

  echo $value | sed "s/\"//g"
}

function get_db_pass {
  value=$(jq ".services | .backend | .environment | .DB_PASS" $DIR_ROOT/projects/$1/config.json)

  echo $value | sed "s/\"//g"
}

function get_db_name {
  value=$(jq ".services | .backend | .environment | .DB_NAME" $DIR_ROOT/projects/$1/config.json)

  echo $value | sed "s/\"//g"
}

function get_db_host {
  value=$(jq ".services | .backend | .environment | .DB_HOST" $DIR_ROOT/projects/$1/config.json)

  echo $value | sed "s/\"//g"
}

function validate {
  if $1; then
    echo "$(tput setaf 10)"
    echo "Success"
    echo "$(tput sgr 0)"
  else
    echo
    echo "$(tput setaf 1)"
    echo "Failure"
    echo "$(tput sgr 0)"
  fi
}
