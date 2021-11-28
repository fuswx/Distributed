package com.fuswx.distributed.Mapper;

import com.fuswx.distributed.Bean.User;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

public interface UserMapper {

    @Select("select * from users where username=#{username} and password=#{password}")
    User findUserByUP(@Param("username") String userName,@Param("password") String password);
}
