import { std } from "wow/wotlk";
import { CreatePage } from "./plots";

const general = CreatePage('General','')

const levels = std.SQL.player_xp_for_level
    .queryAll({})
    .sort((a,b)=>a.Level.get() > b.Level.get() ? 1 : -1)
    .map(x=>({x:x.Level.get(),y:x.Experience.get()}))

general.AddGraph('Exp Per Level','').AddData('',levels)

let expRates = []
for(let i=1;i<80;++i) {
    expRates.push({x:i,y:i*5 + (i < 58 ? 45 : i < 68 ? 235 : 580)});
}
general.AddGraph('Exp Per Kill','').AddData('',expRates)

let questRates = []
for(let i=1;i<80;++i) {
    questRates.push({x:i,y:std.DBC.QuestXP.query({ID:i}).Difficulty.getIndex(3)})
}
general.AddGraph('Exp Per Quest','').AddData('',questRates)

let expPerLevelPerKill = []
for(let i=1;i<80;++i) {
    expPerLevelPerKill.push({x:i,y:levels[i-1].y / expRates[i-1].y})
}
general.AddGraph('Exp Per Level Per Kill','').AddData('',expPerLevelPerKill)