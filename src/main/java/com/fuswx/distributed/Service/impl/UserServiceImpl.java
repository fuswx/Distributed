package com.fuswx.distributed.Service.impl;

import com.fuswx.distributed.Bean.User;
import com.fuswx.distributed.Mapper.UserMapper;
import com.fuswx.distributed.Service.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@Service
public class UserServiceImpl implements IUserService {

    @Autowired
    private UserMapper userMapper;

    @Override
    public User findUserByUP(String userName,String password) {
        return userMapper.findUserByUP(userName,password);
    }
}
