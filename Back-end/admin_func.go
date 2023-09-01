package main

import (
	"strconv"
)

//进货，num指进多少货
func restock(id string, num int) {
	str := "update store set stock = stock + " + strconv.Itoa(num)
	str += " where item_id = '" + id + "';"
	rows, err := db.Query(str)
	checkErr(err)
	if rows == nil {
	}
}
