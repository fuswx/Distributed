package com.fuswx.distributed.Bean;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DevStatusAndId {
    private DevStatus devStatus;
    private Integer devStatusId;
}
