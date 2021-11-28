package com.fuswx.distributed.Service;

import com.fuswx.distributed.Bean.User;

public interface IUserService {

    User findUserByUP(String userName,String password);
}
