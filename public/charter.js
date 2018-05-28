var $ = {
    id: function(id) { return document.getElementById(id) },
    tag: function(tag) { return document.createElement(tag) },
    txt: function(txt) { return document.createTextNode(txt) },
    appTxt: function(el,txt) { el.appendChild($.txt(txt)) },
    clr: function(el) { while (1) { var c = el.firstChild; if (!c) { break } el.removeChild(c) } return el },
    idClr: function(id) { return $.clr($.id(id)) },
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
            // borderColor: 'rgb(255, 99, 132)',
    },
    options: {
        elements: {
            line: {
                borderWidth: 1,
                tension: 0,
                backgroundColor: 'rgba(255,255,255,0)',
            },
            point: {
                radius: 0,
            },
        },
        tooltips: { mode: 'x' },
        animation: { duration : 0 },
        hover : { animationDuration : 0 },
        responsiveAnimationDuration: 0,
        pan: { enabled: true },
        zoom: { enabled: true },
    }
});
canvas.ondblclick = function(ev) {
    console.log('Canvas double clicked');
    chart.resetZoom();
};
 
// File input field
$.id("path").onkeydown = function(ev) {
    var key = ev.keyCode;
    if (key != 9 && key != 13) { return }
    var self = this;
    var txt = self.value;
    ev.preventDefault();
    var r = new XMLHttpRequest();
    r.onreadystatechange = function() {
        if (r.readyState == 4 && r.status == 200) {
            var data = JSON.parse(r.responseText);
            if (key == 9) { // TAB
                self.value = data.path;
            } else if (data.data) { // ENTER
                chart.data = data.data;
                chart.update();
            }
        }
    }
    var method = key == 9 ? "GET" : "POST";
    r.open(method, "/home/" + txt, true);
    r.send();
};
