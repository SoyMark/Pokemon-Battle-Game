package main

type Struct_login struct {
	Id       string `json:"id"`
	Password string `json:"password"`
}

type Pokemon_info struct {
	Id              string `json:"id"`
	Name            string `json:"name"`
	Property1       string `json:"property1"`
	Property2       string `json:"property2"`
	Attack          int    `json:"attack"`
	Special_Attack  int    `json:"special_attack"`
	Defense         int    `json:"defense"`
	Special_Defense int    `json:"special_defense"`
	Health          int    `json:"health"`
	Speed           int    `json:"speed"`
}

type User_info struct {
	Id          string `json:"id" binging:"required"`
	Name        string `json:"name"`
	Password    string `json:"password"`
	Login       int    `json:"login"`
	Superuser   int    `json:"superuser"`
	Createdb    int    `json:"createdb"`
	Createrole  int    `json:"createrole"`
	Inherit     int    `json:"inherit"`
	Replication int    `json:"replication"`
}

type Skill_info struct {
	Skill_name    string `json:"skill_name"`
	Skill_type    int    `json:"skill_type"`
	Attack_type   string `json:"attack_type"`
	Attack_power  int    `json:"attack_power"`
	Self_damage   int    `json:"self_damage"`
	Attribute     string `json:"attribute"`
	Effect_id     int  `json:"effect_id"`
	Effect_result int  `json:"effect_result"`
}

type User_price struct {
	User_id string `json:"user_id"`
	Price   int    `json:"price"`
}

type Pokemon_info_withskill struct {
	info  Pokemon_info
	skill [4]Skill_info
}

type Result struct {
	pokemons []Pokemon_info_withskill `json:"pokemons"`
}
