$(function (){
    doChange();
    //makeMap();
    // makeSubwayMap();
})

$(window).resize(function (){
    doChange()
})
function doChange(){

    //标题置中
    $("#map-header").css("left",$("#main-window").width()/2-$("#map-header").width()/2)
    $("#map-left").css("top",$("#main-window").height()/2-2*$("#map-header").height())
    $("#map-right").css("top","10%")
    $("#map-right").css("width",$("#map-right").height()/2.3)
    $("#map-left").stop().animate({left:0},1000)
    $(".see-history-button").css("font-size",$(".see-history-button").height()/2)
    $(".map-left-device-name-scroll").css("font-size",$(".map-left-device-name-scroll").height()/1.4)
    $("#map-right-text-detail").css("font-size",$(".map-left-device-name-scroll").height()/1.4)
    $(".map-right-level-num").css("font-size",$(".map-left-device-name-scroll").height()/1.4)
    $(".see-history-button a").css("font-size",$(".see-history-button").height()/2)
    $(".map-left-device-img").css("height",$(".map-left-device-img").width())
    $(".map-left-device-img").css("border-radius",$(".map-left-device-img").width())
    $(".map-left-device-img").css("margin-bottom",($(".map-left-device").height()-$(".map-left-device-img").height())/2)
    // $(".map-left-device-name-scroll").css("width",$(".map-left-device").width()*0.6)

    $("#dev-title-textimg").click(function (){
        $("#map-right-close").click()
        $("#map-left-close").stop().animate({left:0},1000)
            $("#map-left").stop().animate({left:-$("#map-left").width()},1000)
    })

    var timeIn=null;
    $("#map-right-close").click(function (){
        $("#map-right").stop().fadeOut(1000)
        if (timeIn!=null){
            clearInterval(timeIn)
            timeIn=null;
        }
    })
    $("#map-left-close").click(function (){
        $("#map-left-close").stop().animate({left:-$("#map-left-close").width()},200,function (){
            $("#map-left").stop().animate({left:0},1000)
        })

    })

    function getWaterLevelPic(waterLevel){
        var mon;
        if (waterLevel<=100*0.8){
            mon=100
        }else if (waterLevel>100&&waterLevel<=200*0.9){
            mon=200
        }else if (waterLevel>200&&waterLevel<=300*0.9){
            mon=300
        }else if (waterLevel>300&&waterLevel<=400*0.9){
            mon=400
        }else {
            mon=500
        }
        $("#map-right-content-level").css("height",waterLevel/mon*100+"%")
        $("#map-right-level-num-1").text(mon/4)
        $("#map-right-level-num-2").text(mon/4*2)
        $("#map-right-level-num-3").text(mon/4*3)
        $("#map-right-level-num-4").text(mon/4*4)
    }

    $(".map-left-device").click(function (){
        if (timeIn!=null){
            clearInterval(timeIn)
            timeIn=null
        }
        $("#water-level").text($(this).children(".none-box").children(".water").text())
        $("#map-right").stop().fadeIn(1000)
        $("#none-devId").text($(this).children(".none-box").children(".devId").text())
        $(`.dev-${$("#none-devId").text()}`).addClass("nav-focus")
        $(".map-left-device").each(function (index,ele){
            if ($(ele).children(".none-box").children(".devId").text()!==$("#none-devId").text()){
                $(`.dev-${$(ele).children(".none-box").children(".devId").text()}`).removeClass("nav-focus")
            }
        })
        var waterLevel=$(this).children(".none-box").children(".water").text()
        getWaterLevelPic(waterLevel)
        timeIn=setInterval(function (){
            $(".map-left-device").each(function (index,ele){
                if ($(ele).children(".none-box").children(".devId").text()===$("#none-devId").text()){
                    waterLevel=$(ele).children(".none-box").children(".water").text()
                    $("#water-level").text(waterLevel)
                }
            })
            getWaterLevelPic(waterLevel)
        },2000)
    })

    function formatDevId(devId){
        var strings= devId.split("-");
        var devOnceId="";
        for (var string of strings) {
            devOnceId+=string
        }
        return devOnceId;
    }

    $("#look-history-close").click(function (){
        if (seeHistoryTime!=null){
            clearInterval(seeHistoryTime)
            seeHistoryTime=null;
        }
        $("#look-history").stop().fadeOut(function (){
            $("#look-history").css("display","none")
        })
    })
    var seeHistoryTime=null;
    var devStatusArr=[];
    var devUploadTime;
    $("#see-history").click(function (){
        var devId=$("#none-devId").text();
        $("#look-history").stop().fadeIn(function (){
            $.post("/Distributed/dev/getDevStatusMap",{devId:devId},function (devStatusMap){
                devStatusArr=devStatusMap;
                devUploadTime=timeStampString(devStatusMap[devStatusArr.length-1].upload_time);
                makeHistory(devStatusArr)
            })

        })
        if (seeHistoryTime!=null){
            clearInterval(seeHistoryTime)
            seeHistoryTime=null
        }
        seeHistoryTime=setInterval(function (){
            $("#look-history").stop().fadeIn(function (){
                // $.post("/Distributed/dev/getDevStatusMap",{devId:devId},function (devStatusMap){
                //     makeHistory(devStatusMap)
                // })

                $.post("/Distributed/dev/getDevStatus",{id:devId},function (devStatus){
                    if (timeStampString(devStatus.upload_time)!==devUploadTime){
                        devUploadTime=timeStampString(devStatus.upload_time);
                        if (devStatusArr.length>50){
                            devStatusArr.shift()
                        }
                        devStatusArr.push(devStatus)
                    }
                    makeHistory(devStatusArr)
                })

            })

        },2000)

    })

    $("#touch-title").hover(function (){
        $("#map-header").slideDown()
        setTimeout(function (){
            $("#map-header").slideUp()
        },2000)
    })

    setTimeout(function (){
        $("#map-header").slideUp()
    },2000)

    var interval=setInterval(function (){
        $.post("/Distributed/dev/getAllDevStatus",function (devStatus){
            var devSta=[];
            for (var devStatusKey in devStatus) {
                devSta.push(devStatus[devStatusKey])
            }
            $(".map-left-device").each(function (index,ele){
                $(ele).children(".none-box").children(".water").text(devStatus[index].level)
                $(ele).children(".none-box").children(".battery").text(devStatus[index].battery)
                $(ele).children(".none-box").children(".temperature").text(devStatus[index].temperature)
                $(ele).children(".none-box").children(".humidity").text(devStatus[index].humidity)
                $(ele).children(".map-left-device-middle").children(".map-left-device-buttery").text(" "+devStatus[index].battery+"%")
            })

        })
    },2000)


}

//制作地铁地图
// function makeSubwayMap(){
//
//     window.cbk=function (){
//         var map=subway("map",function (){
//             easy:1
//         })
//     }
//
//     // var subwayCityName = '郑州';
//     // var list = BMapSub.SubwayCitiesList;
//     // var subwaycity = null;
//     // for (var i = 0; i < list.length; i++) {
//     //     if (list[i].name === subwayCityName) {
//     //         subwaycity = list[i];
//     //         break;
//     //     }
//     // }
//     // // 获取地铁数据-初始化地铁图
//     // var subway = new BMapSub.Subway('mapChina', subwaycity.citycode);
//     // //缩放控件
//     // var zoomControl = new BMapSub.ZoomControl({
//     //     anchor: BMAPSUB_ANCHOR_BOTTOM_RIGHT,
//     //     offset: new BMapSub.Size(10,100)
//     // });
//     // subway.setZoom(0.5);
//     // subway.addControl(zoomControl);
//     // subway.enableScrollWheelZoom(true)
// }

//制作中国地图
// function makeMap(){
//     //使用Loader加载
//     AMapLoader.load({
//         "key": "",// 申请好的Web端开发者Key，首次调用 load 时必填
//         "version": "1.4.15",   // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
//         "plugins": [],           // 需要使用的的插件列表，如比例尺'AMap.Scale'等
//         "AMapUI": {             // 是否加载 AMapUI，缺省不加载
//             "version": '1.1',   // AMapUI 缺省 1.1
//             "plugins":['overlay/SimpleMarker'],       // 需要加载的 AMapUI ui插件
//         },
//         "Loca":{                // 是否加载 Loca， 缺省不加载
//             "version": '1.3.2'  // Loca 版本，缺省 1.3.2
//         },
//     }).then((AMap)=>{
//         var map = new AMap.Map('container');
//         map.addControl(new AMap.Scale());
//         new AMapUI.SimpleMarker({
//             map: map,
//             position: map.getCenter(),
//         });
//     }).catch((e)=>{
//         console.error(e);  //加载错误提示
//     });
//
//     var map = new AMap.Map('mapChina', {
//         zoom:9,//级别
//         center: [113.62000, 34.62000],//中心点坐标
//         viewMode:'3D'//使用3D视图
//     });
//     var startIcon = new AMap.Icon({
//         size: new AMap.Size(30,50),//图标尺寸
//         imageSize: new AMap.Size(35,50),
//         image: "//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png",
//     });
//     var locations=[
//         [113.780373,34.757843],
//         [113.880373,34.847843],
//         [113.53524,34.669792]
//     ];
//     var markers=[]
//     for (var i = 0; i < locations.length; i++) {
//         var infoWindow=new AMap.InfoWindow({
//             offset: new AMap.Pixel(15, -10),
//         });
//         var marker=new AMap.Marker({
//             position: locations[i],
//             map:map,
//             icon: startIcon,
//             content:"" +
//                 '<div class="custom-content-marker">' +
//                 '   <img style="width: 30px;height: 40px" src="//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png">' +
//                 "</div>"
//         })
//         marker.on('click',function (e){
//             var  content="<div className='infos'><div>地铁1号线紫金山路</div>\n" +
//                 "<div style='margin-top: 5px'> <span style='display: none'></span><span style='display: inline-block;float: left;font-size: 12px;font-weight: 600'><span style='display: inline-block;width: 10px;height: 5px;background-color: #1b2128'></span> 200mm</span><span style='display: inline-block;float: right;font-size: 12px;font-weight: 600;color: #60b193'>水位正常</span></div></div>";
//             infoWindow.setContent(content)
//             infoWindow.open(map,this._position)
//         })
//         markers.push(marker)
//     }
//
//     // 同时引入工具条插件，比例尺插件和鹰眼插件
//     AMap.plugin([
//         'AMap.ToolBar',
//         'AMap.Scale',
//         'AMap.OverView',
//         'AMap.MapType',
//         'AMap.Geolocation',
//     ], function(){
//         // 在图面添加工具条控件，工具条控件集成了缩放、平移、定位等功能按钮在内的组合控件
//         map.addControl(new AMap.ToolBar());
//         // 在图面添加比例尺控件，展示地图在当前层级和纬度下的比例尺
//         map.addControl(new AMap.Scale());
//         // 在图面添加鹰眼控件，在地图右下角显示地图的缩略图
//         //map.addControl(new AMap.OverView({isOpen:true}));
//         // 在图面添加类别切换控件，实现默认图层与卫星图、实施交通图层之间切换的控制
//         map.addControl(new AMap.MapType());
//         // 在图面添加定位控件，用来获取和展示用户主机所在的经纬度位置
//         map.addControl(new AMap.Geolocation());
//     });
//     map.add(markers)
//
// }
//日期格式化
function timeStampString(time){
    var datetime = new Date(time);
    var year = datetime.getFullYear();
    var month = datetime.getMonth() + 1 < 10 ? "0" + (datetime.getMonth() + 1) : datetime.getMonth() + 1;
    var date = datetime.getDate() < 10? "0" + datetime.getDate() : datetime.getDate();
    var hour = datetime.getHours()< 10 ? "0" + datetime.getHours() : datetime.getHours();
    var minute = datetime.getMinutes()< 10 ? "0" + datetime.getMinutes() : datetime.getMinutes();
    var second = datetime.getSeconds()< 10 ? "0" + datetime.getSeconds() : datetime.getSeconds();
    return hour + ":" + minute+":"+second;
}
function timeStampString2(time){
    var datetime = new Date(time);
    var year = datetime.getFullYear();
    var month = datetime.getMonth() + 1 < 10 ? "0" + (datetime.getMonth() + 1) : datetime.getMonth() + 1;
    var date = datetime.getDate() < 10? "0" + datetime.getDate() : datetime.getDate();
    var hour = datetime.getHours()< 10 ? "0" + datetime.getHours() : datetime.getHours();
    var minute = datetime.getMinutes()< 10 ? "0" + datetime.getMinutes() : datetime.getMinutes();
    var second = datetime.getSeconds()< 10 ? "0" + datetime.getSeconds() : datetime.getSeconds();
    return year + "-" + month+"-"+date;
}

function makeHistory(devStatusMap){
    var devId=[],devLevel=[],devBattery=[],devHumidity=[],devTemperature=[],upload_time=[],warnLine=[],pointLine=[]
    var lineWarnFlag=null;
    var linePointFlag=null;
    //var timeStamp=null;
    for (var devStatusMapKey in devStatusMap) {
        if (devStatusMap[devStatusMapKey]!=null){
            devId.push(devStatusMapKey)
            devLevel.push(devStatusMap[devStatusMapKey].level)
            devBattery.push(devStatusMap[devStatusMapKey].battery)
            devHumidity.push(devStatusMap[devStatusMapKey].humidity)
            devTemperature.push(devStatusMap[devStatusMapKey].temperature)
            // if (timeStampString(devStatusMap[devStatusMapKey].upload_time)===timeStamp){
            //     upload_time.push("")
            // }else {
            upload_time.push(timeStampString(devStatusMap[devStatusMapKey].upload_time))
            //     timeStamp=timeStampString(devStatusMap[devStatusMapKey].upload_time);
            // }
            warnLine.push(140)
            pointLine.push(120)
            if (devStatusMap[devStatusMapKey].level>=120&&devStatusMap[devStatusMapKey].level<140){
                linePointFlag="#FF8800FF";
            }else if (devStatusMap[devStatusMapKey].level>=140){
                lineWarnFlag="red";
            }
        }

    }

    var myLineChart = echarts.init(document.getElementById("look-history-echarts"));
    option={
        color:[lineWarnFlag===null?linePointFlag===null?"cornflowerblue":linePointFlag:lineWarnFlag,'green','#594EF0FF','mediumaquamarine','#FF8800FF','red'],
        series:[{
            type:'line',
            name:'水位',
            data:devLevel,
            yAxisIndex:0,
            lineStyle:{
                normal:{
                    width:4
                }
            }
        },{
            name:'电池',
            type:'line',
            data:devBattery,
            yAxisIndex:0,
            lineStyle:{
                normal:{
                    width:4
                }
            }
        },{
            name:'温度',
            type:'line',
            data:devTemperature,
            yAxisIndex:1,
            lineStyle:{
                normal:{
                    width:4
                }
            }
        },{
            name:'湿度',
            type:'line',
            data:devHumidity,
            yAxisIndex:1,
            lineStyle:{
                normal:{
                    width:4
                }
            }
        },{
            name:'提示线',
            type:'line',
            yAxisIndex:0,
            data:pointLine,
            symbol:'none',
            lineStyle:{
                normal:{
                    width:1
                }
            }
        },{
            name:'警戒线',
            type:'line',
            yAxisIndex:0,
            data:warnLine,
            symbol:'none',
            lineStyle:{
                normal:{
                    width:1
                }
            }
        },{
            name:'量程左',
            type:'line',
            yAxisIndex:0,
            data:[300],
            symbol:'none',
            lineStyle:{
                normal:{
                    width:0
                }
            }
        },{
            name:'量程右',
            type:'line',
            yAxisIndex:1,
            data:[40],
            symbol:'none',
            lineStyle:{
                normal:{
                    width:0
                }
            }
        }],
        title: {
            text:"历史数据",
            x:'center',
            textStyle:{
                fontSize:30
            }
        },legend:{
            top:"4%",
            left:"4%",
            data: ['水位','电池','温度','湿度'],
            x: 'left',
            textStyle:{
                fontSize:14,
                fontWeight:600
            }
        },
        xAxis: {
            type:"category",
            data:upload_time,
            textStyle:{
                fontSize:12,
                fontWeight:600
            }
        },
        yAxis: [{
            type: "value",
            name:"水\n位\n\n剩\n余\n电\n量\n",
            nameLocation:"center",
            nameGap:35,
            nameRotate:0,
            nameTextStyle:{
                fontSize: 16,
                fontWeight:700
            },
            textStyle:{
                fontSize:20,
                fontWeight:600
            }
        },
            {
                type: "value",
                name:"温\n度\n\n湿\n度\n",
                nameLocation:"center",
                nameGap:35,
                nameRotate:0,
                nameTextStyle:{
                    fontSize: 16,
                    fontWeight:700
                },
                textStyle:{
                    fontSize:20,
                    fontWeight:600
                }
            }],
        tooltip:{
            showDelay: 20,
            hideDelay: 20,
            transitionDuration:0.4,
            backgroundColor:"#f4f4f4",
            borderRadius:5,
            borderWidth:1,
            borderColor:"cornflowerblue",
            padding:5
        }
    }

    myLineChart.on("legendselectchanged",function (obj){
        var option = this.getOption();
        if (obj.name==='气温'){
            if (obj.selected['气温']){
                //若显示气温折线，则隐藏降水量
                option.legend[0].selected['降水量'] = false;
                //将右边第二个Y轴的name属性设为所需，将别的轴的name属性设为空串，实现隐藏效果，只要这样，刻度也会自动跟着变
                option.yAxis[1].name='气温/℃';
                option.yAxis[2].name='';
            }
        }else if (obj.name==='降水量'){
            if (obj.selected['降水量']){
                option.legend[0].selected['气温'] = false;
                option.yAxis[2].name='降水量/Kml';
                option.yAxis[1].name='';
            }
        }
        this.setOption(option)
    })

    myLineChart.setOption(option)
}

