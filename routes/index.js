module.exports = function(app){
    require('./process')(app);
    require('./main')(app);
}

