// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

var http = require('http')
var Constant = require('Constant')

let properties_info = {
    '普通': "Normal",
    '格斗': 'Fighting',
    '飞行': 'Flying',
    '毒': 'Poison',
    '地面': 'Ground',
    '岩石': 'Rock',
    '虫': 'Bug',
    '幽灵': 'Ghost',
    '钢': 'Steel',
    '火': 'Fire',
    '水': 'Water',
    '草': 'Grass',
    '电': 'Electric',
    '超能力': 'Psychic',
    '冰': 'Ice',
    '龙': 'Dragon',
    '恶': 'Dark'
}

property_json = new cc.JsonAsset
chance_json = new cc.JsonAsset


capChance = [0.5, 0.3, 0.2, 0.1, 0.05, 0.02, 0.005]

function deal_move(move, Move) {
    var background
    if (move.skill_type == 0) {
        cc.resources.load("MoveButton/" + move.attack_info.attribute, cc.SpriteFrame, function (err, spriteFrame) {
            if (err != null) {
                console.warn("Failed to load img")
                return
            }
            background = cc.find("Background", Move)
            background.getComponent(cc.Sprite).spriteFrame = spriteFrame
            move_name = cc.find("MoveName", background)
            move_name = move_name.getComponent(cc.Label)
            move_name.string = move.skill_name
            move_info = cc.find("MoveInfo", background)
            move_info = move_info.getComponent(cc.Label)
            move_info.string = move.introduction


        })
    } else if (move.skill_type == 1) {
        cc.resources.load("MoveButton/Normal", cc.SpriteFrame, function (err, spriteFrame) {
            if (err != null) {
                console.warn("Failed to load img")
                return
            }
            background = cc.find("Background", Move)
            background.getComponent(cc.Sprite).spriteFrame = spriteFrame
            move_name = cc.find("MoveName", background)
            move_name = move_name.getComponent(cc.Label)
            move_name.string = move.skill_name
            move_info = cc.find("MoveInfo", background)
            move_info = move_info.getComponent(cc.Label)
            move_info.string = move.introduction
        })
    }

}





cc.Class({
    extends: cc.Component,

    properties: {
        Player1: {
            default: null,
            type: cc.Sprite
        },
        Player1HP: {
            default: null,
            type: cc.ProgressBar
        },
        Player2: {
            default: null,
            type: cc.Sprite
        },
        Player2HP: {
            default: null,
            type: cc.ProgressBar
        },
        battle_info: cc.Prefab,
        ai: {
            default: null,
            type: cc.Node
        }
    },
    onLoad() {
        current_poke = 0
        player2_current_poke = 0
        
        weather = 0 // 0表示无天气, 1表示雨天, 2表示大晴天
        player1Name = window.Global.trainer.name
        player2Name = window.Global.player2_name
        
        //all_poke = 
        all_poke = new Array(6)
        all_poke = window.Global.all_poke
        
        
        player2_all_poke = new Array(6)
        player2_all_poke = window.Global.player2_all_poke
        
        all_ball = new Array(4)
        

        for (var i in all_poke) {
            if (all_poke[i] != null) {
                all_poke[i].property = properties_info[all_poke[i].property]
                all_poke[i].second_property = properties_info[all_poke[i].second_property]
                all_poke[i].attack = all_poke[i].attack * 2 + 63 + 31 + 5
                all_poke[i].defense = all_poke[i].defense * 2 + 63 + 31 + 5
                all_poke[i].special_attack = all_poke[i].special_attack * 2 + 63 + 31 + 5
                all_poke[i].special_defense = all_poke[i].special_defense * 2 + 63 + 31 + 5
                all_poke[i].speed = all_poke[i].speed * 2 + 63 + 31 + 5
                all_poke[i].health = all_poke[i].health * 2 + 63 + 31 + 100 + 10
            }
        }
        console.log(all_poke)
        
        for (var i in player2_all_poke) {
            if (player2_all_poke[i] != null) {
                player2_all_poke[i].property = properties_info[player2_all_poke[i].property]
                player2_all_poke[i].second_property = properties_info[player2_all_poke[i].second_property]
                player2_all_poke[i].attack = player2_all_poke[i].attack * 2 + 63 + 31 + 5
                player2_all_poke[i].defense = player2_all_poke[i].defense * 2 + 63 + 31 + 5
                player2_all_poke[i].special_attack = player2_all_poke[i].special_attack * 2 + 63 + 31 + 5
                player2_all_poke[i].special_defense = player2_all_poke[i].special_defense * 2 + 63 + 31 + 5
                player2_all_poke[i].speed = player2_all_poke[i].speed * 2 + 63 + 31 + 5
                player2_all_poke[i].health = player2_all_poke[i].health * 2 + 63 + 31 + 100 + 10
            }
        }
        console.log(window.Global.player2_all_poke)
        console.log(player2_all_poke)
        
        current_poke_info = JSON.parse(JSON.stringify(all_poke))
        current_player2_poke_info = JSON.parse(JSON.stringify(player2_all_poke))
        
        for (var i in current_poke_info) {
            if (current_poke_info[i] != null) {
                current_poke_info[i].level = [0, 0, 0, 0, 0]
            }
        }
        for (var i in current_player2_poke_info) {
            if (current_player2_poke_info[i] != null) {
                current_player2_poke_info[i].level = [0, 0, 0, 0, 0]
            }
        }
        this.load_Poke(1, current_poke_info[current_poke], all_poke[current_poke])
        this.loadMoveButton()
        self = this

        cc.resources.load('property', cc.JsonAsset, function (err, jsonAsset) {
            property_json = jsonAsset.json
        })

        cc.resources.load('captureChance', cc.JsonAsset, function (err, jsonAsset) {
            chance_json = jsonAsset.json
        })

        var obj = {
            'url': Constant.BALLPACK_URL,
            'method': 'GET',
            'success': (jsonData)=> {
                let response = JSON.parse(jsonData)
                all_ball[0] = response.type1
                all_ball[1] = response.type2
                all_ball[2] = response.type3
                all_ball[3] = response.type4
            },
            'fail': () => {
                console.log('failed to load pokemon ball information')
            }
        }
        http.request(obj)

        self.movespace = cc.find('BattleField/Space/MoveSpace')
        self.pokelist = cc.find('BattleField/Space/PokeIcon')
        self.pokeball = cc.find('BattleField/Space/PokeBall')
        self.showplace = cc.find('BattleField/dialogue_bubble/BattleResult/view/content')
        self.info_scroll = cc.find('BattleField/dialogue_bubble/BattleResult')
        self.info_content = cc.find('BattleField/dialogue_bubble/BattleResult/view/content')
        self.Battle = cc.find('BattleField/Menu/battle')
        self.Poke = cc.find('BattleField/Menu/poke')
        self.Ball = cc.find('BattleField/Menu/ball')
        self.Escape = cc.find('BattleField/Menu/escape')
        self.pokelist = cc.find('BattleField/Space/PokeIcon')
        self.poke1name = cc.find('BattleField/Player1/Pokemon1Name')
        self.poke2name = cc.find('BattleField/Player2/Pokemon2Name')
        self.battle_info_pool = new cc.NodePool()
        self.aijs = self.ai.getComponent('AI')
        cc.instantiate(this.battle_info)

        self.Escape.on('click', this.tryescape, this)
        self.Poke.on('click', this.select_poke, this)
        self.Battle.on('click', this.try_battle, this)
        self.Ball.on('click', this.try_ball, this)

        this.TextEnd = true
        this.PlayText = new Array()
        this.tt = 0
        this.selected_label = null
        this.wait_label = new Array()

        this.poke_alive = true
        this.try_battle()
    },

    tryescape() {
        this.disableAllButton()
        let exit_node = cc.find('BattleField/Exit')
        exit_node.active = true
        let confirm = exit_node.getChildByName('confirm')
        let cancel = exit_node.getChildByName('cancel')
        confirm.on('click', this.endBattle, this)
        cancel.on('click', function () {
            exit_node.active = false
            this.ableAllButton()
        }, this)
    },

    try_select(toggle) {
        if (this.poke_alive == false) {
            let self = this
            let toggle_node = toggle.node
            let load_name = toggle_node.name
            load_name = load_name[load_name.length - 1]
            current_poke = Number(load_name[load_name.length - 1])
            this.add_info(player1Name + '换上了' + current_poke_info[current_poke].poke_name)
            self.load_Poke(1, current_poke_info[current_poke], all_poke[current_poke])
            self.loadMoveButton()
            this.poke_alive = true
        } else {
            player2selected = this.aijs.selectMove()
            let self = this
            let toggle_node = toggle.node
            let load_name = toggle_node.name
            load_name = load_name[load_name.length - 1]
            current_poke = Number(load_name[load_name.length - 1])
            this.add_info(player1Name + '换上了' + current_poke_info[current_poke].poke_name)
            self.load_Poke(1, current_poke_info[current_poke], all_poke[current_poke])
            self.loadMoveButton()
            this.poke_alive = true
            this.turn(null, player2selected, 1)

        }

        return
    },

    try_battle() {
        this.pokelist.active = false
        this.movespace.active = true
        this.pokeball.active = false
        this.load_Poke(1, current_poke_info[current_poke], all_poke[current_poke])
        this.loadMoveButton()
        this.Move1.on('click', this.perform_move, this)
        this.Move2.on('click', this.perform_move, this)
        this.Move3.on('click', this.perform_move, this)
        this.Move4.on('click', this.perform_move, this)
        return
    },

    perform_move(button) {
        let index = button.node.name
        index = Number(index[index.length - 1])
        let selected_skill
        switch (index) {
            case 1:
                selected_skill = current_poke_info[current_poke].move1
                break
            case 2:
                selected_skill = current_poke_info[current_poke].move2
                break
            case 3:
                selected_skill = current_poke_info[current_poke].move3
                break
            case 4:
                selected_skill = current_poke_info[current_poke].move4
                break
        }
        player2selected = this.aijs.selectMove()
        this.turn(selected_skill, player2selected, 0)

    },

    turn(player1selected, player2selected, mode) {
        if (mode == 0) {
            if (current_poke_info[current_poke].speed > current_player2_poke_info[player2_current_poke].speed) {
                this.actual_move(player1Name, player2Name, current_poke_info[current_poke], all_poke[current_poke], current_player2_poke_info[player2_current_poke], player2_all_poke[player2_current_poke], player1selected)
                if (current_player2_poke_info[player2_current_poke].health != 0)
                    this.actual_move(player2Name, player1Name, current_player2_poke_info[player2_current_poke], player2_all_poke[player2_current_poke], current_poke_info[current_poke], all_poke[current_poke], player2selected)
                else {
                    this.aijs.changePoke()
                }
            } else if (current_poke_info[current_poke].speed < current_player2_poke_info[player2_current_poke].speed) {
                this.actual_move(player2Name, player1Name, current_player2_poke_info[player2_current_poke], player2_all_poke[player2_current_poke], current_poke_info[current_poke], all_poke[current_poke], player2selected)
                if (current_poke_info[current_poke].health != 0)
                    this.actual_move(player1Name, player2Name, current_poke_info[current_poke], all_poke[current_poke], current_player2_poke_info[player2_current_poke], player2_all_poke[player2_current_poke], player1selected)
                else {
                    this.Battle.getComponent(cc.Button).interactable = false
                    this.Ball.getComponent(cc.Button).interactable = false
                    this.Escape.getComponent(cc.Button).interactable = false
                    this.poke_alive = false
                    this.select_poke()
                }
            } else {
                let randomDecision = Math.floor(Math.random() * 2)
                if (randomDecision) {
                    this.actual_move(player1Name, player2Name, current_poke_info[current_poke], all_poke[current_poke], current_player2_poke_info[player2_current_poke], player2_all_poke[player2_current_poke], player1selected)
                    if (current_player2_poke_info[player2_current_poke].health != 0)
                        this.actual_move(player2Name, player1Name, current_player2_poke_info[player2_current_poke], player2_all_poke[player2_current_poke], current_poke_info[current_poke], all_poke[current_poke], player2selected)
                    else {
                        this.aijs.changePoke()
                    }
                } else {
                    if (current_poke_info[current_poke].health != 0)
                        this.actual_move(player1Name, player2Name, current_poke_info[current_poke], all_poke[current_poke], current_player2_poke_info[player2_current_poke], player2_all_poke[player2_current_poke], player1selected)
                    else {
                        this.Battle.getComponent(cc.Button).interactable = false
                        this.Ball.getComponent(cc.Button).interactable = false
                        this.Escape.getComponent(cc.Button).interactable = false
                        this.poke_alive = false
                        this.select_poke()
                    }
                }
            }
        } else if (mode == 1) {
            this.actual_move(player2Name, player1Name, current_player2_poke_info[player2_current_poke], player2_all_poke[player2_current_poke], current_poke_info[current_poke], all_poke[current_poke], player2selected)
        }
    },

    actual_move(perform_player, enemy_player, perform_poke, perform_origin, enemy_poke, enemy_origin, selected_skill) {
        if (!selected_skill.skill_type) {
            let ret = this.count_damage(perform_poke, enemy_poke, selected_skill)
            let result = ret[0]
            let selfDamage = Math.floor(selected_skill.attack_info.self_damage * result / 100)
            perform_poke.health -= selfDamage
            this.showDamage(perform_player, enemy_player, perform_poke, enemy_poke, selected_skill, ret[1], selfDamage)
            enemy_poke.health -= result
            if (enemy_poke.health <= 0) {
                enemy_poke.health = 0
                this.add_info(enemy_player + '的' + enemy_poke.poke_name + '倒下了')
                this.aijs.changePoke()
            }
            this.enemy_bar_change = true
            this.bar_change = true
        } else {
            this.add_info(perform_player + '的' + perform_poke.poke_name + '使用了' + selected_skill.skill_name)
            for (var i in selected_skill.effect_info) {
                let id = selected_skill.effect_info[i].effectId
                let raise = selected_skill.effect_info[i].effect_result
                if (Math.floor(id / 6) == 0) { // 对象是自己
                    id = id % 6
                    if (id == 5) {
                        perform_poke.health += ((raise / 100) * perform_origin.health)
                        if (perform_poke.health > perform_origin.health) {
                            perform_poke.health = perform_origin.health
                        }
                        this.add_info(perform_player + '的' + perform_poke.poke_name + '恢复健康了')
                    } else {
                        let raise_type = new String
                        let raise_result = (raise > 0 ? '提升' : '降低')
                        let outnum = false
                        perform_poke.level[id] += raise
                        if (Math.abs(perform_poke.level[id]) > 6) {
                            perform_poke.level[id] = 6
                            outnum = true
                        }
                        switch (id) {
                            case 0:
                                raise_type = '攻击'
                                perform_poke.attack = Math.floor(perform_origin.attack * Math.pow(1.5, perform_poke.level[id]))
                                break
                            case 1:
                                raise_type = '特攻'
                                perform_poke.special_attack = Math.floor(perform_origin.special_attack * Math.pow(1.5, perform_poke.level[id]))
                                break
                            case 2:
                                raise_type = '防御'
                                perform_poke.defense = Math.floor(perform_origin.defense * Math.pow(1.5, perform_poke.level[id]))
                                break
                            case 3:
                                raise_type = '特防'
                                perform_poke.special_defense = Math.floor(perform_origin.special_defense * Math.pow(1.5, perform_poke.level[id]))
                                break
                            case 4:
                                raise_type = '速度'
                                perform_poke.speed = Math.floor(perform_origin.speed * Math.pow(1.5, perform_poke.level[id]))
                                break
                        }
                        if (outnum) {
                            this.add_info(perform_player + '的' + perform_poke.poke_name + '的' + raise_type + '已经无法再' + raise_result + '了')
                        } else {
                            if (Math.abs(raise) == 1) {
                                this.add_info(perform_player + '的' + perform_poke.poke_name + '的' + raise_type + raise_result + '了')
                            }
                            if (Math.abs(raise) == 2) {
                                this.add_info(perform_player + '的' + perform_poke.poke_name + '的' + raise_type + '大幅' + raise_result + '了')
                            }
                        }
                    }
                } else if (Math.floor(id / 6) == 1) { // 对象是敌人
                    id = id % 6
                    let raise_type = new String
                    let raise_result = (raise > 0 ? '提升' : '降低')
                    let outnum = false
                    enemy_poke.level[id] += raise
                    if (Math.abs(enemy_poke.level[id]) > 6) {
                        enemy_poke.level[id] = 6
                        outnum = true
                    }
                    switch (id) {
                        case 0:
                            raise_type = '攻击'
                            enemy_poke.attack = Math.floor(enemy_origin.attack * Math.pow(1.5, enemy_poke.level[id]))
                            break
                        case 1:
                            raise_type = '特攻'
                            enemy_poke.special_attack = Math.floor(enemy_origin.special_attack * Math.pow(1.5, enemy_poke.level[id]))
                            break
                        case 2:
                            raise_type = '防御'
                            enemy_poke.defense = Math.floor(enemy_origin.defense * Math.pow(1.5, enemy_poke.level[id]))
                            break
                        case 3:
                            raise_type = '特防'
                            enemy_poke.special_defense = Math.floor(enemy_origin.special_defense * Math.pow(1.5, enemy_poke.level[id]))
                            break
                        case 4:
                            raise_type = '速度'
                            enemy_poke.speed = Math.floor(enemy_origin.speed * Math.pow(1.5, enemy_poke.level[id]))
                            break
                    }
                    if (outnum) {
                        this.add_info(enemy_player + '的' + enemy_poke.poke_name + '的' + raise_type + '已经无法再' + raise_result + '了')
                    }
                    if (Math.abs(raise) == 1) {
                        this.add_info(enemy_player + '的' + enemy_poke.poke_name + '的' + raise_type + raise_result + '了')
                    }
                    if (Math.abs(raise) == 2) {
                        this.add_info(enemy_player + '的' + enemy_poke.poke_name + '的' + raise_type + '大幅' + raise_result + '了')
                    }
                } else if (Math.floor(id / 6) == 2) {
                    id = id % 6
                    weather = id + 1
                    switch (weather) {
                        case 0:
                            this.add_info('天气变得正常了')
                            break
                        case 1:
                            this.add_info('突然开始下起大雨来')
                            break
                        case 2:
                            this.add_info('突然阳光变得猛烈起来')
                            break
                    }
                }

            }
        }

    },

    select_poke() {
        let self = this
        // self.movespace = cc.find('BattleField/Space/MoveSpace')
        self.pokelist = cc.find('BattleField/Space/PokeIcon')
        self.movespace.active = false
        self.pokeball.active = false
        self.pokelist.active = true
        self.pokeicon = new Array(6)
        let all_die = true
        for (var i in current_poke_info) {
            if (current_poke_info[i] != null && current_poke_info[i].health != 0) {
                all_die = false
                break
            }
        }
        if (all_die) {
            this.add_info(player1Name + '已经没有可用的宝可梦了')
            this.add_info(player1Name + '带上宝可梦逃走了')
            while(!this.TextEnd) {

            }
            this.endBattle()
            return
        }
        for (var i = 0; i < 6; i++) {
            self.pokeicon[i] = cc.find("BattleField/Space/PokeIcon/Select/toggle" + i)
            if (all_poke[i] != null) {
                let tmp_poke_icon = self.pokeicon[i]
                cc.resources.load('icon/' + all_poke[i].poke_id, cc.SpriteFrame, function (err, spriteFrame) {
                    if (err != null) {
                        console.warn('Failed to load img')
                        return
                    }
                    backgroud = tmp_poke_icon.getChildByName('Background').getComponent(cc.Sprite)
                    checkmark = tmp_poke_icon.getChildByName('checkmark').getComponent(cc.Sprite)
                    backgroud.spriteFrame = spriteFrame
                    checkmark.spriteFrame = spriteFrame
                })
                if (current_poke_info[i].health == 0) {
                    tmp_poke_icon.getComponent(cc.Toggle).interactable = false
                    tmp_poke_icon.off('toggle', this.try_select, this)
                } else {
                    tmp_poke_icon.on('toggle', this.try_select, this)
                }
            }
        }
        return
    },

    try_ball() {
        let self = this
        self.movespace.active = false
        self.pokelist.active = false
        self.pokeball.active = true
        self.ball_list = new Array(4)
        self.ball_info = new Array(4)
        for (i = 0; i < 4; i++) {
            self.ball_list[i] = cc.find("BattleField/Space/PokeBall/Select/toggle" + i)
            self.ball_info[i] = cc.find("BattleField/Space/PokeBall/Info/" + String(i + 1) + '/number').getComponent(cc.Label)
            let selected_ball = self.ball_list[i]
            self.ball_info[i].string = all_ball[i]
            if (all_ball[i] == 0) {
                selected_ball.getComponent(cc.Toggle).interactable = false
            }
            selected_ball.on('toggle', this.throw_ball, this)
        }
        return

    },

    throw_ball(toggle) {
        if (Global.player2_type == 0) {
            let self = this
            let toggle_node = toggle.node
            let load_name = toggle_node.name
            load_name = load_name[load_name.length - 1]
            let ball = Number(load_name)
            let capture = false
            all_ball[ball] -= 1
            self.ball_info[ball].string = all_ball[ball]
            if (all_ball[ball] == 0) {
                toggle.interactable = false
            }
            if (ball == 0) capture = true
            let chance = 2
            console.log('throw ball', chance_json)
            console.log(typeof (chance_json))
            chance *= (1.01 - current_player2_poke_info[player2_current_poke].health / player2_all_poke[player2_current_poke].health)
            chance *= capChance[chance_json[player2_all_poke[player2_current_poke].poke_id] - 1]
            console.log(chance)
            console.log('try?', chance_json[player2_all_poke[player2_current_poke].poke_id])

            switch (ball) {
                case 1:
                    chance *= 3
                case 2:
                    chance *= 1.5
                case 3:
                    chance *= 1
            }
            if (Math.random() <= chance)
                capture = true
            else
                capture = false
            if (capture) {var date = new Date();
			
                var year = date.getFullYear();        //年 ,从 Date 对象以四位数字返回年份
                var month = date.getMonth() + 1;      //月 ,从 Date 对象返回月份 (0 ~ 11) ,date.getMonth()比实际月份少 1 个月
                var day = date.getDate();             //日 ,从 Date 对象返回一个月中的某一天 (1 ~ 31)
                
                var hours = date.getHours();          //小时 ,返回 Date 对象的小时 (0 ~ 23)
                var minutes = date.getMinutes();      //分钟 ,返回 Date 对象的分钟 (0 ~ 59)
                var seconds = date.getSeconds();      //秒 ,返回 Date 对象的秒数 (0 ~ 59)   
                
                //获取当前系统时间  
                var currentDate = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
                alert(currentDate);
                
                //修改月份格式
                if (month >= 1 && month <= 9) {
                    month = "0" + month;
                    }
                //修改日期格式
                if (day >= 0 && day <= 9) {
                    day = "0" + day;
                    }
                
                //修改小时格式
                if (hours >= 0 && hours <= 9) {
                    hours = "0" + hours;
                    }
                
                //修改分钟格式
                if (minutes >= 0 && minutes <= 9) {
                    minutes = "0" + minutes;
                    }
                
                //修改秒格式
                if (seconds >= 0 && seconds <= 9) {
                    seconds = "0" + seconds;
                    }
			
                //获取当前系统时间  格式(yyyy-mm-dd hh:mm:ss)
                var currentFormatDate = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
                this.add_info('好耶！成功收服' + player2_all_poke[player2_current_poke].poke_name + '了!')
                var obj = {
                    'url': Constant.CATCH_URL,
                    'method': 'POST',
                    'data': {
                        'id': window.Global.player2_all_poke.poke_id,
                        'catch_time': currentFormatDate
                    },
                    'success': ()=> {
                        console.log('successfully capture')
                        let new_obj = {
                            'url': Constant.AWARD_URL,
                            'method': 'POST',
                            'data': {
                                'money': 3000
                            },
                            'success': () => {
                                console.log('successfully get award')
                                window.Global.trainer.money += 3000
                            },
                            'fail': ()=> {
                                console.log('failed to get award')
                            }
                        }
                        http.request(new_obj)
                    },
                    'fail': ()=> {
                        console.log('failed to load capture')
                    }
                }
                http.request(obj)
                this.endBattle()
            } else {
                this.add_info('可惜！差一点点就能抓到了')
            }
        } else {
            this.add_info('尝试捕捉其他宝可梦训练师辛苦培育的宝可梦是不道德的哦！')
        }
        player2selected = this.aijs.selectMove()
        this.turn(null, player2selected, 1)
    },

    load_Poke(player, selected_poke, origin_selected_poke) {
        let self = this
        cc.resources.load("Pokemon/" + selected_poke.poke_id, cc.SpriteFrame, function (err, spriteFrame) {
            if (err != null) {
                console.warn("Failed to load img")
                return
            }
            if (player == 1) {
                self.Player1.spriteFrame = spriteFrame
                self.Player1HP.progress = (selected_poke.health / origin_selected_poke.health)
                self.poke1name.getComponent(cc.Label).string = selected_poke.poke_name
            } else if (player == 2) {
                self.Player2.spriteFrame = spriteFrame
                self.Player2HP.progress = (selected_poke.health / origin_selected_poke.health)
                self.poke2name.getComponent(cc.Label).string = selected_poke.poke_name
            }
        })
        return

    },

    loadMoveButton() {
        let self = this
        self.Move1 = cc.find('BattleField/Space/MoveSpace/Move1')
        self.Move2 = cc.find('BattleField/Space/MoveSpace/Move2')
        self.Move3 = cc.find('BattleField/Space/MoveSpace/Move3')
        self.Move4 = cc.find('BattleField/Space/MoveSpace/Move4')
        deal_move(all_poke[current_poke].move1, self.Move1)
        deal_move(all_poke[current_poke].move2, self.Move2)
        deal_move(all_poke[current_poke].move3, self.Move3)
        deal_move(all_poke[current_poke].move4, self.Move4)

    },

    add_info(info) {
        let new_info = null
        if (this.battle_info_pool.size() > 0) {
            new_info = this.battle_info_pool.get()
        } else {
            new_info = cc.instantiate(this.battle_info)
        }
        new_info.parent = this.showplace
        let content = this.info_content
        if (this.selected_label == null) {
            this.selected_label = new_info.getComponent(cc.Label)
        } else {
            this.wait_label.push(new_info.getComponent(cc.Label))
        }
        this.TextEnd = false
        this.PlayText.push(info)

        content.height += 15
    },



    update(dt) {
        if (!this.TextEnd) this.disableAllButton()
        else this.ableAllButton()
        this.tt += dt
        let change = (current_poke_info[current_poke].health / all_poke[current_poke].health) - this.Player1HP.progress
        let enemy_change = (current_player2_poke_info[player2_current_poke].health / player2_all_poke[player2_current_poke].health) - this.Player2HP.progress
        if (this.tt >= 0.1) {
            if (this.enemy_bar_change) {
                if (Math.abs(enemy_change) > 0.02) {
                    this.Player2HP.progress += (enemy_change > 0 ? 0.02 : -0.02)
                    return
                } else {
                    this.Player2HP.progress += enemy_change
                    this.enemy_bar_change = false
                    return
                }
            }
            if (this.bar_change) {
                if (Math.abs(change) > 0.02) {
                    this.Player1HP.progress += (change > 0 ? 0.02 : -0.02)
                    return
                } else {
                    this.Player1HP.progress += change
                    this.bar_change = false
                    return
                }
            }
        }
        if (this.TextEnd) return
        if (this.tt >= 0.05) {
            if (this.selected_label != null) {
                if (this.PlayText[0] != null && this.selected_label.string.length < this.PlayText[0].length) {
                    this.selected_label.string = this.PlayText[0].slice(0, this.selected_label.string.length + 1)
                } else {
                    this.PlayText.shift()
                    if (this.wait_label.length != 0) {
                        this.selected_label = this.wait_label[0]
                        this.wait_label.shift()
                    } else {
                        this.TextEnd = true
                    }

                }
            }
            this.tt = 0
        }
    },

    count_damage(player1Poke, player2Poke, selected_skill) {
        let result = 0
        result = 42 * selected_skill.attack_info.power
        if (selected_skill.attack_info.attack_type == 0) {
            result = result * player1Poke.attack / player2Poke.defense / 50 + 2
        } else if (selected_skill.attack_info.attack_type == 1) {
            result = result * player1Poke.special_attack / player2Poke.special_defense / 50 + 2
        }
        if (weather == 1) { // 大雨天
            if (selected_skill.attack_info.attribute == 'Fire')
                result = result * 0.5
            if (selected_skill.attack_info.attribute == 'Water')
                result = result * 1.5
        } else if (weather == 2) {
            if (selected_skill.attack_info.attribute == 'Fire')
                result = result * 1.5
            if (selected_skill.attack_info.attribute == 'Water')
                result = result * 0.5
        }
        if (player1Poke.property == selected_skill.attack_info.attribute) {
            result = result * 1.5
        }
        let noun = property_json[selected_skill.attack_info.attribute][player2Poke.property]
        if (player2Poke.second_property != null) {
            noun = noun * property_json[selected_skill.attack_info.attribute][player2Poke.second_property]
        }
        result = result * noun
        let random_number = Math.floor(Math.random() * (255 - 217 + 1) + 217)
        result = Math.floor(result * random_number / 255)
        let ret = [result, noun]
        return ret
    },

    showDamage(perform_player, enemy_player, player1Poke, player2Poke, selected_skill, noun, selfDamage) {
        if (noun > 1) {
            this.add_info(perform_player + '的' + player1Poke.poke_name + '对' + enemy_player + '的' + player2Poke.poke_name + '使用了' + selected_skill.skill_name + (selfDamage == 0 ? '' : ',自己也受到了技能的反作用') + ',效果拔群')
        } else if (noun < 1) {
            this.add_info(perform_player + '的' + player1Poke.poke_name + '对' + enemy_player + '的' + player2Poke.poke_name + '使用了' + selected_skill.skill_name + (selfDamage == 0 ? '' : ',自己也受到了技能的反作用') + ',效果并不是很好')
        } else {
            this.add_info(perform_player + '的' + player1Poke.poke_name + '对' + enemy_player + '的' + player2Poke.poke_name + '使用了' + selected_skill.skill_name + (selfDamage == 0 ? '' : ',自己也受到了技能的反作用'))
        }
    },

    disableAllButton() {
        this.Escape.getComponent(cc.Button).interactable = false
        this.Poke.getComponent(cc.Button).interactable = false
        this.Battle.getComponent(cc.Button).interactable = false
        this.Ball.getComponent(cc.Button).interactable = false
        if (this.movespace.active == true) {
            this.Move1.getComponent(cc.Button).interactable = false
            this.Move2.getComponent(cc.Button).interactable = false
            this.Move3.getComponent(cc.Button).interactable = false
            this.Move4.getComponent(cc.Button).interactable = false
        }
        if (this.pokelist.active == true) {
            for (var i in this.pokeicon) {
                this.pokeicon[i].getComponent(cc.Button).interactable = false
            }
        }
        if (this.pokeball.active == true) {
            for (var i in this.ball_list) {
                this.ball_list[i].getComponent(cc.Button).interactable = false
            }
        }
    },

    ableAllButton() {
        this.Escape.getComponent(cc.Button).interactable = true
        this.Poke.getComponent(cc.Button).interactable = true
        this.Battle.getComponent(cc.Button).interactable = true
        this.Ball.getComponent(cc.Button).interactable = true
        if (this.movespace.active == true) {
            this.Move1.getComponent(cc.Button).interactable = true
            this.Move2.getComponent(cc.Button).interactable = true
            this.Move3.getComponent(cc.Button).interactable = true
            this.Move4.getComponent(cc.Button).interactable = true
        }
        if (this.pokelist.active == true) {
            for (var i in this.pokeicon) {
                this.pokeicon[i].getComponent(cc.Button).interactable = true
            }
        }
        if (this.pokeball.active == true) {
            for (var i in this.ball_list) {
                this.ball_list[i].getComponent(cc.Button).interactable = true
            }
        }
    },

    endBattle() {
        cc.director.preloadScene('Outdoor', function () {
            console.log('preload outdoor')
        })
        let endAlert = cc.find('BattleField/EndGame')
        endAlert.active = true
        let endButton = cc.find('BattleField/EndGame/confirm')
        endButton.on('click', function () {
            cc.director.loadScene('Outdoor', function () {
                console.log('loaded outdoor')
            })
        }, this)
    }
});