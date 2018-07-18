const $ = {
    id: function(id) { return document.getElementById(id) },
    tag: function(tag) { return document.createElement(tag) },
    txt: function(txt) { return document.createTextNode(txt) },
    appTxt: function(el,txt) { el.appendChild($.txt(txt)) },
    clr: function(el) { while (1) { const c = el.firstChild; if (!c) { break } el.removeChild(c) } return el },
    idClr: function(id) { return $.clr($.id(id)) },
    date2n: function(d) { return moment(d) / (86400000 * 365.2425) + 1970 },
    n2date: function(n) { return moment((n - 1970) * 86400000 * 365.2425 + 1).format('YYYYMMDD') },
    y2date: function(y) { return y == null ? null : moment(y.replace(/^(....)(..)(..)$/, "$1-$2-$3")) },
    lpw: 10,
    leftpad: function(s) { s = s.substr(0,$.lpw); const ls = s.length; return ' '.repeat($.lpw-ls) + s },
    resClasses: {},
    resClass: function(el) {
        for (let key of Object.keys($.resClasses)) { el.classList.remove(key) }
        if (arguments.length < 2) { return }
        const key = arguments[1];
        $.resClasses[key] = 1;
        el.classList.add(key);
    },
    access: function(o, path, op) {
        const paths = path.split('.');
        const max = paths.length - 1;
        for (const i = 0; i < max; i++) {
            const key = paths[i];
            if (typeof o[key] != 'object') { o[key] = {} }
            o = o[key];
        }
        o[paths[max]] = op(o[paths[max]]);
        return o[paths[max]];
    },
    get: function(o, path) { return $.access(o, path, function(x) { return x }) },
    set: function(o, path, val) { return $.access(o, path, function(x) { return val }) },
    md5: md5_min,
};

function ajax(method, route, data, on200, on500) {
    const r = new XMLHttpRequest();
    r.onreadystatechange = function() {
        if (r.readyState != 4) { return }
        const resp = JSON.parse(r.responseText);
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
const canvas = $.id('chart');
const ctx = canvas.getContext('2d');
const yAxis = { id: 'Y', type: 'linear', position: 'left' };
const tAxis = { id: 'T', type: 'linear', position: 'right', gridLines: { borderDash: [5,5] } };
const chart = new Chart(ctx, {
    type: 'line',
    data: {
        x_label: 'foo',
        labels: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22],
        datasets: (function() {
            const __ = null;
            return [                                              // 0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22
            { borderColor: 'rgb(255,50,50)', label: "Click", data: [ 0, 2, 4, 4, 4,__, 0, 2, 4, 4, 4,__,__, 0, 2, 4,__,__, 0, 2, 4, 4, 4], },
            { borderColor: 'rgb(255,60,40)', label: "Us",    data: [ 0, 0, 0,__, 2, 2, 2,__, 0, 2, 4,__, 5,__, 4, 4, 4,__,__, 2, 0,__,__], },
            { borderColor: 'rgb(255,70,30)', label: "To",    data: [__,-1,__, 0, 2, 4,__, 2, 2, 2,__, 5,__, 5,__, 0, 2, 4, 4, 4,__,-1,__], },
            { borderColor: 'rgb(255,80,20)', label: "Show",  data: [__, 5,__,-1,__, 0, 2, 4,__, 0, 2, 4, 4, 4,__, 0, 0, 0,__, 2, 2, 3, 4], },
            { borderColor: 'rgb(255,90,10)', label: "Hide",  data: [-1,__,-1,__,-1,__,-1,__,-1,__, 2, 2, 3, 4,__,__, 2, 2,__, 5,__, 5,__], },
            { borderColor: 'rgb(255,100,0)', label: "Lines", data: [ 5,__, 5,__, 5,__, 5,__, 5,__, 2, 0,__,__,__,__,__,-1,__,-1,__,-1,__], },
            ];
        })(),
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
                    const key = data.datasets[tooltipItem.datasetIndex].label;
                    let val = tooltipItem.yLabel;
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
        scales: {
            xAxes: [{ scaleLabel: { display: true, labelString: '' } }],
            yAxes: [ yAxis ],
        },
    }
});
canvas.ondblclick = function(ev) {
    console.log('Canvas double clicked');
    chart.resetZoom();
};

function updateChart(data) {
    $.lpw = 0;
    chart.options.scales.xAxes[0].scaleLabel.labelString = data.x_label;
    let dateFound = false;
    let yFound = false;
    for (i = 0; i < data.datasets.length; i++) {
        const lpw = data.datasets[i].label.length;
        if ($.lpw < lpw) {
            $.lpw = lpw;
        }
        data.datasets[i].yAxisID = 'Y';
        if (! data.datasets[i].label.match(/_date$/i)) {
            yFound = true;
            continue;
        }
        dateFound = true;
        data.datasets[i].yAxisID = 'T';
        for (j = 0; j < data.datasets[i].data.length; j++) {
            const d = $.date2n($.y2date(data.datasets[i].data[j]));
            data.datasets[i].data[j] = d;
        }
    }
    chart.options.scales.yAxes = [];
    if (yFound) chart.options.scales.yAxes.push(yAxis);
    if (dateFound) chart.options.scales.yAxes.push(tAxis);

    chart.options.elements.line.borderWidth = 1;
    chart.data = data;
    chart.update();
    console.log($.lpw);
}

function tabExpand(el, el_hits, route, on_enter) {
    $.id(el).onkeydown = function(ev) {
        const self = this;
        $.resClass(self);
        const key = ev.keyCode;
        const hits = $.id(el_hits);
        $.clr(hits);
        if (key != 9 && key != 13) { return }
        const txt = self.value;
        console.log("tabExpand", txt);
        ev.preventDefault();
        const method = key == 9 ? "GET" : "POST";
        $.resClass(self, 'processing');
        ajax(method, route + txt, undefined, function(resp) {
            if (key == 9) { // TAB
                self.value = resp.path;
                for (i = 0; i < resp.hits.length; i++) {
                    if (resp.hits.length == 1) break;
                    const hit = $.tag('div');
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

function storeQuery() {
    const schema = $.id("schema").value.split('/')[1];
    const query = $.id("select").value;
    const md5 = $.md5(query);
    const key = 'query-' + schema + '-' + md5;
    localStorage[key] = query;
}

function getQueries() {
    const schema = $.id("schema").value.split('/')[1];
    const query = $.id("select").value;
    const re_query = '^' + query.replace(/[.^$+*?{}()\[\]]/g, "\\$&");
    console.log(re_query);
    return Object.entries(localStorage).filter(function(x) {
        return x[0].match('^query-' + schema + '-');
    }).map(function(x) {
        return x[1]
    }).filter(function(x) {
        return x.match(re_query)
    });
}

tabExpand("path", "hits", "/home/", function(resp) {
    updateChart(resp.data)
    $.resClass($.id('path'), 'loaded');
    $.resClass($.id('select'));
});
$.id("path").onkeyup = function(ev) {
    const self = this;
    if (ev.keyCode == 40) { $.id("schema").focus() }
};

let dbh = '';
tabExpand("schema", "dbhits", "/db/", function(resp) {
    dbh = resp.dbh
    $.resClass($.id('schema'), 'connected');
    $.id('select').focus();
});
$.id("schema").onkeyup = function(ev) {
    const self = this;
    if (ev.keyCode == 38) { $.id("path").focus() }
};

$.id('select').onkeydown = function(ev) {
    const self = this;
    $.resClass(self);
    const hits = $.id('qhits');
    $.clr(hits);
    if (ev.keyCode == 9) {
        ev.preventDefault();
        const queries = getQueries();
        for (i = 0; i < queries.length; i++) {
            const hit = $.tag('div');
            let query = queries[i];
            $.appTxt(hit, query);
            hit.onclick = function() {
                self.value = query;
                self.focus();
                $.clr(hits);
            };
            hits.appendChild(hit);
        }
        return;
    } else if (!ev.ctrlKey || ev.keyCode != 13) {
        return;
    }
    $.resClass(self, 'processing');
    ajax('POST', '/select', { schema: dbh, query: self.value }, function(resp) {
        updateChart(resp.data);
        $.resClass(self, 'loaded');
        $.resClass($.id('path'));
        storeQuery();
    }, function(resp) {
        $.resClass(self, 'failed');
    });
};
$.id("select").onkeyup = function(ev) {
    const self = this;
    if (ev.keyCode == 27) { $.id("schema").focus() }
};

// Help
$.id('ahelp').onclick = function(ev) { $.id('help').style.display = 'block' };
$.id('help').onclick = function(ev) { this.style.display = 'none' };
document.onkeypress = function(ev) {
    if (ev.key == 'F1')     { $.id('help').style.display = 'block' }
    if (ev.key == 'Escape') { $.id('help').style.display = 'none' }
};
