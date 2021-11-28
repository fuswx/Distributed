package com.fuswx.distributed.Service.impl;

import com.fuswx.distributed.Bean.DevAndStatus;
import com.fuswx.distributed.Bean.DevStatus;
import com.fuswx.distributed.Bean.DevStatusAndId;
import com.fuswx.distributed.Bean.Device;
import com.fuswx.distributed.Mapper.DeviceMapper;
import com.fuswx.distributed.Service.IDeviceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.relational.core.sql.In;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Transactional
@Service
public class DeviceServiceImpl implements IDeviceService {

    @Autowired
    private DeviceMapper deviceMapper;

    @Autowired
    private RestTemplate restTemplate;

    SimpleDateFormat simpleDateFormat=new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    @Override
    public void setDevices(ArrayList<DevAndStatus> devices) {
        for (DevAndStatus device : devices) {
            String devOnceId=formatDevId(device.getId());
            deviceMapper.createDevStatus(devOnceId);
            deviceMapper.setDevice(new Device(device.getId(),device.getAddTime()));
            deviceMapper.setDevStatus(new DevStatus(null,device.getId(),device.getAddTime(),device.getLastStatus().getDevLevel(), device.getLastStatus().getDevBattery(), device.getLastStatus().getDevTemperature(), device.getLastStatus().getDevHumidity()),devOnceId);
        }
    }

    @Override
    public void setDevStatus(DevStatus devStatus) {
        SimpleDateFormat simpleDateFormat=new SimpleDateFormat("yyyy.MM.dd HH:mm:ss");
        if (devStatus.getUploadTime()==null){
            devStatus.setUploadTime(new Date());
        }
        deviceMapper.setDevStatus(devStatus, formatDevId(devStatus.getDevId()));
        if (devStatus.getDevLevel()>=140){
            HttpHeaders httpHeaders = new HttpHeaders();
            httpHeaders.setContentType(MediaType.APPLICATION_JSON);
            Map<String,Object> requestParam=new HashMap<>();
            requestParam.put("secret","eb87c769-b6f4-4d37-aad6-7dcd62b5b66c");
            requestParam.put("tittle","水位超过预警");
            requestParam.put("content","地铁1号线-紫金山路站\n报警时间:"+simpleDateFormat.format(devStatus.getUploadTime())+"\n当前水位:"+devStatus.getDevLevel()+"mm");
            HttpEntity<Map<String,Object>> request=new HttpEntity<Map<String, Object>>(requestParam,httpHeaders);
            String s=request.toString();
            ResponseEntity<String> entity=restTemplate.exchange("https://push.hyun.tech/send", HttpMethod.POST,request,String.class);
            System.out.println("====="+entity.getBody());
        }
    }



    @Override
    public DevStatus getDevStatus(String id) {
        return deviceMapper.getDevLastStatus(formatDevId(id));
    }

    @Override
    public ArrayList<DevStatus> getAllDevStatus() {
        ArrayList<DevStatus> devStatuses=new ArrayList<>();
        ArrayList<String> devIds=deviceMapper.getAllDevstatusId();
        for (String devId: devIds) {
            devStatuses.add(deviceMapper.getDevLastStatus(formatDevId(devId)));
        }
        return devStatuses;
    }

    @Override
    public ArrayList<DevStatus> getDevStatusMap(String devId) {
        devId=formatDevId(devId);
        ArrayList<DevStatus> devStatusMap=new ArrayList<>();
        DevStatus devStatus=deviceMapper.getDevLastStatus(devId);
        //Long now=devStatus.getUploadTime().getTime();
        Integer devStatusId=devStatus.getStatusId();
        for (int i = 0; i <= 50; i++) {
            DevStatusAndId devStatusAndId =CheckZero(devId,devStatusId);
            devStatusId= devStatusAndId.getDevStatusId();
            devStatusMap.add(0, devStatusAndId.getDevStatus());
        }
        return devStatusMap;
    }

    public DevStatusAndId CheckZero(String devId, Integer devStatusId){
        DevStatus devStatus=deviceMapper.getDevLastStatusMapByDevStatusId(devId,devStatusId);
        return devStatus==null?CheckZero(devId,devStatusId-1):new DevStatusAndId(devStatus,devStatusId-1);
    }

    public String formatDevId(String devId){
        String[] strings = devId.split("-");
        String devOnceId="";
        for (String string : strings) {
            devOnceId+=string;
        }
        return devOnceId;
    }

//    @Override
//    public ArrayList<DevStatus> getDevStatusMap(String devId) {
//        ArrayList<DevStatus> devStatusMap=new ArrayList<>();
//        DevStatus devStatus=deviceMapper.getDevLastStatus(devId);
//        Long now=devStatus.getUploadTime().getTime();
//        for (int i = 50; i >= 0; i--) {
//            devStatusMap.add(deviceMapper.getDevLastStatusMap(devId,simpleDateFormat.format(now- (long) i *5*1000)));
//        }
//        return devStatusMap;
//    }


}
