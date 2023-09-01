package main

import "fmt"

func pokemon_delete(id string) int {
	str := "delete from pokemon where pokemon_id = '" + id + "';"
	fmt.Println(str)
	rows, err := db.Query(str)
	if rows == nil {
	}
	checkErr(err)
	if err == nil {
		return 1
	} else {
		return 0
	}
}

func user_pokemon_delete(userid string, id string, catch_time string) error {
	str := "delete from " + userid + "_warehouse " + "where pokemon_id = '" +
		id + "' and catch_time = '" + catch_time + "';"
	fmt.Println(str)
	_, err := db.Query(str)
	checkErr(err)
	return err
}
