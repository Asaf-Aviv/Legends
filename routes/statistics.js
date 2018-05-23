const express     = require('express');
const router      = express.Router();
const pug         = require('pug');
const zed         = require('../util/zed');
const redisClient = require('../util/redisClient');

router.get('/', (req, res) => {
    redisClient.mgetAsync(`overall_info_platplus`, `overall_platplus`, `overall_champions_platplus`).then(async reply => {
        let overallPatch;
        let overallStats;
        let allChampsStats;

        if (reply[0]) {
            overallPatch   = JSON.parse(reply[0]);
            overallStats   = JSON.parse(reply[1]);
            allChampsStats = JSON.parse(reply[2]);
        } else {
            overallPatch   = await zed.getOverallPatch('platplus');
            overallStats   = await zed.getOverallStatistics('platplus');
            allChampsStats = await zed.getAllChampionsStats('platplus');

            redisClient.SET(`overall_platplus`, JSON.stringify(overallStats), 'EX', 3600 * 12);
            redisClient.SET(`overall_info_platplus`, JSON.stringify(overallPatch), 'EX', 3600 * 12);
            redisClient.SET(`overall_champions_platplus`, JSON.stringify(allChampsStats), 'EX', 3600 * 12);
        }
        const ids = await zed.getChampionsIdsAndNames();
        res.render('statistics', {
            title: 'Statistics | Zed.gg',
            overallPatch,
            overallStats,
            allChampsStats,
            ids,
        });
    });
});

router.get('/:champName', (req, res) => {
    const elo       = req.query.elo;
    const position  = req.query.position;
    const champName = req.params.champName;

    redisClient.mgetAsync(`statistics_${champName}_${position}_${elo}`).then(async reply => {
        let champStats;

        if (reply[0]) {
            console.log('serving from cache');
            champStats = JSON.parse(reply[0]);
        } else {
            console.log('caching');
            champStats = await zed.getIndepthStats(champName, position, elo);
            redisClient.SET(`statistics_${champName}_${position}_${elo}`, JSON.stringify(champStats), 'EX', 3600 * 12);
        }
        [champ, items, runes, summonerSpells] = 
            await Promise.all([
                zed.getChampDesc(champName),
                zed.getItems(),
                zed.getRunesReforged(),
                zed.getSummonerSpells()
            ]);

        if(!champStats || !champStats.length) return res.redirect('/statistics');
        res.render('champion_statistics', {
            title: `${champ.name} Statistics | Zed.gg`,
            champ,
            champStats,
            items,
            runes,
            summonerSpells,
        });
    });
});

router.get('/overall/:elo', (req, res) => {
    console.log('patch request')
    const elo = req.params.elo;
    
    redisClient.mgetAsync(`overall_info_${elo}`, `overall_${elo}`).then(async reply => {
        let overallPatch;
        let overallStats;

        if (reply[0]) {
            overallPatch = JSON.parse(reply[0]);
            overallStats = JSON.parse(reply[1]);
        } else {
            overallPatch = await zed.getOverallPatch(elo);
            overallStats = await zed.getOverallStatistics(elo);
            redisClient.SET(`overall_info_${elo}`, JSON.stringify(overallPatch), 'EX', 3600 * 12);
            redisClient.SET(`overall_${elo}`, JSON.stringify(overallStats), 'EX', 3600 * 12);
        }
        const ids = await zed.getChampionsIdsAndNames();
        res.send(pug.renderFile('views/partials/overall_patch.pug', {
            overallPatch,
            overallStats,
            ids,
            ddragon: zed.ddragon
        }));
    });
});

router.get('/overall/champions/:elo', (req, res) => {
    console.log('champions request')
    const elo = req.params.elo;
    
    redisClient.getAsync(`overall_champions_${elo}`).then(async reply => {
        let allChampsStats;

        if (reply) {
            allChampsStats = JSON.parse(reply);
        } else {
            allChampsStats = await zed.getAllChampionsStats(elo);
            redisClient.SET(`overall_champions_${elo}`, JSON.stringify(allChampsStats), 'EX', 3600 * 12);
        }
        const ids = await zed.getChampionsIdsAndNames();
        res.send(pug.renderFile('views/partials/overall_champs.pug', {
            allChampsStats,
            ids,
            ddragon: zed.ddragon
        }));
    });
});

module.exports = router;