package main

import (
	"strconv"
)

func pokemon_insert_make(info Pokemon_info) string{
	str:="insert into pokemon values("
	str+="'" + info.Id + "', "
	str+="'" + info.Name + "', "
	str+="'" + info.Property1 + "', "
	str+=strconv.Itoa(info.Attack)+", "
	str+=strconv.Itoa(info.Special_Attack)+", "
	str+=strconv.Itoa(info.Defense)+", "
	str+=strconv.Itoa(info.Special_Defense)+", "
	str+=strconv.Itoa(info.Health)+", "
	str+=strconv.Itoa(info.Speed)
	if info.Property2 != "0" {
		str+=", '" + info.Property2 + "'"
	}
	str+=");"
	return str
}

func pokemon_insert(info Pokemon_info) int{
	str:=pokemon_insert_make(info)
	_,err:=db.Query(str)
	checkErr(err)
	if err==nil {
		return 1
	}else{
		return 0
	}
}

