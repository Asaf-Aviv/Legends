const rp = require('request-promise');
const championSkins = require('../assets/data/champions/championSkins');
const championIds = require('../assets/data/champions/championIds');
const champions = require('../assets/data/champions/champion');

const ddragon = '8.5.2';
const lol = '.api.riotgames.com/lol/';

function getSummoner(summonerName, region) {
    const getSummonerData = `https://${region}${lol}summoner/v3/summoners/by-name/${summonerName}?api_key=${process.env.LOL_KEY}`;
    return rp({ uri: getSummonerData, json: true })
        .catch(err => {
            console.log("getSummoner ERROR: " + err);
        });
}

function getLeague(summonerId, region) {
    const getLeagueData = `https://${region}${lol}league/v3/positions/by-summoner/${summonerId}?api_key=${process.env.LOL_KEY}`;
    return rp({ uri: getLeagueData, json: true })
        .catch(function(err) {
            console.log("getLeague ERROR: " + err);
        });
}

function getMastery(summonerId, region) {
    const getMasteryData = `https://${region}${lol}champion-mastery/v3/champion-masteries/by-summoner/${summonerId}?api_key=${process.env.LOL_KEY}`;
    return rp({ uri: getMasteryData, json: true })
        .catch(function(err) {
            console.log("getMastery ERROR: " + err);
        });
}

function getLeaderboards(region) {
    const getLeaderboardData = `https://${region}${lol}league/v3/challengerleagues/by-queue/RANKED_SOLO_5x5?api_key=${process.env.LOL_KEY}`;
    return rp({ uri: getLeaderboardData, json: true })
        .catch(function(err) {
            console.log("getLeaderboards ERROR: " + err);
        });
}

function getSummonerGame(summonerId, region) {
    const getLeaderboardData = `https://${region}${lol}spectator/v3/active-games/by-summoner/${summonerId}?api_key=${process.env.LOL_KEY}`;
    return rp({ uri: getLeaderboardData, json: true })
        .catch(function(err) {
            console.log("getSummonerGame ERROR: " + err);
        });
}

function getMatches(summonerId, region) {
    const getMatchesData = `https://${region}${lol}match/v3/matchlists/by-account/${summonerId}/recent?api_key=${process.env.LOL_KEY}`;
    return rp({ uri: getMatchesData, json: true })
        .catch(function(err) {
            console.log("getMatches ERROR: " + err);
        });
}

function getChampionStats(champName) {
    // const allData = `kda,damage,minions,wins,positions,wards,normalized,averageGames,overallPerformanceScore,goldEarned,sprees,hashes,wins,maxMins,matchups`
    const champId = +Object.keys(champions.keys).filter(v => champions.keys[v].toLowerCase() === champName.toLowerCase());
    const allData = `wins,kda,damage,minions`;
    const getChampsData = `http://api.champion.gg/v2/champions/${champId}?champData=${allData}&api_key=${process.env.CHAMPION_KEY}`;
    return rp({ uri: getChampsData, json: true })
        .catch(function(err) {
            console.log("getChampionStats ERROR: " + err);
        });
}

function getChampDesc(champId) {
    return new Promise((resolve, reject) => {
        resolve(champions.data[championIds[champId]]);
    });
}

function getChampionsIdsAndNames() {
    return new Promise((resolve, reject) => {
        resolve(champions.keys);
    });
}

function getRunesReforged() {
    const runesRegorged = `http://ddragon.leagueoflegends.com/cdn/${ddragon}/data/en_US/runesReforged.json`;
    return rp({ uri: runesRegorged, json: true })
        .catch(function(err) {
            console.log("getRunesReforged ERROR: " + err);
        });
}

function getBg(name, max) {
    name = name.replace(' ', '').replace("'", '');
    const skinNum = Math.floor(Math.random() * max);
    return `${name}_${skinNum}.jpg`;
}

function getSkins(champId) {
    champId = championIds[champId];
    return championSkins["data"][champId];
}

function setIdToName(obj) {
    for (let i = 0, x = obj.length; i < x; i++) {
        obj[i].championName = championIds[obj[i].championId];
    }
}

function getNameById(champId) {
    return championIds[champId];
}

module.exports = {
    setIdToName,
    getSummoner,
    getLeague,
    getChampionStats,
    getSummonerGame,
    getMastery,
    getLeaderboards,
    getMatches,
    getSkins,
    getBg,
    getChampionsIdsAndNames,
    getChampDesc,
    getRunesReforged
};