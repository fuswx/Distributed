package com.fuswx.distributed.Controller;

import com.fuswx.distributed.Bean.DevAndStatus;
import com.fuswx.distributed.Bean.DevStatus;
import com.fuswx.distributed.Service.IDeviceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import java.util.ArrayList;
import java.util.HashMap;

@Controller
public class DeviceController {

    @Autowired
    private IDeviceService deviceService;

    @GetMapping("/device")
    @ResponseBody
    public void setDevices(@RequestBody ArrayList<DevAndStatus> devices){
        deviceService.setDevices(devices);
    }

    @PutMapping("/data")
    @ResponseBody
    public void setDevStatus(@RequestBody DevStatus devStatus){
        deviceService.setDevStatus(devStatus);
    }

    @RequestMapping("/dev/getAllDevStatus")
    public @ResponseBody ArrayList<DevStatus> getAllDevStatus(){
        return deviceService.getAllDevStatus();
    }

    @RequestMapping("/dev/getDevStatus")
    public @ResponseBody DevStatus getDevStatus(String id){
        return deviceService.getDevStatus(id);
    }

    @RequestMapping("/dev/getDevStatusMap")
    public @ResponseBody ArrayList<DevStatus> getAllDevStatusMap(String devId){
        return deviceService.getDevStatusMap(devId);
    }

}
