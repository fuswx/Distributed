package com.fuswx.distributed;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;

class DistributedApplicationTests {

    @Test
    void contextLoads() {
        Date date=new Date();
        System.out.println(date);
        System.out.println(date.getTime());
        Long now=date.getTime()-24*60*60*1000;
        System.out.println(now);
        SimpleDateFormat simpleDateFormat=new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        String date1=simpleDateFormat.format(now);
        System.out.println(date1);
    }

}
