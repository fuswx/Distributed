package com.fuswx.distributed.Bean;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Date;

@Data
@AllArgsConstructor
public class Device {
    private String Id;
    private Date addTime;
}
