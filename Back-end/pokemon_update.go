package main

import (
	"fmt"
	"strconv"
)

func update_make(new Pokemon_info)string{
	str:="update pokemon\n" + "set "
	str+="pokemon_name=" + "'" + new.Name + "', "
	str+="property=" + "'" + new.Property1 + "', "
	str+="attack=" + strconv.Itoa(new.Attack)+", "
	str+="special_attack=" + strconv.Itoa(new.Special_Attack)+", "
	str+="defense=" + strconv.Itoa(new.Defense)+", "
	str+="special_defense=" + strconv.Itoa(new.Special_Defense)+", "
	str+="health=" + strconv.Itoa(new.Health)+", "
	str+="speed=" + strconv.Itoa(new.Speed)
	if new.Property2 != "0" {
		str+= "," + "sec_property= '" + new.Property2 + "'"
	}
	str+="where pokemon_id = '" + new.Id + "'"
	fmt.Println(str)
	return str
}

//如果有这个宝可梦就更新信息，没有就加入这个宝可梦
func pokemon_update(new Pokemon_info) int{
	str := "select pokemon_id from pokemon where pokemon_id='" + new.Id + "';"
	rows, err := db.Query(str)
	checkErr(err)
	tag := 0
	for rows.Next() {//如果rows内容为空会直接不满足循环条件
		tag = 1
	}
	if tag == 0 { //说明没有这个宝可梦，需要插入
		i:=pokemon_insert(new)
		if i==1 {
			return 1
		}else{
			return 0
		}
	} else { //说明有这个宝可梦，只需更改
		sentense:=update_make(new)
		rows,err:=db.Query(sentense)
		checkErr(err)
		if rows == nil {} //防止rows没用到报错
		if err==nil {
			return 1
		}else{
			return 0
		}
	}
}

func make_pokemon_info(id string, name string, property1 string, property2 string, attack int, special_attack int, defense int, special_defense int, health int,speed int) Pokemon_info{
	var info Pokemon_info
	info.Id = id
	info.Name = name
	info.Property1 = property1
	info.Property2 = property2
	info.Attack = attack
	info.Special_Attack = special_attack
	info.Defense = defense
	info.Special_Defense = special_defense
	info.Health = health
	info.Speed = speed
	return info
}

