var $ = {
    id: function(id) { return document.getElementById(id) },
    tag: function(tag) { return document.createElement(tag) },
    txt: function(txt) { return document.createTextNode(txt) },
    appTxt: function(el,txt) { el.appendChild($.txt(txt)) },
    clr: function(el) { while (1) { var c = el.firstChild; if (!c) { break } el.removeChild(c) } return el },
    idClr: function(id) { return $.clr($.id(id)) },
    date2n: function(d) { return moment(d) / (86400000 * 365.2425) + 1970 },
    n2date: function(n) { return moment((n - 1970) * 86400000 * 365.2425 + 1).format('YYYYMMDD') },
    lpw: 10,
    leftpad: function(s) { s = s.substr(0,$.lpw); var ls = s.length; return ' '.repeat($.lpw-ls) + s },
    resClasses: {},
    resClass: function(el) {
        for (let key of Object.keys($.resClasses)) { el.classList.remove(key) }
        if (arguments.length < 2) { return }
        var key = arguments[1];
        $.resClasses[key] = 1;
        el.classList.add(key);
    },
};

function ajax(method, route, data, on200, on500) {
    var r = new XMLHttpRequest();
    r.onreadystatechange = function() {
        if (r.readyState != 4) { return }
        var resp = JSON.parse(r.responseText);
        if (r.status == 200) {
            if (on200) { on200(resp) }
            $.id('err').innerHTML = '';
        } else {
            if (on500) { on500(resp) }
            $.id('err').innerHTML = resp.error;
        }
    }
    r.open(method, route, true);
    if (data) {
        r.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        r.send(JSON.stringify(data));
    } else {
        r.send();
    }
}

// Chart on canvas
var canvas = $.id('chart');
var ctx = canvas.getContext('2d');
var chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22],
        datasets: [
            { borderColor: 'rgb(255,50,50)', label: "Click", data: [0,2,4,4,4,null,0,2,4,4,4,null,null,0,2,4,null,null,0,2,4,4,4], },
            { borderColor: 'rgb(255,60,40)', label: "Us",    data: [0,0,0,null,2,2,2,null,0,2,4,null,5,null,4,4,4,null,null,2,0], },
            { borderColor: 'rgb(255,70,30)', label: "To",    data: [null,-1,null,0,2,4,null,2,2,2,null,5,null,5,null,0,2,4,4,4,null,-1,null], },
            { borderColor: 'rgb(255,80,20)', label: "Show",  data: [null,5,null,-1,null,0,2,4,null,0,2,4,4,4,null,0,0,0,null,2,2,3,4], },
            { borderColor: 'rgb(255,90,10)', label: "Hide",  data: [-1,null,-1,null,-1,null,-1,null,-1,null,2,0,null,null,-1,null,2,2,null,5,null,5,null], },
            { borderColor: 'rgb(255,100,0)', label: "Lines", data: [5,null,5,null,5,null,5,null,5,null,2,2,3,4,null,-1,null,-1,null,-1,null,-1,null], },
        ]
    },
    options: {
        elements: {
            line: {
                borderWidth: 5,
                tension: 0,
                backgroundColor: 'rgba(255,255,255,0)',
            },
            point: { radius: 0 },
        },
        tooltips: {
            mode: 'index',
            intersect: false,
            position: 'nearest',
            backgroundColor: 'rgba(0,0,0,0.6)',
            bodyFontFamily: 'monospace',
            footerFontStyle: 'normal',
            footerFontSize: 10,
            footerFontFamily: 'sans-serif',
            callbacks: {
                label: function(tooltipItem, data) {
                    var key = data.datasets[tooltipItem.datasetIndex].label;
                    var val = tooltipItem.yLabel;
                    if (key.match(/_date$/)) {
                        val = $.n2date(val);
                    }
                    return $.leftpad(key) + '  ' + val;
                },
                footer: function(a,d) { return "Zoom: wheel drag double-click" },
            },
        },
        animation: { duration : 0 },
        hover : { animationDuration : 0 },
        responsiveAnimationDuration: 0,
        pan: { enabled: true },
        zoom: { enabled: true, drag: false, mode: 'xy' },
    }
});
canvas.ondblclick = function(ev) {
    console.log('Canvas double clicked');
    chart.resetZoom();
};

function updateChart(data) {
    $.lpw = 0;
    for (i = 0; i < data.datasets.length; i++) {
        var lpw = data.datasets[i].label.length;
        if ($.lpw < lpw) {
            $.lpw = lpw;
        }
        if (! data.datasets[i].label.match(/_date$/i))
            continue;
        for (j = 0; j < data.datasets[i].data.length; j++) {
            var d = $.date2n(moment(data.datasets[i].data[j]));
            data.datasets[i].data[j] = d;
        }
    }
    chart.options.elements.line.borderWidth = 1;
    chart.data = data;
    chart.update();
    console.log($.lpw);
}

function tabExpand(el, el_hits, route, on_enter) {
    $.id(el).onkeydown = function(ev) {
        var self = this;
        $.resClass(self);
        var key = ev.keyCode;
        var hits = $.id(el_hits);
        $.clr(hits);
        if (key != 9 && key != 13) { return }
        var txt = self.value;
        console.log("tabExpand", txt);
        ev.preventDefault();
        var method = key == 9 ? "GET" : "POST";
        $.resClass(self, 'processing');
        ajax(method, route + txt, undefined, function(resp) {
            if (key == 9) { // TAB
                self.value = resp.path;
                for (i = 0; i < resp.hits.length; i++) {
                    if (resp.hits.length == 1) break;
                    var hit = $.tag('div');
                    $.appTxt(hit, resp.hits[i]);
                    hits.appendChild(hit);
                }
            } else if (key == 13) { // ENTER
                on_enter(resp);
            }
        }, function(resp) {
            $.resClass(self, 'failed');
        });
    }
}

tabExpand("path", "hits", "/home/", function(resp) {
    updateChart(resp.data)
    $.resClass($.id('path'), 'loaded');
    $.resClass($.id('select'));
});
$.id("path").onkeyup = function(ev) {
    var self = this;
    if (ev.keyCode == 40) { $.id("schema").focus() }
};

var dbh = '';
tabExpand("schema", "dbhits", "/db/", function(resp) {
    dbh = resp.dbh
    $.resClass($.id('schema'), 'connected');
    $.id('select').focus();
});
$.id("schema").onkeyup = function(ev) {
    var self = this;
    if (ev.keyCode == 38) { $.id("path").focus() }
};

$.id('select').onkeydown = function(ev) {
    var self = this;
    $.resClass(self);
    if (!ev.ctrlKey || ev.keyCode != 13) { return }
    $.resClass(self, 'processing');
    ajax('POST', '/select', { schema: dbh, query: self.value }, function(resp) {
        updateChart(resp.data);
        $.resClass(self, 'loaded');
        $.resClass($.id('path'));
    }, function(resp) {
        $.resClass(self, 'failed');
    });
};
$.id("select").onkeyup = function(ev) {
    var self = this;
    if (ev.keyCode == 27) { $.id("schema").focus() }
};
