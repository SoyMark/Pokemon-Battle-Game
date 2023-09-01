package main

import (
	"database/sql"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

var db *sql.DB
var err error
var user Struct_login

func checkErr(err error) {
	if err != nil {
		panic(err)
	}
}

func login(user Struct_login, dbname string) (*sql.DB, error) {
	var str string
	str = "user=" + user.Id + " password=" + user.Password + " dbname=" + dbname + " sslmode=disable"
	db, err = sql.Open("postgres", str)
	err = db.Ping()
	return db, err
}


func main() {
	router := gin.Default()
	router.Use(cors.Default())
	router.POST("/select", Select_handler)//管理员和用户查询宝可梦信息
	router.POST("/insert", Insert_handler)//管理员加入新的宝可梦
	router.POST("/delete", Delete_handler)//管理员删除宝可梦
	router.POST("/update", Update_handler)//管理员更新宝可梦信息
	router.POST("/create_role", Create_role_handler)//管理员创建账户
	router.POST("/login", Login_handler)//用户登录
	router.POST("/user_free", Poke_free_handler)//用户放生宝可梦
	router.POST("/takein", Takein_handler)//用户从仓库里将宝可梦加入背包
	router.GET("/warehouse", Warehouse_handler)//用户查看仓库信息
	router.POST("/takeout", Takeout_handler)//用户从背包里取出宝可梦
	router.POST("/buy", Buy_pokeball_handler)//用户购买精灵球
	router.POST("/use_pokeball", Use_pokeball_handler)
	router.POST("/catch", Catch_handler)//用户抓到了宝可梦，加入仓库
	router.POST("/award", Award_handler)//记录和处理用户得到的奖励
	router.POST("/fight", Fight_handler)//加载用户发生战斗时的，以及AI宝可梦的信息
	router.POST("/register",Register_handler)//用户注册
	router.GET("/user_info", User_info_handler)//提供用户的基本信息
	router.GET("/logout",Logout_handler)//用户退出登录
	router.GET("/ballpack",Ballpack_handler)//显示用户背包里的精灵球种类和数量
	//router.GET("/delete_user", Delete_user_handler)//删除用户
	router.Run()
	/*var user2 struct_login
	user2.name = "syl"
	user2.password = "123"
	db2:=login(user2, "DataBasePJ")
	rows,err:=db1.Query("insert into store values('7',1,1);")
	if rows==nil {}
	checkErr(err)
	rows,err=db2.Query("insert into store values('8',2,2);")
	checkErr(err)*/
	//pokemon_search("select* from pokemon where pokemon_id = '123'")
	//info := make_pokemon_info("1215", "胡地", "超能力","1", 1,1,1,1,1,1)
	//new2:= make_pokemon_info("1234", " ", " ", " ",1,1,1,1,1,1)
	//pokemon_update(info)
	//a:=make_user_info("test5", "111", 1,0,1,1,0,0)
	/*info:=make_pokemon_info("0", "0", "0", "0", 0, 0, 0,0, 60, 0)
	sentense:=select_make(info)
	pokemon_search(sentense)*/
	//create_role(a)
	//skills:=get_skill("123")
	//info1:=get_skill_info(skills[0])
	//fmt.Println(info1)
	//db.Close()
}
