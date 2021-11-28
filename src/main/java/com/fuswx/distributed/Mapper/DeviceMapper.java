package com.fuswx.distributed.Mapper;

import com.fuswx.distributed.Bean.DevStatus;
import com.fuswx.distributed.Bean.Device;
import org.apache.ibatis.annotations.*;

import java.util.ArrayList;
import java.util.Date;

public interface DeviceMapper {

    @Insert("insert into devices (id,add_time) values(#{id},#{addTime})")
    void setDevice(Device device);

    @Update("create table ${devOnceId}(id int not null auto_increment primary key,dev_id varchar(255) not null,upload_time timestamp,dev_level double,dev_battery double,dev_temperature double, dev_humidity double);")
    void createDevStatus(String devOnceId);

    @Insert("insert into ${devId} (dev_id,upload_time,dev_level,dev_battery,dev_temperature,dev_humidity) values(#{devStatus.devId},#{devStatus.uploadTime},#{devStatus.devLevel},#{devStatus.devBattery},#{devStatus.devTemperature},#{devStatus.devHumidity})")
    void setDevStatus(@Param("devStatus") DevStatus devStatus,@Param("devId")String devId);

    @Select("select * from ${devOnceId} where id=(select max(id) from ${devOnceId})")
    DevStatus getDevLastStatus(String devOnceId);

    @Select("select id from devices")
    ArrayList<String> getAllDevstatusId();

    @Select("select id,dev_id,upload_time,dev_level,dev_battery,dev_temperature,dev_humidity from ${devOnceId} where id=(select max(id) from ${devOnceId} where date_format(upload_time,'%y-%M-%d %H:%i:%s') = date_format(#{time},'%y-%M-%d %H:%i:%s'));")
    DevStatus getDevLastStatusMap(@Param("devOnceId") String devOnceId,@Param("time") String time);

    @Select("select id,dev_id,upload_time,dev_level,dev_battery,dev_temperature,dev_humidity from ${devOnceId} where id=#{devStatusId};")
    DevStatus getDevLastStatusMapByDevStatusId(@Param("devOnceId") String devId,@Param("devStatusId") Integer devStatusId);
}
