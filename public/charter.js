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
};

// Chart on canvas
var canvas = $.id('chart');
var ctx = canvas.getContext('2d');
var chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ["January", "February", "March", "April", "May", "June", "July"],
        datasets: [
            { label: "First", data: [0, 10, 5, 2, 20, 30, 45], },
            { label: "Second", data: [32, 9, 8, -2, 23, 25, 31], },
            { label: "Foo", data: [32, -9, 8, 2, 23, -25, 31], },
            { label: "Bar", data: [-32, 9, -8, -2, null, 25, -31], borderColor: 'rgb(255, 99, 132)',},
        ]
    },
    options: {
        elements: {
            line: {
                borderWidth: 1,
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

// File input field
$.id("path").onkeydown = function(ev) {
    var key = ev.keyCode;
    var hits = $.id('hits');
    $.clr(hits);
    if (key != 9 && key != 13) { return }
    var self = this;
    var txt = self.value;
    ev.preventDefault();
    var r = new XMLHttpRequest();
    r.onreadystatechange = function() {
        if (r.readyState == 4 && r.status == 200) {
            var resp = JSON.parse(r.responseText);
            if (key == 9) { // TAB
                self.value = resp.path;
                for (i = 0; i < resp.hits.length; i++) {
                    if (resp.hits.length == 1) break;
                    var hit = $.tag('div');
                    $.appTxt(hit, resp.hits[i]);
                    hits.appendChild(hit);
                }
            } else if (resp.data) { // ENTER
                var data = resp.data;
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
                chart.data = resp.data;
                chart.update();
                console.log($.lpw);
            }
        }
    }
    var method = key == 9 ? "GET" : "POST";
    r.open(method, "/home/" + txt, true);
    r.send();
};
