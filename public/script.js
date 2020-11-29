var apiKey = 'e356295993396c768cfc71ef8a2b66ba';
var locations = [{
    cityname: 'Haarlem',
    statecode: 'NH',
    countrycode: 'NL',
    currentweather: false,
    forecast: false
}, {
    cityname: 'Aalsmeer',
    statecode: 'NH',
    countrycode: 'NL',
    currentweather: false,
    forecast: false
}];

var WeatherCard = function (citydata) {

    return $('<div/>')
        .attr('id', citydata.cityname)
        .data('citydata', citydata)
        .addClass('weathercard')
        .append([
            $('<header/>').text(citydata.cityname),
            $('<div/>').append([
                $('<img/>').attr('src', 'http://openweathermap.org/img/wn/' + citydata.currentweather.weather[0].icon + '@2x.png'),
                $('<span/>').text(citydata.currentweather.main.temp)
            ]),
            $('<div/>')
                .addClass('otherdata')
                .append([
                    $('<span/>').addClass('row').append([
                        $('<span/>').text('min temp'),
                        $('<span/>').text(citydata.currentweather.main.temp_min)
                    ]),
                    $('<span/>').addClass('row').append([
                        $('<span/>').text('max temp'),
                        $('<span/>').text(citydata.currentweather.main.temp_max)
                    ]),
                    $('<span/>').addClass('row').append([
                        $('<span/>').text('humidity'),
                        $('<span/>').text(citydata.currentweather.main.humidity)
                    ])
                ])
        ]);
}

var WeatherDetail = function (citydata) {

    var html = $('<div/>')
        .attr('id', 'WeatherDetail-holder')
        .append(
            $('<h2>').text(citydata.cityname)
        );

    $.each(citydata.forecast.daily, function (i, data) {
        var day = new Date(data.dt * 1000);

        html.append($('<details/>').append([
            $('<summary/>').append($('<div/>').append([
                $('<span/>').text(day.toDateString()),
                $('<img/>').attr('src', 'http://openweathermap.org/img/wn/' + data.weather[0].icon + '@2x.png'),
                $('<span/>').text(Math.floor(data.temp.min) + '/' + Math.ceil(data.temp.max) + '°C')
            ])),
            $('<div/>')
                .addClass('day-info')
                .append(
                    $('<table/>')
                        .append([
                            $('<tr/>').append([
                                $('<td/>').text(''),
                                $('<td/>').text('Morning'),
                                $('<td/>').text('Afternoon'),
                                $('<td/>').text('Evening'),
                                $('<td/>').text('Night'),
                            ]),
                            $('<tr/>').append([
                                $('<td/>').text('Temperature'),
                                $('<td/>').text(data.temp.morn + '°C'),
                                $('<td/>').text(data.temp.day + '°C'),
                                $('<td/>').text(data.temp.eve + '°C'),
                                $('<td/>').text(data.temp.night + '°C'),
                            ])
                        ])
                )
        ]));
    });
    return html;
}

// fetch data van api
function callApi(type, url, citydata, cb) {

    url += '&units=metric';
    url += '&appid=' + apiKey;

    var storekey = citydata.cityname + '_' + type;
    var storevalue = localStorage.getItem(storekey) || false;
    var parsed = storevalue ? JSON.parse(storevalue) : false;
    var now = Date.now();

    if (parsed && parsed._fetchedtime >= (now - (1000 * 60 * 20))) { // 20 minutes
        // we hebben stored data: return callback
        console.log('from localstorage: ' + storekey);
        cb(parsed);

    } else {

        // request API url
        $.getJSON(url, function (data) {
            // geef fetch tijd mee aan data
            data._fetchedtime = now;
            // sla data op
            localStorage.setItem(storekey, JSON.stringify(data));
            // return callback
            console.log('from API: ' + storekey);
            cb(data);
        });
    }
}

function callApiCurrentweather(citydata, cb) {

    // fetch data van api
    var url = '//api.openweathermap.org/data/2.5/weather?q=';
    url += citydata.cityname;
    url += ',' + citydata.statecode;
    url += ',' + citydata.countrycode;

    // request API url
    callApi('current', url, citydata, function (data) {
        // callback
        cb(data);
    });
}

function callApiForecast(citydata, cb) {

    // fetch data van api
    var url = 'https://api.openweathermap.org/data/2.5/onecall';
    url += '?lat=' + citydata.currentweather.coord.lat;
    url += '&lon=' + citydata.currentweather.coord.lon;

    // request API url
    callApi('forecast', url, citydata, function (data) {
        // callback
        cb(data);
    });
}

// maak card voor elke locatie
$.each(locations, function (i, citydata) {
    // roep api aan voor data
    callApiCurrentweather(citydata, function (data) {
        citydata.currentweather = data;
        // maak WeatherCard
        $('#WeatherOverview').append(WeatherCard(citydata));
    });
});

// click card
$('body').on('click', '.weathercard', function (e) {
    var data = $(this).data('citydata');
    // haal forecast op
    callApiForecast(data, function (forecast) {
        data.forecast = forecast;
        $('#WeatherOverview').hide();
        $('#WeatherDetail-holder').remove();
        $('#WeatherDetail').append(WeatherDetail(data)).show();
    });
});

// click back
$('body').on('click', '.back', function (e) {
    $('#WeatherOverview').show();
    $('#WeatherDetail').hide();
});

// click detail
$('body').on("click", "details", function () {
    $('*', $(this)).blur();
    $("details[open]")
        .not(this)
        .removeAttr("open");

});