const util = require('../../utils/util')

Page({
    data:{
        status:'',
        isSearched:'',
        msg:'',
        msg1:'',
        receiveMessage:'',
        devices:[],
        connectedDeviceId:'',
        connectDeviceName:'',
        services:[],
        characteristics: "",   // 连接设备的状态值  
        writeServicweId: "", // 可写服务uuid  
        writeCharacteristicsId: "",//可写特征值uuid  
        readServicweId: "", // 可读服务uuid  
        readCharacteristicsId: "",//可读特征值uuid
        notifyServicweId: '',//通知服务UUid  
        notifyCharacteristicsId: '' //通知特征值UUID  
    },
    onLoad: function () {
        if (wx.openBluetoothAdapter) {
          wx.openBluetoothAdapter()
        } else {
          // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示  
          wx.showModal({
            title: '提示',
            content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
          })
        }
    
    },
    //初始化蓝牙适配器
    initBLE:function(){
        let that=this;
        wx.openBluetoothAdapter({
            success:function(res){
                that.setData({
                    msg:'初始化蓝牙适配器成功'+JSON.stringify(res),
                });
                //监听蓝牙适配器状态
                wx.onBluetoothAdapterStateChange(function(res){
                    that.setData({
                        isSearched:res.discovering ? '在搜索' : '未搜索',
                        status: res.available ? "可用。" : "不可用。"
                    })
                })
            }
        })
    },
    //查询蓝牙适配器状态
    bleStatus:function(){
        let that=this;
        wx.getBluetoothAdapterState({
            success:function(res){
                that.setData({
                    msg:'本机蓝牙适配器状态'+JSON.stringify(res.errMsg),
                    isSearched:res.discovering ? '在搜索' : '未搜索',
                    status: res.available ? "可用。" : "不可用。"
                });
                //监听蓝牙适配器状态
                wx.onBluetoothAdapterStateChange(function(res){
                    that.setData({
                        isSearched:res.discovering ? '在搜索' : '未搜索',
                        status: res.available ? "可用。" : "不可用。"
                    })
                })
            }
        })
    },
    //搜索周边设备
    startSerach:function(){
        let that=this;
        wx.startBluetoothDevicesDiscovery({
            success:function(res){
                that.setData({
                    msg: "搜索设备" + JSON.stringify(res)
                });
                //监听蓝牙适配器状态
                wx.onBluetoothAdapterStateChange(function(res){
                    that.setData({
                        isSearched:res.discovering ? '在搜索' : '未搜索',
                        status: res.available ? "可用。" : "不可用。"
                    })
                })
            },
        })
    },
    //获取所有已发现的设备
    getDevices:function(){
        let that=this;
        wx.getBluetoothDevices({
            success:function(res){
                //是否有已连接设备  
                wx.getConnectedBluetoothDevices({
                    success: function (res) {
                        console.log(JSON.stringify(res.devices));
                        that.setData({
                            connectedDeviceId: res.deviceId,
                            connectDeviceName: res.name
                        })
                        console.log(JSON.stringify(res));
                    }
                })
                that.setData({
                    devices:res.devices,
                    msg: "搜索设备" + JSON.stringify(res.devices)
                });
                //监听蓝牙适配器状态
                wx.onBluetoothAdapterStateChange(function(res){
                    that.setData({
                        isSearched:res.discovering ? '在搜索' : '未搜索',
                        status: res.available ? "可用。" : "不可用。"
                    })
                })
            }
        })
    },
    //停止搜索
    stopSearch:function(){
        let that=this;
        wx.stopBluetoothDevicesDiscovery({
            success:function(res){
                that.setData({
                    msg: "停止搜索周边设备" + "/" + JSON.stringify(res.errMsg),
                    isSearched:res.discovering ? '在搜索' : '未搜索',
                    status: res.available ? "可用。" : "不可用。"
                });
                //监听蓝牙适配器状态
                wx.onBluetoothAdapterStateChange(function(res){
                    that.setData({
                        isSearched:res.discovering ? '在搜索' : '未搜索',
                        status: res.available ? "可用。" : "不可用。"
                    })
                })
            }
        })
    },
    //连接设备
    connect:function(e){
        let that=this;
        wx.createBLEConnection({
            deviceId:e.currentTarget.id,
            success:function(res){
                that.setData({
                    connectedDeviceId:e.currentTarget.id,
                    msg: "已连接" + e.currentTarget.id,
                    msg1: "",
                    connectDeviceName: e.currentTarget.dataset.name
                });
                wx.showToast({
                    title: '连接成功',
                  });
            },
            fail: function (res) {
                console.log("连接失败"+JSON.stringify(res));
              },
              complete: function () {
                console.log("调用结束");
            }
        });
        console.log(that.data.connectedDeviceId);
    },
    //获取连接设备的所有service
    getDeviceServices:function(){
        let that=this;
        wx.getBLEDeviceServices({
            deviceId:that.data.connectedDeviceId,
            success:function(res){
              console.log(res)
                that.setData({
                    services:res.services,
                    msg: "已连接" +that.data.connectedDeviceId,
                    msg1:JSON.stringify(res.services)
                })
            }
        })
    },
    //获取特征值
    getDevicesCharacteristics:function(){
        let that=this;
      console.log("通信点 ", that.data)
        for(let j=0;j<that.data.services.length;j++){
          let deviceId = that.data.connectedDeviceId;
          let serviceId = that.data.services[j].uuid;
          //查找180A服务
          if (serviceId.indexOf("180A")==-1){
            continue
          }
          let buffer = util.convert("CCCCFFFFCC33A5023333");
            wx.getBLEDeviceCharacteristics({
              deviceId: deviceId,
              serviceId: serviceId,
                success:function(res){
                   // let that=this;
                    for(let i=0;i<res.characteristics.length;i++){
                      /**
                        if (res.characteristics[i].properties.write) {
                       **/
                          var characteristicId = res.characteristics[i].uuid;
                          if (characteristicId.indexOf("2A23")>0){
                            console.log("通信点 ", serviceId, "---", characteristicId);
                            /**
                            wx.writeBLECharacteristicValue({
                              deviceId: deviceId,
                              serviceId: serviceId,
                              characteristicId: characteristicId,
                              value: buffer,
                              success: function (res) {
                                console.log('writeBLECharacteristicValue success', res.errMsg)
                              }
                            });
                             * */
                            wx.readBLECharacteristicValue({
                              // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接  [**new**]
                              deviceId: deviceId,
                              // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
                              serviceId: serviceId,
                              // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
                              characteristicId: characteristicId,
                              success: function (res) {
                                console.log('蓝牙返回成功:readBLECharacteristicValue:', res);
                                wx.onBLECharacteristicValueChange(function (res) {
                                  console.log(`characteristic ${res.characteristicId} has changed, now is ${res.value}`)
                                  console.log(util.ab2hex(res.value))
                                });
                              },
                              fail: function (res) {
                                console.log('蓝牙返回错误:readBLECharacteristicValue:', res);
                              }
                            })
                          }
                          /**
                            that.setData({
                              writeServicweId: that.data.services[j].uuid,
                              writeCharacteristicsId: characteristicId,
                            })

                          }
                          */
                    };
                }
            })
        }
    },
    sendMsg:function(){

    },
    //启用notify
    startNotify:function(){
        let that=this;
        wx.notifyBLECharacteristicValueChange({
            state:true,
            deviceId:that.data.connectedDeviceId,
            serviceId:that.data.notifyServicweId,
            characteristicId:that.data.notifyCharacteristicsId,
            success:function(res){
                console.log('notifyBLECharacteristicValueChange success', res.errMsg);
                console.log("开启notify 成功");
                wx.showToast({
                    title: '开启notify 成功',
                  });
            },
            fail:function(res){
                wx.showToast({
                    title: '开启notify 失败',
                  });
            }
        })
    },
    //接收消息
    receiveMsg:function(){
        var that = this;
        // 必须在这里的回调才能获取  
        wx.onBLECharacteristicValueChange(function (characteristic) {
            let hex = Array.prototype.map.call(new Uint8Array(characteristic.value), x => ('00' + x.toString(16)).slice(-2)).join('');
             console.log("hex：",hex);
             });
        console.log(that.data.readServicweId);
        console.log(that.data.readCharacteristicsId);
        wx.readBLECharacteristicValue({
          // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取  
          deviceId: that.data.connectedDeviceId,
          // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取  
          serviceId: that.data.readServicweId,
          // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取  
          characteristicId: that.data.readCharacteristicsId,
          success: function (res) {
              console.log('readBLECharacteristicValue:', JSON.stringify(res));
              wx.showToast({
                title: res.errMsg
              });
           }
        });
    },
    //断开设备连接
    stopBLE:function(){
        let that = this;
        wx.closeBLEConnection({
            deviceId: that.data.connectedDeviceId,
            success: function (res) {
                that.setData({
                    connectedDeviceId: "",
                    connectDeviceName: "",
                    msg:'',
                    msg1:''
                });
                wx.showToast({
                    title: '已断开连接',
                  });
            },
            fail:function(res){
                console.log(JSON.stringify(res));
                wx.showToast({
                    title: '无法断开连接',
                  });
            }
        })
    }
})