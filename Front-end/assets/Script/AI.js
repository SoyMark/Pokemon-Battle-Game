// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const http = require("./Net/http")
const Constant = require("./Net/util/Constant")

class Attack {
    constructor(attack_type, power, self_damage, attribute) {
        this.attack_type = attack_type
        this.power = power
        this.self_damage = self_damage
        this.attribute = attribute
    }
}

class effect {
    constructor(effectId, effect_result) {
        this.effectId = effectId
        this.effect_result = effect_result
    }
}

class skill {
    constructor(skill_name, skill_type, attack_info, introduction, ...effect_info) {
        this.skill_name = skill_name
        this.skill_type = skill_type
        this.attack_info = attack_info
        this.effect_info = new Array(effect_info.length)
        for(var i = 0; i < effect_info.length; i++) {
            this.effect_info[i] = effect_info[i]
        }
        this.introduction = introduction
    }
}

cc.Class({
    extends: cc.Component,

    properties: {
        battle: {
            default: null,
            type: cc.Node
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.battlejs = this.battle.getComponent('Battle')
        this.battlejs.load_Poke(2, current_player2_poke_info[player2_current_poke], player2_all_poke[player2_current_poke])
        this.current_player2_poke = current_player2_poke_info[player2_current_poke]
        console.log(current_player2_poke_info)
        player2_type = window.Global.player2_type
    },

    selectMove() {
        max_damage = 0
        selected_move = null
        let count = 0
        if(this.current_player2_poke.move1.skill_type == 0) {
            if((count = this.battlejs.count_damage(this.current_player2_poke, current_poke_info[current_poke], this.current_player2_poke.move1)[0]) > max_damage) {
                max_damage = count
                selected_move = this.current_player2_poke.move1
            }
        }
        if(this.current_player2_poke.move2.skill_type == 0) {
            if((count = this.battlejs.count_damage(this.current_player2_poke, current_poke_info[current_poke], this.current_player2_poke.move2)[0]) > max_damage) {
                max_damage = count
                selected_move = this.current_player2_poke.move2
            }
        }
        if(this.current_player2_poke.move3.skill_type == 0) {
            if((count = this.battlejs.count_damage(this.current_player2_poke, current_poke_info[current_poke], this.current_player2_poke.move3)[0]) > max_damage) {
                max_damage = count
                selected_move = this.current_player2_poke.move3
            }
        }
        if(this.current_player2_poke.move4.skill_type == 0) {
            if((count = this.battlejs.count_damage(this.current_player2_poke, current_poke_info[current_poke], this.current_player2_poke.move4)[0]) > max_damage) {
                max_damage = count
                selected_move = this.current_player2_poke.move4
            }
        }
        if(max_damage >= (all_poke[current_poke].health / 3)) {
            return selected_move
        }
        else {
            future_max_damage = 0
            let tmp_count = 0
            temp_selected = null
            let tmp_poke = JSON.parse(JSON.stringify(current_poke_info[current_poke]))
            let tmp_self_poke = JSON.parse(JSON.stringify(this.current_player2_poke))
            let tmp_origin_poke = JSON.parse(JSON.stringify(all_poke[current_poke]))
            let tmp_origin_self_poke = JSON.parse(JSON.stringify(player2_all_poke[player2_current_poke]))
            if(this.current_player2_poke.move1.skill_type == 1) {
                for(var i in this.current_player2_poke.move1.effect_info) {
                    if(this.current_player2_poke.move1.effect_info[i].effectId == 5 && max_damage < current_poke_info[current_poke].health) {
                        return this.current_player2_poke.move1
                    }
                    else {
                        tmp_count = this.test_effect(tmp_poke, tmp_origin_poke, tmp_self_poke, tmp_origin_self_poke, this.current_player2_poke.move1)
                        if(future_max_damage < tmp_count) {
                            temp_selected = this.current_player2_poke.move1
                            future_max_damage = tmp_count
                        }
                    }
                }
            }
            if(this.current_player2_poke.move2.skill_type == 1) {
                for(var i in this.current_player2_poke.move2.effect_info) {
                    if(this.current_player2_poke.move2.effect_info[i].effectId == 5 && max_damage < current_poke_info[current_poke].health) {
                        return this.current_player2_poke.move2
                    }
                    else {
                        tmp_count = this.test_effect(tmp_poke, tmp_origin_poke, tmp_self_poke, tmp_origin_self_poke, this.current_player2_poke.move2)
                        if(future_max_damage < tmp_count) {
                            temp_selected = this.current_player2_poke.move2
                            future_max_damage = tmp_count
                        }
                    }
                }
            }
            if(this.current_player2_poke.move3.skill_type == 1) {
                for(var i in this.current_player2_poke.move3.effect_info) {
                    if(this.current_player2_poke.move3.effect_info[i].effectId == 5 && max_damage < current_poke_info[current_poke].health) {
                        return this.current_player2_poke.move3
                    }
                    else {
                        tmp_count = this.test_effect(tmp_poke, tmp_origin_poke, tmp_self_poke, tmp_origin_self_poke, this.current_player2_poke.move3)
                        if(future_max_damage < tmp_count) {
                            temp_selected = this.current_player2_poke.move3
                            future_max_damage = tmp_count
                        }
                    }
                }
            }
            if(this.current_player2_poke.move4.skill_type == 1) {
                for(var i in this.current_player2_poke.move4.effect_info) {
                    if(this.current_player2_poke.move4.effect_info[i].effectId == 5 && max_damage < current_poke_info[current_poke].health) {
                        return this.current_player2_poke.move4
                    }
                    else {
                        tmp_count = this.test_effect(tmp_poke, tmp_origin_poke, tmp_self_poke, tmp_origin_self_poke, this.current_player2_poke.move4)
                        if(future_max_damage < tmp_count) {
                            temp_selected = this.current_player2_poke.move4
                            future_max_damage = tmp_count
                        }
                    }
                }
            }
            return temp_selected
        }
    },

    test_effect(tmp_poke, tmp_origin_poke, tmp_self_poke, tmp_origin_self_poke, selected_skill) {
        let effect_list = tmp_self_poke.move1.effect_info
        let future_max_damage = 0
        let count = 0
        for(var i in effect_list) {
            let id = selected_skill.effect_info[i].effectId
            let raise = selected_skill.effect_info[i].effect_result
            if(Math.floor(id / 6) == 0) {   // 对象是自己
                id = id % 6
                if(id == 5) {
                    tmp_self_poke.health += ((raise / 100) * tmp_origin_self_poke.health)
                    if(tmp_self_poke.health > tmp_origin_self_poke.health) {
                        tmp_self_poke.health = tmp_origin_self_poke.health
                    }
                }
                else {
                    let outnum = false
                    tmp_self_poke.level[id] += raise
                    if(Math.abs(tmp_self_poke.level[id]) > 6) {
                        tmp_self_poke.level[id] = 6
                        outnum = true
                    }
                    switch(id) {
                    case 0:
                        tmp_self_poke.attack = Math.floor(tmp_origin_self_poke.attack * Math.pow(1.5, tmp_self_poke.level[id]))
                        break
                    case 1:
                        tmp_self_poke.special_attack = Math.floor(tmp_origin_self_poke.special_attack * Math.pow(1.5, tmp_self_poke.level[id]))
                        break
                    case 2:
                        tmp_self_poke.defense = Math.floor(tmp_origin_self_poke.defense * Math.pow(1.5, tmp_self_poke.level[id]))
                        break
                    case 3:
                        tmp_self_poke.special_defense = Math.floor(tmp_origin_self_poke.special_defense * Math.pow(1.5, tmp_self_poke.level[id]))
                        break
                    case 4:
                        tmp_self_poke.speed = Math.floor(tmp_origin_self_poke.speed * Math.pow(1.5, tmp_self_poke.level[id]))
                        break
                    }
                }
            }   
            else if(Math.floor(id / 6) == 1) {   // 对象是敌人
                id = id % 6
                let outnum = false
                tmp_poke.level[id] += raise
                if(Math.abs(tmp_poke.level[id]) > 6) {
                    tmp_poke.level[id] = 6
                    outnum = true
                }
                switch(id) {
                case 0:
                    tmp_poke.attack = Math.floor(tmp_origin_poke.attack * Math.pow(1.5, tmp_poke.level[id]))
                    break
                case 1:
                    tmp_poke.special_attack = Math.floor(tmp_origin_poke.special_attack * Math.pow(1.5, tmp_poke.level[id]))
                    break
                case 2:
                    tmp_poke.defense = Math.floor(tmp_origin_poke.defense * Math.pow(1.5, tmp_poke.level[id]))
                    break
                case 3:
                    tmp_poke.special_defense = Math.floor(tmp_origin_poke.special_defense * Math.pow(1.5, tmp_poke.level[id]))
                    break
                case 4:
                    tmp_poke.speed = Math.floor(tmp_origin_poke.speed * Math.pow(1.5, tmp_poke.level[id]))
                    break
                }
            }
            else if(Math.floor(id / 6) == 2) {
                id = id % 6
                weather = id + 1
            }
        }
        if(tmp_self_poke.move1.skill_type == 0) {
            if((count = (this.battlejs.count_damage(tmp_self_poke, tmp_poke, tmp_self_poke.move1)[0])) > future_max_damage) {
                selected_move = tmp_self_poke.move1
                future_max_damage = count
            }
        }
        if(tmp_self_poke.move2.skill_type == 0) {
            if((count = this.battlejs.count_damage(tmp_self_poke, tmp_poke, tmp_self_poke.move2)[0]) > future_max_damage) {
                selected_move = tmp_self_poke.move2
                future_max_damage = count
            }
        }
        if(tmp_self_poke.move3.skill_type == 0) {
            if((count = this.battlejs.count_damage(tmp_self_poke, tmp_poke, tmp_self_poke.move3)[0]) > future_max_damage) {
                selected_move = tmp_self_poke.move3
                future_max_damage = count
            }
        }
        if(tmp_self_poke.move4.skill_type == 0) {
            if((count = this.battlejs.count_damage(tmp_self_poke, tmp_poke, tmp_self_poke.move4)[0]) > future_max_damage) {
                selected_move = tmp_self_poke.move4
                future_max_damage = count
            }
        }
        return future_max_damage
    },

    changePoke() {
        while(true) {
            player2_current_poke += 1
            if(current_player2_poke_info[player2_current_poke] != null && current_player2_poke_info[player2_current_poke].health != 0){
                this.current_player2_poke = current_player2_poke_info[player2_current_poke]
                break
            }
            if(player2_current_poke > 5) {
                if(player2_type == 1) {
                    var obj = {
                        'url': Constant.AWARD_URL,
                        'method': "POST",
                        'data': {
                            'money': 3000
                        },
                        'success': () => {
                            console.log('successfully get award')
                        },
                        'fail': ()=> {
                            console.log('Failed to get award')
                        }
                    }
                    http.request(obj)
                    this.battlejs.add_info(player2Name+'已经没有可用的宝可梦了')
                    this.battlejs.add_info(player1Name+'赢得了本次决斗的胜利')
                }
                // if(player2_type == 0) {
                //     this.battlejs.add_info(player2Name+'的'+current_player2_poke_info[player2_current_poke].poke_name+)
                // }
                console.log(this.battlejs.TextEnd)
                // while(!this.battlejs.TextEnd){}
                this.battlejs.endBattle()
                break
            }
        }
    },

    start () {
        

    },

    // update (dt) {},
});
