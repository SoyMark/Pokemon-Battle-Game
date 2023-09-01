package main

import (
	"strconv"
)

func select_make(info Pokemon_info) string {
	str := "select* from pokemon "
	tag := 0 //用来判断语句是否要加and
	if info.Id != "0" {
		if tag != 0 {
			str += " and"
		} else {
			str+="where"
			tag = 1
		}
		str += " pokemon_id= '" + info.Id + "'"
	}
	if info.Name != "0" {
		if tag != 0 {
			str += " and"
		} else {
			str+="where"
			tag = 1
		}
		str += " pokemon_name= '" + info.Name + "'"
	}
	if info.Property1 != "0" {
		if tag != 0 {
			str += " and"
		} else {
			str+="where"
			tag = 1
		}
		str += " property= '" + info.Property1 + "'"
	}
	if info.Property2 != "0" {
		if tag != 0 {
			str += " and"
		} else {
			str+="where"
			tag = 1
		}
		str += " sec_property= '" + info.Property2 + "'"
	}
	if info.Attack != 0 {
		if tag != 0 {
			str += " and"
		} else {
			str+="where"
			tag = 1
		}
		str += "\nattack=" + strconv.Itoa(info.Attack)
	}
	if info.Special_Attack != 0 {
		if tag != 0 {
			str += " and"
		} else {
			str+="where"
			tag = 1
		}
		str += " special_attack=" + strconv.Itoa(info.Special_Attack)
	}
	if info.Defense != 0 {
		if tag != 0 {
			str += " and"
		} else {
			str+="where"
			tag = 1
		}
		str += " defense=" + strconv.Itoa(info.Defense)
	}
	if info.Special_Defense != 0 {
		if tag != 0 {
			str += " and"
		} else {
			str+="where"
			tag = 1
		}
		str += " special_defense=" + strconv.Itoa(info.Special_Defense)
	}
	if info.Health != 0 {
		if tag != 0 {
			str += " and"
		} else {
			str+="where"
			tag = 1
		}
		str += " health=" + strconv.Itoa(info.Health)
	}
	if info.Speed != 0 {
		if tag != 0 {
			str += " and"
		} else {
			str+="where"
			tag = 1
		}
		str += " speed=" + strconv.Itoa(info.Speed)
	}
	return str
}

func pokemon_select(info Pokemon_info) ([1000]Pokemon_info, int) {
	sentense := select_make(info)
	rows, err := db.Query(sentense)
	checkErr(err)
	//if wrong!=0 {return} &point,
	var infos [1000]Pokemon_info
	i := 0
	for rows.Next() {
		err = rows.Scan(&infos[i].Id, &infos[i].Name, &infos[i].Property1,
			&infos[i].Attack, &infos[i].Special_Attack, &infos[i].Defense, &infos[i].Special_Defense,
			&infos[i].Speed, &infos[i].Health, &infos[i].Property2)
		i += 1
	}
	return infos, i
}
