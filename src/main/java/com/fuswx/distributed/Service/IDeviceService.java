package com.fuswx.distributed.Service;

import com.fuswx.distributed.Bean.DevAndStatus;
import com.fuswx.distributed.Bean.DevStatus;
import com.fuswx.distributed.Bean.Device;

import java.util.ArrayList;
import java.util.HashMap;

public interface IDeviceService {
    void setDevices(ArrayList<DevAndStatus> devices);

    void setDevStatus(DevStatus devStatus);

    DevStatus getDevStatus(String id);

    ArrayList<DevStatus> getAllDevStatus();

    ArrayList<DevStatus> getDevStatusMap(String devId);
}
