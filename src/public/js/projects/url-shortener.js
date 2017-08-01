function createProfile() {
    $.post("https://url-shortener.openservices.co.za/api/profile", {
        name: $('div#createProfile input[name=name]').val()
    }, function (data) {
        $('div#createProfile label#result').html(`Your profile key is ${data.key}`);
    }).fail(function (res) {
        $('div#createProfile label#result').html(JSON.parse(res.responseText).message);
    });
}

function createUrl() {
    $.post("https://url-shortener.openservices.co.za/api/url", {
        name: $('div#createUrl input[name=name]').val(),
        key: $('div#createUrl input[name=profileKey]').val(),
        shortUrl: $('div#createUrl input[name=shortUrl]').val(),
        url: $('div#createUrl input[name=url]').val()
    }, function (data) {
        $('div#createUrl label#result').html(`Your url is <a href="https://url-shortener.openservices.co.za/${$('div#createUrl input[name=shortUrl]').val()}">https://url-shortener.openservices.co.za/${$('div#createUrl input[name=shortUrl]').val()}</a>`);
    }).fail(function (res) {
        $('div#createUrl label#result').html(JSON.parse(res.responseText).message);
    });
}


function generateKey() {
    var text = "";
    var possible = "abcdefghijklmnopqrstuvwxyz";

    for (var i = 0; i < 8; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}