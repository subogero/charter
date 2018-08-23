Object.filter = (o, f) => Object.assign({},
    ...
    Object.entries(o)
    .filter(f)
    .map(([k,v]) => ({[k]:v}))
);
const _ = {
    id: id => document.getElementById(id),
    tag: tag => document.createElement(tag),
    txt: txt => document.createTextNode(txt),
    appTxt: (el,txt) => { el.appendChild(_.txt(txt)) },
    clr: el => { while (1) { const c = el.firstChild; if (!c) { break } el.removeChild(c) } return el },
    idClr: id => _.clr(_.id(id)),
    date2n: d => moment(d) / (86400000 * 365.2425) + 1970,
    n2date: n => moment((n - 1970) * 86400000 * 365.2425 + 1).format('YYYYMMDD'),
    y2date: y => y == null ? null : moment(y.replace(/^(....)(..)(..)$/, "$1-$2-$3")),
    lpw: 10,
    leftpad: s => { s = s.substr(0,_.lpw); const ls = s.length; return ' '.repeat(_.lpw-ls) + s },
    resClasses: {},
    resClass: (el, ...args) => {
        for (let key of Object.keys(_.resClasses)) { el.classList.remove(key) }
        if (args.length == 0) { return }
        const key = args[0];
        _.resClasses[key] = 1;
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
    get: (o, path) => _.access(o, path, x => x),
    set: (o, path, val) => _.access(o, path, x => val),
    md5: md5_min,
    txt2html: txt =>
        txt == undefined ? '' :
        txt
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/\n/g, "<br>"),
    query2obj: () => {
        const query = window.location.search.substring(1);
        if (!query)
            return {};
        const params = query.split('&');
        return Object.assign({},
           ...
           params.map(p => {
               const [k,v] = p.split('=');
               return {[k]:decodeURIComponent(v)};
           }),
        );
    },
};

function http(route, method, data) {
    if (method == undefined) method = 'GET';
    const body = data == undefined ? [] : [ JSON.stringify(data) ];
    return new Promise((resolve, reject) => {
        const r = new XMLHttpRequest();
        r.open(method, route, true);
        r.onload = () => {
            const resp = {};
            try { Object.assign(resp, JSON.parse(r.responseText)) }
            catch(err) {}
            if (r.status >= 200 && r.status < 300) {
                _.id('err').innerHTML = '';
                resolve(resp);
            } else {
                _.id('err').innerHTML = _.txt2html(resp.error);
                reject(Object.assign(resp, { status: r.status, statusText: r.statusText }));
            }
        };
        r.onerror = () => {
            reject({ error: 'Network error' });
        }
        if (data) r.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        r.send(...body);
    });
}

// Chart on canvas
const canvas = _.id('chart');
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
                        val = _.n2date(val);
                    }
                    return _.leftpad(key) + '  ' + val;
                },
                footer: (a,d) => "Zoom: wheel drag double-click",
            },
        },
        animation: { duration : 0 },
        hover : { animationDuration : 0 },
        responsiveAnimationDuration: 0,
        maintainAspectRatio: false,
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
    _.lpw = 0;
    chart.options.scales.xAxes[0].scaleLabel.labelString = data.x_label;
    let dateFound = false;
    let yFound = false;
    for (const dataset of data.datasets) {
        const lpw = dataset.label.length;
        if (_.lpw < lpw) {
            _.lpw = lpw;
        }
        dataset.yAxisID = 'Y';
        if (! dataset.label.match(/_date$/i)) {
            yFound = true;
            continue;
        }
        dateFound = true;
        dataset.yAxisID = 'T';
        for (j = 0; j < dataset.data.length; j++) {
            const d = _.date2n(_.y2date(dataset.data[j]));
            dataset.data[j] = d;
        }
    }
    chart.options.scales.yAxes = [];
    if (yFound) chart.options.scales.yAxes.push(yAxis);
    if (dateFound) chart.options.scales.yAxes.push(tAxis);

    chart.options.elements.line.borderWidth = 1;
    chart.data = data;
    chart.update();
    console.log(_.lpw);
}

function data2CSV(data) {
    let csv = data.x_label + ',';
    csv += data.datasets.map(e => e.label).join(',') + "\n";
    for (i = 0; i < data.labels.length; i++) {
        csv += data.labels[i] + ',';
        csv += data.datasets.map(e => {
            const cell = e.data[i];
            const col = e.label;
            if (cell == null) return '';
            if (typeof cell == 'string') return cell;
            if (isNaN(cell)) return '';
            if (col.match('_date$')) return _.n2date(cell);
            return cell.toString();
        }).join(',');
        csv += "\n";
    }
    return csv;
}

function tabExpand(el, el_hits, route, on_enter) {
    _.id(el).onkeydown = function(ev) {
        const self = this;
        _.resClass(self);
        const key = ev.keyCode;
        const hits = _.id(el_hits);
        _.clr(hits);
        if (key != 9 && key != 13) { return }
        const txt = self.value;
        console.log("tabExpand", txt);
        ev.preventDefault();
        const method = key == 9 ? "GET" : "POST";
        _.resClass(self, 'processing');
        http(route + txt, method)
        .then(resp => {
            if (key == 9) { // TAB
                self.value = resp.path;
                for (const respHit of resp.hits) {
                    if (resp.hits.length == 1) break;
                    const hit = _.tag('div');
                    _.appTxt(hit, respHit);
                    hits.appendChild(hit);
                }
            } else if (key == 13) { // ENTER
                on_enter(resp);
            }
        })
        .catch(resp => {
            _.resClass(self, 'failed');
        });
    }
}

function storeQuery() {
    const schema = _.id("schema").value.split('/')[1];
    const query = _.id("select").value;
    const md5 = _.md5(query);
    const key = 'query-' + schema + '-' + md5;
    localStorage[key] = query;
}

function getQueries() {
    const schema = _.id("schema").value.split('/')[1];
    const query = _.id("select").value;
    const re_query = '^' + query.replace(/[.^$+*?{}()\[\]]/g, "\\$&");
    return Object.values(Object.filter(
        localStorage,
        ([k,v]) => k.match(`^query-${schema}-`) && v.match(re_query)
    ));
}

// path input field
function path_load(resp) {
    _.id('plink').value =
        window.location.origin +
        "?path=" + encodeURI(_.id("path").value);
    updateChart(resp.data)
    _.resClass(_.id('path'), 'loaded');
    _.resClass(_.id('select'));
}
tabExpand("path", "hits", "/home/", path_load);
_.id("path").onkeyup = ev => {
    if (ev.keyCode == 40) { _.id("schema").focus() }
};

// schema input field
let dbh = '';
function schema_load(resp) {
    dbh = resp.dbh
    _.resClass(_.id('schema'), 'connected');
    _.id('select').focus();
}
tabExpand("schema", "dbhits", "/db/", schema_load);
_.id("schema").onkeyup = ev => {
    if (ev.keyCode == 38) { _.id("path").focus() }
};

// select input field
function send_select(self) {
    _.resClass(self, 'processing');
    _.idClr('plink');
    http('/select', 'POST', { schema: dbh, query: self.value })
    .then(resp => {
        _.id('plink').value =
            window.location.origin +
            "?schema=" + encodeURIComponent(_.id("schema").value) +
            "&select=" + encodeURIComponent(_.id("select").value);
        updateChart(resp.data);
        _.resClass(self, 'loaded');
        _.resClass(_.id('path'));
        storeQuery();
    })
    .catch(err => {
        _.id('err').innerHTML = err;
        _.resClass(self, 'failed');
    });
}
_.id('select').onkeydown = function(ev) {
    const self = this;
    _.resClass(self);
    const hits = _.id('qhits');
    _.clr(hits);
    if (ev.keyCode == 9) {
        ev.preventDefault();
        for (const query of getQueries()) {
            const hit = _.tag('div');
            _.appTxt(hit, query);
            hit.onclick = () => {
                self.value = query;
                self.focus();
                _.clr(hits);
            };
            hits.appendChild(hit);
        }
        return;
    } else if (!ev.ctrlKey || ev.keyCode != 13) {
        return;
    }
    send_select(self);
};
_.id("select").onkeyup = ev => {
    if (ev.keyCode == 27) { _.id("schema").focus() }
};

// Help
_.id('ahelp').onclick = ev => { _.id('help').style.display = 'block' };
_.id('help').onclick = ev => { ev.currentTarget.style.display = 'none' };
document.onkeypress = ev => {
    if (ev.key == 'F1')     { _.id('help').style.display = 'block' }
    if (ev.key == 'Escape') { _.id('help').style.display = 'none' }
};

// Permalink support
window.onload = ev => {
    const query = _.query2obj();
    console.log(query);
    for (const [key,val] of Object.entries(query)) {
        const input = _.id(key);
        if (input == null)
            continue;
        input.value = val;
        if (key == 'path') {
            http('/home/' + val, 'POST')
            .then(path_load)
            .catch(err => { _.id('err').innerHTML = err; _.resClass(_.id('path'), 'failed') });
        } else if (key == 'schema') {
            dbh = val.split('/')[1];
            http('/db/' + val, 'POST')
            .then(schema_load)
            .catch(err => { _.id('err').innerHTML = err; _.resClass(_.id('schema'), 'failed') });
        } else if (key == 'select') {
            send_select(_.id('select'));
        }
    }
    _.id('clink').onclick = function(ev) {
        _.id('plink').select();
        document.execCommand('copy');
    };
    _.id('dlink').onclick = ev => {
        const csv = data2CSV(chart.data);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = _.tag('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'charter.csv');
        link.style = "visibility:hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
};
