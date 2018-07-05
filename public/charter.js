var $ = {
    id: function(id) { return document.getElementById(id) },
    tag: function(tag) { return document.createElement(tag) },
    txt: function(txt) { return document.createTextNode(txt) },
    appTxt: function(el,txt) { el.appendChild($.txt(txt)) },
    clr: function(el) { while (1) { var c = el.firstChild; if (!c) { break } el.removeChild(c) } return el },
    idClr: function(id) { return $.clr($.id(id)) },
    date2n: function(d) { return moment(d) / (86400000 * 365.2425) + 1970 },
    n2date: function(n) { return moment((n - 1970) * 86400000 * 365.2425 + 1).format('YYYYMMDD') },
    y2date: function(y) { return y == null ? null : moment(y.replace(/^(....)(..)(..)$/, "$1-$2-$3")) },
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
    access: function(o, path, op) {
        var paths = path.split('.');
        var max = paths.length - 1;
        for (var i = 0; i < max; i++) {
            var key = paths[i];
            if (typeof o[key] != 'object') { o[key] = {} }
            o = o[key];
        }
        o[paths[max]] = op(o[paths[max]]);
        return o[paths[max]];
    },
    get: function(o, path) { return $.access(o, path, function(x) { return x }) },
    set: function(o, path, val) { return $.access(o, path, function(x) { return val }) },
    md5: function(s) {function L(k,d){return(k<<d)|(k>>>(32-d))}function K(G,k){var I,d,F,H,x;F=(G&2147483648);H=(k&2147483648);I=(G&1073741824);d=(k&1073741824);x=(G&1073741823)+(k&1073741823);if(I&d){return(x^2147483648^F^H)}if(I|d){if(x&1073741824){return(x^3221225472^F^H)}else{return(x^1073741824^F^H)}}else{return(x^F^H)}}function r(d,F,k){return(d&F)|((~d)&k)}function q(d,F,k){return(d&k)|(F&(~k))}function p(d,F,k){return(d^F^k)}function n(d,F,k){return(F^(d|(~k)))}function u(G,F,aa,Z,k,H,I){G=K(G,K(K(r(F,aa,Z),k),I));return K(L(G,H),F)}function f(G,F,aa,Z,k,H,I){G=K(G,K(K(q(F,aa,Z),k),I));return K(L(G,H),F)}function D(G,F,aa,Z,k,H,I){G=K(G,K(K(p(F,aa,Z),k),I));return K(L(G,H),F)}function t(G,F,aa,Z,k,H,I){G=K(G,K(K(n(F,aa,Z),k),I));return K(L(G,H),F)}function e(G){var Z;var F=G.length;var x=F+8;var k=(x-(x%64))/64;var I=(k+1)*16;var aa=Array(I-1);var d=0;var H=0;while(H<F){Z=(H-(H%4))/4;d=(H%4)*8;aa[Z]=(aa[Z]| (G.charCodeAt(H)<<d));H++}Z=(H-(H%4))/4;d=(H%4)*8;aa[Z]=aa[Z]|(128<<d);aa[I-2]=F<<3;aa[I-1]=F>>>29;return aa}function B(x){var k="",F="",G,d;for(d=0;d<=3;d++){G=(x>>>(d*8))&255;F="0"+G.toString(16);k=k+F.substr(F.length-2,2)}return k}function J(k){k=k.replace(/rn/g,"n");var d="";for(var F=0;F<k.length;F++){var x=k.charCodeAt(F);if(x<128){d+=String.fromCharCode(x)}else{if((x>127)&&(x<2048)){d+=String.fromCharCode((x>>6)|192);d+=String.fromCharCode((x&63)|128)}else{d+=String.fromCharCode((x>>12)|224);d+=String.fromCharCode(((x>>6)&63)|128);d+=String.fromCharCode((x&63)|128)}}}return d}var C=Array();var P,h,E,v,g,Y,X,W,V;var S=7,Q=12,N=17,M=22;var A=5,z=9,y=14,w=20;var o=4,m=11,l=16,j=23;var U=6,T=10,R=15,O=21;s=J(s);C=e(s);Y=1732584193;X=4023233417;W=2562383102;V=271733878;for(P=0;P<C.length;P+=16){h=Y;E=X;v=W;g=V;Y=u(Y,X,W,V,C[P+0],S,3614090360);V=u(V,Y,X,W,C[P+1],Q,3905402710);W=u(W,V,Y,X,C[P+2],N,606105819);X=u(X,W,V,Y,C[P+3],M,3250441966);Y=u(Y,X,W,V,C[P+4],S,4118548399);V=u(V,Y,X,W,C[P+5],Q,1200080426);W=u(W,V,Y,X,C[P+6],N,2821735955);X=u(X,W,V,Y,C[P+7],M,4249261313);Y=u(Y,X,W,V,C[P+8],S,1770035416);V=u(V,Y,X,W,C[P+9],Q,2336552879);W=u(W,V,Y,X,C[P+10],N,4294925233);X=u(X,W,V,Y,C[P+11],M,2304563134);Y=u(Y,X,W,V,C[P+12],S,1804603682);V=u(V,Y,X,W,C[P+13],Q,4254626195);W=u(W,V,Y,X,C[P+14],N,2792965006);X=u(X,W,V,Y,C[P+15],M,1236535329);Y=f(Y,X,W,V,C[P+1],A,4129170786);V=f(V,Y,X,W,C[P+6],z,3225465664);W=f(W,V,Y,X,C[P+11],y,643717713);X=f(X,W,V,Y,C[P+0],w,3921069994);Y=f(Y,X,W,V,C[P+5],A,3593408605);V=f(V,Y,X,W,C[P+10],z,38016083);W=f(W,V,Y,X,C[P+15],y,3634488961);X=f(X,W,V,Y,C[P+4],w,3889429448);Y=f(Y,X,W,V,C[P+9],A,568446438);V=f(V,Y,X,W,C[P+14],z,3275163606);W=f(W,V,Y,X,C[P+3],y,4107603335);X=f(X,W,V,Y,C[P+8],w,1163531501);Y=f(Y,X,W,V,C[P+13],A,2850285829);V=f(V,Y,X,W,C[P+2],z,4243563512);W=f(W,V,Y,X,C[P+7],y,1735328473);X=f(X,W,V,Y,C[P+12],w,2368359562);Y=D(Y,X,W,V,C[P+5],o,4294588738);V=D(V,Y,X,W,C[P+8],m,2272392833);W=D(W,V,Y,X,C[P+11],l,1839030562);X=D(X,W,V,Y,C[P+14],j,4259657740);Y=D(Y,X,W,V,C[P+1],o,2763975236);V=D(V,Y,X,W,C[P+4],m,1272893353);W=D(W,V,Y,X,C[P+7],l,4139469664);X=D(X,W,V,Y,C[P+10],j,3200236656);Y=D(Y,X,W,V,C[P+13],o,681279174);V=D(V,Y,X,W,C[P+0],m,3936430074);W=D(W,V,Y,X,C[P+3],l,3572445317);X=D(X,W,V,Y,C[P+6],j,76029189);Y=D(Y,X,W,V,C[P+9],o,3654602809);V=D(V,Y,X,W,C[P+12],m,3873151461);W=D(W,V,Y,X,C[P+15],l,530742520);X=D(X,W,V,Y,C[P+2],j,3299628645);Y=t(Y,X,W,V,C[P+0],U,4096336452);V=t(V,Y,X,W,C[P+7],T,1126891415);W=t(W,V,Y,X,C[P+14],R,2878612391);X=t(X,W,V,Y,C[P+5],O,4237533241);Y=t(Y,X,W,V,C[P+12],U,1700485571);V=t(V,Y,X,W,C[P+3],T,2399980690);W=t(W,V,Y,X,C[P+10],R,4293915773);X=t(X,W,V,Y,C[P+1],O,2240044497);Y=t(Y,X,W,V,C[P+8],U,1873313359);V=t(V,Y,X,W,C[P+15],T,4264355552);W=t(W,V,Y,X,C[P+6],R,2734768916);X=t(X,W,V,Y,C[P+13],O,1309151649);Y=t(Y,X,W,V,C[P+4],U,4149444226);V=t(V,Y,X,W,C[P+11],T,3174756917);W=t(W,V,Y,X,C[P+2],R,718787259);X=t(X,W,V,Y,C[P+9],O,3951481745);Y=K(Y,h);X=K(X,E);W=K(W,v);V=K(V,g)}var i=B(Y)+B(X)+B(W)+B(V);return i.toLowerCase()},
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
        x_label: 'foo',
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
        scales: {
            xAxes: [{ scaleLabel: { display: true, labelString: '' } }],
            yAxes: [
                { id: 'Y', type: 'linear', position: 'left' },
                { id: 'T', type: 'linear', position: 'right', gridLines: { borderDash: [5,5] } },
            ],
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
    for (i = 0; i < data.datasets.length; i++) {
        var lpw = data.datasets[i].label.length;
        if ($.lpw < lpw) {
            $.lpw = lpw;
        }
        data.datasets[i].yAxisID = 'Y';
        if (! data.datasets[i].label.match(/_date$/i))
            continue;
        data.datasets[i].yAxisID = 'T';
        for (j = 0; j < data.datasets[i].data.length; j++) {
            var d = $.date2n($.y2date(data.datasets[i].data[j]));
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

function storeQuery() {
    var schema = $.id("schema").value.split('/')[1];
    var query = $.id("select").value;
    var md5 = $.md5(query);
    var key = 'query-' + schema + '-' + md5;
    localStorage[key] = query;
}

function getQueries() {
    var schema = $.id("schema").value.split('/')[1];
    var query = $.id("select").value;
    var re_query = '^' + query.replace(/[.^$+*?{}()\[\]]/g, "\\$&");
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
    var hits = $.id('qhits');
    $.clr(hits);
    if (ev.keyCode == 9) {
        ev.preventDefault();
        var queries = getQueries();
        for (i = 0; i < queries.length; i++) {
            var hit = $.tag('div');
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
    var self = this;
    if (ev.keyCode == 27) { $.id("schema").focus() }
};

// Help
$.id('ahelp').onclick = function(ev) { $.id('help').style.display = 'block' };
$.id('help').onclick = function(ev) { this.style.display = 'none' };
document.onkeypress = function(ev) {
    if (ev.key == 'F1')     { $.id('help').style.display = 'block' }
    if (ev.key == 'Escape') { $.id('help').style.display = 'none' }
};
