package main

import "fmt"

func edit_role(user User_info) string{
	str:="alter role \"" + user.Id + "\"\n"
	if user.Login!=0{
		str+="login\n"
	} else{
		str+="nologin\n"
	}
	if user.Superuser!=0{
		str+="superuser\n"
	} else{
		str+="nosuperuser\n"
	}
	if user.Createdb!=0{
		str+="createdb\n"
	} else{
		str+="nocreatedb\n"
	}
	if user.Createrole!=0{
		str+="createrole\n"
	} else{
		str+="nocreaterole\n"
	}
	if user.Inherit!=0{
		str+="inherit\n"
	} else{
		str+="noinherit\n"
	}
	if user.Replication!=0{
		str+="replication\n"
	} else{
		str+="noreplication\n"
	}
	str+="connection limit -1\n"
	str+="password '" + user.Password + "';"
	_, err:= db.Query(str)
	// if rows == nil {} // rows没用到会报错，所以加一行
	checkErr(err)
	if err==nil {
		return "edit a role successfully"
	}
	return "fail to edit a role"
}

//删除一个用户，先删除他的宝可梦库（表），再删除用户
func delete_role(Id string){
	str_table:= "REVOKE ALL ON TABLE public.store FROM " + Id + ";\n"
	str_table+= "REVOKE ALL ON TABLE public.skill FROM " + Id + ";\n"
	str_table+= "REVOKE ALL ON TABLE public.pokemon FROM " + Id + ";\n"
	str_table+= "REVOKE ALL ON TABLE public.pokemon_skill FROM " + Id + ";\n"
	str_table+= "REVOKE ALL ON TABLE public.user_info FROM " + Id + ";\n"
	str_table+= "drop table " + Id + "_backpack;\n"
	str_table+= "drop table " + Id + "_ballpack;\n"
	str_table+= "drop table " + Id + "_warehouse;\n"
	str_user:= "drop user " + Id + ";"
	str_table+=str_user
	_, err:=db.Query(str_table)
	checkErr(err)
	if err == nil {
		fmt.Println("delete successfully!")
	}else{
		fmt.Println("fail to delete a user")
	}
}