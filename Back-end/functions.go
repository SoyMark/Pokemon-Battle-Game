package main

import (
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"fmt"
)

//用户在仓库里点击查看宝可梦的完整信息
func pokemon_details(id string) (Pokemon_info, [4]Skill_info) {
	var info Pokemon_info
	var s1 string
	var s2 string
	var s3 string
	var s4 string
	var mynil sql.NullString
	rows, err := db.Query("select* from pokemon_detail where pokemon_id = '" + id + "';")
	//pokemon_details 是数据库的里的一个视图，具体定义见解释
	checkErr(err)
	for rows.Next() {
		rows.ColumnTypes()
		err = rows.Scan(&info.Id, &info.Name, &info.Property1,
			&info.Attack, &info.Special_Attack, &info.Defense,
			&info.Special_Defense, &info.Health, &info.Speed, &info.Property2, &s1, &s2, &s3, &s4)
		if err!=nil{
			rows.Scan(&info.Id, &info.Name, &info.Property1,
				&info.Attack, &info.Special_Attack, &info.Defense,
				&info.Special_Defense, &info.Health, &info.Speed, &mynil, &s1, &s2, &s3, &s4)
		}
	}
	var ret [4]Skill_info
	ret[0] = get_skills_details(s1)
	ret[1] = get_skills_details(s2)
	ret[2] = get_skills_details(s3)
	ret[3] = get_skills_details(s4)
	return info, ret
}

func get_skills_details(skill_name string) Skill_info {
	str := "select skill_name, skill_type from skill where skill_name = '" + skill_name + "';"
	var info Skill_info
	var mynil sql.NullString
	rows := db.QueryRow(str)
	err := rows.Scan(&info.Skill_name, &info.Skill_type)
	str = "select* from skill where skill_name = '" + skill_name + "';"
	rows2 :=db.QueryRow(str)
	if info.Skill_type == 0 { // 说明是攻击型金技能
		err = rows2.Scan(&info.Skill_name, &info.Skill_type, &info.Attack_type,
			&info.Attack_power, &info.Self_damage, &info.Attribute, &mynil, &mynil)
		fmt.Println(err)
	} else if info.Skill_type == 1 {
		err = rows2.Scan(&info.Skill_name, &info.Skill_type, &mynil, &mynil,
			&mynil, &mynil, &info.Effect_id, &info.Effect_result)
		fmt.Println(err)
	}
	return info
}

func encode_password(code string) string{
	encode := sha256.Sum256([]byte(code))
	hashcode:=hex.EncodeToString(encode[:])
	return hashcode
}
