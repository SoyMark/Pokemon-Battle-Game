package main

import (
	"database/sql"
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
)

//宝可梦图鉴，返回宝可梦所有信息，前端根据需要显示
func Select_handler(c *gin.Context) {
	var info Pokemon_info
	c.ShouldBindJSON(&info)
	fmt.Println(info)
	if info.Id == "" {
		info.Id = "0"
	}
	if info.Name == "" {
		info.Name = "0"
	}
	if info.Property1 == "" {
		info.Property1 = "0"
	}
	if info.Property2 == "" {
		info.Property2 = "0"
	}
	//由于GO语言的struct无法赋初值，只好在这里设置初值
	infos, i := pokemon_select(info)
	var my_slice []Pokemon_info
	for j := 0; j < i; j++ {
		my_slice = append(my_slice, infos[j])
	}
	c.IndentedJSON(200, my_slice) //以json数组格式返还给前端
}

func Insert_handler(c *gin.Context) {
	var info Pokemon_info
	c.ShouldBindJSON(&info)
	if info.Id == "" {
		info.Id = "0"
	}
	if info.Name == "" {
		info.Name = "0"
	}
	if info.Property1 == "" {
		info.Property1 = "0"
	}
	if info.Property2 == "" {
		info.Property2 = "0"
	}
	result := pokemon_insert(info)
	if result == 1 {
		c.String(http.StatusOK, "insert successfully!")
	} else {
		c.String(http.StatusNotAcceptable, "fail to delete")
	}
}

func Update_handler(c *gin.Context) {
	var info Pokemon_info
	c.ShouldBindJSON(&info)
	result := pokemon_update(info)
	if result == 1 {
		c.String(http.StatusOK, "delete successfully!")
	} else {
		c.String(http.StatusNotAcceptable, "fail to delete")
	}
}

func Delete_handler(c *gin.Context) {
	var info Pokemon_info
	c.ShouldBindJSON(&info)
	result := pokemon_delete(info.Id)
	if result == 1 {
		c.String(http.StatusOK, "delete successfully!")
	} else {
		c.String(http.StatusNotAcceptable, "fail to delete")
	}
}

func Create_role_handler(c *gin.Context) {
	var user User_info
	c.ShouldBindJSON(&user)
	user.Id = "user_" + user.Id
	user.Password = encode_password(user.Password)
	err2 := create_role(user)
	if err2 == nil {
		c.String(http.StatusOK, "create a role successfully")
	} else {
		c.String(http.StatusNotAcceptable, "fail to create a role")
	}
}

//登录
func Login_handler(c *gin.Context) {
	c.ShouldBindJSON(&user)
	if user.Id!="postgres" && user.Id!= "ssyl" {
		user.Id = "user_" + user.Id
		user.Password = encode_password(user.Password)
	}
	db, err = login(user, "DataBasePJ")
	if err != nil {
		c.String(http.StatusNotAcceptable, "登录失败")
	} else {
		var poke_id [6]string
		var catch_time [6]string
		i := 0
		rows3, err := db.Query("select pokemon_id, catch_time from " + user.Id + "_backpack;")
		for rows3.Next() {
			rows3.Scan(&poke_id[i],&catch_time[i])
			i++
		}
		fmt.Println(poke_id)
		checkErr(err)
		var result Result
		var poke_info Pokemon_info_withskill
		for j := 0; j < i; j++ {
			poke_info.info, poke_info.skill = pokemon_details(poke_id[j])
			result.pokemons = append(result.pokemons, poke_info)
		}
		c.String(http.StatusOK, "[")
		fmt.Println(result)
		for j := 0; j < len(result.pokemons); j++ {
			c.JSON(http.StatusOK, gin.H{
				"id":              result.pokemons[j].info.Id,
				"name":            result.pokemons[j].info.Name,
				"property1":       result.pokemons[j].info.Property1,
				"property2":       result.pokemons[j].info.Property2,
				"attack":          result.pokemons[j].info.Attack,
				"special_attack":  result.pokemons[j].info.Special_Attack,
				"defense":         result.pokemons[j].info.Defense,
				"special_defense": result.pokemons[j].info.Special_Defense,
				"health":          result.pokemons[j].info.Health,
				"speed":           result.pokemons[j].info.Speed,
				"catch_time":	   catch_time[j],

				"skill_name1":    result.pokemons[j].skill[0].Skill_name,
				"skill_type1":    result.pokemons[j].skill[0].Skill_type,
				"attack_type1":   result.pokemons[j].skill[0].Attack_type,
				"attack_power1":  result.pokemons[j].skill[0].Attack_power,
				"self_damage1":   result.pokemons[j].skill[0].Self_damage,
				"attribute1":     result.pokemons[j].skill[0].Attribute,
				"effect_id1":     result.pokemons[j].skill[0].Effect_id,
				"effect_result1": result.pokemons[j].skill[0].Effect_result,

				"skill_name2":    result.pokemons[j].skill[1].Skill_name,
				"skill_type2":    result.pokemons[j].skill[1].Skill_type,
				"attack_type2":   result.pokemons[j].skill[1].Attack_type,
				"attack_power2":  result.pokemons[j].skill[1].Attack_power,
				"self_damage2":   result.pokemons[j].skill[1].Self_damage,
				"attribute2":     result.pokemons[j].skill[1].Attribute,
				"effect_id2":     result.pokemons[j].skill[1].Effect_id,
				"effect_result2": result.pokemons[j].skill[1].Effect_result,

				"skill_name3":    result.pokemons[j].skill[2].Skill_name,
				"skill_type3":    result.pokemons[j].skill[2].Skill_type,
				"attack_type3":   result.pokemons[j].skill[2].Attack_type,
				"attack_power3":  result.pokemons[j].skill[2].Attack_power,
				"self_damage3":   result.pokemons[j].skill[2].Self_damage,
				"attribute3":     result.pokemons[j].skill[2].Attribute,
				"effect_id3":     result.pokemons[j].skill[2].Effect_id,
				"effect_result3": result.pokemons[j].skill[2].Effect_result,

				"skill_name4":    result.pokemons[j].skill[3].Skill_name,
				"skill_type4":    result.pokemons[j].skill[3].Skill_type,
				"attack_type4":   result.pokemons[j].skill[3].Attack_type,
				"attack_power4":  result.pokemons[j].skill[3].Attack_power,
				"self_damage4":   result.pokemons[j].skill[3].Self_damage,
				"attribute4":     result.pokemons[j].skill[3].Attribute,
				"effect_id4":     result.pokemons[j].skill[3].Effect_id,
				"effect_result4": result.pokemons[j].skill[3].Effect_result,
			})
			if j<len(result.pokemons)-1{
				c.String(http.StatusOK, ",\n")
			}
		}
		c.String(http.StatusOK, "]\n")
	}
}

func User_info_handler(c *gin.Context){
	rows5, err := db.Query("select user_name, user_money from user_info where user_id = '" + user.Id + "';")
	checkErr(err)
	var name string
	var money int
	for rows5.Next() {
		rows5.Scan(&name, &money)
	}
	rows2, err := db.Query("select count(*) from " + user.Id + "_warehouse;")
	checkErr(err)
	var num int
	for rows2.Next() {
		rows2.Scan(&num)
	}
	if err != nil {
		c.String(http.StatusNotAcceptable, "登录失败")
	} else {
		c.JSON(http.StatusOK, gin.H{
			"id":          user.Id,
			"name":        name,
			"pokemon_num": num,
			"money":       money,
		})
	}
}

//放生
func Poke_free_handler(c *gin.Context) {
	var free Id_time
	c.ShouldBindJSON(&free)
	err := user_pokemon_delete(user.Id, free.Id, free.Catch_time)
	if err == nil {
		c.String(http.StatusOK, "放生成功")
	} else {
		c.String(http.StatusNotAcceptable, "放生失败")
	}
}

//返回用户仓库里的信息
type warehouse_struct struct {
	Pokemon_id   string
	Pokemon_name string
	Property     string
	Catch_time   string
	Property2	 string
}

func Warehouse_handler(c *gin.Context) {
	user_warehosue := user.Id + "_warehouse"
	str := "select pokemon_id, pokemon_name, catch_time, property, sec_property from " + user_warehosue + " natural join pokemon"
	rows, err := db.Query(str)
	i := 0
	var temp warehouse_struct
	var my_slice []warehouse_struct
	var null sql.NullString
	for rows.Next() {
		err2:=rows.Scan(&temp.Pokemon_id, &temp.Pokemon_name, &temp.Catch_time, &temp.Property, &temp.Property2)
		if(err2!=nil){
			rows.Scan(&temp.Pokemon_id, &temp.Pokemon_name, &temp.Catch_time, &temp.Property, &null)
		}
		i++
		my_slice = append(my_slice, temp)
	}
	if err == nil {
		c.IndentedJSON(http.StatusOK, my_slice)
	} else {
		c.JSON(http.StatusNotAcceptable, "{}")
	}
}

//放入背包
type Id_time struct {
	Id         string `json:"id"`
	Catch_time string `json:"catch_time"`
}

func Takein_handler(c *gin.Context) {
	var info Id_time
	c.ShouldBindJSON(&info)
	user_backpack := user.Id + "_backpack"
	str := "insert into " + user_backpack + " values('" + info.Id + "','" + info.Catch_time + "');"
	_, err := db.Query(str)
	if err == nil {
		c.String(http.StatusOK, "放入成功")
	} else {
		c.String(http.StatusNotAcceptable, "放入失败")
	}
}

//从背包取出
func Takeout_handler(c *gin.Context) {
	var info Id_time
	c.ShouldBindJSON(&info)
	user_backpack := user.Id + "_backpack"
	str := "delete from " + user_backpack + " where pokemon_id = '" + info.Id +
		"' and catch_time = '" + info.Catch_time + "';"
	_, err := db.Query(str)
	if err == nil {
		c.String(http.StatusOK, "取出成功")
	} else {
		c.String(http.StatusNotAcceptable, "取出失败")
	}
}

type Buy struct {
	Money int `json:"money"`
	Type  int `json:"type"`
}

func Buy_pokeball_handler(c *gin.Context) {
	var info Buy
	c.ShouldBindJSON(&info)
	str := "update user_info set user_money = user_money - " + strconv.Itoa(info.Money) +
		" where user_id = '" + user.Id + "';"
	fmt.Println(str)
	_, err := db.Query(str)
	if err == nil {
		user_pack := user.Id + "_ballpack"
		str = "update " + user_pack + " set ball_num = ball_num + 1 where ball_type = " + strconv.Itoa(info.Type) + ";"
		fmt.Println(str)
		db.Query(str)
		c.String(http.StatusOK, "购买成功")
		str2:="update store set stock = stock-1 where ball_type = " + strconv.Itoa(info.Type) + ";"
		db.Query(str2)
	} else {
		c.String(http.StatusNotAcceptable, "无法购买！")
	}
}

//抓宝可梦成功放入仓库
func Catch_handler(c *gin.Context) {
	var info Id_time
	var name string
	c.ShouldBindJSON(&info)
	user_warehouse := user.Id + "_warehouse"
	rows := db.QueryRow("select pokemon_name from pokemon where pokemon_id = '" + info.Id + "';")
	rows.Scan(&name)
	str := "insert into " + user_warehouse + " values('" + info.Id + "', '" + name + "', '" +
		info.Catch_time + "');"
	_, err := db.Query(str)
	if err == nil {
		c.String(http.StatusOK, "捕捉成功")
	} else {
		c.String(http.StatusNotAcceptable, "出现问题，无法放入仓库")
	}
}

//奖励
type Award struct {
	Money int `json:"money"`
}

func Award_handler(c *gin.Context) {
	var info Award
	c.ShouldBindJSON(&info)
	str := "update user_info set user_money = user_money + " + strconv.Itoa(info.Money) +
		" where user_id = '" + user.Id + "';"
	_, err := db.Query(str)
	if err == nil {
		c.String(http.StatusOK, "")
	} else {
		c.String(http.StatusNotAcceptable, "")
	}
}

type A_poke_info struct {
	Pokemon_id string `json:"pokemon_id"`
}

func Fight_handler(c *gin.Context) {
	var info A_poke_info
	c.BindJSON(&info)
	fmt.Println(info.Pokemon_id)
	var poke_info Pokemon_info_withskill
	poke_info.info, poke_info.skill  = pokemon_details(info.Pokemon_id)
	c.JSON(http.StatusOK, gin.H{
		"id":              poke_info.info.Id,
		"name":            poke_info.info.Name,
		"property1":       poke_info.info.Property1,
		"property2":       poke_info.info.Property2,
		"attack":          poke_info.info.Attack,
		"special_attack":  poke_info.info.Special_Attack,
		"defense":         poke_info.info.Defense,
		"special_defense": poke_info.info.Special_Defense,
		"health":          poke_info.info.Health,
		"speed":           poke_info.info.Speed,

		"skill_name1":    poke_info.skill[0].Skill_name,
		"skill_type1":    poke_info.skill[0].Skill_type,
		"attack_type1":   poke_info.skill[0].Attack_type,
		"attack_power1":  poke_info.skill[0].Attack_power,
		"self_damage1":   poke_info.skill[0].Self_damage,
		"attribute1":     poke_info.skill[0].Attribute,
		"effect_id1":     poke_info.skill[0].Effect_id,
		"effect_result1": poke_info.skill[0].Effect_result,

		"skill_name2":    poke_info.skill[1].Skill_name,
		"skill_type2":    poke_info.skill[1].Skill_type,
		"attack_type2":   poke_info.skill[1].Attack_type,
		"attack_power2":  poke_info.skill[1].Attack_power,
		"self_damage2":   poke_info.skill[1].Self_damage,
		"attribute2":     poke_info.skill[1].Attribute,
		"effect_id2":     poke_info.skill[1].Effect_id,
		"effect_result2": poke_info.skill[1].Effect_result,

		"skill_name3":    poke_info.skill[2].Skill_name,
		"skill_type3":    poke_info.skill[2].Skill_type,
		"attack_type3":   poke_info.skill[2].Attack_type,
		"attack_power3":  poke_info.skill[2].Attack_power,
		"self_damage3":   poke_info.skill[2].Self_damage,
		"attribute3":     poke_info.skill[2].Attribute,
		"effect_id3":     poke_info.skill[2].Effect_id,
		"effect_result3": poke_info.skill[2].Effect_result,

		"skill_name4":    poke_info.skill[3].Skill_name,
		"skill_type4":    poke_info.skill[3].Skill_type,
		"attack_type4":   poke_info.skill[3].Attack_type,
		"attack_power4":  poke_info.skill[3].Attack_power,
		"self_damage4":   poke_info.skill[3].Self_damage,
		"attribute4":     poke_info.skill[3].Attribute,
		"effect_id4":     poke_info.skill[3].Effect_id,
		"effect_result4": poke_info.skill[3].Effect_result,
	})
}

func Register_handler(c *gin.Context){
	var u Struct_login
	u.Id ="postgres"
	u.Password = "1908"
	var str string
	str = "user=" + u.Id + " password=" + u.Password + " dbname=DataBasePJ sslmode=disable"
	db, err = sql.Open("postgres", str)
	//先登录超级管理员账号方便注册
	var user User_info
	c.ShouldBindJSON(&user)
	user.Id = "user_" + user.Id
	user.Password = encode_password(user.Password)
	err2 := create_role(user)
	db.Close() //注册结束，退出超级管理员账号
	checkErr(err)
	if err2 == nil {
		c.String(http.StatusOK, "create a role successfully")
	} else {
		c.String(http.StatusNotAcceptable, "fail to create a role,%s", err2)
	}
}

func Logout_handler(c *gin.Context){
	err2:=db.Close()
	if err2 == nil {
		c.String(http.StatusOK, "successfully logout")
	} else {
		c.String(http.StatusNotAcceptable, "fail to logout,%s", err2)
	}
}

func Ballpack_handler(c *gin.Context){
	str:="select* from " + user.Id + "_ballpack"
	rows,err:= db.Query(str)
	checkErr(err)
	var ball_type [4]int
	var ball_num [4]int
	i:=0
	for rows.Next(){
		rows.Scan(&ball_type[i],&ball_num[i])
		i++
	}
	if err==nil{
		c.JSON(http.StatusOK,gin.H{
			"type1": ball_num[0],
			"type2": ball_num[1],
			"type3": ball_num[2],
			"type4": ball_num[3],
		})
	} else{
		c.String(http.StatusNotAcceptable,"")
	}
}

func Delete_user_handler(c *gin.Context){
	//delete_role("ssyl2")
	delete_role("cbr")
}

type Ball_type struct {
	Balltype int
}
func Use_pokeball_handler(c *gin.Context){
	var ball_type Ball_type
	c.ShouldBindJSON(&ball_type)
	fmt.Println(ball_type.Balltype)
	_,err:= db.Query("update " + user.Id + "_ballpack where ball_type = " +
		strconv.Itoa(ball_type.Balltype) + " set ball_num = ball_num-1")
	checkErr(err)
	if err==nil{
		c.String(http.StatusOK,"success!")
	}else{
		c.String(http.StatusNotAcceptable,"unsuccssful")
	}

}//unfinished
