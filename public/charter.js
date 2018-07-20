Object.filter = (o, f) => Object.assign({},
    ...
    Object.entries(o)
    .filter(f)
    .map(([k,v]) => ({[k]:v}))
);
const $ = {
    id: id => document.getElementById(id),
    tag: tag => document.createElement(tag),
    txt: txt => document.createTextNode(txt),
    appTxt: (el,txt) => { el.appendChild($.txt(txt)) },
    clr: el => { while (1) { const c = el.firstChild; if (!c) { break } el.removeChild(c) } return el },
    idClr: id => $.clr($.id(id)),
    date2n: d => moment(d) / (86400000 * 365.2425) + 1970,
    n2date: n => moment((n - 1970) * 86400000 * 365.2425 + 1).format('YYYYMMDD'),
    y2date: y => y == null ? null : moment(y.replace(/^(....)(..)(..)$/, "$1-$2-$3")),
    lpw: 10,
    leftpad: s => { s = s.substr(0,$.lpw); const ls = s.length; return ' '.repeat($.lpw-ls) + s },
    resClasses: {},
    resClass: (el, ...args) => {
        for (let key of Object.keys($.resClasses)) { el.classList.remove(key) }
        if (args.length == 0) { return }
        const key = args[0];
        $.resClasses[key] = 1;
        el.classList.add(key);
    },
    access: (o, path, op) => {
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
    get: (o, path) => $.access(o, path, x => x),
    set: (o, path, val) => $.access(o, path, x => val),
    md5: md5_min,
};

function ajax(method, route, data, on200, on500) {
    const r = new XMLHttpRequest();
    r.onreadystatechange = () => {
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
        datasets: (() => {
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
                label: (tooltipItem, data) => {
                    const key = data.datasets[tooltipItem.datasetIndex].label;
                    let val = tooltipItem.yLabel;
                    if (key.match(/_date$/)) {
                        val = $.n2date(val);
                    }
                    return $.leftpad(key) + '  ' + val;
                },
                footer: (a,d) => "Zoom: wheel drag double-click",
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
canvas.ondblclick = ev => {
    console.log('Canvas double clicked');
    chart.resetZoom();
};

function updateChart(data) {
    $.lpw = 0;
    chart.options.scales.xAxes[0].scaleLabel.labelString = data.x_label;
    let dateFound = false;
    let yFound = false;
    for (const dataset of data.datasets) {
        const lpw = dataset.label.length;
        if ($.lpw < lpw) {
            $.lpw = lpw;
        }
        dataset.yAxisID = 'Y';
        if (! dataset.label.match(/_date$/i)) {
            yFound = true;
            continue;
        }
        dateFound = true;
        dataset.yAxisID = 'T';
        for (j = 0; j < dataset.data.length; j++) {
            const d = $.date2n($.y2date(dataset.data[j]));
            dataset.data[j] = d;
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
        ajax(method, route + txt, undefined, resp => {
            if (key == 9) { // TAB
                self.value = resp.path;
                for (const respHit of resp.hits) {
                    if (resp.hits.length == 1) break;
                    const hit = $.tag('div');
                    $.appTxt(hit, respHit);
                    hits.appendChild(hit);
                }
            } else if (key == 13) { // ENTER
                on_enter(resp);
            }
        }, resp => {
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
    return Object.values(Object.filter(
        localStorage,
        ([k,v]) => k.match(`^query-${schema}-`) && v.match(re_query)
    ));
}

tabExpand("path", "hits", "/home/", resp => {
    updateChart(resp.data)
    $.resClass($.id('path'), 'loaded');
    $.resClass($.id('select'));
});
$.id("path").onkeyup = ev => {
    if (ev.keyCode == 40) { $.id("schema").focus() }
};

let dbh = '';
tabExpand("schema", "dbhits", "/db/", resp => {
    dbh = resp.dbh
    $.resClass($.id('schema'), 'connected');
    $.id('select').focus();
});
$.id("schema").onkeyup = ev => {
    if (ev.keyCode == 38) { $.id("path").focus() }
};

$.id('select').onkeydown = function(ev) {
    const self = this;
    $.resClass(self);
    const hits = $.id('qhits');
    $.clr(hits);
    if (ev.keyCode == 9) {
        ev.preventDefault();
        for (const query of getQueries()) {
            const hit = $.tag('div');
            $.appTxt(hit, query);
            hit.onclick = () => {
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
    ajax('POST', '/select', { schema: dbh, query: self.value }, resp => {
        updateChart(resp.data);
        $.resClass(self, 'loaded');
        $.resClass($.id('path'));
        storeQuery();
    }, resp => {
        $.resClass(self, 'failed');
    });
};
$.id("select").onkeyup = ev => {
    if (ev.keyCode == 27) { $.id("schema").focus() }
};

// Help
$.id('ahelp').onclick = ev => { $.id('help').style.display = 'block' };
$.id('help').onclick = ev => { ev.currentTarget.style.display = 'none' };
document.onkeypress = ev => {
    if (ev.key == 'F1')     { $.id('help').style.display = 'block' }
    if (ev.key == 'Escape') { $.id('help').style.display = 'none' }
};
