package com.fuswx.distributed.Bean;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Date;

@Data
@AllArgsConstructor
public class DevStatus {
    private Integer statusId;
    @JsonProperty("id")
    private String devId;
    @JsonProperty("upload_time")
    private Date uploadTime;
    @JsonProperty("level")
    private Double devLevel;
    @JsonProperty("battery")
    private Integer devBattery;
    @JsonProperty("temperature")
    private Double devTemperature;
    @JsonProperty("humidity")
    private Double devHumidity;
}
