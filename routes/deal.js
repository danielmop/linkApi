const express = require('express');
const router = express.Router();
const Deal = require('../models/Deal');
const request = require('request');

router.post('/', (req, response) => {
    try{
        request('https://api.pipedrive.com/v1/deals?status=won&start=0&api_token=' + process.env.api_token, { json: true }, (err, res, body) => {
            if (err) { throw new Exception(); }
            for (var k in res.body.data) {
                var deal = new Deal({
                    title: res.body.data[k].title,
                    value: res.body.data[k].value,
                    date: res.body.data[k].add_time
                });
                deal.save( err => {
                    if (err) throw new Exception();
                });
                request.post('https://bling.com.br/Api/v2/pedido/json/?apikey=' + process.env.api_key + '&xml=' + _createXML(deal.title, deal.value, deal.date)
                ,(error, res, body) => {
                    if (error) {
                      throw new Exception();
                    }
                  }
                );
            }
        });
        response.status(201);
        response.end();
    }catch(err){
        return res.status(503);
    }
})

router.get('/', async (req, res) => {
    try{
        const data =  await Deal.aggregate([
            { $group: { _id: "$date", total: { $sum: "$value" } } }
        ]);
        return res.json(data);
    }catch(err){
        res.json({message:err});
    }
});

function _createXML(nome, valor, data) {
    return `<?xml version="1.0" encoding="UTF-8"?><pedido><cliente><nome>Organisys Software</nome></cliente><transporte><volumes><volume><servico>SEDEX - CONTRATO</servico></volume></volumes></transporte><itens><item><codigo>001</codigo><descricao>${nome}</descricao><qtde>10</qtde><vlr_unit>${valor}</vlr_unit></item></itens><parcelas><parcela><data>${data}</data><vlr>100</vlr><obs>Teste obs 1</obs></parcela></parcelas></pedido>`
}

module.exports = router;