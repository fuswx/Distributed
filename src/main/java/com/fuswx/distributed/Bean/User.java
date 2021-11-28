package com.fuswx.distributed.Bean;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("user")
public class User {

    private String userName;
    private String password;
    private String name;
    private Integer age;
    private String sex;
    private String qqNum;
    private String email;
    private String address;

}
