var m = m || {};
(function () {
    var nav_event;
    if (document.createEvent) {
        nav_event = document.createEvent('HTMLEvents');
        nav_event.initEvent('nav', false, true);
    }
    // 换乘站
    var $station = [];

    var map = {
        data: null, 	// 地图原始数据
        line: [],		// 线路对象
        stations: [],	// station对象
        line_width: 6,	// 路线宽度
        min_scale: 0.65,
        max_scale: 3,

        scale: 1,		// 当前缩放比
        left: 0,		// 左右偏移
        top: -100,			// 上下偏移
        width: 0,		// 缩放后的宽度
        height: 0,		// 缩放后的高度
        drag: false,
        url: null,

        ele: document.getElementById('map-ele'),
        $ele: null,
        slayer: document.getElementById('station-ele'),
        line_canvas: document.getElementById("line-ele"),
        plan_canvas: document.getElementById("plan-ele"),
        line_cxt: undefined,
        plan_ctx: undefined,
        navigation: null,
        init: function (data, url) {
            this.data = data;
            this.url = url || '';
            this.navigation = nav;
            this.line_cxt = this.line_canvas.getContext('2d');
            this.plan_ctx = this.plan_canvas.getContext('2d');
            this.width = this.line_canvas.width = this.plan_canvas.width = this.line_canvas.parentNode.clientWidth;
            this.height = this.line_canvas.height = this.plan_canvas.height = this.line_canvas.parentNode.clientHeight;
            this.left = (this.width - 1600) / 2;
            this.top = (this.height - this.height / this.width * 1900) / 2;
            // 线路
            for (var i = 0; i < this.data.length; i++) {
                var line = new Line(this.data[i]);
                line.draw(this.line_cxt);
                this.line.push(line);
                // 站点
                $k = [];
                for (var j = 0; j < this.data[i].stations.length; j++) {
                    var repeat = null;
                    for (var k = 0; k < this.stations.length; k++) {
                        if (this.stations[k].name == this.data[i].stations[j].name && this.stations[k].name) {
                            this.stations[k].parent.push(this.line[i]);
                            repeat = this.stations[k];
                            $k.push(k);
                            $station.push(this.data[i].stations[j]);
                        }
                    }
                    if (!repeat && this.data[i].stations[j].name != undefined) {
                        var station = new Station(this.data[i].stations[j], this.line[i]);
                        station.index = [j];
                        this.stations.push(station);
                        this.line[i].stations.push(station);
                    } else if (this.data[i].stations[j].name != undefined) {
                        repeat.index.push(j);
                        this.line[i].stations.push(repeat);
                        repeat = null;
                    }
                }
            }
            this.$ele = $(this.ele);

            this.bind();
            this.update();

            var _this = this;
            window.addEventListener('resize', function () {
                _this.width = _this.line_canvas.width = _this.plan_canvas.width = _this.line_canvas.parentNode.clientWidth;
                _this.height = _this.line_canvas.height = _this.plan_canvas.height = _this.line_canvas.parentNode.clientHeight;
                _this.update();
            })
        },
        focus: function (num) {
            nav.cancel();
            var line = this.line[num];
            for (var i = 0; i < this.stations.length; i++) {
                var s = this.stations[i];
                for (var j = 0; j < s.parent.length; j++) {
                    if (s.parent[j] != line) {
                        s.parent[j].visible = false;
                        s.ele.className = 'hide';
                    } else {
                        if (s.run) s.ele.className = '';
                        s.parent[j].visible = true;
                        break;
                    }
                }
            }

            // this.scale = 1;
            // this.left = this.top = 0;
            this.update();
        },
        bind: function () {
            var _this = this;
            var mousedown = false,
                mousemove = false,
                sx, sy, sl = 0, st = 0;
            var touchstart = false;
            var touchmove = false;
            var old = 1;

            function onmousewheel(e) {
                e.preventDefault();
                if (e.deltaY < 0) {
                    if (_this.scale <= _this.minscale) return;
                    _this.scale -= 0.2;
                } else {
                    if (_this.scale >= _this.maxscale) return;
                    _this.scale += 0.2;
                }
                // 更新宽高
                _this.width = 1000 * _this.scale;
                _this.height = 1000 * _this.scale;
                _this.left = (_this.line_canvas.width - 1000 * _this.scale) / 2;
                _this.top = (_this.line_canvas.height - (_this.line_canvas.height / _this.line_canvas.width * 1000) * _this.scale) / 2;
                _this.update();
            }

            function onmousemove(e) {
                e.preventDefault();
                if (mousedown) {
                    _this.drag = true;
                    var X = e.touches ? e.touches[0].clientX : e.clientX;
                    var Y = e.touches ? e.touches[0].clientY : e.clientY;

                    _this.left = X - sx + sl,
                        _this.top = Y - sy + st;
                    $(_this.slayer).attr('style', 'left:' + (_this.left - sl) + 'px;top:' + (_this.top - st) + 'px;-webkit-transform:translate3d(0,0,2);transform:translate3d(0,0,2);');
                    _this.update(true);
                }
            }

            function onmousedown(e) {
                mousedown = true;
                mousemove = false;
                sl = _this.left;
                st = _this.top;
                sx = e.touches ? e.touches[0].clientX : e.clientX;
                sy = e.touches ? e.touches[0].clientY : e.clientY;
            }

            function onmouseup(e) {
                if (!(e.clientX == sx && e.clientY == sy)) mousemove = true;
                _this.drag = false;
                $(_this.slayer).attr('style', 'left:0;top:0;');
                for (var i = 0; i < _this.stations.length; i++) {
                    _this.stations[i].update();
                }
                //nav.draw(_this.fcxt, _this.drag);
                mousedown = false;
                sl = _this.left;
                st = _this.top;
                if (!mousemove) {
                    for (var i = 0; i < _this.line.length; i++) {
                        _this.line[i].visible = true;
                        for (var j = 0; j < _this.line[i].stations.length; j++) {
                            if (_this.line[i].stations[j].run) _this.line[i].stations[j].ele.className = '';
                        }
                    }
                    if (!(e.target.tagName == 'I' || e.target.tagName == 'i')) nav.cancel();
                }
                _this.update();
            }

            function onTouchMove(e) {
                e.preventDefault();
                var touches = e.touches;
                if (touches.length === 2) {
                    console.log(touches);
                    var distance = getDistance(touches);
                    old = old === 1 ? distance : old;
                    var d = distance / old;
                    if (d > 1) {
                        _this.scale += 0.1;
                    } else if (d < 1) {
                        _this.scale -= 0.1;
                    }
                    if (_this.scale > _this.max_scale) {
                        _this.scale = _this.max_scale
                    }
                    if (_this.scale < _this.min_scale) {
                        _this.scale = _this.min_scale
                    }
                    old = distance;
                    _this.width = 1000 * _this.scale;
                    _this.height = 1000 * _this.scale;
                    _this.update();
                } else if (touches.length === 1) {
                    _this.drag = true;
                    _this.panel = null;
                    var X = e.touches ? e.touches[0].clientX : e.clientX;
                    var Y = e.touches ? e.touches[0].clientY : e.clientY;

                    _this.left = X - sx + sl,
                        _this.top = Y - sy + st;
                    $(_this.slayer).attr('style', 'left:' + (_this.left - sl) + 'px;top:' + (_this.top - st) + 'px;-webkit-transform:translate3d(0,0,2);transform:translate3d(0,0,2);');
                    _this.update(true);
                }
                $('.station-panel').hide(0);
            }

            function getDistance(points) {
                var dx = points[0].clientX - points[1].clientX;
                var dy = points[0].clientY - points[1].clientY;
                return Math.round(Math.abs(dx) * Math.abs(dy));
            }

            this.$ele.on('mousemove', onmousemove);
            this.$ele.on('mousedown', onmousedown);
            this.$ele.on('mouseup', onmouseup);
            this.$ele.on('mousewheel', onmousewheel);


            this.ele.addEventListener('touchmove', onTouchMove);
            this.ele.addEventListener('touchstart', onmousedown);
            this.ele.addEventListener('touchend', onmouseup);
        },
        update: function (move) {
            this.line_cxt.clearRect(0, 0, this.line_canvas.width, this.line_canvas.height);
            for (var i = 0; i < this.line.length; i++) {
                this.line[i].draw(this.line_cxt);
            }

            nav.draw(this.plan_ctx, this.drag);


            if (move) return;
            for (var i = 0; i < this.stations.length; i++) {
                this.stations[i].update();
            }
            for (var j = 0; j < this.line.length; j++) {
                this.line[j].update();
                // console.log(0)
            }
        },
        nav: function (sid, eid) {
            if (sid == 0 || eid == 0) {
                return;
            }
            for (var i = 0; i < this.stations.length; i++) {
                if (this.stations[i].data.zid == sid) nav.start_s = this.stations[i];
                if (this.stations[i].data.zid == eid) nav.end_s = this.stations[i];
            }
            nav.start(nav.start_s);
            nav.end(nav.end_s);
            nav.middle(nav.middle_s);
            nav.init();

        },
        nav_data: function (data) {
            nav.setData(data);
        }
    };

    function Line(data) {
        this.data = data;
        this.id = data.id;
        this.name = data.name || '未开通';
        this.color = data.color || '#999';
        this.run = !data.disabled;
        this.$ele = []; // 线路名称
        this.visible = true;
        this.stations = [];
        this.init();
    }

    Line.prototype = {
        init: function () {
            var n = (this.id == 5 || this.id == 2) ? 1 : 2;
            for (var i = 0; i < n; i++) {
                var ele = document.createElement('div');
                ele.className = "line-num";
                ele.dataset.id = this.id;
                this.$ele[i] = $(ele);
                this.$ele[i].html(this.name);
                $(map.slayer).append($(ele));
            }
            // 更新站点名称位置
            this.update();
        },
        draw: function (cxt) {
            var line = this.data.stations;
            cxt.strokeStyle = this.color;
            cxt.lineWidth = map.line_width;
            if (!this.visible) {
                cxt.globalAlpha = 0.1;
            } else if (!this.run) {
                cxt.globalAlpha = 0.4;
            } else {
                cxt.globalAlpha = 1;
            }
            cxt.beginPath();
            cxt.moveTo(line[0].position[0] * map.scale + map.left, line[0].position[1] * map.scale + map.top);
            for (var i = 0; i < line.length; i++) {
                var p = line[i].position;
                if (line[i].position.length === 5) {
                    cxt.arcTo(
                        p[0] * map.scale + map.left,
                        p[1] * map.scale + map.top,
                        p[2] * map.scale + map.left,
                        p[3] * map.scale + map.top,
                        p[4] * map.scale);
                } else {
                    cxt.lineTo(
                        p[0] * map.scale + map.left,
                        p[1] * map.scale + map.top
                    );
                }
            }
            cxt.stroke();
        },
        update: function () {
            if (this.$ele[0][0].dataset.id == 3) {
                this.$ele[0].attr('style', 'left: ' + (this.data.stations[0].position[0] * map.scale + map.left - 25) + 'px; top: ' + (this.data.stations[0].position[1] * map.scale + map.top - 50) + 'px;background: ' + this.color + ';opacity :' + (!this.visible ? 0.1 : this.run ? 1 : 0.5));
            } else {
                this.$ele[0].attr('style', 'left: ' + (this.data.stations[0].position[0] * map.scale + map.left - 75) + 'px; top: ' + (this.data.stations[0].position[1] * map.scale + map.top - 15) + 'px;background: ' + this.color + ';opacity :' + (!this.visible ? 0.1 : this.run ? 1 : 0.5));
            }

            if (this.$ele[1]) this.$ele[1].attr('style', 'left: ' + (this.data.stations[this.data.stations.length - 1].position[0] * map.scale + map.left + 10) + 'px; top: ' + (this.data.stations[this.data.stations.length - 1].position[1] * map.scale + map.top - 15) + 'px;background: ' + this.color + ';opacity :' + (!this.visible ? 0.1 : this.run ? 1 : 0.5));
        }
    };

    function Station(data, p) {
        this.data = data,
            this.parent = [p],
            this.id = data.id,
            this.index = null,
            this.run = this.data.run,
            this.name = data.name,
            this.text_p = data.text,
            this.x = data.position[0],
            this.y = data.position[1],
            this.ele = null;
        this.$ele = null;
        this.panel = null;
        this.init();
    }

    Station.prototype = {
        init: function () {
            if (this.name == undefined) return;
            var ele = document.createElement('i');
            ele.innerHTML = '<span class="' + (this.text_p ? this.text_p : '') + '">' + this.name + '</span>';
            this.ele = ele;
            this.$ele = $(ele);
            // map.slayer.appendChild(ele);
            $(map.slayer).append(this.$ele);
            // if (!this.name) ele.className = 'hide';
            for (var i = 0; i < this.parent.length; i++) {
                if (!this.parent[i].run) {
                    ele.className = 'hide';
                }
            }
            if (!this.run) ele.className = 'hide';
            var style = 'left:' + (this.x * map.scale + map.left - (this.ele.clientWidth / 2)) + 'px;top:' + (this.y * map.scale + map.top) + 'px;' +
                (this.parent.length > 1 ? 'width: 15px;height:15px;background-image: url(' + baseUrl + 'img/change.png);' : '');
            this.$ele.attr('style', style);
            this.bind();
        },
        update: function () {
            if (!this.ele) return;
            var style = 'left:' + (this.x * map.scale + map.left - (this.ele.clientWidth / 2)) + 'px;top:' + (this.y * map.scale + map.top) + 'px;' +
                (this.parent.length > 1 ? 'width: 15px;height:15px;background-image: url(' + baseUrl + 'img/change.png);' : '');
            this.$ele.attr('style', style);
            if (map.scale <= 0.7) {
                this.ele.style.opacity = '0';
            } else if (map.scale <= 0.8) {
                this.ele.style.fontSize = '0';
            } else if (map.scale > 0.8 && map.scale <= 1.5) {
                this.ele.style.fontSize = '12px';
            } else if (map.scale > 1.5 && map.scale <= 2.5) {
                this.ele.style.fontSize = '14px';
            } else {
                this.ele.style.fontSize = '16px';
            }
        },
        bind: function () {
            var _this = this;
            var panel_hover = false;
            this.$ele.on('mouseenter', function () {
                if (_this.name && !_this.panel) {
                    var panel = document.createElement('div');
                    panel.className = 'station-panel';
                    var temp = '<p class="s-name">' + _this.name + '<a href="' + map.url + _this.data.zid + '" target="_blank">详情</a></p>';
                    for (var i = 0; i < _this.parent.length; i++) {
                        for (var j = 0; j < _this.parent[i]['stations'].length; j++) {
                            if (_this.id == _this.parent[i]['stations'][j]['id'] && _this.parent[i].id == 5) {
                                if (i < 1) {
                                    temp += '<div class="s-line">'
                                        + '<p class="s-line-name" style="border-color: '
                                        + _this.parent[i].color + ';color: '
                                        + _this.parent[i].color + '">'
                                        + _this.parent[i].name + '</p>'
                                        + '<p><span>'
                                        + _this.parent[i].data.start_station
                                        + '</span><span>首车 '
                                        + _this.parent[i]['stations'][j].data.first_up_time
                                        + '</span><span>末车 '
                                        + _this.parent[i]['stations'][j].data.last_up_time
                                        + '</span></p>'
                                        + '<p><span>'
                                        + _this.parent[i].data.end_station
                                        + '</span><span>首车 '
                                        + _this.parent[i]['stations'][j].data.first_down_time
                                        + '</span><span>末车 '
                                        + _this.parent[i]['stations'][j].data.last_down_time
                                        + '</span></p>'
                                        + '</div>';
                                    break;
                                } else {
                                    for ($i in $station) {
                                        if ($station[$i].name == _this.name) {
                                            temp += '<div class="s-line">'
                                                + '<p class="s-line-name" style="border-color: '
                                                + _this.parent[i].color + ';color: '
                                                + _this.parent[i].color + '">'
                                                + _this.parent[i].name + '</p>'
                                                + '<p><span>'
                                                + _this.parent[i].data.start_station
                                                + '</span><span>首车 '
                                                + $station[$i].first_up_time
                                                + '</span><span>末车 '
                                                + $station[$i].last_up_time
                                                + '</span></p>'
                                                + '<p><span>'
                                                + _this.parent[i].data.end_station
                                                + '</span><span>首车 '
                                                + $station[$i].first_down_time
                                                + '</span><span>末车 '
                                                + $station[$i].last_down_time
                                                + '</span></p>'
                                                + '</div>';
                                        }
                                    }
                                    break;
                                }
                            }
                            if (_this.id == _this.parent[i]['stations'][j]['id'] && i < 1) {
                                temp += '<div class="s-line">' +
                                    '<p class="s-line-name" style="border-color: '
                                    + _this.parent[i].color
                                    + ';color: '
                                    + _this.parent[i].color
                                    + '">'
                                    + _this.parent[i].name
                                    + '</p>'
                                    + '<p><span>'
                                    + _this.parent[i].data.start_station
                                    + '－'
                                    + _this.parent[i].data.end_station
                                    + ' (下行)</span><span>首车 '
                                    + _this.parent[i]['stations'][j].data.first_down_time
                                    + '</span><span>末车 '
                                    + _this.parent[i]['stations'][j].data.last_down_time
                                    + '</span></p>'
                                    + '<p><span>'
                                    + _this.parent[i].data.end_station
                                    + '－'
                                    + _this.parent[i].data.start_station
                                    + ' (上行)</span><span>首车 '
                                    + _this.parent[i]['stations'][j].data.first_up_time
                                    + '</span><span>末车 '
                                    + _this.parent[i]['stations'][j].data.last_up_time
                                    + '</span></p>'
                                    + '</div>'
                            } else if (_this.id == _this.parent[i]['stations'][j]['id'] && i > 0) {
                                for ($i in $station) {
                                    if ($station[$i].name == _this.name) {
                                        temp += '<div class="s-line">' +
                                            '<p class="s-line-name" style="border-color: '
                                            + _this.parent[i].color
                                            + ';color: '
                                            + _this.parent[i].color
                                            + '">' + _this.parent[i].name
                                            + '</p>'
                                            + '<p><span>'
                                            + _this.parent[i].data.start_station
                                            + '－'
                                            + _this.parent[i].data.end_station
                                            + ' (下行)</span><span>首车 '
                                            + $station[$i].first_down_time
                                            + '</span><span>末车 '
                                            + $station[$i].last_down_time
                                            + '</span></p>'
                                            + '<p><span>'
                                            + _this.parent[i].data.end_station
                                            + '－'
                                            + _this.parent[i].data.start_station
                                            + ' (上行)</span><span>首车 '
                                            + $station[$i].first_up_time
                                            + '</span><span>末车 '
                                            + $station[$i].last_up_time
                                            + '</span></p>'
                                            + '</div>'
                                    }
                                }
                            }
                        }
                    }
                    panel.innerHTML = temp;
                    $(map.slayer).append($(panel));
                    var l = _this.x * map.scale + map.left, t = _this.y * map.scale + map.top;
                    var left = (l + panel.clientWidth) > map.line_canvas.width ? (map.line_canvas.width - panel.clientWidth - 10) : l + 10;
                    var top = (t + panel.clientHeight) > map.line_canvas.height ? (map.line_canvas.height - panel.clientHeight - 10) : t + 10;
                    $(panel).attr('style', 'left: ' + left + 'px;top: ' + top + 'px;');
                    _this.panel = panel;
                    $(_this.panel).on('mouseenter', function () {
                        panel_hover = true;
                    });
                    $(_this.panel).on('mouseleave', function (e) {
                        panel_hover = false;
                        map.slayer.removeChild(_this.panel);
                        _this.panel = null;
                    })
                }
            });
            this.$ele.on('mouseleave', function (e) {
                setTimeout(function () {
                    if (_this.name && !panel_hover && _this.panel) {
                        map.slayer.removeChild(_this.panel);
                        _this.panel = null;
                    }
                }, 100);
            });
            // this.$ele.on('click', function () {
            //     if (!_this.name) return false;
            //     if (nav.start_s == _this) {
            //         if (!nav.end_s) nav.cancel('start');
            //         else nav.cancel();
            //     } else if (nav.end_s == _this) {
            //         nav.cancel('end');
            //         // nav.cancel();
            //     } else if (nav.start_s) {
            //         if (!nav.end_s) {
            //             nav.end(_this);
            //             //nav.init();
            //         } else {
            //             return false
            //         }
            //     }else if (nav.middle_s == _this){
            //         nav.cancel('middle')
            //     }else {
            //         nav.start(_this);
            //     }
            // })
        }
    };

    // nav.draw()


    var nav = {
        data: null,
        start_s: null,
        end_s: null,
        middle_s: null,
        m_ell:null,
        mid:null,
        s_ele: null,
        e_ele: null,
        sid: null,
        eid: null,
        points: [],
        init: function () {
            this.sid = this.start_s !== undefined ? this.start_s.data.zid : 0;
            this.eid = this.end_s !== undefined ? this.end_s.data.zid : 0;
            this.mid = this.middle_s !== undefined ? this.middle_s.data.zid : 0;
            for (var i = 0; i < map.stations.length; i++) {
                map.stations[i].visible = false;
                map.stations[i].ele.className = 'hide';
            }

            map.plan_canvas.style.zIndex = 10;
            map.plan_canvas.style.backgroundColor = 'rgba(0, 0, 0, .3)';
            map.plan_ctx.font = "16px serif";
            //map.plan_ctx.fillText('正在查询，请稍候', map.plan_canvas.width / 2, map.plan_canvas.height / 2);

            map.line_canvas.style.opacity = 0.1;
            map.ele.dispatchEvent(nav_event);
        },
        setData: function (res) {
            var data = JSON.parse(JSON.stringify(res));
            map.plan_canvas.style.zIndex = 1;
            map.plan_canvas.style.background = 'none';
            var name = [];
            for (var i in data) {
                if (data[i].direction === 'up') {
                    data[i].stations = data[i].stations.reverse();
                }
                if (data[i].line === 2) {
                    continue;
                }
                for (var l = 0; l < data[i].stations.length + 2; l++) {
                    if (l > 0 && data[i].stations[l]) {
                        // 1号线
                        if (data[i].stations[l].zid === 10140 && data[i].stations[l - 1].zid === 10139) {
                            data[i].stations.splice(l, 0, {position: [905, 398, 905, 366, 28]});
                        }

                        if (data[i].stations[l].zid === 10120 && data[i].stations[l - 1].zid === 10119) {
                            data[i].stations.splice(l, 0, {"position": [157, 446]});
                            data[i].stations.splice(l, 0, {"position": [133, 446, 155, 446, 30]});
                        }
                        // 城郊线
                        if (data[i].stations[l].zid === 10941 && data[i].stations[l - 1].zid === 10940) {
                            data[i].stations.splice(l, 0, {"position": [600, 1050]});
                            data[i].stations.splice(l, 0, {"position": [536, 1050, 586, 1050, 30]});
                        }
                        if (data[i].stations[l].zid === 10947 && data[i].stations[l - 1].zid === 10946) {
                            data[i].stations.splice(l, 0, {"position": [1100, 1050, 1100, 1100, 20]});
                        }
                        if (data[i].stations[l].zid === 10950 && data[i].stations[l - 1].zid === 10949) {
                            data[i].stations.splice(l, 0, {"position": [1100, 1250, 1150, 1250, 30]});
                        }

                        // 5号线
                        if (data[i].stations[l].zid === 10502 && data[i].stations[l - 1].zid === 10501) {
                            data[i].stations.splice(l, 0, {"position": [312, 360, 320, 360, 10]});
                        }
                        if (data[i].stations[l].zid === 10501 && data[i].stations[l - 1].zid === 10502) {
                            data[i].stations.splice(l, 0, {"position": [312, 360, 312, 380, 10]});
                        }
                        if (data[i].stations[l].zid === 10517 && data[i].stations[l - 1].zid === 10516) {
                            data[i].stations.splice(l, 0, {"position": [840, 600, 800, 600, 10]});
                        }
                        if (data[i].stations[l].zid === 10529 && data[i].stations[l - 1].zid === 10528) {
                            data[i].stations.splice(l, 0, {"position": [312, 600, 312, 590, 10]});
                        }

                    }
                }
                data[i].stations.forEach(function (val) {
                    name.push(val.name);
                });
            }
            for (var k = 0; k < map.stations.length; k++) {
                if (name.indexOf(map.stations[k].name) > -1 && map.stations[k].run) {
                    map.stations[k].visible = true;
                    map.stations[k].ele.className = '';
                } else {
                    map.stations[k].visible = false;
                    map.stations[k].ele.className = 'hide';
                }
            }

            this.data = data;
            this.draw(map.plan_ctx);
        },
        start: function (start) {
            this.start_s = start;
            this.sid = this.start_s.id;
            this.sx = start.x;
            this.sy = start.y;
            var ele = document.createElement('div');
            ele.className = 'nav-start';
            var style = 'left:' + (this.sx * map.scale + map.left - 16) + 'px;top:' + (this.sy * map.scale + map.top - 40) + 'px;';
            $(ele).attr('style', style);
            $(map.slayer).append($(ele));
            this.s_ele = ele;
        },
        end: function (end) {
            this.end_s = end;
            this.eid = this.end_s.id;
            this.ex = end.x;
            this.ey = end.y;
            var ele = document.createElement('div');
            ele.className = 'nav-end';
            var style = 'left:' + (this.ex * map.scale + map.left - 16) + 'px;top:' + (this.ey * map.scale + map.top - 40) + 'px;';
            $(ele).attr('style', style);
            $(map.slayer).append($(ele));
            this.e_ele = ele;
        },
        middle: function (middle) {
            this.middle_s = middle;
            this.eid = this.middle_s.id;
            this.ex = middle.x;
            this.ey = middle.y;
            var ele = document.createElement('div');
            ele.className = 'nav-end';
            var style = 'left:' + (this.ex * map.scale + map.left - 16) + 'px;top:' + (this.ey * map.scale + map.top - 40) + 'px;';
            $(ele).attr('style', style);
            $(map.slayer).append($(ele));
            this.e_ele = ele;
        },
        create_point: function (x, y, class_name) {
            var ele = document.createElement('div');
            ele.className = 'nav-end ' + class_name;
            var style = 'left:' + (x * map.scale + map.left - 16) + 'px;top:' + (y * map.scale + map.top - 40) + 'px;';
            $(ele).attr('style', style);
            $(map.slayer).append($(ele));
            this.points.push({
                ele,
                x,
                y,
                class_name
            });
        },
        cancel: function (type) {
            if (type == 'start') {
                if (this.s_ele) map.slayer.removeChild(this.s_ele);
                this.s_ele = this.start_s = this.sid = null;
            } else if (type == 'end') {
                if (this.e_ele) map.slayer.removeChild(this.e_ele);
                this.e_ele = this.end_s = this.eid = null;
            } else if (type == "middle"){
                if (this.e_ele) map.slayer.removeChild(this.e_ele);
                this.e_ele = this.middle_s = this.eid = null;
            }
            // } else {
            //     if (this.s_ele) map.slayer.removeChild(this.s_ele);
            //     this.s_ele = this.start_s = this.sid = null;
            //     if (this.e_ele) map.slayer.removeChild(this.e_ele);
            //     this.e_ele = this.end_s = this.eid = null;
            //     this.data = null;
            //     map.line_canvas.style.opacity = 1;
            //     map.plan_ctx.clearRect(0, 0, map.plan_canvas.width, map.plan_canvas.height);
            //     $('.gh').slideUp();
            // }
        },
        draw: function (cxt, move) {
            cxt.clearRect(0, 0, map.plan_canvas.width, map.plan_canvas.height);
            if (!move) {
                for (const item of this.points) {
                    $(item.ele).attr('style', 'left:' + (item.x * map.scale + map.left - 16) + 'px;top:' + (item.y * map.scale + map.top - 40) + 'px;');
                }

                if (this.s_ele) $(this.s_ele).attr('style', 'left:' + (this.sx * map.scale + map.left - 16) + 'px;top:' + (this.sy * map.scale + map.top - 40) + 'px;');
                if (this.e_ele) $(this.e_ele).attr('style', 'left:' + (this.ex * map.scale + map.left - 16) + 'px;top:' + (this.ey * map.scale + map.top - 40) + 'px;');
            }
            if (!this.data) return;
            // console.log(this.data);
            var line = this.data;
            cxt.lineWidth = map.line_width;

            for (var i in line) {
                cxt.beginPath();
                cxt.moveTo(line[i].stations[0].position[0] * map.scale + map.left, line[i].stations[0].position[1] * map.scale + map.top);
                cxt.strokeStyle = line[i].line.color;
                for (var j in line[i].stations) {
                    var p = line[i].stations[j].position;
                    if (p.length === 5) {
                        cxt.arcTo(p[0] * map.scale + map.left, p[1] * map.scale + map.top, p[2] * map.scale + map.left, p[3] * map.scale + map.top, p[4] * map.scale);
                    } else {
                        cxt.lineTo(p[0] * map.scale + map.left, p[1] * map.scale + map.top);
                    }
                }
                cxt.stroke();
                cxt.closePath();
            }
        }
    };

    nav.create_point('535', '460', 'dev-3fa85f64-5717-4562-b3fc-2c963f66afa6');
    nav.create_point('670', '460', 'dev-5fa85f64-5717-4562-b3fc-2c963f66afa6');
    nav.create_point('535', '220', 'dev-6fa85f64-5717-4562-b3fc-2c963f66afa6');
    window.debug = nav;
    m = map;
    m.scale = 1.3;
})();
